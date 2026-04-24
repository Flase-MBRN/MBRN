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

from bridges.local_llm.bridge import LocalLLMBridge

# =============================================================================
# Local Pipeline Utils
# =============================================================================
PIPELINES_DIR = Path(__file__).resolve().parent
if str(PIPELINES_DIR) not in sys.path:
    sys.path.append(str(PIPELINES_DIR))

from pipeline_utils import load_pipeline_env, log, save_json_atomic

# =============================================================================
# INFINITE SYNERGY SCOUT CONFIGURATION v2.0
# =============================================================================
SCOUT_CONFIG = {
    "github": {
        "search_url": "https://api.github.com/search/repositories",
        "keywords": [
            "ai",
            "agent",
            "automation",
            "llm",
            "micro-saas",
            "vanilla-js-ui",
            "modern-dashboard-components",
            "passive-income-automation",
            "micro-saas-templates",
            "ai-agent-frameworks",
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
        "cooldown_minutes": 15,  # 15-min cooldown for RX 7700 XT
        "kill_switch_file": "STOP_SCOUT",
    },
    "roi_weights": {
        "scalability": 0.50,    # Prio 1: 500k€ leverage potential
        "maintenance": 0.30,    # Prio 2: Solo operation = low maintenance critical
        "uniqueness": 0.20,     # Prio 3: Market gap
    },
    "thresholds": {
        "roi_score_min": 85,    # Hard filter: only > 85 passes
    },
    "persistence": {
        "alphas_path": _PROJECT_ROOT / "shared" / "data" / "scout_alphas.json",
        "evolution_path": _PROJECT_ROOT / "shared" / "data" / "mbrn_evolution_plan.json",
        "alpha_vault_root": _PROJECT_ROOT / "shared" / "alphas",
    },
    "context_sources": {
        "kanon": _PROJECT_ROOT / "000_CANONICAL_STATE.json",
        "manifest": _PROJECT_ROOT / "000_MBRN_BUSINESS_PLAN.md",  # Optional
    },
    "mbrn": {
        "scout_id": "infinite_synergy_scout_v2",
        "source": "github_discovery",
    }
}

# Synergy Analysis Prompt Template v2.0 - Context-Aware
_LEGACY_SYNERGY_ANALYSIS_PROMPT = """Analysiere, ob dieses Projekt MBRN auf das Level einer 500kEUR-Organisation hebt.

TOOL INFORMATION:
{repo_info}

README CONTENT:
{readme_content}

MBRN ARCHITECTURE CONTEXT:
- Active Pillars: {active_pillars}
- Available Bridges: {available_bridges}
- System State: {system_maturity}

Bewertungspunkte:
- Frontend-Upgrade: Macht es das Dashboard sexy und premium?
- Core-Power: Macht es die KI-Architektur schneller/autonomer?
- Market-Gap: Eignet es sich als Micro-SaaS fuer passives Einkommen?

Analyze for:
1. PILLAR ALIGNMENT: Which pillar benefits most? (frontend_os|oracle|monetization|meta_generator|none)
2. CONCRETE BENEFIT: How does it make us faster/better? (max 140 chars)
3. INTEGRATION PATH: Effort (low|medium|high) + concrete implementation steps
4. SCALABILITY: Score 1-100 (leverage for 500k€ revenue target?)
5. MAINTENANCE: Score 1-100 (low effort = high score, solo operation critical)
6. UNIQUENESS: Score 1-100 (market gap, differentiation potential)

Return ONLY valid JSON:
{{
  "pillar_alignment": "<pillar_name or 'none'>",
  "concrete_benefit": "<max 140 chars>",
  "integration_path": "<low|medium|high>: <concrete steps>",
  "scalability_score": <1-100>,
  "maintenance_score": <1-100>,
  "uniqueness_score": <1-100>,
  "synergy_summary": "<one sentence why this matters for MBRN>"
}}

Rules:
- scalability_score: 100 = massive leverage for 500k€ target
- maintenance_score: 100 = zero-touch, fully autonomous
- uniqueness_score: 100 = blue ocean, no competitors
- synergy_summary: max 100 chars, explain the "why"
"""

SYNERGY_ANALYSIS_PROMPT = """Analysiere, ob dieses Projekt MBRN auf das Level einer 500kEUR-Organisation hebt.

TOOL INFORMATION:
{repo_info}

README CONTENT:
{readme_content}

MBRN ARCHITECTURE CONTEXT:
- Active Pillars: {active_pillars}
- Available Bridges: {available_bridges}
- System State: {system_maturity}

Bewertungspunkte:
- Frontend-Upgrade: Macht es das Dashboard sexy und premium?
- Core-Power: Macht es die KI-Architektur schneller/autonomer?
- Market-Gap: Eignet es sich als Micro-SaaS fuer passives Einkommen?

Analyze for:
1. PILLAR ALIGNMENT: Which pillar benefits most? (frontend_os|oracle|monetization|meta_generator|none)
2. CATEGORY: Vault category (frontend|core_logic|passive_income)
3. CONCRETE BENEFIT: How does it make us faster/better? (max 140 chars)
4. INTEGRATION PATH: Effort (low|medium|high) + concrete implementation steps
5. RECOMMENDED EVOLUTION: What must the Architect do today to integrate it?
6. ESTIMATED INTEGRATION DURATION: Short duration estimate, e.g. "2-4 hours"
7. READY SNIPPET: Optional short useful JS/Python code snippet, otherwise empty string
8. SCALABILITY: Score 1-100 (leverage for 500kEUR revenue target?)
9. MAINTENANCE: Score 1-100 (low effort = high score, solo operation critical)
10. UNIQUENESS: Score 1-100 (market gap, differentiation potential)

Return ONLY valid JSON:
{{
  "pillar_alignment": "<pillar_name or 'none'>",
  "category": "<frontend|core_logic|passive_income>",
  "concrete_benefit": "<max 140 chars>",
  "integration_path": "<low|medium|high>: <concrete steps>",
  "recommended_evolution": "<what the Architect must do today>",
  "estimated_integration_duration": "<duration estimate>",
  "ready_snippet": "<optional short JS or Python snippet, otherwise empty string>",
  "scalability_score": <1-100>,
  "maintenance_score": <1-100>,
  "uniqueness_score": <1-100>,
  "synergy_summary": "<one sentence why this matters for MBRN>"
}}

Rules:
- scalability_score: 100 = massive leverage for 500kEUR target
- maintenance_score: 100 = zero-touch, fully autonomous
- uniqueness_score: 100 = blue ocean, no competitors
- category must be exactly one of frontend, core_logic, passive_income
- synergy_summary: max 100 chars, explain the "why"
"""


# =============================================================================
# CONTEXT-SYNERGY ENGINE: Load MBRN Architecture State
# =============================================================================
def load_kanon_context() -> Dict[str, Any]:
    """Load 000_CANONICAL_STATE.json for architecture-aware analysis."""
    kanon_path = SCOUT_CONFIG["context_sources"]["kanon"]
    
    try:
        with open(kanon_path, "r", encoding="utf-8") as f:
            kanon = json.load(f)
        
        # Extract active pillars
        pillars = kanon.get("pillars", {})
        active_pillars = [name for name, data in pillars.items() if data.get("state") == "active"]
        
        # Extract available bridges
        bridges = kanon.get("bridges", {})
        available_bridges = [name for name, data in bridges.items() if data.get("state") in ["active", "implemented"]]
        
        # Determine system maturity
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
        # Fallback to defaults
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
        # Extract first 2000 chars as context (avoid token overflow)
        return content[:2000] if len(content) > 2000 else content
    except Exception as exc:
        log("WARN", f"Failed to load Manifest: {exc}")
        return None


# =============================================================================
# ROI CALCULATION ENGINE
# =============================================================================
def calculate_roi_score(analysis: Dict[str, Any]) -> Tuple[float, str]:
    """
    Calculate weighted ROI score based on:
    - Scalability: 50% (Prio 1: 500k€ leverage)
    - Maintenance: 30% (Prio 2: solo operation)
    - Uniqueness: 20% (Prio 3: market gap)
    
    Returns:
        Tuple of (roi_score, rationale)
    """
    weights = SCOUT_CONFIG["roi_weights"]
    
    scalability = float(analysis.get("scalability_score", 0))
    maintenance = float(analysis.get("maintenance_score", 0))
    uniqueness = float(analysis.get("uniqueness_score", 0))
    
    # Weighted calculation
    roi_score = (
        (scalability * weights["scalability"]) +
        (maintenance * weights["maintenance"]) +
        (uniqueness * weights["uniqueness"])
    )
    
    # Generate rationale
    if roi_score >= 90:
        rationale = "Exceptional: High leverage + low maintenance + market leader"
    elif roi_score >= 85:
        rationale = "Strong ROI: Good balance across all criteria"
    elif roi_score >= 70:
        rationale = "Moderate: Viable but not exceptional"
    else:
        rationale = "Weak: Lacks leverage or requires too much maintenance"
    
    return round(roi_score, 1), rationale


ALPHA_VAULT_CATEGORIES = ("frontend", "core_logic", "passive_income")
SNIPPET_BLOCK_RE = re.compile(r"```(?P<lang>[A-Za-z0-9_+-]*)\s*\n(?P<body>.*?)```", re.DOTALL)


def sanitize_tool_name(tool_name: str) -> str:
    """Create a stable filesystem-safe folder suffix for alpha vault entries."""
    normalized = re.sub(r"[^A-Za-z0-9._-]+", "_", tool_name.strip().replace("/", "_"))
    normalized = normalized.strip("._-")
    return normalized[:80] or "unknown_tool"


def normalize_alpha_category(analysis: Dict[str, Any], repo: Dict[str, Any] | None = None) -> str:
    """Map LLM/category signals into the three approved Alpha Vault categories."""
    raw_category = str(analysis.get("category", "")).strip().lower()
    if raw_category in ALPHA_VAULT_CATEGORIES:
        return raw_category

    pillar = str(analysis.get("pillar_alignment", "")).strip().lower()
    combined = " ".join(
        [
            raw_category,
            pillar,
            str(analysis.get("integration_path", "")),
            str(analysis.get("recommended_evolution", "")),
            str(analysis.get("concrete_benefit", "")),
            str((repo or {}).get("description", "")),
            str((repo or {}).get("language", "")),
        ]
    ).lower()

    if pillar == "frontend_os" or any(token in combined for token in ("frontend", "dashboard", "ui", "component", "vanilla-js")):
        return "frontend"
    if pillar == "monetization" or any(token in combined for token in ("micro-saas", "passive", "income", "stripe", "subscription", "revenue")):
        return "passive_income"
    return "core_logic"


def ensure_alpha_vault_structure() -> None:
    """Ensure the canonical Alpha Vault category directories exist."""
    vault_root = SCOUT_CONFIG["persistence"]["alpha_vault_root"]
    for category in ALPHA_VAULT_CATEGORIES:
        (vault_root / category).mkdir(parents=True, exist_ok=True)


def choose_snippet_extension(repo: Dict[str, Any], snippet: str) -> str:
    """Choose a snippet extension from language metadata and snippet syntax."""
    language = str(repo.get("language") or "").strip().lower()
    snippet_head = snippet[:400].lower()
    if language in {"javascript", "typescript"} or any(token in snippet_head for token in ("const ", "let ", "function ", "export ")):
        return "js"
    return "py"


def extract_ready_snippet(analysis: Dict[str, Any], readme_content: str) -> str:
    """Prefer LLM-provided snippets, then fall back to a short README code block."""
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
    """Build the per-alpha integration guide for the Alpha Vault."""
    tool_name = repo.get("full_name", "unknown")
    repo_url = repo.get("html_url", "N/A")
    recommended_evolution = str(analysis.get("recommended_evolution") or analysis.get("integration_path") or "Review manually.")
    snippet_note = "A ready snippet is included next to this guide." if snippet_written else "No safely extractable JS/Python snippet was found."

    return "\n".join(
        [
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
            "Use the current Kanon first. Frontend findings target frontend_os/dashboard surfaces, core findings target oracle/local_llm pipeline code, and passive-income findings target monetization/productization surfaces.",
            "",
            "## How To Integrate Today",
            recommended_evolution,
            "",
            "## Ready Snippet",
            snippet_note,
            "",
        ]
    )


def write_alpha_vault_entry(repo: Dict[str, Any], analysis: Dict[str, Any], readme_content: str) -> Optional[Path]:
    """Persist an ROI > 90 alpha into the Alpha Vault."""
    ensure_alpha_vault_structure()
    category = normalize_alpha_category(analysis, repo)
    analysis["category"] = category

    date_prefix = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    tool_slug = sanitize_tool_name(str(repo.get("full_name", "unknown")))
    alpha_dir = SCOUT_CONFIG["persistence"]["alpha_vault_root"] / category / f"{date_prefix}_{tool_slug}"
    alpha_dir.mkdir(parents=True, exist_ok=True)

    snippet = extract_ready_snippet(analysis, readme_content)
    snippet_written = False
    if snippet:
        extension = choose_snippet_extension(repo, snippet)
        snippet_path = alpha_dir / f"ready_snippet.{extension}"
        snippet_path.write_text(snippet.rstrip() + "\n", encoding="utf-8")
        snippet_written = True

    guide = build_integration_guide(repo, analysis, category, snippet_written)
    (alpha_dir / "integration_guide.md").write_text(guide, encoding="utf-8")
    log("OK", f"Alpha Vault entry created: {alpha_dir}")
    return alpha_dir


def print_high_roi_alpha(repo: Dict[str, Any], analysis: Dict[str, Any]) -> None:
    """Print the exact high-ROI console format with ANSI color."""
    tool_name = repo.get("full_name", "unknown")
    reason = str(analysis.get("synergy_summary") or analysis.get("concrete_benefit") or "High ROI integration candidate.").strip()
    duration = str(analysis.get("estimated_integration_duration") or "unknown").strip()
    color = "\033[95m"
    reset = "\033[0m"
    print(f"{color}*** SYNERGY ALPHA >95% FOUND: {tool_name} ***{reset}")
    print(f"{color}Log: {reason} | Integration: {duration}{reset}")


# =============================================================================
# KILL-SWITCH MECHANISM
# =============================================================================
def should_stop_scout() -> bool:
    """Check if STOP_SCOUT file exists (graceful shutdown signal)."""
    kill_switch_path = PIPELINES_DIR / SCOUT_CONFIG["infinite_loop"]["kill_switch_file"]
    return kill_switch_path.exists()


def create_stop_signal():
    """Create STOP_SCOUT file to trigger graceful shutdown."""
    kill_switch_path = PIPELINES_DIR / SCOUT_CONFIG["infinite_loop"]["kill_switch_file"]
    try:
        kill_switch_path.touch()
        log("INFO", f"Kill switch created: {kill_switch_path}")
    except Exception as exc:
        log("WARN", f"Failed to create kill switch: {exc}")


# =============================================================================
# GITHUB DISCOVERY
# =============================================================================
def get_github_search_query() -> str:
    """Build GitHub search query for recent AI/Agent repos."""
    keywords = " OR ".join(SCOUT_CONFIG["github"]["keywords"])
    # Calculate date 7 days ago
    since_date = (datetime.now(timezone.utc) - timedelta(days=SCOUT_CONFIG["github"]["created_within_days"])).strftime("%Y-%m-%d")
    return f"({keywords}) created:>{since_date} sort:updated-desc"


def scan_github_trending() -> List[Dict[str, Any]]:
    """
    Scan GitHub for trending AI/Agent/Automation repositories.
    
    Returns:
        List of repository metadata dicts
    """
    query = get_github_search_query()
    url = f"{SCOUT_CONFIG['github']['search_url']}"
    
    # Build request with query parameters
    params = {
        "q": query,
        "sort": "updated",
        "order": "desc",
        "per_page": SCOUT_CONFIG["github"]["per_page"],
    }
    
    # Encode query string manually
    from urllib.parse import urlencode
    full_url = f"{url}?{urlencode(params)}"
    
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "MBRN-Horizon-Scout/1.0",
    }
    
    # Add GitHub token if available
    github_token = os.getenv("GITHUB_TOKEN")
    if github_token:
        headers["Authorization"] = f"token {github_token}"
    
    try:
        req = urllib.request.Request(full_url, headers=headers, method="GET")
        with urllib.request.urlopen(req, timeout=SCOUT_CONFIG["github"]["timeout_seconds"]) as response:
            data = json.loads(response.read().decode("utf-8"))
        
        repos = data.get("items", [])
        log("OK", f"GitHub scan complete: {len(repos)} repositories found")
        return repos
        
    except urllib.error.HTTPError as e:
        if e.code == 403:
            log("WARN", "GitHub API rate limit exceeded. Consider setting GITHUB_TOKEN in .env")
        else:
            log("WARN", f"GitHub API error: {e.code} - {e.reason}")
        return []
    except Exception as exc:
        log("WARN", f"GitHub scan failed: {exc}")
        return []


