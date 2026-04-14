
| Element      | Dark Mode | Light Mode |
| ------------ | --------- | ---------- |
| Hintergrund  | `#000000` | `#F6F7F9`  |
| Haupttext    | `#FFFFFF` | `#1A1A1A`  |
| Akzent       | `#D3D3D3` | `#6B6B78`  |
| Linien/Icons | `#B7B7B7` | `#C4C9D1`  |

:root {
  /* CORE BRAND */
  --bg: #0a0a0f;
  --bg-soft: #12121a;

  --text: #eaeaf4;
  --text-dim: rgba(234,234,244,0.6);

  --accent-main: #8b5cf6;   /* EIN klares MBRN Lila */
  --accent-soft: rgba(139,92,246,0.12);
  --accent-glow: rgba(139,92,246,0.28);

  --border: rgba(255,255,255,0.08);
  --card: rgba(15,15,25,0.8);
}

Numerologie:

--feature-accent: var(--accent-main);
--feature-secondary: #f59e0b; /* Gold bleibt */


Finanz:

--feature-accent: var(--accent-main);
--feature-secondary: #38bdf8; /* Blau */



## 🧪 Beispiel: Chaos vs System

### ❌ Aktuell (Finanz)

--purple  
--purple-dim  
--purple-glow  
--accent  
--accent-dim  
--accent-glow

👉 zu viel → unklar

---

### ✅ Besser

--accent-main  
--accent-dim  
--accent-glow

👉 fertig. Klar. Wiedererkennbar.


## 🎯 Mein klares Urteil

- Finanzrechner → **technisch stärker**
- Numerologie → **emotional stärker**

👉 Ziel:  
**Fusion → „MBRN = emotional + technisch“**




okay wir machen jetzt aus den 7 + master prompt insgesamt 11 prompts für jeden wichtigen schritt damit alles bis auf das ich immer checke und teste die KI selbstständig am code arbeitet und ich nur die zahlen eingeben muss. Das coole soll sein das passend zum prompt die zahl und das was der prompt tut passend zu der numerologischen bedeutung der zahl ist nach dem pythagoaischen system wir fangen schritt für schritt an ich sende dir gleich einmal alle und dann planst du erstmal die aufteilung der prompts und sagst wenn du bereit bist dann sende ich dir schritt für schritt den alten prompt du gibst den neuen (angepasst an numerologie und workflow) und dann wartest du bis ich den nächsten alten prompt schicke den du dann auch wieder überarbeitest mit den gleichen bedingungen. fasse einmal zusammen was deine aufgabe ist wie wir das machen usw damit ich sehe ob du mich richtig verstehst



| Zahl   | Name / Rolle           | Numerologische Bedeutung                     | Kurzbeschreibung                                                                                                 |           |                        |                                             |
| ------ | ---------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------- | ---------------------- | ------------------------------------------- |
| **1**  | Projekt-Pionier        | 1 = Kreativität, Start, Führung              | Analysiere Projektstruktur, Dateien, Tech, Quick Wins                                                            |           |                        |                                             |
| **2**  | Stabilitäts-Check      | 2 = Kooperation, Harmonie                    | Fix & Improve: Bugs, Logik, Performance, Cleanup                                                                 |           |                        |                                             |
| **3**  | Kreativ-Upgrade        | 3 = Ausdruck, Optimismus, UI                 | UI/UX Upgrade: Layout, Buttons, Inputs, Hierarchie                                                               |           |                        |                                             |
| **4**  | Ordnungs-Baumeister    | 4 = Disziplin, Struktur, Stabilität          | Brand Consistency: Navigation, Footer, Typografie                                                                |           |                        |                                             |
| **5**  | Feature-Explorer       | 5 = Abenteuer, Veränderung                   | Neue Features implementieren, sauber integriert                                                                  |           |                        |                                             |
| **6**  | Performance-Hüter      | 6 = Verantwortung, Vision                    | **7**                                                                                                            | AI-Sucher | 7 = Analyse, Intuition | AI-Integration / Co-Pilot Features einfügen |
| **8**  | Test-Manager           | 8 = Kontrolle, Macht                         | Test & QA: Unit-Tests, E2E, Coverage, Stabilität                                                                 |           |                        |                                             |
| **9**  | Komponenten-Humanist   | 9 = Vollendung, Zusammenführung              | Shared Components: Navigation, Footer, Theme-System                                                              |           |                        |                                             |
| **11** | Release-Visionär       | 11 = Intuition, Überblick                    | Deployment & Release: Build, PWA, Manifest, Versionierung                                                        |           |                        |                                             |
| **22** | Dokumentations-Meister | 22 = Große Pläne in Realität umsetzen        | Dokumentation, Performance-Budget, Meta-Dokumentation, strategische Übersicht                                    |           |                        |                                             |
| **33** | Master-Lehrer          | 33 = Universelle Führung, Weisheit, Synthese | Übergeordneter Meta-Prompt: Alle Prompts orchestrieren, Workflow sicherstellen, Konsistenz und Prinzipien wahren |           |                        |                                             |







# MBRN Codebase - Complete Architecture Analysis

