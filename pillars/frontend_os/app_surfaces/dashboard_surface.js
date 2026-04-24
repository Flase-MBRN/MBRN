/**
 * /dashboard/render_dashboard.js
 * Dashboard mit klarem Check-in, Markt-Vibe und Vibe-Check.
 */

import { actions } from '../../../shared/application/actions.js';
import {
  registerDashboardActions,
  subscribeDashboardSurface
} from '../../../shared/application/frontend_os/dashboard_runtime.js';
import { dom, animateValue, showTerminalLoader, bindSmartDateInput } from '../../../shared/ui/dom_utils.js';
import { getRepoRoot, nav, renderNavigation } from '../navigation/index.js';
import { renderAuth } from '../ui_states/auth_controller.js';
import { sentimentWidget } from '../cards/sentiment_widget.js';
import { errorBoundary } from '../../../shared/ui/base_components/error_boundary.js';
import { injectLegalBlock } from '../shell/legal_blocks.js';
import { renderSurfaceFlowRail } from '../shell/flow_rail.js';
import { readOracleDashboardSnapshot } from '../../../shared/application/read_models/oracle_dashboard.js';
import { readSystemHeartbeat } from '../../../shared/application/read_models/system_status.js';
import { renderDashboardDimensionCards } from '../dashboard/dimension_cards.js';

const HEARTBEAT_STALE_MS = 65 * 60 * 1000;
const HEARTBEAT_POLL_MS = 60 * 1000;

function getVibeLabel(score) {
  if (score >= 90) return 'Ihr seid voll auf einer Wellenlaenge.';
  if (score >= 75) return 'Das passt schon sehr gut zusammen.';
  if (score >= 60) return 'Da ist gute Verbindung drin.';
  if (score >= 45) return 'Da knirscht es noch, aber da ist Potenzial.';
  return 'Das braucht Geduld und klare Gespraeche.';
}

function formatCheckinDays(value) {
  const safeValue = Number.isFinite(value) ? value : 0;
  return safeValue === 1 ? '1 Tag' : `${safeValue} Tage`;
}

function formatPercent(value) {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  return `${safeValue.toFixed(1)}%`;
}

function getOracleState(recommendation = '') {
  const text = String(recommendation).toLowerCase();
  if (text.startsWith('buy')) return 'buy';
  if (text.startsWith('sell')) return 'sell';
  return 'caution';
}

function getOracleStrategyLabel(state) {
  if (state === 'buy') return 'BUY';
  if (state === 'sell') return 'SELL';
  return 'ABWARTEN';
}

function getMarketVibeLabel(score) {
  const safeScore = Number.isFinite(Number(score)) ? Number(score) : 50;
  if (safeScore <= 20) return 'Sehr vorsichtig';
  if (safeScore <= 40) return 'Vorsichtig';
  if (safeScore <= 60) return 'Neutral';
  if (safeScore <= 80) return 'Optimistisch';
  return 'Sehr optimistisch';
}

function getBiasLabel(signal = 'neutral') {
  const text = String(signal).toLowerCase();
  if (text.includes('bull')) return 'Bullisch';
  if (text.includes('bear')) return 'Bearisch';
  return 'Neutral';
}

function formatScoreOutOfHundred(value, fallback = 50) {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : fallback;
  return `${Math.round(safeValue)}/100`;
}

function formatCryptoDetails(snapshot = {}) {
  const segments = ['BTC-USD', 'ETH-USD']
    .map((symbol) => {
      const item = snapshot?.[symbol];
      if (!item) return null;

      const shortLabel = symbol === 'BTC-USD' ? 'BTC' : 'ETH';
      const change = Number(item.change_percent ?? 0);
      const prefix = change > 0 ? '+' : '';
      return `${shortLabel} ${prefix}${change.toFixed(1)}%`;
    })
    .filter(Boolean);

  return segments.length ? segments.join(' | ') : 'Kein frischer BTC/ETH-Impuls';
}

