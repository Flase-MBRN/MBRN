# /pillars/frontend_os/dimension_views/

**Status:** ACTIVE

Diese Zone stellt die aktiven Dimensions-Einstiege des Frontend OS bereit.

Aktive Runtime-Views:

- `growth_view.js`
- `pattern_view.js`
- `time_view.js`
- `signal_view.js`

`index.js` loest `dimensionId` eindeutig auf die passende View auf. Die Views bleiben business-blind und konsumieren nur Registry-, Application- und UI-Daten.
