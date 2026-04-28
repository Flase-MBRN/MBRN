import { createEl } from '../dom.js';
import { formatMoney } from '../utils/format.js';
import { startOfTodayUtcIso, startOfLast7DaysUtcIso } from '../utils/time_utc.js';

export async function renderHome({ db, navigate }) {
  const [products, sales, movements, expenses] = await Promise.all([
    db.listProducts(),
    db.listSales(),
    db.listStockMovements(),
    db.listExpenses()
  ]).then(rs => rs.map(r => (r.success ? r.data : [])));

  const container = document.createElement('div');
  container.className = 'ledger-grid cols-2';

  const activeProducts = products.filter(p => !p.archived);
  const hasProducts = activeProducts.length > 0;
  const hasStock = movements.some(m => m.type === 'in');
  const hasSales = sales.length > 0;

  // GUIDED MODE: Show onboarding card for new users
  if (!hasProducts || !hasStock || !hasSales) {
    const guideCard = createEl('div', { className: 'ledger-card guide-card', parent: container });

    if (!hasProducts) {
      createEl('div', { className: 'guide-step', text: 'Schritt 1 von 3', parent: guideCard });
      createEl('div', { className: 'ledger-title', text: '📦 Produkt anlegen', parent: guideCard });
      createEl('div', { className: 'guide-text', text: 'Du hast noch keine Produkte. Starte hier:', parent: guideCard });
      const btn = createEl('button', { className: 'btn-primary', text: '→ Produkt erstellen', parent: guideCard });
      btn.onclick = () => navigate('products');
    } else if (!hasStock) {
      createEl('div', { className: 'guide-step', text: 'Schritt 2 von 3', parent: guideCard });
      createEl('div', { className: 'ledger-title', text: '📥 Bestand hinzufügen', parent: guideCard });
      createEl('div', { className: 'guide-text', text: `Du hast ${activeProducts.length} Produkt(e), aber noch keinen Bestand.`, parent: guideCard });
      const btn = createEl('button', { className: 'btn-primary', text: '→ Bestand buchen', parent: guideCard });
      btn.onclick = () => navigate('stock');
    } else if (!hasSales) {
      createEl('div', { className: 'guide-step', text: 'Schritt 3 von 3', parent: guideCard });
      createEl('div', { className: 'ledger-title', text: '💰 Ersten Verkauf machen', parent: guideCard });
      createEl('div', { className: 'guide-text', text: 'Alles bereit! Mache deinen ersten Verkauf:', parent: guideCard });
      const btn = createEl('button', { className: 'btn-primary', text: '→ Verkauf erfassen', parent: guideCard });
      btn.onclick = () => navigate('sale-new');
    }
  }

  // Normal dashboard stats
  const todayStart = startOfTodayUtcIso();
  const todaySales = sales.filter(s => s.timestamp_utc >= todayStart);
  const todayExpenses = expenses.filter(e => e.timestamp_utc >= todayStart);

  const todayRevenue = todaySales.reduce((sum, s) => {
    const lineTotal = (s.items || []).reduce((a, it) => a + (it.unit_price_cents || 0) * (it.qty || 0), 0);
    return sum + lineTotal;
  }, 0);
  const todayExp = todayExpenses.reduce((sum, e) => sum + (e.amount_cents || 0), 0);
  const todayProfit = todayRevenue - todayExp;

  const statsCard = createEl('div', { className: 'ledger-card', parent: container });
  if (todayRevenue === 0 && todayExp === 0) {
    createEl('div', { className: 'ledger-title', text: 'Heute', parent: statsCard });
    createEl('div', { className: 'ledger-muted', text: '→ Du hast noch nichts verkauft.', parent: statsCard });
  } else {
    createEl('div', { className: 'ledger-title', text: 'Heute', parent: statsCard });
    const grid = createEl('div', { className: 'ledger-grid cols-2', parent: statsCard });
    createEl('div', { text: `Umsatz: ${formatMoney(todayRevenue)}`, parent: grid });
    createEl('div', { text: `Ausgaben: ${formatMoney(todayExp)}`, parent: grid });
    createEl('div', { text: `Gewinn: ${formatMoney(todayProfit)}`, parent: grid });
  }

  // Low stock warning
  const lowCard = createEl('div', { className: 'ledger-card', parent: container });
  createEl('div', { className: 'ledger-title', text: 'Niedriger Bestand', parent: lowCard });
  const stockMap = new Map();
  for (const p of activeProducts) stockMap.set(p.id, 0);
  for (const m of movements) {
    if (!stockMap.has(m.product_id)) continue;
    const delta = m.type === 'in' ? (m.qty || 0) : -(m.qty || 0);
    stockMap.set(m.product_id, stockMap.get(m.product_id) + delta);
  }
  const lowList = createEl('ul', { parent: lowCard });
  let anyLow = false;
  for (const p of activeProducts) {
    const onHand = stockMap.get(p.id) || 0;
    if (onHand <= 5) {
      anyLow = true;
      const li = createEl('li', { parent: lowList });
      createEl('span', { text: `${p.name}: ${onHand} ${p.unit || 'pcs'}`, parent: li });
    }
  }
  if (!anyLow) {
    createEl('div', { className: 'ledger-muted', text: 'Keine Produkte mit kritischem Bestand.', parent: lowCard });
  }

  // Quick actions (only show when setup complete)
  if (hasProducts && hasStock) {
    const actionsCard = createEl('div', { className: 'ledger-card', parent: container });
    createEl('div', { className: 'ledger-title', text: 'Aktionen', parent: actionsCard });
    const btnRow = createEl('div', { className: 'btn-row', parent: actionsCard });
    const btnSale = createEl('button', { className: 'btn-primary', text: 'Verkauf erfassen', parent: btnRow });
    const btnStock = createEl('button', { className: 'btn-secondary', text: 'Bestand buchen', parent: btnRow });
    const btnExp = createEl('button', { className: 'btn-secondary', text: 'Ausgabe erfassen', parent: btnRow });
    btnSale.onclick = () => navigate('sale-new');
    btnStock.onclick = () => navigate('stock');
    btnExp.onclick = () => navigate('expense-new');
  }

  return container;
}
