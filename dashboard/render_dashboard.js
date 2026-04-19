/**
 * /dashboard/render_dashboard.js
 * Dashboard mit klarem Check-in, Markt-Vibe und Vibe-Check.
 */

import { state } from '../shared/core/state.js';
import { actions } from '../shared/core/actions.js';
import { dom, animateValue, showTerminalLoader, bindSmartDateInput } from '../shared/ui/dom_utils.js';
import { nav, renderNavigation } from '../shared/ui/navigation.js';
import { renderAuth } from '../shared/ui/render_auth.js';
import { sentimentWidget } from '../shared/ui/widgets/sentiment_widget.js';
import { errorBoundary } from '../shared/ui/error_boundary.js';
import { api } from '../shared/core/api.js';

const HEARTBEAT_STALE_MS = 65 * 60 * 1000;
const HEARTBEAT_POLL_MS = 60 * 1000;

function getVibeLabel(score) {
  if (score >= 90) return 'Ihr seid voll auf einer Wellenlänge.';
  if (score >= 75) return 'Das passt schon sehr gut zusammen.';
  if (score >= 60) return 'Da ist gute Verbindung drin.';
  if (score >= 45) return 'Da knirscht es noch, aber da ist Potenzial.';
  return 'Das braucht Geduld und klare Gespräche.';
}

function formatCheckinDays(value) {
  const safeValue = Number.isFinite(value) ? value : 0;
  return safeValue === 1 ? '1 Tag' : `${safeValue} Tage`;
}

