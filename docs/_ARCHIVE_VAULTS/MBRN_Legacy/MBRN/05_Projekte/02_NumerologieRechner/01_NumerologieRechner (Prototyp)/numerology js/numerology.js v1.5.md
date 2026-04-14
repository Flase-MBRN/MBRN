/* numerology.js v1.5 - Erweiterte Validierung & Live-Feedback */

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

// Hilfsfunktionen
function getNumberForChar(char) {
    char = char.toUpperCase();
    for (let num in pythagorasTable) {
        if (pythagorasTable[num].includes(char)) return parseInt(num);
    }
    return 0;
}

function reduceToSingleDigit(num) {
    if ([11,22,33].includes(num)) return num;
    while (num > 9) {
        num = (num % 10) + Math.floor(num / 10);
        if ([11,22,33].includes(num)) break;
    }
    return num;
}

// Kernzahlen Berechnung
function calculatePersonalityNumber(name){
    let sum=0;
    for(let char of name.replace(/\s+/g,'')) sum+=getNumberForChar(char);
    return reduceToSingleDigit(sum);
}

function calculateSoulNumber(name){
    let sum=0;
    for(let char of name.replace(/\s+/g,'')){
        if('AEIOU'.includes(char.toUpperCase())) sum+=getNumberForChar(char);
    }
    return reduceToSingleDigit(sum);
}

function calculateExpressionNumber(name){
    let sum=0;
    for(let char of name.replace(/\s+/g,'')) sum+=getNumberForChar(char);
    return reduceToSingleDigit(sum);
}

function calculateLifePathNumber(dateOfBirth){
    const parts = dateOfBirth.split('.');
    if(parts.length!==3) return 0;
    let sum=0;
    for(let part of parts){
        for(let digit of part){
            const n = parseInt(digit);
            if (isNaN(n)) return 0;
            sum += n;
        }
    }
    return reduceToSingleDigit(sum);
}

// Anzeige
function highlightMasterNumber(elementId, value){
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = value;
    if ([11,22,33].includes(value)) el.classList.add('master');
    else el.classList.remove('master');
}

// Extra-Zahlen (Platzhalter)
function addExtraNumber(title, value, tooltip='') {
    const grid = document.getElementById('extraNumbersGrid');
    if (!grid) return;
    const tile = document.createElement('div');
    tile.classList.add('result-tile');
    const titleDiv = document.createElement('div');
    titleDiv.classList.add('result-title');
    titleDiv.textContent = title;
    if (tooltip) {
        const tip = document.createElement('span');
        tip.classList.add('tooltip');
        tip.setAttribute('title', tooltip);
        tip.textContent = 'ℹ️';
        titleDiv.appendChild(tip);
    }
    const valueDiv = document.createElement('div');
    valueDiv.classList.add('result-value');
    valueDiv.textContent = value;
    tile.appendChild(titleDiv);
    tile.appendChild(valueDiv);
    grid.appendChild(tile);
}

// --- DOMContentLoaded + Validierung ---
document.addEventListener('DOMContentLoaded', function () {

    const form = document.getElementById('numerologyForm');
    if (!form) return;

    const nameInput = document.getElementById('name');
    const dateInput = document.getElementById('birthdate');
    const nameErrEl = document.getElementById('nameError');
    const dateErrEl = document.getElementById('dateError');

    // Live Feedback während der Eingabe
    nameInput?.addEventListener('input', ()=>{
        if(nameInput.value.trim() === '') nameErrEl.textContent = 'Bitte Name eingeben.';
        else nameErrEl.textContent = '';
    });
    dateInput?.addEventListener('input', ()=>{
        if(!/^\d{2}\.\d{2}\.\d{4}$/.test(dateInput.value)) dateErrEl.textContent = 'TT.MM.JJJJ Format erforderlich.';
        else dateErrEl.textContent = '';
    });

    form.addEventListener('submit', function(event){
        event.preventDefault();

        const name = nameInput.value.trim();
        const date = dateInput.value.trim();
        let hasError = false;

        // Validierung
        if(!name){ nameErrEl.textContent='Bitte Name eingeben.'; hasError=true; }
        if(!/^\d{2}\.\d{2}\.\d{4}$/.test(date)){ dateErrEl.textContent='TT.MM.JJJJ Format erforderlich.'; hasError=true; }
        if(hasError) return;

        // Kernzahlen berechnen
        const personality = calculatePersonalityNumber(name);
        const soul = calculateSoulNumber(name);
        const expression = calculateExpressionNumber(name);
        const life = calculateLifePathNumber(date);

        // Anzeige
        highlightMasterNumber('personalityNumber', personality);
        highlightMasterNumber('soulNumber', soul);
        highlightMasterNumber('expressionNumber', expression);
        highlightMasterNumber('lifePathNumber', life);

        // extraNumbers leeren (bereit für nächste Features)
        const extraGrid = document.getElementById('extraNumbersGrid');
        if (extraGrid) extraGrid.innerHTML = '';
    });

});