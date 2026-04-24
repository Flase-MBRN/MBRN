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
import random
import re
import shutil
import socket
import subprocess
import tempfile
import threading
import time
import xml.etree.ElementTree as ET
from contextlib import contextmanager
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from typing import Dict, Any, Optional, Callable, List
from dataclasses import dataclass, field

import requests
import urllib.request
import urllib.error
from bs4 import BeautifulSoup
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
    ollama_model: str = "deepseek-coder-v2"
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
    def raw_ingest_edge_url(self) -> Optional[str]:
        return os.getenv('RAW_INGEST_EDGE_URL')
    
    @property
    def data_arb_api_key(self) -> Optional[str]:
        return os.getenv('DATA_ARB_API_KEY')


# Global config instance
CONFIG = PipelineConfig()
OLLAMA_EXECUTION_SEMAPHORE = threading.Semaphore(1)
PIPELINES_ENV_PATH = Path(__file__).resolve().parent / ".env"
_ENV_LOADED = False
_JSON_WRITE_LOCKS: Dict[str, threading.Lock] = {}
_JSON_WRITE_LOCKS_GUARD = threading.Lock()


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
# ERROR PERSISTENCE (Track A – Robustness Foundation)
# =============================================================================

_PROJECT_ROOT_UTILS = Path(__file__).resolve().parents[2]
ERROR_LOG_DIR = _PROJECT_ROOT_UTILS / "docs" / "S3_Data" / "errors"


def log_error_to_disk(
    operation_name: str,
    error: Exception,
    attempt: int,
    input_data: Optional[Any] = None,
) -> Path:
    """
    Persist a structured error report to /docs/S3_Data/errors/.

    Written when all retries are exhausted so the error is never silently
    swallowed.  Safe to call from any pipeline or decorator.

    Returns:
        Path to the written JSON report.
    """
    import traceback
    ERROR_LOG_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc)
    safe_name = re.sub(r"[^A-Za-z0-9_-]+", "_", operation_name)[:60]
    filename = f"{timestamp.strftime('%Y%m%dT%H%M%S')}_{safe_name}.json"
    report = {
        "operation": operation_name,
        "failed_at": timestamp.isoformat(),
        "total_attempts": attempt,
        "error_type": type(error).__name__,
        "error_message": str(error),
        "stacktrace": traceback.format_exc(),
        "input_data_repr": repr(input_data)[:2000] if input_data is not None else None,
    }
    report_path = ERROR_LOG_DIR / filename
    try:
        report_path.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
        log("ERROR", f"Error report written: {report_path.name}")
    except Exception as write_exc:
        log("ERROR", f"Failed to write error report: {write_exc}")
    return report_path


def with_retry(
    max_retries: int = 3,
    base_delay: float = 2.0,
    backoff_factor: float = 2.0,
    exceptions: tuple = (Exception,),
    operation_name: Optional[str] = None,
    log_input: bool = False,
):
    """
    Decorator that retries the wrapped function up to *max_retries* times
    with exponential back-off before giving up.

    On final failure the full error + stacktrace is persisted to
    /docs/S3_Data/errors/ via log_error_to_disk().  The function then
    returns None instead of re-raising so callers can handle gracefully.

    Usage::

        @with_retry(max_retries=3, base_delay=2.0)
        def fetch_some_api(*args, **kwargs):
            ...

        @with_retry(max_retries=2, exceptions=(requests.exceptions.RequestException,))
        def push_to_supabase(payload):
            ...
    """
    import functools

    def decorator(func: Callable) -> Callable:
        name = operation_name or func.__qualname__

        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            last_exc: Optional[Exception] = None
            for attempt in range(1, max_retries + 1):
                try:
                    result = func(*args, **kwargs)
                    if attempt > 1:
                        log("OK", f"{name}: recovered on attempt {attempt}")
                    return result
                except exceptions as exc:
                    last_exc = exc
                    if attempt < max_retries:
                        delay = base_delay * (backoff_factor ** (attempt - 1))
                        log("RETRY", f"{name}: attempt {attempt}/{max_retries} failed ({type(exc).__name__}: {exc}). Retrying in {delay:.1f}s...")
                        time.sleep(delay)
                    else:
                        log("ERROR", f"{name}: all {max_retries} attempts exhausted.")

            # All retries failed — persist the error report, do NOT crash.
            input_snapshot = args[0] if (log_input and args) else None
            log_error_to_disk(
                operation_name=name,
                error=last_exc,
                attempt=max_retries,
                input_data=input_snapshot,
            )
            return None  # Graceful fallback — caller must handle None

        return wrapper
    return decorator


