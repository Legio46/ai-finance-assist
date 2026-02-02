import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Target, 
  Calculator, 
  PiggyBank,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import ExportDataButton from './ExportDataButton';

interface FinancialData {
  totalIncome: number;
  totalExpenses: number;
  totalRecurring: number;
  totalInvestments: number;
  investmentGains: number;
  goals: { name: string; target: number; current: number; date: string | null }[];
}

interface Projection {
  month: string;
  savings: number;
  investments: number;
  netWorth: number;
}

const FinancialPlanner: React.FC = () => {
  const { user } = useAuth();
  const { formatCurrency } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  
  // Scenario planning inputs
  const [savingsRate, setSavingsRate] = useState(20);
  const [expectedReturn, setExpectedReturn] = useState(7);
  const [monthsToProject, setMonthsToProject] = useState(12);
  const [extraSavings, setExtraSavings] = useState(0);

  useEffect(() => {
    if (user) {
      fetchFinancialData();
    }
  }, [user]);

  const fetchFinancialData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const [
        { data: income },
        { data: expenses },
        { data: recurring },
        { data: investments },
        { data: goals },
      ] = await Promise.all([
        supabase.from('income_sources').select('*').eq('user_id', user.id).eq('is_active', true),
        supabase.from('personal_expenses').select('*').eq('user_id', user.id),
        supabase.from('recurring_payments').select('*').eq('user_id', user.id).eq('is_active', true),
        supabase.from('investments').select('*').eq('user_id', user.id),
        supabase.from('financial_goals').select('*').eq('user_id', user.id),
      ]);

      // Calculate monthly values
      const monthlyIncome = (income || []).reduce((sum, i) => {
        if (i.frequency === 'monthly') return sum + i.amount;
        if (i.frequency === 'weekly') return sum + (i.amount * 4);
        if (i.frequency === 'bi-weekly') return sum + (i.amount * 2);
        if (i.frequency === 'annually') return sum + (i.amount / 12);
        return sum + i.amount;
      }, 0);

      // Get last month's expenses
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const lastMonthExpenses = (expenses || []).filter(e => {
        const expDate = new Date(e.date);
        return expDate.getMonth() === lastMonth.getMonth() && 
               expDate.getFullYear() === lastMonth.getFullYear();
      }).reduce((sum, e) => sum + e.amount, 0);

      const monthlyRecurring = (recurring || []).reduce((sum, r) => {
        if (r.frequency === 'monthly') return sum + r.amount;
        if (r.frequency === 'weekly') return sum + (r.amount * 4);
        if (r.frequency === 'annually') return sum + (r.amount / 12);
        return sum + r.amount;
      }, 0);

      const totalInvestmentValue = (investments || []).reduce((sum, i) => 
        sum + (i.current_price * i.quantity), 0);
      
      const totalInvestmentCost = (investments || []).reduce((sum, i) => 
        sum + (i.purchase_price * i.quantity), 0);

      setFinancialData({
        totalIncome: monthlyIncome,
        totalExpenses: lastMonthExpenses || monthlyRecurring,
        totalRecurring: monthlyRecurring,
        totalInvestments: totalInvestmentValue,
        investmentGains: totalInvestmentValue - totalInvestmentCost,
        goals: (goals || []).map(g => ({
          name: g.goal_name,
          target: g.target_amount,
          current: g.current_amount || 0,
          date: g.target_date,
        })),
      });
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const projections = useMemo(() => {
    if (!financialData) return [];

    const monthlyNet = financialData.totalIncome - financialData.totalExpenses;
    const monthlySavings = (monthlyNet * savingsRate / 100) + extraSavings;
    const monthlyReturn = expectedReturn / 100 / 12;

    const data: Projection[] = [];
    let cumulativeSavings = 0;
    let investmentValue = financialData.totalInvestments;

    for (let i = 0; i <= monthsToProject; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      const monthLabel = date.toLocaleDateString('default', { month: 'short', year: '2-digit' });

      if (i > 0) {
        cumulativeSavings += monthlySavings;
        investmentValue *= (1 + monthlyReturn);
      }

      data.push({
        month: monthLabel,
        savings: Math.round(cumulativeSavings),
        investments: Math.round(investmentValue),
        netWorth: Math.round(cumulativeSavings + investmentValue),
      });
    }

    return data;
  }, [financialData, savingsRate, expectedReturn, monthsToProject, extraSavings]);

  const analysis = useMemo(() => {
    if (!financialData) return null;

    const monthlyNet = financialData.totalIncome - financialData.totalExpenses;
    const savingsRateActual = financialData.totalIncome > 0 
      ? (monthlyNet / financialData.totalIncome) * 100 
      : 0;
    
    const emergencyFundMonths = financialData.totalExpenses > 0
      ? financialData.totalInvestments / financialData.totalExpenses
      : 0;

    const recommendations: { type: 'success' | 'warning' | 'danger'; message: string }[] = [];

    if (savingsRateActual < 10) {
      recommendations.push({
        type: 'danger',
        message: 'Your savings rate is below 10%. Aim for at least 20% to build wealth.',
      });
    } else if (savingsRateActual < 20) {
      recommendations.push({
        type: 'warning',
        message: 'Good start! Try to increase your savings rate to 20% or more.',
      });
    } else {
      recommendations.push({
        type: 'success',
        message: `Excellent! You're saving ${savingsRateActual.toFixed(1)}% of your income.`,
      });
    }

    if (emergencyFundMonths < 3) {
      recommendations.push({
        type: 'danger',
        message: `You have ${emergencyFundMonths.toFixed(1)} months of emergency funds. Build up to 3-6 months.`,
      });
    } else if (emergencyFundMonths < 6) {
      recommendations.push({
        type: 'warning',
        message: `You have ${emergencyFundMonths.toFixed(1)} months of emergency funds. Consider building to 6 months.`,
      });
    } else {
      recommendations.push({
        type: 'success',
        message: `Great! You have ${emergencyFundMonths.toFixed(1)} months of emergency funds.`,
      });
    }

    // Goal progress
    financialData.goals.forEach(goal => {
      const progress = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
      if (goal.date) {
        const targetDate = new Date(goal.date);
        const monthsRemaining = Math.max(0, 
          (targetDate.getFullYear() - new Date().getFullYear()) * 12 + 
          (targetDate.getMonth() - new Date().getMonth())
        );
        const remainingAmount = goal.target - goal.current;
        const monthlyNeeded = monthsRemaining > 0 ? remainingAmount / monthsRemaining : remainingAmount;
        
        if (monthlyNeeded > monthlyNet * 0.5) {
          recommendations.push({
            type: 'warning',
            message: `Goal "${goal.name}" requires ${formatCurrency(monthlyNeeded)}/month. Consider extending the deadline.`,
          });
        }
      }
    });

    return {
      monthlyNet,
      savingsRateActual,
      emergencyFundMonths,
      recommendations,
    };
  }, [financialData, formatCurrency]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!financialData) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No financial data available. Add income and expenses to see your financial plan.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Advanced Financial Planner
            </CardTitle>
            <CardDescription>
              Project your financial future with scenario planning
            </CardDescription>
          </div>
          <ExportDataButton dataType="all" />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projections">Projections</TabsTrigger>
            <TabsTrigger value="goals">Goal Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Financial Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-accent/30 border">
                <p className="text-sm text-muted-foreground">Monthly Income</p>
                <p className="text-xl font-bold text-success">{formatCurrency(financialData.totalIncome)}</p>
              </div>
              <div className="p-4 rounded-lg bg-accent/30 border">
                <p className="text-sm text-muted-foreground">Monthly Expenses</p>
                <p className="text-xl font-bold text-destructive">{formatCurrency(financialData.totalExpenses)}</p>
              </div>
              <div className="p-4 rounded-lg bg-accent/30 border">
                <p className="text-sm text-muted-foreground">Net Monthly</p>
                <p className={cn("text-xl font-bold", analysis && analysis.monthlyNet >= 0 ? 'text-success' : 'text-destructive')}>
                  {analysis && formatCurrency(analysis.monthlyNet)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-accent/30 border">
                <p className="text-sm text-muted-foreground">Investments</p>
                <p className="text-xl font-bold text-primary">{formatCurrency(financialData.totalInvestments)}</p>
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                AI Recommendations
              </h4>
              {analysis?.recommendations.map((rec, i) => (
                <div 
                  key={i}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border",
                    rec.type === 'success' && 'bg-success/10 border-success/30',
                    rec.type === 'warning' && 'bg-warning/10 border-warning/30',
                    rec.type === 'danger' && 'bg-destructive/10 border-destructive/30'
                  )}
                >
                  {rec.type === 'success' && <CheckCircle2 className="w-5 h-5 text-success shrink-0" />}
                  {rec.type === 'warning' && <AlertTriangle className="w-5 h-5 text-warning shrink-0" />}
                  {rec.type === 'danger' && <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />}
                  <p className="text-sm">{rec.message}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="projections" className="space-y-6">
            {/* Scenario Controls */}
            <div className="grid md:grid-cols-2 gap-6 p-4 rounded-lg bg-accent/20 border">
              <div className="space-y-4">
                <div>
                  <Label className="flex items-center justify-between mb-2">
                    <span>Savings Rate</span>
                    <Badge variant="outline">{savingsRate}%</Badge>
                  </Label>
                  <Slider
                    value={[savingsRate]}
                    onValueChange={(v) => setSavingsRate(v[0])}
                    min={0}
                    max={50}
                    step={5}
                  />
                </div>
                <div>
                  <Label className="flex items-center justify-between mb-2">
                    <span>Expected Investment Return (Annual)</span>
                    <Badge variant="outline">{expectedReturn}%</Badge>
                  </Label>
                  <Slider
                    value={[expectedReturn]}
                    onValueChange={(v) => setExpectedReturn(v[0])}
                    min={0}
                    max={15}
                    step={1}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="flex items-center justify-between mb-2">
                    <span>Projection Period</span>
                    <Badge variant="outline">{monthsToProject} months</Badge>
                  </Label>
                  <Slider
                    value={[monthsToProject]}
                    onValueChange={(v) => setMonthsToProject(v[0])}
                    min={6}
                    max={60}
                    step={6}
                  />
                </div>
                <div>
                  <Label htmlFor="extra-savings">Extra Monthly Savings</Label>
                  <Input
                    id="extra-savings"
                    type="number"
                    value={extraSavings}
                    onChange={(e) => setExtraSavings(Number(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Projection Chart */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projections}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis 
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    className="text-xs"
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="savings" 
                    stackId="1"
                    stroke="hsl(var(--success))" 
                    fill="hsl(var(--success))"
                    fillOpacity={0.3}
                    name="Savings"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="investments" 
                    stackId="2"
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                    name="Investments"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Projection Summary */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-success/10 border border-success/30">
                <p className="text-sm text-muted-foreground">Projected Savings</p>
                <p className="text-xl font-bold text-success">
                  {projections.length > 0 && formatCurrency(projections[projections.length - 1].savings)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                <p className="text-sm text-muted-foreground">Projected Investments</p>
                <p className="text-xl font-bold text-primary">
                  {projections.length > 0 && formatCurrency(projections[projections.length - 1].investments)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-accent border">
                <p className="text-sm text-muted-foreground">Projected Net Worth</p>
                <p className="text-xl font-bold">
                  {projections.length > 0 && formatCurrency(projections[projections.length - 1].netWorth)}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            {financialData.goals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No financial goals set. Add goals to track your progress!</p>
              </div>
            ) : (
              financialData.goals.map((goal, i) => {
                const progress = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
                const remaining = goal.target - goal.current;
                
                let monthsToGoal = 0;
                if (goal.date) {
                  const targetDate = new Date(goal.date);
                  monthsToGoal = Math.max(0,
                    (targetDate.getFullYear() - new Date().getFullYear()) * 12 +
                    (targetDate.getMonth() - new Date().getMonth())
                  );
                }

                const monthlyNeeded = monthsToGoal > 0 ? remaining / monthsToGoal : remaining;

                return (
                  <div key={i} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        <span className="font-medium">{goal.name}</span>
                      </div>
                      <Badge variant={progress >= 100 ? 'default' : 'outline'}>
                        {progress.toFixed(0)}%
                      </Badge>
                    </div>
                    
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-3">
                      <div 
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Current</p>
                        <p className="font-medium">{formatCurrency(goal.current)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Target</p>
                        <p className="font-medium">{formatCurrency(goal.target)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Remaining</p>
                        <p className="font-medium">{formatCurrency(remaining)}</p>
                      </div>
                      {goal.date && (
                        <div>
                          <p className="text-muted-foreground">Monthly Needed</p>
                          <p className={cn(
                            "font-medium",
                            analysis && monthlyNeeded > analysis.monthlyNet * 0.5 && "text-warning"
                          )}>
                            {formatCurrency(monthlyNeeded)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FinancialPlanner;
