import React, { useState, useEffect } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import SecuritySettings from '@/components/SecuritySettings';
import SecurityBadge from '@/components/SecurityBadge';
import { 
  BarChart3, TrendingUp, PiggyBank, CreditCard, Building2,
  User, Crown, Settings, Shield, LogOut, ChevronRight,
  Sparkles, ArrowUpRight, ArrowDownRight, Wallet,
  LayoutDashboard, Search, Bell, Grid3X3
} from 'lucide-react';
import BusinessDashboard from '@/components/BusinessDashboard';
import PersonalDashboard from '@/components/PersonalDashboard';
import AIAdvisor from '@/components/AIAdvisor';
import DashboardCharts from '@/components/DashboardCharts';
import StockTicker from '@/components/StockTicker';
import SkyScene from '@/components/SkyScene';
import { supabase } from '@/integrations/supabase/client';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useToast } from '@/hooks/use-toast';
import AccountSwitcher from '@/components/AccountSwitcher';
import logo from '@/assets/shield-logo.png';
import { cn } from '@/lib/utils';

type DashboardView = 'overview' | 'personal' | 'business' | 'advisor' | 'security';

const Dashboard = () => {
  const { user, profile, loading, signOut } = useAuth();
  const { isAdmin } = useAdminCheck();
  const { t, formatCurrency } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<DashboardView>('overview');
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #0b3d8c 0%, #1562b8 40%, #0c1a35 100%)' }}>
        <div className="text-center space-y-3">
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-[#f5c96a]/20"></div>
            <div className="absolute inset-0 rounded-full border-2 border-[#f5c96a] border-t-transparent animate-spin"></div>
          </div>
          <p className="text-sm text-white/60 font-medium">Loading your dashboard...</p>
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
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const mainNavItems = [
    { id: 'overview' as DashboardView, icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'personal' as DashboardView, icon: Wallet, label: 'Personal Finance' },
    { id: 'business' as DashboardView, icon: Building2, label: 'Business', disabled: !hasBusinessAccess, badge: !hasBusinessAccess ? 'Pro' : undefined },
  ];

  const toolNavItems = [
    { id: 'advisor' as DashboardView, icon: Sparkles, label: 'AI Advisor' },
    { id: 'security' as DashboardView, icon: Shield, label: 'Security' },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden flex relative">
      {/* Sky Scene Background */}
      <SkyScene />

      {/* Noise overlay */}
      <div className="noise-overlay fixed inset-0 z-[3] pointer-events-none" />

      {/* ── SIDEBAR ── */}
      <aside className="relative z-10 w-[230px] flex-shrink-0 h-screen flex flex-col overflow-hidden"
        style={{
          background: 'rgba(8,14,34,0.72)',
          borderRight: '1px solid rgba(255,255,255,0.09)',
          backdropFilter: 'blur(32px)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.09)' }}>
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center"
            style={{ background: 'rgba(245,201,106,0.15)', border: '1px solid rgba(245,201,106,0.3)' }}>
            <img src={logo} alt="Legio" className="w-full h-full object-cover" />
          </div>
          <span className="font-serif text-xl font-black text-white tracking-tight">Legio</span>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-3 px-2.5">
          <div className="space-y-1">
            <p className="text-[9px] font-semibold uppercase tracking-[2px] px-2 pt-3 pb-1" style={{ color: 'rgba(255,255,255,0.22)' }}>
              Main
            </p>
            {mainNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  disabled={item.disabled}
                  onClick={() => item.disabled ? toast({ title: "Pro Feature", description: "Upgrade to access Business features." }) : setActiveView(item.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-all duration-150 relative border border-transparent",
                    isActive
                      ? "text-[#fde68a]"
                      : item.disabled
                        ? "text-white/30 cursor-not-allowed"
                        : "text-white/58 hover:text-white hover:bg-white/[0.07]"
                  )}
                  style={isActive ? { background: 'rgba(245,201,106,0.12)', borderColor: 'rgba(245,201,106,0.2)' } : {}}
                >
                  {isActive && (
                    <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-[3px] h-[18px] rounded-r-sm" style={{ background: '#f5c96a' }} />
                  )}
                  <Icon className="w-[14px] h-[14px]" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(245,201,106,0.15)', color: '#f5c96a' }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <p className="text-[9px] font-semibold uppercase tracking-[2px] px-2 pt-5 pb-1" style={{ color: 'rgba(255,255,255,0.22)' }}>
              Tools
            </p>
            {toolNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-all duration-150 relative border border-transparent",
                    isActive
                      ? "text-[#fde68a]"
                      : "text-white/58 hover:text-white hover:bg-white/[0.07]"
                  )}
                  style={isActive ? { background: 'rgba(245,201,106,0.12)', borderColor: 'rgba(245,201,106,0.2)' } : {}}
                >
                  {isActive && (
                    <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-[3px] h-[18px] rounded-r-sm" style={{ background: '#f5c96a' }} />
                  )}
                  <Icon className="w-[14px] h-[14px]" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {isAdmin && (
              <>
                <p className="text-[9px] font-semibold uppercase tracking-[2px] px-2 pt-5 pb-1" style={{ color: 'rgba(255,255,255,0.22)' }}>
                  Admin
                </p>
                <Link
                  to="/admin"
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-white/58 hover:text-white hover:bg-white/[0.07] transition-all duration-150"
                >
                  <Crown className="w-[14px] h-[14px]" />
                  <span>Admin Panel</span>
                </Link>
              </>
            )}
          </div>
        </ScrollArea>

        {/* Footer - User */}
        <div className="px-4 py-3.5 border-t flex items-center gap-2.5" style={{ borderColor: 'rgba(255,255,255,0.09)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #c8973a, #f5c96a)', color: '#0d0a06' }}>
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[12.5px] font-medium text-white truncate">{profile?.full_name || 'User'}</div>
            <div className="text-[10.5px] capitalize" style={{ color: 'rgba(255,255,255,0.58)' }}>
              {subscriptionStatus === 'free' && trialActive ? 'Trial' : subscriptionStatus} Account
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut} className="w-7 h-7 text-white/40 hover:text-white hover:bg-white/10">
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="relative z-10 flex-1 flex flex-col h-screen overflow-hidden">
        {/* Stock Ticker */}
        <StockTicker />

        {/* Topbar */}
        <div className="flex items-center justify-between px-6 py-3.5 flex-shrink-0"
          style={{
            background: 'rgba(12,20,45,0.62)',
            borderBottom: '1px solid rgba(255,255,255,0.09)',
            backdropFilter: 'blur(28px)',
          }}
        >
          <div>
            <h2 className="font-serif text-xl font-bold text-white tracking-tight">
              {greeting}, {firstName}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.58)' }}>
              {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <AccountSwitcher />
            {stripeSubscribed && (
              <button onClick={handleManageSubscription}
                className="w-[34px] h-[34px] rounded-lg flex items-center justify-center text-sm transition-all"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.09)' }}
              >
                <Settings className="w-3.5 h-3.5 text-white/58" />
              </button>
            )}
            <ThemeToggle />
          </div>
        </div>

        {/* Trial Banner */}
        {trialActive && subscriptionStatus === 'free' && (
          <div className="px-6 py-2 flex-shrink-0"
            style={{ background: 'rgba(245,201,106,0.08)', borderBottom: '1px solid rgba(245,201,106,0.15)' }}>
            <p className="text-xs font-medium flex items-center gap-2" style={{ color: '#fde68a' }}>
              <Crown className="w-3.5 h-3.5" />
              Free trial active until {new Date(profile?.trial_end || profile?.trial_ends_at).toLocaleDateString()}
              <Link to="/pricing" className="ml-3 underline underline-offset-2 hover:no-underline">
                Upgrade Now <ChevronRight className="w-3 h-3 inline" />
              </Link>
            </p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5" style={{ position: 'relative', zIndex: 5 }}>
          {activeView === 'overview' && <OverviewContent formatCurrency={formatCurrency} setActiveView={setActiveView} hasBusinessAccess={hasBusinessAccess} />}
          {activeView === 'personal' && <PersonalDashboard />}
          {activeView === 'business' && (
            hasBusinessAccess ? (
              <BusinessDashboard />
            ) : (
              <div className="glass rounded-2xl p-6 max-w-lg mx-auto text-center space-y-4">
                <Building2 className="w-10 h-10 mx-auto" style={{ color: '#f5c96a' }} />
                <h3 className="font-serif text-lg font-bold text-white">Unlock Business Features</h3>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.58)' }}>
                  Monitor your business revenue, expenses, and get AI-powered insights.
                </p>
                <Button asChild className="rounded-xl" style={{ background: 'rgba(245,201,106,0.15)', color: '#fde68a', border: '1px solid rgba(245,201,106,0.25)' }}>
                  <Link to="/pricing">View Pricing</Link>
                </Button>
              </div>
            )
          )}
          {activeView === 'advisor' && (
            <AIAdvisor userContext={{ accountType: profile?.account_type, country: profile?.country }} />
          )}
          {activeView === 'security' && (
            <div className="space-y-6">
              <SecurityBadge variant="full" />
              <SecuritySettings />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── OVERVIEW CONTENT ── */
const OverviewContent = ({ formatCurrency, setActiveView, hasBusinessAccess }: {
  formatCurrency: (n: number) => string;
  setActiveView: (v: DashboardView) => void;
  hasBusinessAccess: boolean;
}) => {
  return (
    <div className="space-y-5 animate-fade-up">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <KpiCard
          icon={<CreditCard className="w-4 h-4" />}
          iconBg="rgba(245,201,106,0.12)"
          iconBorder="rgba(245,201,106,0.22)"
          label="Monthly Expenses"
          value={formatCurrency(2350)}
          delta="-12%"
          deltaLabel="from last month"
          positive
          sparkColor="#f5c96a"
          sparkPath="M0,28 C15,24 30,20 45,16 C55,13 65,15 75,10 C85,6 90,7 100,3"
        />
        <KpiCard
          icon={<PiggyBank className="w-4 h-4" />}
          iconBg="rgba(52,211,153,0.12)"
          iconBorder="rgba(52,211,153,0.22)"
          label="Savings Goal"
          value={formatCurrency(8500)}
          delta="+23%"
          deltaLabel="of yearly goal"
          positive
          sparkColor="#34d399"
          sparkPath="M0,26 C12,22 24,18 36,20 C48,22 56,14 68,9 C80,4 88,7 100,2"
        />
        <KpiCard
          icon={<TrendingUp className="w-4 h-4" />}
          iconBg="rgba(96,165,250,0.12)"
          iconBorder="rgba(96,165,250,0.22)"
          label="Cash Flow"
          value={formatCurrency(4230)}
          delta="-$180"
          deltaLabel="vs last month"
          positive={false}
          sparkColor="#60a5fa"
          sparkPath="M0,20 C12,18 22,22 34,18 C46,14 56,20 68,12 C80,6 88,9 100,4"
        />
        <KpiCard
          icon={<BarChart3 className="w-4 h-4" />}
          iconBg="rgba(248,113,113,0.12)"
          iconBorder="rgba(248,113,113,0.22)"
          label="Investment Return"
          value="+14.2%"
          delta="+2.1%"
          deltaLabel="this month"
          positive
          sparkColor="#f87171"
          sparkPath="M0,24 C12,22 22,26 34,20 C46,15 56,18 68,14 C80,10 88,12 100,6"
        />
      </div>

      {/* Charts */}
      <DashboardCharts />

      {/* Quick Actions */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-1">Quick Actions</h3>
        <p className="text-[11px] mb-4" style={{ color: 'rgba(255,255,255,0.58)' }}>Jump to a section</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button onClick={() => setActiveView('personal')}
            className="flex items-center gap-3 p-3.5 rounded-xl transition-all"
            style={{ background: 'rgba(245,201,106,0.12)', border: '1px solid rgba(245,201,106,0.22)' }}
          >
            <Wallet className="w-5 h-5" style={{ color: '#f5c96a' }} />
            <span className="text-sm font-medium text-white">Track Personal Expenses</span>
          </button>
          <button onClick={() => hasBusinessAccess ? setActiveView('business') : undefined}
            className={cn(
              "flex items-center gap-3 p-3.5 rounded-xl transition-all",
              !hasBusinessAccess && "opacity-50 cursor-not-allowed"
            )}
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
          >
            <Building2 className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.58)' }} />
            <span className="text-sm font-medium text-white">Business Dashboard</span>
            {!hasBusinessAccess && (
              <span className="ml-auto text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(245,201,106,0.15)', color: '#f5c96a' }}>Pro</span>
            )}
          </button>
          <button onClick={() => setActiveView('advisor')}
            className="flex items-center gap-3 p-3.5 rounded-xl transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
          >
            <Sparkles className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.58)' }} />
            <span className="text-sm font-medium text-white">Get AI Advice</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── KPI CARD ── */
const KpiCard = ({ icon, iconBg, iconBorder, label, value, delta, deltaLabel, positive, sparkColor, sparkPath }: {
  icon: React.ReactNode;
  iconBg: string;
  iconBorder: string;
  label: string;
  value: string;
  delta: string;
  deltaLabel: string;
  positive: boolean;
  sparkColor: string;
  sparkPath: string;
}) => {
  const gradientId = `spark-${label.replace(/\s/g, '')}`;
  return (
    <div className="glass rounded-2xl p-4 transition-all hover:border-white/[0.16]" style={{ animation: 'fadeUp 0.5s ease both' }}>
      <div className="w-9 h-9 rounded-[10px] flex items-center justify-center mb-3"
        style={{ background: iconBg, border: `1px solid ${iconBorder}`, color: sparkColor }}>
        {icon}
      </div>
      <div className="text-[10px] font-medium uppercase tracking-[1.2px] mb-1" style={{ color: 'rgba(255,255,255,0.58)' }}>
        {label}
      </div>
      <div className="font-serif text-2xl font-black text-white tracking-tight leading-none">
        {value}
      </div>
      <div className="flex items-center gap-1.5 mt-1.5 text-[11.5px] font-medium">
        <span style={{ color: positive ? '#34d399' : '#f87171' }}>
          {positive ? <ArrowUpRight className="w-3 h-3 inline" /> : <ArrowDownRight className="w-3 h-3 inline" />}
          {' '}{delta}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.58)', fontSize: '10.5px', fontWeight: 400 }}>{deltaLabel}</span>
      </div>
      {/* Sparkline */}
      <div className="mt-3 h-[34px]">
        <svg viewBox="0 0 100 34" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={sparkColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={sparkColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path fill={`url(#${gradientId})`} d={`${sparkPath} L100,34 L0,34Z`} />
          <path fill="none" stroke={sparkColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d={sparkPath} />
        </svg>
      </div>
    </div>
  );
};

export default Dashboard;
