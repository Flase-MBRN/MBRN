/* style.css v1.4 - Visuelles Highlighting & Master Numbers */

/* Theme & Basis */
:root{
  --bg: #0f1724;
  --text: #e6eef6;
  --muted: #9aa4b2;
  --radius: 12px;
  --shadow: 0 8px 30px rgba(2,6,23,0.6);
  --max-width: 720px;

  /* Farben Kernzahlen */
  --life-color: #22c55e;        /* Lebenszahl: grün */
  --soul-color: #3b82f6;        /* Seelenzahl: blau */
  --expression-color: #facc15;  /* Ausdruckszahl: gelb */
  --personality-color: #8b5cf6; /* Persönlichkeitszahl: violett */
  --master-color: #ffd700;      /* Master Numbers: gold */
}

/* Base */
* { box-sizing: border-box; }
html, body {
  margin: 0;
  padding: 36px 20px;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  background: var(--bg);
  color: var(--text);
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Header */
h1 {
  font-size: 1.6rem;
  text-align: center;
  margin-bottom: 22px;
  background: -webkit-linear-gradient(90deg, #e6f9f0, #dfeeff);
  -webkit-background-clip: text;
  color: transparent;
}

/* Container */
.container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  width: 100%;
  max-width: var(--max-width);
}
@media(max-width:720px){ .container { grid-template-columns: 1fr; } }

/* Form Card */
.form-card {
  background: rgba(255,255,255,0.02);
  border-radius: var(--radius);
  padding: 22px;
  border: 1px solid rgba(255,255,255,0.05);
  box-shadow: var(--shadow);
}

/* Inputs */
input[type="text"] {
  width: 100%;
  padding: 12px 14px;
  margin-top: 4px;
  margin-bottom: 6px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.04);
  background: rgba(255,255,255,0.02);
  color: var(--text);
  font-size: 1rem;
  outline: none;
  transition: all 0.15s ease;
}
input:focus {
  border-color: rgba(96,165,250,0.5);
  box-shadow: 0 6px 20px rgba(96,165,250,0.12);
  transform: translateY(-1px);
}
.error {
  min-height: 18px;
  font-size: 0.9rem;
  color: #ff6b6b;
  margin-top: 2px;
}

/* Button */
button {
  padding: 12px 16px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(90deg,#6ee7b7,#60a5fa);
  color: #041124;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 10px;
  width: 100%;
}
button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(96,165,250,0.2);
}

/* Results Card */
.results-card {
  background: rgba(255,255,255,0.02);
  border-radius: var(--radius);
  padding: 18px;
  border: 1px solid rgba(255,255,255,0.03);
  min-height: 140px;
}

/* Results Grid */
.results-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 12px;
}
@media(max-width:480px){ .results-grid { grid-template-columns: 1fr; } }

/* Result Tiles */
.result-tile {
  background: rgba(255,255,255,0.03);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255,255,255,0.04);
  text-align: center;
  transition: transform 0.12s ease, box-shadow 0.14s ease;
  position: relative;
}
.result-tile:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(2,6,23,0.4);
}
.result-title { font-size: 0.85rem; color: #9aa4b2; margin-bottom: 6px; }
.result-value { font-size: 2rem; font-weight: 700; color: #fff; letter-spacing: 0.8px; }

/* Farbcoding Kernzahlen */
.life-number .result-value { color: var(--life-color); font-size: 2.4rem; font-weight: 800; }
.soul-number .result-value { color: var(--soul-color); }
.expression-number .result-value { color: var(--expression-color); }
.personality-number .result-value { color: var(--personality-color); }

/* Master Number Highlighting */
.result-value.master {
  color: var(--master-color);
  text-shadow: 0 0 8px rgba(255,215,0,0.8);
  animation: glowMaster 1.2s ease-in-out infinite alternate;
}
@keyframes glowMaster {
  0% { text-shadow: 0 0 8px rgba(255,215,0,0.6); }
  100% { text-shadow: 0 0 18px rgba(255,215,0,1); }
}

/* Tooltip */
.tooltip { font-size: 0.8rem; cursor: help; margin-left: 4px; }
.tooltip:hover::after {
  content: attr(title);
  position: absolute;
  left: 50%;
  bottom: 125%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.75);
  color: #fff;
  padding: 6px 10px;
  border-radius: 6px;
  white-space: nowrap;
  z-index: 10;
  font-size: 0.75rem;
  pointer-events: none;
}