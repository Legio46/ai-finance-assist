-- Create admin activity logs table
CREATE TABLE admin_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  target_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  details jsonb,
  ip_address text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create security events table
CREATE TABLE security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description text NOT NULL,
  ip_address text,
  metadata jsonb,
  resolved boolean DEFAULT false,
  resolved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create system alerts table
CREATE TABLE system_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  is_dismissed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  expires_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_admin_activity_logs_admin_user ON admin_activity_logs(admin_user_id);
CREATE INDEX idx_admin_activity_logs_created_at ON admin_activity_logs(created_at DESC);
CREATE INDEX idx_security_events_user ON security_events(user_id);
CREATE INDEX idx_security_events_severity ON security_events(severity);
CREATE INDEX idx_security_events_resolved ON security_events(resolved);
CREATE INDEX idx_system_alerts_severity ON system_alerts(severity);
CREATE INDEX idx_system_alerts_created_at ON system_alerts(created_at DESC);

-- Admin-only policies (will need to create admin role check function)
-- For now, allowing authenticated users (we'll add proper admin check in the app layer)
CREATE POLICY "Authenticated users can view activity logs"
ON admin_activity_logs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert activity logs"
ON admin_activity_logs FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can view security events"
ON security_events FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can update security events"
ON security_events FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert security events"
ON security_events FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can view system alerts"
ON system_alerts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can update system alerts"
ON system_alerts FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert system alerts"
ON system_alerts FOR INSERT
TO authenticated
WITH CHECK (true);