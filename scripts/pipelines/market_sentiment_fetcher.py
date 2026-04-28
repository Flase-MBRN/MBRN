#!/usr/bin/env python3
"""
/scripts/pipelines/market_sentiment_fetcher.py
PILLAR 3: DATA ARBITRAGE - Market Sentiment Data Pipeline

Responsibilities:
1. Fetch market data from Yahoo Finance (yfinance)
2. Extend coverage with crypto tickers
3. Ingest free finance news via RSS
4. Enrich with local Ollama LLM sentiment analysis via LocalLLMBridge
5. Output structured JSON for dashboard and Supabase ingestion

Hardware Optimized For: RX 7700 XT (local LLM inference via Ollama/qwen2.5-coder:14b)
"""

from __future__ import annotations

import json
import os
import sys
import urllib.parse
from datetime import datetime, timezone
import re
from pathlib import Path
from typing import Any, Dict, List, Optional

# =============================================================================
# PATH HANDLING for Bridge Import (Phase 3 Migration)
# =============================================================================
_PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

from bridges.local_llm.bridge import LocalLLMBridge, LocalLLMBridgeConfig

# =============================================================================
# Local Pipeline Utils
# =============================================================================
PROJECT_ROOT = Path(__file__).resolve().parents[2]
PIPELINES_DIR = Path(__file__).resolve().parent
if str(PIPELINES_DIR) not in sys.path:
    sys.path.append(str(PIPELINES_DIR))

from pipeline_utils import (
    MARKET_CONFIG,
    RSS_CONFIG,
    classify_fetch_error,
    classify_news_bias,
    fetch_market_snapshot,
    fetch_news_batch,
    fetch_url_with_retry,
    get_news_impact_seed,
    is_crypto_ticker,
    lazy_json_repair,
    load_pipeline_env,
    log,
    parse_feed_items,
    parse_strict_json_response,
    repair_json_with_ollama,
    safe_round,
    save_json_atomic,
    SupabaseUplink,
    with_retry,
)


# =============================================================================
# CONFIGURATION
# =============================================================================

PIPELINE_CONFIG = {
    "ollama": {
        "host": "localhost",
        "port": 11434,
        "model": "qwen2.5-coder:14b",
        "temperature": 0.3,
        "timeout_seconds": 300,  # OPTIMIERT: Erhöht von 120 auf 300 (5 Min) für RX 7700 XT
    },
    "output": {
        "output_dir": PROJECT_ROOT / "AI" / "models" / "data",
        "dashboard_path": PROJECT_ROOT / "shared" / "data" / "market_sentiment.json",
        "filename_template": "market_sentiment_{timestamp}.json",
        "news_limit": 20,       # OPTIMIERT: Von 10 auf 20 für breitere Datenbasis
    },
    "mbrn": {
        "sentiment_scale": 100,
        "min_confidence": 0.6,
    },
    "supabase": {
        "default_url": "http://127.0.0.1:54321/functions/v1/market_sentiment",
    },
}

# Use centralized RSS_CONFIG from pipeline_utils
ENRICHMENT_REQUIRED_KEYS = [
    "sentiment_score",
    "confidence",
    "analysis",
    "recommendation",
    "crypto_bias",
    "news_bias",
    "news_impact",
    "key_theme",
]
ENRICHMENT_SCHEMA_HINT = """{
  "sentiment_score": 0,
  "confidence": 0.0,
  "analysis": "One sentence summary",
  "recommendation": "buy",
  "crypto_bias": "bullish",
  "news_bias": "neutral",
  "news_impact": 0,
  "key_theme": "short theme"
}"""


# =============================================================================
# DATA FETCHING
# =============================================================================

@with_retry(max_retries=3, base_delay=2.0, operation_name="fetch_batch_data")
def fetch_batch_data(tickers: List[str], lookback_days: int = 5) -> List[Dict[str, Any]]:
    """Fetch data for multiple tickers using centralized fetch_market_snapshot."""
    results: List[Dict[str, Any]] = []
    for ticker in tickers:
        data = fetch_market_snapshot(ticker, lookback_days=lookback_days)
        if data:
            try:
                import yfinance as yf
                stock = yf.Ticker(ticker)
                info = getattr(stock, "info", {}) or {}
                data["market_cap"] = info.get("marketCap")
                data["pe_ratio"] = info.get("trailingPE")
            except Exception:
                pass
            results.append(data)
    return results


