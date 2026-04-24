export function buildOracleFusion(snapshot = {}, signals = {}, backtestingSummary = {}) {
  const dayNumerology = snapshot.day_numerology || {};

  return {
    targetDate: snapshot.target_date || 'Nächster Handelstag',
    dayNumber: dayNumerology.day_number ?? null,
    dayDescription: dayNumerology.description || '',
    recommendation: signals.recommendation || 'Hold',
    confidence: signals.confidence ?? 0,
    sentimentPrediction: signals.sentimentPrediction ?? 50,
    cryptoSentiment: signals.cryptoSentiment ?? 50,
    newsBias: signals.newsBias || 'neutral',
    headlineCount: signals.headlineCount ?? 0,
    accuracyPct: Number(backtestingSummary.accuracyPct ?? 0)
  };
}
