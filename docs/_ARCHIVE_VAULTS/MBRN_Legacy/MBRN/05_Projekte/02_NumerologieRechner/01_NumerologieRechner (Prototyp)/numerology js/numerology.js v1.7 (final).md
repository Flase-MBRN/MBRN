/**

  

 * numerology.js — v1.7 Clean Build

  

 * ─────────────────────────────────────────────────────────────

  

 * Struktur:

  

 *   1. Konstanten & Lookup-Tabellen

  

 *   2. Mathematische Kern-Funktionen

  

 *   3. Namens-Berechnungen

  

 *   4. Datums-Berechnungen

  

 *   5. Extra-Zahlen-Berechnungen

  

 *   6. Erklärungstexte (Lookup-Objekt)

  

 *   7. DOM-Helfer

  

 *   8. Validierung

  

 *   9. UI-Controller (Form-Handler, Reset, Submit)

  

 *  10. Init

  

 * ─────────────────────────────────────────────────────────────

  

 */

  

  

'use strict';

  

  

/* ═══════════════════════════════════════════════════════════

  

   1. KONSTANTEN & LOOKUP-TABELLEN

  

   ═══════════════════════════════════════════════════════════ */

  

  

/**

  

 * Pythagoras-Tabelle: Zahl → Buchstaben

  

 * Basis aller Namens-Berechnungen.

  

 */

  

const PYTHAGORAS = {

  

  1: ['A','J','S'],

  

  2: ['B','K','T'],

  

  3: ['C','L','U'],

  

  4: ['D','M','V'],

  

  5: ['E','N','W'],

  

  6: ['F','O','X'],

  

  7: ['G','P','Y'],

  

  8: ['H','Q','Z'],

  

  9: ['I','R'],

  

};

  

  

/** Vokalset (für Seelenzahl / Persönlichkeitszahl) */

  

const VOWELS = new Set(['A','E','I','O','U']);

  

  

/** Masterzahlen, die niemals weiter reduziert werden */

  

const MASTER_NUMBERS = new Set([11, 22, 33]);

  

  

/* ═══════════════════════════════════════════════════════════

  

   2. MATHEMATISCHE KERN-FUNKTIONEN

  

   ═══════════════════════════════════════════════════════════ */

  

  

/**

  

 * Berechnet die Quersumme einer Zahl (einmalig, nicht rekursiv).

  

 * @param {number} n

  

 * @returns {number}

  

 */

  

function digitSum(n) {

  

  return String(n)

  

    .split('')

  

    .reduce((sum, d) => sum + parseInt(d, 10), 0);

  

}

  

  

/**

  

 * Reduziert eine Zahl durch wiederholte Quersumme auf 1–9.

  

 * Masterzahlen werden NICHT berücksichtigt.

  

 * @param {number} n

  

 * @returns {number}

  

 */

  

function reduceForceSingle(n) {

  

  if (n === 0) return 0;

  

  while (n > 9) {

  

    n = digitSum(n);

  

  }

  

  return n;

  

}

  

  

/**

  

 * Reduziert eine Zahl, bewahrt aber Masterzahlen (11, 22, 33).

  

 * @param {number} n

  

 * @returns {number}

  

 */

  

function reducePreserveMaster(n) {

  

  if (n === 0) return 0;

  

  if (MASTER_NUMBERS.has(n)) return n;

  

  while (n > 9) {

  

    n = digitSum(n);

  

    if (MASTER_NUMBERS.has(n)) break;

  

  }

  

  return n;

  

}

  

  

/**

  

 * Gibt den Anzeigestring zurück: „Normal" oder „Normal/Master"

  

 * wenn eine Masterzahl vorliegt.

  

 * @param {number} rawSum - Unreduzierte Rohsumme

  

 * @returns {string} z.B. "3", "2/11", "4/22"

  

 */

  

function formatValue(rawSum) {

  

  const normal = reduceForceSingle(rawSum);

  

  const master = reducePreserveMaster(rawSum);

  

  if (MASTER_NUMBERS.has(master) && master !== normal) {

  

    return `${normal}/${master}`;

  

  }

  

  return String(normal);

  

}

  

  

