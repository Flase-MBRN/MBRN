import { createEl } from '../dom.js';
import { newId } from '../utils/id.js';
import { nowUtcIso } from '../utils/time_utc.js';
import { validateProduct } from '../models.js';
import { formatMoney, euroToCents } from '../utils/format.js';

export async function renderProducts({ db }) {
  const r = await db.listProducts();
  const products = r.success ? r.data : [];
  const active = products.filter(p => !p.archived);
  const archived = products.filter(p => p.archived);

  const container = document.createElement('div');
  container.className = 'ledger-grid';

  const formCard = createEl('div', { className: 'ledger-card', parent: container });
  createEl('div', { className: 'ledger-title', text: 'Produkt anlegen / bearbeiten', parent: formCard });
  const form = createEl('form', { className: 'ledger-form', parent: formCard });

  const nameGroup = createEl('div', { className: 'form-group', parent: form });
  createEl('label', { text: 'Name', parent: nameGroup });
  const nameInput = createEl('input', { attrs: { type: 'text', required: 'true' }, parent: nameGroup });

  const unitGroup = createEl('div', { className: 'form-group', parent: form });
  createEl('label', { text: 'Einheit', parent: unitGroup });
  const unitInput = createEl('input', { attrs: { type: 'text', value: 'pcs' }, parent: unitGroup });

  const sellGroup = createEl('div', { className: 'form-group', parent: form });
  createEl('label', { text: 'Verkaufspreis (€)', parent: sellGroup });
  const sellInput = createEl('input', { attrs: { type: 'number', min: '0', step: '0.01', value: '0.00' }, parent: sellGroup });

  const buyGroup = createEl('div', { className: 'form-group', parent: form });
  createEl('label', { text: 'Einkaufspreis Default (€)', parent: buyGroup });
  const buyInput = createEl('input', { attrs: { type: 'number', min: '0', step: '0.01', value: '0.00' }, parent: buyGroup });

  const status = createEl('div', { parent: form });

  const btnRow = createEl('div', { className: 'btn-row', parent: form });
  const submitBtn = createEl('button', { className: 'btn-primary', text: 'Speichern', attrs: { type: 'submit' }, parent: btnRow });

  form.onsubmit = async (e) => {
    e.preventDefault();
    const payload = {
      id: newId('prod'),
      name: nameInput.value,
      unit: unitInput.value || 'pcs',
      sell_price_cents: euroToCents(sellInput.value),
      buy_price_cents_default: euroToCents(buyInput.value),
      created_at_utc: nowUtcIso(),
      archived: false
    };
    const v = validateProduct(payload);
    if (!v.success) {
      status.className = 'ledger-error';
      status.textContent = v.error;
      return;
    }
    const saved = await db.putProduct(v.data);
    if (saved.success) {
      status.className = 'ledger-success';
      status.textContent = 'Produkt gespeichert.';
      form.reset();
      window.dispatchEvent(new Event('hashchange'));
    } else {
      status.className = 'ledger-error';
      status.textContent = saved.error || 'Fehler beim Speichern.';
    }
  };

  const listCard = createEl('div', { className: 'ledger-card', parent: container });
  createEl('div', { className: 'ledger-title', text: 'Produkte', parent: listCard });
  const table = createEl('table', { className: 'ledger-table', parent: listCard });
  const thead = createEl('thead', { parent: table });
  const htr = createEl('tr', { parent: thead });
  ['Name', 'Einheit', 'VK (Cent)', 'EK (Cent)', 'Aktion'].forEach(t => createEl('th', { text: t, parent: htr }));
  const tbody = createEl('tbody', { parent: table });

  for (const p of active) {
    const tr = createEl('tr', { parent: tbody });
    createEl('td', { text: p.name, parent: tr });
    createEl('td', { text: p.unit, parent: tr });
    createEl('td', { text: String(p.sell_price_cents), parent: tr });
    createEl('td', { text: String(p.buy_price_cents_default), parent: tr });
    const tdAction = createEl('td', { parent: tr });
    const archiveBtn = createEl('button', { className: 'btn-secondary small', text: 'Archivieren', parent: tdAction });
    archiveBtn.onclick = async () => {
      await db.archiveProduct(p.id);
      window.dispatchEvent(new Event('hashchange'));
    };
  }

  if (archived.length) {
    const arcCard = createEl('div', { className: 'ledger-card', parent: container });
    createEl('div', { className: 'ledger-title', text: 'Archiviert', parent: arcCard });
    for (const p of archived) {
      createEl('div', { className: 'ledger-muted', text: `${p.name} (archiviert)`, parent: arcCard });
    }
  }

  return container;
}
