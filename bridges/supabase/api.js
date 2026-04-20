import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { withCircuitBreaker } from '../../shared/application/resilience/circuit_breaker.js';
import { createBridgeSuccess, createBridgeFailure } from '../../shared/core/contracts/bridge_result.js';
import { state } from '../../shared/core/state/index.js';

/**
 * /shared/core/api.js
 * THE CLOUD GATEWAY (Supabase Integration)
 *
 * ARCHITECTURE LAW:
 * 1. Cloud-First, Offline-Always (Instant UX via LocalStorage Fallback).
 * 2. Row Level Security (RLS) mandated.
 * 3. Sync-Debouncing to protect API limits.
 *
 * RLS VERIFICATION: PASSED (13.04.2026)
 * - profiles: SELECT (auth.uid() = id)
 * - profiles: INSERT (auth.uid() = id)
 * - profiles: UPDATE (auth.uid() = id)
 * - DELETE: Not allowed (no policy)
 */

// --- CONFIGURATION ---
// Public frontend constants for GitHub Pages deployment.
// Replace these placeholders with the real Supabase project values.
const PUBLIC_SUPABASE_URL = 'https://wqfijgzlxypqftwwoxxp.supabase.co';
const PUBLIC_SUPABASE_ANON_KEY = 'sb_publishable_2K9K_RcFJyO5VS2XYlAWag_qFJuKseO';

let SUPABASE_URL = PUBLIC_SUPABASE_URL;
let SUPABASE_KEY = PUBLIC_SUPABASE_ANON_KEY;

