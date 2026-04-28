import json
import os
from pathlib import Path

# --- Configuration ---
INPUT_FILE = Path("dashboard/diamonds.json")
OUTPUT_FILE = Path("dashboard/diamonds_ranked.json")

def log(level, message):
    print(f"[DIAMOND-RANKER] {level}: {message}")

def rank_diamonds():
    if not INPUT_FILE.exists():
        log("WARN", "dashboard/diamonds.json not found. Skipping.")
        return

    try:
        with open(INPUT_FILE, "r", encoding="utf-8-sig") as f:
            diamonds = json.load(f)
    except Exception as e:
        log("ERROR", f"Failed to load diamonds: {e}")
        return

    ranked_list = []
    for d in diamonds:
        # Extract scores (ensure they are floats)
        money_score = float(d.get("money_score", 0))
        technical_score = float(d.get("score", 0))
        roi_score = float(d.get("roi_score", 0))

        # 1. mvp_score (0–100)
        # Formula: (money_score * 0.5) + (score * 0.3) + (roi_score * 0.2)
        mvp_score = (money_score * 0.5) + (technical_score * 0.3) + (roi_score * 0.2)
        mvp_score = round(min(100.0, max(0.0, mvp_score)), 1)

        # 2. mvp_category
        tags = d.get("category_tags")
        if isinstance(tags, dict) and "value" in tags: # PowerShell-wrapped array
            tag_list = [t.lower() for t in tags["value"]]
        elif isinstance(tags, list):
            tag_list = [t.lower() for t in tags]
        else:
            tag_list = []

        mvp_category = "OTHER"
        if any(t in tag_list for t in ["document/ocr", "finance"]):
            mvp_category = "MONEY_CORE"
        elif any(t in tag_list for t in ["lead generation", "local business"]):
            mvp_category = "ACQUISITION"
        elif "automation" in tag_list:
            mvp_category = "UTILITY"

        # 3. mvp_status
        if mvp_score >= 75:
            mvp_status = "BUILD_NOW"
        elif mvp_score >= 60:
            mvp_status = "STRONG_CANDIDATE"
        elif mvp_score >= 45:
            mvp_status = "IDEA_POOL"
        else:
            mvp_status = "TRASH"

        # 4. risk_flag
        suggested_use = str(d.get("suggested_use", "")).lower()
        risk_keywords = ["scrape", "scraping", "cold email", "whatsapp outreach"]
        risk_flag = "SAFE"
        if any(k in suggested_use for k in risk_keywords):
            risk_flag = "LEGAL_RISK"

        # Enrich diamond
        d["mvp_score"] = mvp_score
        d["mvp_category"] = mvp_category
        d["mvp_status"] = mvp_status
        d["risk_flag"] = risk_flag

        ranked_list.append(d)

    # Sort by mvp_score DESC
    ranked_list.sort(key=lambda x: x["mvp_score"], reverse=True)

    try:
        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            json.dump(ranked_list, f, indent=2)
        
        log("OK", f"Ranked {len(ranked_list)} diamonds")
        if ranked_list:
            top = ranked_list[0]
            log("INFO", f"Top candidate: {top.get('name')} score={top.get('mvp_score')}")
    except Exception as e:
        log("ERROR", f"Failed to save ranked diamonds: {e}")

if __name__ == "__main__":
    rank_diamonds()
