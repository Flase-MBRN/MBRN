/**
 * /dashboard/render_dashboard.js
 * THE MASTERY MIRROR
 * Reaktives Dashboard Rendering via dom_utils.js
 */

import { state } from '../shared/core/state.js';
import { actions } from '../shared/core/actions.js';
import { dom, animateValue, showTerminalLoader } from '../shared/ui/dom_utils.js';
import { i18n } from '../shared/core/i18n.js';
import { nav } from '../shared/ui/navigation.js';
import { renderAuth } from '../shared/ui/render_auth.js';
import { sentimentWidget } from '../shared/ui/widgets/sentiment_widget.js';
import { errorBoundary } from '../shared/ui/error_boundary.js';
import { MBRN_CONFIG } from '../shared/core/config.js';

export const dashboardRender = {
  // Cleanup tracking - MEMORY LEAK FIX
  _unsubscribers: [],
  _listeners: [],
  _timers: [],

  /**
   * Phase 9.1 & 9.2: Initialisierung & Event Binding
   */
  init() {
    const btnCheckin = document.getElementById('btn-checkin');
    if (btnCheckin) {
      const checkinHandler = async () => {
        // PATCH 3: Terminal Loader für psychologischen Delay
        btnCheckin.disabled = true;
        await showTerminalLoader('dash-loader', 1500);
        
        // Phase 9.3: Delegate an Action
        actions.triggerCheckIn();
        btnCheckin.disabled = false;
      };
      btnCheckin.addEventListener('click', checkinHandler);
      this._listeners.push({ element: btnCheckin, type: 'click', handler: checkinHandler });
    }

    // Phase 9.3: State Subscriptions
    this._unsubscribers.push(state.subscribe('systemInitialized', (profile) => this.renderStatus(profile)));

    this._unsubscribers.push(state.subscribe('streakUpdated', (payload) => {
      this.renderStatus(payload.profile);
      dom.setText('dash-msg', i18n.t('checkinSuccess'));
      dom.toggleClass('dash-msg', 'error', false);
    }));

    this._unsubscribers.push(state.subscribe('checkInFailed', (payload) => {
      dom.setText('dash-msg', `⚠️ ${payload.message}`);
    }));

    // Phase 4.0: Scroll Reveal Animation (LAW 9 COMPLIANT - centralized)
    dom.initScrollReveal();

    // initSystem nach allen Subscriptions — garantiert kein Event-Verlust
    console.log('[Dashboard Render] Initializing...');
    
    // DEBT-004: Initialize Global Error Boundary
    errorBoundary.init();
    
    actions.initSystem();
    nav.bindNavigation();
    nav.registerCurrentApp(this);
    renderAuth.init();

    // PATCH 5.1.4-C: Initialize Realtime Sentiment Widget
    sentimentWidget.init('sentiment-widget');
  },

  /**
   * Destroy: Cleanup all subscriptions, listeners, and timers
   * MEMORY LEAK FIX: Complete cleanup pattern
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

    console.log('[Dashboard Render] Destroyed — All listeners removed');
  },

  /**
   * Phase 9.2: Render Logik via dom_utils.js XSS-Safe Updates
   * PATCH 1 & 2: Number Ticker Animation + Stagger Fade
   */
  renderStatus(profile) {
    if (!profile) return;

    // Number Ticker Animation für Streak und Shields
    const streakEl = document.getElementById('dash-streak');
    const shieldsEl = document.getElementById('dash-shields');
    
    if (streakEl) {
      const currentStreak = parseInt(streakEl.textContent) || 0;
      const newStreak = profile.streak || 0;
      if (currentStreak !== newStreak) {
        animateValue(streakEl, currentStreak, newStreak, 1500);
      }
    }
    
    if (shieldsEl) {
      const currentShields = parseInt(shieldsEl.textContent) || 0;
      const newShields = profile.shields || 0;
      if (currentShields !== newShields) {
        animateValue(shieldsEl, currentShields, newShields, 1500);
      }
    }

    // Finde den String-Namen des Tiers via Value aus der CONFIG
    let tierName = "FREE";
    const level = profile.access_level || 0;

    for (const [key, val] of Object.entries(MBRN_CONFIG.accessLevels)) {
      if (val === level) {
        tierName = key;
        break;
      }
    }

    dom.setText('dash-tier', tierName);
    
    // Stagger Fade Animation für Stat-Items
    document.querySelectorAll('.stagger-fade').forEach((el, index) => {
      const timerId = setTimeout(() => {
        el.classList.add('visible');
      }, index * 100);
      this._timers.push(timerId);
    });
  }
};

// Auto-Init im Module Context
dashboardRender.init();
