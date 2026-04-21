/**
 * /apps/numerology/render.js
 * Mustererkennung - klar, direkt und ohne Paywall.
 */

import { actions } from '../../../shared/application/actions.js';
import {
  describeNumerologyField,
  getBridgeMeaning,
  getChallengeMeaning,
  getNumerologyUiText,
  getPhaseDescription,
  loadStoredNumerologyInput,
  registerNumerologyActions,
  resolveLegacyNumerologyProfile,
  saveStoredNumerologyInput,
  subscribeNumerologySurface
} from '../../../shared/application/frontend_os/numerology_runtime.js';
import { dom, animateValue, showTerminalLoader, createGlowRing, bindSmartDateInput } from '../../../shared/ui/dom_utils.js';
import { getRepoRoot, nav, renderNavigation } from '../navigation/index.js';
import { renderAuth } from '../ui_states/auth_controller.js';
import { errorBoundary } from '../../../shared/ui/base_components/error_boundary.js';
import { injectLegalBlock } from '../shell/legal_blocks.js';
import { exportNumerologyShareCard } from '../export_entrypoints/share_export_entry.js';
import { exportNumerologyTeaserAsset } from '../export_entrypoints/asset_export_entry.js';
import { exportNumerologyPdf } from '../export_entrypoints/pdf_export_entry.js';

const STORAGE_KEY = 'numerology_input';

