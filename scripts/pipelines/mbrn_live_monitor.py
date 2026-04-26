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
import re
import sys
import time
from datetime import datetime, timezone, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

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
MONITOR_MODEL    = "llama3.2:latest"  # Ultra-fast — only 2GB VRAM footprint
MONITOR_TIMEOUT  = 120               # Allow one full guarded Ollama slot cycle
SCAN_INTERVAL_S  = 300               # Alle 5 Minuten scannen
RECENT_FINDINGS_WINDOW_S = 7200      # Only last 2h affects live status

LOG_DIR      = _PROJECT_ROOT / "scripts" / "pipelines" / "logs"
REPORT_PATH  = _PROJECT_ROOT / "shared" / "data" / "monitor_report.json"
_ISO_TS_RE = re.compile(r"\[(\d{4}-\d{2}-\d{2}T[^\]]+)\]")
_LOCAL_TS_RE = re.compile(r"^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\b")
_TIME_ONLY_RE = re.compile(r"\[(\d{2}:\d{2}:\d{2}) UTC\]")
_FINDING_RE = re.compile(r"\b(ERROR|WARN|CRASH|HB_ERROR|TIMEOUT|timed out|failed|FAILED)\b", re.IGNORECASE)
LOCAL_TIMEZONE = ZoneInfo("Europe/Berlin")

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


def _parse_log_timestamp(line: str, now: datetime) -> datetime | None:
    """Parse known MBRN log timestamp forms into UTC datetimes."""
    iso_match = _ISO_TS_RE.search(line)
    if iso_match:
        raw = iso_match.group(1).replace("Z", "+00:00")
        try:
            parsed = datetime.fromisoformat(raw)
            if parsed.tzinfo is None:
                parsed = parsed.replace(tzinfo=timezone.utc)
            return parsed.astimezone(timezone.utc)
        except ValueError:
            return None

    local_match = _LOCAL_TS_RE.search(line)
    if local_match:
        try:
            parsed = datetime.strptime(local_match.group(1), "%Y-%m-%d %H:%M:%S")
            return parsed.replace(tzinfo=LOCAL_TIMEZONE).astimezone(timezone.utc)
        except ValueError:
            return None

    time_match = _TIME_ONLY_RE.search(line)
    if time_match:
        try:
            hour, minute, second = (int(part) for part in time_match.group(1).split(":"))
            parsed = now.replace(hour=hour, minute=minute, second=second, microsecond=0)
            if parsed > now + timedelta(minutes=5):
                parsed -= timedelta(days=1)
            return parsed
        except ValueError:
            return None

    return None


def split_findings_by_recency(log_excerpt: str) -> tuple[list[str], list[str]]:
    """Split warning/error lines into current and historical finding buckets."""
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(seconds=RECENT_FINDINGS_WINDOW_S)
    current: list[str] = []
    historical: list[str] = []

    for line in log_excerpt.splitlines():
        if not _FINDING_RE.search(line):
            continue
        parsed = _parse_log_timestamp(line, now)
        target = current if parsed is None or parsed >= cutoff else historical
        target.append(line.strip()[:500])

    return current[-10:], historical[-20:]


def apply_recency_policy(report: dict, log_excerpt: str) -> dict:
    """Prevent stale log errors from keeping the live monitor in warning forever."""
    current_findings, historical_findings = split_findings_by_recency(log_excerpt)
    report["current_findings"] = current_findings
    report["historical_findings"] = historical_findings
    report["recency_window_seconds"] = RECENT_FINDINGS_WINDOW_S

    if current_findings:
        has_error = any(
            re.search(r"\b(ERROR|CRASH|HB_ERROR|failed|FAILED)\b", item)
            for item in current_findings
        )
        if has_error and report.get("status") == "healthy":
            report["status"] = "warning"
        return report

    if report.get("status") in {"warning", "critical"}:
        report["status"] = "healthy"
        report["summary"] = "No current warnings in the recency window; older findings archived as historical."
        report["errors_found"] = []
        report["warnings_found"] = []
        report["recommendation"] = "No action required unless new current findings appear."
    return report


def build_fallback_report(reason: object, log_excerpt: str) -> dict:
    """Create a deterministic report when LLM analysis times out or fails."""
    current_findings, historical_findings = split_findings_by_recency(log_excerpt)
    return {
        "status": "warning" if current_findings else "healthy",
        "summary": f"LLM monitor analysis unavailable; deterministic fallback used: {str(reason)[:120]}",
        "errors_found": [
            line for line in current_findings
            if re.search(r"\b(ERROR|CRASH|HB_ERROR|failed|FAILED)\b", line)
        ][:5],
        "warnings_found": current_findings[:5],
        "recommendation": "Review current_findings if present; otherwise no immediate action required.",
        "current_findings": current_findings,
        "historical_findings": historical_findings,
        "recency_window_seconds": RECENT_FINDINGS_WINDOW_S,
        "fallback": True,
    }


def push_monitor_report(report: dict) -> None:
    """Write the health report to shared/data/monitor_report.json."""
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    report["generated_at"] = datetime.now(timezone.utc).isoformat()
    report["model"] = MONITOR_MODEL

    tmp = REPORT_PATH.with_suffix(".tmp")
    tmp.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    tmp.replace(REPORT_PATH)
    log("OK", f"Report written -> status={report.get('status')} | {report.get('summary','')[:80]}")


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
    
    # OBSERVABILITY: Measure cold-start time (9GB model load)
    t0 = time.monotonic()
    success, result = bridge.execute_custom_prompt(
        prompt=prompt,
        required_keys=["status", "summary", "errors_found", "warnings_found", "recommendation"],
        schema_hint=MONITOR_SCHEMA,
        worker_name="live_monitor_agent"
    )
    cold_start_ms = int((time.monotonic() - t0) * 1000)
    log("INFO", f"Cold-start timing: {cold_start_ms}ms (model load + inference)")
    
    if success and isinstance(result, dict):
        result["cold_start_ms"] = cold_start_ms  # Add to report for future analysis
        push_monitor_report(apply_recency_policy(result, log_excerpt))
    else:
        log("WARN", f"LLM analysis failed: {result}")
        push_monitor_report(build_fallback_report(result, log_excerpt))


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
