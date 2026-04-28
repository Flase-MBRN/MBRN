#!/usr/bin/env python3
"""
================================================================================
MBRN Ouroboros Agent v2 — Level-6 Autonomy (Chirurgisch)
================================================================================
Upgrade v2:
  - Model: deepseek-r1:14b (Reasoning Engine — denkt BEVOR es schreibt)
  - Methode: AST-Chirurgie statt Full-Rewrite
    → LLM liefert nur {"target_function": "...", "new_code": "..."}
    → System tauscht NUR diese eine Funktion aus (nie main(), nie die ganze Datei)
  - Safety Gate: compile() auf die GESAMTE Datei nach dem Swap
  - Backup: .bak_Datum vor jedem Swap
================================================================================
"""

import argparse
import ast
import json
import os
import shutil
import subprocess
import sys
import textwrap
import time

# Windows: Suppress console window for subprocess calls
CREATE_NO_WINDOW = 0x08000000 if os.name == 'nt' else 0
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

# =============================================================================
# PATH HANDLING
# =============================================================================
_PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

from bridges.local_llm.bridge import LocalLLMBridge, LocalLLMBridgeConfig
from scripts.pipelines.pipeline_utils import log as pipeline_log

def log(level: str, message: object) -> None:
    pipeline_log(level, f"[OUROBOROS-v2] {str(message)}")

# =============================================================================
# CONFIGURATION
# =============================================================================
OUROBOROS_MODEL    = "deepseek-r1:14b"   # Reasoning Engine — Chefarzt
OUROBOROS_TIMEOUT  = 600                 # 10 Min — R1 denkt länger, aber besser
CATALOG_PATH = _PROJECT_ROOT / "scripts" / "pipelines" / "mbrn_toolkit" / "TOOLKIT_CATALOG.md"

TARGET_SCRIPTS = [
    _PROJECT_ROOT / "scripts" / "pipelines" / "sentinel_daemon.py",
    _PROJECT_ROOT / "scripts" / "pipelines" / "mbrn_nexus_bridge.py",
    _PROJECT_ROOT / "scripts" / "pipelines" / "mbrn_horizon_scout.py",
]

# =============================================================================
# AST-BASED FUNCTION SCANNER
# =============================================================================

def get_all_functions(source_code: str) -> list[str]:
    """Extract all top-level function names from source code via AST."""
    try:
        tree = ast.parse(source_code)
        return [
            node.name
            for node in ast.walk(tree)
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))
        ]
    except SyntaxError:
        return []


def ast_replace_function(source_code: str, target_func: str, new_func_code: str) -> Optional[str]:
    """
    Replaces a single named function in source_code with new_func_code via AST.
    Returns the modified source, or None on failure.
    """
    try:
        tree = ast.parse(source_code)
    except SyntaxError as e:
        log("ERROR", f"Original source has syntax error: {e}")
        return None

    lines = source_code.splitlines(keepends=True)

    # Find the target function node
    target_node = None
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and node.name == target_func:
            target_node = node
            break

    if target_node is None:
        log("WARN", f"Function '{target_func}' not found in source.")
        return None

    # Calculate line range (1-indexed)
    start_line = target_node.lineno - 1       # 0-indexed
    end_line   = target_node.end_lineno        # exclusive (end_lineno is inclusive 1-indexed)

    # Get original indentation from the function's first line
    original_indent = len(lines[start_line]) - len(lines[start_line].lstrip())
    indent_str = " " * original_indent

    # Re-indent new function code to match
    new_func_lines = textwrap.dedent(new_func_code).splitlines(keepends=True)
    new_func_indented = [indent_str + l if l.strip() else l for l in new_func_lines]
    if not new_func_indented[-1].endswith("\n"):
        new_func_indented[-1] += "\n"

    # Splice
    new_lines = lines[:start_line] + new_func_indented + lines[end_line:]
    return "".join(new_lines)


# =============================================================================
# SAFETY GATE
# =============================================================================

