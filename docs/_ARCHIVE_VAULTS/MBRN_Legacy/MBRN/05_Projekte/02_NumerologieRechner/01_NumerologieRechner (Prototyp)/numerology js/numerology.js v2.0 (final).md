/**
 * numerology.js — v2.0 FINAL
 * Vollständiges Pythagoras-Numerologie-System (32 Zahlen)
 * ─────────────────────────────────────────────────────────────
 *  Kernzahlen (6):       Lebenszahl, Ausdruckszahl, Seelenzahl,
 *                        Persönlichkeitszahl, Geburtstagszahl, Reifezahl
 *  Karma (2):            Karmische Schulden, Karmische Lektionen
 *  Psychologie (3):      Balancezahl, Unterbewusstsein, Rational Thought
 *  Talente (4):          Hidden Passion, Cornerstone, Capstone, First Impression
 *  Ebenen (4):           Mental, Emotional, Physisch, Intuitiv
 *  Lebensphasen (3):     Life Cycle 1–3
 *  Höhepunkte (4):       Pinnacle 1–4
 *  Herausforderungen (4):Challenge 1–4
 *  Zeitzyklen (3):       Pers. Jahr, Monat, Tag
 *  Bridges (2):          Life Path Bridge, Soul-Personality Bridge
 * ─────────────────────────────────────────────────────────────
 */

'use strict';


/* ═══════════════════════════════════════════════════════════
   1. KONSTANTEN
   ═══════════════════════════════════════════════════════════ */

const PYTHAGORAS = {
  1: ['A','J','S'], 2: ['B','K','T'], 3: ['C','L','U'],
  4: ['D','M','V'], 5: ['E','N','W'], 6: ['F','O','X'],
  7: ['G','P','Y'], 8: ['H','Q','Z'], 9: ['I','R'],
};

const VOWELS           = new Set(['A','E','I','O','U']);
const MASTER_NUMBERS   = new Set([11, 22, 33]);
const KARMIC_DEBT_NUMS = new Set([13, 14, 16, 19]);

const PLANES = {
  mental:    new Set([1, 5, 9]),
  emotional: new Set([2, 3, 6]),
  physical:  new Set([4, 8]),
  intuitive: new Set([7]),
};


/* ═══════════════════════════════════════════════════════════
   2. MATHEMATISCHE KERN-FUNKTIONEN
   ═══════════════════════════════════════════════════════════ */

function digitSum(n) {
  return String(n).split('').reduce((s, d) => s + parseInt(d, 10), 0);
}
function reduceForceSingle(n) {
  if (n === 0) return 0;
  while (n > 9) n = digitSum(n);
  return n;
}
function reducePreserveMaster(n) {
  if (n === 0) return 0;
  if (MASTER_NUMBERS.has(n)) return n;
  while (n > 9) { n = digitSum(n); if (MASTER_NUMBERS.has(n)) break; }
  return n;
}
function formatValue(rawSum) {
  const normal = reduceForceSingle(rawSum);
  const master = reducePreserveMaster(rawSum);
  if (MASTER_NUMBERS.has(master) && master !== normal) return `${normal}/${master}`;
  return String(normal);
}
function parseDisplayValue(displayValue) {
  const s = String(displayValue);
  if (s.includes('/')) {
    const [b, m] = s.split('/').map(Number);
    return { base: b, master: m };
  }
  return { base: Number(s), master: null };
}
function findKarmicDebt(rawSum) {
  let n = rawSum;
  while (n > 9) {
    if (KARMIC_DEBT_NUMS.has(n)) return n;
    n = digitSum(n);
  }
  return null;
}


/* ═══════════════════════════════════════════════════════════
   3. NAMENS-NORMALISIERUNG & KONVERSION
   ═══════════════════════════════════════════════════════════ */

function normalizeName(name) {
  return name.toUpperCase()
    .replace(/Ä/g, 'AE').replace(/Ö/g, 'OE')
    .replace(/Ü/g, 'UE').replace(/ß/g, 'SS');
}
function charToNumber(char) {
  for (const [num, chars] of Object.entries(PYTHAGORAS)) {
    if (chars.includes(char)) return parseInt(num, 10);
  }
  return 0;
}
function nameToNumbers(name) {
  return normalizeName(name).replace(/\s+/g, '').split('')
    .map(ch => charToNumber(ch)).filter(n => n > 0);
}


/* ═══════════════════════════════════════════════════════════
   4. KERN-BERECHNUNGEN
   ═══════════════════════════════════════════════════════════ */

function calculateLifeSum(date) {
  return date.replace(/\D/g, '').split('').reduce((s, d) => s + parseInt(d, 10), 0);
}
function calculateExpressionSum(name) {
  return nameToNumbers(name).reduce((s, n) => s + n, 0);
}
function calculateSoulSum(name) {
  return normalizeName(name).replace(/\s+/g, '').split('')
    .filter(ch => VOWELS.has(ch)).reduce((s, ch) => s + charToNumber(ch), 0);
}
function calculatePersonalitySum(name) {
  return normalizeName(name).replace(/\s+/g, '').split('')
    .filter(ch => !VOWELS.has(ch)).reduce((s, ch) => s + charToNumber(ch), 0);
}
function calculateBirthdaySum(date) {
  return parseInt(date.split('.')[0], 10);
}
function calculateMaturitySum(lifeSum, expressionSum) {
  return reduceForceSingle(lifeSum) + reduceForceSingle(expressionSum);
}


/* ═══════════════════════════════════════════════════════════
   5. KARMA
   ═══════════════════════════════════════════════════════════ */

function calculateKarmicLessons(name) {
  const present = new Set(nameToNumbers(name));
  return [1,2,3,4,5,6,7,8,9].filter(n => !present.has(n));
}


/* ═══════════════════════════════════════════════════════════
   6. PSYCHOLOGIE
   ═══════════════════════════════════════════════════════════ */

function calculateBalanceSum(name) {
  return normalizeName(name).split(' ').filter(p => p.length > 0)
    .reduce((s, p) => s + charToNumber(p[0]), 0);
}
function calculateSubconscious(name) {
  return 9 - calculateKarmicLessons(name).length;
}
function calculateRationalThought(date, expressionSum) {
  const birthday   = calculateBirthdaySum(date);
  const expression = reduceForceSingle(expressionSum);
  return reducePreserveMaster(birthday + expression);
}


/* ═══════════════════════════════════════════════════════════
   7. TALENTE
   ═══════════════════════════════════════════════════════════ */

function calculateHiddenPassion(name) {
  const nums   = nameToNumbers(name);
  const counts = {};
  nums.forEach(n => { counts[n] = (counts[n] || 0) + 1; });
  const max     = Math.max(...Object.values(counts));
  const winners = Object.keys(counts).filter(k => counts[k] === max).map(Number).sort((a,b) => a-b);
  return winners.join('/');
}
function calculateCornerstone(name) {
  const first = normalizeName(name).trim().split('')[0];
  return charToNumber(first);
}
function calculateCapstone(name) {
  const parts = normalizeName(name).trim().split(' ').filter(p => p.length > 0);
  const last  = parts[parts.length - 1];
  return charToNumber(last[last.length - 1]);
}
function calculateFirstImpression(name) {
  const parts = normalizeName(name).trim().split(' ').filter(p => p.length > 0);
  const first = charToNumber(parts[0][0]);
  const last  = parts.length > 1 ? charToNumber(parts[parts.length - 1][0]) : 0;
  return reducePreserveMaster(first + last);
}


/* ═══════════════════════════════════════════════════════════
   8. PLANES OF EXPRESSION
   ═══════════════════════════════════════════════════════════ */

function calculatePlanesOfExpression(name) {
  const nums = nameToNumbers(name);
  const r    = { mental: 0, emotional: 0, physical: 0, intuitive: 0 };
  nums.forEach(n => {
    if (PLANES.mental.has(n))    r.mental++;
    if (PLANES.emotional.has(n)) r.emotional++;
    if (PLANES.physical.has(n))  r.physical++;
    if (PLANES.intuitive.has(n)) r.intuitive++;
  });
  return r;
}


/* ═══════════════════════════════════════════════════════════
   9. LEBENSPHASEN (LIFE CYCLES)
   ═══════════════════════════════════════════════════════════ */

function calculateLifeCycles(date) {
  const [dStr, mStr, yStr] = date.split('.');
  return {
    lc1: reducePreserveMaster(parseInt(mStr, 10)),
    lc2: reducePreserveMaster(parseInt(dStr, 10)),
    lc3: reducePreserveMaster(reduceForceSingle(digitSum(parseInt(yStr, 10)))),
  };
}


/* ═══════════════════════════════════════════════════════════
   10. HERAUSFORDERUNGEN & HÖHEPUNKTE
   ═══════════════════════════════════════════════════════════ */

function calculateChallenges(date) {
  const [dStr, mStr, yStr] = date.split('.');
  const day   = reducePreserveMaster(parseInt(dStr, 10));
  const month = reduceForceSingle(parseInt(mStr, 10));
  const year  = reduceForceSingle(digitSum(parseInt(yStr, 10)));
  const c1 = reduceForceSingle(Math.abs(month - day));
  const c2 = reduceForceSingle(Math.abs(year  - day));
  const c3 = reduceForceSingle(Math.abs(c1 - c2));
  const c4 = reduceForceSingle(Math.abs(month - year));
  return { c1, c2, c3, c4 };
}

function calculatePinnacles(date) {
  const [dStr, mStr, yStr] = date.split('.');
  const day   = reduceForceSingle(parseInt(dStr, 10));
  const month = reduceForceSingle(parseInt(mStr, 10));
  const year  = reduceForceSingle(digitSum(parseInt(yStr, 10)));
  return {
    p1: reducePreserveMaster(month + day),
    p2: reducePreserveMaster(day   + year),
    p3: reducePreserveMaster(reduceForceSingle(reducePreserveMaster(month+day)) + reduceForceSingle(reducePreserveMaster(day+year))),
    p4: reducePreserveMaster(month + year),
  };
}


/* ═══════════════════════════════════════════════════════════
   11. ZEITZYKLEN
   ═══════════════════════════════════════════════════════════ */

