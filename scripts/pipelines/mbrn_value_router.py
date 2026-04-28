import os
import json
import logging
import re
import time
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, Any, Optional

# --- Configuration ---
LOG_FILE = "logs/mbrn_value_router.log"
OUTPUT_ROOT = Path("docs/S3_Data/outputs")
READY_DIR = OUTPUT_ROOT / "factory_ready"
REJECTED_DIR = OUTPUT_ROOT / "rejected"
QUEUE_DIR = OUTPUT_ROOT / "integration_queue"

# CANONICAL DIMENSION MAPPING (Strict v3 Nomenclature)
DIMENSION_MAPPING = {
    "geld": "finance",
    "zeit": "chronos",
    "muster": "numerology",
    "netzwerk": "hub",
    "systeme": "automation",
    "physis": "hub",
    "geist": "hub",
    "energie": "hub",
    "raum": "hub",
    "wachstum": "discipline"
}

# --- Logging ---
os.makedirs("logs", exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [ROUTER] %(levelname)s - %(message)s',
    datefmt="%Y-%m-%dT%H:%M:%S",
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler()
    ]
)
log = logging.getLogger("mbrn_value_router")

def extract_meta_from_code(code: str) -> Dict[str, str]:
    """Extract MBRN_MODULE_META from python file comments."""
    meta = {}
    pattern = r"# (\w+): (.*)"
    matches = re.findall(pattern, code)
    for key, value in matches:
        meta[key] = value.strip()
    return meta

def evaluate_value_v11(code: str, meta: Dict[str, Any]) -> Dict[str, Any]:
    """
    MBRN Value Scoring v1.11.0 (Rule-Based Hardened)
    Moving from 'AI feeling' to deterministic logic checks.
    """
    # 1. Hard Logic Checks
    has_class = "class " in code.lower()
    func_count = code.count("def ") - 1 # discount main
    has_recommendations = "\"recommendations\":" in code.lower()
    logic_density = len(code) / max(1, func_count)
    
    # 2. Heuristic Indicators
    solves_real_problem = has_class or func_count >= 5
    has_actionable_output = has_recommendations and len(code) > 2000
    standalone_compliance = "if __name__ == \"__main__\":" in code
    
    # 3. Rule-Based Scoring
    utility_score = 0
    if solves_real_problem: utility_score += 40
    if has_actionable_output: utility_score += 40
    if standalone_compliance: utility_score += 20
    
    reusability_score = 0
    if has_class: reusability_score += 50
    if func_count > 3: reusability_score += 30
    if "import json" in code: reusability_score += 20
    
    monetization_score = float(meta.get("roi_score", 50))
    
    # v5.7 Alpha Flood Bypass: If scout already scored this high, trust it
    scout_score = float(meta.get("combined_score", 0))
    source_type = meta.get("source_type", "unknown")
    
    if scout_score >= 60 and (source_type in ["github_discovery", "dev_seed", "hackernews"]):
        log.info(f"Alpha Flood Trust: Using Scout Score {scout_score}% for {source_type}")
        overall = scout_score
    else:
        # Heuristic monetization refine
        if solves_real_problem:
            monetization_score = min(100, monetization_score * 1.2)
        else:
            monetization_score = monetization_score * 0.5
            
        overall = (utility_score * 0.5) + (reusability_score * 0.25) + (monetization_score * 0.25)
    
    return {
        "utility": {
            "score": round(utility_score),
            "solves_real_problem": solves_real_problem,
            "has_actionable_output": has_actionable_output,
            "requires_user_input": False # MBRN Engines are autonomous
        },
        "reusability": round(reusability_score),
        "monetization": round(monetization_score),
        "overall_value": round(overall)
    }

def generate_suggested_use(target_app: str, category: str, repo_name: str) -> str:
    """Generate a concrete, non-vague suggested use case."""
    templates = {
        "finance": f"Add as analytical engine for {category} forecasting in FinanzRechner signal processing.",
        "discipline": f"Integrate as tracking logic for {category} optimization in Chronos habit-loops.",
        "numerology": f"Use as pattern-detection module for {category} analysis in Numerology Explorer.",
        "automation": f"Deploy as autonomous worker for {category} tasks within the Hub orchestration layer.",
        "hub": f"Integrate as core extension for {category} management in the Hub dashboard."
    }
    return templates.get(target_app, f"Add as {category} logic for {repo_name} feature set.")

