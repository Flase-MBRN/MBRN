/* ================================================================
   style.css — Numerologie v1.0
   Ästhetik: Kosmisch-dunkel × Elektrisch-violett × Gold
   Fonts:    Cinzel (mystisch) + Outfit (klar)
   ================================================================

   00  Design Tokens (Dark + Light)
   01  Reset
   02  Body & Hintergrund
   03  Hintergrund-Orbs + Grid
   04  Accessibility
   05  Hero-Sektion
   06  Topbar
   07  Layout
   08  Cards
   09  Form
   10  Buttons
   11  Results — Grid & Tiles
   12  Tile-Akzentfarben
   13  Life Hero Display
   14  Archetype Styles
   15  Masterzahl + Karmic Debt
   16  Grid-Labels
   17  Result-Aktionen
   18  Tooltip
   19  Modal
   20  Share Bar + CTA Bar
   21  Compare / Kompatibilität
   22  Lo-Shu Psychomatrix
   23  Quantum Score
   24  Planes Tile
   25  Toast
   26  Footer
   27  Keyframes
   28  Breakpoints
   29  Print
   30  Accessibility
   ================================================================ */


/* ================================================================
   00  DESIGN TOKENS
   ================================================================ */
:root {
  /* ── Hintergrund: kosmisches Schwarz ── */
  --bg:         #07070f;
  --bg-mid:     #0b0b18;
  --bg-surface: #0f0f1e;
  --tile-bg:    rgba(13, 13, 26, 0.96);
  --card-bg-1:  rgba(14, 14, 24, 0.98);
  --card-bg-2:  rgba(9, 9, 18, 0.99);

  /* ── Borders ── */
  --border-dim: rgba(255, 255, 255, 0.052);
  --border-mid: rgba(255, 255, 255, 0.095);
  --border-str: rgba(255, 255, 255, 0.14);

  /* ── Primär-Akzent: elektrisches Violett ── */
  --accent:        #7c3aed;
  --accent-bright: #a78bfa;
  --accent-dim:    rgba(124, 58, 237, 0.08);
  --accent-border: rgba(124, 58, 237, 0.24);
  --accent-glow:   rgba(124, 58, 237, 0.18);

  /* ── Gold: für Lebenszahl ── */
  --gold:         #f59e0b;
  --gold-bright:  #fbbf24;
  --gold-dim:     rgba(245, 158, 11, 0.08);
  --gold-border:  rgba(245, 158, 11, 0.26);
  --gold-glow:    rgba(245, 158, 11, 0.22);

  /* ── Text ── */
  --text:     #e8e8f4;
  --text-mid: #8888b0;
  --text-dim: rgba(140, 140, 180, 0.38);

  /* ── Zahlen-Farben ── */
  --life:      #f59e0b;   /* Gold — Lebenszahl ist die wichtigste */
  --life-b:    rgba(245, 158, 11, 0.20);
  --life-glow: rgba(245, 158, 11, 0.24);

  --soul:      #60a5fa;
  --soul-b:    rgba(96, 165, 250, 0.18);
  --soul-glow: rgba(96, 165, 250, 0.16);

  --expr:      #a78bfa;
  --expr-b:    rgba(167, 139, 250, 0.18);
  --expr-glow: rgba(167, 139, 250, 0.16);

  --pers:      #34d399;
  --pers-b:    rgba(52, 211, 153, 0.16);
  --pers-glow: rgba(52, 211, 153, 0.14);

  /* ── Danger ── */
  --danger:      #f87171;
  --debt-bg:     rgba(239, 68, 68, 0.05);
  --debt-border: rgba(239, 68, 68, 0.28);

  /* ── Modal ── */
  --modal-bg:     rgba(9, 9, 18, 0.99);
  --modal-border: rgba(124, 58, 237, 0.18);

  /* ── Typografie ── */
  --f-display: 'Cinzel',  Georgia, serif;        /* Hero-Headline */
  --f-head:    'Outfit',  'Segoe UI', sans-serif; /* Zahlen + Labels */
  --f-body:    'Outfit',  'Segoe UI', sans-serif;

  /* ── Layout ── */
  --r-xl:  20px;
  --r-lg:  14px;
  --r-md:  9px;
  --r-sm:  5px;
  --max-w: 960px;

  /* ── Schatten ── */
  --sh-card:  0 24px 64px rgba(0, 0, 0, 0.85), 0 4px 16px rgba(0, 0, 0, 0.55);
  --sh-modal: 0 32px 80px rgba(0, 0, 0, 0.95);
  --sh-life:  0 0 48px rgba(245, 158, 11, 0.28), 0 0 100px rgba(245, 158, 11, 0.10);

  /* ── Transitions ── */
  --ease: cubic-bezier(0.22, 0.61, 0.36, 1);
  --t-s:  0.14s;
  --t-m:  0.26s;
}

/* ── Light Mode ── */
[data-theme="light"] {
  --bg:         #f2f1f8;
  --bg-mid:     #ebebf4;
  --bg-surface: #e6e5f0;
  --tile-bg:    rgba(252, 252, 255, 0.96);
  --card-bg-1:  rgba(248, 248, 253, 0.98);
  --card-bg-2:  rgba(242, 241, 250, 0.99);

  --border-dim: rgba(0, 0, 0, 0.07);
  --border-mid: rgba(0, 0, 0, 0.12);
  --border-str: rgba(0, 0, 0, 0.18);

  --accent:        #6d28d9;
  --accent-bright: #7c3aed;
  --accent-dim:    rgba(109, 40, 217, 0.07);
  --accent-border: rgba(109, 40, 217, 0.20);
  --accent-glow:   rgba(109, 40, 217, 0.12);

  --gold:        #d97706;
  --gold-bright: #f59e0b;
  --gold-dim:    rgba(217, 119, 6, 0.07);
  --gold-border: rgba(217, 119, 6, 0.22);
  --gold-glow:   rgba(217, 119, 6, 0.16);

  --text:     #1a1830;
  --text-mid: #4a4870;
  --text-dim: rgba(60, 58, 100, 0.42);

  --life:      #d97706;
  --life-b:    rgba(217, 119, 6, 0.18);
  --life-glow: rgba(217, 119, 6, 0.18);

  --soul:      #2563eb;
  --soul-b:    rgba(37, 99, 235, 0.15);
  --soul-glow: rgba(37, 99, 235, 0.12);

  --expr:      #7c3aed;
  --expr-b:    rgba(124, 58, 237, 0.15);
  --expr-glow: rgba(124, 58, 237, 0.12);

  --pers:      #059669;
  --pers-b:    rgba(5, 150, 105, 0.15);
  --pers-glow: rgba(5, 150, 105, 0.12);

  --danger:      #dc2626;
  --debt-bg:     rgba(220, 38, 38, 0.04);
  --debt-border: rgba(220, 38, 38, 0.22);

  --modal-bg:     rgba(248, 247, 255, 0.99);
  --modal-border: rgba(109, 40, 217, 0.14);

  --sh-card:  0 10px 36px rgba(30, 24, 70, 0.10), 0 2px 8px rgba(30, 24, 70, 0.06);
  --sh-modal: 0 20px 60px rgba(30, 24, 70, 0.20);
  --sh-life:  0 0 28px rgba(217, 119, 6, 0.18);
}


/* ================================================================
   01  RESET
   ================================================================ */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-text-size-adjust: 100%; scroll-behavior: smooth; }


/* ================================================================
   02  BODY
   ================================================================ */
body {
  font-family:            var(--f-body);
  font-size:              1rem;
  line-height:            1.6;
  color:                  var(--text-mid);
  background-color:       var(--bg);
  -webkit-font-smoothing: antialiased;
  background-image:
    radial-gradient(ellipse 80% 50% at 50% -10%,
      rgba(124, 58, 237, 0.06) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 100% 100%,
      rgba(96, 165, 250, 0.04) 0%, transparent 55%),
    linear-gradient(180deg, var(--bg-mid) 0%, var(--bg) 50%);
  min-height: 100vh;
  padding: max(0px, env(safe-area-inset-top, 0px)) 0
           max(48px, env(safe-area-inset-bottom, 48px));
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  overflow-x: hidden;
  transition: background-color var(--t-m) var(--ease);
}
[data-theme="light"] body {
  background-image:
    radial-gradient(ellipse 80% 50% at 50% -10%,
      rgba(109, 40, 217, 0.05) 0%, transparent 60%),
    linear-gradient(180deg, var(--bg-mid) 0%, var(--bg) 50%);
}


/* ================================================================
   03  HINTERGRUND-ORBS + GRID
   ================================================================ */
.bg-orb {
  position: fixed; border-radius: 50%;
  pointer-events: none; z-index: 0; filter: blur(90px);
}
.bg-orb--1 {
  width: 600px; height: 480px;
  background: radial-gradient(ellipse,
    rgba(124, 58, 237, 0.06) 0%, transparent 65%);
  top: -200px; left: -200px;
  animation: orbDrift1 36s ease-in-out infinite alternate;
}
.bg-orb--2 {
  width: 500px; height: 400px;
  background: radial-gradient(ellipse,
    rgba(96, 165, 250, 0.05) 0%, transparent 65%);
  bottom: -160px; right: -160px;
  animation: orbDrift2 44s ease-in-out infinite alternate;
}
[data-theme="light"] .bg-orb { opacity: 0.35; }

