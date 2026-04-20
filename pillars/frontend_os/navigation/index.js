import { APP_MANIFEST } from '../../../shared/core/registries/app_manifest.js';
import { DIMENSION_REGISTRY, getDimensionById } from '../../../shared/core/registries/dimension_registry.js';
import { state } from '../../../shared/core/state/index.js';
import { touchManager } from '../../../shared/ui/touch_manager.js';
import { dom } from '../../../shared/ui/dom_utils.js';
import { renderPolicyLinks } from '../shell/legal_blocks.js';

const SYSTEM_SURFACES = Object.freeze([
  { id: 'home', label: 'Start', route: 'index.html', icon: 'S', includeInNavigation: true },
  { id: 'dashboard', label: 'Dashboard', route: 'dashboard/index.html', icon: 'D', includeInNavigation: true }
]);

function getKnownRouteSegments() {
  return [
    ...SYSTEM_SURFACES.map((surface) => `/${surface.route.replace(/index\.html$/, '')}`),
    ...APP_MANIFEST.map((app) => `/${app.route.replace(/index\.html$/, '')}`)
  ];
}

export function getRepoRoot() {
  const path = window.location.pathname;
  
  // GitHub Pages: Wenn der Pfad mit /MBRN/ beginnt, ist das der Repo-Root
  const mbrnPrefix = '/MBRN/';
  if (path.startsWith(mbrnPrefix)) {
    return mbrnPrefix;
  }
  
  // Fallback: Suche nach bekannten Route-Segmenten
  const knownSegments = getKnownRouteSegments();
  for (const segment of knownSegments) {
    const idx = path.indexOf(segment);
    if (idx !== -1) return path.slice(0, idx) + '/';
  }
  
  // Default: Aktuelles Verzeichnis
  const root = path.replace(/\/[^/]*$/, '/') || '/';
  return root.endsWith('/') ? root : root + '/';
}

function resolveSystemSurface(routeKey) {
  return SYSTEM_SURFACES.find((surface) => surface.id === routeKey) || null;
}

function resolveAppSurface(routeKey) {
  return APP_MANIFEST.find((app) => app.id === routeKey) || null;
}

function buildNavigationEntries() {
  const systemEntries = SYSTEM_SURFACES.filter((surface) => surface.includeInNavigation);
  const appEntries = APP_MANIFEST
    .filter((app) => app.surfaceFlags?.includeInNavigation)
    .map((app) => {
      const dimension = getDimensionById(app.dimensionId);
      return {
        id: app.id,
        label: dimension?.publicLabel || app.label,
        route: app.route,
        icon: app.icon
      };
    })
    .sort((left, right) => {
      const leftOrder = getDimensionById(left.id)?.surfaceFlags?.navigationOrder ?? 999;
      const rightOrder = getDimensionById(right.id)?.surfaceFlags?.navigationOrder ?? 999;
      return leftOrder - rightOrder;
    });

  return [
    ...systemEntries,
    ...appEntries
  ];
}

function renderGlobalLegalRail() {
  const footer = document.querySelector('.nav-footer');
  if (!footer) return;

  let rail = document.getElementById('nav-legal-rail');
  if (!rail) {
    rail = dom.createEl('div', {
      id: 'nav-legal-rail',
      className: 'legal-rail',
      parent: footer
    });
  }

  rail.replaceChildren();
  renderPolicyLinks(rail, {
    basePath: getRepoRoot(),
    compact: true
  });
}

export function getCurrentRoute(pathname = window.location.pathname) {
  // GitHub Pages: /MBRN/ Präfix entfernen für Route-Erkennung
  const cleanPath = pathname.replace(/^\/MBRN\//, '/');
  
  console.log('[getCurrentRoute] pathname:', pathname, 'cleanPath:', cleanPath);
  
  // System-Surfaces prüfen (Start, Dashboard)
  for (const surface of SYSTEM_SURFACES) {
    const routeWithoutIndex = surface.route.replace(/index\.html$/, '');
    const routePath = `/${routeWithoutIndex}`;
    
    console.log('[getCurrentRoute] checking surface:', surface.id, 'routePath:', routePath);
    
    if (surface.id === 'home') {
      if (cleanPath === '/' || cleanPath === '/index.html' || cleanPath.endsWith('/index.html')) {
        console.log('[getCurrentRoute] home match');
        return 'home';
      }
    } else {
      // Match mit und ohne index.html und mit/ohne trailing slash
      if (cleanPath === routePath || 
          cleanPath === routePath + '/' || 
          cleanPath === routePath + '/index.html' ||
          cleanPath.startsWith(routePath + '/')) {
        console.log('[getCurrentRoute] systemMatch:', surface.id);
        return surface.id;
      }
    }
  }

  // Apps prüfen
  for (const app of APP_MANIFEST) {
    const routeWithoutIndex = app.route.replace(/index\.html$/, '');
    const routePath = `/${routeWithoutIndex}`;
    
    console.log('[getCurrentRoute] checking app:', app.id, 'routePath:', routePath);
    
    // Match mit und ohne index.html und mit/ohne trailing slash
    if (cleanPath === routePath || 
        cleanPath === routePath + '/' || 
        cleanPath === routePath + '/index.html' ||
        cleanPath.startsWith(routePath + '/')) {
      console.log('[getCurrentRoute] appMatch:', app.id);
      return app.id;
    }
  }
  
  console.log('[getCurrentRoute] default: home');
  return 'home';
}

export function renderNavigation(containerId = 'nav-menu') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn('[render_nav] Container nicht gefunden:', containerId);
    return;
  }

  const currentRoute = getCurrentRoute();
  dom.clear(containerId);

  buildNavigationEntries().forEach((entry) => {
    const isActive = currentRoute === entry.id;
    console.log('[renderNavigation] entry:', entry.id, 'isActive:', isActive, 'currentRoute:', currentRoute);
    const hrefFallback = getRepoRoot() + entry.route;

    const link = dom.createEl('a', {
      className: `nav-item${isActive ? ' active' : ''}`,
      attrs: { 'data-route': entry.id, href: hrefFallback, title: entry.label },
      parent: container
    });

    dom.createEl('span', {
      className: 'nav-icon',
      text: entry.icon || '>',
      parent: link
    });
    dom.createEl('span', {
      className: 'nav-label',
      text: entry.label,
      parent: link
    });
  });

  renderGlobalLegalRail();
}

