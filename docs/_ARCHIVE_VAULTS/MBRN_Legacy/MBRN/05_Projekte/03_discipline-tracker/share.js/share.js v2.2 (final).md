// ============================================================

//  DISZIPLIN CHALLENGE v2.1  –  share.js

//  Patches applied (ChatGPT review):

//    - SITE_URL dynamisch via location.origin (deployment-neutral)

//    - Snapshot: btoa + encodeURIComponent (URL-safe Base64)

//    - decodeSnapshot: decodeURIComponent + atob

//    - drawAutoSizeNumber: sicherer Cross-Browser-Shadow

// ============================================================

  

(function () {

  

  const CARD_SIZE  = 1080;

  const TOTAL_DAYS = 30;

  

  // Dynamisch – passt zu GitHub Pages, Netlify und jedem anderen Host

  const SITE_URL = (function () {

    try {

      return location.origin + location.pathname.replace(/\/$/, '');

    } catch {

      return 'https://disziplin-challenge.netlify.app';

    }

  })();

  

  // ============================================================

  //  SNAPSHOT URL  –  URL-sicheres Base64

  // ============================================================

  

  window.encodeSnapshot = function (state) {

    try {

      const payload = {

        d:  state.completedDays || 0,

        dd: (state.doneDates || []).slice(-30),

        bs: state.bestStreak  || 0,

        sa: state.startedAt   || null,

      };

      const b64 = btoa(JSON.stringify(payload));

      // encodeURIComponent verhindert kaputte Links in WhatsApp/Telegram/Mail

      return SITE_URL + '?snap=' + encodeURIComponent(b64);

    } catch {

      return SITE_URL;

    }

  };

  

  window.decodeSnapshot = function (param) {

    try {

      const decoded = decodeURIComponent(param);

      const payload = JSON.parse(atob(decoded));

      return {

        completedDays: payload.d  || 0,

        doneDates:     payload.dd || [],

        bestStreak:    payload.bs || 0,

        startedAt:     payload.sa || null,

        lastDoneDate:  (payload.dd && payload.dd.length > 0)

          ? payload.dd[payload.dd.length - 1] : null,

        completedAt:   null,

        _readOnly:     true,

      };

    } catch {

      return null;

    }

  };

  

  // ============================================================

  //  SHARE TEXT

  // ============================================================

  

  function buildShareText(done, snapUrl) {

    const pct = Math.round((done / TOTAL_DAYS) * 100);

    return [

      `🔥 Ich bin bei Tag ${done}/30 meiner Disziplin-Challenge (${pct}%)!`,

      `Machst du mit? 👉 ${snapUrl || SITE_URL}`,

      `#30TageDisziplin #DisziplinChallenge #30DayChallenge`,

    ].join('\n');

  }

  

  // ============================================================

  //  SOCIAL SHARE BUTTONS

  // ============================================================

  

  window.initShareButtons = function (state) {

    const snapUrl = window.encodeSnapshot(state);

    const done    = state.completedDays || 0;

    const text    = buildShareText(done, snapUrl);

    const textEnc = encodeURIComponent(text);

  

    const btnWA = document.getElementById('btn-share-whatsapp');

    if (btnWA) {

      btnWA.onclick = () => {

        window.open(`https://wa.me/?text=${textEnc}`, '_blank');

        if (window.dcTrack) window.dcTrack.share();

      };

    }

  

    const btnTW = document.getElementById('btn-share-twitter');

    if (btnTW) {

      btnTW.onclick = () => {

        window.open(`https://twitter.com/intent/tweet?text=${textEnc}`, '_blank');

        if (window.dcTrack) window.dcTrack.share();

      };

    }

  

    const btnCopy = document.getElementById('btn-share-copy');

    if (btnCopy) {

      btnCopy.onclick = () => {

        navigator.clipboard.writeText(snapUrl).then(() => {

          btnCopy.innerHTML = '<span class="social-icon">✓</span> Kopiert!';

          setTimeout(() => { btnCopy.innerHTML = '<span class="social-icon">🔗</span> Link kopieren'; }, 2000);

        }).catch(() => {

          // Fallback für ältere Browser / iOS

          const ta = document.createElement('textarea');

          ta.value = snapUrl;

          document.body.appendChild(ta);

          ta.select();

          document.execCommand('copy');

          document.body.removeChild(ta);

          btnCopy.innerHTML = '<span class="social-icon">✓</span> Kopiert!';

          setTimeout(() => { btnCopy.innerHTML = '<span class="social-icon">🔗</span> Link kopieren'; }, 2000);

        });

        if (window.dcTrack) window.dcTrack.share();

      };

    }

  

    const btnDl = document.getElementById('btn-share-download');

    if (btnDl) {

      btnDl.onclick = () => {

        generateShareCard(state);

        if (window.dcTrack) window.dcTrack.download();

      };

    }

  };

  

  // ============================================================

  //  CANVAS SHARE-CARD

  // ============================================================

  

  window.generateShareCard = function (state) {

    const isPrem = window.dcPremium && window.dcPremium.isPremium && window.dcPremium.isPremium();

    const canvas = document.createElement('canvas');

    canvas.width = canvas.height = CARD_SIZE;

    const ctx    = canvas.getContext('2d');

    const done   = (state && typeof state.completedDays === 'number') ? state.completedDays : 0;

  

    if (isPrem) drawPremiumCard(ctx, done);

    else        drawStandardCard(ctx, done);

  

    const link    = document.createElement('a');

    link.download = `disziplin-tag-${pad(done)}.png`;

    link.href     = canvas.toDataURL('image/png');

    link.click();

  };

  

  function drawStandardCard(ctx, done) {

    ctx.fillStyle = '#0a0a0a';

    ctx.fillRect(0, 0, CARD_SIZE, CARD_SIZE);

    drawGridLines(ctx, 'rgba(232,255,59,0.04)');

    ctx.fillStyle = '#e8ff3b';

    ctx.fillRect(0, 0, CARD_SIZE, 8);

    ctx.fillRect(0, CARD_SIZE - 8, CARD_SIZE, 8);

    drawCanvasText(ctx, '30-TAGE DISZIPLIN CHALLENGE', CARD_SIZE / 2, 78,

      '500 26px monospace', 'rgba(232,255,59,0.7)', 'center');

    drawAutoSizeNumber(ctx, done, '#e8ff3b', 390);

    const label = done === 0         ? 'CHALLENGE GESTARTET'

                : done === TOTAL_DAYS ? 'CHALLENGE ABGESCHLOSSEN 🏆'

                :                      `${done} VON ${TOTAL_DAYS} TAGEN ABGESCHLOSSEN`;

    drawCanvasText(ctx, label, CARD_SIZE / 2, 590, '400 32px monospace', 'rgba(240,240,240,0.5)', 'center');

    drawCanvasProgressBar(ctx, done, '#e8ff3b', '#f0ff6e', 616);

    drawDotGrid(ctx, done, '#e8ff3b', '#1a1a1a');

    drawCanvasText(ctx, SITE_URL.replace('https://', ''), CARD_SIZE / 2, CARD_SIZE - 26,

      '400 20px monospace', 'rgba(240,240,240,0.2)', 'center');

  }

  

  function drawPremiumCard(ctx, done) {

    ctx.fillStyle = '#0d0c00';

    ctx.fillRect(0, 0, CARD_SIZE, CARD_SIZE);

    drawGridLines(ctx, 'rgba(255,215,0,0.04)');

    ctx.fillStyle = '#ffd700';

    ctx.fillRect(0, 0, CARD_SIZE, 8);

    ctx.fillRect(0, CARD_SIZE - 8, CARD_SIZE, 8);

    drawCanvasText(ctx, '✦ 30-TAGE DISZIPLIN CHALLENGE ✦', CARD_SIZE / 2, 78,

      '500 24px monospace', 'rgba(255,215,0,0.8)', 'center');

    drawAutoSizeNumber(ctx, done, '#ffd700', 390);

    const label = done === TOTAL_DAYS

      ? '✦ CHALLENGE ABGESCHLOSSEN ✦'

      : `${done} VON ${TOTAL_DAYS} TAGEN`;

    drawCanvasText(ctx, label, CARD_SIZE / 2, 590, '400 32px monospace', 'rgba(255,215,0,0.7)', 'center');

    drawCanvasProgressBar(ctx, done, '#ffd700', '#ffe566', 616);

    drawDotGrid(ctx, done, '#ffd700', '#1a0f00');

    drawCanvasText(ctx, '✦ PREMIUM · ' + SITE_URL.replace('https://', ''), CARD_SIZE / 2, CARD_SIZE - 26,

      '400 18px monospace', 'rgba(255,215,0,0.3)', 'center');

  }

  

  // ============================================================

  //  CANVAS HELPERS

  // ============================================================

  

  function drawGridLines(ctx, color) {

    ctx.strokeStyle = color;

    ctx.lineWidth   = 1;

    const step = 54;

    for (let x = 0; x <= CARD_SIZE; x += step) {

      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CARD_SIZE); ctx.stroke();

    }

    for (let y = 0; y <= CARD_SIZE; y += step) {

      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CARD_SIZE, y); ctx.stroke();

    }

  }

  

  function drawCanvasText(ctx, text, x, y, font, color, align) {

    ctx.fillStyle    = color;

    ctx.font         = font;

    ctx.textAlign    = align || 'center';

    ctx.textBaseline = 'alphabetic';

    ctx.shadowBlur   = 0; // reset before text, avoid carry-over

    ctx.fillText(text, x, y);

  }

  

  // Auto-sizing + cross-browser-sicherer Schatten (ChatGPT Fix)

  function drawAutoSizeNumber(ctx, done, color, centerY) {

    const text = pad(done);

    let fontSize = 380;

    const maxW   = CARD_SIZE * 0.70;

  

    ctx.textAlign    = 'center';

    ctx.textBaseline = 'middle';

    ctx.fillStyle    = color;

  

    ctx.font = `bold ${fontSize}px Arial, sans-serif`;

    while (ctx.measureText(text).width > maxW && fontSize > 80) {

      fontSize = Math.floor(fontSize * 0.9);

      ctx.font = `bold ${fontSize}px Arial, sans-serif`;

    }

  

    // Einfacher, cross-browser-sicherer Schatten

    ctx.shadowColor  = 'rgba(0,0,0,0.25)';

    ctx.shadowBlur   = 40;

    ctx.shadowOffsetX = 0;

    ctx.shadowOffsetY = 0;

    ctx.fillText(text, CARD_SIZE / 2, centerY);

  

    // Shadow immer direkt nach dem Text zurücksetzen

    ctx.shadowBlur   = 0;

    ctx.shadowColor  = 'transparent';

  

    // "/ 30" daneben

    ctx.fillStyle    = 'rgba(240,240,240,0.22)';

    ctx.font         = '300 108px Arial, sans-serif';

    ctx.textBaseline = 'alphabetic';

    ctx.fillText(`/ ${TOTAL_DAYS}`, CARD_SIZE / 2 + 148, centerY + 50);

  }

  

  function drawCanvasProgressBar(ctx, done, colorStart, colorEnd, y) {

    const x = 80, w = CARD_SIZE - 160, h = 22;

    const pct = done / TOTAL_DAYS;

  

    ctx.shadowBlur  = 0;

    ctx.fillStyle   = '#1a1a1a';

    ctx.strokeStyle = '#2a2a2a';

    ctx.lineWidth   = 1;

    roundRect(ctx, x, y, w, h, 4, true, true);

  

    if (pct > 0) {

      const grad = ctx.createLinearGradient(x, 0, x + w, 0);

      grad.addColorStop(0, colorStart);

      grad.addColorStop(1, colorEnd);

      ctx.fillStyle = grad;

      roundRect(ctx, x, y, Math.max(w * pct, 8), h, 4, true, false);

  

      if (pct >= 0.12) {

        ctx.fillStyle    = '#0a0a0a';

        ctx.font         = 'bold 14px monospace';

        ctx.textAlign    = 'right';

        ctx.textBaseline = 'middle';

        ctx.fillText(Math.round(pct * 100) + '%', x + w * pct - 8, y + h / 2);

      }

    }

  }

  

  function drawDotGrid(ctx, done, doneColor, emptyColor) {

    const cols = 10, dotSize = 54, gap = 14;

    const totalW = cols * dotSize + (cols - 1) * gap;

    const startX = (CARD_SIZE - totalW) / 2;

    const startY = 668;

  

    ctx.shadowBlur = 0;

  

    for (let i = 0; i < TOTAL_DAYS; i++) {

      const col = i % cols, row = Math.floor(i / cols);

      const x   = startX + col * (dotSize + gap);

      const y   = startY + row * (dotSize + gap);

      const num = i + 1;

  

      ctx.fillStyle   = num <= done ? doneColor : emptyColor;

      ctx.strokeStyle = num <= done ? doneColor : '#2a2a2a';

      ctx.lineWidth   = 1;

      roundRect(ctx, x, y, dotSize, dotSize, 5, true, true);

  

      ctx.textAlign    = 'center';

      ctx.textBaseline = 'middle';

      if (num <= done) {

        ctx.fillStyle = '#0a0a0a';

        ctx.font      = 'bold 22px monospace';

        ctx.fillText('✓', x + dotSize / 2, y + dotSize / 2);

      } else {

        ctx.fillStyle = '#444';

        ctx.font      = '400 14px monospace';

        ctx.fillText(pad(num), x + dotSize / 2, y + dotSize / 2);

      }

    }

  }

  

  function pad(n) { return String(n).padStart(2, '0'); }

  

  function roundRect(ctx, x, y, w, h, r, fill, stroke) {

    ctx.beginPath();

    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);

    ctx.quadraticCurveTo(x + w, y, x + w, y + r);

    ctx.lineTo(x + w, y + h - r);

    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);

    ctx.lineTo(x + r, y + h);

    ctx.quadraticCurveTo(x, y + h, x, y + h - r);

    ctx.lineTo(x, y + r);

    ctx.quadraticCurveTo(x, y, x + r, y);

    ctx.closePath();

    if (fill)   ctx.fill();

    if (stroke) ctx.stroke();

  }

  

})();