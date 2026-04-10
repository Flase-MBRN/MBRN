-- 00_full_system_init.sql
-- Consolidated System Initialization (Core + Monetization)
-- Run this in the Supabase SQL Editor to prepare your environment.

-- ==========================================
-- 1. PROFILES TABLE (Core User State)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    display_name TEXT,
    access_level INTEGER DEFAULT 0, -- 0: Free, 1: Spark, 10: PAID_PRO
    current_streak INTEGER DEFAULT 0,
    shields INTEGER DEFAULT 0,
    last_sync TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ==========================================
-- 2. APP_DATA TABLE (Application State)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.app_data (
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    app_id TEXT NOT NULL, -- 'finance', 'numerology', etc.
    payload JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (user_id, app_id)
);

ALTER TABLE public.app_data ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own app_data" ON public.app_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own app_data" ON public.app_data FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- 3. TRANSACTIONS TABLE (Payment Tracking)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    stripe_session_id TEXT UNIQUE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    product_id TEXT NOT NULL,
    amount_total INTEGER NOT NULL,
    currency TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);

-- ==========================================
-- 4. ANALYTICS_LOGS TABLE (Engagement)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.analytics_logs (
    id BIGSERIAL PRIMARY KEY,
    event_name TEXT NOT NULL,
    source_app TEXT,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.analytics_logs ENABLE ROW LEVEL SECURITY;

-- Policies (Append-only for security)
CREATE POLICY "Users can view own logs" ON public.analytics_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service can insert logs" ON public.analytics_logs FOR INSERT WITH CHECK (true); -- Public can log anonymized events

-- ==========================================
-- 5. HELPERS (Triggers)
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER tr_app_data_updated_at BEFORE UPDATE ON public.app_data FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
