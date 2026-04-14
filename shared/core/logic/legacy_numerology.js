/**
 * /shared/core/logic/legacy_numerology.js
 * LEGACY NUMEROLOGY ENGINE — v2.5 (MIGRATED TO CORE)
 * * Persona: Flase (Anonym, monolithisch, präzise)
 * Ziel: Perfekte Symmetrie, humanisierte Fachbegriffe, maximaler Nutzwert.
 * 
 * MIGRATION NOTICE: This file was moved from apps/numerology/logic.js
 * It now serves as the Core's Legacy Numerology Engine.
 */

/* ─── KONSTANTEN ────────────────────────────────────────────────────────── */

const PYTHAGORAS = {
  1: ['A','J','S'], 2: ['B','K','T'], 3: ['C','L','U'],
  4: ['D','M','V'], 5: ['E','N','W'], 6: ['F','O','X'],
  7: ['G','P','Y'], 8: ['H','Q','Z'], 9: ['I','R'],
};

const VOWELS = new Set(['A','E','I','O','U']);
const MASTER_NUMBERS = new Set([11, 22, 33]);

/* ─── MATHEMATISCHE KERN-FUNKTIONEN ─────────────────────────────────────── */

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

function formatValue(raw) {
  const normal = reduceForceSingle(raw);
  const master = reducePreserveMaster(raw);
  if (MASTER_NUMBERS.has(master) && master !== normal) return `${normal}/${master}`;
  return String(normal);
}

/* ─── NAMENS-NORMALISIERUNG ─────────────────────────────────────────────── */

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
  if (!name || typeof name !== 'string') return [];
  return normalizeName(name).replace(/\s+/g,'').split('')
    .map(ch => charToNumber(ch)).filter(n => n > 0);
}

/* ─── Y-VOKAL-REGEL ────────────────────────────────────────────────────── */

function isYVowel(chars, index) {
  if (chars[index] !== 'Y') return false;
  const prev = index > 0 ? chars[index - 1] : null;
  const next = index < chars.length - 1 ? chars[index + 1] : null;
  const isV = c => c && VOWELS.has(c);
  if (!prev) return !isV(next);
  if (!next) return !isV(prev);
  return !isV(prev) && !isV(next);
}

/* ─── KERN-BERECHNUNGEN ─────────────────────────────────────────────────── */

function calculateLifePathTotal(dateStr) {
  const [dStr, mStr, yStr] = dateStr.split('.');
  const day   = reducePreserveMaster(parseInt(dStr, 10));
  const month = reducePreserveMaster(parseInt(mStr, 10));
  const year  = reducePreserveMaster(digitSum(parseInt(yStr, 10)));
  return reducePreserveMaster(day + month + year);
}

function calculateSoulUrgeTotal(name) {
  const chars = normalizeName(name).replace(/\s+/g,'').split('');
  return chars.reduce((sum, ch, i) => {
    if (VOWELS.has(ch) || (ch === 'Y' && isYVowel(chars, i))) {
      return sum + charToNumber(ch);
    }
    return sum;
  }, 0);
}

function calculatePersonalityTotal(name) {
  const chars = normalizeName(name).replace(/\s+/g,'').split('');
  return chars.reduce((sum, ch, i) => {
    const isVowelHere = VOWELS.has(ch) || (ch === 'Y' && isYVowel(chars, i));
    if (!isVowelHere && charToNumber(ch) > 0) return sum + charToNumber(ch);
    return sum;
  }, 0);
}

function calculateExpressionTotal(name) {
  return nameToNumbers(name).reduce((s, n) => s + n, 0);
}

/* ─── WEITERE KENNZAHLEN ────────────────────────────────────────────────── */

function calculateLoShu(dateStr) {
  const digits = dateStr.replace(/\D/g, '').split('').map(Number);
  const freq = { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0 };
  digits.forEach(d => { if (d > 0) freq[d]++; });
  const activeLines = [
    { nums: [4,9,2], label: 'Mental' },
    { nums: [3,5,7], label: 'Emotional' },
    { nums: [8,1,6], label: 'Physisch' },
    { nums: [4,3,8], label: 'Gedanken' },
    { nums: [9,5,1], label: 'Wille' },
    { nums: [2,7,6], label: 'Handlung' },
    { nums: [4,5,6], label: 'Resonanz-↗' },
    { nums: [2,5,8], label: 'Resonanz-↘' }
  ].filter(l => l.nums.every(n => freq[n] > 0)).map(l => l.label);
  return { grid: freq, activeLines };
}

function calculateQuantumScore(lifeRaw, soulRaw, exprRaw) {
  const v1 = reduceForceSingle(lifeRaw);
  const v2 = reduceForceSingle(soulRaw);
  const v3 = reduceForceSingle(exprRaw);
  const values = [v1, v2, v3];
  const avg = values.reduce((a, b) => a + b, 0) / 3;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / 3;
  const spread = Math.max(...values) - Math.min(...values);
  const final = Math.max(0, Math.min(100, 100 - (variance * 4) - (spread * 2)));
  return { 
    score: Math.round(final * 10) / 10, 
    interpretation: final >= 80 ? 'Hohe Klarheit' : final >= 45 ? 'Gute Balance' : 'Herausforderung' 
  };
}

function calculateCycles(dateStr) {
  const [d, m, y] = dateStr.split('.').map(Number);
  return { c1: reducePreserveMaster(m), c2: reducePreserveMaster(d), c3: reducePreserveMaster(digitSum(y)) };
}

function calculatePinnacles(dateStr) {
  const [dStr, mStr, yStr] = dateStr.split('.');
  const d = reduceForceSingle(parseInt(dStr, 10));
  const m = reduceForceSingle(parseInt(mStr, 10));
  const y = reduceForceSingle(digitSum(parseInt(yStr, 10)));
  const p1 = reducePreserveMaster(m + d);
  const p2 = reducePreserveMaster(d + y);
  const p3 = reducePreserveMaster(reduceForceSingle(p1) + reduceForceSingle(p2));
  const p4 = reducePreserveMaster(m + y);
  return { p1, p2, p3, p4 };
}

function calculateChallenges(dateStr) {
  const [dStr, mStr, yStr] = dateStr.split('.');
  const d = reduceForceSingle(parseInt(dStr, 10));
  const m = reduceForceSingle(parseInt(mStr, 10));
  const y = reduceForceSingle(digitSum(parseInt(yStr, 10)));
  const ch1 = Math.abs(m - d);
  const ch2 = Math.abs(d - y);
  return { ch1, ch2, ch3: Math.abs(ch1 - ch2), ch4: Math.abs(m - y) };
}

function calculateKarma(name) {
  const nums = nameToNumbers(name);
  const lessons = [1,2,3,4,5,6,7,8,9].filter(n => !new Set(nums).has(n));
  const counts = {};
  nums.forEach(n => counts[n] = (counts[n] || 0) + 1);
  const max = Math.max(...Object.values(counts));
  const passion = Object.keys(counts).filter(k => counts[k] === max).map(Number);
  return { lessons, passion };
}

/* ─── ORCHESTRATOR ─────────────────────────────────────────────────────── */

