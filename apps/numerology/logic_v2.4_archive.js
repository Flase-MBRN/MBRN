/**
 * /apps/numerology/logic.js
 * FULL SCALE NUMEROLOGY ENGINE — v2.3 (UNIVERSAL CLARITY EDITION)
 * * Persona: Flase (Anonym, monolithisch, präzise)
 * Ziel: Maximale psychologische Tiefe bei höchster Verständlichkeit.
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
    interpretation: final >= 80 ? 'Hohe Klarheit' : final >= 45 ? 'Gute Balance' : 'System-Hindernis' 
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

/* ─── THE ARTIFACT: INTERPRETATION ENGINE (v2.3) ────────────────────────── */

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
    mental: { name: 'MENTAL (4-9-2)', present: 'Strukturiertes Denken. Objektive Problem-Lösung als Default.', absent: 'Intuitiver Zugriff. Erkennung des Gesamtbildes ohne analytische Kette.' },
    emotional: { name: 'EMOTIONAL (3-5-7)', present: 'Hohe Detektions-Rate für Signale im Umfeld. Tiefe Wahrnehmung.', absent: 'Rationale Distanz. Emotionale Variablen stören die Prozess-Abwicklung nicht.' },
    physical: { name: 'PHYSISCH (8-1-6)', present: 'Pragmatische Ausführung. Transformation von Ideen in physische Masse.', absent: 'Konzeptueller Fokus. Denken jenseits materieller Grenzen.' },
    thinking: { name: 'DENK-PROZESS (4-3-8)', present: 'Logische Präzision. Objektive Analyse der Daten-Basis.', absent: 'Nicht-lineare Vernetzung. Detektion versteckter Synergien.' },
    will: { name: 'DURCHSETZUNG (9-5-1)', present: 'Enorme Willenskraft. Erreichung gesetzter Ziele gegen Widerstand.', absent: 'Hohe Adoptions-Fähigkeit. Finden alternativer Wege bei Blockaden.' },
    action: { name: 'AUSFÜHRUNG (2-7-6)', present: 'Schnelle Realisierung. Erfahrungsgewinn durch unmittelbares Handeln.', absent: 'Geplante Realisierung. Sicherung des Terrains vor dem ersten Schritt.' }
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
      8: { theme: 'WIRKUNG', task: 'Training im Umgang mit Macht-Variablen und physischer Kraft.' },
      9: { theme: 'VOLLENDUNG', task: 'Lerne den Prozess des Loslassens zur Vorbereitung neuer Zyklen.' }
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
      9: { theme: 'UNIVERSAL', task: 'Extension des Einflusses auf kollektive Ziele jenseits des Selbst.' }
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
      9: { theme: 'VOLLENDUNG', task: 'Durchlauf der finalen Korrektur. Vorbereitung des Übergangs.' }
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
    9: { desc: 'Anweisung: Bleibe messbar und praktisch. Vermeide Idealismus-Blasen.' }
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
    1: { lesson: 'Dominanz', desc: 'Defizit: Verantwortung gemieden. Jetzt: Spitze besetzen.' },
    2: { lesson: 'Synergie', desc: 'Defizit: Isolation gewählt. Jetzt: Bündnisse optimieren.' },
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

