import { jest } from '@jest/globals';

describe('orchestrator branch coverage', () => {
  afterEach(() => {
    jest.resetModules();
  });

  test('propagates legacy-engine validation failures unchanged', async () => {
    jest.unstable_mockModule('../shared/core/logic/frequency.js', () => ({
      calculateNameFrequency: () => ({ success: true, data: { ok: true } })
    }));
    jest.unstable_mockModule('../shared/core/logic/chronos_v2.js', () => ({
      calculateChronos: async () => ({ success: true, data: { ok: true } })
    }));
    jest.unstable_mockModule('../shared/core/logic/numerology/index.js', () => ({
      calculateFullProfile: () => ({ success: false, error: 'legacy validation failed' }),
      generateShareCard: () => ({}),
      generateTeaserAsset: () => ({}),
      generateOperatorReport: async () => ({})
    }));

    const { getUnifiedProfile } = await import('../shared/core/logic/orchestrator.js');
    const result = await getUnifiedProfile('Erik Klauss', '11.12.2005');

    expect(result).toEqual({
      success: false,
      error: 'legacy validation failed'
    });
  });

  test('wraps thrown engine errors in a unified orchestrator error', async () => {
    jest.unstable_mockModule('../shared/core/logic/frequency.js', () => ({
      calculateNameFrequency: () => ({ success: true, data: { ok: true } })
    }));
    jest.unstable_mockModule('../shared/core/logic/chronos_v2.js', () => ({
      calculateChronos: async () => {
        throw new Error('chronos exploded');
      }
    }));
    jest.unstable_mockModule('../shared/core/logic/numerology/index.js', () => ({
      calculateFullProfile: () => ({ success: true, data: { meta: { name: 'Erik', date: '11.12.2005' } } }),
      generateShareCard: () => ({}),
      generateTeaserAsset: () => ({}),
      generateOperatorReport: async () => ({})
    }));

    const { getUnifiedProfile } = await import('../shared/core/logic/orchestrator.js');
    const result = await getUnifiedProfile('Erik Klauss', '11.12.2005');

    expect(result).toEqual({
      success: false,
      error: 'Unified profile calculation failed: chronos exploded'
    });
  });

  test('keeps null engine payloads when frequency or chronos return unsuccessful results', async () => {
    jest.unstable_mockModule('../shared/core/logic/frequency.js', () => ({
      calculateNameFrequency: () => ({ success: false, error: 'frequency failed' })
    }));
    jest.unstable_mockModule('../shared/core/logic/chronos_v2.js', () => ({
      calculateChronos: async () => ({ success: false, error: 'chronos failed' })
    }));
    jest.unstable_mockModule('../shared/core/logic/numerology/index.js', () => ({
      calculateFullProfile: () => ({ success: true, data: { meta: { name: 'Erik', date: '11.12.2005' } } }),
      generateShareCard: () => ({}),
      generateTeaserAsset: () => ({}),
      generateOperatorReport: async () => ({})
    }));

    const { getUnifiedProfile } = await import('../shared/core/logic/orchestrator.js');
    const result = await getUnifiedProfile('Erik Klauss', '11.12.2005');

    expect(result.success).toBe(true);
    expect(result.data.engines).toEqual({
      frequency: null,
      chronos: null
    });
  });
});
