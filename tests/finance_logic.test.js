/**
 * /tests/finance_logic.test.js
 * FINANCE LOGIC TEST SUITE - Phase 10/10 Testing Fortress
 * 
 * Responsibility: 100% coverage of finance calculation logic
 * LAW 4 COMPLIANT: All assertions check structured returns
 * 
 * TEST CASES:
 * 1. NaN detection for all parameters
 * 2. Infinity detection for all parameters
 * 3. Zero interest rate edge case
 * 4. Negative value rejection
 * 5. Hard limit enforcement
 */

import { jest } from '@jest/globals';
import {
  calculateBatch,
  calculateCompoundInterest,
  compareScenarios,
  FINANCE_LIMITS
} from '../shared/core/logic/finance.js';

describe('Finance Logic - Compound Interest', () => {
  describe('P0 Security - NaN Detection', () => {
    test('rejects NaN principal', () => {
      const result = calculateCompoundInterest(NaN, 5, 10, 100);
      expect(result.success).toBe(false);
      expect(result.error).toContain('NaN');
    });

    test('rejects NaN rate', () => {
      const result = calculateCompoundInterest(10000, NaN, 10, 100);
      expect(result.success).toBe(false);
      expect(result.error).toContain('NaN');
    });

    test('rejects NaN years', () => {
      const result = calculateCompoundInterest(10000, 5, NaN, 100);
      expect(result.success).toBe(false);
      expect(result.error).toContain('NaN');
    });

    test('rejects NaN monthly addition', () => {
      const result = calculateCompoundInterest(10000, 5, 10, NaN);
      expect(result.success).toBe(false);
      expect(result.error).toContain('NaN');
    });
  });

  describe('P0 Security - Infinity Detection', () => {
    test('rejects Infinity principal', () => {
      const result = calculateCompoundInterest(Infinity, 5, 10, 100);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Infinity');
    });

    test('rejects -Infinity principal', () => {
      const result = calculateCompoundInterest(-Infinity, 5, 10, 100);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Infinity');
    });

    test('rejects Infinity rate', () => {
      const result = calculateCompoundInterest(10000, Infinity, 10, 100);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Infinity');
    });

    test('rejects Infinity years', () => {
      const result = calculateCompoundInterest(10000, 5, Infinity, 100);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Infinity');
    });

    test('rejects Infinity monthly addition', () => {
      const result = calculateCompoundInterest(10000, 5, 10, Infinity);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Infinity');
    });
  });

  describe('Edge Cases - Zero Interest Rate', () => {
    test('handles 0% interest rate correctly', () => {
      const result = calculateCompoundInterest(10000, 0, 10, 100);
      expect(result.success).toBe(true);
      // With 0% interest, final balance should equal total invested
      expect(result.data.totalInvested).toBe(result.data.finalBalance);
      expect(result.data.totalInterest).toBe(0);
    });

    test('handles 0% interest with no monthly addition', () => {
      const result = calculateCompoundInterest(10000, 0, 10, 0);
      expect(result.success).toBe(true);
      expect(result.data.finalBalance).toBe(10000);
      expect(result.data.totalInvested).toBe(10000);
      expect(result.data.totalInterest).toBe(0);
    });

    test('handles very small interest rate (0.01%)', () => {
      const result = calculateCompoundInterest(10000, 0.01, 1, 0);
      expect(result.success).toBe(true);
      // Interest should be minimal but positive
      expect(result.data.totalInterest).toBeGreaterThan(0);
      expect(result.data.totalInterest).toBeLessThan(10);
    });
  });

  describe('Negative Value Rejection', () => {
    test('rejects negative principal', () => {
      const result = calculateCompoundInterest(-1000, 5, 10, 100);
      expect(result.success).toBe(false);
      expect(result.error).toContain('positiv');
    });

    test('rejects negative rate', () => {
      const result = calculateCompoundInterest(10000, -5, 10, 100);
      expect(result.success).toBe(false);
      expect(result.error).toContain('positiv');
    });

    test('rejects negative years', () => {
      const result = calculateCompoundInterest(10000, 5, -5, 100);
      expect(result.success).toBe(false);
      expect(result.error).toContain('positiv');
    });

    test('rejects negative monthly addition', () => {
      const result = calculateCompoundInterest(10000, 5, 10, -100);
      expect(result.success).toBe(false);
      expect(result.error).toContain('positiv');
    });
  });

  describe('Hard Limit Enforcement', () => {
    test('rejects years exceeding MAX_YEARS', () => {
      const result = calculateCompoundInterest(10000, 5, FINANCE_LIMITS.MAX_YEARS + 1, 100);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Laufzeit');
    });

    test('rejects rate exceeding MAX_RATE_PERCENT', () => {
      const result = calculateCompoundInterest(10000, FINANCE_LIMITS.MAX_RATE_PERCENT + 1, 10, 100);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Zinssatz');
    });

    test('rejects principal exceeding MAX_PRINCIPAL', () => {
      const result = calculateCompoundInterest(FINANCE_LIMITS.MAX_PRINCIPAL + 1, 5, 10, 100);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Startkapital');
    });

    test('rejects monthly addition exceeding MAX_MONTHLY_ADDITION', () => {
      const result = calculateCompoundInterest(10000, 5, 10, FINANCE_LIMITS.MAX_MONTHLY_ADDITION + 1);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Sparrate');
    });
  });

  describe('Valid Calculations', () => {
    test('calculates compound interest correctly without monthly addition', () => {
      const result = calculateCompoundInterest(10000, 5, 1, 0);
      expect(result.success).toBe(true);
      // Monthly compounding: 10000 * (1 + 0.05/12)^12 ≈ 10511.62
      expect(result.data.finalBalance).toBeCloseTo(10511.62, 1);
    });

    test('calculates compound interest with monthly addition', () => {
      const result = calculateCompoundInterest(10000, 5, 1, 100);
      expect(result.success).toBe(true);
      // Should be more than 10500 due to monthly additions
      expect(result.data.finalBalance).toBeGreaterThan(10500);
    });

    test('generates correct history length', () => {
      const result = calculateCompoundInterest(10000, 5, 5, 0);
      expect(result.success).toBe(true);
      expect(result.data.history).toHaveLength(5);
    });

    test('history contains correct year data', () => {
      const result = calculateCompoundInterest(10000, 5, 3, 0);
      expect(result.success).toBe(true);
      result.data.history.forEach((entry, index) => {
        expect(entry.year).toBe(index + 1);
        expect(entry.balance).toBeGreaterThan(0);
        expect(entry.invested).toBe(10000);
      });
    });

    test('final balance increases with each year', () => {
      const result = calculateCompoundInterest(10000, 5, 5, 0);
      expect(result.success).toBe(true);
      let prevBalance = 0;
      result.data.history.forEach(entry => {
        expect(entry.balance).toBeGreaterThan(prevBalance);
        prevBalance = entry.balance;
      });
    });
  });
});

