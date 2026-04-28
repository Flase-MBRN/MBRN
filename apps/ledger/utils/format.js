export function formatMoney(cents, currency = 'EUR') {
  const val = (cents || 0) / 100;
  const sym = currency === 'EUR' ? '€' : currency;
  return `${sym}${val.toFixed(2)}`;
}

export function euroToCents(euro) {
  return Math.round((parseFloat(euro) || 0) * 100);
}

export function centsToEuro(cents) {
  return ((cents || 0) / 100).toFixed(2);
}

export function formatQty(qty) {
  return String(qty ?? 0);
}

export function formatDateUtc(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toISOString().slice(0, 16).replace('T', ' ');
  } catch {
    return String(iso);
  }
}
