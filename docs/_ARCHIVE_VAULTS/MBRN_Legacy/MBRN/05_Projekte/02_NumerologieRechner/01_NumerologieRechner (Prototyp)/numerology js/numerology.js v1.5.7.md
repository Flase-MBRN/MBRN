/* numerology.js v1.5.7 - voll robust: Validierung, Umlaute, Master/Normal Anzeige, Erklärungen, skalierbar */

// Pythagoras Tabelle
const pythagorasTable = {
  1:['A','J','S'], 2:['B','K','T'], 3:['C','L','U'], 4:['D','M','V'],
  5:['E','N','W'], 6:['F','O','X'], 7:['G','P','Y'], 8:['H','Q','Z'], 9:['I','R']
};

// Erklärungen: pro Typ (life/soul/expression/personality/karmic/personalYear)
// Skaliere hier: neue Zahlen / neue Typen einfach hinzufügen
const explanations = {
  life: {
    1:"Neuanfang, Führungsqualitäten, Selbstbestimmung",
    2:"Harmonie, Kooperation, Sensibilität",
    3:"Kreativität, Ausdruck, Kommunikation",
    4:"Stabilität, Ordnung, Disziplin",
    5:"Flexibilität, Abenteuer, Veränderung",
    6:"Verantwortung, Familie, Fürsorge",
    7:"Analyse, Rückzug, Weisheit",
    8:"Macht, Erfolg, materielles Geschick",
    9:"Abschluss, Mitgefühl, Idealismus",
    11:"Intuition & Inspiration (Master 11)",
    22:"Master-Builder: Vision & Realisierung (Master 22)",
    33:"Lehrer/Heiler, hohe Service-Vibration (Master 33)"
  },
  soul: {
    1:"Innerer Antrieb, Selbstbehauptung",
    2:"Sehnsucht nach Harmonie & Verbindung",
    3:"Bedürfnis nach kreativem Ausdruck",
    4:"Sicherheit & Struktur im Inneren",
    5:"Sehnsucht nach Freiheit & Veränderung",
    6:"Fürsorge, Verantwortung im Inneren",
    7:"Spirituelle Suche, Rückzug",
    8:"Starker Wille, Verantwortungstrieb",
    9:"Hohe Empathie, Wunsch nach Dienst",
    11:"Hohe Sensibilität, Inspiration (Master 11)",
    22:"Kollektive Vision, Umsetzungskraft (Master 22)",
    33:"Hohes Dienstpotenzial (Master 33)"
  },
  expression: {
    1:"Direkter Ausdruck, Self-Starter",
    2:"Kooperativer Ausdruck, Diplomatie",
    3:"Charismatisch, kommunikativ",
    4:"Pragmatisch, verlässlich",
    5:"Vielseitig, experimentierfreudig",
    6:"Ausdruck von Verantwortung & Fürsorge",
    7:"Zurückhaltend, tiefgründig",
    8:"Ambitioniert, zielorientiert",
    9:"Inspirierend, visionär",
    11:"Leuchtender Ausdruck, Intuition (Master 11)",
    22:"Ausdruck als großer Umsetzer (Master 22)",
    33:"Ausdruck für Heilung & Lehre (Master 33)"
  },
  personality: {
    1:"Eindruck: führt, unabhängig",
    2:"Eindruck: freundlich, verbindlich",
    3:"Eindruck: offen, kommunikativ",
    4:"Eindruck: zuverlässig, geerdet",
    5:"Eindruck: lebhaft, unkonventionell",
    6:"Eindruck: warm, verantwortungsbewusst",
    7:"Eindruck: zurückhaltend, intelligent",
    8:"Eindruck: kraftvoll, geschäftstüchtig",
    9:"Eindruck: mitfühlend, charismatisch",
    11:"Eindruck: besondere Ausstrahlung (Master 11)",
    22:"Eindruck: imposant, visionär (Master 22)",
    33:"Eindruck: stark fürsorglich (Master 33)"
  },
  karmic: {
    1:"Karmische Lektion: Eigeninitiative",
    2:"Karmische Lektion: Partnerschaft & Empathie",
    3:"Karmische Lektion: Selbstausdruck",
    4:"Karmische Lektion: Verantwortung",
    5:"Karmische Lektion: Freiheit vs. Bindung",
    6:"Karmische Lektion: Fürsorge",
    7:"Karmische Lektion: Innere Arbeit",
    8:"Karmische Lektion: Macht & Umgang damit",
    9:"Karmische Lektion: Loslassen & Dienst",
    11:"Karmisch: besondere Herausforderung / Gelegenheit (11)",
    22:"Karmisch: großes Umsetzungsfeld (22)",
    33:"Karmisch: hoher Dienst/Lehre (33)"
  },
  personalYear: {
    1:"Neubeginn, Impulse für persönliche Projekte",
    2:"Aufbau von Beziehungen, Geduld erforderlich",
    3:"kommunikative Chancen, Kreativität",
    4:"Arbeit & Struktur: Fundament bauen",
    5:"Veränderung, Reisen, Umorientierung",
    6:"Verantwortung für Beziehungen & Zuhause",
    7:"Reflexion, Lernen, Rückzug",
    8:"Karriere- & Machtphase, Verantwortung",
    9:"Abschluss, Abschlussarbeiten, Loslassen",
    11:"Intuitiv-impulsives Jahr (11)",
    22:"Großes Umsetzungsjahr (22)",
    33:"Jahr für Dienst/Lehre (33)"
  }
};

