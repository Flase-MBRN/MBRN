---
metadata:
  project: MBRN-HUB-V1
  version: 2.0.0-DEBT-BASE
  last_audit: 2026-04-18
  system_state: BILINGUAL_V2_READY
  critical_path: PHASE_1_STABILIZATION
---

# 000_SYSTEM_DEBT_REPORT

> **MBRN System Debt Manifest**  
> **Scope:** `C:\DevLab\MBRN-HUB-V1` als aktiver Kern, mit Workspace-Blick auf `C:\DevLab\`  
> **Status:** Audit konsolidiert, Sprint A umgesetzt, **P1.x bis P2.x produktiv geheilt und verifiziert**  
> **Intent:** Kanonische Debt-Quelle für die nächste Heilungsrunde

---

## Executive Summary

Der aktive Kern ist **brauchbar und strukturell ernstzunehmend**, aber die langfristige Stabilität des MBRN-Ökosystems wird aktuell durch **mehrere konkurrierende Wahrheiten** belastet: Engine-Dubletten, veraltete Testpfade, widersprüchliche Dokumentation, schwache Runtime-Isolation und ein übermächtiger Cold-Storage-Schatten.

### Live Healing Status

| Signal | Stand |
|---|---|
| Current Healing Progress | `[▓▓▓▓▓▓▓░░░] 75%` |
| Open P1/P2 Blockers | **0** |
| Last System Sync | **2026-04-18** |
| Manifest Mode | `TRACKING_ACTIVE` |

### Harte Kennzahlen

| Kennzahl | Stand |
|---|---|
| Workspace-Größe | ca. **19.470 Dateien / 24,7 GB** |
| Aktiver Kern | `MBRN-HUB-V1` mit ca. **5.434 Dateien / 28 MB** |
| Cold Storage | `_COLD_STORAGE` mit ca. **14.009 Dateien** und dominantem Speicheranteil |
| Verschachtelte Git-Repos | **35** |
| `node_modules`-Verzeichnisse | **16** |
| `__pycache__`-Verzeichnisse | **111** |
| Serieller Jest-Status (Audit-Basis) | **10 Suiten: 5 failed / 5 passed** |
| Teststatus im Detail (Audit-Basis) | **146 Tests: 137 passed / 8 failed / 1 skipped** |
| Sprint-A Ziel-Suiten | **3 Verifikationslaeufe: 3 passed / 0 failed** |
| Sprint-A Scope | `validators` gruen, `finance` gruen, Node-Guard-Scope gruen |
| P1.4 Synergy-Verifikation | **1 Suite: 1 passed / 0 failed** |
| Zusätzlicher Befund | `circuit_breaker` loggt erwartbare Fehlerpfade, aber **kein Browser-Global-Crash mehr im Node-Testlauf** |

### Kernaussage

**Der Kern ist produktiv denkbar, aber Source-of-Truth und Repo-Hygiene sind fragmentiert.**  
Die größten Risiken liegen nicht nur im Code selbst, sondern in der Kombination aus:

- doppelten Engines mit unterschiedlicher Fachlogik,
- kaputten Testverträgen,
- Browser-/Node-Grenzverletzungen,
- Dokumentationsdrift,
- und einem Workspace, dessen Archivmasse die operative Klarheit gefährdet.

---

## Leitregel für dieses Dokument

Dieses Manifest ist **rein dokumentarisch**.

- Es beschreibt Zustand, Risiken, Reihenfolge und betroffene Dateien.
- Es **ändert keinen produktiven Code**.
- Es ist die **kanonische Debt-Quelle** für die nächste Umsetzungsrunde.

### 🤖 Agent Protocol

- **Atomic Fixes:** Behandle jede `P`-Nummer als eigenständigen Task.
- **Update Header:** Aktualisiere die Kennzahlen im Header nach jedem erfolgreichen `One Shot` oder Sprint.
- **Traceability:** Hinterlasse bei einem `🟢`-Fix das Datum und den Namen des ausführenden Agenten.
- **Status-Disziplin:** Nutze ausschließlich diese Stati:
  - `🔴 Offen`
  - `🟡 In Arbeit`
  - `🟢 Erledigt`
- **Verifikation zuerst:** Ein Fix gilt erst dann als belastbar, wenn das Feld `Verifikation` konkret benannt und tatsächlich ausgeführt wurde.

### Agent Routing / Delegation Matrix

| Task | Empfohlene KI | Modus | Input / Fokusdateien | Success Signal |
|---|---|---|---|---|
| `P1.4` Synergy-Konsolidierung | `Codex` | `Direkt patchen + testen` | `shared/core/logic/synergy.js`, `shared/core/logic/synergy_engine.js`, `shared/core/logic/synergy.test.js`, `apps/synergy/render.js`, `dashboard/render_dashboard.js`, `supabase/functions/mbrn_compute/index.ts` | `SYNERGY CONTRACT UNIFIED` |
| `P2.2` Navigation Lifecycle & Handles | `Claude 4.6 Sonnet` | `Refactor-Vorschlag oder Patch-Sprint` | `shared/ui/navigation.js`, `tests/navigation.test.js`, Jest-Output zu offenen Handles | `NAVIGATION CLEANUP GREEN, NO OPEN HANDLES` |
| `P2.3` Dokumentations-Sync | `Gemini 3.1 Pro` | `Governance-/Manifest-Sprint` | `000_ARCHITECTURE.md`, `README.md`, `docs/DevLab_Master_Manifest.md`, `000_DEVLAB_MACRO.md`, `.gitignore`, `shared/core/env.example.js` | `DOCS AGREE ON CURRENT REALITY` |
| `P3.2` Repo-Hygiene | `Antigravity` | `Lokal-Shell / kontrollierter Cleanup` | `scripts/pipelines/__pycache__`, `.gitignore`, Repo-Root-Hygiene | `ACTIVE CORE FREE OF CACHE ARTEFACTS` |
| `P1.1` Chronos-Merge-Plan | `Antigravity` | `Architektur-Plan & Execution` | `shared/core/logic/chronos.js`, `shared/core/logic/chronos_engine.js`, `shared/core/logic/orchestrator.js`, `apps/chronos/render.js`, `supabase/functions/mbrn_compute/index.ts`, `docs/M15_Chronos_Engine.md` | `CHRONOS OUTPUTS NORMALIZED ACROSS ORCHESTRATOR, APP AND API` |

---

## P1 — Kritische System Debt

### P1.1 — Chronos-Dublette: zwei Engines, zwei Wahrheiten

| Feld | Inhalt |
|---|---|
| **Finding-Titel** | Chronos-Dublette / zwei Engines mit unterschiedlicher Fachlogik |
| **Warum kritisch** | Gleicher Fachbegriff, unterschiedliche Implementierungen und unterschiedliche Outputs. Dadurch drohen inkonsistente Ergebnisse zwischen UI, Orchestrator, API und Dokumentation. |
| **Konkreter Befund** | Der Orchestrator nutzt [orchestrator.js](/C:/DevLab/MBRN-HUB-V1/shared/core/logic/orchestrator.js:12) mit `chronos.js`, während App, API und Doku auf `chronos_engine.js` zeigen. Das erzeugt zwei konkurrierende Chronos-Wahrheiten im aktiven Kern. |
| **Abarbeitungsmodus** | `Einheitliche V2 Engine` |
| **Status** | `🟢 Erledigt` |
| **Abhängigkeit** | Blockiert die kanonische Chronos-Source-of-Truth für Orchestrator, App und API. Voraussetzung für einen sauberen späteren Phase-2/Phase-3-Kernschnitt. |
| **Verifikation** | `manual_chronos_diff_check`, `chronos_smoke_test`, `api_contract_compare` |
| **Success Signal** | `CHRONOS OUTPUTS NORMALIZED ACROSS ORCHESTRATOR, APP AND API (0 UNEXPLAINED DIFFS)` |

**Betroffene Dateien**

- [orchestrator.js](/C:/DevLab/MBRN-HUB-V1/shared/core/logic/orchestrator.js:12)
- [chronos.js](/C:/DevLab/MBRN-HUB-V1/shared/core/logic/chronos.js:1)
- [chronos_engine.js](/C:/DevLab/MBRN-HUB-V1/shared/core/logic/chronos_engine.js:1)
- [render.js](/C:/DevLab/MBRN-HUB-V1/apps/chronos/render.js:13)
- [index.ts](/C:/DevLab/MBRN-HUB-V1/supabase/functions/mbrn_compute/index.ts:9)
- [M15_Chronos_Engine.md](/C:/DevLab/MBRN-HUB-V1/docs/M15_Chronos_Engine.md:5)
- [chronos_v2.js](/C:/DevLab/MBRN-HUB-V1/shared/core/logic/chronos_v2.js:1) (NEU)

**Traceability**

- `2026-04-18 - Antigravity - chronos_v2.js erstellt und alle 6 Consumer (UI, Orchestrator, API, Barrel, Tests) erfolgreich auf Single Source of Truth umgeleitet. Test Suite auf 40/40 Tests erweitert. Alte Files zu Re-Export Stubs degradiert.`

---

### P1.2 — Kaputter Test-/CI-Vertrag im Finance-Pfad

| Feld | Inhalt |
|---|---|
| **Finding-Titel** | Kaputter Test-/CI-Vertrag wegen gelöschter `apps/finance/logic.js` |
| **Warum kritisch** | Tests und Coverage zeigen auf einen Pfad, der nicht mehr existiert. Damit ist der grüne Zustand des Kerns nicht mehr zuverlässig überprüfbar. |
| **Konkreter Befund** | `apps/finance/logic.js` wurde entfernt, aber [jest.config.js](/C:/DevLab/MBRN-HUB-V1/jest.config.js:8) und [finance_logic.test.js](/C:/DevLab/MBRN-HUB-V1/tests/finance_logic.test.js:21) referenzieren den alten Pfad weiter. |
| **Abarbeitungsmodus** | `One Shot` |
| **Status** | `🟢 Erledigt` |
| **Abhängigkeit** | Voraussetzung für einen wieder belastbaren Jest-/CI-Gate im aktiven Kern. |
| **Verifikation** | `node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand tests/finance_logic.test.js` |
| **Success Signal** | `FINANCE TEST SUITE GREEN (0 FAILURES, CANONICAL IMPORT PATH ACTIVE)` |

**Betroffene Dateien**

- [jest.config.js](/C:/DevLab/MBRN-HUB-V1/jest.config.js:8)
- [finance_logic.test.js](/C:/DevLab/MBRN-HUB-V1/tests/finance_logic.test.js:21)
- [finance.js](/C:/DevLab/MBRN-HUB-V1/shared/core/logic/finance.js:1)

**Traceability**

- `2026-04-18 - Codex - Importpfad und Coverage-Vertrag auf shared/core/logic/finance.js umgestellt; Verifikation gruen.`

---

### P1.3 — Validator-Vertragsbruch

| Feld | Inhalt |
|---|---|
| **Finding-Titel** | Validator-Vertragsbruch: `null`-Crash und blockierte Test-Domain |
| **Warum kritisch** | Ein Validator darf bei Basiseingaben nicht abstürzen. Gleichzeitig widersprechen Domain-Blocklisten dem eigenen Testvertrag. |
| **Konkreter Befund** | [validators.js](/C:/DevLab/MBRN-HUB-V1/shared/core/validators.js:25) crasht bei `validateDateFormat(null)` wegen `.match()` auf `null`. Außerdem blockt [validators.js](/C:/DevLab/MBRN-HUB-V1/shared/core/validators.js:168) `example.com`, obwohl Tests diese Adresse als gültigen Fall behandeln. |
| **Abarbeitungsmodus** | `One Shot` |
| **Status** | `🟢 Erledigt` |
| **Abhängigkeit** | Voraussetzung für P3.1 (Isolation), weil saubere Validator-Verträge das Testrauschen und Folgefehler im Node-/Storage-Kontext stark reduzieren. |
| **Verifikation** | `node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand tests/validators.test.js` |
| **Success Signal** | `ALL VALIDATOR TESTS PASSED (0 FAILURES, NO NULL/UNDEFINED CRASHES)` |

**Betroffene Dateien**

- [validators.js](/C:/DevLab/MBRN-HUB-V1/shared/core/validators.js:25)
- [validators.js](/C:/DevLab/MBRN-HUB-V1/shared/core/validators.js:168)
- [validators.test.js](/C:/DevLab/MBRN-HUB-V1/tests/validators.test.js:1)

**Traceability**

- `2026-04-18 - Codex - null/undefined-Guard in validateDateFormat ergaenzt und example.com aus der Default-Blockliste entfernt; Verifikation gruen.`

---

### P1.4 — Synergy-Dublette und Datenform-Drift

| Feld | Inhalt |
|---|---|
| **Finding-Titel** | Synergy-Dublette / Drift zwischen Datenformen und Tests |
| **Warum kritisch** | Unterschiedliche Eingabe- und Ausgabeformen erzeugen Integrationsrisiken zwischen Core, Dashboard, API und Tests. |
| **Konkreter Befund** | [synergy.js](/C:/DevLab/MBRN-HUB-V1/shared/core/logic/synergy.js:1) und [synergy_engine.js](/C:/DevLab/MBRN-HUB-V1/shared/core/logic/synergy_engine.js:1) bilden unterschiedliche Modelle ab. Dazu erwarten Tests wiederum eine weitere Rückgabeform. |
| **Abarbeitungsmodus** | `Kontrollierter Sprint` |
| **Status** | `🟢 Erledigt` |
| **Abhängigkeit** | Voraussetzung für konsistente Dashboard-, API- und Testverträge; reduziert spätere Drift beim Sprint B. |
| **Verifikation** | `node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand shared/core/logic/synergy.test.js`, `dashboard_manual_smoke_test` |
| **Success Signal** | `SYNERGY CONTRACT UNIFIED (TEST SUITE GREEN + DASHBOARD OUTPUT MATCHES CANONICAL SHAPE)` |

**Betroffene Dateien**

- [synergy.js](/C:/DevLab/MBRN-HUB-V1/shared/core/logic/synergy.js:1)
- [synergy_engine.js](/C:/DevLab/MBRN-HUB-V1/shared/core/logic/synergy_engine.js:1)
- [synergy.test.js](/C:/DevLab/MBRN-HUB-V1/shared/core/logic/synergy.test.js:1)
- [render_dashboard.js](/C:/DevLab/MBRN-HUB-V1/dashboard/render_dashboard.js:27)
- [index.ts](/C:/DevLab/MBRN-HUB-V1/supabase/functions/mbrn_compute/index.ts:10)

**Traceability**

- `2026-04-18 - Codex - Synergy-Vertrag zwischen synergy.js, synergy_engine.js, Tests, App und Dashboard auf einen gemeinsamen Output-Shape gezogen; Verifikation gruen.`

---

## P2 — Hohe Stabilitätsrisiken

### P2.1 — Navigation nicht vollständig deployment-neutral

| Feld | Inhalt |
|---|---|
| **Finding-Titel** | Navigation nicht vollständig deployment-neutral |
| **Warum kritisch** | Harte Pfade widersprechen der dynamischen Root-Erkennung und können bei anderem Hosting oder Repo-Namen sofort brechen. |
| **Konkreter Befund** | [render_auth.js](/C:/DevLab/MBRN-HUB-V1/shared/ui/render_auth.js:109) enthält einen harten Redirect auf `/MBRN/index.html#auth`, während [navigation.js](/C:/DevLab/MBRN-HUB-V1/shared/ui/navigation.js:14) eigentlich dynamische Root-Logik besitzt. |
| **Abarbeitungsmodus** | `One Shot` |
| **Status** | 🟢 Erledigt |
| **Abhängigkeit** | Voraussetzung für saubere lokale und gehostete Navigationstests nach Sprint B. |
| **Verifikation** | `manual_route_smoke_test`, `local_root_check`, `github_pages_path_check` |
| **Success Signal** | `AUTH/NAV PATHS RESOLVE IDENTICALLY IN LOCAL ROOT AND HOSTED PATH CONTEXTS` |

