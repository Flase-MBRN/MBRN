/* ================================================================

   style.css — Numerologie-Rechner v3.0

   Primär:    Schwarz · Anthrazit · Dunkelgrau

   Sekundär:  Violett/Lila nur als Akzent (Borders, Zahlen, Glow)

   ================================================================ */

  
  

/* ================================================================

   01  DESIGN TOKENS

   ================================================================ */

:root {

  /* ── Hintergrund: echtes Schwarz bis Anthrazit ── */

  --bg:         #0a0a0f;

  --bg-mid:     #0e0e16;

  --tile-bg:    rgba(15, 15, 22, 0.96);

  --surface:    rgba(255, 255, 255, 0.024);

  --card-bg-1:  rgba(16, 16, 24, 0.98);

  --card-bg-2:  rgba(11, 11, 17, 0.99);

  

  /* ── Borders: sehr zurückhaltend ── */

  --border-dim: rgba(255, 255, 255, 0.055);

  --border-mid: rgba(255, 255, 255, 0.095);

  

  /* ── Akzentfarbe: gedämpftes Violett/Lila ── */

  --accent:        #7252a8;

  --accent-bright: #9170cc;

  --accent-dim:    rgba(114, 82, 168, 0.08);

  --accent-border: rgba(114, 82, 168, 0.22);

  --accent-glow:   rgba(100, 65, 155, 0.16);

  

  /* ── Text ── */

  --text:        #d0d4e4;

  --text-mid:    #7a8299;

  --text-dim:    rgba(130, 140, 170, 0.36);

  

  /* ── Zahlen-Farben: alle im Violett-Indigo-Spektrum ── */

  --life:      #8b70d8;

  --life-b:    rgba(139, 112, 216, 0.20);

  --life-glow: rgba(120, 90, 200, 0.15);

  

  --soul:      #6a8fd4;

  --soul-b:    rgba(106, 143, 212, 0.18);

  --soul-glow: rgba(90, 120, 190, 0.14);

  

  --expr:      #9d78e0;

  --expr-b:    rgba(157, 120, 224, 0.18);

  --expr-glow: rgba(140, 100, 210, 0.14);

  

  --pers:      #7060c8;

  --pers-b:    rgba(112, 96, 200, 0.18);

  --pers-glow: rgba(95, 78, 180, 0.14);

  

  /* ── Fehler ── */

  --danger:      #a85555;

  --debt-bg:     rgba(140, 60, 60, 0.05);

  --debt-border: rgba(140, 70, 70, 0.24);

  

  /* ── Modal ── */

  --modal-bg:     rgba(10, 10, 16, 0.99);

  --modal-border: rgba(100, 72, 160, 0.16);

  

  /* ── Typografie ── */

  --f-head: 'Syne',   'Segoe UI', sans-serif;

  --f-body: 'Outfit', 'Segoe UI', sans-serif;

  

  /* ── Layout ── */

  --r-lg:  13px;

  --r-md:  8px;

  --r-sm:  5px;

  --max-w: 900px;

  

  /* ── Schatten: tief & schwarz ── */

  --sh-card:  0 20px 60px rgba(0, 0, 0, 0.80), 0 4px 16px rgba(0, 0, 0, 0.50);

  --sh-modal: 0 28px 80px rgba(0, 0, 0, 0.90);

  

  --ease: cubic-bezier(0.22, 0.61, 0.36, 1);

  --t-s:  0.15s;

  --t-m:  0.26s;

}

  

/* ── Light Mode ── */

[data-theme="light"] {

  --bg:         #f4f4f8;

  --bg-mid:     #eeeef4;

  --tile-bg:    rgba(250, 250, 255, 0.94);

  --surface:    rgba(0, 0, 0, 0.020);

  --card-bg-1:  rgba(246, 246, 252, 0.98);

  --card-bg-2:  rgba(240, 240, 248, 0.99);

  

  --border-dim: rgba(0, 0, 0, 0.07);

  --border-mid: rgba(0, 0, 0, 0.12);

  

  --accent:        #5a3e90;

  --accent-bright: #7050b8;

  --accent-dim:    rgba(90, 62, 144, 0.07);

  --accent-border: rgba(90, 62, 144, 0.20);

  --accent-glow:   rgba(90, 62, 144, 0.10);

  

  --text:        #18162a;

  --text-mid:    #48466a;

  --text-dim:    rgba(55, 52, 90, 0.42);

  

  --life:      #5a44a8;  --life-b: rgba(90,68,168,0.18);  --life-glow: rgba(80,58,150,0.12);

  --soul:      #3a5aaa;  --soul-b: rgba(58,90,170,0.18);  --soul-glow: rgba(48,78,150,0.12);

  --expr:      #6a48bc;  --expr-b: rgba(106,72,188,0.18); --expr-glow: rgba(95,62,170,0.12);

  --pers:      #4e3eb0;  --pers-b: rgba(78,62,176,0.18);  --pers-glow: rgba(68,52,155,0.12);

  

  --danger:      #9a3434;

  --debt-bg:     rgba(154, 52, 52, 0.05);

  --debt-border: rgba(154, 60, 60, 0.22);

  

  --modal-bg:     rgba(244, 244, 250, 0.99);

  --modal-border: rgba(90, 60, 144, 0.14);

  

  --sh-card:  0 10px 36px rgba(20, 16, 50, 0.10), 0 2px 8px rgba(20, 16, 50, 0.06);

  --sh-modal: 0 18px 56px rgba(20, 16, 50, 0.18);

}

  
  

