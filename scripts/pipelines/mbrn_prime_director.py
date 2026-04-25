#!/usr/bin/env python3
"""
MBRN Prime Director - Level 5 factory controller.

Observes the local factory, asks a local Ollama model for a control proposal,
validates it, and writes live control decisions when requested.
"""

from __future__ import annotations

import argparse
import json
import os
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import sys


PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from shared.core.db import (
    get_control_value,
    get_db,
    init_db,
    list_notifications,
    load_factory_control as load_db_factory_control,
    save_factory_control as save_db_factory_control,
)

DATA_DIR = PROJECT_ROOT / "shared" / "data"
LOG_DIR = PROJECT_ROOT / "scripts" / "pipelines" / "logs"
FACTORY_READY_DIR = PROJECT_ROOT / "docs" / "S3_Data" / "outputs" / "factory_ready"

CONTROL_PATH = DATA_DIR / "mbrn_factory_control.json"
REPORT_PATH = DATA_DIR / "mbrn_prime_director_report.json"
ALPHAS_PATH = DATA_DIR / "scout_alphas.json"
MEMORY_PATH = DATA_DIR / "mbrn_factory_memory.json"
NOTIFICATIONS_PATH = DATA_DIR / "nexus_notifications.json"

OLLAMA_URL = os.getenv("OLLAMA_GENERATE_URL", "http://127.0.0.1:11434/api/generate")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
PRIME_MODEL = "deepseek-r1:14b"
REPAIR_MODEL = "deepseek-coder-v2"
DEFAULT_INTERVAL_MINUTES = 30

ALLOWED_STATUSES = {"running", "paused"}
OUROBOROS_TARGET_WHITELIST = {
    "scripts/pipelines/mbrn_horizon_scout.py",
    "scripts/pipelines/mbrn_nexus_bridge.py",
    "scripts/pipelines/mbrn_bridge_agent.py",
    "scripts/pipelines/mbrn_factory_memory.py",
    "scripts/pipelines/mbrn_live_monitor.py",
}

DEFAULT_CONTROL = {
    "scout_status": "running",
    "nexus_status": "running",
    "nexus_roi_threshold": 80.0,
    "ouroboros_target_file": None,
    "prime_directive": "Maximize factory output and clear backlog.",
}


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def log(level: str, message: object) -> None:
    print(f"[{utc_now()}] [PRIME-DIRECTOR] [{level}] {message}")


def read_json(path: Path, fallback: Any) -> Any:
    try:
        if not path.exists():
            return fallback
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return fallback


def atomic_write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    tmp.replace(path)


def extract_json_object(text: str) -> Optional[Dict[str, Any]]:
    if not text:
        return None
    stripped = text.strip()
    try:
        parsed = json.loads(stripped)
        return parsed if isinstance(parsed, dict) else None
    except Exception:
        pass
    start = stripped.find("{")
    end = stripped.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return None
    try:
        parsed = json.loads(stripped[start:end + 1])
        return parsed if isinstance(parsed, dict) else None
    except Exception:
        return None


def clamp_threshold(value: Any) -> float:
    try:
        parsed = float(value)
    except (TypeError, ValueError):
        parsed = DEFAULT_CONTROL["nexus_roi_threshold"]
    return max(0.0, min(100.0, parsed))


