import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { 
  PieChart as PieChartIcon, BarChart3, TrendingUp, TrendingDown, Target, X, Calendar, 
  DollarSign, ArrowUpRight, ArrowDownRight, Wallet, Sparkles, Info
} from 'lucide-react';

const COLORS = [
  'hsl(351 76% 56%)',
  'hsl(199 89% 48%)',
  'hsl(142 76% 36%)',
  'hsl(38 92% 50%)',
  'hsl(280 65% 60%)',
  'hsl(190 80% 42%)',
  'hsl(24 95% 55%)',
  'hsl(260 60% 50%)',
];

type TimeRange = 'week' | 'month' | 'quarter' | 'year';

interface ExpenseData {
  category: string;
  amount: number;
  date: string;
}

interface IncomeData {
  source_name: string;
  amount: number;
  frequency: string;
}

interface BudgetData {
  category: string;
  amount: number;
}

// Simple tooltip
const SimpleTooltip = ({ active, payload, label, formatCurrency }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-lg p-3 min-w-[140px]">
        {label && <p className="font-medium text-xs mb-1.5 text-foreground">{label}</p>}
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground text-xs">{entry.name}</span>
            </div>
            <span className="font-semibold text-xs">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Stat card
const StatCard = ({ icon: Icon, label, value, trend, trendValue, color }: { 
  icon: any; label: string; value: string; trend?: 'up' | 'down' | 'neutral'; trendValue?: string; color: string 
}) => (
  <div className="relative overflow-hidden rounded-xl border bg-card p-4 transition-all duration-300 hover:shadow-md group">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}18` }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
        <p className="text-lg font-bold tracking-tight truncate">{value}</p>
      </div>
      {trend && trendValue && (
        <div className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full ${
          trend === 'up' ? 'bg-success/10 text-success' : trend === 'down' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
        }`}>
          {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : trend === 'down' ? <ArrowDownRight className="h-3 w-3" /> : null}
          {trendValue}
        </div>
      )}
    </div>
  </div>
);

// Helper text for empty states
const EmptyState = ({ icon: Icon, message, hint }: { icon: any; message: string; hint?: string }) => (
  <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground gap-2">
    <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center">
      <Icon className="h-6 w-6 opacity-40" />
    </div>
    <p className="text-sm font-medium">{message}</p>
    {hint && <p className="text-xs text-muted-foreground/70">{hint}</p>}
  </div>
);

