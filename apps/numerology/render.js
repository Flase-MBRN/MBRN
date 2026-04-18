/**
 * /apps/numerology/render.js
 * Mustererkennung - klar, direkt und ohne Paywall.
 */

import { state } from '../../shared/core/state.js';
import { actions } from '../../shared/core/actions.js';
import { storage } from '../../shared/core/storage.js';
import { dom, animateValue, showTerminalLoader, createGlowRing, bindSmartDateInput } from '../../shared/ui/dom_utils.js';
import { nav } from '../../shared/ui/navigation.js';
import { renderNavigation } from '../../shared/ui/render_nav.js';
import { renderAuth } from '../../shared/ui/render_auth.js';
import { generateShareCard, generateOperatorReport } from '../../shared/core/logic/orchestrator.js';
import { renderShareCardToCanvas } from '../../shared/ui/helpers/canvas_renderer.js';
import { OPERATOR_MATRIX } from '../../shared/core/logic/numerology/index.js';
import { i18n } from '../../shared/core/i18n.js';
import { errorBoundary } from '../../shared/ui/error_boundary.js';

const STORAGE_KEY = 'numerology_input';

const NUMBER_MEANINGS = {
  1: 'Vorwärtsgang und erste Schritte.',
  2: 'Ruhe, Balance und Verbindung.',
  3: 'Sichtbarkeit und authentischer Ausdruck.',
  4: 'Struktur und langes Bauen.',
  5: 'Bewegung, Reize und Freiheit.',
  6: 'Verantwortung, Geben und Wärme.',
  7: 'Tiefe, Verstehen und Analyse.',
  8: 'Führung, Wirkung und Umsetzung.',
  9: 'Das große Ganze und Mitgefühl.',
  11: 'Tiefe Intuition und Feingefühl.',
  22: 'Erhabener Weitblick und Erschaffen.',
  33: 'Ruhige Führung und Menschlichkeit.'
};

