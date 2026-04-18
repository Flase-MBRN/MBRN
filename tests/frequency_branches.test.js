import { jest } from '@jest/globals';

describe('frequency branch coverage', () => {
  afterEach(() => {
    jest.resetModules();
  });

  test('treats Y as vowel or consonant depending on position and neighbors', async () => {
    const { calculateNameFrequency } = await import('../shared/core/logic/frequency.js');

    expect(calculateNameFrequency('Ynn').data).toEqual(expect.objectContaining({
      raw_soul_sum: 7,
      raw_personality_sum: 10
    }));

    expect(calculateNameFrequency('Ya').data).toEqual(expect.objectContaining({
      raw_soul_sum: 1,
      raw_personality_sum: 7
    }));

    expect(calculateNameFrequency('Ty').data).toEqual(expect.objectContaining({
      raw_soul_sum: 7,
      raw_personality_sum: 2
    }));

    expect(calculateNameFrequency('Ay').data).toEqual(expect.objectContaining({
      raw_soul_sum: 1,
      raw_personality_sum: 7
    }));

    expect(calculateNameFrequency('Lyn').data).toEqual(expect.objectContaining({
      raw_soul_sum: 7,
      raw_personality_sum: 8
    }));

    expect(calculateNameFrequency('Maya').data).toEqual(expect.objectContaining({
      raw_soul_sum: 2,
      raw_personality_sum: 11
    }));
  });

  test('rejects names that normalize to no valid letters', async () => {
    const { calculateNameFrequency } = await import('../shared/core/logic/frequency.js');

    expect(calculateNameFrequency('1234 !!!')).toEqual({
      success: false,
      error: 'Validation failed: no valid letters found in name'
    });
  });

  test('surfaces reducer failures through the catch branch', async () => {
    jest.unstable_mockModule('../shared/core/logic/helpers.js', () => ({
      reduceToDigit: () => {
        throw new Error('forced reducer failure');
      }
    }));

    const { calculateNameFrequency } = await import('../shared/core/logic/frequency.js');
    const result = calculateNameFrequency('Ynn');

    expect(result).toEqual({
      success: false,
      error: 'Name frequency calculation error: forced reducer failure'
    });
  });
});