def validate_control(candidate: Any) -> Tuple[Dict[str, Any], List[str]]:
    warnings: List[str] = []
    source = candidate if isinstance(candidate, dict) else {}
    if not isinstance(candidate, dict):
        warnings.append("candidate_not_object")

    control = dict(DEFAULT_CONTROL)
    control.update(source)

    if control.get("scout_status") not in ALLOWED_STATUSES:
        warnings.append("invalid_scout_status")
        control["scout_status"] = DEFAULT_CONTROL["scout_status"]

    if control.get("nexus_status") not in ALLOWED_STATUSES:
        warnings.append("invalid_nexus_status")
        control["nexus_status"] = DEFAULT_CONTROL["nexus_status"]

    control["nexus_roi_threshold"] = clamp_threshold(control.get("nexus_roi_threshold"))

    target = control.get("ouroboros_target_file")
    if target in ("", "null"):
        target = None
    if target is not None:
        normalized = str(target).replace("\\", "/")
        if normalized in OUROBOROS_TARGET_WHITELIST:
            target = normalized
        else:
            warnings.append("invalid_ouroboros_target_file")
            target = None
    control["ouroboros_target_file"] = target

    directive = control.get("prime_directive")
    if not isinstance(directive, str) or not directive.strip():
        warnings.append("invalid_prime_directive")
        directive = DEFAULT_CONTROL["prime_directive"]
    control["prime_directive"] = directive.strip()[:240]

    return control, warnings


def load_control() -> Dict[str, Any]:
    try:
        control, _warnings = validate_control(load_db_factory_control(DEFAULT_CONTROL))
        return control
    except Exception as exc:
        log("WARN", f"SQLite control unavailable; falling back to legacy JSON: {exc}")
    control, _warnings = validate_control(read_json(CONTROL_PATH, DEFAULT_CONTROL))
    return control


def save_control(control: Dict[str, Any]) -> None:
    save_db_factory_control(validate_control(control)[0])


def is_factory_paused() -> bool:
    """Remote kill-switch. Supabase errors fail closed; local DB is dev fallback."""
    if SUPABASE_URL and SUPABASE_KEY:
        try:
            url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/factory_flags?key=eq.factory_paused&select=value"
            req = urllib.request.Request(url, headers={
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Accept": "application/json",
            })
            with urllib.request.urlopen(req, timeout=5) as response:
                data = json.loads(response.read().decode("utf-8"))
            return bool(data[0].get("value")) if data else False
        except Exception as exc:
            log("ERROR", f"Remote kill-switch unavailable; failing closed: {exc}")
            return True
    return bool(get_control_value("factory_paused", False))


def count_processed(discoveries: List[Dict[str, Any]]) -> int:
    processed = 0
    for entry in discoveries:
        if entry.get("nexus_processed"):
            processed += 1
            continue
        enriched = entry.get("mbrn_enriched", {})
        if isinstance(enriched, dict) and enriched.get("nexus_processed"):
            processed += 1
    return processed


def collect_recent_log_findings(limit: int = 12) -> List[str]:
    if not LOG_DIR.exists():
        return []
    log_files = sorted(
        [p for p in LOG_DIR.glob("*.log") if p.is_file()],
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )[:8]
    findings: List[str] = []
    keywords = ("ERROR", "WARN", "CRASH", "FAILED", "Traceback", "rate limit")
    for path in log_files:
        try:
            lines = path.read_text(encoding="utf-8", errors="replace").splitlines()[-120:]
        except Exception:
            continue
        for line in reversed(lines):
            if any(keyword.lower() in line.lower() for keyword in keywords):
                findings.append(f"{path.name}: {line[:300]}")
                if len(findings) >= limit:
                    return findings
    return findings


