import {
  buildSynergyData,
  buildSynergyInterpretation,
  calculateLifePathFromBirthdate,
  clampPercentage,
  diffToResonance,
  getSynergyVerdict
} from '../shared/core/logic/synergy_contract.js';

describe('synergy_contract', () => {
  test('clampPercentage and diffToResonance normalize edge inputs', () => {
    expect(clampPercentage(NaN)).toBe(0);
    expect(clampPercentage(44.6)).toBe(45);
    expect(clampPercentage(140)).toBe(100);

    expect(diffToResonance(-2)).toBe(100);
    expect(diffToResonance(8)).toBe(0);
    expect(diffToResonance(Number.POSITIVE_INFINITY)).toBeNull();
  });

  test('getSynergyVerdict covers the full verdict ladder', () => {
    expect(getSynergyVerdict(85)).toBe('Starke Resonanz');
    expect(getSynergyVerdict(65)).toBe('Gute Harmonie');
    expect(getSynergyVerdict(45)).toBe('Balance moeglich');
    expect(getSynergyVerdict(25)).toBe('Wachstumspotenzial');
    expect(getSynergyVerdict(24)).toBe('Karmische Lektion');
  });

  test('buildSynergyInterpretation covers all narrative modes', () => {
    expect(buildSynergyInterpretation(90, ['Mentale Resonanz'], ['Tempo-Reibung'])).toContain('tragen');
    expect(buildSynergyInterpretation(70, ['Tiefe'], [])).toContain('tragende Verbindung');
    expect(buildSynergyInterpretation(50, [], ['Grenzen'])).toContain('aktiv moderiert');
    expect(buildSynergyInterpretation(10, [], [])).toContain('neutral');
  });

  test('buildSynergyData applies fallbacks and operator defaults', () => {
    const result = buildSynergyData({
      synergyScore: 106.2,
      mentalDiff: null,
      emotionalDiff: 2,
      operativDiff: null,
      personalityDiff: null,
      resonanceZones: ['Mentale Resonanz'],
      frictionPoints: ['Tempo-Reibung'],
      operatorA: { life_path: 4, label: 'A' },
      operatorB: { life_path: 6, label: 'B' }
    });

    expect(result.synergyScore).toBe(100);
    expect(result.lifePathResonance).toBe(100);
    expect(result.soulUrgeResonance).toBe(75);
    expect(result.expressionResonance).toBe(100);
    expect(result.personalityResonance).toBe(100);
    expect(result.cycleSync).toBe(92);
    expect(result.lifePath1).toBe(4);
    expect(result.lifePath2).toBe(6);
    expect(result.operators).toEqual({
      a: { life_path: 4, label: 'A' },
      b: { life_path: 6, label: 'B' }
    });
    expect(result.interpretation).toContain('Tempo-Reibung');
  });

  test('buildSynergyData respects explicit life path overrides without operator bundle', () => {
    const result = buildSynergyData({
      synergyScore: 48,
      mentalDiff: 4,
      emotionalDiff: 1,
      operativDiff: 3,
      personalityDiff: 2,
      resonanceZones: [],
      frictionPoints: ['Konflikt'],
      lifePath1: 7,
      lifePath2: 9,
      operatorA: { life_path: 1 }
    });

    expect(result.lifePath1).toBe(7);
    expect(result.lifePath2).toBe(9);
    expect(result.operators).toBeUndefined();
    expect(result.verdict).toBe('Balance moeglich');
  });

  test('calculateLifePathFromBirthdate handles valid invalid and master inputs', () => {
    expect(calculateLifePathFromBirthdate('1980-01-19')).toBe(11);
    expect(calculateLifePathFromBirthdate('03.01.1980')).toBe(22);
    expect(calculateLifePathFromBirthdate(new Date(Date.UTC(1980, 0, 28)))).toBe(11);

    expect(calculateLifePathFromBirthdate(new Date('invalid'))).toBeNull();
    expect(calculateLifePathFromBirthdate('31.02.1980')).toBeNull();
    expect(calculateLifePathFromBirthdate('   ')).toBeNull();
    expect(calculateLifePathFromBirthdate(42)).toBeNull();
  });
});