export function calculateFullProfile(name, dateStr) {
  if (!name || name.trim().length < 2) return { success: false, error: 'Name zu kurz' };
  const dateMatch = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!dateMatch) return { success: false, error: 'Ungültiges Date-Format (TT.MM.JJJJ)' };

  try {
    const lifeRaw = calculateLifePathTotal(dateStr);
    const soulRaw = calculateSoulUrgeTotal(name);
    const persRaw = calculatePersonalityTotal(name);
    const exprRaw = calculateExpressionTotal(name);

    return {
      success: true,
      data: {
        meta: { name, date: dateStr },
        core: {
          lifePath: formatValue(lifeRaw),
          soulUrge: formatValue(soulRaw),
          personality: formatValue(persRaw),
          expression: formatValue(exprRaw)
        },
        loShu: calculateLoShu(dateStr),
        quantum: calculateQuantumScore(lifeRaw, soulRaw, exprRaw),
        cycles: calculateCycles(dateStr),
        pinnacles: calculatePinnacles(dateStr),
        challenges: calculateChallenges(dateStr),
        karma: calculateKarma(name),
        bridges: {
          lifeExpr: Math.abs(reduceForceSingle(lifeRaw) - reduceForceSingle(exprRaw)),
          soulPers: Math.abs(reduceForceSingle(soulRaw) - reduceForceSingle(persRaw))
        },
        additional: {
          birthday: formatValue(parseInt(dateStr.split('.')[0], 10)),
          maturity: formatValue(reduceForceSingle(lifeRaw) + reduceForceSingle(exprRaw))
        }
      }
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/* ─── VIRAL SATELLITE: CANVAS GENERATOR ────────────────────────────────── */

export function generateShareCard(data) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080; canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0,0,0,1920);
  grad.addColorStop(0,'#000'); grad.addColorStop(0.5,'#111'); grad.addColorStop(1,'#000');
  ctx.fillStyle = grad; ctx.fillRect(0,0,1080,1920);
  ctx.fillStyle = '#FFF'; ctx.textAlign = 'center'; ctx.font = 'bold 40px sans-serif';
  ctx.fillText('MBRN HUB — MASTERPLAN', 540, 120);
  ctx.font = '300 80px sans-serif'; ctx.fillText(data.meta.name.toUpperCase(), 540, 300);
  const score = data.quantum.score;
  ctx.strokeStyle = '#B7B7B7'; ctx.lineWidth = 15; ctx.beginPath(); ctx.arc(540,800,300,0.8*Math.PI,2.2*Math.PI); ctx.stroke();
  ctx.strokeStyle = '#FFF'; ctx.lineWidth = 25; const end = 0.8*Math.PI+(1.4*Math.PI*(score/100)); ctx.beginPath(); ctx.arc(540,800,300,0.8*Math.PI,end); ctx.stroke();
  ctx.fillStyle = '#FFF'; ctx.font = 'bold 150px sans-serif'; ctx.fillText(`${score}%`, 540, 850);
  ctx.font = '300 40px sans-serif'; ctx.fillText('SYSTEM-IMPULS', 540, 930);
  const core = [
    { label: 'LEBENSZAHL', val: data.core.lifePath }, { label: 'SEELENZAHL', val: data.core.soulUrge },
    { label: 'PERSÖNLICHKEIT', val: data.core.personality }, { label: 'AUSDRUCKSZAHL', val: data.core.expression }
  ];
  ctx.textAlign = 'left';
  core.forEach((c, i) => {
    const x = i % 2 === 0 ? 150 : 580; const y = 1150 + Math.floor(i / 2) * 250;
    ctx.fillStyle = '#B7B7B7'; ctx.font = 'bold 30px sans-serif'; ctx.fillText(c.label, x, y);
    ctx.fillStyle = '#FFF'; ctx.font = 'bold 100px sans-serif'; ctx.fillText(String(c.val), x, y + 100);
  });
  ctx.fillStyle = '#D3D3D3'; ctx.textAlign = 'center'; ctx.font = '300 35px sans-serif';
  ctx.fillText('Entschlüssele deinen digitalen Bauplan auf MBRN-HUB.com', 540, 1800);
  return canvas;
}

/* ─── VISION E: THE OPERATOR (Modern Luxury / High-Performance) ───────── */

const OPERATOR_CONFIG = {
  colors: {
    bgPrimary: [10, 10, 10],
    bgSecondary: [28, 28, 30],
    textPrimary: [255, 255, 255],
    textSecondary: [192, 192, 192],
    textMuted: [100, 100, 100],
    accent: [123, 92, 245],
    border: [60, 60, 65]
  },
  typography: {
    sizes: { hero: 48, title: 24, subtitle: 14, body: 11, micro: 9, value: 32 }
  }
};

const OPERATOR_MATRIX = {
  lifePath: {
    1: { title: 'Autonomie-Treiber', essence: 'Natürliche Führungskraft. Unabhängige Entscheidungsfindung.', strength: 'Eigenständige Ausrichtung ohne externe Validierung.', focus: 'Geduld in Kollaborationen entwickeln.' },
    2: { title: 'Synergie-Optimierer', essence: 'Harmonisierung von Beziehungen und Systemen.', strength: 'Intuitive Erfassung gruppen-dynamischer Signale.', focus: 'Grenzen setzen ohne Konfliktvermeidung.' },
    3: { title: 'Expression-Verstärker', essence: 'Transformation von Konzepten in emotionale Resonanz.', strength: 'Hohe Überzeugungskraft durch authentischen Ausdruck.', focus: 'Fokussierung der Energie auf wenige Projekte.' },
    4: { title: 'Struktur-Architekt', essence: 'Konstruktion belastbarer Langzeit-Systeme.', strength: 'Methodische Präzision und operationale Beständigkeit.', focus: 'Flexibilität innerhalb stabiler Rahmen.' },
    5: { title: 'Adaptions-Spezialist', essence: 'Navigierung durch komplexe Wandlungsprozesse.', strength: 'Schnelle Anpassung an neue Rahmenbedingungen.', focus: 'Tiefe halten trotz Bewegungsdrang.' },
    6: { title: 'Harmonie-Stabilisator', essence: 'Schaffung geschützter Entwicklungsräume.', strength: 'Natürliche Verantwortungsübernahme für das Kollektiv.', focus: 'Eigenfürsorge vor Fremdlast.' },
    7: { title: 'Tiefen-Analytiker', essence: 'Dekodierung komplexer System-Muster.', strength: 'Präzise Mustererkennung jenseits der Oberfläche.', focus: 'Transfer von Erkenntnis in Handlung.' },
    8: { title: 'Manifestations-Realisierer', essence: 'Skalierung von Vision in materielle Resultate.', strength: 'Verständnis für Macht-Strukturen und Effizienz.', focus: 'Integrität als Fundament von Erfolg.' },
    9: { title: 'Vollendungs-Integrator', essence: 'Abschluss komplexer Zyklen zur Neuausrichtung.', strength: 'Ganzheitliche Sichtweise und Weisheits-Transfer.', focus: 'Pragmatische Umsetzung trotz Idealismus.' },
    11: { title: 'Intuitiver Wegweiser', essence: 'Antenne für transzendente Wahrheiten.', strength: 'Direkter Zugriff auf unbewusstes Wissen.', focus: 'Bodenhaftung trotz hoher Sensitivität.' },
    22: { title: 'Visionärer Baumeister', essence: 'Transformation kollektiver Träume in Realität.', strength: 'Enormes Potential für systemische Konstruktion.', focus: 'Aktivierung der eigenen Größe.' }
  },

  harmony: {
    excellent: { label: 'Optimale Abstimmung', desc: 'Konfiguration synchronisiert. Entscheidungen fließen natürlich.', note: 'Wachstum entsteht durch gezielte Reibung.' },
    good: { label: 'Aktive Integration', desc: 'Spannungsfelder als Entwicklungstreiber erkannt.', note: 'Fokus auf Abgleich von Intuition und Logik.' },
    low: { label: 'Konfigurations-Konflikt', desc: 'Energieverlust durch innere Diskrepanzen.', note: 'Priorität: Primären Konflikt identifizieren.' }
  },

  grid: {
    mental: { active: 'Strukturierte Analyse als Standard-Modus.', potential: 'Intuitiver Zugriff auf Gesamtzusammenhänge.' },
    emotional: { active: 'Hohe Sensitivität für Umgebungs-Signale.', potential: 'Rationale Distanz für klare Entscheidungen.' },
    physical: { active: 'Pragmatische Umsetzung in Resultate.', potential: 'Konzeptuelle Freiheit jenseits physischer Grenzen.' }
  },

  pinnacles: {
    1: { title: 'Autonomie', desc: 'Fokus auf Identitäts-Sicherung und eigenständige Kraft.' },
    2: { title: 'Synergie', desc: 'Fokus auf strategische Bündnisse und Zusammenarbeit.' },
    3: { title: 'Präsenz', desc: 'Fokus auf Sichtbarkeit und authentischen Ausdruck.' },
    4: { title: 'Stabilität', desc: 'Fokus auf Fundament und langfristige Strukturen.' },
    5: { title: 'Expansion', desc: 'Fokus auf Wandel und System-Neuausrichtung.' },
    6: { title: 'Gleichgewicht', desc: 'Fokus auf Verantwortungsübernahme im System.' },
    7: { title: 'Essenz', desc: 'Fokus auf tiefe Wahrheit und Muster-Dekodierung.' },
    8: { title: 'Dominanz', desc: 'Fokus auf materiellen Erfolg und Autorität.' },
    9: { title: 'Vollendung', desc: 'Fokus auf Abschluss und Übergang.' },
    11: { title: 'Illumination', desc: 'Fokus auf intuitive Führung und Wegweisung.' },
    22: { title: 'Manifestation', desc: 'Fokus auf kollektive Schöpfung und Legacy.' }
  },

  cycles: {
    early: {
      1: { theme: 'Autonomie', task: 'Etablierung der eigenen Stimme.' },
      2: { theme: 'Synergie', task: 'Entwicklung von Empathie und Zusammenarbeit.' },
      3: { theme: 'Expression', task: 'Experimentieren mit authentischem Ausdruck.' },
      4: { theme: 'Fundament', task: 'Aufbau erster stabiler Strukturen.' },
      5: { theme: 'Adaptation', task: 'Sammeln vielfältiger Erfahrungen.' },
      6: { theme: 'Stabilität', task: 'Übernahme von Verantwortung.' },
      7: { theme: 'Analyse', task: 'Hinterfragen der Standard-Antworten.' },
      8: { theme: 'Wirkung', task: 'Training im Umgang mit Einfluss.' },
      9: { theme: 'Vollendung', task: 'Lernen des Loslassens.' },
      11: { theme: 'Intuition', task: 'Training der inneren Antenne.' },
      22: { theme: 'Vision', task: 'Vorbereitung großer Konstruktionen.' }
    },
    middle: {
      1: { theme: 'Unabhängigkeit', task: 'Beweis autarker Kraft.' },
      2: { theme: 'Partnerschaft', task: 'Tiefe Integration in Beziehungen.' },
      3: { theme: 'Impact', task: 'Maximale Sichtbarkeit.' },
      4: { theme: 'Struktur', task: 'Langfristige Sicherung.' },
      5: { theme: 'Transformation', task: 'Radikale Identitäts-Updates.' },
      6: { theme: 'Ordnung', task: 'Position als tragende Säule.' },
      7: { theme: 'Tiefe', task: 'Entwicklung intellektueller Essenz.' },
      8: { theme: 'Effizienz', task: 'Erreichung messbarer Ziele.' },
      9: { theme: 'Universalität', task: 'Kollektive Ziele jenseits des Selbst.' },
      11: { theme: 'Illumination', task: 'Wirkung als Wegweiser.' },
      22: { theme: 'Manifestation', task: 'Schöpfung von Monumenten.' }
    },
    late: {
      1: { theme: 'Souveränität', task: 'Bestimmung des eigenen Rhythmus.' },
      2: { theme: 'Weisheit', task: 'Transfer von Erfahrung.' },
      3: { theme: 'Präsenz', task: 'Erhaltung der Ausdruckskraft.' },
      4: { theme: 'Ernte', task: 'Nutzen der gebauten Strukturen.' },
      5: { theme: 'Freiheit', task: 'Nutzung der Unabhängigkeit.' },
      6: { theme: 'Harmonie', task: 'Ordnende Instanz durch Präsenz.' },
      7: { theme: 'Stille', task: 'Klarheit durch Loslösung.' },
      8: { theme: 'Legacy', task: 'Absicherung der Wirkung.' },
      9: { theme: 'Vollendung', task: 'Abschluss und Übergang.' },
      11: { theme: 'Klarheit', task: 'Visionäre Distanz.' },
      22: { theme: 'Legacy-Bau', task: 'Absicherung systemischer Werke.' }
    }
  },

  challenges: {
    0: { desc: 'Keine primäre Spannung. Risiko: Selbstzufriedenheit.' },
    1: { desc: 'Entwicklung autarker Entscheidungskraft ohne externe Validierung.' },
    2: { desc: 'Setzen klarer Grenzen bei gleichzeitiger Empathie.' },
    3: { desc: 'Fokussierung der Energie auf wenige Kernprojekte.' },
    4: { desc: 'Flexibilität innerhalb stabiler Strukturen.' },
    5: { desc: 'Halten der Tiefe trotz Bewegungsdrang.' },
    6: { desc: 'Eigenfürsorge vor Fremdlast priorisieren.' },
    7: { desc: 'Transfer von Analyse in konkrete Handlung.' },
    8: { desc: 'Integrität als Fundament materiellen Erfolgs.' },
    9: { desc: 'Pragmatische Umsetzung trotz Idealismus.' }
  },

  karmic: {
    1: { lesson: 'Souveränität', desc: 'Entwicklung von Führung ohne Bestätigungsbedarf.' },
    2: { lesson: 'Synergie', desc: 'Empathie als operativer Vorteil etablieren.' },
    3: { lesson: 'Klarheit', desc: 'Zerstreuung in fokussierten Ausdruck wandeln.' },
    4: { lesson: 'Disziplin', desc: 'Struktur als Voraussetzung für Freiheit nutzen.' },
    5: { lesson: 'Tiefe', desc: 'Flucht-Reflexe in haltbare Präsenz transformieren.' },
    6: { lesson: 'Harmonie', desc: 'Verantwortung ohne Selbstaufgabe tragen.' },
    7: { lesson: 'Wahrheit', desc: 'Stille zur Dekodierung der Realität nutzen.' },
    8: { lesson: 'Integrität', desc: 'Erfolg durch faire Kraft statt Dominanz.' },
    9: { lesson: 'Vollendung', desc: 'Radikaler Abschluss zur Raumschaffung.' }
  },

  getStrategy(lp) {
    const strategies = {
      1: 'Übernimm Initiative. Warte nicht auf externe Validierung.',
      2: 'Setze klare Grenzen. Nutze Empathie strategisch.',
      3: 'Fokussiere auf EINE Idee bis zum Resultat.',
      4: 'Baue stabile Rahmen, bleibe darin flexibel.',
      5: 'Nutze Wandel als Beschleuniger, nicht als Flucht.',
      6: 'Stabilisiere dich selbst, dann das Umfeld.',
      7: 'Wandle Erkenntnis in messbare Taten um.',
      8: 'Skaliere durch Integrität, nicht durch Macht.',
      9: 'Denke kollektiv. Deine Wirkung braucht Maßstab.',
      11: 'Vertraue deiner Intuition. Sie ist dein Kompass.',
      22: 'Baue das Unmögliche. Beginne heute.'
    };
    return strategies[lp] || 'Handle konsequent nach deiner Konfiguration.';
  }
};