/**

  

 * Gibt den numerischen Wert zurück, der für Erklärungen genutzt wird.

  

 * Bei Masterzahlen: die Masterzahl selbst.

  

 * @param {string} displayValue - z.B. "2/11"

  

 * @returns {{ base: number, master: number|null }}

  

 */

  

function parseDisplayValue(displayValue) {

  

  if (displayValue.includes('/')) {

  

    const [b, m] = displayValue.split('/').map(Number);

  

    return { base: b, master: m };

  

  }

  

  return { base: Number(displayValue), master: null };

  

}

  

  

/* ═══════════════════════════════════════════════════════════

  

   3. NAMENS-NORMALISIERUNG & BUCHSTABEN-KONVERSION

  

   ═══════════════════════════════════════════════════════════ */

  

  

/**

  

 * Normalisiert einen Namen: Großschreibung + Umlaut-Auflösung.

  

 * ä→AE, ö→OE, ü→UE, ß→SS (Pythagoras-Standard)

  

 * @param {string} name

  

 * @returns {string}

  

 */

  

function normalizeName(name) {

  

  return name

  

    .toUpperCase()

  

    .replace(/Ä/g, 'AE')

  

    .replace(/Ö/g, 'OE')

  

    .replace(/Ü/g, 'UE')

  

    .replace(/ß/g,  'SS');

  

}

  

  

/**

  

 * Gibt den Pythagoreanischen Zahlwert für einen Buchstaben zurück.

  

 * @param {string} char - Einzelner Großbuchstabe

  

 * @returns {number} 1–9, oder 0 wenn nicht gefunden

  

 */

  

function charToNumber(char) {

  

  for (const [num, chars] of Object.entries(PYTHAGORAS)) {

  

    if (chars.includes(char)) return parseInt(num, 10);

  

  }

  

  return 0;

  

}

  

  

/**

  

 * Berechnet die Rohsumme aller Buchstaben eines Namens.

  

 * @param {string} name

  

 * @returns {number}

  

 */

  

function calculateExpressionSum(name) {

  

  return normalizeName(name)

  

    .replace(/\s+/g, '')

  

    .split('')

  

    .reduce((sum, ch) => sum + charToNumber(ch), 0);

  

}

  

  

/**

  

 * Seelenzahl: Summe der Vokalwerte.

  

 * @param {string} name

  

 * @returns {number}

  

 */

  

function calculateSoulSum(name) {

  

  return normalizeName(name)

  

    .replace(/\s+/g, '')

  

    .split('')

  

    .filter(ch => VOWELS.has(ch))

  

    .reduce((sum, ch) => sum + charToNumber(ch), 0);

  

}

  

  

/**

  

 * Persönlichkeitszahl: Summe der Konsonantenwerte.

  

 * @param {string} name

  

 * @returns {number}

  

 */

  

function calculatePersonalitySum(name) {

  

  return normalizeName(name)

  

    .replace(/\s+/g, '')

  

    .split('')

  

    .filter(ch => !VOWELS.has(ch))

  

    .reduce((sum, ch) => sum + charToNumber(ch), 0);

  

}

  

  

/* ═══════════════════════════════════════════════════════════

  

   4. DATUMS-BERECHNUNGEN

  

   ═══════════════════════════════════════════════════════════ */

  

  

/**

  

 * Prüft ob ein Jahrgang ein Schaltjahr ist.

  

 * @param {number} year

  

 * @returns {boolean}

  

 */

  

function isLeapYear(year) {

  

  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

  

}

  

  

/**

  

 * Validiert ein Datum im Format TT.MM.JJJJ.

  

 * @param {string} dateStr

  

 * @returns {boolean}

  

 */

  

function isValidDate(dateStr) {

  

  if (!/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) return false;

  

  const [day, month, year] = dateStr.split('.').map(Number);

  

  if (month < 1 || month > 12) return false;

  

  if (year < 1900 || year > 2099) return false;

  

  const daysPerMonth = [

  

    31, isLeapYear(year) ? 29 : 28, 31, 30,

  

    31, 30, 31, 31, 30, 31, 30, 31,

  

  ];

  

  return day >= 1 && day <= daysPerMonth[month - 1];

  

}

  

  

/**

  

 * Lebenszahl: Summe aller Ziffern des Datums.

  

 * @param {string} date - Format TT.MM.JJJJ

  

 * @returns {number}

  

 */

  

