-- 15_dimensions_foundation.sql
-- Canonical v4.0 FOUNDATION reference tables for dimensions and topic areas.

CREATE TABLE IF NOT EXISTS public.dimensions (
    id TEXT PRIMARY KEY,
    public_label TEXT NOT NULL,
    state TEXT NOT NULL,
    maturity TEXT NOT NULL,
    navigation_order INTEGER NOT NULL,
    default_app_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.topic_areas (
    id TEXT PRIMARY KEY,
    dimension_id TEXT NOT NULL REFERENCES public.dimensions(id) ON DELETE CASCADE,
    public_label TEXT NOT NULL,
    state TEXT NOT NULL,
    maturity TEXT NOT NULL,
    default_app_id TEXT,
    surface_kind TEXT NOT NULL DEFAULT 'site',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.dimensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_areas ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'dimensions'
          AND policyname = 'Public can view dimensions'
    ) THEN
        CREATE POLICY "Public can view dimensions"
        ON public.dimensions
        FOR SELECT
        USING (true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'topic_areas'
          AND policyname = 'Public can view topic areas'
    ) THEN
        CREATE POLICY "Public can view topic areas"
        ON public.topic_areas
        FOR SELECT
        USING (true);
    END IF;
END $$;

INSERT INTO public.dimensions (id, public_label, state, maturity, navigation_order, default_app_id)
VALUES
    ('zeit', 'Zeit', 'active', 'stable', 10, 'chronos'),
    ('geld', 'Geld', 'active', 'stable', 20, 'finance'),
    ('physis', 'Physis', 'provisional', 'none', 30, NULL),
    ('geist', 'Geist', 'provisional', 'none', 40, NULL),
    ('ausdruck', 'Ausdruck', 'provisional', 'none', 50, NULL),
    ('netzwerk', 'Netzwerk', 'provisional', 'partial', 60, 'synergy'),
    ('energie', 'Energie', 'provisional', 'none', 70, NULL),
    ('systeme', 'Systeme', 'provisional', 'none', 80, NULL),
    ('raum', 'Raum', 'provisional', 'none', 90, NULL),
    ('muster', 'Muster', 'active', 'stable', 100, 'numerology'),
    ('wachstum', 'Wachstum', 'provisional', 'none', 110, NULL)
ON CONFLICT (id) DO UPDATE SET
    public_label = EXCLUDED.public_label,
    state = EXCLUDED.state,
    maturity = EXCLUDED.maturity,
    navigation_order = EXCLUDED.navigation_order,
    default_app_id = EXCLUDED.default_app_id,
    updated_at = now();

INSERT INTO public.topic_areas (id, dimension_id, public_label, state, maturity, default_app_id, surface_kind)
VALUES
    ('oracle_signal', 'geld', 'Oracle & Signal', 'provisional', 'partial', NULL, 'site'),
    ('numerologie', 'muster', 'Numerologie', 'active', 'stable', 'numerology', 'app'),
    ('astrologie', 'muster', 'Astrologie', 'provisional', 'none', NULL, 'site'),
    ('persoenlichkeiten', 'muster', 'Persoenlichkeiten', 'provisional', 'none', NULL, 'site')
ON CONFLICT (id) DO UPDATE SET
    dimension_id = EXCLUDED.dimension_id,
    public_label = EXCLUDED.public_label,
    state = EXCLUDED.state,
    maturity = EXCLUDED.maturity,
    default_app_id = EXCLUDED.default_app_id,
    surface_kind = EXCLUDED.surface_kind,
    updated_at = now();

COMMENT ON TABLE public.dimensions IS 'Canonical v4.0 FOUNDATION dimensions mirrored from 000_CANONICAL_STATE.json.';
COMMENT ON TABLE public.topic_areas IS 'Optional canonical topic areas nested under a dimension.';
