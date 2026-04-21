const PILLAR_STAGE_SEQUENCE = Object.freeze([
  'frontend_os',
  'oracle',
  'monetization',
  'meta_generator'
]);

const DIMENSION_BLUEPRINTS = Object.freeze({
  growth: Object.freeze({
    id: 'growth',
    headline: 'Wachstum systemisch lesen',
    intent: 'Kapital, Fortschritt und messbare Entwicklung als klare Surface-Zone fuehrbar machen.',
    exportEntrypoints: ['asset_export'],
    primarySurfaceIds: ['finance']
  }),
  pattern: Object.freeze({
    id: 'pattern',
    headline: 'Muster sichtbar machen',
    intent: 'Profile, Signaturen und numerologische Muster als lesbare Surface-Familie ausspielen.',
    exportEntrypoints: ['share_export', 'pdf_export', 'asset_export'],
    primarySurfaceIds: ['numerology', 'synergy']
  }),
  time: Object.freeze({
    id: 'time',
    headline: 'Zeit als Surface organisieren',
    intent: 'Phasen, Timing und Zyklen in eine fokussierte Zeit-Surface ueberfuehren.',
    exportEntrypoints: [],
    primarySurfaceIds: ['chronos']
  }),
  signal: Object.freeze({
    id: 'signal',
    headline: 'Signale verdichten',
    intent: 'Oracle- und Markt-Signale als eigene Surface-Ebene beschreibbar machen.',
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
    dimensionId: 'growth',
    exportEntrypoints: ['asset_export'],
    narrativeTone: 'growth_story'
  }),
  numerology: Object.freeze({
    id: 'numerology',
    kind: 'app',
    dimensionId: 'pattern',
    exportEntrypoints: ['share_export', 'asset_export', 'pdf_export'],
    narrativeTone: 'pattern_story'
  }),
  chronos: Object.freeze({
    id: 'chronos',
    kind: 'app',
    dimensionId: 'time',
    exportEntrypoints: [],
    narrativeTone: 'timeline_story'
  }),
  synergy: Object.freeze({
    id: 'synergy',
    kind: 'app',
    dimensionId: 'pattern',
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
  status = 'stable',
  requiredCapabilities = []
} = {}) {
  const surfaceBlueprint = buildSurfaceBlueprint(appId);

  return {
    appId,
    displayName,
    route,
    dimensionId: dimensionId || surfaceBlueprint?.dimensionId || null,
    status,
    requiredCapabilities: [...requiredCapabilities],
    exports: [...(surfaceBlueprint?.exportEntrypoints || [])],
    blueprintVersion: '2.0.0'
  };
}
