# /pillars/oracle/backtesting/

**Status:** ACTIVE

Diese Zone bildet die JS-Consumption-Wahrheit fuer zusammengefasste Backtesting-Ergebnisse.

## Verantwortung

- historische Auswertungen in eine stabile Summary-Form ueberfuehren
- Accuracy, Trefferquote und letzte Evaluation fuer Read-Models bereitstellen
- Backtesting-Artefakte ueber die kanonische Artefakt-Wahrheit lesen

## Grenze

- keine historische Simulation im JS-Pillar
- keine operative Evaluations-Pipeline
- die eigentliche Backfill-Erzeugung bleibt in `scripts/oracle/*`
