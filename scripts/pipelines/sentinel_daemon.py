#!/usr/bin/env python3
"""
SENTINEL_DAEMON V3 "ASTRA-TURBO" - CLEAN REWRITE
"""

import os
import sys
import threading
import time
import importlib
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Path configuration for sibling and project imports
PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Sibling script modules (raw_market_news_collector, etc.)
SCRIPT_ROOT = Path(__file__).resolve().parent
if str(SCRIPT_ROOT) not in sys.path:
    sys.path.insert(0, str(SCRIPT_ROOT))

from worker_registry import WORKER_REGISTRY
from pipeline_utils import log as pipeline_log

def log_event(event_type, data=None):
    import json
    from datetime import datetime
    log_entry = {
        'timestamp': datetime.now().isoformat(),
        'event_type': event_type,
        'data': data
    }
    with open('sentinel.log', 'a') as f:
        f.write(json.dumps(log_entry) + '\n')

def load_env():
    """Simple .env loader for UTF-8 robustness."""
    env_path = Path(__file__).parent / ".env"
    if env_path.exists():
        try:
            content = env_path.read_text(encoding="utf-8")
            for line in content.splitlines():
                if "=" in line and not line.startswith("#"):
                    parts = line.split("=", 1)
                    if len(parts) == 2:
                        k, v = parts
                        os.environ[k.strip()] = v.strip().strip('"').strip("'")
        except Exception as e:
            print(f"Env Load Error: {e}")

@dataclass
class WorkerState:
    worker_id: str
    is_running: bool = False
    next_run_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    lock: threading.Lock = field(default_factory=threading.Lock, repr=False)

def worker_wrapper(worker_def, state):
    """
    CLEAN FLAT WRAPPER
    No decorators, no self, no EMA logic.
    """
    worker_name = worker_def.worker_id
    try:
        log_event("WORKER_START", data={"worker": worker_name})
        # Dynamic module loading from scripts/pipelines/
        module = importlib.import_module(worker_def.module_path)
        worker_func = getattr(module, worker_def.callable_name)

        # Dynamic Model Routing: Set environment variable for the worker thread
        if hasattr(worker_def, 'preferred_model') and worker_def.preferred_model:
            os.environ["OLLAMA_MODEL"] = worker_def.preferred_model
            
        # Execute the worker function
        worker_func()
        
        log_event("WORKER_SUCCESS", data={"worker": worker_name})
    except Exception as e:
        log_event("WORKER_ERROR", data={"msg": str(e), "worker": worker_name})
    finally:
        with state.lock:
            state.is_running = False
            # Schedule next run based on interval
            state.next_run_at = datetime.now(timezone.utc) + timedelta(minutes=worker_def.interval_minutes)

def main():
    load_env()
    log_event("SYSTEM_START", data={"msg": "SENTINEL REBOOTED - CLEAN STATE"})
    
    # Initialize states for all enabled workers in the registry
    states = {d.worker_id: WorkerState(worker_id=d.worker_id) for d in WORKER_REGISTRY if d.enabled}
    
    while True:
        now_dt = datetime.now(timezone.utc)
        
        for d in WORKER_REGISTRY:
            if not d.enabled:
                continue
            
            state = states.get(d.worker_id)
            if not state:
                continue
                
            with state.lock:
                # Scheduler logic
                if not state.is_running and now_dt >= state.next_run_at:
                    state.is_running = True
                    # Start worker in a separate daemon thread
                    thread = threading.Thread(
                        target=worker_wrapper, 
                        args=(d, state), 
                        daemon=True
                    )
                    thread.start()
        
        time.sleep(5) # 5s scheduler resolution

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        log_event("SYSTEM_STOP", data={"msg": "User Interruption"})
    except Exception as e:
        log_event("SYSTEM_FATAL", data={"msg": str(e)})
