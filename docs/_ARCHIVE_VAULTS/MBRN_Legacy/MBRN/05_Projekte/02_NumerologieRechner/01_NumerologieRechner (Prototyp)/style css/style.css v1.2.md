/* style.css v1.2 - Modern, responsive UI for Numerology v1.0 */

/* Theme variables */
:root{
  --bg: #0f1724;            /* deep navy background */
  --card: rgba(255,255,255,0.03);
  --card-strong: rgba(255,255,255,0.04);
  --glass: rgba(255,255,255,0.04);
  --muted: #9aa4b2;
  --text: #e6eef6;
  --accent: linear-gradient(90deg,#6ee7b7 0%,#60a5fa 100%); /* mint -> sky */
  --accent-solid: #60a5fa;
  --accent-2: #6ee7b7;
  --danger: #ff6b6b;
  --radius: 12px;
  --shadow: 0 8px 30px rgba(2,6,23,0.6);
  --glass-border: rgba(255,255,255,0.06);
  --max-width: 640px;
}

/* Base */
* { box-sizing: border-box; }
html,body {
  height: 100%;
  margin: 0;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  background: radial-gradient(1200px 600px at 10% 10%, rgba(96,165,250,0.06), transparent 6%),
              radial-gradient(1000px 500px at 90% 90%, rgba(110,231,183,0.04), transparent 6%),
              var(--bg);
  color: var(--text);
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 36px 20px;
}

/* Header */
h1 {
  margin: 0 0 22px;
  font-size: 1.6rem;
  letter-spacing: 0.2px;
  background: -webkit-linear-gradient(90deg, #e6f9f0, #dfeeff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-align: center;
}

/* Container card */
.container {
  width: 100%;
  max-width: var(--max-width);
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 22px;
  align-items: start;
}

/* Fallback single column on small screens */
@media (max-width: 880px) {
  .container { grid-template-columns: 1fr; padding: 0 8px; }
}

/* Form card */
.form-card {
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius);
  padding: 22px;
  box-shadow: var(--shadow);
  backdrop-filter: blur(8px) saturate(120%);
}

/* Results card */
.results-card {
  background: linear-gradient(180deg, rgba(96,165,250,0.06), rgba(110,231,183,0.03));
  border-radius: var(--radius);
  padding: 18px;
  border: 1px solid rgba(255,255,255,0.03);
  min-height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Form layout */
label {
  display: block;
  font-size: 0.95rem;
  color: var(--muted);
  margin-bottom: 8px;
}

.input-row {
  margin-bottom: 14px;
}

/* Inputs */
input[type="text"] {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.04);
  background: rgba(255,255,255,0.02);
  color: var(--text);
  font-size: 1rem;
  transition: transform .12s ease, box-shadow .14s ease, border-color .12s ease;
  outline: none;
}

/* placeholder style */
input::placeholder { color: rgba(230,238,246,0.45); }

/* Focus state */
input:focus{
  box-shadow: 0 6px 20px rgba(96,165,250,0.12);
  border: 1px solid rgba(96,165,250,0.5);
  transform: translateY(-1px);
}

/* Error state */
.error { min-height: 18px; margin-top:6px; color: var(--danger); font-size:0.9rem; }
.input-error { border-color: rgba(255,107,107,0.9) !important; box-shadow: 0 6px 18px rgba(255,107,107,0.06) !important; }

/* Button */
button {
  appearance: none;
  -webkit-appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  color: #041124;
  background: var(--accent);
  background-size: 200% 200%;
  transition: transform .12s ease, background-position .3s ease, box-shadow .12s ease;
  box-shadow: 0 8px 22px rgba(96,165,250,0.12);
}

/* Button hover/active */
button:hover { transform: translateY(-3px); background-position: 100% 0; }
button:active { transform: translateY(0); box-shadow: 0 6px 18px rgba(96,165,250,0.08); }

/* Small muted helper text */
.helper { font-size: 0.9rem; color: var(--muted); margin-top: 6px; }

/* Results layout */
.results-grid {
  display: grid;
  grid-template-columns: repeat(2,1fr);
  gap: 12px;
}
@media (max-width:480px){ .results-grid { grid-template-columns: 1fr; } }

.result-tile {
  background: rgba(255,255,255,0.02);
  border-radius: 10px;
  padding: 12px;
  border: 1px solid rgba(255,255,255,0.03);
  text-align: center;
}
.result-title { font-size: 0.85rem; color: var(--muted); margin-bottom: 8px; }
.result-value { font-size: 1.6rem; font-weight:700; color: #fff; letter-spacing: 0.6px; }

/* subtle footer / credit area */
.footer {
  width: 100%;
  max-width: var(--max-width);
  margin-top: 18px;
  color: rgba(230,238,246,0.35);
  font-size: 0.85rem;
  text-align: center;
}

/* Accessibility: reduce motion */
@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; animation: none !important; transform: none !important; }
}

/* Light-theme alternative (optional) */
@media (prefers-color-scheme: light) {
  :root{
    --bg: #f6fbff;
    --text: #0b1220;
    --muted: #45546a;
    --card: rgba(10,17,28,0.02);
    --glass-border: rgba(2,6,23,0.04);
  }
  input { background: #fff; border-color: rgba(2,6,23,0.06); color: var(--text); }
  .results-card { background: linear-gradient(180deg,#e9f9f5,#eef6ff); color: var(--text); }
}