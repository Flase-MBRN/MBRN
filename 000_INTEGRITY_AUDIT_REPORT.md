> **HISTORISCHES AUDIT:** Befunde teils durch spätere Fixes überholt. Keine aktive Wahrheit.

# 🔍 MBRN Integrity Audit Report
**Datum:** 2026-04-19 UTC  
**Auditor:** Agent 2 (Data-MAKER)  
**Scope:** Gesamter MBRN-Workspace (Python-Reaktor + Frontend-Pipes)  
**Status:** ⚠️ **ACTION REQUIRED**

---

## 📊 Executive Summary

Der Audit hat **5 kritische Bereiche** identifiziert, die vor der nächsten Phase bereinigt werden müssen. Die meisten Issues sind "tote Enden" (verwaiste Dateien) und Race-Condition-Risiken, keine Hardcoded-Security-Leaks.

| Kategorie | 🔴 Critical | 🟡 Warning | 🟢 OK |
|-----------|-----------|------------|-------|
| Orphan Files | 2 | 3 | - |
| Dependencies | 1 | 1 | - |
| Pillar Linkage | - | 2 | 3 |
| Security | - | 1 | 4 |
| Race Conditions | 3 | 2 | - |

---

## 1. 🗑️ Orphan-Files (Verwaiste Dateien)

### 🔴 LÖSCHEN EMPFOHLEN

| Datei | Pfad | Grund |
|-------|------|-------|
| `heartbeat.py` | `/MBRN-HUB-V1/heartbeat.py` | Duplikat - Funktionalität jetzt in `sentinel_daemon.py` integriert (Zeile 95-158) |
| `heartbeat_autostart.bat` | `/MBRN-HUB-V1/heartbeat_autostart.bat` | Gehört zum alten Heartbeat-System |

**Begründung:** Das Root-Heartbeat.py ist ein verwaistes Duplikat. Der Sentinel Daemon (V3 ASTRA-TURBO) übernimmt alle Heartbeat-Funktionen mit besserer Resilienz (Circuit Breaker, Exponential Backoff).

### 🟡 REVIEW BENÖTIGT

| Datei | Pfad | Status |
|-------|------|--------|
| `docs_cleanup.py` | `/MBRN-HUB-V1/scratch/docs_cleanup.py` | Einweg-Skript - prüfen ob noch benötigt |
| `fix_encoding.py` | `/MBRN-HUB-V1/scratch/fix_encoding.py` | Einweg-Skript - prüfen ob noch benötigt |
| `dev_server.py` | `/MBRN-HUB-V1/scripts/dev_server.py` | Nur für lokale Entwicklung - dokumentieren oder löschen |

### 🟢 BEHALTEN

| Datei | Grund |
|-------|-------|
| `kill_vector_4_test.py` | Aktives Chaos-Engineering-Test-Suite |
| `test_sentinel_resilience.py` | Sentinel-Validierung aktiv |
| `sync_ai_agents.py` | Wird für Agent-Synchronisation genutzt |

---

## 2. 📦 Dependency-Check

### 🔴 FEHLEND IN requirements.txt

```
# Aktuell in /scripts/pipelines/requirements.txt:
requests>=2.31.0
python-dotenv>=1.0.0

# FEHLEND:
pywin32>=306        # Für secure_key_manager.py (Windows Credential Manager)
keyring>=24.0.0     # Fallback für macOS/Linux
yfinance>=0.2.28    # Für market_sentiment_fetcher.py (optional, hat Fallback)
```

**Impact:** `secure_key_manager.py` wird ohne `keyring` im Credential-Manager-Modus nicht funktionieren (fällt auf .env zurück - unsicherer).

### 🟡 DUPLICATE CODE

**Problem:** `CircuitBreaker` existiert in zwei Versionen:
1. `pipeline_utils.py` (Zeile 255-299) - Original
2. `queue_system.py` (Zeile 58-125) - Erweiterte Version mit Metrics

