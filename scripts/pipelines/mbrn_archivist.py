#!/usr/bin/env python3
"""
MBRN Archivist - Level 4.9 Knowledge Compression Agent.

Analyzes factory-ready modules, distills architecture patterns, and updates
the factory memory with synthesized master principles.
"""

from __future__ import annotations

import argparse
import json
import os
import random
import time
import urllib.request
import urllib.error
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = PROJECT_ROOT / "shared" / "data"
FACTORY_READY_DIR = PROJECT_ROOT / "docs" / "S3_Data" / "outputs" / "factory_ready"
MEMORY_PATH = DATA_DIR / "mbrn_factory_memory.json"

OLLAMA_URL = os.getenv("OLLAMA_GENERATE_URL", "http://127.0.0.1:11434/api/generate")
ARCHIVIST_MODEL = "deepseek-r1:14b"


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def log(level: str, message: object) -> None:
    print(f"[{utc_now()}] [ARCHIVIST] [{level}] {message}")


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


def call_ollama(prompt: str, timeout_seconds: int = 300) -> Tuple[bool, str]:
    payload = {
        "model": ARCHIVIST_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.1,
            "num_predict": 512,
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


def extract_patterns(llm_response: str) -> str:
    """Extracts the distilled sentences from the LLM response, stripping R1's thought process if present."""
    if "</thought>" in llm_response:
        llm_response = llm_response.split("</thought>")[-1]
    return llm_response.strip()


def run_archive_pass() -> bool:
    if not FACTORY_READY_DIR.exists():
        log("WARN", f"Factory-ready directory not found: {FACTORY_READY_DIR}")
        return False

    all_files = list(FACTORY_READY_DIR.glob("*.py"))
    if not all_files:
        log("INFO", "No factory-ready modules found to analyze.")
        return False

    # Batching: 3-5 random files
    batch_size = random.randint(3, 5)
    selected_files = random.sample(all_files, min(len(all_files), batch_size))
    log("INFO", f"Analyzing batch of {len(selected_files)} files: {[f.name for f in selected_files]}")

    combined_code = ""
    for f in selected_files:
        try:
            combined_code += f"\n\n# FILE: {f.name}\n"
            combined_code += f.read_text(encoding="utf-8", errors="replace")
        except Exception as exc:
            log("WARN", f"Failed to read {f.name}: {exc}")

    system_prompt = (
        "Du bist der Chief Knowledge Officer. Analysiere diese fertigen Code-Module. "
        "Finde wiederkehrende Architektur-Muster (z.B. wie Fehler behandelt werden, wie APIs angebunden sind). "
        "Extrahiere nur die universell anwendbaren Best Practices und bündle sie. "
        "Schreibe KEINEN Code, sondern destilliere das Wissen in 2-3 kompakte, englische Sätze."
    )

    full_prompt = f"{system_prompt}\n\nCODE BATCH:\n{combined_code[:12000]}"
    
    log("INFO", f"Calling {ARCHIVIST_MODEL} for pattern extraction...")
    success, response = call_ollama(full_prompt)
    if not success:
        log("ERROR", f"LLM call failed: {response}")
        return False

    patterns = extract_patterns(response)
    if not patterns:
        log("WARN", "LLM returned empty patterns.")
        return False

    log("OK", f"Extracted Patterns: {patterns}")

    # Memory Update
    memory = read_json(MEMORY_PATH, {"documents": []})
    if "synthesized_master_patterns" not in memory:
        memory["synthesized_master_patterns"] = []
    
    memory["synthesized_master_patterns"].append({
        "timestamp": utc_now(),
        "files_analyzed": [f.name for f in selected_files],
        "patterns": patterns
    })

    # Limit history to last 50 entries
    memory["synthesized_master_patterns"] = memory["synthesized_master_patterns"][-50:]

    atomic_write_json(MEMORY_PATH, memory)
    log("OK", "Factory memory updated with synthesized master patterns.")
    return True


def run_loop(interval_hours: float) -> None:
    log("INFO", f"Starting Archivist loop with {interval_hours}h interval.")
    while True:
        try:
            run_archive_pass()
        except Exception as exc:
            log("ERROR", f"Archivist pass failed: {exc}")
        time.sleep(interval_hours * 3600)


def main() -> int:
    parser = argparse.ArgumentParser(description="MBRN Archivist - Level 4.9 Knowledge Compression Agent")
    parser.add_argument("--once", action="store_true", help="Run one archive pass and exit")
    parser.add_argument("--infinite", action="store_true", help="Run archive passes forever")
    parser.add_argument("--interval-hours", type=float, default=12.0)
    args = parser.parse_args()

    if args.infinite:
        run_loop(args.interval_hours)
        return 0

    success = run_archive_pass()
    return 0 if success else 1


if __name__ == "__main__":
    import sys
    sys.exit(main())
