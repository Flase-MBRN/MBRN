"""SEC-first Trust Matrix worker for Sentinel V2."""

from __future__ import annotations

import hashlib
import json
import re
import sys
import xml.etree.ElementTree as ET
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional

import requests

PIPELINES_DIR = Path(__file__).resolve().parents[1]
if str(PIPELINES_DIR) not in sys.path:
    sys.path.insert(0, str(PIPELINES_DIR))

from pipeline_utils import OllamaEnricher, SupabaseUplink, load_pipeline_env, save_json_atomic, save_to_json
# NOTE: schema_validator module archived - validation disabled
# from schema_validator import SchemaValidator, ValidationError


class DummySchemaValidator:
    """Placeholder for archived schema_validator module."""
    def validate_signal_payload(self, payload):
        return payload


class ValidationError(Exception):
    """Placeholder for archived ValidationError."""
    pass


VERSION = "1.0.0"
PROJECT_ROOT = Path(__file__).resolve().parents[3]
OUTPUT_DIR = PROJECT_ROOT / "AI" / "models" / "data"
STATE_FILE = OUTPUT_DIR / "trust_matrix_state.json"
RUN_FILENAME_TEMPLATE = "trust_matrix_{timestamp}.json"
STATE_RETENTION_HOURS = 72
HTTP_TIMEOUT_SECONDS = 20
SHORTLIST_LIMIT = 3
USER_AGENT = "MBRN-TrustMatrix/1.0 (+https://www.sec.gov)"
RECENCY_WINDOW_HOURS = 72

ANSI = {
    "reset": "\033[0m",
    "bold": "\033[1m",
    "violet": "\033[38;2;123;92;245m",
    "violet_soft": "\033[38;2;167;139;250m",
    "silver": "\033[38;2;245;245;245m",
    "soft_silver": "\033[38;2;180;184;198m",
    "warning": "\033[38;2;251;191;36m",
    "error": "\033[38;2;255;107;107m",
    "success": "\033[38;2;79;255;176m",
}

LOG_TONES = {
    "INFO": ANSI["soft_silver"],
    "OK": ANSI["silver"],
    "WARN": ANSI["warning"],
    "ERROR": ANSI["error"],
}

SEC_FEEDS = (
    {
        "feed_name": "press_releases",
        "item_type": "press_release",
        "urls": (
            "https://www.sec.gov/news/pressreleases.rss",
            "https://www.sec.gov/rss/news/press.xml",
        ),
    },
    {
        "feed_name": "speeches",
        "item_type": "speech",
        "urls": (
            "https://www.sec.gov/news/speeches.rss",
            "https://www.sec.gov/news/speeches-statements.rss",
        ),
    },
    {
        "feed_name": "statements",
        "item_type": "statement",
        "urls": (
            "https://www.sec.gov/news/statements.rss",
            "https://www.sec.gov/news/speeches-statements.rss",
        ),
    },
)

KEYWORD_WEIGHTS = {
    "enforcement": 40,
    "agreement": 20,
    "form 4": 30,
    "cybersecurity": 35,
    "acquisition": 30,
    "charges": 35,
    "fraud": 35,
    "settlement": 25,
    "merger": 25,
    "insider": 20,
}

FORM_PATTERN = re.compile(r"\bform\s+[0-9a-z-]+\b", re.IGNORECASE)
WHITESPACE_PATTERN = re.compile(r"\s+")


@dataclass
class SecFeedItem:
    """Normalized SEC RSS item."""

    feed_name: str
    item_type: str
    title: str
    link: str
    guid: str
    published_at: str
    summary: str
    categories: List[str]
    title_hash: str
    keyword_hits: List[str]
    form_hits: List[str]
    relevance_score: int
    recency_bucket: str
    entity_hint: Optional[str]


def colorize(text: str, color: str, bold: bool = False) -> str:
    """Render Starry Sky terminal colors for worker logs."""
    prefix = ANSI["bold"] if bold else ""
    return f"{prefix}{color}{text}{ANSI['reset']}"


def worker_log(level: str, message: str) -> None:
    """Structured Trust Matrix logging in MBRN colors."""
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    tone = LOG_TONES.get(level, ANSI["soft_silver"])
    prefix = colorize("[TRUST-MATRIX]", ANSI["violet"], bold=True)
    print(f"{prefix} {colorize(f'[{timestamp}]', ANSI['violet_soft'])} {colorize(level, tone, bold=True)} {colorize(message, ANSI['silver'])}")


