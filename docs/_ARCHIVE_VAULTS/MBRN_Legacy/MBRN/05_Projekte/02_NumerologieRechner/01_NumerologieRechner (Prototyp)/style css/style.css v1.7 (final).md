/* ================================================================

   style.css — Numerologie-Rechner v1.7

   Theme  : Cosmic Dark × Gold

   Fonts  : Syne (Headlines/Zahlen) + Outfit (Body)

   Ansatz : Mobile-first — Basis = kleinstes Gerät, dann erweitern

   ================================================================

  

   INDEX

   ────────────────────────────────────────────────

   01  Design Tokens

   02  Base Reset

   03  Body & Hintergrund

   04  Hintergrund-Orbs

   05  Accessibility (.sr-only)

   06  Header

   07  Layout  (mobile → tablet → desktop)

   08  Cards

   09  Form — Inputs & Labels

   10  Buttons

   11  Results — Grid & Tiles

   12  Tile-Akzentfarben

   13  Masterzahl

   14  Tooltip

   15  Footer

   16  Keyframes

   17  Breakpoints  (≥ 480px  ≥ 640px  ≥ 900px)

   18  Accessibility (focus-visible, reduced-motion)

   ================================================================ */

  
  

/* ================================================================

   01  DESIGN TOKENS

   ================================================================ */

   :root {

    /* Hintergrund */

    --bg:          #04060e;

    --tile-bg:     rgba(10, 14, 26, 0.90);

    --surface:     rgba(255, 255, 255, 0.030);

    --border-dim:  rgba(255, 255, 255, 0.055);

    --border-mid:  rgba(255, 255, 255, 0.10);

    /* Gold */

    --gold:        #c8a84b;

    --gold-bright: #e8cc6e;

    --gold-dim:    rgba(200, 168, 75, 0.12);

    --gold-border: rgba(200, 168, 75, 0.28);

    /* Text */

    --text:        #edf2f8;

    --text-mid:    #a8b4c4;

    --text-dim:    rgba(168, 180, 196, 0.45);

    /* Zahlen-Akzente */

    --life:        #28c98a;

    --life-glow:   rgba(40, 201, 138, 0.22);

    --life-b:      rgba(40, 201, 138, 0.28);

    --soul:        #4ea8e8;

    --soul-glow:   rgba(78, 168, 232, 0.22);

    --soul-b:      rgba(78, 168, 232, 0.28);

    --expr:        #e8cc6e;

    --expr-glow:   rgba(232, 204, 110, 0.20);

    --expr-b:      rgba(232, 204, 110, 0.30);

    --pers:        #b07de8;

    --pers-glow:   rgba(176, 125, 232, 0.22);

    --pers-b:      rgba(176, 125, 232, 0.28);

    --danger:      #e07070;

    /* Schriften */

    --f-head: 'Syne',   'Segoe UI', sans-serif;

    --f-body: 'Outfit', 'Segoe UI', sans-serif;

    /* Geometrie */

    --r-lg:  16px;

    --r-md:  10px;

    --r-sm:  7px;

    --max-w: 900px;

    /* Schatten */

    --sh-card: 0 20px 60px rgba(2, 4, 12, 0.7),

               0 4px  16px rgba(2, 4, 12, 0.4);

    /* Übergänge */

    --ease: cubic-bezier(0.22, 0.61, 0.36, 1);

    --t-s:  0.14s;

    --t-m:  0.24s;

  }

  /* ================================================================

     02  BASE RESET

     ================================================================ */

  *, *::before, *::after {

    box-sizing: border-box;

    margin:     0;

    padding:    0;

  }

  html {

    -webkit-text-size-adjust: 100%;

    scroll-behavior:          smooth;

  }

  /* ================================================================

     03  BODY & HINTERGRUND

     ================================================================ */

  body {

    font-family:             var(--f-body);

    font-size:               1rem;

    line-height:             1.6;

    color:                   var(--text-mid);

    background-color:        var(--bg);

    -webkit-font-smoothing:  antialiased;

    -moz-osx-font-smoothing: grayscale;

    background-image:

      radial-gradient(ellipse 70% 40% at 10%  5%,  rgba(40, 201, 138, 0.06) 0%, transparent 55%),

      radial-gradient(ellipse 60% 40% at 90% 90%,  rgba(78, 168, 232, 0.06) 0%, transparent 55%),

      radial-gradient(ellipse 50% 50% at 50% 50%,  rgba(200, 168, 75,  0.03) 0%, transparent 60%),

      radial-gradient(ellipse 80% 50% at 50% 100%, rgba(176, 125, 232, 0.04) 0%, transparent 50%);

    /* Mobile-Basis: kompakt */

    min-height:     100dvh;

    padding:        28px 16px 56px;

    display:        flex;

    flex-direction: column;

    align-items:    center;

    gap:            24px;

    overflow-x:     hidden;

  }

  /* ================================================================

     04  HINTERGRUND-ORBS  (aria-hidden im HTML)

     ================================================================ */

  .bg-orb {

    position:       fixed;

    border-radius:  50%;

    pointer-events: none;

    z-index:        0;

    /* Mobile: kleiner + weniger blur für Performance */

    filter:         blur(50px);

  }

  .bg-orb--1 {

    width:      320px;

    height:     320px;

    background: radial-gradient(circle,

      rgba(40, 201, 138, 0.08),

      rgba(200, 168, 75, 0.04) 40%,

      transparent 70%);

    top:  -100px;

    left: -100px;

    animation: orbDrift1 24s ease-in-out infinite alternate;

  }

  .bg-orb--2 {

    width:      280px;

    height:     280px;

    background: radial-gradient(circle,

      rgba(78, 168, 232, 0.08),

      rgba(176, 125, 232, 0.04) 40%,

      transparent 70%);

    bottom: -80px;

    right:  -80px;

    animation: orbDrift2 30s ease-in-out infinite alternate;

  }

  /* ================================================================

     05  ACCESSIBILITY HELPER

     ================================================================ */

  .sr-only {

    position:    absolute !important;

    width:       1px;

    height:      1px;

    padding:     0;

    margin:      -1px;

    overflow:    hidden;

    clip:        rect(0, 0, 0, 0);

    white-space: nowrap;

    border:      0;

  }

  /* ================================================================

     06  HEADER  (mobile-first: zentriert, kompakt)

     ================================================================ */

  .site-header {

    text-align: center;

    position:   relative;

    z-index:    2;

    width:      100%;

    max-width:  var(--max-w);

  }

  .header-inner {

    display:         flex;

    align-items:     center;

    justify-content: center;

    gap:             10px;

    flex-wrap:       wrap;

    margin-bottom:   6px;

  }

  .header-icon {

    font-size:   1.2rem;

    color:       var(--gold);

    animation:   starSpin 12s linear infinite;

    display:     inline-block;

    flex-shrink: 0;

  }

  .site-title {

    font-family:    var(--f-head);

    font-size:      clamp(1.35rem, 5vw, 2rem);

    font-weight:    700;

    letter-spacing: 0.02em;

    background: linear-gradient(

      135deg,

      var(--text)        40%,

      var(--gold-bright) 60%,

      var(--text)        80%

    );

    background-size:         220% 100%;

    -webkit-background-clip: text;

    -webkit-text-fill-color: transparent;

    background-clip:         text;

    animation:               shimmer 8s ease-in-out infinite alternate;

  }

  .version-badge {

    font-family:    var(--f-body);

    font-size:      0.68rem;

    font-weight:    600;

    letter-spacing: 0.10em;

    text-transform: uppercase;

    color:          rgba(200, 168, 75, 0.7);

    background:     rgba(200, 168, 75, 0.08);

    border:         1px solid rgba(200, 168, 75, 0.20);

    padding:        2px 8px;

    border-radius:  20px;

    flex-shrink:    0;

  }

  .site-subtitle {

    font-size:      clamp(0.78rem, 2.5vw, 0.9rem);

    font-weight:    300;

    color:          var(--text-dim);

    letter-spacing: 0.02em;

  }

  /* ================================================================

     07  LAYOUT — mobile-first

     ================================================================

     Default   : 1 Spalte  (alle Geräte bis 899px)

     ≥ 900px   : 2 Spalten (Form links, Results rechts)

     ================================================================ */

  .content {

    width:           100%;

    display:         flex;

    justify-content: center;

    position:        relative;

    z-index:         2;

  }

  .container {

    width:                 100%;

    max-width:             var(--max-w);

    display:               grid;

    grid-template-columns: 1fr;     /* Mobile: eine Spalte */

    gap:                   16px;

    align-items:           start;

  }

  /* ================================================================

     08  CARDS

     ================================================================ */

  .card {

    border-radius:           var(--r-lg);

    border:                  1px solid var(--border-dim);

    box-shadow:              var(--sh-card);

    backdrop-filter:         blur(18px);

    -webkit-backdrop-filter: blur(18px);

    position:                relative;

    z-index:                 1;

    overflow:                hidden;

    transition:              border-color var(--t-m) var(--ease);

  }

  /* Goldlinie oben */

  .card::before {

    content:    '';

    position:   absolute;

    top:        0;

    left:       8%;

    right:      8%;

    height:     1px;

    background: linear-gradient(

      90deg,

      transparent,

      var(--gold)        25%,

      var(--gold-bright) 50%,

      var(--gold)        75%,

      transparent

    );

    opacity: 0.55;

  }

  .card:hover {

    border-color: rgba(255, 255, 255, 0.09);

  }

  .card-title {

    font-family:    var(--f-head);

    font-size:      0.68rem;

    font-weight:    700;

    letter-spacing: 0.18em;

    text-transform: uppercase;

    color:          rgba(200, 168, 75, 0.65);

    margin-bottom:  18px;

  }

  /* Mobile: kompaktes Padding */

  .form-card {

    padding:    22px 18px 20px;

    background: linear-gradient(160deg,

      rgba(13, 18, 32, 0.96),

      rgba(6, 9, 18, 0.98));

  }

  .results-card {

    padding:    20px 16px 20px;

    min-height: 160px;

    background: linear-gradient(150deg,

      rgba(10, 14, 26, 0.96),

      rgba(4, 6, 14, 0.98));

  }

  /* ================================================================

     09  FORM — INPUTS & LABELS

     ================================================================ */

  .form-fieldset {

    border:  0;

    padding: 0;

  }

  .input-group {

    margin-bottom: 18px;

  }

  .input-label {

    display:        block;

    font-size:      0.75rem;

    font-weight:    500;

    letter-spacing: 0.07em;

    text-transform: uppercase;

    color:          var(--text-dim);

    margin-bottom:  7px;

  }

  input[type="text"] {

    width:              100%;

    padding:            13px 14px;  /* Großzügige Touch-Target-Höhe */

    border-radius:      var(--r-md);

    border:             1px solid rgba(255, 255, 255, 0.06);

    background:         rgba(2, 4, 12, 0.55);

    color:              var(--text);

    font-family:        var(--f-body);

    font-size:          1rem;       /* ≥ 16px verhindert iOS-Auto-Zoom */

    font-weight:        400;

    outline:            none;

    -webkit-appearance: none;       /* iOS-Standardstil entfernen */

    transition:

      border-color var(--t-s) var(--ease),

      box-shadow   var(--t-m) var(--ease),

      transform    var(--t-s) var(--ease);

  }

  input::placeholder {

    color: rgba(168, 180, 196, 0.25);

  }

  input:focus {

    border-color: rgba(200, 168, 75, 0.45);

    box-shadow:   0 0 0 3px rgba(200, 168, 75, 0.07),

                  0 4px 20px rgba(200, 168, 75, 0.06);

    transform:    translateY(-1px);

  }

  input.input-valid {

    border-color: rgba(40, 201, 138, 0.38);

  }

  input.input-invalid {

    border-color: rgba(224, 112, 112, 0.5);

    box-shadow:   0 0 0 3px rgba(224, 112, 112, 0.07);

  }

  .input-hint {

    font-size:   0.76rem;

    color:       var(--text-dim);

    margin-top:  5px;

    line-height: 1.4;

  }

  .error-msg {

    min-height:  16px;

    font-size:   0.78rem;

    color:       var(--danger);

    margin-top:  5px;

    line-height: 1.3;

  }

  /* ================================================================

     10  BUTTONS

     ================================================================ */

  .button-row {

    display:   flex;

    gap:       10px;

    flex-wrap: wrap; /* Auf sehr schmalen Geräten untereinander */

  }

  .btn {

    display:         inline-flex;

    align-items:     center;

    justify-content: center;

    gap:             7px;

    flex:            1;

    min-height:      44px;          /* WCAG Touch-Target ≥ 44px */

    padding:         11px 14px;

    border-radius:   var(--r-md);

    border:          1px solid transparent;

    font-family:     var(--f-body);

    font-size:       0.88rem;

    font-weight:     600;

    letter-spacing:  0.03em;

    cursor:          pointer;

    position:        relative;

    overflow:        hidden;

    -webkit-tap-highlight-color: transparent;

    transition:

      transform  var(--t-s) var(--ease),

      box-shadow var(--t-m) var(--ease),

      opacity    var(--t-s);

  }

  .btn--primary {

    background: linear-gradient(135deg,

      rgba(200, 168, 75, 0.18),

      rgba(232, 204, 110, 0.10) 50%,

      rgba(200, 168, 75, 0.15));

    border-color: rgba(200, 168, 75, 0.38);

    color:        var(--gold-bright);

  }

  .btn--primary:hover:not(:disabled) {

    transform:    translateY(-2px);

    box-shadow:   0 6px 28px rgba(200, 168, 75, 0.22);

    border-color: rgba(200, 168, 75, 0.58);

  }

  .btn--primary:active:not(:disabled) {

    transform: translateY(0);

  }

  .btn--secondary {

    background:   rgba(255, 255, 255, 0.035);

    border-color: var(--border-dim);

    color:        var(--text-mid);

  }

  .btn--secondary:hover:not(:disabled) {

    transform:    translateY(-2px);

    background:   rgba(255, 255, 255, 0.06);

    border-color: var(--border-mid);

  }

  .btn:disabled {

    opacity: 0.35;

    cursor:  not-allowed;

  }

  .btn-icon {

    font-size: 0.82rem;

    opacity:   0.8;

  }

  /* ================================================================

     11  RESULTS — GRID & TILES

     ================================================================ */

  /* Mobile: 2 Spalten (funktioniert ab ~300px Breite) */

  .results-grid {

    display:               grid;

    grid-template-columns: repeat(2, 1fr);

    gap:                   10px;

    margin-top:            10px;

  }

  .results-grid--extra {

    margin-top:  12px;

    padding-top: 12px;

    border-top:  1px solid var(--border-dim);

  }

  .results-grid--extra:empty {

    display: none;

  }

  /* ── Tile ── */

  .result-tile {

    display:         flex;

    flex-direction:  column;

    align-items:     center;

    justify-content: flex-start;

    padding:         16px 12px 14px;

    border-radius:   var(--r-lg);

    border:          1px solid var(--border-dim);

    background:      var(--tile-bg);

    position:        relative;

    overflow:        hidden;

    min-height:      130px;

    cursor:          default;

    /* Einblend-Ausgangszustand — toggled via .is-visible */

    opacity:   0;

    transform: translateY(10px);

    transition:

      border-color var(--t-m) var(--ease),

      box-shadow   var(--t-m) var(--ease),

      transform    var(--t-m) var(--ease);

  }

  /* Innerer Glow (per Typ überschrieben) */

  .result-tile::before {

    content:        '';

    position:       absolute;

    inset:          0;

    opacity:        0;

    pointer-events: none;

    border-radius:  inherit;

    transition:     opacity var(--t-m) var(--ease);

  }

  .result-tile:hover::before { opacity: 1; }

  .result-tile.is-visible {

    animation: tileIn 0.42s var(--ease) forwards;

  }

  .results-grid--extra .result-tile {

    border-style: dashed;

    border-color: rgba(255, 255, 255, 0.06);

  }

  /* ── Tile-Inhalt ── */

  .result-title {

    display:         flex;

    align-items:     center;

    justify-content: center;

    gap:             6px;

    font-size:       0.72rem;

    font-weight:     500;

    letter-spacing:  0.05em;

    text-transform:  uppercase;

    color:           var(--text-dim);

    text-align:      center;

    margin-bottom:   10px;

    min-height:      18px;

    line-height:     1.3;

  }

  .result-value {

    font-family:    var(--f-head);

    font-size:      clamp(1.65rem, 4.5vw, 2.1rem);

    font-weight:    800;

    letter-spacing: 0.02em;

    line-height:    1;

    color:          var(--text);

    margin-bottom:  8px;

    min-height:     1.65rem;

  }

  .result-explanation {

    font-size:   clamp(0.71rem, 1.8vw, 0.79rem);

    font-weight: 300;

    color:       var(--text-dim);

    text-align:  center;

    line-height: 1.4;

    min-height:  16px;

  }

  /* ================================================================

     12  TILE-AKZENTFARBEN

     ================================================================ */

  .life-number {

    border-color: var(--life-b);

    background: linear-gradient(160deg,

      rgba(40, 201, 138, 0.06), var(--tile-bg) 55%);

  }

  .life-number::before {

    background: radial-gradient(ellipse 80% 60% at 20% 20%,

      var(--life-glow), transparent 65%);

  }

  .life-number:hover {

    box-shadow:   0 8px 32px var(--life-glow);

    border-color: rgba(40, 201, 138, 0.45);

    transform:    translateY(-3px);

  }

  .life-number .result-value {

    color:     var(--life);

    font-size: clamp(1.85rem, 5vw, 2.45rem);

  }

  .soul-number {

    border-color: var(--soul-b);

    background: linear-gradient(160deg,

      rgba(78, 168, 232, 0.06), var(--tile-bg) 55%);

  }

  .soul-number::before {

    background: radial-gradient(ellipse 80% 60% at 20% 20%,

      var(--soul-glow), transparent 65%);

  }

  .soul-number:hover {

    box-shadow:   0 8px 32px var(--soul-glow);

    border-color: rgba(78, 168, 232, 0.45);

    transform:    translateY(-3px);

  }

  .soul-number .result-value { color: var(--soul); }

  .expression-number {

    border-color: var(--expr-b);

    background: linear-gradient(160deg,

      rgba(232, 204, 110, 0.05), var(--tile-bg) 55%);

  }

  .expression-number::before {

    background: radial-gradient(ellipse 80% 60% at 20% 20%,

      var(--expr-glow), transparent 65%);

  }

  .expression-number:hover {

    box-shadow:   0 8px 32px var(--expr-glow);

    border-color: rgba(232, 204, 110, 0.45);

    transform:    translateY(-3px);

  }

  .expression-number .result-value { color: var(--expr); }

  .personality-number {

    border-color: var(--pers-b);

    background: linear-gradient(160deg,

      rgba(176, 125, 232, 0.06), var(--tile-bg) 55%);

  }

  .personality-number::before {

    background: radial-gradient(ellipse 80% 60% at 20% 20%,

      var(--pers-glow), transparent 65%);

  }

  .personality-number:hover {

    box-shadow:   0 8px 32px var(--pers-glow);

    border-color: rgba(176, 125, 232, 0.45);

    transform:    translateY(-3px);

  }

  .personality-number .result-value { color: var(--pers); }

  /* ================================================================

     13  MASTERZAHL

     ================================================================ */

  .result-value.master {

    color:       var(--gold-bright) !important;

    text-shadow: 0 0 10px rgba(232, 204, 110, 0.45),

                 0 0 28px rgba(232, 204, 110, 0.18);

    animation:   masterPulse 2.2s ease-in-out infinite alternate;

  }

  /* ================================================================

     14  TOOLTIP

     ================================================================ */

  .tooltip-btn {

    display:         inline-flex;

    align-items:     center;

    justify-content: center;

    flex-shrink:     0;

    width:           16px;

    height:          16px;

    padding:         0;

    border:          1px solid rgba(255, 255, 255, 0.09);

    border-radius:   50%;

    background:      rgba(255, 255, 255, 0.04);

    color:           var(--text-dim);

    font-family:     var(--f-body);

    font-size:       0.58rem;

    cursor:          help;

    position:        relative;

    -webkit-tap-highlight-color: transparent;

    transition:

      border-color var(--t-s),

      color        var(--t-s),

      background   var(--t-s);

  }

  .tooltip-btn:hover,

  .tooltip-btn:focus-visible {

    border-color: rgba(200, 168, 75, 0.45);

    color:        var(--gold);

    background:   rgba(200, 168, 75, 0.08);

  }

  .tooltip-btn::after {

    content:        attr(data-tooltip);

    position:       absolute;

    bottom:         calc(100% + 8px);

    left:           50%;

    transform:      translateX(-50%) translateY(5px);

    width:          max-content;

    max-width:      min(210px, 80vw);  /* Nie breiter als Viewport */

    white-space:    normal;

    text-align:     left;

    background:     rgba(4, 6, 16, 0.97);

    color:          var(--text-mid);

    font-family:    var(--f-body);

    font-size:      0.73rem;

    font-weight:    400;

    line-height:    1.45;

    padding:        7px 10px;

    border-radius:  var(--r-sm);

    border:         1px solid rgba(200, 168, 75, 0.15);

    box-shadow:     0 8px 30px rgba(2, 4, 12, 0.85);

    opacity:        0;

    pointer-events: none;

    z-index:        200;

    transition:

      opacity   var(--t-m) var(--ease),

      transform var(--t-m) var(--ease);

  }

  .tooltip-btn:hover::after,

  .tooltip-btn:focus-visible::after {

    opacity:   1;

    transform: translateX(-50%) translateY(0);

  }

  /* ================================================================

     15  FOOTER

     ================================================================ */

  .site-footer {

    font-size:      0.72rem;

    font-weight:    300;

    letter-spacing: 0.06em;

    color:          var(--text-dim);

    text-align:     center;

    position:       relative;

    z-index:        2;

    opacity:        0.65;

  }

  /* ================================================================

     16  KEYFRAMES

     ================================================================ */

  @keyframes tileIn {

    from { opacity: 0; transform: translateY(10px); }

    to   { opacity: 1; transform: translateY(0);    }

  }

  @keyframes masterPulse {

    from { filter: drop-shadow(0 0 4px  rgba(232, 204, 110, 0.4)); }

    to   { filter: drop-shadow(0 0 16px rgba(232, 204, 110, 0.7)); }

  }

  @keyframes orbDrift1 {

    from { transform: translate(0,    0)    scale(1);    }

    to   { transform: translate(24px, 16px) scale(1.06); }

  }

  @keyframes orbDrift2 {

    from { transform: translate(0,     0)     scale(1);    }

    to   { transform: translate(-20px, -12px) scale(1.05); }

  }

  @keyframes shimmer {

    from { background-position:   0% 50%; }

    to   { background-position: 100% 50%; }

  }

  @keyframes starSpin {

    from { transform: rotate(0deg);   }

    to   { transform: rotate(360deg); }

  }

  /* ================================================================

     17  BREAKPOINTS

     ================================================================

     Strategie (mobile-first, min-width):

     ─ Default   ≤ 479px   Smartphone       1-spaltig, kompakt

     ─ ≥ 480px             Großes Phone     mehr Luft, Orbs größer

     ─ ≥ 640px             Tablet           mehr Padding

     ─ ≥ 900px             Desktop          2-spaltig (Form + Results)

     ================================================================ */

  /* ── ≥ 480px : Großes Phone ── */

  @media (min-width: 480px) {

    body {

      padding: 36px 24px 64px;

      gap:     28px;

    }

    .form-card    { padding: 26px 24px 22px; }

    .results-card { padding: 22px 20px; }

    .results-grid {

      gap: 12px;

    }

    .result-tile {

      padding:    18px 14px 16px;

      min-height: 140px;

    }

    .bg-orb--1 { width: 420px; height: 420px; filter: blur(60px); }

    .bg-orb--2 { width: 360px; height: 360px; filter: blur(65px); }

  }

  /* ── ≥ 640px : Tablet ── */

  @media (min-width: 640px) {

    body {

      padding: 44px 28px 72px;

      gap:     32px;

    }

    .container    { gap: 18px; }

    .form-card    { padding: 28px 26px 24px; }

    .results-card { padding: 24px 22px; }

    .results-grid {

      gap:        13px;

      margin-top: 12px;

    }

    .result-tile {

      padding:    20px 16px 18px;

      min-height: 148px;

    }

  }

  /* ── ≥ 900px : Desktop — 2-spaltig ── */

  @media (min-width: 900px) {

    body {

      padding: 52px 32px 80px;

      gap:     36px;

    }

    .container {

      grid-template-columns: 296px 1fr;  /* Form fest, Results flexibel */

      gap:                   22px;

    }

    .form-card    { padding: 30px 26px 26px; }

    .results-card { padding: 26px 22px; }

    .results-grid {

      gap:        14px;

      margin-top: 12px;

    }

    .result-tile {

      padding:    22px 16px 18px;

      min-height: 155px;

    }

    .bg-orb--1 { width: 580px; height: 580px; filter: blur(70px); }

    .bg-orb--2 { width: 480px; height: 480px; filter: blur(75px); }

  }

  /* ================================================================

     18  ACCESSIBILITY

     ================================================================ */

  /* Goldener Fokusring für Tastaturnavigation */

  :focus-visible {

    outline:        2px solid rgba(200, 168, 75, 0.65);

    outline-offset: 3px;

    border-radius:  4px;

  }

  :focus:not(:focus-visible) {

    outline: none;

  }

  /* Alle Bewegungen deaktivieren wenn Nutzer das bevorzugt */

  @media (prefers-reduced-motion: reduce) {

    *, *::before, *::after {

      animation-duration:        0.01ms !important;

      animation-iteration-count: 1      !important;

      transition-duration:       0.01ms !important;

      transform:                 none   !important;

    }

  }