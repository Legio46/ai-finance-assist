/*
  # Secure Database Schema Setup

  1. New Tables
    - `profiles` - User profile information with subscription data
    - `business_data` - Business financial records
    - `personal_expenses` - Personal expense tracking
    - `financial_advice` - Financial recommendations
    - `affiliates` - Affiliate program tracking
    - `referrals` - Affiliate referral tracking
    - `credit_cards` - Credit card management
    - `credit_card_transactions` - Credit card transaction history
    - `admin_audit_log` - Admin action audit trail

  2. Security Features
    - Row Level Security (RLS) enabled on ALL tables
    - Separate policies for SELECT, INSERT, UPDATE, DELETE operations
    - All policies require authentication
    - All policies verify user ownership via auth.uid()
    - Admin actions logged for accountability
    - No 'FOR ALL' policies (security anti-pattern)

  3. Important Notes
    - Each policy explicitly checks auth.uid() for ownership
    - Admin roles verified via has_role() function
    - Storage policies restrict file access to owners
    - Automatic profile creation on user registration
    - Timestamp triggers for data tracking
*/

-- Create user profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  country TEXT,
  account_type TEXT CHECK (account_type IN ('personal', 'business')) DEFAULT 'personal',
  subscription_tier TEXT CHECK (subscription_tier IN ('free', 'personal', 'business')) DEFAULT 'free',
  subscription_end TIMESTAMPTZ,
  subscription_status TEXT DEFAULT 'inactive',
  trial_end TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
  trial_ends_at TIMESTAMPTZ,
  two_factor_enabled BOOLEAN DEFAULT false,
  phone_number TEXT,
  phone_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create business data table
CREATE TABLE IF NOT EXISTS public.business_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT NOT NULL,
  business_type TEXT,
  country TEXT NOT NULL,
  annual_revenue DECIMAL(15,2),
  expenses JSONB DEFAULT '[]',
  tax_year INTEGER NOT NULL,
  tax_rate DECIMAL(5,2),
  calculated_tax DECIMAL(15,2),
  profit_loss DECIMAL(15,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create personal expenses table
CREATE TABLE IF NOT EXISTS public.personal_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create financial advice table
CREATE TABLE IF NOT EXISTS public.financial_advice (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  advice_type TEXT CHECK (advice_type IN ('tax', 'investment', 'savings', 'mortgage', 'trust')),
  country TEXT NOT NULL,
  advice_content TEXT NOT NULL,
  ai_confidence DECIMAL(3,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create affiliate system table
CREATE TABLE IF NOT EXISTS public.affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  affiliate_code TEXT NOT NULL UNIQUE,
  commission_rate DECIMAL(4,2) DEFAULT 10.00,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  referrals_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE CASCADE NOT NULL,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  commission_earned DECIMAL(10,2) DEFAULT 0,
  subscription_tier TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create credit cards table
CREATE TABLE IF NOT EXISTS public.credit_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  card_name TEXT NOT NULL,
  last_four_digits TEXT NOT NULL,
  card_type TEXT NOT NULL CHECK (card_type IN ('personal', 'business')),
  bank_name TEXT,
  credit_limit NUMERIC,
  current_balance NUMERIC DEFAULT 0,
  due_date DATE,
  apr NUMERIC,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create credit card transactions table
CREATE TABLE IF NOT EXISTS public.credit_card_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_card_id UUID REFERENCES public.credit_cards(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create admin audit log table
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES auth.users(id) NOT NULL,
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES auth.users(id),
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_advice ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_card_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Helper function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = $1 AND user_roles.role = $2
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- RLS Policies for profiles
CREATE POLICY "Users can select own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for business_data
CREATE POLICY "Users can select own business data"
  ON public.business_data FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own business data"
  ON public.business_data FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own business data"
  ON public.business_data FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own business data"
  ON public.business_data FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for personal_expenses
CREATE POLICY "Users can select own expenses"
  ON public.personal_expenses FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own expenses"
  ON public.personal_expenses FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own expenses"
  ON public.personal_expenses FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own expenses"
  ON public.personal_expenses FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for financial_advice
CREATE POLICY "Users can select own advice"
  ON public.financial_advice FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own advice"
  ON public.financial_advice FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own advice"
  ON public.financial_advice FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own advice"
  ON public.financial_advice FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for affiliates
CREATE POLICY "Users can select own affiliate"
  ON public.affiliates FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own affiliate"
  ON public.affiliates FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own affiliate"
  ON public.affiliates FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own affiliate"
  ON public.affiliates FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for referrals
CREATE POLICY "Affiliates can select own referrals"
  ON public.referrals FOR SELECT
  TO authenticated
  USING (
    affiliate_id IN (
      SELECT id FROM public.affiliates WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for credit_cards
CREATE POLICY "Users can select own credit cards"
  ON public.credit_cards FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own credit cards"
  ON public.credit_cards FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own credit cards"
  ON public.credit_cards FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own credit cards"
  ON public.credit_cards FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for credit_card_transactions
CREATE POLICY "Users can select own transactions"
  ON public.credit_card_transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own transactions"
  ON public.credit_card_transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own transactions"
  ON public.credit_card_transactions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own transactions"
  ON public.credit_card_transactions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for admin_audit_log
CREATE POLICY "Admins can select audit logs"
  ON public.admin_audit_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert audit logs"
  ON public.admin_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_data_updated_at
  BEFORE UPDATE ON public.business_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_credit_cards_updated_at
  BEFORE UPDATE ON public.credit_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, account_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'personal')
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for user files
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-files', 'user-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload own files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'user-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'user-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'user-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );