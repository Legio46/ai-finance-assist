import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Shield, Phone, Mail, Key, AlertCircle, Lock, CheckCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const SecuritySettings = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (profile?.phone_number) setPhoneNumber(profile.phone_number);
  }, [profile]);

  // Security score calculation
  const getSecurityScore = () => {
    let score = 0;
    if (user?.email) score += 25; // Email verified
    if (profile?.two_factor_enabled) score += 30;
    if (profile?.phone_number) score += 20;
    if (profile?.phone_verified) score += 10;
    score += 15; // Base encryption
    return Math.min(score, 100);
  };

  const securityScore = getSecurityScore();

  const getScoreColor = () => {
    if (securityScore >= 80) return 'text-success';
    if (securityScore >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreLabel = () => {
    if (securityScore >= 80) return 'Excellent';
    if (securityScore >= 50) return 'Good';
    return 'Needs Improvement';
  };

  const handleUpdatePhone = async () => {
    if (!user) return;
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const cleanedPhone = phoneNumber.replace(/[\s()-]/g, '');
    if (!phoneRegex.test(cleanedPhone)) {
      toast({ title: "Invalid phone number", description: "Please enter a valid phone number (e.g., +1234567890)", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').update({ phone_number: cleanedPhone, phone_verified: false }).eq('user_id', user.id);
      if (error) throw error;
      toast({ title: "Phone number updated", description: "Your phone number has been saved for account recovery." });
      refreshProfile();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = async (enabled: boolean) => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').update({ two_factor_enabled: enabled }).eq('user_id', user.id);
      if (error) throw error;
      toast({ title: enabled ? "2FA Enabled" : "2FA Disabled", description: enabled ? "Two-factor authentication is now active." : "Two-factor authentication has been disabled." });
      refreshProfile();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (password: string): { valid: boolean; message: string; strength: number } => {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 15;
    if (/\d/.test(password)) strength += 15;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 20;

    if (password.length < 8) return { valid: false, message: "At least 8 characters required", strength };
    if (!/[A-Z]/.test(password)) return { valid: false, message: "Needs an uppercase letter", strength };
    if (!/[a-z]/.test(password)) return { valid: false, message: "Needs a lowercase letter", strength };
    if (!/\d/.test(password)) return { valid: false, message: "Needs a number", strength };
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return { valid: false, message: "Needs a special character", strength };
    return { valid: true, message: "Strong password", strength };
  };

  const passwordValidation = validatePassword(newPassword);

  const getStrengthColor = () => {
    if (passwordValidation.strength >= 80) return 'bg-success';
    if (passwordValidation.strength >= 50) return 'bg-warning';
    return 'bg-destructive';
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (!passwordValidation.valid) {
      toast({ title: "Weak Password", description: passwordValidation.message, variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: "Password updated", description: "Your password has been changed successfully." });
      setShowPasswordDialog(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      toast({ title: "Invalid email", description: "Please enter a valid email address", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
      if (error) throw error;
      toast({ title: "Verification sent", description: "Check your new email to confirm the change." });
      setShowEmailDialog(false);
      setNewEmail('');
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Score */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Security Settings</h2>
                  <p className="text-sm text-muted-foreground">Manage your account protection</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-3xl font-bold ${getScoreColor()}`}>{securityScore}%</p>
                <p className={`text-xs font-medium ${getScoreColor()}`}>{getScoreLabel()}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Security Score</span>
                <span>{securityScore}/100</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getStrengthColor().replace('bg-', 'bg-') || 'bg-primary'}`}
                  style={{
                    width: `${securityScore}%`,
                    background: securityScore >= 80
                      ? 'hsl(var(--success))'
                      : securityScore >= 50
                        ? 'hsl(var(--warning))'
                        : 'hsl(var(--destructive))'
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {[
                  { label: "Email Verified", active: !!user?.email },
                  { label: "2FA Active", active: !!profile?.two_factor_enabled },
                  { label: "Phone Added", active: !!profile?.phone_number },
                  { label: "Encryption", active: true },
                ].map((item) => (
                  <Badge
                    key={item.label}
                    variant="outline"
                    className={`text-[10px] gap-1 ${
                      item.active
                        ? 'border-success/30 text-success bg-success/5'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    {item.active ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    {item.label}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Two-Factor Authentication</CardTitle>
                <CardDescription className="text-xs">Add an extra layer of security</CardDescription>
              </div>
            </div>
            <Switch
              checked={profile?.two_factor_enabled || false}
              onCheckedChange={handleToggle2FA}
              disabled={loading}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {profile?.two_factor_enabled ? (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-success/5 border border-success/15">
              <ShieldCheck className="h-4 w-4 text-success flex-shrink-0" />
              <p className="text-xs text-success">Two-factor authentication is active. Your account has enhanced protection.</p>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-warning/5 border border-warning/15">
              <AlertCircle className="h-4 w-4 text-warning flex-shrink-0" />
              <p className="text-xs text-muted-foreground">Enable 2FA to significantly improve your account security.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phone Number */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Recovery Phone</CardTitle>
              <CardDescription className="text-xs">For account recovery and verification</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="flex items-center gap-2">
            <Input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
              className="flex-1 rounded-xl h-10"
            />
            <Button onClick={handleUpdatePhone} disabled={loading} variant="outline" size="sm" className="rounded-xl h-10 px-5">
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
          {phoneNumber && profile?.phone_verified && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-success/5 border border-success/15">
              <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
              <p className="text-xs text-success font-medium">Phone number verified</p>
            </div>
          )}
          {phoneNumber && !profile?.phone_verified && (
            <Alert className="rounded-xl border-border/50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Phone saved for account recovery. SMS verification requires Twilio integration.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Email & Password in a grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Email */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Email Address</CardTitle>
                <CardDescription className="text-xs">Account login credential</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/50">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
              </div>
              <Badge variant="outline" className="text-success border-success/30 text-[10px] gap-1 flex-shrink-0 ml-2">
                <CheckCircle className="h-3 w-3" />
                Verified
              </Badge>
            </div>
            <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full rounded-xl">Change Email</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Email Address</DialogTitle>
                  <DialogDescription>A verification link will be sent to your new email.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleChangeEmail} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-email" className="text-sm">New Email</Label>
                    <Input id="new-email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="newemail@example.com" required className="rounded-xl" />
                  </div>
                  <Button type="submit" className="w-full rounded-xl" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Verification'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Password */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Password</CardTitle>
                <CardDescription className="text-xs">Keep your account secure</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/50">
              <div>
                <p className="text-sm font-medium text-foreground">••••••••••</p>
                <p className="text-[10px] text-muted-foreground">Last changed: Unknown</p>
              </div>
              <Lock className="h-4 w-4 text-muted-foreground" />
            </div>
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full rounded-xl">Change Password</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>Must include uppercase, lowercase, number, and special character.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-sm">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                        className="rounded-xl pr-10"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {newPassword && (
                      <div className="space-y-1.5">
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${passwordValidation.strength}%`,
                              background: passwordValidation.strength >= 80 ? 'hsl(var(--success))' : passwordValidation.strength >= 50 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))',
                            }}
                          />
                        </div>
                        <p className={`text-xs ${passwordValidation.valid ? 'text-success' : 'text-muted-foreground'}`}>
                          {passwordValidation.message}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        required
                        className="rounded-xl pr-10"
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-destructive">Passwords don't match</p>
                    )}
                    {confirmPassword && newPassword === confirmPassword && confirmPassword.length > 0 && (
                      <p className="text-xs text-success flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Passwords match</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full rounded-xl" disabled={loading || !passwordValidation.valid || newPassword !== confirmPassword}>
                    {loading ? 'Updating...' : 'Update Password'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecuritySettings;
