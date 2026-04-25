# 🏛️ MBRN v5.0 — OMNI-ARCHITECTURE ROADMAP
## Für lokale KI-Agenten (Windsurf/Kimi/Codex)

> **Direktive:** Diese Roadmap wird Sprint für Sprint abgearbeitet.
> Kein Sprint 2 starten bevor Sprint 1 vollständig grün ist.
> Stack: Python Standard-Lib + Vanilla JS + Supabase. Null neue Dependencies.

---

## SPRINT 1 — TITAN-BASIS (SQLite + Kill-Switch)

### Ziel
Race Conditions eliminieren. JSON-Bus durch atomare SQLite-DB ersetzen.
Remote Kill-Switch via Supabase einbauen.

---

### TASK 1.1 — SQLite Schema (`mbrn_state.db`)

**Datei:** `shared/data/mbrn_state.db` (neu)
**Wrapper:** `shared/core/db.py` (neu)

**Schema:**
```sql
-- Ersetzt: scout_alphas.json
CREATE TABLE IF NOT EXISTS scout_alphas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_url TEXT NOT NULL,
    title TEXT,
    score REAL DEFAULT 0.0,
    dimension TEXT,          -- 'zeit', 'geld', 'muster', etc.
    status TEXT DEFAULT 'pending',  -- pending | approved | rejected | built
    raw_data TEXT,           -- JSON-String
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Ersetzt: nexus_notifications.json
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,      -- 'module_ready' | 'error' | 'info'
    dimension TEXT,
    module_name TEXT,
    message TEXT,
    read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Ersetzt: factory_control.json
CREATE TABLE IF NOT EXISTS factory_control (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Neu: Module die factory_ready sind
CREATE TABLE IF NOT EXISTS factory_modules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    dimension TEXT NOT NULL,
    source_file TEXT,        -- Pfad zum Python-Modul
    frontend_file TEXT,      -- Pfad zur generierten index.html
    status TEXT DEFAULT 'ready',  -- ready | deployed | failed
    quality_score REAL DEFAULT 0.0,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Neu: Factory Memory (ersetzt JSON TF-IDF)
CREATE TABLE IF NOT EXISTS factory_memory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pattern_hash TEXT UNIQUE,
    pattern_description TEXT,
    success_count INTEGER DEFAULT 1,
    dimension TEXT,
    example_code TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);
```

**Atomarer Write-Wrapper `shared/core/db.py`:**
```python
import sqlite3
import json
from contextlib import contextmanager
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "data" / "mbrn_state.db"

@contextmanager
def get_db():
    """Thread-sicherer DB-Context. Immer so verwenden: with get_db() as conn:"""
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")   # Write-Ahead-Log: kein Lock bei Reads
    conn.execute("PRAGMA foreign_keys=ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def atomic_write(table: str, data: dict) -> int:
    """Atomarer Insert. Gibt neue ID zurück."""
    cols = ", ".join(data.keys())
    placeholders = ", ".join(["?" for _ in data])
    sql = f"INSERT INTO {table} ({cols}) VALUES ({placeholders})"
    with get_db() as conn:
        cursor = conn.execute(sql, list(data.values()))
        return cursor.lastrowid

def atomic_update(table: str, data: dict, where: str, where_val):
    """Atomares Update."""
    sets = ", ".join([f"{k} = ?" for k in data.keys()])
    sql = f"UPDATE {table} SET {sets}, updated_at = datetime('now') WHERE {where} = ?"
    with get_db() as conn:
        conn.execute(sql, list(data.values()) + [where_val])

def init_db():
    """Schema initialisieren. Idempotent — kann mehrfach aufgerufen werden."""
    schema_path = Path(__file__).parent / "schema.sql"
    with get_db() as conn:
        conn.executescript(schema_path.read_text())
```

**Definition of Done Task 1.1:**
- [ ] `mbrn_state.db` wird beim ersten Start erstellt
- [ ] Alle bisherigen JSON-Writes in Scout/Nexus/Director auf `atomic_write` umgestellt
- [ ] `python -c "from shared.core.db import init_db; init_db()"` läuft ohne Fehler

---

### TASK 1.2 — Remote Kill-Switch (Supabase → Prime Director)

