#!/usr/bin/env python3
"""Deploy factory-ready Python modules as standalone Vanilla HTML tools."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import shutil
import urllib.request
from pathlib import Path
from typing import Any, Optional

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))
PIPELINES_DIR = Path(__file__).resolve().parent

# --- NEON ASTRA COLORS ---
ANSI = {
    "reset": "\033[0m", "bold": "\033[1m",
    "violet": "\033[38;2;123;92;245m", "success": "\033[38;2;79;255;176m",
    "warning": "\033[38;2;251;191;36m", "error": "\033[38;2;255;107;107m",
    "silver": "\033[38;2;180;184;198m", "gold": "\033[38;2;255;215;0m"
}

def log(level: str, message: object) -> None:
    ts = time.strftime("%H:%M:%S UTC", time.gmtime())
    color = ANSI["silver"]
    if level == "OK": color = ANSI["success"]
    elif level == "WARN": color = ANSI["warning"]
    elif level == "ERROR": color = ANSI["error"]
    elif level == "INFO": color = ANSI["violet"]
    
    msg = f"{ANSI['bold']}{color}[{ts}] [BRIDGE] [{level}] {message}{ANSI['reset']}"
    print(msg)

def show_v5_banner():
    print(f"{ANSI['violet']}")
    print("  ⚙️  MBRN BRIDGE AGENT v1.0")
    print("  >> PRODUCTION PIPELINE: HTML STANDALONE")
    print(f"  {ANSI['silver']}----------------------------------------{ANSI['reset']}")

def load_pipeline_env(env_path: Path) -> None:
    """Load scripts/pipelines/.env before reading os.environ."""
    if not env_path.exists():
        return
    try:
        from dotenv import load_dotenv  # type: ignore
        load_dotenv(env_path=env_path, override=False)
        return
    except Exception:
        pass
    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value

load_pipeline_env(PIPELINES_DIR / ".env")

from shared.core.db import (
    CANONICAL_DIMENSIONS,
    atomic_update,
    export_factory_feed_snapshot,
    get_db,
    init_db,
    insert_notification,
)

from scripts.pipelines.mbrn_logic_auditor import calculate_score

# Configuration
DIMENSIONS_DIR = PROJECT_ROOT / "dimensions"
OLLAMA_URL = os.getenv("OLLAMA_GENERATE_URL", "http://127.0.0.1:11434/api/generate")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "qwen2.5-coder:14b")
OLLAMA_TIMEOUT_SECONDS = int(os.environ.get("OLLAMA_TIMEOUT_SECONDS", "300"))
MIN_HTML_CHARS = 500
ELITE_THRESHOLD = 0.8

def strip_markdown_fences(text: str) -> str:
    """Helper for tests and production to clean LLM output."""
    if not text: return ""
    text = re.sub(r"^```[a-z]*\n", "", text, flags=re.MULTILINE | re.IGNORECASE)
    text = re.sub(r"\n```$", "", text, flags=re.MULTILINE)
    return text.strip()

MBRN_HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}} | MBRN Hub</title>
    <script>
        window.MBRN_CONFIG = {
            supabaseUrl: 'https://wqfijgzlxypqftwwoxxp.supabase.co',
            supabaseKey: 'sb_publishable_2K9K_RcFJyO5VS2XYlAWag_qFJuKseO'
        };
    </script>
    <style>
        body { background-color: #05050A; color: #E0E0E0; font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
        .tool-card { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 32px; max-width: 600px; width: 100%; box-shadow: 0 20px 50px rgba(0,0,0,0.5); backdrop-filter: blur(10px); }
        h1 { font-size: 22px; font-weight: 800; color: #7B5CF5; margin-bottom: 24px; text-align: center; letter-spacing: -0.02em; }
        label { display: block; font-size: 11px; font-weight: 700; color: #999; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.1em; }
        input, textarea, select { background: #1A1A24; color: white; border: 1px solid #333; padding: 12px; border-radius: 8px; width: 100%; box-sizing: border-box; margin-bottom: 16px; font-family: inherit; font-size: 14px; }
        input:focus, textarea:focus { border-color: #7B5CF5; outline: none; background: #1F1F2E; }
        button { background-color: #7B5CF5; color: white; border: none; padding: 14px 24px; border-radius: 8px; cursor: pointer; font-weight: bold; width: 100%; transition: all 0.2s; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; }
        button:hover { background-color: #8C72F7; transform: translateY(-1px); }
        #result-area { margin-top: 24px; padding: 20px; background: rgba(0,0,0,0.3); border-radius: 8px; border: 1px solid rgba(123, 92, 245, 0.2); font-family: monospace; font-size: 13px; color: #AFA; white-space: pre-wrap; word-break: break-all; }
        .meta-footer { margin-top: 32px; text-align: center; font-size: 10px; color: #444; letter-spacing: 0.1em; text-transform: uppercase; }
    </style>
</head>
<body>
    <div class="tool-card">
        <h1>{{TITLE}}</h1>
        {{CONTENT}}
        <div class="meta-footer">MBRN Factory Autonomous Module</div>
    </div>
</body>
</html>
"""

def extract_logic_description(source_file: str | Path) -> str:
    """Extracts the Python logic from the filesystem based on the source_file path."""
    path = PROJECT_ROOT / source_file
    if not path.exists():
        log("ERROR", f"Source file missing: {path}")
        return ""
    try:
        content = path.read_text(encoding="utf-8")
        # Strip metadata headers if present to focus on logic
        lines = [line for line in content.splitlines() if not re.match(r"^(Alpha ID|ROI Score|Source Alpha|Quality Score):", line, re.I)]
        return "\n".join(lines).strip()
    except Exception as e:
        log("ERROR", f"Failed to read source: {e}")
        return ""

