-- 18_gold_frontend_access.sql
-- Week-3 secure frontend read model for gold enrichment data.

create or replace view public.gold_dashboard_items as
select
  id,
  source_family,
  source_name,
  model_name,
  analysis_version,
  summary,
  score,
  confidence,
  tags,
  recommended_action,
  created_at
from public.gold_enrichment_items
order by created_at desc;

alter table public.gold_enrichment_items enable row level security;
alter table public.raw_ingest_runs enable row level security;
alter table public.raw_ingest_items enable row level security;

revoke all on public.gold_enrichment_items from anon, authenticated;
revoke all on public.raw_ingest_runs from anon, authenticated;
revoke all on public.raw_ingest_items from anon, authenticated;
revoke all on public.gold_dashboard_items from anon;
grant select on public.gold_dashboard_items to authenticated;

comment on view public.gold_dashboard_items is
  'Week-3 frontend-safe gold read model. Exposes selected LLM enrichment fields only; raw ingest tables remain internal.';