/* ================================================================

   02  RESET

   ================================================================ */

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { -webkit-text-size-adjust: 100%; scroll-behavior: smooth; }

  
  

/* ================================================================

   03  BODY — Schwarz mit minimalem Verlauf

   ================================================================ */

body {

  font-family:            var(--f-body);

  font-size:              1rem;

  line-height:            1.6;

  color:                  var(--text-mid);

  background-color:       var(--bg);

  -webkit-font-smoothing: antialiased;

  

  /* Ganz subtiler Verlauf — fast unsichtbar, nur Tiefe */

  background-image:

    radial-gradient(ellipse 90% 50% at 50% 0%,

      rgba(80, 50, 130, 0.045) 0%, transparent 60%),

    radial-gradient(ellipse 60% 40% at 100% 100%,

      rgba(60, 38, 110, 0.035) 0%, transparent 55%),

    linear-gradient(180deg, var(--bg-mid) 0%, var(--bg) 40%);

  

  min-height: 100vh;

  padding: max(28px, env(safe-area-inset-top, 28px)) 14px

           max(56px, env(safe-area-inset-bottom, 56px));

  display: flex;

  flex-direction: column;

  align-items: center;

  gap: 20px;

  overflow-x: hidden;

  transition: background-color var(--t-m) var(--ease);

}

  

[data-theme="light"] body {

  background-image:

    radial-gradient(ellipse 90% 50% at 50% 0%,

      rgba(90, 60, 150, 0.04) 0%, transparent 60%),

    linear-gradient(180deg, var(--bg-mid) 0%, var(--bg) 40%);

}

  
  

/* ================================================================

   04  HINTERGRUND-ORBS — kaum sichtbar

   ================================================================ */

.bg-orb {

  position: fixed; border-radius: 50%;

  pointer-events: none; z-index: 0; filter: blur(80px);

}

.bg-orb--1 {

  width: 500px; height: 400px;

  background: radial-gradient(ellipse,

    rgba(70, 42, 130, 0.055) 0%,

    transparent 65%

  );

  top: -180px; left: -160px;

  animation: orbDrift1 32s ease-in-out infinite alternate;

}

.bg-orb--2 {

  width: 420px; height: 340px;

  background: radial-gradient(ellipse,

    rgba(50, 30, 105, 0.045) 0%,

    transparent 65%

  );

  bottom: -140px; right: -140px;

  animation: orbDrift2 40s ease-in-out infinite alternate;

}

[data-theme="light"] .bg-orb { opacity: 0.30; }

  
  

/* ================================================================

   05  ACCESSIBILITY

   ================================================================ */

.sr-only {

  position: absolute !important; width: 1px; height: 1px;

  padding: 0; margin: -1px; overflow: hidden;

  clip: rect(0,0,0,0); white-space: nowrap; border: 0;

}

  
  

/* ================================================================

   06  HEADER

   ================================================================ */

.site-header {

  text-align: center; position: relative; z-index: 2;

  width: 100%; max-width: var(--max-w);

}

.header-inner {

  display: flex; align-items: center; justify-content: center;

  gap: 10px; flex-wrap: wrap; margin-bottom: 6px;

}

.header-icon {

  font-size: 1rem; color: var(--accent); opacity: 0.65; flex-shrink: 0;

  animation: starSpin 24s linear infinite; display: inline-block;

}

  

/* Titel: anthrazit-weiß, kein greller Shimmer */

.site-title {

  font-family:    var(--f-head);

  font-size:      clamp(1.3rem, 5vw, 1.85rem);

  font-weight:    700;

  letter-spacing: 0.01em;

  color:          var(--text);

  /* Hauchzarter Shimmer — Weiß zu Violett zu Weiß */

  background: linear-gradient(

    115deg,

    var(--text) 35%,

    var(--accent-bright) 55%,

    var(--text) 70%

  );

  background-size:         260% 100%;

  -webkit-background-clip: text;

  -webkit-text-fill-color: transparent;

  background-clip:         text;

  animation:               shimmer 14s ease-in-out infinite alternate;

}

[data-theme="light"] .site-title {

  background: linear-gradient(115deg, var(--text) 35%, var(--accent) 55%, var(--text) 70%);

  background-size: 260% 100%;

  -webkit-background-clip: text;

  background-clip: text;

  animation: shimmer 14s ease-in-out infinite alternate;

}

  

.version-badge {

  font-family: var(--f-body); font-size: 0.62rem; font-weight: 600;

  letter-spacing: 0.10em; text-transform: uppercase;

  color: rgba(114, 82, 168, 0.60);

  background: rgba(114, 82, 168, 0.06);

  border: 1px solid rgba(114, 82, 168, 0.16);

  padding: 2px 7px; border-radius: 20px; flex-shrink: 0;

}

.site-subtitle {

  font-size: clamp(0.71rem, 2vw, 0.81rem); font-weight: 300;

  color: var(--text-dim); letter-spacing: 0.02em;

}

  

.theme-toggle {

  width: 30px; height: 30px; border-radius: 50%;

  border: 1px solid var(--border-dim); background: transparent;

  color: var(--text-dim); font-size: 0.86rem; cursor: pointer;

  display: inline-flex; align-items: center; justify-content: center;

  flex-shrink: 0; -webkit-tap-highlight-color: transparent;

  transition: border-color var(--t-s), color var(--t-s), transform var(--t-s);

}

