# MBRN Hub v1.0

Core & Viral Framework.

MBRN Hub is a modular pattern-intelligence system built to run fast in the browser, stay deterministic in the core, and scale toward heavier data and AI workloads without rewriting the product surface.

The current milestone seals four things:
- a canonical headless core
- a production-facing Observatory UI
- a dormant commerce layer running in Ghost Mode
- a dual-export viral engine for image-based sharing

## Architecture

MBRN Hub is organized around four pillars:

1. Vanilla JavaScript application layer
   Clean ES module apps with a direct browser runtime, no framework lock-in, and canonical UI entrypoints for dashboard and tool experiences.

2. Headless core logic
   Shared business logic lives in `shared/core/` and is designed to stay importable, testable, and deterministic outside the DOM. Numerology, orchestration, export payloads, storage behavior, and state coordination are centralized here.

3. Supabase data and realtime bridge
   Supabase is the single cloud bridge for auth, profile persistence, realtime subscriptions, and future cloud synchronization. The public browser bridge is intentionally reduced to the canonical client path.

4. Python / local inference preparation
   The repo already contains the pipeline foundation for heavier external enrichment and local model workflows. This includes the preparation layer for Python-driven data ingestion and Llama/Ollama-style enrichment without contaminating the browser core.

## Current System State

### Headless Core

The core has been hardened around a strict separation between browser UI and shared logic:
- canonical orchestrator entrypoints
- isolated browser guards where runtime access is required
- no dependency on UI rendering paths for business logic
- test-first exports for report and canvas payload generation

This allows the core to remain stable under Node/Jest while the frontend evolves independently.

### Ghost Mode

Commerce infrastructure remains physically disconnected from the user journey.

- No live buy or subscribe path is surfaced in the UI.
- Commercial branches remain technically present but deactivated.
- The current mode prioritizes free product discovery, profile generation, and signal validation.

This gives the repo a truthful surface: no fake checkout promises, no monetization bait, no documentation drift.

### Observatory UI

The active UI layer uses the Observatory visual language:
- void-first dark canvas
- accent-glow hierarchy
- glass panels and cinematic spacing
- direct, frictionless tool entry

The landing experience and active tool surfaces are aligned around a single visual identity rather than mixed legacy patterns.

### Dual-Export Viral Engine

Numerology now exposes two distinct share assets:

- Detail Report Card
  A high-information export for users who want the fuller picture as an image.

- Mystery Teaser
  A stripped, curiosity-driven score asset optimized for story sharing and organic pull.

Both exports are powered by structured canvas payloads from the headless core and rendered through dedicated browser canvas helpers. The frontend now presents them as a deliberate two-tier action group with the teaser visually prioritized.

## Product Modules

The current canonical product stack centers on:
- unified profile orchestration
- numerology computation and report generation
- dashboard runtime with realtime-ready widgets
- Supabase-backed auth and storage coordination

Legacy compatibility edges removed during canonicalization are intentionally not part of the active product contract anymore.

## Engineering Posture

This repo is optimized around clarity over sprawl:
- canonical imports over compatibility shims
- explicit interfaces over hidden side effects
- offline-aware behavior over cloud dependency by default
- hard coverage pressure on active modules instead of inflated dead scope

The result is a system that is easier to audit, easier to test, and materially safer to extend.

## Milestone Release Notes

### Phase 4
- Canonicalized the active repo surface and reduced dead compatibility edges.
- Hardened the headless core boundary and stabilized Node-safe imports.
- Elevated the active test surface around the true product modules.

### Phase D1
- Shipped the Observatory landing layer and aligned the main user entry with the current design system.
- Preserved frictionless access while keeping commerce dormant.

### Phase D2
- Shipped the cinematic share card pipeline.
- Added the mystery teaser export for high-curiosity social distribution.
- Integrated dual export actions directly into the numerology results flow.

## Repository Hygiene

Local cache artifacts and machine-generated data must not be treated as product source.

Protected by ignore policy:
- Python cache directories such as `__pycache__/`
- local sentiment snapshots such as `shared/data/market_sentiment.json`
- local-only JSON variants under `shared/data/*.local.json`

If a previously tracked machine-generated file still exists in Git history, it should be explicitly untracked in a later repository hygiene pass. The ignore policy now prevents new accidental inclusion.

## Status

MBRN Hub v1.0 is not a prototype dump. It is a sealed foundation:
- headless where the logic must stay pure
- expressive where the UI must create pull
- dormant where monetization would currently distort truth
- prepared where future data and local AI layers need room to attach
