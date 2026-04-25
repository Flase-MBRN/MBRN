#!/usr/bin/env python3
"""Import factory_ready Python modules into the SQLite factory_modules table."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from shared.core.db import CANONICAL_DIMENSIONS, init_db, upsert_factory_module


FACTORY_READY = PROJECT_ROOT / "docs" / "S3_Data" / "outputs" / "factory_ready"
EXPECTED_MINIMUM = 145

DIMENSION_KEYWORDS = {
    "zeit": ["time", "habit", "streak", "daily", "routine", "timer"],
    "geld": ["finance", "money", "invest", "budget", "compound", "interest"],
    "physis": ["fitness", "health", "body", "workout", "sleep"],
    "geist": ["mindset", "mental", "mood", "focus", "stress"],
    "ausdruck": ["creative", "content", "style", "express", "voice"],
    "netzwerk": ["synergy", "compat", "relation", "social", "network"],
    "energie": ["energy", "flow", "vitality", "circadian", "peak"],
    "systeme": ["system", "workflow", "process", "automat", "architect"],
    "raum": ["space", "environment", "location", "ambient", "workspace"],
    "muster": ["numerology", "pattern", "life_path", "birth", "name"],
    "wachstum": ["growth", "skill", "learn", "progress", "milestone"],
}


def guess_dimension(filename: str, content: str) -> str:
    text = f"{filename} {content[:800]}".lower()
    scores = {dimension: 0 for dimension in CANONICAL_DIMENSIONS}
    for dimension, keywords in DIMENSION_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text:
                scores[dimension] += 1
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else "systeme"


def iter_modules() -> list[Path]:
    return sorted(path for path in FACTORY_READY.glob("**/*.py") if path.is_file())


def run_migration(apply: bool = False) -> int:
    init_db()
    py_files = iter_modules()
    print(f"[Migration] Gefunden: {len(py_files)} Module")
    if len(py_files) < EXPECTED_MINIMUM:
        print(f"[Migration][DRIFT] Erwartet: {EXPECTED_MINIMUM}+ Module, gefunden: {len(py_files)}")

    imported = 0
    for path in py_files:
        content = path.read_text(encoding="utf-8", errors="ignore")
        dimension = guess_dimension(path.stem, content)
        if apply:
            upsert_factory_module(
                name=path.stem,
                dimension=dimension,
                source_file=str(path.relative_to(PROJECT_ROOT)).replace("\\", "/"),
                frontend_file=None,
                status="ready",
                quality_score=0.5,
                raw_data={"migration": "factory_ready_v5", "path": str(path)},
            )
        imported += 1
        if imported % 25 == 0:
            verb = "importiert" if apply else "geprueft"
            print(f"[Migration] {imported}/{len(py_files)} {verb}...")

    mode = "APPLY" if apply else "DRY-RUN"
    print(f"[Migration] {mode} fertig. Module: {imported}")
    return 0 if imported >= EXPECTED_MINIMUM else 2


def main() -> int:
    parser = argparse.ArgumentParser(description="Import factory_ready modules into SQLite.")
    parser.add_argument("--apply", action="store_true", help="Write rows to SQLite. Default is dry-run.")
    args = parser.parse_args()
    return run_migration(apply=args.apply)


if __name__ == "__main__":
    raise SystemExit(main())

