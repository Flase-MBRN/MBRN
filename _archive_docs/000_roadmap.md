> **DEPRECATED:** Historisches Dokument. Nicht als aktuelle Wahrheitsquelle für Agenten nutzen.

# 🗺️ 000_roadmap.md — MBRN MASTER ROADMAP v5.0

> **System Architect Directive:** Diese Roadmap ist das operative Gesetz.
> Keine Phase überspringen. Kein Milestone ohne Definition of Done starten.

---

## ✅ ARCHIV: ABGESCHLOSSENE PHASEN (M0 — M12)

| Phase | Milestone | Status |
|-------|-----------|--------|
| **M0-M5** | Core Engine: Pub/Sub, State, Storage, Finance-Logik, Dashboard | ✅ Done |
| **M6** | Cloud Fortress: Supabase Integration, RLS aktiviert | ✅ Done |
| **M7** | Identity Layer: Auth, Session-Persistenz, Login-Flow | ✅ Done |
| **M8** | Global Mirror: Cloud-Sync (debounced), Multi-Device | ✅ Done |
| **M9** | Viral Satellite: Canvas Share-Cards für Social Media | ✅ Done |
| **M10** | The Void: Visual Overhaul, Glassmorphism, Luxury Glow | ✅ Done |
| **M11** | The Vault: Stripe Integration + Webhook Automation | ✅ Done (eingefroren) |
| **M12** | The Artifact: Premium PDF v3.0 (Vision E: The Operator) | ✅ Done (bypass aktiv) |
| **D1** | Landing Page: Sternenhimmel-Design, WTF-Moment erreicht | ✅ Done |
| **D2** | Design System: theme.css + components.css Migration | ✅ Done |

---

---

## 🚀 PHASE 4.0: ECOSYSTEM EXPANSION

### 🔬 MILESTONE 13 — THE LOGIC CORE (Modular Architecture)
**Ziel:** Asynchrone Logik-Module als Fundament für alle neuen Dimensionen.

| Sub-Phase | Task | File | Status |
|-----------|------|------|--------|
| 13.1 | `modular_logic.js` Setup — mathematische Matrizen initialisieren | `shared/core/modular_logic.js` | ✅ |
| 13.2 | Input/Output Validierung für komplexe Ökosystem-Daten | `modular_logic.js` | ✅ |
| 13.3 | UI Bridge — Integration in Dashboard-Routen | `render_dashboard.js` | ✅ Backend READY |
| 13.4 | **SMOKE TEST** — Komplexe Berechnungen ohne UI-Lag | — | ✅ |

**Gotcha:** Logik strikt von UI-Code getrennt? Asynchron verarbeitet?

---

### 🔗 MILESTONE 14 — THE SYNERGY ENGINE (DIM 05 — BINDUNG)
**Ziel:** Zwei Operator-Blueprints überlagern → Kompatibilitäts-Score berechnen.

**Formel:** `S_sync = 100 - Σ(ΔV_i × W_i)`
Wobei `ΔV_i` = Differenz der Frequenzen (Mental, Emotional, Operativ) und `W_i` = Gewichtung.

| Sub-Phase | Task | File | Status |
|-----------|------|------|--------|
| 14.1 | Synergy Logic — Differenz-Vektor Algorithmus in JS | `modular_logic.js` | ✅ |
| 14.2 | UI Input — Doppel-Datenfeld im MBRN Design | `apps/synergy/index.html` | ⏳ (Phase 5.0) |
| 14.3 | Visual Output — Halbkreis-Diagramme, Gunmetal-Cards | `components.css` | ⏳ (Phase 5.0) |
| 14.4 | **SMOKE TEST** — Identische Blueprints = exakt 100% Score | — | ✅ |

**Supabase Table:** `synergy_connections` (id, operator_a, operator_b_hash, synergy_score, friction_points jsonb)

---

### ⏳ MILESTONE 15 — THE CHRONOS PROTOCOL (DIM 06 — CHRONOS)
**Ziel:** Tägliche Echtzeit-Frequenzen als operatives Navigationsinstrument.

| Sub-Phase | Task | File | Status |
|-----------|------|------|--------|
| 15.1 | Chronos Logic — Personal Year/Month/Day Berechnung | `modular_logic.js` | ✅ IMPLEMENTED |
| 15.2 | Daily Dashboard — Tagesfrequenz nach Login anzeigen | `apps/chronos/index.html` | ⏳ (Phase 5.0) |
| 15.3 | Timeline View — Horizontale Zeitstrahl-Darstellung | `components.css` | ⏳ (Phase 5.0) |
| 15.4 | **SMOKE TEST** — Datumswechsel triggert exakten Frequenz-Shift | — | ✅ PASSED |