const DashboardCharts = () => {
  const { user } = useAuth();
  const { formatCurrency } = useLanguage();
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [income, setIncome] = useState<IncomeData[]>([]);
  const [budgets, setBudgets] = useState<BudgetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      const [expenseRes, incomeRes, budgetRes] = await Promise.all([
        supabase.from('personal_expenses').select('category, amount, date').eq('user_id', user.id).order('date', { ascending: true }),
        supabase.from('income_sources').select('source_name, amount, frequency').eq('user_id', user.id).eq('is_active', true),
        supabase.from('budgets').select('category, amount').eq('user_id', user.id),
      ]);
      if (expenseRes.data) setExpenses(expenseRes.data);
      if (incomeRes.data) setIncome(incomeRes.data);
      if (budgetRes.data) setBudgets(budgetRes.data);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = useCallback(() => {
    const now = new Date();
    const start = new Date(now);
    switch (timeRange) {
      case 'week': start.setDate(now.getDate() - 7); break;
      case 'month': start.setMonth(now.getMonth() - 1); break;
      case 'quarter': start.setMonth(now.getMonth() - 3); break;
      case 'year': start.setFullYear(now.getFullYear() - 1); break;
    }
    return { start, end: now };
  }, [timeRange]);

  const getFilteredExpenses = useCallback(() => {
    const { start, end } = getDateRange();
    return expenses.filter(exp => {
      const d = new Date(exp.date);
      return d >= start && d <= end && (selectedCategory ? exp.category === selectedCategory : true);
    });
  }, [expenses, getDateRange, selectedCategory]);

  const stats = useMemo(() => {
    const filtered = getFilteredExpenses();
    const totalExpenses = filtered.reduce((s, e) => s + Number(e.amount), 0);
    const monthlyIncome = income.reduce((sum, inc) => {
      const a = Number(inc.amount);
      switch (inc.frequency) {
        case 'weekly': return sum + a * 4.33;
        case 'bi-weekly': return sum + a * 2.17;
        case 'monthly': return sum + a;
        case 'yearly': return sum + a / 12;
        default: return sum + a;
      }
    }, 0);
    const net = monthlyIncome - totalExpenses;
    const savingsRate = monthlyIncome > 0 ? (net / monthlyIncome) * 100 : 0;
    return { totalExpenses, monthlyIncome, net, savingsRate };
  }, [getFilteredExpenses, income]);

  const getCategoryBreakdown = useCallback(() => {
    const filtered = getFilteredExpenses();
    const totals: Record<string, number> = {};
    filtered.forEach(e => { totals[e.category] = (totals[e.category] || 0) + Number(e.amount); });
    return Object.entries(totals).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [getFilteredExpenses]);

  const getIncomeVsExpenses = useCallback(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const { start, end } = getDateRange();
    const filtered = selectedCategory ? expenses.filter(e => e.category === selectedCategory) : expenses;
    const monthCount = timeRange === 'quarter' ? 3 : timeRange === 'year' ? 12 : timeRange === 'month' ? 1 : 1;
    
    const periods: Record<string, { period: string; income: number; expenses: number }> = {};
    
    if (timeRange === 'week') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        periods[d.toISOString().split('T')[0]] = { period: days[d.getDay()], income: 0, expenses: 0 };
      }
    } else {
      const count = timeRange === 'month' ? 4 : monthCount;
      for (let i = count - 1; i >= 0; i--) {
        const d = new Date();
        if (timeRange === 'month') {
          d.setDate(d.getDate() - i * 7);
          const key = d.toISOString().split('T')[0];
          periods[key] = { period: `Week ${count - i}`, income: 0, expenses: 0 };
        } else {
          d.setMonth(d.getMonth() - i);
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          periods[key] = { period: monthNames[d.getMonth()], income: 0, expenses: 0 };
        }
      }
    }

    filtered.forEach(exp => {
      const d = new Date(exp.date);
      if (d >= start && d <= end) {
        const key = timeRange === 'week' ? d.toISOString().split('T')[0] 
          : timeRange === 'month' ? (() => { const keys = Object.keys(periods); return keys.reduce((best, k) => Math.abs(new Date(k).getTime() - d.getTime()) < Math.abs(new Date(best).getTime() - d.getTime()) ? k : best, keys[0]); })()
          : `${d.getFullYear()}-${d.getMonth()}`;
        if (periods[key]) periods[key].expenses += Number(exp.amount);
      }
    });

    const monthlyIncome = stats.monthlyIncome;
    Object.keys(periods).forEach(k => {
      if (timeRange === 'week') periods[k].income = monthlyIncome / 30;
      else if (timeRange === 'month') periods[k].income = monthlyIncome / 4;
      else periods[k].income = monthlyIncome;
    });

    return Object.values(periods);
  }, [expenses, stats.monthlyIncome, getDateRange, timeRange, selectedCategory]);

  const getBudgetProgress = useCallback(() => {
    const filtered = getFilteredExpenses();
    const spending: Record<string, number> = {};
    filtered.forEach(e => { spending[e.category] = (spending[e.category] || 0) + Number(e.amount); });
    return budgets.map(b => ({
      category: b.category,
      budget: Number(b.amount),
      spent: spending[b.category] || 0,
      percentage: Math.min(Math.round(((spending[b.category] || 0) / Number(b.amount)) * 100), 100),
    }));
  }, [budgets, getFilteredExpenses]);

  const handleCategoryClick = (data: any) => {
    setSelectedCategory(prev => prev === data.name ? null : data.name);
  };

  const timeRangeOptions: { value: TimeRange; label: string; description: string }[] = [
    { value: 'week', label: '7D', description: 'Last 7 days' },
    { value: 'month', label: '1M', description: 'Last month' },
    { value: 'quarter', label: '3M', description: 'Last 3 months' },
    { value: 'year', label: '1Y', description: 'Last year' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted/50 animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <Card key={i} className="animate-pulse"><CardContent className="h-64" /></Card>)}
        </div>
      </div>
    );
  }

  const categoryBreakdown = getCategoryBreakdown();
  const incomeVsExpenses = getIncomeVsExpenses();
  const budgetProgress = getBudgetProgress();
  const totalSpending = categoryBreakdown.reduce((s, c) => s + c.value, 0);

  return (
    <div className="space-y-6">
      {/* Quick Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Wallet} label="Monthly Income" value={formatCurrency(stats.monthlyIncome)} trend="up" trendValue="Monthly" color="hsl(142 76% 36%)" />
        <StatCard icon={DollarSign} label="Total Spent" value={formatCurrency(stats.totalExpenses)} trend={stats.totalExpenses > stats.monthlyIncome ? 'down' : 'neutral'} trendValue={timeRange.toUpperCase()} color="hsl(351 76% 56%)" />
        <StatCard icon={stats.net >= 0 ? TrendingUp : TrendingDown} label="Net Cashflow" value={formatCurrency(Math.abs(stats.net))} trend={stats.net >= 0 ? 'up' : 'down'} trendValue={stats.net >= 0 ? 'Surplus' : 'Deficit'} color={stats.net >= 0 ? 'hsl(142 76% 36%)' : 'hsl(0 84% 60%)'} />
        <StatCard icon={Sparkles} label="Savings Rate" value={`${Math.max(0, stats.savingsRate).toFixed(0)}%`} trend={stats.savingsRate >= 20 ? 'up' : stats.savingsRate >= 0 ? 'neutral' : 'down'} trendValue={stats.savingsRate >= 20 ? 'Great' : stats.savingsRate >= 0 ? 'OK' : 'Low'} color="hsl(199 89% 48%)" />
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-1 bg-muted/60 rounded-xl p-1">
            {timeRangeOptions.map(option => (
              <Button key={option.value} variant={timeRange === option.value ? 'default' : 'ghost'} size="sm"
                onClick={() => setTimeRange(option.value)}
                className={`h-8 px-4 text-xs font-semibold rounded-lg ${timeRange === option.value ? 'shadow-md' : ''}`}
                title={option.description}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
        
        {selectedCategory && (
          <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary border-primary/20">
            Showing: {selectedCategory}
            <button onClick={() => setSelectedCategory(null)} className="hover:bg-primary/20 rounded-full p-0.5 ml-1">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Where Your Money Goes */}
        <Card className="border-border/50 overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Where Your Money Goes</CardTitle>
                <CardDescription className="text-xs">Tap a category to filter all charts</CardDescription>
              </div>
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <PieChartIcon className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {categoryBreakdown.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="45%" height={200}>
                  <PieChart>
                    <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value"
                      onClick={handleCategoryClick} style={{ cursor: 'pointer' }}>
                      {categoryBreakdown.map((entry, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="hsl(var(--card))" strokeWidth={2}
                          style={{ opacity: selectedCategory && selectedCategory !== entry.name ? 0.3 : 1 }} />
                      ))}
                    </Pie>
                    <Tooltip content={<SimpleTooltip formatCurrency={formatCurrency} />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1">
                  {categoryBreakdown.slice(0, 6).map((cat, i) => {
                    const pct = totalSpending > 0 ? Math.round((cat.value / totalSpending) * 100) : 0;
                    return (
                      <button key={cat.name} onClick={() => handleCategoryClick(cat)}
                        className={`flex items-center justify-between w-full p-2 rounded-lg transition-all text-left hover:bg-muted/60 ${selectedCategory === cat.name ? 'bg-muted ring-1 ring-primary/30' : ''}`}>
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-xs font-medium truncate max-w-[80px]">{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{formatCurrency(cat.value)}</span>
                          <span className="font-semibold text-xs w-8 text-right">{pct}%</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <EmptyState icon={PieChartIcon} message="No expenses yet" hint="Add expenses to see your spending breakdown" />
            )}
          </CardContent>
        </Card>

        {/* Income vs Spending */}
        <Card className="border-border/50 overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Income vs Spending</CardTitle>
                <CardDescription className="text-xs">
                  {selectedCategory ? `Filtered: ${selectedCategory}` : 'Compare what you earn vs spend'}
                </CardDescription>
              </div>
              <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-success" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {incomeVsExpenses.some(d => d.income > 0 || d.expenses > 0) ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={incomeVsExpenses} barGap={4}>
                  <defs>
                    <linearGradient id="incG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(142 76% 36%)" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="hsl(142 76% 36%)" stopOpacity={0.5} />
                    </linearGradient>
                    <linearGradient id="expG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(351 76% 56%)" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="hsl(351 76% 56%)" stopOpacity={0.5} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} vertical={false} />
                  <XAxis dataKey="period" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} width={50} />
                  <Tooltip content={<SimpleTooltip formatCurrency={formatCurrency} />} />
                  <Bar dataKey="income" name="Income" fill="url(#incG)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="url(#expG)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={BarChart3} message="No data yet" hint="Add income and expenses to compare" />
            )}
            {/* Simple legend */}
            <div className="flex items-center justify-center gap-6 mt-2">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm" style={{ background: 'hsl(142 76% 36%)' }} /><span className="text-xs text-muted-foreground">Income</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm" style={{ background: 'hsl(351 76% 56%)' }} /><span className="text-xs text-muted-foreground">Expenses</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Spending Over Time (simplified - just daily spending) */}
        <Card className="border-border/50 overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Spending Over Time</CardTitle>
                <CardDescription className="text-xs">
                  {selectedCategory ? `${selectedCategory} only` : 'Your daily spending pattern'}
                </CardDescription>
              </div>
              <div className="h-8 w-8 rounded-lg bg-info/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-info" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {(() => {
              const { start, end } = getDateRange();
              const filtered = (selectedCategory ? expenses.filter(e => e.category === selectedCategory) : expenses)
                .filter(e => { const d = new Date(e.date); return d >= start && d <= end; });
              const daily: Record<string, number> = {};
              filtered.forEach(e => {
                const d = new Date(e.date);
                const key = `${d.getDate()}/${d.getMonth() + 1}`;
                daily[key] = (daily[key] || 0) + Number(e.amount);
              });
              const data = Object.entries(daily).slice(-12).map(([day, amount]) => ({ day, amount }));
              
              return data.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} width={50} />
                    <Tooltip content={<SimpleTooltip formatCurrency={formatCurrency} />} />
                    <Area type="monotone" dataKey="amount" name="Spent" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#spendGrad)"
                      dot={{ r: 3, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--card))', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState icon={TrendingUp} message="No spending data" hint="Start tracking expenses to see trends" />
              );
            })()}
          </CardContent>
        </Card>

        {/* Budget Progress (simplified) */}
        <Card className="border-border/50 overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Budget Progress</CardTitle>
                <CardDescription className="text-xs">How much of each budget you've used</CardDescription>
              </div>
              <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center">
                <Target className="h-4 w-4 text-warning" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {budgetProgress.length > 0 ? (
              <div className="space-y-4">
                {budgetProgress.slice(0, 5).map((item, i) => {
                  const isOver = item.percentage > 90;
                  const isWarning = item.percentage > 70 && item.percentage <= 90;
                  const barColor = isOver ? 'hsl(0 84% 60%)' : isWarning ? 'hsl(38 92% 50%)' : 'hsl(142 76% 36%)';
                  const statusText = isOver ? 'Over budget!' : isWarning ? 'Almost there' : 'On track';
                  const statusColor = isOver ? 'text-destructive' : isWarning ? 'text-warning' : 'text-success';

                  return (
                    <button key={item.category} onClick={() => handleCategoryClick({ name: item.category })}
                      className={`w-full text-left p-3 rounded-xl transition-all hover:bg-muted/50 ${selectedCategory === item.category ? 'bg-muted/70 ring-1 ring-primary/30' : ''}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{item.category}</span>
                        <span className={`text-xs font-medium ${statusColor}`}>{statusText}</span>
                      </div>
                      <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${item.percentage}%`, backgroundColor: barColor }} />
                      </div>
                      <div className="flex justify-between mt-1.5">
                        <span className="text-xs text-muted-foreground">{formatCurrency(item.spent)} spent</span>
                        <span className="text-xs text-muted-foreground">of {formatCurrency(item.budget)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <EmptyState icon={Target} message="No budgets set" hint="Go to Income & Budget to create one" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardCharts;
