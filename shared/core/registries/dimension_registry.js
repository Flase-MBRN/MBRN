// NOTE: dimensions/*/metadata.json are static mirrors.
// This DIMENSION_REGISTRY is the primary runtime truth for navigation, routing, and surface discovery.
// Any changes to dimensions should first be made here, then reflected in metadata.json if needed.

export const DIMENSION_REGISTRY = Object.freeze([
  {
    id: 'growth',
    publicLabel: 'Wachstum',
    description: 'Kapital, Entwicklung und messbares Vorankommen.',
    accessRules: { tier: 0 },
    pillarDependencies: ['frontend_os', 'oracle', 'monetization'],
    defaultApp: 'finance',
    surfaceFlags: {
      includeInNavigation: true,
      includeInDashboard: true,
      navigationOrder: 10
    }
  },
  {
    id: 'pattern',
    publicLabel: 'Muster',
    description: 'Numerologie, Profile und wiederkehrende Signaturen.',
    accessRules: { tier: 0 },
    pillarDependencies: ['frontend_os', 'meta_generator', 'oracle'],
    defaultApp: 'numerology',
    surfaceFlags: {
      includeInNavigation: true,
      includeInDashboard: true,
      navigationOrder: 20
    }
  },
  {
    id: 'time',
    publicLabel: 'Zeit',
    description: 'Phasen, Zyklen und zeitliche Einordnung.',
    accessRules: { tier: 0 },
    pillarDependencies: ['frontend_os', 'oracle'],
    defaultApp: 'chronos',
    surfaceFlags: {
      includeInNavigation: true,
      includeInDashboard: true,
      navigationOrder: 30
    }
  },
  {
    id: 'signal',
    publicLabel: 'Signal',
    description: 'Markt- und Oracle-Signale als eigene Oberfläche.',
    accessRules: { tier: 0 },
    pillarDependencies: ['frontend_os', 'oracle'],
    defaultApp: null,
    surfaceFlags: {
      includeInNavigation: false,
      includeInDashboard: false,
      navigationOrder: 40
    }
  }
]);

export function getDimensionById(dimensionId) {
  return DIMENSION_REGISTRY.find((dimension) => dimension.id === dimensionId) || null;
}
