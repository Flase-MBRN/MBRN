# /shared/core/orchestration/

**Status: RESERVIERT (YAGNI)**

Dieser Ordner ist bewusst leer und als zukünftige Zielzone markiert.

## Zweck (geplant)

Workflow-Engine und Prozess-Orchestrierung auf Core-Ebene. Aktuell ist Orchestrierung in `shared/application/actions.js` untergebracht.

## Warum leer?

YAGNI-Prinzip: Die aktuelle Application-Layer-Orchestrierung reicht für:
- Cross-Pillar Actions
- Sync/Async Koordination
- State-Storage-Koordination

## Wann wird befüllt?

- Wenn komplexe Workflows mit Zuständen (Pending, Running, Failed, Retry) benötigt werden
- Wenn `shared/application/actions.js` über 500 Zeilen erreicht
- Wenn Workflow-Definitionen deklarativ statt imperativ werden sollen

## Verboten

- Keine Business-Logik
- Keine Pillar-spezifischen Workflows
