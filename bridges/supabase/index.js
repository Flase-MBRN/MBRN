import { withCircuitBreaker } from '../../shared/application/resilience/circuit_breaker.js';
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
    if (!client || !this.isOnline) return { success: false, error: 'Offline', offline: true };

    const { data, error } = await client
      .from('system_status')
      .select('id,last_ping')
      .eq('id', 1)
      .maybeSingle();

    return error ? { success: false, error: error.message } : { success: true, data };
  },

  async getLatestReactorHeartbeat() {
    return this.getSystemStatusPing();
  },

  async signUp(email, password) {
    const client = getSupabaseClient();
    if (!client) return { success: false, error: 'Offline' };
    return withCircuitBreaker('supabase', async () => {
      const { data, error } = await client.auth.signUp({ email, password });
      if (error) throw error;
      return data;
    });
  },

  async signIn(email, password) {
    const client = getSupabaseClient();
    if (!client) return { success: false, error: 'Offline' };
    return withCircuitBreaker('supabase', async () => {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    });
  },

  async signOut() {
    const client = getSupabaseClient();
    if (!client) return { success: false, error: 'Offline' };
    const { error } = await client.auth.signOut();
    return error ? { success: false, error: error.message } : { success: true };
  },

  async getSession() {
    const client = getSupabaseClient();
    if (!client) return { success: false, error: 'Offline' };
    const { data, error } = await client.auth.getSession();
    return error ? { success: false, error: error.message } : { success: true, data: data.session };
  },

  async saveProfile(profileData) {
    const client = getSupabaseClient();
    if (!this.isOnline || !client) {
      return { success: false, error: 'Offline', offline: true };
    }

    if (!profileData?.id) {
      return { success: false, error: 'Authenticated user required for cloud sync', offline: true };
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
      return data[0];
    });
  },

  async getProfile(userId) {
    const client = getSupabaseClient();
    if (!userId) return { success: false, error: 'Authenticated user required', offline: true };
    if (!this.isOnline || !client) return { success: false, error: 'Offline', offline: true };
    return withCircuitBreaker('supabase', async () => {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    });
  },

  async saveAppData(userId, appId, payload) {
    const client = getSupabaseClient();
    if (!this.isOnline || !client) return { success: false, error: 'Offline' };
    const { data, error } = await client
      .from('app_data')
      .upsert({
        user_id: userId,
        app_id: appId,
        payload,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,app_id' })
      .select();

    return error ? { success: false, error: error.message } : { success: true, data: data[0] };
  },

  async getAppData(userId, appId) {
    const client = getSupabaseClient();
    if (!this.isOnline || !client) return { success: false, error: 'Offline' };
    const { data, error } = await client
      .from('app_data')
      .select('*')
      .eq('user_id', userId)
      .eq('app_id', appId)
      .single();
    return error ? { success: false, error: error.message } : { success: true, data };
  },

  async logEvent(eventData) {
    const client = getSupabaseClient();
    if (!this.isOnline || !client) return;

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
      return { success: false, error: err.message };
    }

    return { success: true };
  }
};
