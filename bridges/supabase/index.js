import { withCircuitBreaker } from '../../shared/application/resilience/circuit_breaker.js';
import { createBridgeSuccess, createBridgeFailure } from '../../shared/core/contracts/bridge_result.js';
import {
  checkSupabaseConnection,
  getSupabaseClient,
  getSupabaseStatus,
  initSupabaseClient,
  resetSupabaseClientForTests,
  setSupabaseCredentials
} from './client.js';

export const supabaseBridge = {
  _setCredentials(url, key) {
    setSupabaseCredentials(url, key);
  },

  _resetForTests() {
    resetSupabaseClientForTests();
  },

  get client() {
    return getSupabaseStatus().client;
  },

  get isOnline() {
    return getSupabaseStatus().isOnline;
  },

  init() {
    return initSupabaseClient();
  },

  async checkConnection() {
    return checkSupabaseConnection();
  },

  async getSystemStatusPing() {
    const client = getSupabaseClient();
    if (!client || !this.isOnline) {
      return createBridgeFailure('supabase.system_status', 'Offline', { offline: true });
    }

    const { data, error } = await client
      .from('system_status')
      .select('id,last_ping')
      .eq('id', 1)
      .maybeSingle();

    return error
      ? createBridgeFailure('supabase.system_status', error.message)
      : createBridgeSuccess('supabase.system_status', data);
  },

  async getLatestReactorHeartbeat() {
    return this.getSystemStatusPing();
  },

  async signUp(email, password) {
    const client = getSupabaseClient();
    if (!client) return createBridgeFailure('supabase.auth.signUp', 'Offline');
    return withCircuitBreaker('supabase', async () => {
      const { data, error } = await client.auth.signUp({ email, password });
      if (error) return createBridgeFailure('supabase.auth.signUp', error.message);
      return createBridgeSuccess('supabase.auth.signUp', data);
    });
  },

  async signIn(email, password) {
    const client = getSupabaseClient();
    if (!client) return createBridgeFailure('supabase.auth.signIn', 'Offline');
    return withCircuitBreaker('supabase', async () => {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) return createBridgeFailure('supabase.auth.signIn', error.message);
      return createBridgeSuccess('supabase.auth.signIn', data);
    });
  },

  async signOut() {
    const client = getSupabaseClient();
    if (!client) return createBridgeFailure('supabase.auth.signOut', 'Offline');
    const { error } = await client.auth.signOut();
    return error
      ? createBridgeFailure('supabase.auth.signOut', error.message)
      : createBridgeSuccess('supabase.auth.signOut', null);
  },

  async getSession() {
    const client = getSupabaseClient();
    if (!client) return createBridgeFailure('supabase.auth.getSession', 'Offline');
    const { data, error } = await client.auth.getSession();
    return error
      ? createBridgeFailure('supabase.auth.getSession', error.message)
      : createBridgeSuccess('supabase.auth.getSession', data.session);
  },

  async saveProfile(profileData) {
    const client = getSupabaseClient();
    if (!this.isOnline || !client) {
      return createBridgeFailure('supabase.profile.save', 'Offline', { offline: true });
    }

    if (!profileData?.id) {
      return createBridgeFailure('supabase.profile.save', 'Authenticated user required for cloud sync', { offline: true });
    }

    return withCircuitBreaker('supabase', async () => {
      const { data, error } = await client
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
      return { success: true, data: data[0] };
    });
  },

  async getProfile(userId) {
    const client = getSupabaseClient();
    if (!userId) return createBridgeFailure('supabase.profile.get', 'Authenticated user required', { offline: true });
    if (!this.isOnline || !client) return createBridgeFailure('supabase.profile.get', 'Offline', { offline: true });
    return withCircuitBreaker('supabase', async () => {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return createBridgeSuccess('supabase.profile.get', data);
    });
  },

  async saveAppData(userId, appId, payload) {
    const client = getSupabaseClient();
    if (!this.isOnline || !client) {
      return createBridgeFailure('supabase.app_data.save', 'Offline');
    }
    const { data, error } = await client
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
    const client = getSupabaseClient();
    if (!this.isOnline || !client) {
      return createBridgeFailure('supabase.app_data.get', 'Offline');
    }
    const { data, error } = await client
      .from('app_data')
      .select('*')
      .eq('user_id', userId)
      .eq('app_id', appId)
      .single();
    return error
      ? createBridgeFailure('supabase.app_data.get', error.message)
      : createBridgeSuccess('supabase.app_data.get', data);
  },

  async logEvent(eventData) {
    const client = getSupabaseClient();
    if (!this.isOnline || !client) return createBridgeFailure('supabase.analytics.log', 'Offline');

    const userResult = await client.auth.getUser();
    try {
      await client.from('analytics_logs').insert({
        event_name: eventData.event,
        source_app: eventData.source,
        user_id: userResult.data?.user?.id || null,
        metadata: eventData.data || {},
        created_at: new Date().toISOString()
      });
    } catch (err) {
      return createBridgeFailure('supabase.analytics.log', err.message);
    }

    return createBridgeSuccess('supabase.analytics.log', null);
  }
};
