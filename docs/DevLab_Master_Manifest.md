# DevLab Master Manifest

> **System Architect Consolidation Report**  
> **Date:** 14.04.2026  
> **Scope:** Complete C:\DevLab\ coverage analysis  
> **Status:** 100% scanned, triaged, documented

---

## Executive Summary

Das DevLab-Verzeichnis enthält **20 primäre Einträge** (Verzeichnisse und Archive), die vollständig analysiert und dokumentiert wurden. Das Verhältnis von wertvollem Code zu ballastartigem Material ist etwa **3:17** — nur 3 von 20 Einträgen enthalten tatsächlich extrahierbare Algorithmen, während der Rest entweder bereits in MBRN-HUB-V1 integriert ist (Archive), nie Code enthielt (Konzepte), oder defekt/irrelevant ist (Trash). Die wertvollsten Assets sind nicht fertige Produkte, sondern isolierte Algorithmen: ein Relevance-Scoring-System, ein Multi-Agent-Pattern für Datei-Klassifizierung, und ein numerologisches KI-Orchestrierungssystem. Alle 18 DeepDive-Analysen liegen in `docs/_incubator/` bereit.

---

## 💎 THE GOLDMINE (Extract / Revive)

Diese 3 Projekte enthalten wiederverwendbare Logik für MBRN-HUB-V1 Phase 2.0:

### 1. SmartFileBrain (01_SmartFileBrain)
**Extractable Asset:** Heuristische Datei-Klassifizierung + Multi-Agent Pattern  
**MBRN Integration:** DIM 04 (Code) — Dokumenten-Scanner Modul  

**Algorithmen:**
- **Regex-Heuristiken** für Finance/Cooking/Code-Erkennung (portierbar zu JS)
- **Multi-Agent Konsolidierung** — Pattern für 6 KI-Agenten (Yarn Validator → Qwen → Majority Vote)
- **LLM-Fallback Chain:** SDK → REST → Heuristik für robuste KI-Integration
- **JSON-Backup Pattern** mit Zeitstempel-Automatisierung

### 2. SidekickAI (04_SidekickAI)
**Extractable Asset:** Relevance Scoring Algorithm (221 Zeilen Python)  
**MBRN Integration:** DIM 07 (Mind) — Intent-Detection für Chat/Numerologie-Interpretation  

**Algorithmen:**
- **Pattern-basiertes Intent-Scoring** (0-100 Punkte) für Fragen, Imperative, Small-Talk
- **Tokenisierung + Context Overlap** — Topic-Kontinuität über Sliding Window
- **Uncertainty Detection** — Erkennung von Unsicherheit in Benutzereingaben
- **Multi-Sprache Support** (Deutsch + Englisch)

### 3. MBRN_PROMPTS System (Projects/MBRN_PROMPTS.txt)
**Extractable Asset:** Numerologisches 12-Agenten-KI-System  
**MBRN Integration:** DIM 07 (Mind) — KI-gestützte Entwicklungs-Workflows  

**Algorithmen:**
- **Numerologisches Agenten-Mapping:** Zahlen 1-9, 11, 22, 33 als Rollen
  - 1: Projekt-Pionier (Analyse), 2: Stabilitäts-Check (Bugs), 3: Kreativ-Upgrade (UI)
  - 7: AI-Sucher (KI), 22: Dokumentations-Meister, 33: Master-Lehrer (Orchestrierung)
- **Dynamische Orchestrierung:** Eingabe `1+3+6` führt Agenten sequentiell aus
- **Input `33`** → Master-Lehrer orchestriert alle anderen basierend auf Projekt-Status

---

## 🗄️ THE ARCHIVES (Assimilated)

Vollständig in MBRN-HUB-V1 integriert oder als historisches Wissen archiviert:

### Vaults (Übernommen in _ARCHIVE_VAULTS/)
- **MBRN_Legacy** — Genesis-Vault (127 Items, 2.15 MB). Frühe MBRN-Monolith-Dokumentation, philosophische Grundlage, Farb-System, Projekt-Roadmap.
- **DailyNeural5** — TikTok Content-System (2 Items, 5.7 KB). Faceless AI Content Konzept, 30-Tage-Testplan, Batch-Produktion-Workflow.
- **Second_BRN** — Leere Vault-Vorlage (5 Items). Nur Templates, kein Code.