def normalize_text(value: str) -> str:
    """Collapse whitespace for stable hashing and keyword checks."""
    return WHITESPACE_PATTERN.sub(" ", value or "").strip()


def compute_title_hash(title: str) -> str:
    """Generate a stable hash for duplicate detection."""
    normalized = normalize_text(title).lower()
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def parse_datetime_safe(value: str) -> datetime:
    """Parse RFC822/ISO dates from RSS, falling back to now UTC."""
    if not value:
        return datetime.now(timezone.utc)

    try:
        parsed = parsedate_to_datetime(value)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc)
    except (TypeError, ValueError, IndexError):
        pass

    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc)
    except ValueError:
        return datetime.now(timezone.utc)


def recency_bucket_for(published_at: datetime) -> str:
    """Bucket recency for payload dimensions."""
    age_hours = (datetime.now(timezone.utc) - published_at).total_seconds() / 3600
    if age_hours <= 6:
        return "0-6h"
    if age_hours <= 24:
        return "6-24h"
    if age_hours <= 72:
        return "24-72h"
    return "72h+"


def relevance_score_for(title: str, summary: str, item_type: str, published_at: datetime) -> tuple[int, List[str], List[str]]:
    """Score RSS items with deterministic keyword logic before LLM use."""
    text = f"{title} {summary}".lower()
    keyword_hits = [keyword for keyword in KEYWORD_WEIGHTS if keyword in text]
    form_hits = FORM_PATTERN.findall(text)

    score = sum(KEYWORD_WEIGHTS[keyword] for keyword in keyword_hits)
    if form_hits:
        score += 20
    if item_type == "press_release":
        score += 10
    elif item_type == "statement":
        score += 5

    age_hours = (datetime.now(timezone.utc) - published_at).total_seconds() / 3600
    if age_hours <= 6:
        score += 20
    elif age_hours <= 24:
        score += 10
    elif age_hours <= RECENCY_WINDOW_HOURS:
        score += 5

    return score, keyword_hits, form_hits


def infer_entity_hint(title: str) -> Optional[str]:
    """Extract a rough issuer/entity hint from the title."""
    match = re.search(r"\b(?:SEC|Commission)\s+(?:charges|approves|announces|seeks|clarifies)\s+([A-Z][A-Za-z0-9&.,' -]{2,60})", title)
    if match:
        return normalize_text(match.group(1))
    return None


def xml_text(element: Optional[ET.Element], *names: str) -> str:
    """Get element text from the first matching child tag."""
    if element is None:
        return ""

    for name in names:
        candidate = element.find(name)
        if candidate is not None and candidate.text:
            return normalize_text(candidate.text)

    return ""


def parse_rss_items(feed_name: str, item_type: str, xml_body: str) -> List[SecFeedItem]:
    """Parse RSS or Atom XML into normalized feed items."""
    root = ET.fromstring(xml_body)
    items: List[SecFeedItem] = []

    channel_items = root.findall(".//item")
    atom_entries = root.findall(".//{http://www.w3.org/2005/Atom}entry")
    raw_entries: Iterable[ET.Element] = channel_items or atom_entries

    for entry in raw_entries:
        title = xml_text(entry, "title", "{http://www.w3.org/2005/Atom}title")
        if not title:
            continue

        link = xml_text(entry, "link")
        if not link:
            atom_link = entry.find("{http://www.w3.org/2005/Atom}link")
            if atom_link is not None:
                link = atom_link.attrib.get("href", "")

        guid = xml_text(entry, "guid", "{http://www.w3.org/2005/Atom}id") or link or title
        published_raw = xml_text(
            entry,
            "pubDate",
            "published",
            "updated",
            "{http://www.w3.org/2005/Atom}published",
            "{http://www.w3.org/2005/Atom}updated",
        )
        summary = xml_text(
            entry,
            "description",
            "summary",
            "{http://www.w3.org/2005/Atom}summary",
        )
        categories = [
            normalize_text(category.text or "")
            for category in entry.findall("category")
            if normalize_text(category.text or "")
        ]
        categories.extend(
            normalize_text(category.attrib.get("term", ""))
            for category in entry.findall("{http://www.w3.org/2005/Atom}category")
            if normalize_text(category.attrib.get("term", ""))
        )

        published_at = parse_datetime_safe(published_raw)
        score, keyword_hits, form_hits = relevance_score_for(title, summary, item_type, published_at)

        items.append(
            SecFeedItem(
                feed_name=feed_name,
                item_type=item_type,
                title=title,
                link=link,
                guid=guid,
                published_at=published_at.isoformat(),
                summary=summary,
                categories=categories,
                title_hash=compute_title_hash(title),
                keyword_hits=keyword_hits,
                form_hits=form_hits,
                relevance_score=score,
                recency_bucket=recency_bucket_for(published_at),
                entity_hint=infer_entity_hint(title),
            )
        )

    return items


