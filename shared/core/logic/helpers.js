/**
 * @file helpers.js
 * Shared utilities for all logic modules
 * 
 * @see docs/M14_Synergy_Engine.md
 * @see docs/M15_Chronos_Engine.md
 * @see docs/M16_Frequency_Engine.md
 */

export const MASTER_NUMBERS = new Set([11, 22, 33]);

/**
 * Validates input data against required fields.
 * Security net before any calculation execution.
 *
 * @param {Object} data - The data object to validate
 * @param {Array<string>} requiredFields - Array of required field names
 * @returns {Object} - { valid: boolean, missing: string[] }
 */
export function validateInput(data, requiredFields) {
  if (data === null || data === undefined) {
    return { valid: false, missing: ['data object is null or undefined'] };
  }

  if (typeof data !== 'object' || Array.isArray(data)) {
    return { valid: false, missing: ['data must be an object'] };
  }

  const missing = [];

  for (const field of requiredFields) {
    if (!(field in data)) {
      missing.push(field);
      continue;
    }

    if (typeof data[field] === 'string' && data[field].trim() === '') {
      missing.push(`${field} (empty string)`);
    }
  }

  return { valid: missing.length === 0, missing };
}

/**
 * Numerological Reduction: Reduces number to 1-9 or Master Number (11, 22, 33)
 * Preserves Master Numbers as significant spiritual markers
 *
 * @param {number} num - Number to reduce
 * @returns {number} - Reduced digit (1-9) or Master Number (11, 22, 33)
 */
export function reduceToDigit(num) {
  if (num === 0) return 0;
  if (num < 0) num = Math.abs(num);

  // Keep reducing until single digit OR master number
  while (num > 9 && !MASTER_NUMBERS.has(num)) {
    num = String(num).split('').reduce((sum, digit) => sum + parseInt(digit, 10), 0);
  }

  return num;
}

/**
 * Master Number Check
 * @param {number} value - Number to check
 * @returns {boolean} - True if 11, 22, or 33
 */
export function isMasterNumber(value) {
  return [11, 22, 33].includes(value);
}

/**
 * Reduces Master Numbers for difference calculation
 * 11 -> 2, 22 -> 4, 33 -> 6
 * @param {number} value - Number to reduce
 * @returns {number} - Reduced value
 */
export function reduceForDiff(value) {
  if (value === 11) return 2;
  if (value === 22) return 4;
  if (value === 33) return 6;
  return value;
}

/**
 * Calculates absolute difference with Master Number reduction
 * @param {number} a - First value
 * @param {number} b - Second value
 * @returns {number} - Absolute difference
 */
export function diff(a, b) {
  return Math.abs(reduceForDiff(a) - reduceForDiff(b));
}