**Supabase-Seite (einmalig, manuell):**
```sql
-- In Supabase SQL Editor ausführen:
CREATE TABLE IF NOT EXISTS factory_flags (
    key TEXT PRIMARY KEY,
    value BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO factory_flags (key, value) 
VALUES ('factory_paused', false)
ON CONFLICT (key) DO NOTHING;
```

**Python-Check in `mbrn_prime_director.py`:**
```python
import os
import urllib.request
import json

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY")

def is_factory_paused() -> bool:
    """Prüft Supabase Kill-Switch. Bei Fehler: sicher pausieren."""
    try:
        url = f"{SUPABASE_URL}/rest/v1/factory_flags?key=eq.factory_paused&select=value"
        req = urllib.request.Request(url, headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}"
        })
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read())
            return data[0]["value"] if data else False
    except Exception:
        return True  # Bei Netzwerkfehler: sicher pausieren

# Im Main-Loop des Prime Directors:
# while True:
#     if is_factory_paused():
#         log("Factory pausiert via Remote Kill-Switch.")
#         time.sleep(60)
#         continue
#     ... normale Loop-Logik
```

---

### TASK 1.6 — Einmalige Migration: 145 Module → SQLite

**Datei:** `scripts/pipelines/migrate_factory_ready.py` (einmalig ausführen, dann löschen)

```python
"""
migrate_factory_ready.py
EINMALIG AUSFÜHREN. Importiert alle vorhandenen .py Module
aus factory_ready/ in die neue SQLite factory_modules Tabelle.
"""
import re
from pathlib import Path
from shared.core.db import init_db, atomic_write

FACTORY_READY = Path("docs/S3_Data/outputs/factory_ready")

DIMENSION_KEYWORDS = {
    "zeit":     ["time", "habit", "streak", "daily", "routine", "timer"],
    "geld":     ["finance", "money", "invest", "budget", "compound", "interest"],
    "muster":   ["numerology", "pattern", "life_path", "birth", "name"],
    "netzwerk": ["synergy", "compat", "relation", "social", "network"],
    "physis":   ["fitness", "health", "body", "workout", "sleep"],
    "geist":    ["mindset", "mental", "mood", "focus", "stress"],
    "ausdruck": ["creative", "content", "style", "express", "voice"],
    "energie":  ["energy", "flow", "vitality", "circadian", "peak"],
    "systeme":  ["system", "workflow", "process", "automat", "architect"],
    "raum":     ["space", "environment", "location", "ambient", "workspace"],
    "wachstum": ["growth", "skill", "learn", "progress", "milestone"],
}

def guess_dimension(filename: str, content: str) -> str:
    """Erkennt Dimension anhand von Keywords in Dateiname und Inhalt."""
    text = (filename + " " + content[:500]).lower()
    scores = {dim: 0 for dim in DIMENSION_KEYWORDS}
    for dim, keywords in DIMENSION_KEYWORDS.items():
        for kw in keywords:
            if kw in text:
                scores[dim] += 1
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else "systeme"  # Fallback

def run_migration():
    init_db()
    py_files = list(FACTORY_READY.glob("**/*.py"))
    print(f"[Migration] Gefunden: {len(py_files)} Module")
    
    imported = 0
    for f in py_files:
        try:
            content = f.read_text(encoding="utf-8", errors="ignore")
            dimension = guess_dimension(f.stem, content)
            atomic_write("factory_modules", {
                "name": f.stem,
                "dimension": dimension,
                "source_file": str(f),
                "frontend_file": None,
                "status": "ready",
                "quality_score": 0.5  # Neutral-Score für alle importierten
            })
            imported += 1
            if imported % 10 == 0:
                print(f"[Migration] {imported}/{len(py_files)} importiert...")
        except Exception as e:
            print(f"[Migration] Fehler bei {f.name}: {e}")
    
    print(f"[Migration] ✅ Fertig. {imported} Module in DB importiert.")
    print("[Migration] Diese Datei kann jetzt gelöscht werden.")

if __name__ == "__main__":
    run_migration()
```

**Definition of Done Task 1.6:**
- [ ] Skript einmalig ausführen: `python scripts/pipelines/migrate_factory_ready.py`
- [ ] Output zeigt "145 Module importiert" (oder ähnlich)
- [ ] `SELECT COUNT(*) FROM factory_modules` in DB gibt 145+ zurück
- [ ] Skript danach löschen

