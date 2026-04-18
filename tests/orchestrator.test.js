import { jest } from '@jest/globals';

const mockDate = new Date('2026-04-18T10:11:12.000Z');

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(mockDate);
});

afterAll(() => {
  jest.useRealTimers();
});

describe('orchestrator', () => {
  test('builds a unified profile and normalizes ISO birthdates for legacy + chronos engines', async () => {
    const { getUnifiedProfile } = await import('../shared/core/logic/orchestrator.js');

    const result = await getUnifiedProfile('Erik Klauss', '2005-12-11');

    expect(result.success).toBe(true);
    expect(result.data).toEqual(expect.objectContaining({
      engines: expect.objectContaining({
        frequency: expect.any(Object),
        chronos: expect.any(Object)
      }),
      legacy: expect.objectContaining({
        full_profile: expect.objectContaining({
          meta: { name: 'Erik Klauss', date: '11.12.2005' }
        }),
        pdf_config: expect.objectContaining({
          title: 'MBRN Operator Report',
          version: '3.0-unified',
          generatedAt: mockDate.toISOString()
        })
      }),
      meta: {
        name: 'Erik Klauss',
        birthDate: '11.12.2005',
        calculatedAt: mockDate.toISOString(),
        version: '3.0-unified',
        enginesUsed: ['legacy_v2.5', 'm15_chronos', 'm16_frequency']
      }
    }));
  });

  test('returns validation errors for missing required inputs', async () => {
    const { getUnifiedProfile } = await import('../shared/core/logic/orchestrator.js');

    await expect(getUnifiedProfile('', '11.12.2005')).resolves.toEqual({
      success: false,
      error: 'Validation failed: name must be at least 2 characters'
    });
    await expect(getUnifiedProfile('Erik Klauss', '')).resolves.toEqual({
      success: false,
      error: 'Validation failed: birthDate is required'
    });
  });

  test('re-exports the canonical report generators', async () => {
    const { generateShareCard, generateOperatorReport } = await import('../shared/core/logic/orchestrator.js');

    expect(typeof generateShareCard).toBe('function');
    expect(typeof generateOperatorReport).toBe('function');
  });
});
