#!/usr/bin/env python3
"""Fix titles and headers inside the index.html files of all deployed modules."""

from __future__ import annotations
import re
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from shared.core.db import get_db

def run_fix_titles():
    print("[Fixer] Starting internal HTML title cleanup...")
    
    with get_db() as conn:
        modules = conn.execute("SELECT id, name, frontend_file FROM factory_modules WHERE status = 'deployed'").fetchall()
    
    fixed = 0
    
    for mod in modules:
        clean_name = mod["name"]
        html_path = PROJECT_ROOT / mod["frontend_file"]
        
        if not html_path.exists():
            continue
            
        content = html_path.read_text(encoding="utf-8", errors="ignore")
        
        # Replace <title>
        new_content = re.sub(r"<title>.*?</title>", f"<title>{clean_name} | MBRN Hub</title>", content, flags=re.IGNORECASE)
        
        # Replace <h1>
        new_content = re.sub(r"<h1>.*?</h1>", f"<h1>{clean_name}</h1>", new_content, flags=re.IGNORECASE)
        
        if new_content != content:
            html_path.write_text(new_content, encoding="utf-8")
            fixed += 1
            
    print(f"[Fixer] Done. Internal titles fixed in {fixed} files.")

if __name__ == "__main__":
    run_fix_titles()
