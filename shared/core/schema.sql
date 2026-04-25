PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS scout_alphas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_url TEXT NOT NULL UNIQUE,
    title TEXT,
    score REAL DEFAULT 0.0,
    dimension TEXT,
    status TEXT DEFAULT 'pending',
    raw_data TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    dimension TEXT,
    module_name TEXT,
    message TEXT,
    read INTEGER DEFAULT 0,
    raw_data TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS factory_control (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS factory_modules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    dimension TEXT NOT NULL,
    source_file TEXT UNIQUE,
    frontend_file TEXT,
    status TEXT DEFAULT 'ready',
    quality_score REAL DEFAULT 0.0,
    raw_data TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS factory_memory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pattern_hash TEXT UNIQUE,
    pattern_description TEXT,
    success_count INTEGER DEFAULT 1,
    dimension TEXT,
    example_code TEXT,
    raw_data TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS seen_repos (
    repo_id INTEGER PRIMARY KEY,
    repo_name TEXT,
    seen_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tool_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alpha_id TEXT,
    requested_tool_description TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    raw_data TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS evolution_entries (
    id TEXT PRIMARY KEY,
    tool_name TEXT,
    category TEXT,
    roi_score REAL DEFAULT 0.0,
    dimension TEXT,
    raw_data TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO factory_control (key, value) VALUES
    ('scout_status', '"running"'),
    ('nexus_status', '"running"'),
    ('nexus_roi_threshold', '80.0'),
    ('factory_paused', 'false'),
    ('ouroboros_target_file', 'null'),
    ('prime_directive', '"Maximize factory output and clear backlog."');

