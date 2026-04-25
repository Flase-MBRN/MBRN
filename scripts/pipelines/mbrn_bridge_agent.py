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
from typing import Optional


PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

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
MIN_HTML_CHARS = 500

BRIDGE_SYSTEM_PROMPT = """You are an expert in Vanilla JS and HTML.
Convert Python logic into one complete, responsive, standalone index.html.
Rules:
- No framework, no npm, no backend.
- Use only HTML, inline CSS, and Vanilla JS.
- All calculations happen in the browser.
- Return only HTML. No markdown and no explanation.
"""


def slugify(value: str) -> str:
    slug = re.sub(r"[^A-Za-z0-9_-]+", "_", value.strip()).strip("_").lower()
    return slug[:80] or "factory_module"


def extract_logic_description(py_file: Path) -> str:
    path = py_file if py_file.is_absolute() else PROJECT_ROOT / py_file
    content = path.read_text(encoding="utf-8", errors="ignore")
    return "\n".join(content.splitlines()[:140])


def generate_frontend_via_ollama(logic_desc: str, dimension: str, name: str) -> str:
    prompt = f"""DIMENSION: {dimension}
MODULE: {name}
PYTHON LOGIC:
{logic_desc}

Create a complete index.html for this MBRN dimension. The user should get an immediate result without login."""
    payload = json.dumps({
        "model": OLLAMA_MODEL,
        "prompt": f"[SYSTEM]{BRIDGE_SYSTEM_PROMPT}[/SYSTEM]\n{prompt}",
        "stream": False,
        "options": {"temperature": 0.2},
    }).encode("utf-8")
    req = urllib.request.Request(OLLAMA_URL, data=payload, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=120) as response:
        result = json.loads(response.read().decode("utf-8"))
    return str(result.get("response", "")).strip()


def generate_dummy_frontend(dimension: str, name: str, logic_desc: str) -> str:
    safe_name = name.replace("_", " ").title()
    return f"""<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{safe_name} | MBRN {dimension}</title>
  <style>
    body {{ margin: 0; font-family: system-ui, sans-serif; background: #05050a; color: #f8fafc; }}
    main {{ max-width: 760px; margin: 0 auto; padding: 40px 20px; }}
    label, textarea, button {{ display: block; width: 100%; box-sizing: border-box; }}
    textarea {{ min-height: 180px; margin: 12px 0; padding: 12px; border: 1px solid #334155; background: #0f172a; color: #f8fafc; }}
    button {{ padding: 12px 14px; border: 0; background: #7b5cf5; color: white; font-weight: 700; cursor: pointer; }}
    output {{ display: block; margin-top: 16px; padding: 16px; border: 1px solid #334155; background: #111827; white-space: pre-wrap; }}
  </style>
</head>
<body>
  <main>
    <h1>{safe_name}</h1>
    <p>Dimension: {dimension}. Dieses lokale MBRN-Tool kapselt die importierte Factory-Logik als Browser-Oberflaeche.</p>
    <label for="input">Eingabe</label>
    <textarea id="input">{logic_desc[:220].replace("<", "&lt;")}</textarea>
    <button id="run">Berechnen</button>
    <output id="result">Bereit.</output>
  </main>
  <script>
    const input = document.getElementById('input');
    const result = document.getElementById('result');
    document.getElementById('run').addEventListener('click', () => {{
      const text = input.value.trim();
      const words = text ? text.split(/\\s+/).length : 0;
      result.textContent = JSON.stringify({{
        module: {json.dumps(name)},
        dimension: {json.dumps(dimension)},
        characters: text.length,
        words,
        signal: words > 20 ? 'rich_context' : 'compact_context'
      }}, null, 2);
    }});
  </script>
</body>
</html>
"""


def validate_html(html: str) -> None:
    lowered = html.lower()
    if len(html) < MIN_HTML_CHARS or "<html" not in lowered or "</html>" not in lowered:
        raise ValueError(f"Generated HTML is invalid or too short: {len(html)} chars")


def deploy_to_dimension(html: str, dimension: str, name: str) -> Path:
    if dimension not in CANONICAL_DIMENSIONS:
        dimension = "systeme"
    target_dir = DIMENSIONS_DIR / dimension / "apps" / slugify(name)
    target_dir.mkdir(parents=True, exist_ok=True)
    target_file = target_dir / "index.html"
    target_file.write_text(html, encoding="utf-8")
    return target_file


def sync_to_supabase(name: str, dimension: str, frontend_path: str) -> None:
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_url or not supabase_key:
        print("[Bridge] Supabase sync skipped: env vars missing")
        return
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
    except Exception as exc:
        print(f"[Bridge] Supabase sync failed and was ignored: {exc}")


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


def run_bridge_cycle(use_dummy: bool = False) -> bool:
    init_db()
    module = next_ready_module()
    if not module:
        print("[Bridge] No ready modules.")
        return False

    name = str(module["name"])
    dimension = module["dimension"] if module["dimension"] in CANONICAL_DIMENSIONS else "systeme"
    source = Path(str(module["source_file"]))
    print(f"[Bridge] Processing {name} -> {dimension}")

    try:
        logic_desc = extract_logic_description(source)
        html = generate_dummy_frontend(dimension, name, logic_desc) if use_dummy else generate_frontend_via_ollama(logic_desc, dimension, name)
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
        sync_to_supabase(name, dimension, relative_deployed)
        print(f"[Bridge] Deployed: {relative_deployed}")
        return True
    except Exception as exc:
        atomic_update("factory_modules", {"status": "failed"}, "id", module["id"])
        print(f"[Bridge] Failed {name}: {exc}")
        return False


def main() -> int:
    parser = argparse.ArgumentParser(description="Bridge factory modules into Vanilla HTML apps.")
    parser.add_argument("--once", action="store_true", help="Run one bridge cycle and exit.")
    parser.add_argument("--dummy", action="store_true", help="Use deterministic dummy HTML instead of Ollama.")
    parser.add_argument("--interval-seconds", type=int, default=30)
    args = parser.parse_args()

    if args.once:
        return 0 if run_bridge_cycle(use_dummy=args.dummy) else 1

    while True:
        run_bridge_cycle(use_dummy=args.dummy)
        time.sleep(max(5, args.interval_seconds))


if __name__ == "__main__":
    raise SystemExit(main())

