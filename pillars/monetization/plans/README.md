# /pillars/monetization/plans/

**Status:** ACTIVE

Diese Zone definiert die kanonischen Monetization-Plaene.

## Aktueller Stand

- `free`
- `pro`
- `business`

`plan.productIds` ist die primaere Fachwahrheit. `accessLevel` bleibt nur Aufloesungs- und Vergleichsschicht.

- `pro` wird ueber das kaufbare Einzelprodukt `artifact` aktiviert
- `business` ist die kaufbare Bundle-Subscription
- `plan_id` ist die persistierte Primärwahrheit fuer aktive Profile
