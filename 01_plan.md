# 🎯 MBRN-HUB-V1: GESAMTPLAN (AI-Optimierte Micro-Phasen)

> **System-Architect Directive:** Eine Phase = Ein konkreter Task, max. 50-100 LOC oder 1-3 Files.  
> Step-by-step, testbar, review-fähig. Keine "bau mal das ganze System"-Prompts.

---

## 🛠️ SYSTEM-ARCHITECT "GOTCHAS" (Kritisch für Reibungsloses Coden)

### 1. Die ES6-Import-Falle (Extrem wichtig)
Da wir **keine Build-Tools** (wie Webpack oder Vite) nutzen, sondern native Browser-Module, müssen alle Imports zwingend die Dateiendung `.js` haben.

- ❌ **Falsch:** `import { state } from './state'` (Gibt sofort 404 Error)
- ✅ **Richtig:** `import { state } from './state.js'`

**Konsequenz für jede Phase:** Alle Import-Statements müssen explizit mit `.js` enden!

### 2. Die "Boot-Sequenz" (Hydratisierung)
Wenn ein User die Seite neu lädt (F5), ist der Arbeits-Speicher (`state.js`) erst mal leer.  
**Lösung:** In Phase 4 (Actions Layer) eine Initialisierungs-Funktion einbauen (`actions.initSystem()`), die beim Start den localStorage ausliest und den State mit gespeicherten Daten füllt.

**Ohne dies:** Das System denkt bei jedem Reload, der User sei neu.

### 3. Skript-Isolation (`type="module"`)
Beim Einbinden von `render.js` oder `actions.js` in HTML immer verwenden:
```html
<script type="module" src="..."></script>
```

**Vorteile:**
- Variablen aus Datei A kollidieren niemals mit Variablen aus Datei B
- Skript wird automatisch erst ausgeführt, wenn HTML fertig geladen ist (wie `defer`)
- Verhindert fehlende DOM-Elemente beim Rendern

---

## 🧱 PHASE 0: FORTRESS FINALISIEREN (Milestone 0 Completion)

**Ziel:** Smoke Test M0 besteht, keine 404s, sauberer Start.

| Sub-Phase | Task | Files | Aufwand |
|-----------|------|-------|---------|
| **0.1** | Ordnerstruktur vollständig anlegen (`/shared/core`, `/shared/loyalty`, `/apps/finance`, `/dashboard`, `/landing`) | nur dirs | 2 min |
| **0.2** | `index.html` validieren — fixe inline-styles entfernen, CSS-Klassen nutzen | `index.html`, `components.css` | 10 min |
| **0.3** | **SMOKE TEST M0** — Browser öffnen, Network-Tab checken, Console auf Errors prüfen | — | 5 min |

**Gotcha-Check:**
- [x] Alle CSS-Imports in HTML korrekt? (rel="stylesheet")
- [x] JS-Imports haben später `.js` Endung?

---

## 🧠 PHASE 1: THE ENGINE — CORE CONFIG (Milestone 1 Start)

**Ziel:** `MBRN_CONFIG` existiert als Single Source of Truth.

| Sub-Phase | Task | Files | Aufwand |
|-----------|------|-------|---------|
| **1.1** | `shared/core/config.js` erstellen — Access Levels, Tiers, Shields, PowerPass als Konstanten | `config.js` | 15 min |
| **1.2** | Config-Export testen — Console-Import prüfen | `index.html` (temp test script) | 5 min |
| **1.3** | **Review Checkpoint:** Config-Werte stimmen mit ARCHITECTURE.md §4 überein? | — | 5 min |

**Gotcha-Check:**
- [x] Export Statement: `export const MBRN_CONFIG = {...}`
- [x] Import in Test: `import { MBRN_CONFIG } from './shared/core/config.js'` (mit .js!)

---

## 💾 PHASE 2: THE ENGINE — STORAGE LAYER

**Ziel:** LocalStorage-Wrapper funktioniert, Prefix `mbrn_` enforced.

| Sub-Phase | Task | Files | Aufwand |
|-----------|------|-------|---------|
| **2.1** | `shared/core/storage.js` — `get()`, `set()`, `remove()` mit Prefix-Handling | `storage.js` | 20 min |
| **2.2** | Storage-Tests: Set → Reload Page → Get funktioniert? | `index.html` | 10 min |
| **2.3** | Error Handling: QuotaExceeded, JSON parse errors abfangen | `storage.js` | 10 min |

**Gotcha-Check:**
- [x] Alle Keys automatisch mit `mbrn_` prefixen?
- [x] JSON.stringify/parse korrekt implementiert?

---

## ⚡ PHASE 3: THE ENGINE — STATE MANAGER (Pub/Sub)

**Ziel:** Event-System läuft, `subscribe` + `emit` funktionieren.