def normalize_feed_text(value: str) -> str:
    """Collapse whitespace for stable feed parsing."""
    return " ".join((value or "").split()).strip()


def strip_html_tags(value: str) -> str:
    """Remove HTML tags from feed summaries while preserving readable text."""
    if not value:
        return ""
    return normalize_feed_text(BeautifulSoup(value, "lxml").get_text(" ", strip=True))


def parse_datetime_safe(raw_value: str) -> datetime:
    """Parse RFC822/ISO timestamps into UTC."""
    if not raw_value:
        return datetime.now(timezone.utc)

    try:
        parsed = parsedate_to_datetime(raw_value)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc)
    except (TypeError, ValueError, IndexError):
        pass

    try:
        parsed = datetime.fromisoformat(str(raw_value).replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc)
    except ValueError:
        return datetime.now(timezone.utc)


def classify_fetch_error(exc: Exception) -> str:
    """Map fetch/parsing exceptions to stable reason buckets."""
    if isinstance(exc, TimeoutError):
        return "timeout"

    if isinstance(exc, urllib.error.HTTPError):
        return "http_error"

    if isinstance(exc, urllib.error.URLError):
        reason = getattr(exc, "reason", None)
        if isinstance(reason, socket.gaierror):
            return "dns_error"
        if isinstance(reason, TimeoutError):
            return "timeout"
        return "connection_error"

    if isinstance(exc, ET.ParseError):
        return "invalid_xml"

    return "unknown_error"


def _strip_markdown_fences(text: str) -> str:
    """Remove common markdown code fences from model output."""
    stripped = (text or "").strip()
    if stripped.startswith("```json"):
        return stripped.split("```json", 1)[1].split("```", 1)[0].strip()
    if stripped.startswith("```"):
        return stripped.split("```", 1)[1].split("```", 1)[0].strip()
    return stripped


def extract_json_object(text: str) -> Optional[str]:
    """
    Extract the first plausible top-level JSON object from noisy text.

    Uses a balanced-brace scan so prose around the JSON block is tolerated.
    """
    cleaned = _strip_markdown_fences(text)
    if not cleaned:
        return None

    start_index = cleaned.find("{")
    while start_index != -1:
        depth = 0
        in_string = False
        escaped = False

        for index in range(start_index, len(cleaned)):
            char = cleaned[index]

            if in_string:
                if escaped:
                    escaped = False
                elif char == "\\":
                    escaped = True
                elif char == '"':
                    in_string = False
                continue

            if char == '"':
                in_string = True
                continue

            if char == "{":
                depth += 1
            elif char == "}":
                depth -= 1
                if depth == 0:
                    candidate = cleaned[start_index : index + 1].strip()
                    if candidate:
                        return candidate
                    break

        start_index = cleaned.find("{", start_index + 1)

    return None


