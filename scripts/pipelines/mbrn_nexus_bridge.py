"""
================================================================================
MBRN Nexus Bridge — Scout-to-Factory Autonomous Closure Loop
================================================================================
System:       mbrn_nexus_bridge
Version:      1.0.0
Owner Domain: meta_generator
State:        experimental
Depends On:   mbrn_horizon_scout, autonomous_dev_agent, split_brain_sandbox

The NEXUS closes the loop:

  ┌─────────────────────────────────────────────────────────────────────────┐
  │                     MBRN AUTONOMOUS FACTORY                             │
  │                                                                         │
  │  [Horizon Scout]──────► scout_alphas.json (ROI > 90)                   │
  │        │                         │                                      │
  │        │                  [Nexus Bridge]                                │
  │        │                         │                                      │
  │        │         ┌───────────────┼───────────────────┐                 │
  │        │         │               │                   │                  │
  │        │    README fetch    AutoDevAgent         Sandbox               │
  │        │    (GitHub API)    (deepseek-coder-v2)  (mbrn-sandbox)        │
  │        │         │               │                   │                  │
  │        │         └───────────────┼───────────────────┘                 │
  │        │                         │                                      │
  │        │                 factory_ready/*.py                             │
  │        │                 nexus_notifications.json  ◄── Dashboard reads  │
  │        │                                                                │
  │  [Sleep 15min] ◄────────────────┘                                      │
  └─────────────────────────────────────────────────────────────────────────┘

ROI Threshold:   > 90  (only elite alphas enter the factory)
Alpha Sources:   Both structured discoveries (analysis.score) and
                 raw ROI entries (entry.roi) from scout_alphas.json
Retry Strategy:  AutoDevAgent with max 5 self-heals per alpha
Output:          docs/S3_Data/outputs/factory_ready/<slug>_module.py
Notification:    shared/data/nexus_notifications.json (dashboard feed)
================================================================================
"""

from __future__ import annotations

import json
import logging
import os
import re
import sys
import time
import urllib.request
import urllib.error
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

# ---------------------------------------------------------------------------
# Path bootstrap — ensure project root and pipelines dir on sys.path
# ---------------------------------------------------------------------------
_PROJECT_ROOT = Path(__file__).resolve().parents[2]
_PIPELINES_DIR = Path(__file__).resolve().parent

if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))
if str(_PIPELINES_DIR) not in sys.path:
    sys.path.insert(0, str(_PIPELINES_DIR))

from autonomous_dev_agent import AutoDevAgent, AgentResult

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [NEXUS] %(levelname)s - %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S"
)
log = logging.getLogger("mbrn_nexus_bridge")

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
ROI_THRESHOLD = 80.0          # Only alphas above this enter the factory
ROI_THRESHOLD_OVERRIDE: Optional[float] = None
MAX_AGENT_RETRIES = 5         # Self-heal retries per alpha
GITHUB_README_TIMEOUT = 20    # seconds
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

ALPHAS_PATH        = _PROJECT_ROOT / "shared" / "data" / "scout_alphas.json"
FACTORY_OUTPUT_DIR = _PROJECT_ROOT / "docs" / "S3_Data" / "outputs" / "factory_ready"
NOTIFICATIONS_PATH = _PROJECT_ROOT / "shared" / "data" / "nexus_notifications.json"
FACTORY_CONTROL_PATH = _PROJECT_ROOT / "shared" / "data" / "mbrn_factory_control.json"

# Kill-switch file — create STOP_NEXUS in pipelines/ to halt the bridge loop
KILL_SWITCH = _PIPELINES_DIR / "STOP_NEXUS"


def _clamp_roi_threshold(value: Any, default: float = ROI_THRESHOLD) -> float:
    try:
        parsed = float(value)
    except (TypeError, ValueError):
        return default
    return max(0.0, min(100.0, parsed))


