# /pillars/monetization/ - Monetization

**Status:** ACTIVE

Dieses Pillar traegt die repo-weite Businesslogik fuer Produkte, Plaene, Entitlements, Billing-Zustaende und Gates.

## Kanonische Fachkette

1. `api_products/`
2. `pricing/`
3. `plans/`
4. `entitlements/`
5. `billing/`
6. `gates/`

## Aktuelles Planmodell

- `free`
  - keine kommerziellen Produktfeatures
- `pro`
  - wird ueber das kaufbare Einzelprodukt `artifact` aktiviert
- `business`
  - ist die kaufbare Bundle-Subscription
  - enthaelt `artifact`, `oracle_snapshot` und `api_access`

Wichtig:

- `plan.productIds` und daraus abgeleitete Entitlements sind die primaere Fachwahrheit
- `accessLevel` bleibt nur Aufloesungs- und Vergleichsschicht
- `plan_id` ist die repo-weite Primaerwahrheit
- `access_level` bleibt nur kompatibler Sortier- und Spiegelwert

## Trennung

- `pillars/monetization/*` entscheidet das **Was**
- `commerce/*` liefert das **Wie**

Provider-SDKs und Providerdetails gehoeren nicht in dieses Pillar.

## Oeffentlich vs. privat

Oeffentliche fachliche Wahrheit:

- `pillars/monetization/api_products/index.js`
- `pillars/monetization/plans/index.js`
- `pillars/monetization/entitlements/index.js`
- `pillars/monetization/billing/index.js`
- `pillars/monetization/gates/entitlement_gate.js`
- `pillars/monetization/index.js`

Private technische Ausfuehrung:

- `supabase/functions/stripe-checkout/index.ts`
- `supabase/functions/stripe-webhook/index.ts`

Diese technischen Pfade transportieren die fachlichen Felder, definieren sie aber nicht.

## Marker-Wahrheit

Aktive Monetization-Zonen werden nicht mehr als `NOT_IMPLEMENTED` markiert.

- `plans/`, `pricing/`, `api_products/`, `billing/` und `entitlements/` tragen ehrliche `README.md`
- `gates/` bleibt aktive UI-sichere Gate-Zone

## Repo-weite Wahrheit

Legacy-Zugriffshilfen ausserhalb des Pillars muessen sich an dieser Plan- und Entitlement-Wahrheit ausrichten.

- `profiles.plan_id` ist die kanonische Persistenzwahrheit
- `transactions.plan_id` und `transactions.product_id` loggen dieselbe Fachkette
- alte Tier-Namen sind keine eigenstaendige Policy-Quelle mehr
