/* ================================================================

   style.css — Numerologie-Rechner v2.0

   Theme  : Cosmic Dark × Gold  |  Light: Warm Parchment × Gold

   Fonts  : Syne + Outfit

   ================================================================

  

   01  Design Tokens (Dark + Light)

   02  Base Reset

   03  Body & Hintergrund

   04  Hintergrund-Orbs

   05  Accessibility

   06  Header + Theme-Toggle

   07  Layout

   08  Cards

   09  Form — Inputs & Labels

   10  Buttons

   11  Results — Grid & Tiles

   12  Tile-Akzentfarben

   13  Masterzahl & Karmische Schuld

   14  Grid-Labels

   15  Ergebnis-Aktionen (Share / Print)

   16  Tooltip

   17  Modal

   18  Vergleich / Kompatibilität

   19  Toast-Notification

   20  Footer

   21  Keyframes

   22  Breakpoints

   23  Print-Styles

   24  Accessibility (focus-visible, reduced-motion)

   ================================================================ */

  
  

/* ================================================================

   01  DESIGN TOKENS — DARK (Default)

   ================================================================ */

:root {

  --bg:          #04060e;

  --tile-bg:     rgba(10, 14, 26, 0.90);

  --surface:     rgba(255, 255, 255, 0.030);

  --border-dim:  rgba(255, 255, 255, 0.055);

  --border-mid:  rgba(255, 255, 255, 0.10);

  --card-bg-1:   rgba(13, 18, 32, 0.96);

  --card-bg-2:   rgba(6, 9, 18, 0.98);

  

  --gold:        #c8a84b;

  --gold-bright: #e8cc6e;

  --gold-dim:    rgba(200, 168, 75, 0.12);

  --gold-border: rgba(200, 168, 75, 0.28);

  

  --text:        #edf2f8;

  --text-mid:    #a8b4c4;

  --text-dim:    rgba(168, 180, 196, 0.45);

  

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

  --debt-bg:     rgba(224, 112, 112, 0.06);

  --debt-border: rgba(224, 112, 112, 0.30);

  

  --modal-bg:    rgba(6, 9, 20, 0.98);

  --modal-border:rgba(200, 168, 75, 0.20);

  

  --f-head: 'Syne',   'Segoe UI', sans-serif;

  --f-body: 'Outfit', 'Segoe UI', sans-serif;

  

  --r-lg:  16px;

  --r-md:  10px;

  --r-sm:  7px;

  --max-w: 900px;

  

  --sh-card: 0 20px 60px rgba(2, 4, 12, 0.7), 0 4px 16px rgba(2, 4, 12, 0.4);

  --sh-modal:0 28px 80px rgba(0, 0, 0, 0.85);

  

  --ease: cubic-bezier(0.22, 0.61, 0.36, 1);

  --t-s:  0.14s;

  --t-m:  0.24s;

}

  

/* ── LIGHT MODE ── */

[data-theme="light"] {

  --bg:          #f2ece0;

  --tile-bg:     rgba(255, 252, 245, 0.92);

  --surface:     rgba(0, 0, 0, 0.025);

  --border-dim:  rgba(0, 0, 0, 0.08);

  --border-mid:  rgba(0, 0, 0, 0.14);

  --card-bg-1:   rgba(255, 250, 240, 0.97);

  --card-bg-2:   rgba(248, 243, 232, 0.98);

  

  --gold:        #8b6c14;

  --gold-bright: #a07818;

  --gold-dim:    rgba(139, 108, 20, 0.10);

  --gold-border: rgba(139, 108, 20, 0.30);

  

  --text:        #1a1624;

  --text-mid:    #4a4060;

  --text-dim:    rgba(60, 50, 80, 0.50);

  

  --life:        #1a9464;

  --life-glow:   rgba(26, 148, 100, 0.15);

  --life-b:      rgba(26, 148, 100, 0.25);

  

  --soul:        #2272b0;

  --soul-glow:   rgba(34, 114, 176, 0.15);

  --soul-b:      rgba(34, 114, 176, 0.25);

  

  --expr:        #8b6c14;

  --expr-glow:   rgba(139, 108, 20, 0.15);

  --expr-b:      rgba(139, 108, 20, 0.30);

  

  --pers:        #7040b8;

  --pers-glow:   rgba(112, 64, 184, 0.15);

  --pers-b:      rgba(112, 64, 184, 0.25);

  

  --danger:      #c04040;

  --debt-bg:     rgba(192, 64, 64, 0.05);

  --debt-border: rgba(192, 64, 64, 0.25);

  

  --modal-bg:    rgba(248, 243, 232, 0.99);

  --modal-border:rgba(139, 108, 20, 0.20);

  

  --sh-card: 0 12px 40px rgba(100, 80, 30, 0.12), 0 2px 10px rgba(100, 80, 30, 0.08);

  --sh-modal:0 20px 60px rgba(100, 80, 30, 0.25);

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

  min-height: 100vh;

  min-height: -webkit-fill-available;

  padding:    max(24px, env(safe-area-inset-top, 24px)) 14px

              max(52px, env(safe-area-inset-bottom, 52px));

  display:    flex;

  flex-direction: column;

  align-items:    center;

  gap:            20px;

  overflow-x:     hidden;

  transition: background-color var(--t-m) var(--ease), color var(--t-m) var(--ease);

}

  

