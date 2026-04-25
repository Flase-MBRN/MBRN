/**
 * /apps/chronos/render.js
 * Zeit-Seite für Phasen und 7-Jahres-Zyklen.
 */

import { actions } from '../../../shared/application/actions.js';
import {
  calculateChronosProfile,
  clearChronosBirthdate,
  loadChronosBirthdate,
  registerChronosActions,
  saveChronosBirthdate,
  readChronosAccessState,
  subscribeChronosAccess
} from '../../../shared/application/frontend_os/chronos_runtime.js';
import { dom, animateValue, showTerminalLoader, bindSmartDateInput } from '../../../shared/ui/dom_utils.js';
import { getRepoRoot, nav, renderNavigation } from '../navigation/index.js';
import { renderAuth } from '../ui_states/auth_controller.js';
import { injectLegalBlock } from '../shell/legal_blocks.js';

const FOCUS_EXPLANATIONS = {
  1: 'Das Modell liest diese Phase oft als Startpunkt. Initiative, Richtung und mutige Entscheidungen rücken stärker nach vorn.',
  2: 'Das Modell betont in dieser Phase Feingefuehl, Verbindungen und ruhiges Timing.',
  3: 'Das Modell ordnet diese Phase häufig Expansion und Sichtbarkeit zu. Strukturen, die jetzt entstehen, können später tragen.',
  4: 'Das Modell rückt hier Fundament, Routinen und sauberen Aufbau in den Vordergrund.',
  5: 'Das Modell verbindet diese Phase oft mit Bewegung, Flexibilitaet und schnellen Anpassungen.',
  6: 'Das Modell markiert in dieser Phase Verantwortung, Stabilität und klare Prioritäten.',
  7: 'Das Modell betont jetzt Analyse, Tiefgang und bewusstes Sortieren.',
  8: 'Das Modell ordnet diese Phase häufig Umsetzung, Entscheidungskraft und sichtbare Wirkung zu.',
  9: 'Das Modell verbindet diese Phase oft mit Abschluss, Reset und dem Schaffen von Raum für Neues.'
};

function getFocusNumber(data) {
  const personalYear = Number.parseInt(data?.personalYear, 10);
  if (Number.isFinite(personalYear) && personalYear > 0) {
    return personalYear;
  }
  return Number.parseInt(data?.currentPhase, 10) || 1;
}

function getFocusNarrative(focusNumber, topic) {
  if (FOCUS_EXPLANATIONS[focusNumber]) {
    return FOCUS_EXPLANATIONS[focusNumber];
  }
  const safeTopic = topic || 'dein aktuelles Thema';
  return `Das Modell verbindet diese Phase mit ${safeTopic}. Nutze den Zeitraum bewusst, um deinen nächsten Schritt klar einzuordnen.`;
}

function calculateDaysInCurrentPhase(data) {
  if (!data?.birthdateUTC || !Number.isFinite(data?.currentPhase)) {
    return data?.livedDays || 0;
  }

  const birthDate = new Date(data.birthdateUTC);
  if (Number.isNaN(birthDate.getTime())) {
    return data?.livedDays || 0;
  }

  const phaseOffsetYears = Math.max(0, (Number(data.currentPhase) - 1) * 7);
  const phaseStart = new Date(Date.UTC(
    birthDate.getUTCFullYear() + phaseOffsetYears,
    birthDate.getUTCMonth(),
    birthDate.getUTCDate()
  ));
  const todayUtc = new Date(Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate()
  ));

  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.floor((todayUtc.getTime() - phaseStart.getTime()) / msPerDay));
}