.theme-toggle:hover {

  border-color: var(--accent-border); color: var(--accent-bright);

  transform: scale(1.08);

}

  
  

/* ================================================================

   07  LAYOUT

   ================================================================ */

.content {

  width: 100%; display: flex; flex-direction: column;

  align-items: center; position: relative; z-index: 2; gap: 14px;

}

.container {

  width: 100%; max-width: var(--max-w);

  display: grid; grid-template-columns: 1fr;

  gap: 14px; align-items: start;

}

.container--full { grid-template-columns: 1fr; }

@media (min-width: 540px) and (max-width: 899px) {

  .container, .container--full { max-width: 620px; }

}

  
  

/* ================================================================

   08  CARDS — Anthrazit, fast schwarz

   ================================================================ */

.card {

  border-radius: var(--r-lg);

  /* Border: sehr dunkel, nur ganz leicht sichtbar */

  border: 1px solid var(--border-dim);

  box-shadow: var(--sh-card);

  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);

  position: relative; z-index: 1; overflow: visible;

  transition: border-color var(--t-m) var(--ease), background var(--t-m) var(--ease);

}

  

/* Obere Kante: hauchfeiner violetter Glow-Strich */

.card::before {

  content: ''; position: absolute; top: 0; left: 15%; right: 15%; height: 1px;

  background: linear-gradient(

    90deg,

    transparent,

    rgba(114, 82, 168, 0.18) 25%,

    rgba(145, 112, 204, 0.28) 50%,

    rgba(114, 82, 168, 0.18) 75%,

    transparent

  );

}

.card:hover { border-color: rgba(114, 82, 168, 0.14); }

  

.card-title {

  font-family: var(--f-head); font-size: 0.62rem; font-weight: 700;

  letter-spacing: 0.20em; text-transform: uppercase;

  color: rgba(114, 82, 168, 0.48); margin-bottom: 18px;

}

[data-theme="light"] .card-title { color: rgba(90, 62, 144, 0.55); }

  

.form-card {

  padding: 22px 18px 20px;

  background: linear-gradient(160deg, var(--card-bg-1) 0%, var(--card-bg-2) 100%);

}

.results-card {

  padding: 20px 16px; min-height: 160px;

  background: linear-gradient(152deg, var(--card-bg-1) 0%, var(--card-bg-2) 100%);

}

.results-card-header {

  display: flex; align-items: center; justify-content: space-between;

  gap: 10px; flex-wrap: wrap; margin-bottom: 4px;

}

.results-card-header .card-title { margin-bottom: 0; }

.results-hint {

  font-size: 0.71rem; color: var(--text-dim);

  margin-bottom: 6px; display: none;

}

  
  

/* ================================================================

   09  FORM — INPUTS

   ================================================================ */

.form-fieldset { border: 0; padding: 0; }

.input-group   { margin-bottom: 18px; }

.input-label {

  display: block; font-size: 0.70rem; font-weight: 500;

  letter-spacing: 0.08em; text-transform: uppercase;

  color: var(--text-dim); margin-bottom: 7px;

}

  

input[type="text"] {

  width: 100%; padding: 13px 14px; border-radius: var(--r-md);

  border: 1px solid rgba(255, 255, 255, 0.06);

  background: rgba(6, 6, 12, 0.70);

  color: var(--text); font-family: var(--f-body); font-size: 1rem;

  outline: none; -webkit-appearance: none;

  transition: border-color var(--t-s) var(--ease),

              box-shadow   var(--t-m) var(--ease),

              transform    var(--t-s) var(--ease);

}

[data-theme="light"] input[type="text"] {

  border-color: rgba(0, 0, 0, 0.09);

  background: rgba(255, 255, 255, 0.78);

}

input::placeholder { color: rgba(120, 130, 160, 0.24); }

input:focus {

  border-color: rgba(114, 82, 168, 0.35);

  box-shadow: 0 0 0 3px rgba(100, 68, 155, 0.07);

  transform: translateY(-1px);

}

input.input-valid   { border-color: rgba(100, 78, 180, 0.28); }

input.input-invalid { border-color: rgba(160, 65, 65, 0.42); }

  

.input-hint { font-size: 0.72rem; color: var(--text-dim); margin-top: 5px; line-height: 1.4; }

.error-msg  { min-height: 16px; font-size: 0.74rem; color: var(--danger); margin-top: 5px; line-height: 1.3; }

  
  

/* ================================================================

   10  BUTTONS

   ================================================================ */

.button-row { display: flex; gap: 10px; flex-wrap: wrap; }

  

.btn {

  display: inline-flex; align-items: center; justify-content: center;

  gap: 7px; flex: 1; min-height: 44px; padding: 11px 14px;

  border-radius: var(--r-md); border: 1px solid transparent;

  font-family: var(--f-body); font-size: 0.85rem; font-weight: 600;

  letter-spacing: 0.03em; cursor: pointer;

  -webkit-tap-highlight-color: transparent;

  transition: transform var(--t-s) var(--ease),

              box-shadow var(--t-m) var(--ease),

              opacity    var(--t-s);

}

  

/* Primär: anthrazit mit violettem Rand */

.btn--primary {

  background: rgba(20, 18, 32, 0.90);

  border-color: rgba(114, 82, 168, 0.28);

  color: var(--accent-bright);

}

