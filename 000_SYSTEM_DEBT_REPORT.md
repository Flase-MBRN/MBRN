---
metadata:
  project: MBRN-HUB-V1
  version: 2.1.0-CANONICALIZATION
  last_audit: 2026-04-18
  system_state: CANONICALIZATION_ACTIVE
  critical_path: PHASE_1_CANONICALIZATION
---

# 000_SYSTEM_DEBT_REPORT

> **MBRN System Debt Manifest**  
> **Scope:** `C:\DevLab\MBRN-HUB-V1` as active kernel, plus workspace governance at `C:\DevLab`  
> **Intent:** Canonical live tracker for the next healing round  
> **Canonical evidence:** [`000_FORENSIC_PROJECT_AUDIT.md`](./000_FORENSIC_PROJECT_AUDIT.md)

---

## Executive Summary

The active kernel is stable enough to operate and the serial Jest gate is green, but the repository is still in an in-progress canonicalization state. The main technical debt is no longer failing tests. The main remaining debt is repo-truth hygiene, documentation alignment, and final review/commit discipline.

### Live Healing Status

| Signal | Stand |
|---|---|
| Current Healing Progress | `[▓▓▓▓▓▓▓▓▓░] 95%` |
| Open P1/P2 Blockers | **0** |
| Last System Sync | **2026-04-18** |
| Manifest Mode | `CANONICALIZATION_ACTIVE` |

### Harte Kennzahlen

| Kennzahl | Stand |
|---|---|
| Workspace-Dateien | ca. **5.590** |
| Aktiver Kern | ca. **5.562 Dateien / 28,17 MB** |
| Tracked Repo-Files | **251** |
| Verschachtelte Git-Repos in `C:\DevLab` | **1** |
| `node_modules`-Verzeichnisse in `C:\DevLab` | **11** |
| `__pycache__`-Verzeichnisse in `C:\DevLab` | **0** |
| Archivziel | `C:\DevLab_Archive\` vorhanden |
| `_COLD_STORAGE` unter `C:\DevLab` | **nicht mehr vorhanden** |
| Voller Jest-Status | **10 Suiten: 10 passed / 0 failed** |
| Voller Teststatus | **195 Tests: 194 passed / 0 failed / 1 skipped** |
| Zusätzlicher Befund | `circuit_breaker` loggt erwartbare Fehlerpfade, aber der serielle Lauf beendet sich sauber |

### Aktuelle Git-Wahrheit

```text
 M shared/core/actions.js
 M shared/core/api.js
 M shared/core/error_logger.js
 M shared/core/importmap.js
 M shared/core/validators.js
 M shared/data/market_sentiment.json
 M shared/ui/render_nav.js
 M shared/ui/widgets/sentiment_widget.js
 M tests/validators.test.js
