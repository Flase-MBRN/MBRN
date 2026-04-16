# 🏛️ THE OMNISCIENT HANDOVER MANIFEST
## MBRN-HUB-V1 — MASTER DIRECTIVE FOR STRATEGIC AI

> **Version:** 1.0 | **Status:** ACTIVE | **Classification:** ARCHITECT'S TRUTH
> 
> **Purpose:** This document is the absolute source of truth for MBRN-HUB-V1. Any strategic AI (Claude) operating on this system MUST internalize every principle, pattern, and protocol described herein before proposing modifications.
> 
> **Principle:** *"Understand before you build. Respect the Membran."*

---

# 1. 🏛️ THE META-MONOLITH (Vision & The 4 Pillars)

## 1.1 The Core Philosophy

**MBRN is not a tool. Not a dashboard. Not an app.**

MBRN is the **Membran** — the interface between what a human currently *is* and what *lies dormant* within them.

Derived from **M-Theory** (Membrane Theory, 11 dimensions). In M-Theory, seemingly different systems are merely different perspectives on the same underlying fundament. MBRN operates identically: Finance, Fitness, Mindset, Relationships — they *look* different. They are the same Membran.

### The Antimatter Principle
While other systems ask for liquidity, MBRN asks for strengths and potential. Success through discovery — not exploitation.

### The Core Statement
> *"Existence fragments itself into perspectives to enable experience. MBRN is the system that makes these perspectives navigable."*

**Core Sentence:** `MBRN — built to be used`

---

## 1.2 The 4 Pillars (The Imperium)

```
PILLAR 1 — META-GENERATOR (The Production Hall)
  Systems that generate for other systems/products.
  Consumes data from Pillar 3. Output feeds into Pillar 4.

PILLAR 2 — B2B IDLE API (The Power Plant)
  The logic built for Pillars 1 & 4 → decoupled as API.
  Companies "rent" your algorithms. Passive cashflow.

PILLAR 3 — DATA ARBITRAGE (The Raw Material Warehouse)
  Automated data collection via Python/Ollama.
  Feeds all other Pillars with raw material.

PILLAR 4 — MBRN ECOSYSTEM (The Central Hub)
  The Hub. The 11 Dimensions. B2C Interface.
  Build trust. Let community emerge.
```

### The Compound Interest Effect
- Every module you build makes the Meta-Generator more powerful
- Every data point makes the API more valuable
- Every user makes the ecosystem stronger
- You recycle code and knowledge infinitely

---

## 1.3 The Identity (Flase Principle)

The Architect is invisible. The brand carries everything.

- **Communication:** Exclusively text-based
- **Presence:** No public face, no parasocial bonds
- **Output-Centricity:** Only the system and its effect exist publicly
- **Persona:** Flase — neutral, distant, not graspable as a person

**Goal:** Separation between Person (invisible) and Effect (visible).

---

## 1.4 The Decision Question

For every design and feature decision, this single question applies:

> *"Does this still feel like a website — or like something from a different era?"*

Answer "Website" → redo.  
Answer "different era" → include it.

---

# 2. 📜 THE 15 IRON LAWS OF ARCHITECTURE

## 2.1 CORE LAWS (Foundation — Untouchable)

| # | Law | Enforcement |
|---|-----|-------------|
| 1 | **Module Responsibility** | One File = One Responsibility. Never mix Logic + State + UI. |
| 2 | **No Direct DOM** | `document.querySelector` / `innerHTML` ONLY in `render.js` or UI layers. |
| 3 | **Safe Rendering** | All DOM updates via `dom_utils.js`. XSS protection mandatory. |
| 4 | **Structured Returns** | All functions return `{ success: true, data: ... }` or `{ success: false, error: "..." }`. Never raw strings or undefined. |
| 5 | **Idempotency** | Actions must be safely executable multiple times (double-click, network-lag, AI-call safe). |
| 6 | **Event Naming** | Strict patterns: `actionCompleted`, `stateChanged`, `uiRequested`. |
| 7 | **Fallback State** | On Supabase failure → automatic LocalStorage fallback. UX never breaks. |
| 8 | **No Magic Numbers** | All thresholds live in `MBRN_CONFIG`. |
| 9 | **No Local CSS** | Exclusively global CSS variables from `theme.css`. |

## 2.2 CLOUD LAWS (Synchronization)

| # | Law | Enforcement |
|---|-----|-------------|
| 10 | **Cloud-First, Offline-Always** | Instant startup with LocalStorage. Supabase syncs async in background (Optimistic UI). |
| 11 | **RLS Law** | Database access only via Row Level Security. Users can physically read no foreign data. |
| 12 | **Sync-Debouncing** | Cloud uploads never on every keystroke. Batch uploads with delay. |

## 2.3 EXPANSION LAWS (Ecosystem)

| # | Law | Enforcement |
|---|-----|-------------|
| 13 | **Logic Isolation** | Complex algorithms (Synergy, Chronos, Frequency) remain in isolated modules. Web Workers if necessary. |
| 14 | **Design Consistency** | Every module follows the MBRN Design Code. No exceptions. |
| 15 | **Temporal Precision** | Chronological calculations are deterministic and timezone-accurate (UTC-Mapping). |

---

## 2.4 The Design Code: Starry Sky System

### The Feeling
> "Starry sky in a lit city. Glance briefly — you see almost nothing. Look closer — you see 2-3 stars."

### First User Impression Must Be:
> *"WTF is this. Is this still a website from the 21st century or from a completely different era?"*

### Color System
```css
--bg-primary:   #05050A  /* Near Black — not pure black, not Navy */
--bg-surface:   #0A0A0F  /* Cards, elevated surfaces */
--bg-elevated:  #0F0F15  /* Higher elevation */
--border:       rgba(255,255,255,0.06)  /* Subtle, barely visible */
--accent:       #7B5CF5  /* Deep Purple — sparingly, never as fill surface */
--glow:         rgba(123,92,245,0.15)  /* Subtle, like a distant star */
--text-primary: #F5F5F5  /* White — but not harsh */
--text-secondary: rgba(255,255,255,0.5)
--text-muted:   rgba(255,255,255,0.25)
```

