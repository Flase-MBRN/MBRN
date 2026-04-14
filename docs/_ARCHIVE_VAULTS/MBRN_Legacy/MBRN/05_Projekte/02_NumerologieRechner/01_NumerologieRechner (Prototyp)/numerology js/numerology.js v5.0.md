/**
 * numerology.js — v4.0
 * ══════════════════════════════════════════════════════════
 *  Pythagorean Numerologie · 36 Kennzahlen
 *
 *  Engine:
 *  ✦ Y-Vokal-Regel (Y als Vokal zwischen Konsonanten)
 *  ✦ Komponenten-Methode für Lebensweg (Masterzahlen-sicher)
 *  ✦ Lo-Shu Psychomatrix (3×3 aus Geburtsdatum)
 *  ✦ Quantum Score v2 (Varianz + Spread Kohärenz-Engine)
 *
 *  UI v4.0:
 *  ✦ Life Hero Display mit Archetypus
 *  ✦ Progressive Disclosure via Akkordeons
 *  ✦ Emotional Loading Overlay
 *  ✦ Canvas Share Card (1080×1080)
 *  ✦ Quantum Score v2 mit Interpretation
 * ══════════════════════════════════════════════════════════
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

// Lo-Shu Magic-Square Layout (Reihe für Reihe)
const LO_SHU_LAYOUT = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6],
];


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


/* ═══════════════════════════════════════════════════════════
   4. Y-VOKAL-REGEL (NEU v3.0)
   ═══════════════════════════════════════════════════════════
   Y zählt als Vokal wenn:
   • Kein Vokal direkt davor UND kein Vokal direkt danach
   • Am Wortanfang oder Wortende ohne angrenzenden Vokal
   Diese Regel macht Seelenzahl & Persönlichkeit genauer.
   ═══════════════════════════════════════════════════════════ */

function isYVowel(chars, index) {
  if (chars[index] !== 'Y') return false;
  const prev = index > 0 ? chars[index - 1] : null;
  const next = index < chars.length - 1 ? chars[index + 1] : null;
  const isV  = c => c && VOWELS.has(c);
  // Am Anfang: nur Vokal wenn kein Vokal folgt
  if (!prev) return !isV(next);
  // Am Ende: nur Vokal wenn kein Vokal davor
  if (!next) return !isV(prev);
  // Mitte: Vokal wenn zwischen zwei Konsonanten
  return !isV(prev) && !isV(next);
}


/* ═══════════════════════════════════════════════════════════
   5. KERN-BERECHNUNGEN
   ═══════════════════════════════════════════════════════════ */

/** Rohsumme aller Ziffern des Datums (für Kompatibilität mit alten Stellen) */
function calculateLifeSum(date) {
  return date.replace(/\D/g,'').split('').reduce((s,d) => s + parseInt(d,10), 0);
}

/**
 * NEU v3.0 – Komponenten-Methode (klassischer & genauer)
 * Tag, Monat, Jahr werden zuerst einzeln reduziert,
 * dann addiert und nochmals reduziert.
 * Masterzahlen bei Zwischen-Schritten werden bewahrt.
 */
function calculateLifePathComponent(date) {
  const [dStr, mStr, yStr] = date.split('.');
  const day   = reducePreserveMaster(parseInt(dStr, 10));
  const month = reducePreserveMaster(parseInt(mStr, 10));
  const year  = reducePreserveMaster(digitSum(parseInt(yStr, 10)));
  return reducePreserveMaster(day + month + year);
}

/** Formatierter Display-Wert für Lebensweg (Komponenten-Methode) */
function formatLifePathComponent(date) {
  const raw = calculateLifePathComponent(date);
  const base = reduceForceSingle(raw);
  if (MASTER_NUMBERS.has(raw) && raw !== base) return `${base}/${raw}`;
  return String(raw);
}

/** Berechnungs-Details für das Lebensweg-Modal */
function lifePathComponentDetails(date) {
  const [dStr, mStr, yStr] = date.split('.');
  const day   = reducePreserveMaster(parseInt(dStr, 10));
  const month = reducePreserveMaster(parseInt(mStr, 10));
  const yearD = digitSum(parseInt(yStr, 10));
  const year  = reducePreserveMaster(yearD);
  const sum   = day + month + year;
  return `Tag ${dStr}→${day}  +  Monat ${mStr}→${month}  +  Jahr ${yStr}→${yearD}→${year}  =  ${sum}→${formatLifePathComponent(date)}`;
}

function calculateExpressionSum(name) {
  return nameToNumbers(name).reduce((s,n) => s+n, 0);
}

/**
 * NEU v3.0 – Seelenzahl mit Y-Vokal-Regel
 * Y zählt als Vokal wenn zwischen zwei Konsonanten stehend.
 */
function calculateSoulSum(name) {
  const chars = normalizeName(name).replace(/\s+/g,'').split('');
  return chars.reduce((sum, ch, i) => {
    if (VOWELS.has(ch) || (ch === 'Y' && isYVowel(chars, i))) {
      return sum + charToNumber(ch);
    }
    return sum;
  }, 0);
}

/**
 * NEU v3.0 – Persönlichkeitszahl mit Y-Vokal-Regel
 * Y als Vokal = NICHT in Persönlichkeit gezählt.
 */
function calculatePersonalitySum(name) {
  const chars = normalizeName(name).replace(/\s+/g,'').split('');
  return chars.reduce((sum, ch, i) => {
    const isVowelHere = VOWELS.has(ch) || (ch === 'Y' && isYVowel(chars, i));
    if (!isVowelHere && charToNumber(ch) > 0) return sum + charToNumber(ch);
    return sum;
  }, 0);
}

function calculateBirthdaySum(date) {
  return parseInt(date.split('.')[0], 10);
}
function calculateMaturitySum(lifeVal, expressionSum) {
  return reduceForceSingle(lifeVal) + reduceForceSingle(expressionSum);
}


/* ═══════════════════════════════════════════════════════════
   5b. LO-SHU PSYCHOMATRIX (NEU v3.0)
   ═══════════════════════════════════════════════════════════
   Zählt wie oft jede Ziffer 1–9 im Geburtsdatum vorkommt.
   Nullen werden ignoriert (kein Lo-Shu-Platz für 0).
   ═══════════════════════════════════════════════════════════ */

function calculateLoShu(date) {
  const [dStr, mStr, yStr] = date.split('.');
  const allDigits = (dStr + mStr + yStr).split('');
  const freq = {};
  for (let i = 1; i <= 9; i++) freq[i] = 0;
  allDigits.forEach(ch => {
    const d = parseInt(ch, 10);
    if (d >= 1 && d <= 9) freq[d]++;
  });
  return freq;
}

/** Liefert die Lo-Shu "Linien" (vorhandene Zahlenkombinationen) */
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


/* ═══════════════════════════════════════════════════════════
   5c. QUANTUM VIBRATIONS-SCORE (NEU v3.0)
   ═══════════════════════════════════════════════════════════
   Score = (Lebenszahl + Seelenzahl + Ausdruckszahl) / (3 × 33) × 100
   Masterzahlen (11/22/33) werden mit ihrem vollen Wert gewichtet.
   ═══════════════════════════════════════════════════════════ */

/**
 * Quantum Score v2 — Kohärenz-Engine
 * Misst die Harmonie zwischen Lebenszahl, Seelenzahl und Ausdruckszahl
 * anhand von Varianz und Spread (statt einfacher Summe).
 * Integriert aus quantum.v2.js — konfliktfrei in monolithischer Datei.
 */
function calculateQuantumScore(name, date) {
  const life = reduceForceSingle(calculateLifePathComponent(date));
  const soul = reduceForceSingle(calculateSoulSum(name));
  const expr = reduceForceSingle(calculateExpressionSum(name));

  const values = [life, soul, expr];
  const avg    = values.reduce((a, b) => a + b, 0) / 3;

  const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / 3;
  const spread   = Math.max(...values) - Math.min(...values);

  const harmonyScore     = 100 - (variance * 8);
  const dominancePenalty = spread * 2;
  const final = Math.max(0, Math.min(100, harmonyScore - dominancePenalty));

  return {
    score:    Math.round(final * 10) / 10,
    avg:      Math.round(avg * 100) / 100,
    variance: Math.round(variance * 100) / 100,
    spread,
    values:   { life, soul, expression: expr },
  };
}

