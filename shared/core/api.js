import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { withCircuitBreaker } from './circuit_breaker.js';
import { IS_COMMERCIAL_MODE_ACTIVE } from './config.js';
import { state } from './state.js';
import { hasBrowserWindow } from './browser_runtime.js';

/**
 * /shared/core/api.js
 * THE CLOUD GATEWAY (Supabase Integration)
 * 
 * ARCHITECTURE LAW: 
 * 1. Cloud-First, Offline-Always (Instant UX via LocalStorage Fallback).
 * 2. Row Level Security (RLS) mandated.
 * 3. Sync-Debouncing to protect API limits.
 * 
 * RLS VERIFICATION: ✅ PASSED (13.04.2026)
 * - profiles: SELECT (auth.uid() = id) ✅
 * - profiles: INSERT (auth.uid() = id) ✅
 * - profiles: UPDATE (auth.uid() = id) ✅
 * - DELETE: Not allowed (no policy) ✅
 */

// --- CONFIGURATION ---
// SECURITY: Credentials loaded from env.js (NOT in version control)
// Falls env.js fehlt → Offline-Modus (graceful degradation)
let SUPABASE_URL = null;
let SUPABASE_KEY = null;
let _envLoaded = false;

// env.js laden, wenn ein Browser-Kontext verfügbar ist.
// Fehlt die Datei, bleibt das System bewusst im Offline-Modus.
async function loadBrowserEnv() {
  if (_envLoaded || !hasBrowserWindow()) return;
  _envLoaded = true;
  try {
    const { ENV } = await import('./env.js');
    SUPABASE_URL = ENV.SUPABASE_URL;
    SUPABASE_KEY = ENV.SUPABASE_ANON_KEY;
  } catch (err) {
    // env.js not found — operating in Offline-Only Mode
    console.log('[API] env.js not found, running in offline mode');
  }
}

await loadBrowserEnv();

export const api = {
  client: null,
  isOnline: false,

  _setCredentials(url, key) {
    SUPABASE_URL = url;
    SUPABASE_KEY = key;
    _envLoaded = true;
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
    // Guard: Return existing client if already initialized
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
    const { data, error } = await this.client.from('profiles').select('count', { count: 'exact', head: true });
    this.isOnline = !error;
    return this.isOnline;
  },

  /**
   * --- AUTHENTICATION (Phase 14) ---
   */

  async signUp(email, password) {
    if (!this.client) return { success: false, error: 'Offline' };
    return withCircuitBreaker('supabase', async () => {
      const { data, error } = await this.client.auth.signUp({ email, password });
      if (error) throw error;
      return data;
    });
  },

  async signIn(email, password) {
    if (!this.client) return { success: false, error: 'Offline' };
    return withCircuitBreaker('supabase', async () => {
      const { data, error } = await this.client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    });
  },

  async signOut() {
    if (!this.client) return { success: false, error: 'Offline' };
    const { error } = await this.client.auth.signOut();
    return error ? { success: false, error: error.message } : { success: true };
  },

  async getSession() {
    if (!this.client) return { success: false, error: 'Offline' };
    const { data, error } = await this.client.auth.getSession();
    return error ? { success: false, error: error.message } : { success: true, data: data.session };
  },

  /**
   * --- PROFILE SYNC ---
   */
  async saveProfile(profileData) {
    if (!this.isOnline || !this.client) {
      return { success: false, error: 'Offline', offline: true };
    }

    if (!profileData?.id) {
      return { success: false, error: 'Authenticated user required for cloud sync', offline: true };
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
      return data[0];
    });
  },

  async getProfile(userId) {
    if (!userId) return { success: false, error: 'Authenticated user required', offline: true };
    if (!this.isOnline || !this.client) return { success: false, error: 'Offline', offline: true };
    return withCircuitBreaker('supabase', async () => {
      const { data, error } = await this.client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    });
  },

  /**
   * --- APP DATA SYNC ---
   */

  async saveAppData(userId, appId, payload) {
    if (!this.isOnline || !this.client) return { success: false, error: 'Offline' };
    const { data, error } = await this.client
      .from('app_data')
      .upsert({ 
        user_id: userId,
        app_id: appId,
        payload: payload,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,app_id' }) // Ensure upsert by user+app
      .select();
    
    return error ? { success: false, error: error.message } : { success: true, data: data[0] };
  },

  async getAppData(userId, appId) {
    if (!this.isOnline || !this.client) return { success: false, error: 'Offline' };
    const { data, error } = await this.client
      .from('app_data')
      .select('*')
      .eq('user_id', userId)
      .eq('app_id', appId)
      .single();
    return error ? { success: false, error: error.message } : { success: true, data };
  },

  /**
   * --- ANALYTICS (Phase 16.4) ---
   */
  async logEvent(eventData) {
    if (!this.isOnline || !this.client) return;

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
      return { success: false, error: err.message };
    }

    return { success: true };
  },

  /**
   * --- PAYMENT & MONETIZATION (Phase 18.2) ---
   */
  async createCheckoutSession(priceId) {
    if (!IS_COMMERCIAL_MODE_ACTIVE) {
      return { success: false, error: 'Commercial mode inactive', code: 'COMMERCIAL_MODE_INACTIVE' };
    }

    if (!this.isOnline || !this.client) {
      return { success: false, error: 'Bezahlvorgang erfordert eine Cloud-Verbindung.' };
    }

    try {
      const { data, error } = await this.client.functions.invoke('stripe-checkout', {
        body: { priceId }
      });

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('[API] Checkout Session creation failed:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Verifies a Stripe Checkout Session by sessionId.
   * Queries the transactions table to confirm successful payment.
   * 
   * @param {string} sessionId - The Stripe Checkout Session ID (cs_test_... or cs_live_...)
   * @returns {Promise<Object>} - Verification result per Gesetz 4
   */
  async verifySession(sessionId) {
    if (!IS_COMMERCIAL_MODE_ACTIVE) {
      return { success: false, error: 'Commercial mode inactive', code: 'COMMERCIAL_MODE_INACTIVE' };
    }

    if (!this.isOnline || !this.client) {
      return { success: false, error: 'Verification requires cloud connection' };
    }

    if (!sessionId || typeof sessionId !== 'string') {
      return { success: false, error: 'Invalid sessionId provided' };
    }

    try {
      // Query transactions table (Stripe Webhook aligned schema)
      // Status values: Webhook writes 'completed', API accepts all successful states
      const { data, error } = await this.client
        .from('transactions')
        .select('id, status, user_id, product_id, amount_total, currency, stripe_session_id, created_at')
        .eq('stripe_session_id', sessionId)
        .in('status', ['succeeded', 'complete', 'paid', 'completed'])
        .single();

      if (error || !data) {
        return { 
          success: false, 
          error: 'Session not found or payment not completed',
          code: 'SESSION_INVALID'
        };
      }

      // Session verified successfully
      return {
        success: true,
        data: {
          sessionId,
          verified: true,
          transaction: data,
          verifiedAt: new Date().toISOString()
        }
      };

    } catch (err) {
      console.error('[API] Session verification failed:', err);
      return { success: false, error: err.message, code: 'VERIFICATION_ERROR' };
    }
  }
};
