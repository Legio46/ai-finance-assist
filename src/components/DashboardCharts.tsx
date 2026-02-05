import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
} from 'recharts';
import { Progress } from '@/components/ui/progress';
import { PieChart as PieChartIcon, BarChart3, TrendingUp, Target } from 'lucide-react';

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

const DashboardCharts = () => {
  const { user } = useAuth();
  const { formatCurrency } = useLanguage();
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [income, setIncome] = useState<IncomeData[]>([]);
  const [budgets, setBudgets] = useState<BudgetData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

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

  // Calculate category breakdown for pie chart
  const getCategoryBreakdown = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    });

    const categoryTotals: Record<string, number> = {};
    monthlyExpenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + Number(exp.amount);
    });

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  };

  // Calculate income vs expenses by month
  const getIncomeVsExpenses = () => {
    const months: Record<string, { month: string; income: number; expenses: number }> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Get last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      months[key] = {
        month: monthNames[date.getMonth()],
        income: 0,
        expenses: 0,
      };
    }

    // Calculate monthly expenses
    expenses.forEach(exp => {
      const expDate = new Date(exp.date);
      const key = `${expDate.getFullYear()}-${expDate.getMonth()}`;
      if (months[key]) {
        months[key].expenses += Number(exp.amount);
      }
    });

    // Calculate monthly income (simplified - assumes monthly income repeats)
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

    Object.keys(months).forEach(key => {
      months[key].income = monthlyIncome;
    });

    return Object.values(months);
  };

  // Calculate spending trends (daily for current month)
  const getSpendingTrends = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const dailyTotals: Record<number, number> = {};
    
    expenses.forEach(exp => {
      const expDate = new Date(exp.date);
      if (expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear) {
        const day = expDate.getDate();
        dailyTotals[day] = (dailyTotals[day] || 0) + Number(exp.amount);
      }
    });

    // Create cumulative spending data
    let cumulative = 0;
    const result = [];
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = new Date().getDate();

    for (let day = 1; day <= Math.min(today, daysInMonth); day++) {
      cumulative += dailyTotals[day] || 0;
      result.push({
        day: `${day}`,
        daily: dailyTotals[day] || 0,
        cumulative,
      });
    }

    return result;
  };

  // Calculate budget progress
  const getBudgetProgress = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    });

    const categorySpending: Record<string, number> = {};
    monthlyExpenses.forEach(exp => {
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
  };

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Expense Breakdown (Pie Chart) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-base font-medium">Expense Breakdown</CardTitle>
            <CardDescription>Spending by category this month</CardDescription>
          </div>
          <PieChartIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {categoryBreakdown.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {categoryBreakdown.slice(0, 5).map((cat, index) => (
                  <div key={cat.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="truncate max-w-[100px]">{cat.name}</span>
                    </div>
                    <span className="font-medium">{Math.round((cat.value / totalSpending) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              No expense data for this month
            </div>
          )}
        </CardContent>
      </Card>

      {/* Income vs Expenses (Bar Chart) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-base font-medium">Income vs Expenses</CardTitle>
            <CardDescription>Monthly comparison (last 6 months)</CardDescription>
          </div>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {incomeVsExpenses.some(d => d.income > 0 || d.expenses > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={incomeVsExpenses}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="income" name="Income" fill="hsl(142 76% 36%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              Add income sources and expenses to see comparison
            </div>
          )}
        </CardContent>
      </Card>

      {/* Spending Trends (Line Chart) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-base font-medium">Spending Trends</CardTitle>
            <CardDescription>Daily & cumulative spending this month</CardDescription>
          </div>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {spendingTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={spendingTrends}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cumulative"
                  name="Cumulative"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="daily"
                  name="Daily"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              No spending data for this month
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget Progress */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-base font-medium">Budget Progress</CardTitle>
            <CardDescription>Track spending against your budgets</CardDescription>
          </div>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {budgetProgress.length > 0 ? (
            <div className="space-y-4">
              {budgetProgress.slice(0, 4).map((item, index) => (
                <div key={item.category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium truncate max-w-[150px]">{item.category}</span>
                    <span className="text-muted-foreground">
                      {formatCurrency(item.spent)} / {formatCurrency(item.budget)}
                    </span>
                  </div>
                  <Progress
                    value={item.percentage}
                    className="h-2"
                    style={{
                      ['--progress-color' as string]: item.percentage > 90
                        ? 'hsl(0 84% 60%)'
                        : item.percentage > 70
                        ? 'hsl(38 92% 50%)'
                        : COLORS[index % COLORS.length],
                    }}
                  />
                </div>
              ))}
              {budgetProgress.length === 0 && (
                <p className="text-sm text-muted-foreground">No budgets set up yet</p>
              )}
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
  );
};

export default DashboardCharts;
