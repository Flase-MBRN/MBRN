/* ================================================================

   style.css — Numerologie-Rechner v3.0

   Palette: Schwarz · Anthrazit · Dunkel-Violett

   Stil: Void Dark × Violet — tief, ruhig, futuristisch

   ================================================================ */

  
  

/* ================================================================

   01  DESIGN TOKENS

   ================================================================ */

:root {

  --bg:          #06070f;

  --tile-bg:     rgba(9, 10, 20, 0.94);

  --surface:     rgba(255, 255, 255, 0.028);

  --border-dim:  rgba(120, 90, 200, 0.10);

  --border-mid:  rgba(140, 110, 220, 0.20);

  --card-bg-1:   rgba(11, 12, 24, 0.97);

  --card-bg-2:   rgba(7, 8, 16, 0.99);

  

  --violet:        #7b5ea7;

  --violet-bright: #a07fd4;

  --violet-dim:    rgba(123, 94, 167, 0.10);

  --violet-border: rgba(123, 94, 167, 0.24);

  --violet-glow:   rgba(100, 70, 160, 0.18);

  

  --text:        #cdd0de;

  --text-mid:    #7e87a2;

  --text-dim:    rgba(140, 150, 180, 0.38);

  

  --life:      #8a6dc8;

  --life-glow: rgba(138, 109, 200, 0.18);

  --life-b:    rgba(138, 109, 200, 0.22);

  

  --soul:      #6282c0;

  --soul-glow: rgba(98, 130, 192, 0.18);

  --soul-b:    rgba(98, 130, 192, 0.22);

  

  --expr:      #a07cd6;

  --expr-glow: rgba(160, 124, 214, 0.16);

  --expr-b:    rgba(160, 124, 214, 0.22);

  

  --pers:      #6a5cb8;

  --pers-glow: rgba(106, 92, 184, 0.18);

  --pers-b:    rgba(106, 92, 184, 0.22);

  

  --danger:      #b06060;

  --debt-bg:     rgba(160, 70, 70, 0.05);

  --debt-border: rgba(160, 80, 80, 0.25);

  

  --modal-bg:     rgba(7, 8, 18, 0.99);

  --modal-border: rgba(100, 70, 160, 0.18);

  

  --f-head: 'Syne',   'Segoe UI', sans-serif;

  --f-body: 'Outfit', 'Segoe UI', sans-serif;

  

  --r-lg:  14px;

  --r-md:  9px;

  --r-sm:  6px;

  --max-w: 900px;

  

  --sh-card:  0 24px 64px rgba(2, 3, 10, 0.72), 0 4px 18px rgba(2, 3, 10, 0.44);

  --sh-modal: 0 32px 90px rgba(0, 0, 0, 0.88);

  

  --ease: cubic-bezier(0.22, 0.61, 0.36, 1);

  --t-s:  0.15s;

  --t-m:  0.26s;

}

  

[data-theme="light"] {

  --bg:          #f0f0f5;

  --tile-bg:     rgba(248, 248, 254, 0.93);

  --surface:     rgba(0, 0, 0, 0.022);

  --border-dim:  rgba(90, 60, 150, 0.10);

  --border-mid:  rgba(90, 60, 150, 0.18);

  --card-bg-1:   rgba(244, 244, 252, 0.97);

  --card-bg-2:   rgba(238, 238, 248, 0.98);

  

  --violet:        #5a3f8a;

  --violet-bright: #7455b0;

  --violet-dim:    rgba(90, 63, 138, 0.08);

  --violet-border: rgba(90, 63, 138, 0.22);

  --violet-glow:   rgba(90, 63, 138, 0.10);

  

  --text:        #1c1828;

  --text-mid:    #4e4870;

  --text-dim:    rgba(60, 55, 95, 0.44);

  

  --life:      #5a4498;

  --life-glow: rgba(90, 68, 152, 0.12);

  --life-b:    rgba(90, 68, 152, 0.20);

  

  --soul:      #3a5a9a;

  --soul-glow: rgba(58, 90, 154, 0.12);

  --soul-b:    rgba(58, 90, 154, 0.20);

  

  --expr:      #6a4aae;

  --expr-glow: rgba(106, 74, 174, 0.12);

  --expr-b:    rgba(106, 74, 174, 0.20);

  

  --pers:      #4a3e98;

  --pers-glow: rgba(74, 62, 152, 0.12);

  --pers-b:    rgba(74, 62, 152, 0.20);

  

  --danger:      #9a3a3a;

  --debt-bg:     rgba(154, 58, 58, 0.05);

  --debt-border: rgba(154, 58, 58, 0.22);

  

  --modal-bg:     rgba(240, 240, 248, 0.99);

  --modal-border: rgba(90, 63, 138, 0.16);

  

  --sh-card:  0 12px 40px rgba(40, 30, 80, 0.10), 0 2px 10px rgba(40, 30, 80, 0.06);

  --sh-modal: 0 20px 64px rgba(40, 30, 80, 0.18);

}

  
  