### Produktionsreife Apps (Integriert in MBRN-HUB-V1)
- **000_MBRN** — Early PWA Hub. Service Worker Pattern, Manifest.json Struktur, Design-System v3.0 Tokens.
- **01_NumerologieRechner** — Vollständige Numerologie-Engine (36 Kennzahlen). **Kern-Logik:** Ziffernreduktion, Y-Vokal-Regel, Lo-Shu Psychomatrix, Karmische Schulden, Quantum Score. → Portiert zu `modular_logic.js` + `apps/numerology/`
- **02_DisziplinTracker** — 30-Tage Challenge App. **Kern-Logik:** Streak-Berechnung, Snapshot Export/Import, Privacy-First Analytics. → Teils in `streak_manager.js`
- **03_FinanzRechner** — Investment Calculator. **Kern-Logik:** Jahr-für-Jahr Zinseszins-Iteration, Steuer-Optimierung (nur auf Gewinn), Kaufkraft-Diskontierung. → Portiert zu `apps/finance/calculation-engine.js`

### Meta-Struktur (Erfasst in Projects_Meta)
- **Backups/** — Zeitstempel-Backups der 4 Haupt-Apps (redundant zu Live-Versionen)
- **Repositoris/** — Altes Git-Repo mit Emergency-Fix-Skripten (historische Bug-Patterns)
- **Repositoris - Kopie/** — Redundante Kopie

### Archive (Konzepte ohne Code)
- **AI/** — GGUF-Modell-Cache (8 Items, keine Logik, nur Speicher)
- **Zukunft/Marxloh-Funke** — Community-Aufbau-System (Masterplan 25KB, Python-Architektur geplant, separater Scope)
- **WinRAR-ZIP-Archiv** — Komplettes System-Backup vom 09.04.2026 (75MB)

---

## 🗑️ THE GRAVEYARD (Trash)

Definitiv wertlose oder außerhalb des Scopes liegende Projekte:

**04_SidekickAI (Bug)**, **05_BlockBros**, **05_BlockBros (fixed MVP)**, **06_MarxlohFunke**, **Second BRN** (leere Templates)

**Details:**
- *04_SidekickAI (Bug)* — Defekte Version mit gemischten Node.js/Python, keine funktionierende Logik (funktionierende Version existiert)
- *05_BlockBros (beide)* — Game-Prototypen außerhalb MBRN-Scope (separates Hobby-Projekt)
- *06_MarxlohFunke* — Nur `.windsurf/` Konfiguration, 0 Code (separater Community-Scope)
- *Second BRN* — 0% Inhalt, nur leere Templates (redundant zu MBRN-HUB-V1)

---

## 📊 Statistics

| Kategorie | Anzahl | % |
|-----------|--------|---|
| **Total gescannt** | 20 | 100% |
| **💎 Goldmine (Extract)** | 3 | 15% |
| **🗄️ Archives (Assimilated)** | 11 | 55% |
| **🗑️ Graveyard (Trash)** | 6 | 30% |

**Dokumentation:** 18 DeepDive-Dateien erstellt (~85 KB)  
**Archive:** 3 Vaults in `_ARCHIVE_VAULTS/` assimiliert  
**Abdeckung:** 100% (keine Blind Spots)

---

## 🎯 Phase 2.0 Roadmap

**Priorität 1 (DIM 04):** SmartFileBrain Heuristiken → Dokumenten-Scanner  
**Priorität 2 (DIM 07):** MBRN_PROMPTS 12-Agenten-System → KI-Workflow-Orchestrierung  
**Priorität 3 (DIM 07):** SidekickAI Relevance Engine → Intent-Detection für Chat

---

**System Architect Approval:** ⬜ PENDING  
**Next Action:** Extract-Phase für Top-3-Assets