.btn--primary:hover:not(:disabled) {

  transform: translateY(-2px);

  box-shadow: 0 4px 20px rgba(90, 55, 150, 0.16);

  border-color: rgba(145, 112, 204, 0.40);

}

  

/* Sekundär: dunkel, nahezu unsichtbar */

.btn--secondary {

  background: rgba(255, 255, 255, 0.028);

  border-color: var(--border-dim);

  color: var(--text-mid);

}

.btn--secondary:hover:not(:disabled) {

  transform: translateY(-2px);

  background: rgba(255, 255, 255, 0.048);

  border-color: var(--border-mid);

}

  

.btn--ghost {

  background: transparent; border-color: var(--border-dim);

  color: var(--text-dim); font-size: 0.76rem;

  flex: 0; padding: 7px 12px; min-height: 34px;

}

.btn--ghost:hover:not(:disabled) {

  border-color: var(--accent-border); color: var(--accent-bright);

  transform: translateY(-1px);

}

  

.btn:disabled { opacity: 0.28; cursor: not-allowed; }

.btn-icon { font-size: 0.78rem; opacity: 0.70; }

  

[data-theme="light"] .btn--primary  { background: rgba(240, 238, 248, 0.95); }

[data-theme="light"] .btn--secondary{ background: rgba(0, 0, 0, 0.03); }

  
  

/* ================================================================

   11  RESULTS GRID & TILES

   ================================================================ */

.results-grid {

  display: grid; grid-template-columns: repeat(2, 1fr);

  gap: 10px; margin-top: 10px; align-items: start;

}

.results-grid--extra {

  margin-top: 12px; padding-top: 12px;

  border-top: 1px solid rgba(255, 255, 255, 0.042);

  grid-template-columns: repeat(2, 1fr);

}

.results-grid--extra:empty { display: none; }

  

.result-tile {

  display: flex; flex-direction: column; align-items: center;

  justify-content: flex-start; padding: 16px 12px 14px;

  border-radius: var(--r-lg);

  /* Tile: anthrazit, kaum Rand */

  border: 1px solid rgba(255, 255, 255, 0.052);

  background: var(--tile-bg);

  position: relative; overflow: visible;

  min-height: 130px; align-self: start;

  opacity: 0; transform: translateY(10px);

  transition: border-color var(--t-m) var(--ease),

              box-shadow   var(--t-m) var(--ease),

              transform    var(--t-m) var(--ease);

}

.result-tile::before {

  content: ''; position: absolute; inset: 0; opacity: 0;

  pointer-events: none; border-radius: inherit;

  transition: opacity var(--t-m) var(--ease);

}

.result-tile:hover::before { opacity: 1; }

.result-tile.is-visible { animation: tileIn 0.38s var(--ease) forwards; }

  

/* Extra-Tiles: noch dezentere Border */

.results-grid--extra .result-tile {

  border-color: rgba(255, 255, 255, 0.038);

}

  

.result-title {

  display: flex; align-items: center; justify-content: center;

  gap: 6px; font-size: 0.69rem; font-weight: 500;

  letter-spacing: 0.05em; text-transform: uppercase;

  color: var(--text-dim); text-align: center;

  margin-bottom: 10px; min-height: 18px; line-height: 1.3;

}

.result-value {

  font-family: var(--f-head);

  font-size: clamp(1.6rem, 4.5vw, 2.05rem);

  font-weight: 800; letter-spacing: 0.02em; line-height: 1;

  color: var(--text); /* Standardzahl weiß-grau */

  margin: 0 auto 8px; width: fit-content; text-align: center;

}

.result-explanation {

  font-size: clamp(0.69rem, 1.7vw, 0.76rem); font-weight: 300;

  color: var(--text-dim); text-align: center;

  line-height: 1.4; min-height: 16px;

}

  
  

/* ================================================================

   12  TILE-AKZENTFARBEN

   Kacheln: fast schwarzer Hintergrund,

   violetter Rand + farbige Zahl, kaum Glow

   ================================================================ */

.life-number {

  border-color: var(--life-b);

  background: linear-gradient(160deg,

    rgba(110, 82, 200, 0.05) 0%, var(--tile-bg) 50%);

}

.life-number::before {

  background: radial-gradient(ellipse 70% 55% at 22% 22%,

    var(--life-glow), transparent 68%);

}

.life-number:hover {

  box-shadow: 0 6px 28px var(--life-glow);

  border-color: rgba(139, 112, 216, 0.32);

  transform: translateY(-3px);

}

.life-number .result-value {

  color: var(--life);

  font-size: clamp(1.8rem, 5vw, 2.3rem);

  width: fit-content; margin: 0 auto 8px;

}

  

.soul-number {

  border-color: var(--soul-b);

  background: linear-gradient(160deg,

    rgba(80, 110, 190, 0.05) 0%, var(--tile-bg) 50%);

}

.soul-number::before {

  background: radial-gradient(ellipse 70% 55% at 22% 22%,

    var(--soul-glow), transparent 68%);

}

.soul-number:hover {

  box-shadow: 0 6px 28px var(--soul-glow);

  border-color: rgba(106, 143, 212, 0.32);

  transform: translateY(-3px);

}

.soul-number .result-value { color: var(--soul); }

  

.expression-number {

  border-color: var(--expr-b);

  background: linear-gradient(160deg,

    rgba(140, 90, 210, 0.05) 0%, var(--tile-bg) 50%);

}

