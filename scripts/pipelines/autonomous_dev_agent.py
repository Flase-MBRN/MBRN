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
  │  │  Ollama / qwen2.5-coder:14b │ ← GPU-accelerated (RX 7700 XT)│
  │  │  Code Generator + Healer    │                                │
  │  └──────────────┬──────────────┘                                │
  │                 │  generate / heal                               │
  │  ┌──────────────▼──────────────┐                                │
  │  │  sandbox_controller         │                                │
  │  │  execute_in_sandbox()       │                                │
  │  └──────────────┬──────────────┘                                │
  │                 │  docker run --rm --network bridge              │
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
import ast
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
OLLAMA_MODEL    = "qwen2.5-coder:14b"
OLLAMA_TIMEOUT  = 180 # seconds per LLM call (Strict: fail fast, next alpha)
MAX_PROMPT_CHARS = 6000  # CRITICAL: Protect Ollama VRAM from context overflow

# Agent configuration
MAX_RETRIES = 5
FORBIDDEN_IMPORT_ERROR = "ImportGuardError"
EXPLICITLY_BLOCKED_IMPORTS = {
    "bs4",
    "chromadb",
    "crewai",
    "dotenv",
    "fastapi",
    "langchain",
    "langgraph",
    "langgraph_forge",
    "numpy",
    "pandas",
    "pydantic",
    "requests",
    "selvedge",
    "smolagents",
    "tavily",
    "yfinance",
    "subprocess",
    "socket",
    "requests",
    "http.client",
    "ftplib",
    "smtplib",
}

FORBIDDEN_PATTERNS = [
    "subprocess",
    "os.system",
    "eval(",
    "exec(",
    "socket",
    "urllib.request.urlopen",
    "requests",
    "http.client",
    "ftplib",
    "smtplib",
    "git ",
    "curl ",
    "npm ",
    "pip ",
    "input(",
]
COMMON_STDLIB_MODULES = {
    "__future__",
    "argparse",
    "ast",
    "base64",
    "collections",
    "csv",
    "dataclasses",
    "datetime",
    "decimal",
    "enum",
    "functools",
    "hashlib",
    "heapq",
    "html",
    "itertools",
    "json",
    "math",
    "os",
    "pathlib",
    "random",
    "re",
    "statistics",
    "string",
    "textwrap",
    "time",
    "typing",
    "urllib",
    "uuid",
    "xml",
}
STDLIB_MODULES = set(getattr(sys, "stdlib_module_names", set())) | COMMON_STDLIB_MODULES

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
        "keep_alive": 0,  # CRITICAL: Release VRAM immediately
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


def _import_roots(code: str) -> Optional[list[str]]:
    """
    Return imported top-level module names, or None if the code has syntax
    errors that should be handled by the normal sandbox/self-heal path.
    """
    try:
        tree = ast.parse(code)
    except SyntaxError:
        return None

    roots: list[str] = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            roots.extend(alias.name.split(".", 1)[0] for alias in node.names)
        elif isinstance(node, ast.ImportFrom):
            if node.level == 0 and node.module:
                roots.append(node.module.split(".", 1)[0])
    return roots


def find_forbidden_imports(code: str) -> list[str]:
    """Find imports that violate the standalone stdlib-only sandbox contract."""
    roots = _import_roots(code)
    if roots is None:
        return []

    forbidden: list[str] = []
    for root in sorted(set(roots)):
        if root in EXPLICITLY_BLOCKED_IMPORTS or root not in STDLIB_MODULES:
            forbidden.append(root)
    return forbidden


def _make_sandbox_safety_failure(code: str, reason: str) -> SandboxResult:
    """Create a synthetic sandbox failure for safety violations."""
    stderr = (
        f"SandboxSafetyError: {reason}. "
        "The MBRN sandbox contract requires pure offline Python using stdlib only. "
        "Do NOT use subprocess, external networking, or forbidden system calls. "
        "Rewrite the script to be completely standalone and deterministic."
    )
    return SandboxResult(
        success=False,
        stdout="",
        stderr=stderr,
        exit_code=-3,
        execution_time_ms=0,
        code_snippet=code,
        error_message=stderr,
    )