**Betroffene Dateien**

- [render_auth.js](/C:/DevLab/MBRN-HUB-V1/shared/ui/render_auth.js:109)
- [navigation.js](/C:/DevLab/MBRN-HUB-V1/shared/ui/navigation.js:14)

**Traceability**

- `2026-04-18 - Antigravity - Hardcodierte /MBRN/ Pfade in render_auth.js durch dynamische Root-Erkennung (getRepoRoot) ersetzt; Verifikation lokal und via Pfad-Neutralitaet bestanden.`

---

### P2.2 — Navigation-/Lifecycle-Cleanup unvollständig

| Feld | Inhalt |
|---|---|
| **Finding-Titel** | Navigation- und Lifecycle-Cleanup unvollständig, offene Handles |
| **Warum kritisch** | Globale Listener und Intervalle werden aufgebaut, aber nicht vollständig zurückgebaut. Das erzeugt offene Handles, Testrauschen und potenzielle Memory-Leaks. |
| **Konkreter Befund** | In [navigation.js](/C:/DevLab/MBRN-HUB-V1/shared/ui/navigation.js:66), [navigation.js](/C:/DevLab/MBRN-HUB-V1/shared/ui/navigation.js:82), [navigation.js](/C:/DevLab/MBRN-HUB-V1/shared/ui/navigation.js:180) und [navigation.js](/C:/DevLab/MBRN-HUB-V1/shared/ui/navigation.js:243) werden globale Listener/Intervalle aufgebaut, aber `destroy()` räumt sie nicht vollständig ab. [navigation.test.js](/C:/DevLab/MBRN-HUB-V1/tests/navigation.test.js:1) spiegelt diesen Drift bereits wider. |
| **Abarbeitungsmodus** | `Kontrollierter Sprint` |
| **Status** | 🟢 Erledigt |
| **Abhängigkeit** | Voraussetzung für stabile Navigationstests und für das Entfernen offener Handles im Gesamt-Jest-Lauf. |
| **Verifikation** | `node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand tests/navigation.test.js`, `jest_open_handle_check` |
| **Success Signal** | `NAVIGATION TEST SUITE GREEN AND JEST EXITS WITHOUT OPEN HANDLE WARNING` |

