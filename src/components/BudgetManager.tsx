import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Target, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from '@/contexts/LanguageContext';
import { Progress } from '@/components/ui/progress';

const BudgetManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { formatCurrency } = useLanguage();
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly',
  });

  const expenseCategories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Travel',
    'Education',
    'Other'
  ];

  useEffect(() => {
    if (user) {
      fetchBudgets();
      fetchExpenses();
    }
  }, [user]);

  const fetchBudgets = async () => {
    if (!user) return;

    try {
      const { data, error } = await (supabase as any)
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBudgets(data || []);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    if (!user) return;

    try {
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      
      const { data, error } = await supabase
        .from('personal_expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', firstDayOfMonth.toISOString());

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const addBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await (supabase as any)
        .from('budgets')
        .insert([
          {
            user_id: user.id,
            category: formData.category,
            amount: parseFloat(formData.amount),
            period: formData.period,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Budget Created",
        description: "Your budget has been set successfully.",
      });

      setFormData({
        category: '',
        amount: '',
        period: 'monthly',
      });
      setShowAddForm(false);
      fetchBudgets();
    } catch (error) {
      console.error('Error adding budget:', error);
      toast({
        title: "Error",
        description: "Failed to create budget",
        variant: "destructive",
      });
    }
  };

  const getSpentAmount = (category: string) => {
    return expenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  };

  const getBudgetStatus = (budget: any) => {
    const spent = getSpentAmount(budget.category);
    const percentage = (spent / budget.amount) * 100;
    
    if (percentage >= 100) return { color: 'text-destructive', status: 'Over budget' };
    if (percentage >= 80) return { color: 'text-orange-500', status: 'Near limit' };
    return { color: 'text-success', status: 'On track' };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Budget Management</CardTitle>
            <CardDescription>Set and track spending limits by category</CardDescription>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-gradient-primary hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            Set Budget
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddForm && (
          <form onSubmit={addBudget} className="space-y-4 border-t pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Budget Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full">Create Budget</Button>
          </form>
        )}

        <div className="space-y-4">
          {budgets.map((budget) => {
            const spent = getSpentAmount(budget.category);
            const percentage = Math.min((spent / budget.amount) * 100, 100);
            const status = getBudgetStatus(budget);
            
            return (
              <div key={budget.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{budget.category}</div>
                    <div className="text-sm text-muted-foreground">Monthly budget</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(spent)} / {formatCurrency(budget.amount)}</div>
                    <div className={`text-sm ${status.color}`}>{status.status}</div>
                  </div>
                </div>
                <Progress value={percentage} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {formatCurrency(budget.amount - spent)} remaining
                </div>
              </div>
            );
          })}
          {budgets.length === 0 && !showAddForm && (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No budgets set yet. Create one to start tracking!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetManager;