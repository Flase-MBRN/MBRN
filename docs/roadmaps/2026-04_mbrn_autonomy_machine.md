# MBRN Roadmap: Vom leeren Code zur autonomen Maschine

> Status: genehmigte Ausbaurichtung, nicht Primaerquelle fuer aktuellen Ist-Stand.  
> Aktuelle technische Wahrheit bleibt [000_CANONICAL_STATE.json](/C:/DevLab/MBRN-HUB-V1/000_CANONICAL_STATE.json:1).

## Zweck

Diese Roadmap beschreibt den naechsten operativen Ausbaupfad fuer MBRN:

- autonome Datensammlung
- lokale Veredelung
- abgesicherte Frontend-Ausgabe
- lokale Day-Zero-Automatisierung

Sie gehoert bewusst **nicht** in den Root als neue Parallel-Wahrheit, sondern unter `docs/roadmaps/`, weil sie Richtung und Reihenfolge beschreibt, nicht den bereits erreichten Ist-Zustand.

Kommerzielle Frontend-Elemente sind fuer diese Roadmap pausiert: keine Stripe-Checkouts, keine Paywalls, keine Blur-Effekte und kein Premium-Gating.

## Repo-Zuordnung

Die Roadmap wird nicht an einer einzigen Stelle umgesetzt, sondern in klar getrennten Zonen:

- `supabase/migrations/`
  fuer Tabellen, Referenzdaten, RLS und Policy-Updates
- `supabase/functions/`
  fuer Webhooks und serverseitige Edge-Funktionen
- `scripts/pipelines/`
  fuer Collector, Queueing, Analyse-Loops und Scheduler-nahe Python-Laufwege
- `bridges/local_llm/`
  fuer die spaetere formale lokale LLM-Bridge
- `bridges/supabase/`
  fuer Frontend- und Runtime-Zugriffe auf Supabase
- `shared/application/auth/` und `shared/application/frontend_os/`
  fuer Login, Session-Fluss und Dashboard-Runtimes
- `dashboard/` und `pillars/frontend_os/`
  fuer Anzeige, Rendering und operative Cockpit-Surfaces
- `commerce/`
  fuer Checkout-, Entitlement- und Payment-Fachlogik

## Woche 1: Das Fundament

Ziel: Ein Python-Laufweg sammelt Daten autonom und speichert sie robust in Supabase.

### Zielpfade

- `supabase/migrations/`
- `scripts/pipelines/`

### Konkrete Arbeit

1. Datenbank-Setup
   SQL fuer Rohdaten-Tabellen, Statusfelder und Quell-Metadaten in `supabase/migrations/`
2. Collector-Bot
   Python-Collector unter `scripts/pipelines/` fuer API-, RSS- oder Kursquellen
3. Supabase-Verbindung
   Python-Uplink in `scripts/pipelines/pipeline_utils.py` oder angrenzenden Pipeline-Dateien
4. Fehler-Resistenz
   Retry-, Sleep- und Logging-Hardening im Pipeline-Layer

### Kanon-Abgleich

Bereits teilweise vorhanden:

- `market_sentiment_pipeline` ist in `000_CANONICAL_STATE.json` bereits als `experimental` und `implemented` gesetzt
- `bridges.supabase` und `bridges.python` sind bereits `active`

Offen bleibt:

- die Roadmap beschreibt eine allgemeine, saubere Foundation fuer weitere Quellen, nicht nur den bereits existierenden Markt-Sentiment-Vertical-Slice

## Woche 2: Das Gehirn

Ziel: Lokale Modell-Veredelung zieht Rohdaten aus Supabase, verarbeitet sie strukturiert und schreibt Ergebnisse zurueck.

### Zielpfade

- `bridges/local_llm/`
- `scripts/pipelines/`
- optional `supabase/functions/`, falls Analyse serverseitig gespiegelt werden soll

### Konkrete Arbeit

