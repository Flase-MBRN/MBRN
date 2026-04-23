import { buildPillarCompletionBlueprint, getPillarStageSequence } from '../blueprints/index.js';

const DIMENSION_CONTENT_BUNDLES = Object.freeze({
  zeit: Object.freeze({
    dimensionId: 'zeit',
    eyebrow: 'Dimension',
    title: 'Zeit ordnen',
    summary: 'Kalender, Phasen und Timing in einer fokussierten Zeitflaeche.',
    cta: 'Zur Zeitflaeche'
  }),
  geld: Object.freeze({
    dimensionId: 'geld',
    eyebrow: 'Dimension',
    title: 'Geld steuern',
    summary: 'Vermoegen, Cashflow und Signal-Lagen in einer lesbaren Geldflaeche.',
    cta: 'Zur Geldflaeche'
  }),
  physis: Object.freeze({
    dimensionId: 'physis',
    eyebrow: 'Dimension',
    title: 'Physis staerken',
    summary: 'Gesundheit, Leistung und rohe Fitness als spaetere Surface-Zone.',
    cta: 'Zur Physis'
  }),
  geist: Object.freeze({
    dimensionId: 'geist',
    eyebrow: 'Dimension',
    title: 'Geist schaerfen',
    summary: 'Fokus, Stressresistenz und mentale Fuehrung als eigene Surface-Zone.',
    cta: 'Zum Geist'
  }),
  ausdruck: Object.freeze({
    dimensionId: 'ausdruck',
    eyebrow: 'Dimension',
    title: 'Ausdruck entfalten',
    summary: 'Kreativer Output, Story und Content in einer eigenen Ausdrucks-Struktur.',
    cta: 'Zum Ausdruck'
  }),
  netzwerk: Object.freeze({
    dimensionId: 'netzwerk',
    eyebrow: 'Dimension',
    title: 'Netzwerk lesen',
    summary: 'Beziehungen, Synergien und Resonanz in einer lesbaren Netzwerkflaeche.',
    cta: 'Zum Netzwerk'
  }),
  energie: Object.freeze({
    dimensionId: 'energie',
    eyebrow: 'Dimension',
    title: 'Energie schuetzen',
    summary: 'Schlaf, Regeneration und Batteriemanagement als eigene Grundordnung.',
    cta: 'Zur Energie'
  }),
  systeme: Object.freeze({
    dimensionId: 'systeme',
    eyebrow: 'Dimension',
    title: 'Systeme fuehren',
    summary: 'Werkzeuge, KI-Agenten und Automationen in einer System-Dimension.',
    cta: 'Zu den Systemen'
  }),
  raum: Object.freeze({
    dimensionId: 'raum',
    eyebrow: 'Dimension',
    title: 'Raum ordnen',
    summary: 'Physisches und digitales Cockpit als sauber gefuehrte Surface-Zone.',
    cta: 'Zum Raum'
  }),
  muster: Object.freeze({
    dimensionId: 'muster',
    eyebrow: 'Dimension',
    title: 'Muster erkennen',
    summary: 'Numerologie, Routinen und lesbare Signaturen in einer Musterflaeche.',
    cta: 'Zu den Mustern'
  }),
  wachstum: Object.freeze({
    dimensionId: 'wachstum',
    eyebrow: 'Dimension',
    title: 'Wachstum kultivieren',
    summary: 'Skills, Research und kontinuierliche Weiterentwicklung als Dimension.',
    cta: 'Zum Wachstum'
  })
});

const SURFACE_COPY_BUNDLES = Object.freeze({
  home: Object.freeze({
    surfaceId: 'home',
    title: 'MBRN',
    subtitle: 'Der Hub fuer 11 Dimensionen, Themenbereiche und operative Surfaces.',
    cta: 'Starten'
  }),
  dashboard: Object.freeze({
    surfaceId: 'dashboard',
    title: 'Dashboard',
    subtitle: 'Alle aktiven Flaechen auf einen Blick.',
    cta: 'Uebersicht laden'
  }),
  finance: Object.freeze({
    surfaceId: 'finance',
    title: 'Geld',
    subtitle: 'So steuerst du Kapital, Cashflow und Vermoegen ueber Zeit.',
    cta: 'Szenario ansehen'
  }),
  numerology: Object.freeze({
    surfaceId: 'numerology',
    title: 'Muster',
    subtitle: 'Dein Profil, deine Signaturen, deine exportierbaren Muster.',
    cta: 'Profil lesen'
  }),
  chronos: Object.freeze({
    surfaceId: 'chronos',
    title: 'Zeit',
    subtitle: 'Zyklen, Phasen und Timing in einer Zeitleiste.',
    cta: 'Phasen lesen'
  }),
  synergy: Object.freeze({
    surfaceId: 'synergy',
    title: 'Vibe Check',
    subtitle: 'Beziehungen, Dynamik und Resonanz als Netzwerk-Flaeche.',
    cta: 'Verbindung lesen'
  })
});

