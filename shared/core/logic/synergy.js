/**
 * @file synergy.js
 * M14 — Synergy Engine (Operator Compatibility)
 * 
 * Calculates the resonance compatibility between two Operators (persons) 
 * based on their numerological core numbers.
 * 
 * @see docs/M14_Synergy_Engine.md
 * Based on M-Theory: Two perspectives on the same membrane fundament.
 */

import { validateInput, diff } from './helpers.js';

/**
 * Calculates the synergy resonance between two operators.
 * Formula: Ssync = 100 - Σ(ΔVi × Wi)
 *
 * @param {Object} operatorA - First operator profile {life_path, expression, soul}
 * @param {Object} operatorB - Second operator profile {life_path, expression, soul}
 * @returns {Promise<Object>} - Structured return per Gesetz 4
 */
export async function calculateSynergy(operatorA, operatorB) {
  try {
    // Input validation
    const required = ['life_path', 'expression', 'soul'];
    const validationA = validateInput(operatorA, required);
    const validationB = validateInput(operatorB, required);

    if (!validationA.valid) {
      return {
        success: false,
        error: `Validation failed for operatorA: missing ${validationA.missing.join(', ')}`
      };
    }

    if (!validationB.valid) {
      return {
        success: false,
        error: `Validation failed for operatorB: missing ${validationB.missing.join(', ')}`
      };
    }

    // Calculate differences (ΔVi) with Master Number reduction
    const mentalDiff = diff(operatorA.life_path, operatorB.life_path);
    const emotionalDiff = diff(operatorA.soul, operatorB.soul);
    const operativDiff = diff(operatorA.expression, operatorB.expression);

    // Weights (Wi) - Mental is heaviest, Emotional lightest
    const weights = { mental: 2.5, emotional: 1.5, operativ: 2.0 };

    // Calculate weighted sum
    const weightedSum = (mentalDiff * weights.mental) +
                       (emotionalDiff * weights.emotional) +
                       (operativDiff * weights.operativ);

    // Calculate synergy score (100 - weighted sum, capped at 0-100)
    let synergyScore = Math.max(0, Math.min(100, 100 - weightedSum));

    // Determine resonance zones (high alignment areas)
    const resonanceZones = [];
    if (mentalDiff <= 1) resonanceZones.push('Hohe mentale Synchronität');
    if (emotionalDiff <= 1) resonanceZones.push('Hohe emotionale Resonanz');
    if (operativDiff <= 1) resonanceZones.push('Hohe operative Abstimmung');

    // Determine friction points (difference areas)
    const frictionPoints = [];
    if (mentalDiff >= 4) frictionPoints.push('Unterschiedliche Lebensaufgaben');
    if (emotionalDiff >= 4) frictionPoints.push('Emotionale Verständigung erfordert Arbeit');
    if (operativDiff >= 4) frictionPoints.push('Unterschiedliche Arbeitsweisen');

    return {
      success: true,
      data: {
        synergy_score: Math.round(synergyScore),
        mental_diff: mentalDiff,
        emotional_diff: emotionalDiff,
        operativ_diff: operativDiff,
        resonance_zones: resonanceZones,
        friction_points: frictionPoints,
        operators: {
          a: operatorA,
          b: operatorB
        }
      }
    };

  } catch (err) {
    return {
      success: false,
      error: `Synergy calculation error: ${err.message}`
    };
  }
}
