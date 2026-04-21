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

export function getFrontendSurfaceCatalog() {
  return {
    systemSurfaces: getFrontendOsSystemSurfaces(),
    appSurfaces: APP_MANIFEST.map((app) => ({
      id: app.id,
      label: app.label,
      route: app.route,
      type: 'app',
      dimensionId: app.dimensionId,
      status: app.status
    })),
    dimensionViews: DIMENSION_REGISTRY.map((dimension) => ({
      id: dimension.id,
      label: dimension.publicLabel,
      type: 'dimension',
      defaultApp: dimension.defaultApp,
      content: buildDimensionContentBundle(dimension.id),
      blueprint: buildDimensionBlueprint(dimension.id)
    })),
    exportEntrypoints: getFrontendOsExportEntrypoints()
  };
}
