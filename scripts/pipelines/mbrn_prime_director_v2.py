import os
import json
import logging
import time
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, Any, List

# --- Configuration ---
LOG_FILE = "logs/mbrn_prime_director_v2.log"
QUEUE_DIR = Path("docs/S3_Data/outputs/integration_queue")
PLANS_DIR = Path("docs/S3_Data/outputs/integration_plans")
DECISIONS_FILE = Path("docs/S3_Data/outputs/prime_decisions.json")

# --- Logging ---
os.makedirs("logs", exist_ok=True)
os.makedirs(PLANS_DIR, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [DIRECTOR-v2] %(levelname)s - %(message)s',
    datefmt="%Y-%m-%dT%H:%M:%S",
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler()
    ]
)
log = logging.getLogger("prime_director_v2")

def generate_patch_plan(module_data: Dict[str, Any]) -> str:
    """Generate an enhanced Markdown Patch Plan for the accepted module."""
    raw_data = module_data.get("raw_data", {})
    name = raw_data.get("name", module_data.get("module_name", "unknown"))
    app = raw_data.get("app", module_data.get("target_app", "automation"))
    score = raw_data.get("combined_score", module_data.get("scoring", {}).get("overall_value", 0))
    money_score = raw_data.get("money_score", 0)
    roi_score = raw_data.get("roi_score", 0)
    risk = raw_data.get("risk", "medium")
    use_case = raw_data.get("suggested_use", "General integration.")
    reason = raw_data.get("reason", "High utility identified.")
    
    plan = f"""# MBRN Integration Plan: {name}
Generated: {datetime.now(timezone.utc).isoformat()}
Status: **PREPARE INTEGRATION**

## 🎯 Target Overview
- **App**: {app.upper()} (Chronos-compliant)
- **Module**: `{name}`
- **Combined Score**: {score}%
- **Money Potential**: {money_score}%
- **ROI Score**: {roi_score}%
- **Risk Level**: {risk.upper()}

## 🧠 Strategic Decision
{reason}
This candidate aligns with the MBRN v5.7 Money Mode mandate.

## 🛠 Integration Details
1. **Source**: `integration_queue/{app}/{name}`
2. **Action**: Inject logic into `{app}_orchestrator.py` or equivalent feature layer.
3. **Utility**: High reusability across the MBRN Hub.

## ⚠️ Risk & Rollback
- **Risk Assessment**: {risk.upper()}
- **Rollback**: Delete injected hook in target app and restart PM2.
- **Constraints**: Avoid direct production database mutation without further audit.

## ✅ Verification
- [ ] Manual review of `{name}` code.
- [ ] Dry-run in target environment.
- [ ] Visual verification in Cockpit (Diamond Card check).
"""
    return plan

def get_thresholds():
    """v5.7.0 Dynamic Thresholds based on Flood Mode."""
    is_flood = os.getenv("MBRN_ALPHA_FLOOD_MODE") == "1"
    if is_flood:
        return {"prepare": 60, "review": 40}
    return {"prepare": 80, "review": 65}

def run_director_cycle():
    """Scan queue, make decisions, and generate plans using Combined Score."""
    log.info("Starting Prime Director v2 cycle...")
    
    decisions = []
    thresholds = get_thresholds()
    mode_name = "FLOOD MODE" if os.getenv("MBRN_ALPHA_FLOOD_MODE") == "1" else "NORMAL MODE"
    log.info(f"Active Mode: {mode_name} | Thresholds: Prepare >= {thresholds['prepare']}, Review >= {thresholds['review']}")
    
    # 1. Scan all Value Cards in the queue
    for card_path in QUEUE_DIR.glob("**/*.json"):
        try:
            with open(card_path, "r", encoding="utf-8-sig") as f:
                card = json.load(f)
            
            raw_data = card.get("raw_data", {})
            module_name = raw_data.get("name", card.get("module_name"))
            score = raw_data.get("combined_score", card.get("scoring", {}).get("overall_value", 0))
            target_app = raw_data.get("app", card.get("target_app", "automation"))
            risk = raw_data.get("risk", "medium")
            
            # Ensure chronos nomenclature
            if target_app == "discipline": target_app = "chronos"
            
            # Extraction refinement for v5.7 (Safe Numeric Casting)
            def safe_float(v):
                try: return float(v)
                except (ValueError, TypeError): return 0.0

            money_score = safe_float(raw_data.get("money_score", card.get("money_score", 0)))
            roi_score = safe_float(raw_data.get("roi_score", card.get("roi_score", 0)))
            score = safe_float(raw_data.get("combined_score", card.get("scoring", {}).get("overall_value", 0)))

            decision_entry = {
                "module": module_name,
                "target_app": target_app,
                "score": score,
                "money_score": money_score,
                "roi_score": roi_score,
                "risk": risk,
                "category_tags": raw_data.get("category_tags", card.get("category_tags", [])),
                "why_mvp": raw_data.get("why_mvp", card.get("why_mvp", "N/A")),
                "why_trash": raw_data.get("why_trash", card.get("why_trash", "N/A")),
                "decision": "hold",
                "next_action": "none",
                "reason": "Unknown",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
            # 2. Rule-Based Triage (v5.7.0 - Dynamic Thresholds)
            if score >= thresholds["prepare"] and risk != "high":
                decision_entry["decision"] = "prepare_integration"
                decision_entry["next_action"] = "create_patch_plan"
                decision_entry["reason"] = f"High combined score ({score}%). Low/Medium risk. Ready for staging."
                
                # Phase 2: Generate Patch Plan
                plan_path = PLANS_DIR / f"{module_name}.md"
                if not plan_path.exists():
                    log.info(f"Generating Patch Plan for {module_name}")
                    with open(plan_path, "w", encoding="utf-8") as pf:
                        pf.write(generate_patch_plan(card))
            
            elif score >= thresholds["review"] and risk != "high":
                decision_entry["decision"] = "needs_review"
                decision_entry["next_action"] = "manual_review"
                decision_entry["reason"] = "Solid utility potential, but requires manual sanity check before plan generation."
            
            else:
                decision_entry["decision"] = "reject"
                decision_entry["reason"] = "Low utility score or high integration risk. Candidate rejected."
                
            decisions.append(decision_entry)
            
        except Exception as e:
            log.error(f"Error evaluating {card_path.name}: {e}")
            
    # 3. Write Decisions
    with open(DECISIONS_FILE, "w", encoding="utf-8") as df:
        json.dump(decisions, df, indent=2)
        
    log.info(f"Cycle complete. {len(decisions)} decisions recorded.")

def main():
    log.info("MBRN Prime Director v2 [CHIEF MEDICAL OFFICER] active.")
    while True:
        try:
            run_director_cycle()
            
            # Heartbeat / Kill Switch
            if (Path(__file__).parent / "STOP_DIRECTOR").exists():
                break
                
            time.sleep(60) # High-level polling
        except KeyboardInterrupt:
            break
        except Exception as e:
            log.error(f"Main loop error: {e}")
            time.sleep(60)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--single", action="store_true", help="Run once and exit")
    args = parser.parse_args()
    
    log.info("MBRN Prime Director v2 [CHIEF MEDICAL OFFICER] active.")
    if args.single:
        run_director_cycle()
    else:
        while True:
            try:
                run_director_cycle()
                if (Path(__file__).parent / "STOP_DIRECTOR").exists():
                    break
                time.sleep(60)
            except KeyboardInterrupt:
                break
            except Exception as e:
                log.error(f"Main loop error: {e}")
                time.sleep(60)
