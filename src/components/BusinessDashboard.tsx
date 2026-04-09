import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Building2, TrendingUp, TrendingDown, DollarSign, CreditCard,
  Plus, Store, BarChart3, PieChart, ArrowUpRight, ArrowDownRight,
  Sparkles, RefreshCw, Wallet, ShoppingCart, Receipt, AlertTriangle,
  Globe, Layers, Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface BusinessEntity {
  id: string;
  business_name: string;
  business_type: string | null;
  country: string;
  annual_revenue: number | null;
  calculated_tax: number | null;
  profit_loss: number | null;
  tax_rate: number | null;
  tax_year: number;
  expenses: any;
}

const glassCard = {
  background: 'rgba(12,20,45,0.62)',
  border: '1px solid rgba(255,255,255,0.09)',
  backdropFilter: 'blur(28px)',
};

const BusinessDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { formatCurrency } = useLanguage();
  const [businesses, setBusinesses] = useState<BusinessEntity[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    business_type: '',
    country: 'germany',
    annual_revenue: '',
  });

  const businessTypes = ['E-commerce', 'SaaS', 'Freelancer', 'Agency', 'Consulting', 'Retail', 'Other'];
  const countries = [
    { value: 'germany', label: 'Germany' },
    { value: 'usa', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'france', label: 'France' },
    { value: 'slovakia', label: 'Slovakia' },
    { value: 'netherlands', label: 'Netherlands' },
  ];

  useEffect(() => {
    if (user) fetchBusinesses();
  }, [user]);

  const fetchBusinesses = async () => {
    const { data } = await supabase
      .from('business_data')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    setBusinesses(data || []);
    if (data && data.length > 0 && !selectedBusiness) {
      setSelectedBusiness(data[0].id);
    }
  };

  const handleAddBusiness = async () => {
    if (!formData.business_name || !formData.annual_revenue) {
      toast({ title: "Missing info", description: "Please fill in name and revenue.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const revenue = parseFloat(formData.annual_revenue);
    const taxRate = 19; // simplified
    const tax = revenue * (taxRate / 100);
    const { error } = await supabase.from('business_data').insert([{
      user_id: user?.id,
      business_name: formData.business_name,
      business_type: formData.business_type,
      country: formData.country,
      annual_revenue: revenue,
      tax_year: new Date().getFullYear(),
      tax_rate: taxRate,
      calculated_tax: tax,
      profit_loss: revenue - tax,
    }]);
    if (!error) {
      toast({ title: "Business added", description: `${formData.business_name} has been added.` });
      setFormData({ business_name: '', business_type: '', country: 'germany', annual_revenue: '' });
      setShowAddForm(false);
      fetchBusinesses();
    }
    setLoading(false);
  };

  const current = businesses.find(b => b.id === selectedBusiness);
  const totalRevenue = businesses.reduce((s, b) => s + (b.annual_revenue || 0), 0);
  const totalExpenses = businesses.reduce((s, b) => s + (b.calculated_tax || 0), 0);
  const totalProfit = businesses.reduce((s, b) => s + (b.profit_loss || 0), 0);

  // Mock monthly data for charts
  const monthlyData = [
    { month: 'Jan', revenue: 12400, expenses: 8200 },
    { month: 'Feb', revenue: 14200, expenses: 9100 },
    { month: 'Mar', revenue: 11800, expenses: 7600 },
    { month: 'Apr', revenue: 16500, expenses: 10200 },
    { month: 'May', revenue: 18200, expenses: 11400 },
    { month: 'Jun', revenue: 15900, expenses: 9800 },
  ];

  const expenseCategories = [
    { name: 'Software & Tools', amount: 2400, pct: 28, color: '#60a5fa' },
    { name: 'Marketing', amount: 1800, pct: 21, color: '#f5c96a' },
    { name: 'Operations', amount: 1500, pct: 18, color: '#34d399' },
    { name: 'Payroll', amount: 1200, pct: 14, color: '#f87171' },
    { name: 'Other', amount: 1600, pct: 19, color: '#a78bfa' },
  ];

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl font-bold text-white">Business Hub</h2>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Monitor all your businesses in one place
          </p>
        </div>
        <div className="flex items-center gap-2">
          {businesses.length > 1 && (
            <Select value={selectedBusiness || ''} onValueChange={setSelectedBusiness}>
              <SelectTrigger className="w-[200px] h-9 text-xs rounded-xl bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select business" />
              </SelectTrigger>
              <SelectContent>
                {businesses.map(b => (
                  <SelectItem key={b.id} value={b.id}>{b.business_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="h-9 rounded-xl text-xs gap-1.5"
            style={{ background: 'rgba(245,201,106,0.15)', color: '#fde68a', border: '1px solid rgba(245,201,106,0.25)' }}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Business
          </Button>
        </div>
      </div>

      {/* Add Business Form */}
      {showAddForm && (
        <div className="rounded-2xl p-5 space-y-4" style={glassCard}>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Store className="w-4 h-4" style={{ color: '#f5c96a' }} />
            Add a New Business
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-white/60">Business Name</Label>
              <Input placeholder="My Store" value={formData.business_name}
                onChange={e => setFormData({ ...formData, business_name: e.target.value })}
                className="h-9 text-xs rounded-xl bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-white/60">Type</Label>
              <Select value={formData.business_type} onValueChange={v => setFormData({ ...formData, business_type: v })}>
                <SelectTrigger className="h-9 text-xs rounded-xl bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-white/60">Country</Label>
              <Select value={formData.country} onValueChange={v => setFormData({ ...formData, country: v })}>
                <SelectTrigger className="h-9 text-xs rounded-xl bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-white/60">Annual Revenue</Label>
              <Input type="number" placeholder="50000" value={formData.annual_revenue}
                onChange={e => setFormData({ ...formData, annual_revenue: e.target.value })}
                className="h-9 text-xs rounded-xl bg-white/5 border-white/10 text-white" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddBusiness} disabled={loading} className="h-9 rounded-xl text-xs"
              style={{ background: '#2563eb', color: '#fff' }}>
              {loading ? 'Adding...' : 'Add Business'}
            </Button>
            <Button variant="ghost" onClick={() => setShowAddForm(false)}
              className="h-9 rounded-xl text-xs text-white/50 hover:text-white">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <KpiCard icon={<DollarSign className="w-4 h-4" />} label="Total Revenue"
          value={formatCurrency(totalRevenue)} delta="+18%" positive
          color="#34d399" bgColor="rgba(52,211,153,0.12)" borderColor="rgba(52,211,153,0.22)" />
        <KpiCard icon={<Receipt className="w-4 h-4" />} label="Total Expenses"
          value={formatCurrency(totalExpenses)} delta="+5%" positive={false}
          color="#f87171" bgColor="rgba(248,113,113,0.12)" borderColor="rgba(248,113,113,0.22)" />
        <KpiCard icon={<TrendingUp className="w-4 h-4" />} label="Net Profit"
          value={formatCurrency(totalProfit)} delta="+23%" positive
          color="#f5c96a" bgColor="rgba(245,201,106,0.12)" borderColor="rgba(245,201,106,0.22)" />
        <KpiCard icon={<Layers className="w-4 h-4" />} label="Entities"
          value={String(businesses.length)} delta={`${businesses.length} active`} positive
          color="#60a5fa" bgColor="rgba(96,165,250,0.12)" borderColor="rgba(96,165,250,0.22)" />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="rounded-xl p-1 h-auto gap-1" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {['overview', 'expenses', 'insights'].map(tab => (
            <TabsTrigger key={tab} value={tab}
              className="rounded-lg text-xs px-4 py-2 capitalize data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50">
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Revenue Chart */}
            <div className="lg:col-span-2 rounded-2xl p-5" style={glassCard}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Revenue vs Expenses</h3>
                  <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Last 6 months</p>
                </div>
                <div className="flex items-center gap-4 text-[10px]">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: '#34d399' }} />Revenue</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: '#f87171' }} />Expenses</span>
                </div>
              </div>
              <div className="space-y-2">
                {monthlyData.map((m, i) => {
                  const maxVal = Math.max(...monthlyData.map(d => d.revenue));
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[10px] w-8 text-white/40">{m.month}</span>
                      <div className="flex-1 space-y-1">
                        <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${(m.revenue / maxVal) * 100}%`, background: 'linear-gradient(90deg, #34d399, #10b981)' }} />
                        </div>
                        <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${(m.expenses / maxVal) * 100}%`, background: 'linear-gradient(90deg, #f87171, #ef4444)' }} />
                        </div>
                      </div>
                      <div className="text-right w-20">
                        <div className="text-[10px] text-white/70">{formatCurrency(m.revenue)}</div>
                        <div className="text-[10px] text-white/40">{formatCurrency(m.expenses)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="rounded-2xl p-5" style={glassCard}>
              <h3 className="text-sm font-semibold text-white mb-1">Expense Breakdown</h3>
              <p className="text-[11px] mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>By category</p>
              <div className="space-y-3">
                {expenseCategories.map((cat, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/70">{cat.name}</span>
                      <span className="text-xs font-medium text-white">{formatCurrency(cat.amount)}</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${cat.pct}%`, background: cat.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Business Entities List */}
          {businesses.length > 0 && (
            <div className="rounded-2xl p-5" style={glassCard}>
              <h3 className="text-sm font-semibold text-white mb-4">Your Businesses</h3>
              <div className="space-y-2">
                {businesses.map(biz => (
                  <button key={biz.id}
                    onClick={() => setSelectedBusiness(biz.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-3.5 rounded-xl transition-all text-left",
                      biz.id === selectedBusiness ? 'ring-1' : ''
                    )}
                    style={{
                      background: biz.id === selectedBusiness ? 'rgba(245,201,106,0.08)' : 'rgba(255,255,255,0.03)',
                      border: '1px solid ' + (biz.id === selectedBusiness ? 'rgba(245,201,106,0.2)' : 'rgba(255,255,255,0.06)'),
                    }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(245,201,106,0.12)', border: '1px solid rgba(245,201,106,0.2)' }}>
                        <Store className="w-4 h-4" style={{ color: '#f5c96a' }} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{biz.business_name}</div>
                        <div className="text-[11px] text-white/40">{biz.business_type} - {biz.country}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-white">{formatCurrency(biz.annual_revenue || 0)}</div>
                      <div className="text-[11px]" style={{ color: (biz.profit_loss || 0) >= 0 ? '#34d399' : '#f87171' }}>
                        {(biz.profit_loss || 0) >= 0 ? '+' : ''}{formatCurrency(biz.profit_loss || 0)} net
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-4">
          <div className="rounded-2xl p-5" style={glassCard}>
            <h3 className="text-sm font-semibold text-white mb-1">Recent Transactions</h3>
            <p className="text-[11px] mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Connect your bank or Stripe to auto-import transactions
            </p>
            <div className="space-y-2">
              {[
                { name: 'Stripe Payout', amount: 2450, type: 'income', date: 'Apr 8' },
                { name: 'AWS Hosting', amount: -340, type: 'expense', date: 'Apr 7' },
                { name: 'Google Ads', amount: -580, type: 'expense', date: 'Apr 6' },
                { name: 'Client Payment', amount: 3200, type: 'income', date: 'Apr 5' },
                { name: 'Shopify Subscription', amount: -29, type: 'expense', date: 'Apr 4' },
                { name: 'Stripe Payout', amount: 1890, type: 'income', date: 'Apr 3' },
              ].map((tx, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: tx.type === 'income' ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)' }}>
                      {tx.type === 'income'
                        ? <ArrowUpRight className="w-3.5 h-3.5" style={{ color: '#34d399' }} />
                        : <ArrowDownRight className="w-3.5 h-3.5" style={{ color: '#f87171' }} />
                      }
                    </div>
                    <div>
                      <div className="text-xs font-medium text-white">{tx.name}</div>
                      <div className="text-[10px] text-white/40">{tx.date}</div>
                    </div>
                  </div>
                  <span className={cn("text-xs font-semibold", tx.amount >= 0 ? 'text-[#34d399]' : 'text-[#f87171]')}>
                    {tx.amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(tx.amount))}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-xl text-center" style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.15)' }}>
              <p className="text-xs text-white/60">
                <Globe className="w-3.5 h-3.5 inline mr-1" />
                Connect Stripe or your bank account to auto-import real transactions
              </p>
            </div>
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="rounded-2xl p-5" style={glassCard}>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4" style={{ color: '#f5c96a' }} />
              <h3 className="text-sm font-semibold text-white">AI Business Insights</h3>
            </div>
            <div className="space-y-3">
              {[
                { icon: <TrendingUp className="w-4 h-4" />, title: 'Revenue Growing', desc: 'Your revenue has increased 18% over the last quarter. Keep up the momentum with consistent marketing spend.', color: '#34d399' },
                { icon: <AlertTriangle className="w-4 h-4" />, title: 'High Marketing Cost', desc: 'Marketing expenses are 21% of total costs. Consider optimizing ad spend - organic channels could reduce this by 30%.', color: '#f5c96a' },
                { icon: <Activity className="w-4 h-4" />, title: 'Cash Flow Healthy', desc: 'Your cash reserves can cover 4.2 months of expenses. This is above the recommended 3-month buffer.', color: '#60a5fa' },
                { icon: <BarChart3 className="w-4 h-4" />, title: 'Tax Optimization', desc: 'Based on your structure, you could save up to 12% by restructuring expenses. Consider consulting a tax advisor.', color: '#a78bfa' },
              ].map((insight, i) => (
                <div key={i} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span style={{ color: insight.color }}>{insight.icon}</span>
                    <span className="text-xs font-semibold text-white">{insight.title}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{insight.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-5" style={glassCard}>
            <h3 className="text-sm font-semibold text-white mb-3">Profit Margin by Entity</h3>
            {businesses.length > 0 ? (
              <div className="space-y-3">
                {businesses.map(biz => {
                  const margin = biz.annual_revenue ? ((biz.profit_loss || 0) / biz.annual_revenue) * 100 : 0;
                  return (
                    <div key={biz.id} className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-xs text-white/70">{biz.business_name}</span>
                        <span className="text-xs font-medium" style={{ color: margin >= 0 ? '#34d399' : '#f87171' }}>
                          {margin.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="h-full rounded-full" style={{
                          width: `${Math.min(Math.abs(margin), 100)}%`,
                          background: margin >= 0 ? '#34d399' : '#f87171',
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-white/40">Add a business to see profit margins</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

/* KPI Card */
const KpiCard = ({ icon, label, value, delta, positive, color, bgColor, borderColor }: {
  icon: React.ReactNode; label: string; value: string; delta: string;
  positive: boolean; color: string; bgColor: string; borderColor: string;
}) => (
  <div className="rounded-2xl p-4" style={glassCard}>
    <div className="flex items-center justify-between mb-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: bgColor, border: `1px solid ${borderColor}`, color }}>
        {icon}
      </div>
      <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", positive ? 'text-[#34d399]' : 'text-[#f87171]')}
        style={{ background: positive ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)' }}>
        {positive ? <ArrowUpRight className="w-2.5 h-2.5 inline mr-0.5" /> : <ArrowDownRight className="w-2.5 h-2.5 inline mr-0.5" />}
        {delta}
      </span>
    </div>
    <div className="text-lg font-bold text-white">{value}</div>
    <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</div>
  </div>
);

export default BusinessDashboard;