?? 000_EXECUTION_ROADMAP.md
?? 000_FORENSIC_PROJECT_AUDIT.md
?? shared/ui/form_validation.js
```

**Kernaussage:**  
The code-side repair pass is green. The repo is not yet clean because the canonicalization batch itself is still uncommitted, and `market_sentiment.json` remains a versioned pipeline-churn file that must be classified explicitly.

---

## Leitregel

This document is the **live debt tracker**.

- It must reflect the current repo truth.
- It must not claim a clean tree when `git status --short` is dirty.
- Historical or baseline evidence belongs in [`000_FORENSIC_PROJECT_AUDIT.md`](./000_FORENSIC_PROJECT_AUDIT.md).
- Planning work for Phase 4 belongs in [`000_EXECUTION_ROADMAP.md`](./000_EXECUTION_ROADMAP.md).

### Agent Protocol

- **Atomic Fixes:** Treat each P-item as its own task.
- **Update Header:** Refresh metrics after each successful fix batch.
- **Traceability:** Every green item gets date plus executing agent.
- **Truth First:** Git state and test state outrank old manifest wording.
- **No Silent Drift:** New planning or audit docs must be either committed or explicitly tracked as in-flight artefacts.

---

## Current Open Debt

## P1 - Critical

### P1.1 - No open code blockers

| Feld | Inhalt |
|---|---|
| **Status** | `🟢 Erledigt` |
| **Befund** | Chronos source-of-truth, Synergy contract, Finance import path, and Validator null/domain contract are aligned in the active kernel. |
| **Verifikation** | `chronos`, `synergy`, `finance`, `validators` covered by the current green serial Jest run |
| **Success Signal** | `10/10 suites passed in serial run` |

**Traceability**

- `2026-04-18 - Codex - Canonicalization pass confirmed no remaining P1 code blocker in active kernel.`

---

## P2 - High Stability Risks

### P2.1 - Core/UI boundary materially reduced

| Feld | Inhalt |
|---|---|
| **Status** | `🟢 Erledigt` |
| **Befund** | DOM-bound validation helpers were moved out of `shared/core/validators.js` into [`shared/ui/form_validation.js`](./shared/ui/form_validation.js). `shared/core/api.js` no longer imports the UI error boundary directly. |
| **Verifikation** | `node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand tests/validators.test.js` |
| **Success Signal** | `validators core stays pure; DOM helpers live in UI namespace` |

**Traceability**

- `2026-04-18 - Codex - Moved validateLive/validateForm into shared/ui/form_validation.js and removed direct UI import from api.js.`

---

### P2.2 - Routing/UI drift healed

| Feld | Inhalt |
|---|---|
| **Status** | `🟢 Erledigt` |
| **Befund** | [`shared/ui/render_nav.js`](./shared/ui/render_nav.js) now renders the same active route family declared in [`shared/core/config.js`](./shared/core/config.js), including `synergy` and `tuning`. |
| **Verifikation** | `node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand tests/navigation.test.js` plus config/render code review |
| **Success Signal** | `navigation renderer and route config cover the same active apps` |

**Traceability**

- `2026-04-18 - Codex - Navigation order expanded to match canonical route definitions.`

---

### P2.3 - Sentiment widget DOM-safety healed

| Feld | Inhalt |
|---|---|
| **Status** | `🟢 Erledigt` |
| **Befund** | [`shared/ui/widgets/sentiment_widget.js`](./shared/ui/widgets/sentiment_widget.js) no longer uses `insertAdjacentHTML`; rendering is built through safe DOM creation. |
| **Verifikation** | static code review plus full serial Jest gate |
| **Success Signal** | `no insertAdjacentHTML left in sentiment widget render path` |

**Traceability**

- `2026-04-18 - Codex - Sentiment widget moved from string injection to safe DOM node construction.`

---

## P3 - Operational and Governance Debt

### P3.1 - Browser-only core files guarded but still worth watching

| Feld | Inhalt |
|---|---|
| **Status** | `🟢 Erledigt` |
| **Befund** | [`shared/core/error_logger.js`](./shared/core/error_logger.js) and [`shared/core/importmap.js`](./shared/core/importmap.js) were guarded for non-browser runtimes so they do not force Node/test crashes. |
| **Verifikation** | full serial Jest run |
| **Success Signal** | `no browser-runtime crash introduced by error_logger/importmap in test context` |

**Traceability**

- `2026-04-18 - Codex - Added browser-runtime guards and kept these modules isolated from Node failure paths.`

---

### P3.2 - Repo hygiene still operationally open

| Feld | Inhalt |
|---|---|
| **Status** | `🟡 In Arbeit` |
| **Befund** | Python cache artefacts are gone, but the working tree is intentionally dirty because the canonicalization batch is not yet committed and `market_sentiment.json` still churns as a versioned data artefact. |
| **Verifikation** | `git status --short`, workspace scan, artifact scan |
| **Success Signal** | `repo truth documented accurately; next step is review + commit strategy` |

**Betroffene Dateien/Bereiche**

- [`shared/data/market_sentiment.json`](./shared/data/market_sentiment.json)
- [`000_EXECUTION_ROADMAP.md`](./000_EXECUTION_ROADMAP.md)
- [`000_FORENSIC_PROJECT_AUDIT.md`](./000_FORENSIC_PROJECT_AUDIT.md)
- [`shared/ui/form_validation.js`](./shared/ui/form_validation.js)
- canonicalization-modified tracked files listed in the git snapshot above

**Traceability**

- `2026-04-18 - Codex - Repo hygiene truth corrected: cache cleanup is green, working tree cleanliness is still pending review/commit.`

---

## Workspace Debt

### Cold Storage / Archive Boundary

| Feld | Inhalt |
|---|---|
| **Status** | `🟢 Erledigt` |
| **Befund** | `_COLD_STORAGE` is no longer inside `C:\DevLab`; archive mass has been cut away from the active workspace and `C:\DevLab_Archive\` exists as the external archive target. |
| **Verifikation** | `Test-Path C:\DevLab_Archive` and `Test-Path C:\DevLab\_COLD_STORAGE` |
| **Success Signal** | `safe zone remains MBRN-HUB-V1 and archive lives outside active workspace` |

**Traceability**

- `2026-04-18 - Codex - Macro and workspace truth aligned to post-cutover reality.`

---

## Legitimate Artefacts

| Artefakt | Rolle | Status |
|---|---|---|
| [`000_FORENSIC_PROJECT_AUDIT.md`](./000_FORENSIC_PROJECT_AUDIT.md) | forensic baseline and evidence document | legitimate, currently untracked |
| [`000_EXECUTION_ROADMAP.md`](./000_EXECUTION_ROADMAP.md) | Phase 4 execution roadmap | legitimate, currently untracked |
| [`shared/data/market_sentiment.json`](./shared/data/market_sentiment.json) | versioned pipeline output | legitimate runtime/data artefact, classification still required |

---

## Verification Ledger

### Targeted suites

- `tests/validators.test.js` -> **PASS**
- `tests/navigation.test.js` -> **PASS**
- `tests/finance_logic.test.js` -> **PASS**
- `shared/core/logic/synergy.test.js` -> **PASS**

### Full gate

- `node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand` -> **PASS**
- `10 suites passed`
- `194 tests passed`
- `1 skipped`
- no hang observed at process exit

---

## Next Action

The next healing move is no longer a code repair sprint. It is a **review and commit hygiene pass**:

1. Review the canonicalization diff.
2. Decide whether `market_sentiment.json` remains versioned churn or should be handled differently.
3. Add the legitimate new docs/helpers to version control.
4. Commit the batch.
5. Refresh this manifest header from the post-commit git truth.

---

**Status:** CANONICALIZATION_ACTIVE  
**Next Decision:** review, classify, and commit the repair batch
