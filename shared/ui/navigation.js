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
  navigateTo(route) {
    const base = getRepoRoot();
    window.location.href = base + (MBRN_ROUTES[route] ?? MBRN_ROUTES.home);
  },

  bindNavigation() {
    document.querySelectorAll('[data-route]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigateTo(link.getAttribute('data-route'));
      });
    });
  }
};
