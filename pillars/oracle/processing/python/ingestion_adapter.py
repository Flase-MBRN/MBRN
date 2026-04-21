from __future__ import annotations

import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional

from pillars.oracle.processing.python.numerology_engine import (
    cache_numerology_history,
    calculate_day_number,
    get_day_description,
    get_numerology_for_date_range,
    is_master_number,
    load_cached_numerology_history,
)

PROJECT_ROOT = Path(__file__).resolve().parents[4]

CONFIG = {
    "oracle_inputs": {
        "market_sentiment_path": str(PROJECT_ROOT / "shared" / "data" / "market_sentiment.json"),
        "numerology_cache_path": str(PROJECT_ROOT / "shared" / "data" / "numerology_history.json"),
        "market_data_dir": str(PROJECT_ROOT / "AI" / "models" / "data"),
        "filename_pattern": "market_sentiment_*.json",
    },
}

def load_pillar1_historical(days: int = 90, use_cache: bool = True, target_dates: Optional[List[str]] = None) -> List[Dict[str, Any]]:
    if target_dates:
        data: List[Dict[str, Any]] = []
        for date_str in target_dates:
            day_number = calculate_day_number(date_str)
            data.append(
                {
                    "date": date_str,
                    "date_utc": datetime.strptime(date_str, "%d.%m.%Y").strftime("%Y-%m-%dT00:00:00Z"),
                    "day_number": day_number,
                    "is_master": is_master_number(day_number),
                    "description": get_day_description(day_number),
                }
            )
        return data

    if use_cache:
        cached = load_cached_numerology_history(CONFIG["oracle_inputs"]["numerology_cache_path"])
        if cached:
            return cached[-days:] if len(cached) > days else cached

    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    start_date_str = start_date.strftime("%d.%m.%Y")
    data = get_numerology_for_date_range(start_date_str, days)
    cache_numerology_history(data, CONFIG["oracle_inputs"]["numerology_cache_path"])
    return data

def get_numerology_relevance(day_number: int) -> float:
    if day_number in [11, 22, 33]:
        return 1.0
    if day_number in [1, 8, 9]:
        return 0.8
    if day_number in [4, 5, 7]:
        return 0.6
    return 0.5

def extract_vix_level(market_data: List[Dict[str, Any]]) -> float:
    for ticker in market_data:
        if ticker.get("ticker") == "^VIX":
            return float(ticker.get("price", 20.0) or 20.0)
    return 20.0

def extract_crypto_snapshot(market_data: List[Dict[str, Any]]) -> Dict[str, Dict[str, float]]:
    snapshot: Dict[str, Dict[str, float]] = {}
    for ticker in market_data:
        symbol = ticker.get("ticker")
        if symbol not in {"BTC-USD", "ETH-USD"}:
            continue
        snapshot[symbol] = {
            "price": float(ticker.get("price", 0.0) or 0.0),
            "change_percent": float(ticker.get("change_percent", 0.0) or 0.0),
            "volume": float(ticker.get("volume", 0.0) or 0.0),
        }
    return snapshot

def calculate_crypto_sentiment(market_data: List[Dict[str, Any]]) -> float:
    changes = [
        float(ticker.get("change_percent", 0.0) or 0.0)
        for ticker in market_data
        if ticker.get("ticker") in {"BTC-USD", "ETH-USD"}
    ]
    if not changes:
        return 50.0

    avg_change = sum(changes) / len(changes)
    score = 50 + (avg_change * 4)
    return round(max(0.0, min(100.0, score)), 2)

def load_pillar3_sentiment(days: int = 90) -> List[Dict[str, Any]]:
    data_dir = Path(CONFIG["oracle_inputs"]["market_data_dir"])
    pattern = CONFIG["oracle_inputs"]["filename_pattern"]

    if not data_dir.exists():
        return []

    files = sorted(data_dir.glob(pattern), reverse=True)
    if not files:
        return []

    files_to_load = files[:days]
    sentiment_data: List[Dict[str, Any]] = []
    for file_path in files_to_load:
        try:
            with open(file_path, "r", encoding="utf-8") as handle:
                data = json.load(handle)

            record = {
                "timestamp_utc": data.get("fetched_at"),
                "sentiment_score": data.get("enrichment", {}).get("sentiment_score", 50),
                "confidence": data.get("enrichment", {}).get("confidence", 0.0),
                "analysis": data.get("enrichment", {}).get("analysis", ""),
                "recommendation": data.get("enrichment", {}).get("recommendation", "hold"),
                "news_signal": data.get("enrichment", {}).get("news_bias", "neutral"),
                "news_impact": data.get("enrichment", {}).get("news_impact", 0),
                "news_items": data.get("news_feed", []),
                "raw_market_data": data.get("market_data", []),
            }
            record["crypto_snapshot"] = extract_crypto_snapshot(record["raw_market_data"])
            record["crypto_sentiment"] = calculate_crypto_sentiment(record["raw_market_data"])

            if record["timestamp_utc"] is None:
                continue

            sentiment_data.append(record)
        except Exception:
            continue

    sentiment_data.sort(key=lambda item: item["timestamp_utc"], reverse=True)
    return sentiment_data

def merge_datasets(pillar1_data: List[Dict[str, Any]], pillar3_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    sentiment_lookup: Dict[str, Dict[str, Any]] = {}
    for record in pillar3_data:
        try:
            timestamp = str(record["timestamp_utc"])
            if timestamp.endswith("Z"):
                timestamp = timestamp.replace("Z", "+00:00")
            dt = datetime.fromisoformat(timestamp)
            sentiment_lookup[dt.strftime("%d.%m.%Y")] = record
        except Exception:
            continue

    merged: List[Dict[str, Any]] = []
    for numerology_record in pillar1_data:
        date_str = numerology_record["date"]
        sentiment_record = sentiment_lookup.get(date_str)
        if not sentiment_record:
            continue

        merged.append(
            {
                "date": date_str,
                "date_utc": numerology_record["date_utc"],
                "numerology": {
                    "day_number": numerology_record["day_number"],
                    "is_master": numerology_record["is_master"],
                    "description": numerology_record["description"],
                    "relevance_score": get_numerology_relevance(numerology_record["day_number"]),
                },
                "market": {
                    "sentiment_score": sentiment_record["sentiment_score"],
                    "confidence": sentiment_record["confidence"],
                    "vix_level": extract_vix_level(sentiment_record["raw_market_data"]),
                    "recommendation": sentiment_record["recommendation"],
                    "crypto_snapshot": sentiment_record.get("crypto_snapshot", {}),
                    "crypto_sentiment": sentiment_record.get("crypto_sentiment", 50.0),
                    "news_signal": sentiment_record.get("news_signal", "neutral"),
                    "news_impact": sentiment_record.get("news_impact", 0),
                    "headline_count": len(sentiment_record.get("news_items", [])),
                    "news_items": sentiment_record.get("news_items", []),
                },
            }
        )

    return merged

def load_merged_data(days: int = 90) -> List[Dict[str, Any]]:
    pillar3 = load_pillar3_sentiment(days=days)
    if not pillar3:
        return []

    unique_dates = set()
    for record in pillar3:
        try:
            timestamp = str(record["timestamp_utc"])
            if timestamp.endswith("Z"):
                timestamp = timestamp.replace("Z", "+00:00")
            dt = datetime.fromisoformat(timestamp)
            unique_dates.add(dt.strftime("%d.%m.%Y"))
        except Exception:
            continue

    pillar1 = load_pillar1_historical(days=days, use_cache=False, target_dates=list(unique_dates))
    if not pillar1:
        return []

    return merge_datasets(pillar1, pillar3)
