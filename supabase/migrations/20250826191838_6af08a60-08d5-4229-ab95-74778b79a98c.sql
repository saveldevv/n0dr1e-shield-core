-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'canceled')),
  subscription_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create scans table for scan history
CREATE TABLE public.scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scan_type TEXT NOT NULL CHECK (scan_type IN ('quick', 'full', 'custom')),
  scan_path TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  threats_found INTEGER DEFAULT 0,
  files_scanned INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create threats table for detected threats
CREATE TABLE public.threats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID REFERENCES public.scans(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_path TEXT NOT NULL,
  threat_name TEXT NOT NULL,
  threat_type TEXT NOT NULL CHECK (threat_type IN ('virus', 'malware', 'trojan', 'spyware', 'adware', 'suspicious')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'detected' CHECK (status IN ('detected', 'quarantined', 'deleted', 'ignored')),
  action_taken TEXT,
  detected_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Create quarantine table for quarantined files
CREATE TABLE public.quarantine (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  threat_id UUID REFERENCES public.threats(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  original_path TEXT NOT NULL,
  quarantine_path TEXT NOT NULL,
  file_size BIGINT,
  quarantined_at TIMESTAMPTZ DEFAULT now(),
  restored_at TIMESTAMPTZ
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quarantine ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for scans
CREATE POLICY "Users can view own scans" ON public.scans
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own scans" ON public.scans
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own scans" ON public.scans
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for threats
CREATE POLICY "Users can view own threats" ON public.threats
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own threats" ON public.threats
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own threats" ON public.threats
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for quarantine
CREATE POLICY "Users can view own quarantine" ON public.quarantine
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own quarantine" ON public.quarantine
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own quarantine" ON public.quarantine
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own quarantine" ON public.quarantine
  FOR DELETE USING (user_id = auth.uid());

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();