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
import { renderAuth } from '../../shared/ui/render_auth.js';

export const tuningRender = {
  debounceTimer: null,
  currentData: null,
  
  /**
   * Initialize Frequency Tuner App — Phase 5.0 Full UI
   */
  init() {
    console.log('[Frequency Tuner] Initialized — Phase 5.0 Full UI');
    
    // Live Input mit 300ms Debounce
    const nameInput = document.getElementById('tune-name-input');
    const birthDateInput = document.getElementById('tune-birthdate');
    
    if (nameInput) {
      nameInput.addEventListener('input', () => {
        clearTimeout(this.debounceTimer);
        
        const name = nameInput.value.trim();
        if (name.length < 2) {
          this.clearResults();
          return;
        }
        
        // Show loading indicator
        dom.setText('tune-status', 'Analysiere Frequenz...');
        
        this.debounceTimer = setTimeout(() => {
          const birthDate = birthDateInput ? birthDateInput.value.trim() : '';
          actions.dispatch('calculateNameFrequency', { name, birthDate });
        }, 300);
      });
    }
    
    // State Subscriptions
    state.subscribe('frequencyDone', (result) => {
      this.currentData = result.data;
      this.renderResults(result.data);
    });
    state.subscribe('frequencyFailed', (result) => {
      dom.setText('tune-status', `⚠️ ${result.error}`);
    });
    
    // Initialize Navigation
    nav.bindNavigation();
    renderAuth.init();
    
    // Scroll Reveal Animation
    this.initScrollReveal();
  },
  
  clearResults() {
    dom.setText('tune-status', 'Gib einen Namen ein...');
    dom.setText('tune-frequency-value', '-');
    dom.setText('tune-resonance', '');
    dom.setText('tune-alignment', '');
    
    const bar = document.getElementById('tune-frequency-bar');
    if (bar) bar.style.width = '0%';
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
      bar.style.width = percentage + '%';
      
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
      setTimeout(() => el.classList.add('visible'), index * 100);
    });
  },
  
  initScrollReveal() {
    dom.initScrollReveal();
  }
};

// Auto-Init
tuningRender.init();
dom.initScrollReveal();