/* ================================================================

   02  RESET

   ================================================================ */

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { -webkit-text-size-adjust: 100%; scroll-behavior: smooth; }

  
  

/* ================================================================

   03  BODY

   ================================================================ */

body {

  font-family: var(--f-body);

  font-size: 1rem;

  line-height: 1.6;

  color: var(--text-mid);

  background-color: var(--bg);

  -webkit-font-smoothing: antialiased;

  -moz-osx-font-smoothing: grayscale;

  background-image:

    radial-gradient(ellipse 80% 55% at 15% 8%,   rgba(80, 50, 140, 0.07)  0%, transparent 55%),

    radial-gradient(ellipse 60% 45% at 88% 92%,  rgba(50, 40, 110, 0.06)  0%, transparent 55%),

    radial-gradient(ellipse 45% 60% at 50% 50%,  rgba(60, 40, 100, 0.04)  0%, transparent 60%),

    radial-gradient(ellipse 70% 40% at 50% 100%, rgba(40, 28, 80,  0.05)  0%, transparent 50%);

  min-height: 100vh;

  padding: max(28px, env(safe-area-inset-top, 28px)) 14px max(56px, env(safe-area-inset-bottom, 56px));

  display: flex;

  flex-direction: column;

  align-items: center;

  gap: 20px;

  overflow-x: hidden;

  transition: background-color var(--t-m) var(--ease), color var(--t-m) var(--ease);

}

[data-theme="light"] body {

  background-image:

    radial-gradient(ellipse 80% 55% at 15% 8%,  rgba(80, 50, 140, 0.05) 0%, transparent 55%),

    radial-gradient(ellipse 60% 45% at 88% 92%, rgba(50, 40, 110, 0.04) 0%, transparent 55%),

    radial-gradient(ellipse 45% 60% at 50% 50%, rgba(60, 40, 100, 0.03) 0%, transparent 60%);

}

  
  

/* ================================================================

   04  HINTERGRUND-ORBS

   ================================================================ */

.bg-orb {

  position: fixed; border-radius: 50%;

  pointer-events: none; z-index: 0; filter: blur(60px); mix-blend-mode: screen;

}

.bg-orb--1 {

  width: 360px; height: 360px;

  background: radial-gradient(circle, rgba(80, 45, 150, 0.10), rgba(50, 28, 100, 0.06) 45%, transparent 70%);

  top: -130px; left: -110px;

  animation: orbDrift1 28s ease-in-out infinite alternate;

}

.bg-orb--2 {

  width: 300px; height: 300px;

  background: radial-gradient(circle, rgba(55, 38, 120, 0.09), rgba(35, 22, 80, 0.05) 45%, transparent 70%);

  bottom: -90px; right: -90px;

  animation: orbDrift2 34s ease-in-out infinite alternate;

}

[data-theme="light"] .bg-orb { opacity: 0.35; mix-blend-mode: normal; }

  
  

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

.site-header { text-align: center; position: relative; z-index: 2; width: 100%; max-width: var(--max-w); }

.header-inner { display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap; margin-bottom: 6px; }

  

.header-icon {

  font-size: 1.1rem; color: var(--violet); flex-shrink: 0; opacity: 0.7;

  animation: starSpin 20s linear infinite; display: inline-block;

}

.site-title {

  font-family: var(--f-head);

  font-size: clamp(1.3rem, 5vw, 1.9rem);

  font-weight: 700;

  letter-spacing: 0.015em;

  background: linear-gradient(120deg, var(--text) 30%, var(--violet-bright) 52%, var(--text) 72%);

  background-size: 240% 100%;

  -webkit-background-clip: text;

  -webkit-text-fill-color: transparent;

  background-clip: text;

  animation: shimmer 12s ease-in-out infinite alternate;

}

[data-theme="light"] .site-title {

  background: linear-gradient(120deg, var(--text) 30%, var(--violet) 52%, var(--text) 72%);

  background-size: 240% 100%;

  -webkit-background-clip: text;

  background-clip: text;

  animation: shimmer 12s ease-in-out infinite alternate;

}

.version-badge {

  font-family: var(--f-body); font-size: 0.65rem; font-weight: 600;

  letter-spacing: 0.12em; text-transform: uppercase;

  color: rgba(130, 100, 180, 0.65); background: rgba(100, 70, 160, 0.07);

  border: 1px solid rgba(110, 80, 160, 0.18); padding: 2px 8px;

  border-radius: 20px; flex-shrink: 0;

}

.site-subtitle { font-size: clamp(0.73rem, 2.2vw, 0.83rem); font-weight: 300; color: var(--text-dim); letter-spacing: 0.03em; }

  

.theme-toggle {

  width: 30px; height: 30px; border-radius: 50%;

  border: 1px solid var(--border-dim); background: var(--surface);

  color: var(--text-mid); font-size: 0.88rem; cursor: pointer;

  display: inline-flex; align-items: center; justify-content: center;

  flex-shrink: 0; -webkit-tap-highlight-color: transparent;

  transition: border-color var(--t-s), background var(--t-s), transform var(--t-s);

}