**Kritisch:** UTC-Mapping für Zeitzonen-Akkuratheit. Kein Daylight-Saving-Bug.

---

### 🎛️ MILESTONE 16 — THE FREQUENCY TUNER (DIM 03+ — NOMENKLATUR)
**Ziel:** Echtzeit-Abgleich von Namen/Projekttiteln mit der Hardware des Operators.

| Sub-Phase | Task | File | Status |
|-----------|------|------|--------|
| 16.1 | Tuning Logic — Namens-Wert vs. Lebenszahl Matching | `modular_logic.js` | ✅ IMPLEMENTED |
| 16.2 | Live Input — Debounce-Logik (300ms) für Keystroke-Feedback | `apps/tuning/index.html` | ⏳ (Phase 5.0) |
| 16.3 | Alignment Visuals — Farb-Feedback Grau → Deep Purple | `components.css` | ⏳ (Phase 5.0) |
| 16.4 | **SMOKE TEST** — Latenzfreies Feedback ohne UI-Hang | — | ✅ PASSED |

---

## 🚀 PHASE 5.0: INFRASTRUCTURE COMPLETION (UNIVERSE PROTOCOL — AKTIV)

> **UNIVERSE PROTOCOL:** Kein MVP. Kein „Lean Start“. Kein halbfertiges System vor echten Menschen.
> Wir bauen das vollständige Universum — dann öffnen wir die Tür.

**Ziel:** Vollständige technische Autonomie. Alle Apps 100% funktionsfähig. Alle 4 Säulen operativ.

**Gesetz:** `000_ARCHITECTURE.md` §10 — Law of Pillar Isolation + §16 — Universe Protocol.  
**SOP:** `000_RECYCLING_SOP.md` — Der 5-Schritte-Workflow für Ideen-Blitze.

### SÄULE 1: META-GENERATOR (🟩 TEMPLATES)
- [ ] /templates/ Verzeichnisstruktur etabliert
- [ ] App-Blueprint JSON Schema definiert
- [ ] Erstes Template: market_sentiment_blueprint.json
- [ ] Pattern-Extraktion aus bestehenden Apps

### SÄULE 2: B2B API FOUNDATION (🟧 LOGIC / 🟪 EDGE FUNCTIONS)
- [x] Finance-Logik migriert nach /shared/core/logic/finance.js
- [x] Gesetz der Säulen-Isolation verankert: "Logik darf niemals direkt in render.js leben"
- [ ] Edge Function: market-sentiment-import (Python JSON → Supabase)
- [ ] Edge Function: finance-api (B2B-Zugriff auf Zinseszins-Berechnung)
- [ ] API-Key Management für B2B-Kunden (JWT-basiert)

### SÄULE 3: DATA ARBITRAGE (🟨 PYTHON/OLLAMA)
- [x] /scripts/pipelines/ Verzeichnis erstellt
- [x] market_sentiment_fetcher.py Skeleton mit yfinance
- [ ] Yahoo Finance Integration aktiv (optional: Alpha Vantage)
- [ ] Ollama Llama 3 Anreicherung (Sentiment-Scoring lokal)
- [ ] RX 7700 XT Optimierung für Batch-Verarbeitung
- [ ] JSON-Output Schema standardisiert

### SÄULE 4: ECOSYSTEM FRONTEND (🟦 UI/RENDER)
- [x] Glassmorphism auf alle App-Seiten (finance, numerology)
- [x] Syne Font konsistent durchgesetzt
- [ ] SVG Visuals statt generischer Icons
- [x] Dashboard: Market Sentiment Widget (Chronos-Style)
- [x] Pillar-Isolation-Compliance: Alle render.js importieren nur aus /shared/core/logic/

### SÄULE 4: DIMENSIONEN-AUSBAU (Infrastructure Completion)

