# 000_ARCHITECTURE.md — MBRN MASTER DIRECTIVE v5.1

> **ZERO-TOLERANCE AI DIRECTIVE:**
> Dieses Dokument beschreibt die aktive Systemwahrheit. Keine Konzeptänderung ohne Freigabe durch den System Architect. Keine Doku darf einen Stand behaupten, der im Code nicht existiert.

---

> **V3 IST 100% COMPLETE**
> Phasen 1-5 abgeschlossen. Architektur ist final und stabil.

---

## 01 — Vision

MBRN ist kein loses Tool-Set, sondern ein Membran-System zwischen Potenzial, Struktur und operativer Umsetzung. Die UI darf spektakulär wirken, aber das Fundament bleibt strikt modular, lokal beherrschbar und langfristig erweiterbar.

Kernsatz:

```text
MBRN — built to be used
```

---

## 02 — Die Gesetze

### Core Laws

1. **Module Responsibility** — Ein File, eine Aufgabe.
2. **No Direct DOM in Core** — DOM-Zugriff gehört in UI-Layer.
3. **Safe Rendering** — Dynamische UI-Erzeugung über sichere DOM-Hilfen, nicht über rohe HTML-Strings.
4. **Structured Returns** — Funktionen liefern strukturierte Objekte, keine impliziten Rohwerte.
5. **Idempotenz** — Wiederholte Ausführung darf keinen Chaoszustand erzeugen.
6. **Fallback State** — UX darf bei Ausfällen nicht brechen.
7. **No Magic Numbers** — Schwellenwerte gehören in Konfiguration oder klar benannte Konstanten.
8. **No-Build Production** — Kein Framework-Bundling im produktiven App-Code.
9. **Relative Project Paths** — Keine hartverdrahteten lokalen Sonderpfade im aktiven Kernel.

### Universe Protocol

10. **Professionalität vor Sichtbarkeit** — Kein Launch vor finalisiertem Kern.
11. **Modular Infinity** — Jede Komponente muss für langfristige Erweiterung gebaut sein.
12. **Pillar Isolation** — UI, Logik, Datenarbeit und API-Zone bleiben klar getrennt.

---

## 03 — Design Code

MBRN folgt dem Sternenhimmel-Prinzip:

- dunkle Void-Basis statt generischem Schwarz
- wenige, präzise Glow-Akzente
- Glassmorphism mit Zurückhaltung
- viel Raum, wenig Lärm
- Datenästhetik statt Kitsch

Referenzfarben:

```text
Hintergrund: #05050A
Surface:     #0A0A0F
Akzent:      #7B5CF5
Text:        #F5F5F5
```

---

## 04 — Aktiver Tech Stack

| Layer | Technologie | Rolle |
|---|---|---|
| **Frontend** | Vanilla JavaScript (ES Modules) | Dashboard, Apps, Routing |
| **State** | Pub/Sub (`state.js`) | entkoppelter Event-Fluss |
| **Storage** | LocalStorage + Supabase | instant-on plus Sync |
| **Styling** | CSS Variables + globale Komponenten | SSoT für Design |
| **DOM** | `dom_utils.js` / `shared/ui/dom/*` | sichere DOM-Erzeugung |
| **Python Workers** | `scripts/pipelines/` | Market Sentiment, RSS, Uplinks |
| **Oracle Layer** | `scripts/oracle/` | Prognose, Backtesting, Replay |
| **AI / Inference** | Lokales Ollama mit Llama 3.1 | RX 7700 XT, keine Paid-Abhängigkeit |
| **Backend Bridge** | Supabase + Edge Functions | Auth, Persistenz, optionale API-Zone |
| **Docs** | aktive Markdown-Kerndokumente | nur Live-Wissen, kein Archivballast |

**No-Build Policy:** Produktionscode in `/apps`, `/dashboard` und `/shared` bleibt browsernativ und importiert nur `.js`-Module.

---

## 05 — Aktive Struktur

```text
/MBRN-HUB-V1
│
├── /shared
│   ├── /core
│   ├── /application
│   ├── /ui
│   └── /loyalty
│
├── /pillars
│   ├── /meta_generator
│   ├── /monetization
│   ├── /oracle
│   └── /frontend_os
│
├── /dimensions
├── /apps
├── /bridges
├── /commerce
├── /dashboard
├── /scripts/pipelines
├── /scripts/oracle
├── /supabase/functions
├── /templates
├── /docs
└── index.html
```

**Wahrheitsnotiz:** Historische Dokumentationsarchive liegen nicht mehr unter `docs/` im aktiven Repo. Sie wurden extern nach `C:\DevLab_Archive\MBRN-HUB-V1_docs_archive_20260419_205331` ausgelagert.

---

## 06 — Die vier Säulen

### Säule 1 — Meta-Generator

- `pillars/meta_generator/`
- für Blueprints, Content, Module, Assets und Agent-Adapter reserviert

### Säule 2 — Monetization

- `pillars/monetization/`
- Produkt-, Plan-, Gate- und Entitlement-Logik ohne Provider-SDKs

### Säule 3 — Oracle

- `pillars/oracle/`
- `scripts/pipelines/` und `scripts/oracle/` bleiben operative Daten- und Rechenpfade
- Oberflächen lesen nur strukturierte Snapshot-Read-Models

### Säule 4 — Frontend OS

- `pillars/frontend_os/`
- Shell, Navigation, Dashboard- und Legal-Surfaces
- keine IO, keine primitive UI-Basisbausteine

---

## 07 — Pillar Isolation

| Regel | Bedeutung |
|---|---|
| **Core bleibt IO-frei** | `shared/core/` kennt keine Bridges, Commerce- oder Frontend-OS-Module |
| **Application orchestriert** | `shared/application/` verbindet Core, Bridges, Commerce und Oberflächen |
| **Frontend OS bleibt dünn** | Shell und Surface-Komposition, aber keine Provider- oder Processing-Logik |
| **Data Workers bleiben getrennt** | Python sammelt, normalisiert und persistiert Signale |

Verboten:

- Business-Logik direkt in `render.js`
- unsichere HTML-Strings für dynamische UI
- lokale Sonderpfade statt Projektpfade
- Dokumentation, die einen älteren Stand als Wahrheit verkauft

---

## 08 — Aktive Wahrheiten

- `market_sentiment_fetcher.py` verarbeitet `SPY`, `QQQ`, `DIA`, `IWM`, `^VIX`, `BTC-USD` und `ETH-USD`.
- RSS-Fallbacks laufen über Reuters, CNBC und Google News.
- `save_json_atomic()` ist der kanonische Schreibpfad für Runtime-JSON.
- `oracle_core.py` spiegelt atomar nach `shared/data/oracle_prediction.json`.
- Oracle-Backtesting läuft über `shared/data/oracle_backtest.json`.
- Phase 6.0 ist noch nicht reif, solange Tuning, Synergy-Finalisierung, Template-Tiefe und Governance-Konsistenz offen sind.

---

## 09 — Markt und Sprache

- Deutsch und Englisch bleiben wichtige Ausbaustufen.
- Für deutsche UIs gelten echte Umlaute und direkter Ton.
- Kein Esoterik-Nebel, kein steriles Finanzsprech.

---

**STATUS: MASTER_DIRECTIVE_v5.1_TRUTH_ALIGNED**
*System Architect Out.*
