/**
 * /shared/core/logic/numerology/core.js
 * NUMEROLOGY CORE — Mathematical Foundation
 * 
 * Persona: Flase (Anonym, präzise)
 * Responsibility: All base mathematical operations and identity calculations
 */

import { MASTER_NUMBERS } from '../../config.js';

/* ─── CONSTANTS ────────────────────────────────────────────────────────── */

// Re-export for downstream consumers ( barrel export compatibility )
export { MASTER_NUMBERS };

export const PYTHAGORAS = {
  1: ['A','J','S'], 2: ['B','K','T'], 3: ['C','L','U'],
  4: ['D','M','V'], 5: ['E','N','W'], 6: ['F','O','X'],
  7: ['G','P','Y'], 8: ['H','Q','Z'], 9: ['I','R'],
};

export const VOWELS = new Set(['A','E','I','O','U']);

// Convert to Set for O(1) lookups while using central definition
export const MASTER_NUMBERS_SET = new Set(MASTER_NUMBERS);

/* ─── MATHEMATICAL CORE FUNCTIONS ─────────────────────────────────────── */

export function digitSum(n) {
  return String(n).split('').reduce((s, d) => s + parseInt(d, 10), 0);
}

export function reduceForceSingle(n) {
  if (n === 0) return 0;
  while (n > 9) n = digitSum(n);
  return n;
}

export function reducePreserveMaster(n) {
  if (n === 0) return 0;
  if (MASTER_NUMBERS_SET.has(n)) return n;
  while (n > 9) { 
    n = digitSum(n); 
    if (MASTER_NUMBERS_SET.has(n)) break; 
  }
  return n;
}

export function formatValue(raw) {
  const normal = reduceForceSingle(raw);
  const master = reducePreserveMaster(raw);
  if (MASTER_NUMBERS_SET.has(master) && master !== normal) return `${normal}/${master}`;
  return String(normal);
}

/* ─── NAME NORMALIZATION ─────────────────────────────────────────────── */

export function normalizeName(name) {
  return name.toUpperCase()
    .replace(/Ä/g,'AE').replace(/Ö/g,'OE')
    .replace(/Ü/g,'UE').replace(/ß/g,'SS');
}

export function charToNumber(char) {
  for (const [num, chars] of Object.entries(PYTHAGORAS)) {
    if (chars.includes(char)) return parseInt(num, 10);
  }
  return 0;
}

export function nameToNumbers(name) {
  if (!name || typeof name !== 'string') return [];
  return normalizeName(name).replace(/\s+/g,'').split('')
    .map(ch => charToNumber(ch)).filter(n => n > 0);
}

/* ─── Y-VOWEL RULE ────────────────────────────────────────────────────── */

export function isYVowel(chars, index) {
  if (chars[index] !== 'Y') return false;
  const prev = index > 0 ? chars[index - 1] : null;
  const next = index < chars.length - 1 ? chars[index + 1] : null;
  const isV = c => c && VOWELS.has(c);
  if (!prev) return !isV(next);
  if (!next) return !isV(prev);
  return !isV(prev) && !isV(next);
}

/* ─── CORE CALCULATIONS ───────────────────────────────────────────────── */

export function calculateLifePathTotal(dateStr) {
  const [dStr, mStr, yStr] = dateStr.split('.');
  const day   = reducePreserveMaster(parseInt(dStr, 10));
  const month = reducePreserveMaster(parseInt(mStr, 10));
  const year  = reducePreserveMaster(digitSum(parseInt(yStr, 10)));
  return reducePreserveMaster(day + month + year);
}

export function calculateSoulUrgeTotal(name) {
  const chars = normalizeName(name).replace(/\s+/g,'').split('');
  return chars.reduce((sum, ch, i) => {
    if (VOWELS.has(ch) || (ch === 'Y' && isYVowel(chars, i))) {
      return sum + charToNumber(ch);
    }
    return sum;
  }, 0);
}

export function calculatePersonalityTotal(name) {
  const chars = normalizeName(name).replace(/\s+/g,'').split('');
  return chars.reduce((sum, ch, i) => {
    const isVowelHere = VOWELS.has(ch) || (ch === 'Y' && isYVowel(chars, i));
    if (!isVowelHere && charToNumber(ch) > 0) return sum + charToNumber(ch);
    return sum;
  }, 0);
}

export function calculateExpressionTotal(name) {
  return nameToNumbers(name).reduce((s, n) => s + n, 0);
}
