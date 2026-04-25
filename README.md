# MBRN-HUB-V1: The Autonomous R&D Factory
![MBRN Status](https://img.shields.io/badge/MBRN--Hub-v4.0--Foundation-blueviolet?style=for-the-badge)
![Autonomy Level](https://img.shields.io/badge/Autonomy-Level--5--Dry--Run-gold?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-Python_|_JS_|_Supabase-informational?style=for-the-badge)

> **Authority Declaration**: This repository is governed by the [Canonical State](000_CANONICAL_STATE.json). All architectural definitions and component states declared in this document are human-readable mirrors of the system's ground truth.

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

## 3. The Agentic Engine (Pipelines)

The heart of MBRN-HUB-V1 is its suite of autonomous daemons. These workers operate in a continuous feedback loop, governed by the Prime Director.

### 🔭 Discovery & Analysis
*   **Horizon Scout** (`mbrn_horizon_scout.py`): Scans global repositories for high-ROI autonomous frameworks. Performs multi-stage synergy analysis using local LLMs to evaluate architectural fit.
*   **Archivist** (`mbrn_archivist.py`): Compresses manufactured knowledge. Analyzes factory-ready modules to synthesize architectural patterns into the Factory Memory, preventing context bloat.

### 🏗️ Manufacturing & Evolution
*   **Nexus Bridge** (`mbrn_nexus_bridge.py`): The factory foreman. Orchestrates the transition from Alpha discovery to concrete module manufacturing.
*   **Autonomous Dev Agent** (`autonomous_dev_agent.py`): A self-healing engineer. Uses `deepseek-coder-v2` to generate Python modules and automatically repairs code based on sandbox execution errors.
*   **Toolmaker** (`mbrn_toolmaker.py`): The internal MacGyver. Generates custom utility scripts to resolve logical blockages or parsing requirements within the factory pipeline.
*   **Ouroboros Agent** (`mbrn_ouroboros_agent.py`): A Level-6 mutation engine. Performs surgical AST-level updates to system code, protected by a 5-second runtime safety gate and automatic rollback (Dead Man's Switch).

### 🎮 Governance & Security
*   **Prime Director** (`mbrn_prime_director.py`): The Level-5 Meta-Controller. Observes factory sensors (backlogs, logs, memory) and adjusts the system's "Factory Control" panel to optimize stability and quality.
*   **Sentinel Daemon** (`sentinel_daemon.py`): The system's heartbeat. Monitors agent health, manages concurrency locks, and ensures high availability.
*   **Split-Brain Sandbox** (`sandbox_controller.py`): Ensures security. Orchestrates isolated, network-less Docker containers for safe execution of untrusted code.

---

## 4. System Structure & Communication

MBRN utilizes a shared data bus for inter-agent communication, ensuring portability and eliminating external package dependencies.

### 📂 Directory Mapping
*   **`scripts/pipelines/`**: Source of the Agentic Engine and autonomous workers.
*   **`shared/data/`**: The JSON communication bus (Control Panels, Notifications, Reports).
*   **`shared/alphas/`**: The Alpha Vault; a staging area for high-ROI technology candidates.
*   **`docs/S3_Data/outputs/factory_ready/`**: The final product gallery of manufactured Python modules.
*   **`bridges/`**: Connectivity layers for Supabase, Python runtimes, and local LLM (Ollama) integration.

### 🧠 Factory Memory
The system maintains a **Package-Free JSON/TF-IDF Memory** (`mbrn_factory_memory.py`). It stores and retrieves prior successful code patterns, allowing the Nexus to inject "Factory Context" into new generation tasks—creating a self-improving architectural feedback loop.

---

## 5. Security & Operating Principles

1.  **No External Packages**: Core stability measures (Memory, Control, Rollback) are written in pure Python to ensure zero-dependency portability.
2.  **Privacy by Design**: Live session data (`mbrn_factory_control.json`, logs, and reports) are strictly ignored by version control to prevent internal state leakage.
3.  **Local-First Intelligence**: All mission-critical analysis is performed via local LLM bridges (Ollama), ensuring R&D privacy and immunity to external API disruptions.
4.  **Runtime Safety**: Every autonomous mutation is verified via a post-write runtime check. If a mutation fails to stay alive for 5 seconds, it is automatically reverted.

---
*Generated by the MBRN System Architect.*