function calculateLifeSum(date) {

  

  return date

  

    .replace(/\D/g, '')

  

    .split('')

  

    .reduce((sum, d) => sum + parseInt(d, 10), 0);

  

}

  

  

/* ═══════════════════════════════════════════════════════════

  

   5. EXTRA-ZAHLEN-BERECHNUNGEN

  

   ═══════════════════════════════════════════════════════════ */

  

  

/**

  

 * Geburtstagszahl: numerischer Wert des Geburtstages (1–31).

  

 * @param {string} date - Format TT.MM.JJJJ

  

 * @returns {number}

  

 */

  

function calculateBirthdaySum(date) {

  

  return parseInt(date.split('.')[0], 10);

  

}

  

  

/**

  

 * Reifezahl: reduzierte Summe von Lebenszahl + Ausdruckszahl.

  

 * @param {number} lifeSum

  

 * @param {number} expressionSum

  

 * @returns {number}

  

 */

  

function calculateMaturitySum(lifeSum, expressionSum) {

  

  return reduceForceSingle(lifeSum) + reduceForceSingle(expressionSum);

  

}

  

  

/**

  

 * Balancezahl: Pythagoreanische Summe aller Namensinitiale.

  

 * @param {string} name

  

 * @returns {number}

  

 */

  

function calculateBalanceSum(name) {

  

  return normalizeName(name)

  

    .split(' ')

  

    .filter(part => part.length > 0)

  

    .reduce((sum, part) => sum + charToNumber(part[0]), 0);

  

}

  

  

/**

  

 * Karmische Zahl: Summe aller Zahlen (1–9), die NICHT der

  

 * reduzierten Ausdruckszahl entsprechen → fehlende Lektionen.

  

 * @param {number} expressionSum

  

 * @returns {number}

  

 */

  

function calculateKarmicSum(expressionSum) {

  

  const expressed = reduceForceSingle(expressionSum);

  

  return [1,2,3,4,5,6,7,8,9]

  

    .filter(n => n !== expressed)

  

    .reduce((a, b) => a + b, 0);

  

}

  

  

/**

  

 * Persönliches Jahr – klassische Methode:

  

 * Lebenszahl (reduziert) + Quersumme des aktuellen Jahres.

  

 * @param {number} lifeNormal - Reduzierte Lebenszahl

  

 * @returns {number}

  

 */

  

function calculatePersonalYearClassic(lifeNormal) {

  

  const yearSum = digitSum(new Date().getFullYear());

  

  return lifeNormal + yearSum;

  

}

  

  

/**

  

 * Persönliches Jahr – Masterzahl-Prüfmethode:

  

 * Lebenszahl + komplettes Jahreswert (für Masterzahlen-Check).

  

 * @param {number} lifeNormal

  

 * @returns {number}

  

 */

  

function calculatePersonalYearMasterCheck(lifeNormal) {

  

  return lifeNormal + new Date().getFullYear();

  

}

  

  

/**

  

 * Gibt den finalen Anzeigewert für das Persönliche Jahr zurück.

  

 * Erkennt Masterzahlen aus dem erweiterten Jahreswert.

  

 * @param {number} lifeSum - Rohsumme Lebenszahl

  

 * @returns {string}

  

 */

  

function getPersonalYearDisplay(lifeSum) {

  

  const lifeNormal    = reduceForceSingle(lifeSum);

  

  const classicSum    = calculatePersonalYearClassic(lifeNormal);

  

  const classicDisplay = formatValue(classicSum);

  

  const masterCheck   = reducePreserveMaster(calculatePersonalYearMasterCheck(lifeNormal));

  

  

  // Wenn Masterzahl-Methode eine andere Masterzahl ergibt → Kombiwert

  

  if (

  

    MASTER_NUMBERS.has(masterCheck) &&

  

    masterCheck !== parseInt(classicDisplay, 10)

  

  ) {

  

    const normalPart = reduceForceSingle(classicSum);

  

    return `${normalPart}/${masterCheck}`;

  

  }

  

  

  return classicDisplay;

  

}

  

  

