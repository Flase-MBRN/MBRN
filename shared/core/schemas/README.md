# /shared/core/schemas/

**Status: RESERVIERT (YAGNI)**

Dieser Ordner ist bewusst leer und als zukünftige Zielzone markiert.

## Zweck (geplant)

Zentrale JSON-Schema-Registry für Validierung auf Core-Ebene. Aktuell sind Validierungen verteilt:
- `shared/core/validators.js` (Input-Validierung)
- `shared/core/config/index.js` (Konfigurations-Constraints)

## Warum leer?

YAGNI-Prinzip: Die aktuelle Validator-Struktur reicht für:
- Datum-Validierung
- E-Mail-Validierung
- Konfigurations-Grenzwerte

## Wann wird befüllt?

- Wenn JSON-Schema-Validierung für API-Contracts benötigt wird
- Wenn Schemas versioniert und referenziert werden müssen
- Wenn Runtime-Validierung gegen zentrale Schemas notwendig ist

## Verboten

- Keine UI-Form-Schemas (sind Pillar/Frontend)
- Keine Business-Regeln (sind Application-Layer)
