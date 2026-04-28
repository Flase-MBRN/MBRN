export function validateProduct(x) {
  if (!x || typeof x !== 'object') {
    return { success: false, error: 'Invalid product object' };
  }
  const id = typeof x.id === 'string' ? x.id : '';
  const name = typeof x.name === 'string' && x.name.trim() ? x.name.trim() : '';
  const unit = typeof x.unit === 'string' ? x.unit : 'pcs';
  const sell_price_cents = Number(x.sell_price_cents);
  const buy_price_cents_default = Number(x.buy_price_cents_default);
  const created_at_utc = typeof x.created_at_utc === 'string' ? x.created_at_utc : '';
  const archived = Boolean(x.archived);

  if (!name) return { success: false, error: 'Product name required' };
  if (!Number.isFinite(sell_price_cents) || sell_price_cents < 0) {
    return { success: false, error: 'Invalid sell_price_cents' };
  }
  if (!Number.isFinite(buy_price_cents_default) || buy_price_cents_default < 0) {
    return { success: false, error: 'Invalid buy_price_cents_default' };
  }

  return {
    success: true,
    data: {
      id,
      name,
      unit,
      sell_price_cents,
      buy_price_cents_default,
      created_at_utc,
      archived
    }
  };
}

export function validateStockMovement(x) {
  if (!x || typeof x !== 'object') {
    return { success: false, error: 'Invalid stock movement object' };
  }
  const id = typeof x.id === 'string' ? x.id : '';
  const timestamp_utc = typeof x.timestamp_utc === 'string' ? x.timestamp_utc : '';
  const product_id = typeof x.product_id === 'string' ? x.product_id : '';
  const type = x.type === 'in' || x.type === 'out' ? x.type : 'in';
  const qty = Number(x.qty);
  const unit_buy_price_cents = Number(x.unit_buy_price_cents);
  const note = typeof x.note === 'string' ? x.note : '';

  if (!product_id) return { success: false, error: 'product_id required' };
  if (!Number.isFinite(qty) || qty <= 0) {
    return { success: false, error: 'qty must be > 0' };
  }
  if (!Number.isFinite(unit_buy_price_cents) || unit_buy_price_cents < 0) {
    return { success: false, error: 'Invalid unit_buy_price_cents' };
  }

  return {
    success: true,
    data: {
      id,
      timestamp_utc,
      product_id,
      type,
      qty,
      unit_buy_price_cents,
      note
    }
  };
}

export function validateSaleItem(x) {
  if (!x || typeof x !== 'object') {
    return { success: false, error: 'Invalid sale item' };
  }
  const product_id = typeof x.product_id === 'string' ? x.product_id : '';
  const qty = Number(x.qty);
  const unit_price_cents = Number(x.unit_price_cents);
  if (!product_id) return { success: false, error: 'Sale item product_id required' };
  if (!Number.isFinite(qty) || qty <= 0) {
    return { success: false, error: 'Sale item qty must be > 0' };
  }
  if (!Number.isFinite(unit_price_cents) || unit_price_cents < 0) {
    return { success: false, error: 'Invalid sale item unit_price_cents' };
  }
  return { success: true, data: { product_id, qty, unit_price_cents } };
}

export function validateSale(x) {
  if (!x || typeof x !== 'object') {
    return { success: false, error: 'Invalid sale object' };
  }
  const id = typeof x.id === 'string' ? x.id : '';
  const timestamp_utc = typeof x.timestamp_utc === 'string' ? x.timestamp_utc : '';
  const payment_method = ['cash', 'card', 'other'].includes(x.payment_method) ? x.payment_method : 'other';
  const items = Array.isArray(x.items) ? x.items : [];

  if (items.length === 0) {
    return { success: false, error: 'Sale must have at least one item' };
  }

  const validItems = [];
  for (const it of items) {
    const v = validateSaleItem(it);
    if (!v.success) return v;
    validItems.push(v.data);
  }

  return {
    success: true,
    data: {
      id,
      timestamp_utc,
      payment_method,
      items: validItems
    }
  };
}

export function validateExpense(x) {
  if (!x || typeof x !== 'object') {
    return { success: false, error: 'Invalid expense object' };
  }
  const id = typeof x.id === 'string' ? x.id : '';
  const timestamp_utc = typeof x.timestamp_utc === 'string' ? x.timestamp_utc : '';
  const amount_cents = Number(x.amount_cents);
  const category = typeof x.category === 'string' ? x.category : '';
  const note = typeof x.note === 'string' ? x.note : '';

  if (!Number.isFinite(amount_cents) || amount_cents < 0) {
    return { success: false, error: 'Invalid amount_cents' };
  }

  return {
    success: true,
    data: {
      id,
      timestamp_utc,
      amount_cents,
      category,
      note
    }
  };
}

export function validateImportPayload(x) {
  if (!x || typeof x !== 'object') {
    return { success: false, error: 'Payload must be an object' };
  }
  const products = Array.isArray(x.products) ? x.products : [];
  const stock_movements = Array.isArray(x.stock_movements) ? x.stock_movements : [];
  const sales = Array.isArray(x.sales) ? x.sales : [];
  const expenses = Array.isArray(x.expenses) ? x.expenses : [];

  for (const p of products) {
    const v = validateProduct(p);
    if (!v.success) return { success: false, error: `Product validation failed: ${v.error}` };
  }
  for (const sm of stock_movements) {
    const v = validateStockMovement(sm);
    if (!v.success) return { success: false, error: `Stock movement validation failed: ${v.error}` };
  }
  for (const s of sales) {
    const v = validateSale(s);
    if (!v.success) return { success: false, error: `Sale validation failed: ${v.error}` };
  }
  for (const e of expenses) {
    const v = validateExpense(e);
    if (!v.success) return { success: false, error: `Expense validation failed: ${v.error}` };
  }

  return { success: true, data: { products, stock_movements, sales, expenses } };
}