[data-theme="light"] body {

  background-image:

    radial-gradient(ellipse 70% 40% at 10%  5%,  rgba(26, 148, 100, 0.05) 0%, transparent 55%),

    radial-gradient(ellipse 60% 40% at 90% 90%,  rgba(34, 114, 176, 0.05) 0%, transparent 55%),

    radial-gradient(ellipse 50% 50% at 50% 50%,  rgba(139, 108, 20,  0.03) 0%, transparent 60%);

}

  
  

/* ================================================================

   04  HINTERGRUND-ORBS

   ================================================================ */

.bg-orb {

  position: fixed; border-radius: 50%;

  pointer-events: none; z-index: 0; filter: blur(50px);

}

.bg-orb--1 {

  width: 320px; height: 320px;

  background: radial-gradient(circle, rgba(40,201,138,0.08), rgba(200,168,75,0.04) 40%, transparent 70%);

  top: -100px; left: -100px;

  animation: orbDrift1 24s ease-in-out infinite alternate;

}

.bg-orb--2 {

  width: 280px; height: 280px;

  background: radial-gradient(circle, rgba(78,168,232,0.08), rgba(176,125,232,0.04) 40%, transparent 70%);

  bottom: -80px; right: -80px;

  animation: orbDrift2 30s ease-in-out infinite alternate;

}

[data-theme="light"] .bg-orb { opacity: 0.4; }

  
  

/* ================================================================

   05  ACCESSIBILITY

   ================================================================ */

.sr-only {

  position: absolute !important; width: 1px; height: 1px;

  padding: 0; margin: -1px; overflow: hidden;

  clip: rect(0,0,0,0); white-space: nowrap; border: 0;

}

  
  

/* ================================================================

   06  HEADER + THEME-TOGGLE

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

  font-size: 1.2rem; color: var(--gold); flex-shrink: 0;

  animation: starSpin 12s linear infinite; display: inline-block;

}

.site-title {

  font-family:    var(--f-head);

  font-size:      clamp(1.35rem, 5vw, 2rem);

  font-weight:    700;

  letter-spacing: 0.02em;

  background: linear-gradient(135deg, var(--text) 40%, var(--gold-bright) 60%, var(--text) 80%);

  background-size:         220% 100%;

  -webkit-background-clip: text;

  -webkit-text-fill-color: transparent;

  background-clip:         text;

  animation:               shimmer 8s ease-in-out infinite alternate;

}

[data-theme="light"] .site-title {

  background: linear-gradient(135deg, var(--text) 40%, var(--gold) 60%, var(--text) 80%);

  background-size:         220% 100%;

  -webkit-background-clip: text;

  background-clip:         text;

  animation:               shimmer 8s ease-in-out infinite alternate;

}

.version-badge {

  font-family: var(--f-body); font-size: 0.68rem; font-weight: 600;

  letter-spacing: 0.10em; text-transform: uppercase;

  color: rgba(200,168,75,0.7); background: rgba(200,168,75,0.08);

  border: 1px solid rgba(200,168,75,0.20); padding: 2px 8px;

  border-radius: 20px; flex-shrink: 0;

}

.site-subtitle {

  font-size: clamp(0.78rem, 2.5vw, 0.9rem);

  font-weight: 300; color: var(--text-dim); letter-spacing: 0.02em;

}

  

/* Theme-Toggle Button */

.theme-toggle {

  width: 32px; height: 32px; border-radius: 50%;

  border: 1px solid var(--border-dim); background: var(--surface);

  color: var(--gold); font-size: 0.95rem; cursor: pointer;

  display: inline-flex; align-items: center; justify-content: center;

  flex-shrink: 0; flex-grow: 0;

  -webkit-tap-highlight-color: transparent;

  transition: border-color var(--t-s), background var(--t-s), transform var(--t-s);

}

.theme-toggle:hover { border-color: var(--gold-border); transform: scale(1.1); }

  
  

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

.container--full {

  grid-template-columns: 1fr;

}

  

/* Tablet-Portrait: Container zentriert, nicht zu breit */

@media (min-width: 540px) and (max-width: 899px) {

  .container, .container--full { max-width: 640px; }

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

  overflow:                visible;

  transition:              border-color var(--t-m) var(--ease),

                           background   var(--t-m) var(--ease);

}

