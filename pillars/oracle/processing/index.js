import { ORACLE_ARTIFACTS } from '../artifacts.js';

export const ORACLE_PROCESSING_MANIFEST = Object.freeze([
  {
    id: 'oracle_core',
    path: 'scripts/oracle/oracle_core.py',
    responsibility: 'Generate next-day oracle predictions and dashboard snapshot artifacts.',
    outputs: [ORACLE_ARTIFACTS.predictionSnapshot.id]
  },
  {
    id: 'correlation_matrix',
    path: 'scripts/oracle/correlation_matrix.py',
    responsibility: 'Build numerology-market correlations and alignment scores.'
  },
  {
    id: 'data_bridge',
    path: 'scripts/oracle/data_bridge.py',
    responsibility: 'Load and merge upstream market and numerology data.'
  },
  {
    id: 'backfill_history',
    path: 'scripts/oracle/backfill_history.py',
    responsibility: 'Replay historical oracle predictions and backtesting artifacts.',
    outputs: [ORACLE_ARTIFACTS.backtestSnapshot.id]
  }
]);

export function getOracleProcessingManifest() {
  return ORACLE_PROCESSING_MANIFEST;
}

export function listOracleProcessingJobs() {
  return ORACLE_PROCESSING_MANIFEST.map((job) => job.id);
}