| Sub-Phase | Task | Files | Aufwand |
|-----------|------|-------|---------|
| **3.1** | `shared/core/state.js` — `subscribe(event, callback)` implementieren | `state.js` | 15 min |
| **3.2** | `emit(event, data)` + Subscriber-Aufrufe implementieren | `state.js` | 15 min |
| **3.3** | Unsubscribe-Funktion (optional aber sauber) | `state.js` | 10 min |
| **3.4** | **Smoke Test:** 2 Subscriber auf 'testEvent', emit() prüfen ob beide fired | `index.html` | 10 min |

**Gotcha-Check:**
- [x] Interner State-Storage als Object/Map?
- [x] Subscriber-Array pro Event-Key?

---

## 🔥 PHASE 4: THE ENGINE — ACTIONS LAYER + BOOT-SEQUENZ

**Ziel:** Orchestrator existiert, ruft Logic auf, emitted State-Changes + **Hydratisierung implementiert**.

| Sub-Phase | Task | Files | Aufwand |
|-----------|------|-------|---------|
| **4.1** | `shared/core/actions.js` erstellen — leeres Objekt als Action-Registry | `actions.js` | 10 min |
| **4.2** | Dummy-Action `testAction()` die State emitted + Return-Objekt `{success, data}` | `actions.js` | 15 min |
| **4.3** | **🚨 BOOT-SEQUENZ:** `actions.initSystem()` implementieren — lädt localStorage → füllt State | `actions.js`, `storage.js`, `state.js` | 20 min |
| **4.4** | **Verifikation:** Kein `document.querySelector` in actions.js (ARCHITECTURE-Compliance) | — | 5 min |

**Gotcha-Check:**
- [x] `initSystem()` wird beim App-Start aufgerufen?
- [x] State wird aus Storage wiederhergestellt?
- [x] Alle Imports mit `.js` Endung?

---

## 🛡️ PHASE 5: MASTERY SYSTEM — STREAK MANAGER

**Ziel:** Check-in Logik, Streak++ mit Shield-Verbrauch.

| Sub-Phase | Task | Files | Aufwand |
|-----------|------|-------|---------|
| **5.1** | `shared/loyalty/streak_manager.js` — `calculateStreak(lastCheckIn, today)` | `streak_manager.js` | 20 min |
| **5.2** | Shield-Logik: `canUseShield()`, `useShield()` implementieren | `streak_manager.js` | 15 min |
| **5.3** | Integration mit State: `triggerCheckIn()` Action erweitern | `actions.js` | 15 min |
| **5.4** | **Smoke Test:** Check-in → Streak erhöht → Storage persistiert | `index.html` | 10 min |

**Gotcha-Check:**
- [x] Datum-Vergleiche timezone-sicher?
- [x] Shield-Verbrauch reduziert verfügbare Shields?

---

## 🔐 PHASE 6: MASTERY SYSTEM — ACCESS CONTROL (Gatekeeper)

**Ziel:** Feature-Flags prüfen, Tool-Unlocks validieren.

| Sub-Phase | Task | Files | Aufwand |
|-----------|------|-------|---------|
| **6.1** | `shared/loyalty/access_control.js` — `hasAccessTo(tool)`, `hasFeature(name)` | `access_control.js` | 20 min |
| **6.2** | Config-Integration: Levels aus `MBRN_CONFIG` lesen, keine Magic Numbers | `access_control.js` | 10 min |
| **6.3** | **Smoke Test:** `hasFeature('pdf_export')` gibt false bei Level 0 | `index.html` | 5 min |

**Gotcha-Check:**
- [x] Import: `import { MBRN_CONFIG } from '../core/config.js'` (mit .js!)
- [x] Keine hartkodierten Zahlen, alles aus Config?

---

## 👑 PHASE 7: THE KING — FINANCE LOGIC

**Ziel:** Reine Mathematik, keine UI, pure Functions.

| Sub-Phase | Task | Files | Aufwand |
|-----------|------|-------|---------|
| **7.1** | `apps/finance/logic.js` — Zinseszins-Berechnung `calculateCompoundInterest(principal, rate, years)` | `logic.js` | 20 min |
| **7.2** | Szenario-Vergleich: 2 Varianten berechnen, Delta zurückgeben | `logic.js` | 15 min |
| **7.3** | **Review:** Structured Returns only (`{success, data}` oder `{success, error}`) | `logic.js` | 5 min |

**Gotcha-Check:**
- [x] Kein `document` oder `window` in logic.js?
- [x] Pure Functions (gleicher Input = gleicher Output)?

---

## 🎨 PHASE 8: THE KING — FINANCE RENDER

**Ziel:** UI-Layer, hört auf State-Events, nutzt nur `dom_utils.js`.

| Sub-Phase | Task | Files | Aufwand |
|-----------|------|-------|---------|
| **8.1** | `apps/finance/render.js` — `init()` bindet Event-Listener | `render.js` | 15 min |
| **8.2** | `renderResults(data)` — Ergebnisse via `dom.setText()` anzeigen | `render.js` | 15 min |
| **8.3** | Gatekeeper-Hook: PDF-Export Button nur rendern wenn `hasFeature('pdf_export')` | `render.js` | 10 min |