@with_retry(max_retries=3, base_delay=2.0, operation_name="fetch_news_items")
def fetch_news_items(limit: int = 20) -> List[Dict[str, Any]]:
    """Fetch, merge and rank RSS headlines using centralized utility."""
    news_items, _ = fetch_news_batch(
        feeds=RSS_CONFIG["feeds"],
        headers_pool=RSS_CONFIG["header_pool"],
        limit_per_feed=limit,
    )
    news_items.sort(key=lambda item: item.get("published_at", ""), reverse=True)
    return news_items[:limit]


# =============================================================================
# OLLAMA LOCAL LLM ENRICHMENT
# =============================================================================

def build_market_summary(market_data: List[Dict[str, Any]]) -> str:
    """Summarize tickers for the local LLM prompt."""
    lines = []
    for item in market_data:
        label = "Crypto" if item.get("asset_class") == "crypto" else "Market"
        lines.append(
            f"{label} {item['ticker']}: ${item['price']} ({item['change_percent']:+.2f}%), "
            f"Vol={item['volume']}, DayRange={item['low']}-{item['high']}"
        )
    return "\n".join(lines)


def build_news_summary(news_items: List[Dict[str, Any]]) -> str:
    """Compress RSS headlines into a prompt-friendly summary."""
    if not news_items:
        return "No finance RSS headlines available."

    lines = []
    # OPTIMIERT: Erhöht auf 15 Headlines für die KI-Analyse
    for item in news_items[:15]:
        lines.append(
            f"- [{item['source']}] {item['title']} ({item['published_at']})"
        )
    return "\n".join(lines)


def build_neutral_enrichment(
    analysis: str,
    fallback_news_bias: str,
    fallback_news_impact: int,
    key_theme: str,
    confidence: float = 0.0,
) -> Dict[str, Any]:
    return {
        "sentiment_score": 50,
        "confidence": confidence,
        "analysis": analysis,
        "recommendation": "hold",
        "crypto_bias": "neutral",
        "news_bias": fallback_news_bias,
        "news_impact": fallback_news_impact,
        "key_theme": key_theme,
        "model": PIPELINE_CONFIG["ollama"]["model"] if key_theme != "fallback_neutral" else "none",
        "processed_at": datetime.now(timezone.utc).isoformat(),
    }


def normalize_recommendation(value: Any) -> str:
    text = str(value or "").strip().lower()
    if text in {"buy", "sell", "hold", "caution"}:
        return text
    if "buy" in text or "bull" in text:
        return "buy"
    if "sell" in text or "bear" in text:
        return "sell"
    if "caution" in text or "warn" in text:
        return "caution"
    return "hold"


def normalize_bias(value: Any) -> str:
    text = str(value or "").strip().lower()
    if "bull" in text:
        return "bullish"
    if "bear" in text:
        return "bearish"
    return "neutral"