def load_state() -> Dict[str, Any]:
    """Load persistent duplicate-detection state."""
    if not STATE_FILE.exists():
        return {"recent_hashes": [], "last_run_at": None}

    try:
        with open(STATE_FILE, "r", encoding="utf-8") as handle:
            state = json.load(handle)
        if not isinstance(state, dict):
            return {"recent_hashes": [], "last_run_at": None}
        return state
    except (OSError, json.JSONDecodeError):
        return {"recent_hashes": [], "last_run_at": None}


def save_state(state: Dict[str, Any]) -> None:
    """Persist duplicate-detection state."""
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    save_json_atomic(STATE_FILE, state)


def prune_recent_hashes(entries: List[Dict[str, str]]) -> List[Dict[str, str]]:
    """Keep only recent hashes inside the retention window."""
    cutoff = datetime.now(timezone.utc) - timedelta(hours=STATE_RETENTION_HOURS)
    pruned: List[Dict[str, str]] = []
    for entry in entries:
        seen_at = parse_datetime_safe(str(entry.get("seen_at", "")))
        if seen_at >= cutoff and entry.get("hash"):
            pruned.append({"hash": entry["hash"], "seen_at": seen_at.isoformat()})
    return pruned[-500:]


def fetch_feed(feed_name: str, item_type: str, urls: Iterable[str]) -> tuple[List[SecFeedItem], str]:
    """Fetch one SEC RSS feed with fallback URLs."""
    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
    }
    last_error = "no_attempt"

    for url in urls:
        try:
            response = requests.get(url, headers=headers, timeout=HTTP_TIMEOUT_SECONDS)
            response.raise_for_status()
            items = parse_rss_items(feed_name, item_type, response.text)
            worker_log("OK", f"Feed {feed_name} loaded via {url} with {len(items)} items")
            return items, url
        except Exception as exc:
            last_error = str(exc)
            worker_log("WARN", f"Feed {feed_name} failed via {url}: {exc}")

    raise RuntimeError(f"Unable to fetch {feed_name}: {last_error}")


def shortlist_items(items: List[SecFeedItem], recent_hashes: set[str]) -> tuple[List[SecFeedItem], Dict[str, int]]:
    """Apply duplicate suppression and hard keyword filtering."""
    stats = {
        "fetched": len(items),
        "duplicates": 0,
        "keyword_rejected": 0,
        "shortlisted": 0,
    }
    current_hashes: set[str] = set()
    shortlisted: List[SecFeedItem] = []

    for item in items:
        if item.title_hash in current_hashes or item.title_hash in recent_hashes:
            stats["duplicates"] += 1
            continue

        current_hashes.add(item.title_hash)
        if not item.keyword_hits and not item.form_hits:
            stats["keyword_rejected"] += 1
            continue

        shortlisted.append(item)

    shortlisted.sort(
        key=lambda item: (
            item.relevance_score,
            item.published_at,
        ),
        reverse=True,
    )
    shortlisted = shortlisted[:SHORTLIST_LIMIT]
    stats["shortlisted"] = len(shortlisted)
    return shortlisted, stats


def build_prompt(item: SecFeedItem) -> str:
    """Construct the minimal Trust Matrix prompt."""
    return f"""Analysiere diese SEC-Meldung. Gib mir 1. Credibility (0-100), 2. Impact (0-100), 3. Kurz-Summary (1 Satz) und 4. Ein Verdict (High/Medium/Low Trust).

Antwort nur als JSON in diesem exakten Format:
{{
  "credibility": 0,
  "impact": 0,
  "summary": "Ein Satz.",
  "verdict": "High Trust"
}}

SEC-Meldung:
Titel: {item.title}
Typ: {item.item_type}
Feed: {item.feed_name}
Veroeffentlicht: {item.published_at}
Link: {item.link}
Keywords: {", ".join(item.keyword_hits or item.form_hits) or "none"}
Form-Hits: {", ".join(item.form_hits) or "none"}
Summary: {item.summary or "Keine Kurzbeschreibung vorhanden."}
"""


