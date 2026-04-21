import { APP_MANIFEST } from '../../core/registries/app_manifest.js';
import { DIMENSION_REGISTRY, getDimensionById } from '../../core/registries/dimension_registry.js';
import {
  buildDimensionBlueprint,
  buildSurfaceBlueprint
} from '../../../pillars/meta_generator/blueprints/index.js';
import {
  buildDimensionContentBundle,
  buildSurfaceCopyBundle
} from '../../../pillars/meta_generator/content/index.js';

const FRONTEND_OS_ENTRY_DIMENSION_ID = 'pattern';

const FRONTEND_OS_SYSTEM_SURFACES = Object.freeze([
  { id: 'home', label: 'Start', route: 'index.html', type: 'system' },
  { id: 'dashboard', label: 'Dashboard', route: 'dashboard/index.html', type: 'system' }
]);

const FRONTEND_OS_EXPORT_ENTRYPOINTS = Object.freeze([
  { id: 'asset_export', label: 'Asset Export', type: 'export' },
  { id: 'pdf_export', label: 'PDF Export', type: 'export' },
  { id: 'share_export', label: 'Share Export', type: 'export' }
]);

export function getFrontendOsSystemSurfaces() {
  return [...FRONTEND_OS_SYSTEM_SURFACES];
}

export function getFrontendOsExportEntrypoints() {
  return [...FRONTEND_OS_EXPORT_ENTRYPOINTS];
}

function buildAppSurfaceEntry(app) {
  const surfaceCopy = buildSurfaceCopyBundle(app.id);

  return {
    id: app.id,
    label: surfaceCopy?.title || app.label,
    route: app.route,
    type: 'app',
    dimensionId: app.dimensionId,
    status: app.status
  };
}

function getDashboardOrderedAppSurfaces() {
  return APP_MANIFEST
    .filter((app) => app.surfaceFlags?.includeInDashboard)
    .map((app) => ({
      ...buildAppSurfaceEntry(app),
      navigationOrder: getDimensionById(app.dimensionId)?.surfaceFlags?.navigationOrder ?? 999
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
      copy: buildSurfaceCopyBundle(app.id),
      blueprint: buildSurfaceBlueprint(app.id),
      includeInNavigation: Boolean(app.surfaceFlags?.includeInNavigation),
      includeInDashboard: Boolean(app.surfaceFlags?.includeInDashboard)
    }));

  return {
    id: dimension.id,
    publicLabel: dimension.publicLabel,
    description: dimension.description,
    content: dimensionContent,
    blueprint: dimensionBlueprint,
    defaultApp: dimension.defaultApp,
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
  const dashboardApps = getDashboardOrderedAppSurfaces();
  const dashboardNextSurface =
    dashboardApps.find((surface) => surface.id !== entrySurface?.id) || dashboardApps[0] || null;

  return {
    entrySurface,
    hubSurface,
    dashboardNextSurface,
    dashboardAppSurfaces: dashboardApps
  };
}

export function getSurfaceJourney(surfaceId = 'home') {
  const journey = getFrontendProductJourney();
  const currentSurface = getSystemSurfaceById(surfaceId) || getAppSurfaceById(surfaceId);

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
      summary: `${journey.hubSurface?.label || 'Dashboard'} ist der Hub. Als naechste relevante Flaeche fuehrt der Strom in ${journey.dashboardNextSurface?.label || 'die naechste App'}.`
    };
  }

  if (surfaceId === journey.entrySurface?.id) {
    return {
      currentSurface,
      primaryTarget: journey.hubSurface,
      secondaryTarget: journey.dashboardNextSurface,
      summary: `${journey.entrySurface.label} bleibt die Kernflaeche. Der saubere Rueckweg fuehrt ins Dashboard und von dort weiter in ${journey.dashboardNextSurface?.label || 'die naechste Flaeche'}.`
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
    dimensionViews: DIMENSION_REGISTRY.map((dimension) => ({
      id: dimension.id,
      label: dimension.publicLabel,
      type: 'dimension',
      defaultApp: dimension.defaultApp,
      content: buildDimensionContentBundle(dimension.id),
      blueprint: buildDimensionBlueprint(dimension.id)
    })),
    exportEntrypoints: getFrontendOsExportEntrypoints(),
    journey: getFrontendProductJourney()
  };
}