.expression-number::before {

  background: radial-gradient(ellipse 70% 55% at 22% 22%,

    var(--expr-glow), transparent 68%);

}

.expression-number:hover {

  box-shadow: 0 6px 28px var(--expr-glow);

  border-color: rgba(157, 120, 224, 0.32);

  transform: translateY(-3px);

}

.expression-number .result-value { color: var(--expr); }

  

.personality-number {

  border-color: var(--pers-b);

  background: linear-gradient(160deg,

    rgba(90, 72, 190, 0.05) 0%, var(--tile-bg) 50%);

}

.personality-number::before {

  background: radial-gradient(ellipse 70% 55% at 22% 22%,

    var(--pers-glow), transparent 68%);

}

.personality-number:hover {

  box-shadow: 0 6px 28px var(--pers-glow);

  border-color: rgba(112, 96, 200, 0.32);

  transform: translateY(-3px);

}

.personality-number .result-value { color: var(--pers); }

  
  

/* ================================================================

   13  MASTERZAHL & KARMISCHE SCHULD

   ================================================================ */

.result-value.master {

  color: var(--accent-bright) !important;

  text-shadow:

    0 0 10px rgba(145, 112, 204, 0.32),

    0 0 26px rgba(114, 82, 168, 0.12);

  animation: masterPulse 2.8s ease-in-out infinite alternate;

}

.karmic-debt-tile {

  border-color: var(--debt-border) !important;

  border-style: dashed !important;

  background: var(--debt-bg) !important;

}

.karmic-debt-tile .result-value { color: var(--danger); }

  
  

/* ================================================================

   13b  PLANES-TILE

   ================================================================ */

.planes-tile { grid-column: 1 / -1; padding: 18px 16px 16px; min-height: 0; cursor: pointer; }

.planes-tile .result-title { margin-bottom: 14px; justify-content: flex-start; gap: 8px; }

.planes-tile .result-title span { font-size: 0.69rem; }

  

.planes-bars { display: flex; flex-direction: column; gap: 10px; width: 100%; }

.plane-row {

  display: grid; grid-template-columns: 140px 1fr 52px;

  align-items: center; gap: 10px; opacity: 0.58; transition: opacity var(--t-s);

}

.plane-row--dominant { opacity: 1; }

.plane-row--dominant .plane-label { color: var(--text); font-weight: 600; }

  

.plane-meta { display: flex; flex-direction: column; gap: 2px; min-width: 0; }

.plane-label {

  font-family: var(--f-head); font-size: 0.71rem; font-weight: 600;

  letter-spacing: 0.04em; color: var(--text-mid); white-space: nowrap;

}

.plane-short {

  font-size: 0.64rem; font-weight: 300; color: var(--text-dim);

  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;

}

.plane-track { height: 5px; border-radius: 3px; background: rgba(255,255,255,0.048); overflow: hidden; }

[data-theme="light"] .plane-track { background: rgba(0,0,0,0.07); }

.plane-fill { height: 100%; border-radius: 3px; transition: width 0.75s cubic-bezier(0.22,0.61,0.36,1); }

.plane-count {

  font-family: var(--f-head); font-size: 0.86rem; font-weight: 700;

  color: var(--text-mid); text-align: right; white-space: nowrap;

}

.plane-count small { font-family: var(--f-body); font-size: 0.58rem; font-weight: 300; opacity: 0.52; }

.planes-dominant {

  margin-top: 14px; padding-top: 10px;

  border-top: 1px solid rgba(255,255,255,0.040);

  font-size: 0.69rem; color: var(--accent); opacity: 0.72;

  letter-spacing: 0.03em; text-align: center;

}

@media (max-width: 479px) {

  .plane-row { grid-template-columns: 110px 1fr 44px; gap: 8px; }

  .plane-short { display: none; }

  .plane-meta { flex-direction: row; align-items: center; gap: 6px; }

}

  

/* Modal-Planes */

.modal-planes { display: flex; flex-direction: column; gap: 14px; margin-bottom: 4px; }

.modal-plane-row {

  padding: 12px 14px; border-radius: var(--r-md);

  background: rgba(255,255,255,0.018); border: 1px solid var(--border-dim);

}

.modal-plane-row--dom { background: rgba(100,68,165,0.05); border-color: var(--accent-border); }

[data-theme="light"] .modal-plane-row      { background: rgba(0,0,0,0.018); }

[data-theme="light"] .modal-plane-row--dom { background: rgba(90,60,144,0.05); border-color: var(--accent-border); }

.modal-plane-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }

.modal-plane-label { font-family: var(--f-head); font-size: 0.74rem; font-weight: 700; letter-spacing: 0.06em; color: var(--text); }

.modal-plane-num { font-family: var(--f-head); font-size: 0.84rem; font-weight: 700; color: var(--text-mid); }

.modal-plane-num small { font-family: var(--f-body); font-size: 0.64rem; opacity: 0.52; }

.modal-plane-track { height: 5px; border-radius: 3px; background: rgba(255,255,255,0.048); overflow: hidden; margin-bottom: 10px; }

[data-theme="light"] .modal-plane-track { background: rgba(0,0,0,0.07); }

.modal-plane-fill { height: 100%; border-radius: 3px; transition: width 0.65s cubic-bezier(0.22,0.61,0.36,1); }

.modal-plane-desc { font-size: 0.78rem; font-weight: 300; color: var(--text-mid); line-height: 1.55; margin: 0; }