.card::before {

  content: ''; position: absolute; top: 0; left: 8%; right: 8%; height: 1px;

  background: linear-gradient(90deg, transparent, var(--gold) 25%, var(--gold-bright) 50%, var(--gold) 75%, transparent);

  opacity: 0.55;

}

.card:hover { border-color: var(--border-mid); }

  

.card-title {

  font-family: var(--f-head); font-size: 0.68rem; font-weight: 700;

  letter-spacing: 0.18em; text-transform: uppercase;

  color: rgba(200,168,75,0.65); margin-bottom: 18px;

}

[data-theme="light"] .card-title { color: rgba(139,108,20,0.75); }

  

.form-card {

  padding: 22px 18px 20px;

  background: linear-gradient(160deg, var(--card-bg-1), var(--card-bg-2));

}

.results-card {

  padding: 20px 16px; min-height: 160px;

  background: linear-gradient(150deg, var(--card-bg-1), var(--card-bg-2));

}

.results-card-header {

  display: flex; align-items: center; justify-content: space-between;

  gap: 10px; flex-wrap: wrap; margin-bottom: 4px;

}

.results-card-header .card-title { margin-bottom: 0; }

  

.results-hint {

  font-size: 0.74rem; color: var(--text-dim);

  margin-bottom: 6px; display: none;

}

  
  

/* ================================================================

   09  FORM — INPUTS & LABELS

   ================================================================ */

.form-fieldset { border: 0; padding: 0; }

.input-group   { margin-bottom: 18px; }

  

.input-label {

  display: block; font-size: 0.75rem; font-weight: 500;

  letter-spacing: 0.07em; text-transform: uppercase;

  color: var(--text-dim); margin-bottom: 7px;

}

  

input[type="text"] {

  width: 100%; padding: 13px 14px; border-radius: var(--r-md);

  border: 1px solid rgba(255,255,255,0.06); background: rgba(2,4,12,0.55);

  color: var(--text); font-family: var(--f-body); font-size: 1rem;

  font-weight: 400; outline: none; -webkit-appearance: none;

  transition: border-color var(--t-s) var(--ease), box-shadow var(--t-m) var(--ease), transform var(--t-s) var(--ease);

}

[data-theme="light"] input[type="text"] {

  border-color: rgba(0,0,0,0.10); background: rgba(255,255,255,0.75);

}

input::placeholder { color: rgba(168,180,196,0.25); }

input:focus {

  border-color: rgba(200,168,75,0.45);

  box-shadow:   0 0 0 3px rgba(200,168,75,0.07), 0 4px 20px rgba(200,168,75,0.06);

  transform:    translateY(-1px);

}

input.input-valid   { border-color: rgba(40,201,138,0.38); }

input.input-invalid { border-color: rgba(224,112,112,0.5); box-shadow: 0 0 0 3px rgba(224,112,112,0.07); }

  

.input-hint { font-size: 0.76rem; color: var(--text-dim); margin-top: 5px; line-height: 1.4; }

.error-msg  { min-height: 16px; font-size: 0.78rem; color: var(--danger); margin-top: 5px; line-height: 1.3; }

  
  

/* ================================================================

   10  BUTTONS

   ================================================================ */

.button-row {

  display: flex; gap: 10px; flex-wrap: wrap;

}

  

.btn {

  display: inline-flex; align-items: center; justify-content: center;

  gap: 7px; flex: 1; min-height: 44px; padding: 11px 14px;

  border-radius: var(--r-md); border: 1px solid transparent;

  font-family: var(--f-body); font-size: 0.88rem; font-weight: 600;

  letter-spacing: 0.03em; cursor: pointer; position: relative;

  overflow: hidden; -webkit-tap-highlight-color: transparent;

  transition: transform var(--t-s) var(--ease), box-shadow var(--t-m) var(--ease), opacity var(--t-s);

}

.btn--primary {

  background: linear-gradient(135deg, rgba(200,168,75,0.18), rgba(232,204,110,0.10) 50%, rgba(200,168,75,0.15));

  border-color: rgba(200,168,75,0.38); color: var(--gold-bright);

}

.btn--primary:hover:not(:disabled) {

  transform: translateY(-2px); box-shadow: 0 6px 28px rgba(200,168,75,0.22);

  border-color: rgba(200,168,75,0.58);

}

.btn--secondary {

  background: rgba(255,255,255,0.035); border-color: var(--border-dim); color: var(--text-mid);

}

.btn--secondary:hover:not(:disabled) {

  transform: translateY(-2px); background: rgba(255,255,255,0.06); border-color: var(--border-mid);

}

.btn--ghost {

  background: transparent; border-color: var(--border-dim);

  color: var(--text-dim); font-size: 0.8rem; flex: 0; padding: 7px 12px;

  min-height: 34px;

}

