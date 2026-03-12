import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, CalendarDays, CalendarRange, Calendar, CalendarCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { startOfDay, startOfWeek, startOfMonth, startOfYear, isAfter, subDays, subWeeks, subMonths, subYears, format } from 'date-fns';

interface SpendingInsightsProps {
  expenses: Array<{ amount: number; date: string; category: string }>;
  title?: string;
}

const SpendingInsights: React.FC<SpendingInsightsProps> = ({ expenses, title = "Spending Insights" }) => {
  const { formatCurrency } = useLanguage();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  const insights = useMemo(() => {
    const now = new Date();

    const getTotal = (start: Date) =>
      expenses
        .filter(e => isAfter(new Date(e.date), start))
        .reduce((sum, e) => sum + Number(e.amount), 0);

    const getCategoryBreakdown = (start: Date) => {
      const filtered = expenses.filter(e => isAfter(new Date(e.date), start));
      const totals: Record<string, number> = {};
      filtered.forEach(e => {
        totals[e.category] = (totals[e.category] || 0) + Number(e.amount);
      });
      return Object.entries(totals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);
    };

    const getTransactionCount = (start: Date) =>
      expenses.filter(e => isAfter(new Date(e.date), start)).length;

    switch (period) {
      case 'daily': {
        const todayStart = startOfDay(now);
        const yesterdayStart = startOfDay(subDays(now, 1));
        const current = getTotal(todayStart);
        const previous = expenses
          .filter(e => {
            const d = new Date(e.date);
            return isAfter(d, yesterdayStart) && !isAfter(d, todayStart);
          })
          .reduce((sum, e) => sum + Number(e.amount), 0);
        return {
          current,
          previous,
          label: 'Today',
          prevLabel: 'Yesterday',
          categories: getCategoryBreakdown(todayStart),
          count: getTransactionCount(todayStart),
        };
      }
      case 'weekly': {
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const prevWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
        const current = getTotal(weekStart);
        const previous = expenses
          .filter(e => {
            const d = new Date(e.date);
            return isAfter(d, prevWeekStart) && !isAfter(d, weekStart);
          })
          .reduce((sum, e) => sum + Number(e.amount), 0);
        return {
          current,
          previous,
          label: 'This Week',
          prevLabel: 'Last Week',
          categories: getCategoryBreakdown(weekStart),
          count: getTransactionCount(weekStart),
        };
      }
      case 'monthly': {
        const monthStart = startOfMonth(now);
        const prevMonthStart = startOfMonth(subMonths(now, 1));
        const current = getTotal(monthStart);
        const previous = expenses
          .filter(e => {
            const d = new Date(e.date);
            return isAfter(d, prevMonthStart) && !isAfter(d, monthStart);
          })
          .reduce((sum, e) => sum + Number(e.amount), 0);
        return {
          current,
          previous,
          label: 'This Month',
          prevLabel: 'Last Month',
          categories: getCategoryBreakdown(monthStart),
          count: getTransactionCount(monthStart),
        };
      }
      case 'yearly': {
        const yearStart = startOfYear(now);
        const prevYearStart = startOfYear(subYears(now, 1));
        const current = getTotal(yearStart);
        const previous = expenses
          .filter(e => {
            const d = new Date(e.date);
            return isAfter(d, prevYearStart) && !isAfter(d, yearStart);
          })
          .reduce((sum, e) => sum + Number(e.amount), 0);
        return {
          current,
          previous,
          label: 'This Year',
          prevLabel: 'Last Year',
          categories: getCategoryBreakdown(yearStart),
          count: getTransactionCount(yearStart),
        };
      }
    }
  }, [expenses, period]);

  const change = insights.previous > 0
    ? ((insights.current - insights.previous) / insights.previous) * 100
    : 0;

  const avgPerDay = useMemo(() => {
    const now = new Date();
    const daysMap = { daily: 1, weekly: 7, monthly: now.getDate(), yearly: Math.floor((now.getTime() - startOfYear(now).getTime()) / 86400000) + 1 };
    return daysMap[period] > 0 ? insights.current / daysMap[period] : 0;
  }, [insights.current, period]);

  const periodIcons = { daily: CalendarDays, weekly: CalendarRange, monthly: Calendar, yearly: CalendarCheck };
  const PeriodIcon = periodIcons[period];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <PeriodIcon className="w-4 h-4 text-primary" />
            {title}
          </CardTitle>
        </div>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as any)} className="mt-2">
          <TabsList className="grid w-full grid-cols-4 h-8">
            <TabsTrigger value="daily" className="text-xs">Daily</TabsTrigger>
            <TabsTrigger value="weekly" className="text-xs">Weekly</TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs">Monthly</TabsTrigger>
            <TabsTrigger value="yearly" className="text-xs">Yearly</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Spent */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{insights.label}</p>
            <p className="text-2xl font-bold">{formatCurrency(insights.current)}</p>
          </div>
          <div className="text-right">
            {change !== 0 ? (
              <div className={`flex items-center gap-1 text-sm ${change > 0 ? 'text-destructive' : 'text-success'}`}>
                {change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(change).toFixed(1)}%
              </div>
            ) : (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Minus className="w-3 h-3" /> No change
              </div>
            )}
            <p className="text-xs text-muted-foreground">vs {insights.prevLabel}</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Transactions</p>
            <p className="text-lg font-semibold">{insights.count}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Daily Avg</p>
            <p className="text-lg font-semibold">{formatCurrency(avgPerDay)}</p>
          </div>
        </div>

        {/* Previous Period */}
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">{insights.prevLabel}</p>
          <p className="text-base font-semibold">{formatCurrency(insights.previous)}</p>
        </div>

        {/* Category Breakdown */}
        {insights.categories.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Top Categories</p>
            {insights.categories.map(([cat, amount]) => (
              <div key={cat} className="flex items-center justify-between">
                <span className="text-sm">{cat}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-secondary rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full"
                      style={{ width: `${insights.current > 0 ? (Number(amount) / insights.current) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium w-16 text-right">{formatCurrency(Number(amount))}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SpendingInsights;
