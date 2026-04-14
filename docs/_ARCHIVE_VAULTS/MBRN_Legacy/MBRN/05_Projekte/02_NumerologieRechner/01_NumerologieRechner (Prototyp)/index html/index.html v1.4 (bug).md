<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Numerologie-Rechner v1.4</title>
    <link rel="stylesheet" href="style.css">
    <script src="numerology.js"></script>
</head>
<body>
    <h1>Numerologie-Rechner v1.4</h1>

    <div class="container">
        <!-- Formular Card -->
        <div class="form-card">
            <form id="numerologyForm">
                <div class="input-row">
                    <label for="name">Dein Name:</label>
                    <input type="text" id="name" name="name">
                    <div class="error" id="nameError"></div>
                </div>

                <div class="input-row">
                    <label for="birthdate">Dein Geburtsdatum (TT.MM.JJJJ):</label>
                    <input type="text" id="birthdate" name="birthdate" placeholder="TT.MM.JJJJ">
                    <div class="error" id="dateError"></div>
                </div>

                <button type="submit">Berechnen</button>
            </form>
        </div>

        <!-- Ergebnisse Card -->
        <div class="results-card">
            <h2>Ergebnisse</h2>
            <div class="results-grid" id="resultsGrid">
                <!-- Lebenszahl -->
                <div class="result-tile life-number" id="lifeTile" data-priority="1">
                    <div class="result-title">Lebenszahl <span class="tooltip" title="Die wichtigste Zahl deines Lebenspfads.">ℹ️</span></div>
                    <div class="result-value" id="lifePathNumber"></div>
                </div>
                <!-- Seelenzahl -->
                <div class="result-tile soul-number" id="soulTile" data-priority="2">
                    <div class="result-title">Seelenzahl <span class="tooltip" title="Zeigt deine inneren Wünsche und Motivationen.">ℹ️</span></div>
                    <div class="result-value" id="soulNumber"></div>
                </div>
                <!-- Ausdruckszahl -->
                <div class="result-tile expression-number" id="expressionTile" data-priority="3">
                    <div class="result-title">Ausdruckszahl <span class="tooltip" title="Wie du dich der Welt zeigst.">ℹ️</span></div>
                    <div class="result-value" id="expressionNumber"></div>
                </div>
                <!-- Persönlichkeitszahl -->
                <div class="result-tile personality-number" id="personalityTile" data-priority="4">
                    <div class="result-title">Persönlichkeitszahl <span class="tooltip" title="Wie andere dich wahrnehmen.">ℹ️</span></div>
                    <div class="result-value" id="personalityNumber"></div>
                </div>
            </div>

            <!-- Platzhalter für zukünftige Zahlen -->
            <div class="results-grid" id="extraNumbersGrid">
                <!-- Dynamisch erweiterbar -->
            </div>
        </div>
    </div>
</body>
</html>