function getPersonalYearRawSum(date) {
  const [dStr, mStr] = date.split('.');
  const day     = reduceForceSingle(parseInt(dStr, 10));
  const month   = reduceForceSingle(parseInt(mStr, 10));
  const yearRed = reduceForceSingle(digitSum(new Date().getFullYear()));
  return day + month + yearRed;
}
function getPersonalYearDisplay(date) {
  return formatValue(getPersonalYearRawSum(date));
}
function calculatePersonalMonth(personalYearRaw) {
  return reducePreserveMaster(reduceForceSingle(personalYearRaw) + new Date().getMonth() + 1);
}
function calculatePersonalDay(personalMonthVal) {
  return reducePreserveMaster(reduceForceSingle(personalMonthVal) + new Date().getDate());
}


/* ═══════════════════════════════════════════════════════════
   12. BRIDGES
   ═══════════════════════════════════════════════════════════ */

function calculateLifePathBridge(lifeSum, expressionSum) {
  return reduceForceSingle(Math.abs(reduceForceSingle(lifeSum) - reduceForceSingle(expressionSum)));
}
function calculateSoulPersonalityBridge(soulSum, personalitySum) {
  return reduceForceSingle(Math.abs(reduceForceSingle(soulSum) - reduceForceSingle(personalitySum)));
}


/* ═══════════════════════════════════════════════════════════
   13. KOMPATIBILITÄT
   ═══════════════════════════════════════════════════════════ */

function numberHarmony(a, b) {
  a = a > 9 ? reduceForceSingle(a) : a;
  b = b > 9 ? reduceForceSingle(b) : b;
  if (a === b) return 88;
  const key    = [a, b].sort((x, y) => x - y).join('-');
  const scores = {
    '1-3':85,'1-5':90,'1-9':78,'2-4':85,'2-6':88,'2-8':82,
    '3-6':85,'3-9':90,'4-6':80,'4-8':85,'5-9':82,'6-9':88,
    '1-2':60,'1-4':50,'1-6':65,'1-7':72,'1-8':68,'2-3':62,
    '2-5':55,'2-7':70,'2-9':65,'3-4':55,'3-5':68,'3-7':72,
    '3-8':58,'4-5':50,'4-7':68,'4-9':55,'5-6':60,'5-7':65,
    '5-8':62,'6-7':70,'6-8':65,'7-8':60,'7-9':72,'8-9':58,
  };
  return scores[key] || 65;
}


/* ═══════════════════════════════════════════════════════════
   14. DATUMS-VALIDIERUNG
   ═══════════════════════════════════════════════════════════ */

function isLeapYear(y) { return (y%4===0 && y%100!==0) || y%400===0; }
function isValidDate(dateStr) {
  if (!/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) return false;
  const [day, month, year] = dateStr.split('.').map(Number);
  if (month < 1 || month > 12) return false;
  if (year < 1900 || year > 2099) return false;
  const dim = [31, isLeapYear(year)?29:28, 31,30,31,30,31,31,30,31,30,31];
  return day >= 1 && day <= dim[month - 1];
}


/* ═══════════════════════════════════════════════════════════
   15. ERKLÄRUNGSTEXTE
   ═══════════════════════════════════════════════════════════ */

const EXPLANATIONS = {
  life: {
    1:'Neuanfang, Führung, Selbstbestimmung',2:'Harmonie, Kooperation, Sensibilität',
    3:'Kreativität, Ausdruck, Kommunikation',4:'Stabilität, Ordnung, Disziplin',
    5:'Flexibilität, Abenteuer, Veränderung',6:'Verantwortung, Familie, Fürsorge',
    7:'Analyse, Rückzug, Weisheit',8:'Macht, Erfolg, materielles Geschick',
    9:'Abschluss, Mitgefühl, Idealismus',11:'Intuition & Inspiration (Master 11)',
    22:'Vision & Realisierung (Master 22)',33:'Lehrer / Heiler (Master 33)',
  },
  soul: {
    1:'Innerer Antrieb',2:'Sehnsucht nach Harmonie',3:'Kreativität',
    4:'Sicherheit & Struktur',5:'Sehnsucht nach Freiheit',6:'Fürsorge',
    7:'Spirituelle Suche',8:'Starker Wille',9:'Empathie',
    11:'Spirituelle Sensibilität',22:'Visionäre Kraft',33:'Dienst am Kollektiv',
  },
  expression: {
    1:'Direkter Ausdruck',2:'Diplomatisch',3:'Kommunikativ',4:'Pragmatisch',
    5:'Vielseitig',6:'Verantwortungsvoll',7:'Analytisch',8:'Ambitioniert',
    9:'Inspirierend',11:'Inspirierende Persönlichkeit',22:'Großer Umsetzer',33:'Heilende Persönlichkeit',
  },
  personality: {
    1:'Wirkt unabhängig',2:'Wirkt freundlich',3:'Wirkt offen',4:'Wirkt stabil',
    5:'Wirkt lebhaft',6:'Wirkt warm',7:'Wirkt ruhig',8:'Wirkt stark',
    9:'Wirkt empathisch',11:'Besondere Ausstrahlung',22:'Visionär',33:'Sehr fürsorglich',
  },
  birthday: {
    1:'Geborener Anführer',2:'Diplomatisches Talent',3:'Kreatives Talent',
    4:'Praktisches Talent',5:'Abenteuerlust',6:'Fürsorge',
    7:'Denker',8:'Management-Talent',9:'Humanitäres Talent',
    11:'Spirituelles Talent',22:'Visionäres Talent',
  },
  maturity: {
    1:'Reife durch Selbstständigkeit',2:'Reife durch Kooperation',3:'Reife durch Kreativität',
    4:'Reife durch Struktur',5:'Reife durch Freiheit',6:'Reife durch Verantwortung',
    7:'Reife durch Erkenntnis',8:'Reife durch Macht',9:'Reife durch Mitgefühl',
    11:'Spirituelle Reife',22:'Große Manifestation',33:'Spiritueller Dienst',
  },
  karmic: {
    1:'Karm. Lektion: Eigeninitiative',2:'Karm. Lektion: Partnerschaft',3:'Karm. Lektion: Ausdruck',
    4:'Karm. Lektion: Verantwortung',5:'Karm. Lektion: Freiheit',6:'Karm. Lektion: Fürsorge',
    7:'Karm. Lektion: Innere Arbeit',8:'Karm. Lektion: Macht',9:'Karm. Lektion: Loslassen',
  },
  karmicDebt: {
    13:'13/4: Fleiß und Ausdauer als Lektion',14:'14/5: Selbstdisziplin und Verantwortung',
    16:'16/7: Ego-Transformation durch Demut',19:'19/1: Eigenverantwortung ohne Machtwille',
  },
  balance: {
    1:'Balance durch Eigenständigkeit',2:'Balance durch Diplomatie',3:'Balance durch Kommunikation',
    4:'Balance durch Ordnung',5:'Balance durch Anpassung',6:'Balance durch Verantwortung',
    7:'Balance durch Rückzug',8:'Balance durch Selbstkontrolle',9:'Balance durch Mitgefühl',
  },
  subconscious: {
    1:'Sehr wenig innere Sicherheit',2:'Unsicher bei Entscheidungen unter Druck',
    3:'Reagiert impulsiv unter Stress',4:'Gute Reaktion mit klaren Regeln',
    5:'Flexibel und anpassungsfähig in Krisen',6:'Verlässlich und fürsorglich unter Druck',
    7:'Analytisch-kühl in Notlagen',8:'Stark und pragmatisch in Krisen',
    9:'Ausgezeichnete Spontanreaktionen, sehr belastbar',
  },
  rationalThought: {
    1:'Direkt und unabhängig denkend',2:'Abwägend und diplomatisch',3:'Kreativ-intuitiv',
    4:'Methodisch und systematisch',5:'Flexibel und experimentell',6:'Fürsorglich abwägend',
    7:'Analytisch und tiefgründig',8:'Strategisch und ergebnisorientiert',9:'Ganzheitlich denkend',
    11:'Intuitiv-visionär',22:'Visionär-strategisch',33:'Empathisch und weise',
  },
  hiddenPassion: {
    1:'Verborgene Leidenschaft: Führung & Pioniergeist',2:'Verborgene Leidenschaft: Diplomatie & Mitgefühl',
    3:'Verborgene Leidenschaft: Kreativität & Kommunikation',4:'Verborgene Leidenschaft: Struktur & Verlässlichkeit',
    5:'Verborgene Leidenschaft: Freiheit & Abenteuer',6:'Verborgene Leidenschaft: Fürsorge & Heilung',
    7:'Verborgene Leidenschaft: Analyse & Spiritualität',8:'Verborgene Leidenschaft: Management & Macht',
    9:'Verborgene Leidenschaft: Mitgefühl & Weisheit',
  },
  cornerstone: {
    1:'Direkt, entschlossen, mutig',2:'Geduldig, kooperativ',3:'Optimistisch, kommunikativ',
    4:'Praktisch, verlässlich',5:'Neugierig, offen',6:'Fürsorglich, verantwortungsvoll',
    7:'Analytisch, nachdenklich',8:'Ehrgeizig, zielorientiert',9:'Mitfühlend, idealistisch',
  },
  capstone: {
    1:'Schließt eigenständig und entschlossen ab',2:'Schließt durch Kompromiss ab',3:'Schließt kreativ ab',
    4:'Schließt gründlich und vollständig ab',5:'Schließt ohne Wehmut, offen fürs Nächste',
    6:'Schließt mit Verantwortungsgefühl ab',7:'Schließt nach tiefer Reflexion ab',
    8:'Schließt mit Stärke und Entschlossenheit ab',9:'Schließt mit Loslassen und Würde ab',
  },
  firstImpression: {
    1:'Wirkt selbstbewusst und führend',2:'Wirkt sanft und zugänglich',3:'Wirkt charmant und kommunikativ',
    4:'Wirkt solide und verlässlich',5:'Wirkt dynamisch und offen',6:'Wirkt warm und vertrauenswürdig',
    7:'Wirkt nachdenklich und tiefgründig',8:'Wirkt professionell und stark',9:'Wirkt weise und empathisch',
    11:'Wirkt inspirierend und besonders',22:'Wirkt visionär und kraftvoll',
  },
  lifeCycle: {
    1:'Prägung durch Selbstfindung und Eigenständigkeit',2:'Prägung durch Kooperation und Beziehungen',
    3:'Prägung durch Kreativität und Ausdruck',4:'Prägung durch Struktur und harte Arbeit',
    5:'Prägung durch Freiheit und Veränderung',6:'Prägung durch Verantwortung und Familie',
    7:'Prägung durch Rückzug und inneres Wachstum',8:'Prägung durch Ehrgeiz und materielle Entwicklung',
    9:'Prägung durch Abschlüsse und Mitgefühl',11:'Prägung durch spirituelle Sensibilität',
    22:'Prägung durch Visionskraft und große Aufgaben',33:'Prägung durch Dienst und spirituelles Lehren',
  },
  challenge: {
    0:'Keine Herausforderung — volle Gestaltungsfreiheit',1:'Entwickle Selbstvertrauen und Unabhängigkeit',
    2:'Überkomme Überempfindlichkeit',3:'Fokussiere deine kreative Energie',
    4:'Baue Ausdauer, Disziplin und Verlässlichkeit auf',5:'Entwickle Freiheit ohne Verantwortungslosigkeit',
    6:'Fürsorge geben ohne Selbstverlust',7:'Öffne dich — Misstrauen hemmt dein Wachstum',
    8:'Handle mit Macht und Geld verantwortungsvoll',9:'Lerne Loslassen und universelle Liebe',
  },
  pinnacle: {
    1:'Neubeginn, Führung und Pioniergeist',2:'Kooperation und Diplomatie',
    3:'Kreative Entfaltung und Kommunikation',4:'Aufbau und Disziplin',
    5:'Freiheit, Reisen und neue Erfahrungen',6:'Familie, Verantwortung und Heilung',
    7:'Studium, Spiritualität und inneres Wachstum',8:'Karriere und materielle Errungenschaften',
    9:'Humanitäres Wirken und Abschlüsse',11:'Spirituelle Inspiration und öffentliches Wirken',
    22:'Großartige Projekte mit bleibendem Einfluss',33:'Selbstloser Dienst und spirituelle Führung',
  },
  personalYear: {
    1:'Neubeginn',2:'Beziehungen',3:'Kreativität',4:'Arbeit & Struktur',5:'Veränderung',
    6:'Familie',7:'Reflexion',8:'Karriere',9:'Abschluss',
    11:'Intuitives Jahr',22:'Großes Umsetzungsjahr',33:'Dienst am Kollektiv',
  },
  personalMonth: {
    1:'Neuer Impuls',2:'Geduld & Kooperation',3:'Ausdruck & Freude',4:'Fokus & Aufbau',
    5:'Dynamik & Wandel',6:'Familie & Fürsorge',7:'Reflexion & Rückzug',8:'Karriere & Finanzen',
    9:'Abschlüsse',11:'Intuition aktiv',22:'Großes manifestieren',33:'Dienst geben',
  },
  personalDay: {
    1:'Initiativ sein',2:'Kooperieren',3:'Kreativ sein',4:'Strukturieren',5:'Flexibel bleiben',
    6:'Fürsorge zeigen',7:'Reflektieren',8:'Ambitioniert handeln',9:'Loslassen',
    11:'Auf Intuition hören',22:'Großes angehen',33:'Mitgefühl schenken',
  },
  bridge: {
    0:'Keine Spannung — Zahlen sind in Harmonie',1:'Kleine Spannung, leicht zu überbrücken',
    2:'Moderate Spannung, etwas Integration nötig',3:'Deutliche Spannung, kreative Integration nötig',
    4:'Große Spannung, systematische Arbeit hilft',5:'Starke Spannung, Flexibilität ist der Schlüssel',
    6:'Tiefe Spannung, Selbstfürsorge öffnet den Weg',7:'Sehr tiefe Spannung, spirituelle Reflexion nötig',
    8:'Kritische Spannung, die zur Kraftquelle werden kann',9:'Maximale Spannung, vollständige Transformation möglich',
  },
  plane: {
    mental:    'Denken, Sprache, Logik — prägt intellektuelle Stärke',
    emotional: 'Gefühle, Kreativität, Fürsorge — prägt emotionale Tiefe',
    physisch:  'Materie, Struktur, Arbeit — prägt praktische Fähigkeiten',
    intuitiv:  'Spiritualität, Innenschau — prägt intuitive Wahrnehmung',
  },
};

