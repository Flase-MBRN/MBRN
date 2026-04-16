/**
 * /tests/circuit_breaker.test.js
 * CIRCUIT BREAKER TEST SUITE - Resilience Engineering Tests
 * 
 * Responsibility: Verify circuit breaker state transitions and protection
 * LAW 4 COMPLIANT: All assertions check structured returns
 */

import { jest } from '@jest/globals';
import { CircuitBreaker, circuits, withCircuitBreaker, isOffline, getAllCircuitStatus } from '../shared/core/circuit_breaker.js';

// Mock state.emit for tests
jest.mock('../shared/core/state.js', () => ({
  state: {
    emit: jest.fn()
  }
}));

// Mock storage module
jest.mock('../shared/core/storage.js', () => ({
  storage: {
    get: jest.fn(() => ({ success: true, data: null })),
    set: jest.fn(() => ({ success: true }))
  }
}));

describe('Circuit Breaker Core', () => {
  let breaker;

  beforeEach(() => {
    breaker = new CircuitBreaker({
      name: 'test',
      failureThreshold: 3,
      resetTimeout: 100 // Short timeout for testing
    });
  });

  test('starts in CLOSED state', () => {
    const status = breaker.getStatus();
    expect(status.state).toBe('CLOSED');
    expect(status.failureCount).toBe(0);
  });

  test('returns success on successful execution', async () => {
    const result = await breaker.execute(async () => {
      return { data: 'success' };
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ data: 'success' });
    expect(result.offline).toBe(false);
  });

  test('increments failure count on error', async () => {
    await breaker.execute(async () => {
      throw new Error('Test error');
    });

    const status = breaker.getStatus();
    expect(status.failureCount).toBe(1);
  });

  test('opens circuit after threshold failures', async () => {
    // Trigger 3 failures
    for (let i = 0; i < 3; i++) {
      await breaker.execute(async () => {
        throw new Error('Test error');
      });
    }

    const status = breaker.getStatus();
    expect(status.state).toBe('OPEN');
    expect(status.failureCount).toBe(3);
  });

  test('rejects requests when OPEN', async () => {
    // Open the circuit
    for (let i = 0; i < 3; i++) {
      await breaker.execute(async () => {
        throw new Error('Test error');
      });
    }

    // Next request should be rejected
    const result = await breaker.execute(async () => {
      return { data: 'should not execute' };
    });

    expect(result.success).toBe(false);
    expect(result.circuitOpen).toBe(true);
    expect(result.offline).toBe(true);
    expect(result.error).toContain('temporarily unavailable');
  });

  test('transitions to HALF_OPEN after timeout', async () => {
    // Open the circuit
    for (let i = 0; i < 3; i++) {
      await breaker.execute(async () => {
        throw new Error('Test error');
      });
    }

    expect(breaker.getStatus().state).toBe('OPEN');

    // Wait for timeout
    await new Promise(resolve => setTimeout(resolve, 150));

    // Next request should try HALF_OPEN
    const result = await breaker.execute(async () => {
      return { data: 'recovery test' };
    });

    expect(result.success).toBe(true);
    expect(breaker.getStatus().state).toBe('CLOSED');
  });

  test('closes circuit on success in HALF_OPEN', async () => {
    // Open circuit
    for (let i = 0; i < 3; i++) {
      await breaker.execute(async () => {
        throw new Error('Test error');
      });
    }

    // Wait for timeout
    await new Promise(resolve => setTimeout(resolve, 150));

    // Success in HALF_OPEN should close circuit
    await breaker.execute(async () => {
      return { data: 'recovery' };
    });

    const status = breaker.getStatus();
    expect(status.state).toBe('CLOSED');
    expect(status.failureCount).toBe(0);
  });

  test('resets failure count on success', async () => {
    // One failure
    await breaker.execute(async () => {
      throw new Error('Test error');
    });
    expect(breaker.getStatus().failureCount).toBe(1);

    // Success should reset
    await breaker.execute(async () => {
      return { data: 'success' };
    });
    expect(breaker.getStatus().failureCount).toBe(0);
  });

  test('manual reset works', async () => {
    // Open circuit
    for (let i = 0; i < 3; i++) {
      await breaker.execute(async () => {
        throw new Error('Test error');
      });
    }

    expect(breaker.getStatus().state).toBe('OPEN');

    // Manual reset
    breaker.reset();

    const status = breaker.getStatus();
    expect(status.state).toBe('CLOSED');
    expect(status.failureCount).toBe(0);
  });

  test('tracks metrics correctly', async () => {
    // Success
    await breaker.execute(async () => ({ success: true }));
    
    // Failure
    await breaker.execute(async () => {
      throw new Error('Test');
    });

    const metrics = breaker.getStatus().metrics;
    expect(metrics.totalCalls).toBe(2);
    expect(metrics.successes).toBe(1);
    expect(metrics.failures).toBe(1);
    expect(metrics.lastSuccess).toBeTruthy();
    expect(metrics.lastFailure).toBeTruthy();
  });
});