**Gotcha-Check:**
- [x] Import: `import { dom } from '../../shared/ui/dom_utils.js'` (mit .js!)
- [x] Import: `import { hasFeature } from '../../shared/loyalty/access_control.js'` (mit .js!)
- [x] Kein `innerHTML` oder `document.querySelector` außer über dom_utils?

---

## 📊 PHASE 9: THE MASTERY MIRROR — DASHBOARD

**Ziel:** Nutzer sieht Tier, Streak, verfügbare Tools.

| Sub-Phase | Task | Files | Aufwand |
|-----------|------|-------|---------|
| **9.1** | `dashboard/index.html` — Grundgerüst, lädt shared UI | `dashboard/index.html` | 15 min |
| **9.2** | `dashboard/render_dashboard.js` — Tier-Anzeige, Streak-Counter | `render_dashboard.js` | 20 min |
| **9.3** | State-Subscription: Dashboard updated bei Streak-Change automatisch | `render_dashboard.js` | 15 min |

**Gotcha-Check:**
- [x] `<script type="module" src="render_dashboard.js"></script>`?
- [x] Imports mit `.js` Endung?

---

## 🌍 PHASE 10: UI GLUE — NAVIGATION

**Ziel:** Routing zwischen Landing → Dashboard → Finance ohne State-Verlust.

| Sub-Phase | Task | Files | Aufwand |
|-----------|------|-------|---------|
| **10.1** | `shared/ui/navigation.js` — `navigateTo(route)` Funktion | `navigation.js` | 15 min |
| **10.2** | Navigation-Buttons in alle HTMLs einbinden | `index.html`, `dashboard/index.html`, `apps/finance/index.html` | 15 min |
| **10.3** | **Smoke Test:** Dashboard → Finance → Dashboard, State bleibt erhalten | — | 10 min |

**Gotcha-Check:**
- [x] Navigation erfordert kein Page-Reload (SPA-Prinzip)?
- [x] Oder: State wird vor Navigation persistiert?

---

## 💎 PHASE 11: MONETIZATION — PAYWALL HOOKS

**Ziel:** Premium-Features blockieren, Upgrade-Flow triggerbar.

| Sub-Phase | Task | Files | Aufwand |
|-----------|------|-------|---------|
| **11.1** | Paywall-Modal Komponente in `shared/ui/components.css` + `dom_utils` | `components.css`, `dom_utils.js` | 20 min |
| **11.2** | `actions.showPaywall(feature)` — öffnet Modal bei unautorisiertem Zugriff | `actions.js` | 15 min |
| **11.3** | **Smoke Test:** Klick auf "PDF Export" bei Level 0 → Paywall öffnet | — | 10 min |

**Gotcha-Check:**
- [x] Paywall-Modal via `dom_utils` gerendert (nicht innerHTML)?

---

## 🔗 PHASE 12: BACKEND PREP — API LAYER

**Ziel:** Supabase/Datenbank-Connector ready, Fallback zu LocalStorage.

| Sub-Phase | Task | Files | Aufwand |
|-----------|------|-------|---------|
| **12.1** | `shared/core/api.js` — Dummy-Funktionen für User-Sync | `api.js` | 15 min |
| **12.2** | Fallback-Mechanismus: API-Error → localStorage als Backup | `api.js`, `state.js` | 15 min |
| **12.3** | **Smoke Test:** Async/Await genutzt, um Netzwerk-Latenz (Ping) zu simulieren, System läuft weiter | — | 10 min |

**Gotcha-Check:**
- [x] API-Calls wrapped in try-catch?
- [x] Fallback sofort aktiv bei Fehler?

---

## 📋 ZUSAMMENFASSUNG

| Milestone | Phasen | Status |
|-----------|--------|--------|
| M0: Fortress | 0.1–0.3 | ✅ Completed |
| M1: Engine | 1.1–4.4 | ✅ Completed |
| M2: Mastery | 5.1–6.3 | ✅ Completed |
| M3: Finance App | 7.1–8.3 | ✅ Completed |
| M4: Dashboard | 9.1–10.3 | ✅ Completed |
| M5: Monetization | 11.1–12.3 | ✅ Completed |

**Gesamt:** 12 Phasen, jede ca. 15-30 Minuten Arbeit, strikt sequentiell, testbar.

**Wichtigste Erfolgsfaktoren:**
1. ✅ Alle Imports mit `.js` Endung
2. ✅ `actions.initSystem()` für Hydratisierung
3. ✅ `<script type="module">` für Isolation

---

## 🚀 NÄCHSTER SCHRITT

**Soll mit Phase 0.1 gestartet werden?** (Ordnerstruktur vervollständigen)
