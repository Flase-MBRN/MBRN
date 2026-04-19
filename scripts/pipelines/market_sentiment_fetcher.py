#!/usr/bin/env python3
"""
/scripts/pipelines/market_sentiment_fetcher.py
PILLAR 3: DATA ARBITRAGE - Market Sentiment Data Pipeline

Responsibilities:
1. Fetch market data from Yahoo Finance (yfinance)
2. Extend coverage with crypto tickers
3. Ingest free finance news via RSS
4. Enrich with local Ollama LLM sentiment analysis
5. Output structured JSON for dashboard and Supabase ingestion

Hardware Optimized For: RX 7700 XT (local LLM inference via Ollama/Llama 3.1)
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional


PROJECT_ROOT = Path(__file__).resolve().parents[2]
PIPELINES_DIR = Path(__file__).resolve().parent
if str(PIPELINES_DIR) not in sys.path:
    sys.path.append(str(PIPELINES_DIR))

from pipeline_utils import (
    classify_fetch_error,
    fetch_url_with_retry,
    load_pipeline_env,
    log,
    parse_feed_items,
    parse_strict_json_response,
    repair_json_with_ollama,
    save_json_atomic,
)
from secure_key_manager import SecureKeyManager


# =============================================================================
# CONFIGURATION
# =============================================================================

CONFIG = {
    "ollama": {
        "host": "localhost",
        "port": 11434,
        "model": "llama3.1:8b",
        "temperature": 0.3,
        "timeout_seconds": 120,
    },
    "data": {
        "output_dir": PROJECT_ROOT / "AI" / "models" / "data",
        "dashboard_path": PROJECT_ROOT / "shared" / "data" / "market_sentiment.json",
        "filename_template": "market_sentiment_{timestamp}.json",
        "tickers": ["SPY", "QQQ", "DIA", "IWM", "^VIX", "BTC-USD", "ETH-USD"],
        "lookback_days": 5,
        "news_limit": 10,
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
                "url": "https://www.cnbc.com/?format=rss",
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
    "mbrn": {
        "sentiment_scale": 100,
        "min_confidence": 0.6,
    },
    "supabase": {
        "default_url": "http://127.0.0.1:54321/functions/v1/market_sentiment",
    },
}

RSS_USER_AGENT = "MBRN-MarketSentiment/1.0 (+local-rss-ingestion)"
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
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
        "Accept": "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
    },
    {
        "User-Agent": RSS_USER_AGENT,
        "Accept": "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
    },
]
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
POSITIVE_NEWS_KEYWORDS = {
    "surge", "rally", "beat", "growth", "expand", "record", "gain", "approve", "bull", "optimism",
}
NEGATIVE_NEWS_KEYWORDS = {
    "drop", "fall", "miss", "cut", "downgrade", "lawsuit", "probe", "investigation", "crash", "bear",
}


# =============================================================================
# HELPERS
# =============================================================================

def safe_round(value: Any, digits: int = 2) -> Optional[float]:
    """Round values from pandas/yfinance safely."""
    try:
        if value is None:
            return None
        return round(float(value), digits)
    except (TypeError, ValueError):
        return None


def is_crypto_ticker(ticker: str) -> bool:
    """Identify crypto pairs inside the mixed market ticker list."""
    return ticker.endswith("-USD")


def classify_news_bias(news_items: List[Dict[str, Any]]) -> str:
    """Derive a lightweight deterministic news bias from headline keywords."""
    balance = 0
    for item in news_items:
        text = f"{item.get('title', '')} {item.get('summary', '')}".lower()
        balance += sum(1 for keyword in POSITIVE_NEWS_KEYWORDS if keyword in text)
        balance -= sum(1 for keyword in NEGATIVE_NEWS_KEYWORDS if keyword in text)

    if balance > 1:
        return "bullish"
    if balance < -1:
        return "bearish"
    return "neutral"


def get_news_impact_seed(news_items: List[Dict[str, Any]]) -> int:
    """Estimate the raw impact seed before LLM enrichment."""
    if not news_items:
        return 0
    headline_weight = min(50, len(news_items) * 6)
    keyword_weight = 0
    for item in news_items[:5]:
        text = f"{item.get('title', '')} {item.get('summary', '')}".lower()
        keyword_weight += 4 * sum(1 for keyword in POSITIVE_NEWS_KEYWORDS | NEGATIVE_NEWS_KEYWORDS if keyword in text)
    return min(100, headline_weight + keyword_weight)


# =============================================================================
# DATA FETCHING (Yahoo Finance via yfinance or fallback)
# =============================================================================

def fetch_market_data(ticker: str) -> Optional[Dict[str, Any]]:
    """
    Fetch market data for a given ticker symbol.

    Primary: yfinance
    Fallback: development-safe mock payload
    """
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

        return {
            "ticker": ticker,
            "asset_class": "crypto" if is_crypto_ticker(ticker) else "equity",
            "price": safe_round(latest_close, 2) or 0.0,
            "change": safe_round(change, 2) or 0.0,
            "change_percent": safe_round(change_pct, 2) or 0.0,
            "volume": int(latest.get("Volume", 0) or 0),
            "high": safe_round(latest.get("High"), 2) or 0.0,
            "low": safe_round(latest.get("Low"), 2) or 0.0,
            "market_cap": info.get("marketCap"),
            "pe_ratio": info.get("trailingPE"),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "source": "yfinance",
        }

    except ImportError:
        print(f"[WARN] yfinance not installed. Using fallback for {ticker}")
        return fetch_market_data_fallback(ticker)
    except Exception as exc:
        print(f"[ERROR] Failed to fetch {ticker}: {exc}")
        return None


def fetch_market_data_fallback(ticker: str) -> Optional[Dict[str, Any]]:
    """Fallback data fetcher for development and offline situations."""
    return {
        "ticker": ticker,
        "asset_class": "crypto" if is_crypto_ticker(ticker) else "equity",
        "price": 0.0,
        "change": 0.0,
        "change_percent": 0.0,
        "volume": 0,
        "high": 0.0,
        "low": 0.0,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source": "fallback_mock",
        "note": "Install yfinance: pip install yfinance",
    }


def fetch_batch_data(tickers: List[str]) -> List[Dict[str, Any]]:
    """Fetch data for multiple tickers."""
    results: List[Dict[str, Any]] = []
    for ticker in tickers:
        data = fetch_market_data(ticker)
        if data:
            results.append(data)
    return results


# =============================================================================
def fetch_news_items() -> List[Dict[str, Any]]:
    """Fetch, merge and rank RSS headlines across free finance feeds."""
    collected: List[Dict[str, Any]] = []
    seen_keys: set[str] = set()

    for feed in CONFIG["data"]["news_feeds"]:
        try:
            payload = fetch_url_with_retry(
                url=feed["url"],
                headers_pool=RSS_HEADER_POOL,
                timeout_seconds=int(feed.get("timeout_seconds", 8)),
                retries=int(feed.get("retries", 2)),
            )
            parsed_items = parse_feed_items(
                payload,
                feed["source"],
                str(feed.get("parser_hint", "xml")),
            )
            if not parsed_items:
                log("WARN", f"RSS feed unhealthy source={feed['source']} reason=empty_feed")
                continue
            log("OK", f"RSS loaded source={feed['source']} items={len(parsed_items)}")
        except Exception as exc:
            reason = classify_fetch_error(exc)
            log("WARN", f"RSS feed unhealthy source={feed['source']} reason={reason} detail={exc}")
            continue

        for item in parsed_items:
            dedupe_key = (item.get("link") or item.get("title") or "").strip().lower()
            if not dedupe_key or dedupe_key in seen_keys:
                continue
            seen_keys.add(dedupe_key)
            collected.append(item)

    collected.sort(key=lambda item: item.get("published_at", ""), reverse=True)
    return collected[: CONFIG["data"]["news_limit"]]


# =============================================================================
# OLLAMA LOCAL LLM ENRICHMENT
# =============================================================================

def check_ollama_health() -> bool:
    """Check if Ollama is running locally."""
    try:
        url = f"http://{CONFIG['ollama']['host']}:{CONFIG['ollama']['port']}/api/tags"
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=5) as response:
            return response.status == 200
    except Exception:
        return False


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
    for item in news_items[:5]:
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
    """Build the canonical neutral fallback enrichment payload."""
    return {
        "sentiment_score": 50,
        "confidence": confidence,
        "analysis": analysis,
        "recommendation": "hold",
        "crypto_bias": "neutral",
        "news_bias": fallback_news_bias,
        "news_impact": fallback_news_impact,
        "key_theme": key_theme,
        "model": CONFIG["ollama"]["model"] if key_theme != "fallback_neutral" else "none",
        "processed_at": datetime.now(timezone.utc).isoformat(),
    }


def normalize_recommendation(value: Any) -> str:
    """Clamp model recommendation values to the fetcher contract."""
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
    """Normalize directional labels to bullish/bearish/neutral."""
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
    """
    Enrich market data with local LLM sentiment analysis.

    Includes equity, crypto and RSS headline context.
    """
    news_items = news_items or []
    fallback_news_bias = classify_news_bias(news_items)
    fallback_news_impact = get_news_impact_seed(news_items)

    if not check_ollama_health():
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

    prompt = f"""Analyze the following market data and finance headlines.
