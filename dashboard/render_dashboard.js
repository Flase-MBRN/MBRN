/**
 * /dashboard/render_dashboard.js
 * THE MASTERY MIRROR
 * Reaktives Dashboard Rendering via dom_utils.js
 */

import { state } from '../shared/core/state.js';
import { actions } from '../shared/core/actions.js';
import { dom } from '../shared/ui/dom_utils.js';
import { MBRN_CONFIG } from '../shared/core/config.js';
import { nav } from '../shared/ui/navigation.js';
import { renderAuth } from '../shared/ui/render_auth.js';

export const dashboardRender = {
  
  /**
   * Phase 9.1 & 9.2: Initialisierung & Event Binding
   */
  init() {
    const btnCheckin = document.getElementById('btn-checkin');
    if (btnCheckin) {
      btnCheckin.addEventListener('click', () => {
        // Phase 9.3: Delegate an Action (Idempotency wird in streak_manager geprüft)
        actions.triggerCheckIn();
      });
    }

    // Phase 9.3: State Subscriptions
    state.subscribe('systemInitialized', (profile) => this.renderStatus(profile));
    
    state.subscribe('streakUpdated', (payload) => {
      this.renderStatus(payload.profile);
      dom.setText('dash-msg', '✅ Check-In erfolgreich! Streak +1');
      dom.toggleClass('dash-msg', 'error', false);
    });
    
    state.subscribe('checkInFailed', (payload) => {
      dom.setText('dash-msg', `⚠️ ${payload.message}`);
    });

    // initSystem nach allen Subscriptions — garantiert kein Event-Verlust
    console.log('[Dashboard Render] Initializing...');
    actions.initSystem();
    nav.bindNavigation();
    renderAuth.init();
  },

  /**
   * Phase 9.2: Render Logik via dom_utils XSS-Safe Updates
   */
  renderStatus(profile) {
    if (!profile) return;

    dom.setText('dash-streak', profile.streak || 0);
    dom.setText('dash-shields', profile.shields || 0);

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
  }
};

// Auto-Init im Module Context
dashboardRender.init();
