import { createEl } from '../dom.js';

export async function renderSettings({ db }) {
  const container = document.createElement('div');
  container.className = 'ledger-grid';

  const expCard = createEl('div', { className: 'ledger-card', parent: container });
  createEl('div', { className: 'ledger-title', text: 'Export (Download)', parent: expCard });
  const expBtn = createEl('button', { className: 'btn-primary', text: 'Als JSON herunterladen', parent: expCard });
  const expStatus = createEl('div', { parent: expCard });
  expBtn.onclick = async () => {
    const r = await db.exportAll();
    if (!r.success) {
      expStatus.className = 'ledger-error';
      expStatus.textContent = r.error || 'Export fehlgeschlagen.';
      return;
    }
    const blob = new Blob([JSON.stringify(r.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    expStatus.className = 'ledger-success';
    expStatus.textContent = 'Export heruntergeladen.';
  };

  const impCard = createEl('div', { className: 'ledger-card', parent: container });
  createEl('div', { className: 'ledger-title', text: 'Import (JSON Datei)', parent: impCard });
  const fileInput = createEl('input', { attrs: { type: 'file', accept: 'application/json' }, parent: impCard });
  const preview = createEl('div', { className: 'ledger-muted small', text: 'Datei auswählen...', parent: impCard });
  const confirmBtn = createEl('button', { className: 'btn-primary', text: 'Import bestätigen', parent: impCard });
  confirmBtn.disabled = true;
  const impStatus = createEl('div', { parent: impCard });

  let pendingPayload = null;

  fileInput.onchange = () => {
    const f = fileInput.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        pendingPayload = data;
        const counts = [
          (data.products || []).length,
          (data.stock_movements || []).length,
          (data.sales || []).length,
          (data.expenses || []).length
        ];
        preview.textContent = `Produkte: ${counts[0]}, Bewegungen: ${counts[1]}, Verkäufe: ${counts[2]}, Ausgaben: ${counts[3]}`;
        confirmBtn.disabled = false;
        impStatus.className = '';
        impStatus.textContent = '';
      } catch (e) {
        preview.textContent = 'Ungültige JSON-Datei.';
        pendingPayload = null;
        confirmBtn.disabled = true;
      }
    };
    reader.readAsText(f);
  };

  confirmBtn.onclick = async () => {
    if (!pendingPayload) return;
    if (!confirm('Import ersetzt alle lokalen Daten. Fortfahren?')) return;
    const r = await db.importAll(pendingPayload);
    if (r.success) {
      impStatus.className = 'ledger-success';
      impStatus.textContent = 'Import erfolgreich.';
      pendingPayload = null;
      confirmBtn.disabled = true;
    } else {
      impStatus.className = 'ledger-error';
      impStatus.textContent = r.error || 'Import fehlgeschlagen.';
    }
  };

  const demoCard = createEl('div', { className: 'ledger-card', parent: container });
  createEl('div', { className: 'ledger-title', text: 'Demo-Dataset laden', parent: demoCard });
  const demoBtn = createEl('button', { className: 'btn-secondary', text: 'Demo-Daten laden', parent: demoCard });
  const demoStatus = createEl('div', { parent: demoCard });
  demoBtn.onclick = async () => {
    try {
      const res = await fetch('../../docs/S3_Data/reviews/offline_micro_business_ledger_demo_dataset.json');
      if (!res.ok) throw new Error('Netzwerkfehler');
      const data = await res.json();
      const r = await db.importAll(data);
      if (r.success) {
        demoStatus.className = 'ledger-success';
        demoStatus.textContent = 'Demo-Daten geladen.';
      } else {
        demoStatus.className = 'ledger-error';
        demoStatus.textContent = r.error || 'Fehler beim Laden der Demo-Daten.';
      }
    } catch (e) {
      demoStatus.className = 'ledger-error';
      demoStatus.textContent = 'Demo-Daten nicht verfügbar. Stellen Sie sicher, dass die Datei im richtigen Ordner liegt.';
    }
  };

  const resetCard = createEl('div', { className: 'ledger-card', parent: container });
  createEl('div', { className: 'ledger-title', text: 'Daten zurücksetzen', parent: resetCard });
  const resetBtn = createEl('button', { className: 'btn-primary', text: 'Alle Daten löschen', parent: resetCard });
  const resetStatus = createEl('div', { parent: resetCard });
  resetBtn.onclick = async () => {
    if (!confirm('ALLE Daten werden unwiderruflich gelöscht. Fortfahren?')) return;
    const r = await db.resetAll();
    if (r.success) {
      resetStatus.className = 'ledger-success';
      resetStatus.textContent = 'Daten zurückgesetzt.';
    } else {
      resetStatus.className = 'ledger-error';
      resetStatus.textContent = r.error || 'Fehler beim Zurücksetzen.';
    }
  };

  return container;
}
