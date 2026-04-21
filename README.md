# MBRN Hub v3 Platform

MBRN Hub ist aktuell eine plattformsaubere v3-Basis rund um einen IO-freien Core, einen klaren Application-Layer und eine bewusst ehrliche Pillar-Struktur.

Der aktuelle Stand ist nicht die volle Vision mit 11 Dimensions oder 4 voll ausgebauten Businesses. Der aktuelle Stand ist die bereinigte Plattform, auf der diese spaetere Vision sauber wachsen kann.

## Aktive Systemwahrheit

- Die einzige technische Wahrheit liegt in diesem Repo: `C:\DevLab\MBRN-HUB-V1`
- `shared/core/` bleibt die IO-freie Mitte
- `shared/application/` traegt Cross-Pillar-Orchestrierung
- `bridges/*` und `commerce/*` tragen technische Aussenwelt
- `pillars/frontend_os/` ist die einzige aktive Surface-Komposition
- `dimensionRegistry` ist die primaere Runtime-Wahrheit fuer Dimensions
- `dimensions/*/metadata.json` sind Spiegel, nicht die kanonische Quelle
- `000_MBRN_V3_100_PERCENT_CHECKLIST.md` ist die operative v3-Abnahme
- `001_POST_V3_ROADMAP.md` ist reine Folgeplanung nach v3

## Aktuelle Architektur

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
- `commerce/stripe/`
- `commerce/payment_adapters/`
- `commerce/provider_maps/`

Bewusst reserviert:

- `bridges/local_llm/`
- `bridges/external_apis/`

### Pillars

#### `frontend_os`
Aktiv fuer:

- Shell
- Navigation
- Dashboard-Komposition
- Cards
- UI States

Bewusst reserviert:

- `app_surfaces/`
- `dimension_views/`
- `export_entrypoints/`

#### `oracle`
Aktiv mit Pipeline-Adaptern:

- `browser_read`, `signals`, `fusion`, `snapshots`, `backtesting` liefern JS-Runtime-Substanz
- `processing` bildet die operative Heavy-Processing-Wahrheit als Manifest-/Adapter-Zone ab
- Heavy-Processing lebt weiterhin operativ unter `scripts/oracle/`
- Browser-/Application-Consumption liest nur ueber `pillars/oracle/*`

#### `monetization`
Aktiv entlang einer klaren Fachkette:

- `api_products`
- `pricing`
- `plans`
- `entitlements`
- `billing`
- `gates`
- `free`, `pro`, `business` sind die aktuelle policy-grade Planwahrheit
- `business` ist fachlich real, aber nicht automatisch voll kaufbar
- `billing`
- `gates`

#### `meta_generator`
Seed-aktiv:

- erste Generator-Subsysteme real vorhanden
- interner Workflow fuer Repo-Roadmap aktiv
- zweiter interner Seed-Workflow fuer Modul-, Asset- und Adapter-Previews aktiv
- noch nicht als voll ausgebauter Produktions-Pillar abgeschlossen

## Dimensions und Apps

Aktive formalisierte Dimensions:

- `growth`
- `pattern`
- `time`
- `signal`

Aktive App-Bindungen:

- `finance -> growth`
- `numerology -> pattern`
- `chronos -> time`
- `synergy -> pattern` mit `status = provisional`

Es gibt aktuell 4 formalisierte Dimensions, nicht 11.

## UI-Grenzen

`shared/ui/` bleibt gemeinsame UI-Infrastruktur:

- tokens
- theme
- dom
- primitives
- base components

`shared/ui/theme.css` ist der finale oeffentliche Aggregate-Entry fuer no-build HTML-Surfaces.

Surface-spezifische Dinge liegen in `pillars/frontend_os/`.

## Data und Oracle

Die Pipeline-Schicht bleibt operativ:

- `scripts/pipelines/`
- `scripts/oracle/`

Runtime-Mirror-Artefakte bleiben Artefakte und keine Primaerquelle fuer Produktlogik:

- `shared/data/market_sentiment.json`
- `shared/data/oracle_prediction.json`
- `shared/data/oracle_backtest.json`

## Status

Der aktuelle Stand ist:

- Plattformbasis bereinigt
- Registry/Manifest aktiv
- Root-Wahrheit auf dieses Repo reduziert
- aktives Close-out Gate und Stage A sichtbar im Repo
- 4 Pillars ehrlich eingeordnet, aber nicht kuenstlich "voll ausgebaut"

Nicht behauptet wird:

- 11 Dimensions
- fertiger Meta-Generator
- voll ausgebautes Oracle-Heavy-Processing im Pillar
- fertige Monetization-Produkte jenseits der aktuellen Fachkette
