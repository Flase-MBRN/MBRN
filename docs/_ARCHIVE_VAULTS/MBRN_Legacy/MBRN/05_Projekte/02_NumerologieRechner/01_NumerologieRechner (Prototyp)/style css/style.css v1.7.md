/* style.css v1.7 Modernized */

  

/* Theme Variables */

:root {

    --bg: #0b1220;

    --card-bg: rgba(255,255,255,0.02);

    --text: #e6eef6;

    --muted: #9aa4b2;

    --radius: 14px;

    --shadow: 0 10px 28px rgba(2,6,23,0.55);

    --max-width: 840px;

    --life-color: #2f9d63;

    --soul-color: #2b6fb6;

    --expression-color: #cfa324;

    --personality-color: #7a4bd6;

    --master-color: #d4af37;

    --danger: #ff6b6b;

  }

  /* Base Reset */

  * { box-sizing: border-box; }

  html, body {

    margin: 0;

    padding: 36px 18px;

    font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;

    background:

      radial-gradient(700px 350px at 8% 10%, rgba(47,157,99,0.035), transparent 6%),

      radial-gradient(900px 400px at 92% 90%, rgba(43,111,182,0.02), transparent 6%),

      var(--bg);

    color: var(--text);

    -webkit-font-smoothing: antialiased;

    -moz-osx-font-smoothing: grayscale;

    display: flex;

    flex-direction: column;

    align-items: center;

  }

  /* Header */

  h1 {

    margin: 0 0 18px;

    font-size: 1.7rem;

    letter-spacing: 0.2px;

    color: var(--text);

  }

  /* Container */

  .container {

    width: 100%;

    max-width: var(--max-width);

    display: grid;

    grid-template-columns: 1fr 420px;

    gap: 22px;

    align-items: start;

  }

  @media (max-width: 920px) {

    .container { grid-template-columns: 1fr; }

  }

  /* Form Card */

  .form-card {

    background: var(--card-bg);

    border-radius: var(--radius);

    padding: 24px;

    border: 1px solid rgba(255,255,255,0.04);

    box-shadow: var(--shadow);

    transition: transform .12s ease, box-shadow .14s ease;

  }

  .form-card:hover { transform: translateY(-2px); }

  /* Results Card */

  .results-card {

    background: linear-gradient(180deg, rgba(255,255,255,0.017), rgba(255,255,255,0.01));

    border-radius: var(--radius);

    padding: 20px;

    border: 1px solid rgba(255,255,255,0.03);

    box-shadow: 0 6px 22px rgba(2,6,23,0.28);

    min-height: 160px;

  }

  /* Inputs */

  label { font-size: 0.95rem; color: var(--muted); display: block; margin-bottom: 6px; }

  .input-row { margin-bottom: 16px; }

  input[type="text"] {

    width: 100%;

    padding: 12px 14px;

    border-radius: 10px;

    border: 1px solid rgba(255,255,255,0.04);

    background: rgba(0,0,0,0.18);

    color: var(--text);

    font-size: 1rem;

    outline: none;

    transition: box-shadow .14s ease, border-color .12s ease, transform .12s ease;

  }

  input::placeholder { color: rgba(230,238,246,0.45); }

  input:focus {

    box-shadow: 0 8px 32px rgba(43,111,182,0.12);

    border-color: rgba(43,111,182,0.5);

    transform: translateY(-1px);

  }

  input.input-invalid { border-color: var(--danger); }

  .error { min-height: 18px; font-size: 0.9rem; color: var(--danger); margin-top: 6px; }

  /* Buttons */

  button {

    display: inline-flex;

    align-items: center;

    justify-content: center;

    width: 100%;

    padding: 12px 14px;

    border-radius: 10px;

    border: none;

    cursor: pointer;

    background: linear-gradient(90deg, rgba(96,165,250,0.14), rgba(110,231,183,0.08));

    color: var(--text);

    font-weight: 700;

    letter-spacing: 0.2px;

    transition: transform .12s ease, box-shadow .12s ease;

  }

  button:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(43,111,182,0.12); }

  button[disabled] { opacity: 0.5; cursor: not-allowed; }

  /* Results Grid */

  .results-grid {

    display: grid;

    grid-template-columns: repeat(2, 1fr);

    gap: 14px;

    margin-top: 14px;

    align-items: stretch;

    grid-auto-rows: 1fr;

  }

  @media (max-width: 480px) { .results-grid { grid-template-columns: 1fr; } }

  /* Result Tile - Modern Glass Look */

  .result-tile {

    display: flex;

    flex-direction: column;

    justify-content: flex-start;

    align-items: center;

    padding: 20px;

    border-radius: var(--radius);

    border: 1px solid rgba(255,255,255,0.03);

    background: rgba(255,255,255,0.04);

    backdrop-filter: blur(10px);

    transition: transform .12s ease, box-shadow .14s ease;

    min-height: 150px;

  }

  .result-tile:hover {

    transform: translateY(-3px);

    box-shadow: 0 12px 28px rgba(43,111,182,0.12);

  }

  /* Result Title & Tooltip */

  .result-title {

    font-size: 0.88rem;

    color: var(--muted);

    margin-bottom: 8px;

    display: flex;

    align-items: center;

    gap: 8px;

    justify-content: center;

    min-height: 28px;

    text-align: center;

    padding: 0 6px;

  }

  .tooltip {

    display: inline-flex;

    align-items: center;

    justify-content: center;

    width: auto;

    height: 18px;

    padding: 0 6px;

    border-radius: 6px;

    cursor: help;

    color: rgba(230,238,246,0.78);

    background: transparent;

    position: relative;

    font-size: 0.85rem;

  }

  .tooltip::after {

    content: attr(title);

    position: absolute;

    left: 50%;

    transform: translateX(-50%) translateY(10px);

    bottom: calc(100% + 10px);

    background: rgba(10,14,20,0.95);

    color: #fff;

    padding: 8px 10px;

    border-radius: 8px;

    font-size: 0.8rem;

    white-space: nowrap;

    opacity: 0;

    pointer-events: none;

    transition: opacity .14s ease, transform .14s ease;

    z-index: 60;

    box-shadow: 0 8px 20px rgba(2,6,23,0.6);

  }

  .tooltip:hover::after, .tooltip:focus::after { opacity: 1; transform: translateX(-50%) translateY(0); }

  /* Result Value */

  .result-value {

    font-size: 1.95rem;

    font-weight: 800;

    letter-spacing: 0.6px;

    color: #fff;

    margin-bottom: 6px;

  }

  .life-number .result-value { color: var(--life-color); font-size: 2.2rem; }

  .soul-number .result-value { color: var(--soul-color); }

  .expression-number .result-value { color: var(--expression-color); }

  .personality-number .result-value { color: var(--personality-color); }

  /* Master Number Glow (Subtil) */

  .result-value.master {

    color: var(--master-color) !important;

    text-shadow: 0 0 6px rgba(212,175,55,0.45);

    animation: masterGlow 1.2s ease-in-out infinite alternate;

  }

  @keyframes masterGlow {

    from { filter: drop-shadow(0 0 4px rgba(212,175,55,0.35)); }

    to   { filter: drop-shadow(0 0 12px rgba(212,175,55,0.65)); }

  }

  /* Explanation Text */

  .result-explanation {

    font-size: 0.85rem;

    color: var(--muted);

    text-align: center;

    margin-top: 6px;

    line-height: 1.2rem;

    min-height: 24px;

  }

  /* Extra Numbers Tiles */

  #extraNumbersGrid .result-tile {

    border-style: dashed;

    opacity: 0.95;

  }

  /* Helper Text */

  .helper {

    font-size: 0.9rem;

    color: var(--muted);

    margin-top: 6px;

    text-align: center;

  }

  /* Accessibility: reduced motion */

  @media (prefers-reduced-motion: reduce) {

    * { transition: none !important; animation: none !important; transform: none !important; }

  }