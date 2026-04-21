import { buildPillarCompletionBlueprint, getPillarStageSequence } from '../blueprints/index.js';

const DIMENSION_CONTENT_BUNDLES = Object.freeze({
  growth: Object.freeze({
    dimensionId: 'growth',
    eyebrow: 'Dimension',
    title: 'Wachstum lesen',
    summary: 'Kapital, Fortschritt und Entwicklung in einer klaren Wachstumsflaeche.',
    cta: 'Zur Wachstumsflaeche'
  }),
  pattern: Object.freeze({
    dimensionId: 'pattern',
    eyebrow: 'Dimension',
    title: 'Muster erkennen',
    summary: 'Numerologie, Signaturen und Profile in einer lesbaren Musterflaeche.',
    cta: 'Zu den Mustern'
  }),
  time: Object.freeze({
    dimensionId: 'time',
    eyebrow: 'Dimension',
    title: 'Zeit ordnen',
    summary: 'Phasen, Timing und Zyklen als fokussierte Zeitflaeche.',
    cta: 'Zur Zeitflaeche'
  }),
  signal: Object.freeze({
    dimensionId: 'signal',
    eyebrow: 'Dimension',
    title: 'Signale verdichten',
    summary: 'Oracle- und Marktsignale werden als eigene Signalebene lesbar.',
    cta: 'Zu den Signalen'
  })
});

const SURFACE_COPY_BUNDLES = Object.freeze({
  home: Object.freeze({
    surfaceId: 'home',
    title: 'MBRN',
    subtitle: 'Die Oberflaeche fuer Muster, Wachstum und Zeit.',
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
    title: 'Wachstum',
    subtitle: 'So entwickelt sich dein Kapital ueber Zeit.',
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
    subtitle: 'Beziehungen, Dynamik und Resonanz als eigene Flaeche.',
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

  return `# 001 Post-v3 Roadmap

## Zweck

Diese Datei plant die Schritte **nach** dem Abschluss der v3-Plattformhaertung.

Sie ersetzt nicht die aktive \`000_MBRN_V3_100_PERCENT_CHECKLIST.md\`, sondern dokumentiert nur die naechsten Ausbaustufen auf der gehaerteten Plattformbasis.

Die einzige technische Wahrheit bleibt:

- \`C:\\DevLab\\MBRN-HUB-V1\`

## Nicht Teil dieser Datei

- keine offenen v3-Abschlussarbeiten
- keine offenen Architekturfragen
- kein Ersatz fuer die 100%-Checkliste
- keine Vorwegnahme einer 11-Dimensions-Runtime

## Jetzt

- Architecture Close-out Gate vollstaendig schliessen
- letzte aktive Legacy-Fassaden aus Runtime und Tests entfernen
- operative v3-Abnahme in \`000_MBRN_V3_100_PERCENT_CHECKLIST.md\` halten
- dann erst die 4 Pillars fachlich auf echten Reifegrad ziehen

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

## Spaeter: Stage B - Dimensions Expansion

- aktuelle 4 Dimensions bleiben bis dahin Runtime-Wahrheit
- 11-Dimensions-Welt erst nach stabilen Pillars
- interne IDs und oeffentliche Labels bleiben strikt getrennt

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
