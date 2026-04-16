/**
 * /apps/synergy/render.js
 * SYNERGY ENGINE — Phase 5.0 FULL IMPLEMENTATION
 * 
 * Dim 05: Bindung — Kompatibilitäts-Analyse zwischen zwei Operatoren
 * Backend: shared/core/logic/synergy.js (calculateSynergy)
 */

import { state } from '../../shared/core/state.js';
import { actions } from '../../shared/core/actions.js';
import { dom, animateValue, showTerminalLoader, createGlowRing } from '../../shared/ui/dom_utils.js';
import { nav } from '../../shared/ui/navigation.js';
import { renderAuth } from '../../shared/ui/render_auth.js';
import { i18n } from '../../shared/core/i18n.js';

export const synergyRender = {
  // Cleanup tracking
  _unsubscribers: [],
  _listeners: [],
  _timers: [],
  
  /**
   * Initialize Synergy App — Phase 5.0 Full UI
   */
  init() {
    console.log('[Synergy Engine] Initialized — Phase 5.0 Full UI');
    
    // Event Binding für Calculate Button
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

        // PATCH 3: Terminal Loader für psychologischen Delay
        calcBtn.disabled = true;
        calcBtn.textContent = i18n.t('loadingResonance');
        await showTerminalLoader('syn-results-area', 1500);
        
        // Dispatch to backend
        actions.dispatch('calculateSynergy', { 
          operatorA: { name: nameA, birthDate: dateA },
          operatorB: { name: nameB, birthDate: dateB }
        });
        
        calcBtn.textContent = 'Resonanz berechnen';
        calcBtn.disabled = false;
      };
      calcBtn.addEventListener('click', clickHandler);
      this._listeners.push({ element: calcBtn, type: 'click', handler: clickHandler });
    }
    
    // State Subscriptions
    this._unsubscribers.push(
      state.subscribe('synergyCalculated', (result) => this.renderResults(result.data))
    );
    this._unsubscribers.push(
      state.subscribe('synergyFailed', (result) => {
        dom.setText('syn-error', `⚠️ ${result.error}`);
      })
    );
    
    // Initialize Navigation
    nav.bindNavigation();
    nav.registerCurrentApp(this);
    renderAuth.init();
    
    // Scroll Reveal Animation
    this.initScrollReveal();
  },
  
  /**
   * Destroy: Cleanup all subscriptions, listeners, and timers
   */
  destroy() {
    this._unsubscribers.forEach(unsub => unsub && unsub());
    this._unsubscribers = [];
    this._listeners.forEach(({ element, type, handler }) => {
      element.removeEventListener(type, handler);
    });
    this._listeners = [];
    this._timers.forEach(id => clearTimeout(id));
    this._timers = [];
    console.log('[Synergy Engine] Destroyed — All listeners removed');
  },
  
  renderResults(data) {
    const container = document.getElementById('syn-results-area');
    if (!container) return;
    
    // Clear and show
    container.style.display = 'block';
    dom.clear('syn-results');
    
    // Compatibility Score Card (LAW 3 COMPLIANT)
    const scoreCard = dom.createEl('div', {
      className: 'glass-card text-center mb-24',
      parent: container
    });
    
    dom.createEl('h3', {
      className: 'section-eyebrow',
      text: 'Kompatibilitäts-Score',
      parent: scoreCard
    });
    
    const scoreRing = dom.createEl('div', {
      id: 'syn-score-ring',
      parent: scoreCard
    });
    
    dom.createEl('div', {
      id: 'syn-compatibility-score',
      className: 'status-text',
      text: i18n.t('loading'),
      parent: scoreCard
    });
    
    // Create Glow Ring for Score - use existing scoreRing reference
    const scoreRingEl = document.getElementById('syn-score-ring');
    const score = data.compatibilityScore || 0;
    const svg = createGlowRing(score, 220);
    
    // Add center text (LAW 2/9 COMPLIANT)
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
    
    // Animate score
    const scoreEl = document.getElementById('syn-score-value');
    animateValue(scoreEl, 0, score, 1500);
    dom.setText('syn-compatibility-score', this.getCompatibilityLabel(score));
    
    // Data Grid für Detail-Analyse (LAW 3 COMPLIANT)
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
    
    // Fill detail grid - use existing grid reference
    const details = [
      { label: 'Lebenszahl-Resonanz', value: data.lifePathResonance || 0 },
      { label: 'Seelenzahl-Resonanz', value: data.soulUrgeResonance || 0 },
      { label: 'Persönlichkeits-Resonanz', value: data.personalityResonance || 0 },
      { label: 'Ausdrucks-Resonanz', value: data.expressionResonance || 0 },
      { label: 'Zyklus-Sync', value: data.cycleSync || 0 },
      { label: 'Gesamt-Harmonie', value: score }
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
      grid.appendChild(item);
      
      const valueEl = item.querySelector('.value-massive');
      animateValue(valueEl, 0, detail.value, 1500, '', (v) => Math.round(v) + '%');
      
      const timerId = setTimeout(() => item.classList.add('visible'), (index + 1) * 100);
      this._timers.push(timerId);
    });
    
    // Interpretation Card (LAW 3 COMPLIANT)
    if (data.interpretation) {
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
        text: data.interpretation,
        parent: interpCard
      });
    }
  },
  
  getCompatibilityLabel(score) {
    if (score >= 80) return '🔥 Starke Resonanz';
    if (score >= 60) return '✨ Gute Harmonie';
    if (score >= 40) return '⚖️ Balance möglich';
    if (score >= 20) return '🌱 Wachstumspotenzial';
    return '💫 Karmische Lektion';
  },
  
  initScrollReveal() {
    dom.initScrollReveal();
  }
};

// Auto-Init
synergyRender.init();
dom.initScrollReveal();
