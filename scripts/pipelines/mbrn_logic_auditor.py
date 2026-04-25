#!/usr/bin/env python3
"""Audit factory-ready modules and calculate a utility/quality score."""

from __future__ import annotations
import re
import sys
from pathlib import Path
from typing import Any

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from shared.core.db import get_db, atomic_update, export_factory_feed_snapshot

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
        score = calculate_score(content)
        
        is_elite = 1 if score >= 0.7 else 0
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
