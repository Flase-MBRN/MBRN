/**
 * /shared/application/observability/error_logger.js
 * Critical error monitoring with bridge-backed delivery and offline fallback.
 */

import { state } from '../../core/state.js';
import { storage } from '../../core/storage.js';
import { getSupabaseClient } from '../../../bridges/supabase/client.js';
import { supabaseBridge } from '../../../bridges/supabase/index.js';
import {
  getBrowserHref,
  getBrowserLanguage,
  getBrowserNavigator,
  getBrowserOrigin,
  getBrowserUserAgent,
  getBrowserWindow,
  hasBrowserRuntime,
  isBrowserOnline
} from '../../core/browser_runtime.js';

const ERROR_QUEUE_KEY = 'error_queue';
const MAX_QUEUE_SIZE = 50;

class ErrorLogger {
  constructor() {
    this._initialized = false;
    this._syncInProgress = false;
    this._criticalTypes = new Set([
      'circuit_open',
      'validation_crash',
      'uncaught_exception',
      'unhandled_promise',
      'auth_failure',
      'payment_error',
      'supabase_error',
      'api_failure'
    ]);
  }

  _sanitizeContext(context) {
    if (!context || typeof context !== 'object') return {};

    const piiKeys = [
      'name', 'fullName', 'birthDate', 'birthdate', 'email', 'userInput',
      'input', 'rawInput', 'userName', 'firstName', 'lastName', 'phone',
      'address', 'password', 'token', 'authToken', 'sessionToken', 'apiKey'
    ];

    const sanitized = {};
    for (const [key, value] of Object.entries(context)) {
      if (piiKeys.includes(key)) {
        sanitized[key] = '[REDACTED]';
        continue;
      }

      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        sanitized[key] = this._sanitizeContext(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  _sanitizeUrl(url) {
    if (!url || typeof url !== 'string') return '[invalid url]';

    try {
      const origin = getBrowserOrigin('http://localhost');
      const parsed = new URL(url, origin);
      return `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
    } catch {
      return url.split('?')[0].split('#')[0];
    }
  }

  init() {
    if (this._initialized) return true;
    if (!hasBrowserRuntime()) return false;

    const windowRef = getBrowserWindow();
    const navigatorRef = getBrowserNavigator();

    state.subscribe('circuitOpened', (data) => {
      this.logError({
        type: 'circuit_open',
        error: `Circuit OPENED for ${data.name}`,
        context: { circuitName: data.name, retryAfter: data.retryAfter },
        severity: 'critical'
      });
    });

    state.subscribe('systemError', (errorInfo) => {
      if (this._isCritical(errorInfo)) {
        this.logError({
          type: errorInfo.type,
          error: errorInfo.error || errorInfo.message || 'Unknown error',
          context: errorInfo.context || {},
          severity: errorInfo.severity || 'high',
          stack: errorInfo.stack
        });
      }
    });

    windowRef.addEventListener('online', () => this._syncQueue());

    if (navigatorRef?.onLine) {
      this._syncQueue();
    }

    this._initialized = true;
    return true;
  }

  _isCritical(errorInfo) {
    return this._criticalTypes.has(errorInfo.type)
      || errorInfo.severity === 'critical'
      || errorInfo.severity === 'high';
  }

  async logError(errorData) {
    const sanitizedContext = this._sanitizeContext(errorData.context);
    const sanitizedUrl = this._sanitizeUrl(getBrowserHref());

    const errorEntry = {
      id: this._generateId(),
      timestamp: new Date().toISOString(),
      type: errorData.type || 'unknown',
      error: errorData.error || 'Unknown error',
      severity: errorData.severity || 'medium',
      context: {
        ...sanitizedContext,
        userAgent: getBrowserUserAgent(),
        url: sanitizedUrl,
        language: getBrowserLanguage()
      },
      stack: errorData.stack || null,
      synced: false
    };

    if (hasBrowserRuntime() && isBrowserOnline() && supabaseBridge.isOnline) {
      const result = await this._sendToSupabase(errorEntry);
      if (result.success) {
        return { success: true, id: errorEntry.id };
      }
    }

    return this._queueError(errorEntry);
  }

  async _sendToSupabase(errorEntry) {
    const client = getSupabaseClient();
    if (!client || typeof client.from !== 'function') {
      return { success: false, error: 'API client not available' };
    }

    try {
      const { error } = await client
        .from('error_logs')
        .insert({
          id: errorEntry.id,
          timestamp: errorEntry.timestamp,
          error_type: errorEntry.type,
          error_message: errorEntry.error,
          severity: errorEntry.severity,
          context: errorEntry.context,
          stack_trace: errorEntry.stack,
          user_id: (await client.auth.getUser()).data?.user?.id || null,
          resolved: false
        });

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.warn('[ErrorLogger] Failed to send to Supabase:', err.message);
      return { success: false, error: err.message };
    }
  }

  _queueError(errorEntry) {
    const queue = this._getQueue();
    const recentDuplicate = queue.find((entry) =>
      entry.type === errorEntry.type
      && entry.error === errorEntry.error
      && new Date(entry.timestamp) > new Date(Date.now() - 5 * 60 * 1000)
    );

    if (recentDuplicate) {
      return { success: false, queued: false, reason: 'duplicate' };
    }

    if (queue.length >= MAX_QUEUE_SIZE) {
      queue.shift();
    }

    queue.push(errorEntry);
    this._saveQueue(queue);
    return { success: false, queued: true, id: errorEntry.id };
  }

  _getQueue() {
    const result = storage.get(ERROR_QUEUE_KEY);
    if (!result.success || !Array.isArray(result.data)) return [];
    return result.data;
  }

  _saveQueue(queue) {
    storage.set(ERROR_QUEUE_KEY, queue);
  }

  async _syncQueue() {
    if (this._syncInProgress || !supabaseBridge.isOnline) return;

    const queue = this._getQueue();
    if (queue.length === 0) return;

    this._syncInProgress = true;

    try {
      const failed = [];
      for (const entry of queue) {
        const result = await this._sendToSupabase(entry);
        if (!result.success) {
          failed.push(entry);
        }
      }

      this._saveQueue(failed);
      state._authorizedEmit('errorQueueSynced', {
        total: queue.length,
        synced: queue.length - failed.length,
        failed: failed.length
      });
    } finally {
      this._syncInProgress = false;
    }
  }

  _generateId() {
    return `err_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
  }
}

export const errorLogger = new ErrorLogger();

