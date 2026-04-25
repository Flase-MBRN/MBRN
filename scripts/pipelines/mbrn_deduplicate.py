#!/usr/bin/env python3
"""Deduplicate factory modules in DB and clean up the filesystem."""

from __future__ import annotations
import sys
import shutil
from pathlib import Path
from typing import List

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from shared.core.db import get_db, export_factory_feed_snapshot

def run_deduplication():
    print("[Deduplicator] Scanning for duplicate modules...")
    
    with get_db() as conn:
        # Find duplicates
        rows = conn.execute("""
            SELECT name, COUNT(*) as count 
            FROM factory_modules 
            GROUP BY name 
            HAVING count > 1
        """).fetchall()
        
        duplicates = [row["name"] for row in rows]
        
        if not duplicates:
            print("[Deduplicator] No duplicates found.")
            return

        total_deleted = 0
        
        for name in duplicates:
            print(f"[Deduplicator] Processing '{name}'...")
            
            # Get all versions, ordered by quality_score DESC, then created_at DESC
            versions = conn.execute("""
                SELECT id, frontend_file, quality_score, created_at 
                FROM factory_modules 
                WHERE name = ?
                ORDER BY quality_score DESC, created_at DESC
            """, (name,)).fetchall()
            
            # Keep the first one, delete the rest
            keep_id = versions[0]["id"]
            to_delete = versions[1:]
            
            for v in to_delete:
                v_id = v["id"]
                v_path = v["frontend_file"]
                
                # Delete folder if it exists
                if v_path:
                    abs_path = PROJECT_ROOT / v_path
                    if abs_path.exists():
                        folder_path = abs_path.parent
                        print(f"  Deleting folder: {folder_path}")
                        try:
                            shutil.rmtree(str(folder_path))
                        except Exception as e:
                            print(f"  Error deleting folder: {e}")
                
                # Delete from DB
                conn.execute("DELETE FROM factory_modules WHERE id = ?", (v_id,))
                total_deleted += 1
                
        print(f"[Deduplicator] Cleaned up {total_deleted} duplicate entries.")
        export_factory_feed_snapshot()

if __name__ == "__main__":
    run_deduplication()
