from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

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
from pillars.oracle.processing.python.ingestion_adapter import load_merged_data, load_pillar3_sentiment
from pillars.oracle.processing.python.numerology_engine import (
    calculate_day_number,
    enhance_alignment_score_with_market_streams,
    get_day_description,
    get_next_trading_day,
    is_master_number,
)

CONFIG = {
    "oracle": {
        "version": "1.1.0",
        "correlation_days": 90,
        "output_dir": PROJECT_ROOT / "scripts" / "oracle" / "predictions",
        "dashboard_path": PROJECT_ROOT / "shared" / "data" / "oracle_prediction.json",
        "backtest_path": PROJECT_ROOT / "shared" / "data" / "oracle_backtest.json",
    },
    "thresholds": {
        "buy_alignment": 70,
        "sell_alignment": 30,
        "high_confidence": 0.7,
        "low_confidence": 0.4,
        "trend_delta": 2.0,
    },
}

def generate_prediction(target_date: Optional[str] = None) -> Dict[str, Any]:
    if target_date is None:
        target_date = get_next_trading_day()

    day_number = calculate_day_number(target_date)
    is_master = is_master_number(day_number)
    day_description = get_day_description(day_number)

    merged_data = load_merged_data(days=CONFIG["oracle"]["correlation_days"])
    if not merged_data:
        fallback_prediction = generate_fallback_prediction(target_date, day_number, is_master, day_description)
        fallback_prediction["backtesting"] = update_backtesting(fallback_prediction)
        fallback_prediction["prediction"]["oracle_accuracy"] = fallback_prediction["backtesting"]["accuracy_pct"]
        return fallback_prediction

    merged_data_sorted = sorted(merged_data, key=lambda record: record["date_utc"], reverse=True)
    recent_trend_window = list(reversed(merged_data_sorted[:5]))

    correlation_matrix = build_correlation_matrix(merged_data_sorted)
    patterns = find_patterns(correlation_matrix)

    latest_record = merged_data_sorted[0]
    trend_info = determine_sentiment_trend(recent_trend_window)
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
        market_context.get("sentiment_trend_value", 0.0),
    )

    base_alignment = calculate_day_alignment_score(day_number, correlation_matrix)
    alignment_breakdown = enhance_alignment_score_with_market_streams(
        base_alignment_score=base_alignment,
        day_number=day_number,
        crypto_snapshot=market_context.get("crypto_snapshot", {}),
        news_items=market_context.get("news_items", []),
        news_bias=market_context.get("news_signal", "neutral"),
        news_impact=market_context.get("news_impact", 0),
    )
    alignment_score = alignment_breakdown["final_alignment_score"]

    confidence = calculate_confidence(alignment_score, patterns["statistical_significance"])
    trading_recommendation = generate_trading_recommendation(
        alignment_score,
        confidence,
        sentiment_prediction,
        market_context.get("previous_sentiment", 50),
    )
    reasoning = build_reasoning(
        day_number,
        day_description,
        alignment_breakdown,
        patterns,
        market_context,
    )

    prediction = {
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "target_date": target_date,
        "oracle_version": CONFIG["oracle"]["version"],
        "day_numerology": {
            "day_number": day_number,
            "is_master": is_master,
            "description": day_description,
        },
        "market_context": market_context,
        "prediction": {
            "alignment_score": alignment_score,
            "confidence": confidence,
            "sentiment_prediction": sentiment_prediction,
            "trading_recommendation": trading_recommendation,
            "reasoning": reasoning,
            "alignment_breakdown": alignment_breakdown,
        },
        "correlation_summary": {
            "analysis_period_days": CONFIG["oracle"]["correlation_days"],
            "strongest_correlation": patterns["strongest_correlation"],
            "weakest_correlation": patterns["weakest_correlation"],
            "overall_trend": patterns["overall_trend"],
            "statistical_significance": patterns["statistical_significance"],
        },
    }

    prediction["backtesting"] = update_backtesting(prediction)
    prediction["prediction"]["oracle_accuracy"] = prediction["backtesting"]["accuracy_pct"]
    return prediction

