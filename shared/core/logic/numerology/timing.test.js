/**
 * @fileoverview Tests for Numerology Timing Module
 */

import {
  calculateCycles,
  calculatePinnacles,
  calculateChallenges
} from './timing.js';

describe('Timing Calculations', () => {
  describe('calculateCycles', () => {
    test('returns three cycle numbers', () => {
      const result = calculateCycles('15.08.1990');
      
      expect(result).toHaveProperty('c1');
      expect(result).toHaveProperty('c2');
      expect(result).toHaveProperty('c3');
      expect(typeof result.c1).toBe('number');
      expect(typeof result.c2).toBe('number');
      expect(typeof result.c3).toBe('number');
    });

    test('produces valid numerology numbers', () => {
      const result = calculateCycles('15.08.1990');
      
      // All should be 1-9 or master numbers (11, 22)
      expect(result.c1).toBeGreaterThan(0);
      expect(result.c2).toBeGreaterThan(0);
      expect(result.c3).toBeGreaterThan(0);
    });
  });

  describe('calculatePinnacles', () => {
    test('returns four pinnacle numbers', () => {
      const result = calculatePinnacles('15.08.1990');
      
      expect(result).toHaveProperty('p1');
      expect(result).toHaveProperty('p2');
      expect(result).toHaveProperty('p3');
      expect(result).toHaveProperty('p4');
    });

    test('produces valid numerology numbers', () => {
      const result = calculatePinnacles('15.08.1990');
      
      expect(result.p1).toBeGreaterThan(0);
      expect(result.p2).toBeGreaterThan(0);
      expect(result.p3).toBeGreaterThan(0);
      expect(result.p4).toBeGreaterThan(0);
    });
  });

  describe('calculateChallenges', () => {
    test('returns four challenge numbers', () => {
      const result = calculateChallenges('15.08.1990');
      
      expect(result).toHaveProperty('ch1');
      expect(result).toHaveProperty('ch2');
      expect(result).toHaveProperty('ch3');
      expect(result).toHaveProperty('ch4');
    });

    test('returns non-negative values', () => {
      const result = calculateChallenges('15.08.1990');
      
      expect(result.ch1).toBeGreaterThanOrEqual(0);
      expect(result.ch2).toBeGreaterThanOrEqual(0);
      expect(result.ch3).toBeGreaterThanOrEqual(0);
      expect(result.ch4).toBeGreaterThanOrEqual(0);
    });

    test('ch3 is absolute difference of ch1 and ch2', () => {
      const result = calculateChallenges('15.08.1990');
      
      // ch3 = |ch1 - ch2|
      expect(result.ch3).toBe(Math.abs(result.ch1 - result.ch2));
    });
  });
});
