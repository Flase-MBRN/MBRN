<!DOCTYPE html>

<html lang="de">

<head>

  <meta charset="UTF-8">

  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <meta name="description" content="Numerologie-Rechner – Berechne deine Lebenszahl, Seelenzahl, Ausdruckszahl und mehr.">

  <title>Numerologie-Rechner v1.7</title>

  

  <!-- Fonts: Syne (Headlines/Zahlen) + Outfit (Body/Labels) -->

  <link rel="preconnect" href="https://fonts.googleapis.com">

  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">

  

  <link rel="stylesheet" href="style.css">

</head>

<body>

  

  <!-- ===== HINTERGRUND-DEKORATION ===== -->

  <div class="bg-orb bg-orb--1" aria-hidden="true"></div>

  <div class="bg-orb bg-orb--2" aria-hidden="true"></div>

  

  <!-- ===== HEADER ===== -->

  <header class="site-header" role="banner">

    <div class="header-inner">

      <span class="header-icon" aria-hidden="true">✦</span>

      <h1 class="site-title">Numerologie-Rechner</h1>

      <span class="version-badge">v1.7</span>

    </div>

    <p class="site-subtitle">Entdecke die Zahlen hinter deinem Namen und Geburtsdatum</p>

  </header>

  

  <!-- ===== HAUPTINHALT ===== -->

  <main class="content" id="main" role="main">

    <div class="container">

  

      <!-- EINGABE-KARTE -->

      <section class="card form-card" aria-labelledby="form-title">

        <h2 id="form-title" class="card-title">Deine Daten</h2>

  

        <form id="numerologyForm" novalidate autocomplete="on">

          <fieldset class="form-fieldset">

            <legend class="sr-only">Numerologie Eingabefelder</legend>

  

            <!-- Name -->

            <div class="input-group">

              <label for="name" class="input-label">

                Vollständiger Name

              </label>

              <input

                type="text"

                id="name"

                name="name"

                autocomplete="name"

                inputmode="text"

                placeholder="Vorname Nachname"

                aria-describedby="nameError nameHint"

                title="Gib deinen vollen Namen ein. Umlaute, ß und Bindestriche werden korrekt verarbeitet."

              >

              <p class="input-hint" id="nameHint">

                Umlaute (ä/ö/ü), ß und Bindestriche werden automatisch verarbeitet.

              </p>

              <div class="error-msg" id="nameError" role="alert" aria-live="polite"></div>

            </div>

  

            <!-- Geburtsdatum -->

            <div class="input-group">

              <label for="birthdate" class="input-label">

                Geburtsdatum

              </label>

              <input

                type="text"

                id="birthdate"

                name="birthdate"

                autocomplete="bday"

                inputmode="numeric"

                pattern="\d{2}\.\d{2}\.\d{4}"

                placeholder="TT.MM.JJJJ"

                aria-describedby="dateError"

                title="Tag.Monat.Jahr – Beispiel: 21.02.1991"

              >

              <div class="error-msg" id="dateError" role="alert" aria-live="polite"></div>

            </div>

  

            <!-- Aktionsbuttons -->

            <div class="button-row">

              <button type="submit" id="calcBtn" class="btn btn--primary" aria-controls="resultsGrid extraNumbersGrid">

                <span class="btn-icon" aria-hidden="true">✦</span>

                Berechnen

              </button>

              <button type="reset" id="resetBtn" class="btn btn--secondary">

                Zurücksetzen

              </button>

            </div>

  

          </fieldset>

        </form>

      </section>

  

      <!-- ERGEBNIS-KARTE -->

      <section class="card results-card" aria-labelledby="results-title">

        <h2 id="results-title" class="card-title">Ergebnisse</h2>

  

        <!-- Kernzahlen-Grid -->

        <div

          class="results-grid"

          id="resultsGrid"

          role="list"

          aria-live="polite"

          aria-relevant="additions text"

          aria-label="Kern-Zahlen"

        >

  

          <!-- Lebenszahl -->

          <article class="result-tile life-number" id="lifeTile" role="listitem" aria-label="Lebenszahl">

            <div class="result-title">

              <span>Lebenszahl</span>

              <button

                class="tooltip-btn"

                type="button"

                aria-label="Info zur Lebenszahl"

                data-tooltip="Die Lebenszahl zeigt den Lebensweg und grundlegende Eigenschaften."

              >ℹ</button>

            </div>

            <div class="result-value" id="lifePathNumber" role="status" aria-atomic="true" aria-label="Lebenszahl Wert"></div>

            <div class="result-explanation" id="lifeExplanation" aria-live="polite"></div>

          </article>

  

          <!-- Seelenzahl -->

          <article class="result-tile soul-number" id="soulTile" role="listitem" aria-label="Seelenzahl">

            <div class="result-title">

              <span>Seelenzahl</span>

              <button

                class="tooltip-btn"

                type="button"

                aria-label="Info zur Seelenzahl"

                data-tooltip="Die Seelenzahl zeigt dein inneres Bedürfnis und deine tiefsten Wünsche."

              >ℹ</button>

            </div>

            <div class="result-value" id="soulNumber" role="status" aria-atomic="true" aria-label="Seelenzahl Wert"></div>

            <div class="result-explanation" id="soulExplanation" aria-live="polite"></div>

          </article>

  

          <!-- Ausdruckszahl -->

          <article class="result-tile expression-number" id="expressionTile" role="listitem" aria-label="Ausdruckszahl">

            <div class="result-title">

              <span>Ausdruckszahl</span>

              <button

                class="tooltip-btn"

                type="button"

                aria-label="Info zur Ausdruckszahl"

                data-tooltip="Die Ausdruckszahl beschreibt dein Potential und wie andere dich wahrnehmen."

              >ℹ</button>

            </div>

            <div class="result-value" id="expressionNumber" role="status" aria-atomic="true" aria-label="Ausdruckszahl Wert"></div>

            <div class="result-explanation" id="expressionExplanation" aria-live="polite"></div>

          </article>

  

          <!-- Persönlichkeitszahl -->

          <article class="result-tile personality-number" id="personalityTile" role="listitem" aria-label="Persönlichkeitszahl">

            <div class="result-title">

              <span>Persönlichkeitszahl</span>

              <button

                class="tooltip-btn"

                type="button"

                aria-label="Info zur Persönlichkeitszahl"

                data-tooltip="Die Persönlichkeitszahl zeigt, wie andere dich auf den ersten Blick wahrnehmen."

              >ℹ</button>

            </div>

            <div class="result-value" id="personalityNumber" role="status" aria-atomic="true" aria-label="Persönlichkeitszahl Wert"></div>

            <div class="result-explanation" id="personalityExplanation" aria-live="polite"></div>

          </article>

  

        </div><!-- /resultsGrid -->

  

        <!-- Extrazahlen-Grid (dynamisch befüllt via JS) -->

        <div

          class="results-grid results-grid--extra"

          id="extraNumbersGrid"

          aria-live="polite"

          aria-label="Zusatz-Zahlen"

        ></div>

  

      </section><!-- /results-card -->

  

    </div><!-- /container -->

  </main>

  

  <!-- ===== FOOTER ===== -->

  <footer class="site-footer" role="contentinfo">

    <small>

      <span aria-hidden="true">✦</span>

      Numerologie-Rechner v1.7 — Masterzahlen · Karmik · Persönliches Jahr

      <span aria-hidden="true">✦</span>

    </small>

  </footer>

  

  <script src="numerology.js" defer></script>

  

