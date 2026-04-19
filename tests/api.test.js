import { jest } from '@jest/globals';

async function loadApi({ commercialActive = false, hasWindow = true } = {}) {
  jest.resetModules();

  const supabaseMockModule = await import('./mocks/supabase-js-esm.js');
  supabaseMockModule.__resetCreateClientMock();

  const withCircuitBreakerMock = jest.fn(async (_circuitName, fn) => {
    try {
      const data = await fn();
      return { success: true, data, offline: false };
    } catch (error) {
      return { success: false, error: error.message, offline: false };
    }
  });
  const stateMock = {
    _authorizedEmit: jest.fn()
  };

  if (hasWindow) {
    globalThis.window = {
      location: {
        hostname: 'mbrn.test',
        origin: 'https://mbrn.test',
        href: 'https://mbrn.test/dashboard'
      }
    };
  } else {
    delete globalThis.window;
  }

  await jest.unstable_mockModule('../shared/core/circuit_breaker.js', () => ({
    withCircuitBreaker: withCircuitBreakerMock
  }));

  await jest.unstable_mockModule('../shared/core/state.js', () => ({
    state: stateMock
  }));

  await jest.unstable_mockModule('../shared/core/config.js', () => ({
    IS_COMMERCIAL_MODE_ACTIVE: commercialActive
  }));

  const { api } = await import('../shared/core/api.js');
  api._resetForTests();
  return { api, withCircuitBreakerMock, stateMock, supabaseMockModule };
}

