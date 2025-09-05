-- Ensure RLS policies are properly created (these should already exist but adding for completeness)
DROP POLICY IF EXISTS "Users can manage own credit cards" ON public.credit_cards;
DROP POLICY IF EXISTS "Users can manage own credit card transactions" ON public.credit_card_transactions;

-- Recreate policies with more specific actions
CREATE POLICY "Users can view own credit cards" 
ON public.credit_cards 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own credit cards" 
ON public.credit_cards 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own credit cards" 
ON public.credit_cards 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own credit cards" 
ON public.credit_cards 
FOR DELETE 
USING (user_id = auth.uid());

-- Credit card transactions policies
CREATE POLICY "Users can view own credit card transactions" 
ON public.credit_card_transactions 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own credit card transactions" 
ON public.credit_card_transactions 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own credit card transactions" 
ON public.credit_card_transactions 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own credit card transactions" 
ON public.credit_card_transactions 
FOR DELETE 
USING (user_id = auth.uid());