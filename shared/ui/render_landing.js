/**
 * /shared/ui/render_landing.js
 * LANDING PAGE RENDERER — v3.0 STATE PERSISTENCE
 * 
 * 1. The Hook → Glassmorphism Form (NEW USERS)
 * 2. The Anticipation → Terminal Loader (2.5s)
 * 3. The Reveal → Life Path Display with SVG Ring
 * 4. The Cliffhanger → Blurred Dimensions Grid
 * 
 * v3.0: Added State Persistence for Returning Users
 * - Checks localStorage for existing profile
 * - Skips loader for returning users
 * - Shows "Welcome back" message
 */

import { nav } from './navigation.js';
import { storage } from '../core/storage.js';

// Archetype definitions for life path numbers 1-9
const ARCHETYPES = {
  1: { title: 'Der Initiator', desc: 'Pionier. Macher. Der, der Wege bahnt wo keine sind.' },
  2: { title: 'Der Diplomat', desc: 'Brückenbauer. Empath. Der, der Harmonie schafft.' },
  3: { title: 'Der Kreative', desc: 'Expressionist. Kommunikator. Der, der Farbe ins Leben bringt.' },
  4: { title: 'Der Architekt', desc: 'Baumeister. Stratege. Der, der fundamentale Strukturen schafft.' },
  5: { title: 'Der Freigeist', desc: 'Entdecker. Veränderer. Der, der Grenzen überschreitet.' },
  6: { title: 'Der Nurturer', desc: 'Versorger. Heiler. Der, der für andere da ist.' },
  7: { title: 'Der Sucher', desc: 'Analytiker. Philosoph. Der, der tiefe Wahrheiten sucht.' },
  8: { title: 'Der Magnat', desc: 'Anführer. Organisator. Der, der materielle Reichtümer manifestiert.' },
  9: { title: 'Der Humanist', desc: 'Idealist. Lehrer. Der, der für das Große Ganze eintritt.' }
};

// Terminal loading messages
const TERMINAL_MESSAGES = [
  '> Verbinde mit MBRN Core...',
  '> Authentifiziere Frequenz-Node...',
  '> Syncing Chronos Engine...',
  '> Decodierung der Lebensmatrix...',
  '> Berechne numerische Resonanz...',
  '> Extrahiere Primärfrequenz...',
  '> Analyse abgeschlossen.'
];

