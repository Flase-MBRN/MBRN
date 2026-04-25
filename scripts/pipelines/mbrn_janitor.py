#!/usr/bin/env python3
"""
MBRN Janitor v1.0
System hygiene agent for MBRN HUB.
Purges .bak files older than 24 hours from the pipeline directory.
"""

import os
import time
from pathlib import Path

PIPELINE_DIR = Path(__file__).resolve().parent
LOG_DIR = PIPELINE_DIR / "logs"
LOG_FILE = LOG_DIR / "janitor.log"
RETENTION_HOURS = 24

def log(message: str):
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    formatted = f"[{timestamp}] [JANITOR] {message}"
    print(formatted)
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(formatted + "\n")

def run_hygiene():
    log("Starting system hygiene pass...")
    now = time.time()
    purge_count = 0
    error_count = 0
    
    # Target: .bak files and .bak_YYYYMMDD_HHMMSS files
    for item in PIPELINE_DIR.iterdir():
        if item.is_file() and (".bak" in item.name):
            try:
                mtime = item.stat().st_mtime
                age_hours = (now - mtime) / 3600
                
                if age_hours > RETENTION_HOURS:
                    log(f"Purging old backup: {item.name} (Age: {age_hours:.1f}h)")
                    item.unlink()
                    purge_count += 1
            except Exception as e:
                log(f"Error processing {item.name}: {e}")
                error_count += 1
                
    log(f"Hygiene pass complete. Purged: {purge_count}, Errors: {error_count}")

if __name__ == "__main__":
    run_hygiene()