def check_syntax(code_string: str) -> bool:
    """Runs compile() — catches context-aware errors like 'return outside function'."""
    try:
        compile(code_string, "<ouroboros_check>", "exec")
        return True
    except SyntaxError as e:
        log("ERROR", f"Syntax Gate FAILED: {e}")
        return False


def check_runtime_safety(script_path: Path) -> bool:
    """
    Testet das Script auf Laufzeit-Abstürze (Dead Man's Switch).
    Startet das Script für 5 Sekunden. Wenn es in dieser Zeit mit einem Fehler abstürzt,
    wird False zurückgegeben. Überlebt es (Timeout) oder schließt erfolgreich (0), True.
    """
    try:
        log("INFO", f"Running Runtime Safety Gate for 5s: {script_path.name}...")
        process = subprocess.run(
            [sys.executable, str(script_path)],
            timeout=5,
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='replace',
            creationflags=CREATE_NO_WINDOW
        )
        if process.returncode != 0:
            log("ERROR", f"Runtime Crash detected (Code {process.returncode}):\n{process.stderr[-500:]}")
            return False

        log("OK", "Script completed execution successfully within 5s.")
        return True

    except subprocess.TimeoutExpired:
        log("OK", "Script survived 5s Execution Gate without crashing.")
        return True
    except Exception as e:
        log("ERROR", f"Failed to execute Runtime Gate: {e}")
        return False


# =============================================================================
# OUROBOROS PROMPT (Chirurgisch)
# =============================================================================

OUROBOROS_MICRO_PROMPT = """You are the MBRN Ouroboros Reasoning Agent — a senior system architect.
Your role is SURGICAL code improvement. You do NOT rewrite entire files. You improve ONE function.

TOOLKIT CATALOG (Available Modules):
{catalog}

TARGET SCRIPT: {script_name}
AVAILABLE FUNCTIONS IN THIS FILE:
{function_list}

TASK:
1. Choose ONE function from the list above that you can improve using a module from the catalog.
2. Write ONLY the replacement code for that single function. It must be complete and standalone.
3. Do not touch main(), __main__, or any initialization code.
4. Use only Python stdlib in your replacement — no external packages.

Return ONLY this JSON object (no markdown, no explanation):
{{
  "target_function": "the_exact_function_name_from_the_list",
  "mutation_reason": "One sentence: what module you used and why it improves this function (max 150 chars)",
  "new_code": "def the_exact_function_name(...):\\n    ..."
}}"""

OUROBOROS_SCHEMA_HINT = """{
  "target_function": "perform_heartbeat",
  "mutation_reason": "Added circuit breaker from toolkit for resilient heartbeat retries.",
  "new_code": "def perform_heartbeat():\\n    pass"
}"""


# =============================================================================
# CORE MUTATION LOGIC
# =============================================================================

