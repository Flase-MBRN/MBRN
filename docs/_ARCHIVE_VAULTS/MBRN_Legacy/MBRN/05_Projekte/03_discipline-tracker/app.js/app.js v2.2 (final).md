// ============================================================

//  DISZIPLIN CHALLENGE v2.2  –  app.js

//  v2.2 changes: new nav premium button, premium-cta always visible,

//                updated DOM refs for redesigned HTML structure

// ============================================================

  

const TOTAL_DAYS  = 30;

const STORAGE_KEY = 'disziplin_challenge_v1';

  

// ============================================================

//  DOM-REFERENZEN

// ============================================================

  

let elCurrentDay, elDayLabel, elProgressBar, elProgressPct, elDotsGrid;

let elBtnDone, elBtnHint, elBtnReset, elStatusText, elShareSection;

let elStatsRow, elStatStreak, elStatBest, elStatRemain;

let elBtnShare, elBtnSnapshot, elModalOverlay, elModalClose;

let elShareDayNum, elShareDots, elConfetti, elBtnShareWin, elBtnRestartWin;

let elSnapshotOverlay, elSnapshotClose, elSnapshotInput, elBtnCopySnap;

let elSnapshotImportInput, elBtnImportSnap, elSnapshotBanner, elBtnOwnStart;

let elPremiumCTA, elStatsOverlay, elStatsClose, elPrivacyOverlay, elPrivacyClose;

let elOnboardingOverlay, elBtnOnboardingNext;

let elStatusDot;

  

let _isReadOnly = false;

  

function initDOMRefs() {

  elCurrentDay          = document.getElementById('current-day');

  elDayLabel            = document.getElementById('day-label');

  elProgressBar         = document.getElementById('progress-bar');

  elProgressPct         = document.getElementById('progress-percent');

  elDotsGrid            = document.getElementById('dots-grid');

  elBtnDone             = document.getElementById('btn-done');

  elBtnHint             = document.getElementById('btn-hint');

  elBtnReset            = document.getElementById('btn-reset');

  elStatusText          = document.getElementById('status-text');

  elShareSection        = document.getElementById('share-section');

  elStatsRow            = document.getElementById('stats-row');

  elStatStreak          = document.getElementById('stat-streak');

  elStatBest            = document.getElementById('stat-best');

  elStatRemain          = document.getElementById('stat-remaining');

  elBtnShare            = document.getElementById('btn-share');

  elBtnSnapshot         = document.getElementById('btn-snapshot');

  elModalOverlay        = document.getElementById('modal-overlay');

  elModalClose          = document.getElementById('modal-close');

  elShareDayNum         = document.getElementById('share-day-number');

  elShareDots           = document.getElementById('share-dots');

  elConfetti            = document.getElementById('confetti-overlay');

  elBtnShareWin         = document.getElementById('btn-share-win');

  elBtnRestartWin       = document.getElementById('btn-restart-win');

  elSnapshotOverlay     = document.getElementById('snapshot-overlay');

  elSnapshotClose       = document.getElementById('snapshot-close');

  elSnapshotInput       = document.getElementById('snapshot-url-input');

  elBtnCopySnap         = document.getElementById('btn-copy-snapshot');

  elSnapshotImportInput = document.getElementById('snapshot-import-input');

  elBtnImportSnap       = document.getElementById('btn-import-snap');

  elSnapshotBanner      = document.getElementById('snapshot-banner');

  elBtnOwnStart         = document.getElementById('btn-own-start');

  elPremiumCTA          = document.getElementById('premium-cta');

  elStatsOverlay        = document.getElementById('stats-overlay');

  elStatsClose          = document.getElementById('stats-close');

  elPrivacyOverlay      = document.getElementById('privacy-overlay');

  elPrivacyClose        = document.getElementById('privacy-close');

  elOnboardingOverlay   = document.getElementById('onboarding-overlay');

  elBtnOnboardingNext   = document.getElementById('btn-onboarding-next');

  elStatusDot           = document.querySelector('.status-dot');

  

  if (!elCurrentDay || !elBtnDone || !elDotsGrid) {

    console.warn('[DC] Kritische DOM-Elemente fehlen.');

    return false;

  }

  return true;

}

  

