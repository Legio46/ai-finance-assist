import React, { useState, useEffect } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
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
  CreditCard, 
  Building2,
  User,
  Crown,
  Settings,
  Shield,
  LogOut,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  LayoutDashboard
} from 'lucide-react';
import BusinessDashboard from '@/components/BusinessDashboard';
import PersonalDashboard from '@/components/PersonalDashboard';
import AIAdvisor from '@/components/AIAdvisor';
import DashboardCharts from '@/components/DashboardCharts';
import { supabase } from '@/integrations/supabase/client';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useToast } from '@/hooks/use-toast';
import AccountSwitcher from '@/components/AccountSwitcher';
import logo from '@/assets/shield-logo.png';

const Dashboard = () => {
  const { user, profile, loading, signOut } = useAuth();
  const { isAdmin } = useAdminCheck();
  const { t, formatCurrency } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stripeSubscribed, setStripeSubscribed] = useState(false);

  useEffect(() => {
    const checkStripe = async () => {
      try {
        const { data } = await supabase.functions.invoke('check-subscription');
        setStripeSubscribed(data?.subscribed === true);
      } catch {
        setStripeSubscribed(false);
      }
    };
    if (user) checkStripe();
  }, [user]);

  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
            <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          </div>
          <p className="text-sm text-muted-foreground font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const isTrialActive = profile?.trial_end && new Date(profile.trial_end) > new Date();
  const isTrialEndsAtActive = profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date();
  const trialActive = isTrialActive || isTrialEndsAtActive;
  const subscriptionStatus = profile?.subscription_tier || 'free';
  const hasActiveSubscription = profile?.subscription_status === 'active';
  const hasBusinessAccess = subscriptionStatus === 'business' || (subscriptionStatus === 'free' && trialActive) || isAdmin;

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error || data?.error) {
        toast({ title: "No active subscription", description: "Redirecting you to our pricing page to get started." });
        navigate('/pricing');
        return;
      }
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('Error opening customer portal:', err);
      navigate('/pricing');
    }
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  const tabItems = [
    { value: 'overview', label: t('overview'), icon: LayoutDashboard },
    { value: 'personal', label: t('personal'), icon: User },
    { value: 'business', label: t('business'), icon: Building2, disabled: !hasBusinessAccess, badge: !hasBusinessAccess ? 'Pro' : undefined },
    { value: 'advisor', label: t('aiAdvisor'), icon: Sparkles },
    { value: 'security', label: t('security'), icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.03),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--primary)/0.02),transparent_60%)]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left */}
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center shadow-sm ring-1 ring-border/50" style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))',
                }}>
                  <img src={logo} alt="Legio" className="w-full h-full object-cover" />
                </div>
                <span className="font-serif text-lg font-bold text-foreground tracking-tight">Legio</span>
              </Link>
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-px h-5 bg-border/60" />
                <Badge 
                  variant={subscriptionStatus === 'free' ? 'secondary' : 'default'} 
                  className="capitalize text-[10px] font-semibold tracking-wide px-2.5 py-0.5"
                >
                  {subscriptionStatus === 'free' && isTrialActive ? 'Trial' : subscriptionStatus}
                </Badge>
                <SecurityBadge variant="compact" />
              </div>
            </div>
            
            {/* Right */}
            <div className="flex items-center gap-2">
              <AccountSwitcher />
              {isAdmin && (
                <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex gap-1.5 text-muted-foreground hover:text-foreground">
                  <Link to="/admin">
                    <Crown className="w-3.5 h-3.5" />
                    <span className="text-xs">Admin</span>
                  </Link>
                </Button>
              )}
              {stripeSubscribed && (
                <Button variant="ghost" size="sm" onClick={handleManageSubscription} className="hidden sm:inline-flex gap-1.5 text-muted-foreground hover:text-foreground">
                  <Settings className="w-3.5 h-3.5" />
                  <span className="text-xs">Plan</span>
                </Button>
              )}
              <ThemeToggle />
              <div className="w-px h-5 bg-border/60 hidden sm:block" />
              <Button variant="ghost" size="sm" onClick={signOut} className="gap-1.5 text-muted-foreground hover:text-foreground">
                <LogOut className="w-3.5 h-3.5" />
                <span className="text-xs hidden sm:inline">Sign out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Trial Banner */}
      {trialActive && subscriptionStatus === 'free' && (
        <div className="relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))',
        }}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,rgba(255,255,255,0.1),transparent)]" />
          <div className="container mx-auto px-4 py-2.5 text-center relative">
            <p className="text-xs font-medium text-primary-foreground flex items-center justify-center gap-2">
              <Crown className="w-3.5 h-3.5" />
              Free trial active until {new Date(profile?.trial_end || profile?.trial_ends_at).toLocaleDateString()} 
              <Button variant="ghost" size="sm" className="ml-3 text-xs text-primary-foreground/90 hover:text-primary-foreground hover:bg-white/10 h-6 px-3 rounded-full" asChild>
                <Link to="/pricing">Upgrade Now <ChevronRight className="w-3 h-3 ml-0.5" /></Link>
              </Button>
            </p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 lg:px-8 py-6 relative z-10">
        {/* Welcome message */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Welcome back, {firstName}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here's your financial overview for today
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Custom tab navigation */}
          <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-1.5">
            <TabsList className="w-full bg-transparent h-auto gap-1 p-0">
              {tabItems.map(tab => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger 
                    key={tab.value}
                    value={tab.value} 
                    disabled={tab.disabled}
                    className="flex-1 relative px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/50 disabled:opacity-40"
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </span>
                    {tab.badge && (
                      <Badge variant="outline" className="ml-1.5 text-[9px] px-1.5 py-0 h-4 border-current/30 hidden sm:inline-flex">
                        {tab.badge}
                      </Badge>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6 mt-0">
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="group border-border/50 bg-card/80 backdrop-blur-sm hover:border-border transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Monthly Expenses</CardTitle>
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                    <CreditCard className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground tracking-tight">{formatCurrency(2350)}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowDownRight className="w-3 h-3 text-emerald-500" />
                    <span className="text-xs font-medium text-emerald-500">-12%</span>
                    <span className="text-xs text-muted-foreground">from last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="group border-border/50 bg-card/80 backdrop-blur-sm hover:border-border transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Savings Goal</CardTitle>
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                    <PiggyBank className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground tracking-tight">{formatCurrency(8500)}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                    <span className="text-xs font-medium text-emerald-500">+23%</span>
                    <span className="text-xs text-muted-foreground">of yearly goal</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="group border-border/50 bg-card/80 backdrop-blur-sm hover:border-border transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Investment Return</CardTitle>
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground tracking-tight">+14.2%</div>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                    <span className="text-xs font-medium text-emerald-500">+2.1%</span>
                    <span className="text-xs text-muted-foreground">this month</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Dashboard Charts */}
            <DashboardCharts />

            {/* Quick Actions */}
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base">{t('quickActions')}</CardTitle>
                <CardDescription className="text-xs">{t('quickActionsDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button 
                    onClick={() => setActiveTab('personal')} 
                    className="h-16 flex-col gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm"
                  >
                    <User className="w-5 h-5" />
                    <span className="text-xs font-medium">{t('trackPersonalExpenses')}</span>
                  </Button>
                  <Button 
                    onClick={() => hasBusinessAccess ? setActiveTab('business') : navigate('/pricing')} 
                    variant="outline" 
                    className="h-16 flex-col gap-1.5 relative rounded-xl border-border/50 hover:border-border hover:bg-muted/50"
                    disabled={!hasBusinessAccess}
                  >
                    <Building2 className="w-5 h-5" />
                    <span className="text-xs font-medium">{t('manageBusinessTaxes')}</span>
                    {!hasBusinessAccess && <Badge variant="secondary" className="absolute top-2 right-2 text-[9px] px-1.5">Pro</Badge>}
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('advisor')} 
                    variant="outline" 
                    className="h-16 flex-col gap-1.5 rounded-xl border-border/50 hover:border-border hover:bg-muted/50"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span className="text-xs font-medium">{t('getAIAdvice')}</span>
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
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {t('upgradeToBusiness')}
                    <Badge variant="default" className="text-[10px]">Personal Pro</Badge>
                  </CardTitle>
                  <CardDescription>{t('businessFeaturesLocked')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Unlock advanced business features including multi-country calculations, 
                    business expense management, and advanced analytics.
                  </p>
                  <Button asChild className="rounded-xl">
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