/* Subtiles Raster — kosmisch */
.bg-grid {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(124,58,237,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(124,58,237,0.025) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 40%, rgba(0,0,0,0.4) 0%, transparent 70%);
}
[data-theme="light"] .bg-grid { opacity: 0.5; }


/* ================================================================
   04  ACCESSIBILITY
   ================================================================ */
.sr-only {
  position: absolute !important; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}


/* ================================================================
   05  HERO SECTION
   ================================================================ */
.site-header {
  width: 100%; position: relative; z-index: 2;
  display: flex; flex-direction: column; align-items: center;
}

/* Top-Bar */
.topbar {
  width: 100%;
  border-bottom: 1px solid var(--border-dim);
  background: rgba(7, 7, 15, 0.85);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  position: sticky; top: 0; z-index: 100;
}
[data-theme="light"] .topbar {
  background: rgba(242, 241, 248, 0.92);
  border-bottom-color: var(--border-dim);
}
.topbar-inner {
  max-width: var(--max-w);
  margin: 0 auto; padding: 12px 16px;
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px;
}
.brand-mark {
  display: flex; align-items: center; gap: 8px;
}
.brand-star {
  color: var(--gold); font-size: 0.85rem; opacity: 0.85;
  animation: starSpin 20s linear infinite;
  display: inline-block; flex-shrink: 0;
}
.brand-name {
  font-family: var(--f-head); font-size: 0.88rem; font-weight: 600;
  color: var(--text); letter-spacing: 0.04em;
}
.brand-version {
  font-size: 0.60rem; font-weight: 600; letter-spacing: 0.10em;
  text-transform: uppercase; color: var(--accent-bright);
  background: var(--accent-dim); border: 1px solid var(--accent-border);
  padding: 2px 7px; border-radius: 20px; flex-shrink: 0;
}
.theme-toggle {
  width: 32px; height: 32px; border-radius: 50%;
  border: 1px solid var(--border-dim); background: transparent;
  color: var(--text-dim); font-size: 0.9rem; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0; -webkit-tap-highlight-color: transparent;
  transition: border-color var(--t-s), color var(--t-s), transform var(--t-s);
}
.theme-toggle:hover { border-color: var(--gold-border); color: var(--gold); transform: scale(1.1); }

/* Hero-Headline Area */
.hero {
  width: 100%; max-width: var(--max-w);
  padding: 40px 20px 36px;
  display: flex; justify-content: center;
}
.hero-inner {
  display: flex; flex-direction: column; align-items: center;
  text-align: center; max-width: 640px; gap: 0;
}
.hero-eyebrow {
  font-size: 0.72rem; font-weight: 600; letter-spacing: 0.18em;
  text-transform: uppercase; color: var(--accent-bright); opacity: 0.80;
  margin-bottom: 18px;
}
.hero-headline {
  font-family: var(--f-display);
  font-size: clamp(1.85rem, 6vw, 3.2rem);
  font-weight: 700;
  color: var(--text);
  letter-spacing: 0em;
  line-height: 1.18;
  margin-bottom: 20px;
}
.hero-hl {
  /* "wirklich" — in Gold hervorgehoben */
  font-style: italic;
  background: linear-gradient(135deg, var(--gold), var(--gold-bright));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
[data-theme="light"] .hero-hl {
  background: linear-gradient(135deg, var(--gold), #e68a00);
  -webkit-background-clip: text; background-clip: text;
}
.hero-subline {
  font-size: clamp(0.9rem, 2.5vw, 1.05rem); font-weight: 300;
  color: var(--text-mid); line-height: 1.6; margin-bottom: 22px;
}
.hero-subline strong { color: var(--text); font-weight: 600; }

.hero-trust {
  display: flex; gap: 14px; flex-wrap: wrap; justify-content: center;
  margin-bottom: 24px;
}
.hero-trust span {
  font-size: 0.73rem; font-weight: 500; color: var(--accent-bright);
  opacity: 0.70; display: flex; align-items: center; gap: 5px;
}
.hero-trust span span { opacity: 1; color: var(--pers); }

/* "Was ist Numerologie?" Toggle */
.hero-info-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 16px;
  background: rgba(124,58,237,0.05);
  border: 1px solid var(--accent-border);
  border-radius: 20px;
  font-family: var(--f-body); font-size: 0.76rem; font-weight: 500;
  color: var(--accent-bright); cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background var(--t-s), border-color var(--t-s), transform var(--t-s);
  margin-bottom: 0;
}
.hero-info-btn:hover { background: rgba(124,58,237,0.09); transform: translateY(-1px); }
[data-theme="light"] .hero-info-btn {
  background: rgba(109,40,217,0.05); border-color: var(--accent-border);
}
.hero-info-caret {
  font-size: 0.7rem; transition: transform var(--t-s);
}
.hero-info-btn[aria-expanded="true"] .hero-info-caret { transform: rotate(180deg); }

.hero-info-body {
  margin-top: 10px; padding: 16px 18px;
  background: rgba(124,58,237,0.04);
  border: 1px solid var(--accent-border);
  border-radius: var(--r-lg);
  display: flex; flex-direction: column; gap: 10px;
  text-align: left;
  animation: tileIn 0.28s var(--ease) forwards;
}
[data-theme="light"] .hero-info-body { background: rgba(109,40,217,0.03); }
.hero-info-body p {
  font-size: 0.82rem; color: var(--text-mid); line-height: 1.65; margin: 0;
}
.hero-info-body p strong { color: var(--text); font-weight: 600; }


/* ================================================================
   06  (Topbar already covered above in 05)
   ================================================================ */


/* ================================================================
   07  LAYOUT
   ================================================================ */
.content {
  width: 100%; display: flex; flex-direction: column;
  align-items: center; position: relative; z-index: 2;
  gap: 20px; padding: 0 14px 48px;
}
.container {
  width: 100%; max-width: var(--max-w);
  display: grid; grid-template-columns: 1fr;
  gap: 16px; align-items: start;
}
.container--full { grid-template-columns: 1fr; }

@media (min-width: 540px) and (max-width: 899px) {
  .container, .container--full { max-width: 640px; }
  .compare-inputs { grid-template-columns: 1fr; }
  .compare-divider { display: none; }
}


/* ================================================================
   08  CARDS
   ================================================================ */
.card {
  border-radius: var(--r-xl);
  border: 1px solid var(--border-dim);
  box-shadow: var(--sh-card);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  position: relative; z-index: 1; overflow: visible;
  transition: border-color var(--t-m) var(--ease), background var(--t-m) var(--ease);
}
.card::before {
  content: ''; position: absolute; top: 0; left: 12%; right: 12%; height: 1px;
  background: linear-gradient(
    90deg, transparent,
    rgba(124,58,237,0.16) 20%,
    rgba(167,139,250,0.28) 50%,
    rgba(124,58,237,0.16) 80%,
    transparent
  );
}
.card:hover { border-color: rgba(124,58,237,0.12); }

.card-title {
  font-family: var(--f-head); font-size: 0.63rem; font-weight: 700;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: rgba(124,58,237,0.55); margin-bottom: 18px;
}
[data-theme="light"] .card-title { color: rgba(109,40,217,0.60); }

.form-card {
  padding: 24px 18px 22px;
  background: linear-gradient(160deg, var(--card-bg-1), var(--card-bg-2));
}
.results-card {
  padding: 24px 18px 22px;
  background: linear-gradient(152deg, var(--card-bg-1), var(--card-bg-2));
  min-height: 160px;
}
.results-card-header {
  display: flex; align-items: center; justify-content: space-between;
  gap: 10px; flex-wrap: wrap; margin-bottom: 12px;
}
.results-card-header .card-title { margin-bottom: 0; }

/* Leerer Zustand */
.results-empty {
  display: flex; flex-direction: column; align-items: center;
  gap: 14px; padding: 36px 20px; text-align: center;
}
.results-empty-icon {
  font-size: 2rem; color: var(--accent-bright); opacity: 0.20;
  animation: starSpin 20s linear infinite;
}
.results-empty-text {
  font-size: 0.84rem; color: var(--text-dim); line-height: 1.6;
}

.compare-card {
  padding: 22px 18px 24px;
  background: linear-gradient(155deg, var(--card-bg-1), var(--card-bg-2));
}
.compare-intro {
  font-size: 0.80rem; color: var(--text-dim);
  margin-bottom: 18px; margin-top: -8px;
}


/* ================================================================
   09  FORM
   ================================================================ */
.form-fieldset { border: 0; padding: 0; }
.input-group   { margin-bottom: 18px; }
.input-label {
  display: block; font-size: 0.70rem; font-weight: 600;
  letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--text-dim); margin-bottom: 7px;
}
input[type="text"] {
  width: 100%; padding: 14px 16px; border-radius: var(--r-md);
  border: 1px solid rgba(255,255,255,0.07);
  background: rgba(7, 7, 18, 0.70);
  color: var(--text); font-family: var(--f-body); font-size: 1rem;
  font-weight: 400; outline: none; -webkit-appearance: none;
  transition: border-color var(--t-s) var(--ease),
              box-shadow   var(--t-m) var(--ease),
              transform    var(--t-s) var(--ease);
}
[data-theme="light"] input[type="text"] {
  border-color: rgba(0,0,0,0.09);
  background: rgba(255,255,255,0.80);
}
input::placeholder { color: rgba(140,140,180,0.26); }
input:focus {
  border-color: rgba(124,58,237,0.40);
  box-shadow: 0 0 0 3px rgba(124,58,237,0.08);
  transform: translateY(-1px);
}
input.input-valid   { border-color: rgba(52,211,153,0.35); }
input.input-invalid { border-color: rgba(239,68,68,0.45); box-shadow: 0 0 0 3px rgba(239,68,68,0.07); }