.btn--ghost:hover:not(:disabled) {

  border-color: var(--gold-border); color: var(--gold); transform: translateY(-1px);

}

.btn:disabled  { opacity: 0.35; cursor: not-allowed; }

.btn-icon      { font-size: 0.82rem; opacity: 0.8; }

  

[data-theme="light"] .btn--primary  { color: var(--gold); }

[data-theme="light"] .btn--secondary { background: rgba(0,0,0,0.04); }

  
  

/* ================================================================

   11  RESULTS — GRID & TILES

   ================================================================ */

.results-grid {

  display: grid; grid-template-columns: repeat(2, 1fr);

  gap: 10px; margin-top: 10px; align-items: start;

}

.results-grid--extra {

  margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-dim);

  grid-template-columns: repeat(2, 1fr);

}

.results-grid--extra:empty { display: none; }

  

.result-tile {

  display: flex; flex-direction: column; align-items: center;

  justify-content: flex-start; padding: 16px 12px 14px;

  border-radius: var(--r-lg); border: 1px solid var(--border-dim);

  background: var(--tile-bg); position: relative;

  overflow: visible; min-height: 130px; align-self: start;

  opacity: 0; transform: translateY(10px);

  transition: border-color var(--t-m) var(--ease), box-shadow var(--t-m) var(--ease), transform var(--t-m) var(--ease);

}

.result-tile::before {

  content: ''; position: absolute; inset: 0; opacity: 0;

  pointer-events: none; border-radius: inherit;

  transition: opacity var(--t-m) var(--ease);

}

.result-tile:hover::before  { opacity: 1; }

.result-tile.is-visible     { animation: tileIn 0.42s var(--ease) forwards; }

.results-grid--extra .result-tile { border-style: dashed; border-color: rgba(255,255,255,0.06); }

[data-theme="light"] .results-grid--extra .result-tile { border-color: rgba(0,0,0,0.08); }

  

.result-title {

  display: flex; align-items: center; justify-content: center;

  gap: 6px; font-size: 0.72rem; font-weight: 500; letter-spacing: 0.05em;

  text-transform: uppercase; color: var(--text-dim); text-align: center;

  margin-bottom: 10px; min-height: 18px; line-height: 1.3;

}

  

.result-value {

  font-family: var(--f-head); font-size: clamp(1.65rem, 4.5vw, 2.1rem);

  font-weight: 800; letter-spacing: 0.02em; line-height: 1;

  color: var(--text); margin: 0 auto 8px auto; width: fit-content; text-align: center;

}

  

.result-explanation {

  font-size: clamp(0.71rem, 1.8vw, 0.79rem); font-weight: 300;

  color: var(--text-dim); text-align: center; line-height: 1.4; min-height: 16px;

}

  
  

/* ================================================================

   12  TILE-AKZENTFARBEN

   ================================================================ */

.life-number        { border-color: var(--life-b); background: linear-gradient(160deg, rgba(40,201,138,0.06), var(--tile-bg) 55%); }

.life-number::before{ background: radial-gradient(ellipse 80% 60% at 20% 20%, var(--life-glow), transparent 65%); }

.life-number:hover  { box-shadow: 0 8px 32px var(--life-glow); border-color: rgba(40,201,138,0.45); transform: translateY(-3px); }

.life-number .result-value { color: var(--life); font-size: clamp(1.85rem, 5vw, 2.45rem); width: fit-content; margin: 0 auto 8px auto; }

  

.soul-number        { border-color: var(--soul-b); background: linear-gradient(160deg, rgba(78,168,232,0.06), var(--tile-bg) 55%); }

.soul-number::before{ background: radial-gradient(ellipse 80% 60% at 20% 20%, var(--soul-glow), transparent 65%); }

.soul-number:hover  { box-shadow: 0 8px 32px var(--soul-glow); border-color: rgba(78,168,232,0.45); transform: translateY(-3px); }

.soul-number .result-value { color: var(--soul); }

  

.expression-number        { border-color: var(--expr-b); background: linear-gradient(160deg, rgba(232,204,110,0.05), var(--tile-bg) 55%); }

.expression-number::before{ background: radial-gradient(ellipse 80% 60% at 20% 20%, var(--expr-glow), transparent 65%); }

.expression-number:hover  { box-shadow: 0 8px 32px var(--expr-glow); border-color: rgba(232,204,110,0.45); transform: translateY(-3px); }

.expression-number .result-value { color: var(--expr); }

  

.personality-number        { border-color: var(--pers-b); background: linear-gradient(160deg, rgba(176,125,232,0.06), var(--tile-bg) 55%); }

.personality-number::before{ background: radial-gradient(ellipse 80% 60% at 20% 20%, var(--pers-glow), transparent 65%); }