// ============================================================

//  LOCALSTORAGE

// ============================================================

  

function storageGet(key)      { try { return localStorage.getItem(key);    } catch { return null;  } }

function storageSet(key, val) { try { localStorage.setItem(key, val);      } catch { /* silent */ } }

function storageRemove(key)   { try { localStorage.removeItem(key);        } catch { /* silent */ } }

  

// ============================================================

//  STATE

// ============================================================

  

function defaultState() {

  return { completedDays:0, lastDoneDate:null, doneDates:[], bestStreak:0, startedAt:null, completedAt:null };

}

  

function migrateState(raw) {

  const s = Object.assign({}, defaultState(), raw);

  if (!Array.isArray(s.doneDates))         s.doneDates     = [];

  if (typeof s.completedDays !== 'number') s.completedDays = 0;

  if (typeof s.bestStreak    !== 'number') s.bestStreak    = 0;

  return s;

}

  

function loadState() {

  const raw = storageGet(STORAGE_KEY);

  if (!raw) return defaultState();

  try   { return migrateState(JSON.parse(raw)); }

  catch { storageRemove(STORAGE_KEY); return defaultState(); }

}

  

function saveState(state) { storageSet(STORAGE_KEY, JSON.stringify(state)); }

  

// ============================================================

//  DATUM

// ============================================================

  

function todayISO() {

  const d = new Date();

  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

}

function alreadyDoneToday(state) { return state.lastDoneDate === todayISO(); }

function pad(n) { return String(n).padStart(2,'0'); }

  

// ============================================================

//  STREAK

// ============================================================

  

function calcStreak(doneDates) {

  if (!Array.isArray(doneDates) || doneDates.length === 0) return 0;

  const sorted    = [...doneDates].sort().reverse();

  const lastDate  = new Date(sorted[0]  + 'T00:00:00');

  const todayDate = new Date(todayISO() + 'T00:00:00');

  if (Math.round((todayDate - lastDate) / 86400000) > 1) return 0;

  let streak = 1;

  for (let i = 0; i < sorted.length - 1; i++) {

    const diff = Math.round((new Date(sorted[i]+'T00:00:00') - new Date(sorted[i+1]+'T00:00:00')) / 86400000);

    if (diff === 1) streak++;

    else break;

  }

  return streak;

}

  

// ============================================================

//  DOTS

// ============================================================

  

function buildDots(completedDays) {

  if (!elDotsGrid) return;

  const isPrem = window.dcPremium && window.dcPremium.isPremium();

  elDotsGrid.innerHTML = '';

  for (let i = 1; i <= TOTAL_DAYS; i++) {

    const dot = document.createElement('div');

    dot.classList.add('dot');

    dot.setAttribute('data-num', pad(i));

    if (i <= completedDays) {

      dot.classList.add('done');

      if (isPrem) dot.classList.add('premium-gold-dot');

    } else if (i === completedDays + 1) {

      dot.classList.add('current');

    }

    elDotsGrid.appendChild(dot);

  }

}

  

function buildShareDots(completedDays) {

  if (!elShareDots) return;

  const isPrem = window.dcPremium && window.dcPremium.isPremium();

  const wrap   = document.querySelector('.share-card-wrap');

  if (wrap) { isPrem ? wrap.classList.add('premium') : wrap.classList.remove('premium'); }

  elShareDots.innerHTML = '';

  for (let i = 1; i <= TOTAL_DAYS; i++) {

    const dot = document.createElement('div');

    dot.classList.add('share-dot');

    if (i <= completedDays) dot.classList.add('done');

    elShareDots.appendChild(dot);

  }

}

  

// ============================================================

//  RENDERING

// ============================================================

  

