// NOTE: dimensions/*/metadata.json are static mirrors.
// This DIMENSION_REGISTRY is the primary runtime truth for navigation, routing, and surface discovery.
// Any changes to dimensions should first be made here, then reflected in metadata.json if needed.

export const DIMENSION_REGISTRY = Object.freeze([
  {
    id: 'zeit',
    publicLabel: 'Zeit',
    description: 'Kalender, Tagesplanung, Lebenszeit-Management und den eigenen operativen Rhythmus ordnen.',
    accessRules: { tier: 0 },
    pillarDependencies: ['frontend_os', 'oracle'],
    defaultApp: 'chronos',
    surfaceFlags: {
      includeInNavigation: true,
      includeInDashboard: true,
      navigationOrder: 10
    }
  },
  {
    id: 'geld',
    publicLabel: 'Geld',
    description: 'Einnahmen, Cashflow, Investments und strategischen Vermoegensaufbau fuehrbar machen.',
    accessRules: { tier: 0 },
    pillarDependencies: ['frontend_os', 'oracle', 'monetization'],
    defaultApp: 'finance',
    surfaceFlags: {
      includeInNavigation: true,
      includeInDashboard: true,
      navigationOrder: 20
    }
  },
  {
    id: 'physis',
    publicLabel: 'Physis',
    description: 'Koerperliche Leistungsfaehigkeit, Gesundheit, Ernaehrung und rohe Fitness als eigene Grundstruktur.',
    accessRules: { tier: 0 },
    pillarDependencies: ['frontend_os'],
    defaultApp: null,
    surfaceFlags: {
      includeInNavigation: false,
      includeInDashboard: false,
      navigationOrder: 30
    }
  },
  {
    id: 'geist',
    publicLabel: 'Geist',
    description: 'Psychologie, mentalen Fokus, Stressresistenz und generelles Mindset als eigenes Terrain halten.',
    accessRules: { tier: 0 },
    pillarDependencies: ['frontend_os'],
    defaultApp: null,
    surfaceFlags: {
      includeInNavigation: false,
      includeInDashboard: false,
      navigationOrder: 40
    }
  },
  {
    id: 'ausdruck',
    publicLabel: 'Ausdruck',
    description: 'Kreativen Output, Schreiben, Content-Erstellung und das Erschaffen von Dingen fokussieren.',
    accessRules: { tier: 0 },
    pillarDependencies: ['frontend_os', 'meta_generator'],
    defaultApp: null,
    surfaceFlags: {
      includeInNavigation: false,
      includeInDashboard: false,
      navigationOrder: 50
    }
  },
  {
    id: 'netzwerk',
    publicLabel: 'Netzwerk',
    description: 'Beziehungen, Partner-Synergien, Umfeld und nuetzliche Kontakte als eigene Surface-Ebene fuehren.',
    accessRules: { tier: 0 },
    pillarDependencies: ['frontend_os', 'oracle'],
    defaultApp: 'synergy',
    surfaceFlags: {
      includeInNavigation: false,
      includeInDashboard: false,
      navigationOrder: 60
    }
  },
  {
    id: 'energie',
    publicLabel: 'Energie',
    description: 'Schlaf, Regeneration, Burnout-Vermeidung und Batteriemanagement kanonisch abbilden.',
    accessRules: { tier: 0 },
    pillarDependencies: ['frontend_os'],
    defaultApp: null,
    surfaceFlags: {
      includeInNavigation: false,
      includeInDashboard: false,
      navigationOrder: 70
    }
  },
  {
    id: 'systeme',
    publicLabel: 'Systeme',
    description: 'Digitale Werkzeuge, KI-Agenten, Automatisierungen und Workflows als operative Schicht ordnen.',
    accessRules: { tier: 0 },
    pillarDependencies: ['frontend_os', 'meta_generator', 'oracle'],
    defaultApp: null,
    surfaceFlags: {
      includeInNavigation: false,
      includeInDashboard: false,
      navigationOrder: 80
    }
  },
  {
    id: 'raum',
    publicLabel: 'Raum',
    description: 'Physisches und digitales Cockpit von Schreibtisch bis Server-Umgebung als Dimension fuehren.',
    accessRules: { tier: 0 },
    pillarDependencies: ['frontend_os'],
    defaultApp: null,
    surfaceFlags: {
      includeInNavigation: false,
      includeInDashboard: false,
      navigationOrder: 90
    }
  },
  {
    id: 'muster',
    publicLabel: 'Muster',
    description: 'Taegliche Gewohnheiten, Routinen, Tracking und lesbare Profilsignaturen zusammenhalten.',
    accessRules: { tier: 0 },
    pillarDependencies: ['frontend_os', 'meta_generator', 'oracle'],
    defaultApp: 'numerology',
    surfaceFlags: {
      includeInNavigation: true,
      includeInDashboard: true,
      navigationOrder: 100
    }
  },
  {
    id: 'wachstum',
    publicLabel: 'Wachstum',
    description: 'Neue Skills, Research, Informationsbeschaffung und kontinuierliche Weiterentwicklung aufnehmen.',
    accessRules: { tier: 0 },
    pillarDependencies: ['frontend_os', 'meta_generator'],
    defaultApp: null,
    surfaceFlags: {
      includeInNavigation: false,
      includeInDashboard: false,
      navigationOrder: 110
    }
  }
]);

export function getDimensionById(dimensionId) {
  return DIMENSION_REGISTRY.find((dimension) => dimension.id === dimensionId) || null;
}
