import { createEl } from '../dom.js';
import { newId } from '../utils/id.js';
import { nowUtcIso } from '../utils/time_utc.js';
import { validateSale, validateStockMovement } from '../models.js';
import { formatMoney } from '../utils/format.js';

// Ghost Profit: Translates profit into relatable real-world items
function getGhostProfitInsight(profitCents) {
  const euro = profitCents / 100;
  const items = [
    { threshold: 3.50, label: 'Döner', icon: '🥙', unit: 3.50 },
    { threshold: 5.00, label: 'Kaffee', icon: '☕', unit: 5.00 },
    { threshold: 15.00, label: 'Stunde Freiheit', icon: '⏱️', unit: 15.00 }
  ];

  // Find best matching item (highest threshold that fits)
  const item = [...items].reverse().find(i => euro >= i.threshold) || items[0];
  const count = Math.max(1, Math.floor(euro / item.unit * 10) / 10);

  return {
    profit: formatMoney(profitCents),
    primary: `${item.icon} = ${count >= 1 ? Math.floor(count) : count} ${item.label}`,
    euro
  };
}

export async function renderSaleNew({ db }) {
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

  const cartCard = createEl('div', { className: 'ledger-card', parent: container });
  createEl('div', { className: 'ledger-title', text: 'Warenkorb', parent: cartCard });

  const cartItems = [];
  const cartList = createEl('div', { parent: cartCard });

  const addGroup = createEl('div', { className: 'form-group', parent: cartCard });
  createEl('label', { text: 'Produkt', parent: addGroup });
  const prodSelect = createEl('select', { parent: addGroup });
  if (activeProducts.length === 0) {
    prodSelect.disabled = true;
    createEl('option', { text: '⚠️ Keine Produkte verfügbar', attrs: { value: '' }, parent: prodSelect });
    createEl('div', { className: 'ledger-hint', text: 'Erstelle zuerst ein Produkt unter "Produkte".', parent: addGroup });
  } else {
    for (const p of activeProducts) {
      const onHand = stockMap.get(p.id) || 0;
      createEl('option', { text: `${p.name} (Bestand: ${onHand})`, attrs: { value: p.id }, parent: prodSelect });
    }
  }
  const qtyInput = createEl('input', { attrs: { type: 'number', min: '1', step: '1', value: '1' }, parent: addGroup });

  const addBtn = createEl('button', { className: 'btn-secondary', text: 'Hinzufügen', parent: addGroup });
  const status = createEl('div', { parent: cartCard });

  function refreshCart() {
    cartList.replaceChildren();
    if (cartItems.length === 0) {
      createEl('div', { className: 'ledger-muted', text: 'Warenkorb ist leer.', parent: cartList });
    } else {
      const ul = createEl('ul', { parent: cartList });
      for (const it of cartItems) {
        const prod = activeProducts.find(p => p.id === it.product_id);
        const li = createEl('li', { parent: ul });
        createEl('span', { text: `${prod?.name || it.product_id} x ${it.qty} = ${formatMoney(it.unit_price_cents * it.qty)}`, parent: li });
      }
      const total = cartItems.reduce((s, it) => s + it.unit_price_cents * it.qty, 0);
      createEl('div', { text: `Summe: ${formatMoney(total)}`, parent: cartList });
    }
  }
  refreshCart();

  addBtn.onclick = () => {
    if (activeProducts.length === 0) return;
    const pid = prodSelect.value;
    const onHand = stockMap.get(pid) || 0;
    const qty = parseInt(qtyInput.value || '0', 10);
    if (qty <= 0) {
      status.className = 'ledger-error';
      status.textContent = 'Menge muss > 0 sein.';
      return;
    }
    const existingQty = cartItems.filter(it => it.product_id === pid).reduce((s, it) => s + it.qty, 0);
    if (existingQty + qty > onHand) {
      status.className = 'ledger-error';
      status.textContent = 'Nicht genügend Bestand.';
      return;
    }
    const prod = activeProducts.find(p => p.id === pid);
    cartItems.push({ product_id: pid, qty, unit_price_cents: prod?.sell_price_cents || 0 });
    status.className = '';
    status.textContent = '';
    refreshCart();
  };

  const saveCard = createEl('div', { className: 'ledger-card', parent: container });
  createEl('div', { className: 'ledger-title', text: 'Verkauf speichern', parent: saveCard });
  const payGroup = createEl('div', { className: 'form-group', parent: saveCard });
  createEl('label', { text: 'Zahlungsmethode', parent: payGroup });
  const paySelect = createEl('select', { parent: payGroup });
  for (const opt of ['cash', 'card', 'other']) {
    createEl('option', { text: opt, attrs: { value: opt }, parent: paySelect });
  }
  const saveBtn = createEl('button', { className: 'btn-primary', text: 'Verkauf speichern', parent: saveCard });
  const saveStatus = createEl('div', { parent: saveCard });

  saveBtn.onclick = async () => {
    if (cartItems.length === 0) {
      saveStatus.className = 'ledger-error';
      saveStatus.textContent = 'Warenkorb ist leer.';
      return;
    }
    const salePayload = {
      id: newId('sale'),
      timestamp_utc: nowUtcIso(),
      payment_method: paySelect.value,
      items: cartItems
    };
    const v = validateSale(salePayload);
    if (!v.success) {
      saveStatus.className = 'ledger-error';
      saveStatus.textContent = v.error;
      return;
    }

    for (const it of cartItems) {
      const prod = activeProducts.find(p => p.id === it.product_id);
      const unit_buy_price_cents = lastBuyPrice.get(it.product_id) || prod?.buy_price_cents_default || 0;
      const smPayload = {
        id: newId('sm'),
        timestamp_utc: salePayload.timestamp_utc,
        product_id: it.product_id,
        type: 'out',
        qty: it.qty,
        unit_buy_price_cents,
        note: 'Sale'
      };
      const vsm = validateStockMovement(smPayload);
      if (!vsm.success) {
        saveStatus.className = 'ledger-error';
        saveStatus.textContent = 'Stock validation error: ' + vsm.error;
        return;
      }
      await db.putStockMovement(vsm.data);
    }

    const saved = await db.putSale(v.data);
    if (saved.success) {
      // Calculate total profit
      let totalProfitCents = 0;
      for (const it of cartItems) {
        const buyPrice = lastBuyPrice.get(it.product_id) || 0;
        totalProfitCents += (it.unit_price_cents - buyPrice) * it.qty;
      }

      saveStatus.className = 'ledger-success';
      saveStatus.textContent = 'Verkauf gespeichert.';
      cartItems.length = 0;
      refreshCart();

      // Show Ghost Profit Insight
      if (totalProfitCents > 0) {
        const insight = getGhostProfitInsight(totalProfitCents);
        const ghostCard = createEl('div', { className: 'ledger-card ghost-profit', parent: container });
        createEl('div', { className: 'ghost-title', text: `💰 ${insight.profit} Gewinn`, parent: ghostCard });
        createEl('div', { className: 'ghost-insight', text: insight.primary, parent: ghostCard });
        createEl('div', { className: 'ghost-text', text: 'Das entspricht...', parent: ghostCard });

        // Secondary conversions
        const ghostGrid = createEl('div', { className: 'ghost-grid', parent: ghostCard });
        if (insight.euro >= 3.50) {
          const doenerCount = Math.floor(insight.euro / 3.50);
          createEl('div', { className: 'ghost-item', text: `🥙 ${doenerCount}x Döner`, parent: ghostGrid });
        }
        if (insight.euro >= 5.00) {
          const coffeeCount = Math.floor(insight.euro / 5.00);
          createEl('div', { className: 'ghost-item', text: `☕ ${coffeeCount}x Kaffee`, parent: ghostGrid });
        }
        if (insight.euro >= 15.00) {
          const hourCount = (insight.euro / 15.00).toFixed(1);
          createEl('div', { className: 'ghost-item', text: `⏱️ ${hourCount}h Freiheit`, parent: ghostGrid });
        }

        const btnRow = createEl('div', { className: 'btn-row', parent: ghostCard });
        const btnNew = createEl('button', { className: 'btn-primary', text: 'Weiter verkaufen', parent: btnRow });
        const btnHome = createEl('button', { className: 'btn-secondary', text: 'Zur Übersicht', parent: btnRow });
        btnNew.onclick = () => window.dispatchEvent(new Event('hashchange'));
        btnHome.onclick = () => { window.location.hash = 'home'; };
      }
    } else {
      saveStatus.className = 'ledger-error';
      saveStatus.textContent = saved.error || 'Fehler beim Speichern.';
    }
  };

  return container;
}