// --- Utility / Normalisierung ---
function normalizeName(name){
  return name.toUpperCase()
    .replace(/Ä/g,'AE').replace(/Ö/g,'OE').replace(/Ü/g,'UE').replace(/ß/g,'SS');
}

function getNumberForChar(char){
  for (let num in pythagorasTable){
    if (pythagorasTable[num].includes(char)) return parseInt(num,10);
  }
  return 0;
}

// reduziert, stoppt bei Master (11/22/33)
function reducePreserveMaster(num){
  if (num === 0) return 0;
  if ([11,22,33].includes(num)) return num;
  while (num > 9){
    num = (num % 10) + Math.floor(num / 10);
    if ([11,22,33].includes(num)) break;
  }
  return num;
}

// zwingend einstellige Zahl (ignoriere Master)
function reduceForceSingle(num){
  if (num === 0) return 0;
  while (num > 9){
    num = (''+num).split('').reduce((s,d)=>s+parseInt(d,10),0);
  }
  return num;
}

// Format: "normal" oder "normal/master" wenn Master möglich und verschieden
function formatNormalAndMaster(sum){
  const normal = reduceForceSingle(sum);
  const master = reducePreserveMaster(sum);
  if ([11,22,33].includes(master) && master !== normal){
    return `${normal}/${master}`;
  }
  return `${normal}`;
}

function quersumme(num){
  return (''+num).split('').map(d=>parseInt(d,10)).reduce((a,b)=>a+(isNaN(b)?0:b),0);
}

// Datumsprüfung TT.MM.JJJJ inkl. Monatslänge & Schaltjahr
function isValidDateDDMMYYYY(dateStr){
  if (!/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) return false;
  const parts = dateStr.split('.');
  const day = parseInt(parts[0],10);
  const month = parseInt(parts[1],10);
  const year = parseInt(parts[2],10);
  if (month < 1 || month > 12) return false;
  if (year < 1900 || year > 2099) return false;
  const monthLengths = [31, (isLeapYear(year)?29:28),31,30,31,30,31,31,30,31,30,31];
  if (day < 1 || day > monthLengths[month-1]) return false;
  return true;
}
function isLeapYear(y){ return (y%4===0 && y%100!==0) || (y%400===0); }

// --- Summen-Berechnungen (geben Sums zurück, nicht reduzierte Werte) ---
function calculateExpressionSum(name){
  const s = normalizeName(name).replace(/\s+/g,'');
  let sum = 0;
  for (let ch of s) sum += getNumberForChar(ch);
  return sum;
}
function calculateSoulSum(name){
  const s = normalizeName(name).replace(/\s+/g,'');
  let sum = 0;
  for (let ch of s) if ('AEIOU'.includes(ch)) sum += getNumberForChar(ch);
  return sum;
}
function calculatePersonalitySum(name){
  const s = normalizeName(name).replace(/\s+/g,'');
  let sum = 0;
  for (let ch of s) if (!'AEIOU'.includes(ch)) sum += getNumberForChar(ch);
  return sum;
}
function calculateLifeSum(dateOfBirth){
  const parts = dateOfBirth.split('.');
  if (parts.length !== 3) return 0;
  let sum = 0;
  for (let part of parts) for (let digit of part){
    const n = parseInt(digit,10);
    if (isNaN(n)) return 0;
    sum += n;
  }
  return sum;
}

// Karmische Summe (basierend auf Ausdruckszahl normal)
function calculateKarmicSum(expressionSum){
  const exprNormal = reduceForceSingle(expressionSum);
  const all = [1,2,3,4,5,6,7,8,9];
  const missing = all.filter(n => n !== exprNormal);
  return missing.reduce((a,b)=>a+b,0);
}