.input-hint {
  font-size: 0.72rem; color: var(--text-dim);
  margin-top: 5px; line-height: 1.45;
}
.error-msg {
  min-height: 16px; font-size: 0.74rem;
  color: var(--danger); margin-top: 5px; line-height: 1.3;
}


/* ================================================================
   10  BUTTONS
   ================================================================ */
.button-row { display: flex; gap: 10px; flex-wrap: wrap; }

.btn {
  display: inline-flex; align-items: center; justify-content: center;
  gap: 8px; flex: 1; min-height: 48px; padding: 12px 16px;
  border-radius: var(--r-md); border: 1px solid transparent;
  font-family: var(--f-body); font-size: 0.88rem; font-weight: 600;
  letter-spacing: 0.02em; cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: transform var(--t-s) var(--ease),
              box-shadow var(--t-m) var(--ease),
              opacity var(--t-s);
}

/* Primary: violetter Glow */
.btn--primary {
  background: linear-gradient(135deg, rgba(124,58,237,0.20), rgba(167,139,250,0.10));
  border-color: rgba(124,58,237,0.32);
  color: var(--accent-bright);
}
.btn--primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(124,58,237,0.24);
  border-color: rgba(167,139,250,0.48);
}
.btn--primary:active:not(:disabled) { transform: translateY(0); }

/* Calc button: besonders prominent */
.btn--calc {
  font-size: 0.95rem; letter-spacing: 0.03em; min-height: 52px;
}

.btn--secondary {
  background: rgba(255,255,255,0.026);
  border-color: var(--border-dim); color: var(--text-mid);
}
.btn--secondary:hover:not(:disabled) {
  transform: translateY(-2px); background: rgba(255,255,255,0.048);
  border-color: var(--border-mid);
}
[data-theme="light"] .btn--secondary { background: rgba(0,0,0,0.030); }

.btn--ghost {
  background: transparent; border-color: var(--border-dim);
  color: var(--text-dim); font-size: 0.78rem;
  flex: 0; padding: 7px 13px; min-height: 34px;
}
.btn--ghost:hover:not(:disabled) {
  border-color: var(--accent-border); color: var(--accent-bright);
  transform: translateY(-1px);
}

.icon-btn { flex: 0; padding: 8px 12px; min-height: 36px; font-size: 0.85rem; }
.btn-icon { font-size: 0.80rem; opacity: 0.75; }
.btn:disabled { opacity: 0.30; cursor: not-allowed; }
[data-theme="light"] .btn--primary { color: var(--accent); }

/* Loading-State */
@keyframes btnSpin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
.btn--loading .btn-spinner-wrap,
.btn--calculating .btn-spinner-wrap { display: inline-block; animation: btnSpin 0.6s linear infinite; }
.btn--loading, .btn--calculating { pointer-events: none; opacity: 0.7; }


/* ================================================================
   11  RESULTS GRID & TILES
   ================================================================ */

/* Main Grid */
.results-grid {
  display: grid; grid-template-columns: repeat(2, 1fr);
  gap: 10px; align-items: start;
}
.results-grid--extra {
  margin-top: 14px; padding-top: 14px;
  border-top: 1px solid rgba(255,255,255,0.038);
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.results-grid--extra:empty { display: none; }

/* Tile-Grundstil */
.result-tile {
  display: flex; flex-direction: column; align-items: center;
  justify-content: flex-start;
  padding: 16px 12px 14px;
  border-radius: var(--r-lg);
  border: 1px solid rgba(255,255,255,0.052);
  background: var(--tile-bg);
  position: relative; overflow: visible;
  min-height: 130px; align-self: start;
  opacity: 0; transform: translateY(10px);
  transition: border-color var(--t-m) var(--ease),
              box-shadow   var(--t-m) var(--ease),
              transform    var(--t-m) var(--ease);
  cursor: default;
}
.result-tile::before {
  content: ''; position: absolute; inset: 0; opacity: 0;
  pointer-events: none; border-radius: inherit;
  transition: opacity var(--t-m) var(--ease);
}
.result-tile:hover::before { opacity: 1; }
.result-tile.is-visible { animation: tileIn 0.40s var(--ease) forwards; }
.result-tile[data-modal-type] { cursor: pointer; }
.result-tile[data-modal-type]:hover {
  outline: 1px solid rgba(124,58,237,0.22);
}
.result-tile[data-modal-type]:active {
  transform: scale(0.98);
  transition: transform 0.08s ease;
}
.results-grid--extra .result-tile {
  border-color: rgba(255,255,255,0.036);
}

/* Tap-Hint */
.tile-tap-hint {
  position: absolute; bottom: 8px; right: 10px;
  font-size: 0.58rem; color: var(--accent-bright); opacity: 0;
  transition: opacity var(--t-m); pointer-events: none;
  font-weight: 500; letter-spacing: 0.03em;
}
.result-tile[data-modal-type]:hover .tile-tap-hint { opacity: 0.55; }

/* Tile-Texte */
.result-title {
  display: flex; align-items: center; justify-content: center;
  gap: 6px; font-size: 0.68rem; font-weight: 600;
  letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--text-dim); text-align: center;
  margin-bottom: 10px; min-height: 18px; line-height: 1.3;
}
.result-value {
  font-family: var(--f-head); font-size: clamp(1.6rem, 4.5vw, 2.05rem);
  font-weight: 800; letter-spacing: 0.02em; line-height: 1;
  color: var(--text); margin: 0 auto 8px; width: fit-content; text-align: center;
}
.result-explanation {
  font-size: clamp(0.68rem, 1.7vw, 0.76rem); font-weight: 400;
  color: var(--text-mid); text-align: center;
  line-height: 1.4; min-height: 16px;
  opacity: 0.90;
}


/* ================================================================
   12  TILE-AKZENTFARBEN
   ================================================================ */

/* LEBENSZAHL — Gold (dominant) */
.life-number {
  border-color: var(--life-b);
  background: linear-gradient(160deg, rgba(245,158,11,0.06) 0%, var(--tile-bg) 55%);
}
.life-number::before {
  background: radial-gradient(ellipse 70% 55% at 22% 22%,
    var(--life-glow), transparent 68%);
}
.life-number:hover {
  box-shadow: 0 8px 36px var(--life-glow);
  border-color: rgba(245,158,11,0.38);
  transform: translateY(-3px);
}
.life-number .result-value {
  color: var(--life); font-size: clamp(1.8rem, 5vw, 2.3rem);
  width: fit-content; margin: 0 auto 8px;
}
.life-number .result-title span { color: rgba(245,158,11,0.65); }

/* AUSDRUCKSZAHL — Violett */
.expression-number {
  border-color: var(--expr-b);
  background: linear-gradient(160deg, rgba(167,139,250,0.05) 0%, var(--tile-bg) 55%);
}
.expression-number::before {
  background: radial-gradient(ellipse 70% 55% at 22% 22%,
    var(--expr-glow), transparent 68%);
}
.expression-number:hover {
  box-shadow: 0 8px 32px var(--expr-glow);
  border-color: rgba(167,139,250,0.34);
  transform: translateY(-3px);
}
.expression-number .result-value { color: var(--expr); }

/* SEELENZAHL — Blau */
.soul-number {
  border-color: var(--soul-b);
  background: linear-gradient(160deg, rgba(96,165,250,0.05) 0%, var(--tile-bg) 55%);
}
.soul-number::before {
  background: radial-gradient(ellipse 70% 55% at 22% 22%,
    var(--soul-glow), transparent 68%);
}
.soul-number:hover {
  box-shadow: 0 8px 32px var(--soul-glow);
  border-color: rgba(96,165,250,0.34);
  transform: translateY(-3px);
}
.soul-number .result-value { color: var(--soul); }

/* PERSÖNLICHKEITSZAHL — Grün */
.personality-number {
  border-color: var(--pers-b);
  background: linear-gradient(160deg, rgba(52,211,153,0.04) 0%, var(--tile-bg) 55%);
}
.personality-number::before {
  background: radial-gradient(ellipse 70% 55% at 22% 22%,
    var(--pers-glow), transparent 68%);
}
.personality-number:hover {
  box-shadow: 0 8px 32px var(--pers-glow);
  border-color: rgba(52,211,153,0.30);
  transform: translateY(-3px);
}
.personality-number .result-value { color: var(--pers); }


/* ================================================================
   13  LIFE HERO DISPLAY
   ================================================================ */
