CREATE TABLE IF NOT EXISTS public.factory_flags (
  key text PRIMARY KEY,
  value boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

INSERT INTO public.factory_flags (key, value)
VALUES ('factory_paused', false)
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.factory_modules (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  dimension text NOT NULL,
  source_file text,
  frontend_file text,
  status text DEFAULT 'ready',
  quality_score numeric DEFAULT 0.0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS factory_modules_status_created_idx
ON public.factory_modules (status, created_at DESC);

CREATE TABLE IF NOT EXISTS public.factory_notifications (
  id bigserial PRIMARY KEY,
  type text NOT NULL,
  dimension text,
  module_name text,
  message text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS factory_notifications_created_idx
ON public.factory_notifications (created_at DESC);

