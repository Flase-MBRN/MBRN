/**
 * /apps/tuning/render.js
 * FREQUENCY TUNER — Phase 5.0 FULL IMPLEMENTATION
 * 
 * Dim 03: Nomenklatur — Namens-Frequenz Alignment
 * Backend: shared/core/logic/frequency.js (calculateNameFrequency)
 */

import { state } from '../../shared/core/state.js';
import { actions } from '../../shared/core/actions.js';
import { dom, animateValue } from '../../shared/ui/dom_utils.js';
import { nav } from '../../shared/ui/navigation.js';
import { renderNavigation } from '../../shared/ui/render_nav.js';
import { renderAuth } from '../../shared/ui/render_auth.js';
import { i18n } from '../../shared/core/i18n.js';

export const tuningRender = {
  debounceTimer: null,
  currentData: null,
  // Cleanup tracking
  _unsubscribers: [],
  _listeners: [],
  _timers: [],
  
  /**
   * Initialize Frequency Tuner App — Phase 5.0 Full UI
   */
  init() {
    // Law 17: Local action registration
    actions.register('calculateNameFrequency', async (payload) => {
      const { calculateNameFrequency } = await import('../../shared/core/logic/frequency.js');
      const res = calculateNameFrequency(payload.name);
      state.emit('frequencyCalculated', res);
      return res;
    });
    
    // Live Input mit 300ms Debounce
    const nameInput = document.getElementById('tune-name-input');
    const birthDateInput = document.getElementById('tune-birthdate');
    
    if (nameInput) {
      const inputHandler = () => {
        clearTimeout(this.debounceTimer);
        
        const name = nameInput.value.trim();
        if (name.length < 2) {
          this.clearResults();
          return;
        }
        
        // Show loading indicator
        dom.setText('tune-status', i18n.t('analyzing'));
        
        this.debounceTimer = setTimeout(() => {
          const birthDate = birthDateInput ? birthDateInput.value.trim() : '';
          actions.dispatch('calculateNameFrequency', { name, birthDate });
        }, 300);
      };
      nameInput.addEventListener('input', inputHandler);
      this._listeners.push({ element: nameInput, type: 'input', handler: inputHandler });
    }
    
    // State Subscriptions
    this._unsubscribers.push(
      state.subscribe('frequencyCalculated', (result) => {
        this.currentData = result.data;
        this.renderResults(result.data);
      })
    );
    this._unsubscribers.push(
      state.subscribe('frequencyFailed', (result) => {
        dom.setText('tune-status', `⚠️ ${result.error}`);
      })
    );
    
    // Initialize Navigation
    renderNavigation('nav-menu');  // Dynamische Navigation aus config.js
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
    // Clear debounce timer
    clearTimeout(this.debounceTimer);
    this.debounceTimer = null;
    
    this._unsubscribers.forEach(unsub => unsub && unsub());
    this._unsubscribers = [];
    this._listeners.forEach(({ element, type, handler }) => {
      element.removeEventListener(type, handler);
    });
    this._listeners = [];
    this._timers.forEach(id => clearTimeout(id));
    this._timers = [];
  },
  
  clearResults() {
    dom.setText('tune-status', 'Gib einen Namen ein...');
    dom.setText('tune-frequency-value', '-');
    dom.setText('tune-resonance', '');
    dom.setText('tune-alignment', '');
    
    const bar = document.getElementById('tune-frequency-bar');
    if (bar) bar.style.setProperty('--bar-width', '0%');
  },
  
  renderResults(data) {
    // Frequency Value mit Animation
    const freqEl = document.getElementById('tune-frequency-value');
    if (freqEl) {
      const currentVal = parseInt(freqEl.textContent) || 0;
      animateValue(freqEl, currentVal, data.frequency || 0, 800);
    }
    
    // Frequency Bar Visualisierung
    const bar = document.getElementById('tune-frequency-bar');
    if (bar) {
      const percentage = Math.min((data.frequency || 0) / 100 * 100, 100);
      bar.style.setProperty('--bar-width', percentage + '%');
      
      // Color feedback basierend auf Alignment (LAW 9 COMPLIANT)
      const alignment = data.alignment || 0;
      bar.classList.remove('bar-alignment-high', 'bar-alignment-medium', 'bar-alignment-low');
      if (alignment >= 80) {
        bar.classList.add('bar-alignment-high');
      } else if (alignment >= 50) {
        bar.classList.add('bar-alignment-medium');
      } else {
        bar.classList.add('bar-alignment-low');
      }
    }
    
    // Resonance Text
    const resonanceEl = document.getElementById('tune-resonance');
    if (resonanceEl) {
      const alignment = data.alignment || 0;
      let resonance = 'Dissonant';
      let resonanceClass = 'text-resonance-low';
      
      if (alignment >= 80) {
        resonance = '🔥 Harmonisch';
        resonanceClass = 'text-resonance-high';
      } else if (alignment >= 60) {
        resonance = '✨ Gut abgestimmt';
        resonanceClass = 'text-resonance-good';
      } else if (alignment >= 40) {
        resonance = '⚖️ Neutral';
        resonanceClass = 'text-resonance-neutral';
      }
      
      resonanceEl.textContent = resonance;
      resonanceEl.className = resonanceClass;
    }
    
    // Alignment Score
    const alignmentEl = document.getElementById('tune-alignment');
    if (alignmentEl && data.alignment) {
      alignmentEl.textContent = `Alignment: ${data.alignment}%`;
    }
    
    // Status
    dom.setText('tune-status', 'Frequenz analysiert');
    
    // Trigger stagger animation
    document.querySelectorAll('#tune-results .stagger-fade').forEach((el, index) => {
      const timerId = setTimeout(() => el.classList.add('visible'), index * 100);
      this._timers.push(timerId);
    });
  },
  
  initScrollReveal() {
    dom.initScrollReveal();
  }
};

// Auto-Init
tuningRender.init();
dom.initScrollReveal();
