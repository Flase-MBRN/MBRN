<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Numerologie-Rechner v1.3</title>
    <link rel="stylesheet" href="style.css">
    <script src="numerology.js"></script>
</head>
<body>
    <h1>Numerologie-Rechner v1.3</h1>

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
            <div class="results-grid">
                <div class="result-tile">
                    <div class="result-title">Lebenszahl</div>
                    <div class="result-value" id="lifePathNumber"></div>
                </div>
                <div class="result-tile">
                    <div class="result-title">Seelenzahl</div>
                    <div class="result-value" id="soulNumber"></div>
                </div>
                <div class="result-tile">
                    <div class="result-title">Ausdruckszahl</div>
                    <div class="result-value" id="expressionNumber"></div>
                </div>
                <div class="result-tile">
                    <div class="result-title">Persönlichkeitszahl</div>
                    <div class="result-value" id="personalityNumber"></div>
                </div>
            </div>
        </div>
    </div>

</body>
</html>