const EXPORT_COPY_BUNDLES = Object.freeze({
  asset_export: Object.freeze({
    exportId: 'asset_export',
    title: 'Surface Asset',
    subtitle: 'Ein visuelles Artefakt fuer deine aktive Surface.',
    cta: 'Asset exportieren'
  }),
  pdf_export: Object.freeze({
    exportId: 'pdf_export',
    title: 'PDF Report',
    subtitle: 'Ein lesbarer Report fuer spaetere Referenz.',
    cta: 'PDF exportieren'
  }),
  share_export: Object.freeze({
    exportId: 'share_export',
    title: 'Share Card',
    subtitle: 'Ein kompaktes Bild fuer Teilen oder Download.',
    cta: 'Share Card erzeugen'
  })
});

export function buildPostV3RoadmapMarkdown() {
  const stageSequence = getPillarStageSequence()
    .map((pillar, index) => `${index + 1}. ${pillar}`)
    .join('\n');

  const blueprintRows = getPillarStageSequence()
    .map((pillar) => {
      const blueprint = buildPillarCompletionBlueprint(pillar);
      return `- \`${blueprint.pillarId}\`: ${blueprint.rules.join(', ')}`;
    })
    .join('\n');

  return `# 001 Post-v4 Roadmap

## Zweck

Diese Datei plant die Schritte **nach** dem Setzen der v4.0 Foundation.

Sie ersetzt nicht die historische \`000_MBRN_V3_100_PERCENT_CHECKLIST.md\`, sondern dokumentiert die naechsten Ausbaustufen auf der gehaerteten Foundation-Basis.

Die einzige technische Wahrheit bleibt:

- \`C:\\DevLab\\MBRN-HUB-V1\`

## Nicht Teil dieser Datei

- keine Rueckkehr zur 4-Dimensions-Wahrheit
- kein Ersatz fuer den aktiven Kanon
- keine Parallel-Realitaet neben \`000_CANONICAL_STATE.json\`

## Jetzt

- Kanon, Runtime, Metadaten und Supabase auf dieselbe 11-Dimensions-Wahrheit halten
- direkte und topic-area-basierte App-Zuordnungen ohne Routing-Bruch fuehren
- aktive Surfaces sauber den neuen Dimensionen zuordnen
- dann die 4 Pillars fachlich auf echten Reifegrad ziehen

## Danach: Stage A - Pillars Completion

Reihenfolge:

${stageSequence}

Pillar-Regeln:

${blueprintRows}

Erwartung:

- klare Zustaendigkeit
- aktive Module
- klare Contracts
- keine verteilte Schattenlogik ausserhalb der Pillar-Zone

## Spaeter: Stage B - Dimension Maturation

- 11 Dimensions bleiben Kanon und Runtime-Wahrheit
- topic_areas koennen pro Dimension wachsen, muessen aber nicht existieren
- Apps duerfen direkt unter der Dimension oder innerhalb einer topic_area haengen

## Spaeter: Stage C - App Review

Zu bewerten:

- dashboard
- finance
- numerology
- chronos
- synergy

Bewertung:

- keep
- rebuild
- merge
- archive

## Spaeter: Stage D - Monetization Evolution

- Premium Access
- Premium Depth
- API-Produkte
- Oracle-Produkte
- Generator-Produkte
- OS-/Workspace-Pro-Layer

## Spaeter: Stage E - OS Consolidation

- Dimension-Views
- App-Surfaces
- Export-Einstiege
- Discoverability
- Workspace-Komposition
`;
}

export function buildDimensionContentBundle(dimensionId) {
  return DIMENSION_CONTENT_BUNDLES[dimensionId] || null;
}

export function buildSurfaceCopyBundle(surfaceId) {
  return SURFACE_COPY_BUNDLES[surfaceId] || null;
}

export function buildExportCopyBundle(exportId) {
  return EXPORT_COPY_BUNDLES[exportId] || null;
}