## 📊 Gesamtarchitektur-Diagramm

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MBRN ECOSYSTEM v4.0                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐   ┌────────┐ │
│  │  FinanzRechner  │    │ discipline-track│    │ NumerologieRech │   │  MBRN  │ │
│  │   (v1.4)        │    │    (v2.2)       │    │    (v1.0)       │   │(v2.1)  │ │
│  │                 │    │                 │    │                 │   │        │ │
│  │ • Zinsberechnung│    │ • Habit Tracker │    │ • 36 Kennzahlen │   │ Landing│ │
│  │ • ETF Szenarien │    │ • Premium CTA   │    │ • Pythagoras    │   │ • Brand│ │
│  │ • Live Preise   │    │ • Share Cards   │    │ • Lo-Shu Matrix │   │ • Hub  │ │
│  │ • Chart.js      │    │ • Snapshots     │    │ • Canvas Export │   │        │ │
│  │ • PWA + Tests   │    │ • Onboarding    │    │ • PWA + Docs    │   │        │ │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘   └───┬────┘ │
│           │                      │                      │                │      │
│           └──────────────────────┴──────────────────────┘                │      │
│                                    │                                     │      │
│                           ┌────────▼────────┐                            │      │
│                           │  SHARED LAYER   │                            │      │
│                           │                 │                            │      │
│   ┌───────────────────────┼─────────────────┼───────────────────────────┘      │
│   │                       │                 │                                  │
│   │  ┌────────────────────┴─┐  ┌──────────┴──────┐  ┌─────────────────────┐   │
│   │  │    STYLES (CSS)      │  │  SCRIPTS (JS)     │  │  ENERGY-SYSTEM      │   │
│   │  │  • mbrn-theme.css    │  │  • state-validator│  │  • Premium Engine   │   │
│   │  │  • mbrn-finanz.css   │  │  • secure-storage │  │  • Particles        │   │
│   │  │  • mbrn-numerologie   │  │  • rate-limiter   │  │  • Blackholes       │   │
│   │  │  • mbrn-discipline    │  │  • coingecko-vali │  │  • Ripples          │   │
│   │  │  • DESIGN-SYSTEM.md  │  │  • download-fonts │  │  • Presets          │   │
│   │  └──────────────────────┘  └───────────────────┘  └─────────────────────┘   │
│   │                                                                             │
│   │  ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  │                    NAVIGATION & THEMING                            │   │
│   │  │  • navigation.js (auto-injection)  • theme-toggle.js (dark/light)   │   │
│   │  └─────────────────────────────────────────────────────────────────────┘   │
│   │                                                                             │
│   └─────────────────────────────────────────────────────────────────────────────┘
│                                                                                 │
│  DATA FLOW:                                                                     │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐                      │
│  │User Input│───▶│ Validation│───▶│ Calculation│───▶│ Render   │                      │
│  │         │    │ (Schema) │    │ (Engine)  │    │ (DOM)    │                      │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘                      │
│       │                                        │                                │
│       ▼                                        ▼                                │
│  ┌─────────────────────────────────────────────────────────────┐               │
│  │                    STORAGE LAYER                             │               │
│  │  localStorage (encrypted) │  sessionStorage │  URL-Params     │               │
│  └─────────────────────────────────────────────────────────────┘               │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Technologie-Stack Übersicht

| Projekt | Frontend | Backend | Tests | Storage | Besonderheiten |
|---------|----------|---------|-------|---------|----------------|
| **FinanzRechner** | Vanilla JS + Chart.js | None | Vitest + Playwright | localStorage | CSP, PWA, Live API |
| **discipline-tracker** | Vanilla JS | None | Playwright + Vitest | localStorage + URL | Snapshots, Share Cards |
| **NumerologieRechner** | Vanilla JS + Canvas | None | Manual + E2E | localStorage + URL | Canvas Export, Docs |
| **MBRN** | HTML5 + CSS3 | None | None | None | Landing Page, Energy System |

---

## ⚠️ Identifizierte Sicherheitslücken & Inkonsistenzen

### 🔴 HIGH PRIORITY

