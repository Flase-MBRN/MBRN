/**
 * /bridges/supabase/client.js
 * Supabase Client Re-Export
 *
 * Centralized Supabase client for Realtime, Auth, and Database operations.
 * Uses the configured client from api.js
 */

import { api } from './api.js';
import { hasBrowserWindow } from '../../shared/core/browser_runtime.js';

export function getSupabaseClient() {
  if (!api.client && hasBrowserWindow()) {
    api.init();
  }

  return api.client;
}

export function getSupabaseStatus() {
  return {
    client: api.client,
    isOnline: api.isOnline
  };
}

export function initSupabaseClient() {
  return api.init();
}

export function resetSupabaseClientForTests() {
  api._resetForTests();
}

export function setSupabaseCredentials(url, key) {
  api._setCredentials(url, key);
}

export async function checkSupabaseConnection() {
  return api.checkConnection();
}

export default getSupabaseClient;
