/**
 * @fileoverview Tests for Chronos Engine (M15)
 */

import { calculateChronos } from './chronos.js';
import { mockDate } from '../../../tests/setup.js';

describe('Chronos Engine (M15)', () => {
  describe('calculateChronos', () => {
    test('returns structured result per Gesetz 4', async () => {
      const result = await calculateChronos('1990-08-15');
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result.success).toBe(true);
    });

    test('calculates personal cycles', async () => {
      const result = await calculateChronos('1990-08-15');
      
      expect(result.data).toHaveProperty('personalYear');
      expect(result.data).toHaveProperty('personalMonth');
      expect(result.data).toHaveProperty('personalDay');
      
      expect(typeof result.data.personalYear).toBe('number');
      expect(typeof result.data.personalMonth).toBe('number');
      expect(typeof result.data.personalDay).toBe('number');
    });

    test('calculates universal cycles', async () => {
      const result = await calculateChronos('1990-08-15');
      
      expect(result.data).toHaveProperty('universalYear');
      expect(result.data).toHaveProperty('universalMonth');
      expect(result.data).toHaveProperty('universalDay');
    });

    test('includes cycle phase interpretation', async () => {
      const result = await calculateChronos('1990-08-15');
      
      expect(result.data).toHaveProperty('cycle_phase');
      expect(typeof result.data.cycle_phase).toBe('string');
    });

    test('validates date input', async () => {
      const result = await calculateChronos('invalid');
      
      expect(result.success).toBe(false);
      expect(result).toHaveProperty('error');
    });

    test('rejects empty date', async () => {
      const result = await calculateChronos('');
      
      expect(result.success).toBe(false);
    });

    test('accepts Date object', async () => {
      const birthDate = new Date('1990-08-15');
      const result = await calculateChronos(birthDate);
      
      expect(result.success).toBe(true);
    });

    test('uses UTC for calculations', async () => {
      const result = await calculateChronos('1990-08-15');
      
      expect(result.data).toHaveProperty('timezone');
      expect(result.data.timezone).toBe('UTC');
    });
  });
});
