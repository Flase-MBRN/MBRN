import { getRepoRoot, nav, renderNavigation } from '../navigation/index.js';
import { renderAuth } from '../ui_states/auth_controller.js';
import { injectLegalBlock } from '../shell/legal_blocks.js';
import { renderSurfaceFlowRail } from '../shell/flow_rail.js';
import { renderDimensionViewCard } from './shared.js';
import { renderOracleSignalSurface } from './oracle_signal_surface.js';
import { getDimensionSurfaceModel } from '../../../shared/application/frontend_os/discoverability_runtime.js';

function resolveDimensionRouteFromPath(pathname = window.location.pathname) {
  const normalizedPath = String(pathname || '').replace(/^\/MBRN/, '');
  const topicMatch = normalizedPath.match(/\/dimensions\/([^/]+)\/([^/]+)(?:\/index\.html)?$/);
  if (topicMatch) {
    return { dimensionId: topicMatch[1], topicAreaId: topicMatch[2] };
  }

  const dimensionMatch = normalizedPath.match(/\/dimensions\/([^/]+)(?:\/index\.html)?$/);
  return { dimensionId: dimensionMatch?.[1] || null, topicAreaId: null };
}

async function renderDimensionSurfaceBody(dimensionId, topicAreaId = null) {
  const model = getDimensionSurfaceModel(dimensionId);
  if (!model) {
    throw new Error(`Unknown dimension route: ${dimensionId}`);
  }

  const topicArea = topicAreaId
    ? model.topicAreas.find((item) => item.id === topicAreaId)
    : null;

  const eyebrow = document.getElementById('dimension-eyebrow');
  const title = document.getElementById('dimension-title');
  const subtitle = document.getElementById('dimension-subtitle');
  const mount = document.getElementById('dimension-surface-root');

  if (!mount) {
    throw new Error('Dimension surface root missing');
  }

  if (eyebrow) {
    eyebrow.textContent = topicArea ? model.publicLabel : (model.content?.title || 'Dimension');
  }
  if (title) {
    title.textContent = (topicArea?.publicLabel || model.publicLabel).toUpperCase();
  }
  if (subtitle) {
    subtitle.textContent = topicArea?.description || model.description;
  }

  document.title = `${topicArea?.publicLabel || model.publicLabel} - MBRN Hub`;

  if (topicAreaId === 'oracle_signal') {
    await renderOracleSignalSurface(mount);
    renderSurfaceFlowRail('dimension-flow-rail', topicAreaId);
    injectLegalBlock('dimension-legal-mount', {
      variant: 'sync',
      basePath: getRepoRoot(),
      includePolicyLinks: true,
      compactLinks: true
    });
    return;
  }

  await renderDimensionViewCard(mount, dimensionId, {
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
    const { dimensionId, topicAreaId } = resolveDimensionRouteFromPath();

    renderNavigation('nav-menu');
    nav.bindNavigation();
    nav.registerCurrentApp(this);
    await renderAuth.init();
    await renderDimensionSurfaceBody(dimensionId, topicAreaId);
  },

  destroy() {}
};

dimensionSurface.init();
