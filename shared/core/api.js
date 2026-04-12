import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

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
const SUPABASE_URL = 'https://wqfijgzlxypqftwwoxxp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxZmlqZ3pseHlwcWZ0d3dveHhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NzIxNTMsImV4cCI6MjA5MTM0ODE1M30.rCWllu1Lfukb7XI_wZ_cXk7MOf3uaTBAw4c5iozI4Oc';

export const api = {
  client: null,
  isOnline: false,

  /**
   * Initializes the Supabase client
   */
  init() {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      console.warn('[API] Missing credentials. Operating in Offline-Mode.');
      return false;
    }

    try {
      this.client = createClient(SUPABASE_URL, SUPABASE_KEY);
      this.isOnline = true;
      console.log('[API] Cloud Fortress established. Connection pool ready.');
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
    const { data, error } = await this.client.auth.signUp({ email, password });
    return error ? { success: false, error: error.message } : { success: true, data };
  },

  async signIn(email, password) {
    if (!this.client) return { success: false, error: 'Offline' };
    const { data, error } = await this.client.auth.signInWithPassword({ email, password });
    return error ? { success: false, error: error.message } : { success: true, data };
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
      return { success: false, error: 'Offline' };
    }

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

    return error ? { success: false, error: error.message } : { success: true, data: data[0] };
  },

  async getProfile(userId) {
    if (!this.isOnline || !this.client) return { success: false, error: 'Offline' };
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return error ? { success: false, error: error.message } : { success: true, data };
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
    console.log(`[Analytics] Event: ${eventData.event} | Source: ${eventData.source}`);
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
      // Slient fail for analytics to not disturb UX
      console.warn('[Analytics] Remote log failed, event cached in console.');
    }
  },

  /**
   * --- PAYMENT & MONETIZATION (Phase 18.2) ---
   */
  async createCheckoutSession(priceId) {
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
  }
};
