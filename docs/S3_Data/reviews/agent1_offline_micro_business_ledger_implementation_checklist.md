# Agent-1 Implementation Checklist — Offline Micro-Business Ledger (Static Vanilla JS)

**Dimension:** S3_Data

**Status:** Handoff Checklist

**Sektor:** C

**Last_Audit:** 2026-04-28

## Ziel des MVP

Baue ein **statisches, local-first Micro-Business Ledger** als Website-Tool:

- **kein Backend**
- **keine externen APIs**
- **keine Frameworks / kein Build-Step**
- **Vanilla JS (ES Modules mit `.js` Endung)**
- lokale Speicherung über **IndexedDB** oder vorhandene **MBRN Storage-Schicht**

Der Nutzer soll in **2 Minuten/Tag**:

- Produkte anlegen
- Verkäufe erfassen
- Bestand nachführen
- Ausgaben erfassen
- einfache Reports sehen
- Daten exportieren/importieren (Backup)

## Exakte Dateien, die Agent-1 unter `/apps/**` anlegen soll

> Pfade sind **exakt** so gemeint. (Du kannst Namen anpassen, aber bitte ohne Build-Tooling.)

- `/apps/ledger/index.html`
- `/apps/ledger/styles.css`
- `/apps/ledger/app.js` (Boot + Router)
- `/apps/ledger/state.js` (In-Memory UI-State)
- `/apps/ledger/models.js` (Data Shapes + Validation)
- `/apps/ledger/db.js` (IndexedDB/Storage Adapter)

- `/apps/ledger/screens/home.js`
- `/apps/ledger/screens/products.js`
- `/apps/ledger/screens/sale_new.js`
- `/apps/ledger/screens/stock.js`
- `/apps/ledger/screens/expense_new.js`
- `/apps/ledger/screens/reports.js`
- `/apps/ledger/screens/settings.js`

- `/apps/ledger/components/nav.js`
- `/apps/ledger/components/product_picker.js`
- `/apps/ledger/components/money_input.js`

- `/apps/ledger/utils/time_utc.js`
- `/apps/ledger/utils/format.js`
- `/apps/ledger/utils/id.js`

Optional (nur wenn kompatibel mit MBRN Frontend-Regeln):

- `/apps/ledger/manifest.webmanifest`
- `/apps/ledger/sw.js`

## UI-Screens (genau)

### 1) Home / Today (`screens/home.js`)

- Primary Buttons:
  - `New Sale`
  - `Add Stock`
  - `Add Expense`
- Cards:
  - `Today Revenue`
  - `Today Expenses`
  - `Today Profit (estimate)`
- List:
  - `Low stock warnings` (Top 5)

### 2) Products (`screens/products.js`)

- Product list (search + archive toggle)
- Add product form
- Edit product (inline oder modal)

### 3) New Sale (`screens/sale_new.js`)

- Product picker
- Cart list (items + qty stepper)
- Payment method select (cash/card/other)
- Save sale

### 4) Stock (`screens/stock.js`)

- Stock on hand list
- Add stock movement (stock-in)
  - product
  - qty
  - optional override buy price
  - note

### 5) Add Expense (`screens/expense_new.js`)

- amount
- category
- note
- save

### 6) Reports (`screens/reports.js`)

- Tabs:
  - Today
  - This week
- Tables:
  - Revenue
  - COGS estimate
  - Expenses
  - Profit estimate
- Top sellers list (optional)

### 7) Settings / Data (`screens/settings.js`)

- Export JSON (download)
- Import JSON (file upload)
- Reset local data (danger zone + confirm)

## Datenmodell (MVP)

### Storage-Entities

- `product`
  - `id: string`
  - `name: string`
  - `unit: string`
  - `sell_price_cents: number`
  - `buy_price_cents_default: number`
  - `created_at_utc: string` (ISO)
  - `archived: boolean`

- `sale`
  - `id: string`
  - `timestamp_utc: string` (ISO)
  - `payment_method: 'cash'|'card'|'other'`
  - `items: sale_item[]`

- `sale_item`
  - `product_id: string`
  - `qty: number`
  - `unit_price_cents: number`

- `stock_movement`
  - `id: string`
  - `timestamp_utc: string` (ISO)
  - `product_id: string`
  - `type: 'in'|'out'`
  - `qty: number`
  - `unit_buy_price_cents: number`
  - `note: string` (empty string allowed)