.theme-toggle:hover { border-color: var(--violet-border); color: var(--violet-bright); transform: scale(1.08); }

  
  

/* ================================================================

   07  LAYOUT

   ================================================================ */

.content { width: 100%; display: flex; flex-direction: column; align-items: center; position: relative; z-index: 2; gap: 14px; }

.container { width: 100%; max-width: var(--max-w); display: grid; grid-template-columns: 1fr; gap: 14px; align-items: start; }

.container--full { grid-template-columns: 1fr; }

@media (min-width: 540px) and (max-width: 899px) { .container, .container--full { max-width: 620px; } }

  
  

/* ================================================================

   08  CARDS

   ================================================================ */

.card {

  border-radius: var(--r-lg); border: 1px solid var(--border-dim);

  box-shadow: var(--sh-card); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);

  position: relative; z-index: 1; overflow: visible;

  transition: border-color var(--t-m) var(--ease), background var(--t-m) var(--ease);

}

.card::before {

  content: ''; position: absolute; top: 0; left: 12%; right: 12%; height: 1px;

  background: linear-gradient(90deg, transparent, rgba(100, 70, 160, 0.30) 20%, rgba(130, 95, 190, 0.45) 50%, rgba(100, 70, 160, 0.30) 80%, transparent);

  opacity: 0.8;

}

.card:hover { border-color: rgba(110, 80, 180, 0.18); }

  

.card-title {

  font-family: var(--f-head); font-size: 0.63rem; font-weight: 700;

  letter-spacing: 0.20em; text-transform: uppercase;

  color: rgba(110, 85, 170, 0.55); margin-bottom: 18px;

}

[data-theme="light"] .card-title { color: rgba(80, 55, 130, 0.60); }

  

.form-card    { padding: 22px 18px 20px; background: linear-gradient(155deg, var(--card-bg-1), var(--card-bg-2)); }

.results-card { padding: 20px 16px; min-height: 160px; background: linear-gradient(148deg, var(--card-bg-1), var(--card-bg-2)); }

.results-card-header { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; margin-bottom: 4px; }

.results-card-header .card-title { margin-bottom: 0; }

.results-hint { font-size: 0.72rem; color: var(--text-dim); margin-bottom: 6px; display: none; letter-spacing: 0.02em; }

  
  

/* ================================================================

   09  INPUTS

   ================================================================ */

.form-fieldset { border: 0; padding: 0; }

.input-group   { margin-bottom: 18px; }

.input-label { display: block; font-size: 0.72rem; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-dim); margin-bottom: 7px; }

  

input[type="text"] {

  width: 100%; padding: 13px 14px; border-radius: var(--r-md);

  border: 1px solid rgba(100, 70, 150, 0.12); background: rgba(4, 5, 14, 0.60);

  color: var(--text); font-family: var(--f-body); font-size: 1rem; font-weight: 400;

  outline: none; -webkit-appearance: none;

  transition: border-color var(--t-s) var(--ease), box-shadow var(--t-m) var(--ease), transform var(--t-s) var(--ease);

}

[data-theme="light"] input[type="text"] { border-color: rgba(90, 60, 140, 0.12); background: rgba(255, 255, 255, 0.72); }

input::placeholder { color: rgba(110, 118, 150, 0.28); }

input:focus {

  border-color: rgba(110, 78, 175, 0.38);

  box-shadow: 0 0 0 3px rgba(90, 58, 155, 0.08), 0 4px 20px rgba(70, 42, 130, 0.08);

  transform: translateY(-1px);

}

input.input-valid   { border-color: rgba(100, 80, 180, 0.32); }

input.input-invalid { border-color: rgba(160, 70, 70, 0.44); box-shadow: 0 0 0 3px rgba(140, 60, 60, 0.06); }

.input-hint { font-size: 0.74rem; color: var(--text-dim); margin-top: 5px; line-height: 1.4; }

.error-msg  { min-height: 16px; font-size: 0.76rem; color: var(--danger); margin-top: 5px; line-height: 1.3; }

  
  

/* ================================================================

   10  BUTTONS

   ================================================================ */

.button-row { display: flex; gap: 10px; flex-wrap: wrap; }

  

.btn {

  display: inline-flex; align-items: center; justify-content: center;

  gap: 7px; flex: 1; min-height: 44px; padding: 11px 14px;

  border-radius: var(--r-md); border: 1px solid transparent;

  font-family: var(--f-body); font-size: 0.86rem; font-weight: 600; letter-spacing: 0.03em;

  cursor: pointer; position: relative; overflow: hidden; -webkit-tap-highlight-color: transparent;

  transition: transform var(--t-s) var(--ease), box-shadow var(--t-m) var(--ease), opacity var(--t-s);

}

.btn--primary {

  background: linear-gradient(135deg, rgba(90, 58, 155, 0.16), rgba(70, 44, 130, 0.08) 50%, rgba(90, 58, 155, 0.14));

  border-color: rgba(100, 68, 175, 0.30); color: var(--violet-bright);

}

