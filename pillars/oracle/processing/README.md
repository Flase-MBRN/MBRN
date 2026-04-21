# /pillars/oracle/processing/

**Status:** ACTIVE ORCHESTRATION

Diese Zone ist der fachliche Steuerraum der Oracle-Pipeline.

## Verantwortung

- Oracle-owned Ingestion fuer Markt-/Sentiment- und Numerologie-Inputs
- Prediction-Orchestrierung
- Snapshot- und Artefakt-Schreiben
- Backfill- und Replay-Orchestrierung
- Koordination der Python-Worker unter Pillar-Ownership

## Runtime-Modell

- `index.js` ist die oeffentliche Processing-API
- `python_worker.js` startet die duennen CLI-/Worker-Huellen unter `scripts/oracle/*`
- `python/` enthaelt die pillar-owned Python-Substanz fuer Prediction, Ingestion, Korrelation und Backfill

## Grenze

- kein In-Browser-Heavy-Processing
- keine zweite fachliche Wahrheit unter `scripts/oracle/*`
- `shared/application/*` konsumiert Oracle weiter nur ueber die aktiven Pillar-Outputs
