import {
  normalizeMarketSentiment
} from '../shared/application/read_models/market_sentiment.js';
import {
  normalizeOracleDashboardSnapshot
} from '../shared/application/read_models/oracle_dashboard.js';

describe('application read models', () => {
  test('normalizeMarketSentiment returns a stable UI-safe shape', () => {
    const normalized = normalizeMarketSentiment({
      sentiment_score: 70,
      sentiment_label: 'Greed',
      confidence: 0.8,
      analysis: 'Mixed, but constructive',
      recommendation: 'hold',
      crypto_bias: 'bullish',
      news_bias: 'neutral',
      market_data: [{ ticker: 'BTC-USD' }],
      source: 'market_sentiment_pipeline',
      timestamp_utc: '2026-04-20T16:02:59.979269+00:00'
    });

    expect(normalized).toEqual({
      sentiment_score: 70,
      verdict: 'Greed',
      confidence: 0.8,
      analysis: 'Mixed, but constructive',
      recommendation: 'hold',
      crypto_bias: 'bullish',
      news_bias: 'neutral',
      market_data: [{ ticker: 'BTC-USD' }],
      source: 'market_sentiment_pipeline',
      timestamp_utc: '2026-04-20T16:02:59.979269+00:00'
    });
  });

  test('normalizeOracleDashboardSnapshot strips the raw oracle file down to a stable read model', () => {
    const normalized = normalizeOracleDashboardSnapshot({
      target_date: '21.04.2026',
      day_numerology: {
        day_number: 8,
        description: 'Macht'
      },
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
        reasoning: 'Balanced setup',
        oracle_accuracy: 97.26
      },
      backtesting: {
        accuracy_pct: 97.26
      }
    });

    expect(normalized).toEqual(expect.objectContaining({
      targetDate: '21.04.2026',
      dayNumber: 8,
      dayDescription: 'Macht',
      alignmentScore: 63.49,
      confidence: 0.63,
      accuracyPct: 97.26,
      sentimentPrediction: 65.5,
      tradingRecommendation: 'Hold',
      reasoning: 'Balanced setup',
      cryptoSentiment: 59.32,
      newsSignal: 'neutral',
      headlineCount: 10
    }));
  });
});

