import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SecuritySettings from '@/components/SecuritySettings';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  PiggyBank, 
  Calculator, 
  CreditCard, 
  Building2,
  User,
  Crown,
  Settings
} from 'lucide-react';
import BusinessDashboard from '@/components/BusinessDashboard';
import PersonalDashboard from '@/components/PersonalDashboard';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { user, profile, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Redirect if not authenticated
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const isTrialActive = profile?.trial_end && new Date(profile.trial_end) > new Date();
  const subscriptionStatus = profile?.subscription_tier || 'free';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Legio
            </h1>
            <Badge variant={subscriptionStatus === 'free' ? 'secondary' : 'default'} className="capitalize">
              {subscriptionStatus === 'free' && isTrialActive ? 'Trial' : subscriptionStatus}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {profile?.full_name || user?.email}
            </span>
            {user?.email === 'legiox46@gmail.com' && (
              <Button variant="ghost" asChild>
                <Link to="/admin">
                  <Crown className="w-4 h-4 mr-2" />
                  Admin Panel
                </Link>
              </Button>
            )}
            <Button variant="outline" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Trial Banner */}
      {isTrialActive && subscriptionStatus === 'free' && (
        <div className="bg-gradient-primary text-white py-2">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm">
              <Crown className="inline w-4 h-4 mr-1" />
              Free trial active until {new Date(profile.trial_end).toLocaleDateString()} 
              <Button variant="ghost" size="sm" className="ml-4 text-white hover:bg-white/20">
                Upgrade Now
              </Button>
            </p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="personal">
              <User className="w-4 h-4 mr-2" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="business">
              <Building2 className="w-4 h-4 mr-2" />
              Business
            </TabsTrigger>
            <TabsTrigger value="advisor">AI Advisor</TabsTrigger>
            <TabsTrigger value="security">
              <Settings className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$2,350</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-success">-12%</span> from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Savings Goal</CardTitle>
                  <PiggyBank className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$8,500</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-success">+23%</span> of yearly goal
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tax Estimate</CardTitle>
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$12,340</div>
                  <p className="text-xs text-muted-foreground">
                    For current fiscal year
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Investment Return</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+14.2%</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-success">+2.1%</span> this month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Get started with your financial management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => setActiveTab('personal')} 
                    className="h-20 flex-col bg-gradient-primary hover:opacity-90"
                  >
                    <User className="w-6 h-6 mb-2" />
                    Track Personal Expenses
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('business')} 
                    variant="outline" 
                    className="h-20 flex-col"
                  >
                    <Building2 className="w-6 h-6 mb-2" />
                    Manage Business Taxes
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('advisor')} 
                    variant="outline" 
                    className="h-20 flex-col"
                  >
                    <BarChart3 className="w-6 h-6 mb-2" />
                    Get AI Advice
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personal">
            <PersonalDashboard />
          </TabsContent>

          <TabsContent value="business">
            <BusinessDashboard />
          </TabsContent>

          <TabsContent value="advisor">
            <Card>
              <CardHeader>
                <CardTitle>AI Financial Advisor</CardTitle>
                <CardDescription>
                  Get personalized financial advice powered by AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">AI Advisor Coming Soon</h3>
                  <p className="text-muted-foreground mb-6">
                    Get personalized advice on investments, mortgages, and financial planning
                  </p>
                  <Button disabled>
                    Enable AI Advisor
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <SecuritySettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;