import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

import {
  Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import {
  TrendingUp, Target, Calculator, PiggyBank, AlertTriangle, CheckCircle2,
  Sparkles, Loader2, ShieldAlert, Lightbulb, DollarSign, BarChart3,
  Clock, ListChecks, Heart, Flame, CreditCard, Percent,
  Building2, Shield, Zap, TrendingDown, Award
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import ExportDataButton from './ExportDataButton';
import { useToast } from '@/hooks/use-toast';

// === Legio Financial Formulas ===

/** Compound Interest: FV = P × (1 + r)^n + PMT × [((1 + r)^n − 1) / r] */
const calcFutureValue = (principal: number, annualRate: number, years: number, monthlyContribution: number): number => {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal + monthlyContribution * n;
  return principal * Math.pow(1 + r, n) + monthlyContribution * ((Math.pow(1 + r, n) - 1) / r);
};

/** Loan Payment: PMT = P × [r(1+r)^n] / [(1+r)^n − 1] */
const calcLoanPayment = (principal: number, annualRate: number, years: number): number => {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};

/** Debt Payoff Time: n = −ln(1 − (B × r) / PMT) / ln(1 + r) */
const calcDebtPayoffMonths = (balance: number, annualRate: number, monthlyPayment: number): number => {
  const r = annualRate / 100 / 12;
  if (r === 0) return balance / monthlyPayment;
  const inner = 1 - (balance * r) / monthlyPayment;
  if (inner <= 0) return Infinity;
  return -Math.log(inner) / Math.log(1 + r);
};

/** FIRE Number = Annual Expenses / SWR */
const calcFIRENumber = (annualExpenses: number, swr: number): number => {
  return annualExpenses / (swr / 100);
};

/** Financial Health Score (300-850) - FICO-inspired */
const calcHealthScore = (savingsRate: number, emergencyMonths: number, dti: number, hasInvestments: boolean, hasGoals: boolean): number => {
  let score = 500;
  // Savings Rate (+100/+50/-100)
  if (savingsRate >= 20) score += 100;
  else if (savingsRate >= 10) score += 50;
  else if (savingsRate < 0) score -= 100;
  // Emergency Fund (+100/+50/-50)
  if (emergencyMonths >= 6) score += 100;
  else if (emergencyMonths >= 3) score += 50;
  else if (emergencyMonths < 1) score -= 50;
  // DTI (+100/+50/-100)
  if (dti < 20) score += 100;
  else if (dti <= 36) score += 50;
  else if (dti > 50) score -= 100;
  // Investing (+50)
  if (hasInvestments) score += 50;
  // Goals (+50)
  if (hasGoals) score += 50;
  return Math.max(300, Math.min(850, score));
};

const getScoreGrade = (score: number) => {
  if (score >= 750) return { grade: 'Excellent', color: 'text-emerald-400', bg: 'bg-emerald-400', desc: 'Top financial health — building long-term wealth effectively' };
  if (score >= 650) return { grade: 'Good', color: 'text-primary', bg: 'bg-primary', desc: 'Strong foundation — minor optimizations available' };
  if (score >= 550) return { grade: 'Fair', color: 'text-yellow-400', bg: 'bg-yellow-400', desc: 'Stable but key gaps exist in savings or debt management' };
  return { grade: 'Needs Work', color: 'text-destructive', bg: 'bg-destructive', desc: 'Significant financial vulnerabilities present' };
};

interface FinancialData {
  totalIncome: number;
  totalExpenses: number;
  totalRecurring: number;
  totalInvestments: number;
  investmentGains: number;
  totalDebt: number;
  goals: { name: string; target: number; current: number; date: string | null }[];
  expensesByCategory: Record<string, number>;
}

interface AISuggestions {
  savings_tips: { title: string; description: string; potential_savings: string; priority: string }[];
  investment_advice: { title: string; description: string; risk_level: string; timeframe: string }[];
  debt_strategy: { title: string; description: string; estimated_impact: string }[];
  tax_optimization: { title: string; description: string; potential_benefit: string }[];
  goal_acceleration: { goal_name: string; strategy: string; time_saved: string }[];
  risk_alerts: { title: string; description: string; severity: string; action: string }[];
  monthly_action_plan: { action: string; reason: string; priority: number }[];
}

const FinancialPlanner: React.FC = () => {
  const { user } = useAuth();
  const { formatCurrency } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestions | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Projections
  const [savingsRate, setSavingsRate] = useState(20);
  const [expectedReturn, setExpectedReturn] = useState(7);
  const [monthsToProject, setMonthsToProject] = useState(24);
  const [extraSavings, setExtraSavings] = useState(0);

  // Calculators
  const [calcTab, setCalcTab] = useState('compound');
  const [compPrincipal, setCompPrincipal] = useState(10000);
  const [compRate, setCompRate] = useState(7);
  const [compYears, setCompYears] = useState(30);
  const [compMonthly, setCompMonthly] = useState(500);
  const [loanPrincipal, setLoanPrincipal] = useState(200000);
  const [loanRate, setLoanRate] = useState(4.5);
  const [loanYears, setLoanYears] = useState(30);
  const [loanExtra, setLoanExtra] = useState(0);
  const [fireExpenses, setFireExpenses] = useState(3000);
  const [fireSWR, setFireSWR] = useState(4);
  const [fireCurrentSavings, setFireCurrentSavings] = useState(50000);
  const [fireMonthlyContrib, setFireMonthlyContrib] = useState(2000);
  const [fireReturnRate, setFireReturnRate] = useState(7);
  const [retireAge, setRetireAge] = useState(30);
  const [retireTarget, setRetireTarget] = useState(65);
  const [retireDesiredIncome, setRetireDesiredIncome] = useState(4000);

  useEffect(() => { if (user) fetchFinancialData(); }, [user]);

  const fetchFinancialData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [
        { data: income }, { data: expenses }, { data: recurring },
        { data: investments }, { data: goals }, { data: creditCards },
      ] = await Promise.all([
        supabase.from('income_sources').select('*').eq('user_id', user.id).eq('is_active', true),
        supabase.from('personal_expenses').select('*').eq('user_id', user.id),
        supabase.from('recurring_payments').select('*').eq('user_id', user.id).eq('is_active', true),
        supabase.from('investments').select('*').eq('user_id', user.id),
        supabase.from('financial_goals').select('*').eq('user_id', user.id),
        supabase.from('credit_cards').select('*').eq('user_id', user.id),
      ]);

      const monthlyIncome = (income || []).reduce((sum, i) => {
        if (i.frequency === 'monthly') return sum + i.amount;
        if (i.frequency === 'weekly') return sum + (i.amount * 4);
        if (i.frequency === 'bi-weekly') return sum + (i.amount * 2);
        if (i.frequency === 'annually') return sum + (i.amount / 12);
        return sum + i.amount;
      }, 0);

      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const recentExpenses = (expenses || []).filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
      });
      const lastMonthExpenses = recentExpenses.reduce((sum, e) => sum + e.amount, 0);

      const expensesByCategory: Record<string, number> = {};
      recentExpenses.forEach(e => {
        expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
      });

      const monthlyRecurring = (recurring || []).reduce((sum, r) => {
        if (r.frequency === 'monthly') return sum + r.amount;
        if (r.frequency === 'weekly') return sum + (r.amount * 4);
        if (r.frequency === 'annually') return sum + (r.amount / 12);
        return sum + r.amount;
      }, 0);

      const totalInvestmentValue = (investments || []).reduce((sum, i) => sum + (i.current_price * i.quantity), 0);
      const totalInvestmentCost = (investments || []).reduce((sum, i) => sum + (i.purchase_price * i.quantity), 0);
      const totalDebt = (creditCards || []).reduce((sum, c) => sum + (c.current_balance || 0), 0);

      setFinancialData({
        totalIncome: monthlyIncome,
        totalExpenses: lastMonthExpenses || monthlyRecurring,
        totalRecurring: monthlyRecurring,
        totalInvestments: totalInvestmentValue,
        investmentGains: totalInvestmentValue - totalInvestmentCost,
        totalDebt,
        goals: (goals || []).map(g => ({ name: g.goal_name, target: g.target_amount, current: g.current_amount || 0, date: g.target_date })),
        expensesByCategory,
      });
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAISuggestions = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-planner-suggestions');
      if (error) throw error;
      if (data?.error) { toast({ title: "AI Error", description: data.error, variant: "destructive" }); return; }
      setAiSuggestions(data);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to get AI suggestions.", variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  // === Derived Calculations ===
  const analysis = useMemo(() => {
    if (!financialData) return null;
    const monthlyNet = financialData.totalIncome - financialData.totalExpenses;
    const savingsRateActual = financialData.totalIncome > 0 ? (monthlyNet / financialData.totalIncome) * 100 : 0;
    const emergencyFundMonths = financialData.totalExpenses > 0 ? financialData.totalInvestments / financialData.totalExpenses : 0;
    const dti = financialData.totalIncome > 0 ? (financialData.totalDebt / (financialData.totalIncome * 12)) * 100 : 0;
    const healthScore = calcHealthScore(savingsRateActual, emergencyFundMonths, dti, financialData.totalInvestments > 0, financialData.goals.length > 0);

    // 50/30/20 Budget
    const needsBudget = financialData.totalIncome * 0.5;
    const wantsBudget = financialData.totalIncome * 0.3;
    const savingsBudget = financialData.totalIncome * 0.2;

    // Net Worth
    const netWorth = financialData.totalInvestments - financialData.totalDebt;

    return { monthlyNet, savingsRateActual, emergencyFundMonths, dti, healthScore, needsBudget, wantsBudget, savingsBudget, netWorth };
  }, [financialData]);

  // Projections
  const projections = useMemo(() => {
    if (!financialData) return [];
    const monthlyNet = financialData.totalIncome - financialData.totalExpenses;
    const monthlySavings = (monthlyNet * savingsRate / 100) + extraSavings;
    const monthlyReturn = expectedReturn / 100 / 12;
    const data: { month: string; savings: number; investments: number; netWorth: number }[] = [];
    let cumulativeSavings = 0;
    let investmentValue = financialData.totalInvestments;
    for (let i = 0; i <= monthsToProject; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      if (i > 0) { cumulativeSavings += monthlySavings; investmentValue *= (1 + monthlyReturn); }
      data.push({
        month: date.toLocaleDateString('default', { month: 'short', year: '2-digit' }),
        savings: Math.round(cumulativeSavings),
        investments: Math.round(investmentValue),
        netWorth: Math.round(cumulativeSavings + investmentValue - financialData.totalDebt),
      });
    }
    return data;
  }, [financialData, savingsRate, expectedReturn, monthsToProject, extraSavings]);

  // Calculator results
  const compoundResult = useMemo(() => {
    const fv = calcFutureValue(compPrincipal, compRate, compYears, compMonthly);
    const totalContributed = compPrincipal + compMonthly * compYears * 12;
    const interestEarned = fv - totalContributed;
    const yearlyData = [];
    for (let y = 0; y <= compYears; y += Math.max(1, Math.floor(compYears / 20))) {
      yearlyData.push({ year: y, value: Math.round(calcFutureValue(compPrincipal, compRate, y, compMonthly)), contributed: Math.round(compPrincipal + compMonthly * y * 12) });
    }
    return { fv, totalContributed, interestEarned, yearlyData };
  }, [compPrincipal, compRate, compYears, compMonthly]);

  const loanResult = useMemo(() => {
    const payment = calcLoanPayment(loanPrincipal, loanRate, loanYears);
    const totalPaid = payment * loanYears * 12;
    const totalInterest = totalPaid - loanPrincipal;
    let extraPayment = payment + loanExtra;
    let extraMonths = loanExtra > 0 ? calcDebtPayoffMonths(loanPrincipal, loanRate, extraPayment) : loanYears * 12;
    let extraTotalPaid = extraPayment * extraMonths;
    let interestSaved = totalInterest - (extraTotalPaid - loanPrincipal);
    return { payment, totalPaid, totalInterest, extraMonths: Math.ceil(extraMonths), interestSaved: Math.max(0, interestSaved) };
  }, [loanPrincipal, loanRate, loanYears, loanExtra]);

  const fireResult = useMemo(() => {
    const fireNumber = calcFIRENumber(fireExpenses * 12, fireSWR);
    const remaining = fireNumber - fireCurrentSavings;
    const monthlyReturn = fireReturnRate / 100 / 12;
    let months = 0;
    let balance = fireCurrentSavings;
    while (balance < fireNumber && months < 1200) {
      balance = balance * (1 + monthlyReturn) + fireMonthlyContrib;
      months++;
    }
    return { fireNumber, yearsToFIRE: Math.ceil(months / 12), monthsToFIRE: months, remaining };
  }, [fireExpenses, fireSWR, fireCurrentSavings, fireMonthlyContrib, fireReturnRate]);

  const retireResult = useMemo(() => {
    const yearsToRetire = retireTarget - retireAge;
    const fireNumber = calcFIRENumber(retireDesiredIncome * 12, 4);
    const projectedFV = calcFutureValue(fireCurrentSavings, fireReturnRate, yearsToRetire, fireMonthlyContrib);
    const gap = projectedFV - fireNumber;
    let requiredMonthly = 0;
    if (gap < 0) {
      const r = fireReturnRate / 100 / 12;
      const n = yearsToRetire * 12;
      if (r > 0) requiredMonthly = Math.abs(gap) / ((Math.pow(1 + r, n) - 1) / r);
    }
    return { fireNumber, projectedFV, gap, requiredMonthly, yearsToRetire };
  }, [retireAge, retireTarget, retireDesiredIncome, fireCurrentSavings, fireReturnRate, fireMonthlyContrib]);

  // Score ring
  const scoreRing = (score: number) => {
    const pct = ((score - 300) / 550) * 100;
    const { grade, color, desc } = getScoreGrade(score);
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
            <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--primary))" strokeWidth="8"
              strokeDasharray={`${pct * 3.27} 327`} strokeLinecap="round" className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">{score}</span>
            <span className={cn("text-sm font-semibold", color)}>{grade}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground text-center max-w-xs">{desc}</p>
      </div>
    );
  };

  if (loading) return <Card><CardContent className="py-12"><div className="flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></CardContent></Card>;
  if (!financialData) return <Card><CardContent className="py-12 text-center text-muted-foreground">No financial data available. Add income and expenses to see your financial plan.</CardContent></Card>;

  const priorityBadge = (p: string) => {
    if (p === 'high' || p === 'critical') return 'destructive' as const;
    if (p === 'medium' || p === 'warning') return 'default' as const;
    return 'secondary' as const;
  };

  const riskIcon = (severity: string) => {
    if (severity === 'critical') return <ShieldAlert className="w-5 h-5 text-destructive shrink-0" />;
    if (severity === 'warning') return <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0" />;
    return <Lightbulb className="w-5 h-5 text-primary shrink-0" />;
  };

  // 50/30/20 pie data
  const budgetPieData = analysis ? [
    { name: 'Needs (50%)', value: analysis.needsBudget, fill: 'hsl(var(--primary))' },
    { name: 'Wants (30%)', value: analysis.wantsBudget, fill: 'hsl(var(--info))' },
    { name: 'Savings (20%)', value: analysis.savingsBudget, fill: 'hsl(var(--success))' },
  ] : [];

  const categoryData = Object.entries(financialData.expensesByCategory).map(([cat, amount]) => ({ name: cat, amount })).sort((a, b) => b.amount - a.amount).slice(0, 8);

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Shield className="w-6 h-6 text-primary" />
              Legio Financial Planner
            </CardTitle>
            <CardDescription>Professional-grade financial planning with real formulas & AI</CardDescription>
          </div>
          <ExportDataButton dataType="all" />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 h-auto gap-1">
            <TabsTrigger value="dashboard" className="text-xs">Dashboard</TabsTrigger>
            <TabsTrigger value="budget" className="text-xs">50/30/20</TabsTrigger>
            <TabsTrigger value="health" className="text-xs">Health Score</TabsTrigger>
            <TabsTrigger value="projections" className="text-xs">Projections</TabsTrigger>
            <TabsTrigger value="calculators" className="text-xs">Calculators</TabsTrigger>
            <TabsTrigger value="ai-suggestions" className="text-xs gap-1"><Sparkles className="w-3 h-3" />AI Advisor</TabsTrigger>
            <TabsTrigger value="goals" className="text-xs">Goals</TabsTrigger>
          </TabsList>

          {/* === DASHBOARD TAB === */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { label: 'Net Worth', value: analysis?.netWorth || 0, icon: Building2, color: 'text-primary', positive: (analysis?.netWorth || 0) >= 0 },
                { label: 'Monthly Income', value: financialData.totalIncome, icon: TrendingUp, color: 'text-emerald-400', positive: true },
                { label: 'Monthly Expenses', value: financialData.totalExpenses, icon: TrendingDown, color: 'text-destructive', positive: false },
                { label: 'Cash Flow', value: analysis?.monthlyNet || 0, icon: DollarSign, color: (analysis?.monthlyNet || 0) >= 0 ? 'text-emerald-400' : 'text-destructive', positive: (analysis?.monthlyNet || 0) >= 0 },
                { label: 'Savings Rate', value: null, icon: Percent, color: (analysis?.savingsRateActual || 0) >= 20 ? 'text-emerald-400' : 'text-yellow-400', positive: (analysis?.savingsRateActual || 0) >= 20 },
              ].map((m, i) => (
                <div key={i} className="rounded-xl p-4 bg-card border border-border/50 hover:border-border transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <m.icon className={cn("w-4 h-4", m.color)} />
                    <span className="text-xs text-muted-foreground">{m.label}</span>
                  </div>
                  <p className={cn("text-lg font-bold", m.color)}>
                    {m.value !== null ? formatCurrency(m.value) : `${(analysis?.savingsRateActual || 0).toFixed(1)}%`}
                  </p>
                </div>
              ))}
            </div>

            {/* Quick Health + Recommendations */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="rounded-xl p-5 bg-card border border-border/50">
                <h4 className="font-semibold mb-4 flex items-center gap-2"><Heart className="w-4 h-4 text-destructive" /> Quick Health Check</h4>
                <div className="space-y-3">
                  {[
                    { label: 'Savings Rate', value: `${(analysis?.savingsRateActual || 0).toFixed(1)}%`, status: (analysis?.savingsRateActual || 0) >= 20 ? 'good' : (analysis?.savingsRateActual || 0) >= 10 ? 'ok' : 'bad' },
                    { label: 'Emergency Fund', value: `${(analysis?.emergencyFundMonths || 0).toFixed(1)} months`, status: (analysis?.emergencyFundMonths || 0) >= 6 ? 'good' : (analysis?.emergencyFundMonths || 0) >= 3 ? 'ok' : 'bad' },
                    { label: 'Debt-to-Income', value: `${(analysis?.dti || 0).toFixed(1)}%`, status: (analysis?.dti || 0) < 20 ? 'good' : (analysis?.dti || 0) <= 36 ? 'ok' : 'bad' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <span className="text-sm">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{item.value}</span>
                        <div className={cn("w-2.5 h-2.5 rounded-full", item.status === 'good' ? 'bg-emerald-400' : item.status === 'ok' ? 'bg-yellow-400' : 'bg-destructive')} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl p-5 bg-card border border-border/50">
                <h4 className="font-semibold mb-4 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-primary" /> Smart Recommendations</h4>
                <div className="space-y-2">
                  {(analysis?.savingsRateActual || 0) < 20 && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-400/10 border border-yellow-400/20">
                      <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                      <p className="text-sm">Increase your savings rate to at least 20% (currently {(analysis?.savingsRateActual || 0).toFixed(1)}%).</p>
                    </div>
                  )}
                  {(analysis?.emergencyFundMonths || 0) < 3 && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <ShieldAlert className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                      <p className="text-sm">Build your emergency fund to cover at least 3 months of expenses.</p>
                    </div>
                  )}
                  {(analysis?.dti || 0) > 36 && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <CreditCard className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                      <p className="text-sm">Your debt-to-income ratio is high ({(analysis?.dti || 0).toFixed(1)}%). Focus on paying down debt.</p>
                    </div>
                  )}
                  {(analysis?.savingsRateActual || 0) >= 20 && (analysis?.emergencyFundMonths || 0) >= 3 && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-400/10 border border-emerald-400/20">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      <p className="text-sm">You're in great shape! Consider increasing investment contributions.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* === 50/30/20 BUDGET TAB === */}
          <TabsContent value="budget" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="rounded-xl p-5 bg-card border border-border/50">
                <h4 className="font-semibold mb-4">The 50/30/20 Rule</h4>
                <p className="text-sm text-muted-foreground mb-4">Based on your {formatCurrency(financialData.totalIncome)} monthly income</p>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={budgetPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                        {budgetPieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'Needs', pct: 50, budget: analysis?.needsBudget || 0, color: 'bg-primary', icon: Building2, desc: 'Rent, food, utilities, insurance' },
                  { name: 'Wants', pct: 30, budget: analysis?.wantsBudget || 0, color: 'bg-info', icon: Heart, desc: 'Dining, entertainment, subscriptions' },
                  { name: 'Savings / Debt', pct: 20, budget: analysis?.savingsBudget || 0, color: 'bg-emerald-400', icon: PiggyBank, desc: '401(k), emergency fund, extra payments' },
                ].map((b, i) => (
                  <div key={i} className="rounded-xl p-4 bg-card border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <b.icon className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{b.name} ({b.pct}%)</span>
                      </div>
                      <span className="font-bold">{formatCurrency(b.budget)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{b.desc}</p>
                    <Progress value={b.pct} className="h-2" />
                  </div>
                ))}
                <div className="rounded-xl p-4 bg-card border border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Surplus / Deficit</span>
                    <Badge variant={(analysis?.monthlyNet || 0) >= 0 ? 'default' : 'destructive'}>
                      {(analysis?.monthlyNet || 0) >= 0 ? '+' : ''}{formatCurrency(analysis?.monthlyNet || 0)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {categoryData.length > 0 && (
              <div className="rounded-xl p-5 bg-card border border-border/50">
                <h4 className="font-semibold mb-4">Spending by Category</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" tickFormatter={(v) => `€${v}`} className="text-xs" />
                      <YAxis type="category" dataKey="name" width={100} className="text-xs" />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                      <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </TabsContent>

          {/* === HEALTH SCORE TAB === */}
          <TabsContent value="health" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="rounded-xl p-6 bg-card border border-border/50 flex flex-col items-center justify-center">
                <h4 className="font-semibold mb-6 flex items-center gap-2"><Award className="w-5 h-5 text-primary" /> Financial Health Score</h4>
                {analysis && scoreRing(analysis.healthScore)}
                <p className="text-xs text-muted-foreground mt-4 text-center">Score range: 300–850 (FICO-inspired model)</p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">Score Breakdown</h4>
                {[
                  { pillar: 'Savings Rate', weight: '~20%', status: (analysis?.savingsRateActual || 0) >= 20 ? '+100' : (analysis?.savingsRateActual || 0) >= 10 ? '+50' : (analysis?.savingsRateActual || 0) < 0 ? '-100' : '0', ok: (analysis?.savingsRateActual || 0) >= 10 },
                  { pillar: 'Emergency Fund', weight: '~20%', status: (analysis?.emergencyFundMonths || 0) >= 6 ? '+100' : (analysis?.emergencyFundMonths || 0) >= 3 ? '+50' : (analysis?.emergencyFundMonths || 0) < 1 ? '-50' : '0', ok: (analysis?.emergencyFundMonths || 0) >= 3 },
                  { pillar: 'Debt Load (DTI)', weight: '~20%', status: (analysis?.dti || 0) < 20 ? '+100' : (analysis?.dti || 0) <= 36 ? '+50' : (analysis?.dti || 0) > 50 ? '-100' : '0', ok: (analysis?.dti || 0) <= 36 },
                  { pillar: 'Investing', weight: '~10%', status: financialData.totalInvestments > 0 ? '+50' : '0', ok: financialData.totalInvestments > 0 },
                  { pillar: 'Goal Setting', weight: '~10%', status: financialData.goals.length > 0 ? '+50' : '0', ok: financialData.goals.length > 0 },
                ].map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                    <div>
                      <span className="text-sm font-medium">{p.pillar}</span>
                      <span className="text-xs text-muted-foreground ml-2">{p.weight}</span>
                    </div>
                    <Badge variant={p.ok ? 'default' : 'destructive'} className="font-mono">{p.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* === PROJECTIONS TAB === */}
          <TabsContent value="projections" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6 p-4 rounded-xl bg-card border border-border/50">
              <div className="space-y-4">
                <div>
                  <Label className="flex items-center justify-between mb-2"><span>Savings Rate</span><Badge variant="outline">{savingsRate}%</Badge></Label>
                  <Slider value={[savingsRate]} onValueChange={(v) => setSavingsRate(v[0])} min={0} max={50} step={5} />
                </div>
                <div>
                  <Label className="flex items-center justify-between mb-2"><span>Expected Return (Annual)</span><Badge variant="outline">{expectedReturn}%</Badge></Label>
                  <Slider value={[expectedReturn]} onValueChange={(v) => setExpectedReturn(v[0])} min={0} max={15} step={1} />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="flex items-center justify-between mb-2"><span>Projection Period</span><Badge variant="outline">{monthsToProject} months</Badge></Label>
                  <Slider value={[monthsToProject]} onValueChange={(v) => setMonthsToProject(v[0])} min={6} max={60} step={6} />
                </div>
                <div>
                  <Label htmlFor="extra-savings">Extra Monthly Savings</Label>
                  <Input id="extra-savings" type="number" value={extraSavings} onChange={(e) => setExtraSavings(Number(e.target.value) || 0)} />
                </div>
              </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projections}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`} className="text-xs" />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                  <Legend />
                  <Area type="monotone" dataKey="savings" stackId="1" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.3} name="Savings" />
                  <Area type="monotone" dataKey="investments" stackId="2" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} name="Investments" />
                  <Line type="monotone" dataKey="netWorth" stroke="hsl(var(--info))" strokeWidth={2} dot={false} name="Net Worth" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Projected Savings', value: projections[projections.length - 1]?.savings, color: 'text-emerald-400' },
                { label: 'Projected Investments', value: projections[projections.length - 1]?.investments, color: 'text-primary' },
                { label: 'Projected Net Worth', value: projections[projections.length - 1]?.netWorth, color: 'text-info' },
              ].map((m, i) => (
                <div key={i} className="p-4 rounded-xl bg-card border border-border/50 text-center">
                  <p className="text-sm text-muted-foreground">{m.label}</p>
                  <p className={cn("text-xl font-bold", m.color)}>{m.value != null && formatCurrency(m.value)}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* === CALCULATORS TAB === */}
          <TabsContent value="calculators" className="space-y-6">
            <Tabs value={calcTab} onValueChange={setCalcTab}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="compound" className="text-xs">Compound Interest</TabsTrigger>
                <TabsTrigger value="loan" className="text-xs">Loan Payoff</TabsTrigger>
                <TabsTrigger value="fire" className="text-xs">FIRE Calculator</TabsTrigger>
                <TabsTrigger value="retirement" className="text-xs">Retirement</TabsTrigger>
              </TabsList>

              {/* Compound Interest */}
              <TabsContent value="compound" className="space-y-6 mt-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4 rounded-xl p-5 bg-card border border-border/50">
                    <h4 className="font-semibold flex items-center gap-2"><Calculator className="w-4 h-4 text-primary" /> Compound Interest</h4>
                    <p className="text-xs text-muted-foreground">FV = P × (1 + r)ⁿ + PMT × [((1 + r)ⁿ − 1) / r]</p>
                    <div className="space-y-3">
                      <div><Label>Initial Investment (€)</Label><Input type="number" value={compPrincipal} onChange={e => setCompPrincipal(+e.target.value || 0)} /></div>
                      <div><Label>Annual Return (%)</Label><Input type="number" value={compRate} onChange={e => setCompRate(+e.target.value || 0)} /></div>
                      <div><Label>Time Period (years)</Label><Input type="number" value={compYears} onChange={e => setCompYears(+e.target.value || 0)} /></div>
                      <div><Label>Monthly Contribution (€)</Label><Input type="number" value={compMonthly} onChange={e => setCompMonthly(+e.target.value || 0)} /></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-center">
                        <p className="text-xs text-muted-foreground">Future Value</p>
                        <p className="text-lg font-bold text-primary">{formatCurrency(compoundResult.fv)}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-muted/30 border border-border/50 text-center">
                        <p className="text-xs text-muted-foreground">Contributed</p>
                        <p className="text-lg font-bold">{formatCurrency(compoundResult.totalContributed)}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-400/10 border border-emerald-400/20 text-center">
                        <p className="text-xs text-muted-foreground">Interest Earned</p>
                        <p className="text-lg font-bold text-emerald-400">{formatCurrency(compoundResult.interestEarned)}</p>
                      </div>
                    </div>
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={compoundResult.yearlyData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="year" className="text-xs" />
                          <YAxis tickFormatter={v => `€${(v/1000).toFixed(0)}k`} className="text-xs" />
                          <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                          <Area type="monotone" dataKey="contributed" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted))" fillOpacity={0.5} name="Contributed" />
                          <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} name="Total Value" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Loan Payoff */}
              <TabsContent value="loan" className="space-y-6 mt-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4 rounded-xl p-5 bg-card border border-border/50">
                    <h4 className="font-semibold flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary" /> Loan Payoff</h4>
                    <p className="text-xs text-muted-foreground">PMT = P × [r(1+r)ⁿ] / [(1+r)ⁿ − 1]</p>
                    <div className="space-y-3">
                      <div><Label>Loan Amount (€)</Label><Input type="number" value={loanPrincipal} onChange={e => setLoanPrincipal(+e.target.value || 0)} /></div>
                      <div><Label>Interest Rate (%)</Label><Input type="number" value={loanRate} onChange={e => setLoanRate(+e.target.value || 0)} step="0.1" /></div>
                      <div><Label>Loan Term (years)</Label><Input type="number" value={loanYears} onChange={e => setLoanYears(+e.target.value || 0)} /></div>
                      <div><Label>Extra Monthly Payment (€)</Label><Input type="number" value={loanExtra} onChange={e => setLoanExtra(+e.target.value || 0)} /></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Monthly Payment', value: formatCurrency(loanResult.payment), color: 'text-primary' },
                      { label: 'Total Paid', value: formatCurrency(loanResult.totalPaid), color: '' },
                      { label: 'Total Interest', value: formatCurrency(loanResult.totalInterest), color: 'text-destructive' },
                    ].map((r, i) => (
                      <div key={i} className="p-4 rounded-xl bg-card border border-border/50">
                        <p className="text-xs text-muted-foreground">{r.label}</p>
                        <p className={cn("text-xl font-bold", r.color)}>{r.value}</p>
                      </div>
                    ))}
                    {loanExtra > 0 && (
                      <div className="p-4 rounded-xl bg-emerald-400/10 border border-emerald-400/20">
                        <p className="text-xs text-muted-foreground">With extra payments</p>
                        <p className="text-sm"><span className="font-bold text-emerald-400">{formatCurrency(loanResult.interestSaved)}</span> interest saved</p>
                        <p className="text-sm"><span className="font-bold text-emerald-400">{Math.max(0, loanYears * 12 - loanResult.extraMonths)} months</span> earlier payoff</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* FIRE Calculator */}
              <TabsContent value="fire" className="space-y-6 mt-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4 rounded-xl p-5 bg-card border border-border/50">
                    <h4 className="font-semibold flex items-center gap-2"><Flame className="w-4 h-4 text-orange-400" /> FIRE Calculator</h4>
                    <p className="text-xs text-muted-foreground">FIRE Number = Annual Expenses / Safe Withdrawal Rate (Bengen, 1994)</p>
                    <div className="space-y-3">
                      <div><Label>Monthly Expenses (€)</Label><Input type="number" value={fireExpenses} onChange={e => setFireExpenses(+e.target.value || 0)} /></div>
                      <div>
                        <Label className="flex items-center justify-between mb-1"><span>Safe Withdrawal Rate</span><Badge variant="outline">{fireSWR}%</Badge></Label>
                        <Slider value={[fireSWR]} onValueChange={v => setFireSWR(v[0])} min={3} max={6} step={0.5} />
                      </div>
                      <div><Label>Current Savings (€)</Label><Input type="number" value={fireCurrentSavings} onChange={e => setFireCurrentSavings(+e.target.value || 0)} /></div>
                      <div><Label>Monthly Contribution (€)</Label><Input type="number" value={fireMonthlyContrib} onChange={e => setFireMonthlyContrib(+e.target.value || 0)} /></div>
                      <div><Label>Expected Return (%)</Label><Input type="number" value={fireReturnRate} onChange={e => setFireReturnRate(+e.target.value || 0)} /></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="p-5 rounded-xl bg-gradient-to-br from-orange-400/10 to-primary/10 border border-orange-400/20 text-center">
                      <Flame className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Your FIRE Number</p>
                      <p className="text-3xl font-bold text-primary mt-1">{formatCurrency(fireResult.fireNumber)}</p>
                      <p className="text-xs text-muted-foreground mt-1">{fireExpenses * 12 > 0 ? `${(fireResult.fireNumber / (fireExpenses * 12)).toFixed(0)}× annual expenses` : ''}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 rounded-xl bg-card border border-border/50 text-center">
                        <p className="text-xs text-muted-foreground">Years to FIRE</p>
                        <p className="text-2xl font-bold text-primary">{fireResult.yearsToFIRE > 100 ? '100+' : fireResult.yearsToFIRE}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-card border border-border/50 text-center">
                        <p className="text-xs text-muted-foreground">Remaining</p>
                        <p className="text-lg font-bold">{formatCurrency(Math.max(0, fireResult.remaining))}</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                      <p className="text-xs text-muted-foreground">Progress to FIRE</p>
                      <Progress value={Math.min(100, (fireCurrentSavings / fireResult.fireNumber) * 100)} className="h-2 mt-2" />
                      <p className="text-xs text-muted-foreground mt-1">{((fireCurrentSavings / fireResult.fireNumber) * 100).toFixed(1)}% complete</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Retirement */}
              <TabsContent value="retirement" className="space-y-6 mt-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4 rounded-xl p-5 bg-card border border-border/50">
                    <h4 className="font-semibold flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Retirement Planner</h4>
                    <div className="space-y-3">
                      <div><Label>Current Age</Label><Input type="number" value={retireAge} onChange={e => setRetireAge(+e.target.value || 0)} /></div>
                      <div><Label>Target Retirement Age</Label><Input type="number" value={retireTarget} onChange={e => setRetireTarget(+e.target.value || 0)} /></div>
                      <div><Label>Desired Monthly Income (€)</Label><Input type="number" value={retireDesiredIncome} onChange={e => setRetireDesiredIncome(+e.target.value || 0)} /></div>
                      <div><Label>Current Savings (€)</Label><Input type="number" value={fireCurrentSavings} onChange={e => setFireCurrentSavings(+e.target.value || 0)} /></div>
                      <div><Label>Monthly Contribution (€)</Label><Input type="number" value={fireMonthlyContrib} onChange={e => setFireMonthlyContrib(+e.target.value || 0)} /></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 rounded-xl bg-card border border-border/50 text-center">
                        <p className="text-xs text-muted-foreground">Required Portfolio</p>
                        <p className="text-lg font-bold text-primary">{formatCurrency(retireResult.fireNumber)}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-card border border-border/50 text-center">
                        <p className="text-xs text-muted-foreground">Projected at {retireTarget}</p>
                        <p className="text-lg font-bold">{formatCurrency(retireResult.projectedFV)}</p>
                      </div>
                    </div>
                    <div className={cn("p-4 rounded-xl border", retireResult.gap >= 0 ? 'bg-emerald-400/10 border-emerald-400/20' : 'bg-destructive/10 border-destructive/20')}>
                      <p className="text-xs text-muted-foreground">Retirement Gap</p>
                      <p className={cn("text-2xl font-bold", retireResult.gap >= 0 ? 'text-emerald-400' : 'text-destructive')}>
                        {retireResult.gap >= 0 ? '+' : ''}{formatCurrency(retireResult.gap)}
                      </p>
                      {retireResult.gap < 0 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Increase monthly savings by <span className="font-bold text-primary">{formatCurrency(retireResult.requiredMonthly)}</span> to close the gap.
                        </p>
                      )}
                      {retireResult.gap >= 0 && <p className="text-sm text-emerald-400 mt-1">You're on track for retirement! 🎉</p>}
                    </div>
                    <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                      <p className="text-xs text-muted-foreground">{retireResult.yearsToRetire} years until retirement</p>
                      <Progress value={Math.min(100, (fireCurrentSavings / retireResult.fireNumber) * 100)} className="h-2 mt-2" />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* === AI SUGGESTIONS TAB === */}
          <TabsContent value="ai-suggestions" className="space-y-6">
            {!aiSuggestions && !aiLoading && (
              <div className="text-center py-12">
                <Sparkles className="w-16 h-16 mx-auto text-primary/40 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Legio AI Financial Advisor</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Get personalized savings tips, investment advice, risk alerts, tax strategies, debt elimination plans, and a prioritized monthly action plan.
                </p>
                <Button onClick={fetchAISuggestions} className="gap-2"><Sparkles className="w-4 h-4" /> Generate AI Analysis</Button>
              </div>
            )}
            {aiLoading && (
              <div className="text-center py-12">
                <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">APEX is analyzing your complete financial profile...</p>
              </div>
            )}
            {aiSuggestions && !aiLoading && (
              <div className="space-y-8">
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={fetchAISuggestions} className="gap-2"><Sparkles className="w-3.5 h-3.5" /> Refresh</Button>
                </div>

                {aiSuggestions.risk_alerts.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2 text-lg"><ShieldAlert className="w-5 h-5 text-destructive" /> Risk Alerts</h4>
                    {aiSuggestions.risk_alerts.map((alert, i) => (
                      <div key={i} className={cn("p-4 rounded-xl border", alert.severity === 'critical' ? 'bg-destructive/10 border-destructive/30' : 'bg-yellow-400/10 border-yellow-400/30')}>
                        <div className="flex items-start gap-3">
                          {riskIcon(alert.severity)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1"><span className="font-medium">{alert.title}</span><Badge variant={priorityBadge(alert.severity)} className="text-xs capitalize">{alert.severity}</Badge></div>
                            <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                            <p className="text-sm font-medium">→ {alert.action}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {aiSuggestions.monthly_action_plan.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2 text-lg"><ListChecks className="w-5 h-5 text-primary" /> Monthly Action Plan</h4>
                    {aiSuggestions.monthly_action_plan.sort((a, b) => a.priority - b.priority).map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl border bg-card hover:bg-muted/20 transition-colors">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">{i + 1}</div>
                        <div><p className="font-medium text-sm">{item.action}</p><p className="text-xs text-muted-foreground mt-0.5">{item.reason}</p></div>
                      </div>
                    ))}
                  </div>
                )}

                {aiSuggestions.savings_tips.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2 text-lg"><PiggyBank className="w-5 h-5 text-emerald-400" /> Savings Tips</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {aiSuggestions.savings_tips.map((tip, i) => (
                        <div key={i} className="p-4 rounded-xl border bg-card">
                          <div className="flex items-center justify-between mb-2"><span className="font-medium text-sm">{tip.title}</span><Badge variant={priorityBadge(tip.priority)} className="text-xs capitalize">{tip.priority}</Badge></div>
                          <p className="text-sm text-muted-foreground mb-2">{tip.description}</p>
                          <p className="text-xs font-medium text-emerald-400">💰 Potential: {tip.potential_savings}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {aiSuggestions.investment_advice.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2 text-lg"><BarChart3 className="w-5 h-5 text-primary" /> Investment Advice</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {aiSuggestions.investment_advice.map((a, i) => (
                        <div key={i} className="p-4 rounded-xl border bg-card">
                          <div className="flex items-center justify-between mb-2"><span className="font-medium text-sm">{a.title}</span><Badge variant="outline" className="text-xs capitalize">Risk: {a.risk_level}</Badge></div>
                          <p className="text-sm text-muted-foreground mb-2">{a.description}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3 h-3" /><span>{a.timeframe}</span></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {aiSuggestions.debt_strategy.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2 text-lg"><CreditCard className="w-5 h-5 text-yellow-400" /> Debt Strategy</h4>
                    {aiSuggestions.debt_strategy.map((item, i) => (
                      <div key={i} className="p-4 rounded-xl border bg-card"><span className="font-medium text-sm">{item.title}</span><p className="text-sm text-muted-foreground mt-1">{item.description}</p><p className="text-xs font-medium text-yellow-400 mt-2">Impact: {item.estimated_impact}</p></div>
                    ))}
                  </div>
                )}

                {aiSuggestions.tax_optimization.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2 text-lg"><Calculator className="w-5 h-5 text-primary" /> Tax Optimization</h4>
                    {aiSuggestions.tax_optimization.map((item, i) => (
                      <div key={i} className="p-4 rounded-xl border bg-card"><span className="font-medium text-sm">{item.title}</span><p className="text-sm text-muted-foreground mt-1">{item.description}</p><p className="text-xs font-medium text-emerald-400 mt-2">Benefit: {item.potential_benefit}</p></div>
                    ))}
                  </div>
                )}

                {aiSuggestions.goal_acceleration.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2 text-lg"><Zap className="w-5 h-5 text-emerald-400" /> Goal Acceleration</h4>
                    {aiSuggestions.goal_acceleration.map((item, i) => (
                      <div key={i} className="p-4 rounded-xl border bg-card">
                        <div className="flex items-center gap-2 mb-1"><Target className="w-4 h-4 text-primary" /><span className="font-medium text-sm">{item.goal_name}</span></div>
                        <p className="text-sm text-muted-foreground">{item.strategy}</p>
                        <p className="text-xs font-medium text-primary mt-2">⏱️ Time saved: {item.time_saved}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* === GOALS TAB === */}
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
                  const td = new Date(goal.date);
                  monthsToGoal = Math.max(0, (td.getFullYear() - new Date().getFullYear()) * 12 + (td.getMonth() - new Date().getMonth()));
                }
                const monthlyNeeded = monthsToGoal > 0 ? remaining / monthsToGoal : remaining;
                return (
                  <div key={i} className="p-5 rounded-xl border bg-card border-border/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2"><Target className="w-5 h-5 text-primary" /><span className="font-medium">{goal.name}</span></div>
                      <Badge variant={progress >= 100 ? 'default' : 'outline'}>{progress.toFixed(0)}%</Badge>
                    </div>
                    <Progress value={Math.min(100, progress)} className="h-2 mb-3" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div><p className="text-muted-foreground">Current</p><p className="font-medium">{formatCurrency(goal.current)}</p></div>
                      <div><p className="text-muted-foreground">Target</p><p className="font-medium">{formatCurrency(goal.target)}</p></div>
                      <div><p className="text-muted-foreground">Remaining</p><p className="font-medium">{formatCurrency(remaining)}</p></div>
                      {goal.date && <div><p className="text-muted-foreground">Monthly Needed</p><p className={cn("font-medium", analysis && monthlyNeeded > (analysis.monthlyNet * 0.5) && "text-yellow-400")}>{formatCurrency(monthlyNeeded)}</p></div>}
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
