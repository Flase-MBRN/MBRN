> This document defines the operational playbook for MBRN pillars.

> It is not the source of truth for current system state.

> Official current-state authority is `000\_CANONICAL\_STATE.json`.

> If this playbook conflicts with canonical state, canonical state wins.



\# 001\_PILLAR\_PLAYBOOK.md



\## 1. Zweck des Dokuments



Dieses Dokument definiert den operativen Qualitätsrahmen für die vier aktiven Pillars von MBRN. Es beschreibt nicht nur, was die Pillars sein sollen, sondern wie sie geschärft, geprüft, vervollständigt und gegen spätere Verwässerung geschützt werden.



Die Aufgabe dieses Dokuments ist es, zu verhindern, dass Pillars zu bloßen Ordnernamen, Konzepttapete oder unklaren Verantwortungsräumen verkommen.



\## 2. Die 4 aktiven Pillars



Die aktuelle operative Architektur von MBRN stützt sich auf vier aktive Pillars:



\- `frontend\_os`

\- `oracle`

\- `monetization`

\- `meta\_generator`



Diese Pillars dürfen nicht als lose Kategorien behandelt werden. Sie sind klare Verantwortungsräume im Gesamtsystem.



\## 3. Was die 4 Pillars aktuell sind und können



\### A. `frontend\_os`



\#### Idee

`frontend\_os` ist die sichtbare Produktfläche von MBRN. Nicht bloß CSS oder Buttons, sondern die Art, wie das gesamte System als zusammenhängendes Produkt erlebt wird.



\#### Aktuelle Rolle

\- trägt Shell, Navigation und Dashboard-Komposition

\- trennt Surface-Komposition vom UI-Unterbau

\- organisiert den Nutzerfluss über Landing Page, Dashboard und Apps



\#### Kurzform

`frontend\_os` ist die Produktbühne von MBRN.



\---



\### B. `oracle`



\#### Idee

`oracle` ist die Daten-, Signal- und Verarbeitungsmaschine von MBRN.



\#### Aktuelle Rolle

\- trägt `browser\_read`, `signals`, `fusion`, `snapshots`, `backtesting`

\- bündelt `processing` als Orchestrierungszone

\- sammelt, veredelt und erzeugt Daten und Ableitungen, die Apps und andere Pillars versorgen



\#### Kurzform

`oracle` ist der Maschinenraum für Signale, Daten und Auswertung.



\---



\### C. `monetization`



\#### Idee

`monetization` ist nicht Stripe selbst, sondern die Fachlogik hinter Wert, Freischaltung, Zugriff und Plänen.



\#### Aktuelle Rolle

\- strukturiert `api\_products`, `pricing`, `plans`, `entitlements`, `billing`, `gates`

\- modelliert `free`, `pro`, `business` als Planlogik

\- ordnet `plan\_id`, `artifact` und `business` fachlich ein



\#### Kurzform

`monetization` ist die Regelmaschine für Wert, Zugriff und spätere Aktivierung.



\---



\### D. `meta\_generator`



\#### Idee

`meta\_generator` ist die Generator- und Blueprint-Schicht von MBRN.



\#### Aktuelle Rolle

\- trägt `blueprints`, `content`, `modules`, `assets`, `agent\_adapters`

\- versorgt Runtime- und Workflow-Konsumenten

\- bildet einen deterministischen Kern mit strukturierten AI-Adaptern



\#### Kurzform

`meta\_generator` ist die Fabrik für zukünftige Bausteine, Strukturen und teilautomatisierte Modul-Erzeugung.



\## 4. Was die Pillars idealerweise werden sollen



Damit die Pillars „fertig“ und belastbar werden, braucht jede Säule ein klares Endbild.



\### `frontend\_os` soll werden

Ein hochwertiges, eindeutiges Browser-Produktbetriebssystem für MBRN.



\#### Perfektes Endbild

\- einheitliche Navigation

\- klare Surface-Regeln

\- Dashboard als echter Hub

\- jede App fühlt sich wie Teil eines Produkts an

\- Landing → App → Dashboard → nächste App fühlt sich wie ein einziger Strom an

\- kein UI-Chaos, kein Tool-Zoo



\#### Killerfrage

Fühlt sich jede sichtbare Fläche wie MBRN an, oder wie eine lose Sammlung?



