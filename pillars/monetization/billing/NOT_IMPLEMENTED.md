# /pillars/monetization/billing/ - NOT IMPLEMENTED

**Status:** RESERVED / NOT YET IMPLEMENTED

## Geplanter Zweck

Billing-Logik und Rechnungsstellung.

- Rechnungsgenerierung
- Steuerberechnung
- Rechnungshistorie
- Rückerstattungs-Logik

## Warum leer?

YAGNI-Prinzip: Billing-Logik ist aktuell in `commerce/stripe/` implementiert.  

Dediziertes Billing wird erst relevant bei:
- Multi-Gateway-Support (nicht nur Stripe)
- Komplexer Steuer-Logik
- Eigenständiger Rechnungsstellung
- Enterprise-Billing (Rechnung, nicht Karte)

## Aktuelle Implementation

**Extern:** `commerce/stripe/checkout/`, `commerce/stripe/webhooks/`

## Wann implementiert?

Trigger-Bedingungen:
- Wenn mehrere Zahlungsanbieter unterstützt werden
- Bei komplexer Steuer-Logik (EU VAT, etc.)
- Whend Enterprise-Rechnungsstellung benötigt wird
- Bei Migration von Stripe zu Multi-Gateway

## Verhindern von Verwechslung

**Dieser Ordner ist KEIN Versehen.**

Er ist reserviert für zukünftige Billing-Infrastruktur. Nicht löschen, nicht mit Fake-Code füllen.

---

**Marker-Standard:** NOT_IMPLEMENTED.md = Bewusst reserviert, noch nicht umgesetzt.
