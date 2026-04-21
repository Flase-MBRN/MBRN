import { buildSurfaceCopyBundle } from '../../meta_generator/content/index.js';
import { getRepoRoot, nav, renderNavigation } from '../navigation/index.js';
import { renderAuth } from '../ui_states/auth_controller.js';
import { injectLegalBlock } from '../shell/legal_blocks.js';

function renderSynergySurfaceBody() {
  const mount = document.getElementById('synergy-surface-root');
  if (!mount) return;

  const copy = buildSurfaceCopyBundle('synergy');
  const basePath = getRepoRoot();

  mount.innerHTML = `
    <div class="glass-card text-center">
      <div class="section-eyebrow-left">${copy?.title || 'Synergy'}</div>
      <p class="text-secondary mb-20">${copy?.subtitle || 'Diese Surface wurde generatorgetrieben vorbereitet.'}</p>
      <div class="share-action-group__buttons">
        <a href="${basePath}dashboard/index.html" class="btn-primary share-action-group__primary" data-route="dashboard" style="display:inline-flex; text-decoration:none;">Zum Dashboard</a>
        <a href="${basePath}apps/numerology/index.html" class="btn-secondary share-action-group__secondary" data-route="numerology" style="display:inline-flex; text-decoration:none;">Zur Kernflaeche</a>
      </div>
      <div id="synergy-surface-legal" class="mt-24"></div>
    </div>
  `;

  mount.querySelectorAll('[data-route]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      nav.navigateTo(link.getAttribute('data-route'));
    });
  });

  injectLegalBlock('synergy-surface-legal', {
    variant: 'sync',
    basePath,
    includePolicyLinks: true,
    compactLinks: true
  });
}

export const synergySurface = {
  init() {
    renderNavigation('nav-menu');
    nav.bindNavigation();
    nav.registerCurrentApp(this);
    renderAuth.init();
    renderSynergySurfaceBody();
  },

  destroy() {}
};

synergySurface.init();