.life-hero-display {
  position: relative; margin-bottom: 20px;
  border-radius: var(--r-xl);
  border: 1px solid var(--gold-border);
  background: linear-gradient(145deg,
    rgba(245,158,11,0.07) 0%,
    rgba(245,158,11,0.03) 40%,
    var(--tile-bg) 70%
  );
  overflow: hidden;
  animation: tileIn 0.50s var(--ease) both;
}

/* Hintergrund-Glow hinter der Zahl */
.life-hero-bg {
  position: absolute; top: -40px; left: 50%; transform: translateX(-50%);
  width: 300px; height: 300px; border-radius: 50%;
  background: radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 65%);
  pointer-events: none; z-index: 0;
  filter: blur(30px);
}

.life-hero-content {
  position: relative; z-index: 1;
  display: flex; flex-direction: column; align-items: center;
  padding: 32px 24px 28px; text-align: center; gap: 0;
}
.life-hero-eyebrow {
  font-size: 0.62rem; font-weight: 700; letter-spacing: 0.24em;
  text-transform: uppercase; color: var(--gold); opacity: 0.60;
  margin-bottom: 16px;
}
.life-hero-num-wrap {
  position: relative; display: flex; align-items: center; justify-content: center;
  margin-bottom: 14px; isolation: isolate;
}
.life-hero-num {
  font-family: var(--f-head);
  font-size: clamp(4rem, 16vw, 7rem);
  font-weight: 800; line-height: 1; letter-spacing: -0.02em;
  color: var(--gold);
  filter: drop-shadow(0 0 20px rgba(245,158,11,0.45))
          drop-shadow(0 0 50px rgba(245,158,11,0.20));
  animation: lifeGlow 3s ease-in-out infinite alternate;
}
.life-hero-num.master {
  color: var(--accent-bright);
  filter: drop-shadow(0 0 20px rgba(167,139,250,0.50))
          drop-shadow(0 0 50px rgba(124,58,237,0.22));
}
.life-hero-glow {
  position: absolute; inset: -20px;
  background: radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 65%);
  pointer-events: none; border-radius: 50%;
  animation: lifeGlow 3s ease-in-out infinite alternate;
}

.life-hero-archetype-row {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  justify-content: center; margin-bottom: 12px;
}
.life-hero-archetype {
  font-family: var(--f-display);
  font-size: clamp(1.0rem, 2.8vw, 1.3rem);
  font-weight: 600; color: var(--text);
  letter-spacing: 0.02em;
}
.life-hero-badge {
  font-size: 0.65rem; font-weight: 700; letter-spacing: 0.10em;
  text-transform: uppercase; padding: 3px 9px;
  background: linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.08));
  border: 1px solid var(--gold-border); border-radius: 20px;
  color: var(--gold);
}
.life-hero-badge--master {
  background: linear-gradient(135deg, rgba(124,58,237,0.18), rgba(124,58,237,0.08));
  border-color: var(--accent-border); color: var(--accent-bright);
}

.life-hero-teaser {
  font-size: clamp(0.88rem, 2.4vw, 1rem); font-weight: 300;
  color: var(--text-mid); line-height: 1.70;
  max-width: 400px; margin-bottom: 22px;
}

.life-hero-detail-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 10px 22px; min-height: 42px;
  border-radius: var(--r-md);
  background: rgba(245,158,11,0.10);
  border: 1px solid var(--gold-border);
  color: var(--gold); font-family: var(--f-body);
  font-size: 0.82rem; font-weight: 600; cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background var(--t-s), transform var(--t-s), box-shadow var(--t-s);
}
.life-hero-detail-btn:hover {
  background: rgba(245,158,11,0.16); transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(245,158,11,0.18);
}


/* ================================================================
   14  ARCHETYPE LABELS (auf Sekundär-Tiles)
   ================================================================ */
.tile-archetype-label {
  font-size: 0.64rem; font-weight: 600; letter-spacing: 0.04em;
  color: var(--text-mid); text-align: center;
  margin-top: 4px; opacity: 0.72;
}


/* ================================================================
   15  MASTERZAHL + KARMISCHE SCHULD
   ================================================================ */
.result-value.master {
  color: var(--accent-bright) !important;
  text-shadow: 0 0 10px rgba(167,139,250,0.40), 0 0 30px rgba(124,58,237,0.16);
  animation: masterPulse 2.6s ease-in-out infinite alternate;
}
.karmic-debt-tile {
  border-color: var(--debt-border) !important; border-style: dashed !important;
  background: var(--debt-bg) !important;
}
.karmic-debt-tile .result-value { color: var(--danger); }


/* ================================================================
   16  GRID-SECTION-LABELS
   ================================================================ */
.grid-section-label {
  grid-column: 1 / -1; text-align: center;
  font-size: 0.60rem; font-weight: 700; letter-spacing: 0.18em;
  text-transform: uppercase; color: var(--accent-bright); opacity: 0.48;
  padding: 12px 0 6px;
  border-top: 1px solid rgba(255,255,255,0.048);
  margin-top: 8px;
}


/* ================================================================
   17  RESULT ACTIONS (Drucken etc.)
   ================================================================ */
.result-actions { display: flex; gap: 8px; align-items: center; }


/* ================================================================
   18  TOOLTIP
   ================================================================ */
.tooltip-btn {
  display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0; width: 15px; height: 15px; padding: 0;
  border: 1px solid rgba(255,255,255,0.07); border-radius: 50%;
  background: rgba(255,255,255,0.026); color: var(--text-dim);
  font-family: var(--f-body); font-size: 0.54rem; cursor: help;
  position: relative; -webkit-tap-highlight-color: transparent;
  transition: border-color var(--t-s), color var(--t-s), background var(--t-s);
}
.tooltip-btn:hover, .tooltip-btn:focus-visible {
  border-color: var(--accent-border); color: var(--accent-bright);
  background: rgba(124,58,237,0.07);
}
.tooltip-btn::after {
  content: attr(data-tooltip); position: absolute;
  bottom: calc(100% + 8px); left: 50%;
  transform: translateX(-50%) translateY(5px);
  width: max-content; max-width: min(200px, 80vw);
  white-space: normal; text-align: left;
  background: rgba(7,7,18,0.98); color: var(--text-mid);
  font-family: var(--f-body); font-size: 0.70rem; font-weight: 400;
  line-height: 1.45; padding: 7px 10px;
  border-radius: var(--r-sm); border: 1px solid rgba(124,58,237,0.16);
  box-shadow: 0 8px 28px rgba(0,0,0,0.85);
  opacity: 0; pointer-events: none; z-index: 200;
  transition: opacity var(--t-m) var(--ease), transform var(--t-m) var(--ease);
}
.tooltip-btn:hover::after, .tooltip-btn:focus-visible::after {
  opacity: 1; transform: translateX(-50%) translateY(0);
}
[data-theme="light"] .tooltip-btn::after {
  background: rgba(248,247,255,0.99); border-color: rgba(109,40,217,0.14);
  box-shadow: 0 8px 24px rgba(30,24,70,0.14);
}


/* ================================================================
   19  MODAL
   ================================================================ */
.detail-modal {
  position: fixed; inset: 0; margin: auto;
  width: min(520px, 92vw); max-height: 88vh;
  padding: 0; border: 1px solid var(--modal-border);
  border-radius: var(--r-xl); background: var(--modal-bg);
  box-shadow: var(--sh-modal); overflow-y: auto; z-index: 500;
  animation: modalIn 0.26s var(--ease) forwards;
}
.detail-modal::backdrop {
  background: rgba(0,0,0,0.84);
  -webkit-backdrop-filter: blur(5px); backdrop-filter: blur(5px);
}
[data-theme="light"] .detail-modal::backdrop { background: rgba(20,15,50,0.38); }

/* Firefox Fallback */
@-moz-document url-prefix() {
  .detail-modal { background: rgba(10,10,20,0.99) !important; }
}

.modal-inner { padding: 28px 24px 32px; position: relative; }
.modal-close {
  position: absolute; top: 16px; right: 16px;
  width: 30px; height: 30px; border-radius: 50%;
  border: 1px solid var(--border-mid); background: transparent;
  color: var(--text-mid); font-size: 0.76rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  -webkit-tap-highlight-color: transparent;
  transition: border-color var(--t-s), color var(--t-s);
}
.modal-close:hover { border-color: var(--accent-border); color: var(--accent-bright); }
.modal-top {
  display: flex; flex-direction: column; align-items: center;
  gap: 6px; margin-bottom: 22px; padding-bottom: 22px;
  border-bottom: 1px solid rgba(255,255,255,0.042);
}
.modal-icon {
  font-size: 1.8rem; color: var(--accent-bright); opacity: 0.72; line-height: 1;
  animation: starSpin 10s linear infinite;
}
.modal-type {
  font-family: var(--f-head); font-size: 0.64rem; font-weight: 700;
  letter-spacing: 0.20em; text-transform: uppercase; color: var(--text-dim);
}
.modal-value {
  font-family: var(--f-head); font-size: 3rem; font-weight: 800;
  color: var(--accent-bright); line-height: 1; text-align: center;
  width: fit-content; margin: 0 auto;
}
.modal-value.master {
  animation: masterPulse 2.2s ease-in-out infinite alternate;
  text-shadow: 0 0 16px rgba(167,139,250,0.44);
}
.modal-value--plane {
  font-family: var(--f-head); font-size: 1.5rem !important;
  font-weight: 800; color: var(--accent-bright); line-height: 1.2; text-align: center;
}
.modal-short {
  font-size: 0.90rem; font-weight: 500; color: var(--text);
  text-align: center; margin-bottom: 14px; line-height: 1.58;
}
.modal-extended {
  font-size: 0.85rem; font-weight: 300; color: var(--text-mid);
  line-height: 1.70; margin-bottom: 22px; text-align: center;
}
.modal-calc-box {
  display: flex; flex-direction: column; gap: 4px;
  background: rgba(255,255,255,0.016);
  border: 1px solid rgba(255,255,255,0.048);
  border-radius: var(--r-sm); padding: 10px 14px;
}
[data-theme="light"] .modal-calc-box { background: rgba(0,0,0,0.022); border-color: rgba(0,0,0,0.07); }
.modal-calc-label {
  font-size: 0.58rem; font-weight: 700; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--accent-bright); opacity: 0.65;
}
.modal-calc { font-size: 0.78rem; color: var(--text-mid); line-height: 1.55; }

