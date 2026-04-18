import { jest } from '@jest/globals';

async function loadActions({ commercialActive = false } = {}) {
  jest.resetModules();

  const stateMock = {
    get: jest.fn(),
    set: jest.fn(),
    emit: jest.fn(),
    subscribe: jest.fn(),
    _authorizedEmit: jest.fn()
  };

  const storageMock = {
    get: jest.fn(() => ({ success: true, data: null })),
    set: jest.fn(async () => ({ success: true })),
    remove: jest.fn()
  };

  const streakManagerMock = {
    calculateCheckIn: jest.fn()
  };

  const apiMock = {
    init: jest.fn(() => false),
    getSession: jest.fn(),
    getProfile: jest.fn(),
    saveProfile: jest.fn(),
    signUp: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    saveAppData: jest.fn(),
    createCheckoutSession: jest.fn(),
    verifySession: jest.fn(),
    logEvent: jest.fn()
  };

  const i18nMock = {
    t: jest.fn((key) => key)
  };

  const validateEmailMock = jest.fn((email) => ({ success: true, data: email.toLowerCase() }));
  const errorLoggerMock = {
    init: jest.fn()
  };

  await jest.unstable_mockModule('../shared/core/state.js', () => ({
    state: stateMock
  }));

  await jest.unstable_mockModule('../shared/core/storage.js', () => ({
    storage: storageMock
  }));

  await jest.unstable_mockModule('../shared/loyalty/streak_manager.js', () => ({
    streakManager: streakManagerMock
  }));

  await jest.unstable_mockModule('../shared/core/api.js', () => ({
    api: apiMock
  }));

  await jest.unstable_mockModule('../shared/core/config.js', () => ({
    IS_COMMERCIAL_MODE_ACTIVE: commercialActive,
    MBRN_CONFIG: {
      commercial: {
        isActive: commercialActive,
        soonBadgeLabel: 'Bald verfuegbar'
      },
      stripe: {
        priceIdArtifact: 'price_test'
      }
    }
  }));

  await jest.unstable_mockModule('../shared/core/i18n.js', () => ({
    i18n: i18nMock
  }));

  await jest.unstable_mockModule('../shared/core/validators.js', () => ({
    validateEmail: validateEmailMock
  }));

  await jest.unstable_mockModule('../shared/core/error_logger.js', () => ({
    errorLogger: errorLoggerMock
  }));

  const { actions } = await import('../shared/core/actions.js');
  actions._resetForTests();

  return {
    actions,
    stateMock,
    storageMock,
    streakManagerMock,
    apiMock,
    i18nMock,
    validateEmailMock,
    errorLoggerMock
  };
}