function formatNewsDetails(newsSignal = 'neutral', headlineCount = 0) {
  const count = Number.isFinite(Number(headlineCount)) ? Number(headlineCount) : 0;
  const countLabel = count === 1 ? 'Meldung' : 'Meldungen';
  return `${getBiasLabel(newsSignal)} | ${count} ${countLabel}`;
}

function buildOracleExplanation(prediction, signal, context, state) {
  const dayNumber = prediction?.day_numerology?.day_number ?? '--';
  const dayDescription = prediction?.day_numerology?.description || 'klare Ausrichtung';
  const marketVibe = getMarketVibeLabel(signal?.sentiment_prediction ?? 50);
  const strategy = getOracleStrategyLabel(state);
  const cryptoPressure = formatScoreOutOfHundred(context?.crypto_sentiment ?? 50);
  const newsFlow = getBiasLabel(context?.news_signal ?? 'neutral');
  const reasoning = String(signal?.reasoning || '').trim();

  let text = `Energetischer Status: TAG ${dayNumber}. Fokus auf ${dayDescription}. Markt-Vibe heute: ${marketVibe}. KRYPTO-DRUCK bei ${cryptoPressure}, NEWS-FLOW ${newsFlow}. ${strategy}.`;
  if (reasoning) {
    text += ` ${reasoning}`;
  }

  return text;
}

function createOracleStat(parent, label, valueId) {
  const stat = dom.createEl('div', { className: 'oracle-mini-stat', parent });
  dom.createEl('span', { className: 'oracle-kicker', text: label, parent: stat });
  dom.createEl('span', { id: valueId, className: 'oracle-mini-value', text: '--', parent: stat });
  return stat;
}

function createOracleSignalChip(parent, label, valueId, detailId) {
  const chip = dom.createEl('div', { className: 'oracle-signal-chip', parent });
  dom.createEl('span', { className: 'oracle-chip-label', text: label, parent: chip });
  dom.createEl('span', { id: valueId, className: 'oracle-chip-value', text: '--', parent: chip });
  if (detailId) {
    dom.createEl('span', { id: detailId, className: 'oracle-chip-detail', text: '', parent: chip });
  }
  return chip;
}

