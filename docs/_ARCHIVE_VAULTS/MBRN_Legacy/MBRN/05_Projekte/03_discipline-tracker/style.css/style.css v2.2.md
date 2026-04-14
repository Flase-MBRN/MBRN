/* =====================================================
   DISZIPLIN CHALLENGE v2.2 — style.css
   Aesthetic: Tactical Performance — Dark, precise, charged
   ===================================================== */

/* ---- VARIABLEN ---- */
:root {
  --black:        #080808;
  --dark:         #0f0f0f;
  --dark2:        #161616;
  --dark3:        #1e1e1e;
  --dark4:        #252525;
  --border:       #262626;
  --border-light: #333333;
  --accent:       #d4ff00;
  --accent-dim:   rgba(212,255,0,0.1);
  --accent-glow:  rgba(212,255,0,0.25);
  --accent-hover: #e2ff40;
  --gold:         #f0c040;
  --gold-dim:     rgba(240,192,64,0.1);
  --gold-border:  rgba(240,192,64,0.35);
  --gold-glow:    rgba(240,192,64,0.2);
  --white:        #efefef;
  --white-dim:    rgba(239,239,239,0.45);
  --white-faint:  rgba(239,239,239,0.06);
  --red:          #ff4040;
  --green:        #00e87a;
  --kofi:         #ff5e5b;
  --whatsapp:     #25d366;
  --twitter:      #1d9bf0;
  --font-display: 'Oswald', sans-serif;
  --font-mono:    'Space Mono', monospace;
  --radius:       3px;
  --radius-lg:    6px;
}

/* ---- RESET ---- */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  background: var(--black);
  color: var(--white);
  font-family: var(--font-mono);
  min-height: 100vh;
  overflow-x: hidden;
}
button { font-family: inherit; cursor: pointer; }
input  { font-family: inherit; }
a      { text-decoration: none; color: inherit; }

/* ---- HINTERGRUND ---- */
.bg-noise {
  position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-repeat: repeat; background-size: 256px;
}
.bg-grid {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-image:
    linear-gradient(rgba(212,255,0,0.018) 1px, transparent 1px),
    linear-gradient(90deg, rgba(212,255,0,0.018) 1px, transparent 1px);
  background-size: 48px 48px;
}

/* =====================================================
   TOP NAV
   ===================================================== */
.topnav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 50;
  height: 52px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 20px;
  background: rgba(8,8,8,0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}

.topnav-brand {
  display: flex; align-items: center; gap: 10px;
}

.topnav-logo {
  width: 30px; height: 30px;
  background: var(--accent); color: var(--black);
  border-radius: 2px;
  font-family: var(--font-display); font-size: 14px; font-weight: 700;
  letter-spacing: 0.02em;
  display: flex; align-items: center; justify-content: center;
}

.topnav-name {
  font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--white-dim); font-weight: 400;
  display: none; /* mobile: only logo */
}
@media (min-width: 400px) { .topnav-name { display: block; } }

.topnav-premium {
  background: transparent;
  border: 1px solid var(--gold-border);
  color: var(--gold);
  padding: 6px 14px; border-radius: var(--radius);
  font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase;
  display: flex; align-items: center; gap: 6px;
  transition: all 0.2s;
}
.topnav-premium:hover {
  background: var(--gold-dim);
  border-color: var(--gold);
  box-shadow: 0 0 14px var(--gold-glow);
}
.topnav-premium-star { font-size: 10px; }
.topnav-premium.hidden { display: none; }

/* =====================================================
   CONTAINER
   ===================================================== */
.container {
  position: relative; z-index: 1;
  max-width: 460px; margin: 0 auto;
  padding: 80px 22px 72px; /* top: below nav */
  display: flex; flex-direction: column; gap: 24px;
}

/* =====================================================
   HEADER
   ===================================================== */
.header {
  text-align: center;
  padding-top: 12px;
  animation: fadeUp 0.5s ease both;
}