/* ─── PDF ENGINE (v2.4 - Blueprint Edition) ─────────────────────────────── */

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
        { type: 'text', text: `STÄRKEN: ${lpData.strengths}` },
        { type: 'text', text: `HINDERNIS: ${lpData.challenges}` }
      ] 
    },
    
    { 
      type: 'section', title: 'SEKTION II: ENERGIE-KOHÄRENZ', 
      blocks: [
        { type: 'visual', visual: 'scale', score: harmScore, label: hD.title },
        { type: 'text', text: hD.desc },
        { type: 'row', label: 'BRÜCKE 1', val: String(b1), desc: DEEP_DECODE_MATRIX.bridges[b1] },
        { type: 'row', label: 'BRÜCKE 2', val: String(b2), desc: DEEP_DECODE_MATRIX.bridges[b2] },
        { type: 'text', text: hD.warning || hD.action || hD.urgency }
      ] 
    },
    
    { 
      type: 'section', title: 'SEKTION III: AUTOMATISCHE MUSTER', 
      blocks: [
        { type: 'visual', visual: 'grid', grid: grid.grid },
        { type: 'row', label: 'MENTAL', val: hasM ? 'AKTIV' : 'ADAPTIV', desc: DEEP_DECODE_MATRIX.grid.mental[hasM ? 'present' : 'absent'] },
        { type: 'row', label: 'EMOTIONAL', val: hasE ? 'AKTIV' : 'ADAPTIV', desc: DEEP_DECODE_MATRIX.grid.emotional[hasE ? 'present' : 'absent'] },
        { type: 'row', label: 'PHYSISCH', val: hasP ? 'AKTIV' : 'ADAPTIV', desc: DEEP_DECODE_MATRIX.grid.physical[hasP ? 'present' : 'absent'] }
      ] 
    },
    
    { 
      type: 'section', title: 'SEKTION IV: LEBENSPHASEN', 
      blocks: [
        { type: 'row', label: 'ANFANG (0-28J)', val: data.cycles.c1, desc: `${DEEP_DECODE_MATRIX.cycles.early[data.cycles.c1]?.theme}: ${DEEP_DECODE_MATRIX.cycles.early[data.cycles.c1]?.task}` },
        { type: 'row', label: 'HAUPTWEG (29-56J)', val: data.cycles.c2, desc: `${DEEP_DECODE_MATRIX.cycles.middle[data.cycles.c2]?.theme}: ${DEEP_DECODE_MATRIX.cycles.middle[data.cycles.c2]?.task}` },
        { type: 'row', label: 'ERNTE (57J+)', val: data.cycles.c3, desc: `${DEEP_DECODE_MATRIX.cycles.late[data.cycles.c3]?.theme}: ${DEEP_DECODE_MATRIX.cycles.late[data.cycles.c3]?.task}` }
      ] 
    },
    
    { 
      type: 'section', title: 'SEKTION V: WENDEPUNKTE', 
      blocks: [
        { type: 'row', label: 'WENDE 1', val: data.pinnacles.p1, desc: DEEP_DECODE_MATRIX.pinnacles[data.pinnacles.p1]?.desc },
        { type: 'row', label: 'WENDE 2', val: data.pinnacles.p2, desc: DEEP_DECODE_MATRIX.pinnacles[data.pinnacles.p2]?.desc },
        { type: 'row', label: 'WENDE 3', val: data.pinnacles.p3, desc: DEEP_DECODE_MATRIX.pinnacles[data.pinnacles.p3]?.desc },
        { type: 'row', label: 'WENDE 4', val: data.pinnacles.p4, desc: DEEP_DECODE_MATRIX.pinnacles[data.pinnacles.p4]?.desc }
      ] 
    },
    
    { 
      type: 'section', title: 'SEKTION VI: HINDERNISSE', 
      blocks: [
        { type: 'row', label: 'DEFIZIT 1', val: data.challenges.ch1, desc: DEEP_DECODE_MATRIX.challenges[data.challenges.ch1]?.desc },
        { type: 'row', label: 'DEFIZIT 2', val: data.challenges.ch2, desc: DEEP_DECODE_MATRIX.challenges[data.challenges.ch2]?.desc },
        { type: 'row', label: 'HAUPTAUFGABE', val: data.challenges.ch3, desc: DEEP_DECODE_MATRIX.challenges[data.challenges.ch3]?.desc }
      ] 
    },
    
    { 
      type: 'section', title: 'SEKTION VII: BLINDE FLECKEN', 
      blocks: [
        { type: 'text', text: 'Karmische Defizite sind systemische Lücken, die durch Handeln geschlossen werden müssen.' },
        ...data.karma.lessons.map(n => ({ type: 'row', label: `LEKTION ${n}`, val: DEEP_DECODE_MATRIX.karmic[n]?.lesson || 'Lücke', desc: DEEP_DECODE_MATRIX.karmic[n]?.desc || 'System-Refaktorierung nötig.' })),
        { type: 'row', label: 'IMPULS-STÄRKE', val: data.karma.passion.join(', '), desc: 'Deine dominanten energetischen Muster.' }
      ] 
    },
    
    { 
      type: 'section', title: 'SEKTION VIII: OPTIMIERUNG', 
      blocks: [
        { type: 'row', label: 'STRATEGIE', val: lp, desc: DEEP_DECODE_MATRIX.getStrategicTips(lpNum) },
        { type: 'text', text: 'PROTOKOLL 01: Akzeptiere den o.g. Bauplan als Hardware-Limit.' },
        { type: 'text', text: `PROTOKOLL 02: Beseitige ${harmScore < 50 ? 'Resonanz-Konflikte' : 'Inertial-Verluste'} durch radikales Handeln.` },
        { type: 'text', text: 'PROTOKOLL 03: Ignoriere externe Signale, die nicht dem Bauplan entsprechen.' }
      ] 
    },
    
    { 
      type: 'section', title: 'SEKTION IX: VOLLENDUNG', 
      blocks: [
        { type: 'text', text: 'Wissen ohne Handlung ist wertlos. Das Artefakt ist vollendet.' },
        { type: 'text', text: 'MBRN HUB — DEEP DECODE // VERSION 2.4\nSTATUS: OPERATIONAL' },
        { type: 'text', text: 'END OF DECODE.', style: 'technical' }
      ] 
    }
  ];
}