\---



\### `oracle` soll werden

Eine vertrauenswürdige, modulare Intelligenz- und Datenmaschine.



\#### Perfektes Endbild

\- standardisierte Inputs

\- standardisierte Snapshots, Signals und Outputs

\- klare Datenveredelung

\- Tests, Verträge und Plausibilitätschecks

\- reproduzierbare Resultate

\- Oracle-Outputs können von Apps, `monetization` und `meta\_generator` genutzt werden



\#### Killerfrage

Liefert `oracle` nur Daten, oder wirklich verwertbare, belastbare Systemsubstanz?



\---



\### `monetization` soll werden

Eine komplett vorbereitete, aber kontrolliert aktivierbare Wertelogik.



\#### Perfektes Endbild

\- sauber definierte Plans

\- eindeutige Entitlements

\- sauberes Gating

\- keine verstreute Paywall-Logik

\- Commerce-Anbindung nur als Steckerverbindung, nicht als Fachchaos

\- später aktivierbar ohne Architekturumbau



\#### Killerfrage

Könntest du morgen legal live gehen, ohne die Fachlogik neu erfinden zu müssen?



\---



\### `meta\_generator` soll werden

Eine wiederverwendbare Produktionsmaschine für neue MBRN-Bausteine.



\#### Perfektes Endbild

\- klare Blueprint-Standards

\- Modul-Scaffolds aus festen Mustern

\- Agenten wissen, wie neue Module entstehen

\- kein improvisiertes Copy-Paste-Wachstum

\- neue App-Strukturen lassen sich halbautomatisch oder stark geführt erzeugen



\#### Killerfrage

Baut MBRN neue Bausteine schon als System, oder immer noch als Einzelanfertigung?



\## 5. Die 7 Fertigstellungsregeln pro Pillar



\### Regel 1 — Jeder Pillar braucht einen 1-Satz-Auftrag



Für jede Säule muss in ihrer README oder CHARTER-Datei ein glasklarer Auftrag stehen.



\#### Beispiele

\- `frontend\_os`: Responsible for user-facing surface composition, navigation flow, and product-level interaction coherence.

\- `oracle`: Responsible for data ingestion, signal derivation, analytical snapshots, and reproducible intelligence outputs.

\- `monetization`: Responsible for plans, entitlements, access rules, and activation-ready value logic.

\- `meta\_generator`: Responsible for blueprint-driven generation of reusable modules, assets, and structured system scaffolds.



Wenn ein Pillar seinen Job nicht in einem Satz sagen kann, ist er noch nicht scharf.



\---



\### Regel 2 — Jeder Pillar braucht klare Inputs und Outputs



Ohne Input-/Output-Grenzen laufen Säulen irgendwann ineinander wie nasse Farbe.



\#### Beispiele



\##### `oracle`

\- Inputs: raw data, browser reads, source snapshots

\- Outputs: normalized signals, backtests, predictions, derived artifacts



\##### `frontend\_os`

\- Inputs: app state, route state, read models, design primitives

\- Outputs: coherent surfaces, navigation flow, rendered product experience



\---



\### Regel 3 — Jeder Pillar braucht klare Nicht-Zuständigkeiten



Nicht-Zuständigkeiten sind fast wichtiger als Zuständigkeiten.



\#### Beispiele



\##### `frontend\_os` macht nicht:

\- Provider-Integrationen

\- Business-Primitive

\- Rohdaten-Verarbeitung



\##### `monetization` macht nicht:

\- Stripe-Webhook-Implementierung selbst

\- UI-Rendering

\- Datenveredelung



\##### `oracle` macht nicht:

\- Planlogik

\- sichtbare Surface-Komposition



Das verhindert spätere Zombie-Verkabelung.



\---



\### Regel 4 — Jeder Pillar braucht einen Reifegrad-Check



Nicht nur „aktiv“, sondern:

\- was ist stabil

\- was ist experimentell

\- was ist nur vorgesehen

\- was ist fake-aktiv in der Doku



\#### Leitbild für die Einordnung



\##### `frontend\_os`

\- stable: navigation, dashboard surface, UI composition

\- provisional: app-surface consistency gaps



\##### `oracle`

\- implemented: processing structure, signal modules

