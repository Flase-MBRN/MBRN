/**
 * /shared/ui/render_nav.js
 * Dynamic Navigation Renderer — Single Source of Truth
 * 
 * LAW 1: Zentrale Navigation aus MBRN_ROUTE_META
 * Fix für: Inkonsistente Navigation zwischen Apps
 */

import { MBRN_ROUTE_META, MBRN_ROUTES } from '../core/config.js';
import { dom } from './dom_utils.js';

/**
 * Ermittelt aktuelle Route aus window.location
 */
function getCurrentRoute() {
  const path = window.location.pathname;
  
  // Direct directory-based detection (reliable, no empty-string-match bug)
  if (path.includes('/apps/chronos/')) return 'chronos';
  if (path.includes('/apps/finance/')) return 'finance';
  if (path.includes('/apps/numerology/')) return 'numerology';
  if (path.includes('/apps/synergy/')) return 'synergy';
  if (path.includes('/apps/tuning/')) return 'tuning';
  if (path.includes('/dashboard/')) return 'dashboard';
  
  return 'home';
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
  const navOrder = ['home', 'dashboard', 'finance', 'numerology', 'chronos'];

  for (const routeKey of navOrder) {
    const meta = MBRN_ROUTE_META[routeKey];
    const route = MBRN_ROUTES[routeKey];
    if (!meta || !route) continue;

    const isActive = currentRoute === routeKey;
    
    // Real href fallback: relative path calculated from current location
    const hrefFallback = _resolveHref(route);

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

/**
 * Berechnet einen relativen href-Fallback für den Fall dass JS-Navigation nicht greift
 * Verwendet die gleiche Root-Logik wie navigation.js getRepoRoot()
 */
function _resolveHref(routePath) {
  const path = window.location.pathname;
  const knownSegments = [
    '/dashboard/',
    '/apps/finance/',
    '/apps/numerology/',
    '/apps/chronos/',
    '/apps/tuning/',
    '/apps/synergy/'
  ];
  
  let root = '/';
  for (const segment of knownSegments) {
    const idx = path.indexOf(segment);
    if (idx !== -1) {
      root = path.slice(0, idx) + '/';
      break;
    }
  }
  
  return root + routePath;
}

/**
 * Auto-initialize navigation on DOM ready
 */
export function initNav() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => renderNavigation());
  } else {
    renderNavigation();
  }
}