// Persönliches Jahr (klassisch normal + Master-Kandidat)
function calculatePersonalYearClassic(lifeNormal){
  const yearQs = quersumme(new Date().getFullYear());
  return lifeNormal + yearQs; // sum -> formatNormalAndMaster will reduce/format
}
function calculatePersonalYearMasterCandidate(lifeNormal){
  // früherer Master-kandidat: life + full year (e.g. 3 + 2029)
  return lifeNormal + new Date().getFullYear();
}

// --- DOM / UI helpers ---
function setResultText(elementId, text){
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = text;
  el.classList.remove('master');
  // if master present in text, add class to value container
  if (text.includes('/')){
    const master = parseInt(text.split('/')[1],10);
    if ([11,22,33].includes(master)) el.classList.add('master');
  } else {
    const v = parseInt(text,10);
    if ([11,22,33].includes(v)) el.classList.add('master');
  }
}

// Add extra number tile (title, display e.g. "4/22", tooltip, explanationKey)
function addExtraNumber(title, displayValue, tooltip='', explanationType=null, explanationKey=null){
  const grid = document.getElementById('extraNumbersGrid');
  if (!grid) return;
  const tile = document.createElement('div');
  tile.classList.add('result-tile');
  const titleDiv = document.createElement('div');
  titleDiv.classList.add('result-title');
  titleDiv.textContent = title;
  if (tooltip){
    const tip = document.createElement('button');
    tip.classList.add('tooltip');
    tip.setAttribute('title', tooltip);
    tip.setAttribute('aria-hidden','true');
    tip.textContent = 'ℹ️';
    titleDiv.appendChild(tip);
  }
  const valueDiv = document.createElement('div');
  valueDiv.classList.add('result-value');
  valueDiv.textContent = displayValue;
  // master styling on value div
  if (displayValue.includes('/')){
    const masterPart = displayValue.split('/')[1];
    if ([11,22,33].includes(parseInt(masterPart,10))) valueDiv.classList.add('master');
  } else {
    const n = parseInt(displayValue,10);
    if ([11,22,33].includes(n)) valueDiv.classList.add('master');
  }
  const explDiv = document.createElement('div');
  explDiv.classList.add('result-explanation');
  // explanation lookup
  if (explanationType && explanationKey !== null){
    const explMap = explanations[explanationType] || {};
    // use raw master if present or normal base
    const base = (displayValue.includes('/')) ? parseInt(displayValue.split('/')[0],10) : parseInt(displayValue,10);
    const master = (displayValue.includes('/')) ? parseInt(displayValue.split('/')[1],10) : null;
    let text = explMap[base] || '';
    if (master && explMap[master]) text += (text ? ' — ' : '') + explMap[master];
    explDiv.textContent = text;
  }
  tile.appendChild(titleDiv);
  tile.appendChild(valueDiv);
  tile.appendChild(explDiv);
  grid.appendChild(tile);
}

// Fill main tile explanation
function setTileExplanation(tileId, displayValue, type){
  const explEl = document.getElementById(tileId);
  if (!explEl) return;
  const explMap = explanations[type] || {};
  // displayValue like "4" or "4/22"
  const base = (displayValue.includes('/')) ? parseInt(displayValue.split('/')[0],10) : parseInt(displayValue,10);
  const master = (displayValue.includes('/')) ? parseInt(displayValue.split('/')[1],10) : null;
  let text = explMap[base] || '';
  if (master && explMap[master]){
    text += (text ? ' — ' : '') + explMap[master];
  }
  explEl.textContent = text;
}

