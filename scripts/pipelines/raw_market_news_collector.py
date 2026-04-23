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
    RetryHandler,
    SupabaseUplink,
    classify_fetch_error,
    fetch_url_with_retry,
    load_pipeline_env,
    log,
    parse_feed_items,
)


EXIT_SUCCESS = 0
EXIT_FAILURE = 1
EXIT_PARTIAL_FAILURE = 2

RSS_HEADER_POOL = [
    {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0 Safari/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
    },
    {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0 Safari/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
    },
    {
        "User-Agent": "MBRN-RawIngest/1.0 (+markets-news-collector)",
        "Accept": "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
    },
]

CONFIG = {
    "source_family": "markets_news",
    "source_name": "raw_market_news_collector",
    "pipeline_version": "1.0.0",
    "data": {
        "tickers": ["SPY", "QQQ", "DIA", "IWM", "^VIX", "BTC-USD", "ETH-USD"],
        "lookback_days": 5,
        "news_limit_per_feed": 25,
        "news_feeds": [
            {
                "source": "Reuters Business",
                "url": "https://feeds.reuters.com/reuters/businessNews",
                "parser_hint": "xml",
                "timeout_seconds": 10,
                "retries": 3,
            },
            {
                "source": "Reuters World",
                "url": "https://feeds.reuters.com/Reuters/worldNews",
                "parser_hint": "xml",
                "timeout_seconds": 10,
                "retries": 3,
            },
            {
                "source": "CNBC Markets",
                "url": "https://www.cnbc.com/id/100003114/device/rss/rss.html",
                "parser_hint": "dirty_xml",
                "timeout_seconds": 8,
                "retries": 2,
            },
            {
                "source": "CNBC Finance",
                "url": "https://www.cnbc.com/id/10000664/device/rss/rss.html",
                "parser_hint": "dirty_xml",
                "timeout_seconds": 8,
                "retries": 2,
            },
            {
                "source": "Google News Markets",
                "url": "https://news.google.com/rss/search?q=markets%20when:7d&hl=en-US&gl=US&ceid=US:en",
                "parser_hint": "dirty_xml",
                "timeout_seconds": 8,
                "retries": 2,
            },
            {
                "source": "Google News Business",
                "url": "https://news.google.com/rss/search?q=finance%20business%20when:7d&hl=en-US&gl=US&ceid=US:en",
                "parser_hint": "dirty_xml",
                "timeout_seconds": 8,
                "retries": 2,
            },
        ],
    },
}


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def safe_round(value: Any, digits: int = 2) -> Optional[float]:
    try:
        if value is None:
            return None
        return round(float(value), digits)
    except (TypeError, ValueError):
        return None


def is_crypto_ticker(ticker: str) -> bool:
    return ticker.endswith("-USD")


def build_payload_hash(payload: Dict[str, Any]) -> str:
    serialized = json.dumps(payload, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()


def fetch_market_snapshot(ticker: str) -> Optional[Dict[str, Any]]:
    try:
        import yfinance as yf

        stock = yf.Ticker(ticker)
        hist = stock.history(period=f"{CONFIG['data']['lookback_days']}d")
        info = getattr(stock, "info", {}) or {}

        if hist.empty:
            return None

        latest = hist.iloc[-1]
        prev = hist.iloc[-2] if len(hist) > 1 else latest
        latest_close = float(latest["Close"])
        prev_close = float(prev["Close"])
        change = latest_close - prev_close
        change_pct = (change / prev_close) * 100 if prev_close else 0.0
        source_timestamp = getattr(latest, "name", None)
        observed_at = utc_now_iso()

        if source_timestamp is not None and hasattr(source_timestamp, "to_pydatetime"):
            observed_at = source_timestamp.to_pydatetime().astimezone(timezone.utc).isoformat()

        return {
            "ticker": ticker,
            "asset_class": "crypto" if is_crypto_ticker(ticker) else "equity",
            "price": safe_round(latest_close, 2) or 0.0,
            "change": safe_round(change, 2) or 0.0,
            "change_percent": safe_round(change_pct, 2) or 0.0,
            "volume": int(float(latest.get("Volume", 0) or 0)),
            "high": safe_round(latest.get("High"), 2) or 0.0,
            "low": safe_round(latest.get("Low"), 2) or 0.0,
            "currency": info.get("currency") or "USD",
            "short_name": info.get("shortName") or ticker,
            "exchange": info.get("exchange") or None,
            "observed_at": observed_at,
            "source": "yfinance",
            "source_url": f"https://finance.yahoo.com/quote/{ticker}",
        }
    except ImportError:
        log("WARN", "yfinance not installed; market snapshots skipped")
        return None
    except Exception as exc:
        log("WARN", f"Market fetch failed ticker={ticker} reason={exc}")
        return None


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


def fetch_news_items() -> tuple[List[Dict[str, Any]], List[str]]:
    collected: List[Dict[str, Any]] = []
    failures: List[str] = []
    seen_hashes: set[str] = set()

    for feed in CONFIG["data"]["news_feeds"]:
        try:
            payload = fetch_url_with_retry(
                url=feed["url"],
                headers_pool=RSS_HEADER_POOL,
                timeout_seconds=int(feed.get("timeout_seconds", 8)),
                retries=int(feed.get("retries", 2)),
            )
            parsed = parse_feed_items(payload, feed["source"], str(feed.get("parser_hint", "xml")))
            if not parsed:
                failures.append(f"{feed['source']}:empty_feed")
                log("WARN", f"News feed empty source={feed['source']}")
                continue

            for item in parsed[: int(feed.get("news_limit", CONFIG["data"]["news_limit_per_feed"]))]:
                normalized = normalize_news_item(item, utc_now_iso())
                if normalized["payload_hash"] in seen_hashes:
                    continue
                seen_hashes.add(normalized["payload_hash"])
                collected.append(normalized)

            log("OK", f"News loaded source={feed['source']} items={len(parsed)}")
        except Exception as exc:
            reason = classify_fetch_error(exc)
            failures.append(f"{feed['source']}:{reason}")
            log("WARN", f"News feed failed source={feed['source']} reason={reason} detail={exc}")

    return collected, failures


def fetch_market_items(run_started_at: str) -> tuple[List[Dict[str, Any]], List[str]]:
    items: List[Dict[str, Any]] = []
    failures: List[str] = []

    for ticker in CONFIG["data"]["tickers"]:
        snapshot = fetch_market_snapshot(ticker)
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
        "source_family": CONFIG["source_family"],
        "source_name": CONFIG["source_name"],
        "run_started_at": run_started_at,
        "status": status,
        "error_count": len(error_messages),
        "last_error": error_messages[-1] if error_messages else None,
        "metadata": {
            "pipeline_version": CONFIG["pipeline_version"],
            "collector": CONFIG["source_name"],
            "error_messages": error_messages,
        },
        "items": unique_items,
    }


def main() -> int:
    load_pipeline_env()
    run_started_at = utc_now_iso()
    log("INFO", f"Raw ingest run started at {run_started_at}")

    market_items, market_failures = fetch_market_items(run_started_at)
    news_items, news_failures = fetch_news_items()
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
