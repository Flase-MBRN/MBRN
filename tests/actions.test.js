import { jest } from '@jest/globals';

async function loadActions({
  commercialActive = false,
  gateAllowed = true,
  commerceRuntimeAvailable = true
} = {}) {
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

  const supabaseBridgeMock = {
    init: jest.fn(() => false),
    getSession: jest.fn(),
    getProfile: jest.fn(),
    saveProfile: jest.fn(),
    signUp: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    saveAppData: jest.fn(),
    logEvent: jest.fn()
  };

  const stripePaymentAdapterMock = {
    createCheckoutSession: jest.fn(),
    verifySession: jest.fn()
  };
  const paymentAdapterRegistryMock = {
    getDefaultAdapter: jest.fn(() => stripePaymentAdapterMock)
  };
  const resolvePriceMock = jest.fn(() => ({
    priceId: 'price_test',
    mode: 'payment',
    billingPeriod: 'one_time'
  }));
  const resolveMonetizationFlowMock = jest.fn(() => ({
    product: { id: 'artifact', provider: 'stripe', grantsPlanId: 'pro' },
    pricing: { productId: 'artifact', amount: 19, currency: 'eur', billingPeriod: 'one_time' },
    plan: { id: 'pro', accessLevel: 10 },
    entitlements: { planId: 'pro', features: ['artifact'], canPurchase: true },
    billing: { status: 'unpaid', isActive: false },
    gate: { allowed: gateAllowed, reason: gateAllowed ? 'allowed' : 'commercial_mode_inactive' },
    availability: 'checkout_ready',
    checkoutReady: gateAllowed,
    policyState: commercialActive ? (gateAllowed ? 'checkout_ready' : 'commercial_mode_inactive') : 'commercial_mode_inactive'
  }));

  const i18nMock = {
    t: jest.fn((key) => key)
  };

  const validateEmailMock = jest.fn((email) => ({ success: true, data: email.toLowerCase() }));
  const errorLoggerMock = {
    init: jest.fn()
  };
  let paymentAdapterModuleLoadCount = 0;
  let providerMapsModuleLoadCount = 0;

  await jest.unstable_mockModule('../shared/core/state/index.js', () => ({
    state: stateMock
  }));

  await jest.unstable_mockModule('../shared/core/storage/index.js', () => ({
    storage: storageMock
  }));

  await jest.unstable_mockModule('../shared/loyalty/streak_manager.js', () => ({
    streakManager: streakManagerMock
  }));

  await jest.unstable_mockModule('../bridges/supabase/index.js', () => ({
    supabaseBridge: supabaseBridgeMock
  }));

  await jest.unstable_mockModule('../commerce/payment_adapters/index.js', () => ({
    getDefaultAdapter: (() => {
      paymentAdapterModuleLoadCount += 1;
      if (!commerceRuntimeAvailable) {
        throw new Error('payment adapter runtime unavailable');
      }
      return paymentAdapterRegistryMock.getDefaultAdapter;
    })()
  }));

  await jest.unstable_mockModule('../commerce/provider_maps/index.js', () => ({
    resolvePrice: (() => {
      providerMapsModuleLoadCount += 1;
      if (!commerceRuntimeAvailable) {
        throw new Error('provider map runtime unavailable');
      }
      return resolvePriceMock;
    })()
  }));

  await jest.unstable_mockModule('../pillars/monetization/index.js', () => ({
    resolveMonetizationFlow: resolveMonetizationFlowMock
  }));

  await jest.unstable_mockModule('../shared/core/config/index.js', () => ({
    IS_COMMERCIAL_MODE_ACTIVE: commercialActive,
    MBRN_CONFIG: {
      commercial: {
        isActive: commercialActive,
        soonBadgeLabel: 'Bald verfuegbar'
      },
      stripe: {
        priceIdArtifact: 'price_test',
        priceIdBusiness: 'price_business_test'
      }
    }
  }));

  await jest.unstable_mockModule('../shared/core/i18n.js', () => ({
    i18n: i18nMock
  }));

  await jest.unstable_mockModule('../shared/core/validators.js', () => ({
    validateEmail: validateEmailMock
  }));

  await jest.unstable_mockModule('../shared/application/observability/error_logger.js', () => ({
    errorLogger: errorLoggerMock
  }));

  const { actions } = await import('../shared/application/actions.js');
  actions._resetForTests();

  return {
    actions,
    stateMock,
    storageMock,
    streakManagerMock,
    supabaseBridgeMock,
    stripePaymentAdapterMock,
    paymentAdapterRegistryMock,
    resolvePriceMock,
    resolveMonetizationFlowMock,
    i18nMock,
    validateEmailMock,
    errorLoggerMock,
    getCommerceModuleLoadCounts() {
      return {
        paymentAdapters: paymentAdapterModuleLoadCount,
        providerMaps: providerMapsModuleLoadCount
      };
    }
  };
}

