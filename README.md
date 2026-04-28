🌍 Language: [🇬🇧 English](README.md) | [🇩🇪 Deutsch](README.de.md)

# MBRN-HUB-V1: The Autonomous R&D Factory
![MBRN Status](https://img.shields.io/badge/MBRN--Hub-v5.0--Watchman_Mode-blueviolet?style=for-the-badge)
![Autonomy Level](https://img.shields.io/badge/Autonomy-Level--6--Event_Driven-gold?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-Python_|_JS_|_SQLite_|_Ollama-informational?style=for-the-badge)

> **Authority Declaration**: This repository is governed by the [Canonical State](000_CANONICAL_STATE.json). All architectural definitions and component states declared in this document are human-readable mirrors of the system's ground truth.
>
> **🆕 Latest**: v5.0 introduces the **Watchman Mode** — replacing Cron jobs with continuous event-driven polling for real-time responsiveness.

---

## 1. Executive Summary

**MBRN-HUB-V1** is a high-performance, autonomous intelligence and data manufacturing ecosystem. Designed as a "Dark Factory" for code and insights, it leverages local Large Language Models (LLMs), surgical AST mutation engines, and isolated sandboxing to discover, refine, and manufacture high-value technology modules with minimal human intervention.

The system is architected to scale from raw data ingestion (Oracle) to autonomous product evolution (Meta-Generator), providing a resilient foundation for the next generation of agentic software.

---

## 2. The 4-Pillar Architecture

The ecosystem is organized into four strategic domains, ensuring a clean separation of concerns and maximum modularity.

| Pillar | Domain | Core Responsibility | Primary Location |
| :--- | :--- | :--- | :--- |
| **Frontend OS** | Presentation | User Interface, Visualization, and Dashboard Composition | `pillars/frontend_os/` |
| **Oracle** | Intelligence | Data Ingestion, Signal Processing, and LLM Enrichment | `pillars/oracle/` |
| **Monetization** | Economics | Entitlements, Gating, and Economic Governance | `pillars/monetization/` |
| **Meta-Generator** | Evolution | Autonomous Code Generation, Module Manufacturing, and Self-Mutation | `pillars/meta_generator/` |

---

## 3. The 10-Process Watchman Ecosystem

The heart of MBRN-HUB-V1 is its **PM2-orchestrated multi-agent system**. All agents run continuously in **Watchman Mode** (event-driven, no Cron) for real-time responsiveness and zero terminal flashing.

### 🔭 Layer 1: Discovery & Intelligence
| Agent | Script | Mode | Function |
|-------|--------|------|----------|
| **Sentinel Daemon** | `sentinel_daemon.py` | Watchman | Worker orchestration & turbo-heartbeat (60s) |
| **Horizon Scout** | `mbrn_horizon_scout.py` | Infinite | GitHub repo discovery & alpha hunting |
| **Nexus Bridge** | `mbrn_nexus_bridge.py` | Watchman | Alpha → Factory pipeline orchestration |

### ⚡ Layer 2: Manufacturing (Watchman Mode 🆕)
| Agent | Script | Status Flow | KI-Engine |
|-------|--------|-------------|-----------|
| **Bridge Agent** | `mbrn_bridge_agent.py` | `ready`→`pending_gen`→`deployed` | Ollama (qwen2.5-coder:14b) |
| **Logic Auditor** | `mbrn_logic_auditor.py` | `deployed`→`pending_audit`→`audited` | Ollama (phi4:latest) |

*Atomic SQLite transactions prevent race conditions. Agents poll every 2s for work.*

### 🔄 Layer 3: Evolution & Self-Healing
| Agent | Script | Mode | Function |
|-------|--------|------|----------|
| **Prime Director** | `mbrn_prime_director.py` | Watchman | Meta-controller & factory optimization |
| **Ouroboros Agent** | `mbrn_ouroboros_agent.py` | Watchman | AST-level self-mutation with 5s safety gate |
| **Live Monitor** | `mbrn_live_monitor.py` | Watchman | Real-time health checks & log triage |

### 🎮 Layer 4: Cockpit & Visibility
| Agent | Script | Mode | Function |
|-------|--------|------|----------|
| **Hub Observer** | `mbrn_hub_observer.py` | Watchman | PM2 → JSON state aggregator (2s refresh) |
| **Cockpit Server** | Python HTTP | Watchman | Localhost:8080 dashboard backend |

---

## 4. System Structure & Communication

MBRN utilizes a shared data bus for inter-agent communication, ensuring portability and eliminating external package dependencies.

### 📂 Directory Mapping
*   **`scripts/pipelines/`**: Source of the Agentic Engine and autonomous workers.
*   **`shared/data/`**: SQLite vault (`mbrn_vault.db`) + JSON state bus (`hub_state.json`).
*   **`shared/alphas/`**: The Alpha Vault; a staging area for high-ROI technology candidates.
*   **`dimensions/`**: Deployed vanilla HTML tools (ready for GitHub Pages).
*   **`ecosystem.config.cjs`**: PM2 orchestration config (10 processes, Watchman Mode).
*   **`bridges/`**: Connectivity layers for Supabase, Python runtimes, and local LLM (Ollama) integration.

### 🧠 Factory Memory
The system maintains a **Package-Free JSON/TF-IDF Memory** (`mbrn_factory_memory.py`). It stores and retrieves prior successful code patterns, allowing the Nexus to inject "Factory Context" into new generation tasks—creating a self-improving architectural feedback loop.

---

## 5. The 4-Stage Status Flow (Watchman Innovation)

```
┌─────────┐    ┌───────────────────┐    ┌──────────┐    ┌──────────────┐    ┌─────────┐
│  ready  │───→│ pending_generation │───→│ deployed │───→│ pending_audit │───→│ audited │
└─────────┘    └───────────────────┘    └────┬─────┘    └──────────────┘    └─────────┘
      ↑                                       │                                      │
      └────────────────── (error: retry) ─────┴────────────────── (error: retry) ─────┘
```

*SQLite as Message Broker*: No Redis, no RabbitMQ — just atomic `UPDATE ... RETURNING` queries. The database IS the queue.

## 6. Security & Operating Principles

1.  **No External Packages**: Core stability measures (Memory, Control, Rollback) are written in pure Python to ensure zero-dependency portability.
2.  **Privacy by Design**: Live session data (`mbrn_vault.db`, logs, and reports) are strictly ignored by version control to prevent internal state leakage.
3.  **Local-First Intelligence**: All mission-critical analysis is performed via local LLM bridges (Ollama), ensuring R&D privacy and immunity to external API disruptions.
4.  **Runtime Safety**: Every autonomous mutation is verified via a post-write runtime check. If a mutation fails to stay alive for 5 seconds, it is automatically reverted.
5.  **Greedy Processing**: Watchman agents use `time.sleep(2)` only when idle — with a backlog, they process modules at hardware-limited speed.

## 7. Quick Start

```bash
# Start the entire ecosystem
pm2 start ecosystem.config.cjs

# View all agents
pm2 status

# Watch Bridge-Agent (module generation)
pm2 logs bridge-agent

# Watch Logic-Auditor (quality scoring)
pm2 logs logic-auditor

# Monitor system state
pm2 logs hub-observer
```

---
*Generated by the MBRN System Architect.*
