-- Add explicit policies to deny anonymous access to all sensitive tables

-- Profiles table: Deny anonymous access
DROP POLICY IF EXISTS "Deny anonymous access to profiles" ON public.profiles;
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Credit cards table: Deny anonymous access
DROP POLICY IF EXISTS "Deny anonymous access to credit_cards" ON public.credit_cards;
CREATE POLICY "Deny anonymous access to credit_cards"
ON public.credit_cards
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Business data table: Deny anonymous access
DROP POLICY IF EXISTS "Deny anonymous access to business_data" ON public.business_data;
CREATE POLICY "Deny anonymous access to business_data"
ON public.business_data
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Credit card transactions table: Deny anonymous access
DROP POLICY IF EXISTS "Deny anonymous access to credit_card_transactions" ON public.credit_card_transactions;
CREATE POLICY "Deny anonymous access to credit_card_transactions"
ON public.credit_card_transactions
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Personal expenses table: Deny anonymous access
DROP POLICY IF EXISTS "Deny anonymous access to personal_expenses" ON public.personal_expenses;
CREATE POLICY "Deny anonymous access to personal_expenses"
ON public.personal_expenses
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Security events table: Restrict to admins only
DROP POLICY IF EXISTS "Admins only access to security_events" ON public.security_events;
CREATE POLICY "Admins only access to security_events"
ON public.security_events
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin activity logs table: Restrict to admins only
DROP POLICY IF EXISTS "Admins only access to admin_activity_logs" ON public.admin_activity_logs;
CREATE POLICY "Admins only access to admin_activity_logs"
ON public.admin_activity_logs
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));