/* Planes Modal */
.modal-planes { display: flex; flex-direction: column; gap: 14px; margin-bottom: 4px; }
.modal-plane-row {
  padding: 12px 14px; border-radius: var(--r-md);
  background: rgba(255,255,255,0.018); border: 1px solid var(--border-dim);
}
.modal-plane-row--dom { background: rgba(124,58,237,0.05); border-color: var(--accent-border); }
[data-theme="light"] .modal-plane-row { background: rgba(0,0,0,0.018); }
[data-theme="light"] .modal-plane-row--dom { background: rgba(109,40,217,0.05); }
.modal-plane-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.modal-plane-label { font-family: var(--f-head); font-size: 0.74rem; font-weight: 700; letter-spacing: 0.06em; color: var(--text); }
.modal-plane-num { font-family: var(--f-head); font-size: 0.84rem; font-weight: 700; color: var(--text-mid); }
.modal-plane-num small { font-family: var(--f-body); font-size: 0.64rem; opacity: 0.50; }
.modal-plane-track { height: 5px; border-radius: 3px; background: rgba(255,255,255,0.048); overflow: hidden; margin-bottom: 10px; }
[data-theme="light"] .modal-plane-track { background: rgba(0,0,0,0.07); }
.modal-plane-fill { height: 100%; border-radius: 3px; transition: width 0.65s cubic-bezier(0.22,0.61,0.36,1); }
.modal-plane-desc { font-size: 0.79rem; font-weight: 300; color: var(--text-mid); line-height: 1.55; margin: 0; }


/* ================================================================
   20  SHARE BAR + CTA BAR
   ================================================================ */
.bar-wrap { animation: tileIn 0.42s var(--ease) both; }

/* Share Bar */
.share-bar {
  padding: 22px 20px 20px;
  background: linear-gradient(135deg,
    rgba(124,58,237,0.08) 0%, rgba(245,158,11,0.04) 50%, rgba(7,7,18,0) 100%);
  border: 1px solid var(--accent-border);
  border-radius: var(--r-xl);
  display: flex; flex-direction: column; align-items: center;
  gap: 14px; text-align: center;
}
[data-theme="light"] .share-bar {
  background: linear-gradient(135deg, rgba(109,40,217,0.06) 0%, rgba(217,119,6,0.03) 100%);
}
.share-bar-headline {
  font-family: var(--f-head); font-size: 0.70rem; font-weight: 700;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--accent-bright); opacity: 0.70;
}
.share-bar-text {
  font-size: 0.88rem; color: var(--text); font-weight: 400;
  line-height: 1.60; max-width: 460px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255,255,255,0.048);
}
[data-theme="light"] .share-bar-text { border-color: rgba(0,0,0,0.06); }
.share-bar-text strong { color: var(--gold); }
.share-bar-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; width: 100%; }

/* WhatsApp */
.btn--wa {
  display: inline-flex; align-items: center; gap: 8px;
  flex: 1; min-width: 180px; max-width: 260px;
  min-height: 48px; padding: 12px 20px;
  border-radius: var(--r-md);
  background: #1a6334; border: 1px solid rgba(255,255,255,0.12);
  color: #fff; font-family: var(--f-body); font-size: 0.88rem; font-weight: 600;
  cursor: pointer; letter-spacing: 0.01em;
  -webkit-tap-highlight-color: transparent;
  transition: background var(--t-s), transform var(--t-s), box-shadow var(--t-s);
}
.btn--wa:hover { background: #1e7a3e; transform: translateY(-2px); box-shadow: 0 6px 24px rgba(26,99,52,0.38); }
.btn--wa:active { transform: translateY(0); }
.wa-icon { width: 18px; height: 18px; flex-shrink: 0; }

/* Copy */
.btn--copy {
  display: inline-flex; align-items: center; gap: 8px;
  flex: 1; min-width: 150px; max-width: 200px;
  min-height: 48px; padding: 12px 18px;
  border-radius: var(--r-md);
  background: rgba(255,255,255,0.036); border: 1px solid var(--border-mid);
  color: var(--text-mid); font-family: var(--f-body);
  font-size: 0.85rem; font-weight: 600; cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background var(--t-s), border-color var(--t-s), color var(--t-s), transform var(--t-s);
}
.btn--copy:hover { background: rgba(255,255,255,0.060); border-color: var(--border-str); transform: translateY(-1px); }
.btn--copy.copied { color: #34d399; border-color: rgba(52,211,153,0.40); }
[data-theme="light"] .btn--copy { background: rgba(0,0,0,0.028); }

/* CTA Bar */
.cta-bar {
  padding: 18px 20px;
  border: 1px solid rgba(255,255,255,0.040);
  border-radius: var(--r-xl);
  display: flex; flex-direction: column; align-items: center;
  gap: 14px; background: transparent;
}
[data-theme="light"] .cta-bar { border-color: rgba(0,0,0,0.07); }
.cta-bar-label {
  font-size: 0.60rem; font-weight: 700; letter-spacing: 0.20em;
  text-transform: uppercase; color: var(--accent-bright); opacity: 0.44;
}
.cta-bar-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
.btn--cta {
  display: inline-flex; align-items: center; justify-content: center;
  gap: 7px; padding: 11px 22px; min-height: 44px;
  border-radius: var(--r-md);
  background: rgba(255,255,255,0.024);
  border: 1px solid var(--border-dim);
  color: var(--text-mid); font-family: var(--f-body);
  font-size: 0.84rem; font-weight: 500; cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: transform var(--t-s), border-color var(--t-s), color var(--t-s), background var(--t-s);
}
.btn--cta:hover {
  border-color: var(--accent-border); color: var(--accent-bright);
  background: rgba(124,58,237,0.06); transform: translateY(-1px);
}
[data-theme="light"] .btn--cta { background: rgba(0,0,0,0.024); }


/* ================================================================
   21  COMPARE
   ================================================================ */
.compare-inputs {
  display: grid; grid-template-columns: 1fr auto 1fr;
  gap: 16px; align-items: start; margin-bottom: 18px;
}
.compare-person-label {
  font-family: var(--f-head); font-size: 0.62rem; font-weight: 700;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--accent-bright); opacity: 0.65; margin-bottom: 12px;
}
.compare-divider {
  font-size: 1rem; color: var(--accent-bright); opacity: 0.26;
  align-self: center; text-align: center; padding-top: 28px;
}
.compat-header {
  display: flex; flex-direction: column; align-items: center;
  gap: 6px; margin-bottom: 20px; padding-bottom: 16px;
  border-bottom: 1px solid rgba(255,255,255,0.038); text-align: center;
}
.compat-names { font-family: var(--f-head); font-size: 1rem; font-weight: 700; color: var(--text); }
.compat-names span { color: var(--gold); margin: 0 6px; }
.compat-overall { display: flex; align-items: center; gap: 10px; }
.compat-score { font-family: var(--f-head); font-size: 2rem; font-weight: 800; color: var(--accent-bright); }
.compat-label-big { font-size: 0.85rem; color: var(--text-mid); }
.compat-rows { display: flex; flex-direction: column; gap: 12px; }
.compat-row { display: grid; grid-template-columns: 100px 48px 1fr 42px; align-items: center; gap: 10px; }
.compat-label { font-size: 0.77rem; color: var(--text-mid); }
.compat-nums  { font-family: var(--f-head); font-size: 0.78rem; color: var(--text-dim); text-align: center; }
.compat-bar-wrap { height: 5px; background: rgba(255,255,255,0.048); border-radius: 3px; overflow: hidden; }
[data-theme="light"] .compat-bar-wrap { background: rgba(0,0,0,0.08); }
.compat-bar { height: 100%; border-radius: 3px; transition: width 0.85s var(--ease); }
.compat-pct { font-size: 0.77rem; font-weight: 600; color: var(--text-mid); text-align: right; }
.compare-error { color: var(--danger); font-size: 0.80rem; margin-top: 12px; text-align: center; }


/* ================================================================
   22  LO-SHU PSYCHOMATRIX
   ================================================================ */
.lo-shu-tile { grid-column: 1 / -1; padding: 18px 16px 16px; min-height: 0; cursor: pointer; }
.lo-shu-title { margin-bottom: 14px; justify-content: flex-start; gap: 8px; }
.lo-shu-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 8px; width: 100%; max-width: 260px; margin: 0 auto 12px;
}
.lo-shu-cell {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 4px; padding: 10px 6px;
  border-radius: var(--r-md);
  background: rgba(255,255,255,0.022);
  border: 1px solid rgba(255,255,255,0.048); min-height: 62px;
}
[data-theme="light"] .lo-shu-cell { background: rgba(0,0,0,0.022); border-color: rgba(0,0,0,0.07); }
.lo-shu-cell--missing { background: rgba(239,68,68,0.04); border-color: rgba(239,68,68,0.22); border-style: dashed; }
.lo-shu-cell--strong  { background: rgba(124,58,237,0.06); border-color: var(--accent-border); }
.lo-shu-num { font-family: var(--f-head); font-size: 1.15rem; font-weight: 800; color: var(--text); line-height: 1; }
.lo-shu-cell--missing .lo-shu-num { color: var(--danger); opacity: 0.55; }
.lo-shu-cell--strong  .lo-shu-num { color: var(--accent-bright); }
.lo-shu-dots { font-size: 0.54rem; color: var(--accent-bright); letter-spacing: 1px; min-height: 10px; line-height: 1; opacity: 0.70; }
.lo-shu-cell--missing .lo-shu-dots { color: var(--danger); }
.lo-shu-cell--strong  .lo-shu-dots { color: var(--accent-bright); opacity: 1; }
.lo-shu-lines { font-size: 0.66rem; color: var(--accent-bright); text-align: center; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.038); opacity: 0.65; }

