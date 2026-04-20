import { afterEach, describe, expect, test } from '@jest/globals';
import { clearMBRNLocalData, listMBRNKeys } from '../shared/core/legal_storage.js';

afterEach(() => {
  delete globalThis.localStorage;
});

describe('legal_storage', () => {
  test('listMBRNKeys returns only prefixed keys', () => {
    const store = new Map([
      ['mbrn_profile', '{}'],
      ['mbrn_last_numerology_calc', '{}'],
      ['foreign_theme', 'dark']
    ]);

    globalThis.localStorage = {
      get length() {
        return store.size;
      },
      key: (index) => Array.from(store.keys())[index] ?? null,
      removeItem: (key) => store.delete(key)
    };

    expect(listMBRNKeys()).toEqual({
      success: true,
      data: ['mbrn_profile', 'mbrn_last_numerology_calc']
    });
  });

  test('clearMBRNLocalData removes only mbrn keys', () => {
    const store = new Map([
      ['mbrn_profile', '{}'],
      ['mbrn_last_numerology_calc', '{}'],
      ['foreign_theme', 'dark']
    ]);

    globalThis.localStorage = {
      get length() {
        return store.size;
      },
      key: (index) => Array.from(store.keys())[index] ?? null,
      removeItem: (key) => store.delete(key)
    };

    const result = clearMBRNLocalData();

    expect(result).toEqual({
      success: true,
      data: ['mbrn_profile', 'mbrn_last_numerology_calc']
    });
    expect(store.has('foreign_theme')).toBe(true);
    expect(store.has('mbrn_profile')).toBe(false);
    expect(store.has('mbrn_last_numerology_calc')).toBe(false);
  });
});
