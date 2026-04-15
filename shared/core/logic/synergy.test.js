/**
 * @fileoverview Tests for Synergy Engine (M14)
 */

import { calculateSynergy } from './synergy.js';

describe('Synergy Engine (M14)', () => {
  const operatorA = { life_path: 1, expression: 5, soul: 3 };
  const operatorB = { life_path: 2, expression: 6, soul: 4 };

  describe('calculateSynergy', () => {
    test('returns structured result per Gesetz 4', async () => {
      const result = await calculateSynergy(operatorA, operatorB);
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result.success).toBe(true);
    });

    test('calculates compatibility score 0-100', async () => {
      const result = await calculateSynergy(operatorA, operatorB);
      
      expect(result.data).toHaveProperty('synergy_score');
      expect(result.data.synergy_score).toBeGreaterThanOrEqual(0);
      expect(result.data.synergy_score).toBeLessThanOrEqual(100);
    });

    test('calculates individual resonances', async () => {
      const result = await calculateSynergy(operatorA, operatorB);
      
      expect(result.data).toHaveProperty('lifePathResonance');
      expect(result.data).toHaveProperty('soulResonance');
      expect(result.data).toHaveProperty('personalityResonance');
    });

    test('identifies resonance zones', async () => {
      const result = await calculateSynergy(operatorA, operatorB);
      
      expect(result.data).toHaveProperty('resonanceZones');
      expect(Array.isArray(result.data.resonanceZones)).toBe(true);
    });

    test('identifies friction points', async () => {
      const result = await calculateSynergy(operatorA, operatorB);
      
      expect(result.data).toHaveProperty('frictionPoints');
      expect(Array.isArray(result.data.frictionPoints)).toBe(true);
    });

    test('validates missing fields in operatorA', async () => {
      const incompleteA = { life_path: 1 }; // missing expression, soul
      const result = await calculateSynergy(incompleteA, operatorB);
      
      expect(result.success).toBe(false);
      expect(result).toHaveProperty('error');
    });

    test('validates missing fields in operatorB', async () => {
      const incompleteB = { life_path: 2 }; // missing expression, soul
      const result = await calculateSynergy(operatorA, incompleteB);
      
      expect(result.success).toBe(false);
      expect(result).toHaveProperty('error');
    });

    test('includes both operators in result', async () => {
      const result = await calculateSynergy(operatorA, operatorB);
      
      expect(result.data).toHaveProperty('operators');
      expect(result.data.operators).toHaveProperty('a');
      expect(result.data.operators).toHaveProperty('b');
    });

    test('perfect match produces high score', async () => {
      const perfectMatch = { life_path: 5, expression: 5, soul: 5 };
      const result = await calculateSynergy(perfectMatch, perfectMatch);
      
      expect(result.data.synergy_score).toBe(100);
    });
  });
});
