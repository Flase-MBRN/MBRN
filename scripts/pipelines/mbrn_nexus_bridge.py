"""
================================================================================
MBRN Nexus Bridge — Scout-to-Factory Autonomous Closure Loop
================================================================================
System:       mbrn_nexus_bridge
Version:      1.11.0
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
_PIPELINE_DIR = Path(__file__).resolve().parent

if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))
if str(_PIPELINE_DIR) not in sys.path:
    sys.path.insert(0, str(_PIPELINE_DIR))

# Pfad zum Toolkit-Modul hinzufügen
toolkit_path = os.path.join(os.path.dirname(__file__), 'mbrn_toolkit', 'modules')
if toolkit_path not in sys.path:
    sys.path.append(toolkit_path)

# Toolkit-Imports
try:
    from nabilnet_org_claude_memory import chunk_text, read_file_content
except ImportError:
    # Fallback wenn Toolkit nicht verfügbar
    def chunk_text(text, max_tokens):
        chunks = []
        current_chunk = []
        current_tokens = 0
        words = text.split()
        for word in words:
            if current_tokens + len(word) <= max_tokens:
                current_chunk.append(word)
                current_tokens += len(word)
            else:
                chunks.append(' '.join(current_chunk))
                current_chunk = [word]
                current_tokens = len(word)
        if current_chunk:
            chunks.append(' '.join(current_chunk))
        return chunks
    def read_file_content(file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except UnicodeDecodeError:
            try:
                with open(file_path, 'r', encoding='latin1') as f:
                    return f.read()
            except Exception:
                return ''
        except Exception:
            return ''

from autonomous_dev_agent import AutoDevAgent, AgentResult, validate_high_utility_code
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
KILL_SWITCH = _PIPELINE_DIR / "STOP_NEXUS"

# Datetime format constant
DATETIME_FMT = "%Y-%m-%dT%H:%M:%S.%f%z"


def _utc_now():
    # Gibt ein echtes, zeitzonenbewusstes Objekt zurück statt eines Strings
    return datetime.now(timezone.utc)


def _parse_utc_datetime(text, max_tokens=500):
    chunks = chunk_text(text, max_tokens)
    for chunk in chunks:
        try:
            parsed = datetime.strptime(chunk.strip(), DATETIME_FMT)
            # Ensure timezone-aware with UTC
            if parsed.tzinfo is None:
                parsed = parsed.replace(tzinfo=timezone.utc)
            return parsed
        except ValueError:
            pass
    raise ValueError(f'Could not parse UTC datetime from text: {text}')


def _clear_nexus_failure_fields(target: Dict[str, Any]) -> None:
    for key in (
        "nexus_failed",
        "nexus_failed_at",
        "nexus_failure_reason",
        "nexus_retry_after",
        "nexus_quarantined",
    ):
        target.pop(key, None)


def verify_skills(repo_url, layers):
    return huxiaoman7_skills_eval.verify_skills(repo_url, layers)


def process_content(content):
    """Process content and return metadata."""
    if not content:
        return {"content": "", "length": 0}
    return {"content": content[:5000], "length": len(content)}


def process_chunk(chunk):
    """Process a single chunk of content."""
    return {"chunk": chunk[:1000], "processed": True}


def _normalize_repo_name(repo_url):
    # Extract and normalize the repo name
    parts = repo_url.split('/')[-2:]
    if len(parts) < 2:
        return 'default_repo'
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
    source_type: str = "github"  # github | hackernews | other
    quality_score: float = 0.0    # Scout-delivered score (0-100)


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


def _save_alphas_json(alphas, file_path):
    import json
    try:
        content = read_file_content(file_path)
        with open(file_path, 'w') as f:
            json.dump(alphas, f)
    except Exception as e:
        print(f'Error saving alphas: {e}')


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
            if not row:
                continue
            # CRITICAL FIX: Handle None raw_data safely
            raw_data = row["raw_data"] if "raw_data" in row.keys() else None
            if not raw_data or not isinstance(raw_data, str):
                raw_data = "{}"
            try:
                raw = json.loads(raw_data)
            except json.JSONDecodeError:
                raw = {}
            
            if raw is None:
                raw = {}

            repo = raw.get("repo") if isinstance(raw, dict) and raw.get("repo") is not None else {}
            analysis = raw.get("analysis") if isinstance(raw, dict) and raw.get("analysis") is not None else {}
            
            # Helper to get value from row safely
            def get_row_val(r, key, default=None):
                try:
                    return r[key]
                except (KeyError, IndexError):
                    return default

            repo_name = (
                repo.get("full_name")
                or repo.get("name")
                or raw.get("repo_name")
                or get_row_val(row, "title")
            )
            if not repo_name:
                continue

            _row_dim = get_row_val(row, "dimension")
            dimension = _row_dim if _row_dim in CANONICAL_DIMENSIONS else "systeme"
            
            source_url = get_row_val(row, "source_url") or repo.get("html_url") or f"https://github.com/{repo_name}"
            score = get_row_val(row, "score") or 0.0

            db_candidates.append(AlphaCandidate(
                alpha_id=f"sqlite_{row['id']}",
                repo_name=str(repo_name),
                repo_url=str(source_url),
                roi_score=float(score),
                description=str(repo.get("description") or raw.get("description") or ""),
                category=str(analysis.get("category") or "automation") if isinstance(analysis, dict) else "automation",
                rationale=str(analysis.get("synergy_summary") or analysis.get("roi_rationale") or "") if isinstance(analysis, dict) else "",
                dimension=dimension,
                source_url=str(get_row_val(row, "source_url") or ""),
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

    _save_alphas_json(data, ALPHAS_PATH)
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
        
        # Immediate quarantine if generation is blocked by Value Gate (v1.10.1)
        is_blocked = "ValueGateError" in reason or "Forbidden" in reason or "ExecutionRealityError" in reason
        
        if is_blocked or failure_count >= MAX_NEXUS_FAILURES:
            target["nexus_quarantined"] = True
            target["nexus_retry_after"] = None
            target["nexus_status"] = "blocked_generation" if is_blocked else "failed"
            # Operation MacGyver triage
            _request_tool_if_needed(alpha_id, reason)
        else:
            target["nexus_retry_after"] = retry_after.isoformat()
        break

    _save_alphas_json(data, ALPHAS_PATH)
    log.info(f"Alpha '{alpha_id}' marked as failed for retry/quarantine handling.")


# ---------------------------------------------------------------------------
# README Fetcher — GitHub API with Jina fallback
# ---------------------------------------------------------------------------

def fetch_content(alpha_item):
    """Extract content from alpha item (URL or raw content)."""
    # Handle AlphaCandidate objects
    if hasattr(alpha_item, 'repo_url'):
        readme = fetch_readme(alpha_item.repo_url)
        return readme if readme else alpha_item.description
    if isinstance(alpha_item, dict):
        # Try to get content from various sources
        content = alpha_item.get("content", "")
        if not content and "repo_url" in alpha_item:
            readme = fetch_readme(alpha_item["repo_url"])
            return readme if readme else alpha_item.get("description", "")
        return content
    return str(alpha_item)


def fetch_readme(repo_url):
    """Fetch README from GitHub repo URL via HTTP API."""
    try:
        # Convert GitHub repo URL to raw README URL
        if "github.com" in repo_url:
            # Extract owner/repo from URL
            parts = repo_url.rstrip('/').split('/')
            if len(parts) >= 2:
                owner, repo = parts[-2], parts[-1].replace('.git', '')
                # Try raw GitHub content URL
                raw_url = f"https://raw.githubusercontent.com/{owner}/{repo}/main/README.md"
                try:
                    with urllib.request.urlopen(raw_url, timeout=10) as response:
                        return response.read().decode('utf-8')
                except Exception:
                    # Try master branch
                    raw_url = f"https://raw.githubusercontent.com/{owner}/{repo}/master/README.md"
                    with urllib.request.urlopen(raw_url, timeout=10) as response:
                        return response.read().decode('utf-8')
        # Fallback: treat as local file
        return read_file_content(repo_url)
    except Exception as e:
        log.warning(f"Could not fetch README from {repo_url}: {e}")
        return ""


# ---------------------------------------------------------------------------
# Goal Builder — translate alpha metadata into a concrete agent goal
# ---------------------------------------------------------------------------

def sanitize_text_for_prompt(text: str) -> str:
    """
    Remove or replace forbidden vocabulary that might cause the LLM 
    to hallucinate low-utility patterns.
    """
    if not text:
        return ""
    
    replacements = {
        "sample": "canonical",
        "demo": "operational",
        "mock": "synthetic",
        "dummy": "literal",
        "placeholder": "variable",
        "example": "instance",
        "simulate": "execute",
        "toy": "minimal"
    }
    
    sanitized = text
    import re
    for word, replacement in replacements.items():
        pattern = re.compile(re.escape(word), re.IGNORECASE)
        sanitized = pattern.sub(replacement, sanitized)
        
    return sanitized

def build_factory_goal(alpha: AlphaCandidate, readme: Optional[str]) -> str:
    """
    Construct a concrete, standalone-Python goal string for the AutoDevAgent.
    """
    readme_excerpt = ""
    if readme:
        clean_readme = sanitize_text_for_prompt(readme[:2000])
        readme_excerpt = f"\n\nREADME EXCERPT (first 1500 chars):\n{clean_readme[:1500]}"

    memory_context = ""
    try:
        from mbrn_factory_memory import retrieve_elite_modules
        query = f"{alpha.category} {alpha.repo_name} {alpha.description} {alpha.rationale}"
        elite_modules = retrieve_elite_modules(query, min_score=0.8, top_k=2)
        if elite_modules:
            memory_context = "\n\nMBRN FACTORY MEMORY (Diamond-tier elite modules only):\n"
            for mod in elite_modules:
                clean_mod = sanitize_text_for_prompt(mod['code'][:1000])
                memory_context += f"--- {mod['name']} (Score: {mod.get('quality_score', 'N/A')}) ---\n{clean_mod[:800]}...\n\n"
    except Exception:
        pass

    goal = f"""Goal: Reimplement the core logic of the GitHub repository '{alpha.repo_name}' into a SINGLE standalone Python file.

