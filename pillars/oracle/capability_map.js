export const ORACLE_CAPABILITY_MAP = Object.freeze([
  {
    id: 'browser_read',
    status: 'active',
    publicEntry: 'pillars/oracle/browser_read/index.js',
    sourceOfTruth: 'pillar',
    uiRelevant: true
  },
  {
    id: 'processing',
    status: 'adapter_manifest',
    publicEntry: 'pillars/oracle/processing/index.js',
    sourceOfTruth: 'scripts/oracle',
    uiRelevant: false
  },
  {
    id: 'fusion',
    status: 'active',
    publicEntry: 'pillars/oracle/fusion/index.js',
    sourceOfTruth: 'pillar',
    uiRelevant: true
  },
  {
    id: 'signals',
    status: 'active',
    publicEntry: 'pillars/oracle/signals/index.js',
    sourceOfTruth: 'pillar',
    uiRelevant: true
  },
  {
    id: 'snapshots',
    status: 'active',
    publicEntry: 'pillars/oracle/snapshots/index.js',
    sourceOfTruth: 'pillar',
    uiRelevant: true
  },
  {
    id: 'backtesting',
    status: 'active',
    publicEntry: 'pillars/oracle/backtesting/index.js',
    sourceOfTruth: 'pillar',
    uiRelevant: true
  }
]);

export function getOracleCapabilityById(capabilityId) {
  return ORACLE_CAPABILITY_MAP.find((capability) => capability.id === capabilityId) || null;
}
