
-- 1. Remove overly permissive "deny anon" ALL policies that let any authenticated user access all data
-- These tables have a proper per-user policy AND a broad "auth.uid() IS NOT NULL" ALL policy
-- The broad policy overrides per-user checks because PERMISSIVE policies are OR-ed

-- Fix: Drop the broad "deny anon" ALL policies, keep the per-user ones
DROP POLICY IF EXISTS "Deny all anonymous access to personal_expenses" ON public.personal_expenses;
DROP POLICY IF EXISTS "Deny all anonymous access to credit_cards" ON public.credit_cards;
DROP POLICY IF EXISTS "Deny all anonymous access to credit_card_transactions" ON public.credit_card_transactions;
DROP POLICY IF EXISTS "Deny all anonymous access to financial_advice" ON public.financial_advice;
DROP POLICY IF EXISTS "Deny all anonymous access to business_data" ON public.business_data;
DROP POLICY IF EXISTS "Deny anonymous access to budgets" ON public.budgets;
DROP POLICY IF EXISTS "Deny anonymous access to calendar_events" ON public.calendar_events;
DROP POLICY IF EXISTS "Deny anonymous access to financial_goals" ON public.financial_goals;
DROP POLICY IF EXISTS "Deny anonymous access to income_sources" ON public.income_sources;
DROP POLICY IF EXISTS "Deny anonymous access to investments" ON public.investments;
DROP POLICY IF EXISTS "Deny anonymous access to recurring_payments" ON public.recurring_payments;
DROP POLICY IF EXISTS "Deny all anonymous access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Deny all anonymous access to referrals" ON public.referrals;

-- Also fix affiliates
DROP POLICY IF EXISTS "Deny all anonymous access to affiliates" ON public.affiliates;

-- 2. Fix user_roles self-assignment: add restrictive INSERT policy for non-admins
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. Add DELETE policy to system_alerts restricted to admins
CREATE POLICY "Only admins can delete system alerts"
ON public.system_alerts
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4. Add RLS to realtime.messages (scoped to authenticated)
-- Note: realtime.messages is managed by Supabase, we should not modify it directly.
-- Instead we ensure channel authorization is handled at the application level.
