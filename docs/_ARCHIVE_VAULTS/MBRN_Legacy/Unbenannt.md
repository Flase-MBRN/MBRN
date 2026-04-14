/**
 * numerology.js — v4.0
 * Fokus: Produkt-UX, progressive disclosure, Share-Asset, Loading, Mobile-first.
 * Berechnungslogik bleibt kompatibel zu v3.0.
 */
'use strict';

const PYTHAGORAS = {
  1: ['A','J','S'], 2: ['B','K','T'], 3: ['C','L','U'],
  4: ['D','M','V'], 5: ['E','N','W'], 6: ['F','O','X'],
  7: ['G','P','Y'], 8: ['H','Q','Z'], 9: ['I','R'],
};

const VOWELS = new Set(['A','E','I','O','U']);
const MASTER_NUMBERS = new Set([11, 22, 33]);
const KARMIC_DEBT_NUMS = new Set([13, 14, 16, 19]);

const PLANES = {
  mental: new Set([1, 5, 9]),
  emotional: new Set([2, 3, 6]),
  physical: new Set([4, 8]),
  intuitive: new Set([7]),
};

const LO_SHU_LAYOUT = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6],
];

const LOADING_STEPS = [
  'Analyse wird gelesen…',
  'Lebensweg wird verdichtet…',
  'Archetypus wird eingeordnet…',
  'Kernzahlen werden sortiert…',
  'Dein Report nimmt Form an…',
];

let lastResult = null;

