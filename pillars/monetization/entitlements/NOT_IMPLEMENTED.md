# /pillars/monetization/entitlements/ - NOT IMPLEMENTED

**Status:** RESERVED / NOT YET IMPLEMENTED

## Geplanter Zweck

Berechtigungs-Matrix und Feature-Entitlements.

- User → Feature-Mapping
- Entitlement-Berechnung
- Feature-Überprüfung
- Cross-Plan-Entitlements

## Warum leer?

YAGNI-Prinzip: Aktuell sind alle Features frei verfügbar.  
Keine komplexe Entitlement-Matrix nötig.

Entitlements werden relevant bei:
- Vielen verschiedenen Features
- Cross-Plan-Überschneidungen
- Add-On-Modell
- Complex-Feature-Dependencies

## Aktuelle Implementation

**Vereinfacht:** `pillars/monetization/gates/index.js`  
- Binary: Hat User Zugriff oder nicht
- Keine granularen Entitlements

## Wann implementiert?

Trigger-Bedingungen:
- Bei komplexer Feature-Matrix (>10 Features)
- Wenn Add-Ons zu Plänen kommen
- Bei Cross-Plan-Entitlement-Berechnung
- Wenn Feature-Dependencies existieren

## Verhindern von Verwechslung

**Dieser Ordner ist KEIN Versehen.**

Er ist reserviert für zukünftige Entitlement-Management-Infrastruktur. Nicht löschen, nicht mit Fake-Code füllen.

---

**Marker-Standard:** NOT_IMPLEMENTED.md = Bewusst reserviert, noch nicht umgesetzt.
