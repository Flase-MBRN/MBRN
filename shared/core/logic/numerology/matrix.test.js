/**
 * @fileoverview Tests for Numerology Matrix Module
 */

import {
  calculateLoShu,
  calculateQuantumScore,
  calculateKarma,
  calculateBridges
} from './matrix.js';
import { nameToNumbers, reduceForceSingle } from './core.js';

describe('Matrix Calculations', () => {
  describe('calculateLoShu', () => {
    test('returns grid object with frequencies', () => {
      const result = calculateLoShu('15.08.1990');
      
      expect(result).toHaveProperty('grid');
      expect(result).toHaveProperty('activeLines');
      expect(result.grid).toHaveProperty('1');
      expect(result.grid).toHaveProperty('9');
    });

    test('counts digit frequencies correctly', () => {
      const result = calculateLoShu('11.11.1111');
      expect(result.grid[1]).toBeGreaterThan(0);
    });
  });

  describe('calculateQuantumScore', () => {
    test('returns score between 0 and 100', () => {
      const result = calculateQuantumScore(5, 5, 5);
      
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('interpretation');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    test('high harmony produces high score', () => {
      const result = calculateQuantumScore(5, 5, 5);
      expect(result.score).toBeGreaterThan(80);
      expect(result.interpretation).toBe('Hohe Klarheit');
    });

    test('low harmony produces lower score', () => {
      const result = calculateQuantumScore(1, 5, 9);
      expect(result.score).toBeLessThan(80);
    });
  });

  describe('calculateKarma', () => {
    test('identifies missing numbers as lessons', () => {
      // Name with only certain numbers
      const result = calculateKarma('AI', nameToNumbers);
      
      expect(result).toHaveProperty('lessons');
      expect(result).toHaveProperty('passion');
      expect(Array.isArray(result.lessons)).toBe(true);
      expect(Array.isArray(result.passion)).toBe(true);
    });

    test('identifies dominant numbers as passion', () => {
      // Name with repeated numbers
      const result = calculateKarma('AAA', nameToNumbers);
      
      expect(result.passion.length).toBeGreaterThan(0);
    });
  });

  describe('calculateBridges', () => {
    test('calculates absolute differences', () => {
      const result = calculateBridges(5, 3, 8, 2, reduceForceSingle);
      
      expect(result).toHaveProperty('lifeExpr');
      expect(result).toHaveProperty('soulPers');
      expect(typeof result.lifeExpr).toBe('number');
      expect(typeof result.soulPers).toBe('number');
    });

    test('returns non-negative values', () => {
      const result = calculateBridges(1, 9, 5, 5, reduceForceSingle);
      
      expect(result.lifeExpr).toBeGreaterThanOrEqual(0);
      expect(result.soulPers).toBeGreaterThanOrEqual(0);
    });
  });
});
