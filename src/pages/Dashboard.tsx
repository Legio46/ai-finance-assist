import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SecuritySettings from '@/components/SecuritySettings';
import SecurityBadge from '@/components/SecurityBadge';
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
import AIAdvisor from '@/components/AIAdvisor';
import DashboardCharts from '@/components/DashboardCharts';
import { supabase } from '@/integrations/supabase/client';
import LanguageSelector from '@/components/LanguageSelector';
import { ThemeToggle } from '@/components/ThemeToggle';

const Dashboard = () => {
  const { user, profile, loading, signOut } = useAuth();
  const { isAdmin } = useAdminCheck();
  const { t, formatCurrency } = useLanguage();
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
  const hasBusinessAccess = subscriptionStatus === 'business' || (subscriptionStatus === 'free' && isTrialActive) || isAdmin;

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
            <SecurityBadge variant="compact" />
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {profile?.full_name || user?.email}
            </span>
            {isAdmin && (
              <Button variant="ghost" asChild>
                <Link to="/admin">
                  <Crown className="w-4 h-4 mr-2" />
                  Admin Panel
                </Link>
              </Button>
            )}
            <ThemeToggle />
            <LanguageSelector />
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
            <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
            <TabsTrigger value="personal">
              <User className="w-4 h-4 mr-2" />
              {t('personal')}
            </TabsTrigger>
            <TabsTrigger value="business" disabled={!hasBusinessAccess}>
              <Building2 className="w-4 h-4 mr-2" />
              {t('business')}
              {!hasBusinessAccess && <Badge variant="secondary" className="ml-2 text-xs">Pro</Badge>}
            </TabsTrigger>
            <TabsTrigger value="advisor">{t('aiAdvisor')}</TabsTrigger>
            <TabsTrigger value="security">
              <Settings className="w-4 h-4 mr-2" />
              {t('security')}
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
                  <div className="text-2xl font-bold">{formatCurrency(2350)}</div>
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
                  <div className="text-2xl font-bold">{formatCurrency(8500)}</div>
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
                  <div className="text-2xl font-bold">{formatCurrency(12340)}</div>
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

            {/* Dashboard Charts */}
            <DashboardCharts />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t('quickActions')}</CardTitle>
                <CardDescription>
                  {t('quickActionsDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => setActiveTab('personal')} 
                    className="h-20 flex-col bg-gradient-primary hover:opacity-90"
                  >
                    <User className="w-6 h-6 mb-2" />
                    {t('trackPersonalExpenses')}
                  </Button>
                  <Button 
                    onClick={() => hasBusinessAccess ? setActiveTab('business') : window.location.href = '/pricing'} 
                    variant="outline" 
                    className="h-20 flex-col relative"
                    disabled={!hasBusinessAccess}
                  >
                    <Building2 className="w-6 h-6 mb-2" />
                    {t('manageBusinessTaxes')}
                    {!hasBusinessAccess && <Badge variant="secondary" className="absolute top-2 right-2 text-xs">Pro</Badge>}
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('advisor')} 
                    variant="outline" 
                    className="h-20 flex-col"
                  >
                    <BarChart3 className="w-6 h-6 mb-2" />
                    {t('getAIAdvice')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personal">
            <PersonalDashboard />
          </TabsContent>

          <TabsContent value="business">
            {hasBusinessAccess ? (
              <BusinessDashboard />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>{t('upgradeToBusiness')}</CardTitle>
                  <CardDescription>{t('businessFeaturesLocked')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Unlock advanced business features including multi-country tax calculations, 
                    business expense management, and advanced analytics.
                  </p>
                  <Button asChild>
                    <Link to="/pricing">{t('viewPricing')}</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="advisor">
            <AIAdvisor 
              userContext={{
                accountType: profile?.account_type,
                country: profile?.country
              }}
            />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <SecurityBadge variant="full" />
            <SecuritySettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;