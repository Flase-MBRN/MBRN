# /pillars/meta_generator/ - Meta Generator

**Status:** ACTIVE

Der Meta Generator ist ein aktiver Generator-Pillar mit produktiven Runtime- und Workflow-Konsumenten.

## Aktiver Stand

Reale Module:

- `blueprints/`
- `content/`
- `modules/`
- `assets/`
- `agent_adapters/`

Marker-Wahrheit:

- aktive Seed-Module tragen `README.md`
- aktive Seed-Module tragen kein `NOT_IMPLEMENTED.md`
- `active` bedeutet hier: real, konsumiert und in Runtime wie Tooling verankert

Aktiv konsumiert:

- `scripts/devlab/generate_post_v3_roadmap.mjs`
  - konsumiert `content/`
  - konsumiert `blueprints/`
  - erzeugt `001_POST_V3_ROADMAP.md`
- `scripts/devlab/preview_meta_generator_seed_bundle.mjs`
  - konsumiert `modules/`
  - konsumiert `assets/`
  - konsumiert `agent_adapters/`
  - erzeugt einen wiederholbaren Generator-Bundle-Preview fuer interne Workflows
- `shared/application/frontend_os/discoverability_runtime.js`
  - konsumiert `content/` und `blueprints/`
- `shared/application/frontend_os/export_runtime.js`
  - konsumiert `content/` und `assets/`
- `scripts/devlab/generate_app_blueprint_bundle.mjs`
  - konsumiert `blueprints/`
- `scripts/devlab/preview_app_scaffold_bundle.mjs`
  - konsumiert `blueprints/`, `modules/` und `agent_adapters/`

## Rolle

Der Meta Generator transformiert wiederholbare Architektur-, Inhalts- und Exportmuster in reproduzierbare Artefakte:

- Roadmaps
- Dimension- und Surface-Bundles
- Blueprints
- Modulgerueste
- Asset-Spezifikationen
- Adapter-Requests

## Scope-Regel

Erlaubt:

- wiederholbare Blueprints
- strukturierte Inhaltsartefakte
- Modul-Scaffolds
- Asset-Spezifikationen
- Agent-Adapter-Requests

Nicht erlaubt:

- beliebige KI-Experimente ohne echten Konsumenten
- allgemeine Prompt-Ablage ohne Workflow
- fachfremde Businesslogik

Die harte technische Scope-Grenze liegt in `scope_manifest.js`.

## Dokumentierte Active-Realitaet

- `blueprints` und `content` sind reale Generator-Module fuer Runtime- und Roadmap-Workflows
- `modules`, `assets` und `agent_adapters` sind reale Generator-Module fuer Scaffold-, Export- und Adapter-Workflows
- die Subzonen bleiben deterministisch und strukturiert
- der Meta Generator ist damit kein Seed mehr, sondern ein aktiver Generator-Pillar

## Architekturgrenze

- keine freie Prompt-Ablage
- keine fachfremde Businesslogik
- keine harte Live-LLM-Abhaengigkeit in der Produkt-Runtime
- AI-Nutzung nur ueber strukturierte Adapter-Work-Orders