export const nav = {
  _currentApp: null,
  _cleanupListenersInitialized: false,
  _navigationBound: false,
  _memoryCheckInterval: null,
  _cleanupInterval: null,
  _mobileMenuOpen: false,
  _hamburgerElement: null,
  _mobileBackdropElement: null,
  _handlers: {},

  registerCurrentApp(appInstance) {
    this._currentApp = appInstance;
    this._initEmergencyCleanup();
  },

  _initEmergencyCleanup() {
    if (this._cleanupListenersInitialized) return;
    this._cleanupListenersInitialized = true;

    this._handlers.popstate = () => {
      if (this._currentApp && typeof this._currentApp.destroy === 'function') {
        this._currentApp.destroy();
        this._currentApp = null;
      }
    };
    window.addEventListener('popstate', this._handlers.popstate);

    this._handlers.beforeunload = () => {
      if (this._currentApp && typeof this._currentApp.destroy === 'function') {
        this._currentApp.destroy();
        this._currentApp = null;
      }
    };
    window.addEventListener('beforeunload', this._handlers.beforeunload);

    this._handlers.visibilitychange = () => {
      if (document.hidden && this._currentApp) {
        state.emit('appPaused', { timestamp: Date.now() });
      } else if (!document.hidden && this._currentApp) {
        state.emit('appResumed', { timestamp: Date.now() });
      }
    };
    document.addEventListener('visibilitychange', this._handlers.visibilitychange);

    if ('storage' in navigator && 'estimate' in navigator.storage) {
      this._memoryCheckInterval = setInterval(async () => {
        try {
          const estimate = await navigator.storage.estimate();
          if (estimate.usage && estimate.quota && estimate.usage > estimate.quota * 0.8) {
            state.emit('memoryPressure', {
              usage: estimate.usage,
              quota: estimate.quota,
              percentage: (estimate.usage / estimate.quota * 100).toFixed(1)
            });
          }
        } catch {
          // Ignore advisory metric failures.
        }
      }, 30000);
    }

    this._cleanupInterval = setInterval(() => {
      this._cleanupOrphanedElements();
    }, 60000);
  },

  _cleanupOrphanedElements() {
    const errorContainers = document.querySelectorAll('[id^="global-error"]');
    errorContainers.forEach((el) => {
      if (!document.body.contains(el)) {
        el.remove();
      }
    });

    const toasts = document.querySelectorAll('#mbrn-toast');
    if (toasts.length > 1) {
      toasts.forEach((toast, index) => {
        if (index < toasts.length - 1) toast.remove();
      });
    }
  },

  navigateTo(route) {
    if (this._currentApp && typeof this._currentApp.destroy === 'function') {
      this._currentApp.destroy();
      this._currentApp = null;
    }

    const systemSurface = resolveSystemSurface(route);
    const appSurface = resolveAppSurface(route);
    const targetRoute = systemSurface?.route || appSurface?.route || 'index.html';
    window.location.href = getRepoRoot() + targetRoute;
  },

  bindNavigation() {
    if (this._navigationBound) {
      return;
    }
    this._navigationBound = true;

    if (typeof document !== 'undefined' && document.body && typeof dom.normalizeDocumentText === 'function') {
      dom.normalizeDocumentText(document.body);
    }

    document.querySelectorAll('[data-route]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigateTo(link.getAttribute('data-route'));
      });
    });

    touchManager.init();
    this.initMobileMenu();

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

  resetNavigationBinding() {
    this._navigationBound = false;
  },

  initMobileMenu() {
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

    this._handlers.mobileToggle = () => {
      this._setMobileMenuOpen(!this._mobileMenuOpen);
    };
    hamburger.addEventListener('click', this._handlers.mobileToggle);

    this._handlers.backdropClick = () => {
      this._setMobileMenuOpen(false);
    };
    backdrop.addEventListener('click', this._handlers.backdropClick);

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
    if (this._memoryCheckInterval) {
      clearInterval(this._memoryCheckInterval);
      this._memoryCheckInterval = null;
    }

    if (this._cleanupInterval) {
      clearInterval(this._cleanupInterval);
      this._cleanupInterval = null;
    }

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

    this._handlers = {};
    this._cleanupListenersInitialized = false;
    this._navigationBound = false;
    this._mobileMenuOpen = false;

    if (this._currentApp && typeof this._currentApp.destroy === 'function') {
      this._currentApp.destroy();
    }
    this._currentApp = null;
  }
};