/* ─── THE ARTIFACT: INTERPRETATION ENGINE (v2.5) ────────────────────────── */

const DEEP_DECODE_MATRIX = {
  lifePath: {
    1: { title: 'DER PIONIER', essence: 'Bauplan: Führung und Neuanfang. Autarke Ausführung.', strengths: 'Hohe Eigenständigkeit. Kein Bedarf an externer Validierung. Starker Wille.', challenges: 'Fehlende Geduld. Isolation führt zum System-Stillstand.', purpose: 'Demonstration individueller Willenskraft als primärer Impuls.' },
    2: { title: 'DER VERBINDER', essence: 'Bauplan: Harmonie und Bündnis-Optimierung.', strengths: 'Hohe Empathie. Signal-Detektion für Bedürfnisse. Synergie-Talent.', challenges: 'Selbstaufgabe zur Konfliktvermeidung. Druck-Ansammlung durch unterdrückte Bedürfnisse.', purpose: 'Stabilisierung von Gruppen-Entitäten durch integrierte Harmonie.' },
    3: { title: 'DER ALCHIMIST', essence: 'Bauplan: Wirkung durch Ausdruck. Signal-Verstärkung.', strengths: 'Hohe Überzeugungskraft. Transformation von Ideen in Begeisterung. Kreativer Impuls.', challenges: 'Energie-Verlust durch Zerstreuung. Hohe Anzahl unvollendeter Projekte.', purpose: 'Injektion von Inspiration in das gesellschaftliche System.' },
    4: { title: 'DER ARCHITEKT', essence: 'Bauplan: Struktur und Fundament-Sicherung.', strengths: 'Methodische Präzision. Aufbau langfristiger Systeme. Hohe Beständigkeit.', challenges: 'System-Erstarrung durch Kontrollzwang. Angst vor unvorhersehbaren Variablen.', purpose: 'Konstruktion belastbarer Rahmenbedingungen für Visionen.' },
    5: { title: 'DER FREIHEITSSUCHER', essence: 'Bauplan: Adaption und Wandel. System-Flexibilität.', strengths: 'Hohe Anpassungsrate. Schnelle Lösung von Blockaden. Neugier-Antrieb.', challenges: 'Flucht vor System-Tiefe. Unberechenbarkeit führt zu Bindungsverlust.', purpose: 'Demonstration von Sicherheit durch dynamische Bewegung.' },
    6: { title: 'DER MONITOR', essence: 'Bauplan: Stabilisierung und System-Fürsorge.', strengths: 'Hohe soziale Verantwortung. Potential-Erkennung. Stabilisierendes Feld.', challenges: 'Ressourcen-Erschöpfung durch Fremdlast-Übernahme. Helfer-Syndrom.', purpose: 'Schaffung geschützter Räume für optimale Entwicklung.' },
    7: { title: 'DER ANALYTIKER', essence: 'Bauplan: Dekodierung der System-Essenz.', strengths: 'Präziser Verstand. Muster-Erkennung jenseits der Oberfläche. Tiefen-Analyse.', challenges: 'Isolation im analytischen Raum. Realitäts-Verlust durch Handlungs-Lähmung.', purpose: 'Bereitstellung von Klarheit als Voraussetzung für Freiheit.' },
    8: { title: 'DER REALISIERER', essence: 'Bauplan: Manifestation und Skalierung.', strengths: 'Verständnis für Macht-Strukturen. Fokus auf messbare Resultate. Autoritäts-Aspekt.', challenges: 'Identifikation über materielle Werte. Macht-Missbrauch als Default-Risiko.', purpose: 'Beweisführung stabiler Dominanz durch Integrität.' },
    9: { title: 'DER VOLLENDETER', essence: 'Bauplan: Abschluss und Universal-Abgleich.', strengths: 'Ganzheitliche Sichtweise. Abschluss-Fähigkeit für komplexe Zyklen. Weisheits-Transfer.', challenges: 'Idealismus-Überhang. Vernachlässigung notwendiger physischer Schritte.', purpose: 'Vollendung von Kreisläufen zur Einleitung neuer System-Iterationen.' },
    11: { title: 'DER INSPIRATOR', essence: 'Meister-Signal: Antenne für systemische Wahrheit.', strengths: 'Intuitiver Direkt-Zugriff. Wirkung allein durch Präsenz. Hohe Resonanz.', challenges: 'Reiz-Überflutung durch extreme Sensitivität. Neigung zur Realitäts-Flucht.', purpose: 'Übertragung von Impulsen aus dem unbewussten Raum.' },
    22: { title: 'DER WELTENBAUMEISTER', essence: 'Meister-Signal: Transformation von Vision in Materie.', strengths: 'Enormes Bau-Potential. Skalierung von Träumen in Stein. Schöpferische Dominanz.', challenges: 'Lähmung durch Potential-Druck. Unterdrückung der eigenen Größe.', purpose: 'Konstruktion von Strukturen zur Sicherung der kollektiven Zukunft.' }
  },

  harmony: {
    excellent: { title: 'OPTIMALE HARMONIE', desc: 'Dein Bauplan ist synchronisiert. Entscheidungen fließen verlustfrei aus deiner Natur.', warning: 'Warnung: Fehlende Reibung begünstigt Stagnation. Suche gezielt nach Widerstand.' },
    good: { title: 'AKTIVER ABGLEICH', desc: 'Spannungsfelder zwischen Kernzahlen detektiert. Das ist dein innerer Treibstoff.', action: 'Anweisung: Identifiziere den Konflikt zwischen Logik und Impuls.' },
    low: { title: 'SYSTEMKONFLIKT', desc: 'Fundamentale Spannungen im Bauplan. Hoher Energie-Verlust durch innere Reibung.', urgency: 'Priorität: Beseitige die primäre Diskrepanz im System.' }
  },

  grid: {
    mental: { name: 'MENTALER FOKUS', present: 'Strukturiertes Denken. Objektive Problem-Lösung als Standard.', absent: 'Intuitiver Zugriff. Erkennung des Gesamtbildes ohne analytische Kette.' },
    emotional: { name: 'EMOTIONALER FOKUS', present: 'Hohe Detektions-Rate für Signale im Umfeld. Tiefe Wahrnehmung.', absent: 'Rationale Distanz. Emotionale Variablen stören die Prozess-Abwicklung nicht.' },
    physical: { name: 'PHYSISCHER FOKUS', present: 'Pragmatische Ausführung. Transformation von Ideen in physische Masse.', absent: 'Konzeptueller Fokus. Denken jenseits materieller Grenzen.' },
    thinking: { name: 'DENK-PROZESS', present: 'Logische Präzision. Objektive Analyse der Daten-Basis.', absent: 'Nicht-lineare Vernetzung. Detektion versteckter Synergien.' },
    will: { name: 'DURCHSETZUNG', present: 'Enorme Willenskraft. Erreichung gesetzter Ziele gegen Widerstand.', absent: 'Hohe Adoptions-Fähigkeit. Finden alternativer Wege bei Blockaden.' },
    action: { name: 'AUSFÜHRUNG', present: 'Schnelle Realisierung. Erfahrungsgewinn durch unmittelbares Handeln.', absent: 'Geplante Realisierung. Sicherung des Terrains vor dem ersten Schritt.' }
  },

  pinnacles: {
    1: { title: 'AUTONOMIE', desc: 'Fokus auf Identitäts-Sicherung. Aufbau einer eigenständigen Kraft-Einheit.' },
    2: { title: 'SYNERGIE', desc: 'Fokus auf Bündnisse. Strategische Verbindung mit anderen Entitäten.' },
    3: { title: 'PRÄSENZ', desc: 'Fokus auf Sichtbarkeit. Expression des eigenen Bauplans nach außen.' },
    4: { title: 'STABILITÄT', desc: 'Fokus auf Fundament. Bau von Strukturen, die den Zeitfluss überdauern.' },
    5: { title: 'EXPANSION', desc: 'Fokus auf Wandel. Sprengung alter System-Grenzen zur Neuausrichtung.' },
    6: { title: 'GLEICHGEWICHT', desc: 'Fokus auf Verantwortung. Übernahme tragender Rollen im System.' },
    7: { title: 'ESSENZ', desc: 'Fokus auf Wahrheit. Dekodierung der tieferen Mechanismen der Existenz.' },
    8: { title: 'DOMINANZ', desc: 'Fokus auf Erfolg. Phase höchster physischer und materieller Wirkung.' },
    9: { title: 'ABSCHLUSS', desc: 'Fokus auf Vollendung. Überführung alter Daten in einen neuen Zyklus.' },
    11: { title: 'ILLUMINATION', desc: 'Fokus auf Intuition. Wirkung als systemischer Wegweiser für andere.' },
    22: { title: 'MANIFESTATION', desc: 'Fokus auf Schöpfung. Bau von Monumenten des eigenen Bauplans.' }
  },

  cycles: {
    early: {
      1: { theme: 'AUTONOMIE', task: 'Etablierung der eigenen Stimme. Trennung von externer Erlaubnis.' },
      2: { theme: 'BÜNDNIS', task: 'Detektion des Werts von Zusammenarbeit und Signal-Wahrnehmung.' },
      3: { theme: 'AUSDRUCK', task: 'Versuchs-Zyklen zum authentischen Ausdruck des Bauplans.' },
      4: { theme: 'FUNDAMENT', task: 'Bau der ersten stabilen Strukturen. Training der System-Disziplin.' },
      5: { theme: 'WANDEL', task: 'Sammeln von Daten-Punkten durch schnelle Adaption und Erfahrung.' },
      6: { theme: 'STABILITÄT', task: 'Übernahme von Verantwortung zur Sicherung des Umfelds.' },
      7: { theme: 'ANALYSE', task: 'Hinterfragung der Default-Antworten. Suche nach der System-Wahrheit.' },
      8: { theme: 'WIRKUNG', task: 'Training im Umgang mit Macht-Variablen und physischem Erfolg.' },
      9: { theme: 'VOLLENDUNG', task: 'Lerne den Prozess des Loslassens zur Vorbereitung neuer Zyklen.' },
      11: { theme: 'INTUITION', task: 'Training der inneren Antenne. Detektion von Mustern hinter den Daten.' },
      22: { theme: 'VISION', task: 'Vorbereitung großer System-Bauten. Erfassung technischer Tiefe.' }
    },
    middle: {
      1: { theme: 'INDEPENDENZ', task: 'Beweisführung des autarken Bauplans. Etablierung als Kraft-Zentrum.' },
      2: { theme: 'SYNERGIE', task: 'Integration in tiefe Bündnisse ohne Verlust der Eigenständigkeit.' },
      3: { theme: 'IMPACT', task: 'Optimale Sichtbarkeit. Transformation der inneren Realität nach außen.' },
      4: { theme: 'STRUKTUR', task: 'Langfristige Sicherung des Terrains. Bau von dauerhaften Systemen.' },
      5: { theme: 'ADAPTION', task: 'Durchlauf radikaler Transformations-Zyklen. Identitäts-Update.' },
      6: { theme: 'ORDNUNG', task: 'Einnahme des Platzes als tragende Säule innerhalb der Gesellschaft.' },
      7: { theme: 'ESSENZ', task: 'Entwicklung intellektueller oder systemischer Tiefe. Sinn-Suche.' },
      8: { theme: 'EFFIZIENZ', task: 'Erreichung messbare Ziele. Etablierung als anerkannte Autorität.' },
      9: { theme: 'UNIVERSAL', task: 'Extension des Einflusses auf kollektive Ziele jenseits des Selbst.' },
      11: { theme: 'ILLUMINATION', task: 'Wirkung als systemischer Wegweiser. Transfer von intuitivem Wissen.' },
      22: { theme: 'MANIFESTATION', task: 'Schöpfung von Monumenten. Transformation von Vision in harte Realität.' }
    },
    late: {
      1: { theme: 'SOUVERÄNITÄT', task: 'Bestimmung des Rhythmus ohne Rücksicht auf System-Druck.' },
      2: { theme: 'WEISHEIT', task: 'Transfer der Erfahrung in Bündnissen. Spuren-Hinterlegung.' },
      3: { theme: 'PRÄSENZ', task: 'Erhaltung der Ausdruckskraft. Nutzung des Alters als Signal-Vorteil.' },
      4: { theme: 'ERNTE', task: 'Nutze die Resultate aus den gebauten Strukturen. Reife-Phase.' },
      5: { theme: 'FREIHEIT', task: 'Nutzung der Unabhängigkeit für neue praktische Räume.' },
      6: { theme: 'HARMONIE', task: 'Wirkung als ordnende Instanz allein durch physische Präsenz.' },
      7: { theme: 'STILLE', task: 'Klarheit durch Loslösung von materiellen Parametern.' },
      8: { theme: 'LEGACY', task: 'Absicherung der Wirkung über die eigene Existenz hinaus.' },
      9: { theme: 'VOLLENDUNG', task: 'Durchlauf der finalen Korrektur. Vorbereitung des Übergangs.' },
      11: { theme: 'REIFE-SEHEN', task: 'Klarheit durch visionäre Distanz. Abschluss der inneren Dekodierung.' },
      22: { theme: 'LEGACY-BAU', task: 'Absicherung systemischer Werke für kommende Iterationen.' }
    }
  },

  challenges: {
    0: { desc: 'Keine primäre Spannung detektiert. Risiko: Selbstzufriedenheit.' },
    1: { desc: 'Anweisung: Setze deine Stimme durch. Bauplan darf nicht untersinken.' },
    2: { desc: 'Anweisung: Setze klare Grenzen. Vermeidung von Dominanz anderer.' },
    3: { desc: 'Anweisung: Beende die Zerstreuung. Konzentration auf den Kern-Impuls.' },
    4: { desc: 'Anweisung: Lerne das Loslassen starrer Regeln und Strukturen.' },
    5: { desc: 'Anweisung: Halte die innerliche Tiefe aus. Beende die Flucht-Reflexe.' },
    6: { desc: 'Anweisung: Priorisiere den eigenen Bauplan vor fremder Last.' },
    7: { desc: 'Anweisung: Beende die Analyse-Lähmung. Gehe in die physische Umsetzung.' },
    8: { desc: 'Anweisung: Nutze deine Macht messbar, aber ohne Integritäts-Verlust.' },
    9: { desc: 'Anweisung: Bleibe messbar and praktisch. Vermeide Idealismus-Blasen.' }
  },

  bridges: {
    0: "Keine Kluft detektiert. Denken und Handeln sind synchronisiert.",
    1: "Kluft der Individualität: Lerne, ohne Angst eigenständig zu entscheiden.",
    2: "Kluft der Diplomatie: Lerne, Konflikte als Synergie zu begreifen.",
    3: "Kluft des Ausdrucks: Überwinde die Barriere zwischen Gedanke und Stimme.",
    4: "Kluft der Ordnung: Lerne, dass Freiheit eine Struktur braucht.",
    5: "Kluft des Wandels: Akzeptiere die Unsicherheit als Teil deines Bauplans.",
    6: "Kluft der Harmonie: Erkenne, dass deine Last nicht die der anderen ist.",
    7: "Kluft der Tiefe: Erkenne, dass Logik allein die Wahrheit nicht fassen kann.",
    8: "Kluft der Macht: Lerne, Erfolg nicht als Beweis für Wert zu sehen.",
    9: "Kluft der Vision: Lerne, das große Ganze im Detail zu finden."
  },

  maturity: {
    1: "Reifeziel: Souveräne Führung. Du wirst im Alter zum autarken Zentrum.",
    2: "Reifeziel: Diplomatische Synergie. Deine Stärke liegt in der Vermittlung.",
    3: "Reifeziel: Inspirierender Ausdruck. Du wirst zur lebenden Ideenschmiede.",
    4: "Reifeziel: Manifeste Ordnung. Du schaffst bleibende, gereifte Werte.",
    5: "Reifeziel: Dynamische Neugier. Du bleibst geistig und physisch in Bewegung.",
    6: "Reifeziel: System-Stabilisierung. Du wirst zur tragenden Schutzzone.",
    7: "Reifeziel: Dekodierte Weisheit. Du findest die Wahrheit hinter den Daten.",
    8: "Reifeziel: Integre Dominanz. Erfolg wird zum Werkzeug deines Charakters.",
    9: "Reifeziel: Universeller Dienst. Dein Leben wird zum Kompass für andere."
  },

  karmic: {
    1: { lesson: 'SOUVERÄNITÄT', desc: 'System-Upgrade: Lerne, ohne Bestätigung von außen zu führen.' },
    2: { lesson: 'SYNERGIE', desc: 'System-Upgrade: Entwickle Empathie als operativen Vorteil.' },
    3: { lesson: 'KLARHEIT', desc: 'System-Upgrade: Wandle Zerstreuung in fokussierten Ausdruck.' },
    4: { lesson: 'DISZIPLIN', desc: 'System-Upgrade: Struktur ist die Voraussetzung für Freiheit.' },
    5: { lesson: 'TIEFE', desc: 'System-Upgrade: Beende die Flucht; lerne die operative Tiefe zu halten.' },
    6: { lesson: 'HARMONIE', desc: 'System-Upgrade: Akzeptiere Verantwortung ohne Selbstaufgabe.' },
    7: { lesson: 'WAHRHEIT', desc: 'System-Upgrade: Nutze die Stille zur Dekodierung der Realität.' },
    8: { lesson: 'INTEGRITÄT', desc: 'System-Upgrade: Siege durch faire Kraft, nicht durch Dominanz.' },
    9: { lesson: 'VOLLENDUNG', desc: 'System-Upgrade: Schließe Zyklen radikal ab, um Raum zu schaffen.' }
  },

  getStrategicTips(lp) {
    const t = {
      1: "Übernimm die volle Kontrolle. Warte nicht auf Erlaubnis.",
      2: "Setze klare Grenzen. Lass dich nicht als Puffer missbrauchen.",
      3: "Fokussiere deine Energie auf EINE Idee bis zum Resultat.",
      4: "Strukturen dienen DIR, nicht umgekehrt. Bleibe flexibel.",
      5: "Nutze den Wandel. Skaliere jetzt, wenn alles umbricht.",
      6: "Stabilisiere dich selbst, bevor du andere führst.",
      7: "Wandle Wissen in Taten um. Beginne die Umsetzung heute.",
      8: "Skaliere durch Integrität. Ehrlichkeit ist dein Fundament.",
      9: "Denke global. Deine Wirkung braucht einen großen Maßstab.",
      11: "Vertraue deiner Intuition über jede Logik. Zweifle nicht.",
      22: "Baue das Unmögliche jetzt. Nimm heute den ersten Stein."
    };
    return t[lp] || "Handle konsequent nach deinem Bauplan.";
  }
};

