import { jest } from '@jest/globals';

describe('synergy branch coverage', () => {
  afterEach(() => {
    jest.resetModules();
  });

  test('rejects raw operator input when birthDate cannot produce a life path', async () => {
    const { calculateSynergy } = await import('../shared/core/logic/synergy.js');

    const result = await calculateSynergy(
      { name: 'Erik Klauss', birthDate: '31.02.2000' },
      { life_path: 2, expression: 4, soul: 6 }
    );

    expect(result).toEqual({
      success: false,
      error: 'Validation failed for operatorA: invalid birthDate'
    });
  });

  test('rejects non-object operator payloads before normalization', async () => {
    const { calculateSynergy } = await import('../shared/core/logic/synergy.js');

    const result = await calculateSynergy([], { life_path: 2, expression: 4, soul: 6 });

    expect(result).toEqual({
      success: false,
      error: 'Validation failed for operatorA: missing data must be an object'
    });
  });

  test('rejects raw operator input when frequency normalization fails', async () => {
    const { calculateSynergy } = await import('../shared/core/logic/synergy.js');

    const result = await calculateSynergy(
      { name: '1234 !!!', birthDate: '11.12.2005' },
      { life_path: 2, expression: 4, soul: 6 }
    );

    expect(result).toEqual({
      success: false,
      error: 'Validation failed for operatorA: Validation failed: no valid letters found in name'
    });
  });

  test('wraps unexpected internal failures in a structured error', async () => {
    jest.unstable_mockModule('../shared/core/logic/helpers.js', () => ({
      validateInput: () => ({ valid: true, missing: [] }),
      diff: () => 1
    }));
    jest.unstable_mockModule('../shared/core/logic/frequency.js', () => ({
      calculateNameFrequency: () => ({ success: true, data: { expression: 1, soul_urge: 1, personality: 1 } })
    }));
    jest.unstable_mockModule('../shared/core/logic/synergy_contract.js', () => ({
      buildSynergyData: () => {
        throw new Error('contract boom');
      },
      calculateLifePathFromBirthdate: () => 1
    }));

    const { calculateSynergy } = await import('../shared/core/logic/synergy.js');
    const result = await calculateSynergy(
      { life_path: 1, expression: 1, soul: 1 },
      { life_path: 1, expression: 1, soul: 1 }
    );

    expect(result).toEqual({
      success: false,
      error: 'Synergy calculation error: contract boom'
    });
  });
});
