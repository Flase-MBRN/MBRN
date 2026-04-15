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

export const synergyRender = {
  
  /**
   * Initialize Synergy App — Phase 5.0 Full UI
   */
  init() {
    console.log('[Synergy Engine] Initialized — Phase 5.0 Full UI');
    
    // Event Binding für Calculate Button
    const calcBtn = document.getElementById('syn-calc-btn');
    if (calcBtn) {
      calcBtn.addEventListener('click', async () => {
        const nameA = document.getElementById('syn-input-a').value.trim();
        const dateA = document.getElementById('syn-date-a').value.trim();
        const nameB = document.getElementById('syn-input-b').value.trim();
        const dateB = document.getElementById('syn-date-b').value.trim();
        
        if (!nameA || !dateA || !nameB || !dateB) {
          dom.setText('syn-error', '⚠️ Bitte beide Operatoren vollständig eingeben');
          return;
        }
        
        // PATCH 3: Terminal Loader für psychologischen Delay
        calcBtn.disabled = true;
        calcBtn.textContent = 'CALCULATING RESONANCE...';
        await showTerminalLoader('syn-results-area', 1500);
        
        // Dispatch to backend
        actions.dispatch('calculateSynergy', { 
          operatorA: { name: nameA, birthDate: dateA },
          operatorB: { name: nameB, birthDate: dateB }
        });
        
        calcBtn.textContent = 'Resonanz berechnen';
        calcBtn.disabled = false;
      });
    }
    
    // State Subscriptions
    state.subscribe('synergyDone', (result) => this.renderResults(result.data));
    state.subscribe('synergyFailed', (result) => {
      dom.setText('syn-error', `⚠️ ${result.error}`);
    });
    
    // Initialize Navigation
    nav.bindNavigation();
    renderAuth.init();
    
    // Scroll Reveal Animation
    this.initScrollReveal();
  },
  
  renderResults(data) {
    const container = document.getElementById('syn-results-area');
    if (!container) return;
    
    // Clear and show
    container.style.display = 'block';
    dom.clear('syn-results');
    
    // Compatibility Score Card
    const scoreCard = document.createElement('div');
    scoreCard.className = 'glass-card text-center mb-24';
    scoreCard.innerHTML = `
      <h3 class="section-eyebrow">
        Kompatibilitäts-Score
      </h3>
      <div id="syn-score-ring"></div>
      <div id="syn-compatibility-score" class="status-text">
        Berechne Resonanz...
      </div>
    `;
    container.appendChild(scoreCard);
    
    // Create Glow Ring for Score
    const scoreRing = document.getElementById('syn-score-ring');
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
    scoreRing.appendChild(ringContainer);
    
    // Animate score
    const scoreEl = document.getElementById('syn-score-value');
    animateValue(scoreEl, 0, score, 1500);
    dom.setText('syn-compatibility-score', this.getCompatibilityLabel(score));
    
    // Data Grid für Detail-Analyse
    const detailsCard = document.createElement('div');
    detailsCard.className = 'glass-card';
    detailsCard.innerHTML = `
      <h3 class="section-eyebrow">
        Resonanz-Analyse
      </h3>
      <div class="data-grid compact" id="syn-details-grid"></div>
    `;
    container.appendChild(detailsCard);
    
    // Fill detail grid
    const grid = document.getElementById('syn-details-grid');
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
      
      setTimeout(() => item.classList.add('visible'), (index + 1) * 100);
    });
    
    // Interpretation Card
    if (data.interpretation) {
      const interpCard = document.createElement('div');
      interpCard.className = 'glass-card mt-24';
      interpCard.innerHTML = `
        <h4 class="card-title-syne">
          Bindungs-Interpretation
        </h4>
        <p class="interpretation-text">
          ${data.interpretation}
        </p>
      `;
      container.appendChild(interpCard);
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
