import { getRepoRoot, nav, renderNavigation } from '../navigation/index.js';
import { renderAuth } from '../ui_states/auth_controller.js';
import { injectLegalBlock } from '../shell/legal_blocks.js';
import { renderSurfaceFlowRail } from '../shell/flow_rail.js';
import { renderDimensionViewCard } from './shared.js';
import { getDimensionSurfaceModel } from '../../../shared/application/frontend_os/discoverability_runtime.js';

function resolveDimensionIdFromPath(pathname = window.location.pathname) {
  const normalizedPath = String(pathname || '').replace(/^\/MBRN/, '');
  const match = normalizedPath.match(/\/dimensions\/([^/]+)(?:\/index\.html)?$/);
  return match?.[1] || null;
}

function renderDimensionSurfaceBody(dimensionId) {
  const model = getDimensionSurfaceModel(dimensionId);
  if (!model) {
    throw new Error(`Unknown dimension route: ${dimensionId}`);
  }

  const eyebrow = document.getElementById('dimension-eyebrow');
  const title = document.getElementById('dimension-title');
  const subtitle = document.getElementById('dimension-subtitle');
  const mount = document.getElementById('dimension-surface-root');

  if (!mount) {
    throw new Error('Dimension surface root missing');
  }

  if (eyebrow) {
    eyebrow.textContent = model.content?.title || 'Dimension';
  }
  if (title) {
    title.textContent = model.publicLabel.toUpperCase();
  }
  if (subtitle) {
    subtitle.textContent = model.description;
  }

  document.title = `${model.publicLabel} - MBRN Hub`;

  renderDimensionViewCard(mount, dimensionId, {
    eyebrow: 'Dimensions-Hub',
    basePath: getRepoRoot(),
    onNavigate: (surfaceId) => nav.navigateTo(surfaceId)
  });
  renderSurfaceFlowRail('dimension-flow-rail', dimensionId);
  injectLegalBlock('dimension-legal-mount', {
    variant: 'sync',
    basePath: getRepoRoot(),
    includePolicyLinks: true,
    compactLinks: true
  });
}

export const dimensionSurface = {
  async init() {
    const dimensionId = resolveDimensionIdFromPath();

    renderNavigation('nav-menu');
    nav.bindNavigation();
    nav.registerCurrentApp(this);
    await renderAuth.init();
    renderDimensionSurfaceBody(dimensionId);
  },

  destroy() {}
};

dimensionSurface.init();
