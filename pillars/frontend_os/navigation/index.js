import { APP_MANIFEST } from '../../../shared/core/registries/app_manifest.js';
import { DIMENSION_REGISTRY, getDimensionById } from '../../../shared/core/registries/dimension_registry.js';
import { TOPIC_AREA_REGISTRY, getTopicAreaById } from '../../../shared/core/registries/topic_area_registry.js';
import { getDimensionRoute, getTopicAreaRoute } from '../../../shared/application/frontend_os/discoverability_runtime.js';
import { emitFrontendOsEvent } from '../../../shared/application/frontend_os/navigation_events.js';
import { touchManager } from './touch_manager.js';
import { dom } from '../../../shared/ui/dom_utils.js';
import { renderPolicyLinks } from '../shell/legal_blocks.js';

const SYSTEM_SURFACES = Object.freeze([
  { id: 'home', label: 'Start', route: 'index.html', icon: 'S', includeInNavigation: true },
  { id: 'dashboard', label: 'Dashboard', route: 'dashboard/index.html', icon: 'D', includeInNavigation: true }
]);

function getLegacyDimensionRoute(dimensionId) {
  return `dimensions/${dimensionId}/index.html`;
}

function getKnownRouteSegments() {
  return [
    ...SYSTEM_SURFACES.map((surface) => `/${surface.route.replace(/index\.html$/, '')}`),
    ...DIMENSION_REGISTRY.map((dimension) => `/${getDimensionRoute(dimension.id).replace(/index\.html$/, '')}`),
    ...DIMENSION_REGISTRY.map((dimension) => `/${getLegacyDimensionRoute(dimension.id).replace(/index\.html$/, '')}`),
    ...TOPIC_AREA_REGISTRY.map((topicArea) => `/${getTopicAreaRoute(topicArea.id).replace(/index\.html$/, '')}`),
    ...APP_MANIFEST.map((app) => `/${app.route.replace(/index\.html$/, '')}`)
  ];
}

function normalizeRuntimePath(pathname = '/') {
  const withoutRepoPrefix = pathname.replace(/^\/MBRN/, '');
  const trimmed = withoutRepoPrefix.replace(/\/+$/, '');
  return trimmed || '/';
}

function routeMatchesPath(pathname, route) {
  const normalizedPath = normalizeRuntimePath(pathname);
  const normalizedRoute = `/${String(route || '').replace(/^\/+/, '')}`.replace(/\/+$/, '');
  const withoutIndex = normalizedRoute.replace(/\/index\.html$/, '').replace(/index\.html$/, '') || '/';

  if (withoutIndex === '/') {
    return normalizedPath === '/' || normalizedPath === '/index.html';
  }

  return normalizedPath === withoutIndex || normalizedPath === `${withoutIndex}/index.html`;
}

export function getRepoRoot() {
  const currentPath = window.location.pathname;
  const mbrnPrefix = '/MBRN/';

  if (currentPath.startsWith(mbrnPrefix)) {
    return mbrnPrefix;
  }

  const knownSegments = getKnownRouteSegments();
  for (const segment of knownSegments) {
    const index = currentPath.indexOf(segment);
    if (index !== -1) {
      return currentPath.slice(0, index) + '/';
    }
  }

  const root = currentPath.replace(/\/[^/]*$/, '/') || '/';
  return root.endsWith('/') ? root : `${root}/`;
}

function resolveSystemSurface(routeKey) {
  return SYSTEM_SURFACES.find((surface) => surface.id === routeKey) || null;
}

function resolveAppSurface(routeKey) {
  return APP_MANIFEST.find((app) => app.id === routeKey) || null;
}

function resolveDimensionSurface(routeKey) {
  const dimension = getDimensionById(routeKey);
  if (!dimension) {
    return null;
  }

  return {
    id: dimension.id,
    label: dimension.publicLabel,
    route: getDimensionRoute(dimension.id)
  };
}

function resolveTopicAreaSurface(routeKey) {
  const topicArea = getTopicAreaById(routeKey);
  if (!topicArea) {
    return null;
  }

  return {
    id: topicArea.id,
    label: topicArea.publicLabel,
    route: getTopicAreaRoute(topicArea.id),
    dimensionId: topicArea.dimensionId
  };
}

function buildNavigationEntries() {
  const systemEntries = SYSTEM_SURFACES
    .filter((surface) => surface.includeInNavigation)
    .map((surface) => ({ ...surface, group: 'system' }));

  const dimensionEntries = DIMENSION_REGISTRY
    .filter((dimension) => dimension.surfaceFlags?.includeInNavigation)
    .map((dimension) => {
      return {
        id: dimension.id,
        dimensionId: dimension.id,
        label: dimension.publicLabel,
        route: getDimensionRoute(dimension.id),
        icon: dimension.publicLabel.charAt(0).toUpperCase(),
        group: 'dimension'
      };
    })
    .sort((left, right) => {
      const leftOrder = getDimensionById(left.dimensionId)?.surfaceFlags?.navigationOrder ?? 999;
      const rightOrder = getDimensionById(right.dimensionId)?.surfaceFlags?.navigationOrder ?? 999;
      return leftOrder - rightOrder;
    });

  return [...systemEntries, ...dimensionEntries];
}

