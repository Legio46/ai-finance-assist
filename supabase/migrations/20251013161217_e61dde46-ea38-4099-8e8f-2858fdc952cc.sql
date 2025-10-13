-- Fix CRITICAL security issues before launch

-- 1. Fix admin_activity_logs - restrict to admins only
DROP POLICY IF EXISTS "Authenticated users can view activity logs" ON public.admin_activity_logs;
DROP POLICY IF EXISTS "Authenticated users can insert activity logs" ON public.admin_activity_logs;

-- Create user_roles table for proper role management
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Allow users to view their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Only admins can manage roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2. Secure admin_activity_logs - admin only
CREATE POLICY "Only admins can view activity logs"
ON public.admin_activity_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert activity logs"
ON public.admin_activity_logs
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. Secure security_events - admin only
DROP POLICY IF EXISTS "Authenticated users can view security events" ON public.security_events;
DROP POLICY IF EXISTS "Authenticated users can insert security events" ON public.security_events;
DROP POLICY IF EXISTS "Authenticated users can update security events" ON public.security_events;

CREATE POLICY "Only admins can view security events"
ON public.security_events
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert security events"
ON public.security_events
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update security events"
ON public.security_events
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4. Secure system_alerts - admin only
DROP POLICY IF EXISTS "Authenticated users can view system alerts" ON public.system_alerts;
DROP POLICY IF EXISTS "Authenticated users can insert system alerts" ON public.system_alerts;
DROP POLICY IF EXISTS "Authenticated users can update system alerts" ON public.system_alerts;

CREATE POLICY "Only admins can view system alerts"
ON public.system_alerts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert system alerts"
ON public.system_alerts
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update system alerts"
ON public.system_alerts
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 5. Add RLS policies for Legio tables
CREATE POLICY "Users can view all Legio table records"
ON public."Legio table"
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can view all Legios table records"
ON public."Legios table"
FOR SELECT
TO authenticated
USING (true);

-- 6. Strengthen profiles table security - prevent access to other users
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view only their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Prevent users from viewing other profiles even if they know the user_id
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 7. Add additional validation for credit_cards
-- Already has good RLS, but add admin override
CREATE POLICY "Admins can view all credit cards"
ON public.credit_cards
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 8. Add additional validation for business_data
-- Already has good RLS, but add admin override
CREATE POLICY "Admins can view all business data"
ON public.business_data
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));