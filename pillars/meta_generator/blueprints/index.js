const PILLAR_STAGE_SEQUENCE = Object.freeze([
  'frontend_os',
  'oracle',
  'monetization',
  'meta_generator'
]);

const DIMENSION_BLUEPRINTS = Object.freeze({
  zeit: Object.freeze({
    id: 'zeit',
    headline: 'Zeit sauber organisieren',
    intent: 'Kalender, Lebenszeit, Phasen und Rhythmen als klare Zeit-Surface führbar machen.',
    exportEntrypoints: [],
    primarySurfaceIds: ['chronos']
  }),
  geld: Object.freeze({
    id: 'geld',
    headline: 'Geld steuerbar machen',
    intent: 'Vermögen, Cashflow und Oracle-nahe Signale als operative Geld-Zone führen.',
    exportEntrypoints: ['asset_export'],
    primarySurfaceIds: ['finance']
  }),
  physis: Object.freeze({
    id: 'physis',
    headline: 'Physis aufbauen',
    intent: 'Körperliche Leistung, Gesundheit und Fitness als spätere Surface-Familie vorbereiten.',
    exportEntrypoints: [],
    primarySurfaceIds: []
  }),
  geist: Object.freeze({
    id: 'geist',
    headline: 'Geist schärfen',
    intent: 'Mindset, Fokus und Stressresistenz als eigene geistige Surface-Zone vorbereiten.',
    exportEntrypoints: [],
    primarySurfaceIds: []
  }),
  ausdruck: Object.freeze({
    id: 'ausdruck',
    headline: 'Ausdruck in Systeme bringen',
    intent: 'Kreativen Output, Schreiben und sichtbare Produktion als spätere Surface-Familie vorbereiten.',
    exportEntrypoints: [],
    primarySurfaceIds: []
  }),
  netzwerk: Object.freeze({
    id: 'netzwerk',
    headline: 'Netzwerk lesbar machen',
    intent: 'Beziehungen, Resonanz und Synergien als eigene Netzwerk-Fläche ausspielen.',
    exportEntrypoints: [],
    primarySurfaceIds: ['synergy']
  }),
  energie: Object.freeze({
    id: 'energie',
    headline: 'Energie schützen',
    intent: 'Regeneration, Schlaf und Batteriemanagement als spätere Energie-Zone vorbereiten.',
    exportEntrypoints: [],
    primarySurfaceIds: []
  }),
  systeme: Object.freeze({
    id: 'systeme',
    headline: 'Systeme orchestrieren',
    intent: 'Werkzeuge, KI-Agenten und Automationen als System-Dimension ordnen.',
    exportEntrypoints: [],
    primarySurfaceIds: []
  }),
  raum: Object.freeze({
    id: 'raum',
    headline: 'Raum bewusst führen',
    intent: 'Physisches und digitales Cockpit als Surface-Zone vorbereiten.',
    exportEntrypoints: [],
    primarySurfaceIds: []
  }),
  muster: Object.freeze({
    id: 'muster',
    headline: 'Muster sichtbar machen',
    intent: 'Profile, Routinen und lesbare Muster mit optionalen Themenbereichen führen.',
    exportEntrypoints: ['share_export', 'pdf_export', 'asset_export'],
    primarySurfaceIds: ['numerology']
  }),
  wachstum: Object.freeze({
    id: 'wachstum',
    headline: 'Wachstum laufend erweitern',
    intent: 'Skills, Research und Weiterentwicklung als neue Growth-Dimension vorbereiten.',
    exportEntrypoints: [],
    primarySurfaceIds: []
  })
});

const SURFACE_BLUEPRINTS = Object.freeze({
  home: Object.freeze({
    id: 'home',
    kind: 'system',
    exportEntrypoints: [],
    narrativeTone: 'intro'
  }),
  dashboard: Object.freeze({
    id: 'dashboard',
    kind: 'system',
    exportEntrypoints: ['asset_export', 'pdf_export', 'share_export'],
    narrativeTone: 'summary'
  }),
  finance: Object.freeze({
    id: 'finance',
    kind: 'app',
    dimensionId: 'geld',
    topicAreaId: null,
    exportEntrypoints: ['asset_export'],
    narrativeTone: 'money_story'
  }),
  numerology: Object.freeze({
    id: 'numerology',
    kind: 'app',
    dimensionId: 'muster',
    topicAreaId: 'numerologie',
    exportEntrypoints: ['share_export', 'asset_export', 'pdf_export'],
    narrativeTone: 'pattern_story'
  }),
  chronos: Object.freeze({
    id: 'chronos',
    kind: 'app',
    dimensionId: 'zeit',
    topicAreaId: null,
    exportEntrypoints: [],
    narrativeTone: 'timeline_story'
  }),
  synergy: Object.freeze({
    id: 'synergy',
    kind: 'app',
    dimensionId: 'netzwerk',
    topicAreaId: null,
    exportEntrypoints: [],
    narrativeTone: 'connection_story'
  })
});

const EXPORT_BLUEPRINTS = Object.freeze({
  asset_export: Object.freeze({
    id: 'asset_export',
    formats: ['png'],
    supportedSurfaceIds: ['finance', 'numerology', 'dashboard']
  }),
  pdf_export: Object.freeze({
    id: 'pdf_export',
    formats: ['pdf'],
    supportedSurfaceIds: ['numerology', 'dashboard']
  }),
  share_export: Object.freeze({
    id: 'share_export',
    formats: ['png', 'share_intent'],
    supportedSurfaceIds: ['numerology', 'dashboard']
  })
});

export function getPillarStageSequence() {
  return [...PILLAR_STAGE_SEQUENCE];
}

export function buildPillarCompletionBlueprint(pillarId) {
  return {
    pillarId,
    outcome: 'real_runtime_substance',
    rules: [
      'clear_responsibility',
      'active_modules',
      'clear_contracts',
      'no_distributed_shadow_logic'
    ]
  };
}

export function buildDimensionBlueprint(dimensionId) {
  return DIMENSION_BLUEPRINTS[dimensionId] || null;
}

export function buildSurfaceBlueprint(surfaceId) {
  return SURFACE_BLUEPRINTS[surfaceId] || null;
}

export function buildExportBlueprint(exportId) {
  return EXPORT_BLUEPRINTS[exportId] || null;
}

export function buildAppBlueprint({
  appId,
  displayName = appId,
  route = `apps/${appId}/index.html`,
  dimensionId,
  topicAreaId = null,
  status = 'stable',
  surfaceKind = 'app',
  requiredCapabilities = []
} = {}) {
  const surfaceBlueprint = buildSurfaceBlueprint(appId);

  return {
    appId,
    displayName,
    route,
    dimensionId: dimensionId || surfaceBlueprint?.dimensionId || null,
    topicAreaId: topicAreaId || surfaceBlueprint?.topicAreaId || null,
    status,
    surfaceKind,
    requiredCapabilities: [...requiredCapabilities],
    exports: [...(surfaceBlueprint?.exportEntrypoints || [])],
    blueprintVersion: '2.0.0'
  };
}
