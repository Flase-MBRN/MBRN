#!/usr/bin/env python3
"""Thin CLI/worker wrapper for the pillar-owned Oracle prediction pipeline."""

from pathlib import Path
import sys

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

from pillars.oracle.processing.python.prediction_pipeline import (  # noqa: E402
    CONFIG,
    build_reasoning,
    calculate_confidence,
    calculate_day_alignment_score,
    determine_sentiment_trend,
    generate_fallback_prediction,
    generate_prediction,
    generate_trading_recommendation,
    load_backtest_history,
    normalize_recommendation_direction,
    run,
    save_prediction,
    summarize_backtest_history,
    test_oracle_prediction,
    update_backtesting,
)

if __name__ == "__main__":
    test_oracle_prediction()
