const DB_NAME = 'mbrn_ledger';
const DB_VERSION = 1;

let db = null;

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject({ success: false, error: req.error?.message || 'IndexedDB error' });
    req.onsuccess = () => {
      db = req.result;
      resolve({ success: true, data: db });
    };
    req.onupgradeneeded = (event) => {
      const d = event.target.result;
      if (!d.objectStoreNames.contains('products')) {
        d.createObjectStore('products', { keyPath: 'id' });
      }
      if (!d.objectStoreNames.contains('sales')) {
        d.createObjectStore('sales', { keyPath: 'id' });
      }
      if (!d.objectStoreNames.contains('stock_movements')) {
        d.createObjectStore('stock_movements', { keyPath: 'id' });
      }
      if (!d.objectStoreNames.contains('expenses')) {
        d.createObjectStore('expenses', { keyPath: 'id' });
      }
    };
  });
}

export async function initDb() {
  if (db) return { success: true, data: db };
  return openDb();
}

function txGetAll(storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve({ success: true, data: req.result });
    req.onerror = () => reject({ success: false, error: req.error?.message || 'read error' });
  });
}

function txPut(storeName, item) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.put(item);
    req.onsuccess = () => resolve({ success: true, data: item });
    req.onerror = () => reject({ success: false, error: req.error?.message || 'write error' });
  });
}

function txDelete(storeName, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.delete(id);
    req.onsuccess = () => resolve({ success: true });
    req.onerror = () => reject({ success: false, error: req.error?.message || 'delete error' });
  });
}

function txClear(storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.clear();
    req.onsuccess = () => resolve({ success: true });
    req.onerror = () => reject({ success: false, error: req.error?.message || 'clear error' });
  });
}

export function listProducts() {
  return txGetAll('products');
}

export function putProduct(product) {
  return txPut('products', product);
}

export async function archiveProduct(id) {
  const r = await listProducts();
  if (!r.success) return r;
  const p = r.data.find(x => x.id === id);
  if (!p) return { success: false, error: 'Product not found' };
  p.archived = true;
  return putProduct(p);
}

export function listSales() {
  return txGetAll('sales');
}

export function putSale(sale) {
  return txPut('sales', sale);
}

export function listStockMovements() {
  return txGetAll('stock_movements');
}

export function putStockMovement(movement) {
  return txPut('stock_movements', movement);
}

export function listExpenses() {
  return txGetAll('expenses');
}

export function putExpense(expense) {
  return txPut('expenses', expense);
}

export async function exportAll() {
  const [products, stock_movements, sales, expenses] = await Promise.all([
    listProducts().then(r => r.data || []),
    listStockMovements().then(r => r.data || []),
    listSales().then(r => r.data || []),
    listExpenses().then(r => r.data || [])
  ]);
  const payload = {
    meta: {
      dataset_version: '1.0',
      generated_at_utc: new Date().toISOString(),
      currency: 'EUR',
      notes: 'Ledger export'
    },
    products,
    stock_movements,
    sales,
    expenses
  };
  return { success: true, data: payload };
}

export async function importAll(payload) {
  if (!payload || typeof payload !== 'object') {
    return { success: false, error: 'Invalid payload' };
  }
  const { products = [], stock_movements = [], sales = [], expenses = [] } = payload;
  await Promise.all([
    txClear('products'),
    txClear('stock_movements'),
    txClear('sales'),
    txClear('expenses')
  ]);
  await Promise.all(products.map(p => putProduct(p)));
  await Promise.all(stock_movements.map(sm => putStockMovement(sm)));
  await Promise.all(sales.map(s => putSale(s)));
  await Promise.all(expenses.map(e => putExpense(e)));
  return { success: true };
}

export async function resetAll() {
  await Promise.all([
    txClear('products'),
    txClear('stock_movements'),
    txClear('sales'),
    txClear('expenses')
  ]);
  return { success: true };
}