def _make_value_gate_failure(code: str, reason: str) -> SandboxResult:
    """Create a synthetic sandbox failure for value gate violations."""
    stderr = (
        f"ValueGateError: {reason}. "
        "The MBRN factory requires HIGH-UTILITY ENGINES (v1.10.8). "
        "GLOBAL SCAN: Forbidden terms are banned in code, comments, and strings. "
        "Certain low-utility vocabulary is globally banned by the validator. "
        "Do not use synthetic labels, low-effort labels, filler labels, or canned greetings in code, comments, or strings. "
        "REBUILD the module: logic must be deep, deterministic, and return computed results. "
        "OUTPUT CONTRACT: Exactly use 'score', 'severity', 'findings', 'recommendations'. "
        "Apply SYNTHETIC REALITY: Realistic input must be declared in main() AND used by the engine."
    )
    return SandboxResult(
        success=False,
        stdout="",
        stderr=stderr,
        exit_code=-4,
        execution_time_ms=0,
        code_snippet=code,
        error_message=stderr,
    )


def validate_high_utility_code(code: str) -> Tuple[bool, str]:
    """
    MBRN Value Gate v2: Reject low-utility code.
    Returns (success, reason).
    """
    # 1. Global Pattern Check (v1.10.0) - Scan code, comments, and strings
    bad_terms = [
        "sample", "sampleproject", "demo", "mock", "dummy", "placeholder",
        "example", "simulate", "toy", "hello, world", "simple_function",
        "foo", "bar", "baz", "severity_score", "health_score", "risk_score"
    ]
    code_lower = code.lower()
    found_bad = [term for term in bad_terms if term in code_lower]
    if found_bad:
        return False, f"Forbidden trivial/synthetic term(s) detected: {', '.join(found_bad)}"

    # 2. Structural check using AST
    try:
        tree = ast.parse(code)
    except Exception as e:
        return False, f"Syntax error in generated code: {e}"

    functions = [n for n in ast.walk(tree) if isinstance(n, ast.FunctionDef)]
    classes = [n for n in ast.walk(tree) if isinstance(n, ast.ClassDef)]
    
    # Meaningful functions (not main, not just printing)
    meaningful_functions = []
    for f in functions:
        if f.name == "main": continue
        if len(f.body) == 1 and isinstance(f.body[0], ast.Pass): continue
        # Check if it only contains print calls
        is_only_print = True
        for stmt in f.body:
            if isinstance(stmt, ast.Expr) and isinstance(stmt.value, ast.Call):
                func_name = ""
                if isinstance(stmt.value.func, ast.Name): func_name = stmt.value.func.id
                if func_name == "print": continue
            is_only_print = False
            break
        if not is_only_print: meaningful_functions.append(f)

    if not classes and len(meaningful_functions) < 5:
        return False, f"Only {len(meaningful_functions)} meaningful functions found and no Class (minimum 5 standalone functions OR a Class required for v1.10.8)"

    # 3. Output Structure check
    required_keys = ["score", "severity", "findings", "recommendations"]
    missing_keys = [k for k in required_keys if k not in code_lower]
    if missing_keys:
        return False, f"Missing required v1.10.8 output keys: {', '.join(missing_keys)}"

    # 3.1 Check for forbidden key variants (v1.9.9)
    forbidden_keys = ["severity_score", "health_score", "risk_score", "confidence_score", "utility_score"]
    for fk in forbidden_keys:
        if fk in code_lower:
            return False, f"Forbidden key variant detected: '{fk}'. Use exactly 'score'."

    # 4. Top-level Execution Check
    for node in tree.body:
        if isinstance(node, ast.Expr) and isinstance(node.value, ast.Call):
            func_name = ""
            if isinstance(node.value.func, ast.Name): func_name = node.value.func.id
            elif isinstance(node.value.func, ast.Attribute) and isinstance(node.value.func.value, ast.Name):
                func_name = f"{node.value.func.value.id}.{node.value.func.attr}"
            if func_name in ["print", "json.dumps", "json.dump", "analyze", "process", "evaluate", "score", "detect"]:
                return False, f"ValueGateError: Top-level execution of {func_name}() detected. A top-level call to ANY function or executable statement is forbidden. Only imports, constants, function/class definitions, and the if-main guard may exist at top level."

    # 5. Semantic Check: Static vs Computed (Heuristic)
    # If a function returns a literal dict/list with hardcoded findings, reject.
    for f in meaningful_functions:
        last_stmt = f.body[-1] if f.body else None
        if isinstance(last_stmt, ast.Return) and isinstance(last_stmt.value, (ast.Dict, ast.List)):
            # If the return value is just a literal with no variables, it's likely a literal-only
            is_literal = True
            for elt in ast.walk(last_stmt.value):
                if isinstance(elt, (ast.Name, ast.Call, ast.BinOp)):
                    is_literal = False
                    break
            if is_literal:
                return False, f"Function {f.name} returns a static literal. Logic must be computed from input."

    # 6. Semantic Check: Input Usage
    main_func = next((f for f in functions if f.name == "main"), None)
    if main_func:
        # Check if main() actually calls the engine
        has_engine_call = False
        engine_names = {f.name for f in meaningful_functions} | {c.name for c in classes}
        for node in ast.walk(main_func):
            if isinstance(node, ast.Call):
                call_name = ""
                if isinstance(node.func, ast.Name): call_name = node.func.id
                if call_name in engine_names:
                    has_engine_call = True
                    break
        if not has_engine_call:
            return False, "main() does not appear to call the reusable engine."

    return True, ""


