# M15 — Chronos Engine v2

> **System:** MBRN-HUB-V1  
> **Pillar:** P1 (Logic) — Unified Temporal Analysis  
> **Module:** `shared/core/logic/chronos_v2.js`  
> **Date:** 18.04.2026  
> **Status:** ✅ IMPLEMENTED (P1.1 Chronos-Merge)

---

## System Core

### What is the Chronos Engine?
The **Chronos Engine v2** is the **single source of truth** for all temporal calculations in MBRN. It merges two previously separate domains:

1. **Biographical Time** — 7-year life cycle phases, lived days counter, next cycle date
2. **Numerological Time** — Personal Year/Month/Day cycles, universal cycles, cycle phase interpretations

### History
Prior to v2, these domains were split across `chronos_engine.js` (biographical) and `chronos.js` (numerological), causing inconsistent outputs between the App UI, Orchestrator, and Supabase API. P1.1 merged both into a single module.

---

## Tech Stack & Implementation

| Aspect | Implementation |
|--------|----------------|
| **Language** | Vanilla JavaScript (ES6+) |
| **Location** | `shared/core/logic/chronos_v2.js` |
| **Export** | `calculateChronos(birthdateInput)` |
| **Return** | `{success, data, error}` per Law 4 |
| **Pillar** | P1 (Logic — pure calculation, no DOM) |
| **Async** | No — synchronous (no async work needed) |
| **Dependencies** | `helpers.js` → `reduceToDigit`, `safeReduceToDigit` |

### Key Output Fields

| Field | Type | Domain | Description |
|-------|------|--------|-------------|
| `livedDays` | Integer | Biographical | Total days lived (UTC-based) |
| `currentPhase` | Integer | Biographical | Current 7-year phase (1, 2, 3...) |
| `nextCycleStartUTC` | ISO String | Biographical | Exact UTC timestamp of next phase start |
| `birthdateUTC` | ISO String | Biographical | Normalized birthdate in UTC |
| `personalYear` | Integer | Numerological | PY cycle (1-9 or 11/22/33) |
| `personalMonth` | Integer | Numerological | PM cycle (1-9 or 11/22/33) |
| `personalDay` | Integer | Numerological | PD cycle (1-9 or 11/22/33) |
| `cycle_phase` | String | Numerological | Human-readable phase interpretation |
| `universalYear` | Integer | Numerological | World energy — year |
| `universalMonth` | Integer | Numerological | World energy — month |
| `universalDay` | Integer | Numerological | World energy — day |
| `birth_date` | String | Metadata | Normalized YYYY-MM-DD |
| `target_date` | String | Metadata | Today YYYY-MM-DD |
| `timezone` | String | Metadata | Always "UTC" |
| `pinnacles` | Object | Placeholder | Phase 5.0 — all null |
| `challenges` | Object | Placeholder | Phase 5.0 — all null |

---

## UTC Compliance (Law 15)

All calculations use **UTC exclusively**:
- Birthdates normalized to UTC midnight
- Leap years handled via `addUTCYearsClamped()` (February 29 → February 28)
- No timezone drift, no daylight-saving issues

```javascript
// UTC-normalized birthdate creation
new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
```

---

## Input Formats

The engine accepts multiple date formats:

| Format | Example | Notes |
|--------|---------|-------|
| `DD.MM.YYYY` | `11.12.2005` | German format — MBRN native |
| `YYYY-MM-DD` | `2005-12-11` | ISO format |
| `YYYY/MM/DD` | `2005/12/11` | Flexible format |
| `Date` object | `new Date(...)` | JavaScript Date |

All formats produce identical output for the same date. Invalid dates (e.g., Feb 30, future dates) are rejected with descriptive error messages.

---

## Algorithms

### Biographical Time: 7-Year Cycles

```javascript
const livedDays = Math.floor((now - birthDate) / MS_PER_DAY);
const completedYears = getCompletedUTCYears(birthDate, now);
const currentPhase = Math.floor(completedYears / 7) + 1;
const nextCycleStart = addUTCYearsClamped(birthDate, currentPhase * 7);
```