function renderUI(state) {

  const done   = state.completedDays;

  const pct    = Math.round((done / TOTAL_DAYS) * 100);

  const streak = calcStreak(state.doneDates);

  

  // Tag-Zahl

  if (elCurrentDay) elCurrentDay.textContent = pad(done);

  

  // Label

  if (elDayLabel) {

    if (done === 0)               elDayLabel.textContent = 'Noch kein Tag abgeschlossen';

    else if (done === TOTAL_DAYS) elDayLabel.textContent = 'Challenge abgeschlossen! 🏆';

    else elDayLabel.textContent   = `${done} ${done===1?'Tag':'Tage'} abgeschlossen`;

  }

  

  // Progress bar

  if (elProgressBar) {

    elProgressBar.style.width = pct + '%';

    if (pct >= 5) elProgressBar.classList.add('has-progress');

    else          elProgressBar.classList.remove('has-progress');

  }

  

  // Dots

  buildDots(done);

  

  // Stats

  if (done > 0) {

    if (elStatsRow)   elStatsRow.style.display   = 'grid';

    if (elStatStreak) elStatStreak.textContent   = streak;

    if (elStatBest)   elStatBest.textContent     = state.bestStreak;

    if (elStatRemain) elStatRemain.textContent   = TOTAL_DAYS - done;

  } else {

    if (elStatsRow) elStatsRow.style.display = 'none';

  }

  

  // Share section

  if (elShareSection) elShareSection.style.display = done > 0 ? 'flex' : 'none';

  

  // Premium CTA — immer sichtbar wenn kein Premium

  const isPrem = window.dcPremium && window.dcPremium.isPremium();

  if (elPremiumCTA) {

    elPremiumCTA.style.display = isPrem ? 'none' : 'block';

  }

  

  // Nav premium button

  const navPremBtn = document.getElementById('btn-header-premium');

  if (navPremBtn) {

    navPremBtn.classList.toggle('hidden', isPrem);

  }

  

  // Read-only mode

  if (_isReadOnly) {

    if (elBtnDone)   { elBtnDone.disabled = true; elBtnDone.classList.add('done-today'); }

    const btnText = elBtnDone ? elBtnDone.querySelector('.btn-text') : null;

    if (btnText)     btnText.textContent = 'SCHREIBGESCHÜTZT';

    if (elBtnHint)   elBtnHint.textContent = 'Du siehst den Fortschritt einer anderen Person.';

    if (elStatusText) elStatusText.textContent = `👁 Tag ${done}/30 – schreibgeschützt`;

    return;

  }

  

  // Button-Zustände

  const btnText = elBtnDone ? elBtnDone.querySelector('.btn-text') : null;

  

  if (done === TOTAL_DAYS) {

    setStatus('🏆 Challenge abgeschlossen!', '#f0c040');

    if (elBtnDone)  { elBtnDone.classList.add('done-today'); elBtnDone.disabled = true; }

    if (btnText)      btnText.textContent = 'ALLE 30 TAGE GESCHAFFT ✓';

    if (elBtnHint)    elBtnHint.textContent = 'Du hast deine Disziplin bewiesen.';

  

  } else if (alreadyDoneToday(state)) {

    setStatus('✓ Heute abgehakt – bis morgen!', 'var(--green)');

    if (elBtnDone)  { elBtnDone.classList.add('done-today'); elBtnDone.disabled = true; }

    if (btnText)      btnText.textContent = 'HEUTE GESCHAFFT ✓';

    if (elBtnHint)    elBtnHint.textContent = `Morgen: Tag ${done+1}. Bleib dran.`;

  

  } else if (done === 0) {

    setStatus('Bereit zum Start', 'var(--accent)');

    if (elBtnDone)  { elBtnDone.classList.remove('done-today'); elBtnDone.disabled = false; }

    if (btnText)      btnText.textContent = 'HEUTE GESCHAFFT';

    if (elBtnHint)    elBtnHint.textContent = 'Hast du heute deine Challenge gemeistert?';

  

  } else {

    setStatus(`Tag ${done+1} wartet auf dich 💪`, 'var(--accent)');

    if (elBtnDone)  { elBtnDone.classList.remove('done-today'); elBtnDone.disabled = false; }

    if (btnText)      btnText.textContent = 'HEUTE GESCHAFFT';

    if (elBtnHint)    elBtnHint.textContent = `Noch ${TOTAL_DAYS-done} ${TOTAL_DAYS-done===1?'Tag':'Tage'} bis zum Ziel.`;

  }

}

  

