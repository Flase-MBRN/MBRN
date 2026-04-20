import { jest } from '@jest/globals';

async function loadErrorLogger({ withBrowser = true } = {}) {
  jest.resetModules();

  const storageMock = {
    get: jest.fn(() => ({ success: true, data: [] })),
    set: jest.fn(),
    remove: jest.fn()
  };

  const stateMock = {
    emit: jest.fn(),
    subscribe: jest.fn(),
    _authorizedEmit: jest.fn()
  };

  const insertMock = jest.fn();
  const fromMock = jest.fn(() => ({
    insert: insertMock
  }));
  const getUserMock = jest.fn(() => Promise.resolve({ data: { user: { id: 'user-1' } } }));
  const getSupabaseClientMock = jest.fn(() => ({
    from: fromMock,
    auth: {
      getUser: getUserMock
    }
  }));

  const supabaseBridgeMock = {
    isOnline: false
  };

  if (withBrowser) {
    Object.defineProperty(globalThis, 'window', {
      value: {
        location: {
          href: 'https://mbrn.test/dashboard?email=hidden@example.com#payment',
          origin: 'https://mbrn.test'
        },
        addEventListener: jest.fn()
      },
      configurable: true
    });

    Object.defineProperty(globalThis, 'navigator', {
      value: {
        onLine: false,
        language: 'de-DE',
        userAgent: 'JestBrowser/1.0'
      },
      configurable: true
    });
  } else {
    delete globalThis.window;
    delete globalThis.navigator;
  }

  await jest.unstable_mockModule('../shared/core/state/index.js', () => ({
    state: stateMock
  }));

  await jest.unstable_mockModule('../shared/core/storage/index.js', () => ({
    storage: storageMock
  }));

  await jest.unstable_mockModule('../bridges/supabase/client.js', () => ({
    getSupabaseClient: getSupabaseClientMock
  }));

  await jest.unstable_mockModule('../bridges/supabase/index.js', () => ({
    supabaseBridge: supabaseBridgeMock
  }));

  const { errorLogger } = await import('../shared/application/observability/error_logger.js');
  errorLogger._initialized = false;
  errorLogger._syncInProgress = false;

  return {
    errorLogger,
    storageMock,
    stateMock,
    supabaseBridgeMock,
    getSupabaseClientMock,
    insertMock,
    fromMock,
    getUserMock
  };
}

