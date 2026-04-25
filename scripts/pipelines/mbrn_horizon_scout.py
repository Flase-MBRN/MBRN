#!/usr/bin/env python3
"""
/scripts/pipelines/mbrn_horizon_scout.py
INFINITE SYNERGY SCOUT - Autonomous R&D Discovery System v2.0

Responsibilities:
1. Infinite Loop: Continuous discovery with 15-min cooldown (hardware-friendly)
2. Context-Synergy: Load Kanon + Manifest for architecture-aware analysis
3. Hard ROI Filters: Weighted scoring (Scalability 50%, Maintenance 30%, Uniqueness 20%)
4. Evolution Log: Persist validated alphas to mbrn_evolution_plan.json
5. Kill-Switch: STOP_SCOUT file for graceful shutdown

Hardware Optimized For: RX 7700 XT (15-min cooldown between LLM inferences)
"""

from __future__ import annotations

import json
import os
import re
import sys
import time
import urllib.request
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

# =============================================================================
# PATH HANDLING for Bridge Import
# =============================================================================
_PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

from bridges.local_llm.bridge import LocalLLMBridge, LocalLLMBridgeConfig

# =============================================================================
# Local Pipeline Utils
# =============================================================================
PIPELINES_DIR = Path(__file__).resolve().parent
if str(PIPELINES_DIR) not in sys.path:
    sys.path.append(str(PIPELINES_DIR))

from pipeline_utils import load_pipeline_env, log as pipeline_log, save_json_atomic

DEFAULT_SCOUT_OLLAMA_MODEL = "gemma3:12b"  # 128K context — ideal for README analysis


