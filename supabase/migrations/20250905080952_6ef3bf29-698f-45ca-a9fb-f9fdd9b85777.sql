-- Create credit cards table for personal and business accounts
CREATE TABLE public.credit_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  card_name TEXT NOT NULL,
  last_four_digits TEXT NOT NULL,
  card_type TEXT NOT NULL, -- 'personal' or 'business'
  bank_name TEXT,
  credit_limit NUMERIC,
  current_balance NUMERIC DEFAULT 0,
  due_date DATE,
  apr NUMERIC,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;

-- Create policies for credit cards
CREATE POLICY "Users can manage own credit cards" 
ON public.credit_cards 
FOR ALL 
USING (user_id = auth.uid());

-- Create credit card transactions table
CREATE TABLE public.credit_card_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  credit_card_id UUID NOT NULL REFERENCES public.credit_cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for transactions
ALTER TABLE public.credit_card_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for transactions
CREATE POLICY "Users can manage own credit card transactions" 
ON public.credit_card_transactions 
FOR ALL 
USING (user_id = auth.uid());

-- Add trigger for updated_at on credit cards
CREATE TRIGGER update_credit_cards_updated_at
BEFORE UPDATE ON public.credit_cards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update profiles table to support 2FA settings
ALTER TABLE public.profiles 
ADD COLUMN two_factor_enabled BOOLEAN DEFAULT false,
ADD COLUMN phone_number TEXT,
ADD COLUMN phone_verified BOOLEAN DEFAULT false;