#!/usr/bin/env python3
"""Audit factory-ready modules and calculate a utility/quality score."""

from __future__ import annotations
import argparse
import json
import re
import sys
import time
import urllib.request
from pathlib import Path
from typing import Any, Dict, Tuple

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from shared.core.db import get_db, atomic_update, export_factory_feed_snapshot

# Phi4 Diamond Auditor Configuration
OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
AUDITOR_MODEL = "qwen2.5-coder:14b"

def _parse_mbrn_meta_header(file_content: str) -> Dict[str, Any]:
    """
    Parse MBRN_MODULE_META header from first 10 lines of file.
    Returns dict with metadata fields (source_type, quality_score, etc.)
    """
    meta = {}
    lines = file_content.splitlines()[:10]
    
    in_meta_block = False
    for line in lines:
        stripped = line.strip()
        
        # Start of meta block
        if '# MBRN_MODULE_META' in stripped:
            in_meta_block = True
            continue
            
        # End of meta block (closing quotes)
        if in_meta_block and ('"""' in stripped or "'''" in stripped):
            break
            
        # Parse meta fields
        if in_meta_block and stripped.startswith('#'):
            # Extract key: value pairs like "# source_type: hackernews"
            content = stripped[1:].strip()  # Remove #
            if ':' in content:
                key, value = content.split(':', 1)
                key = key.strip()
                value = value.strip()
                
                # Type conversion
                if key in ['quality_score', 'roi_score']:
                    try:
                        meta[key] = float(value)
                    except ValueError:
                        meta[key] = 0.0
                else:
                    meta[key] = value
    
    return meta


def calculate_html_score(html_content: str) -> float:
    """Legacy HTML/JS static score calculation."""
    score = 0.0
    
    # 1. JS Logic Depth (Lines in script tags)
    scripts = re.findall(r'<script>(.*?)</script>', html_content, re.DOTALL)
    js_lines = 0
    for script in scripts:
        js_lines += len([line for line in script.splitlines() if line.strip()])
    
    if js_lines > 50: score += 0.4
    elif js_lines > 20: score += 0.2
    elif js_lines > 5: score += 0.1
    
    # 2. Interactive Elements
    inputs = len(re.findall(r'<input|<textarea|<select', html_content))
    buttons = len(re.findall(r'<button', html_content))
    
    if inputs >= 3: score += 0.2
    elif inputs >= 1: score += 0.1
    
    if buttons >= 1: score += 0.1
    
    # 3. Logic Complexity (Regex, Math, Array methods)
    complexity_markers = [
        r'\.match\(', r'new RegExp', r'Math\.', r'\.filter\(', r'\.map\(', r'\.reduce\(', r'\.sort\('
    ]
    markers_found = 0
    for marker in complexity_markers:
        if re.search(marker, html_content):
            markers_found += 1
            
    if markers_found >= 3: score += 0.3
    elif markers_found >= 1: score += 0.15
    
    # 4. Penalty for placeholders
    if "key1" in html_content or "key2" in html_content:
        score -= 0.5
        
    return min(1.0, max(0.0, score))


def calculate_python_score(code: str) -> float:
    """Static score calculation for MBRN Python Utility Engines (v2.1)."""
    score = 0.0
    
    # 1. Structural Utility
    if "class " in code:
        score += 0.20
    
    def_count = len(re.findall(r'def\s+\w+\(', code))
    if def_count >= 5:
        score += 0.15
    elif def_count >= 3:
        score += 0.10
        
    if "def main()" in code:
        score += 0.05
    if '__name__ == "__main__"' in code or "__name__ == '__main__'" in code:
        score += 0.05
        
    # 2. Structured Output (v1.8 requirements)
    required_keys = ["score", "severity", "findings", "recommendations"]
    keys_found = sum(1 for k in required_keys if k in code.lower())
    if keys_found == 4:
        score += 0.20
    elif keys_found >= 2:
        score += 0.10
        
    # 3. Safety Check (No-Demo / Sandbox Safety)
    unsafe_patterns = [
        r'input\(', r'eval\(', r'exec\(', r'os\.system', r'subprocess',
        r'socket', r'requests', r'urllib', r'http\.client', 
        r'random\.randint', r'time\.sleep'
    ]
    is_safe = True
    for pattern in unsafe_patterns:
        if re.search(pattern, code):
            is_safe = False
            break
            
    if is_safe:
        score += 0.20
    else:
        score -= 0.30 # Penalty for unsafe/non-deterministic calls
        
    # 4. No-Demo Theater check
    demo_terms = ["sample data", "demo data", "demonstration", "simulate", "mock"]
    for term in demo_terms:
        if term in code.lower():
            score -= 0.10
            
    # 5. Logic Indicators (imports and re-usage)
    if "import json" in code or "import re" in code or "import math" in code:
        score += 0.15
        
    return min(1.0, max(0.0, score))


