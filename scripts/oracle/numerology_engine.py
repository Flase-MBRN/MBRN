#!/usr/bin/env python3
"""
/scripts/oracle/numerology_engine.py
NUMEROLOGY ENGINE — Python Re-Implementation of timing.js

Responsibilities:
- Calculate day numbers (1-9) with master number preservation
- Determine numerological relevance for dates
- Autark from JavaScript dependencies

Based on: /shared/core/logic/numerology/timing.js
"""

from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple
import json
from pathlib import Path
import sys

PROJECT_ROOT = Path(__file__).resolve().parents[2]
PIPELINES_DIR = PROJECT_ROOT / "scripts" / "pipelines"
if str(PIPELINES_DIR) not in sys.path:
    sys.path.append(str(PIPELINES_DIR))

from pipeline_utils import save_json_atomic

# =============================================================================
# CONSTANTS
# =============================================================================

MASTER_NUMBERS = [11, 22, 33]
MASTER_NUMBERS_SET = set(MASTER_NUMBERS)

# Pythagoras mapping (from core.js)
PYTHAGORAS = {
    1: ['A', 'J', 'S'],
    2: ['B', 'K', 'T'],
    3: ['C', 'L', 'U'],
    4: ['D', 'M', 'V'],
    5: ['E', 'N', 'W'],
    6: ['F', 'O', 'X'],
    7: ['G', 'P', 'Y'],
    8: ['H', 'Q', 'Z'],
    9: ['I', 'R'],
}

VOWELS = set(['A', 'E', 'I', 'O', 'U'])

# Day number descriptions for Oracle correlation
DAY_DESCRIPTIONS = {
    1: "Initiative, Führung, Neubeginn",
    2: "Partnerschaft, Diplomatie, Harmonie",
    3: "Kreativität, Ausdruck, Kommunikation",
    4: "Stabilität, Struktur, Fundament",
    5: "Freiheit, Wandel, Abenteuer",
    6: "Harmonie, Familie, Verantwortung",
    7: "Analyse, Spiritualität, Intuition",
    8: "Macht, Erfolg, materielle Fülle",
    9: "Abschluss, Weisheit, Humanität",
    11: "Meisterzahl: Spirituelle Erleuchtung, Vision",
    22: "Meisterzahl: Baumeister der Zukunft",
    33: "Meisterzahl: Meisterheiler, universelle Liebe"
}

# =============================================================================
# CORE MATHEMATICAL FUNCTIONS
# =============================================================================

def digit_sum(n: int) -> int:
    """Sum of digits of a number."""
    return sum(int(d) for d in str(abs(n)))

def reduce_force_single(n: int) -> int:
    """Reduce to single digit (1-9), force reduction of master numbers."""
    if n == 0:
        return 0
    while n > 9:
        n = digit_sum(n)
    return n

def reduce_preserve_master(n: int) -> int:
    """Reduce to single digit, but preserve master numbers (11, 22, 33)."""
    if n == 0:
        return 0
    if MASTER_NUMBERS_SET.__contains__(n):
        return n
    while n > 9:
        n = digit_sum(n)
        if MASTER_NUMBERS_SET.__contains__(n):
            break
    return n

def format_value(raw: int) -> str:
    """Format value preserving master numbers (e.g., '2/11')."""
    normal = reduce_force_single(raw)
    master = reduce_preserve_master(raw)
    if MASTER_NUMBERS_SET.__contains__(master) and master != normal:
        return f"{normal}/{master}"
    return str(normal)

# =============================================================================
# DATE PARSING & DAY CALCULATION
# =============================================================================

def parse_date(date_str: str) -> Tuple[int, int, int]:
    """
    Parse date string in format DD.MM.YYYY.
    
    Returns:
        (day, month, year) as integers
    """
    parts = date_str.split('.')
    if len(parts) != 3:
        raise ValueError(f"Invalid date format: {date_str}. Expected DD.MM.YYYY")
    day = int(parts[0])
    month = int(parts[1])
    year = int(parts[2])
    return day, month, year