export const dashboardRender = {
  _unsubscribers: [],
  _listeners: [],
  _timers: [],
  _heartbeatInterval: null,

  async init() {
    actions.register('calculateSynergyByDate', async (payload) => {
      const { calculateSynergy } = await import('../shared/core/logic/synergy_engine.js');
      const res = calculateSynergy(payload.birthdate1, payload.birthdate2);
      if (res.success) {
        state.emit('synergyByDateDone', res);
      } else {
        state.emit('synergyByDateFailed', res);
      }
      return res;
    });

    try {
      const btnCheckin = document.getElementById('btn-checkin');
      if (btnCheckin) {
        const checkinHandler = async () => {
          btnCheckin.disabled = true;
          await showTerminalLoader('dash-loader', 1500);
          await actions.triggerCheckIn();
          btnCheckin.disabled = false;
        };
        btnCheckin.addEventListener('click', checkinHandler);
        this._listeners.push({ element: btnCheckin, type: 'click', handler: checkinHandler });
      }

      // FIX: Dead Navigation umleiten via JS-Router statt reinem href
      document.querySelectorAll('.app-card-link').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const href = link.getAttribute('href');
          if (href.includes('numerology') || href.includes('muster')) {
            nav.navigateTo('numerology');
          } else if (href.includes('finance') || href.includes('wachstum')) {
            nav.navigateTo('finance');
          } else if (href.includes('chronos') || href.includes('zeit')) {
            nav.navigateTo('chronos');
          } else {
            window.location.href = href;
          }
        });
      });

      this._unsubscribers.push(state.subscribe('systemInitialized', (profile) => this.renderStatus(profile)));
      this._unsubscribers.push(state.subscribe('streakUpdated', (payload) => {
        this.renderStatus(payload.profile);
        dom.setText('dash-msg', 'Stark. Dein Puls läuft weiter.');
      }));
      this._unsubscribers.push(state.subscribe('checkInFailed', (payload) => {
        dom.setText('dash-msg', payload.message || 'Heute war dein Puls schon da.');
      }));

      dom.initScrollReveal();
      errorBoundary.init();

      await actions.initSystem();
      renderNavigation('nav-menu');
      nav.bindNavigation();
      nav.registerCurrentApp(this);
      await renderAuth.init();

      sentimentWidget.init('sentiment-widget');
      this.buildSynergyWidget();
      this.startHeartbeatMonitor();
    } catch (err) {
      console.error('Dashboard Init Error:', err);
      document.body.textContent = 'Dashboard konnte nicht geladen werden. Bitte Seite neu laden.';
    }
  },

  buildSynergyWidget() {
    const container = document.getElementById('synergy-widget-container');
    if (!container) return;

    const card = dom.createEl('div', { className: 'glass-card synergy-card', parent: container });

    dom.createEl('div', { className: 'section-eyebrow-left', text: 'Vibe Check', parent: card });
    dom.createEl('p', {
      className: 'text-secondary mb-24',
      text: 'Gib zwei Geburtstage ein und ich zeige dir, wie leicht es zwischen euch fließt.',
      parent: card
    });

    const inputRow = dom.createEl('div', { className: 'synergy-input-section', parent: card });

    const groupA = dom.createEl('div', { className: 'form-group', parent: inputRow });
    dom.createEl('label', { text: 'Erste Person', parent: groupA });
    dom.createEl('input', {
      className: 'synergy-input',
      attrs: { type: 'text', id: 'syn-date-a', placeholder: 'TT.MM.JJJJ', maxlength: '10' },
      parent: groupA
    });

    const groupB = dom.createEl('div', { className: 'form-group', parent: inputRow });
    dom.createEl('label', { text: 'Zweite Person', parent: groupB });
    dom.createEl('input', {
      className: 'synergy-input',
      attrs: { type: 'text', id: 'syn-date-b', placeholder: 'TT.MM.JJJJ', maxlength: '10' },
      parent: groupB
    });

    bindSmartDateInput('syn-date-a');
    bindSmartDateInput('syn-date-b');

    dom.createEl('p', { id: 'syn-error', className: 'text-accent text-center mt-8', parent: card });

    const calcBtn = dom.createEl('button', {
      className: 'btn-primary synergy-check-btn mt-16',
      id: 'syn-calc-btn',
      text: 'Vibe checken',
      parent: card
    });

    dom.createEl('div', { id: 'syn-results', parent: card });

    const clickHandler = async () => {
      const d1 = document.getElementById('syn-date-a')?.value.trim();
      const d2 = document.getElementById('syn-date-b')?.value.trim();
      const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;

      if (!dateRegex.test(d1) || !dateRegex.test(d2)) {
        dom.setText('syn-error', 'Bitte beide Daten im Format TT.MM.JJJJ eingeben.');
        return;
      }

      dom.setText('syn-error', '');
      calcBtn.disabled = true;
      calcBtn.textContent = 'Ich schaue gerade nach.';
      await showTerminalLoader('syn-results', 1200);
      actions.dispatch('calculateSynergyByDate', { birthdate1: d1, birthdate2: d2 });
      calcBtn.textContent = 'Vibe checken';
      calcBtn.disabled = false;
    };

    calcBtn.addEventListener('click', clickHandler);
    this._listeners.push({ element: calcBtn, type: 'click', handler: clickHandler });

    this._unsubscribers.push(
      state.subscribe('synergyByDateDone', (res) => this.buildSynergyResults(res.data))
    );
    this._unsubscribers.push(
      state.subscribe('synergyByDateFailed', (res) => {
        dom.setText('syn-error', res.error || 'Da lief etwas schief.');
        dom.clear('syn-results');
      })
    );
  },

  buildSynergyResults(data) {
    const view = normalizeSynergyDashboard(data);
    dom.clear('syn-results');
    const container = document.getElementById('syn-results');
    if (!container) return;

    const { lifePath1, lifePath2, synergyScore, interpretation } = view;
    const label = getVibeLabel(synergyScore);

    dom.createEl('div', { className: 'synergy-divider mt-24 mb-16', parent: container });

    const pathsRow = dom.createEl('div', { className: 'synergy-persons-grid', parent: container });
    [
      { label: 'Erste Zahl', value: lifePath1, delay: 1 },
      { label: 'Zweite Zahl', value: lifePath2, delay: 2 }
    ].forEach(({ label: itemLabel, value, delay }) => {
      const card = dom.createEl('div', { className: 'synergy-person-card stagger-fade', parent: pathsRow });
      card.setAttribute('data-delay', delay);
      const numEl = dom.createEl('span', { className: 'value-massive text-size-xl accent', text: '0', parent: card });
      dom.createEl('span', { className: 'value-label', text: itemLabel, parent: card });
      animateValue(numEl, 0, value, 800);
      const timerId = setTimeout(() => card.classList.add('visible'), delay * 120);
      this._timers.push(timerId);
    });

    const barSection = dom.createEl('div', { className: 'stagger-fade mt-24 mb-8', parent: container });
    barSection.setAttribute('data-delay', 3);

    const scoreRow = dom.createEl('div', { className: 'synergy-energy-row mb-8', parent: barSection });
    dom.createEl('span', { className: 'energy-label', text: 'Vibe', parent: scoreRow });
    const scoreValEl = dom.createEl('span', { className: 'energy-value accent', text: '0', parent: scoreRow });

    const barTrack = dom.createEl('div', { className: 'progress-bar-container', parent: barSection });
    const barFill = dom.createEl('div', {
      className: 'progress-bar-fill',
      parent: barTrack,
      style: { width: '0%', transition: 'width 1.2s ease-out' }
    });

    dom.createEl('p', {
      className: 'text-center mt-8 status-text',
      text: label,
      parent: barSection
    });

    if (interpretation) {
      dom.createEl('p', {
        className: 'text-center mt-8 text-secondary',
        text: interpretation,
        parent: barSection
      });
    }

    animateValue(scoreValEl, 0, synergyScore, 1200);
    const timerId = setTimeout(() => {
      barFill.style.width = `${synergyScore}%`;
      barSection.classList.add('visible');
    }, 360);
    this._timers.push(timerId);
  },

  destroy() {
    this._unsubscribers.forEach((unsub) => unsub && unsub());
    this._unsubscribers = [];

    this._listeners.forEach(({ element, type, handler }) => {
      element.removeEventListener(type, handler);
    });
    this._listeners = [];

    this._timers.forEach((id) => clearTimeout(id));
    this._timers = [];

    if (this._heartbeatInterval) {
      clearInterval(this._heartbeatInterval);
      this._heartbeatInterval = null;
    }
  },

  startHeartbeatMonitor() {
    this.setSystemStatus(false);
    void this.refreshHeartbeatStatus();

    if (this._heartbeatInterval) {
      clearInterval(this._heartbeatInterval);
    }
    this._heartbeatInterval = setInterval(() => {
      void this.refreshHeartbeatStatus();
    }, HEARTBEAT_POLL_MS);
  },

  async refreshHeartbeatStatus() {
    const result = await api.getSystemStatusPing();
    if (!result?.success || !result?.data?.last_ping) {
      this.setSystemStatus(false);
      return;
    }

    const lastSeenMs = Date.parse(result.data.last_ping);
    const isFresh = Number.isFinite(lastSeenMs) && Date.now() - lastSeenMs <= HEARTBEAT_STALE_MS;
    this.setSystemStatus(isFresh);
  },

  setSystemStatus(isOnline) {
    const statusEl = document.getElementById('system-status-text');
    if (!statusEl) return;

    statusEl.classList.toggle('system-status-online', isOnline);
    statusEl.classList.toggle('system-status-offline', !isOnline);
    dom.setText('system-status-text', isOnline ? 'System online' : 'System offline');
  },

  renderStatus(profile) {
    if (!profile) return;

    const streakEl = document.getElementById('dash-streak');
    const shieldsEl = document.getElementById('dash-shields');

    if (streakEl) {
      const currentStreak = Number.parseInt(streakEl.textContent, 10) || 0;
      const newStreak = profile.streak || 0;
      if (currentStreak !== newStreak) {
        animateValue(streakEl, currentStreak, newStreak, 1500, '', (value) =>
          formatCheckinDays(Math.round(value))
        );
      } else {
        dom.setText('dash-streak', formatCheckinDays(newStreak));
      }
    }

    if (shieldsEl) {
      const currentShields = Number.parseInt(shieldsEl.textContent, 10) || 0;
      const newShields = profile.shields || 0;
      if (currentShields !== newShields) {
        animateValue(shieldsEl, currentShields, newShields, 1500);
      }
    }

    dom.setText('dash-tier', 'Aktiv');

    document.querySelectorAll('.stagger-fade').forEach((el, index) => {
      const timerId = setTimeout(() => {
        el.classList.add('visible');
      }, index * 100);
      this._timers.push(timerId);
    });
  }
};

function normalizeSynergyDashboard(data = {}) {
  return {
    lifePath1: data.lifePath1 ?? data.operators?.a?.life_path ?? 0,
    lifePath2: data.lifePath2 ?? data.operators?.b?.life_path ?? 0,
    synergyScore: data.compatibilityScore ?? data.synergyScore ?? data.synergy_score ?? 0,
    interpretation: data.interpretation ?? data.verdict ?? ''
  };
}

dashboardRender.init();