describe('application errorLogger', () => {
  afterEach(() => {
    delete globalThis.window;
    delete globalThis.navigator;
  });

  test('init is headless-safe and subscribes only in browser runtime', async () => {
    const headless = await loadErrorLogger({ withBrowser: false });
    expect(headless.errorLogger.init()).toBe(false);
    expect(headless.stateMock.subscribe).not.toHaveBeenCalled();

    const browser = await loadErrorLogger({ withBrowser: true });
    expect(browser.errorLogger.init()).toBe(true);
    expect(browser.errorLogger.init()).toBe(true);
    expect(browser.stateMock.subscribe).toHaveBeenCalledWith('circuitOpened', expect.any(Function));
    expect(browser.stateMock.subscribe).toHaveBeenCalledWith('systemError', expect.any(Function));
    expect(globalThis.window.addEventListener).toHaveBeenCalledWith('online', expect.any(Function));
  });

  test('queues offline errors with sanitized context and URL', async () => {
    const { errorLogger, storageMock } = await loadErrorLogger();

    const result = await errorLogger.logError({
      type: 'payment_error',
      error: 'Checkout exploded',
      context: {
        email: 'hidden@example.com',
        nested: {
          birthDate: '2000-01-01',
          ok: true
        }
      }
    });

    expect(result.success).toBe(false);
    expect(result.queued).toBe(true);
    expect(storageMock.set).toHaveBeenCalledWith(
      'error_queue',
      [
        expect.objectContaining({
          type: 'payment_error',
          context: expect.objectContaining({
            email: '[REDACTED]',
            nested: {
              birthDate: '[REDACTED]',
              ok: true
            },
            url: 'https://mbrn.test/dashboard',
            language: 'de-DE',
            userAgent: 'JestBrowser/1.0'
          })
        })
      ]
    );
  });

  test('deduplicates recent identical queued errors and caps queue size', async () => {
    const { errorLogger, storageMock } = await loadErrorLogger();

    storageMock.get.mockReturnValueOnce({
      success: true,
      data: [
        {
          id: 'err_recent',
          type: 'payment_error',
          error: 'Duplicate me',
          timestamp: new Date().toISOString(),
          synced: false
        }
      ]
    }).mockReturnValueOnce({
      success: true,
      data: Array.from({ length: 50 }, (_, index) => ({
        id: `err_${index}`,
        type: 'api_failure',
        error: `boom-${index}`,
        timestamp: new Date(Date.now() - (index + 1) * 600_000).toISOString(),
        synced: false
      }))
    });

    await expect(errorLogger.logError({
      type: 'payment_error',
      error: 'Duplicate me',
      context: {}
    })).resolves.toEqual({
      success: false,
      queued: false,
      reason: 'duplicate'
    });

    await errorLogger.logError({
      type: 'api_failure',
      error: 'newest',
      context: {}
    });
    expect(storageMock.set).toHaveBeenLastCalledWith(
      'error_queue',
      expect.arrayContaining([
        expect.objectContaining({ error: 'newest' })
      ])
    );
  });

  test('sends errors directly to Supabase when online and falls back to queue on send failure', async () => {
    const { errorLogger, supabaseBridgeMock, insertMock, storageMock, fromMock } = await loadErrorLogger();
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        onLine: true,
        language: 'de-DE',
        userAgent: 'JestBrowser/1.0'
      },
      configurable: true
    });
    supabaseBridgeMock.isOnline = true;
    insertMock
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: { message: 'write failed' } });

    await expect(errorLogger.logError({
      type: 'api_failure',
      error: 'Cloud write failed',
      severity: 'high',
      context: {
        token: 'secret-token',
        route: '/finance'
      }
    })).resolves.toEqual({
      success: true,
      id: expect.any(String)
    });

    await expect(errorLogger.logError({
      type: 'api_failure',
      error: 'Cloud write failed',
      severity: 'high',
      context: {
        token: 'secret-token',
        route: '/finance'
      }
    })).resolves.toEqual({
      success: false,
      queued: true,
      id: expect.any(String)
    });

    expect(fromMock).toHaveBeenCalledWith('error_logs');
    expect(storageMock.set).toHaveBeenCalled();
  });

  test('sendToSupabase handles missing client and thrown insert failures', async () => {
    const missingClientCase = await loadErrorLogger();
    missingClientCase.getSupabaseClientMock.mockReturnValue(null);
    await expect(missingClientCase.errorLogger._sendToSupabase({
      id: 'err_1',
      timestamp: new Date().toISOString(),
      type: 'api_failure',
      error: 'boom',
      severity: 'high',
      context: {},
      stack: null
    })).resolves.toEqual({
      success: false,
      error: 'API client not available'
    });

    const throwingClientCase = await loadErrorLogger();
    throwingClientCase.insertMock.mockRejectedValue(new Error('insert exploded'));
    await expect(throwingClientCase.errorLogger._sendToSupabase({
      id: 'err_2',
      timestamp: new Date().toISOString(),
      type: 'api_failure',
      error: 'boom',
      severity: 'high',
      context: {},
      stack: null
    })).resolves.toEqual({
      success: false,
      error: 'insert exploded'
    });
  });

  test('critical classifier and url sanitizer handle fallback paths', async () => {
    const { errorLogger } = await loadErrorLogger();

    expect(errorLogger._isCritical({ type: 'circuit_open' })).toBe(true);
    expect(errorLogger._isCritical({ severity: 'critical' })).toBe(true);
    expect(errorLogger._isCritical({ severity: 'high' })).toBe(true);
    expect(errorLogger._isCritical({ type: 'info', severity: 'low' })).toBe(false);
    expect(errorLogger._sanitizeUrl('http://%zz')).toBe('http://%zz');
  });

  test('syncQueue skips when offline and persists only failed entries', async () => {
    const { errorLogger, storageMock, stateMock, supabaseBridgeMock } = await loadErrorLogger();

    errorLogger._syncInProgress = true;
    await expect(errorLogger._syncQueue()).resolves.toBeUndefined();
    errorLogger._syncInProgress = false;

    supabaseBridgeMock.isOnline = false;
    await expect(errorLogger._syncQueue()).resolves.toBeUndefined();

    Object.defineProperty(globalThis, 'navigator', {
      value: {
        onLine: true,
        language: 'de-DE',
        userAgent: 'JestBrowser/1.0'
      },
      configurable: true
    });
    supabaseBridgeMock.isOnline = true;

    storageMock.get.mockReturnValue({
      success: true,
      data: [
        { id: 'ok', type: 'api_failure', error: 'ok', timestamp: new Date().toISOString(), synced: false },
        { id: 'fail', type: 'api_failure', error: 'fail', timestamp: new Date().toISOString(), synced: false }
      ]
    });

    const sendSpy = jest.spyOn(errorLogger, '_sendToSupabase')
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ success: false, error: 'still offline' });

    await errorLogger._syncQueue();

    expect(sendSpy).toHaveBeenCalledTimes(2);
    expect(storageMock.set).toHaveBeenCalledWith(
      'error_queue',
      [
        expect.objectContaining({ id: 'fail' })
      ]
    );
    expect(stateMock._authorizedEmit).toHaveBeenCalledWith('errorQueueSynced', {
      total: 2,
      synced: 1,
      failed: 1
    });
  });
});
