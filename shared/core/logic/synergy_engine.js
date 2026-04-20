/**
 * @file synergy_engine.js
 * MBRN Synergy Engine — Birthdate-based Compatibility Calculator
 *
 * Calculates numerological compatibility between two people based on their
 * birthdates. Uses a Life Path compatibility matrix with Master Number bonuses.
 *
 * Approach: Birthdate digits → Life Path Number → ROOT_COMPATIBILITY lookup → Score
 *
 * LAW 1  COMPLIANT: MASTER_NUMBERS imported from centralized config.js
 * LAW 4  COMPLIANT: All functions return { success, data, error } format
 * LAW 8  COMPLIANT: No magic numbers (ROOT_COMPATIBILITY is a data table, documented)
 * LAW 15 COMPLIANT: UTC-only date parsing to eliminate timezone bugs
 *
 * Test cases:
 *   calculateSynergy("11.12.2005", "28.03.2008")
 *   calculateSynergy("28.03.2008", "11.12.2005")  → MUST be symmetric
 *
 * @see docs/M14_Synergy_Engine.md
 */

import { MASTER_NUMBERS } from '../config/index.js';
import { buildSynergyData } from './synergy_contract.js';

// LAW 1 COMPLIANT: Single source — MASTER_NUMBERS from config.js (not redefined here)
const MASTER_NUMBERS_SET = new Set(MASTER_NUMBERS);

/**
 * Life Path Compatibility Matrix (Root Numbers 1-9 only)
 * Master Numbers are reduced to their root before lookup.
 * Matrix is symmetric: ROOT_COMPATIBILITY[a][b] === ROOT_COMPATIBILITY[b][a]
 *
 * Scores represent numerological resonance strength (base 58-96).
 * Final score adds bonuses for: same LP, both master, same-root masters.
 *
 * @type {Object.<number, Object.<number, number>>}
 */
const ROOT_COMPATIBILITY = {
  1: { 1: 96, 2: 74, 3: 88, 4: 67, 5: 91, 6: 63, 7: 58, 8: 79, 9: 84 },
  2: { 1: 74, 2: 96, 3: 77, 4: 82, 5: 68, 6: 92, 7: 80, 8: 71, 9: 86 },
  3: { 1: 88, 2: 77, 3: 96, 4: 69, 5: 85, 6: 78, 7: 64, 8: 73, 9: 93 },
  4: { 1: 67, 2: 82, 3: 69, 4: 96, 5: 72, 6: 84, 7: 87, 8: 94, 9: 66 },
  5: { 1: 91, 2: 68, 3: 85, 4: 72, 5: 96, 6: 75, 7: 70, 8: 81, 9: 89 },
  6: { 1: 63, 2: 92, 3: 78, 4: 84, 5: 75, 6: 96, 7: 76, 8: 83, 9: 90 },
  7: { 1: 58, 2: 80, 3: 64, 4: 87, 5: 70, 6: 76, 7: 96, 8: 79, 9: 72 },
  8: { 1: 79, 2: 71, 3: 73, 4: 94, 5: 81, 6: 83, 7: 79, 8: 96, 9: 74 },
  9: { 1: 84, 2: 86, 3: 93, 4: 66, 5: 89, 6: 90, 7: 72, 8: 74, 9: 96 }
};

// ---------------------------------------------------------------------------
// PUBLIC API
// ---------------------------------------------------------------------------

/**
 * Calculates synergy score between two people based on birthdates.
 *
 * @param {Date|string} birthdate1 - First person's birthdate (DD.MM.YYYY, YYYY-MM-DD, or Date)
 * @param {Date|string} birthdate2 - Second person's birthdate (DD.MM.YYYY, YYYY-MM-DD, or Date)
 * @returns {{ success: boolean, data: SynergyResult|null, error: string|null }}
 *
 * @typedef {Object} SynergyResult
 * @property {number} lifePath1    - Life Path number (1-9 or 11/22/33)
 * @property {number} lifePath2    - Life Path number (1-9 or 11/22/33)
 * @property {number} synergyScore - Compatibility score 1-100
 */
export function calculateSynergy(birthdate1, birthdate2) {
  try {
    const parts1 = _normalizeBirthdate(birthdate1);
    const parts2 = _normalizeBirthdate(birthdate2);

    if (!parts1 || !parts2) {
      return _buildError('Invalid birthdate. Use DD.MM.YYYY or YYYY-MM-DD.');
    }

    const lifePath1 = _calculateLifePath(parts1);
    const lifePath2 = _calculateLifePath(parts2);
    const synergyScore = _calculateSynergyScore(lifePath1, lifePath2);
    const rootDiff = Math.abs(_getRootNumber(lifePath1) - _getRootNumber(lifePath2));
    const resonanceZones = [];
    const frictionPoints = [];

    if (rootDiff <= 1) resonanceZones.push('Hohe mentale Synchronitaet');
    if (lifePath1 === lifePath2) resonanceZones.push('Gleiche Lebenszahl-Dynamik');
    if (rootDiff >= 4) frictionPoints.push('Unterschiedliche Lebensaufgaben');

    return {
      success: true,
      data: buildSynergyData({
        synergyScore,
        mentalDiff: rootDiff,
        resonanceZones,
        frictionPoints,
        lifePath1,
        lifePath2
      }),
      error: null
    };
  } catch (error) {
    return _buildError(error instanceof Error ? error.message : 'Unknown synergy calculation error.');
  }
}