export const chronosRender = {
  _unsubscribers: [],
  _listeners: [],
  _timers: [],

  async init() {
    registerChronosActions(actions);

    this._unsubscribers.push(subscribeChronosAccess(() => this.renderSurfaceState()));

    renderNavigation('nav-menu');
    nav.bindNavigation();
    nav.registerCurrentApp(this);
    await actions.initSystem();
    await renderAuth.init();

    this.renderSurfaceState();
    this.initScrollReveal();
  },

  resolveAccessGate() {
    return readChronosAccessState();
  },

  renderSurfaceState() {
    const { user } = this.resolveAccessGate();
    // Architectural Override: Access is always granted.
    this.autoRenderLifeCycles();
  },

  renderLockedState(user, gate) {
    const container = document.getElementById('chrono-content-area');
    if (!container) return;

    dom.clear(container.id);

    const card = dom.createEl('div', {
      className: 'glass-card text-center',
      parent: container
    });

    dom.createEl('h3', {
      className: 'section-eyebrow',
      text: 'Interne Freischaltung',
      parent: card
    });

    dom.createEl('p', {
      className: 'text-secondary mb-16',
      text: !user
        ? 'Chronos ist intern abgesichert. Bitte melde dich mit einem internen Konto an.'
        : 'Chronos ist für dieses Konto noch nicht freigeschaltet. Die Freischaltung erfolgt intern über Profilstatus und plan_id.',
      parent: card
    });

    dom.createEl('p', {
      className: 'text-sm opacity-70',
      text: `Status: ${gate.reason}.`,
      parent: card
    });

    const legalMount = dom.createEl('div', {
      id: 'chronos-locked-legal',
      className: 'mt-24',
      parent: card
    });
    injectLegalBlock(legalMount, {
      variant: 'chronos_timing',
      basePath: getRepoRoot(),
      includePolicyLinks: true,
      compactLinks: true
    });
  },

  autoRenderLifeCycles() {
    const birthDate = loadChronosBirthdate();
    if (birthDate) {
      this.renderLifeCycles(birthDate);
    } else {
      this.renderInputForm();
    }
  },

  renderInputForm() {
    const container = document.getElementById('chrono-content-area');
    if (!container) return;

    dom.clear(container.id);

    const card = dom.createEl('div', {
      className: 'glass-card text-center',
      parent: container
    });

    dom.createEl('h3', {
      className: 'section-eyebrow',
      text: 'Deine Phase',
      parent: card
    });

    dom.createEl('p', {
      className: 'text-secondary mb-16',
      text: 'Gib dein Datum ein, um deinen aktuellen Rhythmus modellbasiert einzuordnen.',
      parent: card
    });

    const formGroup = dom.createEl('div', {
      className: 'form-group form-container-compact',
      parent: card
    });

    dom.createEl('label', {
      text: 'Geburtsdatum (TT.MM.JJJJ)',
      parent: formGroup
    });

    const input = dom.createEl('input', {
      type: 'text',
      id: 'chrono-birthdate',
      placeholder: 'z.B. 15.08.1990',
      parent: formGroup
    });

    dom.createEl('p', {
      id: 'chrono-error',
      className: 'text-accent text-center mt-16',
      parent: card
    });

    const btn = dom.createEl('button', {
      className: 'btn-primary mt-24 form-container-compact',
      id: 'chrono-calc-btn',
      text: 'Phase ansehen',
      parent: card
    });

    bindSmartDateInput('chrono-birthdate');

    const clickHandler = async () => {
      const birthDate = input.value.trim();

      if (!birthDate) {
        dom.setText('chrono-error', 'Bitte gib ein Geburtsdatum ein.');
        return;
      }

      const dateRegex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$|^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(birthDate)) {
        dom.setText('chrono-error', 'Bitte nutze TT.MM.JJJJ oder YYYY-MM-DD.');
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Ich schaue gerade nach.';
      await showTerminalLoader('chrono-content-area', 1000);

      await saveChronosBirthdate(birthDate);
      this.renderLifeCycles(birthDate);
    };

    btn.addEventListener('click', clickHandler);
    this._listeners.push({ element: btn, type: 'click', handler: clickHandler });

    const legalMount = dom.createEl('div', {
      id: 'chronos-form-legal',
      className: 'mt-24',
      parent: card
    });
    injectLegalBlock(legalMount, {
      variant: 'chronos_timing',
      basePath: getRepoRoot(),
      includePolicyLinks: true,
      compactLinks: true
    });

    const timerId = setTimeout(() => card.classList.add('visible'), 100);
    this._timers.push(timerId);
  },

  renderLifeCycles(birthDate) {
    const result = calculateChronosProfile(birthDate);

    if (!result.success) {
      console.warn('[Zeit] Berechnung fehlgeschlagen:', result.error);
      this.renderInputForm();
      const timerId = setTimeout(() => {
        dom.setText('chrono-error', 'Das gespeicherte Datum passt nicht. Gib es bitte neu ein.');
      }, 50);
      this._timers.push(timerId);
      return;
    }

    const container = document.getElementById('chrono-content-area');
    if (!container) return;

    dom.clear(container.id);

    const data = result.data;
    const focusNumber = getFocusNumber(data);
    const focusTopic = data?.cycle_phase || 'Aktive Entwicklungsphase';
    const daysInCurrentPhase = calculateDaysInCurrentPhase(data);
    const nextCycleDate = new Date(data.nextCycleStartUTC);
    const formattedNextCycle = `${String(nextCycleDate.getUTCDate()).padStart(2, '0')}.${String(nextCycleDate.getUTCMonth() + 1).padStart(2, '0')}.${nextCycleDate.getUTCFullYear()}`;

    const cyclesCard = dom.createEl('div', {
      className: 'glass-card mb-24',
      parent: container
    });

    dom.createEl('h3', {
      className: 'section-eyebrow',
      text: 'Dein aktueller Status',
      parent: cyclesCard
    });

    dom.createEl('p', {
      className: 'text-secondary mb-24',
      text: 'Jede Phase hat ihren eigenen Rhythmus. Hier siehst du, wie lange dein aktuelles Thema im Modell noch präsent ist und wann der nächste Wechsel ansteht.',
      parent: cyclesCard
    });

    const dataGrid = dom.createEl('div', {
      className: 'data-grid compact',
      parent: cyclesCard
    });

    const daysItem = dom.createEl('div', {
      className: 'stagger-fade card-grid-item',
      parent: dataGrid
    });
    daysItem.setAttribute('data-delay', '1');
    const daysValue = dom.createEl('span', {
      className: 'value-massive accent value-massive-sm',
      text: '0',
      parent: daysItem
    });
    dom.createEl('span', {
      className: 'value-label',
      text: 'Tage in dieser Phase',
      parent: daysItem
    });

    const phaseItem = dom.createEl('div', {
      className: 'stagger-fade card-grid-item',
      parent: dataGrid
    });
    phaseItem.setAttribute('data-delay', '2');
    dom.createEl('span', {
      className: 'value-massive text-size-xl',
      text: String(focusNumber),
      parent: phaseItem
    });
    dom.createEl('span', {
      className: 'value-label',
      text: `Dein Fokus: ${focusNumber}`,
      parent: phaseItem
    });
    dom.createEl('span', {
      className: 'text-sm opacity-70',
      text: `Thema: ${focusTopic}`,
      parent: phaseItem
    });

    const nextItem = dom.createEl('div', {
      className: 'stagger-fade card-grid-item',
      parent: dataGrid
    });
    nextItem.setAttribute('data-delay', '3');
    dom.createEl('span', {
      className: 'value-massive secondary text-size-sm',
      text: formattedNextCycle,
      parent: nextItem
    });
    dom.createEl('span', {
      className: 'value-label',
      text: 'Nächster Wechsel',
      parent: nextItem
    });

    animateValue(daysValue, 0, daysInCurrentPhase, 1500);

    const daysTimer = setTimeout(() => daysItem.classList.add('visible'), 100);
    const phaseTimer = setTimeout(() => phaseItem.classList.add('visible'), 200);
    const nextTimer = setTimeout(() => nextItem.classList.add('visible'), 300);
    this._timers.push(daysTimer, phaseTimer, nextTimer);

    dom.createEl('p', {
      className: 'text-secondary mt-24 text-center',
      text: getFocusNarrative(focusNumber, focusTopic),
      parent: cyclesCard
    });

    const resetBtn = dom.createEl('button', {
      className: 'btn-secondary mt-24 text-size-sm',
      text: 'Neue Analyse',
      parent: cyclesCard
    });

    const legalMount = dom.createEl('div', {
      id: 'chronos-results-legal',
      className: 'mt-24',
      parent: cyclesCard
    });
    injectLegalBlock(legalMount, {
      variant: 'chronos_timing',
      basePath: getRepoRoot(),
      includePolicyLinks: true,
      compactLinks: true
    });

    const resetHandler = () => {
      clearChronosBirthdate();
      dom.clear(container.id);
      this.renderInputForm();
    };

    resetBtn.addEventListener('click', resetHandler);
    this._listeners.push({ element: resetBtn, type: 'click', handler: resetHandler });
  },

  destroy() {
    this._unsubscribers.forEach((unsub) => unsub && unsub());
    this._unsubscribers = [];

    this._listeners.forEach(({ element, type, handler }) => {
      element.removeEventListener(type, handler);
    });
    this._listeners = [];

    this._timers.forEach((id) => clearTimeout(id));
    this._timers = [];
  },

  initScrollReveal() {
    dom.initScrollReveal();
  }
};

chronosRender.init();
