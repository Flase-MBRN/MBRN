/**
 * /shared/ui/navigation.js
 * Global Navigation Manager
 *
 * Fix #2: Dynamische Root-Erkennung via getRepoRoot().
 * Funktioniert lokal (http://localhost:8080/) UND auf GitHub Pages (/MBRN/) ohne <base href>.
 * 
 * LAW 1 COMPLIANT: Routes imported from centralized config
 */

import { MBRN_ROUTE_META, MBRN_ROUTES } from '../core/config.js';
import { state } from '../core/state.js';
import { touchManager } from './touch_manager.js';
import { dom } from './dom_utils.js';

function getKnownRouteSegments() {
  return Object.values(MBRN_ROUTES)
    .filter((route) => route !== MBRN_ROUTES.home)
    .map((route) => `/${route.replace(/index\.html$/, '')}`);
}

/**
 * Ermittelt dynamisch den Repo-Root anhand bekannter Pfad-Segmente.
 * Lokal: /  → GitHub Pages: /MBRN/
 */
export function getRepoRoot() {
  const path = window.location.pathname;
  const knownSegments = getKnownRouteSegments();
  for (const segment of knownSegments) {
    const idx = path.indexOf(segment);
    if (idx !== -1) return path.slice(0, idx) + '/';
  }
  // Sicherstellen, dass Root immer mit / endet
  const root = path.replace(/\/[^/]*$/, '/') || '/';
  return root.endsWith('/') ? root : root + '/';
}

/**
 * Rendert die Sidebar-Navigation dynamisch
 * @param {string} containerId — ID des Containers (default: 'nav-menu')
 */
export function renderNavigation(containerId = 'nav-menu') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn('[render_nav] Container nicht gefunden:', containerId);
    return;
  }

  const currentRoute = getCurrentRoute();

  // Clear existing
  dom.clear(containerId);

  // Definierte Reihenfolge: Start zuerst, dann Dashboard, dann die Apps
  const navOrder = ['home', 'dashboard', 'finance', 'numerology', 'chronos', 'tuning'];

  for (const routeKey of navOrder) {
    const meta = MBRN_ROUTE_META[routeKey];
    const route = MBRN_ROUTES[routeKey];
    if (!meta || !route) continue;

    const isActive = currentRoute === routeKey;

    // Real href fallback: relative path calculated from current location
    const hrefFallback = getRepoRoot() + route;

    const link = dom.createEl('a', {
      className: `nav-item${isActive ? ' active' : ''}`,
      attrs: { 'data-route': routeKey, href: hrefFallback, title: meta.label || routeKey },
      parent: container
    });

    dom.createEl('span', {
      className: 'nav-icon',
      text: meta.icon || '>',
      parent: link
    });
    dom.createEl('span', {
      className: 'nav-label',
      text: meta.label || routeKey,
      parent: link
    });
  }
}

export function getCurrentRoute(pathname = window.location.pathname) {
  for (const [routeKey, routePath] of Object.entries(MBRN_ROUTES)) {
    if (routeKey === 'home') continue;
    const routeSegment = `/${routePath.replace(/index\.html$/, '')}`;
    if (pathname.includes(routeSegment)) {
      return routeKey;
    }
  }
  return 'home';
}