/** Interpretationstext für Quantum Score v2 */
function interpretQuantumScore(result) {
  const score    = Number(result?.score ?? 0);
  const variance = Number(result?.variance ?? 0);
  const spread   = Number(result?.spread ?? 0);

  if (score >= 80) {
    return 'Deine Kernzahlen sind stark im Einklang — du wirkst klar, stabil und zielgerichtet.';
  }
  if (score >= 60) {
    return variance <= 4
      ? 'Du hast eine gute innere Balance. Kleinere Spannungen sind da, aber sie halten dich nicht aus der Spur.'
      : 'Du hast eine gute Basis, aber einzelne Bereiche ziehen noch in unterschiedliche Richtungen.';
  }
  if (score >= 40) {
    return spread >= 5
      ? 'Zwischen deinen inneren und äußeren Anteilen besteht spürbare Reibung — genau dort liegt aber auch dein Wachstum.'
      : 'Du bist nicht unausgeglichen, aber noch nicht ganz im Fluss. Da ist Entwicklung drin.';
  }
  return 'Deine Zahlen zeigen starke Gegensätze. Das kann fordernd sein, bringt aber auch enormes Entwicklungspotenzial.';
}


/* ═══════════════════════════════════════════════════════════
   6. KARMA
   ═══════════════════════════════════════════════════════════ */

function calculateKarmicLessons(name) {
  const present = new Set(nameToNumbers(name));
  return [1,2,3,4,5,6,7,8,9].filter(n => !present.has(n));
}


/* ═══════════════════════════════════════════════════════════
   7. PSYCHOLOGIE
   ═══════════════════════════════════════════════════════════ */

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


/* ═══════════════════════════════════════════════════════════
   8. TALENTE
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
   9. PLANES OF EXPRESSION
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
   10. LEBENSPHASEN (LIFE CYCLES)
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
   11. HERAUSFORDERUNGEN & HÖHEPUNKTE
   ═══════════════════════════════════════════════════════════ */

function calculateChallenges(date) {
  const [dStr, mStr, yStr] = date.split('.');
  const day   = reduceForceSingle(parseInt(dStr, 10));
  const month = reduceForceSingle(parseInt(mStr, 10));
  const year  = reduceForceSingle(digitSum(parseInt(yStr, 10)));
  const c1 = reduceForceSingle(Math.abs(month - day));
  const c2 = reduceForceSingle(Math.abs(year  - day));
  const c3 = reduceForceSingle(Math.abs(c1 - c2));
  const c4 = reduceForceSingle(Math.abs(month - year));
  return { c1, c2, c3, c4 };
}

/**
 * BUGFIX v3.0:
 * Pinnacles verwenden jetzt reduzierte Komponenten (wie Herausforderungen).
 * Vorher wurden rohe Werte addiert (Monat+Tag ohne Reduktion) – falsch.
 */
function calculatePinnacles(date) {
  const [dStr, mStr, yStr] = date.split('.');
  const day   = reduceForceSingle(parseInt(dStr, 10));
  const month = reduceForceSingle(parseInt(mStr, 10));
  const year  = reduceForceSingle(digitSum(parseInt(yStr, 10)));
  return {
    p1: reducePreserveMaster(month + day),
    p2: reducePreserveMaster(day   + year),
    p3: reducePreserveMaster(
          reduceForceSingle(reducePreserveMaster(month+day)) +
          reduceForceSingle(reducePreserveMaster(day+year))
        ),
    p4: reducePreserveMaster(month + year),
  };
}


/* ═══════════════════════════════════════════════════════════
   12. ZEITZYKLEN
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
   13. BRIDGES
   ═══════════════════════════════════════════════════════════ */

function calculateLifePathBridge(lifeRaw, expressionSum) {
  // v3.0: nutze Komponenten-Lebensweg für Bridge
  const lifeReduced = reduceForceSingle(lifeRaw);
  return reduceForceSingle(Math.abs(lifeReduced - reduceForceSingle(expressionSum)));
}
function calculateSoulPersonalityBridge(soulSum, personalitySum) {
  return reduceForceSingle(Math.abs(reduceForceSingle(soulSum) - reduceForceSingle(personalitySum)));
}


/* ═══════════════════════════════════════════════════════════
   14. KOMPATIBILITÄT
   ═══════════════════════════════════════════════════════════ */

