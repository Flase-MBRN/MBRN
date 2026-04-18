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
    overlap_policy: str = "skip_if_running"
    tags: tuple[str, ...] = ()


WORKER_REGISTRY = [
    WorkerDefinition(
        worker_id="market_sentiment_v1",
        display_name="Market Sentiment V1",
        module_path="workers.market_sentiment_worker",
        callable_name="run",
        interval_minutes=60,
        timeout_seconds=300,
        enabled=True,
        uses_ollama=True,
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
        overlap_policy="skip_if_running",
        tags=("pillar3", "trust-matrix", "sec", "official"),
    ),
]
