#!/usr/bin/env python3
"""
Track-A Validation Test: with_retry decorator + log_error_to_disk()
Run: .\venv\Scripts\python.exe scripts\pipelines\_test_retry_decorator.py
"""
import sys, json
sys.path.insert(0, "scripts/pipelines")
from pipeline_utils import with_retry, ERROR_LOG_DIR

call_count = 0

@with_retry(max_retries=3, base_delay=0.1, operation_name="test_simulated_network_call")
def simulated_api_call():
    global call_count
    call_count += 1
    print(f"  [Attempt {call_count}] Simulating network timeout...")
    raise ConnectionError("Simulated: remote host unreachable (timeout after 5s)")

print("=" * 50)
print("TRACK-A TEST: Retry Decorator + Disk Error Log")
print("=" * 50)

result = simulated_api_call()

print(f"\nResult returned to caller : {result!r}  (None = graceful fallback, NOT a crash)")
print(f"Total attempts made       : {call_count}")
print(f"Error log directory       : {ERROR_LOG_DIR}")

if ERROR_LOG_DIR.exists():
    reports = sorted(ERROR_LOG_DIR.glob("*test_simulated*.json"))
    if reports:
        latest = reports[-1]
        print(f"\nError report written      : {latest.name}")
        data = json.loads(latest.read_text(encoding="utf-8"))
        print(f"  operation      : {data['operation']}")
        print(f"  error_type     : {data['error_type']}")
        print(f"  total_attempts : {data['total_attempts']}")
        print(f"  error_message  : {data['error_message'][:80]}")
        print("\n=== TEST PASSED: Retry exhausted, error persisted, system did NOT crash ===")
    else:
        print("ERROR: No report found — check ERROR_LOG_DIR path")
else:
    print(f"ERROR: Log directory does not exist: {ERROR_LOG_DIR}")
