import { validateOracleSnapshot } from '../../../shared/core/contracts/oracle_snapshot.js';
import { summarizeOracleBacktest } from '../backtesting/index.js';
import { buildOracleFusion } from '../fusion/index.js';
import { buildOracleSignals } from '../signals/index.js';

function toNumber(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

export function createOracleDashboardSnapshot(snapshot = {}, backtestPayload = {}) {
  const validation = validateOracleSnapshot(snapshot);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const marketContext = snapshot.market_context || {};
  const prediction = snapshot.prediction || {};
  const resolvedBacktestPayload = Object.keys(backtestPayload || {}).length > 0
    ? backtestPayload
    : snapshot.backtesting || {};
  const backtestingSummary = summarizeOracleBacktest(resolvedBacktestPayload);
  const signals = buildOracleSignals(snapshot);
  const fusion = buildOracleFusion(snapshot, signals, backtestingSummary);

  return {
    targetDate: fusion.targetDate,
    dayNumber: fusion.dayNumber,
    dayDescription: fusion.dayDescription,
    alignmentScore: toNumber(prediction.alignment_score, 0),
    confidence: fusion.confidence,
    accuracyPct: fusion.accuracyPct,
    sentimentPrediction: fusion.sentimentPrediction,
    tradingRecommendation: fusion.recommendation,
    reasoning: signals.reasoning,
    cryptoSentiment: fusion.cryptoSentiment,
    cryptoSnapshot: marketContext.crypto_snapshot || {},
    newsSignal: marketContext.news_signal || 'neutral',
    headlineCount: fusion.headlineCount,
    signals,
    fusion,
    backtestingSummary,
    raw: snapshot
  };
}
