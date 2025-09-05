-- Drop test tables that don't have proper structure
DROP TABLE IF EXISTS public."Legio table";
DROP TABLE IF EXISTS public."Legios table";

-- Ensure all necessary RLS policies are in place for profiles table
CREATE POLICY IF NOT EXISTS "Profiles are viewable by users themselves" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);