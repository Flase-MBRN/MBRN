"""
================================================================================
MBRN Autonomous Dev Agent — Self-Healing Auto-Dev-Loop
================================================================================
System:       autonomous_dev_agent
Version:      1.0.0
Owner Domain: meta_generator
State:        experimental

Architecture:
  ┌─────────────────────────────────────────────────────────────────┐
  │                  WINDOWS HOST (AutoDevAgent)                     │
  │                                                                  │
  │  ┌─────────────────────────────┐                                │
  │  │  Ollama / deepseek-coder-v2 │ ← GPU-accelerated (RX 7700 XT)│
  │  │  Code Generator + Healer    │                                │
  │  └──────────────┬──────────────┘                                │
  │                 │  generate / heal                               │
  │  ┌──────────────▼──────────────┐                                │
  │  │  sandbox_controller         │                                │
  │  │  execute_in_sandbox()       │                                │
  │  └──────────────┬──────────────┘                                │
  │                 │  docker run --rm --network none                │
  │  ┌──────────────▼──────────────┐                                │
  │  │  mbrn-sandbox (Linux)       │  ← Code cage                  │
  │  │  CPU-only | isolated        │                                │
  │  └─────────────────────────────┘                                │
  └─────────────────────────────────────────────────────────────────┘

Self-Healing Loop:
  GOAL STRING
    │
    ▼
  [LLM] Generate initial code draft
    │
    ▼
  [SANDBOX] Execute code
    │
    ├─── success=True ──────────────────► DONE ✅
    │
    └─── success=False ─► [LLM] Heal(code + stderr)
                                │
                                ▼
                          [SANDBOX] Re-execute
                                │
                                ├─ success=True ──► DONE ✅
                                │
                                └─ retry (max 5) ──► FAIL ❌

================================================================================
"""

import re
import sys
import logging
import time
import json
from dataclasses import dataclass, field
from typing import Optional
import urllib.request
import urllib.error

# ---------------------------------------------------------------------------
# Local imports — sandbox controller must be on path
# ---------------------------------------------------------------------------
sys.path.insert(0, str(__import__("pathlib").Path(__file__).parent))
from sandbox_controller import execute_in_sandbox, ensure_sandbox_image, SandboxResult

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [AUTO_DEV] %(levelname)s - %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S"
)
log = logging.getLogger("autonomous_dev_agent")

# ---------------------------------------------------------------------------
# Ollama Configuration
# ---------------------------------------------------------------------------
OLLAMA_BASE_URL = "http://localhost:11434"
OLLAMA_MODEL    = "deepseek-coder-v2"
OLLAMA_TIMEOUT  = 120  # seconds per LLM call

# Agent configuration
MAX_RETRIES = 5

# ---------------------------------------------------------------------------
# Data Structures
# ---------------------------------------------------------------------------

@dataclass
class AgentAttempt:
    """Record of a single generation + execution attempt."""
    attempt_number: int
    code: str
    sandbox_result: Optional[SandboxResult]
    was_heal: bool = False
    heal_prompt_excerpt: str = ""


@dataclass
class AgentResult:
    """Final result from an AutoDevAgent run."""
    goal: str
    success: bool
    final_code: str
    final_output: str
    total_attempts: int
    attempts: list = field(default_factory=list)
    failure_reason: Optional[str] = None

    def summary(self) -> str:
        status = "✅ HEALED & OPERATIONAL" if self.success else "❌ EXHAUSTED ALL RETRIES"
        lines = [
            "",
            "╔══════════════════════════════════════════════════════════════════╗",
            f"║  AGENT RUN COMPLETE — {status:<42}║",
            "╠══════════════════════════════════════════════════════════════════╣",
            f"║  Goal         : {self.goal[:50]:<50}║",
            f"║  Total Attempts: {self.total_attempts:<49}║",
            f"║  Heals Applied : {max(0, self.total_attempts - 1):<49}║",
            "╚══════════════════════════════════════════════════════════════════╝",
        ]
        if self.success:
            lines.append(f"\n  FINAL OUTPUT:\n  {'─'*60}")
            for line in self.final_output.strip().splitlines():
                lines.append(f"  {line}")
            lines.append(f"  {'─'*60}")
        else:
            lines.append(f"\n  FAILURE REASON: {self.failure_reason}")
        return "\n".join(lines)


