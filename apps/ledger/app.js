import { initDb, listProducts, putProduct, archiveProduct, listSales, putSale, listStockMovements, putStockMovement, listExpenses, putExpense, exportAll, importAll, resetAll } from './db.js';
import { setState, getState, subscribe } from './state.js';
import { clear, createEl } from './dom.js';
import { renderHome } from './screens/home.js';
import { renderProducts } from './screens/products.js';
import { renderStock } from './screens/stock.js';
import { renderSaleNew } from './screens/sale_new.js';
import { renderExpenseNew } from './screens/expense_new.js';
import { renderReports } from './screens/reports.js';
import { renderSettings } from './screens/settings.js';

const dbApi = {
  listProducts, putProduct, archiveProduct,
  listSales, putSale,
  listStockMovements, putStockMovement,
  listExpenses, putExpense,
  exportAll, importAll, resetAll
};

function navigate(route) {
  setState({ route });
  window.location.hash = route;
  render();
}

async function render() {
  const root = document.getElementById('app');
  if (!root) return;
  clear(root);

  const state = getState();
  const route = state.route || 'home';

  updateNav(route);

  let screen;
  try {
    switch (route) {
      case 'home':
        screen = await renderHome({ db: dbApi, navigate });
        break;
      case 'products':
        screen = await renderProducts({ db: dbApi });
        break;
      case 'stock':
        screen = await renderStock({ db: dbApi });
        break;
      case 'sale-new':
        screen = await renderSaleNew({ db: dbApi });
        break;
      case 'expense-new':
        screen = await renderExpenseNew({ db: dbApi });
        break;
      case 'reports':
        screen = await renderReports({ db: dbApi });
        break;
      case 'settings':
        screen = await renderSettings({ db: dbApi });
        break;
      default:
        screen = await renderHome({ db: dbApi, navigate });
    }
  } catch (e) {
    const err = document.createElement('div');
    err.className = 'ledger-error';
    err.textContent = 'Fehler beim Laden: ' + (e.message || 'Unbekannter Fehler');
    root.appendChild(err);
    return;
  }

  if (screen) root.appendChild(screen);
}

function updateNav(activeRoute) {
  const nav = document.getElementById('ledger-nav');
  if (!nav) return;
  nav.replaceChildren();

  const tabs = [
    { id: 'home', label: 'Übersicht' },
    { id: 'products', label: 'Produkte' },
    { id: 'stock', label: 'Bestand' },
    { id: 'sale-new', label: 'Verkauf' },
    { id: 'expense-new', label: 'Ausgabe' },
    { id: 'reports', label: 'Berichte' },
    { id: 'settings', label: 'Einstellungen' }
  ];

  for (const t of tabs) {
    const btn = createEl('a', { className: 'ledger-tab', text: t.label, parent: nav });
    if (t.id === activeRoute) btn.classList.add('active');
    btn.onclick = (e) => {
      e.preventDefault();
      navigate(t.id);
    };
  }
}

async function boot() {
  const init = await initDb();
  if (!init.success) {
    const root = document.getElementById('app');
    if (root) {
      root.textContent = 'Datenbank konnte nicht initialisiert werden: ' + (init.error || 'Unbekannter Fehler');
    }
    return;
  }
  window.addEventListener('hashchange', () => {
    setState({ route: window.location.hash.slice(1) || 'home' });
    render();
  });
  render();
}

boot();
