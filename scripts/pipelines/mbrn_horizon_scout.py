#!/usr/bin/env python3
"""
MBRN Horizon Scout v2.1 - Infinite Synergy Discovery Agent
v5.6: Targeted Harvesting Upgrade (Physis & Energie) + Logic Fix
"""

from __future__ import annotations
import os, sys, json, time, argparse, urllib.request, urllib.error, re, random
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Set

_SCRIPT_PATH = Path(__file__).resolve()
_PIPELINES_DIR = _SCRIPT_PATH.parent
_PROJECT_ROOT = _PIPELINES_DIR.parents[1]

if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

# Imports from bridges and utils
from bridges.local_llm.bridge import LocalLLMBridge, LocalLLMBridgeConfig
from pipeline_utils import load_pipeline_env, log as pipeline_log, save_json_atomic

# Path Configuration
FACTORY_CONTROL_PATH = _PROJECT_ROOT / "shared" / "data" / "mbrn_factory_control.json"
LOG_DIR = _PIPELINES_DIR / "logs"
LOG_PATH = LOG_DIR / "horizon_scout.log"
DEFAULT_SCOUT_OLLAMA_MODEL = "gemma3:12b"

def log(level: str, message: object):
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    msg = f"[{ts}] [SCOUT] [{level}] {message}"
    print(msg)
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(msg + "\n")

def load_factory_control() -> Dict[str, Any]:
    default = {"scout_status": "running", "nexus_roi_threshold": 80.0}
    try:
        if not FACTORY_CONTROL_PATH.exists():
            return default
        with open(FACTORY_CONTROL_PATH, "r", encoding="utf-8") as f:
            control = json.load(f)
        if not isinstance(control, dict):
            return default
        merged = dict(default)
        merged.update(control)
        if merged.get("scout_status") not in {"running", "paused"}:
            merged["scout_status"] = "running"
        return merged
    except Exception as exc:
        log("WARN", f"Factory control unavailable; using defaults: {exc}")
        return default

