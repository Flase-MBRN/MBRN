/**
 * /apps/chronos/render.js
 * CHRONOS PROTOCOL — Phase 5.0 UI Scaffold
 * 
 * Dim 06: Chronos — Zeit-Zyklen als Navigation
 * Backend: shared/core/logic/chronos.js (calculateChronos)
 */

import { state } from '../../shared/core/state.js';
import { actions } from '../../shared/core/actions.js';
import { dom } from '../../shared/ui/dom_utils.js';
import { nav } from '../../shared/ui/navigation.js';
import { renderAuth } from '../../shared/ui/render_auth.js';

export const chronosRender = {
  
  /**
   * Initialize Chronos App
   */
  init() {
    console.log('[Chronos Protocol] Initialized — Phase 5.0 Scaffold');
    
    // TODO Phase 5.0:
    // - Date input (birthdate reference)
    // - calculateChronos dispatch
    // - Personal Year/Month/Day display
    // - Timeline view (horizontal time rail)
    // - UTC timezone handling
    
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
chronosRender.init();