.personality-number:hover  { box-shadow: 0 8px 32px var(--pers-glow); border-color: rgba(176,125,232,0.45); transform: translateY(-3px); }

.personality-number .result-value { color: var(--pers); }

  
  

/* ================================================================

   13  MASTERZAHL & KARMISCHE SCHULD

   ================================================================ */

.result-value.master {

  color: var(--gold-bright) !important;

  text-shadow: 0 0 10px rgba(232,204,110,0.45), 0 0 28px rgba(232,204,110,0.18);

  animation: masterPulse 2.2s ease-in-out infinite alternate;

}

.karmic-debt-tile {

  border-color: var(--debt-border) !important; border-style: dashed !important;

  background: var(--debt-bg) !important;

}

.karmic-debt-tile .result-value { color: var(--danger); }

  
  

/* ================================================================

   13b  PLANES-TILE

   ================================================================ */

.planes-tile {

  grid-column: 1 / -1;

  padding: 18px 16px 16px;

  min-height: 0;

  cursor: pointer;

}

.planes-tile .result-title { margin-bottom: 14px; justify-content: flex-start; gap: 8px; }

.planes-tile .result-title span { font-size: 0.72rem; }

  

.planes-bars {

  display: flex; flex-direction: column; gap: 10px;

  width: 100%;

}

  

.plane-row {

  display: grid;

  grid-template-columns: 140px 1fr 52px;

  align-items: center;

  gap: 10px;

  opacity: 0.65;

  transition: opacity var(--t-s);

}

.plane-row--dominant { opacity: 1; }

.plane-row--dominant .plane-label { color: var(--text); font-weight: 600; }

  

.plane-meta {

  display: flex; flex-direction: column; gap: 2px; min-width: 0;

}

.plane-label {

  font-family: var(--f-head); font-size: 0.74rem; font-weight: 600;

  letter-spacing: 0.04em; color: var(--text-mid);

  white-space: nowrap;

}

.plane-short {

  font-size: 0.67rem; font-weight: 300; color: var(--text-dim);

  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;

}

  

.plane-track {

  height: 7px; border-radius: 4px;

  background: rgba(255,255,255,0.06); overflow: hidden;

}

[data-theme="light"] .plane-track { background: rgba(0,0,0,0.07); }

.plane-fill {

  height: 100%; border-radius: 4px;

  transition: width 0.7s cubic-bezier(0.22,0.61,0.36,1);

}

  

.plane-count {

  font-family: var(--f-head); font-size: 0.9rem; font-weight: 700;

  color: var(--text-mid); text-align: right; white-space: nowrap;

}

.plane-count small {

  font-family: var(--f-body); font-size: 0.62rem; font-weight: 300;

  opacity: 0.6;

}

  

.planes-dominant {

  margin-top: 14px; padding-top: 10px;

  border-top: 1px solid var(--border-dim);

  font-size: 0.72rem; font-weight: 400; color: var(--gold);

  letter-spacing: 0.03em; text-align: center;

}

  

/* Mobile: kompaktere Spalten */

@media (max-width: 479px) {

  .plane-row { grid-template-columns: 110px 1fr 44px; gap: 8px; }

  .plane-short { display: none; }

  .plane-meta { flex-direction: row; align-items: center; gap: 6px; }

}

  

/* Modal-spezifische Planes-Styles */

.modal-planes { display: flex; flex-direction: column; gap: 16px; margin-bottom: 4px; }

.modal-plane-row {

  padding: 12px 14px; border-radius: var(--r-md);

  background: rgba(255,255,255,0.025); border: 1px solid var(--border-dim);

  transition: border-color var(--t-s);

}

.modal-plane-row--dom {

  background: rgba(200,168,75,0.05); border-color: var(--gold-border);

}

[data-theme="light"] .modal-plane-row { background: rgba(0,0,0,0.025); }

[data-theme="light"] .modal-plane-row--dom { background: rgba(139,108,20,0.06); border-color: var(--gold-border); }

  

.modal-plane-header {

  display: flex; justify-content: space-between; align-items: center;

  margin-bottom: 8px;

}

.modal-plane-label {

  font-family: var(--f-head); font-size: 0.78rem; font-weight: 700;

  letter-spacing: 0.06em; color: var(--text);

}

.modal-plane-num {

  font-family: var(--f-head); font-size: 0.88rem; font-weight: 700;

  color: var(--text-mid);

}

.modal-plane-num small { font-family: var(--f-body); font-size: 0.68rem; opacity: 0.6; }

.modal-plane-track {

  height: 6px; border-radius: 3px;

  background: rgba(255,255,255,0.06); overflow: hidden; margin-bottom: 10px;

}

[data-theme="light"] .modal-plane-track { background: rgba(0,0,0,0.07); }

