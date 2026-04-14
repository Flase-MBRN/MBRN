# 🎯 000_plan.md — MBRN MASTER EXECUTION PLAN v5.0

> **System Architect Directive:**
> Eine Phase = Ein konkreter Task, max. 50-100 LOC oder 1-3 Files.
> Kein "bau das ganze System"-Prompt. Step-by-step. Testbar. Review-fähig.

---

## 🛠️ SYSTEM-ARCHITECT GOTCHAS (Kritische Gesetze)

1. **ES6-Import-Pflicht:** Alle Imports zwingend mit `.js` Endung. Kein Build-Tool.
2. **Boot-Sequenz:** Jede Seite ruft `actions.initSystem()` auf — NACH allen Subscriptions.
3. **Script Isolation:** `type="module"` in allen HTML-Dateien obligatorisch.
4. **Ein Script-Tag pro Seite:** Das Render-Modul übernimmt Boot + Nav + Registration.
5. **UTC-Mapping:** Alle chronologischen Berechnungen auf UTC-Basis. Zeitzonen-Bug ist FATAL.
6. **Debouncing:** Keystroke-intensive Features (Frequency Tuner) mit 300ms Debounce.
7. **Action Registry:** Neue Apps registrieren via `actions.register()` — Core niemals anfassen.
8. **Navigation:** `getRepoRoot()` in `navigation.js` — kein `<base href>`.
9. **Documentation First:** Komplexe Module (Synergy, Chronos) erfordern .md im `/docs` Ordner.

---

## ✅ ARCHIV: ABGESCHLOSSENE PHASEN

### M0-M5: Core Engine (Phase 1.0)
- ✅ Pub/Sub State Manager (`state.js`)
- ✅ LocalStorage Wrapper (`storage.js`) mit `mbrn_` Prefix
- ✅ XSS-sichere DOM-Utils (`dom_utils.js`)
- ✅ Action Registry Pattern (`actions.js`)
- ✅ Finance App (`apps/finance/`)
- ✅ Timezone-sicheres Streak-System (`streak_manager.js`)
- ✅ Access Control (`access_control.js`)
- ✅ Dashboard mit Check-In
- ✅ Navigation mit dynamischem `getRepoRoot()`

### M6-M9: Cloud & Identity (Phase 2.0)
- ✅ Supabase Integration + RLS
- ✅ Auth (Login/Logout/Session)
- ✅ Cloud-Sync mit Debouncing
- ✅ Canvas Share-Cards

### M10-M12: Artifact (Phase 3.0)
- ✅ Visual Overhaul (Medical Luxury Design)
- ✅ Numerologie App mit 36 Kennzahlen + Lo-Shu + Quantum Score
- ✅ PDF Engine (Vision E: The Operator, 9 Seiten)
- ✅ Stripe Integration (eingefroren, `devBypass: true`)
- ✅ Payment Verification: `api.verifySession()` via `transactions` table (DB-Schema aligned, Webhook → DB → API Kreislauf geschlossen)

---

## 🎨 AKTIVE MISSION: DESIGN PHASE

### D1 — Landing Page (root index.html)
**Ziel:** WTF-Moment. Erster Eindruck ist nicht "schöne Website" sondern "was ist das."

```
Task D1.1: Syne Font laden (Google Fonts)
Task D1.2: Hero-Section — riesiges MBRN (Syne 800, volle Viewport-Breite)
Task D1.3: Hintergrund #05050A (nicht #0d0d1a, nicht #000000)
Task D1.4: Metrics Bar (Tools live, 0 KB Data, ∞ Access)
Task D1.5: Tool-Cards Grid (aktive + geplante Dimensionen)
Task D1.6: Ko-fi Support CTA (freiwillig, kein Druck)
Task D1.7: Footer minimal
Task D1.8: DE + EN Toggle oder separate Routes
```

**Definition of Done:**
Zeig die Seite einem Fremden. Erster Kommentar enthält nicht "schön" sondern "weird" oder "anders".

---

### D2 — Design System (theme.css + components.css)
**Ziel:** Alle Tool-Seiten konsistent mit Landing Page.

```
Task D2.1: theme.css — Sternenhimmel-Variablen
  --bg-primary: #05050A
  --bg-surface: #0A0A0F
  --accent: #7B5CF5
  --border: rgba(255,255,255,0.06)
  --font-display: 'Syne', sans-serif
  --font-body: 'Inter', sans-serif

Task D2.2: components.css — Inputs dark
  background: rgba(255,255,255,0.04)
  border: 1px solid rgba(255,255,255,0.08)
  color: #ffffff

Task D2.3: Buttons — pill-shaped
  border-radius: 50px (primary)
  border-radius: 8px (secondary)

Task D2.4: Cards — MBRN Standard
  background: #0A0A0F
  border: 1px solid rgba(255,255,255,0.06)
  border-radius: 16px
```

**NUR CSS ändern. Kein JS anfassen.**

---

## ⏳ PHASE 4.0: ECOSYSTEM EXPANSION

