import { jest } from '@jest/globals';

async function loadNavigation() {
  jest.resetModules();

  const stateMock = {
    emit: jest.fn()
  };

  const touchManagerMock = {
    init: jest.fn()
  };

  const domMock = {
    clear: jest.fn(),
    createEl: jest.fn(() => ({
      addEventListener: jest.fn(),
      setAttribute: jest.fn(),
      classList: { toggle: jest.fn() }
    })),
    normalizeDocumentText: jest.fn()
  };

  const renderPolicyLinksMock = jest.fn();

  const mockLocation = {
    href: '',
    pathname: '/'
  };

  Object.defineProperty(globalThis, 'window', {
    value: {
      location: mockLocation,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      innerWidth: 1024
    },
    configurable: true,
    writable: true
  });

  Object.defineProperty(globalThis, 'document', {
    value: {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      createElement: jest.fn(() => ({
        setAttribute: jest.fn(),
        classList: { toggle: jest.fn() },
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      })),
      getElementById: jest.fn(() => ({ replaceChildren: jest.fn() })),
      querySelector: jest.fn(() => null),
      querySelectorAll: jest.fn(() => []),
      hidden: false,
      body: {
        contains: jest.fn(() => true),
        appendChild: jest.fn(),
        removeChild: jest.fn(),
        classList: { toggle: jest.fn(), remove: jest.fn() }
      }
    },
    configurable: true,
    writable: true
  });

  Object.defineProperty(globalThis, 'navigator', {
    value: {},
    configurable: true,
    writable: true
  });

  await jest.unstable_mockModule('../shared/core/state/index.js', () => ({
    state: stateMock
  }));

  await jest.unstable_mockModule('../pillars/frontend_os/navigation/touch_manager.js', () => ({
    touchManager: touchManagerMock
  }));

  await jest.unstable_mockModule('../shared/ui/dom_utils.js', () => ({
    dom: domMock
  }));

  await jest.unstable_mockModule('../pillars/frontend_os/shell/legal_blocks.js', () => ({
    renderPolicyLinks: renderPolicyLinksMock
  }));

  const { nav, getCurrentRoute, getNavigationEntries } = await import('../pillars/frontend_os/navigation/index.js');

  return {
    nav,
    getCurrentRoute,
    getNavigationEntries,
    stateMock,
    touchManagerMock,
    domMock,
    mockLocation
  };
}