def generate_standalone_html(module: Dict[str, Any], logic_desc: str) -> str:
    prompt = f"""Erstelle eine Vanilla-HTML/JS Web-App basierend auf diesem Modul.
    Name: {module['name']}
    Logik: {logic_desc}
    
    Regeln:
    1. Kein externes CSS/JS außer Google Fonts.
    2. Alles in einer Datei.
    3. Nutze ein modernes UI (Dark Mode).
    4. Das Ergebnis muss direkt im Browser funktionieren.
    5. GIB NUR DEN HTML/JS CODE ZURÜCK.
    """
    
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "keep_alive": 0  # CRITICAL: Force VRAM release immediately
    }
    
    try:
        req = urllib.request.Request(OLLAMA_URL, data=json.dumps(payload).encode("utf-8"), headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=300) as response:
            data = json.loads(response.read().decode("utf-8"))
            return data["response"].strip()
    except Exception as e:
        log("ERROR", f"Generation failed: {e}")
        return ""

def deploy_to_dimension(module: Dict[str, Any], html_content: str):
    dim = module['dimension'].lower()
    slug = re.sub(r"[^a-z0-9]", "_", module['name'].lower())
    folder_name = f"{slug}_module_{module['id']}"
    target_dir = DIMENSIONS_DIR / dim / "apps" / folder_name
    target_dir.mkdir(parents=True, exist_ok=True)
    
    index_file = target_dir / "index.html"
    
    # Injection for Elite Cloud Storage
    if module.get("is_elite"):
        injection = """
        <button id="mbrn-cloud-sync" style="margin-top: 10px; background: #00FFB0; color: #000;">SAFE TO MBRN CLOUD</button>
        <script src="../../../../shared/js/mbrn_storage.js"></script>
        <script>
            document.getElementById('mbrn-cloud-sync')?.addEventListener('click', async () => {
                const payload = { 
                    module_id: {{MODULE_ID}},
                    data: document.getElementById('result-area')?.innerText || 'No result'
                };
                if (window.MBRN_STORAGE) {
                    await window.MBRN_STORAGE.save(payload);
                    alert('Synchronized with MBRN Cloud');
                }
            });
        </script>
        """
        html_content = html_content.replace("</body>", f"{injection}</body>").replace("{{MODULE_ID}}", str(module['id']))

    index_file.write_text(html_content, encoding="utf-8")
    return str(index_file.relative_to(PROJECT_ROOT)).replace("\\", "/")

def purge_module(module_id: int, frontend_file: str):
    log("WARN", f"Purging low-score module {module_id}...")
    if frontend_file:
        path = PROJECT_ROOT / frontend_file
        if path.exists():
            shutil.rmtree(path.parent)
    
    with get_db() as conn:
        conn.execute("DELETE FROM factory_modules WHERE id = ?", (module_id,))
        conn.commit()

def run_bridge_cycle():
    log("INFO", "Checking for pending modules...")
    with get_db() as conn:
        pending = conn.execute("SELECT * FROM factory_modules WHERE status = 'ready'").fetchall()
    
    for row in pending:
        module = dict(row)
        log("INFO", f"Bridging module {module['id']}: {module['name']}...")
        
        # Extract logic from filesystem
        logic_desc = extract_logic_description(module['source_file'])
        if not logic_desc:
            log("ERROR", f"No logic found for {module['name']}, skipping.")
            continue

        # Calculate Auditor Score
        score = calculate_score(logic_desc)
        is_elite = 1 if score >= ELITE_THRESHOLD else 0
        
        if score < 0.2: # Lowering purge threshold for initial factory runs
            purge_module(module['id'], module.get('frontend_file'))
            continue

        html = generate_standalone_html(module, logic_desc)
        if html:
            relative_path = deploy_to_dimension(module, html)
            with get_db() as conn:
                conn.execute(
                    "UPDATE factory_modules SET status = 'deployed', frontend_file = ?, is_elite = ?, score = ? WHERE id = ?",
                    (relative_path, is_elite, score, module['id'])
                )
                conn.commit()
            log("OK", f"Deployed: {relative_path} (Score: {score})")
            insert_notification("Bridge", f"Module {module['name']} deployed to {module['dimension']}", "info")
            export_factory_feed_snapshot()

def run_bridge_batch(limit: int):
    log("INFO", f"Running batch bridge cycle (Limit: {limit})...")
    for _ in range(limit):
        run_bridge_cycle()

def run_bridge_until_empty():
    log("INFO", "Running bridge until queue is empty...")
    while True:
        with get_db() as conn:
            row = conn.execute("SELECT COUNT(*) as cnt FROM factory_modules WHERE status = 'ready'").fetchone()
            if row["cnt"] == 0: break
        run_bridge_cycle()

def main():
    show_v5_banner()
    parser = argparse.ArgumentParser()
    parser.add_argument("--autonomous", action="store_true")
    parser.add_argument("--target", type=int, default=10)
    parser.add_argument("--batch-count", type=int, help="Run a specific number of modules.")
    parser.add_argument("--all-ready", action="store_true", help="Process all ready modules.")
    args = parser.parse_args()
    
    init_db()
    
    if args.autonomous:
        log("INFO", f"Autonomous Production Mode (Target: {args.target} modules)")
        while True:
            run_bridge_cycle()
            time.sleep(30)
    elif args.batch_count:
        run_bridge_batch(args.batch_count)
    elif args.all_ready:
        run_bridge_until_empty()
    else:
        run_bridge_cycle()

if __name__ == "__main__":
    main()
