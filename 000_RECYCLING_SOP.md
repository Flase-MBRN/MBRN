# 🏛️ MBRN RECYCLING-MASTERPLAN: V1.0
## VOM IDEEN-BLITZ ZUM 4-SÄULEN-MONTE-CARLO-STATUS

> **Status:** OPERATIV | **Architect:** Flase | **Target:** Financial Freedom < 30
> **System-Direktive:** Jedes neue Modul ist ein Soldat im Idle Game. Baue es so, dass es ohne dich kämpft.

---

## 01 — DIE ARCHITEKTUR DER ISOLATION (ORDNUNGS-SYSTEM)

Damit der Monolith nicht verschlammt, wird der **MBRN-HUB-V1** in vier strikte Verzeichnis-Sektoren unterteilt. Jede Säule hat ihre eigene "Luftschleuse".

```text
/MBRN-HUB-V1
│
├── /apps                     # 🟦 SÄULE 4: ECOSYSTEM (Frontend-Plugins)
│   └── /[app-name]           # UI, Render-Logik, App-Context
│
├── /shared                   # 🧠 THE ENGINE (Core & Logic)
│   └── /core/logic           # 🟧 SÄULE 2: B2B API FOUNDATION (Pure JS Algorithmen)
│       └── [app-logic].js    # Hier lebt die "Geld-Logik" – isoliert vom DOM
│
├── /scripts                  # 🟨 SÄULE 3: DATA ARBITRAGE (Python-Werkstatt)
│   └── /pipelines            # Lokale Scraper & Data-Munger (RX 7700 XT)
│       └── [topic]_fetcher.py
│
├── /supabase                 # 🟪 SÄULE 2: API DEPLOYMENT (Edge Functions)
│   └── /functions            # Die Brücke zur Außenwelt (REST)
│
└── /templates                # 🟩 SÄULE 1: META-GENERATOR (Baupläne)
    └── app_blueprint.json    # Strukturdaten für KI-generierte Apps
```

---

## 02 — DER RECYCLING-WORKFLOW (SOP)

Wenn morgens ein "Ideen-Blitz" einschlägt, folgst du diesen 5 Schritten. Weiche nicht ab.

### Schritt 1: Die Logik-Isolierung (Säule 2 Vorbereitung)
Zuerst baust du das Gehirn. Kein CSS, kein HTML. Nur pure Mathematik/Logik. Das ist das Teil, das später als API vermietet wird.

### Schritt 2: Die UI-Integration (Säule 4 Deployment)
Das Gehirn bekommt ein Gesicht im Sternenhimmel-Design. Einbindung in das Dashboard.

### Schritt 3: Die Daten-Pipeline (Säule 3 Fütterung)
Ein lokales Python-Skript sorgt dafür, dass das Modul nicht "leer" bleibt, sondern mit frischen Marktdaten/Trends versorgt wird.

### Schritt 4: Die API-Exponierung (Säule 2 Monetarisierung)
Kopiere die Logik in eine Supabase Edge Function. Jetzt kann ein B2B-Kunde dafür zahlen.

### Schritt 5: Die Abstraktion (Säule 1 Automatisierung)
Extrahiere das Muster. Speichere es als Template, damit der Meta-Generator beim nächsten Mal ähnliche Apps in Sekunden baut.

---

## 03 — DIE KIMI-PROMPTS (EXECUTIONS)

Kopiere diese Prompts exakt. Ersetze nur `[PROJEKT_NAME]` und `[LOGIK_BESCHREIBUNG]`.

### PROMPT A: "The Brain" (Säule 2 Logic Core)
**Ziel:** Erstellung der `logic.js` in `shared/core/logic/`.

> **KONTEXT:** Handle als Senior System Architect. Beachte das "Omniscient Handover Manifest" und das Gesetz der Logic Isolation (Law 1, 4, 13).
> **AUFGABE:** Erstelle ein neues Logik-Modul für `[PROJEKT_NAME]`.
> **LOGIK:** `[Detaillierte Beschreibung der Logik/Berechnung]`.
> **REGELN:** > 1. KEIN DOM-Zugriff. 
> 2. Nutze ausschließlich ES6 Exports. 
> 3. Rückgabe MUSS das Schema `{ success: true, data: { ... } }` erfüllen.
> 4. Validiere alle Inputs mit `shared/core/validators.js`.
> 5. Speichere die Datei unter `shared/core/logic/[projekt_name].js`.

### PROMPT B: "The Face" (Säule 4 UI)
**Ziel:** Erstellung von `index.html` und `render.js` in `apps/[projekt_name]/`.