# ---------------------------------------------------------------------------
# Ollama Client (pure stdlib — no requests dependency)
# ---------------------------------------------------------------------------

def _ollama_chat(messages: list[dict], temperature: float = 0.2) -> str:
    """
    Send a chat request to local Ollama and return the assistant response text.
    Uses urllib (stdlib only) — no external dependencies.
    """
    payload = json.dumps({
        "model": OLLAMA_MODEL,
        "messages": messages,
        "stream": False,
        "options": {
            "temperature": temperature,
            "num_predict": 2048,
        }
    }).encode("utf-8")

    req = urllib.request.Request(
        f"{OLLAMA_BASE_URL}/api/chat",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=OLLAMA_TIMEOUT) as resp:
            body = json.loads(resp.read().decode("utf-8"))
            return body["message"]["content"]
    except urllib.error.URLError as e:
        raise RuntimeError(f"Ollama connection failed: {e}") from e


def _extract_code_block(llm_response: str) -> str:
    """
    Extract the first Python code block from an LLM response.
    Falls back to the raw response if no code fence is found.
    Strips markdown fences (```python ... ``` or ``` ... ```).
    """
    # Try ```python ... ``` first
    match = re.search(r"```(?:python)?\s*\n(.*?)```", llm_response, re.DOTALL)
    if match:
        return match.group(1).strip()

    # Try generic ``` block
    match = re.search(r"```(.*?)```", llm_response, re.DOTALL)
    if match:
        return match.group(1).strip()

    # Raw fallback — the model returned code without fences
    return llm_response.strip()


# ---------------------------------------------------------------------------
# Prompt Builders
# ---------------------------------------------------------------------------

_SYSTEM_PROMPT = """You are an expert Python developer inside the MBRN autonomous code engine.
Your ONLY job is to produce VALID, COMPLETE, EXECUTABLE Python scripts.

RULES:
- Output ONLY a single Python code block fenced with ```python ... ```
- Do NOT include any explanation, preamble, or commentary outside the code block
- The script must be self-contained and runnable with `python3 script.py`
- Do NOT include `if __name__ == '__main__':` guards — the entire script runs at module level
- Do NOT use any external libraries; only Python stdlib
"""

def _build_generation_prompt(goal: str) -> list[dict]:
    """Build the initial code generation prompt."""
    return [
        {"role": "system", "content": _SYSTEM_PROMPT},
        {"role": "user",   "content": f"Write a Python script that accomplishes the following goal:\n\n{goal}"}
    ]


def _build_healing_prompt(goal: str, broken_code: str, stderr: str, stdout: str, attempt: int) -> list[dict]:
    """Build the self-healing prompt with full error context."""
    user_msg = f"""The following Python script was supposed to accomplish this goal:
{goal}

But it FAILED during execution. Here is the broken code and the error output.
Fix ALL bugs and return a corrected, fully working script.

BROKEN CODE (Attempt #{attempt}):
```python
{broken_code}
```

EXECUTION ERROR (stderr):
```
{stderr.strip() if stderr.strip() else '<no stderr>'}
```

STDOUT (before crash):
```
{stdout.strip() if stdout.strip() else '<empty>'}
```

Return ONLY the corrected Python code block. No explanations."""

    return [
        {"role": "system", "content": _SYSTEM_PROMPT},
        {"role": "user",   "content": user_msg}
    ]


# ---------------------------------------------------------------------------
# AutoDevAgent
# ---------------------------------------------------------------------------

