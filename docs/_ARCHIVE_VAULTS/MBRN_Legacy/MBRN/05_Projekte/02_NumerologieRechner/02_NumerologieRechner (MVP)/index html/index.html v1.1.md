<!DOCTYPE html>

<html lang="de" data-theme="dark">

<head>

  <meta charset="UTF-8">

  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <meta name="description" content="Entdecke deinen Lebens-Archetypus: 36 Numerologie-Kennzahlen aus deinem Namen und Geburtsdatum — kostenlos, pythagoreisches System.">

  <meta property="og:title"       content="Was sagt dein Name wirklich über dich aus?">

  <meta property="og:description" content="Berechne deine 36 Numerologie-Kennzahlen: Lebenszahl, Archetype, Seelenzahl und mehr — kostenlos.">

  <meta property="og:type"        content="website">

  <meta name="theme-color" content="#7c3aed">

  <meta name="apple-mobile-web-app-capable" content="yes">

  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

  <title>Numerologie · Was sagt dein Name über dich?</title>

  

  <link rel="manifest" href="manifest.json">

  <link rel="preconnect" href="https://fonts.googleapis.com">

  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

  <!-- Cinzel: mystisch + elegant für Hero-Headline | Outfit: klar + lesbar für Body -->

  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="style.css">

  

  <!-- SW-Killer + Firefox-Polyfill -->

  <script>

    (function() {

      if ('serviceWorker' in navigator) {

        navigator.serviceWorker.getRegistrations().then(function(regs) {

          regs.forEach(function(r) { r.unregister(); });

        });

      }

      if ('caches' in window) {

        caches.keys().then(function(keys) {

          keys.forEach(function(k) { caches.delete(k); });

        });

      }

      if (typeof HTMLDialogElement === 'undefined') {

        document.addEventListener('DOMContentLoaded', function() {

          var d = document.getElementById('detailModal');

          if (!d) return;

          d.showModal = function() { d.setAttribute('open',''); d.style.display='flex'; };

          d.close    = function() { d.removeAttribute('open'); d.style.display='none'; };

        });

      }

    })();

  </script>

</head>

