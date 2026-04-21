# Pillar Charter: oracle

> [!NOTE]
> Dieses Dokument definiert den operativen Auftrag und den Qualitätsrahmen für den Pillar `oracle`. 
> Es stellt sicher, dass der Maschinenraum für Daten und Signale belastbar, reproduzierbar und sauber abgegrenzt bleibt.

## 1. Der Auftrag (1-Satz-Definition)
Verantwortlich für die Erfassung von Rohdaten, die Ableitung valider Signale (Sentiment, Trends) und die Bereitstellung reproduzierbarer Intelligenz-Outputs für das Gesamtsystem.

---

## 2. Verantwortungsraum (Responsibility Scope)
- **Daten-Veredelung**: Transformation von Roh-Inputs in normalisierte System-Signale.
- **Signal-Engineering**: Definition und Pflege von Metriken (z.B. MBRN Sentiment Score).
- **Snapshot & Backtesting**: Erzeugung historisch belastbarer Datenzustände und deren Verifizierung.
- **Intelligenz-Orchestrierung**: Steuerung der Python-basierten Processing-Logik aus einer zentralen Pillar-Wahrheit heraus.

---

## 3. Interface-Definition

### Inputs (Was dieser Pillar konsumiert)
- **Rohdaten**: Marktdaten via `bridges/python/`, Browser-Reads, manuelle Signale.
- **Nutzer-Kontext**: Profile und Präferenzen zur Personalisierung von Vorhersagen.
- **System-Trigger**: Zeitgesteuerte Events für Batch-Processing oder Snapshots.

### Outputs (Was dieser Pillar liefert)
- **Normalisierte Signale**: Konsumierbare Scores (0-100) für Apps und Dashboard.
- **Analytische Snapshots**: Versionierte Zustandsabbilder für Backtesting und Historisierung.
- **Vorhersagen (Predictions)**: Strukturierte JSON-Artefakte für die Frontend-Visualisierung.
- **Derived Artifacts**: Konsolidierte Datenberichte (z.B. PDF-Rohdaten).

---

## 4. Nicht-Zuständigkeiten (Non-responsibilities)
- **Benutzeroberfläche (UI)**: Oracle liefert Daten, rendert aber keine einzige Pixel-Fläche. Das ist Aufgabe von `frontend_os`.
- **Wahrnehmung von Wert**: Die Entscheidung, welcher Nutzer welchen Oracle-Output sehen darf, liegt bei `monetization`.
- **Infrastruktur-IO**: Die technischen HTTP-Requests oder DB-Anbindungen liegen in den `bridges/*`.
- **Generierung**: Oracle analysiert die Welt; die Welt *erzeugen* (Blueprints) macht der `meta_generator`.

---

## 5. Reifegrad & Status (Maturity Framing)

**Aktueller Status:** `IMPLEMENTED / OPERATIVE ENGINE`

| Aspekt | Status | Notiz |
| :--- | :--- | :--- |
| **Pipeline-Struktur** | Implemented | Die Orchestrierung via `processing/` ist aktiv. |
| **Signal-Logik** | Stable | Sentiment-Scores und Basis-Signale sind operativ. |
| **Standardisierung** | Provisional | Standard-Verträge für I/O müssen noch konsequenter durchgesetzt werden. |
| **Backtesting** | Experimental | Infrastruktur vorhanden, Tiefe der historischen Abgleiche wächst. |

---

## 6. Evidence Map (Die Beweise)
Die folgenden Dateien belegen die operative Substanz dieses Pillars:

1.  **[pillars/oracle/processing/python/prediction_pipeline.py](file:///c:/DevLab/MBRN-HUB-V1/pillars/oracle/processing/python/prediction_pipeline.py)**: Der Kern der Vorhersage-Logik.
2.  **[pillars/oracle/signals/index.js](file:///c:/DevLab/MBRN-HUB-V1/pillars/oracle/signals/index.js)**: Die fachliche Definition der Signale in der Runtime.
3.  **[pillars/oracle/artifacts.js](file:///c:/DevLab/MBRN-HUB-V1/pillars/oracle/artifacts.js)**: Die kanonische Definition aller Oracle-Outputs.
4.  **[scripts/pipelines/sentinel_daemon.py](file:///c:/DevLab/MBRN-HUB-V1/scripts/pipelines/sentinel_daemon.py)**: Die operative Ausführungsschicht.

---

## 7. Fertig-Definition (Definition of Done)
`oracle` gilt als „fertig genug“, wenn:
1.  Alle Inputs über **standardisierte Bridges** einfließen (kein Wildwuchs).
2.  Outputs (Signals, Snapshots) **reproduzierbar** sind (gleicher Input → gleicher Score).
3.  Mindestens **zwei Konsumenten** (z.B. Dashboard und PDF-Engine) die Daten stabil nutzen.
4.  Der Maschinenraum nachvollziehbar dokumentiert ist (keine „Black Box“ im Core).

---

## 8. Anti-Chaos-Regel
Frage für jede Änderung an diesem Pillar:
**„Macht diese Änderung unsere Signale belastbarer und die Datenveredelung klarer, oder ist es nur ein neues loses Skript ohne Einordnung in den v3.1-Kanon?“**