def log(level: str, message: object) -> None:
    """Scout-local ASCII logger for stable Windows live-monitor output."""
    text = str(message)
    if "INFINITE SYNERGY SCOUT" in text and "AUTONOMOUS R&D SYSTEM" in text:
        text = "| INFINITE SYNERGY SCOUT v2.0 - AUTONOMOUS R&D SYSTEM |"
    elif "Cooldown:" in text and "hardware" in text:
        text = "| Cooldown: 15 minutes (hardware-friendly) |"
    elif "ROI Threshold" in text:
        text = "| ROI Threshold: >85 (Hard Filter) |"
    elif "Kill-Switch" in text:
        text = "| Kill-Switch: Create STOP_SCOUT file to exit |"
    elif "Evolution Log" in text:
        text = "| Evolution Log: shared/data/mbrn_evolution_plan.json |"
    elif "ITERATION #" in text:
        text = text.replace("\n", " ")
        text = re.sub(r"[^A-Za-z0-9:# ._-]+", "", text).strip()
    elif text and sum(1 for char in text if ord(char) > 127) > max(3, len(text) // 4):
        text = "+------------------------------------------------------------+"
    else:
        text = text.encode("ascii", errors="replace").decode("ascii")
    pipeline_log(level, text)


# =============================================================================
# INFINITE SYNERGY SCOUT CONFIGURATION v2.0
# =============================================================================
SCOUT_CONFIG = {
    "github": {
        "search_url": "https://api.github.com/search/repositories",
        "keywords": [
            "autonomous-agent-framework",
            "self-healing-code",
            "mcp-server-local",
            "agentic-workflow-automation",
            "auto-gpt-local",
            "llm-code-execution-loop",
            "autonomous-devops",
            "ai-orchestrator-core",
            "crewai-tools",
            "langgraph-agent",
            "smolagents",
            "pydantic-ai",
            "mcp-client-implementation",
            "local-llm-orchestration",
            "ai-coding-assistant-local",
            "self-improving-prompt",
            "automated-trading-agent",
            "resume-parser-llm",
        ],
        "created_within_days": 7,
        "per_page": 30,
        "timeout_seconds": 30,
    },
    "jina": {
        "prefix": "https://r.jina.ai/",
        "timeout_seconds": 15,
    },
    "infinite_loop": {
        "cooldown_minutes": 5,
        "kill_switch_file": "STOP_SCOUT",
    },
    "roi_weights": {
        "scalability": 0.50,    # Prio 1: 500k€ leverage potential
        "maintenance": 0.30,    # Prio 2: Solo operation = low maintenance critical
        "uniqueness": 0.20,     # Prio 3: Market gap
    },
    "thresholds": {
        "roi_score_min": 80,    # Hard filter: only > 80 passes
        "alpha_vault_score_min": 87,
    },
    "persistence": {
        "alphas_path": _PROJECT_ROOT / "shared" / "data" / "scout_alphas.json",
        "evolution_path": _PROJECT_ROOT / "shared" / "data" / "mbrn_evolution_plan.json",
        "alpha_vault_root": _PROJECT_ROOT / "shared" / "alphas",
    },
    "context_sources": {
        "kanon": _PROJECT_ROOT / "000_CANONICAL_STATE.json",
        "manifest": _PROJECT_ROOT / "000_MBRN_BUSINESS_PLAN.md",
    },
    "mbrn": {
        "scout_id": "infinite_synergy_scout_v2",
        "source": "github_discovery",
    }
}

SYNERGY_ANALYSIS_PROMPT = """Analysiere, ob dieses Projekt MBRN auf das Level einer 500kEUR-Organisation hebt.

TOOL INFORMATION:
{repo_info}

README CONTENT:
{readme_content}

MBRN ARCHITECTURE CONTEXT:
- Active Pillars: {active_pillars}
- Available Bridges: {available_bridges}
- System State: {system_maturity}

Bewertungspunkte für Level-5 Autonomie:
- Autonomie-Level: Ersetzt es den menschlichen Architekten beim Coden/Testen?
- Core-Intelligence: Macht es das System fähig, eigene Fehler (Tracebacks) zu heilen?
- Integration: Läuft es lokal (Python/Ollama) und lässt sich in die MBRN-Pillars einbinden?

Analyze for:
1. PILLAR ALIGNMENT: Which pillar benefits most? (frontend_os|oracle|monetization|meta_generator|none)
2. CATEGORY: Vault category (frontend|core_logic|autonomy)
3. CONCRETE BENEFIT: How does this tool replace the human architect? (max 140 chars)
4. INTEGRATION PATH: Effort (low|medium|high) + automation steps
5. RECOMMENDED EVOLUTION: How to automate this today?
6. ESTIMATED INTEGRATION DURATION: Short duration estimate, e.g. "2-4 hours"
7. READY SNIPPET: Optional short useful JS/Python code snippet, otherwise empty string
8. SCALABILITY: Score 1-100 (leverage for fully autonomous 500kEUR revenue target?)
9. MAINTENANCE: Score 1-100 (autonomy score: 100 = zero human touch required)
10. UNIQUENESS: Score 1-100 (market gap in agentic systems)

You are a professional JSON-only output engine. Never add conversational filler or markdown code blocks like ```json. Output raw JSON only.
Return ONLY valid JSON:
{{
  "pillar_alignment": "<pillar_name or 'none'>",
  "category": "<frontend|core_logic|autonomy>",
  "concrete_benefit": "<how it replaces the human architect>",
  "integration_path": "<low|medium|high>: <automation steps>",
  "recommended_evolution": "<how to automate this today>",
  "estimated_integration_duration": "<duration estimate>",
  "ready_snippet": "<optional short JS or Python snippet, otherwise empty string>",
  "scalability_score": <1-100>,
  "maintenance_score": <1-100>,
  "uniqueness_score": <1-100>,
  "synergy_summary": "<one sentence why this is a breakthrough for autonomy>"
}}

Rules:
- scalability_score: 100 = massive leverage for fully autonomous 500kEUR target
- maintenance_score: 100 = zero-touch, fully autonomous (level 5)
- uniqueness_score: 100 = blue ocean, no competitors in agentic space
- category must be exactly one of frontend, core_logic, autonomy
- synergy_summary: max 100 chars, explain the "breakthrough"
"""

SYNERGY_REQUIRED_KEYS = [
    "pillar_alignment",
    "category",
    "concrete_benefit",
    "integration_path",
    "recommended_evolution",
    "estimated_integration_duration",
    "scalability_score",
    "maintenance_score",
    "uniqueness_score",
    "synergy_summary",
]

SYNERGY_SCHEMA_HINT = """{
  "pillar_alignment": "frontend_os|oracle|monetization|meta_generator|none",
  "category": "frontend|core_logic|autonomy",
  "concrete_benefit": "Replaces the human architect by automatically fixing Python tracebacks via LLM loop.",
  "integration_path": "medium: implement self-healing wrapper for pipeline scripts",
  "recommended_evolution": "automate error recovery today",
  "estimated_integration_duration": "4-8 hours",
  "ready_snippet": "",
  "scalability_score": 95,
  "maintenance_score": 100,
  "uniqueness_score": 90,
  "synergy_summary": "Breakthrough in self-healing code execution"
}"""


# =============================================================================
# CONTEXT-SYNERGY ENGINE: Load MBRN Architecture State
# =============================================================================
def load_kanon_context() -> Dict[str, Any]:
    """Load 000_CANONICAL_STATE.json for architecture-aware analysis."""
    kanon_path = SCOUT_CONFIG["context_sources"]["kanon"]
    try:
        with open(kanon_path, "r", encoding="utf-8") as f:
            kanon = json.load(f)
        pillars = kanon.get("pillars", {})
        active_pillars = [name for name, data in pillars.items() if data.get("state") == "active"]
        bridges = kanon.get("bridges", {})
        available_bridges = [name for name, data in bridges.items() if data.get("state") in ["active", "implemented"]]
        maturity_levels = [data.get("maturity") for data in pillars.values() if data.get("state") == "active"]
        system_maturity = "stable" if all(m == "stable" for m in maturity_levels) else "mixed"
        return {
            "active_pillars": active_pillars,
            "available_bridges": available_bridges,
            "system_maturity": system_maturity,
            "raw_kanon": kanon
        }
    except Exception as exc:
        log("WARN", f"Failed to load Kanon context: {exc}")
        return {
            "active_pillars": ["frontend_os", "oracle", "monetization", "meta_generator"],
            "available_bridges": ["supabase", "local_llm"],
            "system_maturity": "mixed",
            "raw_kanon": {}
        }


def load_manifest_context() -> Optional[str]:
    """Load 000_MBRN_BUSINESS_PLAN.md for vision context (optional)."""
    manifest_path = SCOUT_CONFIG["context_sources"]["manifest"]
    if not manifest_path.exists():
        return None
    try:
        with open(manifest_path, "r", encoding="utf-8") as f:
            content = f.read()
        return content[:2000]
    except Exception as exc:
        log("WARN", f"Failed to load Manifest: {exc}")
        return None


# =============================================================================
# ROI CALCULATION ENGINE
# =============================================================================
def calculate_roi_score(analysis: Dict[str, Any]) -> Tuple[float, str]:
    weights = SCOUT_CONFIG["roi_weights"]
    scalability = float(analysis.get("scalability_score", 0))
    maintenance = float(analysis.get("maintenance_score", 0))
    uniqueness = float(analysis.get("uniqueness_score", 0))
    roi_score = (
        (scalability * weights["scalability"]) +
        (maintenance * weights["maintenance"]) +
        (uniqueness * weights["uniqueness"])
    )
    if roi_score >= 90:
        rationale = "Exceptional: High leverage + low maintenance + market leader"
    elif roi_score >= 85:
        rationale = "Strong ROI: Good balance across all criteria"
    elif roi_score >= 70:
        rationale = "Moderate: Viable but not exceptional"
    else:
        rationale = "Weak: Lacks leverage or requires too much maintenance"
    return round(roi_score, 1), rationale


ALPHA_VAULT_CATEGORIES = ("frontend", "core_logic", "autonomy")
SNIPPET_BLOCK_RE = re.compile(r"```(?P<lang>[A-Za-z0-9_+-]*)\s*\n(?P<body>.*?)```", re.DOTALL)


def sanitize_tool_name(tool_name: str) -> str:
    normalized = re.sub(r"[^A-Za-z0-9._-]+", "_", tool_name.strip().replace("/", "_"))
    normalized = normalized.strip("._-")
    return normalized[:80] or "unknown_tool"


def normalize_alpha_category(analysis: Dict[str, Any], repo: Dict[str, Any] | None = None) -> str:
    raw_category = str(analysis.get("category", "")).strip().lower()
    if raw_category in ALPHA_VAULT_CATEGORIES:
        return raw_category
    pillar = str(analysis.get("pillar_alignment", "")).strip().lower()
    if pillar == "frontend_os":
        return "frontend"
    if raw_category == "autonomy":
        return "autonomy"
    return "core_logic"


def ensure_alpha_vault_structure() -> None:
    vault_root = SCOUT_CONFIG["persistence"]["alpha_vault_root"]
    for category in ALPHA_VAULT_CATEGORIES:
        (vault_root / category).mkdir(parents=True, exist_ok=True)


def choose_snippet_extension(repo: Dict[str, Any], snippet: str) -> str:
    language = str(repo.get("language") or "").strip().lower()
    snippet_head = snippet[:400].lower()
    if language in {"javascript", "typescript"} or any(token in snippet_head for token in ("const ", "let ", "function ", "export ")):
        return "js"
    return "py"


def extract_ready_snippet(analysis: Dict[str, Any], readme_content: str) -> str:
    ready_snippet = str(analysis.get("ready_snippet") or "").strip()
    if ready_snippet:
        return ready_snippet[:4000]
    for match in SNIPPET_BLOCK_RE.finditer(readme_content or ""):
        language = match.group("lang").strip().lower()
        if language in {"python", "py", "javascript", "js", "typescript", "ts"}:
            body = match.group("body").strip()
            if body:
                return body[:4000]
    return ""


def build_integration_guide(repo: Dict[str, Any], analysis: Dict[str, Any], category: str, snippet_written: bool) -> str:
    tool_name = repo.get("full_name", "unknown")
    repo_url = repo.get("html_url", "N/A")
    recommended_evolution = str(analysis.get("recommended_evolution") or analysis.get("integration_path") or "Review manually.")
    snippet_note = "A ready snippet is included next to this guide." if snippet_written else "No safely extractable JS/Python snippet was found."
    return "\n".join([
        f"# {tool_name}",
        "",
        f"- Source: {repo_url}",
        f"- Category: {category}",
        f"- ROI: {analysis.get('roi_score', 0)}/100",
        f"- Pillar: {analysis.get('pillar_alignment', 'none')}",
        f"- Estimated integration: {analysis.get('estimated_integration_duration', 'unknown')}",
        "",
        "## Why It Matters",
        str(analysis.get("synergy_summary") or analysis.get("concrete_benefit") or "No summary provided."),
        "",
        "## Where To Integrate",
        "Use the current Kanon first.",
        "",
        "## How To Integrate Today",
        recommended_evolution,
        "",
        "## Ready Snippet",
        snippet_note,
        "",
    ])


def write_alpha_vault_entry(repo: Dict[str, Any], analysis: Dict[str, Any], readme_content: str) -> Optional[Path]:
    ensure_alpha_vault_structure()
    category = normalize_alpha_category(analysis, repo)
    date_prefix = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    tool_slug = sanitize_tool_name(str(repo.get("full_name", "unknown")))
    alpha_dir = SCOUT_CONFIG["persistence"]["alpha_vault_root"] / category / f"{date_prefix}_{tool_slug}"
    alpha_dir.mkdir(parents=True, exist_ok=True)
    snippet = extract_ready_snippet(analysis, readme_content)
    snippet_written = False
    if snippet:
        extension = choose_snippet_extension(repo, snippet)
        (alpha_dir / f"ready_snippet.{extension}").write_text(snippet.rstrip() + "\n", encoding="utf-8")
        snippet_written = True
    guide = build_integration_guide(repo, analysis, category, snippet_written)
    (alpha_dir / "integration_guide.md").write_text(guide, encoding="utf-8")
    log("OK", f"Alpha Vault entry created: {alpha_dir}")
    return alpha_dir


def print_high_roi_alpha(repo: Dict[str, Any], analysis: Dict[str, Any]) -> None:
    tool_name = repo.get("full_name", "unknown")
    reason = str(analysis.get("synergy_summary") or analysis.get("concrete_benefit") or "High ROI candidate.").strip()
    duration = str(analysis.get("estimated_integration_duration") or "unknown").strip()
    color = "\033[95m"
    reset = "\033[0m"
    print(f"{color}*** SYNERGY ALPHA >95% FOUND: {tool_name} ***{reset}")
    print(f"{color}Log: {reason} | Integration: {duration}{reset}")


def should_stop_scout() -> bool:
    kill_switch_path = PIPELINES_DIR / SCOUT_CONFIG["infinite_loop"]["kill_switch_file"]
    return kill_switch_path.exists()


def create_stop_signal():
    kill_switch_path = PIPELINES_DIR / SCOUT_CONFIG["infinite_loop"]["kill_switch_file"]
    try:
        kill_switch_path.touch()
    except Exception as exc:
        log("WARN", f"Failed to create kill switch: {exc}")


def scan_github_trending() -> List[Dict[str, Any]]:
    url = f"{SCOUT_CONFIG['github']['search_url']}"
    from urllib.parse import urlencode
    headers = {"Accept": "application/vnd.github.v3+json", "User-Agent": "MBRN-Horizon-Scout/1.0"}
    github_token = os.getenv("GITHUB_TOKEN")
    if github_token:
        headers["Authorization"] = f"token {github_token}"
    repos_by_id: Dict[int, Dict[str, Any]] = {}
    since_date = (datetime.now(timezone.utc) - timedelta(days=SCOUT_CONFIG["github"]["created_within_days"])).strftime("%Y-%m-%d")
    for keyword in SCOUT_CONFIG["github"]["keywords"]:
        query = f"{keyword} created:>{since_date}"
        params = {"q": query, "sort": "updated", "order": "desc", "per_page": SCOUT_CONFIG["github"]["per_page"]}
        full_url = f"{url}?{urlencode(params)}"
        try:
            req = urllib.request.Request(full_url, headers=headers, method="GET")
            with urllib.request.urlopen(req, timeout=SCOUT_CONFIG["github"]["timeout_seconds"]) as response:
                data = json.loads(response.read().decode("utf-8"))
            for repo in data.get("items", []):
                repo_id = repo.get("id")
                if isinstance(repo_id, int):
                    repos_by_id[repo_id] = repo
            log("OK", f"GitHub query complete: query='{query}' items={len(data.get('items', []))}")
            time.sleep(10.0)  # Rate limit prevention (max 10 req/min for unauthenticated search)
        except Exception as exc:
            log("WARN", f"GitHub scan failed query='{query}': {exc}")
            time.sleep(10.0)  # Rate limit prevention
    return sorted(repos_by_id.values(), key=lambda r: str(r.get("updated_at") or ""), reverse=True)


def extract_readme(repo_full_name: str) -> Optional[str]:
    api_url = f"https://api.github.com/repos/{repo_full_name}/readme"
    headers = {"Accept": "application/vnd.github.v3.raw", "User-Agent": "MBRN-Horizon-Scout/1.0"}
    github_token = os.getenv("GITHUB_TOKEN")
    if github_token:
        headers["Authorization"] = f"token {github_token}"
    try:
        req = urllib.request.Request(api_url, headers=headers, method="GET")
        with urllib.request.urlopen(req, timeout=SCOUT_CONFIG["github"]["timeout_seconds"]) as response:
            content = response.read().decode("utf-8")
        log("OK", f"README extracted via GitHub API: {len(content)} chars")
        return content
    except Exception as exc:
        log("WARN", f"GitHub README API failed for {repo_full_name}: {exc}")
        repo_url = f"https://github.com/{repo_full_name}"
        jina_url = f"{SCOUT_CONFIG['jina']['prefix']}{repo_url}"
        try:
            req = urllib.request.Request(jina_url, headers={"User-Agent": "MBRN-Horizon-Scout/1.0"}, method="GET")
            with urllib.request.urlopen(req, timeout=SCOUT_CONFIG["jina"]["timeout_seconds"]) as response:
                content = response.read().decode("utf-8")
            log("OK", f"README extracted via Jina fallback: {len(content)} chars")
            return content
        except Exception:
            return None


def analyze_tool_synergy(repo_data: Dict[str, Any], readme_content: str, context: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    bridge = LocalLLMBridge(LocalLLMBridgeConfig(model=os.getenv("OLLAMA_MODEL", DEFAULT_SCOUT_OLLAMA_MODEL)))
    if not bridge.is_available():
        log("WARN", "Ollama not available for LLM analysis")
        return None
    repo_info = f"Name: {repo_data.get('full_name')}\nDescription: {repo_data.get('description')}\nURL: {repo_data.get('html_url')}"
    prompt = SYNERGY_ANALYSIS_PROMPT.format(
        repo_info=repo_info,
        readme_content=readme_content[:6000],
        active_pillars=", ".join(context.get("active_pillars", [])),
        available_bridges=", ".join(context.get("available_bridges", [])),
        system_maturity=context.get("system_maturity", "mixed")
    )
    try:
        success, result = bridge.execute_custom_prompt(
            prompt=prompt,
            required_keys=SYNERGY_REQUIRED_KEYS,
            schema_hint=SYNERGY_SCHEMA_HINT,
            worker_name=f"synergy_analysis_{repo_data.get('id')}"
        )
        if not success:
            log("WARN", f"Synergy analysis failed for {repo_data.get('full_name')}")
            return None
        roi_score, roi_rationale = calculate_roi_score(result)
        result["roi_score"] = roi_score
        result["roi_rationale"] = roi_rationale
        log("OK", f"Synergy analysis complete: ROI={roi_score}/100 | Pillar={result.get('pillar_alignment')}")
        return result
    except Exception as exc:
        log("WARN", f"Synergy analysis error: {exc}")
        return None


def load_existing_alphas() -> Dict[str, Any]:
    output_path = SCOUT_CONFIG["persistence"]["alphas_path"]
    if not output_path.exists():
        return {"metadata": {"version": "2.0"}, "discoveries": [], "seen_repo_ids": []}
    try:
        with open(output_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {"discoveries": [], "seen_repo_ids": []}


def save_alphas(data: Dict[str, Any]) -> bool:
    output_path = SCOUT_CONFIG["persistence"]["alphas_path"]
    try:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        save_json_atomic(output_path, data)
        return True
    except Exception:
        return False


def load_evolution_plan() -> List[Dict[str, Any]]:
    path = SCOUT_CONFIG["persistence"]["evolution_path"]
    if not path.exists():
        return []
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


def save_evolution_entry(repo: Dict[str, Any], analysis: Dict[str, Any], context: Dict[str, Any]) -> bool:
    path = SCOUT_CONFIG["persistence"]["evolution_path"]
    try:
        entries = load_evolution_plan()
        timestamp = datetime.now(timezone.utc)
        entry = {
            "id": f"evo_{timestamp.strftime('%Y%m%d_%H%M%S')}_{repo.get('id')}",
            "tool_name": repo.get("full_name"),
            "category": normalize_alpha_category(analysis, repo),
            "roi_score": analysis.get("roi_score"),
            "synergy_point": analysis.get("pillar_alignment"),
            "concrete_benefit": analysis.get("concrete_benefit"),
            "discovered_at": timestamp.isoformat(),
            "repo_metadata": {"id": repo.get("id"), "url": repo.get("html_url")},
            "analysis_details": {
                "scalability_score": analysis.get("scalability_score"),
                "maintenance_score": analysis.get("maintenance_score"),
                "uniqueness_score": analysis.get("uniqueness_score"),
                "roi_rationale": analysis.get("roi_rationale"),
            }
        }
        entries.append(entry)
        path.parent.mkdir(parents=True, exist_ok=True)
        save_json_atomic(path, entries)
        log("OK", f"Evolution entry saved: {entry['tool_name']} (ROI: {entry['roi_score']}/100)")
        return True
    except Exception as exc:
        log("ERROR", f"Failed to save evolution entry: {exc}")
        return False


def backfill_alpha_vault_from_evolution_plan():
    entries = load_evolution_plan()
    threshold = SCOUT_CONFIG["thresholds"]["alpha_vault_score_min"]
    for entry in entries:
        if float(entry.get("roi_score", 0)) >= threshold:
            repo = {"full_name": entry.get("tool_name"), "html_url": entry.get("repo_metadata", {}).get("url")}
            analysis = {
                "pillar_alignment": entry.get("synergy_point"),
                "category": entry.get("category"),
                "roi_score": entry.get("roi_score"),
                "concrete_benefit": entry.get("concrete_benefit"),
                "analysis_details": entry.get("analysis_details")
            }
            write_alpha_vault_entry(repo, analysis, "")


def run_synergy_patrol(context: Dict[str, Any]) -> Tuple[int, int]:
    log("INFO", "=== INFINITE SYNERGY SCOUT PATROL STARTED ===")
    alphas_data = load_existing_alphas()
    seen_repo_ids = set(alphas_data.get("seen_repo_ids", []))
    repos = scan_github_trending()
    if not repos:
        return 0, 0
    new_discoveries = 0
    repos_analyzed = 0
    for repo in repos:
        if should_stop_scout():
            break
        repo_id = repo.get("id")
        repo_name = repo.get("full_name")
        if repo_id in seen_repo_ids:
            continue
        log("INFO", f"Analyzing: {repo_name}")
        readme = extract_readme(repo_name)
        if not readme:
            seen_repo_ids.add(repo_id)
            continue
        analysis = analyze_tool_synergy(repo, readme, context)
        repos_analyzed += 1
        if not analysis:
            seen_repo_ids.add(repo_id)
            continue
        roi_score = analysis.get("roi_score", 0)
        if roi_score >= SCOUT_CONFIG["thresholds"]["roi_score_min"]:
            log("OK", f"🎯 ALPHA DISCOVERED: {repo_name} (ROI: {roi_score})")
            write_alpha_vault_entry(repo, analysis, readme)
            save_evolution_entry(repo, analysis, context)
            alphas_data = load_existing_alphas() # Refresh
            alphas_data["discoveries"].append({"repo": repo_name, "roi": roi_score})
            new_discoveries += 1
        seen_repo_ids.add(repo_id)
        alphas_data["seen_repo_ids"] = list(seen_repo_ids)
        save_alphas(alphas_data)
    return new_discoveries, repos_analyzed


def run_infinite_synergy_loop():
    log("INFO", "=== INFINITE SYNERGY SCOUT v2.0 ===")
    backfill_alpha_vault_from_evolution_plan()
    iteration = 0
    while True:
        iteration += 1
        if should_stop_scout():
            break
        log("INFO", f"ITERATION #{iteration} starting...")
        try:
            context = load_kanon_context()
            new_alphas, analyzed = run_synergy_patrol(context)
            log("OK", f"Iteration #{iteration} complete: {new_alphas} alphas found")
        except Exception as exc:
            log("ERROR", f"Iteration #{iteration} failed: {exc}")
        
        cooldown = SCOUT_CONFIG["infinite_loop"]["cooldown_minutes"] * 60
        log("INFO", f"Cooldown: {cooldown // 60} minutes...")
        for _ in range(cooldown // 10):
            if should_stop_scout():
                return
            time.sleep(10)


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--single", action="store_true")
    parser.add_argument("--infinite", action="store_true", help="Run in infinite loop (default)")
    args = parser.parse_args()
    load_pipeline_env(PIPELINES_DIR / ".env")
    if args.single:
        run_synergy_patrol(load_kanon_context())
    else:
        run_infinite_synergy_loop()
