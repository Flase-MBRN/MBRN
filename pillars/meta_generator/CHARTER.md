# Pillar Charter: meta_generator

> [!NOTE]
> Dieses Dokument definiert den operativen Auftrag und den Qualitätsrahmen für den Pillar `meta_generator`. 
> Es stellt sicher, dass Generierung als strukturierter, blueprint-gesteuerter Prozess verstanden wird und nicht in unkontrollierte KI-Autonomie abgleitet.

## 1. Der Auftrag (1-Satz-Definition)
Verantwortlich für die Definition von Blueprint-Standards, die Bereitstellung von Modul-Scaffolds und die Steuerung der strukturierten System-Generierung.

---

## 2. Verantwortungsraum (Responsibility Scope)
- **Blueprint-Engineering**: Definition und Pflege von technischen Bauplänen (`blueprints`).
- **Scaffold-Produktion**: Bereitstellung von wiederverwendbaren Modul-Gerüsten (`modules`) für neue Dimensionen oder Apps.
- **Inhalts-Strukturierung**: Verwaltung von standardisierten Inhaltsmustern (`content`) für Dokumentation und Roadmaps.
- **Agent-Orchestrierung**: Bereitstellung von strukturierten Adaptern (`agent_adapters`) für die Zusammenarbeit mit KI-Modellen.
- **Asset-Spezifikation**: Definition technischer und visueller Bausteine (`assets`).

---

## 3. Interface-Definition

### Inputs (Was dieser Pillar konsumiert)
- **Architektur-Patterns**: Die 15 Gesetze und v3.1-Vorgaben als Randbedingungen.
- **UI-Komponenten**: Bestehende Design-Primitives für die Scaffold-Erzeugung.
- **Workflow-Requests**: Spezifische Anforderungen für neue Module oder Dokumente.

### Outputs (Was dieser Pillar liefert)
- **Modul-Scaffolds**: Vorbereitete Ordnerstrukturen und Basis-Dateien.
- **Standardisierte Blueprints**: JSON-Spezifikationen für das System-Wachstum.
- **Work-Orders**: Strukturierte Pakete für KI-Agenten zur teilautomatisierten Umsetzung.
- **Generierte Dokumente**: Automatisiert erzeugte Status-Berichte oder Roadmaps.

---

## 4. Nicht-Zuständigkeiten (Non-responsibilities)
- **Freie AI-Autonomie**: Der Generator ist kein "freies LLM-Chat-Tool". MBRN gibt die Struktur vor; der Generator übersetzt sie nur.
- **Benutzeroberfläche (UI)**: Der Generator erzeugt die *Struktur* für Oberflächen, führt aber kein Rendering durch (`frontend_os`).
- **Daten-Processing**: Die Analyse der Außenwelt gehört zu `oracle`. Der Generator befasst sich mit der *Innenwelt* des Systems (Strukturen).
- **Wertelogik**: Die monetäre Einordnung von Modulen liegt bei `monetization`.

---

## 5. Reifegrad & Status (Maturity Framing)

**Aktueller Status:** `PROVISIONAL / NOT FULLY INDUSTRIALIZED`

| Aspekt | Status | Notiz |
| :--- | :--- | :--- |
| **Blueprint-Struktur** | Implemented | Basis-Speicherorte und Schemata sind vorhanden. |
| **Workflow-Integration**| Active | Wird bereits für die Generierung von Roadmaps genutzt. |
| **Wiederverwendbarkeit**| Provisional | Scaffolding-System ist in der Preview-Phase, aber noch nicht industrialisiert. |
| **Autonomie** | **OFF** | Keine ungesteuerte Generierung; immer durch Work-Orders geführt. |

---

## 6. Evidence Map (Die Beweise)
Die folgenden Dateien belegen die operative Substanz dieses Pillars:

1.  **[scripts/devlab/generate_app_blueprint_bundle.mjs](file:///c:/DevLab/MBRN-HUB-V1/scripts/devlab/generate_app_blueprint_bundle.mjs)**: Beweis für aktive Blueprint-Generierungslogik.
2.  **[pillars/meta_generator/blueprints/](file:///c:/DevLab/MBRN-HUB-V1/pillars/meta_generator/blueprints/)**: Die physische Ablage der System-Baupläne.
3.  **[pillars/meta_generator/agent_adapters/index.js](file:///c:/DevLab/MBRN-HUB-V1/pillars/meta_generator/agent_adapters/index.js)**: Die Schnittstelle für strukturierte KI-Unterstützung.
4.  **[001_POST_V3_ROADMAP.md](file:///c:/DevLab/MBRN-HUB-V1/001_POST_V3_ROADMAP.md)**: Ein realer, vom System generierter Output.

---

## 7. Fertig-Definition (Definition of Done)
`meta_generator` gilt als „fertig genug“, wenn:
1.  **Ein neuer Baustein** (z.B. eine Mini-App oder ein Modul) nachweislich aus einer **Blueprint-Logik** entstanden ist (kein manuelles Copy-Paste).
2.  **Standardisierte Scaffolds** für alle Pillars (`frontend_os`, `oracle`, `monetization`) existieren.
3.  **KI-Agenten** reproduzierbar über `agent_adapters` instruiert werden können.
4.  **Wiederverwendbarkeit** wichtiger ist als die schiere Anzahl der Generatoren.

---

## 8. Anti-Chaos-Regel
Frage für jede Änderung an diesem Pillar:
**„Schaffen wir hier eine reproduzierbare Struktur für systematisches Wachstum, oder bauen wir gerade an einer individuellen Speziallösung, die den Generator-Anspruch verwässert?“**
