> **Privater interner Maschinenraum:** Nicht als globale Produktwahrheit lesen.

# MBRN Data Arbitrage - Pillar 3 Pipelines

> **Location:** `scripts/pipelines/`
> **Purpose:** lokale Datensammlung und Veredelung fuer Dashboard, Oracle und Supabase
> **Compliance:** keine personenbezogenen Daten, nur strukturelle Markt- und News-Signale

## Quick Start

```bash
pip install -r requirements.txt
python raw_market_news_collector.py
python local_llm_enrichment_worker.py
```

## Aktive Pipelines

### `raw_market_news_collector.py`

Generische Woche-1-Rohdaten-Foundation fuer `Markets + News`.

- sammelt Markt- und Feed-Rohdaten
- normalisiert Batch-Items fuer `raw-ingest`
- schreibt nach `raw_ingest_runs` und `raw_ingest_items`
- bleibt ein one-shot Lauf ohne Dauerprozess

### `local_llm_enrichment_worker.py`

Generische Woche-2-Veredelung fuer die Raw-Gold-Trennung.

- liest `raw_ingest_items` mit `analysis_status = pending`
- claimt Raw-Items einzeln fuer robuste Retries
- nutzt die formale Bridge unter `bridges/local_llm/`
- schreibt validierte Gold-Datensaetze nach `gold_enrichment_items`
- markiert Raw-Status auf `completed` oder `failed`

### `market_sentiment_fetcher.py`

Bestehender operativer Vertical Slice fuer Saeule 3.

- bleibt parallel zur generischen Woche-1-/Woche-2-Foundation bestehen
- ist kein Ersatz fuer die generische Bronze/Gold-Architektur

### `day_zero_autopilot.ps1`

Reiner Woche-4-Autopilot fuer lokalen Windows-Betrieb.

- setzt das Working Directory auf `scripts/pipelines/`
- nutzt `venv\Scripts\python.exe`, falls vorhanden, sonst globales `python`
- prueft `.env`
- startet zuerst `raw_market_news_collector.py`
- startet danach `local_llm_enrichment_worker.py --limit <N>`, wenn der Collector mit `0` oder `2` endet
- schreibt pro Lauf ein Log nach `scripts/pipelines/logs/`

Manueller Lauf:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/pipelines/day_zero_autopilot.ps1
```

Windows-Startup-Verknuepfung installieren:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/pipelines/create_startup_shortcut.ps1
```

Das Setup legt `MBRN_Autopilot.lnk` direkt im Windows-Startup-Ordner an:

```text
C:\Users\Erik\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup
```

Der Autopilot laeuft genau einmal beim Windows-Login. Es gibt keinen 20-Minuten-Loop.

### `pipeline_utils.py`

Gemeinsame Utilities fuer:

- `save_json_atomic()`
- `SupabaseUplink`
- `RetryHandler`
- `CircuitBreaker`
- `PipelineCache`
- `OllamaEnricher`
- JSON-Hardening und Feed-Parsing

## Supabase-Ziel

Week 1 + Week 2 laufen jetzt ueber getrennte Schichten:

- Bronze/Raw:
  - `raw_ingest_runs`
  - `raw_ingest_items`
- Gold:
  - `gold_enrichment_items`

Rohdaten bleiben intern. Woche 3 soll spaeter nur aus der Gold-Schicht lesen.

## Betriebsnotizen

- `raw_market_news_collector.py`:
  - Exit Code `0` bei Erfolg
  - Exit Code `2` bei Teilfehlern
  - Exit Code `1` bei komplettem Fehlschlag
- `local_llm_enrichment_worker.py`:
  - Exit Code `0` bei Erfolg
  - Exit Code `2` bei Teilfehlern
  - Exit Code `1` bei komplettem Fehlschlag
- `day_zero_autopilot.ps1`:
  - Exit Code `0` wenn Collector und LLM-Worker erfolgreich laufen
  - Exit Code `2` wenn mindestens ein verwertbarer Teilschritt Teilfehler meldet
  - Exit Code `1` bei hartem Setup-, Collector- oder LLM-Fehler
- lokale Ollama-Verarbeitung bleibt GPU-geschuetzt ueber die vorhandenen Guards in `pipeline_utils.py`
- Ollama muss vor oder kurz nach dem Windows-Login verfuegbar sein, wenn der LLM-Worker direkt Daten veredeln soll

## Week-4-Grenze

Der Day-Zero-Autopilot veraendert keine Website- oder Commerce-Funktion.

- kein Stripe-Checkout
- keine Webhook-Aenderung
- keine Paywall
- kein Premium-Gating
- keine Blur-Effekte
- keine Aenderung an `gold_dashboard_items`

## Status

**Pipeline-Version:** `1.2.x`
**Status:** `operativ mit generischer Bronze/Gold-Foundation und lokalem Day-Zero-Autopilot`
**Naechste offene Ebene:** Produktivhaertung ausserhalb der 4-Wochen-Foundation
