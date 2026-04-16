/**
 * /shared/ui/navigation.js
 * Global Navigation Manager
 *
 * Fix #2: Dynamische Root-Erkennung via getRepoRoot().
 * Funktioniert lokal (http://localhost:8080/) UND auf GitHub Pages (/MBRN/) ohne <base href>.
 * 
 * LAW 1 COMPLIANT: Routes imported from centralized config
 */

import { MBRN_ROUTES } from '../core/config.js';
import { touchManager } from './touch_manager.js';

/**
 * Ermittelt dynamisch den Repo-Root anhand bekannter Pfad-Segmente.
 * Lokal: /  → GitHub Pages: /MBRN/
 */
function getRepoRoot() {
  const path = window.location.pathname;
  const knownSegments = ['/dashboard/', '/apps/finance/', '/apps/numerology/'];
  for (const segment of knownSegments) {
    const idx = path.indexOf(segment);
    if (idx !== -1) return path.slice(0, idx) + '/';
  }
  // Sicherstellen, dass Root immer mit / endet
  const root = path.replace(/\/[^/]*$/, '/') || '/';
  return root.endsWith('/') ? root : root + '/';
}

export const nav = {
  // Current active app instance for cleanup
  _currentApp: null,
  _cleanupListenersInitialized: false,
  _navigationBound: false, // Law 5: Idempotency guard - prevents duplicate listeners
  // OMEGA FIX: Store interval IDs for cleanup
  _memoryCheckInterval: null,
  _cleanupInterval: null,

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

    // Cleanup on browser back/forward button
    window.addEventListener('popstate', () => {
      if (this._currentApp && typeof this._currentApp.destroy === 'function') {
        console.log('[Navigation] Emergency cleanup on popstate (back/forward)');
        this._currentApp.destroy();
        this._currentApp = null;
      }
    });

    // Cleanup on page unload/refresh
    window.addEventListener('beforeunload', () => {
      if (this._currentApp && typeof this._currentApp.destroy === 'function') {
        console.log('[Navigation] Emergency cleanup on beforeunload');
        this._currentApp.destroy();
        this._currentApp = null;
      }
    });
    
    // MEMORY LEAK FIX: Handle tab visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this._currentApp) {
        console.log('[Navigation] Tab hidden - pausing expensive operations');
        // Emit pause event for app to handle
        if (typeof state !== 'undefined' && state.emit) {
          state.emit('appPaused', { timestamp: Date.now() });
        }
      } else if (!document.hidden && this._currentApp) {
        console.log('[Navigation] Tab visible - resuming operations');
        if (typeof state !== 'undefined' && state.emit) {
          state.emit('appResumed', { timestamp: Date.now() });
        }
      }
    });
    
    // MEMORY PRESSURE DETECTION (Mobile browsers)
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      this._memoryCheckInterval = setInterval(async () => {
        try {
          const estimate = await navigator.storage.estimate();
          if (estimate.usage && estimate.quota && estimate.usage > estimate.quota * 0.8) {
            console.warn('[Navigation] Memory pressure detected - triggering cleanup');
            if (typeof state !== 'undefined' && state.emit) {
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

    console.log('[Navigation] Emergency cleanup listeners initialized');
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
      console.log(`[Navigation] Cleaning up current app before navigating to ${route}`);
      this._currentApp.destroy();
      this._currentApp = null;
    }
    
    const base = getRepoRoot();
    window.location.href = base + (MBRN_ROUTES[route] ?? MBRN_ROUTES.home);
  },

  bindNavigation() {
    // Law 5: Idempotency - prevent duplicate listeners if called multiple times
    if (this._navigationBound) {
      console.log('[Navigation] bindNavigation() already called, skipping duplicate listener registration');
      return;
    }
    this._navigationBound = true;

    document.querySelectorAll('[data-route]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigateTo(link.getAttribute('data-route'));
      });
    });

    // Initialize touch gestures for mobile (idempotent internal check)
    touchManager.init();

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
      const sidebar = document.querySelector('.nav-sidebar');
      const isClickInsideSidebar = sidebar?.contains(e.target);
      const isClickOnNavToggle = e.target.closest('.nav-toggle');

      if (!isClickInsideSidebar && !isClickOnNavToggle && sidebar?.classList.contains('open')) {
        if (window.innerWidth <= 768) {
          sidebar.classList.remove('open');
          document.body.style.overflow = '';
        }
      }
    });

    console.log('[Navigation] Navigation bindings established (idempotent)');
  },

  /**
   * Reset navigation binding state - useful for tests or full page reloads
   * Law 5: Allows intentional rebinding when needed
   */
  resetNavigationBinding() {
    this._navigationBound = false;
    console.log('[Navigation] Navigation binding state reset');
  },

  /**
   * OMEGA FIX: Destroy - Cleanup all intervals and references
   * Prevents memory leaks from setInterval timers
   */
  destroy() {
    // Clear memory pressure check interval
    if (this._memoryCheckInterval) {
      clearInterval(this._memoryCheckInterval);
      this._memoryCheckInterval = null;
    }
    
    // Clear orphaned element cleanup interval
    if (this._cleanupInterval) {
      clearInterval(this._cleanupInterval);
      this._cleanupInterval = null;
    }
    
    // Clear current app reference
    if (this._currentApp && typeof this._currentApp.destroy === 'function') {
      this._currentApp.destroy();
    }
    this._currentApp = null;
    
    console.log('[Navigation] Destroyed - All intervals cleared');
  }
};
