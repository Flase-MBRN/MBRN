import { createEl } from '../dom.js';
import { newId } from '../utils/id.js';
import { nowUtcIso } from '../utils/time_utc.js';
import { validateExpense } from '../models.js';
import { euroToCents } from '../utils/format.js';

export async function renderExpenseNew({ db }) {
  const container = document.createElement('div');
  container.className = 'ledger-grid';

  const formCard = createEl('div', { className: 'ledger-card', parent: container });
  createEl('div', { className: 'ledger-title', text: 'Ausgabe erfassen', parent: formCard });

  const form = createEl('form', { className: 'ledger-form', parent: formCard });

  const catGroup = createEl('div', { className: 'form-group', parent: form });
  createEl('label', { text: 'Kategorie', parent: catGroup });
  const catInput = createEl('input', { attrs: { type: 'text', required: 'true' }, parent: catGroup });

  const amtGroup = createEl('div', { className: 'form-group', parent: form });
  createEl('label', { text: 'Betrag (€)', parent: amtGroup });
  const amtInput = createEl('input', { attrs: { type: 'number', min: '0', step: '0.01', value: '0.00', required: 'true' }, parent: amtGroup });

  const noteGroup = createEl('div', { className: 'form-group', parent: form });
  createEl('label', { text: 'Notiz (optional)', parent: noteGroup });
  const noteInput = createEl('input', { attrs: { type: 'text' }, parent: noteGroup });

  const status = createEl('div', { parent: form });
  const btnRow = createEl('div', { className: 'btn-row', parent: form });
  const submitBtn = createEl('button', { className: 'btn-primary', text: 'Speichern', attrs: { type: 'submit' }, parent: btnRow });

  form.onsubmit = async (e) => {
    e.preventDefault();
    const payload = {
      id: newId('exp'),
      timestamp_utc: nowUtcIso(),
      amount_cents: euroToCents(amtInput.value),
      category: catInput.value,
      note: noteInput.value || ''
    };
    const v = validateExpense(payload);
    if (!v.success) {
      status.className = 'ledger-error';
      status.textContent = v.error;
      return;
    }
    const saved = await db.putExpense(v.data);
    if (saved.success) {
      status.className = 'ledger-success';
      status.textContent = 'Ausgabe gespeichert.';
      form.reset();
    } else {
      status.className = 'ledger-error';
      status.textContent = saved.error || 'Fehler beim Speichern.';
    }
  };

  return container;
}
