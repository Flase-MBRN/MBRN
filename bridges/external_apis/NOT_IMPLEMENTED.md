# /bridges/external_apis/ - NOT IMPLEMENTED

**Status:** RESERVED / NOT YET IMPLEMENTED

## Geplanter Zweck

Integration externer APIs für Datenanreicherung und Validierung.

- Yahoo Finance (Echtzeit-Kursdaten, historische Daten)
- Alternative Datenquellen (Sentiment-Analyse, News-Feeds)
- Drittanbieter-Oracle-Services (externe Vorhersagemodelle)
- Marktdaten-Validierung für Finance-Pillar

## Warum leer?

YAGNI-Prinzip: Aktuell nur interne Python-Pipeline für Oracle-Snapshots.

Externe APIs erst relevant bei:
- Echtzeit-Marktdaten (spätere Phase)
- Multi-Source-Validierung (Datenquellen-Abgleich)
- Automatische Datenaktualisierung (nicht manuelle Snapshots)

## Wann implementiert?

Trigger-Bedingungen:
- Nach stable Oracle-Pipeline (Phase 4 abgeschlossen)
- Bei Bedarf an externer Datenanreicherung
- Wenn Automatisierung der Finanzdaten notwendig wird
- Wenn Multi-Source-Validierung für Oracle-Vorhersagen benötigt wird

## Verhindern von Verwechslung

**Dieser Ordner ist KEIN Versehen.**

Er ist reserviert für zukünftige externe API-Integration. Nicht löschen, nicht mit Fake-Code füllen.

---

**Marker-Standard:** NOT_IMPLEMENTED.md = Bewusst reserviert, noch nicht umgesetzt.