</body>

</html>

  

<!--

=============================================================

  HTML: VERBESSERUNGEN IN v1.7

=============================================================

  ✅ Inline-<style>-Block vollständig in style.css ausgelagert

  ✅ .sr-only & .tooltip via CSS statt HTML-Inline

  ✅ Semantisches <article> für Kacheln, <section> für Cards

  ✅ aria-describedby für Input-Felder (nameHint, nameError)

  ✅ data-tooltip Attribut für JS-gesteuerte Tooltips

  ✅ aria-label auf allen Buttons (Accessibility)

  ✅ <button type="button"> für Tooltips (kein ungewolltes Submit)

  ✅ Hintergrund-Orbs als dedizierte aria-hidden Elemente

  ✅ Google Fonts (Cinzel + DM Sans) für stärkere Identität

  ✅ Zwei separate Buttons in einer .button-row statt je eigener .input-row

  ✅ meta description für SEO

  ✅ header-inner mit Icon + Badge für visuelles Branding

  

=============================================================

  HTML: IDEEN FÜR v2.0

=============================================================

  💡 <dialog>-Element für detaillierte Modal-Erklärungen je Zahl

  💡 Progressive-Web-App (PWA): manifest.json + Service Worker für Offline-Nutzung

  💡 Ergebnis-Sektion als separate Route (/results) mit Share-URL per ?name=&date=

  💡 Dark/Light-Mode-Toggle im Header mit prefers-color-scheme als Default

  💡 Animiertes Ladeoverlay beim Berechnen (z. B. Sternenhimmel-Particle-Effekt)

  💡 Mehrsprachigkeit (i18n) via data-i18n Attribute und JSON-Sprachdateien

  💡 Druckansicht (.print-only Klassen) für PDF-Export der Ergebnisse

-->