-- 17_local_enrichment_foundation.sql
-- Week-2 local LLM enrichment foundation for raw -> gold processing.

alter table public.raw_ingest_items
  add column if not exists analysis_status text not null default 'pending'
    check (analysis_status in ('pending', 'processing', 'completed', 'failed')),
  add column if not exists analysis_attempt_count integer not null default 0
    check (analysis_attempt_count >= 0),
  add column if not exists analysis_started_at timestamptz,
  add column if not exists analysis_completed_at timestamptz,
  add column if not exists analysis_last_error text,
  add column if not exists analysis_worker text,
  add column if not exists analysis_model text;

update public.raw_ingest_items
set analysis_status = 'pending'
where analysis_status is null;

create index if not exists idx_raw_ingest_items_analysis_status
  on public.raw_ingest_items (analysis_status);

create index if not exists idx_raw_ingest_items_analysis_worker
  on public.raw_ingest_items (analysis_worker)
  where analysis_worker is not null;

create table if not exists public.gold_enrichment_items (
  id uuid primary key default gen_random_uuid(),
  raw_item_id uuid not null references public.raw_ingest_items(id) on delete cascade,
  source_family text not null,
  source_name text not null,
  model_name text not null,
  analysis_version text not null,
  summary text not null,
  score integer not null check (score >= 0 and score <= 100),
  confidence numeric(4,3) not null check (confidence >= 0 and confidence <= 1),
  tags jsonb not null default '[]'::jsonb,
  recommended_action text not null,
  analysis_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.gold_enrichment_items enable row level security;

create unique index if not exists uq_gold_enrichment_items_raw_item_version
  on public.gold_enrichment_items (raw_item_id, analysis_version);

create index if not exists idx_gold_enrichment_items_source_family
  on public.gold_enrichment_items (source_family);

create index if not exists idx_gold_enrichment_items_created_at
  on public.gold_enrichment_items (created_at desc);
