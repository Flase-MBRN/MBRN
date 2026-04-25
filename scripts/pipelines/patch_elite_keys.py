#!/usr/bin/env python3
"""Retroactively patch Elite modules with Supabase keys and MBRN_CONFIG."""

from __future__ import annotations
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from shared.core.db import get_db

CONFIG_JS = """
    <script>
        window.MBRN_CONFIG = {
            supabaseUrl: 'https://wqfijgzlxypqftwwoxxp.supabase.co',
            supabaseKey: 'sb_publishable_2K9K_RcFJyO5VS2XYlAWag_qFJuKseO'
        };
    </script>
"""

def run_patch():
    print("[Patch] Starting Elite Cloud Patch (v5.6)...")
    
    with get_db() as conn:
        modules = conn.execute(
            """
            SELECT id, name, frontend_file
            FROM factory_modules
            WHERE status = 'deployed' AND is_elite = 1
            """
        ).fetchall()
    
    patched = 0
    for mod in modules:
        html_path = PROJECT_ROOT / mod["frontend_file"]
        if not html_path.exists():
            continue
            
        content = html_path.read_text(encoding="utf-8", errors="ignore")
        
        # 1. Inject Config if missing
        if "window.MBRN_CONFIG" not in content:
            print(f"[Patch] Injecting keys into {mod['name']}")
            if "</title>" in content:
                content = content.replace("</title>", f"</title>{CONFIG_JS}", 1)
            elif "<head>" in content:
                content = content.replace("<head>", f"<head>{CONFIG_JS}", 1)
        
        # 2. Fix Path Logic (Always use relative root to avoid absolute path issues on subfolders)
        # We'll use the user's requested path or a cleaner relative one
        storage_script = '<script src="../../../../shared/js/mbrn_storage.js"></script>'
        if "mbrn_storage.js" not in content:
            if "</head>" in content:
                content = content.replace("</head>", f"    {storage_script}\n</head>", 1)
            else:
                content = content.replace("<body>", f"<body>\n    {storage_script}", 1)
        
        html_path.write_text(content, encoding="utf-8")
        patched += 1
            
    print(f"[Patch] Done. {patched} modules patched.")

if __name__ == "__main__":
    run_patch()