describe('actions', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  test('dispatch handles sync results, missing actions, invalid returns, throws, and deduped async work', async () => {
    const { actions } = await loadActions();

    actions.register('sync-ok', (payload) => ({ success: true, payload }));
    actions.register('sync-undefined', () => undefined);
    actions.register('sync-primitive', () => 'bad');
    actions.register('sync-throw', () => {
      throw new Error('sync boom');
    });

    let resolveHandler;
    actions.register('async-dedupe', () => new Promise((resolve) => {
      resolveHandler = resolve;
    }));

    expect(actions.dispatch('sync-ok', { id: 7 })).toEqual({
      success: true,
      payload: { id: 7 }
    });
    expect(actions.dispatch('missing')).toEqual({
      success: false,
      error: 'Action not registered'
    });
    expect(actions.dispatch('sync-undefined')).toEqual({
      success: false,
      error: 'Handler returned null/undefined'
    });
    expect(actions.dispatch('sync-primitive')).toEqual({
      success: false,
      error: 'Handler returned string instead of object'
    });
    expect(actions.dispatch('sync-throw')).toEqual({
      success: false,
      error: 'sync boom'
    });

    const first = actions.dispatch('async-dedupe');
    const second = actions.dispatch('async-dedupe');
    expect(second).toEqual({
      success: false,
      error: 'Action already in progress',
      deduplicated: true
    });
    resolveHandler({ success: true, done: true });
    await expect(first).resolves.toEqual({ success: true, done: true });
  });

  test('initSystem bootstraps defaults, logger init, and subscriptions, then returns idempotently', async () => {
    const { actions, stateMock, storageMock, apiMock, errorLoggerMock } = await loadActions();
    stateMock.get.mockReturnValueOnce({ id: 'cached-profile' });

    const first = await actions.initSystem();
    const second = await actions.initSystem();

    expect(first).toEqual({
      success: true,
      data: {
        isNewUser: true,
        streak: 0,
        shields: 0,
        unlocked_tools: []
      }
    });
    expect(second).toEqual({
      success: true,
      data: { id: 'cached-profile' }
    });
    expect(storageMock.get).toHaveBeenCalledWith('user_profile');
    expect(apiMock.init).toHaveBeenCalledTimes(1);
    expect(errorLoggerMock.init).toHaveBeenCalledTimes(1);
    expect(stateMock.subscribe).toHaveBeenCalledWith('streakUpdated', expect.any(Function));
    expect(stateMock.subscribe).toHaveBeenCalledWith('analyticsTrack', expect.any(Function));
    expect(stateMock._authorizedEmit).toHaveBeenCalledWith(
      'systemInitialized',
      expect.objectContaining({ isNewUser: true })
    );
  });

  test('initSystem hydrates sessions and survives session hydration failure', async () => {
    const successCase = await loadActions();
    successCase.apiMock.init.mockReturnValue(true);
    successCase.apiMock.getSession.mockResolvedValue({
      success: true,
      data: { user: { id: 'user-1' } }
    });
    const pullCloudDataSpy = jest.spyOn(successCase.actions, 'pullCloudData').mockResolvedValue();

    await expect(successCase.actions.initSystem()).resolves.toEqual({
      success: true,
      data: expect.objectContaining({ isNewUser: true })
    });
    expect(successCase.stateMock.set).toHaveBeenCalledWith('user', { id: 'user-1' });
    expect(successCase.stateMock._authorizedEmit).toHaveBeenCalledWith('userAuthChanged', { id: 'user-1' });
    expect(pullCloudDataSpy).toHaveBeenCalledWith('user-1');

    const failureCase = await loadActions();
    failureCase.apiMock.init.mockReturnValue(true);
    failureCase.apiMock.getSession.mockRejectedValue(new Error('session exploded'));

    await expect(failureCase.actions.initSystem()).resolves.toEqual({
      success: true,
      data: expect.objectContaining({ isNewUser: true })
    });
  });

  test('triggerCheckIn covers success and failure branches', async () => {
    const { actions, stateMock, storageMock, streakManagerMock } = await loadActions();
    stateMock.get.mockReturnValue({ streak: 0, shields: 0 });

    streakManagerMock.calculateCheckIn.mockReturnValueOnce({
      success: true,
      data: {
        profile: { streak: 1, shields: 1 },
        reward: 'pulse'
      }
    });

    await expect(actions.triggerCheckIn()).resolves.toEqual({
      success: true,
      data: expect.objectContaining({
        reward: 'pulse',
        profile: expect.objectContaining({ streak: 1, shields: 1, updatedAt: expect.any(String) })
      })
    });
    expect(storageMock.set).toHaveBeenCalledWith(
      'user_profile',
      expect.objectContaining({ streak: 1, shields: 1, updatedAt: expect.any(String) })
    );

    streakManagerMock.calculateCheckIn.mockReturnValueOnce({
      success: false,
      error: 'already checked in'
    });
    await expect(actions.triggerCheckIn()).resolves.toEqual({
      success: false,
      error: 'already checked in'
    });
    expect(stateMock.emit).toHaveBeenCalledWith('checkInFailed', { message: 'already checked in' });
  });

  test('syncProfileToCloud covers no profile, auth required, success, and API failure', async () => {
    const { actions, stateMock, storageMock, apiMock } = await loadActions();

    stateMock.get.mockReturnValue(null);
    await expect(actions.syncProfileToCloud()).resolves.toEqual({
      success: false,
      error: 'No profile'
    });

    stateMock.get.mockImplementation((key) => (
      key === 'systemInitialized'
        ? { streak: 2, shields: 1 }
        : null
    ));
    storageMock.get.mockReturnValue({ success: true, data: { streak: 2, shields: 1 } });
    await expect(actions.syncProfileToCloud()).resolves.toEqual({
      success: false,
      error: 'Auth required',
      offline: true
    });

    stateMock.get.mockImplementation((key) => {
      if (key === 'systemInitialized') return { streak: 2, shields: 1 };
      if (key === 'user') return { id: 'user-1' };
      return null;
    });
    apiMock.saveProfile.mockResolvedValueOnce({
      success: true,
      data: { id: 'user-1', synced: true }
    }).mockResolvedValueOnce({
      success: false,
      error: 'cloud failed'
    });

    await expect(actions.syncProfileToCloud()).resolves.toEqual({
      success: true,
      data: { id: 'user-1', synced: true }
    });
    await expect(actions.syncProfileToCloud()).resolves.toEqual({
      success: false,
      error: 'cloud failed'
    });
  });

  test('auth actions cover validation blocks plus success and failure passthrough', async () => {
    const {
      actions,
      stateMock,
      apiMock,
      validateEmailMock
    } = await loadActions();

    validateEmailMock.mockReturnValueOnce({
      success: false,
      error: 'blocked domain'
    });
    await expect(actions.registerAccount('fake@test.dev', 'pw')).resolves.toEqual({
      success: false,
      error: 'securityBlock: blocked domain useRealEmail'
    });

    apiMock.signUp.mockResolvedValueOnce({
      success: true,
      data: { user: { id: 'user-signup' } }
    }).mockResolvedValueOnce({
      success: false,
      error: 'signup failed'
    });
    apiMock.signIn.mockResolvedValueOnce({
      success: true,
      data: { user: { id: 'user-login' } }
    }).mockResolvedValueOnce({
      success: false,
      error: 'login failed'
    });
    apiMock.signOut.mockResolvedValueOnce({ success: true }).mockResolvedValueOnce({
      success: false,
      error: 'logout failed'
    });

    await expect(actions.registerAccount('REAL@example.com', 'pw')).resolves.toEqual({
      success: true,
      data: { id: 'user-signup' }
    });
    await expect(actions.registerAccount('REAL@example.com', 'pw')).resolves.toEqual({
      success: false,
      error: 'signup failed'
    });
    await expect(actions.login('a@test.dev', 'pw')).resolves.toEqual({
      success: true,
      data: { id: 'user-login' }
    });
    await expect(actions.login('a@test.dev', 'pw')).resolves.toEqual({
      success: false,
      error: 'login failed'
    });
    await expect(actions.logout()).resolves.toEqual({ success: true });
    await expect(actions.logout()).resolves.toEqual({
      success: false,
      error: 'logout failed'
    });

    expect(stateMock.set).toHaveBeenCalledWith('user', { id: 'user-signup' });
    expect(stateMock.set).toHaveBeenCalledWith('user', { id: 'user-login' });
    expect(stateMock.set).toHaveBeenCalledWith('user', null);
  });

  test('debouncedSync schedules cloud sync only for authenticated users', async () => {
    const { actions, stateMock, apiMock } = await loadActions();
    jest.useFakeTimers();

    stateMock.get.mockReturnValueOnce(null);
    expect(actions.debouncedSync(250)).toEqual({
      success: false,
      error: 'Auth required for debounced sync'
    });

    stateMock.get.mockImplementation((key) => {
      if (key === 'user') return { id: 'user-sync' };
      if (key === 'systemInitialized') return { streak: 4, shields: 1 };
      return null;
    });
    apiMock.saveProfile.mockResolvedValue({ success: true, data: { id: 'user-sync', synced: true } });

    expect(actions.debouncedSync(250)).toEqual({
      success: true,
      scheduled: true
    });

    await jest.advanceTimersByTimeAsync(250);
    expect(apiMock.saveProfile).toHaveBeenCalledWith({
      id: 'user-sync',
      streak: 4,
      shields: 1
    });
  });

  test('pullCloudData handles missing cloud data, newer cloud state, and newer local state', async () => {
    const { actions, stateMock, storageMock, apiMock } = await loadActions();

    apiMock.getProfile.mockResolvedValueOnce({ success: false, error: 'cloud missing' });
    await expect(actions.pullCloudData('user-1')).resolves.toBeUndefined();
    expect(stateMock._authorizedEmit).toHaveBeenCalledWith('syncFailed', { error: 'cloud missing' });

    stateMock.get.mockImplementation((key) => (
      key === 'systemInitialized'
        ? { name: 'Local', streak: 1, shields: 0, updatedAt: '2026-04-18T07:00:00.000Z' }
        : key === 'user'
          ? { id: 'user-1' }
          : null
    ));
    apiMock.getProfile.mockResolvedValueOnce({
      success: true,
      data: {
        access_level: 10,
        current_streak: 5,
        shields: 2,
        display_name: 'Cloud User',
        last_sync: '2026-04-18T09:00:00.000Z'
      }
    }).mockResolvedValueOnce({
      success: true,
      data: {
        access_level: 2,
        current_streak: 1,
        shields: 0,
        display_name: 'Older Cloud',
        last_sync: '2026-04-18T06:00:00.000Z'
      }
    });

    await actions.pullCloudData('user-1');
    expect(storageMock.set).toHaveBeenCalledWith(
      'user_profile',
      expect.objectContaining({
        id: 'user-1',
        streak: 5,
        shields: 2,
        display_name: 'Cloud User'
      })
    );

    apiMock.saveProfile.mockResolvedValue({ success: true, data: { id: 'user-1', synced: true } });
    stateMock.get.mockImplementation((key) => {
      if (key === 'systemInitialized') {
        return { id: 'user-1', streak: 9, shields: 3, updatedAt: '2026-04-18T12:00:00.000Z' };
      }
      if (key === 'user') return { id: 'user-1' };
      return null;
    });

    await actions.pullCloudData('user-1');
    expect(apiMock.saveProfile).toHaveBeenCalledWith({
      id: 'user-1',
      streak: 9,
      shields: 3,
      updatedAt: '2026-04-18T12:00:00.000Z'
    });
  });

  test('syncAppData emits states for success and failure and no-ops without a user', async () => {
    const { actions, stateMock, apiMock } = await loadActions();

    stateMock.get.mockReturnValue(null);
    await actions.syncAppData('finance', { risk: 'mid' });
    expect(apiMock.saveAppData).not.toHaveBeenCalled();

    stateMock.get.mockReturnValue({ id: 'user-app' });
    apiMock.saveAppData
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ success: false, error: 'write failed' });

    await actions.syncAppData('finance', { risk: 'mid' });
    await actions.syncAppData('finance', { risk: 'high' });

    expect(apiMock.saveAppData).toHaveBeenNthCalledWith(1, 'user-app', 'finance', { risk: 'mid' });
    expect(apiMock.saveAppData).toHaveBeenNthCalledWith(2, 'user-app', 'finance', { risk: 'high' });
    expect(stateMock._authorizedEmit).toHaveBeenCalledWith('syncSuccess');
    expect(stateMock._authorizedEmit).toHaveBeenCalledWith('syncFailed');
  });

  test('commercial mode inactive routes users to paywall and blocks payment verification', async () => {
    const { actions, stateMock, apiMock } = await loadActions();

    await expect(actions.startCheckout('artifact')).resolves.toEqual({
      success: false,
      error: 'commercial_mode_inactive',
      data: {
        feature: 'artifact',
        badge: 'Bald verfuegbar'
      }
    });
    await expect(actions.handlePaymentSuccess('cs_test_123')).resolves.toEqual({
      success: false,
      error: 'Commercial mode inactive'
    });
    expect(apiMock.createCheckoutSession).not.toHaveBeenCalled();
    expect(apiMock.verifySession).not.toHaveBeenCalled();
    expect(stateMock.emit).toHaveBeenCalledWith(
      'paywallRequested',
      expect.objectContaining({
        feature: 'artifact',
        reason: 'commercial_mode_inactive'
      })
    );
  });

  test('commercial mode active covers auth-required, redirect, checkout failure, payment success, and payment failure', async () => {
    const { actions, stateMock, apiMock } = await loadActions({ commercialActive: true });

    stateMock.get.mockReturnValue(null);
    await expect(actions.startCheckout('artifact')).resolves.toEqual({
      success: false,
      error: 'Auth required'
    });

    stateMock.get.mockReturnValue({ id: 'user-pay' });
    apiMock.createCheckoutSession
      .mockResolvedValueOnce({ success: true, data: { url: 'https://checkout.test' } })
      .mockResolvedValueOnce({ success: false, error: 'checkout failed' });

    await expect(actions.startCheckout('artifact')).resolves.toEqual({
      success: true,
      redirecting: true
    });
    await expect(actions.startCheckout('artifact')).resolves.toEqual({
      success: false,
      error: 'checkout failed'
    });
    expect(stateMock.emit).toHaveBeenCalledWith('checkoutRedirectRequested', { url: 'https://checkout.test' });

    apiMock.verifySession
      .mockResolvedValueOnce({ success: true, data: { sessionId: 'cs_success' } })
      .mockResolvedValueOnce({ success: false, error: 'verification failed', code: 'SESSION_INVALID' });

    await expect(actions.handlePaymentSuccess('cs_success')).resolves.toEqual({
      success: true,
      data: { sessionId: 'cs_success' }
    });
    await expect(actions.handlePaymentSuccess('cs_fail')).resolves.toEqual({
      success: false,
      error: 'verification failed'
    });
    expect(stateMock._authorizedEmit).toHaveBeenCalledWith('paymentVerified', { sessionId: 'cs_success' });
    expect(stateMock._authorizedEmit).toHaveBeenCalledWith('paymentFailed', {
      sessionId: 'cs_fail',
      error: 'verification failed',
      code: 'SESSION_INVALID'
    });
  });
});