describe('api', () => {
  afterEach(() => {
    delete globalThis.window;
  });

  test('init creates a singleton client from the public constants by default', async () => {
    const fakeClient = { auth: {}, from: jest.fn(), functions: {} };
    const { api, supabaseMockModule } = await loadApi();
    supabaseMockModule.__setCreateClientImpl(() => fakeClient);

    const first = api.init();
    const second = api.init();
    const createClientCalls = supabaseMockModule.__getCreateClientCalls();

    expect(first).toBe(true);
    expect(second).toBe(true);
    expect(createClientCalls).toHaveLength(1);
    expect(createClientCalls[0][0]).toEqual(expect.any(String));
    expect(createClientCalls[0][1]).toEqual(expect.any(String));
    expect(createClientCalls[0][0].length).toBeGreaterThan(0);
    expect(createClientCalls[0][1].length).toBeGreaterThan(0);
    expect(api.client).toBe(fakeClient);
    expect(api.isOnline).toBe(true);
  });

  test('init fails cleanly when credentials are unavailable or client creation throws', async () => {
    const noEnv = await loadApi({ hasWindow: false });
    noEnv.api._setCredentials('', '');
    expect(noEnv.api.init()).toBe(false);

    const failing = await loadApi();
    failing.api._setCredentials('https://db.example.test', 'anon-test-key');
    failing.supabaseMockModule.__setCreateClientImpl(() => {
      throw new Error('create boom');
    });

    expect(failing.api.init()).toBe(false);
    expect(failing.api.isOnline).toBe(false);
  });

  test('checkConnection tracks online state from Supabase head query', async () => {
    const { api } = await loadApi();
    api.client = {
      from: jest.fn()
        .mockReturnValueOnce({
          select: jest.fn().mockResolvedValue({ data: null, error: null })
        })
        .mockReturnValueOnce({
          select: jest.fn().mockResolvedValue({ data: null, error: new Error('offline') })
        })
    };

    await expect(api.checkConnection()).resolves.toBe(true);
    await expect(api.checkConnection()).resolves.toBe(false);
  });

  test('auth helpers cover offline, success, and failure branches', async () => {
    const { api } = await loadApi();

    await expect(api.signUp('a@test.dev', 'pw')).resolves.toEqual({
      success: false,
      error: 'Offline'
    });

    const signOutMock = jest.fn()
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: { message: 'logout failed' } });
    const getSessionMock = jest.fn()
      .mockResolvedValueOnce({ data: { session: { user: { id: 'user-1' } } }, error: null })
      .mockResolvedValueOnce({ data: null, error: { message: 'session failed' } });

    api.client = {
      auth: {
        signUp: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }),
        signInWithPassword: jest.fn().mockResolvedValue({ data: null, error: { message: 'bad credentials' } }),
        signOut: signOutMock,
        getSession: getSessionMock
      }
    };

    await expect(api.signUp('a@test.dev', 'pw')).resolves.toEqual({
      success: true,
      data: { user: { id: 'user-1' } },
      offline: false
    });
    await expect(api.signIn('a@test.dev', 'pw')).resolves.toEqual({
      success: false,
      error: 'bad credentials',
      offline: false
    });
    await expect(api.signOut()).resolves.toEqual({ success: true });
    await expect(api.signOut()).resolves.toEqual({ success: false, error: 'logout failed' });
    await expect(api.getSession()).resolves.toEqual({
      success: true,
      data: { user: { id: 'user-1' } }
    });
    await expect(api.getSession()).resolves.toEqual({
      success: false,
      error: 'session failed'
    });
  });

  test('profile helpers cover validation, offline, success, and failure branches', async () => {
    const { api } = await loadApi();

    api.client = {};
    api.isOnline = true;

    await expect(api.saveProfile({ name: 'Guest' })).resolves.toEqual({
      success: false,
      error: 'Authenticated user required for cloud sync',
      offline: true
    });
    await expect(api.getProfile()).resolves.toEqual({
      success: false,
      error: 'Authenticated user required',
      offline: true
    });

    api.isOnline = false;
    await expect(api.saveProfile({ id: 'user-1' })).resolves.toEqual({
      success: false,
      error: 'Offline',
      offline: true
    });
    await expect(api.getProfile('user-1')).resolves.toEqual({
      success: false,
      error: 'Offline',
      offline: true
    });

    const upsertSelectMock = jest.fn()
      .mockResolvedValueOnce({ data: [{ id: 'user-1', display_name: 'Erik' }], error: null })
      .mockResolvedValueOnce({ data: null, error: { message: 'upsert failed' } });
    const singleMock = jest.fn()
      .mockResolvedValueOnce({ data: { id: 'user-1', display_name: 'Erik' }, error: null })
      .mockResolvedValueOnce({ data: null, error: { message: 'read failed' } });
    const upsertMock = jest.fn(() => ({ select: upsertSelectMock }));
    const eqProfileMock = jest.fn(() => ({ single: singleMock }));

    api.client = {
      from: jest.fn((table) => {
        if (table === 'profiles') {
          return {
            upsert: upsertMock,
            select: jest.fn(() => ({ eq: eqProfileMock }))
          };
        }
        throw new Error(`unexpected table: ${table}`);
      })
    };
    api.isOnline = true;

    await expect(api.saveProfile({ id: 'user-1', name: 'Erik' })).resolves.toEqual({
      success: true,
      data: { id: 'user-1', display_name: 'Erik' },
      offline: false
    });
    await expect(api.saveProfile({ id: 'user-1', name: 'Erik' })).resolves.toEqual({
      success: false,
      error: 'upsert failed',
      offline: false
    });
    await expect(api.getProfile('user-1')).resolves.toEqual({
      success: true,
      data: { id: 'user-1', display_name: 'Erik' },
      offline: false
    });
    await expect(api.getProfile('user-1')).resolves.toEqual({
      success: false,
      error: 'read failed',
      offline: false
    });
  });

  test('app-data helpers cover offline, success, and failure branches', async () => {
    const { api } = await loadApi();

    api.client = {};
    api.isOnline = false;
    await expect(api.saveAppData('u1', 'finance', {})).resolves.toEqual({
      success: false,
      error: 'Offline'
    });
    await expect(api.getAppData('u1', 'finance')).resolves.toEqual({
      success: false,
      error: 'Offline'
    });

    const appDataSelectMock = jest.fn()
      .mockResolvedValueOnce({ data: [{ payload: { score: 9 } }], error: null })
      .mockResolvedValueOnce({ data: null, error: { message: 'write failed' } });
    const appDataSingleMock = jest.fn()
      .mockResolvedValueOnce({ data: { payload: { score: 9 } }, error: null })
      .mockResolvedValueOnce({ data: null, error: { message: 'read failed' } });
    const eqAppIdMock = jest.fn(() => ({ single: appDataSingleMock }));
    const eqUserIdMock = jest.fn(() => ({ eq: eqAppIdMock }));

    api.client = {
      from: jest.fn((table) => {
        if (table === 'app_data') {
          return {
            upsert: jest.fn(() => ({ select: appDataSelectMock })),
            select: jest.fn(() => ({ eq: eqUserIdMock }))
          };
        }
        throw new Error(`unexpected table: ${table}`);
      })
    };
    api.isOnline = true;

    await expect(api.saveAppData('u1', 'finance', { score: 9 })).resolves.toEqual({
      success: true,
      data: { payload: { score: 9 } }
    });
    await expect(api.saveAppData('u1', 'finance', { score: 9 })).resolves.toEqual({
      success: false,
      error: 'write failed'
    });
    await expect(api.getAppData('u1', 'finance')).resolves.toEqual({
      success: true,
      data: { payload: { score: 9 } }
    });
    await expect(api.getAppData('u1', 'finance')).resolves.toEqual({
      success: false,
      error: 'read failed'
    });
  });

  test('logEvent emits structured system errors on analytics failure', async () => {
    const { api, stateMock } = await loadApi();
    const analyticsInsertMock = jest.fn()
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(new Error('analytics failed'));
    api.client = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } })
      },
      from: jest.fn(() => ({
        insert: analyticsInsertMock
      }))
    };
    api.isOnline = true;

    await expect(api.logEvent({ event: 'viewed', source: 'dashboard' })).resolves.toEqual({
      success: true
    });
    await expect(api.logEvent({ event: 'viewed', source: 'dashboard' })).resolves.toEqual({
      success: false,
      error: 'analytics failed'
    });
    expect(stateMock._authorizedEmit).toHaveBeenCalledWith(
      'systemError',
      expect.objectContaining({
        type: 'analytics_log_failed',
        severity: 'low'
      })
    );
  });

  test('commercial API endpoints stay disabled while commercial mode is inactive', async () => {
    const { api } = await loadApi();
    api.client = {
      functions: { invoke: jest.fn() },
      from: jest.fn()
    };
    api.isOnline = true;

    await expect(api.createCheckoutSession('price_123')).resolves.toEqual({
      success: false,
      error: 'Commercial mode inactive',
      code: 'COMMERCIAL_MODE_INACTIVE'
    });
    await expect(api.verifySession('cs_test_123')).resolves.toEqual({
      success: false,
      error: 'Commercial mode inactive',
      code: 'COMMERCIAL_MODE_INACTIVE'
    });
  });

  test('commercial helpers cover offline, validation, success, and failure branches', async () => {
    const { api } = await loadApi({ commercialActive: true });

    api.client = {};
    api.isOnline = false;
    await expect(api.createCheckoutSession('price_123')).resolves.toEqual({
      success: false,
      error: 'Bezahlvorgang erfordert eine Cloud-Verbindung.'
    });
    await expect(api.verifySession('cs_test_123')).resolves.toEqual({
      success: false,
      error: 'Verification requires cloud connection'
    });

    const invokeMock = jest.fn()
      .mockResolvedValueOnce({ data: { url: 'https://checkout.test' }, error: null })
      .mockResolvedValueOnce({ data: null, error: { message: 'invoke failed' } });
    const transactionSingleMock = jest.fn()
      .mockResolvedValueOnce({ data: { id: 'tx-1', status: 'completed' }, error: null })
      .mockResolvedValueOnce({ data: null, error: { message: 'not found' } })
      .mockRejectedValueOnce(new Error('verify exploded'));

    api.client = {
      functions: {
        invoke: invokeMock
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            in: jest.fn(() => ({
              single: transactionSingleMock
            }))
          }))
        }))
      }))
    };
    api.isOnline = true;

    await expect(api.createCheckoutSession('price_123')).resolves.toEqual({
      success: true,
      data: { url: 'https://checkout.test' }
    });
    await expect(api.createCheckoutSession('price_123')).resolves.toEqual({
      success: false,
      error: 'invoke failed'
    });
    await expect(api.verifySession()).resolves.toEqual({
      success: false,
      error: 'Invalid sessionId provided'
    });
    await expect(api.verifySession('cs_test_123')).resolves.toEqual({
      success: true,
      data: expect.objectContaining({
        sessionId: 'cs_test_123',
        verified: true,
        transaction: { id: 'tx-1', status: 'completed' }
      })
    });
    await expect(api.verifySession('cs_test_404')).resolves.toEqual({
      success: false,
      error: 'Session not found or payment not completed',
      code: 'SESSION_INVALID'
    });
    await expect(api.verifySession('cs_test_500')).resolves.toEqual({
      success: false,
      error: 'verify exploded',
      code: 'VERIFICATION_ERROR'
    });
  });

  test('checkConnection returns false when client is null', async () => {
    const { api } = await loadApi();
    const result = await api.checkConnection();
    expect(result).toBe(false);
    expect(api.isOnline).toBe(false);
  });

  test('signOut returns error when client.auth.signOut fails', async () => {
    const fakeClient = {
      auth: {
        signOut: jest.fn().mockResolvedValue({ error: { message: 'signout failed' } })
      }
    };
    const { api, supabaseMockModule } = await loadApi();
    api._setCredentials('https://test.supabase.co', 'test-key');
    supabaseMockModule.__setCreateClientImpl(() => fakeClient);
    await api.init();

    const result = await api.signOut();
    expect(result).toEqual({ success: false, error: 'signout failed' });
  });

  test('init handles initialization failure gracefully', async () => {
    const { api, supabaseMockModule } = await loadApi();
    api._setCredentials('https://test.supabase.co', 'test-key');

    supabaseMockModule.__setCreateClientImpl(() => {
      throw new Error('supabase connection failed');
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const result = await api.init();

    expect(result).toBe(false);
    expect(api.isOnline).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith('[API] Initialization failed:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  test('getSession returns error when client.auth.getSession fails', async () => {
    const fakeClient = {
      auth: {
        getSession: jest.fn().mockResolvedValue({ error: { message: 'session error' }, data: {} })
      }
    };
    const { api, supabaseMockModule } = await loadApi();
    api._setCredentials('https://test.supabase.co', 'test-key');
    supabaseMockModule.__setCreateClientImpl(() => fakeClient);
    await api.init();

    const result = await api.getSession();
    expect(result).toEqual({ success: false, error: 'session error' });
  });
});