def clamp_score(value: Any) -> int:
    """Clamp model outputs to a V2-safe score."""
    try:
        return max(0, min(100, int(round(float(value)))))
    except (TypeError, ValueError):
        return 0


def normalize_trust_verdict(value: Any) -> str:
    """Normalize trust verdict strings to MBRN-safe labels."""
    text = normalize_text(str(value or "")).lower()
    if "high" in text:
        return "High Trust"
    if "low" in text:
        return "Low Trust"
    return "Medium Trust"


def impact_verdict(score: int) -> str:
    """Derive a human-readable impact verdict."""
    if score >= 75:
        return "High Impact"
    if score >= 40:
        return "Medium Impact"
    return "Low Impact"


def analyze_item(enricher: OllamaEnricher, item: SecFeedItem) -> Dict[str, Any]:
    """Run the shortlisted SEC item through Ollama."""
    prompt = build_prompt(item)
    response = enricher.generate_json(prompt=prompt, worker_name="trust_matrix_v1")

    credibility = clamp_score(response.get("credibility"))
    impact = clamp_score(response.get("impact"))
    summary = normalize_text(str(response.get("summary", ""))) or item.summary or item.title
    verdict = normalize_trust_verdict(response.get("verdict"))

    return {
        "credibility": credibility,
        "impact": impact,
        "summary": summary[:240],
        "verdict": verdict,
        "raw_llm": response,
    }


def build_dimensions(item: SecFeedItem) -> Dict[str, Any]:
    """Build canonical dimensions for signal payloads."""
    return {
        "feed_name": item.feed_name,
        "item_type": item.item_type,
        "keyword_hits": item.keyword_hits,
        "form_hits": item.form_hits,
        "relevance_score": item.relevance_score,
        "recency_bucket": item.recency_bucket,
        "entity_hint": item.entity_hint,
        "categories": item.categories,
    }