function setStatus(text, dotColor) {

  if (elStatusText) elStatusText.textContent = text;

  if (elStatusDot) elStatusDot.style.background = dotColor;

}

  

// ============================================================

//  ANIMATION

// ============================================================

  

function animateDayNumber() {

  if (!elCurrentDay) return;

  elCurrentDay.classList.remove('animate');

  void elCurrentDay.offsetWidth;

  elCurrentDay.classList.add('animate');

}

  

// ============================================================

//  ONBOARDING

// ============================================================

  

let _obStep = 1;

  

function initOnboarding() {

  if (storageGet('dc_onboarding_seen')) return;

  if (elOnboardingOverlay) {

    elOnboardingOverlay.style.display = 'flex';

    updateOnboardingStep(1);

  }

}

  

function updateOnboardingStep(step) {

  document.querySelectorAll('.onboarding-step').forEach(el => el.classList.remove('active'));

  document.querySelectorAll('.ob-dot').forEach(el => el.classList.remove('active'));

  const stepEl = document.querySelector(`.onboarding-step[data-step="${step}"]`);

  const dotEl  = document.querySelector(`.ob-dot[data-dot="${step}"]`);

  if (stepEl) stepEl.classList.add('active');

  if (dotEl)  dotEl.classList.add('active');

  if (elBtnOnboardingNext) {

    elBtnOnboardingNext.textContent = step < 3 ? 'Weiter →' : '🚀 Challenge starten';

  }

}

  

// ============================================================

//  SNAPSHOT

// ============================================================

  

function checkSnapshotURL() {

  const params = new URLSearchParams(window.location.search);

  const snap   = params.get('snap');

  if (!snap) return null;

  if (typeof window.decodeSnapshot === 'function') return window.decodeSnapshot(snap);

  return null;

}

  

// ============================================================

//  EVENTS

// ============================================================

  