---

**Definition of Done Task 1.2:**
- [ ] `factory_flags` Table in Supabase existiert
- [ ] Prime Director prüft Flag jeden Loop-Zyklus
- [ ] Vom Dashboard aus: Toggle `factory_paused` → Reaktor stoppt innerhalb 60s

---

## SPRINT 2 — PRÄZISIONS-LINSE (Dimension-Queries)

### Ziel
Scout sucht nicht zufällig. Er prüft welche Dimension am wenigsten Module hat
und feuert gezielte Queries.

---

### TASK 2.1 — Dimension-Query-Map

**In `mbrn_horizon_scout.py` ersetzen/ergänzen:**
```python
from shared.core.db import get_db

# Kanonische Dimension-Queries (deutsch → englische Suchterms)
DIMENSION_QUERIES = {
    "zeit":     ["habit streak tracker", "daily check-in", "time blocking", 
                 "productivity timer", "routine tracker"],
    "geld":     ["compound interest calculator", "budget tracker", 
                 "investment simulator", "expense analyzer", "net worth"],
    "muster":   ["numerology calculator", "pattern analysis", "life path",
                 "personality score", "birth date analysis"],
    "netzwerk": ["relationship compatibility", "synergy score", 
                 "team dynamics", "social graph", "connection strength"],
    "physis":   ["fitness tracker", "body metrics", "health score",
                 "workout planner", "sleep quality"],
    "geist":    ["mindset tracker", "mental health check", "mood journal",
                 "stress level", "focus score"],
    "ausdruck": ["creative portfolio", "content generator", "style analyzer",
                 "voice finder", "expression score"],
    "energie":  ["energy level tracker", "circadian rhythm", "flow state",
                 "peak performance", "vitality score"],
    "systeme":  ["workflow automation", "process optimizer", "system mapper",
                 "productivity system", "habit architecture"],
    "raum":     ["environment optimizer", "space analyzer", "location score",
                 "digital workspace", "ambient tracker"],
    "wachstum": ["growth tracker", "skill progress", "learning velocity",
                 "milestone tracker", "compound growth"],
}

def get_priority_dimension() -> str:
    """Gibt die Dimension zurück mit den wenigsten factory_ready Modulen."""
    with get_db() as conn:
        rows = conn.execute("""
            SELECT dimension, COUNT(*) as cnt 
            FROM factory_modules 
            WHERE status IN ('ready', 'deployed')
            GROUP BY dimension
        """).fetchall()
    
    existing = {row["dimension"]: row["cnt"] for row in rows}
    # Dimension mit 0 Modulen hat höchste Priorität
    priority = min(DIMENSION_QUERIES.keys(), 
                   key=lambda d: existing.get(d, 0))
    return priority

def get_queries_for_dimension(dimension: str) -> list:
    return DIMENSION_QUERIES.get(dimension, ["useful web tool vanilla js"])
```

**Definition of Done Task 2.1:**
- [ ] Scout ruft `get_priority_dimension()` vor jeder Suche auf
- [ ] Queries sind dimension-spezifisch
- [ ] Nach 10 Scout-Runs: alle Dimensionen haben mindestens 1 Alpha-Kandidat

---

## SPRINT 3 — GOLDENE BRÜCKE (Factory-to-Frontend)

### Ziel
Generierte Python-Module werden automatisch zu deployten Vanilla-JS-Komponenten.
`factory_ready/` → `dimensions/{dim}/apps/{name}/index.html`

---

### TASK 3.1 — Bridge Agent (`scripts/pipelines/mbrn_bridge_agent.py`)

