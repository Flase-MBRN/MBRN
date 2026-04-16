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
import { i18n } from '../../shared/core/i18n.js';

export const chronosRender = {
  // Cleanup tracking
  _unsubscribers: [],
  _listeners: [],
  _timers: [],
  
  /**
   * Initialize Chronos App — Phase 5.0 Full UI
   */
  init() {
    console.log('[Chronos Protocol] Initialized — Phase 5.0 Full UI');
    
    // Event Binding für Calculate Button
    const calcBtn = document.getElementById('chrono-calc-btn');
    if (calcBtn) {
      const clickHandler = async () => {
        const birthDate = document.getElementById('chrono-birthdate').value.trim();
        
        if (!birthDate) {
          dom.setText('chrono-error', i18n.t('enterBirthdate'));
          return;
        }

        // PATCH 3: Terminal Loader für psychologischen Delay
        calcBtn.disabled = true;
        calcBtn.textContent = i18n.t('loadingTimeline');
        await showTerminalLoader('chrono-results-area', 1500);
        
        // Dispatch to backend
        actions.dispatch('calculateChronos', { birthDate });
        
        calcBtn.textContent = 'Zeit-Zyklen berechnen';
        calcBtn.disabled = false;
      };
      calcBtn.addEventListener('click', clickHandler);
      this._listeners.push({ element: calcBtn, type: 'click', handler: clickHandler });
    }
    
    // State Subscriptions
    this._unsubscribers.push(
      state.subscribe('chronosCalculated', (result) => this.renderResults(result.data))
    );
    this._unsubscribers.push(
      state.subscribe('chronosFailed', (result) => {
        dom.setText('chrono-error', `⚠️ ${result.error}`);
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
    // Unsubscribe from state
    this._unsubscribers.forEach(unsub => unsub && unsub());
    this._unsubscribers = [];
    
    // Remove event listeners
    this._listeners.forEach(({ element, type, handler }) => {
      element.removeEventListener(type, handler);
    });
    this._listeners = [];
    
    // Clear all timers
    this._timers.forEach(id => clearTimeout(id));
    this._timers = [];
    
    console.log('[Chronos Protocol] Destroyed — All listeners removed');
  },
  
  renderResults(data) {
    const container = document.getElementById('chrono-results-area');
    if (!container) return;
    
    // Clear and show (LAW 3 COMPLIANT)
    container.style.display = 'block';
    dom.clear(container.id || 'chrono-results-area');
    container.className = 'tool-section reveal';
    
    // Current Date Reference
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();
    
    // Personal Year / Month / Day Cards (LAW 3 COMPLIANT)
    const cyclesCard = dom.createEl('div', {
      className: 'glass-card mb-24',
      parent: container
    });
    
    dom.createEl('h3', {
      className: 'section-eyebrow',
      text: `Aktuelle Zeit-Zyklen — ${currentDay}.${currentMonth}.${currentYear}`,
      parent: cyclesCard
    });
    
    const dataGrid = dom.createEl('div', {
      className: 'data-grid compact',
      parent: cyclesCard
    });
    
    // Personal Year
    const yearItem = dom.createEl('div', {
      className: 'stagger-fade card-grid-item',
      parent: dataGrid
    });
    yearItem.setAttribute('data-delay', '1');
    dom.createEl('span', {
      className: 'value-massive accent text-size-hero-sm',
      text: '0',
      parent: yearItem
    });
    dom.createEl('span', {
      className: 'value-label',
      text: 'Personal Year',
      parent: yearItem
    });
    dom.createEl('p', {
      className: 'text-size-pico text-theme-muted mt-4',
      text: data.personalYearTheme || 'Thema lädt...',
      parent: yearItem
    });
    
    // Personal Month
    const monthItem = dom.createEl('div', {
      className: 'stagger-fade card-grid-item',
      parent: dataGrid
    });
    monthItem.setAttribute('data-delay', '2');
    dom.createEl('span', {
      className: 'value-massive text-size-xl',
      text: '0',
      parent: monthItem
    });
    dom.createEl('span', {
      className: 'value-label',
      text: 'Personal Month',
      parent: monthItem
    });
    dom.createEl('p', {
      className: 'text-size-pico text-theme-muted mt-4',
      text: data.personalMonthTheme || 'Thema lädt...',
      parent: monthItem
    });
    
    // Personal Day
    const dayItem = dom.createEl('div', {
      className: 'stagger-fade card-grid-item',
      parent: dataGrid
    });
    dayItem.setAttribute('data-delay', '3');
    dom.createEl('span', {
      className: 'value-massive secondary text-size-lg',
      text: '0',
      parent: dayItem
    });
    dom.createEl('span', {
      className: 'value-label',
      text: 'Personal Day',
      parent: dayItem
    });
    dom.createEl('p', {
      className: 'text-size-pico text-theme-muted mt-4',
      text: data.personalDayTheme || 'Thema lädt...',
      parent: dayItem
    });
    
    // Animate the cycle values
    const yearEl = cyclesCard.querySelector('.value-massive.accent');
    const monthEl = cyclesCard.querySelectorAll('.value-massive')[1];
    const dayEl = cyclesCard.querySelector('.value-massive.secondary');
    
    animateValue(yearEl, 0, data.personalYear || 0, 1500);
    animateValue(monthEl, 0, data.personalMonth || 0, 1500);
    animateValue(dayEl, 0, data.personalDay || 0, 1500);
    
    // Timeline Grid — Past, Present, Future (LAW 3 COMPLIANT)
    const timelineCard = dom.createEl('div', {
      className: 'glass-card',
      parent: container
    });
    
    dom.createEl('h3', {
      className: 'section-eyebrow',
      text: 'Zeitlinie — Lebenszyklen',
      parent: timelineCard
    });
    
    const timelineGrid = dom.createEl('div', {
      className: 'data-grid compact',
      id: 'chrono-timeline-grid',
      parent: timelineCard
    });
    
    // Fill timeline grid with life cycles
    // Use existing timelineGrid reference from line 180
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
    
    // Next Transition Countdown (LAW 3 COMPLIANT)
    if (data.nextTransition) {
      const countdownCard = dom.createEl('div', {
        className: 'glass-card mt-24 text-center',
        parent: container
      });
      
      dom.createEl('h4', {
        className: 'card-title-syne-sm',
        text: '⏱️ Nächster Zyklus-Wechsel',
        parent: countdownCard
      });
      
      dom.createEl('p', {
        className: 'text-size-tiny text-theme-secondary',
        text: data.nextTransition.description || 'Berechne...',
        parent: countdownCard
      });
      
      dom.createEl('div', {
        className: 'info-text-tiny',
        text: data.nextTransition.date || '',
        parent: countdownCard
      });
    }
    
    // Trigger stagger animations
    document.querySelectorAll('#chrono-results-area .stagger-fade').forEach((el, index) => {
      const timerId = setTimeout(() => el.classList.add('visible'), (index + 1) * 100);
      this._timers.push(timerId);
    });
  },
  
  initScrollReveal() {
    dom.initScrollReveal();
  }
};

// Auto-Init
chronosRender.init();
dom.initScrollReveal();
