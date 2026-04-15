/**
 * Supabase Client Re-Export
 * 
 * Centralized Supabase client for Realtime, Auth, and Database operations.
 * Uses the configured client from api.js
 */

import { api } from './api.js';

// Ensure API is initialized
if (!api.client && typeof window !== 'undefined') {
  api.init();
}

export const supabase = api.client;
export default supabase;
