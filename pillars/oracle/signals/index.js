function toNumber(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function getBiasLabel(signal = 'neutral') {
  const text = String(signal).toLowerCase();
  if (text.includes('bull')) return 'bullish';
  if (text.includes('bear')) return 'bearish';
  return 'neutral';
}

export function buildOracleSignals(snapshot = {}) {
  const marketContext = snapshot.market_context || {};
  const prediction = snapshot.prediction || {};

  return {
    sentimentPrediction: toNumber(prediction.sentiment_prediction, 50),
    confidence: toNumber(prediction.confidence, 0),
    cryptoSentiment: toNumber(marketContext.crypto_sentiment, 50),
    newsBias: getBiasLabel(marketContext.news_signal),
    headlineCount: toNumber(marketContext.headline_count, 0),
    recommendation: String(prediction.trading_recommendation || 'Hold'),
    reasoning: String(prediction.reasoning || '')
  };
}
