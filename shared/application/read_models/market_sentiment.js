import { getSupabaseClient } from '../../../bridges/supabase/client.js';
import { readMarketSentimentSnapshot } from '../../../bridges/python/market_sentiment_reader.js';

function getVerdictLabel(score, label = '') {
  if (label) return label;
  if (score >= 81) return 'Sehr optimistisch';
  if (score >= 61) return 'Optimistisch';
  if (score >= 41) return 'Neutral';
  if (score >= 21) return 'Vorsichtig';
  return 'Sehr vorsichtig';
}

export function normalizeMarketSentiment(payload = {}) {
  const sentimentScore = Math.round(Number(payload.sentiment_score ?? 50));
  return {
    sentiment_score: sentimentScore,
    verdict: getVerdictLabel(sentimentScore, payload.verdict || payload.sentiment_label),
    confidence: Number(payload.confidence ?? 0),
    analysis: String(payload.analysis || ''),
    recommendation: String(payload.recommendation || ''),
    crypto_bias: String(payload.crypto_bias || ''),
    news_bias: String(payload.news_bias || ''),
    market_data: Array.isArray(payload.market_data) ? payload.market_data : [],
    source: payload.source || 'unknown',
    timestamp_utc: payload.timestamp_utc || null
  };
}

export async function readLatestMarketSentiment() {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('market_sentiment')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        return { success: true, data: normalizeMarketSentiment(data), source: 'supabase' };
      }
    } catch {
      // Fall through to local snapshot.
    }
  }

  const result = await readMarketSentimentSnapshot();
  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true, data: normalizeMarketSentiment(result.data), source: 'local_snapshot' };
}

export function subscribeMarketSentiment(onUpdate) {
  const client = getSupabaseClient();
  if (!client || typeof onUpdate !== 'function') {
    return () => {};
  }

  const channel = client
    .channel('market_sentiment')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'market_sentiment' },
      (payload) => onUpdate(normalizeMarketSentiment(payload.new))
    )
    .subscribe();

  return () => {
    if (typeof channel?.unsubscribe === 'function') {
      channel.unsubscribe();
    }
  };
}