/* ─── PDF ENGINE (v2.5 - Symmetrical Reboot) ───────────────────────────── */

export function generateSectionContent(data) {
  const lp = data.core.lifePath.split('/')[0];
  const lpNum = parseInt(lp, 10);
  const lpData = DEEP_DECODE_MATRIX.lifePath[lpNum] || DEEP_DECODE_MATRIX.lifePath[9];
  const harmScore = data.quantum.score;
  const hD = DEEP_DECODE_MATRIX.harmony[harmScore >= 80 ? 'excellent' : harmScore >= 45 ? 'good' : 'low'];
  const grid = data.loShu;
  const hasM = ['4','9','2'].every(n => grid.grid[n] > 0);
  const hasE = ['3','5','7'].every(n => grid.grid[n] > 0);
  const hasP = ['8','1','6'].every(n => grid.grid[n] > 0);
  
  const b1 = data.bridges.lifeExpr;
  const b2 = data.bridges.soulPers;
  const matNum = reduceForceSingle(lpNum + reduceForceSingle(data.core.expression.split('/')[0]));

  return [
    { type: 'cover', title: 'DEEP DECODE', subtitle: 'SYSTEM-BLUEPRINT', name: data.meta.name.toUpperCase(), meta: `REF_ID: ${Math.random().toString(16).substr(2, 6).toUpperCase()} // BORN: ${data.meta.date}` },
    
    { 
      type: 'section', title: `SEKTION I: ${lpData.title}`, 
      blocks: [
        { type: 'text', text: lpData.essence },
        { type: 'row', label: 'LEBENSZAHL', val: data.core.lifePath, desc: 'Kern-Mission des Bauplans' },
        { type: 'row', label: 'SEELENZAHL', val: data.core.soulUrge, desc: 'Innere Signal-Stärke' },
        { type: 'row', label: 'AUSDRUCKSZAHL', val: data.core.expression, desc: 'Operatives Potential' },
        { type: 'row', label: 'REIFEZAHL', val: String(matNum), desc: DEEP_DECODE_MATRIX.maturity[matNum] },
        { type: 'text', text: `MISSION: ${lpData.purpose}` }
      ] 
    },
    
    { 
      type: 'section', title: 'SEKTION II: ENERGIE-HARMONIE', 
      blocks: [
        { type: 'visual', visual: 'scale', score: harmScore, label: hD.title },
        { type: 'text', text: hD.desc },
        { type: 'row', label: 'BRÜCKE 1', val: String(b1), desc: DEEP_DECODE_MATRIX.bridges[b1] },
        { type: 'row', label: 'BRÜCKE 2', val: String(b2), desc: DEEP_DECODE_MATRIX.bridges[b2] },
        { type: 'text', text: hD.warning || hD.action || hD.urgency }
      ] 
    },
    
    { 
      type: 'section', title: 'SEKTION III: SYSTEM-MUSTER', 
      blocks: [
        { type: 'visual', visual: 'grid', grid: grid.grid },
        { type: 'row', label: 'MENTAL', val: hasM ? 'AKTIV' : 'POTENZIAL-FOKUS', desc: DEEP_DECODE_MATRIX.grid.mental[hasM ? 'present' : 'absent'] },
        { type: 'row', label: 'EMOTIONAL', val: hasE ? 'AKTIV' : 'POTENZIAL-FOKUS', desc: DEEP_DECODE_MATRIX.grid.emotional[hasE ? 'present' : 'absent'] },
        { type: 'row', label: 'PHYSISCH', val: hasP ? 'AKTIV' : 'POTENZIAL-FOKUS', desc: DEEP_DECODE_MATRIX.grid.physical[hasP ? 'present' : 'absent'] }
      ] 
    },
    
    { 
      type: 'section', title: 'SEKTION IV: ZEIT-ZYKLEN', 
      blocks: [
        { type: 'row', label: 'START (0-28J)', val: data.cycles.c1, desc: `${DEEP_DECODE_MATRIX.cycles.early[data.cycles.c1]?.theme || 'IMPULS'}: ${DEEP_DECODE_MATRIX.cycles.early[data.cycles.c1]?.task || 'Entwicklung der individuellen Kraft.'}` },
        { type: 'row', label: 'EXPANSION (29-56J)', val: data.cycles.c2, desc: `${DEEP_DECODE_MATRIX.cycles.middle[data.cycles.c2]?.theme || 'WIRKUNG'}: ${DEEP_DECODE_MATRIX.cycles.middle[data.cycles.c2]?.task || 'Maximierung des systemischen Einflusses.'}` },
        { type: 'row', label: 'REIFE (57J+)', val: data.cycles.c3, desc: `${DEEP_DECODE_MATRIX.cycles.late[data.cycles.c3]?.theme || 'ERBE'}: ${DEEP_DECODE_MATRIX.cycles.late[data.cycles.c3]?.task || 'Absicherung der lebenslangen Resultate.'}` }
      ] 
    },
    
    { 
      type: 'section', title: 'SEKTION V: MEILENSTEINE', 
      blocks: [
        { type: 'row', label: 'MEILENSTEIN 1', val: data.pinnacles.p1, desc: DEEP_DECODE_MATRIX.pinnacles[data.pinnacles.p1]?.desc || 'Fokus auf System-Stabilität.' },
        { type: 'row', label: 'MEILENSTEIN 2', val: data.pinnacles.p2, desc: DEEP_DECODE_MATRIX.pinnacles[data.pinnacles.p2]?.desc || 'Fokus auf System-Wachstum.' },
        { type: 'row', label: 'MEILENSTEIN 3', val: data.pinnacles.p3, desc: DEEP_DECODE_MATRIX.pinnacles[data.pinnacles.p3]?.desc || 'Fokus auf System-Tiefe.' },
        { type: 'row', label: 'MEILENSTEIN 4', val: data.pinnacles.p4, desc: DEEP_DECODE_MATRIX.pinnacles[data.pinnacles.p4]?.desc || 'Fokus auf System-Vollendung.' }
      ] 
    },
    
    { 
      type: 'section', title: 'SEKTION VI: HERAUSFORDERUNGEN', 
      blocks: [
        { type: 'row', label: 'HÜRDE 1', val: data.challenges.ch1, desc: DEEP_DECODE_MATRIX.challenges[data.challenges.ch1]?.desc || 'Lerne das Gleichgewicht im System zu halten.' },
        { type: 'row', label: 'HÜRDE 2', val: data.challenges.ch2, desc: DEEP_DECODE_MATRIX.challenges[data.challenges.ch2]?.desc || 'Lerne die operative Klarheit zu wahren.' },
        { type: 'row', label: 'KERN-AUFGABE', val: data.challenges.ch3, desc: DEEP_DECODE_MATRIX.challenges[data.challenges.ch3]?.desc || 'Integriere deinen Bauplan in die Realität.' }
      ] 
    },
    
    { 
      type: 'section', title: 'SEKTION VII: SYSTEM-UPGRADES', 
      blocks: [
        { type: 'text', text: 'Karmische Signaturen markieren notwendige System-Upgrades für dein volles Potential.' },
        ...data.karma.lessons.map(n => ({ type: 'row', label: `UPGRADE ${n}`, val: DEEP_DECODE_MATRIX.karmic[n]?.lesson || 'KLARHEIT', desc: DEEP_DECODE_MATRIX.karmic[n]?.desc || 'Keine signifikante Lücke detektiert.' })),
        { type: 'row', label: 'KERN-IMPULS', val: data.karma.passion.join(', '), desc: 'Deine dominanteste Schwingungs-Antenne.' }
      ] 
    },
    
    { 
      type: 'section', title: 'SEKTION VIII: AUSFÜHRUNGS-PLAN', 
      blocks: [
        { type: 'row', label: 'STRATEGIE', val: lp, desc: DEEP_DECODE_MATRIX.getStrategicTips(lpNum) },
        { type: 'text', text: 'ANWEISUNG 01: Behandle deinen Bauplan als fundamentale Hardware-Konstante.' },
        { type: 'text', text: 'ANWEISUNG 02: Beseitige alle energetischen Dissonanzen durch radikales Handeln.' },
        { type: 'text', text: 'ANWEISUNG 03: Vertraue der Präzision des Systems über externe Meinungen.' }
      ] 
    },
    
    { 
      type: 'section', title: 'SEKTION IX: SYSTEM-AKTIVIERUNG', 
      blocks: [
        { type: 'text', text: 'Wissen ohne Umsetzung ist Entropie. Das Artefakt ist nun vollendet.' },
        { type: 'text', text: 'MBRN HUB — DEEP DECODE // VERSION 2.5\nSTATUS: VOLLSTÄNDIG' },
        { type: 'text', text: 'END OF DECODE.', style: 'technical' }
      ] 
    }
  ];
}

