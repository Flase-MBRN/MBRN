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
import random
import re
import sys
import time
import urllib.request
import urllib.error
import base64
import math
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

# =============================================================================
# PATH HANDLING for Bridge Import
# =============================================================================
_PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

# Pfad zum Toolkit-Modul hinzufügen
toolkit_path = os.path.join(os.path.dirname(__file__), 'mbrn_toolkit', 'modules')
if toolkit_path not in sys.path:
    sys.path.append(toolkit_path)

from bridges.local_llm.bridge import LocalLLMBridge, LocalLLMBridgeConfig
import zxqer_finagent_quant

# =============================================================================
# Local Pipeline Utils
# =============================================================================
PIPELINES_DIR = Path(__file__).resolve().parent
if str(PIPELINES_DIR) not in sys.path:
    sys.path.append(str(PIPELINES_DIR))

from pipeline_utils import load_pipeline_env, log as pipeline_log, save_json_atomic

from shared.core.db import (
    init_db, get_db, upsert_scout_alpha,
    CANONICAL_DIMENSIONS
)


# =============================================================================
# Utility Functions
# =============================================================================
def read_file_content(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        log("WARN", f"Could not read {file_path}: {e}")
        return ""

DEFAULT_SCOUT_OLLAMA_MODEL = "qwen2.5-coder:14b"  # Elite context for Scout synergy analysis
FACTORY_CONTROL_PATH = _PROJECT_ROOT / "shared" / "data" / "mbrn_factory_control.json"
SCOUT_PAUSE_SECONDS = 600

# Logging Paths
LOG_DIR = Path(__file__).resolve().parent / "logs"
LOG_PATH = LOG_DIR / f"horizon_scout_{datetime.now(timezone.utc).strftime('%Y-%m-%d_%H%M%S')}.log"


# --- NEON ASTRA COLORS ---
ANSI = {
    "reset": "\033[0m", "bold": "\033[1m",
    "violet": "\033[38;2;123;92;245m", "success": "\033[38;2;79;255;176m",
    "warning": "\033[38;2;251;191;36m", "error": "\033[38;2;255;107;107m",
    "silver": "\033[38;2;180;184;198m", "gold": "\033[38;2;255;215;0m"
}

def log(level: str, message: object) -> None:
    """Scout-local Neon Astra logger."""
    ts = datetime.now(timezone.utc).strftime("%H:%M:%S UTC")
    color = ANSI["silver"]
    if level == "OK": color = ANSI["success"]
    elif level == "WARN": color = ANSI["warning"]
    elif level == "ERROR": color = ANSI["error"]
    elif level == "INFO": color = ANSI["violet"]
    
    msg = f"{ANSI['bold']}{color}[{ts}] [SCOUT] [{level}] {message}{ANSI['reset']}"
    print(msg)
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(msg + "\n")

def show_v5_banner():
    print(f"{ANSI['violet']}")
    print("  [o] MBRN HORIZON SCOUT v2.2")
    print("  >> SCANNING MULTIDIMENSIONAL ALPHA VAULT")
    print(f"  {ANSI['silver']}----------------------------------------{ANSI['reset']}")


def load_factory_control() -> Dict[str, Any]:
    """Read package-free factory control state with safe defaults."""
    default = {
        "scout_status": "running",
        "nexus_status": "running",
        "nexus_roi_threshold": 80.0,
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
        if merged.get("scout_status") not in {"running", "paused"}:
            merged["scout_status"] = "running"
        return merged
    except Exception as exc:
        log("WARN", f"Factory control unavailable; using defaults: {exc}")
        return default


# =============================================================================
# INFINITE SYNERGY SCOUT CONFIGURATION v2.0
# =============================================================================
SCOUT_CONFIG = {
    "modes": {
        "alpha_flood": True,
        "money_mode": True,
        "debug_allow_more_candidates": True,
        "dev_seed_mode": False  # Dev only: set to True for synthetic candidates
    },
    "github": {
        "search_url": "https://api.github.com/search/repositories",
        "keywords": [
            "autonomous-agent-framework", "self-healing-code", "mcp-server-local",
            "agentic-workflow-automation", "auto-gpt-local", "llm-code-execution-loop",
            "autonomous-devops", "ai-orchestrator-core", "crewai-tools",
            "langgraph-agent", "smolagents", "pydantic-ai", "mcp-client-implementation",
            "local-llm-orchestration", "ai-coding-assistant-local", "self-improving-prompt",
            "automated-trading-agent", "resume-parser-llm",
            "invoice parser ai", "receipt scanner ai", "ocr invoice automation",
            "pdf data extraction ai", "document automation python", "form filler ai",
            "contract analyzer ai", "email to pdf automation",
            "small business ai tool", "freelancer automation", "crm ai assistant",
            "lead generation ai", "sales email automation", "cold email ai",
            "customer support ai bot", "appointment booking ai",
            "job application automation", "resume optimizer ai", "cover letter generator ai",
            "browser automation assistant", "personal finance tracker ai", "habit tracker ai",
            "goal tracker automation", "local llm tool", "ollama automation",
            "offline ai assistant", "desktop ai assistant", "local first ai app"
        ],
        "money_keywords": [
            "local ai tool", "ai automation", "browser extension ai", "pdf ocr assistant",
            "invoice parser", "personal finance calculator", "habit tracker app",
            "productivity dashboard", "agent workflow", "local llm automation",
            "supabase ai app", "static saas template", "github pages tool",
            "vanilla javascript app", "ocr document assistant", "form filler assistant",
            "budget planner", "finance tracker", "self hosted ai", "mcp server",
            "workflow automation", "lead generation", "sales automation", "crm assistant",
            "invoice automation", "contract analysis", "appointment booking"
        ],
        "tech_keywords": [
            "vanilla js tool", "local first app", "no backend app", "static web app",
            "pwa calculator", "offline first dashboard"
        ],
        "mbrn_fit_keywords": [
            "discipline tracker", "habit tracker", "finance calculator",
            "numerology calculator", "life dashboard", "personal operating system",
            "focus timer", "streak tracker", "goal tracker"
        ],
        "created_within_days": 14,
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
        "scalability": 0.50,
        "maintenance": 0.30,
        "uniqueness": 0.20,
    },
    "thresholds": {
        "discovery_score_min": 20,
        "roi_score_min": 35,
        "alpha_vault_score_min": 87,
        "diamond_score_min": 75,
        "money_score_min": 60,
        "max_candidates_per_cycle": 25,
        "max_diamonds_per_cycle": 5,
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
    },
    "mbrn": {
        "scout_id": "infinite_synergy_scout_v2",
        "source": "github_discovery",
    }
}

DIMENSION_QUERIES = SCOUT_CONFIG["github"]["keywords"]

def get_priority_dimension() -> str:
    """v5.5: Equalizer Logic - find emptiest dimension."""
    from shared.core.db import get_db, CANONICAL_DIMENSIONS
    with get_db() as conn:
        counts = conn.execute("SELECT dimension, COUNT(*) as cnt FROM factory_modules WHERE is_elite=1 GROUP BY dimension").fetchall()
        count_map = {d: 0 for d in CANONICAL_DIMENSIONS}
        for row in counts:
            if row["dimension"] in count_map:
                count_map[row["dimension"]] = row["cnt"]
        min_val = min(count_map.values())
        weakest = [d for d, c in count_map.items() if c == min_val]
        return random.choice(weakest)

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


def load_manifest_context(context_path):
    return read_file_content(context_path)


# =============================================================================
# ROI CALCULATION ENGINE
# =============================================================================
def calculate_roi_score(prices, period):
    ema = calculate_ema(prices, period)
    if len(ema) < len(prices):
        return []
    roi = [(prices[i] - prices[i-1])/prices[i-1] * 100 for i in range(1, len(prices))]
    return roi


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
    
    # DUPLICATE CHECK: Skip if folder already exists today
    if alpha_dir.exists():
        return None
    
    alpha_dir.mkdir(parents=True, exist_ok=True)
    snippet = extract_ready_snippet(analysis, readme_content)
    snippet_written = False
    if snippet:
        extension = choose_snippet_extension(repo, snippet)
        snippet_path = alpha_dir / f"ready_snippet.{extension}"
        # Extra check: don't overwrite existing files
        if not snippet_path.exists():
            snippet_path.write_text(snippet.rstrip() + "\n", encoding="utf-8")
            snippet_written = True
    guide = build_integration_guide(repo, analysis, category, snippet_written)
    guide_path = alpha_dir / "integration_guide.md"
    if not guide_path.exists():
        guide_path.write_text(guide, encoding="utf-8")
        log("OK", f"Alpha Vault entry created: {alpha_dir}")
    return alpha_dir


def print_high_roi_alpha(repo: Dict[str, Any], analysis: Dict[str, Any]) -> None:
    tool_name = repo.get("full_name", "unknown")
    reason = str(analysis.get("synergy_summary") or analysis.get("concrete_benefit") or "High ROI candidate.").strip()
    duration = str(analysis.get("estimated_integration_duration") or "unknown").strip()
    color = "\033[95m"
    reset = "\033[0m"
    print(f"{color}{ANSI['bold']}*** SYNERGY ALPHA >95% FOUND: {tool_name} ***{ANSI['reset']}")
    print(f"{color}Log: {reason} | Integration: {duration}{ANSI['reset']}")


def should_stop_scout() -> bool:
    kill_switch_path = PIPELINES_DIR / SCOUT_CONFIG["infinite_loop"]["kill_switch_file"]
    return kill_switch_path.exists()


def create_stop_signal():
    kill_switch_path = PIPELINES_DIR / SCOUT_CONFIG["infinite_loop"]["kill_switch_file"]
    try:
        kill_switch_path.touch()
    except Exception as exc:
        log("WARN", f"Failed to create kill switch: {exc}")

# =============================================================================
# GITHUB TOKEN ROTATION
# =============================================================================
_github_tokens: List[str] = []
_current_token_idx: int = 0
_tokens_initialized: bool = False

def _init_github_tokens():
    global _github_tokens, _tokens_initialized, _current_token_idx
    if _tokens_initialized:
        return
    tokens_env = os.getenv("GITHUB_TOKENS", "").strip()
    if tokens_env:
        _github_tokens = [t.strip() for t in tokens_env.split(",") if t.strip()]
    else:
        single = os.getenv("GITHUB_TOKEN", "").strip()
        if single:
            _github_tokens = [single]
    _current_token_idx = 0
    _tokens_initialized = True
    if len(_github_tokens) > 1:
        log("INFO", f"Token Rotation Active: Loaded {len(_github_tokens)} GitHub Tokens.")

def get_current_github_token() -> Optional[str]:
    _init_github_tokens()
    if not _github_tokens:
        return None
    return _github_tokens[_current_token_idx]

def rotate_github_token() -> bool:
    global _current_token_idx
    _init_github_tokens()
    if len(_github_tokens) <= 1:
        return False
    old_idx = _current_token_idx
    _current_token_idx = (_current_token_idx + 1) % len(_github_tokens)
    log("WARN", f"GitHub Rate Limit hit! Rotating token (Index {old_idx} -> {_current_token_idx})")
    return True

def scan_github_trending(keywords: List[str]) -> List[Dict[str, Any]]:
    url = f"{SCOUT_CONFIG['github']['search_url']}"
    from urllib.parse import urlencode

    repos_by_id: Dict[int, Dict[str, Any]] = {}
    since_date = (datetime.now(timezone.utc) - timedelta(days=SCOUT_CONFIG["github"]["created_within_days"])).strftime("%Y-%m-%d")

    for keyword in keywords:
        query = f"{keyword} created:>{since_date}"
        params = {"q": query, "sort": "updated", "order": "desc", "per_page": SCOUT_CONFIG["github"]["per_page"]}
        full_url = f"{url}?{urlencode(params)}"

        max_retries = len(_github_tokens) if _github_tokens else 1
        for attempt in range(max(1, max_retries)):
            headers = {"Accept": "application/vnd.github.v3+json", "User-Agent": "MBRN-Horizon-Scout/1.0"}
            token = get_current_github_token()
            if token:
                headers["Authorization"] = f"token {token}"

            try:
                req = urllib.request.Request(full_url, headers=headers, method="GET")
                with urllib.request.urlopen(req, timeout=SCOUT_CONFIG["github"]["timeout_seconds"]) as response:
                    data = json.loads(response.read().decode("utf-8"))
                for repo in data.get("items", []):
                    repo_id = repo.get("id")
                    if isinstance(repo_id, int):
                        repos_by_id[repo_id] = repo
                log("OK", f"GitHub query complete: query='{query}' items={len(data.get('items', []))}")
                time.sleep(10.0)  # Rate limit prevention
                break  # Success, move to next keyword
            except urllib.error.HTTPError as exc:
                if exc.code in (403, 429) and rotate_github_token():
                    continue # Retry with new token
                log("WARN", f"GitHub scan failed query='{query}': {exc}")
                time.sleep(10.0)
                break
            except Exception as exc:
                log("WARN", f"GitHub scan failed query='{query}': {exc}")
                time.sleep(10.0)
                break

    return sorted(repos_by_id.values(), key=lambda r: str(r.get("updated_at") or ""), reverse=True)


def _github_headers() -> Dict[str, str]:
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "MBRN-Horizon-Scout/1.0",
    }
    token = get_current_github_token()
    if token:
        headers["Authorization"] = f"token {token}"
    return headers


def extract_readme(repo_path):
    import os
    from nabilnet_org_claude_memory import chunk_text
    readme_path = os.path.join(repo_path, 'README.md')
    if not os.path.exists(readme_path):
        return []
    content = read_file_content(readme_path)
    chunks = chunk_text(content, max_tokens=1000)
    return chunks


def _parse_github_time(value: str) -> Optional[datetime]:
    if not value:
        return None
    try:
        # e.g. 2026-04-26T18:10:04Z
        if value.endswith("Z"):
            value = value[:-1] + "+00:00"
        return datetime.fromisoformat(value)
    except Exception:
        return None


def get_category_tags(text: str) -> List[str]:
    """Identify category tags based on text content."""
    tags = []
    text = text.lower()
    mapping = {
        "finance": ["finance", "money", "budget", "invoice", "stock", "portfolio", "tax", "billing"],
        "automation": ["automation", "workflow", "assistant", "agent", "worker", "bot"],
        "local business": ["local", "crm", "customer", "lead", "sales", "appointment", "booking", "agency"],
        "document/OCR": ["ocr", "pdf", "document", "scanner", "parser", "extraction", "receipt"],
        "lead generation": ["lead", "scraper", "finding", "discovery", "email-extractor"],
        "personal productivity": ["productivity", "habit", "focus", "discipline", "time-tracking", "goal"],
        "creator tools": ["creator", "video", "audio", "editing", "social-media", "content"],
        "developer tools": ["developer", "library", "framework", "api", "cli", "git", "deployment"],
        "compliance/risk": ["compliance", "gdpr", "legal", "security", "audit", "privacy"]
    }
    for tag, keywords in mapping.items():
        if any(k in text for k in keywords):
            tags.append(tag)
    return tags

def get_mvp_reasoning(candidate: Dict[str, Any]) -> str:
    """Explain why this could become a great MBRN MVP."""
    desc = str(candidate.get("description", "")).lower()
    money = calculate_money_score(candidate)
    fit = calculate_mbrn_fit_score(candidate)
    
    if money >= 70 and "local" in desc:
        return "High-value local-first business logic. Perfectly aligns with MBRN autonomy goals."
    if "ocr" in desc or "pdf" in desc:
        return "Critical utility engine for document automation. High SaaS potential."
    if fit >= 60:
        return "Strong architectural fit. Minimal glue code required for Hub integration."
    if money >= 60:
        return "Clear monetization path identified via SaaS vertical."
    return "Niche utility with potential specialized use case."

def get_trash_warning(candidate: Dict[str, Any]) -> str:
    """Identify potential red flags or why it might be low value."""
    desc = str(candidate.get("description", "")).lower()
    stars = int(candidate.get("stargazers_count") or 0)
    
    if "api" in desc and "wrapper" in desc:
        return "Likely just an API wrapper. Low unique value for MBRN."
    if "high risk" in desc:
        return "Explicit high-risk indicators found in README."
    if stars < 5:
        return "Very low social proof. Might be experimental or broken."
    if any(k in desc for k in ["scraper", "selenium", "puppeteer"]) and "lead" not in desc:
        return "High maintenance risk due to scraping dependencies."
    return "No critical red flags found yet."

def calculate_money_score(candidate: Dict[str, Any]) -> int:
    """Evaluate SaaS and monetization potential (0-100)."""
    score = 0
    desc = (str(candidate.get("description", "")) + " " + str(candidate.get("readme_content", ""))).lower()
    name = str(candidate.get("name", "")).lower()
    combined = desc + " " + name
    
    # v2.2 Money-First Rules (Ultra-Heavy)
    if any(k in combined for k in ["invoice", "receipt", "pdf", "ocr", "document"]): score += 40
    if any(k in combined for k in ["lead", "sales", "crm", "customer", "support", "appointment", "booking"]): score += 40
    if any(k in combined for k in ["finance", "tax", "business", "freelancer", "agency", "budget", "billing"]): score += 35
    
    # Additive Bonuses for deeper detection (Stackable)
    if any(k in combined for k in ["extraction", "parser", "scanner"]): score += 25
    if any(k in combined for k in ["local", "ollama", "local-first", "offline", "self-hosted"]): score += 25
    if any(k in combined for k in ["automation", "workflow", "assistant", "productivity"]): score += 25
    if any(k in combined for k in ["ai", "llm", "agent"]): score += 25
    if any(k in combined for k in ["saas", "product", "platform", "tool", "efficiency"]): score += 20
    
    # Penalties
    if any(k in desc for k in ["high risk", "complex setup"]): score -= 40
    if any(k in desc for k in ["no license", "restricted"]): score -= 30
    
    return max(0, min(100, score))

def calculate_mbrn_fit_score(candidate: Dict[str, Any]) -> int:
    """Heuristic for how well a candidate fits into the MBRN architecture."""
    score = 0
    desc = (str(candidate.get("description", "")) + " " + str(candidate.get("name", ""))).lower()
    
    # Combined pool of keywords that signal a fit
    keywords = SCOUT_CONFIG["github"]["mbrn_fit_keywords"] + ["finance", "chronos", "numerology", "cockpit", "dashboard"]
    for k in keywords:
        if k in desc:
            score += 20 # Increased weight for fit
            
    # Language bonus
    if str(candidate.get("language") or "").lower() in ["python", "javascript", "html", "css"]:
        score += 15
        
    return max(0, min(100, score))

def route_candidate_to_app(candidate: Dict[str, Any]) -> str:
    """Route candidate to the appropriate MBRN app folder."""
    desc = (str(candidate.get("description", "")) + " " + str(candidate.get("name", ""))).lower()
    
    if any(k in desc for k in ["finance", "money", "budget", "invoice", "stock", "portfolio"]):
        return "finance"
    if any(k in desc for k in ["habit", "focus", "streak", "discipline", "time", "goal", "tracker"]):
        return "chronos"
    if any(k in desc for k in ["numerology", "archetype", "name", "date", "birthday", "destiny"]):
        return "numerology"
    if any(k in desc for k in ["cockpit", "dashboard", "system", "orchestrator", "local-llm", "pm2"]):
        return "hub"
        
    return "automation"

def _github_repo_heuristic_score(repo: Dict[str, Any]) -> float:
    """Score 0-100 based on stars, forks and recency."""
    stars = int(repo.get("stargazers_count") or 0)
    forks = int(repo.get("forks_count") or 0)
    pushed_at = _parse_github_time(str(repo.get("pushed_at") or ""))
    updated_at = _parse_github_time(str(repo.get("updated_at") or ""))
    ref_time = pushed_at or updated_at

    # Stars/Forks: log scaling (better spread for typical GitHub numbers)
    #  - 10 stars  => ~30
    #  - 100 stars => ~60
    #  - 1000+     => capped
    stars_score = min(70.0, math.log10(stars + 1) * 30.0)
    forks_score = min(20.0, math.log10(forks + 1) * 20.0)

    recency_score = 0.0
    if ref_time:
        age_days = (datetime.now(timezone.utc) - ref_time.astimezone(timezone.utc)).total_seconds() / 86400.0
        if age_days <= 1:
            recency_score = 20.0
        elif age_days <= 3:
            recency_score = 14.0
        elif age_days <= 7:
            recency_score = 8.0
        elif age_days <= 14:
            recency_score = 4.0

    return round(min(100.0, stars_score + forks_score + recency_score), 1)


def analyze_tool_synergy(repo_data: Dict[str, Any], readme_content: str, context: Dict[str, Any]) -> Dict[str, Any]:
    """Robust heuristic-based analysis (no LLM)."""
    score = _github_repo_heuristic_score(repo_data)
    return {
        "source": "github",
        "heuristic": {
            "stars": int(repo_data.get("stargazers_count") or 0),
            "forks": int(repo_data.get("forks_count") or 0),
            "pushed_at": repo_data.get("pushed_at"),
            "updated_at": repo_data.get("updated_at"),
        },
        "roi_score": score,
        "readme_len": len(readme_content or ""),
        "context": {
            "system_maturity": context.get("system_maturity"),
            "active_pillars": context.get("active_pillars"),
        },
    }


def calculate_roi_score_from_analysis(analysis: Dict[str, Any]) -> float:
    """Calculate weighted ROI score from analysis."""
    weights = SCOUT_CONFIG["roi_weights"]
    scalability = float(analysis.get("scalability_score", 0)) * weights["scalability"]
    maintenance = float(analysis.get("maintenance_score", 0)) * weights["maintenance"]
    uniqueness = float(analysis.get("uniqueness_score", 0)) * weights["uniqueness"]
    return round(scalability + maintenance + uniqueness, 1)


def load_existing_alphas() -> Dict[str, Any]:
    output_path = SCOUT_CONFIG["persistence"]["alphas_path"]
    if not output_path.exists():
        return {"metadata": {"version": "2.0"}, "discoveries": [], "seen_repo_ids": []}
    try:
        with open(output_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {"discoveries": [], "seen_repo_ids": []}


def load_seen_repos() -> Set[int]:
    path = SCOUT_CONFIG["persistence"]["seen_repos_path"]
    if not path.exists():
        # Migration check: see if they are in scout_alphas.json
        alphas = load_existing_alphas()
        return set(alphas.get("seen_repo_ids", []))
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        return set(data) if isinstance(data, list) else set()
    except Exception:
        return set()


def save_seen_repos(seen_ids: Set[int]) -> bool:
    path = SCOUT_CONFIG["persistence"]["seen_repos_path"]
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        save_json_atomic(path, sorted(list(seen_ids)))
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


def _backfill_marker_path() -> Path:
    return SCOUT_CONFIG["persistence"]["alpha_vault_root"] / ".last_backfill"


def _backfill_ran_today() -> bool:
    marker = _backfill_marker_path()
    if not marker.exists():
        return False
    try:
        content = marker.read_text(encoding="utf-8").strip()
    except Exception:
        return False
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    return content == today


def _touch_backfill_marker() -> None:
    marker = _backfill_marker_path()
    try:
        marker.parent.mkdir(parents=True, exist_ok=True)
        marker.write_text(datetime.now(timezone.utc).strftime("%Y-%m-%d"), encoding="utf-8")
    except Exception:
        # Silent: marker is only an optimization
        return


def backfill_alpha_vault_from_evolution_plan(max_entries: int = 10) -> int:
    """Backfill Alpha Vault from evolution plan.

    Safety:
    - Runs at most once per UTC day (marker file)
    - Processes at most `max_entries` entries per run
    - Silent skips (no spam logs when entries already exist)
    """
    if _backfill_ran_today():
        return 0

    entries = load_evolution_plan()
    threshold = SCOUT_CONFIG["thresholds"]["alpha_vault_score_min"]

    processed = 0
    for entry in entries:
        if processed >= max_entries:
            break
        if float(entry.get("roi_score", 0)) < threshold:
            continue

        repo = {
            "full_name": entry.get("tool_name"),
            "html_url": entry.get("repo_metadata", {}).get("url"),
        }
        analysis = {
            "pillar_alignment": entry.get("synergy_point"),
            "category": entry.get("category"),
            "roi_score": entry.get("roi_score"),
            "concrete_benefit": entry.get("concrete_benefit"),
            "analysis_details": entry.get("analysis_details"),
        }

        created = write_alpha_vault_entry(repo, analysis, "")
        if created is not None:
            processed += 1

    _touch_backfill_marker()
    if processed > 0:
        log("INFO", f"Backfill created {processed} new Alpha Vault entries (throttled)")
    return processed


def _factory_module_exists(source_file: str) -> bool:
    if not source_file:
        return True
    try:
        with get_db() as conn:
            row = conn.execute(
                "SELECT 1 FROM factory_modules WHERE source_file = ? LIMIT 1",
                (source_file,),
            ).fetchone()
            return row is not None
    except Exception:
        return False


def _insert_factory_module_ready(
    *,
    name: str,
    dimension: str,
    source_file: str,
    score: float,
    raw_data: Dict[str, Any],
) -> None:
    if not name or not source_file:
        return
    if dimension not in CANONICAL_DIMENSIONS:
        dimension = "systeme"

    # v5.7 Alpha Flood: Also write to landing zone for pipeline flow
    ready_dir = _PROJECT_ROOT / "docs" / "S3_Data" / "outputs" / "factory_ready"
    ready_dir.mkdir(parents=True, exist_ok=True)
    
    safe_name = re.sub(r"[^a-zA-Z0-9_-]", "_", name).lower()
    file_path = ready_dir / f"{safe_name}_module.py"
    
    # Construct Proxy Code with MBRN_MODULE_META
    meta_header = [
        '"""',
        '# MBRN_MODULE_META',
        f'# name: {name}',
        f'# source_url: {source_file}',
        f'# app: {raw_data.get("app", "automation")}',
        f'# dimension: {dimension}',
        f'# roi_score: {raw_data.get("roi_score", score)}',
        f'# money_score: {raw_data.get("money_score", 0)}',
        f'# combined_score: {score}',
        f'# risk: {raw_data.get("risk", "medium")}',
        f'# category_tags: {json.dumps(raw_data.get("category_tags", []))}',
        f'# why_mvp: {raw_data.get("why_mvp", "N/A")}',
        f'# why_trash: {raw_data.get("why_trash", "N/A")}',
        f'# suggested_use: {raw_data.get("suggested_use", "Automatic discovery.")}',
        f'# reason: {raw_data.get("reason", "Accepted by Alpha Flood.")}',
        f'# manufactured_at: {datetime.now(timezone.utc).isoformat()}',
        f'# source_type: {raw_data.get("source_type", "discovery")}',
        f'# is_test: {raw_data.get("is_test", False)}',
        '"""',
        '',
        'def main():',
        '    # Proxy module generated by Horizon Scout Alpha Flood',
        f'    print("MBRN Utility Engine: {name}")',
        '',
        'if __name__ == "__main__":',
        '    main()',
        ''
    ]
    
    try:
        file_path.write_text("\n".join(meta_header), encoding="utf-8")
        log("INFO", f"Alpha Flood Proxy written: {file_path.name}")
    except Exception as exc:
        log("WARN", f"Failed to write proxy file: {exc}")

    try:
        with get_db() as conn:
            conn.execute(
                """
                INSERT OR IGNORE INTO factory_modules (
                    name, dimension, source_file, status, quality_score, is_elite, curation_status, raw_data, updated_at
                ) VALUES (
                    ?, ?, ?, 'ready', ?, ?, 'auto', ?, datetime('now')
                )
                """,
                (
                    name,
                    dimension,
                    source_file,
                    float(score or 0.0),
                    1 if float(score or 0.0) >= 85.0 else 0,
                    json.dumps(raw_data, ensure_ascii=False, sort_keys=True),
                ),
            )
    except Exception as exc:
        log("WARN", f"Factory module insert failed: {exc}")


def get_processed_today() -> Set[str]:
    """Get set of repo URLs processed today (for duplicate prevention)."""
    from shared.core.db import get_db
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    processed = set()
    try:
        with get_db() as conn:
            rows = conn.execute(
                "SELECT DISTINCT source_url FROM scout_alphas WHERE DATE(updated_at) = ?",
                (today,)
            ).fetchall()
            processed = {row['source_url'] for row in rows if row['source_url']}
            
            # Also check factory_modules for today
            rows = conn.execute(
                "SELECT DISTINCT source_file FROM factory_modules WHERE DATE(updated_at) = ?",
                (today,)
            ).fetchall()
            processed.update({row['source_file'] for row in rows if row['source_file']})
    except Exception as exc:
        log("WARN", f"Could not load today's processed items: {exc}")
    return processed


def run_synergy_patrol(context: Dict[str, Any], keywords: List[str]) -> Tuple[int, int]:
    log("INFO", f"=== INFINITE SYNERGY SCOUT PATROL STARTED (Keywords: {keywords}) ===")
    seen_repo_ids = load_seen_repos()
    processed_today = get_processed_today()
    repos = scan_github_trending(keywords)
    if not repos:
        return 0, 0
    
    new_discoveries = 0
    repos_analyzed = 0
    
    scored_repos: List[Tuple[float, Dict[str, Any]]] = []
    for repo in repos:
        scored_repos.append((_github_repo_heuristic_score(repo), repo))
    scored_repos.sort(key=lambda item: item[0], reverse=True)

    max_writes = SCOUT_CONFIG["thresholds"]["max_candidates_per_cycle"]

    for score, repo in scored_repos:
        if should_stop_scout():
            break
            
        repo_id = repo.get("id")
        repo_name = repo.get("full_name")
        repo_url = repo.get("html_url", "")
        
        if not isinstance(repo_id, int) or repo_id in seen_repo_ids:
            continue
            
        if repo_url in processed_today or _factory_module_exists(repo_url):
            seen_repo_ids.add(repo_id)
            save_seen_repos(seen_repo_ids)
            continue
            
        log("INFO", f"Analyzing: {repo_name}")
        readme_raw = ""
        # extract_readme takes path, but here we only have the name for now. 
        # In a real scout, we might fetch content. For now, keep it simple.
        
        money_score = calculate_money_score(repo)
        mbrn_fit_score = calculate_mbrn_fit_score(repo)
        roi_score = float(score)
        
        # Combined Score Formula v2.0 (Money-First)
        combined_score = round(
            float(money_score or 0) * 0.60 +
            float(roi_score or 0) * 0.30 +
            float(mbrn_fit_score or 0) * 0.10
        )
        combined_score = int(max(0, min(100, combined_score)))
        
        # Risk assessment (Basic heuristic)
        risk = "low"
        if any(k in str(repo.get("description", "")).lower() for k in ["unstable", "beta", "experimental", "heavy"]):
            risk = "medium"
        if combined_score < 40:
            risk = "high"

        app_route = route_candidate_to_app(repo)
        
        # Acceptance logic
        is_roi_candidate = False
        if roi_score >= SCOUT_CONFIG["thresholds"]["roi_score_min"]:
            is_roi_candidate = True
            
        is_money_candidate = SCOUT_CONFIG["modes"]["money_mode"] and money_score >= SCOUT_CONFIG["thresholds"]["money_score_min"]
        is_high_relevance = mbrn_fit_score >= 70
        
        if is_money_candidate or is_roi_candidate or is_high_relevance or SCOUT_CONFIG["modes"]["alpha_flood"]:
            target_dim = get_priority_dimension()
            
            # Enrich for Diamond Farming Mode v5.7
            combined_text = (repo.get("name", "") + " " + (repo.get("description") or "") + " " + readme_raw).lower()
            
            enriched_data = {
                "name": repo_name,
                "source_url": repo_url,
                "app": app_route,
                "dimension": target_dim,
                "roi_score": roi_score,
                "money_score": money_score,
                "mbrn_fit_score": mbrn_fit_score,
                "combined_score": combined_score,
                "risk": risk,
                "category_tags": get_category_tags(combined_text),
                "why_mvp": get_mvp_reasoning(repo),
                "why_trash": get_trash_warning(repo),
                "suggested_use": repo.get("description", "No suggested use."),
                "reason": f"Combined Score: {combined_score}. Fit: {mbrn_fit_score}.",
                "manufactured_at": datetime.now(timezone.utc).isoformat(),
                "source_type": "github_discovery",
                "mode_flags": {
                    "alpha_flood": SCOUT_CONFIG["modes"]["alpha_flood"],
                    "money_mode": SCOUT_CONFIG["modes"]["money_mode"]
                }
            }

            # Write directly to factory_modules (ready)
            _insert_factory_module_ready(
                name=repo_name,
                dimension=target_dim,
                source_file=repo_url,
                score=combined_score,
                raw_data=enriched_data,
            )

            log("OK", f"Candidate accepted: {repo_name} | Combined={combined_score} | App={app_route}")
            new_discoveries += 1
            processed_today.add(repo_url)

            if new_discoveries >= max_writes:
                break
            
        seen_repo_ids.add(repo_id)
        save_seen_repos(seen_repo_ids)
        repos_analyzed += 1
        
    return new_discoveries, repos_analyzed


def scan_hackernews_top(limit: int = 30) -> List[Dict[str, Any]]:
    """Fetch top stories from HackerNews API."""
    try:
        req = urllib.request.Request(
            "[https://hacker-news.firebaseio.com/v0/topstories.json](https://hacker-news.firebaseio.com/v0/topstories.json)",
            headers={"User-Agent": "MBRN-Horizon-Scout/1.0"},
            method="GET",
        )
        with urllib.request.urlopen(req, timeout=15) as response:
            story_ids = json.loads(response.read().decode("utf-8"))
    except Exception:
        return []

    stories: List[Dict[str, Any]] = []
    for story_id in (story_ids or [])[: max(0, int(limit))]:
        try:
            req = urllib.request.Request(
                f"[https://hacker-news.firebaseio.com/v0/item/](https://hacker-news.firebaseio.com/v0/item/){story_id}.json",
                headers={"User-Agent": "MBRN-Horizon-Scout/1.0"},
                method="GET",
            )
            with urllib.request.urlopen(req, timeout=10) as response:
                story = json.loads(response.read().decode("utf-8"))
            if story and story.get("type") == "story":
                stories.append(story)
            time.sleep(0.25)
        except Exception:
            continue
    return stories


def _hn_story_score(story: Dict[str, Any]) -> float:
    # Requirement: (Upvotes * 2) + Kommentare
    points = int(story.get("score") or 0)
    comments = int(story.get("descendants") or 0)
    raw = (points * 2) + comments
    # Normalize to 0-100-ish so threshold 60 is meaningful
    return round(min(100.0, raw / 10.0), 1)


def harvest_hackernews_alphas(context: Dict[str, Any], max_writes: int = 3, threshold: float = 60.0) -> int:
    """Fetch HackerNews top stories and persist a few as raw alphas."""
    processed_today = get_processed_today()
    stories = scan_hackernews_top(limit=30)
    if not stories:
        return 0

    scored: List[Tuple[float, Dict[str, Any]]] = []
    for story in stories:
        scored.append((_hn_story_score(story), story))
    scored.sort(key=lambda item: item[0], reverse=True)

    writes = 0
    for score, story in scored:
        if writes >= max_writes:
            break
        if should_stop_scout():
            break

        story_id = story.get("id")
        if not story_id:
            continue
        url = str(story.get("url") or f"[https://news.ycombinator.com/item?id=](https://news.ycombinator.com/item?id=){story_id}")

        # Dedup against DB
        if url in processed_today or _factory_module_exists(url):
            continue

        if float(score or 0.0) < threshold:
            continue

        title = str(story.get("title") or "HackerNews Story").strip()
        target_dim = get_priority_dimension()

        analysis = {
            "source": "hackernews",
            "hn_id": story_id,
            "title": title,
            "url": url,
            "points": int(story.get("score") or 0),
            "comments": int(story.get("descendants") or 0),
            "roi_score": float(score),
            "context": {
                "system_maturity": context.get("system_maturity"),
                "active_pillars": context.get("active_pillars"),
            },
        }

        upsert_scout_alpha(
            source_url=url,
            title=f"HN: {title}",
            score=float(score),
            dimension=target_dim,
            raw_data=analysis,
            status="ready",
        )

        _insert_factory_module_ready(
            name=f"HN: {title}",
            dimension=target_dim,
            source_file=url,
            score=float(score),
            raw_data={"story": story, "analysis": analysis, "source_type": "hackernews"},
        )

        log("OK", f"Alpha ready: HN {title} | Score={score}")
        processed_today.add(url)
        writes += 1

    return writes


def run_dev_seed():
    """DEV_ONLY_SEED_MODE: Create synthetic candidates for pipeline testing."""
    log("INFO", "DEV_ONLY_SEED_MODE: Planting synthetic candidates...")
    seeds = [
        {"name": "test-finance-tool", "desc": "SaaS finance calculator for MBRN", "app": "finance"},
        {"name": "test-habit-tracker", "desc": "Local-first habit tracker for chronos", "app": "chronos"},
        {"name": "test-ai-assistant", "desc": "Local LLM automation assistant", "app": "hub"}
    ]
    for seed in seeds:
        target_dim = get_priority_dimension()
        enriched_data = {
            "name": seed["name"],
            "source_url": f"dev_seed://{seed['name']}",
            "app": seed["app"],
            "dimension": target_dim,
            "roi_score": 85,
            "money_score": 90,
            "mbrn_fit_score": 95,
            "combined_score": 89,
            "risk": "low",
            "suggested_use": seed["desc"],
            "reason": "Synthetic candidate for pipeline verification",
            "manufactured_at": datetime.now(timezone.utc).isoformat(),
            "source_type": "dev_seed",
            "is_test": True,
            "mode_flags": {"alpha_flood": True, "money_mode": True}
        }
        _insert_factory_module_ready(
            name=f"SEED: {seed['name']}",
            dimension=target_dim,
            source_file=enriched_data["source_url"],
            score=89,
            raw_data=enriched_data
        )
    log("OK", "Dev seeds planted.")

def run_infinite_synergy_loop():
    show_v5_banner()
    log("INFO", "AUTONOMOUS HARVESTING LOOP INITIATED")
    if SCOUT_CONFIG["modes"]["dev_seed_mode"]:
        run_dev_seed()
        
    iteration = 0
    while True:
        iteration += 1
        if should_stop_scout():
            break
        control = load_factory_control()
        if control.get("scout_status") == "paused":
            log("WARN", f"Factory control paused Scout. Sleeping {SCOUT_PAUSE_SECONDS // 60} minutes...")
            time.sleep(SCOUT_PAUSE_SECONDS)
            continue
        log("INFO", f"ITERATION #{iteration} starting...")
        try:
            # Alpha Flood: Sample from ALL keyword groups
            gh = SCOUT_CONFIG["github"]
            keyword_pool = gh["keywords"] + gh["money_keywords"] + gh["tech_keywords"] + gh["mbrn_fit_keywords"]
            
            num_to_pick = random.randint(3, 6) if SCOUT_CONFIG["modes"]["alpha_flood"] else 2
            selected_keywords = random.sample(keyword_pool, min(len(keyword_pool), num_to_pick))
            
            context = load_kanon_context()
            gh_alphas, analyzed = run_synergy_patrol(context, selected_keywords)

            log("OK", f"Iteration #{iteration} complete: {gh_alphas} alphas found")
        except Exception as exc:
            log("ERROR", f"Iteration #{iteration} failed: {exc}")

        log("INFO", "All sources checked. System resting for 10 minutes...")
        time.sleep(600)


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--single", action="store_true")
    parser.add_argument("--infinite", action="store_true", help="Run in infinite loop (default)")
    args = parser.parse_args()
    load_pipeline_env(PIPELINES_DIR / ".env")
    if args.single:
        if SCOUT_CONFIG["modes"]["dev_seed_mode"]:
            run_dev_seed()
        all_keywords = SCOUT_CONFIG["github"]["keywords"]
        selected = random.sample(all_keywords, min(len(all_keywords), 2))
        run_synergy_patrol(load_kanon_context(), selected)
    else:
        run_infinite_synergy_loop()