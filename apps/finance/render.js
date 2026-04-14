/**
 * /apps/finance/render.js
 * PURE UI LAYER - The King's Face
 * 
 * Hört auf Events aus state.js und nutzt dom_utils.js für XSS-sicheres Rendering.
 */

import { state } from '../../shared/core/state.js';
import { actions } from '../../shared/core/actions.js';
import { calculateCompoundInterest } from './logic.js';
import { dom } from '../../shared/ui/dom_utils.js';
import { hasFeature } from '../../shared/loyalty/access_control.js';
import { nav } from '../../shared/ui/navigation.js';
import { renderAuth } from '../../shared/ui/render_auth.js';

export const financeRender = {
  
  /**
   * Phase 8.1: Bindet Event-Listener und UI-Subscribers
   */
  init() {
    // Erlaubt: querySelector im Render-Layer für Inputs/Buttons
    const calcBtn = document.getElementById('calc-btn');
    
    if (calcBtn) {
      calcBtn.addEventListener('click', () => {
        const principal = parseFloat(document.getElementById('input-principal').value || 0);
        const rate = parseFloat(document.getElementById('input-rate').value || 0);
        const years = parseFloat(document.getElementById('input-years').value || 0);
        const monthly = parseFloat(document.getElementById('input-monthly').value || 0);

        // Strict Data Flow: UI -> Action -> Logic -> State -> UI
        actions.dispatch('calculateFinance', { principal, rate, years, monthlyAddition: monthly });
      });
    }

    // Phase 11: Paywall Delegation (locked Buttons triggern Action)
    const premiumContainer = document.getElementById('premium-features-container');
    if (premiumContainer) {
      premiumContainer.addEventListener('click', (e) => {
        const lockedBtn = e.target.closest('.locked-feature-btn');
        if (lockedBtn) {
          const feature = lockedBtn.getAttribute('data-feature') || 'premium';
          actions.showPaywall(feature);
        }
      });
    }

    // State Subscribers binden
    state.subscribe('calculationDone', (result) => this.renderResults(result.data));
    state.subscribe('calculationFailed', (result) => {
      dom.setText('finance-error', `❌ Fehler: ${result.error}`);
    });

    // Phase 18.4: Paywall Event Renderer
    state.subscribe('paywallRequested', (payload) => {
      dom.clear('modal-container');
      dom.renderTemplate('paywall-template', 'modal-container', (clone) => {
        // Sicherer Text-Einschub in das generierte Template (Data Mapper Funktion)
        const nameSpan = clone.querySelector('.paywall-feature-name');
        if (nameSpan) nameSpan.textContent = payload.feature;

        // Listener zum Schließen binden
        const closeBtn = clone.querySelector('.modal-close');
        if (closeBtn) closeBtn.addEventListener('click', () => dom.clear('modal-container'));

        // Phase 18.4: Upgrade-Button an Checkout binden
        const upgradeBtn = clone.querySelector('.btn-primary');
        if (upgradeBtn) {
          upgradeBtn.addEventListener('click', () => {
            upgradeBtn.textContent = 'Initialisiere...';
            upgradeBtn.disabled = true;
            actions.startCheckout('artifact');
          });
        }
      });
    });

    // Fix #1: Registriere die Logic als Action im Orchestrator
    actions.register('calculateFinance', (inputData) => {
        if (!inputData) return { success: false, error: 'Keine Input-Daten' };
        const result = calculateCompoundInterest(
          inputData.principal, inputData.rate, inputData.years, inputData.monthlyAddition
        );
        if (result.success) state.emit('calculationDone', result);
        else state.emit('calculationFailed', result);
        return result;
    });

    // Phase 4.0: Scroll Reveal Animation (aus index.html migriert)
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

    // Fix #2: Boot + Nav am Ende von init()
    console.log('[Finance Render] Initializing...');
    actions.initSystem();
    nav.bindNavigation();
    renderAuth.init();
  },

  /**
   * Phase 8.2: Ergebnisse via dom_utils.js anzeigen (Sanitized)
   */
  renderResults(data) {
    // Fehler zurücksetzen
    dom.setText('finance-error', '');

    // Werte sicher einfügen
    dom.setText('res-final', `${data.finalBalance.toLocaleString('de-DE')} €`);
    dom.setText('res-invested', `${data.totalInvested.toLocaleString('de-DE')} €`);
    dom.setText('res-interest', `${data.totalInterest.toLocaleString('de-DE')} €`);

    // Phase 8.3: Gatekeeper-Hook
    dom.clear('premium-features-container'); // Container sauber leeren
    
    // PDF Export Button wird nur bei vorhandenem Feature gerendert
    if (hasFeature('pdf_export')) {
      dom.renderTemplate('pdf-btn-template', 'premium-features-container');
    } else {
      // Opt-in für Paywall Hook später
      dom.renderTemplate('pdf-locked-template', 'premium-features-container');
    }
  }
};

// Automatischer Start beim Laden (da type="module" ist DOM Content idR schon da)
financeRender.init();