### Typography
- **Display:** Syne (700/800) — Headlines, extremely large, few words
- **Body:** Inter (300/400/500) — Plain, readable
- **Labels:** Space Mono or Inter Caps + Letter-spacing — like coordinates

### Layout Principles
- Courage to leave empty space. Much room. Few elements.
- Every element sits with intent.
- When scrolling — something unexpected happens.
- No typical AI-generated designs.
- No kitsch graphics — only data visualization.

### Forbidden
- `#0d0d1a` Navy (too generic)
- `#000000` pure black (too harsh)
- Excessive glow effects
- Gradient overload
- Everything already known

---

# 3. 📂 DIRECTORY & ROUTING ARCHITECTURE

## 3.1 Directory Structure

```
/MBRN-HUB-V1
│
├── /shared                     # 🧠 THE ENGINE (Platform Core)
│   ├── /ui
│   │   ├── theme.css           # Single Source of Truth (CSS Vars)
│   │   ├── components.css      # Global Buttons, Cards, Modals
│   │   ├── dom_utils.js        # Sanitized Rendering (XSS-Protection)
│   │   ├── navigation.js       # Router with Memory-Cleanup
│   │   ├── touch_manager.js    # Mobile Swipe Gestures
│   │   ├── error_boundary.js   # Global Error Handlers
│   │   └── widgets/            # Reusable UI Components
│   │       └── sentiment_widget.js
│   │
│   ├── /core
│   │   ├── config.js           # MBRN_CONFIG (All Magic Numbers)
│   │   ├── state.js            # Global State Manager (Pub/Sub)
│   │   ├── actions.js          # Action Registry + Orchestration
│   │   ├── api.js              # Supabase Client + RLS + Sync
│   │   ├── storage.js          # LocalStorage Wrapper (mbrn_* prefix)
│   │   ├── circuit_breaker.js  # Resilience Engineering
│   │   ├── validators.js       # Zero-Tolerance Validation
│   │   ├── i18n.js             # DE/EN Internationalization
│   │   ├── error_logger.js     # Error Tracking System
│   │   └── logic/              # Shared Logic Engines
│   │       ├── orchestrator.js # Numerology Unified Profile
│   │       ├── synergy.js      # Synergy Algorithm
│   │       ├── chronos.js      # Chronos Protocol
│   │       └── frequency.js    # Name Frequency Calculation
│   │
│   └── /loyalty
│       ├── streak_manager.js   # Streaks, Shields, Check-ins
│       └── access_control.js   # Feature Gates + Unlocks
│
├── /apps                       # 🧩 PLUG-INS (Isolated Dimensions)
│   ├── /finance                # DIM 01 — CAPITAL
│   │   ├── index.html          # Single script entry
│   │   ├── render.js           # UI Layer with destroy()
│   │   └── logic.js            # Pure calculation functions
│   │
│   ├── /numerology             # DIM 03 — FREQUENCY
│   │   ├── index.html
│   │   └── render.js           # Full render with PDF export
│   │
│   ├── /synergy                # DIM 05 — BOND (Phase 2)
│   ├── /chronos                # DIM 06 — CHRONOS (Phase 3)
│   └── /tuning                 # DIM 03+ — FREQUENCY TUNER (Phase 4)
│
├── /dashboard                  # 📊 User Area (Mastery Mirror)
│   ├── index.html
│   └── render_dashboard.js
│
├── /landing                    # 🌍 Public Frontend (WTF Moment)
├── /docs                       # 🧠 Obsidian Vault
├── supabase/                   # 🔧 Edge Functions & Migrations
├── index.html                  # 🔄 Root (Landing Page)
└── 000_*.md                    # 📜 Architecture Documents
```

## 3.2 The Routing System

### Navigation Manager (`shared/ui/navigation.js`)

**Dynamic Root Detection:**
```javascript
function getRepoRoot() {
  const path = window.location.pathname;
  const knownSegments = ['/dashboard/', '/apps/finance/', '/apps/numerology/'];
  for (const segment of knownSegments) {
    const idx = path.indexOf(segment);
    if (idx !== -1) return path.slice(0, idx) + '/';
  }
  // Fallback: ensure root always ends with /
  const root = path.replace(/\/[^/]*$/, '/') || '/';
  return root.endsWith('/') ? root : root + '/';
}
```

**Memory Cleanup Pattern:**
```javascript
export const nav = {
  _currentApp: null,
  _cleanupListenersInitialized: false,
  _navigationBound: false,
  _memoryCheckInterval: null,
  _cleanupInterval: null,

  registerCurrentApp(appInstance) {
    this._currentApp = appInstance;
    this._initEmergencyCleanup();
  },

  navigateTo(route) {
    // Cleanup BEFORE navigating
    if (this._currentApp && typeof this._currentApp.destroy === 'function') {
      this._currentApp.destroy();
      this._currentApp = null;
    }
    const base = getRepoRoot();
    window.location.href = base + (MBRN_ROUTES[route] ?? MBRN_ROUTES.home);
  },

  _initEmergencyCleanup() {
    // popstate: Browser back/forward
    window.addEventListener('popstate', () => {
      if (this._currentApp?.destroy) {
        this._currentApp.destroy();
        this._currentApp = null;
      }
    });

    // beforeunload: Page refresh/close
    window.addEventListener('beforeunload', () => {
      if (this._currentApp?.destroy) {
        this._currentApp.destroy();
      }
    });

    // visibilitychange: Tab switch (mobile)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this._currentApp) {
        state.emit('appPaused', { timestamp: Date.now() });
      }
    });

    // Memory pressure detection (mobile browsers)
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      this._memoryCheckInterval = setInterval(async () => {
        const estimate = await navigator.storage.estimate();
        if (estimate.usage > estimate.quota * 0.8) {
          state.emit('memoryPressure', { usage: estimate.usage, quota: estimate.quota });
        }
      }, 30000);
    }
  }
};
```

