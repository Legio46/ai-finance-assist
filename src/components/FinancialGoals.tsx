import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from '@/contexts/LanguageContext';
import { Progress } from '@/components/ui/progress';

const FinancialGoals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { formatCurrency } = useLanguage();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    goal_name: '',
    target_amount: '',
    current_amount: '',
    target_date: '',
  });

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('target_date', { ascending: true });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('financial_goals')
        .insert([
          {
            user_id: user.id,
            goal_name: formData.goal_name,
            target_amount: parseFloat(formData.target_amount),
            current_amount: parseFloat(formData.current_amount || '0'),
            target_date: formData.target_date,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Goal Created",
        description: "Your financial goal has been set successfully.",
      });

      setFormData({
        goal_name: '',
        target_amount: '',
        current_amount: '',
        target_date: '',
      });
      setShowAddForm(false);
      fetchGoals();
    } catch (error) {
      console.error('Error adding goal:', error);
      toast({
        title: "Error",
        description: "Failed to create goal",
        variant: "destructive",
      });
    }
  };

  const updateGoalProgress = async (goalId: string, newAmount: number) => {
    try {
      const { error } = await supabase
        .from('financial_goals')
        .update({ current_amount: newAmount })
        .eq('id', goalId);

      if (error) throw error;

      toast({
        title: "Progress Updated",
        description: "Goal progress has been updated.",
      });
      fetchGoals();
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      });
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('financial_goals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Goal Deleted",
        description: "The financial goal has been removed.",
      });
      fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive",
      });
    }
  };

  const getDaysUntilTarget = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
            <CardTitle className="flex items-center gap-2">
              Financial Goals
              <Badge variant="secondary" className="text-xs">Pro</Badge>
            </CardTitle>
            <CardDescription>Track progress towards your financial targets</CardDescription>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-gradient-primary hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            Set Goal
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddForm && (
          <form onSubmit={addGoal} className="space-y-4 border-t pt-4">
            <div>
              <Label>Goal Name</Label>
              <Input
                value={formData.goal_name}
                onChange={(e) => setFormData({...formData, goal_name: e.target.value})}
                placeholder="e.g., Vacation, House Down Payment"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Target Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.target_amount}
                  onChange={(e) => setFormData({...formData, target_amount: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Current Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.current_amount}
                  onChange={(e) => setFormData({...formData, current_amount: e.target.value})}
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <Label>Target Date</Label>
              <Input
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData({...formData, target_date: e.target.value})}
                required
              />
            </div>
            <Button type="submit" className="w-full">Create Goal</Button>
          </form>
        )}

        <div className="space-y-4">
          {goals.map((goal) => {
            const percentage = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
            const daysUntil = getDaysUntilTarget(goal.target_date);
            const isComplete = percentage >= 100;
            
            return (
              <div key={goal.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {goal.goal_name}
                      {isComplete && <Badge variant="default" className="bg-success">Complete!</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Target: {new Date(goal.target_date).toLocaleDateString()}
                      {daysUntil > 0 && ` (${daysUntil} days)`}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteGoal(goal.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{formatCurrency(goal.current_amount)}</span>
                    <span className="text-muted-foreground">{formatCurrency(goal.target_amount)}</span>
                  </div>
                  <Progress value={percentage} className="h-3" />
                  <div className="text-xs text-muted-foreground mt-1 text-center">
                    {percentage.toFixed(1)}% complete • {formatCurrency(goal.target_amount - goal.current_amount)} to go
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Update amount"
                    defaultValue={goal.current_amount}
                    onBlur={(e) => {
                      const newAmount = parseFloat(e.target.value);
                      if (!isNaN(newAmount) && newAmount !== goal.current_amount) {
                        updateGoalProgress(goal.id, newAmount);
                      }
                    }}
                    className="flex-1"
                  />
                </div>
              </div>
            );
          })}
          {goals.length === 0 && !showAddForm && (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No financial goals set yet. Start saving today!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialGoals;