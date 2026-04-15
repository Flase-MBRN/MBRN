/**
 * @file chronos.js
 * M15 — Chronos Engine (Temporal Cycles)
 * 
 * Calculates numerological time cycles (Personal Year, Month, Day) 
 * based on birth date and target date.
 * 
 * @see docs/M15_Chronos_Engine.md
 * 
 * NOTE: Core PY/PM/PD calculation implemented.
 * Future extensions: Pinnacles, Life Cycle phases, Challenges
 */

import { reduceToDigit } from './helpers.js';

/**
 * Calculates temporal positioning and cycle analysis.
 * Determines where an operator stands in their chronos cycle.
 *
 * PY = reduceToDigit(birthMonth + birthDay + targetYear)
 * PM = reduceToDigit(PY + targetMonth)
 * PD = reduceToDigit(PM + targetDay)
 *
 * @param {Date|string} birthDate - Birth date (Date object or ISO string)
 * @returns {Promise<Object>} - Structured return per Gesetz 4
 */
export async function calculateChronos(birthDate) {
  try {
    // Input validation
    if (!birthDate) {
      return {
        success: false,
        error: 'Validation failed: birthDate is required'
      };
    }

    // Normalize to Date object
    let dateObj;
    if (birthDate instanceof Date) {
      dateObj = birthDate;
    } else if (typeof birthDate === 'string') {
      dateObj = new Date(birthDate);
    } else {
      return {
        success: false,
        error: 'Validation failed: birthDate must be Date object or ISO string'
      };
    }

    // Check for invalid date
    if (isNaN(dateObj.getTime())) {
      return {
        success: false,
        error: 'Validation failed: birthDate is invalid'
      };
    }

    // Task 14.2: Real Chronos Calculation (Numerological Time Cycles)
    // Formula: Personal cycles based on birth date + target date
    
    // LAW 15 COMPLIANT: UTC-only date construction to eliminate timezone bugs
    const now = new Date();
    const targetDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const targetYear = targetDate.getUTCFullYear();
    const targetMonth = targetDate.getUTCMonth() + 1; // 1-12
    const targetDay = targetDate.getUTCDate();

    const birthYear = dateObj.getUTCFullYear();
    const birthMonth = dateObj.getUTCMonth() + 1; // 1-12
    const birthDay = dateObj.getUTCDate();

    // Calculate Personal Year (PY): birthMonth + birthDay + targetYear
    const personalYear = reduceToDigit(birthMonth + birthDay + targetYear);

    // Calculate Personal Month (PM): PY + targetMonth
    const personalMonth = reduceToDigit(personalYear + targetMonth);

    // Calculate Personal Day (PD): PM + targetDay
    const personalDay = reduceToDigit(personalMonth + targetDay);

    // Determine Cycle Phase based on Personal Year
    const cyclePhases = {
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

    const cyclePhase = cyclePhases[personalYear] || "Allgemeine Phase";

    // Universal cycles (world energy)
    const universalYear = reduceToDigit(targetYear);
    const universalMonth = reduceToDigit(universalYear + targetMonth);
    const universalDay = reduceToDigit(universalMonth + targetDay);

    const chronosResult = {
      birthTimestamp: dateObj.toISOString(),
      currentTimestamp: targetDate.toISOString(),
      birth_date: `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`,
      target_date: `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`,

      // Personal cycles (individual energy)
      personalYear,
      personalMonth,
      personalDay,
      cycle_phase: cyclePhase,

      // Universal cycles (world energy)
      universalYear,
      universalMonth,
      universalDay,

      // Phase 2 Extensions (bewusst null — UI-Adapter sollte diese ausblenden)
      // NOTE: pinnacles/challenges werden in Phase 5.0 UI nicht gerendert.
      // Adapter-Logik: if (data.pinnacles.p1) render(...) else hideSection()
      cycle: null,
      phase: null,
      pinnacles: { p1: null, p2: null, p3: null, p4: null },
      challenges: { c1: null, c2: null, c3: null, c4: null },

      // UTC-based per Gesetz 15
      timezone: 'UTC'
    };

    return {
      success: true,
      data: chronosResult
    };

  } catch (err) {
    return {
      success: false,
      error: `Chronos calculation error: ${err.message}`
    };
  }
}
