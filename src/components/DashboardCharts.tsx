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
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Sector,
} from 'recharts';
import { 
  PieChart as PieChartIcon, BarChart3, TrendingUp, TrendingDown, Target, X, Calendar, 
  DollarSign, ArrowUpRight, ArrowDownRight, Wallet, Sparkles 
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

// Custom active shape for pie chart with glow effect
const renderActiveShape = (props: any) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))' }}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 6}
        outerRadius={innerRadius - 2}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.4}
      />
      <text x={cx} y={cy - 12} textAnchor="middle" fill="hsl(var(--foreground))" fontSize={14} fontWeight={600}>
        {payload.name}
      </text>
      <text x={cx} y={cy + 8} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={22} fontWeight={700}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    </g>
  );
};

// Premium tooltip
const CustomTooltip = ({ active, payload, label, formatCurrency }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-xl p-4 min-w-[160px]">
        {label && <p className="font-semibold text-sm mb-2 text-foreground">{label}</p>}
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full ring-2 ring-offset-1 ring-offset-card" style={{ backgroundColor: entry.color, boxShadow: `0 0 8px ${entry.color}40` }} />
                <span className="text-muted-foreground">{entry.name}</span>
              </div>
              <span className="font-bold tabular-nums">{formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Stat card component
const StatCard = ({ icon: Icon, label, value, trend, trendValue, color }: { 
  icon: any; label: string; value: string; trend?: 'up' | 'down' | 'neutral'; trendValue?: string; color: string 
}) => (
  <div className="relative overflow-hidden rounded-xl border bg-card p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group">
    <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-[0.06] -translate-y-1/2 translate-x-1/2 transition-transform group-hover:scale-150" style={{ backgroundColor: color }} />
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

const DashboardCharts = () => {
  const { user } = useAuth();
  const { formatCurrency } = useLanguage();
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [income, setIncome] = useState<IncomeData[]>([]);
  const [budgets, setBudgets] = useState<BudgetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [activePieIndex, setActivePieIndex] = useState<number | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => setAnimationComplete(true), 100);
    return () => clearTimeout(timer);
  }, []);

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
    const end = new Date(now);
    const start = new Date(now);
    switch (timeRange) {
      case 'week': start.setDate(now.getDate() - 7); break;
      case 'month': start.setMonth(now.getMonth() - 1); break;
      case 'quarter': start.setMonth(now.getMonth() - 3); break;
      case 'year': start.setFullYear(now.getFullYear() - 1); break;
    }
    return { start, end };
  }, [timeRange]);

  const getFilteredExpenses = useCallback(() => {
    const { start, end } = getDateRange();
    return expenses.filter(exp => {
      const expDate = new Date(exp.date);
      const inRange = expDate >= start && expDate <= end;
      const matchesCategory = selectedCategory ? exp.category === selectedCategory : true;
      return inRange && matchesCategory;
    });
  }, [expenses, getDateRange, selectedCategory]);

  // Summary stats
  const stats = useMemo(() => {
    const filteredExpenses = getFilteredExpenses();
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const monthlyIncome = income.reduce((sum, inc) => {
      const amount = Number(inc.amount);
      switch (inc.frequency) {
        case 'weekly': return sum + amount * 4.33;
        case 'bi-weekly': return sum + amount * 2.17;
        case 'monthly': return sum + amount;
        case 'yearly': return sum + amount / 12;
        default: return sum + amount;
      }
    }, 0);
    const netCashflow = monthlyIncome - totalExpenses;
    const savingsRate = monthlyIncome > 0 ? ((netCashflow / monthlyIncome) * 100) : 0;
    const budgetUtilization = budgets.length > 0 
      ? budgets.reduce((sum, b) => {
          const spent = filteredExpenses.filter(e => e.category === b.category).reduce((s, e) => s + Number(e.amount), 0);
          return sum + Math.min(spent / Number(b.amount), 1);
        }, 0) / budgets.length * 100
      : 0;

    return { totalExpenses, monthlyIncome, netCashflow, savingsRate, budgetUtilization };
  }, [getFilteredExpenses, income, budgets]);

  const getCategoryBreakdown = useCallback(() => {
    const filteredExpenses = getFilteredExpenses();
    const categoryTotals: Record<string, number> = {};
    filteredExpenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + Number(exp.amount);
    });
    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [getFilteredExpenses]);

  const getIncomeVsExpenses = useCallback(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const periods: Record<string, { period: string; income: number; expenses: number }> = {};
    const { start, end } = getDateRange();
    const filteredExpenses = selectedCategory ? expenses.filter(exp => exp.category === selectedCategory) : expenses;

    if (timeRange === 'week') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(); date.setDate(date.getDate() - i);
        const key = date.toISOString().split('T')[0];
        periods[key] = { period: weekDays[date.getDay()], income: 0, expenses: 0 };
      }
    } else if (timeRange === 'month') {
      for (let i = 29; i >= 0; i -= 5) {
        const date = new Date(); date.setDate(date.getDate() - i);
        const key = date.toISOString().split('T')[0];
        periods[key] = { period: `${date.getDate()}/${date.getMonth() + 1}`, income: 0, expenses: 0 };
      }
    } else {
      const monthCount = timeRange === 'quarter' ? 3 : 12;
      for (let i = monthCount - 1; i >= 0; i--) {
        const date = new Date(); date.setMonth(date.getMonth() - i);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        periods[key] = { period: monthNames[date.getMonth()], income: 0, expenses: 0 };
      }
    }

    filteredExpenses.forEach(exp => {
      const expDate = new Date(exp.date);
      if (expDate >= start && expDate <= end) {
        const key = (timeRange === 'week' || timeRange === 'month') 
          ? expDate.toISOString().split('T')[0]
          : `${expDate.getFullYear()}-${expDate.getMonth()}`;
        if (periods[key]) periods[key].expenses += Number(exp.amount);
      }
    });

    const monthlyIncome = income.reduce((sum, inc) => {
      const amount = Number(inc.amount);
      switch (inc.frequency) {
        case 'weekly': return sum + amount * 4.33;
        case 'bi-weekly': return sum + amount * 2.17;
        case 'monthly': return sum + amount;
        case 'yearly': return sum + amount / 12;
        default: return sum + amount;
      }
    }, 0);

    Object.keys(periods).forEach(key => {
      if (timeRange === 'week') periods[key].income = monthlyIncome / 30;
      else if (timeRange === 'month') periods[key].income = monthlyIncome / 6;
      else periods[key].income = monthlyIncome;
    });

    return Object.values(periods);
  }, [expenses, income, getDateRange, timeRange, selectedCategory]);

  const getSpendingTrends = useCallback(() => {
    const { start, end } = getDateRange();
    const filteredExpenses = selectedCategory ? expenses.filter(exp => exp.category === selectedCategory) : expenses;
    const dailyTotals: Record<string, number> = {};
    
    filteredExpenses.forEach(exp => {
      const expDate = new Date(exp.date);
      if (expDate >= start && expDate <= end) {
        const key = expDate.toISOString().split('T')[0];
        dailyTotals[key] = (dailyTotals[key] || 0) + Number(exp.amount);
      }
    });

    let cumulative = 0;
    const result: { day: string; daily: number; cumulative: number }[] = [];
    const sortedDates = Object.keys(dailyTotals).sort();
    sortedDates.forEach(date => {
      cumulative += dailyTotals[date] || 0;
      const displayDate = new Date(date);
      result.push({
        day: `${displayDate.getDate()}/${displayDate.getMonth() + 1}`,
        daily: dailyTotals[date] || 0,
        cumulative,
      });
    });
    return result.slice(-15);
  }, [expenses, getDateRange, selectedCategory]);

  const getBudgetProgress = useCallback(() => {
    const filteredExpenses = getFilteredExpenses();
    const categorySpending: Record<string, number> = {};
    filteredExpenses.forEach(exp => {
      categorySpending[exp.category] = (categorySpending[exp.category] || 0) + Number(exp.amount);
    });
    return budgets.map(budget => ({
      category: budget.category,
      budget: Number(budget.amount),
      spent: categorySpending[budget.category] || 0,
      percentage: Math.min(Math.round(((categorySpending[budget.category] || 0) / Number(budget.amount)) * 100), 100),
    }));
  }, [budgets, getFilteredExpenses]);

  const handlePieClick = (data: any) => {
    setSelectedCategory(prev => prev === data.name ? null : data.name);
  };

  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: 'week', label: '7D' },
    { value: 'month', label: '1M' },
    { value: 'quarter', label: '3M' },
    { value: 'year', label: '1Y' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted/50 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-16 bg-muted/30 rounded-t-xl" />
              <CardContent className="h-64 bg-muted/10" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const categoryBreakdown = getCategoryBreakdown();
  const incomeVsExpenses = getIncomeVsExpenses();
  const spendingTrends = getSpendingTrends();
  const budgetProgress = getBudgetProgress();
  const totalSpending = categoryBreakdown.reduce((sum, cat) => sum + cat.value, 0);

  return (
    <div className={`space-y-6 transition-all duration-700 ${animationComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
      
      {/* Summary Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Wallet}
          label="Total Income"
          value={formatCurrency(stats.monthlyIncome)}
          trend="up"
          trendValue="Monthly"
          color="hsl(142 76% 36%)"
        />
        <StatCard
          icon={DollarSign}
          label="Total Spent"
          value={formatCurrency(stats.totalExpenses)}
          trend={stats.totalExpenses > stats.monthlyIncome ? 'down' : 'neutral'}
          trendValue={timeRange.toUpperCase()}
          color="hsl(351 76% 56%)"
        />
        <StatCard
          icon={stats.netCashflow >= 0 ? TrendingUp : TrendingDown}
          label="Net Cashflow"
          value={formatCurrency(Math.abs(stats.netCashflow))}
          trend={stats.netCashflow >= 0 ? 'up' : 'down'}
          trendValue={stats.netCashflow >= 0 ? 'Surplus' : 'Deficit'}
          color={stats.netCashflow >= 0 ? 'hsl(142 76% 36%)' : 'hsl(0 84% 60%)'}
        />
        <StatCard
          icon={Sparkles}
          label="Savings Rate"
          value={`${Math.max(0, stats.savingsRate).toFixed(0)}%`}
          trend={stats.savingsRate >= 20 ? 'up' : stats.savingsRate >= 0 ? 'neutral' : 'down'}
          trendValue={stats.savingsRate >= 20 ? 'Great' : stats.savingsRate >= 0 ? 'OK' : 'Low'}
          color="hsl(199 89% 48%)"
        />
      </div>

      {/* Time Range & Filter */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-1 bg-muted/60 rounded-xl p-1 backdrop-blur-sm">
            {timeRangeOptions.map(option => (
              <Button
                key={option.value}
                variant={timeRange === option.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(option.value)}
                className={`h-8 px-4 text-xs font-semibold rounded-lg transition-all duration-300 ${
                  timeRange === option.value ? 'shadow-md' : 'hover:bg-muted'
                }`}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
        
        {selectedCategory && (
          <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary border-primary/20">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {selectedCategory}
            <button onClick={() => setSelectedCategory(null)} className="hover:bg-primary/20 rounded-full p-0.5 transition-colors ml-1">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expense Breakdown - Donut Chart */}
        <Card className="transition-all duration-300 hover:shadow-xl border-border/50 overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Expense Breakdown</CardTitle>
              <CardDescription className="text-xs">Click a segment to filter all charts</CardDescription>
            </div>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <PieChartIcon className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {categoryBreakdown.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={220}>
                  <PieChart>
                    <Pie
                      activeIndex={activePieIndex}
                      activeShape={renderActiveShape}
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      onMouseEnter={(_, index) => setActivePieIndex(index)}
                      onMouseLeave={() => setActivePieIndex(undefined)}
                      onClick={handlePieClick}
                      animationBegin={0}
                      animationDuration={1000}
                      animationEasing="ease-out"
                      style={{ cursor: 'pointer' }}
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke="hsl(var(--card))"
                          strokeWidth={2}
                          style={{
                            opacity: selectedCategory && selectedCategory !== entry.name ? 0.3 : 1,
                            transition: 'opacity 0.4s ease, filter 0.4s ease',
                            filter: selectedCategory === entry.name ? `drop-shadow(0 0 8px ${COLORS[index % COLORS.length]}60)` : 'none',
                          }}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5">
                  {categoryBreakdown.slice(0, 6).map((cat, index) => {
                    const pct = totalSpending > 0 ? Math.round((cat.value / totalSpending) * 100) : 0;
                    return (
                      <button
                        key={cat.name}
                        onClick={() => handlePieClick(cat)}
                        className={`flex items-center justify-between text-sm w-full p-2 rounded-lg transition-all duration-300 hover:bg-muted/80 ${
                          selectedCategory === cat.name ? 'bg-muted ring-1 ring-primary/50 shadow-sm' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-3 h-3 rounded-full ring-2 ring-offset-1 ring-offset-card transition-transform duration-200 hover:scale-150"
                            style={{ 
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                          <span className="truncate max-w-[90px] text-xs font-medium">{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-700"
                              style={{ 
                                width: animationComplete ? `${pct}%` : '0%',
                                backgroundColor: COLORS[index % COLORS.length] 
                              }}
                            />
                          </div>
                          <span className="font-bold text-xs tabular-nums w-8 text-right">{pct}%</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="h-[220px] flex flex-col items-center justify-center text-muted-foreground gap-3">
                <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center">
                  <PieChartIcon className="h-7 w-7 opacity-40" />
                </div>
                <p className="text-sm">No expense data for this period</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Income vs Expenses - Bar Chart with gradient fills */}
        <Card className="transition-all duration-300 hover:shadow-xl border-border/50 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Income vs Expenses</CardTitle>
              <CardDescription className="text-xs">
                {selectedCategory ? `Filtered: ${selectedCategory}` : 'Revenue and spending comparison'}
              </CardDescription>
            </div>
            <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            {incomeVsExpenses.some(d => d.income > 0 || d.expenses > 0) ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={incomeVsExpenses} barGap={4}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(142 76% 36%)" stopOpacity={1} />
                      <stop offset="100%" stopColor="hsl(142 76% 36%)" stopOpacity={0.6} />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(351 76% 56%)" stopOpacity={1} />
                      <stop offset="100%" stopColor="hsl(351 76% 56%)" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis dataKey="period" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Bar dataKey="income" name="Income" fill="url(#incomeGradient)" radius={[6, 6, 0, 0]} animationBegin={0} animationDuration={1000} animationEasing="ease-out" />
                  <Bar dataKey="expenses" name="Expenses" fill="url(#expenseGradient)" radius={[6, 6, 0, 0]} animationBegin={200} animationDuration={1000} animationEasing="ease-out" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex flex-col items-center justify-center text-muted-foreground gap-3">
                <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center">
                  <BarChart3 className="h-7 w-7 opacity-40" />
                </div>
                <p className="text-sm">Add income & expenses to see comparison</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Spending Trends - Area Chart */}
        <Card className="transition-all duration-300 hover:shadow-xl border-border/50 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Spending Trends</CardTitle>
              <CardDescription className="text-xs">
                {selectedCategory ? `${selectedCategory} spending` : 'Daily & cumulative spending'}
              </CardDescription>
            </div>
            <div className="h-8 w-8 rounded-lg bg-info/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-info" />
            </div>
          </CardHeader>
          <CardContent>
            {spendingTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={spendingTrends}>
                  <defs>
                    <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="dailyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(199 89% 48%)" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="hsl(199 89% 48%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    name="Cumulative"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    fill="url(#cumulativeGradient)"
                    dot={{ r: 3, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--card))', strokeWidth: 2 }}
                    activeDot={{ r: 7, stroke: 'hsl(var(--primary))', strokeWidth: 2, fill: 'hsl(var(--card))' }}
                    animationBegin={0}
                    animationDuration={1200}
                    animationEasing="ease-out"
                  />
                  <Area
                    type="monotone"
                    dataKey="daily"
                    name="Daily"
                    stroke="hsl(199 89% 48%)"
                    strokeWidth={2}
                    fill="url(#dailyGradient)"
                    dot={{ r: 3, fill: 'hsl(199 89% 48%)', stroke: 'hsl(var(--card))', strokeWidth: 2 }}
                    activeDot={{ r: 7, stroke: 'hsl(199 89% 48%)', strokeWidth: 2, fill: 'hsl(var(--card))' }}
                    animationBegin={400}
                    animationDuration={1200}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex flex-col items-center justify-center text-muted-foreground gap-3">
                <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center">
                  <TrendingUp className="h-7 w-7 opacity-40" />
                </div>
                <p className="text-sm">No spending data for this period</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget Progress - Premium bars */}
        <Card className="transition-all duration-300 hover:shadow-xl border-border/50 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Budget Progress</CardTitle>
              <CardDescription className="text-xs">Click a budget to filter by category</CardDescription>
            </div>
            <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center">
              <Target className="h-4 w-4 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            {budgetProgress.length > 0 ? (
              <div className="space-y-3">
                {budgetProgress.slice(0, 5).map((item, index) => {
                  const isOverBudget = item.percentage > 90;
                  const isWarning = item.percentage > 70 && item.percentage <= 90;
                  const barColor = isOverBudget
                    ? 'hsl(0 84% 60%)'
                    : isWarning
                    ? 'hsl(38 92% 50%)'
                    : COLORS[index % COLORS.length];

                  return (
                    <button
                      key={item.category}
                      onClick={() => handlePieClick({ name: item.category })}
                      className={`w-full space-y-2 p-3 rounded-xl transition-all duration-300 hover:bg-muted/60 text-left ${
                        selectedCategory === item.category ? 'bg-muted/80 ring-1 ring-primary/40 shadow-sm' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: barColor }} />
                          <span className="font-semibold truncate max-w-[120px] text-xs">{item.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{formatCurrency(item.spent)}</span>
                          <span className="text-xs text-muted-foreground">/</span>
                          <span className="text-xs font-medium">{formatCurrency(item.budget)}</span>
                        </div>
                      </div>
                      <div className="relative h-2.5 w-full bg-muted/80 rounded-full overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: animationComplete ? `${item.percentage}%` : '0%',
                            backgroundColor: barColor,
                            boxShadow: item.percentage > 50 ? `0 0 12px ${barColor}40` : 'none',
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold tabular-nums" style={{ color: barColor }}>
                          {item.percentage}%
                        </span>
                        {isOverBudget && (
                          <span className="text-[10px] text-destructive font-semibold flex items-center gap-1">
                            <ArrowUpRight className="h-3 w-3" />
                            Over by {formatCurrency(item.spent - item.budget)}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="h-[220px] flex flex-col items-center justify-center text-muted-foreground gap-3">
                <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center">
                  <Target className="h-7 w-7 opacity-40" />
                </div>
                <p className="text-sm">Set up budgets in Personal → Income & Budget</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardCharts;
