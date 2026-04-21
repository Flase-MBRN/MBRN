/**
 * /shared/application/actions.js
 * Cross-pillar application orchestration.
 *
 * This layer coordinates core state/storage, bridges, commerce adapters and
 * pillar policies without turning shared/core into an IO zone.
 */

import { state } from '../core/state/index.js';
import { storage } from '../core/storage/index.js';
import { streakManager } from '../loyalty/streak_manager.js';
import { IS_COMMERCIAL_MODE_ACTIVE, MBRN_CONFIG } from '../core/config/index.js';
import { i18n } from '../core/i18n.js';
import { validateEmail } from '../core/validators.js';
import { supabaseBridge } from '../../bridges/supabase/index.js';
import { getDefaultAdapter } from '../../commerce/payment_adapters/index.js';
import { resolvePrice } from '../../commerce/provider_maps/index.js';
import { resolveMonetizationFlow } from '../../pillars/monetization/index.js';
import { getPlanById, resolvePlanByAccessLevel } from '../../pillars/monetization/plans/index.js';

const registry = new Map();

let syncDebounceTimer = null;
let systemInitialized = false;
let errorLoggerInitialized = false;

const dispatchingLocks = new Map();

function resolveCurrentProfile() {
  const fromState = state.get('systemInitialized');
  if (fromState) return fromState;
  const fromStorage = storage.get('user_profile');
  return fromStorage.success && fromStorage.data ? fromStorage.data : null;
}

function resolveAuthenticatedUser() {
  return state.get('user') || null;
}

function resolveCurrentPlan(profile = {}) {
  if (profile.plan_id) {
    return getPlanById(profile.plan_id);
  }

  return resolvePlanByAccessLevel(profile.access_level ?? profile.level ?? 0);
}

function resolveCheckoutTargetPlan(profile = {}, monetizationFlow) {
  const currentPlan = resolveCurrentPlan(profile);
  const grantedPlan = monetizationFlow.product?.grantsPlanId
    ? getPlanById(monetizationFlow.product.grantsPlanId)
    : currentPlan;

  return grantedPlan.accessLevel >= currentPlan.accessLevel
    ? grantedPlan
    : currentPlan;
}

