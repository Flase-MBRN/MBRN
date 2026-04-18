/**
 * /shared/core/storage.js
 * LocalStorage Wrapper - Enforces 'mbrn_' prefix and structured returns.
 */

const PREFIX = 'mbrn_';

// RACE CONDITION FIX: Write queue for sequential LocalStorage access
const _queue = [];
let _processing = false;

function getStorageBackend() {
  return typeof globalThis !== 'undefined' && globalThis.localStorage
    ? globalThis.localStorage
    : null;
}

async function _processQueue() {
  if (_processing) return;
  _processing = true;

  // P0 SECURITY: Process queue until truly empty
  // Loop continues even if new tasks are added during execution
  while (_queue.length > 0) {
    // Get current task count to process in this iteration
    const tasksToProcess = _queue.length;

    for (let i = 0; i < tasksToProcess; i++) {
      // Safety check: queue might have been cleared
      if (_queue.length === 0) break;

      const task = _queue.shift();
      try {
        const result = await task.execute();
        task.resolve(result);
      } catch (error) {
        task.reject(error);
      }
    }

    // Loop condition re-checks _queue.length
    // If new tasks were added during processing, continue looping
  }

  _processing = false;
}

export const storage = {
  /**
   * Speichert einen Wert im LocalStorage.
   * RACE CONDITION FIX: Uses write queue for sequential access
   * @param {string} key
   * @param {any} value
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  set(key, value) {
    return new Promise((resolve, reject) => {
      _queue.push({
        execute: async () => {
          const backend = getStorageBackend();
          if (!backend) {
            return { success: false, error: 'LocalStorage unavailable' };
          }

          try {
            const prefixedKey = `${PREFIX}${key}`;
            const serializedValue = JSON.stringify(value);
            backend.setItem(prefixedKey, serializedValue);
            return { success: true, data: null };
          } catch (error) {
            console.error('[Storage Set Error]', error);
            let errorMsg = error.message;
            if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
              errorMsg = 'LocalStorage Quota Exceeded';
            }
            return { success: false, error: errorMsg };
          }
        },
        resolve,
        reject
      });
      _processQueue();
    });
  },

  /**
   * Liest einen Wert aus dem LocalStorage.
   * @param {string} key 
   * @returns {success: boolean, data?: any, error?: string}
   */
  get(key) {
    const backend = getStorageBackend();
    if (!backend) {
      return { success: true, data: null, unavailable: true };
    }

    try {
      const prefixedKey = `${PREFIX}${key}`;
      const item = backend.getItem(prefixedKey);
      
      if (item === null) {
        // Explizites Definieren, wenn nichts gefunden wurde
        return { success: true, data: null };
      }
      
      const parsedData = JSON.parse(item);
      return { success: true, data: parsedData };
    } catch (error) {
      console.error('[Storage Get Error]', error);
      return { success: false, error: 'JSON Parse Error oder Lese-Fehler' };
    }
  },

  /**
   * Löscht einen Schlüssel aus dem LocalStorage.
   * @param {string} key 
   * @returns {success: boolean, data?: any, error?: string}
   */
  remove(key) {
    const backend = getStorageBackend();
    if (!backend) {
      return { success: false, error: 'LocalStorage unavailable' };
    }

    try {
      const prefixedKey = `${PREFIX}${key}`;
      backend.removeItem(prefixedKey);
      return { success: true, data: null };
    } catch (error) {
      console.error('[Storage Remove Error]', error);
      return { success: false, error: error.message };
    }
  }
};