<body>

  

  <!-- Hintergrund-Effekte -->

  <div class="bg-orb bg-orb--1" aria-hidden="true"></div>

  <div class="bg-orb bg-orb--2" aria-hidden="true"></div>

  <div class="bg-grid" aria-hidden="true"></div>

  

  <!-- ═══════════════════════════════════════════════════════

       HERO SECTION

  ═══════════════════════════════════════════════════════ -->

  <header class="site-header" role="banner">

  

    <!-- Schmale Top-Bar: Brand + Theme Toggle -->

    <div class="topbar">

      <div class="topbar-inner">

        <span class="brand-mark">

          <span class="brand-star" aria-hidden="true">✦</span>

          <span class="brand-name">Numerologie</span>

          <span class="brand-version">v3</span>

        </span>

        <button class="theme-toggle" id="themeToggle" type="button" aria-label="Light Mode">☀</button>

      </div>

    </div>

  

    <!-- Hero-Headline -->

    <div class="hero">

      <div class="hero-inner">

        <p class="hero-eyebrow">✦ Pythagoreisches System · 36 Kennzahlen</p>

        <h1 class="hero-headline">

          Was sagt dein Name<br>

          <em class="hero-hl">wirklich</em> über dich aus?

        </h1>

        <p class="hero-subline">

          Entdecke deinen <strong>Lebens-Archetypus</strong> und

          deine Kernzahlen — kostenlos, in Sekunden.

        </p>

        <div class="hero-trust" role="list">

          <span role="listitem"><span aria-hidden="true">✓</span> Keine Datenspeicherung</span>

          <span role="listitem"><span aria-hidden="true">✓</span> Lokal berechnet</span>

          <span role="listitem"><span aria-hidden="true">✓</span> Kostenlos</span>

        </div>

  

        <!-- Was ist Numerologie? -->

        <button class="hero-info-btn" id="heroInfoBtn" type="button" aria-expanded="false">

          Was ist Numerologie? <span class="hero-info-caret" aria-hidden="true">↓</span>

        </button>

        <div class="hero-info-body" id="heroInfoBody" hidden>

          <p>

            <strong>Numerologie</strong> ist die Lehre über die Beziehung zwischen Zahlen und Lebensereignissen.

            Jeder Buchstabe deines Namens und jede Ziffer deines Geburtsdatums entspricht einer Zahl.

          </p>

          <p>

            Dieses Tool nutzt das <strong>pythagoreische System</strong> — das weltweit am weitesten verbreitete —

            mit <strong>Y-Vokal-Regel</strong>, <strong>Komponenten-Methode</strong> und einer vollständigen

            <strong>Lo-Shu Psychomatrix</strong>.

          </p>

        </div>

      </div>

    </div>

  

  </header>

  

  <!-- ═══════════════════════════════════════════════════════

       HAUPTINHALT

  ═══════════════════════════════════════════════════════ -->

  <main class="content" id="main" role="main">

    <div class="container">

  

      <!-- ── EINGABE-KARTE ── -->

      <section class="card form-card" aria-labelledby="form-title">

        <h2 id="form-title" class="card-title">Deine Daten</h2>

  

        <form id="numerologyForm" novalidate autocomplete="on">

          <fieldset class="form-fieldset">

            <legend class="sr-only">Numerologie Eingabefelder</legend>

  

            <div class="input-group">

              <label for="name" class="input-label">Vollständiger Geburtsname</label>

              <input

                type="text" id="name" name="name"

                autocomplete="name" inputmode="text"

                placeholder="Vorname Nachname"

                aria-describedby="nameError nameHint"

              >

              <p class="input-hint" id="nameHint">

                Umlaute (ä/ö/ü), ß und Bindestriche werden automatisch verarbeitet.

              </p>

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

              <button type="submit" id="calcBtn" class="btn btn--primary btn--calc"

                      aria-controls="resultsGrid extraNumbersGrid">

                <span class="btn-spinner-wrap" aria-hidden="true">✦</span>

                Jetzt berechnen

              </button>

              <button type="reset" id="resetBtn" class="btn btn--secondary">

                Zurücksetzen

              </button>

            </div>

  

          </fieldset>

        </form>

      </section>

  

      <!-- ── ERGEBNIS-KARTE ── -->

      <section class="card results-card" aria-labelledby="results-title">

  

        <div class="results-card-header">

          <h2 id="results-title" class="card-title">Dein Profil</h2>

          <div class="result-actions" id="resultActions" hidden>

            <button class="btn btn--ghost icon-btn" id="printBtn"

                    type="button" aria-label="Drucken">🖨</button>

          </div>

        </div>

  

        <!-- Leerer Zustand: Aufforderung -->

        <div class="results-empty" id="resultsEmpty">

          <div class="results-empty-icon" aria-hidden="true">✦</div>

          <p class="results-empty-text">

            Name und Geburtsdatum eingeben<br>und dein Profil erscheint hier.

          </p>

        </div>

  

        <!-- ── LIFE HERO: erscheint nach Berechnung ── -->

        <div id="resultsAnchor" aria-hidden="true"></div>

        <div class="life-hero-display" id="lifeHeroDisplay" hidden>

          <div class="life-hero-bg" aria-hidden="true"></div>

          <div class="life-hero-content">

            <p class="life-hero-eyebrow">Deine Lebenszahl</p>

            <div class="life-hero-num-wrap">

              <span class="life-hero-num" id="lifeHeroNum" role="status" aria-atomic="true"></span>

              <span class="life-hero-glow" aria-hidden="true"></span>

            </div>

            <div class="life-hero-archetype-row">

              <span class="life-hero-archetype" id="lifeHeroArchetype"></span>

              <span class="life-hero-badge" id="lifeHeroBadge" hidden></span>

            </div>

            <p class="life-hero-teaser" id="lifeHeroTeaser"></p>

            <button class="life-hero-detail-btn" id="lifeHeroDetailBtn" type="button">

              Deutung anzeigen →

            </button>

          </div>

        </div>

  

        <!-- Hint: erscheint nach Berechnung -->

        <p class="results-hint" id="resultsHint">

          ✦ Tippe auf eine Zahl für die vollständige Deutung

        </p>

  

        <!-- ── 4 KERN-TILES ── -->

        <div class="results-grid" id="resultsGrid"

             role="list" aria-live="polite" aria-label="Kern-Zahlen">

  

          <article class="result-tile life-number" id="lifeTile"

                   role="listitem" aria-label="Lebenszahl">

            <div class="result-title">

              <span>Lebenszahl</span>

              <button class="tooltip-btn" type="button" aria-label="Info"

                data-tooltip="Dein Lebensweg — die wichtigste Zahl. Komponenten-Methode: Tag + Monat + Jahr einzeln reduziert.">ℹ</button>

            </div>

            <div class="result-value" id="lifePathNumber" role="status" aria-atomic="true"></div>

            <div class="result-explanation" id="lifeExplanation" aria-live="polite"></div>

          </article>

  

          <article class="result-tile expression-number" id="expressionTile"

                   role="listitem" aria-label="Ausdruckszahl">

            <div class="result-title">

              <span>Ausdruckszahl</span>

              <button class="tooltip-btn" type="button" aria-label="Info"

                data-tooltip="Dein Potential und deine Talente — alle Buchstaben des Namens nach Pythagoras.">ℹ</button>

            </div>

            <div class="result-value" id="expressionNumber" role="status" aria-atomic="true"></div>

            <div class="result-explanation" id="expressionExplanation" aria-live="polite"></div>

          </article>

  

          <article class="result-tile soul-number" id="soulTile"

                   role="listitem" aria-label="Seelenzahl">

            <div class="result-title">

              <span>Seelenzahl</span>

              <button class="tooltip-btn" type="button" aria-label="Info"

                data-tooltip="Dein innerstes Bedürfnis — Vokale + Y-Vokal-Regel (v3.0).">ℹ</button>

            </div>

            <div class="result-value" id="soulNumber" role="status" aria-atomic="true"></div>

            <div class="result-explanation" id="soulExplanation" aria-live="polite"></div>

          </article>

  

          <article class="result-tile personality-number" id="personalityTile"

                   role="listitem" aria-label="Persönlichkeitszahl">

            <div class="result-title">

              <span>Persönlichkeitszahl</span>

              <button class="tooltip-btn" type="button" aria-label="Info"

                data-tooltip="Wie andere dich wahrnehmen — Konsonanten des Namens.">ℹ</button>

            </div>

            <div class="result-value" id="personalityNumber" role="status" aria-atomic="true"></div>

            <div class="result-explanation" id="personalityExplanation" aria-live="polite"></div>

          </article>

  

        </div>

  

        <!-- Extra-Zahlen (dynamisch via JS) -->

        <div class="results-grid results-grid--extra"

             id="extraNumbersGrid"

             aria-live="polite" aria-label="Zusatz-Zahlen"></div>

  

      </section>

  

    </div><!-- /container -->

  
  

    <!-- ── SHARE BAR ── -->

    <div class="container container--full bar-wrap" id="shareBarWrap" hidden>

      <div class="share-bar">

        <p class="share-bar-headline">Zeig anderen wer du bist</p>

        <p class="share-bar-text" id="shareBarText"></p>

        <div class="share-bar-actions">

          <button class="btn btn--wa" id="shareBtnWA" type="button">

            <svg class="wa-icon" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">

              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>

            </svg>

            Via WhatsApp teilen

          </button>

          <button class="btn btn--copy" id="shareBtnCopy" type="button">

            <span id="shareCopyIcon">🔗</span>

            <span id="shareCopyText">Link kopieren</span>

          </button>

        </div>

      </div>

    </div>

  

    <!-- ── VERGLEICH-KARTE ── -->

    <div class="container container--full">

      <section class="card compare-card" aria-labelledby="compare-title">

        <h2 id="compare-title" class="card-title">Kompatibilität vergleichen</h2>

        <p class="compare-intro">

          Gib zwei Namen ein und entdecke, wie gut ihre Energien harmonieren.

        </p>

  

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

              <span class="btn-icon" aria-hidden="true">◈</span>

              Kompatibilität berechnen

            </button>

            <button type="reset" class="btn btn--secondary">Zurücksetzen</button>

          </div>

        </form>

  

        <div id="compareResults" aria-live="polite"></div>

      </section>

    </div>

  

    <!-- ── CTA BAR ── -->

    <div class="container container--full bar-wrap" id="ctaBarWrap" hidden>

      <div class="cta-bar">

        <p class="cta-bar-label">Weitermachen</p>

        <div class="cta-bar-actions">

          <button class="btn btn--cta" id="ctaBtnReset" type="button">

            ↺ Anderen Namen testen

          </button>

          <button class="btn btn--cta" id="ctaBtnCompare" type="button">

            ◈ Kompatibilität prüfen

          </button>

        </div>

      </div>

    </div>

  

  </main>

  

  <!-- ═══ FOOTER ═══ -->

  <footer class="site-footer" role="contentinfo">

    <div class="footer-inner">

      <p class="footer-brand">✦ Numerologie</p>

      <p class="footer-info">

        36 Zahlen · Lo-Shu Psychomatrix · Quantum Score · Y-Vokal-Regel

      </p>

    </div>

  </footer>

  

  <!-- ═══ MODAL ═══ -->

  <dialog class="detail-modal" id="detailModal"

          aria-modal="true" aria-labelledby="modalNumberType">

    <div class="modal-inner">

      <button class="modal-close" id="modalClose" type="button" aria-label="Schließen">✕</button>

      <div class="modal-top">

        <span class="modal-icon" id="modalIcon">✦</span>

        <div class="modal-type" id="modalNumberType"></div>

        <div class="modal-value" id="modalValue"></div>

      </div>

      <p class="modal-short" id="modalShortExpl"></p>

      <div class="modal-extended" id="modalExtended"></div>

      <div class="modal-calc-box">

        <span class="modal-calc-label">Berechnungsformel</span>

        <span class="modal-calc" id="modalCalc"></span>

      </div>

    </div>

  </dialog>

  

  <script src="numerology.js" defer></script>

</body>

</html>