class AutoDevAgent:
    """
    Autonomous Code Development Agent with Self-Healing Loop.

    Workflow:
      1. Sends a goal string to Ollama (deepseek-coder-v2) → gets Python code
      2. Executes code in the isolated mbrn-sandbox container
      3. On failure: sends broken code + error back to LLM for healing
      4. Repeats until success or max_retries exhausted
    """

    def __init__(self, max_retries: int = MAX_RETRIES, model: str = OLLAMA_MODEL):
        self.max_retries = max_retries
        self.model = model
        log.info(f"AutoDevAgent initialized — model={model} | max_retries={max_retries}")

    def run(self, goal: str) -> AgentResult:
        """
        Execute the self-healing development loop for the given goal.

        Args:
            goal: Natural language description of what the Python script should do.

        Returns:
            AgentResult with final code, output, and full attempt history.
        """
        log.info("")
        log.info("━"*70)
        log.info(f"  AUTONOMOUS DEV LOOP STARTED")
        log.info(f"  Goal: {goal}")
        log.info("━"*70)

        attempts: list[AgentAttempt] = []
        current_code = ""
        last_result: Optional[SandboxResult] = None

        for attempt_num in range(1, self.max_retries + 2):  # +2 = initial + retries
            is_heal = attempt_num > 1

            # ── Step 1: Generate or Heal ──────────────────────────────────
            if not is_heal:
                log.info(f"\n[Attempt {attempt_num}/{self.max_retries + 1}] 🧠 Generating initial code draft...")
                log.info(f"  Querying Ollama/{self.model}...")
                t0 = time.monotonic()
                messages = _build_generation_prompt(goal)
                llm_response = _ollama_chat(messages)
                llm_ms = int((time.monotonic() - t0) * 1000)
                log.info(f"  LLM response received in {llm_ms}ms")
            else:
                log.info(f"\n[Attempt {attempt_num}/{self.max_retries + 1}] 🔧 SELF-HEALING — sending error to LLM...")
                log.info(f"  stderr preview: {last_result.stderr[:200].strip()!r}")
                t0 = time.monotonic()
                messages = _build_healing_prompt(
                    goal=goal,
                    broken_code=current_code,
                    stderr=last_result.stderr,
                    stdout=last_result.stdout,
                    attempt=attempt_num - 1
                )
                llm_response = _ollama_chat(messages)
                llm_ms = int((time.monotonic() - t0) * 1000)
                log.info(f"  LLM healing response received in {llm_ms}ms")

            # ── Step 2: Extract Code ──────────────────────────────────────
            current_code = _extract_code_block(llm_response)
            log.info(f"  Code extracted ({len(current_code)} chars):")
            log.info("  " + "─"*56)
            for line in current_code.splitlines():
                log.info(f"  │ {line}")
            log.info("  " + "─"*56)

            # ── Step 3: Execute in Sandbox ────────────────────────────────
            log.info(f"  🔒 Executing in mbrn-sandbox...")
            sandbox_result = execute_in_sandbox(current_code)

            attempt_record = AgentAttempt(
                attempt_number=attempt_num,
                code=current_code,
                sandbox_result=sandbox_result,
                was_heal=is_heal,
                heal_prompt_excerpt=messages[-1]["content"][:200] if is_heal else ""
            )
            attempts.append(attempt_record)

            # ── Step 4: Evaluate Result ───────────────────────────────────
            if sandbox_result.success:
                log.info(f"  ✅ SUCCESS on attempt {attempt_num}!")
                log.info(f"  stdout: {sandbox_result.stdout.strip()!r}")
                return AgentResult(
                    goal=goal,
                    success=True,
                    final_code=current_code,
                    final_output=sandbox_result.stdout,
                    total_attempts=attempt_num,
                    attempts=attempts
                )
            else:
                log.warning(f"  ❌ FAILED (exit={sandbox_result.exit_code})")
                log.warning(f"  stderr: {sandbox_result.stderr.strip()[:300]!r}")
                last_result = sandbox_result

                if attempt_num > self.max_retries:
                    break  # Max retries exhausted

                log.info(f"  ↩  Triggering self-heal (retry {attempt_num}/{self.max_retries})...")

        # ── All retries exhausted ─────────────────────────────────────────
        log.error(f"\n❌ AGENT EXHAUSTED ALL {self.max_retries} RETRIES — Goal not achieved.")
        return AgentResult(
            goal=goal,
            success=False,
            final_code=current_code,
            final_output=last_result.stdout if last_result else "",
            total_attempts=len(attempts),
            attempts=attempts,
            failure_reason=last_result.stderr if last_result else "Unknown"
        )