function bindEvents() {

  

  // Nav Premium Button

  const navPremBtn = document.getElementById('btn-header-premium');

  if (navPremBtn) {

    navPremBtn.addEventListener('click', () => {

      const overlay = document.getElementById('premium-overlay');

      if (overlay) overlay.style.display = 'flex';

      if (window.dcTrack) window.dcTrack.gumroad();

    });

  }

  

  // Haupt-Button

  if (elBtnDone) {

    elBtnDone.addEventListener('click', () => {

      if (_isReadOnly) return;

      const state = loadState();

      if (alreadyDoneToday(state) || state.completedDays >= TOTAL_DAYS) return;

  

      const today = todayISO();

      state.completedDays++;

      state.lastDoneDate = today;

      state.doneDates.push(today);

      if (!state.startedAt) state.startedAt = today;

      const streak = calcStreak(state.doneDates);

      if (streak > state.bestStreak) state.bestStreak = streak;

      if (state.completedDays === TOTAL_DAYS) state.completedAt = today;

  

      saveState(state);

      animateDayNumber();

      renderUI(state);

      if (window.dcTrack) window.dcTrack.checkin();

  

      if (state.completedDays === TOTAL_DAYS) {

        if (window.dcTrack) window.dcTrack.challengeCompleted();

        setTimeout(() => { if (elConfetti) elConfetti.style.display = 'flex'; }, 700);

      }

    });

  }

  

  // Reset

  if (elBtnReset) {

    elBtnReset.addEventListener('click', () => {

      if (!confirm('Challenge neu starten? Alle Daten werden gelöscht.')) return;

      storageRemove(STORAGE_KEY);

      if (elConfetti) elConfetti.style.display = 'none';

      _isReadOnly = false;

      if (elSnapshotBanner) elSnapshotBanner.style.display = 'none';

      if (window.history.replaceState) window.history.replaceState({}, document.title, window.location.pathname);

      const fresh = defaultState();

      saveState(fresh);

      renderUI(fresh);

    });

  }

  

  // Share Button

  if (elBtnShare) {

    elBtnShare.addEventListener('click', () => {

      const state = loadState();

      if (elShareDayNum) elShareDayNum.textContent = pad(state.completedDays);

      buildShareDots(state.completedDays);

      if (typeof window.initShareButtons === 'function') window.initShareButtons(state);

      if (elModalOverlay) elModalOverlay.style.display = 'flex';

      if (window.dcTrack) window.dcTrack.share();

    });

  }

  

  // Share Modal schließen

  if (elModalClose) elModalClose.addEventListener('click', () => { if (elModalOverlay) elModalOverlay.style.display = 'none'; });

  if (elModalOverlay) elModalOverlay.addEventListener('click', e => { if (e.target === elModalOverlay) elModalOverlay.style.display = 'none'; });

  

  // Snapshot Button

  if (elBtnSnapshot) {

    elBtnSnapshot.addEventListener('click', () => {

      const state = loadState();

      if (elSnapshotInput && typeof window.encodeSnapshot === 'function') {

        elSnapshotInput.value = window.encodeSnapshot(state);

      }

      if (elSnapshotOverlay) elSnapshotOverlay.style.display = 'flex';

      if (window.dcTrack) window.dcTrack.snapshot();

    });

  }

  

  // Snapshot kopieren

  if (elBtnCopySnap) {

    elBtnCopySnap.addEventListener('click', () => {

      const url = elSnapshotInput ? elSnapshotInput.value : '';

      navigator.clipboard.writeText(url).catch(() => {

        const ta = document.createElement('textarea');

        ta.value = url; document.body.appendChild(ta); ta.select();

        document.execCommand('copy'); document.body.removeChild(ta);

      });

      elBtnCopySnap.textContent = '✓ Kopiert!';

      setTimeout(() => { elBtnCopySnap.textContent = 'Kopieren'; }, 2000);

    });

  }

  

  // Snapshot importieren

  if (elBtnImportSnap) {

    elBtnImportSnap.addEventListener('click', () => {

      const val = elSnapshotImportInput ? elSnapshotImportInput.value.trim() : '';

      if (!val) return;

      try {

        const url   = new URL(val);

        const param = url.searchParams.get('snap');

        if (!param) { alert('Kein gültiger Snapshot-Link.'); return; }

        const snap  = window.decodeSnapshot(param);

        if (!snap)  { alert('Link konnte nicht gelesen werden.'); return; }

        _isReadOnly = true;

        if (elSnapshotBanner)  elSnapshotBanner.style.display  = 'flex';

        if (elSnapshotOverlay) elSnapshotOverlay.style.display = 'none';

        renderUI(snap);

      } catch { alert('Ungültige URL.'); }

    });

  }

  

  // Snapshot Modal schließen

  if (elSnapshotClose) elSnapshotClose.addEventListener('click', () => { if (elSnapshotOverlay) elSnapshotOverlay.style.display = 'none'; });

  if (elSnapshotOverlay) elSnapshotOverlay.addEventListener('click', e => { if (e.target === elSnapshotOverlay) elSnapshotOverlay.style.display = 'none'; });

  

  // Eigene Challenge starten

  if (elBtnOwnStart) {

    elBtnOwnStart.addEventListener('click', () => {

      _isReadOnly = false;

      if (elSnapshotBanner) elSnapshotBanner.style.display = 'none';

      if (window.history.replaceState) window.history.replaceState({}, document.title, window.location.pathname);

      renderUI(loadState());

    });

  }

  

  // Premium CTA

  const btnPremCTA = document.getElementById('btn-premium-cta');

  if (btnPremCTA) {

    btnPremCTA.addEventListener('click', () => {

      const overlay = document.getElementById('premium-overlay');

      if (overlay) overlay.style.display = 'flex';

      if (window.dcTrack) window.dcTrack.gumroad();

    });

  }

  

  // Win: teilen

  if (elBtnShareWin) {

    elBtnShareWin.addEventListener('click', () => {

      const state = loadState();

      if (elShareDayNum) elShareDayNum.textContent = '30';

      buildShareDots(30);

      if (typeof window.initShareButtons === 'function') window.initShareButtons(state);

      if (elConfetti)     elConfetti.style.display     = 'none';

      if (elModalOverlay) elModalOverlay.style.display = 'flex';

    });

  }

  

  // Win: restart

  if (elBtnRestartWin) {

    elBtnRestartWin.addEventListener('click', () => {

      if (!confirm('Neue Challenge starten? Alle Daten werden gelöscht.')) return;

      storageRemove(STORAGE_KEY);

      if (elConfetti) elConfetti.style.display = 'none';

      saveState(defaultState());

      renderUI(defaultState());

    });

  }

  

  // Stats Modal

  const btnStatsView = document.getElementById('btn-stats-view');

  if (btnStatsView) {

    btnStatsView.addEventListener('click', () => {

      if (typeof window.renderStatsModal === 'function') window.renderStatsModal();

      if (elStatsOverlay) elStatsOverlay.style.display = 'flex';

    });

  }

  if (elStatsClose)   elStatsClose.addEventListener('click',   () => { if (elStatsOverlay)   elStatsOverlay.style.display   = 'none'; });

  if (elStatsOverlay) elStatsOverlay.addEventListener('click', e  => { if (e.target === elStatsOverlay)   elStatsOverlay.style.display   = 'none'; });

  

  // Privacy Modal

  const btnPrivacy = document.getElementById('btn-privacy');

  if (btnPrivacy) {

    btnPrivacy.addEventListener('click', () => { if (elPrivacyOverlay) elPrivacyOverlay.style.display = 'flex'; });

  }

  if (elPrivacyClose)   elPrivacyClose.addEventListener('click',   () => { if (elPrivacyOverlay)   elPrivacyOverlay.style.display   = 'none'; });

  if (elPrivacyOverlay) elPrivacyOverlay.addEventListener('click', e  => { if (e.target === elPrivacyOverlay)   elPrivacyOverlay.style.display   = 'none'; });

  

  // Onboarding

  if (elBtnOnboardingNext) {

    elBtnOnboardingNext.addEventListener('click', () => {

      if (_obStep < 3) {

        _obStep++;

        updateOnboardingStep(_obStep);

      } else {

        if (elOnboardingOverlay) elOnboardingOverlay.style.display = 'none';

        storageSet('dc_onboarding_seen', '1');

      }

    });

  }

  

  // Escape

  document.addEventListener('keydown', e => {

    if (e.key !== 'Escape') return;

    [elModalOverlay, elSnapshotOverlay, elStatsOverlay, elPrivacyOverlay,

      document.getElementById('premium-overlay'), elOnboardingOverlay

    ].forEach(el => { if (el) el.style.display = 'none'; });

  });

}

  

// ============================================================

//  INIT

// ============================================================

  

document.addEventListener('DOMContentLoaded', () => {

  try {

    const ok = initDOMRefs();

    if (!ok) return;

  

    bindEvents();

  

    // Snapshot-URL prüfen

    const snapState = checkSnapshotURL();

    if (snapState) {

      _isReadOnly = true;

      if (elSnapshotBanner) elSnapshotBanner.style.display = 'flex';

      renderUI(snapState);

      return;

    }

  

    const state = loadState();

    renderUI(state);

    initOnboarding();

  

    if (state.completedDays === TOTAL_DAYS && state.completedAt) {

      setTimeout(() => { if (elConfetti) elConfetti.style.display = 'flex'; }, 400);

    }

  

  } catch (err) {

    console.error('[DC] Init-Fehler:', err);

    try { renderUI(defaultState()); } catch { /* terminal */ }

  }

});