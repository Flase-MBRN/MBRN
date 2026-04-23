-- 11_payment_schema.sql
-- Migration to support transactions and premium levels (Phase 18.3)

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    stripe_session_id TEXT UNIQUE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    product_id TEXT NOT NULL,
    plan_id TEXT,
    amount_total INTEGER NOT NULL, -- In Cents
    currency TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS plan_id TEXT;

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own transactions
CREATE POLICY "Users can view own transactions" 
ON public.transactions FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- System Policy: Edge Functions can manage all transactions (via service_role)
-- No explicit policy needed for service_role as it bypasses RLS.

-- Evolution of Profiles table
-- plan_id is the canonical monetization state; access_level remains the
-- compatibility mirror used by older readers.

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS plan_id TEXT DEFAULT 'free';

UPDATE public.profiles
SET plan_id = CASE
    WHEN access_level >= 20 THEN 'business'
    WHEN access_level >= 10 THEN 'pro'
    WHEN access_level >= 5 THEN 'chronos'
    ELSE 'free'
END
WHERE plan_id IS NULL OR plan_id NOT IN ('free', 'chronos', 'pro', 'business');

COMMENT ON COLUMN public.profiles.plan_id IS 'Canonical monetization plan id (free, chronos, pro, business).';
COMMENT ON COLUMN public.profiles.access_level IS 'Derived compatibility mirror from the canonical plan_id.';
