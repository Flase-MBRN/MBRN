export const APP_MANIFEST = Object.freeze([
  {
    id: 'finance',
    label: 'Geld',
    route: 'apps/finance/index.html',
    icon: 'G',
    dimensionId: 'geld',
    topicAreaId: null,
    surfaceKind: 'app',
    requiredCapabilities: [],
    status: 'stable',
    surfaceFlags: {
      includeInNavigation: true,
      includeInDashboard: true
    }
  },
  {
    id: 'numerology',
    label: 'Numerologie',
    route: 'apps/numerology/index.html',
    icon: 'N',
    dimensionId: 'muster',
    topicAreaId: 'numerologie',
    surfaceKind: 'app',
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
    dimensionId: 'zeit',
    topicAreaId: null,
    surfaceKind: 'app',
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
    dimensionId: 'netzwerk',
    topicAreaId: null,
    surfaceKind: 'app',
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