.modal-plane-fill {

  height: 100%; border-radius: 3px;

  transition: width 0.65s cubic-bezier(0.22,0.61,0.36,1);

}

.modal-plane-desc {

  font-size: 0.8rem; font-weight: 300; color: var(--text-mid);

  line-height: 1.55; margin: 0;

}

.modal-value--plane {

  font-family: var(--f-head); font-size: 1.6rem !important; font-weight: 800;

  color: var(--gold-bright); line-height: 1.2; text-align: center;

}

  
  

/* ================================================================

   14  GRID-SECTION-LABEL

   ================================================================ */

.grid-section-label {

  grid-column: 1 / -1; text-align: center; font-size: 0.68rem;

  font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;

  color: var(--gold-bright); opacity: 0.7; padding: 10px 0 4px;

  border-top: 1px solid var(--border-dim); margin-top: 4px;

}

  
  

/* ================================================================

   15  ERGEBNIS-AKTIONEN

   ================================================================ */

.result-actions {

  display: flex; gap: 8px; align-items: center; flex-wrap: wrap;

}

  
  

/* ================================================================

   16  TOOLTIP

   ================================================================ */

.tooltip-btn {

  display: inline-flex; align-items: center; justify-content: center;

  flex-shrink: 0; width: 16px; height: 16px; padding: 0;

  border: 1px solid rgba(255,255,255,0.09); border-radius: 50%;

  background: rgba(255,255,255,0.04); color: var(--text-dim);

  font-family: var(--f-body); font-size: 0.58rem; cursor: help;

  position: relative; -webkit-tap-highlight-color: transparent;

  transition: border-color var(--t-s), color var(--t-s), background var(--t-s);

}

.tooltip-btn:hover, .tooltip-btn:focus-visible {

  border-color: rgba(200,168,75,0.45); color: var(--gold); background: rgba(200,168,75,0.08);

}

.tooltip-btn::after {

  content: attr(data-tooltip); position: absolute;

  bottom: calc(100% + 8px); left: 50%;

  transform: translateX(-50%) translateY(5px);

  width: max-content; max-width: min(210px, 80vw);

  white-space: normal; text-align: left;

  background: rgba(4,6,16,0.97); color: var(--text-mid);

  font-family: var(--f-body); font-size: 0.73rem; font-weight: 400;

  line-height: 1.45; padding: 7px 10px; border-radius: var(--r-sm);

  border: 1px solid rgba(200,168,75,0.15); box-shadow: 0 8px 30px rgba(2,4,12,0.85);

  opacity: 0; pointer-events: none; z-index: 200;

  transition: opacity var(--t-m) var(--ease), transform var(--t-m) var(--ease);

}

.tooltip-btn:hover::after, .tooltip-btn:focus-visible::after {

  opacity: 1; transform: translateX(-50%) translateY(0);

}

[data-theme="light"] .tooltip-btn::after {

  background: rgba(248,243,232,0.99); border-color: rgba(139,108,20,0.20);

  box-shadow: 0 8px 30px rgba(100,80,30,0.20);

}

  
  

/* ================================================================

   17  MODAL

   ================================================================ */

.detail-modal {

  position: fixed; inset: 0; margin: auto;

  width: min(520px, 92vw); max-height: 88vh;

  padding: 0; border: 1px solid var(--modal-border);

  border-radius: var(--r-lg); background: var(--modal-bg);

  box-shadow: var(--sh-modal); overflow-y: auto;

  z-index: 500;

  animation: modalIn 0.28s var(--ease) forwards;

}

.detail-modal::backdrop {

  background: rgba(2, 4, 12, 0.75);

  -webkit-backdrop-filter: blur(4px);

  backdrop-filter: blur(4px);

}

[data-theme="light"] .detail-modal::backdrop {

  background: rgba(80, 60, 20, 0.45);

}

  

.modal-inner {

  padding: 28px 24px 32px; position: relative;

}

  

.modal-close {

  position: absolute; top: 16px; right: 16px;

  width: 30px; height: 30px; border-radius: 50%;

  border: 1px solid var(--border-mid); background: var(--surface);

  color: var(--text-mid); font-size: 0.8rem; cursor: pointer;

  display: flex; align-items: center; justify-content: center;

  -webkit-tap-highlight-color: transparent;

  transition: border-color var(--t-s), color var(--t-s);

}

.modal-close:hover { border-color: var(--gold-border); color: var(--gold); }

  

.modal-top {

  display: flex; flex-direction: column; align-items: center;

  gap: 6px; margin-bottom: 20px; padding-bottom: 20px;

  border-bottom: 1px solid var(--border-dim);

}

.modal-icon {

  font-size: 2rem; color: var(--gold); line-height: 1;

  animation: starSpin 8s linear infinite;

}

