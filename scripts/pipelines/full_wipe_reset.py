import os
import shutil
import sys
from pathlib import Path

# Add project root to path
PROJECT_ROOT = Path(r"C:\DevLab\MBRN-HUB-V1")
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from shared.core.db import get_db, export_factory_feed_snapshot

def full_wipe_and_reset():
    # 1. Clean Filesystem
    dimensions_dir = PROJECT_ROOT / "dimensions"
    deleted_folders = 0
    
    for dim_dir in dimensions_dir.iterdir():
        if not dim_dir.is_dir():
            continue
            
        apps_dir = dim_dir / "apps"
        if not apps_dir.exists():
            continue
            
        for app_folder in apps_dir.iterdir():
            if app_folder.is_dir():
                print(f"Deleting app folder: {app_folder}")
                shutil.rmtree(app_folder)
                deleted_folders += 1
    
    print(f"Filesystem bereinigt: {deleted_folders} App-Ordner geloescht.")

    # 2. Reset Database
    with get_db() as conn:
        result = conn.execute("UPDATE factory_modules SET status = 'ready'")
        conn.commit()
        print(f"Datenbank-Reset: {result.rowcount} Module auf 'ready' gesetzt.")

    # 3. Update Snapshot
    export_factory_feed_snapshot()
    print("Factory Feed Snapshot zurückgesetzt.")

if __name__ == "__main__":
    full_wipe_and_reset()