export const landingRender = {
  currentSection: 'hook', // hook → loader → reveal → cliffhanger
  userData: null, // Stores name + birthDate for persistence
  
  /**
   * Initialize Landing Page
   * v3.0: Check for returning users FIRST (before showing form)
   */
  init() {
    this.bindForm();
    this.bindUnlockButtons();
    nav.bindNavigation();
    
    // CRITICAL: Check for returning user BEFORE showing form
    const existingData = this.checkExistingProfile();
    
    if (existingData) {
      // RETURNING USER: Skip hook, go directly to reveal
      this.userData = existingData;
      this.showReturningUserReveal();
      console.log('[Landing Render] v3.0 Welcome back,', existingData.firstName);
    } else {
      // NEW USER: Show normal flow
      console.log('[Landing Render] v3.0 State Persistence Active — New User Flow');
    }
  },
  
  /**
   * Check if user has existing profile in localStorage
   * @returns {Object|null} { name, birthDate, lifePath, firstName } or null
   */
  checkExistingProfile() {
    // Check for last numerology calculation data
    const lastCalc = storage.get('last_numerology_calc');
    
    if (lastCalc.success && lastCalc.data) {
      const data = lastCalc.data;
      
      // Validate we have all required fields
      if (data.name && data.birthDate && data.lifePath) {
        // Extract first name for welcome message
        const firstName = data.name.split(' ')[0];
        
        return {
          name: data.name,
          birthDate: data.birthDate,
          lifePath: data.lifePath,
          firstName: firstName
        };
      }
    }
    
    // Also check legacy profile format
    const profile = storage.get('profile');
    if (profile.success && profile.data && profile.data.name) {
      // Try to extract birthdate from profile
      const legacyData = profile.data;
      if (legacyData.birthDate || legacyData.birth_date) {
        const birthDate = legacyData.birthDate || legacyData.birth_date;
        const lifePath = this.calculateLifePath(birthDate);
        
        return {
          name: legacyData.name,
          birthDate: birthDate,
          lifePath: lifePath,
          firstName: legacyData.name.split(' ')[0]
        };
      }
    }
    
    return null;
  },
  
  /**
   * Show reveal for returning users (NO loader, instant)
   */
  showReturningUserReveal() {
    const { lifePath, firstName } = this.userData;
    const archetype = ARCHETYPES[lifePath];
    
    // INSTANT transition (no loader for returning users)
    this.transitionTo('reveal');
    
    // Update DOM with data
    const numberEl = document.getElementById('life-path-number');
    const titleEl = document.getElementById('archetype-title');
    const descEl = document.getElementById('archetype-desc');
    const ringProgress = document.getElementById('ring-progress');
    
    if (!numberEl || !titleEl || !descEl) {
      console.error('[Landing] DOM elements missing for reveal');
      return;
    }
    
    // Show number immediately (no animation for returning users)
    numberEl.textContent = lifePath;
    titleEl.textContent = archetype.title;
    descEl.textContent = archetype.desc;
    
    // Add welcome back message
    const revealText = document.querySelector('.reveal-text');
    if (revealText) {
      const welcomeMsg = document.createElement('p');
      welcomeMsg.className = 'welcome-back';
      welcomeMsg.textContent = `Willkommen zurück, ${firstName}`;
      revealText.insertBefore(welcomeMsg, revealText.firstChild);
    }
    
    // Animate ring (still show animation for visual delight)
    if (ringProgress) {
      const circumference = 2 * Math.PI * 90;
      ringProgress.style.strokeDasharray = circumference;
      ringProgress.style.strokeDashoffset = circumference;
      
      // Small delay for visual effect
      requestAnimationFrame(() => {
        ringProgress.style.transition = 'stroke-dashoffset 1s ease-out';
        ringProgress.style.strokeDashoffset = 0;
      });
    }
    
    // After short delay, show cliffhanger
    setTimeout(() => {
      this.transitionTo('cliffhanger');
    }, 2500);
  },
  
  /**
   * Save user data to localStorage after analysis
   */
  saveUserData(name, birthDate, lifePath) {
    const data = {
      name: name,
      birthDate: birthDate,
      lifePath: lifePath,
      calculatedAt: new Date().toISOString()
    };
    
    storage.set('last_numerology_calc', data);
    console.log('[Landing] User data saved to localStorage');
  },
  
  /**
   * Bind the frequency form submit
   */
  bindForm() {
    const form = document.getElementById('frequency-form');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('input-name').value;
      const date = document.getElementById('input-date').value;
      
      if (name && date) {
        this.startAnalysis(name, date);
      }
    });
  },
  
  /**
   * Start the WTF-Moment Flow (NEW USERS ONLY)
   */
  async startAnalysis(name, birthDate) {
    // Save for persistence
    this.userData = { name, birthDate };
    
    // 1. Hide Hook, Show Loader
    this.transitionTo('loader');
    
    // 2. Terminal Animation (2.5s total)
    await this.runTerminalSequence();
    
    // 3. Calculate Life Path
    const lifePath = this.calculateLifePath(birthDate);
    const archetype = ARCHETYPES[lifePath];
    
    // 4. Save to localStorage for returning users
    this.saveUserData(name, birthDate, lifePath);
    
    // 5. Reveal
    this.showReveal(lifePath, archetype);
    
    // 6. After delay, show cliffhanger
    setTimeout(() => {
      this.transitionTo('cliffhanger');
    }, 3500);
  },
  
  /**
   * Terminal loading sequence
   */
  runTerminalSequence() {
    return new Promise((resolve) => {
      const terminalText = document.getElementById('terminal-text');
      const progressBar = document.getElementById('progress-bar');
      
      let messageIndex = 0;
      const totalDuration = 2500;
      const messageInterval = totalDuration / TERMINAL_MESSAGES.length;
      
      // Animate progress bar
      setTimeout(() => {
        progressBar.style.width = '100%';
      }, 100);
      
      // Type messages
      const typeMessage = () => {
        if (messageIndex < TERMINAL_MESSAGES.length) {
          const msg = TERMINAL_MESSAGES[messageIndex];
          const line = document.createElement('div');
          line.className = 'terminal-line';
          line.textContent = msg;
          terminalText.appendChild(line);
          terminalText.scrollTop = terminalText.scrollHeight;
          
          messageIndex++;
          setTimeout(typeMessage, messageInterval * 0.7);
        }
      };
      
      typeMessage();
      
      // Resolve after total duration
      setTimeout(resolve, totalDuration);
    });
  },
  
  /**
   * Calculate life path from birth date
   */
  calculateLifePath(birthDate) {
    const [year, month, day] = birthDate.split('-').map(Number);
    
    const sum = (n) => {
      let s = String(n).split('').reduce((a, b) => a + parseInt(b), 0);
      while (s > 9 && s !== 11 && s !== 22 && s !== 33) {
        s = String(s).split('').reduce((a, b) => a + parseInt(b), 0);
      }
      return s;
    };
    
    const lifePath = sum(sum(year) + sum(month) + sum(day));
    return lifePath;
  },
  
  /**
   * Show the reveal section with life path (for new users)
   */
  showReveal(lifePath, archetype) {
    this.transitionTo('reveal');
    
    const numberEl = document.getElementById('life-path-number');
    const titleEl = document.getElementById('archetype-title');
    const descEl = document.getElementById('archetype-desc');
    const ringProgress = document.getElementById('ring-progress');
    
    // Safety check
    if (!numberEl || !titleEl || !descEl) {
      console.error('[Landing] Required DOM elements not found');
      return;
    }
    
    // Animate number
    this.animateNumber(numberEl, lifePath);
    
    // Update text
    titleEl.textContent = archetype.title;
    descEl.textContent = archetype.desc;
    
    // Animate SVG ring
    if (ringProgress) {
      const circumference = 2 * Math.PI * 90; // r=90
      ringProgress.style.strokeDasharray = circumference;
      ringProgress.style.strokeDashoffset = circumference;
      
      setTimeout(() => {
        ringProgress.style.transition = 'stroke-dashoffset 1.5s ease-out';
        ringProgress.style.strokeDashoffset = 0;
      }, 100);
    }
  },
  
  /**
   * Animate number counting up
   */
  animateNumber(element, target) {
    let current = 0;
    const duration = 800;
    const step = target / (duration / 16);
    
    const count = () => {
      current += step;
      if (current < target) {
        element.textContent = Math.floor(current);
        requestAnimationFrame(count);
      } else {
        element.textContent = target;
      }
    };
    
    requestAnimationFrame(count);
  },
  
  /**
   * Section transitions
   */
  transitionTo(section) {
    // Hide all sections
    ['hook', 'loader', 'reveal', 'cliffhanger'].forEach(s => {
      const el = document.getElementById(`${s}-section`);
      if (el) {
        el.classList.add('hidden');
        el.classList.remove('visible');
      }
    });
    
    // Show target section
    const target = document.getElementById(`${section}-section`);
    if (target) {
      target.classList.remove('hidden');
      // Force reflow
      void target.offsetWidth;
      target.classList.add('visible');
    }
    
    this.currentSection = section;
  },
  
  /**
   * Bind unlock buttons (for future payment integration)
   */
  bindUnlockButtons() {
    const btnUnlock = document.getElementById('btn-unlock');
    const btnDeepDive = document.getElementById('btn-deep-dive');
    
    const handleUnlock = () => {
      // For now, redirect to numerology app
      window.location.href = './apps/numerology/';
    };
    
    if (btnUnlock) btnUnlock.addEventListener('click', handleUnlock);
    if (btnDeepDive) btnDeepDive.addEventListener('click', handleUnlock);
  }
};

// Auto-Init
landingRender.init();
