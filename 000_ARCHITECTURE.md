# 🏛️ 000_ARCHITECTURE.md — MBRN MASTER DIRECTIVE v5.0

> **ZERO-TOLERANCE AI DIRECTIVE:**
> Dieses Dokument ist das absolute Gesetz. Keine Konzept-Änderungen ohne explizite Freigabe durch den System Architect. Nur Exekution.

---

## 01 — VISION & PHILOSOPHIE

**MBRN** ist kein Tool. Kein Dashboard. Keine App.

MBRN ist die **Membran** — die Grenzfläche zwischen dem was ein Mensch gerade ist und dem was in ihm steckt.

Abgeleitet von **M-Theory** (Membran-Theorie, 11 Dimensionen). In der M-Theorie sind scheinbar verschiedene Systeme nur unterschiedliche Perspektiven auf dasselbe Fundament. MBRN funktioniert identisch: Finanzen, Fitness, Mindset, Beziehungen — sehen verschieden aus. Sind dieselbe Membran.

**Das Antimaterie-Prinzip:**
Während andere Systeme nach Liquidität fragen, fragt MBRN nach Stärken und Potenzial. Erfolg durch Finden — nicht durch Ausnutzen.

**Die Kernaussage:**
> Existenz fragmentiert sich in Perspektiven um Erfahrung zu ermöglichen.
> MBRN ist das System das diese Perspektiven navigierbar macht.

**Kern-Satz:**
```
MBRN — built to be used
```

---

## 02 — IDENTITÄT (FLASE-PRINZIP)

Der Architect ist unsichtbar. Die Marke trägt alles.

- **Kommunikation:** Ausschließlich textbasiert
- **Präsenz:** Kein öffentliches Gesicht, keine parasozialen Bindungen
- **Output-Zentrierung:** Nur das System und seine Wirkung existieren öffentlich
- **Persona:** Flase — neutral, distanziert, nicht greifbar als Person

**Ziel:** Trennung zwischen Person (unsichtbar) und Effekt (sichtbar).

---

## 03 — DIE 15 EISERNEN GESETZE

### CORE LAWS (Fundament — unantastbar)

1. **Module Responsibility:** Ein File = Eine Aufgabe. Niemals Logik + State + UI mischen.
2. **No Direct DOM:** `document.querySelector` / `innerHTML` AUSSCHLIESSLICH in `render.js` oder UI-Layern.
3. **Safe Rendering:** Alle DOM-Updates über `dom_utils.js`. XSS-Schutz ist obligatorisch.
4. **Structured Returns:** Alle Funktionen geben `{ success: true, data: ... }` oder `{ success: false, error: "..." }` zurück. Niemals raw strings oder undefined.
5. **Idempotenz:** Actions müssen sicher mehrfach ausführbar sein (Doppelklick, Network-Lag, AI-Call safe).
6. **Event Naming:** Strikte Muster: `actionCompleted`, `stateChanged`, `uiRequested`.
7. **Fallback State:** Bei Supabase-Ausfall → automatischer LocalStorage-Fallback. UX bricht niemals.
8. **No Magic Numbers:** Alle Schwellenwerte leben in `MBRN_CONFIG`.
9. **No Local CSS:** Ausschließlich globale CSS-Variablen aus `theme.css`.

### CLOUD LAWS (Sync)

10. **Cloud-First, Offline-Always:** Sofortiger Start mit LocalStorage. Supabase synct asynchron im Hintergrund (Optimistic UI).
11. **RLS Law:** Datenbankzugriff nur über Row Level Security. User können physisch keine fremden Daten lesen.
12. **Sync-Debouncing:** Cloud-Uploads nie bei jedem Keystroke. Batch-Uploads mit Verzögerung.

### EXPANSION LAWS (Ökosystem)

13. **Logic Isolation:** Komplexe Algorithmen (Synergy, Chronos, Frequency) bleiben in isolierten Modulen. Web-Worker wenn nötig.
14. **Design Consistency:** Jedes Modul folgt dem MBRN Design-Code. Keine Ausnahmen.
15. **Temporal Precision:** Chronologische Berechnungen sind deterministisch und zeitzonen-akkurat (UTC-Mapping).

### UNIVERSE PROTOCOL (Philosophie)

**Directive 16: Professionalität vor Sichtbarkeit**
Das System wird vollständig gebaut, bevor der erste externe Kontakt stattfindet. Kein MVP. Kein „Lean Start“. Kein halbfertiges System vor echten Menschen. Alle Apps müssen zu 100% funktionsfähig, stabil und im MBRN-Design-Standard finalisiert sein, bevor Reichweite erzeugt wird. KI-Agenten dürfen niemals „frühe User“, „Marketing-Tests“ oder „schnell shippen“ empfehlen.

