#!/usr/bin/env python3
"""
MBRN Toolmaker - Operation MacGyver Agent.

Autonomous tool creation to overcome Nexus blockages.
Generates standalone Python scripts based on tool requests,
validates them in the sandbox, and deploys them to the toolkit.
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import time
import urllib.request
import urllib.error
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = PROJECT_ROOT / "shared" / "data"
TOOLKIT_DIR = PROJECT_ROOT / "shared" / "toolkit"
TOOL_REQUESTS_PATH = DATA_DIR / "tool_requests.json"
SANDBOX_CONTROLLER = PROJECT_ROOT / "scripts" / "pipelines" / "sandbox_controller.py"

OLLAMA_URL = os.getenv("OLLAMA_GENERATE_URL", "http://127.0.0.1:11434/api/generate")
CODER_MODEL = "deepseek-coder-v2"


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def log(level: str, message: object) -> None:
    print(f"[{utc_now()}] [TOOLMAKER] [{level}] {message}")


def read_json(path: Path, fallback: Any) -> Any:
    try:
        if not path.exists():
            return fallback
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return fallback


def atomic_write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    tmp.replace(path)


def call_coder(prompt: str, timeout_seconds: int = 300) -> Tuple[bool, str]:
    payload = {
        "model": CODER_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.0,
            "num_predict": 2048,
        },
    }
    try:
        req = urllib.request.Request(
            OLLAMA_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=timeout_seconds) as response:
            body = json.loads(response.read().decode("utf-8"))
        return True, str(body.get("response", ""))
    except Exception as exc:
        return False, str(exc)


def extract_code(text: str) -> str:
    if "```python" in text:
        return text.split("```python")[1].split("```")[0].strip()
    if "```" in text:
        return text.split("```")[1].split("```")[0].strip()
    return text.strip()


def run_sandbox_validation(script_path: Path) -> Tuple[bool, str]:
    try:
        # We call the sandbox controller to run the script
        cmd = [
            "python",
            str(SANDBOX_CONTROLLER),
            "--run",
            str(script_path),
            "--timeout",
            "30"
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        return result.returncode == 0, result.stdout + result.stderr
    except Exception as exc:
        return False, str(exc)


def process_request(request: Dict[str, Any]) -> bool:
    alpha_id = request.get("alpha_id", "unknown")
    description = request.get("requested_tool_description", "")
    
    log("INFO", f"Processing tool request for alpha {alpha_id}: {description}")

    prompt = f"""You are MacGyver, a self-tooling agent.
Write a standalone Python script that solves this specific problem:
{description}

RULES:
1. USE ONLY PYTHON STANDARD LIBRARY. NO PIP PACKAGES.
2. The script must be self-contained and runnable.
3. Include a simple self-test block at the bottom.
4. Output ONLY the code within a markdown python block.
"""

    success, response = call_coder(prompt)
    if not success:
        log("ERROR", f"Coder LLM call failed: {response}")
        return False

    code = extract_code(response)
    if not code:
        log("WARN", "LLM returned empty code.")
        return False

    tool_name = f"mbrn_tool_{alpha_id.replace('/', '_')}.py"
    temp_path = TOOLKIT_DIR / f"tmp_{tool_name}"
    TOOLKIT_DIR.mkdir(parents=True, exist_ok=True)
    temp_path.write_text(code, encoding="utf-8")

    log("INFO", f"Validating tool {tool_name} in sandbox...")
    valid, output = run_sandbox_validation(temp_path)
    
    if valid:
        final_path = TOOLKIT_DIR / tool_name
        temp_path.replace(final_path)
        log("OK", f"Tool validated and deployed: {final_path}")
        return True
    else:
        log("ERROR", f"Tool validation failed:\n{output}")
        temp_path.unlink(missing_ok=True)
        return False


def run_toolmaker_pass() -> int:
    requests = read_json(TOOL_REQUESTS_PATH, [])
    if not requests:
        log("INFO", "No pending tool requests found.")
        return 0

    pending = [r for r in requests if r.get("status") == "pending"]
    if not pending:
        log("INFO", "No pending tool requests.")
        return 0

    log("INFO", f"Found {len(pending)} pending request(s).")
    
    # Process only the first one for now
    target = pending[0]
    success = process_request(target)
    
    if success:
        target["status"] = "completed"
    else:
        target["status"] = "failed"
    
    target["processed_at"] = utc_now()
    atomic_write_json(TOOL_REQUESTS_PATH, requests)
    return 1 if success else 0


def main() -> int:
    parser = argparse.ArgumentParser(description="MBRN Toolmaker - Operation MacGyver Agent")
    parser.add_argument("--once", action="store_true", help="Process one pending request and exit")
    args = parser.parse_args()

    # Always run once as per request
    run_toolmaker_pass()
    return 0


if __name__ == "__main__":
    main()