/* ═══════════════════════════════════════════════════════════

  

   6. ERKLÄRUNGSTEXTE

  

   ═══════════════════════════════════════════════════════════ */

  

  

const EXPLANATIONS = {

  

  life: {

  

    1:  'Neuanfang, Führungsqualitäten, Selbstbestimmung',

  

    2:  'Harmonie, Kooperation, Sensibilität',

  

    3:  'Kreativität, Ausdruck, Kommunikation',

  

    4:  'Stabilität, Ordnung, Disziplin',

  

    5:  'Flexibilität, Abenteuer, Veränderung',

  

    6:  'Verantwortung, Familie, Fürsorge',

  

    7:  'Analyse, Rückzug, Weisheit',

  

    8:  'Macht, Erfolg, materielles Geschick',

  

    9:  'Abschluss, Mitgefühl, Idealismus',

  

    11: 'Intuition & Inspiration (Master 11)',

  

    22: 'Master-Builder: Vision & Realisierung (Master 22)',

  

    33: 'Lehrer/Heiler (Master 33)',

  

  },

  

  soul: {

  

    1:  'Innerer Antrieb', 2:  'Sehnsucht nach Harmonie',

  

    3:  'Bedürfnis nach kreativem Ausdruck', 4: 'Sicherheit & Struktur',

  

    5:  'Sehnsucht nach Freiheit', 6: 'Fürsorge',

  

    7:  'Spirituelle Suche', 8: 'Starker Wille',

  

    9:  'Empathie', 11: 'Spirituelle Sensibilität',

  

    22: 'Visionäre Kraft', 33: 'Dienst am Kollektiv',

  

  },

  

  expression: {

  

    1:  'Direkter Ausdruck', 2:  'Diplomatisch',

  

    3:  'Kommunikativ', 4:  'Pragmatisch',

  

    5:  'Vielseitig', 6:  'Verantwortungsvoll',

  

    7:  'Analytisch', 8:  'Ambitioniert',

  

    9:  'Inspirierend', 11: 'Inspirierende Persönlichkeit',

  

    22: 'Großer Umsetzer', 33: 'Heilende Persönlichkeit',

  

  },

  

  personality: {

  

    1:  'Wirkt unabhängig', 2:  'Wirkt freundlich',

  

    3:  'Wirkt offen', 4:  'Wirkt stabil',

  

    5:  'Wirkt lebhaft', 6:  'Wirkt warm',

  

    7:  'Wirkt ruhig', 8:  'Wirkt stark',

  

    9:  'Wirkt empathisch', 11: 'Besondere Ausstrahlung',

  

    22: 'Visionär', 33: 'Sehr fürsorglich',

  

  },

  

  karmic: {

  

    1:  'Karmische Lektion: Eigeninitiative',

  

    2:  'Karmische Lektion: Partnerschaft',

  

    3:  'Karmische Lektion: Ausdruck',

  

    4:  'Karmische Lektion: Verantwortung',

  

    5:  'Karmische Lektion: Freiheit',

  

    6:  'Karmische Lektion: Fürsorge',

  

    7:  'Karmische Lektion: Innere Arbeit',

  

    8:  'Karmische Lektion: Macht',

  

    9:  'Karmische Lektion: Loslassen',

  

  },

  

  personalYear: {

  

    1:  'Neubeginn', 2:  'Beziehungen',

  

    3:  'Kreativität', 4:  'Arbeit & Struktur',

  

    5:  'Veränderung', 6:  'Familie',

  

    7:  'Reflexion', 8:  'Karriere',

  

    9:  'Abschluss', 11: 'Intuitives Jahr',

  

    22: 'Großes Umsetzungsjahr', 33: 'Dienst am Kollektiv',

  

  },

  

  birthday: {

  

    1:  'Geborener Anführer', 2:  'Diplomatisches Talent',

  

    3:  'Kreatives Talent', 4:  'Praktisches Talent',

  

    5:  'Abenteuerlust', 6:  'Fürsorge',

  

    7:  'Denker', 8:  'Management-Talent', 9: 'Humanitäres Talent',

  

  },

  

  maturity: {

  

    1:  'Reife durch Selbstständigkeit', 2:  'Reife durch Kooperation',

  

    3:  'Reife durch Kreativität', 4:  'Reife durch Struktur',

  

    5:  'Reife durch Freiheit', 6:  'Reife durch Verantwortung',

  

    7:  'Reife durch Erkenntnis', 8:  'Reife durch Macht',

  

    9:  'Reife durch Mitgefühl', 11: 'Spirituelle Reife',

  

    22: 'Große Manifestation', 33: 'Spiritueller Dienst',

  

  },

  

  balance: {

  

    1:  'Balance durch Eigenständigkeit', 2:  'Balance durch Diplomatie',

  

    3:  'Balance durch Kommunikation', 4:  'Balance durch Ordnung',

  

    5:  'Balance durch Anpassung', 6:  'Balance durch Verantwortung',

  

    7:  'Balance durch Rückzug', 8:  'Balance durch Selbstkontrolle',

  

    9:  'Balance durch Mitgefühl',

  

  },

  

};

  

  