function getPrimaryNumber(value) {
  const raw = Array.isArray(value) ? value[0] : String(value ?? '').split('/')[0];
  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function getNumberMeaning(value, fallback = 'Diese Zahl zeigt einen wichtigen Teil deines Musters.') {
  const primary = getPrimaryNumber(value);
  return NUMBER_MEANINGS[primary] || fallback;
}

function getLifeTheme(value) {
  const primary = getPrimaryNumber(value);
  return OPERATOR_MATRIX.pinnacles?.[primary]?.desc || getNumberMeaning(value);
}

function getChallengeMeaning(value) {
  const primary = getPrimaryNumber(value);
  if (primary === 0) {
    return 'Reibungsloser Fluss, aber Gefahr der Trägheit.';
  }
  return `Reibungsfläche: ${getNumberMeaning(value)}`;
}

function getBridgeMeaning(value) {
  const primary = getPrimaryNumber(value);
  if (primary === null) return 'Schnittstelle der Energien.';
  if (primary <= 2) return 'Fließt sehr leicht zusammen.';
  if (primary <= 5) return 'Braucht gelegentlich Aufmerksamkeit.';
  return 'Innere Spannung: Bewusste Arbeit nötig.';
}

function describeField(label, value) {
  switch (label) {
    case 'Lebenszahl': return `Dein Weg: ${getNumberMeaning(value)}`;
    case 'Seelenzahl': return `Dein Antrieb: ${getNumberMeaning(value)}`;
    case 'Persönlichkeit': return `Deine Wirkung: ${getNumberMeaning(value)}`;
    case 'Ausdruck': return `Dein Potenzial: ${getNumberMeaning(value)}`;
    case 'Reife': return `Dein Fundament: ${getNumberMeaning(value)}`;
    case 'Geburtstag': return `Dein frühes Talent: ${getNumberMeaning(value)}`;
    default: return getNumberMeaning(value);
  }
}

function downloadCanvas(canvas, filename) {
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = filename;
  link.click();
}

export const numerologyRender = {
  currentData: null,
  _unsubscribers: [],
  _listeners: [],
  _timers: [],
  _accordionContainerHandler: null,

  init() {
    actions.register('calculateFullProfile', async (payload) => {
      const { getUnifiedProfile } = await import('../../shared/core/logic/orchestrator.js');
      const res = await getUnifiedProfile(payload.name, payload.birthDate);
      if (res.success) {
        state.emit('numerologyDone', res);
      } else {
        state.emit('numerologyFailed', res);
      }
      return res;
    });

    const calcBtn = document.getElementById('num-calc-btn');
    if (calcBtn) {
      const clickHandler = async () => {
        const name = document.getElementById('num-input-name')?.value.trim();
        const date = document.getElementById('num-input-date')?.value.trim();

        if (!name || !date) {
          dom.setText('num-error', i18n.t('enterNameDate'));
          return;
        }

        calcBtn.disabled = true;
        calcBtn.textContent = i18n.t('loadingDecrypt');
        await showTerminalLoader('num-results-area', 1500);

        await storage.set(STORAGE_KEY, { name, birthDate: date });
        actions.dispatch('calculateFullProfile', { name, birthDate: date });

        calcBtn.textContent = 'Muster ansehen';
        calcBtn.disabled = false;
      };

      calcBtn.addEventListener('click', clickHandler);
      this._listeners.push({ element: calcBtn, type: 'click', handler: clickHandler });
    }

    const shareBtn = document.getElementById('num-share-btn');
    if (shareBtn) {
      const shareHandler = () => this.handleShare();
      shareBtn.addEventListener('click', shareHandler);
      this._listeners.push({ element: shareBtn, type: 'click', handler: shareHandler });
    }

    const pdfBtn = document.getElementById('num-pdf-btn');
    if (pdfBtn) {
      const pdfHandler = async () => {
        if (!this.currentData) return;

        pdfBtn.textContent = 'Wird erstellt...';
        pdfBtn.disabled = true;

        try {
          const legacyData = this.currentData.legacy?.full_profile || this.currentData;
          const doc = await generateOperatorReport(legacyData);
          doc.save(`MBRN_Muster_${legacyData.meta.name.replace(/\s+/g, '_')}.pdf`);
        } catch (err) {
          console.error('[Mustererkennung] PDF fehlgeschlagen:', err);
          errorBoundary.displayError({
            type: 'pdf_generation_failed',
            error: 'Die PDF konnte gerade nicht erstellt werden. Versuch es bitte nochmal.',
            severity: 'critical'
          });
        } finally {
          pdfBtn.textContent = 'PDF laden';
          pdfBtn.disabled = false;
        }
      };

      pdfBtn.addEventListener('click', pdfHandler);
      this._listeners.push({ element: pdfBtn, type: 'click', handler: pdfHandler });
    }

    this._unsubscribers.push(state.subscribe('numerologyDone', (res) => {
      this.currentData = res.data;
      this.showResultsPanel();
      this.renderAll(res.data.legacy.full_profile);
    }));

    this._unsubscribers.push(state.subscribe('numerologyFailed', (res) => {
      dom.setText('num-error', `Bitte prüf deine Eingaben. ${res.error}`);
    }));

    const stored = storage.get(STORAGE_KEY);
    if (stored.success && stored.data) {
      const { name, birthDate } = stored.data;
      const nameInput = document.getElementById('num-input-name');
      const dateInput = document.getElementById('num-input-date');
      if (nameInput) nameInput.value = name;
      if (dateInput) dateInput.value = birthDate;
      actions.dispatch('calculateFullProfile', { name, birthDate });
    }

    bindSmartDateInput('num-input-date');
    dom.initScrollReveal();
    renderNavigation('nav-menu');
    nav.bindNavigation();
    nav.registerCurrentApp(this);
    renderAuth.init();
  },

  destroy() {
    this._unsubscribers.forEach((unsub) => unsub && unsub());
    this._unsubscribers = [];

    this._listeners.forEach(({ element, type, handler }) => {
      element.removeEventListener(type, handler);
    });
    this._listeners = [];

    if (this._accordionContainerHandler) {
      this._accordionContainerHandler.element.removeEventListener('click', this._accordionContainerHandler.handler);
      this._accordionContainerHandler = null;
    }

    this._timers.forEach((id) => clearTimeout(id));
    this._timers = [];
  },

  showResultsPanel() {
    const panel = document.getElementById('num-results-area');
    if (panel) {
      panel.style.display = 'block';
      panel.classList.remove('hidden');
    }
    dom.setText('num-error', '');
    this.bindAccordionEvents();
  },

  bindAccordionEvents() {
    const accordionsContainer = document.getElementById('num-accordions');
    if (!accordionsContainer) return;

    if (this._accordionContainerHandler) {
      this._accordionContainerHandler.element.removeEventListener('click', this._accordionContainerHandler.handler);
    }

    const accordionHandler = (e) => {
      const btn = e.target.closest('.acc-trigger-full');
      if (!btn) return;

      const item = btn.closest('.glass-card');
      if (!item) return;

      const wasActive = item.classList.contains('active');
      accordionsContainer.querySelectorAll('.glass-card').forEach((card) => card.classList.remove('active'));
      if (!wasActive) item.classList.add('active');
    };

    accordionsContainer.addEventListener('click', accordionHandler);
    this._accordionContainerHandler = { element: accordionsContainer, handler: accordionHandler };
  },

  renderAll(data) {
    this.renderBalance(data.quantum);
    this.renderLoShu(data.loShu);
    this.renderAccordions(data);
  },

  renderBalance(balance) {
    const container = document.getElementById('num-balance-gauge');
    if (!container) return;

    const score = balance?.score || 0;
    dom.clear('num-balance-gauge');
    container.replaceChildren();

    const ringContainer = document.createElement('div');
    ringContainer.className = 'glow-ring pos-relative size-glow-ring mx-auto';

    const svg = createGlowRing(score, 200);
    ringContainer.appendChild(svg);

    const scoreText = document.createElement('div');
    scoreText.className = 'pos-center-absolute';

    const scoreValue = document.createElement('span');
    scoreValue.id = 'num-balance-score-value';
    scoreValue.className = 'value-massive text-size-hero-sm text-no-shadow';
    scoreValue.textContent = '0';
    scoreText.appendChild(scoreValue);

    const percentSpan = document.createElement('span');
    percentSpan.className = 'text-size-sm text-theme-accent';
    percentSpan.textContent = '%';
    scoreText.appendChild(percentSpan);
    ringContainer.appendChild(scoreText);

    container.appendChild(ringContainer);

    const scoreEl = document.getElementById('num-balance-score-value');
    if (scoreEl) {
      animateValue(scoreEl, 0, score, 1500);
    }

    const label = score >= 80 ? 'Du wirkst gerade klar und stimmig.' : score >= 45 ? 'Da ist schon viel in Bewegung.' : 'Hier darf noch mehr zusammenfinden.';
    dom.setText('num-balance-label', label);
  },

  handleShare() {
    if (!this.currentData) return;

    try {
      const legacyData = this.currentData.legacy?.full_profile || this.currentData;
      const cardData = generateShareCard(legacyData);
      const canvas = document.createElement('canvas');
      renderShareCardToCanvas(canvas, cardData);
      downloadCanvas(canvas, `MBRN_Muster_${legacyData.meta.name.replace(/\s+/g, '_')}.png`);
    } catch (error) {
      console.error('[Mustererkennung] Share fehlgeschlagen:', error);
      errorBoundary.displayError({
        type: 'share_generation_failed',
        error: 'Das Bild konnte gerade nicht gebaut werden. Versuch es bitte nochmal.',
        severity: 'critical'
      });
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

    layout.flat().forEach((num) => {
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

    const lines = loshu.activeLines.join(', ') || 'keine';
    dom.setText('num-loshu-lines', `Das Raster zeigt, was bei dir schon stark da ist und wo noch Luft nach oben ist. Aktive Linien: ${lines}.`);
  },

  renderAccordions(data) {
    const createDataCard = (container, label, value, description, delay = 0) => {
      const card = document.createElement('div');
      card.className = 'stagger-fade card-grid-item-sm';
      if (delay) card.setAttribute('data-delay', delay);

      const valueEl = document.createElement('span');
      valueEl.className = 'value-massive text-size-lg';
      valueEl.textContent = '0';

      const labelEl = document.createElement('span');
      labelEl.className = 'value-label';
      labelEl.textContent = label;

      const descEl = document.createElement('p');
      descEl.className = 'text-sm opacity-70 mt-8';
      descEl.textContent = description;

      card.appendChild(valueEl);
      card.appendChild(labelEl);
      card.appendChild(descEl);
      container.appendChild(card);

      const numValue = Number.parseInt(value, 10);
      if (!Number.isNaN(numValue)) {
        animateValue(valueEl, 0, numValue, 1500);
      } else {
        valueEl.textContent = String(value);
      }

      const timerId = setTimeout(() => card.classList.add('visible'), delay * 100);
      this._timers.push(timerId);
    };

    const createSectionHeader = (container, text) => {
      const header = document.createElement('div');
      header.className = 'section-header-label';
      header.textContent = text;
      container.appendChild(header);
    };

    const coreList = document.getElementById('acc-core-list');
    coreList.replaceChildren();
    coreList.className = 'data-grid compact';
    createDataCard(coreList, 'Lebenszahl', data.core.lifePath, describeField('Lebenszahl', data.core.lifePath), 1);
    createDataCard(coreList, 'Seelenzahl', data.core.soulUrge, describeField('Seelenzahl', data.core.soulUrge), 2);
    createDataCard(coreList, 'Persönlichkeit', data.core.personality, describeField('Persönlichkeit', data.core.personality), 3);
    createDataCard(coreList, 'Ausdruck', data.core.expression, describeField('Ausdruck', data.core.expression), 4);
    createDataCard(coreList, 'Reife', data.additional.maturity, describeField('Reife', data.additional.maturity), 5);
    createDataCard(coreList, 'Geburtstag', data.additional.birthday, describeField('Geburtstag', data.additional.birthday), 6);

    const phasesList = document.getElementById('acc-phases-list');
    if (!phasesList) return;
    phasesList.replaceChildren();
    createSectionHeader(phasesList, 'Lebenszyklen');
    const cyclesGrid = document.createElement('div');
    cyclesGrid.className = 'data-grid compact';
    createDataCard(cyclesGrid, 'Früher Zyklus', data.cycles.c1, `Fokus in jungen Jahren: ${getLifeTheme(data.cycles.c1)}`, 1);
    createDataCard(cyclesGrid, 'Mittlerer Zyklus', data.cycles.c2, `Fokus der Hauptphase: ${getLifeTheme(data.cycles.c2)}`, 2);
    createDataCard(cyclesGrid, 'Später Zyklus', data.cycles.c3, `Fokus im späteren Leben: ${getLifeTheme(data.cycles.c3)}`, 3);
    phasesList.appendChild(cyclesGrid);

    createSectionHeader(phasesList, 'Meilensteine');
    const pinnaclesGrid = document.createElement('div');
    pinnaclesGrid.className = 'data-grid compact';
    createDataCard(pinnaclesGrid, 'Phase 1', data.pinnacles.p1, getLifeTheme(data.pinnacles.p1), 4);
    createDataCard(pinnaclesGrid, 'Phase 2', data.pinnacles.p2, getLifeTheme(data.pinnacles.p2), 5);
    createDataCard(pinnaclesGrid, 'Phase 3', data.pinnacles.p3, getLifeTheme(data.pinnacles.p3), 6);
    createDataCard(pinnaclesGrid, 'Phase 4', data.pinnacles.p4, getLifeTheme(data.pinnacles.p4), 7);
    phasesList.appendChild(pinnaclesGrid);

    const karmaList = document.getElementById('acc-karma-list');
    karmaList.replaceChildren();
    createSectionHeader(karmaList, 'Herausforderungen');
    const challengesGrid = document.createElement('div');
    challengesGrid.className = 'data-grid compact';
    createDataCard(challengesGrid, 'Herausforderung 1', data.challenges.ch1, getChallengeMeaning(data.challenges.ch1), 1);
    createDataCard(challengesGrid, 'Herausforderung 2', data.challenges.ch2, getChallengeMeaning(data.challenges.ch2), 2);
    createDataCard(challengesGrid, 'Kernaufgabe', data.challenges.ch3, getChallengeMeaning(data.challenges.ch3), 3);
    createDataCard(challengesGrid, 'Spannungsfeld', data.challenges.ch4, getChallengeMeaning(data.challenges.ch4), 4);
    karmaList.appendChild(challengesGrid);

    createSectionHeader(karmaList, 'Lernfelder');
    const karmaGrid = document.createElement('div');
    karmaGrid.className = 'data-grid compact';
    createDataCard(karmaGrid, 'Lektionen', data.karma.lessons.join(', ') || 'Keine', 'Hier darfst du im Leben noch nachreifen.', 5);
    createDataCard(karmaGrid, 'Starker Zug', data.karma.passion.join(', ') || '-', 'Dieser innere Reiz treibt dich fast automatisch an.', 6);
    karmaList.appendChild(karmaGrid);

    const bridgeList = document.getElementById('acc-bridge-list');
    if (!bridgeList) return;
    bridgeList.replaceChildren();
    const bridgesGrid = document.createElement('div');
    bridgesGrid.className = 'data-grid compact';
    createDataCard(bridgesGrid, 'Seele und Auftreten', data.bridges.soulPers, getBridgeMeaning(data.bridges.soulPers), 1);
    createDataCard(bridgesGrid, 'Leben und Ausdruck', data.bridges.lifeExpr, getBridgeMeaning(data.bridges.lifeExpr), 2);
    bridgeList.appendChild(bridgesGrid);

    const bridgeNote = document.createElement('p');
    bridgeNote.className = 'text-sm opacity-50 mt-16 text-center';
    bridgeNote.textContent = 'Brücken zeigen, wie leicht zwei Seiten in dir zusammenarbeiten. Kleine Zahlen laufen leichter, hohe Zahlen brauchen bewusste Arbeit.';
    bridgeList.appendChild(bridgeNote);
  }
};

numerologyRender.init();