```python
"""
mbrn_bridge_agent.py
Nimmt ein factory_ready Python-Modul und generiert daraus
eine deploybare Vanilla-JS index.html für die jeweilige Dimension.
"""

import os
import json
import time
import subprocess
from pathlib import Path
from shared.core.db import get_db, atomic_update

FACTORY_READY = Path("docs/S3_Data/outputs/factory_ready")
DIMENSIONS_DIR = Path("dimensions")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama3")

BRIDGE_SYSTEM_PROMPT = """Du bist ein Experte für Vanilla JS und HTML.
Du bekommst Python-Logik und wandelst sie in eine saubere, funktionierende
HTML/JS-Komponente um.

REGELN (ABSOLUTE):
- Kein Framework. Kein npm. Nur HTML + Vanilla JS + Inline CSS.
- Hintergrund: #05050A. Akzent: #7B5CF5. Font: System-Font.
- Die Seite muss sofort funktionieren wenn sie im Browser geöffnet wird.
- Alle Berechnungen passieren im Browser (kein Backend nötig).
- Structured Returns als JSON wo sinnvoll.
- Mobile-first. Responsive.
- Gib NUR den HTML-Code aus. Kein Markdown. Kein Erklärungs-Text.
"""

def extract_logic_description(py_file: Path) -> str:
    """Liest Python-Modul und extrahiert Beschreibung für LLM."""
    content = py_file.read_text(encoding="utf-8", errors="ignore")
    # Erste 100 Zeilen reichen für den Kontext
    lines = content.split("\n")[:100]
    return "\n".join(lines)

def generate_frontend_via_ollama(logic_desc: str, dimension: str, name: str) -> str:
    """Ruft lokales Ollama auf und generiert HTML."""
    prompt = f"""DIMENSION: {dimension}
MODUL-NAME: {name}
PYTHON-LOGIK:
{logic_desc}

Erstelle eine vollständige, funktionsfähige index.html die diese Logik 
als interaktives Web-Tool umsetzt. Passend zur MBRN Dimension '{dimension}'.
Der User soll sein Ergebnis sofort sehen ohne Login."""

    payload = json.dumps({
        "model": OLLAMA_MODEL,
        "prompt": f"[SYSTEM]{BRIDGE_SYSTEM_PROMPT}[/SYSTEM]\n{prompt}",
        "stream": False
    }).encode()

    import urllib.request
    req = urllib.request.Request(
        "http://localhost:11434/api/generate",
        data=payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        result = json.loads(resp.read())
        return result.get("response", "")

def deploy_to_dimension(html: str, dimension: str, name: str) -> Path:
    """Schreibt generierte HTML in die richtige Dimension."""
    target_dir = DIMENSIONS_DIR / dimension / "apps" / name
    target_dir.mkdir(parents=True, exist_ok=True)
    target_file = target_dir / "index.html"
    target_file.write_text(html, encoding="utf-8")
    return target_file

def sync_to_supabase(name: str, dimension: str, frontend_path: str):
    """POST an Supabase: informiert Cloud-DB über neues deployed Modul.
    Kein Crash wenn offline — Bridge läuft weiter."""
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_ANON_KEY")
    if not supabase_url or not supabase_key:
        print("[Bridge] Supabase-Sync übersprungen (keine ENV-Vars)")
        return
    try:
        payload = json.dumps({
            "name": name,
            "dimension": dimension,
            "frontend_file": frontend_path,
            "status": "deployed"
        }).encode()
        req = urllib.request.Request(
            f"{supabase_url}/rest/v1/factory_modules",
            data=payload,
            method="POST",
            headers={
                "apikey": supabase_key,
                "Authorization": f"Bearer {supabase_key}",
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
            }
        )
        urllib.request.urlopen(req, timeout=10)
        print(f"[Bridge] ☁️ Supabase-Sync OK: {name}")
    except Exception as e:
        print(f"[Bridge] ⚠️ Supabase-Sync fehlgeschlagen (ignoriert): {e}")

def run_bridge_cycle():
    """Ein Bridge-Durchlauf: nimmt nächstes ready-Modul und deployed es."""
    with get_db() as conn:
        module = conn.execute("""
            SELECT * FROM factory_modules 
            WHERE status = 'ready' 
            ORDER BY quality_score DESC 
            LIMIT 1
        """).fetchone()

    if not module:
        print("[Bridge] Keine Module in Queue. Warte...")
        return

    name = module["name"]
    dimension = module["dimension"]
    source = Path(module["source_file"])

    print(f"[Bridge] Verarbeite: {name} → Dimension: {dimension}")

    try:
        logic_desc = extract_logic_description(source)
        html = generate_frontend_via_ollama(logic_desc, dimension, name)

        if len(html) < 200 or "<html" not in html.lower():
            raise ValueError(f"Generiertes HTML zu kurz oder ungültig: {len(html)} chars")

        deployed_path = deploy_to_dimension(html, dimension, name)
        
        atomic_update("factory_modules", 
                      {"status": "deployed", "frontend_file": str(deployed_path)},
                      "id", module["id"])

        # Notification für lokales Dashboard
        from shared.core.db import atomic_write
        atomic_write("notifications", {
            "type": "module_ready",
            "dimension": dimension,
            "module_name": name,
            "message": f"Neues Modul deployed: {name} in Dimension {dimension}"
        })

        # ✅ FIX Blinder Fleck 2: Supabase Cloud-Sync
        sync_to_supabase(name, dimension, str(deployed_path))

        print(f"[Bridge] ✅ Deployed: {deployed_path}")

    except Exception as e:
        print(f"[Bridge] ❌ Fehler bei {name}: {e}")
        atomic_update("factory_modules", {"status": "failed"}, "id", module["id"])

if __name__ == "__main__":
    while True:
        run_bridge_cycle()
        time.sleep(30)  # Alle 30 Sekunden prüfen
```

