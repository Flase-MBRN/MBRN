# /pillars/frontend_os/ - Frontend OS

**Status:** ACTIVE

Dieses Pillar ist die einzige aktive Surface-Kompositionszone.

## Aktive Capabilities

- `shell/`
- `navigation/`
- `dashboard/`
- `cards/`
- `ui_states/`

## Bewusst reserviert

- `app_surfaces/`
- `dimension_views/`
- `export_entrypoints/`

Diese Zonen bleiben markiert und werden nicht kuenstlich mit Dummy-Logik befuellt.

## Boundary-Regel

`frontend_os` konsumiert nur:

- `shared/application/*`
- `shared/core/registries/*`
- rein lesende `shared/core/contracts/*`
- `shared/ui/*`

Verboten sind direkte Runtime-Imports aus:

- `bridges/*`
- `commerce/*`
- `pillars/oracle/*`
- `pillars/monetization/*`
