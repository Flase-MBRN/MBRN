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

  // LAW 8: INTERNATIONALIZATION (i18n) — Centralized Translations
  // Automatic language detection via navigator.language (DE/EN)
  i18n: {
    de: {
      // Loading states
      loading: 'Berechne...',
      loadingTerminal: 'BERECHNE...',
      loadingTimeline: 'BERECHNE ZEITLINIE...',
      loadingResonance: 'BERECHNE RESONANZ...',
      loadingDecrypt: 'ENTSCHLÜSSELE...',
      analyzing: 'Analysiere Frequenz...',
      initializing: 'Initialisiere...',

      // Auth
      logout: 'Logout',
      login: 'Login / Registrieren',
      authErrorTitle: 'System Login',
      authRegisterTitle: 'System Registrierung',
      authLoginBtn: 'Anmelden',
      authRegisterBtn: 'Konto erstellen',
      noAccount: 'Noch kein Konto? Registrieren',
      hasAccount: 'Bereits ein Konto? Login',

      // Security
      securityBlock: '🛡️ SICHERHEITSBLOCKADE',
      invalidEmail: 'Ungültige E-Mail-Adresse.',
      blockedDomain: 'Domain ist gesperrt.',
      disposableEmail: 'E-Mail sieht nach einer Wegwerf-Adresse aus.',
      useRealEmail: 'Bitte nutze eine echte E-Mail oder einen Gmail-Alias (name+test@gmail.com).',

      // Terminal sequence
      terminal: {
        sequence: [
          '> Verbinde mit MBRN Core...',
          '> Authentifiziere Frequenz-Node...',
          '> Syncing Chronos Engine...',
          '> Decodierung der Lebensmatrix...',
          '> Berechne numerische Resonanz...',
          '> Extrahiere Primärfrequenz...',
          '> Analyse abgeschlossen.'
        ]
      },

      // Validation
      enterNameDate: '⚠️ Bitte Name und Geburtsdatum eingeben',
      enterBothOperators: '⚠️ Bitte beide Operatoren vollständig eingeben',
      enterBirthdate: '⚠️ Bitte Geburtsdatum eingeben',
      invalidDate: 'Bitte prüfe dein Geburtsdatum — dieses Datum existiert nicht im Kalender.',
      dateNotExist: 'Ungültiges Datum: Das eingegebene Datum existiert nicht. Bitte prüfe Tag und Monat.',
      nameTooShort: 'Name muss mindestens 2 Zeichen haben.',
      invalidNumber: 'Bitte eine gültige Zahl eingeben.',

      // Success
      checkinSuccess: '✅ Check-In erfolgreich! Streak +1',

      // Errors
      pdfError: 'Fehler bei der PDF-Erstellung. Bitte versuche es erneut.',
      offlineMode: 'Offline',
      paywallActive: 'Zahlung erforderlich',
      
      // Routes
      routes: {
        dashboard: 'Dashboard',
        finance: 'Finance',
        numerology: 'Numerologie',
        synergy: 'Synergy',
        chronos: 'Chronos',
        tuning: 'Tuner'
      }
    },
    en: {
      // Loading states
      loading: 'Calculating...',
      loadingTerminal: 'CALCULATING...',
      loadingTimeline: 'CALCULATING TIMELINE...',
      loadingResonance: 'CALCULATING RESONANCE...',
      loadingDecrypt: 'DECRYPTING...',
      analyzing: 'Analyzing frequency...',
      initializing: 'Initializing...',

      // Auth
      logout: 'Logout',
      login: 'Login / Register',
      authErrorTitle: 'System Login',
      authRegisterTitle: 'System Registration',
      authLoginBtn: 'Sign In',
      authRegisterBtn: 'Create Account',
      noAccount: "Don't have an account? Register",
      hasAccount: 'Already have an account? Login',

      // Security
      securityBlock: '🛡️ SECURITY BLOCK',
      invalidEmail: 'Invalid email address.',
      blockedDomain: 'Domain is blocked.',
      disposableEmail: 'Email appears to be a disposable address.',
      useRealEmail: 'Please use a real email or Gmail alias (name+test@gmail.com).',

      // Terminal sequence
      terminal: {
        sequence: [
          '> Connecting to MBRN Core...',
          '> Authenticating Frequency Node...',
          '> Syncing Chronos Engine...',
          '> Decoding Life Matrix...',
          '> Calculating Numerical Resonance...',
          '> Extracting Primary Frequency...',
          '> Analysis complete.'
        ]
      },

      // Validation
      enterNameDate: '⚠️ Please enter name and birthdate',
      enterBothOperators: '⚠️ Please enter both operators completely',
      enterBirthdate: '⚠️ Please enter birthdate',
      invalidDate: 'Please check your birthdate — this date does not exist in the calendar.',
      dateNotExist: 'Invalid date: The entered date does not exist. Please check day and month.',
      nameTooShort: 'Name must be at least 2 characters.',
      invalidNumber: 'Please enter a valid number.',

      // Success
      checkinSuccess: '✅ Check-In successful! Streak +1',

      // Errors
      pdfError: 'Error creating PDF. Please try again.',
      offlineMode: 'Offline',
      paywallActive: 'Payment required',
      
      // Routes
      routes: {
        dashboard: 'Dashboard',
        finance: 'Finance',
        numerology: 'Numerology',
        synergy: 'Synergy',
        chronos: 'Chronos',
        tuning: 'Tuner'
      }
    }
  },

  // LAW 8: UI CONFIG (Deprecated - use i18n)
  ui: {
    // Legacy support - redirects to i18n
    labels: null // Removed - use i18n.t('key') instead
  },

  // Dev bypass for testing
  dev: {
    bypassPayment: false
  },

  // LAW 8: VALIDATION CONSTANTS - Centralized thresholds, no magic numbers
  validation: {
    date: {
      MIN_MONTH: 1,
      MAX_MONTH: 12,
      MIN_DAY: 1,
      MAX_DAY: 31,
      MIN_YEAR: 1900,
      MAX_YEAR: 2100
    },
    name: {
      MIN_LENGTH: 2,
      MAX_LENGTH: 100
    },
    email: {
      MIN_LOCAL_LENGTH: 2,
      MAX_LOCAL_LENGTH: 64,
      MAX_TOTAL_LENGTH: 254
    },
    finance: {
      MAX_YEARS: 100,
      MAX_RATE_PERCENT: 100,
      MAX_PRINCIPAL: 100_000_000,
      MAX_MONTHLY_ADDITION: 100_000_000
    }
  }
};

/**
 * Master Numbers — Centralized numerological constants (Law 8: No Magic Numbers)
 * Used across all numerology engines for consistent Master Number handling
 */
export const MASTER_NUMBERS = Object.freeze([11, 22, 33]);

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