/**

  

 * Gibt den Erklärungstext für einen Anzeigewert zurück.

  

 * Kombiniert ggf. Normal- und Masterzahl-Erklärung.

  

 * @param {string} displayValue - z.B. "3" oder "2/11"

  

 * @param {string} type - Schlüssel in EXPLANATIONS

  

 * @returns {string}

  

 */

  

function getExplanation(displayValue, type) {

  

  const map = EXPLANATIONS[type] || {};

  

  const { base, master } = parseDisplayValue(displayValue);

  

  const baseText   = map[base]   || '';

  

  const masterText = master ? (map[master] || '') : '';

  

  if (baseText && masterText) return `${baseText} — ${masterText}`;

  

  return baseText || masterText;

  

}

  

  

/* ═══════════════════════════════════════════════════════════

  

   7. DOM-HELFER

  

   ═══════════════════════════════════════════════════════════ */

  

  

/**

  

 * Setzt den Textwert einer Result-Value-Zelle.

  

 * Fügt `.master`-Klasse hinzu wenn Masterzahl erkannt.

  

 * @param {string} elementId

  

 * @param {string} displayValue

  

 */

  

function setResultValue(elementId, displayValue) {

  

  const el = document.getElementById(elementId);

  

  if (!el) return;

  

  el.textContent = displayValue;

  

  el.classList.remove('master');

  

  

  // Masterzahl aus "normal/master"-Format extrahieren

  

  const { base, master } = parseDisplayValue(displayValue);

  

  const checkValue = master ?? base;

  

  if (MASTER_NUMBERS.has(checkValue)) {

  

    el.classList.add('master');

  

  }

  

}

  

  

/**

  

 * Setzt den Erklärungstext eines Tiles.

  

 * @param {string} explanationElementId

  

 * @param {string} displayValue

  

 * @param {string} type - Schlüssel in EXPLANATIONS

  

 */

  

function setTileExplanation(explanationElementId, displayValue, type) {

  

  const el = document.getElementById(explanationElementId);

  

  if (!el) return;

  

  el.textContent = getExplanation(displayValue, type);

  

}

  

  

/**

  

 * Erstellt eine Extra-Zahlen-Kachel und hängt sie ins Grid.

  

 * @param {string} title     - Kachel-Überschrift

  

 * @param {string} value     - Anzeigewert

  

 * @param {string} tooltip   - Tooltip-Text (optional)

  

 * @param {string} [explType] - Schlüssel in EXPLANATIONS

  

 */

  

function appendExtraTile(title, value, tooltip = '', explType = null) {

  

  const grid = document.getElementById('extraNumbersGrid');

  

  if (!grid) return;

  

  

  // Kachel-Wrapper

  

  const tile = document.createElement('article');

  

  tile.className = 'result-tile';

  

  

  // Titel + optionaler Tooltip-Button

  

  const titleEl = document.createElement('div');

  

  titleEl.className = 'result-title';

  

  titleEl.innerHTML = `<span>${title}</span>`;

  

  

  if (tooltip) {

  

    const tipBtn = document.createElement('button');

  

    tipBtn.className    = 'tooltip-btn';

  

    tipBtn.type         = 'button';

  

    tipBtn.setAttribute('data-tooltip', tooltip);

  

    tipBtn.setAttribute('aria-label', `Info zu ${title}`);

  

    tipBtn.textContent  = 'ℹ';

  

    titleEl.appendChild(tipBtn);

  

  }

  

  

  // Wert

  

  const valueEl = document.createElement('div');

  

  valueEl.className = 'result-value';

  

  valueEl.textContent = value;

  

  const { base, master } = parseDisplayValue(value);

  

  if (MASTER_NUMBERS.has(master ?? base)) valueEl.classList.add('master');

  

  

  // Erklärung

  

  const explEl = document.createElement('div');

  

  explEl.className = 'result-explanation';

  

  if (explType) explEl.textContent = getExplanation(value, explType);

  

  

  tile.appendChild(titleEl);

  

  tile.appendChild(valueEl);

  

  tile.appendChild(explEl);

  

  grid.appendChild(tile);

  

  

  // Staggered Einblend-Animation

  

  requestAnimationFrame(() => tile.classList.add('is-visible'));

  

}

  

  

