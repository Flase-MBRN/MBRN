/**
 * /shared/core/state.js
 * Global State Manager - Pub/Sub Event System
 */

// P0 SECURITY: System events that cannot be manually overridden via emit
// Only authorized actions can emit these events
const RESERVED_EVENTS = [
  'userAuthChanged',
  'systemInitialized',
  'systemError',
  'syncStarted',
  'syncSuccess',
  'syncFailed',
  'paymentVerified',
  'paymentFailed'
];

// P1 SECURITY: Maximum recursion depth for event emission
const MAX_EMIT_DEPTH = 5;

class StateManager {
  constructor() {
    // Interner State-Storage (Object)
    this.state = {};
    // Subscriber-Arrays pro Event-Key (Map für sauberes Handling)
    this.subscribers = new Map();

    // RECURSION GUARD: Track emit depth per event
    this._emitDepths = new Map();
  }

  /**
   * Abonniert ein Event.
   * @param {string} event - Der Name des Events (z.B. 'calculationDone')
   * @param {function} callback - Die Callback-Funktion
   * @returns {function} Unsubscribe-Funktion
   */
  subscribe(event, callback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    
    const callbacks = this.subscribers.get(event);
    callbacks.push(callback);

    // Unsubscribe-Funktion zurückgeben (Phase 3.3)
    return () => {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Feuert ein Event ab und informiert alle Subscriber.
   * SECURITY (P0): Reserved events cannot be manually emitted.
   * SECURITY (P1): Recursion depth limited to MAX_EMIT_DEPTH.
   * @param {string} event - Der Name des Events
   * @param {any} data - Die Nutzdaten (z.B. {success: true, data: ...})
   * @param {boolean} _isAuthorized - Internal flag for reserved events (actions only)
   * @throws {Error} If recursion depth exceeded or reserved event blocked
   */
  emit(event, data, _isAuthorized = false) {
    // P0 SECURITY: Block manual emission of reserved system events
    if (RESERVED_EVENTS.includes(event) && !_isAuthorized) {
      console.error(`[State Manager] BLOCKED: '${event}' is a reserved system event. Use authorized actions only.`);
      this._reportError(new Error(`Unauthorized emit attempt for reserved event: ${event}`), { event, data });
      return;
    }

    // RECURSION GUARD: Check and increment emit depth
    const currentDepth = this._emitDepths.get(event) || 0;
    if (currentDepth >= MAX_EMIT_DEPTH) {
      const error = new Error(`[State Manager] RECURSION GUARD: Event '${event}' exceeded max depth of ${MAX_EMIT_DEPTH}. Possible infinite loop detected.`);
      console.error(error);
      this._reportError(error, { event, data, depth: currentDepth });
      throw error;
    }
    this._emitDepths.set(event, currentDepth + 1);

    try {
      // Internen State aktualisieren
      this.state[event] = data;

      if (this.subscribers.has(event)) {
        const callbacks = this.subscribers.get(event);
        // Alle Subscriber benachrichtigen
        // STABILITY FIX: Isolierter Try-Catch pro Callback - ein crashender Subscriber killt nicht die Kette
        callbacks.forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error(`[State Manager] Subscriber for '${event}' crashed (isolated):`, error);
            this._reportError(error, { event, data, subscriber: callback.name || 'anonymous' });
            // Continue with next subscriber - DO NOT BREAK THE CHAIN
          }
        });
      }
    } finally {
      // Always decrement depth, even if error occurred
      const newDepth = (this._emitDepths.get(event) || 1) - 1;
      if (newDepth > 0) {
        this._emitDepths.set(event, newDepth);
      } else {
        this._emitDepths.delete(event);
      }
    }
  }

  /**
   * AUTHORIZED EMIT: For internal use by actions.js only.
   * Allows emitting reserved system events.
   * @param {string} event - Reserved system event name
   * @param {any} data - Event data
   * @internal
   */
  _authorizedEmit(event, data) {
    // Double-check this is actually a reserved event
    if (!RESERVED_EVENTS.includes(event)) {
      // Not reserved, use normal emit
      this.emit(event, data);
      return;
    }
    // Pass authorized flag
    this.emit(event, data, true);
  }

  /**
   * Liest den letzten bekannten Status eines Events synchron aus.
   * @param {string} event 
   */
  get(event) {
    return this.state[event];
  }

  /**
   * Setzt den State und informiert gleichzeitig alle Subscriber.
   * Alias für emit, um Konsistenz zu wahren.
   */
  set(event, data) {
    this.emit(event, data);
  }

  /**
   * Subscribe to global system errors
   * @param {Function} handler - (error, context) => void
   * @returns {Function} Unsubscribe function
   */
  subscribeToErrors(handler) {
    if (!this.errorHandlers) {
      this.errorHandlers = new Set();
    }
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  /**
   * Internal: Report error to all handlers and emit systemError event
   */
  _reportError(error, context = {}) {
    console.error(`[State Manager] System Error:`, error, context);
    
    // Notify error handlers
    if (this.errorHandlers) {
      this.errorHandlers.forEach(handler => {
        try {
          handler(error, context);
        } catch (e) {
          console.error('[State Manager] Error handler failed:', e);
        }
      });
    }
    
    // Emit system error event for UI handling
    this.emit('systemError', { 
      error: error?.message || String(error),
      context,
      timestamp: Date.now(),
      type: 'state_error'
    });
  }

}

// Singleton-Export erzwingen
export const state = new StateManager();
