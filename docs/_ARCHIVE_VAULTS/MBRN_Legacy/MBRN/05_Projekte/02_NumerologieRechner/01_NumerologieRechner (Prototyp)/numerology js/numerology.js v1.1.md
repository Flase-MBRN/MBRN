// numerology.js v1.1 - Utility & Mapping
document.addEventListener("DOMContentLoaded", function() {

    // Pythagoras Tabelle
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

    // Umlaute und ß umwandeln
    function normalizeName(name) {
        return name
            .toUpperCase()
            .replace(/Ä/g,'AE')
            .replace(/Ö/g,'OE')
            .replace(/Ü/g,'UE')
            .replace(/ß/g,'SS')
            .replace(/[^A-Z]/g,''); // alle anderen Zeichen entfernen
    }

    // Einzelbuchstabe → Zahl
    function getNumberForChar(char) {
        for (let num in pythagorasTable) {
            if (pythagorasTable[num].includes(char)) return parseInt(num);
        }
        return 0;
    }

    // Zahl auf 1-9 reduzieren, Master Numbers 11,22,33 behalten
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

    // --- Platz für die Berechnungsfunktionen ---
    // calculatePersonalityNumber(name), calculateSoulNumber(name), ...
    // folgen in Schritt 2 v1.2

});