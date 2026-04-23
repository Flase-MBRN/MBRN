# MBRN Hub v4.0 FOUNDATION

> Official current-state authority: [000_CANONICAL_STATE.json](file:///c:/DevLab/MBRN-HUB-V1/000_CANONICAL_STATE.json)  
> This README is a human-readable mirror only.  
> In any conflict between README text and the canonical state file, the canonical state file wins.

MBRN Hub ist aktuell auf eine v4.0-Foundation umgestellt: 11 Dimensionen als offizielle Hauptstruktur, optionale `topic_areas` als Zwischenschicht und konkrete Apps oder Websites als operative Surfaces.

## Aktive Systemwahrheit

- Die einzige technische Wahrheit liegt in diesem Repo: `C:\DevLab\MBRN-HUB-V1`
- `shared/core/` bleibt die IO-freie Mitte
- `shared/application/` traegt Cross-Pillar-Orchestrierung
- `bridges/*` und `commerce/*` tragen technische Aussenwelt
- `pillars/frontend_os/` bleibt die aktive Surface-Komposition
- `dimensionRegistry` ist die primaere Runtime-Wahrheit fuer Dimensions
- `topic_area_registry` fuehrt optionale Themenbereiche zwischen Dimension und App
- `dimensions/*/metadata.json` sind Spiegel, nicht die kanonische Quelle

## Architektur in Kurzform

### Headless Core

`shared/core/` enthaelt:

- Contracts
- Registries
- State
- Storage
- Config
- Legal
- pure Logic

Keine externe IO lebt dauerhaft im Core.

### Application Layer

`shared/application/` verbindet Core, Bridges, Commerce und Oberflaechen:

- Actions
- Auth
- Sync
- Observability
- Read Models
- Frontend-OS Runtime-Fassaden

### Bridges und Commerce

Produktiv aktiv:

- `bridges/supabase/`
- `bridges/python/`

Bewusst reserviert / nicht implementiert:

- `bridges/local_llm/`
- `bridges/external_apis/`

### Pillars

- `frontend_os` = Shell, Navigation, Dashboard-Komposition, Cards, UI States, `app_surfaces/`, `dimension_views/`, `export_entrypoints/`
- `oracle` = Daten-, Signal- und Verarbeitungsmaschine
- `monetization` = Plans, Entitlements, Billing und Gates
- `meta_generator` = Blueprints, Content, Modules, Assets, Agent Adapters

## Dimensions, Topic Areas und Apps

Offizielle Dimensions:

- `zeit`
- `geld`
- `physis`
- `geist`
- `ausdruck`
- `netzwerk`
- `energie`
- `systeme`
- `raum`
- `muster`
- `wachstum`

Aktive Start-Zuordnungen:

- `finance -> geld`
- `numerology -> muster -> numerologie`
- `chronos -> zeit`
- `synergy -> netzwerk`

`topic_areas` sind optional. Eine App darf entweder direkt unter ihrer Dimension haengen oder innerhalb einer `topic_area` gefuehrt werden.

## Supabase

Supabase wird nicht nur als Infrastruktur, sondern auch als Spiegel der kanonischen Dimensions-Wahrheit behandelt.

- `supabase/migrations/15_dimensions_foundation.sql` legt feste Referenztabellen fuer `dimensions` und `topic_areas` an
- neue Persistenz soll Dimensionszuege ueber Referenzdaten statt freie Legacy-IDs fuehren
- das fruehere `signal`-Thema bleibt keine eigene Dimension und geht semantisch in `geld` auf

## Status

Der aktuelle Stand ist:

- v4.0-Foundation gesetzt
- 11 Dimensionen kanonisch eingefuehrt
- optionale `topic_areas` in Kanon und Runtime vorbereitet
- bestehende Surfaces neu zugeordnet
- Supabase-Referenzstruktur fuer Dimensions-Sync vorbereitet

## Roadmaps

Roadmaps leben bewusst getrennt von der Ist-Wahrheit.

- operative Ausbau-Roadmap: `docs/roadmaps/2026-04_mbrn_autonomy_machine.md`
- uebergeordnete Ausbaurichtung: `001_POST_V3_ROADMAP.md`

Nicht behauptet wird:

- dass jede Dimension bereits eine eigene fertige Surface hat
- dass jede `topic_area` bereits mit einer App gefuellt ist
- dass historische v3-Dokumente die neue aktive Runtime-Wahrheit ueberschreiben
