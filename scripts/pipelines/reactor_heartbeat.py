#!/usr/bin/env python3
"""
reactor_heartbeat.py

Sends a heartbeat timestamp from the local reactor to Supabase every 10 minutes.
The dashboard reads this timestamp and switches between "System online/offline".
"""

from __future__ import annotations

import os
import socket
import time
from datetime import datetime, timezone
from typing import Dict, Any

import requests

from pipeline_utils import load_pipeline_env, log


def _env(name: str, default: str | None = None) -> str | None:
    value = os.getenv(name)
    if value is None or value == "":
        return default
    return value


def build_config() -> Dict[str, Any]:
    load_pipeline_env()

    supabase_url = _env("SUPABASE_URL")
    service_role_key = _env("SUPABASE_SERVICE_ROLE_KEY")
    source = _env("MBRN_HEARTBEAT_SOURCE", "reactor-main")
    interval_seconds = int(_env("MBRN_HEARTBEAT_INTERVAL_SECONDS", "600"))

    if not supabase_url or not service_role_key:
        raise RuntimeError(
            "SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY fehlt in scripts/pipelines/.env"
        )

    return {
        "supabase_url": supabase_url.rstrip("/"),
        "service_role_key": service_role_key,
        "source": source,
        "interval_seconds": max(60, interval_seconds),
    }


def send_heartbeat(config: Dict[str, Any]) -> bool:
    endpoint = f"{config['supabase_url']}/rest/v1/reactor_heartbeat?on_conflict=source"
    now_iso = datetime.now(timezone.utc).isoformat()

    payload = {
        "source": config["source"],
        "last_seen": now_iso,
        "metadata": {
            "host": socket.gethostname(),
            "runtime": "python",
            "sent_at": now_iso,
        },
    }

    headers = {
        "apikey": config["service_role_key"],
        "Authorization": f"Bearer {config['service_role_key']}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }

    response = requests.post(endpoint, headers=headers, json=payload, timeout=15)
    if 200 <= response.status_code < 300:
        log("OK", f"Heartbeat sent: source={config['source']} at={now_iso}")
        return True

    log(
        "ERROR",
        f"Heartbeat failed: status={response.status_code} body={response.text[:200]}",
    )
    return False


def main() -> None:
    config = build_config()
    log("INFO", f"Reactor heartbeat started (interval={config['interval_seconds']}s)")

    while True:
        try:
            send_heartbeat(config)
        except Exception as exc:
            log("ERROR", f"Heartbeat exception: {exc}")

        time.sleep(config["interval_seconds"])


if __name__ == "__main__":
    main()