def load_factory_control() -> Dict[str, Any]:
    """Read factory control state with safe defaults for Nexus."""
    default = {
        "scout_status": "running",
        "nexus_status": "running",
        "nexus_roi_threshold": ROI_THRESHOLD,
        "ouroboros_target_file": None,
        "prime_directive": "Maximize factory output and clear backlog.",
    }
    try:
        if not FACTORY_CONTROL_PATH.exists():
            return default
        with open(FACTORY_CONTROL_PATH, "r", encoding="utf-8") as f:
            control = json.load(f)
        if not isinstance(control, dict):
            return default
        merged = dict(default)
        merged.update(control)
        if merged.get("nexus_status") not in {"running", "paused"}:
            merged["nexus_status"] = "running"
        if merged.get("scout_status") not in {"running", "paused"}:
            merged["scout_status"] = "running"
        merged["nexus_roi_threshold"] = _clamp_roi_threshold(merged.get("nexus_roi_threshold"))
        return merged
    except Exception as exc:
        log.warning(f"Factory control unavailable; using defaults: {exc}")
        return default


# ---------------------------------------------------------------------------
# Data Structures
# ---------------------------------------------------------------------------

@dataclass
class AlphaCandidate:
    """A Scout alpha that qualifies for the factory (ROI > threshold)."""
    alpha_id: str
    repo_name: str          # e.g. "huxiaoman7/skills-eval"
    repo_url: str
    roi_score: float
    description: str
    category: str           # automation | integration | autonomy
    rationale: str
    processed: bool = False


@dataclass
class FactoryResult:
    """The output of a successful Nexus factory run for one alpha."""
    alpha_id: str
    repo_name: str
    roi_score: float
    module_name: str
    output_path: str
    stdout_preview: str
    total_agent_attempts: int
    manufactured_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    success: bool = True


# ---------------------------------------------------------------------------
# Alpha Loading — handles BOTH scout_alphas.json formats
# ---------------------------------------------------------------------------

