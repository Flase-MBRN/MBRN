/**
 * @file synergy.js
 * M14 - Synergy Engine (Operator Compatibility)
 *
 * Canonical operator-based synergy calculation.
 * Accepts either precomputed operator numbers or raw { name, birthDate } input
 * and returns a stable compatibility contract for app, API, and tests.
 */

import { validateInput, diff } from './helpers.js';
import { calculateNameFrequency } from './frequency.js';
import { buildSynergyData, calculateLifePathFromBirthdate } from './synergy_contract.js';

/**
 * Calculates the synergy resonance between two operators.
 * Formula: Ssync = 100 - SUM(deltaVi * Wi)
 *
 * @param {Object} operatorA - Operator profile or raw person input
 * @param {Object} operatorB - Operator profile or raw person input
 * @returns {Promise<Object>} - Structured return per Gesetz 4
 */
export async function calculateSynergy(operatorA, operatorB) {
  try {
    const normalizedA = normalizeOperator(operatorA, 'operatorA');
    const normalizedB = normalizeOperator(operatorB, 'operatorB');

    if (!normalizedA.success) {
      return { success: false, error: normalizedA.error };
    }

    if (!normalizedB.success) {
      return { success: false, error: normalizedB.error };
    }

    const profileA = normalizedA.data;
    const profileB = normalizedB.data;

    const mentalDiff = diff(profileA.life_path, profileB.life_path);
    const emotionalDiff = diff(profileA.soul, profileB.soul);
    const operativDiff = diff(profileA.expression, profileB.expression);
    const personalityDiff =
      Number.isFinite(profileA.personality) && Number.isFinite(profileB.personality)
        ? diff(profileA.personality, profileB.personality)
        : operativDiff;

    const weights = { mental: 2.5, emotional: 1.5, operativ: 2.0 };
    const weightedSum = (mentalDiff * weights.mental) +
      (emotionalDiff * weights.emotional) +
      (operativDiff * weights.operativ);

    const synergyScore = Math.max(0, Math.min(100, 100 - weightedSum));
    const resonanceZones = [];
    const frictionPoints = [];

    if (mentalDiff <= 1) resonanceZones.push('Hohe mentale Synchronitaet');
    if (emotionalDiff <= 1) resonanceZones.push('Hohe emotionale Resonanz');
    if (operativDiff <= 1) resonanceZones.push('Hohe operative Abstimmung');
    if (personalityDiff <= 1) resonanceZones.push('Hohe persoenliche Resonanz');

    if (mentalDiff >= 4) frictionPoints.push('Unterschiedliche Lebensaufgaben');
    if (emotionalDiff >= 4) frictionPoints.push('Emotionale Verstaendigung erfordert Arbeit');
    if (operativDiff >= 4) frictionPoints.push('Unterschiedliche Arbeitsweisen');
    if (personalityDiff >= 4) frictionPoints.push('Persoenliche Ausdrucksformen kollidieren');

    return {
      success: true,
      data: buildSynergyData({
        synergyScore,
        mentalDiff,
        emotionalDiff,
        operativDiff,
        personalityDiff,
        resonanceZones: dedupe(resonanceZones),
        frictionPoints: dedupe(frictionPoints),
        operatorA: profileA,
        operatorB: profileB
      })
    };
  } catch (err) {
    return {
      success: false,
      error: `Synergy calculation error: ${err.message}`
    };
  }
}

function normalizeOperator(operator, label) {
  const required = ['life_path', 'expression', 'soul'];
  const validation = validateInput(operator, required);

  if (validation.valid) {
    return {
      success: true,
      data: {
        ...operator,
        life_path: Number(operator.life_path),
        expression: Number(operator.expression),
        soul: Number(operator.soul),
        personality: operator.personality != null ? Number(operator.personality) : undefined
      }
    };
  }

  if (!operator || typeof operator !== 'object' || Array.isArray(operator)) {
    return {
      success: false,
      error: `Validation failed for ${label}: missing ${validation.missing.join(', ')}`
    };
  }

  const birthDate = operator.birthDate ?? operator.birthdate;
  if (!operator.name || !birthDate) {
    return {
      success: false,
      error: `Validation failed for ${label}: missing ${validation.missing.join(', ')}`
    };
  }

  const frequencyResult = calculateNameFrequency(operator.name);
  if (!frequencyResult.success) {
    return {
      success: false,
      error: `Validation failed for ${label}: ${frequencyResult.error}`
    };
  }

  const lifePath = calculateLifePathFromBirthdate(birthDate);
  if (!Number.isFinite(lifePath)) {
    return {
      success: false,
      error: `Validation failed for ${label}: invalid birthDate`
    };
  }

  return {
    success: true,
    data: {
      ...operator,
      birthDate,
      life_path: lifePath,
      expression: frequencyResult.data.expression,
      soul: frequencyResult.data.soul_urge,
      personality: frequencyResult.data.personality
    }
  };
}

function dedupe(values) {
  return [...new Set(values)];
}
