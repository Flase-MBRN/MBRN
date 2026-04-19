#!/usr/bin/env python3
"""
heartbeat.py
MBRN System Architect Edition - Background Service with Logging & Smart Retry
"""

from __future__ import annotations

import os
import time
import logging
from datetime import datetime, timezone
from pathlib import Path

import requests

# === LOGGING SETUP ===
# Erstellt eine heartbeat.log Datei direkt im Hauptordner (MBRN-HUB-V1)
log_path = Path(__file__).resolve().parent / "heartbeat.log"
logging.basicConfig(
    filename=log_path,
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

def load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value

def load_env() -> None:
    root = Path(__file__).resolve().parent
    # Lädt die exakte .env aus deinem pipelines Ordner
    load_env_file(root / "scripts" / "pipelines" / ".env")

def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def send_ping(supabase_url: str, service_role_key: str) -> None:
    endpoint = f"{supabase_url.rstrip('/')}/rest/v1/system_status?on_conflict=id"
    now_iso = utc_now_iso()

    payload = {"id": 1, "last_ping": now_iso}
    headers = {
        "apikey": service_role_key,
        "Authorization": f"Bearer {service_role_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }

    response = requests.post(endpoint, headers=headers, json=payload, timeout=20)
    response.raise_for_status()
    logging.info(f"Ping erfolgreich -> {now_iso}")

def main() -> None:
    load_env()

    supabase_url = os.getenv("SUPABASE_URL")
    service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    interval_seconds = 3600  # 1 Stunde fest codiert für Stabilität

    if not supabase_url or not service_role_key:
        error_msg = "FEHLER: SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY fehlen in der .env"
        logging.critical(error_msg)
        raise RuntimeError(error_msg)

    logging.info(f"--- MBRN Heartbeat Service gestartet (Intervall: {interval_seconds}s) ---")

    while True:
        try:
            send_ping(supabase_url, service_role_key)
            time.sleep(interval_seconds)
        except requests.exceptions.RequestException as e:
            logging.warning(f"Netzwerkfehler (WLAN weg?). Neuer Versuch in 60s. Details: {e}")
            time.sleep(60) # Bei Internetproblemen nur 1 Minute warten
        except Exception as err:
            logging.error(f"Unerwarteter Fehler: {err}")
            time.sleep(interval_seconds)

if __name__ == "__main__":
    main()