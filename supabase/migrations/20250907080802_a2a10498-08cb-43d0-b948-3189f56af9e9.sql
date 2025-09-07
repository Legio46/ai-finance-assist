-- Update reset password redirect URL handling
-- This fixes the password reset flow by allowing proper redirects
UPDATE auth.config SET site_url = 'https://your-site.lovable.app' WHERE true;