def check_value_gate(code: str) -> Optional[str]:
    """
    MBRN Value Gate: Reject low-utility code.
    Returns error message if gate fails, None otherwise.
    """
    success, reason = validate_high_utility_code(code)
    return reason if not success else None


def check_sandbox_safety(code: str) -> Optional[str]:
    """
    Check if code contains forbidden patterns or imports.
    Returns error message if unsafe, None otherwise.
    """
    # 1. Check imports
    forbidden_imports = find_forbidden_imports(code)
    if forbidden_imports:
        return f"Forbidden imports detected: {', '.join(forbidden_imports)}"

    # 2. Check forbidden patterns
    for pattern in FORBIDDEN_PATTERNS:
        if pattern in code:
            return f"Forbidden pattern detected: {pattern}"

    return None


# ---------------------------------------------------------------------------
# Prompt Builders
# ---------------------------------------------------------------------------

_SYSTEM_PROMPT = """You are an expert Python developer inside the MBRN autonomous code engine.
Your ONLY job is to produce VALID, COMPLETE, EXECUTABLE Python scripts.

RULES:
- Output ONLY a single Python code block fenced with ```python ... ```
- Do NOT include any explanation, preamble, or commentary outside the code block
- The script must be self-contained and runnable with `python3 script.py`
- Include a `def main():` function and a proper `if __name__ == "__main__":` guard.
- Do NOT use any external libraries; only Python stdlib
- NEVER use input() or any interactive prompts; the environment is non-interactive.
- Replace any interactive logic with hardcoded defaults or a tiny smoke-test input inside main().
"""

def _truncate_for_llm(text: str, max_chars: int = MAX_PROMPT_CHARS) -> str:
    """Truncate text to protect Ollama VRAM from context overflow."""
    if len(text) <= max_chars:
        return text
    truncation_notice = f"\n\n[TRUNCATED: Input exceeded {max_chars} char limit for VRAM protection]"
    return text[:max_chars - len(truncation_notice)] + truncation_notice


