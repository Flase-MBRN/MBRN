<!DOCTYPE html>

<html lang="de">

<head>

  <meta charset="UTF-8" />

  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>30 Tage Disziplin Challenge – Dein täglicher Tracker</title>

  <meta name="description" content="Starte deine 30-Tage-Disziplin-Challenge. Kostenlos, ohne Konto, direkt im Browser." />

  <meta property="og:title" content="30 Tage Disziplin Challenge" />

  <meta property="og:description" content="Kostenloser Tracker für deine 30-Tage-Challenge. Kein Konto nötig." />

  <meta property="og:type" content="website" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />

  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

  <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />

  <link rel="stylesheet" href="style.css" />

</head>

<body>

  

  <div class="bg-noise"></div>

  <div class="bg-grid"></div>

  

  <!-- TOP NAV -->

  <nav class="topnav">

    <div class="topnav-brand">

      <span class="topnav-logo">DC</span>

      <span class="topnav-name">Disziplin Challenge</span>

    </div>

    <button class="topnav-premium" id="btn-header-premium">

      <span class="topnav-premium-star">✦</span> Premium

    </button>

  </nav>

  

  <!-- HAUPTCONTAINER -->

  <div class="container" id="main-container">

  

    <!-- HEADER -->

    <header class="header">

      <span class="tag" id="header-tag">KOSTENLOS · KEIN KONTO · NO BULLSHIT</span>

      <h1 class="title">DISZIPLIN<br/><span class="title-accent">CHALLENGE</span></h1>

      <p class="subtitle">30 Tage. Jeden Tag. Keine Ausreden.</p>

    </header>

  

    <!-- STATUS BADGE -->

    <div class="status-badge" id="status-badge">

      <span class="status-dot"></span>

      <span id="status-text">Bereit zum Start</span>

    </div>

  

    <!-- SNAPSHOT-BANNER -->

    <div class="snapshot-banner" id="snapshot-banner" style="display:none">

      <span>👁 Fortschritt einer anderen Person (schreibgeschützt)</span>

      <button class="btn-own-start" id="btn-own-start">Eigene Challenge starten →</button>

    </div>

  

    <!-- FORTSCHRITT -->

    <section class="progress-section">

  

      <div class="day-counter">

        <div class="day-number-wrap">

          <div class="day-number-block">

            <span class="day-number" id="current-day">00</span>

            <div class="day-glow"></div>

          </div>

          <div class="day-meta">

            <span class="day-of">von</span>

            <span class="day-total">30</span>

            <span class="day-days">Tagen</span>

          </div>

        </div>

        <p class="day-label" id="day-label">Noch kein Tag abgeschlossen</p>

      </div>

  

      <div class="progress-bar-wrap">

        <div class="progress-bar-track">

          <div class="progress-bar-fill" id="progress-bar" style="width:0%">

            <span class="progress-percent" id="progress-percent">0%</span>

          </div>

        </div>

      </div>

  

      <div class="dots-grid" id="dots-grid"></div>

  

    </section>

  

    <!-- HAUPT-BUTTON -->

    <section class="action-section">

      <button class="btn-primary" id="btn-done">

        <span class="btn-icon">✓</span>

        <span class="btn-text">HEUTE GESCHAFFT</span>

      </button>

      <p class="btn-hint" id="btn-hint">Hast du heute deine Challenge gemeistert?</p>

    </section>

  

    <!-- SHARE & SNAPSHOT -->

    <section class="share-section" id="share-section" style="display:none">

      <button class="btn-share" id="btn-share">

        <span>🔥</span> Fortschritt teilen

      </button>

      <button class="btn-snapshot" id="btn-snapshot">

        <span>🔗</span> Sync

      </button>

    </section>

  

    <!-- STATS -->

    <section class="stats-row" id="stats-row" style="display:none">

      <div class="stat-box">

        <span class="stat-number" id="stat-streak">0</span>

        <span class="stat-label">Streak</span>

      </div>

      <div class="stat-box stat-box--center">

        <span class="stat-number" id="stat-best">0</span>

        <span class="stat-label">Beste Serie</span>

      </div>

      <div class="stat-box">

        <span class="stat-number" id="stat-remaining">30</span>

        <span class="stat-label">Verbleibend</span>

      </div>

    </section>

  

    <!-- PREMIUM CTA -->

    <section class="premium-cta" id="premium-cta" style="display:none"><div class="premium-cta-inner-wrap">

      <div class="premium-cta-label">

        <span class="premium-star-icon">✦</span> PREMIUM

      </div>

      <p class="premium-cta-headline">Mehr aus deiner Challenge holen</p>

      <ul class="premium-cta-perks">

        <li>3 parallele Challenges</li>

        <li>Verlauf exportieren (CSV)</li>

        <li>Gold Share-Card Design</li>

      </ul>

      <button class="btn-premium-cta" id="btn-premium-cta">

        Freischalten — einmalig €2,99

      </button>

    </div>

    </section>

  

    <!-- PREMIUM SECTION (aktiv) -->

    <section class="premium-section" id="premium-section" style="display:none">

      <div class="premium-section-header">

        <span class="premium-star-icon">✦</span>

        <span class="premium-section-label">PREMIUM AKTIV</span>

      </div>

      <div class="multi-challenges" id="multi-challenges"></div>

      <button class="btn-export-history" id="btn-export-history">

        📥 Verlauf als CSV exportieren

      </button>

    </section>

  

    <!-- KO-FI -->

    <section class="support-section">

      <a class="btn-kofi" id="btn-kofi" href="https://ko-fi.com/flasembrn" target="_blank" rel="noopener">

        ☕ Dieses Tool unterstützen

      </a>

    </section>

  

    <!-- RESET -->

    <section class="reset-section">

      <button class="btn-reset" id="btn-reset">↺ Challenge neu starten</button>

    </section>

  

    <!-- FOOTER -->

    <footer class="footer">

      <p class="footer-privacy-note">Daten nur in deinem Browser · Kein Tracking · Kein Konto</p>

      <div class="footer-links">

        <button class="footer-link" id="btn-privacy">Datenschutz</button>

        <span class="footer-sep">·</span>

        <button class="footer-link" id="btn-stats-view">Statistiken</button>

        <span class="footer-sep">·</span>

        <span class="footer-version">v2.2</span>

      </div>

    </footer>

  

  </div>

  
  

  <!-- ===== MODALS ===== -->

  

  <!-- ONBOARDING -->

  <div class="modal-overlay" id="onboarding-overlay" style="display:none">

    <div class="modal modal-onboarding">

      <div class="onboarding-steps">

        <div class="onboarding-step active" data-step="1">

          <div class="onboarding-icon">🎯</div>

          <h2 class="onboarding-title">Willkommen zur<br/>30-Tage-Challenge</h2>

          <p class="onboarding-text">Wähle eine Gewohnheit. Halte sie 30 Tage durch. Kein Konto, kein Abo — nur du und dein Commitment.</p>

        </div>

        <div class="onboarding-step" data-step="2">

          <div class="onboarding-icon">✓</div>

          <h2 class="onboarding-title">Jeden Tag<br/>einen Button</h2>

          <p class="onboarding-text">Drücke täglich „Heute geschafft" nachdem du deine Gewohnheit eingehalten hast. Einmal pro Tag.</p>

        </div>

        <div class="onboarding-step" data-step="3">

          <div class="onboarding-icon">🔥</div>

          <h2 class="onboarding-title">Teile deinen<br/>Fortschritt</h2>

          <p class="onboarding-text">Zeig anderen, dass du dabei bist. Teile dein Badge auf WhatsApp, Instagram oder TikTok.</p>

        </div>

      </div>

      <div class="onboarding-nav">

        <div class="onboarding-dots">

          <span class="ob-dot active" data-dot="1"></span>

          <span class="ob-dot" data-dot="2"></span>

          <span class="ob-dot" data-dot="3"></span>

        </div>

        <button class="btn-onboarding-next" id="btn-onboarding-next">Weiter →</button>

      </div>

    </div>

  </div>

  

  <!-- SHARE MODAL -->

  <div class="modal-overlay" id="modal-overlay" style="display:none">

    <div class="modal modal-share">

      <button class="modal-close" id="modal-close">✕</button>

      <p class="modal-eyebrow">Deinen Fortschritt teilen</p>

      <div class="share-card-wrap" id="share-card-wrap">

        <div class="share-card-inner">

          <p class="share-card-label">30-TAGE DISZIPLIN CHALLENGE</p>

          <div class="share-card-day" id="share-day-number">00</div>

          <p class="share-card-sub">von 30 Tagen geschafft</p>

          <div class="share-card-dots" id="share-dots"></div>

          <p class="share-card-url">flase-mbrn.github.io</p>

        </div>

      </div>

      <div class="social-share-grid">

        <button class="btn-social btn-whatsapp" id="btn-share-whatsapp">💬 WhatsApp</button>

        <button class="btn-social btn-twitter" id="btn-share-twitter">𝕏 Twitter</button>

        <button class="btn-social btn-copy" id="btn-share-copy">🔗 Link kopieren</button>

        <button class="btn-social btn-download" id="btn-share-download">⬇ Bild laden</button>

      </div>

      <p class="share-hashtags">#30TageDisziplin · #DisziplinChallenge</p>

    </div>

  </div>

  

  <!-- SNAPSHOT MODAL -->

  <div class="modal-overlay" id="snapshot-overlay" style="display:none">

    <div class="modal modal-snapshot">

      <button class="modal-close" id="snapshot-close">✕</button>

      <p class="modal-eyebrow">Geräteübergreifend</p>

      <h3 class="modal-title">Fortschritt synchronisieren</h3>

      <p class="modal-subtitle">Öffne diesen Link auf einem anderen Gerät um deinen Fortschritt zu sehen. Kein Account nötig.</p>

      <div class="snapshot-url-box">

        <input type="text" class="snapshot-url-input" id="snapshot-url-input" readonly />

        <button class="btn-copy-url" id="btn-copy-snapshot">Kopieren</button>

      </div>

      <p class="snapshot-note">⚠ Schreibgeschützte Ansicht — Fortschritt bleibt lokal gespeichert.</p>

      <div class="snapshot-divider"><span>oder importieren</span></div>

      <div class="snapshot-import-box">

        <input type="text" class="snapshot-import-input" id="snapshot-import-input" placeholder="Snapshot-URL einfügen…" />

        <button class="btn-import-snap" id="btn-import-snap">Import</button>

      </div>

    </div>

  </div>

  

  <!-- PREMIUM MODAL -->

  <div class="modal-overlay" id="premium-overlay" style="display:none">

    <div class="modal modal-premium">

      <button class="modal-close" id="premium-close">✕</button>

      <div class="premium-modal-top">

        <div class="premium-modal-badge">✦ PREMIUM</div>

        <h3 class="premium-modal-title">Einmaliger Kauf.<br/>Keine Abo-Falle.</h3>

        <p class="premium-modal-price">€2,99</p>

      </div>

      <ul class="premium-features-list">

        <li><span class="pf-check">✓</span> Bis zu 3 parallele Challenges</li>

        <li><span class="pf-check">✓</span> Vollständiger Export-Verlauf (CSV)</li>

        <li><span class="pf-check">✓</span> Gold Share-Card Design</li>

        <li><span class="pf-check">✓</span> Challenge-Themen (Fitness, Lernen, Mindfulness)</li>

        <li><span class="pf-check">✓</span> Alle zukünftigen Updates inklusive</li>

      </ul>

      <a class="btn-gumroad" id="btn-gumroad" href="https://flase.gumroad.com/l/mxjflg" target="_blank" rel="noopener">

        Jetzt kaufen auf Gumroad →

      </a>

      <div class="premium-code-section">

        <p class="premium-code-label">Bereits gekauft? Code eingeben:</p>

        <div class="premium-code-row">

          <input type="text" class="premium-code-input" id="premium-code-input" placeholder="z. B. DC2025PREMIUM" />

          <button class="btn-activate-code" id="btn-activate-code">Aktivieren</button>

        </div>

        <p class="premium-code-msg" id="premium-code-msg"></p>

      </div>

    </div>

  </div>

  

  <!-- STATS MODAL -->

  <div class="modal-overlay" id="stats-overlay" style="display:none">

    <div class="modal modal-stats">

      <button class="modal-close" id="stats-close">✕</button>

      <p class="modal-eyebrow">Deine Nutzung</p>

      <h3 class="modal-title">Statistiken</h3>

      <div class="stats-grid" id="stats-detail-grid"></div>

    </div>

  </div>

  

  <!-- DATENSCHUTZ MODAL -->

  <div class="modal-overlay" id="privacy-overlay" style="display:none">

    <div class="modal modal-privacy">

      <button class="modal-close" id="privacy-close">✕</button>

      <p class="modal-eyebrow">Rechtliches</p>

      <h3 class="modal-title">Datenschutz</h3>

      <div class="privacy-text">

        <p><strong>Datenverarbeitung</strong><br/>Diese App speichert alle Daten ausschließlich lokal in deinem Browser (localStorage). Es werden keine personenbezogenen Daten übermittelt, keine Cookies gesetzt, kein Tracking.</p>

        <p><strong>Externe Dienste</strong><br/>Beim Laden werden Google Fonts von fonts.googleapis.com geladen. Ko-fi und Gumroad haben eigene Datenschutzrichtlinien.</p>

        <p><strong>Analytics</strong><br/>Nutzungsstatistiken werden nur lokal im Browser gespeichert und nie übertragen.</p>

        <p><strong>Verantwortlicher</strong><br/>Dieses Projekt wird privat betrieben.<br/>Kontakt: flase-mbrn.github.io</p>

        <p class="privacy-small">Stand: März 2025 · v2.2</p>

      </div>

    </div>

  </div>

  

  <!-- WIN OVERLAY -->

  <div class="confetti-overlay" id="confetti-overlay" style="display:none">

    <div class="confetti-box">

      <div class="trophy">🏆</div>

      <h2 class="win-title">CHALLENGE<br/>ABGESCHLOSSEN!</h2>

      <p class="win-sub">30 von 30 Tagen. Du hast es bewiesen.</p>

      <button class="btn-share-win" id="btn-share-win">🔥 Erfolg teilen</button>

      <button class="btn-restart-win" id="btn-restart-win">↺ Neue Challenge</button>

    </div>

  </div>

  

  <!-- SCRIPTS -->

  <script src="analytics.js"></script>

  <script src="premium.js"></script>

  <script src="share.js"></script>

  <script src="app.js"></script>

  

</body>

</html>