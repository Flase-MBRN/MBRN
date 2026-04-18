"""
SENTINEL_DAEMON.PY

MBRN Sentinel V2 scheduler for Pillar 3 workers.
Loads worker callables from the registry and runs them on individual intervals.
"""

from __future__ import annotations

import importlib
import os
import sys
import threading
import time
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Callable, Dict, Optional

from worker_registry import WORKER_REGISTRY, WorkerDefinition


CONFIG = {
    "heartbeat_seconds": 5,
    "log_prefix": "[SENTINEL]",
}

ANSI = {
    "reset": "\033[0m",
    "bold": "\033[1m",
    "violet": "\033[38;2;123;92;245m",
    "violet_soft": "\033[38;2;167;139;250m",
    "void_blue": "\033[38;2;10;10;15m",
    "storm_blue": "\033[38;2;15;15;21m",
    "silver": "\033[38;2;245;245;245m",
    "soft_silver": "\033[38;2;180;184;198m",
    "success": "\033[38;2;79;255;176m",
    "warning": "\033[38;2;251;191;36m",
    "error": "\033[38;2;255;107;107m",
}

LOG_TONES = {
    "START": ANSI["violet_soft"],
    "DISPATCH": ANSI["violet"],
    "OK": ANSI["silver"],
    "SCHEDULE": ANSI["soft_silver"],
    "WARN": ANSI["warning"],
    "FAIL": ANSI["error"],
    "ERROR": ANSI["error"],
    "STOP": ANSI["soft_silver"],
    "CRASH": ANSI["error"],
}


def enable_ansi_support() -> None:
    """Enable ANSI colors on modern Windows terminals when possible."""
    if os.name != "nt":
        return

    try:
        import ctypes

        kernel32 = ctypes.windll.kernel32
        handle = kernel32.GetStdHandle(-11)
        mode = ctypes.c_uint32()
        if kernel32.GetConsoleMode(handle, ctypes.byref(mode)):
            kernel32.SetConsoleMode(handle, mode.value | 0x0004)
    except Exception:
        pass


def colorize(text: str, color: str, bold: bool = False) -> str:
    """Wrap text with ANSI color codes."""
    prefix = ANSI["bold"] if bold else ""
    return f"{prefix}{color}{text}{ANSI['reset']}"


def sentinel_prefix() -> str:
    """Render the branded Sentinel prefix in MBRN accent color."""
    return colorize(CONFIG["log_prefix"], ANSI["violet"], bold=True)


def themed_separator(char: str = "=", width: int = 72) -> str:
    """Render a dashboard-style separator line."""
    return colorize(char * width, ANSI["soft_silver"])


def build_header() -> str:
    """Build the MBRN Starry Sky ASCII header."""
    logo_lines = [
        " __  __ ____  ____  _   _ ",
        "|  \\/  | __ )|  _ \\| \\ | |",
        "| |\\/| |  _ \\| |_) |  \\| |",
        "| |  | | |_) |  _ <| |\\  |",
        "|_|  |_|____/|_| \\_\\_| \\_|",
    ]

    header = [
        themed_separator(),
        colorize("MBRN STARLIGHT CONTROL", ANSI["violet"], bold=True),
        colorize("Sentinel V2 - Registry Scheduler - Starry Sky Console", ANSI["soft_silver"]),
        themed_separator("-", 72),
    ]

    header.extend(colorize(line, ANSI["violet_soft"], bold=True) for line in logo_lines)
    header.append(themed_separator())
    return "\n".join(header)


def utc_now() -> datetime:
    """Return the current UTC datetime."""
    return datetime.now(timezone.utc)


def log(message: str) -> None:
    """Structured Sentinel log output in UTC."""
    timestamp = utc_now().strftime("%Y-%m-%d %H:%M:%S UTC")
    level = message.split(" ", 1)[0] if message else "INFO"
    tone = LOG_TONES.get(level, ANSI["soft_silver"])
    print(f"{sentinel_prefix()} {colorize(f'[{timestamp}]', ANSI['soft_silver'])} {colorize(message, tone)}")


@dataclass
class WorkerState:
    """Runtime state for a single registered worker."""

    worker_id: str
    is_running: bool = False
    last_started_at: Optional[str] = None
    last_finished_at: Optional[str] = None
    last_success: Optional[bool] = None
    last_error: Optional[str] = None
    next_run_at: Optional[datetime] = None
    queued_once: bool = False
    timeout_reported: bool = False
    thread: Optional[threading.Thread] = None
    started_monotonic: Optional[float] = None
    lock: threading.Lock = field(default_factory=threading.Lock, repr=False)


def resolve_worker_callable(definition: WorkerDefinition) -> Callable:
    """Resolve a worker callable from its registry definition."""
    module = importlib.import_module(definition.module_path)
    return getattr(module, definition.callable_name)


def initialize_states() -> Dict[str, WorkerState]:
    """Create initial runtime state for all registered workers."""
    now = utc_now()
    states: Dict[str, WorkerState] = {}

    for definition in WORKER_REGISTRY:
        states[definition.worker_id] = WorkerState(
            worker_id=definition.worker_id,
            next_run_at=now,
        )

    return states


