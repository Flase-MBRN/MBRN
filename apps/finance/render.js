/**
 * /apps/finance/render.js
 * Wachstum - klarer Rechner ohne Premium-Schichten.
 */

import { state } from '../../shared/core/state.js';
import { actions } from '../../shared/core/actions.js';
import { calculateCompoundInterest } from '../../shared/core/logic/finance.js';
import { dom, animateValue, showTerminalLoader } from '../../shared/ui/dom_utils.js';
import { nav, renderNavigation } from '../../shared/ui/navigation.js';
import { renderAuth } from '../../shared/ui/render_auth.js';
import { i18n } from '../../shared/core/i18n.js';

function formatEuro(value) {
  return value.toLocaleString('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

function downloadFinanceStory(data) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context unavailable');
  }

  canvas.width = 1080;
  canvas.height = 1920;

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#05050A');
  gradient.addColorStop(0.55, '#0A0A0F');
  gradient.addColorStop(1, '#05050A');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#F5F5F5';
  ctx.textAlign = 'center';
  ctx.font = '700 64px Syne, sans-serif';
  ctx.fillText('MBRN', 540, 150);

  ctx.fillStyle = '#7B5CF5';
  ctx.font = '600 46px Inter, sans-serif';
  ctx.fillText('Wachstum', 540, 235);

  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  ctx.font = '400 30px Inter, sans-serif';
  ctx.fillText('So sieht dein Geldweg aus.', 540, 315);

  const cards = [
    { y: 520, label: 'Am Ende', value: formatEuro(data.finalBalance) + ' EUR', note: 'Dein komplettes Geld am Ende der Laufzeit.' },
    { y: 830, label: 'Reiner Gewinn', value: formatEuro(data.totalInterest) + ' EUR', note: 'Das hat dein Geld ganz von alleine für dich verdient.' },
    { y: 1140, label: 'Eingezahlt', value: formatEuro(data.totalInvested) + ' EUR', note: 'Das ist der Betrag, den du aus eigener Tasche gespart hast.' }
  ];

  cards.forEach((card) => {
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(120, card.y, 840, 220, 28);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.58)';
    ctx.textAlign = 'left';
    ctx.font = '500 26px Inter, sans-serif';
    ctx.fillText(card.label, 170, card.y + 65);

    ctx.fillStyle = '#F5F5F5';
    ctx.font = '700 56px Syne, sans-serif';
    ctx.fillText(card.value, 170, card.y + 140);

    ctx.fillStyle = 'rgba(255,255,255,0.62)';
    ctx.font = '400 24px Inter, sans-serif';
    ctx.fillText(card.note, 170, card.y + 190);
  });

  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.textAlign = 'center';
  ctx.font = '400 24px Inter, sans-serif';
  ctx.fillText('built to be used', 540, 1770);

  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = 'MBRN_Wachstum.png';
  link.click();
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
        calcBtn.textContent = i18n.t('loadingTerminal');
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
        downloadFinanceStory(this.lastResult);
      };
      storyBtn.addEventListener('click', storyHandler);
      this._listeners.push({ element: storyBtn, type: 'click', handler: storyHandler });
    }

    this._unsubscribers.push(
      state.subscribe('calculationDone', (result) => this.renderResults(result.data))
    );
    this._unsubscribers.push(
      state.subscribe('calculationFailed', (result) => {
        dom.setText('finance-error', `Bitte prüf deine Eingaben. ${result.error}`);
      })
    );

    actions.register('calculateFinance', (inputData) => {
      if (!inputData) return { success: false, error: 'Keine Daten vorhanden.' };
        const result = calculateCompoundInterest(
        inputData.principal,
        inputData.rate,
        inputData.years,
        inputData.monthlyAddition
        );
        if (result.success) state.emit('calculationDone', result);
        else state.emit('calculationFailed', result);
        return result;
    });

    dom.initScrollReveal();

    // Fix #2: Nav am Ende von init() (System bootet global im Dashboard)
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
      'Das hat dein Geld ganz von alleine für dich verdient.',
      'value-massive accent text-size-lg'
    );

    document.querySelectorAll('.results-card .stagger-fade').forEach((el, index) => {
      const timerId = setTimeout(() => el.classList.add('visible'), index * 100);
      this._timers.push(timerId);
    });
  }
};

financeRender.init();
