# Incubator Deep Dive: Projects Meta-Verzeichnisse (Reststruktur)

> **Scan Date:** 14.04.2026  
> **Source:** `C:\DevLab\Projects` — Backups, Repositoris, Prompts  
> **Status:** 🗄️ **META-STRUKTUR** — Support-Dateien, kein Code  
> **Triage:** Gemischt (Archive + Extractable)

---

## 1. System Core

### Was ist das?
Die **Meta-Infrastruktur** des Projects-Verzeichnisses — Backups, Git-Repositories und KI-Prompt-Systeme. Keine eigenständigen Apps, sondern Support-Dateien.

### Übersicht
| Verzeichnis/Datei | Items | Typ | Zweck |
|-------------------|-------|-----|-------|
| `Backups/` | 101 | Backup-Archiv | Alte Projekt-Versionen |
| `Repositoris/` | 156 | Git-Repo | MBRN System (vermutlich alt) |
| `Repositoris - Kopie/` | 34 | Git-Repo-Kopie | Duplikat |
| `MBRN_PROMPTS*.txt` | 4 Dateien | Konfiguration | KI-Agenten System |

---

## 2. Detaillierte Analyse

### A) Backups/ (101 Items)

**Inhalt:**
```
Backups/
├── 000_MBRN/ (5 items)          ← Alte PWA-Version
├── 01_NumerologieRechner/ (50)   ← Numerologie-App Backup
├── 02_DisziplinTracker/ (24)     ← Disziplin-App Backup
└── 03_FinanzRechner/ (22)        ← Finanz-App Backup
```

**Analyse:**
- Alte Snapshot-Backups der bereits dokumentierten Projekte
- Zeitstempel-Backups (.bak.YYYYMMDD_HHMMSS)
- Keine neue Logik — nur historische Versionen

**Triage:** 🗑️ **TRASH** (nach Verifizierung, dass aktuelle Versionen vorhanden)

---

### B) Repositoris/ (156 Items)

**Inhalt:**
```
Repositoris/
├── .git/                           ← Git-History
├── .gitignore, .gitmodules         ← Git-Config
├── AI_CONTEXT.md (3KB)             ← KI-Kontext
├── LAUNCH_CHECKLIST.md (3KB)       ← Launch-Prozess
├── MBRN_SYSTEM.md (3.8KB)          ← System-Doku
├── MBRN_PROMPTS*.txt               ← Prompt-Backups
├── PERFORMANCE_BUDGET.md (2.5KB)   ← Performance-Ziele
├── README.md (11 Bytes!)           ← Minimal
├── SECURITY_AUDIT_REPORT.md (5.7KB)← Security-Check
├── STATUS.md (2.5KB)               ← Projekt-Status
├── roadmap.md (5KB)                ← Roadmap
├── index.html (38KB)               ← Landing Page
├── style.css (85KB)                ← Altes Designsystem
├── clean.js, deep_fix.js           ← Utility-Skripte
├── emergency_fix.js (7KB)          ← Notfall-Reparatur
├── fix_*.js (verschiedene)           ← Bugfix-Sammlung
└── docs/, assets/, icons/           ← Support-Dateien
```

**Wichtige Entdeckung:**

#### Emergency Fix Script
```javascript
// emergency_fix.js — 7KB Automatisierung
// Repariert häufige MBRN-Probleme:
// - Encoding-Fehler
// - Emoji-Probleme
// - Style-Korruptionen
// - FinanzRechner-Bugs
```

**MBRN-HUB-V1 Relevanz:** ⚠️ Historische Bugfixes — könnte Hinweise auf häufige Probleme geben

#### Fix-Skripte Sammlung
| Skript | Zweck |
|--------|-------|
| `fix_encoding.js` | Zeichensatz-Probleme |
| `fix_finanz.js` | FinanzRechner-Bugs |
| `fix_finanz_emojis.js` | Emoji-Rendering |
| `fix_numerology_text.js` | Numerologie-Texte |
| `fix_style.js` | CSS-Probleme |
| `fix_theme.js` | Theme-Korruption |

**MBRN-HUB-V1 Relevanz:** ⚠️ Dokumentation häufiger Fehler — für robustere Architektur nutzbar

---

### C) Repositoris - Kopie/ (34 Items)

**Analyse:** Identische Struktur zu `Repositoris/`, aber weniger Dateien.

**Triage:** 🗑️ **TRASH** — Redundante Kopie

---

### D) MBRN_PROMPTS.txt (22KB) — WICHTIG

#### Das Numerologische Agenten-System

| Zahl | Rolle | Fokus | Beschreibung |
|------|-------|-------|--------------|
| **1** | 🔍 Projekt-Pionier | Start, Analyse | Projektstruktur checken, Quick Wins |
| **2** | 🛠 Stabilitäts-Check | Bugs & Harmony | Fehler beheben, Logik sichern |
| **3** | 🎨 Kreativ-Upgrade | UI/UX, Ausdruck | Layout, Farben, Buttons |
| **4** | 🧬 Ordnungs-Baumeister | Struktur | Navigation, Footer, Typografie |
| **5** | ⚡ Feature-Explorer | Neue Features | Feature-Integration |
| **6** | 🚀 Performance-Hüter | Effizienz | Ladezeiten, Bundle-Optimierung |
| **7** | 🧠 AI-Sucher | KI-Integration | Smarte KI-Funktionen |
| **8** | 🧪 Test-Manager | QA | Tests, Coverage |
| **9** | 🌐 Komponenten-Humanist | Shared Code | Komponenten-Vereinheitlichung |
| **11** | 🚀 Release-Visionär | Deployment | Releases, Versionierung |
| **22** | 📚 Dokumentations-Meister | Meta | Dokumentation, Performance-Budgets |
| **33** | 🧙‍♂️ Master-Lehrer | Orchestrierung | Workflow, Meta-Prompt |

