#!/usr/bin/env python3
"""Thin CLI/worker wrapper for the pillar-owned Oracle backfill pipeline."""

from pathlib import Path
import sys

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

from pillars.oracle.processing.python.backfill_pipeline import (  # noqa: E402
    BACKTEST_PATH,
    DOWNLOAD_PERIOD,
    LOOKBACK_DAYS,
    OUTPUT_DIR,
    REPLAY_MIN_HISTORY_DAYS,
    TICKERS,
    build_enrichment,
    build_market_entry,
    build_record,
    confidence_from_change,
    fetch_history,
    get_ticker_frame,
    main,
    persist_record,
    pseudo_sentiment_from_performance,
    recommendation_from_score,
    reconstruct_oracle_backtest_history,
    run_backfill,
    safe_float,
    trigger_oracle,
)

if __name__ == "__main__":
    raise SystemExit(main())
