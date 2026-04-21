import { describe, expect, test } from '@jest/globals';
import fs from 'node:fs';
import path from 'node:path';
import { getOracleArtifactById, ORACLE_ARTIFACTS, resolveOracleArtifactUrl } from '../pillars/oracle/artifacts.js';
import { summarizeOracleBacktest } from '../pillars/oracle/backtesting/index.js';
import { getOracleCapabilityById, ORACLE_CAPABILITY_MAP } from '../pillars/oracle/capability_map.js';
import { buildOracleFusion } from '../pillars/oracle/fusion/index.js';
import {
  buildOracleMergedInputs,
  getOracleProcessingManifest,
  getOracleWorkerScript,
  listOracleProcessingJobs,
  runOracleBackfillJob,
  runOraclePredictionJob
} from '../pillars/oracle/processing/index.js';
import { buildOracleSignals } from '../pillars/oracle/signals/index.js';
import { createOracleDashboardSnapshot } from '../pillars/oracle/snapshots/index.js';

const REPO_ROOT = process.cwd();

describe('oracle pillar modules', () => {
  test('signals and fusion produce stable oracle-facing summaries', () => {
    const snapshot = {
      target_date: '21.04.2026',
      day_numerology: { day_number: 8, description: 'Macht' },
      market_context: {
        crypto_sentiment: 59.32,
        news_signal: 'neutral',
        headline_count: 10
      },
      prediction: {
        confidence: 0.63,
        sentiment_prediction: 65.5,
        trading_recommendation: 'Hold',
        reasoning: 'Balanced setup'
      },
      backtesting: {}
    };

    const signals = buildOracleSignals(snapshot);
    const fusion = buildOracleFusion(snapshot, signals, { accuracyPct: 97.26 });

    expect(signals).toEqual(expect.objectContaining({
      confidence: 0.63,
      sentimentPrediction: 65.5,
      cryptoSentiment: 59.32,
      newsBias: 'neutral'
    }));
    expect(fusion).toEqual(expect.objectContaining({
      targetDate: '21.04.2026',
      dayNumber: 8,
      recommendation: 'Hold',
      accuracyPct: 97.26
    }));
  });

  test('snapshot creation keeps dashboard data contract stable', () => {
    const snapshot = createOracleDashboardSnapshot({
      target_date: '21.04.2026',
      day_numerology: { day_number: 8, description: 'Macht' },
      market_context: {
        crypto_sentiment: 59.32,
        crypto_snapshot: { 'BTC-USD': { change_percent: 2.32 } },
        news_signal: 'neutral',
        headline_count: 10
      },
      prediction: {
        alignment_score: 63.49,
        confidence: 0.63,
        sentiment_prediction: 65.5,
        trading_recommendation: 'Hold',
        reasoning: 'Balanced setup'
      },
      backtesting: {
        accuracy_pct: 97.26
      }
    });

    expect(snapshot).toEqual(expect.objectContaining({
      targetDate: '21.04.2026',
      dayNumber: 8,
      alignmentScore: 63.49,
      accuracyPct: 97.26,
      tradingRecommendation: 'Hold'
    }));
  });

  test('backtesting and processing modules expose real pillar services', () => {
    const summary = summarizeOracleBacktest({
      updated_at: '2026-04-20T22:01:05.355539+00:00',
      history: [
        { was_correct: true },
        { was_correct: false },
        { was_correct: true }
      ]
    });

    expect(summary).toEqual(expect.objectContaining({
      evaluatedCount: 3,
      correctCount: 2,
      accuracyPct: expect.any(Number)
    }));
    const manifest = getOracleProcessingManifest();
    expect(manifest).toHaveLength(4);
    expect(listOracleProcessingJobs()).toEqual([
      'merged_inputs',
      'oracle_prediction',
      'backfill_history',
      'artifacts_writer'
    ]);
    expect(manifest.find((job) => job.id === 'oracle_prediction')).toEqual(expect.objectContaining({
      runtime: 'python_worker',
      owner: 'pillars/oracle/processing/python/prediction_pipeline.py',
      outputs: [ORACLE_ARTIFACTS.predictionSnapshot.id, ORACLE_ARTIFACTS.backtestSnapshot.id]
    }));
    expect(manifest.find((job) => job.id === 'backfill_history')).toEqual(expect.objectContaining({
      runtime: 'python_worker',
      owner: 'pillars/oracle/processing/python/backfill_pipeline.py',
      outputs: [ORACLE_ARTIFACTS.backtestSnapshot.id, ORACLE_ARTIFACTS.predictionSnapshot.id]
    }));
  });

  test('oracle capability map documents pillar truth and active processing ownership', () => {
    expect(ORACLE_CAPABILITY_MAP.map((capability) => capability.id)).toEqual([
      'browser_read',
      'processing',
      'fusion',
      'signals',
      'snapshots',
      'backtesting'
    ]);
    expect(getOracleCapabilityById('processing')).toEqual(expect.objectContaining({
      status: 'active',
      sourceOfTruth: 'pillar',
      uiRelevant: false,
      runtime: 'python_worker'
    }));
    expect(getOracleCapabilityById('snapshots')).toEqual(expect.objectContaining({
      status: 'active',
      sourceOfTruth: 'pillar',
      uiRelevant: true
    }));
  });

  test('oracle artifacts stay the canonical JS truth for pillar-owned processing outputs', () => {
    expect(ORACLE_ARTIFACTS.mergedInputsArtifact).toEqual(expect.objectContaining({
      producer: 'pillars/oracle/processing/index.js',
      uiRelevant: false
    }));
    expect(ORACLE_ARTIFACTS.predictionSnapshot).toEqual(expect.objectContaining({
      producer: 'pillars/oracle/processing/python/prediction_pipeline.py',
      consumer: 'pillars/oracle/browser_read/index.js',
      uiRelevant: true
    }));
    expect(getOracleArtifactById('backtest_snapshot')).toEqual(expect.objectContaining({
      path: '../../shared/data/oracle_backtest.json',
      producer: 'pillars/oracle/processing/python/backfill_pipeline.py'
    }));
  });

  test('oracle artifact URLs resolve against the pillar module, not the current page path', () => {
    const predictionUrl = resolveOracleArtifactUrl(ORACLE_ARTIFACTS.predictionSnapshot.path);
    const backtestUrl = resolveOracleArtifactUrl(ORACLE_ARTIFACTS.backtestSnapshot.path);

    expect(predictionUrl).toContain('/shared/data/oracle_prediction.json');
    expect(backtestUrl).toContain('/shared/data/oracle_backtest.json');
    expect(predictionUrl).not.toContain('/dashboard/shared/data');
    expect(backtestUrl).not.toContain('/dashboard/shared/data');
  });

  test('processing API exposes ingestion and worker orchestration hooks', async () => {
    const mergedInputs = await buildOracleMergedInputs({
      marketSentimentSnapshot: {
        timestamp_utc: '2026-04-21T10:06:37.221826+00:00',
        sentiment_score: 55,
        sentiment_label: 'Neutral',
        confidence: 0.8,
        recommendation: 'hold',
        crypto_bias: 'bullish',
        news_bias: 'neutral',
        news_impact: 20,
        market_data: [
          { ticker: 'BTC-USD', price: 1, change_percent: 3.2, volume: 10 },
          { ticker: 'ETH-USD', price: 2, change_percent: 1.1, volume: 20 }
        ],
        news_feed: [{ title: 'Calm market' }]
      },
      numerologyHistory: [
        { date: '21.04.2026', date_utc: '2026-04-21T00:00:00Z', day_number: 8, is_master: false, description: 'Macht' }
      ]
    });

    expect(mergedInputs).toEqual(expect.objectContaining({
      marketSentiment: expect.objectContaining({
        sentimentScore: 55,
        cryptoSnapshot: expect.objectContaining({
          'BTC-USD': expect.any(Object)
        })
      }),
      numerologyHistory: [
        expect.objectContaining({ date: '21.04.2026', dayNumber: 8 })
      ]
    }));

    expect(getOracleWorkerScript('oracle_prediction')).toBe('scripts/oracle/oracle_core.py');
    expect(getOracleWorkerScript('backfill_history')).toBe('scripts/oracle/backfill_history.py');

    const predictionRun = await runOraclePredictionJob({
      runner: async (jobId) => ({ success: true, jobId, simulated: true })
    });
    const backfillRun = await runOracleBackfillJob({
      runner: async (jobId) => ({ success: true, jobId, simulated: true })
    });

    expect(predictionRun).toEqual({ success: true, jobId: 'oracle_prediction', simulated: true });
    expect(backfillRun).toEqual({ success: true, jobId: 'backfill_history', simulated: true });
  });

  test('active oracle zones use synchronized README markers instead of NOT_IMPLEMENTED', () => {
    ORACLE_CAPABILITY_MAP.forEach((capability) => {
      const zoneDir = path.join(REPO_ROOT, 'pillars', 'oracle', capability.id);
      const readmePath = path.join(zoneDir, 'README.md');
      const notImplementedPath = path.join(zoneDir, 'NOT_IMPLEMENTED.md');

      expect(fs.existsSync(readmePath)).toBe(true);
      expect(fs.existsSync(notImplementedPath)).toBe(false);
    });
  });

  test('scripts/oracle entry files are thin wrappers around pillar-owned processing modules', () => {
    [
      'scripts/oracle/oracle_core.py',
      'scripts/oracle/backfill_history.py',
      'scripts/oracle/data_bridge.py',
      'scripts/oracle/correlation_matrix.py',
      'scripts/oracle/numerology_engine.py'
    ].forEach((relativePath) => {
      const filePath = path.join(REPO_ROOT, relativePath);
      const source = fs.readFileSync(filePath, 'utf8');

      expect(source).toContain('pillars.oracle.processing.python');
    });
  });
});
