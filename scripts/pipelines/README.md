# MBRN Data Arbitrage — Pillar 3 Pipelines

> **Location:** `scripts/pipelines/`
> **Purpose:** lokale Datensammlung und Anreicherung für Dashboard, Oracle und Supabase
> **Compliance:** keine personenbezogenen Daten, nur strukturelle Markt- und News-Signale

---

## Quick Start

```bash
pip install -r requirements.txt
python market_sentiment_fetcher.py
```

Optional für Secrets:

- Windows Credential Manager via `pywin32`
- `keyring` als plattformübergreifender Fallback

---

## Aktive Pipelines

### `market_sentiment_fetcher.py`

Die Markt-Pipeline ist der operative Vertical Slice für Säule 3.

**Ticker**

- `SPY`
- `QQQ`
- `DIA`
- `IWM`
- `^VIX`
- `BTC-USD`
- `ETH-USD`

**News-Quellen**

- Reuters Business
- Reuters World
- CNBC Markets
- CNBC Finance
- Google News Markets
- Google News Business

**Härtung**

- `fetch_url_with_retry()` mit rotierenden Headern und Retry-Logik
- tolerantes Feed-Parsing über `parse_feed_items()`
- `dirty_xml`-Fallback mit `BeautifulSoup` und `lxml`
- `parse_strict_json_response()` für direkte und verrauschte Ollama-Ausgaben
- `repair_json_with_ollama()` für einen einmaligen JSON-Reparaturversuch
- neutrales Fallback-Payload, wenn Ollama oder Parsing scheitert

**Output**

- Verlauf nach `AI/models/data/market_sentiment_YYYYMMDD_HHMMSS.json`
- Shared Mirror nach `shared/data/market_sentiment.json`
- Supabase Payload mit stabiler Vertragsform

**Top-Level-Felder im Shared Mirror**

```json
{
  "timestamp_utc": "2026-04-19T18:36:03.380917+00:00",
  "source": "market_sentiment_pipeline",
  "sentiment_score": 85,
  "sentiment_label": "Extreme Greed",
  "confidence": 0.8,
  "analysis": "Kurzbeschreibung der Lage",
  "recommendation": "buy",
  "crypto_bias": "neutral",
  "news_bias": "bullish",
  "news_impact": 0,
  "key_theme": "growth",
  "market_data": [],
  "news_feed": [],
  "mbrn_enriched": {}
}
```

### `pipeline_utils.py`

Gemeinsame Utilities für:

- `save_json_atomic()` für thread-sichere und prozesssichere JSON-Writes
- `SupabaseUplink`
- `RetryHandler`
- `CircuitBreaker`
- `PipelineCache`
- `OllamaEnricher`
- JSON-Hardening und Feed-Parsing

`save_json_atomic()` ist der kanonische Schreibpfad für Runtime-Artefakte.

---

## Abhängigkeiten

Aktiver Stand von `requirements.txt`:

```txt
requests>=2.31.0
python-dotenv>=1.0.0
pywin32>=306
keyring>=24.0.0
yfinance>=0.2.28
beautifulsoup4>=4.12.3
lxml>=5.3.0
```

---

## Datenfluss

```text
yfinance + RSS + Ollama
        ↓
market_sentiment_fetcher.py
        ↓
AI/models/data/market_sentiment_*.json
        ↓
shared/data/market_sentiment.json
        ↓
Supabase Edge Function / Oracle / Dashboard
```

---

## Betriebsnotizen

- Die Pipeline nutzt lokale Ollama-Verarbeitung auf der RX 7700 XT.
- Reuters kann extern instabil sein; CNBC und Google News dienen als resiliente Gegenpfade.
- Feed-Ausfälle sind isoliert. Ein defekter Feed darf den gesamten News-Zyklus nicht blockieren.
- Die Persistenzform des Shared Mirrors bleibt bewusst rückwärtskompatibel.

---

## Oracle-Kopplung

Das Oracle liest die von dieser Pipeline erzeugten Artefakte über `scripts/oracle/data_bridge.py`.

Genutzte Signale:

- `sentiment_score`
- `recommendation`
- `news_bias` / `news_signal`
- `news_impact`
- `headline_count`
- BTC-/ETH-Snapshots und abgeleitete `crypto_sentiment`-Werte

Die geplante Stunden-Orchestrierung läuft über den bestehenden Sentinel-Pfad:

- `worker_registry.py` registriert den Oracle-Worker
- `sentinel_daemon.py` kann Oracle und Pipeline-Worker im selben Scheduler-Takt dispatchen

---

## Status

**Pipeline-Version:** `1.1.x`
**Status:** `operativ`
**Nächste offene Ebene:** Scheduler-/Worker-Orchestrierung für einen belastbaren Stundenrhythmus außerhalb des Frontends
