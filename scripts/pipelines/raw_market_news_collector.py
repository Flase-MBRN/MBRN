#!/usr/bin/env python3
"""
/scripts/pipelines/raw_market_news_collector.py
Week 1 raw-ingest foundation for markets + news.

Responsibilities:
1. Fetch free market data snapshots and RSS news items
2. Normalize them into a generic raw-ingest shape
3. Push a single batch to the raw-ingest Supabase edge function
4. Exit cleanly with success / partial failure / failure semantics
"""

from __future__ import annotations

import hashlib
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

PROJECT_ROOT = Path(__file__).resolve().parents[2]
PIPELINES_DIR = Path(__file__).resolve().parent
if str(PIPELINES_DIR) not in sys.path:
    sys.path.append(str(PIPELINES_DIR))

from pipeline_utils import (
    MARKET_CONFIG,
    RSS_CONFIG,
    RetryHandler,
    SupabaseUplink,
    fetch_market_snapshot,
    fetch_news_batch,
    load_pipeline_env,
    log,
    safe_round,
)


EXIT_SUCCESS = 0
EXIT_FAILURE = 1
EXIT_PARTIAL_FAILURE = 2

COLLECTOR_CONFIG = {
    "source_family": "markets_news",
    "source_name": "raw_market_news_collector",
    "pipeline_version": "1.1.0",  # Bumped for centralized refactor
}


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def build_payload_hash(payload: Dict[str, Any]) -> str:
    serialized = json.dumps(payload, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()


def normalize_market_item(snapshot: Dict[str, Any], run_started_at: str) -> Dict[str, Any]:
    payload = {
        "kind": "market_snapshot",
        "source": snapshot.get("source"),
        "ticker": snapshot["ticker"],
        "asset_class": snapshot["asset_class"],
        "price": snapshot["price"],
        "change": snapshot["change"],
        "change_percent": snapshot["change_percent"],
        "volume": snapshot["volume"],
        "high": snapshot["high"],
        "low": snapshot["low"],
        "currency": snapshot.get("currency"),
        "short_name": snapshot.get("short_name"),
        "exchange": snapshot.get("exchange"),
        "observed_at": snapshot.get("observed_at"),
        "collector_observed_at": run_started_at,
    }
    return {
        "source_name": "yfinance",
        "source_item_id": f"{snapshot['ticker']}:{snapshot.get('observed_at', run_started_at)}",
        "source_url": snapshot["source_url"],
        "fetched_at": run_started_at,
        "title": f"Market snapshot {snapshot['ticker']}",
        "payload": payload,
        "payload_hash": build_payload_hash(payload),
    }


def normalize_news_item(item: Dict[str, Any], run_started_at: str) -> Dict[str, Any]:
    payload = {
        "kind": "news_item",
        "source": item.get("source"),
        "title": item.get("title"),
        "summary": item.get("summary"),
        "link": item.get("link"),
        "published_at": item.get("published_at"),
        "collector_observed_at": run_started_at,
    }
    source_item_id = (item.get("link") or item.get("title") or "").strip() or None
    return {
        "source_name": item.get("source") or "unknown_news_feed",
        "source_item_id": source_item_id,
        "source_url": item.get("link") or "",
        "fetched_at": run_started_at,
        "title": item.get("title"),
        "payload": payload,
        "payload_hash": build_payload_hash(payload),
    }


def fetch_and_normalize_news(run_started_at: str) -> tuple[List[Dict[str, Any]], List[str]]:
    """Fetch news via centralized utility and normalize for raw ingest."""
    news_items, failures = fetch_news_batch(
        feeds=RSS_CONFIG["feeds"],
        headers_pool=RSS_CONFIG["header_pool"],
        limit_per_feed=MARKET_CONFIG["default_limit_per_feed"],
    )

    normalized = []
    for item in news_items:
        normalized.append(normalize_news_item(item, run_started_at))

    return normalized, failures


def fetch_and_normalize_market_data(run_started_at: str) -> tuple[List[Dict[str, Any]], List[str]]:
    """Fetch market data via centralized utility and normalize for raw ingest."""
    items: List[Dict[str, Any]] = []
    failures: List[str] = []

    for ticker in MARKET_CONFIG["tickers"]:
        snapshot = fetch_market_snapshot(ticker, lookback_days=MARKET_CONFIG["lookback_days"])
        if not snapshot:
            failures.append(f"{ticker}:fetch_failed")
            continue
        items.append(normalize_market_item(snapshot, run_started_at))

    return items, failures


def build_batch_payload(
    run_started_at: str,
    items: List[Dict[str, Any]],
    error_messages: List[str],
) -> Dict[str, Any]:
    unique_items: List[Dict[str, Any]] = []
    seen_keys: set[str] = set()

    for item in items:
        dedupe_key = item.get("payload_hash")
        if not dedupe_key or dedupe_key in seen_keys:
            continue
        seen_keys.add(dedupe_key)
        unique_items.append(item)

    if not unique_items and error_messages:
        status = "failed"
    elif error_messages:
        status = "partial_failed"
    else:
        status = "success"

    return {
        "source_family": COLLECTOR_CONFIG["source_family"],
        "source_name": COLLECTOR_CONFIG["source_name"],
        "run_started_at": run_started_at,
        "status": status,
        "error_count": len(error_messages),
        "last_error": error_messages[-1] if error_messages else None,
        "metadata": {
            "pipeline_version": COLLECTOR_CONFIG["pipeline_version"],
            "collector": COLLECTOR_CONFIG["source_name"],
            "error_messages": error_messages,
        },
        "items": unique_items,
    }


def main() -> int:
    load_pipeline_env()
    run_started_at = utc_now_iso()
    log("INFO", f"Raw ingest run started at {run_started_at}")

    market_items, market_failures = fetch_and_normalize_market_data(run_started_at)
    news_items, news_failures = fetch_and_normalize_news(run_started_at)
    all_items = market_items + news_items
    error_messages = market_failures + news_failures

    payload = build_batch_payload(run_started_at, all_items, error_messages)
    retry_handler = RetryHandler()
    uplink = SupabaseUplink()

    def dispatch_operation() -> tuple[bool, Optional[Dict[str, Any]]]:
        return uplink.dispatch_raw_ingest(payload)

    success, result = retry_handler.execute(dispatch_operation, operation_name="raw_ingest_dispatch")

    received_count = len(payload["items"])
    if success:
        log("OK", f"Raw ingest persisted items={received_count} run_id={result.get('run_id') if result else 'unknown'}")
        if payload["status"] == "partial_failed":
            log("WARN", f"Raw ingest completed with partial failures count={payload['error_count']}")
            return EXIT_PARTIAL_FAILURE
        return EXIT_SUCCESS

    log("ERROR", f"Raw ingest dispatch failed items={received_count} status={payload['status']}")
    return EXIT_FAILURE


if __name__ == "__main__":
    sys.exit(main())
