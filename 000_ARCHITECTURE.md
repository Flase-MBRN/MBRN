# 000_ARCHITECTURE.md

## Zweck

Dieses Dokument beschreibt die aktive Systemwahrheit von MBRN Hub.

Es darf keinen zukuenftigen Zustand als bereits umgesetzt behaupten.

## Aktueller Zielzustand

MBRN ist aktuell auf eine v4.0-Foundation gestellt:

- nur eine technische Wahrheit im Repo
- IO-freier Core
- Cross-Pillar-Orchestrierung im Application-Layer
- Bridges und Commerce als technische Aussenhaut
- Frontend OS als aktive Surface-Komposition
- 11 offizielle Dimensions als Hauptstruktur
- optionale `topic_areas` zwischen Dimension und App

## Architekturgesetze

1. `shared/core/` kennt keine externe IO.
2. `shared/application/` verbindet Core, Bridges, Commerce und Oberflaechen.
3. `bridges/*` und `commerce/*` tragen technische Integrationen.
4. `pillars/frontend_os/` enthaelt Surface-Komposition, nicht Primitive oder Providerlogik.
5. `shared/ui/` bleibt business-blinde UI-Infrastruktur.
6. `dimensionRegistry` ist die kanonische Runtime-Wahrheit fuer Dimensions.
7. `topic_area_registry` fuehrt optionale Themenbereiche unterhalb einer Dimension.
8. `dimensions/*/metadata.json` sind Spiegel, nicht Primaerquelle.
9. Apps duerfen direkt unter einer Dimension oder innerhalb einer `topic_area` haengen.

## Aktive Struktur

```text
/MBRN-HUB-V1
  /shared
    /core
    /application
    /ui
  /pillars
    /meta_generator
    /monetization
    /oracle
    /frontend_os
  /dimensions
  /apps
  /bridges
  /commerce
  /dashboard
  /scripts
  /supabase
```

## Reifegrad der 4 Pillars

### `frontend_os`
Aktiv und produktiv genutzt.

### `oracle`
Aktiv als vollstaendige Oracle-Maschine:

- `browser_read`, `signals`, `fusion`, `snapshots`, `backtesting` aktiv
- `processing` als aktive Orchestrierungszone
- Browser-/Application-Consumption bleibt die Wahrheit unter `pillars/oracle/*`

### `monetization`
Aktiv entlang einer Fachkette:

- `api_products`
- `pricing`
- `plans`
- `entitlements`
- `billing`
- `gates`

### `meta_generator`
Aktiv als Generator-Pillar:

- `blueprints`, `content`, `modules`, `assets`, `agent_adapters` aktiv
- Runtime-Konsumenten in `shared/application/frontend_os/*`
- Workflow-Konsumenten in `scripts/devlab/*`

## Dimensions

Offiziell formalisierte Dimensions:

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

Aktive App-Zuordnungen:

- `finance -> geld`
- `numerology -> muster`
- `chronos -> zeit`
- `synergy -> netzwerk`

Das bisherige `signal`-Thema ist keine eigene Dimension mehr und wird unter `geld` absorbiert.

## Supabase-Sync

Die Backend-Wahrheit fuer Dimensions wird ueber Referenztabellen vorbereitet:

- `dimensions`
- `topic_areas`

Supabase soll kanonische Dimensions- und Topic-Area-IDs spiegeln, statt freie Legacy-Werte weiterzutragen.
