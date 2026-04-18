/**
 * @fileoverview Tests for Chronos Engine v2 (M15)
 * Unified test suite covering both biographical time (7-year cycles)
 * and numerological time (PY/PM/PD).
 *
 * @since 2026-04-18 — P1.1 Chronos-Merge
 */

import { calculateChronos } from './chronos_v2.js';

describe('Chronos Engine v2 (M15)', () => {
  // ═══════════════════════════════════════════════════════════════════════
  // Structured Return (Gesetz 4)
  // ═══════════════════════════════════════════════════════════════════════

  describe('Gesetz 4 — Structured Returns', () => {
    test('returns { success, data, error } on valid input', () => {
      const result = calculateChronos('1990-08-15');

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
    });

    test('returns { success: false, data: null, error } on invalid input', () => {
      const result = calculateChronos('invalid');

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(typeof result.error).toBe('string');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // Numerological Time (ex chronos.js)
  // ═══════════════════════════════════════════════════════════════════════

  describe('Numerological Time — Personal Cycles', () => {
    test('calculates personalYear, personalMonth, personalDay', () => {
      const result = calculateChronos('1990-08-15');

      expect(result.data).toHaveProperty('personalYear');
      expect(result.data).toHaveProperty('personalMonth');
      expect(result.data).toHaveProperty('personalDay');

      expect(typeof result.data.personalYear).toBe('number');
      expect(typeof result.data.personalMonth).toBe('number');
      expect(typeof result.data.personalDay).toBe('number');
    });

    test('includes cycle phase interpretation', () => {
      const result = calculateChronos('1990-08-15');

      expect(result.data).toHaveProperty('cycle_phase');
      expect(typeof result.data.cycle_phase).toBe('string');
    });

    test('calculates universal cycles', () => {
      const result = calculateChronos('1990-08-15');

      expect(result.data).toHaveProperty('universalYear');
      expect(result.data).toHaveProperty('universalMonth');
      expect(result.data).toHaveProperty('universalDay');

      expect(typeof result.data.universalYear).toBe('number');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // Biographical Time (ex chronos_engine.js)
  // ═══════════════════════════════════════════════════════════════════════

  describe('Biographical Time — 7-Year Cycles', () => {
    test('calculates livedDays as positive integer', () => {
      const result = calculateChronos('1990-08-15');

      expect(result.data).toHaveProperty('livedDays');
      expect(typeof result.data.livedDays).toBe('number');
      expect(result.data.livedDays).toBeGreaterThan(0);
    });

    test('calculates currentPhase (7-year cycle)', () => {
      const result = calculateChronos('1990-08-15');

      expect(result.data).toHaveProperty('currentPhase');
      expect(typeof result.data.currentPhase).toBe('number');
      expect(result.data.currentPhase).toBeGreaterThanOrEqual(1);
    });

    test('provides nextCycleStartUTC as ISO string', () => {
      const result = calculateChronos('1990-08-15');

      expect(result.data).toHaveProperty('nextCycleStartUTC');
      expect(result.data.nextCycleStartUTC).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
    });

    test('provides birthdateUTC as ISO string', () => {
      const result = calculateChronos('1990-08-15');

      expect(result.data).toHaveProperty('birthdateUTC');
      expect(result.data.birthdateUTC).toContain('1990-08-15');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // UTC Compliance (Gesetz 15)
  // ═══════════════════════════════════════════════════════════════════════

  describe('Gesetz 15 — UTC Compliance', () => {
    test('timezone field is UTC', () => {
      const result = calculateChronos('1990-08-15');

      expect(result.data).toHaveProperty('timezone');
      expect(result.data.timezone).toBe('UTC');
    });

    test('all timestamps are UTC ISO strings', () => {
      const result = calculateChronos('1990-08-15');

      expect(result.data.birthTimestamp).toMatch(/Z$/);
      expect(result.data.currentTimestamp).toMatch(/Z$/);
      expect(result.data.nextCycleStartUTC).toMatch(/Z$/);
      expect(result.data.birthdateUTC).toMatch(/Z$/);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // Input Formats
  // ═══════════════════════════════════════════════════════════════════════

  describe('Multi-Format Input Parsing', () => {
    test('accepts ISO format YYYY-MM-DD', () => {
      const result = calculateChronos('1990-08-15');
      expect(result.success).toBe(true);
    });

    test('accepts German format DD.MM.YYYY', () => {
      const result = calculateChronos('15.08.1990');
      expect(result.success).toBe(true);
      expect(result.data.birthdateUTC).toContain('1990-08-15');
    });

    test('accepts Date object', () => {
      const birthDate = new Date('1990-08-15');
      const result = calculateChronos(birthDate);
      expect(result.success).toBe(true);
    });

    test('accepts flexible slash and dot ISO-like formats', () => {
      const slashResult = calculateChronos('1988/02/29');
      const dotResult = calculateChronos('1988.02.29');

      expect(slashResult.success).toBe(true);
      expect(dotResult.success).toBe(true);
      expect(slashResult.data.birth_date).toBe('1988-02-29');
      expect(dotResult.data.birth_date).toBe('1988-02-29');
    });

    test('produces same output for equivalent ISO and DD.MM.YYYY input', () => {
      const isoResult = calculateChronos('1990-08-15');
      const dotResult = calculateChronos('15.08.1990');

      expect(isoResult.data.personalYear).toBe(dotResult.data.personalYear);
      expect(isoResult.data.livedDays).toBe(dotResult.data.livedDays);
      expect(isoResult.data.currentPhase).toBe(dotResult.data.currentPhase);
    });

    test('normalizes valid Date instances to UTC midnight', () => {
      const result = calculateChronos(new Date(Date.UTC(2000, 1, 29, 18, 45, 12)));

      expect(result.success).toBe(true);
      expect(result.data.birthdateUTC).toBe('2000-02-29T00:00:00.000Z');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // Error Handling
  // ═══════════════════════════════════════════════════════════════════════

  describe('Error Handling', () => {
    test('rejects empty string', () => {
      const result = calculateChronos('');
      expect(result.success).toBe(false);
    });

    test('rejects null', () => {
      const result = calculateChronos(null);
      expect(result.success).toBe(false);
    });

    test('rejects undefined', () => {
      const result = calculateChronos(undefined);
      expect(result.success).toBe(false);
    });

    test('rejects invalid date string', () => {
      const result = calculateChronos('invalid');
      expect(result.success).toBe(false);
      expect(result).toHaveProperty('error');
    });

    test('rejects invalid Date objects', () => {
      const result = calculateChronos(new Date('invalid'));

      expect(result.success).toBe(false);
      expect(result.error).toContain('Geburtsdatum');
    });

    test('rejects impossible date (Feb 30)', () => {
      const result = calculateChronos('30.02.1990');
      expect(result.success).toBe(false);
    });

    test('rejects impossible ISO dates without autocorrection', () => {
      const result = calculateChronos('1990-02-30');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Geburtsdatum');
    });

    test('rejects future date', () => {
      const result = calculateChronos('2099-01-01');
      expect(result.success).toBe(false);
      expect(result.error).toContain('future');
    });
  });

  describe('Cycle Phase Edge Cases', () => {
    test('returns master-number cycle phase labels when personal year resolves to 11', () => {
      const result = calculateChronos('1970-01-09');

      expect(result.success).toBe(true);
      expect(result.data.personalYear).toBe(11);
      expect(result.data.cycle_phase).toBe('Intuition & Meister-Initiation');
    });

    test('clamps leap-day cycle starts to valid UTC dates', () => {
      const result = calculateChronos('1988-02-29');

      expect(result.success).toBe(true);
      expect(result.data.nextCycleStartUTC).toBe('2030-02-28T00:00:00.000Z');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // Future Extensions (Placeholders)
  // ═══════════════════════════════════════════════════════════════════════

  describe('Future Extensions — Placeholders', () => {
    test('includes pinnacles placeholder (all null)', () => {
      const result = calculateChronos('1990-08-15');

      expect(result.data).toHaveProperty('pinnacles');
      expect(result.data.pinnacles).toEqual({
        p1: null, p2: null, p3: null, p4: null
      });
    });

    test('includes challenges placeholder (all null)', () => {
      const result = calculateChronos('1990-08-15');

      expect(result.data).toHaveProperty('challenges');
      expect(result.data.challenges).toEqual({
        c1: null, c2: null, c3: null, c4: null
      });
    });
  });
});
