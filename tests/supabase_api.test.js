import { jest } from '@jest/globals';

async function loadApi() {
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

  await jest.unstable_mockModule('../shared/core/circuit_breaker.js', () => ({
    withCircuitBreaker: withCircuitBreakerMock
  }));

  await jest.unstable_mockModule('../shared/core/state/index.js', () => ({
    state: stateMock
  }));

  const { api } = await import('../bridges/supabase/api.js');
  api._resetForTests();

  return {
    api,
    stateMock,
    withCircuitBreakerMock,
    supabaseMockModule
  };
}

describe('supabase bridge api', () => {
  test('init creates a singleton client from public constants by default', async () => {
    const fakeClient = { auth: {}, from: jest.fn(), functions: {} };
    const { api, supabaseMockModule } = await loadApi();
    supabaseMockModule.__setCreateClientImpl(() => fakeClient);

    const first = api.init();
    const second = api.init();
    const createClientCalls = supabaseMockModule.__getCreateClientCalls();

    expect(first).toBe(true);
    expect(second).toBe(true);
    expect(createClientCalls).toHaveLength(1);
    expect(api.client).toBe(fakeClient);
    expect(api.isOnline).toBe(true);
  });

  test('checkConnection and auth helpers cover offline, success and failure branches', async () => {
    const { api } = await loadApi();

    api.client = {
      from: jest.fn()
        .mockReturnValueOnce({
          select: jest.fn().mockResolvedValue({ data: null, error: null })
        })
        .mockReturnValueOnce({
          select: jest.fn().mockResolvedValue({ data: null, error: new Error('offline') })
        }),
      auth: {
        signUp: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }),
        signInWithPassword: jest.fn().mockResolvedValue({ data: null, error: { message: 'bad credentials' } }),
        signOut: jest.fn().mockResolvedValue({ error: null }),
        getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'user-1' } } }, error: null })
      }
    };
    api.isOnline = true;

    await expect(api.checkConnection()).resolves.toBe(true);
    await expect(api.checkConnection()).resolves.toBe(false);
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
    await expect(api.getSession()).resolves.toEqual({
      success: true,
      data: { user: { id: 'user-1' } }
    });
  });

  test('profile, app-data and analytics helpers emit structured state errors on failure', async () => {
    const { api, stateMock } = await loadApi();

    const analyticsInsert = jest.fn().mockRejectedValue(new Error('analytics failed'));
    const appDataSingle = jest.fn().mockResolvedValue({ data: { payload: { score: 9 } }, error: null });
    const profileSingle = jest.fn().mockResolvedValue({ data: { id: 'user-1' }, error: null });
    const appDataEq = jest.fn(() => ({ single: appDataSingle }));
    const profileEq = jest.fn(() => ({ single: profileSingle }));

    api.client = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } })
      },
      from: jest.fn((table) => {
        if (table === 'profiles') {
          return {
            upsert: jest.fn(() => ({ select: jest.fn().mockResolvedValue({ data: [{ id: 'user-1' }], error: null }) })),
            select: jest.fn(() => ({ eq: profileEq }))
          };
        }
        if (table === 'app_data') {
          return {
            upsert: jest.fn(() => ({ select: jest.fn().mockResolvedValue({ data: [{ payload: { score: 9 } }], error: null }) })),
            select: jest.fn(() => ({ eq: jest.fn(() => ({ eq: appDataEq })) }))
          };
        }
        if (table === 'analytics_logs') {
          return {
            insert: analyticsInsert
          };
        }
        throw new Error(`unexpected table: ${table}`);
      })
    };
    api.isOnline = true;

    await expect(api.saveProfile({ id: 'user-1', name: 'Erik' })).resolves.toEqual({
      success: true,
      data: { id: 'user-1' },
      offline: false
    });
    await expect(api.getProfile('user-1')).resolves.toEqual({
      success: true,
      data: { id: 'user-1' },
      offline: false
    });
    await expect(api.saveAppData('u1', 'finance', {})).resolves.toEqual({
      success: true,
      data: { payload: { score: 9 } }
    });
    await expect(api.getAppData('u1', 'finance')).resolves.toEqual({
      success: true,
      data: { payload: { score: 9 } }
    });
    await expect(api.logEvent({ event: 'sync_failed', source: 'dashboard', data: {} })).resolves.toEqual({
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
});

