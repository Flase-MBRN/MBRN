from __future__ import annotations

import math
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, List

import yfinance as yf

PROJECT_ROOT = Path(__file__).resolve().parents[4]
PIPELINES_DIR = PROJECT_ROOT / "scripts" / "pipelines"
if str(PIPELINES_DIR) not in sys.path:
    sys.path.append(str(PIPELINES_DIR))

from pipeline_utils import save_json_atomic

from pillars.oracle.processing.python.correlation_analysis import (
    build_correlation_matrix,
    find_patterns,
    get_sentiment_prediction_for_day,
)
from pillars.oracle.processing.python.ingestion_adapter import load_merged_data
from pillars.oracle.processing.python.numerology_engine import (
    calculate_day_number,
    enhance_alignment_score_with_market_streams,
    get_day_description,
)
from pillars.oracle.processing.python.prediction_pipeline import (
    CONFIG as ORACLE_CONFIG,
    build_reasoning,
    calculate_confidence,
    calculate_day_alignment_score,
    determine_sentiment_trend,
    generate_trading_recommendation,
    run,
)

OUTPUT_DIR = PROJECT_ROOT / "AI" / "models" / "data"
BACKTEST_PATH = PROJECT_ROOT / "shared" / "data" / "oracle_backtest.json"
TICKERS = ["SPY", "QQQ", "BTC-USD"]
LOOKBACK_DAYS = 90
DOWNLOAD_PERIOD = "8mo"
REPLAY_MIN_HISTORY_DAYS = 20

def pseudo_sentiment_from_performance(weighted_change_percent: float) -> int:
    if weighted_change_percent >= 0:
        score = 50 + (weighted_change_percent * 20)
    else:
        score = 50 + (weighted_change_percent * 10)
    return max(0, min(100, int(round(score))))

def recommendation_from_score(score: int) -> str:
    if score >= 70:
        return "buy"
    if score <= 30:
        return "sell"
    if score < 45 or score > 55:
        return "hold"
    return "caution"

def confidence_from_change(weighted_change_percent: float) -> float:
    confidence = 0.45 + min(0.45, abs(weighted_change_percent) / 10)
    return round(max(0.3, min(0.9, confidence)), 2)

def safe_float(value: Any) -> float:
    try:
        if value is None or (isinstance(value, float) and math.isnan(value)):
            return 0.0
        return float(value)
    except (TypeError, ValueError):
        return 0.0

def fetch_history() -> Dict[str, Any]:
    frames: Dict[str, Any] = {}
    for ticker in TICKERS:
        frame = yf.download(
            ticker,
            period=DOWNLOAD_PERIOD,
            interval="1d",
            auto_adjust=False,
            progress=False,
            threads=False,
        )
        if frame.empty:
            raise RuntimeError(f"No historical data returned from yfinance for {ticker}")
        frames[ticker] = frame
    return frames

def get_ticker_frame(history: Dict[str, Any], ticker: str) -> Any:
    return history[ticker]

def build_market_entry(frame: Any, current_index: Any, previous_index: Any, ticker: str, fetched_at: datetime) -> Dict[str, Any]:
    current = frame.loc[current_index]
    previous = frame.loc[previous_index]

    close_price = safe_float(current["Close"])
    previous_close = safe_float(previous["Close"])
    change = close_price - previous_close
    change_percent = (change / previous_close) * 100 if previous_close else 0.0

    return {
        "ticker": ticker,
        "asset_class": "crypto" if ticker.endswith("-USD") else "equity",
        "price": round(close_price, 2),
        "change": round(change, 2),
        "change_percent": round(change_percent, 2),
        "volume": int(safe_float(current.get("Volume", 0))),
        "high": round(safe_float(current.get("High", 0)), 2),
        "low": round(safe_float(current.get("Low", 0)), 2),
        "market_cap": None,
        "pe_ratio": None,
        "timestamp": fetched_at.isoformat(),
        "source": "yfinance_backfill",
    }

