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
  │        │    (GitHub API)    (qwen2.5-coder:14b)  (mbrn-sandbox)        │
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
from datetime import datetime, timezone, timedelta
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
from shared.core.db import (
    CANONICAL_DIMENSIONS,
    export_factory_feed_snapshot,
    init_db,
    insert_notification,
    list_scout_alphas,
    load_factory_control as load_db_factory_control,
    mark_scout_alpha_status,
    save_factory_control,
    upsert_factory_module,
    atomic_write,
)

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
MAX_NEXUS_FAILURES = 3
NEXUS_FAILURE_RETRY_HOURS = 24
GITHUB_README_TIMEOUT = 20    # seconds
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

ALPHAS_PATH        = _PROJECT_ROOT / "shared" / "data" / "scout_alphas.json"
FACTORY_OUTPUT_DIR = _PROJECT_ROOT / "docs" / "S3_Data" / "outputs" / "factory_ready"
NOTIFICATIONS_PATH = _PROJECT_ROOT / "shared" / "data" / "nexus_notifications.json"
FACTORY_CONTROL_PATH = _PROJECT_ROOT / "shared" / "data" / "mbrn_factory_control.json"
TOOL_REQUESTS_PATH = _PROJECT_ROOT / "shared" / "data" / "tool_requests.json"

# Kill-switch file — create STOP_NEXUS in pipelines/ to halt the bridge loop
KILL_SWITCH = _PIPELINES_DIR / "STOP_NEXUS"


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _parse_utc_datetime(value: Any) -> Optional[datetime]:
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def _clear_nexus_failure_fields(target: Dict[str, Any]) -> None:
    for key in (
        "nexus_failed",
        "nexus_failed_at",
        "nexus_failure_reason",
        "nexus_retry_after",
        "nexus_quarantined",
    ):
        target.pop(key, None)


def _normalize_repo_name(repo_url):
    # Verify the repo URL using verify_skills
    verification = verify_skills(repo_url, layers=[1])
    if not verification.get('success', False):
        raise ValueError(f'Invalid repository URL: {repo_url}')
    # Extract and normalize the repo name
    parts = repo_url.split('/')[-2:]
    owner, repo = parts[0], parts[1].replace('.git', '')
    return f'{owner}/{repo}'


import re

def _repo_name_for_entry(entry):
    """Extract and normalize repo name from a discovery entry dict."""
    # CRITICAL FIX: Handle dict entries by extracting repo name first
    if isinstance(entry, dict):
        # Try to extract repo name from various formats
        repo = entry.get("repo", {})
        if isinstance(repo, str):
            entry = repo
        elif isinstance(repo, dict):
            entry = repo.get("full_name") or repo.get("name") or ""
        else:
            entry = entry.get("repo_name") or entry.get("id") or "unknown"
    
    if not isinstance(entry, str):
        entry = str(entry) if entry else "unknown"
    
    # Replace any non-alphanumeric character with underscore
    cleaned = re.sub(r'[^a-zA-Z0-9]', '_', entry)
    # Ensure the name starts with a letter
    if not cleaned:
        return 'default_repo'
    if cleaned[0].isdigit():
        cleaned = '_' + cleaned
    return cleaned.lower()


def _is_entry_nexus_processed(entry: Dict[str, Any]) -> bool:
    if entry.get("nexus_processed"):
        return True
    enriched = entry.get("mbrn_enriched", {})
    return isinstance(enriched, dict) and bool(enriched.get("nexus_processed"))


def _is_nexus_retry_blocked(target: Dict[str, Any]) -> bool:
    if target.get("nexus_quarantined"):
        return True
    if int(target.get("nexus_failure_count") or 0) >= MAX_NEXUS_FAILURES:
        return True
    if not target.get("nexus_failed"):
        return False
    retry_after = _parse_utc_datetime(target.get("nexus_retry_after"))
    return retry_after is not None and retry_after > _utc_now()


