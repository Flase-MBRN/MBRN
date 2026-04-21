> **WARNUNG:** VERALTET. Metriken (z.B. 18 aktive Markdown-Dateien) stimmen nicht mehr mit dem Ist-Zustand überein. Nicht für Statusbehauptungen nutzen.

---
metadata:
  project: MBRN-HUB-V1
  version: 2.2.0-TRUTH-MATRIX
  last_audit: 2026-04-19
  system_state: TRUTH_MATRIX_ACTIVE
  critical_path: PHASE_6_READINESS
---

# 000_SYSTEM_DEBT_REPORT

> **MBRN System Debt Manifest**
> **Scope:** `C:\DevLab\MBRN-HUB-V1` as active kernel
> **Intent:** Live tracker for Repo-Wahrheit, Dokumentationskonsistenz und Phase-6-Reife
> **Canonical evidence:** [`000_FORENSIC_PROJECT_AUDIT.md`](./000_FORENSIC_PROJECT_AUDIT.md) and [`000_INTEGRITY_AUDIT_REPORT.md`](./000_INTEGRITY_AUDIT_REPORT.md)

---

## Executive Summary

Der aktive Kern ist operativ und deutlich weiter als ein Teil der Dokumentation bislang behauptet hat. Die Python-/Oracle-/Dashboard-Kette läuft live, die bisherigen Integrity-Fixes sind umgesetzt, und der Arbeitsbaum ist aktuell sauber. Das größte verbleibende Risiko ist nicht mehr fehlerhafter Code, sondern eine Doku, die beim nächsten Ausbau falsche Annahmen erzeugt.

### Live Status

| Signal | Stand |
|---|---|
| Manifest Mode | `TRUTH_MATRIX_ACTIVE` |
| Git-Wahrheit | `clean working tree` |
| Aktive Markdown-Dateien | `18` |
| Archiv-Markdown-Dateien im Repo | `0` |
| Oracle-Status | `operativ mit Backtesting und Shared Mirror` |
| Market Sentiment | `operativ mit Krypto, RSS, JSON-Guard und Supabase Push` |
| Phase-6-Reife | `noch nicht erreicht` |

### Repo-Wahrheit

```text
git status --short
# keine Ausgabe
```

### Archiv-Entscheidung

Die beiden nicht-aktiven Dokumentationsbäume wurden aus dem Live-Repo entfernt und extern gesichert:

- `docs/_ARCHIVE_VAULTS/`
- `docs/ARCHIVE_ENTERPRISE/`

Externe Sicherung:

`C:\DevLab_Archive\MBRN-HUB-V1_docs_archive_20260419_205331`

---

## Leitregel

Dieses Dokument ist der **Live-Tracker für Systemschuld**.

- Repo-Wahrheit schlägt alte Manifeste.
- Aktive Dokumentation schlägt Archivmaterial.
- Laufender Code schlägt historische Beschreibungen.
- Phase 6.0 startet erst, wenn Governance, UI und Orchestrierung dieselbe Wahrheit sprechen.

---

## Truth Matrix

| Bereich | Ist-Zustand | Urteil | Nächste Maßnahme |
|---|---|---|---|
| Markdown-Bestand | `18` aktive `.md` im Repo | sauberer aktiver Wissenskern | als einzige Live-Quellen behandeln |
| Legacy-Müll | Archivmaterial liegt nicht mehr im Repo | bereinigt | nur noch extern referenzieren, nicht mehr als aktive Wissensquelle |
| `000_SYSTEM_DEBT_REPORT.md` | auf aktuellen Zustand gehoben | wahr | künftig bei jeder Governance-Änderung mitziehen |
| `000_ARCHITECTURE.md` | muss lokale Oracle-/Ollama-Realität beschreiben | in Arbeit | Tech-Stack und Struktur konsistent halten |
| `README.md` | muss operativen Vertical Slice abbilden | in Arbeit | Live-Status statt „preparation layer“ |
| `scripts/pipelines/README.md` | muss BTC/ETH, RSS, JSON-Hardening und neue Dependencies nennen | in Arbeit | Pipeline-Topologie aktuell halten |
| `docs/S3_Data/oracle_core.md` | muss Backtesting, Bias-Warnung, Shared Mirror und Marktkontext 1.1.x beschreiben | in Arbeit | Oracle-Doku an Runtime angleichen |
| Oracle-Card | wird aktuell im UI umgebaut | in Arbeit | Safe-DOM, MBRN-Wording, Glassmorphism |
| Phase-6.0-Voraussetzungen | noch offen | nicht reif | Tuning-App, Synergy-Finalisierung, Template-Tiefe, Governance-Konsistenz |