def collect_sensor_snapshot() -> Dict[str, Any]:
    try:
        with get_db() as conn:
            alpha_counts = conn.execute(
                """
                SELECT
                    COUNT(*) AS total,
                    SUM(CASE WHEN status IN ('built', 'rejected', 'failed') THEN 1 ELSE 0 END) AS processed,
                    SUM(CASE WHEN status IN ('pending', 'approved') THEN 1 ELSE 0 END) AS backlog
                FROM scout_alphas
                """
            ).fetchone()
            module_counts = conn.execute("SELECT COUNT(*) AS total FROM factory_modules").fetchone()
            memory_counts = conn.execute("SELECT COUNT(*) AS total FROM factory_memory").fetchone()
        discoveries_total = int(alpha_counts["total"] or 0)
        processed = int(alpha_counts["processed"] or 0)
        backlog = int(alpha_counts["backlog"] or 0)
        modules_total = int(module_counts["total"] or 0)
        memory_total = int(memory_counts["total"] or 0)
        notifications_total = len(list_notifications(limit=200))
        seen_repo_ids = 0
    except Exception as exc:
        log("WARN", f"SQLite sensors unavailable; falling back to legacy JSON: {exc}")
        alphas = read_json(ALPHAS_PATH, {"discoveries": [], "seen_repo_ids": []})
        discoveries = alphas.get("discoveries", []) if isinstance(alphas, dict) else []
        if not isinstance(discoveries, list):
            discoveries = []
        processed = count_processed(discoveries)
        discoveries_total = len(discoveries)
        backlog = max(0, len(discoveries) - processed)
        modules = list(FACTORY_READY_DIR.glob("*.py")) if FACTORY_READY_DIR.exists() else []
        modules_total = len(modules)
        memory = read_json(MEMORY_PATH, {"documents": []})
        memory_total = len(memory.get("documents", [])) if isinstance(memory, dict) else 0
        notifications = read_json(NOTIFICATIONS_PATH, [])
        notifications_total = len(notifications) if isinstance(notifications, list) else 0
        seen_repo_ids = len(alphas.get("seen_repo_ids", [])) if isinstance(alphas, dict) else 0

    return {
        "generated_at": utc_now(),
        "discoveries": discoveries_total,
        "processed_alphas": processed,
        "backlog_alphas": backlog,
        "seen_repo_ids": seen_repo_ids,
        "factory_ready_modules": modules_total,
        "factory_memory_docs": memory_total,
        "nexus_notifications": notifications_total,
        "recent_findings": collect_recent_log_findings(),
        "current_control": load_control(),
    }


def build_prime_prompt(sensor: Dict[str, Any]) -> str:
    return f"""You are the MBRN Prime Director, a conservative phase-0 factory controller.
Return ONLY one JSON object with exactly these keys:
- scout_status: "running" or "paused"
- nexus_status: "running" or "paused"
- nexus_roi_threshold: number from 0.0 to 100.0
- ouroboros_target_file: null or one of {sorted(OUROBOROS_TARGET_WHITELIST)}
- prime_directive: short operational directive, max 160 chars

Hard rules:
- Prefer stability over throughput.
- Do not pause both scout and nexus unless logs show critical repeated failures.
- Keep nexus_roi_threshold near 80.0 unless backlog or quality clearly requires a change.
- Ouroboros target must be null unless a specific safe improvement target is obvious.
- CRITICAL RULE: If backlog_alphas is greater than 50, YOU MUST set scout_status to paused.
- Output JSON only. No markdown. No prose.

SENSOR SNAPSHOT:
{json.dumps(sensor, ensure_ascii=False, sort_keys=True)}
"""


def call_ollama(model: str, prompt: str, timeout_seconds: int = 120) -> Tuple[bool, str]:
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.1,
            "num_predict": 512,
        },
    }
    try:
        req = urllib.request.Request(
            OLLAMA_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=timeout_seconds) as response:
            body = json.loads(response.read().decode("utf-8"))
        return True, str(body.get("response", ""))
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, OSError) as exc:
        return False, str(exc)


def repair_with_coder(raw_text: str) -> Optional[Dict[str, Any]]:
    prompt = f"""Repair this into ONLY valid JSON with keys scout_status, nexus_status, nexus_roi_threshold, ouroboros_target_file, prime_directive.
Allowed status values: running, paused.
Allowed ouroboros_target_file: null or {sorted(OUROBOROS_TARGET_WHITELIST)}.

BROKEN_TEXT:
{raw_text[:4000]}
"""
    success, response = call_ollama(REPAIR_MODEL, prompt, timeout_seconds=90)
    if not success:
        return None
    return extract_json_object(response)


