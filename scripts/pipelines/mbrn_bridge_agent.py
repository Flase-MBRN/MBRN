#!/usr/bin/env python3
"""Deploy factory-ready Python modules as standalone Vanilla HTML tools."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import urllib.request
from pathlib import Path
from typing import Any, Optional


PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))
PIPELINES_DIR = Path(__file__).resolve().parent


def load_pipeline_env(env_path: Path) -> None:
    """Load scripts/pipelines/.env before reading os.environ.

    Uses python-dotenv when it exists, otherwise falls back to a stdlib parser
    to keep the v5 no-new-dependency rule intact.
    """
    if not env_path.exists():
        return
    try:
        from dotenv import load_dotenv  # type: ignore
        load_dotenv(dotenv_path=env_path, override=False)
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


DIMENSIONS_DIR = PROJECT_ROOT / "dimensions"
OLLAMA_URL = os.getenv("OLLAMA_GENERATE_URL", "http://127.0.0.1:11434/api/generate")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "gemma3:12b")
OLLAMA_TIMEOUT_SECONDS = int(os.environ.get("OLLAMA_TIMEOUT_SECONDS", "300"))
MIN_HTML_CHARS = 500

MBRN_HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}} | MBRN Hub</title>
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
</html>"""

BRIDGE_SYSTEM_PROMPT = """DU BIST EIN SENIOR FRONTEND ENGINEER. DEINE AUFGABE IST ES, DIE MATHEMATISCHE LOGIK EINES PYTHON-TOOLS 1:1 NACH JAVASCRIPT ZU PORTIEREN.

SCHRITT-FÜR-SCHRITT-ANWEISUNG:
1. ANALYSE: Lies den Python-Code. Identifiziere alle mathematischen Formeln, Daten-Transformationen und Filter-Logiken.
2. PSEUDOCODE: Erstelle intern einen Plan, wie diese Logik in JS abgebildet wird.
3. IMPLEMENTIERUNG: Generiere das interaktive HTML/JS-Tool.

STRENGE REGELN:
- NUTZE KEINE PLATZHALTER wie 'key1', 'key2' oder 'data.field'. Du MUSST die echten Variablennamen und Datenstrukturen aus dem Python-Code verwenden.
- INTERAKTIVITÄT IST PFLICHT! Das Tool muss Eingaben verarbeiten und die berechneten Ergebnisse im 'result-area' anzeigen.
- GIB KEIN <html>, <head>, <body> ODER <style> AUS. Das Design ist bereits vorgegeben.
- GIB NUR DAS INNERE HTML (Labels, Inputs, Buttons) UND DIE <script>-LOGIK AUS.
- KEINE METADATEN RENDERN (ROI, ID, etc.).
- NUR CODE AUSGEBEN. KEIN MARKDOWN.
"""


def slugify(value: str) -> str:
    slug = re.sub(r"[^A-Za-z0-9_-]+", "_", value.strip()).strip("_").lower()
    return slug[:80] or "factory_module"


def extract_logic_description(py_file: Path) -> str:
    path = py_file if py_file.is_absolute() else PROJECT_ROOT / py_file
    if not path.exists():
        return "Logic file missing."
    
    content = path.read_text(encoding="utf-8", errors="ignore")
    lines = content.splitlines()
    
    # Filter out MBRN Metadata Headers (Alpha ID, ROI Score, etc.)
    filtered_lines = []
    metadata_patterns = [
        r"Alpha ID:", r"ROI Score:", r"Source Alpha:", r"Factory ID:", 
        r"Created At:", r"Author:", r"Synergy Score:", r"Bridge Status:"
    ]
    
    for line in lines:
        if any(re.search(p, line, re.IGNORECASE) for p in metadata_patterns):
            continue
        filtered_lines.append(line)
        
    return "\n".join(filtered_lines)


