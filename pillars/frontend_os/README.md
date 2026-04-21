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
- `dimension_views/`
- `export_entrypoints/`

## Physische Surface-Wahrheit

Die eigentliche Surface-Komposition fuer die stabilen Route-Einstiege und OS-Einstiege lebt unter:

- `app_surfaces/`
- `dimension_views/`
- `export_entrypoints/`

- `dashboard/render_dashboard.js`
- `apps/finance/render.js`
- `apps/numerology/render.js`
- `apps/chronos/render.js`
- `apps/synergy/render.js`

Diese Dateien bleiben nur als duenne Bootstraps erhalten, damit die oeffentlichen Routen stabil bleiben.

## Boundary-Regel

`frontend_os` konsumiert keine Bridges, kein Commerce, keine rohen Fach-Pillars und keine direkte Core-Fachlogik.

Alle aktiven Surface-Zonen konsumieren nur:

- `shared/application/*`
- `shared/core/registries/*`
- rein lesende `shared/core/contracts/*`
- `shared/ui/*`

Verboten sind direkte Runtime-Imports aus:

- `bridges/*`
- `commerce/*`
- `pillars/oracle/*`
- `pillars/monetization/*`
- `shared/core/logic/*`
- `shared/core/state/*`
- `shared/core/storage/*`
- `shared/core/i18n.js`

## OS-Faehigkeiten

- `app_surfaces/` ist die einzige physische Zone fuer App-Surface-Komposition.
- `dimension_views/` stellt echte Dimensions-Einstiege fuer `growth`, `pattern`, `time` und `signal`.
- `export_entrypoints/` buendelt die heute realen Share-, Asset- und PDF-Exporte.
- `surface_catalog.js` und `surface_router.js` halten Discoverability und Surface-Aufloesung kompositorisch im Pillar.
- der Produktstrom `Landing -> Kernflaeche -> Dashboard -> naechste relevante Flaeche` bleibt ueber Discoverability-Modelle und Surface-Flow-Hilfen explizit.
