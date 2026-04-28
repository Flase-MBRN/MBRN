import { createEl } from '../dom.js';
import { euroToCents } from '../utils/format.js';
import { newId } from '../utils/id.js';
import { nowUtcIso } from '../utils/time_utc.js';
import { validateStockMovement } from '../models.js';

export async function renderStock({ db }) {
  const [products, movements] = await Promise.all([
    db.listProducts(),
    db.listStockMovements()
  ]).then(rs => rs.map(r => (r.success ? r.data : [])));

  const activeProducts = products.filter(p => !p.archived);
  const stockMap = new Map();
  const lastBuyPrice = new Map();

  for (const p of activeProducts) {
    stockMap.set(p.id, 0);
    lastBuyPrice.set(p.id, p.buy_price_cents_default || 0);
  }
  for (const m of movements) {
    if (!stockMap.has(m.product_id)) continue;
    const delta = m.type === 'in' ? (m.qty || 0) : -(m.qty || 0);
    stockMap.set(m.product_id, stockMap.get(m.product_id) + delta);
    if (m.type === 'in' && m.unit_buy_price_cents != null) {
      lastBuyPrice.set(m.product_id, m.unit_buy_price_cents);
    }
  }

  const container = document.createElement('div');
  container.className = 'ledger-grid';

  const listCard = createEl('div', { className: 'ledger-card', parent: container });
  createEl('div', { className: 'ledger-title', text: 'Bestand', parent: listCard });
  const table = createEl('table', { className: 'ledger-table', parent: listCard });
  const thead = createEl('thead', { parent: table });
  const htr = createEl('tr', { parent: thead });
  ['Produkt', 'Einheit', 'Bestand'].forEach(t => createEl('th', { text: t, parent: htr }));
  const tbody = createEl('tbody', { parent: table });
  for (const p of activeProducts) {
    const tr = createEl('tr', { parent: tbody });
    createEl('td', { text: p.name, parent: tr });
    createEl('td', { text: p.unit, parent: tr });
    createEl('td', { text: String(stockMap.get(p.id) || 0), parent: tr });
  }

  const formCard = createEl('div', { className: 'ledger-card', parent: container });
  createEl('div', { className: 'ledger-title', text: 'Zugang buchen', parent: formCard });
  const form = createEl('form', { className: 'ledger-form', parent: formCard });

  const prodGroup = createEl('div', { className: 'form-group', parent: form });
  createEl('label', { text: 'Produkt', parent: prodGroup });
  const prodSelect = createEl('select', { parent: prodGroup });
  if (activeProducts.length === 0) {
    prodSelect.disabled = true;
    createEl('option', { text: '⚠️ Keine Produkte verfügbar', attrs: { value: '' }, parent: prodSelect });
    createEl('div', { className: 'ledger-hint', text: 'Erstelle zuerst ein Produkt unter "Produkte".', parent: prodGroup });
  } else {
    for (const p of activeProducts) {
      createEl('option', { text: p.name, attrs: { value: p.id }, parent: prodSelect });
    }
  }

  const qtyGroup = createEl('div', { className: 'form-group', parent: form });
  createEl('label', { text: 'Menge', parent: qtyGroup });
  const qtyInput = createEl('input', { attrs: { type: 'number', min: '1', step: '1', value: '1' }, parent: qtyGroup });

  const priceGroup = createEl('div', { className: 'form-group', parent: form });
  createEl('label', { text: 'Einkaufspreis (€)', parent: priceGroup });
  const priceInput = createEl('input', { attrs: { type: 'number', min: '0', step: '0.01', value: '0.00' }, parent: priceGroup });

  const noteGroup = createEl('div', { className: 'form-group', parent: form });
  createEl('label', { text: 'Notiz (optional)', parent: noteGroup });
  const noteInput = createEl('input', { attrs: { type: 'text' }, parent: noteGroup });

  const status = createEl('div', { parent: form });
  const btnRow = createEl('div', { className: 'btn-row', parent: form });
  const submitBtn = createEl('button', { className: 'btn-primary', text: 'Zugang buchen', attrs: { type: 'submit' }, parent: btnRow });

  form.onsubmit = async (e) => {
    e.preventDefault();
    if (activeProducts.length === 0) {
      status.className = 'ledger-error';
      status.textContent = 'Bitte erstelle zuerst ein Produkt.';
      return;
    }
    const product_id = prodSelect.value;
    const qty = parseInt(qtyInput.value || '0', 10);
    const payload = {
      id: newId('sm'),
      timestamp_utc: nowUtcIso(),
      product_id,
      type: 'in',
      qty,
      unit_buy_price_cents: euroToCents(priceInput.value),
      note: noteInput.value || ''
    };
    const v = validateStockMovement(payload);
    if (!v.success) {
      status.className = 'ledger-error';
      status.textContent = v.error;
      return;
    }
    const saved = await db.putStockMovement(v.data);
    if (saved.success) {
      status.className = 'ledger-success';
      status.textContent = 'Zugang gebucht.';
      form.reset();
      window.dispatchEvent(new Event('hashchange'));
    } else {
      status.className = 'ledger-error';
      status.textContent = saved.error || 'Fehler beim Buchen.';
    }
  };

  return container;
}
