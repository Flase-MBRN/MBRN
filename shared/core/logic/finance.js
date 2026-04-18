/**
 * /shared/core/logic/finance.js
 * PURE FINANCE LOGIC MODULE — PILLAR 2 (B2B API FOUNDATION)
 *
 * STRICT RULES:
 * - NO DOM ACCESS (No document, No window, No console.log in core)
 * - PURE FUNCTIONS ONLY with STRUCTURED RETURNS
 * - LAW 4 COMPLIANT: Always returns { success, data?, error? }
 * - LAW 8 COMPLIANT: All limits in MBRN_CONFIG
 * - PILLAR 2 ISOLATION: This module is API-ready, deployable as Edge Function
 */

import { MBRN_CONFIG } from '../config.js';

// LAW 8: Destructure validation constants for clean usage
const { finance: F, validation: V } = MBRN_CONFIG;

/**
 * Finance calculation limits (P0 SECURITY)
 * Hard limits to prevent calculation abuse
 */
export const FINANCE_LIMITS = {
  MAX_YEARS: 100,
  MAX_RATE_PERCENT: 100,
  MAX_PRINCIPAL: 100_000_000, // 100 Million
  MAX_MONTHLY_ADDITION: 100_000_000
};

/**
 * Validates finance input parameters
 * @param {number} principal - Startkapital
 * @param {number} rate - Zinssatz in %
 * @param {number} years - Laufzeit in Jahren
 * @param {number} monthlyAddition - Monatliche Sparrate
 * @returns {Object} - { success: boolean, error?: string }
 */
function validateFinanceInputs(principal, rate, years, monthlyAddition) {
  // P0 SECURITY: NaN checks for all inputs
  if (Number.isNaN(principal) || Number.isNaN(rate) || Number.isNaN(years) || Number.isNaN(monthlyAddition)) {
    return { success: false, error: 'Ungültige Eingabe: NaN detected.' };
  }

  // P0 SECURITY: isFinite checks for all inputs
  if (!Number.isFinite(principal) || !Number.isFinite(rate) || !Number.isFinite(years) || !Number.isFinite(monthlyAddition)) {
    return { success: false, error: 'Ungültige Eingabe: Infinity oder unendlicher Wert detected.' };
  }

  if (principal < 0 || rate < 0 || years < 0 || monthlyAddition < 0) {
    return { success: false, error: 'Werte müssen positiv sein.' };
  }

  // P0 SECURITY: Hard limits enforcement
  if (years > FINANCE_LIMITS.MAX_YEARS) {
    return { success: false, error: `Maximale Laufzeit: ${FINANCE_LIMITS.MAX_YEARS} Jahre überschritten.` };
  }
  if (rate > FINANCE_LIMITS.MAX_RATE_PERCENT) {
    return { success: false, error: `Maximaler Zinssatz: ${FINANCE_LIMITS.MAX_RATE_PERCENT}% überschritten.` };
  }
  if (principal > FINANCE_LIMITS.MAX_PRINCIPAL) {
    return { success: false, error: `Maximales Startkapital: ${FINANCE_LIMITS.MAX_PRINCIPAL.toLocaleString('de-DE')} € überschritten.` };
  }
  if (monthlyAddition > FINANCE_LIMITS.MAX_MONTHLY_ADDITION) {
    return { success: false, error: `Maximale Sparrate: ${FINANCE_LIMITS.MAX_MONTHLY_ADDITION.toLocaleString('de-DE')} € überschritten.` };
  }

  return { success: true };
}

/**
 * Zinseszins-Berechnung (Compound Interest)
 * PILLAR 2 CORE FUNCTION — Deployable as API
 *
 * @param {number} principal - Startkapital
 * @param {number} rate - Zinssatz in % (z.B. 5 für 5%)
 * @param {number} years - Laufzeit in Jahren
 * @param {number} monthlyAddition - Monatliche Sparrate (default: 0)
 * @returns {Object} - LAW 4 COMPLIANT: { success: boolean, data?: object, error?: string }
 */
