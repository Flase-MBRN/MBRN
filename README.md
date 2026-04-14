# MBRN-HUB-V1

> **Lies die `000_ARCHITECTURE.md`. Das ist das Gesetz. Weiche nicht davon ab.**

## System-Status

```
PHASE 0-3 (M0-M12):     ✅ ARCHIVIERT
DESIGN PHASE (D1-D2):   🔄 AKTIV
PHASE 4.0 (M13-M16):    ✅ COMPLETE — Backend LIVE
PHASE 5.0 (UI/UX):      🌱 NEXT — nach Traffic
```

## Architektur-Dokumente

| Dokument | Inhalt |
|----------|--------|
| `000_ARCHITECTURE.md` | The 15 Iron Laws — Core System Directive |
| `000_plan.md` | Master Execution Plan — M0-M16 (alle ✅) |
| `000_roadmap.md` | Milestone-Übersicht — Phasen 0-5 |
| `docs/Index_MBRN_Vault.md` | System Knowledge Graph — M0-M16 |
| `docs/M14_Synergy_Engine.md` | Operator Compatibility Math |
| `docs/M15_Chronos_Engine.md` | Temporal Cycle Calculations |
| `docs/M16_Frequency_Engine.md` | Name Numerology (Pythagorean) |

## Quickstart

```bash
# Lokaler Server (ES6-Module erfordern HTTP)
npx serve .

# Dann öffnen:
# http://localhost:3000/ (oder angegebener Port)
```

## Milestone-Status

### Phase 1.0: Foundation (M0-M5) ✅
- M0–M5: Core Engine, Finance, Dashboard, Paywall

### Phase 2.0: Cloud Fortress (M6-M9) ✅
- M6: Cloud Fortress (Supabase)
- M7: Identity Layer (Auth)
- M8: Global Mirror (Cloud Sync)
- M9: Viral Satellite (Canvas Share-Cards)

### Phase 3.0: The Artifact (M10-M12) ✅
- M10: The Void (Visual Overhaul)
- M11: The Vault (Stripe Integration)
- M12: The Artifact (Premium PDF v3.0)

### Phase 4.0: Logic Core (M13-M16) ✅ COMPLETE
- **M13**: Unified Orchestrator — Modular Logic Architecture
- **M14**: Synergy Engine — Operator Compatibility (Dim 05)
- **M15**: Chronos Protocol — Temporal Cycles (Dim 06)
- **M16**: Frequency Tuner — Name Numerology (Dim 03+)

### Phase 5.0: UI/UX Expansion 🌱
> Next: Synergy UI, Chronos Dashboard, Tuner Live-Input

## Apps

| App | Status | Engine | Description |
|-----|--------|--------|-------------|
| `/apps/finance/` | ✅ Live | Legacy | Investitions-Projektion |
| `/apps/numerology/` | ✅ Live | Unified | 36 Kennzahlen + Lo-Shu + Quantum |
| `/apps/synergy/` | 🏗️ Scaffold | M14 | Operator Compatibility (Dim 05) |
| `/apps/chronos/` | 🏗️ Scaffold | M15 | Zeit-Zyklen Navigation (Dim 06) |
| `/apps/tuning/` | 🏗️ Scaffold | M16 | Namens-Frequenz Alignment (Dim 03+) |
| `/dashboard/` | ✅ Live | — | Command Center + Streaks |

## Architecture Highlights

### ✅ 100% Script-Tag Compliance
- **Vanilla JS Modularität**: Kein Framework, kein Build-Step
- **Single Script-Tag Rule**: Jede Seite hat exakt ein `<script type="module">`
- **ES6 Native**: Native Imports/Exports mit `.js` Extension

### ✅ Security-Hardened
- **XSS-Safe Navigation**: `render_auth.js` nutzt `textContent` (escaped)
- **DOM Utils**: `dom.createEl()` für XSS-sichere Element-Erstellung
- **API Verification**: `api.verifySession()` via Stripe Webhook → DB Kreislauf

### ✅ Modular Logic Architecture
```
shared/core/logic/
├── helpers.js           # Shared utilities (reduceToDigit, validateInput)
├── synergy.js           # M14: Operator compatibility
├── chronos.js           # M15: Personal Year/Month/Day
├── frequency.js         # M16: Name numerology
├── orchestrator.js      # Unified Profile (combines M14-M16 + Legacy)
└── legacy_numerology.js # Backward compatibility
```

### ✅ Async-Safe Orchestrator
- **Error Boundaries**: `actions.dispatch()` fängt sync + async Errors
- **Idempotent Boot**: `initSystem()` Guard verhindert doppelte Subscriptions
- **Promise Handling**: Automatisches `.catch()` für async Engine-Fehler

## Quickstart

```bash
# Lokaler Server (ES6-Module erfordern HTTP)
npx serve .

# Dann öffnen:
# http://localhost:3000/ (oder angegebener Port)
```

## System-Konfiguration

```javascript
// shared/core/env.js (lokal, nie commiten!)
export const ENV = {
  SUPABASE_URL: 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: 'your-anon-key'
};
```

## Gesetze

1. **Module Responsibility**: Ein File = Eine Aufgabe
2. **No Direct DOM**: Core-Module manipulieren niemals das DOM
3. **Structured Returns**: Alle Funktionen returnen `{success, data|error}`
4. **Single Script-Tag**: Keine Inline-Scripts
5. **ES6 Imports**: Alle Imports mit `.js` Extension

---

**Built to be used. No tracking. No limits.**
**Phase 4.0: Backend LIVE — Phase 5.0: Coming Soon**