def metadata_scrubber(content: str) -> str:
    """Removes forbidden metadata keywords from the generated output."""
    forbidden = [
        "ROI Score", "Alpha ID", "Source Alpha", "Factory ID", "Quality Score", 
        "Agent Name", "Created At", "Synergy Score", "Bridge Status"
    ]
    cleaned = content
    for word in forbidden:
        # Case insensitive replace
        pattern = re.compile(re.escape(word), re.IGNORECASE)
        cleaned = pattern.sub("[PROTECTED]", cleaned)
    return cleaned


def strip_markdown_fences(html: str) -> str:
    """Remove markdown code fences so deployed files start with real HTML."""
    cleaned = html.strip()
    fence_match = re.fullmatch(r"```(?:html|HTML)?\s*(.*?)\s*```", cleaned, flags=re.DOTALL)
    if fence_match:
        cleaned = fence_match.group(1).strip()
    else:
        cleaned = re.sub(r"^```(?:html|HTML)?\s*", "", cleaned).strip()
        cleaned = re.sub(r"\s*```$", "", cleaned).strip()
    html_start = cleaned.find("<")
    if html_start > 0:
        cleaned = cleaned[html_start:].strip()
    return cleaned


def validate_js_logic(content: str) -> bool:
    """Checks if the LLM used forbidden placeholders like key1 or key2."""
    placeholders = [r"data\.key1", r"data\.key2", r"placeholder_key", r"key1", r"key2"]
    for p in placeholders:
        if re.search(p, content):
            return False
    return True


def generate_frontend_via_ollama(logic_desc: str, dimension: str, name: str, retry: bool = False) -> str:
    retry_prefix = "DEIN LETZTER VERSUCH WAR FEHLERHAFT (PLATZHALTER GENUTZT). NUTZE DIESES MAL DIE ECHTE LOGIK!\n" if retry else ""
    
    prompt = f"""{retry_prefix}HIER IST DIE QUELLE DER WAHRHEIT (PYTHON CODE):
{logic_desc}

PORTIERE ALLE FUNKTIONEN, DIE DATEN VERARBEITEN, 1:1 NACH JAVASCRIPT.
Nutze <div id="result-area"> für Ergebnisse.
GIB NUR HTML UND JAVASCRIPT AUS. KEIN CSS. KEIN HEADER."""
    
    payload = json.dumps({
        "model": OLLAMA_MODEL,
        "prompt": f"[SYSTEM]{BRIDGE_SYSTEM_PROMPT}[/SYSTEM]\n{prompt}",
        "stream": False,
        "options": {"temperature": 0.1 if retry else 0.2},
    }).encode("utf-8")
    
    req = urllib.request.Request(OLLAMA_URL, data=payload, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=OLLAMA_TIMEOUT_SECONDS) as response:
        result = json.loads(response.read().decode("utf-8"))
    
    inner_content = str(result.get("response", "")).strip()
    inner_content = strip_markdown_fences(inner_content)
    
    # Validation Gate
    if not validate_js_logic(inner_content) and not retry:
        print(f"[Bridge] Validation failed for {name} (placeholders found). Retrying...")
        return generate_frontend_via_ollama(logic_desc, dimension, name, retry=True)
        
    inner_content = metadata_scrubber(inner_content)
    
    safe_name = name.replace("_", " ").title()
    final_html = MBRN_HTML_TEMPLATE.replace("{{TITLE}}", safe_name).replace("{{CONTENT}}", inner_content)
    return final_html


