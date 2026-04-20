# MBRN Hub v1.1

Core, Data Arbitrage und Oracle-Vertical-Slice.

MBRN Hub ist ein modulares System, das im Browser leicht bleibt, im Core deterministisch arbeitet und lokal durch Python, Ollama und datengetriebene Worker erweitert wird. Der aktive Kern ist kein Prototyp mehr, sondern ein operativer Vertical Slice zwischen Säule 3 und Säule 4.

## Architektur

MBRN Hub ist jetzt um einen klaren Kern mit getrennten Runtime-Zonen organisiert:

1. **Headless Core**
   `shared/core/` enthält nur Contracts, Registries, State, Config, Storage, Legal und pure Logik. Keine externe IO lebt dauerhaft im Core.

2. **Application Layer**
   `shared/application/` trägt Auth-, Sync-, Checkout-, Observability- und Read-Model-Orchestrierung zwischen Core, Bridges, Commerce und Oberflächen.

3. **Bridges / Commerce**
   `bridges/*` kapselt technische IO zu Supabase, Python-Mirrors, lokalen Modellen und externen APIs. `commerce/*` kapselt Provider-Technik wie Stripe.

4. **Pillars / Frontend OS**
   `pillars/*` trennt `meta_generator`, `monetization`, `oracle` und `frontend_os`. Dimensions bleiben thematische Türen, Apps bleiben konkrete Werkzeuge.

## Aktueller Systemstand

### Headless Core

Der Core ist jetzt die IO-freie Mitte:

- pure Logik, Contracts und Registries
- Shared Storage- und State-Layer
- keine Supabase-, Stripe- oder sonstige Provider-Implementierung
- keine Frontend-OS- oder Surface-Abhängigkeit

### Frontend OS

Das aktive Frontend folgt dem Observatory-/MBRN-OS-Stil und ist auf Surface-Komposition reduziert:

- Void-first Dark Surface
- Glassmorphism-Karten mit kontrollierten Glow-Akzenten
- direkte Tool-Einstiege ohne Framework-Build
- Navigation, Shell, Dashboard- und Legal-Surfaces in `pillars/frontend_os/`

### Data Arbitrage

Die Pipeline-Schicht ist operativ:

- `market_sentiment_fetcher.py` zieht `SPY`, `QQQ`, `DIA`, `IWM`, `^VIX`, `BTC-USD` und `ETH-USD`
- RSS-Feeds kommen aus Reuters, CNBC und Google News Fallbacks
- JSON-Hardening für Ollama-Ausgaben läuft über `pipeline_utils.py`
- alle JSON-Schreibvorgänge nutzen `save_json_atomic()`
- Market-Sentiment wird nach `AI/models/data/` und `shared/data/market_sentiment.json` gespiegelt

### Oracle

Das Oracle-Modul bleibt produktiv nutzbar, aber die Oberfläche liest nur normalisierte Read-Models:

- `oracle_core.py` baut Prognosen für den nächsten Handelstag
- `oracle_backtest.json` speichert die laufende Trefferhistorie
- `oracle_prediction.json` wird als Shared Mirror für das Dashboard atomar geschrieben
- Backfill über `scripts/oracle/backfill_history.py` erzeugt historische Trainingsbasis
- Bias-Warnungen bei überhöhter Accuracy bleiben intern und verändern das Schema nicht

## Produktmodule

Aktive Oberflächen:

- `dashboard/`
- `apps/numerology/`
- `apps/finance/`
- `apps/chronos/`
- `apps/synergy/` als noch nicht finalisierter Ausbaupfad

Offene Vorbedingungen vor Phase 6.0:

- `apps/tuning/` fehlt noch
- Synergy ist noch nicht als eigenständige Voll-App finalisiert
- der Template-Layer ist mit `templates/app_blueprint.json` noch zu schmal

## Engineering Posture

Dieses Repo priorisiert Wahrheit vor Zierde:

- aktive Dokumentation statt Archivballast
- relative Projektpfade statt lokale Sonderwege
- lokale AI-/Datenverarbeitung vor kostenpflichtigen APIs
- strukturierte Returns und atomische File-Writes
- No-Build-Architektur für Production-Code

## Repository Hygiene

Der aktive Markdown-Kern umfasst aktuell `18` Dokumente. Historische Vaults wurden aus dem Live-Repo entfernt und extern nach `C:\DevLab_Archive\MBRN-HUB-V1_docs_archive_20260419_205331` gesichert.

Machine-generated Daten bleiben Artefakte und keine Primärquellen für Produktlogik:

- `shared/data/market_sentiment.json`
- `shared/data/oracle_prediction.json`
- `shared/data/oracle_backtest.json`
- `AI/models/data/*.json`

## Status

MBRN Hub v1.1 läuft jetzt mit core-zentrierter Zielarchitektur v3:

- `shared/core` als IO-freie Mitte
- `shared/application` als Cross-Pillar-Orchestrierung
- `bridges/*` und `commerce/*` als technische Außenhaut
- `frontend_os` als einzig aktive Surface-Komposition