Return ONLY a valid JSON object. No preamble, no explanation, no markdown.
Return a 0-100 market sentiment score where 0 is extremely bearish and 100 is extremely bullish.
You must account for equities, VIX, crypto momentum and news pressure.

Market Data:
{market_summary}

Finance Headlines:
{news_summary}

Respond in this exact JSON format:
{ENRICHMENT_SCHEMA_HINT}"""

    try:
        url = f"http://{CONFIG['ollama']['host']}:{CONFIG['ollama']['port']}/api/generate"
        payload = {
            "model": CONFIG["ollama"]["model"],
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": CONFIG["ollama"]["temperature"],
            },
        }

        data = json.dumps(payload).encode("utf-8")
        headers = {"Content-Type": "application/json"}
        req = urllib.request.Request(url, data=data, headers=headers, method="POST")

        with urllib.request.urlopen(req, timeout=CONFIG["ollama"]["timeout_seconds"]) as response:
            result = json.loads(response.read().decode("utf-8"))

        llm_output = result.get("response", "{}")
        try:
            sentiment_data = parse_strict_json_response(
                llm_output,
                required_keys=ENRICHMENT_REQUIRED_KEYS,
            )
        except ValueError as parse_error:
            log("WARN", f"Primary Ollama JSON parse failed: {parse_error}")
            sentiment_data = repair_json_with_ollama(
                raw_output=llm_output,
                schema_hint=ENRICHMENT_SCHEMA_HINT,
                model=CONFIG["ollama"]["model"],
                timeout=CONFIG["ollama"]["timeout_seconds"],
                host=CONFIG["ollama"]["host"],
                port=CONFIG["ollama"]["port"],
            )
            if not sentiment_data:
                return build_neutral_enrichment(
                    analysis=f"Failed to parse LLM output: {llm_output[:100]}...",
                    fallback_news_bias=fallback_news_bias,
                    fallback_news_impact=fallback_news_impact,
                    key_theme="parse_error",
                    confidence=0.3,
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
            "model": CONFIG["ollama"]["model"],
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


# =============================================================================
# OUTPUT & STORAGE
# =============================================================================

def save_to_json(data: Dict[str, Any], output_dir: Optional[str | Path] = None) -> str:
    """Save enriched data to a timestamped JSON artifact."""
    output_path = Path(output_dir) if output_dir else Path(CONFIG["data"]["output_dir"])
    output_path.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    filename = CONFIG["data"]["filename_template"].format(timestamp=timestamp)
    filepath = output_path / filename
    save_json_atomic(filepath, data)

    print(f"[INFO] Data saved to: {filepath}")
    return str(filepath)


def save_for_dashboard(data: Dict[str, Any]) -> str:
    """Persist the dashboard-facing snapshot."""
    dashboard_path = Path(CONFIG["data"]["dashboard_path"])
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
    """Convert numeric score to a market mood label."""
    if score <= 20:
        return "Extreme Fear"
    if score <= 40:
        return "Fear"
    if score <= 60:
        return "Neutral"
    if score <= 80:
        return "Greed"
    return "Extreme Greed"


def prepare_for_supabase(data: Dict[str, Any]) -> Dict[str, Any]:
    """Prepare data for Supabase ingestion."""
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


def push_to_supabase(payload: Dict[str, Any]) -> bool:
    """Push data to Supabase Edge Function via secure credential lookup."""
    load_pipeline_env()

    url = os.getenv("SUPABASE_EDGE_FUNCTION_URL", CONFIG["supabase"]["default_url"])
    api_key = None

    try:
        api_key = SecureKeyManager().get_key("DATA_ARB_API_KEY")
    except Exception as exc:
        print(f"[WARN] SecureKeyManager unavailable: {exc}")

    api_key = api_key or os.getenv("DATA_ARB_API_KEY")
    if not api_key:
        print("[WARN] DATA_ARB_API_KEY not found in Credential Manager or .env. Skipping Supabase push.")
        return False

    try:
        body = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=body, method="POST")
        req.add_header("Content-Type", "application/json")
        req.add_header("Authorization", f"Bearer {api_key}")

        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status in (200, 201):
                print(f"[OK] Successfully pushed to Supabase: {response.read().decode()}")
                return True

            print(f"[ERROR] Supabase push failed with status {response.status}: {response.read().decode()}")
            return False

    except urllib.error.HTTPError as exc:
        print(f"[ERROR] Supabase push failed with HTTP {exc.code}: {exc.read().decode()}")
        return False
    except Exception as exc:
        print(f"[ERROR] Exception during Supabase push: {exc}")
        return False


# =============================================================================
# MAIN EXECUTION
# =============================================================================

def main():
    """
    Main execution: Full Pillar 3 Data Arbitrage Pipeline.

    Flow:
    1. Fetch market + crypto data
    2. Fetch finance RSS headlines
    3. Enrich with Ollama LLM
    4. Save to JSON
    5. Output Supabase-ready format
    """
    load_pipeline_env()

    print("=" * 60)
    print("MBRN PILLAR 3: Data Arbitrage Pipeline")
    print("Market Sentiment Fetcher v1.1")
    print("=" * 60)

    print("\n[1/5] Fetching market and crypto data...")
    tickers = CONFIG["data"]["tickers"]
    market_data = fetch_batch_data(tickers)
    if not market_data:
        print("[FATAL] No market data fetched. Exiting.")
        sys.exit(1)
    print(f"[OK] Fetched data for {len(market_data)} tickers")

    print("\n[2/5] Fetching RSS finance headlines...")
    news_items = fetch_news_items()
    print(f"[OK] Fetched {len(news_items)} RSS headlines")

    print("\n[3/5] Enriching with Ollama LLM...")
    print(f"       Model: {CONFIG['ollama']['model']}")
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
        "derived_metrics": {
            "news_bias_seed": classify_news_bias(news_items),
            "news_impact_seed": get_news_impact_seed(news_items),
        },
    }

    print("\n[4/5] Saving to local storage...")
    saved_path = save_to_json(full_record)

    print("\n[4b/5] Saving dashboard data...")
    dashboard_path = save_for_dashboard(full_record)

    print("\n[5/5] Preparing Supabase payload...")
    supabase_data = prepare_for_supabase(full_record)
    print("\n--- SUPABASE PAYLOAD ---")
    print(json.dumps(supabase_data, indent=2))

    print("\n[5b/5] Pushing to Supabase Edge Function...")
    push_to_supabase(supabase_data)

    print("\n" + "=" * 60)
    print("Pipeline Complete. Next steps:")
    print(f"  1. Data saved: {saved_path}")
    print(f"  2. Dashboard data: {dashboard_path}")
    print("  3. Verify dashboard sentiment + oracle widgets")
    print("=" * 60)

    return supabase_data


if __name__ == "__main__":
    result = main()
    sys.exit(0 if result else 1)
