# KEEP Candidate Deep Review

**Dimension:** S3_Data

**Status:** Review

**Sektor:** C

**Last_Audit:** 2026-04-28

## Scope

Deep review of the **2 KEEP** candidates from `docs/S3_Data/reviews/build_now_diamond_review.md`:

- `CephasTechOrg/SikaBoafo`
- `gmontalvo404/minerva`

Focus: MBRN-native MVP shape, local-first, 0€ infra, static Vanilla JS feasibility, and what to avoid copying.

---

## 1) `CephasTechOrg/SikaBoafo`

### (SikaBoafo) 1. What is the actual user problem?

Micro / informal business owners (often phone-first) typically have:

- No consistent way to log sales (cash + simple invoices)
- No reliable inventory picture (stock goes missing, reorders are late)
- No clean “profit” view (sales vs expenses is blurry)
- Customer debt tracking done in WhatsApp notes or memory

Result: they can’t answer basic questions quickly:

- “What’s my actual profit this week?”
- “Which items are running out?”
- “Who owes me money and how much?”

### (SikaBoafo) 2. What would the MBRN-native MVP be?

**MVP name:** Offline Micro-Business Ledger

**MVP wedge:** “Profit + stock clarity in 2 minutes/day, fully offline.”

Core capabilities (minimum):

- **Catalog**
  - Create products (name, unit, buy price, sell price)
- **Stock moves**
  - Stock-in (purchase/restock)
  - Stock-out (sale)
- **Sales receipt**
  - Quick sale entry (items + qty + payment method)
- **Expenses**
  - Simple expense logging (amount, category, note)
- **Daily/weekly summary**
  - Revenue, COGS estimate, expenses, profit estimate
- **Export/backup**
  - One-click JSON export and re-import (USB/Drive/manual share)

Optional but powerful (still MVP-ish):

- **Customer debts** with strict minimization (nickname + amount + last update)

### (SikaBoafo) 3. Can it be built 100% static with Vanilla JS?

**Yes.**

- Data storage: `IndexedDB` (preferred) or `localStorage` (only if very small).
- Offline-first: PWA manifest + service worker (static hosting ok).
- Export/import: file download/upload.

**No backend needed** for MVP. Sync (multi-device) can be a later paid feature.

### (SikaBoafo) 4. What exact screen/UI would it need?

Keep it brutally simple, phone-first:

1. **Home / Today**
   - Big buttons: `New Sale`, `Add Stock`, `Add Expense`
   - Today summary card
2. **New Sale**
   - Product picker (search)
   - Qty stepper
   - Payment method (cash / card / other)
   - Save
3. **Stock**
   - Current stock list + low-stock indicator
   - `Add Stock` flow: product, qty, buy price override (optional)
4. **Expenses**
   - Add expense form
   - Recent expenses list
5. **Reports**
   - This week / month summary
   - Top selling products
6. **Settings / Data**
   - Export JSON
   - Import JSON
   - Reset local data (danger)

### (SikaBoafo) 5. What data does it need?

Minimal local schema (conceptually):

- `products`
  - `id`, `name`, `unit`, `sell_price`, `buy_price_default`, `created_at_utc`
- `inventory_movements`
  - `id`, `product_id`, `type` (`in`/`out`), `qty`, `unit_buy_price`, `timestamp_utc`, `note`
- `sales`
  - `id`, `timestamp_utc`, `payment_method`, `items[]` (`product_id`, `qty`, `unit_price`)
- `expenses`
  - `id`, `timestamp_utc`, `amount`, `category`, `note`
- (optional) `customers`
  - `id`, `label` (not real name), `created_at_utc`
- (optional) `debts`
  - `id`, `customer_id`, `delta_amount`, `timestamp_utc`, `note`

Strictly **UTC timestamps** for storage.

### (SikaBoafo) 6. What should NOT be copied from the original repo?

- Anything that assumes a paid backend / account system for MVP.
- Any “digital payments collection” or financial product claims.
- Any region-specific flows hardcoded (tax rules, Ghana-specific identifiers) unless explicitly targeted.
- Any heavy UI framework/build pipeline dependencies.

Also avoid:

- Collecting excessive customer PII (phone numbers, addresses) in MVP.

### (SikaBoafo) 7. Final verdict

#### BUILD FIRST

Reason:

- Strong real-world value.
- Very compatible with **local-first + 0€ infra + static Vanilla JS**.
- Monetization can be ethical and simple (one-time purchase, pro export formats, paid onboarding).

---

## 2) `gmontalvo404/minerva`

### (Minerva) 1. What is the actual user problem?

People who do not want bank integrations still need:

- A clean view of cashflow over months
- A way to plan recurring bills
- A simple “paid / received” status tracker

The pain is not “lack of tools”, it’s:

- Tools are too complex (accounting)
- Tools demand cloud accounts / subscriptions
- Tools push bank sync (privacy concern)

### 2. What would the MBRN-native MVP be?

**MVP name:** MBRN Cashflow Board (Local)

**MVP wedge:** “Plan your next 90 days cash without linking a bank.”

Core capabilities (minimum):

- **Income streams** (recurring + one-off)
- **Expense items** (recurring + one-off)
- **Calendar-like monthly view** with totals
- **Paid/received toggles**
- **Import/export** JSON

Nice-but-not-required:

- CSV import template (manual export from bank → user maps columns)

### 3. Can it be built 100% static with Vanilla JS?

**Yes.**

- Same approach: `IndexedDB` + export/import.
- Charts can be lightweight (Canvas or simple SVG) or just tables.
- No bank sync; no backend.

### 4. What exact screen/UI would it need?

Keep it as a 4-screen tool:

1. **Dashboard**
   - Current month summary
   - Next month forecast
   - Cash runway indicator (simple)
2. **Planner (Month View)**
   - Months as columns/rows
   - Income list + expense list
   - Totals per month
3. **Transactions / Items**
   - List of planned items with filters (due date, category)
   - Toggle `paid` / `received`
4. **Settings / Data**
   - Currency
   - Export/import JSON
   - Optional CSV import wizard

### 5. What data does it need?

Minimal local schema:

- `items`
  - `id`
  - `type` (`income`/`expense`)
  - `label`
  - `amount`
  - `currency`
  - `schedule` (one-off date OR recurring rule)
  - `status_overrides` (paid/received instances by month)
  - `timestamp_utc_created`

MVP can model recurring schedules as:

- monthly on day N
- weekly on weekday
- yearly

Keep it simple to avoid edge-case explosion.

### 6. What should NOT be copied from the original repo?

- Any unnecessary “multi-language / theme switching” complexity if it slows MVP.
- Any “finance advice” tone or recommendation engine.
- Any feature that requires external APIs (market data, bank sync).

Avoid:

- Over-engineered forecasting that implies certainty.

### (Minerva) 7. Final verdict

#### BUILD LATER

Reason:

- Very feasible and safe, but it competes with a ton of existing local finance trackers.
- Stronger first wedge for MBRN is the micro-business ledger (more urgent pain, clearer willingness-to-pay, less saturated).

If you later build it, positioning must be sharp:

- privacy-first
- bank-sync optional (or never)
- “90-day runway clarity”