1. **Duplizierte Security Utilities**
   - [escapeHtml()](cci:1://file:///c:/DevLab/Projects/Repositoris/NumerologieRechner/numerology.js:28:0-35:1) existiert in 3 Projekten identisch
   - [safeSetText()](cci:1://file:///c:/DevLab/Projects/Repositoris/NumerologieRechner/numerology.js:62:0-68:1) / [safeClear()](cci:1://file:///c:/DevLab/Projects/Repositoris/FinanzRechner/app.js:19:0-24:1): leichte Variationen
   - **Risiko**: Inkonsistente Updates, Wartungsaufwand

2. **Console Logs in Production** (33 Instanzen gesamt)
   ```
   FinanzRechner: 9 logs
   NumerologieRechner: 15 logs
   discipline-tracker: 6 logs
   MBRN: 3 logs
   Shared: 2 logs
   ```

3. **Fehlende CSP auf einigen Seiten**
   - NumerologieRechner: Keine Content-Security-Policy Meta-Tag gefunden
   - MBRN: CSP vorhanden aber `frame-ancestors` wird ignoriert (Meta-Limitation)

4. **API-Key Platzhalter**
   - FinanzRechner: Affiliate-IDs als Platzhalter
   - NumerologieRechner: Sentry DSN nicht konfiguriert

### 🟡 MEDIUM PRIORITY

5. **Inkonsistente State Management**
   - discipline-tracker: JSON Schema Validation (gut!)
   - FinanzRechner: Keine Schema-Validierung
   - NumerologieRechner: Manuelle Validierung

6. **Verschiedene Test-Setups**
   - FinanzRechner: Vitest + Playwright (modern)
   - discipline-tracker: Playwright + Vitest (gut)
   - NumerologieRechner: Keine automatisierten Tests sichtbar

7. **Energy System Duplizierung**
   - Code existiert in [shared/energy-system/](cci:9://file:///c:/DevLab/Projects/Repositoris/shared/energy-system:0:0-0:0) (korrekt)
   - Aber auch Referenzen in einzelnen Projekten prüfen

### 🟢 LOW PRIORITY

8. **Theme-Toggle Inkonsistenz**
   - MBRN: Nutzt `data-theme` Attribut
   - Andere: Nutzen `classList.toggle('light-mode')`
   - **Impact**: Theme-Wechsel funktioniert, aber nicht einheitlich

9. **PWA Manifeste**
   - Alle haben manifest.json, aber Icons/Scope unterschiedlich

---

## 🎯 Optimierter Projektplan

### Phase 1: Core Refactoring (SWE 1.5 - 2 Wochen)

#### 1.1 Shared Security Layer
```
shared/security/
├── sanitize.js          # escapeHtml, safeString, safeNumber
├── dom-operations.js    # safeSetText, safeClear, safeSetHtml
├── validators.js        # Schema-Validierung (JSON)
└── storage.js           # secureStorage, rateLimitedStorage
```

#### 1.2 Unified State Management
```javascript
// shared/state/state-manager.js
class StateManager {
  constructor(schema, options = {}) {
    this.schema = schema;
    this.storage = options.storage || 'localStorage';
    this.encrypt = options.encrypt || false;
    this.version = options.version || '1.0';
  }
  
  load() { /* Schema-Validierung + Migration */ }
  save(data) { /* Validierung + Speicherung */ }
  migrate(oldData) { /* Version-Handling */ }
}
```

#### 1.3 Unified Theme System
```javascript
// shared/theming/theme-manager.js
class ThemeManager {
  constructor() {
    this.prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    this.setupListener();
  }
  
  // Einheitliche API für alle Projekte
  setTheme(theme) { /* 'dark' | 'light' | 'auto' */ }
  getTheme() { return document.documentElement.getAttribute('data-theme'); }
  toggle() { /* Toggle zwischen dark/light */ }
}
```

### Phase 2: Backend-Struktur (Optional - 1 Woche)

Da alle Projekte client-seitig sind, empfehle ich:

```
backend/ (optional für API-Features)
├── api/
│   ├── prices/          # CoinGecko Proxy (Rate Limiting)
│   ├── share/           # Share-Link Generation
│   └── analytics/       # Aggregated Stats (anonymisiert)
├── functions/           # Serverless Functions (Vercel/Netlify)
└── middleware/
    ├── cors.js
    ├── rate-limiter.js
    └── auth.js          # Für Admin-Features
```

### Phase 3: Frontend-Modernisierung (Phoenix - 2 Wochen)

#### 3.1 Component Library
```javascript
// shared/components/
├── Button/
│   ├── Button.js
│   ├── Button.css
│   └── Button.test.js
├── Card/
├── Modal/
├── Input/
└── Chart/
```

#### 3.2 Design System Tokens
```css
/* shared/styles/tokens.css */
:root {
  /* Colors */
  --color-primary-500: #9d50bb;
  --color-primary-600: #7c3aed;
  
  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  /* ... */
  
  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

---

## 📋 Task-Liste für SWE 1.5

### Week 1: Core Infrastructure

| Task                                       | Priority | Est. Time | Acceptance Criteria                                                   |
| ------------------------------------------ | -------- | --------- | --------------------------------------------------------------------- |
| **T1.1** Erstelle `shared/security/` Modul | P0       | 4h        | Alle sanitize-Funktionen zentralisiert, Tests laufen                  |
| **T1.2** Refactore State Management        | P0       | 6h        | StateManager Klasse, Schema-Validierung, Migration-System             |
| **T1.3** Unified Theme Manager             | P0       | 3h        | Einheitliche API, `data-theme` Standard, Auto-Detection               |
| **T1.4** Console Logger Utility            | P1       | 2h        | `MBRNLogger` mit Levels (debug, info, warn, error), Production-Filter |
| **T1.5** CSP Header Generator              | P1       | 3h        | Meta-Tag Generator, Hash-Berechnung für Inline-Scripts                |

### Week 2: Testing & Integration

| Task | Priority | Est. Time | Acceptance Criteria |
|------|----------|-----------|---------------------|
| **T2.1** Unit Tests für Security Module | P0 | 4h | 100% Coverage für sanitize.js, validators.js |
| **T2.2** Integration Tests State Manager | P0 | 4h | localStorage/URL-Param Integration, Migration Tests |
| **T2.3** Refactore FinanzRechner | P1 | 6h | Nutzt neue shared/security/, Tests grün |
| **T2.4** Refactore discipline-tracker | P1 | 6h | Nutzt StateManager, behält Snapshot-Features |
| **T2.5** Refactore NumerologieRechner | P2 | 8h | Canvas-Export bleibt, neue Security Layer |

### Week 3: API & Backend (Optional)

| Task | Priority | Est. Time | Acceptance Criteria |
|------|----------|-----------|---------------------|
| **T3.1** Serverless API Setup | P2 | 4h | Vercel/Netlify Functions, Rate Limiting |
| **T3.2** CoinGecko Proxy | P2 | 3h | Caching, Error Handling, Timeout |
| **T3.3** Share-Link Service | P2 | 4h | URL-Shortening, Expiry, Analytics |
| **T3.4** Admin Dashboard | P3 | 8h | Basic Stats, Project Health, Error Logs |

---

## 🎨 UX/Frontend Vorschläge für Phoenix

### 1. **Unified Navigation Component**
```javascript
// Aktuell: navigation.js kopiert in jedes Projekt
// Besser: Shared Web Component

class MBRNNavigation extends HTMLElement {
  constructor() {
    super();
    this.projects = [
      { name: 'MBRN', url: '/', icon: 'home' },
      { name: 'Finanzen', url: '/finanzrechner/', icon: 'chart' },
      { name: 'Numerologie', url: '/numerologie/', icon: 'sparkles' },
      { name: 'Disziplin', url: '/disziplin/', icon: 'target' },
    ];
  }
  
  connectedCallback() {
    this.render();
    this.setupThemeToggle();
  }
}
customElements.define('mbrn-nav', MBRNNavigation);
```

### 2. **Loading States & Skeleton Screens**
```css
/* Statt einfachem "Loading..." Text */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-secondary) 25%,
    var(--bg-tertiary) 50%,
    var(--bg-secondary) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-md);
}
```

### 3. **Micro-Interactions**
```javascript
// Button Ripple Effect
// Toast Notifications (statt alert)
// Success Animation bei Form Submit
// Number Counter Animation (FinanzRechner)
```

### 4. **Accessibility Improvements**
- ARIA Labels für alle Interaktive Elemente
- Keyboard Navigation (Tab, Enter, Escape)
- Focus Indicators
- Screen Reader Support für Charts

---

## ⚡ Phoenix Fast Optimierungen

### Schnelle Wins (1-2 Tage)

1. **Console Logs bereinigen**
   ```javascript
   // Suche: console.log|warn|error
   // Ersetze durch: MBRNLogger.debug() (falls Debug-Mode)
   // Oder: Entfernen für Production
   ```

2. **CSS Bundle Optimierung**
   ```bash
   # PurgeCSS für ungenutzte Styles
   # Critical CSS extrahieren
   # Minifizierung
   ```

3. **Image Optimierung**
   ```bash
   # WebP Konvertierung
   # Responsive Images (srcset)
   # Lazy Loading
   ```

4. **JavaScript Bundle Splitting**
   ```javascript
   // Dynamische Imports für schwere Komponenten
   const NumerologyEngine = await import('./numerology-engine.js');
   ```

### Code-Beispiel: Logger Utility
```javascript
// shared/utils/logger.js
const MBRNLogger = {
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  
  debug(...args) { if (this.level === 'debug') console.log('[MBRN]', ...args); },
  info(...args) { if (['debug', 'info'].includes(this.level)) console.info('[MBRN]', ...args); },
  warn(...args) { if (['debug', 'info', 'warn'].includes(this.level)) console.warn('[MBRN]', ...args); },
  error(...args) { console.error('[MBRN]', ...args); },
  
  // Spezial-Logger für Performance
  perf(label, fn) {
    const start = performance.now();
    const result = fn();
    this.debug(`${label}: ${(performance.now() - start).toFixed(2)}ms`);
    return result;
  }
};

