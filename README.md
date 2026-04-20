# MBRN Hub v1.1

Core, Data Arbitrage und Oracle-Vertical-Slice.

MBRN Hub ist ein modulares System, das im Browser leicht bleibt, im Core deterministisch arbeitet und lokal durch Python, Ollama und datengetriebene Worker erweitert wird. Der aktive Kern ist kein Prototyp mehr, sondern ein operativer Vertical Slice zwischen Säule 3 und Säule 4.

## Architektur

MBRN Hub ist um vier Säulen organisiert:

1. **Vanilla-JS-App-Layer**
   Reine ES-Module für Landing, Dashboard und modulare Apps ohne Framework-Lock-in.

2. **Headless Core Logic**
   Geschäftslogik, Orchestrierung, State, Storage und numerologische Engines leben in `shared/core/` und bleiben außerhalb des DOM testbar.

3. **Data Arbitrage**
   Python-Worker unter `scripts/pipelines/` sammeln Marktdaten, Krypto-Druck und RSS-News, härten externe Quellen ab und reichern lokal mit Ollama/Llama 3.1 an.

4. **Ecosystem / Oracle**
   Das Dashboard und `scripts/oracle/` verbinden numerologische Tageswerte mit Markt- und News-Signalen, erzeugen Prognosen und spiegeln die Ergebnisse in `shared/data/`.

## Aktueller Systemstand

### Headless Core

Der Core ist auf Trennung zwischen UI und Logik ausgelegt:

- orchestrierte Entry-Points statt Wildwuchs
- Browser-Guards an den Stellen, an denen Runtime-Zugriff nötig ist
- testbare Pure Functions in den Engine-Modulen
- Shared Storage- und State-Layer für Dashboard und Apps

### Observatory UI

Das aktive Frontend folgt dem Observatory-/MBRN-OS-Stil:

- Void-first Dark Surface
- Glassmorphism-Karten mit kontrollierten Glow-Akzenten
- direkte Tool-Einstiege ohne Framework-Build
- mobile Navigation mit Sidebar-/Hamburger-Muster

### Data Arbitrage

Die Pipeline-Schicht ist operativ:

- `market_sentiment_fetcher.py` zieht `SPY`, `QQQ`, `DIA`, `IWM`, `^VIX`, `BTC-USD` und `ETH-USD`
- RSS-Feeds kommen aus Reuters, CNBC und Google News Fallbacks
- JSON-Hardening für Ollama-Ausgaben läuft über `pipeline_utils.py`
- alle JSON-Schreibvorgänge nutzen `save_json_atomic()`
- Market-Sentiment wird nach `AI/models/data/` und `shared/data/market_sentiment.json` gespiegelt

### Oracle

Das Oracle-Modul ist nicht mehr Vorbereitung, sondern produktiv nutzbar:

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

MBRN Hub v1.1 ist ein operativer Kern mit echtem Vertical Slice:

- Browser-UI für den Nutzer
- lokaler Daten- und LLM-Stack für Anreicherung
- Oracle als System-Brücke zwischen Numerologie und Markt
- dokumentierte Phase-6.0-Blocker statt verdrängter Restschuld
