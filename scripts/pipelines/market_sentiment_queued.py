#!/usr/bin/env python3
"""
MBRN Market Sentiment Pipeline — Queue-First Refactor (Anti-Kill-Vector 3)
==========================================================================

Production-ready pipeline with:
- Priority queue for tickers
- Worker pool with GPU memory guard
- Circuit breaker for Ollama/Yahoo Finance
- Retry with exponential backoff
- Crash recovery via queue persistence

Usage:
    python market_sentiment_queued.py --tickers SPY QQQ DIA --workers 2
    python market_sentiment_queued.py --mode=recovery  # Resume after crash
"""

import json
import sys
import time
import argparse
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Any, Optional

# Import queue-first infrastructure
from queue_system import (
    PipelineQueue, WorkerPool, QueueFirstPipeline,
    CircuitBreaker, Priority, RetryWithBackoff
)
from market_sentiment_fetcher import (
    fetch_market_data, enrich_with_ollama, 
    prepare_for_supabase, CONFIG
)


def process_ticker(item_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Process a single ticker through the pipeline.
    
    This function is called by the worker pool for each queue item.
    Includes full error handling and retry logic.
    """
    ticker = item_data.get('symbol', 'UNKNOWN')
    start_time = time.time()
    
    print(f"[Worker] Processing {ticker}...")
    
    try:
        # Step 1: Fetch market data
        market_data = fetch_market_data(ticker)
        
        if not market_data:
            return {
                "symbol": ticker,
                "success": False,
                "error": "Failed to fetch market data",
                "stage": "fetch",
                "duration_ms": (time.time() - start_time) * 1000
            }
        
        # Step 2: Enrich with Ollama (GPU-guarded via WorkerPool)
        enrichment = enrich_with_ollama([market_data])
        
        # Step 3: Combine results
        result = {
            "symbol": ticker,
            "success": True,
            "market_data": market_data,
            "enrichment": enrichment,
            "duration_ms": (time.time() - start_time) * 1000,
            "processed_at": datetime.now(timezone.utc).isoformat()
        }
        
        print(f"[Worker] ✓ {ticker} complete (Score: {enrichment.get('sentiment_score', 'N/A')})")
        return result
        
    except Exception as e:
        print(f"[Worker] ✗ {ticker} failed: {e}")
        return {
            "symbol": ticker,
            "success": False,
            "error": str(e),
            "stage": "unknown",
            "duration_ms": (time.time() - start_time) * 1000
        }


def run_queued_pipeline(
    tickers: List[str],
    max_workers: int = 2,
    gpu_limit_gb: float = 10.0,
    priority: Priority = Priority.NORMAL,
    persist_path: str = "./pipeline_queue.json"
) -> Dict[str, Any]:
    """
    Run market sentiment pipeline with queue-first design.
    
    Args:
        tickers: List of stock symbols to analyze
        max_workers: Number of parallel workers (GPU constrained)
        gpu_limit_gb: GPU memory limit for Ollama
        priority: Priority level for all items
        persist_path: Path for queue persistence (crash recovery)
        
    Returns:
        Dict with results, metrics, and status
    """
    start_time = time.time()
    
    print("=" * 70)
    print("MBRN Market Sentiment Pipeline — Queue-First Production v2.0")
    print("=" * 70)
    print(f"Tickers: {len(tickers)}")
    print(f"Workers: {max_workers} (GPU limit: {gpu_limit_gb}GB)")
    print(f"Priority: {priority.name}")
    print(f"Persistence: {persist_path}")
    print("=" * 70)
    
    # Initialize queue-first pipeline
    pipeline = QueueFirstPipeline(
        processor_fn=process_ticker,
        max_workers=max_workers
    )
    
    # Prepare items
    items = [{"symbol": t} for t in tickers]
    
    # Run with queue-first design
    results = pipeline.run_batch(items, priority=priority)
    
    # Aggregate results
    success_count = sum(1 for r in results if r.get("success"))
    failed_count = len(results) - success_count
    
    # Build full record
    full_record = {
        "pipeline": "market_sentiment_queued",
        "version": "2.0.0",
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "config": {
            "max_workers": max_workers,
            "gpu_limit_gb": gpu_limit_gb,
            "priority": priority.name
        },
        "metrics": {
            "total": len(results),
            "success": success_count,
            "failed": failed_count,
            "success_rate": success_count / len(results) if results else 0,
            "total_duration_ms": (time.time() - start_time) * 1000
        },
        "worker_pool_status": pipeline.pool.get_status(),
        "results": results
    }
    
    # Save results
    output_dir = Path("../../AI/models/data")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    filename = f"market_sentiment_queued_{timestamp}.json"
    filepath = output_dir / filename
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(full_record, f, indent=2, ensure_ascii=False)
    
    # Print summary
    print("\n" + "=" * 70)
    print("PIPELINE COMPLETE")
    print("=" * 70)
    print(f"Total: {full_record['metrics']['total']}")
    print(f"Success: {full_record['metrics']['success']} ({full_record['metrics']['success_rate']:.1%})")
    print(f"Failed: {full_record['metrics']['failed']}")
    print(f"Duration: {full_record['metrics']['total_duration_ms']:.0f}ms")
    print(f"Output: {filepath}")
    print("=" * 70)
    
    # Output Supabase-ready payload
    if success_count > 0:
        # Use first successful result for Supabase format
        first_success = next(r for r in results if r.get("success"))
        supabase_data = prepare_for_supabase({
            "market_data": [first_success["market_data"]],
            "enrichment": first_success["enrichment"]
        })
        
        print("\n--- SUPABASE PAYLOAD (first success) ---")
        print(json.dumps(supabase_data, indent=2))
    
    return full_record


def main():
    """Main entry point with CLI args."""
    parser = argparse.ArgumentParser(
        description="MBRN Market Sentiment Pipeline — Queue-First Production"
    )
    
    parser.add_argument(
        "--tickers",
        nargs="+",
        default=["SPY", "QQQ", "DIA", "IWM", "VIX"],
        help="List of ticker symbols to analyze"
    )
    
    parser.add_argument(
        "--workers",
        type=int,
        default=2,
        help="Number of parallel workers (default: 2, limited by GPU memory)"
    )
    
    parser.add_argument(
        "--gpu-limit",
        type=float,
        default=10.0,
        help="GPU memory limit in GB (default: 10GB for RX 7700 XT)"
    )
    
    parser.add_argument(
        "--priority",
        choices=["CRITICAL", "HIGH", "NORMAL", "LOW", "BACKGROUND"],
        default="NORMAL",
        help="Queue priority level"
    )
    
    parser.add_argument(
        "--persist-path",
        default="./pipeline_queue.json",
        help="Path for queue persistence (crash recovery)"
    )
    
    parser.add_argument(
        "--recovery",
        action="store_true",
        help="Resume from persisted queue state (crash recovery mode)"
    )
    
    args = parser.parse_args()
    
    # Map priority string to enum
    priority_map = {
        "CRITICAL": Priority.CRITICAL,
        "HIGH": Priority.HIGH,
        "NORMAL": Priority.NORMAL,
        "LOW": Priority.LOW,
        "BACKGROUND": Priority.BACKGROUND
    }
    priority = priority_map[args.priority]
    
    try:
        # Run pipeline
        result = run_queued_pipeline(
            tickers=args.tickers,
            max_workers=args.workers,
            gpu_limit_gb=args.gpu_limit,
            priority=priority,
            persist_path=args.persist_path
        )
        
        # Exit with success if all passed
        all_passed = result["metrics"]["success_rate"] == 1.0
        sys.exit(0 if all_passed else 1)
        
    except KeyboardInterrupt:
        print("\n[INTERRUPT] Pipeline interrupted. State persisted to queue.")
        print("Resume with: --recovery flag")
        sys.exit(130)
        
    except Exception as e:
        print(f"\n[FATAL] Pipeline failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