.btn--primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 28px rgba(80, 50, 150, 0.18); border-color: rgba(120, 88, 195, 0.44); }

.btn--secondary { background: rgba(255,255,255,0.030); border-color: var(--border-dim); color: var(--text-mid); }

.btn--secondary:hover:not(:disabled) { transform: translateY(-2px); background: rgba(255,255,255,0.05); border-color: var(--border-mid); }

.btn--ghost { background: transparent; border-color: var(--border-dim); color: var(--text-dim); font-size: 0.78rem; flex: 0; padding: 7px 12px; min-height: 34px; }

.btn--ghost:hover:not(:disabled) { border-color: var(--violet-border); color: var(--violet-bright); transform: translateY(-1px); }

.btn:disabled { opacity: 0.30; cursor: not-allowed; }

.btn-icon { font-size: 0.80rem; opacity: 0.75; }

[data-theme="light"] .btn--secondary { background: rgba(0,0,0,0.03); }

  
  

/* ================================================================

   11  RESULTS GRID & TILES

   ================================================================ */

.results-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 10px; align-items: start; }

.results-grid--extra { margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(90, 60, 150, 0.08); grid-template-columns: repeat(2, 1fr); }

.results-grid--extra:empty { display: none; }

  

.result-tile {

  display: flex; flex-direction: column; align-items: center; justify-content: flex-start;

  padding: 16px 12px 14px; border-radius: var(--r-lg); border: 1px solid var(--border-dim);

  background: var(--tile-bg); position: relative; overflow: visible; min-height: 130px; align-self: start;

  opacity: 0; transform: translateY(10px);

  transition: border-color var(--t-m) var(--ease), box-shadow var(--t-m) var(--ease), transform var(--t-m) var(--ease);

}

.result-tile::before { content: ''; position: absolute; inset: 0; opacity: 0; pointer-events: none; border-radius: inherit; transition: opacity var(--t-m) var(--ease); }

.result-tile:hover::before { opacity: 1; }

.result-tile.is-visible { animation: tileIn 0.40s var(--ease) forwards; }

.results-grid--extra .result-tile { border-color: rgba(90, 60, 140, 0.08); }

[data-theme="light"] .results-grid--extra .result-tile { border-color: rgba(90, 60, 140, 0.10); }

  

.result-title {

  display: flex; align-items: center; justify-content: center; gap: 6px;

  font-size: 0.70rem; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase;

  color: var(--text-dim); text-align: center; margin-bottom: 10px; min-height: 18px; line-height: 1.3;

}

.result-value {

  font-family: var(--f-head); font-size: clamp(1.6rem, 4.5vw, 2.0rem); font-weight: 800;

  letter-spacing: 0.02em; line-height: 1; color: var(--text); margin: 0 auto 8px auto; width: fit-content; text-align: center;

}

.result-explanation { font-size: clamp(0.70rem, 1.7vw, 0.77rem); font-weight: 300; color: var(--text-dim); text-align: center; line-height: 1.4; min-height: 16px; }

  
  

/* ================================================================

   12  TILE-AKZENTFARBEN

   ================================================================ */

.life-number { border-color: var(--life-b); background: linear-gradient(158deg, rgba(100, 72, 184, 0.07), var(--tile-bg) 55%); }

.life-number::before { background: radial-gradient(ellipse 80% 60% at 20% 20%, var(--life-glow), transparent 66%); }

.life-number:hover { box-shadow: 0 8px 32px var(--life-glow); border-color: rgba(138, 109, 200, 0.36); transform: translateY(-3px); }

.life-number .result-value { color: var(--life); font-size: clamp(1.8rem, 5vw, 2.35rem); width: fit-content; margin: 0 auto 8px auto; }

  

.soul-number { border-color: var(--soul-b); background: linear-gradient(158deg, rgba(70, 100, 175, 0.07), var(--tile-bg) 55%); }

.soul-number::before { background: radial-gradient(ellipse 80% 60% at 20% 20%, var(--soul-glow), transparent 66%); }

.soul-number:hover { box-shadow: 0 8px 32px var(--soul-glow); border-color: rgba(98, 130, 192, 0.38); transform: translateY(-3px); }

.soul-number .result-value { color: var(--soul); }

  

.expression-number { border-color: var(--expr-b); background: linear-gradient(158deg, rgba(140, 90, 200, 0.06), var(--tile-bg) 55%); }

.expression-number::before { background: radial-gradient(ellipse 80% 60% at 20% 20%, var(--expr-glow), transparent 66%); }

.expression-number:hover { box-shadow: 0 8px 32px var(--expr-glow); border-color: rgba(160, 124, 214, 0.38); transform: translateY(-3px); }

.expression-number .result-value { color: var(--expr); }

  

.personality-number { border-color: var(--pers-b); background: linear-gradient(158deg, rgba(80, 65, 170, 0.07), var(--tile-bg) 55%); }

.personality-number::before { background: radial-gradient(ellipse 80% 60% at 20% 20%, var(--pers-glow), transparent 66%); }