1. LLM-Link
   formaler Adapter unter `bridges/local_llm/`
2. Analyse-Loop
   Python-Verarbeitung fuer unbearbeitete Datensaetze unter `scripts/pipelines/`
3. JSON-Zwang
   strikte Output-Validierung und Reparatur im Pipeline-Layer
4. Status-Update
   Rueckschreiben von Analyse und Bearbeitungsstatus nach Supabase

### Kanon-Abgleich

`bridges.local_llm` und die Week-2-Veredelung sind jetzt kanonisch nachgezogen.
Die weitere Aufgabe ist nicht mehr die Aktivierung, sondern die Härtung der Gold-Schicht fuer Woche 3.

## Woche 3: Das Schaufenster

Ziel: Veredelte Daten werden im Frontend angezeigt, abgesichert ueber Auth und RLS.

### Zielpfade

- `bridges/supabase/`
- `shared/application/auth/`
- `shared/application/frontend_os/`
- `dimensions/geld/oracle_signal/`
- `pillars/frontend_os/`
- `supabase/migrations/`

### Konkrete Arbeit

1. Supabase Auth
   Login- und Session-Fluss im Frontend
2. Row Level Security
   Policies in `supabase/migrations/`
3. Daten-Abruf
   Runtime-Fassaden ueber `bridges/supabase/` und `shared/application/`
4. Oracle-Signal-Rendering
   Vanilla-JS-Surface unter `geld -> oracle_signal`; das Dashboard bleibt ein Cockpit mit kompaktem Sprungpunkt

### Kanon-Abgleich

Week 3 ist jetzt kanonisch nachgezogen:

- `shared/application/auth/` existiert
- `bridges/supabase/api.js` enthaelt bereits Auth- und RLS-bezogene Laufwege
- `supabase/migrations/18_gold_frontend_access.sql` definiert `gold_dashboard_items` als frontend-sichere View
- `dimensions/geld/oracle_signal/index.html` ist der Arbeitsort fuer Gold-Signale
- `dashboard/` bleibt Cockpit und rendert keine volle Gold-Datenflaeche

Weitere Arbeit in Woche 3 ist Haertung, nicht grundsaetzliche Aktivierung.

## Woche 4: Day-Zero-Autopilot

Ziel: Die Woche-1- und Woche-2-Pipeline laeuft lokal automatisiert und nachvollziehbar.

### Zielpfade

- `scripts/pipelines/`
- Windows Startup-Ordner

### Konkrete Arbeit

1. Day-Zero-Startskript
   PowerShell-Laufweg fuer Collector und LLM-Worker
2. Exit-Code-Orchestrierung
   Collector-Exit `0` und `2` fuehren zum LLM-Worker, Exit `1` stoppt den Lauf
3. Logging
   pro Lauf ein Log unter `scripts/pipelines/logs/`
4. Startup-Setup
   Windows-Verknuepfung `MBRN_Autopilot.lnk` im Startup-Ordner, genau ein Lauf pro Windows-Login

### Kanon-Abgleich

Week 4 ist jetzt als reine Automatisierung kanonisch nachgezogen:

- `scripts/pipelines/day_zero_autopilot.ps1`
- `scripts/pipelines/create_startup_shortcut.ps1`
- `execution_tracks.autonomy_machine.phases.week_4_day_zero` ist `implemented`

Nicht Teil von Week 4: Stripe, Webhooks, Paywalls, Premium-Gating, Blur-Effekte oder Aenderungen an `gold_dashboard_items`.

## Kanon-Regel fuer diese Roadmap

Diese Roadmap ist nur dann Teil der offiziellen Repo-Wahrheit, wenn:

1. sie in `000_CANONICAL_STATE.json` als Track referenziert wird
2. ihr Status sauber zwischen `approved direction` und `implemented state` getrennt bleibt
3. Bruecken, Systeme und Surfaces beim Fortschritt einzeln im Kanon nachgezogen werden