**Route Configuration (`shared/core/config.js`):**
```javascript
export const MBRN_ROUTES = {
  home:        'index.html',
  dashboard:   'dashboard/index.html',
  finance:     'apps/finance/index.html',
  numerology:  'apps/numerology/index.html',
  synergy:     'apps/synergy/index.html',
  chronos:     'apps/chronos/index.html',
  tuning:      'apps/tuning/index.html'
};

export const MBRN_ROUTE_META = {
  dashboard:   { icon: '◈', label: 'Dashboard', tier: 0 },
  finance:     { icon: '◉', label: 'Finance', tier: 0 },
  numerology:  { icon: '◐', label: 'Numerology', tier: 0 },
  synergy:     { icon: '◷', label: 'Synergy', tier: 10 },
  chronos:     { icon: '◫', label: 'Chronos', tier: 10 },
  tuning:      { icon: '◎', label: 'Tuner', tier: 10 }
};
```

---

# 4. ⚙️ THE INFRASTRUCTURE FORTRESS

## 4.1 State Management (`shared/core/state.js`)

**Architecture:** Pub/Sub Event System — Decoupled, Reactive, Zero Framework Lock-in

```javascript
class StateManager {
  constructor() {
    this.state = {};           // Internal state storage
    this.subscribers = new Map();  // Event → Callbacks[]
    this._emitDepths = new Map();  // Recursion tracking
  }

  subscribe(event, callback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    const callbacks = this.subscribers.get(event);
    callbacks.push(callback);

    // Return unsubscribe function (Law 5: Cleanup)
    return () => {
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    };
  }

  emit(event, data, _isAuthorized = false) {
    // P0 SECURITY: Block manual emission of reserved events
    if (RESERVED_EVENTS.includes(event) && !_isAuthorized) {
      console.error(`[State] BLOCKED: '${event}' is reserved. Use authorized actions.`);
      return;
    }

    // P1 SECURITY: Recursion depth limit
    const currentDepth = this._emitDepths.get(event) || 0;
    if (currentDepth >= MAX_EMIT_DEPTH) {
      throw new Error(`Recursion guard: Event '${event}' exceeded depth ${MAX_EMIT_DEPTH}`);
    }
    this._emitDepths.set(event, currentDepth + 1);

    try {
      this.state[event] = data;
      if (this.subscribers.has(event)) {
        const callbacks = this.subscribers.get(event);
        callbacks.forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            // Isolated error: One crashing subscriber doesn't kill the chain
            console.error(`[State] Subscriber for '${event}' crashed:`, error);
          }
        });
      }
    } finally {
      const newDepth = (this._emitDepths.get(event) || 1) - 1;
      if (newDepth > 0) this._emitDepths.set(event, newDepth);
      else this._emitDepths.delete(event);
    }
  }

  // Internal: Authorized emit for actions.js only
  _authorizedEmit(event, data) {
    this.emit(event, data, true);
  }
}

export const state = new StateManager();
```

**Reserved System Events:**
```javascript
const RESERVED_EVENTS = [
  'userAuthChanged', 'systemInitialized', 'systemError',
  'syncStarted', 'syncSuccess', 'syncFailed',
  'paymentVerified', 'paymentFailed'
];
```

## 4.2 Circuit Breaker (`shared/core/circuit_breaker.js`)

**Purpose:** Protects against cascading failures in cloud connections (Law 7: Fallback State)

```javascript
const STATE = { CLOSED: 'CLOSED', OPEN: 'OPEN', HALF_OPEN: 'HALF_OPEN' };

export class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 3;
    this.resetTimeout = options.resetTimeout || 30000; // 30s
    this.state = STATE.CLOSED;
    this.failureCount = 0;
    this.metrics = { totalCalls: 0, successes: 0, failures: 0, rejections: 0 };
  }

  async execute(fn) {
    this.metrics.totalCalls++;

    // Circuit OPEN: Immediate LocalStorage fallback (no network delay)
    if (this.state === STATE.OPEN) {
      if (Date.now() >= this.nextAttempt) {
        this.state = STATE.HALF_OPEN;
      } else {
        this.metrics.rejections++;
        const fallbackKey = `circuit_fallback_${this.name}`;
        const fallbackResult = storage.get(fallbackKey);
        if (fallbackResult.success && fallbackResult.data) {
          return {
            success: true, data: fallbackResult.data.data,
            offline: true, circuitOpen: true, fallback: true
          };
        }
        return {
          success: false, error: `Service unavailable. Retry after ${Math.ceil((this.nextAttempt - Date.now()) / 1000)}s`,
          offline: true, circuitOpen: true
        };
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      this.saveFallback(result);
      return { success: true, data: result, offline: false, circuitOpen: false };
    } catch (error) {
      this.onFailure(error);
      return { success: false, error: error.message, offline: this.state === STATE.OPEN, circuitOpen: this.state === STATE.OPEN };
    }
  }

  saveFallback(data) {
    const fallbackKey = `circuit_fallback_${this.name}`;
    storage.set(fallbackKey, { data, timestamp: Date.now(), circuit: this.name });
  }

  onFailure(error) {
    this.failureCount++;
    this.metrics.failures++;
    if (this.failureCount >= this.failureThreshold) {
      this.state = STATE.OPEN;
      this.nextAttempt = Date.now() + this.resetTimeout;
      state.emit('circuitOpened', { name: this.name, retryAfter: this.resetTimeout });
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.metrics.successes++;
    if (this.state === STATE.HALF_OPEN) {
      this.state = STATE.CLOSED;
      state.emit('circuitClosed', { name: this.name });
    }
  }
}

// Global Circuits
export const circuits = {
  supabase: new CircuitBreaker({ name: 'supabase', failureThreshold: 3, resetTimeout: 30000 }),
  stripe: new CircuitBreaker({ name: 'stripe', failureThreshold: 2, resetTimeout: 60000 }),
  analytics: new CircuitBreaker({ name: 'analytics', failureThreshold: 5, resetTimeout: 120000 })
};

// Wrapper function
export async function withCircuitBreaker(circuitName, fn) {
  return circuits[circuitName]?.execute(fn) || fn();
}
```