.modal-lo-shu { display: flex; flex-direction: column; gap: 14px; }
.modal-lo-shu-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; max-width: 220px; margin: 0 auto; }
.modal-lo-shu-cell {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 4px; padding: 10px 4px; border-radius: var(--r-md);
  background: rgba(255,255,255,0.022); border: 1px solid rgba(255,255,255,0.048); min-height: 56px;
}
[data-theme="light"] .modal-lo-shu-cell { background: rgba(0,0,0,0.022); border-color: rgba(0,0,0,0.07); }
.modal-lo-shu-info {
  padding: 10px 14px; border-radius: var(--r-sm); font-size: 0.79rem;
  color: var(--text-mid); line-height: 1.55;
  background: rgba(255,255,255,0.016); border: 1px solid var(--border-dim);
}
[data-theme="light"] .modal-lo-shu-info { background: rgba(0,0,0,0.018); }
.modal-lo-shu-info--missing { border-color: rgba(239,68,68,0.24); }
.modal-lo-shu-info--strong  { border-color: var(--accent-border); }
.modal-lo-shu-info--lines   { border-color: rgba(96,165,250,0.24); }
.modal-lo-shu-info strong   { color: var(--text); }


/* ================================================================
   23  QUANTUM SCORE
   ================================================================ */
.quantum-tile { cursor: pointer; padding: 16px 14px 14px; grid-column: 1 / -1; }
.quantum-gauge { width: 100%; display: flex; flex-direction: column; gap: 8px; margin: 10px 0 6px; }
.quantum-bar-track { height: 5px; border-radius: 3px; background: rgba(255,255,255,0.048); overflow: hidden; }
[data-theme="light"] .quantum-bar-track { background: rgba(0,0,0,0.08); }
.quantum-bar-fill { height: 100%; border-radius: 3px; transition: width 1.1s cubic-bezier(0.22,0.61,0.36,1); }
.quantum-score-value {
  font-family: var(--f-head); font-size: 1.5rem; font-weight: 800;
  text-align: center; line-height: 1; letter-spacing: 0.02em;
}


/* ================================================================
   24  PLANES TILE
   ================================================================ */