# ---------------------------------------------------------------------------
# Deterministic Self-Healing Test
# ---------------------------------------------------------------------------

def _inject_syntax_error(code: str) -> str:
    """
    Deterministically corrupt the first `for` or `if` line by removing its
    trailing colon. This guarantees a real SyntaxError regardless of LLM
    compliance — making the self-healing proof 100% reproducible.
    """
    lines = code.splitlines()
    for i, line in enumerate(lines):
        stripped = line.rstrip()
        if stripped.endswith(":") and any(
            stripped.lstrip().startswith(kw)
            for kw in ("for ", "if ", "while ", "def ", "with ")
        ):
            # Remove the colon → guaranteed SyntaxError
            lines[i] = stripped[:-1]  # drop the trailing ":"
            log.info(f"  💉 Syntax error injected at line {i+1}: {lines[i]!r}")
            return "\n".join(lines)
    # Fallback: append a raw syntax error line
    lines.append("this is not valid python !!!")
    log.info("  💉 Syntax error injected as trailing garbage line")
    return "\n".join(lines)


class DeterministicAutoDevAgent(AutoDevAgent):
    """
    AutoDevAgent subclass for the self-healing proof demo.
    Overrides the first LLM call to inject a deterministic syntax error,
    ensuring the healing loop is always triggered — regardless of model quality.
    """

    def run(self, goal: str) -> AgentResult:  # type: ignore[override]
        log.info("")
        log.info("━"*70)
        log.info(f"  AUTONOMOUS DEV LOOP STARTED  [Deterministic Healing Demo]")
        log.info(f"  Goal: {goal}")
        log.info("━"*70)

        attempts: list[AgentAttempt] = []
        current_code = ""
        last_result: Optional[SandboxResult] = None
        first_attempt = True

        for attempt_num in range(1, self.max_retries + 2):
            is_heal = attempt_num > 1

            # ── Generate or Heal ──────────────────────────────────────────
            if not is_heal:
                log.info(f"\n[Attempt {attempt_num}/{self.max_retries + 1}] 🧠 Generating initial code draft...")
                log.info(f"  Querying Ollama/{self.model}...")
                t0 = time.monotonic()
                messages = _build_generation_prompt(goal)
                llm_response = _ollama_chat(messages)
                llm_ms = int((time.monotonic() - t0) * 1000)
                log.info(f"  LLM response received in {llm_ms}ms")
            else:
                log.info(f"\n[Attempt {attempt_num}/{self.max_retries + 1}] 🔧 SELF-HEALING — sending error context to LLM...")
                log.info(f"  stderr preview: {last_result.stderr[:300].strip()!r}")
                t0 = time.monotonic()
                messages = _build_healing_prompt(
                    goal=goal,
                    broken_code=current_code,
                    stderr=last_result.stderr,
                    stdout=last_result.stdout,
                    attempt=attempt_num - 1
                )
                llm_response = _ollama_chat(messages)
                llm_ms = int((time.monotonic() - t0) * 1000)
                log.info(f"  LLM healing response received in {llm_ms}ms")

            # ── Extract Code ──────────────────────────────────────────────
            current_code = _extract_code_block(llm_response)

            # ── DETERMINISTIC INJECTION on attempt 1 ──────────────────────
            if first_attempt:
                first_attempt = False
                log.info("")
                log.info("  ┌─────────────────────────────────────────────────────┐")
                log.info("  │  SABOTAGE PHASE: Injecting deterministic syntax error│")
                log.info("  │  (Simulates real-world broken first draft)           │")
                log.info("  └─────────────────────────────────────────────────────┘")
                current_code = _inject_syntax_error(current_code)

            log.info(f"  Code ({len(current_code)} chars):")
            log.info("  " + "─"*56)
            for line in current_code.splitlines():
                log.info(f"  │ {line}")
            log.info("  " + "─"*56)

            # ── Execute in Sandbox ────────────────────────────────────────
            log.info(f"  🔒 Executing in mbrn-sandbox...")
            sandbox_result = execute_in_sandbox(current_code)

            attempt_record = AgentAttempt(
                attempt_number=attempt_num,
                code=current_code,
                sandbox_result=sandbox_result,
                was_heal=is_heal
            )
            attempts.append(attempt_record)

            # ── Evaluate ──────────────────────────────────────────────────
            if sandbox_result.success:
                log.info(f"  ✅ SUCCESS on attempt {attempt_num}!")
                log.info(f"  stdout: {sandbox_result.stdout.strip()!r}")
                return AgentResult(
                    goal=goal,
                    success=True,
                    final_code=current_code,
                    final_output=sandbox_result.stdout,
                    total_attempts=attempt_num,
                    attempts=attempts
                )
            else:
                log.warning(f"  ❌ FAILED (exit={sandbox_result.exit_code})")
                log.warning(f"  stderr: {sandbox_result.stderr.strip()[:400]!r}")
                last_result = sandbox_result
                if attempt_num > self.max_retries:
                    break
                log.info(f"  ↩  Triggering self-heal (retry {attempt_num}/{self.max_retries})...")

        log.error(f"\n❌ AGENT EXHAUSTED ALL {self.max_retries} RETRIES.")
        return AgentResult(
            goal=goal,
            success=False,
            final_code=current_code,
            final_output=last_result.stdout if last_result else "",
            total_attempts=len(attempts),
            attempts=attempts,
            failure_reason=last_result.stderr if last_result else "Unknown"
        )


