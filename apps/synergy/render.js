/**
 * /apps/synergy/render.js
 * Synergy app UI bound to the canonical M14 contract.
 */

import { state } from '../../shared/core/state.js';
import { actions } from '../../shared/core/actions.js';
import { dom, animateValue, showTerminalLoader, createGlowRing, bindSmartDateInput } from '../../shared/ui/dom_utils.js';
import { nav } from '../../shared/ui/navigation.js';
import { renderAuth } from '../../shared/ui/render_auth.js';
import { i18n } from '../../shared/core/i18n.js';

export const synergyRender = {
  _unsubscribers: [],
  _listeners: [],
  _timers: [],

  init() {
    actions.register('calculateSynergy', async (payload) => {
      const { calculateSynergy } = await import('../../shared/core/logic/synergy.js');
      const res = await calculateSynergy(payload.operatorA, payload.operatorB);

      if (res.success) {
        state.emit('synergyCalculated', res);
      } else {
        state.emit('synergyFailed', res);
      }

      return res;
    });

    const calcBtn = document.getElementById('syn-calc-btn');
    if (calcBtn) {
      const clickHandler = async () => {
        const nameA = document.getElementById('syn-input-a').value.trim();
        const dateA = document.getElementById('syn-date-a').value.trim();
        const nameB = document.getElementById('syn-input-b').value.trim();
        const dateB = document.getElementById('syn-date-b').value.trim();

        if (!nameA || !dateA || !nameB || !dateB) {
          dom.setText('syn-error', i18n.t('enterBothOperators'));
          return;
        }

        calcBtn.disabled = true;
        calcBtn.textContent = i18n.t('loadingResonance');
        await showTerminalLoader('syn-results-area', 1500);

        actions.dispatch('calculateSynergy', {
          operatorA: { name: nameA, birthDate: dateA },
          operatorB: { name: nameB, birthDate: dateB }
        });

        calcBtn.textContent = 'Zeig\'s mir.';
        calcBtn.disabled = false;
      };

      calcBtn.addEventListener('click', clickHandler);
      this._listeners.push({ element: calcBtn, type: 'click', handler: clickHandler });
    }

    this._unsubscribers.push(
      state.subscribe('synergyCalculated', (result) => this.renderResults(result.data))
    );
    this._unsubscribers.push(
      state.subscribe('synergyFailed', (result) => {
        dom.setText('syn-error', `Warnung: ${result.error}`);
      })
    );

    bindSmartDateInput('syn-date-a');
    bindSmartDateInput('syn-date-b');

    nav.bindNavigation();
    nav.registerCurrentApp(this);
    renderAuth.init();
    this.initScrollReveal();
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
  },

  renderResults(data) {
    const view = normalizeSynergyView(data);
    const container = document.getElementById('syn-results-area');
    if (!container) return;

    container.style.display = 'block';
    dom.clear('syn-results');

    const scoreCard = dom.createEl('div', {
      className: 'glass-card text-center mb-24',
      parent: container
    });

    dom.createEl('h3', {
      className: 'section-eyebrow',
      text: 'Kompatibilitaets-Score',
      parent: scoreCard
    });

    dom.createEl('div', {
      id: 'syn-score-ring',
      parent: scoreCard
    });

    dom.createEl('div', {
      id: 'syn-compatibility-score',
      className: 'status-text',
      text: i18n.t('loading'),
      parent: scoreCard
    });

    const scoreRingEl = document.getElementById('syn-score-ring');
    const svg = createGlowRing(view.compatibilityScore, 220);

    const centerText = document.createElement('div');
    centerText.className = 'pos-center-absolute';

    const scoreValue = document.createElement('span');
    scoreValue.id = 'syn-score-value';
    scoreValue.className = 'value-massive text-size-hero text-no-shadow';
    scoreValue.textContent = '0';
    centerText.appendChild(scoreValue);

    const percentSpan = document.createElement('span');
    percentSpan.className = 'text-size-sm text-theme-accent';
    percentSpan.textContent = '%';
    centerText.appendChild(percentSpan);

    const ringContainer = document.createElement('div');
    ringContainer.className = 'glow-ring pos-relative size-glow-ring-lg mx-auto';
    ringContainer.appendChild(svg);
    ringContainer.appendChild(centerText);
    scoreRingEl.appendChild(ringContainer);

    const scoreEl = document.getElementById('syn-score-value');
    animateValue(scoreEl, 0, view.compatibilityScore, 1500);
    dom.setText('syn-compatibility-score', this.getCompatibilityLabel(view.compatibilityScore));

    const detailsCard = dom.createEl('div', {
      className: 'glass-card',
      parent: container
    });

    dom.createEl('h3', {
      className: 'section-eyebrow',
      text: 'Resonanz-Analyse',
      parent: detailsCard
    });

    const grid = dom.createEl('div', {
      className: 'data-grid compact',
      id: 'syn-details-grid',
      parent: detailsCard
    });

    const details = [
      { label: 'Lebenszahl-Resonanz', value: view.lifePathResonance },
      { label: 'Seelenzahl-Resonanz', value: view.soulUrgeResonance },
      { label: 'Persoenlichkeits-Resonanz', value: view.personalityResonance },
      { label: 'Ausdrucks-Resonanz', value: view.expressionResonance },
      { label: 'Zyklus-Sync', value: view.cycleSync },
      { label: 'Gesamt-Harmonie', value: view.compatibilityScore }
    ];

    details.forEach((detail, index) => {
      const item = dom.createEl('div', {
        className: 'stagger-fade card-grid-item-sm',
        parent: grid
      });
      item.setAttribute('data-delay', index + 1);

      dom.createEl('span', {
        className: `value-massive ${index === 5 ? 'accent' : ''} text-size-md`,
        text: '0',
        parent: item
      });

      dom.createEl('span', {
        className: 'value-label',
        text: detail.label,
        parent: item
      });

      const valueEl = item.querySelector('.value-massive');
      animateValue(valueEl, 0, detail.value, 1500, '', (v) => Math.round(v) + '%');

      const timerId = setTimeout(() => item.classList.add('visible'), (index + 1) * 100);
      this._timers.push(timerId);
    });

    if (view.interpretation) {
      const interpCard = dom.createEl('div', {
        className: 'glass-card mt-24',
        parent: container
      });

      dom.createEl('h4', {
        className: 'card-title-syne',
        text: 'Bindungs-Interpretation',
        parent: interpCard
      });

      dom.createEl('p', {
        className: 'interpretation-text',
        text: view.interpretation,
        parent: interpCard
      });
    }
  },

  getCompatibilityLabel(score) {
    if (score >= 80) return 'Starke Resonanz';
    if (score >= 60) return 'Gute Harmonie';
    if (score >= 40) return 'Balance moeglich';
    if (score >= 20) return 'Wachstumspotenzial';
    return 'Karmische Lektion';
  },

  initScrollReveal() {
    dom.initScrollReveal();
  }
};

function normalizeSynergyView(data = {}) {
  const compatibilityScore = data.compatibilityScore ?? data.synergyScore ?? data.synergy_score ?? 0;
  const lifePathResonance = data.lifePathResonance ?? compatibilityScore;
  const soulUrgeResonance = data.soulUrgeResonance ?? data.soulResonance ?? compatibilityScore;
  const expressionResonance = data.expressionResonance ?? compatibilityScore;
  const personalityResonance = data.personalityResonance ?? expressionResonance;
  const cycleSync = data.cycleSync ?? Math.round((lifePathResonance + soulUrgeResonance + expressionResonance) / 3);

  return {
    compatibilityScore,
    lifePathResonance,
    soulUrgeResonance,
    personalityResonance,
    expressionResonance,
    cycleSync,
    interpretation: data.interpretation ?? data.verdict ?? ''
  };
}

synergyRender.init();
dom.initScrollReveal();
