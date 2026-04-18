/**
 * /shared/core/error_logger.js
 * GLOBAL ERROR LOGGER — Critical Error Monitoring & Offline Queue
 * 
 * Responsibility: Log critical errors to Supabase with offline fallback
 * LAW 7 COMPLIANT: Offline-First — Queue errors when offline
 * LAW 4 COMPLIANT: Structured Returns — always { success, error?, queued? }
 * 
 * Critical Errors Logged:
 * - Circuit Breaker OPEN
 * - Validation Crashes
 * - Uncaught Exceptions
 * - Unhandled Promise Rejections
 * - Authentication Failures
 * - Payment Processing Errors
 */

import { api } from './api.js';
import { state } from './state.js';
import { storage } from './storage.js';

const ERROR_QUEUE_KEY = 'error_queue';
const MAX_QUEUE_SIZE = 50; // Prevent unlimited growth

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

  /**
   * OMEGA FIX: Sanitize context to remove PII before logging
   * Removes sensitive user data that could leak to LocalStorage
   */
  _sanitizeContext(context) {
    if (!context || typeof context !== 'object') return {};
    
    // List of keys that may contain PII - EXCLUDED from logs
    const piiKeys = ['name', 'fullName', 'birthDate', 'birthdate', 'email', 'userInput', 'input', 'rawInput', 'userName', 'firstName', 'lastName', 'phone', 'address', 'password', 'token', 'authToken', 'sessionToken', 'apiKey'];
    
    const sanitized = {};
    for (const [key, value] of Object.entries(context)) {
      // Skip PII keys
      if (piiKeys.includes(key)) {
        sanitized[key] = '[REDACTED]'; // Preserve key but redact value
        continue;
      }
      
      // Recursively sanitize nested objects (but not arrays, dates, etc.)
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        sanitized[key] = this._sanitizeContext(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  /**
   * OMEGA FIX: Sanitize URL to remove query parameters that may contain PII
   */
  _sanitizeUrl(url) {
    if (!url || typeof url !== 'string') return '[invalid url]';
    
    try {
      const u = new URL(url, window.location.origin);
      // Strip query params and hash - they may contain sensitive data
      return `${u.protocol}//${u.host}${u.pathname}`;
    } catch {
      // If URL parsing fails, aggressively truncate
      return url.split('?')[0].split('#')[0];
    }
  }

  /**
   * Initialize error logger and setup listeners
   */
  init() {
    if (this._initialized) return;

    // Subscribe to critical system events
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

    // Listen for online status to sync queue
    window.addEventListener('online', () => this._syncQueue());
    
    // Initial sync attempt if online
    if (navigator.onLine) {
      this._syncQueue();
    }

    this._initialized = true;
  }

  /**
   * Check if error type is critical
   */
  _isCritical(errorInfo) {
    return this._criticalTypes.has(errorInfo.type) || 
           errorInfo.severity === 'critical' ||
           errorInfo.severity === 'high';
  }

  /**
   * Main error logging method
   * 
   * @param {Object} errorData - Error data to log
   * @param {string} errorData.type - Error classification
   * @param {string} errorData.error - Error message
   * @param {string} errorData.severity - 'critical', 'high', 'medium', 'low'
   * @param {Object} errorData.context - Additional context
   * @param {string} errorData.stack - Stack trace (optional)
   * @returns {Promise<Object>} - { success, queued?, error? }
   */
  async logError(errorData) {
    // OMEGA FIX: Sanitize context and URL to prevent PII leakage
    const sanitizedContext = this._sanitizeContext(errorData.context);
    const sanitizedUrl = this._sanitizeUrl(window.location.href);
    
    const errorEntry = {
      id: this._generateId(),
      timestamp: new Date().toISOString(),
      type: errorData.type || 'unknown',
      error: errorData.error || 'Unknown error',
      severity: errorData.severity || 'medium',
      context: {
        ...sanitizedContext,
        userAgent: navigator.userAgent,
        url: sanitizedUrl, // OMEGA FIX: Sanitized URL
        language: navigator.language
      },
      stack: errorData.stack || null,
      synced: false
    };

    // If online, send immediately
    if (navigator.onLine && api.isOnline) {
      const result = await this._sendToSupabase(errorEntry);
      if (result.success) {
        return { success: true, id: errorEntry.id };
      }
      // If send failed, queue it
    }

    // Queue for later sync
    return this._queueError(errorEntry);
  }

  /**
   * Send error to Supabase
   */
  async _sendToSupabase(errorEntry) {
    if (!api.client) {
      return { success: false, error: 'API client not available' };
    }

    try {
      const { error } = await api.client
        .from('error_logs')
        .insert({
          id: errorEntry.id,
          timestamp: errorEntry.timestamp,
          error_type: errorEntry.type,
          error_message: errorEntry.error,
          severity: errorEntry.severity,
          context: errorEntry.context,
          stack_trace: errorEntry.stack,
          user_id: (await api.client.auth.getUser()).data?.user?.id || null,
          resolved: false
        });

      if (error) throw error;
      
      return { success: true };
    } catch (err) {
      console.warn('[ErrorLogger] Failed to send to Supabase:', err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Add error to offline queue
   */
  _queueError(errorEntry) {
    const queue = this._getQueue();
    
    // Prevent duplicate errors (same type within 5 minutes)
    const recentDuplicate = queue.find(e => 
      e.type === errorEntry.type && 
      e.error === errorEntry.error &&
      new Date(e.timestamp) > new Date(Date.now() - 5 * 60 * 1000)
    );
    
    if (recentDuplicate) {
      return { success: false, queued: false, reason: 'duplicate' };
    }

    // Maintain max queue size (FIFO)
    if (queue.length >= MAX_QUEUE_SIZE) {
      queue.shift();
    }

    queue.push(errorEntry);
    this._saveQueue(queue);
    return { success: false, queued: true, id: errorEntry.id };
  }

  /**
   * Get error queue from localStorage
   */
  _getQueue() {
    const result = storage.get(ERROR_QUEUE_KEY);
    return result.success && result.data ? result.data : [];
  }

  /**
   * Save error queue to localStorage
   */
  _saveQueue(queue) {
    storage.set(ERROR_QUEUE_KEY, queue);
  }

  /**
   * Sync queued errors when coming back online
   */
  async _syncQueue() {
    if (this._syncInProgress) return;
    if (!navigator.onLine || !api.isOnline) return;

    this._syncInProgress = true;
    
    const queue = this._getQueue();
    if (queue.length === 0) {
      this._syncInProgress = false;
      return;
    }

    const unsynced = [];
    let synced = 0;

    for (const error of queue) {
      if (error.synced) continue;

      const result = await this._sendToSupabase(error);
      if (result.success) {
        synced++;
        error.synced = true;
      } else {
        unsynced.push(error);
      }
    }

    // Keep only unsynced errors
    this._saveQueue(unsynced);
    state.emit('errorQueueSync', { synced, remaining: unsynced.length });
    
    this._syncInProgress = false;
  }

  /**
   * Generate unique error ID
   */
  _generateId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current queue status
   */
  getQueueStatus() {
    const queue = this._getQueue();
    return {
      total: queue.length,
      unsynced: queue.filter(e => !e.synced).length,
      synced: queue.filter(e => e.synced).length
    };
  }

  /**
   * Clear error queue (for testing/debugging)
   */
  clearQueue() {
    storage.remove(ERROR_QUEUE_KEY);
  }

  /**
   * Force immediate sync attempt
   */
  async forceSync() {
    return this._syncQueue();
  }
}

// Singleton instance
export const errorLogger = new ErrorLogger();

// Extend api with logError method
api.logError = (errorData) => errorLogger.logError(errorData);

// Initialize on module load
errorLogger.init();
