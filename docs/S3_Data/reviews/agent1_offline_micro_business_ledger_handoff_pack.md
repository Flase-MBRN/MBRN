# Agent-1 Handoff Pack — Offline Micro-Business Ledger (Static Vanilla JS)

**Dimension:** S3_Data

**Status:** Final Handoff Pack

**Sektor:** C

**Last_Audit:** 2026-04-28

## 0) Mission (MVP Ziel)

Baue das erste echte **Money-Core MVP** als **statisches, offline-first Vanilla JS Tool** unter `/apps/**`:

- **kein Backend**
- **keine externen APIs**
- **kein Login**
- **keine Frameworks / keine Dependencies**
- **kein `.innerHTML`**
- Speicherung: **IndexedDB** (oder vorhandene MBRN Storage-Schicht, aber offline-only)
- **keine PII-Felder** (keine Telefonnummer, keine Adresse, keine realen Kundennamen)
- **UTC-only** speichern (Law 15)
- Export ohne `null` (Data Integrity)

## 1) PR-Ready Step List pro Datei

> Ziel: Agent‑1 soll ohne Rückfragen bauen können. Jede Datei: Aufgaben + Exports + No-Gos.

### `/apps/ledger/index.html`

- **Must**
  - Minimaler HTML-Shell
  - `<link rel="stylesheet" href="./styles.css">`
  - `<script type="module" src="./app.js"></script>`
  - Root container: z.B. `<div id="app"></div>`
- **No-Go**
  - keine externen `<script>` oder `<link>` (CDNs)

### `/apps/ledger/styles.css`

- **Must**
  - An MBRN Design-System anlehnen (Dark UI, klare Typo, große Buttons)
  - Layout: mobile-first, max width container
  - Komponenten-Stile:
    - buttons (primary/secondary/danger)
    - cards
    - tables/lists
    - form fields
  - Fokus: lesbar, schnell, keine fancy Animationen
- **No-Go**
  - keine Font-CDNs

### `/apps/ledger/app.js` (Boot + Router)

- **Must Exports**
  - none (entrypoint)
- **Must**
  - `initDb()` aufrufen (aus `db.js`)
  - Globaler Render-Loop:
    - Root leeren via `while (root.firstChild) root.removeChild(root.firstChild)` (kein `.innerHTML`)
    - Navbar rendern
    - Active screen rendern
  - Minimal Router:
    - Hash router: `#/home`, `#/products`, `#/sale-new`, `#/stock`, `#/expense-new`, `#/reports`, `#/settings`
  - Error surface:
    - Wenn DB init fail: show error screen (readable)

### `/apps/ledger/state.js` (UI State)

- **Must Exports**
  - `getState()`
  - `setState(partial)`
  - `subscribe(listener)` (optional)
- **Must**
  - UI-only state:
    - `route`
    - ephemeral form state (optional)
- **No-Go**
  - Business data nicht dauerhaft hier speichern (DB ist source)

### `/apps/ledger/utils/time_utc.js`

- **Must Exports**
  - `nowUtcIso()`
  - `startOfTodayUtcIso()`
  - `startOfLast7DaysUtcIso()` (einfach und eindeutig)
- **Definition**
  - “Week” im MVP = **last 7 days** (keine ISO-week edge cases)

### `/apps/ledger/utils/id.js`

- **Must Exports**
  - `newId(prefix)`
- **Must**
  - IDs als Strings, z.B. `prod_...`, `sale_...`, `sm_...`, `exp_...`

### `/apps/ledger/utils/format.js`

- **Must Exports**
  - `formatMoney(cents, currency)`
  - `formatQty(qty)`

### `/apps/ledger/models.js` (Validation + Normalization)

- **Must Exports**
  - `validateProduct(x)`
  - `validateSale(x)`
  - `validateStockMovement(x)`
  - `validateExpense(x)`
  - `validateImportPayload(x)`
- **Return Contract**
  - Immer `{ success, data, error }`
- **Must**
  - Ensure:
    - keine `null` Felder
    - required fields vorhanden
    - `*_cents` sind integers >= 0
    - `qty` ist number > 0
    - `timestamp_utc` ist string
    - `payment_method` nur `cash|card|other`

### `/apps/ledger/db.js` (Storage Adapter)

- **Must Exports**
  - `initDb()`
  - `listProducts()` / `putProduct(product)` / `archiveProduct(id)`
  - `listSales()` / `putSale(sale)`
  - `listStockMovements()` / `putStockMovement(movement)`
  - `listExpenses()` / `putExpense(expense)`
  - `exportAll()`
  - `importAll(payload)`
  - `resetAll()`
- **Must**
  - **IndexedDB** als Default.
  - Object stores:
    - `products` (key `id`)
    - `sales` (key `id`)
    - `stock_movements` (key `id`)
    - `expenses` (key `id`)
  - `exportAll()` erzeugt JSON payload:
    - exakt die Keys: `meta`, `products`, `stock_movements`, `sales`, `expenses`
    - keine `null`
    - `meta.generated_at_utc` setzen
  - `importAll(payload)`:
    - validate payload
    - **confirm** im UI bevor Replace
    - dann DB leeren und neu schreiben
- **No-Go**
  - keine fetch calls
  - keine cloud sync

### `/apps/ledger/components/nav.js`

- **Must Exports**
  - `renderNav({ route }) -> HTMLElement`
- **Must**
  - Tabs/Links für Screens
  - Active state highlight

### `/apps/ledger/components/product_picker.js`

