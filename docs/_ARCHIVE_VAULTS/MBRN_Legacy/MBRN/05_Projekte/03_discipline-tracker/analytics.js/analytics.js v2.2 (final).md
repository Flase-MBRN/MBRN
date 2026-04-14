// ============================================================

//  DISZIPLIN CHALLENGE v2.0  –  analytics.js

//  Vollständig lokales Analytics-System (kein Backend, kein Tracking)

//  Trackt: Besuche, Check-ins, Shares, Downloads, Conversions

// ============================================================

  

(function () {

  

  const AK = 'dc_analytics_v1'; // Analytics-Key

  

  // ---- Standard-Struktur ----

  function defaultAnalytics() {

    return {

      totalVisits:      0,

      firstVisit:       null,

      lastVisit:        null,

      totalCheckins:    0,

      totalShares:      0,

      totalDownloads:   0,

      totalSnapshots:   0,

      premiumConvert:   false,

      kofiClicks:       0,

      gumroadClicks:    0,

      challengeCompleted: 0,

      // D1 / D7 Retention (vereinfacht: wird beim Besuch geprüft)

      visitDates:       [],

    };

  }

  

  // ---- Laden / Speichern ----

  function loadAnalytics() {

    try {

      const raw = localStorage.getItem(AK);

      if (!raw) return defaultAnalytics();

      return Object.assign(defaultAnalytics(), JSON.parse(raw));

    } catch { return defaultAnalytics(); }

  }

  

  function saveAnalytics(a) {

    try { localStorage.setItem(AK, JSON.stringify(a)); } catch { /* silent */ }

  }

  

  // ---- Datum ----

  function todayISO() {

    const d = new Date();

    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  }

  

  // ---- Öffentliche Track-Funktionen ----

  window.dcTrack = {

  

    visit() {

      const a = loadAnalytics();

      const today = todayISO();

      a.totalVisits++;

      a.lastVisit = today;

      if (!a.firstVisit) a.firstVisit = today;

      if (!a.visitDates.includes(today)) a.visitDates.push(today);

      // Maximal 60 Daten speichern

      if (a.visitDates.length > 60) a.visitDates = a.visitDates.slice(-60);

      saveAnalytics(a);

    },

  

    checkin() {

      const a = loadAnalytics();

      a.totalCheckins++;

      saveAnalytics(a);

    },

  

    share() {

      const a = loadAnalytics();

      a.totalShares++;

      saveAnalytics(a);

    },

  

    download() {

      const a = loadAnalytics();

      a.totalDownloads++;

      saveAnalytics(a);

    },

  

    snapshot() {

      const a = loadAnalytics();

      a.totalSnapshots++;

      saveAnalytics(a);

    },

  

    kofi() {

      const a = loadAnalytics();

      a.kofiClicks++;

      saveAnalytics(a);

    },

  

    gumroad() {

      const a = loadAnalytics();

      a.gumroadClicks++;

      saveAnalytics(a);

    },

  

    premiumActivated() {

      const a = loadAnalytics();

      a.premiumConvert = true;

      saveAnalytics(a);

    },

  

    challengeCompleted() {

      const a = loadAnalytics();

      a.challengeCompleted++;

      saveAnalytics(a);

    },

  

    // Berechnet D1/D7 Retention (vereinfacht: Anteil Tage mit Besuch)

    getRetention() {

      const a = loadAnalytics();

      if (!a.firstVisit || a.visitDates.length < 2) return { d1: false, d7: 0 };

      const first = new Date(a.firstVisit + 'T00:00:00');

      const today = new Date(todayISO()    + 'T00:00:00');

      const daysSinceFirst = Math.round((today - first) / 86400000);

      // D1: war am Tag 1 wieder da?

      const d1Date = new Date(first.getTime() + 86400000);

      const d1ISO  = `${d1Date.getFullYear()}-${String(d1Date.getMonth()+1).padStart(2,'0')}-${String(d1Date.getDate()).padStart(2,'0')}`;

      const d1 = a.visitDates.includes(d1ISO);

      // D7: wie viele der letzten 7 Tage besucht?

      const last7 = [];

      for (let i = 0; i < 7; i++) {

        const d = new Date(today.getTime() - i * 86400000);

        last7.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);

      }

      const d7 = last7.filter(day => a.visitDates.includes(day)).length;

      return { d1, d7, daysSinceFirst };

    },

  

    // Gibt aufbereitete Stats für das Stats-Modal zurück

    getSummary() {

      const a = loadAnalytics();

      const r = window.dcTrack.getRetention();

      return {

        totalVisits:      a.totalVisits,

        totalCheckins:    a.totalCheckins,

        totalShares:      a.totalShares,

        totalDownloads:   a.totalDownloads,

        kofiClicks:       a.kofiClicks,

        gumroadClicks:    a.gumroadClicks,

        d7Active:         r.d7,

        daysSinceStart:   r.daysSinceFirst || 0,

        premiumConvert:   a.premiumConvert,

        challengeCompleted: a.challengeCompleted,

      };

    }

  };

  

  // ---- Stats Modal befüllen ----

  window.renderStatsModal = function () {

    const grid = document.getElementById('stats-detail-grid');

    if (!grid) return;

  

    const s = window.dcTrack.getSummary();

    const items = [

      { num: s.totalVisits,    label: 'Gesamtbesuche' },

      { num: s.totalCheckins,  label: 'Check-ins' },

      { num: s.totalShares,    label: 'Geteilt' },

      { num: s.totalDownloads, label: 'Downloads' },

      { num: s.d7Active + '/7', label: 'Aktiv (7 Tage)' },

      { num: s.daysSinceStart, label: 'Tage dabei' },

    ];

    grid.innerHTML = items.map(i => `

      <div class="stats-detail-box">

        <div class="stats-detail-num">${i.num}</div>

        <div class="stats-detail-label">${i.label}</div>

      </div>

    `).join('');

  };

  

  // ---- Seitenbesuch tracken ----

  document.addEventListener('DOMContentLoaded', () => {

    window.dcTrack.visit();

  });

  

})();