**Definition of Done Task 3.1:**
- [ ] Bridge nimmt erstes `factory_ready` Modul und generiert HTML
- [ ] HTML landet in `dimensions/{dim}/apps/{name}/index.html`
- [ ] Dashboard-Notification erscheint in DB
- [ ] Deployed HTML öffnet sich im Browser ohne Fehler

---

### TASK 3.2 — Dashboard liest Notifications aus DB

Das Dashboard muss die neuen Module anzeigen.
Supabase Edge Function als Bridge zwischen lokaler DB und Frontend:

```typescript
// supabase/functions/factory-feed/index.ts
// Liest factory_modules aus Supabase-gespiegelter Tabelle
// (mbrn_bridge_agent schreibt auch in Supabase wenn online)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  const { data } = await supabase
    .from("factory_modules")
    .select("*")
    .eq("status", "deployed")
    .order("created_at", { ascending: false })
    .limit(20)

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" }
  })
})
```

---

## SPRINT-REIHENFOLGE FÜR LOKALE KI

```
SPRINT 1a: shared/core/db.py + schema erstellen + init_db() testen
SPRINT 1b: Scout atomic_write umstellen (scout_alphas → DB)
SPRINT 1c: Nexus atomic_write umstellen (notifications → DB)  
SPRINT 1d: Prime Director Kill-Switch einbauen
SPRINT 1e: Supabase factory_flags Table anlegen
SPRINT 1f: migrate_factory_ready.py ausführen → 145 Module in DB
           Danach Migrations-Skript löschen
TEST 1:    SELECT COUNT(*) FROM factory_modules gibt 145+
           Race-Condition-Test grün. Alte JSON-Files deaktiviert.

SPRINT 2a: DIMENSION_QUERIES in Scout einbauen
SPRINT 2b: get_priority_dimension() implementieren
SPRINT 2c: Scout nutzt Dimension-Priorität für Queries
TEST 2:    10 Scout-Runs → alle Dimensionen haben Alphas

SPRINT 3a: sync_to_supabase() Funktion schreiben + Supabase Table anlegen
SPRINT 3b: mbrn_bridge_agent.py komplett erstellen
SPRINT 3c: deploy_to_dimension() mit Dummy-HTML testen
SPRINT 3d: Ollama-Integration testen (generate_frontend_via_ollama)
SPRINT 3e: Supabase factory-feed Edge Function deployen
TEST 3:    Erstes Modul automatisch deployed + im Browser sichtbar
           Supabase zeigt neuen Eintrag in factory_modules Table
```

---

## KANON-GESETZE FÜR DIESE ROADMAP

1. **Nur Python Standard-Lib** — kein pip install für Production-Code
2. **SQLite WAL-Mode** — nie ohne `PRAGMA journal_mode=WAL`
3. **Dimension-Nomenklatur** — nur: `zeit, geld, muster, netzwerk, physis, geist, ausdruck, energie, systeme, raum, wachstum`
4. **Frontend = Vanilla JS** — kein React, kein Framework, kein npm
5. **Kill-Switch zuerst** — kein autonomer Agent ohne Remote-Stop
6. **Test before Deploy** — generiertes HTML muss >500 chars und valides HTML sein

---

*Roadmap: 25. April 2026*
*Status: READY_FOR_LOCAL_AGENT*
*Nächste Aktion: Sprint 1a — db.py erstellen*
