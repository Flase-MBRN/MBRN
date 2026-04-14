/* style.css v1.3 - Modern & responsive UI für Numerologie v1.2 */

/* Theme variables */
:root{
  --bg: #0f1724;
  --text: #e6eef6;
  --muted: #9aa4b2;
  --accent: linear-gradient(90deg,#6ee7b7,#60a5fa);
  --danger: #ff6b6b;
  --radius: 12px;
  --shadow: 0 8px 30px rgba(2,6,23,0.6);
  --max-width: 720px;
}

/* Base */
* { box-sizing: border-box; }
html, body {
  margin: 0;
  padding: 36px 20px;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  background: radial-gradient(1200px 600px at 10% 10%, rgba(96,165,250,0.06), transparent 6%),
              radial-gradient(1000px 500px at 90% 90%, rgba(110,231,183,0.04), transparent 6%),
              var(--bg);
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

@media(max-width:720px){
  .container { grid-template-columns: 1fr; }
}

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
  color: var(--danger);
  margin-top: 2px;
}

/* Button */
button {
  padding: 12px 16px;
  border-radius: 10px;
  border: none;
  background: var(--accent);
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

@media(max-width:480px){
  .results-grid { grid-template-columns: 1fr; }
}

/* Result Tiles */
.result-tile {
  background: rgba(255,255,255,0.03);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255,255,255,0.04);
  text-align: center;
  transition: transform 0.12s ease, box-shadow 0.14s ease;
}

.result-tile:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(2,6,23,0.4);
}

.result-title {
  font-size: 0.85rem;
  color: var(--muted);
  margin-bottom: 6px;
}

.result-value {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.8px;
}

/* Accessibility: reduce motion */
@media (prefers-reduced-motion: reduce){
  * { transition: none !important; transform: none !important; }
}