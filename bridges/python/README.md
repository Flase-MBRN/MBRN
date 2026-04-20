# /bridges/python/ - Python Pipeline Bridge

**Status:** ACTIVE (Oracle Snapshot Reader)

## Zweck

Lese- und Schreibzugriff auf Oracle-Daten aus der Python-Datenpipeline.
Dies ist die Brücke zwischen der JavaScript-Frontend-Welt und der Python-Datenverarbeitung.

## Architektur

```
┌─────────────────────────────────────────────────────────┐
│                    BROWSER (Frontend)                    │
│  ┌────────────────────────────────────────────────────┐  │
│  │  shared/application/read_models/oracle_dashboard.js │  │
│  └──────────────────┬─────────────────────────────────┘  │
│                     │                                     │
│  ┌──────────────────▼─────────────────────────────────┐  │
│  │     bridges/python/oracle_snapshot_reader.js      │◄─┼── Browser-Read
│  └──────────────────┬─────────────────────────────────┘  │
└─────────────────────┼───────────────────────────────────┘
                      │
                      │ reads snapshot files
                      ▼
┌─────────────────────────────────────────────────────────┐
│                 PYTHON PIPELINE (RX 7700 XT)          │
│  ┌────────────────────────────────────────────────────┐  │
│  │         /scripts/pipelines/oracle_*.py              │  │
│  │  - Heavy AI processing                             │  │
│  │  - Pattern recognition                             │  │
│  │  - Data enrichment                                 │  │
│  └──────────────────┬─────────────────────────────────┘  │
│                     │ writes                              │
│                     ▼                                     │
│  ┌────────────────────────────────────────────────────┐  │
│  │      AI/models/snapshots/oracle_snapshot.json    │  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Komponenten

### 1. oracle_snapshot_reader.js
**Zweck:** Liest Oracle-Snapshots aus lokalen JSON-Dateien.
**Interface:** `readOracleSnapshot()` → `{ success, data?, error? }`
**Verwendet:** `bridgeResultContract` für konsistente Returns.

### 2. market_sentiment_reader.js
**Zweck:** Liest Market-Sentiment-Daten (Kursdaten + Stimmungsanalyse).
**Interface:** `readMarketSentimentSnapshot()` → `{ success, data?, error? }`
**Fallback:** Lokale JSON-Dateien wenn Supabase offline.

### 3. Read Models (Consumer)
- `shared/application/read_models/oracle_dashboard.js` - Dashboard-Integration
- `shared/application/read_models/market_sentiment.js` - Sentiment-Anzeige

## Datenfluss

1. **Python-Pipeline** (GPU auf RX 7700 XT) verarbeitet Daten
2. **Schreibt** Ergebnisse in `AI/models/snapshots/*.json`
3. **Browser** liest via `oracle_snapshot_reader.js`
4. **Validation** via `shared/core/contracts/oracle_snapshot.js`

## Trennung der Verantwortung

| Layer | Aufgabe | Nicht zuständig für |
|-------|---------|---------------------|
| Browser-Read | Datenabfrage, Caching | Processing, AI |
| Python-Pipeline | Heavy Processing, AI | UI, State Management |
| Snapshots | Persistenz | Business Logic |

## BridgeResultContract

Alle Funktionen in diesem Ordner nutzen den `bridgeResultContract`:

```js
import { createBridgeSuccess, createBridgeFailure } from '../../shared/core/contracts/bridge_result.js';

// Success
return createBridgeSuccess('python.oracle', data);

// Failure
return createBridgeFailure('python.oracle', error.message);
```

## Fehlerbehandlung

- **Snapshot nicht gefunden:** `{ success: false, error: 'Snapshot not found' }`
- **Parse-Fehler:** `{ success: false, error: 'Invalid JSON in snapshot' }`
- **File nicht lesbar:** `{ success: false, error: 'Permission denied' }`

Alle Fehler werden durch `bridgeResultContract` standardisiert.

---

**Hinweis:** Dieser Ordner ist Teil der aktiven Runtime. Keine Fake-Dateien.
