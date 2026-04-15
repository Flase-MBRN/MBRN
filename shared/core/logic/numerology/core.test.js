/**
 * @fileoverview Tests for Numerology Core Module
 */

import {
  digitSum,
  reduceForceSingle,
  reducePreserveMaster,
  formatValue,
  normalizeName,
  charToNumber,
  nameToNumbers,
  isYVowel,
  calculateLifePathTotal,
  calculateSoulUrgeTotal,
  calculatePersonalityTotal,
  calculateExpressionTotal,
  MASTER_NUMBERS
} from './core.js';

describe('Core Math Functions', () => {
  describe('digitSum', () => {
    test('calculates sum of digits', () => {
      expect(digitSum(123)).toBe(6);
      expect(digitSum(456)).toBe(15);
      expect(digitSum(789)).toBe(24);
    });

    test('handles single digit', () => {
      expect(digitSum(5)).toBe(5);
    });

    test('handles zero', () => {
      expect(digitSum(0)).toBe(0);
    });
  });

  describe('reduceForceSingle', () => {
    test('reduces multi-digit to single', () => {
      expect(reduceForceSingle(123)).toBe(6);
      expect(reduceForceSingle(456)).toBe(6); // 4+5+6=15 -> 1+5=6
    });

    test('keeps single digit', () => {
      expect(reduceForceSingle(5)).toBe(5);
    });

    test('handles zero', () => {
      expect(reduceForceSingle(0)).toBe(0);
    });
  });

  describe('reducePreserveMaster', () => {
    test('preserves master numbers', () => {
      expect(reducePreserveMaster(11)).toBe(11);
      expect(reducePreserveMaster(22)).toBe(22);
      expect(reducePreserveMaster(33)).toBe(33);
    });

    test('reduces non-master numbers', () => {
      expect(reducePreserveMaster(123)).toBe(6);
      expect(reducePreserveMaster(10)).toBe(1);
    });

    test('preserves master number at intermediate step', () => {
      // 29 -> 2+9=11 (master, stop here)
      expect(reducePreserveMaster(29)).toBe(11);
    });
  });

  describe('formatValue', () => {
    test('formats normal numbers', () => {
      expect(formatValue(5)).toBe('5');
      expect(formatValue(8)).toBe('8');
    });

    test('formats master numbers as dual', () => {
      expect(formatValue(11)).toBe('2/11');
      expect(formatValue(22)).toBe('4/22');
      expect(formatValue(33)).toBe('6/33');
    });

    test('formats intermediate master numbers', () => {
      // 29 -> 11 (master) and 2 (single)
      expect(formatValue(29)).toBe('2/11');
    });
  });
});

describe('Name Processing', () => {
  describe('normalizeName', () => {
    test('converts to uppercase', () => {
      expect(normalizeName('max')).toBe('MAX');
    });

    test('expands German umlauts', () => {
      expect(normalizeName('Müller')).toBe('MUELLER');
      expect(normalizeName('Größe')).toBe('GROESSE');
      expect(normalizeName('Über')).toBe('UEBER');
    });

    test('expands eszett', () => {
      expect(normalizeName('Straße')).toBe('STRASSE');
    });
  });

  describe('charToNumber', () => {
    test('maps Pythagorean values', () => {
      expect(charToNumber('A')).toBe(1);
      expect(charToNumber('J')).toBe(1);
      expect(charToNumber('S')).toBe(1);
      expect(charToNumber('B')).toBe(2);
      expect(charToNumber('I')).toBe(9);
      expect(charToNumber('R')).toBe(9);
    });

    test('returns 0 for unknown chars', () => {
      expect(charToNumber('!')).toBe(0);
      expect(charToNumber('1')).toBe(0);
    });
  });

  describe('nameToNumbers', () => {
    test('converts name to number array', () => {
      expect(nameToNumbers('Max')).toEqual([4, 1, 6]);
    });

    test('removes spaces', () => {
      expect(nameToNumbers('Max Mustermann')).toEqual([4, 1, 6, 4, 3, 1, 2, 5, 9, 4, 1, 5, 5]);
    });

    test('handles empty input', () => {
      expect(nameToNumbers('')).toEqual([]);
    });
  });

  describe('isYVowel', () => {
    test('Y at start with consonant following is consonant', () => {
      const chars = ['Y', 'A', 'R', 'N'];
      expect(isYVowel(chars, 0)).toBe(false);
    });

    test('Y between consonants is vowel', () => {
      const chars = ['S', 'Y', 'N'];
      expect(isYVowel(chars, 1)).toBe(true);
    });

    test('Y at end with preceding consonant is vowel', () => {
      const chars = ['G', 'R', 'A', 'Y'];
      expect(isYVowel(chars, 3)).toBe(true);
    });
  });
});

describe('Core Calculations', () => {
  describe('calculateLifePathTotal', () => {
    test('calculates life path from date', () => {
      const result = calculateLifePathTotal('15.08.1990');
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(10);
    });
  });

  describe('calculateSoulUrgeTotal', () => {
    test('calculates vowel sum', () => {
      const result = calculateSoulUrgeTotal('Max');
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('calculatePersonalityTotal', () => {
    test('calculates consonant sum', () => {
      const result = calculatePersonalityTotal('Max');
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('calculateExpressionTotal', () => {
    test('calculates full name sum', () => {
      const result = calculateExpressionTotal('Max');
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
    });
  });
});
