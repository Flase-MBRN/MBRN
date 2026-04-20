# 000_FORENSIC_PROJECT_AUDIT

> MBRN-HUB-V1 - Forensic Project Audit  
> Date: 2026-04-18  
> Scope: `C:\DevLab\MBRN-HUB-V1` plus workspace boundary checks for `C:\DevLab`  
> Mode: Read-only audit baseline, no productive code changed during the audit pass itself  
> Note: This file captures the forensic baseline before the canonicalization repair batch. Live post-fix status is tracked in [`000_SYSTEM_DEBT_REPORT.md`](./000_SYSTEM_DEBT_REPORT.md).

---

> **V3 IST 100% COMPLETE**
> Phasen 1-5 abgeschlossen. Alle Audit-Punkte behoben.

---

## Executive Summary

The active kernel is operational and the serial Jest gate is green, but the project is not fully canonicalized. The main residual risk is no longer failing tests. It is drift between live repo reality and the governance layer:

- the working tree is not clean
- the debt manifest no longer reflects the live state
- architecture boundaries in `shared/core` are still partially violated
- some UI routing and documentation contracts are still split across multiple truths

This means the system is usable, but not yet "forensically clean".

---

## Audit Basis

### Commands executed

```powershell
git status --short
git branch --show-current
git log --oneline -n 15
node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand
git diff --stat
git diff -- shared/data/market_sentiment.json
Test-Path C:\DevLab_Archive
Test-Path C:\DevLab\_COLD_STORAGE
```

### Repo facts

| Metric | Value |
|---|---:|
| Current branch | `main` |
| Tracked files | `251` |
| Files under repo root | `4681` |
| Approx repo file volume | `28.16 MB` |
| Markdown files under repo root | `13` |

### Workspace facts

| Metric | Value |
|---|---:|
| Files under `C:\DevLab` | `5588` |
| Approx workspace file volume | `0.03 GB` |
| Nested `.git` directories | `1` |
| `node_modules` directories | `11` |
| `__pycache__` directories | `0` |
| `C:\DevLab_Archive` exists | `true` |
| `C:\DevLab\_COLD_STORAGE` exists | `false` |

### Current git snapshot

```text
 M shared/data/market_sentiment.json
?? 000_EXECUTION_ROADMAP.md
```

### Current test snapshot

```text
Test Suites: 10 passed, 10 total
Tests:       1 skipped, 194 passed, 195 total
Snapshots:   0 total
```

Important nuance:

- Jest exits successfully in serial mode.
- `tests/circuit_breaker.test.js` still produces expected `console.error` noise during failure-path tests.
- No open-handle hang was observed in the serial run executed for this audit.

---

## Findings

## P1 - Canonical Truth and Contract Drift

### P1.1 - Debt manifest is no longer canonical

**Severity:** High  
**Why it matters:** The project's declared source of truth now diverges from the live repo and workspace state. This creates false confidence and can misroute future agents.

**Evidence**

- [`000_SYSTEM_DEBT_REPORT.md`](./000_SYSTEM_DEBT_REPORT.md) claims `100%` healing progress and `0` open P1/P2 blockers.
- [`000_SYSTEM_DEBT_REPORT.md`](./000_SYSTEM_DEBT_REPORT.md) states repo hygiene is complete and the git tree is clean.
- Live repo state contradicts that:

```text
 M shared/data/market_sentiment.json
?? 000_EXECUTION_ROADMAP.md
```

- Header metrics in the debt report also no longer match the actual workspace:
  - report claims `24.7 GB`, `35` nested repos, `16` `node_modules`, `111` `__pycache__`
  - live workspace currently shows `0.03 GB`, `1` `.git`, `11` `node_modules`, `0` `__pycache__`

**Affected files**

- [`000_SYSTEM_DEBT_REPORT.md`](./000_SYSTEM_DEBT_REPORT.md)
- [`000_EXECUTION_ROADMAP.md`](./000_EXECUTION_ROADMAP.md)
- [`shared/data/market_sentiment.json`](./shared/data/market_sentiment.json)

