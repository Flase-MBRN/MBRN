import { getRepoRoot, nav, renderNavigation } from '../navigation/index.js';
import {
  calculateLandingLifePath,
  getLandingTerminalMessages,
  readExistingLandingProfile,
  saveLandingProfile
} from '../../../shared/application/frontend_os/landing_runtime.js';
import { renderAuth } from '../ui_states/auth_controller.js';
import { bindSmartDateInput } from '../../../shared/ui/dom_utils.js';
import { injectLegalBlock } from './legal_blocks.js';
import { getFrontendProductJourney } from '../../../shared/application/frontend_os/discoverability_runtime.js';

const ARCHETYPES = {
  1: { title: 'Der Initiator', desc: 'Das Modell betont hier Eigeninitiative und klare Entscheidungen.' },
  2: { title: 'Der Verbinder', desc: 'Das Modell rueckt Kooperation, Timing und Balance in den Vordergrund.' },
  3: { title: 'Der Kreative', desc: 'Das Modell verbindet diese Zahl oft mit Ausdruck, Praesenz und klarer Kommunikation.' },
  4: { title: 'Der Architekt', desc: 'Das Modell zeigt einen starken Fokus auf Struktur, Stabilitaet und verlaessliche Umsetzung.' },
  5: { title: 'Der Freigeist', desc: 'Das Modell markiert hier haeufig Anpassung, Bewegung und flexible Kurswechsel.' },
  6: { title: 'Der Traeger', desc: 'Das Modell ordnet diese Zahl oft Verantwortung, Halt und Verlaesslichkeit zu.' },
  7: { title: 'Der Analytiker', desc: 'Das Modell hebt Analyse, Mustererkennung und klares Denken hervor.' },
  8: { title: 'Der Macher', desc: 'Das Modell betont Umsetzung, Entscheidungskraft und sichtbare Wirkung.' },
  9: { title: 'Der Weitblicker', desc: 'Das Modell verbindet diese Zahl oft mit Perspektive und Sinn fuer Zusammenhaenge.' },
  11: { title: 'Der Wegweiser', desc: 'Das Modell liest hier haeufig feine Wahrnehmung und praezise Impulse heraus.' },
  22: { title: 'Der Baumeister', desc: 'Das Modell ordnet diese Zahl oft belastbaren Strukturen und grossen Vorhaben zu.' },
  33: { title: 'Der Mentor', desc: 'Das Modell betont Orientierung, Ruhe und tragende Praesenz.' }
};

export const landingRender = {
  userData: null,
  productJourney: getFrontendProductJourney(),

  async init() {
    const existingData = readExistingLandingProfile();
    if (existingData) {
      const entryRoute = this.productJourney.entrySurface?.route || 'dashboard/index.html';
      window.location.href = getRepoRoot() + entryRoute;
      return;
    }

    renderNavigation('nav-menu');
    nav.bindNavigation();
    nav.registerCurrentApp(this);
    await renderAuth.init();

    this.bindForm();
    this.bindButtons();
    this.injectLegalSurfaces();
    this.initScrollReveal();
  },

  initScrollReveal() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach((el) => {
      observer.observe(el);
    });
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
      btnDashboard.textContent = `Zu ${this.productJourney.entrySurface?.label || 'deiner Kernflaeche'}`;
      btnDashboard.addEventListener('click', () => nav.navigateTo(this.productJourney.entrySurface?.id || 'dashboard'));
    }

    const skipLink = document.getElementById('skip-dashboard-link');
    if (skipLink) {
      skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        nav.navigateTo('dashboard');
      });
    }

    const dashboardLink = document.getElementById('btn-dashboard-secondary');
    if (dashboardLink) {
      dashboardLink.addEventListener('click', (e) => {
        e.preventDefault();
        nav.navigateTo('dashboard');
      });
    }
  },

  injectLegalSurfaces() {
    const basePath = getRepoRoot();
    injectLegalBlock('landing-legal-mount', {
      variant: 'data',
      basePath,
      includePolicyLinks: true,
      includeReset: true,
      redirectToHome: true
    });
    injectLegalBlock('reveal-legal-mount', {
      variant: 'numerology',
      basePath,
      includePolicyLinks: true,
      compactLinks: true
    });
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
    saveLandingProfile({ name, birthDate, lifePath });
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
      const terminalMessages = getLandingTerminalMessages();
      const messageInterval = totalDuration / terminalMessages.length;

      setTimeout(() => {
        progressBar.style.width = '100%';
      }, 100);

      const typeMessage = () => {
        if (messageIndex < terminalMessages.length) {
          const line = document.createElement('div');
          line.className = 'terminal-line';
          line.textContent = terminalMessages[messageIndex];
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
    return calculateLandingLifePath(birthDate);
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
      welcomeMsg.textContent = `Willkommen zurueck, ${this.userData.firstName}.`;
      revealText.insertBefore(welcomeMsg, revealText.firstChild);
    }

    numberEl.textContent = lifePath;
    titleEl.textContent = archetype.title;
    descEl.textContent = archetype.desc;

    const revealHint = revealText.querySelector('.text-muted');
    if (revealHint) {
      revealHint.textContent = `${this.productJourney.entrySurface?.label || 'Die Kernflaeche'} ist dein erster kontrollierter Einstieg. Das Dashboard bleibt danach dein Hub fuer den naechsten Schritt.`;
    }

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

      const loader = document.getElementById('loader-section');
      const reveal = document.getElementById('reveal-section');
      if (loader) loader.classList.add('hidden');
      if (reveal) reveal.classList.add('hidden');
      return;
    }

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
