/**
 * /shared/core/i18n.js
 * INTERNATIONALIZATION ENGINE — Global Language Support
 * 
 * Responsibility: Automatic language detection (DE/EN) and translation
 * LAW 8 COMPLIANT: No Magic Strings — all labels centralized
 * 
 * Usage: i18n.t('key') or i18n.t('key.namespace')
 */

import { MBRN_CONFIG } from './config.js';

function getNavigatorLanguage() {
  if (typeof globalThis === 'undefined' || !globalThis.navigator) {
    return 'en';
  }

  return globalThis.navigator.language || globalThis.navigator.userLanguage || 'en';
}

function canUseLocalStorage() {
  return typeof globalThis !== 'undefined' && !!globalThis.localStorage;
}

class I18nEngine {
  constructor() {
    this.currentLang = this._detectLanguage();
    this.translations = MBRN_CONFIG.i18n || {};
    this._listeners = [];
  }

  /**
   * Auto-detect language from browser settings
   * Supported: 'de' (German), 'en' (English)
   * Fallback: 'en'
   */
  _detectLanguage() {
    const browserLang = getNavigatorLanguage();
    const langCode = browserLang.split('-')[0].toLowerCase();
    
    // Supported languages
    const supported = ['de', 'en'];
    const detected = supported.includes(langCode) ? langCode : 'en';
    return detected;
  }

  /**
   * Get current active language
   */
  getCurrentLang() {
    return this.currentLang;
  }

  /**
   * Manually set language
   */
  setLanguage(lang) {
    const supported = ['de', 'en'];
    if (!supported.includes(lang)) {
      lang = 'en';
    }
    
    if (this.currentLang !== lang) {
      this.currentLang = lang;
      if (canUseLocalStorage()) {
        globalThis.localStorage.setItem('mbrn_lang', lang);
      }
      this._notifyListeners();
    }
    return this;
  }

  /**
   * Translate a key with optional interpolation
   * Supports nested keys: 'auth.login', 'terminal.sequence.0'
   * 
   * @param {string} key - Translation key (dot-notation supported)
   * @param {Object} params - Optional interpolation params
   * @returns {string} Translated string or key if not found
   */
  t(key, params = {}) {
    const langData = this.translations[this.currentLang];
    if (!langData) {
      return key;
    }

    // Navigate nested keys
    const keys = key.split('.');
    let value = langData;
    
    for (const k of keys) {
      if (value === null || value === undefined || typeof value !== 'object') {
        // Fallback to English
        value = this._fallbackToEn(key);
        return value ? this._interpolate(value, params) : key;
      }
      value = value[k];
    }

    // If value not found, fallback to English
    if (value === null || value === undefined) {
      value = this._fallbackToEn(key);
    }

    // If still not found, return the key
    if (value === null || value === undefined) {
      return key;
    }

    return this._interpolate(value, params);
  }

  /**
   * Fallback to English translation
   */
  _fallbackToEn(key) {
    const enData = this.translations['en'];
    if (!enData) return null;

    const keys = key.split('.');
    let value = enData;
    
    for (const k of keys) {
      if (value === null || value === undefined || typeof value !== 'object') {
        return null;
      }
      value = value[k];
    }
    
    return value;
  }

  /**
   * Interpolate params into translation string
   * @example: "Hello {{name}}" with {name: "World"} -> "Hello World"
   */
  _interpolate(text, params) {
    if (typeof text !== 'string') return text;
    
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match;
    });
  }

  /**
   * Get array translation (for terminal sequence, etc.)
   * @param {string} key - Array key
   * @returns {Array} Translated array or empty array
   */
  getArray(key) {
    const langData = this.translations[this.currentLang];
    if (!langData) return [];

    const keys = key.split('.');
    let value = langData;
    
    for (const k of keys) {
      if (value === null || value === undefined || typeof value !== 'object') {
        // Fallback to English
        const enData = this.translations['en'];
        if (!enData) return [];
        value = enData;
        for (const k2 of keys) {
          if (value === null || value === undefined || typeof value !== 'object') {
            return [];
          }
          value = value[k2];
        }
        return Array.isArray(value) ? value : [];
      }
      value = value[k];
    }

    if (Array.isArray(value)) return value;
    
    // Fallback to English array
    const enData = this.translations['en'];
    if (!enData) return [];
    value = enData;
    for (const k of keys) {
      if (value === null || value === undefined || typeof value !== 'object') {
        return [];
      }
      value = value[k];
    }
    
    return Array.isArray(value) ? value : [];
  }

  /**
   * Subscribe to language changes
   */
  onLanguageChange(callback) {
    this._listeners.push(callback);
    return () => {
      const index = this._listeners.indexOf(callback);
      if (index > -1) this._listeners.splice(index, 1);
    };
  }

  _notifyListeners() {
    this._listeners.forEach(cb => {
      try {
        cb(this.currentLang);
      } catch (err) {
        console.error('[I18n] Language change listener failed:', err);
      }
    });
  }

  /**
   * Reload translations from config (useful after dynamic config updates)
   */
  reload() {
    this.translations = MBRN_CONFIG.i18n || {};
    return this;
  }

  /**
   * Get list of supported languages
   */
  getSupportedLanguages() {
    return ['de', 'en'];
  }
}

// Singleton instance
export const i18n = new I18nEngine();

// Convenience export for direct translation calls
export const t = (key, params) => i18n.t(key, params);