**Directive 17: Modular Infinity**
Baue jede Komponente so, als wäre sie Teil eines Systems, das 100 Jahre wächst. Jede App muss so entkoppelt sein, dass sie unabhängig existieren kann, aber die globale Infrastruktur (Auth, Storage, Logic-Bridges) nutzt. Das System erreicht niemals einen finalen Endzustand, sondern expandiert unendlich.

---

## 04 — DESIGN CODE: STERNENHIMMEL-SYSTEM

**Das Gefühl:**
> "Sternenhimmel in einer beleuchteten Stadt. Guckt man kurz hin — sieht man fast nichts. Guckt man genauer — sieht man 2-3 Sterne."

**Erster Eindruck des Users muss sein:**
> *"WTF ist das. Ist das noch eine Website aus dem 21. Jahrhundert oder aus einem ganz anderen Zeitalter?"*

**Farb-System:**
```
Hintergrund:    #05050A (Fast Schwarz — nicht reines Schwarz, nicht Navy)
Surface:        #0A0A0F (Cards, elevated surfaces)
Border:         rgba(255,255,255,0.06) (subtil, kaum sichtbar)
Akzent:         #7B5CF5 (Deep Purple — sparsam, nie als Füllfläche)
Glow:           rgba(123,92,245,0.15) (subtil, wie ein ferner Stern)
Text Primary:   #F5F5F5 (Weiß — aber nicht grell)
Text Secondary: rgba(255,255,255,0.5)
Text Muted:     rgba(255,255,255,0.25)
```

**Typografie:**
```
Display:  Syne (700/800) — für Headlines, extrem groß, wenige Worte
Body:     Inter (300/400/500) — schlicht, lesbar
Labels:   Space Mono oder Inter Caps + Letter-spacing — wie Koordinaten
```

**Layout-Prinzip:**
- Mut zur Leere. Viel Raum. Wenige Elemente.
- Jedes Element sitzt mit Absicht.
- Scrollt man — passiert etwas Unerwartetes.
- Keine typischen AI-generischen Designs.
- Keine Kitsch-Grafiken — nur Datenvisualisierung.

**Verboten:**
- `#0d0d1a` Navy (zu generisch)
- `#000000` reines Schwarz (zu hart)
- Übermäßige Glow-Effekte
- Gradient-Überladung
- Alles was man schon kennt

---

## 05 — TECH STACK

| Layer | Technologie | Begründung |
|-------|-------------|------------|
| **Language** | Vanilla JavaScript (ES6 Modules) | Zero Dependencies, maximale Kontrolle |
| **State** | Pub/Sub Event System (`state.js`) | Entkoppelt, reaktiv, kein Framework-Lock-in |
| **Storage** | LocalStorage (primär) + Supabase (Sync) | Instant-on UX mit Cloud-Persistenz |
| **Backend** | Supabase (PostgreSQL + Auth + Edge Functions) | RLS-gesichert, kein eigener Server |
| **Styling** | CSS Variables (`theme.css`) | Single Source of Truth |
| **DOM** | `dom_utils.js` (sanitized) | XSS-sicher |
| **PDF** | jsPDF (ESM CDN) | Client-seitige Artifact-Generierung |
| **Deploy** | GitHub Pages (Frontend) + PWA | Zero-Cost, Offline-fähig |
| **AI** | Supabase Edge Functions + Gemini API | Kostenlos im Free Tier |
| **Docs** | Obsidian (Local Vault) | Knowledge Graph & System Documentation |

**NO-BUILD-POLICY:** Kein Webpack, kein Vite, kein npm für Production. Alle Imports zwingend mit `.js` Endung.

---

## 06 — DIRECTORY STRUCTURE

```
/MBRN-HUB-V1
│
├── /shared                     # 🧠 THE ENGINE (Platform Core)
│   ├── /ui
│   │   ├── theme.css           # Single Source of Truth (CSS Vars)
│   │   ├── components.css      # Globale Buttons, Cards, Modals
│   │   └── dom_utils.js        # Sanitized Rendering only (XSS-Schutz)
│   │
│   ├── /core
│   │   ├── config.js           # MBRN_CONFIG (alle Magic Numbers)
│   │   ├── state.js            # Global State Manager (Pub/Sub)
│   │   ├── actions.js          # Action Registry + Orchestration
│   │   ├── api.js              # Supabase Client + Sync Logic
│   │   └── storage.js          # LocalStorage Wrapper (mbrn_* prefix)
│   │
│   └── /loyalty
│       ├── streak_manager.js   # Streaks, Shields, Check-ins
│       └── access_control.js   # Feature Gates + Unlocks
│
├── /apps                       # 🧩 PLUG-INS (Isolated App Logic)
│   ├── /finance                # DIM 01 — KAPITAL
│   ├── /numerology             # DIM 03 — FREQUENZ
│   ├── /synergy                # DIM 05 — BINDUNG (Phase 4.0)
│   ├── /chronos                # DIM 06 — CHRONOS (Phase 4.0)
│   └── /tuning                 # DIM 03+ — FREQUENCY TUNER (Phase 4.0)
│
├── /dashboard                  # 📊 User Area (Mastery Mirror)
├── /landing                    # 🌍 Public Frontend (The Hook)
├── /docs                       # 🧠 Obsidian Vault (System Knowledge)
└── index.html                  # 🔄 Root (Landing Page)
```