def _clamp_roi_threshold(value, lower_bound=0.0, upper_bound=100.0):
    try:
        parsed = float(value)
    except (TypeError, ValueError):
        return ROI_THRESHOLD
    return max(lower_bound, min(parsed, upper_bound))


def load_factory_control() -> Dict[str, Any]:
    """Read factory control state from SQLite, with legacy JSON fallback."""
    default = {
        "scout_status": "running",
        "nexus_status": "running",
        "nexus_roi_threshold": ROI_THRESHOLD,
        "ouroboros_target_file": None,
        "prime_directive": "Maximize factory output and clear backlog.",
    }
    try:
        control = load_db_factory_control(default)
        if control.get("nexus_status") not in {"running", "paused"}:
            control["nexus_status"] = "running"
        if control.get("scout_status") not in {"running", "paused"}:
            control["scout_status"] = "running"
        control["nexus_roi_threshold"] = _clamp_roi_threshold(control.get("nexus_roi_threshold"))
        return control
    except Exception as exc:
        log.warning(f"SQLite factory control unavailable; falling back to legacy JSON: {exc}")
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
    dimension: str = "systeme"
    source_url: str = ""


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
    Scan SQLite scout_alphas for all unprocessed entries with ROI > threshold.
    Falls back to the read-only JSON snapshot only when no SQLite candidates exist.

    Handles two formats found in the file:
    Format A (structured discoveries):
      {"id": "alpha_...", "repo": {"name": "...", "url": "..."}, "analysis": {"score": 92}}
    Format B (raw ROI entries):
      {"repo": "owner/name", "roi": 95.0}
    """
    try:
        rows = list_scout_alphas(statuses=("pending", "approved"), min_score=ROI_THRESHOLD)
        db_candidates: List[AlphaCandidate] = []
        for row in rows:
            # CRITICAL FIX: Handle None raw_data safely
            raw_data = row.get("raw_data") if row else None
            if not raw_data or not isinstance(raw_data, str):
                raw_data = "{}"
            try:
                raw = json.loads(raw_data)
            except json.JSONDecodeError:
                raw = {}
            repo = raw.get("repo") if isinstance(raw, dict) else {}
            analysis = raw.get("analysis") if isinstance(raw, dict) else {}
            repo_name = (
                repo.get("full_name")
                or repo.get("name")
                or raw.get("repo_name")
                or row["title"]
            )
            if not repo_name:
                continue
            dimension = row["dimension"] if row["dimension"] in CANONICAL_DIMENSIONS else "systeme"
            db_candidates.append(AlphaCandidate(
                alpha_id=f"sqlite_{row['id']}",
                repo_name=str(repo_name),
                repo_url=str(row["source_url"] or repo.get("html_url") or f"https://github.com/{repo_name}"),
                roi_score=float(row["score"] or 0.0),
                description=str(repo.get("description") or raw.get("description") or ""),
                category=str(analysis.get("category") or "automation") if isinstance(analysis, dict) else "automation",
                rationale=str(analysis.get("synergy_summary") or analysis.get("roi_rationale") or "") if isinstance(analysis, dict) else "",
                dimension=dimension,
                source_url=str(row["source_url"]),
            ))
        if db_candidates:
            log.info(f"Found {len(db_candidates)} SQLite alpha(s) with ROI > {ROI_THRESHOLD}")
            return db_candidates
    except Exception as exc:
        log.warning(f"SQLite alpha scan unavailable; falling back to JSON snapshot: {exc}")

    data = _load_alphas_json()
    if not data:
        return []

    candidates: List[AlphaCandidate] = []
    discoveries = data.get("discoveries", [])
    processed_repo_names = {
        _normalize_repo_name(_repo_name_for_entry(entry))
        for entry in discoveries
        if isinstance(entry, dict) and _is_entry_nexus_processed(entry)
    }
    processed_repo_names.discard("")
    candidate_repo_names = set()

    for entry in discoveries:
        # ── Format B: raw ROI entry ─────────────────────────────────────
        if "roi" in entry and isinstance(entry.get("repo"), str):
            roi = float(entry.get("roi", 0))
            if roi < ROI_THRESHOLD:
                continue
            if entry.get("nexus_processed"):
                continue
            if _is_nexus_retry_blocked(entry):
                continue
            repo_name = entry["repo"]
            normalized_repo_name = _normalize_repo_name(repo_name)
            if normalized_repo_name in processed_repo_names or normalized_repo_name in candidate_repo_names:
                continue
            candidate_repo_names.add(normalized_repo_name)
            candidates.append(AlphaCandidate(
                alpha_id=f"raw_{repo_name.replace('/', '_')}",
                repo_name=repo_name,
                repo_url=f"https://github.com/{repo_name}",
                roi_score=roi,
                description=f"High-ROI Scout discovery (ROI={roi})",
                category="automation",
                rationale=f"Scout raw ROI score: {roi}",
                dimension=str(entry.get("dimension") or "systeme"),
                source_url=str(entry.get("source_url") or f"https://github.com/{repo_name}"),
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
        if _is_nexus_retry_blocked(mbrn_enriched):
            continue

        repo_name = repo.get("name", "")
        if not repo_name:
            continue
        normalized_repo_name = _normalize_repo_name(repo_name)
        if normalized_repo_name in processed_repo_names or normalized_repo_name in candidate_repo_names:
            continue
        candidate_repo_names.add(normalized_repo_name)

        candidates.append(AlphaCandidate(
            alpha_id=alpha_id,
            repo_name=repo_name,
            repo_url=repo.get("url", f"https://github.com/{repo_name}"),
            roi_score=score,
            description=repo.get("description") or "",
            category=analysis.get("category", "automation"),
            rationale=analysis.get("rationale", ""),
            dimension=str(entry.get("dimension") or "systeme"),
            source_url=str(entry.get("source_url") or repo.get("url") or f"https://github.com/{repo_name}"),
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


def _request_tool_if_needed(alpha_id: str, reason: str) -> None:
    """Operation MacGyver: Request a tool if failure reason suggests missing deps/parsing."""
    keywords = ["missing", "no module", "library", "parse", "format", "tool", "regex", "json", "csv", "xml"]
    reason_lower = reason.lower()
    if any(kw in reason_lower for kw in keywords):
        try:
            atomic_write("tool_requests", {
                "alpha_id": alpha_id,
                "requested_tool_description": f"Automated fix needed for: {reason}",
                "status": "pending",
                "raw_data": {
                    "alpha_id": alpha_id,
                    "requested_tool_description": f"Automated fix needed for: {reason}",
                    "status": "pending",
                    "created_at": _utc_now().isoformat(),
                },
            })
            requests = []
            if TOOL_REQUESTS_PATH.exists():
                with open(TOOL_REQUESTS_PATH, "r", encoding="utf-8") as f:
                    requests = json.load(f)
            
            if any(req.get("alpha_id") == alpha_id for req in requests):
                return

            requests.append({
                "alpha_id": alpha_id,
                "requested_tool_description": f"Automated fix needed for: {reason}",
                "status": "pending",
                "created_at": _utc_now().isoformat()
            })
            
            with open(TOOL_REQUESTS_PATH, "w", encoding="utf-8") as f:
                json.dump(requests, f, indent=2, ensure_ascii=False)
            log.info(f"MACGYVER: Tool request created for alpha {alpha_id}")
        except Exception as e:
            log.warning(f"Failed to create tool request: {e}")


def mark_alpha_processed(alpha_id: str) -> None:
    """Mark an alpha as processed in scout_alphas.json so it won't re-run."""
    if alpha_id.startswith("sqlite_"):
        return
    data = _load_alphas_json()
    if not data:
        return

    discoveries = data.get("discoveries", [])
    for entry in discoveries:
        # Format B
        if "roi" in entry and isinstance(entry.get("repo"), str):
            if f"raw_{entry['repo'].replace('/', '_')}" == alpha_id:
                entry["nexus_processed"] = True
                entry["nexus_status"] = "processed"
                entry["nexus_processed_at"] = _utc_now().isoformat()
                _clear_nexus_failure_fields(entry)
                break
        # Format A
        elif entry.get("id") == alpha_id:
            enriched = entry.setdefault("mbrn_enriched", {})
            enriched["nexus_processed"] = True
            enriched["nexus_status"] = "processed"
            enriched["nexus_processed_at"] = _utc_now().isoformat()
            _clear_nexus_failure_fields(enriched)
            break

    _save_alphas_json(data)
    log.info(f"Alpha '{alpha_id}' marked as processed.")


