/**
 * /shared/core/storage.js
 * LocalStorage Wrapper - Enforces 'mbrn_' prefix and structured returns.
 */

const PREFIX = 'mbrn_';

export const storage = {
  /**
   * Speichert einen Wert im LocalStorage.
   * @param {string} key 
   * @param {any} value 
   * @returns {success: boolean, data?: any, error?: string}
   */
  set(key, value) {
    try {
      const prefixedKey = `${PREFIX}${key}`;
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(prefixedKey, serializedValue);
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

  /**
   * Liest einen Wert aus dem LocalStorage.
   * @param {string} key 
   * @returns {success: boolean, data?: any, error?: string}
   */
  get(key) {
    try {
      const prefixedKey = `${PREFIX}${key}`;
      const item = localStorage.getItem(prefixedKey);
      
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
    try {
      const prefixedKey = `${PREFIX}${key}`;
      localStorage.removeItem(prefixedKey);
      return { success: true, data: null };
    } catch (error) {
      console.error('[Storage Remove Error]', error);
      return { success: false, error: error.message };
    }
  }
};