function getExplanation(displayValue, type) {
  const map = EXPLANATIONS[type] || {};
  // String-Key zuerst versuchen (z.B. für 'plane'-Ebenen wie 'mental')
  if (typeof displayValue === 'string' && isNaN(Number(displayValue)) && map[displayValue]) {
    return map[displayValue];
  }
  const { base, master } = parseDisplayValue(displayValue);
  const bt = map[base] || '';
  const mt = master ? (map[master] || '') : '';
  if (bt && mt) return `${bt} — ${mt}`;
  return bt || mt;
}


/* ═══════════════════════════════════════════════════════════
   16. MODAL-DETAILS (Erweiterte Erklärungen)
   ═══════════════════════════════════════════════════════════ */

const MODAL_DETAILS = {
  life:{icon:'☽',title:'Lebenszahl',calc:'Alle Ziffern des vollständigen Geburtsdatums addiert und wiederholt reduziert.',extended:{1:'Du bist zum Anführer und Pionier berufen. Eigenständigkeit und das Öffnen neuer Wege sind deine wichtigsten Lernfelder.',2:'Dein Weg führt zur Meisterschaft in Kooperation und Empathie. Harmonie ist dein tiefstes Bedürfnis.',3:'Kreativität und Kommunikation stehen im Zentrum deines Lebenswegs. Du bist zum Inspirieren geboren.',4:'Disziplin, Verlässlichkeit und systematischer Aufbau zeichnen deinen Lebensweg aus.',5:'Freiheit, Wandel und Erfahrungshunger sind deine Lebensmotoren.',6:'Verantwortung, Familie und das Heilen von Disharmonie sind deine natürlichen Domänen.',7:'Als Denker und spiritueller Sucher entschlüsselst du Geheimnisse, die anderen verborgen bleiben.',8:'Du lernst, Macht und materielle Ressourcen mit Integrität zu verwalten.',9:'Mitgefühl, universelle Liebe und das Loslassen alter Muster prägen deinen Weg.',11:'Als spiritueller Kanal ist deine Intuition außergewöhnlich scharf. Du wirst zum Licht für andere.',22:'Du trägst die Fähigkeit, Visionen in handfeste Realität umzuwandeln.',33:'Selbstloser Dienst und spirituelles Lehren auf höchstem Niveau sind deine Berufung.'}},
  soul:{icon:'◈',title:'Seelenzahl',calc:'Nur die Vokale (A, E, I, O, U) des vollständigen Namens nach Pythagoras addiert.',extended:{1:'Deine Seele sehnt sich nach Unabhängigkeit und dem Gefühl, etwas Eigenes zu erschaffen.',2:'Du strebst nach Harmonie, Verbundenheit und dem Gefühl, wirklich gebraucht zu werden.',3:'Kreativität und Ausdruck sind die tiefsten Impulse deiner Seele.',4:'Sicherheit, Ordnung und ein stabiles Fundament sind die geheimen Wünsche deiner Seele.',5:'Deine Seele hungert nach Freiheit, neuen Erfahrungen und dem Durchbrechen von Grenzen.',6:'Du sehnst dich nach Liebe, Geborgenheit und dem Gefühl, wirklich für andere da zu sein.',7:'Deine Seele sucht nach tieferem Wissen, spiritueller Wahrheit und innerem Frieden.',8:'Stärke, Einfluss und materielle Sicherheit sind die heimlichen Treiber deiner Seele.',9:'Deine Seele trägt ein tiefes Mitgefühl und den Wunsch, zur Heilung der Welt beizutragen.',11:'Deine Seele ist außergewöhnlich feinfühlig und sucht spirituelle Tiefe in allem.',22:'Du trägst eine visionäre Kraft in dir, die nach Manifestation im Großen verlangt.',33:'Selbstloser Dienst am Kollektiv ist der tiefste Ruf deiner Seele.'}},
  expression:{icon:'✦',title:'Ausdruckszahl',calc:'Alle Buchstaben des vollständigen Namens (Vokale + Konsonanten) nach Pythagoras addiert.',extended:{1:'Du drückst dich direkt, klar und führend aus.',2:'Dein Ausdruck ist diplomatisch, feinfühlig und kooperativ.',3:'Kommunikation ist deine Superkraft — du drückst dich kreativ und inspirierend aus.',4:'Du vermittelst Verlässlichkeit. Dein Ausdruck ist präzise und strukturiert.',5:'Vielseitigkeit und Anpassungsfähigkeit prägen deinen Ausdruck.',6:'Dein Ausdruck strahlt Verantwortungsgefühl und Wärme aus.',7:'Analytisch, tiefsinnig und reserviert — du wirkst nachdenklich auf andere.',8:'Dein Auftreten ist selbstsicher und überzeugend. Du inspirierst Respekt.',9:'Du wirkst mitfühlend, großzügig und weise.',11:'Deine Präsenz ist elektrisierend. Du inspirierst andere allein durch dein Dasein.',22:'Du bist ein Umsetzer großen Maßstabs.',33:'Dein Ausdruck heilt und tröstet. Du wirkst wie ein spiritueller Anker.'}},
  personality:{icon:'◉',title:'Persönlichkeitszahl',calc:'Nur die Konsonanten des vollständigen Namens nach Pythagoras addiert.',extended:{1:'Auf den ersten Blick wirkst du unabhängig, selbstsicher und zielstrebig.',2:'Du machst einen sanften, freundlichen und zugänglichen ersten Eindruck.',3:'Offen, witzig und kommunikativ — so erlebst dich die Welt beim ersten Kontakt.',4:'Du vermittelst sofort Stabilität, Verlässlichkeit und Seriosität.',5:'Lebhaft, neugierig und dynamisch — du wirkst aufregend und offen.',6:'Warm, fürsorglich und verantwortungsbewusst — andere vertrauen dir sofort.',7:'Ruhig, nachdenklich und distanziert — du wirkst geheimnisvoll und tiefgründig.',8:'Stark, selbstsicher und professionell — du strahlst natürliche Autorität aus.',9:'Empathisch, weise und großzügig — du wirkst auf andere wie ein Weiser.',11:'Deine Ausstrahlung ist besonders — andere spüren intuitiv deine Tiefe.',22:'Du vermittelst sofort Stärke und Kompetenz auf höchstem Niveau.',33:'Du strahlst eine selbstlose Fürsorge aus, die sofort Vertrauen weckt.'}},
  birthday:{icon:'✧',title:'Geburtstagszahl',calc:'Der numerische Wert des Geburtstages (1–31), Masterzahlen werden bewahrt.',extended:{1:'Führungsqualitäten liegen in deiner DNA.',2:'Diplomatisches Talent ist dein Geburtsgeschenk.',3:'Kreativität und Kommunikation sind deine natürlichen Talente.',4:'Praktisches Denken und Verlässlichkeit sind deine angeborenen Stärken.',5:'Abenteuerlust und Anpassungsfähigkeit wurden dir in die Wiege gelegt.',6:'Fürsorge und Verantwortungsgefühl sind von Natur aus in dir verankert.',7:'Analytisches Denken und spirituelle Neugier prägen dich von Geburt an.',8:'Management-Talent und organisatorisches Geschick sind deine Mitgift.',9:'Humanitäres Empfinden und große Herzenswärme begleiten dich.',11:'Spirituelle Sensibilität und Inspiration sind deine angeborenen Gaben.',22:'Visionskraft und Manifestationspotential sind dein Startkapital.'}},
  maturity:{icon:'⊕',title:'Reifezahl',calc:'Reduzierte Lebenszahl + reduzierte Ausdruckszahl, dann erneut reduziert.',extended:{1:'Im zweiten Lebensabschnitt wirst du zunehmend selbstständiger.',2:'Reife bringt tiefere Fähigkeit zur echten Kooperation.',3:'Im Alter entfaltet sich deine Kreativität noch stärker.',4:'Reife zeigt sich durch meisterhafte Strukturierung.',5:'Weise Freiheit statt jugendlicher Rastlosigkeit.',6:'Im Alter wirst du ein echter Pfeiler für Familie und Gemeinschaft.',7:'Tiefe spirituelle Weisheit kennzeichnet deine Reife.',8:'Großes Wirken in Karriere und Gesellschaft sind dein reifes Thema.',9:'Du wirst im Alter zum weisen Vollender mit großer Weitsicht.',11:'Spirituelle Reife und intuitives Führen prägen deine zweite Lebenshälfte.',22:'Im Alter kannst du Großes manifestieren.',33:'Deine Reife zeigt sich im selbstlosen Dienen.'}},
  karmic:{icon:'⚖',title:'Karmische Lektion',calc:'Zahlen 1–9 die im vollständigen Namen gar nicht vorkommen.',extended:{1:'Du hast wenig Erfahrung mit Eigeninitiative. Dieses Leben ruft dich, eigenständig zu handeln.',2:'Partnerschaft und echte Kooperation sind deine große Lektion.',3:'Kreatives Ausdrücken fällt dir nicht leicht — das ist dein Wachstumsfeld.',4:'Disziplin und systematisches Vorgehen sind in diesem Leben besonders herausfordernd.',5:'Freiheit und Veränderung annehmen, ohne sich zu verlieren.',6:'Echte Fürsorge für andere, ohne Gegenleistung zu erwarten.',7:'Innere Stille, Selbstreflexion und spirituelle Arbeit warten auf dich.',8:'Der verantwortungsvolle Umgang mit Macht und Ressourcen ist dein Thema.',9:'Loslassen, vergeben und das Große Ganze sehen.'}},
  karmicDebt:{icon:'⚠',title:'Karmische Schuld',calc:'Entsteht wenn eine Rohsumme vor der Reduktion 13, 14, 16 oder 19 durchläuft.',extended:{13:'Die 13 weist auf vergangene Neigung zur Faulheit hin. Lektion: Fleiß, Ausdauer und Verantwortung tragen.',14:'Die 14 zeigt Missbrauch von Freiheit in früheren Lebenszyklen. Lektion: Selbstdisziplin und Verantwortungsbewusstsein.',16:'Die 16 steht für Ego-Inflation und Liebesverrat. Lektion: Demut, Ehrlichkeit und spirituelle Transformation.',19:'Die 19 zeigt Machtmissbrauch auf Kosten anderer. Lektion: Echte Unabhängigkeit durch Eigenverantwortung.'}},
  balance:{icon:'⊗',title:'Balancezahl',calc:'Pythagoreanische Werte aller Namensinitiale addiert und reduziert.',extended:{1:'In Krisenzeiten brauchst du Eigenständigkeit — verlasse dich auf dich selbst.',2:'Diplomatie und Ruhe sind dein bestes Werkzeug in schwierigen Situationen.',3:'Kommuniziere klar und direkt, wenn Dinge aus dem Gleichgewicht geraten.',4:'Ordnung und Struktur helfen dir, Balance wiederzufinden.',5:'Anpassungsfähigkeit ist deine Balancestrategie — flow statt kämpfen.',6:'Verantwortung für andere übernehmen bringt dich in dein Gleichgewicht zurück.',7:'Rückzug und innere Stille sind dein Weg zurück zur Balance.',8:'Selbstkontrolle und strategisches Denken helfen dir in Krisenzeiten.',9:'Mitgefühl — für andere und dich selbst — stellt deine Balance wieder her.'}},
  subconscious:{icon:'◎',title:'Unterbewusstsein',calc:'9 minus Anzahl der fehlenden Zahlen (1–9) im Namen. Zeigt innere Stabilität.',extended:{1:'Extremes Unbehagen bei Unbekanntem. Du reagierst auf Druck mit Rückzug.',2:'Entscheidungen unter Druck fallen dir schwer.',3:'Wenn du gestresst bist, reagierst du impulsiv statt durchdacht.',4:'Du brauchst klare Regeln, um in Krisenzeiten stabil zu bleiben.',5:'Du passt dich erstaunlich schnell an neue und schwierige Situationen an.',6:'In Krisenmomenten zeigt sich deine Stärke als verlässliche Stütze.',7:'Kalt und analytisch in Notlagen — du schaltest Emotionen aus und denkst klar.',8:'Stärke und Pragmatismus kennzeichnen deine Krisenreaktionen.',9:'Du bleibst in jeder Situation gelassen und reagierst weise.'}},
  rationalThought:{icon:'◫',title:'Rational Thought',calc:'Geburtstagszahl (unreduizert) + reduzierte Ausdruckszahl → reduzieren.',extended:{1:'Du denkst direkt und unabhängig. Entscheidungen triffst du intuitiv-dominant.',2:'Du wägst sorgfältig ab und berücksichtigst Gefühle anderer.',3:'Kreative Ideenflüsse prägen dein Denken mehr als reine Logik.',4:'Methodisch und systematisch — du arbeitest Probleme Schritt für Schritt durch.',5:'Flexibel und experimentell — du prüfst viele Optionen bevor du entscheidest.',6:'Du triffst Entscheidungen mit dem Herzen und dem Blick auf das Wohl aller.',7:'Tiefgründige Analyse ist deine Stärke. Du hinterfragst alles.',8:'Strategisch und ergebnisorientiert — du denkst in Lösungen.',9:'Du siehst das große Ganze und entscheidest ganzheitlich.',11:'Intuitive Blitze prägen dein Denken — du weißt oft, bevor du weißt warum.',22:'Visionär-strategisch — du verbindest große Ideen mit Machbarkeit.',33:'Empathisch und weise — dein Denken berücksichtigt das Kollektivwohl.'}},
  hiddenPassion:{icon:'★',title:'Hidden Passion',calc:'Die Zahl(en) die am häufigsten in den Buchstaben des Namens vorkommen.',extended:{1:'Verborgene Leidenschaft für Führung, Unabhängigkeit und Pionierarbeit.',2:'Verborgene Leidenschaft für Harmonie, Mitgefühl und Kooperation.',3:'Verborgene Leidenschaft für Kreativität, Ausdruck und Kommunikation.',4:'Verborgene Leidenschaft für Struktur, Ordnung und Verlässlichkeit.',5:'Verborgene Leidenschaft für Freiheit, Abenteuer und Veränderung.',6:'Verborgene Leidenschaft für Fürsorge, Heilung und Verantwortung.',7:'Verborgene Leidenschaft für Analyse, Spiritualität und Weisheit.',8:'Verborgene Leidenschaft für Macht, Erfolg und Manifestation.',9:'Verborgene Leidenschaft für Mitgefühl, Humanismus und Vollendung.'}},
  cornerstone:{icon:'◁',title:'Cornerstone',calc:'Pythagoreanischer Wert des ersten Buchstabens des Vornamens.',extended:{1:'Du gehst Dinge direkt und entschlossen an. Zögern ist nicht dein Stil.',2:'Du näherst dich neuen Situationen mit Geduld und Feingefühl.',3:'Optimismus und Kommunikation bestimmen deinen ersten Ansatz.',4:'Deine Grundhaltung ist praktisch, bodenständig und verlässlich.',5:'Neugier und Offenheit prägen, wie du dich auf Neues einlässt.',6:'Verantwortungsbewusstsein und Fürsorge bestimmen deine Grundhaltung.',7:'Du analysierst zuerst, bevor du handelst.',8:'Ambitionen und Zielorientierung prägen deinen ersten Schritt.',9:'Mitgefühl und Idealismus bestimmen deine Grundhaltung zum Leben.'}},
  capstone:{icon:'▷',title:'Capstone',calc:'Pythagoreanischer Wert des letzten Buchstabens des Nachnamens.',extended:{1:'Du schließt Dinge mit Eigeninitiative und Entschlossenheit ab.',2:'Du brauchst Einigung und Harmonie, um Dinge wirklich abzuschließen.',3:'Du schließt ab, wenn du die Essenz kreativ ausdrücken konntest.',4:'Gründlichkeit ist dir beim Abschließen wichtig.',5:'Du schließt ohne Wehmut ab und bist offen für das Nächste.',6:'Verantwortungsgefühl hilft dir, Abschlüsse zu vollziehen.',7:'Du schließt erst ab, wenn du die Lektion vollständig verstanden hast.',8:'Stärke und Entschlossenheit kennzeichnen deine Abschlüsse.',9:'Loslassen ist deine Abschlusskraft — du schließt mit Würde.'}},
  firstImpression:{icon:'◳',title:'First Impression',calc:'Anfangsbuchstaben von Vor- und Nachname addiert und reduziert.',extended:{1:'Du wirkst auf andere sofort selbstbewusst, eigenständig und führend.',2:'Dein erster Eindruck ist sanft, zugänglich und einfühlsam.',3:'Du wirkst charmant, kommunikativ und positiv aufgeladen.',4:'Dein erster Eindruck ist solide, verlässlich und seriös.',5:'Du wirkst dynamisch, offen und voller Energie.',6:'Wärme und Vertrauenswürdigkeit prägen deinen ersten Eindruck.',7:'Du wirkst nachdenklich, tiefgründig und etwas geheimnisvoll.',8:'Dein erster Eindruck ist professionell, stark und überzeugend.',9:'Du wirkst weise, mitfühlend und weltgewandt.',11:'Du wirkst elektrisierend — andere spüren sofort etwas Besonderes.',22:'Du vermittelst sofort eine kraftvolle, visionäre Präsenz.'}},
  lifeCycle:{icon:'◷',title:'Lebenszyklus',calc:'LC1: Geburtsmonat. LC2: Geburtstag. LC3: Geburtsjahr (reduziert).',extended:{1:'Diese Lebensphase ist geprägt von Selbstfindung und Eigenständigkeit.',2:'In dieser Phase geht es um Beziehungen, Kooperation und emotionale Reife.',3:'Kreativität, Ausdruck und kommunikative Entfaltung prägen diese Phase.',4:'Struktur, Fleiß und solide Fundamente sind das Thema.',5:'Freiheit, Veränderung und das Sammeln vieler Erfahrungen bestimmen diese Phase.',6:'Verantwortung, Familie und das Schaffen von Geborgenheit prägen diese Phase.',7:'Rückzug, Studium und inneres Wachstum kennzeichnen diese Lebensphase.',8:'Ehrgeiz, Karriere und materielle Entwicklung prägen diese Lebensphase.',9:'Abschlüsse, Loslassen und universelles Mitgefühl kennzeichnen diese Phase.',11:'Spirituelle Sensibilität und außergewöhnliche Intuition prägen diese Phase.',22:'Visionskraft und das Umsetzen großer Aufgaben prägen diese Lebensphase.',33:'Dienst, Heilung und spirituelles Lehren bestimmen diese Lebensphase.'}},
  challenge:{icon:'△',title:'Herausforderungszahl',calc:'Absolute Differenz der reduzierten Tag-, Monat- und Jahreswerte des Geburtsdatums.',extended:{0:'Du hast keine spezifische Herausforderung in dieser Phase — volle Gestaltungsfreiheit.',1:'Lerne, eigenständig zu handeln ohne auf Bestätigung anderer zu warten.',2:'Überkomme Überempfindlichkeit und lerne, deinen Wert nicht von anderen abhängig zu machen.',3:'Fokussiere deine kreative Energie auf ein Ziel statt dich zu verzetteln.',4:'Ausdauer und systematisches Vorgehen sind dein größtes Wachstumsfeld.',5:'Lerne, Freiheit zu leben ohne Verantwortung zu scheuen.',6:'Fürsorge geben ohne dabei dich selbst zu verlieren.',7:'Öffne dich Vertrauen — Misstrauen ist deine größte Wachstumsbremse.',8:'Lerne den verantwortungsvollen Umgang mit Macht und materiellen Ressourcen.',9:'Das Loslassen von Menschen und Überzeugungen, die du überlebt hast.'}},
  pinnacle:{icon:'▲',title:'Höhepunktzahl',calc:'Monat+Tag, Tag+Jahr, P1+P2, Monat+Jahr jeweils reduziert.',extended:{1:'Dein Höhepunkt bringt Chancen für Neubeginn, Führung und persönliche Stärke.',2:'Partnerschaft und Kooperation bringen in dieser Phase die größten Erfolge.',3:'Kreative Entfaltung und kommunikative Fähigkeiten stehen im Vordergrund.',4:'Harte Arbeit und Aufbau zahlen sich in dieser Lebensphase aus.',5:'Freiheit und Veränderung bringen die wichtigsten Erfahrungen.',6:'Familie, Heilung und Verantwortung sind die zentralen Themen.',7:'Studium, Spiritualität und innere Arbeit prägen diesen Abschnitt.',8:'Karriere und materielle Errungenschaften sind erreichbar.',9:'Universelles Denken und humanitäres Wirken kennzeichnen diesen Abschnitt.',11:'Spirituelle Erleuchtung und öffentliches Wirken können entstehen.',22:'Du kannst in diesem Höhepunkt Großartiges erschaffen.',33:'Selbstloser Dienst und spirituelle Führung prägen diesen Höhepunkt.'}},
  personalYear:{icon:'◷',title:'Persönliches Jahr',calc:'Geburtsmonat (red.) + Geburtstag (red.) + aktuelles Jahr (red.) → reduzieren.',extended:{1:'Ein Jahr der neuen Anfänge. Jetzt säen, was du in den nächsten 9 Jahren ernten willst.',2:'Geduld, Beziehungen und Kooperation stehen im Vordergrund.',3:'Ein kreatives, kommunikatives Jahr. Ausdrücken, feiern, vernetzen.',4:'Harte Arbeit, Fundamente legen, Pläne umsetzen.',5:'Veränderung ist die Konstante. Flexibilität ist deine wichtigste Qualität.',6:'Familie, Verantwortung und Heilung von Beziehungen stehen im Zentrum.',7:'Rückzug, innere Arbeit, Studium. Ein Jahr der Vertiefung.',8:'Karriere, Finanzen und Anerkennung. Ernte das, was du gesät hast.',9:'Abschlüsse, Loslassen, Vorbereitung auf neuen 9-Jahres-Zyklus.',11:'Intensives spirituelles Jahr mit hoher Intuition.',22:'Ein Jahr, in dem große Projekte Wirklichkeit werden können.',33:'Dienst, Heilung und spirituelles Wirken stehen im Vordergrund.'}},
  personalMonth:{icon:'◑',title:'Persönlicher Monat',calc:'Persönliches Jahr (red.) + Nummer des aktuellen Monats.',extended:{1:'Neue Impulse setzen und anfangen, was du aufgeschoben hast.',2:'Geduld üben, auf andere zugehen, Beziehungen pflegen.',3:'Kreativität ausleben, kommunizieren, Freude zulassen.',4:'Fokus auf Aufgaben und Struktur.',5:'Spontan sein, Neues ausprobieren, Routine durchbrechen.',6:'Familie und Freunde priorisieren.',7:'Nach innen schauen, meditieren, lernen.',8:'Karriere und finanzielle Themen aktiv angehen.',9:'Abschließen, loslassen, Dinge beenden die nicht mehr dienen.',11:'Intuition vertrauen — ungewöhnliche Einsichten kommen.',22:'Große Pläne können jetzt wirkungsvoll umgesetzt werden.',33:'Für andere da sein, selbstlos helfen.'}},
  personalDay:{icon:'◐',title:'Persönlicher Tag',calc:'Persönlicher Monat (red.) + heutiger Tag → reduzieren.',extended:{1:'Heute: Eigeninitiative ergreifen. Anfangen statt warten.',2:'Heute: Zusammenarbeiten, zuhören, vermitteln.',3:'Heute: Kreativ sein, kommunizieren, Freude erleben.',4:'Heute: Organisieren, fokussieren, praktische Aufgaben angehen.',5:'Heute: Flexibel bleiben, Neues wagen, Routine loslassen.',6:'Heute: Fürsorge zeigen, Beziehungen pflegen, helfen.',7:'Heute: Reflektieren, lesen, nachdenken, Abstand nehmen.',8:'Heute: Ehrgeizig sein, Ziele verfolgen, Ergebnisse erzielen.',9:'Heute: Abschließen, vergeben, loslassen.',11:'Heute: Auf deinen Instinkt hören — er führt dich richtig.',22:'Heute: Große Schritte wagen, Visionen konkret machen.',33:'Heute: Für andere da sein, schenken, Mitgefühl ausdrücken.'}},
  bridge:{icon:'⟺',title:'Bridge (Brücke)',calc:'Absolute Differenz zweier Kernzahlen (reduziert) — zeigt die Spannung zwischen ihnen.',extended:{0:'Deine beiden Zahlen sind in vollständiger Harmonie — keine Integration nötig.',1:'Eine kleine Spannung, leicht zu überbrücken durch bewusste Ausrichtung.',2:'Moderate Spannung — etwas bewusste Arbeit, um beide Energien zu integrieren.',3:'Deutliche Spannung — kreative Integration dieser Energien bringt großes Wachstum.',4:'Große Spannung — systematisches Arbeiten an der Integration bringt Stabilität.',5:'Starke Spannung — Flexibilität und Offenheit helfen, die Brücke zu schlagen.',6:'Tiefe Spannung — Selbstfürsorge ist der Schlüssel zur Integration.',7:'Sehr tiefe Spannung — spirituelle Reflexion öffnet den Integrationsweg.',8:'Kritische Spannung — wird sie erkannt, ist sie eine enorme Kraftquelle.',9:'Maximale Spannung — vollständige Transformation durch Annehmen beider Pole möglich.'}},
  plane:{
    icon:'◈', title:'Ausdrucks-Ebenen',
    calc:'Jeder Buchstabe des Namens wird nach Pythagoras einer von vier Ebenen zugeordnet — Mental (1,5,9), Emotional (2,3,6), Physisch (4,8), Intuitiv (7).',
    planeData: {
      mental:    { label:'Mental',    color:'var(--life)', desc:'Logik, Sprache & intellektuelles Denken. Du lebst bevorzugt in der Welt der Ideen, Analysen und Konzepte.' },
      emotional: { label:'Emotional', color:'var(--soul)', desc:'Gefühle, Kreativität & zwischenmenschliche Tiefe. Emotionale Verbindungen und künstlerischer Ausdruck prägen dich.' },
      physical:  { label:'Physisch',  color:'var(--expr)', desc:'Materie, Struktur & praktisches Handeln. Du bist auf das Konkrete ausgerichtet und bringst Dinge in die Realität.' },
      intuitive: { label:'Intuitiv',  color:'var(--pers)', desc:'Spiritualität & innere Wahrnehmung. Deine innere Stimme und übernatürliche Empfindungen spielen eine wichtige Rolle.' },
    },
  },
  plane:{icon:'◈',title:'Ebene des Ausdrucks',calc:'Anzahl der Buchstaben im Namen die zur jeweiligen Ebene (1,5,9 / 2,3,6 / 4,8 / 7) gehören.',extended:{
    mental:    'Der Mental Plane zeigt, wie stark Logik, Sprache und rationales Denken in deiner Persönlichkeit verankert sind. Viele Buchstaben in dieser Ebene (Zahlen 1, 5, 9) deuten auf einen analytischen, kommunikativen und intellektuell geprägten Charakter hin. Du verarbeitest die Welt primär durch Ideen und Worte.',
    emotional: 'Der Emotional Plane misst, wie stark Gefühle, Kreativität und Fürsorge dein Wesen bestimmen. Buchstaben mit den Werten 2, 3 und 6 zählen hierzu. Eine hohe Anzahl bedeutet, dass du sehr empathisch bist, Beziehungen tief erlebst und kreative Ausdrucksformen brauchst, um dich wohlzufühlen.',
    physisch:  'Der Physical Plane zeigt deine Orientierung auf das Materielle, Praktische und Körperliche. Buchstaben mit den Werten 4 und 8 fallen in diese Ebene. Wer hier viele Buchstaben trägt, ist bodenständig, ausdauernd und braucht spürbare Ergebnisse. Struktur und handfeste Arbeit geben dir Sicherheit.',
    intuitiv:  'Der Intuitive Plane steht für spirituelle Wahrnehmung, Innenschau und das Gespür für das Verborgene. Nur Buchstaben mit dem Wert 7 zählen hier. Eine hohe Zahl deutet auf tiefe Introspektionsfähigkeit und spirituelles Interesse hin — du nimmst Dinge wahr, die anderen verborgen bleiben.',
  }},
};

