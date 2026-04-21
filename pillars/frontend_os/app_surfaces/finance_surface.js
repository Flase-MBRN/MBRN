/**
 * /apps/finance/render.js
 * Wachstum - klarer Rechner ohne Premium-Schichten.
 */

import { actions } from '../../../shared/application/actions.js';
import {
  getFinanceUiText,
  registerFinanceActions,
  subscribeFinanceSurface
} from '../../../shared/application/frontend_os/finance_runtime.js';
import { dom, animateValue, showTerminalLoader } from '../../../shared/ui/dom_utils.js';
import { getRepoRoot, nav, renderNavigation } from '../navigation/index.js';
import { renderAuth } from '../ui_states/auth_controller.js';
import { injectLegalBlock } from '../shell/legal_blocks.js';
import { renderSurfaceFlowRail } from '../shell/flow_rail.js';
import { exportFinanceStoryAsset } from '../export_entrypoints/asset_export_entry.js';

function formatEuro(value) {
  return value.toLocaleString('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

export const financeRender = {
  _unsubscribers: [],
  _listeners: [],
  _timers: [],
  lastResult: null,

  init() {
    const calcBtn = document.getElementById('calc-btn');

    if (calcBtn) {
      const clickHandler = async () => {
        const principal = parseFloat(document.getElementById('input-principal')?.value || 0);
        const rate = parseFloat(document.getElementById('input-rate')?.value || 0);
        const years = parseFloat(document.getElementById('input-years')?.value || 0);
        const monthly = parseFloat(document.getElementById('input-monthly')?.value || 0);

        calcBtn.disabled = true;
        calcBtn.textContent = getFinanceUiText('loadingTerminal');
        await showTerminalLoader('results-section', 1500);

        actions.dispatch('calculateFinance', { principal, rate, years, monthlyAddition: monthly });
        calcBtn.textContent = 'Zeig es mir';
        calcBtn.disabled = false;
      };

      calcBtn.addEventListener('click', clickHandler);
      this._listeners.push({ element: calcBtn, type: 'click', handler: clickHandler });
    }

    const storyBtn = document.getElementById('finance-story-btn');
    if (storyBtn) {
      const storyHandler = () => {
        if (!this.lastResult) return;
        exportFinanceStoryAsset(this.lastResult);
      };
      storyBtn.addEventListener('click', storyHandler);
      this._listeners.push({ element: storyBtn, type: 'click', handler: storyHandler });
    }

    this._unsubscribers.push(
      subscribeFinanceSurface({
        onCalculationDone: (result) => this.renderResults(result.data),
        onCalculationFailed: (result) => {
          dom.setText('finance-error', `Bitte prüf deine Eingaben. ${result.error}`);
        }
      })
    );

    registerFinanceActions(actions);

    dom.initScrollReveal();
    renderNavigation('nav-menu');
    nav.bindNavigation();
    nav.registerCurrentApp(this);
    renderAuth.init();
    renderSurfaceFlowRail('finance-flow-rail', 'finance');
    this.renderLegalSurfaces();
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

  renderResults(data) {
    this.lastResult = data;
    dom.setText('finance-error', '');

    const storySection = document.getElementById('finance-story-section');
    if (storySection) {
      storySection.classList.remove('hidden');
      storySection.style.display = 'block';
    }

    const renderCard = (id, value, label, description, className) => {
      const root = document.getElementById(id);
      if (!root) return;
      dom.clear(id);
      root.classList.add('stagger-fade');

      const valueEl = dom.createEl('span', {
        className,
        text: '0',
        parent: root
      });
      dom.createEl('span', {
        className: 'value-label',
        text: label,
        parent: root
      });
      dom.createEl('p', {
        className: 'text-sm opacity-70 mt-8',
        text: description,
        parent: root
      });

      animateValue(valueEl, 0, value, 1500, '', (v) => formatEuro(v));
    };

    renderCard(
      'res-final',
      data.finalBalance,
      'Am Ende',
      'Dein komplettes Geld am Ende der Laufzeit.',
      'value-massive text-size-xl'
    );
    renderCard(
      'res-invested',
      data.totalInvested,
      'Eingezahlt',
      'Das ist der Betrag, den du aus eigener Tasche gespart hast.',
      'value-massive secondary text-size-md'
    );
    renderCard(
      'res-interest',
      data.totalInterest,
      'Reiner Gewinn',
      'Das hat dein Geld ganz von alleine fuer dich verdient.',
      'value-massive accent text-size-lg'
    );

    document.querySelectorAll('.results-card .stagger-fade').forEach((el, index) => {
      const timerId = setTimeout(() => el.classList.add('visible'), index * 100);
      this._timers.push(timerId);
    });

    this.renderLegalSurfaces();
  },

  renderLegalSurfaces() {
    const basePath = getRepoRoot();
    injectLegalBlock('finance-result-legal', {
      variant: 'finance',
      basePath,
      includePolicyLinks: true,
      compactLinks: true
    });
    injectLegalBlock('finance-export-legal', {
      variant: 'export_privacy',
      basePath,
      includePolicyLinks: true,
      compactLinks: true
    });
  }
};

financeRender.init();
