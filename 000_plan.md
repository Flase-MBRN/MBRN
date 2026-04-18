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

### D1-D2: Design Phase (Phase 1.0 WTF-Moment)
- ✅ Landing Page Sternenhimmel-Design (`index.html`)
- ✅ Syne Font + #05050A Hintergrund implementiert
- ✅ `theme.css` + `components.css` konsolidiert
- ✅ WTF-Test bestanden (erste Reaktion: "was ist das")

---

---

## 🚀 AKTIVE MISSION: PHASE 5.0 — INFRASTRUCTURE COMPLETION (THE UNIVERSE PROTOCOL)

> **UNIVERSE PROTOCOL DIREKTIVE:** Professionalität vor Sichtbarkeit. 
> Wir bauen das gesamte "Universum" (die vollständige, hochprofessionelle Infrastruktur) bevor der erste externe Kontakt stattfindet. Kein MVP. Keine frühen User. Keine Marketing-Tests auf halbfertigen Systemen. 
> Vollständige technische Autonomie ist die einzige akzeptable "Definition of Done" für Phase 1. Alle Apps müssen zu 100% funktionsfähig, stabil und im kompromisslosen MBRN-Design-Standard finalisiert sein.

### DIE ZENTRALEN ROLLEN (EXECUTION ALIGNMENT)
**Rolle 1: System Architect (Erik)**
Fokus auf den vollen Ausbau der Pillar-Architektur (P1-P4), Python-Bridges (Data Arbitrage), KI-Automatisierung und kompromisslose Systemstabilität. Baut die Kathedrale in einem fertigen Universum. Keine Ablenkung durch Traffic-Generierung oder iterativen Launch-Quatsch. 

**Rolle 2: Reach-Engine (Klaudia)**
Bekommt ein fertiges, professionelles Toolset zur Hand, *sobald das Universum zu 100% steht*. Keine "Low-Effort" TikTok-Tests, sondern ein strategischer Rollout auf Basis eines fertigen Produkts. Klaudia startet erst, wenn das System so ausgereift ist, dass externe Nutzer sofort den gebührenden Respekt vor der Professionalität haben.

> **Gesetz:** `000_ARCHITECTURE.md` Law of Pillar Isolation + Universe Protocol sind aktiv.
> **Referenz:** `000_RECYCLING_SOP.md` — Der Masterplan für Ideen-Blitze.

### 5.0 — SÄULEN-ISOLATION & MIGRATION
```
Task 5.0.1: ✅ Law of Pillar Isolation in 000_ARCHITECTURE.md verankert
Task 5.0.2: ✅ /scripts/pipelines/ erstellt für Pillar 3 (Data Arbitrage)
Task 5.0.3: ✅ /templates/ erstellt für Pillar 1 (Meta-Generator)
Task 5.0.4: ✅ /shared/core/logic/finance.js — Logik-Migration abgeschlossen
Task 5.0.5: ✅ apps/finance/logic.js — Entfernt (Clean Migration)
```

### 5.1 — GLOBAL UI OVERHAUL (PILLAR 4: ECOSYSTEM)
```
Task 5.1.1: ✅ Glassmorphism auf `apps/finance/index.html`
Task 5.1.2: ✅ Glassmorphism auf `apps/numerology/index.html`
Task 5.1.3: ⏳ SVG Icon Set erstellen (statt Unicode-Icons)
Task 5.1.4: ✅ `dashboard/index.html` Sternenhimmel-Migration
```

### 5.2 — SÄULE 3: DATA ARBITRAGE (PYTHON/OLLAMA)
```
Task 5.2.1: market_sentiment_fetcher.py Skeleton erstellt
  - Location: /scripts/pipelines/market_sentiment_fetcher.py
  - Library: yfinance für Marktdaten (optional: requests, BeautifulSoup)
  - Ollama: Llama 3 Integration für lokales Sentiment-Scoring
  - Output: JSON mit definiertem Schema nach AI/models/data/

Task 5.2.2: Ollama-Anreicherung lokal (RX 7700 XT)
  - Input: Rohdaten JSON aus Yahoo Finance
  - Model: llama3.1:8b oder mistral (lokal via Ollama auf localhost:11434)
  - Output: Angereicherte Daten mit MBRN-Sentiment-Score (0-100)
  - Ziel: Daten "veredeln" bevor sie in Supabase landen

Task 5.2.3: Pipeline-Automatisierung
  - Cron/Scheduler für regelmäßige Daten-Aktualisierung
  - Error-Handling und Retry-Logik
  - Logging nach /scripts/pipelines/logs/
```

### 5.3 — VERTICAL SLICE: MARKET SENTIMENT CHRONOS (ALLE 4 SÄULEN)
```
Task 5.3.1: Pillar 2 → Supabase Edge Function für Daten-Import
  - Input: JSON vom Python-Skript (Pillar 3 Output)
  - Auth: Service Role Key (lokal→Cloud)
  - Table: `market_sentiment` (id, timestamp, source, sentiment_score, raw_data, mbrn_enriched)
  - Location: /supabase/functions/market-sentiment-import/

Task 5.3.2: Pillar 4 → Dashboard Widget für Sentiment-Anzeige
  - Location: `dashboard/index.html`
  - Visual: Mini-Chart oder Score-Badge (Starry Sky Design)
  - Real-time: Supabase Subscription oder Poll
  - Integration: Chronos-Style (Tagesfrequenz-Metapher für Markt-Stimmung)

Task 5.3.3: Pillar 1 → Template-Extraktion
  - Pattern: "Data-Pipeline → Edge Function → Dashboard Widget"
  - Speicherung: /templates/market_sentiment_blueprint.json
  - Ziel: Wiederverwendung für zukünftige Daten-Module

Task 5.3.4: SMOKE TEST (End-to-End < 5 Minuten)
  - Python-Skript läuft (P3) → Daten in DB (P2) → Sichtbar im Dashboard (P4)
  - Ollama-Anreicherung aktiv → MBRN-Score berechnet
  - B2B-API-Test: Edge Function extern aufrufbar
```

---

## ⏳ PHASE 4.0: ECOSYSTEM EXPANSION (ARCHIVIERT)

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

Task 14.4: shared/core/logic/synergy.js
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
| **D1-D2: Design Phase** | WTF-Moment erreicht | ✅ Archiviert |
| **M13: Logic Core** | 4 Tasks | ✅ COMPLETE |
| **M14: Synergy Engine** | 5 Tasks | ✅ COMPLETE |
| **M15: Chronos Protocol** | 4 Tasks | ✅ COMPLETE |
| **M16: Frequency Tuner** | 4 Tasks | ✅ COMPLETE |
| **5.1** | Global UI Overhaul | ✅ COMPLETE |
| **5.2** | Säule 3 Setup | ✅ COMPLETE |
| **5.3** | Vertical Slice | ✅ COMPLETE |
| **6.0** | The Klaudia Engine (Social Hooks/Pillar 1) | 🔄 NEXT FOCUS |
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

**STATUS: PLAN_v8.0_VERTICAL_SLICE_COMPLETE**
*System Architect Out.*
