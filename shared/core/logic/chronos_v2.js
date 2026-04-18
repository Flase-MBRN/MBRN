/**
 * @file chronos_v2.js
 * M15 — Chronos Engine v2 (Unified Temporal Analysis)
 *
 * SINGLE SOURCE OF TRUTH for all temporal calculations in MBRN.
 * Merges biographical time (7-year life cycles) with numerological time
 * (Personal Year / Month / Day cycles).
 *
 * Supersedes: chronos.js + chronos_engine.js
 * @since 2026-04-18 — P1.1 Chronos-Merge
 *
 * @see docs/M15_Chronos_Engine.md
 */

import { reduceToDigit, safeReduceToDigit } from './helpers.js';

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const CYCLE_YEARS = 7;

/**
 * Cycle phase interpretations keyed by Personal Year value.
 * Includes Master Numbers 11, 22, 33.
 */
const CYCLE_PHASES = {
  1: "Neubeginn & Initiation",
  2: "Kooperation & Balance",
  3: "Kreativität & Expansion",
  4: "Stabilität & Fundament",
  5: "Veränderung & Freiheit",
  6: "Verantwortung & Harmonie",
  7: "Analyse & Spiritualität",
  8: "Macht & Manifestation",
  9: "Abschluss & Transformation",
  11: "Intuition & Meister-Initiation",
  22: "Baumeister & Manifestation",
  33: "Meister-Lehrer & Heilung"
};

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculates the complete temporal profile for an operator.
 * Combines biographical time (7-year cycles, lived days) with
 * numerological time (PY/PM/PD, universal cycles, cycle phase).
 *
 * @param {Date|string} birthdateInput - Birth date as Date object,
 *   "YYYY-MM-DD", "DD.MM.YYYY", or flexible "YYYY/MM/DD"
 * @returns {{ success: boolean, data: Object|null, error: string|null }}
 */
export function calculateChronos(birthdateInput) {
  try {
    // ─── INPUT VALIDATION ───────────────────────────────────────────────
    if (!birthdateInput) {
      return buildError("Validation failed: birthDate is required");
    }

    const birthDate = normalizeBirthdateInput(birthdateInput);

    if (!birthDate) {
      return buildError(
        "Bitte prüfe dein Geburtsdatum — dieses Datum existiert nicht im Kalender."
      );
    }

    // LAW 15 COMPLIANT: UTC-only target date construction
    const now = new Date();

    // Future date guard
    if (birthDate.getTime() > now.getTime()) {
      return buildError("Birthdate cannot be in the future.");
    }

    const targetDate = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );

    // ─── STRICT DATE VALIDATION (anti-autocorrection) ───────────────────
    const inputStr = typeof birthdateInput === 'string' ? birthdateInput : null;
    if (inputStr) {
      const inputMatch = inputStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (inputMatch) {
        const inputYear = parseInt(inputMatch[1], 10);
        const inputMonth = parseInt(inputMatch[2], 10);
        const inputDay = parseInt(inputMatch[3], 10);

        if (
          inputYear !== birthDate.getUTCFullYear() ||
          inputMonth !== birthDate.getUTCMonth() + 1 ||
          inputDay !== birthDate.getUTCDate()
        ) {
          return buildError(
            `Ungültiges Datum: ${inputDay}.${inputMonth}.${inputYear} existiert nicht. Bitte prüfe Tag und Monat.`
          );
        }
      }
    }

    // ─── EXTRACT DATE COMPONENTS (UTC) ──────────────────────────────────

    const birthYear = birthDate.getUTCFullYear();
    const birthMonth = birthDate.getUTCMonth() + 1; // 1-12
    const birthDay = birthDate.getUTCDate();

    const targetYear = targetDate.getUTCFullYear();
    const targetMonth = targetDate.getUTCMonth() + 1; // 1-12
    const targetDay = targetDate.getUTCDate();

    // ─── BIOGRAPHICAL TIME (ex chronos_engine.js) ───────────────────────

    const livedDays = Math.floor(
      (now.getTime() - birthDate.getTime()) / MS_PER_DAY
    );
    const completedYears = getCompletedUTCYears(birthDate, now);
    const currentPhase = Math.floor(completedYears / CYCLE_YEARS) + 1;
    const nextCycleYearOffset = currentPhase * CYCLE_YEARS;
    const nextCycleStart = addUTCYearsClamped(birthDate, nextCycleYearOffset);

    // ─── NUMEROLOGICAL TIME (ex chronos.js) ─────────────────────────────

    // Personal Year (PY): reduceToDigit(birthMonth + birthDay + targetYear)
    const personalYear = safeReduceToDigit(birthMonth + birthDay + targetYear);

    // Personal Month (PM): reduceToDigit(PY + targetMonth)
    const personalMonth = safeReduceToDigit(personalYear + targetMonth);

    // Personal Day (PD): reduceToDigit(PM + targetDay)
    const personalDay = safeReduceToDigit(personalMonth + targetDay);

    // Cycle phase interpretation
    const cyclePhase = CYCLE_PHASES[personalYear] || "Allgemeine Phase";

    // Universal cycles (world energy)
    const universalYear = reduceToDigit(targetYear);
    const universalMonth = reduceToDigit(universalYear + targetMonth);
    const universalDay = reduceToDigit(universalMonth + targetDay);

    // ─── UNIFIED RESULT ─────────────────────────────────────────────────

    return {
      success: true,
      data: {
        // Biographical Time
        livedDays,
        currentPhase,
        nextCycleStartUTC: nextCycleStart.toISOString(),
        birthdateUTC: birthDate.toISOString(),

        // Numerological Time — Personal Cycles
        personalYear,
        personalMonth,
        personalDay,
        cycle_phase: cyclePhase,

        // Numerological Time — Universal Cycles
        universalYear,
        universalMonth,
        universalDay,

        // Timestamps & Metadata
        birth_date: `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`,
        target_date: `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`,
        birthTimestamp: birthDate.toISOString(),
        currentTimestamp: targetDate.toISOString(),
        timezone: 'UTC',

        // Future Extensions (Phase 5.0)
        /**
         * @todo Phase 5.0: Implement pinnacles (4 life cycles)
         * @todo Phase 5.0: Implement challenges (4 obstacles)
         * Adapter pattern: if (data.pinnacles.p1) render(...) else hideSection()
         */
        pinnacles: { p1: null, p2: null, p3: null, p4: null },
        challenges: { c1: null, c2: null, c3: null, c4: null }
      },
      error: null
    };
  } catch (error) {
    return buildError(
      error instanceof Error
        ? error.message
        : "Unknown Chronos calculation error."
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// INPUT NORMALIZATION (from chronos_engine.js — superior multi-format parser)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Normalizes various birthdate input formats to a UTC midnight Date object.
 *
 * Supported formats:
 *   - Date object
 *   - "YYYY-MM-DD" (ISO)
 *   - "DD.MM.YYYY" (German)
 *   - "YYYY/MM/DD" or "YYYY.MM.DD" (flexible)
 *
 * @param {Date|string} input - Raw birthdate input
 * @returns {Date|null} - Normalized UTC midnight Date, or null if invalid
 */
function normalizeBirthdateInput(input) {
  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) {
      return null;
    }
    return new Date(
      Date.UTC(
        input.getUTCFullYear(),
        input.getUTCMonth(),
        input.getUTCDate(),
        0, 0, 0, 0
      )
    );
  }

  if (typeof input !== "string") {
    return null;
  }

  const trimmed = input.trim();

  if (!trimmed) {
    return null;
  }

  // DD.MM.YYYY (German format — MBRN native)
  const dotMatch = trimmed.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (dotMatch) {
    const day = Number(dotMatch[1]);
    const month = Number(dotMatch[2]);
    const year = Number(dotMatch[3]);
    return createValidatedUTCDate(year, month, day);
  }

  // YYYY-MM-DD (ISO format)
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    return createValidatedUTCDate(year, month, day);
  }

  // Flexible: YYYY/MM/DD or YYYY.MM.DD
  // LAW 15: No browser Date.parse() — explicit extraction only
  const flexMatch = trimmed.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/);
  if (flexMatch) {
    const year = Number(flexMatch[1]);
    const month = Number(flexMatch[2]);
    const day = Number(flexMatch[3]);
    return createValidatedUTCDate(year, month, day);
  }

  // Unknown formats rejected for security
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATE ARITHMETIC (from chronos_engine.js — UTC-precise, leap-year safe)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Creates a UTC Date and validates it was not auto-corrected by JS.
 * Prevents phantom dates like Feb 30 → Mar 2.
 *
 * @param {number} year
 * @param {number} month - 1-12
 * @param {number} day
 * @returns {Date|null}
 */
