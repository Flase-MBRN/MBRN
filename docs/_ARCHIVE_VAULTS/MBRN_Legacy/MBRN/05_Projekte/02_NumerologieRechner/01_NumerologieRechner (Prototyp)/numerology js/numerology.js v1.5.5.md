/* numerology.js v1.5.5 - Anzeige: normale Zahl + optional Masterzahl (Format: normal/master) */

/* Pythagoras Tabelle */
const pythagorasTable = {
    1: ['A','J','S'],
    2: ['B','K','T'],
    3: ['C','L','U'],
    4: ['D','M','V'],
    5: ['E','N','W'],
    6: ['F','O','X'],
    7: ['G','P','Y'],
    8: ['H','Q','Z'],
    9: ['I','R']
};

/* --- Hilfsfunktionen --- */
function normalizeName(name){
    return name.toUpperCase()
               .replace(/Ä/g,'AE')
               .replace(/Ö/g,'OE')
               .replace(/Ü/g,'UE')
               .replace(/ß/g,'SS');
}

function getNumberForChar(char){
    for (let num in pythagorasTable){
        if (pythagorasTable[num].includes(char)) return parseInt(num,10);
    }
    return 0;
}

// reduziert, stoppt wenn Master (11,22,33) gefunden
function reducePreserveMaster(num){
    if (num === 0) return 0;
    if ([11,22,33].includes(num)) return num;
    while (num > 9){
        num = (num % 10) + Math.floor(num / 10);
        if ([11,22,33].includes(num)) break;
    }
    return num;
}

// zwingt auf eine einzelne Ziffer (ignoriert Master)
function reduceForceSingle(num){
    if (num === 0) return 0;
    while (num > 9){
        num = (''+num).split('').reduce((s,d)=>s+parseInt(d,10),0);
    }
    return num;
}

// liefert string: "normal" oder "normal/master" (normal = force, master = preserve wenn master und anders)
function formatNormalAndMaster(sum){
    const normal = reduceForceSingle(sum);
    const master = reducePreserveMaster(sum);
    if ([11,22,33].includes(master) && master !== normal){
        return `${normal}/${master}`;
    }
    return `${normal}`;
}

function sumDigitsOfStringNumberString(s){
    return (''+s).split('').map(d=>parseInt(d,10)).reduce((a,b)=>a+(isNaN(b)?0:b),0);
}

function quersumme(num){
    return (''+num).split('').map(d=>parseInt(d,10)).reduce((a,b)=>a+(isNaN(b)?0:b),0);
}

/* --- Kernzahlen berechnen (verwenden normalizeName) --- */
function calculateExpressionSum(name){
    const n = normalizeName(name).replace(/\s+/g,'');
    let sum = 0;
    for (let ch of n) sum += getNumberForChar(ch);
    return sum;
}
function calculateSoulSum(name){
    const n = normalizeName(name).replace(/\s+/g,'');
    let sum = 0;
    for (let ch of n){
        if ('AEIOU'.includes(ch)) sum += getNumberForChar(ch);
    }
    return sum;
}
function calculatePersonalitySum(name){
    const n = normalizeName(name).replace(/\s+/g,'');
    let sum = 0;
    for (let ch of n){
        if (!'AEIOU'.includes(ch)) sum += getNumberForChar(ch);
    }
    return sum;
}
function calculateLifeSum(dateOfBirth){
    const parts = dateOfBirth.split('.');
    if (parts.length !== 3) return 0;
    let sum = 0;
    for (let part of parts){
        for (let digit of part){
            const n = parseInt(digit,10);
            if (isNaN(n)) return 0;
            sum += n;
        }
    }
    return sum;
}

/* --- Extra-Zahlen: Karmische Zahl (wie zuvor) --- */
function calculateKarmicSum(expressionReducedOrSum){
    // previous algorithm: sum of missing numbers relative to expression reduced? we'll base on expression reduced value (force)
    const expressionNumber = reduceForceSingle(expressionReducedOrSum);
    const all = [1,2,3,4,5,6,7,8,9];
    const missing = all.filter(n => n !== expressionNumber);
    return missing.reduce((a,b)=>a+b,0);
}

/* --- Persönliches Jahr: beide Methoden --- */
// klassische (von dir gewünschte) Methode: Lebenszahl + Quersumme des Jahres -> reduceForceSingle
function calculatePersonalYearClassic(lifeNumber){
    const currentYear = new Date().getFullYear();
    const yearQs = quersumme(currentYear);
    const s = lifeNumber + yearQs;
    return { normalSum: s, masterCandidateSum: null }; // masterCandidate handled separately below if desired
}
// ältere/master-prone Methode (volles Jahr addiert) -> hier wir holen master from preserve
function calculatePersonalYearMasterCandidate(lifeNumber){
    const currentYear = new Date().getFullYear();
    const s = lifeNumber + currentYear; // e.g. 3 + 2029 => 2032
    return s;
}

/* --- Anzeige-Helper --- */
function setResultText(elementId, text){
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = text;
    // Master-Visual: if contains '/' and right side is master, highlight result-value with .master class
    el.classList.remove('master');
    if (text.includes('/')){
        const parts = text.split('/');
        const master = parseInt(parts[1],10);
        if ([11,22,33].includes(master)) el.classList.add('master');
    } else {
        // check if the displayed number itself is a master
        const v = parseInt(text,10);
        if ([11,22,33].includes(v)) el.classList.add('master');
    }
}

