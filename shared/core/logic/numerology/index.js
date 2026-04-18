/**
 * /shared/core/logic/numerology/index.js
 * NUMEROLOGY ENGINE — Main Entry Point
 * 
 * Responsibility: Barrel exports and main orchestrator
 * Backward compatible with legacy_numerology.js API
 */

// Core mathematical functions
export {
  PYTHAGORAS,
  VOWELS,
  MASTER_NUMBERS,
  digitSum,
  reduceForceSingle,
  reducePreserveMaster,
  formatValue,
  normalizeName,
  charToNumber,
  nameToNumbers,
  isYVowel,
  calculateLifePathTotal,
  calculateSoulUrgeTotal,
  calculatePersonalityTotal,
  calculateExpressionTotal
} from './core.js';

// Matrix calculations
export {
  calculateLoShu,
  calculateQuantumScore,
  calculateKarma,
  calculateBridges
} from './matrix.js';

// Timing calculations
export {
  calculateCycles,
  calculatePinnacles,
  calculateChallenges
} from './timing.js';

// Metadata and interpretations
export {
  OPERATOR_CONFIG,
  OPERATOR_MATRIX,
  DEEP_DECODE_MATRIX
} from './metadata.js';

// PDF generation
export { generateShareCard, generateTeaserAsset } from './pdf/canvas.js';
export { generateDeepReport, generateOperatorReport } from './pdf/report.js';

// Import for main orchestrator
import { formatValue, calculateLifePathTotal, calculateSoulUrgeTotal, calculatePersonalityTotal, calculateExpressionTotal, reduceForceSingle } from './core.js';
import { calculateLoShu, calculateQuantumScore, calculateKarma, calculateBridges } from './matrix.js';
import { calculateCycles, calculatePinnacles, calculateChallenges } from './timing.js';
import { nameToNumbers } from './core.js';

/**
 * Calculates complete numerology profile
 * Backward compatible with legacy_numerology.js calculateFullProfile
 * 
 * @param {string} name - Full name
 * @param {string} dateStr - Birth date in DD.MM.YYYY format
 * @returns {Object} - Structured profile data per Gesetz 4
 */
export function calculateFullProfile(name, dateStr) {
  if (!name || name.trim().length < 2) return { success: false, error: 'Name zu kurz' };
  const dateMatch = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!dateMatch) return { success: false, error: 'Ungültiges Date-Format (TT.MM.JJJJ)' };

  try {
    const lifeRaw = calculateLifePathTotal(dateStr);
    const soulRaw = calculateSoulUrgeTotal(name);
    const persRaw = calculatePersonalityTotal(name);
    const exprRaw = calculateExpressionTotal(name);

    return {
      success: true,
      data: {
        meta: { name, date: dateStr },
        core: {
          lifePath: formatValue(lifeRaw),
          soulUrge: formatValue(soulRaw),
          personality: formatValue(persRaw),
          expression: formatValue(exprRaw)
        },
        loShu: calculateLoShu(dateStr),
        quantum: calculateQuantumScore(lifeRaw, soulRaw, exprRaw),
        cycles: calculateCycles(dateStr),
        pinnacles: calculatePinnacles(dateStr),
        challenges: calculateChallenges(dateStr),
        karma: calculateKarma(name, nameToNumbers),
        bridges: calculateBridges(lifeRaw, soulRaw, exprRaw, persRaw, reduceForceSingle),
        additional: {
          birthday: formatValue(parseInt(dateStr.split('.')[0], 10)),
          maturity: formatValue(reduceForceSingle(lifeRaw) + reduceForceSingle(exprRaw))
        }
      }
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
