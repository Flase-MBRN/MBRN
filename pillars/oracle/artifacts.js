const ORACLE_PREDICTION_SNAPSHOT_PATH = '../../shared/data/oracle_prediction.json';
const ORACLE_BACKTEST_SNAPSHOT_PATH = '../../shared/data/oracle_backtest.json';

export const ORACLE_ARTIFACTS = Object.freeze({
  mergedInputsArtifact: Object.freeze({
    id: 'merged_inputs_artifact',
    path: '../../shared/data/oracle_merged_inputs.json',
    producer: 'pillars/oracle/processing/index.js',
    consumer: 'pillars/oracle/processing/index.js',
    uiRelevant: false
  }),
  predictionSnapshot: Object.freeze({
    id: 'prediction_snapshot',
    path: ORACLE_PREDICTION_SNAPSHOT_PATH,
    producer: 'pillars/oracle/processing/python/prediction_pipeline.py',
    consumer: 'pillars/oracle/browser_read/index.js',
    uiRelevant: true
  }),
  backtestSnapshot: Object.freeze({
    id: 'backtest_snapshot',
    path: ORACLE_BACKTEST_SNAPSHOT_PATH,
    producer: 'pillars/oracle/processing/python/backfill_pipeline.py',
    consumer: 'pillars/oracle/backtesting/index.js',
    uiRelevant: true
  })
});

export function getOracleArtifactById(artifactId) {
  return Object.values(ORACLE_ARTIFACTS).find((artifact) => artifact.id === artifactId) || null;
}
