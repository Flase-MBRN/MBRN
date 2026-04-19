import {
  calculateFullProfile,
  DEEP_DECODE_MATRIX,
  OPERATOR_MATRIX,
  generateShareCard
} from '../shared/core/logic/numerology/index.js';

describe('numerology/index', () => {
  test('builds a complete numerology profile for valid inputs', () => {
    const result = calculateFullProfile('Erik Klauss', '11.12.2005');

    expect(result.success).toBe(true);
    expect(result.data).toEqual(expect.objectContaining({
      meta: { name: 'Erik Klauss', date: '11.12.2005' },
      core: expect.objectContaining({
        lifePath: expect.any(String),
        soulUrge: expect.any(String),
        personality: expect.any(String),
        expression: expect.any(String)
      }),
      loShu: expect.any(Object),
      quantum: expect.any(Object),
      cycles: expect.any(Object),
      pinnacles: expect.any(Object),
      challenges: expect.any(Object),
      karma: expect.any(Object),
      bridges: expect.any(Object),
      additional: expect.objectContaining({
        birthday: expect.any(String),
        maturity: expect.any(String)
      })
    }));
  });

  test('rejects invalid names and invalid dates', () => {
    expect(calculateFullProfile('A', '11.12.2005')).toEqual({
      success: false,
      error: 'Name zu kurz'
    });
    expect(calculateFullProfile('Erik', '2005-12-11')).toEqual({
      success: false,
      error: 'Ungültiges Date-Format (TT.MM.JJJJ)'
    });
  });

  test('re-exports metadata and share-card generation from the canonical barrel', () => {
    const card = generateShareCard({
      meta: { name: 'Erik Klauss' },
      quantum: { score: 88 },
      core: {
        lifePath: '1',
        soulUrge: '9',
        expression: '9'
      },
      additional: { maturity: '2' }
    });

    expect(OPERATOR_MATRIX.lifePath[1].title).toBeTruthy();
    expect(card).toEqual(expect.objectContaining({
      width: 1080,
      height: 1920,
      header: expect.objectContaining({ eyebrow: 'PATTERN INTELLIGENCE' }),
      name: expect.objectContaining({ text: 'ERIK KLAUSS' }),
      score: expect.objectContaining({ value: 88, label: 'PATTERN SCORE' }),
      coreNumbers: expect.arrayContaining([
        expect.objectContaining({ label: 'LEBENSZAHL' }),
        expect.objectContaining({ label: 'SEELENZAHL' })
      ])
    }));
  });

  test('re-exported metadata helpers provide fallback strategies', () => {
    expect(OPERATOR_MATRIX.getStrategy(1)).toContain('Initiative');
    expect(OPERATOR_MATRIX.getStrategy(999)).toBe('Handle konsequent nach deiner Konfiguration.');
    expect(DEEP_DECODE_MATRIX.getStrategicTips(4)).toContain('Strukturen');
    expect(DEEP_DECODE_MATRIX.getStrategicTips(999)).toBe('Handle konsequent nach deinem Bauplan.');
  });
});