.modal-value--plane {

  font-family: var(--f-head); font-size: 1.5rem !important;

  font-weight: 800; color: var(--accent-bright); line-height: 1.2; text-align: center;

}

  
  

/* ================================================================

   14  GRID-LABEL

   ================================================================ */

.grid-section-label {

  grid-column: 1 / -1; text-align: center;

  font-size: 0.60rem; font-weight: 700; letter-spacing: 0.20em;

  text-transform: uppercase; color: var(--accent); opacity: 0.48;

  padding: 10px 0 4px;

  border-top: 1px solid rgba(255, 255, 255, 0.038);

  margin-top: 4px;

}

  
  

/* ================================================================

   15  RESULT-ACTIONS

   ================================================================ */

.result-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

  
  

/* ================================================================

   16  TOOLTIP

   ================================================================ */

.tooltip-btn {

  display: inline-flex; align-items: center; justify-content: center;

  flex-shrink: 0; width: 15px; height: 15px; padding: 0;

  border: 1px solid rgba(255,255,255,0.07); border-radius: 50%;

  background: rgba(255,255,255,0.028); color: var(--text-dim);

  font-family: var(--f-body); font-size: 0.54rem; cursor: help;

  position: relative; -webkit-tap-highlight-color: transparent;

  transition: border-color var(--t-s), color var(--t-s), background var(--t-s);

}

.tooltip-btn:hover, .tooltip-btn:focus-visible {

  border-color: var(--accent-border); color: var(--accent-bright);

  background: rgba(100,68,165,0.07);

}

.tooltip-btn::after {

  content: attr(data-tooltip);

  position: absolute; bottom: calc(100% + 8px); left: 50%;

  transform: translateX(-50%) translateY(5px);

  width: max-content; max-width: min(200px, 80vw);

  white-space: normal; text-align: left;

  background: rgba(8, 8, 15, 0.98); color: var(--text-mid);

  font-family: var(--f-body); font-size: 0.70rem; font-weight: 400;

  line-height: 1.45; padding: 7px 10px;

  border-radius: var(--r-sm); border: 1px solid rgba(114, 82, 168, 0.16);

  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.88);

  opacity: 0; pointer-events: none; z-index: 200;

  transition: opacity var(--t-m) var(--ease), transform var(--t-m) var(--ease);

}

.tooltip-btn:hover::after, .tooltip-btn:focus-visible::after {

  opacity: 1; transform: translateX(-50%) translateY(0);

}

[data-theme="light"] .tooltip-btn::after {

  background: rgba(244, 244, 250, 0.99);

  border-color: rgba(90, 60, 144, 0.14);

  box-shadow: 0 8px 24px rgba(20, 16, 50, 0.16);

}

  
  

/* ================================================================

   17  MODAL — sehr dunkel, schmaler violetter Rand

   ================================================================ */

.detail-modal {

  position: fixed; inset: 0; margin: auto;

  width: min(500px, 92vw); max-height: 88vh;

  padding: 0; border: 1px solid var(--modal-border);

  border-radius: var(--r-lg); background: var(--modal-bg);

  box-shadow: var(--sh-modal); overflow-y: auto; z-index: 500;

  animation: modalIn 0.24s var(--ease) forwards;

}

.detail-modal::backdrop {

  background: rgba(0, 0, 0, 0.82);

  -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px);

}

[data-theme="light"] .detail-modal::backdrop { background: rgba(20, 15, 45, 0.40); }

  

.modal-inner { padding: 28px 22px 30px; position: relative; }

  

.modal-close {

  position: absolute; top: 16px; right: 16px;

  width: 28px; height: 28px; border-radius: 50%;

  border: 1px solid var(--border-mid); background: transparent;

  color: var(--text-mid); font-size: 0.74rem; cursor: pointer;

  display: flex; align-items: center; justify-content: center;

  -webkit-tap-highlight-color: transparent;

  transition: border-color var(--t-s), color var(--t-s);

}

.modal-close:hover { border-color: var(--accent-border); color: var(--accent-bright); }

  

.modal-top {

  display: flex; flex-direction: column; align-items: center;

  gap: 6px; margin-bottom: 20px; padding-bottom: 20px;

  border-bottom: 1px solid rgba(255, 255, 255, 0.042);

}

.modal-icon { font-size: 1.7rem; color: var(--accent); opacity: 0.72; line-height: 1; animation: starSpin 12s linear infinite; }

.modal-type {

  font-family: var(--f-head); font-size: 0.64rem; font-weight: 700;

  letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-dim);

}

.modal-value {

  font-family: var(--f-head); font-size: 2.9rem; font-weight: 800;

  color: var(--accent-bright); line-height: 1; text-align: center;

  width: fit-content; margin: 0 auto;

}

.modal-value.master {

  animation: masterPulse 2.4s ease-in-out infinite alternate;

  text-shadow: 0 0 16px rgba(145, 112, 204, 0.40);

}

.modal-short {

  font-size: 0.85rem; font-weight: 500; color: var(--text);

  text-align: center; margin-bottom: 12px; line-height: 1.5;

}

.modal-extended {

  font-size: 0.84rem; font-weight: 300; color: var(--text-mid);

  line-height: 1.65; margin-bottom: 20px; text-align: center;

}

.modal-calc-box {

  display: flex; flex-direction: column; gap: 4px;

  background: rgba(255,255,255,0.016);

  border: 1px solid rgba(255,255,255,0.048);

  border-radius: var(--r-sm); padding: 10px 14px;

}