def parse_strict_json_response(
    text: str,
    required_keys: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Parse a JSON object from direct or noisy model output.

    Raises:
        ValueError: When parsing fails or required keys are missing.
    """
    required_keys = required_keys or []
    raw_text = text or ""
    candidates: List[str] = []

    direct = _strip_markdown_fences(raw_text)
    if direct:
        candidates.append(direct)

    extracted = extract_json_object(raw_text)
    if extracted and extracted not in candidates:
        candidates.append(extracted)

    first_brace = raw_text.find("{")
    last_brace = raw_text.rfind("}")
    if first_brace != -1 and last_brace > first_brace:
        outer_object = raw_text[first_brace : last_brace + 1].strip()
        if outer_object and outer_object not in candidates:
            candidates.append(outer_object)

    errors: List[str] = []
    for candidate in candidates:
        try:
            parsed = json.loads(candidate)
            if not isinstance(parsed, dict):
                errors.append("parsed_json_not_object")
                continue

            missing = [key for key in required_keys if key not in parsed]
            if missing:
                raise ValueError(f"missing_required_keys={','.join(missing)}")

            return parsed
        except (json.JSONDecodeError, ValueError) as exc:
            errors.append(str(exc))

    raise ValueError("strict_json_parse_failed:" + " | ".join(errors or ["no_json_object_found"]))


def repair_json_with_ollama(
    raw_output: str,
    schema_hint: str,
    model: str,
    timeout: int,
    host: str = "localhost",
    port: int = 11434,
) -> Optional[Dict[str, Any]]:
    """
    Ask Ollama to repair malformed model output into one valid JSON object.

    Returns None when repair fails.
    """
    prompt = (
        "Convert the following malformed model output into ONE valid JSON object.\n"
        "You are a professional JSON-only output engine. Never add conversational filler or markdown code blocks like ```json. Output raw JSON only.\n"
        "Return ONLY valid JSON. No preamble, no markdown, no explanation.\n\n"
        f"Schema hint:\n{schema_hint}\n\n"
        f"Malformed output:\n{raw_output}"
    )

    try:
        url = f"http://{host}:{port}/api/generate"
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.0,
            },
        }

        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        with ollama_execution_guard(
            worker_name=f"json_repair:{model}",
            acquire_timeout_seconds=timeout,
            gpu_wait_timeout_seconds=30,
        ):
            with urllib.request.urlopen(req, timeout=timeout) as response:
                result = json.loads(response.read().decode("utf-8"))

        repaired_output = result.get("response", "")
        return parse_strict_json_response(repaired_output)
    except Exception as exc:
        log("WARN", f"JSON repair with Ollama failed: {exc}")
        return None


def fetch_url_with_retry(
    url: str,
    headers_pool: List[Dict[str, str]],
    timeout_seconds: int,
    retries: int,
) -> str:
    """Fetch a URL with retry and rotating request headers."""
    attempts = max(1, retries)
    if not headers_pool:
        headers_pool = [{"User-Agent": "MBRN/1.0"}]

    last_error: Optional[Exception] = None
    for attempt in range(1, attempts + 1):
        headers = headers_pool[(attempt - 1) % len(headers_pool)]
        try:
            request = urllib.request.Request(url, headers=headers, method="GET")
            with urllib.request.urlopen(request, timeout=timeout_seconds) as response:
                return response.read().decode("utf-8", errors="replace")
        except Exception as exc:
            last_error = exc
            if attempt < attempts:
                time.sleep(min(1.5 * attempt, 3.0))

    assert last_error is not None
    raise last_error


def _extract_feed_link(entry: ET.Element) -> str:
    """Extract entry link from RSS or Atom XML."""
    link = ""
    direct_link = entry.find("link")
    if direct_link is not None:
        if direct_link.text:
            link = normalize_feed_text(direct_link.text)
        elif direct_link.attrib.get("href"):
            link = normalize_feed_text(direct_link.attrib["href"])

    if link:
        return link

    atom_link = entry.find("{http://www.w3.org/2005/Atom}link")
    if atom_link is not None:
        return normalize_feed_text(atom_link.attrib.get("href", ""))

    return ""


def _parse_xml_feed_items(root: ET.Element, source: str) -> List[Dict[str, Any]]:
    """Parse RSS/Atom XML trees into normalized feed items."""
    raw_items = root.findall(".//item")
    if not raw_items:
        raw_items = root.findall(".//{http://www.w3.org/2005/Atom}entry")

    items: List[Dict[str, Any]] = []
    for entry in raw_items:
        title = ""
        for tag in ("title", "{http://www.w3.org/2005/Atom}title"):
            element = entry.find(tag)
            if element is not None and element.text:
                title = normalize_feed_text(element.text)
                break

        if not title:
            continue

        summary = ""
        for tag in (
            "description",
            "summary",
            "content",
            "{http://www.w3.org/2005/Atom}summary",
            "{http://www.w3.org/2005/Atom}content",
        ):
            element = entry.find(tag)
            if element is not None and element.text:
                summary = strip_html_tags(element.text)
                break

        published_raw = ""
        for tag in (
            "pubDate",
            "published",
            "updated",
            "{http://www.w3.org/2005/Atom}published",
            "{http://www.w3.org/2005/Atom}updated",
        ):
            element = entry.find(tag)
            if element is not None and element.text:
                published_raw = normalize_feed_text(element.text)
                break

        items.append(
            {
                "source": source,
                "title": title,
                "summary": summary[:320],
                "link": _extract_feed_link(entry),
                "published_at": parse_datetime_safe(published_raw).isoformat(),
            }
        )

    return items


def _parse_bs4_feed_items(xml_or_html: str, source: str, parser_name: str) -> List[Dict[str, Any]]:
    """Parse malformed feeds with BeautifulSoup."""
    soup = BeautifulSoup(xml_or_html, parser_name)
    entries = soup.find_all(["item", "entry"])

    items: List[Dict[str, Any]] = []
    for entry in entries:
        title_node = entry.find(["title"])
        title = normalize_feed_text(title_node.get_text(" ", strip=True) if title_node else "")
        if not title:
            continue

        link = ""
        link_node = entry.find(["link"])
        if link_node is not None:
            link = normalize_feed_text(link_node.get("href", "") or link_node.get_text(" ", strip=True))

        summary_node = entry.find(["description", "summary", "content"])
        summary = strip_html_tags(summary_node.get_text(" ", strip=True) if summary_node else "")

        published_node = entry.find(["pubdate", "published", "updated"])
        published_raw = normalize_feed_text(published_node.get_text(" ", strip=True) if published_node else "")

        items.append(
            {
                "source": source,
                "title": title,
                "summary": summary[:320],
                "link": link,
                "published_at": parse_datetime_safe(published_raw).isoformat(),
            }
        )

    return items


def parse_feed_items(xml_or_html: str, source: str, parser_hint: str) -> List[Dict[str, Any]]:
    """
    Parse XML/HTML feed payloads into a normalized item shape.

    Supported parser hints:
    - xml
    - dirty_xml
    - html
    """
    if parser_hint == "html":
        return _parse_bs4_feed_items(xml_or_html, source, "lxml")

    try:
        root = ET.fromstring(xml_or_html)
        items = _parse_xml_feed_items(root, source)
        if items or parser_hint == "xml":
            return items
    except ET.ParseError:
        if parser_hint == "xml":
            raise

    if parser_hint == "dirty_xml":
        for parser_name in ("xml", "lxml-xml", "lxml"):
            items = _parse_bs4_feed_items(xml_or_html, source, parser_name)
            if items:
                return items
        return []

    return []


def _get_json_write_lock(filepath: Path) -> threading.Lock:
    """Return a stable in-process lock for one JSON target path."""
    normalized = str(filepath.resolve()).lower()
    with _JSON_WRITE_LOCKS_GUARD:
        lock = _JSON_WRITE_LOCKS.get(normalized)
        if lock is None:
            lock = threading.Lock()
            _JSON_WRITE_LOCKS[normalized] = lock
        return lock


@contextmanager
def _cross_process_file_lock(lock_path: Path):
    """
    Acquire a lightweight cross-process lock via a sidecar lock file.

    This complements the in-process threading lock so parallel worker runs from
    separate processes cannot interleave writes.
    """
    lock_path.parent.mkdir(parents=True, exist_ok=True)
    handle = open(lock_path, "a+b")

    try:
        if os.name == "nt":
            import msvcrt

            while True:
                try:
                    handle.seek(0)
                    msvcrt.locking(handle.fileno(), msvcrt.LK_LOCK, 1)
                    break
                except OSError:
                    time.sleep(0.05)
        else:
            import fcntl

            fcntl.flock(handle.fileno(), fcntl.LOCK_EX)

        yield
    finally:
        try:
            if os.name == "nt":
                import msvcrt

                handle.seek(0)
                msvcrt.locking(handle.fileno(), msvcrt.LK_UNLCK, 1)
            else:
                import fcntl

                fcntl.flock(handle.fileno(), fcntl.LOCK_UN)
        finally:
            handle.close()
            try:
                lock_path.unlink()
            except OSError:
                pass


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
            save_json_atomic(cache_path, data)
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
    Upgraded (Track A): final failure now persists a structured error report
    to /docs/S3_Data/errors/ via log_error_to_disk().
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
        last_exc: Optional[Exception] = None
        for attempt in range(1, self.config.max_retries + 1):
            try:
                success, result = operation()
                if success:
                    return True, result

                if attempt < self.config.max_retries:
                    log("RETRY", f"{operation_name} failed (attempt {attempt}), waiting {self.config.retry_delay_seconds}s...")
                    time.sleep(self.config.retry_delay_seconds)
                else:
                    log("ERROR", f"{operation_name} failed after {self.config.max_retries} attempts (no exception).")
                    return False, None
            except Exception as e:
                last_exc = e
                log("ERROR", f"{operation_name} exception (attempt {attempt}): {e}")
                if attempt < self.config.max_retries:
                    delay = self.config.retry_delay_seconds * (2 ** (attempt - 1))
                    time.sleep(delay)

        if last_exc is not None:
            log_error_to_disk(
                operation_name=operation_name,
                error=last_exc,
                attempt=self.config.max_retries,
            )
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
        self.raw_ingest_edge_url = config.raw_ingest_edge_url
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

    def is_raw_ingest_configured(self) -> bool:
        """Check if raw-ingest credentials are configured."""
        if not self.raw_ingest_edge_url:
            log("WARN", "Uplink: RAW_INGEST_EDGE_URL not set in .env")
            return False
        if not self.api_key:
            log("WARN", "Uplink: DATA_ARB_API_KEY not set in .env")
            return False
        return True

    def _dispatch_json(self, url: str, payload: Dict[str, Any], timeout_seconds: int = 30) -> tuple[bool, Optional[Dict[str, Any]]]:
        """Send JSON payloads to an authenticated Supabase edge function."""
        try:
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }

            response = requests.post(
                url,
                headers=headers,
                json=payload,
                timeout=timeout_seconds
            )

            if response.status_code == 200:
                result = response.json()
                return True, result
            if response.status_code == 401:
                log("ERROR", "Authentication failed (HTTP 401) - check DATA_ARB_API_KEY")
                return False, None

            log("ERROR", f"Uplink failed: HTTP {response.status_code}")
            log("ERROR", f"Response: {response.text[:200]}")
            return False, None

        except requests.exceptions.Timeout:
            log("ERROR", f"Uplink timeout after {timeout_seconds}s")
            return False, None
        except requests.exceptions.RequestException as e:
            log("ERROR", f"Uplink error: {e}")
            return False, None
    
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
        
        success, _ = self._dispatch_json(self.edge_url, payload, timeout_seconds=30)
        if success:
            log("OK", "Uplink successful! HTTP 200")
        return success

    def dispatch_raw_ingest(self, payload: Dict[str, Any]) -> tuple[bool, Optional[Dict[str, Any]]]:
        """Send a raw-ingest batch payload to the dedicated edge function."""
        if not self.is_raw_ingest_configured():
            return False, None

        item_count = len(payload.get("items", [])) if isinstance(payload.get("items"), list) else 0
        log("INFO", f"Dispatching raw-ingest batch: items={item_count}")
        success, result = self._dispatch_json(self.raw_ingest_edge_url, payload, timeout_seconds=45)
        if success:
            log("OK", "Raw-ingest uplink successful! HTTP 200")
        return success, result


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

def save_json_atomic(filepath: Path | str, data: Dict[str, Any]) -> str:
    """
    Persist JSON atomically and thread-safely.

    Strategy:
    - In-process lock per target path
    - Cross-process sidecar lock file
    - Write to temp file in the same directory
    - Flush + fsync temp file
    - Atomic replace onto the target path
    """
    target_path = Path(filepath)
    target_path.parent.mkdir(parents=True, exist_ok=True)

    thread_lock = _get_json_write_lock(target_path)
    lock_path = target_path.with_suffix(f"{target_path.suffix}.lock")
    temp_path: Optional[Path] = None

    with thread_lock:
        with _cross_process_file_lock(lock_path):
            try:
                with tempfile.NamedTemporaryFile(
                    mode="w",
                    encoding="utf-8",
                    dir=target_path.parent,
                    prefix=f"{target_path.stem}_",
                    suffix=".tmp",
                    delete=False,
                ) as handle:
                    json.dump(data, handle, indent=2, ensure_ascii=False)
                    handle.flush()
                    os.fsync(handle.fileno())
                    temp_path = Path(handle.name)

                os.replace(temp_path, target_path)
                return str(target_path)
            finally:
                if temp_path and temp_path.exists():
                    try:
                        temp_path.unlink()
                    except OSError:
                        pass

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
    
    save_json_atomic(filepath, data)
    
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


# =============================================================================
# CENTRALIZED DATA CONFIGURATION (Phase 1: Operation Zentralisierung)
# =============================================================================

# RSS Feed Configuration - Single Source of Truth
RSS_CONFIG = {
    "header_pool": [
        {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0 Safari/537.36",
            "Accept": "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
        },
        {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0 Safari/537.36",
            "Accept": "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
        },
        {
            "User-Agent": "MBRN-RawIngest/1.0 (+markets-news-collector)",
            "Accept": "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
        },
    ],
    "feeds": [
        {
            "source": "CNBC Markets",
            "url": "https://www.cnbc.com/id/100003114/device/rss/rss.html",
            "parser_hint": "dirty_xml",
            "timeout_seconds": 8,
            "retries": 2,
        },
        {
            "source": "CNBC Finance",
            "url": "https://www.cnbc.com/id/10000664/device/rss/rss.html",
            "parser_hint": "dirty_xml",
            "timeout_seconds": 8,
            "retries": 2,
        },
        {
            "source": "Google News Markets",
            "url": "https://news.google.com/rss/search?q=markets%20when:7d&hl=en-US&gl=US&ceid=US:en",
            "parser_hint": "dirty_xml",
            "timeout_seconds": 8,
            "retries": 2,
        },
        {
            "source": "Google News Business",
            "url": "https://news.google.com/rss/search?q=finance%20business%20when:7d&hl=en-US&gl=US&ceid=US:en",
            "parser_hint": "dirty_xml",
            "timeout_seconds": 8,
            "retries": 2,
        },
    ],
    "default_news_limit": 25,
}

# Market Data Configuration
MARKET_CONFIG = {
    "tickers": ["SPY", "QQQ", "DIA", "IWM", "^VIX", "BTC-USD", "ETH-USD"],
    "lookback_days": 5,
    "default_limit_per_feed": 25,
}

# Sentiment Analysis Keywords (for deterministic pre-classification)
SENTIMENT_KEYWORDS = {
    "positive": {
        "surge", "rally", "beat", "growth", "expand", "record", "gain", "approve", "bull", "optimism",
    },
    "negative": {
        "drop", "fall", "miss", "cut", "downgrade", "lawsuit", "probe", "investigation", "crash", "bear",
    },
}


def is_crypto_ticker(ticker: str) -> bool:
    """Identify crypto pairs inside the mixed market ticker list."""
    return ticker.endswith("-USD")


def safe_round(value: Any, digits: int = 2) -> Optional[float]:
    """Round values from pandas/yfinance safely."""
    try:
        if value is None:
            return None
        return round(float(value), digits)
    except (TypeError, ValueError):
        return None


def fetch_market_snapshot(ticker: str, lookback_days: int = 5) -> Optional[Dict[str, Any]]:
    """
    Fetch market data for a given ticker symbol using yfinance.
    Centralized function used by all pipelines.
    """
    try:
        import yfinance as yf

        stock = yf.Ticker(ticker)
        hist = stock.history(period=f"{lookback_days}d")
        info = getattr(stock, "info", {}) or {}

        if hist.empty:
            return None

        latest = hist.iloc[-1]
        prev = hist.iloc[-2] if len(hist) > 1 else latest

        latest_close = float(latest["Close"])
        prev_close = float(prev["Close"])
        change = latest_close - prev_close
        change_pct = (change / prev_close) * 100 if prev_close else 0.0

        # Extract source timestamp if available
        source_timestamp = getattr(latest, "name", None)
        observed_at = datetime.now(timezone.utc).isoformat()
        if source_timestamp is not None and hasattr(source_timestamp, "to_pydatetime"):
            observed_at = source_timestamp.to_pydatetime().astimezone(timezone.utc).isoformat()

        return {
            "ticker": ticker,
            "asset_class": "crypto" if is_crypto_ticker(ticker) else "equity",
            "price": safe_round(latest_close, 2) or 0.0,
            "change": safe_round(change, 2) or 0.0,
            "change_percent": safe_round(change_pct, 2) or 0.0,
            "volume": int(float(latest.get("Volume", 0) or 0)),
            "high": safe_round(latest.get("High"), 2) or 0.0,
            "low": safe_round(latest.get("Low"), 2) or 0.0,
            "currency": info.get("currency") or "USD",
            "short_name": info.get("shortName") or ticker,
            "exchange": info.get("exchange") or None,
            "observed_at": observed_at,
            "source": "yfinance",
            "source_url": f"https://finance.yahoo.com/quote/{ticker}",
        }

    except ImportError:
        log("WARN", f"yfinance not installed; market snapshot skipped for {ticker}")
        return None
    except Exception as exc:
        log("WARN", f"Market fetch failed ticker={ticker} reason={exc}")
        return None


def fetch_news_batch(
    feeds: Optional[List[Dict[str, Any]]] = None,
    headers_pool: Optional[List[Dict[str, str]]] = None,
    limit_per_feed: int = 25,
) -> tuple[List[Dict[str, Any]], List[str]]:
    """
    Fetch and normalize news from multiple RSS feeds.
    Centralized function used by all pipelines.

    Returns:
        Tuple of (collected_items, failure_messages)
    """
    feeds = feeds or RSS_CONFIG["feeds"]
    headers_pool = headers_pool or RSS_CONFIG["header_pool"]

    collected: List[Dict[str, Any]] = []
    failures: List[str] = []
    seen_hashes: set[str] = set()

    for feed in feeds:
        try:
            payload = fetch_url_with_retry(
                url=feed["url"],
                headers_pool=headers_pool,
                timeout_seconds=int(feed.get("timeout_seconds", 8)),
                retries=int(feed.get("retries", 2)),
            )
            parsed = parse_feed_items(payload, feed["source"], str(feed.get("parser_hint", "xml")))
            if not parsed:
                failures.append(f"{feed['source']}:empty_feed")
                log("WARN", f"News feed empty source={feed['source']}")
                continue

            for item in parsed[:limit_per_feed]:
                # Build dedupe key from link or title
                dedupe_key = (item.get("link") or item.get("title") or "").strip().lower()
                if dedupe_key:
                    if dedupe_key in seen_hashes:
                        continue
                    seen_hashes.add(dedupe_key)
                collected.append(item)

            log("OK", f"News loaded source={feed['source']} items={len(parsed)}")
        except Exception as exc:
            reason = classify_fetch_error(exc)
            failures.append(f"{feed['source']}:{reason}")
            log("WARN", f"News feed failed source={feed['source']} reason={reason} detail={exc}")

    return collected, failures


def classify_news_bias(news_items: List[Dict[str, Any]]) -> str:
    """Derive a lightweight deterministic news bias from headline keywords."""
    balance = 0
    for item in news_items:
        text = f"{item.get('title', '')} {item.get('summary', '')}".lower()
        balance += sum(1 for keyword in SENTIMENT_KEYWORDS["positive"] if keyword in text)
        balance -= sum(1 for keyword in SENTIMENT_KEYWORDS["negative"] if keyword in text)

    if balance > 1:
        return "bullish"
    if balance < -1:
        return "bearish"
    return "neutral"


def get_news_impact_seed(news_items: List[Dict[str, Any]]) -> int:
    """Estimate the raw impact seed before LLM enrichment."""
    if not news_items:
        return 0
    headline_weight = min(50, len(news_items) * 6)
    keyword_weight = 0
    all_keywords = SENTIMENT_KEYWORDS["positive"] | SENTIMENT_KEYWORDS["negative"]
    for item in news_items[:5]:
        text = f"{item.get('title', '')} {item.get('summary', '')}".lower()
        keyword_weight += 4 * sum(1 for keyword in all_keywords if keyword in text)
    return min(100, headline_weight + keyword_weight)