def calculate_day_number(date_str: str) -> int:
    """
    Calculate the numerological day number for a given date.
    
    Formula: Day + Month + Year, reduced to single digit (preserve master numbers).
    
    CRITICAL: Master numbers (11, 22, 33) must NOT be reduced during calculation.
    
    Args:
        date_str: Date in format DD.MM.YYYY
        
    Returns:
        Day number (1-9 or 11, 22, 33)
    """
    day, month, year = parse_date(date_str)
    
    # Check if day or month are already master numbers
    if day in MASTER_NUMBERS_SET:
        return day  # Return master day number directly
    if month in MASTER_NUMBERS_SET:
        return month  # Return master month number directly
    
    # Calculate with preservation
    day_reduced = reduce_preserve_master(day)
    month_reduced = reduce_preserve_master(month)
    year_reduced = reduce_preserve_master(digit_sum(year))
    
    # If any component is a master number, preserve it
    if day_reduced in MASTER_NUMBERS_SET:
        return day_reduced
    if month_reduced in MASTER_NUMBERS_SET:
        return month_reduced
    
    # Only reduce the total if no master numbers in components
    total = day_reduced + month_reduced + year_reduced
    return reduce_preserve_master(total)

def is_master_number(n: int) -> bool:
    """Check if a number is a master number."""
    return MASTER_NUMBERS_SET.__contains__(n)

def get_day_description(day_number: int) -> str:
    """Get description for a day number."""
    return DAY_DESCRIPTIONS.get(day_number, "Unbekannt")


def _headline_keyword_balance(news_items: Optional[List[Dict[str, Any]]] = None) -> int:
    """Estimate bullish/bearish pressure from finance headlines."""
    if not news_items:
        return 0

    positive_keywords = {
        "surge", "rally", "beat", "growth", "expand", "record", "gain", "approve", "bull", "optimism",
    }
    negative_keywords = {
        "drop", "fall", "miss", "cut", "downgrade", "lawsuit", "probe", "investigation", "crash", "bear",
    }

    balance = 0
    for item in news_items[:8]:
        text = f"{item.get('title', '')} {item.get('summary', '')}".lower()
        balance += sum(1 for keyword in positive_keywords if keyword in text)
        balance -= sum(1 for keyword in negative_keywords if keyword in text)
    return balance


def enhance_alignment_score_with_market_streams(
    base_alignment_score: float,
    day_number: int,
    crypto_snapshot: Optional[Dict[str, Dict[str, float]]] = None,
    news_items: Optional[List[Dict[str, Any]]] = None,
    news_bias: str = "neutral",
    news_impact: float = 0.0,
) -> Dict[str, float]:
    """
    Blend crypto and RSS-news streams into the Oracle alignment score.

    The numerological day number acts as a resonance multiplier so master days
    amplify external market pressure more strongly than baseline days.
    """
    crypto_snapshot = crypto_snapshot or {}

    crypto_changes = [
        float(crypto_snapshot.get(symbol, {}).get("change_percent", 0.0) or 0.0)
        for symbol in ("BTC-USD", "ETH-USD")
        if symbol in crypto_snapshot
    ]
    avg_crypto_change = sum(crypto_changes) / len(crypto_changes) if crypto_changes else 0.0
    crypto_modifier = max(-10.0, min(10.0, avg_crypto_change * 1.5))

    balance = _headline_keyword_balance(news_items)
    bias_scale = 0.0
    bias_text = str(news_bias or "").lower()
    if "bull" in bias_text:
        bias_scale = 1.0
    elif "bear" in bias_text:
        bias_scale = -1.0

    impact_scale = max(0.35, min(1.0, float(news_impact or 0.0) / 100.0))
    news_modifier = max(-10.0, min(10.0, ((balance * 1.4) + (bias_scale * 4.0)) * impact_scale))

    if is_master_number(day_number):
        day_multiplier = 1.15
    elif day_number in [1, 8, 9]:
        day_multiplier = 1.05
    elif day_number in [4, 5, 7]:
        day_multiplier = 0.95
    else:
        day_multiplier = 1.0

    total_modifier = max(-15.0, min(15.0, (crypto_modifier + news_modifier) * day_multiplier))
    final_alignment_score = round(max(0.0, min(100.0, base_alignment_score + total_modifier)), 2)

    return {
        "base_alignment_score": round(base_alignment_score, 2),
        "crypto_modifier": round(crypto_modifier, 2),
        "news_modifier": round(news_modifier, 2),
        "day_multiplier": round(day_multiplier, 2),
        "total_modifier": round(total_modifier, 2),
        "final_alignment_score": final_alignment_score,
    }

# =============================================================================
# RANGE CALCULATIONS
# =============================================================================

