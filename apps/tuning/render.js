/**
 * /apps/tuning/render.js
 * FREQUENCY TUNER — Phase 5.0 UI Scaffold
 * 
 * Dim 03: Nomenklatur — Namens-Frequenz Alignment
 * Backend: shared/core/logic/frequency.js (calculateNameFrequency)
 */

import { state } from '../../shared/core/state.js';
import { actions } from '../../shared/core/actions.js';
import { dom } from '../../shared/ui/dom_utils.js';
import { nav } from '../../shared/ui/navigation.js';
import { renderAuth } from '../../shared/ui/render_auth.js';

export const tuningRender = {
  
  /**
   * Initialize Frequency Tuner App
   */
  init() {
    console.log('[Frequency Tuner] Initialized — Phase 5.0 Scaffold');
    
    // TODO Phase 5.0:
    // - Live input field with 300ms debounce
    // - calculateNameFrequency dispatch on keystroke
    // - Color feedback: Grey → Deep Purple alignment indicator
    // - Name value vs Life Path matching score
    // - Resonance text (Harmonisch/Neutral/Dissonant)
    
    // Initialize Navigation
    nav.bindNavigation();
    renderAuth.init();
    
    // Scroll Reveal Animation
    this.initScrollReveal();
  },
  
  initScrollReveal() {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    document.querySelectorAll('.reveal').forEach(el => {
      observer.observe(el);
    });
  }
};

// Auto-Init
tuningRender.init();