[data-theme="light"] .modal-calc-box { background: rgba(0,0,0,0.022); border-color: rgba(0,0,0,0.07); }

.modal-calc-label {

  font-size: 0.60rem; font-weight: 700; letter-spacing: 0.12em;

  text-transform: uppercase; color: var(--accent); opacity: 0.72;

}

.modal-calc { font-size: 0.78rem; color: var(--text-mid); line-height: 1.5; }

  
  

/* ================================================================

   18  VERGLEICH / KOMPATIBILITÄT

   ================================================================ */

.compare-card {

  padding: 22px 18px 24px;

  background: linear-gradient(155deg, var(--card-bg-1), var(--card-bg-2));

}

.compare-inputs { display: grid; grid-template-columns: 1fr auto 1fr; gap: 16px; align-items: start; margin-bottom: 18px; }

.compare-person-label {

  font-family: var(--f-head); font-size: 0.63rem; font-weight: 700;

  letter-spacing: 0.12em; text-transform: uppercase;

  color: var(--accent); opacity: 0.68; margin-bottom: 12px;

}

.compare-divider { font-size: 1.1rem; color: var(--accent); opacity: 0.28; align-self: center; text-align: center; padding-top: 28px; }

  

.compat-header {

  display: flex; flex-direction: column; align-items: center;

  gap: 6px; margin-bottom: 20px; padding-bottom: 16px;

  border-bottom: 1px solid rgba(255,255,255,0.038); text-align: center;

}

.compat-names { font-family: var(--f-head); font-size: 1rem; font-weight: 700; color: var(--text); }

.compat-names span { color: var(--accent); margin: 0 6px; }

.compat-overall { display: flex; align-items: center; gap: 10px; }

.compat-score { font-family: var(--f-head); font-size: 2.0rem; font-weight: 800; color: var(--accent-bright); }

.compat-label-big { font-size: 0.86rem; color: var(--text-mid); }

  

.compat-rows { display: flex; flex-direction: column; gap: 10px; }

.compat-row { display: grid; grid-template-columns: 100px 48px 1fr 42px; align-items: center; gap: 10px; }

.compat-label { font-size: 0.77rem; color: var(--text-mid); }

.compat-nums  { font-family: var(--f-head); font-size: 0.78rem; color: var(--text-dim); text-align: center; }

.compat-bar-wrap { height: 5px; background: rgba(255,255,255,0.048); border-radius: 3px; overflow: hidden; }

[data-theme="light"] .compat-bar-wrap { background: rgba(0,0,0,0.08); }

.compat-bar  { height: 100%; border-radius: 3px; transition: width 0.85s var(--ease); }

.compat-pct  { font-size: 0.77rem; font-weight: 600; color: var(--text-mid); text-align: right; }

.compare-error { color: var(--danger); font-size: 0.81rem; margin-top: 12px; text-align: center; }

  
  

/* ================================================================

   19  TOAST

   ================================================================ */

.toast {

  position: fixed; bottom: 28px; left: 50%;

  transform: translateX(-50%) translateY(20px);

  background: rgba(10, 10, 16, 0.98); color: var(--text);

  border: 1px solid var(--accent-border); border-radius: var(--r-md);

  padding: 10px 18px; font-size: 0.82rem; z-index: 600;

  opacity: 0; pointer-events: none;

  transition: opacity var(--t-m) var(--ease), transform var(--t-m) var(--ease);

  box-shadow: 0 8px 26px rgba(0, 0, 0, 0.75);

}

[data-theme="light"] .toast { background: rgba(244, 244, 250, 0.99); }

.toast--show { opacity: 1; transform: translateX(-50%) translateY(0); }

  
  

/* ================================================================

   20  FOOTER

   ================================================================ */

.site-footer {

  font-size: 0.66rem; font-weight: 300; letter-spacing: 0.06em;

  color: var(--text-dim); text-align: center; position: relative;

  z-index: 2; opacity: 0.44;

}

  
  

/* ================================================================

   21  KEYFRAMES

   ================================================================ */

@keyframes tileIn {

  from { opacity: 0; transform: translateY(10px); }

  to   { opacity: 1; transform: translateY(0); }

}

@keyframes masterPulse {

  from { filter: drop-shadow(0 0 4px  rgba(145,112,204,0.30)); }

  to   { filter: drop-shadow(0 0 13px rgba(114, 82,168,0.55)); }

}

@keyframes modalIn {

  from { opacity: 0; transform: scale(0.96) translateY(10px); }

  to   { opacity: 1; transform: scale(1) translateY(0); }

}

@keyframes orbDrift1 {

  from { transform: translate(0, 0)      scale(1); }

  to   { transform: translate(22px, 16px) scale(1.05); }

}

@keyframes orbDrift2 {

  from { transform: translate(0, 0)        scale(1); }

  to   { transform: translate(-18px, -12px) scale(1.05); }

}

@keyframes shimmer {

  from { background-position:   0% 50%; }

  to   { background-position: 100% 50%; }

}

@keyframes starSpin {

  from { transform: rotate(0deg); }

  to   { transform: rotate(360deg); }

}

  
  

/* ================================================================

   22  BREAKPOINTS

   ================================================================ */