**Status:** Open  
**Fix mode:** One shot documentation correction plus git hygiene decision

---

### P1.2 - Email validation contract remains split between validator layer and auth action layer

**Severity:** High  
**Why it matters:** Tests are green, but the live registration flow can still reject inputs that the canonical validator accepts.

**Evidence**

- [`shared/core/validators.js`](./shared/core/validators.js) no longer blocks `example.com`.
- [`tests/validators.test.js`](./tests/validators.test.js) explicitly expects `user@example.com` to pass.
- [`shared/core/actions.js`](./shared/core/actions.js) still contains `example.com` in `_blockedDomains`.

This produces two incompatible truths:

- validation truth: `example.com` is valid
- auth action truth: `example.com` is blocked

**Affected files**

- [`shared/core/validators.js`](./shared/core/validators.js)
- [`tests/validators.test.js`](./tests/validators.test.js)
- [`shared/core/actions.js`](./shared/core/actions.js)

**Status:** Open  
**Fix mode:** One shot contract unification

---

## P2 - Architecture and Runtime Boundary Violations

### P2.1 - `shared/core` still contains UI and DOM responsibilities

**Severity:** High  
**Why it matters:** The architecture explicitly demands separation between core logic and UI rendering. That rule is still violated in multiple live files.

**Evidence**

- [`shared/core/validators.js`](./shared/core/validators.js) exports `validateLive()` and `validateForm()`, both DOM-dependent.
- The same file creates DOM nodes directly via `document.createElement`.
- [`shared/core/api.js`](./shared/core/api.js) imports [`shared/ui/error_boundary.js`](./shared/ui/error_boundary.js), which is a UI-layer dependency from inside core.

This means the "core" layer is still partly coupled to the browser DOM and UI notifications.

**Affected files**

- [`shared/core/validators.js`](./shared/core/validators.js)
- [`shared/core/api.js`](./shared/core/api.js)
- [`shared/ui/error_boundary.js`](./shared/ui/error_boundary.js)

**Status:** Open  
**Fix mode:** Controlled sprint

---

### P2.2 - Additional browser-bound code still lives in `shared/core`

**Severity:** Medium  
**Why it matters:** Even with green tests, some core modules remain browser-only and reduce isolation, portability, and test confidence.

**Evidence**

- [`shared/core/error_logger.js`](./shared/core/error_logger.js) uses `window`, `navigator`, `window.location`, and online listeners without a guard boundary.
- [`shared/core/importmap.js`](./shared/core/importmap.js) manipulates `document.head` directly.
- [`shared/core/validators.js`](./shared/core/validators.js) still contains DOM work as noted above.

**Affected files**

- [`shared/core/error_logger.js`](./shared/core/error_logger.js)
- [`shared/core/importmap.js`](./shared/core/importmap.js)
- [`shared/core/validators.js`](./shared/core/validators.js)

**Status:** Open  
**Fix mode:** Controlled sprint

---

### P2.3 - Navigation is not fully single-source-of-truth

**Severity:** Medium  
**Why it matters:** Route definitions exist centrally, but the rendered navigation omits active routes. That is a subtle UX and governance drift.

**Evidence**

- [`shared/core/config.js`](./shared/core/config.js) defines routes and labels for `synergy` and `tuning`.
- [`shared/ui/render_nav.js`](./shared/ui/render_nav.js) renders only:
  - `home`
  - `dashboard`
  - `finance`
  - `numerology`
  - `chronos`

The route config and the rendered nav therefore do not match.

**Affected files**

- [`shared/core/config.js`](./shared/core/config.js)
- [`shared/ui/render_nav.js`](./shared/ui/render_nav.js)

**Status:** Open  
**Fix mode:** One shot or small sprint

---

### P2.4 - DOM safety policy still has at least one live exception

