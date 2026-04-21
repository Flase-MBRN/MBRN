# /pillars/frontend_os/export_entrypoints/

**Status:** ACTIVE

Diese Zone buendelt die aktiven Export-Einstiege des Frontend OS.

Aktive Runtime-Einstiege:

- `asset_export_entry.js`
- `pdf_export_entry.js`
- `share_export_entry.js`

Die Zone orchestriert nur Export-UI, Share-/Download-Einstiege und Application-Aufrufe. Die fachliche Erzeugung bleibt ausserhalb von `frontend_os`.