#### Dynamische Orchestrierung
```
Eingabe: 1+3+6
→ Führt nacheinander aus:
   1. Projekt-Pionier (Analyse)
   3. Kreativ-Upgrade (UI)
   6. Performance-Hüter (Optimierung)

Eingabe: 33
→ Orchestriert ALLE Prompts basierend auf Projekt-Status
```

**MBRN-HUB-V1 Relevanz:** ✅ **HOCH**

**Integration-Möglichkeiten:**
1. **DIM 07 — MIND:** KI-gestützte Entwicklungs-Workflows
2. **DIM 04 — CODE:** Strukturierte Code-Reviews
3. **DIM 11 — ERBE:** Dokumentation des Prompt-Systems

---

## 3. Extractable Logic

### A) Emergency Fix Pattern
```javascript
// Robustheit: Try-Catch + Fallback
function safeFix(selector, fixFn) {
  try {
    const elements = document.querySelectorAll(selector);
    elements.forEach(fixFn);
  } catch (e) {
    console.warn('[EmergencyFix] Failed for', selector, e);
  }
}
```

### B) Numerologisches Agenten-Mapping
```javascript
// MBRN_PROMPTS.txt als JS-Struktur
const AGENT_ROLES = {
  1: { name: 'Projekt-Pionier', focus: 'analyse', icon: '🔍' },
  2: { name: 'Stabilitäts-Check', focus: 'bugs', icon: '🛠' },
  3: { name: 'Kreativ-Upgrade', focus: 'ui', icon: '🎨' },
  4: { name: 'Ordnungs-Baumeister', focus: 'structure', icon: '🧬' },
  5: { name: 'Feature-Explorer', focus: 'features', icon: '⚡' },
  6: { name: 'Performance-Hüter', focus: 'speed', icon: '🚀' },
  7: { name: 'AI-Sucher', focus: 'ai', icon: '🧠' },
  8: { name: 'Test-Manager', focus: 'qa', icon: '🧪' },
  9: { name: 'Komponenten-Humanist', focus: 'shared', icon: '🌐' },
  11: { name: 'Release-Visionär', focus: 'deploy', icon: '🚀' },
  22: { name: 'Dokumentations-Meister', focus: 'docs', icon: '📚' },
  33: { name: 'Master-Lehrer', focus: 'orchestrate', icon: '🧙‍♂️' }
};

function getAgentsByNumbers(numbers) {
  return numbers.map(n => AGENT_ROLES[n]).filter(Boolean);
}
```

---

## 4. MBRN Mapping (Die 11 Dimensionen)

| Dimension | Relevanz | Begründung |
|-----------|----------|------------|
| **DIM 04 — CODE** | ✅ **Hoch** | Emergency-Fix-Skripte, Bug-Patterns |
| **DIM 07 — MIND** | ✅ **Hoch** | Numerologisches Agenten-System |
| **DIM 11 — ERBE** | ✅ **Hoch** | Dokumentation des Prompt-Systems |
| **DIM 10 — FLUSS** | ⚠️ Mittel | Workflow-Orchestrierung |

---

## 5. Triage-Empfehlung

### 🗄️ **ARCHIVE**
- `Repositoris/` — Historische System-Doku
- `Repositoris - Kopie/` — Kann gelöscht werden

### 🔍 **EXTRACT**
- `MBRN_PROMPTS.txt` — Numerologisches Agenten-System → JS-Portierung
- `emergency_fix.js` — Robustheits-Patterns → Error-Handling Module

### 🗑️ **TRASH**
- `Backups/` — Redundant (Projekte bereits archiviert)
- Einzelfix-Skripte (historisch, nicht mehr nötig)

---

## Fazit

| Aspekt | Bewertung |
|--------|-----------|
| **Meta-Daten** | Wertvolle historische Bug-Patterns |
| **MBRN_PROMPTS.txt** | 🌟 **Highlight:** Numerologisches KI-System |
| **Emergency Scripts** | Gute Robustheits-Beispiele |
| **MBRN-Relevanz** | ⭐⭐⭐⭐☆ (4/5) — Prompt-System ist Gold |

**Endurteil:** 
> Das `MBRN_PROMPTS.txt` ist ein **verborgener Schatz** — ein komplettes numerologisches KI-Agenten-System, das perfekt zu MBRN's Philosophie passt. Sollte in Phase 2.0 als DIM 07 Feature implementiert werden.

---

**Analyst:** System Architect  
**Status:** 🗄️ + 🔍 — Archive + Extraktion  
**Highlight:** MBRN_PROMPTS.txt numerologisches System
