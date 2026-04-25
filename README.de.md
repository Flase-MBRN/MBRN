🌍 Language: [🇬🇧 English](README.md) | [🇩🇪 Deutsch](README.de.md)

# MBRN-HUB-V1: Die autonome F&E-Fabrik
![MBRN Status](https://img.shields.io/badge/MBRN--Hub-v4.0--Foundation-blueviolet?style=for-the-badge)
![Autonomy Level](https://img.shields.io/badge/Autonomy-Level--5--Dry--Run-gold?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-Python_|_JS_|_Supabase-informational?style=for-the-badge)

> **Autoritätserklärung**: Dieses Repository wird durch den [Canonical State](000_CANONICAL_STATE.json) gesteuert. Alle in diesem Dokument erklärten Architekturdefinitionen und Komponentenstatus sind menschenlesbare Spiegelungen der systemischen Wahrheit.

---

## 1. Executive Summary

**MBRN-HUB-V1** ist ein hochperformantes, autonomes Ökosystem für Intelligenz- und Datenfertigung. Konzipiert als "Dark Factory" für Code und Erkenntnisse, nutzt es lokale Large Language Models (LLMs), chirurgische AST-Mutations-Engines und isoliertes Sandboxing, um hochkarätige Technologiemodule mit minimaler menschlicher Intervention zu entdecken, zu veredeln und zu fertigen.

Das System ist darauf ausgelegt, von der Rohdatenerfassung (Oracle) bis zur autonomen Produktentwicklung (Meta-Generator) zu skalieren und bietet ein resistentes Fundament für die nächste Generation agentenbasierter Software.

---

## 2. Die 4-Säulen-Architektur

Das Ökosystem ist in vier strategische Domänen unterteilt, was eine saubere Trennung der Verantwortlichkeiten und maximale Modularität gewährleistet.

| Säule | Domäne | Kernaufgabe | Primärer Pfad |
| :--- | :--- | :--- | :--- |
| **Frontend OS** | Präsentation | Benutzeroberfläche, Visualisierung und Dashboard-Komposition | `pillars/frontend_os/` |
| **Oracle** | Intelligenz | Datenerfassung, Signalverarbeitung und LLM-Veredelung | `pillars/oracle/` |
| **Monetization** | Ökonomie | Berechtigungen, Gating und ökonomische Governance | `pillars/monetization/` |
| **Meta-Generator** | Evolution | Autonome Codegenerierung, Modulfertigung und Selbstmutation | `pillars/meta_generator/` |

---

## 3. Die Agentic Engine (Pipelines)

Das Herzstück von MBRN-HUB-V1 ist seine Suite autonomer Daemons. Diese Worker operieren in einer kontinuierlichen Feedbackschleife, gesteuert durch den Prime Director.

### 🔭 Entdeckung & Analyse
*   **Horizon Scout** (`mbrn_horizon_scout.py`): Scannt globale Repositories nach hochkarätigen autonomen Frameworks. Führt mehrstufige Synergie-Analysen mittels lokaler LLMs durch, um die architektonische Eignung zu bewerten.
*   **Archivist** (`mbrn_archivist.py`): Komprimiert gefertigtes Wissen. Analysiert fertige Module, um architektonische Muster in das Fabrik-Gedächtnis zu synthetisieren und Kontext-Bloat zu verhindern.

### 🏗️ Fertigung & Evolution
*   **Nexus Bridge** (`mbrn_nexus_bridge.py`): Der Fabrikleiter. Orchestriert den Übergang von der Alpha-Entdeckung zur konkreten Modulfertigung.
*   **Autonomous Dev Agent** (`autonomous_dev_agent.py`): Ein selbstheilender Ingenieur. Nutzt `deepseek-coder-v2`, um Python-Module zu generieren, und repariert Code automatisch basierend auf Fehlern in der Sandbox-Ausführung.
*   **Toolmaker** (`mbrn_toolmaker.py`): Der interne "MacGyver". Generiert maßgeschneiderte Utility-Skripte, um logische Blockaden oder Parsing-Anforderungen innerhalb der Pipeline zu lösen.
*   **Ouroboros Agent** (`mbrn_ouroboros_agent.py`): Eine Level-6 Mutations-Engine. Führt chirurgische Updates auf AST-Ebene am Systemcode durch, geschützt durch ein 5-sekündiges Sicherheits-Gate und automatischen Rollback (Dead Man's Switch).

### 🎮 Governance & Sicherheit
*   **Prime Director** (`mbrn_prime_director.py`): Der Level-5 Meta-Controller. Überwacht Sensoren (Backlogs, Logs, Memory) und passt das "Factory Control" Panel an, um Stabilität und Qualität zu optimieren.
*   **Sentinel Daemon** (`sentinel_daemon.py`): Der Herzschlag des Systems. Überwacht den Status der Agenten, verwaltet Concurrency-Sperren und gewährleistet Hochverfügbarkeit.
*   **Split-Brain Sandbox** (`sandbox_controller.py`): Gewährleistet Sicherheit. Orchestriert isolierte Docker-Container ohne Netzwerkzugriff für die sichere Ausführung von nicht vertrauenswürdigem Code.

---

## 4. Systemstruktur & Kommunikation

MBRN nutzt einen gemeinsamen Datenbus für die Kommunikation zwischen den Agenten, was Portabilität garantiert und externe Paketabhängigkeiten eliminiert.

### 📂 Verzeichnis-Struktur
*   **`scripts/pipelines/`**: Quellcode der Agentic Engine und der autonomen Worker.
*   **`shared/data/`**: Der JSON-Kommunikationsbus (Control Panels, Benachrichtigungen, Berichte).
*   **`shared/alphas/`**: Der Alpha Vault; ein Staging-Bereich für hochkarätige Technologie-Kandidaten.
*   **`docs/S3_Data/outputs/factory_ready/`**: Die Galerie der final gefertigten Python-Module.
*   **`bridges/`**: Konnektivitätsschichten für Supabase, Python-Runtimes und lokale LLM-Integration (Ollama).

### 🧠 Fabrik-Gedächtnis
Das System unterhält ein **paketfreies JSON/TF-IDF Gedächtnis** (`mbrn_factory_memory.py`). Es speichert und ruft erfolgreiche Codemuster ab, sodass der Nexus bei neuen Aufgaben "Fabrik-Kontext" injizieren kann – was eine selbstverbessernde architektonische Feedbackschleife schafft.

---

## 5. Sicherheit & Betriebsprinzipien

1.  **Keine externen Pakete**: Kernstabilitätsmaßnahmen (Memory, Control, Rollback) sind in reinem Python geschrieben, um eine abhängigkeitsfreie Portabilität zu gewährleisten.
2.  **Privacy by Design**: Live-Sitzungsdaten (`mbrn_factory_control.json`, Logs und Berichte) werden strikt von der Versionsverwaltung ignoriert, um das Abfließen interner Zustände zu verhindern.
3.  **Lokale Intelligenz**: Alle missionskritischen Analysen werden über lokale LLM-Bridges (Ollama) durchgeführt, um die F&E-Privatsphäre und Immunität gegen externe API-Störungen zu garantieren.
4.  **Laufzeitsicherheit**: Jede autonome Mutation wird durch einen Post-Write-Check verifiziert. Schlägt ein Skript innerhalb von 5 Sekunden fehl, wird es automatisch zurückgesetzt.

---
*Generiert durch den MBRN System Architect.*
