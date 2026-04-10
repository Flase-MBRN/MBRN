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
export function calculateCompoundInterest(principal, rate, years, monthlyAddition = 0) {
  if (principal < 0 || rate < 0 || years < 0 || monthlyAddition < 0) {
    return { success: false, error: 'Werte müssen positiv sein.' };
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