export const numerologyRender = {
  currentData: null,
  _unsubscribers: [],
  _listeners: [],
  _timers: [],
  _accordionContainerHandler: null,

  init() {
    registerNumerologyActions(actions);

    const calcBtn = document.getElementById('num-calc-btn');
    if (calcBtn) {
      const clickHandler = async () => {
        const name = document.getElementById('num-input-name')?.value.trim();
        const date = document.getElementById('num-input-date')?.value.trim();

        if (!name || !date) {
          dom.setText('num-error', getNumerologyUiText('enterNameDate'));
          return;
        }

        calcBtn.disabled = true;
        calcBtn.textContent = getNumerologyUiText('loadingDecrypt');
        await showTerminalLoader('num-results-area', 1500);

        await saveStoredNumerologyInput(STORAGE_KEY, { name, birthDate: date });
        actions.dispatch('calculateFullProfile', { name, birthDate: date });

        calcBtn.textContent = 'Muster ansehen';
        calcBtn.disabled = false;
      };

      calcBtn.addEventListener('click', clickHandler);
      this._listeners.push({ element: calcBtn, type: 'click', handler: clickHandler });
    }

    const shareBtn = document.getElementById('num-share-btn');
    if (shareBtn) {
      const shareHandler = () => {
        void this.handleShare();
      };
      shareBtn.addEventListener('click', shareHandler);
      this._listeners.push({ element: shareBtn, type: 'click', handler: shareHandler });
    }

    const teaserBtn = document.getElementById('num-teaser-btn');
    if (teaserBtn) {
      const teaserHandler = () => {
        void this.handleTeaserShare();
      };
      teaserBtn.addEventListener('click', teaserHandler);
      this._listeners.push({ element: teaserBtn, type: 'click', handler: teaserHandler });
    }

    const pdfBtn = document.getElementById('num-pdf-btn');
    if (pdfBtn) {
      const pdfHandler = async () => {
        if (!this.currentData) return;

        pdfBtn.textContent = 'Wird erstellt...';
        pdfBtn.disabled = true;

        try {
          await exportNumerologyPdf(this.currentData);
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

    this._unsubscribers.push(
      subscribeNumerologySurface({
        onNumerologyDone: (res) => {
          this.currentData = res.data;
          this.showResultsPanel();
          this.renderAll(resolveLegacyNumerologyProfile(res.data));
        },
        onNumerologyFailed: (res) => {
          dom.setText('num-error', `Bitte pruef deine Eingaben. ${res.error}`);
        }
      })
    );

    const stored = loadStoredNumerologyInput(STORAGE_KEY);
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
    this.renderLegalSurfaces();
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
    this.renderLegalSurfaces();
  },

  renderLegalSurfaces() {
    const basePath = getRepoRoot();
    injectLegalBlock('num-form-legal', {
      variant: 'data',
      basePath,
      includePolicyLinks: true,
      compactLinks: true
    });
    injectLegalBlock('num-results-legal', {
      variant: 'numerology',
      basePath,
      includePolicyLinks: true,
      compactLinks: true
    });
    injectLegalBlock('num-share-legal', {
      variant: 'export_privacy',
      basePath,
      compactLinks: true
    });
    injectLegalBlock('num-pdf-legal', {
      variant: 'export_privacy',
      basePath,
      compactLinks: true
    });
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

    const label = score <= 30
      ? 'Extremer Fokus. Du besitzt hochspezialisierte Staerken.'
      : score <= 60
        ? 'Dynamisches Muster. Ein starker Mix aus klarem Fokus und Vielseitigkeit.'
        : score <= 80
          ? 'Ausgeglichene Struktur. Deine Zahlen greifen nahtlos ineinander.'
          : 'Hohe Balance. Maximale Harmonie ueber alle Bereiche.';
    dom.setText('num-balance-label', label);

    const parentCard = container.closest('.glass-card');
    if (!parentCard) return;

    let infoEl = document.getElementById('num-balance-info');
    if (!infoEl) {
      infoEl = document.createElement('p');
      infoEl.id = 'num-balance-info';
      infoEl.className = 'text-sm opacity-70 mt-16';
      const labelEl = document.getElementById('num-balance-label');
      if (labelEl?.parentNode) {
        labelEl.parentNode.insertBefore(infoEl, labelEl.nextSibling);
      } else {
        parentCard.appendChild(infoEl);
      }
    }

    infoEl.textContent =
      "Dieser Wert zeigt, wie sich deine Eigenschaften im Modell verteilen. Wichtig: Es gibt kein 'Besser' oder 'Schlechter'. Ein hoher Wert steht fuer eine breite Balance, ein niedriger Wert eher fuer staerkere Spezialisierung.";
  },

  async handleTeaserShare() {
    if (!this.currentData) return;

    try {
      await exportNumerologyTeaserAsset(this.currentData);
    } catch (error) {
      if (error?.name === 'AbortError') {
        return;
      }

      console.error('[Mustererkennung] Story-Teaser fehlgeschlagen:', error);
      errorBoundary.displayError({
        type: 'teaser_generation_failed',
        error: 'Der Story-Teaser konnte gerade nicht gebaut werden. Versuch es bitte nochmal.',
        severity: 'critical'
      });
    }
  },

  async handleShare() {
    if (!this.currentData) return;

    try {
      await exportNumerologyShareCard(this.currentData);
    } catch (error) {
      if (error?.name === 'AbortError') {
        return;
      }

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
    dom.setText(
      'num-loshu-lines',
      `Dein persoenliches Raster im Modell. Lila hervorgehobene Zahlen markieren deutliche Schwerpunkte. Wenn drei Zahlen eine horizontale, vertikale oder diagonale Linie bilden, zeigt das eine aktive Linie als Hinweis auf ein markantes Thema in diesem Bereich. Aktive Linien: ${lines}.`
    );
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

      if (description && typeof description === 'object' && description.prefix) {
        const prefixEl = document.createElement('span');
        prefixEl.className = 'card-desc-prefix';
        prefixEl.textContent = `${description.prefix}:`;
        const bodyEl = document.createElement('span');
        bodyEl.className = 'card-desc-body';
        bodyEl.textContent = description.body || '';
        descEl.appendChild(prefixEl);
        descEl.appendChild(bodyEl);
      } else {
        descEl.textContent = String(description || '');
      }

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
    createDataCard(coreList, 'Lebenszahl', data.core.lifePath, describeNumerologyField('Lebenszahl', data.core.lifePath), 1);
    createDataCard(coreList, 'Seelenzahl', data.core.soulUrge, describeNumerologyField('Seelenzahl', data.core.soulUrge), 2);
    createDataCard(coreList, 'Persoenlichkeit', data.core.personality, describeNumerologyField('Persoenlichkeit', data.core.personality), 3);
    createDataCard(coreList, 'Ausdruck', data.core.expression, describeNumerologyField('Ausdruck', data.core.expression), 4);
    createDataCard(coreList, 'Reife', data.additional.maturity, describeNumerologyField('Reife', data.additional.maturity), 5);
    createDataCard(coreList, 'Geburtstag', data.additional.birthday, describeNumerologyField('Geburtstag', data.additional.birthday), 6);

    const phasesList = document.getElementById('acc-phases-list');
    if (!phasesList) return;
    phasesList.replaceChildren();
    createSectionHeader(phasesList, 'Lebenszyklen');
    const cyclesGrid = document.createElement('div');
    cyclesGrid.className = 'data-grid compact';
    createDataCard(cyclesGrid, 'Frueher Zyklus', data.cycles.c1, getPhaseDescription(data.cycles.c1), 1);
    createDataCard(cyclesGrid, 'Mittlerer Zyklus', data.cycles.c2, getPhaseDescription(data.cycles.c2), 2);
    createDataCard(cyclesGrid, 'Spaeter Zyklus', data.cycles.c3, getPhaseDescription(data.cycles.c3), 3);
    phasesList.appendChild(cyclesGrid);

    createSectionHeader(phasesList, 'Meilensteine');
    const pinnaclesGrid = document.createElement('div');
    pinnaclesGrid.className = 'data-grid compact';
    createDataCard(pinnaclesGrid, 'Phase 1', data.pinnacles.p1, getPhaseDescription(data.pinnacles.p1), 4);
    createDataCard(pinnaclesGrid, 'Phase 2', data.pinnacles.p2, getPhaseDescription(data.pinnacles.p2), 5);
    createDataCard(pinnaclesGrid, 'Phase 3', data.pinnacles.p3, getPhaseDescription(data.pinnacles.p3), 6);
    createDataCard(pinnaclesGrid, 'Phase 4', data.pinnacles.p4, getPhaseDescription(data.pinnacles.p4), 7);
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
    createDataCard(
      karmaGrid,
      'Lektionen',
      data.karma.lessons.join(', ') || 'Keine',
      'Ein moegliches Lernfeld im Modell. Hier kann sich ein relevanter Entwicklungshebel zeigen.',
      5
    );
    createDataCard(
      karmaGrid,
      'Starker Zug',
      data.karma.passion.join(', ') || '-',
      'Ein wiederkehrender innerer Antrieb im Modell. Diese Energie kann Entscheidungen im Hintergrund mitpraegen.',
      6
    );
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
    bridgeNote.textContent = 'Verbindungen zeigen die Synergie zwischen deinen Zahlen im Modell. Werte nahe 0 wirken meist leichter verbunden, hoehere Werte deuten eher auf Spannung und bewussten Entwicklungsbedarf hin.';
    bridgeList.appendChild(bridgeNote);
  }
};

numerologyRender.init();