def run_self_healing_demo() -> bool:
    """
    The canonical MBRN self-healing proof.

    Phase 1 — LLM generates correct code (deepseek-coder-v2)
    Phase 2 — We deterministically inject a SyntaxError into that code
    Phase 3 — Sandbox executes, fails, returns stderr
    Phase 4 — LLM receives broken code + error → heals it
    Phase 5 — Sandbox confirms fixed code runs correctly

    This is 100% reproducible, regardless of model compliance with
    'please write broken code' instructions.
    """
    log.info("")
    log.info("╔══════════════════════════════════════════════════════════════════╗")
    log.info("║       MBRN SELF-HEALING AUTO-DEV DEMO — ULTIMATE TEST           ║")
    log.info("╠══════════════════════════════════════════════════════════════════╣")
    log.info("║  Goal    : Sort a list of numbers with ranked output             ║")
    log.info("║  Method  : Deterministic error injection → LLM heal              ║")
    log.info("║  Proof   : Agent fixes code it has never seen before             ║")
    log.info("╚══════════════════════════════════════════════════════════════════╝")

    goal = (
        "Write a Python script that sorts the list [42, 7, 19, 3, 88, 1, 56] "
        "and prints each number on its own line with its rank (e.g., '#1: 1')."
    )

    agent = DeterministicAutoDevAgent(max_retries=5)
    result = agent.run(goal)
    log.info(result.summary())

    if result.success:
        heals = result.total_attempts - 1
        log.info("")
        log.info("🏆 HISTORY MADE: First autonomously self-healed code block in MBRN.")
        log.info(f"   Attempts: {result.total_attempts} | Self-heals applied: {heals}")
        log.info("")
        log.info("FINAL WORKING CODE:")
        log.info("─" * 60)
        for line in result.final_code.splitlines():
            log.info(f"  {line}")
        log.info("─" * 60)
        return True
    else:
        log.error("Demo failed — review logs for root cause.")
        return False


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    log.info("MBRN Autonomous Dev Agent v1.0.0 — STARTING")
    log.info(f"Ollama model    : {OLLAMA_MODEL}")
    log.info(f"Max retries     : {MAX_RETRIES}")
    log.info(f"Sandbox image   : mbrn-sandbox")

    # Verify sandbox image is ready before starting
    log.info("")
    log.info("--- Pre-flight: Sandbox Image Check ---")
    if not ensure_sandbox_image():
        log.error("ABORT: Sandbox image unavailable.")
        sys.exit(1)

    log.info("--- Launching Self-Healing Demo ---")
    success = run_self_healing_demo()
    sys.exit(0 if success else 1)
