-- 16_raw_ingest_foundation.sql
-- Generic Week-1 raw data ingestion foundation for markets + news collectors.

create table if not exists public.raw_ingest_runs (
  id uuid primary key default gen_random_uuid(),
  source_family text not null,
  source_name text not null,
  started_at timestamptz not null,
  finished_at timestamptz,
  status text not null default 'running'
    check (status in ('running', 'success', 'partial_failed', 'failed')),
  items_seen integer not null default 0 check (items_seen >= 0),
  items_inserted integer not null default 0 check (items_inserted >= 0),
  error_count integer not null default 0 check (error_count >= 0),
  last_error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.raw_ingest_runs enable row level security;

create index if not exists idx_raw_ingest_runs_created_at
  on public.raw_ingest_runs (created_at desc);

create index if not exists idx_raw_ingest_runs_source_family
  on public.raw_ingest_runs (source_family);

create index if not exists idx_raw_ingest_runs_status
  on public.raw_ingest_runs (status);

create table if not exists public.raw_ingest_items (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.raw_ingest_runs(id) on delete set null,
  source_family text not null,
  source_name text not null,
  source_item_id text,
  source_url text not null,
  fetched_at timestamptz not null,
  title text,
  payload jsonb not null default '{}'::jsonb,
  payload_hash text not null,
  ingest_status text not null default 'ingested'
    check (ingest_status in ('ingested', 'deduped', 'invalid', 'failed')),
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.raw_ingest_items enable row level security;

create index if not exists idx_raw_ingest_items_run_id
  on public.raw_ingest_items (run_id);

create index if not exists idx_raw_ingest_items_source_family
  on public.raw_ingest_items (source_family);

create index if not exists idx_raw_ingest_items_source_name
  on public.raw_ingest_items (source_name);

create index if not exists idx_raw_ingest_items_fetched_at
  on public.raw_ingest_items (fetched_at desc);

create unique index if not exists uq_raw_ingest_items_payload_hash
  on public.raw_ingest_items (payload_hash);

create unique index if not exists uq_raw_ingest_items_source_item
  on public.raw_ingest_items (source_name, source_item_id)
  where source_item_id is not null;
