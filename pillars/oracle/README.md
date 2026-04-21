# /pillars/oracle/

**Status:** ACTIVE WITH DURABLE PIPELINE SPLIT

Dieses Pillar ist die fachliche JS-Runtime- und Consumption-Wahrheit fuer Oracle-Daten in Browser- und Application-Consumption.

## Aktive Runtime-Capabilities

- `browser_read/`
- `signals/`
- `fusion/`
- `snapshots/`
- `backtesting/`

## Adapter- und Pipeline-Zone

- `processing/` bildet den dauerhaften Manifest- und Adapter-Einstieg fuer die operative Pipeline
- die eigentliche Rechen- und Pipeline-Substanz lebt gewollt weiter unter `scripts/oracle/`
- `artifacts.js` ist die kanonische JS-Wahrheit fuer die konsumierten Snapshot-Artefakte

## Harte Grenze

- `bridges/python/*` bleibt technische IO-Bruecke
- UI liest nur ueber `shared/application/read_models/*`
- UI-relevante Oracle-Outputs muessen am `oracleSnapshotContract` haengen
- `scripts/oracle/*` produziert operative Artefakte, ist aber keine JS-Consumption-Quelle

## Marker-Wahrheit

Oracle-Unterzonen mit aktivem Code oder aktivem Adapter-Manifest werden nicht mehr als `NOT_IMPLEMENTED` markiert.

- aktive JS-Zonen tragen `README.md`
- `processing/` ist bewusst als `ADAPTER MANIFEST` dokumentiert
- reservierte Oracle-Zonen ohne Runtime-Substanz waeren separat zu markieren, existieren im aktuellen Pillar aber nicht