describe('frontend_os navigation', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  afterEach(() => {
    delete globalThis.window;
    delete globalThis.document;
    delete globalThis.navigator;
  });

  test('navigateTo destroys the current app before redirecting', async () => {
    const { nav, mockLocation } = await loadNavigation();
    const mockDestroy = jest.fn();
    const mockApp = { destroy: mockDestroy, name: 'TestApp' };

    nav.registerCurrentApp(mockApp);
    nav.navigateTo('dashboard');

    expect(mockDestroy).toHaveBeenCalledTimes(1);
    expect(nav._currentApp).toBeNull();
    expect(mockLocation.href).toContain('dashboard');
  });

  test('navigateTo resolves dimension routes as first-class targets', async () => {
    const { nav, mockLocation } = await loadNavigation();
    nav.navigateTo('geld');
    expect(mockLocation.href).toContain('apps/finance/index.html');
  });

  test('navigateTo resolves topic-area routes as second-level targets', async () => {
    const { nav, mockLocation } = await loadNavigation();
    nav.navigateTo('oracle_signal');
    expect(mockLocation.href).toContain('dimensions/geld/oracle_signal/index.html');
  });

  test('navigateTo falls back to home for unknown routes', async () => {
    const { nav, mockLocation } = await loadNavigation();
    nav.navigateTo('does-not-exist');
    expect(mockLocation.href).toContain('index.html');
  });

  test('registerCurrentApp initializes cleanup listeners only once', async () => {
    const { nav } = await loadNavigation();
    const app1 = { destroy: jest.fn(), name: 'App1' };
    const app2 = { destroy: jest.fn(), name: 'App2' };

    nav._cleanupListenersInitialized = false;
    const initialCalls = window.addEventListener.mock.calls.length;

    nav.registerCurrentApp(app1);
    const afterFirst = window.addEventListener.mock.calls.length;
    expect(afterFirst).toBeGreaterThan(initialCalls);

    nav.registerCurrentApp(app2);
    const afterSecond = window.addEventListener.mock.calls.length;
    expect(afterSecond).toBe(afterFirst);
  });

  test('bindNavigation is idempotent and resetNavigationBinding allows rebinding', async () => {
    const { nav, touchManagerMock, domMock } = await loadNavigation();

    nav.bindNavigation();
    nav.bindNavigation();

    expect(nav._navigationBound).toBe(true);
    expect(touchManagerMock.init).toHaveBeenCalledTimes(1);
    expect(domMock.normalizeDocumentText).toHaveBeenCalledTimes(1);

    nav.resetNavigationBinding();
    expect(nav._navigationBound).toBe(false);

    nav.bindNavigation();
    expect(touchManagerMock.init).toHaveBeenCalledTimes(2);
  });

  test('destroy clears timers, listeners and current app', async () => {
    const { nav } = await loadNavigation();
    const app = { destroy: jest.fn() };
    nav.registerCurrentApp(app);
    nav.bindNavigation();

    nav.destroy();

    expect(app.destroy).toHaveBeenCalledTimes(1);
    expect(nav._currentApp).toBeNull();
    expect(nav._navigationBound).toBe(false);
  });

  test('navigation entries follow system-first and all-dimensions ordering', async () => {
    const { getNavigationEntries } = await loadNavigation();
    expect(getNavigationEntries()).toEqual([
      expect.objectContaining({ id: 'home', label: 'Start', group: 'system' }),
      expect.objectContaining({ id: 'dashboard', label: 'Dashboard', group: 'system' }),
      expect.objectContaining({ id: 'zeit', dimensionId: 'zeit', label: 'Zeit', group: 'dimension' }),
      expect.objectContaining({ id: 'geld', dimensionId: 'geld', label: 'Geld', group: 'dimension' }),
      expect.objectContaining({ id: 'physis', dimensionId: 'physis', label: 'Physis', group: 'dimension' }),
      expect.objectContaining({ id: 'geist', dimensionId: 'geist', label: 'Geist', group: 'dimension' }),
      expect.objectContaining({ id: 'ausdruck', dimensionId: 'ausdruck', label: 'Ausdruck', group: 'dimension' }),
      expect.objectContaining({ id: 'netzwerk', dimensionId: 'netzwerk', label: 'Netzwerk', group: 'dimension' }),
      expect.objectContaining({ id: 'energie', dimensionId: 'energie', label: 'Energie', group: 'dimension' }),
      expect.objectContaining({ id: 'systeme', dimensionId: 'systeme', label: 'Systeme', group: 'dimension' }),
      expect.objectContaining({ id: 'raum', dimensionId: 'raum', label: 'Raum', group: 'dimension' }),
      expect.objectContaining({ id: 'muster', dimensionId: 'muster', label: 'Muster', group: 'dimension' }),
      expect.objectContaining({ id: 'wachstum', dimensionId: 'wachstum', label: 'Wachstum', group: 'dimension' })
    ]);
  });

  test('getCurrentRoute resolves system, dimension and app routes deterministically', async () => {
    const { getCurrentRoute } = await loadNavigation();
    expect(getCurrentRoute('/dashboard/index.html')).toBe('dashboard');
    expect(getCurrentRoute('/dimensions/time/index.html')).toBe('time');
    expect(getCurrentRoute('/dimensions/geld/oracle_signal/index.html')).toBe('oracle_signal');
    expect(getCurrentRoute('/apps/finance/index.html')).toBe('finance');
    expect(getCurrentRoute('/unknown')).toBe('home');
  });
});