describe('Global Circuits', () => {
  test('has supabase circuit', () => {
    expect(circuits.supabase).toBeInstanceOf(CircuitBreaker);
    expect(circuits.supabase.name).toBe('supabase');
  });

  test('has stripe circuit', () => {
    expect(circuits.stripe).toBeInstanceOf(CircuitBreaker);
    expect(circuits.stripe.name).toBe('stripe');
  });

  test('has analytics circuit', () => {
    expect(circuits.analytics).toBeInstanceOf(CircuitBreaker);
    expect(circuits.analytics.name).toBe('analytics');
  });

  test('stripe has lower threshold', () => {
    expect(circuits.stripe.failureThreshold).toBeLessThan(circuits.supabase.failureThreshold);
  });

  test('getAllCircuitStatus returns all', () => {
    const all = getAllCircuitStatus();
    expect(all.supabase).toBeDefined();
    expect(all.stripe).toBeDefined();
    expect(all.analytics).toBeDefined();
  });

  test('isOffline checks supabase circuit', () => {
    // Initially closed
    expect(isOffline()).toBe(false);
    
    // Manually open circuit for test
    circuits.supabase.openCircuit();
    expect(isOffline()).toBe(true);
    
    // Reset
    circuits.supabase.reset();
    expect(isOffline()).toBe(false);
  });
});