## 4.3 Storage Layer (`shared/core/storage.js`)

**LocalStorage Wrapper:**
```javascript
const PREFIX = 'mbrn_';
const _queue = [];     // Race condition fix
let _processing = false;

export const storage = {
  set(key, value) {
    return new Promise((resolve, reject) => {
      _queue.push({
        execute: async () => {
          try {
            const prefixedKey = `${PREFIX}${key}`;
            localStorage.setItem(prefixedKey, JSON.stringify(value));
            return { success: true, data: null };
          } catch (error) {
            return { success: false, error: error.name === 'QuotaExceededError' ? 'LocalStorage Quota Exceeded' : error.message };
          }
        },
        resolve, reject
      });
      _processQueue();
    });
  },

  get(key) {
    try {
      const item = localStorage.getItem(`${PREFIX}${key}`);
      if (item === null) return { success: true, data: null };
      return { success: true, data: JSON.parse(item) };
    } catch (error) {
      return { success: false, error: 'JSON Parse Error' };
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(`${PREFIX}${key}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};
```

## 4.4 Cloud Gateway (`shared/core/api.js`)

**Supabase Integration:**
```javascript
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { withCircuitBreaker, circuits } from './circuit_breaker.js';

export const api = {
  client: null,
  isOnline: false,

  init() {
    if (this.client) return true;
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      console.warn('[API] Missing credentials. Offline-Mode.');
      return false;
    }
    this.client = createClient(SUPABASE_URL, SUPABASE_KEY);
    this.isOnline = true;
    return true;
  },

  // Auth
  async signUp(email, password) {
    return withCircuitBreaker('supabase', async () => {
      const { data, error } = await this.client.auth.signUp({ email, password });
      if (error) throw error;
      return data;
    });
  },

  async signIn(email, password) { /* ... */ },
  async signOut() { /* ... */ },
  async getSession() { /* ... */ },

  // Profile Sync
  async saveProfile(profileData) {
    return withCircuitBreaker('supabase', async () => {
      const { data, error } = await this.client
        .from('profiles')
        .upsert({
          id: profileData.id,
          display_name: profileData.display_name,
          access_level: profileData.access_level,
          current_streak: profileData.current_streak,
          shields: profileData.shields,
          last_sync: new Date().toISOString()
        })
        .select();
      if (error) throw error;
      return data[0];
    });
  },

  async getProfile(userId) { /* ... */ },

  // Stripe Integration
  async createCheckoutSession(priceId) {
    const { data, error } = await this.client.functions.invoke('stripe-checkout', { body: { priceId } });
    if (error) throw error;
    return { success: true, data };
  },

  async verifySession(sessionId) {
    const { data, error } = await this.client
      .from('transactions')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .in('status', ['succeeded', 'complete', 'paid', 'completed'])
      .single();
    return error ? { success: false, error } : { success: true, data };
  }
};
```

## 4.5 Action Orchestrator (`shared/core/actions.js`)

**Central Action Registry:**
```javascript
const _registry = new Map();
const _dispatchingLocks = new Map();
let _systemInitialized = false;

export const actions = {
  register(actionName, handler) {
    if (typeof handler !== 'function') throw new Error('Handler must be a function');
    _registry.set(actionName, handler);
  },

  dispatch(actionName, payload) {
    // P1 SECURITY: Deduplication
    if (_dispatchingLocks.get(actionName)) {
      return { success: false, error: 'Action already in progress', deduplicated: true };
    }

    const handler = _registry.get(actionName);
    if (!handler) {
      return { success: false, error: 'Action not registered' };
    }

    _dispatchingLocks.set(actionName, true);

    try {
      const result = handler(payload);
      if (result === null || result === undefined) {
        return { success: false, error: 'Handler returned null/undefined' };
      }
      if (typeof result !== 'object') {
        return { success: false, error: `Handler returned ${typeof result} instead of object` };
      }
      if (typeof result.then === 'function') {
        return result
          .catch(error => ({ success: false, error: error.message }))
          .finally(() => _dispatchingLocks.delete(actionName));
      }
      _dispatchingLocks.delete(actionName);
      return result;
    } catch (error) {
      _dispatchingLocks.delete(actionName);
      return { success: false, error: error.message };
    }
  },

  initSystem() {
    if (_systemInitialized) {
      return { success: true, data: state.get('systemInitialized') };
    }
    _systemInitialized = true;

    // Initialize API
    api.init();

    // Hydrate from LocalStorage
    const stored = storage.get('user_profile');
    const initialProfile = stored.success && stored.data ? stored.data : {
      isNewUser: true, streak: 0, shields: 0, unlocked_tools: []
    };

    // Restore session
    api.getSession().then(res => {
      if (res.success && res.data) {
        state.set('user', res.data.user);
        state._authorizedEmit('userAuthChanged', res.data.user);
        this.pullCloudData(res.data.user.id);
      }
    });

    state._authorizedEmit('systemInitialized', initialProfile);

    // Reactive sync hooks
    state.subscribe('streakUpdated', () => this.debouncedSync());
    state.subscribe('analyticsTrack', (eventData) => api.logEvent(eventData));

    // Register Logic Engines
    this.register('calculateFullProfile', async (payload) => {
      const { getUnifiedProfile } = await import('./logic/orchestrator.js');
      const res = await getUnifiedProfile(payload.name, payload.birthDate);
      res.success ? state.emit('numerologyDone', res) : state.emit('numerologyFailed', res);
      return res;
    });

    return { success: true, data: initialProfile };
  },

  triggerCheckIn() {
    const profile = resolveCurrentProfile() || { streak: 0, shields: 0 };
    const result = streakManager.calculateCheckIn(profile, new Date());
    if (result.success) {
      storage.set('user_profile', result.data.profile);
      state._authorizedEmit('systemInitialized', result.data.profile);
      state.emit('streakUpdated', result.data);
    }
    return result;
  }
};
```

## 4.6 DOM Utils (`shared/ui/dom_utils.js`)

**XSS-Safe Rendering Utilities:**
```javascript
export const dom = {
  setText: (elementId, text) => {
    const el = document.getElementById(elementId);
    if (el) el.textContent = text;  // XSS-safe: auto-escapes
  },

  clear: (elementId) => {
    const el = document.getElementById(elementId);
    if (el) el.replaceChildren();
  },

  createEl: (tag, options = {}) => {
    const el = document.createElement(tag);
    if (options.text !== undefined) el.textContent = options.text;
    if (options.className) el.className = options.className;
    if (options.id) el.id = options.id;
    if (options.style) Object.assign(el.style, options.style);
    if (options.parent) options.parent.appendChild(el);
    return el;
  },

  renderTemplate: (templateId, targetId, dataMapper) => {
    const template = document.getElementById(templateId);
    const target = document.getElementById(targetId);
    if (!template || !target) return;
    const clone = template.content.cloneNode(true);
    if (dataMapper) dataMapper(clone);
    target.appendChild(clone);
  },

  showSkeleton: (containerId, type = 'card') => {
    // Idempotent: removes existing skeletons first
    const container = document.getElementById(containerId);
    if (!container) return () => {};
    const existing = container.querySelectorAll('[data-skeleton="true"]');
    existing.forEach(el => el.remove());
    // ... create and return cleanup function
  }
};

