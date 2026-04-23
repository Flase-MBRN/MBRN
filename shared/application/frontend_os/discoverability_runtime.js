import { APP_MANIFEST } from '../../core/registries/app_manifest.js';
import { DIMENSION_REGISTRY, getDimensionById } from '../../core/registries/dimension_registry.js';
import { TOPIC_AREA_REGISTRY, getTopicAreasByDimensionId } from '../../core/registries/topic_area_registry.js';
import {
  buildDimensionBlueprint,
  buildSurfaceBlueprint
} from '../../../pillars/meta_generator/blueprints/index.js';
import {
  buildDimensionContentBundle,
  buildSurfaceCopyBundle
} from '../../../pillars/meta_generator/content/index.js';

const FRONTEND_OS_ENTRY_DIMENSION_ID = 'muster';

const FRONTEND_OS_SYSTEM_SURFACES = Object.freeze([
  { id: 'home', label: 'Start', route: 'index.html', type: 'system' },
  { id: 'dashboard', label: 'Dashboard', route: 'dashboard/index.html', type: 'system' }
]);

const FRONTEND_OS_EXPORT_ENTRYPOINTS = Object.freeze([
  { id: 'asset_export', label: 'Asset Export', type: 'export' },
  { id: 'pdf_export', label: 'PDF Export', type: 'export' },
  { id: 'share_export', label: 'Share Export', type: 'export' }
]);

export function getDimensionRoute(dimensionId) {
  return `dimensions/${dimensionId}/index.html`;
}

export function getFrontendOsSystemSurfaces() {
  return [...FRONTEND_OS_SYSTEM_SURFACES];
}

export function getFrontendOsExportEntrypoints() {
  return [...FRONTEND_OS_EXPORT_ENTRYPOINTS];
}

function buildDimensionSurfaceEntry(dimension) {
  return {
    id: dimension.id,
    label: dimension.publicLabel,
    route: getDimensionRoute(dimension.id),
    type: 'dimension',
    defaultApp: dimension.defaultApp,
    description: dimension.description,
    content: buildDimensionContentBundle(dimension.id),
    blueprint: buildDimensionBlueprint(dimension.id)
  };
}

function buildAppSurfaceEntry(app) {
  const surfaceCopy = buildSurfaceCopyBundle(app.id);

  return {
    id: app.id,
    label: surfaceCopy?.title || app.label,
    route: app.route,
    type: 'app',
    dimensionId: app.dimensionId,
    topicAreaId: app.topicAreaId || null,
    surfaceKind: app.surfaceKind || 'app',
    status: app.status
  };
}

function getDashboardOrderedDimensionSurfaces() {
  return DIMENSION_REGISTRY
    .filter((dimension) => dimension.surfaceFlags?.includeInDashboard)
    .map((dimension) => ({
      ...buildDimensionSurfaceEntry(dimension),
      navigationOrder: dimension.surfaceFlags?.navigationOrder ?? 999
    }))
    .sort((left, right) => left.navigationOrder - right.navigationOrder);
}

function getSystemSurfaceById(surfaceId) {
  return FRONTEND_OS_SYSTEM_SURFACES.find((surface) => surface.id === surfaceId) || null;
}

function getAppSurfaceById(surfaceId) {
  const app = APP_MANIFEST.find((item) => item.id === surfaceId);
  return app ? buildAppSurfaceEntry(app) : null;
}

function getDimensionSurfaceById(surfaceId) {
  const dimension = getDimensionById(surfaceId);
  return dimension ? buildDimensionSurfaceEntry(dimension) : null;
}

function getCoreEntrySurface() {
  const coreDimension = getDimensionById(FRONTEND_OS_ENTRY_DIMENSION_ID);
  return getAppSurfaceById(coreDimension?.defaultApp || 'numerology');
}

export function getDimensionSurfaceModel(dimensionId) {
  const dimension = getDimensionById(dimensionId);
  if (!dimension) return null;

  const dimensionBlueprint = buildDimensionBlueprint(dimensionId);
  const dimensionContent = buildDimensionContentBundle(dimensionId);

  const apps = APP_MANIFEST
    .filter((app) => app.dimensionId === dimensionId)
    .map((app) => ({
      id: app.id,
      label: app.label,
      route: app.route,
      icon: app.icon,
      status: app.status,
      topicAreaId: app.topicAreaId || null,
      surfaceKind: app.surfaceKind || 'app',
      copy: buildSurfaceCopyBundle(app.id),
      blueprint: buildSurfaceBlueprint(app.id),
      includeInNavigation: Boolean(app.surfaceFlags?.includeInNavigation),
      includeInDashboard: Boolean(app.surfaceFlags?.includeInDashboard)
    }));

  const topicAreas = getTopicAreasByDimensionId(dimensionId).map((topicArea) => ({
    ...topicArea,
    apps: apps.filter((app) => app.topicAreaId === topicArea.id)
  }));

  const standaloneApps = apps.filter((app) => !app.topicAreaId);

  return {
    id: dimension.id,
    publicLabel: dimension.publicLabel,
    route: getDimensionRoute(dimension.id),
    description: dimension.description,
    content: dimensionContent,
    blueprint: dimensionBlueprint,
    defaultApp: dimension.defaultApp,
    topicAreas,
    standaloneApps,
    apps,
    visibleApps: apps.filter((app) => app.includeInNavigation || app.includeInDashboard)
  };
}

