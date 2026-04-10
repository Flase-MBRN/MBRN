/**
 * /shared/loyalty/streak_manager.js
 * Berechnet Streaks, Shields und Check-ins (Pure Functions)
 */

import { MBRN_CONFIG } from '../core/config.js';

/**
 * Normalisiert ein Datum zu einem strikten YYYY-MM-DD Format,
 * um Zeitzonen-Bugs bei Tagesvergleichen zu verhindern.
 */
function normalizeDate(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Berechnet die absolute Differenz in Tagen zwischen zwei normalisierten Daten.
 */
function getDayDiff(dateStr1, dateStr2) {
  const [y1, m1, d1] = dateStr1.split('-');
  const [y2, m2, d2] = dateStr2.split('-');
  const local1 = new Date(y1, m1 - 1, d1);
  const local2 = new Date(y2, m2 - 1, d2);
  return Math.round((local2 - local1) / 86400000);
}

export const streakManager = {
  /**
   * Berechnet den neuen Status (Streak + Shields) nach einem Check-in Versuch.
   * @param {Object} currentProfile 
   * @param {Date} today (Injizierbar für Tests)
   * @returns {success: boolean, error?: string, data?: object}
   */
  calculateCheckIn(currentProfile, today = new Date()) {
    const todayStr = normalizeDate(today);
    const lastCheckIn = currentProfile.lastCheckIn;
    
    let newStreak = currentProfile.streak || 0;
    let shields = currentProfile.shields || 0;
    let usedShield = false;

    if (!lastCheckIn) {
      // Allerster Check-in überhaupt
      newStreak = 1;
    } else {
      const diff = getDayDiff(lastCheckIn, todayStr);

      // SECURITY: Negativer Diff = Systemuhr wurde zurückgedreht → hard abort
      if (diff < 0) {
        return { success: false, error: 'Ungültiger Zeitstempel. Systemzeit prüfen.' };
      }
      
      if (diff === 0) {
        // Heute bereits eingecheckt -> Idempotent, wirft Fehler aber crasht nicht
        return { 
          success: false, 
          error: 'Heute bereits eingecheckt.',
          data: currentProfile
        };
      } else if (diff === 1) {
        // Tag danach -> Perfekte Konsistenz
        newStreak += 1;
      } else {
        // Einer oder mehrere Tage wurden verpasst
        const missedDays = diff - 1;
        
        if (this.canUseShield(shields, missedDays)) {
          shields -= missedDays;
          usedShield = true;
          // Streak bleibt erhalten und erhöht sich nach Einsatz des Schildes
          newStreak += 1; 
        } else {
          // Streak gebrochen, keine (ausreichenden) Schilde vorhanden
          newStreak = 1;
          shields = 0;
        }
      }
    }

    // Shield Reward Logik gemäß MBRN_CONFIG
    if (newStreak > 0 && newStreak % MBRN_CONFIG.shields.earnRate === 0 && shields < MBRN_CONFIG.shields.max) {
      shields += 1;
    }

    const updatedProfile = {
      ...currentProfile,
      streak: newStreak,
      shields: shields,
      lastCheckIn: todayStr
    };

    return { 
      success: true, 
      data: {
        profile: updatedProfile,
        usedShield: usedShield,
        streakBroken: newStreak === 1 && currentProfile.streak > 1
      }
    };
  },

  /**
   * Hilfsfunktion für explizite Shield-Logik.
   */
  canUseShield(availableShields, missedDays) {
    return availableShields >= missedDays;
  }
};