describe('Finance Logic - Scenario Comparison', () => {
  test('returns error when a scenario is missing entirely', () => {
    const result = compareScenarios(null, { principal: 1000, rate: 5, years: 1, monthlyAddition: 0 });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Beide Szenarien');
  });

  test('compares two valid scenarios', () => {
    const scenarioA = { principal: 10000, rate: 3, years: 5, monthlyAddition: 100 };
    const scenarioB = { principal: 10000, rate: 5, years: 5, monthlyAddition: 100 };
    
    const result = compareScenarios(scenarioA, scenarioB);
    expect(result.success).toBe(true);
    expect(result.data.betterOption).toBe('B');
    expect(result.data.delta).toBeGreaterThan(0);
  });

  test('returns error for invalid scenario A', () => {
    const scenarioA = { principal: -10000, rate: 3, years: 5, monthlyAddition: 100 };
    const scenarioB = { principal: 10000, rate: 5, years: 5, monthlyAddition: 100 };
    
    const result = compareScenarios(scenarioA, scenarioB);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Szenario A');
  });

  test('returns error for invalid scenario B', () => {
    const scenarioA = { principal: 10000, rate: 3, years: 5, monthlyAddition: 100 };
    const scenarioB = { principal: 10000, rate: 150, years: 5, monthlyAddition: 100 };
    
    const result = compareScenarios(scenarioA, scenarioB);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Szenario B');
  });

  test('handles equal scenarios', () => {
    const scenario = { principal: 10000, rate: 5, years: 5, monthlyAddition: 100 };
    
    const result = compareScenarios(scenario, scenario);
    expect(result.success).toBe(true);
    expect(result.data.delta).toBe(0);
    expect(result.data.betterOption).toBe('Equal');
  });

  test('marks scenario A as better when scenario B underperforms', () => {
    const scenarioA = { principal: 15000, rate: 8, years: 10, monthlyAddition: 200 };
    const scenarioB = { principal: 15000, rate: 2, years: 10, monthlyAddition: 0 };

    const result = compareScenarios(scenarioA, scenarioB);

    expect(result.success).toBe(true);
    expect(result.data.delta).toBeLessThan(0);
    expect(result.data.betterOption).toBe('A');
    expect(result.data.deltaPercent).toBeLessThan(0);
  });

  test('handles empty scenario properties with defaults', () => {
    const scenarioA = {};
    const scenarioB = { principal: 10000, rate: 5, years: 5, monthlyAddition: 0 };
    
    const result = compareScenarios(scenarioA, scenarioB);
    expect(result.success).toBe(true);
    // A with defaults (0 values) should have lower balance
    expect(result.data.betterOption).toBe('B');
  });

  test('validates all scenario properties correctly', () => {
    const scenarioA = { principal: 5000, rate: 4, years: 10, monthlyAddition: 200 };
    const scenarioB = { principal: 5000, rate: 6, years: 10, monthlyAddition: 200 };
    
    const result = compareScenarios(scenarioA, scenarioB);
    expect(result.success).toBe(true);
    expect(result.data.scenarioA.finalBalance).toBeGreaterThan(0);
    expect(result.data.scenarioB.finalBalance).toBeGreaterThan(0);
    // B with higher rate should win
    expect(result.data.betterOption).toBe('B');
  });
});

