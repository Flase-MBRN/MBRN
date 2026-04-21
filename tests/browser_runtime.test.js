import {
  getBrowserHref,
  getBrowserLanguage,
  getBrowserNavigator,
  getBrowserOrigin,
  getBrowserUserAgent,
  getBrowserWindow,
  hasBrowserRuntime,
  hasBrowserWindow,
  isGitHubPagesRuntime,
  isBrowserOnline
} from '../shared/core/browser_runtime.js';

describe('browser_runtime', () => {
  const originalWindow = globalThis.window;
  const originalNavigator = globalThis.navigator;

  afterEach(() => {
    if (originalWindow === undefined) {
      delete globalThis.window;
    } else {
      globalThis.window = originalWindow;
    }

    if (originalNavigator === undefined) {
      delete globalThis.navigator;
    } else {
      globalThis.navigator = originalNavigator;
    }
  });

  test('returns safe defaults without browser globals', () => {
    delete globalThis.window;
    delete globalThis.navigator;

    expect(getBrowserWindow()).toBeNull();
    expect(getBrowserNavigator()).toBeNull();
    expect(hasBrowserWindow()).toBe(false);
    expect(hasBrowserRuntime()).toBe(false);
    expect(isBrowserOnline()).toBe(true);
    expect(getBrowserLanguage()).toBe('unknown');
    expect(getBrowserUserAgent()).toBe('unknown');
    expect(getBrowserOrigin()).toBe('http://localhost');
    expect(getBrowserHref()).toBe('');
    expect(isGitHubPagesRuntime()).toBe(false);
  });

  test('reads live values from browser globals', () => {
    globalThis.window = {
      location: {
        origin: 'https://mbrn.test',
        href: 'https://mbrn.test/dashboard'
      }
    };
    globalThis.navigator = {
      onLine: false,
      language: 'de-DE',
      userAgent: 'JestBrowser/1.0'
    };

    expect(hasBrowserWindow()).toBe(true);
    expect(hasBrowserRuntime()).toBe(true);
    expect(isBrowserOnline()).toBe(false);
    expect(getBrowserLanguage()).toBe('de-DE');
    expect(getBrowserUserAgent()).toBe('JestBrowser/1.0');
    expect(getBrowserOrigin()).toBe('https://mbrn.test');
    expect(getBrowserHref()).toBe('https://mbrn.test/dashboard');
    expect(isGitHubPagesRuntime()).toBe(false);
  });

  test('detects GitHub Pages origins', () => {
    globalThis.window = {
      location: {
        origin: 'https://flase-mbrn.github.io',
        href: 'https://flase-mbrn.github.io/MBRN/dashboard/index.html'
      }
    };
    globalThis.navigator = {
      onLine: true,
      language: 'de-DE',
      userAgent: 'Firefox'
    };

    expect(isGitHubPagesRuntime()).toBe(true);
  });
});
