# /bridges/python/

**Status:** ACTIVE

Dieser Ordner bleibt die technische Browser-Brücke zu lokal erzeugten Python-Artefakten.

## Aktive Verantwortung

- Lesen von lokalen Snapshot-Dateien
- standardisierte Rückgaben über `bridgeResultContract`
- kein Heavy-Processing in der Browser-Runtime

## Aktive Module

- `market_sentiment_reader.js`

## Wichtige Architekturgrenze

Oracle-Snapshots werden in der dauerhaften Plattformstruktur nicht aus diesem Ordner gelesen, sondern aus:

- `pillars/oracle/browser_read/snapshot_reader.js`

Die operative Python-Substanz fuer Oracle wird fachlich unter dem Oracle-Pillar gesteuert und nur noch ueber duenne Worker-Huellen gestartet:

- `pillars/oracle/processing/python/`
- `scripts/oracle/`
- `scripts/pipelines/`

## Nicht die Aufgabe dieser Zone

- keine UI-Komposition
- keine Businesslogik
- keine AI-Berechnung im Browser