**Severity:** Medium  
**Why it matters:** The project documents a sanitized DOM path, but one widget still injects HTML directly.

**Evidence**

- [`shared/ui/widgets/sentiment_widget.js`](./shared/ui/widgets/sentiment_widget.js) uses `insertAdjacentHTML`.

This is not necessarily exploitable in its current template form, but it is a policy break and an avoidable inconsistency.

**Affected files**

- [`shared/ui/widgets/sentiment_widget.js`](./shared/ui/widgets/sentiment_widget.js)

**Status:** Open  
**Fix mode:** One shot

---

## P3 - Documentation and Governance Drift

### P3.1 - Architecture docs described non-live structure at baseline

**Severity:** Medium  
**Why it matters:** Agents and humans using the docs as source of truth can be sent into paths or concepts that no longer exist.

**Evidence**

- At baseline, [`000_ARCHITECTURE.md`](./000_ARCHITECTURE.md) still described a `/landing` directory.
- The actual landing implementation lives in [`index.html`](./index.html) and [`shared/ui/render_landing.js`](./shared/ui/render_landing.js).
- At baseline, [`000_plan.md`](./000_plan.md) still referenced `apps/synergy/logic.js`, which did not exist.

**Affected files**

- [`000_ARCHITECTURE.md`](./000_ARCHITECTURE.md)
- [`000_plan.md`](./000_plan.md)
- [`index.html`](./index.html)
- [`shared/ui/render_landing.js`](./shared/ui/render_landing.js)

**Status:** Open  
**Fix mode:** Governance sprint

---

### P3.2 - DevLab macro is materially outdated after workspace cutover

**Severity:** Medium  
**Why it matters:** The macro file still describes `_COLD_STORAGE` inside `C:\DevLab` and reports item counts that no longer match the live workspace.

**Evidence**

- [`C:\DevLab\000_DEVLAB_MACRO.md`](C:/DevLab/000_DEVLAB_MACRO.md) still documents `_COLD_STORAGE` under `C:\DevLab`.
- Live check:

```text
Test-Path C:\DevLab_Archive         => True
Test-Path C:\DevLab\_COLD_STORAGE   => False
```

**Affected files**

- [`C:\DevLab\000_DEVLAB_MACRO.md`](C:/DevLab/000_DEVLAB_MACRO.md)

**Status:** Open  
**Fix mode:** Governance sprint

---

### P3.3 - Some "green" areas are only partially covered by the test gate

**Severity:** Medium  
**Why it matters:** Green CI should mean the risky areas are actually exercised. Here, some DOM-bound behavior is effectively outside the active Node gate.

**Evidence**

- [`jest.config.js`](./jest.config.js) runs under `testEnvironment: 'node'`.
- DOM-dependent validator tests in [`tests/validators.test.js`](./tests/validators.test.js) are conditionally skipped when `document` is unavailable.
- This means the architecture-violating DOM functions in [`shared/core/validators.js`](./shared/core/validators.js) do not materially contribute to the green gate.

**Affected files**

- [`jest.config.js`](./jest.config.js)
- [`tests/validators.test.js`](./tests/validators.test.js)
- [`shared/core/validators.js`](./shared/core/validators.js)

**Status:** Open  
**Fix mode:** Controlled sprint

---

## Verified Good State

These areas were checked and are currently consistent with the "healed" narrative.

### Chronos source-of-truth

- [`shared/core/logic/orchestrator.js`](./shared/core/logic/orchestrator.js) imports `chronos_v2.js`
- [`apps/chronos/render.js`](./apps/chronos/render.js) imports `chronos_v2.js`
- [`supabase/functions/mbrn_compute/index.ts`](./supabase/functions/mbrn_compute/index.ts) imports `chronos_v2.js`
- [`shared/core/logic/chronos.js`](./shared/core/logic/chronos.js) and [`shared/core/logic/chronos_engine.js`](./shared/core/logic/chronos_engine.js) now behave as compatibility stubs

