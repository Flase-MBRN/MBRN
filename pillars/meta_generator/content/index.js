import { buildPillarCompletionBlueprint, getPillarStageSequence } from '../blueprints/index.js';

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
- dann erst die 4 Pillars fachlich auf echten Reifegrad ziehen

## Danach: Stage A - Pillars Completion
Reihenfolge:
${stageSequence}

Pillar-Regeln:
${blueprintRows}

Erwartung:
- klare Zuständigkeit
- aktive Module
- klare Contracts
- keine verteilte Schattenlogik außerhalb der Pillar-Zone

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
