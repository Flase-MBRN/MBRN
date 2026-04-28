#!/usr/bin/env python3
"""
/scripts/pipelines/local_llm_enrichment_worker.py
Week-2 local enrichment worker for raw -> gold processing.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import requests
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env", override=False)

PROJECT_ROOT = Path(__file__).resolve().parents[2]
PIPELINES_DIR = Path(__file__).resolve().parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))
if str(PIPELINES_DIR) not in sys.path:
    sys.path.append(str(PIPELINES_DIR))

from bridges.local_llm import LocalLLMBridge
from pipeline_utils import load_pipeline_env, log


EXIT_SUCCESS = 0
EXIT_FAILURE = 1
EXIT_PARTIAL_FAILURE = 2
DEFAULT_BATCH_LIMIT = 10
WORKER_NAME = "local_llm_enrichment_worker"


class WorkerError(Exception):
    """Controlled worker exception."""


@dataclass
class RuntimeContext:
    supabase_url: str
    service_role_key: str


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def load_local_env(env_path: Path = PIPELINES_DIR / ".env") -> None:
    load_pipeline_env(env_path)


def resolve_runtime_context() -> RuntimeContext:
    load_local_env()

    supabase_url = os.getenv("SUPABASE_URL", "").strip().rstrip("/")
    service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    if not supabase_url or not service_role_key:
        raise WorkerError("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.")

    return RuntimeContext(supabase_url=supabase_url, service_role_key=service_role_key)


def build_headers(service_role_key: str, prefer: str | None = None) -> Dict[str, str]:
    headers = {
        "apikey": service_role_key,
        "Authorization": f"Bearer {service_role_key}",
        "Content-Type": "application/json",
    }
    if prefer:
        headers["Prefer"] = prefer
    return headers


def request_json(
    method: str,
    url: str,
    *,
    headers: Dict[str, str],
    params: Dict[str, Any] | None = None,
    json_body: Dict[str, Any] | List[Dict[str, Any]] | None = None,
) -> Any:
    try:
        response = requests.request(
            method,
            url,
            headers=headers,
            params=params,
            json=json_body,
            timeout=30,
        )
    except requests.RequestException as exc:
        raise WorkerError(f"Supabase request failed before response: {exc}") from exc

    if response.status_code >= 400:
        try:
            payload = response.json()
        except ValueError:
            payload = response.text.strip() or response.reason
        raise WorkerError(f"Supabase request failed ({response.status_code}): {payload}")

    if not response.text:
        return None

    try:
        return response.json()
    except ValueError:
        return None


def fetch_pending_items(runtime: RuntimeContext, limit: int) -> List[Dict[str, Any]]:
    payload = request_json(
        "GET",
        f"{runtime.supabase_url}/rest/v1/raw_ingest_items",
        headers=build_headers(runtime.service_role_key),
        params={
            "select": "id,source_family,source_name,source_url,fetched_at,title,payload,analysis_status,analysis_attempt_count",
            "analysis_status": "eq.pending",
            "order": "fetched_at.asc",
            "limit": str(limit),
        },
    )
    return payload if isinstance(payload, list) else []


def claim_item(runtime: RuntimeContext, item: Dict[str, Any], model_name: str) -> Optional[Dict[str, Any]]:
    claimed = request_json(
        "PATCH",
        f"{runtime.supabase_url}/rest/v1/raw_ingest_items",
        headers=build_headers(runtime.service_role_key, prefer="return=representation"),
        params={
            "id": f"eq.{item['id']}",
            "analysis_status": "eq.pending",
            "select": "id,source_family,source_name,source_url,fetched_at,title,payload,analysis_status,analysis_attempt_count",
        },
        json_body={
            "analysis_status": "processing",
            "analysis_started_at": utc_now_iso(),
            "analysis_last_error": None,
            "analysis_worker": WORKER_NAME,
            "analysis_model": model_name,
            "analysis_attempt_count": int(item.get("analysis_attempt_count") or 0) + 1,
        },
    )
    if isinstance(claimed, list) and claimed:
        return claimed[0]
    return None


def persist_gold(runtime: RuntimeContext, raw_item: Dict[str, Any], analysis: Dict[str, Any]) -> Dict[str, Any]:
    payload = {
        "raw_item_id": raw_item["id"],
        "source_family": raw_item["source_family"],
        "source_name": raw_item["source_name"],
        "model_name": analysis["model_name"],
        "analysis_version": analysis["analysis_version"],
        "summary": analysis["summary"],
        "score": analysis["score"],
        "confidence": analysis["confidence"],
        "tags": analysis["tags"],
        "recommended_action": analysis["recommended_action"],
        "analysis_json": analysis["analysis_json"],
        "updated_at": utc_now_iso(),
    }
    result = request_json(
        "POST",
        f"{runtime.supabase_url}/rest/v1/gold_enrichment_items",
        headers=build_headers(
            runtime.service_role_key,
            prefer="return=representation,resolution=merge-duplicates",
        ),
        params={
            "on_conflict": "raw_item_id,analysis_version",
        },
        json_body=payload,
    )
    if isinstance(result, list) and result:
        return result[0]
    raise WorkerError("Gold persistence returned no record.")


def mark_item_completed(runtime: RuntimeContext, raw_item_id: str, analysis: Dict[str, Any]) -> None:
    request_json(
        "PATCH",
        f"{runtime.supabase_url}/rest/v1/raw_ingest_items",
        headers=build_headers(runtime.service_role_key),
        params={"id": f"eq.{raw_item_id}"},
        json_body={
            "analysis_status": "completed",
            "analysis_completed_at": utc_now_iso(),
            "analysis_last_error": None,
            "analysis_model": analysis["model_name"],
            "analysis_worker": WORKER_NAME,
        },
    )


def mark_item_failed(runtime: RuntimeContext, raw_item_id: str, error_message: str, model_name: str) -> None:
    request_json(
        "PATCH",
        f"{runtime.supabase_url}/rest/v1/raw_ingest_items",
        headers=build_headers(runtime.service_role_key),
        params={"id": f"eq.{raw_item_id}"},
        json_body={
            "analysis_status": "failed",
            "analysis_completed_at": utc_now_iso(),
            "analysis_last_error": error_message[:500],
            "analysis_model": model_name,
            "analysis_worker": WORKER_NAME,
        },
    )


def process_item(runtime: RuntimeContext, bridge: LocalLLMBridge, item: Dict[str, Any]) -> bool:
    try:
        claimed_item = claim_item(runtime, item, bridge.config.model)
        if not claimed_item:
            log("WARN", f"Skip item already claimed id={item['id']}")
            return True

        analysis = bridge.analyze_raw_item(claimed_item)
        persist_gold(runtime, claimed_item, analysis)
        mark_item_completed(runtime, claimed_item["id"], analysis)
        log("OK", f"Week-2 enrichment completed raw_item_id={claimed_item['id']} score={analysis['score']}")
        return True
    except Exception as exc:
        error_message = str(exc)
        claimed_item_id = (
            claimed_item["id"]
            if "claimed_item" in locals() and isinstance(claimed_item, dict) and claimed_item.get("id")
            else item["id"]
        )
        try:
            mark_item_failed(runtime, claimed_item_id, error_message, bridge.config.model)
        except Exception as mark_exc:
            log("ERROR", f"Week-2 failure marker could not be written raw_item_id={claimed_item_id} reason={mark_exc}")
        log("ERROR", f"Week-2 enrichment failed raw_item_id={claimed_item_id} reason={error_message}")
        return False


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Week-2 local LLM enrichment worker.")
    parser.add_argument("--limit", type=int, default=DEFAULT_BATCH_LIMIT)
    return parser


def main(argv: List[str] | None = None) -> int:
    try:
        args = build_parser().parse_args(argv)
        runtime = resolve_runtime_context()
        bridge = LocalLLMBridge()

        if not bridge.is_available():
            log("ERROR", "Local LLM bridge unavailable. Start Ollama before running Week-2 enrichment.")
            return EXIT_FAILURE

        pending_items = fetch_pending_items(runtime, max(1, args.limit))
        if not pending_items:
            log("INFO", "No pending raw items found for Week-2 enrichment.")
            return EXIT_SUCCESS

        log("INFO", f"Week-2 enrichment started pending_items={len(pending_items)} model={bridge.config.model}")
        results = [process_item(runtime, bridge, item) for item in pending_items]

        if all(results):
            return EXIT_SUCCESS
        if any(results):
            return EXIT_PARTIAL_FAILURE
        return EXIT_FAILURE
    except WorkerError as exc:
        log("ERROR", f"Week-2 enrichment worker configuration failed: {exc}")
        return EXIT_FAILURE
    except Exception as exc:
        log("ERROR", f"Week-2 enrichment worker failed: {exc}")
        return EXIT_FAILURE


if __name__ == "__main__":
    # P1 SECURITY GUARDRAIL: Service-Role Warning
    print("\n" + "=" * 60)
    print("⚠️  WARNING: SERVICE ROLE ACTIVE - GOD MODE")
    print("    This tool uses Supabase service-role privileges.")
    print("    DO NOT SHARE LOGS OR SCREENSHOTS!")
    print("    Operator-only tool on trusted machine.")
    print("=" * 60 + "\n")
    raise SystemExit(main())
