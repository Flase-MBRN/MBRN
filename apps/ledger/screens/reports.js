import { createEl } from '../dom.js';
import { formatMoney } from '../utils/format.js';
import { startOfTodayUtcIso, startOfLast7DaysUtcIso } from '../utils/time_utc.js';

function sum(arr, fn) {
  return arr.reduce((s, it) => s + (fn(it) || 0), 0);
}

export async function renderReports({ db }) {
  const [products, sales, movements, expenses] = await Promise.all([
    db.listProducts(),
    db.listSales(),
    db.listStockMovements(),
    db.listExpenses()
  ]).then(rs => rs.map(r => (r.success ? r.data : [])));

  const container = document.createElement('div');
  container.className = 'ledger-grid';

  const todayStart = startOfTodayUtcIso();
  const weekStart = startOfLast7DaysUtcIso();

  const todaySales = sales.filter(s => s.timestamp_utc >= todayStart);
  const weekSales = sales.filter(s => s.timestamp_utc >= weekStart);

  const todayExpenses = expenses.filter(e => e.timestamp_utc >= todayStart);
  const weekExpenses = expenses.filter(e => e.timestamp_utc >= weekStart);

  const todayMovements = movements.filter(m => m.timestamp_utc >= todayStart);
  const weekMovements = movements.filter(m => m.timestamp_utc >= weekStart);

  function calcRevenue(list) {
    return list.reduce((sum, s) => {
      const line = (s.items || []).reduce((a, it) => a + (it.unit_price_cents || 0) * (it.qty || 0), 0);
      return sum + line;
    }, 0);
  }
  function calcCogs(listMovements) {
    return listMovements
      .filter(m => m.type === 'out')
      .reduce((sum, m) => sum + (m.unit_buy_price_cents || 0) * (m.qty || 0), 0);
  }
  function calcExpenses(list) {
    return list.reduce((sum, e) => sum + (e.amount_cents || 0), 0);
  }

  const todayRev = calcRevenue(todaySales);
  const weekRev = calcRevenue(weekSales);
  const todayCogs = calcCogs(todayMovements);
  const weekCogs = calcCogs(weekMovements);
  const todayExp = calcExpenses(todayExpenses);
  const weekExp = calcExpenses(weekExpenses);
  const todayProfit = todayRev - todayCogs - todayExp;
  const weekProfit = weekRev - weekCogs - weekExp;

  const tCard = createEl('div', { className: 'ledger-card', parent: container });
  createEl('div', { className: 'ledger-title', text: 'Heute', parent: tCard });
  createEl('div', { text: `Umsatz: ${formatMoney(todayRev)}`, parent: tCard });
  createEl('div', { text: `COGS: ${formatMoney(todayCogs)}`, parent: tCard });
  createEl('div', { text: `Ausgaben: ${formatMoney(todayExp)}`, parent: tCard });
  createEl('div', { text: `Gewinn: ${formatMoney(todayProfit)}`, parent: tCard });

  const wCard = createEl('div', { className: 'ledger-card', parent: container });
  createEl('div', { className: 'ledger-title', text: 'Letzte 7 Tage', parent: wCard });
  createEl('div', { text: `Umsatz: ${formatMoney(weekRev)}`, parent: wCard });
  createEl('div', { text: `COGS: ${formatMoney(weekCogs)}`, parent: wCard });
  createEl('div', { text: `Ausgaben: ${formatMoney(weekExp)}`, parent: wCard });
  createEl('div', { text: `Gewinn: ${formatMoney(weekProfit)}`, parent: wCard });

  const stockCard = createEl('div', { className: 'ledger-card', parent: container });
  createEl('div', { className: 'ledger-title', text: 'Bestand', parent: stockCard });
  const activeProducts = products.filter(p => !p.archived);
  const stockMap = new Map();
  for (const p of activeProducts) stockMap.set(p.id, 0);
  for (const m of movements) {
    if (!stockMap.has(m.product_id)) continue;
    const delta = m.type === 'in' ? (m.qty || 0) : -(m.qty || 0);
    stockMap.set(m.product_id, stockMap.get(m.product_id) + delta);
  }
  for (const p of activeProducts) {
    const onHand = stockMap.get(p.id) || 0;
    createEl('div', { text: `${p.name}: ${onHand} ${p.unit || 'pcs'}`, parent: stockCard });
  }

  return container;
}