export async function generateDeepReport(data) {
  const { jsPDF } = await import("https://esm.sh/jspdf@latest");
  const doc = new jsPDF('p', 'mm', 'a4');
  const midX = doc.internal.pageSize.getWidth() / 2;
  const pc = [255,255,255], ac = [180,180,180], dc = [100,100,100];

  const drawFrame = (p) => {
    doc.setFillColor(10,10,10); doc.rect(0,0,210,297,'F');
    doc.setDrawColor(...dc); doc.setLineWidth(0.1);
    doc.rect(10,10,190,277); 
    doc.setFontSize(6); doc.setTextColor(...dc);
    doc.text(`MBRN::BLUEPRINT // P${p} // SHA-256:${Math.random().toString(16).substr(2,8)}`, midX, 8, { align: 'center' });
    doc.text('© 2026 MBRN_CORE_REPRODUCTION_PROHIBITED', midX, 292, { align: 'center' });
  };

  const drawGrid = (x, y, grid) => {
    const s = 18; const gX = x - (3*s)/2;
    doc.setDrawColor(...ac); doc.setLineWidth(0.3);
    for(let i=0; i<3; i++) for(let j=0; j<3; j++) doc.rect(gX+j*s, y+i*s, s, s);
    const map = [[4,9,2],[3,5,7],[8,1,6]];
    doc.setFontSize(12);
    map.forEach((row, rIdx) => row.forEach((n, cIdx) => {
      if (grid[n] > 0) {
        doc.setTextColor(...pc); doc.text(String(n), gX+cIdx*s+s/2, y+rIdx*s+s/2+4, { align:'center' });
      }
    }));
    return 3*s + 10;
  };

  const drawScale = (x, y, score) => {
    const w = 120; const sX = x - w/2;
    doc.setDrawColor(...dc); doc.rect(sX, y, w, 6);
    doc.setFillColor(...pc); doc.rect(sX, y, (score/100)*w, 6, 'F');
    doc.setFontSize(9); doc.setTextColor(...ac); doc.text('SYSTEM_SYNC_RESONANCE', midX, y-3, { align:'center' });
    doc.setTextColor(...pc); doc.text(`${score}%`, midX, y+15, { align:'center' });
    return 25;
  };

  const pages = generateSectionContent(data);
  pages.forEach((p, idx) => {
    if (idx > 0) doc.addPage();
    drawFrame(idx + 1);
    
    if (p.type === 'cover') {
      doc.setTextColor(...pc); doc.setFontSize(48); doc.text(p.title, midX, 140, { align: 'center' });
      doc.setFontSize(14); doc.setTextColor(...dc); doc.text(p.subtitle, midX, 150, { align: 'center' });
      doc.setFontSize(26); doc.setTextColor(...pc); doc.text(p.name, midX, 190, { align: 'center' });
    } else {
      let h = 0; h += 20; 
      p.blocks.forEach(b => {
        if (b.type === 'row') h += 25;
        else if (b.type === 'text') h += (b.text.split('\n').length * 7) + 12;
        else if (b.type === 'visual' && b.visual === 'grid') h += 65;
        else if (b.type === 'visual' && b.visual === 'scale') h += 35;
      });

      let y = (297 - h) / 2 + 5; 
      doc.setFontSize(16); doc.setTextColor(...pc); doc.text(p.title, midX, y, { align: 'center' });
      doc.setDrawColor(...dc); doc.line(30, y+3, 180, y+3); y += 18;

      p.blocks.forEach(b => {
        if (b.type === 'row') {
          doc.setFontSize(10); doc.setTextColor(...ac); doc.text(b.label.toUpperCase(), midX, y, { align: 'center' });
          doc.setFontSize(16); doc.setTextColor(...pc); doc.text(String(b.val), midX, y+8, { align: 'center' });
          if(b.desc) { doc.setFontSize(9); doc.setTextColor(...dc); doc.text(b.desc, midX, y+13, { maxWidth:120, align:'center' }); }
          y += 25;
        } else if (b.type === 'text') {
          doc.setFontSize(11); doc.setTextColor(200,200,200); doc.text(b.text, midX, y, { maxWidth:160, align: 'center' });
          y += (b.text.split('\n').length * 7) + 12;
        } else if (b.type === 'visual') {
          if (b.visual === 'grid') { y += drawGrid(midX, y, b.grid); }
          else if (b.visual === 'scale') { y += drawScale(midX, y, b.score); }
        }
      });
    }
  });
  return doc;
}

