/**
 * /shared/ui/render_landing.js
 * Landing-Flow fuer Einstieg, Skip und ersten Blick aufs Muster.
 */

import { nav } from './navigation.js';
import { storage } from '../core/storage.js';
import { i18n } from '../core/i18n.js';

const ARCHETYPES = {
  1: { title: 'Der Initiator', desc: 'Du gehst am besten voran, wenn du selbst den ersten Schritt setzt.' },
  2: { title: 'Der Verbinder', desc: 'Du bringst Ruhe, Feingefühl und Verbindung in Gruppen und Beziehungen.' },
  3: { title: 'Der Kreative', desc: 'Du wirkst stark, wenn du dich zeigst und deiner Stimme Raum gibst.' },
  4: { title: 'Der Architekt', desc: 'Du baust gern mit Struktur, Klarheit und einem langen Atem.' },
  5: { title: 'Der Freigeist', desc: 'Du brauchst Bewegung und Freiheit, damit deine Kraft wach bleibt.' },
  6: { title: 'Der Träger', desc: 'Du gibst Halt, übernimmst Verantwortung und schaust auf dein Umfeld.' },
  7: { title: 'Der Analytiker', desc: 'Du erkennst Muster schnell und willst die Dinge wirklich verstehen.' },
  8: { title: 'Der Macher', desc: 'Du willst Wirkung, klare Ergebnisse und greifbare Bewegung sehen.' },
  9: { title: 'Der Weitblicker', desc: 'Du siehst das große Ganze und denkst oft über dich selbst hinaus.' },
  11: { title: 'Der Wegweiser', desc: 'Du nimmst viel fein wahr und hast ein starkes Gespür für das, was gerade dran ist.' },
  22: { title: 'Der Baumeister', desc: 'Du kannst groß denken und Dinge so bauen, dass sie lange tragen.' },
  33: { title: 'Der Mentor', desc: 'Du wirkst am stärksten, wenn du andere ruhig führst und ihnen Orientierung gibst.' }
};

const TERMINAL_MESSAGES = i18n.getArray('terminal.sequence');

export const landingRender = {
  userData: null,

  init() {
    const existingData = this.checkExistingProfile();
    if (existingData) {
      window.location.href = './dashboard/index.html';
      return;
    }

    this.bindForm();
    this.bindButtons();
  },

  checkExistingProfile() {
    const lastCalc = storage.get('last_numerology_calc');
    if (lastCalc.success && lastCalc.data?.name && lastCalc.data?.birthDate && lastCalc.data?.lifePath) {
      return {
        name: lastCalc.data.name,
        birthDate: lastCalc.data.birthDate,
        lifePath: lastCalc.data.lifePath,
        firstName: lastCalc.data.name.split(' ')[0]
      };
    }

    const profile = storage.get('profile');
    if (profile.success && profile.data?.name && (profile.data.birthDate || profile.data.birth_date)) {
      const birthDate = profile.data.birthDate || profile.data.birth_date;
      return {
        name: profile.data.name,
        birthDate,
        lifePath: this.calculateLifePath(birthDate),
        firstName: profile.data.name.split(' ')[0]
      };
    }

    return null;
  },

  bindForm() {
    const form = document.getElementById('frequency-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('input-name')?.value.trim();
      const date = document.getElementById('input-date')?.value;

      if (name && date) {
        this.startAnalysis(name, date);
      }
    });
  },

  bindButtons() {
    const btnDashboard = document.getElementById('btn-dashboard');
    if (btnDashboard) {
      btnDashboard.addEventListener('click', () => nav.navigateTo('dashboard'));
    }

    const skipLink = document.getElementById('skip-dashboard-link');
    if (skipLink) {
      skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        nav.navigateTo('dashboard');
      });
    }
  },

  async startAnalysis(name, birthDate) {
    this.userData = { name, birthDate };
    this.transitionTo('loader');
    await this.runTerminalSequence();

    const lifePath = this.calculateLifePath(birthDate);
    this.saveUserData(name, birthDate, lifePath);
    this.showReveal(lifePath, false);
  },

  saveUserData(name, birthDate, lifePath) {
    storage.set('last_numerology_calc', {
      name,
      birthDate,
      lifePath,
      calculatedAt: new Date().toISOString()
    });
  },

  runTerminalSequence() {
    return new Promise((resolve) => {
      const terminalText = document.getElementById('terminal-text');
      const progressBar = document.getElementById('progress-bar');
      if (!terminalText || !progressBar) {
        resolve();
        return;
      }

      terminalText.replaceChildren();
      progressBar.style.width = '0%';

      let messageIndex = 0;
      const totalDuration = 2500;
      const messageInterval = totalDuration / TERMINAL_MESSAGES.length;

      setTimeout(() => {
        progressBar.style.width = '100%';
      }, 100);

      const typeMessage = () => {
        if (messageIndex < TERMINAL_MESSAGES.length) {
          const line = document.createElement('div');
          line.className = 'terminal-line';
          line.textContent = TERMINAL_MESSAGES[messageIndex];
          terminalText.appendChild(line);
          terminalText.scrollTop = terminalText.scrollHeight;
          messageIndex += 1;
          setTimeout(typeMessage, messageInterval * 0.7);
        }
      };

      typeMessage();
      setTimeout(resolve, totalDuration);
    });
  },

  calculateLifePath(birthDate) {
    const [year, month, day] = birthDate.split('-').map(Number);

    const sum = (n) => {
      let s = String(n).split('').reduce((a, b) => a + Number.parseInt(b, 10), 0);
      while (s > 9 && s !== 11 && s !== 22 && s !== 33) {
        s = String(s).split('').reduce((a, b) => a + Number.parseInt(b, 10), 0);
      }
      return s;
    };

    return sum(sum(year) + sum(month) + sum(day));
  },

  showReveal(lifePath, isReturningUser) {
    this.transitionTo('reveal');

    const archetype = ARCHETYPES[lifePath] || ARCHETYPES[9];
    const numberEl = document.getElementById('life-path-number');
    const titleEl = document.getElementById('archetype-title');
    const descEl = document.getElementById('archetype-desc');
    const revealText = document.querySelector('.reveal-text');
    const ringProgress = document.getElementById('ring-progress');

    if (!numberEl || !titleEl || !descEl || !revealText) return;

    revealText.querySelectorAll('.welcome-back').forEach((node) => node.remove());

    if (isReturningUser && this.userData?.firstName) {
      const welcomeMsg = document.createElement('p');
      welcomeMsg.className = 'welcome-back';
      welcomeMsg.textContent = `Willkommen zurück, ${this.userData.firstName}.`;
      revealText.insertBefore(welcomeMsg, revealText.firstChild);
    }

    numberEl.textContent = lifePath;
    titleEl.textContent = archetype.title;
    descEl.textContent = archetype.desc;

    if (ringProgress) {
      const circumference = 2 * Math.PI * 90;
      ringProgress.style.strokeDasharray = circumference;
      ringProgress.style.strokeDashoffset = circumference;
      requestAnimationFrame(() => {
        ringProgress.style.strokeDashoffset = '0';
      });
    }
  },

  transitionTo(section) {
    ['hook', 'loader', 'reveal'].forEach((key) => {
      const element = document.getElementById(`${key}-section`);
      if (!element) return;
      element.classList.add('hidden');
      element.classList.remove('visible');
    });

    const target = document.getElementById(`${section}-section`);
    if (target) {
      target.classList.remove('hidden');
      void target.offsetWidth;
      target.classList.add('visible');
    }
  }
};

landingRender.init();
