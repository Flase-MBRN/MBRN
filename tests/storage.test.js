import { jest } from '@jest/globals';
import { storage } from '../shared/core/storage/index.js';

describe('storage', () => {
  afterEach(() => {
    delete globalThis.localStorage;
  });

  test('set/get/remove handle unavailable backend', async () => {
    await expect(storage.set('profile', { id: 1 })).resolves.toEqual({
      success: false,
      error: 'LocalStorage unavailable'
    });
    expect(storage.get('profile')).toEqual({
      success: true,
      data: null,
      unavailable: true
    });
    expect(storage.remove('profile')).toEqual({
      success: false,
      error: 'LocalStorage unavailable'
    });
  });

  test('set maps quota errors and generic write failures', async () => {
    const setItem = jest.fn()
      .mockImplementationOnce(() => {
        const error = new Error('quota');
        error.name = 'QuotaExceededError';
        throw error;
      })
      .mockImplementationOnce(() => {
        throw new Error('write exploded');
      })
      .mockImplementation(() => {});

    globalThis.localStorage = {
      setItem,
      getItem: jest.fn(),
      removeItem: jest.fn()
    };

    await expect(storage.set('quota', { x: 1 })).resolves.toEqual({
      success: false,
      error: 'LocalStorage Quota Exceeded'
    });
    await expect(storage.set('generic', { x: 1 })).resolves.toEqual({
      success: false,
      error: 'write exploded'
    });
    await expect(storage.set('ok', { x: 1 })).resolves.toEqual({
      success: true,
      data: null
    });
  });

  test('queue keeps sequential ordering even when tasks resolve asynchronously', async () => {
    const writes = [];
    globalThis.localStorage = {
      setItem: jest.fn((key) => {
        writes.push(key);
      }),
      getItem: jest.fn(),
      removeItem: jest.fn()
    };

    await Promise.all([
      storage.set('first', { n: 1 }),
      storage.set('second', { n: 2 }),
      storage.set('third', { n: 3 })
    ]);

    expect(writes).toEqual([
      'mbrn_first',
      'mbrn_second',
      'mbrn_third'
    ]);
  });

  test('get handles hit, miss, and parse/read errors', () => {
    globalThis.localStorage = {
      setItem: jest.fn(),
      getItem: jest.fn()
        .mockReturnValueOnce(JSON.stringify({ id: 1 }))
        .mockReturnValueOnce(null)
        .mockImplementationOnce(() => {
          throw new Error('read exploded');
        }),
      removeItem: jest.fn()
    };

    expect(storage.get('profile')).toEqual({
      success: true,
      data: { id: 1 }
    });
    expect(storage.get('missing')).toEqual({
      success: true,
      data: null
    });
    expect(storage.get('broken')).toEqual({
      success: false,
      error: 'JSON Parse Error oder Lese-Fehler'
    });
  });

  test('remove handles success and failure', () => {
    globalThis.localStorage = {
      setItem: jest.fn(),
      getItem: jest.fn(),
      removeItem: jest.fn()
        .mockImplementationOnce(() => {})
        .mockImplementationOnce(() => {
          throw new Error('remove exploded');
        })
    };

    expect(storage.remove('profile')).toEqual({
      success: true,
      data: null
    });
    expect(storage.remove('profile')).toEqual({
      success: false,
      error: 'remove exploded'
    });
  });

  test('set handles NS_ERROR_DOM_QUOTA_REACHED error variant', async () => {
    globalThis.localStorage = {
      setItem: jest.fn().mockImplementation(() => {
        const error = new Error('quota reached');
        error.name = 'NS_ERROR_DOM_QUOTA_REACHED';
        throw error;
      }),
      getItem: jest.fn(),
      removeItem: jest.fn()
    };

    await expect(storage.set('bigdata', { data: 'x'.repeat(10000) })).resolves.toEqual({
      success: false,
      error: 'LocalStorage Quota Exceeded'
    });
  });

  test('queue rejects with error when storage operation fails critically', async () => {
    const criticalError = new Error('Storage backend crashed');
    globalThis.localStorage = {
      setItem: jest.fn().mockImplementation(() => {
        throw criticalError;
      }),
      getItem: jest.fn(),
      removeItem: jest.fn()
    };

    const result = await storage.set('key', { value: 1 });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Storage backend crashed');
  });

  test('get distinguishes between null item and missing key', () => {
    globalThis.localStorage = {
      getItem: jest.fn()
        .mockReturnValueOnce(null)  // Key doesn't exist
        .mockReturnValueOnce('null')  // Key exists with null value
        .mockReturnValueOnce('"explicit_null"')  // Key with string "null"
    };

    const result1 = storage.get('missing');
    expect(result1.success).toBe(true);
    expect(result1.data).toBeNull();

    const result2 = storage.get('null_value');
    expect(result2.success).toBe(true);
    expect(result2.data).toBeNull();

    const result3 = storage.get('string_null');
    expect(result3.success).toBe(true);
    expect(result3.data).toBe('explicit_null');
  });
});