export async function generateDeepReport(data) {
  const { jsPDF } = await import("https://esm.sh/jspdf@latest");
  const doc = new jsPDF();
  const pc = [255,255,255], ac = [180,180,180], dc = [100,100,100];

  const drawFrame = (p) => {
    doc.setFillColor(10,10,10); doc.rect(0,0,210,297,'F');
    doc.setDrawColor(...dc); doc.setLineWidth(0.1);
    doc.rect(10,10,190,277); // Outer frame
    doc.setFontSize(6); doc.setTextColor(...dc);
    doc.text(`MBRN::BLUEPRINT // P${p} // SHA-256:${Math.random().toString(16).substr(2,8)}`, 15, 8);
    doc.text('CONFIDENTIAL // SYSTEM_ID_DECODE', 195, 8, { align: 'right' });
    doc.text('© 2026 MBRN_CORE_REPRODUCTION_PROHIBITED', 105, 292, { align: 'center' });
  };

  const drawGrid = (x, y, grid) => {
    const s = 15; doc.setDrawColor(...ac); doc.setLineWidth(0.2);
    for(let i=0; i<3; i++) for(let j=0; j<3; j++) doc.rect(x+j*s, y+i*s, s, s);
    const map = [[4,9,2],[3,5,7],[8,1,6]];
    doc.setFontSize(10);
    map.forEach((row, i) => row.forEach((n, j) => {
      if (grid[n] > 0) {
        doc.setTextColor(...pc); doc.text(String(n), x+j*s+s/2, y+i*s+s/2+3, { align:'center' });
      }
    }));
  };

  const drawScale = (x, y, score) => {
    const w = 100; doc.setDrawColor(...dc); doc.rect(x, y, w, 4);
    doc.setFillColor(...pc); doc.rect(x, y, (score/100)*w, 4, 'F');
    doc.setFontSize(8); doc.setTextColor(...ac); doc.text('SYSTEM_SYNC_RESONANCE', x, y-2);
    doc.setTextColor(...pc); doc.text(`${score}%`, x+w+5, y+3.5);
  };

  const pages = generateSectionContent(data);
  pages.forEach((p, i) => {
    if (i > 0) doc.addPage();
    drawFrame(i + 1);
    if (p.type === 'cover') {
      doc.setTextColor(...pc); doc.setFontSize(40); doc.text(p.title, 105, 120, { align: 'center', charSpace: 3 });
      doc.setFontSize(12); doc.setTextColor(...dc); doc.text(p.subtitle, 105, 130, { align: 'center' });
      doc.setFontSize(24); doc.setTextColor(...pc); doc.text(p.name, 105, 170, { align: 'center' });
    } else {
      let y = 35; doc.setFontSize(14); doc.setTextColor(...pc); doc.text(p.title, 20, y);
      doc.setDrawColor(...dc); doc.line(20, y+2, 190, y+2); y += 15;
      p.blocks.forEach(b => {
        if (b.type === 'row') {
          doc.setFontSize(9); doc.setTextColor(...ac); doc.text(b.label.toUpperCase(), 20, y);
          doc.setFontSize(14); doc.setTextColor(...pc); doc.text(String(b.val), 190, y, { align: 'right' });
          if(b.desc) { doc.setFontSize(8); doc.setTextColor(...dc); doc.text(b.desc, 20, y+5, { maxWidth:140 }); }
          y += 20;
        } else if (b.type === 'text') {
          doc.setFontSize(10); doc.setTextColor(200,200,200); doc.text(b.text, 20, y, { maxWidth:170 });
          y += (b.text.split('\n').length * 6) + 10;
        } else if (b.type === 'visual') {
          if (b.visual === 'grid') { drawGrid(145, y-5, b.grid); y += 35; }
          else if (b.visual === 'scale') { drawScale(20, y+10, b.score); y += 25; }
        }
      });
    }
  });
  return doc;
}
