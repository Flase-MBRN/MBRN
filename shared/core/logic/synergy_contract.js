import { MASTER_NUMBERS } from '../config/index.js';

const MASTER_NUMBERS_SET = new Set(MASTER_NUMBERS);
const MAX_DIFF = 8;

export function clampPercentage(value) {
  const numeric = Number.isFinite(value) ? value : 0;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

export function diffToResonance(diff) {
  if (!Number.isFinite(diff)) return null;
  return clampPercentage(100 - (Math.min(Math.max(diff, 0), MAX_DIFF) * 100) / MAX_DIFF);
}

export function getSynergyVerdict(score) {
  if (score >= 85) return 'Starke Resonanz';
  if (score >= 65) return 'Gute Harmonie';
  if (score >= 45) return 'Balance moeglich';
  if (score >= 25) return 'Wachstumspotenzial';
  return 'Karmische Lektion';
}

export function buildSynergyInterpretation(score, resonanceZones, frictionPoints) {
  const verdict = getSynergyVerdict(score);

  if (resonanceZones.length && frictionPoints.length) {
    return `${verdict}: ${resonanceZones.join(', ')} tragen, ${frictionPoints.join(', ')} brauchen bewusste Arbeit.`;
  }

  if (resonanceZones.length) {
    return `${verdict}: ${resonanceZones.join(', ')} bilden die tragende Verbindung.`;
  }

  if (frictionPoints.length) {
    return `${verdict}: ${frictionPoints.join(', ')} sollten aktiv moderiert werden.`;
  }

  return `${verdict}: Die Verbindung ist neutral und braucht Kontext statt Projektion.`;
}

export function buildSynergyData({
  synergyScore,
  mentalDiff = null,
  emotionalDiff = null,
  operativDiff = null,
  personalityDiff = null,
  resonanceZones = [],
  frictionPoints = [],
  operatorA = null,
  operatorB = null,
  lifePath1 = null,
  lifePath2 = null
}) {
  const score = clampPercentage(synergyScore);
  const lifePathResonance = diffToResonance(mentalDiff) ?? score;
  const soulUrgeResonance = diffToResonance(emotionalDiff) ?? score;
  const expressionResonance = diffToResonance(operativDiff) ?? score;
  const personalityResonance = diffToResonance(personalityDiff) ?? expressionResonance;
  const cycleSync = clampPercentage((lifePathResonance + soulUrgeResonance + expressionResonance) / 3);
  const verdict = getSynergyVerdict(score);
  const interpretation = buildSynergyInterpretation(score, resonanceZones, frictionPoints);

  return {
    synergy_score: score,
    synergyScore: score,
    compatibilityScore: score,
    mental_diff: mentalDiff,
    emotional_diff: emotionalDiff,
    operativ_diff: operativDiff,
    personality_diff: personalityDiff,
    lifePath1: lifePath1 ?? operatorA?.life_path ?? null,
    lifePath2: lifePath2 ?? operatorB?.life_path ?? null,
    lifePathResonance,
    soulResonance: soulUrgeResonance,
    soulUrgeResonance,
    personalityResonance,
    expressionResonance,
    cycleSync,
    resonance_zones: resonanceZones,
    resonanceZones,
    friction_points: frictionPoints,
    frictionPoints,
    verdict,
    interpretation,
    operators: operatorA && operatorB ? { a: operatorA, b: operatorB } : undefined
  };
}

export function calculateLifePathFromBirthdate(input) {
  const parts = normalizeBirthdateParts(input);
  if (!parts) return null;

  const digits = `${parts.year}${pad(parts.month)}${pad(parts.day)}`;
  return reducePreserveMaster(sumDigits(digits));
}

function normalizeBirthdateParts(input) {
  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) return null;
    return {
      year: input.getUTCFullYear(),
      month: input.getUTCMonth() + 1,
      day: input.getUTCDate()
    };
  }

  if (typeof input !== 'string') return null;

  const trimmed = input.trim();
  if (!trimmed) return null;

  const dotMatch = trimmed.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (dotMatch) {
    return validateDateParts({
      day: Number(dotMatch[1]),
      month: Number(dotMatch[2]),
      year: Number(dotMatch[3])
    });
  }

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return validateDateParts({
      year: Number(isoMatch[1]),
      month: Number(isoMatch[2]),
      day: Number(isoMatch[3])
    });
  }

  return null;
}

function validateDateParts(parts) {
  const utcDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  const isValid =
    utcDate.getUTCFullYear() === parts.year &&
    utcDate.getUTCMonth() === parts.month - 1 &&
    utcDate.getUTCDate() === parts.day;

  return isValid ? parts : null;
}

function reducePreserveMaster(value) {
  let current = value;
  while (current > 9 && !MASTER_NUMBERS_SET.has(current)) {
    current = sumDigits(String(current));
  }
  return current;
}

function sumDigits(value) {
  return String(value).split('').reduce((sum, digit) => sum + Number(digit), 0);
}

function pad(value) {
  return String(value).padStart(2, '0');
}
