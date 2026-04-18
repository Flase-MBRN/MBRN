#!/usr/bin/env python3
"""
MBRN Pipeline Utilities — Shared Infrastructure for Pillar 3
===========================================================

Centralized utilities for all data arbitrage pipelines:
- Supabase Uplink with Bearer Auth
- Ollama LLM Enrichment (RX 7700 XT optimized)
- Caching & Retry Logic
- Structured Logging

Usage:
    from pipeline_utils import SupabaseUplink, OllamaEnricher, PipelineCache, log

Architect: Flase | Pillar 3: Data Arbitrage | Law 1: Module Responsibility
"""

import json
import os
import re
import shutil
import subprocess
import threading
import time
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, Optional, Callable
from dataclasses import dataclass, field

import requests
import urllib.request
import urllib.error
from dotenv import load_dotenv


# =============================================================================
# CONFIGURATION
# =============================================================================

@dataclass
class PipelineConfig:
    """Shared configuration for all pipelines."""
    # Ollama settings
    ollama_host: str = "localhost"
    ollama_port: int = 11434
    ollama_model: str = "llama3.1:8b"
    ollama_temperature: float = 0.3
    ollama_timeout: int = 120
    
    # Cache settings
    cache_ttl_seconds: int = 300  # 5 minutes
    cache_dir: Path = Path("AI/models/data")
    
    # Retry settings
    max_retries: int = 3
    retry_delay_seconds: int = 2
    
    # GPU Memory Guard (RX 7700 XT: 12GB total, 10GB safety cap)
    gpu_memory_limit_gb: float = 10.0
    gpu_memory_warning_gb: float = 8.0
    
    # Cache cleanup
    max_cache_size_mb: int = 100
    cache_max_age_hours: int = 24
    
    # Supabase settings (from env)
    @property
    def supabase_edge_url(self) -> Optional[str]:
        return os.getenv('SUPABASE_EDGE_FUNCTION_URL')
    
    @property
    def data_arb_api_key(self) -> Optional[str]:
        return os.getenv('DATA_ARB_API_KEY')


# Global config instance
CONFIG = PipelineConfig()
OLLAMA_EXECUTION_SEMAPHORE = threading.Semaphore(1)
PIPELINES_ENV_PATH = Path(__file__).resolve().parent / ".env"
_ENV_LOADED = False


def load_pipeline_env(env_path: Optional[Path] = None) -> bool:
    """
    Load pipeline environment variables from the local .env file once.

    This keeps secret handling centralized and avoids hardcoded credentials
    across individual workers.
    """
    global _ENV_LOADED

    if _ENV_LOADED:
        return True

    target_path = Path(env_path) if env_path else PIPELINES_ENV_PATH
    if not target_path.exists():
        return False

    load_dotenv(target_path, override=False)
    _ENV_LOADED = True
    return True


load_pipeline_env()


# =============================================================================
# STRUCTURED LOGGING
# =============================================================================

def log(level: str, message: str) -> None:
    """
    Structured logging with ISO timestamp.
    
    Levels: INFO, OK, WARN, ERROR, RETRY, CACHE
    """
    timestamp = datetime.now(timezone.utc).isoformat()
    print(f"[{timestamp}] [{level}] {message}")


# =============================================================================
# CACHING SYSTEM
# =============================================================================

