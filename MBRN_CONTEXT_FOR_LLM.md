# MBRN Context for LLM

## Repo-Wahrheit

Die einzige technische Wahrheit liegt in:

- `C:\DevLab\MBRN-HUB-V1`

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
- `meta_generator` = aktive Generator-Pillar

## Aktive Dimensions

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

## Wichtige Wahrheiten

- `dimensionRegistry` ist die primaere Runtime-Wahrheit.
- `topic_area_registry` fuehrt optionale Themenbereiche.
- `dimensions/*/metadata.json` sind Spiegel.
- `numerology` lebt unter `muster`.
- `chronos` lebt unter `zeit`.
- `synergy` lebt unter `netzwerk` und bleibt `provisional`.
- `bridges/local_llm/` ist jetzt der formale Week-2-Bridge fuer lokale JSON-Veredelung.
- `gold_dashboard_items` ist die Week-3-View fuer frontend-sichere Gold-Daten.
- Gold-Signale leben unter `geld -> oracle_signal`; das Dashboard zeigt hoechstens einen kompakten Sprungpunkt.
- `scripts/pipelines/day_zero_autopilot.ps1` ist der Week-4-Autopilot: Collector zuerst, dann lokaler LLM-Worker.
- `shared/ui/theme.css` ist der finale Aggregate-Entry fuer no-build Surfaces.
- Reservierte Zielzonen werden markiert, nicht mit Fake-Code gefuellt.

## Nicht behaupten

- nicht sagen, dass jede der 11 Dimensions schon eine fertige eigene Surface hat
- nicht sagen, dass jede `topic_area` bereits gebaut ist
- nicht sagen, dass `signal` noch eine eigene Dimension ist
- nicht sagen, dass Gold-Signale als volle Dashboard-App gerendert werden
- nicht sagen, dass Week 4 Stripe, Paywall oder Premium-Gating veraendert
- nicht sagen, dass historische v3-Dokumente die aktuelle Runtime-Wahrheit sind