\- experimental: bestimmte Pipelines, lokale Worker, Backtesting-Tiefe



\##### `monetization`

\- stable fachlich

\- not publicly activated operativ



\##### `meta\_generator`

\- implemented teilweise

\- noch nicht voll industrialisiert



\---



\### Regel 5 — Jeder Pillar braucht 3–5 Beweisobjekte



Keine Prosa, sondern Beweise.



\#### Beispiele



\##### `oracle` Beweise

\- echte Module

\- echte Outputs

\- echte Tests

\- echte Konsumenten



\##### `frontend\_os` Beweise

\- sichtbare Landing

\- Dashboard

\- App-Komposition

\- Routing und Navigation



Wenn ein Pillar keine Beweise hat, ist er eher Konzepttapete.



\---



\### Regel 6 — Jeder Pillar braucht eine Fertig-Definition



\#### `frontend\_os` ist „fertig genug“, wenn:

\- alle sichtbaren Flächen konsistent sind

\- eine Nutzerreise sauber durchläuft

\- keine App wie ein Fremdkörper wirkt



\#### `oracle` ist „fertig genug“, wenn:

\- Inputs standardisiert sind

\- Outputs reproduzierbar sind

\- Tests und Plausibilitätsprüfungen existieren

\- mindestens 2 echte Konsumenten existieren



\#### `monetization` ist „fertig genug“, wenn:

\- Plan-, Gate- und Entitlement-Modell komplett sind

\- keine Logikstreuung existiert

\- Aktivierung nur noch Anschlussfrage ist



\#### `meta\_generator` ist „fertig genug“, wenn:

\- mindestens ein neuer Baustein aus Blueprint-Logik statt aus manuellem Basteln entsteht



\---



\### Regel 7 — Jeder Pillar braucht einen Anti-Chaos-Check



Frage für jede Änderung:



\*\*Macht diese Änderung den Pillar klarer, oder nur breiter?\*\*



Wenn nur breiter:

\- stoppen

\- anders schneiden

\- in einen anderen Bereich legen



\## 6. Der Ausbauplan für perfekte Pillars



\### Phase A — Pillar Charter schreiben

Für jede Säule eine kleine `README.md` oder `CHARTER.md` mit:

\- Auftrag

\- Inputs

\- Outputs

\- Nicht-Zuständigkeiten

\- Reifegrad

\- Fertig-Definition



\### Phase B — Evidence Map

Für jede Säule 3–5 reale Beweise auflisten:

\- Dateien

\- Module

\- Outputs

\- konsumierende Systeme



\### Phase C — Drift Cleanup

Prüfen:

\- liegt irgendwo Logik im falschen Pillar?

\- ist irgendwo Business-Logik in UI?

\- liegt irgendwo Integrationslogik im falschen Layer?

\- liegt irgendwo Generator-Kram als Copy-Paste-Rest?



\### Phase D — Pillar Scorecard

Jede Säule ehrlich scoren:

\- Klarheit

\- Beweisbarkeit

\- Reife

\- Integrationssauberkeit

\- Zukunftsfähigkeit



\## 7. Harte Einschätzung pro Pillar



\### `frontend\_os`

Am produktnahsten, wahrscheinlich am greifbarsten.  

Gefahr: Inkonsistente App-Flächen oder noch kein komplett einheitlicher Strom.



\### `oracle`

Am mächtigsten als Maschinenraum.  

Gefahr: Zu viel implizite Komplexität, die nicht genug standardisiert ist.



\### `monetization`

Fachlich wahrscheinlich gut gedacht.  

Gefahr: Doku und Realität driften später auseinander, wenn Commerce und Aktivierung nicht sauber gekoppelt bleiben.



\### `meta\_generator`

Strategisch sehr stark, aber oft am leichtesten überbehauptet.  

Gefahr: Klingt größer als seine operative Reife.



\## 8. Finales Prinzip



Perfekt werden die Pillars nicht dadurch, dass sie größer werden, sondern dadurch, dass jede Säule glasklar sagen kann:



\- Das ist mein Job.

\- Das ist nicht mein Job.

\- Das nehme ich rein.

\- Das gebe ich raus.

\- Hier ist der Beweis.



Pillars sollen mit der Zeit nicht breiter, sondern klarer, belastbarer und sauberer voneinander getrennt werden.

