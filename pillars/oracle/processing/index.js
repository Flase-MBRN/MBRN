import { ORACLE_ARTIFACTS } from '../artifacts.js';
import { writeOracleArtifacts } from './artifact_writer.js';
import { buildOracleMergedInputs } from './ingestion.js';
import { getOracleWorkerScript, runOraclePythonWorker } from './python_worker.js';

export const ORACLE_PROCESSING_MANIFEST = Object.freeze([
  {
    id: 'merged_inputs',
    runtime: 'js_service',
    owner: 'pillars/oracle/processing',
    publicEntry: 'pillars/oracle/processing/index.js',
    responsibility: 'Normalize market sentiment and numerology inputs into a pillar-owned Oracle ingestion model.',
    outputs: [ORACLE_ARTIFACTS.mergedInputsArtifact.id]
  },
  {
    id: 'oracle_prediction',
    runtime: 'python_worker',
    owner: 'pillars/oracle/processing/python/prediction_pipeline.py',
    publicEntry: 'pillars/oracle/processing/index.js',
    cliEntrypoint: 'scripts/oracle/oracle_core.py',
    responsibility: 'Generate next-day Oracle predictions and mirror the UI-relevant prediction snapshot.',
    outputs: [ORACLE_ARTIFACTS.predictionSnapshot.id, ORACLE_ARTIFACTS.backtestSnapshot.id]
  },
  {
    id: 'backfill_history',
    runtime: 'python_worker',
    owner: 'pillars/oracle/processing/python/backfill_pipeline.py',
    publicEntry: 'pillars/oracle/processing/index.js',
    cliEntrypoint: 'scripts/oracle/backfill_history.py',
    responsibility: 'Reconstruct historical market sentiment, replay Oracle history and refresh prediction artifacts.',
    outputs: [ORACLE_ARTIFACTS.backtestSnapshot.id, ORACLE_ARTIFACTS.predictionSnapshot.id]
  },
  {
    id: 'artifacts_writer',
    runtime: 'js_service',
    owner: 'pillars/oracle/processing',
    publicEntry: 'pillars/oracle/processing/index.js',
    responsibility: 'Persist pillar-owned Oracle artifacts into shared/data for browser and application consumption.'
  }
]);

export function getOracleProcessingManifest() {
  return ORACLE_PROCESSING_MANIFEST;
}

export function listOracleProcessingJobs() {
  return ORACLE_PROCESSING_MANIFEST.map((job) => job.id);
}

export function getOracleProcessingJob(jobId) {
  return ORACLE_PROCESSING_MANIFEST.find((job) => job.id === jobId) || null;
}

export async function runOraclePredictionJob(options = {}) {
  const runner = options.runner || runOraclePythonWorker;
  return runner('oracle_prediction', options);
}

export async function runOracleBackfillJob(options = {}) {
  const runner = options.runner || runOraclePythonWorker;
  return runner('backfill_history', options);
}

export { buildOracleMergedInputs, writeOracleArtifacts, getOracleWorkerScript };