**Phase-1-Dimensionen (müssen ALLE zu 100% stehen bevor Launch):**
- DIM 01 KAPITAL → `/apps/finance/` ✅ Logic Done — ⬜ Design-Finalisierung
- DIM 03 FREQUENZ → `/apps/numerology/` ✅ Logic Done — ⬜ Design-Finalisierung
- DIM 05 BINDUNG → `/apps/synergy/` ✅ Engine Done — ⬜ Full App UI
- DIM 06 CHRONOS → `/apps/chronos/` ✅ Engine Done — ⬜ Full App UI
- DIM 03+ NOMENKLATUR → `/apps/tuning/` ✅ Engine Done — ⬜ Design-Finalisierung

**Phase-2-Dimensionen (nach Infrastructure Completion):**
- DIM 10 SIGNAL → `/apps/signal/` 🟡 Reichweiten-Tools für Klaudia (Strategic Rollout)

**Future Dimensionen (Phase 3+ / Community-getrieben):**
- DIM 02 KÖRPER → `/apps/body/` ⚪ Offen
- DIM 04 CODE → `/apps/builder/` ⚪ Offen
- DIM 07 GEIST → `/apps/mind/` ⚪ Offen
- DIM 08 STIL → `/apps/style/` ⚪ Offen
- DIM 09 SYSTEM → `/apps/system/` ⚪ Offen
- DIM 11 UNBEKANNT → Offen für Community-Vorschläge

**Regel:** Keine Phase-2-Dimension starten bevor ALLE Phase-1-Dimensionen zu 100% finalisiert sind.

### VERTICAL SLICE: MARKET SENTIMENT CHRONOS (ALLE 4 SÄULEN)
- [ ] P3: Python-Fetcher sammelt Marktdaten + Ollama-Anreicherung
- [ ] P2: Edge Function importiert und exponiert Daten
- [ ] P4: Dashboard-Widget visualisiert Sentiment-Score
- [ ] P1: Template extrahiert für zukünftige Data-Module

**Definition of Done:**
> Ein Button im Dashboard zeigt live Daten aus einem Python-Skript. Der User sieht nicht WHERE es herkommt — nur dass es funktioniert. Die 4 Säulen sind strikt isoliert, jede könnte eigenständig deployt werden.

---

## 🌱 PHASE 6: COMMUNITY & ANERKENNUNG (Post-Launch)

> Wird geplant wenn Phase 2 (Strategic Rollout) erste organische Community-Daten liefert.
> Kein Milestone ohne echte Nutzungsdaten als Basis. Niemals auf Hoffnung bauen.

| Idee | Beschreibung | Trigger |
|------|-------------|--------|
| **AI Onboarding** | 3-Fragen Discovery statt Formular | Phase 1 (Infrastructure Completion) |
| **MBRN Profil** | Öffentliche Kompetenzkarte ohne Zeugnisse | Phase 3 (Ecosystem) |
| **Anerkennung** | Beweis was jemand in 6 Monaten gelernt hat | Phase 3 (Community-Daten) |
| **Ökosystem** | Unternehmen kommen zu MBRN — nicht umgekehrt | Langzeitvision |

---

## 🌌 BEYOND THE HORIZON: INFINITE EXPANSION PROTOCOL (Phase 4+ / Unendlich)

> **Architekten-Direktive:** Der System Architect befindet sich in einem dauerhaften Forschungs- und Entwicklungsmodus. Das Ziel ist nicht das Erreichen eines Endzustands, sondern der Aufbau einer technologischen Übermacht, die kontinuierlich erweitert wird.

Phase 4+ ist nicht als "Ende" definiert, sondern als Übergang in das Infinite Expansion Protocol. MBRN ist darauf ausgelegt, über die initialen 5 Apps hinaus unendlich zu wachsen. Neue Säulen, neue Apps und neue Automatisierungen können jederzeit in die bestehende Pillar-Architektur integriert werden, ohne das Fundament zu gefährden.

---

## 📊 GESAMTSTATUS

```
PHASE 0-3 (M0-M12):     ✅ ARCHIVIERT
DESIGN PHASE (D1-D2):   ✅ ARCHIVIERT
PHASE 4.0 (M13-M16):    ✅ COMPLETE — Logic Engines finalisiert
PHASE 5.0:              🚀 AKTIV — INFRASTRUCTURE COMPLETION (Universe Protocol)
```

> **UNIVERSE PROTOCOL AKTIV:** Kein Launch, kein Marketing, keine Reichweite
> bis ALLE Phase-1-Kriterien erfüllt sind. Professionalität vor Sichtbarkeit.

---

**STATUS: ROADMAP_v7.0_UNIVERSE_PROTOCOL_ACTIVE**
*System Architect Out.*