export const api = {
  client: null,
  isOnline: false,

  _setCredentials(url, key) {
    SUPABASE_URL = url;
    SUPABASE_KEY = key;
  },

  _resetForTests() {
    this.client = null;
    this.isOnline = false;
  },

  /**
   * Initializes the Supabase client
   * SINGLETON PATTERN: Prevents multiple GoTrueClient instances
   */
  init() {
    if (this.client) {
      return true;
    }

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return false;
    }

    try {
      this.client = createClient(SUPABASE_URL, SUPABASE_KEY);
      this.isOnline = true;
      return true;
    } catch (err) {
      console.error('[API] Initialization failed:', err);
      this.isOnline = false;
      return false;
    }
  },

  /**
   * Helper to check connection status
   */
  async checkConnection() {
    if (!this.client) return false;
    const { error } = await this.client.from('profiles').select('count', { count: 'exact', head: true });
    this.isOnline = !error;
    return this.isOnline;
  },

  /**
   * Reads the system heartbeat timestamp from the singleton system_status row.
   * Used by the dashboard to render "System online/offline".
   */
  async getSystemStatusPing() {
    if (!this.client) return createBridgeFailure('supabase.system_status', 'Offline', { offline: true });
    if (!this.isOnline || !this.client) return createBridgeFailure('supabase.system_status', 'Offline', { offline: true });

    const { data, error } = await this.client
      .from('system_status')
      .select('id,last_ping')
      .eq('id', 1)
      .maybeSingle();

    return error
      ? createBridgeFailure('supabase.system_status', error.message)
      : createBridgeSuccess('supabase.system_status', data);
  },

  // Backward-compatible alias for older callers.
  async getLatestReactorHeartbeat() {
    return this.getSystemStatusPing();
  },

  /**
   * --- AUTHENTICATION (Phase 14) ---
   */

  async signUp(email, password) {
    if (!this.client) return createBridgeFailure('supabase.auth.signUp', 'Offline');
    return withCircuitBreaker('supabase', async () => {
      const { data, error } = await this.client.auth.signUp({ email, password });
      if (error) return createBridgeFailure('supabase.auth.signUp', error.message);
      return createBridgeSuccess('supabase.auth.signUp', data);
    });
  },

  async signIn(email, password) {
    if (!this.client) return createBridgeFailure('supabase.auth.signIn', 'Offline');
    return withCircuitBreaker('supabase', async () => {
      const { data, error } = await this.client.auth.signInWithPassword({ email, password });
      if (error) return createBridgeFailure('supabase.auth.signIn', error.message);
      return createBridgeSuccess('supabase.auth.signIn', data);
    });
  },

  async signOut() {
    if (!this.client) return createBridgeFailure('supabase.auth.signOut', 'Offline');
    const { error } = await this.client.auth.signOut();
    return error
      ? createBridgeFailure('supabase.auth.signOut', error.message)
      : createBridgeSuccess('supabase.auth.signOut', null);
  },

  async getSession() {
    if (!this.client) return createBridgeFailure('supabase.auth.getSession', 'Offline');
    const { data, error } = await this.client.auth.getSession();
    return error
      ? createBridgeFailure('supabase.auth.getSession', error.message)
      : createBridgeSuccess('supabase.auth.getSession', data.session);
  },

  /**
   * --- PROFILE SYNC ---
   */
  async saveProfile(profileData) {
    if (!this.isOnline || !this.client) {
      return createBridgeFailure('supabase.profile.save', 'Offline', { offline: true });
    }

    if (!profileData?.id) {
      return createBridgeFailure('supabase.profile.save', 'Authenticated user required for cloud sync', { offline: true });
    }

    return withCircuitBreaker('supabase', async () => {
      const { data, error } = await this.client
        .from('profiles')
        .upsert({
          id: profileData.id,
          display_name: profileData.display_name || profileData.name,
          access_level: profileData.access_level || profileData.level,
          current_streak: profileData.current_streak || profileData.streak,
          shields: profileData.shields,
          last_sync: new Date().toISOString()
        })
        .select();

      if (error) throw error;
      return createBridgeSuccess('supabase.profile.save', data[0]);
    });
  },

  async getProfile(userId) {
    if (!userId) return createBridgeFailure('supabase.profile.get', 'Authenticated user required', { offline: true });
    if (!this.isOnline || !this.client) return createBridgeFailure('supabase.profile.get', 'Offline', { offline: true });
    return withCircuitBreaker('supabase', async () => {
      const { data, error } = await this.client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return createBridgeSuccess('supabase.profile.get', data);
    });
  },

  /**
   * --- APP DATA SYNC ---
   */

  async saveAppData(userId, appId, payload) {
    if (!this.isOnline || !this.client) return createBridgeFailure('supabase.app_data.save', 'Offline');
    const { data, error } = await this.client
      .from('app_data')
      .upsert({
        user_id: userId,
        app_id: appId,
        payload,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,app_id' })
      .select();

    return error
      ? createBridgeFailure('supabase.app_data.save', error.message)
      : createBridgeSuccess('supabase.app_data.save', data[0]);
  },

  async getAppData(userId, appId) {
    if (!this.isOnline || !this.client) return createBridgeFailure('supabase.app_data.get', 'Offline');
    const { data, error } = await this.client
      .from('app_data')
      .select('*')
      .eq('user_id', userId)
      .eq('app_id', appId)
      .single();
    return error
      ? createBridgeFailure('supabase.app_data.get', error.message)
      : createBridgeSuccess('supabase.app_data.get', data);
  },

  /**
   * --- ANALYTICS (Phase 16.4) ---
   */
  async logEvent(eventData) {
    if (!this.isOnline || !this.client) {
      return createBridgeFailure('supabase.analytics.log', 'Offline');
    }

    try {
      await this.client.from('analytics_logs').insert({
        event_name: eventData.event,
        source_app: eventData.source,
        user_id: (await this.client.auth.getUser()).data?.user?.id || null,
        metadata: eventData.data || {},
        created_at: new Date().toISOString()
      });
    } catch (err) {
      state._authorizedEmit('systemError', {
        type: 'analytics_log_failed',
        error: `Analytics logging failed: ${err.message}`,
        severity: 'low',
        context: { event: eventData.event, source: eventData.source }
      });
      return createBridgeFailure('supabase.analytics.log', err.message);
    }

    return createBridgeSuccess('supabase.analytics.log', null);
  }
};
