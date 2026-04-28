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


def _safe_json_load(value: Any) -> Any:
    if value is None:
        return None
    if isinstance(value, (dict, list)):
        return value
    try:
        return json.loads(value)
    except Exception:
        return None


def detect_source_type(module: dict[str, Any]) -> str:
    name = str(module.get("name") or "")
    source_file = str(module.get("source_file") or "")
    raw_data = _safe_json_load(module.get("raw_data"))

    if name.startswith("HN:") or source_file.startswith("https://news.ycombinator.com/"):
        return "hackernews"
    if name.startswith("GH:") or source_file.startswith("https://github.com/"):
        return "github"
    if isinstance(raw_data, dict):
        analysis = raw_data.get("analysis") if isinstance(raw_data.get("analysis"), dict) else raw_data
        if isinstance(analysis, dict) and str(analysis.get("source") or "").lower() == "hackernews":
            return "hackernews"
        if isinstance(analysis, dict) and str(analysis.get("source") or "").lower() == "github":
            return "github"
    return "unknown"


def build_hackernews_markdown(module: dict[str, Any]) -> str:
    title = str(module.get("name") or "HackerNews Alpha").strip()
    url = str(module.get("source_file") or "").strip()
    raw_data = _safe_json_load(module.get("raw_data"))
    score = module.get("quality_score")

    if isinstance(raw_data, dict):
        analysis = raw_data.get("analysis") if isinstance(raw_data.get("analysis"), dict) else raw_data
        if isinstance(analysis, dict):
            title = str(analysis.get("title") or title).strip()
            url = str(analysis.get("url") or url).strip()
            score = analysis.get("roi_score", score)

    score_str = "" if score is None else f"\n\nScore: {score}"
    url_line = url if url else "(missing url)"
    return f"# {title}\n\nLink: {url_line}{score_str}\n"


def deploy_hackernews_bundle(module: dict[str, Any]) -> str:
    dim = str(module.get("dimension") or "systeme").lower()
    slug = re.sub(r"[^a-z0-9]", "_", str(module.get("name") or "hn").lower())
    base_dir = DIMENSIONS_DIR / dim / "deployed" / f"{slug}_module_{module['id']}"
    base_dir.mkdir(parents=True, exist_ok=True)

    raw_data = _safe_json_load(module.get("raw_data"))
    info = {
        "id": module.get("id"),
        "name": module.get("name"),
        "dimension": module.get("dimension"),
        "source_file": module.get("source_file"),
        "quality_score": module.get("quality_score"),
        "status": "deployed",
        "source_type": "hackernews",
        "raw_data": raw_data,
    }
    (base_dir / "info.json").write_text(json.dumps(info, ensure_ascii=False, indent=2), encoding="utf-8")
    (base_dir / "summary.md").write_text(build_hackernews_markdown(module), encoding="utf-8")

    summary_path = base_dir / "summary.md"
    return str(summary_path.relative_to(PROJECT_ROOT)).replace("\\", "/")

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

def run_watchman_cycle():
    """Process ONE module per cycle with atomic status transition."""
    with get_db() as conn:
        # Atomar: ready → pending_generation (reserviert das Modul)
        # SQLite 3.35.0+ unterstützt RETURNING
        try:
            row = conn.execute(
                """UPDATE factory_modules 
                   SET status = 'pending_generation', updated_at = datetime('now')
                   WHERE id = (
                       SELECT id FROM factory_modules 
                       WHERE status = 'ready' 
                       ORDER BY created_at ASC LIMIT 1
                   )
                   RETURNING *"""
            ).fetchone()
            conn.commit()
        except Exception:
            # Fallback für ältere SQLite ohne RETURNING
            conn.execute("BEGIN IMMEDIATE")
            row = conn.execute(
                "SELECT * FROM factory_modules WHERE status = 'ready' ORDER BY created_at ASC LIMIT 1"
            ).fetchone()
            if row:
                conn.execute(
                    "UPDATE factory_modules SET status = 'pending_generation', updated_at = datetime('now') WHERE id = ?",
                    (row['id'],)
                )
            conn.commit()
    
    if not row:
        return False  # Keine Arbeit
    
    module = dict(row)
    log("INFO", f"[WATCHMAN] Processing module {module['id']}: {module['name']}")
    
    try:
        source_type = detect_source_type(module)
        if source_type == "hackernews":
            relative_path = deploy_hackernews_bundle(module)
            with get_db() as conn:
                conn.execute(
                    """UPDATE factory_modules 
                       SET status = 'deployed', 
                           frontend_file = ?,
                           updated_at = datetime('now')
                       WHERE id = ?""",
                    (relative_path, module["id"]),
                )
                conn.commit()
            log("OK", f"[WATCHMAN] Deployed HN markdown {relative_path} → triggers Auditor")
            insert_notification("Bridge", f"HN Alpha deployed: {module['name']}", "info")
            export_factory_feed_snapshot()
            return True

        if source_type != "github":
            log("WARN", f"[WATCHMAN] Unknown source type for module {module['id']}: {module.get('source_file')}. Skipping.")
            with get_db() as conn:
                conn.execute(
                    "UPDATE factory_modules SET status = 'skipped', updated_at = datetime('now') WHERE id = ?",
                    (module["id"],),
                )
                conn.commit()
            return True

        # Extract logic from filesystem
        logic_desc = extract_logic_description(module['source_file'])
        if not logic_desc:
            log("ERROR", f"No logic found for {module['name']}, reverting to ready.")
            with get_db() as conn:
                conn.execute(
                    "UPDATE factory_modules SET status = 'ready', updated_at = datetime('now') WHERE id = ?",
                    (module['id'],)
                )
                conn.commit()
            return False

        # Calculate Auditor Score
        score = calculate_score(logic_desc)
        is_elite = 1 if score >= ELITE_THRESHOLD else 0
        
        if score < 0.2:
            purge_module(module['id'], module.get('frontend_file'))
            return True  # Modul gelöscht, gilt als verarbeitet

        html = generate_standalone_html(module, logic_desc)
        if not html:
            log("ERROR", f"HTML generation failed for {module['name']}, reverting to ready.")
            with get_db() as conn:
                conn.execute(
                    "UPDATE factory_modules SET status = 'ready', updated_at = datetime('now') WHERE id = ?",
                    (module['id'],)
                )
                conn.commit()
            return False
        
        # Deploy & Status: pending_generation → deployed
        relative_path = deploy_to_dimension(module, html)
        
        with get_db() as conn:
            conn.execute(
                """UPDATE factory_modules 
                   SET status = 'deployed', 
                       frontend_file = ?, 
                       is_elite = ?, 
                       score = ?,
                       updated_at = datetime('now')
                   WHERE id = ?""",
                (relative_path, is_elite, score, module['id'])
            )
            conn.commit()
        
        log("OK", f"[WATCHMAN] Deployed {relative_path} (Score: {score}) → triggers Auditor")
        insert_notification("Bridge", f"Module {module['name']} deployed to {module['dimension']}", "info")
        export_factory_feed_snapshot()
        return True
        
    except Exception as e:
        log("ERROR", f"[WATCHMAN] Failed module {module['id']}: {e}, reverting to ready.")
        # Fehler: Zurück zu ready für Retry
        try:
            with get_db() as conn:
                conn.execute(
                    "UPDATE factory_modules SET status = 'ready', updated_at = datetime('now') WHERE id = ?",
                    (module['id'],)
                )
                conn.commit()
        except Exception as revert_err:
            log("ERROR", f"[WATCHMAN] Failed to revert status: {revert_err}")
        return False


def run_bridge_cycle():
    """Legacy batch mode - process all ready modules."""
    log("INFO", "[LEGACY] Checking for pending modules...")
    processed = 0
    while True:
        result = run_watchman_cycle()
        if not result:
            break
        processed += 1
    log("INFO", f"[LEGACY] Processed {processed} modules.")


def watchman_loop():
    """Continuous watchman mode - poll every 2 seconds."""
    log("INFO", "╔══════════════════════════════════════════════════╗")
    log("INFO", "║  BRIDGE AGENT v2.0 - WATCHMAN MODE               ║")
    log("INFO", "║  Flow: ready → pending_generation → deployed     ║")
    log("INFO", "╚══════════════════════════════════════════════════╝")
    
    while True:
        try:
            processed = run_watchman_cycle()
            if not processed:
                # Nichts zu tun - kurz warten
                time.sleep(2)
            # Wenn processed=True, sofort nächsten Check (Backlog abbauen)
            
        except Exception as e:
            log("ERROR", f"[WATCHMAN ERROR] {e}")
            time.sleep(5)  # Länger warten bei Fehler
            continue

def run_bridge_batch(limit: int):
    log("INFO", f"[LEGACY] Running batch bridge cycle (Limit: {limit})...")
    for _ in range(limit):
        run_watchman_cycle()

def run_bridge_until_empty():
    log("INFO", "[LEGACY] Running bridge until queue is empty...")
    while True:
        with get_db() as conn:
            row = conn.execute("SELECT COUNT(*) as cnt FROM factory_modules WHERE status = 'ready'").fetchone()
            if row["cnt"] == 0: break
        run_watchman_cycle()

def main():
    show_v5_banner()
    parser = argparse.ArgumentParser()
    parser.add_argument("--once", action="store_true", help="Single cycle (legacy mode)")
    parser.add_argument("--batch-count", type=int, help="Run a specific number of modules (legacy).")
    parser.add_argument("--all-ready", action="store_true", help="Process all ready modules (legacy).")
    args = parser.parse_args()
    
    init_db()
    
    if args.once:
        # Legacy: Einmaliger Durchlauf
        run_bridge_cycle()
    elif args.batch_count:
        run_bridge_batch(args.batch_count)
    elif args.all_ready:
        run_bridge_until_empty()
    else:
        # NEU: Standard ist Watchman Mode
        watchman_loop()

if __name__ == "__main__":
    main()