function getModalExtended(type, displayValue) {
  const details = MODAL_DETAILS[type];
  if (!details || !details.extended) return '';
  const ext = details.extended;
  // String-Key direkt versuchen (z.B. 'mental', 'emotional', 'physisch', 'intuitiv')
  if (typeof displayValue === 'string' && isNaN(Number(displayValue)) && ext[displayValue]) {
    return ext[displayValue];
  }
  const { base, master } = parseDisplayValue(String(displayValue));
  const key = master || base;
  let text = ext[key] || ext[base] || '';
  if (master && ext[master] && ext[master] !== text) text += ' ' + ext[master];
  return text;
}


/* ═══════════════════════════════════════════════════════════
   17. DOM-HELFER
   ═══════════════════════════════════════════════════════════ */

function setResultValue(elementId, displayValue) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = displayValue;
  el.classList.remove('master');
  const { base, master } = parseDisplayValue(displayValue);
  if (MASTER_NUMBERS.has(master ?? base)) el.classList.add('master');
}

function setTileExplanation(id, displayValue, type) {
  const el = document.getElementById(id);
  if (el) el.textContent = getExplanation(displayValue, type);
}

/**
 * Erstellt eine Ergebnis-Kachel und fügt sie dem Extra-Grid hinzu.
 * Gibt das Element zurück für optionale Nachbearbeitung.
 */
