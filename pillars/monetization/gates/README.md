# /pillars/monetization/gates/ - Entitlement Gates

**Status:** ACTIVE (Minimal Implementation)

## Zweck

Feature-Gates und Berechtigungsprüfung für Premium-Features.

Dieser Ordner definiert **WELCHE** Features wann verfügbar sind (Business-Logik).  
Die technische Umsetzung (Zahlungsabwicklung) liegt in `commerce/stripe/`.

## Architektur: Trennung monetization vs. commerce

```
┌─────────────────────────────────────────────────────────┐
│  pillars/monetization/     ← WAS wird verkauft         │
│  - gates/                  ← Feature-Entscheidungen    │
│  - pricing/                ← Preisgestaltung (geplant)  │
│  - plans/                  ← Abo-Modelle (geplant)       │
└────────────────────────┬────────────────────────────────┘
                         │ Business-Entscheidung
                         ▼
┌─────────────────────────────────────────────────────────┐
│  commerce/stripe/          ← WIE wird abgerechnet      │
│  - checkout/               ← Zahlungsabwicklung        │
│  - webhooks/               ← Stripe-Events             │
│  - gates/                  ← Technische Gate-Prüfung     │
└─────────────────────────────────────────────────────────┘
```

## Aktuelle Implementierung

### gates/index.js
- **canAccessFeature(userId, feature)** - Prüft Feature-Zugriff
- **getUserTier(userId)** - Ermittelt Nutzer-Tier
- **TIER_FREE = 0** - Kostenloser Basis-Zugang
- **TIER_PREMIUM = 1** - Premium-Features

## Business-Gates vs. Technical-Gates

| Aspekt | pillars/monetization/gates | commerce/stripe/gates |
|--------|---------------------------|----------------------|
| **Scope** | WAS ist erlaubt? | WIE wird geprüft? |
| **Beispiel** | "Premium-User darf 5 Berechnungen/Tag" | "Prüfe Stripe Subscription Status" |
| **Ändert sich bei** | Preisänderung, neue Features | Zahlungsgateway-Wechsel |
| **Implementierung** | Business-Logik, Quotas | API-Calls, Caching |

## Geplante Erweiterungen

### Zukünftige Gates (Meta-Generator Phase)
- Feature-basierte Gates ("Numerologie-Pro", "Oracle-Pro")
- Usage-basierte Gates (API-Calls, Berechnungen)
- Time-basierte Gates (Early Access, Beta-Features)

### Integration mit
- `pillars/monetization/plans/` - Abo-Modelle definieren Gates
- `pillars/monetization/entitlements/` - Berechtigungs-Matrix

## Verwendung

```javascript
import { canAccessFeature, TIER_PREMIUM } from '../../../pillars/monetization/gates/index.js';

// Business-Logik Prüfung
if (canAccessFeature(userId, 'advanced_numerology')) {
  renderAdvancedFeatures();
} else {
  showUpgradePrompt();
}
```

---

**Hinweis:** Dieser Ordner ist aktiv. Änderungen hier beeinflussen das Geschäftsmodell.