def mark_alpha_failed(alpha_id: str, failure_reason: str) -> None:
    """Record a retryable Nexus failure without marking the alpha processed."""
    if alpha_id.startswith("sqlite_"):
        return
    data = _load_alphas_json()
    if not data:
        return

    now = _utc_now()
    retry_after = now + timedelta(hours=NEXUS_FAILURE_RETRY_HOURS)
    reason = (failure_reason or "unknown_failure").strip()[:1000]

    discoveries = data.get("discoveries", [])
    for entry in discoveries:
        target: Optional[Dict[str, Any]] = None
        if "roi" in entry and isinstance(entry.get("repo"), str):
            if f"raw_{entry['repo'].replace('/', '_')}" == alpha_id:
                target = entry
        elif entry.get("id") == alpha_id:
            target = entry.setdefault("mbrn_enriched", {})

        if target is None:
            continue

        failure_count = int(target.get("nexus_failure_count") or 0) + 1
        target["nexus_processed"] = False
        target["nexus_failed"] = True
        target["nexus_status"] = "failed"
        target["nexus_failed_at"] = now.isoformat()
        target["nexus_failure_reason"] = reason
        target["nexus_failure_count"] = failure_count
        if failure_count >= MAX_NEXUS_FAILURES:
            target["nexus_quarantined"] = True
            target["nexus_retry_after"] = None
            # Operation MacGyver triage
            _request_tool_if_needed(alpha_id, reason)
        else:
            target["nexus_retry_after"] = retry_after.isoformat()
        break

    _save_alphas_json(data)
    log.info(f"Alpha '{alpha_id}' marked as failed for retry/quarantine handling.")


