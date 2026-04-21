import { describe, expect, test } from '@jest/globals';
import { getOracleArtifactById, ORACLE_ARTIFACTS } from '../pillars/oracle/artifacts.js';
import { summarizeOracleBacktest } from '../pillars/oracle/backtesting/index.js';
import { getOracleCapabilityById, ORACLE_CAPABILITY_MAP } from '../pillars/oracle/capability_map.js';
import { buildOracleFusion } from '../pillars/oracle/fusion/index.js';
import { getOracleProcessingManifest, listOracleProcessingJobs } from '../pillars/oracle/processing/index.js';
import { buildOracleSignals } from '../pillars/oracle/signals/index.js';
import { createOracleDashboardSnapshot } from '../pillars/oracle/snapshots/index.js';

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
    expect(listOracleProcessingJobs()).toContain('oracle_core');
    expect(manifest.find((job) => job.id === 'oracle_core')).toEqual(expect.objectContaining({
      outputs: [ORACLE_ARTIFACTS.predictionSnapshot.id]
    }));
    expect(manifest.find((job) => job.id === 'backfill_history')).toEqual(expect.objectContaining({
      outputs: [ORACLE_ARTIFACTS.backtestSnapshot.id]
    }));
  });

  test('oracle capability map documents pillar truth and pipeline adapter boundaries', () => {
    expect(ORACLE_CAPABILITY_MAP.map((capability) => capability.id)).toEqual([
      'browser_read',
      'processing',
      'fusion',
      'signals',
      'snapshots',
      'backtesting'
    ]);
    expect(getOracleCapabilityById('processing')).toEqual(expect.objectContaining({
      status: 'adapter_manifest',
      sourceOfTruth: 'scripts/oracle',
      uiRelevant: false
    }));
    expect(getOracleCapabilityById('snapshots')).toEqual(expect.objectContaining({
      status: 'active',
      sourceOfTruth: 'pillar',
      uiRelevant: true
    }));
  });

  test('oracle artifacts stay the canonical JS truth for pipeline-consumed snapshots', () => {
    expect(ORACLE_ARTIFACTS.predictionSnapshot).toEqual(expect.objectContaining({
      producer: 'scripts/oracle/oracle_core.py',
      consumer: 'pillars/oracle/browser_read/index.js',
      uiRelevant: true
    }));
    expect(getOracleArtifactById('backtest_snapshot')).toEqual(expect.objectContaining({
      path: '../../shared/data/oracle_backtest.json',
      producer: 'scripts/oracle/backfill_history.py'
    }));
  });
});
