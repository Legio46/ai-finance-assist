import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Lightbulb, RefreshCcw, Sparkles, Loader2, ChevronDown, ChevronUp, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface SpendingInsight {
  title: string;
  description: string;
  type: 'positive' | 'warning' | 'neutral' | 'alert';
}

interface BudgetSuggestion {
  category: string;
  suggested_amount: number;
  reason: string;
}

interface AutoCategory {
  expense_description: string;
  current_category: string;
  suggested_category: string;
}

interface RecurringDetection {
  name: string;
  estimated_amount: number;
  frequency: string;
}

interface InsightsData {
  spending_insights: SpendingInsight[];
  budget_suggestions: BudgetSuggestion[];
  auto_categories: AutoCategory[];
  recurring_detection: RecurringDetection[];
}

const AIPersonalInsights = () => {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const { toast } = useToast();
  const { formatCurrency } = useLanguage();

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-personal-insights');
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data?.error) {
        throw new Error(data.error);
      }

      setInsights(data);
      setHasLoaded(true);
    } catch (err: any) {
      console.error('AI insights error:', err);
      toast({
        title: 'AI Insights Error',
        description: err.message || 'Failed to generate insights',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const insightIcon = (type: string) => {
    switch (type) {
      case 'positive': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'alert': return <TrendingDown className="w-5 h-5 text-destructive" />;
      default: return <Lightbulb className="w-5 h-5 text-primary" />;
    }
  };

  const insightBg = (type: string) => {
    switch (type) {
      case 'positive': return 'border-emerald-500/20 bg-emerald-500/5';
      case 'warning': return 'border-amber-500/20 bg-amber-500/5';
      case 'alert': return 'border-destructive/20 bg-destructive/5';
      default: return 'border-primary/20 bg-primary/5';
    }
  };

  if (!hasLoaded && !loading) {
    return (
      <Card className="border-2 border-dashed border-primary/30">
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <div className="p-4 rounded-full bg-primary/10 mb-4">
            <Brain className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">AI Financial Insights</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md">
            Get AI-powered spending analysis, smart budget suggestions, auto-categorization, and recurring payment detection.
          </p>
          <Button onClick={fetchInsights} className="gap-2">
            <Sparkles className="w-4 h-4" />
            Generate AI Insights
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-sm text-muted-foreground">Analyzing your financial data with AI...</p>
        </CardContent>
      </Card>
    );
  }

  if (!insights) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">AI Insights</h2>
          <Badge variant="secondary" className="text-xs">Powered by AI</Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={fetchInsights} disabled={loading} className="gap-1">
            <RefreshCcw className="w-3 h-3" />
            Refresh
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setHidden(!hidden)} className="gap-1">
            {hidden ? <ChevronDown className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {hidden ? 'Show' : 'Hide'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Spending Insights */}
        {insights.spending_insights.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Spending Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.spending_insights.map((insight, i) => (
                <div key={i} className={`p-3 rounded-lg border ${insightBg(insight.type)}`}>
                  <div className="flex items-start gap-2">
                    {insightIcon(insight.type)}
                    <div>
                      <p className="text-sm font-medium">{insight.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{insight.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Budget Suggestions */}
        {insights.budget_suggestions.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Smart Budget Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.budget_suggestions.map((sug, i) => (
                <div key={i} className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{sug.category}</span>
                    <Badge variant="outline" className="text-xs">{formatCurrency(sug.suggested_amount)}/mo</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{sug.reason}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Auto-Categorization */}
        {insights.auto_categories.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Category Suggestions
              </CardTitle>
              <CardDescription className="text-xs">AI-suggested categories for uncategorized expenses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {insights.auto_categories.map((cat, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg border border-border">
                  <div className="text-sm">
                    <span className="text-muted-foreground">{cat.expense_description}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Badge variant="outline" className="text-muted-foreground">{cat.current_category}</Badge>
                    <span>→</span>
                    <Badge variant="default">{cat.suggested_category}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recurring Detection */}
        {insights.recurring_detection.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <RefreshCcw className="w-4 h-4 text-primary" />
                Detected Recurring Expenses
              </CardTitle>
              <CardDescription className="text-xs">Expenses that appear to repeat regularly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {insights.recurring_detection.map((rec, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-primary/20 bg-primary/5">
                  <div>
                    <p className="text-sm font-medium">{rec.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{rec.frequency}</p>
                  </div>
                  <span className="text-sm font-semibold">{formatCurrency(rec.estimated_amount)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AIPersonalInsights;