class PipelineCache:
    """
    Local file-based cache with TTL for pipeline data.
    Reduces API calls and improves resilience.
    """
    
    def __init__(self, config: PipelineConfig = CONFIG):
        self.config = config
        self.cache_dir = config.cache_dir
        self.cache_dir.mkdir(parents=True, exist_ok=True)
    
    def get(self, key: str) -> Optional[Dict[str, Any]]:
        """
        Load data from cache if still valid (within TTL).
        
        Args:
            key: Cache key (usually filename without extension)
            
        Returns:
            Cached data dict or None if expired/missing
        """
        cache_path = self.cache_dir / f"{key}.json"
        
        if not cache_path.exists():
            return None
        
        try:
            file_age = time.time() - cache_path.stat().st_mtime
            if file_age < self.config.cache_ttl_seconds:
                with open(cache_path, 'r', encoding='utf-8') as f:
                    cached_data = json.load(f)
                age_seconds = int(file_age)
                log("CACHE", f"Using local data (age: {age_seconds}s)")
                return cached_data
        except (IOError, json.JSONDecodeError) as e:
            log("WARN", f"Cache read failed: {e}")
        
        return None
    
    def set(self, key: str, data: Dict[str, Any]) -> bool:
        """
        Save data to cache.
        
        Args:
            key: Cache key
            data: Data to cache
            
        Returns:
            True if saved successfully
        """
        cache_path = self.cache_dir / f"{key}.json"
        
        try:
            with open(cache_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            return True
        except IOError as e:
            log("ERROR", f"Cache write failed: {e}")
            return False
    
    def clear(self, key: str) -> bool:
        """Remove specific cache entry."""
        cache_path = self.cache_dir / f"{key}.json"
        try:
            if cache_path.exists():
                cache_path.unlink()
            return True
        except IOError:
            return False
    
    def cleanup_old_files(self) -> int:
        """
        Remove cache files older than cache_max_age_hours.
        Returns number of files removed.
        """
        removed_count = 0
        max_age_seconds = self.config.cache_max_age_hours * 3600
        current_time = time.time()
        
        try:
            for cache_file in self.cache_dir.glob("*.json"):
                file_age = current_time - cache_file.stat().st_mtime
                if file_age > max_age_seconds:
                    cache_file.unlink()
                    removed_count += 1
                    log("CACHE", f"Removed stale cache: {cache_file.name}")
        except Exception as e:
            log("WARN", f"Cache cleanup error: {e}")
        
        return removed_count
    
    def enforce_size_limit(self) -> int:
        """
        Enforce max_cache_size_mb by removing oldest files if exceeded.
        Returns number of files removed.
        """
        try:
            cache_files = list(self.cache_dir.glob("*.json"))
            total_size_mb = sum(f.stat().st_size for f in cache_files) / (1024 * 1024)
            
            if total_size_mb <= self.config.max_cache_size_mb:
                return 0
            
            # Sort by modification time (oldest first)
            cache_files.sort(key=lambda f: f.stat().st_mtime)
            
            removed_count = 0
            while total_size_mb > self.config.max_cache_size_mb and cache_files:
                oldest_file = cache_files.pop(0)
                file_size_mb = oldest_file.stat().st_size / (1024 * 1024)
                oldest_file.unlink()
                total_size_mb -= file_size_mb
                removed_count += 1
                log("CACHE", f"Size limit enforced: removed {oldest_file.name}")
            
            return removed_count
        except Exception as e:
            log("WARN", f"Size limit enforcement error: {e}")
            return 0


# =============================================================================
# RETRY HANDLER
# =============================================================================

# =============================================================================
# CIRCUIT BREAKER (Prevents cascade failures)
# =============================================================================

class CircuitBreaker:
    """
    Circuit breaker pattern for Ollama and external services.
    Opens after threshold failures, cooldown before retry.
    """
    
    def __init__(self, failure_threshold: int = 3, cooldown_seconds: int = 300):
        self.failure_threshold = failure_threshold
        self.cooldown_seconds = cooldown_seconds
        self.failure_count = 0
        self.last_failure_time = 0
        self.state = "closed"  # closed, open, half-open
    
    def can_execute(self) -> bool:
        """Check if operation is allowed."""
        if self.state == "closed":
            return True
        
        if self.state == "open":
            time_since_failure = time.time() - self.last_failure_time
            if time_since_failure > self.cooldown_seconds:
                self.state = "half-open"
                log("INFO", "Circuit breaker: entering half-open state")
                return True
            log("WARN", f"Circuit breaker OPEN: {int(self.cooldown_seconds - time_since_failure)}s remaining")
            return False
        
        return True  # half-open allows one test
    
    def record_success(self):
        """Reset failure count on success."""
        if self.state in ("open", "half-open"):
            log("OK", "Circuit breaker: closing (service recovered)")
        self.state = "closed"
        self.failure_count = 0
    
    def record_failure(self):
        """Track failure and open circuit if threshold reached."""
        self.failure_count += 1
        self.last_failure_time = time.time()
        
        if self.failure_count >= self.failure_threshold:
            self.state = "open"
            log("ERROR", f"Circuit breaker OPENED after {self.failure_count} failures. Cooldown: {self.cooldown_seconds}s")


# =============================================================================
# GPU MEMORY GUARD (RX 7700 XT Protection)
# =============================================================================

class GPUMemoryGuard:
    """
    Monitors GPU memory usage for RX 7700 XT (12GB VRAM).
    Prevents OOM crashes by queueing/canceling Ollama requests.
    """
    
    def __init__(self, config: PipelineConfig = CONFIG):
        self.config = config
        self.ollama_ps_pattern = re.compile(r'(\d+\.?\d*)\s*MiB')
    
    def get_ollama_gpu_memory_mb(self) -> float:
        """
        Query Ollama's current GPU memory usage.
        Returns MB used by Ollama processes.
        """
        try:
            # Try nvidia-smi first (if available)
            result = subprocess.run(
                ['nvidia-smi', '--query-compute-apps=pid,used_memory', '--format=csv,noheader,nounits'],
                capture_output=True, text=True, timeout=5
            )
            if result.returncode == 0:
                total_mb = 0.0
                for line in result.stdout.strip().split('\n'):
                    if line:
                        parts = line.split(',')
                        if len(parts) >= 2:
                            try:
                                total_mb += float(parts[1].strip())
                            except ValueError:
                                pass
                return total_mb
        except (subprocess.SubprocessError, FileNotFoundError):
            pass
        
        # Fallback: Try ollama ps command
        try:
            result = subprocess.run(
                ['ollama', 'ps'],
                capture_output=True, text=True, timeout=5
            )
            if result.returncode == 0:
                # Parse memory usage from ollama ps output
                total_mb = 0.0
                for line in result.stdout.split('\n'):
                    matches = self.ollama_ps_pattern.findall(line)
                    for match in matches:
                        try:
                            total_mb += float(match)
                        except ValueError:
                            pass
                return total_mb
        except (subprocess.SubprocessError, FileNotFoundError):
            pass
        
        # If we can't determine, assume safe to proceed
        return 0.0
    
    def check_memory(self) -> tuple[bool, float]:
        """
        Check if GPU memory is within safe limits.
        
        Returns:
            Tuple of (is_safe: bool, current_usage_gb: float)
        """
        usage_mb = self.get_ollama_gpu_memory_mb()
        usage_gb = usage_mb / 1024
        
        is_safe = usage_gb < self.config.gpu_memory_limit_gb
        
        if not is_safe:
            log("WARN", f"GPU memory at {usage_gb:.1f}GB (limit: {self.config.gpu_memory_limit_gb}GB)")
        elif usage_gb > self.config.gpu_memory_warning_gb:
            log("WARN", f"GPU memory warning: {usage_gb:.1f}GB (approaching {self.config.gpu_memory_limit_gb}GB limit)")
        
        return is_safe, usage_gb
    
    def wait_for_memory(self, max_wait_seconds: int = 60) -> bool:
        """
        Wait until GPU memory drops below threshold.
        
        Returns:
            True if memory became available, False if timeout
        """
        start_time = time.time()
        check_interval = 5
        
        while time.time() - start_time < max_wait_seconds:
            is_safe, usage_gb = self.check_memory()
            if is_safe:
                log("OK", f"GPU memory released: {usage_gb:.1f}GB available")
                return True
            
            log("INFO", f"Waiting for GPU memory... ({int(time.time() - start_time)}s elapsed)")
            time.sleep(check_interval)
        
        log("ERROR", f"GPU memory wait timeout after {max_wait_seconds}s")
        return False


@contextmanager
def ollama_execution_guard(
    worker_name: str = "unknown",
    acquire_timeout_seconds: int = 120,
    gpu_wait_timeout_seconds: int = 30,
):
    """
    Global execution guard for Ollama inference.

    Guarantees:
    - Only one in-process Ollama generation request at a time
    - GPU memory is re-checked right before inference
    - Semaphore is always released, even on request/parsing failures
    """
    guard = GPUMemoryGuard(CONFIG)
    acquired = False

    log("INFO", f"Ollama guard: waiting for execution slot ({worker_name})")

    try:
        acquired = OLLAMA_EXECUTION_SEMAPHORE.acquire(timeout=acquire_timeout_seconds)
        if not acquired:
            log("ERROR", f"Ollama guard: slot acquire timeout after {acquire_timeout_seconds}s ({worker_name})")
            raise RuntimeError("Ollama execution slot timeout")

        log("INFO", f"Ollama guard: slot acquired ({worker_name})")

        is_safe, usage_gb = guard.check_memory()
        if not is_safe:
            log("WARN", f"Ollama guard: GPU memory at {usage_gb:.1f}GB, waiting ({worker_name})")
            if not guard.wait_for_memory(max_wait_seconds=gpu_wait_timeout_seconds):
                log("ERROR", f"Ollama guard: GPU memory did not recover within {gpu_wait_timeout_seconds}s ({worker_name})")
                raise RuntimeError("GPU memory saturated")

        yield

    finally:
        if acquired:
            OLLAMA_EXECUTION_SEMAPHORE.release()
            log("INFO", f"Ollama guard: slot released ({worker_name})")


class RetryHandler:
    """
    Exponential backoff retry logic for resilient fetching.
    """
    
    def __init__(self, config: PipelineConfig = CONFIG):
        self.config = config
    
    def execute(self, operation: Callable, operation_name: str = "operation") -> tuple[bool, Any]:
        """
        Execute an operation with retry logic.
        
        Args:
            operation: Callable that returns (success: bool, result: Any)
            operation_name: Name for logging
            
        Returns:
            Tuple of (success, result)
        """
        for attempt in range(1, self.config.max_retries + 1):
            try:
                success, result = operation()
                if success:
                    return True, result
                
                if attempt < self.config.max_retries:
                    log("RETRY", f"{operation_name} failed (attempt {attempt}), waiting {self.config.retry_delay_seconds}s...")
                    time.sleep(self.config.retry_delay_seconds)
            except Exception as e:
                log("ERROR", f"{operation_name} exception (attempt {attempt}): {e}")
                if attempt < self.config.max_retries:
                    time.sleep(self.config.retry_delay_seconds)
        
        log("ERROR", f"{operation_name} failed after {self.config.max_retries} attempts")
        return False, None


# =============================================================================
# SUPABASE UPLINK
# =============================================================================

class SupabaseUplink:
    """
    Handles communication with Supabase Edge Functions.
    Bearer token authentication for secure data transmission.
    """
    
    def __init__(self, config: PipelineConfig = CONFIG):
        self.config = config
        self.edge_url = config.supabase_edge_url
        self.api_key = config.data_arb_api_key
    
    def is_configured(self) -> bool:
        """Check if Supabase credentials are configured."""
        if not self.edge_url:
            log("WARN", "Uplink: SUPABASE_EDGE_FUNCTION_URL not set in .env")
            return False
        if not self.api_key:
            log("WARN", "Uplink: DATA_ARB_API_KEY not set in .env")
            return False
        return True
    
    def dispatch(self, payload: Dict[str, Any]) -> bool:
        """
        Send data to Supabase Edge Function.
        
        Args:
            payload: Data package to send (must include sentiment_score, verdict)
            
        Returns:
            True if dispatch successful
        """
        if not self.is_configured():
            return False
        
        log("INFO", f"Dispatching payload: score={payload.get('sentiment_score', 'N/A')}, verdict={payload.get('verdict', 'N/A')}")
        
        try:
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(
                self.edge_url,
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                log("OK", f"Uplink successful! HTTP {response.status_code}")
                return True
            elif response.status_code == 401:
                log("ERROR", f"Authentication failed (HTTP 401) - check DATA_ARB_API_KEY")
                return False
            else:
                log("ERROR", f"Uplink failed: HTTP {response.status_code}")
                log("ERROR", f"Response: {response.text[:200]}")
                return False
                
        except requests.exceptions.Timeout:
            log("ERROR", "Uplink timeout after 30s")
            return False
        except requests.exceptions.RequestException as e:
            log("ERROR", f"Uplink error: {e}")
            return False


# =============================================================================
# OLLAMA ENRICHMENT
# =============================================================================

class OllamaEnricher:
    """
    Local LLM sentiment analysis using Ollama.
    Optimized for RX 7700 XT local inference.
    Bulletproof: Uses CircuitBreaker + GPUMemoryGuard
    """
    
    def __init__(self, config: PipelineConfig = CONFIG):
        self.config = config
        self.circuit_breaker = CircuitBreaker(failure_threshold=3, cooldown_seconds=300)
        
        # Cleanup cache on init
        cache = PipelineCache(config)
        cache.cleanup_old_files()
        cache.enforce_size_limit()
    
    def is_available(self) -> bool:
        """Check if Ollama is running locally."""
        try:
            url = f"http://{self.config.ollama_host}:{self.config.ollama_port}/api/tags"
            req = urllib.request.Request(url, method="GET")
            with urllib.request.urlopen(req, timeout=5) as response:
                return response.status == 200
        except Exception:
            return False

    def generate_json(self, prompt: str, worker_name: str = "ollama") -> Dict[str, Any]:
        """
        Execute a custom JSON-only prompt against Ollama and return the parsed dict.

        The request is protected by the same circuit breaker and global GPU
        semaphore used by the legacy sentiment pipeline.
        """
        if not self.circuit_breaker.can_execute():
            log("WARN", f"Circuit breaker OPEN - Ollama request paused ({worker_name})")
            return {
                "error": "circuit_breaker_open",
                "model": "none",
                "processed_at": datetime.now(timezone.utc).isoformat(),
            }

        if not self.is_available():
            log("WARN", f"Ollama not available. Skipping custom JSON prompt ({worker_name})")
            self.circuit_breaker.record_failure()
            return {
                "error": "ollama_unavailable",
                "model": "none",
                "processed_at": datetime.now(timezone.utc).isoformat(),
            }

        try:
            url = f"http://{self.config.ollama_host}:{self.config.ollama_port}/api/generate"
            payload = {
                "model": self.config.ollama_model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": self.config.ollama_temperature
                }
            }

            data = json.dumps(payload).encode("utf-8")
            headers = {"Content-Type": "application/json"}
            req = urllib.request.Request(url, data=data, headers=headers, method="POST")

            with ollama_execution_guard(
                worker_name=worker_name,
                acquire_timeout_seconds=self.config.ollama_timeout,
                gpu_wait_timeout_seconds=30,
            ):
                with urllib.request.urlopen(req, timeout=self.config.ollama_timeout) as response:
                    result = json.loads(response.read().decode("utf-8"))

            llm_output = result.get("response", "{}")
            if "```json" in llm_output:
                llm_output = llm_output.split("```json", 1)[1].split("```", 1)[0]
            elif "```" in llm_output:
                llm_output = llm_output.split("```", 1)[1].split("```", 1)[0]

            parsed = json.loads(llm_output.strip())
            if not isinstance(parsed, dict):
                raise json.JSONDecodeError("Ollama response was not a JSON object", llm_output, 0)

            parsed.setdefault("model", self.config.ollama_model)
            parsed.setdefault("processed_at", datetime.now(timezone.utc).isoformat())
            self.circuit_breaker.record_success()
            return parsed

        except json.JSONDecodeError:
            log("WARN", f"Failed to parse Ollama JSON response ({worker_name})")
            self.circuit_breaker.record_failure()
            return {
                "error": "invalid_json",
                "raw_response": llm_output[:500] if "llm_output" in locals() else "",
                "model": self.config.ollama_model,
                "processed_at": datetime.now(timezone.utc).isoformat(),
            }
        except Exception as e:
            log("ERROR", f"Ollama custom JSON request failed ({worker_name}): {e}")
            self.circuit_breaker.record_failure()
            return {
                "error": str(e),
                "model": self.config.ollama_model,
                "processed_at": datetime.now(timezone.utc).isoformat(),
            }
    
    def analyze_sentiment(self, market_summary: str) -> Dict[str, Any]:
        """
        Analyze market data with local LLM and return sentiment score.
        Bulletproof: CircuitBreaker + GPUMemoryGuard protected.
        
        Args:
            market_summary: String summary of market data (tickers, prices, changes)
            
        Returns:
            Dict with sentiment_score (0-100), confidence, analysis, recommendation
        """
        # Check circuit breaker first
        if not self.circuit_breaker.can_execute():
            log("WARN", "Circuit breaker OPEN - Ollama requests paused")
            return {
                "sentiment_score": 50,
                "confidence": 0.0,
                "analysis": "Circuit breaker active - service temporarily unavailable",
                "recommendation": "hold",
                "model": "none",
                "circuit_breaker": "open"
            }
        
        if not self.is_available():
            log("WARN", "Ollama not available. Skipping LLM enrichment.")
            self.circuit_breaker.record_failure()
            return {
                "sentiment_score": 50,
                "confidence": 0.0,
                "analysis": "Ollama unavailable - default neutral score",
                "recommendation": "hold",
                "model": "none"
            }
        
        prompt = f"""Analyze the following market data and provide a sentiment score from 0-100 
where 0 is extremely bearish and 100 is extremely bullish. Be concise.

Market Data:
{market_summary}

Respond in this exact JSON format:
{{
    "sentiment_score": <0-100>,
    "confidence": <0.0-1.0>,
    "analysis": "<one sentence summary>",
    "recommendation": "<buy/sell/hold>"
}}"""

        try:
            url = f"http://{self.config.ollama_host}:{self.config.ollama_port}/api/generate"
            
            payload = {
                "model": self.config.ollama_model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": self.config.ollama_temperature
                }
            }
            
            data = json.dumps(payload).encode('utf-8')
            headers = {'Content-Type': 'application/json'}
            
            req = urllib.request.Request(url, data=data, headers=headers, method="POST")

            with ollama_execution_guard(
                worker_name=f"ollama:{self.config.ollama_model}",
                acquire_timeout_seconds=self.config.ollama_timeout,
                gpu_wait_timeout_seconds=30,
            ):
                with urllib.request.urlopen(req, timeout=self.config.ollama_timeout) as response:
                    result = json.loads(response.read().decode('utf-8'))
                    
                    # Parse LLM response
                    llm_output = result.get('response', '{}')
                    
                    # Extract JSON from potential markdown code blocks
                    if '```json' in llm_output:
                        llm_output = llm_output.split('```json')[1].split('```')[0]
                    elif '```' in llm_output:
                        llm_output = llm_output.split('```')[1].split('```')[0]
                    
                    try:
                        sentiment_data = json.loads(llm_output.strip())
                        
                        result = {
                            "sentiment_score": max(0, min(100, int(sentiment_data.get('sentiment_score', 50)))),
                            "confidence": max(0.0, min(1.0, float(sentiment_data.get('confidence', 0.5)))),
                            "analysis": sentiment_data.get('analysis', 'No analysis provided'),
                            "recommendation": sentiment_data.get('recommendation', 'hold').lower(),
                            "model": self.config.ollama_model,
                            "processed_at": datetime.now(timezone.utc).isoformat()
                        }
                        self.circuit_breaker.record_success()
                        return result
                        
                    except json.JSONDecodeError:
                        log("WARN", "Failed to parse LLM JSON response")
                        return {
                            "sentiment_score": 50,
                            "confidence": 0.3,
                            "analysis": f"Parse error - raw: {llm_output[:100]}...",
                            "recommendation": "hold",
                            "model": self.config.ollama_model,
                            "processed_at": datetime.now(timezone.utc).isoformat()
                        }
                    
        except Exception as e:
            log("ERROR", f"Ollama enrichment failed: {e}")
            self.circuit_breaker.record_failure()
            return {
                "sentiment_score": 50,
                "confidence": 0.0,
                "analysis": f"Error: {str(e)}",
                "recommendation": "hold",
                "model": self.config.ollama_model,
                "processed_at": datetime.now(timezone.utc).isoformat()
            }


