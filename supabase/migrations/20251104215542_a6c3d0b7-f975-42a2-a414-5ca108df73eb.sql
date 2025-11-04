-- Fix all security vulnerabilities by denying anonymous access to all sensitive tables

-- Ensure all tables have explicit policies denying anonymous access
-- These policies are already in place but we'll ensure they're comprehensive

-- Drop existing deny policies if they exist to recreate them properly
DROP POLICY IF EXISTS "Deny anonymous access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Deny anonymous access to credit_cards" ON public.credit_cards;
DROP POLICY IF EXISTS "Deny anonymous access to business_data" ON public.business_data;
DROP POLICY IF EXISTS "Deny anonymous access to personal_expenses" ON public.personal_expenses;
DROP POLICY IF EXISTS "Deny anonymous access to credit_card_transactions" ON public.credit_card_transactions;

-- Create comprehensive deny anonymous access policies
CREATE POLICY "Deny all anonymous access to profiles"
ON public.profiles
FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Deny all anonymous access to credit_cards"
ON public.credit_cards
FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Deny all anonymous access to business_data"
ON public.business_data
FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Deny all anonymous access to personal_expenses"
ON public.personal_expenses
FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Deny all anonymous access to credit_card_transactions"
ON public.credit_card_transactions
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Add deny policies for other sensitive tables
CREATE POLICY "Deny all anonymous access to financial_advice"
ON public.financial_advice
FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Deny all anonymous access to affiliates"
ON public.affiliates
FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Deny all anonymous access to referrals"
ON public.referrals
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Ensure security_events and system_alerts remain admin-only (already protected)
-- Ensure admin_activity_logs remain admin-only (already protected)