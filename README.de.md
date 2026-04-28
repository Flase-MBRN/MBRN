🌍 Language: [🇬🇧 English](README.md) | [🇩🇪 Deutsch](README.de.md)

# MBRN-HUB-V1: Die autonome F&E-Fabrik
![MBRN Status](https://img.shields.io/badge/MBRN--Hub-v5.0--Watchman_Mode-blueviolet?style=for-the-badge)
![Autonomy Level](https://img.shields.io/badge/Autonomy-Level--6--Event_Driven-gold?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-Python_|_JS_|_SQLite_|_Ollama-informational?style=for-the-badge)

> **Autoritätserklärung**: Dieses Repository wird durch den [Canonical State](000_CANONICAL_STATE.json) gesteuert. Alle in diesem Dokument erklärten Architekturdefinitionen und Komponentenstatus sind menschenlesbare Spiegelungen der systemischen Wahrheit.
>
> **🆕 Neu**: v5.0 führt den **Watchman Mode** ein — Cron-Jobs werden durch kontinuierliches Event-Driven-Polling ersetzt für Echtzeit-Reaktivität.

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

## 3. Das 10-Prozess Watchman-Ökosystem

Das Herzstück von MBRN-HUB-V1 ist sein **PM2-orchestriertes Multi-Agent-System**. Alle Agenten laufen kontinuierlich im **Watchman Mode** (Event-Driven, kein Cron) für Echtzeit-Reaktivität und keine Terminal-Flashes.

### 🔭 Layer 1: Entdeckung & Intelligenz
| Agent | Skript | Modus | Funktion |
|-------|--------|-------|----------|
| **Sentinel Daemon** | `sentinel_daemon.py` | Watchman | Worker-Orchestrierung & Turbo-Heartbeat (60s) |
| **Horizon Scout** | `mbrn_horizon_scout.py` | Infinite | GitHub-Repo-Entdeckung & Alpha-Hunting |
| **Nexus Bridge** | `mbrn_nexus_bridge.py` | Watchman | Alpha → Fabrik-Pipeline-Orchestrierung |

### ⚡ Layer 2: Fertigung (Watchman Mode 🆕)
| Agent | Skript | Status-Flow | KI-Engine |
|-------|--------|-------------|-----------|
| **Bridge Agent** | `mbrn_bridge_agent.py` | `ready`→`pending_gen`→`deployed` | Ollama (qwen2.5-coder:14b) |
| **Logic Auditor** | `mbrn_logic_auditor.py` | `deployed`→`pending_audit`→`audited` | Ollama (phi4:latest) |

*Atomare SQLite-Transaktionen verhindern Race Conditions. Agenten pollen alle 2s nach Arbeit.*

### 🔄 Layer 3: Evolution & Selbstheilung
| Agent | Skript | Modus | Funktion |
|-------|--------|-------|----------|
| **Prime Director** | `mbrn_prime_director.py` | Watchman | Meta-Controller & Fabrik-Optimierung |
| **Ouroboros Agent** | `mbrn_ouroboros_agent.py` | Watchman | AST-Level-Selbstmutation mit 5s-Sicherheits-Gate |
| **Live Monitor** | `mbrn_live_monitor.py` | Watchman | Echtzeit-Health-Checks & Log-Triage |

### 🎮 Layer 4: Cockpit & Sichtbarkeit
| Agent | Skript | Modus | Funktion |
|-------|--------|-------|----------|
| **Hub Observer** | `mbrn_hub_observer.py` | Watchman | PM2 → JSON-Zustandsaggregator (2s Refresh) |
| **Cockpit Server** | Python HTTP | Watchman | Localhost:8080 Dashboard-Backend |

---

## 4. Systemstruktur & Kommunikation

MBRN nutzt einen gemeinsamen Datenbus für die Kommunikation zwischen den Agenten, was Portabilität garantiert und externe Paketabhängigkeiten eliminiert.

### 📂 Verzeichnis-Struktur
*   **`scripts/pipelines/`**: Quellcode der Agentic Engine und der autonomen Worker.
*   **`shared/data/`**: SQLite-Vault (`mbrn_vault.db`) + JSON-State-Bus (`hub_state.json`).
*   **`shared/alphas/`**: Der Alpha Vault; ein Staging-Bereich für hochkarätige Technologie-Kandidaten.
*   **`dimensions/`**: Bereitgestellte Vanilla-HTML-Tools (ready für GitHub Pages).
*   **`ecosystem.config.cjs`**: PM2-Orchestrierungs-Config (10 Prozesse, Watchman Mode).
*   **`bridges/`**: Konnektivitätsschichten für Supabase, Python-Runtimes und lokale LLM-Integration (Ollama).

### 🧠 Fabrik-Gedächtnis
Das System unterhält ein **paketfreies JSON/TF-IDF Gedächtnis** (`mbrn_factory_memory.py`). Es speichert und ruft erfolgreiche Codemuster ab, sodass der Nexus bei neuen Aufgaben "Fabrik-Kontext" injizieren kann – was eine selbstverbessernde architektonische Feedbackschleife schafft.

---

## 5. Der 4-Stufen Status-Flow (Watchman-Innovation)

```
┌─────────┐    ┌───────────────────┐    ┌──────────┐    ┌──────────────┐    ┌─────────┐
│  ready  │───→│ pending_generation│───→│ deployed │───→│ pending_audit │───→│ audited │
└─────────┘    └───────────────────┘    └────┬─────┘    └──────────────┘    └─────────┘
      ↑                                       │                                      │
      └────────────────── (Fehler: Retry) ────┴────────────────── (Fehler: Retry) ────┘
```

*SQLite als Message Broker*: Kein Redis, kein RabbitMQ — nur atomare `UPDATE ... RETURNING` Queries. Die Datenbank IST die Queue.

## 6. Sicherheit & Betriebsprinzipien

1.  **Keine externen Pakete**: Kernstabilitätsmaßnahmen (Memory, Control, Rollback) sind in reinem Python geschrieben, um eine abhängigkeitsfreie Portabilität zu gewährleisten.
2.  **Privacy by Design**: Live-Sitzungsdaten (`mbrn_vault.db`, Logs und Berichte) werden strikt von der Versionsverwaltung ignoriert, um das Abfließen interner Zustände zu verhindern.
3.  **Lokale Intelligenz**: Alle missionskritischen Analysen werden über lokale LLM-Bridges (Ollama) durchgeführt, um die F&E-Privatsphäre und Immunität gegen externe API-Störungen zu garantieren.
4.  **Laufzeitsicherheit**: Jede autonome Mutation wird durch einen Post-Write-Check verifiziert. Schlägt ein Skript innerhalb von 5 Sekunden fehl, wird es automatisch zurückgesetzt.
5.  **Greedy Processing**: Watchman-Agenten nutzen `time.sleep(2)` nur im Leerlauf — bei Backlog verarbeiten sie Module mit Hardware-maximaler Geschwindigkeit.

## 7. Quick Start

```bash
# Starte das gesamte Ökosystem
pm2 start ecosystem.config.cjs

# Zeige alle Agenten
pm2 status

# Beobachte Bridge-Agent (Modul-Generierung)
pm2 logs bridge-agent

# Beobachte Logic-Auditor (Qualitäts-Scoring)
pm2 logs logic-auditor

# Überwache System-Status
pm2 logs hub-observer
```

---
*Generiert durch den MBRN System Architect.*