/**

  

 * Animiert alle Kacheln im Grid mit gestaffeltem Delay.

  

 * @param {string} gridId

  

 */

  

function animateTiles(gridId) {

  

  const grid = document.getElementById(gridId);

  

  if (!grid) return;

  

  grid.querySelectorAll('.result-tile').forEach((tile, i) => {

  

    tile.style.animationDelay = `${i * 60}ms`;

  

    requestAnimationFrame(() => tile.classList.add('is-visible'));

  

  });

  

}

  

  

/**

  

 * Leert alle Result-Felder (für Reset).

  

 */

  

function clearResults() {

  

  ['lifePathNumber', 'soulNumber', 'expressionNumber', 'personalityNumber'].forEach(id => {

  

    const el = document.getElementById(id);

  

    if (el) { el.textContent = ''; el.classList.remove('master'); }

  

  });

  

  ['lifeExplanation', 'soulExplanation', 'expressionExplanation', 'personalityExplanation'].forEach(id => {

  

    const el = document.getElementById(id);

  

    if (el) el.textContent = '';

  

  });

  

  // Kern-Tiles wieder auf unsichtbar setzen

  

  document.querySelectorAll('#resultsGrid .result-tile').forEach(tile => {

  

    tile.classList.remove('is-visible');

  

    tile.style.animationDelay = '';

  

  });

  

  const extraGrid = document.getElementById('extraNumbersGrid');

  

  if (extraGrid) extraGrid.innerHTML = '';

  

}

  

  

/* ═══════════════════════════════════════════════════════════

  

   8. VALIDIERUNG

  

   ═══════════════════════════════════════════════════════════ */

  

  

/**

  

 * Validiert den Namens-Input.

  

 * @param {string} name

  

 * @returns {{ ok: boolean, msg: string }}

  

 */

  

