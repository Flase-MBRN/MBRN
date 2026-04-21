# Pillar Charter: monetization

> [!NOTE]
> Dieses Dokument definiert den operativen Auftrag und den Qualitätsrahmen für den Pillar `monetization`.
> Es stellt sicher, dass die fachliche Wertelogik von der technischen Zahlungsabwicklung getrennt bleibt und das System jederzeit "aktivierungsbereit" ist.

## 1. Der Auftrag (1-Satz-Definition)
Verantwortlich für die Definition von Plänen, Berechtigungen (Entitlements) und Zugriffsregeln sowie die Bereitstellung einer fachlich aktivierbaren Wertelogik.

---

## 2. Verantwortungsraum (Responsibility Scope)
- **Produkt-Modellierung**: Fachliche Definition von `api_products` und deren Paketen.
- **Preis-Logik**: Festlegung der Preisstruktur (`pricing`) und Währungszuordnungen.
- **Plan-Management**: Verwaltung der kanonischen Plan-Typen (`free`, `pro`, `business`) und deren Eigenschaften.
- **Entitlement Governance**: Zentrale Definition, welche Aktion welchen Plan oder welches Produkt erfordert.
- **Access Control (Gating)**: Bereitstellung von sicheren Prüfmechanismen (`gates`) für die App-Runtime.

---

## 3. Interface-Definition

### Inputs (Was dieser Pillar konsumiert)
- **Zahlungs-Bestätigungen**: Signale über erfolgreiche Käufe (via Gateway-Adapter abstrahiert).
- **Nutzer-Status**: Aktuelle `plan_id` aus dem Nutzerprofil (Supabase).
- **System-Konfiguration**: Globale Preis- und Produkt-Identifier.

### Boundary-Hinweis
- **Oeffentlich fachlich**: `pillars/monetization/*` definiert Plans, Entitlements, Billing-Zustaende, Gates und den repo-weiten Produktkatalog.
- **Privat technisch**: Checkout-, Webhook- und Provider-Implementierungen bleiben ausserhalb dieses Pillars, auch wenn sie dieselben Felder (`plan_id`, `product_id`, `access_level`) transportieren.

### Outputs (Was dieser Pillar liefert)
- **Zugriffs-Entscheidungen**: Erlaubnis oder Verweigerung einer Aktion (`canAccess()`).
- **Plan-Details**: Beschreibbare Metadaten für das UI (Preise, Features).
- **Billing-Status**: Der aktuelle Stand der Berechtigungen eines Operators.
- **Verifikations-Kontrakte**: Schnittstellen zur Validierung von Transaktionen.

---

## 4. Nicht-Zuständigkeiten (Non-responsibilities)
- **Zahlungs-Abwicklung (Commerce)**: `monetization` macht keine API-Calls zu Stripe und kennt keine Webhook-Secrets. Das ist Aufgabe von `commerce/*`.
- **Benutzeroberfläche (UI)**: Monetization liefert die Regeln; die Darstellung (Payment-Wall, Billing-Page) übernimmt `frontend_os`.
- **Daten-Veredelung (Oracle)**: Die Metrik-Erzeugung gehört zu `oracle`. Monetization entscheidet nur, ob der Nutzer sie sehen darf.
- **Generierung**: Die Erzeugung von Inhalten ist Aufgabe des `meta_generator`.

---

## 5. Reifegrad & Status (Maturity Framing)

**Aktueller Status:** `STABLE / NOT PUBLICLY ACTIVATED`

| Aspekt | Status | Notiz |
| :--- | :--- | :--- |
| **Fachkette (Schema)** | Stable | Die Struktur von `plans` bis `gates` ist vollständig definiert. |
| **Logic (Gates)** | Implemented | Die Runtime-Prüfungen sind aktiv und operativ. |
| **Aktivierungsreife** | Ready | Das System kann ohne Architekturumbau durch Anbindung eines Gateways live geschaltet werden. |
| **Öffentliche Aktivierung**| **OFF** | Die Monetarisierung ist intern vorbereitet, aber noch nicht öffentlich aktiv geschaltet. |

---

## 6. Evidence Map (Die Beweise)
Die folgenden Dateien belegen die operative Substanz dieses Pillars:

1.  **[pillars/monetization/plans/index.js](file:///c:/DevLab/MBRN-HUB-V1/pillars/monetization/plans/index.js)**: Die kanonische Definition der MBRN-Pläne.
2.  **[pillars/monetization/gates/entitlement_gate.js](file:///c:/DevLab/MBRN-HUB-V1/pillars/monetization/gates/entitlement_gate.js)**: Die zentrale Logik für den Zugriffsschutz.
3.  **[pillars/monetization/billing/index.js](file:///c:/DevLab/MBRN-HUB-V1/pillars/monetization/billing/index.js)**: Die UI-sichere Ableitung von Billing-Zustaenden innerhalb der Fachkette.
4.  **[pillars/monetization/index.js](file:///c:/DevLab/MBRN-HUB-V1/pillars/monetization/index.js)**: Die orchestrierte oeffentliche Pillar-Schnittstelle fuer Produkt-, Plan-, Billing- und Gate-Entscheidungen.

---

## 7. Fertig-Definition (Definition of Done)
`monetization` gilt als „fertig genug“, wenn:
1.  **Keine Logikstreuung** existiert (alle Zugriffsentscheidungen laufen über diesen Pillar).
2.  Das **Plan-Modell** (`free`, `pro`, `business`) fachlich konsistent ist.
3.  Die **Schnittstelle zu Commerce** sauber abstrahiert ist (Pillar muss ohne Provider-Code funktionieren).
4.  Die **Aktivierung** nur noch eine strategische/operative Entscheidung ist, keine architektonische Herausforderung mehr.

---

## 8. Anti-Chaos-Regel
Frage für jede Änderung an diesem Pillar:
**„Schärft diese Änderung unsere fachliche Wertelogik und Zugriffsregelung, oder vermischen wir sie gerade mit der technischen Implementierung eines Providers?“**
