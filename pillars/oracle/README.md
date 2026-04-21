# /pillars/oracle/

**Status:** IMPLEMENTED / OPERATIVE ENGINE

Dieses Pillar ist die fachliche JS-Runtime-, Consumption- und Verarbeitungs-Wahrheit fuer Oracle-Daten in Browser-, Application- und operativer Pipeline-Steuerung.

Der Reifegrad bleibt bewusst vorsichtig formuliert: operative Engine, aber keine fertig standardisierte Endstufe.

## Aktive Runtime-Capabilities

- `browser_read/`
- `processing/`
- `signals/`
- `fusion/`
- `snapshots/`
- `backtesting/`

## Ownership-Modell

- `processing/` ist der fachliche Steuerraum fuer Oracle
- `python/` unter `processing/` enthaelt die pillar-owned Python-Substanz
- `scripts/oracle/*` bleibt nur noch duenne CLI-/Worker-Huelle fuer dieselbe Pillar-Logik
- `artifacts.js` ist die kanonische Artefakt-Wahrheit fuer Prediction-, Backtest- und interne Merge-Artefakte

## Harte Grenze

- `bridges/python/*` bleibt technische IO-Bruecke
- UI liest nur ueber `shared/application/read_models/*`
- UI-relevante Oracle-Outputs muessen am `oracleSnapshotContract` haengen
- `scripts/oracle/*` ist keine zweite fachliche Oracle-Wahrheit

## Marker-Wahrheit

Oracle-Unterzonen mit aktivem Code oder aktiver Orchestrierung werden nicht als `NOT_IMPLEMENTED` markiert.

- aktive Zonen tragen `README.md`
- `processing/` ist bewusst als aktive Orchestrierung dokumentiert
- der operative Heavy-Processing-Stack bleibt Python-basiert, aber nicht mehr ausserhalb des Pillars fachlich definiert
