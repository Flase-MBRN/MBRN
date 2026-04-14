<!DOCTYPE html>

<html lang="de" data-theme="dark">

<head>

  <meta charset="UTF-8">

  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <meta name="description" content="Numerologie-Rechner v3.0 – 36 Zahlen, Lo-Shu Psychomatrix, Quantum Score, Y-Vokal-Regel, Komponenten-Lebensweg.">

  <meta name="theme-color" content="#c8a84b">

  <meta name="apple-mobile-web-app-capable" content="yes">

  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

  <title>Numerologie-Rechner v3.0</title>

  

  <link rel="manifest" href="manifest.json">

  <link rel="preconnect" href="https://fonts.googleapis.com">

  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="style.css">

</head>

<body>

  

  <div class="bg-orb bg-orb--1" aria-hidden="true"></div>

  <div class="bg-orb bg-orb--2" aria-hidden="true"></div>

  

  <!-- ═══ HEADER ═══ -->

  <header class="site-header" role="banner">

    <div class="header-inner">

      <span class="header-icon" aria-hidden="true">✦</span>

      <h1 class="site-title">Numerologie-Rechner</h1>

      <span class="version-badge">v3.0</span>

      <button class="theme-toggle" id="themeToggle" type="button" aria-label="Light Mode">☀</button>

    </div>

    <p class="site-subtitle">36 Zahlen · Lo-Shu Psychomatrix · Y-Vokal-Regel · Quantum Score</p>

  </header>

  

  <!-- ═══ HAUPTINHALT ═══ -->

  <main class="content" id="main" role="main">

    <div class="container">

  

      <!-- EINGABE-KARTE -->

      <section class="card form-card" aria-labelledby="form-title">

        <h2 id="form-title" class="card-title">Deine Daten</h2>

  

        <form id="numerologyForm" novalidate autocomplete="on">

          <fieldset class="form-fieldset">

            <legend class="sr-only">Numerologie Eingabefelder</legend>

  

            <div class="input-group">

              <label for="name" class="input-label">Vollständiger Name</label>

              <input

                type="text" id="name" name="name"

                autocomplete="name" inputmode="text"

                placeholder="Vorname Nachname"

                aria-describedby="nameError nameHint"

              >

              <p class="input-hint" id="nameHint">Umlaute (ä/ö/ü), ß und Bindestriche werden automatisch verarbeitet.</p>

              <div class="error-msg" id="nameError" role="alert" aria-live="polite"></div>

            </div>

  

            <div class="input-group">

              <label for="birthdate" class="input-label">Geburtsdatum</label>

              <input

                type="text" id="birthdate" name="birthdate"

                autocomplete="bday" inputmode="numeric"

                pattern="\d{2}\.\d{2}\.\d{4}" placeholder="TT.MM.JJJJ"

                aria-describedby="dateError"

              >

              <div class="error-msg" id="dateError" role="alert" aria-live="polite"></div>

            </div>

  

            <div class="button-row">

              <button type="submit" id="calcBtn" class="btn btn--primary" aria-controls="resultsGrid extraNumbersGrid">

                <span class="btn-icon" aria-hidden="true">✦</span>Berechnen

              </button>

              <button type="reset" id="resetBtn" class="btn btn--secondary">Zurücksetzen</button>

            </div>

  

          </fieldset>

        </form>

      </section>

  

      <!-- ERGEBNIS-KARTE -->

      <section class="card results-card" aria-labelledby="results-title">

        <div class="results-card-header">

          <h2 id="results-title" class="card-title">Ergebnisse</h2>

          <div class="result-actions" id="resultActions" hidden>

            <button class="btn btn--ghost" id="shareBtn" type="button" aria-label="Ergebnisse teilen">🔗 Teilen</button>

            <button class="btn btn--ghost" id="printBtn" type="button" aria-label="Drucken">🖨 Drucken</button>

          </div>

        </div>

  

        <p class="results-hint" id="resultsHint">Kacheln anklicken für Details.</p>

  

        <!-- Kernzahlen -->

        <div class="results-grid" id="resultsGrid" role="list" aria-live="polite" aria-label="Kern-Zahlen">

  

          <article class="result-tile life-number" id="lifeTile" role="listitem" aria-label="Lebenszahl">

            <div class="result-title">

              <span>Lebenszahl</span>

              <button class="tooltip-btn" type="button" aria-label="Info" data-tooltip="Dein Lebensweg — die wichtigste Zahl. v3.0: Komponenten-Methode (präziser bei Masterzahlen).">ℹ</button>

            </div>

            <div class="result-value" id="lifePathNumber" role="status" aria-atomic="true"></div>

            <div class="result-explanation" id="lifeExplanation" aria-live="polite"></div>

          </article>

  

          <article class="result-tile expression-number" id="expressionTile" role="listitem" aria-label="Ausdruckszahl">

            <div class="result-title">

              <span>Ausdruckszahl</span>

              <button class="tooltip-btn" type="button" aria-label="Info" data-tooltip="Dein Potential und deine Talente — was du in diesem Leben ausdrücken kannst.">ℹ</button>

            </div>

            <div class="result-value" id="expressionNumber" role="status" aria-atomic="true"></div>

            <div class="result-explanation" id="expressionExplanation" aria-live="polite"></div>

          </article>

  

          <article class="result-tile soul-number" id="soulTile" role="listitem" aria-label="Seelenzahl">

            <div class="result-title">

              <span>Seelenzahl</span>

              <button class="tooltip-btn" type="button" aria-label="Info" data-tooltip="Dein innerstes Bedürfnis. v3.0: Y-Vokal-Regel aktiv — Y zwischen Konsonanten zählt als Vokal.">ℹ</button>

            </div>

            <div class="result-value" id="soulNumber" role="status" aria-atomic="true"></div>

            <div class="result-explanation" id="soulExplanation" aria-live="polite"></div>

          </article>

  

          <article class="result-tile personality-number" id="personalityTile" role="listitem" aria-label="Persönlichkeitszahl">

            <div class="result-title">

              <span>Persönlichkeitszahl</span>

              <button class="tooltip-btn" type="button" aria-label="Info" data-tooltip="Wie andere dich wahrnehmen. v3.0: Y als Vokal = nicht in Persönlichkeit gezählt.">ℹ</button>

            </div>

            <div class="result-value" id="personalityNumber" role="status" aria-atomic="true"></div>

            <div class="result-explanation" id="personalityExplanation" aria-live="polite"></div>

          </article>

  

        </div>

  

        <!-- Extra-Zahlen (dynamisch via JS) -->

        <div class="results-grid results-grid--extra" id="extraNumbersGrid" aria-live="polite" aria-label="Zusatz-Zahlen"></div>

  

      </section>

  

    </div><!-- /container -->

  

    <!-- VERGLEICH-KARTE -->

    <div class="container container--full">

      <section class="card compare-card" aria-labelledby="compare-title">

        <h2 id="compare-title" class="card-title">Kompatibilität vergleichen</h2>

  

        <form id="compareForm" novalidate autocomplete="off">

          <div class="compare-inputs">

  

            <div class="compare-person">

              <div class="compare-person-label">Person 1</div>

              <div class="input-group">

                <label for="compareName1" class="input-label">Name</label>

                <input type="text" id="compareName1" inputmode="text" placeholder="Vorname Nachname">

              </div>

              <div class="input-group">

                <label for="compareDate1" class="input-label">Geburtsdatum</label>

                <input type="text" id="compareDate1" inputmode="numeric" placeholder="TT.MM.JJJJ">

              </div>

            </div>

  

            <div class="compare-divider" aria-hidden="true">✦</div>

  

            <div class="compare-person">

              <div class="compare-person-label">Person 2</div>

              <div class="input-group">

                <label for="compareName2" class="input-label">Name</label>

                <input type="text" id="compareName2" inputmode="text" placeholder="Vorname Nachname">

              </div>

              <div class="input-group">

                <label for="compareDate2" class="input-label">Geburtsdatum</label>

                <input type="text" id="compareDate2" inputmode="numeric" placeholder="TT.MM.JJJJ">

              </div>

            </div>

  

          </div>

  

          <div class="button-row">

            <button type="submit" class="btn btn--primary">

              <span class="btn-icon" aria-hidden="true">◈</span>Kompatibilität berechnen

            </button>

            <button type="reset" class="btn btn--secondary">Zurücksetzen</button>

          </div>

        </form>

  

        <div id="compareResults" aria-live="polite"></div>

      </section>

    </div>

  

  </main>

  

  <!-- ═══ FOOTER ═══ -->

  <footer class="site-footer" role="contentinfo">

    <small>

      <span aria-hidden="true">✦</span>

      Numerologie-Rechner v3.0 — 36 Zahlen · Lo-Shu Psychomatrix · Quantum Score · Y-Vokal-Regel · Komponenten-Lebensweg

      <span aria-hidden="true">✦</span>

    </small>

  </footer>

  

  <!-- ═══ MODAL ═══ -->

  <dialog class="detail-modal" id="detailModal" aria-modal="true" aria-labelledby="modalNumberType">

    <div class="modal-inner">

      <button class="modal-close" id="modalClose" type="button" aria-label="Schließen">✕</button>

      <div class="modal-top">

        <span class="modal-icon" id="modalIcon">✦</span>

        <div class="modal-type" id="modalNumberType"></div>

        <div class="modal-value" id="modalValue"></div>

      </div>

      <p class="modal-short" id="modalShortExpl"></p>

      <p class="modal-extended" id="modalExtended"></p>

      <div class="modal-calc-box">

        <span class="modal-calc-label">Berechnung</span>

        <span class="modal-calc" id="modalCalc"></span>

      </div>

    </div>

  </dialog>

  

  <script src="numerology.js" defer></script>

  

</body>

</html>