**Empfehlung:** Einheitliche CircuitBreaker-Klasse aus `queue_system.py` überall nutzen (hat bessere Observability).

---

## 3. 🔗 Pillar-Linkage (Datenfluss-Pfade)

### 🟡 POTENTIELLE PATH-MISMATCHES

| Quelle | Ziel | Status | Bemerkung |
|--------|------|--------|-----------|
| `oracle_core.py:481` | `/shared/data/oracle_prediction.json` | 🟡 Hardcoded | Pfad sollte aus CONFIG kommen |
| `data_bridge.py:38` | `/shared/data/numerology_history.json` | 🟢 OK | Konsistent mit CONFIG |
| `numerology_engine.py:215` | `/shared/data/numerology_history.json` | 🟢 OK | Konsistent |
| `trust_matrix_worker.py:23` | `/AI/models/data/` | 🟡 Ungenutzt? | OUTPUT_DIR definiert, aber keine JSON-Output-Logik |

### 🟢 KORREKT VERKNÜPFT

- `sentinel_daemon.py` → Supabase (via `perform_heartbeat()`)
- `market_sentiment_fetcher.py` → `/AI/models/data/market_sentiment_*.json`
- `pipeline_utils.py` → Supabase Edge Function (via `SupabaseUplink`)

---

## 4. 🔐 Security-Gaps

### 🟡 LEVEL 2 SECURITY NICHT VOLLSTÄNDIG

**Issue:** `secure_key_manager.py` hat Imports für Windows/macOS/Linux, aber:
- `win32cred` wird auf Windows bevorzugt, ist aber nicht in `requirements.txt`
- `keyring` wird als Fallback genutzt, ist aber nicht in `requirements.txt`

**Aktuelles Verhalten:** Wenn Credential Manager nicht verfügbar → Fallback auf `.env` (unsicher).

**Empfohlener Fix:**
```python
# requirements.txt ergänzen:
pywin32>=306; platform_system=="Windows"
keyring>=24.0.0; platform_system!="Windows"
```

### 🟢 KEINE HARDCODED KEYS GEFUNDEN

Suche nach `API_KEY`, `SECRET`, `PASSWORD`, `TOKEN` ergab **keine Hardcoded-Werte** im Python-Code. Alle Keys werden korrekt aus:
- Windows Credential Manager
- keyring (macOS/Linux)
- `.env` Fallback

geladen.

---

## 5. ⚡ Race Conditions & Concurrency-Risiken

### 🔴 KRITISCHE RACE CONDITIONS (File I/O)

| Datei | Risiko | Details |
|-------|--------|---------|
| `oracle_core.py:484` | **HIGH** | `oracle_prediction.json` wird ohne File-Lock geschrieben. Wenn Sentinel mehrere Worker parallel startet → JSON-Corruption möglich |
| `numerology_engine.py:220` | **MEDIUM** | `numerology_history.json` wird ohne Lock geschrieben. Cache-Update könnte mit Lesen kollidieren |
| `trust_matrix_worker.py:309` | **HIGH** | `trust_matrix_state.json` wird ohne Lock geschrieben (deduplication state). Parallele Worker-Runs → State-Corruption |

### Code-Beispiele:

```python
# oracle_core.py:484 - UNSICHER (kein Lock)
with open(dashboard_path, 'w', encoding='utf-8') as f:
    json.dump(prediction, f, indent=2, ensure_ascii=False)

# trust_matrix_worker.py:309 - UNSICHER (kein Lock)
with open(STATE_FILE, "w", encoding="utf-8") as handle:
    json.dump(state, handle, indent=2, ensure_ascii=False)
```

### 🟡 DUPLIZIERTE FUNKTIONALITÄT

**Issue:** `save_to_json()` existiert in mehreren Varianten:
1. `pipeline_utils.py:791-813` - Mit Timestamp-Templating
2. `trust_matrix_worker.py` nutzt eigene Inline-Saves
3. `oracle_core.py` nutzt eigene Save-Logik

**Risiko:** Inkonsistente Error-Handling, unterschiedliche Encoding-Handling.