def enrich_with_ollama(
    market_data: List[Dict[str, Any]],
    news_items: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    news_items = news_items or []
    fallback_news_bias = classify_news_bias(news_items)
    fallback_news_impact = get_news_impact_seed(news_items)

    bridge = LocalLLMBridge(
        LocalLLMBridgeConfig(
            host=PIPELINE_CONFIG["ollama"]["host"],
            port=PIPELINE_CONFIG["ollama"]["port"],
            model=os.getenv("OLLAMA_MODEL", PIPELINE_CONFIG["ollama"]["model"]),
            timeout_seconds=PIPELINE_CONFIG["ollama"]["timeout_seconds"],
            temperature=PIPELINE_CONFIG["ollama"]["temperature"],
        )
    )

    if not bridge.is_available():
        print("[WARN] Ollama not available. Skipping LLM enrichment.")
        return build_neutral_enrichment(
            analysis="Ollama unavailable - default neutral score",
            fallback_news_bias=fallback_news_bias,
            fallback_news_impact=fallback_news_impact,
            key_theme="fallback_neutral",
            confidence=0.0,
        )

    market_summary = build_market_summary(market_data)
    news_summary = build_news_summary(news_items)

    prompt = f"""You are a high-precision MBRN Market Analysis Engine (Optimized for qwen2.5-coder:14b). 
Return ONLY valid JSON. No markdown, no explanations.
You are a professional JSON-only output engine. Never add conversational filler or markdown code blocks like ```json. Output raw JSON only.

Analyze the following market data and finance headlines to calculate a professional **Market Impact Score (0-100)**.
(0 = Extreme Systemic Risk/Bearish | 100 = Parabolic Growth/Bullish)

Your analysis MUST factor in:
1) **Liquidity & Volatility:** Volume trends and VIX/Price relationship.
2) **Regulatory Pressure:** SEC news or institutional regulatory shifts.
3) **Asset Correlation:** Momentum alignment between Equities and Crypto.

Respond in this exact JSON format:
{ENRICHMENT_SCHEMA_HINT}

Market Data:
{market_summary}

Finance Headlines:
{news_summary}"""

    try:
        raw_output = bridge._request_model(prompt, worker_name="market_sentiment_enrichment")

        if not raw_output:
            log("WARN", "Empty response from Ollama")
            return build_neutral_enrichment(
                analysis="Empty response from Ollama",
                fallback_news_bias=fallback_news_bias,
                fallback_news_impact=fallback_news_impact,
                key_theme="empty_response",
                confidence=0.0,
            )

        sentiment_data = _lenient_json_parse(raw_output, log_prefix="sentiment")

        if sentiment_data is None:
            try:
                sentiment_data = parse_strict_json_response(raw_output, required_keys=ENRICHMENT_REQUIRED_KEYS)
            except ValueError:
                sentiment_data = None

        if sentiment_data is None:
            repaired = repair_json_with_ollama(
                raw_output=raw_output,
                schema_hint=ENRICHMENT_SCHEMA_HINT,
                model=bridge.config.model,
                timeout=bridge.config.timeout_seconds,
                host=bridge.config.host,
                port=bridge.config.port,
                temperature=0.4,
            )
            if repaired:
                sentiment_data = repaired
            else:
                return build_neutral_enrichment(
                    analysis="JSON parsing failed after all attempts",
                    fallback_news_bias=fallback_news_bias,
                    fallback_news_impact=fallback_news_impact,
                    key_theme="parse_failed",
                    confidence=0.0,
                )

        return {
            "sentiment_score": max(0, min(100, int(sentiment_data.get("sentiment_score", 50)))),
            "confidence": max(0.0, min(1.0, float(sentiment_data.get("confidence", 0.5)))),
            "analysis": sentiment_data.get("analysis", "No analysis provided"),
            "recommendation": normalize_recommendation(sentiment_data.get("recommendation", "hold")),
            "crypto_bias": normalize_bias(sentiment_data.get("crypto_bias", "neutral")),
            "news_bias": normalize_bias(sentiment_data.get("news_bias", fallback_news_bias)),
            "news_impact": max(0, min(100, int(sentiment_data.get("news_impact", fallback_news_impact)))),
            "key_theme": str(sentiment_data.get("key_theme", "mixed_signals"))[:80],
            "model": PIPELINE_CONFIG["ollama"]["model"],
            "processed_at": datetime.now(timezone.utc).isoformat(),
        }

    except Exception as exc:
        print(f"[ERROR] Ollama enrichment failed: {exc}")
        return build_neutral_enrichment(
            analysis=f"Error: {exc}",
            fallback_news_bias=fallback_news_bias,
            fallback_news_impact=fallback_news_impact,
            key_theme="runtime_error",
            confidence=0.0,
        )


def _lenient_json_parse(raw_text: str, log_prefix: str = "lenient_parse") -> Optional[Dict[str, Any]]:
    if not raw_text:
        return None
    candidates = []
    candidates.append(raw_text.strip())
    first_brace = raw_text.find("{")
    last_brace = raw_text.rfind("}")
    if first_brace != -1 and last_brace > first_brace:
        extracted = raw_text[first_brace:last_brace + 1].strip()
        if extracted:
            candidates.append(extracted)
    cleaned = re.sub(r'```json\s*\n?', '', raw_text, flags=re.IGNORECASE)
    cleaned = re.sub(r'```\s*\n?', '', cleaned).strip()
    if cleaned and cleaned not in candidates:
        candidates.append(cleaned)
    for candidate in list(candidates):
        no_trailing = re.sub(r',\s*([}\]])', r'\1', candidate)
        no_comments = re.sub(r'//.*?\n', '\n', no_trailing)
        no_comments = re.sub(r'/\*.*?\*/', '', no_comments, flags=re.DOTALL)
        if no_comments not in candidates:
            candidates.append(no_comments)
    for candidate in candidates:
        try:
            parsed = json.loads(candidate)
            if isinstance(parsed, dict):
                return parsed
        except json.JSONDecodeError:
            continue
    return None


def save_to_json(data: Dict[str, Any], output_dir: Optional[str | Path] = None) -> str:
    output_path = Path(output_dir) if output_dir else Path(PIPELINE_CONFIG["output"]["output_dir"])
    output_path.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    filename = PIPELINE_CONFIG["output"]["filename_template"].format(timestamp=timestamp)
    filepath = output_path / filename
    save_json_atomic(filepath, data)
    print(f"[INFO] Data saved to: {filepath}")
    return str(filepath)


def save_for_dashboard(data: Dict[str, Any]) -> str:
    dashboard_path = Path(PIPELINE_CONFIG["output"]["dashboard_path"])
    dashboard_data = {
        "timestamp_utc": data["fetched_at"],
        "source": "market_sentiment_pipeline",
        "sentiment_score": data["enrichment"]["sentiment_score"],
        "sentiment_label": get_sentiment_label(data["enrichment"]["sentiment_score"]),
        "confidence": data["enrichment"]["confidence"],
        "analysis": data["enrichment"]["analysis"],
        "recommendation": data["enrichment"]["recommendation"],
        "crypto_bias": data["enrichment"].get("crypto_bias", "neutral"),
        "news_bias": data["enrichment"].get("news_bias", "neutral"),
        "news_impact": data["enrichment"].get("news_impact", 0),
        "key_theme": data["enrichment"].get("key_theme", "mixed_signals"),
        "market_data": data["market_data"],
        "news_feed": data.get("news_feed", []),
        "mbrn_enriched": data["enrichment"],
    }
    save_json_atomic(dashboard_path, dashboard_data)
    print(f"[INFO] Dashboard data saved to: {dashboard_path}")
    return str(dashboard_path)


def get_sentiment_label(score: int) -> str:
    if score <= 20: return "Extreme Fear"
    if score <= 40: return "Fear"
    if score <= 60: return "Neutral"
    if score <= 80: return "Greed"
    return "Extreme Greed"


def prepare_for_supabase(data: Dict[str, Any]) -> Dict[str, Any]:
    market_data = data.get("market_data", [])
    return {
        "id": f"mkt_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source": "market_sentiment_pipeline",
        "sentiment_score": data["enrichment"]["sentiment_score"],
        "verdict": get_sentiment_label(data["enrichment"]["sentiment_score"]),
        "confidence": data["enrichment"]["confidence"],
        "recommendation": data["enrichment"]["recommendation"],
        "raw_data": {
            "market_data": market_data,
            "news_feed": data.get("news_feed", []),
        },
        "mbrn_enriched": data["enrichment"],
        "metadata": {
            "pipeline_version": "1.1.0",
            "ollama_model": data["enrichment"].get("model", "none"),
            "tickers_analyzed": len(market_data),
            "headline_count": len(data.get("news_feed", [])),
            "crypto_pairs": len([item for item in market_data if item.get("asset_class") == "crypto"]),
        },
    }


@with_retry(max_retries=3, base_delay=5.0, operation_name="push_to_supabase")
def push_to_supabase(payload: Dict[str, Any]) -> bool:
    uplink = SupabaseUplink()
    return uplink.dispatch(payload)


def main():
    load_pipeline_env()
    print("=" * 60)
    print("MBRN PILLAR 3: Data Arbitrage Pipeline")
    print("Market Sentiment Fetcher v1.1")
    print("=" * 60)

    print("\n[1/5] Fetching market and crypto data...")
    tickers = MARKET_CONFIG["tickers"]
    market_data = fetch_batch_data(tickers, lookback_days=MARKET_CONFIG["lookback_days"])
    if not market_data:
        print("[FATAL] No market data fetched. Exiting.")
        sys.exit(1)
    print(f"[OK] Fetched data for {len(market_data)} tickers")

    print("\n[2/5] Fetching RSS finance headlines...")
    news_items = fetch_news_items(limit=PIPELINE_CONFIG["output"]["news_limit"])
    print(f"[OK] Fetched {len(news_items)} RSS headlines")

    print("\n[3/5] Enriching with Ollama LLM...")
    print(f"        Model: {PIPELINE_CONFIG['ollama']['model']}")
    enrichment = enrich_with_ollama(market_data, news_items=news_items)
    print(f"[OK] Sentiment Score: {enrichment['sentiment_score']}/100")
    print(f"     Confidence: {enrichment['confidence']:.1%}")
    print(f"     Analysis: {enrichment['analysis']}")

    full_record = {
        "pipeline": "market_sentiment",
        "version": "1.1.0",
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "market_data": market_data,
        "news_feed": news_items,
        "enrichment": enrichment,
    }

    print("\n[4/5] Saving to local storage...")
    save_to_json(full_record)

    print("\n[4b/5] Saving dashboard data...")
    save_for_dashboard(full_record)

    print("\n[5/5] Preparing Supabase payload...")
    supabase_data = prepare_for_supabase(full_record)
    print(json.dumps(supabase_data, indent=2))

    print("\n[5b/5] Pushing to Supabase Edge Function...")
    push_to_supabase(supabase_data)
    print("\n" + "=" * 60 + "\nPipeline Complete.\n" + "=" * 60)
    return supabase_data


if __name__ == "__main__":
    main()