.planes-tile { grid-column: 1 / -1; padding: 18px 16px 16px; min-height: 0; cursor: pointer; }
.planes-tile .result-title { margin-bottom: 14px; justify-content: flex-start; gap: 8px; }
.planes-tile .result-title span { font-size: 0.68rem; }
.planes-bars { display: flex; flex-direction: column; gap: 10px; width: 100%; }
.plane-row { display: grid; grid-template-columns: 140px 1fr 52px; align-items: center; gap: 10px; opacity: 0.58; transition: opacity var(--t-s); }
.plane-row--dominant { opacity: 1; }
.plane-row--dominant .plane-label { color: var(--text); font-weight: 600; }
.plane-meta { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.plane-label { font-family: var(--f-head); font-size: 0.70rem; font-weight: 600; letter-spacing: 0.04em; color: var(--text-mid); white-space: nowrap; }
.plane-short { font-size: 0.63rem; font-weight: 300; color: var(--text-dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.plane-track { height: 5px; border-radius: 3px; background: rgba(255,255,255,0.048); overflow: hidden; }
[data-theme="light"] .plane-track { background: rgba(0,0,0,0.07); }
.plane-fill { height: 100%; border-radius: 3px; transition: width 0.75s cubic-bezier(0.22,0.61,0.36,1); }
.plane-count { font-family: var(--f-head); font-size: 0.86rem; font-weight: 700; color: var(--text-mid); text-align: right; white-space: nowrap; }
.plane-count small { font-family: var(--f-body); font-size: 0.58rem; font-weight: 300; opacity: 0.50; }
.planes-dominant { margin-top: 14px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.038); font-size: 0.68rem; color: var(--accent-bright); opacity: 0.65; letter-spacing: 0.03em; text-align: center; }

@media (max-width: 479px) {
  .plane-row { grid-template-columns: 110px 1fr 44px; gap: 8px; }
  .plane-short { display: none; }
  .plane-meta { flex-direction: row; align-items: center; gap: 6px; }
}


/* ================================================================
   25  TOAST
   ================================================================ */
.toast {
  position: fixed; bottom: 28px; left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: rgba(9,9,18,0.98); color: var(--text);
  border: 1px solid var(--accent-border); border-radius: var(--r-md);
  padding: 10px 18px; font-size: 0.82rem; z-index: 600;
  opacity: 0; pointer-events: none;
  transition: opacity var(--t-m) var(--ease), transform var(--t-m) var(--ease);
  box-shadow: 0 8px 26px rgba(0,0,0,0.75);
}
[data-theme="light"] .toast { background: rgba(248,247,255,0.99); }
.toast--show { opacity: 1; transform: translateX(-50%) translateY(0); }


/* ================================================================
   26  FOOTER
   ================================================================ */
.site-footer {
  width: 100%; padding: 40px 20px 20px;
  position: relative; z-index: 2;
  border-top: 1px solid rgba(255,255,255,0.038);
  margin-top: 24px;
}
[data-theme="light"] .site-footer { border-color: rgba(0,0,0,0.06); }
.footer-inner {
  max-width: var(--max-w); margin: 0 auto;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  text-align: center;
}
.footer-brand {
  font-family: var(--f-head); font-size: 0.80rem; font-weight: 700;
  color: var(--accent-bright); opacity: 0.48; letter-spacing: 0.08em;
}
.footer-info {
  font-size: 0.64rem; font-weight: 300; letter-spacing: 0.04em;
  color: var(--text-dim); opacity: 0.50;
}


/* ================================================================
   27  KEYFRAMES
   ================================================================ */
@keyframes tileIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes masterPulse {
  from { filter: drop-shadow(0 0 5px  rgba(167,139,250,0.30)); }
  to   { filter: drop-shadow(0 0 16px rgba(124, 58,237,0.58)); }
}
@keyframes lifeGlow {
  from { filter: drop-shadow(0 0 16px rgba(245,158,11,0.38)) drop-shadow(0 0 50px rgba(245,158,11,0.14)); }
  to   { filter: drop-shadow(0 0 30px rgba(245,158,11,0.60)) drop-shadow(0 0 80px rgba(245,158,11,0.22)); }
}
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.96) translateY(12px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes orbDrift1 {
  from { transform: translate(0,0)       scale(1); }
  to   { transform: translate(24px,16px) scale(1.05); }
}
@keyframes orbDrift2 {
  from { transform: translate(0,0)         scale(1); }
  to   { transform: translate(-20px,-14px) scale(1.05); }
}
@keyframes shimmer {
  from { background-position:   0% 50%; }
  to   { background-position: 100% 50%; }
}
@keyframes starSpin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes numReveal {
  0%   { opacity: 0; transform: scale(0.6) translateY(6px); filter: blur(4px); }
  60%  { opacity: 1; transform: scale(1.06) translateY(-2px); filter: blur(0); }
  100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
}


/* ================================================================
   28  BREAKPOINTS
   ================================================================ */
@media (min-width: 480px) {
  .content { gap: 20px; padding: 0 16px 0; }
  .results-grid { gap: 12px; }
  .result-tile { padding: 18px 14px 16px; min-height: 140px; }
  /* results-hint display is JS-controlled — no override here */
}

@media (min-width: 640px) {
  .content { padding: 0 20px max(64px, env(safe-area-inset-bottom, 64px)); gap: 24px; }
  .container { gap: 18px; }
  .form-card { padding: 28px 26px 24px; }
  .results-card { padding: 26px 22px 22px; }
  .results-grid { gap: 14px; }
  .result-tile { padding: 20px 16px 18px; min-height: 148px; }
  .hero { padding: 64px 28px 52px; }
}

@media (min-width: 900px) {
  .content { padding: 0 28px max(72px, env(safe-area-inset-bottom, 72px)); gap: 28px; }
  .container { grid-template-columns: 310px 1fr; gap: 24px; }
  .form-card { padding: 30px 26px 26px; }
  .results-card { padding: 28px 24px; }
  .results-grid { gap: 14px; }
  .results-grid--extra { grid-template-columns: repeat(3, 1fr); }
  .result-tile { padding: 22px 16px 18px; min-height: 150px; }
  .compare-card { padding: 26px 28px 28px; }
  .hero { padding: 72px 32px 60px; }
}

/* Mobile-spezifisch */
@media (max-width: 479px) {
  .hero-headline { font-size: clamp(1.7rem, 8vw, 2.2rem); }
  .hero-trust { gap: 10px; }
  .share-bar-actions { flex-direction: column; align-items: stretch; }
  .btn--wa, .btn--copy { max-width: none; min-width: 0; }
  .cta-bar-actions { flex-direction: column; align-items: stretch; width: 100%; }
  .btn--cta { text-align: center; }
  .compare-inputs { grid-template-columns: 1fr; }
  .compare-divider { display: none; }
  .compat-row { grid-template-columns: 88px 38px 1fr 36px; gap: 6px; }
}


/* ================================================================
   29  PRINT
   ================================================================ */
@media print {
  body { background: #fff !important; color: #000 !important; padding: 0 !important; }
  .bg-orb, .bg-grid, .hero, .topbar, .form-card,
  .result-actions, .compare-card, .share-bar, .cta-bar,
  .bar-wrap, .site-footer, .tooltip-btn, .results-hint,
  .life-hero-detail-btn, .life-hero-teaser,
  .results-empty { display: none !important; }
  .site-header { margin-bottom: 12px; }
  .card { border: 1px solid #ddd !important; box-shadow: none !important; background: #fff !important; }
  .result-tile { border: 1px solid #ddd !important; background: #fff !important; opacity: 1 !important; transform: none !important; break-inside: avoid; }
  .result-value, .life-hero-num { color: #000 !important; text-shadow: none !important; animation: none !important; filter: none !important; }
  .result-value.master { color: #4c1d95 !important; }
  .life-hero-num { font-size: 3rem !important; }
  .results-grid { gap: 8px !important; }
  .grid-section-label { color: #000 !important; border-color: #ddd !important; }
  .container { grid-template-columns: 1fr !important; }
}


/* ================================================================
   30  ACCESSIBILITY
   ================================================================ */
:focus-visible {
  outline: 2px solid rgba(124,58,237,0.60);
  outline-offset: 3px; border-radius: 4px;
}
:focus:not(:focus-visible) { outline: none; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    transform: none !important;
  }
}


/* ================================================================
   31  BUG FIXES & CROSS-BROWSER (v1.0 final)
   ================================================================ */

/* ── Life Hero Number: Cross-Browser-Animations-Klasse ──
   Ersetzt die fehleranfälligen inline style.animationName-Hacks.
   Wird via JS-Klassenwechsel getriggert (void offsetWidth reflow).     */
.life-hero-num.num-animate {
  animation:
    numReveal 0.55s cubic-bezier(0.22, 0.61, 0.36, 1) both,
    lifeGlow  3.0s ease-in-out infinite alternate 0.55s;
}
.life-hero-num.master.num-animate {
  animation:
    numReveal  0.55s cubic-bezier(0.22, 0.61, 0.36, 1) both,
    masterPulse 2.6s ease-in-out infinite alternate 0.55s;
}

/* ── Firefox: <dialog> kein backdrop-filter — solider Fallback ── */
@supports not ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
  .card     { background: var(--card-bg-1) !important; }
  .detail-modal { background: var(--modal-bg) !important; }
}

/* ── Safari: -webkit-backdrop-filter explizit ──
   (bereits im base CSS, aber hier als Sicherheitsnetz)              */
.detail-modal {
  -webkit-backdrop-filter: none; /* Dialog hat eigenen Hintergrund */
  backdrop-filter:         none;
}

/* ── Teaser: etwas mehr Sichtbarkeit ── */
.result-teaser {
  font-size: 0.71rem;
  font-weight: 300;
  color: var(--text-mid);
  text-align: center;
  line-height: 1.5;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255,255,255,0.040);
  opacity: 0.80;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
[data-theme="light"] .result-teaser { border-color: rgba(0,0,0,0.06); }

/* ── Tile-Archetype-Label: zuverlässige Sichtbarkeit ── */
.tile-archetype-label {
  font-size: 0.64rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--text-mid);
  text-align: center;
  margin-top: 4px;
  opacity: 0.78;
  display: block;
}

/* ── Results-Hint: flexbox-Zentrierung ── */
.results-hint {
  display: none;             /* initial hidden */
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: -webkit-fit-content;
  width: fit-content;
  margin: 0 auto 14px;
  padding: 6px 14px;
  background: rgba(124,58,237,0.06);
  border: 1px solid rgba(124,58,237,0.16);
  border-radius: 20px;
  font-size: 0.74rem;
  font-weight: 500;
  color: var(--accent-bright);
  opacity: 0.84;
  letter-spacing: 0.02em;
  text-align: center;
  /* JS sets display:flex to show */
}
[data-theme="light"] .results-hint {
  background: rgba(109,40,217,0.06);
  border-color: rgba(109,40,217,0.16);
}

/* ── Tile pulse: subtle attention after results appear ──
   Einmalige Pulse-Animation auf klickbaren Tiles nach Berechnung    */
@keyframes tilePulseOnce {
  0%   { box-shadow: 0 0 0 0 rgba(124,58,237,0.0); }
  40%  { box-shadow: 0 0 0 6px rgba(124,58,237,0.12); }
  100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.0); }
}
.result-tile.pulse-hint {
  animation: tilePulseOnce 1.4s ease-out forwards;
}
.life-number.pulse-hint {
  animation: tilePulseOnce 1.4s ease-out forwards;
  --pulse-color: rgba(245,158,11,0.18);
}

/* ── CTA bar: 44px touch targets ── */
.btn--cta { min-height: 44px; }
.btn--wa  { min-height: 48px; }
.btn--copy{ min-height: 48px; }

/* ── Mobile: hero number slightly smaller to avoid overflow ── */
@media (max-width: 360px) {
  .life-hero-num { font-size: 4rem; }
  .hero-headline { font-size: 1.65rem; }
}

/* ── Date input: monospace for better alignment of TT.MM.JJJJ ── */
#birthdate, #compareDate1, #compareDate2 {
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.03em;
}

/* ── Results anchor: no visual impact, just scroll target ── */
#resultsAnchor {
  position: relative;
  top: -16px; /* slight offset so header stays visible */
  visibility: hidden;
  height: 0;
}

/* ── Tab highlight: -webkit cleanup ── */
button, input, a { -webkit-tap-highlight-color: transparent; }

/* ── Tooltip z-index: ensure above life hero ── */
.tooltip-btn::after { z-index: 300; }

/* ── Modal: ensure full-screen on tiny phones ── */
@media (max-width: 400px) {
  .detail-modal { width: 96vw; border-radius: var(--r-lg); }
  .modal-inner  { padding: 22px 16px 26px; }
}


/* ================================================================
   32  V4.0 ADDITIONS — Loading Overlay, Accordions, Share Card
   ================================================================ */

/* ── Loading Overlay ── */
.loading-overlay {
  position: fixed; inset: 0; z-index: 900;
  background: rgba(7, 7, 15, 0.94);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.26s ease;
  pointer-events: none;
}
.loading-overlay.is-active {
  opacity: 1; pointer-events: all;
}
[data-theme="light"] .loading-overlay {
  background: rgba(240, 239, 248, 0.94);
}
.loading-inner {
  display: flex; flex-direction: column; align-items: center;
  gap: 20px; text-align: center; padding: 40px 32px;
  max-width: 320px;
}
.loading-star {
  font-size: 2.4rem; color: var(--gold);
  animation: starSpin 2s linear infinite;
  display: inline-block;
  filter: drop-shadow(0 0 14px rgba(245,158,11,0.5));
}
.loading-msg {
  font-family: var(--f-head); font-size: 0.92rem; font-weight: 500;
  color: var(--text-mid); letter-spacing: 0.03em; line-height: 1.5;
  animation: loadingFade 0.4s ease both;
  min-height: 44px;
}
.loading-bar-track {
  width: 200px; height: 3px; border-radius: 2px;
  background: rgba(255,255,255,0.08); overflow: hidden;
}
[data-theme="light"] .loading-bar-track { background: rgba(0,0,0,0.08); }
.loading-bar {
  height: 100%; border-radius: 2px; width: 0%;
  background: linear-gradient(90deg, var(--accent), var(--gold));
  transition: width 0.22s ease;
}

@keyframes loadingFade {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Accordions ── */
.accordions {
  margin-top: 20px;
  display: flex; flex-direction: column; gap: 8px;
}
.acc-section {
  border-radius: var(--r-lg);
  border: 1px solid var(--border-dim);
  overflow: hidden;
  transition: border-color var(--t-m) var(--ease);
}
.acc-section:has(.acc-header[aria-expanded="true"]) {
  border-color: rgba(124,58,237,0.22);
}
[data-theme="light"] .acc-section:has(.acc-header[aria-expanded="true"]) {
  border-color: rgba(109,40,217,0.20);
}

.acc-header {
  width: 100%; display: flex; align-items: center; gap: 12px;
  padding: 14px 16px; cursor: pointer;
  background: rgba(255,255,255,0.022);
  border: none; text-align: left;
  font-family: var(--f-body); font-size: 0.86rem; font-weight: 600;
  color: var(--text); letter-spacing: 0.02em;
  -webkit-tap-highlight-color: transparent;
  transition: background var(--t-s), color var(--t-s);
  user-select: none; -webkit-user-select: none;
}
[data-theme="light"] .acc-header { background: rgba(0,0,0,0.022); }
.acc-header:hover { background: rgba(124,58,237,0.06); }
.acc-header[aria-expanded="true"] {
  background: rgba(124,58,237,0.07);
  color: var(--accent-bright);
  border-bottom: 1px solid rgba(124,58,237,0.14);
}
[data-theme="light"] .acc-header:hover { background: rgba(109,40,217,0.05); }
[data-theme="light"] .acc-header[aria-expanded="true"] {
  background: rgba(109,40,217,0.06); color: var(--accent);
}

.acc-icon {
  font-size: 0.85rem; color: var(--accent-bright); opacity: 0.6;
  flex-shrink: 0; width: 20px; text-align: center;
}
.acc-header[aria-expanded="true"] .acc-icon { opacity: 1; }

.acc-title { flex: 1; }

.acc-count {
  font-size: 0.62rem; font-weight: 700; letter-spacing: 0.08em;
  color: var(--accent-bright); opacity: 0.55;
  background: rgba(124,58,237,0.10);
  border: 1px solid rgba(124,58,237,0.18);
  border-radius: 20px; padding: 2px 8px; flex-shrink: 0;
  transition: opacity var(--t-s);
}
.acc-header[aria-expanded="true"] .acc-count { opacity: 0.85; }
[data-theme="light"] .acc-count {
  background: rgba(109,40,217,0.07); border-color: rgba(109,40,217,0.16);
}

.acc-chevron {
  font-size: 1.1rem; color: var(--text-dim); font-weight: 300;
  transition: transform var(--t-m) var(--ease), color var(--t-s);
  flex-shrink: 0; line-height: 1;
}
.acc-header[aria-expanded="true"] .acc-chevron {
  transform: rotate(90deg); color: var(--accent-bright);
}

.acc-body {
  padding: 14px 14px 16px;
  background: rgba(255,255,255,0.010);
  animation: accOpen 0.28s var(--ease) both;
}
[data-theme="light"] .acc-body { background: rgba(0,0,0,0.010); }

.acc-grid {
  margin-top: 0;
}
.acc-grid:empty { display: none; }

@keyframes accOpen {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Share Card Button ── */
.btn--share-card {
  display: inline-flex; align-items: center; gap: 8px;
  flex: 1; min-width: 150px; max-width: 220px;
  min-height: 48px; padding: 12px 18px;
  border-radius: var(--r-md);
  background: linear-gradient(135deg, rgba(245,158,11,0.18), rgba(245,158,11,0.08));
  border: 1px solid var(--gold-border);
  color: var(--gold); font-family: var(--f-body);
  font-size: 0.88rem; font-weight: 600; cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background var(--t-s), transform var(--t-s), box-shadow var(--t-s);
}
.btn--share-card:hover {
  background: linear-gradient(135deg, rgba(245,158,11,0.26), rgba(245,158,11,0.12));
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(245,158,11,0.22);
}
[data-theme="light"] .btn--share-card { color: var(--gold); }

/* ── Share Card Modal ── */
.share-card-modal {
  position: fixed; inset: 0; margin: auto;
  width: min(540px, 96vw); max-height: 92vh;
  padding: 0; border: 1px solid var(--gold-border);
  border-radius: var(--r-xl); background: var(--modal-bg);
  box-shadow: 0 32px 80px rgba(0,0,0,0.92);
  overflow-y: auto; z-index: 500;
  animation: modalIn 0.28s var(--ease) forwards;
}
.share-card-modal::backdrop {
  background: rgba(2, 4, 12, 0.80);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
}
[data-theme="light"] .share-card-modal::backdrop {
  background: rgba(80, 60, 20, 0.55);
}
.share-card-modal-inner {
  padding: 28px 24px 32px;
  display: flex; flex-direction: column; gap: 16px; position: relative;
}
.share-card-title {
  font-family: var(--f-head); font-size: 1.0rem; font-weight: 700;
  color: var(--text); text-align: center; margin-top: 8px;
}
.share-card-hint {
  font-size: 0.80rem; color: var(--text-mid); text-align: center;
  margin-top: -8px;
}
.share-card-canvas-wrap {
  border-radius: var(--r-md); overflow: hidden;
  border: 1px solid var(--gold-border);
  background: #06060f;
  aspect-ratio: 1/1; width: 100%;
}
.share-card-canvas-wrap canvas {
  width: 100%; height: 100%; display: block;
}
.share-card-actions {
  display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;
}
.share-card-actions .btn { flex: 1; min-width: 140px; }

/* ── Brand version badge update ── */
.brand-version {
  background: linear-gradient(135deg, rgba(124,58,237,0.15), rgba(245,158,11,0.08));
  border-color: rgba(124,58,237,0.30);
}

/* ── Mobile: share bar stacks ── */
@media (max-width: 500px) {
  .share-bar-actions { flex-direction: column; align-items: stretch; }
  .btn--share-card, .btn--wa, .btn--copy { max-width: none; }
  .acc-header { padding: 12px 14px; font-size: 0.82rem; }
}

/* ── Print: hide new elements ── */
@media print {
  .loading-overlay, .accordions, .share-bar, .cta-bar,
  .share-card-modal { display: none !important; }
}

/* ── Focus visible on acc headers ── */
.acc-header:focus-visible {
  outline: 2px solid rgba(124,58,237,0.60);
  outline-offset: -2px;
}

/* ================================================================
   33  QUANTUM SCORE v2 — Tile Meta Row & Interpretation
   ================================================================ */

/* Interpretation text — more room than standard explanation */
.quantum-interpretation {
  font-size: 0.78rem;
  font-weight: 400;
  color: var(--text-mid);
  line-height: 1.55;
  text-align: left;
  padding: 8px 0 4px;
  border-top: 1px solid var(--border-dim);
  margin-top: 4px;
}
[data-theme="light"] .quantum-interpretation { border-color: rgba(0,0,0,0.06); }

/* Three-number breakdown row */
.quantum-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 6px;
}
.quantum-meta-item {
  font-family: var(--f-head);
  font-size: 0.64rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--text-dim);
  background: rgba(255,255,255,0.034);
  border: 1px solid var(--border-dim);
  border-radius: 20px;
  padding: 2px 8px;
}
[data-theme="light"] .quantum-meta-item {
  background: rgba(0,0,0,0.028);
}
.quantum-meta-sep {
  font-size: 0.55rem;
  color: var(--text-dim);
  opacity: 0.45;
}

/* Tile spans full grid width (unchanged) */
.quantum-tile {
  grid-column: 1 / -1;
  padding: 16px 14px 14px;
  min-height: 0;
}


/* ================================================================
   34  V4.1 PERFORMANCE & FIXES
   ================================================================ */

/* ── Fix: remove duplicate .quantum-tile rule ──
   The authoritative rule is in section 23 (line 1247).
   This override block provides the missing min-height only.      */

/* ── Performance: promote animated orbs to own compositing layer ── */
.bg-orb {
  will-change: transform;
  contain: strict;
}

/* ── Performance: disable heavy bg effects on low-end / mobile ── */
@media (max-width: 600px) {
  .bg-orb { display: none; }
  .bg-grid { display: none; }
}

/* ── Performance: reduce backdrop-filter to 1 usage — topbar only ──
   Cards use solid semi-opaque bg instead of blur on mobile.       */
@media (max-width: 900px) {
  .card {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
  .detail-modal {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
  .share-card-modal {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}

/* ── Fix: Google Fonts display=swap (prevents FOIT) ──
   Already added via URL parameter in HTML. This rule catches
   any self-hosted fallback scenarios.                             */
@font-face {
  font-display: swap;
}

/* ── Fix: compareWrap appears after results — matches other bars ── */
#compareWrap { animation: tileIn 0.38s var(--ease) both; }

/* ── Performance: contain layout on accordion bodies ── */
.acc-body { contain: content; }

/* ── Fix: quantum-tile duplicate — keep only clean rule ── */
.quantum-tile {
  grid-column: 1 / -1;
  padding: 16px 14px 14px;
  min-height: 0;
  cursor: pointer;
}

/* ── Performance: hint browser to optimize tile animations ── */
.result-tile { contain: layout style; }
.result-tile.is-visible { contain: layout; }