export function animateValue(element, start, end, duration = 1500, suffix = '', formatter = null) {
  // P1 SECURITY: Validate for NaN/Infinity
  if (Number.isNaN(end) || !Number.isFinite(end)) {
    element.textContent = '0' + suffix;
    return () => {};
  }

  const startTime = performance.now();
  let rafId = null;

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const value = start + (end - start) * easeOutExpo(progress);

    element.textContent = (formatter ? formatter(value) : Math.round(value).toLocaleString('de-DE')) + suffix;

    if (progress < 1) rafId = requestAnimationFrame(update);
  }

  rafId = requestAnimationFrame(update);
  return () => { if (rafId) cancelAnimationFrame(rafId); };
}
```

## 4.7 Validation Engine (`shared/core/validators.js`)

**Zero-Tolerance Validation:**
```javascript
import { MBRN_CONFIG } from './config.js';
const { validation: V } = MBRN_CONFIG;

export function validateDateFormat(dateStr) {
  const match = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) return { success: false, error: 'Invalid format' };

  const [_, day, month, year] = match.map(Number);

  if (month < V.date.MIN_MONTH || month > V.date.MAX_MONTH) {
    return { success: false, error: `Month must be ${V.date.MIN_MONTH}-${V.date.MAX_MONTH}` };
  }

  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const maxDays = month === 2 && isLeap ? 29 : daysInMonth[month - 1];

  if (day > maxDays) {
    return { success: false, error: `Invalid date: ${day}.${month}.${year} doesn't exist` };
  }

  const testDate = new Date(Date.UTC(year, month - 1, day));
  if (testDate.getUTCDate() !== day || testDate.getUTCMonth() !== month - 1) {
    return { success: false, error: 'Date does not exist in calendar' };
  }

  return { success: true, data: testDate };
}