# =============================================================================
# README EXTRACTION
# =============================================================================
def extract_readme_via_jina(repo_url: str) -> Optional[str]:
    """
    Extract README content via jina.ai summarization service.
    
    Args:
        repo_url: Full GitHub repository URL
        
    Returns:
        README markdown content or None if extraction fails
    """
    jina_url = f"{SCOUT_CONFIG['jina']['prefix']}{repo_url}"
    
    try:
        req = urllib.request.Request(
            jina_url,
            headers={"User-Agent": "MBRN-Horizon-Scout/1.0"},
            method="GET"
        )
        with urllib.request.urlopen(req, timeout=SCOUT_CONFIG["jina"]["timeout_seconds"]) as response:
            content = response.read().decode("utf-8")
        
        # Truncate if too long (LLM context limits)
        max_chars = 8000
        if len(content) > max_chars:
            content = content[:max_chars] + "\n\n[Content truncated due to length...]"
        
        log("OK", f"README extracted via jina.ai: {len(content)} chars")
        return content
        
    except Exception as exc:
        log("WARN", f"README extraction failed for {repo_url}: {exc}")
        return None


# =============================================================================
# LLM ANALYSIS
# =============================================================================
def analyze_tool_synergy(repo_data: Dict[str, Any], readme_content: str, context: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Analyze repository synergy with MBRN architecture using Context-Synergy Engine.
    
    Args:
        repo_data: GitHub repository metadata
        readme_content: Extracted README markdown
        context: Loaded Kanon context (pillars, bridges, maturity)
        
    Returns:
        Analysis result dict with synergy scores and pillar alignment
        or None if analysis fails
    """
    bridge = LocalLLMBridge()
    
    if not bridge.is_available():
        log("WARN", "Ollama not available for LLM analysis")
        return None
    
    # Build repo info summary
    repo_info = f"""Name: {repo_data.get('full_name', 'unknown')}
Description: {repo_data.get('description', 'N/A')}
URL: {repo_data.get('html_url', 'N/A')}
Stars: {repo_data.get('stargazers_count', 0)}
Language: {repo_data.get('language', 'N/A')}
Created: {repo_data.get('created_at', 'N/A')}
Updated: {repo_data.get('updated_at', 'N/A')}"""
    
    # Build synergy prompt with context
    prompt = SYNERGY_ANALYSIS_PROMPT.format(
        repo_info=repo_info.strip(),
        readme_content=readme_content.strip()[:6000],  # Truncate for context limits
        active_pillars=", ".join(context.get("active_pillars", [])),
        available_bridges=", ".join(context.get("available_bridges", [])),
        system_maturity=context.get("system_maturity", "mixed")
    )
    
    try:
        # Execute synergy analysis
        success, result = bridge.execute_custom_prompt(
            prompt=prompt,
            required_keys=[
                "pillar_alignment", "category", "concrete_benefit", "integration_path",
                "recommended_evolution", "estimated_integration_duration",
                "scalability_score", "maintenance_score", "uniqueness_score",
                "synergy_summary"
            ],
            worker_name=f"synergy_analysis_{repo_data.get('id', 'unknown')}"
        )
        
        if not success:
            log("WARN", f"Synergy analysis failed: {result}")
            return None
        
        # Validate all scores are in range 1-100
        for score_key in ["scalability_score", "maintenance_score", "uniqueness_score"]:
            score_val = int(result.get(score_key, 0))
            if score_val < 1 or score_val > 100:
                log("WARN", f"Invalid {score_key}: {score_val}")
                return None
        
        # Calculate ROI score
        roi_score, roi_rationale = calculate_roi_score(result)
        result["roi_score"] = roi_score
        result["roi_rationale"] = roi_rationale
        result["category"] = normalize_alpha_category(result, repo_data)
        result["recommended_evolution"] = str(result.get("recommended_evolution") or result.get("integration_path") or "").strip()
        result["estimated_integration_duration"] = str(result.get("estimated_integration_duration") or "unknown").strip()
        result["ready_snippet"] = str(result.get("ready_snippet") or "").strip()
        
        log("OK", f"Synergy analysis complete: ROI={roi_score}/100 | Pillar={result.get('pillar_alignment', 'none')}")
        return result
        
    except Exception as exc:
        log("WARN", f"Synergy analysis error: {exc}")
        return None


# =============================================================================
# PERSISTENCE & EVOLUTION LOG
# =============================================================================
def load_existing_alphas() -> Dict[str, Any]:
    """Load existing scout discoveries from JSON."""
    output_path = SCOUT_CONFIG["persistence"]["alphas_path"]
    
    if not output_path.exists():
        return {
            "metadata": {
                "scout_id": SCOUT_CONFIG["mbrn"]["scout_id"],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "version": "2.0"
            },
            "discoveries": [],
            "seen_repo_ids": []
        }
    
    try:
        with open(output_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as exc:
        log("WARN", f"Failed to load existing alphas: {exc}")
        return {"discoveries": [], "seen_repo_ids": []}


def save_alphas(data: Dict[str, Any]) -> bool:
    """Save scout discoveries to JSON atomically."""
    output_path = SCOUT_CONFIG["persistence"]["alphas_path"]
    
    try:
        # Ensure directory exists
        output_path.parent.mkdir(parents=True, exist_ok=True)
        save_json_atomic(output_path, data)
        log("OK", f"Saved {len(data.get('discoveries', []))} discoveries to {output_path}")
        return True
    except Exception as exc:
        log("ERROR", f"Failed to save alphas: {exc}")
        return False


def load_evolution_plan() -> List[Dict[str, Any]]:
    """Load existing evolution plan entries."""
    evolution_path = SCOUT_CONFIG["persistence"]["evolution_path"]
    
    if not evolution_path.exists():
        return []
    
    try:
        with open(evolution_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as exc:
        log("WARN", f"Failed to load evolution plan: {exc}")
        return []


def save_evolution_entry(repo: Dict[str, Any], analysis: Dict[str, Any], context: Dict[str, Any]) -> bool:
    """
    Save validated alpha to Evolution Plan (mbrn_evolution_plan.json).
    
    Format: { "tool_name", "source", "synergy_point", "integration_strategy", "roi_score" }
    """
    evolution_path = SCOUT_CONFIG["persistence"]["evolution_path"]
    
    try:
        # Load existing entries
        entries = load_evolution_plan()
        
        # Build evolution entry
        timestamp = datetime.now(timezone.utc)
        entry = {
            "id": f"evo_{timestamp.strftime('%Y%m%d_%H%M%S')}_{repo.get('id', 'unknown')}",
            "tool_name": repo.get("full_name", "unknown"),
            "source": "github_discovery",
            "synergy_point": analysis.get("pillar_alignment", "none"),
            "category": normalize_alpha_category(analysis, repo),
            "integration_strategy": analysis.get("integration_path", "unknown"),
            "recommended_evolution": analysis.get("recommended_evolution", ""),
            "estimated_integration_duration": analysis.get("estimated_integration_duration", "unknown"),
            "roi_score": analysis.get("roi_score", 0),
            "concrete_benefit": analysis.get("concrete_benefit", ""),
            "synergy_summary": analysis.get("synergy_summary", ""),
            "discovered_at": timestamp.isoformat(),
            "repo_metadata": {
                "id": repo.get("id"),
                "url": repo.get("html_url"),
                "stars": repo.get("stargazers_count"),
                "language": repo.get("language"),
            },
            "mbrn_context_at_discovery": {
                "active_pillars": context.get("active_pillars", []),
                "available_bridges": context.get("available_bridges", []),
                "system_maturity": context.get("system_maturity", "mixed"),
            },
            "analysis_details": {
                "scalability_score": analysis.get("scalability_score"),
                "maintenance_score": analysis.get("maintenance_score"),
                "uniqueness_score": analysis.get("uniqueness_score"),
                "roi_rationale": analysis.get("roi_rationale"),
            }
        }
        
        # Append to entries
        entries.append(entry)
        
        # Ensure directory exists
        evolution_path.parent.mkdir(parents=True, exist_ok=True)
        save_json_atomic(evolution_path, entries)
        
        log("OK", f"Evolution entry saved: {entry['tool_name']} (ROI: {entry['roi_score']}/100)")
        log("INFO", f"  → Synergy Point: {entry['synergy_point']}")
        log("INFO", f"  → Benefit: {entry['concrete_benefit'][:80]}...")
        return True
        
    except Exception as exc:
        log("ERROR", f"Failed to save evolution entry: {exc}")
        return False


def is_duplicate(repo_id: int, seen_ids: List[int]) -> bool:
    """Check if repository was already processed."""
    return repo_id in seen_ids


def add_discovery(data: Dict[str, Any], repo: Dict[str, Any], analysis: Dict[str, Any]) -> Dict[str, Any]:
    """Add new discovery to the data structure."""
    repo_id = repo.get("id")
    analysis["category"] = normalize_alpha_category(analysis, repo)
    
    discovery = {
        "id": f"alpha_{repo_id}",
        "discovered_at": datetime.now(timezone.utc).isoformat(),
        "repo": {
            "id": repo_id,
            "name": repo.get("full_name"),
            "url": repo.get("html_url"),
            "description": repo.get("description"),
            "stars": repo.get("stargazers_count"),
            "language": repo.get("language"),
            "created_at": repo.get("created_at"),
        },
        "analysis": analysis,
        "mbrn_enriched": {
            "scout_version": "1.0",
            "source": SCOUT_CONFIG["mbrn"]["source"],
            "processed_at": datetime.now(timezone.utc).isoformat(),
        }
    }
    
    data["discoveries"].append(discovery)
    data["seen_repo_ids"].append(repo_id)
    
    return data


# =============================================================================
# INFINITE SYNERGY SCOUT LOOP v2.0
# =============================================================================
def run_synergy_patrol(context: Dict[str, Any]) -> Tuple[int, int]:
    """
    Execute one synergy patrol iteration with Context-Synergy Engine.
    
    Args:
        context: Loaded Kanon context (pillars, bridges, maturity)
        
    Returns:
        Tuple of (new_discoveries, repos_analyzed)
    """
    log("INFO", "=== INFINITE SYNERGY SCOUT PATROL STARTED ===")
    log("INFO", f"Context: Pillars={context.get('active_pillars')} | Bridges={context.get('available_bridges')}")
    
    # Load existing data for deduplication
    alphas_data = load_existing_alphas()
    seen_repo_ids = set(alphas_data.get("seen_repo_ids", []))
    
    # Phase 1: Discover
    repos = scan_github_trending()
    if not repos:
        log("WARN", "No repositories discovered in this patrol")
        return 0, 0
    
    new_discoveries = 0
    repos_analyzed = 0
    
    for repo in repos:
        # Check kill-switch between repos (graceful interruption)
        if should_stop_scout():
            log("INFO", "Kill switch detected. Stopping patrol gracefully.")
            break
        
        repo_id = repo.get("id")
        repo_name = repo.get("full_name", "unknown")
        
        # Phase 2: Deduplication
        if is_duplicate(repo_id, list(seen_repo_ids)):
            log("INFO", f"Skipping duplicate: {repo_name}")
            continue
        
        log("INFO", f"Analyzing: {repo_name}")
        
        # Phase 3: README Extraction
        repo_url = repo.get("html_url")
        readme = extract_readme_via_jina(repo_url)
        
        if not readme:
            log("WARN", f"Skipping {repo_name}: README extraction failed")
            seen_repo_ids.add(repo_id)  # Mark as seen to avoid re-attempt
            continue
        
        # Phase 4: Synergy Analysis (with Context)
        analysis = analyze_tool_synergy(repo, readme, context)
        repos_analyzed += 1
        
        if not analysis:
            log("WARN", f"Skipping {repo_name}: Synergy analysis failed")
            seen_repo_ids.add(repo_id)
            continue
        
        roi_score = analysis.get("roi_score", 0)
        
        # Phase 5: Hard ROI Filter (only > 85 passes)
        if roi_score >= SCOUT_CONFIG["thresholds"]["roi_score_min"]:
            log("OK", f"🎯 SYNERGY ALPHA DISCOVERED: {repo_name}")
            log("OK", f"   ROI Score: {roi_score}/100 | Pillar: {analysis.get('pillar_alignment', 'none')}")
            log("INFO", f"   Benefit: {analysis.get('concrete_benefit', 'N/A')[:100]}...")
            log("INFO", f"   Integration: {analysis.get('integration_path', 'N/A')[:80]}...")
            log("INFO", f"   Synergy: {analysis.get('synergy_summary', 'N/A')}")
            
            if roi_score > 95:
                print_high_roi_alpha(repo, analysis)

            if roi_score > 90:
                write_alpha_vault_entry(repo, analysis, readme)

            # Save to alphas log
            alphas_data = add_discovery(alphas_data, repo, analysis)
            
            # Save to evolution plan (main output)
            save_evolution_entry(repo, analysis, context)
            
            new_discoveries += 1
        else:
            log("INFO", f"Low ROI for {repo_name}: {roi_score}/100 (min: {SCOUT_CONFIG['thresholds']['roi_score_min']}) - filtered")
        
        # Mark as seen (prevents re-analysis regardless of score)
        seen_repo_ids.add(repo_id)
        alphas_data["seen_repo_ids"] = list(seen_repo_ids)
    
    # Save alphas data (deduplication tracking)
    save_alphas(alphas_data)
    
    log("INFO", f"Patrol complete: {new_discoveries} new alphas from {repos_analyzed} analyzed repos")
    return new_discoveries, repos_analyzed


def run_infinite_synergy_loop():
    """
    Run the Infinite Synergy Scout with 15-minute cooldown and kill-switch.
    Hardware-optimized for RX 7700 XT (15-min rest between LLM inferences).
    """
    log("INFO", "╔════════════════════════════════════════════════════════════╗")
    log("INFO", "║  INFINITE SYNERGY SCOUT v2.0 - AUTONOMOUS R&D SYSTEM       ║")
    log("INFO", "╠════════════════════════════════════════════════════════════╣")
    log("INFO", "║  Cooldown: 15 minutes (hardware-friendly)                ║")
    log("INFO", "║  ROI Threshold: >85 (Hard Filter)                         ║")
    log("INFO", "║  Kill-Switch: Create 'STOP_SCOUT' file to exit            ║")
    log("INFO", "║  Evolution Log: shared/data/mbrn_evolution_plan.json       ║")
    log("INFO", "╚════════════════════════════════════════════════════════════╝")
    
    iteration = 0
    
    while True:
        iteration += 1
        start_time = datetime.now(timezone.utc)
        
        log("INFO", f"\n🔄 ITERATION #{iteration} started at {start_time.strftime('%H:%M:%S')}")
        
        # Check kill-switch at start of each iteration
        if should_stop_scout():
            log("INFO", "🛑 Kill switch detected. Infinite Synergy Scout shutting down gracefully.")
            log("INFO", "   Remove STOP_SCOUT file to restart.")
            break
        
        try:
            # Load fresh context for each iteration (architecture may evolve)
            context = load_kanon_context()
            manifest = load_manifest_context()
            if manifest:
                log("INFO", f"📋 Manifest loaded: {len(manifest)} chars of vision context")
            
            # Execute synergy patrol
            new_alphas, analyzed = run_synergy_patrol(context)
            
            # Log iteration summary
            duration = (datetime.now(timezone.utc) - start_time).total_seconds()
            log("OK", f"✅ Iteration #{iteration} complete: {new_alphas} alphas, {analyzed} repos, {duration:.1f}s")
            
        except Exception as exc:
            log("ERROR", f"❌ Iteration #{iteration} failed: {exc}")
        
        # Check kill-switch before cooldown
        if should_stop_scout():
            log("INFO", "🛑 Kill switch detected. Exiting before cooldown.")
            break
        
        # 15-minute cooldown (RX 7700 XT hardware protection)
        cooldown_seconds = SCOUT_CONFIG["infinite_loop"]["cooldown_minutes"] * 60
        cooldown_minutes = SCOUT_CONFIG["infinite_loop"]["cooldown_minutes"]
        
        log("INFO", f"⏱️  Cooldown: {cooldown_minutes} minutes (hardware rest)...")
        
        # Sleep in chunks to allow responsive kill-switch checking
        sleep_chunk = 10  # Check every 10 seconds
        remaining = cooldown_seconds
        
        while remaining > 0:
            if should_stop_scout():
                log("INFO", "🛑 Kill switch detected during cooldown. Exiting.")
                return
            
            sleep_time = min(sleep_chunk, remaining)
            time.sleep(sleep_time)
            remaining -= sleep_time
        
        log("INFO", f"⏱️  Cooldown complete. Starting iteration #{iteration + 1}...")


def run_single_patrol_legacy():
    """Legacy single patrol mode (for testing/backward compatibility)."""
    log("INFO", "Running single patrol (legacy mode)...")
    context = load_kanon_context()
    return run_synergy_patrol(context)


# =============================================================================
# ENTRY POINT
# =============================================================================
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Infinite Synergy Scout v2.0 - Autonomous R&D Discovery System for MBRN"
    )
    parser.add_argument(
        "--single", 
        action="store_true", 
        help="Run single patrol and exit (testing mode)"
    )
    parser.add_argument(
        "--infinite", 
        action="store_true", 
        help="Run in infinite loop with 15-min cooldown (default mode)"
    )
    parser.add_argument(
        "--stop",
        action="store_true",
        help="Create STOP_SCOUT kill-switch file"
    )
    
    args = parser.parse_args()
    
    # Load environment
    load_pipeline_env(PIPELINES_DIR / ".env")
    
    if args.stop:
        # Create kill-switch and exit
        create_stop_signal()
        log("INFO", "Stop signal created. Scout will exit gracefully.")
    elif args.single:
        # Single patrol mode (for testing)
        run_single_patrol_legacy()
    else:
        # Default: Infinite Synergy Loop
        run_infinite_synergy_loop()