def fallback_decision(sensor: Dict[str, Any]) -> Dict[str, Any]:
    control = dict(sensor.get("current_control") or DEFAULT_CONTROL)
    recent_findings = sensor.get("recent_findings", [])
    backlog = int(sensor.get("backlog_alphas", 0))

    control["scout_status"] = "running"
    control["nexus_status"] = "running"
    control["nexus_roi_threshold"] = 80.0
    control["ouroboros_target_file"] = None
    control["prime_directive"] = "Maintain stable throughput and clear the current factory backlog."

    if len(recent_findings) >= 8:
        control["nexus_roi_threshold"] = 87.0
        control["prime_directive"] = "Reduce factory pressure, inspect recent warnings, and keep mutation disabled."
    elif backlog > 80:
        control["nexus_roi_threshold"] = 80.0
        control["prime_directive"] = "Prioritize Nexus backlog reduction while keeping Scout discovery active."
    elif backlog < 10:
        control["nexus_roi_threshold"] = 82.0
        control["prime_directive"] = "Keep factory stable and favor higher-quality candidates."

    return control


def run_control_pass(live_control: bool = False) -> Dict[str, Any]:
    sensor = collect_sensor_snapshot()
    prompt = build_prime_prompt(sensor)
    fallback_used = False
    raw_model_response = ""
    model_success, model_response = call_ollama(PRIME_MODEL, prompt)
    raw_model_response = model_response

    candidate = extract_json_object(model_response) if model_success else None
    repair_used = False
    if candidate is None and model_response:
        candidate = repair_with_coder(model_response)
        repair_used = candidate is not None

    if candidate is None:
        candidate = fallback_decision(sensor)
        fallback_used = True

    proposed_control, validation_warnings = validate_control(candidate)
    if validation_warnings and not fallback_used:
        fallback_used = True

    # Hard Override: If backlog > 50, force scout pause
    if int(sensor.get("backlog_alphas", 0)) > 50:
        proposed_control["scout_status"] = "paused"
        proposed_control["prime_directive"] = "HARD OVERRIDE: Backlog > 50. Scout forcefully paused."

    if live_control:
        save_control(proposed_control)

    report = {
        "generated_at": utc_now(),
        "dry_run": not live_control,
        "model": PRIME_MODEL,
        "repair_model": REPAIR_MODEL,
        "model_success": model_success,
        "repair_used": repair_used,
        "fallback_used": fallback_used,
        "validation_status": "ok" if not validation_warnings else "repaired",
        "validation_warnings": validation_warnings,
        "sensor_snapshot": sensor,
        "proposed_control": proposed_control,
        "raw_model_response_preview": raw_model_response[:1200],
        "control_panel_unchanged": not live_control,
    }
    atomic_write_json(REPORT_PATH, report)
    return report


def run_loop(interval_minutes: int, live_control: bool = False) -> None:
    while True:
        try:
            if is_factory_paused():
                log("WARN", "Factory paused via kill-switch. Sleeping 60 seconds.")
                time.sleep(60)
                continue
            report = run_control_pass(live_control=live_control)
            mode = "live" if live_control else "dry-run"
            log("OK", f"{mode} control pass complete fallback={report['fallback_used']}")
        except Exception as exc:
            log("ERROR", f"Prime Director loop failed: {exc}")
        time.sleep(max(1, interval_minutes) * 60)


def main() -> int:
    init_db()
    parser = argparse.ArgumentParser(description="MBRN Prime Director - Level 5 Meta-Controller")
    parser.add_argument("--run-once", action="store_true", help="Run one control pass")
    parser.add_argument("--infinite", action="store_true", help="Run control passes forever")
    parser.add_argument(
        "--live-control",
        action="store_true",
        help="Write proposed control to the live SQLite factory control panel",
    )
    parser.add_argument("--interval-minutes", type=int, default=DEFAULT_INTERVAL_MINUTES)
    args = parser.parse_args()

    if args.infinite:
        run_loop(args.interval_minutes, live_control=args.live_control)
        return 0

    report = run_control_pass(live_control=args.live_control)
    mode = "live" if args.live_control else "dry-run"
    log("OK", f"{mode} control report written: {REPORT_PATH}")
    log("INFO", f"Proposed control: {json.dumps(report['proposed_control'], ensure_ascii=False)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