- **Must Exports**
  - `renderProductPicker({ products, onPick }) -> HTMLElement`
- **Must**
  - Search input
  - list filtered products

### `/apps/ledger/components/money_input.js`

- **Must Exports**
  - `renderMoneyInput({ label, valueCents, onChangeCents }) -> HTMLElement`
- **Must**
  - Input ist string, parse sicher, niemals NaN speichern

### `/apps/ledger/screens/home.js`

- **Must Exports**
  - `renderHome({ db }) -> Promise<HTMLElement>`
- **Must**
  - Load data: products, sales, stock_movements, expenses
  - Compute:
    - today revenue
    - today expenses
    - today profit estimate
    - low stock list
  - Actions:
    - buttons navigieren zu `#/sale-new`, `#/stock`, `#/expense-new`

### `/apps/ledger/screens/products.js`

- **Must Exports**
  - `renderProducts({ db }) -> Promise<HTMLElement>`
- **Must**
  - Create/edit/archive product
  - Archive = `archived: true` (nicht löschen)

### `/apps/ledger/screens/sale_new.js`

- **Must Exports**
  - `renderSaleNew({ db }) -> Promise<HTMLElement>`
- **Must**
  - Cart state local
  - Save does:
    1) create `sale`
    2) for each item create `stock_movement` type `out`
       - `unit_buy_price_cents` = latest known (prefer last stock-in for product, else product default)
- **No-Go**
  - keine Kundenfelder

### `/apps/ledger/screens/stock.js`

- **Must Exports**
  - `renderStock({ db }) -> Promise<HTMLElement>`
- **Must**
  - Show stock on hand per product
  - Add stock-in movement form

### `/apps/ledger/screens/expense_new.js`

- **Must Exports**
  - `renderExpenseNew({ db }) -> Promise<HTMLElement>`
- **Must**
  - Add expense form

### `/apps/ledger/screens/reports.js`

- **Must Exports**
  - `renderReports({ db }) -> Promise<HTMLElement>`
- **Must**
  - Two modes:
    - Today
    - Last 7 days
  - Show:
    - revenue
    - cogs estimate
    - expenses
    - profit estimate

### `/apps/ledger/screens/settings.js`

- **Must Exports**
  - `renderSettings({ db }) -> Promise<HTMLElement>`
- **Must**
  - Export: call `exportAll()` → download file
  - Import: upload → parse → show summary → confirm → `importAll()`
  - Reset: confirm → `resetAll()`

### Optional PWA

Nur wenn erlaubt:

- `/apps/ledger/manifest.webmanifest`
  - Name, icons (optional), start_url, display
- `/apps/ledger/sw.js`
  - Cache static assets for offline

## 2) Demo-Dataset (JSON ohne PII)

- Datei:
  - `docs/S3_Data/reviews/offline_micro_business_ledger_demo_dataset.json`

- Import in Settings → sollte direkt nutzbar sein.

## 3) Erwartete Report-Werte (Smoke-Test)

Basis: Demo-Dataset oben.

### Expected Stock on Hand

- `Tea Cup`:
  - stock-in: 10
  - sold: 2
  - **expected on hand = 8**

- `Sugar Pack`:
  - stock-in: 20
  - sold: 1 + 3 = 4
  - **expected on hand = 16**

### Expected Revenue (Today / Last 7 days)

- Sale 001:
  - Tea: 2 * 300 = 600
  - Sugar: 1 * 200 = 200
  - total = 800
- Sale 002:
  - Sugar: 3 * 200 = 600
- **expected revenue = 1400 cents (€14.00)**

### Expected COGS estimate

Stock-out movements should record buy price:

- Tea: 2 * 120 = 240
- Sugar: 4 * 80 = 320
- **expected cogs = 560 cents (€5.60)**

### Expected Expenses

- Transport: 500
- Packaging: 250
- **expected expenses = 750 cents (€7.50)**

### Expected Profit estimate

- profit = revenue - cogs - expenses
- profit = 1400 - 560 - 750 = **90 cents (€0.90)**

## 4) No-Go / Security Gate Checkliste (vor Merge abhaken)

### Scope / Infra

- [ ] Keine Backend-Calls (Supabase/Server/Edge) im Ledger MVP
- [ ] Keine `fetch()`/XHR Calls im Ledger Code
- [ ] Kein Login/Accounts
- [ ] Keine externen Dependencies (kein CDN, keine npm libs für App)

### Security / Privacy

- [ ] Keine PII-Felder (Telefon, Adresse, Email, echte Namen)
- [ ] Keine versteckten Telemetrie-Events
- [ ] Export enthält keine `null` Werte

### Compliance / Laws

- [ ] Kein `.innerHTML` anywhere (Law 3)
- [ ] Alle timestamps intern UTC ISO (Law 15)
- [ ] Jede Validierungs-/DB-Funktion folgt `{ success, data, error }` wo passend

### UX / Reliability

- [ ] App funktioniert nach Import des Demo-Datasets ohne Crash
- [ ] Export/Import Roundtrip ohne Datenverlust
- [ ] Reset verlangt Confirmation

### Smoke-Test Gate

- [ ] Demo import → Reports zeigen exakt:
  - Revenue: €14.00
  - COGS: €5.60
  - Expenses: €7.50
  - Profit: €0.90
  - Stock: Tea 8, Sugar 16

---

## Abschluss

Wenn alles implementiert ist:

- `npm test -- --runInBand`

(Die Tests dürfen `console.error` Logs haben, aber exit code muss 0 sein.)
