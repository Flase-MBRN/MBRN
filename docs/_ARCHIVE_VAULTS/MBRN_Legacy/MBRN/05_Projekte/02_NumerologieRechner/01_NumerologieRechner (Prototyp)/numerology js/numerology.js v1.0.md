// numerology.js v1.0 - Numerologie v1.0

document.addEventListener("DOMContentLoaded", function() {

    const form = document.getElementById("numerologyForm");

    const resultsDiv = document.querySelector(".results");

  

    form.addEventListener("submit", function(e) {

        e.preventDefault();

  

        const name = document.getElementById("name").value.trim();

        const birthdate = document.getElementById("birthdate").value.trim();

  

        // Einfache Validierung

        if (!name) {

            alert("Bitte gib einen Namen ein.");

            return;

        }

        if (!birthdate) {

            alert("Bitte wähle ein Geburtsdatum.");

            return;

        }

  

        // Dummy-Ergebnis (nur Platzhalter für v1.0)

        resultsDiv.innerHTML = `

            <p>Name: ${name}</p>

            <p>Geburtsdatum: ${birthdate}</p>

            <p>Lebenszahl: –</p>

            <p>Seelenzahl: –</p>

            <p>Ausdruckszahl: –</p>

        `;

    });

});