function byId(id) {
  return document.getElementById(id);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function setHidden(el, hidden) {
  if (!el) return;
  el.hidden = !!hidden;
}

function setText(id, value) {
  const el = byId(id);
  if (el) el.textContent = value ?? '';
}

function shortenText(text, max = 90) {
  const s = String(text || '').trim();
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + '…';
}

function getInitials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return 'NN';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

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
  while (n > 9) {
    n = digitSum(n);
    if (MASTER_NUMBERS.has(n)) break;
  }
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

function normalizeName(name) {
  return String(name || '').toUpperCase()
    .replace(/Ä/g,'AE').replace(/Ö/g,'OE')
    .replace(/Ü/g,'UE').replace(/ß/g,'SS');
}

function charToNumber(char) {
  for (const [num, chars] of Object.entries(PYTHAGORAS)) {
    if (chars.includes(char)) return parseInt(num, 10);
  }
  return 0;
}

function nameToNumbers(name) {
  return normalizeName(name).replace(/\s+/g,'').split('')
    .map(ch => charToNumber(ch)).filter(n => n > 0);
}

function isYVowel(chars, index) {
  if (chars[index] !== 'Y') return false;
  const prev = index > 0 ? chars[index - 1] : null;
  const next = index < chars.length - 1 ? chars[index + 1] : null;
  const isV = c => c && VOWELS.has(c);
  if (!prev) return !isV(next);
  if (!next) return !isV(prev);
  return !isV(prev) && !isV(next);
}

/* ═══════════════════════════════════════════════════════════
   KERN-BERECHNUNGEN
   ═══════════════════════════════════════════════════════════ */

function calculateLifeSum(date) {
  return String(date || '').replace(/\D/g,'').split('').reduce((s,d) => s + parseInt(d,10), 0);
}

function calculateLifePathComponent(date) {
  const [dStr, mStr, yStr] = String(date || '').split('.');
  const day   = reducePreserveMaster(parseInt(dStr, 10));
  const month = reducePreserveMaster(parseInt(mStr, 10));
  const year  = reducePreserveMaster(digitSum(parseInt(yStr, 10)));
  return reducePreserveMaster(day + month + year);
}

function formatLifePathComponent(date) {
  const raw = calculateLifePathComponent(date);
  const base = reduceForceSingle(raw);
  if (MASTER_NUMBERS.has(raw) && raw !== base) return `${base}/${raw}`;
  return String(raw);
}

function lifePathComponentDetails(date) {
  const [dStr, mStr, yStr] = String(date || '').split('.');
  const day   = reducePreserveMaster(parseInt(dStr, 10));
  const month = reducePreserveMaster(parseInt(mStr, 10));
  const yearD = digitSum(parseInt(yStr, 10));
  const year  = reducePreserveMaster(yearD);
  const sum   = day + month + year;
  return `Tag ${dStr}→${day}  +  Monat ${mStr}→${month}  +  Jahr ${yStr}→${yearD}→${year}  =  ${sum}→${formatLifePathComponent(date)}`;
}

function calculateExpressionSum(name) {
  return nameToNumbers(name).reduce((s,n) => s + n, 0);
}

function calculateSoulSum(name) {
  const chars = normalizeName(name).replace(/\s+/g,'').split('');
  return chars.reduce((sum, ch, i) => {
    if (VOWELS.has(ch) || (ch === 'Y' && isYVowel(chars, i))) {
      return sum + charToNumber(ch);
    }
    return sum;
  }, 0);
}

function calculatePersonalitySum(name) {
  const chars = normalizeName(name).replace(/\s+/g,'').split('');
  return chars.reduce((sum, ch, i) => {
    const isVowelHere = VOWELS.has(ch) || (ch === 'Y' && isYVowel(chars, i));
    if (!isVowelHere && charToNumber(ch) > 0) return sum + charToNumber(ch);
    return sum;
  }, 0);
}

function calculateBirthdaySum(date) {
  return parseInt(String(date || '').split('.')[0], 10);
}

function calculateMaturitySum(lifeVal, expressionSum) {
  return reduceForceSingle(lifeVal) + reduceForceSingle(expressionSum);
}

function calculateLoShu(date) {
  const [dStr, mStr, yStr] = String(date || '').split('.');
  const allDigits = (dStr + mStr + yStr).split('');
  const freq = {};
  for (let i = 1; i <= 9; i++) freq[i] = 0;
  allDigits.forEach(ch => {
    const d = parseInt(ch, 10);
    if (d >= 1 && d <= 9) freq[d]++;
  });
  return freq;
}

function loShuLines(freq) {
  const lines = {
    rows: [
      { nums: [4,9,2], label: 'Reihe 1 (4–9–2)' },
      { nums: [3,5,7], label: 'Reihe 2 (3–5–7)' },
      { nums: [8,1,6], label: 'Reihe 3 (8–1–6)' },
    ],
    cols: [
      { nums: [4,3,8], label: 'Spalte 1 (4–3–8)' },
      { nums: [9,5,1], label: 'Spalte 2 (9–5–1)' },
      { nums: [2,7,6], label: 'Spalte 3 (2–7–6)' },
    ],
    diags: [
      { nums: [4,5,6], label: 'Diagonale ↘ (4–5–6)' },
      { nums: [2,5,8], label: 'Diagonale ↙ (2–5–8)' },
    ],
  };
  const active = [];
  [...lines.rows, ...lines.cols, ...lines.diags].forEach(line => {
    if (line.nums.every(n => freq[n] > 0)) active.push(line.label);
  });
  return active;
}

function calculateQuantumScore(name, date) {
  const lifeVal = calculateLifePathComponent(date);
  const soulVal = reduceForceSingle(calculateSoulSum(name));
  const exprVal = reduceForceSingle(calculateExpressionSum(name));
  const lifeN = MASTER_NUMBERS.has(lifeVal) ? lifeVal : reduceForceSingle(lifeVal);
  const score = ((lifeN + soulVal + exprVal) / (3 * 33)) * 100;
  return Math.round(score * 10) / 10;
}

function interpretQuantumScore(result) {
  const score = Number(result?.score ?? 0);
  const variance = Number(result?.variance ?? 0);
  const spread = Number(result?.spread ?? 0);

  if (score >= 80) {
    return 'Deine Kernzahlen sind stark im Einklang. Du wirkst klar, stabil und zielgerichtet.';
  }

  if (score >= 60) {
    return variance <= 4
      ? 'Du hast eine gute innere Balance. Kleinere Spannungen sind da, aber sie halten dich nicht aus der Spur.'
      : 'Du hast eine gute Basis, aber einzelne Bereiche ziehen noch in unterschiedliche Richtungen.';
  }

  if (score >= 40) {
    return spread >= 5
      ? 'Zwischen deinen inneren und äußeren Anteilen besteht spürbare Reibung. Genau dort liegt aber auch dein Wachstum.'
      : 'Du bist nicht unausgeglichen, aber noch nicht ganz im Fluss. Da ist Entwicklung drin.';
  }

  return 'Deine Zahlen zeigen starke Gegensätze. Das kann fordernd sein, bringt aber auch enormes Entwicklungspotenzial.';
}

function getQuantumTone(score) {
  const s = Number(score ?? 0);
  if (s >= 80) return 'peak';
  if (s >= 60) return 'high';
  if (s >= 40) return 'mid';
  return 'low';
}

/* ═══════════════════════════════════════════════════════════
   KARMA / PSYCHOLOGIE / TALENTE / ZEITZYKLEN / BRIDGES
   ═══════════════════════════════════════════════════════════ */

function calculateKarmicLessons(name) {
  const present = new Set(nameToNumbers(name));
  return [1,2,3,4,5,6,7,8,9].filter(n => !present.has(n));
}

function calculateBalanceSum(name) {
  return normalizeName(name).split(' ').filter(p => p.length > 0)
    .reduce((s,p) => s + charToNumber(p[0]), 0);
}

function calculateSubconscious(name) {
  return 9 - calculateKarmicLessons(name).length;
}

function calculateRationalThought(date, expressionSum) {
  const birthday   = calculateBirthdaySum(date);
  const expression = reduceForceSingle(expressionSum);
  return reducePreserveMaster(birthday + expression);
}

function calculateHiddenPassion(name) {
  const nums = nameToNumbers(name);
  const counts = {};
  nums.forEach(n => { counts[n] = (counts[n] || 0) + 1; });
  const max = Math.max(...Object.values(counts));
  const winners = Object.keys(counts).filter(k => counts[k] === max).map(Number).sort((a,b) => a - b);
  return winners.join('/');
}

function calculateCornerstone(name) {
  const first = normalizeName(name).trim().split('')[0];
  return charToNumber(first);
}

function calculateCapstone(name) {
  const parts = normalizeName(name).trim().split(' ').filter(p => p.length > 0);
  const last = parts[parts.length - 1];
  return charToNumber(last[last.length - 1]);
}

function calculateFirstImpression(name) {
  const parts = normalizeName(name).trim().split(' ').filter(p => p.length > 0);
  const first = charToNumber(parts[0][0]);
  const last  = parts.length > 1 ? charToNumber(parts[parts.length - 1][0]) : 0;
  return reducePreserveMaster(first + last);
}

function calculatePlanesOfExpression(name) {
  const nums = nameToNumbers(name);
  const r = { mental: 0, emotional: 0, physical: 0, intuitive: 0 };
  nums.forEach(n => {
    if (PLANES.mental.has(n)) r.mental++;
    if (PLANES.emotional.has(n)) r.emotional++;
    if (PLANES.physical.has(n)) r.physical++;
    if (PLANES.intuitive.has(n)) r.intuitive++;
  });
  return r;
}

function calculateLifeCycles(date) {
  const [dStr, mStr, yStr] = String(date || '').split('.');
  return {
    lc1: reducePreserveMaster(parseInt(mStr, 10)),
    lc2: reducePreserveMaster(parseInt(dStr, 10)),
    lc3: reducePreserveMaster(reduceForceSingle(digitSum(parseInt(yStr, 10)))),
  };
}

function calculateChallenges(date) {
  const [dStr, mStr, yStr] = String(date || '').split('.');
  const day   = reduceForceSingle(parseInt(dStr, 10));
  const month = reduceForceSingle(parseInt(mStr, 10));
  const year  = reduceForceSingle(digitSum(parseInt(yStr, 10)));
  return {
    c1: reduceForceSingle(Math.abs(month - day)),
    c2: reduceForceSingle(Math.abs(year - day)),
    c3: reduceForceSingle(Math.abs(reduceForceSingle(Math.abs(month - day)) - reduceForceSingle(Math.abs(year - day)))),
    c4: reduceForceSingle(Math.abs(month - year)),
  };
}

function calculatePinnacles(date) {
  const [dStr, mStr, yStr] = String(date || '').split('.');
  const day   = reduceForceSingle(parseInt(dStr, 10));
  const month = reduceForceSingle(parseInt(mStr, 10));
  const year  = reduceForceSingle(digitSum(parseInt(yStr, 10)));
  return {
    p1: reducePreserveMaster(month + day),
    p2: reducePreserveMaster(day + year),
    p3: reducePreserveMaster(
      reduceForceSingle(reducePreserveMaster(month + day)) +
      reduceForceSingle(reducePreserveMaster(day + year))
    ),
    p4: reducePreserveMaster(month + year),
  };
}

function getPersonalYearRawSum(date) {
  const [dStr, mStr] = String(date || '').split('.');
  const day = reduceForceSingle(parseInt(dStr, 10));
  const month = reduceForceSingle(parseInt(mStr, 10));
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

function calculateLifePathBridge(lifeRaw, expressionSum) {
  const lifeReduced = reduceForceSingle(lifeRaw);
  return reduceForceSingle(Math.abs(lifeReduced - reduceForceSingle(expressionSum)));
}

function calculateSoulPersonalityBridge(soulSum, personalitySum) {
  return reduceForceSingle(Math.abs(reduceForceSingle(soulSum) - reduceForceSingle(personalitySum)));
}

function numberHarmony(a, b) {
  a = a > 9 ? reduceForceSingle(a) : a;
  b = b > 9 ? reduceForceSingle(b) : b;
  if (a === b) return 88;
  const key = [a, b].sort((x,y) => x - y).join('-');
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

function isLeapYear(y) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

function isValidDate(dateStr) {
  if (!/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) return false;
  const [day, month, year] = dateStr.split('.').map(Number);
  if (month < 1 || month > 12) return false;
  if (year < 1900 || year > 2099) return false;
  const dim = [31, isLeapYear(year)?29:28, 31,30,31,30,31,31,30,31,30,31];
  return day >= 1 && day <= dim[month - 1];
}

/* ═══════════════════════════════════════════════════════════
   TEXTE / ARCHETYPEN / MODALS
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
    1:'Leidenschaft: Führung & Pioniergeist',2:'Leidenschaft: Diplomatie & Mitgefühl',
    3:'Leidenschaft: Kreativität & Kommunikation',4:'Leidenschaft: Struktur & Verlässlichkeit',
    5:'Leidenschaft: Freiheit & Abenteuer',6:'Leidenschaft: Fürsorge & Heilung',
    7:'Leidenschaft: Analyse & Spiritualität',8:'Leidenschaft: Management & Macht',
    9:'Leidenschaft: Mitgefühl & Weisheit',
  },
  cornerstone: {
    1:'Direkt, entschlossen, mutig',2:'Geduldig, kooperativ',3:'Optimistisch, kommunikativ',
    4:'Praktisch, verlässlich',5:'Neugierig, offen',6:'Fürsorglich, verantwortungsvoll',
    7:'Analytisch, nachdenklich',8:'Ehrgeizig, zielorientiert',9:'Mitfühlend, idealistisch',
  },
  capstone: {
    1:'Schließt eigenständig ab',2:'Schließt durch Kompromiss ab',3:'Schließt kreativ ab',
    4:'Schließt gründlich ab',5:'Schließt ohne Wehmut ab',
    6:'Schließt mit Verantwortungsgefühl ab',7:'Schließt nach Reflexion ab',
    8:'Schließt mit Entschlossenheit ab',9:'Schließt mit Loslassen ab',
  },
  firstImpression: {
    1:'Wirkt selbstbewusst und führend',2:'Wirkt sanft und zugänglich',3:'Wirkt charmant und kommunikativ',
    4:'Wirkt solide und verlässlich',5:'Wirkt dynamisch und offen',6:'Wirkt warm und vertrauenswürdig',
    7:'Wirkt nachdenklich und tiefgründig',8:'Wirkt professionell und stark',9:'Wirkt weise und empathisch',
    11:'Wirkt inspirierend und besonders',22:'Wirkt visionär und kraftvoll',
  },
  lifeCycle: {
    1:'Prägung durch Selbstfindung',2:'Prägung durch Beziehungen',
    3:'Prägung durch Kreativität',4:'Prägung durch harte Arbeit',
    5:'Prägung durch Freiheit',6:'Prägung durch Verantwortung',
    7:'Prägung durch inneres Wachstum',8:'Prägung durch Ehrgeiz',
    9:'Prägung durch Abschlüsse',11:'Prägung durch Spiritualität',
    22:'Prägung durch Visionskraft',33:'Prägung durch spirituelles Lehren',
  },
  challenge: {
    0:'Keine Herausforderung — volle Gestaltungsfreiheit',1:'Entwickle Selbstvertrauen',
    2:'Überkomme Überempfindlichkeit',3:'Fokussiere deine Kreativität',
    4:'Baue Ausdauer und Disziplin auf',5:'Freiheit ohne Verantwortungslosigkeit',
    6:'Fürsorge ohne Selbstverlust',7:'Öffne dich — Misstrauen hemmt Wachstum',
    8:'Handle mit Macht verantwortungsvoll',9:'Lerne Loslassen',
  },
  pinnacle: {
    1:'Neubeginn, Führung und Pioniergeist',2:'Kooperation und Diplomatie',
    3:'Kreative Entfaltung und Kommunikation',4:'Aufbau und Disziplin',
    5:'Freiheit, Reisen und neue Erfahrungen',6:'Familie, Verantwortung und Heilung',
    7:'Studium, Spiritualität und Wachstum',8:'Karriere und Errungenschaften',
    9:'Humanitäres Wirken und Abschlüsse',11:'Spirituelle Inspiration',
    22:'Großartige Projekte',33:'Selbstloser Dienst',
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
    0:'Keine Spannung — Zahlen in Harmonie',1:'Kleine Spannung, leicht zu überbrücken',
    2:'Moderate Spannung',3:'Deutliche Spannung — kreative Integration nötig',
    4:'Große Spannung — systematische Arbeit hilft',5:'Starke Spannung — Flexibilität ist Schlüssel',
    6:'Tiefe Spannung — Selbstfürsorge öffnet den Weg',7:'Sehr tiefe Spannung — Reflexion nötig',
    8:'Kritische Spannung — kann zur Kraftquelle werden',9:'Maximale Spannung — Transformation möglich',
  },
  quantum: {
    low: 'Energetisch noch im Aufbau — hohes Wachstumspotenzial',
    mid: 'Ausgewogene Schwingungsfrequenz — solide Basis',
    high: 'Hohe Kohärenz zwischen Lebensweg, Seele und Ausdruck',
    peak: 'Außergewöhnliche Resonanz — seltene energetische Harmonie',
  },
};

function getExplanation(displayValue, type) {
  const map = EXPLANATIONS[type] || {};
  if (typeof displayValue === 'string' && isNaN(Number(displayValue)) && map[displayValue]) {
    return map[displayValue];
  }
  const { base, master } = parseDisplayValue(displayValue);
  const bt = map[base] || '';
  const mt = master ? (map[master] || '') : '';
  if (bt && mt) return `${bt} — ${mt}`;
  return bt || mt;
}

const ARCHETYPES = {
  life: {
    1:  { title:'Der Pionier',     teaser:'Du bahnst neue Wege, wo andere zweifeln. Führung und Eigenständigkeit sind dein Lebensthema.', badge:null },
    2:  { title:'Der Diplomat',    teaser:'Du verbindest Menschen. Deine Stärke liegt im Zuhören, Vermitteln und im feinen Gespür für andere.', badge:null },
    3:  { title:'Der Kreative',    teaser:'Du inspirierst durch Ausdruck. Kreativität und Kommunikation sind der Kern deines Lebenswegs.', badge:null },
    4:  { title:'Der Baumeister',  teaser:'Du erschaffst Dauerhaftes. Struktur, Beständigkeit und verlässliche Systeme sind dein Fundament.', badge:null },
    5:  { title:'Der Abenteurer',  teaser:'Du lebst für das Neue. Wandel ist nicht Störung — er ist dein natürlicher Zustand.', badge:null },
    6:  { title:'Der Heiler',      teaser:'Du trägst Verantwortung. Fürsorge, Familie und das Heilen von Disharmonie formen deinen Lebensweg.', badge:null },
    7:  { title:'Der Denker',      teaser:'Du suchst die Wahrheit, dort wo andere aufhören zu fragen. Tiefe, Analyse und Spiritualität leiten dich.', badge:null },
    8:  { title:'Der Macher',      teaser:'Du manifestierst. Macht, Erfolg und das verantwortungsvolle Gestalten materieller Realität sind dein Terrain.', badge:null },
    9:  { title:'Der Weise',       teaser:'Du gibst. Universelles Mitgefühl, Weisheit und das Loslassen alter Muster prägen deinen einzigartigen Lebensweg.', badge:null },
    11: { title:'Das Medium',      teaser:'Du empfängst, was anderen verborgen bleibt. Intuition auf höchstem Niveau — ein spiritueller Kanal.', badge:'✦ Masterzahl' },
    22: { title:'Der Visionär',    teaser:'Du baust die Welt von morgen. Wenige tragen dieses seltene Potential zur großen Manifestation in sich.', badge:'✦ Masterzahl' },
    33: { title:'Der Lehrmeister', teaser:'Du dienst dem Ganzen. Die seltenste und tiefste aller Zahlen — spirituelles Lehren auf höchstem Niveau.', badge:'✦ Masterzahl · Selten' },
  },
  expression: {
    1:{title:'Der Leader'},2:{title:'Der Vermittler'},3:{title:'Der Kommunikator'},
    4:{title:'Der Stratege'},5:{title:'Der Wandler'},6:{title:'Der Fürsorger'},
    7:{title:'Der Analytiker'},8:{title:'Der Achiever'},9:{title:'Der Humanist'},
    11:{title:'Der Inspirator'},22:{title:'Der Gestalter'},33:{title:'Der Mentor'},
  },
  soul: {
    1:{title:'Innerer Kämpfer'},2:{title:'Stille Kraft'},3:{title:'Kreative Seele'},
    4:{title:'Stabiler Kern'},5:{title:'Freier Geist'},6:{title:'Liebendes Herz'},
    7:{title:'Spiritueller Sucher'},8:{title:'Ambitions-Seele'},9:{title:'Mitgefühls-Herz'},
    11:{title:'Intuitives Medium'},22:{title:'Visionärs-Seele'},33:{title:'Heiler-Seele'},
  },
  personality: {
    1:{title:'Wirkt: selbstsicher & direkt'},2:{title:'Wirkt: sanft & einfühlsam'},
    3:{title:'Wirkt: charmant & lebendig'},4:{title:'Wirkt: verlässlich & geerdet'},
    5:{title:'Wirkt: dynamisch & offen'},6:{title:'Wirkt: warm & fürsorglich'},
    7:{title:'Wirkt: tiefgründig & mysteriös'},8:{title:'Wirkt: stark & präsent'},
    9:{title:'Wirkt: weise & großzügig'},11:{title:'Wirkt: außergewöhnlich'},
    22:{title:'Wirkt: visionär'},33:{title:'Wirkt: leuchtend'},
  },
};

function getArchetype(type, displayValue) {
  const map = ARCHETYPES[type];
  if (!map) return null;
  const { base, master } = parseDisplayValue(String(displayValue));
  const key = master || base;
  return map[key] || map[base] || null;
}

const MODAL_DETAILS = {
  life:{
    icon:'☽',title:'Lebenszahl',
    calc:'Komponenten-Methode: Tag, Monat, Jahr werden einzeln reduziert und addiert. Masterzahlen bleiben erhalten.',
    extended:{
      1:'Du bist zum Anführer und Pionier berufen. Eigenständigkeit und das Öffnen neuer Wege sind deine wichtigsten Lernfelder.',
      2:'Dein Weg führt zur Meisterschaft in Kooperation und Empathie. Harmonie ist dein tiefstes Bedürfnis.',
      3:'Kreativität und Kommunikation stehen im Zentrum deines Lebenswegs. Du bist zum Inspirieren geboren.',
      4:'Disziplin, Verlässlichkeit und systematischer Aufbau zeichnen deinen Lebensweg aus.',
      5:'Freiheit, Wandel und Erfahrungshunger sind deine Lebensmotoren.',
      6:'Verantwortung, Familie und das Heilen von Disharmonie sind deine natürlichen Domänen.',
      7:'Als Denker und spiritueller Sucher entschlüsselst du Geheimnisse, die anderen verborgen bleiben.',
      8:'Du lernst, Macht und materielle Ressourcen mit Integrität zu verwalten.',
      9:'Mitgefühl, universelle Liebe und das Loslassen alter Muster prägen deinen Weg.',
      11:'Als spiritueller Kanal ist deine Intuition außergewöhnlich scharf. Du wirst zum Licht für andere.',
      22:'Du trägst die Fähigkeit, Visionen in handfeste Realität umzuwandeln.',
      33:'Selbstloser Dienst und spirituelles Lehren auf höchstem Niveau sind deine Berufung.',
    }
  },
  soul:{
    icon:'◈',title:'Seelenzahl',
    calc:'Vokale (A, E, I, O, U) + Y als Vokal (wenn zwischen Konsonanten stehend) nach Pythagoras addiert. v3.0: Y-Vokal-Regel aktiv.',
    extended:{
      1:'Deine Seele sehnt sich nach Unabhängigkeit und dem Gefühl, etwas Eigenes zu erschaffen.',
      2:'Du strebst nach Harmonie, Verbundenheit und dem Gefühl, wirklich gebraucht zu werden.',
      3:'Kreativität und Ausdruck sind die tiefsten Impulse deiner Seele.',
      4:'Sicherheit, Ordnung und ein stabiles Fundament sind die geheimen Wünsche deiner Seele.',
      5:'Deine Seele hungert nach Freiheit, neuen Erfahrungen und dem Durchbrechen von Grenzen.',
      6:'Du sehnst dich nach Liebe, Geborgenheit und dem Gefühl, wirklich für andere da zu sein.',
      7:'Deine Seele sucht nach tieferem Wissen, spiritueller Wahrheit und innerem Frieden.',
      8:'Stärke, Einfluss und materielle Sicherheit sind die heimlichen Treiber deiner Seele.',
      9:'Deine Seele trägt ein tiefes Mitgefühl und den Wunsch, zur Heilung der Welt beizutragen.',
      11:'Deine Seele ist außergewöhnlich feinfühlig und sucht spirituelle Tiefe in allem.',
      22:'Du trägst eine visionäre Kraft in dir, die nach Manifestation im Großen verlangt.',
      33:'Selbstloser Dienst am Kollektiv ist der tiefste Ruf deiner Seele.',
    }
  },
  expression:{
    icon:'✦',title:'Ausdruckszahl',
    calc:'Alle Buchstaben des vollständigen Namens (Vokale + Konsonanten) nach Pythagoras addiert.',
    extended:{
      1:'Du drückst dich direkt, klar und führend aus.',
      2:'Dein Ausdruck ist diplomatisch, feinfühlig und kooperativ.',
      3:'Kommunikation ist deine Superkraft — du drückst dich kreativ und inspirierend aus.',
      4:'Du vermittelst Verlässlichkeit. Dein Ausdruck ist präzise und strukturiert.',
      5:'Vielseitigkeit und Anpassungsfähigkeit prägen deinen Ausdruck.',
      6:'Dein Ausdruck strahlt Verantwortungsgefühl und Wärme aus.',
      7:'Analytisch, tiefsinnig und reserviert — du wirkst nachdenklich auf andere.',
      8:'Dein Auftreten ist selbstsicher und überzeugend. Du inspirierst Respekt.',
      9:'Du wirkst mitfühlend, großzügig und weise.',
      11:'Deine Präsenz ist elektrisierend. Du inspirierst andere allein durch dein Dasein.',
      22:'Du bist ein Umsetzer großen Maßstabs.',
      33:'Dein Ausdruck heilt und tröstet. Du wirkst wie ein spiritueller Anker.',
    }
  },
  personality:{
    icon:'◉',title:'Persönlichkeitszahl',
    calc:'Konsonanten des vollständigen Namens nach Pythagoras. v3.0: Y als Vokal erkannt = nicht in Persönlichkeit.',
    extended:{
      1:'Auf den ersten Blick wirkst du unabhängig, selbstsicher und zielstrebig.',
      2:'Du machst einen sanften, freundlichen und zugänglichen ersten Eindruck.',
      3:'Offen, witzig und kommunikativ — so erlebst dich die Welt beim ersten Kontakt.',
      4:'Du vermittelst sofort Stabilität, Verlässlichkeit und Seriosität.',
      5:'Lebhaft, neugierig und dynamisch — du wirkst aufregend und offen.',
      6:'Warm, fürsorglich und verantwortungsbewusst — andere vertrauen dir sofort.',
      7:'Ruhig, nachdenklich und distanziert — du wirkst geheimnisvoll und tiefgründig.',
      8:'Stark, selbstsicher und professionell — du strahlst natürliche Autorität aus.',
      9:'Empathisch, weise und großzügig — du wirkst auf andere wie ein Weiser.',
      11:'Deine Ausstrahlung ist besonders — andere spüren intuitiv deine Tiefe.',
      22:'Du vermittelst sofort Stärke und Kompetenz auf höchstem Niveau.',
      33:'Du strahlst eine selbstlose Fürsorge aus, die sofort Vertrauen weckt.',
    }
  },
  birthday:{
    icon:'✧',title:'Geburtstagszahl',
    calc:'Der numerische Wert des Geburtstages (1–31), Masterzahlen (11, 22) werden bewahrt.',
    extended:{
      1:'Führungsqualitäten liegen in deiner DNA.',2:'Diplomatisches Talent ist dein Geburtsgeschenk.',
      3:'Kreativität und Kommunikation sind deine natürlichen Talente.',4:'Praktisches Denken und Verlässlichkeit.',
      5:'Abenteuerlust und Anpassungsfähigkeit wurden dir in die Wiege gelegt.',6:'Fürsorge und Verantwortung.',
      7:'Analytisches Denken und spirituelle Neugier.',8:'Management-Talent und Organisationsgeschick.',
      9:'Humanitäres Empfinden und große Herzenswärme.',11:'Spirituelle Sensibilität.',22:'Visionskraft.',
    }
  },
  maturity:{
    icon:'⊕',title:'Reifezahl',
    calc:'Reduzierte Lebenszahl + reduzierte Ausdruckszahl, dann erneut reduziert.',
    extended:{
      1:'Im zweiten Lebensabschnitt wirst du zunehmend selbstständiger.',2:'Reife bringt tiefere Kooperation.',
      3:'Im Alter entfaltet sich deine Kreativität noch stärker.',4:'Reife zeigt sich durch meisterhafte Strukturierung.',
      5:'Weise Freiheit statt jugendlicher Rastlosigkeit.',6:'Im Alter ein echter Pfeiler für Familie und Gemeinschaft.',
      7:'Tiefe spirituelle Weisheit kennzeichnet deine Reife.',8:'Großes Wirken in Karriere und Gesellschaft.',
      9:'Du wirst zum weisen Vollender mit großer Weitsicht.',11:'Spirituelle Reife und intuitives Führen.',
      22:'Im Alter kannst du Großes manifestieren.',33:'Reife zeigt sich im selbstlosen Dienen.',
    }
  },
  karmic:{
    icon:'⚖',title:'Karmische Lektion',
    calc:'Zahlen 1–9 die im vollständigen Namen gar nicht vorkommen.',
    extended:{
      1:'Du hast wenig Erfahrung mit Eigeninitiative.',2:'Partnerschaft ist deine große Lektion.',
      3:'Kreatives Ausdrücken fällt dir nicht leicht.',4:'Disziplin ist besonders herausfordernd.',
      5:'Freiheit annehmen ohne sich zu verlieren.',6:'Echte Fürsorge ohne Gegenleistung.',
      7:'Selbstreflexion und spirituelle Arbeit warten auf dich.',8:'Verantwortungsvoller Umgang mit Macht.',
      9:'Loslassen, vergeben und das Große Ganze sehen.',
    }
  },
  karmicDebt:{
    icon:'⚠',title:'Karmische Schuld',
    calc:'Entsteht wenn eine Rohsumme vor der Reduktion 13, 14, 16 oder 19 durchläuft.',
    extended:{
      13:'Die 13 weist auf vergangene Neigung zur Faulheit hin. Lektion: Fleiß, Ausdauer und Verantwortung.',
      14:'Die 14 zeigt Missbrauch von Freiheit. Lektion: Selbstdisziplin und Verantwortungsbewusstsein.',
      16:'Die 16 steht für Ego-Inflation und Liebesverrat. Lektion: Demut und spirituelle Transformation.',
      19:'Die 19 zeigt Machtmissbrauch. Lektion: Echte Unabhängigkeit durch Eigenverantwortung.',
    }
  },
  balance:{
    icon:'⊗',title:'Balancezahl',
    calc:'Pythagoreanische Werte aller Namensinitiale addiert und reduziert.',
    extended:{
      1:'Eigenständigkeit ist dein bestes Werkzeug in schwierigen Situationen.',
      2:'Diplomatie und Ruhe helfen dir zurück ins Gleichgewicht.',
      3:'Kommuniziere klar wenn Dinge aus dem Gleichgewicht geraten.',
      4:'Ordnung und Struktur helfen dir Balance wiederzufinden.',
      5:'Anpassungsfähigkeit ist deine Balancestrategie.',
      6:'Verantwortung übernehmen bringt dich ins Gleichgewicht.',
      7:'Rückzug und innere Stille sind dein Weg zurück.',
      8:'Selbstkontrolle und Strategie helfen in Krisenzeiten.',
      9:'Mitgefühl für andere und dich selbst stellt Balance wieder her.',
    }
  },
  subconscious:{
    icon:'◎',title:'Unterbewusstsein',
    calc:'9 minus Anzahl der fehlenden Zahlen (1–9) im Namen. Zeigt innere Stabilität unter Druck.',
    extended:{
      1:'Extremes Unbehagen bei Unbekanntem.',2:'Entscheidungen unter Druck fallen schwer.',
      3:'Du reagierst impulsiv unter Stress.',4:'Du brauchst klare Regeln für Stabilität.',
      5:'Du passt dich schnell an neue Situationen an.',6:'In Krisen zeigst du verlässliche Stärke.',
      7:'Kalt und analytisch in Notlagen.',8:'Stärke und Pragmatismus kennzeichnen dich.',
      9:'Du bleibst in jeder Situation gelassen.',
    }
  },
  rationalThought:{
    icon:'◫',title:'Rational Thought',
    calc:'Geburtstagszahl (unreduizert) + reduzierte Ausdruckszahl → reduzieren.',
    extended:{
      1:'Du denkst direkt und unabhängig.',2:'Du wägst sorgfältig ab und berücksichtigst Gefühle.',
      3:'Kreative Ideenflüsse prägen dein Denken.',4:'Methodisch und systematisch.',
      5:'Flexibel und experimentell.',6:'Du entscheidest mit dem Herzen.',
      7:'Tiefgründige Analyse ist deine Stärke.',8:'Strategisch und ergebnisorientiert.',
      9:'Du siehst das große Ganze.',11:'Intuitive Blitze prägen dein Denken.',
      22:'Visionär-strategisch.',33:'Empathisch und weise.',
    }
  },
  hiddenPassion:{
    icon:'★',title:'Hidden Passion',
    calc:'Die Zahl(en) die am häufigsten in den Buchstaben des Namens vorkommen.',
    extended:{
      1:'Verborgene Leidenschaft für Führung und Pionierarbeit.',2:'Für Harmonie und Kooperation.',
      3:'Für Kreativität und Kommunikation.',4:'Für Struktur und Verlässlichkeit.',
      5:'Für Freiheit und Abenteuer.',6:'Für Fürsorge und Heilung.',
      7:'Für Analyse und Spiritualität.',8:'Für Macht und Manifestation.',
      9:'Für Mitgefühl und Humanismus.',
    }
  },
  cornerstone:{
    icon:'◁',title:'Cornerstone',
    calc:'Pythagoreanischer Wert des ersten Buchstabens des Vornamens.',
    extended:{
      1:'Du gehst Dinge direkt und entschlossen an.',2:'Du näherst dich Neuem mit Geduld.',
      3:'Optimismus bestimmt deinen ersten Ansatz.',4:'Deine Grundhaltung ist praktisch.',
      5:'Neugier und Offenheit prägen dich.',6:'Verantwortung bestimmt deine Grundhaltung.',
      7:'Du analysierst zuerst, bevor du handelst.',8:'Ambitionen prägen deinen ersten Schritt.',
      9:'Mitgefühl bestimmt deine Haltung zum Leben.',
    }
  },
  capstone:{
    icon:'▷',title:'Capstone',
    calc:'Pythagoreanischer Wert des letzten Buchstabens des Nachnamens.',
    extended:{
      1:'Du schließt mit Eigeninitiative ab.',2:'Du brauchst Harmonie für echte Abschlüsse.',
      3:'Du schließt ab wenn du kreativ ausdrücken konntest.',4:'Gründlichkeit ist dir wichtig.',
      5:'Du schließt ohne Wehmut ab.',6:'Verantwortung hilft dir Abschlüsse zu vollziehen.',
      7:'Du schließt erst ab wenn du vollständig verstanden hast.',8:'Stärke kennzeichnet deine Abschlüsse.',
      9:'Loslassen ist deine Abschlusskraft.',
    }
  },
  firstImpression:{
    icon:'◳',title:'First Impression',
    calc:'Anfangsbuchstaben von Vor- und Nachname addiert und reduziert.',
    extended:{
      1:'Du wirkst sofort selbstbewusst und führend.',2:'Dein erster Eindruck ist sanft.',
      3:'Du wirkst charmant und kommunikativ.',4:'Dein erster Eindruck ist solide.',
      5:'Du wirkst dynamisch und voller Energie.',6:'Wärme und Vertrauen prägen deinen ersten Eindruck.',
      7:'Du wirkst nachdenklich und tiefgründig.',8:'Professionell und überzeugend.',
      9:'Du wirkst weise und mitfühlend.',11:'Du wirkst elektrisierend.',22:'Du vermittelst visionäre Präsenz.',
    }
  },
  lifeCycle:{
    icon:'◷',title:'Lebenszyklus',
    calc:'LC1: Geburtsmonat (reduziert). LC2: Geburtstag (reduziert). LC3: Geburtsjahr (reduziert).',
    extended:{
      1:'Selbstfindung und Eigenständigkeit.',2:'Beziehungen und emotionale Reife.',
      3:'Kreativität und kommunikative Entfaltung.',4:'Struktur und solide Fundamente.',
      5:'Freiheit und das Sammeln vieler Erfahrungen.',6:'Verantwortung und Geborgenheit.',
      7:'Rückzug und inneres Wachstum.',8:'Ehrgeiz und materielle Entwicklung.',
      9:'Abschlüsse und universelles Mitgefühl.',11:'Spirituelle Sensibilität.',
      22:'Visionskraft und große Aufgaben.',33:'Dienst und spirituelles Lehren.',
    }
  },
  challenge:{
    icon:'△',title:'Herausforderungszahl',
    calc:'Absolute Differenz der reduzierten Tag-, Monat- und Jahreswerte.',
    extended:{
      0:'Keine spezifische Herausforderung — volle Gestaltungsfreiheit.',
      1:'Lerne eigenständig zu handeln ohne auf Bestätigung zu warten.',
      2:'Überkomme Überempfindlichkeit.',3:'Fokussiere deine kreative Energie.',
      4:'Ausdauer und Systematik sind dein Wachstumsfeld.',5:'Lerne Freiheit ohne Verantwortungslosigkeit.',
      6:'Fürsorge ohne dich selbst zu verlieren.',7:'Öffne dich Vertrauen.',
      8:'Verantwortungsvoller Umgang mit Macht.',9:'Das Loslassen von Überlebtem.',
    }
  },
  pinnacle:{
    icon:'▲',title:'Höhepunktzahl',
    calc:'Bugfix v3.0: Monat+Tag (reduziert), Tag+Jahr (reduziert) etc. — korrektere Masterzahl-Erkennung.',
    extended:{
      1:'Neubeginn, Führung und Pioniergeist.',2:'Partnerschaft bringt die größten Erfolge.',
      3:'Kreative Entfaltung im Vordergrund.',4:'Harte Arbeit zahlt sich aus.',
      5:'Freiheit bringt wichtige Erfahrungen.',6:'Familie und Heilung sind zentrale Themen.',
      7:'Studium und innere Arbeit.',8:'Karriere und Errungenschaften.',
      9:'Universelles Denken.',11:'Spirituelle Erleuchtung.',
      22:'Großartiges erschaffen.',33:'Selbstloser Dienst.',
    }
  },
  personalYear:{
    icon:'◷',title:'Persönliches Jahr',
    calc:'Geburtsmonat (red.) + Geburtstag (red.) + aktuelles Jahr (red.) → reduzieren.',
    extended:{
      1:'Ein Jahr der neuen Anfänge. Säe, was du ernten willst.',2:'Geduld und Kooperation.',
      3:'Kreativ, kommunikativ, feiern.',4:'Fundamente legen.',5:'Flexibilität ist deine Qualität.',
      6:'Familie und Heilung im Zentrum.',7:'Rückzug und innere Arbeit.',
      8:'Ernte was du gesät hast.',9:'Abschlüsse und Loslassen.',
      11:'Intensives spirituelles Jahr.',22:'Große Projekte werden Wirklichkeit.',33:'Spirituelles Wirken.',
    }
  },
  personalMonth:{
    icon:'◑',title:'Persönlicher Monat',
    calc:'Persönliches Jahr (red.) + aktuelle Monatsnummer.',
    extended:{
      1:'Neue Impulse setzen.',2:'Geduld üben, Beziehungen pflegen.',3:'Kreativität ausleben.',
      4:'Fokus auf Strukturen.',5:'Spontan sein, Neues ausprobieren.',6:'Familie priorisieren.',
      7:'Nach innen schauen.',8:'Karriere aktiv angehen.',9:'Abschließen, loslassen.',
      11:'Intuition vertrauen.',22:'Große Pläne umsetzen.',33:'Selbstlos helfen.',
    }
  },
  personalDay:{
    icon:'◐',title:'Persönlicher Tag',
    calc:'Persönlicher Monat (red.) + heutiger Tag.',
    extended:{
      1:'Heute: Anfangen statt warten.',2:'Heute: Zusammenarbeiten.',3:'Heute: Kreativ sein.',
      4:'Heute: Organisieren und fokussieren.',5:'Heute: Flexibel bleiben.',6:'Heute: Fürsorge zeigen.',
      7:'Heute: Reflektieren und lesen.',8:'Heute: Ziele verfolgen.',9:'Heute: Loslassen.',
      11:'Heute: Auf Instinkt hören.',22:'Heute: Große Schritte wagen.',33:'Heute: Mitgefühl ausdrücken.',
    }
  },
  bridge:{
    icon:'⟺',title:'Bridge (Brücke)',
    calc:'Absolute Differenz zweier Kernzahlen (reduziert) — zeigt Integrationsbedarf.',
    extended:{
      0:'Vollständige Harmonie — keine Integration nötig.',1:'Kleine Spannung, leicht zu überbrücken.',
      2:'Moderate Spannung.',3:'Deutliche Spannung — kreative Integration bringt Wachstum.',
      4:'Große Spannung — systematische Arbeit bringt Stabilität.',5:'Flexibilität schlägt die Brücke.',
      6:'Selbstfürsorge ist der Schlüssel.',7:'Spirituelle Reflexion öffnet den Weg.',
      8:'Kritische Spannung — kann zur Kraftquelle werden.',9:'Maximale Spannung — Transformation möglich.',
    }
  },
  loShu: {
    icon:'⊞',
    title:'Lo-Shu Psychomatrix',
    calc:'Wie oft jede Ziffer 1–9 im Geburtsdatum (TT MM JJJJ) vorkommt. Nullen werden ignoriert. Das magische Quadrat jeder Reihe/Spalte/Diagonale summiert sich zu 15.',
    extended: {
      missing: 'Fehlende Zahlen zeigen Bereiche, die bewusst gestärkt werden dürfen.',
      present: 'Vorhandene Zahlen zeigen natürliche Energien und angeborene Stärken.',
      repeated: 'Mehrfach vorhandene Zahlen zeigen dominante Energiefelder — Stärke und Herausforderung zugleich.',
    },
    planeData: {}
  },
  quantum: {
    icon:'⟐',
    title:'Quantum Vibrations-Score',
    calc:'(Lebenszahl + Seelenzahl + Ausdruckszahl) ÷ (3 × 33) × 100. Masterzahlen gehen mit ihrem vollen Wert ein. Zeigt die energetische Kohärenz deiner drei Kernzahlen.',
    extended: {
      range: 'Ein hoher Score zeigt starke Resonanz zwischen Lebensweg, Seele und Ausdruck. Ein niedriger Score zeigt Wachstumspotenzial und innere Spannung.',
    }
  },
  plane:{
    icon:'◈',title:'Ausdrucks-Ebenen',
    calc:'Jeder Buchstabe wird einer von vier Ebenen zugeordnet: Mental (1,5,9) · Emotional (2,3,6) · Physisch (4,8) · Intuitiv (7).',
    planeData: {
      mental:    { label:'Mental',    color:'var(--life)', desc:'Logik, Sprache & intellektuelles Denken. Du lebst bevorzugt in der Welt der Ideen, Analysen und Konzepte.' },
      emotional: { label:'Emotional', color:'var(--soul)', desc:'Gefühle, Kreativität & zwischenmenschliche Tiefe. Emotionale Verbindungen und künstlerischer Ausdruck prägen dich.' },
      physical:  { label:'Physisch',  color:'var(--expr)', desc:'Materie, Struktur & praktisches Handeln. Du bist auf das Konkrete ausgerichtet und bringst Dinge in die Realität.' },
      intuitive: { label:'Intuitiv',  color:'var(--pers)', desc:'Spiritualität & innere Wahrnehmung. Deine innere Stimme und übernatürliche Empfindungen spielen eine wichtige Rolle.' },
    },
    extended: {
      mental: 'Der Mental Plane zeigt wie stark Logik, Sprache und rationales Denken verankert sind.',
      emotional: 'Der Emotional Plane misst wie stark Gefühle und Kreativität dein Wesen bestimmen.',
      physisch: 'Der Physical Plane zeigt deine Orientierung auf das Materielle und Praktische.',
      intuitiv: 'Der Intuitive Plane steht für spirituelle Wahrnehmung und Innenschau.',
    }
  },
};

function getModalExtended(type, displayValue) {
  const details = MODAL_DETAILS[type];
  if (!details || !details.extended) return '';
  const ext = details.extended;
  if (typeof displayValue === 'string' && isNaN(Number(displayValue)) && ext[displayValue]) {
    return ext[displayValue];
  }
  const { base, master } = parseDisplayValue(String(displayValue));
  const key = master || base;
  let text = ext[key] || ext[base] || '';
  if (master && ext[master] && ext[master] !== text) text += ' ' + ext[master];
  return text;
}
function setResultValue(elementId, displayValue) {
  const el = byId(elementId);
  if (!el) return;
  el.textContent = displayValue;
  el.classList.remove('master');
  const { base, master } = parseDisplayValue(displayValue);
  if (MASTER_NUMBERS.has(master ?? base)) el.classList.add('master');
}

function setTileExplanation(id, displayValue, type) {
  const el = byId(id);
  if (el) el.textContent = getExplanation(displayValue, type);
}

function createResultTile({ title, value, tooltip, explType, modalType, isDebt = false, extraClass = '' }) {
  const tile = document.createElement('article');
  tile.className = `result-tile ${extraClass}`.trim();
  if (isDebt) tile.classList.add('karmic-debt-tile');
  if (modalType) {
    tile.setAttribute('data-modal-type', modalType);
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
    btn.className = 'tooltip-btn';
    btn.type = 'button';
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

  requestAnimationFrame(() => tile.classList.add('is-visible'));
  return tile;
}

function appendExtraTile(title, value, tooltip, explType, modalType, isDebt) {
  const grid = byId('extraNumbersGrid');
  if (!grid) return null;

  const tile = createResultTile({
    title,
    value,
    tooltip,
    explType,
    modalType,
    isDebt,
  });

  grid.appendChild(tile);
  return tile;
}

function appendGridLabel(text) {
  const grid = byId('extraNumbersGrid');
  if (!grid) return;
  const el = document.createElement('div');
  el.className = 'grid-section-label';
  el.textContent = text;
  grid.appendChild(el);
}

function appendPlanesTile(planes) {
  const grid = byId('extraNumbersGrid');
  if (!grid) return;

  const { mental, emotional, physical, intuitive } = planes;
  const total = mental + emotional + physical + intuitive || 1;
  const maxCount = Math.max(mental, emotional, physical, intuitive);
  const entries = [
    { key:'mental',    label:'Mental',    count:mental,    color:'var(--life)', shortDesc:'Logik, Sprache & Ideen' },
    { key:'emotional', label:'Emotional', count:emotional, color:'var(--soul)', shortDesc:'Gefühle & Kreativität' },
    { key:'physical',  label:'Physisch',  count:physical,  color:'var(--expr)', shortDesc:'Materie & Struktur' },
    { key:'intuitive', label:'Intuitiv',  count:intuitive, color:'var(--pers)', shortDesc:'Spiritualität & Innenschau' },
  ];
  const dominants = entries.filter(e => e.count === maxCount && e.count > 0).map(e => e.label);
  const dominantStr = dominants.length ? dominants.join(' & ') : 'Ausgeglichen';
  const encoded = [mental, emotional, physical, intuitive].join(',');

  const tile = document.createElement('article');
  tile.className = 'result-tile planes-tile';
  tile.setAttribute('data-modal-type', 'plane');
  tile.setAttribute('data-modal-value', encoded);
  tile.style.cursor = 'pointer';

  const titleEl = document.createElement('div');
  titleEl.className = 'result-title';
  const span = document.createElement('span');
  span.textContent = 'Ausdrucks-Ebenen';
  const btn = document.createElement('button');
  btn.className = 'tooltip-btn';
  btn.type = 'button';
  btn.setAttribute('data-tooltip', 'Wie dein Name energetisch aufgeteilt ist. Klicke für vollständige Analyse.');
  btn.setAttribute('aria-label', 'Info zu Ausdrucks-Ebenen');
  btn.textContent = 'ℹ';
  titleEl.appendChild(span);
  titleEl.appendChild(btn);

  const barsEl = document.createElement('div');
  barsEl.className = 'planes-bars';
  entries.forEach(({ label, count, color, shortDesc }) => {
    const barW = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
    const pct = Math.round((count / total) * 100);
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

  const domEl = document.createElement('div');
  domEl.className = 'planes-dominant';
  domEl.textContent = 'Dominant: ' + dominantStr + ' · Klicken für Details';

  tile.appendChild(titleEl);
  tile.appendChild(barsEl);
  tile.appendChild(domEl);
  grid.appendChild(tile);
  requestAnimationFrame(() => tile.classList.add('is-visible'));
}

function appendLoShuTile(date) {
  const grid = byId('extraNumbersGrid');
  if (!grid) return;

  const freq = calculateLoShu(date);
  const activeLines = loShuLines(freq);
  const encoded = Object.values(freq).join(',');

  const tile = document.createElement('article');
  tile.className = 'result-tile lo-shu-tile';
  tile.setAttribute('data-modal-type', 'loShu');
  tile.setAttribute('data-modal-value', encoded);
  tile.style.cursor = 'pointer';

  const titleEl = document.createElement('div');
  titleEl.className = 'result-title lo-shu-title';
  titleEl.innerHTML =
    '<span>Lo-Shu Psychomatrix</span>'
    + '<button class="tooltip-btn" type="button" data-tooltip="Das magische Quadrat deines Geburtsdatums. Zeigt welche Zahlen-Energien aktiv, fehlend oder dominant sind. Klicke für Details." aria-label="Info zu Lo-Shu">ℹ</button>';

  const gridEl = document.createElement('div');
  gridEl.className = 'lo-shu-grid';

  LO_SHU_LAYOUT.forEach(row => {
    row.forEach(num => {
      const count = freq[num];
      const cell = document.createElement('div');
      cell.className = 'lo-shu-cell'
        + (count === 0 ? ' lo-shu-cell--missing' : '')
        + (count >= 3 ? ' lo-shu-cell--strong' : '');
      cell.setAttribute('aria-label', `Zahl ${num}: ${count}× vorhanden`);

      const numEl = document.createElement('span');
      numEl.className = 'lo-shu-num';
      numEl.textContent = num;

      const dotsEl = document.createElement('span');
      dotsEl.className = 'lo-shu-dots';
      if (count === 0) {
        dotsEl.textContent = '–';
        dotsEl.style.opacity = '0.3';
      } else {
        dotsEl.textContent = '●'.repeat(Math.min(count, 4)) + (count > 4 ? `+${count - 4}` : '');
      }

      cell.appendChild(numEl);
      cell.appendChild(dotsEl);
      gridEl.appendChild(cell);
    });
  });

  const linesEl = document.createElement('div');
  linesEl.className = 'lo-shu-lines';
  if (activeLines.length === 0) {
    linesEl.textContent = 'Keine vollständigen Linien · Klicken für Details';
  } else {
    linesEl.textContent = `${activeLines.length} aktive Linie${activeLines.length > 1 ? 'n' : ''}: ${activeLines.join(' · ')} · Details anklicken`;
  }

  tile.appendChild(titleEl);
  tile.appendChild(gridEl);
  tile.appendChild(linesEl);
  grid.appendChild(tile);
  requestAnimationFrame(() => tile.classList.add('is-visible'));
}

function appendQuantumTile(name, date) {
  const grid = byId('extraNumbersGrid');
  if (!grid) return;

  const score = calculateQuantumScore(name, date);
  const pct = score.toFixed(1);

  let quality, color;
  if (score >= 80) { quality = 'Außergewöhnliche Resonanz'; color = 'var(--gold-bright)'; }
  else if (score >= 60) { quality = 'Hohe Kohärenz'; color = 'var(--life)'; }
  else if (score >= 40) { quality = 'Ausgewogene Energie'; color = 'var(--soul)'; }
  else { quality = 'Starkes Wachstumspotenzial'; color = 'var(--pers)'; }

  const tile = document.createElement('article');
  tile.className = 'result-tile quantum-tile';
  tile.setAttribute('data-modal-type', 'quantum');
  tile.setAttribute('data-modal-value', pct);
  tile.style.cursor = 'pointer';

  tile.innerHTML =
    '<div class="result-title">'
    + '<span>Quantum Score</span>'
    + '<button class="tooltip-btn" type="button" data-tooltip="Energetische Kohärenz von Lebenszahl, Seelenzahl und Ausdruckszahl zusammen. Klicke für Details." aria-label="Info zum Quantum Score">ℹ</button>'
    + '</div>'
    + '<div class="quantum-gauge">'
    + '<div class="quantum-bar-track">'
    + '<div class="quantum-bar-fill" style="width:' + score + '%;background:' + color + '"></div>'
    + '</div>'
    + '<div class="quantum-score-value" style="color:' + color + '">' + pct + '%</div>'
    + '</div>'
    + '<div class="result-explanation">' + quality + '</div>';

  grid.appendChild(tile);
  requestAnimationFrame(() => tile.classList.add('is-visible'));
}

function animateTiles(gridId) {
  const grid = byId(gridId);
  if (!grid) return;
  grid.querySelectorAll('.result-tile').forEach((tile, i) => {
    tile.style.animationDelay = i * 50 + 'ms';
    requestAnimationFrame(() => tile.classList.add('is-visible'));
  });
}

function clearResults() {
  ['lifePathNumber','soulNumber','expressionNumber','personalityNumber'].forEach(id => {
    const el = byId(id);
    if (el) { el.textContent = ''; el.classList.remove('master'); }
  });

  ['lifeExplanation','soulExplanation','expressionExplanation','personalityExplanation'].forEach(id => {
    const el = byId(id);
    if (el) el.textContent = '';
  });

  document.querySelectorAll('#resultsGrid .result-tile, .core-card .core-value').forEach(t => {
    t.classList.remove('is-visible');
    t.style.animationDelay = '';
    t.removeAttribute('data-modal-type');
    t.removeAttribute('data-modal-value');
    t.style.cursor = '';
  });

  const eg = byId('extraNumbersGrid');
  if (eg) eg.innerHTML = '';

  const ra = byId('resultActions');
  if (ra) ra.hidden = true;

  const shareWrap = byId('shareBarWrap');
  if (shareWrap) shareWrap.hidden = true;

  const ctaWrap = byId('ctaBarWrap');
  if (ctaWrap) ctaWrap.hidden = true;

  const loadingState = byId('loadingState');
  if (loadingState) loadingState.hidden = true;

  const resultsSection = byId('resultsSection');
  if (resultsSection) resultsSection.hidden = true;
}

function renderLegacyCoreGrid(data) {
  const grid = byId('resultsGrid');
  if (!grid) return;

  if (document.querySelector('.core-card')) return;

  grid.innerHTML = '';

  const lifeTile = createResultTile({
    title: 'Lebenszahl',
    value: data.lifeVal,
    tooltip: 'Dein Lebensweg — die wichtigste Zahl. Komponenten-Methode: Tag + Monat + Jahr einzeln reduziert.',
    explType: 'life',
    modalType: 'life',
    extraClass: 'life-number',
  });

  const soulTile = createResultTile({
    title: 'Seelenzahl',
    value: data.soulVal,
    tooltip: 'Dein innerstes Bedürfnis — Vokale + Y-Vokal-Regel.',
    explType: 'soul',
    modalType: 'soul',
    extraClass: 'soul-number',
  });

  const exprTile = createResultTile({
    title: 'Ausdruckszahl',
    value: data.expressionVal,
    tooltip: 'Dein Potential und deine Talente — alle Buchstaben des Namens.',
    explType: 'expression',
    modalType: 'expression',
    extraClass: 'expression-number',
  });

  const persTile = createResultTile({
    title: 'Persönlichkeitszahl',
    value: data.personalityVal,
    tooltip: 'Wie andere dich wahrnehmen — Konsonanten des Namens.',
    explType: 'personality',
    modalType: 'personality',
    extraClass: 'personality-number',
  });

  [lifeTile, soulTile, exprTile, persTile].forEach(tile => grid.appendChild(tile));
  animateTiles('resultsGrid');
}

function updateCoreCards(data) {
  const hasCoreCards = !!document.querySelector('.core-card');

  if (hasCoreCards) {
    setText('lifeHeroNum', data.lifeVal);
    const heroNum = byId('lifeHeroNum');
    if (heroNum) {
      heroNum.classList.toggle('master', MASTER_NUMBERS.has(parseDisplayValue(data.lifeVal).master ?? parseDisplayValue(data.lifeVal).base));
      heroNum.classList.remove('num-animate');
      void heroNum.offsetWidth;
      heroNum.classList.add('num-animate');
    }

    const arch = getArchetype('life', data.lifeVal);
    const heroArch = byId('lifeHeroArchetype');
    const heroBadge = byId('lifeHeroBadge');
    const heroTeaser = byId('lifeHeroTeaser');
    if (arch) {
      if (heroArch) heroArch.textContent = arch.title;
      if (heroTeaser) heroTeaser.textContent = arch.teaser;
      if (heroBadge && arch.badge) {
        heroBadge.textContent = arch.badge;
        heroBadge.className = 'life-hero-badge' + (String(arch.badge).includes('Masterzahl') ? ' life-hero-badge--master' : '');
        heroBadge.hidden = false;
      } else if (heroBadge) {
        heroBadge.hidden = true;
      }
    }

    setResultValue('soulNumber', data.soulVal);
    setResultValue('expressionNumber', data.expressionVal);
    setResultValue('personalityNumber', data.personalityVal);

    setTileExplanation('soulExplanation', data.soulVal, 'soul');
    setTileExplanation('expressionExplanation', data.expressionVal, 'expression');
    setTileExplanation('personalityExplanation', data.personalityVal, 'personality');

    const soulArch = getArchetype('soul', data.soulVal);
    const exprArch = getArchetype('expression', data.expressionVal);
    const persArch = getArchetype('personality', data.personalityVal);

    if (soulArch) {
      const el = byId('soulTile');
      if (el) el.querySelector('.core-text')?.replaceChildren();
      const t = el?.querySelector('.core-text');
      if (t) t.textContent = soulArch.title || '';
    }
    if (exprArch) {
      const el = byId('expressionTile');
      const t = el?.querySelector('.core-text');
      if (t) t.textContent = exprArch.title || '';
    }
    if (persArch) {
      const el = byId('personalityTile');
      const t = el?.querySelector('.core-text');
      if (t) t.textContent = persArch.title || '';
    }
  }
}

function setHeroViewVisible(visible) {
  const resultsSection = byId('resultsSection');
  const resultsCard = document.querySelector('.results-card');
  const emptyEl = byId('resultsEmpty');
  const heroDisp = byId('lifeHeroDisplay');

  if (resultsSection) resultsSection.hidden = !visible;
  if (resultsCard && !resultsSection) resultsCard.hidden = false;
  if (emptyEl) emptyEl.hidden = visible;
  if (heroDisp) heroDisp.hidden = !visible;
}

function renderSharePreview(data) {
  const shareName = byId('shareName');
  const shareNumber = byId('shareNumber');
  const shareArchetype = byId('shareArchetype');
  const shareMessage = byId('shareMessage');

  if (shareName) shareName.textContent = data.name ? data.name : getInitials(data.name || '');
  if (shareNumber) shareNumber.textContent = String(data.lifeVal || '–');
  if (shareArchetype) shareArchetype.textContent = data.archTitle || 'Dein Archetyp';
  if (shareMessage) shareMessage.textContent = shortenText(data.shareMessage || data.lifeTeaser || 'Dein persönlicher Numerologie-Report.', 120);
}

function buildShareText() {
  const p = new URLSearchParams(window.location.search);
  const name = p.get('name') || lastResult?.name || '';
  const date = p.get('date') || lastResult?.date || '';
  let text = '';

  if (lastResult) {
    const { lifeVal, archTitle, lifeTeaser, soulVal, soulMeaning } = lastResult;
    text += '✦ Mein Numerologie-Report';
    if (name) text += '\nName: ' + name;
    text += '\nLebenszahl: ' + lifeVal + (archTitle ? ' – ' + archTitle : '');
    if (lifeTeaser) text += '\n' + shortenText(lifeTeaser, 90);
    if (soulVal) text += '\nSeelenzahl: ' + soulVal + (soulMeaning ? ' – ' + soulMeaning : '');
  } else if (date) {
    try {
      const lifeVal = formatLifePathComponent(date);
      const arch = getArchetype('life', lifeVal);
      const { base } = parseDisplayValue(lifeVal);
      const meaning = EXPLANATIONS.life[base] || '';
      if (arch && arch.title) {
        text += '✦ Meine Lebenszahl ist die ' + lifeVal + ' – ' + arch.title + '.';
      } else {
        text += '✦ Meine Lebenszahl ist die ' + lifeVal + (meaning ? ' – ' + meaning : '') + '.';
      }
      if (arch && arch.teaser) {
        const short = arch.teaser.length > 70 ? arch.teaser.substring(0, 67) + '...' : arch.teaser;
        text += '\n' + short;
      }
    } catch (e) {
      text += '✦ Mein Numerologie-Profil';
    }
  } else {
    text += '✦ Mein Numerologie-Profil';
  }

  text += '\n\nFinde deinen Archetypus (kostenlos, 36 Zahlen):';
  text += '\n' + window.location.origin + window.location.pathname;
  if (name && date) text += '?name=' + encodeURIComponent(name) + '&date=' + encodeURIComponent(date);
  return text;
}

function updateShareURL(name, date) {
  const params = new URLSearchParams();
  if (name) params.set('name', name);
  if (date) params.set('date', date);
  history.replaceState(null, '', '?' + params.toString());
}

function loadFromURL() {
  const p = new URLSearchParams(window.location.search);
  const n = p.get('name');
  const d = p.get('date');
  const ne = byId('name');
  const de = byId('birthdate');
  if (n && ne) ne.value = n;
  if (d && de) de.value = d;
  return !!(n && d);
}

async function handleShare() {
  const url = window.location.href;
  const text = buildShareText();
  try {
    if (navigator.share) {
      await navigator.share({ title: 'Mein Numerologie-Report', text, url });
    } else {
      await navigator.clipboard.writeText(url);
      showToast('Link kopiert! 🔗');
    }
  } catch {
    showToast('Link: ' + url);
  }
}

function showToast(msg) {
  let t = byId('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('toast--show');
  setTimeout(() => t.classList.remove('toast--show'), 2800);
}

function buildShareCanvas(data) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const w = canvas.width;
  const h = canvas.height;

  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#090916');
  bg.addColorStop(0.55, '#101022');
  bg.addColorStop(1, '#07070f');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const orb1 = ctx.createRadialGradient(w * 0.25, h * 0.18, 40, w * 0.25, h * 0.18, 360);
  orb1.addColorStop(0, 'rgba(245, 158, 11, 0.22)');
  orb1.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.fillStyle = orb1;
  ctx.fillRect(0, 0, w, h);

  const orb2 = ctx.createRadialGradient(w * 0.82, h * 0.82, 40, w * 0.82, h * 0.82, 420);
  orb2.addColorStop(0, 'rgba(124, 58, 237, 0.20)');
  orb2.addColorStop(1, 'rgba(124, 58, 237, 0)');
  ctx.fillStyle = orb2;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  for (let y = 120; y < h; y += 96) {
    ctx.beginPath();
    ctx.moveTo(80, y);
    ctx.lineTo(w - 80, y);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  for (let x = 100; x < w; x += 96) {
    ctx.beginPath();
    ctx.moveTo(x, 100);
    ctx.lineTo(x, h - 100);
    ctx.stroke();
  }

  ctx.fillStyle = '#fbbf24';
  ctx.font = '700 28px Arial, sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText('NUMEROLOGIE REPORT', 92, 110);

  ctx.fillStyle = '#ececf5';
  ctx.font = '700 54px Arial, sans-serif';
  ctx.fillText(data.name || getInitials(data.name || 'NN'), 92, 190);

  ctx.fillStyle = '#8a8ab3';
  ctx.font = '400 28px Arial, sans-serif';
  ctx.fillText('Dein persönlicher Archetyp', 92, 238);

  ctx.fillStyle = '#f59e0b';
  ctx.font = '800 220px Arial, sans-serif';
  ctx.fillText(String(data.lifeVal || '–'), 92, 490);

  ctx.fillStyle = '#ececf5';
  ctx.font = '700 54px Arial, sans-serif';
  wrapCanvasText(ctx, data.archTitle || 'Dein Archetyp', 92, 590, 900, 64);

  ctx.fillStyle = '#8a8ab3';
  ctx.font = '400 34px Arial, sans-serif';
  wrapCanvasText(ctx, shortenText(data.lifeTeaser || 'Dein persönlicher Numerologie-Report zeigt, was dich im Kern bewegt.', 150), 92, 700, 880, 46);

  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = '600 24px Arial, sans-serif';
  ctx.fillText('Lebenszahl • Seelenzahl • Ausdruck • Persönlichkeit', 92, 930);

  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = '500 20px Arial, sans-serif';
  ctx.fillText('Erstellt mit Numerologie v4.0', 92, 978);

  return canvas;
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text || '').split(/\s+/);
  let line = '';
  let yy = y;

  for (const word of words) {
    const testLine = line ? line + ' ' + word : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, yy);
      line = word;
      yy += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) ctx.fillText(line, x, yy);
}

async function downloadShareImage(data) {
  const canvas = buildShareCanvas(data);
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = `numerologie-${(data.name || 'report').toLowerCase().replace(/\s+/g, '-')}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function openModal(type, displayValue) {
  const modal = byId('detailModal') || byId('modal');
  const details = MODAL_DETAILS[type];
  if (!modal || !details) return;

  setText('modalIcon', details.icon || '✦');
  setText('modalNumberType', details.title || 'Deutung');
  setText('modalCalc', details.calc || '');

  if (type === 'plane') {
    const [m, em, ph, it] = (displayValue || '0,0,0,0').split(',').map(Number);
    const total = m + em + ph + it || 1;
    const maxCount = Math.max(m, em, ph, it);
    const pd = details.planeData;
    const entries = [
      { key:'mental', count:m },
      { key:'emotional', count:em },
      { key:'physical', count:ph },
      { key:'intuitive', count:it },
    ];
    const dominants = entries.filter(e => e.count === maxCount && e.count > 0).map(e => pd[e.key].label);
    const dominantStr = dominants.length ? dominants.join(' & ') : 'Ausgeglichen';

    setText('modalValue', dominantStr);
    const modalValue = byId('modalValue');
    if (modalValue) modalValue.className = 'modal-value modal-value--plane';
    setText('modalShortExpl', 'Dominante Ausdrucksebene · ' + Math.round((maxCount / total) * 100) + '% aller Buchstaben');

    let html = '<div class="modal-planes">';
    entries.forEach(({ key, count }) => {
      const { label, color, desc } = pd[key];
      const barW = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
      const pct = Math.round((count / total) * 100);
      const isDom = count === maxCount && count > 0;
      html += '<div class="modal-plane-row' + (isDom ? ' modal-plane-row--dom' : '') + '">'
        + '<div class="modal-plane-header">'
        + '<span class="modal-plane-label">' + label + '</span>'
        + '<span class="modal-plane-num">' + count + ' <small>(' + pct + '%)</small></span>'
        + '</div>'
        + '<div class="modal-plane-track">'
        + '<div class="modal-plane-fill" style="width:' + barW + '%;background:' + color + '"></div>'
        + '</div>'
        + '<p class="modal-plane-desc">' + desc + '</p>'
        + '</div>';
    });
    html += '</div>';
    const ext = byId('modalExtended');
    if (ext) ext.innerHTML = html;
    try { modal.showModal(); } catch { modal.setAttribute('open', ''); modal.style.display = 'flex'; }
    byId('modalClose')?.focus();
    return;
  }

  if (type === 'loShu') {
    const freqArr = (displayValue || '').split(',').map(Number);
    const freq = {};
    freqArr.forEach((v, i) => { freq[i + 1] = v; });

    setText('modalValue', '⊞');
    const modalValue = byId('modalValue');
    if (modalValue) modalValue.className = 'modal-value modal-value--plane';
    setText('modalShortExpl', 'Psychomatrix deines Geburtsdatums — magisches Quadrat der Zahlen 1–9');

    const missing = Object.entries(freq).filter(([,v]) => v === 0).map(([k]) => k);
    const strong = Object.entries(freq).filter(([,v]) => v >= 3).map(([k,v]) => `${k}(${v}×)`);
    const activeL = loShuLines(freq);

    let html = '<div class="modal-lo-shu">';
    html += '<div class="modal-lo-shu-grid">';
    LO_SHU_LAYOUT.forEach(row => {
      row.forEach(num => {
        const count = freq[num] || 0;
        const cls = 'modal-lo-shu-cell'
          + (count === 0 ? ' lo-shu-cell--missing' : '')
          + (count >= 3 ? ' lo-shu-cell--strong' : '');
        const dots = count === 0 ? '–' : '●'.repeat(Math.min(count, 4)) + (count > 4 ? `+${count - 4}` : '');
        html += `<div class="${cls}"><span class="lo-shu-num">${num}</span><span class="lo-shu-dots">${dots}</span></div>`;
      });
    });
    html += '</div>';

    if (missing.length > 0) {
      html += `<div class="modal-lo-shu-info modal-lo-shu-info--missing"><strong>Fehlende Zahlen (${missing.length}):</strong> ${missing.join(', ')} — Diese Energien dürfen bewusst entwickelt werden.</div>`;
    }
    if (strong.length > 0) {
      html += `<div class="modal-lo-shu-info modal-lo-shu-info--strong"><strong>Starke Zahlen:</strong> ${strong.join(', ')} — Dominante Energiefelder deiner Persönlichkeit.</div>`;
    }
    if (activeL.length > 0) {
      html += `<div class="modal-lo-shu-info modal-lo-shu-info--lines"><strong>Aktive Linien (${activeL.length}):</strong><br>${activeL.join('<br>')}</div>`;
    } else {
      html += `<div class="modal-lo-shu-info">Keine vollständigen Linien — das bedeutet viele offene Entwicklungsfelder.</div>`;
    }
    html += '</div>';

    const ext = byId('modalExtended');
    if (ext) ext.innerHTML = html;
    try { modal.showModal(); } catch { modal.setAttribute('open', ''); modal.style.display = 'flex'; }
    byId('modalClose')?.focus();
    return;
  }

  if (type === 'quantum') {
    const score = parseFloat(displayValue) || 0;
    const interpretation = interpretQuantumScore({ score, variance: 0, spread: 0 });

    setText('modalValue', score.toFixed(1) + '%');
    const modalValue = byId('modalValue');
    if (modalValue) modalValue.className = 'modal-value';
    setText('modalShortExpl',
      score >= 80 ? 'Außergewöhnliche Resonanz deiner Kernzahlen'
      : score >= 60 ? 'Hohe Kohärenz zwischen Lebensweg, Seele und Ausdruck'
      : score >= 40 ? 'Ausgewogene energetische Balance'
      : 'Starkes Wachstumspotenzial durch innere Spannung'
    );
    setText('modalExtended',
      interpretation + ' '
      + '(Lebenszahl + Seelenzahl + Ausdruckszahl) ÷ (3 × 33) × 100 = ' + score.toFixed(1) + '%. '
      + 'Masterzahlen (11, 22, 33) gehen mit ihrem vollen Wert ein. '
      + 'Der Score misst nicht Erfolg oder Wert einer Person, sondern die Resonanz zwischen deinen drei wichtigsten Kernzahlen.'
    );
    try { modal.showModal(); } catch { modal.setAttribute('open', ''); modal.style.display = 'flex'; }
    byId('modalClose')?.focus();
    return;
  }

  setText('modalValue', displayValue);
  const { base, master } = parseDisplayValue(String(displayValue));
  const modalValue = byId('modalValue');
  if (modalValue) {
    modalValue.className = 'modal-value' + (MASTER_NUMBERS.has(master ?? base) ? ' master' : '');
  }
  setText('modalShortExpl', getExplanation(String(displayValue), type));
  setText('modalExtended', getModalExtended(type, displayValue));

  try { modal.showModal(); } catch (e) { modal.setAttribute('open', ''); modal.style.display='flex'; }
  byId('modalClose')?.focus();
}

function initModal() {
  const modal = byId('detailModal') || byId('modal');
  const closeBtn = byId('modalClose');
  if (!modal) return;

  closeBtn?.addEventListener('click', () => modal.close?.());
  modal.addEventListener('click', e => { if (e.target === modal) modal.close?.(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.open) modal.close?.(); });

  document.addEventListener('click', e => {
    const tile = e.target.closest('[data-modal-type]');
    if (!tile || e.target.closest('.tooltip-btn')) return;
    openModal(tile.dataset.modalType, tile.dataset.modalValue);
  });
}

function syncShareAndPreview(data) {
  renderSharePreview(data);
  const shareWrap = byId('shareBarWrap');
  if (shareWrap) shareWrap.hidden = false;

  const shareTextEl = byId('shareBarText');
  if (shareTextEl) {
    shareTextEl.innerHTML =
      'Meine <strong>Lebenszahl</strong> ist die <strong>' + data.lifeVal + '</strong>'
      + (data.archTitle ? ' – <strong>' + data.archTitle + '</strong>' : (data.lifeMeaning ? ' – ' + data.lifeMeaning : ''))
      + '. Meine <strong>Seelenzahl</strong>: <strong>' + data.soulVal + '</strong>'
      + (data.soulMeaning ? ' – ' + data.soulMeaning : '') + '.';
  }
}

function setLoadingState(visible, message) {
  const loadingState = byId('loadingState');
  const loadingText = byId('loadingText');
  if (loadingState) loadingState.hidden = !visible;
  if (loadingText && message) loadingText.textContent = message;
}

function setBusyButton(btn, busy) {
  if (!btn) return;
  btn.disabled = !!busy;
  btn.classList.toggle('btn--calculating', !!busy);
  btn.classList.toggle('btn--loading', !!busy);
  const spinner = btn.querySelector('.btn-spinner-wrap');
  if (spinner) spinner.textContent = busy ? '↻' : '✦';
}

function initTheme() {
  const saved = localStorage.getItem('nTheme') || 'dark';
  const btn = byId('themeToggle');
  document.documentElement.setAttribute('data-theme', saved);
  if (btn) btn.textContent = saved === 'dark' ? '☀' : '☾';

  btn?.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('nTheme', next);
    btn.textContent = next === 'dark' ? '☀' : '☾';
    btn.setAttribute('aria-label', next === 'dark' ? 'Light Mode' : 'Dark Mode');
  });
}

function validateName(name) {
  if (!name || !name.trim()) return { ok: false, msg: 'Bitte Name eingeben.' };
  if (!/^[A-Za-zÄÖÜäöüßẞ\s'\-]+$/.test(name)) return { ok: false, msg: "Nur Buchstaben, Leerzeichen, - und ' erlaubt." };
  if (!/[A-Za-zÄÖÜäöüßẞ]/.test(name)) return { ok: false, msg: 'Bitte einen gültigen Namen eingeben.' };
  return { ok: true, msg: '' };
}

function initCompare() {
  const form = byId('compareForm');
  const resEl = byId('compareResults');
  if (!form || !resEl) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const n1 = byId('compareName1')?.value.trim();
    const d1 = byId('compareDate1')?.value.trim();
    const n2 = byId('compareName2')?.value.trim();
    const d2 = byId('compareDate2')?.value.trim();

    if (!validateName(n1).ok || !isValidDate(d1) || !validateName(n2).ok || !isValidDate(d2)) {
      resEl.innerHTML = '<p class="compare-error">Bitte alle Felder korrekt ausfüllen.</p>';
      return;
    }

    const calc = (nm, dt) => ({
      life: reduceForceSingle(calculateLifePathComponent(dt)),
      soul: reduceForceSingle(calculateSoulSum(nm)),
      expression: reduceForceSingle(calculateExpressionSum(nm)),
      personality: reduceForceSingle(calculatePersonalitySum(nm)),
    });

    const p1 = calc(n1, d1);
    const p2 = calc(n2, d2);

    const dims = [
      { key:'life', label:'Lebenszahl' },
      { key:'soul', label:'Seelenzahl' },
      { key:'expression', label:'Ausdruckszahl' },
      { key:'personality', label:'Persönlichkeit' },
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
    const emoji = overall >= 80 ? '✦' : overall >= 65 ? '◈' : '◉';
    const lbl = overall >= 80 ? 'Hohe Harmonie' : overall >= 65 ? 'Gute Basis' : 'Wachstumspotenzial';

    resEl.innerHTML = '<div class="compat-header">'
      + '<div class="compat-names">' + n1 + ' <span>✦</span> ' + n2 + '</div>'
      + '<div class="compat-overall"><span class="compat-score">' + overall + '%</span>'
      + '<span class="compat-label-big">' + emoji + ' ' + lbl + '</span></div>'
      + '</div><div class="compat-rows">' + rows + '</div>';
  });

  form.addEventListener('reset', () => { resEl.innerHTML = ''; });
}

const APP_VERSION = '4.0';

async function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => !k.includes(APP_VERSION)).map(k => caches.delete(k)));
    const reg = await navigator.serviceWorker.register('/sw.js');
    await reg.update();
  } catch (e) {
    /* SW optional */
  }
}

async function runLoadingSequence(calcBtn) {
  if (!calcBtn) return;
  setLoadingState(true, LOADING_STEPS[0]);
  setBusyButton(calcBtn, true);
  await sleep(90);
  setLoadingState(true, LOADING_STEPS[1]);
  await sleep(110);
  setLoadingState(true, LOADING_STEPS[2]);
  await sleep(90);
  setLoadingState(true, LOADING_STEPS[3]);
  await sleep(110);
  setLoadingState(true, LOADING_STEPS[4]);
  await sleep(90);
}

function renderPrimaryResultAreaVisible() {
  setHidden(byId('resultsSection'), false);
  const resultsCard = document.querySelector('.results-card');
  if (resultsCard) resultsCard.hidden = false;
  setHeroViewVisible(true);
  const resultsEmpty = byId('resultsEmpty');
  if (resultsEmpty) resultsEmpty.hidden = true;
}

function getLifeMeaning(displayValue) {
  const { base } = parseDisplayValue(displayValue);
  return EXPLANATIONS.life[base] || '';
}

function getSoulMeaning(displayValue) {
  const { base } = parseDisplayValue(displayValue);
  return EXPLANATIONS.soul[base] || '';
}

function initForm() {
  const form = byId('numerologyForm');
  const nameInput = byId('name');
  const dateInput = byId('birthdate');
  const nameErrEl = byId('nameError');
  const dateErrEl = byId('dateError');
  const calcBtn = byId('calcBtn');
  const resetBtn = byId('resetBtn');

  if (!form || !nameInput || !dateInput) return;

  function updateFormState() {
    const ns = validateName(nameInput.value);
    const dateOk = isValidDate(dateInput.value.trim());
    const hasInput = dateInput.value.trim().length > 0;

    nameInput.classList.toggle('input-invalid', !ns.ok);
    nameInput.classList.toggle('input-valid', ns.ok);
    if (nameErrEl) nameErrEl.textContent = ns.ok ? '' : ns.msg;

    dateInput.classList.toggle('input-invalid', hasInput && !dateOk);
    dateInput.classList.toggle('input-valid', dateOk);
    if (dateErrEl) dateErrEl.textContent = (!dateOk && hasInput) ? 'Format: TT.MM.JJJJ (z.B. 11.12.2005)' : '';

    const valid = ns.ok && dateOk;
    if (calcBtn) calcBtn.disabled = !valid;
    return valid;
  }

  nameInput.addEventListener('input', updateFormState);

  dateInput.addEventListener('input', function(e) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 8);
    let formatted = raw;
    if (raw.length > 4) {
      formatted = raw.slice(0,2) + '.' + raw.slice(2,4) + '.' + raw.slice(4);
    } else if (raw.length > 2) {
      formatted = raw.slice(0,2) + '.' + raw.slice(2);
    }

    if (e.target.value !== formatted) {
      e.target.value = formatted;
      try { e.target.setSelectionRange(formatted.length, formatted.length); } catch(err) {}
    }
    updateFormState();
  });

  resetBtn?.addEventListener('click', () => {
    requestAnimationFrame(() => {
      if (nameErrEl) nameErrEl.textContent = '';
      if (dateErrEl) dateErrEl.textContent = '';
      nameInput.classList.remove('input-invalid', 'input-valid');
      dateInput.classList.remove('input-invalid', 'input-valid');
      if (calcBtn) calcBtn.disabled = false;
      clearResults();
      setHeroViewVisible(false);
      history.replaceState(null, '', window.location.pathname);
      lastResult = null;
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!updateFormState()) return;

    await runLoadingSequence(calcBtn);

    const name = nameInput.value.trim();
    const date = dateInput.value.trim();

    const expressionSum  = calculateExpressionSum(name);
    const soulSum        = calculateSoulSum(name);
    const personalitySum = calculatePersonalitySum(name);
    const birthdayRaw    = calculateBirthdaySum(date);

    const lifeVal = formatLifePathComponent(date);
    const lifeComponentNum = calculateLifePathComponent(date);

    const expressionVal  = formatValue(expressionSum);
    const soulVal        = formatValue(soulSum);
    const personalityVal = formatValue(personalitySum);

    const lifeMeaning = getLifeMeaning(lifeVal);
    const soulMeaning  = getSoulMeaning(soulVal);

    const arch = getArchetype('life', lifeVal);
    const archTitle = arch?.title || (lifeMeaning || 'Dein Archetyp');
    const lifeTeaser = arch?.teaser || lifeMeaning || '';

    lastResult = {
      name, date,
      lifeVal,
      soulVal,
      expressionVal,
      personalityVal,
      lifeMeaning,
      soulMeaning,
      archTitle,
      lifeTeaser,
    };

    renderPrimaryResultAreaVisible();

    if (byId('lifePathNumber')) setResultValue('lifePathNumber', lifeVal);
    setResultValue('expressionNumber', expressionVal);
    setResultValue('soulNumber', soulVal);
    setResultValue('personalityNumber', personalityVal);

    if (byId('lifeExplanation')) setTileExplanation('lifeExplanation', lifeVal, 'life');
    setTileExplanation('expressionExplanation', expressionVal, 'expression');
    setTileExplanation('soulExplanation', soulVal, 'soul');
    setTileExplanation('personalityExplanation', personalityVal, 'personality');

    const lifeDetails = MODAL_DETAILS.life;
    if (lifeDetails) {
      lifeDetails.calc = 'Komponenten-Methode: ' + lifePathComponentDetails(date);
    }

    const lifeHeroDisplay = byId('lifeHeroDisplay');
    const heroNum = byId('lifeHeroNum');
    const heroArch = byId('lifeHeroArchetype');
    const heroBadge = byId('lifeHeroBadge');
    const heroTeaser = byId('lifeHeroTeaser');
    const heroBtn = byId('lifeHeroDetailBtn');

    if (lifeHeroDisplay) {
      if (heroNum) {
        heroNum.textContent = lifeVal;
        heroNum.classList.toggle('master', MASTER_NUMBERS.has(parseDisplayValue(lifeVal).master ?? parseDisplayValue(lifeVal).base));
        heroNum.classList.remove('num-animate');
        void heroNum.offsetWidth;
        heroNum.classList.add('num-animate');
      }

      const heroA = getArchetype('life', lifeVal);
      if (heroA) {
        if (heroArch) heroArch.textContent = heroA.title;
        if (heroTeaser) heroTeaser.textContent = heroA.teaser;
        if (heroBadge && heroA.badge) {
          heroBadge.textContent = heroA.badge;
          heroBadge.className = 'life-hero-badge' + (String(heroA.badge).includes('Masterzahl') ? ' life-hero-badge--master' : '');
          heroBadge.hidden = false;
        } else if (heroBadge) {
          heroBadge.hidden = true;
        }
      }

      if (heroBtn) {
        heroBtn.onclick = () => openModal('life', lifeVal);
      }

      lifeHeroDisplay.hidden = false;
    }

    const hasCoreCards = !!document.querySelector('.core-card');
    if (!hasCoreCards) {
      renderLegacyCoreGrid({
        lifeVal,
        soulVal,
        expressionVal,
        personalityVal,
      });
    } else {
      setText('soulNumber', soulVal);
      setText('expressionNumber', expressionVal);
      setText('personalityNumber', personalityVal);
      setTileExplanation('soulExplanation', soulVal, 'soul');
      setTileExplanation('expressionExplanation', expressionVal, 'expression');
      setTileExplanation('personalityExplanation', personalityVal, 'personality');
    }

    const emptyEl = byId('resultsEmpty');
    if (emptyEl) emptyEl.hidden = true;

    setTimeout(() => {
      const anchor = byId('resultsAnchor') || byId('lifeHeroDisplay');
      if (anchor?.scrollIntoView) anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 220);

    if (byId('resultsHint')) {
      setText('resultsHint', '✦ Tippe auf eine Zahl für die vollständige Deutung');
      byId('resultsHint').style.display = 'flex';
    }

    const eg = byId('extraNumbersGrid');
    if (eg) eg.innerHTML = '';

    appendGridLabel('— Identität —');
    const birthdayDisplay = formatValue(birthdayRaw);
    const maturitySum = calculateMaturitySum(reduceForceSingle(lifeComponentNum), expressionSum);
    const maturityDisplay = formatValue(maturitySum);
    appendExtraTile('Geburtstagszahl', birthdayDisplay, 'Besondere Begabung des Geburtstages', 'birthday', 'birthday', false);
    appendExtraTile('Reifezahl', maturityDisplay, 'Lebenszahl + Ausdruckszahl', 'maturity', 'maturity', false);

    appendGridLabel('— Zeitzyklen —');
    const pyRaw  = getPersonalYearRawSum(date);
    const pyDisp = getPersonalYearDisplay(date);
    const pmVal  = calculatePersonalMonth(pyRaw);
    const pdVal  = calculatePersonalDay(pmVal);
    appendExtraTile('Pers. Jahr', pyDisp, 'Geburtsmonat + Geburtstag + Jahresquersumme', 'personalYear', 'personalYear', false);
    appendExtraTile('Pers. Monat', formatValue(pmVal), 'Pers. Jahr + aktueller Monat', 'personalMonth', 'personalMonth', false);
    appendExtraTile('Pers. Tag', formatValue(pdVal), 'Pers. Monat + heutiger Tag', 'personalDay', 'personalDay', false);

    appendGridLabel('— Karma —');
    const karmicLessons = calculateKarmicLessons(name);
    if (karmicLessons.length === 0) {
      appendExtraTile('Karm. Lektionen', '–', 'Keine fehlenden Zahlen im Namen', null, null, false);
    } else {
      karmicLessons.forEach(n =>
        appendExtraTile('Karm. Lektion ' + n, String(n), 'Im Namen fehlende Energie', 'karmic', 'karmic', false)
      );
    }

    const debtSources = [
      ['Lebenszahl', calculateLifeSum(date)],
      ['Ausdruckszahl', expressionSum],
      ['Geburtstag', birthdayRaw]
    ];
    const foundDebts = new Set();
    debtSources.forEach(([label, rawSum]) => {
      const debt = findKarmicDebt(rawSum);
      if (debt && !foundDebts.has(debt)) {
        foundDebts.add(debt);
        appendExtraTile('Karm. Schuld (' + label + ')', String(debt), EXPLANATIONS.karmicDebt[debt] || '', 'karmicDebt', 'karmicDebt', true);
      }
    });

    appendGridLabel('— Herausforderungen —');
    const ch = calculateChallenges(date);
    const lifePR = reduceForceSingle(lifeComponentNum);
    appendExtraTile('Herausforderung 1', String(ch.c1), 'Erste Lebenshälfte', 'challenge', 'challenge', false);
    appendExtraTile('Herausforderung 2', String(ch.c2), 'Zweite Lebenshälfte', 'challenge', 'challenge', false);
    appendExtraTile('Herausforderung 3', String(ch.c3), 'Gesamte Lebensaufgabe', 'challenge', 'challenge', false);
    appendExtraTile('Herausforderung 4', String(ch.c4), 'Lebenslange Herausforderung', 'challenge', 'challenge', false);

    appendGridLabel('— Höhepunkte —');
    const pn = calculatePinnacles(date);
    const p1e = 36 - lifePR;
    appendExtraTile('Höhepunkt 1 (bis ' + p1e + ')', formatValue(pn.p1), 'Jugend & junges Erwachsensein', 'pinnacle', 'pinnacle', false);
    appendExtraTile('Höhepunkt 2 (' + p1e + '–' + (p1e + 9) + ')', formatValue(pn.p2), 'Junges Erwachsensein', 'pinnacle', 'pinnacle', false);
    appendExtraTile('Höhepunkt 3 (' + (p1e + 9) + '–' + (p1e + 18) + ')', formatValue(pn.p3), 'Mittleres Lebensalter', 'pinnacle', 'pinnacle', false);
    appendExtraTile('Höhepunkt 4 (ab ' + (p1e + 18) + ')', formatValue(pn.p4), 'Reifes Lebensalter', 'pinnacle', 'pinnacle', false);

    appendGridLabel('— Lebensphasen —');
    const lc = calculateLifeCycles(date);
    appendExtraTile('Life Cycle 1', formatValue(lc.lc1), 'Geburtsmonat — Kindheit & Jugend', 'lifeCycle', 'lifeCycle', false);
    appendExtraTile('Life Cycle 2', formatValue(lc.lc2), 'Geburtstag — Erwachsenenphase', 'lifeCycle', 'lifeCycle', false);
    appendExtraTile('Life Cycle 3', formatValue(lc.lc3), 'Geburtsjahr — spätes Leben', 'lifeCycle', 'lifeCycle', false);

    appendGridLabel('— Psychologie —');
    const balanceDisplay = formatValue(calculateBalanceSum(name));
    const subcVal = calculateSubconscious(name);
    const rationalVal = calculateRationalThought(date, expressionSum);
    appendExtraTile('Balancezahl', balanceDisplay, 'Summe der Namensinitiale', 'balance', 'balance', false);
    appendExtraTile('Unterbewusstsein', String(subcVal), '9 − fehlende Zahlen im Namen', 'subconscious', 'subconscious', false);
    appendExtraTile('Rational Thought', formatValue(rationalVal), 'Geburtstagszahl + Ausdruckszahl', 'rationalThought', 'rationalThought', false);

    appendGridLabel('— Talente —');
    const hiddenPassion = calculateHiddenPassion(name);
    const cornerstone = calculateCornerstone(name);
    const capstone = calculateCapstone(name);
    const firstImpression = calculateFirstImpression(name);
    appendExtraTile('Hidden Passion', hiddenPassion, 'Häufigste Zahl(en) im Namen', 'hiddenPassion', 'hiddenPassion', false);
    appendExtraTile('Cornerstone', String(cornerstone), 'Erster Buchstabe des Vornamens', 'cornerstone', 'cornerstone', false);
    appendExtraTile('Capstone', String(capstone), 'Letzter Buchstabe des Nachnamens', 'capstone', 'capstone', false);
    appendExtraTile('First Impression', formatValue(firstImpression), 'Erste Buchstaben Vor- & Nachname', 'firstImpression', 'firstImpression', false);

    appendGridLabel('— Bridges —');
    const lpBridge = calculateLifePathBridge(calculateLifeSum(date), expressionSum);
    const spBridge = calculateSoulPersonalityBridge(soulSum, personalitySum);
    appendExtraTile('Life Path Bridge', String(lpBridge), '|Lebenszahl − Ausdruckszahl|', 'bridge', 'bridge', false);
    appendExtraTile('Soul-Personality Bridge', String(spBridge), '|Seelenzahl − Persönlichkeitszahl|', 'bridge', 'bridge', false);

    appendGridLabel('— Quantum Score —');
    appendQuantumTile(name, date);

    appendGridLabel('— Ebenen des Ausdrucks —');
    appendPlanesTile(calculatePlanesOfExpression(name));

    appendGridLabel('— Lo-Shu Psychomatrix —');
    appendLoShuTile(date);

    animateTiles('extraNumbersGrid');

    const shareTextEl = byId('shareBarText');
    if (shareTextEl) {
      shareTextEl.innerHTML =
        'Meine <strong>Lebenszahl</strong> ist die <strong>' + lifeVal + '</strong>'
        + (archTitle ? ' – <strong>' + archTitle + '</strong>' : (lifeMeaning ? ' – ' + lifeMeaning : ''))
        + '. Meine <strong>Seelenzahl</strong>: <strong>' + soulVal + '</strong>'
        + (soulMeaning ? ' – ' + soulMeaning : '') + '.';
    }

    syncShareAndPreview(lastResult);

    const shareBarWrapEl = byId('shareBarWrap');
    if (shareBarWrapEl) shareBarWrapEl.hidden = false;

    const ctaBarWrapEl = byId('ctaBarWrap');
    if (ctaBarWrapEl) ctaBarWrapEl.hidden = false;

    updateShareURL(name, date);

    const ra = byId('resultActions');
    if (ra) ra.hidden = false;

    const cn1 = byId('compareName1');
    const cd1 = byId('compareDate1');
    if (cn1) cn1.value = name;
    if (cd1) cd1.value = date;

    setTimeout(() => {
      ['lifeTile','expressionTile','soulTile','personalityTile'].forEach(id => {
        const el = byId(id);
        if (el && el.hasAttribute('data-modal-type')) {
          el.classList.remove('pulse-hint');
          void el.offsetWidth;
          el.classList.add('pulse-hint');
          el.addEventListener('animationend', () => el.classList.remove('pulse-hint'), { once: true });
        }
      });
    }, 1200);

    setLoadingState(false, '');
    setBusyButton(calcBtn, false);
  });

  updateFormState();
  const hasURLData = loadFromURL();
  if (hasURLData) {
    updateFormState();
    setTimeout(() => { if (updateFormState()) form.dispatchEvent(new Event('submit')); }, 120);
  }
}

function initShareButtons() {
  byId('printBtn')?.addEventListener('click', () => window.print());

  byId('shareBtnWA')?.addEventListener('click', () => {
    const text = buildShareText();
    const url = 'https://wa.me/?text=' + encodeURIComponent(text);
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  byId('shareBtnCopy')?.addEventListener('click', async () => {
    const btn = byId('shareBtnCopy');
    const iconEl = byId('shareCopyIcon');
    try {
      await navigator.clipboard.writeText(window.location.href);
      if (iconEl) iconEl.textContent = '✓';
      if (btn) btn.classList.add('copied');
      setTimeout(() => {
        if (iconEl) iconEl.textContent = '🔗';
        if (btn) btn.classList.remove('copied');
      }, 2200);
    } catch {
      showToast('Link: ' + window.location.href);
    }
  });

  byId('downloadShare')?.addEventListener('click', async () => {
    if (!lastResult) {
      showToast('Bitte erst eine Analyse berechnen.');
      return;
    }
    await downloadShareImage(lastResult);
  });
}

function initHeroInfo() {
  const heroInfoBtn  = byId('heroInfoBtn');
  const heroInfoBody = byId('heroInfoBody');
  heroInfoBtn?.addEventListener('click', () => {
    const expanded = heroInfoBtn.getAttribute('aria-expanded') === 'true';
    heroInfoBtn.setAttribute('aria-expanded', String(!expanded));
    if (heroInfoBody) heroInfoBody.hidden = expanded;
  });
}

function initCtas() {
  byId('ctaBtnReset')?.addEventListener('click', () => {
    const form = byId('numerologyForm');
    if (form) form.dispatchEvent(new Event('reset'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => byId('name')?.focus(), 400);
  });

  byId('ctaBtnCompare')?.addEventListener('click', () => {
    byId('compare-title')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => byId('compareName1')?.focus(), 500);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initForm();
  initModal();
  initCompare();
  initShareButtons();
  initHeroInfo();
  initCtas();
  window.addEventListener('load', registerSW);

  if (window.innerWidth >= 768 && !new URLSearchParams(location.search).has('name')) {
    setTimeout(() => { byId('name')?.focus(); }, 200);
  }

  const resultsSection = byId('resultsSection');
  if (resultsSection) resultsSection.hidden = true;
  const loadingState = byId('loadingState');
  if (loadingState) loadingState.hidden = true;
});