def build_payloads(item: SecFeedItem, analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Build credibility and impact V2 payloads for one SEC item."""
    base_metadata = {
        "worker_id": "trust_matrix_v1",
        "pipeline_version": VERSION,
        "feed_guid": item.guid,
        "title_hash": item.title_hash,
        "ollama_model": analysis["raw_llm"].get("model", "none"),
        "source_link": item.link,
    }

    base_raw = {
        "sec_item": asdict(item),
        "llm_response": analysis["raw_llm"],
    }

    credibility_payload = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source": "trust_matrix_sec",
        "signal_type": "credibility",
        "normalized_score": analysis["credibility"],
        "verdict": analysis["verdict"],
        "summary": analysis["summary"],
        "dimensions": build_dimensions(item),
        "raw_data": base_raw,
        "metadata": {
            **base_metadata,
            "signal_role": "primary",
            "paired_impact_score": analysis["impact"],
        },
    }

    impact_payload = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source": "trust_matrix_sec",
        "signal_type": "impact",
        "normalized_score": analysis["impact"],
        "verdict": impact_verdict(analysis["impact"]),
        "summary": analysis["summary"],
        "dimensions": build_dimensions(item),
        "raw_data": base_raw,
        "metadata": {
            **base_metadata,
            "signal_role": "secondary",
            "paired_trust_verdict": analysis["verdict"],
            "paired_credibility_score": analysis["credibility"],
        },
    }

    return [credibility_payload, impact_payload]


def _dispatch_with_retry(uplink: SupabaseUplink, payload: Dict[str, Any], max_retries: int = 3) -> bool:
    """Dispatch to Supabase with exponential backoff retry logic."""
    import time
    for attempt in range(max_retries):
        try:
            if uplink.dispatch(payload):
                return True
        except Exception as exc:
            worker_log("WARN", f"Dispatch exception (attempt {attempt + 1}/{max_retries}): {exc}")
            if attempt < max_retries - 1:
                delay = 2 ** attempt  # Exponential backoff: 1s, 2s, 4s
                worker_log("INFO", f"Retrying in {delay}s...")
                time.sleep(delay)
    return False


def dispatch_payloads(payloads: List[Dict[str, Any]], validator: SchemaValidator, uplink: SupabaseUplink) -> List[Dict[str, Any]]:
    """Validate and dispatch payloads to Supabase with retry resilience."""
    dispatched: List[Dict[str, Any]] = []

    for payload in payloads:
        try:
            validated = validator.validate_signal_payload(payload)
        except ValidationError as exc:
            worker_log("ERROR", f"Schema validation failed for {payload.get('signal_type')}: {exc.errors}")
            continue

        # CRITICAL: Use retry loop for network resilience
        if _dispatch_with_retry(uplink, validated):
            dispatched.append(validated)
            worker_log(
                "OK",
                f"Signal dispatched type={validated['signal_type']} score={validated['normalized_score']} verdict={validated['verdict']}",
            )
        else:
            worker_log("ERROR", f"Dispatch failed after retries for {validated['signal_type']} from {validated['source']}")

    return dispatched


def persist_run_artifact(fetched_items: List[SecFeedItem], shortlisted: List[SecFeedItem], dispatched: List[Dict[str, Any]], feed_sources: Dict[str, str], stats: Dict[str, int]) -> None:
    """Save an auditable JSON artifact for this run."""
    artifact = {
        "pipeline": "trust_matrix",
        "version": VERSION,
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "feed_sources": feed_sources,
        "stats": stats,
        "shortlisted_items": [asdict(item) for item in shortlisted],
        "fetched_items": [asdict(item) for item in fetched_items[:25]],
        "signals_dispatched": dispatched,
    }
    save_to_json(artifact, OUTPUT_DIR, RUN_FILENAME_TEMPLATE)


def update_state_with_hashes(state: Dict[str, Any], items: List[SecFeedItem]) -> None:
    """Write newly seen title hashes back to persistent state."""
    existing_entries = prune_recent_hashes(list(state.get("recent_hashes", [])))
    additions = [{"hash": item.title_hash, "seen_at": datetime.now(timezone.utc).isoformat()} for item in items]
    state["recent_hashes"] = prune_recent_hashes(existing_entries + additions)
    state["last_run_at"] = datetime.now(timezone.utc).isoformat()
    save_state(state)


def run() -> bool:
    """Execute the Trust Matrix SEC-first pipeline."""
    load_pipeline_env()
    worker_log("INFO", "Trust Matrix V1 boot sequence engaged")

    validator = DummySchemaValidator()  # SchemaValidator archived
    uplink = SupabaseUplink()
    enricher = OllamaEnricher()

    all_items: List[SecFeedItem] = []
    feed_sources: Dict[str, str] = {}
    healthy_feeds = 0

    for feed in SEC_FEEDS:
        try:
            items, used_url = fetch_feed(feed["feed_name"], feed["item_type"], feed["urls"])
            all_items.extend(items)
            feed_sources[feed["feed_name"]] = used_url
            healthy_feeds += 1
        except Exception as exc:
            worker_log("WARN", f"Feed {feed['feed_name']} skipped after retries: {exc}")

    if healthy_feeds == 0:
        worker_log("ERROR", "No SEC feeds available; aborting Trust Matrix cycle")
        return False

    state = load_state()
    recent_hashes = {entry["hash"] for entry in prune_recent_hashes(list(state.get("recent_hashes", []))) if entry.get("hash")}
    shortlisted, stats = shortlist_items(all_items, recent_hashes)
    stats["healthy_feeds"] = healthy_feeds

    if not shortlisted:
        worker_log("INFO", "No qualifying SEC items after duplicate suppression and keyword filtering")
        update_state_with_hashes(state, all_items)
        persist_run_artifact(all_items, shortlisted, [], feed_sources, stats)
        return True

    worker_log("INFO", f"Shortlisted {len(shortlisted)} SEC items for LLM review")
    dispatched_signals: List[Dict[str, Any]] = []

    for item in shortlisted:
        worker_log(
            "INFO",
            f"Analyzing title='{item.title[:90]}' score={item.relevance_score} keywords={','.join(item.keyword_hits or item.form_hits)}",
        )
        analysis = analyze_item(enricher, item)
        payloads = build_payloads(item, analysis)
        dispatched_signals.extend(dispatch_payloads(payloads, validator, uplink))

    update_state_with_hashes(state, all_items)
    persist_run_artifact(all_items, shortlisted, dispatched_signals, feed_sources, stats)

    worker_log(
        "OK",
        f"Cycle complete feeds={healthy_feeds} fetched={len(all_items)} shortlisted={len(shortlisted)} dispatched={len(dispatched_signals)}",
    )
    return True


if __name__ == "__main__":
    raise SystemExit(0 if run() else 1)
