/**
 * /apps/finance/render.js
 * PURE UI LAYER - The King's Face
 * 
 * Hört auf Events aus state.js und nutzt dom_utils.js für XSS-sicheres Rendering.
 */

import { state } from '../../shared/core/state.js';
import { actions } from '../../shared/core/actions.js';
import { calculateCompoundInterest } from './logic.js';
import { dom, animateValue, showTerminalLoader } from '../../shared/ui/dom_utils.js';
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
      calcBtn.addEventListener('click', async () => {
        const principal = parseFloat(document.getElementById('input-principal').value || 0);
        const rate = parseFloat(document.getElementById('input-rate').value || 0);
        const years = parseFloat(document.getElementById('input-years').value || 0);
        const monthly = parseFloat(document.getElementById('input-monthly').value || 0);

        // PATCH 3: Terminal Loader für psychologischen Delay
        calcBtn.disabled = true;
        calcBtn.textContent = 'CALCULATING...';
        await showTerminalLoader('results-section', 1500);

        // Strict Data Flow: UI -> Action -> Logic -> State -> UI
        actions.dispatch('calculateFinance', { principal, rate, years, monthlyAddition: monthly });
        calcBtn.textContent = 'Jetzt Berechnen';
        calcBtn.disabled = false;
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

    // Phase 4.0: Scroll Reveal Animation (LAW 9 COMPLIANT - centralized)
    dom.initScrollReveal();

    // Fix #2: Boot + Nav am Ende von init()
    console.log('[Finance Render] Initializing...');
    actions.initSystem();
    nav.bindNavigation();
    renderAuth.init();
  },

  /**
   * Phase 8.2: Ergebnisse via dom_utils.js anzeigen (Sanitized)
   * Phase 5.0: Premium Value-Massive Styling + Number Ticker
   */
  renderResults(data) {
    // Fehler zurücksetzen
    dom.setText('finance-error', '');

    // Phase 5.0: Massive Value Cards mit Number Ticker
    const finalEl = document.getElementById('res-final');
    const investedEl = document.getElementById('res-invested');
    const interestEl = document.getElementById('res-interest');
    
    // Update structure to value-massive layout
    if (finalEl) {
      finalEl.innerHTML = `
        <span class="value-massive text-size-xl">0</span>
        <span class="value-label">Endkapital</span>
      `;
      const valueEl = finalEl.querySelector('.value-massive');
      animateValue(valueEl, 0, data.finalBalance, 1500, '', (v) => v.toLocaleString('de-DE', {minimumFractionDigits: 0, maximumFractionDigits: 0}) + ' €');
    }
    
    if (investedEl) {
      investedEl.innerHTML = `
        <span class="value-massive secondary text-size-md">0</span>
        <span class="value-label">Eingezahlt</span>
      `;
      const valueEl = investedEl.querySelector('.value-massive');
      animateValue(valueEl, 0, data.totalInvested, 1500, '', (v) => v.toLocaleString('de-DE', {minimumFractionDigits: 0, maximumFractionDigits: 0}) + ' €');
    }
    
    if (interestEl) {
      interestEl.innerHTML = `
        <span class="value-massive accent text-size-lg">0</span>
        <span class="value-label">Zinsgewinn</span>
      `;
      const valueEl = interestEl.querySelector('.value-massive');
      animateValue(valueEl, 0, data.totalInterest, 1500, '', (v) => v.toLocaleString('de-DE', {minimumFractionDigits: 0, maximumFractionDigits: 0}) + ' €');
    }

    // Phase 8.3: Gatekeeper-Hook
    dom.clear('premium-features-container'); // Container sauber leeren
    
    // PDF Export Button wird nur bei vorhandenem Feature gerendert
    if (hasFeature('pdf_export')) {
      dom.renderTemplate('pdf-btn-template', 'premium-features-container');
    } else {
      // Opt-in für Paywall Hook später
      dom.renderTemplate('pdf-locked-template', 'premium-features-container');
    }
    
    // Trigger stagger animation for result cards
    document.querySelectorAll('.results-card .stagger-fade').forEach((el, index) => {
      setTimeout(() => el.classList.add('visible'), index * 100);
    });
  }
};

// Automatischer Start beim Laden (da type="module" ist DOM Content idR schon da)
financeRender.init();
