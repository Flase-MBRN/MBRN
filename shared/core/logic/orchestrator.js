/**
 * /shared/core/logic/orchestrator.js
 * UNIFIED PROFILE ORCHESTRATOR — v3.0
 * 
 * Orchestrates M15 (Chronos), M16 (Frequency), and Legacy Numerology Engines
 * into a single unified data format.
 * 
 * Architecture: Single Source of Truth — All brain power in the Core.
 */

import { calculateNameFrequency } from './frequency.js';
import { calculateChronos } from './chronos_v2.js';
import { calculateFullProfile as calculateLegacyProfile } from './numerology/index.js';

/**
 * LAW 15 COMPLIANT: UTC-only timestamp generation
 * Eliminates timezone bugs by using explicit UTC construction
 */
function getUTCTimestamp() {
  const now = new Date();
  const utcDate = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds(),
    now.getUTCMilliseconds()
  ));
  return utcDate.toISOString();
}

/**
 * Builds a unified operator profile by orchestrating all available engines.
 * 
 * M15 (Chronos): Temporal cycles and positioning
 * M16 (Frequency): Name-based frequency analysis
 * Legacy: Full numerological blueprint (quantum, loShu, pinnacles, etc.)
 * 
 * @param {string} name - Full name of the operator
 * @param {string} birthDate - Birth date in format "TT.MM.JJJJ" or ISO string
 * @returns {Promise<Object>} - Unified profile per Gesetz 4
 */
export async function getUnifiedProfile(name, birthDate) {
  try {
    // ─── INPUT VALIDATION ───────────────────────────────────────────────
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return {
        success: false,
        error: 'Validation failed: name must be at least 2 characters'
      };
    }

    if (!birthDate) {
      return {
        success: false,
        error: 'Validation failed: birthDate is required'
      };
    }

    // Normalize birthDate to "TT.MM.JJJJ" format for legacy compatibility
    let normalizedDate = birthDate;
    if (birthDate.includes('-')) {
      // ISO format: YYYY-MM-DD → DD.MM.YYYY
      const [y, m, d] = birthDate.split('-');
      normalizedDate = `${d}.${m}.${y}`;
    }

    // ─── ENGINE EXECUTION ─────────────────────────────────────────────────
    
    // Legacy Engine (synchronous)
    const legacyResult = calculateLegacyProfile(name, normalizedDate);
    if (!legacyResult.success) {
      return legacyResult; // Propagate legacy validation errors
    }

    // M16 Frequency Engine (synchronous)
    const frequencyResult = calculateNameFrequency(name);
    
    // M15 Chronos Engine (asynchronous)
    // Convert DD.MM.YYYY to ISO for chronos
    const [day, month, year] = normalizedDate.split('.');
    const isoDate = `${year}-${month}-${day}`;
    const chronosResult = await calculateChronos(isoDate);

    // ─── UNIFIED PROFILE BUILDER ──────────────────────────────────────────
    
    const unifiedData = {
      // M15/M16 Engine Results (Future Source of Truth)
      engines: {
        frequency: frequencyResult.success ? frequencyResult.data : null,
        chronos: chronosResult.success ? chronosResult.data : null
      },

      // Legacy Results (Current Source of Truth — phasing out gradually)
      legacy: {
        full_profile: legacyResult.data,
        pdf_config: {
          title: 'MBRN Operator Report',
          version: '3.0-unified',
          generatedAt: getUTCTimestamp() // LAW 15 COMPLIANT
        }
      },

      // Metadata
      meta: {
        name: name.trim(),
        birthDate: normalizedDate,
        calculatedAt: getUTCTimestamp(), // LAW 15 COMPLIANT
        version: '3.0-unified',
        enginesUsed: ['legacy_v2.5', 'm15_chronos', 'm16_frequency']
      }
    };

    return {
      success: true,
      data: unifiedData
    };

  } catch (error) {
    return {
      success: false,
      error: `Unified profile calculation failed: ${error.message}`
    };
  }
}

// Re-export generators for Core access
export { generateShareCard, generateTeaserAsset, generateOperatorReport } from './numerology/index.js';