def generate_dummy_frontend(dimension: str, name: str, logic_desc: str) -> str:
    safe_name = name.replace("_", " ").title()
    return f"""<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{safe_name} | MBRN {dimension}</title>
  <style>
    body {{ background-color: #05050A; color: #E0E0E0; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }}
    .tool-card {{ background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 32px; max-width: 500px; width: 100%; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }}
    h1 {{ font-size: 20px; margin-bottom: 24px; color: #7B5CF5; text-align: center; }}
    label {{ display: block; font-size: 12px; color: #999; margin-bottom: 8px; text-transform: uppercase; }}
    textarea {{ background: #1A1A24; color: white; border: 1px solid #333; padding: 12px; border-radius: 8px; width: 100%; box-sizing: border-box; margin-bottom: 16px; min-height: 100px; }}
    button {{ background-color: #7B5CF5; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: bold; width: 100%; transition: opacity 0.2s; }}
    button:hover {{ opacity: 0.9; }}
    output {{ display: block; margin-top: 24px; padding: 16px; background: rgba(0,0,0,0.3); border-radius: 8px; font-family: monospace; font-size: 13px; color: #AFA; }}
  </style>
</head>
<body>
  <div class="tool-card">
    <h1>{safe_name}</h1>
    <label for="input">Eingabe-Daten</label>
    <textarea id="input">Simulierter Input fuer {name}</textarea>
    <button id="run">Logik Ausfuehren</button>
    <output id="result">Bereit für Dimension {dimension}.</output>
  </div>
  <script>
    document.getElementById('run').addEventListener('click', () => {{
      const text = document.getElementById('input').value;
      document.getElementById('result').textContent = "AUTONOMER OUTPUT: " + btoa(text).substring(0, 16);
    }});
  </script>
</body>
</html>
"""


def validate_html(html: str) -> None:
    if not html.lstrip().lower().startswith(("<!doctype html", "<html")):
        raise ValueError("Generated HTML must start with <!DOCTYPE html> or <html")
    lowered = html.lower()
    if len(html) < MIN_HTML_CHARS or "<html" not in lowered or "</html>" not in lowered:
        raise ValueError(f"Generated HTML is invalid or too short: {len(html)} chars")


def deploy_to_dimension(html: str, dimension: str, name: str) -> Path:
    if dimension not in CANONICAL_DIMENSIONS:
        dimension = "systeme"
    target_dir = DIMENSIONS_DIR / dimension / "apps" / slugify(name)
    target_dir.mkdir(parents=True, exist_ok=True)
    target_file = target_dir / "index.html"
    html = strip_markdown_fences(html)
    validate_html(html)
    target_file.write_text(html, encoding="utf-8")
    return target_file