.personality-number:hover { box-shadow: 0 8px 32px var(--pers-glow); border-color: rgba(106, 92, 184, 0.38); transform: translateY(-3px); }

.personality-number .result-value { color: var(--pers); }

  
  

/* ================================================================

   13  MASTER & KARMIC DEBT

   ================================================================ */

.result-value.master {

  color: var(--violet-bright) !important;

  text-shadow: 0 0 12px rgba(140, 100, 210, 0.38), 0 0 30px rgba(110, 75, 180, 0.14);

  animation: masterPulse 2.6s ease-in-out infinite alternate;

}

.karmic-debt-tile { border-color: var(--debt-border) !important; border-style: dashed !important; background: var(--debt-bg) !important; }

.karmic-debt-tile .result-value { color: var(--danger); }

  
  

/* ================================================================

   13b  PLANES-TILE

   ================================================================ */

.planes-tile { grid-column: 1 / -1; padding: 18px 16px 16px; min-height: 0; cursor: pointer; }

.planes-tile .result-title { margin-bottom: 14px; justify-content: flex-start; gap: 8px; }

.planes-tile .result-title span { font-size: 0.70rem; }

.planes-bars { display: flex; flex-direction: column; gap: 10px; width: 100%; }

  

.plane-row { display: grid; grid-template-columns: 140px 1fr 52px; align-items: center; gap: 10px; opacity: 0.60; transition: opacity var(--t-s); }

.plane-row--dominant { opacity: 1; }

.plane-row--dominant .plane-label { color: var(--text); font-weight: 600; }

  

.plane-meta { display: flex; flex-direction: column; gap: 2px; min-width: 0; }

.plane-label { font-family: var(--f-head); font-size: 0.72rem; font-weight: 600; letter-spacing: 0.04em; color: var(--text-mid); white-space: nowrap; }

