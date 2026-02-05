import React, { useState, useEffect, useCallback } from 'react';
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Sector,
} from 'recharts';
import { Progress } from '@/components/ui/progress';
import { PieChart as PieChartIcon, BarChart3, TrendingUp, Target, X, Calendar } from 'lucide-react';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(142 76% 36%)',
  'hsl(38 92% 50%)',
  'hsl(280 65% 60%)',
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

// Custom active shape for pie chart
const renderActiveShape = (props: any) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value, percent
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 4}
        outerRadius={innerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <text x={cx} y={cy - 10} textAnchor="middle" fill="hsl(var(--foreground))" className="text-sm font-medium">
        {payload.name}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="hsl(var(--muted-foreground))" className="text-xs">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    </g>
  );
};

// Enhanced tooltip component
const CustomTooltip = ({ active, payload, label, formatCurrency }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3 animate-scale-in">
        <p className="font-medium text-sm mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-semibold">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

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
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setAnimationComplete(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const fetchData = async () => {
    if (!user) return;

    try {
      const [expenseRes, incomeRes, budgetRes] = await Promise.all([
        supabase
          .from('personal_expenses')
          .select('category, amount, date')
          .eq('user_id', user.id)
          .order('date', { ascending: true }),
        supabase
          .from('income_sources')
          .select('source_name, amount, frequency')
          .eq('user_id', user.id)
          .eq('is_active', true),
        supabase
          .from('budgets')
          .select('category, amount')
          .eq('user_id', user.id),
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

  // Get date range based on selected time range
  const getDateRange = useCallback(() => {
    const now = new Date();
    const end = new Date(now);
    let start = new Date(now);

    switch (timeRange) {
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
    }

    return { start, end };
  }, [timeRange]);

  // Filter expenses by time range and optional category
  const getFilteredExpenses = useCallback(() => {
    const { start, end } = getDateRange();
    
    return expenses.filter(exp => {
      const expDate = new Date(exp.date);
      const inRange = expDate >= start && expDate <= end;
      const matchesCategory = selectedCategory ? exp.category === selectedCategory : true;
      return inRange && matchesCategory;
    });
  }, [expenses, getDateRange, selectedCategory]);

  // Calculate category breakdown for pie chart
  const getCategoryBreakdown = useCallback(() => {
    const filteredExpenses = getFilteredExpenses();

    const categoryTotals: Record<string, number> = {};
    filteredExpenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + Number(exp.amount);
    });

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [getFilteredExpenses]);

  // Calculate income vs expenses by period
  const getIncomeVsExpenses = useCallback(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const periods: Record<string, { period: string; income: number; expenses: number }> = {};
    
    const { start, end } = getDateRange();
    const filteredExpenses = selectedCategory 
      ? expenses.filter(exp => exp.category === selectedCategory)
      : expenses;

    // Generate period keys based on time range
    if (timeRange === 'week') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const key = date.toISOString().split('T')[0];
        periods[key] = { period: weekDays[date.getDay()], income: 0, expenses: 0 };
      }
    } else if (timeRange === 'month') {
      for (let i = 29; i >= 0; i -= 5) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const key = date.toISOString().split('T')[0];
        periods[key] = { period: `${date.getDate()}/${date.getMonth() + 1}`, income: 0, expenses: 0 };
      }
    } else {
      const monthCount = timeRange === 'quarter' ? 3 : 12;
      for (let i = monthCount - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        periods[key] = { period: monthNames[date.getMonth()], income: 0, expenses: 0 };
      }
    }

    // Calculate expenses per period
    filteredExpenses.forEach(exp => {
      const expDate = new Date(exp.date);
      if (expDate >= start && expDate <= end) {
        let key: string;
        if (timeRange === 'week' || timeRange === 'month') {
          key = expDate.toISOString().split('T')[0];
        } else {
          key = `${expDate.getFullYear()}-${expDate.getMonth()}`;
        }
        if (periods[key]) {
          periods[key].expenses += Number(exp.amount);
        }
      }
    });

    // Calculate monthly income
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

    // Distribute income across periods
    const periodCount = Object.keys(periods).length;
    Object.keys(periods).forEach(key => {
      if (timeRange === 'week') {
        periods[key].income = monthlyIncome / 30;
      } else if (timeRange === 'month') {
        periods[key].income = monthlyIncome / 6;
      } else {
        periods[key].income = monthlyIncome;
      }
    });

    return Object.values(periods);
  }, [expenses, income, getDateRange, timeRange, selectedCategory]);

  // Calculate spending trends
  const getSpendingTrends = useCallback(() => {
    const { start, end } = getDateRange();
    const filteredExpenses = selectedCategory 
      ? expenses.filter(exp => exp.category === selectedCategory)
      : expenses;
    
    const dailyTotals: Record<string, number> = {};
    
    filteredExpenses.forEach(exp => {
      const expDate = new Date(exp.date);
      if (expDate >= start && expDate <= end) {
        const key = expDate.toISOString().split('T')[0];
        dailyTotals[key] = (dailyTotals[key] || 0) + Number(exp.amount);
      }
    });

    // Create cumulative spending data
    let cumulative = 0;
    const result: { day: string; daily: number; cumulative: number }[] = [];
    
    const sortedDates = Object.keys(dailyTotals).sort();
    sortedDates.forEach((date, index) => {
      cumulative += dailyTotals[date] || 0;
      const displayDate = new Date(date);
      result.push({
        day: `${displayDate.getDate()}/${displayDate.getMonth() + 1}`,
        daily: dailyTotals[date] || 0,
        cumulative,
      });
    });

    return result.slice(-15); // Last 15 data points
  }, [expenses, getDateRange, selectedCategory]);

  // Calculate budget progress
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
      percentage: Math.min(
        Math.round(((categorySpending[budget.category] || 0) / Number(budget.amount)) * 100),
        100
      ),
    }));
  }, [budgets, getFilteredExpenses]);

  const handlePieClick = (data: any, index: number) => {
    if (selectedCategory === data.name) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(data.name);
    }
  };

  const clearFilter = () => {
    setSelectedCategory(null);
  };

  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: 'week', label: '7D' },
    { value: 'month', label: '1M' },
    { value: 'quarter', label: '3M' },
    { value: 'year', label: '1Y' },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-16 bg-muted/50" />
            <CardContent className="h-64 bg-muted/30" />
          </Card>
        ))}
      </div>
    );
  }

  const categoryBreakdown = getCategoryBreakdown();
  const incomeVsExpenses = getIncomeVsExpenses();
  const spendingTrends = getSpendingTrends();
  const budgetProgress = getBudgetProgress();

  const totalSpending = categoryBreakdown.reduce((sum, cat) => sum + cat.value, 0);

  return (
    <div className={`space-y-4 transition-all duration-500 ${animationComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Time Range Selector & Filter Status */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Time Range:</span>
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {timeRangeOptions.map(option => (
              <Button
                key={option.value}
                variant={timeRange === option.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(option.value)}
                className={`h-7 px-3 text-xs transition-all duration-200 ${
                  timeRange === option.value ? 'shadow-sm' : ''
                }`}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
        
        {selectedCategory && (
          <Badge variant="secondary" className="flex items-center gap-2 animate-scale-in">
            Filtered: {selectedCategory}
            <button onClick={clearFilter} className="hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expense Breakdown (Interactive Pie Chart) */}
        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base font-medium">Expense Breakdown</CardTitle>
              <CardDescription>Click a segment to filter all charts</CardDescription>
            </div>
            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {categoryBreakdown.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      activeIndex={activePieIndex}
                      activeShape={renderActiveShape}
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      onMouseEnter={(_, index) => setActivePieIndex(index)}
                      onMouseLeave={() => setActivePieIndex(undefined)}
                      onClick={handlePieClick}
                      animationBegin={0}
                      animationDuration={800}
                      animationEasing="ease-out"
                      style={{ cursor: 'pointer' }}
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                          stroke={selectedCategory === entry.name ? 'hsl(var(--foreground))' : 'transparent'}
                          strokeWidth={selectedCategory === entry.name ? 2 : 0}
                          style={{ 
                            opacity: selectedCategory && selectedCategory !== entry.name ? 0.4 : 1,
                            transition: 'opacity 0.3s ease'
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={<CustomTooltip formatCurrency={formatCurrency} />}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {categoryBreakdown.slice(0, 5).map((cat, index) => (
                    <button
                      key={cat.name}
                      onClick={() => handlePieClick(cat, index)}
                      className={`flex items-center justify-between text-sm w-full p-1.5 rounded-md transition-all duration-200 hover:bg-muted ${
                        selectedCategory === cat.name ? 'bg-muted ring-1 ring-primary' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full transition-transform duration-200 hover:scale-125"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="truncate max-w-[100px]">{cat.name}</span>
                      </div>
                      <span className="font-medium">{Math.round((cat.value / totalSpending) * 100)}%</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No expense data for this period
              </div>
            )}
          </CardContent>
        </Card>

        {/* Income vs Expenses (Animated Bar Chart) */}
        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base font-medium">Income vs Expenses</CardTitle>
              <CardDescription>
                {selectedCategory ? `Filtered by: ${selectedCategory}` : 'Compare income and spending'}
              </CardDescription>
            </div>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {incomeVsExpenses.some(d => d.income > 0 || d.expenses > 0) ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={incomeVsExpenses}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="period" 
                    className="text-xs" 
                    tick={{ fill: 'hsl(var(--muted-foreground))' }} 
                  />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
                  <Legend />
                  <Bar 
                    dataKey="income" 
                    name="Income" 
                    fill="hsl(142 76% 36%)" 
                    radius={[4, 4, 0, 0]}
                    animationBegin={0}
                    animationDuration={800}
                    animationEasing="ease-out"
                  />
                  <Bar 
                    dataKey="expenses" 
                    name="Expenses" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                    animationBegin={200}
                    animationDuration={800}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Add income sources and expenses to see comparison
              </div>
            )}
          </CardContent>
        </Card>

        {/* Spending Trends (Animated Line Chart) */}
        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base font-medium">Spending Trends</CardTitle>
              <CardDescription>
                {selectedCategory ? `${selectedCategory} spending` : 'Daily & cumulative spending'}
              </CardDescription>
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {spendingTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={spendingTrends}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="day" 
                    className="text-xs" 
                    tick={{ fill: 'hsl(var(--muted-foreground))' }} 
                  />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cumulative"
                    name="Cumulative"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 3, fill: 'hsl(var(--primary))' }}
                    activeDot={{ r: 6, stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                    animationBegin={0}
                    animationDuration={1000}
                    animationEasing="ease-out"
                  />
                  <Line
                    type="monotone"
                    dataKey="daily"
                    name="Daily"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    dot={{ r: 3, fill: 'hsl(var(--chart-3))' }}
                    activeDot={{ r: 6, stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                    animationBegin={300}
                    animationDuration={1000}
                    animationEasing="ease-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No spending data for this period
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget Progress (Interactive) */}
        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base font-medium">Budget Progress</CardTitle>
              <CardDescription>Click a budget to filter by category</CardDescription>
            </div>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {budgetProgress.length > 0 ? (
              <div className="space-y-4">
                {budgetProgress.slice(0, 4).map((item, index) => {
                  const isOverBudget = item.percentage > 90;
                  const isWarning = item.percentage > 70 && item.percentage <= 90;
                  const progressColor = isOverBudget
                    ? 'bg-destructive'
                    : isWarning
                    ? 'bg-yellow-500'
                    : 'bg-primary';

                  return (
                    <button
                      key={item.category}
                      onClick={() => handlePieClick({ name: item.category }, index)}
                      className={`w-full space-y-2 p-2 rounded-lg transition-all duration-200 hover:bg-muted text-left ${
                        selectedCategory === item.category ? 'bg-muted ring-1 ring-primary' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium truncate max-w-[150px]">{item.category}</span>
                        <span className="text-muted-foreground">
                          {formatCurrency(item.spent)} / {formatCurrency(item.budget)}
                        </span>
                      </div>
                      <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out ${progressColor}`}
                          style={{ 
                            width: animationComplete ? `${item.percentage}%` : '0%',
                          }}
                        />
                      </div>
                      {isOverBudget && (
                        <p className="text-xs text-destructive animate-pulse">
                          ⚠️ Over budget by {formatCurrency(item.spent - item.budget)}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground flex-col gap-2">
                <Target className="h-8 w-8 opacity-50" />
                <span>Set up budgets in Personal → Income & Budget</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardCharts;
