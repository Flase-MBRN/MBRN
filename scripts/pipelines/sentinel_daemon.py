#!/usr/bin/env python3
"""
SENTINEL_DAEMON V3 "ASTRA-TURBO"
Optimiert für: Maximale Frequenz bei minimaler Last.
"""

from __future__ import annotations
import os, sys, threading, time, logging, importlib
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Callable, Dict, Optional
import requests
from worker_registry import WORKER_REGISTRY, WorkerDefinition

# === CONFIGURATION (TURBO-MODE) ===
CONFIG = {
    "heartbeat_interval_seconds": 60,   # EXTREM SCHNELL: Jede Minute ein Update
    "scheduler_tick_seconds": 1,        # REAKTIONSZEIT: Checkt jede Sekunde den Status
    "log_prefix": "[SENTINEL-ASTRA]",
    "quiet_mode": False                 # Setze auf True, um nur Fehler zu sehen
}

# === LOGGING SETUP ===
log_path = Path(__file__).resolve().parent / "sentinel_main.log"
logging.basicConfig(
    filename=log_path, level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s', datefmt='%Y-%m-%d %H:%M:%S'
)

# === VIBE COLORS ===
ANSI = {
    "reset": "\033[0m", "bold": "\033[1m",
    "violet": "\033[38;2;123;92;245m", "success": "\033[38;2;79;255;176m",
    "warning": "\033[38;2;251;191;36m", "error": "\033[38;2;255;107;107m",
    "silver": "\033[38;2;180;184;198m"
}

def log_event(message: str, level: str = "INFO"):
    """Präzises Logging für Konsole und Datei."""
    if CONFIG["quiet_mode"] and level == "INFO" and "OK" in message: return
    
    timestamp = datetime.now(timezone.utc).strftime("%H:%M:%S UTC")
    color = ANSI["silver"]
    if level == "ERROR": color = ANSI["error"]
    elif "OK" in message or "START" in message: color = ANSI["success"]
    elif "WARN" in message: color = ANSI["warning"]

    # Console Output
    print(f"{ANSI['bold']}{ANSI['violet']}{CONFIG['log_prefix']}{ANSI['reset']} "
          f"{ANSI['silver']}[{timestamp}]{ANSI['reset']} "
          f"{color}{message}{ANSI['reset']}")
    
    # File Logging
    if level == "ERROR": logging.error(message)
    else: logging.info(message)

def load_env():
    """Lädt die .env Datei mit explizitem UTF-8 Support."""
    # Wir prüfen beide möglichen Pfade
    paths = [
        Path(__file__).parent / ".env", 
        Path(__file__).parent / "scripts" / "pipelines" / ".env"
    ]
    
    for p in paths:
        if p.exists():
            try:
                # CRITICAL FIX: encoding="utf-8" hinzugefügt
                content = p.read_text(encoding="utf-8")
                for line in content.splitlines():
                    if "=" in line and not line.startswith("#"):
                        k, v = line.split("=", 1)
                        os.environ[k.strip()] = v.strip().strip('"').strip("'")
                # logging.info(f"Loaded env from {p}") # Optional zum Debuggen
            except Exception as e:
                print(f"Fehler beim Laden der .env: {e}")

def perform_heartbeat():
    """Heartbeat-Schnittstelle zu Supabase (Optimiert)."""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key: return False
    
    try:
        # Patch-Request ist schneller als Post/Insert
        endpoint = f"{url.rstrip('/')}/rest/v1/system_status?id=eq.1"
        payload = {"last_ping": datetime.now(timezone.utc).isoformat()}
        headers = {"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json"}
        r = requests.patch(endpoint, headers=headers, json=payload, timeout=5)
        return r.status_code in [200, 201, 204]
    except: return False

@dataclass
class WorkerState:
    worker_id: str
    is_running: bool = False
    next_run_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    lock: threading.Lock = field(default_factory=threading.Lock, repr=False)

def worker_wrapper(definition: WorkerDefinition, state: WorkerState):
    """Führt Worker isoliert in Threads aus."""
    try:
        module = importlib.import_module(definition.module_path)
        func = getattr(module, definition.callable_name)
        log_event(f"Worker START: {definition.worker_id}")
        if func() is not False:
            log_event(f"Worker OK: {definition.worker_id}")
        else:
            log_event(f"Worker FAIL: {definition.worker_id}", "ERROR")
    except Exception as e:
        log_event(f"Worker CRASH {definition.worker_id}: {e}", "ERROR")
    finally:
        with state.lock:
            state.is_running = False
            state.next_run_at = datetime.now(timezone.utc) + timedelta(minutes=definition.interval_minutes)

def main():
    load_env()
    log_event("SENTINEL TURBO-MODE ACTIVE")
    
    states = {d.worker_id: WorkerState(worker_id=d.worker_id) for d in WORKER_REGISTRY if d.enabled}
    last_ping_time = 0

    while True:
        now_ts = time.time()
        now_dt = datetime.now(timezone.utc)

        # 1. TURBO HEARTBEAT (Alle 60s)
        if now_ts - last_ping_time >= CONFIG["heartbeat_interval_seconds"]:
            if perform_heartbeat():
                log_event("SYNC: Dashboard updated (Live)")
                last_ping_time = now_ts
            else:
                log_event("SYNC ERROR: Retrying in 5s...", "WARN")
                last_ping_time = now_ts - CONFIG["heartbeat_interval_seconds"] + 5

        # 2. SCHEDULER (Checkt jede Sekunde)
        for d in WORKER_REGISTRY:
            if not d.enabled: continue
            state = states[d.worker_id]
            with state.lock:
                if not state.is_running and now_dt >= state.next_run_at:
                    state.is_running = True
                    threading.Thread(target=worker_wrapper, args=(d, state), daemon=True).start()

        time.sleep(CONFIG["scheduler_tick_seconds"])

if __name__ == "__main__":
    try: main()
    except KeyboardInterrupt: log_event("Sentinel Offline (User)")
    except Exception as e: log_event(f"FATAL ERROR: {e}", "ERROR")