.tag {
  display: inline-block;
  font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase;
  color: var(--accent); border: 1px solid rgba(212,255,0,0.3);
  padding: 5px 14px; border-radius: var(--radius);
  margin-bottom: 20px;
}
.tag.premium-active {
  color: var(--gold); border-color: var(--gold-border);
}

.title {
  font-family: var(--font-display); font-weight: 700;
  font-size: clamp(52px, 14vw, 84px);
  line-height: 0.88; letter-spacing: -0.02em; text-transform: uppercase;
  color: var(--white);
}
.title-accent { color: var(--accent); }

.subtitle {
  margin-top: 14px; font-size: 11px; letter-spacing: 0.12em;
  color: var(--white-dim); text-transform: uppercase;
}

/* =====================================================
   STATUS BADGE
   ===================================================== */
.status-badge {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  background: var(--dark2);
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  padding: 11px 20px; border-radius: var(--radius);
  font-size: 11px; letter-spacing: 0.1em; color: var(--accent);
  text-transform: uppercase;
  animation: fadeUp 0.5s 0.1s ease both;
  transition: border-left-color 0.3s;
}

.status-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent);
  animation: blink 2s ease-in-out infinite;
  flex-shrink: 0;
}
@keyframes blink {
  0%,100% { opacity: 1; }
  50%      { opacity: 0.3; }
}

/* =====================================================
   SNAPSHOT BANNER
   ===================================================== */
.snapshot-banner {
  background: var(--dark2); border: 1px solid var(--gold-border);
  border-radius: var(--radius); padding: 12px 16px;
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; flex-wrap: wrap;
  font-size: 11px; color: var(--white-dim); letter-spacing: 0.04em;
}
.btn-own-start {
  background: var(--accent); color: var(--black); border: none;
  border-radius: var(--radius); padding: 7px 14px;
  font-size: 11px; font-weight: 700; letter-spacing: 0.06em;
  white-space: nowrap; transition: all 0.15s;
}
.btn-own-start:hover { background: var(--accent-hover); }

/* =====================================================
   FORTSCHRITT
   ===================================================== */
.progress-section {
  display: flex; flex-direction: column; gap: 18px;
  animation: fadeUp 0.5s 0.15s ease both;
}

/* Tages-Counter */
.day-counter { text-align: center; }

.day-number-wrap {
  display: flex; align-items: center; justify-content: center;
  gap: 20px;
}

.day-number-block {
  position: relative; display: inline-flex;
  align-items: center; justify-content: center;
}

.day-number {
  font-family: var(--font-display); font-weight: 700;
  font-size: clamp(88px, 24vw, 130px);
  color: var(--accent); letter-spacing: -0.05em; line-height: 1;
  position: relative; z-index: 1;
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.day-glow {
  position: absolute; inset: -20px;
  background: radial-gradient(ellipse at center, var(--accent-glow) 0%, transparent 70%);
  pointer-events: none; z-index: 0;
  opacity: 0.6;
}

.day-meta {
  display: flex; flex-direction: column; align-items: flex-start; gap: 0;
  padding-bottom: 8px;
}
.day-of    { font-size: 10px; letter-spacing: 0.1em; color: var(--border-light); text-transform: uppercase; }
.day-total { font-family: var(--font-display); font-size: 42px; font-weight: 300; color: rgba(239,239,239,0.2); line-height: 1; }
.day-days  { font-size: 10px; letter-spacing: 0.1em; color: var(--border-light); text-transform: uppercase; }

.day-label {
  font-size: 10px; letter-spacing: 0.15em; color: var(--white-dim);
  text-transform: uppercase; margin-top: 4px;
}

/* Progress Bar */
.progress-bar-wrap { position: relative; }
.progress-bar-track {
  background: var(--dark2); border: 1px solid var(--border);
  height: 6px; border-radius: 99px; overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 99px;
  transition: width 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  display: flex; align-items: center; justify-content: flex-end;
}
.progress-bar-fill::after {
  content: '';
  position: absolute; right: 0; top: 50%; transform: translateY(-50%);
  width: 8px; height: 8px; background: var(--accent);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--accent-glow);
  opacity: 0; transition: opacity 0.3s;
}
.progress-bar-fill.has-progress::after { opacity: 1; }
.progress-bar-fill.premium-gold { background: var(--gold); }
.progress-bar-fill.premium-gold::after { background: var(--gold); box-shadow: 0 0 8px var(--gold-glow); }

