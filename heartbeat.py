#!/usr/bin/env python3
"""
heartbeat.py

Updates public.system_status.last_ping every hour.
Intended to run continuously on the local reactor machine.
"""

from __future__ import annotations

import os
import time
from datetime import datetime, timezone
from pathlib import Path

import requests


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
    load_env_file(root / ".env")
    load_env_file(root / "scripts" / "pipelines" / ".env")


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def send_ping(supabase_url: str, service_role_key: str) -> None:
    endpoint = f"{supabase_url.rstrip('/')}/rest/v1/system_status?on_conflict=id"
    now_iso = utc_now_iso()

    payload = {
        "id": 1,
        "last_ping": now_iso,
    }
    headers = {
        "apikey": service_role_key,
        "Authorization": f"Bearer {service_role_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }

    response = requests.post(endpoint, headers=headers, json=payload, timeout=20)
    response.raise_for_status()
    print(f"[{utc_now_iso()}] heartbeat OK -> {now_iso}", flush=True)


def main() -> None:
    load_env()

    supabase_url = os.getenv("SUPABASE_URL")
    service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    interval_value = os.getenv(
        "HEARTBEAT_INTERVAL_SECONDS",
        os.getenv("MBRN_HEARTBEAT_INTERVAL_SECONDS", "3600"),
    )
    interval_seconds = max(60, int(interval_value))

    if not supabase_url or not service_role_key:
        raise RuntimeError("SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY muessen gesetzt sein.")

    print(f"[{utc_now_iso()}] heartbeat loop started (interval={interval_seconds}s)", flush=True)

    while True:
        try:
            send_ping(supabase_url, service_role_key)
        except Exception as err:
            print(f"[{utc_now_iso()}] heartbeat ERROR -> {err}", flush=True)
        time.sleep(interval_seconds)


if __name__ == "__main__":
    main()
