export const LEGAL_VERSION = '1.0.0';

export const LEGAL_LINKS = Object.freeze({
  impressum: 'impressum.html',
  datenschutz: 'datenschutz.html'
});

export const LEGAL_LAUNCH_BLOCKERS = Object.freeze([
  '__LEGAL_OWNER_NAME__',
  '__LEGAL_OWNER_ADDRESS__',
  '__LEGAL_CONTACT_EMAIL__'
]);

export const LEGAL_TEXTS = Object.freeze({
  general: {
    title: 'Hinweis',
    body:
      'MBRN ist ein digitales Modell für Einordnung, Planung und Reflexion auf Basis deiner Eingaben. Die Inhalte dienen der Orientierung und ersetzen keine fachliche Beratung.'
  },
  data: {
    title: 'Datennutzung',
    body:
      'Für Berechnung und Darstellung nutzt MBRN Angaben wie Name und Geburtsdatum. Teile deines Profils können lokal in deinem Browser gespeichert werden, damit du später weitermachen kannst.'
  },
  numerology: {
    title: 'Modell-Hinweis',
    body:
      'Die Muster- und Zahlenansichten sind als modellbasierte Einordnung und Reflexionshilfe zu verstehen. Sie treffen keine objektiven oder wissenschaftlichen Wahrheitsaussagen über deine Person.'
  },
  finance: {
    title: 'Finanz-Hinweis',
    body:
      'Die Finanzansichten sind Rechen- und Orientierungshilfen. Sie sind keine Finanz-, Steuer- oder Rechtsberatung und bilden keine Garantie für reale Entwicklungen ab.'
  },
  chronos_timing: {
    title: 'Timing-Hinweis',
    body:
      'Chronos ist eine modellbasierte Zeit- und Phasen-Einordnung. Die Darstellung unterstützt Reflexion und Timing-Interpretation, trifft aber keine wissenschaftlichen, deterministischen oder vorhersagenden Aussagen.'
  },
  export_privacy: {
    title: 'Teilen & Export',
    body:
      'Exportierte Bilder, Storys oder PDFs können persönliche Informationen enthalten. Prüfe Inhalt und Sichtbarkeit vor dem Teilen oder Weitergeben sorgfältig.'
  },
  sync: {
    title: 'Sync-Hinweis',
    body:
      'MBRN arbeitet lokal-first. Je nach aktivierten Funktionen können Anmelde-, Profil-, Realtime- oder Sync-Vorgänge technische Verbindungen zu externer Infrastruktur wie Supabase auslösen.'
  },
  commerce: {
    title: 'Freischaltungs-Hinweis',
    body:
      'Geschützte Bereiche werden in diesem Stand nur intern über Profilstatus und Systemkonfiguration freigeschaltet.'
  },
  auth_notice: {
    title: 'Anmelde-Hinweis',
    body:
      'Bei Login und Registrierung können E-Mail-Adresse, Profilstatus und technische Sitzungsdaten verarbeitet werden. Dieser Hinweis gilt für die interne Auth-Fläche.'
  }
});

export const LEGAL_CLAIM_GUARD = Object.freeze({
  forbiddenWords: [
    'wissenschaftlich',
    'objektiv',
    'garantiert',
    'beweist',
    'nur lokal',
    '100% anonym'
  ],
  forbiddenPatterns: [
    /du bist\b/i,
    /\bgarantier\w*/i,
    /\bbeweis\w*/i,
    /\bobjektiv\b/i,
    /\bwissenschaftlich\b/i,
    /\bnur lokal\b/i,
    /100\s*%\s*anonym/i,
    /\bimmer\b.*\bso\b/i,
    /\bdefinitiv\b/i
  ],
  preferredLanguage: [
    'Modell',
    'Einordnung',
    'Reflexion',
    'auf Basis deiner Eingaben',
    'lokal-first'
  ]
});