function appendExtraTile(title, value, tooltip, explType, modalType, isDebt) {
  const grid = document.getElementById('extraNumbersGrid');
  if (!grid) return null;

  const tile = document.createElement('article');
  tile.className = 'result-tile';
  if (isDebt) tile.classList.add('karmic-debt-tile');
  if (modalType) {
    tile.setAttribute('data-modal-type',  modalType);
    tile.setAttribute('data-modal-value', String(value));
    tile.style.cursor = 'pointer';
  }

  const titleEl = document.createElement('div');
  titleEl.className = 'result-title';
  const span = document.createElement('span');
  span.textContent = title;
  titleEl.appendChild(span);

  if (tooltip) {
    const btn = document.createElement('button');
    btn.className = 'tooltip-btn'; btn.type = 'button';
    btn.setAttribute('data-tooltip', tooltip);
    btn.setAttribute('aria-label', 'Info zu ' + title);
    btn.textContent = 'ℹ';
    titleEl.appendChild(btn);
  }

  const valEl = document.createElement('div');
  valEl.className = 'result-value';
  valEl.textContent = String(value);
  const { base, master } = parseDisplayValue(String(value));
  if (MASTER_NUMBERS.has(master ?? base)) valEl.classList.add('master');

  const explEl = document.createElement('div');
  explEl.className = 'result-explanation';
  if (explType) explEl.textContent = getExplanation(String(value), explType);

  tile.appendChild(titleEl);
  tile.appendChild(valEl);
  tile.appendChild(explEl);
  grid.appendChild(tile);
  requestAnimationFrame(() => tile.classList.add('is-visible'));
  return tile;
}

