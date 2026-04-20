# /pillars/oracle/browser_read/ - Oracle Browser Read Layer

**Status:** ACTIVE

## Zweck

Browser-seitiges Lesen von Oracle-Daten aus lokalen Snapshots.
Dies ist die Schnittstelle zwischen der Python-Datenpipeline und der Frontend-Visualisierung.

## Komponenten

### snapshot_reader.js
**Export:** `readOracleSnapshot(snapshotUrl)`
**Returns:** `BridgeResultContract` - `{ success, data?, error?, source, meta }`

Liest Oracle-Vorhersagen aus JSON-Dateien und validiert sie gegen das Oracle-Snapshot-Schema.

## Datenfluss

```
┌─────────────────────────────────────────────────────────┐
│              PYTHON PIPELINE (GPU - RX 7700 XT)        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  /scripts/pipelines/oracle_*.py                  │ │
│  │  - Kursdaten-Analyse                              │ │
│  │  - Muster-Erkennung                               │ │
│  │  - Vorhersage-Generierung                         │ │
│  └──────────────┬─────────────────────────────────────┘ │
│                 │ writes                               │
│                 ▼                                      │
│  ┌──────────────────────────────────────────────────┐ │
│  │  AI/models/snapshots/oracle_snapshot.json        │ │
│  └──────────────┬─────────────────────────────────────┘ │
└─────────────────┼───────────────────────────────────────┘
                  │ reads via fetch()
                  ▼
┌─────────────────────────────────────────────────────────┐
│              BROWSER (Frontend)                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  pillars/oracle/browser_read/snapshot_reader.js │  │
│  │  - fetch() mit Cache-Busting                     │  │
│  │  - Schema-Validierung                            │  │
│  │  - BridgeResultContract                          │  │
│  └──────────────┬───────────────────────────────────┘  │
│                 │ returns                             │
│                 ▼                                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │  shared/application/read_models/oracle_dashboard.js│  │
│  │  apps/finance/components/                        │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Trennung der Verantwortung

| Layer | Aufgabe | Nicht zuständig für |
|-------|---------|---------------------|
| Browser-Read | Datenabfrage, Validierung, Caching | Processing, AI, Daten-Generierung |
| Python-Pipeline | Heavy Processing, Kursanalyse, AI | UI-Rendering, State-Management |
| Snapshots | Persistenz, Zeitstempel, Versionierung | Business-Logic |

## Fehlerbehandlung

Alle Fehler werden durch `BridgeResultContract` standardisiert:

```js
// Erfolg
{ success: true, data: {...}, error: null, source: 'oracle.browser_read.snapshot', meta: {} }

// HTTP-Fehler
{ success: false, error: 'HTTP 404', source: 'oracle.browser_read.snapshot', meta: { statusCode: 404 } }

// Validierungsfehler
{ success: false, error: 'Missing required field: prediction', source: 'oracle.browser_read.snapshot' }

// Netzwerkfehler
{ success: false, error: 'Failed to fetch', source: 'oracle.browser_read.snapshot' }
```

## Verwendung

```javascript
import { readOracleSnapshot } from '../../../pillars/oracle/browser_read/snapshot_reader.js';

const result = await readOracleSnapshot();
if (result.success) {
  renderPrediction(result.data);
} else {
  showError(result.error);
}
```

## Migration-Hinweis

**Vorher:** `bridges/python/oracle_snapshot_reader.js`  
**Nachher:** `pillars/oracle/browser_read/snapshot_reader.js`

Import-Pfade aktualisieren:
- `../../shared/core/contracts/` → `../../../shared/core/contracts/`
- Snapshot-Default-Pfad: `../shared/data/` → `../../shared/data/`

---

**Hinweis:** Dieser Ordner ist aktiv und Teil der Runtime. Keine Fake-Dateien.
