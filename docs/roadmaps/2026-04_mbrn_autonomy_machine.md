# MBRN Roadmap: Vom leeren Code zur autonomen Maschine

> Status: genehmigte Ausbaurichtung, nicht Primaerquelle fuer aktuellen Ist-Stand.  
> Aktuelle technische Wahrheit bleibt [000_CANONICAL_STATE.json](/C:/DevLab/MBRN-HUB-V1/000_CANONICAL_STATE.json:1).

## Zweck

Diese Roadmap beschreibt den naechsten operativen Ausbaupfad fuer MBRN:

- autonome Datensammlung
- lokale Veredelung
- abgesicherte Frontend-Ausgabe
- Bezahlschranke und Scheduler

Sie gehoert bewusst **nicht** in den Root als neue Parallel-Wahrheit, sondern unter `docs/roadmaps/`, weil sie Richtung und Reihenfolge beschreibt, nicht den bereits erreichten Ist-Zustand.

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

Aktuell ist `bridges.local_llm` noch `reserved` mit `maturity: none`.  
Wenn diese Woche verbindlich gestartet wird, muss der Kanon mindestens auf `experimental` oder `active` nachgezogen werden. Solange das nicht geschieht, ist jede behauptete lokale LLM-Runtime Drift.

## Woche 3: Das Schaufenster

Ziel: Veredelte Daten werden im Frontend angezeigt, abgesichert ueber Auth und RLS.

### Zielpfade

- `bridges/supabase/`
- `shared/application/auth/`
- `shared/application/frontend_os/`
- `dashboard/`
- `pillars/frontend_os/`
- `supabase/migrations/`

### Konkrete Arbeit

1. Supabase Auth
   Login- und Session-Fluss im Frontend
2. Row Level Security
   Policies in `supabase/migrations/`
3. Daten-Abruf
   Runtime-Fassaden ueber `bridges/supabase/` und `shared/application/`
4. Dashboard-Rendering
   Vanilla-JS-Surfaces in `dashboard/` und `pillars/frontend_os/`

### Kanon-Abgleich

Teile hiervon sind bereits real:

- `shared/application/auth/` existiert
- `bridges/supabase/api.js` enthaelt bereits Auth- und RLS-bezogene Laufwege

Die Roadmap ist hier also kein Blank Slate, sondern ein Ausbau vorhandener Betriebszonen.

## Woche 4: Day-Zero-Vorbereitung

Ziel: Monetization, Gating und Scheduler werden produktionsnah vorbereitet.

### Zielpfade

- `commerce/`
- `supabase/functions/stripe-checkout/`
- `supabase/functions/stripe-webhook/`
- `scripts/pipelines/`
- optional Betrieb ueber Windows Task Scheduler oder spater externe Scheduler

### Konkrete Arbeit

1. Stripe Testmodus
   Checkout-Integration in `commerce/` und Frontend-Surfaces
2. Webhook
   Zahlungsbestaetigung und Statuswechsel in `supabase/functions/stripe-webhook/`
3. Content-Gating
   Premium-Grenzen im Frontend und in Read-Models
4. Autopilot
   taegliche Scheduler-Anbindung fuer Pipeline-Laeufe

### Kanon-Abgleich

Auch hier ist bereits Substanz vorhanden:

- `commerce/stripe/`
- `supabase/functions/stripe-checkout/`
- `supabase/functions/stripe-webhook/`
- `scripts/pipelines/autostart_vibe.bat`

Die Roadmap ist also in Woche 4 ebenfalls ein Ausbau- und Haertungspfad, nicht nullbasiger Start.

## Kanon-Regel fuer diese Roadmap

Diese Roadmap ist nur dann Teil der offiziellen Repo-Wahrheit, wenn:

1. sie in `000_CANONICAL_STATE.json` als Track referenziert wird
2. ihr Status sauber zwischen `approved direction` und `implemented state` getrennt bleibt
3. Bruecken, Systeme und Surfaces beim Fortschritt einzeln im Kanon nachgezogen werden
