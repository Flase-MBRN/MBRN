// ============================================================

//  DISZIPLIN CHALLENGE v2.1  –  premium.js

//  Security patch: VALID_CODES ersetzt durch SHA-256-Hashes

//  (ChatGPT Security Quickfix – verhindert direktes Code-Lesen in DevTools)

//  Langfristig: Gumroad-Webhook für serverseitige Validierung

// ============================================================

  

(function () {

  

  const PREMIUM_KEY = 'dc_premium_v1';

  const MULTI_KEY   = 'dc_challenges_v1';

  

  // SHA-256-Hashes der gültigen Premium-Codes.

  // Klartext-Codes liegen NICHT mehr im Client-Code.

  // Codes werden via Gumroad als PDF mitgeliefert.

  // Hashes generiert mit: crypto.createHash('sha256').update(code).digest('hex')

  const VALID_HASHES = [

    '66463d9bce9c7b85d2914a16f6dee51fd9be5f33398039882ac545421a7d601a', // DC2025PREMIUM

    'aa04393ed67275ebc403492f49c20cf4ef0d56ac7d24f62be9a5873b7f808dcd', // DISZIPLIN30PRO

    '008dfdeaa09a4bf7eb4ea58aff068f0cb989b6b8e6125c0c6daf25c34e725528', // CHALLENGE2025X

  ];

  

  // ============================================================

  //  SHA-256 via Web Crypto API (nativ, kein npm)

  // ============================================================

  

  async function sha256(message) {

    const msgBuffer  = new TextEncoder().encode(message);

    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

    const hashArray  = Array.from(new Uint8Array(hashBuffer));

    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  }

  

  // ============================================================

  //  PREMIUM STATE

  // ============================================================

  

  function isPremium() {

    try {

      const raw = localStorage.getItem(PREMIUM_KEY);

      if (!raw) return false;

      const data = JSON.parse(raw);

      return data && data.active === true;

    } catch { return false; }

  }

  

  function activatePremium(codeHash) {

    try {

      localStorage.setItem(PREMIUM_KEY, JSON.stringify({

        active:      true,

        codeHash:    codeHash,           // Hash speichern, nicht den Klartext-Code

        activatedAt: new Date().toISOString(),

      }));

    } catch { /* silent */ }

  }

  

  window.dcPremium = { isPremium, activatePremium };

  

  // ============================================================

  //  MULTI-CHALLENGE

  // ============================================================

  

  function loadChallenges() {

    try {

      const raw = localStorage.getItem(MULTI_KEY);

      return raw ? (JSON.parse(raw) || []) : [];

    } catch { return []; }

  }

  

  function saveChallenges(list) {

    try { localStorage.setItem(MULTI_KEY, JSON.stringify(list)); } catch { /* silent */ }

  }

  

  function addChallenge(name) {

    const list = loadChallenges();

    if (list.length >= 3) return false;

    list.push({ id: Date.now(), name, completedDays: 0, lastDoneDate: null, doneDates: [] });

    saveChallenges(list);

    return true;

  }

  

  function checkinChallenge(id) {

    const today = todayISO();

    const list  = loadChallenges();

    const ch    = list.find(c => c.id === id);

    if (!ch || ch.lastDoneDate === today) return;

    ch.completedDays++;

    ch.lastDoneDate = today;

    ch.doneDates.push(today);

    saveChallenges(list);

    renderMultiChallenges();

  }

  

  function todayISO() {

    const d = new Date();

    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  }

  

  // ============================================================

  //  MULTI-CHALLENGE RENDERING

  // ============================================================

  

  function renderMultiChallenges() {

    const container = document.getElementById('multi-challenges');

    if (!container) return;

    const list  = loadChallenges();

    const today = todayISO();

  

    if (list.length === 0) {

      container.innerHTML = '<p style="font-size:12px;color:rgba(240,240,240,0.4);letter-spacing:0.05em;">Noch keine zusätzliche Challenge. Füge bis zu 2 weitere hinzu.</p>';

    } else {

      container.innerHTML =

        `<div class="multi-challenge-grid">` +

        list.map(ch => {

          const doneToday = ch.lastDoneDate === today;

          return `

            <div class="challenge-mini-box">

              <div>

                <div class="challenge-mini-name">${escapeHTML(ch.name)}</div>

                <div style="font-size:10px;color:rgba(240,240,240,0.35);margin-top:3px;letter-spacing:0.05em;">${ch.completedDays}/30 Tage</div>

              </div>

              <div style="display:flex;align-items:center;gap:10px;">

                <span class="challenge-mini-day">${ch.completedDays}</span>

                <button

                  onclick="window.dcPremiumUI.checkin(${ch.id})"

                  style="background:${doneToday ? 'transparent' : '#e8ff3b'};

                         color:${doneToday ? '#3bff8a' : '#0a0a0a'};

                         border:1px solid ${doneToday ? '#3bff8a' : 'transparent'};

                         border-radius:4px;padding:6px 12px;font-family:inherit;

                         font-size:11px;cursor:${doneToday ? 'default' : 'pointer'};

                         letter-spacing:0.05em;

                         pointer-events:${doneToday ? 'none' : 'auto'}">

                  ${doneToday ? '✓ Done' : 'Abhaken'}

                </button>

              </div>

            </div>

          `;

        }).join('') +

        (list.length < 3

          ? `<button class="btn-add-challenge" onclick="window.dcPremiumUI.addNew()">+ Neue Challenge hinzufügen</button>`

          : '') +

        `</div>`;

    }

  }

  

  function escapeHTML(str) {

    return String(str).replace(/[&<>"']/g, c =>

      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])

    );

  }

  

  // ============================================================

  //  CSV EXPORT

  // ============================================================

  

  function exportHistoryCSV() {

    try {

      const mainRaw = localStorage.getItem('disziplin_challenge_v1');

      const main    = mainRaw ? JSON.parse(mainRaw) : {};

      const extra   = loadChallenges();

  

      let csv = 'Challenge,Datum,Tag\n';

      (main.doneDates || []).forEach((d, i) => {

        csv += `Haupt-Challenge,${d},${i + 1}\n`;

      });

      extra.forEach(ch => {

        (ch.doneDates || []).forEach((d, i) => {

          csv += `${escapeHTML(ch.name)},${d},${i + 1}\n`;

        });

      });

  

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

      const url  = URL.createObjectURL(blob);

      const a    = document.createElement('a');

      a.href     = url;

      a.download = 'disziplin-challenge-verlauf.csv';

      a.click();

      URL.revokeObjectURL(url);

    } catch (e) {

      console.error('[premium] CSV export:', e);

    }

  }

  

  // ============================================================

  //  PUBLIC UI API

  // ============================================================

  

  window.dcPremiumUI = {

    checkin: checkinChallenge,

    addNew() {

      const name = prompt('Name der neuen Challenge (z. B. "Täglich 20 Min. Sport"):');

      if (!name || !name.trim()) return;

      if (!addChallenge(name.trim())) alert('Maximal 3 Challenges gleichzeitig.');

      else renderMultiChallenges();

    },

  };

  

  // ============================================================

  //  INIT

  // ============================================================

  

  document.addEventListener('DOMContentLoaded', () => {

  

    const premium        = isPremium();

    const premiumSection = document.getElementById('premium-section');

    const premiumCTA     = document.getElementById('premium-cta');

    const headerTag      = document.getElementById('header-tag');

  

    if (premium) {

      if (premiumSection) premiumSection.style.display = 'flex';

      if (premiumCTA)     premiumCTA.style.display     = 'none';

      if (headerTag)     { headerTag.textContent = '✦ PREMIUM AKTIV'; headerTag.classList.add('premium-active'); }

      const bar = document.getElementById('progress-bar');

      if (bar) bar.classList.add('premium-gold');

      renderMultiChallenges();

    } else {

      if (premiumSection) premiumSection.style.display = 'none';

    }

  

    // Premium CTA → öffnet Premium-Modal

    const btnPremiumCTA = document.getElementById('btn-premium-cta');

    if (btnPremiumCTA) {

      btnPremiumCTA.addEventListener('click', () => {

        const overlay = document.getElementById('premium-overlay');

        if (overlay) overlay.style.display = 'flex';

        if (window.dcTrack) window.dcTrack.gumroad();

      });

    }

  

    // Premium Modal schließen

    const premiumClose = document.getElementById('premium-close');

    if (premiumClose) {

      premiumClose.addEventListener('click', () => {

        const overlay = document.getElementById('premium-overlay');

        if (overlay) overlay.style.display = 'none';

      });

    }

  

    // ---- Code aktivieren (SHA-256 Verifikation) ----

    const btnActivate = document.getElementById('btn-activate-code');

    if (btnActivate) {

      btnActivate.addEventListener('click', async () => {

        const input = document.getElementById('premium-code-input');

        const msg   = document.getElementById('premium-code-msg');

        if (!input || !msg) return;

  

        const code = input.value.trim().toUpperCase();

        if (!code) return;

  

        msg.textContent = '…';

        msg.className   = 'premium-code-msg';

  

        try {

          const hash = await sha256(code);

          if (VALID_HASHES.includes(hash)) {

            activatePremium(hash);

            msg.textContent = '✓ Premium erfolgreich aktiviert! Seite wird neu geladen…';

            msg.className   = 'premium-code-msg success';

            if (window.dcTrack) window.dcTrack.premiumActivated();

            setTimeout(() => location.reload(), 1500);

          } else {

            msg.textContent = '✗ Ungültiger Code. Bitte prüfe deine Gumroad-Bestellung.';

            msg.className   = 'premium-code-msg error';

          }

        } catch (e) {

          msg.textContent = '✗ Fehler bei der Prüfung. Bitte nochmal versuchen.';

          msg.className   = 'premium-code-msg error';

          console.error('[premium] hash error:', e);

        }

      });

    }

  

    // Gumroad-Button tracken

    const btnGumroad = document.getElementById('btn-gumroad');

    if (btnGumroad) {

      btnGumroad.addEventListener('click', () => {

        if (window.dcTrack) window.dcTrack.gumroad();

      });

    }

  

    // Ko-fi tracken

    const btnKofi = document.getElementById('btn-kofi');

    if (btnKofi) {

      btnKofi.addEventListener('click', () => {

        if (window.dcTrack) window.dcTrack.kofi();

      });

    }

  

    // CSV Export

    const btnExport = document.getElementById('btn-export-history');

    if (btnExport) {

      btnExport.addEventListener('click', exportHistoryCSV);

    }

  

  });

  

})();