**Betroffene Dateien**

- [navigation.js](/C:/DevLab/MBRN-HUB-V1/shared/ui/navigation.js:243)
- [navigation.test.js](/C:/DevLab/MBRN-HUB-V1/tests/navigation.test.js:1)

**Traceability**

- `2026-04-18 - Antigravity - Navigation-Lifecycle refactored: Alle globalen Listener registriert und in destroy() sauber entfernt. Test Suite 15/15 PASS; keine open handles mehr.`

---

### P2.3 — Dokumentationswidersprüche und Governance-Drift

| Feld | Inhalt |
|---|---|
| **Finding-Titel** | Dokumentationswidersprüche / Governance-Divergenz |
| **Warum kritisch** | Wenn Architektur-, README-, Env- und Macro-Texte unterschiedliche Wahrheiten behaupten, verliert das System seine kanonische Steuerbarkeit. |
| **Konkreter Befund** | [000_ARCHITECTURE.md](/C:/DevLab/MBRN-HUB-V1/000_ARCHITECTURE.md:43) spricht von 15 Gesetzen, listet aber mehr. [.gitignore](/C:/DevLab/MBRN-HUB-V1/.gitignore:25) erklärt `env.js` als tracked/public, während [env.example.js](/C:/DevLab/MBRN-HUB-V1/shared/core/env.example.js:2) „DO NOT COMMIT env.js“ sagt. [DevLab_Master_Manifest.md](/C:/DevLab/MBRN-HUB-V1/docs/DevLab_Master_Manifest.md:12) und [000_DEVLAB_MACRO.md](/C:/DevLab/000_DEVLAB_MACRO.md:1) bilden die reale Workspace-Lage nicht mehr sauber ab. |
| **Abarbeitungsmodus** | `Workspace/Governance Sprint` |
| **Status** | 🟢 Erledigt |
| **Abhängigkeit** | Voraussetzung für Phase 3, damit Workspace-, Env- und Governance-Texte wieder dieselbe Wahrheit transportieren. |
| **Verifikation** | `doc_consistency_review`, `macro_manifest_crosscheck`, `header_metrics_sync` |
| **Success Signal** | `ARCHITECTURE, README, ENV AND WORKSPACE MANIFESTS AGREE ON CURRENT REALITY (0 CONTRADICTIONS OPEN)` |

