#!/usr/bin/env python3
"""Rename all existing serial-number modules to product-friendly names."""

from __future__ import annotations
import re
import sys
import shutil
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from shared.core.db import get_db, atomic_update, export_factory_feed_snapshot

def slugify(value: str) -> str:
    value = re.sub(r"_module$", "", value, flags=re.IGNORECASE)
    slug = re.sub(r"[^A-Za-z0-9_-]+", "_", value.strip()).strip("_").lower()
    return slug[:80] or "factory_module"

def extract_product_name(html: str) -> str:
    match = re.search(r"<h1>(.*?)</h1>", html, re.IGNORECASE)
    if match:
        title = match.group(1).strip()
        # Handle 20260425_123456 User_Name Tool_Name
        if re.match(r"^\d{8}[\s_]\d{6}", title):
            title = re.sub(r"^\d{8}[\s_]\d{6}[\s_]+[a-zA-Z0-9]+[\s_]+", "", title)
        return title.replace("_", " ").title()
    return "Autonomous Tool"

def run_mass_rename():
    print("[Renamer] Starting mass rename...")
    with get_db() as conn:
        modules = conn.execute("SELECT id, name, dimension, frontend_file FROM factory_modules WHERE status = 'deployed'").fetchall()
    
    renamed = 0
    skipped = 0
    
    for mod in modules:
        old_path_rel = mod["frontend_file"]
        old_file_abs = PROJECT_ROOT / old_path_rel
        if not old_file_abs.exists():
            print(f"[Renamer] Skip {mod['name']}: File missing")
            skipped += 1
            continue
            
        content = old_file_abs.read_text(encoding="utf-8", errors="ignore")
        product_name = extract_product_name(content)
        new_slug = slugify(product_name)
        
        # Check if the folder is already a serial number
        old_folder_abs = old_file_abs.parent
        old_folder_name = old_folder_abs.name
        
        print(f"[Debug] {old_folder_name} -> {new_slug} (Product: {product_name})")
        
        if old_folder_name == new_slug:
            print(f"[Renamer] Skip {mod['name']}: Already named correctly")
            skipped += 1
            continue
            
        # Perform Move
        new_folder_abs = old_folder_abs.parent / new_slug
        
        # If new folder exists, we might have a collision. Let's add a suffix.
        if new_folder_abs.exists():
            counter = 1
            while (old_folder_abs.parent / f"{new_slug}_{counter}").exists():
                counter += 1
            new_folder_abs = old_folder_abs.parent / f"{new_slug}_{counter}"
            new_slug = new_folder_abs.name
            
        print(f"[Renamer] Renaming {old_folder_name} -> {new_slug}")
        
        try:
            shutil.move(str(old_folder_abs), str(new_folder_abs))
            new_frontend_file = str(Path(old_path_rel).parent.parent / new_slug / "index.html").replace("\\", "/")
            
            atomic_update("factory_modules", {
                "name": product_name,
                "frontend_file": new_frontend_file
            }, "id", mod["id"])
            renamed += 1
        except Exception as e:
            print(f"[Renamer] Failed to rename {mod['name']}: {e}")
            
    if renamed > 0:
        export_factory_feed_snapshot()
        
    print(f"[Renamer] Done. Renamed: {renamed}. Skipped: {skipped}.")

if __name__ == "__main__":
    run_mass_rename()
