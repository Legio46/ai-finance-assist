-- Add missing RLS policies for referrals table to prevent unauthorized manipulation
DROP POLICY IF EXISTS "Affiliates can insert own referrals" ON public.referrals;
DROP POLICY IF EXISTS "Affiliates can update own referrals" ON public.referrals;
DROP POLICY IF EXISTS "Affiliates can delete own referrals" ON public.referrals;

-- Prevent direct INSERT/UPDATE/DELETE by users - only allow through application logic
CREATE POLICY "System can insert referrals"
ON public.referrals
FOR INSERT
TO authenticated
WITH CHECK (false); -- No direct inserts allowed

CREATE POLICY "System can update referrals"
ON public.referrals
FOR UPDATE
TO authenticated
USING (false); -- No direct updates allowed

CREATE POLICY "System can delete referrals"
ON public.referrals
FOR DELETE
TO authenticated
USING (false); -- No direct deletes allowed

-- Admin can manage all referrals
CREATE POLICY "Admins can manage all referrals"
ON public.referrals
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));