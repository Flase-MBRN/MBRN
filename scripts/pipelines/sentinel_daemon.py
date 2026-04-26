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
from pipeline_utils import CircuitBreaker

# Make sibling script modules importable for worker dispatching.
SCRIPT_ROOT = Path(__file__).resolve().parents[1]
ORACLE_ROOT = SCRIPT_ROOT / "oracle"
for import_root in (SCRIPT_ROOT, ORACLE_ROOT):
    if str(import_root) not in sys.path:
        sys.path.insert(0, str(import_root))

# === CONFIGURATION (TURBO-MODE) ===
CONFIG = {
    "heartbeat_interval_seconds": 60,   # EXTREM SCHNELL: Jede Minute ein Update
    "scheduler_tick_seconds": 1,        # REAKTIONSZEIT: Checkt jede Sekunde den Status
    "log_prefix": "[SENTINEL-ASTRA]",
    "quiet_mode": False,                # Setze auf True, um nur Fehler zu sehen
    # Resilienz-Einstellungen
    "heartbeat_timeout_seconds": [5, 10, 30],  # Exponential Backoff: 5s → 10s → 30s
    "max_retries": 3,                          # Max Retry-Versuche
    "circuit_breaker_threshold": 3,            # Nach 3 Fehlern 5min Pause
    "circuit_breaker_cooldown": 300           # 5 Minuten Cooldown
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

def log_event(message: str, level: str = "INFO") -> None:
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

# CRITICAL: Load .env immediately so env vars are available for heartbeat
load_env()

# Global Circuit Breaker für Heartbeat
heartbeat_circuit_breaker = CircuitBreaker(
    failure_threshold=CONFIG["circuit_breaker_threshold"],
    cooldown_seconds=CONFIG["circuit_breaker_cooldown"]
)

def perform_heartbeat():
    """Heartbeat-Schnittstelle zu Supabase mit Resilienz-Logik."""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        log_event("HB_ERROR: SUPABASE_URL oder SERVICE_ROLE_KEY nicht gesetzt", "ERROR")
        return False
    
    # Circuit Breaker Check
    if not heartbeat_circuit_breaker.can_execute():
        log_event("HB_ERROR: Circuit Breaker OPEN - Heartbeat pausiert", "WARN")
        return False
    
    # Retry Loop mit Exponential Backoff
    timeouts = CONFIG["heartbeat_timeout_seconds"]
    for attempt, timeout in enumerate(timeouts, 1):
        try:
            endpoint = f"{url.rstrip('/')}/rest/v1/system_status?id=eq.1"
            payload = {"last_ping": datetime.now(timezone.utc).isoformat()}
            headers = {
                "apikey": key,
                "Authorization": f"Bearer {key}",
                "Content-Type": "application/json"
            }
            
            r = requests.patch(endpoint, headers=headers, json=payload, timeout=timeout)
            
            if r.status_code in [200, 201, 204]:
                heartbeat_circuit_breaker.record_success()
                return True
            elif r.status_code == 401:
                log_event("HB_ERROR: HTTP 401 - Ungültiger API Key", "ERROR")
                heartbeat_circuit_breaker.record_failure()
                return False
            elif r.status_code >= 500:
                log_event(f"HB_ERROR: HTTP {r.status_code} - Server-Fehler", "WARN")
                if attempt < len(timeouts):
                    log_event(f"HB_RETRY: Versuch {attempt}/{len(timeouts)}, Timeout auf {timeout}s erhöht", "WARN")
                    time.sleep(2 ** attempt)  # Exponential Backoff
                continue
            else:
                log_event(f"HB_ERROR: HTTP {r.status_code} - Unerwarteter Status", "ERROR")
                heartbeat_circuit_breaker.record_failure()
                return False
                
        except requests.exceptions.Timeout:
            if attempt < len(timeouts):
                log_event(f"HB_TIMEOUT: Versuch {attempt}/{len(timeouts)}, Timeout auf {timeout}s erhöht", "WARN")
                time.sleep(2 ** attempt)
            continue
        except requests.exceptions.ConnectionError as e:
            log_event(f"HB_CONN_ERROR: {type(e).__name__} - Keine Verbindung", "WARN")
            heartbeat_circuit_breaker.record_failure()
            return False
        except requests.exceptions.RequestException as e:
            log_event(f"HB_REQUEST_ERROR: {type(e).__name__} - {str(e)[:100]}", "ERROR")
            heartbeat_circuit_breaker.record_failure()
            return False
    
    # Alle Retries fehlgeschlagen
    log_event("HB_FAIL: Alle Retry-Versuche fehlgeschlagen", "ERROR")
    heartbeat_circuit_breaker.record_failure()
    return False

@dataclass
class WorkerState:
    worker_id: str
    is_running: bool = False
    next_run_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    lock: threading.Lock = field(default_factory=threading.Lock, repr=False)

def worker_wrapper(func, worker_def, state):
    """Execute worker function with error handling and state management."""
    try:
        import importlib
        module = importlib.import_module(worker_def.module_path)
        worker_func = getattr(module, worker_def.callable_name)
        result = worker_func()
        log_event(f"Worker {worker_def.worker_id} completed successfully")
        return result
    except Exception as e:
        log_event(f"Error in worker {worker_def.worker_id}: {str(e)}", "ERROR")
        raise
    finally:
        with state.lock:
            state.is_running = False
            state.next_run_at = datetime.now(timezone.utc) + timedelta(minutes=worker_def.interval_minutes)

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
                    threading.Thread(target=worker_wrapper, args=(d, d, state), daemon=True).start()

        time.sleep(CONFIG["scheduler_tick_seconds"])

if __name__ == "__main__":
    try: main()
    except KeyboardInterrupt: log_event("Sentinel Offline (User)")
    except Exception as e: log_event(f"FATAL ERROR: {e}", "ERROR")