def _call_phi4_for_validation(content: str, logic_desc: str, mode: str = "frontend") -> Tuple[bool, Dict[str, Any]]:
    """Call Phi4 to validate logical consistency and MBRN architecture compliance."""
    
    if mode == "python":
        architecture_rule = "Architecture: Pure Python stdlib only, reusable utility engine, accepts caller-provided input, deterministic behavior."
        quality_rule = "Quality: Structured output (score, severity, findings, recommendations), no unsafe calls (eval, exec, input), no demo theater/mock logic."
    else:
        architecture_rule = "Architecture: Vanilla JS, no-build, UTC timestamps, DOM manipulation."
        quality_rule = "Quality: Clean structure, no hardcoded secrets, scalable frontend logic."

    prompt = f"""You are the MBRN Diamond Auditor (v2.1). Validate this {mode} module for architecture compliance and logical consistency.

MODULE CONTENT:
{content[:3000]}

MODULE LOGIC DESCRIPTION:
{logic_desc[:1500]}

Evaluate:
1. Logical consistency (no contradictions, sound reasoning)
2. {architecture_rule}
3. {quality_rule}
4. Scalability potential (reusability, maintainability)

Return ONLY valid JSON:
{{
  "valid": true|false,
  "quality_score": 0.0-1.0,
  "issues": ["list any issues found, max 3"],
  "rationale": "One sentence explaining the score"
}}"""
    
    payload = {
        "model": AUDITOR_MODEL,
        "prompt": prompt,
        "stream": False,
        "keep_alive": 0,  # CRITICAL: VRAM release immediately
        "options": {"temperature": 0.1, "num_predict": 512}
    }
    
    try:
        req = urllib.request.Request(
            OLLAMA_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=120) as resp:
            body = json.loads(resp.read().decode("utf-8"))
        
        response_text = body.get("response", "")
        # Extract JSON from response
        try:
            parsed = json.loads(response_text.strip())
            if isinstance(parsed, dict) and "quality_score" in parsed:
                return True, parsed
        except json.JSONDecodeError:
            pass
        
        # Fallback: try to extract JSON object from text
        start = response_text.find("{")
        end = response_text.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                parsed = json.loads(response_text[start:end+1])
                if isinstance(parsed, dict):
                    return True, parsed
            except json.JSONDecodeError:
                pass
        
        return False, {"error": "Could not parse Phi4 response"}
    except Exception as e:
        return False, {"error": str(e)}


def validate_with_phi4(content: str, logic_desc: str, mode: str = "frontend") -> float:
    """Get Phi4-validated quality score. Returns 0.0-1.0."""
    success, result = _call_phi4_for_validation(content, logic_desc, mode)
    if success and result.get("valid", False):
        return float(result.get("quality_score", 0.5))
    return 0.0  # Invalid modules get 0


def calculate_score(content: str) -> float:
    """Compatibility wrapper for legacy agents."""
    text = content or ""
    lowered = text.lower()

    looks_python = (
        "def " in lowered
        or "class " in lowered
        or "import " in lowered
        or "return " in lowered
        or "__main__" in lowered
    )

    if looks_python:
        return calculate_python_score(text)

    return calculate_html_score(text)


