/**
 * /shared/core/actions.js
 * Central Action Orchestrator - Orchestrates Logic & State Emits
 *
 * STRICT RULE: ZERO DOM MANIPULATION HERE.
 */

import { state } from './state.js';
import { storage } from './storage.js';
import { streakManager } from '../loyalty/streak_manager.js';
import { api } from './api.js';
import { MBRN_CONFIG } from './config.js';
import { i18n } from './i18n.js';

// Fix #2 (Phase 0.5): Private Registry — nicht exportiert, nicht von außen erreichbar
const _registry = new Map();

// Removed immediate actions registry to satisfy Law 17 (Inversion of Control)
let _syncDebounceTimer = null;
let _systemInitialized = false;  // Idempotency Guard

// P1 SECURITY: Global dispatch lock for request deduplication
// Prevents duplicate concurrent requests of the same action type
const _dispatchingLocks = new Map();

// Fix #3 (Phase 0.7): Private Hilfsfunktion — kein this, kein export, reine Closure
function resolveCurrentProfile() {
  const fromState = state.get('systemInitialized');
  if (fromState) return fromState;
  const fromStorage = storage.get('user_profile');
  return (fromStorage.success && fromStorage.data) ? fromStorage.data : null;
}

export const actions = {

  register(actionName, handler) {
    if (typeof handler !== 'function') throw new Error('Handler must be a function');
    _registry.set(actionName, handler);
  },

  dispatch(actionName, payload) {
    // P1 SECURITY: Deduplication - reject if same action type already running
    if (_dispatchingLocks.get(actionName)) {
      console.warn(`[Actions] DEDUPLICATION: Action '${actionName}' already dispatching. Request ignored.`);
      return { success: false, error: 'Action already in progress', deduplicated: true };
    }

    const handler = _registry.get(actionName);
    if (!handler) {
      console.warn(`[Actions] Action '${actionName}' not found in registry`);
      return { success: false, error: 'Action not registered' };
    }

    // Set dispatch lock
    _dispatchingLocks.set(actionName, true);

    // Error-Boundary: crashende Handler werden isoliert (sync + async)
    try {
      const result = handler(payload);
      // Fix: Explicit warning for null/undefined returns
      if (result === null || result === undefined) {
        console.error(`[Actions] Handler for '${actionName}' returned null/undefined`);
        return { success: false, error: 'Handler returned null/undefined' };
      }
      // Additional guard: Ensure handler returns an object
      if (typeof result !== 'object') {
        console.error(`[Actions] Handler for '${actionName}' returned non-object: ${typeof result}`);
        return { success: false, error: `Handler returned ${typeof result} instead of object` };
      }
      // Handle async handlers (Promise rejection catching)
      if (typeof result.then === 'function') {
        return result
          .catch(error => {
            console.error(`[Actions] Async handler for '${actionName}' rejected:`, error);
            return { success: false, error: error.message };
          })
          .finally(() => {
            _dispatchingLocks.delete(actionName);
          });
      }
      _dispatchingLocks.delete(actionName);
      return result;
    } catch (error) {
      _dispatchingLocks.delete(actionName);
      console.error(`[Actions] Handler for '${actionName}' threw:`, error);
      return { success: false, error: error.message };
    }
  },

  /**
   * BOOT-SEQUENZ
   * Lädt Daten aus dem LocalStorage und hydratisiert den State (Memory).
   * Idempotent: Mehrfache Aufrufe sind sicher.
   */
  initSystem() {
    if (_systemInitialized) {
      return { success: true, data: state.get('systemInitialized') };
    }
    _systemInitialized = true;

    // Phase 13.2: Initialize Cloud Gateway
    const apiInitialized = api.init();

    const storedUserData = storage.get('user_profile');
    let initialProfile;

    if (storedUserData.success && storedUserData.data) {
      initialProfile = storedUserData.data;
    } else {
      initialProfile = {
        isNewUser: true,
        streak: 0,
        shields: 0,
        unlocked_tools: []
      };
    }

    // Phase 14: Session Hydration
    if (apiInitialized) {
      api.getSession()
        .then(res => {
          if (res.success && res.data) {
            state.set('user', res.data.user);
            state._authorizedEmit('userAuthChanged', res.data.user);
            // Phase 15: Perform initial cloud mirroring
            this.pullCloudData(res.data.user.id);
          }
        })
        .catch(err => {
          console.warn('[System Boot] Session hydration failed:', err.message);
        });
    }

    state._authorizedEmit('systemInitialized', initialProfile);

    // Phase 15: Reactive Sync Hooks
    state.subscribe('streakUpdated', () => this.debouncedSync());

    // Phase 16.4: Global Analytics Listener
    state.subscribe('analyticsTrack', (eventData) => api.logEvent(eventData));

    // NOTE: Actions are now registered immediately on module load (see top of file)
    // This ensures actions work even if initSystem hasn't been called yet.

    return { success: true, data: initialProfile };
  },

  /**
   * Gamification Action (Phase 5)
   */
  triggerCheckIn() {
    const currentProfile = resolveCurrentProfile() || { streak: 0, shields: 0 };
    const result = streakManager.calculateCheckIn(currentProfile, new Date());

    if (result.success) {
      const newProfile = result.data.profile;
      storage.set('user_profile', newProfile);
      state._authorizedEmit('systemInitialized', newProfile);
      state.emit('streakUpdated', result.data);
      return { success: true, data: result.data };
    } else {
      state.emit('checkInFailed', { message: result.error });
      return result;
    }
  },

  /**
   * Monetization Hooks (Phase 11)
   */
  showPaywall(featureName) {
    state.emit('paywallRequested', { feature: featureName });
    return { success: false, error: 'paywall_active', data: { feature: featureName } };
  },

  /**
   * Network Sync (Phase 12)
   */
  async syncProfileToCloud() {
    state._authorizedEmit('syncStarted');

    const currentProfile = resolveCurrentProfile();
    if (!currentProfile) {
      state._authorizedEmit('syncFailed', { error: 'No profile locally available' });
      return { success: false, error: 'No profile' };
    }

    const response = await api.saveProfile(currentProfile);

    if (response.success) {
      state._authorizedEmit('syncSuccess', response.data);
      return { success: true, data: response.data };
    } else {
      state._authorizedEmit('syncFailed', { error: response.error });
      return { success: false, error: response.error };
    }
  },

  /**
   * --- AUTH ACTIONS (Phase 14) ---
   */

  // Bounce-Shield: Blocked domains to protect Supabase from ban
  _blockedDomains: [
    'test.com', 'example.com', 'fake.com', 'asdf.com', 'email.com',
    'mailinator.com', 'tempmail.com', 'throwaway.email', 'guerrillamail.com',
    'yopmail.com', 'sharklasers.com', 'trash-mail.com'
  ],

  _validateEmail(email) {
    if (!email || !email.includes('@')) {
      return { valid: false, reason: i18n.t('invalidEmail') };
    }
    const domain = email.split('@')[1]?.toLowerCase();
    const local = email.split('@')[0]?.toLowerCase();

    // Block known disposable/fake domains
    if (this._blockedDomains.includes(domain)) {
      return { valid: false, reason: `${i18n.t('blockedDomain').replace('Domain', `Domain "${domain}"`)}` };
    }

    // Block obvious trash patterns (asd@asd.com, a@b.com, etc.)
    if (local.length <= 2 && domain.length <= 6) {
      return { valid: false, reason: i18n.t('disposableEmail') };
    }

    return { valid: true };
  },

  async registerAccount(email, password) {
    // BOUNCE-SHIELD: Validate BEFORE any Supabase call
    const validation = this._validateEmail(email);
    if (!validation.valid) {
      return {
        success: false,
        error: `${i18n.t('securityBlock')}: ${validation.reason} ${i18n.t('useRealEmail')}`
      };
    }

    const res = await api.signUp(email, password);
    if (res.success) {
      state.set('user', res.data.user);
      state._authorizedEmit('userAuthChanged', res.data.user);
      return { success: true, data: res.data.user };
    }
    return res;
  },

  async login(email, password) {
    const res = await api.signIn(email, password);
    if (res.success) {
      state.set('user', res.data.user);
      state._authorizedEmit('userAuthChanged', res.data.user);
      return { success: true, data: res.data.user };
    }
    return res;
  },

  async logout() {
    const res = await api.signOut();
    if (res.success) {
      state.set('user', null);
      state._authorizedEmit('userAuthChanged', null);
      return { success: true };
    }
    return res;
  },

  /**
   * --- CLOUD SYNC ENGINE (Phase 15) ---
   */

  debouncedSync(delay = 2000) {
    if (_syncDebounceTimer) clearTimeout(_syncDebounceTimer);
    _syncDebounceTimer = setTimeout(() => this.syncProfileToCloud(), delay);
  },

  async pullCloudData(userId) {
    state.emit('syncStarted');

    const cloudRes = await api.getProfile(userId);
    if (!cloudRes.success || !cloudRes.data) {
      state.emit('syncFailed');
      return;
    }

    const localProfile = resolveCurrentProfile();
    const cloudProfile = cloudRes.data;

    // Conflict Resolution: Last Write Wins (using timestamps)
    // We assume locally stored data has an 'updatedAt' field (added below)
    const localTime = new Date(localProfile?.updatedAt || 0).getTime();
    const cloudTime = new Date(cloudProfile.last_sync).getTime();

    if (cloudTime > localTime) {
      storage.set('user_profile', {
        ...localProfile,
        level: cloudProfile.access_level,
        streak: cloudProfile.current_streak,
        shields: cloudProfile.shields,
        display_name: cloudProfile.display_name,
        updatedAt: cloudProfile.last_sync
      });
      state.set('systemInitialized', storage.get('user_profile').data);
    } else if (localTime > cloudTime) {
      this.syncProfileToCloud();
    }

    state._authorizedEmit('syncSuccess');
  },

  async syncAppData(appId, data) {
    const user = state.get('user');
    if (!user) return;

    state._authorizedEmit('syncStarted');
    const res = await api.saveAppData(user.id, appId, data);
    if (res.success) {
      state._authorizedEmit('syncSuccess');
    } else {
      state._authorizedEmit('syncFailed');
    }
  },

  /**
   * --- STRIPE CHECKOUT FLOW (Phase 18.2) ---
   */
  async startCheckout(productId = 'artifact') {
    const user = state.get('user');
    if (!user) {
      // User must be logged in to buy
      state.emit('paywallRequested', { feature: 'checkout', error: 'Bitte logge dich zuerst ein.' });
      return { success: false, error: 'Auth required' };
    }

    state._authorizedEmit('syncStarted'); // Show loader
    const priceId = productId === 'artifact' 
      ? MBRN_CONFIG.stripe.priceIdArtifact 
      : MBRN_CONFIG.stripe.priceIdArtifact; // Default for now

    const res = await api.createCheckoutSession(priceId);

    if (res.success && res.data?.url) {
      // P2.4 Cleanup: Delegate redirect logic to UI layer via event emit
      state.emit('checkoutRedirectRequested', { url: res.data.url });
      return { success: true, redirecting: true };
    } else {
      state._authorizedEmit('syncFailed');
      return res;
    }
  },

  async handlePaymentSuccess(sessionId) {
    // Phase 18.3: Verify payment with Cloud Fortress
    const res = await api.verifySession(sessionId);

    if (res.success) {
      state._authorizedEmit('paymentVerified', res.data);
      return { success: true, data: res.data };
    }

    // Verification failed — payment not confirmed
    state._authorizedEmit('paymentFailed', { sessionId, error: res.error, code: res.code });
    return { success: false, error: res.error || 'Payment verification failed' };
  }
};