.progress-percent { display: none; } /* Zahl kommt via day-label */

/* Dots Grid */
.dots-grid {
  display: grid; grid-template-columns: repeat(10, 1fr); gap: 6px;
}
.dot {
  aspect-ratio: 1; border-radius: var(--radius);
  border: 1px solid var(--border); background: var(--dark2);
  transition: all 0.2s ease; position: relative;
}
.dot::after {
  content: attr(data-num);
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 8px; color: var(--border-light);
  font-family: var(--font-mono);
}
.dot.done {
  background: var(--accent); border-color: var(--accent);
}
.dot.done::after {
  content: '✓'; color: var(--black); font-size: 10px; font-weight: 700;
}
.dot.done.premium-gold-dot {
  background: var(--gold); border-color: var(--gold);
}
.dot.current {
  border-color: var(--accent); background: var(--accent-dim);
  box-shadow: 0 0 10px var(--accent-glow);
  animation: pulse-dot 2s ease-in-out infinite;
}
@keyframes pulse-dot {
  0%,100% { box-shadow: 0 0 6px rgba(212,255,0,0.2); }
  50%      { box-shadow: 0 0 18px rgba(212,255,0,0.5); }
}

/* =====================================================
   ACTION BUTTON
   ===================================================== */
.action-section {
  display: flex; flex-direction: column; gap: 10px; align-items: center;
  animation: fadeUp 0.5s 0.2s ease both;
}

