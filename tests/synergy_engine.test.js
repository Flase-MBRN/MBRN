import { calculateSynergy } from '../shared/core/logic/synergy_engine.js';

describe('synergy_engine', () => {
  test('returns symmetric compatibility for swapped birthdates', () => {
    const first = calculateSynergy('11.12.2005', '28.03.2008');
    const second = calculateSynergy('28.03.2008', '11.12.2005');

    expect(first.success).toBe(true);
    expect(second.success).toBe(true);
    expect(first.data.synergyScore).toBe(second.data.synergyScore);
    expect(first.data.lifePath1).toBe(second.data.lifePath2);
    expect(first.data.lifePath2).toBe(second.data.lifePath1);
  });

  test('rejects invalid birthdate formats', () => {
    expect(calculateSynergy('31.02.2005', '28.03.2008')).toEqual({
      success: false,
      data: null,
      error: 'Invalid birthdate. Use DD.MM.YYYY or YYYY-MM-DD.'
    });
    expect(calculateSynergy(null, '28.03.2008')).toEqual({
      success: false,
      data: null,
      error: 'Invalid birthdate. Use DD.MM.YYYY or YYYY-MM-DD.'
    });
  });

  test('preserves master numbers while deriving life paths', () => {
    const result = calculateSynergy('29.09.2000', '11.12.2005');

    expect(result.success).toBe(true);
    expect(result.data.lifePath1).toBe(22);
    expect(result.data.lifePath2).toBe(3);
    expect(result.data.synergyScore).toBeGreaterThanOrEqual(1);
    expect(result.data.synergyScore).toBeLessThanOrEqual(100);
  });

  test('accepts ISO strings and Date objects in the same call', () => {
    const result = calculateSynergy('1980-01-19', new Date(Date.UTC(1980, 0, 19)));

    expect(result.success).toBe(true);
    expect(result.data.lifePath1).toBe(11);
    expect(result.data.lifePath2).toBe(11);
    expect(result.data.synergyScore).toBe(100);
    expect(result.data.resonanceZones).toContain('Hohe mentale Synchronitaet');
    expect(result.data.resonanceZones).toContain('Gleiche Lebenszahl-Dynamik');
  });

  test('adds friction points for widely separated root numbers', () => {
    const result = calculateSynergy('1990-08-15', '1999-09-09');

    expect(result.success).toBe(true);
    expect(result.data.lifePath1).toBe(33);
    expect(result.data.lifePath2).toBe(1);
    expect(result.data.frictionPoints).toContain('Unterschiedliche Lebensaufgaben');
    expect(result.data.resonanceZones).toEqual([]);
  });

  test('handles one-master pairs without identical master roots', () => {
    const result = calculateSynergy('2000-09-29', '1990-08-04');

    expect(result.success).toBe(true);
    expect(result.data.lifePath1).toBe(22);
    expect(result.data.lifePath2).toBe(4);
    expect(result.data.synergyScore).toBe(98);
  });

  test('rejects unsupported slash formats and invalid Date objects', () => {
    expect(calculateSynergy('1988/02/29', '1990-08-04')).toEqual({
      success: false,
      data: null,
      error: 'Invalid birthdate. Use DD.MM.YYYY or YYYY-MM-DD.'
    });

    expect(calculateSynergy(new Date('invalid'), '1990-08-04')).toEqual({
      success: false,
      data: null,
      error: 'Invalid birthdate. Use DD.MM.YYYY or YYYY-MM-DD.'
    });
  });
});
