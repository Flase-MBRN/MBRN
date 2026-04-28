export function nowUtcIso() {
  return new Date().toISOString();
}

export function startOfTodayUtcIso() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

export function startOfLast7DaysUtcIso() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 7);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

export function parseIsoUtc(ts) {
  return new Date(ts);
}