describe('application actions', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  test('dispatch handles sync results, invalid returns and deduplicated async work', async () => {
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

  test('initSystem bootstraps defaults, error logger and subscriptions', async () => {
    const {
      actions,
      stateMock,
      storageMock,
      supabaseBridgeMock,
      errorLoggerMock
    } = await loadActions();

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
    expect(supabaseBridgeMock.init).toHaveBeenCalledTimes(1);
    expect(errorLoggerMock.init).toHaveBeenCalledTimes(1);
    expect(stateMock.subscribe).toHaveBeenCalledWith('streakUpdated', expect.any(Function));
    expect(stateMock.subscribe).toHaveBeenCalledWith('analyticsTrack', expect.any(Function));
  });

  test('initSystem hydrates sessions when bridge reports an active session', async () => {
    const context = await loadActions();
    context.supabaseBridgeMock.init.mockReturnValue(true);
    context.supabaseBridgeMock.getSession.mockResolvedValue({
      success: true,
      data: { user: { id: 'user-1' } }
    });
    const pullCloudDataSpy = jest.spyOn(context.actions, 'pullCloudData').mockResolvedValue();

    await expect(context.actions.initSystem()).resolves.toEqual({
      success: true,
      data: expect.objectContaining({ isNewUser: true })
    });
    expect(context.stateMock.set).toHaveBeenCalledWith('user', { id: 'user-1' });
    expect(context.stateMock._authorizedEmit).toHaveBeenCalledWith('userAuthChanged', { id: 'user-1' });
    expect(pullCloudDataSpy).toHaveBeenCalledWith('user-1');
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

  test('syncProfileToCloud covers no profile, auth required, success and bridge failure', async () => {
    const { actions, stateMock, storageMock, supabaseBridgeMock } = await loadActions();

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
    supabaseBridgeMock.saveProfile.mockResolvedValueOnce({
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

  test('auth actions validate email and pass through bridge responses', async () => {
    const {
      actions,
      stateMock,
      supabaseBridgeMock,
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

    supabaseBridgeMock.signUp.mockResolvedValueOnce({
      success: true,
      data: { user: { id: 'user-signup' } }
    }).mockResolvedValueOnce({
      success: false,
      error: 'signup failed'
    });
    supabaseBridgeMock.signIn.mockResolvedValueOnce({
      success: true,
      data: { user: { id: 'user-login' } }
    }).mockResolvedValueOnce({
      success: false,
      error: 'login failed'
    });
    supabaseBridgeMock.signOut.mockResolvedValueOnce({ success: true }).mockResolvedValueOnce({
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
    const { actions, stateMock, supabaseBridgeMock } = await loadActions();
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
    supabaseBridgeMock.saveProfile.mockResolvedValue({ success: true, data: { id: 'user-sync', synced: true } });

    expect(actions.debouncedSync(250)).toEqual({
      success: true,
      scheduled: true
    });

    await jest.advanceTimersByTimeAsync(250);
    expect(supabaseBridgeMock.saveProfile).toHaveBeenCalledWith({
      id: 'user-sync',
      plan_id: 'free',
      access_level: 0,
      level: 0,
      streak: 4,
      shields: 1
    });
  });

  test('pullCloudData handles missing cloud data, newer cloud state and newer local state', async () => {
    const { actions, stateMock, storageMock, supabaseBridgeMock } = await loadActions();

    supabaseBridgeMock.getProfile.mockResolvedValueOnce({ success: false, error: 'cloud missing' });
    await expect(actions.pullCloudData('user-1')).resolves.toBeUndefined();
    expect(stateMock._authorizedEmit).toHaveBeenCalledWith('syncFailed', { error: 'cloud missing' });

    stateMock.get.mockImplementation((key) => (
      key === 'systemInitialized'
        ? { name: 'Local', streak: 1, shields: 0, updatedAt: '2026-04-18T07:00:00.000Z' }
        : key === 'user'
          ? { id: 'user-1' }
          : null
    ));
    supabaseBridgeMock.getProfile.mockResolvedValueOnce({
      success: true,
      data: {
        plan_id: 'pro',
        access_level: 10,
        current_streak: 5,
        shields: 2,
        display_name: 'Cloud User',
        last_sync: '2026-04-18T09:00:00.000Z'
      }
    }).mockResolvedValueOnce({
      success: true,
      data: {
        plan_id: 'free',
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
        plan_id: 'pro',
        streak: 5,
        shields: 2,
        display_name: 'Cloud User'
      })
    );

    supabaseBridgeMock.saveProfile.mockResolvedValue({ success: true, data: { id: 'user-1', synced: true } });
    stateMock.get.mockImplementation((key) => {
      if (key === 'systemInitialized') {
        return { id: 'user-1', streak: 9, shields: 3, updatedAt: '2026-04-18T12:00:00.000Z' };
      }
      if (key === 'user') return { id: 'user-1' };
      return null;
    });

    await actions.pullCloudData('user-1');
    expect(supabaseBridgeMock.saveProfile).toHaveBeenCalledWith({
      id: 'user-1',
      plan_id: 'free',
      access_level: 0,
      level: 0,
      streak: 9,
      shields: 3,
      updatedAt: '2026-04-18T12:00:00.000Z'
    });
  });

  test('syncAppData emits states for success and failure and no-ops without a user', async () => {
    const { actions, stateMock, supabaseBridgeMock } = await loadActions();

    stateMock.get.mockReturnValue(null);
    await actions.syncAppData('finance', { risk: 'mid' });
    expect(supabaseBridgeMock.saveAppData).not.toHaveBeenCalled();

    stateMock.get.mockReturnValue({ id: 'user-app' });
    supabaseBridgeMock.saveAppData
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ success: false, error: 'write failed' });

    await actions.syncAppData('finance', { risk: 'mid' });
    await actions.syncAppData('finance', { risk: 'high' });

    expect(supabaseBridgeMock.saveAppData).toHaveBeenNthCalledWith(1, 'user-app', 'finance', { risk: 'mid' });
    expect(supabaseBridgeMock.saveAppData).toHaveBeenNthCalledWith(2, 'user-app', 'finance', { risk: 'high' });
    expect(stateMock._authorizedEmit).toHaveBeenCalledWith('syncSuccess');
    expect(stateMock._authorizedEmit).toHaveBeenCalledWith('syncFailed');
  });

  test('paywall and checkout flows are split between monetization gate and commerce adapter', async () => {
    const gated = await loadActions({ commercialActive: false, gateAllowed: false });
    await expect(gated.actions.startCheckout('artifact')).resolves.toEqual({
      success: false,
      error: 'commercial_mode_inactive',
      data: {
        feature: 'artifact',
        badge: 'Bald verfuegbar'
      }
    });
    expect(gated.getCommerceModuleLoadCounts()).toEqual({
      paymentAdapters: 0,
      providerMaps: 0
    });
    expect(gated.stripePaymentAdapterMock.createCheckoutSession).not.toHaveBeenCalled();

    const active = await loadActions({ commercialActive: true, gateAllowed: true });
    active.stateMock.get.mockReturnValue(null);
    await expect(active.actions.startCheckout('artifact')).resolves.toEqual({
      success: false,
      error: 'Auth required'
    });
    expect(active.getCommerceModuleLoadCounts()).toEqual({
      paymentAdapters: 0,
      providerMaps: 0
    });

    active.stateMock.get.mockReturnValue({ id: 'user-pay' });
    active.stripePaymentAdapterMock.createCheckoutSession
      .mockResolvedValueOnce({ success: true, data: { url: 'https://checkout.test' } })
      .mockResolvedValueOnce({ success: false, error: 'checkout failed' });

    await expect(active.actions.startCheckout('artifact')).resolves.toEqual({
      success: true,
      redirecting: true
    });
    await expect(active.actions.startCheckout('artifact')).resolves.toEqual({
      success: false,
      error: 'checkout failed'
    });
    expect(active.getCommerceModuleLoadCounts()).toEqual({
      paymentAdapters: 1,
      providerMaps: 1
    });
    expect(active.stateMock.emit).toHaveBeenCalledWith('checkoutRedirectRequested', { url: 'https://checkout.test' });
    expect(active.resolveMonetizationFlowMock).toHaveBeenCalledWith({
      productId: 'artifact',
      planId: 'free',
      accessLevel: 0
    });
    expect(active.resolvePriceMock).toHaveBeenCalledWith('artifact', 'stripe');
    expect(active.stripePaymentAdapterMock.createCheckoutSession).toHaveBeenCalledWith({
      priceId: 'price_test',
      mode: 'payment',
      billingPeriod: 'one_time',
      productId: 'artifact',
      planId: 'pro',
      accessLevel: 10
    });

    active.stripePaymentAdapterMock.verifySession
      .mockResolvedValueOnce({ success: true, data: { sessionId: 'cs_success' } })
      .mockResolvedValueOnce({ success: false, error: 'verification failed', code: 'SESSION_INVALID' });

    await expect(active.actions.handlePaymentSuccess('cs_success')).resolves.toEqual({
      success: true,
      data: { sessionId: 'cs_success' }
    });
    await expect(active.actions.handlePaymentSuccess('cs_fail')).resolves.toEqual({
      success: false,
      error: 'verification failed'
    });
  });

  test('checkout and payment fail gracefully when the private commerce runtime is unavailable', async () => {
    const context = await loadActions({
      commercialActive: true,
      gateAllowed: true,
      commerceRuntimeAvailable: false
    });
    context.stateMock.get.mockReturnValue({ id: 'user-pay' });

    await expect(context.actions.startCheckout('artifact')).resolves.toEqual({
      success: false,
      error: 'Checkout runtime unavailable'
    });
    await expect(context.actions.handlePaymentSuccess('cs_fail')).resolves.toEqual({
      success: false,
      error: 'Payment runtime unavailable'
    });

    expect(context.getCommerceModuleLoadCounts()).toEqual({
      paymentAdapters: 1,
      providerMaps: 1
    });
    expect(context.stripePaymentAdapterMock.createCheckoutSession).not.toHaveBeenCalled();
    expect(context.stripePaymentAdapterMock.verifySession).not.toHaveBeenCalled();
  });

  test('startCheckout returns policy-state errors for unknown and catalog-only products', async () => {
    const context = await loadActions({ commercialActive: true, gateAllowed: true });
    context.resolveMonetizationFlowMock
      .mockReturnValueOnce({
        product: null,
        pricing: null,
        plan: { id: 'free', accessLevel: 0 },
        entitlements: { planId: 'free', features: [], canPurchase: false },
        billing: { status: 'unpaid', isActive: false },
        gate: { allowed: false, reason: 'unknown_product' },
        availability: 'unknown',
        checkoutReady: false,
        policyState: 'unknown_product'
      })
      .mockReturnValueOnce({
        product: { id: 'oracle_snapshot', provider: 'stripe' },
        pricing: { productId: 'oracle_snapshot', amount: 9, currency: 'eur', billingPeriod: 'monthly' },
        plan: { id: 'business', accessLevel: 20 },
        entitlements: { planId: 'business', features: ['oracle_snapshot'], canPurchase: false },
        billing: { status: 'unpaid', isActive: false },
        gate: { allowed: true, reason: 'allowed' },
        availability: 'catalog_only',
        checkoutReady: false,
        policyState: 'catalog_only'
      });

    await expect(context.actions.startCheckout('missing')).resolves.toEqual({
      success: false,
      error: 'unknown_product'
    });
    await expect(context.actions.startCheckout('oracle_snapshot')).resolves.toEqual({
      success: false,
      error: 'catalog_only'
    });
    expect(context.stripePaymentAdapterMock.createCheckoutSession).not.toHaveBeenCalled();
  });
});