🧠 MBRN MASTER PROMPT v1.11.0
(Synthetic Reality + Semantic Gate kompatibel)

You are an Autonomous Software Reimplementation Agent operating inside the MBRN Factory.

Your mission:
Reimplement the CORE LOGIC of the given repository into a SINGLE, standalone, deterministic Python module using ONLY the Python standard library.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧬 CORE PRINCIPLES (NON-NEGOTIABLE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. NO PLACEHOLDER LOGIC
- Do NOT use fake, empty, or illustrative logic.
- Do NOT write shallow wrappers or stubs.
- Every function must perform REAL computation, parsing, scoring, or transformation.

2. NO FORBIDDEN PATTERNS
- Certain low-utility vocabulary is globally banned by the validator.
- Do not use synthetic labels, low-effort labels, filler labels, or canned greetings in code, comments, strings, names, or output.
- Do NOT describe the code as temporary, illustrative, or incomplete.
- ANTI-BAIT RULE: Do NOT include code snippets containing banned trivial patterns. All internal code snippets must be production-like and must not contain canned greetings, trivial functions, generic class names, or unused low-utility logic.

3. PURE OFFLINE EXECUTION
- Use ONLY Python standard library (json, re, math, datetime, collections, etc.)
- DO NOT import: requests, subprocess, os.system, socket, urllib, http.client, etc.
- DO NOT access network, filesystem, or external tools.

4. DETERMINISTIC OUTPUT
- No randomness
- No time delays
- Same input → same output

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 SYNTHETIC REALITY LAYER (CRITICAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You MUST construct realistic, domain-specific input data INSIDE the script.

Rules:
- Data must look like real-world structured data (configs, logs, rules, transactions, etc.)
- Data must be specific and meaningful (NOT generic filler)
- Data must be used by the logic (not just declared)

Suitable domains:
- Code analysis → code snippets, dependency patterns, import structures
- Finance → transactions, categories, balances
- Automation → task definitions, rules, triggers
- Agent systems → roles, routing logic, constraints

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏗️ REQUIRED ENGINE STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You MUST implement either:
- At least 1 reusable class with multiple methods
OR
- At least 5 meaningful standalone functions

Required functional components:

1. extract_*      → parse structured information
2. detect_*       → identify patterns/issues
3. score_*        → compute a numeric evaluation
4. build_*        → generate structured outputs
5. analyze_*      → orchestrate full pipeline

Each function must:
- Take input
- Transform it meaningfully
- Return structured data

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 OUTPUT CONTRACT (MANDATORY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The main analysis function MUST return:

{{
  "score": number,
  "severity": "low" | "medium" | "high" | "critical",
  "findings": [ {{ ... detailed items ... }} ],
  "recommendations": [ ... actionable steps ... ]
}}

- Score must be computed, not hardcoded. Do NOT use variants like severity_score, health_score, etc.
- Severity must depend on score or findings.
- Findings must contain meaningful structured insights.
- Recommendations must be actionable and derived from findings.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚫 SANDBOX SAFETY RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ABSOLUTELY FORBIDDEN:
- subprocess, eval, exec
- network calls of any kind
- file deletion or system modification
- interactive input()

ALLOWED:
- string parsing
- pattern detection (regex)
- rule-based logic
- scoring systems

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 MAIN FUNCTION (REQUIRED)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You MUST include:

def main():
    # Construct realistic domain-specific input
    # Run analysis
    # Print JSON result

if __name__ == "__main__":
    main()

Rules:
- Input must look real (not generic filler)
- Input must trigger meaningful logic paths

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 QUALITY STANDARD (VALUE GATE TARGET)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your code will be rejected if:
- Logic is shallow or repetitive
- Data is generic or unused
- Findings are obvious or trivial
- Recommendations are generic advice

Your code will pass if:
- Logic shows clear reasoning layers
- Data is structured and domain-relevant
- Output is insightful and non-trivial
- Functions are reusable and modular

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 FINAL OBJECTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Transform the repository idea into a REAL, standalone utility engine.

ALPHA CONTEXT:
- Repository: {alpha.repo_name}
- Category: {alpha.category}
- Description: {alpha.description}
- Rationale: {alpha.rationale}{readme_excerpt}{memory_context}

If the generated logic could be replaced by a simple template or static output, it is invalid. Increase complexity and reasoning depth.
Build a REAL, standalone utility engine (v1.11.0). Not a shallow wrapper. Not a sketch.
"""
    return goal


# ---------------------------------------------------------------------------
# Dashboard Notification Writer
# ---------------------------------------------------------------------------

def push_dashboard_notification(alpha: AlphaCandidate, output_path: Path, result: AgentResult, value_card: Optional[Dict[str, Any]] = None) -> None:
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
    }

    if value_card:
        score = value_card["scoring"]["overall_value"]
        target = value_card["target_app"]
        notification["title"] = f"Diamond-Tier Modul: {module_name} ({score}%)"
        notification["message"] += f" Spezialisierung: {target}. Klassifiziert als Integrations-Kandidat."

    notification.update({
        "alpha_id": alpha.alpha_id,
        "repo_name": alpha.repo_name,
        "roi_score": alpha.roi_score,
        "module_file": module_name,
        "output_path": str(output_path),
        "agent_attempts": result.total_attempts,
        "self_heals": max(0, result.total_attempts - 1),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "read": False,
        "value_score": value_card["scoring"]["overall_value"] if value_card else None,
        "target_app": value_card["target_app"] if value_card else None
    })

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
def validate_execution_reality(stdout: str) -> tuple[bool, str]:
    """
    MBRN Execution Reality Gate v1.10.8: Deep validation of sandbox output.
    """
    try:
        data = json.loads(stdout)
    except Exception as exc:
        return False, f"invalid JSON stdout: {exc}"

    required = {"score", "severity", "findings", "recommendations"}
    missing = required - set(data.keys())
    if missing:
        return False, f"missing output contract key(s): {sorted(missing)}"

    if not isinstance(data["score"], (int, float)) or data["score"] <= 0:
        return False, "score must be a positive number (greater than zero)"

    if data["severity"] not in {"low", "medium", "high", "critical"}:
        return False, "severity must be low, medium, high, or critical"

    if not isinstance(data["findings"], list) or len(data["findings"]) < 2:
        return False, "findings must contain at least 2 meaningful items"

    if not isinstance(data["recommendations"], list) or len(data["recommendations"]) < 2:
        return False, "recommendations must contain at least 2 actionable items"

    weak_terms = {
        "consider", "improve", "optimize", "review", "refactor",
        "enhance", "ensure", "check", "update", "fix"
    }

    def flatten(item):
        if isinstance(item, dict):
            return " ".join(str(v) for v in item.values()).lower()
        return str(item).lower()

    finding_text = " ".join(flatten(x) for x in data["findings"])
    recommendation_text = " ".join(flatten(x) for x in data["recommendations"])

    if len(finding_text) < 80:
        return False, "findings are too thin"

    if len(recommendation_text) < 100:
        return False, "recommendations are too thin"

    weak_hits = sum(1 for term in weak_terms if term in recommendation_text)
    if weak_hits >= 5:
        return False, "recommendations are too generic"

    if data["score"] in {0, 1, 50, 80, 100} and len(data["findings"]) < 3:
        return False, "score looks canned or weakly justified"

    # Banned pattern check in output (v1.10.8)
    banned_json_patterns = ["sample", "demo", "mock", "dummy", "placeholder", "example", "simulate", "toy"]
    full_output_text = (finding_text + " " + recommendation_text).lower()
    found_banned = [p for p in banned_json_patterns if p in full_output_text]
    if found_banned:
        return False, f"forbidden pattern(s) detected in output JSON: {', '.join(found_banned)}"

    return True, "execution reality accepted"


# ---------------------------------------------------------------------------

def process_alpha(alpha: AlphaCandidate) -> Optional[FactoryResult]:
    """
    Process ONE alpha through the AutoDevAgent and write factory-ready module.
    Returns FactoryResult on success, None on failure.
    """
    try:
        log.info(f"Processing alpha: {alpha.repo_name} (ROI: {alpha.roi_score})")
        
        # Fetch README for context
        readme = fetch_readme(alpha.repo_url)
        
        # Build goal for AutoDevAgent
        goal = build_factory_goal(alpha, readme)
        
        # Run AutoDevAgent
        agent = AutoDevAgent(max_retries=MAX_AGENT_RETRIES)
        result = agent.run(goal)
        
        if not result.success:
            log.error(f"AutoDevAgent failed for {alpha.repo_name}: {result.failure_reason}")
            mark_alpha_failed(alpha.alpha_id, str(result.failure_reason))
            return None
        
        # ── Post-Generation Value Gate v2 (v1.10.1) ──────────────────────────
        success, reason = validate_high_utility_code(result.final_code)
        if not success:
            reason = f"ValueGateError: {reason}"
            log.error(f"Post-generation gate rejected {alpha.repo_name}: {reason}")
            mark_alpha_failed(alpha.alpha_id, reason)
            return None
            
        # ── Execution Reality Gate (v1.10.1) ────────────────────────────────
        success, reason = validate_execution_reality(result.final_output)
        if not success:
            reason = f"ExecutionRealityError: {reason}"
            log.warning(f"Execution Reality Gate rejected module: {reason}")
            mark_alpha_failed(alpha.alpha_id, reason)
            return None
            
        # Build metadata header
        meta_header = f'''"""
# MBRN_MODULE_META
# alpha_id: {alpha.alpha_id}
# repo_name: {alpha.repo_name}
# source_type: {alpha.source_type}
# quality_score: {alpha.quality_score}
# roi_score: {alpha.roi_score}
# dimension: {alpha.dimension}
# category: {alpha.category}
# manufactured_at: {datetime.now(timezone.utc).isoformat()}
"""

'''
        # Prepend metadata header to generated code
        final_code = meta_header + result.final_code
        
        # Write to factory_ready directory (Initial Landing Zone)
        FACTORY_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        safe_name = alpha.repo_name.replace('/', '_').replace('\\', '_')
        output_path = FACTORY_OUTPUT_DIR / f"{safe_name}_module.py"
        
        output_path.write_text(final_code, encoding='utf-8')
        log.info(f"Module written to landing zone: {output_path}")

        # NOTE: v1.11.0 Decoupling. Value Routing is now handled by a 
        # separate standalone process (mbrn_value_router.py) watching this dir.
        
        # Register in Database for Logic Auditor
        upsert_factory_module(
            name=safe_name,
            dimension=alpha.dimension,
            source_file=alpha.source_url,
            frontend_file=str(output_path.relative_to(_PROJECT_ROOT)),
            status="deployed",
            raw_data={
                "alpha_id": alpha.alpha_id,
                "roi_score": alpha.roi_score,
                "agent_attempts": result.total_attempts,
                "category": alpha.category
            }
        )
        
        # Mark as processed in source
        mark_alpha_processed(alpha.alpha_id)
        
        # Push dashboard notification
        push_dashboard_notification(alpha, output_path, result)
        
        return FactoryResult(
            alpha_id=alpha.alpha_id,
            repo_name=alpha.repo_name,
            roi_score=alpha.roi_score,
            module_name=output_path.name,
            output_path=str(output_path),
            stdout_preview=result.final_output[:500],
            total_agent_attempts=result.total_attempts,
            success=True
        )
        
    except Exception as exc:
        log.error(f"process_alpha failed for {alpha.repo_name}: {exc}")
        import traceback
        log.error(f"Traceback: {traceback.format_exc()}")
        mark_alpha_failed(alpha.alpha_id, str(exc))
        return None

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
        except (NameError, AttributeError, Exception) as exc:
            log.error(f"Nexus loop iteration failed: {exc}")
            import traceback
            log.error(f"Traceback: {traceback.format_exc()}")
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
