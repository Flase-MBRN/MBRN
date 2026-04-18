/**
 * /apps/chronos/render.js
 * Zeit-Seite fuer Phasen und 7-Jahres-Zyklen.
 */

import { state } from '../../shared/core/state.js';
import { actions } from '../../shared/core/actions.js';
import { storage } from '../../shared/core/storage.js';
import { dom, animateValue, showTerminalLoader, bindSmartDateInput } from '../../shared/ui/dom_utils.js';
import { nav, renderNavigation } from '../../shared/ui/navigation.js';
import { renderAuth } from '../../shared/ui/render_auth.js';
import { calculateChronos } from '../../shared/core/logic/chronos_v2.js';

export const chronosRender = {
  _unsubscribers: [],
  _listeners: [],
  _timers: [],

  init() {
    actions.register('calculateChronos', async (payload) => {
      const res = calculateChronos(payload.birthDate);
      state.emit('chronosCalculated', res);
      return res;
    });

    renderNavigation('nav-menu');
    nav.bindNavigation();
    nav.registerCurrentApp(this);
    renderAuth.init();

    this.autoRenderLifeCycles();
    this.initScrollReveal();
  },

  autoRenderLifeCycles() {
    const userBirthdateResult = storage.get('user_birthdate');
    if (userBirthdateResult.success && userBirthdateResult.data) {
      this.renderLifeCycles(userBirthdateResult.data);
      return;
    }

    const profile = state.get('systemInitialized');
    let birthDate = profile?.birthDate || profile?.birth_date;

    if (!birthDate) {
      const stored = storage.get('last_numerology_calc');
      birthDate = stored?.data?.birthDate || stored?.data?.birth_date;
    }

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
      text: 'Dein Startpunkt',
      parent: card
    });

    dom.createEl('p', {
      className: 'text-secondary mb-16',
      text: 'Gib dein Geburtsdatum ein. Ich zeige dir, in welcher Phase du gerade bist.',
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
      text: 'Zeit ansehen',
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

      await storage.set('user_birthdate', birthDate);

      this.renderLifeCycles(birthDate);
    };

    btn.addEventListener('click', clickHandler);
    this._listeners.push({ element: btn, type: 'click', handler: clickHandler });

    const timerId = setTimeout(() => card.classList.add('visible'), 100);
    this._timers.push(timerId);
  },

  renderLifeCycles(birthDate) {
    const result = calculateChronos(birthDate);

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
    const nextCycleDate = new Date(data.nextCycleStartUTC);
    const formattedNextCycle = `${String(nextCycleDate.getUTCDate()).padStart(2, '0')}.${String(nextCycleDate.getUTCMonth() + 1).padStart(2, '0')}.${nextCycleDate.getUTCFullYear()}`;

    const cyclesCard = dom.createEl('div', {
      className: 'glass-card mb-24',
      parent: container
    });

    dom.createEl('h3', {
      className: 'section-eyebrow',
      text: 'Deine Phasen im Blick',
      parent: cyclesCard
    });

    dom.createEl('p', {
      className: 'text-secondary mb-24',
      text: 'Hier siehst du, wie lange dein bisheriger Weg schon läuft und wann die nächste Phase beginnt.',
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
      text: 'Tage bis heute',
      parent: daysItem
    });

    const phaseItem = dom.createEl('div', {
      className: 'stagger-fade card-grid-item',
      parent: dataGrid
    });
    phaseItem.setAttribute('data-delay', '2');
    dom.createEl('span', {
      className: 'value-massive text-size-xl',
      text: String(data.currentPhase),
      parent: phaseItem
    });
    dom.createEl('span', {
      className: 'value-label',
      text: 'Aktuelle Phase',
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
      text: 'Nächste Phase ab',
      parent: nextItem
    });

    animateValue(daysValue, 0, data.livedDays, 1500);

    const daysTimer = setTimeout(() => daysItem.classList.add('visible'), 100);
    const phaseTimer = setTimeout(() => phaseItem.classList.add('visible'), 200);
    const nextTimer = setTimeout(() => nextItem.classList.add('visible'), 300);
    this._timers.push(daysTimer, phaseTimer, nextTimer);

    const resetBtn = dom.createEl('button', {
      className: 'btn-secondary mt-24 text-size-sm',
      text: 'Neu eingeben',
      parent: cyclesCard
    });

    const resetHandler = () => {
      storage.remove('user_birthdate');
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