function appendGridLabel(text) {
  const grid = document.getElementById('extraNumbersGrid');
  if (!grid) return;
  const el = document.createElement('div');
  el.className = 'grid-section-label';
  el.textContent = text;
  grid.appendChild(el);
}

/**
 * Vollbreites Visualisierungs-Tile für die vier Ausdrucks-Ebenen.
 * Ersetzt die vier einzelnen count-Tiles durch eine Balkengrafik.
 */
function appendPlanesTile(planes) {
  const grid = document.getElementById('extraNumbersGrid');
  if (!grid) return;

  const { mental, emotional, physical, intuitive } = planes;
  const total    = mental + emotional + physical + intuitive || 1;
  const maxCount = Math.max(mental, emotional, physical, intuitive);

  const entries = [
    { key:'mental',    label:'Mental',    count:mental,    color:'var(--life)', shortDesc:'Logik, Sprache & Ideen' },
    { key:'emotional', label:'Emotional', count:emotional, color:'var(--soul)', shortDesc:'Gefühle & Kreativität' },
    { key:'physical',  label:'Physisch',  count:physical,  color:'var(--expr)', shortDesc:'Materie & Struktur' },
    { key:'intuitive', label:'Intuitiv',  count:intuitive, color:'var(--pers)', shortDesc:'Spiritualität & Innenschau' },
  ];

  const dominants = entries
    .filter(e => e.count === maxCount && e.count > 0)
    .map(e => e.label);
  const dominantStr = dominants.length ? dominants.join(' & ') : 'Ausgeglichen';

  // Encode für Modal: "M,E,P,I"
  const encoded = [mental, emotional, physical, intuitive].join(',');

  const tile = document.createElement('article');
  tile.className = 'result-tile planes-tile';
  tile.setAttribute('data-modal-type',  'plane');
  tile.setAttribute('data-modal-value', encoded);
  tile.style.cursor = 'pointer';

  // Titel-Zeile
  const titleEl = document.createElement('div');
  titleEl.className = 'result-title';
  const span = document.createElement('span');
  span.textContent = 'Ausdrucks-Ebenen';
  const btn = document.createElement('button');
  btn.className = 'tooltip-btn'; btn.type = 'button';
  btn.setAttribute('data-tooltip', 'Die vier Ebenen zeigen, wie dein Name energetisch aufgeteilt ist. Klicke für die vollständige Analyse.');
  btn.setAttribute('aria-label', 'Info zu Ausdrucks-Ebenen');
  btn.textContent = 'ℹ';
  titleEl.appendChild(span);
  titleEl.appendChild(btn);

  // Balken-Container
  const barsEl = document.createElement('div');
  barsEl.className = 'planes-bars';

  entries.forEach(({ label, count, color, shortDesc }) => {
    const barW  = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
    const pct   = Math.round((count / total) * 100);
    const isDom = count === maxCount && count > 0;

    const row = document.createElement('div');
    row.className = 'plane-row' + (isDom ? ' plane-row--dominant' : '');

    row.innerHTML =
      '<div class="plane-meta">'
      +   '<span class="plane-label">' + label + '</span>'
      +   '<span class="plane-short">' + shortDesc + '</span>'
      + '</div>'
      + '<div class="plane-track">'
      +   '<div class="plane-fill" style="width:' + barW + '%;background:' + color + (isDom ? ';opacity:1' : ';opacity:0.55') + '"></div>'
      + '</div>'
      + '<span class="plane-count">' + count + '<small> (' + pct + '%)</small></span>';

    barsEl.appendChild(row);
  });

  // Dominante Ebene
  const domEl = document.createElement('div');
  domEl.className = 'planes-dominant';
  domEl.textContent = 'Dominant: ' + dominantStr + ' · Klicken für Details';

  tile.appendChild(titleEl);
  tile.appendChild(barsEl);
  tile.appendChild(domEl);
  grid.appendChild(tile);
  requestAnimationFrame(() => tile.classList.add('is-visible'));
}

function animateTiles(gridId) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.querySelectorAll('.result-tile').forEach((tile, i) => {
    tile.style.animationDelay = i * 50 + 'ms';
    requestAnimationFrame(() => tile.classList.add('is-visible'));
  });
}

function clearResults() {
  ['lifePathNumber','soulNumber','expressionNumber','personalityNumber'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = ''; el.classList.remove('master'); }
  });
  ['lifeExplanation','soulExplanation','expressionExplanation','personalityExplanation'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
  document.querySelectorAll('#resultsGrid .result-tile').forEach(t => {
    t.classList.remove('is-visible');
    t.style.animationDelay = '';
    t.removeAttribute('data-modal-type');
    t.removeAttribute('data-modal-value');
    t.style.cursor = '';
  });
  const eg = document.getElementById('extraNumbersGrid');
  if (eg) eg.innerHTML = '';
  const ra = document.getElementById('resultActions');
  if (ra) ra.hidden = true;
}


/* ═══════════════════════════════════════════════════════════
   18. MODAL
   ═══════════════════════════════════════════════════════════ */

