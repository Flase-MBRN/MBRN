#!/usr/bin/env python3
"""
================================================================================
MBRN Ouroboros Agent (Level-6 Autonomy)
================================================================================
Reads the MBRN Toolkit Catalog and self-mutates core system files.
"""

import argparse
import ast
import json
import os
import re
import shutil
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Dict, Any

# =============================================================================
# PATH HANDLING
# =============================================================================
_PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

from bridges.local_llm.bridge import LocalLLMBridge, LocalLLMBridgeConfig
from scripts.pipelines.pipeline_utils import log as pipeline_log

def log(level: str, message: object) -> None:
    text = str(message)
    pipeline_log(level, f"[OUROBOROS] {text}")

# =============================================================================
# CONFIGURATION
# =============================================================================
CATALOG_PATH = _PROJECT_ROOT / "scripts" / "pipelines" / "mbrn_toolkit" / "TOOLKIT_CATALOG.md"

# System scripts that the agent is allowed to mutate
TARGET_SCRIPTS = [
    _PROJECT_ROOT / "scripts" / "pipelines" / "sentinel_daemon.py",
    _PROJECT_ROOT / "scripts" / "pipelines" / "mbrn_nexus_bridge.py",
    _PROJECT_ROOT / "scripts" / "pipelines" / "mbrn_horizon_scout.py"
]

OUROBOROS_PROMPT = """You are the MBRN Ouroboros Agent, a Level-6 Autonomy meta-architect.
Your goal is to self-improve the MBRN system by integrating auto-generated toolkit modules into core system scripts.

AVAILABLE TOOLKIT CATALOG:
{catalog}

TARGET SCRIPT: {script_name}
{script_content}

TASK:
1. Review the Toolkit Catalog and the Target Script.
2. Select ONE relevant module/function from the toolkit that would improve the target script's autonomy, robustness, or capabilities.
3. Rewrite the target script to integrate this module. 
4. Important: The toolkit modules are located in `scripts.pipelines.mbrn_toolkit.modules.[module_name]`. Import them cleanly.
5. DO NOT break existing functionality. Add the new feature cleanly.
6. The output must be valid Python 3 code.

Return a JSON object matching this exact schema:
{{
  "mutation_reason": "Explanation of why this module was chosen and how it improves the script (max 200 chars)",
  "mutated_code": "The FULL, complete, updated source code of the target script. Do not truncate!"
}}

You are a professional JSON-only output engine. Output raw JSON only, no markdown wrappers.
"""

OUROBOROS_SCHEMA_HINT = """{
  "mutation_reason": "Integrated OptiCode to pre-check code syntax.",
  "mutated_code": "import os\nfrom scripts.pipelines.mbrn_toolkit.modules.somanabbasi_opticode import analyze_code\n..."
}"""


def check_syntax(code_string: str) -> bool:
    """Uses compile() to verify the syntax of the generated code."""
    try:
        compile(code_string, '<string>', 'exec')
        return True
    except SyntaxError as e:
        log("ERROR", f"Syntax Check Failed: {e}")
        return False


def run_ouroboros_mutation():
    log("INFO", "=== OUROBOROS PROTOCOL INITIATED ===")
    
    if not CATALOG_PATH.exists():
        log("WARN", "Toolkit Catalog not found. Run compiler first.")
        return

    catalog_content = CATALOG_PATH.read_text(encoding='utf-8')
    if "## Available Functions" not in catalog_content or len(catalog_content) < 200:
        log("WARN", "Toolkit Catalog is empty.")
        return

    # Select a target script sequentially based on hour
    hour = datetime.now(timezone.utc).hour
    target_path = TARGET_SCRIPTS[hour % len(TARGET_SCRIPTS)]
    
    if not target_path.exists():
        log("WARN", f"Target script not found: {target_path}")
        return

    log("INFO", f"Target Script selected: {target_path.name}")
    script_content = target_path.read_text(encoding='utf-8')

    bridge = LocalLLMBridge(LocalLLMBridgeConfig(
        model=os.getenv("OLLAMA_MODEL", "deepseek-coder-v2"),
        timeout_seconds=300
    ))
    if not bridge.is_available():
        log("WARN", "Ollama not available. Mutation aborted.")
        return

    prompt = OUROBOROS_PROMPT.format(
        catalog=catalog_content,
        script_name=target_path.name,
        script_content=script_content
    )

    log("INFO", "Querying LLM for mutation...")
    success, result = bridge.execute_custom_prompt(
        prompt=prompt,
        required_keys=["mutation_reason", "mutated_code"],
        schema_hint=OUROBOROS_SCHEMA_HINT,
        worker_name="ouroboros_meta_agent"
    )

    if not success or not isinstance(result, dict):
        log("WARN", f"Mutation generation failed: {result}")
        return

    mutation_reason = result.get("mutation_reason", "No reason provided")
    mutated_code = result.get("mutated_code", "")

    if not mutated_code:
        log("WARN", "Received empty code from LLM.")
        return

    log("OK", f"Mutation designed: {mutation_reason}")
    log("INFO", "Running Syntax Safety Gate...")

    if not check_syntax(mutated_code):
        log("ERROR", "Mutation rejected: Syntax error in generated code.")
        return

    log("OK", "Syntax Check Passed.")
    
    # Create backup
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    backup_path = target_path.with_suffix(f".py.bak_{timestamp}")
    shutil.copy2(target_path, backup_path)
    log("INFO", f"Backup created: {backup_path.name}")

    # Overwrite live file
    target_path.write_text(mutated_code, encoding='utf-8')
    log("OK", f"OUROBOROS SUCCESS: {target_path.name} has been self-mutated!")


def run_infinite_ouroboros_loop():
    log("INFO", "=== OUROBOROS BACKGROUND DAEMON STARTED ===")
    while True:
        try:
            run_ouroboros_mutation()
        except Exception as e:
            log("ERROR", f"Ouroboros loop error: {e}")
            
        # 1-Hour Cooldown
        cooldown = 3600
        log("INFO", f"Cooldown: 60 minutes...")
        time.sleep(cooldown)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--infinite", action="store_true")
    args = parser.parse_args()
    
    if args.infinite:
        run_infinite_ouroboros_loop()
    else:
        run_ouroboros_mutation()
