// numerology.js v1.2 - Kernzahlen Berechnung
document.addEventListener("DOMContentLoaded", function() {

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

    function normalizeName(name) {
        return name
            .toUpperCase()
            .replace(/Ä/g,'AE')
            .replace(/Ö/g,'OE')
            .replace(/Ü/g,'UE')
            .replace(/ß/g,'SS')
            .replace(/[^A-Z]/g,'');
    }

    function getNumberForChar(char) {
        for (let num in pythagorasTable) {
            if (pythagorasTable[num].includes(char)) return parseInt(num);
        }
        return 0;
    }

    function reduceNumber(num) {
        if ([11,22,33].includes(num)) return num;
        while (num > 9) {
            let sum = 0;
            num.toString().split('').forEach(d => sum += parseInt(d));
            num = sum;
            if ([11,22,33].includes(num)) break;
        }
        return num;
    }

    // --- Kernzahlen ---
    function calculateSoulNumber(name) {
        let sum = 0;
        name = normalizeName(name);
        for (let char of name) {
            if ('AEIOU'.includes(char)) sum += getNumberForChar(char);
        }
        return reduceNumber(sum);
    }

    function calculateExpressionNumber(name) {
        let sum = 0;
        name = normalizeName(name);
        for (let char of name) sum += getNumberForChar(char);
        return reduceNumber(sum);
    }

    function calculatePersonalityNumber(name) {
        let sum = 0;
        name = normalizeName(name);
        for (let char of name) {
            if (!'AEIOU'.includes(char)) sum += getNumberForChar(char);
        }
        return reduceNumber(sum);
    }

    function calculateLifePathNumber(dateOfBirth) {
        const parts = dateOfBirth.split('.');
        if (parts.length !== 3) return 0;
        let sum = 0;
        for (let part of parts) for (let digit of part) sum += parseInt(digit);
        return reduceNumber(sum);
    }

    // --- Formular Event Listener ---
    const form = document.getElementById('numerologyForm');
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const name = document.getElementById('name').value.trim();
        const dateOfBirth = document.getElementById('birthdate').value.trim();
        if (!name || !dateOfBirth) {
            alert("Bitte Name und Geburtsdatum eingeben.");
            return;
        }

        document.getElementById('soulNumber').textContent = calculateSoulNumber(name);
        document.getElementById('expressionNumber').textContent = calculateExpressionNumber(name);
        document.getElementById('personalityNumber').textContent = calculatePersonalityNumber(name);
        document.getElementById('lifePathNumber').textContent = calculateLifePathNumber(dateOfBirth);
    });

});