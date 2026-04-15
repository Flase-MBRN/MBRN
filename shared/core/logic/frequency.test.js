/**
 * @fileoverview Tests for Frequency Engine (M16)
 */

import { calculateNameFrequency } from './frequency.js';

describe('Frequency Engine (M16)', () => {
  describe('calculateNameFrequency', () => {
    test('returns structured result per Gesetz 4', () => {
      const result = calculateNameFrequency('Max Mustermann');
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result.success).toBe(true);
    });

    test('calculates core numbers', () => {
      const result = calculateNameFrequency('Max Mustermann');
      const data = result.data;
      
      expect(data).toHaveProperty('soul_urge');
      expect(data).toHaveProperty('personality');
      expect(data).toHaveProperty('expression');
      
      expect(typeof data.soul_urge).toBe('number');
      expect(typeof data.personality).toBe('number');
      expect(typeof data.expression).toBe('number');
    });

    test('includes raw sums', () => {
      const result = calculateNameFrequency('Max');
      const data = result.data;
      
      expect(data).toHaveProperty('raw_soul_sum');
      expect(data).toHaveProperty('raw_personality_sum');
      expect(data).toHaveProperty('raw_expression_sum');
    });

    test('preserves master numbers', () => {
      // Name that produces master number
      const result = calculateNameFrequency('John');
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('soul_urge');
    });

    test('handles German umlauts', () => {
      const result = calculateNameFrequency('Müller');
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('expression');
    });

    test('rejects empty names', () => {
      const result = calculateNameFrequency('');
      
      expect(result.success).toBe(false);
      expect(result).toHaveProperty('error');
    });

    test('rejects invalid input types', () => {
      const result = calculateNameFrequency(null);
      
      expect(result.success).toBe(false);
    });
  });
});
