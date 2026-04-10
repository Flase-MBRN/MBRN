-- 11_payment_schema.sql
-- Migration to support transactions and premium levels (Phase 18.3)

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    stripe_session_id TEXT UNIQUE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    product_id TEXT NOT NULL,
    amount_total INTEGER NOT NULL, -- In Cents
    currency TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed
    created_at TIMESTAMPTZ DEFAULT now()
);

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
-- Ensure access_level exists and has a default
-- (Profiles table was created in Milestone 6, here we just ensure it's ready for level 10)

COMMENT ON COLUMN public.profiles.access_level IS '0: Free, 1: Spark, 10: PAID_PRO';
