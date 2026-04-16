/**
 * /shared/core/circuit_breaker.js
 * CIRCUIT BREAKER PATTERN - Resilience Engineering
 * 
 * Responsibility: Protects against cascading failures in cloud connections
 * LAW 7 COMPLIANT: Fallback State - graceful degradation
 * LAW 4 COMPLIANT: Structured Returns - always { success, data?, error?, offline? }
 */

import { state } from './state.js';
import { storage } from './storage.js';

/**
 * Circuit Breaker states
 * CLOSED: Normal operation
 * OPEN: Failing, rejecting requests
 * HALF_OPEN: Testing if service recovered
 */
const STATE = {
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  HALF_OPEN: 'HALF_OPEN'
};

/**
 * Circuit Breaker for resilient API calls
 * Automatically switches to offline mode after threshold failures
 */
export class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 3;
    this.resetTimeout = options.resetTimeout || 30000; // 30 seconds
    this.state = STATE.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.nextAttempt = null;
    this.name = options.name || 'default';
    
    // Metrics for monitoring
    this.metrics = {
      totalCalls: 0,
      successes: 0,
      failures: 0,
      rejections: 0,
      lastSuccess: null,
      lastFailure: null
    };
  }
  
  /**
   * Execute a function with circuit breaker protection
   * 
   * @param {Function} fn - Async function to execute
   * @returns {Promise<Object>} - { success, data?, error?, offline?, circuitOpen? }
   */
  async execute(fn) {
    this.metrics.totalCalls++;
    
    // Check if circuit is open
    if (this.state === STATE.OPEN) {
      const now = Date.now();

      // Check if we should try half-open
      if (now >= this.nextAttempt) {
        this.state = STATE.HALF_OPEN;
        console.log(`[CircuitBreaker:${this.name}] Testing half-open state`);
      } else {
        // Circuit still open - IMMEDIATE LocalStorage fallback (Law 7)
        // NO network timeout delay - serve cached data instantly
        this.metrics.rejections++;

        // Attempt to retrieve fallback data from LocalStorage (Law 7)
        const fallbackKey = `circuit_fallback_${this.name}`;
        const fallbackResult = storage.get(fallbackKey);

        if (fallbackResult.success && fallbackResult.data !== null && fallbackResult.data.data !== undefined) {
          console.log(`[CircuitBreaker:${this.name}] Serving LocalStorage fallback immediately (no network delay)`);
          return {
            success: true,
            data: fallbackResult.data.data,
            offline: true,
            circuitOpen: true,
            fallback: true,
            cachedAt: fallbackResult.data.timestamp,
            retryAfter: this.nextAttempt - now
          };
        }

        // No fallback data available - return structured error
        return {
          success: false,
          error: `Service temporarily unavailable. Retry after ${Math.ceil((this.nextAttempt - now) / 1000)}s`,
          offline: true,
          circuitOpen: true,
          retryAfter: this.nextAttempt - now
        };
      }
    }
    
    try {
      // Execute the function
      const result = await fn();

      // Handle structured returns with explicit failure
      if (result && typeof result === 'object' && result.success === false) {
        throw new Error(result.error || 'Operation failed');
      }

      // Success - save to LocalStorage for fallback (Law 7)
      this.onSuccess();
      this.saveFallback(result);

      return {
        success: true,
        data: result,
        offline: false,
        circuitOpen: false
      };

    } catch (error) {
      this.onFailure(error);

      return {
        success: false,
        error: error.message,
        offline: this.state === STATE.OPEN,
        circuitOpen: this.state === STATE.OPEN
      };
    }
  }
  
  /**
   * Handle successful execution
   */
  onSuccess() {
    this.failureCount = 0;
    this.metrics.successes++;
    this.metrics.lastSuccess = new Date().toISOString();

    if (this.state === STATE.HALF_OPEN) {
      console.log(`[CircuitBreaker:${this.name}] Service recovered, closing circuit`);
      this.state = STATE.CLOSED;
      state.emit('circuitClosed', { name: this.name });
    }
  }

  /**
   * Save data to LocalStorage for fallback when circuit opens (Law 7)
   * @param {any} data - Data to cache as fallback
   */
  saveFallback(data) {
    const fallbackKey = `circuit_fallback_${this.name}`;
    storage.set(fallbackKey, {
      data: data,
      timestamp: Date.now(),
      circuit: this.name
    });
  }
  
  /**
   * Handle failed execution
   */
  onFailure(error) {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    this.metrics.failures++;
    this.metrics.lastFailure = new Date().toISOString();
    
    console.warn(`[CircuitBreaker:${this.name}] Failure ${this.failureCount}/${this.failureThreshold}: ${error.message}`);
    
    if (this.failureCount >= this.failureThreshold) {
      this.openCircuit();
    }
  }
  
  /**
   * Open the circuit
   */
  openCircuit() {
    if (this.state !== STATE.OPEN) {
      console.error(`[CircuitBreaker:${this.name}] Circuit OPENED - too many failures`);
      this.state = STATE.OPEN;
      this.nextAttempt = Date.now() + this.resetTimeout;
      
      // Emit state change for UI feedback
      state.emit('circuitOpened', { 
        name: this.name, 
        retryAfter: this.resetTimeout 
      });
    }
  }
  
  /**
   * Manually reset the circuit
   */
  reset() {
    this.state = STATE.CLOSED;
    this.failureCount = 0;
    this.nextAttempt = null;
    console.log(`[CircuitBreaker:${this.name}] Manually reset`);
    state.emit('circuitClosed', { name: this.name, manual: true });
  }
  
  /**
   * Get current status
   */
  getStatus() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      failureThreshold: this.failureThreshold,
      nextAttempt: this.nextAttempt,
      metrics: { ...this.metrics }
    };
  }
}

/**
 * Global circuit breakers for different services
 */
export const circuits = {
  // Main Supabase API circuit
  supabase: new CircuitBreaker({
    name: 'supabase',
    failureThreshold: 3,
    resetTimeout: 30000
  }),
  
  // Stripe payment circuit (more conservative)
  stripe: new CircuitBreaker({
    name: 'stripe',
    failureThreshold: 2,
    resetTimeout: 60000
  }),
  
  // Analytics circuit (non-critical, can fail silently)
  analytics: new CircuitBreaker({
    name: 'analytics',
    failureThreshold: 5,
    resetTimeout: 120000
  })
};

/**
 * Wrap any API call with circuit breaker protection
 * 
 * @param {string} circuitName - 'supabase', 'stripe', or 'analytics'
 * @param {Function} fn - Async function to execute
 * @returns {Promise<Object>} - Structured result
 */
export async function withCircuitBreaker(circuitName, fn) {
  const circuit = circuits[circuitName];
  if (!circuit) {
    console.warn(`[CircuitBreaker] Unknown circuit: ${circuitName}`);
    // Execute without protection
    try {
      const result = await fn();
      return { success: true, data: result, offline: false };
    } catch (error) {
      return { success: false, error: error.message, offline: false };
    }
  }
  
  return circuit.execute(fn);
}

/**
 * Check if system is in offline mode
 */
export function isOffline() {
  return circuits.supabase.state === STATE.OPEN;
}

/**
 * Get status of all circuits (for monitoring)
 */
export function getAllCircuitStatus() {
  return Object.fromEntries(
    Object.entries(circuits).map(([name, circuit]) => [
      name,
      circuit.getStatus()
    ])
  );
}
