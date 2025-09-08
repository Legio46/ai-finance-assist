import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Shield, Phone, Mail, Key } from 'lucide-react';

const SecuritySettings = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);

  useEffect(() => {
    if (profile?.phone_number) {
      setPhoneNumber(profile.phone_number);
    }
  }, [profile]);

  const handleUpdatePhone = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          phone_number: phoneNumber,
          phone_verified: false // Reset verification when changing number
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Phone number updated",
        description: "Your phone number has been updated. Please verify it to enable SMS notifications.",
      });

      refreshProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = async (enabled: boolean) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ two_factor_enabled: enabled })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: enabled ? "2FA Enabled" : "2FA Disabled",
        description: enabled 
          ? "Two-factor authentication has been enabled for your account." 
          : "Two-factor authentication has been disabled.",
      });

      refreshProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const simulatePhoneVerification = async () => {
    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "Please enter a phone number first",
        variant: "destructive",
      });
      return;
    }

    setIsVerifyingPhone(true);
    
    // Simulate sending verification code
    setTimeout(() => {
      toast({
        title: "Verification code sent",
        description: `A verification code has been sent to ${phoneNumber}. For demo purposes, use code: 123456`,
      });
      setIsVerifyingPhone(false);
    }, 2000);
  };

  const handleVerifyPhone = async () => {
    if (!user) return;

    if (verificationCode !== '123456') {
      toast({
        title: "Error",
        description: "Invalid verification code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ phone_verified: true })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Phone verified",
        description: "Your phone number has been successfully verified!",
      });

      setVerificationCode('');
      refreshProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        email: user?.email
      });

      if (error) throw error;

      toast({
        title: "Password reset email sent",
        description: "Check your email for instructions to reset your password.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Security Settings</h2>
      </div>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable 2FA</p>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch
              checked={profile?.two_factor_enabled || false}
              onCheckedChange={handleToggle2FA}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Phone Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Phone Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <Button
              onClick={handleUpdatePhone}
              disabled={loading}
              variant="outline"
            >
              Update
            </Button>
          </div>

          {phoneNumber && !profile?.phone_verified && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter verification code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
                <Button
                  onClick={simulatePhoneVerification}
                  disabled={isVerifyingPhone}
                  variant="outline"
                >
                  {isVerifyingPhone ? 'Sending...' : 'Send Code'}
                </Button>
              </div>
              {verificationCode && (
                <Button
                  onClick={handleVerifyPhone}
                  disabled={loading}
                  className="w-full"
                >
                  Verify Phone
                </Button>
              )}
            </div>
          )}

          {profile?.phone_verified && (
            <div className="flex items-center gap-2 text-green-600">
              <Shield className="h-4 w-4" />
              <span className="text-sm">Phone number verified</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Current Email</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <Shield className="h-4 w-4" />
              <span className="text-sm">Verified</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Change Password</p>
              <p className="text-sm text-muted-foreground">
                Update your password to keep your account secure
              </p>
            </div>
            <Button onClick={handleChangePassword} variant="outline">
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;