### M13 — THE LOGIC CORE

```
Task 13.1: /shared/core/modular_logic.js erstellen
  - Mathematische Matrizen initialisieren
  - Export-Interface definieren
  - Asynchrone Verarbeitung via Promise

Task 13.2: Input/Output Validierung
  - Schema für alle Phase-4 Daten definieren
  - Fehlerhafte Geburtsdaten sofort rejekten

Task 13.3: UI Bridge
  - render_dashboard.js um modular_logic integrieren
  - Asynchrone Ergebnisse korrekt subscriben

Task 13.4: SMOKE TEST
  - Komplexe Berechnung läuft ohne UI-Freeze
  - 60 FPS während Berechnung messbar
```

---

### M14 — THE SYNERGY ENGINE

```
Task 14.1: calculateSynergy(profileA, profileB) in modular_logic.js
  Input: { life_path, expression, soul } für jeden Operator
  Output: { synergy_score, resonance_zones[], friction_points[], verdict }
  Formel: S_sync = 100 - Σ(ΔV_i × W_i)

Task 14.2: apps/synergy/index.html
  - Zwei Eingabe-Felder nebeneinander
  - MBRN Design konsistent
  - Ein Script-Tag: render.js übernimmt alles

Task 14.3: apps/synergy/render.js
  - actions.register('calculateSynergy', handler)
  - Pattern: identisch mit apps/numerology/render.js

Task 14.4: apps/synergy/logic.js
  - Pure Functions
  - Kein DOM, kein Window, kein State

Task 14.5: SMOKE TEST
  - Identische Profile → 100% Score deterministisch
  - Verschiedene Profile → Score < 100 mit Friction Points
```

---

### M15 — THE CHRONOS PROTOCOL

```
Task 15.1: calculateChronos(birthDate, today) in modular_logic.js
  - Personal Year = reducePreserveMaster(Monat + Tag + Jahr)
  - Personal Month = reducePreserveMaster(PersonalYear + AktuellerMonat)
  - Personal Day = reducePreserveMaster(PersonalMonth + AktuellerTag)
  - UTC-Mapping: new Date(y, m-1, d) — nie ISO-String!

Task 15.2: apps/chronos/index.html
  - Zeigt nach Login sofort heutige Frequenz
  - Timeline-Ansicht der nächsten 7 Tage

Task 15.3: apps/chronos/render.js
  - actions.register('calculateChronos', handler)
  - Auto-Update bei Mitternacht (setTimeout auf nächsten Tag)

Task 15.4: SMOKE TEST
  - Um 00:01 Uhr → neuer Tages-Zyklus wird angezeigt
  - Zeitzonen-Test: UTC+1 und UTC+2 zeigen gleichen Tag
```

---

### M16 — THE FREQUENCY TUNER

```
Task 16.1: calculateNameFrequency(name, lifePath) in modular_logic.js
  - Namens-Wert nach Pythagoras berechnen
  - Differenz zur Lebenszahl berechnen
  - Alignment-Score 0-100 zurückgeben

Task 16.2: apps/tuning/index.html
  - Textfeld für Namen
  - Echtzeit-Farb-Feedback (Grau → Deep Purple)
  - Debounce 300ms

Task 16.3: apps/tuning/render.js
  - actions.register('calculateFrequency', handler)
  - Debounce-Logik im Event-Listener

Task 16.4: SMOKE TEST
  - Tippen → latenzfreies Feedback
  - API nicht überlastet (Debounce funktioniert)
  - Dissonanter Name → visuelle Warnung
```

---

## 📋 STATUS ÜBERSICHT

| Phase | Tasks | Status |
|-------|-------|--------|
| **M0-M12** | Alle abgeschlossen | ✅ Archiviert |
| **D1: Landing Page** | 8 Tasks | 🔄 Aktiv |
| **D2: Design System** | 4 Tasks | 🔄 Aktiv |
| **M13: Logic Core** | 4 Tasks | ✅ COMPLETE |
| **M14: Synergy Engine** | 5 Tasks | ✅ COMPLETE |
| **M15: Chronos Protocol** | 4 Tasks | ✅ COMPLETE |
| **M16: Frequency Tuner** | 4 Tasks | ✅ COMPLETE |

---

## 🔧 WINDSURF-PROMPT TEMPLATE

Für jeden Task wird Windsurf so instruiert:

```
KONTEXT: Lies zuerst 000_ARCHITECTURE.md und 000_MBRN-CODEX.md.

TASK: [Konkreter Task aus diesem Plan]

REGELN:
- Ein File = Eine Aufgabe
- Kein DOM in Core/Logic
- Structured Returns: { success, data/error }
- Pattern: identisch mit [Referenz-File]
- Kein Build-Tool, kein Framework
- ES6 Imports mit .js Endung

DEFINITION OF DONE: [Konkreter Test]

NICHT anfassen: [Liste der Files die unverändert bleiben]
```

---

**STATUS: PLAN_v5.0_ACTIVE**
*System Architect Out.*
