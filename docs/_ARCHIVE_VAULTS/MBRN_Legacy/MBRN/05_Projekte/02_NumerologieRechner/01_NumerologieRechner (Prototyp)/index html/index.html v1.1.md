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

        <input type="text" id="name" name="name">

        <!-- Fehleranzeige unter Name -->

        <div class="error" id="nameError" style="color:red; font-size:0.9em;"></div><br>

        <label for="birthdate">Dein Geburtsdatum (TT.MM.JJJJ):</label><br>

        <input type="text" id="birthdate" name="birthdate" placeholder="TT.MM.JJJJ">

        <!-- Fehleranzeige unter Datum -->

        <div class="error" id="dateError" style="color:red; font-size:0.9em;"></div><br>

        <button type="submit">Berechnen</button>

    </form>

  

    <div id="results">

        <h2>Ergebnisse:</h2>

        <p>Persönlichkeitszahl: <span id="personalityNumber"></span></p>

        <p>Lebenszahl: <span id="lifePathNumber"></span></p>

        <p>Seelenzahl: <span id="soulNumber"></span></p>

        <p>Ausdruckszahl: <span id="expressionNumber"></span></p>

    </div>

  

</body>

</html>