.plane-short { font-size: 0.65rem; font-weight: 300; color: var(--text-dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  

.plane-track { height: 6px; border-radius: 3px; background: rgba(255,255,255,0.05); overflow: hidden; }

[data-theme="light"] .plane-track { background: rgba(0,0,0,0.07); }

.plane-fill { height: 100%; border-radius: 3px; transition: width 0.75s cubic-bezier(0.22,0.61,0.36,1); }

  

.plane-count { font-family: var(--f-head); font-size: 0.88rem; font-weight: 700; color: var(--text-mid); text-align: right; white-space: nowrap; }

.plane-count small { font-family: var(--f-body); font-size: 0.60rem; font-weight: 300; opacity: 0.55; }

  

.planes-dominant { margin-top: 14px; padding-top: 10px; border-top: 1px solid rgba(90, 60, 150, 0.08); font-size: 0.70rem; font-weight: 400; color: var(--violet); letter-spacing: 0.03em; text-align: center; opacity: 0.8; }

  

@media (max-width: 479px) {

  .plane-row { grid-template-columns: 110px 1fr 44px; gap: 8px; }

  .plane-short { display: none; }

  .plane-meta { flex-direction: row; align-items: center; gap: 6px; }

}

  

.modal-planes { display: flex; flex-direction: column; gap: 16px; margin-bottom: 4px; }

.modal-plane-row { padding: 12px 14px; border-radius: var(--r-md); background: rgba(255,255,255,0.020); border: 1px solid var(--border-dim); transition: border-color var(--t-s); }

.modal-plane-row--dom { background: rgba(90, 60, 150, 0.05); border-color: var(--violet-border); }

[data-theme="light"] .modal-plane-row { background: rgba(0,0,0,0.020); }

[data-theme="light"] .modal-plane-row--dom { background: rgba(80,50,130,0.05); border-color: var(--violet-border); }

.modal-plane-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }

.modal-plane-label { font-family: var(--f-head); font-size: 0.76rem; font-weight: 700; letter-spacing: 0.06em; color: var(--text); }

.modal-plane-num { font-family: var(--f-head); font-size: 0.86rem; font-weight: 700; color: var(--text-mid); }

.modal-plane-num small { font-family: var(--f-body); font-size: 0.66rem; opacity: 0.55; }

.modal-plane-track { height: 5px; border-radius: 3px; background: rgba(255,255,255,0.05); overflow: hidden; margin-bottom: 10px; }

[data-theme="light"] .modal-plane-track { background: rgba(0,0,0,0.07); }

.modal-plane-fill { height: 100%; border-radius: 3px; transition: width 0.65s cubic-bezier(0.22,0.61,0.36,1); }

.modal-plane-desc { font-size: 0.79rem; font-weight: 300; color: var(--text-mid); line-height: 1.55; margin: 0; }

.modal-value--plane { font-family: var(--f-head); font-size: 1.55rem !important; font-weight: 800; color: var(--violet-bright); line-height: 1.2; text-align: center; }

  
  

/* ================================================================

   14  GRID-LABEL

   ================================================================ */

.grid-section-label {

  grid-column: 1 / -1; text-align: center; font-size: 0.62rem; font-weight: 700;

  letter-spacing: 0.20em; text-transform: uppercase; color: var(--violet); opacity: 0.55;

  padding: 10px 0 4px; border-top: 1px solid rgba(90, 60, 150, 0.08); margin-top: 4px;

}

  
  

/* ================================================================

   15  RESULT ACTIONS

   ================================================================ */

.result-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

  
  

/* ================================================================

   16  TOOLTIP

   ================================================================ */

.tooltip-btn {

  display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;

  width: 15px; height: 15px; padding: 0;

  border: 1px solid rgba(120, 90, 180, 0.12); border-radius: 50%;

  background: rgba(100, 70, 155, 0.05); color: var(--text-dim);

  font-family: var(--f-body); font-size: 0.55rem; cursor: help; position: relative;

  -webkit-tap-highlight-color: transparent;

  transition: border-color var(--t-s), color var(--t-s), background var(--t-s);

}

.tooltip-btn:hover, .tooltip-btn:focus-visible { border-color: var(--violet-border); color: var(--violet-bright); background: rgba(90, 60, 155, 0.08); }

.tooltip-btn::after {

  content: attr(data-tooltip); position: absolute; bottom: calc(100% + 8px); left: 50%;

  transform: translateX(-50%) translateY(5px); width: max-content; max-width: min(200px, 80vw);

  white-space: normal; text-align: left; background: rgba(6, 7, 18, 0.98); color: var(--text-mid);

  font-family: var(--f-body); font-size: 0.71rem; font-weight: 400; line-height: 1.45;

  padding: 7px 10px; border-radius: var(--r-sm); border: 1px solid rgba(90, 60, 155, 0.18);

  box-shadow: 0 8px 30px rgba(2, 3, 12, 0.85); opacity: 0; pointer-events: none; z-index: 200;

  transition: opacity var(--t-m) var(--ease), transform var(--t-m) var(--ease);

}

.tooltip-btn:hover::after, .tooltip-btn:focus-visible::after { opacity: 1; transform: translateX(-50%) translateY(0); }

[data-theme="light"] .tooltip-btn::after { background: rgba(240, 240, 248, 0.99); border-color: rgba(80, 55, 130, 0.16); box-shadow: 0 8px 28px rgba(40, 28, 80, 0.16); }

  
  

/* ================================================================

   17  MODAL

   ================================================================ */

.detail-modal {

  position: fixed; inset: 0; margin: auto; width: min(500px, 92vw); max-height: 88vh;

  padding: 0; border: 1px solid var(--modal-border); border-radius: var(--r-lg);

  background: var(--modal-bg); box-shadow: var(--sh-modal); overflow-y: auto; z-index: 500;

  animation: modalIn 0.26s var(--ease) forwards;

}

.detail-modal::backdrop { background: rgba(2, 3, 10, 0.78); -webkit-backdrop-filter: blur(5px); backdrop-filter: blur(5px); }

[data-theme="light"] .detail-modal::backdrop { background: rgba(30, 20, 60, 0.38); }

  

.modal-inner { padding: 28px 22px 30px; position: relative; }

.modal-close {

  position: absolute; top: 16px; right: 16px; width: 28px; height: 28px; border-radius: 50%;

  border: 1px solid var(--border-mid); background: var(--surface); color: var(--text-mid);

  font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; justify-content: center;

  -webkit-tap-highlight-color: transparent; transition: border-color var(--t-s), color var(--t-s);

}

.modal-close:hover { border-color: var(--violet-border); color: var(--violet-bright); }

  

.modal-top {

  display: flex; flex-direction: column; align-items: center; gap: 6px;

  margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid rgba(90, 60, 150, 0.10);

}

.modal-icon { font-size: 1.8rem; color: var(--violet); line-height: 1; opacity: 0.8; animation: starSpin 10s linear infinite; }

.modal-type { font-family: var(--f-head); font-size: 0.66rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-dim); }

.modal-value { font-family: var(--f-head); font-size: 3.0rem; font-weight: 800; color: var(--violet-bright); line-height: 1; text-align: center; width: fit-content; margin: 0 auto; }

.modal-value.master { animation: masterPulse 2.2s ease-in-out infinite alternate; text-shadow: 0 0 18px rgba(140, 100, 210, 0.44); }

.modal-short { font-size: 0.86rem; font-weight: 500; color: var(--text); text-align: center; margin-bottom: 12px; line-height: 1.5; }

.modal-extended { font-size: 0.86rem; font-weight: 300; color: var(--text-mid); line-height: 1.65; margin-bottom: 20px; text-align: center; }

.modal-calc-box { display: flex; flex-direction: column; gap: 4px; background: rgba(255,255,255,0.018); border: 1px solid rgba(90, 60, 150, 0.10); border-radius: var(--r-sm); padding: 10px 14px; }

[data-theme="light"] .modal-calc-box { background: rgba(0,0,0,0.025); }

.modal-calc-label { font-size: 0.62rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--violet); opacity: 0.75; }

