# /pillars/oracle/browser_read/

**Status:** ACTIVE

Diese Zone ist die aktive Browser-Leseschicht des Oracle-Pillars.

## Aktive Verantwortung

- Oracle-Snapshots per `fetch()` lesen
- Snapshot-Schema validieren
- `bridgeResultContract` liefern

## Aktives Modul

- `snapshot_reader.js`

## Architekturgrenze

Diese Zone ist bewusst nur **Browser-Read**.

Nicht hier:

- Heavy-Processing
- Modellberechnung
- Backtesting-Ausführung
- Datenfusion

Diese operative Substanz lebt aktuell weiter unter:

- `scripts/oracle/`
- `scripts/pipelines/`
