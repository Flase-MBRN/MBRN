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
          console.error(`[State Manager Error] Listener Crash bei Event '${event}':`, error);
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
}

// Singleton-Export erzwingen
export const state = new StateManager();
