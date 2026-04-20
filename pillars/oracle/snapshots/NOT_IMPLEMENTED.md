# /pillars/oracle/snapshots/ - NOT IMPLEMENTED

**Status:** RESERVED / NOT YET IMPLEMENTED

## Geplanter Zweck

Snapshot-Management und -Versionierung.

- Snapshot-Metadaten-Verwaltung
- Versionierung und Historisierung
- Snapshot-Lifecycle (Retention, Archivierung)
- Konsistenzprüfung und -reparatur

## Warum leer?

YAGNI-Prinzip: Aktuell werden Snapshots direkt von der Python-Pipeline in `AI/models/snapshots/` geschrieben und vom Browser-Read-Layer gelesen.

Dediziertes Snapshot-Management wird erst relevant bei:
- Mehreren Snapshot-Typen (Hourly, Daily, Weekly)
- Snapshot-Retention-Policies
- Archivierung alter Vorhersagen
- Snapshot-Konsistenz-Checks
- Multi-Version-Concurrency

## Aktueller Snapshot-Speicher

**Extern:** `AI/models/snapshots/oracle_prediction_*.json`

## Wann implementiert?

Trigger-Bedingungen:
- When Snapshot-Historisierung über Tage/Wochen notwendig wird
- Bei Snapshot-Retention-Policy-Implementierung
- Wenn mehrere Vorhersage-Zyklen (Hourly/Daily) parallel laufen
- Bei Bedarf an Snapshot-Archivierung

## Verhindern von Verwechslung

**Dieser Ordner ist KEIN Versehen.**

Er ist reserviert für zukünftige Snapshot-Management-Funktionalität. Nicht löschen, nicht mit Fake-Code füllen.

---

**Marker-Standard:** NOT_IMPLEMENTED.md = Bewusst reserviert, noch nicht umgesetzt.