.modal-calc { font-size: 0.80rem; color: var(--text-mid); line-height: 1.5; }

  
  

/* ================================================================

   18  VERGLEICH

   ================================================================ */

.compare-card { padding: 22px 18px 24px; background: linear-gradient(155deg, var(--card-bg-1), var(--card-bg-2)); }

.compare-inputs { display: grid; grid-template-columns: 1fr auto 1fr; gap: 16px; align-items: start; margin-bottom: 18px; }

.compare-person-label { font-family: var(--f-head); font-size: 0.65rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--violet); opacity: 0.75; margin-bottom: 12px; }

.compare-divider { font-size: 1.2rem; color: var(--violet); opacity: 0.35; align-self: center; text-align: center; padding-top: 28px; }

  

.compat-header { display: flex; flex-direction: column; align-items: center; gap: 6px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid rgba(90, 60, 150, 0.08); text-align: center; }

.compat-names { font-family: var(--f-head); font-size: 1rem; font-weight: 700; color: var(--text); letter-spacing: 0.02em; }

.compat-names span { color: var(--violet); margin: 0 6px; }

.compat-overall { display: flex; align-items: center; gap: 10px; }

.compat-score { font-family: var(--f-head); font-size: 2.1rem; font-weight: 800; color: var(--violet-bright); }

.compat-label-big { font-size: 0.88rem; color: var(--text-mid); }

.compat-rows { display: flex; flex-direction: column; gap: 10px; }

.compat-row { display: grid; grid-template-columns: 100px 48px 1fr 42px; align-items: center; gap: 10px; }

.compat-label { font-size: 0.78rem; color: var(--text-mid); }

.compat-nums  { font-family: var(--f-head); font-size: 0.80rem; color: var(--text-dim); text-align: center; }

.compat-bar-wrap { height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; }

[data-theme="light"] .compat-bar-wrap { background: rgba(0,0,0,0.08); }

.compat-bar  { height: 100%; border-radius: 3px; transition: width 0.85s var(--ease); }

.compat-pct  { font-size: 0.78rem; font-weight: 600; color: var(--text-mid); text-align: right; }

.compare-error { color: var(--danger); font-size: 0.83rem; margin-top: 12px; text-align: center; }

  
  

/* ================================================================

   19  TOAST

   ================================================================ */

.toast {

  position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%) translateY(20px);

  background: rgba(8, 9, 20, 0.97); color: var(--text); border: 1px solid var(--violet-border);

  border-radius: var(--r-md); padding: 10px 18px; font-size: 0.83rem; z-index: 600;

  opacity: 0; pointer-events: none; transition: opacity var(--t-m) var(--ease), transform var(--t-m) var(--ease);

  box-shadow: 0 8px 28px rgba(2, 3, 12, 0.70);

}

[data-theme="light"] .toast { background: rgba(240, 240, 248, 0.99); }

.toast--show { opacity: 1; transform: translateX(-50%) translateY(0); }

  
  

/* ================================================================

   20  FOOTER

   ================================================================ */

.site-footer { font-size: 0.68rem; font-weight: 300; letter-spacing: 0.06em; color: var(--text-dim); text-align: center; position: relative; z-index: 2; opacity: 0.50; }

  
  

/* ================================================================

   21  KEYFRAMES

   ================================================================ */

@keyframes tileIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

@keyframes masterPulse { from { filter: drop-shadow(0 0 4px rgba(140,100,210,0.35)); } to { filter: drop-shadow(0 0 14px rgba(120,80,190,0.60)); } }