function openModal(type, displayValue) {
  const modal   = document.getElementById('detailModal');
  const details = MODAL_DETAILS[type];
  if (!modal || !details) return;

  document.getElementById('modalIcon').textContent       = details.icon || '✦';
  document.getElementById('modalNumberType').textContent = details.title;
  document.getElementById('modalCalc').textContent       = details.calc || '';

  /* ── Sonderfall: Ebenen des Ausdrucks ── */
  if (type === 'plane') {
    const [m, em, ph, it] = (displayValue || '0,0,0,0').split(',').map(Number);
    const total = m + em + ph + it || 1;
    const maxCount = Math.max(m, em, ph, it);
    const pd = details.planeData;
    const entries = [
      { key:'mental',    count:m  },
      { key:'emotional', count:em },
      { key:'physical',  count:ph },
      { key:'intuitive', count:it },
    ];
    const dominants = entries.filter(e => e.count === maxCount && e.count > 0)
      .map(e => pd[e.key].label);
    const dominantStr = dominants.length ? dominants.join(' & ') : 'Ausgeglichen';

    document.getElementById('modalValue').textContent  = dominantStr;
    document.getElementById('modalValue').className    = 'modal-value modal-value--plane';
    document.getElementById('modalShortExpl').textContent =
      'Dominante Ausdrucksebene im Namen · ' + Math.round((maxCount / total) * 100) + '% aller Buchstaben';

    let html = '<div class="modal-planes">';
    entries.forEach(({ key, count }) => {
      const { label, color, desc } = pd[key];
      const barW = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
      const pct  = Math.round((count / total) * 100);
      const isDom = count === maxCount && count > 0;
      html += '<div class="modal-plane-row' + (isDom ? ' modal-plane-row--dom' : '') + '">'
        + '<div class="modal-plane-header">'
        +   '<span class="modal-plane-label">' + label + '</span>'
        +   '<span class="modal-plane-num">' + count + ' <small>(' + pct + '%)</small></span>'
        + '</div>'
        + '<div class="modal-plane-track">'
        +   '<div class="modal-plane-fill" style="width:' + barW + '%;background:' + color + '"></div>'
        + '</div>'
        + '<p class="modal-plane-desc">' + desc + '</p>'
        + '</div>';
    });
    html += '</div>';
    document.getElementById('modalExtended').innerHTML = html;

    modal.showModal();
    document.getElementById('modalClose').focus();
    return;
  }

  /* ── Standardfall ── */
  document.getElementById('modalValue').textContent  = displayValue;
  const { base, master } = parseDisplayValue(String(displayValue));
  document.getElementById('modalValue').className =
    'modal-value' + (MASTER_NUMBERS.has(master ?? base) ? ' master' : '');

  document.getElementById('modalShortExpl').textContent = getExplanation(String(displayValue), type);
  document.getElementById('modalExtended').textContent  = getModalExtended(type, displayValue);

  modal.showModal();
  document.getElementById('modalClose').focus();
}

function initModal() {
  const modal    = document.getElementById('detailModal');
  const closeBtn = document.getElementById('modalClose');
  if (!modal) return;
  closeBtn?.addEventListener('click', () => modal.close());
  modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });
  document.addEventListener('click', e => {
    const tile = e.target.closest('[data-modal-type]');
    if (!tile || e.target.closest('.tooltip-btn')) return;
    openModal(tile.dataset.modalType, tile.dataset.modalValue);
  });
}


/* ═══════════════════════════════════════════════════════════
   19. SHARE / PRINT / TOAST
   ═══════════════════════════════════════════════════════════ */

function updateShareURL(name, date) {
  history.replaceState(null, '', '?' + new URLSearchParams({ name, date }).toString());
}
function loadFromURL() {
  const p = new URLSearchParams(window.location.search);
  const n = p.get('name'), d = p.get('date');
  const ne = document.getElementById('name'), de = document.getElementById('birthdate');
  if (n && ne) ne.value = n;
  if (d && de) de.value = d;
  return !!(n && d);
}
async function handleShare() {
  const url = window.location.href;
  try {
    if (navigator.share) { await navigator.share({ title: 'Meine Numerologie', url }); }
    else { await navigator.clipboard.writeText(url); showToast('Link kopiert! 🔗'); }
  } catch { showToast('Link: ' + url); }
}
function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('toast--show');
  setTimeout(() => t.classList.remove('toast--show'), 2800);
}


/* ═══════════════════════════════════════════════════════════
   20. THEME TOGGLE
   ═══════════════════════════════════════════════════════════ */

function initTheme() {
  const saved = localStorage.getItem('nTheme') || 'dark';
  const btn   = document.getElementById('themeToggle');
  document.documentElement.setAttribute('data-theme', saved);
  if (btn) btn.textContent = saved === 'dark' ? '☀' : '☾';
  btn?.addEventListener('click', () => {
    const cur  = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('nTheme', next);
    btn.textContent = next === 'dark' ? '☀' : '☾';
  });
}


/* ═══════════════════════════════════════════════════════════
   21. VALIDIERUNG
   ═══════════════════════════════════════════════════════════ */

