import { dom } from './dom_utils.js';
import { getRepoRoot, nav, renderNavigation } from './navigation.js';
import { renderAuth } from './render_auth.js';

function applyRootSafeLinks() {
  const root = getRepoRoot();
  document.querySelectorAll('[data-root-link]').forEach((link) => {
    const target = link.getAttribute('data-root-link');
    if (!target) return;
    link.setAttribute('href', `${root}${target}`);
  });
}

function markCurrentLegalLink() {
  const currentPage = document.body?.dataset?.legalPage;
  if (!currentPage) return;

  document.querySelectorAll('[data-legal-page-link]').forEach((link) => {
    const isCurrent = link.getAttribute('data-legal-page-link') === currentPage;
    link.classList.toggle('is-active', isCurrent);
    if (isCurrent) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

export const legalPageRender = {
  init() {
    dom.initScrollReveal();
    renderNavigation('nav-menu');
    nav.bindNavigation();
    nav.registerCurrentApp(this);
    renderAuth.init();
    applyRootSafeLinks();
    markCurrentLegalLink();
  },

  destroy() {
    // Legal pages do not register page-local listeners at the moment.
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => legalPageRender.init(), { once: true });
} else {
  legalPageRender.init();
}
