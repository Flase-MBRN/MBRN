# 000_ARCHITECTURE.md

## Zweck
Dieses Dokument beschreibt die **aktive** Systemwahrheit von MBRN Hub.

Es darf keinen zukünftigen Zustand als bereits umgesetzt behaupten.

## Aktueller Zielzustand

MBRN ist aktuell auf einen **plattformsauberen v3-Zustand** gebracht:

- nur eine technische Wahrheit im Repo
- IO-freier Core
- Cross-Pillar-Orchestrierung im Application-Layer
- Bridges und Commerce als technische Außenhaut
- Frontend OS als aktive Surface-Komposition
- ehrliche, nicht überbehauptete Pillars

Dieser Stand ist **nicht** die volle Vision mit 11 Dimensions oder 4 komplett ausgebauten Businesses.

## Architekturgesetze

1. `shared/core/` kennt keine externe IO.
2. `shared/application/` verbindet Core, Bridges, Commerce und Oberflächen.
3. `bridges/*` und `commerce/*` tragen technische Integrationen.
4. `pillars/frontend_os/` enthält Surface-Komposition, nicht Primitive oder Providerlogik.
5. `shared/ui/` bleibt business-blinde UI-Infrastruktur.
6. `dimensionRegistry` ist die kanonische Runtime-Wahrheit für Dimensions.
7. `dimensions/*/metadata.json` sind Spiegel, nicht Primärquelle.
8. Reservierte Zielzonen bleiben markiert statt künstlich mit Fake-Logik gefüllt.

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
Teilweise aktiv:

- `browser_read` aktiv
- Heavy-Processing weiter operativ in `scripts/oracle/`
- übrige Unterzonen reserviert

### `monetization`
Minimal aktiv:

- `gates` aktiv
- weitere Businesszonen reserviert

### `meta_generator`
Seed-aktiv:

- erste Generator-Subsysteme vorhanden
- erste interne Workflow-Konsumenten vorhanden
- noch nicht voll ausgebaut

## Dimensions

Aktuell formalisierte Dimensions:

- `growth`
- `pattern`
- `time`
- `signal`

Die 11-Dimensions-Welt gehört nicht zum aktuellen Plattform-Abschluss.

## Doku-Regel

Wenn ein Dokument ältere Pfade oder Vor-Refactor-Zustände beschreibt, ist es nur noch als historische Referenz zulässig und darf nicht als aktive Runtime-Wahrheit gelten.
