/**
 * /apps/numerology/render.js
 * FULL SCALE RENDERING — v2.0
 */

import { state }  from '../../shared/core/state.js';
import { actions } from '../../shared/core/actions.js';
import { dom }    from '../../shared/ui/dom_utils.js';
import { nav }    from '../../shared/ui/navigation.js';
import { renderAuth } from '../../shared/ui/render_auth.js';
import { calculateFullProfile, generateShareCard, generateDeepReport, generateOperatorReport } from './logic.js';

export const numerologyRender = {
  currentData: null,

  init() {
    // 1. Action Registration
    actions.register('calculateNumerology', (payload) => {
      const res = calculateFullProfile(payload.name, payload.date);
      if (res.success) {
        this.currentData = res.data;
        state.emit('numerologyDone', res);
      } else {
        state.emit('numerologyFailed', res);
      }
      return res;
    });

    // 2. Event Binding
    const calcBtn = document.getElementById('num-calc-btn');
    if (calcBtn) {
      calcBtn.addEventListener('click', () => {
        const name = document.getElementById('num-input-name').value.trim();
        const date = document.getElementById('num-input-date').value.trim();
        actions.dispatch('calculateNumerology', { name, date });
      });
    }

    const shareBtn = document.getElementById('num-share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        state.emit('analyticsTrack', { event: 'share_card_generated', source: 'numerology' });
        this.handleShare();
      });
    }

    const bridgeBtn = document.getElementById('num-bridge-btn');
    if (bridgeBtn) {
      bridgeBtn.addEventListener('click', () => {
        state.emit('analyticsTrack', { event: 'lead_bridge_crossed', source: 'numerology' });
        nav.navigateTo('finance');
      });
    }

    // Phase 19.3: Premium PDF Export Trigger
    const pdfBtn = document.getElementById('num-pdf-btn');
    if (pdfBtn) {
      pdfBtn.addEventListener('click', async () => {
        const user = state.get('user');
        const accessLevel = user ? (user.access_level || 0) : 0;

        // DEBUG OVERRIDE: Ermöglicht den Test des PDFs ohne Level 10
        const isLocalTest = true; // Setze auf false für Produktion

        if (accessLevel < 10 && !isLocalTest) {
          state.emit('paywallRequested', { feature: 'Deep Decode Artefakt' });
          return;
        }

        if (!this.currentData) return;

        pdfBtn.textContent = 'DECRYPTING...';
        pdfBtn.disabled = true;

        try {
          const doc = await generateOperatorReport(this.currentData);
          doc.save(`MBRN_CONFIG_${this.currentData.meta.name.replace(/\s+/g, '_')}.pdf`);
          state.emit('analyticsTrack', { event: 'pdf_artifact_generated', source: 'numerology' });
        } catch (err) {
          console.error('[PDF Engine] Generation failed:', err);
          alert('Fehler bei der PDF-Erstellung.');
        } finally {
          pdfBtn.textContent = 'ARTEFAKT ERSTELLEN';
          pdfBtn.disabled = false;
        }
      });
    }

    // Accordion Toggles
    document.querySelectorAll('.acc-trigger').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.parentElement;
        const wasActive = item.classList.contains('active');
        // Close others
        document.querySelectorAll('.acc-item').forEach(i => i.classList.remove('active'));
        if (!wasActive) item.classList.add('active');
      });
    });

    // 3. State Subscriptions
    state.subscribe('numerologyDone', (res) => {
      this.showResultsPanel();
      this.renderAll(res.data);
    });

    state.subscribe('numerologyFailed', (res) => {
      dom.setText('num-error', `⚠️ ${res.error}`);
    });

    // Phase 18.4: Paywall Event Renderer (Synchronized across Hub)
    state.subscribe('paywallRequested', (payload) => {
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
    });

    // 4. Boot System
    console.log('[Numerology Render] Initializing...');
    actions.initSystem();
    nav.bindNavigation();
    renderAuth.init();
  },

  showResultsPanel() {
    const panel = document.getElementById('num-results-area');
    if (panel) panel.style.display = 'block';
    dom.setText('num-error', '');
  },

  renderAll(data) {
    this.renderQuantum(data.quantum);
    this.renderLoShu(data.loShu);
    this.renderAccordions(data);
  },

  renderQuantum(quantum) {
    const container = document.getElementById('num-quantum-gauge');
    if (!container) return;

    // Phase 16.1: Premium SVG Gauge
    const score = quantum.score;
    // Rotation mapping: 0% -> -90deg, 100% -> 90deg (arc is 180deg)
    const rotation = -90 + (1.8 * score); 

    container.innerHTML = `
      <svg viewBox="0 0 200 120" style="width: 100%; height: auto;">
        <!-- Background Track (Arc) -->
        <path d="M20,100 A80,80 0 0,1 180,100" fill="none" stroke="#333" stroke-width="12" stroke-linecap="round"/>
        <!-- Active Track (Dynamic Arc) -->
        <path d="M20,100 A80,80 0 0,1 180,100" fill="none" stroke="#D3D3D3" stroke-width="12" stroke-linecap="round" 
              stroke-dasharray="${(Math.PI * 80) * (score / 100)} 1000" style="transition: stroke-dasharray 1.5s ease-out;"/>
        <!-- Needle -->
        <g transform="translate(100, 100)">
          <line x1="0" y1="0" x2="0" y2="-75" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"
                style="transform: rotate(${rotation}deg); transition: transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1); transform-origin: center;"/>
          <circle cx="0" cy="0" r="8" fill="#FFFFFF"/>
        </g>
      </svg>
    `;

    dom.setText('num-quantum-score', `${score}%`);
    dom.setText('num-quantum-label', quantum.interpretation);
  },

  handleShare() {
    if (!this.currentData) return;
    
    // Phase 16.2: Viral Share Card Generation
    const canvas = generateShareCard(this.currentData);
    const link = document.getElementById('num-download-link');
    if (link) {
      link.href = canvas.toDataURL('image/png');
      link.download = `MBRN_Share_${this.currentData.meta.name.replace(/\s+/g, '_')}.png`;
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
    // ARCHITECTURE EXEMPTION: innerHTML used here to render computed numbers
    // from logic.js (pure functions, zero user input). XSS risk = 0.
    // A full DOM-builder refactor is deferred to Phase 3.0.
    const createRow = (label, val) => `
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 4px;">
        <span style="opacity: 0.7; font-size: 14px;">${label}</span>
        <strong class="text-accent">${val}</strong>
      </div>`;

    // 1. Kernzahlen
    const coreHtml = `
      ${createRow('Lebenszahl', data.core.lifePath)}
      ${createRow('Seelenzahl', data.core.soulUrge)}
      ${createRow('Persönlichkeit', data.core.personality)}
      ${createRow('Ausdruckszahl', data.core.expression)}
      ${createRow('Reifezahl', data.additional.maturity)}
      ${createRow('Geburtstag', data.additional.birthday)}
    `;
    document.getElementById('acc-core-list').innerHTML = coreHtml;

    // 2. Phasen
    const phaseHtml = `
      <div style="margin-bottom: 8px; font-weight: bold; font-size: 12px; color: var(--accent-color);">LEBENSZYKLEN</div>
      ${createRow('Früher Zyklus', data.cycles.c1)}
      ${createRow('Mittlerer Zyklus', data.cycles.c2)}
      ${createRow('Später Zyklus', data.cycles.c3)}
      <div style="margin: 16px 0 8px 0; font-weight: bold; font-size: 12px; color: var(--accent-color);">HÖHEPUNKTE (PINNACLES)</div>
      ${createRow('Pinnacle 1', data.pinnacles.p1)}
      ${createRow('Pinnacle 2', data.pinnacles.p2)}
      ${createRow('Pinnacle 3', data.pinnacles.p3)}
      ${createRow('Pinnacle 4', data.pinnacles.p4)}
    `;
    document.getElementById('acc-phases-list').innerHTML = phaseHtml;

    // 3. Karma
    const karmaHtml = `
      <div style="margin-bottom: 8px; font-weight: bold; font-size: 12px; color: var(--accent-color);">HERAUSFORDERUNGEN</div>
      ${createRow('Challenge 1', data.challenges.ch1)}
      ${createRow('Challenge 2', data.challenges.ch2)}
      ${createRow('Haupt-Challenge', data.challenges.ch3)}
      ${createRow('Gespannte Challenge', data.challenges.ch4)}
      <div style="margin: 16px 0 8px 0; font-weight: bold; font-size: 12px; color: var(--accent-color);">KARMA</div>
      ${createRow('Karmische Lektionen', data.karma.lessons.join(', ') || 'Keine')}
      ${createRow('Verborgene Passion', data.karma.passion.join(', '))}
    `;
    document.getElementById('acc-karma-list').innerHTML = karmaHtml;

    // 4. Brücken
    const bridgeHtml = `
      ${createRow('Brücke Seele-Persönlichkeit', data.bridges.soulPers)}
      ${createRow('Brücke Leben-Ausdruck', data.bridges.lifeExpr)}
      <p style="font-size: 11px; opacity: 0.5; margin-top: 10px;">Brücken zeigen an, wie viel Aufwand nötig ist, um gegensätzliche Anteile zu harmonisieren (0 = Harmonie, 9 = hohe Spannung).</p>
    `;
    document.getElementById('acc-bridge-list').innerHTML = bridgeHtml;
  }
};

// Auto-Init
numerologyRender.init();