export function getNavigationEntries() {
  return buildNavigationEntries();
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
  for (const surface of SYSTEM_SURFACES) {
    if (routeMatchesPath(pathname, surface.route)) {
      return surface.id;
    }
  }

  for (const dimension of DIMENSION_REGISTRY) {
    if (routeMatchesPath(pathname, getLegacyDimensionRoute(dimension.id))) {
      return dimension.id;
    }
  }

  for (const app of APP_MANIFEST) {
    if (routeMatchesPath(pathname, app.route)) {
      return app.id;
    }
  }

  for (const topicArea of TOPIC_AREA_REGISTRY) {
    if (routeMatchesPath(pathname, getTopicAreaRoute(topicArea.id))) {
      return topicArea.id;
    }
  }

  for (const dimension of DIMENSION_REGISTRY) {
    if (routeMatchesPath(pathname, getDimensionRoute(dimension.id))) {
      return dimension.id;
    }
  }

  return 'home';
}

function getActiveNavigationId(pathname = window.location.pathname) {
  const currentRoute = getCurrentRoute(pathname);
  if (resolveSystemSurface(currentRoute)) {
    return currentRoute;
  }

  const dimensionSurface = resolveDimensionSurface(currentRoute);
  if (dimensionSurface) {
    return dimensionSurface.id;
  }

  const appSurface = resolveAppSurface(currentRoute);
  if (appSurface) {
    return appSurface.dimensionId;
  }

  const topicAreaSurface = resolveTopicAreaSurface(currentRoute);
  if (topicAreaSurface) {
    return topicAreaSurface.dimensionId;
  }

  return 'home';
}

export function renderNavigation(containerId = 'nav-menu') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn('[render_nav] Container nicht gefunden:', containerId);
    return;
  }

  const activeNavigationId = getActiveNavigationId();
  dom.clear(containerId);

  let currentGroup = null;
  buildNavigationEntries().forEach((entry) => {
    if (entry.group !== currentGroup) {
      currentGroup = entry.group;
      dom.createEl('div', {
        className: 'nav-section-label',
        text: currentGroup === 'system' ? 'System' : 'Dimensionen',
        parent: container
      });
    }

    const isActive = activeNavigationId === entry.id;
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
        emitFrontendOsEvent('appPaused', { timestamp: Date.now() });
      } else if (!document.hidden && this._currentApp) {
        emitFrontendOsEvent('appResumed', { timestamp: Date.now() });
      }
    };
    document.addEventListener('visibilitychange', this._handlers.visibilitychange);

    if ('storage' in navigator && 'estimate' in navigator.storage) {
      this._memoryCheckInterval = setInterval(async () => {
        try {
          const estimate = await navigator.storage.estimate();
          if (estimate.usage && estimate.quota && estimate.usage > estimate.quota * 0.8) {
            emitFrontendOsEvent('memoryPressure', {
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
    errorContainers.forEach((element) => {
      if (!document.body.contains(element)) {
        element.remove();
      }
    });

    const toasts = document.querySelectorAll('#mbrn-toast');
    if (toasts.length > 1) {
      toasts.forEach((toast, index) => {
        if (index < toasts.length - 1) {
          toast.remove();
        }
      });
    }
  },

  navigateTo(route) {
    if (this._currentApp && typeof this._currentApp.destroy === 'function') {
      this._currentApp.destroy();
      this._currentApp = null;
    }

    const systemSurface = resolveSystemSurface(route);
    const dimensionSurface = resolveDimensionSurface(route);
    const topicAreaSurface = resolveTopicAreaSurface(route);
    const appSurface = resolveAppSurface(route);
    const targetRoute = systemSurface?.route || topicAreaSurface?.route || dimensionSurface?.route || appSurface?.route || 'index.html';
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
      link.addEventListener('click', (event) => {
        event.preventDefault();
        this.navigateTo(link.getAttribute('data-route'));
      });
    });

    touchManager.init();
    this.initMobileMenu();

    this._handlers.outsideClick = (event) => {
      const sidebar = document.querySelector('.nav-sidebar');
      const isClickInsideSidebar = sidebar?.contains(event.target);
      const isClickOnNavToggle = event.target.closest('.nav-toggle, .nav-hamburger');

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

    this._handlers.keydownEscape = (event) => {
      if (event.key === 'Escape' && this._mobileMenuOpen) {
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
