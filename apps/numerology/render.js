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
import { MBRN_CONFIG } from '../../shared/core/config.js';

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

        // DEV BYPASS (Phase 4.0): PDF ohne Stripe generieren
        if (accessLevel < 10 && !MBRN_CONFIG.dev.bypassPayment) {
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

    // Gesetz 3 Compliance: DOM API statt innerHTML
    const score = quantum.score;
    const rotation = -90 + (1.8 * score);
    const arcLength = (Math.PI * 80) * (score / 100);

    // Clear container
    container.replaceChildren();

    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 200 120');
    svg.classList.add('svg-responsive');

    // Background Track
    const track = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    track.setAttribute('d', 'M20,100 A80,80 0 0,1 180,100');
    track.setAttribute('fill', 'none');
    track.setAttribute('stroke', '#333');
    track.setAttribute('stroke-width', '12');
    track.setAttribute('stroke-linecap', 'round');
    svg.appendChild(track);

    // Active Track
    const activeTrack = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    activeTrack.setAttribute('d', 'M20,100 A80,80 0 0,1 180,100');
    activeTrack.setAttribute('fill', 'none');
    activeTrack.setAttribute('stroke', '#D3D3D3');
    activeTrack.setAttribute('stroke-width', '12');
    activeTrack.setAttribute('stroke-linecap', 'round');
    activeTrack.setAttribute('stroke-dasharray', `${arcLength} 1000`);
    activeTrack.classList.add('stroke-transition');
    svg.appendChild(activeTrack);

    // Needle Group
    const needleGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    needleGroup.setAttribute('transform', 'translate(100, 100)');

    // Needle Line
    const needle = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    needle.setAttribute('x1', '0');
    needle.setAttribute('y1', '0');
    needle.setAttribute('x2', '0');
    needle.setAttribute('y2', '-75');
    needle.setAttribute('stroke', '#FFFFFF');
    needle.setAttribute('stroke-width', '3');
    needle.setAttribute('stroke-linecap', 'round');
    needle.style.transform = `rotate(${rotation}deg)`;
    needle.classList.add('needle-rotate');
    needleGroup.appendChild(needle);

    // Center Circle
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '0');
    circle.setAttribute('cy', '0');
    circle.setAttribute('r', '8');
    circle.setAttribute('fill', '#FFFFFF');
    needleGroup.appendChild(circle);

    svg.appendChild(needleGroup);
    container.appendChild(svg);

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
    // Gesetz 3 Compliance: DOM API statt innerHTML
    const createRow = (container, label, val) => {
      const row = document.createElement('div');
      row.className = 'flex-between mb-16 pb-4';
      row.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
      
      const labelSpan = document.createElement('span');
      labelSpan.className = 'opacity-70 text-base';
      labelSpan.textContent = label;
      
      const valStrong = document.createElement('strong');
      valStrong.className = 'text-accent';
      valStrong.textContent = val;
      
      row.appendChild(labelSpan);
      row.appendChild(valStrong);
      container.appendChild(row);
    };

    const createSectionHeader = (container, text) => {
      const header = document.createElement('div');
      header.className = 'font-bold text-xs text-accent mb-8';
      header.textContent = text;
      container.appendChild(header);
    };

    // 1. Kernzahlen
    const coreList = document.getElementById('acc-core-list');
    coreList.replaceChildren();
    createRow(coreList, 'Lebenszahl', data.core.lifePath);
    createRow(coreList, 'Seelenzahl', data.core.soulUrge);
    createRow(coreList, 'Persönlichkeit', data.core.personality);
    createRow(coreList, 'Ausdruckszahl', data.core.expression);
    createRow(coreList, 'Reifezahl', data.additional.maturity);
    createRow(coreList, 'Geburtstag', data.additional.birthday);

    // 2. Phasen
    const phasesList = document.getElementById('acc-phases-list');
    phasesList.replaceChildren();
    createSectionHeader(phasesList, 'LEBENSZYKLEN');
    createRow(phasesList, 'Früher Zyklus', data.cycles.c1);
    createRow(phasesList, 'Mittlerer Zyklus', data.cycles.c2);
    createRow(phasesList, 'Später Zyklus', data.cycles.c3);
    createSectionHeader(phasesList, 'HÖHEPUNKTE (PINNACLES)');
    createRow(phasesList, 'Pinnacle 1', data.pinnacles.p1);
    createRow(phasesList, 'Pinnacle 2', data.pinnacles.p2);
    createRow(phasesList, 'Pinnacle 3', data.pinnacles.p3);
    createRow(phasesList, 'Pinnacle 4', data.pinnacles.p4);

    // 3. Karma
    const karmaList = document.getElementById('acc-karma-list');
    karmaList.replaceChildren();
    createSectionHeader(karmaList, 'HERAUSFORDERUNGEN');
    createRow(karmaList, 'Challenge 1', data.challenges.ch1);
    createRow(karmaList, 'Challenge 2', data.challenges.ch2);
    createRow(karmaList, 'Haupt-Challenge', data.challenges.ch3);
    createRow(karmaList, 'Gespannte Challenge', data.challenges.ch4);
    createSectionHeader(karmaList, 'KARMA');
    createRow(karmaList, 'Karmische Lektionen', data.karma.lessons.join(', ') || 'Keine');
    createRow(karmaList, 'Verborgene Passion', data.karma.passion.join(', '));

    // 4. Brücken
    const bridgeList = document.getElementById('acc-bridge-list');
    bridgeList.replaceChildren();
    createRow(bridgeList, 'Brücke Seele-Persönlichkeit', data.bridges.soulPers);
    createRow(bridgeList, 'Brücke Leben-Ausdruck', data.bridges.lifeExpr);
    
    const bridgeNote = document.createElement('p');
    bridgeNote.className = 'text-sm opacity-50 mt-16';
    bridgeNote.textContent = 'Brücken zeigen an, wie viel Aufwand nötig ist, um gegensätzliche Anteile zu harmonisieren (0 = Harmonie, 9 = hohe Spannung).';
    bridgeList.appendChild(bridgeNote);
  }
};

// Auto-Init
numerologyRender.init();
