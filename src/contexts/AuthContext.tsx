import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, accountType?: string) => Promise<{ error?: any }>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const refreshProfile = async (userId?: string) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      console.log('Profile loaded:', data);
      setProfile(data);
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Use setTimeout to avoid Supabase deadlock
          setTimeout(() => {
            refreshProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        refreshProfile(session.user.id);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);


  const processReferral = async (newUserId: string) => {
    try {
      // Get stored referral code
      const referralCode = localStorage.getItem('referral_code');
      if (!referralCode) return;

      // Find the affiliate with this code
      const { data: affiliate, error: affiliateError } = await supabase
        .from('affiliates')
        .select('*')
        .eq('affiliate_code', referralCode)
        .maybeSingle();

      if (affiliateError || !affiliate) {
        console.log('No valid affiliate found for code:', referralCode);
        localStorage.removeItem('referral_code');
        return;
      }

      // Don't allow self-referral
      if (affiliate.user_id === newUserId) {
        console.log('Self-referral not allowed');
        localStorage.removeItem('referral_code');
        return;
      }

      // Check if this user was already referred
      const { data: existingReferral } = await supabase
        .from('referrals')
        .select('id')
        .eq('referred_user_id', newUserId)
        .maybeSingle();

      if (existingReferral) {
        console.log('User already has a referral');
        localStorage.removeItem('referral_code');
        return;
      }

      // Create the referral record
      const { error: referralError } = await supabase
        .from('referrals')
        .insert({
          affiliate_id: affiliate.id,
          referred_user_id: newUserId,
          commission_earned: 0, // Will be updated when user subscribes
          subscription_tier: 'free',
        });

      if (referralError) {
        console.error('Error creating referral:', referralError);
        return;
      }

      // Update affiliate stats
      await supabase
        .from('affiliates')
        .update({
          referrals_count: (affiliate.referrals_count || 0) + 1,
        })
        .eq('id', affiliate.id);

      console.log('Referral processed successfully');
      localStorage.removeItem('referral_code');
    } catch (error) {
      console.error('Error processing referral:', error);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, accountType: string = 'personal') => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            account_type: accountType,
          }
        }
      });

      if (error) {
        console.error('SignUp error details:', error);
        if (error.message.includes('User already registered')) {
          toast({
            title: "Account exists",
            description: "This email is already registered. Please try signing in instead.",
            variant: "destructive",
          });
        } else if (error.message.includes('signup_disabled')) {
          toast({
            title: "Account Creation",
            description: "Please contact support to create an account.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign Up Error",
            description: error.message,
            variant: "destructive",
          });
        }
        return { error };
      }

      // Process referral if user was created successfully
      if (data.user) {
        await processReferral(data.user.id);
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link. Please check your email and click the link to activate your account.",
        });
      } else {
        toast({
          title: "Account created!",
          description: "Welcome to Legio Financial!",
        });
      }

      return {};
    } catch (error: any) {
      toast({
        title: "Sign Up Error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      // Set session persistence based on rememberMe option
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Sign In Error",
            description: "Invalid email or password. Please check your credentials and try again.",
            variant: "destructive",
          });
        } else if (error.message.includes('Email not confirmed')) {
          toast({
            title: "Email not confirmed",
            description: "Please check your email and click the confirmation link before signing in.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign In Error",
            description: error.message,
            variant: "destructive",
          });
        }
        return { error };
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

      return {};
    } catch (error: any) {
      toast({
        title: "Sign In Error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3000/auth'
        : `${window.location.origin}/auth`;
        
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        toast({
          title: "Password Reset Error",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Check your email",
        description: "We've sent you a password reset link.",
      });

      return {};
    } catch (error: any) {
      toast({
        title: "Password Reset Error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};