# MBRN Agent Rules

## Canon Rule
1. `000_CANONICAL_STATE.json` is the single source of truth for current system state.
2. If `000_CANONICAL_STATE.json` is missing, invalid, or not parseable JSON, report `CANON_FATAL_ERROR`.
3. Do not infer official system state from README, plans, directory scans, or implementation alone.

## Reporting Order
1. Read `000_CANONICAL_STATE.json` first.
2. Check implementation second.
3. Report drift third.
4. Use README and architecture docs only as human-readable mirrors.

## Drift Rules
1. If code or files exist but are not declared in `000_CANONICAL_STATE.json`, report `IMPLEMENTATION_DRIFT`.
2. If README or docs claim a state not matching `000_CANONICAL_STATE.json`, report `DOCUMENTATION_DRIFT`.
3. If plans or vision text describe future capabilities as present reality, report `VISION_DRIFT`.

## Naming Rule
1. Use official v3 nomenclature in all reports:
   - Pillars
   - Bridges
   - Dimensions
   - Apps
   - Systems
2. Do not replace canonical architecture names with raw tech-stack labels.
3. Vanilla JS, Python, Supabase, Ollama, and similar terms may only be used as infrastructure descriptors, not as replacement pillar names.

## Status Rule
1. Use `state` as the official status.
2. Use `maturity` as the implementation maturity.
3. Never collapse `state` and `maturity` into one label.

## Reality Rule
1. Anything not declared in `000_CANONICAL_STATE.json` does not officially exist.
2. Vision is not reality.
## Reserved Status
1. Components marked as `reserved` are allowed to exist as declarations without physical implementation.
2. Only components marked as `active`, `provisional`, `experimental`, or `internal` require physical implementation evidence to avoid drift.

## Support Files
1. Canonical state is defined at the system/component level, not the granular file level (unless explicitly declared).
## Mirror Maintenance Rule
1. `README.md` is a human-readable mirror of `000_CANONICAL_STATE.json`.
2. If an agent changes canonical state or resolves documentation drift, the agent must review `README.md` for mirror consistency.
3. No agent may leave `README.md` in a state that contradicts `000_CANONICAL_STATE.json`.
4. README must not describe internal, experimental, reserved, or not-yet-public systems as publicly active unless the canonical state explicitly says so.
5. Commerce and monetization components that are technically implemented but not publicly enabled must be described as internal, prepared, experimental, or not publicly released.

## Public/Private Boundary Rule
1. Canonical state, agent governance, architecture mirrors, and active pillar charters are public governance truth and must remain Git-tracked.
2. Private operator or machine-room material may remain intentionally ignored when it describes internal execution rather than official product or governance state.
3. `scripts/pipelines/` and `docs/S3_Data/` are private machine-room zones and must not be used as primary system-status authority.
4. No ignored internal document may silently override a tracked canonical or governance file.

## Archive Policy
1. Historical root documents that are no longer active truth must be moved under `_archive_docs/`.
2. Files inside `_archive_docs/` are historical only and must not be used for current status claims, architecture decisions, or agent reporting.
3. Archived files must carry an explicit deprecation marker at the top of the document.
4. If an active document is replaced by an archived one, the active replacement must be clear before the archive move is considered complete.
