from __future__ import annotations

import json
import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DB_PATH = PROJECT_ROOT / "shared" / "data" / "mbrn_state.db"
DB_PATH = Path(os.environ.get("MBRN_STATE_DB_PATH", DEFAULT_DB_PATH))

CANONICAL_DIMENSIONS = (
    "zeit",
    "geld",
    "physis",
    "geist",
    "ausdruck",
    "netzwerk",
    "energie",
    "systeme",
    "raum",
    "muster",
    "wachstum",
)

ALLOWED_TABLES = {
    "scout_alphas",
    "notifications",
    "factory_control",
    "factory_modules",
    "factory_memory",
    "seen_repos",
    "tool_requests",
    "evolution_entries",
}


def _json_dump(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True)


def _json_load(value: Any, fallback: Any = None) -> Any:
    if value is None:
        return fallback
    try:
        return json.loads(value)
    except Exception:
        return fallback


def _validate_table(table: str) -> str:
    if table not in ALLOWED_TABLES:
        raise ValueError(f"Unknown MBRN state table: {table}")
    return table


def _validate_columns(data: Dict[str, Any]) -> None:
    if not data:
        raise ValueError("No data supplied for DB write")
    for key in data:
        if not key.replace("_", "").isalnum():
            raise ValueError(f"Unsafe column name: {key}")