def format_next_run(next_run_at: Optional[datetime]) -> str:
    """Format a next-run timestamp for logs."""
    if not next_run_at:
        return "n/a"
    return next_run_at.isoformat()


def worker_runner(definition: WorkerDefinition, state: WorkerState) -> None:
    """Execute a worker callable and update runtime state."""
    start_monotonic = time.monotonic()
    success = False
    error_message: Optional[str] = None

    log(
        f"START worker_id={definition.worker_id} "
        f"interval={definition.interval_minutes}m timeout={definition.timeout_seconds}s "
        f"uses_ollama={definition.uses_ollama}"
    )

    try:
        worker_callable = resolve_worker_callable(definition)
        result = worker_callable()
        success = result is not False
        if not success:
            error_message = "Worker returned False"
    except Exception as exc:
        error_message = str(exc)
        log(f"ERROR worker_id={definition.worker_id} exception={error_message}")
    finally:
        finished_at = utc_now()
        next_run_at = finished_at + timedelta(minutes=definition.interval_minutes)
        duration_seconds = time.monotonic() - start_monotonic

        with state.lock:
            state.is_running = False
            state.last_finished_at = finished_at.isoformat()
            state.last_success = success
            state.last_error = error_message
            state.next_run_at = next_run_at
            state.queued_once = False
            state.timeout_reported = False
            state.thread = None
            state.started_monotonic = None

        if success:
            log(
                f"OK worker_id={definition.worker_id} "
                f"duration={duration_seconds:.2f}s next_run_at={next_run_at.isoformat()}"
            )
            log(
                f"SCHEDULE worker_id={definition.worker_id} "
                f"next_run_at={format_next_run(next_run_at)}"
            )
        else:
            log(
                f"FAIL worker_id={definition.worker_id} "
                f"duration={duration_seconds:.2f}s error={error_message} "
                f"next_run_at={format_next_run(next_run_at)}"
            )


def launch_worker(definition: WorkerDefinition, state: WorkerState) -> bool:
    """Launch a worker in a dedicated thread if it is not already running."""
    with state.lock:
        if state.is_running:
            return False

        state.is_running = True
        state.last_started_at = utc_now().isoformat()
        state.started_monotonic = time.monotonic()
        state.last_error = None
        state.timeout_reported = False

        thread = threading.Thread(
            target=worker_runner,
            name=f"sentinel-{definition.worker_id}",
            args=(definition, state),
            daemon=True,
        )
        state.thread = thread

    thread.start()
    return True


def is_due(state: WorkerState, now: datetime) -> bool:
    """Check whether a worker is due to run."""
    if state.is_running:
        return False
    if state.next_run_at is None:
        return True
    return now >= state.next_run_at


def monitor_running_worker(definition: WorkerDefinition, state: WorkerState) -> None:
    """Emit a warning if a worker exceeds its configured timeout."""
    with state.lock:
        if not state.is_running or state.started_monotonic is None:
            return

        elapsed = time.monotonic() - state.started_monotonic
        if elapsed <= definition.timeout_seconds or state.timeout_reported:
            return

        state.timeout_reported = True

    log(
        f"WARN worker_id={definition.worker_id} "
        f"elapsed={elapsed:.2f}s exceeded_timeout={definition.timeout_seconds}s"
    )


def tick_scheduler(states: Dict[str, WorkerState]) -> None:
    """Single scheduler heartbeat."""
    now = utc_now()

    for definition in WORKER_REGISTRY:
        if not definition.enabled:
            continue

        state = states[definition.worker_id]
        monitor_running_worker(definition, state)

        if is_due(state, now):
            started = launch_worker(definition, state)
            if started:
                log(
                    f"DISPATCH worker_id={definition.worker_id} "
                    f"scheduled_at={now.isoformat()} heartbeat={CONFIG['heartbeat_seconds']}s"
                )


def main() -> None:
    """Start the Sentinel V2 scheduler loop."""
    enable_ansi_support()
    states = initialize_states()

    print(build_header())
    log("SENTINEL V2 STARTED")
    log(f"SCHEDULE Heartbeat={CONFIG['heartbeat_seconds']}s")
    log(f"SCHEDULE CurrentUTC={utc_now().isoformat()}")
    log(f"SCHEDULE RegisteredWorkers={len(WORKER_REGISTRY)}")

    for definition in WORKER_REGISTRY:
        log(
            f"SCHEDULE Worker id={definition.worker_id} "
            f"interval={definition.interval_minutes}m timeout={definition.timeout_seconds}s "
            f"enabled={definition.enabled} uses_ollama={definition.uses_ollama}"
        )

    print(themed_separator())

    while True:
        tick_scheduler(states)
        time.sleep(CONFIG["heartbeat_seconds"])


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        log("STOP requested by user")
        sys.exit(0)
    except Exception as exc:
        log(f"CRASH {exc}")
        sys.exit(1)