describe('Finance Limits Constants', () => {
  test('FINANCE_LIMITS has all required properties', () => {
    expect(FINANCE_LIMITS).toHaveProperty('MAX_YEARS');
    expect(FINANCE_LIMITS).toHaveProperty('MAX_RATE_PERCENT');
    expect(FINANCE_LIMITS).toHaveProperty('MAX_PRINCIPAL');
    expect(FINANCE_LIMITS).toHaveProperty('MAX_MONTHLY_ADDITION');
  });

  test('limits have reasonable values', () => {
    expect(FINANCE_LIMITS.MAX_YEARS).toBe(100);
    expect(FINANCE_LIMITS.MAX_RATE_PERCENT).toBe(100);
    expect(FINANCE_LIMITS.MAX_PRINCIPAL).toBe(100_000_000);
    expect(FINANCE_LIMITS.MAX_MONTHLY_ADDITION).toBe(100_000_000);
  });
});

describe('Finance Logic - Batch Calculations', () => {
  test('rejects non-array input', () => {
    expect(calculateBatch({})).toEqual({
      success: false,
      error: 'Eingabe muss ein Array von Szenarien sein.'
    });
  });

  test('rejects batches larger than 100 scenarios', () => {
    const scenarios = Array.from({ length: 101 }, () => ({
      principal: 1000,
      rate: 5,
      years: 1,
      monthlyAddition: 0
    }));

    expect(calculateBatch(scenarios)).toEqual({
      success: false,
      error: 'Maximal 100 Szenarien pro Batch erlaubt.'
    });
  });

  test('returns successful batch metadata when all scenarios pass', () => {
    const result = calculateBatch([
      { principal: 1000, rate: 5, years: 1, monthlyAddition: 0 },
      { principal: 2000, rate: 4, years: 2, monthlyAddition: 50 }
    ]);

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.data.count).toBe(2);
    expect(result.data.successful).toBe(2);
    expect(result.data.failed).toBe(0);
    expect(result.data.results[0]).toEqual(expect.objectContaining({
      index: 0,
      success: true
    }));
  });

  test('reports partial batch failure when at least one scenario is invalid', () => {
    const result = calculateBatch([
      { principal: 1000, rate: 5, years: 1, monthlyAddition: 0 },
      { principal: -1000, rate: 5, years: 1, monthlyAddition: 0 }
    ]);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Einige Berechnungen sind fehlgeschlagen.');
    expect(result.data.successful).toBe(1);
    expect(result.data.failed).toBe(1);
    expect(result.data.results[1]).toEqual(expect.objectContaining({
      index: 1,
      success: false
    }));
  });

  test('calculateCompoundInterest generates complete yearly history with monthly compounding', () => {
    const result = calculateCompoundInterest(1000, 12, 3, 100);

    expect(result.success).toBe(true);
    expect(result.data.history).toHaveLength(3);
    expect(result.data.history[0]).toEqual({
      year: 1,
      balance: expect.any(Number),
      invested: expect.any(Number)
    });
    expect(result.data.history[2].year).toBe(3);
    expect(result.data.years).toBe(3);
    expect(result.data.rate).toBe(12);
    expect(result.data.monthlyAddition).toBe(100);
  });

  test('calculateCompoundInterest with zero monthly addition still compounds annually', () => {
    const result = calculateCompoundInterest(1000, 10, 2, 0);

    expect(result.success).toBe(true);
    expect(result.data.totalInvested).toBe(1000);
    expect(result.data.history).toHaveLength(2);
    expect(result.data.monthlyAddition).toBe(0);
  });

  test('calculateCompoundInterest handles high monthly additions', () => {
    const result = calculateCompoundInterest(500, 8, 1, 500);

    expect(result.success).toBe(true);
    expect(result.data.totalInvested).toBe(6500); // 500 + 12*500
    expect(result.data.history[0].invested).toBe(6500);
  });
});