describe('withCircuitBreaker helper', () => {
  test('wraps successful function', async () => {
    const result = await withCircuitBreaker('supabase', async () => {
      return { data: 'test' };
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ data: 'test' });
  });

  test('wraps failing function', async () => {
    const result = await withCircuitBreaker('supabase', async () => {
      throw new Error('API Error');
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('API Error');
  });

  test('handles unknown circuit gracefully', async () => {
    const result = await withCircuitBreaker('unknown', async () => {
      return { data: 'test' };
    });

    // Should execute without circuit protection
    expect(result.success).toBe(true);
  });

  test('handles structured return with explicit failure', async () => {
    const result = await withCircuitBreaker('supabase', async () => {
      return { success: false, error: 'Business logic error' };
    });

    // Should treat as failure
    expect(result.success).toBe(false);
  });
});

describe('Supabase Outage Simulation', () => {
  test('sets offline flag after 3 consecutive failures', async () => {
    // Use the actual supabase circuit with short timeout for testing
    const testBreaker = new CircuitBreaker({
      name: 'test-supabase',
      failureThreshold: 3,
      resetTimeout: 5000 // 5 seconds for faster test
    });

    // Simulate 3 consecutive Supabase failures (network errors)
    const failureResults = [];
    for (let i = 0; i < 3; i++) {
      const result = await testBreaker.execute(async () => {
        throw new Error('Supabase connection timeout - Network error');
      });
      failureResults.push(result);
    }

    // Verify circuit opened after 3 failures
    expect(testBreaker.getStatus().state).toBe('OPEN');
    expect(testBreaker.getStatus().failureCount).toBe(3);

    // Next request should return offline: true
    const offlineResult = await testBreaker.execute(async () => {
      return { data: 'should not execute' };
    });

    expect(offlineResult.success).toBe(false);
    expect(offlineResult.offline).toBe(true);
    expect(offlineResult.circuitOpen).toBe(true);
    expect(offlineResult.error).toContain('temporarily unavailable');
  });

  test('isOffline() returns true when supabase circuit opens', async () => {
    // Use the global supabase circuit for this test
    // First ensure it's closed
    circuits.supabase.reset();
    expect(isOffline()).toBe(false);

    // Simulate 3 failures on the actual supabase circuit
    for (let i = 0; i < 3; i++) {
      await withCircuitBreaker('supabase', async () => {
        throw new Error('Supabase outage simulated');
      });
    }

    // isOffline() should now return true
    expect(isOffline()).toBe(true);
    expect(circuits.supabase.getStatus().state).toBe('OPEN');

    // Cleanup: reset circuit
    circuits.supabase.reset();
    expect(isOffline()).toBe(false);
  });

  test('offline flag persists in subsequent requests until recovery', async () => {
    const breaker = new CircuitBreaker({
      name: 'offline-persist-test',
      failureThreshold: 3,
      resetTimeout: 100
    });

    // Open circuit with 3 failures
    for (let i = 0; i < 3; i++) {
      await breaker.execute(async () => {
        throw new Error('Connection failed');
      });
    }

    // Multiple requests should all return offline
    const results = [];
    for (let i = 0; i < 3; i++) {
      const result = await breaker.execute(async () => ({ data: 'ignored' }));
      results.push(result);
    }

    results.forEach(result => {
      expect(result.offline).toBe(true);
      expect(result.circuitOpen).toBe(true);
      expect(result.success).toBe(false);
    });

    // Metrics should track rejections
    expect(breaker.getStatus().metrics.rejections).toBe(3);
  });

  test('recovers from offline after timeout and successful request', async () => {
    const breaker = new CircuitBreaker({
      name: 'recovery-test',
      failureThreshold: 3,
      resetTimeout: 100 // 100ms for fast test
    });

    // Open circuit
    for (let i = 0; i < 3; i++) {
      await breaker.execute(async () => {
        throw new Error('Supabase failure');
      });
    }

    expect(breaker.getStatus().state).toBe('OPEN');

    // Wait for reset timeout
    await new Promise(resolve => setTimeout(resolve, 150));

    // Success should close circuit
    const recoveryResult = await breaker.execute(async () => {
      return { data: 'recovery successful' };
    });

    expect(recoveryResult.success).toBe(true);
    expect(recoveryResult.offline).toBe(false);
    expect(breaker.getStatus().state).toBe('CLOSED');
    expect(isOffline()).toBe(false);
  });

  test('structured return includes retryAfter timestamp when offline', async () => {
    const breaker = new CircuitBreaker({
      name: 'retry-test',
      failureThreshold: 3,
      resetTimeout: 30000 // 30 seconds
    });

    // Open circuit
    for (let i = 0; i < 3; i++) {
      await breaker.execute(async () => {
        throw new Error('Network error');
      });
    }

    const result = await breaker.execute(async () => ({ data: 'ignored' }));

    expect(result.offline).toBe(true);
    expect(result.retryAfter).toBeDefined();
    expect(result.retryAfter).toBeGreaterThan(0);
    // Should be roughly the reset timeout
    expect(result.retryAfter).toBeLessThanOrEqual(30000);
  });
});

describe('Circuit Breaker Resilience Patterns', () => {
  test('handles async delays', async () => {
    const breaker = new CircuitBreaker({ name: 'delay-test', failureThreshold: 2 });
    
    const result = await breaker.execute(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return { delayed: true };
    });

    expect(result.success).toBe(true);
    expect(result.data.delayed).toBe(true);
  });

  test('handles concurrent requests', async () => {
    const breaker = new CircuitBreaker({ name: 'concurrent-test', failureThreshold: 5 });
    
    const promises = Array(5).fill(null).map((_, i) => 
      breaker.execute(async () => {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 20));
        return { index: i };
      })
    );

    const results = await Promise.all(promises);
    
    expect(results.every(r => r.success)).toBe(true);
    expect(breaker.getStatus().metrics.totalCalls).toBe(5);
  });

  test('handles rapid failures', async () => {
    const breaker = new CircuitBreaker({ name: 'rapid-test', failureThreshold: 3 });
    
    // Rapid sequential failures
    for (let i = 0; i < 5; i++) {
      await breaker.execute(async () => {
        throw new Error(`Error ${i}`);
      });
    }

    const status = breaker.getStatus();
    expect(status.state).toBe('OPEN');
    expect(status.metrics.rejections).toBeGreaterThan(0); // Some should be rejected
  });
});
