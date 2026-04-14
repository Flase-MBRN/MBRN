<!DOCTYPE html>

<html lang="de" data-theme="dark">

<head>

  <meta charset="UTF-8">

  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <meta name="description" content="Entdecke deinen Lebens-Archetypus: 36 Numerologie-Kennzahlen kostenlos.">

  <meta property="og:title" content="Was sagt dein Name wirklich über dich aus?">

  <meta property="og:type" content="website">

  <meta name="theme-color" content="#7c3aed">

  <meta name="apple-mobile-web-app-capable" content="yes">

  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

  <title>Numerologie · Was sagt dein Name über dich?</title>

  <link rel="manifest" href="manifest.json">

  <link rel="preconnect" href="https://fonts.googleapis.com">

  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="style.css">

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

          ['detailModal','shareCardModal'].forEach(function(id) {

            var d = document.getElementById(id);

            if (!d) return;

            d.showModal = function() { d.setAttribute('open',''); d.style.display='flex'; };

            d.close    = function() { d.removeAttribute('open'); d.style.display=''; };

          });

        });

      }

    })();

  </script>

</head>

<body>

  

  <div class="bg-orb bg-orb--1" aria-hidden="true"></div>

  <div class="bg-orb bg-orb--2" aria-hidden="true"></div>

  <div class="bg-grid" aria-hidden="true"></div>

  

  <!-- LOADING OVERLAY -->

  <div class="loading-overlay" id="loadingOverlay" aria-hidden="true" hidden>

    <div class="loading-inner">

      <div class="loading-star" aria-hidden="true">✦</div>

      <p class="loading-msg" id="loadingMsg">Analyse wird gestartet…</p>

      <div class="loading-bar-track">

        <div class="loading-bar" id="loadingBar"></div>

      </div>

    </div>

  </div>

  

  <!-- HEADER -->

  <header class="site-header" role="banner">

    <div class="topbar">

      <div class="topbar-inner">

        <span class="brand-mark">

          <span class="brand-star" aria-hidden="true">✦</span>

          <span class="brand-name">Numerologie</span>

          <span class="brand-version">v4</span>

        </span>

        <button class="theme-toggle" id="themeToggle" type="button" aria-label="Light Mode">☀</button>

      </div>

    </div>

    <div class="hero">

      <div class="hero-inner">

        <p class="hero-eyebrow">✦ Pythagoreisches System · 36 Kennzahlen</p>

        <h1 class="hero-headline">

          Was sagt dein Name<br>

          <em class="hero-hl">wirklich</em> über dich aus?

        </h1>

        <p class="hero-subline">

          Entdecke deinen <strong>Lebens-Archetypus</strong> und deine Kernzahlen — kostenlos, in Sekunden.

        </p>

        <div class="hero-trust" role="list">

          <span role="listitem"><span aria-hidden="true">✓</span> Keine Datenspeicherung</span>

          <span role="listitem"><span aria-hidden="true">✓</span> Lokal berechnet</span>

          <span role="listitem"><span aria-hidden="true">✓</span> Kostenlos</span>

        </div>

        <button class="hero-info-btn" id="heroInfoBtn" type="button" aria-expanded="false">

          Was ist Numerologie? <span class="hero-info-caret" aria-hidden="true">↓</span>

        </button>

        <div class="hero-info-body" id="heroInfoBody" hidden>

          <p><strong>Numerologie</strong> verbindet Zahlen mit Lebensereignissen. Jeder Buchstabe deines Namens und jede Ziffer deines Geburtsdatums ergibt eine Zahl.</p>

          <p>Dieses Tool nutzt das <strong>pythagoreische System</strong> mit <strong>Y-Vokal-Regel</strong>, <strong>Komponenten-Methode</strong> und <strong>Lo-Shu Psychomatrix</strong>.</p>

        </div>

      </div>

    </div>

  </header>

  

  <main class="content" id="main" role="main">

    <div class="container">

  

      <!-- EINGABE -->

      <section class="card form-card" aria-labelledby="form-title">

        <h2 id="form-title" class="card-title">Deine Daten</h2>

        <form id="numerologyForm" novalidate autocomplete="on">

          <fieldset class="form-fieldset">

            <legend class="sr-only">Numerologie Eingabefelder</legend>

            <div class="input-group">

              <label for="name" class="input-label">Vollständiger Geburtsname</label>

              <input type="text" id="name" name="name" autocomplete="name" inputmode="text"

                placeholder="Vorname Nachname" aria-describedby="nameError nameHint">

              <p class="input-hint" id="nameHint">Umlaute, ß und Bindestriche werden automatisch verarbeitet.</p>

              <div class="error-msg" id="nameError" role="alert" aria-live="polite"></div>

            </div>

            <div class="input-group">

              <label for="birthdate" class="input-label">Geburtsdatum</label>

              <input type="text" id="birthdate" name="birthdate" autocomplete="bday" inputmode="numeric"

                pattern="\d{2}\.\d{2}\.\d{4}" placeholder="TT.MM.JJJJ" aria-describedby="dateError">

              <div class="error-msg" id="dateError" role="alert" aria-live="polite"></div>

            </div>

            <div class="button-row">

              <button type="submit" id="calcBtn" class="btn btn--primary btn--calc" aria-controls="resultsGrid">

                <span class="btn-spinner-wrap" aria-hidden="true">✦</span>

                Jetzt berechnen

              </button>

              <button type="reset" id="resetBtn" class="btn btn--secondary">Zurücksetzen</button>

            </div>

          </fieldset>

        </form>

      </section>

  

      <!-- ERGEBNISSE -->

      <section class="card results-card" aria-labelledby="results-title">

        <div class="results-card-header">

          <h2 id="results-title" class="card-title">Dein Profil</h2>

          <div class="result-actions" id="resultActions" hidden>

            <button class="btn btn--ghost icon-btn" id="printBtn" type="button" aria-label="Drucken">🖨</button>

          </div>

        </div>

  

        <div class="results-empty" id="resultsEmpty">

          <div class="results-empty-icon" aria-hidden="true">✦</div>

          <p class="results-empty-text">Gib deinen Namen und Geburtstag ein<br>und entdecke deinen Archetypus.</p>

        </div>

  

        <div id="resultsAnchor" aria-hidden="true"></div>

  

        <!-- LIFE HERO -->

        <div class="life-hero-display" id="lifeHeroDisplay" hidden>

          <div class="life-hero-bg" aria-hidden="true"></div>

          <div class="life-hero-content">

            <p class="life-hero-eyebrow">Dein Lebensweg</p>

            <div class="life-hero-num-wrap">

              <span class="life-hero-glow" aria-hidden="true"></span>

              <div class="life-hero-num" id="lifeHeroNum" aria-label="Lebenszahl"></div>

            </div>

            <div class="life-hero-archetype-row">

              <span class="life-hero-archetype" id="lifeHeroArchetype"></span>

              <span class="life-hero-badge" id="lifeHeroBadge" hidden></span>

            </div>

            <p class="life-hero-teaser" id="lifeHeroTeaser"></p>

            <button class="life-hero-detail-btn" id="lifeHeroDetailBtn" type="button">

              Vollständige Deutung lesen →

            </button>

          </div>

        </div>

  

        <p class="results-hint" id="resultsHint" aria-live="polite"></p>

  

        <!-- KERN-KACHELN -->

        <div class="results-grid" id="resultsGrid" role="list" aria-live="polite" aria-label="Kern-Zahlen">

  

          <article class="result-tile life-number" id="lifeTile" role="listitem" aria-label="Lebenszahl">

            <div class="result-title">

              <span>Lebenszahl</span>

              <button class="tooltip-btn" type="button" aria-label="Info"

                data-tooltip="Dein Lebensweg — die wichtigste Zahl. Komponenten-Methode.">ℹ</button>

            </div>

            <div class="result-value" id="lifePathNumber" role="status" aria-atomic="true"></div>

            <div class="result-explanation" id="lifeExplanation" aria-live="polite"></div>

          </article>

  

          <article class="result-tile expression-number" id="expressionTile" role="listitem" aria-label="Ausdruckszahl">

            <div class="result-title">

              <span>Ausdruckszahl</span>

              <button class="tooltip-btn" type="button" aria-label="Info"

                data-tooltip="Dein Potential und deine Talente — alle Buchstaben des Namens.">ℹ</button>

            </div>

            <div class="result-value" id="expressionNumber" role="status" aria-atomic="true"></div>

            <div class="result-explanation" id="expressionExplanation" aria-live="polite"></div>

          </article>

  

          <article class="result-tile soul-number" id="soulTile" role="listitem" aria-label="Seelenzahl">

            <div class="result-title">

              <span>Seelenzahl</span>

              <button class="tooltip-btn" type="button" aria-label="Info"

                data-tooltip="Dein innerstes Bedürfnis — Vokale + Y-Vokal-Regel.">ℹ</button>

            </div>

            <div class="result-value" id="soulNumber" role="status" aria-atomic="true"></div>

            <div class="result-explanation" id="soulExplanation" aria-live="polite"></div>

          </article>

  

          <article class="result-tile personality-number" id="personalityTile" role="listitem" aria-label="Persönlichkeitszahl">

            <div class="result-title">

              <span>Persönlichkeit</span>

              <button class="tooltip-btn" type="button" aria-label="Info"

                data-tooltip="Wie andere dich wahrnehmen — Konsonanten des Namens.">ℹ</button>

            </div>

            <div class="result-value" id="personalityNumber" role="status" aria-atomic="true"></div>

            <div class="result-explanation" id="personalityExplanation" aria-live="polite"></div>

          </article>

  

        </div>

  

        <!-- AKKORDEONS -->

        <div class="accordions" id="accordions" hidden>

  

          <div class="acc-section">

            <button class="acc-header" type="button" aria-expanded="false" aria-controls="acc-talents-body">

              <span class="acc-icon" aria-hidden="true">✦</span>

              <span class="acc-title">Persönlichkeit &amp; Talente</span>

              <span class="acc-count" id="acc-talents-count"></span>

              <span class="acc-chevron" aria-hidden="true">›</span>

            </button>

            <div class="acc-body" id="acc-talents-body" hidden>

              <div class="results-grid results-grid--extra acc-grid" id="acc-talents-grid" aria-live="polite"></div>

            </div>

          </div>

  

          <div class="acc-section">

            <button class="acc-header" type="button" aria-expanded="false" aria-controls="acc-lifecycle-body">

              <span class="acc-icon" aria-hidden="true">◷</span>

              <span class="acc-title">Lebensweg &amp; Phasen</span>

              <span class="acc-count" id="acc-lifecycle-count"></span>

              <span class="acc-chevron" aria-hidden="true">›</span>

            </button>

            <div class="acc-body" id="acc-lifecycle-body" hidden>

              <div class="results-grid results-grid--extra acc-grid" id="acc-lifecycle-grid" aria-live="polite"></div>

            </div>

          </div>

  

          <div class="acc-section">

            <button class="acc-header" type="button" aria-expanded="false" aria-controls="acc-soul-body">

              <span class="acc-icon" aria-hidden="true">⚖</span>

              <span class="acc-title">Karma &amp; Psyche</span>

              <span class="acc-count" id="acc-soul-count"></span>

              <span class="acc-chevron" aria-hidden="true">›</span>

            </button>

            <div class="acc-body" id="acc-soul-body" hidden>

              <div class="results-grid results-grid--extra acc-grid" id="acc-soul-grid" aria-live="polite"></div>

            </div>

          </div>

  

          <div class="acc-section">

            <button class="acc-header" type="button" aria-expanded="false" aria-controls="acc-now-body">

              <span class="acc-icon" aria-hidden="true">◐</span>

              <span class="acc-title">Aktueller Moment</span>

              <span class="acc-count" id="acc-now-count"></span>

              <span class="acc-chevron" aria-hidden="true">›</span>

            </button>

            <div class="acc-body" id="acc-now-body" hidden>

              <div class="results-grid results-grid--extra acc-grid" id="acc-now-grid" aria-live="polite"></div>

            </div>

          </div>

  

        </div>

  

      </section>

    </div>

  

    <!-- SHARE BAR -->

    <div class="container container--full bar-wrap" id="shareBarWrap" hidden>

      <div class="share-bar">

        <p class="share-bar-headline">Zeig anderen wer du bist</p>

        <p class="share-bar-text" id="shareBarText"></p>

        <div class="share-bar-actions">

          <button class="btn btn--share-card" id="shareBtnCard" type="button">

            <span aria-hidden="true">✦</span> Karte erstellen

          </button>

          <button class="btn btn--wa" id="shareBtnWA" type="button">

            <svg class="wa-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">

              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>

            </svg>

            WhatsApp

          </button>

          <button class="btn btn--copy" id="shareBtnCopy" type="button">

            <span id="shareCopyIcon">🔗</span>

            <span>Link kopieren</span>

          </button>

        </div>

      </div>

    </div>

  

    <!-- VERGLEICH -->

    <div class="container container--full">

      <section class="card compare-card" aria-labelledby="compare-title">

        <h2 id="compare-title" class="card-title">Kompatibilität vergleichen</h2>

        <p class="compare-intro">Wie gut harmonieren zwei Energien miteinander?</p>

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

              <span class="btn-icon" aria-hidden="true">◈</span> Kompatibilität berechnen

            </button>

            <button type="reset" class="btn btn--secondary">Zurücksetzen</button>

          </div>

        </form>

        <div id="compareResults" aria-live="polite"></div>

      </section>

    </div>

  

    <!-- CTA BAR -->

    <div class="container container--full bar-wrap" id="ctaBarWrap" hidden>

      <div class="cta-bar">

        <p class="cta-bar-label">Weitermachen</p>

        <div class="cta-bar-actions">

          <button class="btn btn--cta" id="ctaBtnReset" type="button">↺ Anderen Namen testen</button>

          <button class="btn btn--cta" id="ctaBtnCompare" type="button">◈ Kompatibilität prüfen</button>

        </div>

      </div>

    </div>

  

  </main>

  

  <footer class="site-footer" role="contentinfo">

    <div class="footer-inner">

      <p class="footer-brand">✦ Numerologie</p>

      <p class="footer-info">36 Zahlen · Lo-Shu Psychomatrix · Quantum Score · Y-Vokal-Regel</p>

    </div>

  </footer>

  

  <!-- DETAIL MODAL -->

  <dialog class="detail-modal" id="detailModal" aria-modal="true" aria-labelledby="modalNumberType">

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

  

  <!-- SHARE CARD MODAL -->

  <dialog class="share-card-modal" id="shareCardModal" aria-modal="true" aria-label="Deine Numerologie-Karte">

    <div class="share-card-modal-inner">

      <button class="modal-close" id="shareCardClose" type="button" aria-label="Schließen">✕</button>

      <h2 class="share-card-title">Deine Numerologie-Karte</h2>

      <p class="share-card-hint">Lade deine persönliche Karte herunter und teile sie.</p>

      <div class="share-card-canvas-wrap">

        <canvas id="shareCardCanvas" width="1080" height="1080" aria-label="Deine Numerologie-Karte als Bild"></canvas>

      </div>

      <div class="share-card-actions">

        <button class="btn btn--primary" id="shareCardDownload" type="button">↓ Bild herunterladen</button>

        <button class="btn btn--wa" id="shareCardWA" type="button">

          <svg class="wa-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">

            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>

          </svg>

          Via WhatsApp teilen

        </button>

      </div>

    </div>

  </dialog>

  

  <script src="numerology.js" defer></script>

</body>

</html>