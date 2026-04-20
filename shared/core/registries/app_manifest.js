export const APP_MANIFEST = Object.freeze([
  {
    id: 'finance',
    label: 'Geld',
    route: 'apps/finance/index.html',
    icon: 'G',
    dimensionId: 'growth',
    requiredCapabilities: [],
    status: 'stable',
    surfaceFlags: {
      includeInNavigation: true,
      includeInDashboard: true
    }
  },
  {
    id: 'numerology',
    label: 'Zahlen',
    route: 'apps/numerology/index.html',
    icon: 'Z',
    dimensionId: 'pattern',
    requiredCapabilities: [],
    status: 'stable',
    surfaceFlags: {
      includeInNavigation: true,
      includeInDashboard: true
    }
  },
  {
    id: 'chronos',
    label: 'Zeit',
    route: 'apps/chronos/index.html',
    icon: 'T',
    dimensionId: 'time',
    requiredCapabilities: [],
    status: 'stable',
    surfaceFlags: {
      includeInNavigation: true,
      includeInDashboard: true
    }
  },
  {
    id: 'synergy',
    label: 'Vibe Check',
    route: 'apps/synergy/index.html',
    icon: 'V',
    dimensionId: 'pattern',
    requiredCapabilities: [],
    status: 'provisional',
    surfaceFlags: {
      includeInNavigation: false,
      includeInDashboard: false
    }
  }
]);

export function getAppManifestById(appId) {
  return APP_MANIFEST.find((app) => app.id === appId) || null;
}
