# /pillars/frontend_os/ - Frontend OS

**Status:** ACTIVE

Dieses Pillar ist die einzige aktive Surface-Kompositionszone.

## Aktive Capabilities

- `shell/`
- `navigation/`
- `dashboard/`
- `cards/`
- `ui_states/`
- `app_surfaces/`

## Bewusst reserviert

- `dimension_views/`
- `export_entrypoints/`

Diese Zonen bleiben markiert und werden nicht kuenstlich mit Dummy-Logik befuellt.

## Physische Surface-Wahrheit

Die eigentliche Surface-Komposition fuer die stabilen Route-Einstiege lebt unter `app_surfaces/`.

- `dashboard/render_dashboard.js`
- `apps/finance/render.js`
- `apps/numerology/render.js`
- `apps/chronos/render.js`

Diese Dateien bleiben nur als duenne Bootstraps erhalten, damit die oeffentlichen Routen stabil bleiben.

## Boundary-Regel

`frontend_os` konsumiert keine Bridges, kein Commerce und keine rohen Fach-Pillars.

Die aktiven Surface-Zonen `shell/`, `navigation/`, `dashboard/`, `cards/` und `ui_states/` konsumieren nur:

- `shared/application/*`
- `shared/core/registries/*`
- rein lesende `shared/core/contracts/*`
- `shared/ui/*`

Die physische App-Surface-Zone `app_surfaces/` darf fuer die stabilen Legacy-Routen zusaetzlich app-nahe Core-Bausteine konsumieren:

- `shared/core/state/*`
- `shared/core/storage/*`
- `shared/core/logic/*`
- `shared/core/i18n.js`

Verboten sind direkte Runtime-Imports aus:

- `bridges/*`
- `commerce/*`
- `pillars/oracle/*`
- `pillars/monetization/*`
