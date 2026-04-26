#!/usr/bin/env python3
"""Audit factory-ready modules and calculate a utility/quality score."""

from __future__ import annotations
import json
import re
import sys
import urllib.request
from pathlib import Path
from typing import Any, Dict, Tuple

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from shared.core.db import get_db, atomic_update, export_factory_feed_snapshot

# Phi4 Diamond Auditor Configuration
OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
AUDITOR_MODEL = "phi4:latest"

def calculate_score(html_content: str) -> float:
    score = 0.0
    
    # 1. JS Logic Depth (Lines in script tags)
    scripts = re.findall(r'<script>(.*?)</script>', html_content, re.DOTALL)
    js_lines = 0
    for script in scripts:
        js_lines += len([line for line in script.splitlines() if line.strip()])
    
    if js_lines > 50: score += 0.4
    elif js_lines > 20: score += 0.2
    elif js_lines > 5: score += 0.1
    
    # 2. Interactive Elements
    inputs = len(re.findall(r'<input|<textarea|<select', html_content))
    buttons = len(re.findall(r'<button', html_content))
    
    if inputs >= 3: score += 0.2
    elif inputs >= 1: score += 0.1
    
    if buttons >= 1: score += 0.1
    
    # 3. Logic Complexity (Regex, Math, Array methods)
    complexity_markers = [
        r'\.match\(', r'new RegExp', r'Math\.', r'\.filter\(', r'\.map\(', r'\.reduce\(', r'\.sort\('
    ]
    markers_found = 0
    for marker in complexity_markers:
        if re.search(marker, html_content):
            markers_found += 1
            
    if markers_found >= 3: score += 0.3
    elif markers_found >= 1: score += 0.15
    
    # 4. Penalty for placeholders
    if "key1" in html_content or "key2" in html_content:
        score -= 0.5
        
    return min(1.0, max(0.0, score))


def _call_phi4_for_validation(html_content: str, logic_desc: str) -> Tuple[bool, Dict[str, Any]]:
    """Call Phi4 to validate logical consistency and MBRN architecture compliance."""
    prompt = f"""You are the MBRN Diamond Auditor. Validate this module for architecture compliance and logical consistency.

MODULE HTML CONTENT:
{html_content[:3000]}

MODULE LOGIC DESCRIPTION:
{logic_desc[:1500]}

Evaluate:
1. Logical consistency (no contradictions, sound reasoning)
2. MBRN architecture compliance (vanilla JS, no-build, UTC timestamps)
3. Code quality (clean structure, no hardcoded secrets)
4. Scalability potential (reusability, maintainability)

Return ONLY valid JSON:
{{
  "valid": true|false,
  "quality_score": 0.0-1.0,
  "issues": ["list any issues found, max 3"],
  "rationale": "One sentence explaining the score"
}}"""
    
    payload = {
        "model": AUDITOR_MODEL,
        "prompt": prompt,
        "stream": False,
        "keep_alive": 0,  # CRITICAL: VRAM release immediately
        "options": {"temperature": 0.1, "num_predict": 512}
    }
    
    try:
        req = urllib.request.Request(
            OLLAMA_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=120) as resp:
            body = json.loads(resp.read().decode("utf-8"))
        
        response_text = body.get("response", "")
        # Extract JSON from response
        try:
            parsed = json.loads(response_text.strip())
            if isinstance(parsed, dict) and "quality_score" in parsed:
                return True, parsed
        except json.JSONDecodeError:
            pass
        
        # Fallback: try to extract JSON object from text
        start = response_text.find("{")
        end = response_text.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                parsed = json.loads(response_text[start:end+1])
                if isinstance(parsed, dict):
                    return True, parsed
            except json.JSONDecodeError:
                pass
        
        return False, {"error": "Could not parse Phi4 response"}
    except Exception as e:
        return False, {"error": str(e)}


def validate_with_phi4(html_content: str, logic_desc: str) -> float:
    """Get Phi4-validated quality score. Returns 0.0-1.0."""
    success, result = _call_phi4_for_validation(html_content, logic_desc)
    if success and result.get("valid", False):
        return float(result.get("quality_score", 0.5))
    return 0.0  # Invalid modules get 0


def run_audit():
    print("[Auditor] Starting audit of deployed modules...")
    with get_db() as conn:
        modules = conn.execute("SELECT id, name, dimension, frontend_file FROM factory_modules WHERE status = 'deployed'").fetchall()
    
    total = len(modules)
    scored = 0
    elite = 0
    trash = 0
    
    for mod in modules:
        html_path = PROJECT_ROOT / mod["frontend_file"]
        if not html_path.exists():
            print(f"[Auditor] Skip {mod['name']}: File missing at {mod['frontend_file']}")
            continue
            
        content = html_path.read_text(encoding="utf-8", errors="ignore")
        
        # Static baseline score
        static_score = calculate_score(content)
        
        # Phi4 Diamond validation (combines with static for final score)
        logic_desc = mod.get("name", "")
        phi4_score = validate_with_phi4(content, logic_desc)
        
        # Weighted combination: 40% static, 60% Phi4 reasoning
        score = (static_score * 0.4) + (phi4_score * 0.6)
        
        is_elite = 1 if score >= 0.8 else 0
        curation_status = 'trash' if score < 0.2 else ('elite' if is_elite else 'standard')
        
        atomic_update("factory_modules", {
            "quality_score": score,
            "is_elite": is_elite,
            "curation_status": curation_status
        }, "id", mod["id"])
        
        scored += 1
        if is_elite: elite += 1
        if curation_status == 'trash': trash += 1
        
    export_factory_feed_snapshot(limit=100)
    print(f"[Auditor] Audit complete. Scored: {scored}/{total}. Elite: {elite}. Trash: {trash}.")

if __name__ == "__main__":
    run_audit()
