# Incubator Deep Dive: 03_FinanzRechner

> **Scan Date:** 14.04.2026  
> **Source:** `C:\DevLab\Projects\03_FinanzRechner`  
> **Status:** ✅ **PRODUCTION-READY** — Investment Calculator  
> **Triage:** 🗄️ **ARCHIVE** (Engine integriert in MBRN-HUB-V1)

---

## 1. System Core

### Was ist das?
Ein **Investment-Rechner** mit korrekten mathematischen Formeln für Zinseszins, Inflation, Steuern und Kaufkraftberechnung.

### USP
- **Mathematisch korrekt:** Jahr-für-Jahr Iteration statt Näherungsformeln
- **Steuer-Optimierung:** Steuer nur auf Gewinn, nicht auf Einzahlungen
- **Inflations-Realismus:** Kaufkraftberechnung über gesamte Laufzeit
- **Jährliche Dynamik:** Prozentuale Erhöhung der Einzahlungen

### Funktionsumfang
| Feature | Details |
|---------|---------|
| **Inputs** | Aktuelles Alter, Startalter, monatliche Rate, jährliche Dynamik, Startkapital, Rendite, Inflation, Steuersatz |
| **Outputs** | Gesamteinzahlungen, Endwert nominal, Gewinn, Steuer, Netto-Endwert, Kaufkraft (heute) |
| **Breakdown** | Jahr-für-Jahr Verlauf mit allen Zwischenwerten |

---

## 2. Tech Stack & Zustand

| Aspekt | Befund |
|--------|--------|
| **Sprache** | Vanilla JavaScript |
| **Engine** | `calculation-engine.js` (407 Lines, dokumentiert) |
| **UI** | `app.js` (48KB), `style.css` (31KB) |
| **Tests** | Vitest + Playwright |
| **PWA** | Service Worker, Manifest |
| **Fortschritt** | ✅ **Production-Ready** |
| **Zustand** | Integriert in MBRN-HUB-V1 `apps/finance/` |

---

## 3. Extractable Logic

### A) Zinseszins-Berechnung (korrekt iterativ)
```javascript
function calculateYearlyBreakdown(input) {
  let currentCapital = input.startCapital;
  let totalContributions = input.startCapital;
  const yearlyData = [];
  
  for (let year = 0; year < years; year++) {
    // Monatliche Einzahlungen mit Dynamik
    const yearlyContribution = monthlyContribution * 12 * Math.pow(1 + dynamicRate, year);
    
    // Rendite auf aktuelles Kapital
    const yearlyReturn = currentCapital * returnRate;
    
    // Neues Kapital
    currentCapital += yearlyReturn + yearlyContribution;
    totalContributions += yearlyContribution;
    
    yearlyData.push({
      year,
      contribution: yearlyContribution,
      return: yearlyReturn,
      capital: currentCapital
    });
  }
  
  return { totalContributions, endValue: currentCapital, yearlyData };
}
```

**MBRN-HUB-V1:** ✅ Übernommen in `apps/finance/calculation-engine.js`

### B) Steuerberechnung (nur auf Gewinn)
```javascript
function calculateTax(endValue, totalContributions, taxRate) {
  const profit = endValue - totalContributions;
  if (profit <= 0) return 0;
  return profit * (taxRate / 100);
}
```

**MBRN-HUB-V1:** ✅ Übernommen

### C) Kaufkraft-Berechnung
```javascript
function calculatePurchasingPower(value, inflationRate, years) {
  // Diskontierung über gesamte Laufzeit
  return value / Math.pow(1 + inflationRate / 100, years);
}
```

**MBRN-HUB-V1:** ✅ Übernommen

---

## 4. MBRN Mapping

| Dimension | Relevanz |
|-----------|----------|
| **DIM 01 — KAPITAL** | ✅ **Hoch** — Kern-Feature |
| **DIM 04 — CODE** | ⚠️ Mittel — Engine-Logik |

---

## 5. Triage-Empfehlung

### 🗄️ **ARCHIVE**

**Migration:**
- ✅ Calculation Engine → `apps/finance/`
- ✅ UI → `apps/finance/` (redesigned)
- ✅ Tests → Nicht übernommen (neue Test-Strategie)

**Status:** Vollständig integriert und verbessert.

---

**Analyst:** System Architect  
**Status:** 🗄️ ARCHIVED — Vollständig in MBRN-HUB-V1
