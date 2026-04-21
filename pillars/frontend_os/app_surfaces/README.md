# /pillars/frontend_os/app_surfaces/

**Status:** ACTIVE

Diese Zone ist die physische Surface-Kompositionsmitte fuer die stabilen App- und Dashboard-Routen.

## Aktive Surface-Module

- `dashboard_surface.js`
- `finance_surface.js`
- `numerology_surface.js`
- `chronos_surface.js`
- `synergy_surface.js`

## Routing-Regel

Die oeffentlichen Einstiege bleiben stabil:

- `dashboard/render_dashboard.js`
- `apps/finance/render.js`
- `apps/numerology/render.js`
- `apps/chronos/render.js`
- `apps/synergy/render.js`

Diese Dateien enthalten aber keine eigentliche Surface-Komposition mehr, sondern nur noch duenne Re-Exports auf diese Zone.