- `expense`
  - `id: string`
  - `timestamp_utc: string` (ISO)
  - `amount_cents: number`
  - `category: string`
  - `note: string` (empty string allowed)

### Derived calculations (nicht speichern)

- `stock_on_hand(product_id) = Σ(in.qty) - Σ(out.qty)`
- `revenue = Σ(sale.items.qty * sale.items.unit_price)`
- `cogs_estimate = Σ(stock_out.qty * unit_buy_price)`
- `profit_estimate = revenue - cogs_estimate - expenses`

### Hard Rules

- **Keine Null-Werte im Export** (`null` verboten). Nutze:
  - `''` (empty string)
  - `0`
  - `[]`
  - `{}`
- **Timestamps intern immer UTC** (ISO String). Keine Local-Time Speicherung.

## Funktionen (was Agent-1 bauen muss)

### `models.js`

- `validateProduct(product) -> { success, data, error }`
- `validateSale(sale) -> { success, data, error }`
- `validateExpense(expense) -> { success, data, error }`
- `validateImportPayload(payload) -> { success, data, error }`

### `db.js` (Adapter)

- `initDb()`
- CRUD pro Entity:
  - `listProducts()` / `putProduct()` / `archiveProduct(id)`
  - `listSales()` / `putSale()`
  - `listStockMovements()` / `putStockMovement()`
  - `listExpenses()` / `putExpense()`
- `exportAll()` → JSON payload
- `importAll(payload)` → replace local DB (nach confirm)
- `resetAll()`

### `utils/time_utc.js`

- `nowUtcIso()`
- `startOfTodayUtcIso()` / `startOfWeekUtcIso()` (Definition: ISO week oder “last 7 days” festlegen)

### `reports.js` (Logic in Screen oder helper)

- `computeTodaySummary(data)`
- `computeWeekSummary(data)`
- `computeStockOnHand(data)`

## Storage-Regeln

- Nutze **IndexedDB** als Default.
- Wenn MBRN eine bestehende Storage-Schicht hat, dann:
  - nur verwenden, wenn sie **offline** funktioniert
  - keine Netzwerkanfragen
  - gleiche JSON-Struktur beibehalten

## Akzeptanzkriterien (Definition of Done)

- App läuft als **statische Site** (z.B. Live Server) ohne Build.
- Keine externen Requests nötig.
- Nutzer kann:
  - Produkte anlegen/bearbeiten/archivieren
  - Sale mit mehreren Items speichern
  - Bestand erhöht sich durch Stock-In und sinkt durch Sales
  - Expense speichern
  - Today + Week Report sehen
  - Export JSON herunterladen
  - Import JSON laden (Roundtrip ohne Datenverlust)
- Alle gespeicherten Zeitstempel sind UTC ISO.
- Kein `.innerHTML` usage (Law 3).
- Jede Funktion liefert `{ success, data, error }` wo passend (MBRN Law).

## Tests / Smoke-Test (für Agent-1)

### Manual Smoke-Test (5 Minuten)

1. Products: 2 Produkte anlegen.
2. Stock: Produkt A stock-in qty 10.
3. Sale: Verkauf mit A qty 2, payment cash.
4. Expense: Ausgabe 5€ Kategorie “Transport”.
5. Reports: Today zeigt revenue/expense/profit plausibel.
6. Settings: Export → Import in frischer Session → Werte identisch.

### Optional: Jest/Unit Tests

Wenn Repo bereits Test-Konventionen hat, minimal:

- `computeStockOnHand()` richtig für multiple movements
- `profit_estimate` korrekt für simple dataset
- Import validator reject wenn `null` enthalten

## Klare No-Gos

- **Kein Backend** (Supabase, Server, Edge Functions) im MVP.
- **Keine externen APIs** (auch keine Market-Data, kein WhatsApp/Telegram).
- **Kein Scraping**.
- **Keine Login/User-Accounts**.
- **Keine PII-Sammlung** (kein Telefon, keine Adresse, keine echten Kundennamen). Max: `customer_label`.
- **Kein `.innerHTML`**.
- **Kein Build/Framework** (React/Vue/Svelte/Vite/etc.).
- Keine “Tax advice” / Compliance Claims.

## Design-Hinweis (MBRN-nativ)

- An bestehendes MBRN Design-System anlehnen:
  - klare Typo
  - dunkles Theme wenn Standard
  - große Buttons (phone-first)
  - keine überladenen Charts (MVP = Tabellen + Summaries)
