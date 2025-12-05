-- Create budgets table (Personal Basic)
CREATE TABLE public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  period TEXT NOT NULL DEFAULT 'monthly',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own budgets" ON public.budgets FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Deny anonymous access to budgets" ON public.budgets FOR ALL USING (auth.uid() IS NOT NULL);

-- Create income_sources table (Personal Basic)
CREATE TABLE public.income_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  source_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'monthly',
  category TEXT,
  start_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.income_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own income sources" ON public.income_sources FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Deny anonymous access to income_sources" ON public.income_sources FOR ALL USING (auth.uid() IS NOT NULL);

-- Create recurring_payments table (Personal Pro)
CREATE TABLE public.recurring_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  payment_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'monthly',
  category TEXT,
  next_due_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.recurring_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own recurring payments" ON public.recurring_payments FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Deny anonymous access to recurring_payments" ON public.recurring_payments FOR ALL USING (auth.uid() IS NOT NULL);

-- Create investments table (Personal Pro)
CREATE TABLE public.investments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  investment_name TEXT NOT NULL,
  investment_type TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  purchase_price NUMERIC NOT NULL,
  current_price NUMERIC NOT NULL,
  purchase_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own investments" ON public.investments FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Deny anonymous access to investments" ON public.investments FOR ALL USING (auth.uid() IS NOT NULL);

-- Create financial_goals table (Personal Pro)
CREATE TABLE public.financial_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_name TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC DEFAULT 0,
  target_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own financial goals" ON public.financial_goals FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Deny anonymous access to financial_goals" ON public.financial_goals FOR ALL USING (auth.uid() IS NOT NULL);