# =============================================================================
# JSON OUTPUT HELPERS
# =============================================================================

def save_to_json(data: Dict[str, Any], output_dir: Path, filename_template: str = "data_{timestamp}.json") -> str:
    """
    Save data to JSON file with timestamp.
    
    Args:
        data: Data to save
        output_dir: Target directory
        filename_template: Template with {timestamp} placeholder
        
    Returns:
        Path to saved file
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    filename = filename_template.format(timestamp=timestamp)
    filepath = output_dir / filename
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    log("OK", f"Data saved to: {filepath}")
    return str(filepath)


def prepare_for_supabase(
    data: Dict[str, Any], 
    source: str, 
    enrichment: Dict[str, Any],
    pipeline_version: str = "1.0.0"
) -> Dict[str, Any]:
    """
    Standardize data format for Supabase ingestion.
    
    Args:
        data: Raw market data
        source: Data source identifier (e.g., 'fear_greed_index')
        enrichment: Enriched data from Ollama
        pipeline_version: Version string
        
    Returns:
        Dict formatted for Supabase edge function
    """
    return {
        "id": f"{source}_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source": source,
        "sentiment_score": enrichment.get('sentiment_score', 50),
        "confidence": enrichment.get('confidence', 0.0),
        "verdict": enrichment.get('recommendation', 'hold'),
        "raw_data": data,
        "mbrn_enriched": enrichment,
        "metadata": {
            "pipeline_version": pipeline_version,
            "ollama_model": enrichment.get('model', 'none'),
            "data_points": len(data) if isinstance(data, list) else 1
        }
    }


# =============================================================================
# MODULE TEST
# =============================================================================

if __name__ == "__main__":
    print("=" * 60)
    print("MBRN Pipeline Utils — Module Test")
    print("=" * 60)
    
    # Test logging
    log("INFO", "Testing structured logging")
    log("OK", "Utils module loaded successfully")
    
    # Test cache
    cache = PipelineCache()
    test_data = {"test": True, "value": 42}
    cache.set("test_key", test_data)
    cached = cache.get("test_key")
    if cached and cached.get("value") == 42:
        log("OK", "Cache system functional")
    
    # Test Ollama availability
    enricher = OllamaEnricher()
    if enricher.is_available():
        log("OK", f"Ollama available at localhost:11434")
    else:
        log("WARN", "Ollama not running — start with: ollama serve")
    
    # Test Supabase config
    uplink = SupabaseUplink()
    if uplink.is_configured():
        log("OK", "Supabase uplink configured")
    else:
        log("WARN", "Supabase credentials not set — check .env file")
    
    print("=" * 60)
    print("Module test complete")
    print("=" * 60)
