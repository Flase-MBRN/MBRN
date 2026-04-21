from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple
import json
from pathlib import Path
import sys

PROJECT_ROOT = Path(__file__).resolve().parents[4]
PIPELINES_DIR = PROJECT_ROOT / "scripts" / "pipelines"
if str(PIPELINES_DIR) not in sys.path:
    sys.path.append(str(PIPELINES_DIR))

from pipeline_utils import save_json_atomic

MASTER_NUMBERS = [11, 22, 33]
MASTER_NUMBERS_SET = set(MASTER_NUMBERS)

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

def digit_sum(n: int) -> int:
    return sum(int(d) for d in str(abs(n)))

def reduce_force_single(n: int) -> int:
    if n == 0:
        return 0
    while n > 9:
        n = digit_sum(n)
    return n

def reduce_preserve_master(n: int) -> int:
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
    normal = reduce_force_single(raw)
    master = reduce_preserve_master(raw)
    if MASTER_NUMBERS_SET.__contains__(master) and master != normal:
        return f"{normal}/{master}"
    return str(normal)

def parse_date(date_str: str) -> Tuple[int, int, int]:
    parts = date_str.split('.')
    if len(parts) != 3:
        raise ValueError(f"Invalid date format: {date_str}. Expected DD.MM.YYYY")
    day = int(parts[0])
    month = int(parts[1])
    year = int(parts[2])
    return day, month, year

def calculate_day_number(date_str: str) -> int:
    day, month, year = parse_date(date_str)

    if day in MASTER_NUMBERS_SET:
        return day
    if month in MASTER_NUMBERS_SET:
        return month

    day_reduced = reduce_preserve_master(day)
    month_reduced = reduce_preserve_master(month)
    year_reduced = reduce_preserve_master(digit_sum(year))

    if day_reduced in MASTER_NUMBERS_SET:
        return day_reduced
    if month_reduced in MASTER_NUMBERS_SET:
        return month_reduced

    total = day_reduced + month_reduced + year_reduced
    return reduce_preserve_master(total)

def is_master_number(n: int) -> bool:
    return MASTER_NUMBERS_SET.__contains__(n)

def get_day_description(day_number: int) -> str:
    return DAY_DESCRIPTIONS.get(day_number, "Unbekannt")

def _headline_keyword_balance(news_items: Optional[List[Dict[str, Any]]] = None) -> int:
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

def get_numerology_for_date_range(start_date: str, days: int) -> List[Dict[str, Any]]:
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
    today = datetime.utcnow()
    next_day = today + timedelta(days=1)
    while next_day.weekday() >= 5:
        next_day += timedelta(days=1)
    return next_day.strftime("%d.%m.%Y")

def cache_numerology_history(data: List[Dict[str, Any]], cache_path: Optional[str] = None) -> None:
    if cache_path is None:
        cache_path = str(PROJECT_ROOT / "shared" / "data" / "numerology_history.json")

    cache_file = Path(cache_path)
    cache_file.parent.mkdir(parents=True, exist_ok=True)
    save_json_atomic(cache_file, data)

def load_cached_numerology_history(cache_path: Optional[str] = None) -> Optional[List[Dict[str, Any]]]:
    if cache_path is None:
        cache_path = str(PROJECT_ROOT / "shared" / "data" / "numerology_history.json")

    cache_file = Path(cache_path)
    if not cache_file.exists():
        return None

    with open(cache_file, 'r', encoding='utf-8') as f:
        return json.load(f)