function createValidatedUTCDate(year, month, day) {
  const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

  const isValid =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;

  return isValid ? date : null;
}

/**
 * Calculates completed calendar years between two UTC dates,
 * accounting for whether the anniversary has passed this year.
 *
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {number}
 */
function getCompletedUTCYears(startDate, endDate) {
  let years = endDate.getUTCFullYear() - startDate.getUTCFullYear();
  const anniversary = addUTCYearsClamped(startDate, years);

  if (anniversary.getTime() > endDate.getTime()) {
    years -= 1;
  }

  return Math.max(0, years);
}

/**
 * Adds years to a UTC date, clamping the day for month overflow.
 * Handles leap year edge case: Feb 29 + 1 year → Feb 28.
 *
 * @param {Date} date
 * @param {number} yearsToAdd
 * @returns {Date}
 */
function addUTCYearsClamped(date, yearsToAdd) {
  const targetYear = date.getUTCFullYear() + yearsToAdd;
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const lastDayOfTargetMonth = getLastUTCDateOfMonth(targetYear, month);
  const safeDay = Math.min(day, lastDayOfTargetMonth);

  return new Date(Date.UTC(targetYear, month, safeDay, 0, 0, 0, 0));
}

/**
 * Returns the last day of a given month in UTC.
 *
 * @param {number} year
 * @param {number} zeroBasedMonth - 0-11
 * @returns {number}
 */
function getLastUTCDateOfMonth(year, zeroBasedMonth) {
  return new Date(Date.UTC(year, zeroBasedMonth + 1, 0)).getUTCDate();
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTERNAL HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Builds a standardized error response.
 *
 * @param {string} message
 * @returns {{ success: false, data: null, error: string }}
 */
function buildError(message) {
  return {
    success: false,
    data: null,
    error: message
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// BROWSER GLOBAL (for console access)
// ═══════════════════════════════════════════════════════════════════════════════

if (typeof globalThis !== 'undefined') {
  globalThis.calculateChronos = calculateChronos;
}