function addExtraNumber(title, displayValue, tooltip=''){
    const grid = document.getElementById('extraNumbersGrid');
    if (!grid) return;
    const tile = document.createElement('div');
    tile.classList.add('result-tile');
    const titleDiv = document.createElement('div');
    titleDiv.classList.add('result-title');
    titleDiv.textContent = title;
    if (tooltip){
        const tip = document.createElement('span');
        tip.classList.add('tooltip');
        tip.setAttribute('title', tooltip);
        tip.textContent = 'ℹ️';
        titleDiv.appendChild(tip);
    }
    const valueDiv = document.createElement('div');
    valueDiv.classList.add('result-value');
    valueDiv.textContent = displayValue;
    // visual master styling if master exists
    if (displayValue.includes('/')){
        const masterPart = displayValue.split('/')[1];
        if ([11,22,33].includes(parseInt(masterPart,10))){
            valueDiv.classList.add('master');
        }
    } else {
        const num = parseInt(displayValue,10);
        if ([11,22,33].includes(num)) valueDiv.classList.add('master');
    }
    tile.appendChild(titleDiv);
    tile.appendChild(valueDiv);
    grid.appendChild(tile);
}

/* --- DOM + Events --- */
document.addEventListener('DOMContentLoaded', function(){
    const form = document.getElementById('numerologyForm');
    if (!form) return;

    const nameInput = document.getElementById('name');
    const dateInput = document.getElementById('birthdate');
    const nameErrEl = document.getElementById('nameError');
    const dateErrEl = document.getElementById('dateError');
    const calcBtn = document.getElementById('calcBtn');
    const resetBtn = document.getElementById('resetBtn');

    nameInput?.addEventListener('input', ()=>{ if(nameErrEl) nameErrEl.textContent = nameInput.value.trim() === '' ? 'Bitte Name eingeben.' : ''; });
    dateInput?.addEventListener('input', ()=>{ if(dateErrEl) dateErrEl.textContent = /^\d{2}\.\d{2}\.\d{4}$/.test(dateInput.value) ? '' : 'TT.MM.JJJJ Format erforderlich.'; });

    resetBtn?.addEventListener('click', ()=>{
        setResultText('personalityNumber','');
        setResultText('soulNumber','');
        setResultText('expressionNumber','');
        setResultText('lifePathNumber','');
        const extra = document.getElementById('extraNumbersGrid');
        if (extra) extra.innerHTML = '';
        nameInput.classList.remove('input-invalid','input-valid');
        dateInput.classList.remove('input-invalid','input-valid');
        if (nameErrEl) nameErrEl.textContent = '';
        if (dateErrEl) dateErrEl.textContent = '';
        if (calcBtn) calcBtn.disabled = false;
    });

    form.addEventListener('submit', function(event){
        event.preventDefault();
        if (!nameInput || !dateInput) return;

        const name = nameInput.value.trim();
        const date = dateInput.value.trim();
        let hasError = false;
        if (!name){ if (nameErrEl) nameErrEl.textContent='Bitte Name eingeben.'; hasError = true; }
        if (!/^\d{2}\.\d{2}\.\d{4}$/.test(date)){ if (dateErrEl) dateErrEl.textContent='TT.MM.JJJJ Format erforderlich.'; hasError = true; }
        if (hasError) return;

        // --- Berechnungen: Sums ---
        const expressionSum = calculateExpressionSum(name);
        const soulSum = calculateSoulSum(name);
        const personalitySum = calculatePersonalitySum(name);
        const lifeSum = calculateLifeSum(date);

        // Normal und Master-Format für Kernzahlen
        const expressionDisplay = formatNormalAndMaster(expressionSum);
        const soulDisplay = formatNormalAndMaster(soulSum);
        const personalityDisplay = formatNormalAndMaster(personalitySum);
        const lifeDisplay = formatNormalAndMaster(lifeSum);

        setResultText('expressionNumber', expressionDisplay);
        setResultText('soulNumber', soulDisplay);
        setResultText('personalityNumber', personalityDisplay);
        setResultText('lifePathNumber', lifeDisplay);

        // Extra grid refresh
        const extraGrid = document.getElementById('extraNumbersGrid');
        if (extraGrid) extraGrid.innerHTML = '';

        // Karmische Zahl (berechnet aus Ausdruckszahl normal)
        const karmicSum = calculateKarmicSum(expressionSum);
        const karmicDisplay = formatNormalAndMaster(karmicSum);
        addExtraNumber('Karmische Zahl', karmicDisplay, 'Zeigt karmische Lektionen / Herausforderungen nach der pythagorischen Priorität.');

        // Persönliches Jahr: zeige normal (klassisch) und Master-Kandidat (volle-Jahres-Methode) falls Master vorhanden
        const lifeNormal = reduceForceSingle(lifeSum); // Lebenszahl normal
        const personalClassic = calculatePersonalYearClassic(lifeNormal); // returns normalSum
        const personalNormalValue = reduceForceSingle(personalClassic.normalSum);
        const personalMasterCandidateSum = calculatePersonalYearMasterCandidate(lifeNormal);
        const personalMasterValue = reducePreserveMaster(personalMasterCandidateSum);

        let personalDisplay = `${personalNormalValue}`;
        if ([11,22,33].includes(personalMasterValue) && personalMasterValue !== personalNormalValue){
            personalDisplay = `${personalNormalValue}/${personalMasterValue}`;
        }
        addExtraNumber('Persönliches Jahr', personalDisplay, 'Persönliches Jahr: Lebenszahl + Jahres-Quersumme (normal) — Master-Kandidat wird zusätzlich angezeigt.');

        // console.log für Entwickler
        console.log('Berechnung abgeschlossen', {
            sums: { expressionSum, soulSum, personalitySum, lifeSum },
            display: { expressionDisplay, soulDisplay, personalityDisplay, lifeDisplay, karmicDisplay, personalDisplay }
        });
    });

}); // end DOMContentLoaded