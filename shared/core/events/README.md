# /shared/core/events/

**Status: RESERVIERT (YAGNI)**

Dieser Ordner ist bewusst leer und als zukünftige Zielzone markiert.

## Zweck (geplant)

Erweitertes Event-Bus-System auf Core-Ebene. Der aktuelle `StateManager` in `shared/core/state/index.js` deckt das Pub/Sub-Pattern bereits ab.

## Warum leer?

YAGNI-Prinzip: Der bestehende StateManager ist ausreichend für:
- Component-to-Component Communication
- Cross-Pillar Events
- UI State Changes

## Wann wird befüllt?

- Wenn komplexere Event-Patterns benötigt werden (z.B. Event-Sourcing, Replay, Audit-Trail)
- Wenn der StateManager zu viel Verantwortung übernimmt

## Verboten

- Keine DOM-Events (sind UI-Layer)
- Keine Business-Workflow-Events (sind Application-Layer)