### Numerological Time: Personal Cycles

```javascript
// PY = reduceToDigit(birthMonth + birthDay + targetYear)
const personalYear = safeReduceToDigit(birthMonth + birthDay + targetYear);
// PM = reduceToDigit(PY + targetMonth)
const personalMonth = safeReduceToDigit(personalYear + targetMonth);
// PD = reduceToDigit(PM + targetDay)
const personalDay = safeReduceToDigit(personalMonth + targetDay);
```

Master Numbers (11, 22, 33) are preserved during reduction.

### Cycle Phase Interpretations

| PY | Phase |
|----|-------|
| 1 | Neubeginn & Initiation |
| 2 | Kooperation & Balance |
| 3 | Kreativität & Expansion |
| 4 | Stabilität & Fundament |
| 5 | Veränderung & Freiheit |
| 6 | Verantwortung & Harmonie |
| 7 | Analyse & Spiritualität |
| 8 | Macht & Manifestation |
| 9 | Abschluss & Transformation |
| 11 | Intuition & Meister-Initiation |
| 22 | Baumeister & Manifestation |
| 33 | Meister-Lehrer & Heilung |

---

## Test Cases (Verified 2026-04-18)

### Erik: 11.12.2005

```javascript
calculateChronos("11.12.2005");
```

**Expected (as of 18.04.2026):**
- `livedDays`: ~7433 days
- `currentPhase`: 3 (Years 14-21)
- `nextCycleStartUTC`: "2026-12-11T00:00:00.000Z"
- `personalYear`: 6
- `cycle_phase`: "Verantwortung & Harmonie"

### Klaudia: 28.03.2008

```javascript
calculateChronos("28.03.2008");
```

**Expected (as of 18.04.2026):**
- `livedDays`: ~6595 days
- `currentPhase`: 3
- `nextCycleStartUTC`: "2029-03-28T00:00:00.000Z"
- `personalYear`: 5

---

## Integration Points

### All consumers point to `chronos_v2.js`:

| Consumer | File | Import |
|----------|------|--------|
| Orchestrator | `orchestrator.js` | `import { calculateChronos } from './chronos_v2.js'` |
| App UI | `apps/chronos/render.js` | `import { calculateChronos } from '../../shared/core/logic/chronos_v2.js'` |
| Supabase API | `supabase/functions/mbrn_compute/index.ts` | `import { calculateChronos } from "../../../shared/core/logic/chronos_v2.js"` |
| Canonical Module | `chronos_v2.js` | `export function calculateChronos(...)` |
| Tests | `chronos.test.js` | `import { calculateChronos } from './chronos_v2.js'` |

### Deprecated Stubs

`chronos.js` and `chronos_engine.js` were retired in P3. All runtime imports must target `chronos_v2.js` directly.

---

## Architecture Compliance

| Law | Compliance |
|-----|------------|
| **Law 1** | ✅ Pure calculation module, single purpose |
| **Law 2** | ✅ No DOM manipulation |
| **Law 3** | ✅ No innerHTML (enforced in UI layer) |
| **Law 4** | ✅ Structured returns `{success, data, error}` |
| **Law 15** | ✅ UTC-based temporal calculations |
| **Law 16** | ✅ Clear, consolidated documentation |

---

## Future Extensions (P3/P4)

- [ ] P3: Visual timeline rendering of all phases
- [ ] P3: Life themes per phase (energetic interpretation)
- [ ] P4: Integration with Supabase (save calculations per user)
- [ ] P4: Historical cycle lookup (past phases)
- [ ] P5: Pinnacles calculation (4 life cycles)
- [ ] P5: Challenges calculation (4 obstacles)
- [ ] UI: Display personalYear and cycle_phase in the Chronos App (currently biographical only)

---

**Module Version:** 3.0.0 (P1.1 — Unified Chronos-Merge)  
**Status:** ✅ PRODUCTION READY  
**Last Audit:** 18.04.2026 — P1.1 Chronos-Merge verification passed  
**Documentation:** ✅ Pillar-compliant (P1 Logic)
