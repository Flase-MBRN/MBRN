# MBRN Context for LLM

## Repo-Wahrheit

Die einzige technische Wahrheit liegt in:

- `C:\DevLab\MBRN-HUB-V1`

Alles ausserhalb dieses Repos ist kein paralleler Architekturbaum.

## Architektur in Kurzform

- `shared/core/` = IO-freie Mitte
- `shared/application/` = Cross-Pillar-Orchestrierung
- `bridges/*` = technische Integrationen
- `commerce/*` = Provider-Technik
- `pillars/frontend_os/` = aktive Surface-Komposition
- `shared/ui/` = business-blinde UI-Infrastruktur

## Aktive Pillars

- `frontend_os` = aktiv
- `oracle` = aktiv mit Pipeline-Adaptern
- `monetization` = aktiv entlang einer Fachkette
- `meta_generator` = seed-active

## Aktive Dimensions

- `growth`
- `pattern`
- `time`
- `signal`

## Wichtige Wahrheiten

- `dimensionRegistry` ist die primaere Runtime-Wahrheit.
- `dimensions/*/metadata.json` sind Spiegel.
- `synergy` bleibt `pattern` + `provisional`.
- `000_MBRN_V3_100_PERCENT_CHECKLIST.md` ist die operative v3-Abnahme.
- `001_POST_V3_ROADMAP.md` ist reine Folgeplanung.
- Oracle-Heavy-Processing lebt operativ weiter unter `scripts/oracle/`.
- `shared/ui/theme.css` ist der finale Aggregate-Entry fuer no-build Surfaces.
- Reservierte Zielzonen werden markiert, nicht mit Fake-Code gefuellt.

## Nicht behaupten

- nicht sagen, dass 11 Dimensions bereits aktiv sind
- nicht sagen, dass `meta_generator` voll ausgebaut ist
- nicht sagen, dass alle 4 Pillars voll ausgebaut sind
- nicht sagen, dass historische Audit-Dokumente die aktuelle Runtime-Wahrheit sind
