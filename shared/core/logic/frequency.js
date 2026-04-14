/**
 * @file frequency.js
 * M16 — Frequency Engine (Name Numerology)
 * 
 * Calculates name-based numerological frequencies using the Pythagorean system.
 * 
 * @see docs/M16_Frequency_Engine.md
 * Extracted from Archive v3.0 (01_NumerologieRechner)
 */

import { reduceToDigit } from './helpers.js';

/**
 * Pythagorean Letter-to-Number Mapping
 * A,J,S=1 | B,K,T=2 | C,L,U=3 | D,M,V=4 | E,N,W=5 | F,O,X=6 | G,P,Y=7 | H,Q,Z=8 | I,R=9
 */
const PYTHAGOREAN_MAP = {
  'A': 1, 'J': 1, 'S': 1,
  'B': 2, 'K': 2, 'T': 2,
  'C': 3, 'L': 3, 'U': 3,
  'D': 4, 'M': 4, 'V': 4,
  'E': 5, 'N': 5, 'W': 5,
  'F': 6, 'O': 6, 'X': 6,
  'G': 7, 'P': 7, 'Y': 7,
  'H': 8, 'Q': 8, 'Z': 8,
  'I': 9, 'R': 9
};

const VOWELS_SET = new Set(['A', 'E', 'I', 'O', 'U']);

/**
 * Y-Vowel Rule: Y counts as vowel when between two consonants
 * Special cases: At start/end, Y is vowel only if no adjacent vowel
 * @param {string[]} chars - Array of uppercase characters
 * @param {number} index - Position of Y to check
 * @returns {boolean} - True if Y should be treated as vowel
 */
function isYVowel(chars, index) {
  if (chars[index] !== 'Y') return false;

  const prev = index > 0 ? chars[index - 1] : null;
  const next = index < chars.length - 1 ? chars[index + 1] : null;
  const isVowel = c => c && VOWELS_SET.has(c);

  // At start: vowel only if no vowel follows
  if (!prev) return !isVowel(next);
  // At end: vowel only if no vowel precedes
  if (!next) return !isVowel(prev);
  // In middle: vowel when between two consonants
  return !isVowel(prev) && !isVowel(next);
}

/**
 * Normalizes name: uppercase, remove spaces, handle German umlauts
 * @param {string} name - Full name
 * @returns {string[]} - Array of normalized uppercase characters
 */
function normalizeNameToChars(name) {
  if (!name || typeof name !== 'string') return [];

  return name.toUpperCase()
    .replace(/Ä/g, 'AE')
    .replace(/Ö/g, 'OE')
    .replace(/Ü/g, 'UE')
    .replace(/ß/g, 'SS')
    .replace(/\s+/g, '')
    .split('')
    .filter(ch => PYTHAGOREAN_MAP[ch]); // Only keep valid letters
}

/**
 * Calculates Name Frequency (Soul Urge, Personality, Expression)
 * Based on Pythagorean numerology with Y-Vowel rule from Archive v3.0
 *
 * @param {string} fullName - Full name to analyze
 * @returns {Object} - Structured return per Gesetz 4
 */
export function calculateNameFrequency(fullName) {
  try {
    // Input validation
    if (!fullName || typeof fullName !== 'string') {
      return {
        success: false,
        error: 'Validation failed: fullName is required and must be a string'
      };
    }

    const chars = normalizeNameToChars(fullName);

    if (chars.length === 0) {
      return {
        success: false,
        error: 'Validation failed: no valid letters found in name'
      };
    }

    let soulSum = 0;      // Vowels only (Heart's Desire)
    let personalitySum = 0; // Consonants only
    let expressionSum = 0;   // All letters

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      const value = PYTHAGOREAN_MAP[char];

      // Check if vowel (including Y-as-vowel)
      const isVowel = VOWELS_SET.has(char) || (char === 'Y' && isYVowel(chars, i));

      // Soul Urge: vowels only
      if (isVowel) {
        soulSum += value;
      } else {
        // Personality: consonants only
        personalitySum += value;
      }

      // Expression: all letters
      expressionSum += value;
    }

    // Reduce to final digits (preserving Master Numbers 11, 22, 33)
    const soulUrge = reduceToDigit(soulSum);
    const personality = reduceToDigit(personalitySum);
    const expression = reduceToDigit(expressionSum);

    return {
      success: true,
      data: {
        soul_urge: soulUrge,
        personality: personality,
        expression: expression,
        original_name: fullName,
        raw_soul_sum: soulSum,
        raw_personality_sum: personalitySum,
        raw_expression_sum: expressionSum,
        letter_count: chars.length
      }
    };

  } catch (err) {
    return {
      success: false,
      error: `Name frequency calculation error: ${err.message}`
    };
  }
}