export function calculateCompoundInterest(principal, rate, years, monthlyAddition = 0) {
  // Input validation
  const validation = validateFinanceInputs(principal, rate, years, monthlyAddition);
  if (!validation.success) {
    return validation;
  }

  const r = rate / 100;
  let currentBalance = principal;
  let totalInvested = principal;
  const history = [];

  for (let year = 1; year <= years; year++) {
    // Monatliche Iteration für Sparraten
    for (let month = 1; month <= 12; month++) {
      currentBalance += monthlyAddition;
      totalInvested += monthlyAddition;
      // Monatlicher Zinseszinseffekt
      currentBalance *= (1 + (r / 12));
    }

    history.push({
      year: year,
      balance: parseFloat(currentBalance.toFixed(2)),
      invested: parseFloat(totalInvested.toFixed(2))
    });
  }

  const totalInterest = currentBalance - totalInvested;

  return {
    success: true,
    data: {
      finalBalance: parseFloat(currentBalance.toFixed(2)),
      totalInvested: parseFloat(totalInvested.toFixed(2)),
      totalInterest: parseFloat(totalInterest.toFixed(2)),
      years: years,
      rate: rate,
      monthlyAddition: monthlyAddition,
      history: history,
      // API-Ready metadata
      _meta: {
        calculatedAt: new Date().toISOString(),
        version: '2.0-pillar2',
        endpoint: 'compound-interest'
      }
    }
  };
}

/**
 * Szenarien-Vergleich (Scenario Comparison)
 * Vergleicht zwei Anlage-Strategien und kalkuliert das Delta.
 *
 * @param {Object} scenarioA - { principal, rate, years, monthlyAddition }
 * @param {Object} scenarioB - { principal, rate, years, monthlyAddition }
 * @returns {Object} - LAW 4 COMPLIANT comparison result
 */
export function compareScenarios(scenarioA, scenarioB) {
  if (!scenarioA || !scenarioB) {
    return { success: false, error: 'Beide Szenarien müssen definiert sein.' };
  }

  const resultA = calculateCompoundInterest(
    scenarioA.principal || 0,
    scenarioA.rate || 0,
    scenarioA.years || 0,
    scenarioA.monthlyAddition || 0
  );

  const resultB = calculateCompoundInterest(
    scenarioB.principal || 0,
    scenarioB.rate || 0,
    scenarioB.years || 0,
    scenarioB.monthlyAddition || 0
  );

  if (!resultA.success) {
    return { success: false, error: `Szenario A Error: ${resultA.error}` };
  }
  if (!resultB.success) {
    return { success: false, error: `Szenario B Error: ${resultB.error}` };
  }

  const delta = resultB.data.finalBalance - resultA.data.finalBalance;
  const betterOption = delta > 0 ? 'B' : (delta < 0 ? 'A' : 'Equal');

  return {
    success: true,
    data: {
      scenarioA: resultA.data,
      scenarioB: resultB.data,
      delta: parseFloat(delta.toFixed(2)),
      betterOption: betterOption,
      deltaPercent: parseFloat(((delta / resultA.data.finalBalance) * 100).toFixed(2)),
      _meta: {
        calculatedAt: new Date().toISOString(),
        version: '2.0-pillar2',
        endpoint: 'scenario-compare'
      }
    }
  };
}

/**
 * Batch calculation for multiple scenarios
 * API-Ready: Process multiple calculations in one request
 *
 * @param {Array} scenarios - Array of scenario objects
 * @returns {Object} - LAW 4 COMPLIANT batch result
 */
export function calculateBatch(scenarios) {
  if (!Array.isArray(scenarios)) {
    return { success: false, error: 'Eingabe muss ein Array von Szenarien sein.' };
  }

  if (scenarios.length > 100) {
    return { success: false, error: 'Maximal 100 Szenarien pro Batch erlaubt.' };
  }

  const results = scenarios.map((scenario, index) => {
    const result = calculateCompoundInterest(
      scenario.principal || 0,
      scenario.rate || 0,
      scenario.years || 0,
      scenario.monthlyAddition || 0
    );
    return { index, ...result };
  });

  const allSuccess = results.every(r => r.success);

  return {
    success: allSuccess,
    data: {
      results: results,
      count: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      _meta: {
        calculatedAt: new Date().toISOString(),
        version: '2.0-pillar2',
        endpoint: 'compound-interest-batch'
      }
    },
    error: allSuccess ? undefined : 'Einige Berechnungen sind fehlgeschlagen.'
  };
}

// Default export for API compatibility
export default {
  FINANCE_LIMITS,
  calculateCompoundInterest,
  compareScenarios,
  calculateBatch
};
