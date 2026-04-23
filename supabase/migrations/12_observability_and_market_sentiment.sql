-- 12_observability_and_market_sentiment.sql
-- Adds missing runtime monitoring + realtime market sentiment tables

CREATE TABLE IF NOT EXISTS public.error_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'medium',
    context JSONB DEFAULT '{}',
    stack_trace TEXT,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    resolved BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'error_logs'
          AND policyname = 'Users can view own error logs'
    ) THEN
        CREATE POLICY "Users can view own error logs"
        ON public.error_logs FOR SELECT
        USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'error_logs'
          AND policyname = 'Public can insert error logs'
    ) THEN
        CREATE POLICY "Public can insert error logs"
        ON public.error_logs FOR INSERT
        WITH CHECK (true);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON public.error_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_error_type ON public.error_logs (error_type);

CREATE TABLE IF NOT EXISTS public.market_sentiment (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    source TEXT NOT NULL,
    sentiment_score INTEGER NOT NULL CHECK (sentiment_score >= 0 AND sentiment_score <= 100),
    verdict TEXT NOT NULL,
    raw_data JSONB DEFAULT '{}'
);

ALTER TABLE public.market_sentiment ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'market_sentiment'
          AND policyname = 'Public can view market sentiment'
    ) THEN
        CREATE POLICY "Public can view market sentiment"
        ON public.market_sentiment FOR SELECT
        USING (true);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_market_sentiment_created_at ON public.market_sentiment (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_sentiment_source ON public.market_sentiment (source);