function validateName(name) {
  if (!name || !name.trim()) return { ok: false, msg: 'Bitte Name eingeben.' };
  if (!/^[A-Za-zÄÖÜäöüßẞ\s'\-]+$/.test(name)) return { ok: false, msg: "Nur Buchstaben, Leerzeichen, - und ' erlaubt." };
  if (!/[A-Za-zÄÖÜäöüßẞ]/.test(name))         return { ok: false, msg: 'Bitte einen gültigen Namen eingeben.' };
  return { ok: true, msg: '' };
}


/* ═══════════════════════════════════════════════════════════
   22. HAUPTFORM-CONTROLLER
   ═══════════════════════════════════════════════════════════ */

function initForm() {
  const form      = document.getElementById('numerologyForm');
  const nameInput = document.getElementById('name');
  const dateInput = document.getElementById('birthdate');
  const nameErrEl = document.getElementById('nameError');
  const dateErrEl = document.getElementById('dateError');
  const calcBtn   = document.getElementById('calcBtn');
  const resetBtn  = document.getElementById('resetBtn');
  if (!form || !nameInput || !dateInput) return;

  function updateFormState() {
    const ns       = validateName(nameInput.value);
    const dateOk   = isValidDate(dateInput.value.trim());
    const hasInput = dateInput.value.trim().length > 0;

    nameInput.classList.toggle('input-invalid', !ns.ok);
    nameInput.classList.toggle('input-valid',    ns.ok);
    nameErrEl.textContent = ns.ok ? '' : ns.msg;

    dateInput.classList.toggle('input-invalid', hasInput && !dateOk);
    dateInput.classList.toggle('input-valid',   dateOk);
    dateErrEl.textContent = (!dateOk && hasInput) ? 'Format: TT.MM.JJJJ (z.B. 11.12.2005)' : '';

    const valid = ns.ok && dateOk;
    if (calcBtn) calcBtn.disabled = !valid;
    return valid;
  }

  nameInput.addEventListener('input', updateFormState);
  dateInput.addEventListener('input', updateFormState);

  resetBtn?.addEventListener('click', () => {
    requestAnimationFrame(() => {
      nameErrEl.textContent = '';
      dateErrEl.textContent = '';
      nameInput.classList.remove('input-invalid', 'input-valid');
      dateInput.classList.remove('input-invalid', 'input-valid');
      if (calcBtn) calcBtn.disabled = false;
      clearResults();
      history.replaceState(null, '', window.location.pathname);
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!updateFormState()) return;

    const name = nameInput.value.trim();
    const date = dateInput.value.trim();

    /* ══ KERNZAHLEN ══ */
    const expressionSum  = calculateExpressionSum(name);
    const soulSum        = calculateSoulSum(name);
    const personalitySum = calculatePersonalitySum(name);
    const lifeSum        = calculateLifeSum(date);
    const birthdayRaw    = calculateBirthdaySum(date);

    const expressionVal  = formatValue(expressionSum);
    const soulVal        = formatValue(soulSum);
    const personalityVal = formatValue(personalitySum);
    const lifeVal        = formatValue(lifeSum);

    setResultValue('expressionNumber',  expressionVal);
    setResultValue('soulNumber',        soulVal);
    setResultValue('personalityNumber', personalityVal);
    setResultValue('lifePathNumber',    lifeVal);

    setTileExplanation('expressionExplanation',  expressionVal,  'expression');
    setTileExplanation('soulExplanation',        soulVal,        'soul');
    setTileExplanation('personalityExplanation', personalityVal, 'personality');
    setTileExplanation('lifeExplanation',        lifeVal,        'life');

    [['lifeTile','life',lifeVal],['soulTile','soul',soulVal],
     ['expressionTile','expression',expressionVal],['personalityTile','personality',personalityVal]]
    .forEach(([id, type, val]) => {
      const t = document.getElementById(id);
      if (t) { t.setAttribute('data-modal-type', type); t.setAttribute('data-modal-value', val); t.style.cursor = 'pointer'; }
    });

    animateTiles('resultsGrid');
    const eg = document.getElementById('extraNumbersGrid');
    if (eg) eg.innerHTML = '';

    /* ══ IDENTITÄT (Sekundär) ══ */
    appendGridLabel('— Identität —');
    const birthdayDisplay = formatValue(birthdayRaw);
    const maturityDisplay = formatValue(calculateMaturitySum(lifeSum, expressionSum));
    appendExtraTile('Geburtstagszahl', birthdayDisplay, 'Besondere Begabung des Geburtstages', 'birthday', 'birthday', false);
    appendExtraTile('Reifezahl',       maturityDisplay, 'Lebenszahl + Ausdruckszahl',           'maturity', 'maturity', false);

    /* ══ ZEITZYKLEN ══ */
    appendGridLabel('— Zeitzyklen —');
    const pyRaw  = getPersonalYearRawSum(date);
    const pyDisp = getPersonalYearDisplay(date);
    const pmVal  = calculatePersonalMonth(pyRaw);
    const pdVal  = calculatePersonalDay(pmVal);
    appendExtraTile('Pers. Jahr',  pyDisp,             'Geburtsmonat + Geburtstag + Jahresquersumme', 'personalYear',  'personalYear',  false);
    appendExtraTile('Pers. Monat', formatValue(pmVal), 'Pers. Jahr + aktueller Monat',                'personalMonth', 'personalMonth', false);
    appendExtraTile('Pers. Tag',   formatValue(pdVal), 'Pers. Monat + heutiger Tag',                  'personalDay',   'personalDay',   false);

    /* ══ KARMA ══ */
    appendGridLabel('— Karma —');
    const karmicLessons = calculateKarmicLessons(name);
    if (karmicLessons.length === 0) {
      appendExtraTile('Karm. Lektionen', '–', 'Keine fehlenden Zahlen im Namen', null, null, false);
    } else {
      karmicLessons.forEach(n =>
        appendExtraTile('Karm. Lektion ' + n, String(n), 'Im Namen nicht vorhandene Energie', 'karmic', 'karmic', false)
      );
    }
    const debtSources = [['Lebenszahl', lifeSum], ['Ausdruckszahl', expressionSum], ['Geburtstag', birthdayRaw]];
    const foundDebts = new Set();
    debtSources.forEach(([label, rawSum]) => {
      const debt = findKarmicDebt(rawSum);
      if (debt && !foundDebts.has(debt)) {
        foundDebts.add(debt);
        appendExtraTile('Karm. Schuld (' + label + ')', String(debt),
          EXPLANATIONS.karmicDebt[debt] || '', 'karmicDebt', 'karmicDebt', true);
      }
    });

    /* ══ HERAUSFORDERUNGEN ══ */
    appendGridLabel('— Herausforderungen —');
    const ch     = calculateChallenges(date);
    const lifePR = reduceForceSingle(lifeSum);
    appendExtraTile('Herausforderung 1', String(ch.c1), 'Erste Lebenshälfte',           'challenge', 'challenge', false);
    appendExtraTile('Herausforderung 2', String(ch.c2), 'Zweite Lebenshälfte',          'challenge', 'challenge', false);
    appendExtraTile('Herausforderung 3', String(ch.c3), 'Gesamte Lebensaufgabe',        'challenge', 'challenge', false);
    appendExtraTile('Herausforderung 4', String(ch.c4), 'Lebenslange Herausforderung',  'challenge', 'challenge', false);

    /* ══ HÖHEPUNKTE ══ */
    appendGridLabel('— Höhepunkte —');
    const pn  = calculatePinnacles(date);
    const p1e = 36 - lifePR;
    appendExtraTile('Höhepunkt 1 (bis '      + p1e + ')',           formatValue(pn.p1), 'Jugend & junges Erwachsensein', 'pinnacle', 'pinnacle', false);
    appendExtraTile('Höhepunkt 2 (' + p1e    + '–' + (p1e+9) + ')', formatValue(pn.p2), 'Junges Erwachsensein',          'pinnacle', 'pinnacle', false);
    appendExtraTile('Höhepunkt 3 (' + (p1e+9)+ '–' + (p1e+18)+')', formatValue(pn.p3), 'Mittleres Lebensalter',         'pinnacle', 'pinnacle', false);
    appendExtraTile('Höhepunkt 4 (ab '       + (p1e+18) + ')',      formatValue(pn.p4), 'Reifes Lebensalter',            'pinnacle', 'pinnacle', false);

    /* ══ LEBENSPHASEN ══ */
    appendGridLabel('— Lebensphasen —');
    const lc = calculateLifeCycles(date);
    appendExtraTile('Life Cycle 1', formatValue(lc.lc1), 'Geburtsmonat — Kindheit & Jugend',  'lifeCycle', 'lifeCycle', false);
    appendExtraTile('Life Cycle 2', formatValue(lc.lc2), 'Geburtstag — Erwachsenenphase',     'lifeCycle', 'lifeCycle', false);
    appendExtraTile('Life Cycle 3', formatValue(lc.lc3), 'Geburtsjahr — spätes Leben',        'lifeCycle', 'lifeCycle', false);

    /* ══ PSYCHOLOGIE ══ */
    appendGridLabel('— Psychologie —');
    const balanceDisplay  = formatValue(calculateBalanceSum(name));
    const subcVal         = calculateSubconscious(name);
    const rationalVal     = calculateRationalThought(date, expressionSum);
    appendExtraTile('Balancezahl',      balanceDisplay,           'Pythagoreanische Summe der Namensinitiale',  'balance',        'balance',        false);
    appendExtraTile('Unterbewusstsein', String(subcVal),          '9 − Anzahl fehlender Zahlen im Namen',       'subconscious',   'subconscious',   false);
    appendExtraTile('Rational Thought', formatValue(rationalVal), 'Geburtstagszahl + Ausdruckszahl',            'rationalThought','rationalThought',false);

    /* ══ TALENTE ══ */
    appendGridLabel('— Talente —');
    const hiddenPassion   = calculateHiddenPassion(name);
    const cornerstone     = calculateCornerstone(name);
    const capstone        = calculateCapstone(name);
    const firstImpression = calculateFirstImpression(name);
    appendExtraTile('Hidden Passion',   hiddenPassion,                  'Häufigste Zahl(en) im Namen',              'hiddenPassion',   'hiddenPassion',   false);
    appendExtraTile('Cornerstone',      String(cornerstone),            'Erster Buchstabe des Vornamens',           'cornerstone',     'cornerstone',     false);
    appendExtraTile('Capstone',         String(capstone),               'Letzter Buchstabe des Nachnamens',         'capstone',        'capstone',        false);
    appendExtraTile('First Impression', formatValue(firstImpression),   'Erste Buchstaben Vor- & Nachname addiert', 'firstImpression', 'firstImpression', false);

    /* ══ BRIDGES ══ */
    appendGridLabel('— Bridges —');
    const lpBridge = calculateLifePathBridge(lifeSum, expressionSum);
    const spBridge = calculateSoulPersonalityBridge(soulSum, personalitySum);
    appendExtraTile('Life Path Bridge',        String(lpBridge), '|Lebenszahl − Ausdruckszahl|',       'bridge', 'bridge', false);
    appendExtraTile('Soul-Personality Bridge', String(spBridge), '|Seelenzahl − Persönlichkeitszahl|', 'bridge', 'bridge', false);

    /* ══ EBENEN DES AUSDRUCKS ══ */
    appendGridLabel('— Ebenen des Ausdrucks —');
    appendPlanesTile(calculatePlanesOfExpression(name));

    /* ── Share + Aktionsbuttons ── */
    updateShareURL(name, date);
    const ra = document.getElementById('resultActions');
    if (ra) ra.hidden = false;

    /* ── Vergleich vorausfüllen ── */
    const cn1 = document.getElementById('compareName1');
    const cd1 = document.getElementById('compareDate1');
    if (cn1) cn1.value = name;
    if (cd1) cd1.value = date;
  });

  updateFormState();

  const hasURLData = loadFromURL();
  if (hasURLData) {
    updateFormState();
    setTimeout(() => { if (updateFormState()) form.dispatchEvent(new Event('submit')); }, 120);
  }
}


/* ═══════════════════════════════════════════════════════════
   23. VERGLEICHS-CONTROLLER
   ═══════════════════════════════════════════════════════════ */

function initCompare() {
  const form  = document.getElementById('compareForm');
  const resEl = document.getElementById('compareResults');
  if (!form || !resEl) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const n1 = document.getElementById('compareName1')?.value.trim();
    const d1 = document.getElementById('compareDate1')?.value.trim();
    const n2 = document.getElementById('compareName2')?.value.trim();
    const d2 = document.getElementById('compareDate2')?.value.trim();

    if (!validateName(n1).ok || !isValidDate(d1) || !validateName(n2).ok || !isValidDate(d2)) {
      resEl.innerHTML = '<p class="compare-error">Bitte alle Felder korrekt ausfüllen.</p>';
      return;
    }
    const calc = (nm, dt) => ({
      life:        reduceForceSingle(calculateLifeSum(dt)),
      soul:        reduceForceSingle(calculateSoulSum(nm)),
      expression:  reduceForceSingle(calculateExpressionSum(nm)),
      personality: reduceForceSingle(calculatePersonalitySum(nm)),
    });
    const p1 = calc(n1, d1), p2 = calc(n2, d2);
    const dims = [
      { key:'life', label:'Lebenszahl' }, { key:'soul', label:'Seelenzahl' },
      { key:'expression', label:'Ausdruckszahl' }, { key:'personality', label:'Persönlichkeit' },
    ];
    let total = 0, rows = '';
    dims.forEach(({ key, label }) => {
      const score = numberHarmony(p1[key], p2[key]);
      total += score;
      const color = score >= 80 ? 'var(--life)' : score >= 65 ? 'var(--gold)' : 'var(--soul)';
      rows += '<div class="compat-row">'
        + '<div class="compat-label">' + label + '</div>'
        + '<div class="compat-nums">' + p1[key] + ' · ' + p2[key] + '</div>'
        + '<div class="compat-bar-wrap"><div class="compat-bar" style="width:' + score + '%;background:' + color + '"></div></div>'
        + '<div class="compat-pct">' + score + '%</div>'
        + '</div>';
    });
    const overall = Math.round(total / dims.length);
    const emoji   = overall >= 80 ? '✦' : overall >= 65 ? '◈' : '◉';
    const lbl     = overall >= 80 ? 'Hohe Harmonie' : overall >= 65 ? 'Gute Basis' : 'Wachstumspotenzial';
    resEl.innerHTML = '<div class="compat-header">'
      + '<div class="compat-names">' + n1 + ' <span>✦</span> ' + n2 + '</div>'
      + '<div class="compat-overall"><span class="compat-score">' + overall + '%</span>'
      + '<span class="compat-label-big">' + emoji + ' ' + lbl + '</span></div>'
      + '</div><div class="compat-rows">' + rows + '</div>';
  });

  form.addEventListener('reset', () => { resEl.innerHTML = ''; });
}


/* ═══════════════════════════════════════════════════════════
   24. PWA SERVICE WORKER
   ═══════════════════════════════════════════════════════════ */

function registerSW() { /* SW deaktiviert — verhindert Cache-Probleme auf Neocities */ }


/* ═══════════════════════════════════════════════════════════
   25. INIT
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initForm();
  initModal();
  initCompare();
  window.addEventListener('load', registerSW);
  document.getElementById('printBtn')?.addEventListener('click', () => window.print());
  document.getElementById('shareBtn')?.addEventListener('click', handleShare);
});
