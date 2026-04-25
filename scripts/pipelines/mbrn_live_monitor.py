#!/usr/bin/env python3
"""
================================================================================
MBRN Live Log Monitor — Intelligent Log Analysis Agent
================================================================================
Model:   llama3.1:8b  — Hyper-schnell, minimaler VRAM-Footprint
Aufgabe: Log-Dateien der MBRN-Pipelines lesen, Fehler erkennen,
         strukturierte Zusammenfassungen in JSON schreiben.
================================================================================
"""

import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

_PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

from bridges.local_llm.bridge import LocalLLMBridge, LocalLLMBridgeConfig
from scripts.pipelines.pipeline_utils import log as pipeline_log

def log(level: str, message: object) -> None:
    pipeline_log(level, f"[LIVE-MONITOR] {str(message)}")

# =============================================================================
# CONFIGURATION
# =============================================================================
MONITOR_MODEL    = "llama3.1:8b"     # Hyper-schnell — kein Reasoning nötig
MONITOR_TIMEOUT  = 60                # 60s — Logs sind kurz, Antwort schnell
SCAN_INTERVAL_S  = 300               # Alle 5 Minuten scannen

LOG_DIR      = _PROJECT_ROOT / "scripts" / "pipelines" / "logs"
REPORT_PATH  = _PROJECT_ROOT / "shared" / "data" / "monitor_report.json"

MONITOR_PROMPT = """You are the MBRN Live Log Monitor. Analyze the following log excerpt and produce a JSON health report.

LOG EXCERPT (last 100 lines):
{log_excerpt}

Return ONLY this JSON object:
{{
  "status": "healthy" | "warning" | "critical",
  "summary": "One sentence summary of what happened (max 200 chars)",
  "errors_found": ["list of critical error messages, max 5"],
  "warnings_found": ["list of warnings, max 5"],
  "recommendation": "One actionable sentence for the operator"
}}"""

MONITOR_SCHEMA = """{
  "status": "healthy",
  "summary": "All pipelines running normally.",
  "errors_found": [],
  "warnings_found": ["Scout cooldown active"],
  "recommendation": "No action required."
}"""


def get_latest_log_lines(n: int = 100) -> str:
    """Read the last n lines from the most recent log file."""
    if not LOG_DIR.exists():
        return "No log directory found."

    log_files = sorted(LOG_DIR.glob("*.log"), key=lambda f: f.stat().st_mtime, reverse=True)

    # Also check sentinel main log
    sentinel_log = _PROJECT_ROOT / "scripts" / "pipelines" / "sentinel_main.log"
    if sentinel_log.exists():
        log_files.insert(0, sentinel_log)

    if not log_files:
        return "No log files found."

    # Collect lines from latest log
    latest = log_files[0]
    try:
        lines = latest.read_text(encoding="utf-8", errors="replace").splitlines()
        return "\n".join(lines[-n:])
    except Exception as e:
        return f"Could not read log: {e}"


def push_monitor_report(report: dict) -> None:
    """Write the health report to shared/data/monitor_report.json."""
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    report["generated_at"] = datetime.now(timezone.utc).isoformat()
    report["model"] = MONITOR_MODEL

    tmp = REPORT_PATH.with_suffix(".tmp")
    tmp.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    tmp.replace(REPORT_PATH)
    log("OK", f"Report written → status={report.get('status')} | {report.get('summary','')[:80]}")


def run_monitor_scan() -> None:
    log("INFO", "=== LIVE MONITOR SCAN STARTED ===")

    log_excerpt = get_latest_log_lines(100)
    if not log_excerpt.strip():
        log("WARN", "No log content to analyze.")
        return

    bridge = LocalLLMBridge(LocalLLMBridgeConfig(
        model=MONITOR_MODEL,
        timeout_seconds=MONITOR_TIMEOUT
    ))

    if not bridge.is_available():
        log("WARN", "Ollama not available.")
        return

    prompt = MONITOR_PROMPT.format(log_excerpt=log_excerpt)
    success, result = bridge.execute_custom_prompt(
        prompt=prompt,
        required_keys=["status", "summary", "errors_found", "warnings_found", "recommendation"],
        schema_hint=MONITOR_SCHEMA,
        worker_name="live_monitor_agent"
    )

    if success and isinstance(result, dict):
        push_monitor_report(result)
    else:
        log("WARN", f"LLM analysis failed: {result}")


def run_monitor_daemon() -> None:
    log("INFO", f"=== MBRN LIVE MONITOR DAEMON STARTED (model: {MONITOR_MODEL}) ===")
    while True:
        try:
            run_monitor_scan()
        except Exception as e:
            log("ERROR", f"Monitor loop error: {e}")
        log("INFO", f"Next scan in {SCAN_INTERVAL_S // 60} minutes...")
        time.sleep(SCAN_INTERVAL_S)


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="MBRN Live Log Monitor")
    parser.add_argument("--infinite", action="store_true", help="Run as daemon")
    args = parser.parse_args()

    if args.infinite:
        run_monitor_daemon()
    else:
        run_monitor_scan()