def build_enrichment(market_data: List[Dict[str, Any]], fetched_at: datetime) -> Dict[str, Any]:
    weights = {"SPY": 0.4, "QQQ": 0.35, "BTC-USD": 0.25}
    weighted_change = 0.0
    for entry in market_data:
        weighted_change += entry["change_percent"] * weights.get(entry["ticker"], 0.0)

    score = pseudo_sentiment_from_performance(weighted_change)
    btc_change = next((entry["change_percent"] for entry in market_data if entry["ticker"] == "BTC-USD"), 0.0)

    return {
        "sentiment_score": score,
        "confidence": confidence_from_change(weighted_change),
        "analysis": (
            f"Pseudo-Sentiment aus Tagesperformance rekonstruiert: "
            f"gewichtete Veränderung {weighted_change:+.2f}% aus SPY, QQQ und BTC-USD."
        ),
        "recommendation": recommendation_from_score(score),
        "crypto_bias": "bullish" if btc_change > 0.25 else "bearish" if btc_change < -0.25 else "neutral",
        "news_bias": "historical_reconstruction",
        "news_impact": 0,
        "key_theme": "backfill_reconstruction",
        "model": "historical-reconstruction",
        "processed_at": fetched_at.isoformat(),
    }

def build_record(market_data: List[Dict[str, Any]], fetched_at: datetime) -> Dict[str, Any]:
    enrichment = build_enrichment(market_data, fetched_at)
    return {
        "pipeline": "market_sentiment",
        "version": "1.1.0-backfill",
        "fetched_at": fetched_at.isoformat(),
        "market_data": market_data,
        "news_feed": [],
        "enrichment": enrichment,
        "derived_metrics": {
            "news_bias_seed": "historical_reconstruction",
            "news_impact_seed": 0,
            "reconstruction_method": "daily_price_performance",
        },
    }

def persist_record(record: Dict[str, Any]) -> Path:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    fetched_at = datetime.fromisoformat(record["fetched_at"].replace("Z", "+00:00"))
    filename = f"market_sentiment_{fetched_at.strftime('%Y%m%d_%H%M%S')}.json"
    filepath = OUTPUT_DIR / filename
    save_json_atomic(filepath, record)
    return filepath

def run_backfill() -> List[Path]:
    history = fetch_history()
    per_symbol_frames = {ticker: get_ticker_frame(history, ticker).dropna(how="all") for ticker in TICKERS}

    reference_index = list(per_symbol_frames["SPY"].index)
    if len(reference_index) < LOOKBACK_DAYS + 1:
        raise RuntimeError("Not enough daily bars returned for SPY")

    saved_paths: List[Path] = []
    start_position = max(1, len(reference_index) - LOOKBACK_DAYS)
    for idx in range(start_position, len(reference_index)):
        current_index = reference_index[idx]
        previous_index = reference_index[idx - 1]

        market_data = []
        for ticker in TICKERS:
            frame = per_symbol_frames[ticker]
            if current_index not in frame.index or previous_index not in frame.index:
                market_data = []
                break
            market_data.append(
                build_market_entry(
                    frame=frame,
                    current_index=current_index,
                    previous_index=previous_index,
                    ticker=ticker,
                    fetched_at=datetime.combine(current_index.date(), datetime.min.time(), tzinfo=timezone.utc) + timedelta(hours=12),
                )
            )

        if not market_data:
            continue

        fetched_at = datetime.combine(current_index.date(), datetime.min.time(), tzinfo=timezone.utc) + timedelta(hours=12)
        record = build_record(market_data, fetched_at)
        saved_paths.append(persist_record(record))

    return saved_paths

