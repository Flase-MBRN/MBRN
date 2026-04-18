/**
 * /tests/validators.test.js
 * VALIDATOR TEST SUITE - Phase 10/10 Testing Fortress
 * 
 * Responsibility: 100% coverage of input validation logic
 * LAW 4 COMPLIANT: All assertions check structured returns
 */

import {
  validateDateFormat,
  validateName,
  validateEmail,
  validateNumber
} from '../shared/core/validators.js';

describe('Date Validation', () => {
  test('accepts valid date DD.MM.YYYY', () => {
    const result = validateDateFormat('15.08.1990');
    expect(result.success).toBe(true);
    expect(result.data).toBeInstanceOf(Date);
  });

  test('rejects invalid format', () => {
    const result = validateDateFormat('1990-08-15');
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  test('rejects February 30', () => {
    const result = validateDateFormat('30.02.2024');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Februar');
  });

  test('rejects February 29 in non-leap year', () => {
    const result = validateDateFormat('29.02.2023');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Schaltjahr');
  });

  test('accepts February 29 in leap year', () => {
    const result = validateDateFormat('29.02.2024');
    expect(result.success).toBe(true);
  });

  test('rejects month 13', () => {
    const result = validateDateFormat('15.13.2024');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Monat');
  });

  test('rejects day 0', () => {
    const result = validateDateFormat('00.08.2024');
    expect(result.success).toBe(false);
  });

  test('rejects empty string', () => {
    const result = validateDateFormat('');
    expect(result.success).toBe(false);
  });

  test('rejects null/undefined', () => {
    expect(validateDateFormat(null).success).toBe(false);
    expect(validateDateFormat(undefined).success).toBe(false);
  });

  test('rejects April 31 (30-day month)', () => {
    const result = validateDateFormat('31.04.2024');
    expect(result.success).toBe(false);
    expect(result.error).toContain('existiert nicht');
  });
});

describe('Name Validation', () => {
  test('accepts valid name', () => {
    const result = validateName('Max Mustermann');
    expect(result.success).toBe(true);
    expect(result.data).toBe('Max Mustermann');
  });

  test('rejects too short name', () => {
    const result = validateName('M');
    expect(result.success).toBe(false);
    expect(result.error).toContain('mindestens');
  });

  test('rejects empty string', () => {
    const result = validateName('');
    expect(result.success).toBe(false);
  });

  test('rejects whitespace only', () => {
    const result = validateName('   ');
    expect(result.success).toBe(false);
  });

  test('rejects numbers only', () => {
    const result = validateName('12345');
    expect(result.success).toBe(false);
  });

  test('accepts name with special chars', () => {
    const result = validateName('François Müller-Straße');
    expect(result.success).toBe(true);
  });

  test('trims whitespace', () => {
    const result = validateName('  Max Mustermann  ');
    expect(result.success).toBe(true);
    expect(result.data).toBe('Max Mustermann');
  });

  test('respects max length', () => {
    const longName = 'A'.repeat(101);
    const result = validateName(longName, { maxLength: 100 });
    expect(result.success).toBe(false);
    expect(result.error).toContain('maximal');
  });

  test('respects custom min length', () => {
    const result = validateName('Max', { minLength: 5 });
    expect(result.success).toBe(false);
    expect(result.error).toContain('mindestens 5');
  });
});

describe('Email Validation', () => {
  test('accepts valid email', () => {
    const result = validateEmail('user@example.com');
    expect(result.success).toBe(true);
    expect(result.data).toBe('user@example.com');
  });

  test('normalizes to lowercase', () => {
    const result = validateEmail('USER@EXAMPLE.COM');
    expect(result.data).toBe('user@example.com');
  });

  test('rejects invalid format', () => {
    expect(validateEmail('notanemail').success).toBe(false);
    expect(validateEmail('@example.com').success).toBe(false);
    expect(validateEmail('user@').success).toBe(false);
    expect(validateEmail('user@.com').success).toBe(false);
  });

  test('rejects blocked domains', () => {
    const result = validateEmail('test@tempmail.com');
    expect(result.success).toBe(false);
  });

  test('rejects suspicious short local', () => {
    expect(validateEmail('a@b.co').success).toBe(false);
    expect(validateEmail('12@test.com').success).toBe(false);
  });

  test('rejects empty/null', () => {
    expect(validateEmail('').success).toBe(false);
    expect(validateEmail(null).success).toBe(false);
    expect(validateEmail(undefined).success).toBe(false);
  });
});

describe('Number Validation', () => {
  test('accepts valid integer', () => {
    const result = validateNumber(42);
    expect(result.success).toBe(true);
    expect(result.data).toBe(42);
  });

  test('accepts valid float by default', () => {
    const result = validateNumber(3.14);
    expect(result.success).toBe(true);
    expect(result.data).toBe(3.14);
  });

  test('rejects float when not allowed', () => {
    const result = validateNumber(3.14, { allowFloat: false });
    expect(result.success).toBe(false);
  });

  test('accepts string numbers', () => {
    const result = validateNumber('123');
    expect(result.success).toBe(true);
    expect(result.data).toBe(123);
  });

  test('rejects NaN', () => {
    expect(validateNumber(NaN).success).toBe(false);
    expect(validateNumber('not a number').success).toBe(false);
  });

  test('rejects Infinity', () => {
    expect(validateNumber(Infinity).success).toBe(false);
    expect(validateNumber(-Infinity).success).toBe(false);
  });

  test('enforces minimum', () => {
    const result = validateNumber(5, { min: 10 });
    expect(result.success).toBe(false);
    expect(result.error).toContain('mindestens');
  });

  test('enforces maximum', () => {
    const result = validateNumber(150, { max: 100 });
    expect(result.success).toBe(false);
    expect(result.error).toContain('maximal');
  });

  test('accepts value within range', () => {
    const result = validateNumber(50, { min: 10, max: 100 });
    expect(result.success).toBe(true);
  });

  test('accepts boundary values', () => {
    expect(validateNumber(10, { min: 10 }).success).toBe(true);
    expect(validateNumber(100, { max: 100 }).success).toBe(true);
  });
});
