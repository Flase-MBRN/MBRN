# /pillars/monetization/ - Monetization

**Status:** ACTIVE

Dieses Pillar traegt die policy-grade Businesslogik fuer Produkte, Plaene, Entitlements, Billing-Zustaende und Gates.

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
  - enthaelt `artifact`
  - ist das aktuelle checkout-faehige Basismodell
- `business`
  - enthaelt `oracle_snapshot` und `api_access`
  - ist fachlich real, aber in dieser Welle nicht automatisch voll kaufbar

Wichtig:

- `plan.productIds` und daraus abgeleitete Entitlements sind die primaere Fachwahrheit
- `accessLevel` bleibt nur Aufloesungs- und Vergleichsschicht
- `business` ist kein Marketing-Versprechen, sondern eine fachlich reale Policy-Stufe

## Trennung

- `pillars/monetization/*` entscheidet das **Was**
- `commerce/*` liefert das **Wie**

Provider-SDKs und Providerdetails gehoeren nicht in dieses Pillar.
