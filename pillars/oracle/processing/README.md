# /pillars/oracle/processing/

**Status:** ADAPTER MANIFEST

Diese Zone ist bewusst keine JS-Heavy-Processing-Engine. Sie beschreibt die operative Oracle-Pipeline, die dauerhaft unter `scripts/oracle/*` lebt.

## Verantwortung

- die bekannten Oracle-Processing-Jobs als Manifest offenlegen
- Artefakt-Outputs an die JS-Wahrheit unter `artifacts.js` anbinden
- den dauerhaften Split zwischen Pipeline und Browser-/Application-Consumption dokumentieren

## Grenze

- kein In-Browser-Heavy-Processing
- keine zweite Pipeline-Implementierung in JavaScript
- `sourceOfTruth` bleibt fuer diese Zone `scripts/oracle/*`