.btn-primary {
  width: 100%; padding: 20px 32px;
  background: var(--accent); color: var(--black);
  border: none; border-radius: var(--radius);
  font-family: var(--font-display); font-size: 20px; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  transition: all 0.15s ease;
  position: relative; overflow: hidden;
  box-shadow: 0 4px 0 rgba(0,0,0,0.4), 0 0 0 0 var(--accent-glow);
}
.btn-primary:hover {
  background: var(--accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 0 rgba(0,0,0,0.4), 0 8px 28px var(--accent-glow);
}
.btn-primary:active {
  transform: translateY(1px);
  box-shadow: 0 2px 0 rgba(0,0,0,0.4);
}
.btn-primary.done-today,
.btn-primary:disabled {
  background: var(--dark3);
  color: var(--green);
  border: 1px solid rgba(0,232,122,0.3);
  box-shadow: none;
  transform: none;
  pointer-events: none;
}
.btn-icon { font-size: 18px; }
.btn-hint {
  font-size: 10px; letter-spacing: 0.08em; color: var(--white-dim);
  text-align: center; text-transform: uppercase;
}

/* =====================================================
   SHARE SECTION
   ===================================================== */
.share-section {
  display: flex; gap: 10px;
  animation: fadeUp 0.5s 0.25s ease both;
}
.btn-share, .btn-snapshot {
  flex: 1; background: var(--dark2);
  border: 1px solid var(--border-light);
  color: var(--white-dim); padding: 12px 16px;
  border-radius: var(--radius); font-size: 12px;
  letter-spacing: 0.06em; transition: all 0.2s;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.btn-share:hover {
  border-color: var(--accent); color: var(--accent); background: var(--accent-dim);
}
.btn-snapshot:hover {
  border-color: var(--gold-border); color: var(--gold); background: var(--gold-dim);
}

/* =====================================================
   STATS ROW
   ===================================================== */
.stats-row {
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1px;
  background: var(--border); border: 1px solid var(--border);
  border-radius: var(--radius); overflow: hidden;
  animation: fadeUp 0.5s 0.28s ease both;
}
.stat-box {
  background: var(--dark2); padding: 16px 12px;
  text-align: center; display: flex; flex-direction: column;
  align-items: center; gap: 5px;
  transition: background 0.2s;
}
.stat-box:hover { background: var(--dark3); }
.stat-box--center { border-left: 1px solid var(--border); border-right: 1px solid var(--border); }
.stat-number {
  font-family: var(--font-display); font-size: 30px; font-weight: 700;
  color: var(--accent); line-height: 1;
}
.stat-label {
  font-size: 9px; color: var(--white-dim); letter-spacing: 0.1em;
  text-transform: uppercase;
}

/* =====================================================
   PREMIUM CTA
   ===================================================== */
.premium-cta {
  position: relative; overflow: hidden;
  border-radius: var(--radius-lg);
  padding: 1px; /* for gradient border trick */
  background: linear-gradient(135deg, var(--gold-border), rgba(240,192,64,0.1), var(--gold-border));
  animation: fadeUp 0.5s 0.3s ease both;
}
.premium-cta::before {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(240,192,64,0.05) 0%, transparent 60%);
  pointer-events: none;
}

.premium-cta-inner-wrap {
  background: var(--dark2);
  border-radius: calc(var(--radius-lg) - 1px);
  padding: 20px;
  display: flex; flex-direction: column; gap: 12px;
}

/* We don't use .premium-cta-inner from old CSS — direct children of .premium-cta */
.premium-cta-label {
  display: flex; align-items: center; gap: 7px;
  font-size: 10px; letter-spacing: 0.18em; color: var(--gold);
  text-transform: uppercase; font-weight: 700;
}
.premium-star-icon { font-size: 10px; }
.premium-cta-headline {
  font-family: var(--font-display); font-size: 20px; font-weight: 700;
  color: var(--white); letter-spacing: 0.02em; line-height: 1.2;
}
.premium-cta-perks {
  list-style: none; display: flex; flex-direction: column; gap: 6px;
}
.premium-cta-perks li {
  font-size: 11px; color: var(--white-dim); letter-spacing: 0.04em;
  padding-left: 14px; position: relative;
}
.premium-cta-perks li::before {
  content: '·'; position: absolute; left: 0; color: var(--gold);
}
.btn-premium-cta {
  background: var(--gold); color: var(--black); border: none;
  border-radius: var(--radius); padding: 14px 20px;
  font-family: var(--font-display); font-size: 16px; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase;
  transition: all 0.15s;
  box-shadow: 0 3px 0 rgba(0,0,0,0.3);
}
.btn-premium-cta:hover {
  background: #f5ca50; transform: translateY(-1px);
  box-shadow: 0 5px 0 rgba(0,0,0,0.3), 0 6px 20px var(--gold-glow);
}
.btn-premium-cta:active { transform: translateY(1px); box-shadow: 0 1px 0 rgba(0,0,0,0.3); }

/* premium-cta inner wrap handles all padding */

/* =====================================================
   PREMIUM SECTION (aktiv)
   ===================================================== */
.premium-section {
  border: 1px solid var(--gold-border); border-radius: var(--radius-lg);
  padding: 18px; display: flex; flex-direction: column; gap: 14px;
  background: linear-gradient(135deg, rgba(240,192,64,0.04) 0%, transparent 60%);
}
.premium-section-header {
  display: flex; align-items: center; gap: 8px;
}
.premium-section-label {
  font-size: 10px; letter-spacing: 0.18em; color: var(--gold);
  text-transform: uppercase; font-weight: 700;
}
.btn-export-history {
  background: transparent; border: 1px solid var(--border-light);
  color: var(--white-dim); padding: 10px 16px; border-radius: var(--radius);
  font-size: 11px; letter-spacing: 0.06em; transition: all 0.2s;
}
.btn-export-history:hover { border-color: var(--gold-border); color: var(--gold); }

/* Multi-Challenge Boxes */
.multi-challenge-grid { display: flex; flex-direction: column; gap: 8px; }
.challenge-mini-box {
  background: var(--dark3); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 12px 14px;
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
}
.challenge-mini-name  { font-size: 12px; color: var(--white); letter-spacing: 0.04em; }
.challenge-mini-day   { font-family: var(--font-display); font-size: 24px; color: var(--gold); font-weight: 700; }
.btn-add-challenge {
  background: transparent; border: 1px dashed var(--gold-border);
  color: var(--gold); padding: 10px 16px; border-radius: var(--radius);
  font-size: 11px; letter-spacing: 0.06em; width: 100%; transition: all 0.2s;
}
.btn-add-challenge:hover { background: var(--gold-dim); }

/* =====================================================
   KO-FI
   ===================================================== */
.support-section { text-align: center; }
.btn-kofi {
  display: inline-block; background: transparent;
  border: 1px solid var(--border); color: var(--white-dim);
  padding: 10px 24px; border-radius: var(--radius);
  font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;
  transition: all 0.2s;
}
.btn-kofi:hover {
  border-color: var(--kofi); color: var(--kofi);
  background: rgba(255,94,91,0.06);
}

/* =====================================================
   RESET & FOOTER
   ===================================================== */
.reset-section { text-align: center; }
.btn-reset {
  background: transparent; border: none; color: rgba(239,239,239,0.2);
  font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase;
  padding: 8px 16px; transition: color 0.2s;
}
.btn-reset:hover { color: var(--red); }

.footer { text-align: center; display: flex; flex-direction: column; gap: 8px; }
.footer-privacy-note {
  font-size: 9px; letter-spacing: 0.1em; color: var(--border-light);
  text-transform: uppercase;
}
.footer-links {
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.footer-link {
  background: none; border: none; color: var(--border-light);
  font-size: 9px; letter-spacing: 0.08em; text-transform: uppercase;
  transition: color 0.2s;
}
.footer-link:hover { color: var(--white-dim); }
.footer-sep   { color: var(--border); font-size: 9px; }
.footer-version { font-size: 9px; color: var(--border); letter-spacing: 0.06em; }

/* =====================================================
   MODAL BASE
   ===================================================== */
.modal-overlay {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(0,0,0,0.85);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}
.modal {
  background: var(--dark); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 28px; width: 100%; max-width: 380px;
  position: relative; display: flex; flex-direction: column; gap: 16px;
  max-height: 90vh; overflow-y: auto;
  animation: modalIn 0.2s cubic-bezier(0.34, 1.3, 0.64, 1) both;
}
@keyframes modalIn {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-close {
  position: absolute; top: 14px; right: 14px;
  background: var(--dark2); border: 1px solid var(--border); color: var(--white-dim);
  width: 28px; height: 28px; border-radius: var(--radius);
  font-size: 12px; display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.modal-close:hover { border-color: var(--border-light); color: var(--white); }

.modal-eyebrow {
  font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase;
  color: var(--accent); margin-bottom: -8px;
}
.modal-title {
  font-family: var(--font-display); font-size: 22px; font-weight: 700;
  letter-spacing: 0.02em; color: var(--white);
}
.modal-subtitle {
  font-size: 12px; color: var(--white-dim); letter-spacing: 0.03em; line-height: 1.6;
  margin-top: -6px;
}

/* =====================================================
   ONBOARDING MODAL
   ===================================================== */
.modal-onboarding { align-items: center; text-align: center; max-width: 340px; }
.onboarding-steps { width: 100%; }
.onboarding-step  { display: none; flex-direction: column; align-items: center; gap: 12px; }
.onboarding-step.active { display: flex; }
.onboarding-icon  { font-size: 48px; }
.onboarding-title {
  font-family: var(--font-display); font-size: 26px; font-weight: 700;
  line-height: 1.1; letter-spacing: 0.02em;
}
.onboarding-text {
  font-size: 12px; color: var(--white-dim); letter-spacing: 0.04em; line-height: 1.7;
}
.onboarding-nav { display: flex; flex-direction: column; align-items: center; gap: 14px; width: 100%; }
.onboarding-dots { display: flex; gap: 6px; }
.ob-dot {
  width: 6px; height: 6px; border-radius: 50%; background: var(--border);
  transition: all 0.2s;
}
.ob-dot.active { background: var(--accent); box-shadow: 0 0 6px var(--accent-glow); }
.btn-onboarding-next {
  width: 100%; padding: 15px; background: var(--accent); color: var(--black); border: none;
  border-radius: var(--radius); font-family: var(--font-display); font-size: 16px; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase; transition: all 0.15s;
  box-shadow: 0 3px 0 rgba(0,0,0,0.3);
}
.btn-onboarding-next:hover { background: var(--accent-hover); transform: translateY(-1px); }

/* =====================================================
   SHARE MODAL
   ===================================================== */
.share-card-wrap {
  border: 1px solid var(--border-light); border-radius: var(--radius);
  overflow: hidden; transition: border-color 0.3s;
}
.share-card-wrap.premium { border-color: var(--gold-border); }

.share-card-inner {
  background: var(--black); padding: 22px 18px;
  text-align: center; display: flex; flex-direction: column;
  align-items: center; gap: 6px;
}
.share-card-label { font-size: 8px; letter-spacing: 0.2em; color: var(--border-light); text-transform: uppercase; }
.share-card-day   {
  font-family: var(--font-display); font-size: 60px; font-weight: 700;
  color: var(--accent); line-height: 1; letter-spacing: -0.04em;
}
.share-card-wrap.premium .share-card-day { color: var(--gold); }
.share-card-sub   { font-family: var(--font-display); font-size: 13px; color: var(--white); letter-spacing: 0.06em; text-transform: uppercase; }
.share-card-dots  { display: flex; flex-wrap: wrap; gap: 3px; justify-content: center; margin-top: 8px; max-width: 190px; }
.share-dot        { width: 12px; height: 12px; border-radius: 2px; border: 1px solid var(--border); background: var(--dark2); }
.share-dot.done   { background: var(--accent); border-color: var(--accent); }
.share-card-wrap.premium .share-dot.done { background: var(--gold); border-color: var(--gold); }
.share-card-url   { font-size: 8px; color: var(--border-light); margin-top: 6px; letter-spacing: 0.1em; }

.social-share-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.btn-social {
  padding: 12px; border-radius: var(--radius);
  border: 1px solid var(--border); background: var(--dark2);
  color: var(--white-dim); font-size: 12px; letter-spacing: 0.04em;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  transition: all 0.2s;
}
.btn-whatsapp:hover { border-color: var(--whatsapp); color: var(--whatsapp); background: rgba(37,211,102,0.06); }
.btn-twitter:hover  { border-color: var(--twitter);  color: var(--twitter);  background: rgba(29,155,240,0.06); }
.btn-copy:hover     { border-color: var(--accent);   color: var(--accent);   background: var(--accent-dim); }
.btn-download:hover { border-color: var(--border-light); color: var(--white); background: var(--white-faint); }
.share-hashtags { font-size: 9px; color: var(--border-light); letter-spacing: 0.1em; text-align: center; }

/* =====================================================
   SNAPSHOT MODAL
   ===================================================== */
.snapshot-url-box { display: flex; gap: 8px; }
.snapshot-url-input {
  flex: 1; background: var(--dark2); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--white); padding: 10px 12px;
  font-size: 10px; letter-spacing: 0.04em; outline: none;
}
.snapshot-url-input:focus { border-color: var(--accent); }
.btn-copy-url {
  background: var(--accent); color: var(--black); border: none;
  border-radius: var(--radius); padding: 10px 16px;
  font-size: 11px; font-weight: 700; letter-spacing: 0.06em;
  white-space: nowrap; transition: all 0.15s;
}
.btn-copy-url:hover { background: var(--accent-hover); }
.snapshot-note {
  font-size: 10px; color: var(--white-dim); letter-spacing: 0.03em; line-height: 1.6;
  background: var(--dark2); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 10px 12px;
}
.snapshot-divider {
  display: flex; align-items: center; gap: 10px;
  font-size: 9px; color: var(--border-light); letter-spacing: 0.12em; text-transform: uppercase;
}
.snapshot-divider::before,
.snapshot-divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
.snapshot-import-box { display: flex; gap: 8px; }
.snapshot-import-input {
  flex: 1; background: var(--dark2); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--white); padding: 10px 12px;
  font-size: 11px; outline: none;
}
.snapshot-import-input:focus { border-color: var(--gold-border); }
.snapshot-import-input::placeholder { color: var(--border-light); }
.btn-import-snap {
  background: transparent; border: 1px solid var(--border-light); color: var(--white-dim);
  border-radius: var(--radius); padding: 10px 14px;
  font-size: 11px; letter-spacing: 0.05em; white-space: nowrap; transition: all 0.2s;
}
.btn-import-snap:hover { border-color: var(--gold-border); color: var(--gold); background: var(--gold-dim); }

/* =====================================================
   PREMIUM MODAL
   ===================================================== */
.premium-modal-top {
  text-align: center; padding: 8px 0 4px;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
}
.premium-modal-badge {
  display: inline-block;
  background: var(--gold-dim); border: 1px solid var(--gold-border);
  color: var(--gold); padding: 5px 14px; border-radius: var(--radius);
  font-size: 10px; font-weight: 700; letter-spacing: 0.18em;
}
.premium-modal-title {
  font-family: var(--font-display); font-size: 26px; font-weight: 700;
  color: var(--white); letter-spacing: 0.02em; line-height: 1.1;
}
.premium-modal-price {
  font-family: var(--font-display); font-size: 40px; font-weight: 700;
  color: var(--gold); line-height: 1;
}

.premium-features-list {
  list-style: none; display: flex; flex-direction: column; gap: 8px;
  border: 1px solid var(--border); border-radius: var(--radius); padding: 14px;
  background: var(--dark2);
}
.premium-features-list li {
  font-size: 12px; color: var(--white-dim); letter-spacing: 0.04em;
  display: flex; align-items: center; gap: 10px;
}
.pf-check { color: var(--accent); font-size: 11px; flex-shrink: 0; }

.btn-gumroad {
  display: block; text-align: center;
  background: var(--gold); color: var(--black); border: none;
  border-radius: var(--radius); padding: 16px 24px;
  font-family: var(--font-display); font-size: 16px; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase;
  transition: all 0.15s;
  box-shadow: 0 3px 0 rgba(0,0,0,0.3);
}
.btn-gumroad:hover {
  background: #f5ca50; transform: translateY(-1px);
  box-shadow: 0 5px 0 rgba(0,0,0,0.3), 0 6px 20px var(--gold-glow);
}

.premium-code-section {
  display: flex; flex-direction: column; gap: 8px;
  padding-top: 12px; border-top: 1px solid var(--border);
}
.premium-code-label { font-size: 10px; color: var(--white-dim); letter-spacing: 0.08em; text-transform: uppercase; }
.premium-code-row   { display: flex; gap: 8px; }
.premium-code-input {
  flex: 1; background: var(--dark2); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--white); padding: 10px 12px;
  font-size: 12px; outline: none; text-transform: uppercase; letter-spacing: 0.08em;
}
.premium-code-input:focus  { border-color: var(--gold-border); }
.premium-code-input::placeholder { text-transform: none; letter-spacing: 0.04em; color: var(--border-light); }
.btn-activate-code {
  background: var(--dark3); border: 1px solid var(--border-light); color: var(--white-dim);
  border-radius: var(--radius); padding: 10px 14px;
  font-size: 11px; letter-spacing: 0.05em; white-space: nowrap; transition: all 0.2s;
}
.btn-activate-code:hover { border-color: var(--gold-border); color: var(--gold); }
.premium-code-msg         { font-size: 11px; min-height: 16px; letter-spacing: 0.04em; transition: color 0.2s; }
.premium-code-msg.success { color: var(--green); }
.premium-code-msg.error   { color: var(--red); }

/* =====================================================
   STATS MODAL
   ===================================================== */
.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.stats-detail-box {
  background: var(--dark2); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 14px; text-align: center;
  border-top: 2px solid var(--accent);
}
.stats-detail-num   { font-family: var(--font-display); font-size: 30px; font-weight: 700; color: var(--accent); line-height: 1; }
.stats-detail-label { font-size: 9px; color: var(--white-dim); letter-spacing: 0.1em; text-transform: uppercase; margin-top: 5px; }

/* =====================================================
   DATENSCHUTZ MODAL
   ===================================================== */
.privacy-text { display: flex; flex-direction: column; gap: 12px; }
.privacy-text p {
  font-size: 11px; color: var(--white-dim); letter-spacing: 0.03em; line-height: 1.75;
}
.privacy-text strong { color: var(--white); display: block; margin-bottom: 2px; }
.privacy-small { font-size: 9px !important; color: var(--border-light) !important; }

/* =====================================================
   WIN OVERLAY
   ===================================================== */
.confetti-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(0,0,0,0.94);
  display: flex; align-items: center; justify-content: center; padding: 24px;
}
.confetti-box {
  text-align: center; display: flex; flex-direction: column;
  align-items: center; gap: 18px; max-width: 360px;
}
.trophy { font-size: 68px; animation: trophy-in 0.8s cubic-bezier(0.34,1.56,0.64,1); }
@keyframes trophy-in { from { transform: scale(0) rotate(-20deg); opacity: 0; } to { transform: scale(1) rotate(0); opacity: 1; } }
.win-title {
  font-family: var(--font-display); font-size: clamp(32px, 9vw, 52px);
  font-weight: 700; line-height: 0.95; color: var(--accent); letter-spacing: -0.02em;
}
.win-sub { font-size: 12px; color: var(--white-dim); letter-spacing: 0.1em; }
.btn-share-win {
  width: 100%; max-width: 280px; padding: 17px;
  background: var(--accent); color: var(--black); border: none;
  border-radius: var(--radius); font-family: var(--font-display);
  font-size: 17px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
  transition: all 0.15s; box-shadow: 0 3px 0 rgba(0,0,0,0.4);
}
.btn-share-win:hover { background: var(--accent-hover); transform: translateY(-2px); }
.btn-restart-win {
  background: transparent; border: 1px solid var(--border-light); color: var(--white-dim);
  padding: 11px 24px; border-radius: var(--radius); font-size: 11px; letter-spacing: 0.06em;
  transition: all 0.2s;
}
.btn-restart-win:hover { border-color: var(--white-dim); color: var(--white); }

/* =====================================================
   ANIMATIONEN
   ===================================================== */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes count-up {
  from { transform: translateY(8px) scale(0.95); opacity: 0; }
  to   { transform: translateY(0) scale(1); opacity: 1; }
}
.day-number.animate { animation: count-up 0.35s cubic-bezier(0.34,1.56,0.64,1); }

/* =====================================================
   RESPONSIVE
   ===================================================== */
@media (max-width: 380px) {
  .container { padding: 72px 14px 60px; gap: 20px; }
  .dots-grid  { gap: 5px; }
  .share-section { flex-direction: column; }
  .social-share-grid { grid-template-columns: 1fr; }
  .day-number { font-size: clamp(80px, 22vw, 120px); }
}
