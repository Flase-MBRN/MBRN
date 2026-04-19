/**
 * /shared/ui/render_landing.js
 * Landing-Flow für Einstieg, Skip und ersten Blick aufs Muster.
 */

import { nav, renderNavigation } from './navigation.js';
import { storage } from '../core/storage.js';
import { i18n } from '../core/i18n.js';
import { calculateLifePathTotal, formatValue } from '../core/logic/numerology/index.js';
import { renderAuth } from './render_auth.js';
import { bindSmartDateInput } from './dom_utils.js';

const ARCHETYPES = {
  1: { title: 'Der Initiator', desc: 'Dein Fokus liegt auf Eigeninitiative und klaren Entscheidungen.' },
  2: { title: 'Der Verbinder', desc: 'Dein System ist auf Kooperation, Timing und Balance ausgerichtet.' },
  3: { title: 'Der Kreative', desc: 'Dein Fokus liegt auf Ausdruck und Präsenz. Du besitzt das Talent, Räume durch klare Kommunikation zu dominieren.' },
  4: { title: 'Der Architekt', desc: 'Dein Muster baut auf Struktur, Stabilität und verlässliche Umsetzung.' },
  5: { title: 'Der Freigeist', desc: 'Du gewinnst durch Anpassung, Bewegung und schnelle Kurswechsel.' },
  6: { title: 'Der Träger', desc: 'Dein Profil steht für Verantwortung, Halt und langfristige Verlässlichkeit.' },
  7: { title: 'Der Analytiker', desc: 'Du erkennst tiefe Muster und denkst in klaren Systemen.' },
  8: { title: 'Der Macher', desc: 'Deine Stärke ist Wirkung in der Realität: führen, entscheiden, liefern.' },
  9: { title: 'Der Weitblicker', desc: 'Du arbeitest mit großer Perspektive und starkem Sinn für Zusammenhänge.' },
  11: { title: 'Der Wegweiser', desc: 'Du nimmst Signale früh wahr und setzt Impulse mit hoher Präzision.' },
  22: { title: 'Der Baumeister', desc: 'Du kannst Visionen in belastbare Strukturen übersetzen.' },
  33: { title: 'Der Mentor', desc: 'Du führst über Klarheit, Ruhe und starke Orientierung.' }
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

    // Initialize navigation like other apps
    renderNavigation('nav-menu');
    nav.bindNavigation();
    nav.registerCurrentApp(this);
    renderAuth.init();

    this.bindForm();
    this.bindButtons();
    this.initScrollReveal();
  },


  initScrollReveal() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => {
      observer.observe(el);
    });
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
        lifePath: this.calculateLifePath(profile.data.name, birthDate),
        firstName: profile.data.name.split(' ')[0]
      };
    }

    return null;
  },

  bindForm() {
    const form = document.getElementById('frequency-form');
    if (!form) return;

    bindSmartDateInput('input-date');

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

    const lifePath = this.calculateLifePath(name, birthDate);
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

  calculateLifePath(_name, birthDate) {
    const normalizedDate = birthDate.includes('-')
      ? birthDate.split('-').reverse().join('.')
      : birthDate;
    return Number(formatValue(calculateLifePathTotal(normalizedDate)));
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
    // Show/hide main content sections (hero, entry)
    if (section === 'hero' || section === 'entry') {
      ['hero', 'entry'].forEach((key) => {
        const element = document.getElementById(`${key}-section`);
        if (!element) return;
        if (key === section) {
          element.classList.remove('hidden');
        } else {
          element.classList.add('hidden');
        }
      });
      
      // Hide overlays
      const loader = document.getElementById('loader-section');
      const reveal = document.getElementById('reveal-section');
      if (loader) loader.classList.add('hidden');
      if (reveal) reveal.classList.add('hidden');
      return;
    }

    // Show loader or reveal overlay
    if (section === 'loader' || section === 'reveal') {
      const target = document.getElementById(`${section}-section`);
      if (target) {
        target.classList.remove('hidden');
        target.classList.add('visible');
      }
    }
  }
};

landingRender.init();
