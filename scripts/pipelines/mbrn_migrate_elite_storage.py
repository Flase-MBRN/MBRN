#!/usr/bin/env python3
"""Migrate existing Elite modules to include MBRN Cloud Storage capabilities."""

from __future__ import annotations
import re
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from shared.core.db import get_db

def run_migration():
    print("[Migration] Starting Elite Storage Injection...")
    
    # We define Elite as >= 0.8 as per v5.4 directive
    with get_db() as conn:
        modules = conn.execute("SELECT id, name, frontend_file, quality_score FROM factory_modules WHERE status = 'deployed' AND quality_score >= 0.8").fetchall()
    
    migrated = 0
    
    for mod in modules:
        html_path = PROJECT_ROOT / mod["frontend_file"]
        if not html_path.exists():
            continue
            
        content = html_path.read_text(encoding="utf-8", errors="ignore")
        
        # Check if already injected
        if "mbrn_storage.js" in content:
            print(f"[Migration] Skip {mod['name']}: Already has storage.")
            continue
            
        print(f"[Migration] Injecting storage into {mod['name']} (Score: {mod['quality_score']})")
        
        # Calculate relative path to root: dimensions/X/apps/Y/index.html -> 4 levels up
        # We'll use a safer approach: just use the absolute root path /shared/js/mbrn_storage.js
        # OR better: use relative ../../../../shared/js/mbrn_storage.js as suggested by the user
        storage_script = '<script src="../../../../shared/js/mbrn_storage.js"></script>'
        
        # Inject before the first <script> tag
        if "<script>" in content:
            new_content = content.replace("<script>", f"{storage_script}\n<script>", 1)
        else:
            # Fallback before </body>
            new_content = content.replace("</body>", f"{storage_script}\n</body>")
            
        if new_content != content:
            html_path.write_text(new_content, encoding="utf-8")
            migrated += 1
            
    print(f"[Migration] Done. Storage injected into {migrated} modules.")

if __name__ == "__main__":
    run_migration()