### 🟢 THREAD-SAFE IMPLEMENTIERT

- `sentinel_daemon.py` Worker-Registry nutzt `threading.Lock` pro Worker (Zeile 165, 208)
- `queue_system.py` hat eigenen Lock für Results (Zeile 324)
- `pipeline_utils.py` `ollama_execution_guard` hat Semaphore (Zeile 79)

---

## 🎯 Empfohlene Actions (Priorisiert)

### 🔴 P0 - Sofort (Blocker für nächste Phase)

1. **Orphan-Files löschen:**
   ```bash
   rm /MBRN-HUB-V1/heartbeat.py
   rm /MBRN-HUB-V1/heartbeat_autostart.bat
   ```

2. **File-Locking für JSON-Outputs implementieren:**
   ```python
   # Neue utility function in pipeline_utils.py
   import fcntl  # Unix
   # oder
   import msvcrt  # Windows
   
   def save_json_atomic(filepath, data):
       # Mit temp file + rename für atomic write
   ```

3. **requirements.txt fixen:**
   ```
   requests>=2.31.0
   python-dotenv>=1.0.0
   pywin32>=306; platform_system=="Windows"
   keyring>=24.0.0
   ```

### 🟡 P1 - Kurzfristig (1-2 Wochen)

4. **Duplikate bereinigen:**
   - Einheitliche `save_to_json()` überall nutzen
   - CircuitBreaker-Klassen mergen

5. **Scratch-Ordner dokumentieren oder aufräumen**

### 🟢 P2 - Mittelfristig

6. **Oracle-Core Pfade auslagern in CONFIG**
7. **Chaos-Tests regelmäßig laufen lassen** (CI/CD)

---

## 📋 JSON Output für Input-Briefing (für neues Modell)

```json
{
  "audit_timestamp_utc": "2026-04-19T17:54:00Z",
  "audit_version": "1.0.0",
  "auditor": "Agent_2_Data_MAKER",
  "system_status": "action_required",
  "critical_findings": 5,
  "orphan_files": {
    "to_delete": [
      "/MBRN-HUB-V1/heartbeat.py",
      "/MBRN-HUB-V1/heartbeat_autostart.bat"
    ],
    "to_review": [
      "/MBRN-HUB-V1/scratch/docs_cleanup.py",
      "/MBRN-HUB-V1/scratch/fix_encoding.py"
    ]
  },
  "dependency_gaps": {
    "missing_from_requirements": ["pywin32", "keyring"],
    "duplicate_classes": ["CircuitBreaker"]
  },
  "race_condition_hotspots": [
    {
      "file": "oracle_core.py",
      "line": 484,
      "risk": "HIGH",
      "target": "/shared/data/oracle_prediction.json"
    },
    {
      "file": "trust_matrix_worker.py",
      "line": 309,
      "risk": "HIGH", 
      "target": "/AI/models/data/trust_matrix_state.json"
    },
    {
      "file": "numerology_engine.py",
      "line": 220,
      "risk": "MEDIUM",
      "target": "/shared/data/numerology_history.json"
    }
  ],
  "security_status": "level_1_ok",
  "security_notes": "No hardcoded keys found, but Level 2 (Credential Manager) incomplete due to missing dependencies"
}
```

---

## ✅ Definition of Done (für diesen Audit)

- [x] Alle Python-Dateien auf Orphan-Status geprüft
- [x] Alle Imports gegen requirements.txt verifiziert
- [x] Pfade zwischen /scripts/ und /shared/data/ verfolgt
- [x] Grep nach Hardcoded Keys durchgeführt (clean)
- [x] JSON-Write-Operationen auf Race Conditions analysiert
- [x] Markdown-Report erstellt
- [ ] JSON-Input-Briefing für neues Modell generiert

---

**Nächster Schritt:** P0-Items abarbeiten, dann Re-Audit durchführen.

*Audit durchgeführt nach MBRN Security-Sentinel SOP & Data-Alchemist SOP.*
