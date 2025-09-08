import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Copy, Users, DollarSign, TrendingUp } from 'lucide-react';

interface AffiliateData {
  id: string;
  affiliate_code: string;
  commission_rate: number;
  total_earnings: number;
  referrals_count: number;
}

const Affiliate = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [affiliateData, setAffiliateData] = useState<AffiliateData | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  const fetchAffiliateData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setAffiliateData(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch affiliate data",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user && !loading) {
      fetchAffiliateData();
    }
  }, [user, loading]);

  const generateAffiliateCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const joinAffiliateProgram = async () => {
    if (!user) return;

    setIsJoining(true);
    try {
      const affiliateCode = generateAffiliateCode();
      
      const { error } = await supabase
        .from('affiliates')
        .insert([{
          user_id: user.id,
          affiliate_code: affiliateCode,
          commission_rate: 10.00, // 10% commission
          total_earnings: 0,
          referrals_count: 0,
        }]);

      if (error) throw error;

      toast({
        title: "Welcome to the Affiliate Program!",
        description: "Your affiliate account has been created successfully.",
      });

      fetchAffiliateData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const copyAffiliateLink = () => {
    if (!affiliateData) return;
    
    const affiliateLink = `${window.location.origin}?ref=${affiliateData.affiliate_code}`;
    navigator.clipboard.writeText(affiliateLink);
    
    toast({
      title: "Copied!",
      description: "Affiliate link copied to clipboard",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Join Our Affiliate Program</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Please sign in to join our affiliate program and start earning commissions.
            </p>
            <Button asChild className="w-full">
              <a href="/auth">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Affiliate Program</h1>
          <p className="text-muted-foreground">
            Earn money by referring new users to Legio Financial
          </p>
        </div>

        {!affiliateData ? (
          <div className="grid gap-8 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Join the Affiliate Program</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">How it works:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Get your unique referral link</li>
                    <li>• Share it with your audience</li>
                    <li>• Earn 10% commission on each successful referral</li>
                    <li>• Track your earnings in real-time</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Benefits:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 10% recurring commission</li>
                    <li>• Monthly payouts</li>
                    <li>• Real-time analytics</li>
                    <li>• Marketing materials provided</li>
                  </ul>
                </div>

                <Button 
                  onClick={joinAffiliateProgram} 
                  disabled={isJoining}
                  className="w-full"
                >
                  {isJoining ? 'Joining...' : 'Join Affiliate Program'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Commission Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                    <span>Personal Plan</span>
                    <Badge variant="secondary">$2.99/month</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                    <span>Business Plan</span>
                    <Badge variant="secondary">$9.99/month</Badge>
                  </div>
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Your commission</p>
                    <p className="text-2xl font-bold text-primary">10%</p>
                    <p className="text-sm text-muted-foreground">on every successful referral</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-primary" />
                    <div className="ml-4">
                      <p className="text-sm text-muted-foreground">Total Earnings</p>
                      <p className="text-2xl font-bold">${affiliateData.total_earnings?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-primary" />
                    <div className="ml-4">
                      <p className="text-sm text-muted-foreground">Referrals</p>
                      <p className="text-2xl font-bold">{affiliateData.referrals_count || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-primary" />
                    <div className="ml-4">
                      <p className="text-sm text-muted-foreground">Commission Rate</p>
                      <p className="text-2xl font-bold">{affiliateData.commission_rate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Affiliate Link */}
            <Card>
              <CardHeader>
                <CardTitle>Your Affiliate Link</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="affiliate-code">Affiliate Code</Label>
                  <div className="flex mt-1">
                    <Input
                      id="affiliate-code"
                      value={affiliateData.affiliate_code}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      className="ml-2"
                      onClick={copyAffiliateLink}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="affiliate-link">Full Affiliate Link</Label>
                  <div className="flex mt-1">
                    <Input
                      id="affiliate-link"
                      value={`${window.location.origin}?ref=${affiliateData.affiliate_code}`}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      className="ml-2"
                      onClick={copyAffiliateLink}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="bg-secondary/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">How to use your link:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Share your affiliate link on social media</li>
                    <li>• Include it in blog posts or newsletters</li>
                    <li>• Add it to your website or email signature</li>
                    <li>• When someone signs up using your link, you earn commission</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Affiliate;