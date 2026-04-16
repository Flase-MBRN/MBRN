/**
 * /apps/numerology/render.js
 * FULL SCALE RENDERING — v2.0
 */

import { state }  from '../../shared/core/state.js';
import { actions } from '../../shared/core/actions.js';
import { dom, animateValue, showTerminalLoader, createGlowRing } from '../../shared/ui/dom_utils.js';
import { nav }    from '../../shared/ui/navigation.js';
import { renderAuth } from '../../shared/ui/render_auth.js';
import { generateShareCard, generateOperatorReport } from '../../shared/core/logic/orchestrator.js';
import { i18n } from '../../shared/core/i18n.js';
import { errorBoundary } from '../../shared/ui/error_boundary.js';

export const numerologyRender = {
  currentData: null,
  // Cleanup tracking - MEMORY LEAK FIX
  _unsubscribers: [],
  _listeners: [],
  _timers: [],

  init() {
    // 1. Event Binding (Action Registration moved to Core)
    const calcBtn = document.getElementById('num-calc-btn');
    if (calcBtn) {
      const clickHandler = async () => {
        const name = document.getElementById('num-input-name').value.trim();
        const date = document.getElementById('num-input-date').value.trim();
        
        if (!name || !date) {
          dom.setText('num-error', i18n.t('enterNameDate'));
          return;
        }

        // PATCH 3: Terminal Loader für psychologischen Delay
        calcBtn.disabled = true;
        calcBtn.textContent = i18n.t('loadingDecrypt');
        await showTerminalLoader('num-results-area', 1500);
        
        actions.dispatch('calculateFullProfile', { name, birthDate: date });
        calcBtn.textContent = 'Berechne vollständiges Profil';
        calcBtn.disabled = false;
      };
      calcBtn.addEventListener('click', clickHandler);
      this._listeners.push({ element: calcBtn, type: 'click', handler: clickHandler });
    }

    const shareBtn = document.getElementById('num-share-btn');
    if (shareBtn) {
      const shareHandler = () => {
        state.emit('analyticsTrack', { event: 'share_card_generated', source: 'numerology' });
        this.handleShare();
      };
      shareBtn.addEventListener('click', shareHandler);
      this._listeners.push({ element: shareBtn, type: 'click', handler: shareHandler });
    }

    const bridgeBtn = document.getElementById('num-bridge-btn');
    if (bridgeBtn) {
      const bridgeHandler = () => {
        state.emit('analyticsTrack', { event: 'lead_bridge_crossed', source: 'numerology' });
        nav.navigateTo('finance');
      };
      bridgeBtn.addEventListener('click', bridgeHandler);
      this._listeners.push({ element: bridgeBtn, type: 'click', handler: bridgeHandler });
    }

    // Phase 19.3: Premium PDF Export Trigger
    const pdfBtn = document.getElementById('num-pdf-btn');
    if (pdfBtn) {
      const pdfHandler = async () => {
        const user = state.get('user');
        const accessLevel = user ? (user.access_level || 0) : 0;

        // DEV BYPASS (Phase 4.0): PDF ohne Stripe generieren
        if (accessLevel < 10 && !MBRN_CONFIG.dev.bypassPayment) {
          state.emit('paywallRequested', { feature: 'Deep Decode Artefakt' });
          return;
        }

        if (!this.currentData) return;

        pdfBtn.textContent = 'DECRYPTING...';
        pdfBtn.disabled = true;

        try {
          // Pass legacy data format to generator (unified format compatibility)
          const legacyData = this.currentData.legacy?.full_profile || this.currentData;
          const doc = await generateOperatorReport(legacyData);
          doc.save(`MBRN_${legacyData.meta.name.replace(/\s+/g, '_')}.pdf`);
          state.emit('analyticsTrack', { event: 'pdf_artifact_generated', source: 'numerology' });
        } catch (err) {
          console.error('[PDF Engine] Generation failed:', err);
          errorBoundary.displayError({
            type: 'pdf_generation_failed',
            error: 'Fehler bei der PDF-Erstellung. Bitte versuche es erneut.',
            severity: 'critical'
          });
        } finally {
          pdfBtn.textContent = 'ARTEFAKT ERSTELLEN';
          pdfBtn.disabled = false;
        }
      };
      pdfBtn.addEventListener('click', pdfHandler);
      this._listeners.push({ element: pdfBtn, type: 'click', handler: pdfHandler });
    }

    // Accordion Toggles
    this._accordionHandlers = [];
    document.querySelectorAll('.acc-trigger').forEach(btn => {
      const accordionHandler = () => {
        const item = btn.parentElement;
        const wasActive = item.classList.contains('active');
        // Close others
        document.querySelectorAll('.acc-item').forEach(i => i.classList.remove('active'));
        if (!wasActive) item.classList.add('active');
      };
      btn.addEventListener('click', accordionHandler);
      this._accordionHandlers.push({ element: btn, handler: accordionHandler });
    });

    // 3. State Subscriptions
    this._unsubscribers.push(state.subscribe('numerologyDone', (res) => {
      this.currentData = res.data; // Store unified data
      this.showResultsPanel();
      this.renderAll(res.data.legacy.full_profile); // Use legacy format for rendering
    }));

    this._unsubscribers.push(state.subscribe('numerologyFailed', (res) => {
      dom.setText('num-error', `⚠️ ${res.error}`);
    }));

    // Phase 18.4: Paywall Event Renderer (Synchronized across Hub)
    this._unsubscribers.push(state.subscribe('paywallRequested', (payload) => {
      dom.clear('modal-container');
      dom.renderTemplate('paywall-template', 'modal-container', (clone) => {
        const nameSpan = clone.querySelector('.paywall-feature-name');
        if (nameSpan) nameSpan.textContent = payload.feature;

        const closeBtn = clone.querySelector('.modal-close');
        if (closeBtn) closeBtn.addEventListener('click', () => dom.clear('modal-container'));

        const upgradeBtn = clone.querySelector('.btn-primary');
        if (upgradeBtn) {
          upgradeBtn.addEventListener('click', () => {
            upgradeBtn.textContent = 'Initialisiere...';
            upgradeBtn.disabled = true;
            actions.startCheckout('artifact');
          });
        }
      });
    }));

    // 4. Boot System
    console.log('[Numerology Render] Initializing...');
    actions.initSystem();
    nav.bindNavigation();
    nav.registerCurrentApp(this);
    renderAuth.init();
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

    // Remove accordion handlers
    if (this._accordionHandlers) {
      this._accordionHandlers.forEach(({ element, handler }) => {
        element.removeEventListener('click', handler);
      });
      this._accordionHandlers = [];
    }

    // Clear all timers
    this._timers.forEach(id => clearTimeout(id));
    this._timers = [];

    console.log('[Numerology Render] Destroyed — All listeners removed');
  },

  showResultsPanel() {
    const panel = document.getElementById('num-results-area');
    if (panel) panel.style.display = 'block';
    dom.setText('num-error', '');
  },

  renderAll(data) {
    // data comes from unified format res.data.legacy.full_profile
    this.renderQuantum(data.quantum);
    this.renderLoShu(data.loShu);
    this.renderAccordions(data);
  },

  renderQuantum(quantum) {
    const container = document.getElementById('num-quantum-gauge');
    if (!container) return;

    // Phase 5.0: Glow Ring Visualization
    const score = quantum.score;
    container.replaceChildren();
    
    // Create glow ring container (LAW 9 COMPLIANT)
    const ringContainer = document.createElement('div');
    ringContainer.className = 'glow-ring pos-relative size-glow-ring mx-auto';
    
    // Create SVG glow ring
    const svg = createGlowRing(score, 200);
    ringContainer.appendChild(svg);
    
    // Add score text in center (LAW 2/9 COMPLIANT)
    const scoreText = document.createElement('div');
    scoreText.className = 'pos-center-absolute';
    
    const scoreValue = document.createElement('span');
    scoreValue.id = 'num-quantum-score-value';
    scoreValue.className = 'value-massive text-size-hero-sm text-no-shadow';
    scoreValue.textContent = '0';
    scoreText.appendChild(scoreValue);
    
    const percentSpan = document.createElement('span');
    percentSpan.className = 'text-size-sm text-theme-accent';
    percentSpan.textContent = '%';
    scoreText.appendChild(percentSpan);
    ringContainer.appendChild(scoreText);
    
    container.appendChild(ringContainer);
    
    // Animate the score value
    const scoreEl = document.getElementById('num-quantum-score-value');
    if (scoreEl) {
      animateValue(scoreEl, 0, score, 1500);
    }
    
    dom.setText('num-quantum-label', quantum.interpretation);
  },

  handleShare() {
    if (!this.currentData) return;
    
    // Phase 16.2: Viral Share Card Generation
    // Use legacy data format for generator (unified format compatibility)
    const legacyData = this.currentData.legacy?.full_profile || this.currentData;
    const canvas = generateShareCard(legacyData);
    const link = document.getElementById('num-download-link');
    if (link) {
      link.href = canvas.toDataURL('image/png');
      link.download = `MBRN_Share_${legacyData.meta.name.replace(/\s+/g, '_')}.png`;
      link.click();
    }
  },

  renderLoShu(loshu) {
    const container = document.getElementById('num-loshu-grid');
    if (!container) return;
    
    container.replaceChildren();
    const layout = [
      [4, 9, 2],
      [3, 5, 7],
      [8, 1, 6]
    ];

    layout.flat().forEach(num => {
      const count = loshu.grid[num] || 0;
      const cell = document.createElement('div');
      cell.className = 'loshu-cell';
      
      const val = document.createElement('span');
      val.className = 'loshu-val';
      val.textContent = count > 0 ? Array(count).fill(num).join('') : '';
      
      const pos = document.createElement('span');
      pos.className = 'loshu-num';
      pos.textContent = num;

      cell.appendChild(val);
      cell.appendChild(pos);
      container.appendChild(cell);
    });

    dom.setText('num-loshu-lines', `Aktive Linien: ${loshu.activeLines.join(', ') || 'Keine'}`);
  },

  renderAccordions(data) {
    // Phase 5.0: Premium Data Grid Layout mit value-massive
    const createDataCard = (container, label, value, delay = 0) => {
      const card = document.createElement('div');
      card.className = 'stagger-fade card-grid-item-sm';
      if (delay) card.setAttribute('data-delay', delay);
      
      const valueEl = document.createElement('span');
      valueEl.className = 'value-massive text-size-lg';
      valueEl.textContent = '0';
      
      const labelEl = document.createElement('span');
      labelEl.className = 'value-label';
      labelEl.textContent = label;
      
      card.appendChild(valueEl);
      card.appendChild(labelEl);
      container.appendChild(card);
      
      // Animate number if value is numeric
      const numValue = parseInt(value);
      if (!isNaN(numValue)) {
        animateValue(valueEl, 0, numValue, 1500);
      } else {
        valueEl.textContent = value;
      }
      
      // Trigger stagger animation
      setTimeout(() => card.classList.add('visible'), delay * 100);
    };

    const createSectionHeader = (container, text) => {
      const header = document.createElement('div');
      header.className = 'section-header-label';
      header.textContent = text;
      container.appendChild(header);
    };

    // 1. Kernzahlen - Premium Data Grid
    const coreList = document.getElementById('acc-core-list');
    coreList.replaceChildren();
    coreList.className = 'data-grid compact';
    createDataCard(coreList, 'Lebenszahl', data.core.lifePath, 1);
    createDataCard(coreList, 'Seelenzahl', data.core.soulUrge, 2);
    createDataCard(coreList, 'Persönlichkeit', data.core.personality, 3);
    createDataCard(coreList, 'Ausdruckszahl', data.core.expression, 4);
    createDataCard(coreList, 'Reifezahl', data.additional.maturity, 5);
    createDataCard(coreList, 'Geburtstag', data.additional.birthday, 6);

    // 2. Phasen - Premium Data Grid
    const phasesList = document.getElementById('acc-phases-list');
    if (!phasesList) return;
    createSectionHeader(phasesList, 'Lebenszyklen');
    const cyclesGrid = document.createElement('div');
    cyclesGrid.className = 'data-grid compact';
    createDataCard(cyclesGrid, 'Früher Zyklus', data.cycles.c1, 1);
    createDataCard(cyclesGrid, 'Mittlerer Zyklus', data.cycles.c2, 2);
    createDataCard(cyclesGrid, 'Später Zyklus', data.cycles.c3, 3);
    phasesList.appendChild(cyclesGrid);
    
    createSectionHeader(phasesList, 'Höhepunkte (Pinnacles)');
    const pinnaclesGrid = document.createElement('div');
    pinnaclesGrid.className = 'data-grid compact';
    createDataCard(pinnaclesGrid, 'Pinnacle 1', data.pinnacles.p1, 4);
    createDataCard(pinnaclesGrid, 'Pinnacle 2', data.pinnacles.p2, 5);
    createDataCard(pinnaclesGrid, 'Pinnacle 3', data.pinnacles.p3, 6);
    createDataCard(pinnaclesGrid, 'Pinnacle 4', data.pinnacles.p4, 7);
    phasesList.appendChild(pinnaclesGrid);

    // 3. Karma & Challenges - Premium Data Grid
    const karmaList = document.getElementById('acc-karma-list');
    karmaList.replaceChildren();
    createSectionHeader(karmaList, 'Herausforderungen');
    const challengesGrid = document.createElement('div');
    challengesGrid.className = 'data-grid compact';
    createDataCard(challengesGrid, 'Challenge 1', data.challenges.ch1, 1);
    createDataCard(challengesGrid, 'Challenge 2', data.challenges.ch2, 2);
    createDataCard(challengesGrid, 'Haupt-Challenge', data.challenges.ch3, 3);
    createDataCard(challengesGrid, 'Gespannte Challenge', data.challenges.ch4, 4);
    karmaList.appendChild(challengesGrid);
    
    createSectionHeader(karmaList, 'Karma');
    const karmaGrid = document.createElement('div');
    karmaGrid.className = 'data-grid compact';
    createDataCard(karmaGrid, 'Karmische Lektionen', data.karma.lessons.join(', ') || 'Keine', 5);
    createDataCard(karmaGrid, 'Verborgene Passion', data.karma.passion.join(', '), 6);
    karmaList.appendChild(karmaGrid);

    // 4. Brücken - Premium Data Grid
    const bridgeList = document.getElementById('acc-bridge-list');
    if (!bridgeList) return;
    const bridgesGrid = document.createElement('div');
    bridgesGrid.className = 'data-grid compact';
    createDataCard(bridgesGrid, 'Seele-Persönlichkeit', data.bridges.soulPers, 1);
    createDataCard(bridgesGrid, 'Leben-Ausdruck', data.bridges.lifeExpr, 2);
    bridgeList.appendChild(bridgesGrid);
    
    const bridgeNote = document.createElement('p');
    bridgeNote.className = 'text-sm opacity-50 mt-16 text-center';
    bridgeNote.textContent = 'Brücken zeigen an, wie viel Aufwand nötig ist, um gegensätzliche Anteile zu harmonisieren (0 = Harmonie, 9 = hohe Spannung).';
    bridgeList.appendChild(bridgeNote);
  }
};

// Auto-Init
errorBoundary.init();
numerologyRender.init();
dom.initScrollReveal();
