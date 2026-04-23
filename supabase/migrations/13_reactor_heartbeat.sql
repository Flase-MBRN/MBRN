-- 13_reactor_heartbeat.sql
-- Local reactor heartbeat for dashboard online/offline status.

CREATE TABLE IF NOT EXISTS public.reactor_heartbeat (
    source TEXT PRIMARY KEY,
    last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reactor_heartbeat ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view reactor heartbeat" ON public.reactor_heartbeat;
CREATE POLICY "Public can view reactor heartbeat"
ON public.reactor_heartbeat
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Service can upsert reactor heartbeat" ON public.reactor_heartbeat;
CREATE POLICY "Service can upsert reactor heartbeat"
ON public.reactor_heartbeat
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

DROP TRIGGER IF EXISTS tr_reactor_heartbeat_updated_at ON public.reactor_heartbeat;
CREATE TRIGGER tr_reactor_heartbeat_updated_at
BEFORE UPDATE ON public.reactor_heartbeat
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at();

