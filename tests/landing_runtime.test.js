import { beforeEach, describe, expect, test } from '@jest/globals';
import { saveLandingProfile } from '../shared/application/frontend_os/landing_runtime.js';
import { storage } from '../shared/core/storage/index.js';

describe('landing runtime', () => {
  beforeEach(() => {
    const backend = new Map();

    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: (key) => (backend.has(key) ? backend.get(key) : null),
        setItem: (key, value) => backend.set(key, value),
        removeItem: (key) => backend.delete(key)
      },
      configurable: true
    });
  });

  test('landing profile handoff also primes numerology input for the core surface', async () => {
    await saveLandingProfile({
      name: 'Erik Example',
      birthDate: '01.01.1990',
      lifePath: 11
    });

    expect(storage.get('last_numerology_calc')).toEqual(expect.objectContaining({
      success: true,
      data: expect.objectContaining({
        name: 'Erik Example',
        birthDate: '01.01.1990',
        lifePath: 11
      })
    }));
    expect(storage.get('numerology_input')).toEqual({
      success: true,
      data: {
        name: 'Erik Example',
        birthDate: '01.01.1990'
      }
    });
  });
});
