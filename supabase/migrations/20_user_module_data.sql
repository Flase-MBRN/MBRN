-- MBRN v5.6: User Module Data Foundation
-- Stores JSON state for elite autonomous modules by canonical user id and module id.

CREATE TABLE IF NOT EXISTS public.user_module_data (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    module_id text NOT NULL,
    payload jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT user_module_data_user_module_unique UNIQUE (user_id, module_id)
);

ALTER TABLE public.user_module_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mbrn_user_module_data_select" ON public.user_module_data;
DROP POLICY IF EXISTS "mbrn_user_module_data_insert" ON public.user_module_data;
DROP POLICY IF EXISTS "mbrn_user_module_data_update" ON public.user_module_data;

CREATE POLICY "mbrn_user_module_data_select" ON public.user_module_data
    FOR SELECT
    USING (user_id = 'erikk2k5@gmail.com' OR auth.jwt() ->> 'email' = user_id);

CREATE POLICY "mbrn_user_module_data_insert" ON public.user_module_data
    FOR INSERT
    WITH CHECK (user_id = 'erikk2k5@gmail.com' OR auth.jwt() ->> 'email' = user_id);

CREATE POLICY "mbrn_user_module_data_update" ON public.user_module_data
    FOR UPDATE
    USING (user_id = 'erikk2k5@gmail.com' OR auth.jwt() ->> 'email' = user_id)
    WITH CHECK (user_id = 'erikk2k5@gmail.com' OR auth.jwt() ->> 'email' = user_id);

CREATE INDEX IF NOT EXISTS idx_user_module_data_module ON public.user_module_data (module_id);
CREATE INDEX IF NOT EXISTS idx_user_module_data_user ON public.user_module_data (user_id);
