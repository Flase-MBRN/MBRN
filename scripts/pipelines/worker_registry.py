"""Declarative worker registry for Sentinel V2."""

from dataclasses import dataclass


@dataclass(frozen=True)
class WorkerDefinition:
    """Static definition for a Sentinel worker."""

    worker_id: str
    display_name: str
    module_path: str
    callable_name: str
    interval_minutes: int
    timeout_seconds: int = 300
    enabled: bool = True
    uses_ollama: bool = False
    preferred_model: str = "qwen2.5-coder:14b"  # Dynamic Routing: Standard for reasoning
    overlap_policy: str = "skip_if_running"
    tags: tuple[str, ...] = ()


WORKER_REGISTRY = [
    WorkerDefinition(
        worker_id="market_sentiment_v1",
        display_name="Market Sentiment V1",
        module_path="workers.market_sentiment_worker",
        callable_name="run",
        interval_minutes=60,
        timeout_seconds=600,
        enabled=True,
        uses_ollama=True,
        preferred_model="qwen2.5-coder:14b",
        overlap_policy="skip_if_running",
        tags=("pillar3", "legacy", "official"),
    ),
    WorkerDefinition(
        worker_id="trust_matrix_v1",
        display_name="Trust Matrix V1",
        module_path="workers.trust_matrix_worker",
        callable_name="run",
        interval_minutes=10,
        timeout_seconds=420,
        enabled=True,
        uses_ollama=True,
        preferred_model="deepseek-r1:14b",
        overlap_policy="skip_if_running",
        tags=("pillar3", "trust-matrix", "sec", "official"),
    ),
    WorkerDefinition(
        worker_id="raw_market_news_collector",
        display_name="Raw Market News Collector",
        module_path="raw_market_news_collector",
        callable_name="main",
        interval_minutes=60,
        timeout_seconds=300,
        enabled=True,
        uses_ollama=False,  # News collection saves VRAM
        tags=("pillar3", "ingest", "official"),
    ),
    WorkerDefinition(
        worker_id="local_llm_enrichment_worker",
        display_name="Local LLM Enrichment Worker",
        module_path="local_llm_enrichment_worker",
        callable_name="main",
        interval_minutes=10,
        timeout_seconds=600,
        enabled=True,
        uses_ollama=True,
        preferred_model="llama3.2:latest",  # Speed for simple formatting
        tags=("pillar3", "enrichment", "official"),
    ),
]
