-- Create platform_updates table for "What's New" section
CREATE TABLE public.platform_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  badge_type TEXT NOT NULL DEFAULT 'UPDATE', -- NEW, UPDATE, FEATURE, SECURITY
  badge_color TEXT, -- Optional custom color
  release_date DATE NOT NULL DEFAULT CURRENT_DATE,
  features JSONB, -- Array of { icon: string, title: string, description: string }
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.platform_updates ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (everyone can see updates)
CREATE POLICY "Platform updates are viewable by everyone"
ON public.platform_updates
FOR SELECT
USING (is_published = true);

-- Create policy for admin insert/update/delete
CREATE POLICY "Admins can manage platform updates"
ON public.platform_updates
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.platform_updates;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_platform_updates_updated_at
BEFORE UPDATE ON public.platform_updates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial platform updates
INSERT INTO public.platform_updates (title, description, badge_type, release_date, features) VALUES
(
  'Investment Portfolio - Category Breakdown',
  'Enhanced investment tracking with category organization',
  'NEW',
  '2026-01-15',
  '[
    {"icon": "TrendingUp", "title": "Separate Category Totals", "description": "Investments are now grouped by type (Crypto, Stocks, Real Estate, ETF, etc.) with separate totals and gain/loss for each category."},
    {"icon": "Coins", "title": "Category Summary Cards", "description": "Color-coded cards show value, gain/loss, and asset count for each investment type at a glance."},
    {"icon": "LineChart", "title": "Organized Investment View", "description": "Investments are displayed in collapsible sections by category with clear headers and statistics."}
  ]'::jsonb
),
(
  'Investment Portfolio - Live Pricing',
  'Real-time price fetching for crypto and stocks',
  'UPDATE',
  '2026-01-10',
  '[
    {"icon": "Coins", "title": "Auto-Fetch Crypto & Stock Prices", "description": "Current prices are now automatically fetched when adding new crypto or stock investments. No more manual price entry required!"},
    {"icon": "LineChart", "title": "Yahoo Finance Integration", "description": "Real-time stock prices from Yahoo Finance for popular stocks like AAPL, MSFT, GOOGL, AMZN, NVDA, and more."},
    {"icon": "Zap", "title": "Quick Symbol Selection", "description": "One-click buttons for popular crypto (BTC, ETH, SOL, XRP, ADA) and stocks (AAPL, MSFT, GOOGL, AMZN, NVDA) that instantly fetch current prices."}
  ]'::jsonb
),
(
  'Security Enhancements',
  'Improved security features across the platform',
  'UPDATE',
  '2026-01-05',
  '[
    {"icon": "Shield", "title": "Enhanced CORS Protection", "description": "All edge functions now have improved origin validation for better security."},
    {"icon": "Lock", "title": "Stronger Password Requirements", "description": "Password changes now require uppercase, lowercase, numbers, and special characters."}
  ]'::jsonb
),
(
  'Live Crypto Charts',
  'Real-time crypto price visualization',
  'FEATURE',
  '2025-12-20',
  '[
    {"icon": "TrendingUp", "title": "7-Day Price Sparklines", "description": "Crypto investments now display 7-day price history sparklines with live data from CoinGecko."},
    {"icon": "Activity", "title": "24h Price Change Indicators", "description": "See real-time 24-hour price changes for all your crypto holdings."}
  ]'::jsonb
);