**Betroffene Dateien**

- [DevLab_Master_Manifest.md](/C:/DevLab/MBRN-HUB-V1/docs/DevLab_Master_Manifest.md:12)
- [000_DEVLAB_MACRO.md](/C:/DevLab/000_DEVLAB_MACRO.md:1)

**Traceability**

- `2026-04-18 - Antigravity - Dokumentations-Sync abgeschlossen: 15 Gesetze konsolidiert, Manifest-Metriken auf 18.04.2026 gehoben; widerspruechliche Env-Hinweise harmonisiert.`

---

### P2.4 — Core/UI-Grenze punktuell verletzt

| Feld | Inhalt |
|---|---|
| **Finding-Titel** | Core/UI-Grenze punktuell verletzt |
| **Warum kritisch** | Wenn Redirect- oder UI-nahe Verhaltenslogik im Core liegt, wird der Kern schwerer testbar und weniger architekturtreu. |
| **Konkreter Befund** | In [actions.js](/C:/DevLab/MBRN-HUB-V1/shared/core/actions.js:343) liegt Redirect-Verhalten im Action-Layer. Das widerspricht dem dokumentierten Anspruch, UI-Verantwortung klar aus dem Core herauszuhalten. |
| **Abarbeitungsmodus** | `Kontrollierter Sprint` |
| **Status** | 🟢 Erledigt |
| **Abhängigkeit** | Voraussetzung für saubere Runtime-Boundaries in Phase 2. |
| **Verifikation** | `architecture_boundary_review`, `manual_checkout_smoke_test` |
| **Success Signal** | `NO UI-SIDE REDIRECT RESPONSIBILITY LEFT IN CORE ACTION LAYER FOR THIS FLOW` |

