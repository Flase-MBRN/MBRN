/**
 * /shared/core/state.js
 * Global State Manager - Pub/Sub Event System
 */

class StateManager {
  constructor() {
    // Interner State-Storage (Object)
    this.state = {};
    // Subscriber-Arrays pro Event-Key (Map für sauberes Handling)
    this.subscribers = new Map();
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
   * @param {string} event - Der Name des Events
   * @param {any} data - Die Nutzdaten (z.B. {success: true, data: ...})
   */
  emit(event, data) {
    // Internen State aktualisieren
    this.state[event] = data;

    if (this.subscribers.has(event)) {
      const callbacks = this.subscribers.get(event);
      // Alle Subscriber benachrichtigen
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[State Manager] Event '${event}' crashed:`, error);
          this._reportError(error, { event, data });
        }
      });
    }
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
