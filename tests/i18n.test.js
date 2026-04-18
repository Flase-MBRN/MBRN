import { jest } from '@jest/globals';
import { i18n, t } from '../shared/core/i18n.js';

describe('i18n', () => {
  const originalNavigator = globalThis.navigator;
  const originalLocalStorage = globalThis.localStorage;

  beforeEach(() => {
    i18n.currentLang = 'en';
    i18n._listeners = [];
    i18n.reload();
    delete globalThis.localStorage;
    delete globalThis.navigator;
  });

  afterAll(() => {
    if (originalNavigator === undefined) {
      delete globalThis.navigator;
    } else {
      globalThis.navigator = originalNavigator;
    }

    if (originalLocalStorage === undefined) {
      delete globalThis.localStorage;
    } else {
      globalThis.localStorage = originalLocalStorage;
    }
  });

  test('exposes the supported language list and defaults to english when reset manually', () => {
    expect(i18n.getSupportedLanguages()).toEqual(['de', 'en']);
    i18n.currentLang = 'en';
    expect(i18n.t('loading')).toBe('Putting it in order...');
  });

  test('detects english when navigator is unavailable or unsupported', () => {
    expect(i18n._detectLanguage()).toBe('en');

    globalThis.navigator = { language: 'fr-FR' };
    expect(i18n._detectLanguage()).toBe('en');
  });

  test('setLanguage supports fallback, no-op, storage writes, and convenience translator', () => {
    const listener = jest.fn();
    const unsubscribe = i18n.onLanguageChange(listener);
    globalThis.localStorage = {
      setItem: jest.fn()
    };

    i18n.setLanguage('de');
    i18n.setLanguage('de');
    i18n.setLanguage('fr');
    unsubscribe();
    i18n.setLanguage('en');

    expect(listener).toHaveBeenCalledTimes(2);
    expect(globalThis.localStorage.setItem).toHaveBeenCalledWith('mbrn_lang', 'de');
    expect(globalThis.localStorage.setItem).toHaveBeenCalledWith('mbrn_lang', 'en');
    expect(t('loading')).toBe('Putting it in order...');
  });

  test('translates nested keys with interpolation, english fallback, and missing-key fallback', () => {
    i18n.currentLang = 'de';
    i18n.translations.de.greeting = { hello: 'Hallo {{name}}' };

    expect(i18n.t('greeting.hello', { name: 'Erik' })).toBe('Hallo Erik');
    expect(i18n.t('routes.dashboard')).toBe('Dashboard');
    expect(i18n.t('does.not.exist')).toBe('does.not.exist');

    i18n.currentLang = 'fr';
    expect(i18n.t('routes.dashboard')).toBe('routes.dashboard');
  });

  test('returns the key when final translation values are missing in both languages', () => {
    i18n.currentLang = 'de';
    i18n.translations.de.partial = undefined;
    i18n.translations.en.partial = undefined;

    expect(i18n.t('partial')).toBe('partial');
  });

  test('fallbackToEn and getArray handle invalid shapes and fallback arrays', () => {
    i18n.currentLang = 'de';
    expect(i18n._fallbackToEn('terminal.sequence')).toEqual(expect.any(Array));
    expect(i18n._fallbackToEn('missing.deep.key')).toBeNull();

    expect(i18n.getArray('terminal.sequence')).toEqual(expect.any(Array));
    expect(i18n.getArray('missing.deep.key')).toEqual([]);

    i18n.translations.de.terminal.sequence = 'not-an-array';
    expect(i18n.getArray('terminal.sequence')).toEqual(i18n.translations.en.terminal.sequence);
  });

  test('getArray returns empty arrays when english fallbacks are invalid objects or non-arrays', () => {
    i18n.currentLang = 'de';

    i18n.translations.de.terminal = 'broken';
    i18n.translations.en.terminal = { sequence: 'still-broken' };
    expect(i18n.getArray('terminal.sequence')).toEqual([]);

    i18n.translations.de.terminal = { sequence: 'not-an-array' };
    i18n.translations.en.terminal = 'missing-object-shape';
    expect(i18n.getArray('terminal.sequence')).toEqual([]);
  });

  test('listener errors are isolated and reload restores config translations', () => {
    const crashingListener = jest.fn(() => {
      throw new Error('listener exploded');
    });
    const healthyListener = jest.fn();
    i18n.onLanguageChange(crashingListener);
    i18n.onLanguageChange(healthyListener);
    i18n.translations = {};

    expect(() => i18n.setLanguage('de')).not.toThrow();
    expect(healthyListener).toHaveBeenCalledWith('de');

    i18n.reload();
    expect(i18n.t('loading')).toBe('Ich ordne gerade alles.');
  });

  test('_interpolate returns non-string values unchanged', () => {
    expect(i18n._interpolate(123, { name: 'Erik' })).toBe(123);
    expect(i18n._interpolate(null, { name: 'Erik' })).toBe(null);
    expect(i18n._interpolate(undefined, { name: 'Erik' })).toBe(undefined);
    expect(i18n._interpolate({ key: 'value' }, { name: 'Erik' })).toEqual({ key: 'value' });
  });

  test('_fallbackToEn handles null/undefined intermediate values', () => {
    i18n.translations.en = { nested: { value: 'found' } };
    i18n.currentLang = 'de';

    expect(i18n._fallbackToEn('nested.nonexistent.deep')).toBeNull();
    expect(i18n._fallbackToEn('')).toBeUndefined();
  });

  test('getArray handles deep nested invalid values and missing en data', () => {
    i18n.currentLang = 'de';
    i18n.translations.de = { deep: { nested: null } };
    i18n.translations.en = { deep: { nested: undefined } };

    expect(i18n.getArray('deep.nested.array')).toEqual([]);

    delete i18n.translations.en;
    expect(i18n.getArray('any.key')).toEqual([]);
  });

  test('onLanguageChange cleanup removes listeners correctly', () => {
    const listener1 = jest.fn();
    const listener2 = jest.fn();

    const unsub1 = i18n.onLanguageChange(listener1);
    const unsub2 = i18n.onLanguageChange(listener2);

    i18n.setLanguage('de');
    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);

    unsub1();
    i18n.setLanguage('en');
    expect(listener1).toHaveBeenCalledTimes(1); // Not called again
    expect(listener2).toHaveBeenCalledTimes(2); // Called again

    unsub2();
    i18n.setLanguage('de');
    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(2); // Not called again
  });

  test('t returns key when both languages completely miss the key', () => {
    i18n.currentLang = 'de';
    i18n.translations.de = {};
    i18n.translations.en = {};

    expect(i18n.t('completely.missing.key')).toBe('completely.missing.key');
  });

  test('setLanguage handles edge case when translations are corrupted', () => {
    i18n.translations = null;
    i18n.currentLang = 'en';

    expect(() => i18n.setLanguage('de')).not.toThrow();
  });
});