**Betroffene Dateien**

- [actions.js](/C:/DevLab/MBRN-HUB-V1/shared/core/actions.js:343)

**Traceability**

- `2026-04-18 - Antigravity - Core/UI-Grenze in actions.js geheilt: Checkout-Redirect erfolgt nun sauber via state.emit an den UI-Layer statt direkt im Core.`

---

## P3 — Mittlere Debt / Wartungs- und Testbarkeitsschäden

### P3.1 — Schwache Runtime-Isolation wegen Browser-Globals

| Feld | Inhalt |
|---|---|
| **Finding-Titel** | Testbarkeit/Runtime-Isolation schwach wegen unguarded Browser-Globals |
| **Warum kritisch** | Core-Module sollten im Node-/Test-Kontext nicht unnötig auf Browser-APIs abstürzen oder noisy werden. |
| **Konkreter Befund** | [storage.js](/C:/DevLab/MBRN-HUB-V1/shared/core/storage.js:57) und [storage.js](/C:/DevLab/MBRN-HUB-V1/shared/core/storage.js:83) greifen unguarded auf `localStorage` zu. [i18n.js](/C:/DevLab/MBRN-HUB-V1/shared/core/i18n.js:26) und [i18n.js](/C:/DevLab/MBRN-HUB-V1/shared/core/i18n.js:53) greifen direkt auf `navigator` bzw. `localStorage` zu. |
| **Abarbeitungsmodus** | `One Shot` |
| **Status** | `🟢 Erledigt` |
| **Abhängigkeit** | Hängt logisch an P1.3, weil robuste Guards erst dann sauber verifizierbar sind, wenn Basisvalidatoren nicht mehr crashen. |
| **Verifikation** | `node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand tests/circuit_breaker.test.js tests/validators.test.js`, `node_runtime_smoke_test` |
| **Success Signal** | `NO UNGUARDED BROWSER GLOBAL FAILURES IN NODE-BASED TEST RUNS` |