def get_numerology_for_date_range(start_date: str, days: int) -> List[Dict[str, Any]]:
    """
    Calculate numerology values for a range of dates.
    
    Args:
        start_date: Starting date in DD.MM.YYYY format
        days: Number of days to calculate
        
    Returns:
        List of dicts with date, day_number, is_master, description
    """
    start_day, start_month, start_year = parse_date(start_date)
    start_dt = datetime(start_year, start_month, start_day)
    
    results = []
    for i in range(days):
        current_dt = start_dt + timedelta(days=i)
        date_str = current_dt.strftime("%d.%m.%Y")
        
        day_number = calculate_day_number(date_str)
        
        results.append({
            "date": date_str,
            "date_utc": current_dt.strftime("%Y-%m-%dT00:00:00Z"),
            "day_number": day_number,
            "is_master": is_master_number(day_number),
            "description": get_day_description(day_number)
        })
    
    return results

def get_next_trading_day() -> str:
    """
    Get the next trading day (Monday-Friday, excluding weekends).
    
    Returns:
        Date string in DD.MM.YYYY format
    """
    today = datetime.utcnow()
    next_day = today + timedelta(days=1)
    
    # Skip weekends
    while next_day.weekday() >= 5:  # 5=Saturday, 6=Sunday
        next_day += timedelta(days=1)
    
    return next_day.strftime("%d.%m.%Y")

# =============================================================================
# CACHING
# =============================================================================

def cache_numerology_history(data: List[Dict[str, Any]], cache_path: Optional[str] = None) -> None:
    """Cache numerology history to JSON file."""
    if cache_path is None:
        cache_path = str(PROJECT_ROOT / "shared" / "data" / "numerology_history.json")
    
    cache_file = Path(cache_path)
    cache_file.parent.mkdir(parents=True, exist_ok=True)
    
    save_json_atomic(cache_file, data)
    
    print(f"[INFO] Numerology history cached to: {cache_path}")

def load_cached_numerology_history(cache_path: Optional[str] = None) -> Optional[List[Dict[str, Any]]]:
    """Load cached numerology history from JSON file."""
    if cache_path is None:
        cache_path = str(PROJECT_ROOT / "shared" / "data" / "numerology_history.json")
    
    cache_file = Path(cache_path)
    if not cache_file.exists():
        return None
    
    with open(cache_file, 'r', encoding='utf-8') as f:
        return json.load(f)

# =============================================================================
# MAIN (TEST)
# =============================================================================

if __name__ == "__main__":
    # Test: Calculate day number for today
    today = datetime.utcnow().strftime("%d.%m.%Y")
    day_num = calculate_day_number(today)
    
    print(f"[TEST] Today ({today}): Day Number = {day_num}")
    print(f"[TEST] Is Master: {is_master_number(day_num)}")
    print(f"[TEST] Description: {get_day_description(day_num)}")
    
    # Test: Calculate for next 7 days
    print(f"\n[TEST] Next 7 days:")
    for entry in get_numerology_for_date_range(today, 7):
        print(f"  {entry['date']}: {entry['day_number']} - {entry['description']}")
    
    # Test: Master number preservation (CRITICAL TEST)
    print(f"\n[CRITICAL TEST] Master Number Preservation:")
    test_dates = [
        "29.02.2024",  # Should reduce to 2+9+2+2+0+2+4 = 21 → 3
        "11.11.2024",  # Should be 11 (master number)
        "22.09.2024",  # Should be 22 (master number)
        "29.09.2024",  # Should be 33 (master number)
    ]
    for date_str in test_dates:
        day_num = calculate_day_number(date_str)
        is_master = is_master_number(day_num)
        print(f"  {date_str}: Day Number = {day_num} (Master: {is_master})")
        
        # Verify master numbers are NOT reduced
        if date_str in ["11.11.2024", "22.09.2024", "29.09.2024"]:
            if is_master:
                print(f"    ✓ Master number preserved correctly")
            else:
                print(f"    ✗ ERROR: Master number was reduced to {day_num}")
    
    # Test: reduce_preserve_master vs reduce_force_single
    print(f"\n[TEST] Reduction Functions:")
    test_values = [11, 22, 33, 14, 28, 36]
    for val in test_values:
        preserved = reduce_preserve_master(val)
        forced = reduce_force_single(val)
        print(f"  {val}: preserve={preserved}, force={forced}")
        if val in [11, 22, 33]:
            if preserved == val:
                print(f"    ✓ Master number preserved")
            else:
                print(f"    ✗ ERROR: Master number {val} reduced to {preserved}")
