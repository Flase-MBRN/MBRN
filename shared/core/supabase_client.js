/**
 * Supabase Client Re-Export
 * 
 * Centralized Supabase client for Realtime, Auth, and Database operations.
 * Uses the configured client from api.js
 */

import { api } from './api.js';
import { hasBrowserWindow } from './browser_runtime.js';

export function getSupabaseClient() {
  if (!api.client && hasBrowserWindow()) {
    api.init();
  }

  return api.client;
}

export default getSupabaseClient;