# =============================================================================
# INFINITE SYNERGY SCOUT CONFIGURATION v2.1
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
            # Targeted v5.6: Physis (Health & Biometrics)
            "health-tracker-algo", "quantified-self-ai", "fitness-algorithm-local", "biometrics-analyzer-py",
            # Targeted v5.6: Energie (Focus & Habits)
            "habit-tracker-automation", "energy-management-agent", "focus-timer-llm", "dopamine-detox-tool",
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
        "seen_repos_path": _PROJECT_ROOT / "shared" / "data" / "seen_repos.json",
        "evolution_path": _PROJECT_ROOT / "shared" / "data" / "mbrn_evolution_plan.json",
        "alpha_vault_root": _PROJECT_ROOT / "shared" / "alphas",
    },
    "context_sources": {
        "kanon": _PROJECT_ROOT / "000_CANONICAL_STATE.json",
        "manifest": _PROJECT_ROOT / "000_MBRN_BUSINESS_PLAN.md",
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
"""

SYNERGY_REQUIRED_KEYS = [
    "pillar_alignment", "category", "concrete_benefit", "integration_path",
    "recommended_evolution", "estimated_integration_duration",
    "scalability_score", "maintenance_score", "uniqueness_score", "synergy_summary"
]

SYNERGY_SCHEMA_HINT = """{
  "pillar_alignment": "frontend_os|oracle|monetization|meta_generator|none",
  "category": "frontend|core_logic|autonomy",
  "concrete_benefit": "Replaces human architect by fixing Python tracebacks automatically.",
  "scalability_score": 95,
  "maintenance_score": 100,
  "uniqueness_score": 90,
  "synergy_summary": "Self-healing code breakthrough"
}"""

# =============================================================================
# LOGIC ENGINES
# =============================================================================

def calculate_roi_score(analysis: Dict[str, Any]) -> Tuple[float, str]:
    """Calculate ROI based on scalability, maintenance, and uniqueness scores."""
    s = float(analysis.get("scalability_score", 50))
    m = float(analysis.get("maintenance_score", 50))
    u = float(analysis.get("uniqueness_score", 50))
    score = (s * 0.5) + (m * 0.3) + (u * 0.2)
    rationale = f"Scalability: {s}, Maintenance: {m}, Uniqueness: {u}"
    return round(score, 2), rationale

def load_kanon_context() -> Dict[str, Any]:
    kanon_path = SCOUT_CONFIG["context_sources"]["kanon"]
    try:
        with open(kanon_path, "r", encoding="utf-8") as f:
            kanon = json.load(f)
        pillars = kanon.get("pillars", {})
        active_pillars = [name for name, data in pillars.items() if data.get("state") == "active"]
        bridges = kanon.get("bridges", {})
        available_bridges = [name for name, data in bridges.items() if data.get("state") in ["active", "implemented"]]
        return {
            "active_pillars": active_pillars,
            "available_bridges": available_bridges,
            "system_maturity": "mixed"
        }
    except Exception as exc:
        log("WARN", f"Kanon load failed: {exc}")
        return {"active_pillars": [], "available_bridges": [], "system_maturity": "mixed"}

def sanitize_tool_name(tool_name: str) -> str:
    normalized = re.sub(r"[^A-Za-z0-9._-]+", "_", tool_name.strip().replace("/", "_"))
    return normalized[:80] or "unknown_tool"

def write_alpha_vault_entry(repo: Dict[str, Any], analysis: Dict[str, Any], readme_content: str) -> Optional[Path]:
    vault_root = SCOUT_CONFIG["persistence"]["alpha_vault_root"]
    category = analysis.get("category", "core_logic")
    (vault_root / category).mkdir(parents=True, exist_ok=True)
    date_prefix = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    tool_slug = sanitize_tool_name(str(repo.get("full_name", "unknown")))
    alpha_dir = vault_root / category / f"{date_prefix}_{tool_slug}"
    alpha_dir.mkdir(parents=True, exist_ok=True)
    
    guide = f"# {repo.get('full_name')}\nROI: {analysis.get('roi_score')}\n{analysis.get('synergy_summary')}"
    (alpha_dir / "integration_guide.md").write_text(guide, encoding="utf-8")
    log("OK", f"Alpha Vault entry created: {alpha_dir}")
    return alpha_dir

# =============================================================================
# GITHUB & DISCOVERY
# =============================================================================

def scan_github_trending(keywords: List[str]) -> List[Dict[str, Any]]:
    from urllib.parse import urlencode
    repos = []
    since_date = (datetime.now(timezone.utc) - timedelta(days=7)).strftime("%Y-%m-%d")
    for keyword in keywords:
        params = {"q": f"{keyword} created:>{since_date}", "sort": "updated", "order": "desc", "per_page": 10}
        full_url = f"{SCOUT_CONFIG['github']['search_url']}?{urlencode(params)}"
        try:
            req = urllib.request.Request(full_url, headers={"User-Agent": "MBRN-Scout/1.0"})
            token = os.getenv("GITHUB_TOKEN")
            if token: req.add_header("Authorization", f"token {token}")
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                repos.extend(data.get("items", []))
            time.sleep(5)
        except Exception as e:
            log("WARN", f"Scan failed for {keyword}: {e}")
    return repos

def extract_readme(repo_full_name: str) -> Optional[str]:
    api_url = f"https://api.github.com/repos/{repo_full_name}/readme"
    try:
        req = urllib.request.Request(api_url, headers={"Accept": "application/vnd.github.v3.raw", "User-Agent": "MBRN-Scout/1.0"})
        token = os.getenv("GITHUB_TOKEN")
        if token: req.add_header("Authorization", f"token {token}")
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.read().decode("utf-8")
    except Exception:
        return None

def analyze_tool_synergy(repo_data: Dict[str, Any], readme_content: str, context: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    bridge = LocalLLMBridge(LocalLLMBridgeConfig(model=os.getenv("OLLAMA_MODEL", DEFAULT_SCOUT_OLLAMA_MODEL)))
    if not bridge.is_available(): return None
    repo_info = f"Name: {repo_data.get('full_name')}\nDesc: {repo_data.get('description')}"
    prompt = SYNERGY_ANALYSIS_PROMPT.format(
        repo_info=repo_info, readme_content=readme_content[:6000],
        active_pillars=", ".join(context.get("active_pillars", [])),
        available_bridges=", ".join(context.get("available_bridges", [])),
        system_maturity="mixed"
    )
    success, result = bridge.execute_custom_prompt(prompt, SYNERGY_REQUIRED_KEYS, SYNERGY_SCHEMA_HINT)
    if success:
        roi_score, _ = calculate_roi_score(result)
        result["roi_score"] = roi_score
        return result
    return None

def run_synergy_patrol(context: Dict[str, Any], keywords: List[str]):
    repos = scan_github_trending(keywords)
    for repo in repos:
        readme = extract_readme(repo.get("full_name"))
        if readme:
            analysis = analyze_tool_synergy(repo, readme, context)
            if analysis and analysis.get("roi_score", 0) >= 80:
                write_alpha_vault_entry(repo, analysis, readme)

if __name__ == "__main__":
    load_pipeline_env(_PIPELINES_DIR / ".env")
    context = load_kanon_context()
    keywords = SCOUT_CONFIG["github"]["keywords"]
    selected = random.sample(keywords, min(len(keywords), 2))
    run_synergy_patrol(context, selected)
