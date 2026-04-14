# Incubator Deep Dive: Projects Overview (Oberflächliche Kartierung)

> **Scan Date:** 14.04.2026  
> **Source:** `C:\DevLab\Projects`  
> **Status:** 📊 **OBERFLÄCHLICHE KARTIERUNG** — Detail-Scans folgen  
> **Scope:** 11 Projekt-Ordner + 4 Meta-Verzeichnisse

---

## 1. System Core (Übersicht)

### Was ist dieses Verzeichnis?
Das **Haupt-Projekt-Archiv** von DevLab. Hier liegen alle aktiven, pausierten und verlassenen Projekte — sortiert nach Nummerierung und Namensschema.

### Struktur-Philosophie
| Präfix | Bedeutung |
|--------|-----------|
| **000_** | Meta/System-Projekte |
| **01_** | Early Projekte (Numerologie, SmartFileBrain) |
| **02_** | Disziplin/Tracking |
| **03_** | Finanz-Tools |
| **04_** | AI-Assistants (SidekickAI) |
| **05_** | Games/Entertainment (BlockBros) |
| **06_** | Community (MarxlohFunke) |

---

## 2. Inhalts-Übersicht

### 🎯 Haupt-Projekte (11 Stück)

| Nr. | Ordner | Items | Ersteinschätzung | Status |
|-----|--------|-------|------------------|--------|
| 0 | `000_MBRN/` | 5 | Meta-Dokumentation | 🗄️ Archiv |
| 1 | `01_NumerologieRechner/` | 50 | Frühe Numerologie-App | 🔍 **Detail-Scan nötig** |
| 2 | `01_SmartFileBrain/` | 34 | Dokumenten-Management | 🔍 **Detail-Scan nötig** |
| 3 | `02_DisziplinTracker/` | 24 | Streak/Disziplin-System | 🔍 **Detail-Scan nötig** |
| 4 | `03_FinanzRechner/` | 22 | Investment-Rechner | 🔍 **Detail-Scan nötig** |
| 5 | `04_SidekickAI/` | 8 | KI-Assistent | 🔍 **Detail-Scan nötig** |
| 6 | `04_SidekickAI (Bug)/` | 24 | Buggy Version | 🗑️ Wahrscheinlich Trash |
| 7 | `05_BlockBros/` | 20 | Multiplayer-Game | 🔍 **Detail-Scan nötig** |
| 8 | `05_BlockBros (fixed MVP)/` | 20 | Reparierte Version | 🔍 **Detail-Scan nötig** |
| 9 | `06_MarxlohFunke/` | 9 | Community-Projekt | 🔍 **Detail-Scan nötig** |

### 📁 Meta-Verzeichnisse

| Ordner | Items | Zweck |
|--------|-------|-------|
| `Backups/` | 101 | Projekt-Backups |
| `Repositoris/` | 156 | Git-Repos (gesammelt) |
| `Repositoris - Kopie/` | 34 | Kopie davon |
| `MBRN_PROMPTS*.txt` | 4 Dateien | AI-Prompts (Backups) |

---

## 3. Tech Stack Vorschau (Basierend auf Ordnernamen)

| Projekt | Vermuteter Stack | MBRN-Relevanz |
|---------|------------------|---------------|
| NumerologieRechner | Vanilla JS | ✅ **Hoch** (Vorgänger von DIM 03) |
| SmartFileBrain | Unklar | ⚠️ Mittel (DIM 04 Kandidat) |
| DisziplinTracker | Vanilla JS | ✅ **Hoch** (DIM 06/10 Kandidat) |
| FinanzRechner | Vanilla JS + Playwright | ✅ **Hoch** (DIM 01 Kandidat) |
| SidekickAI | Python | ⚠️ Mittel (DIM 07 Kandidat) |
| BlockBros | Node.js/Game | ❌ Niedrig |
| MarxlohFunke | Unklar | ❓ Community-Projekt |

---

## 4. MBRN Mapping (Vorläufig)

| Dimension | Betroffene Projekte |
|-----------|---------------------|
| **DIM 01 — KAPITAL** | `03_FinanzRechner` |
| **DIM 03 — FREQUENZ** | `01_NumerologieRechner` |
| **DIM 04 — CODE** | `01_SmartFileBrain` |
| **DIM 06 — CHRONOS** | `02_DisziplinTracker` |
| **DIM 07 — MIND** | `04_SidekickAI` |
| **DIM 10 — FLUSS** | `02_DisziplinTracker` |
| **DIM 11 — ERBE** | `000_MBRN` (Meta-Doku) |

---

## 5. Triage-Vorschau (Vorläufig)

| Projekt | Vorschau-Empfehlung | Begründung |
|---------|---------------------|------------|
| `000_MBRN` | 🗄️ Archiv | Meta-Doku |
| `01_NumerologieRechner` | 🗄️ Archiv | Bereits in MBRN-HUB-V1 integriert |
| `01_SmartFileBrain` | 🔍 **Extract/Revive** | Potenzielle DIM 04 Erweiterung |
| `02_DisziplinTracker` | 🗄️ Archiv | Teile in MBRN-HUB-V1 integriert |
| `03_FinanzRechner` | 🗄️ Archiv | Bereits in MBRN-HUB-V1 integriert |
| `04_SidekickAI` | 🔍 **Extract** | Python-Logik für DIM 07 |
| `04_SidekickAI (Bug)` | 🗑️ Trash | Defekte Version |
| `05_BlockBros` | 🔍 **Prüfen** | Game-Logik niedrige Priorität |
| `05_BlockBros (fixed)` | 🔍 **Prüfen** | Gleiches |
| `06_MarxlohFunke` | 🔍 **Prüfen** | Separater Community-Scope |

---

## 6. Detail-Scan Roadmap

### Reihenfolge (Wie vom Architekten gewünscht):

1. ✅ **000_MBRN** — Meta-Dokumentation
2. **01_NumerologieRechner** — Frühe Numerologie-App
3. **01_SmartFileBrain** — Dokumenten-Management
4. **02_DisziplinTracker** — Streak-System
5. **03_FinanzRechner** — Investment-Rechner
6. **04_SidekickAI** — KI-Assistent (Python)
7. **04_SidekickAI (Bug)** — Defekte Version
8. **05_BlockBros** — Game (Original)
9. **05_BlockBros (fixed MVP)** — Game (Fixed)
10. **06_MarxlohFunke** — Community-Projekt
11. **Backups/** — Archiv-Struktur

---

## Nächster Schritt

**Bereit für:** Detail-Scan #1 → `C:\DevLab\Projects\000_MBRN`

Dieses Verzeichnis scheint Meta-Dokumentation zu enthalten (nur 5 Items). Schneller Scan erwartet.

---

**Overview Status:** ✅ KOMPLETT  
**Projekte identifiziert:** 11 Haupt + 4 Meta  
**Geschätzte MBRN-Relevanz:** 5 Hoch, 3 Mittel, 3 Niedrig

**System Architect:** Bereit für sequentielle Detail-Analyse 🎯