@contextmanager
def get_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA busy_timeout=10000")
    conn.execute("PRAGMA foreign_keys=ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db() -> None:
    schema_path = Path(__file__).with_name("schema.sql")
    with get_db() as conn:
        conn.executescript(schema_path.read_text(encoding="utf-8"))


def atomic_write(table: str, data: Dict[str, Any]) -> int:
    init_db()
    table = _validate_table(table)
    _validate_columns(data)
    cols = ", ".join(data.keys())
    placeholders = ", ".join("?" for _ in data)
    values = [_json_dump(value) if isinstance(value, (dict, list)) else value for value in data.values()]
    with get_db() as conn:
        cursor = conn.execute(f"INSERT INTO {table} ({cols}) VALUES ({placeholders})", values)
        return int(cursor.lastrowid)


def atomic_update(table: str, data: Dict[str, Any], where: str, where_val: Any) -> None:
    init_db()
    table = _validate_table(table)
    _validate_columns(data)
    if not where.replace("_", "").isalnum():
        raise ValueError(f"Unsafe where column: {where}")
    values = [_json_dump(value) if isinstance(value, (dict, list)) else value for value in data.values()]
    sets = ", ".join(f"{key} = ?" for key in data)
    updated_at = ", updated_at = datetime('now')" if table != "notifications" else ""
    with get_db() as conn:
        conn.execute(f"UPDATE {table} SET {sets}{updated_at} WHERE {where} = ?", values + [where_val])


def upsert_control_value(key: str, value: Any) -> None:
    init_db()
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO factory_control (key, value, updated_at)
            VALUES (?, ?, datetime('now'))
            ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
            """,
            (key, _json_dump(value)),
        )


def get_control_value(key: str, default: Any = None) -> Any:
    init_db()
    with get_db() as conn:
        row = conn.execute("SELECT value FROM factory_control WHERE key = ?", (key,)).fetchone()
    return _json_load(row["value"], default) if row else default


def load_factory_control(defaults: Dict[str, Any]) -> Dict[str, Any]:
    init_db()
    with get_db() as conn:
        rows = conn.execute("SELECT key, value FROM factory_control").fetchall()
    merged = dict(defaults)
    for row in rows:
        merged[row["key"]] = _json_load(row["value"], merged.get(row["key"]))
    return merged


def save_factory_control(control: Dict[str, Any]) -> None:
    for key, value in control.items():
        upsert_control_value(key, value)


def upsert_scout_alpha(
    source_url: str,
    title: str,
    score: float,
    dimension: str,
    raw_data: Dict[str, Any],
    status: str = "pending",
) -> int:
    if dimension not in CANONICAL_DIMENSIONS:
        dimension = "systeme"
    init_db()
    with get_db() as conn:
        cursor = conn.execute(
            """
            INSERT INTO scout_alphas (source_url, title, score, dimension, status, raw_data, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
            ON CONFLICT(source_url) DO UPDATE SET
                title = excluded.title,
                score = excluded.score,
                dimension = excluded.dimension,
                raw_data = excluded.raw_data,
                updated_at = datetime('now')
            """,
            (source_url, title, float(score or 0.0), dimension, status, _json_dump(raw_data)),
        )
        return int(cursor.lastrowid or 0)


def list_scout_alphas(statuses: Optional[Iterable[str]] = None, min_score: float = 0.0) -> List[sqlite3.Row]:
    init_db()
    with get_db() as conn:
        if statuses:
            status_list = list(statuses)
            placeholders = ", ".join("?" for _ in status_list)
            return conn.execute(
                f"""
                SELECT * FROM scout_alphas
                WHERE status IN ({placeholders}) AND score >= ?
                ORDER BY score DESC, updated_at ASC
                """,
                status_list + [float(min_score)],
            ).fetchall()
        return conn.execute(
            "SELECT * FROM scout_alphas WHERE score >= ? ORDER BY score DESC, updated_at ASC",
            (float(min_score),),
        ).fetchall()


def mark_scout_alpha_status(source_url: str, status: str, extra: Optional[Dict[str, Any]] = None) -> None:
    init_db()
    with get_db() as conn:
        row = conn.execute("SELECT raw_data FROM scout_alphas WHERE source_url = ?", (source_url,)).fetchone()
        raw_data = _json_load(row["raw_data"], {}) if row else {}
        if extra:
            raw_data.update(extra)
        conn.execute(
            """
            UPDATE scout_alphas
            SET status = ?, raw_data = ?, updated_at = datetime('now')
            WHERE source_url = ?
            """,
            (status, _json_dump(raw_data), source_url),
        )


def mark_repo_seen(repo_id: int, repo_name: str = "") -> None:
    init_db()
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO seen_repos (repo_id, repo_name, seen_at)
            VALUES (?, ?, datetime('now'))
            ON CONFLICT(repo_id) DO UPDATE SET repo_name = excluded.repo_name, seen_at = datetime('now')
            """,
            (int(repo_id), repo_name),
        )


def list_seen_repo_ids() -> List[int]:
    init_db()
    with get_db() as conn:
        return [int(row["repo_id"]) for row in conn.execute("SELECT repo_id FROM seen_repos").fetchall()]


def insert_notification(
    notification_type: str,
    message: str,
    dimension: Optional[str] = None,
    module_name: Optional[str] = None,
    raw_data: Optional[Dict[str, Any]] = None,
) -> int:
    return atomic_write(
        "notifications",
        {
            "type": notification_type,
            "dimension": dimension,
            "module_name": module_name,
            "message": message,
            "raw_data": _json_dump(raw_data or {}),
        },
    )


def upsert_factory_module(
    name: str,
    dimension: str,
    source_file: str,
    frontend_file: Optional[str] = None,
    status: str = "ready",
    quality_score: float = 0.0,
    raw_data: Optional[Dict[str, Any]] = None,
) -> int:
    if dimension not in CANONICAL_DIMENSIONS:
        dimension = "systeme"
    init_db()
    with get_db() as conn:
        cursor = conn.execute(
            """
            INSERT INTO factory_modules
                (name, dimension, source_file, frontend_file, status, quality_score, raw_data, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
            ON CONFLICT(source_file) DO UPDATE SET
                name = excluded.name,
                dimension = excluded.dimension,
                frontend_file = COALESCE(excluded.frontend_file, factory_modules.frontend_file),
                status = excluded.status,
                quality_score = excluded.quality_score,
                raw_data = excluded.raw_data,
                updated_at = datetime('now')
            """,
            (
                name,
                dimension,
                source_file,
                frontend_file,
                status,
                float(quality_score or 0.0),
                _json_dump(raw_data or {}),
            ),
        )
        return int(cursor.lastrowid or 0)


def count_factory_modules_by_dimension() -> Dict[str, int]:
    init_db()
    counts = {dimension: 0 for dimension in CANONICAL_DIMENSIONS}
    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT dimension, COUNT(*) AS cnt
            FROM factory_modules
            WHERE status IN ('ready', 'deployed')
            GROUP BY dimension
            """
        ).fetchall()
    for row in rows:
        if row["dimension"] in counts:
            counts[row["dimension"]] = int(row["cnt"])
    return counts


def list_notifications(limit: int = 20) -> List[Dict[str, Any]]:
    init_db()
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM notifications ORDER BY created_at DESC, id DESC LIMIT ?",
            (int(limit),),
        ).fetchall()
    notifications: List[Dict[str, Any]] = []
    for row in rows:
        raw = _json_load(row["raw_data"], {})
        item = dict(raw) if isinstance(raw, dict) else {}
        item.update(
            {
                "id": row["id"],
                "type": row["type"],
                "dimension": row["dimension"],
                "module_name": row["module_name"],
                "message": row["message"],
                "read": bool(row["read"]),
                "created_at": row["created_at"],
            }
        )
        notifications.append(item)
    return notifications


def export_factory_feed_snapshot(path: Optional[Path] = None, limit: int = 20) -> Path:
    snapshot_path = path or (PROJECT_ROOT / "shared" / "data" / "factory_feed_snapshot.json")
    snapshot_path.parent.mkdir(parents=True, exist_ok=True)
    
    # We now export from factory_modules instead of notifications for better curation support
    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT id, name, dimension, frontend_file, quality_score, is_elite, curation_status, created_at
            FROM factory_modules
            WHERE status = 'deployed'
            ORDER BY created_at DESC LIMIT ?
            """,
            (int(limit),),
        ).fetchall()
    
    modules = [dict(row) for row in rows]
    tmp = snapshot_path.with_suffix(".tmp")
    tmp.write_text(json.dumps(modules, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    tmp.replace(snapshot_path)
    return snapshot_path