def calculate_day_alignment_score(day_number: int, correlation_matrix: Dict[int, Dict[str, Any]]) -> float:
    if day_number in correlation_matrix:
        return float(correlation_matrix[day_number]["alignment_score"])
    if day_number in [11, 22, 33]:
        return 85.0
    if day_number in [1, 8, 9]:
        return 75.0
    if day_number in [4, 5, 7]:
        return 60.0
    return 50.0

def determine_sentiment_trend(recent_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    if len(recent_data) < 2:
        return {"direction": "neutral", "value": 0.0}

    mid = len(recent_data) // 2
    first_half = recent_data[:mid]
    second_half = recent_data[mid:]
    first_half_avg = sum(r["market"]["sentiment_score"] for r in first_half) / len(first_half)
    second_half_avg = sum(r["market"]["sentiment_score"] for r in second_half) / len(second_half)
    diff = second_half_avg - first_half_avg

    if diff > 5:
        direction = "rising"
    elif diff < -5:
        direction = "falling"
    else:
        direction = "neutral"

    return {"direction": direction, "value": round(diff, 2)}

def calculate_confidence(alignment_score: float, significance: str) -> float:
    base_confidence = alignment_score / 100
    if significance == "high":
        significance_multiplier = 1.0
    elif significance == "medium":
        significance_multiplier = 0.8
    else:
        significance_multiplier = 0.6

    confidence = base_confidence * significance_multiplier
    return round(min(1.0, max(0.0, confidence)), 2)

def generate_trading_recommendation(alignment_score: float, confidence: float, sentiment_prediction: float, previous_sentiment: float) -> str:
    if confidence < CONFIG["thresholds"]["low_confidence"]:
        return "Caution"
    if alignment_score >= CONFIG["thresholds"]["buy_alignment"]:
        return "Buy" if sentiment_prediction > previous_sentiment else "Hold"
    if alignment_score <= CONFIG["thresholds"]["sell_alignment"]:
        return "Sell" if sentiment_prediction < previous_sentiment else "Hold"
    if sentiment_prediction > 70:
        return "Hold (Bullish)"
    if sentiment_prediction < 30:
        return "Hold (Bearish)"
    return "Hold"

def build_reasoning(day_number: int, day_description: str, alignment_breakdown: Dict[str, Any], patterns: Dict[str, Any], market_context: Dict[str, Any]) -> str:
    strongest = patterns["strongest_correlation"]
    reasoning_parts = [f"Tag {day_number} ({day_description})"]

    if strongest:
        reasoning_parts.append(
            f"historisch korreliert Tag {strongest['day_number']} am stärksten mit einem Sentiment von {strongest['avg_sentiment']:.1f}"
        )

    if alignment_breakdown["total_modifier"] > 0.5:
        reasoning_parts.append(
            f"Krypto und News verstärken das Setup um {alignment_breakdown['total_modifier']:.1f} Punkte"
        )
    elif alignment_breakdown["total_modifier"] < -0.5:
        reasoning_parts.append(
            f"Krypto und News dämpfen das Setup um {abs(alignment_breakdown['total_modifier']):.1f} Punkte"
        )

    trend = market_context.get("sentiment_trend", "neutral")
    if trend == "rising":
        reasoning_parts.append("der aktuelle Markt-Trend ist positiv")
    elif trend == "falling":
        reasoning_parts.append("der aktuelle Markt-Trend ist negativ")

    news_signal = str(market_context.get("news_signal", "neutral")).lower()
    if "bull" in news_signal:
        reasoning_parts.append("die RSS-Nachrichtenlage ist bullisch")
    elif "bear" in news_signal:
        reasoning_parts.append("die RSS-Nachrichtenlage ist bearisch")

    if market_context.get("crypto_snapshot"):
        reasoning_parts.append("BTC und ETH liefern zusätzlichen Takt für das Setup")

    return ". ".join(reasoning_parts) + "."

def generate_fallback_prediction(target_date: str, day_number: int, is_master: bool, day_description: str) -> Dict[str, Any]:
    return {
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "target_date": target_date,
        "oracle_version": CONFIG["oracle"]["version"],
        "day_numerology": {
            "day_number": day_number,
            "is_master": is_master,
            "description": day_description,
        },
        "market_context": {
            "status": "insufficient_data",
            "sentiment_trend": "neutral",
            "sentiment_trend_value": 0.0,
            "crypto_snapshot": {},
            "crypto_sentiment": 50.0,
            "news_signal": "neutral",
            "news_impact": 0,
            "headline_count": 0,
            "news_items": [],
        },
        "prediction": {
            "alignment_score": 50.0,
            "confidence": 0.0,
            "sentiment_prediction": 50.0,
            "trading_recommendation": "Caution",
            "reasoning": "Unzureichende historische Daten für Korrelationsanalyse.",
            "alignment_breakdown": {
                "base_alignment_score": 50.0,
                "crypto_modifier": 0.0,
                "news_modifier": 0.0,
                "day_multiplier": 1.0,
                "total_modifier": 0.0,
                "final_alignment_score": 50.0,
            },
        },
        "correlation_summary": {
            "status": "fallback",
            "reason": "No historical data available",
        },
    }

def load_backtest_history() -> Dict[str, Any]:
    backtest_path = Path(CONFIG["oracle"]["backtest_path"])
    if not backtest_path.exists():
        return {"history": [], "summary": {}}

    try:
        with open(backtest_path, "r", encoding="utf-8") as handle:
            payload = json.load(handle)
        if not isinstance(payload, dict):
            return {"history": [], "summary": {}}
        payload.setdefault("history", [])
        payload.setdefault("summary", {})
        return payload
    except (OSError, json.JSONDecodeError):
        return {"history": [], "summary": {}}

def build_sentiment_lookup(sentiment_history: List[Dict[str, Any]]) -> tuple[Dict[str, Dict[str, Any]], List[str]]:
    lookup: Dict[str, Dict[str, Any]] = {}
    for record in sentiment_history:
        try:
            timestamp = str(record["timestamp_utc"])
            if timestamp.endswith("Z"):
                timestamp = timestamp.replace("Z", "+00:00")
            dt = datetime.fromisoformat(timestamp)
            lookup[dt.strftime("%d.%m.%Y")] = record
        except Exception:
            continue

    sorted_dates = sorted(lookup.keys(), key=lambda date_str: datetime.strptime(date_str, "%d.%m.%Y"))
    return lookup, sorted_dates

def classify_actual_trend(sentiment_delta: float) -> str:
    threshold = CONFIG["thresholds"]["trend_delta"]
    if sentiment_delta > threshold:
        return "rising"
    if sentiment_delta < -threshold:
        return "falling"
    return "neutral"

def normalize_recommendation_direction(recommendation: str) -> str:
    text = str(recommendation or "").lower()
    if text.startswith("buy") or "bullish" in text:
        return "rising"
    if text.startswith("sell") or "bearish" in text:
        return "falling"
    if text.startswith("caution"):
        return "neutral"
    return "neutral"

def upsert_backtest_entry(history: List[Dict[str, Any]], prediction: Dict[str, Any]) -> None:
    snapshot = {
        "generated_at": prediction["timestamp_utc"],
        "target_date": prediction["target_date"],
        "recommendation": prediction["prediction"]["trading_recommendation"],
        "alignment_score": prediction["prediction"]["alignment_score"],
        "confidence": prediction["prediction"]["confidence"],
        "sentiment_prediction": prediction["prediction"]["sentiment_prediction"],
        "oracle_version": prediction.get("oracle_version", CONFIG["oracle"]["version"]),
        "evaluated_at": None,
        "was_correct": None,
        "actual_sentiment": None,
        "previous_sentiment": None,
        "sentiment_delta": None,
        "actual_trend": None,
    }

    for index, entry in enumerate(history):
        if entry.get("target_date") == snapshot["target_date"]:
            preserved_fields = {
                "evaluated_at": entry.get("evaluated_at"),
                "was_correct": entry.get("was_correct"),
                "actual_sentiment": entry.get("actual_sentiment"),
                "previous_sentiment": entry.get("previous_sentiment"),
                "sentiment_delta": entry.get("sentiment_delta"),
                "actual_trend": entry.get("actual_trend"),
            }
            history[index] = {**snapshot, **preserved_fields}
            return

    history.append(snapshot)

def evaluate_backtest_history(history: List[Dict[str, Any]], sentiment_history: List[Dict[str, Any]]) -> None:
    lookup, sorted_dates = build_sentiment_lookup(sentiment_history)
    date_positions = {date_str: idx for idx, date_str in enumerate(sorted_dates)}

    for entry in history:
        if entry.get("evaluated_at"):
            continue

        target_date = entry.get("target_date")
        if not target_date or target_date not in lookup:
            continue

        current_idx = date_positions.get(target_date, -1)
        if current_idx <= 0:
            continue

        previous_date = sorted_dates[current_idx - 1]
        actual_sentiment = float(lookup[target_date].get("sentiment_score", 50.0))
        previous_sentiment = float(lookup[previous_date].get("sentiment_score", actual_sentiment))
        sentiment_delta = round(actual_sentiment - previous_sentiment, 2)
        actual_trend = classify_actual_trend(sentiment_delta)
        predicted_direction = normalize_recommendation_direction(entry.get("recommendation", "Hold"))

        entry["previous_sentiment"] = previous_sentiment
        entry["actual_sentiment"] = actual_sentiment
        entry["sentiment_delta"] = sentiment_delta
        entry["actual_trend"] = actual_trend
        entry["was_correct"] = predicted_direction == actual_trend
        entry["evaluated_at"] = datetime.now(timezone.utc).isoformat()

def summarize_backtest_history(history: List[Dict[str, Any]]) -> Dict[str, Any]:
    evaluated = [entry for entry in history if entry.get("was_correct") is not None]
    correct = sum(1 for entry in evaluated if entry.get("was_correct"))
    accuracy_pct = round((correct / len(evaluated)) * 100, 2) if evaluated else 0.0
    pending = len(history) - len(evaluated)
    latest_result = evaluated[-1] if evaluated else None

    return {
        "accuracy_pct": accuracy_pct,
        "total_predictions": len(history),
        "evaluated_predictions": len(evaluated),
        "correct_predictions": correct,
        "pending_predictions": pending,
        "latest_result": latest_result,
    }

def update_backtesting(prediction: Dict[str, Any]) -> Dict[str, Any]:
    payload = load_backtest_history()
    history: List[Dict[str, Any]] = list(payload.get("history", []))

    upsert_backtest_entry(history, prediction)
    sentiment_history = load_pillar3_sentiment(days=CONFIG["oracle"]["correlation_days"] + 30)
    evaluate_backtest_history(history, sentiment_history)
    history.sort(key=lambda entry: datetime.strptime(entry["target_date"], "%d.%m.%Y"))

    summary = summarize_backtest_history(history)
    payload = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "history": history,
        "summary": summary,
    }
    save_json_atomic(CONFIG["oracle"]["backtest_path"], payload)
    return summary

def save_prediction(prediction: Dict[str, Any], output_dir: Optional[str] = None) -> str:
    output_path = Path(output_dir) if output_dir else Path(CONFIG["oracle"]["output_dir"])
    output_path.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    filepath = output_path / f"oracle_prediction_{timestamp}.json"
    save_json_atomic(filepath, prediction)
    return str(filepath)

def test_oracle_prediction():
    prediction = generate_prediction()
    save_prediction(prediction)
    return prediction

def run() -> Dict[str, Any]:
    prediction = generate_prediction()
    save_prediction(prediction)

    dashboard_path = Path(CONFIG["oracle"]["dashboard_path"])
    dashboard_path.parent.mkdir(parents=True, exist_ok=True)
    save_json_atomic(dashboard_path, prediction)
    return prediction
