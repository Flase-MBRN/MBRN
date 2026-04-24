import { supabaseBridge } from '../../../bridges/supabase/index.js';

function clampNumber(value, min, max, fallback) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return fallback;
  return Math.max(min, Math.min(max, numericValue));
}

export function normalizeGoldEnrichmentItem(item = {}) {
  return {
    id: String(item.id || ''),
    sourceFamily: String(item.source_family || 'unknown'),
    sourceName: String(item.source_name || 'unknown'),
    modelName: String(item.model_name || 'unknown'),
    analysisVersion: String(item.analysis_version || 'unknown'),
    summary: String(item.summary || '').trim(),
    score: Math.round(clampNumber(item.score, 0, 100, 50)),
    confidence: clampNumber(item.confidence, 0, 1, 0),
    tags: Array.isArray(item.tags)
      ? item.tags.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 8)
      : [],
    recommendedAction: String(item.recommended_action || 'monitor').trim().toLowerCase(),
    createdAt: item.created_at || null
  };
}

export async function readGoldDashboardItems(options = {}) {
  const result = await supabaseBridge.getGoldEnrichmentItems(options);
  if (!result?.success) {
    const status = result?.meta?.code === 'auth_required'
      ? 'auth_required'
      : 'error';
    return { success: false, status, error: result?.error || 'Gold-Daten nicht verfuegbar' };
  }

  const items = Array.isArray(result.data)
    ? result.data.map((item) => normalizeGoldEnrichmentItem(item))
    : [];

  return {
    success: true,
    status: items.length ? 'ready' : 'empty',
    data: items
  };
}