function validateName(name) {

  

  if (!name || !name.trim()) {

  

    return { ok: false, msg: 'Bitte Name eingeben.' };

  

  }

  

  const pattern = /^[A-Za-zÄÖÜäöüßẞ\s'\-]+$/;

  

  if (!pattern.test(name)) {

  

    return { ok: false, msg: "Nur Buchstaben, Leerzeichen, - und ' erlaubt." };

  

  }

  

  if (!/[A-Za-zÄÖÜäöüßẞ]/.test(name)) {

  

    return { ok: false, msg: 'Bitte einen gültigen Namen eingeben.' };

  

  }

  

  return { ok: true, msg: '' };

  

}

  

  

/* ═══════════════════════════════════════════════════════════

  

   9. UI-CONTROLLER

  

   ═══════════════════════════════════════════════════════════ */

  

  

/**

  

 * Initialisiert den Form-Controller:

  

 * - Live-Validierung bei Eingabe

  

 * - Submit-Handler

  

 * - Reset-Handler

  

 */

  

function initForm() {

  

  const form        = document.getElementById('numerologyForm');

  

  const nameInput   = document.getElementById('name');

  

  const dateInput   = document.getElementById('birthdate');

  

  const nameErrEl   = document.getElementById('nameError');

  

  const dateErrEl   = document.getElementById('dateError');

  

  const calcBtn     = document.getElementById('calcBtn');

  

  const resetBtn    = document.getElementById('resetBtn');

  

  

  if (!form || !nameInput || !dateInput) return;

  

  

  /* ─── Live-Validierung ─── */

  

  function updateFormState() {

  

    const nameState = validateName(nameInput.value);

  

    const dateOk    = isValidDate(dateInput.value.trim());

  

  

    // Name-Feedback

  

    nameInput.classList.toggle('input-invalid', !nameState.ok);

  

    nameInput.classList.toggle('input-valid',    nameState.ok);

  

    nameErrEl.textContent = nameState.ok ? '' : nameState.msg;

  

  

    // Datum-Feedback

  

    const dateHasInput = dateInput.value.trim().length > 0;

  

    dateInput.classList.toggle('input-invalid', dateHasInput && !dateOk);

  

    dateInput.classList.toggle('input-valid',   dateOk);

  

    dateErrEl.textContent = (!dateOk && dateHasInput)

  

      ? 'Format: TT.MM.JJJJ (z.B. 21.02.1991)'

  

      : '';

  

  

    const isValid = nameState.ok && dateOk;

  

    if (calcBtn) calcBtn.disabled = !isValid;

  

    return isValid;

  

  }

  

  

  nameInput.addEventListener('input', updateFormState);

  

  dateInput.addEventListener('input', updateFormState);

  

  

  /* ─── Reset ─── */

  

  resetBtn?.addEventListener('click', () => {

  

    // Kurze Verzögerung, damit browser-natives reset() zuerst ausgeführt wird

  

    requestAnimationFrame(() => {

  

      nameErrEl.textContent = '';

  

      dateErrEl.textContent = '';

  

      nameInput.classList.remove('input-invalid', 'input-valid');

  

      dateInput.classList.remove('input-invalid', 'input-valid');

  

      if (calcBtn) calcBtn.disabled = false;

  

      clearResults();

  

    });

  

  });

  

  

  /* ─── Berechnung ─── */

  

  form.addEventListener('submit', (e) => {

  

    e.preventDefault();

  

    if (!updateFormState()) return;

  

  

    const name = nameInput.value.trim();

  

    const date = dateInput.value.trim();

  

  

    // ── Rohsummen berechnen

  

    const expressionSum  = calculateExpressionSum(name);

  

    const soulSum        = calculateSoulSum(name);

  

    const personalitySum = calculatePersonalitySum(name);

  

    const lifeSum        = calculateLifeSum(date);

  

  

    // ── Anzeigewerte formatieren

  

    const expressionVal  = formatValue(expressionSum);

  

    const soulVal        = formatValue(soulSum);

  

    const personalityVal = formatValue(personalitySum);

  

    const lifeVal        = formatValue(lifeSum);

  

  

    // ── Kernzahlen in DOM schreiben

  

    setResultValue('expressionNumber',  expressionVal);

  

    setResultValue('soulNumber',        soulVal);

  

    setResultValue('personalityNumber', personalityVal);

  

    setResultValue('lifePathNumber',    lifeVal);

  

  

    // ── Erklärungen setzen

  

    setTileExplanation('expressionExplanation',  expressionVal,  'expression');

  

    setTileExplanation('soulExplanation',        soulVal,        'soul');

  

    setTileExplanation('personalityExplanation', personalityVal, 'personality');

  

    setTileExplanation('lifeExplanation',        lifeVal,        'life');

  

  

    // ── Kernzahl-Tiles animieren

  

    animateTiles('resultsGrid');

  

  

    // ── Extra-Grid leeren & neu befüllen

  

    const extraGrid = document.getElementById('extraNumbersGrid');

  

    if (extraGrid) extraGrid.innerHTML = '';

  

  

    // Karmische Zahl

  

    const karmicDisplay = formatValue(calculateKarmicSum(expressionSum));

  

    appendExtraTile(

  

      'Karmische Zahl', karmicDisplay,

  

      'Fehlende Energien aus dem Ausdruckspotenzial', 'karmic'

  

    );

  

  

    // Persönliches Jahr

  

    const personalYearDisplay = getPersonalYearDisplay(lifeSum);

  

    appendExtraTile(

  

      'Persönliches Jahr', personalYearDisplay,

  

      'Lebenszahl + Quersumme des aktuellen Jahres', 'personalYear'

  

    );

  

  

    // Geburtstagszahl

  

    const birthdayDisplay = formatValue(calculateBirthdaySum(date));

  

    appendExtraTile(

  

      'Geburtstagszahl', birthdayDisplay,

  

      'Numerischer Wert des Geburtstages', 'birthday'

  

    );

  

  

    // Reifezahl

  

    const maturityDisplay = formatValue(calculateMaturitySum(lifeSum, expressionSum));

  

    appendExtraTile(

  

      'Reifezahl', maturityDisplay,

  

      'Lebenszahl + Ausdruckszahl (reduziert)', 'maturity'

  

    );

  

  

    // Balancezahl

  

    const balanceDisplay = formatValue(calculateBalanceSum(name));

  

    appendExtraTile(

  

      'Balancezahl', balanceDisplay,

  

      'Pythagoreanische Summe der Namensinitiale', 'balance'

  

    );

  

  

    // ── Entwicklungs-Log (nur in nicht-produktiver Umgebung)

  

    if (typeof console !== 'undefined' && window.location.hostname === 'localhost') {

  

      console.debug('[Numerologie v1.7]', {

  

        name, date,

  

        rawSums: { expressionSum, soulSum, personalitySum, lifeSum },

  

        display: { expressionVal, soulVal, personalityVal, lifeVal },

  

        extras:  { karmicDisplay, personalYearDisplay, birthdayDisplay, maturityDisplay, balanceDisplay },

  

      });

  

    }

  

  });

  

  

  // Initialen Formzustand setzen

  

  updateFormState();

  

}

  

  

/* ═══════════════════════════════════════════════════════════

  

   10. INIT

  

   ═══════════════════════════════════════════════════════════ */

  

  

document.addEventListener('DOMContentLoaded', initForm);

  

  

/*

  

=============================================================

  

  JS: VERBESSERUNGEN IN v1.7

  

=============================================================

  

  ✅ 'use strict' für sichereren Ausführungskontext

  

  ✅ Konstanten großgeschrieben (PYTHAGORAS, MASTER_NUMBERS, VOWELS)

  

  ✅ Set statt Array für VOWELS & MASTER_NUMBERS (O(1) Lookup)

  

  ✅ parseDisplayValue() extrahiert base/master sauber und einheitlich

  

  ✅ getExplanation() konsolidiert die frühere doppelte Logik

  

  ✅ formatValue() ersetzt das ältere formatNormalAndMaster()

  

  ✅ charToNumber() ersetzt getNumberForChar() (beschreibender Name)

  

  ✅ isValidDate() statt isValidDateDDMMYYYY() (kurzer, klarer Name)

  

  ✅ digitSum() als primitiver Helfer isoliert (kein String-Overhead)

  

  ✅ getPersonalYearDisplay() kapselt die komplexe Jahres-Logik

  

  ✅ clearResults() fasst den Reset-Code aus dem Listener zusammen

  

  ✅ animateTiles() für staggered CSS-Einblendung via is-visible

  

  ✅ appendExtraTile() übernimmt addExtraNumber() sauber umbenannt

  

  ✅ requestAnimationFrame() für CSS-Klassenänderungen nach DOM-Insert

  

  ✅ console.debug() nur noch auf localhost (kein Produktions-Log)

  

  ✅ JSDoc-Kommentare auf allen öffentlichen Funktionen

  

  ✅ initForm() als saubere Initialisierungsfunktion

  

  

=============================================================

  

  JS: IDEEN FÜR v2.0

  

=============================================================

  

  💡 ES-Module (import/export) statt globalem Script-Scope

  

  💡 Berechnungs-Funktionen als eigenes numerology-core.js auslagern

  

  💡 URL-State-Sharing: Eingaben in ?name=&date= kodieren (History API)

  

  💡 Ergebnis-Cache: localStorage für zuletzt berechnete Werte

  

  💡 Web Worker für Berechnungen (Zukunftssicherheit bei komplexeren Algorithmen)

  

  💡 Unit-Tests (Vitest/Jest) für alle reinen Rechenfunktionen

  

  💡 Internationalisierung: i18n-Objekte für DE/EN/FR Erklärungen

  

  💡 Chart.js-Kompatibilitäts-Matrix: Zwei Namen vergleichen und Radar-Chart rendern

  

*/