---

## 07 — MONETARISIERUNG (PHILOSOPHIE)

**Grundprinzip:** Geld kommt durch Freiwilligkeit mehr zusammen als durch Druck.  
**Universe Protocol:** Monetarisierung ist eine Phase-3-Entscheidung. Davor: **bauen, nicht verkaufen.**

```
Phase 1:        Bauen — keine Monetarisierung, kein Marketing, kein Traffic-Fokus
Phase 2:        Strategischer Launch des fertigen Systems + organische Reichweite
Phase 3:        Monetarisierung basierend auf echten Community-Daten

Modell:
  Basis:        Kostenlos — immer und ohne Einschränkung
  Optional:     Ko-fi / Spenden für die die geben wollen
  Premium:      Features wenn Community-Nachfrage bewiesen ist
  Stripe:       Im Code vorhanden, eingefroren bis Phase 3
  B2B API:      Logik-Module als Service für externe Entwickler (Phase 3+)
  Gewerbe:      Wenn sich das System selbst trägt
```

**Was MBRN nie tut:**
- User zu Zahlung drängen
- Features wegnehmen die man hatte
- Daten verkaufen
- Parasoziale Bindung aufbauen
- **Ein halbfertiges System veröffentlichen um "schnell zu validieren"**

---

## 08 — SPRACHE & MARKT

- **Launch:** Deutsch + Englisch gleichzeitig
- **DE:** Loyale Stammkunden, D-A-CH Markt
- **EN:** Reichweite, globaler Markt
- **Prinzip:** Nicht übersetzen — neu schreiben. Gleiche Philosophie, andere Stimme.
- **Ton:** Direkt. Kein Bullshit. Kein Coach-Sprech. Respekt durch Ehrlichkeit.

---

## 09 — DIE ENTSCHEIDUNGSFRAGE

Für jede Design- und Feature-Entscheidung gilt diese eine Frage:

> *"Fühlt sich das noch wie eine Website an — oder wie etwas aus einem anderen Zeitalter?"*

Antwort "Website" → nochmal.
Antwort "anderes Zeitalter" → rein damit.

---

## 10 — LAW OF PILLAR ISOLATION (Zero-Tolerance)

**Gesetz:** "Logik ist Pillar 2 (API) und muss strikt von Pillar 4 (UI/Render) getrennt sein."

> **Vollständige Formulierung:** "Logik darf niemals direkt in render.js leben, sondern muss als Modul in shared/core/logic/ liegen, um API-ready zu sein."

### Enforcement

| Regel | Konsequenz bei Verletzung |
|-------|---------------------------|
| **Pillar 4 imports ONLY from Pillar 2** | `render.js` dateien importieren ausschließlich aus `shared/core/logic/` |
| **Pillar 2 exports pure functions** | Kein DOM-Zugriff, keine Framework-Dependencies, strukturierte Returns |
| **Violation Detection** | Direkte Berechnung in `render.js` = Sofort-Refactoring erforderlich |
| **API-Ready Standard** | Jedes Logik-Modul muss als Supabase Edge Function deploybar sein |

### Die 4 Säulen-Verzeichnisstruktur

```
/MBRN-HUB-V1
│
├── /apps                     # 🟦 SÄULE 4: ECOSYSTEM (Frontend)
│   └── /[app-name]           # Nur UI, Render, keine Berechnungslogik
│
├── /shared/core/logic        # 🟧 SÄULE 2: B2B API FOUNDATION
│   └── [domain].js           # Pure Algorithmen, API-ready
│
├── /scripts/pipelines        # 🟨 SÄULE 3: DATA ARBITRAGE
│   └── [topic]_fetcher.py    # Python + Ollama lokale Verarbeitung
│
├── /supabase/functions       # 🟪 SÄULE 2: API DEPLOYMENT
│   └── [logic]-api.js        # Edge Functions für B2B-Zugriff
│
└── /templates                # 🟩 SÄULE 1: META-GENERATOR
    └── [pattern].json        # Baupläne für KI-generierte Apps
```

---

**STATUS: MASTER_DIRECTIVE_v7.0_UNIVERSE_PROTOCOL_ACTIVE**
*System Architect Out.*
