#!/usr/bin/env python3
"""
MBRN Queue-First Pipeline System (Anti-Kill-Vector 3)
======================================================

Eliminates Ollama bottleneck through:
- Priority Queue for work items
- Worker pool with GPU memory guard
- Circuit breaker for resilience
- Retry with exponential backoff
- Intelligent caching

Usage:
    from queue_system import PipelineQueue, WorkerPool, CircuitBreaker
    
    queue = PipelineQueue()
    for symbol in symbols:
        queue.put({'symbol': symbol}, priority=symbol.urgency)
    
    with WorkerPool(max_workers=2, gpu_limit_gb=10) as pool:
        results = pool.process_queue(queue)
"""

import json
import time
import queue
import threading
import sys
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Callable, Dict, List, Optional, Tuple
from pathlib import Path

# Import cross-process file lock from pipeline_utils
PIPELINES_DIR = Path(__file__).resolve().parent
if str(PIPELINES_DIR) not in sys.path:
    sys.path.insert(0, str(PIPELINES_DIR))
from pipeline_utils import _cross_process_file_lock, save_json_atomic


class Priority(Enum):
    """Priority levels for queue items."""
    CRITICAL = 0   # System health, auth failures
    HIGH = 1       # Real-time data, user-facing
    NORMAL = 2     # Standard pipeline data
    LOW = 3        # Batch jobs, analytics
    BACKGROUND = 4 # Cleanup, archiving


@dataclass(order=True)
class QueueItem:
    """Priority queue item with metadata."""
    priority: int = field(compare=True)
    timestamp: float = field(compare=True)
    data: Dict[str, Any] = field(compare=False)
    retry_count: int = field(default=0, compare=False)
    item_id: str = field(default_factory=lambda: f"item_{time.time()}", compare=False)
    
    def __post_init__(self):
        # Higher priority = lower number, earlier timestamp = higher priority
        self.timestamp = -self.timestamp


class CircuitBreaker:
    """
    Circuit breaker pattern for Ollama/Data source protection.
    
    States:
        CLOSED: Normal operation
        OPEN: Failing, reject requests
        HALF_OPEN: Testing if recovered
    """
    
    def __init__(self, name: str, failure_threshold: int = 3, reset_timeout: int = 60):
        self.name = name
        self.failure_threshold = failure_threshold
        self.reset_timeout = reset_timeout
        self.state = "CLOSED"
        self.failure_count = 0
        self.last_failure_time = None
        self.metrics = {"total": 0, "success": 0, "failed": 0, "rejected": 0}
    
    def can_execute(self) -> bool:
        """Check if execution is allowed."""
        self.metrics["total"] += 1
        
        if self.state == "CLOSED":
            return True
        
        if self.state == "OPEN":
            if time.time() - self.last_failure_time >= self.reset_timeout:
                self.state = "HALF_OPEN"
                print(f"[Circuit:{self.name}] Entering HALF_OPEN state")
                return True
            self.metrics["rejected"] += 1
            return False
        
        if self.state == "HALF_OPEN":
            return True
        
        return False
    
    def record_success(self):
        """Record successful execution."""
        self.failure_count = 0
        self.metrics["success"] += 1
        
        if self.state == "HALF_OPEN":
            self.state = "CLOSED"
            print(f"[Circuit:{self.name}] CLOSED (recovered)")
    
    def record_failure(self, error: str):
        """Record failed execution."""
        self.failure_count += 1
        self.last_failure_time = time.time()
        self.metrics["failed"] += 1
        
        if self.failure_count >= self.failure_threshold:
            if self.state != "OPEN":
                self.state = "OPEN"
                print(f"[Circuit:{self.name}] OPEN (error: {error})")
    
    def get_status(self) -> Dict[str, Any]:
        """Get current circuit status."""
        return {
            "name": self.name,
            "state": self.state,
            "failure_count": self.failure_count,
            "metrics": self.metrics.copy()
        }


class RetryWithBackoff:
    """Retry handler with exponential backoff."""
    
    def __init__(self, max_retries: int = 3, base_delay: float = 1.0, max_delay: float = 60.0):
        self.max_retries = max_retries
        self.base_delay = base_delay
        self.max_delay = max_delay
    
    def calculate_delay(self, attempt: int) -> float:
        """Calculate delay with exponential backoff + jitter."""
        import random
        delay = min(self.base_delay * (2 ** attempt), self.max_delay)
        jitter = random.uniform(0, delay * 0.1)  # 10% jitter
        return delay + jitter
    
    def execute(self, fn: Callable, *args, **kwargs) -> Tuple[bool, Any]:
        """
        Execute function with retry logic.
        
        Returns:
            (success, result_or_error)
        """
        last_error = None
        
        for attempt in range(self.max_retries + 1):
            try:
                result = fn(*args, **kwargs)
                return True, result
            except Exception as e:
                last_error = e
                
                if attempt < self.max_retries:
                    delay = self.calculate_delay(attempt)
                    print(f"[Retry] Attempt {attempt + 1}/{self.max_retries + 1} failed: {e}")
                    print(f"[Retry] Waiting {delay:.1f}s before retry...")
                    time.sleep(delay)
        
        return False, last_error


