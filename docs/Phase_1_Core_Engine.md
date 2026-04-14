# Phase 1: Core Engine (M0-M5)

> **Status:** ✅ COMPLETE  
> **Tags:** #phase1 #core #vanillajs #statemanagement  
> **Files:** `state.js`, `storage.js`, `actions.js`, `dom_utils.js`

---

## Overview

The foundational layer of MBRN. Zero dependencies. Maximum control. The entire system rests on these four pillars.

**Philosophy:** If the foundation cracks, everything collapses. Build it once. Build it right.

---

## Module 1: State Manager (state.js)

### Purpose
Global Pub/Sub event system. Decoupled. Reactive. No framework lock-in.

### Architecture
```javascript
class StateManager {
  state = {}           // Internal state storage
  subscribers = Map()    // Event-key → Callback[] mapping
}
```

### Core API
| Method | Purpose |
|--------|---------|
| `subscribe(event, callback)` | Listen to state changes |
| `emit(event, data)` | Broadcast state update |
| `get(event)` | Read current state |

### Gesetz 4 Compliance
All emits follow structured returns: `{success, data}` or `{success, error}`

### Usage Pattern
```javascript
import { state } from './state.js';

// Subscribe
const unsubscribe = state.subscribe('calculationDone', (result) => {
  if (result.success) { render(result.data); }
});

// Emit
state.emit('calculationDone', { 
  success: true, 
  data: { score: 85 } 
});
```

---

## Module 2: Storage Wrapper (storage.js)

### Purpose
LocalStorage abstraction with `mbrn_` prefix. Fallback state per Gesetz 7.

### Design Decisions
- **Prefix:** All keys prefixed with `mbrn_` to avoid collisions
- **JSON:** Automatic serialization/deserialization
- **Validation:** Returns structured objects per Gesetz 4

### API
```javascript
storage.set('user_profile', data)  // → {success: true}
storage.get('user_profile')         // → {success: true, data: {...}}
storage.remove('user_profile')      // → {success: true}
```

### Fallback Chain (Gesetz 7)
```
Supabase → LocalStorage → Default State → No Crash
```

---

## Module 3: Action Orchestrator (actions.js)

### Purpose
Central action registry. Orchestrates logic → state → storage → cloud.

### Strict Rules
- **Zero DOM manipulation** (Gesetz 2)
- **Async orchestration** with debouncing
- **Private registry** (`_registry`) — not exported

### Action Lifecycle
```
1. Register → actions.register('calc', calculateFn)
2. Dispatch → actions.dispatch('calc', input)
3. Execute → Logic runs (isolated)
4. Emit → state.emit('calcCompleted', result)
5. Persist → storage.set() + api.sync()
```

### Debouncing (Gesetz 12)
```javascript
let _syncDebounceTimer = null;
// 300ms delay before cloud sync
```

---

## Module 4: DOM Utils (dom_utils.js)

### Purpose
XSS-safe rendering layer. Sanitization mandatory.

### Security Model
- **No innerHTML** for dynamic content
- **createElement** pattern enforced
- **Text nodes** for user input

### Pattern Example
```javascript
// ❌ Forbidden
element.innerHTML = userInput;

// ✅ Required
const text = document.createTextNode(userInput);
element.appendChild(text);
```

---

## Applications (M4-M5)

### Finance App (apps/finance/)
**DIM 01 — KAPITAL**
- Investment projection
- Four allocation models
- Tax-adjusted output
- Local-first calculation

### Dashboard (dashboard/)
**Mastery Mirror**
- Streak tracking
- Check-in system
- Discipline visualization
- Command center layout

---

## Design Principles

### #vanillajs Philosophy
> "No Webpack, no Vite, no npm for Production"

**Reasoning:**
- Zero build time
- Zero dependency vulnerabilities
- Full runtime control
- ES6 modules sufficient

### File Structure Convention
```
/shared/core/
├── state.js          # State management
├── storage.js        # Persistence
├── actions.js        # Orchestration
├── api.js            # Cloud layer (Phase 2)
├── config.js         # Magic numbers
└── modular_logic.js  # Math engine (Phase 4)
```

---

## Compliance

| Law | Implementation |
|-----|----------------|
| Gesetz 1 | Each file = single responsibility |
| Gesetz 2 | Zero DOM in logic layer |
| Gesetz 4 | Structured returns everywhere |
| Gesetz 7 | LocalStorage fallback |
| Gesetz 9 | Global CSS variables only |

---

## Related

- Next Phase: [[Phase_2_Cloud_Fortress]]
- Architecture: [[000_ARCHITECTURE]]
- Current Logic: [[M14_Synergy_Engine]]

---

**Completed:** M5  
**Foundation Status:** ✅ SOLID