def reconstruct_oracle_backtest_history() -> Dict[str, Any]:
    merged_data = load_merged_data(days=LOOKBACK_DAYS + 20)
    merged_data_sorted = sorted(merged_data, key=lambda record: record["date_utc"])
    history: List[Dict[str, Any]] = []

    for index in range(REPLAY_MIN_HISTORY_DAYS, len(merged_data_sorted)):
        target_record = merged_data_sorted[index]
        historical_window = merged_data_sorted[max(0, index - LOOKBACK_DAYS):index]
        if len(historical_window) < REPLAY_MIN_HISTORY_DAYS:
            continue

        correlation_matrix = build_correlation_matrix(historical_window)
        patterns = find_patterns(correlation_matrix)
        latest_record = historical_window[-1]
        trend_info = determine_sentiment_trend(historical_window[-5:])
        day_number = calculate_day_number(target_record["date"])
        day_description = get_day_description(day_number)

        market_context = {
            "previous_sentiment": latest_record["market"]["sentiment_score"],
            "previous_vix": latest_record["market"]["vix_level"],
            "sentiment_trend": trend_info["direction"],
            "sentiment_trend_value": trend_info["value"],
            "crypto_snapshot": latest_record["market"].get("crypto_snapshot", {}),
            "crypto_sentiment": latest_record["market"].get("crypto_sentiment", 50.0),
            "news_signal": latest_record["market"].get("news_signal", "neutral"),
            "news_impact": latest_record["market"].get("news_impact", 0),
            "headline_count": latest_record["market"].get("headline_count", 0),
            "news_items": latest_record["market"].get("news_items", []),
        }

        sentiment_prediction = get_sentiment_prediction_for_day(
            day_number,
            correlation_matrix,
            market_context["sentiment_trend_value"],
        )
        base_alignment = calculate_day_alignment_score(day_number, correlation_matrix)
        alignment_breakdown = enhance_alignment_score_with_market_streams(
            base_alignment_score=base_alignment,
            day_number=day_number,
            crypto_snapshot=market_context["crypto_snapshot"],
            news_items=market_context["news_items"],
            news_bias=market_context["news_signal"],
            news_impact=market_context["news_impact"],
        )
        alignment_score = alignment_breakdown["final_alignment_score"]
        confidence = calculate_confidence(alignment_score, patterns["statistical_significance"])
        recommendation = generate_trading_recommendation(
            alignment_score,
            confidence,
            sentiment_prediction,
            market_context["previous_sentiment"],
        )
        _ = build_reasoning(day_number, day_description, alignment_breakdown, patterns, market_context)

        actual_sentiment = float(target_record["market"]["sentiment_score"])
        previous_sentiment = float(latest_record["market"]["sentiment_score"])
        sentiment_delta = round(actual_sentiment - previous_sentiment, 2)
        if sentiment_delta > ORACLE_CONFIG["thresholds"]["trend_delta"]:
            actual_trend = "rising"
        elif sentiment_delta < -ORACLE_CONFIG["thresholds"]["trend_delta"]:
            actual_trend = "falling"
        else:
            actual_trend = "neutral"

        text = recommendation.lower()
        if text.startswith("buy") or "bullish" in text:
            predicted_trend = "rising"
        elif text.startswith("sell") or "bearish" in text:
            predicted_trend = "falling"
        else:
            predicted_trend = "neutral"

        history.append(
            {
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "target_date": target_record["date"],
                "recommendation": recommendation,
                "alignment_score": alignment_score,
                "confidence": confidence,
                "sentiment_prediction": sentiment_prediction,
                "oracle_version": "1.1.0-replay",
                "evaluated_at": datetime.now(timezone.utc).isoformat(),
                "was_correct": predicted_trend == actual_trend,
                "actual_sentiment": actual_sentiment,
                "previous_sentiment": previous_sentiment,
                "sentiment_delta": sentiment_delta,
                "actual_trend": actual_trend,
            }
        )

    correct = sum(1 for entry in history if entry["was_correct"])
    accuracy_pct = round((correct / len(history)) * 100, 2) if history else 0.0
    payload = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "history": history,
        "summary": {
            "accuracy_pct": accuracy_pct,
            "total_predictions": len(history),
            "evaluated_predictions": len(history),
            "correct_predictions": correct,
            "pending_predictions": 0,
            "latest_result": history[-1] if history else None,
        },
    }
    save_json_atomic(BACKTEST_PATH, payload)
    return payload["summary"]

def trigger_oracle() -> Dict[str, Any]:
    return run()

def main() -> int:
    run_backfill()
    reconstruct_oracle_backtest_history()
    trigger_oracle()
    return 0
