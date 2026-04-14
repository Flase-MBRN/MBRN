<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Numerologie-Rechner v1.6.1</title>
  <link rel="stylesheet" href="style.css">
  <script src="numerology.js" defer></script>
</head>
<body>
  <header role="banner" aria-label="Numerologie Rechner">
    <h1>Numerologie-Rechner v1.6.1</h1>
  </header>

  <main role="main" class="content" aria-labelledby="main-title">
    <div class="container">

      <!-- FORM CARD -->
      <section class="form-card" aria-labelledby="form-title">
        <h2 id="form-title" class="sr-only">Eingaben</h2>
        <form id="numerologyForm" novalidate autocomplete="on">
          <fieldset style="border:0;padding:0;margin:0">
            <legend class="sr-only">Numerologie Eingabefelder</legend>

            <div class="input-row">
              <label for="name">Dein Name</label>
              <input
                type="text"
                id="name"
                name="name"
                autocomplete="name"
                inputmode="text"
                placeholder="Vorname Nachname"
                title="Gib deinen vollen Namen ein. Umlaute (ä/ö/ü) und Bindestriche werden automatisch korrekt verarbeitet.">
              <div class="error" id="nameError" aria-live="polite"></div>
            </div>

            <div class="input-row">
              <label for="birthdate">Geburtsdatum (TT.MM.JJJJ)</label>
              <input
                type="text"
                id="birthdate"
                name="birthdate"
                autocomplete="bday"
                inputmode="numeric"
                pattern="\d{2}\.\d{2}\.\d{4}"
                placeholder="TT.MM.JJJJ"
                title="Tag.Monat.Jahr - Beispiel: 21.02.1991">
              <div class="error" id="dateError" aria-live="polite"></div>
            </div>

            <div class="input-row">
              <button type="submit" id="calcBtn" aria-controls="resultsGrid">Berechnen</button>
            </div>

            <div class="input-row">
              <button type="reset" id="resetBtn">Zurücksetzen</button>
            </div>
          </fieldset>
        </form>
        <p class="helper">Hinweis: Umlaute (ä/ö/ü), ß und Bindestriche werden automatisch korrekt verarbeitet.</p>
      </section>

      <!-- RESULTS CARD -->
      <aside class="results-card" aria-labelledby="results-title" role="region">
        <h2 id="results-title">Ergebnisse</h2>

        <div class="results-grid" id="resultsGrid" role="list" aria-live="polite" aria-relevant="additions text">
          <!-- Kernzahlen mit Erklärung -->
          <div class="result-tile life-number" id="lifeTile" data-priority="1" role="listitem" aria-label="Lebenszahl">
            <div class="result-title">
              <span>Lebenszahl</span>
              <button class="tooltip" title="Die Lebenszahl zeigt den Lebensweg und grundlegende Eigenschaften.">ℹ️</button>
            </div>
            <div class="result-value" id="lifePathNumber" role="status" aria-atomic="true" data-number-type="life"></div>
            <div class="result-explanation" id="lifeExplanation" aria-live="polite"></div>
          </div>

          <div class="result-tile soul-number" id="soulTile" data-priority="2" role="listitem" aria-label="Seelenzahl">
            <div class="result-title">
              <span>Seelenzahl</span>
              <button class="tooltip" title="Die Seelenzahl zeigt dein inneres Bedürfnis und Emotionen.">ℹ️</button>
            </div>
            <div class="result-value" id="soulNumber" role="status" aria-atomic="true" data-number-type="soul"></div>
            <div class="result-explanation" id="soulExplanation" aria-live="polite"></div>
          </div>

          <div class="result-tile expression-number" id="expressionTile" data-priority="3" role="listitem" aria-label="Ausdruckszahl">
            <div class="result-title">
              <span>Ausdruckszahl</span>
              <button class="tooltip" title="Die Ausdruckszahl beschreibt, wie du dich ausdrückst und wie andere dich wahrnehmen.">ℹ️</button>
            </div>
            <div class="result-value" id="expressionNumber" role="status" aria-atomic="true" data-number-type="expression"></div>
            <div class="result-explanation" id="expressionExplanation" aria-live="polite"></div>
          </div>

          <div class="result-tile personality-number" id="personalityTile" data-priority="4" role="listitem" aria-label="Persönlichkeitszahl">
            <div class="result-title">
              <span>Persönlichkeitszahl</span>
              <button class="tooltip" title="Die Persönlichkeitszahl zeigt, wie andere dich auf den ersten Blick wahrnehmen.">ℹ️</button>
            </div>
            <div class="result-value" id="personalityNumber" role="status" aria-atomic="true" data-number-type="personality"></div>
            <div class="result-explanation" id="personalityExplanation" aria-live="polite"></div>
          </div>
        </div>

        <!-- Extra Zahlen: karmische Zahl, Persönliches Jahr, Balance etc. -->
        <div class="results-grid" id="extraNumbersGrid" aria-live="polite"></div>
      </aside>
    </div>
  </main>

  <footer class="footer" role="contentinfo">
    <small>v1.6.1 — inklusive Masterzahlen, Erklärungen und responsiv</small>
  </footer>

  <!-- quick helper styles for sr-only & tooltip -->
  <style>
    .sr-only { position:absolute !important; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
    button.tooltip { background:transparent; border:none; color:inherit; padding:0 6px; font-size:0.95rem; cursor:help; }
  </style>
</body>
</html>