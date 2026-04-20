# MBRN Hub v3 Platform

MBRN Hub ist aktuell eine **plattformsaubere v3-Basis** rund um einen IO-freien Core, einen klaren Application-Layer und eine bewusst ehrliche Pillar-Struktur.

Der aktuelle Stand ist **nicht** die volle Vision mit 11 Dimensions oder 4 voll ausgebauten Businesses.  
Der aktuelle Stand ist die bereinigte Plattform, auf der diese spätere Vision sauber wachsen kann.

## Aktive Systemwahrheit

- Die einzige technische Wahrheit liegt in diesem Repo: `C:\DevLab\MBRN-HUB-V1`
- `shared/core/` bleibt die IO-freie Mitte
- `shared/application/` trägt Cross-Pillar-Orchestrierung
- `bridges/*` und `commerce/*` tragen technische Außenwelt
- `pillars/frontend_os/` ist die aktive Surface-Komposition
- `dimensionRegistry` ist die primäre Runtime-Wahrheit für Dimensions
- `dimensions/*/metadata.json` sind Spiegel, nicht die kanonische Quelle

## Aktuelle Architektur

### Headless Core

`shared/core/` enthält:

- Contracts
- Registries
- State
- Storage
- Config
- Legal
- pure Logic

Keine externe IO lebt dauerhaft im Core.

### Application Layer

`shared/application/` verbindet Core, Bridges, Commerce und Oberflächen:

- Actions
- Auth
- Sync
- Observability
- Read Models
- Resilience

### Bridges und Commerce

Produktiv aktiv:

- `bridges/supabase/`
- `commerce/stripe/`
- `commerce/payment_adapters/`
- `commerce/provider_maps/`

Bewusst reserviert:

- `bridges/local_llm/`
- `bridges/external_apis/`

### Pillars

#### `frontend_os`
Aktiv für:

- Shell
- Navigation
- Dashboard-Komposition
- Cards
- Auth-/Legal-Surfaces

#### `oracle`
Teilweise aktiv:

- `browser_read` ist aktiv
- weitere Unterzonen bleiben reserviert
- Heavy-Processing lebt aktuell weiterhin operativ unter `scripts/oracle/`

#### `monetization`
Minimal aktiv:

- `gates` ist aktiv
- weitere Businesszonen bleiben reserviert

#### `meta_generator`
Bewusst geplant, nicht aktiv implementiert.

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

Es gibt aktuell **4** formalisierte Dimensions, nicht 11.

## UI-Grenzen

`shared/ui/` bleibt gemeinsame UI-Infrastruktur:

- tokens
- theme
- dom
- primitives
- base components

Surface-spezifische Dinge liegen in `pillars/frontend_os/`.

Beispiel:

- Landing-Styles liegen in `pillars/frontend_os/shell/landing.css`
- mobile Sidebar-Gesten liegen in `pillars/frontend_os/navigation/touch_manager.js`

## Data und Oracle

Die Pipeline-Schicht bleibt operativ:

- `scripts/pipelines/`
- `scripts/oracle/`

Runtime-Mirror-Artefakte bleiben Artefakte und keine Primärquelle für Produktlogik:

- `shared/data/market_sentiment.json`
- `shared/data/oracle_prediction.json`
- `shared/data/oracle_backtest.json`

## Status

Der aktuelle Stand ist:

- Plattformbasis bereinigt
- Tests grün
- Registry/Manifest aktiv
- Root-Wahrheit auf dieses Repo reduziert
- 4 Pillars ehrlich eingeordnet, aber nicht künstlich „voll ausgebaut“

Nicht behauptet wird:

- 11 Dimensions
- fertiger Meta-Generator
- voll ausgebautes Oracle-Pillar
- voll ausgebautes Monetization-Pillar