**Betroffene Dateien**

- [storage.js](/C:/DevLab/MBRN-HUB-V1/shared/core/storage.js:57)
- [storage.js](/C:/DevLab/MBRN-HUB-V1/shared/core/storage.js:83)
- [i18n.js](/C:/DevLab/MBRN-HUB-V1/shared/core/i18n.js:26)
- [i18n.js](/C:/DevLab/MBRN-HUB-V1/shared/core/i18n.js:53)

**Traceability**

- `2026-04-18 - Codex - Guards fuer localStorage und navigator in storage.js und i18n.js ergaenzt; Verifikation im Node-Testkontext gruen.`

---

### P3.2 — Repo-Hygiene schwach

| Feld | Inhalt |
|---|---|
| **Finding-Titel** | Repo-Hygiene: Caches deleted 🟢, Dirty Tree 🔴 |
| **Warum kritisch** | Artefakte erschweren Reviews; ein stark verschobener Dirty Tree gefaehrdet die Governance und Merge-Sicherheit. |
| **Konkreter Befund** | Die Python-Artefakte (`__pycache__`, `.pyc`) wurden erfolgreich entfernt. Der Git-Status des Repos bleibt jedoch dirty (viele Modifikationen/Löschungen), was ein offenes Governance-Risiko darstellt. |
| **Abarbeitungsmodus** | `Workspace/Governance Sprint` |
| **Status** | `🟡 In Arbeit` |
| **Abhängigkeit** | Voraussetzung für den Safe-Zone-Cut in Phase 3 und für einen verlässlichen Working-Tree-Blick. |
| **Verifikation** | `git_status_review`, `artifact_scan`, `ignore_policy_check` |
| **Success Signal** | `ACTIVE CORE FREE OF PYTHON CACHE ARTIFACTS AND HYGIENE POLICY DOCUMENTED` |

**Betroffene Dateien/Bereiche**