@media (min-width: 480px) {

  body { gap: 24px; }

  .form-card { padding: 26px 22px 22px; }

  .results-card { padding: 22px 18px; }

  .results-grid { gap: 12px; }

  .result-tile { padding: 18px 14px 16px; min-height: 140px; align-self: start; }

  .bg-orb--1 { width: 620px; height: 500px; }

  .bg-orb--2 { width: 520px; height: 420px; }

  .results-hint { display: block; }

}

@media (min-width: 640px) {

  body { padding: 40px 26px max(64px, env(safe-area-inset-bottom, 64px)); gap: 28px; }

  .container { gap: 18px; }

  .form-card { padding: 28px 24px 24px; }

  .results-card { padding: 24px 20px; }

  .results-grid { gap: 13px; margin-top: 12px; }

  .result-tile { padding: 20px 16px 18px; min-height: 148px; align-self: start; }

}

@media (min-width: 900px) {

  body { padding: 52px 30px max(72px, env(safe-area-inset-bottom, 72px)); gap: 32px; }

  .container { grid-template-columns: 290px 1fr; gap: 22px; }

  .form-card { padding: 30px 24px 26px; }

  .results-card { padding: 26px 22px; }

  .results-grid { gap: 14px; margin-top: 12px; }

  .results-grid--extra { grid-template-columns: repeat(3, 1fr); }

  .result-tile { padding: 22px 16px 18px; min-height: 148px; align-self: start; }

  .bg-orb--1 { width: 800px; height: 640px; filter: blur(100px); }

  .bg-orb--2 { width: 680px; height: 560px; filter: blur(110px); }

  .compare-card { padding: 26px 28px 28px; }

}

@media (max-width: 500px) {

  .compare-inputs { grid-template-columns: 1fr; }

  .compare-divider { display: none; }

  .compat-row { grid-template-columns: 90px 40px 1fr 38px; gap: 6px; }

}

  
  

/* ================================================================

   23  PRINT

   ================================================================ */

@media print {

  body { background: #fff !important; color: #000 !important; padding: 0 !important; gap: 0 !important; }

  .bg-orb, .form-card, .result-actions, .compare-card, .theme-toggle,

  .site-footer, .tooltip-btn, .results-hint, .site-subtitle { display: none !important; }

  .site-title { -webkit-text-fill-color: #000 !important; background: none !important; animation: none !important; }

  .card { border: 1px solid #ddd !important; box-shadow: none !important; background: #fff !important; }

  .result-tile { border: 1px solid #ddd !important; background: #fff !important; opacity: 1 !important; transform: none !important; break-inside: avoid; }

  .result-value { color: #000 !important; text-shadow: none !important; animation: none !important; }

  .result-value.master { color: #3d1e6a !important; }

  .results-grid { gap: 8px !important; }

  .grid-section-label { color: #000 !important; border-color: #ddd !important; }

  .container { grid-template-columns: 1fr !important; }

}

  
  

/* ================================================================

   24  ACCESSIBILITY

   ================================================================ */

:focus-visible {

  outline: 2px solid rgba(114, 82, 168, 0.52);

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

   25  LO-SHU PSYCHOMATRIX

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

  border: 1px solid rgba(255,255,255,0.048);

  min-height: 62px;

}

[data-theme="light"] .lo-shu-cell { background: rgba(0,0,0,0.022); border-color: rgba(0,0,0,0.07); }

.lo-shu-cell--missing { background: rgba(130,55,55,0.04); border-color: rgba(130,60,60,0.20); border-style: dashed; }

.lo-shu-cell--strong  { background: rgba(100,70,170,0.06); border-color: var(--accent-border); }

.lo-shu-num { font-family: var(--f-head); font-size: 1.15rem; font-weight: 800; color: var(--text); line-height: 1; }

.lo-shu-cell--missing .lo-shu-num { color: var(--danger); opacity: 0.55; }

.lo-shu-cell--strong  .lo-shu-num { color: var(--accent-bright); }

.lo-shu-dots { font-size: 0.54rem; color: var(--accent); letter-spacing: 1px; min-height: 10px; line-height: 1; opacity: 0.70; }

.lo-shu-cell--missing .lo-shu-dots { color: var(--danger); }

.lo-shu-cell--strong  .lo-shu-dots { color: var(--accent-bright); opacity: 1; }

.lo-shu-lines { font-size: 0.67rem; color: var(--accent); text-align: center; letter-spacing: 0.02em; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.038); opacity: 0.68; }

  

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

.modal-lo-shu-info--missing { border-color: rgba(130,58,58,0.22); }

.modal-lo-shu-info--strong  { border-color: var(--accent-border); }

.modal-lo-shu-info--lines   { border-color: rgba(80,100,180,0.20); }

.modal-lo-shu-info strong   { color: var(--text); }

  
  

/* ================================================================

   26  QUANTUM SCORE TILE

   ================================================================ */

.quantum-tile { cursor: pointer; padding: 16px 14px 14px; }

.quantum-gauge { width: 100%; display: flex; flex-direction: column; gap: 8px; margin: 10px 0 6px; }

.quantum-bar-track { height: 5px; border-radius: 3px; background: rgba(255,255,255,0.048); overflow: hidden; }

[data-theme="light"] .quantum-bar-track { background: rgba(0,0,0,0.08); }

.quantum-bar-fill { height: 100%; border-radius: 3px; transition: width 1.1s cubic-bezier(0.22,0.61,0.36,1); }

.quantum-score-value {

  font-family: var(--f-head); font-size: 1.5rem; font-weight: 800;

  text-align: center; line-height: 1; letter-spacing: 0.02em;

}