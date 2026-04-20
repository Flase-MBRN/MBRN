function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isFiniteNumber(value) {
  return Number.isFinite(Number(value));
}

export function validateOracleSnapshot(snapshot) {
  if (!isObject(snapshot)) {
    return { valid: false, error: 'snapshot must be an object' };
  }

  if (typeof snapshot.target_date !== 'string' || snapshot.target_date.length === 0) {
    return { valid: false, error: 'target_date must be a non-empty string' };
  }

  if (!isObject(snapshot.prediction)) {
    return { valid: false, error: 'prediction must be an object' };
  }

  if (!isFiniteNumber(snapshot.prediction.alignment_score)) {
    return { valid: false, error: 'prediction.alignment_score must be numeric' };
  }

  if (!isFiniteNumber(snapshot.prediction.confidence)) {
    return { valid: false, error: 'prediction.confidence must be numeric' };
  }

  if (typeof snapshot.prediction.trading_recommendation !== 'string') {
    return { valid: false, error: 'prediction.trading_recommendation must be a string' };
  }

  if (typeof snapshot.prediction.reasoning !== 'string') {
    return { valid: false, error: 'prediction.reasoning must be a string' };
  }

  if (!isObject(snapshot.market_context)) {
    return { valid: false, error: 'market_context must be an object' };
  }

  if (!isObject(snapshot.backtesting)) {
    return { valid: false, error: 'backtesting must be an object' };
  }

  return { valid: true, error: null };
}
