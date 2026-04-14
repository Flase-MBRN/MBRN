<!DOCTYPE html>

<html lang="de">

<head>

    <meta charset="UTF-8">

    <title>Numerologie-Rechner v1.0</title>

    <link rel="stylesheet" href="style.css">

    <script src="numerology.js"></script>

  

</head>

<body>

    <h1>Numerologie-Rechner v1.0</h1>

    <form id="numerologyForm">

        <label for="name">Dein Name:</label><br>

        <input type="text" id="name" name="name"><br><br>

        <label for="birthdate">Dein Geburtsdatum (TT.MM.JJJJ):</label><br>

        <input type="text" id="birthdate" name="birthdate"><br><br>

        <button type="submit">Berechnen</button>

    </form>

  

    <div id="results">

        <h2>Ergebnisse:</h2>

        <p>Persönlichkeitszahl: <span id="personalityNumber"></span></p>

        <p>Lebenszahl: <span id="lifePathNumber"></span></p>

        <p>Seelenzahl: <span id="soulNumber"></span></p>

        <p>Ausdruckszahl: <span id="expressionNumber"></span></p>

    </div>

  

    <!-- JavaScript Code -->

    <script>

        // Pythagoras Buchstaben-Tabelle

        const pythagorasTable = {

            1: ['A', 'J', 'S'],

            2: ['B', 'K', 'T'],

            3: ['C', 'L', 'U'],

            4: ['D', 'M', 'V'],

            5: ['E', 'N', 'W'],

            6: ['F', 'O', 'X'],

            7: ['G', 'P', 'Y'],

            8: ['H', 'Q', 'Z'],

            9: ['I', 'R']

        };

  

        // Funktion zur Berechnung der Zahl für einen Buchstaben

        function getNumberForChar(char) {

            char = char.toUpperCase();

            for (let num in pythagorasTable) {

                if (pythagorasTable[num].includes(char)) return parseInt(num);

            }

            return 0;

        }

  

        // Hilfsfunktion zum Reduzieren auf eine einzelne Ziffer (Master Numbers beachten)

        function reduceToSingleDigit(num) {

            if (num === 11 || num === 22 || num === 33) return num;

            while (num > 9) {

                num = (num % 10) + Math.floor(num / 10);

                if (num === 11 || num === 22 || num === 33) break;

            }

            return num;

        }

  

        function calculatePersonalityNumber(name) {

            let sum = 0;

            for (let char of name.replace(/\s+/g, '')) {

                sum += getNumberForChar(char);

            }

            return reduceToSingleDigit(sum);

        }

  

        function calculateSoulNumber(name) {

            let sum = 0;

            for (let char of name.replace(/\s+/g, '')) {

                if ('AEIOU'.includes(char.toUpperCase())) sum += getNumberForChar(char);

            }

            return reduceToSingleDigit(sum);

        }

  

        function calculateExpressionNumber(name) {

            let sum = 0;

            for (let char of name.replace(/\s+/g, '')) {

                sum += getNumberForChar(char);

            }

            return reduceToSingleDigit(sum);

        }

  

        function calculateLifePathNumber(dateOfBirth) {

            const parts = dateOfBirth.split('.');

            if (parts.length !== 3) return 0;

            let sum = 0;

            for (let part of parts) {

                for (let digit of part) sum += parseInt(digit);

            }

            return reduceToSingleDigit(sum);

        }

  

        // Event Listener für Formular

        document.getElementById('numerologyForm').addEventListener('submit', function(event) {

            event.preventDefault();

            const name = document.getElementById('name').value.trim();

            const dateOfBirth = document.getElementById('birthdate').value.trim();

            if (!name || !dateOfBirth) return;

  

            const personalityNumber = calculatePersonalityNumber(name);

            const soulNumber = calculateSoulNumber(name);

            const expressionNumber = calculateExpressionNumber(name);

            const lifePathNumber = calculateLifePathNumber(dateOfBirth);

  

            document.getElementById('personalityNumber').textContent = personalityNumber;

            document.getElementById('soulNumber').textContent = soulNumber;

            document.getElementById('expressionNumber').textContent = expressionNumber;

            document.getElementById('lifePathNumber').textContent = lifePathNumber;

        });

    </script>

</body>

</html>