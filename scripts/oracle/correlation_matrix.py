#!/usr/bin/env python3
"""Thin compatibility wrapper for pillar-owned Oracle correlation analysis."""

from pathlib import Path
import sys

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

from pillars.oracle.processing.python.correlation_analysis import *  # noqa: F401,F403,E402