// ---------------------------------------------------------------------------
// PRIVATE HELPERS — prefixed with _ per MBRN naming convention
// ---------------------------------------------------------------------------

/**
 * Normalizes various birthdate input formats into { day, month, year }.
 * LAW 15 COMPLIANT: Uses UTC to prevent timezone-based date shifts.
 *
 * @param {Date|string} input
 * @returns {{ day: number, month: number, year: number }|null}
 */
function _normalizeBirthdate(input) {
  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) return null;
    return {
      year:  input.getUTCFullYear(),
      month: input.getUTCMonth() + 1,
      day:   input.getUTCDate()
    };
  }

  if (typeof input !== 'string') return null;

  const trimmed = input.trim();
  if (!trimmed) return null;

  // DD.MM.YYYY
  const dotMatch = trimmed.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (dotMatch) {
    return _validateDateParts({
      day:   Number(dotMatch[1]),
      month: Number(dotMatch[2]),
      year:  Number(dotMatch[3])
    });
  }

  // YYYY-MM-DD
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return _validateDateParts({
      year:  Number(isoMatch[1]),
      month: Number(isoMatch[2]),
      day:   Number(isoMatch[3])
    });
  }

  return null;
}

/**
 * Validates date parts using UTC construction (catches invalid dates like Feb 30).
 *
 * @param {{ day: number, month: number, year: number }} parts
 * @returns {{ day: number, month: number, year: number }|null}
 */
function _validateDateParts(parts) {
  const utcDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  const isValid =
    utcDate.getUTCFullYear() === parts.year &&
    utcDate.getUTCMonth()    === parts.month - 1 &&
    utcDate.getUTCDate()     === parts.day;

  return isValid ? parts : null;
}

/**
 * Calculates Life Path Number from date parts.
 * Method: Sum all 8 digits of YYYYMMDD, reduce preserving Master Numbers.
 *
 * Example: 11.12.2005 → "20051211" → 2+0+0+5+1+2+1+1 = 12 → 1+2 = 3
 *
 * @param {{ day: number, month: number, year: number }} parts
 * @returns {number} Life Path (1-9 or 11/22/33)
 */
function _calculateLifePath(parts) {
  const digits = `${parts.year}${_pad(parts.month)}${_pad(parts.day)}`;
  const initialSum = _sumDigits(digits);
  return _reducePreserveMaster(initialSum);
}

/**
 * Reduces a number to single digit, preserving Master Numbers (11, 22, 33).
 * LAW 1 COMPLIANT: Uses MASTER_NUMBERS_SET built from centralized config.
 *
 * @param {number} value
 * @returns {number}
 */
function _reducePreserveMaster(value) {
  let current = value;
  while (current > 9 && !MASTER_NUMBERS_SET.has(current)) {
    current = _sumDigits(String(current));
  }
  return current;
}

/**
 * Calculates final synergy score with Master Number bonuses.
 * Bonuses: same LP (+2), both master (+4 or +2 if one), same-root masters (+2).
 *
 * @param {number} lp1 - Life Path 1
 * @param {number} lp2 - Life Path 2
 * @returns {number} Score 1-100
 */
function _calculateSynergyScore(lp1, lp2) {
  const root1 = _getRootNumber(lp1);
  const root2 = _getRootNumber(lp2);
  const baseScore = ROOT_COMPATIBILITY[root1][root2];

  let bonus = 0;
  if (lp1 === lp2) bonus += 2;
  if (MASTER_NUMBERS_SET.has(lp1) && MASTER_NUMBERS_SET.has(lp2)) {
    bonus += 4;
    if (root1 === root2) bonus += 2;  // e.g. 11 & 22 both → root 2 & 4, only triggers if identical roots
  } else if (MASTER_NUMBERS_SET.has(lp1) || MASTER_NUMBERS_SET.has(lp2)) {
    bonus += 2;
  }

  return _clamp(baseScore + bonus, 1, 100);
}

/**
 * Returns root number: reduces master numbers (11→2, 22→4, 33→6) for matrix lookup.
 *
 * @param {number} value
 * @returns {number} 1-9
 */
function _getRootNumber(value) {
  return MASTER_NUMBERS_SET.has(value) ? _sumDigits(String(value)) : value;
}

/**
 * Sums all digit characters in a string.
 * @param {string} value
 * @returns {number}
 */
function _sumDigits(value) {
  return String(value).split('').reduce((sum, d) => sum + Number(d), 0);
}

/**
 * Zero-pads a number to 2 digits.
 * @param {number} value
 * @returns {string}
 */
function _pad(value) {
  return String(value).padStart(2, '0');
}

/**
 * Clamps value between min and max.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function _clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Builds a standardized error response (LAW 4 COMPLIANT).
 * @param {string} message
 * @returns {{ success: false, data: null, error: string }}
 */
function _buildError(message) {
  return { success: false, data: null, error: message };
}