export function validateName(name, options = {}) {
  const minLength = options.minLength ?? V.name.MIN_LENGTH;
  const maxLength = options.maxLength ?? V.name.MAX_LENGTH;

  if (!name || typeof name !== 'string') {
    return { success: false, error: 'Name required' };
  }

  const trimmed = name.trim();
  if (trimmed.length < minLength) {
    return { success: false, error: `Name must be at least ${minLength} characters` };
  }

  const lettersOnly = trimmed.replace(/[^a-zA-ZäöüÄÖÜß\s'-]/g, '');
  if (lettersOnly.length < minLength) {
    return { success: false, error: 'Name must contain letters' };
  }

  return { success: true, data: trimmed };
}
```

## 4.8 i18n Engine (`shared/core/i18n.js`)

**Internationalization:**
```javascript
import { MBRN_CONFIG } from './config.js';

const detectLanguage = () => {
  const lang = navigator.language || navigator.userLanguage || 'en';
  return lang.startsWith('de') ? 'de' : 'en';
};

const currentLang = detectLanguage();

export const i18n = {
  t(key) {
    const translations = MBRN_CONFIG.i18n[currentLang];
    if (!translations) return key;

    // Support nested keys like 'terminal.sequence'
    const keys = key.split('.');
    let value = translations;
    for (const k of keys) {
      value = value?.[k];
    }

    return value || key;
  },

  getLanguage() {
    return currentLang;
  }
};
```

---

# 5. 🧩 THE ACTIVE DIMENSIONS (Apps)

## 5.1 App Status Overview

| Dimension | Name | Status | Core Function |
|-----------|------|--------|---------------|
| DIM 01 | **Finance** | ✅ LIVE | Compound interest calculator with future projection |
| DIM 03 | **Numerology** | ✅ LIVE | Life path, soul urge, expression, Lo-Shu grid, quantum score |
| DIM 05 | **Synergy** | 🔄 READY | Compatibility scoring between two profiles (Algorithm defined) |
| DIM 06 | **Chronos** | 📦 PLANNED | Daily frequency calculation for retention |
| DIM 03+ | **Tuning** | 📦 PLANNED | Fine-tuning of personal frequency |

## 5.2 App Architecture Pattern

Every app follows the **Strict Separation Pattern**:

```
/apps/[dimension]/
├── index.html          # Single entry: <script type="module" src="./render.js">
├── render.js           # UI Layer: Events, State Subscribers, destroy()
├── logic.js            # (if needed) Pure calculations, no DOM
└── styles.css          # (optional) App-specific additions
```

## 5.3 The Standard render.js Template

```javascript
/**
 * /apps/[app]/render.js
 * UI Layer — The King's Face
 */

import { state } from '../../shared/core/state.js';
import { actions } from '../../shared/core/actions.js';
import { dom, animateValue, showTerminalLoader } from '../../shared/ui/dom_utils.js';
import { nav } from '../../shared/ui/navigation.js';
import { renderAuth } from '../../shared/ui/render_auth.js';
import { i18n } from '../../shared/core/i18n.js';

export const appRender = {
  // MEMORY LEAK FIX: Track all subscriptions
  _unsubscribers: [],
  _listeners: [],
  _timers: [],
  _animations: [],

  init() {
    // 1. Event Binding
    const calcBtn = document.getElementById('calc-btn');
    if (calcBtn) {
      const handler = async () => {
        calcBtn.disabled = true;
        await showTerminalLoader('results', 1500);
        actions.dispatch('calculateApp', { input: getInput() });
        calcBtn.disabled = false;
      };
      calcBtn.addEventListener('click', handler);
      this._listeners.push({ element: calcBtn, type: 'click', handler });
    }

    // 2. State Subscriptions
    this._unsubscribers.push(
      state.subscribe('appDone', (res) => this.renderResults(res.data))
    );

    this._unsubscribers.push(
      state.subscribe('appFailed', (res) => {
        dom.setText('error', `❌ ${res.error}`);
      })
    );

    // 3. Action Registration (Logic)
    actions.register('calculateApp', (payload) => {
      // Pure calculation (or delegate to logic.js)
      const result = performCalculation(payload.input);
      state.emit('appDone', result);
      return result;
    });

    // 4. System Boot (Order matters!)
    actions.initSystem();
    nav.bindNavigation();
    nav.registerCurrentApp(this);  // Critical for memory cleanup
    renderAuth.init();

    // 5. Scroll animations
    dom.initScrollReveal();
  },

  /**
   * MEMORY LEAK FIX: Complete cleanup
   */
  destroy() {
    // Unsubscribe from state
    this._unsubscribers.forEach(unsub => unsub && unsub());
    this._unsubscribers = [];

    // Remove event listeners
    this._listeners.forEach(({ element, type, handler }) => {
      element.removeEventListener(type, handler);
    });
    this._listeners = [];

    // Clear timers
    this._timers.forEach(id => clearTimeout(id));
    this._timers = [];

    // Cancel animations
    this._animations.forEach(cleanup => cleanup());
    this._animations = [];

    console.log('[App Render] Destroyed — All resources released');
  },

  renderResults(data) {
    dom.clear('results-container');
    // Use dom.createEl for XSS-safe rendering
    dom.createEl('div', {
      className: 'result-card',
      text: `Result: ${data.value}`,
      parent: document.getElementById('results-container')
    });
  }
};

// Auto-init
appRender.init();
```

## 5.4 Finance App (DIM 01)

**Logic:** Compound interest with monthly additions
```javascript
// apps/finance/logic.js
export function calculateCompoundInterest(principal, rate, years, monthlyAddition) {
  const r = rate / 100;
  const months = years * 12;
  let balance = principal;
  let totalInvested = principal;

  for (let i = 0; i < months; i++) {
    balance = balance * (1 + r / 12) + monthlyAddition;
    totalInvested += monthlyAddition;
  }

  return {
    success: true,
    data: {
      finalBalance: Math.round(balance),
      totalInvested: Math.round(totalInvested),
      totalInterest: Math.round(balance - totalInvested),
      years: years,
      effectiveRate: rate
    }
  };
}
```

## 5.5 Numerology App (DIM 03)

**Features:**
- Life Path Number calculation
- Soul Urge (Vowels)
- Expression (Consonants + Vowels)
- Personality (Consonants)
- Birthday Number
- Maturity Number
- Personal Year/Month/Day
- Challenge Numbers
- Pinnacle Cycles
- Lo-Shu Grid (Chinese numerology)
- Quantum Resonance Score
- PDF Artifact Generation (jsPDF)
- Share Card Generation (Canvas)

**Unified Profile:** All calculations consolidated via `orchestrator.js`

---

# 6. 🚀 THE "PLUG & PLAY" RECYCLING BLUEPRINT

## 6.1 How to Add a New Dimension (Step-by-Step)

### Step 1: Create Directory Structure
```bash
mkdir apps/newdimension
touch apps/newdimension/index.html
touch apps/newdimension/render.js
touch apps/newdimension/logic.js  # optional
```

### Step 2: Create index.html
```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NEWDIM — MBRN</title>
  <link rel="stylesheet" href="../../shared/ui/theme.css">
  <link rel="stylesheet" href="../../shared/ui/components.css">
</head>
<body>
  <!-- Sidebar Navigation -->
  <nav class="nav-sidebar">
    <div class="nav-brand">MBRN</div>
    <a href="#" data-route="dashboard" class="nav-link">◈ Dashboard</a>
    <a href="#" data-route="finance" class="nav-link">◉ Finance</a>
    <a href="#" data-route="numerology" class="nav-link">◐ Numerology</a>
    <a href="#" class="nav-link active">◆ Newdim</a>
  </nav>

  <!-- Main Content -->
  <main class="app-container">
    <header class="app-header">
      <h1 class="text-display">NEWDIM</h1>
      <p class="text-muted">Built to be used</p>
    </header>

    <section class="input-section">
      <div class="form-group">
        <label>Input Parameter</label>
        <input type="text" id="input-param" class="input-field" placeholder="Enter value...">
      </div>
      <button id="calc-btn" class="btn btn-primary">Calculate</button>
    </section>

    <section id="results" class="results-section"></section>
  </main>

  <script type="module" src="./render.js"></script>
</body>
</html>
```

### Step 3: Create render.js
```javascript
import { state } from '../../shared/core/state.js';
import { actions } from '../../shared/core/actions.js';
import { dom, animateValue, showTerminalLoader } from '../../shared/ui/dom_utils.js';
import { nav } from '../../shared/ui/navigation.js';
import { renderAuth } from '../../shared/ui/render_auth.js';
import { i18n } from '../../shared/core/i18n.js';

export const newdimRender = {
  _unsubscribers: [],
  _listeners: [],
  _timers: [],

  init() {
    // Bind UI events
    const calcBtn = document.getElementById('calc-btn');
    if (calcBtn) {
      const handler = async () => {
        const input = document.getElementById('input-param').value.trim();
        if (!input) {
          dom.setText('error', i18n.t('enterInput'));
          return;
        }

        calcBtn.disabled = true;
        await showTerminalLoader('results', 1500);
        actions.dispatch('calculateNewdim', { input });
        calcBtn.disabled = false;
      };
      calcBtn.addEventListener('click', handler);
      this._listeners.push({ element: calcBtn, type: 'click', handler });
    }

    // Subscribe to state events
    this._unsubscribers.push(
      state.subscribe('newdimDone', (res) => this.renderResults(res.data))
    );

    this._unsubscribers.push(
      state.subscribe('newdimFailed', (res) => {
        dom.setText('error', `❌ ${res.error}`);
      })
    );

    // Register action (can also import from logic.js)
    actions.register('calculateNewdim', (payload) => {
      // Pure calculation
      const result = {
        value: payload.input.length * 42,  // Example calculation
        timestamp: Date.now()
      };
      state.emit('newdimDone', { success: true, data: result });
      return { success: true, data: result };
    });

    // Boot sequence
    actions.initSystem();
    nav.bindNavigation();
    nav.registerCurrentApp(this);
    renderAuth.init();
    dom.initScrollReveal();
  },

  destroy() {
    this._unsubscribers.forEach(unsub => unsub && unsub());
    this._listeners.forEach(({ element, type, handler }) => {
      element.removeEventListener(type, handler);
    });
    this._timers.forEach(id => clearTimeout(id));
    console.log('[Newdim] Destroyed');
  },

  renderResults(data) {
    const container = document.getElementById('results');
    dom.clear(container.id);

    const card = dom.createEl('div', {
      className: 'result-card',
      parent: container
    });

    const valueEl = dom.createEl('span', {
      className: 'value-massive',
      text: '0',
      parent: card
    });

    animateValue(valueEl, 0, data.value, 1500);

    dom.createEl('span', {
      className: 'value-label',
      text: 'Calculated Value',
      parent: card
    });
  }
};

newdimRender.init();
```

### Step 4: Register Route
In `shared/core/config.js`:
```javascript
export const MBRN_ROUTES = {
  // ... existing routes
  newdim: 'apps/newdimension/index.html'
};

export const MBRN_ROUTE_META = {
  // ... existing meta
  newdim: { icon: '◆', label: 'Newdim', tier: 0 }
};
```

### Step 5: Add Translations (Optional)
In `shared/core/config.js` under `i18n.de` and `i18n.en`:
```javascript
i18n: {
  de: {
    // ... existing
    enterInput: '⚠️ Bitte Eingabe eingeben',
    routes: {
      // ... existing
      newdim: 'Newdim'
    }
  },
  en: {
    // ... existing
    enterInput: '⚠️ Please enter input',
    routes: {
      // ... existing
      newdim: 'Newdim'
    }
  }
}
```

### Step 6: Update Navigation in All Apps
Add the new link to the sidebar in:
- `apps/finance/index.html`
- `apps/numerology/index.html`
- `dashboard/index.html`
- `apps/newdimension/index.html` (copy from existing)

## 6.2 Data Flow Architecture

```
┌─────────────┐    User Input     ┌─────────────┐
│   User      │ ────────────────> │  render.js  │
└─────────────┘                   └──────┬──────┘
                                         │
                                         │ actions.dispatch()
                                         ▼
                                  ┌─────────────┐
                                  │  actions.js │
                                  │   Registry  │
                                  └──────┬──────┘
                                         │
                                         │ Execute Handler
                                         ▼
                                  ┌─────────────┐
                                  │  logic.js   │
                                  │ Pure Calc   │
                                  └──────┬──────┘
                                         │
                                         │ state.emit()
                                         ▼
                                  ┌─────────────┐
                                  │  state.js   │
                                  │   Pub/Sub   │
                                  └──────┬──────┘
                                         │
                                         │ Notify Subscribers
                                         ▼
                                  ┌─────────────┐
                                  │  render.js  │
                                  │  Subscriber │
                                  └──────┬──────┘
                                         │
                                         │ dom_utils.js
                                         ▼
                                  ┌─────────────┐
                                  │     DOM     │
                                  └─────────────┘
```

## 6.3 The Architect's Law for New Apps

Every new app MUST fulfill:

1. **Dashboard Compatible** (Pillar 4) — Integrates with MBRN Dashboard
2. **API-Ready** (Pillar 2) — Logic isolated, could be exposed as REST endpoint
3. **Data-Enrichable** (Pillar 3) — Clear input/output defined for pipeline feeding
4. **Meta-Generator Compatible** (Pillar 1) — Modular & parameterizable for auto-generation

**If an idea doesn't fulfill all 4 → adapt or discard.**

---

# 7. ✅ PHASE READINESS STATUS

## Phase 0 — FOUNDATION ✅ COMPLETE
| Component | Status |
|-----------|--------|
| MBRN Architecture (Pub/Sub, Registry, XSS-safe) | ✅ |
| Supabase Auth + DB + Edge Functions | ✅ |
| Finance App (DIM 01) | ✅ |
| Numerology App (DIM 03) | ✅ |
| Dashboard + Streak System | ✅ |
| PDF Engine (jsPDF) | ✅ |
| Circuit Breaker + Fallback State | ✅ |
| i18n (DE/EN) | ✅ |
| Error Boundary + Logging | ✅ |
| Documentation (000_* v5.0) | ✅ |

## Phase 1 — WTF-MOMENT LANDING PAGE ✅ COMPLETE (April 2026)
| Component | Status |
|-----------|--------|
| Starry Sky Design System | ✅ |
| Theme.css + Components.css | ✅ |
| Root index.html (Premium Landing) | ✅ |
| Mobile-first Responsive | ✅ |
| DE + EN Support | ✅ |
| Navigation to Dashboard/Apps | ✅ |

## Phase 2 — SYNERGY ENGINE 🔄 READY
| Component | Status |
|-----------|--------|
| App Structure (`apps/synergy/`) | 🔄 Ready |
| Algorithm Defined | 🔄 Ready |
| Formula: `S_sync = 100 - Σ(ΔV_i × W_i)` | 🔄 Ready |
| Implementation | ⏳ Pending |

**Algorithm:**
```javascript
export function calculateSynergy(profileA, profileB) {
  // Weights: life_path 0.5, expression 0.3, soul 0.2
  const weights = { lifePath: 0.5, expression: 0.3, soul: 0.2 };

  const deltaLifePath = Math.abs(profileA.lifePath - profileB.lifePath);
  const deltaExpression = Math.abs(profileA.expression - profileB.expression);
  const deltaSoul = Math.abs(profileA.soul - profileB.soul);

  const synergyScore = 100 - (
    deltaLifePath * weights.lifePath +
    deltaExpression * weights.expression +
    deltaSoul * weights.soul
  );

  return {
    success: true,
    data: {
      synergyScore: Math.round(synergyScore),
      resonanceZones: [],  // Array of compatible areas
      frictionPoints: [],  // Array of potential conflicts
      verdict: synergyScore > 70 ? 'High Compatibility' :
               synergyScore > 40 ? 'Moderate Compatibility' :
               'Challenging Compatibility'
    }
  };
}
```

## Phase 3 — CHRONOS PROTOCOL 📦 PLANNED
| Component | Status |
|-----------|--------|
| Daily Frequency Calculation | 📦 Planned |
| UTC-Safe Time Logic | 📦 Planned |
| Retention Trigger | 📦 Planned |

## Phase 4+ — DATA ARBITRAGE / B2B API / META-GENERATOR 📋 VISION
| Component | Status |
|-----------|--------|
| Python Data Pipeline (Local) | 📋 Vision |
| B2B REST API (Supabase Edge) | 📋 Vision |
| Meta-Generator for Auto-Tools | 📋 Vision |

---

# 8. 🛡️ SECURITY & COMPLIANCE CHECKLIST

## 8.1 RLS Policies (Verified 2026-04-13)
- [x] `profiles`: SELECT (auth.uid() = id)
- [x] `profiles`: INSERT (auth.uid() = id)
- [x] `profiles`: UPDATE (auth.uid() = id)
- [x] `profiles`: DELETE — Not allowed (no policy)
- [x] `app_data`: RLS enforced per user_id
- [x] `transactions`: Read-only via session verification

## 8.2 Data Arbitrage Rules (DSGVO Compliant)
- **FORBIDDEN:** Scraping personal data (private emails, social media profiles)
- **FOCUS:** Structural B2B data, company registers, public financial metrics, trend keywords, technology stacks
- **Rule:** We trade in patterns and system data, never in identities

## 8.3 Input Validation
- [x] Date validation with calendar checking (leap years, month lengths)
- [x] Name validation (length, character types)
- [x] Email validation (format, domain blocklist)
- [x] Numeric validation (range, float/integer)

## 8.4 XSS Protection
- [x] `textContent` used exclusively (never `innerHTML`)
- [x] `dom_utils.js` provides sanitized element creation
- [x] Template system clones nodes (no string injection)

---

# 9. 📊 TECH STACK REFERENCE

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Language** | Vanilla JavaScript (ES6 Modules) | Zero dependencies, maximum control |
| **State** | Pub/Sub Event System (`state.js`) | Decoupled, reactive, no framework lock-in |
| **Storage** | LocalStorage (primary) + Supabase (sync) | Instant-on UX with cloud persistence |
| **Backend** | Supabase (PostgreSQL + Auth + Edge Functions) | RLS-secured, no own server needed |
| **Styling** | CSS Variables (`theme.css`) | Single source of truth |
| **DOM** | `dom_utils.js` (sanitized) | XSS-safe |
| **PDF** | jsPDF (ESM CDN) | Client-side artifact generation |
| **Deploy** | GitHub Pages (Frontend) + PWA | Zero-cost, offline-capable |
| **AI** | Supabase Edge Functions + Gemini API | Free tier capable |

**NO-BUILD-POLICY:** No Webpack, no Vite, no npm for production. All imports mandatory with `.js` extension.

---

# 10. 🎯 ARCHITECT'S DIRECTIVE

## The Fundamental Principles

1. **Membran over Monolith:** Every dimension is a perspective on the same fundament
2. **Code as Law:** The 15 Iron Laws are absolute — no exceptions without Architect approval
3. **Fail Graceful:** Circuit breaker, fallback state, error boundaries — UX never breaks
4. **Recycle Infinitely:** Every module strengthens the 4 Pillars
5. **WTF or Nothing:** If it feels like a website, redo it

## For The Strategic AI Reading This

Before proposing ANY modification:

1. **Verify Architecture Compliance:** Does it violate Laws 1-15?
2. **Check Memory Safety:** Does it implement proper `destroy()` cleanup?
3. **Validate Structured Returns:** Does every function return `{ success, data?, error? }`?
4. **Confirm XSS Safety:** Is DOM manipulation via `dom_utils.js` only?
5. **Assess 4-Pillar Impact:** Does it strengthen the compound interest effect?

**If unsure → ask. If confident → execute with precision.**

---

> *"MBRN — built to be used"*
> 
> **Status:** MASTER DIRECTIVE ACTIVE  
> **System Architect:** Flase  
> **Document Version:** 1.0 — The Omniscient Handover  

---

**END OF MANIFEST**