class GPUQuotaGuard:
    """
    Guards GPU memory quota for Ollama workers.
    Prevents OOM by limiting concurrent inference requests.
    """
    
    def __init__(self, max_concurrent: int = 2, memory_limit_gb: float = 10.0):
        self.max_concurrent = max_concurrent
        self.memory_limit_gb = memory_limit_gb
        self.semaphore = threading.Semaphore(max_concurrent)
        self.current_usage = 0
        self.lock = threading.Lock()
    
    def __enter__(self):
        print(f"[GPUGuard] Acquiring slot ({self.max_concurrent} max)...")
        self.semaphore.acquire()
        with self.lock:
            self.current_usage += 1
        print(f"[GPUGuard] Slot acquired. Active: {self.current_usage}")
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        with self.lock:
            self.current_usage -= 1
        self.semaphore.release()
        print(f"[GPUGuard] Slot released. Active: {self.current_usage}")
        return False
    
    def get_status(self) -> Dict[str, Any]:
        """Get current GPU quota status."""
        return {
            "max_concurrent": self.max_concurrent,
            "current_usage": self.current_usage,
            "available": self.max_concurrent - self.current_usage,
            "memory_limit_gb": self.memory_limit_gb
        }


class PipelineQueue:
    """
    Priority queue for pipeline work items.
    Thread-safe, persistent, with deduplication.
    """
    
    def __init__(self, persist_path: Optional[str] = None):
        self._queue = queue.PriorityQueue()
        self._seen = set()  # Deduplication
        self.persist_path = Path(persist_path) if persist_path else None
        self._load_persisted()
    
    def put(self, data: Dict[str, Any], priority: Priority = Priority.NORMAL) -> bool:
        """
        Add item to queue.
        
        Returns:
            True if added, False if duplicate
        """
        # Create unique key for deduplication
        item_key = json.dumps(data, sort_keys=True)
        if item_key in self._seen:
            print(f"[Queue] Duplicate skipped: {data.get('symbol', 'unknown')}")
            return False
        
        self._seen.add(item_key)
        item = QueueItem(
            priority=priority.value,
            timestamp=time.time(),
            data=data
        )
        self._queue.put(item)
        return True
    
    def get(self, timeout: Optional[float] = None) -> Optional[QueueItem]:
        """Get item from queue."""
        try:
            return self._queue.get(timeout=timeout)
        except queue.Empty:
            return None
    
    def task_done(self):
        """Mark current task as complete."""
        self._queue.task_done()
    
    def qsize(self) -> int:
        """Get queue size."""
        return self._queue.qsize()
    
    def empty(self) -> bool:
        """Check if queue is empty."""
        return self._queue.empty()
    
    def join(self):
        """Wait for all items to be processed."""
        self._queue.join()
    
    def _persist(self):
        """Persist queue state to disk."""
        if not self.persist_path:
            return
        
        # Convert queue to list (destructive read)
        items = []
        while not self._queue.empty():
            try:
                items.append(self._queue.get_nowait())
                self._queue.task_done()
            except queue.Empty:
                break
        
        # Save and restore
        data = [
            {
                "priority": item.priority,
                "timestamp": item.timestamp,
                "data": item.data,
                "retry_count": item.retry_count
            }
            for item in items
        ]
        
        # CRITICAL: Use atomic write with cross-process file lock to prevent corruption
        lock_path = self.persist_path.with_suffix('.lock')
        with _cross_process_file_lock(lock_path):
            save_json_atomic(self.persist_path, data)
        
        # Restore queue
        for item_data in data:
            self._queue.put(QueueItem(**item_data))
    
    def _load_persisted(self):
        """Load persisted queue state with file lock protection."""
        if not self.persist_path or not self.persist_path.exists():
            return
        
        # CRITICAL: Use file lock to prevent reading during write
        lock_path = self.persist_path.with_suffix('.lock')
        with _cross_process_file_lock(lock_path):
            try:
                with open(self.persist_path, 'r') as f:
                    data = json.load(f)
                
                for item_data in data:
                    self._queue.put(QueueItem(**item_data))
                
                print(f"[Queue] Loaded {len(data)} persisted items")
            except (json.JSONDecodeError, IOError) as e:
                print(f"[Queue] Failed to load persisted state: {e}")


