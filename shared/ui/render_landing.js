/**
 * /shared/ui/render_landing.js
 * LANDING PAGE RENDERER — v1.0
 * 
 * Handles Scroll Reveal animations and Landing Page specific initializations.
 * Zero inline scripts in HTML — Architecture Law 4 Compliance.
 */

import { nav } from './navigation.js';

export const landingRender = {
  
  /**
   * Initialize Landing Page
   * Phase 4.0: Scroll Reveal Animation (migrated from inline script)
   */
  init() {
    // Scroll Reveal Animation
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

    // Initialize Navigation bindings (for anchor links)
    nav.bindNavigation();

    console.log('[Landing Render] Initialized — Scroll Reveal active');
  }
};

// Auto-Init im Module Context
landingRender.init();
