export const TOPIC_AREA_REGISTRY = Object.freeze([
  {
    id: 'oracle_signal',
    dimensionId: 'geld',
    publicLabel: 'Oracle & Signal',
    description: 'Markt-, Sentiment- und Oracle-Signale als Geld-Unterthema führen.',
    defaultSurfaceId: 'oracle_signal',
    route: 'dimensions/geld/oracle_signal/index.html'
  },
  {
    id: 'numerologie',
    dimensionId: 'muster',
    publicLabel: 'Numerologie',
    description: 'Numerologische Profile und Signaturen als eigener Muster-Bereich.',
    defaultSurfaceId: 'numerology'
  },
  {
    id: 'astrologie',
    dimensionId: 'muster',
    publicLabel: 'Astrologie',
    description: 'Späterer Muster-Bereich für astrologische Deutung und Surface-Zuschnitt.',
    defaultSurfaceId: null
  },
  {
    id: 'persoenlichkeiten',
    dimensionId: 'muster',
    publicLabel: 'Persönlichkeiten',
    description: 'Späterer Muster-Bereich für Typologien und persönlichkeitsnahe Modelle.',
    defaultSurfaceId: null
  }
]);

export function getTopicAreaById(topicAreaId) {
  return TOPIC_AREA_REGISTRY.find((topicArea) => topicArea.id === topicAreaId) || null;
}

export function getTopicAreasByDimensionId(dimensionId) {
  return TOPIC_AREA_REGISTRY.filter((topicArea) => topicArea.dimensionId === dimensionId);
}