def _load_alphas_json() -> Dict[str, Any]:
    if not ALPHAS_PATH.exists():
        log.error(f"scout_alphas.json not found at {ALPHAS_PATH}")
        return {}
    try:
        with open(ALPHAS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        log.error(f"Failed to parse scout_alphas.json: {e}")
        return {}


def _save_alphas_json(data: Dict[str, Any]) -> None:
    """Atomic-safe write — write to .tmp then rename."""
    tmp = ALPHAS_PATH.with_suffix(".tmp")
    try:
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        tmp.replace(ALPHAS_PATH)
    except Exception as e:
        log.error(f"Failed to save scout_alphas.json: {e}")


def scan_pending_alphas() -> List[AlphaCandidate]:
    """
    Scan scout_alphas.json for all unprocessed entries with ROI > threshold.

    Handles two formats found in the file:
    Format A (structured discoveries):
      {"id": "alpha_...", "repo": {"name": "...", "url": "..."}, "analysis": {"score": 92}}
    Format B (raw ROI entries):
      {"repo": "owner/name", "roi": 95.0}
    """
    data = _load_alphas_json()
    if not data:
        return []

    candidates: List[AlphaCandidate] = []
    discoveries = data.get("discoveries", [])

    for entry in discoveries:
        # ── Format B: raw ROI entry ─────────────────────────────────────
        if "roi" in entry and isinstance(entry.get("repo"), str):
            roi = float(entry.get("roi", 0))
            if roi < ROI_THRESHOLD:
                continue
            if entry.get("nexus_processed"):
                continue
            repo_name = entry["repo"]
            candidates.append(AlphaCandidate(
                alpha_id=f"raw_{repo_name.replace('/', '_')}",
                repo_name=repo_name,
                repo_url=f"https://github.com/{repo_name}",
                roi_score=roi,
                description=f"High-ROI Scout discovery (ROI={roi})",
                category="automation",
                rationale=f"Scout raw ROI score: {roi}"
            ))
            continue

        # ── Format A: structured discovery ──────────────────────────────
        alpha_id = entry.get("id", "")
        repo = entry.get("repo", {})
        analysis = entry.get("analysis", {})
        mbrn_enriched = entry.get("mbrn_enriched", {})

        score = float(analysis.get("score", 0))
        if score < ROI_THRESHOLD:
            continue
        if mbrn_enriched.get("nexus_processed"):
            continue

        repo_name = repo.get("name", "")
        if not repo_name:
            continue

        candidates.append(AlphaCandidate(
            alpha_id=alpha_id,
            repo_name=repo_name,
            repo_url=repo.get("url", f"https://github.com/{repo_name}"),
            roi_score=score,
            description=repo.get("description") or "",
            category=analysis.get("category", "automation"),
            rationale=analysis.get("rationale", "")
        ))

    log.info(f"Found {len(candidates)} unprocessed alpha(s) with ROI > {ROI_THRESHOLD}")
    return candidates


def apply_control_to_nexus() -> Dict[str, Any]:
    """Apply live Nexus settings from the factory control panel."""
    global ROI_THRESHOLD
    control = load_factory_control()
    if ROI_THRESHOLD_OVERRIDE is not None:
        ROI_THRESHOLD = _clamp_roi_threshold(ROI_THRESHOLD_OVERRIDE)
    else:
        ROI_THRESHOLD = _clamp_roi_threshold(control.get("nexus_roi_threshold"))
    return control


def mark_alpha_processed(alpha_id: str) -> None:
    """Mark an alpha as processed in scout_alphas.json so it won't re-run."""
    data = _load_alphas_json()
    if not data:
        return

    discoveries = data.get("discoveries", [])
    for entry in discoveries:
        # Format B
        if "roi" in entry and isinstance(entry.get("repo"), str):
            if f"raw_{entry['repo'].replace('/', '_')}" == alpha_id:
                entry["nexus_processed"] = True
                entry["nexus_processed_at"] = datetime.now(timezone.utc).isoformat()
                break
        # Format A
        elif entry.get("id") == alpha_id:
            enriched = entry.setdefault("mbrn_enriched", {})
            enriched["nexus_processed"] = True
            enriched["nexus_processed_at"] = datetime.now(timezone.utc).isoformat()
            break

    _save_alphas_json(data)
    log.info(f"Alpha '{alpha_id}' marked as processed.")


# ---------------------------------------------------------------------------
# README Fetcher — GitHub API with Jina fallback
# ---------------------------------------------------------------------------

def fetch_readme(repo_name: str) -> Optional[str]:
    """
    Fetch README for a GitHub repo.
    Primary:  GitHub API (/repos/{name}/readme, raw Accept header)
    Fallback: Jina reader (r.jina.ai)
    """
    headers = {
        "Accept": "application/vnd.github.v3.raw",
        "User-Agent": "MBRN-Nexus-Bridge/1.0"
    }
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"

    api_url = f"https://api.github.com/repos/{repo_name}/readme"
    try:
        req = urllib.request.Request(api_url, headers=headers, method="GET")
        with urllib.request.urlopen(req, timeout=GITHUB_README_TIMEOUT) as resp:
            content = resp.read().decode("utf-8")
        log.info(f"README fetched via GitHub API: {len(content)} chars")
        return content[:8000]
    except Exception as e:
        log.warning(f"GitHub README API failed for {repo_name}: {e}")

    # Jina fallback
    jina_url = f"https://r.jina.ai/https://github.com/{repo_name}"
    try:
        req = urllib.request.Request(
            jina_url,
            headers={"User-Agent": "MBRN-Nexus-Bridge/1.0"},
            method="GET"
        )
        with urllib.request.urlopen(req, timeout=GITHUB_README_TIMEOUT) as resp:
            content = resp.read().decode("utf-8")
        log.info(f"README fetched via Jina fallback: {len(content)} chars")
        return content[:8000]
    except Exception as e:
        log.warning(f"Jina fallback also failed for {repo_name}: {e}")
        return None


# ---------------------------------------------------------------------------
# Goal Builder — translate alpha metadata into a concrete agent goal
# ---------------------------------------------------------------------------

_SLUG_RE = re.compile(r"[^A-Za-z0-9_]+")

def _make_slug(repo_name: str) -> str:
    """Turn 'owner/repo-name' into 'owner_repo_name'."""
    return _SLUG_RE.sub("_", repo_name).strip("_")[:60]


def build_factory_goal(alpha: AlphaCandidate, readme: Optional[str]) -> str:
    """
    Construct a concrete, standalone-Python goal string for the AutoDevAgent.

    The goal asks the agent to distill the CORE autonomous logic from the
    Scout's find into a self-contained, runnable MBRN module.
    """
    readme_excerpt = ""
    if readme:
        # Keep first 1500 chars — enough context without hitting token limits
        readme_excerpt = f"\n\nREADME EXCERPT (first 1500 chars):\n{readme[:1500]}"

    memory_context = ""
    try:
        from mbrn_factory_memory import retrieve_similar_code
        query = f"{alpha.category} {alpha.repo_name} {alpha.description} {alpha.rationale}"
        similar_snippets = retrieve_similar_code(query, top_k=1)
        if similar_snippets:
            memory_context = "\n\nMBRN FACTORY MEMORY (Similar past solutions):\n"
            for snip in similar_snippets:
                memory_context += f"--- {snip['name']} ---\n{snip['code'][:800]}...\n\n"
    except ImportError:
        pass
    except Exception as e:
        log.warning(f"Factory Memory unavailable: {e}")

    goal = f"""Write a standalone Python module that implements the CORE autonomous logic
extracted from the following GitHub repository discovery.

REPOSITORY: {alpha.repo_name}
URL: {alpha.repo_url}
DESCRIPTION: {alpha.description}
SCOUT CATEGORY: {alpha.category}
SCOUT RATIONALE: {alpha.rationale}
{readme_excerpt}{memory_context}

YOUR TASK:
1. Identify the most valuable, reusable autonomous function or algorithm in this repository.
2. Implement it as a clean, standalone Python script using ONLY Python stdlib.
3. The script must:
   - Define at least one callable function with a clear docstring.
   - Execute a self-test at module level (print results to stdout).
   - As the very last statement, print exactly: print("MODULE_READY: {_make_slug(alpha.repo_name)}")
   - The MODULE_READY line MUST be inside a print() call — bare labels are not valid Python
4. Focus on the CORE LOGIC — not setup, config, or external API calls.
5. Make it MBRN-ready: minimal dependencies, runs in a CPU-only Docker container.
6. If MBRN FACTORY MEMORY is provided above, use it as inspiration for coding style and patterns.

SANDBOX CONSTRAINTS (HARD RULES — violations will cause test failure):
- NO git, curl, wget, pip, or any shell commands (subprocess is FORBIDDEN)
- NO network access — the sandbox has --network none
- NO file system writes — use only in-memory data structures
- NO external packages — ONLY Python stdlib (os, json, re, math, collections, etc.)
- The self-test data must be HARDCODED — do not read from files or network
- If the algorithm normally requires fetching data (e.g. git clone), implement
  the PROCESSING logic only, with hardcoded sample data as the test input.

The output will be validated by running it in an isolated CPU-only Docker container.
"""
    return goal


# ---------------------------------------------------------------------------
# Factory Output Writer
# ---------------------------------------------------------------------------

def save_factory_module(alpha: AlphaCandidate, code: str, result: AgentResult) -> Path:
    """
    Write the validated module to docs/S3_Data/outputs/factory_ready/.
    Returns the path to the written file.
    """
    FACTORY_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    slug = _make_slug(alpha.repo_name)
    ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    filename = f"{ts}_{slug}_module.py"
    output_path = FACTORY_OUTPUT_DIR / filename

    header = f'''"""
================================================================================
MBRN Factory-Ready Module
================================================================================
Source Alpha    : {alpha.repo_name}
Alpha ID        : {alpha.alpha_id}
ROI Score       : {alpha.roi_score}
Manufactured At : {datetime.now(timezone.utc).isoformat()}
Agent Attempts  : {result.total_attempts}
================================================================================
"""

'''
    output_path.write_text(header + code, encoding="utf-8")
    log.info(f"Factory module saved: {output_path}")
    return output_path


# ---------------------------------------------------------------------------
# Dashboard Notification Writer
# ---------------------------------------------------------------------------

def push_dashboard_notification(alpha: AlphaCandidate, output_path: Path, result: AgentResult) -> None:
    """
    Append a notification to shared/data/nexus_notifications.json.
    The dashboard (render_dashboard.js) can poll this file to show the Mission
    Control feed without any backend changes.
    """
    NOTIFICATIONS_PATH.parent.mkdir(parents=True, exist_ok=True)

    # Load existing notifications
    notifications: List[Dict[str, Any]] = []
    if NOTIFICATIONS_PATH.exists():
        try:
            with open(NOTIFICATIONS_PATH, "r", encoding="utf-8") as f:
                notifications = json.load(f)
        except Exception:
            notifications = []

    # Build new notification
    module_name = output_path.name
    notification = {
        "id": f"nexus_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}",
        "type": "factory_module_ready",
        "title": f"Neues Modul autonom gefertigt: {module_name}",
        "message": (
            f"Scout-Alpha '{alpha.repo_name}' (ROI {alpha.roi_score}) wurde durch den "
            f"AutoDevAgent in {result.total_attempts} Versuch(en) in ein MBRN-Modul "
            f"transformiert und sandbox-validiert."
        ),
        "alpha_id": alpha.alpha_id,
        "repo_name": alpha.repo_name,
        "roi_score": alpha.roi_score,
        "module_file": module_name,
        "output_path": str(output_path),
        "agent_attempts": result.total_attempts,
        "self_heals": max(0, result.total_attempts - 1),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "read": False
    }

    notifications.insert(0, notification)  # newest first

    # Atomic write
    tmp = NOTIFICATIONS_PATH.with_suffix(".tmp")
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(notifications, f, indent=2, ensure_ascii=False)
    tmp.replace(NOTIFICATIONS_PATH)

    log.info(f"Dashboard notification pushed: {notification['title']}")


# ---------------------------------------------------------------------------
# Core Factory Run — process ONE alpha through the full pipeline
# ---------------------------------------------------------------------------

def run_factory_for_alpha(alpha: AlphaCandidate) -> Optional[FactoryResult]:
    """
    Execute the complete Scout-to-Factory pipeline for a single alpha:
      1. Fetch README from GitHub
      2. Build a concrete AutoDevAgent goal
      3. Agent generates + self-heals code in sandbox
      4. Save factory-ready module
      5. Push dashboard notification
      6. Mark alpha as processed

    Returns FactoryResult on success, None on failure.
    """
    log.info("━" * 70)
    log.info(f"  FACTORY RUN: {alpha.repo_name}")
    log.info(f"  ROI Score  : {alpha.roi_score}")
    log.info(f"  Alpha ID   : {alpha.alpha_id}")
    log.info("━" * 70)

    # Step 1: Fetch README
    log.info("  [1/5] Fetching README from GitHub...")
    readme = fetch_readme(alpha.repo_name)
    if readme:
        log.info(f"  README: {len(readme)} chars available")
    else:
        log.warning("  README not available — proceeding with description only")

    # Step 2: Build goal
    log.info("  [2/5] Building factory goal for AutoDevAgent...")
    goal = build_factory_goal(alpha, readme)
    log.info(f"  Goal length: {len(goal)} chars")

    # Step 3: Agent generates and self-heals
    log.info("  [3/5] Handing goal to AutoDevAgent (deepseek-coder-v2 + sandbox)...")
    agent = AutoDevAgent(max_retries=MAX_AGENT_RETRIES)
    result = agent.run(goal)

    if not result.success:
        log.error(f"  AutoDevAgent failed after {result.total_attempts} attempts.")
        log.error(f"  Failure reason: {result.failure_reason}")
        # Still mark processed to avoid infinite retry loops
        mark_alpha_processed(alpha.alpha_id)
        return None

    log.info(f"  Agent SUCCESS: {result.total_attempts} attempt(s), "
             f"{result.total_attempts - 1} self-heal(s)")
    log.info(f"  Output preview: {result.final_output.strip()[:200]!r}")

    # Step 4: Save module
    log.info("  [4/5] Saving factory-ready module...")
    output_path = save_factory_module(alpha, result.final_code, result)

    # Step 5: Dashboard notification
    log.info("  [5/5] Pushing dashboard notification...")
    push_dashboard_notification(alpha, output_path, result)

    # Mark processed
    mark_alpha_processed(alpha.alpha_id)

    factory_result = FactoryResult(
        alpha_id=alpha.alpha_id,
        repo_name=alpha.repo_name,
        roi_score=alpha.roi_score,
        module_name=output_path.name,
        output_path=str(output_path),
        stdout_preview=result.final_output.strip()[:500],
        total_agent_attempts=result.total_attempts,
    )

    log.info("")
    log.info("  ╔══════════════════════════════════════════════════════════╗")
    log.info(f"  ║  ✅ MODULE MANUFACTURED: {output_path.name:<33}║")
    log.info(f"  ║  Attempts: {result.total_attempts} | Heals: {result.total_attempts - 1:<43}║")
    log.info("  ╚══════════════════════════════════════════════════════════╝")

    return factory_result


# ---------------------------------------------------------------------------
# Single-Pass Nexus Sweep
# ---------------------------------------------------------------------------

def run_nexus_sweep() -> List[FactoryResult]:
    """
    Scan all pending high-ROI alphas and run the factory for each.
    Returns a list of FactoryResult for successfully manufactured modules.
    """
    control = apply_control_to_nexus()
    if control.get("nexus_status") == "paused":
        log.info("Factory control paused Nexus. Sweep skipped.")
        return []

    log.info("")
    log.info("╔══════════════════════════════════════════════════════════════════╗")
    log.info("║           MBRN NEXUS BRIDGE — SCOUT-TO-FACTORY SWEEP            ║")
    log.info("╠══════════════════════════════════════════════════════════════════╣")
    log.info(f"║  ROI Threshold : > {ROI_THRESHOLD:<47.0f}║")
    log.info(f"║  Output Dir    : docs/S3_Data/outputs/factory_ready/           ║")
    log.info(f"║  Agent Retries : {MAX_AGENT_RETRIES:<48}║")
    log.info("╚══════════════════════════════════════════════════════════════════╝")

    candidates = scan_pending_alphas()
    if not candidates:
        log.info("No pending alphas above ROI threshold. Nexus is idle.")
        return []

    results: List[FactoryResult] = []
    for i, alpha in enumerate(candidates, 1):
        if KILL_SWITCH.exists():
            log.info("Kill-switch detected (STOP_NEXUS). Halting sweep.")
            break

        log.info(f"\n[{i}/{len(candidates)}] Processing alpha: {alpha.repo_name}")
        factory_result = run_factory_for_alpha(alpha)
        if factory_result:
            results.append(factory_result)

    log.info("")
    log.info(f"Nexus sweep complete: {len(results)}/{len(candidates)} modules manufactured.")
    return results


# ---------------------------------------------------------------------------
# Infinite Nexus Loop (for overnight operation)
# ---------------------------------------------------------------------------

NEXUS_COOLDOWN_MINUTES = 5


def run_infinite_nexus_loop():
    while True:
        try:
            control = apply_control_to_nexus()
            if control.get("nexus_status") == "paused":
                log.info("Factory control paused Nexus. Sweep skipped.")
            else:
                run_nexus_sweep()
        except Exception as exc:
            log.error(f"Nexus loop iteration failed: {exc}")
        log.info(f"Cooldown: {NEXUS_COOLDOWN_MINUTES} minutes...")
        time.sleep(NEXUS_COOLDOWN_MINUTES * 60)


# ---------------------------------------------------------------------------
# Main Entry Point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="MBRN Nexus Bridge — Scout-to-Factory autonomous closure loop"
    )
    parser.add_argument(
        "--once",
        action="store_true",
        help="Run a single sweep and exit (default: infinite loop)"
    )
    parser.add_argument(
        "--roi-threshold",
        type=float,
        default=ROI_THRESHOLD,
        help=f"Minimum ROI score for factory processing (default: {ROI_THRESHOLD})"
    )
    args = parser.parse_args()

    # Apply CLI overrides
    if args.roi_threshold != ROI_THRESHOLD:
        ROI_THRESHOLD_OVERRIDE = args.roi_threshold
        ROI_THRESHOLD = args.roi_threshold
        log.info(f"ROI threshold override: {ROI_THRESHOLD}")

    log.info("MBRN Nexus Bridge v1.0.0 — STARTING")
    log.info(f"Mode           : {'Single sweep' if args.once else 'Infinite loop'}")
    log.info(f"ROI threshold  : > {ROI_THRESHOLD}")
    log.info(f"Alphas source  : {ALPHAS_PATH}")
    log.info(f"Output dir     : {FACTORY_OUTPUT_DIR}")
    log.info(f"Notifications  : {NOTIFICATIONS_PATH}")

    if args.once:
        results = run_nexus_sweep()
        sys.exit(0 if results is not None else 1)
    else:
        run_infinite_nexus_loop()
