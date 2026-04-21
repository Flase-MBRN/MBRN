# Pillar Charter: frontend_os

> [!NOTE]
> Dieses Dokument definiert den operativen Auftrag und den Qualitätsrahmen für den Pillar `frontend_os`.
> Es ist die verbindliche Richtlinie für alle Architektur- und Design-Entscheidungen im Frontend.

## 1. Der Auftrag (1-Satz-Definition)
Verantwortlich für die sichtbare Produkt-Oberfläche, den einheitlichen Nutzerfluss und die ästhetische sowie funktionale Kohärenz des gesamten MBRN-Ökosystems.

---

## 2. Interface-Definition

### Inputs (Was dieser Pillar konsumiert)
- **`shared/application/*`**: Runtime-Funktionen, Auth-Status, konsumierbare API-Wrapper.
- **`shared/ui/*`**: Design-Primitives (CSS-Variablen, Basis-Komponenten).
- **`shared/core/registries/*`**: Metadaten über verfügbare Dimensionen und Apps.

### Outputs (Was dieser Pillar liefert)
- **MBRN Hub**: Ein zentrales Dashboard zur Daten-Aggregation.
- **Unified Surface**: Konsistente App-Interfaces (Finance, Numerology etc.).
- **Navigation Flow**: Ein nahtloses Browser-Erlebnis ohne Brüche zwischen den Tools.
- **Export Assets**: Hochwertige visuelle Exporte (PDFs, Share-Cards).

---

## 3. Nicht-Zuständigkeiten (Out of Scope)
- **Business-Logik**: Berechnungen (z.B. Zinseszins, Numerologie-Algorithmen) finden in `shared/core/logic/` statt.
- **Daten-Provision**: Der Zugriff auf Supabase oder APIs wird von `shared/application/*` oder `bridges/*` abstrahiert.
- **Pillar-Logik**: Die fachliche Signal-Erzeugung gehört zu `oracle`, nicht zu `frontend_os`.

---

## 4. Reifegrad & Status

**Aktueller Status:** `PRODUKTNAH / HÄRTUNG`

| Aspekt | Status | Notiz |
| :--- | :--- | :--- |
| **Design System** | Stable | `theme.css` und `components.css` sind gehärtet. |
| **Navigation** | Stable | Dynamisches Routing und Shell-Komposition sind aktiv. |
| **App-Integrität**| Provisional| Finance & Numerologie sind integriert, aber der Rückfluss zum Dashboard ist teils noch statisch. |
| **WTF-Moment** | Implemented | Landing Page Design erfüllt den Standard. |

---

## 5. Fertig-Definition (Definition of Done)
`frontend_os` gilt als „fertig genug“, wenn:
1.  Alle sichtbaren Apps eine **identische Design-Identität** atmen (Medical Luxury Glow).
2.  Ein Nutzer sich **ohne kognitiven Bruch** zwischen Landing Page, Dashboard und Apps bewegen kann (Einheitlicher Strom).
3.  Das Dashboard **echte Live-Daten** aus dem Oracle-Pillar aggregiert und visualisiert.
4.  Jede Oberfläche den **"WTF-Moment"** (Qualität vor Sichtbarkeit) widerspiegelt.

---

## 6. Evidence Map (Die Beweise)
Die folgenden Dateien belegen die operative Umsetzung dieses Pillars:

1.  **[index.html](file:///c:/DevLab/MBRN-HUB-V1/index.html)**: Beweis für die Landing-Page-Komposition und Design-Hoheit.
2.  **[dashboard/index.html](file:///c:/DevLab/MBRN-HUB-V1/dashboard/index.html)**: Beweis für den zentralen Hub und die Aggregations-Fähigkeit.
3.  **[pillars/frontend_os/navigation/index.js](file:///c:/DevLab/MBRN-HUB-V1/pillars/frontend_os/navigation/index.js)**: Beweis für den plattformweiten Nutzerfluss.
4.  **[shared/ui/theme.css](file:///c:/DevLab/MBRN-HUB-V1/shared/ui/theme.css)**: Beweis für das systemweite Design-System.

---

## 7. Anti-Chaos-Check
Frage für jede Änderung an diesem Pillar:
**„Macht diese Änderung den Nutzerfluss klarer und das Erlebnis einheitlicher, oder fügt sie lediglich neue visuelle Komplexität hinzu?“**
