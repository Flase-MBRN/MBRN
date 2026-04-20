import { readOracleSnapshot } from '../../../bridges/python/oracle_snapshot_reader.js';

export function normalizeOracleDashboardSnapshot(snapshot = {}) {
  const prediction = snapshot.prediction || {};
  const marketContext = snapshot.market_context || {};
  const backtesting = snapshot.backtesting || {};

  return {
    targetDate: snapshot.target_date || 'Nächster Handelstag',
    dayNumber: snapshot.day_numerology?.day_number ?? null,
    dayDescription: snapshot.day_numerology?.description || '',
    alignmentScore: Number(prediction.alignment_score ?? 0),
    confidence: Number(prediction.confidence ?? 0),
    accuracyPct: Number(backtesting.accuracy_pct ?? prediction.oracle_accuracy ?? 0),
    sentimentPrediction: Number(prediction.sentiment_prediction ?? 50),
    tradingRecommendation: String(prediction.trading_recommendation || 'Hold'),
    reasoning: String(prediction.reasoning || ''),
    cryptoSentiment: Number(marketContext.crypto_sentiment ?? 50),
    cryptoSnapshot: marketContext.crypto_snapshot || {},
    newsSignal: String(marketContext.news_signal || 'neutral'),
    headlineCount: Number(marketContext.headline_count ?? 0),
    raw: snapshot
  };
}

export async function readOracleDashboardSnapshot() {
  const result = await readOracleSnapshot();
  if (!result.success) {
    return result;
  }

  return {
    success: true,
    data: normalizeOracleDashboardSnapshot(result.data)
  };
}