export const dashboardRender = {
  _unsubscribers: [],
  _listeners: [],
  _timers: [],
  _heartbeatInterval: null,

  async init() {
    registerDashboardActions(actions);

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

      this._unsubscribers.push(
        subscribeDashboardSurface({
          onSystemInitialized: (profile) => this.renderStatus(profile),
          onStreakUpdated: (payload) => {
            this.renderStatus(payload.profile);
            dom.setText('dash-msg', 'Stark. Dein Puls laeuft weiter.');
          },
          onCheckInFailed: (payload) => {
            dom.setText('dash-msg', payload.message || 'Heute war dein Puls schon da.');
          },
          onSynergyByDateDone: (res) => this.buildSynergyResults(res.data),
          onSynergyByDateFailed: (res) => {
            dom.setText('syn-error', res.error || 'Da lief etwas schief.');
            dom.clear('syn-results');
          }
        })
      );

      dom.initScrollReveal();
      errorBoundary.init();

      await actions.initSystem();
      renderNavigation('nav-menu');
      nav.bindNavigation();
      nav.registerCurrentApp(this);
      await renderAuth.init();

      sentimentWidget.init('sentiment-widget');
      this.initOracleCard();
      this.renderGoldSignalShortcut();
      this.buildSynergyWidget();
      renderSurfaceFlowRail('dashboard-flow-rail', 'dashboard');
      renderDashboardDimensionCards();
      this.bindDashboardSurfaceCards();
      this.renderLegalSurface();
      this.startHeartbeatMonitor();
    } catch (err) {
      console.error('Dashboard Init Error:', err);
      document.body.textContent = 'Dashboard konnte nicht geladen werden. Bitte Seite neu laden.';
    }
  },

  renderLegalSurface() {
    injectLegalBlock('dashboard-legal-mount', {
      variant: 'sync',
      basePath: getRepoRoot(),
      includePolicyLinks: true,
      includeReset: true,
      reloadOnSuccess: true
    });
  },

  bindDashboardSurfaceCards() {
    document.querySelectorAll('.dashboard-card-link').forEach((link) => {
      const clickHandler = (e) => {
        e.preventDefault();
        const route = link.getAttribute('data-route');
        if (route) {
          nav.navigateTo(route);
        }
      };
      link.addEventListener('click', clickHandler);
      this._listeners.push({ element: link, type: 'click', handler: clickHandler });
    });
  },

  renderGoldSignalShortcut() {
    const container = document.getElementById('gold-signal-shortcut');
    if (!container) return;

    container.replaceChildren();
    const card = dom.createEl('div', {
      className: 'glass-card gold-signal-shortcut-card',
      parent: container
    });

    dom.createEl('div', {
      className: 'section-eyebrow-left',
      text: 'Gold-Signale',
      parent: card
    });
    dom.createEl('p', {
      className: 'text-secondary mb-16',
      text: 'Die veredelten Markt- und News-Signale liegen in Geld / Oracle & Signal.',
      parent: card
    });
    const link = dom.createEl('a', {
      className: 'btn-secondary',
      text: 'Oracle & Signal oeffnen',
      attrs: {
        href: `${getRepoRoot()}dimensions/geld/oracle_signal/index.html`,
        'data-route': 'oracle_signal'
      },
      parent: card
    });
    const clickHandler = (event) => {
      event.preventDefault();
      nav.navigateTo('oracle_signal');
    };
    link.addEventListener('click', clickHandler);
    this._listeners.push({ element: link, type: 'click', handler: clickHandler });
  },

  buildSynergyWidget() {
    const container = document.getElementById('synergy-widget-container');
    if (!container) return;

    const card = dom.createEl('div', { className: 'glass-card synergy-card', parent: container });

    dom.createEl('div', { className: 'section-eyebrow-left', text: 'Vibe Check', parent: card });
    dom.createEl('p', {
      className: 'text-secondary mb-24',
      text: 'Gib zwei Geburtstage ein und ich zeige dir, wie leicht es zwischen euch fliesst.',
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
    void this.refreshOracleCard();

    if (this._heartbeatInterval) {
      clearInterval(this._heartbeatInterval);
    }
    this._heartbeatInterval = setInterval(() => {
      void this.refreshHeartbeatStatus();
      void this.refreshOracleCard();
    }, HEARTBEAT_POLL_MS);
  },

  initOracleCard() {
    const container = document.getElementById('oracle-widget');
    if (!container) return;

    dom.clear('oracle-widget');

    const card = dom.createEl('div', {
      id: 'oracle-card',
      className: 'glass-card oracle-card oracle-state-caution',
      parent: container
    });

    const header = dom.createEl('div', { className: 'oracle-card-header', parent: card });
    const headerCopy = dom.createEl('div', { className: 'oracle-header-copy', parent: header });
    dom.createEl('div', { className: 'section-eyebrow-left', text: 'Oracle', parent: headerCopy });
    dom.createEl('p', {
      className: 'text-secondary oracle-subtitle',
      text: 'Synchronizitaet, KI-Resonanz und Live-Druck in einem Blick.',
      parent: headerCopy
    });
    dom.createEl('div', {
      id: 'oracle-recommendation-badge',
      className: 'oracle-pill oracle-pill-caution',
      text: 'ABWARTEN',
      parent: header
    });

    const mainGrid = dom.createEl('div', { className: 'oracle-main-grid', parent: card });
    const scoreBlock = dom.createEl('div', { className: 'oracle-score-block', parent: mainGrid });
    dom.createEl('span', { className: 'oracle-kicker', text: 'SYNCHRONIZITAET', parent: scoreBlock });
    dom.createEl('span', {
      id: 'oracle-alignment-score',
      className: 'value-massive oracle-score-value',
      text: '--',
      parent: scoreBlock
    });
    dom.createEl('span', {
      id: 'oracle-target-date',
      className: 'value-label',
      text: 'Naechster Handelstag',
      parent: scoreBlock
    });

    const miniGrid = dom.createEl('div', { className: 'oracle-mini-grid', parent: mainGrid });
    createOracleStat(miniGrid, 'VERTRAUEN', 'oracle-confidence');
    createOracleStat(miniGrid, 'KI-PRAEZISION', 'oracle-accuracy');
    createOracleStat(miniGrid, 'MARKT-VIBE', 'oracle-market-vibe');
    createOracleStat(miniGrid, 'STRATEGIE', 'oracle-strategy');

    const signalStrip = dom.createEl('div', { className: 'oracle-signal-strip', parent: card });
    createOracleSignalChip(signalStrip, 'KI-RESONANZ', 'oracle-sentiment-forecast', 'oracle-sentiment-label');
    createOracleSignalChip(signalStrip, 'KRYPTO-DRUCK', 'oracle-crypto-signal', 'oracle-crypto-detail');
    createOracleSignalChip(signalStrip, 'NEWS-FLOW', 'oracle-news-flow', 'oracle-news-detail');

    dom.createEl('p', {
      id: 'oracle-reasoning',
      className: 'oracle-reasoning text-secondary',
      text: 'Oracle synchronisiert noch.',
      parent: card
    });
  },

  async refreshOracleCard() {
    const card = document.getElementById('oracle-card');
    if (!card) return;

    try {
      const oracleSnapshot = await readOracleDashboardSnapshot();
      if (!oracleSnapshot.success) return;

      const prediction = oracleSnapshot.data;
      const oracleState = getOracleState(prediction.tradingRecommendation);
      const explanationSnapshot = {
        day_numerology: {
          day_number: prediction.dayNumber,
          description: prediction.dayDescription
        }
      };
      const explanationSignal = {
        sentiment_prediction: prediction.sentimentPrediction,
        reasoning: prediction.reasoning
      };
      const explanationContext = {
        crypto_sentiment: prediction.cryptoSentiment,
        crypto_snapshot: prediction.cryptoSnapshot,
        news_signal: prediction.newsSignal,
        headline_count: prediction.headlineCount
      };
      const strategyLabel = getOracleStrategyLabel(oracleState);
      const marketVibe = getMarketVibeLabel(prediction.sentimentPrediction);

      card.classList.remove('oracle-state-buy', 'oracle-state-caution', 'oracle-state-sell', 'oracle-state-hold');
      card.classList.add(`oracle-state-${oracleState}`);

      const badge = document.getElementById('oracle-recommendation-badge');
      if (badge) {
        badge.textContent = strategyLabel;
        badge.className = `oracle-pill oracle-pill-${oracleState}`;
      }

      dom.setText('oracle-alignment-score', Math.round(prediction.alignmentScore).toString());
      dom.setText('oracle-target-date', prediction.targetDate || 'Naechster Handelstag');
      dom.setText('oracle-confidence', formatPercent(prediction.confidence * 100));
      dom.setText('oracle-accuracy', formatPercent(prediction.accuracyPct));
      dom.setText('oracle-market-vibe', marketVibe);
      dom.setText('oracle-strategy', strategyLabel);
      dom.setText('oracle-sentiment-forecast', formatScoreOutOfHundred(prediction.sentimentPrediction));
      dom.setText('oracle-sentiment-label', marketVibe);
      dom.setText('oracle-crypto-signal', formatScoreOutOfHundred(prediction.cryptoSentiment));
      dom.setText('oracle-crypto-detail', formatCryptoDetails(prediction.cryptoSnapshot));
      dom.setText('oracle-news-flow', getBiasLabel(prediction.newsSignal));
      dom.setText('oracle-news-detail', formatNewsDetails(prediction.newsSignal, prediction.headlineCount));
      dom.setText(
        'oracle-reasoning',
        buildOracleExplanation(explanationSnapshot, explanationSignal, explanationContext, oracleState)
      );
    } catch (error) {
      console.error('[Oracle Card] Update failed:', error);
    }
  },

  async refreshHeartbeatStatus() {
    const result = await readSystemHeartbeat();
    if (!result?.success || !result?.data?.lastPing) {
      this.setSystemStatus(false);
      return;
    }

    const lastSeenMs = Date.parse(result.data.lastPing);
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
