import { getSurfaceCatalog } from './surface_catalog.js';

export function resolveSurfaceTarget(targetId) {
  const catalog = getSurfaceCatalog();

  return (
    catalog.systemSurfaces.find((surface) => surface.id === targetId) ||
    catalog.appSurfaces.find((surface) => surface.id === targetId) ||
    catalog.dimensionViews.find((surface) => surface.id === targetId) ||
    catalog.exportEntrypoints.find((surface) => surface.id === targetId) ||
    null
  );
}