def route_module(file_path: Path) -> Optional[Dict[str, Any]]:
    """Evaluate, score, and move a module to its specialized integration queue."""
    if not file_path.exists():
        return None
        
    try:
        log.info(f"Routing check: {file_path.name}")
        with open(file_path, "r", encoding="utf-8") as f:
            code = f.read()
        
        meta = extract_meta_from_code(code)
        if not meta:
            log.warning(f"No MBRN_MODULE_META in {file_path.name}. Rejected.")
            target_path = REJECTED_DIR / file_path.name
            file_path.replace(target_path)
            return None

        evaluation = evaluate_value_v11(code, meta)
        
        # Determine target app/dimension (STRICT)
        raw_dim = meta.get("dimension", "systeme").lower()
        target_app = DIMENSION_MAPPING.get(raw_dim, "automation")
        
        # Extraction refinement for Diamond Farming Mode v5.7
        def safe_json_parse(v, default):
            if v is None: return default
            try: 
                if isinstance(v, str) and (v.startswith('[') or v.startswith('{')):
                    return json.loads(v)
                return v
            except: return default

        value_card = {
            "module_name": file_path.name,
            "alpha_id": meta.get("alpha_id"),
            "target_dimension": raw_dim,
            "target_app": target_app,
            "scoring": evaluation,
            "money_score": float(meta.get("money_score", evaluation.get("monetization", 0))),
            "roi_score": float(meta.get("roi_score", 0)),
            "mbrn_fit_score": float(meta.get("mbrn_fit_score", 0)),
            "combined_score": float(meta.get("combined_score", 0)),
            "category_tags": safe_json_parse(meta.get("category_tags"), []),
            "why_mvp": meta.get("why_mvp", "N/A"),
            "why_trash": meta.get("why_trash", "N/A"),
            "integration_status": "waiting_review",
            "suggested_use": meta.get("suggested_use", generate_suggested_use(target_app, meta.get("category", "general"), meta.get("repo_name", "unknown"))),
            "manufactured_at": meta.get("manufactured_at"),
            "evaluated_at": datetime.now(timezone.utc).isoformat(),
            "version": "v1.11.0",
            "raw_data": meta
        }

        # Routing decision (Hard Threshold 60 for Integration Queue v1.11)
        # Flood Bypass Logic v5.7.6 (Diamond Farming Mode - Refined)
        flood_mode = os.getenv("MBRN_ALPHA_FLOOD_MODE") == "1"
        source_type = meta.get("source_type", "unknown")
        tags = value_card.get("category_tags", [])
        money_score = float(value_card.get("money_score", 0))
        
        # Tiered Bypass Heuristics
        is_tier_1 = money_score >= 80
        
        core_business_tags = ["document/OCR", "lead generation", "finance", "local business"]
        is_tier_2 = money_score >= 50 and any(t in core_business_tags for t in tags)
        
        is_tier_3 = "automation" in tags and money_score >= 60
        
        is_bypass_candidate = flood_mode and (source_type in ["github_discovery", "dev_seed"]) and (is_tier_1 or is_tier_2 or is_tier_3)
        
        if evaluation["overall_value"] >= 60 or is_bypass_candidate:
            target_dir = QUEUE_DIR / target_app
            status = "ACCEPTED"
            if is_bypass_candidate and evaluation["overall_value"] < 60:
                log.info(f"[ROUTER] FLOOD BYPASS: {file_path.name} money={money_score} tags={tags}")
        else:
            target_dir = REJECTED_DIR
            status = "REJECTED"

        target_dir.mkdir(parents=True, exist_ok=True)
        target_path = target_dir / file_path.name
        
        if target_path.exists():
            bak_path = target_path.with_suffix(f".bak_{int(time.time())}.py")
            target_path.rename(bak_path)

        file_path.replace(target_path)
        
        # Write Value Card
        card_path = target_path.with_suffix(".json")
        with open(card_path, "w", encoding="utf-8") as f:
            json.dump(value_card, f, indent=2)
            
        log.info(f"{status}: {file_path.name} -> {target_app} (Value: {evaluation['overall_value']}%)")
        return value_card

    except Exception as e:
        log.error(f"Error processing {file_path.name}: {e}")
        return None

def main_loop():
    """Standalone Daemon Loop for MBRN Value Router."""
    log.info("MBRN Value Router v1.11.0 [DAEMON MODE] started.")
    log.info(f"Watching: {READY_DIR}")
    
    while True:
        try:
            files = list(READY_DIR.glob("*.py"))
            if files:
                log.info(f"Found {len(files)} new module(s) in landing zone.")
                for f in files:
                    if any(x in f.name.lower() for x in ["quarantine", "failed", "bak", "dirty"]):
                        continue
                    route_module(f)
            
            # Heartbeat check for KILL_SWITCH
            if (Path(__file__).parent / "STOP_ROUTER").exists():
                log.warning("Kill-switch detected. Shutting down Value Router.")
                break
                
            time.sleep(10) # Low-frequency polling
        except KeyboardInterrupt:
            log.info("Shutdown requested.")
            break
        except Exception as e:
            log.error(f"Main loop error: {e}")
            time.sleep(30)

def run_once():
    """Single pass routing."""
    log.info(f"Scanning for modules in: {READY_DIR}")
    files = list(READY_DIR.glob("*.py"))
    if files:
        log.info(f"Found {len(files)} new module(s) in landing zone.")
        for f in files:
            if any(x in f.name.lower() for x in ["quarantine", "failed", "bak", "dirty"]):
                continue
            route_module(f)
    else:
        log.info("No new modules found.")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--single", action="store_true", help="Run once and exit")
    args = parser.parse_args()
    
    if args.single:
        run_once()
    else:
        main_loop()
