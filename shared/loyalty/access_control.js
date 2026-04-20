/**
 * /shared/loyalty/access_control.js
 * The Gatekeeper: Prüft Unlocks & Feature Flags strikt nach MBRN_CONFIG
 */

import { MBRN_CONFIG } from '../core/config/index.js';
import { state } from '../core/state/index.js';

/**
 * Hilfsfunktion, um das aktuelle Profil sicher aus dem State zu laden.
 */
function getCurrentProfile() {
  // Fallback, falls Hydratisierung noch nicht durch ist oder fehlgeschlagen ist
  const profile = state.get('systemInitialized');
  return profile || { access_level: 0, unlocked_tools: [], features: {} };
}

/**
 * Prüft, ob der Nutzer Zugriff auf ein globales Tool hat.
 * @param {string} toolName (z.B. 'finance_advanced')
 * @returns {boolean}
 */
export function hasAccessTo(toolName) {
  const profile = getCurrentProfile();
  
  // Höchste Tiers haben oft impliziten Full-Access
  if (profile.access_level >= MBRN_CONFIG.accessLevels.MEMBER) {
    return true;
  }

  // Explizite Überprüfung
  if (profile.unlocked_tools && profile.unlocked_tools.includes(toolName)) {
    return true;
  }

  return false;
}

/**
 * Prüft, ob ein spezifisches (oft Premium-) Feature freigeschaltet ist.
 * @param {string} featureName (z.B. 'pdf_export')
 * @returns {boolean}
 */
export function hasFeature(featureName) {
  const profile = getCurrentProfile();

  // PAID_PRO Accounts haben alle Features bypass
  if (profile.access_level >= MBRN_CONFIG.accessLevels.PAID_PRO) {
    return true;
  }

  // Explizite Feature-Prüfung aus dem User-Profil
  if (profile.features && profile.features[featureName]) {
    return true;
  }

  return false;
}
