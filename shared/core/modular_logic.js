/**
 * @file modular_logic.js
 * Gateway Module — Re-exports all logic engines
 * 
 * @deprecated Direct imports from this file still supported,
 *             but prefer importing from specific modules:
 *             import { calculateSynergy } from './logic/synergy.js';
 * 
 * @see docs/M14_Synergy_Engine.md
 * @see docs/M15_Chronos_Engine.md  
 * @see docs/M16_Frequency_Engine.md
 */

// Re-export all logic functions for backward compatibility
export { reduceToDigit, validateInput, isMasterNumber, reduceForDiff, diff, MASTER_NUMBERS } from './logic/helpers.js';
export { calculateSynergy } from './logic/synergy.js';
export { calculateChronos } from './logic/chronos_v2.js';
export { calculateNameFrequency } from './logic/frequency.js';

// Legacy logic object export (for existing imports)
import { calculateSynergy } from './logic/synergy.js';
import { calculateChronos } from './logic/chronos_v2.js';
import { calculateNameFrequency } from './logic/frequency.js';
import { validateInput } from './logic/helpers.js';

export const logic = {
  // Task 13.1: Synergy calculation (operator compatibility)
  calculateSynergy,

  // Task 13.1: Chronos calculation (temporal positioning)
  calculateChronos,

  // Task 16.1: Name frequency calculation (numerology)
  calculateNameFrequency,

  // Task 13.2: Input validation (exposed for external use)
  validateInput: (data, requiredFields) => {
    const result = validateInput(data, requiredFields);
    return {
      success: result.valid,
      data: result.valid ? result : null,
      error: result.valid ? null : `Missing fields: ${result.missing.join(', ')}`
    };
  }
};

// ========================================
// MODULE METADATA
// ========================================

export const MODULAR_LOGIC_VERSION = '16.1.0';
export const MODULAR_LOGIC_STATUS = 'LIVE';
export const MODULAR_LOGIC_COMPLIANCE = {
  gesetz1: true,  // Module Responsibility
  gesetz2: true,  // No Direct DOM
  gesetz4: true,  // Structured Returns
  gesetz13: true, // Logic Isolation
  gesetz15: true  // Temporal Precision (UTC)
};

// ========================================
// CHRONOS SMOKE TEST (Task 14.2 Verification)
// ========================================
// Test: Birth 2005-12-11 → Target 2026-04-14
//
// Expected Calculations:
// - PY: reduceToDigit(12 + 11 + 2026) = reduceToDigit(2049) = 2+0+4+9 = 15 → 1+5 = 6
// - PM: reduceToDigit(6 + 4) = reduceToDigit(10) = 1+0 = 1
// - PD: reduceToDigit(1 + 14) = reduceToDigit(15) = 1+5 = 6
// - Cycle Phase: "Verantwortung & Harmonie" (PY=6)
//
// Manual Verification:
// logic.calculateChronos('2005-12-11').then(r => {
//   console.log('PY:', r.data.personalYear);        // Should be: 6
//   console.log('PM:', r.data.personalMonth);       // Should be: 1
//   console.log('PD:', r.data.personalDay);         // Should be: 6
//   console.log('Phase:', r.data.cycle_phase);      // Should be: "Verantwortung & Harmonie"
// });
//
// Run in browser console with: await logic.calculateChronos('2005-12-11')

// ========================================
// FREQUENCY SMOKE TEST (Task 16.1 Verification)
// ========================================
// Test: Name "Erik Klauss"
//
// Letter Breakdown:
// E=5, R=9, I=9, K=2 | K=2, L=3, A=1, U=3, S=1, S=1
// Total: 5+9+9+2+2+3+1+3+1+1 = 36
//
// Vowels (Soul Urge):
// E=5, I=9, A=1, U=3
// Raw: 5+9+1+3 = 18
// Reduced: 1+8 = 9
//
// Consonants (Personality):
// R=9, K=2, K=2, L=3, S=1, S=1
// Raw: 9+2+2+3+1+1 = 18
// Reduced: 1+8 = 9
//
// All Letters (Expression):
// Raw: 36
// Reduced: 3+6 = 9
//
// Expected Results:
// - soul_urge: 9
// - personality: 9
// - expression: 9
// - original_name: "Erik Klauss"
//
// Manual Verification:
// logic.calculateNameFrequency('Erik Klauss').then(r => {
//   console.log('Soul Urge:', r.data.soul_urge);      // Should be: 9
//   console.log('Personality:', r.data.personality);    // Should be: 9
//   console.log('Expression:', r.data.expression);      // Should be: 9
// });
//
// Run in browser console with: await logic.calculateNameFrequency('Erik Klauss')

