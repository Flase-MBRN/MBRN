"""Compatibility adapter for the legacy market sentiment pipeline."""

from market_sentiment_fetcher import main as market_sentiment_main
from pipeline_utils import ollama_execution_guard


def run():
    """Execute the existing market sentiment pipeline unchanged."""
    with ollama_execution_guard(worker_name="market_sentiment_v1"):
        return market_sentiment_main()