.modal-type {

  font-family: var(--f-head); font-size: 0.7rem; font-weight: 700;

  letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-dim);

}

.modal-value {

  font-family: var(--f-head); font-size: 3.2rem; font-weight: 800;

  color: var(--gold-bright); line-height: 1; text-align: center;

  width: fit-content; margin: 0 auto;

}

.modal-value.master {

  animation: masterPulse 2s ease-in-out infinite alternate;

  text-shadow: 0 0 16px rgba(232,204,110,0.5);

}

.modal-short {

  font-size: 0.88rem; font-weight: 500; color: var(--text);

  text-align: center; margin-bottom: 12px; line-height: 1.5;

}

.modal-extended {

  font-size: 0.88rem; font-weight: 300; color: var(--text-mid);

  line-height: 1.65; margin-bottom: 20px; text-align: center;

}

.modal-calc-box {

  display: flex; flex-direction: column; gap: 4px;

  background: rgba(255,255,255,0.025); border: 1px solid var(--border-dim);

  border-radius: var(--r-sm); padding: 10px 14px;

}

[data-theme="light"] .modal-calc-box { background: rgba(0,0,0,0.03); }

.modal-calc-label {

  font-size: 0.65rem; font-weight: 700; letter-spacing: 0.12em;

  text-transform: uppercase; color: var(--gold); opacity: 0.8;

}

.modal-calc {

  font-size: 0.82rem; color: var(--text-mid); line-height: 1.5;

}

  
  

/* ================================================================

   18  VERGLEICH / KOMPATIBILITÄT

   ================================================================ */

.compare-card {

  padding: 22px 18px 24px;

  background: linear-gradient(160deg, var(--card-bg-1), var(--card-bg-2));

}

  

.compare-inputs {

  display: grid; grid-template-columns: 1fr auto 1fr;

  gap: 16px; align-items: start; margin-bottom: 18px;

}

  

.compare-person-label {

  font-family: var(--f-head); font-size: 0.68rem; font-weight: 700;

  letter-spacing: 0.12em; text-transform: uppercase;

  color: var(--gold); opacity: 0.8; margin-bottom: 12px;

}

  

.compare-divider {

  font-size: 1.4rem; color: var(--gold); opacity: 0.5;

  align-self: center; text-align: center; padding-top: 28px;

}

  

/* Kompatibilitäts-Ergebnisse */

.compat-header {

  display: flex; flex-direction: column; align-items: center;

  gap: 6px; margin-bottom: 20px; padding-bottom: 16px;

  border-bottom: 1px solid var(--border-dim); text-align: center;

}

.compat-names {

  font-family: var(--f-head); font-size: 1rem; font-weight: 700;

  color: var(--text); letter-spacing: 0.02em;

}

.compat-names span { color: var(--gold); margin: 0 6px; }

.compat-overall   { display: flex; align-items: center; gap: 10px; }

.compat-score     { font-family: var(--f-head); font-size: 2.2rem; font-weight: 800; color: var(--gold-bright); }

.compat-label-big { font-size: 0.9rem; color: var(--text-mid); }

  

.compat-rows { display: flex; flex-direction: column; gap: 10px; }

.compat-row {

  display: grid; grid-template-columns: 100px 48px 1fr 42px;

  align-items: center; gap: 10px;

}

.compat-label { font-size: 0.8rem; color: var(--text-mid); }

.compat-nums  { font-family: var(--f-head); font-size: 0.82rem; color: var(--text-dim); text-align: center; }

.compat-bar-wrap { height: 8px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden; }

[data-theme="light"] .compat-bar-wrap { background: rgba(0,0,0,0.08); }

.compat-bar   { height: 100%; border-radius: 4px; transition: width 0.8s var(--ease); }

.compat-pct   { font-size: 0.8rem; font-weight: 600; color: var(--text-mid); text-align: right; }

  

.compare-error { color: var(--danger); font-size: 0.85rem; margin-top: 12px; text-align: center; }

  
  

/* ================================================================

   19  TOAST

   ================================================================ */

.toast {

  position: fixed; bottom: 28px; left: 50%;

  transform: translateX(-50%) translateY(20px);

  background: rgba(10,14,26,0.97); color: var(--text);

  border: 1px solid var(--gold-border); border-radius: var(--r-md);

  padding: 10px 18px; font-size: 0.85rem; z-index: 600;

  opacity: 0; pointer-events: none;

  transition: opacity var(--t-m) var(--ease), transform var(--t-m) var(--ease);

  box-shadow: 0 8px 28px rgba(2,4,12,0.7);

}

[data-theme="light"] .toast { background: rgba(248,243,232,0.99); }

.toast--show {

  opacity: 1; transform: translateX(-50%) translateY(0);

}

  
  

/* ================================================================

   20  FOOTER

   ================================================================ */

