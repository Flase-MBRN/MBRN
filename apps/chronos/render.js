/**
 * /apps/chronos/render.js
 * CHRONOS PROTOCOL — Phase 5.0 FULL IMPLEMENTATION
 * 
 * Dim 06: Chronos — Zeit-Zyklen als Navigation
 * Backend: shared/core/logic/chronos.js (calculateChronos)
 */

import { state } from '../../shared/core/state.js';
import { actions } from '../../shared/core/actions.js';
import { dom, animateValue, showTerminalLoader } from '../../shared/ui/dom_utils.js';
import { nav } from '../../shared/ui/navigation.js';
import { renderAuth } from '../../shared/ui/render_auth.js';

export const chronosRender = {
  
  /**
   * Initialize Chronos App — Phase 5.0 Full UI
   */
  init() {
    console.log('[Chronos Protocol] Initialized — Phase 5.0 Full UI');
    
    // Event Binding für Calculate Button
    const calcBtn = document.getElementById('chrono-calc-btn');
    if (calcBtn) {
      calcBtn.addEventListener('click', async () => {
        const birthDate = document.getElementById('chrono-birthdate').value.trim();
        
        if (!birthDate) {
          dom.setText('chrono-error', '⚠️ Bitte Geburtsdatum eingeben');
          return;
        }
        
        // PATCH 3: Terminal Loader für psychologischen Delay
        calcBtn.disabled = true;
        calcBtn.textContent = 'CALCULATING TIMELINE...';
        await showTerminalLoader('chrono-results-area', 1500);
        
        // Dispatch to backend
        actions.dispatch('calculateChronos', { birthDate });
        
        calcBtn.textContent = 'Zeit-Zyklen berechnen';
        calcBtn.disabled = false;
      });
    }
    
    // State Subscriptions
    state.subscribe('chronosDone', (result) => this.renderResults(result.data));
    state.subscribe('chronosFailed', (result) => {
      dom.setText('chrono-error', `⚠️ ${result.error}`);
    });
    
    // Initialize Navigation
    nav.bindNavigation();
    renderAuth.init();
    
    // Scroll Reveal Animation
    this.initScrollReveal();
  },
  
  renderResults(data) {
    const container = document.getElementById('chrono-results-area');
    if (!container) return;
    
    // Clear and show
    container.style.display = 'block';
    container.innerHTML = '';
    container.className = 'tool-section reveal';
    
    // Current Date Reference
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();
    
    // Personal Year / Month / Day Cards
    const cyclesCard = document.createElement('div');
    cyclesCard.className = 'glass-card mb-24';
    cyclesCard.innerHTML = `
      <h3 class="section-eyebrow">
        Aktuelle Zeit-Zyklen — ${currentDay}.${currentMonth}.${currentYear}
      </h3>
      <div class="data-grid compact">
        <div class="stagger-fade card-grid-item" data-delay="1">
          <span class="value-massive accent text-size-hero-sm">0</span>
          <span class="value-label">Personal Year</span>
          <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">${data.personalYearTheme || 'Thema lädt...'}</p>
        </div>
        <div class="stagger-fade card-grid-item" data-delay="2">
          <span class="value-massive text-size-xl">0</span>
          <span class="value-label">Personal Month</span>
          <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">${data.personalMonthTheme || 'Thema lädt...'}</p>
        </div>
        <div class="stagger-fade card-grid-item" data-delay="3">
          <span class="value-massive secondary text-size-lg">0</span>
          <span class="value-label">Personal Day</span>
          <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">${data.personalDayTheme || 'Thema lädt...'}</p>
        </div>
      </div>
    `;
    container.appendChild(cyclesCard);
    
    // Animate the cycle values
    const yearEl = cyclesCard.querySelector('.value-massive.accent');
    const monthEl = cyclesCard.querySelectorAll('.value-massive')[1];
    const dayEl = cyclesCard.querySelector('.value-massive.secondary');
    
    animateValue(yearEl, 0, data.personalYear || 0, 1500);
    animateValue(monthEl, 0, data.personalMonth || 0, 1500);
    animateValue(dayEl, 0, data.personalDay || 0, 1500);
    
    // Timeline Grid — Past, Present, Future
    const timelineCard = document.createElement('div');
    timelineCard.className = 'glass-card';
    timelineCard.innerHTML = `
      <h3 class="section-eyebrow">
        Zeitlinie — Lebenszyklen
      </h3>
      <div class="data-grid compact" id="chrono-timeline-grid"></div>
    `;
    container.appendChild(timelineCard);
    
    // Fill timeline grid with life cycles
    const timelineGrid = document.getElementById('chrono-timeline-grid');
    const cycles = [
      { label: 'Früher Zyklus', value: data.earlyCycle, years: data.earlyCycleYears, delay: 1 },
      { label: 'Mittlerer Zyklus', value: data.middleCycle, years: data.middleCycleYears, delay: 2 },
      { label: 'Später Zyklus', value: data.lateCycle, years: data.lateCycleYears, delay: 3 },
      { label: 'Aktuelle Pinnacle', value: data.currentPinnacle, years: data.currentPinnacleYears, delay: 4 }
    ];
    
    cycles.forEach((cycle) => {
      const item = dom.createEl('div', {
        className: 'stagger-fade card-grid-item-sm',
        parent: timelineGrid
      });
      item.setAttribute('data-delay', cycle.delay);
      
      dom.createEl('span', {
        className: 'value-massive text-size-md',
        text: '0',
        parent: item
      });
      
      dom.createEl('span', {
        className: 'value-label',
        text: cycle.label,
        parent: item
      });
      
      if (cycle.years) {
        dom.createEl('p', {
          className: 'text-size-pico text-theme-muted mt-4',
          text: cycle.years,
          parent: item
        });
      }
      
      const valueEl = item.querySelector('.value-massive');
      animateValue(valueEl, 0, cycle.value || 0, 1500);
      
      setTimeout(() => item.classList.add('visible'), cycle.delay * 100);
    });
    
    // Next Transition Countdown
    if (data.nextTransition) {
      const countdownCard = document.createElement('div');
      countdownCard.className = 'glass-card mt-24 text-center';
      countdownCard.innerHTML = `
        <h4 class="card-title-syne-sm">
          ⏱️ Nächster Zyklus-Wechsel
        </h4>
        <p class="text-size-tiny text-theme-secondary">
          ${data.nextTransition.description || 'Berechne...'}
        </p>
        <div class="info-text-tiny">
          ${data.nextTransition.date || ''}
        </div>
      `;
      container.appendChild(countdownCard);
    }
    
    // Trigger stagger animations
    document.querySelectorAll('#chrono-results-area .stagger-fade').forEach((el, index) => {
      setTimeout(() => el.classList.add('visible'), (index + 1) * 100);
    });
  },
  
  initScrollReveal() {
    dom.initScrollReveal();
  }
};

// Auto-Init
chronosRender.init();
dom.initScrollReveal();