---

## Offene Schuld

## P1 - Governance und Doku

### P1.1 - Repo-Wahrheit muss dauerhaft synchron bleiben

| Feld | Inhalt |
|---|---|
| **Status** | `🟡 In Arbeit` |
| **Befund** | Die alte Governance-Lage war veraltet. Archivmaterial ist jetzt ausgelagert, die aktiven Kerndokumente werden auf den Live-Stand gehoben. |
| **Success Signal** | README, Architektur, Pipeline-README und Oracle-Doku beschreiben denselben operativen Stand. |

### P1.2 - Active docs only

| Feld | Inhalt |
|---|---|
| **Status** | `🟢 Erledigt` |
| **Befund** | Das Repo enthält nur noch die `18` aktiven Markdown-Dateien. Archivpfade sind extern gesichert. |
| **Success Signal** | Agenten und Entwickler lesen keinen Archivballast mehr aus dem aktiven Kernel. |

## P2 - UX und Frontend-Wahrheit

### P2.1 - Oracle-Card muss die Systemgesetze einhalten

| Feld | Inhalt |
|---|---|
| **Status** | `🟡 In Arbeit` |
| **Befund** | Die Oracle-Card muss ohne `innerHTML` aufgebaut werden und das bestätigte MBRN-Wording sprechen. |
| **Success Signal** | `dom.createEl()` / `dom.setText()` statt HTML-Strings, saubere Umlaute, klare Glow-Zustände. |

### P2.2 - Mobile-Navigation darf niemals blockieren

| Feld | Inhalt |
|---|---|
| **Status** | `🟡 In Arbeit` |
| **Befund** | Die mobile Navigation nutzt sowohl `.nav-toggle` als auch `.nav-hamburger` als potenzielle Trigger. Beide müssen über allen Dashboard-Layern liegen. |
| **Success Signal** | Hamburger-Button bleibt auch über Oracle-Card und Backdrop bedienbar. |

## P3 - Phase-6.0-Readiness

### P3.1 - Fehlende Produktbausteine

| Feld | Inhalt |
|---|---|
| **Status** | `🟡 Offen` |
| **Befund** | `apps/tuning/` fehlt weiterhin. `apps/synergy/` ist nicht als vollwertige eigenständige App finalisiert. Der Template-Layer besteht aktuell nur aus `templates/app_blueprint.json`. |
| **Success Signal** | Tuning-App vorhanden, Synergy-App finalisiert, Meta-Generator konkreter als Einzelfile. |

### P3.2 - Orchestrierung vor Phase 6.0

| Feld | Inhalt |
|---|---|
| **Status** | `🟡 In Arbeit` |
| **Befund** | `oracle_core.py` spiegelt bereits atomar nach `shared/data/oracle_prediction.json`. Der bestehende Sentinel-/Worker-Pfad wurde für Oracle importierbar gemacht, die operative Scheduler-Dokumentation muss aber weiter mitgezogen werden. |
| **Success Signal** | Worker-/Scheduler-Pfad dokumentiert und belastbar betreibbar. |

---

## Verification Ledger

- `git status --short` -> **clean**
- aktive Markdown-Dateien im Repo -> **18**
- Archiv-Markdown-Dateien im Repo -> **0**
- Market Sentiment Mirror -> `shared/data/market_sentiment.json`
- Oracle Shared Mirror -> `shared/data/oracle_prediction.json`
- Oracle Backtest Store -> `shared/data/oracle_backtest.json`

---

## Next Action

1. Doku-Kern auf Runtime-Wahrheit halten.
2. Oracle-Card auf Safe-DOM + MBRN-Wording umbauen.
3. Mobile-Navigation gegen Overlay-Konflikte härten.
4. Phase-6.0-Blocker separat schließen: Tuning, Synergy-Finalisierung, Template-Ausbau, Scheduler-Dokumentation.

---

**Status:** TRUTH_MATRIX_ACTIVE
**Nächste Entscheidung:** Governance-Konsistenz halten und Phase-6.0-Blocker gezielt abarbeiten