export const nav = {
  // Current active app instance for cleanup
  _currentApp: null,
  _cleanupListenersInitialized: false,
  _navigationBound: false, // Law 5: Idempotency guard - prevents duplicate listeners
  // OMEGA FIX: Store interval IDs for cleanup
  _memoryCheckInterval: null,
  _cleanupInterval: null,
  _mobileMenuOpen: false,
  _hamburgerElement: null,
  _mobileBackdropElement: null,
  _handlers: {}, // Registry for named handlers to allow removeEventListener

  /**
   * Register the current app instance for cleanup on navigation
   * @param {Object} appInstance - The render object with destroy() method
   */
  registerCurrentApp(appInstance) {
    this._currentApp = appInstance;
    this._initEmergencyCleanup();
  },

  /**
   * Initialize emergency cleanup listeners for browser back/forward/refresh
   * MEMORY LEAK FIX: Ensures destroy() is called even on non-router navigation
   */
  _initEmergencyCleanup() {
    if (this._cleanupListenersInitialized) return;
    this._cleanupListenersInitialized = true;

    // 1. Browser Navigation Handler
    this._handlers.popstate = () => {
      if (this._currentApp && typeof this._currentApp.destroy === 'function') {
        this._currentApp.destroy();
        this._currentApp = null;
      }
    };
    window.addEventListener('popstate', this._handlers.popstate);

    // 2. Unload Handler
    this._handlers.beforeunload = () => {
      if (this._currentApp && typeof this._currentApp.destroy === 'function') {
        this._currentApp.destroy();
        this._currentApp = null;
      }
    };
    window.addEventListener('beforeunload', this._handlers.beforeunload);
    
    // 3. Visibility Change Handler
    this._handlers.visibilitychange = () => {
      if (document.hidden && this._currentApp) {
        if (state?.emit) {
          state.emit('appPaused', { timestamp: Date.now() });
        }
      } else if (!document.hidden && this._currentApp) {
        if (state?.emit) {
          state.emit('appResumed', { timestamp: Date.now() });
        }
      }
    };
    document.addEventListener('visibilitychange', this._handlers.visibilitychange);
    
    // MEMORY PRESSURE DETECTION (Mobile browsers)
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      this._memoryCheckInterval = setInterval(async () => {
        try {
          const estimate = await navigator.storage.estimate();
          if (estimate.usage && estimate.quota && estimate.usage > estimate.quota * 0.8) {
            console.warn('[Navigation] Memory pressure detected - triggering cleanup');
            if (state?.emit) {
              state.emit('memoryPressure', { 
                usage: estimate.usage, 
                quota: estimate.quota,
                percentage: (estimate.usage / estimate.quota * 100).toFixed(1)
              });
            }
          }
        } catch (err) {
          // Silent fail - storage estimate not critical
        }
      }, 30000); // Check every 30 seconds
    }
    
    // Cleanup orphaned DOM elements periodically
    this._cleanupInterval = setInterval(() => {
      this._cleanupOrphanedElements();
    }, 60000); // Every minute
  },
  
  /**
   * Cleanup orphaned DOM elements that may leak memory
   */
  _cleanupOrphanedElements() {
    // Remove any global error containers that aren't in DOM
    const errorContainers = document.querySelectorAll('[id^="global-error"]');
    errorContainers.forEach(el => {
      if (!document.body.contains(el)) {
        el.remove();
      }
    });
    
    // Remove orphaned toast notifications
    const toasts = document.querySelectorAll('#mbrn-toast');
    if (toasts.length > 1) {
      // Keep only the most recent
      toasts.forEach((toast, index) => {
        if (index < toasts.length - 1) toast.remove();
      });
    }
  },
  
  /**
   * Navigate to a route - calls destroy() on current app before navigating
   * @param {string} route - Route key from MBRN_ROUTES
   */
  navigateTo(route) {
    // Cleanup current app before navigating
    if (this._currentApp && typeof this._currentApp.destroy === 'function') {
      this._currentApp.destroy();
      this._currentApp = null;
    }
    
    const base = getRepoRoot();
    window.location.href = base + (MBRN_ROUTES[route] ?? MBRN_ROUTES.home);
  },

  bindNavigation() {
    // Law 5: Idempotency - prevent duplicate listeners if called multiple times
    if (this._navigationBound) {
      return;
    }
    this._navigationBound = true;

    // Global Umlaut-Fix für statische HTML-Texte
    if (typeof document !== 'undefined' && document.body && typeof dom.normalizeDocumentText === 'function') {
      dom.normalizeDocumentText(document.body);
    }

    document.querySelectorAll('[data-route]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigateTo(link.getAttribute('data-route'));
      });
    });

    // Initialize touch gestures for mobile (idempotent internal check)
    touchManager.init();

    // Initialize mobile hamburger menu
    this.initMobileMenu();

    // 4. Outside Sidebar Click Handler
    this._handlers.outsideClick = (e) => {
      const sidebar = document.querySelector('.nav-sidebar');
      const isClickInsideSidebar = sidebar?.contains(e.target);
      const isClickOnNavToggle = e.target.closest('.nav-toggle, .nav-hamburger');

      if (!isClickInsideSidebar && !isClickOnNavToggle && sidebar?.classList.contains('mobile-open')) {
        if (window.innerWidth <= 768) {
          this._setMobileMenuOpen(false);
        }
      }
    };
    document.addEventListener('click', this._handlers.outsideClick);
  },

  /**
   * Reset navigation binding state - useful for tests or full page reloads
   * Law 5: Allows intentional rebinding when needed
   */
  resetNavigationBinding() {
    this._navigationBound = false;
  },

  /**
   * OMEGA FIX: Destroy - Cleanup all intervals and references
   * Prevents memory leaks from setInterval timers
   */
  /**
   * Initialize mobile hamburger menu for responsive navigation
   * Starry Sky Design: subtiler Glow, #05050A background
   */
  initMobileMenu() {
    // Check if hamburger already exists
    let hamburger = document.querySelector('.nav-hamburger');
    
    if (!hamburger) {
      hamburger = document.createElement('button');
      hamburger.className = 'nav-hamburger';
      hamburger.setAttribute('aria-label', 'Menu');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.textContent = '☰';
      document.body.appendChild(hamburger);
    }
    
    this._hamburgerElement = hamburger;

    let backdrop = document.querySelector('.nav-mobile-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'nav-mobile-backdrop';
      document.body.appendChild(backdrop);
    }
    this._mobileBackdropElement = backdrop;
    
    // 5. Mobile Toggle Handler
    this._handlers.mobileToggle = () => {
      this._setMobileMenuOpen(!this._mobileMenuOpen);
    };
    hamburger.addEventListener('click', this._handlers.mobileToggle);

    this._handlers.backdropClick = () => {
      this._setMobileMenuOpen(false);
    };
    backdrop.addEventListener('click', this._handlers.backdropClick);
    
    // 6. Escape Key Handler
    this._handlers.keydownEscape = (e) => {
      if (e.key === 'Escape' && this._mobileMenuOpen) {
        this._setMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', this._handlers.keydownEscape);
  },

  _setMobileMenuOpen(isOpen) {
    this._mobileMenuOpen = Boolean(isOpen);
    const sidebar = document.querySelector('.nav-sidebar');
    sidebar?.classList.toggle('mobile-open', this._mobileMenuOpen);

    if (this._hamburgerElement) {
      this._hamburgerElement.classList.toggle('active', this._mobileMenuOpen);
      this._hamburgerElement.textContent = this._mobileMenuOpen ? '✕' : '☰';
      this._hamburgerElement.setAttribute('aria-expanded', this._mobileMenuOpen ? 'true' : 'false');
    }

    if (this._mobileBackdropElement) {
      this._mobileBackdropElement.classList.toggle('active', this._mobileMenuOpen);
    }

    if (document.body?.classList) {
      document.body.classList.toggle('sidebar-open', this._mobileMenuOpen);
    }
  },

  destroy() {
    // 1. Clear Intervals
    if (this._memoryCheckInterval) {
      clearInterval(this._memoryCheckInterval);
      this._memoryCheckInterval = null;
    }
    
    if (this._cleanupInterval) {
      clearInterval(this._cleanupInterval);
      this._cleanupInterval = null;
    }
    
    // 2. Remove Global Listeners
    if (this._handlers.popstate) {
      window.removeEventListener('popstate', this._handlers.popstate);
    }
    if (this._handlers.beforeunload) {
      window.removeEventListener('beforeunload', this._handlers.beforeunload);
    }
    if (this._handlers.visibilitychange) {
      document.removeEventListener('visibilitychange', this._handlers.visibilitychange);
    }
    if (this._handlers.outsideClick) {
      document.removeEventListener('click', this._handlers.outsideClick);
    }
    if (this._handlers.keydownEscape) {
      document.removeEventListener('keydown', this._handlers.keydownEscape);
    }
    if (this._handlers.backdropClick && this._mobileBackdropElement) {
      this._mobileBackdropElement.removeEventListener('click', this._handlers.backdropClick);
    }
    
    // 3. Mobile UI Cleanup
    if (this._hamburgerElement) {
      if (this._handlers.mobileToggle) {
        this._hamburgerElement.removeEventListener('click', this._handlers.mobileToggle);
      }
      if (this._hamburgerElement.parentNode) {
        this._hamburgerElement.parentNode.removeChild(this._hamburgerElement);
      }
      this._hamburgerElement = null;
    }
    if (this._mobileBackdropElement) {
      if (this._mobileBackdropElement.parentNode) {
        this._mobileBackdropElement.parentNode.removeChild(this._mobileBackdropElement);
      }
      this._mobileBackdropElement = null;
    }
    document.body?.classList?.remove('sidebar-open');
    
    // 4. State Reset
    this._handlers = {};
    this._cleanupListenersInitialized = false;
    this._navigationBound = false;
    this._mobileMenuOpen = false;
    
    // 5. App Instance Teardown
    if (this._currentApp && typeof this._currentApp.destroy === 'function') {
      this._currentApp.destroy();
    }
    this._currentApp = null;
  }
};
