/**
 * /shared/core/config/index.js
 * MBRN runtime configuration.
 */

export const MBRN_CONFIG = {
  commercial: {
    isActive: false,
    soonBadgeLabel: 'Bald verfügbar'
  },

  accessLevels: {
    FREE: 0,
    PRO: 10,
    BUSINESS: 20
  },
  tiers: { spark: 7, builder: 30, operator: 90, member: 365 },
  shields: { earnRate: 7, max: 3 },
  powerPass: { triggerDay: 15, durationHours: 48 },

  stripe: {
    publicKey: 'pk_test_REPLACE_WITH_YOUR_KEY',
    priceIdArtifact: 'price_REPLACE_WITH_YOUR_PRICE_ID'
  },

  sentiment: {
    thresholds: {
      EXTREME_GREED: 75,
      GREED: 55,
      NEUTRAL: 45,
      FEAR: 25
    }
  },

  i18n: {
    de: {
      loading: 'Ich ordne gerade alles.',
      loadingTerminal: 'ICH ORDNE GERADE ALLES.',
      loadingTimeline: 'ICH SORTIERE DEINE ZEIT.',
      loadingResonance: 'ICH SCHAUE MIR EUREN VIBE AN.',
      loadingDecrypt: 'ICH ORDNE DEIN MUSTER.',
      analyzing: 'Ich schaue gerade nach.',
      initializing: 'Einen Moment...',

      logout: 'Abmelden',
      login: 'ANMELDEN',
      authErrorTitle: 'Login',
      authRegisterTitle: 'Registrierung',
      authLoginBtn: 'Anmelden',
      authRegisterBtn: 'Konto erstellen',
      noAccount: 'Noch kein Konto? Hier registrieren',
      hasAccount: 'Bereits ein Konto? Hier anmelden',

      securityBlock: 'SICHERHEITSBLOCKADE',
      invalidEmail: 'Ungültige E-Mail-Adresse.',
      blockedDomain: 'Domain ist gesperrt.',
      disposableEmail: 'E-Mail sieht nach einer Wegwerf-Adresse aus.',
      useRealEmail: 'Bitte nutze eine echte E-Mail oder einen Gmail-Alias (name+test@gmail.com).',

      terminal: {
        sequence: [
          '> Initialisiere Datenstruktur...',
          '> Dekodiere Kernmuster...',
          '> Synchronisiere Lebenszyklen...',
          '> Generiere Profil.'
        ]
      },

      enterNameDate: 'Bitte Name und Geburtsdatum eingeben.',
      enterBothOperators: 'Bitte beide Daten vollständig eingeben.',
      enterBirthdate: 'Bitte Geburtsdatum eingeben.',
      invalidDate: 'Bitte prüfe dein Geburtsdatum. Dieses Datum gibt es nicht im Kalender.',
      dateNotExist: 'Dieses Datum gibt es nicht. Bitte prüfe Tag und Monat.',
      nameTooShort: 'Name muss mindestens 2 Zeichen haben.',
      invalidNumber: 'Bitte eine gültige Zahl eingeben.',

      checkinSuccess: 'Check-in erfolgreich. Dein Puls bleibt dran.',

      pdfError: 'Fehler bei der PDF-Erstellung. Bitte versuche es erneut.',
      offlineMode: 'Offline',
      paywallActive: 'Zahlung erforderlich',

      routes: {
        dashboard: 'Dashboard',
        finance: 'Wachstum',
        numerology: 'Mustererkennung',
        synergy: 'Vibe Check',
        chronos: 'Zeit',
        tuning: 'Feinschliff'
      }
    },
    en: {
      loading: 'Putting it in order...',
      loadingTerminal: 'PUTTING IT IN ORDER...',
      loadingTimeline: 'LOOKING AT YOUR TIMING...',
      loadingResonance: 'CHECKING YOUR VIBE...',
      loadingDecrypt: 'READING YOUR PATTERN...',
      analyzing: 'Looking into it...',
      initializing: 'One moment...',

      logout: 'Logout',
      login: 'Login / Register',
      authErrorTitle: 'Login',
      authRegisterTitle: 'Register',
      authLoginBtn: 'Sign In',
      authRegisterBtn: 'Create Account',
      noAccount: "Don't have an account? Register",
      hasAccount: 'Already have an account? Login',

      securityBlock: 'SECURITY BLOCK',
      invalidEmail: 'Invalid email address.',
      blockedDomain: 'Domain is blocked.',
      disposableEmail: 'Email appears to be disposable.',
      useRealEmail: 'Please use a real email or a Gmail alias (name+test@gmail.com).',

      terminal: {
        sequence: [
          '> I am gathering your details.',
          '> I am sorting your pattern.',
          '> I am checking your phases.',
          '> I am putting everything in order.',
          '> Almost there.',
          '> Your first view is ready.'
        ]
      },

      enterNameDate: 'Please enter name and birthdate.',
      enterBothOperators: 'Please enter both dates completely.',
      enterBirthdate: 'Please enter a birthdate.',
      invalidDate: 'Please check your birthdate. That date does not exist in the calendar.',
      dateNotExist: 'That date does not exist. Please check day and month.',
      nameTooShort: 'Name must be at least 2 characters.',
      invalidNumber: 'Please enter a valid number.',

      checkinSuccess: 'Check-in complete. Your pulse stays active.',

      pdfError: 'Error creating PDF. Please try again.',
      offlineMode: 'Offline',
      paywallActive: 'Payment required',

      routes: {
        dashboard: 'Dashboard',
        finance: 'Growth',
        numerology: 'Pattern',
        synergy: 'Vibe Check',
        chronos: 'Time',
        tuning: 'Fine Tune'
      }
    }
  },

  ui: {
    labels: null
  },

  dev: {
    bypassPayment: false
  },

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

export const IS_COMMERCIAL_MODE_ACTIVE = MBRN_CONFIG.commercial.isActive;

export const MASTER_NUMBERS = Object.freeze([11, 22, 33]);