def sync_to_supabase(name: str, dimension: str, frontend_path: str) -> bool:
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_url or not supabase_key:
        print("[Bridge] Supabase sync skipped: env vars missing")
        return False
    payload = json.dumps({
        "name": name,
        "dimension": dimension,
        "frontend_file": frontend_path,
        "status": "deployed",
    }).encode("utf-8")
    req = urllib.request.Request(
        f"{supabase_url.rstrip('/')}/rest/v1/factory_modules",
        data=payload,
        method="POST",
        headers={
            "apikey": supabase_key,
            "Authorization": f"Bearer {supabase_key}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        },
    )
    try:
        urllib.request.urlopen(req, timeout=10).read()
        print(f"[Bridge] Supabase sync OK: {name}")
        return True
    except Exception as exc:
        print(f"[Bridge] Supabase sync failed and was ignored: {exc}")
        return False


def next_ready_module():
    with get_db() as conn:
        return conn.execute(
            """
            SELECT * FROM factory_modules
            WHERE status = 'ready'
            ORDER BY quality_score DESC, created_at ASC
            LIMIT 1
            """
        ).fetchone()


def count_ready_modules() -> int:
    with get_db() as conn:
        row = conn.execute("SELECT COUNT(*) AS cnt FROM factory_modules WHERE status = 'ready'").fetchone()
        return int(row["cnt"] if row else 0)


def run_bridge_cycle(use_dummy: bool = False) -> Optional[dict[str, Any]]:
    init_db()
    module = next_ready_module()
    if not module:
        print("[Bridge] No ready modules.")
        return None

    name = str(module["name"])
    dimension = module["dimension"] if module["dimension"] in CANONICAL_DIMENSIONS else "systeme"
    source = Path(str(module["source_file"]))
    print(f"[Bridge] Processing {name} -> {dimension}")

    try:
        logic_desc = extract_logic_description(source)
        html = generate_dummy_frontend(dimension, name, logic_desc) if use_dummy else generate_frontend_via_ollama(logic_desc, dimension, name)
        html = strip_markdown_fences(html)
        validate_html(html)
        deployed_path = deploy_to_dimension(html, dimension, name)
        relative_deployed = str(deployed_path.relative_to(PROJECT_ROOT)).replace("\\", "/")
        atomic_update("factory_modules", {"status": "deployed", "frontend_file": relative_deployed}, "id", module["id"])
        insert_notification(
            "module_ready",
            f"Neues Modul deployed: {name} in Dimension {dimension}",
            dimension=dimension,
            module_name=name,
            raw_data={
                "module_file": name,
                "frontend_file": relative_deployed,
                "dimension": dimension,
                "type": "module_ready",
            },
        )
        export_factory_feed_snapshot()
        supabase_synced = sync_to_supabase(name, dimension, relative_deployed)
        print(f"[Bridge] Deployed: {relative_deployed}")
        return {
            "id": module["id"],
            "name": name,
            "dimension": dimension,
            "frontend_file": relative_deployed,
            "absolute_path": str(deployed_path),
            "supabase_synced": supabase_synced,
            "status": "deployed",
        }
    except Exception as exc:
        atomic_update("factory_modules", {"status": "failed"}, "id", module["id"])
        print(f"[Bridge] Failed {name}: {exc}")
        return {
            "id": module["id"],
            "name": name,
            "dimension": dimension,
            "frontend_file": None,
            "absolute_path": None,
            "supabase_synced": False,
            "status": "failed",
            "error": str(exc),
        }


def run_bridge_batch(count: int, use_dummy: bool = False) -> list[dict[str, Any]]:
    results: list[dict[str, Any]] = []
    for cycle in range(1, count + 1):
        print(f"[Bridge] Batch cycle {cycle}/{count}", flush=True)
        result = run_bridge_cycle(use_dummy=use_dummy)
        if result is None:
            break
        results.append(result)
    return results


def run_bridge_until_empty(use_dummy: bool = False) -> list[dict[str, Any]]:
    init_db()
    total = count_ready_modules()
    results: list[dict[str, Any]] = []
    print(f"[Bridge] Backlog-Drain gestartet: {total} ready Module", flush=True)
    while count_ready_modules() > 0:
        result = run_bridge_cycle(use_dummy=use_dummy)
        if result is None:
            break
        results.append(result)
        current = len(results)
        name = result.get("name", "unknown")
        if result.get("status") == "deployed":
            print(f"[Bridge] {current}/{total} generiert: {name}", flush=True)
        else:
            print(f"[Bridge] {current}/{total} fehlgeschlagen: {name}", flush=True)
    print("[Bridge] Backlog-Drain abgeschlossen: 0 ready Module", flush=True)
    return results


def main() -> int:
    parser = argparse.ArgumentParser(description="Bridge factory modules into Vanilla HTML apps.")
    parser.add_argument("--once", action="store_true", help="Run one bridge cycle and exit.")
    parser.add_argument("--dummy", action="store_true", help="Use deterministic dummy HTML instead of Ollama.")
    parser.add_argument("--batch-count", type=int, default=0, help="Run exactly this many bridge cycles and exit.")
    parser.add_argument("--all-ready", action="store_true", help="Drain the current ready backlog and exit.")
    parser.add_argument("--interval-seconds", type=int, default=30)
    args = parser.parse_args()

    if args.once:
        return 0 if run_bridge_cycle(use_dummy=args.dummy) else 1
    if args.batch_count:
        results = run_bridge_batch(args.batch_count, use_dummy=args.dummy)
        return 0 if len(results) == args.batch_count and all(result.get("status") == "deployed" for result in results) else 1
    if args.all_ready:
        run_bridge_until_empty(use_dummy=args.dummy)
        return 0

    while True:
        run_bridge_cycle(use_dummy=args.dummy)
        time.sleep(max(5, args.interval_seconds))


if __name__ == "__main__":
    raise SystemExit(main())