# ---------------------------------------------------------------------------
# README Fetcher — GitHub API with Jina fallback
# ---------------------------------------------------------------------------

def fetch_readme(repo_path):
    md_files = extract_md_files(repo_path)
    readme_content = read_file_content('README.md')
    if readme_content:
        chunks = chunk_text(readme_content, max_tokens=1000)
        return '\n'.join(chunks)
    return ''


# ---------------------------------------------------------------------------
# Goal Builder — translate alpha metadata into a concrete agent goal
# ---------------------------------------------------------------------------

def build_factory_goal(alpha: AlphaCandidate, readme: Optional[str]) -> str:
    """
    Construct a concrete, standalone-Python goal string for the AutoDevAgent.
    """
    readme_excerpt = ""
    if readme:
        readme_excerpt = f"\n\nREADME EXCERPT (first 1500 chars):\n{readme[:1500]}"

    memory_context = ""
    try:
        from mbrn_factory_memory import retrieve_elite_modules
        query = f"{alpha.category} {alpha.repo_name} {alpha.description} {alpha.rationale}"
        elite_modules = retrieve_elite_modules(query, min_score=0.8, top_k=2)
        if elite_modules:
            memory_context = "\n\nMBRN FACTORY MEMORY (Diamond-tier elite modules only):\n"
            for mod in elite_modules:
                memory_context += f"--- {mod['name']} (Score: {mod.get('quality_score', 'N/A')}) ---\n{mod['code'][:800]}...\n\n"
    except Exception:
        pass

    goal = f"""Goal: Reimplement the core logic of the GitHub repository '{alpha.repo_name}' into a SINGLE standalone Python file.

ARCHITECTURAL MANDATE (v1.2):
- DO NOT copy the README content or metadata as a placeholder.
- DO NOT attempt to import external libraries like 'crewai', 'langchain', 'pandas' etc.
- USE ONLY the Python standard library (json, urllib, re, math, etc.).
- REIMPLEMENT the logic (e.g. specialized scrapers, calculators, or agents) from scratch in pure Python.
- Output MUST be a valid, executable Python script with a main() entry point.

ALPHA CONTEXT:
- Category: {alpha.category}
- Description: {alpha.description}
- Rationale: {alpha.rationale}{readme_excerpt}{memory_context}

The final module should be efficient, autonomous, and fit for production use in the MBRN Hub."""
    return goal