def run_ouroboros_mutation() -> None:
    log("INFO", "=== OUROBOROS v2 PROTOCOL INITIATED ===")

    # Safety Gate: Check factory control for mutation_enabled
    control_path = _PROJECT_ROOT / "shared" / "data" / "mbrn_factory_control.json"
    if control_path.exists():
        try:
            control = json.loads(control_path.read_text(encoding="utf-8"))
            if not control.get("mutation_enabled", False):
                log("WARN", "Mutation DISABLED via factory control. Observation mode only.")
                return
        except Exception as e:
            log("ERROR", f"Failed to read factory control: {e}")

    if not CATALOG_PATH.exists():
        log("WARN", "Toolkit Catalog not found. Run mbrn_toolkit_compiler.py first.")
        return

    catalog_content = CATALOG_PATH.read_text(encoding="utf-8")
    if len(catalog_content) < 200:
        log("WARN", "Toolkit Catalog is empty or too small.")
        return

    # Rotate target scripts by hour
    hour = datetime.now(timezone.utc).hour
    target_path = TARGET_SCRIPTS[hour % len(TARGET_SCRIPTS)]

    if not target_path.exists():
        log("WARN", f"Target script not found: {target_path}")
        return

    log("INFO", f"Target Script: {target_path.name}")
    source_code = target_path.read_text(encoding="utf-8")

    # Scan available functions
    functions = get_all_functions(source_code)
    if not functions:
        log("WARN", "No functions found in target. Skipping.")
        return

    # Filter out dangerous functions that should never be touched
    PROTECTED = {"main", "load_env", "load_env_file", "__init__"}
    safe_functions = [f for f in functions if f not in PROTECTED]
    log("INFO", f"Found {len(safe_functions)} safe functions: {safe_functions[:10]}")

    bridge = LocalLLMBridge(LocalLLMBridgeConfig(
        model=OUROBOROS_MODEL,
        timeout_seconds=OUROBOROS_TIMEOUT
    ))

    if not bridge.is_available():
        log("WARN", "Ollama not available. Mutation aborted.")
        return

    prompt = OUROBOROS_MICRO_PROMPT.format(
        catalog=catalog_content[:3000],  # Truncate catalog to save tokens
        script_name=target_path.name,
        function_list="\n".join(f"  - {f}" for f in safe_functions)
    )

    log("INFO", f"Querying {OUROBOROS_MODEL} for micro-mutation...")
    success, result = bridge.execute_custom_prompt(
        prompt=prompt,
        required_keys=["target_function", "mutation_reason", "new_code"],
        schema_hint=OUROBOROS_SCHEMA_HINT,
        worker_name="ouroboros_v2_agent"
    )

    if not success or not isinstance(result, dict):
        log("WARN", f"LLM query failed: {result}")
        return

    target_func  = result.get("target_function", "").strip()
    mutation_why = result.get("mutation_reason", "No reason")
    new_code     = result.get("new_code", "").strip()

    if not target_func or not new_code:
        log("WARN", "LLM returned empty target_function or new_code. Aborting.")
        return

    if target_func not in safe_functions:
        log("WARN", f"LLM tried to mutate protected/unknown function '{target_func}'. Rejected.")
        return

    log("OK", f"Mutation designed for '{target_func}': {mutation_why}")

    # --- AST Replace (Chirurgisch) ---
    log("INFO", "Running AST-surgical replacement...")
    mutated_source = ast_replace_function(source_code, target_func, new_code)

    if mutated_source is None:
        log("ERROR", "AST replacement failed. Aborting.")
        return

    # --- Safety Gate ---
    log("INFO", "Running Syntax Safety Gate (compile)...")
    if not check_syntax(mutated_source):
        log("ERROR", "Mutation rejected: compile() gate failed. Original file untouched.")
        return

    log("OK", "Syntax Gate PASSED.")

    # --- Backup ---
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    backup_path = target_path.with_suffix(f".py.bak_{timestamp}")
    shutil.copy2(target_path, backup_path)
    log("INFO", f"Backup created: {backup_path.name}")

    # --- Write & Runtime Gate (Dead Man's Switch) ---
    target_path.write_text(mutated_source, encoding="utf-8")

    log("INFO", "Running Runtime Gate (Dead Man's Switch)...")
    if not check_runtime_safety(target_path):
        log("ERROR", "Runtime Gate FAILED! Lethal Failure. Rolling back to backup...")
        shutil.copy2(backup_path, target_path)
        log("OK", f"Rollback complete. Original {target_path.name} restored.")
        return

    log("OK", f"OUROBOROS SUCCESS: '{target_func}' in {target_path.name} has been surgically improved!")


# =============================================================================
# LOOP / ENTRY POINT
# =============================================================================

def run_infinite_loop() -> None:
    log("INFO", f"=== OUROBOROS v2 DAEMON STARTED (model: {OUROBOROS_MODEL}) ===")
    while True:
        try:
            run_ouroboros_mutation()
        except Exception as e:
            log("ERROR", f"Unhandled error in loop: {e}")
        log("INFO", "Cooldown: 60 minutes...")
        time.sleep(3600)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="MBRN Ouroboros Agent v2")
    parser.add_argument("--infinite", action="store_true", help="Run as daemon (1h cooldown)")
    args = parser.parse_args()

    if args.infinite:
        run_infinite_loop()
    else:
        run_ouroboros_mutation()