export const actions = {
  _resetForTests() {
    if (syncDebounceTimer) {
      clearTimeout(syncDebounceTimer);
    }
    syncDebounceTimer = null;
    systemInitialized = false;
    errorLoggerInitialized = false;
    dispatchingLocks.clear();
    registry.clear();
  },

  register(actionName, handler) {
    if (typeof handler !== 'function') throw new Error('Handler must be a function');
    registry.set(actionName, handler);
  },

  dispatch(actionName, payload) {
    if (dispatchingLocks.get(actionName)) {
      console.warn(`[Actions] DEDUPLICATION: Action '${actionName}' already dispatching. Request ignored.`);
      return { success: false, error: 'Action already in progress', deduplicated: true };
    }

    const handler = registry.get(actionName);
    if (!handler) {
      console.warn(`[Actions] Action '${actionName}' not found in registry`);
      return { success: false, error: 'Action not registered' };
    }

    dispatchingLocks.set(actionName, true);

    try {
      const result = handler(payload);

      if (result === null || result === undefined) {
        console.error(`[Actions] Handler for '${actionName}' returned null/undefined`);
        dispatchingLocks.delete(actionName);
        return { success: false, error: 'Handler returned null/undefined' };
      }

      if (typeof result !== 'object') {
        console.error(`[Actions] Handler for '${actionName}' returned non-object: ${typeof result}`);
        dispatchingLocks.delete(actionName);
        return { success: false, error: `Handler returned ${typeof result} instead of object` };
      }

      if (typeof result.then === 'function') {
        return result
          .catch((error) => {
            console.error(`[Actions] Async handler for '${actionName}' rejected:`, error);
            return { success: false, error: error.message };
          })
          .finally(() => {
            dispatchingLocks.delete(actionName);
          });
      }

      dispatchingLocks.delete(actionName);
      return result;
    } catch (error) {
      dispatchingLocks.delete(actionName);
      console.error(`[Actions] Handler for '${actionName}' threw:`, error);
      return { success: false, error: error.message };
    }
  },

  async initSystem() {
    if (systemInitialized) {
      return { success: true, data: state.get('systemInitialized') };
    }
    systemInitialized = true;

    if (!errorLoggerInitialized) {
      try {
        const { errorLogger } = await import('./observability/error_logger.js');
        errorLogger.init();
        errorLoggerInitialized = true;
      } catch (err) {
        console.warn('[System Boot] Error logger init failed:', err.message);
      }
    }

    const bridgeInitialized = supabaseBridge.init();
    const storedUserData = storage.get('user_profile');
    const initialProfile = storedUserData.success && storedUserData.data
      ? storedUserData.data
      : {
        isNewUser: true,
        streak: 0,
        shields: 0,
        unlocked_tools: []
      };

    state._authorizedEmit('systemInitialized', initialProfile);

    if (bridgeInitialized) {
      try {
        const res = await supabaseBridge.getSession();
        if (res.success && res.data) {
          state.set('user', res.data.user);
          state._authorizedEmit('userAuthChanged', res.data.user);
          await this.pullCloudData(res.data.user.id);
        }
      } catch (err) {
        console.warn('[System Boot] Session hydration failed:', err.message);
      }
    }

    state.subscribe('streakUpdated', () => this.debouncedSync());
    state.subscribe('analyticsTrack', (eventData) => supabaseBridge.logEvent(eventData));

    return { success: true, data: initialProfile };
  },

  async triggerCheckIn() {
    const currentProfile = resolveCurrentProfile() || { streak: 0, shields: 0 };
    const result = streakManager.calculateCheckIn(currentProfile, new Date());

    if (result.success) {
      const newProfile = {
        ...result.data.profile,
        updatedAt: new Date().toISOString()
      };
      await storage.set('user_profile', newProfile);
      state._authorizedEmit('systemInitialized', newProfile);
      state.emit('streakUpdated', { ...result.data, profile: newProfile });
      return { success: true, data: { ...result.data, profile: newProfile } };
    }

    state.emit('checkInFailed', { message: result.error });
    return result;
  },

  showPaywall(featureName) {
    const reason = IS_COMMERCIAL_MODE_ACTIVE ? 'paywall_active' : 'commercial_mode_inactive';
    state.emit('paywallRequested', {
      feature: featureName,
      reason,
      badge: MBRN_CONFIG.commercial.soonBadgeLabel
    });
    return {
      success: false,
      error: reason,
      data: {
        feature: featureName,
        badge: MBRN_CONFIG.commercial.soonBadgeLabel
      }
    };
  },

  async syncProfileToCloud() {
    state._authorizedEmit('syncStarted');

    const currentProfile = resolveCurrentProfile();
    if (!currentProfile) {
      state._authorizedEmit('syncFailed', { error: 'No profile locally available' });
      return { success: false, error: 'No profile' };
    }

    const user = resolveAuthenticatedUser();
    if (!user?.id) {
      state._authorizedEmit('syncFailed', { error: 'Cloud sync requires authenticated user' });
      return { success: false, error: 'Auth required', offline: true };
    }

    const currentPlan = resolveCurrentPlan(currentProfile);
    const response = await supabaseBridge.saveProfile({
      ...currentProfile,
      id: currentProfile.id || user.id,
      plan_id: currentProfile.plan_id || currentPlan.id,
      access_level: currentProfile.access_level ?? currentProfile.level ?? currentPlan.accessLevel,
      level: currentProfile.level ?? currentProfile.access_level ?? currentPlan.accessLevel
    });

    if (response.success) {
      state._authorizedEmit('syncSuccess', response.data);
      return { success: true, data: response.data };
    }

    state._authorizedEmit('syncFailed', { error: response.error });
    return { success: false, error: response.error };
  },

  _validateEmail(email) {
    const result = validateEmail(email);
    if (!result.success) {
      return { valid: false, reason: result.error };
    }
    return { valid: true, normalizedEmail: result.data };
  },

  async registerAccount(email, password) {
    const validation = this._validateEmail(email);
    if (!validation.valid) {
      return {
        success: false,
        error: `${i18n.t('securityBlock')}: ${validation.reason} ${i18n.t('useRealEmail')}`
      };
    }

    const res = await supabaseBridge.signUp(validation.normalizedEmail, password);
    if (res.success) {
      state.set('user', res.data.user);
      state._authorizedEmit('userAuthChanged', res.data.user);
      return { success: true, data: res.data.user };
    }
    return res;
  },

  async login(email, password) {
    const res = await supabaseBridge.signIn(email, password);
    if (res.success) {
      state.set('user', res.data.user);
      state._authorizedEmit('userAuthChanged', res.data.user);
      return { success: true, data: res.data.user };
    }
    return res;
  },

  async logout() {
    const res = await supabaseBridge.signOut();
    if (res.success) {
      state.set('user', null);
      state._authorizedEmit('userAuthChanged', null);
      return { success: true };
    }
    return res;
  },

  debouncedSync(delay = 2000) {
    const user = resolveAuthenticatedUser();
    if (!user?.id) {
      return { success: false, error: 'Auth required for debounced sync' };
    }

    if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
    syncDebounceTimer = setTimeout(() => this.syncProfileToCloud(), delay);
    return { success: true, scheduled: true };
  },

  async pullCloudData(userId) {
    state._authorizedEmit('syncStarted');

    const cloudRes = await supabaseBridge.getProfile(userId);
    if (!cloudRes.success || !cloudRes.data) {
      state._authorizedEmit('syncFailed', { error: cloudRes.error || 'Cloud profile unavailable' });
      return;
    }

    const localProfile = resolveCurrentProfile();
    const cloudProfile = cloudRes.data;
    const localTime = new Date(localProfile?.updatedAt || 0).getTime();
    const cloudTime = new Date(cloudProfile.last_sync).getTime();

    if (cloudTime > localTime) {
      const resolvedPlan = resolveCurrentPlan(cloudProfile);
      const mergedProfile = {
        ...localProfile,
        plan_id: cloudProfile.plan_id || resolvedPlan.id,
        level: cloudProfile.access_level ?? resolvedPlan.accessLevel,
        access_level: cloudProfile.access_level ?? resolvedPlan.accessLevel,
        streak: cloudProfile.current_streak,
        current_streak: cloudProfile.current_streak,
        shields: cloudProfile.shields,
        display_name: cloudProfile.display_name,
        id: userId,
        updatedAt: cloudProfile.last_sync
      };
      await storage.set('user_profile', mergedProfile);
      state._authorizedEmit('systemInitialized', mergedProfile);
    } else if (localTime > cloudTime) {
      await this.syncProfileToCloud();
    }

    state._authorizedEmit('syncSuccess');
  },

  async syncAppData(appId, data) {
    const user = state.get('user');
    if (!user) return;

    state._authorizedEmit('syncStarted');
    const res = await supabaseBridge.saveAppData(user.id, appId, data);
    if (res.success) {
      state._authorizedEmit('syncSuccess');
    } else {
      state._authorizedEmit('syncFailed');
    }
  },

  async startCheckout(productId = 'artifact') {
    const currentProfile = resolveCurrentProfile() || {};
    const currentPlan = resolveCurrentPlan(currentProfile);
    const monetizationFlow = resolveMonetizationFlow({
      productId,
      planId: currentProfile.plan_id || currentPlan.id,
      accessLevel: currentProfile.access_level ?? currentProfile.level ?? currentPlan.accessLevel
    });

    if (monetizationFlow.policyState === 'commercial_mode_inactive') {
      return this.showPaywall(productId);
    }

    if (monetizationFlow.policyState === 'unknown_product') {
      return { success: false, error: 'unknown_product' };
    }

    if (monetizationFlow.policyState === 'catalog_only') {
      return { success: false, error: 'catalog_only' };
    }

    const user = state.get('user');
    if (!user) {
      state.emit('paywallRequested', { feature: 'checkout', error: 'Bitte logge dich zuerst ein.' });
      return { success: false, error: 'Auth required' };
    }

    if (!monetizationFlow.checkoutReady) {
      return { success: false, error: monetizationFlow.policyState };
    }

    state._authorizedEmit('syncStarted');
    const providerName = monetizationFlow.product?.provider || 'stripe';
    const providerConfig = resolvePrice(productId, providerName);
    const paymentAdapter = getDefaultAdapter();
    if (!providerConfig?.priceId || !paymentAdapter) {
      state._authorizedEmit('syncFailed');
      return { success: false, error: 'Checkout product is not configured' };
    }

    const targetPlan = resolveCheckoutTargetPlan(currentProfile, monetizationFlow);
    const res = await paymentAdapter.createCheckoutSession({
      priceId: providerConfig.priceId,
      mode: providerConfig.mode,
      billingPeriod: providerConfig.billingPeriod,
      productId: monetizationFlow.product.id,
      planId: targetPlan.id,
      accessLevel: targetPlan.accessLevel
    });

    if (res.success && res.data?.url) {
      state.emit('checkoutRedirectRequested', { url: res.data.url });
      return { success: true, redirecting: true };
    }

    state._authorizedEmit('syncFailed');
    return res;
  },

  async handlePaymentSuccess(sessionId) {
    if (!IS_COMMERCIAL_MODE_ACTIVE) {
      state._authorizedEmit('paymentFailed', {
        sessionId,
        error: 'Commercial mode inactive',
        code: 'COMMERCIAL_MODE_INACTIVE'
      });
      return { success: false, error: 'Commercial mode inactive' };
    }

    const paymentAdapter = getDefaultAdapter();
    if (!paymentAdapter) {
      state._authorizedEmit('paymentFailed', {
        sessionId,
        error: 'Payment adapter unavailable',
        code: 'ADAPTER_UNAVAILABLE'
      });
      return { success: false, error: 'Payment adapter unavailable' };
    }

    const res = await paymentAdapter.verifySession(sessionId);

    if (res.success) {
      state._authorizedEmit('paymentVerified', res.data);
      return { success: true, data: res.data };
    }

    state._authorizedEmit('paymentFailed', { sessionId, error: res.error, code: res.code });
    return { success: false, error: res.error || 'Payment verification failed' };
  }
};