function numberHarmony(a, b) {
  a = a > 9 ? reduceForceSingle(a) : a;
  b = b > 9 ? reduceForceSingle(b) : b;
  if (a === b) return 88;
  const key    = [a, b].sort((x,y) => x-y).join('-');
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
   15. DATUMS-VALIDIERUNG
   ═══════════════════════════════════════════════════════════ */

function isLeapYear(y) { return (y%4===0 && y%100!==0) || y%400===0; }
function isValidDate(dateStr) {
  if (!/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) return false;
  const [day, month, year] = dateStr.split('.').map(Number);
  if (month < 1 || month > 12) return false;
  if (year < 1900 || year > 2099) return false;
  const dim = [31, isLeapYear(year)?29:28, 31,30,31,30,31,31,30,31,30,31];
  return day >= 1 && day <= dim[month-1];
}


/* ═══════════════════════════════════════════════════════════
   16. ERKLÄRUNGSTEXTE
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
    // Prozent-Bereiche als Strings
    low:   'Energetisch noch im Aufbau — hohes Wachstumspotenzial',
    mid:   'Ausgewogene Schwingungsfrequenz — solide Basis',
    high:  'Hohe Kohärenz zwischen Lebensweg, Seele und Ausdruck',
    peak:  'Außergewöhnliche Resonanz — seltene energetische Harmonie',
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



/* ═══════════════════════════════════════════════════════════
   ARCHETYPES — Identitäts-Labels für v1.0
   Nur UI-Daten, KEINE Berechnungslogik.
   ═══════════════════════════════════════════════════════════ */

const ARCHETYPES = {
  /* Lebensweg: vollständiger Archetypus mit Teaser */
  life: {
    1:  { title:'Der Pionier',      teaser:'Du bahnst neue Wege, wo andere zweifeln. Führung und Eigenständigkeit sind dein Lebensthema.',                        badge:null },
    2:  { title:'Der Diplomat',     teaser:'Du verbindest Menschen. Deine Stärke liegt im Zuhören, Vermitteln und im feinen Gespür für andere.',                  badge:null },
    3:  { title:'Der Kreative',     teaser:'Du inspirierst durch Ausdruck. Kreativität und Kommunikation sind der Kern deines Lebenswegs.',                       badge:null },
    4:  { title:'Der Baumeister',   teaser:'Du erschaffst Dauerhaftes. Struktur, Beständigkeit und verlässliche Systeme sind dein Fundament.',                    badge:null },
    5:  { title:'Der Abenteurer',   teaser:'Du lebst für das Neue. Wandel ist nicht Störung — er ist dein natürlicher Zustand.',                                  badge:null },
    6:  { title:'Der Heiler',       teaser:'Du trägst Verantwortung. Fürsorge, Familie und das Heilen von Disharmonie formen deinen Lebensweg.',                  badge:null },
    7:  { title:'Der Denker',       teaser:'Du suchst die Wahrheit, dort wo andere aufhören zu fragen. Tiefe, Analyse und Spiritualität leiten dich.',            badge:null },
    8:  { title:'Der Macher',       teaser:'Du manifestierst. Macht, Erfolg und das verantwortungsvolle Gestalten materieller Realität sind dein Terrain.',       badge:null },
    9:  { title:'Der Weise',        teaser:'Du gibst. Universelles Mitgefühl, Weisheit und das Loslassen alter Muster prägen deinen einzigartigen Lebensweg.',    badge:null },
    11: { title:'Das Medium',       teaser:'Du empfängst, was anderen verborgen bleibt. Intuition auf höchstem Niveau — ein spiritueller Kanal.',                 badge:'✦ Masterzahl' },
    22: { title:'Der Visionär',     teaser:'Du baust die Welt von morgen. Wenige tragen dieses seltene Potential zur großen Manifestation in sich.',              badge:'✦ Masterzahl' },
    33: { title:'Der Lehrmeister',  teaser:'Du dienst dem Ganzen. Die seltenste und tiefste aller Zahlen — spirituelles Lehren auf höchstem Niveau.',             badge:'✦ Masterzahl · Selten' },
  },
  expression: {
    1:{title:'Der Leader'},      2:{title:'Der Vermittler'},   3:{title:'Der Kommunikator'},
    4:{title:'Der Stratege'},    5:{title:'Der Wandler'},      6:{title:'Der Fürsorger'},
    7:{title:'Der Analytiker'},  8:{title:'Der Achiever'},     9:{title:'Der Humanist'},
    11:{title:'Der Inspirator'}, 22:{title:'Der Gestalter'},   33:{title:'Der Mentor'},
  },
  soul: {
    1:{title:'Innerer Kämpfer'},       2:{title:'Stille Kraft'},         3:{title:'Kreative Seele'},
    4:{title:'Stabiler Kern'},         5:{title:'Freier Geist'},         6:{title:'Liebendes Herz'},
    7:{title:'Spiritueller Sucher'},   8:{title:'Ambitions-Seele'},      9:{title:'Mitgefühls-Herz'},
    11:{title:'Intuitives Medium'},    22:{title:'Visionärs-Seele'},     33:{title:'Heiler-Seele'},
  },
  personality: {
    1:{title:'Wirkt: selbstsicher & direkt'},  2:{title:'Wirkt: sanft & einfühlsam'},
    3:{title:'Wirkt: charmant & lebendig'},    4:{title:'Wirkt: verlässlich & geerdet'},
    5:{title:'Wirkt: dynamisch & offen'},      6:{title:'Wirkt: warm & fürsorglich'},
    7:{title:'Wirkt: tiefgründig & mysteriös'},8:{title:'Wirkt: stark & präsent'},
    9:{title:'Wirkt: weise & großzügig'},      11:{title:'Wirkt: außergewöhnlich'},
    22:{title:'Wirkt: visionär'},              33:{title:'Wirkt: leuchtend'},
  },
};

/** Gibt Archetypus-Daten zurück (oder null wenn nicht gefunden) */
function getArchetype(type, displayValue) {
  const map = ARCHETYPES[type];
  if (!map) return null;
  const { base, master } = parseDisplayValue(String(displayValue));
  const key = master || base;
  return map[key] || map[base] || null;
}


/* ═══════════════════════════════════════════════════════════
   17. MODAL-DETAILS
   ═══════════════════════════════════════════════════════════ */

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

  /* ── NEU v3.0 ─────────────────────────────────────────── */

  loShu: {
    icon: '⊞',
    title: 'Lo-Shu Psychomatrix',
    calc: 'Wie oft jede Ziffer 1–9 im Geburtsdatum (TT MM JJJJ) vorkommt. Nullen werden ignoriert. Das magische Quadrat jeder Reihe/Spalte/Diagonale summiert sich zu 15.',
    extended: {
      missing:  'Fehlende Zahlen zeigen Bereiche, die bewusst gestärkt werden dürfen.',
      present:  'Vorhandene Zahlen zeigen natürliche Energien und angeborene Stärken.',
      repeated: 'Mehrfach vorhandene Zahlen zeigen dominante Energiefelder — Stärke und Herausforderung zugleich.',
    },
    // Wird im Modal als Sonderfall gerendert (loShu-Typ)
    planeData: {}
  },

  quantum: {
    icon: '⟐',
    title: 'Quantum Vibrations-Score',
    calc: 'Harmonie-Score basierend auf Varianz und Spread der drei Kernzahlen (Leben, Seele, Ausdruck). Score = 100 − (Varianz × 8) − (Spread × 2). Je näher die Zahlen beieinander, desto höher der Score.',
    extended: {
      range: 'Ein hoher Score zeigt starke Resonanz zwischen Lebensweg, Seele und Ausdruck. Ein niedriger Score zeigt innere Spannung — und damit Wachstumspotenzial.',
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
      mental:    'Der Mental Plane zeigt wie stark Logik, Sprache und rationales Denken verankert sind.',
      emotional: 'Der Emotional Plane misst wie stark Gefühle und Kreativität dein Wesen bestimmen.',
      physisch:  'Der Physical Plane zeigt deine Orientierung auf das Materielle und Praktische.',
      intuitiv:  'Der Intuitive Plane steht für spirituelle Wahrnehmung und Innenschau.',
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


/* ═══════════════════════════════════════════════════════════
   18. DOM-HELFER  v4.0
   Kern unverändert — appendExtraTile bekommt targetGridId Parameter.
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
 * v4.0: appendExtraTile — builds tile off-DOM for batching.
 * targetGridId routes tiles into the correct accordion grid.
 * Tiles are stored in _tileBuffers and flushed via flushTileBuffers().
 */
const _tileBuffers = {};

function appendExtraTile(title, value, tooltip, explType, modalType, isDebt, targetGridId) {
  const gid = targetGridId || 'acc-talents-grid';
  if (!_tileBuffers[gid]) _tileBuffers[gid] = [];

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

  _tileBuffers[gid].push(tile);
  return tile;
}

/** Flush all buffered tiles into their grids in one pass per grid */
function flushTileBuffers() {
  for (const [gid, tiles] of Object.entries(_tileBuffers)) {
    if (!tiles.length) continue;
    const grid = document.getElementById(gid);
    if (!grid) continue;
    const frag = document.createDocumentFragment();
    tiles.forEach(t => frag.appendChild(t));
    grid.appendChild(frag);
    /* Single rAF for all tiles in this grid */
    requestAnimationFrame(() => {
      grid.querySelectorAll('.result-tile').forEach((t, i) => {
        t.style.animationDelay = Math.min(i * 40, 400) + 'ms';
        t.classList.add('is-visible');
      });
    });
    _tileBuffers[gid] = [];
  }
}

/** v4.0: appendGridLabel — also buffered for consistent ordering */
function appendGridLabel(text, targetGridId) {
  const gid = targetGridId;
  if (!gid) return;
  if (!_tileBuffers[gid]) _tileBuffers[gid] = [];
  const el = document.createElement('div');
  el.className = 'grid-section-label';
  el.textContent = text;
  _tileBuffers[gid].push(el);
}

/** Planes of Expression — Visualisierungs-Tile (v4.0 with routing) */
function appendPlanesTile(planes, targetGridId) {
  const grid = document.getElementById(targetGridId || 'acc-talents-grid');
  if (!grid) return;
  const { mental, emotional, physical, intuitive } = planes;
  const total    = mental + emotional + physical + intuitive || 1;
  const maxCount = Math.max(mental, emotional, physical, intuitive);
  const entries  = [
    { key:'mental',    label:'Mental',    count:mental,    color:'var(--life)', shortDesc:'Logik, Sprache & Ideen' },
    { key:'emotional', label:'Emotional', count:emotional, color:'var(--soul)', shortDesc:'Gefühle & Kreativität' },
    { key:'physical',  label:'Physisch',  count:physical,  color:'var(--expr)', shortDesc:'Materie & Struktur' },
    { key:'intuitive', label:'Intuitiv',  count:intuitive, color:'var(--pers)', shortDesc:'Spiritualität & Innenschau' },
  ];
  const dominants   = entries.filter(e => e.count === maxCount && e.count > 0).map(e => e.label);
  const dominantStr = dominants.length ? dominants.join(' & ') : 'Ausgeglichen';
  const encoded     = [mental, emotional, physical, intuitive].join(',');

  const tile = document.createElement('article');
  tile.className = 'result-tile planes-tile';
  tile.setAttribute('data-modal-type',  'plane');
  tile.setAttribute('data-modal-value', encoded);
  tile.style.cursor = 'pointer';

  const titleEl = document.createElement('div');
  titleEl.className = 'result-title';
  const span = document.createElement('span');
  span.textContent = 'Ausdrucks-Ebenen';
  const btn = document.createElement('button');
  btn.className = 'tooltip-btn'; btn.type = 'button';
  btn.setAttribute('data-tooltip', 'Wie dein Name energetisch aufgeteilt ist. Klicke für Details.');
  btn.setAttribute('aria-label', 'Info zu Ausdrucks-Ebenen');
  btn.textContent = 'ℹ';
  titleEl.appendChild(span); titleEl.appendChild(btn);

  const barsEl = document.createElement('div');
  barsEl.className = 'planes-bars';
  entries.forEach(({ label, count, color, shortDesc }) => {
    const barW  = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
    const pct   = Math.round((count / total) * 100);
    const isDom = count === maxCount && count > 0;
    const row   = document.createElement('div');
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

  const gid = targetGridId || 'acc-talents-grid';
  if (!_tileBuffers[gid]) _tileBuffers[gid] = [];
  _tileBuffers[gid].push(tile);
}

/** Lo-Shu Tile (v4.0 with routing) */
function appendLoShuTile(date, targetGridId) {
  const grid = document.getElementById(targetGridId || 'acc-soul-grid');
  if (!grid) return;

  const freq        = calculateLoShu(date);
  const activeLines = loShuLines(freq);
  const encoded     = Object.values(freq).join(',');

  const tile = document.createElement('article');
  tile.className = 'result-tile lo-shu-tile';
  tile.setAttribute('data-modal-type',  'loShu');
  tile.setAttribute('data-modal-value', encoded);
  tile.style.cursor = 'pointer';

  const titleEl = document.createElement('div');
  titleEl.className = 'result-title lo-shu-title';
  titleEl.innerHTML =
    '<span>Lo-Shu Psychomatrix</span>'
    + '<button class="tooltip-btn" type="button" data-tooltip="Das magische Quadrat deines Geburtsdatums — zeigt welche Energien aktiv, fehlend oder dominant sind." aria-label="Info zu Lo-Shu">ℹ</button>';

  const gridEl = document.createElement('div');
  gridEl.className = 'lo-shu-grid';

  LO_SHU_LAYOUT.forEach(row => {
    row.forEach(num => {
      const count = freq[num];
      const cell  = document.createElement('div');
      cell.className = 'lo-shu-cell'
        + (count === 0 ? ' lo-shu-cell--missing' : '')
        + (count >= 3  ? ' lo-shu-cell--strong'  : '');
      cell.setAttribute('aria-label', `Zahl ${num}: ${count}× vorhanden`);
      const numEl  = document.createElement('span');
      numEl.className = 'lo-shu-num';
      numEl.textContent = num;
      const dotsEl = document.createElement('span');
      dotsEl.className = 'lo-shu-dots';
      if (count === 0) { dotsEl.textContent = '–'; dotsEl.style.opacity = '0.3'; }
      else { dotsEl.textContent = '●'.repeat(Math.min(count, 4)) + (count > 4 ? `+${count-4}` : ''); }
      cell.appendChild(numEl);
      cell.appendChild(dotsEl);
      gridEl.appendChild(cell);
    });
  });

  const linesEl = document.createElement('div');
  linesEl.className = 'lo-shu-lines';
  linesEl.textContent = activeLines.length === 0
    ? 'Keine vollständigen Linien · Klicken für Details'
    : `${activeLines.length} aktive Linie${activeLines.length > 1 ? 'n' : ''}: ${activeLines.join(' · ')} · Details anklicken`;

  tile.appendChild(titleEl);
  tile.appendChild(gridEl);
  tile.appendChild(linesEl);
  const loGid = targetGridId || 'acc-soul-grid';
  if (!_tileBuffers[loGid]) _tileBuffers[loGid] = [];
  _tileBuffers[loGid].push(tile);
}
function appendQuantumTile(name, date, targetGridId) {
  const grid = document.getElementById(targetGridId || 'acc-talents-grid');
  if (!grid) return;

  const result = calculateQuantumScore(name, date);
  const score  = result.score;
  const pct    = score.toFixed(1);

  let color;
  if (score >= 80)      color = 'var(--gold-bright)';
  else if (score >= 60) color = 'var(--life)';
  else if (score >= 40) color = 'var(--soul)';
  else                  color = 'var(--pers)';

  const interpretation = interpretQuantumScore(result);

  /* Store full result for modal */
  const encodedResult = JSON.stringify({
    score,
    avg:      result.avg,
    variance: result.variance,
    spread:   result.spread,
    values:   result.values,
  });

  const tile = document.createElement('article');
  tile.className = 'result-tile quantum-tile';
  tile.setAttribute('data-modal-type',  'quantum');
  tile.setAttribute('data-modal-value', pct);
  tile.setAttribute('data-quantum-result', encodedResult);
  tile.style.cursor = 'pointer';

  tile.innerHTML =
    '<div class="result-title">'
    +   '<span>Quantum Score</span>'
    +   '<button class="tooltip-btn" type="button" data-tooltip="Harmonie-Score zwischen Lebenszahl, Seele und Ausdruck — berechnet über Varianz & Spread. Klicke für Details." aria-label="Info">ℹ</button>'
    + '</div>'
    + '<div class="quantum-gauge">'
    +   '<div class="quantum-bar-track">'
    +     '<div class="quantum-bar-fill" style="width:' + score + '%;background:' + color + '"></div>'
    +   '</div>'
    +   '<div class="quantum-score-value" style="color:' + color + '">' + pct + '%</div>'
    + '</div>'
    + '<div class="result-explanation quantum-interpretation">' + interpretation + '</div>'
    + '<div class="quantum-meta">'
    +   '<span class="quantum-meta-item">Leben: ' + result.values.life + '</span>'
    +   '<span class="quantum-meta-sep">·</span>'
    +   '<span class="quantum-meta-item">Seele: ' + result.values.soul + '</span>'
    +   '<span class="quantum-meta-sep">·</span>'
    +   '<span class="quantum-meta-item">Ausdruck: ' + result.values.expression + '</span>'
    + '</div>';

  const qGid = targetGridId || 'acc-talents-grid';
  if (!_tileBuffers[qGid]) _tileBuffers[qGid] = [];
  _tileBuffers[qGid].push(tile);
}

function animateTiles(gridId) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.querySelectorAll('.result-tile').forEach((tile, i) => {
    tile.style.animationDelay = Math.min(i * 40, 400) + 'ms';
    requestAnimationFrame(() => tile.classList.add('is-visible'));
  });
}

/** Update accordion count badges */
function updateAccordionCounts() {
  [
    ['acc-talents-grid',   'acc-talents-count'],
    ['acc-lifecycle-grid', 'acc-lifecycle-count'],
    ['acc-soul-grid',      'acc-soul-count'],
    ['acc-now-grid',       'acc-now-count'],
  ].forEach(([gridId, countId]) => {
    const grid  = document.getElementById(gridId);
    const badge = document.getElementById(countId);
    if (!grid || !badge) return;
    const count = grid.querySelectorAll('.result-tile').length;
    badge.textContent = count > 0 ? count + ' Zahlen' : '';
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
  ['acc-talents-grid','acc-lifecycle-grid','acc-soul-grid','acc-now-grid'].forEach(id => {
    const g = document.getElementById(id);
    if (g) g.innerHTML = '';
    _tileBuffers[id] = [];
  });
  /* Close all accordions */
  document.querySelectorAll('.acc-header[aria-expanded="true"]').forEach(h => {
    h.setAttribute('aria-expanded', 'false');
    const bodyId = h.getAttribute('aria-controls');
    const body   = bodyId ? document.getElementById(bodyId) : null;
    if (body) body.hidden = true;
  });
  updateAccordionCounts();
  const ra = document.getElementById('resultActions');
  if (ra) ra.hidden = true;
}


/* ═══════════════════════════════════════════════════════════
   19. MODAL
   ═══════════════════════════════════════════════════════════ */

function openModal(type, displayValue, sourceTile) {
  const modal   = document.getElementById('detailModal');
  const details = MODAL_DETAILS[type];
  if (!modal || !details) return;

  document.getElementById('modalIcon').textContent       = details.icon || '✦';
  document.getElementById('modalNumberType').textContent = details.title;
  document.getElementById('modalCalc').textContent       = details.calc || '';

  /* ── Sonderfall: Ausdrucks-Ebenen ── */
  if (type === 'plane') {
    const [m, em, ph, it] = (displayValue || '0,0,0,0').split(',').map(Number);
    const total    = m + em + ph + it || 1;
    const maxCount = Math.max(m, em, ph, it);
    const pd       = details.planeData;
    const entries  = [
      { key:'mental',    count:m  },
      { key:'emotional', count:em },
      { key:'physical',  count:ph },
      { key:'intuitive', count:it },
    ];
    const dominants   = entries.filter(e => e.count === maxCount && e.count > 0).map(e => pd[e.key].label);
    const dominantStr = dominants.length ? dominants.join(' & ') : 'Ausgeglichen';

    document.getElementById('modalValue').textContent  = dominantStr;
    document.getElementById('modalValue').className    = 'modal-value modal-value--plane';
    document.getElementById('modalShortExpl').textContent =
      'Dominante Ausdrucksebene · ' + Math.round((maxCount / total) * 100) + '% aller Buchstaben';

    let html = '<div class="modal-planes">';
    entries.forEach(({ key, count }) => {
      const { label, color, desc } = pd[key];
      const barW  = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
      const pct   = Math.round((count / total) * 100);
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

  /* ── NEU v3.0: Lo-Shu Modal ── */
  if (type === 'loShu') {
    const freqArr = (displayValue || '').split(',').map(Number);
    const freq    = {};
    freqArr.forEach((v, i) => { freq[i + 1] = v; });

    document.getElementById('modalValue').textContent  = '⊞';
    document.getElementById('modalValue').className    = 'modal-value modal-value--plane';
    document.getElementById('modalShortExpl').textContent = 'Psychomatrix deines Geburtsdatums — magisches Quadrat der Zahlen 1–9';

    const missing  = Object.entries(freq).filter(([,v]) => v === 0).map(([k]) => k);
    const strong   = Object.entries(freq).filter(([,v]) => v >= 3).map(([k,v]) => `${k}(${v}×)`);
    const activeL  = loShuLines(freq);

    let html = '<div class="modal-lo-shu">';

    // 3×3 Gitter im Modal
    html += '<div class="modal-lo-shu-grid">';
    LO_SHU_LAYOUT.forEach(row => {
      row.forEach(num => {
        const count = freq[num] || 0;
        const cls = 'modal-lo-shu-cell'
          + (count === 0 ? ' lo-shu-cell--missing' : '')
          + (count >= 3  ? ' lo-shu-cell--strong'  : '');
        const dots = count === 0 ? '–' : '●'.repeat(Math.min(count, 4)) + (count > 4 ? `+${count-4}` : '');
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
    document.getElementById('modalExtended').innerHTML = html;
    modal.showModal();
    document.getElementById('modalClose').focus();
    return;
  }

  /* ── NEU v3.0: Quantum Score Modal ── */
  if (type === 'quantum') {
    /* Use the tile that was actually clicked, not the first in DOM */
    const quantumTile = sourceTile || document.querySelector('[data-modal-type="quantum"][data-quantum-result]');
    let result = null;
    if (quantumTile) {
      try { result = JSON.parse(quantumTile.getAttribute('data-quantum-result')); } catch(e) {}
    }

    const score = result ? result.score : (parseFloat(displayValue) || 0);
    document.getElementById('modalValue').textContent = score.toFixed(1) + '%';
    document.getElementById('modalValue').className   = 'modal-value';

    const shortLabel =
      score >= 80 ? 'Außergewöhnliche Resonanz deiner Kernzahlen'
      : score >= 60 ? 'Starke Kohärenz zwischen Lebensweg, Seele und Ausdruck'
      : score >= 40 ? 'Gute Balance mit Entwicklungspotenzial'
      : 'Starke innere Spannung — und enormes Wachstumspotenzial';
    document.getElementById('modalShortExpl').textContent = shortLabel;

    let extText = result
      ? interpretQuantumScore(result)
        + '\n\nKernzahlen: Leben ' + result.values.life
        + ' · Seele ' + result.values.soul
        + ' · Ausdruck ' + result.values.expression
        + '\nDurchschnitt: ' + result.avg
        + ' · Varianz: ' + result.variance
        + ' · Spread: ' + result.spread
      : 'Der Score misst die Harmonie (Varianz & Spread) deiner drei Kernzahlen. '
        + 'Je enger sie beieinander liegen, desto höher der Score.';
    document.getElementById('modalExtended').textContent = extText;

    try { modal.showModal(); } catch(e) { modal.setAttribute('open',''); modal.style.display='flex'; }
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

  try { modal.showModal(); } catch(e) { modal.setAttribute('open',''); modal.style.display='flex'; }
  document.getElementById('modalClose').focus();
}

function initModal() {
  const modal    = document.getElementById('detailModal');
  const closeBtn = document.getElementById('modalClose');
  if (!modal) return;
  closeBtn?.addEventListener('click', () => modal.close());
  modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.open) modal.close(); });
  document.addEventListener('click', e => {
    const tile = e.target.closest('[data-modal-type]');
    if (!tile || e.target.closest('.tooltip-btn')) return;
    openModal(tile.dataset.modalType, tile.dataset.modalValue, tile);
  });
}


/* ═══════════════════════════════════════════════════════════
   20. SHARE / PRINT / TOAST
   ═══════════════════════════════════════════════════════════ */

function buildShareText() {
  const p    = new URLSearchParams(window.location.search);
  const name = p.get('name') || '';
  const date = p.get('date') || '';
  let text   = '';
  if (date) {
    try {
      const lifeVal = formatLifePathComponent(date);
      const arch    = getArchetype('life', lifeVal);
      const { base } = parseDisplayValue(lifeVal);
      const meaning   = EXPLANATIONS.life[base] || '';
      if (arch && arch.title) {
        text += '✦ Meine Lebenszahl ist die ' + lifeVal + ' – ' + arch.title + '.';
      } else {
        text += '✦ Meine Lebenszahl ist die ' + lifeVal + (meaning ? ' – ' + meaning : '') + '.';
      }
      if (arch && arch.teaser) {
        // Erste 60 Zeichen des Teasers
        const short = arch.teaser.length > 70 ? arch.teaser.substring(0, 67) + '...' : arch.teaser;
        text += '\n' + short;
      }
    } catch(e) {
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
  history.replaceState(null, '', '?' + new URLSearchParams({ name, date }).toString());
}
function loadFromURL() {
  const p  = new URLSearchParams(window.location.search);
  const n  = p.get('name'), d = p.get('date');
  const ne = document.getElementById('name'), de = document.getElementById('birthdate');
  if (n && ne) ne.value = n;
  if (d && de) de.value = d;
  return !!(n && d);
}
async function handleShare() {
  const url = window.location.href;
  try {
    if (navigator.share) { await navigator.share({ title: 'Mein Numerologie-Profil', url }); }
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
   21. THEME TOGGLE
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
    btn.setAttribute('aria-label', next === 'dark' ? 'Light Mode' : 'Dark Mode');
  });
}


/* ═══════════════════════════════════════════════════════════
   22. VALIDIERUNG
   ═══════════════════════════════════════════════════════════ */

function validateName(name) {
  if (!name || !name.trim()) return { ok: false, msg: 'Bitte Name eingeben.' };
  if (!/^[A-Za-zÄÖÜäöüßẞ\s'\-]+$/.test(name)) return { ok: false, msg: "Nur Buchstaben, Leerzeichen, - und ' erlaubt." };
  if (!/[A-Za-zÄÖÜäöüßẞ]/.test(name))         return { ok: false, msg: 'Bitte einen gültigen Namen eingeben.' };
  return { ok: true, msg: '' };
}


/* ═══════════════════════════════════════════════════════════
   23. HAUPTFORM-CONTROLLER  v4.0
   Engine 100% unverändert.
   Neu: Loading Overlay · Accordion-Routing · Canvas Share Card
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

  /* Date auto-format */
  dateInput.addEventListener('input', function(e) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 8);
    let formatted = raw;
    if (raw.length > 4)      formatted = raw.slice(0,2) + '.' + raw.slice(2,4) + '.' + raw.slice(4);
    else if (raw.length > 2) formatted = raw.slice(0,2) + '.' + raw.slice(2);
    if (e.target.value !== formatted) {
      e.target.value = formatted;
      try { e.target.setSelectionRange(formatted.length, formatted.length); } catch(err) {}
    }
    updateFormState();
  });

  resetBtn?.addEventListener('click', () => {
    requestAnimationFrame(() => {
      nameErrEl.textContent = '';
      dateErrEl.textContent = '';
      nameInput.classList.remove('input-invalid', 'input-valid');
      dateInput.classList.remove('input-invalid', 'input-valid');
      if (calcBtn) calcBtn.disabled = false;
      clearResults();
      const hEl = document.getElementById('resultsHint');
      if (hEl) hEl.style.display = 'none';
      const _sbw = document.getElementById('shareBarWrap');
      if (_sbw) _sbw.hidden = true;
      const _ctaw = document.getElementById('ctaBarWrap');
      if (_ctaw) _ctaw.hidden = true;
      const _cmpw = document.getElementById('compareWrap');
      if (_cmpw) _cmpw.hidden = true;
      document.querySelectorAll('.result-teaser, .tile-tap-hint, .tile-archetype-label').forEach(el => el.remove());
      const _lhd = document.getElementById('lifeHeroDisplay');
      if (_lhd) _lhd.hidden = true;
      const _re = document.getElementById('resultsEmpty');
      if (_re) _re.style.display = '';
      const _lt = document.getElementById('lifeTile');
      if (_lt) _lt.classList.remove('life-number--hero');
      const _acc = document.getElementById('accordions');
      if (_acc) _acc.hidden = true;
      history.replaceState(null, '', window.location.pathname);
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!updateFormState()) return;

    /* ── Loading Overlay ── */
    const overlay    = document.getElementById('loadingOverlay');
    const loadingMsg = document.getElementById('loadingMsg');
    const loadingBar = document.getElementById('loadingBar');
    const msgs = [
      'Name wird analysiert…',
      'Archetypus wird berechnet…',
      'Lebenszahlen werden ermittelt…',
      'Karma wird gelesen…',
      'Ergebnisse werden aufbereitet…',
    ];
    let msgIdx = 0;
    if (overlay) {
      overlay.hidden = false;
      // small delay so display:block takes effect before transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => overlay.classList.add('is-active'));
      });
      if (loadingMsg) loadingMsg.textContent = msgs[0];
    }
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % msgs.length;
      if (loadingMsg) loadingMsg.textContent = msgs[msgIdx];
    }, 600);
    let progress = 0;
    const barInterval = setInterval(() => {
      progress = Math.min(progress + Math.random() * 18, 88);
      if (loadingBar) loadingBar.style.width = progress + '%';
    }, 200);

    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    await new Promise(r => setTimeout(r, 340));

    const name = nameInput.value.trim();
    const date = dateInput.value.trim();

    /* ══ KERNZAHLEN ══ */
    const expressionSum  = calculateExpressionSum(name);
    const soulSum        = calculateSoulSum(name);
    const personalitySum = calculatePersonalitySum(name);
    const birthdayRaw    = calculateBirthdaySum(date);
    const lifeVal        = formatLifePathComponent(date);
    const lifeComponentNum = calculateLifePathComponent(date);
    const expressionVal  = formatValue(expressionSum);
    const soulVal        = formatValue(soulSum);
    const personalityVal = formatValue(personalitySum);

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

    const lifeDetails = MODAL_DETAILS['life'];
    if (lifeDetails) lifeDetails.calc = 'Komponenten-Methode: ' + lifePathComponentDetails(date);

    animateTiles('resultsGrid');

    const emptyEl = document.getElementById('resultsEmpty');
    if (emptyEl) emptyEl.style.display = 'none';

    /* ── LIFE HERO DISPLAY ── */
    (function() {
      const heroDisp  = document.getElementById('lifeHeroDisplay');
      const heroNum   = document.getElementById('lifeHeroNum');
      const heroArch  = document.getElementById('lifeHeroArchetype');
      const heroBadge = document.getElementById('lifeHeroBadge');
      const heroTeaser= document.getElementById('lifeHeroTeaser');
      const heroBtn   = document.getElementById('lifeHeroDetailBtn');
      if (!heroDisp) return;
      if (heroNum) {
        heroNum.textContent = lifeVal;
        heroNum.classList.toggle('master', MASTER_NUMBERS.has(parseDisplayValue(lifeVal).master ?? parseDisplayValue(lifeVal).base));
        heroNum.classList.remove('num-animate');
        void heroNum.offsetWidth;
        heroNum.classList.add('num-animate');
      }
      const arch = getArchetype('life', lifeVal);
      if (arch) {
        if (heroArch)   heroArch.textContent   = arch.title;
        if (heroTeaser) heroTeaser.textContent = arch.teaser;
        if (heroBadge && arch.badge) {
          heroBadge.textContent = arch.badge;
          heroBadge.className = 'life-hero-badge' + (arch.badge.includes('Masterzahl') ? ' life-hero-badge--master' : '');
          heroBadge.hidden = false;
        } else if (heroBadge) { heroBadge.hidden = true; }
      }
      if (heroBtn) heroBtn.onclick = () => openModal('life', lifeVal);
      heroDisp.hidden = false;
    })();

    /* ── Archetypus-Labels auf Sekundär-Tiles ── */
    [['expressionTile','expression',expressionVal],
     ['soulTile','soul',soulVal],
     ['personalityTile','personality',personalityVal]]
    .forEach(([tileId, type, val]) => {
      const t = document.getElementById(tileId);
      if (!t) return;
      const arch = getArchetype(type, val);
      const archTitle = arch ? (arch.title || (typeof arch === 'string' ? arch : null)) : null;
      if (archTitle) {
        let la = t.querySelector('.tile-archetype-label');
        if (!la) {
          la = document.createElement('div');
          la.className = 'tile-archetype-label';
          const valEl = t.querySelector('.result-value');
          if (valEl && valEl.nextSibling) t.insertBefore(la, valEl.nextSibling);
          else t.appendChild(la);
        }
        la.textContent = archTitle;
      }
    });

    const hintEl = document.getElementById('resultsHint');
    if (hintEl) { hintEl.textContent = '✦ Tippe auf eine Zahl für die vollständige Deutung'; hintEl.style.display = 'flex'; }

    /* ── Accordion-Grids leeren ── */
    ['acc-talents-grid','acc-lifecycle-grid','acc-soul-grid','acc-now-grid'].forEach(id => {
      const g = document.getElementById(id);
      if (g) g.innerHTML = '';
    });

    const lifePR          = reduceForceSingle(lifeComponentNum);
    const birthdayDisplay = formatValue(birthdayRaw);
    const maturitySum     = calculateMaturitySum(reduceForceSingle(lifeComponentNum), expressionSum);
    const maturityDisplay = formatValue(maturitySum);

    /* ══ TALENTE → acc-talents-grid ══ */
    appendExtraTile('Geburtstagszahl',  birthdayDisplay, 'Besondere Begabung des Geburtstages',    'birthday',        'birthday',        false, 'acc-talents-grid');
    appendExtraTile('Reifezahl',        maturityDisplay, 'Lebenszahl + Ausdruckszahl',              'maturity',        'maturity',        false, 'acc-talents-grid');
    const hiddenPassion   = calculateHiddenPassion(name);
    const cornerstone     = calculateCornerstone(name);
    const capstone        = calculateCapstone(name);
    const firstImpression = calculateFirstImpression(name);
    appendExtraTile('Hidden Passion',   hiddenPassion,               'Häufigste Zahl(en) im Namen',              'hiddenPassion',   'hiddenPassion',   false, 'acc-talents-grid');
    appendExtraTile('Cornerstone',      String(cornerstone),         'Erster Buchstabe des Vornamens',           'cornerstone',     'cornerstone',     false, 'acc-talents-grid');
    appendExtraTile('Capstone',         String(capstone),            'Letzter Buchstabe des Nachnamens',         'capstone',        'capstone',        false, 'acc-talents-grid');
    appendExtraTile('First Impression', formatValue(firstImpression),'Erste Buchstaben Vor- & Nachname',         'firstImpression', 'firstImpression', false, 'acc-talents-grid');
    /* Bridges */
    const lpBridge = calculateLifePathBridge(calculateLifeSum(date), expressionSum);
    const spBridge = calculateSoulPersonalityBridge(soulSum, personalitySum);
    appendExtraTile('Life Path Bridge',        String(lpBridge), '|Lebenszahl − Ausdruckszahl|',        'bridge', 'bridge', false, 'acc-talents-grid');
    appendExtraTile('Soul-Personality Bridge', String(spBridge), '|Seelenzahl − Persönlichkeitszahl|',  'bridge', 'bridge', false, 'acc-talents-grid');
    /* Planes + Quantum */
    appendPlanesTile(calculatePlanesOfExpression(name), 'acc-talents-grid');
    appendQuantumTile(name, date, 'acc-talents-grid');

    /* ══ LEBENSPHASEN → acc-lifecycle-grid ══ */
    const lc  = calculateLifeCycles(date);
    appendExtraTile('Life Cycle 1', formatValue(lc.lc1), 'Geburtsmonat — Kindheit & Jugend', 'lifeCycle', 'lifeCycle', false, 'acc-lifecycle-grid');
    appendExtraTile('Life Cycle 2', formatValue(lc.lc2), 'Geburtstag — Erwachsenenphase',    'lifeCycle', 'lifeCycle', false, 'acc-lifecycle-grid');
    appendExtraTile('Life Cycle 3', formatValue(lc.lc3), 'Geburtsjahr — spätes Leben',       'lifeCycle', 'lifeCycle', false, 'acc-lifecycle-grid');
    const pn  = calculatePinnacles(date);
    const p1e = 36 - lifePR;
    appendExtraTile('Höhepunkt 1 (bis '         + p1e + ')',             formatValue(pn.p1), 'Jugend & junges Erwachsensein', 'pinnacle', 'pinnacle', false, 'acc-lifecycle-grid');
    appendExtraTile('Höhepunkt 2 (' + p1e       + '–' + (p1e+9)  + ')', formatValue(pn.p2), 'Junges Erwachsensein',          'pinnacle', 'pinnacle', false, 'acc-lifecycle-grid');
    appendExtraTile('Höhepunkt 3 (' + (p1e+9)   + '–' + (p1e+18) + ')', formatValue(pn.p3), 'Mittleres Lebensalter',         'pinnacle', 'pinnacle', false, 'acc-lifecycle-grid');
    appendExtraTile('Höhepunkt 4 (ab '          + (p1e+18) + ')',        formatValue(pn.p4), 'Reifes Lebensalter',            'pinnacle', 'pinnacle', false, 'acc-lifecycle-grid');
    const ch = calculateChallenges(date);
    appendExtraTile('Herausforderung 1', String(ch.c1), 'Erste Lebenshälfte',          'challenge', 'challenge', false, 'acc-lifecycle-grid');
    appendExtraTile('Herausforderung 2', String(ch.c2), 'Zweite Lebenshälfte',         'challenge', 'challenge', false, 'acc-lifecycle-grid');
    appendExtraTile('Herausforderung 3', String(ch.c3), 'Gesamte Lebensaufgabe',       'challenge', 'challenge', false, 'acc-lifecycle-grid');
    appendExtraTile('Herausforderung 4', String(ch.c4), 'Lebenslange Herausforderung', 'challenge', 'challenge', false, 'acc-lifecycle-grid');

    /* ══ KARMA & PSYCHE → acc-soul-grid ══ */
    const karmicLessons = calculateKarmicLessons(name);
    if (karmicLessons.length === 0) {
      appendExtraTile('Karm. Lektionen', '–', 'Keine fehlenden Zahlen im Namen', null, null, false, 'acc-soul-grid');
    } else {
      karmicLessons.forEach(n =>
        appendExtraTile('Karm. Lektion ' + n, String(n), 'Im Namen fehlende Energie', 'karmic', 'karmic', false, 'acc-soul-grid')
      );
    }
    const debtSources = [['Lebenszahl', calculateLifeSum(date)], ['Ausdruckszahl', expressionSum], ['Geburtstag', birthdayRaw]];
    const foundDebts  = new Set();
    debtSources.forEach(([label, rawSum]) => {
      const debt = findKarmicDebt(rawSum);
      if (debt && !foundDebts.has(debt)) {
        foundDebts.add(debt);
        appendExtraTile('Karm. Schuld (' + label + ')', String(debt),
          EXPLANATIONS.karmicDebt[debt] || '', 'karmicDebt', 'karmicDebt', true, 'acc-soul-grid');
      }
    });
    const balanceDisplay = formatValue(calculateBalanceSum(name));
    const subcVal        = calculateSubconscious(name);
    const rationalVal    = calculateRationalThought(date, expressionSum);
    appendExtraTile('Balancezahl',      balanceDisplay,           'Summe der Namensinitiale',        'balance',        'balance',        false, 'acc-soul-grid');
    appendExtraTile('Unterbewusstsein', String(subcVal),          '9 − fehlende Zahlen im Namen',    'subconscious',   'subconscious',   false, 'acc-soul-grid');
    appendExtraTile('Rational Thought', formatValue(rationalVal), 'Geburtstagszahl + Ausdruckszahl', 'rationalThought','rationalThought', false, 'acc-soul-grid');
    appendLoShuTile(date, 'acc-soul-grid');

    /* ══ AKTUELLER MOMENT → acc-now-grid ══ */
    const pyRaw  = getPersonalYearRawSum(date);
    const pyDisp = getPersonalYearDisplay(date);
    const pmVal  = calculatePersonalMonth(pyRaw);
    const pdVal  = calculatePersonalDay(pmVal);
    appendExtraTile('Pers. Jahr',  pyDisp,             'Geburtsmonat + Geburtstag + Jahresquersumme', 'personalYear',  'personalYear',  false, 'acc-now-grid');
    appendExtraTile('Pers. Monat', formatValue(pmVal), 'Pers. Jahr + aktueller Monat',                'personalMonth', 'personalMonth', false, 'acc-now-grid');
    appendExtraTile('Pers. Tag',   formatValue(pdVal), 'Pers. Monat + heutiger Tag',                  'personalDay',   'personalDay',   false, 'acc-now-grid');

    /* ── Flush all buffered tiles into DOM in one pass ── */
    flushTileBuffers();

    /* ── Accordion Counts & Sichtbarkeit ── */
    updateAccordionCounts();
    const accEl = document.getElementById('accordions');
    if (accEl) accEl.hidden = false;

    /* ── Loading Overlay ausblenden ── */
    clearInterval(msgInterval);
    clearInterval(barInterval);
    if (loadingBar) loadingBar.style.width = '100%';
    setTimeout(() => {
      if (overlay) {
        overlay.classList.remove('is-active');
        setTimeout(() => {
          overlay.hidden = true;
          if (loadingBar) loadingBar.style.width = '0%';
        }, 280);
      }
    }, 300);

    /* ── Teaser + Tap-Hints ── */
    [['expressionTile','expression',expressionVal],
     ['soulTile','soul',soulVal],
     ['personalityTile','personality',personalityVal]]
    .forEach(([tileId, type, val]) => {
      const t = document.getElementById(tileId);
      if (!t) return;
      if (!t.querySelector('.tile-tap-hint')) {
        const h = document.createElement('span');
        h.className = 'tile-tap-hint';
        h.textContent = 'Details →';
        t.appendChild(h);
      }
      const extended = getModalExtended(type, val);
      if (!extended) return;
      const teaser = extended.split('.')[0].trim() + '.';
      let tEl = t.querySelector('.result-teaser');
      if (!tEl) {
        tEl = document.createElement('div');
        tEl.className = 'result-teaser';
        t.appendChild(tEl);
      }
      tEl.textContent = teaser;
    });

    /* ── Share Bar ── */
    const shareTextEl = document.getElementById('shareBarText');
    if (shareTextEl) {
      const lifeArch     = getArchetype('life', lifeVal);
      const { base: lb } = parseDisplayValue(lifeVal);
      const lifeMeaning  = EXPLANATIONS.life[lb] || '';
      const { base: sb } = parseDisplayValue(formatValue(soulSum));
      const soulMeaning  = EXPLANATIONS.soul[sb] || '';
      const archName     = lifeArch && lifeArch.title ? lifeArch.title : '';
      shareTextEl.innerHTML =
        'Meine <strong>Lebenszahl</strong> ist die <strong>' + lifeVal + '</strong>'
        + (archName ? ' – <strong>' + archName + '</strong>' : (lifeMeaning ? ' – ' + lifeMeaning : ''))
        + '. Meine <strong>Seelenzahl</strong>: <strong>' + formatValue(soulSum) + '</strong>'
        + (soulMeaning ? ' – ' + soulMeaning : '') + '.';
    }
    const shareBarWrapEl = document.getElementById('shareBarWrap');
    if (shareBarWrapEl) shareBarWrapEl.hidden = false;

    /* ── Pulse-Hint ── */
    setTimeout(() => {
      ['lifeTile','expressionTile','soulTile','personalityTile'].forEach(id => {
        const el = document.getElementById(id);
        if (el && el.hasAttribute('data-modal-type')) {
          el.classList.remove('pulse-hint');
          void el.offsetWidth;
          el.classList.add('pulse-hint');
          el.addEventListener('animationend', () => el.classList.remove('pulse-hint'), { once: true });
        }
      });
    }, 1200);

    const ctaBarWrapEl  = document.getElementById('ctaBarWrap');
    if (ctaBarWrapEl) ctaBarWrapEl.hidden = false;
    const compareWrapEl = document.getElementById('compareWrap');
    if (compareWrapEl) compareWrapEl.hidden = false;

    updateShareURL(name, date);
    const ra = document.getElementById('resultActions');
    if (ra) ra.hidden = false;

    const cn1 = document.getElementById('compareName1');
    const cd1 = document.getElementById('compareDate1');
    if (cn1) cn1.value = name;
    if (cd1) cd1.value = date;

    /* ── Scroll zu Ergebnissen ── */
    setTimeout(() => {
      const anchor = document.getElementById('lifeHeroDisplay') || document.getElementById('resultsAnchor');
      if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 400);
  });

  updateFormState();
  const hasURLData = loadFromURL();
  if (hasURLData) {
    updateFormState();
    setTimeout(() => { if (updateFormState()) form.dispatchEvent(new Event('submit')); }, 120);
  }
}


/* ═══════════════════════════════════════════════════════════
   24. VERGLEICHS-CONTROLLER (unchanged)
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
      life:        reduceForceSingle(calculateLifePathComponent(dt)),
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
   25. CANVAS SHARE CARD  v4.0
   Erstellt eine 1080x1080 Grafik für Social Sharing.
   ═══════════════════════════════════════════════════════════ */

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
  if (!text) return y;
  const words = text.split(' ');
  let line = '';
  for (let i = 0; i < words.length; i++) {
    const test = line + words[i] + ' ';
    if (ctx.measureText(test).width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), x, y);
      line = words[i] + ' ';
      y += lineHeight;
    } else { line = test; }
  }
  if (line.trim()) ctx.fillText(line.trim(), x, y);
  return y;
}

function drawShareCard(name, lifeVal, archTitle, teaser) {
  const canvas = document.getElementById('shareCardCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 1080, H = 1080;

  /* Background */
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#07070f');
  bg.addColorStop(1, '#0c0c1c');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  /* Subtle grid */
  ctx.strokeStyle = 'rgba(124,58,237,0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  /* Center gold glow behind number */
  const glow = ctx.createRadialGradient(W/2, H * 0.38, 0, W/2, H * 0.38, 380);
  glow.addColorStop(0, 'rgba(245,158,11,0.16)');
  glow.addColorStop(0.5, 'rgba(124,58,237,0.06)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  /* Top divider line */
  const topLine = ctx.createLinearGradient(0, 0, W, 0);
  topLine.addColorStop(0,   'transparent');
  topLine.addColorStop(0.25,'rgba(245,158,11,0.45)');
  topLine.addColorStop(0.75,'rgba(245,158,11,0.45)');
  topLine.addColorStop(1,   'transparent');
  ctx.strokeStyle = topLine;
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, 80); ctx.lineTo(W, 80); ctx.stroke();

  /* Brand mark top */
  ctx.fillStyle = 'rgba(245,158,11,0.55)';
  ctx.font = '500 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('✦  NUMEROLOGIE', W/2, 54);

  /* Eyebrow */
  ctx.fillStyle = 'rgba(167,139,250,0.55)';
  ctx.font = '400 26px sans-serif';
  ctx.fillText('DEIN LEBENSWEG', W/2, H * 0.19);

  /* Big life number */
  const numGrad = ctx.createLinearGradient(W/2 - 160, 0, W/2 + 160, 0);
  numGrad.addColorStop(0,   '#c8891e');
  numGrad.addColorStop(0.5, '#f5c842');
  numGrad.addColorStop(1,   '#c8891e');
  ctx.fillStyle = numGrad;
  ctx.shadowColor = 'rgba(245,158,11,0.60)';
  ctx.shadowBlur  = 80;
  ctx.font = 'bold 300px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(lifeVal || '?', W/2, H * 0.50);
  ctx.shadowBlur = 0;

  /* Thin separator */
  const sep = ctx.createLinearGradient(W*0.2, 0, W*0.8, 0);
  sep.addColorStop(0, 'transparent');
  sep.addColorStop(0.5, 'rgba(245,158,11,0.28)');
  sep.addColorStop(1, 'transparent');
  ctx.strokeStyle = sep;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(W*0.2, H*0.555); ctx.lineTo(W*0.8, H*0.555); ctx.stroke();

  /* Archetype */
  ctx.shadowColor = 'rgba(167,139,250,0.20)';
  ctx.shadowBlur  = 20;
  ctx.fillStyle = '#e8e8f4';
  ctx.font = '600 62px sans-serif';
  ctx.fillText(archTitle || '', W/2, H * 0.635);
  ctx.shadowBlur = 0;

  /* Teaser */
  ctx.fillStyle = 'rgba(168,180,196,0.75)';
  ctx.font = '300 34px sans-serif';
  wrapCanvasText(ctx, teaser || '', W/2, H * 0.695, 800, 52);

  /* Name */
  ctx.fillStyle = 'rgba(167,139,250,0.60)';
  ctx.font = '500 38px sans-serif';
  ctx.fillText(name || '', W/2, H * 0.875);

  /* Bottom divider */
  ctx.strokeStyle = topLine;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, H - 80); ctx.lineTo(W, H - 80); ctx.stroke();

  /* Brand bottom */
  ctx.fillStyle = 'rgba(245,158,11,0.40)';
  ctx.font = '600 28px sans-serif';
  ctx.fillText('numerologie.app  ✦', W/2, H - 42);
}


/* ═══════════════════════════════════════════════════════════
   26. PWA SERVICE WORKER
   ═══════════════════════════════════════════════════════════ */

const APP_VERSION = '4.0';

async function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => !k.includes(APP_VERSION)).map(k => caches.delete(k)));
    const reg = await navigator.serviceWorker.register('/sw.js');
    await reg.update();
  } catch (e) { /* SW optional */ }
}


/* ═══════════════════════════════════════════════════════════
   27. ACCORDION-CONTROLLER
   ═══════════════════════════════════════════════════════════ */

function initAccordions() {
  document.querySelectorAll('.acc-header').forEach(header => {
    header.addEventListener('click', () => {
      const expanded = header.getAttribute('aria-expanded') === 'true';
      const bodyId   = header.getAttribute('aria-controls');
      const body     = bodyId ? document.getElementById(bodyId) : null;
      if (!body) return;
      header.setAttribute('aria-expanded', String(!expanded));
      body.hidden = expanded;
    });
  });
}


/* ═══════════════════════════════════════════════════════════
   28. INIT  v4.0
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initForm();
  initModal();
  initCompare();
  initAccordions();
  window.addEventListener('load', registerSW);

  /* Focus name on desktop */
  if (window.innerWidth >= 768 && !new URLSearchParams(location.search).has('name')) {
    setTimeout(() => { document.getElementById('name')?.focus(); }, 200);
  }

  document.getElementById('printBtn')?.addEventListener('click', () => window.print());

  /* WhatsApp text share */
  document.getElementById('shareBtnWA')?.addEventListener('click', () => {
    window.open('https://wa.me/?text=' + encodeURIComponent(buildShareText()), '_blank', 'noopener,noreferrer');
  });

  /* Copy link */
  document.getElementById('shareBtnCopy')?.addEventListener('click', async () => {
    const btn    = document.getElementById('shareBtnCopy');
    const iconEl = document.getElementById('shareCopyIcon');
    try {
      await navigator.clipboard.writeText(window.location.href);
      if (iconEl) iconEl.textContent = '✓';
      if (btn) btn.classList.add('copied');
      setTimeout(() => {
        if (iconEl) iconEl.textContent = '🔗';
        if (btn) btn.classList.remove('copied');
      }, 2200);
    } catch { showToast('Link: ' + window.location.href); }
  });

  /* Share Card: Karte erstellen */
  document.getElementById('shareBtnCard')?.addEventListener('click', () => {
    const name      = document.getElementById('name')?.value.trim()
                      || new URLSearchParams(location.search).get('name') || '';
    const lifeVal   = document.getElementById('lifeHeroNum')?.textContent || '';
    const archTitle = document.getElementById('lifeHeroArchetype')?.textContent || '';
    const teaser    = document.getElementById('lifeHeroTeaser')?.textContent || '';
    if (!lifeVal) { showToast('Bitte erst berechnen ✦'); return; }
    drawShareCard(name, lifeVal, archTitle, teaser);
    const modal = document.getElementById('shareCardModal');
    if (modal) {
      try { modal.showModal(); }
      catch(err) { modal.setAttribute('open',''); modal.style.display = 'flex'; }
    }
  });

  /* Share Card: Schließen */
  document.getElementById('shareCardClose')?.addEventListener('click', () => {
    const modal = document.getElementById('shareCardModal');
    if (modal) {
      try { modal.close(); }
      catch(err) { modal.removeAttribute('open'); modal.style.display = ''; }
    }
  });

  /* Share Card: Click outside closes */
  document.getElementById('shareCardModal')?.addEventListener('click', function(e) {
    if (e.target === this) {
      try { this.close(); }
      catch(err) { this.removeAttribute('open'); this.style.display = ''; }
    }
  });

  /* Share Card: Download */
  document.getElementById('shareCardDownload')?.addEventListener('click', () => {
    const canvas = document.getElementById('shareCardCanvas');
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = 'meine-numerologie.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
  });

  /* Share Card: WhatsApp */
  document.getElementById('shareCardWA')?.addEventListener('click', () => {
    window.open('https://wa.me/?text=' + encodeURIComponent(buildShareText()), '_blank', 'noopener,noreferrer');
  });

  /* Hero info toggle */
  const heroInfoBtn  = document.getElementById('heroInfoBtn');
  const heroInfoBody = document.getElementById('heroInfoBody');
  heroInfoBtn?.addEventListener('click', () => {
    const expanded = heroInfoBtn.getAttribute('aria-expanded') === 'true';
    heroInfoBtn.setAttribute('aria-expanded', String(!expanded));
    if (heroInfoBody) heroInfoBody.hidden = expanded;
  });

  /* CTA: reset */
  document.getElementById('ctaBtnReset')?.addEventListener('click', () => {
    const form = document.getElementById('numerologyForm');
    if (form) form.dispatchEvent(new Event('reset'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => document.getElementById('name')?.focus(), 400);
  });

  /* CTA: scroll to compare */
  document.getElementById('ctaBtnCompare')?.addEventListener('click', () => {
    document.getElementById('compare-title')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => document.getElementById('compareName1')?.focus(), 500);
  });
});