@keyframes modalIn { from { opacity: 0; transform: scale(0.96) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }

@keyframes orbDrift1 { from { transform: translate(0,0) scale(1); } to { transform: translate(20px,14px) scale(1.06); } }

@keyframes orbDrift2 { from { transform: translate(0,0) scale(1); } to { transform: translate(-16px,-10px) scale(1.05); } }

@keyframes shimmer { from { background-position: 0% 50%; } to { background-position: 100% 50%; } }

@keyframes starSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  
  

/* ================================================================

   22  BREAKPOINTS

   ================================================================ */

@media (min-width: 480px) {

  body { gap: 24px; }

  .form-card { padding: 26px 22px 22px; }

  .results-card { padding: 22px 18px; }

  .results-grid { gap: 12px; }

  .result-tile { padding: 18px 14px 16px; min-height: 140px; align-self: start; }

  .bg-orb--1 { width: 440px; height: 440px; }

  .bg-orb--2 { width: 360px; height: 360px; }

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

  .bg-orb--1 { width: 600px; height: 600px; filter: blur(70px); }

  .bg-orb--2 { width: 500px; height: 500px; filter: blur(75px); }

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

  .bg-orb, .form-card, .result-actions, .compare-card, .theme-toggle, .site-footer, .tooltip-btn, .results-hint, .site-subtitle { display: none !important; }

  .site-header { margin-bottom: 12px; }

  .site-title { -webkit-text-fill-color: #000 !important; color: #000 !important; background: none !important; animation: none !important; }

  .card { border: 1px solid #ccc !important; box-shadow: none !important; background: #fff !important; }

  .result-tile { border: 1px solid #ccc !important; background: #fff !important; opacity: 1 !important; transform: none !important; break-inside: avoid; }

  .result-value { color: #000 !important; text-shadow: none !important; animation: none !important; }

  .result-value.master { color: #44236a !important; }

  .results-grid { gap: 8px !important; }

  .grid-section-label { color: #000 !important; border-color: #ccc !important; }

  .container { grid-template-columns: 1fr !important; }

  .header-icon { animation: none !important; }

}

  
  

/* ================================================================

   24  ACCESSIBILITY

   ================================================================ */

:focus-visible { outline: 2px solid rgba(120, 88, 190, 0.55); outline-offset: 3px; border-radius: 4px; }

:focus:not(:focus-visible) { outline: none; }

@media (prefers-reduced-motion: reduce) {

  *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; transform: none !important; }

}

  
  

/* ================================================================

   25  LO-SHU PSYCHOMATRIX

   ================================================================ */

.lo-shu-tile { grid-column: 1 / -1; padding: 18px 16px 16px; min-height: 0; cursor: pointer; }

.lo-shu-title { margin-bottom: 14px; justify-content: flex-start; gap: 8px; }

.lo-shu-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; width: 100%; max-width: 260px; margin: 0 auto 12px; }

.lo-shu-cell {

  display: flex; flex-direction: column; align-items: center; justify-content: center;

  gap: 4px; padding: 10px 6px; border-radius: var(--r-md);

  background: rgba(255,255,255,0.025); border: 1px solid rgba(90, 60, 150, 0.10); min-height: 62px;

  transition: border-color var(--t-s), background var(--t-s);

}

[data-theme="light"] .lo-shu-cell { background: rgba(0,0,0,0.025); }

.lo-shu-cell--missing { background: rgba(140, 60, 60, 0.04); border-color: rgba(140, 60, 60, 0.20); border-style: dashed; }

.lo-shu-cell--strong  { background: rgba(100, 68, 175, 0.06); border-color: var(--violet-border); }

.lo-shu-num { font-family: var(--f-head); font-size: 1.15rem; font-weight: 800; color: var(--text); line-height: 1; }

.lo-shu-cell--missing .lo-shu-num { color: var(--danger); opacity: 0.55; }

.lo-shu-cell--strong  .lo-shu-num { color: var(--violet-bright); }

.lo-shu-dots { font-size: 0.55rem; color: var(--violet); letter-spacing: 1px; min-height: 10px; line-height: 1; opacity: 0.75; }

.lo-shu-cell--missing .lo-shu-dots { color: var(--danger); }

.lo-shu-cell--strong  .lo-shu-dots { color: var(--violet-bright); opacity: 1; }

.lo-shu-lines { font-size: 0.68rem; color: var(--violet); text-align: center; letter-spacing: 0.02em; padding-top: 10px; border-top: 1px solid rgba(90, 60, 150, 0.08); opacity: 0.75; }

  

.modal-lo-shu { display: flex; flex-direction: column; gap: 14px; }

.modal-lo-shu-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; max-width: 220px; margin: 0 auto; }

.modal-lo-shu-cell { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 10px 4px; border-radius: var(--r-md); background: rgba(255,255,255,0.025); border: 1px solid rgba(90, 60, 150, 0.10); min-height: 56px; }

[data-theme="light"] .modal-lo-shu-cell { background: rgba(0,0,0,0.025); }

.modal-lo-shu-info { padding: 10px 14px; border-radius: var(--r-sm); font-size: 0.80rem; color: var(--text-mid); line-height: 1.55; background: rgba(255,255,255,0.020); border: 1px solid var(--border-dim); }

[data-theme="light"] .modal-lo-shu-info { background: rgba(0,0,0,0.020); }

.modal-lo-shu-info--missing { border-color: rgba(140, 60, 60, 0.22); }

.modal-lo-shu-info--strong  { border-color: var(--violet-border); }

.modal-lo-shu-info--lines   { border-color: rgba(80, 100, 180, 0.22); }

.modal-lo-shu-info strong   { color: var(--text); }

  
  

/* ================================================================

   26  QUANTUM SCORE TILE

   ================================================================ */

.quantum-tile { cursor: pointer; padding: 16px 14px 14px; }

.quantum-gauge { width: 100%; display: flex; flex-direction: column; gap: 8px; margin: 10px 0 6px; }

.quantum-bar-track { height: 6px; border-radius: 3px; background: rgba(255,255,255,0.05); overflow: hidden; }

[data-theme="light"] .quantum-bar-track { background: rgba(0,0,0,0.08); }

.quantum-bar-fill { height: 100%; border-radius: 3px; transition: width 1.1s cubic-bezier(0.22, 0.61, 0.36, 1); }

.quantum-score-value { font-family: var(--f-head); font-size: 1.55rem; font-weight: 800; text-align: center; line-height: 1; letter-spacing: 0.02em; }