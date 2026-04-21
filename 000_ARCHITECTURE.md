# 000_ARCHITECTURE.md

## Zweck

Dieses Dokument beschreibt die aktive Systemwahrheit von MBRN Hub.

Es darf keinen zukuenftigen Zustand als bereits umgesetzt behaupten.

## Aktueller Zielzustand

MBRN ist aktuell auf einen plattformsauberen v3-Zustand gebracht:

- nur eine technische Wahrheit im Repo
- IO-freier Core
- Cross-Pillar-Orchestrierung im Application-Layer
- Bridges und Commerce als technische Aussenhaut
- Frontend OS als aktive Surface-Komposition
- ehrliche, nicht ueberbehauptete Pillars
- getrennte operative Dateien fuer v3-Abnahme und Post-v3-Folgeplanung

Dieser Stand ist nicht die volle Vision mit 11 Dimensions oder 4 komplett ausgebauten Businesses.

## Architekturgesetze

1. `shared/core/` kennt keine externe IO.
2. `shared/application/` verbindet Core, Bridges, Commerce und Oberflaechen.
3. `bridges/*` und `commerce/*` tragen technische Integrationen.
4. `pillars/frontend_os/` enthaelt Surface-Komposition, nicht Primitive oder Providerlogik.
5. `shared/ui/` bleibt business-blinde UI-Infrastruktur.
6. `dimensionRegistry` ist die kanonische Runtime-Wahrheit fuer Dimensions.
7. `dimensions/*/metadata.json` sind Spiegel, nicht Primaerquelle.
8. Reservierte Zielzonen bleiben markiert statt kuenstlich mit Fake-Logik gefuellt.

## Aktive Struktur

```text
/MBRN-HUB-V1
  /shared
    /core
    /application
    /ui
    /loyalty
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
Aktiv mit Pipeline-Adaptern:

- `browser_read`, `signals`, `fusion`, `snapshots`, `backtesting` aktiv
- `processing` als Manifest-/Adapter-Zone aktiv
- Heavy-Processing weiter operativ in `scripts/oracle/`
- Browser-/Application-Consumption bleibt die Wahrheit unter `pillars/oracle/*`

### `monetization`
Aktiv entlang einer Fachkette:

- `api_products`
- `pricing`
- `plans`
- `entitlements`
- `billing`
- `gates`
- `free`, `pro`, `business` bilden die aktuelle policy-grade Planwahrheit
- `business` ist fachlich real, aber nicht automatisch checkout-faehig
- `billing`
- `gates`

### `meta_generator`
Seed-aktiv:

- erste Generator-Subsysteme vorhanden
- mindestens zwei interne Workflow-Konsumenten vorhanden
- noch nicht voll ausgebaut

## Dimensions

Aktuell formalisierte Dimensions:

- `growth`
- `pattern`
- `time`
- `signal`

Die 11-Dimensions-Welt gehoert nicht zum aktuellen Plattform-Abschluss.

## Doku-Regel

Wenn ein Dokument aeltere Pfade oder Vor-Refactor-Zustaende beschreibt, ist es nur noch als historische Referenz zulaessig und darf nicht als aktive Runtime-Wahrheit gelten.