# ---------------------------------------------------------------------------
# Dashboard Notification Writer
# ---------------------------------------------------------------------------

def push_dashboard_notification(alpha: AlphaCandidate, output_path: Path, result: AgentResult) -> None:
    """
    Append a notification to SQLite and refresh the local read-only dashboard snapshot.
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

    insert_notification(
        notification_type="factory_module_ready",
        dimension=alpha.dimension if alpha.dimension in CANONICAL_DIMENSIONS else "systeme",
        module_name=output_path.name,
        message=notification["message"],
        raw_data=notification,
    )
    export_factory_feed_snapshot()

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

def process_alpha(alpha: AlphaCandidate) -> Optional[FactoryResult]:
    """
    The main execution flow: README -> Goal -> Agent -> Code Save -> DB Upsert.
    """
    log.info(f"--- STARTING FACTORY RUN: {alpha.repo_name} (ROI: {alpha.roi_score}) ---")

    # 1. Fetch README
    readme = fetch_readme(alpha.repo_name)
    
    # 2. Build Goal
    goal = build_factory_goal(alpha, readme)
    
    # 3. Initialize Agent
    agent = AutoDevAgent(max_retries=MAX_AGENT_RETRIES)
    
    # 4. Run Agent
    result = agent.run(goal)
    
    if not result.success:
        log.error(f"AutoDevAgent failed for {alpha.repo_name}: {result.failure_reason}")
        mark_alpha_failed(alpha.alpha_id, result.failure_reason or "agent_failed")
        return None

    # 5. Success! Save and process
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
    output_path.write_text(header + result.final_code, encoding="utf-8")
    
    # DB Upsert
    upsert_factory_module(
        name=output_path.stem,
        dimension=alpha.dimension if alpha.dimension in CANONICAL_DIMENSIONS else "systeme",
        source_file=str(output_path),
        frontend_file=None,
        status="ready",
        quality_score=alpha.roi_score,
        raw_data={
            "alpha_id": alpha.alpha_id,
            "repo_name": alpha.repo_name,
            "roi_score": alpha.roi_score,
            "agent_attempts": result.total_attempts,
        },
    )
    
    # Mark as processed
    mark_alpha_processed(alpha.alpha_id)
    mark_scout_alpha_status(alpha.alpha_id, "processed")
    
    # Dashboard Notification
    push_dashboard_notification(alpha, output_path, result)
    
    log.info(f"✅ SUCCESS: Factory module manufactured at {output_path}")

    return FactoryResult(
        alpha_id=alpha.alpha_id,
        repo_name=alpha.repo_name,
        roi_score=alpha.roi_score,
        module_name=output_path.stem,
        output_path=str(output_path),
        stdout_preview=result.final_output[:500],
        total_agent_attempts=result.total_attempts
    )


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
    log.info("║           MBRN NEXUS BRIDGE — SCOUT-TO-FACTORY SWEEP             ║")
    log.info("╠══════════════════════════════════════════════════════════════════╣")
    log.info(f"║  ROI Threshold : > {ROI_THRESHOLD:<47.0f}║")
    log.info(f"║  Output Dir    : docs/S3_Data/outputs/factory_ready/             ║")
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
        factory_result = process_alpha(alpha)
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
    init_db()

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