def _build_generation_prompt(goal: str) -> list[dict]:
    """Build the initial code generation prompt."""
    safe_goal = _truncate_for_llm(goal, MAX_PROMPT_CHARS)
    return [
        {"role": "system", "content": _SYSTEM_PROMPT},
        {"role": "user",   "content": f"Write a Python script that accomplishes the following goal:\n\n{safe_goal}"}
    ]


def _build_healing_prompt(goal: str, broken_code: str, stderr: str, stdout: str, attempt: int) -> list[dict]:
    """Construct the self-healing prompt for subsequent LLM attempts."""
    safe_broken_code = _truncate_for_llm(broken_code)
    safe_stderr = _truncate_for_llm(stderr)
    safe_stdout = _truncate_for_llm(stdout)

    # Inject specific hints for common environment mismatches
    hints = []
    if "EOFError" in stderr or "EOF when reading a line" in stderr:
        hints.append("The error 'EOF when reading a line' means you used input() in a non-interactive environment. REMOVE all input() calls and replace them with hardcoded defaults.")
    
    if "ModuleNotFoundError" in stderr or FORBIDDEN_IMPORT_ERROR in stderr:
        hints.append("You attempted to import an external library. USE ONLY the Python standard library.")

    if "ValueGateError" in stderr or "Forbidden" in stderr:
        hints.append(
            "CRITICAL: Build a HIGH-UTILITY ENGINE (v1.10.8). Apply SYNTHETIC REALITY. "
            "GLOBAL SCAN: Avoid all banned synthetic labels in code, comments, and strings. "
            "Certain low-utility vocabulary is globally banned by the validator. "
            "OUTPUT CONTRACT: JSON MUST use exactly these top-level keys: score, severity, findings, recommendations. "
            "Logic must be deep, computed, deterministic, and derived from the built-in scenario."
        )
    
    if "Top-level execution" in stderr:
        hints.append(
            "TOP-LEVEL GUARD: A top-level call to ANY function or executable statement is forbidden. "
            "Wrap ALL smoke-test logic in a main() function and call it ONLY within the if __name__ == '__main__': block. "
            "Only imports, constants, and definitions are allowed at the top level."
        )
    
    import_rewrite_directive = ""
    if "ModuleNotFoundError" in stderr or FORBIDDEN_IMPORT_ERROR in stderr:
        import_rewrite_directive = """
CRITICAL IMPORT REWRITE RULE:
- The failure is caused by a forbidden or missing external package.
- Remove every third-party import completely.
- Do NOT import the missing package again.
- Replace package-specific classes/functions with local stdlib-only data classes, functions, or deterministic local logic.
- The corrected script must be one standalone Python file using only stdlib imports.
"""

    hint_msg = ("\n\nCRITICAL HINTS:\n- " + "\n- ".join(hints)) if hints else ""

    # CRITICAL: Truncate all inputs to protect Ollama VRAM
    safe_goal = _truncate_for_llm(goal, MAX_PROMPT_CHARS // 3)
    safe_broken_code = _truncate_for_llm(broken_code, MAX_PROMPT_CHARS // 3)
    safe_stderr = _truncate_for_llm(stderr.strip() if stderr.strip() else '<no stderr>', MAX_PROMPT_CHARS // 6)
    safe_stdout = _truncate_for_llm(stdout.strip() if stdout.strip() else '<empty>', MAX_PROMPT_CHARS // 6)
    
    user_msg = f"""The following Python script was supposed to accomplish this goal:
{safe_goal}{hint_msg}

But it FAILED during execution. Here is the broken code and the error output.
{import_rewrite_directive}

BROKEN CODE (Attempt #{attempt}):
```python
{safe_broken_code}
```

EXECUTION ERROR (stderr):
```
{safe_stderr}
```

STDOUT (before crash):
```
{safe_stdout}
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
      1. Sends a goal string to Ollama (qwen2.5-coder:14b) → gets Python code
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
                
                # Safe stderr preview access
                stderr_preview = ""
                if last_result and last_result.stderr:
                    stderr_preview = last_result.stderr[:200].strip()
                log.info(f"  stderr preview: {stderr_preview!r}")
                
                t0 = time.monotonic()
                messages = _build_healing_prompt(
                    goal=goal,
                    broken_code=current_code,
                    stderr=last_result.stderr if last_result else "Unknown Error",
                    stdout=last_result.stdout if last_result else "",
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
            safety_error = check_sandbox_safety(current_code)
            if safety_error:
                log.warning(f"  🔒 Sandbox safety guard blocked code: {safety_error}")
                sandbox_result = _make_sandbox_safety_failure(current_code, safety_error)
            else:
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
                # Value Gate check: prevent low-utility/trash code from passing
                value_error = check_value_gate(current_code)
                if value_error:
                    log.warning(f"  ❌ Value gate rejected code: {value_error}")
                    sandbox_result = _make_value_gate_failure(current_code, value_error)
                    # Force update last_result so the next loop has context
                    last_result = sandbox_result
                else:
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
    AutoDevAgent subclass for the self-healing proof.
    Overrides the first LLM call to inject a deterministic syntax error,
    ensuring the healing loop is always triggered — regardless of model quality.
    """

    def run(self, goal: str) -> AgentResult:  # type: ignore[override]
        log.info("")
        log.info("━"*70)
        log.info(f"  AUTONOMOUS DEV LOOP STARTED  [Deterministic Healing Proof]")
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
                
                # Safe stderr preview access
                stderr_preview = ""
                if last_result and last_result.stderr:
                    stderr_preview = last_result.stderr[:300].strip()
                log.info(f"  stderr preview: {stderr_preview!r}")
                
                t0 = time.monotonic()
                messages = _build_healing_prompt(
                    goal=goal,
                    broken_code=current_code,
                    stderr=last_result.stderr if last_result else "Unknown Error",
                    stdout=last_result.stdout if last_result else "",
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
                log.info("  │  SABOTAGE PHASE: Injecting deterministic syntax error")
                log.info("  │  (Triggers real-world broken first draft recovery)")
                log.info("  └─────────────────────────────────────────────────────┘")
                current_code = _inject_syntax_error(current_code)

            log.info(f"  Code ({len(current_code)} chars):")
            log.info("  " + "─"*56)
            for line in current_code.splitlines():
                log.info(f"  │ {line}")
            log.info("  " + "─"*56)

            # ── Execute in Sandbox ────────────────────────────────────────
            safety_error = check_sandbox_safety(current_code)
            if safety_error:
                log.warning(f"  🔒 Sandbox safety guard blocked code: {safety_error}")
                sandbox_result = _make_sandbox_safety_failure(current_code, safety_error)
            else:
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
                # Value Gate check
                value_error = check_value_gate(current_code)
                if value_error:
                    log.warning(f"  ❌ Value gate rejected code: {value_error}")
                    sandbox_result = _make_value_gate_failure(current_code, value_error)
                    last_result = sandbox_result
                else:
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


def run_self_healing_proof() -> bool:
    """
    The canonical MBRN self-healing proof.

    Phase 1 — LLM generates correct code (qwen2.5-coder:14b)
    Phase 2 — We deterministically inject a SyntaxError into that code
    Phase 3 — Sandbox executes, fails, returns stderr
    Phase 4 — LLM receives broken code + error → heals it
    Phase 5 — Sandbox confirms fixed code runs correctly

    This is 100% reproducible, regardless of model compliance with
    'please write broken code' instructions.
    """
    log.info("")
    log.info("╔══════════════════════════════════════════════════════════════════╗")
    log.info("║       MBRN SELF-HEALING AUTO-DEV PROOF — ULTIMATE TEST           ║")
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
        log.error("Proof failed — review logs for root cause.")
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

    log.info("--- Launching Self-Healing Proof ---")
    success = run_self_healing_proof()
    sys.exit(0 if success else 1)
