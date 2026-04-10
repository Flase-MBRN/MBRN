/**
 * /shared/core/config.js
 * MBRN Mastery System (Single Source of Truth)
 */

export const MBRN_CONFIG = {
  accessLevels: {
    FREE: 0,
    SPARK: 1,      // 7 Tage: Kleine Anerkennung, erster Status
    BUILDER: 2,    // 30 Tage: 1 Tool nach Wahl dauerhaft freigeschaltet
    OPERATOR: 3,   // 90 Tage: 3 Tools + erweiterte Funktionen
    MEMBER: 4,     // 365 Tage: Full Hub Access, Beta, Voting
    PAID_PRO: 10   // Premium Features (Depth & Comfort)
  },
  tiers: { spark: 7, builder: 30, operator: 90, member: 365 },
  shields: { earnRate: 7, max: 3 }, // Streak Shield: Schutz vor Rückfall
  powerPass: { triggerDay: 15, durationHours: 48 }, // Vorgeschmack auf Premium
  
  // STRIPE CONFIGURATION (Phase 18.1)
  stripe: {
    publicKey: 'pk_test_REPLACE_WITH_YOUR_KEY',
    priceIdArtifact: 'price_REPLACE_WITH_YOUR_PRICE_ID'
  }
};