// --- Main: init listeners and calculation ---
document.addEventListener('DOMContentLoaded', function(){
  const form = document.getElementById('numerologyForm');
  if (!form) return;

  const nameInput = document.getElementById('name');
  const dateInput = document.getElementById('birthdate');
  const nameErrEl = document.getElementById('nameError');
  const dateErrEl = document.getElementById('dateError');
  const calcBtn = document.getElementById('calcBtn');
  const resetBtn = document.getElementById('resetBtn');

  function validateName(name){
    if (!name || !name.trim()) return { ok:false, msg:'Bitte Name eingeben.' };
    const pattern = /^[A-Za-zÄÖÜäöüßẞ\s'\-]+$/;
    if (!pattern.test(name)) return { ok:false, msg:'Nur Buchstaben, Leerzeichen, - und \' erlaubt.' };
    if (!/[A-Za-zÄÖÜäöüßẞ]/.test(name)) return { ok:false, msg:'Bitte einen gültigen Namen eingeben.' };
    return { ok:true, msg:'' };
  }
  function updateFormState(){
    const nstate = validateName(nameInput.value);
    const dstate = isValidDateDDMMYYYY(dateInput.value.trim());
    if (nstate.ok){ nameInput.classList.remove('input-invalid'); nameInput.classList.add('input-valid'); nameErrEl.textContent=''; }
    else { nameInput.classList.add('input-invalid'); nameInput.classList.remove('input-valid'); nameErrEl.textContent = nstate.msg; }
    if (dstate){ dateInput.classList.remove('input-invalid'); dateInput.classList.add('input-valid'); dateErrEl.textContent=''; }
    else { dateInput.classList.add('input-invalid'); dateInput.classList.remove('input-valid'); if (dateInput.value.trim()) dateErrEl.textContent='TT.MM.JJJJ Format erforderlich.'; else dateErrEl.textContent=''; }
    const valid = nstate.ok && dstate;
    if (calcBtn) calcBtn.disabled = !valid;
    return valid;
  }

  nameInput?.addEventListener('input', updateFormState);
  dateInput?.addEventListener('input', updateFormState);

  resetBtn?.addEventListener('click', function(){
    nameErrEl.textContent=''; dateErrEl.textContent='';
    nameInput.classList.remove('input-invalid','input-valid');
    dateInput.classList.remove('input-invalid','input-valid');
    setResultText('personalityNumber','');
    setResultText('soulNumber','');
    setResultText('expressionNumber','');
    setResultText('lifePathNumber','');
    const extra = document.getElementById('extraNumbersGrid'); if (extra) extra.innerHTML='';
    if (calcBtn) calcBtn.disabled = false;
  });

  form.addEventListener('submit', function(e){
    e.preventDefault();
    if (!updateFormState()) return;

    const name = nameInput.value.trim();
    const date = dateInput.value.trim();

    // sums
    const expressionSum = calculateExpressionSum(name);
    const soulSum = calculateSoulSum(name);
    const personalitySum = calculatePersonalitySum(name);
    const lifeSum = calculateLifeSum(date);

    // formatted displays
    const expressionDisplay = formatNormalAndMaster(expressionSum);
    const soulDisplay = formatNormalAndMaster(soulSum);
    const personalityDisplay = formatNormalAndMaster(personalitySum);
    const lifeDisplay = formatNormalAndMaster(lifeSum);

    setResultText('expressionNumber', expressionDisplay);
    setResultText('soulNumber', soulDisplay);
    setResultText('personalityNumber', personalityDisplay);
    setResultText('lifePathNumber', lifeDisplay);

    // set explanations for main tiles
    setTileExplanation('expressionExplanation', expressionDisplay, 'expression');
    setTileExplanation('soulExplanation', soulDisplay, 'soul');
    setTileExplanation('personalityExplanation', personalityDisplay, 'personality');
    setTileExplanation('lifeExplanation', lifeDisplay, 'life');

    // extras
    const extraGrid = document.getElementById('extraNumbersGrid');
    if (extraGrid) extraGrid.innerHTML = '';

    // Karmische Zahl
    const karmicSum = calculateKarmicSum(expressionSum);
    const karmicDisplay = formatNormalAndMaster(karmicSum);
    addExtraNumber('Karmische Zahl', karmicDisplay, 'Zeigt karmische Lektionen / Herausforderungen nach pythagorischer Priorität.', 'karmic', karmicSum);

    // Persönliches Jahr (klassisch normal + Master-Kandidat angezeigt)
    const lifeNormal = reduceForceSingle(lifeSum);
    const personalClassicSum = calculatePersonalYearClassic(lifeNormal); // numeric sum
    const personalClassicDisplay = formatNormalAndMaster(personalClassicSum);
    const personalMasterCandidateSum = calculatePersonalYearMasterCandidate(lifeNormal);
    const personalMasterCandidate = reducePreserveMaster(personalMasterCandidateSum);
    // if master candidate exists and differs, show normal/master
    let personalDisplay = personalClassicDisplay;
    if ([11,22,33].includes(personalMasterCandidate) && personalMasterCandidate !== parseInt(personalClassicDisplay,10)){
      // ensure we show the "normal/master" where normal is the classic and master is masterCandidate
      const normalPart = reduceForceSingle(personalClassicSum);
      personalDisplay = `${normalPart}/${personalMasterCandidate}`;
    }
    addExtraNumber('Persönliches Jahr', personalDisplay, 'Persönliches Jahr: Lebenszahl + Jahres-Quersumme (klassisch); Master-Kandidat wird zusätzlich angezeigt.', 'personalYear', null);

    // developer log
    console.log('v1.5.6 Berechnung', {
      expressionSum, soulSum, personalitySum, lifeSum,
      expressionDisplay, soulDisplay, personalityDisplay, lifeDisplay,
      karmicDisplay, personalDisplay
    });
  });

  // initial state
  updateFormState();
});