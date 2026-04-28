# First KEEP Candidate Implementation Blueprint

**Dimension:** S3_Data

**Status:** Blueprint

**Sektor:** C

**Last_Audit:** 2026-04-28

## 1) Final selected candidate

`CephasTechOrg/SikaBoafo` → **MBRN-native MVP: Offline Micro-Business Ledger**

## 2) Why this one wins

Against your selection criteria:

- **100% static Vanilla JS feasibility**
  - Fully works with `IndexedDB` + export/import.
  - Can be shipped as a static website + optional PWA offline cache.
- **Clear user value**
  - Daily operational pain: sales logging + inventory + profit clarity.
  - Strong “2 minutes/day” habit loop.
- **No backend/API requirement**
  - MVP requires no login, no syncing, no third-party integrations.
- **No legal risk (comparatively)**
  - Main risk is **PII minimization**, which is controllable by design (store no phone/address).
  - Avoids regulated/volatile domains (immigration, outreach automation, bank sync).
- **Fits MBRN Finance/Automation direction**
  - Money-core + local automation (fast summaries, repeatable flows).
  - Natural expansion path into receipts, exporting, and later optional integrations.
- **Can become a real website tool quickly**
  - Small number of screens, concrete inputs/outputs.
  - Works even for “one-person shop” immediately.

## 3) MVP scope

### In-scope (MVP)

- **Products**
  - Create/edit/archive product
  - Fields: name, unit, sell price, default buy price
- **Sales**
  - Create sale with multiple line items
  - Payment method: cash/card/other
- **Stock movements**
  - Stock-in (restock)
  - Stock-out (via sales)
- **Expenses**
  - Add expense entry
- **Reports (basic)**
  - Today + this week totals
  - Revenue, estimated COGS, expenses, estimated profit
  - Low-stock list
- **Data portability**
  - Export JSON
  - Import JSON

### Optional-but-allowed (still MVP-safe)

- **Customer debt tab** with strict minimization:
  - customer label only (no phone)
  - amount owed

## 4) Exact file structure

Target: **static website** (no build step).

Proposed structure (Vanilla JS modules with `.js` imports):

- `apps/ledger/`
  - `index.html`
  - `styles.css`
  - `app.js` (router + boot)
  - `state.js` (in-memory state, current view)
  - `db.js` (IndexedDB wrapper)
  - `models.js` (data shape + validation helpers)
  - `screens/`
    - `home.js`
    - `sale_new.js`
    - `stock.js`
    - `expense_new.js`
    - `reports.js`
    - `settings.js`
  - `components/`
    - `nav.js`
    - `product_picker.js`
    - `money_input.js`
  - `utils/`
    - `time_utc.js`
    - `format.js`

Notes:

- Screen files only render DOM via `document.createElement` or existing MBRN DOM utils (no `.innerHTML`).
- All timestamps stored as `timestamp_utc` ISO strings.

## 5) Data model

All stored locally. **No nulls in exports** (use empty strings / 0 / empty arrays).

### Entities

- `product`
  - `id` (string)
  - `name` (string)
  - `unit` (string, e.g. `pcs`, `kg`)
  - `sell_price_cents` (integer)
  - `buy_price_cents_default` (integer)
  - `created_at_utc` (ISO string)
  - `archived` (boolean)

- `sale`
  - `id`
  - `timestamp_utc`
  - `payment_method` (`cash`/`card`/`other`)
  - `items` (array of `sale_item`)

- `sale_item`
  - `product_id`
  - `qty` (number)
  - `unit_price_cents` (integer)

- `stock_movement`
  - `id`
  - `timestamp_utc`
  - `product_id`
  - `type` (`in`/`out`)
  - `qty` (number)
  - `unit_buy_price_cents` (integer)
  - `note` (string)

- `expense`
  - `id`
  - `timestamp_utc`
  - `amount_cents` (integer)
  - `category` (string)
  - `note` (string)

### Derived views (computed, not stored)

- `stock_on_hand_by_product_id`
  - sum(stock-in) - sum(stock-out)
- `revenue`
  - sum(sale items * unit price)
- `cogs_estimate`
  - sum(qty * unit buy price) for stock-out movements (fallback to product default)

## 6) UI sections

Phone-first, fast taps:

- **Top nav**
  - Home
  - Stock
  - Reports
  - Settings

- **Home / Today**
  - Primary actions
  - Today totals
  - Low stock warnings

- **New Sale**
  - Product picker
  - Cart list
  - Payment selector
  - Save

- **Stock**
  - Stock list
  - Add stock button

- **Add Expense**
  - Amount
  - Category
  - Note
  - Save

- **Reports**
  - Today / Week summary toggles
  - Simple tables

- **Settings**
  - Export
  - Import
  - Reset

## 7) User flow

1. User opens the site (offline-capable).
2. First-time setup:
   - Add 3-10 products.
3. Daily usage:
   - Tap `New Sale` → add items → save.
   - If restocking: `Stock` → `Add Stock`.
   - If cost happens: `Add Expense`.
4. Weekly:
   - Open `Reports` → see profit estimate + top sellers.
5. Backup:
   - `Settings` → Export JSON file.

## 8) Acceptance criteria

MVP is accepted when:

- App works fully offline after first load (if PWA cache is enabled).
- User can:
  - create products
  - record a sale with multiple items
  - restock inventory
  - record an expense
  - see today + week totals
  - export and re-import data (round-trip without loss)
- Stock on hand updates correctly after sales/restocks.
- All stored timestamps are UTC ISO strings.
- No external network calls are required for core features.

## 9) Things explicitly excluded

To keep risk and scope controlled:

- Any bank connections / Open Banking
- Any payment processing / payment links
- Any automatic messaging (WhatsApp/Telegram) integrations
- Any scraping
- Any cloud sync / login
- Any “tax advice” or jurisdiction-specific compliance claims
- Any storing of customer phone numbers / addresses in MVP

## 10) Implementation order

1. **Data model + validation helpers** (`models.js`)
2. **IndexedDB layer** (`db.js`) + basic CRUD for entities
3. **App shell + navigation** (`app.js`, `components/nav.js`)
4. **Products screen** (create/edit/archive)
5. **New Sale screen** (cart + save)
6. **Stock screen** (stock list + add stock)
7. **Expense screen**
8. **Reports screen** (today/week aggregates)
9. **Settings screen** (export/import/reset)
10. Optional: **PWA offline cache** (service worker + manifest) if allowed by current frontend constraints