> **KONTEXT:** Die Logik in `shared/core/logic/[projekt_name].js` ist fertig. Baue jetzt das MBRN-Plugin.
> **DESIGN-GESETZ:** Nutze das Starry-Sky-System (#05050A, Syne Font, Glassmorphism).
> **AUFGABE:** Erstelle `apps/[projekt_name]/index.html` (One-Script-Tag Rule) und `render.js`.
> **PROTOKOLL:** > 1. Nutze `shared/ui/dom_utils.js` für alle Render-Vorgänge (XSS-Safe).
> 2. Implementiere die `destroy()` Methode für Memory-Cleanup in `render.js`.
> 3. Registriere die Action in `shared/core/actions.js`.
> 4. Binde die Navigation via `shared/ui/navigation.js` ein.

### PROMPT C: "The Pipeline" (Säule 3 Data)
**Ziel:** Python-Skript für Daten-Arbitrage.

> **AUFGABE:** Erstelle ein Python-Skript für Säule 3 (Data Arbitrage), das Daten für `[PROJEKT_NAME]` sammelt.
> **FOKUS:** Sammle strukturelle B2B-Daten oder Trends (KEINE personenbezogenen Daten!).
> **OUTPUT:** Speichere die Ergebnisse als `[projekt_name]_data.json`.
> **KI-INTEGRATION:** Nutze eine lokale Ollama-Instanz (Llama 3), um die Daten vorzuverarbeiten, bevor sie in die Supabase DB geschoben werden.

---

## 04 — STRATEGISCHE SÄULEN-INTEGRATION

| Säule | Aktion bei neuem Modul | Ort im Verzeichnis |
| :--- | :--- | :--- |
| **S1: Meta-Generator** | Muster in `/templates/` speichern. Logik-Parameter abstrahieren. | `/templates/` |
| **S2: B2B API** | Exportiere `logic.js` als Supabase Edge Function. | `/supabase/functions/` |
| **S3: Data Arbitrage** | Python Scraper erstellt regelmäßigen JSON-Dump für DB. | `/scripts/pipelines/` |
| **S4: Ecosystem** | Einbindung als neue "Dimension" im Dashboard. | `/apps/` |

---

## 05 — ARCHITEKT-CHECK: LOGIK-LÜCKEN & VERBESSERUNGEN

Nach Analyse deiner aktuellen Vision (Erik, 19, Finanzfokus) habe ich folgende Optimierungen identifiziert:

### 1. Die "Local-First" Lücke
**Problem:** Du hast eine RX 7700 XT. Das ist ein Biest für lokale KI.
**Lösung:** Nutze Pillar 3 nicht nur zum Scrapen, sondern zum **lokalen KI-Tagging**. Bevor Daten in Supabase landen, lässt du sie lokal durch Ollama laufen, um "Sentiment" oder "Quality-Scores" zu vergeben. Das spart API-Kosten und macht deine API (Säule 2) wertvoller, weil die Daten bereits "veredelt" sind.

### 2. Die "Memory-Leak" Falle
**Problem:** Bei vielen Modulen (11 Dimensionen) wird das Browser-Memory zum Problem, wenn `destroy()` nicht perfekt ist.
**Lösung:** Implementiere einen globalen `Observer` in `navigation.js`, der bei jedem Seitenwechsel einen `MBRN_CLEANUP` Event feuert. Jede App MUSS darauf hören.

### 3. Vorschlag: "Pillar 2 - API-Keys als JWT"
Da du B2B planst: Implementiere in Supabase RLS-Policies, die nicht nur auf `user_id`, sondern auf `service_role` oder speziellen `api_keys` basieren. So kannst du Firmen Zugriff auf `/apps/numerology/logic.js` geben, ohne dass sie deine UI nutzen müssen.

### 4. Die "Klaudia-Engine" (Säule 1 & 10)
**Idee:** Baue ein internes Tool in Säule 1, das aus deinen Modul-Ergebnissen automatisch "Social Media Hooks" generiert. 
*Input:* Numerologie-Profil. 
*Output:* 3 Viral-Hooks für Klaudia. 
Das schließt den Kreis zwischen Säule 1 (Generator) und deinem Plan "Reichweiten-Engine".

---

**NÄCHSTER SCHRITT:** Erstelle den Ordner `/scripts/pipelines/` und starte den ersten Python-Fetcher. Das System muss atmen (Daten), bevor es spricht (UI).

*System Architect Flase — Ende der Übertragung.*
