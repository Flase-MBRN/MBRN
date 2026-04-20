export function createBridgeSuccess(source, data, meta = {}) {
  return {
    success: true,
    source,
    data,
    error: null,
    meta
  };
}

export function createBridgeFailure(source, error, meta = {}) {
  return {
    success: false,
    source,
    data: null,
    error,
    meta
  };
}

export function isBridgeResult(value) {
  return Boolean(value) && typeof value === 'object' &&
    typeof value.success === 'boolean' &&
    typeof value.source === 'string' &&
    'data' in value &&
    'error' in value &&
    'meta' in value;
}
