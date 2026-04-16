/**
 * /apps/finance/logic.js
 * PURE MATH MODULE - THE KING (Core Logic)
 * 
 * STRICT RULE: NO DOM ACCESS (No document, No window).
 * PURE FUNCTIONS ONLY, STRUCTURED RETURNS.
 */

/**
 * Zinseszins-Berechnung (Phase 7.1)
 * @param {number} principal - Startkapital
 * @param {number} rate - Zinssatz in % (z.B. 5 für 5%)
 * @param {number} years - Laufzeit in Jahren
 * @param {number} monthlyAddition - Monatliche Sparrate
 * @returns {object} { success: boolean, data: object, error: string }
 */
// P0 SECURITY: Hard limits for finance calculations
export const FINANCE_LIMITS = {
  MAX_YEARS: 100,
  MAX_RATE_PERCENT: 100,
  MAX_PRINCIPAL: 100_000_000, // 100 Million
  MAX_MONTHLY_ADDITION: 100_000_000
};

export function calculateCompoundInterest(principal, rate, years, monthlyAddition = 0) {
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
      history: history
    }
  };
}

/**
 * Szenarien-Vergleich (Phase 7.2)
 * Vergleicht zwei Anlage-Strategien und kalkuliert das Delta.
 * @param {object} scenarioA
 * @param {object} scenarioB
 */
export function compareScenarios(scenarioA, scenarioB) {
  const resultA = calculateCompoundInterest(
    scenarioA.principal || 0, scenarioA.rate || 0, scenarioA.years || 0, scenarioA.monthlyAddition || 0
  );
  
  const resultB = calculateCompoundInterest(
    scenarioB.principal || 0, scenarioB.rate || 0, scenarioB.years || 0, scenarioB.monthlyAddition || 0
  );

  if (!resultA.success) return { success: false, error: `Szenario A Error: ${resultA.error}` };
  if (!resultB.success) return { success: false, error: `Szenario B Error: ${resultB.error}` };

  const delta = resultB.data.finalBalance - resultA.data.finalBalance;

  return {
    success: true,
    data: {
      scenarioA: resultA.data,
      scenarioB: resultB.data,
      delta: parseFloat(delta.toFixed(2)),
      betterOption: delta > 0 ? 'B' : (delta < 0 ? 'A' : 'Equal')
    }
  };
}