/* ─── VISION E: THE OPERATOR PDF ENGINE ─────────────────────────────────── */

export async function generateOperatorReport(data) {
  const { jsPDF } = await import("https://esm.sh/jspdf@latest");
  const doc = new jsPDF('p', 'mm', 'a4');
  const cfg = OPERATOR_CONFIG;
  const { bgPrimary, bgSecondary, textPrimary, textSecondary, textMuted, accent, border } = cfg.colors;
  
  const lp = data.core.lifePath.split('/')[0];
  const lpNum = parseInt(lp, 10);
  const lpData = OPERATOR_MATRIX.lifePath[lpNum] || OPERATOR_MATRIX.lifePath[9];
  const harmScore = data.quantum.score;
  const hData = OPERATOR_MATRIX.harmony[harmScore >= 80 ? 'excellent' : harmScore >= 45 ? 'good' : 'low'];
  const grid = data.loShu;
  const hasM = ['4','9','2'].every(n => grid.grid[n] > 0);
  const hasE = ['3','5','7'].every(n => grid.grid[n] > 0);
  const hasP = ['8','1','6'].every(n => grid.grid[n] > 0);
  const matNum = reduceForceSingle(lpNum + reduceForceSingle(data.core.expression.split('/')[0]));
  const refId = `MB-${data.meta.name.substring(0,2).toUpperCase()}-${new Date().getFullYear().toString().substr(2)}${Math.random().toString(16).substr(2,4).toUpperCase()}`;

  // Helpers
  const drawFrame = (pageNum) => {
    doc.setFillColor(...bgPrimary);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setDrawColor(...border);
    doc.setLineWidth(0.3);
    doc.rect(15, 15, 180, 267);
    doc.setFontSize(7);
    doc.setTextColor(...textMuted);
    doc.text(`${refId} // P${pageNum}/9`, 105, 12, { align: 'center' });
    doc.text('MBRN // PERSONAL CONFIGURATION', 105, 285, { align: 'center' });
  };

  const drawCard = (x, y, w, h, label, value, desc, highlighted = false) => {
    doc.setFillColor(...bgSecondary);
    doc.rect(x, y, w, h, 'F');
    doc.setFillColor(...(highlighted ? accent : border));
    doc.rect(x, y, 2, h, 'F');
    doc.setFontSize(cfg.typography.sizes.micro);
    doc.setTextColor(...textSecondary);
    doc.text(label.toUpperCase(), x + 6, y + 10);
    doc.setFontSize(cfg.typography.sizes.value);
    doc.setTextColor(...textPrimary);
    doc.text(String(value), x + 6, y + 26);
    if (desc) {
      doc.setFontSize(cfg.typography.sizes.body);
      doc.setTextColor(...textMuted);
      doc.text(desc, x + 6, y + 38, { maxWidth: w - 12 });
    }
  };

  const drawArcProgress = (x, y, w, score) => {
    const h = 8;
    const filled = (w * score) / 100;
    // Background track
    doc.setFillColor(...border);
    doc.roundedRect(x - w/2, y, w, h, h/2, h/2, 'F');
    // Filled portion
    doc.setFillColor(...accent);
    doc.roundedRect(x - w/2, y, filled, h, h/2, h/2, 'F');
    // Score text
    doc.setFontSize(cfg.typography.sizes.value);
    doc.setTextColor(...textPrimary);
    doc.text(`${score}%`, x, y - 8, { align: 'center' });
    doc.setFontSize(cfg.typography.sizes.micro);
    doc.setTextColor(...textSecondary);
    doc.text('ABSTIMMUNG', x, y + 20, { align: 'center' });
  };

  const drawGridVisual = (x, y, size, gridData) => {
    const cell = size / 3;
    const map = [[4,9,2],[3,5,7],[8,1,6]];
    doc.setDrawColor(...border);
    doc.setLineWidth(0.5);
    for (let i = 0; i <= 3; i++) {
      doc.line(x, y + i * cell, x + size, y + i * cell);
      doc.line(x + i * cell, y, x + i * cell, y + size);
    }
    doc.setFontSize(10);
    map.forEach((row, r) => row.forEach((n, c) => {
      const active = gridData[n] > 0;
      doc.setTextColor(...(active ? textPrimary : textMuted));
      if (active && gridData[n] > 1) doc.setTextColor(...accent);
      doc.text(String(n), x + c * cell + cell/2, y + r * cell + cell/2 + 3, { align: 'center' });
    }));
  };

  // Page 1: Cover
  drawFrame(1);
  doc.setTextColor(...textPrimary);
  doc.setFontSize(10);
  doc.text('PERSONAL CONFIGURATION', 180, 25, { align: 'right' });
  doc.setFontSize(cfg.typography.sizes.hero);
  doc.text(data.meta.name.toUpperCase(), 25, 130);
  doc.setDrawColor(...accent);
  doc.setLineWidth(2);
  doc.line(25, 138, 100, 138);
  doc.setFontSize(cfg.typography.sizes.subtitle);
  doc.setTextColor(...textSecondary);
  doc.text(lpData.title.toUpperCase(), 25, 155);
  doc.setFontSize(cfg.typography.sizes.body);
  doc.setTextColor(...textMuted);
  doc.text(`REF: ${refId} // ${data.meta.date}`, 25, 270);

  // Page 2: Die Konfiguration
  doc.addPage();
  drawFrame(2);
  doc.setFontSize(cfg.typography.sizes.subtitle);
  doc.setTextColor(...textSecondary);
  doc.text('DIE KONFIGURATION', 105, 35, { align: 'center' });
  doc.setDrawColor(...accent);
  doc.line(60, 40, 150, 40);
  
  // Left: Life Path Hero
  doc.setFontSize(64);
  doc.setTextColor(...textPrimary);
  doc.text(lp, 40, 100);
  doc.setFontSize(cfg.typography.sizes.subtitle);
  doc.setTextColor(...accent);
  doc.text(lpData.title.toUpperCase(), 40, 115);
  doc.setFontSize(cfg.typography.sizes.body);
  doc.setTextColor(...textSecondary);
  doc.text(lpData.essence, 40, 130, { maxWidth: 70 });
  
  // Right: Three Data Cards
  drawCard(120, 60, 70, 45, 'Seelenzahl', data.core.soulUrge, 'Innere Signalstärke');
  drawCard(120, 110, 70, 45, 'Ausdruckszahl', data.core.expression, 'Operatives Potential');
  drawCard(120, 160, 70, 45, 'Reifezahl', matNum, `Ziel: ${OPERATOR_MATRIX.lifePath[matNum]?.title || 'Integration'}`, true);
  
  // Mission
  doc.setFontSize(cfg.typography.sizes.body);
  doc.setTextColor(...textPrimary);
  doc.text(`MISSION: ${lpData.focus}`, 105, 230, { align: 'center', maxWidth: 160 });

  // Page 3: Energie-Abstimmung
  doc.addPage();
  drawFrame(3);
  doc.setFontSize(cfg.typography.sizes.subtitle);
  doc.setTextColor(...textSecondary);
  doc.text('ENERGIE-ABSTIMMUNG', 105, 35, { align: 'center' });
  doc.setDrawColor(...accent);
  doc.line(60, 40, 150, 40);
  
  drawArcProgress(105, 110, 100, harmScore);
  
  doc.setFontSize(cfg.typography.sizes.subtitle);
  doc.setTextColor(...accent);
  doc.text(hData.label.toUpperCase(), 105, 155, { align: 'center' });
  doc.setFontSize(cfg.typography.sizes.body);
  doc.setTextColor(...textSecondary);
  doc.text(hData.desc, 105, 170, { align: 'center', maxWidth: 140 });
  doc.setTextColor(...textMuted);
  doc.text(hData.note, 105, 195, { align: 'center', maxWidth: 140 });

  // Page 4: Verhaltens-Matrix
  doc.addPage();
  drawFrame(4);
  doc.setFontSize(cfg.typography.sizes.subtitle);
  doc.setTextColor(...textSecondary);
  doc.text('VERHALTENS-MATRIX', 105, 35, { align: 'center' });
  doc.setDrawColor(...accent);
  doc.line(60, 40, 150, 40);
  
  drawGridVisual(30, 60, 70, grid.grid);
  
  const yStart = 60;
  ['mental', 'emotional', 'physical'].forEach((type, i) => {
    const hasIt = type === 'mental' ? hasM : type === 'emotional' ? hasE : hasP;
    const label = type === 'mental' ? 'MENTAL' : type === 'emotional' ? 'EMOTIONAL' : 'PHYSISCH';
    const y = yStart + i * 50;
    doc.setFontSize(cfg.typography.sizes.micro);
    doc.setTextColor(...textSecondary);
    doc.text(label, 120, y);
    doc.setFontSize(cfg.typography.sizes.subtitle);
    doc.setTextColor(...(hasIt ? accent : textPrimary));
    doc.text(hasIt ? 'AKTIV' : 'POTENZIAL', 120, y + 12);
    doc.setFontSize(cfg.typography.sizes.body);
    doc.setTextColor(...textMuted);
    doc.text(OPERATOR_MATRIX.grid[type][hasIt ? 'active' : 'potential'], 120, y + 22, { maxWidth: 70 });
  });

  // Page 5: Lebens-Phasen
  doc.addPage();
  drawFrame(5);
  doc.setFontSize(cfg.typography.sizes.subtitle);
  doc.setTextColor(...textSecondary);
  doc.text('LEBENS-PHASEN', 105, 35, { align: 'center' });
  doc.setDrawColor(...accent);
  doc.line(70, 40, 140, 40);
  
  const phases = [
    { label: 'START', range: '0-28J', val: data.cycles.c1, period: 'early' },
    { label: 'EXPANSION', range: '29-56J', val: data.cycles.c2, period: 'middle' },
    { label: 'REIFE', range: '57J+', val: data.cycles.c3, period: 'late' }
  ];
  
  phases.forEach((phase, i) => {
    const y = 70 + i * 70;
    const cycleData = OPERATOR_MATRIX.cycles[phase.period][phase.val];
    drawCard(30, y, 150, 55, `${phase.label} (${phase.range})`, phase.val, `${cycleData?.theme || 'Entwicklung'}: ${cycleData?.task || 'Wachstum'}`, i === 1);
  });

  // Page 6: Wendepunkte
  doc.addPage();
  drawFrame(6);
  doc.setFontSize(cfg.typography.sizes.subtitle);
  doc.setTextColor(...textSecondary);
  doc.text('WENDEPUNKTE', 105, 35, { align: 'center' });
  doc.setDrawColor(...accent);
  doc.line(70, 40, 140, 40);
  
  const milestones = [
    { label: 'MEILENSTEIN 1', val: data.pinnacles.p1 },
    { label: 'MEILENSTEIN 2', val: data.pinnacles.p2 },
    { label: 'MEILENSTEIN 3', val: data.pinnacles.p3 },
    { label: 'MEILENSTEIN 4', val: data.pinnacles.p4 }
  ];
  
  milestones.forEach((m, i) => {
    const x = 30 + (i % 2) * 85;
    const y = 60 + Math.floor(i / 2) * 90;
    const pData = OPERATOR_MATRIX.pinnacles[m.val];
    drawCard(x, y, 75, 75, m.label, m.val, pData?.title || 'Entwicklung');
  });

  // Page 7: Herausforderungen
  doc.addPage();
  drawFrame(7);
  doc.setFontSize(cfg.typography.sizes.subtitle);
  doc.setTextColor(...textSecondary);
  doc.text('ENTWICKLUNGSFELDER', 105, 35, { align: 'center' });
  doc.setDrawColor(...accent);
  doc.line(60, 40, 150, 40);
  
  const challenges = [
    { label: 'FOKUS 1', val: data.challenges.ch1 },
    { label: 'FOKUS 2', val: data.challenges.ch2 },
    { label: 'KERN-AUFGABE', val: data.challenges.ch3 }
  ];
  
  challenges.forEach((c, i) => {
    const cData = OPERATOR_MATRIX.challenges[c.val];
    drawCard(30, 60 + i * 65, 150, 55, c.label, c.val, cData?.desc || 'Integration', i === 2);
  });

  // Page 8: System-Upgrades
  doc.addPage();
  drawFrame(8);
  doc.setFontSize(cfg.typography.sizes.subtitle);
  doc.setTextColor(...textSecondary);
  doc.text('ENTWICKLUNGS-FOKUS', 105, 35, { align: 'center' });
  doc.setDrawColor(...accent);
  doc.line(60, 40, 150, 40);
  
  doc.setFontSize(cfg.typography.sizes.body);
  doc.setTextColor(...textMuted);
  doc.text('Bereiche mit besonderem Entwicklungspotential:', 105, 55, { align: 'center' });
  
  data.karma.lessons.forEach((n, i) => {
    const y = 75 + i * 35;
    const kData = OPERATOR_MATRIX.karmic[n];
    doc.setFontSize(cfg.typography.sizes.micro);
    doc.setTextColor(...textSecondary);
    doc.text(`ENTWICKLUNGSBEREICH ${n}`, 30, y);
    doc.setFontSize(cfg.typography.sizes.subtitle);
    doc.setTextColor(...accent);
    doc.text(kData?.lesson || 'KLARHEIT', 30, y + 12);
    doc.setFontSize(cfg.typography.sizes.body);
    doc.setTextColor(...textMuted);
    doc.text(kData?.desc || '', 30, y + 22, { maxWidth: 150 });
  });
  
  // Kern-Impuls
  const passionY = 75 + data.karma.lessons.length * 35 + 15;
  doc.setFontSize(cfg.typography.sizes.micro);
  doc.setTextColor(...textSecondary);
  doc.text('HAUPTANTRIEB', 30, passionY);
  doc.setFontSize(cfg.typography.sizes.subtitle);
  doc.setTextColor(...textPrimary);
  doc.text(data.karma.passion.join(', '), 30, passionY + 12);

  // Page 9: Aktivierung
  doc.addPage();
  drawFrame(9);
  doc.setFontSize(cfg.typography.sizes.subtitle);
  doc.setTextColor(...textSecondary);
  doc.text('AKTIVIERUNGSPROTOKOLL', 105, 35, { align: 'center' });
  doc.setDrawColor(...accent);
  doc.line(55, 40, 155, 40);
  
  // Strategy
  doc.setFontSize(cfg.typography.sizes.micro);
  doc.setTextColor(...textSecondary);
  doc.text('STRATEGIE', 105, 70, { align: 'center' });
  doc.setFontSize(cfg.typography.sizes.value);
  doc.setTextColor(...accent);
  doc.text(lp, 105, 90, { align: 'center' });
  doc.setFontSize(cfg.typography.sizes.body);
  doc.setTextColor(...textPrimary);
  doc.text(OPERATOR_MATRIX.getStrategy(lpNum), 105, 105, { align: 'center', maxWidth: 140 });
  
  // Instructions
  const instructions = [
    'Behandle deine Konfiguration als fundamentale Konstante.',
    'Beseitige energetische Dissonanzen durch konsequentes Handeln.',
    'Vertraue der Präzision des Systems über externe Meinungen.'
  ];
  
  instructions.forEach((inst, i) => {
    doc.setFontSize(cfg.typography.sizes.body);
    doc.setTextColor(...textMuted);
    doc.text(`0${i+1}`, 40, 140 + i * 25);
    doc.setTextColor(...textSecondary);
    doc.text(inst, 55, 140 + i * 25, { maxWidth: 140 });
  });
  
  // Closing
  doc.setFontSize(cfg.typography.sizes.body);
  doc.setTextColor(...textPrimary);
  doc.text('Wissen ohne Umsetzung ist verlorenes Potential.', 105, 230, { align: 'center' });
  doc.setFontSize(cfg.typography.sizes.micro);
  doc.setTextColor(...textMuted);
  doc.text('MBRN // PERSONAL CONFIGURATION // v3.0', 105, 270, { align: 'center' });

  return doc;
}
