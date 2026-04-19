-- 14_system_status.sql
-- Singleton heartbeat table for dashboard online/offline status.

create table if not exists public.system_status (
  id smallint primary key default 1 check (id = 1),
  last_ping timestamptz not null default timezone('utc', now())
);

alter table public.system_status enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'system_status'
      and policyname = 'system_status_public_read'
  ) then
    create policy system_status_public_read
      on public.system_status
      for select
      to anon, authenticated
      using (true);
  end if;
end $$;

insert into public.system_status (id, last_ping)
values (1, timezone('utc', now()))
on conflict (id) do update
set last_ping = excluded.last_ping;
