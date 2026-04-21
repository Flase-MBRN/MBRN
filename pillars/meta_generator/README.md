# /pillars/meta_generator/ - Meta Generator

**Status:** SEED ACTIVE

Der Meta Generator ist nicht mehr nur Vision, aber auch noch kein voll ausgebauter Produktions-Pillar.

## Aktiver Stand

Reale Module:

- `blueprints/`
- `content/`
- `modules/`
- `assets/`
- `agent_adapters/`

Aktiv konsumiert:

- `scripts/devlab/generate_post_v3_roadmap.mjs`
  - konsumiert `content/`
  - konsumiert `blueprints/`
  - erzeugt `001_POST_V3_ROADMAP.md`
- `scripts/devlab/preview_meta_generator_seed_bundle.mjs`
  - konsumiert `modules/`
  - konsumiert `assets/`
  - konsumiert `agent_adapters/`
  - erzeugt einen wiederholbaren Seed-Bundle-Preview fuer interne Workflows

## Rolle

Der Meta Generator transformiert wiederholbare Architektur- und Inhaltsmuster in reproduzierbare interne Artefakte:

- Roadmaps
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

## Noch nicht fertig

- kein voll ausgebauter Produktions-Workflow
- keine breite Runtime-Nutzung
- keine produktive KI-Orchestrierung

## Trigger fuer den naechsten Ausbau

Der Wechsel von `seed active` zu echtem Produktionsstatus passiert erst, wenn:

1. Blueprints mehrfach im Repo real genutzt werden
2. Modul-Scaffolds von internen Workflows konsumiert werden
3. Asset- und Adapter-Pfade echte Nutzung bekommen
4. KI-Integration stabil produktiv ist