export function getAllDimensionSurfaceModels() {
  return DIMENSION_REGISTRY.map((dimension) => getDimensionSurfaceModel(dimension.id));
}

export function getFrontendProductJourney() {
  const entrySurface = getCoreEntrySurface();
  const hubSurface = getSystemSurfaceById('dashboard');
  const dashboardDimensions = getDashboardOrderedDimensionSurfaces();
  const dashboardNextSurface =
    dashboardDimensions.find((surface) => surface.id !== FRONTEND_OS_ENTRY_DIMENSION_ID) || dashboardDimensions[0] || null;

  return {
    entrySurface,
    hubSurface,
    dashboardNextSurface,
    dashboardDimensionSurfaces: dashboardDimensions
  };
}

function getDimensionPrimaryTarget(dimensionId) {
  const model = getDimensionSurfaceModel(dimensionId);
  if (!model) return null;

  const topicAreaTarget = model.topicAreas
    .map((topicArea) => getAppSurfaceById(topicArea.defaultSurfaceId))
    .find(Boolean);

  if (topicAreaTarget) {
    return topicAreaTarget;
  }

  if (model.standaloneApps.length) {
    return getAppSurfaceById(model.standaloneApps[0].id);
  }

  return getAppSurfaceById(model.defaultApp);
}

export function getSurfaceJourney(surfaceId = 'home') {
  const journey = getFrontendProductJourney();
  const currentSurface =
    getSystemSurfaceById(surfaceId) ||
    getDimensionSurfaceById(surfaceId) ||
    getAppSurfaceById(surfaceId);

  if (!currentSurface) return null;

  if (surfaceId === 'home') {
    return {
      currentSurface,
      primaryTarget: journey.entrySurface,
      secondaryTarget: journey.hubSurface,
      summary: `${journey.entrySurface?.label || 'Die Kernflaeche'} ist der kontrollierte Einstieg. Das Dashboard bleibt dein Hub fuer den naechsten Schritt.`
    };
  }

  if (surfaceId === 'dashboard') {
    return {
      currentSurface,
      primaryTarget: journey.dashboardNextSurface,
      secondaryTarget: journey.entrySurface,
      summary: `${journey.hubSurface?.label || 'Dashboard'} ist das operative Cockpit. Von hier geht der naechste Schritt in ${journey.dashboardNextSurface?.label || 'die naechste Dimension'}.`
    };
  }

  if (surfaceId === journey.entrySurface?.id) {
    const dimensionSurface = getDimensionSurfaceById(journey.entrySurface.dimensionId);
    return {
      currentSurface,
      primaryTarget: dimensionSurface || journey.hubSurface,
      secondaryTarget: journey.hubSurface,
      summary: `${journey.entrySurface.label} bleibt die Kernflaeche. Der saubere Rueckweg fuehrt zuerst in ${dimensionSurface?.label || 'die zugehoerige Dimension'} und danach ins Dashboard.`
    };
  }

  if (currentSurface.type === 'dimension') {
    const primaryTarget = getDimensionPrimaryTarget(surfaceId);
    return {
      currentSurface,
      primaryTarget: primaryTarget || journey.hubSurface,
      secondaryTarget: primaryTarget ? journey.hubSurface : journey.entrySurface,
      summary: primaryTarget
        ? `${currentSurface.label} ist dein Arbeitsraum. Von hier geht es direkt weiter in ${primaryTarget.label}.`
        : `${currentSurface.label} ist als Dimensions-Hub angelegt. Inhalte folgen spaeter, der Rueckweg bleibt ueber das Dashboard stabil.`
    };
  }

  if (currentSurface.type === 'app') {
    const owningDimension = getDimensionSurfaceById(currentSurface.dimensionId);
    return {
      currentSurface,
      primaryTarget: owningDimension || journey.hubSurface,
      secondaryTarget: journey.hubSurface,
      summary: `${currentSurface.label} liegt in ${owningDimension?.label || 'seiner Dimension'}. Der saubere Rueckweg fuehrt zuerst in die Dimension und danach ins Dashboard.`
    };
  }

  return {
    currentSurface,
    primaryTarget: journey.hubSurface,
    secondaryTarget: journey.entrySurface,
    summary: `Von ${currentSurface.label} geht der kontrollierte Rueckweg ins Dashboard. Die Kernflaeche bleibt ${journey.entrySurface?.label || 'die Einstiegssurface'}.`
  };
}

export function getFrontendSurfaceCatalog() {
  return {
    systemSurfaces: getFrontendOsSystemSurfaces(),
    appSurfaces: APP_MANIFEST.map((app) => buildAppSurfaceEntry(app)),
    topicAreas: TOPIC_AREA_REGISTRY.map((topicArea) => ({
      id: topicArea.id,
      label: topicArea.publicLabel,
      type: 'topic_area',
      dimensionId: topicArea.dimensionId,
      defaultSurfaceId: topicArea.defaultSurfaceId
    })),
    dimensionViews: DIMENSION_REGISTRY.map((dimension) => buildDimensionSurfaceEntry(dimension)),
    exportEntrypoints: getFrontendOsExportEntrypoints(),
    journey: getFrontendProductJourney()
  };
}