def run_watchman_cycle():
    """Audit ONE deployed module per cycle with atomic status transition."""
    with get_db() as conn:
        # Atomar: deployed → pending_audit (reserviert das Modul)
        try:
            row = conn.execute(
                """UPDATE factory_modules 
                   SET status = 'pending_audit', updated_at = datetime('now')
                   WHERE id = (
                       SELECT id FROM factory_modules 
                       WHERE status = 'deployed' 
                       ORDER BY created_at ASC LIMIT 1
                   )
                   RETURNING id, name, dimension, frontend_file"""
            ).fetchone()
            conn.commit()
        except Exception:
            # Fallback für ältere SQLite ohne RETURNING
            conn.execute("BEGIN IMMEDIATE")
            row = conn.execute(
                "SELECT id, name, dimension, frontend_file FROM factory_modules WHERE status = 'deployed' ORDER BY created_at ASC LIMIT 1"
            ).fetchone()
            if row:
                conn.execute(
                    "UPDATE factory_modules SET status = 'pending_audit', updated_at = datetime('now') WHERE id = ?",
                    (row['id'],)
                )
            conn.commit()
    
    if not row:
        return False  # Keine Arbeit
    
    mod = dict(row)
    print(f"[WATCHMAN] Auditing module {mod['id']}: {mod['name']}")

    try:
        html_path = PROJECT_ROOT / mod["frontend_file"]
        if not html_path.exists():
            print(f"[WATCHMAN] Skip {mod['name']}: File missing at {mod['frontend_file']}")
            # Fehler: deployed bleibt für manuelle Prüfung
            with get_db() as conn:
                conn.execute(
                    "UPDATE factory_modules SET status = 'deployed', updated_at = datetime('now') WHERE id = ?",
                    (mod['id'],)
                )
                conn.commit()
            return False

        # Ignore quarantined, failed, backup, or dirty files (v2.4)
        if any(ext in str(html_path).lower() for ext in [".quarantine_", ".failed", ".bak_", ".dirty"]):
            print(f"[WATCHMAN] Skip {mod['name']}: Ignoring system file {html_path.suffix}")
            with get_db() as conn:
                conn.execute(
                    "UPDATE factory_modules SET status = 'ignored', updated_at = datetime('now') WHERE id = ?",
                    (mod['id'],)
                )
                conn.commit()
            return True

        content = html_path.read_text(encoding="utf-8", errors="ignore")
        
        # Parse MBRN_MODULE_META header for quality_score floor
        meta = _parse_mbrn_meta_header(content)
        header_quality_score = meta.get('quality_score', 0.0)  # 0-100 from Scout
        floor_score = min(1.0, max(0.0, header_quality_score / 100.0))  # Normalize to 0-1
        
        # Get source_type from header (fallback to DB raw_data)
        source_type = meta.get('source_type', '')
        if not source_type:
            raw_data = mod.get("raw_data", "{}")
            if isinstance(raw_data, str):
                try:
                    raw_data = json.loads(raw_data)
                except json.JSONDecodeError:
                    raw_data = {}
            source_type = raw_data.get("source_type", "") if isinstance(raw_data, dict) else ""

        # HackerNews modules: use header quality_score as score (strategic value, not code)
        if source_type == "hackernews":
            score = floor_score  # Use Scout quality_score directly
            is_elite = 1 if score >= 0.8 else 0
            curation_status = 'trash' if score < 0.2 else ('elite' if is_elite else 'standard')

            with get_db() as conn:
                conn.execute(
                    """UPDATE factory_modules
                       SET status = 'audited',
                           quality_score = ?,
                           is_elite = ?,
                           curation_status = ?,
                           updated_at = datetime('now')
                       WHERE id = ?""",
                    (score, is_elite, curation_status, mod['id'])
                )
                conn.commit()

            print(f"[WATCHMAN] {mod['name']} (HN): Score {score:.2f} ({curation_status}) [Floor: {floor_score:.2f}]")
            export_factory_feed_snapshot(limit=100)
            return True

        # ── Branch: Python vs HTML ───────────────────────────────────────────
        is_python = html_path.suffix == ".py" or "import " in content[:500]
        mode = "python" if is_python else "frontend"
        
        if is_python:
            static_score = calculate_python_score(content)
        else:
            static_score = calculate_html_score(content)

        # Phi4 Diamond validation (combines with static for final score)
        logic_desc = mod["name"] if mod["name"] else ""
        phi4_score = validate_with_phi4(content, logic_desc, mode)

        # Weighted combination: 40% static, 60% Phi4 reasoning
        combined_score = (static_score * 0.4) + (phi4_score * 0.6)
        
        # Apply quality_score floor from Scout header (never score below Scout's assessment)
        score = max(combined_score, floor_score)
        
        is_elite = 1 if score >= 0.8 else 0
        curation_status = 'trash' if score < 0.2 else ('elite' if is_elite else 'standard')

        # ── AI Fallback Guard (v2.2) ─────────────────────────────────────────
        # If static structure is nearly perfect but AI failed (score 0.0), 
        # don't auto-trash. Mark as needs_review to prevent data loss.
        if static_score >= 0.95 and phi4_score == 0.0:
            curation_status = 'needs_review'
            score = max(0.45, floor_score) # Keep it in the standard/pending range
            print(f"[WATCHMAN] ⚠️ AI Fallback for {mod['name']}: High static ({static_score:.2f}) vs 0.0 AI. Marked as needs_review.")
        
        # Status: pending_audit → audited
        with get_db() as conn:
            conn.execute(
                """UPDATE factory_modules 
                   SET status = 'audited',
                       quality_score = ?,
                       is_elite = ?,
                       curation_status = ?,
                       updated_at = datetime('now')
                   WHERE id = ?""",
                (score, is_elite, curation_status, mod['id'])
            )
            conn.commit()
        
        print(f"[WATCHMAN] ✓ {mod['name']} ({mode}): Score {score:.2f} ({curation_status}) [Static: {static_score:.2f}, AI: {phi4_score:.2f}]")
        export_factory_feed_snapshot(limit=100)
        return True
        
    except Exception as e:
        print(f"[WATCHMAN] ✗ Failed {mod['id']}: {e}")
        # Fehler: Zurück zu deployed für Retry
        try:
            with get_db() as conn:
                conn.execute(
                    "UPDATE factory_modules SET status = 'deployed', updated_at = datetime('now') WHERE id = ?",
                    (mod['id'],)
                )
                conn.commit()
        except Exception as revert_err:
            print(f"[WATCHMAN] Failed to revert status: {revert_err}")
        return False


def watchman_loop():
    """Continuous watchman mode - poll every 2 seconds."""
    print("╔══════════════════════════════════════════════════╗")
    print("║  LOGIC AUDITOR v2.4 - WATCHMAN MODE              ║")
    print("║  Flow: deployed → pending_audit → audited        ║")
    print("╚══════════════════════════════════════════════════╝")
    
    while True:
        try:
            processed = run_watchman_cycle()
            if not processed:
                time.sleep(2)
            # Bei Erfolg sofort weiter (Backlog)
            
        except Exception as e:
            print(f"[WATCHMAN CRITICAL] {e}")
            time.sleep(5)
            continue


def run_audit():
    """Legacy batch mode - process all deployed modules."""
    print("[Auditor] [LEGACY] Starting batch audit of deployed modules...")
    processed = 0
    while True:
        result = run_watchman_cycle()
        if not result:
            break
        processed += 1
    print(f"[Auditor] [LEGACY] Batch complete. Processed {processed} modules.")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--once", action="store_true", help="Single cycle (legacy mode)")
    args = parser.parse_args()
    
    if args.once:
        run_audit()  # Legacy batch mode
    else:
        watchman_loop()  # Neue Standard: Watchman Mode


if __name__ == "__main__":
    main()