### Synergy contract

- [`shared/core/logic/synergy.js`](./shared/core/logic/synergy.js)
- [`shared/core/logic/synergy_engine.js`](./shared/core/logic/synergy_engine.js)
- [`shared/core/logic/synergy_contract.js`](./shared/core/logic/synergy_contract.js)
- [`dashboard/render_dashboard.js`](./dashboard/render_dashboard.js)
- [`apps/synergy/render.js`](./apps/synergy/render.js)

The score normalization path is visibly aligned across app, dashboard, and logic.

### Numerology Y-vowel contract

- [`shared/core/logic/numerology/core.js`](./shared/core/logic/numerology/core.js)
- full serial Jest run includes numerology tests and passes

### Repo hygiene on cache artifacts

- no `__pycache__` directories found under `C:\DevLab`
- no Python cache artefacts observed inside the active repo scan

---

## Drift Matrix

| Area | Claimed state | Live state | Result |
|---|---|---|---|
| Debt manifest | 100 percent healed, clean git tree | dirty tree with modified and untracked files | Drift |
| Workspace metrics | large archive-era counts | reduced post-cutover counts | Drift |
| Email contract | validator path healed | auth action still blocks `example.com` | Drift |
| Core/UI boundary | reported healed | still mixed in `shared/core` | Drift |
| Navigation source of truth | central route config | rendered nav omits active routes | Drift |
| Jest gate | green | green | Consistent |
| Chronos source of truth | unified | unified | Consistent |
| Synergy contract | unified | unified | Consistent |
| Cold storage cutover | completed | completed | Consistent |

---

## Recommended Recovery Order

### Sprint F1 - Canonical truth reset

1. Decide what to do with [`000_EXECUTION_ROADMAP.md`](./000_EXECUTION_ROADMAP.md): commit or remove.
2. Decide whether [`shared/data/market_sentiment.json`](./shared/data/market_sentiment.json) is intended runtime data churn or should be excluded from cleanliness claims.
3. Rewrite [`000_SYSTEM_DEBT_REPORT.md`](./000_SYSTEM_DEBT_REPORT.md) header and status blocks to match the live repo and workspace.
4. Update [`C:\DevLab\000_DEVLAB_MACRO.md`](C:/DevLab/000_DEVLAB_MACRO.md) to reflect the post-cutover workspace.

### Sprint F2 - Contract and boundary repair

1. Unify email validation rules between [`shared/core/validators.js`](./shared/core/validators.js) and [`shared/core/actions.js`](./shared/core/actions.js).
2. Move DOM-bound validation helpers out of [`shared/core/validators.js`](./shared/core/validators.js) into the UI layer.
3. Remove UI import coupling from [`shared/core/api.js`](./shared/core/api.js).
4. Guard or isolate browser-only code in [`shared/core/error_logger.js`](./shared/core/error_logger.js) and [`shared/core/importmap.js`](./shared/core/importmap.js).

### Sprint F3 - UI contract cleanup

1. Bring [`shared/ui/render_nav.js`](./shared/ui/render_nav.js) in line with [`shared/core/config.js`](./shared/core/config.js).
2. Replace `insertAdjacentHTML` in [`shared/ui/widgets/sentiment_widget.js`](./shared/ui/widgets/sentiment_widget.js) with DOM-safe construction.
3. Correct stale structural docs in [`000_ARCHITECTURE.md`](./000_ARCHITECTURE.md) and [`000_plan.md`](./000_plan.md).

---

## Bottom Line

MBRN-HUB-V1 is currently:

- operational
- test-green in the active serial gate
- improved versus the original debt state

But it is not yet:

- fully canonical
- fully architecture-clean
- fully governance-consistent
- fully audit-stable for future multi-agent operation

The next highest-value move is not another feature sprint. It is a canonicalization sprint that closes the remaining gap between declared truth and live truth.