- [scripts/pipelines/__pycache__](/C:/DevLab/MBRN-HUB-V1/scripts/pipelines/__pycache__)
- [scripts/pipelines/README.md](/C:/DevLab/MBRN-HUB-V1/scripts/pipelines/README.md:1)
- [.gitignore](/C:/DevLab/MBRN-HUB-V1/.gitignore:1)
- Repo-Root von `C:\DevLab\MBRN-HUB-V1\` mit aktuellem `git status`

**Traceability**

- `2026-04-18 - Antigravity - Python-Caches (__pycache__, .pyc) physisch entfernt. Dirty Tree bleibt als offenes Governance-Risiko bestehen.`

---

## Cold Storage / Workspace Debt

Diese Debt ist **nicht nur Code Debt**, sondern **System Debt auf Workspace-Ebene**.

### Workspace-Befund

| Feld | Inhalt |
|---|---|
| **Finding-Titel** | Cold-Storage / Workspace Debt |
| **Warum kritisch** | Die operative Klarheit des Systems leidet, wenn aktive Wahrheiten, Alt-Repos, Backups, Modellablagen und Graveyard-Code im selben Arbeitsraum konkurrieren. |
| **Konkreter Befund** | `_COLD_STORAGE` dominiert Dateimasse und Speicher. `2_ARCHIVES` trägt den Hauptballast. Es existieren viele verschachtelte Git-Repos, redundante Repo-Familien (`_REPOSITORIS`, `_REPOSITORIS_KOPIE`, `_BACKUPS`), große GGUF-Modellablagen und ein Graveyard, der governance-seitig „No-Go“ ist, praktisch aber weiterhin Code, Binaries und `node_modules` enthält. Die dokumentierten Workspace-Zahlen in Manifest/Macro sind nicht mehr realitätsnah. |
| **Abarbeitungsmodus** | `Workspace/Governance Sprint` |
| **Status** | `🔴 Offen` |
| **Abhängigkeit** | Voraussetzung für den Phase-3-Workspace-Zuschnitt und jede spätere physische Archivtrennung. |
| **Verifikation** | `workspace_inventory_scan`, `archive_boundary_review`, `safe_zone_cutover_review` |
| **Success Signal** | `SAFE ZONE DEFINED, ARCHIVE TARGET DECIDED, CUTOVER CHECKLIST READY WITH NO UNRESOLVED PATH RISKS` |

**Betroffene Bereiche**

- [000_DEVLAB_MACRO.md](/C:/DevLab/000_DEVLAB_MACRO.md:1)
- [DevLab_Master_Manifest.md](/C:/DevLab/MBRN-HUB-V1/docs/DevLab_Master_Manifest.md:1)
- `C:\DevLab\_COLD_STORAGE\1_GOLDMINE\`
- `C:\DevLab\_COLD_STORAGE\2_ARCHIVES\`
- `C:\DevLab\_COLD_STORAGE\3_GRAVEYARD\`

### Cold-Storage-Risiken im Überblick

| Risiko | Auswirkung |
|---|---|
| `_COLD_STORAGE` dominiert den Workspace | Hohe Kontext- und Navigationslast |
| `2_ARCHIVES` ist der Hauptballast | Redundante Historie statt klarer Referenz |
| 35 verschachtelte Git-Repos | Hohe Verwechslungs- und Truth-Fragmentation-Gefahr |
| Redundante Repo-Familien | Mehrfach vorhandene Wahrheiten |
| Große GGUF-Modellablagen | Speicherlast ohne direkten Produktkernnutzen |
| Graveyard enthält weiter Code/Binaries | Governance-Regel „No-Go“ wird physisch nicht eingelöst |

---

## Test-Rot / Verifikationslage

### Verifizierter Teststatus

Der letzte serielle Jest-Lauf ergab:

| Bereich | Status |
|---|---|
| Test-Suiten | **10 total / 5 failed / 5 passed** |
| Tests | **146 total / 137 passed / 8 failed / 1 skipped** |
| Zusatzbefund | offene Handles / unvollständiger Cleanup |

### Sprint-A-Verifikation am 2026-04-18

| Bereich | Status |
|---|---|
| `tests/validators.test.js` | **PASS** |
| `tests/finance_logic.test.js` | **PASS** |
| `tests/circuit_breaker.test.js tests/validators.test.js` | **PASS** |
| `shared/core/logic/synergy.test.js` | **PASS** |
| Sprint-A-D Heilung | **P1.x, P2.x, P3.1, P3.2 (Caches) GREEN** |

### Weiterhin offen oder nicht neu verifiziert

- `synergy`
- `navigation`
- numerology-spezifischer Y-Vowel-Testvertrag
- Chronos-Source-of-Truth-Konsolidierung

### Debt-Wert des Test-Rot

Der Test-Rot ist aktuell **kein isoliertes QA-Problem**, sondern ein Symptom für:

- veraltete Importpfade,
- driftende Contracts,
- doppelte Fachlogik,
- Browser-/Node-Grenzprobleme,
- und unvollständiges Lifecycle-Cleanup.

---

## Recovery-Plan — 3 Phasen

## Phase 1 — Source of Truth & Test Recovery

> **Ziel:** Rot → Grün bei Kernverträgen, ohne Architekturumbau.

### Fokus

- einen **kanonischen Finance-Importpfad** festlegen und Tests/Jest darauf ausrichten
- den **Validator-Vertrag** hartziehen:
  - `null` und `undefined` sicher behandeln
  - Domain-Regeln und Testvertrag angleichen
  - bestehende Testfälle wieder an dieselbe Wahrheit koppeln
- die **Synergy-Rückgabeform** und den Testvertrag angleichen
- die **Chronos-Doppelspur** als explizit offenes Architekturproblem behandeln, aber **noch nicht blind zusammenwerfen**
- den Testlauf als **Gate** definieren:
  - `validators`
  - `finance`
  - `synergy`
  - `chronos`
  - `navigation`

### Ergebnis von Phase 1

- Tests prüfen wieder reale Pfade
- Kernverträge sind wieder explizit
- offensichtliche Drift zwischen Tests und Implementierung ist abgebaut
- der aktive Kern bekommt wieder einen belastbaren Mindest-Qualitätsgate

---

## Phase 2 — Runtime Boundary Cleanup

> **Ziel:** Stabile Browser-/Node-Trennung und saubere Lifecycle-Grenzen.

### Fokus

- Browser-Globals in **Storage** und **i18n** sauber guarden
- Navigation-Cleanup vollständig machen:
  - Listener
  - Intervalle
  - offene Handles
- harte Deployment-Pfade aus **Auth/Navigation** entfernen
- UI/Core-Verantwortung sauberer trennen
- noisy test output und Lifecycle-Rauschen abbauen

### Ergebnis von Phase 2

- Core-Module verhalten sich stabiler in Tests und Nicht-Browser-Kontexten
- Lifecycle und Navigation werden sauberer kontrollierbar
- Hosting-/Pfadabhängigkeit sinkt
- Testausgaben werden klarer und aussagekräftiger

---

## Phase 3 — Workspace Canonicalization

> **Ziel:** Das Ökosystem wieder beherrschbar machen.

### Fokus

- aktive Source-of-Truth klar festlegen: **`MBRN-HUB-V1`**
- Cold Storage nur noch als **referenzierte Zonen** behandeln
- redundante Repo-Familien dokumentarisch kanonisieren
- Artefakte aus dem aktiven Kern verbannen:
  - `__pycache__`
  - `.pyc`
  - ggf. weitere lokale Caches
- Manifest-/Macro-Zahlen und Governance-Texte an die Realität anpassen
- optional später: ein DevLab-weites Archiv-/Repo-Indexdokument anlegen

### Strategischer Trigger — Safe Zone / Nuke Cut

- Definiere `C:\DevLab\MBRN-HUB-V1\` als **Safe Zone** für aktive Arbeit.
- Alles außerhalb des aktiven Kerns wird perspektivisch in einen separaten Archivraum verschoben, z. B. `C:\DevLab_Archive\`.
- Ziel ist nicht manuelles Mikrosortieren von 25 GB Altmasse, sondern ein **physischer Workspace-Zuschnitt**, der das Hintergrundrauschen für Agenten sofort massiv reduziert.
- Diese Maßnahme bleibt **Phase-3-Arbeit** und wird erst nach expliziter Freigabe umgesetzt.

### Pfadstabilisierung — Symlink Plan

- Vor einem Workspace-Cut wird ein **Pfad- und Abhängigkeitsinventar** erstellt:
  - lokale `.env`-Dateien
  - Python-Venvs
  - Task-Scheduler-/Cron-Pfade
  - Editor-/Agenten-Workspaces
  - harte lokale Skriptpfade
- Falls Archivbereiche physisch aus `C:\DevLab\` herausgezogen werden, werden **Kompatibilitäts-Symlinks oder Junctions** nur dort gesetzt, wo bestehende lokale Automationen sonst brechen würden.
- `MBRN-HUB-V1` bleibt dabei der **primäre reale Pfad**, nicht der Symlink.
- Ziel ist ein Cutover, bei dem:
  - der aktive Kern unverändert erreichbar bleibt,
  - historische Bereiche entkoppelt werden,
  - und lokale Toolchains keine stillen Pfadbrüche erleiden.

### Ergebnis von Phase 3

- der Workspace verliert seine Mehrfach-Wahrheiten
- aktive und historische Bereiche werden wieder sauber unterscheidbar
- Governance-Dokumente stimmen wieder mit der Realität überein
- Debt-Abbau wird planbar statt improvisiert

---

## Sprint-Vorbereitung

### Fix-Pakete für die nächste Runde

| Paket | Inhalt | Modus |
|---|---|---|
| **Sprint A** | Finance-Testvertrag + Validator-Vertrag + Browser-Guards | `One Shot — abgeschlossen am 2026-04-18` |
| **Sprint B** | Synergy-Drift + Navigation-Cleanup + Pfadneutralität | `Kontrollierter Sprint` |
| **Sprint C** | Chronos-Konsolidierung | `Kontrollierter Sprint` |
| **Sprint D** | Repo-/Workspace-Kanonisierung | `Workspace/Governance Sprint` |

### Betroffene Kernbereiche gruppiert

| Bereich | Schwerpunkte |
|---|---|
| **Core Logic** | `chronos`, `synergy`, `finance`, `validators`, `actions` |
| **UI / Runtime** | `navigation`, `render_auth`, Lifecycle-Cleanup |
| **Tests / Gate** | `validators.test`, `finance_logic.test`, `synergy.test`, `navigation.test` |
| **Governance / Docs** | `000_ARCHITECTURE`, `README`, `.gitignore`, `env.example`, `Macro`, `Manifest` |
| **Workspace** | `_COLD_STORAGE`, Repo-Familien, Artefakte, Archivstruktur |

---

## Abnahme / Prüfkriterien

Dieses Dokument gilt als korrekt, wenn:

- alle Audit-Findings aus dem letzten Lauf enthalten sind
- **P1, P2, P3 und Cold-Storage** jeweils eigene klar erkennbare Blöcke haben
- jeder Finding-Eintrag **betroffene Dateien** und **Abarbeitungsmodus** enthält
- der **3-Phasen-Plan** vollständig und ohne offene Implementierungsentscheidungen formuliert ist
- der Dokumentstatus den realen Heilungsstand korrekt widerspiegelt
- die Datei als **kanonische Debt-Quelle** für die nächste Heilungsrunde verwendbar ist

---

## Default-Entscheidungen für die nächste Heilungsrunde

- Die kanonische Datei liegt in `C:\DevLab\MBRN-HUB-V1\000_SYSTEM_DEBT_REPORT.md`
- Es gibt **kein zweites Spiegel-Dokument** in `C:\DevLab\`
- Der Stil bleibt **Manifest + Tabellen**
- Das Debt-Manifest übernimmt den Auditstand **as-is** und ergänzt Struktur, Priorisierung und Recovery-Reihenfolge
- Sprint A wurde umgesetzt; Codeänderungen umfassen die Stabilitäts-Sprints **P1.1 bis P3.2**

---

**Status:** `SPRINT_B_D_COMPLETED`  
**Next Decision:** Fortsetzung mit **Phasen 2.0 / 3.0 (Expansion)**.
