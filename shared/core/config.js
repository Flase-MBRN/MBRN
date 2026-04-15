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
  },
  
  // SENTIMENT WIDGET THRESHOLDS (Law 8: No Magic Numbers)
  sentiment: {
    thresholds: {
      EXTREME_GREED: 75,
      GREED: 55,
      NEUTRAL: 45,
      FEAR: 25
    }
  },
  
  // DEV FLAGS (Phase 4.0: Local Development Overrides)
  // ⚠️ WICHTIG: Diese Flags auf FALSE setzen vor Production-Release!
  dev: {
    bypassPayment: false, // ← DEV ONLY: Auf true setzen für lokale Tests ohne Payment
  }
};

/**
 * Navigation Routes — Centralized for easy extension
 * LAW 1 COMPLIANT: Single source for navigation
 */
export const MBRN_ROUTES = {
  home:        'index.html',
  dashboard:   'dashboard/index.html',
  finance:     'apps/finance/index.html',
  numerology:  'apps/numerology/index.html',
  synergy:     'apps/synergy/index.html',      // Ready for future
  chronos:     'apps/chronos/index.html',      // Ready for future
  tuning:      'apps/tuning/index.html'        // Ready for future
};

/**
 * Route metadata for dynamic navigation generation
 */
export const MBRN_ROUTE_META = {
  dashboard:   { icon: '◈', label: 'Dashboard', tier: 0 },
  finance:     { icon: '◉', label: 'Finance', tier: 0 },
  numerology:  { icon: '◐', label: 'Numerologie', tier: 0 },
  synergy:     { icon: '◷', label: 'Synergy', tier: 10 },
  chronos:     { icon: '◫', label: 'Chronos', tier: 10 },
  tuning:      { icon: '◎', label: 'Tuner', tier: 10 }
};