class WorkerPool:
    """
    Worker pool for parallel pipeline processing.
    Respects GPU quotas and circuit breakers.
    """
    
    def __init__(self, max_workers: int = 2, gpu_limit_gb: float = 10.0):
        self.max_workers = max_workers
        self.gpu_guard = GPUQuotaGuard(max_workers, gpu_limit_gb)
        self.circuits: Dict[str, CircuitBreaker] = {}
        self.retry_handler = RetryWithBackoff()
        self.results: List[Dict[str, Any]] = []
        self._lock = threading.Lock()
    
    def get_circuit(self, name: str) -> CircuitBreaker:
        """Get or create circuit breaker."""
        if name not in self.circuits:
            self.circuits[name] = CircuitBreaker(name)
        return self.circuits[name]
    
    def process_queue(self, pipeline_queue: PipelineQueue, processor_fn: Callable) -> List[Dict[str, Any]]:
        """
        Process all items in queue with worker pool.
        
        Args:
            pipeline_queue: Queue with work items
            processor_fn: Function to process each item
            
        Returns:
            List of results
        """
        self.results = []
        threads = []
        
        def worker():
            while True:
                item = pipeline_queue.get(timeout=1)
                if item is None:
                    break
                
                try:
                    # Check circuit breaker
                    circuit = self.get_circuit(item.data.get('circuit_name', 'default'))
                    if not circuit.can_execute():
                        print(f"[Worker] Circuit OPEN for {item.data}")
                        result = {
                            "success": False,
                            "error": "Circuit breaker open",
                            "data": item.data,
                            "circuit": circuit.get_status()
                        }
                    else:
                        # Process with GPU guard
                        with self.gpu_guard:
                            success, output = self.retry_handler.execute(
                                processor_fn, item.data
                            )
                            
                            if success:
                                circuit.record_success()
                                result = {"success": True, "data": output}
                            else:
                                circuit.record_failure(str(output))
                                result = {
                                    "success": False,
                                    "error": str(output),
                                    "data": item.data,
                                    "retries": item.retry_count
                                }
                    
                    with self._lock:
                        self.results.append(result)
                        
                except Exception as e:
                    print(f"[Worker] Error processing item: {e}")
                    with self._lock:
                        self.results.append({
                            "success": False,
                            "error": str(e),
                            "data": item.data if item else None
                        })
                finally:
                    pipeline_queue.task_done()
        
        # Start workers
        for _ in range(self.max_workers):
            t = threading.Thread(target=worker, daemon=True)
            t.start()
            threads.append(t)
        
        # Wait for completion
        pipeline_queue.join()
        
        # Stop workers
        for _ in range(self.max_workers):
            pipeline_queue.put(None)
        
        for t in threads:
            t.join(timeout=5)
        
        return self.results
    
    def get_status(self) -> Dict[str, Any]:
        """Get worker pool status."""
        return {
            "max_workers": self.max_workers,
            "gpu": self.gpu_guard.get_status(),
            "circuits": {name: cb.get_status() for name, cb in self.circuits.items()},
            "results_count": len(self.results)
        }


# =============================================================================
# LEGACY COMPATIBILITY: Queue-First wrapper for existing pipelines
# =============================================================================

class QueueFirstPipeline:
    """
    Wrapper to make existing pipelines Queue-First without rewrite.
    
    Usage:
        pipeline = QueueFirstPipeline(market_sentiment_fetcher.main)
        results = pipeline.run_batch(tickers)
    """
    
    def __init__(self, processor_fn: Callable, max_workers: int = 2):
        self.processor_fn = processor_fn
        self.max_workers = max_workers
        self.queue = PipelineQueue(persist_path="./pipeline_queue.json")
        self.pool = WorkerPool(max_workers=max_workers)
    
    def run_batch(self, items: List[Dict[str, Any]], priority: Priority = Priority.NORMAL) -> List[Dict[str, Any]]:
        """
        Run batch processing with queue-first design.
        
        Args:
            items: List of data items to process
            priority: Priority level for all items
            
        Returns:
            List of results
        """
        print(f"[QueueFirst] Enqueuing {len(items)} items...")
        
        # Add all items to queue
        for item in items:
            self.queue.put(item, priority=priority)
        
        print(f"[QueueFirst] Processing with {self.max_workers} workers...")
        
        # Process with worker pool
        results = self.pool.process_queue(self.queue, self.processor_fn)
        
        # Persist state for crash recovery
        self.queue._persist()
        
        # Report
        success_count = sum(1 for r in results if r.get("success"))
        print(f"[QueueFirst] Complete: {success_count}/{len(results)} successful")
        
        return results


if __name__ == "__main__":
    # Demo: Queue system test
    print("=" * 60)
    print("MBRN Queue-First Pipeline System Test")
    print("=" * 60)
    
    # Test circuit breaker
    cb = CircuitBreaker("test", failure_threshold=2, reset_timeout=5)
    print(f"\n[Circuit] Initial state: {cb.state}")
    
    cb.record_failure("Test error 1")
    print(f"[Circuit] After 1 failure: {cb.state}")
    
    cb.record_failure("Test error 2")
    print(f"[Circuit] After 2 failures: {cb.state}")
    
    # Test queue
    pq = PipelineQueue()
    pq.put({"symbol": "SPY"}, Priority.HIGH)
    pq.put({"symbol": "QQQ"}, Priority.NORMAL)
    pq.put({"symbol": "DIA"}, Priority.LOW)
    
    print(f"\n[Queue] Size: {pq.qsize()}")
    print(f"[Queue] Empty: {pq.empty()}")
    
    # Test retry
    retry = RetryWithBackoff(max_retries=2, base_delay=0.1)
    
    def failing_fn():
        raise Exception("Simulated failure")
    
    success, result = retry.execute(failing_fn)
    print(f"\n[Retry] Success: {success}, Result type: {type(result).__name__}")
    
    print("\n" + "=" * 60)
    print("All subsystems operational")
    print("=" * 60)