.site-footer {

  font-size: 0.72rem; font-weight: 300; letter-spacing: 0.06em;

  color: var(--text-dim); text-align: center;

  position: relative; z-index: 2; opacity: 0.65;

}

  
  

/* ================================================================

   21  KEYFRAMES

   ================================================================ */

@keyframes tileIn {

  from { opacity: 0; transform: translateY(10px); }

  to   { opacity: 1; transform: translateY(0); }

}

@keyframes masterPulse {

  from { filter: drop-shadow(0 0 4px  rgba(232,204,110,0.4)); }

  to   { filter: drop-shadow(0 0 16px rgba(232,204,110,0.7)); }

}

@keyframes modalIn {

  from { opacity: 0; transform: scale(0.95) translateY(10px); }

  to   { opacity: 1; transform: scale(1)    translateY(0); }

}

@keyframes orbDrift1 {

  from { transform: translate(0, 0) scale(1); }

  to   { transform: translate(24px, 16px) scale(1.06); }

}

@keyframes orbDrift2 {

  from { transform: translate(0, 0) scale(1); }

  to   { transform: translate(-20px, -12px) scale(1.05); }

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

  

/* ≥ 480px */

@media (min-width: 480px) {

  body { gap: 24px; }

  .form-card    { padding: 26px 24px 22px; }

  .results-card { padding: 22px 20px; }

  .results-grid { gap: 12px; }

  .result-tile  { padding: 18px 14px 16px; min-height: 140px; align-self: start; }

  .bg-orb--1    { width: 420px; height: 420px; filter: blur(60px); }

  .bg-orb--2    { width: 360px; height: 360px; filter: blur(65px); }

  .results-hint { display: block; }

}

  

/* ≥ 640px */

@media (min-width: 640px) {

  body { padding: 40px 28px max(64px, env(safe-area-inset-bottom, 64px)); gap: 28px; }

  .container    { gap: 18px; }

  .form-card    { padding: 28px 26px 24px; }

  .results-card { padding: 24px 22px; }

  .results-grid { gap: 13px; margin-top: 12px; }

  .result-tile  { padding: 20px 16px 18px; min-height: 148px; align-self: start; }

}

  

/* ≥ 900px — 2-spaltig Form+Ergebnisse, 3-spaltig Extra-Tiles */

@media (min-width: 900px) {

  body { padding: 52px 32px max(72px, env(safe-area-inset-bottom, 72px)); gap: 32px; }

  .container    { grid-template-columns: 300px 1fr; gap: 22px; }

  .form-card    { padding: 30px 26px 26px; }

  .results-card { padding: 26px 22px; }

  .results-grid { gap: 14px; margin-top: 12px; }

  .results-grid--extra { grid-template-columns: repeat(3, 1fr); }

  .result-tile  { padding: 22px 16px 18px; min-height: 148px; align-self: start; }

  .bg-orb--1    { width: 580px; height: 580px; filter: blur(70px); }

  .bg-orb--2    { width: 480px; height: 480px; filter: blur(75px); }

  .compare-card { padding: 26px 28px 28px; }

}

  

/* Schmale Phones — Vergleich stapeln */

@media (max-width: 500px) {

  .compare-inputs {

    grid-template-columns: 1fr;

  }

  .compare-divider { display: none; }

  .compat-row {

    grid-template-columns: 90px 40px 1fr 38px;

    gap: 6px;

  }

}

  
  

/* ================================================================

   23  PRINT-STYLES

   ================================================================ */

@media print {

  body {

    background: #fff !important; color: #000 !important;

    padding: 0 !important; gap: 0 !important;

  }

  .bg-orb, .site-header .site-subtitle, .form-card,

  .result-actions, .compare-card, .theme-toggle,

  .site-footer, .tooltip-btn, .results-hint { display: none !important; }

  

  .site-header   { margin-bottom: 12px; }

  .site-title    {

    -webkit-text-fill-color: #000 !important; color: #000 !important;

    background: none !important; animation: none !important;

  }

  .card          { border: 1px solid #ccc !important; box-shadow: none !important; background: #fff !important; }

  .result-tile   {

    border: 1px solid #ccc !important; background: #fff !important;

    opacity: 1 !important; transform: none !important; break-inside: avoid;

  }

  .result-value  { color: #000 !important; text-shadow: none !important; animation: none !important; }

  .result-value.master { color: #886600 !important; }

  .results-grid  { gap: 8px !important; }

  .grid-section-label { color: #000 !important; border-color: #ccc !important; }

  .container     { grid-template-columns: 1fr !important; }

  .header-icon   { animation: none !important; }

}

  
  

/* ================================================================

   24  ACCESSIBILITY

   ================================================================ */

:focus-visible {

  outline: 2px solid rgba(200,168,75,0.65);

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