// Usage:
MBRNLogger.debug('Initializing app...'); // Nur in Dev
MBRNLogger.error('Failed to load prices'); // Immer
```

### Code-Beispiel: Unified Theme Toggle
```javascript
// shared/theming/theme-manager.js
class ThemeManager {
  constructor() {
    this.STORAGE_KEY = 'mbrn-theme';
    this.prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Initial load
    this.loadTheme();
    
    // Listen for system changes
    this.prefersDark.addEventListener('change', (e) => {
      if (this.getStoredTheme() === 'auto') {
        this.applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
  
  loadTheme() {
    const stored = this.getStoredTheme();
    const theme = stored === 'auto' 
      ? (this.prefersDark.matches ? 'dark' : 'light')
      : stored;
    this.applyTheme(theme);
  }
  
  getStoredTheme() {
    return localStorage.getItem(this.STORAGE_KEY) || 'auto';
  }
  
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('light-mode', theme === 'light');
    this.dispatchEvent(theme);
  }
  
  setTheme(theme) {
    localStorage.setItem(this.STORAGE_KEY, theme);
    this.loadTheme();
  }
  
  toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    this.setTheme(current === 'dark' ? 'light' : 'dark');
  }
  
  dispatchEvent(theme) {
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }
}

// Global instance
window.themeManager = new ThemeManager();
```

---

## 📊 Prioritäten-Matrix

| Impact | Low Effort | High Effort |
|--------|-----------|-------------|
| **High** | • Console Logs bereinigen<br>• Cache-Buster erhöhen<br>• Theme unification | • Security Layer refactoring<br>• State Manager unification<br>• Component Library |
| **Low** | • Meta-Tags optimieren<br>• README updates<br>• Favicon check | • Backend API setup<br>• Admin Dashboard<br>• E2E Test Expansion |

---




---

### 🔹 Prompt-Struktur für jeden Task

> **Context**: Du hast Zugriff auf das Projektverzeichnis und dort die Datei `roadmap.md`, die die gesamte Architektur, Security, UX, Optimierungen und Prioritäten enthält. Bevor du irgendetwas machst, **liest du die Datei aufmerksam durch**.  
> **Task**: Führe nur das aus, was im Prompt für diesen Task steht. Konzentriere dich darauf, die Richtlinien aus `roadmap.md` einzuhalten.  
> **Output**: Gib sauber kommentierten Code, Dokumentation oder Testresultate zurück – je nach Task.

---

Hier ein **Beispiel-Prompt für T1.1 (Shared Security Module)**:

```
🔹 Prompt für Task T1.1: Erstelle shared/security/ Modul

1️⃣ Lies zuerst die roadmap.md Datei im Projektverzeichnis aufmerksam.
2️⃣ Ziel: Erstelle das `shared/security/` Modul gemäß Phase 1: Core Refactoring.
3️⃣ Enthaltene Dateien:
   - sanitize.js          # escapeHtml, safeString, safeNumber
   - dom-operations.js    # safeSetText, safeClear, safeSetHtml
   - validators.js        # Schema-Validierung (JSON)
   - storage.js           # secureStorage, rateLimitedStorage
4️⃣ Anforderungen:
   - Einheitliche API für alle Projekte (FinanzRechner, discipline-tracker, NumerologieRechner)
   - Sicherheit gemäß roadmap.md (Sanitization, Schema-Validierung, Secure Storage)
   - Tests für jede Funktion einplanen
5️⃣ Gib den kompletten Code zurück, kommentiert, mit kurzen Usage-Beispielen.
```

---

### 🔹 Prompt-Beispiel für T1.2: State Manager Refactoring

```
🔹 Prompt für Task T1.2: Refactore State Management

1️⃣ Lies zuerst die roadmap.md Datei im Projektverzeichnis aufmerksam.
2️⃣ Ziel: Implementiere die `StateManager` Klasse wie in Phase 1 beschrieben.
3️⃣ Anforderungen:
   - Schema-Validierung für Daten
   - Migration / Version Handling
   - Storage wahlweise localStorage oder URL-Params
   - Observer-Pattern optional einbauen (für Phoenix Phase 3)
4️⃣ Gib den kompletten Code zurück, kommentiert, mit Usage-Beispielen.
```

---

### 🔹 Prompt-Beispiel für T1.3: Unified Theme Manager

```
🔹 Prompt für Task T1.3: Unified Theme Manager

1️⃣ Lies zuerst die roadmap.md Datei im Projektverzeichnis aufmerksam.
2️⃣ Ziel: Implementiere eine zentrale Theme-Manager Klasse für alle Projekte.
3️⃣ Anforderungen:
   - Einheitliche API für dark/light/auto
   - Nutzt `data-theme` Attribut
   - Beobachtet System-Preferences
   - Globaler Zugriff: window.themeManager
4️⃣ Gib den kompletten Code zurück, kommentiert, mit Usage-Beispielen.
```

---

### 🔹 Prompt-Beispiel für T1.4: Console Logger Utility

```
🔹 Prompt für Task T1.4: Console Logger Utility

1️⃣ Lies zuerst die roadmap.md Datei im Projektverzeichnis aufmerksam.
2️⃣ Ziel: Erstelle `MBRNLogger` Utility wie in Phase 1 beschrieben.
3️⃣ Anforderungen:
   - Log Levels: debug, info, warn, error
   - Produktion: nur warn/error
   - Optional: perf() für Performance Messungen
4️⃣ Gib den kompletten Code zurück, kommentiert, mit Usage-Beispielen.
```

---

### 🔹 Prompt-Beispiel für T1.5: CSP Header Generator

```
🔹 Prompt für Task T1.5: CSP Header Generator

1️⃣ Lies zuerst die roadmap.md Datei im Projektverzeichnis aufmerksam.
2️⃣ Ziel: Erstelle Utility zum automatischen Generieren von Content-Security-Policy Meta-Tags.
3️⃣ Anforderungen:
   - Hash-Berechnung für Inline Scripts
   - Einfache Integration in alle Projekte
   - Optional: Testfälle für Meta-Tag Validierung
4️⃣ Gib den kompletten Code zurück, kommentiert, mit Usage-Beispielen.
```

---

### 🔹 Prompt-Beispiel für Week 2 Tasks (Testing & Integration)

**T2.1 Unit Tests für Security Module**

```
🔹 Prompt für Task T2.1: Unit Tests für Security Module

1️⃣ Lies zuerst die roadmap.md Datei im Projektverzeichnis aufmerksam.
2️⃣ Ziel: Schreibe Unit Tests für sanitize.js und validators.js.
3️⃣ Anforderungen:
   - 100% Coverage
   - Beispielhafte Testfälle für alle Sanitizer-Funktionen
   - Jest/Vitest-kompatibel
4️⃣ Gib die Testdateien zurück, kommentiert.
```

**T2.2 Integration Tests State Manager**

```
🔹 Prompt für Task T2.2: Integration Tests State Manager

1️⃣ Lies zuerst die roadmap.md Datei im Projektverzeichnis aufmerksam.
2️⃣ Ziel: Teste die StateManager Klasse vollständig:
   - localStorage Integration
   - URL-Params Integration
   - Migration Tests
3️⃣ Gib die Testdateien zurück, kommentiert.
```

**T2.3 Refactore FinanzRechner**

```
🔹 Prompt für Task T2.3: Refactore FinanzRechner

1️⃣ Lies zuerst die roadmap.md Datei im Projektverzeichnis aufmerksam.
2️⃣ Ziel: Refactore FinanzRechner:
   - Nutzt shared/security/
   - Tests müssen grün laufen
   - StateManager optional integrieren
3️⃣ Gib die angepassten Dateien und kurze Änderungsbeschreibung zurück.
```

**T2.4 Refactore discipline-tracker**

```
🔹 Prompt für Task T2.4: Refactore discipline-tracker

1️⃣ Lies zuerst die roadmap.md Datei im Projektverzeichnis aufmerksam.
2️⃣ Ziel: Refactore discipline-tracker:
   - Nutzt StateManager
   - Snapshot-Features erhalten
3️⃣ Gib die angepassten Dateien und kurze Änderungsbeschreibung zurück.
```

**T2.5 Refactore NumerologieRechner**

```
🔹 Prompt für Task T2.5: Refactore NumerologieRechner

1️⃣ Lies zuerst die roadmap.md Datei im Projektverzeichnis aufmerksam.
2️⃣ Ziel: Refactore NumerologieRechner:
   - Canvas-Export bleibt erhalten
   - Neue Security Layer integriert
3️⃣ Gib die angepassten Dateien und kurze Änderungsbeschreibung zurück.
```

---

### 🔹 Prompt-Beispiel für Week 3 Tasks (API & Backend Optional)

**T3.1 Serverless API Setup**

```
🔹 Prompt für Task T3.1: Serverless API Setup

1️⃣ Lies zuerst die roadmap.md Datei im Projektverzeichnis aufmerksam.
2️⃣ Ziel: Einrichtung Serverless Functions (Vercel/Netlify)
3️⃣ Anforderungen:
   - Basis-Struktur mit middleware (CORS, Rate Limiter)
   - Beispiel-Funktion bereitstellen
4️⃣ Gib die komplette Struktur + Beispiel-Code zurück.
```

**T3.2 CoinGecko Proxy**

```
🔹 Prompt für Task T3.2: CoinGecko Proxy

1️⃣ Lies zuerst die roadmap.md Datei im Projektverzeichnis aufmerksam.
2️⃣ Ziel: Proxy-API für CoinGecko:
   - Caching
   - Error Handling
   - Timeout
3️⃣ Gib die vollständige Implementation zurück.
```

**T3.3 Share-Link Service**

```
🔹 Prompt für Task T3.3: Share-Link Service

1️⃣ Lies zuerst die roadmap.md Datei im Projektverzeichnis aufmerksam.
2️⃣ Ziel: URL-Shortening, Expiry, Analytics
3️⃣ Gib die komplette Implementation zurück.
```

**T3.4 Admin Dashboard**

```
🔹 Prompt für Task T3.4: Admin Dashboard

1️⃣ Lies zuerst die roadmap.md Datei im Projektverzeichnis aufmerksam.
2️⃣ Ziel: Admin Dashboard:
   - Grundlegende Stats
   - Project Health
   - Error Logs
3️⃣ Gib die komplette Implementation zurück.
```

---

Wenn du willst, kann ich **direkt alle diese Prompts als fertige Markdown-Datei** generieren, sodass du die pro Task kopieren & in jeden KI-Switch einfügen kannst.

Willst du, dass ich das jetzt mache?


| Task                                     | Primäres Modell | Optional / Doppel-Check                            | Begründung                                                                                                              |
| ---------------------------------------- | --------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **T1.1 Shared Security Module**          | **SWE 1.5**     | Kimi K2.5 für Architekturcheck                     | SWE 1.5 für sauberen Security-Code; Kimi prüft Struktur & Konsistenz über Projekte                                      |
| **T1.2 State Manager Refactoring**       | **SWE 1.5**     | Kimi K2.5 + Phoenix (Observer-Pattern / UX-Impact) | SWE 1.5 implementiert StateManager; Kimi prüft Architektur & Synchronisation, Phoenix kann UX/Feature-Reaktionen prüfen |
| **T1.3 Unified Theme Manager**           | **SWE 1.5**     | Phoenix für UX-Check                               | SWE 1.5 implementiert Theme-Manager, Phoenix optimiert UX-Flow & Auto-Detection                                         |
| **T1.4 Console Logger Utility**          | **SWE 1.5**     | Phoenix Fast für kleine Syntax-Tweaks              | SWE 1.5 schreibt Logger, Phoenix Fast ersetzt Mini-Fixes / Dev-Mode Filter                                              |
| **T1.5 CSP Header Generator**            | **SWE 1.5**     | Kimi K2.5 für Security-Architektur                 | SWE 1.5 erstellt Code, Kimi prüft CSP-Policy Konsistenz & Meta-Hashes                                                   |
| Task                                     | Primäres Modell | Optional / Doppel-Check                            | Begründung                                                                                                              |
| **T2.1 Unit Tests Security Module**      | **SWE 1.5**     | Phoenix Fast für Test-Syntax                       | SWE 1.5 schreibt Tests & Coverage, Fast prüft Mini-Tweaks                                                               |
| **T2.2 Integration Tests State Manager** | **SWE 1.5**     | Kimi K2.5 für Architektur/Flow                     | SWE 1.5 für Integration, Kimi prüft globale Synchronisation / Observer-Pattern                                          |
| **T2.3 Refactore FinanzRechner**         | **SWE 1.5**     | Kimi K2.5 für Systemcheck                          | SWE 1.5 refactort Code + Tests, Kimi prüft, dass Features & Security einheitlich sind                                   |
| **T2.4 Refactore discipline-tracker**    | **SWE 1.5**     | Phoenix für UX-Flow                                | SWE 1.5 Refactor, Phoenix überprüft Snapshots & Share Cards UX                                                          |
| **T2.5 Refactore NumerologieRechner**    | **SWE 1.5**     | Kimi K2.5 für Canvas / Security                    | SWE 1.5 implementiert Security Layer, Kimi prüft Canvas-Export & Architektur                                            |
| Task                                     | Primäres Modell | Optional / Doppel-Check                            | Begründung                                                                                                              |
| **T3.1 Serverless API Setup**            | **SWE 1.5**     | Kimi K2.5 für Architektur                          | SWE 1.5 implementiert Funktionen, Kimi prüft Systemintegration & Middleware                                             |
| **T3.2 CoinGecko Proxy**                 | **SWE 1.5**     | Phoenix Fast für kleine Fixes                      | SWE 1.5 für Proxy & Caching, Fast für Mini-Adjustments                                                                  |
| **T3.3 Share-Link Service**              | **SWE 1.5**     | Phoenix für UX                                     | SWE 1.5 erstellt Service, Phoenix checkt Link-Flow & Analytics                                                          |
| **T3.4 Admin Dashboard**                 | **SWE 1.5**     | Kimi K2.5 für Architektur, Phoenix für UX          | SWE 1.5 Code + Backend, Kimi Architekturcheck, Phoenix UI/Flow                                                          |
| Task                                     | Primäres Modell | Optional / Doppel-Check                            |                                                                                                                         |
| Navigation Web Component                 | **Phoenix**     | Kimi K2.5 Architekturcheck                         |                                                                                                                         |
| Loading States / Skeleton                | **Phoenix**     | Fast für kleine CSS/Animation-Tweaks               |                                                                                                                         |
| Micro-Interactions                       | **Phoenix**     | Fast für Mini-Fixes                                |                                                                                                                         |
| Accessibility Improvements               | **Phoenix**     | Claude 3.5/4.6 für UX-Standards                    |                                                                                                                         |



# 🏆 2026 AI Master-Workflow – Programmieren & Website/Software

**Ziel:** Alle Modelle in Windsurf & Co. wie ein kleines AI-Dev-Team orchestrieren, maximale Effizienz bei großen Projekten, Automation & UX.

---

## 1️⃣ Kimi K2.5 – The Grand Architect & Logic Engine

**Rolle:** Architekt + Multitasking-Guru  
**Stärken:**  
- Riesiges Kontextfenster (2M+ Tokens) → komplette Codebase & Dokumentation gleichzeitig im Blick  
- Multimodal → Text, Screenshots, Mockups → fertiger Code  
- Agent Swarm → bis zu 100 Sub-Agenten parallel für Analyse, Security Checks, Optimierungen  
- Perfekt für Frontend + komplexe Workflows  

**Schwächen:**  
- Langsamer bei kleinen Änderungen  
- Overkill für einfache Bugfixes  

**Wann nutzen:**  
- Neue Systeme planen (z.B. Python-Automatisierungen, API-Integrationen)  
- UI modernisieren, Screenshots/Mocups in Code umwandeln  
- Große Projekte analysieren oder Security/Architektur prüfen  

**Workflow-Tipp:**  
- Immer zuerst einsetzen, um das **Systemdesign & die Architektur** festzulegen  
- Nutze Agent Swarm für parallele Tasks → „Analysiere alle Dateien auf Sicherheitslücken“

---

## 2️⃣ SWE 1.5 – The Special Forces Agent

**Rolle:** Bugfixer & Autonomer Code-Macher  
**Stärken:**  
- Speziell für Debugging & sauberen Code trainiert  
- Führt Tests aus, kann Linter-Fehler direkt fixen  
- Arbeitet in der IDE selbstständig → „autonome Ausführung“  
- Extrem stabil bei Backend, Automatisierungen, Logik  

**Schwächen:**  
- Weniger kreativ  
- Kein Fokus auf UI/UX  
- Regular throughput → langsamer als Phoenix Fast, aber tiefgründig  

**Wann nutzen:**  
- Komplexe Python-/JS-Skripte reparieren  
- Automatisierungen debuggen  
- Unit-Tests erstellen & ausführen  

**Workflow-Tipp:**  
- Übernimmt **die harte Denkarbeit**, nachdem Kimi die Architektur definiert hat  
- Hauptwerkzeug für sauberen, getesteten Backend-Code

---

## 3️⃣ Phoenix – The Creative Builder

**Rolle:** Ideen- & UX-Entwickler  
**Stärken:**  
- Schnellere Ideen- und Feature-Entwicklung  
- UX, UI-Flow, Struktur & Designentscheidungen  
- Solide Code-Generierung  

**Schwächen:**  
- Weniger präzise bei Debugging  
- Nicht so mächtig bei großen Projekten wie Kimi  

**Wann nutzen:**  
- UX/Produkt-Verbesserungen  
- Neue Features brainstormen  
- Zwischen Kimi & SWE ergänzend für UX-Tweaks  

**Workflow-Tipp:**  
- Nutze für „feine UX-Tweaks“  
- Gut kombinierbar mit Phoenix Fast für kleine Änderungen

---

## 4️⃣ Phoenix Fast – The Flow-Pilot

**Rolle:** Speedrunner für kleine Anpassungen  
**Stärken:**  
- Minimale Latenz → Autocomplete & kleine Tweaks in Echtzeit  
- Perfekt für Boilerplate, Syntax-Fixes  
- Flow-Beschleuniger beim Tippen  

**Schwächen:**  
- Oberflächlicheres Verständnis  
- Mehr Fehler bei komplexem Code  

**Wann nutzen:**  
- Kleine Tweaks  
- Schnelle Änderungen  
- Autocomplete & Mini-Fixes

---

## 🔁 Perfekter Workflow für komplexe Projekte

1. **Analyse & Architektur → Kimi K2.5**  
   „Plane die Logik, analysiere die Security, erstelle den Bauplan für Datenbank & UI“  
2. **Autonome Umsetzung → SWE 1.5**  
   „Code schreiben, Tests ausführen, Bugs fixen, Linter-Fehler beseitigen“  
3. **UX & Feature → Phoenix**  
   „Neue Ideen, UX verbessern, Struktur optimieren“  
4. **Speed Tweaks → Phoenix Fast**  
   „Mini-Fixes, Autocomplete, kleine Änderungen in Echtzeit“

---

## 🏷️ Kurzvergleich / Cheat Table

| Modell | Stärke | Use Case |
|--------|--------|---------|
| **Kimi K2.5** | Strategie, Swarm-Logik, UI | Systemdesign, Frontend, große Projekte |
| **SWE 1.5** | Debugging, saubere Architektur | Backend, Automation, Bugfixing |
| **Phoenix** | UX, Ideen, Feature-Entwicklung | UX-Tweaks, Feature-Brainstorm |
| **Phoenix Fast** | Geschwindigkeit & kleine Fixes | Syntax, Autocomplete, Mini-Tweaks |

---

## 💡 Extras – Dein erweitertes AI-Team

- **Claude 3.5/4.6 (Free)** → Second Opinion für komplexe Logik oder mathematische Eleganz  
- **Gemini 3.1 (Free)** → Live-Recherche, neueste Library-Updates  
- **ChatGPT (Free)** → Erklärbär für Konzepte & Verständnis

---

## 📝 Experten-Tipp

- Starte ein Projekt **immer mit Kimi K2.5** → Architektur & Systemdesign  
- Übergib anschließend **SWE 1.5** → Implementation & Bugfixing  
- Nutze **Phoenix/Phoenix Fast** → UX, kleine Tweaks, Flow-Optimierung  
- Ergänze externe Modelle (Claude/Gemini/ChatGPT) für **Recherche & Logik-Checks**







# 🤖 TASK → KI ZUWEISUNG (AKTUELL)

## Week 1: Core Infrastructure ✅ COMPLETE
| Task                            | Primär      | Check               | Status |
| ------------------------------- | ----------- | ------------------- | ------ |
| **T1.1** Shared Security Module | **SWE 1.5** | Kimi K2.5           | ✅ Done |
| **T1.2** State Manager          | **SWE 1.5** | Kimi K2.5 + Phoenix | ✅ Done |
| **T1.3** Theme Manager          | **SWE 1.5** | Phoenix             | ✅ Done |
| **T1.4** Console Logger         | **SWE 1.5** | Fast                | ✅ Done |
| **T1.5** CSP Generator          | **SWE 1.5** | Kimi K2.5           | ✅ Done |
| **T1.6** Shared Resources       | **SWE 1.5** | Kimi K2.5           | ✅ Done |

## Week 2: Testing & Integration ⏳ READY
| Task                                 | Primär      | Check     | Status    |
| ------------------------------------ | ----------- | --------- | --------- |
| **T2.1** Unit Tests Security         | **SWE 1.5** | Fast      | ⏳ Waiting |
| **T2.2** Integration Tests State     | **SWE 1.5** | Kimi K2.5 | ⏳ Waiting |
| **T2.3** Refactor FinanzRechner      | **SWE 1.5** | Kimi K2.5 | ⏳ Waiting |
| **T2.4** Refactor discipline-tracker | **SWE 1.5** | Phoenix   | ⏳ Waiting |
| **T2.5** Refactor NumerologieRechner | **SWE 1.5** | Kimi K2.5 | ⏳ Waiting |
|                                      |             |           |           |

## Week 3: API & Backend ⏳ WAITING
| Task | Primär | Check | Status |
|------|--------|-------|--------|
| **T3.1** Serverless API | **SWE 1.5** | Kimi K2.5 | ⏳ Waiting |
| **T3.2** CoinGecko Proxy | **SWE 1.5** | Fast | ⏳ Waiting |
| **T3.3** Share-Link Service | **SWE 1.5** | Phoenix | ⏳ Waiting |
| **T3.4** Admin Dashboard | **SWE 1.5** | Kimi + Phoenix | ⏳ Waiting |

## Week 4: Cleanup & Optimization ⏳ WAITING
| Task | Primär | Check | Status |
|------|--------|-------|--------|
| **T4.1** Console Logs Cleanup | **SWE 1.5** | Fast | ⏳ Waiting |
| **T4.2** Platzhalter Ersetzen | **SWE 1.5** | Kimi K2.5 | ⏳ Waiting |
| **T4.3** Test-Code Entfernen | **SWE 1.5** | Fast | ⏳ Waiting |
| **T4.4** Error Handling | **SWE 1.5** | Kimi K2.5 | ⏳ Waiting |
| **T4.5** ES6 Modules | **SWE 1.5** | Kimi K2.5 | ⏳ Waiting |
| **T4.6** Build-Prozess | **SWE 1.5** | Kimi K2.5 | ⏳ Waiting |
| **T4.7** Dokumentation | **SWE 1.5** | Phoenix | ⏳ Waiting |

## Phase 2: Monetization ⏳ READY
| Task                         | Primär      | Check   | Status |
| ---------------------------- | ----------- | ------- | ------ |
| **2.1** Numerologie Premium  | **SWE 1.5** | Phoenix | ✅ Done |
| **2.2** Sentry & Log Cleanup | **SWE 1.5** | Fast    | ✅ Done |

## Phase 3: Growth ⏳ WAITING
| Task                               | Primär      | Check     | Status |
| ---------------------------------- | ----------- | --------- | ------ |
| **3.1** Ghost-Mode Traffic Engine  | **SWE 1.5** | Kimi K2.5 | ✅ Done |
| **3.2** 90-Tage Cashflow Dashboard | **SWE 1.5** | Kimi K2.5 | ✅ Done |

## UX/UI Spezialaufgaben ⏳ WAITING
| Task | Primär | Check | Status |
|------|--------|-------|--------|
| **Nav** Web Component | **Phoenix** | Kimi K2.5 | ⏳ Waiting |
| **Loading** States | **Phoenix** | Fast | ⏳ Waiting |
| **Micro** Interactions | **Phoenix** | Fast | ⏳ Waiting |
| **A11y** Improvements | **Phoenix** | Kimi K2.5 | ⏳ Waiting |

## 3-Task Review Checkpoints
| Wann | Wer | Status |
|------|-----|--------|
| Nach T1.1, T1.2, T1.6 | **Kimi K2.5 + Benutzer** | ✅ Complete |
| Nach T1.3, T1.4, T1.5 | **SWE 1.5** | ✅ Complete |
| Nach T2.1, T2.2, T2.3 | **Kimi K2.5 + Benutzer** | ⏳ Pending |
| Nach T3.1, T3.2, T3.3 | **Kimi K2.5 + Benutzer** | ⏳ Pending |
| Nach T4.1, T4.2, T4.3 | **Kimi K2.5 + Benutzer** | ⏳ Pending |

---

**Regel:** SWE 1.5 macht die Arbeit, andere KIs prüfen je nach Fokus:
- **Kimi K2.5** = Architektur, System, Security
- **Phoenix** = UX, Design, Flow  
- **Fast** = Quick Fixes, Syntax, Mini-Tweaks