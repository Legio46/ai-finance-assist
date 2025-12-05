import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, DollarSign, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from '@/contexts/LanguageContext';

const IncomeTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { formatCurrency } = useLanguage();
  const [incomeSources, setIncomeSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    source_name: '',
    amount: '',
    frequency: 'monthly',
    category: '',
    start_date: new Date().toISOString().split('T')[0],
  });

  const categories = ['Salary', 'Freelance', 'Business', 'Investments', 'Rental', 'Other'];
  const frequencies = ['weekly', 'bi-weekly', 'monthly', 'quarterly', 'annually', 'one-time'];

  useEffect(() => {
    if (user) {
      fetchIncomeSources();
    }
  }, [user]);

  const fetchIncomeSources = async () => {
    if (!user) return;

    try {
      const { data, error } = await (supabase as any)
        .from('income_sources')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIncomeSources(data || []);
    } catch (error) {
      console.error('Error fetching income sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const addIncomeSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await (supabase as any)
        .from('income_sources')
        .insert([
          {
            user_id: user.id,
            source_name: formData.source_name,
            amount: parseFloat(formData.amount),
            frequency: formData.frequency,
            category: formData.category,
            start_date: formData.start_date,
            is_active: true,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Income Source Added",
        description: "Your income source has been recorded successfully.",
      });

      setFormData({
        source_name: '',
        amount: '',
        frequency: 'monthly',
        category: '',
        start_date: new Date().toISOString().split('T')[0],
      });
      setShowAddForm(false);
      fetchIncomeSources();
    } catch (error) {
      console.error('Error adding income source:', error);
      toast({
        title: "Error",
        description: "Failed to add income source",
        variant: "destructive",
      });
    }
  };

  const deleteIncomeSource = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from('income_sources')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Income Source Deleted",
        description: "The income source has been removed.",
      });
      fetchIncomeSources();
    } catch (error) {
      console.error('Error deleting income source:', error);
      toast({
        title: "Error",
        description: "Failed to delete income source",
        variant: "destructive",
      });
    }
  };

  const calculateMonthlyIncome = () => {
    return incomeSources.reduce((total, source) => {
      if (!source.is_active) return total;
      
      const amount = parseFloat(source.amount);
      switch (source.frequency) {
        case 'weekly': return total + (amount * 4.33);
        case 'bi-weekly': return total + (amount * 2.17);
        case 'monthly': return total + amount;
        case 'quarterly': return total + (amount / 3);
        case 'annually': return total + (amount / 12);
        default: return total;
      }
    }, 0);
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
            <CardTitle>Income Sources</CardTitle>
            <CardDescription>Track all your income streams</CardDescription>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-gradient-primary hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            Add Income
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Monthly Income</span>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-success" />
              <span className="text-2xl font-bold text-success">{formatCurrency(calculateMonthlyIncome())}</span>
            </div>
          </div>
        </div>

        {showAddForm && (
          <form onSubmit={addIncomeSource} className="space-y-4 border-t pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Source Name</Label>
                <Input
                  value={formData.source_name}
                  onChange={(e) => setFormData({...formData, source_name: e.target.value})}
                  placeholder="e.g., Main Job"
                  required
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Frequency</Label>
                <Select value={formData.frequency} onValueChange={(value) => setFormData({...formData, frequency: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencies.map((freq) => (
                      <SelectItem key={freq} value={freq}>{freq.charAt(0).toUpperCase() + freq.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                required
              />
            </div>
            <Button type="submit" className="w-full">Add Income Source</Button>
          </form>
        )}

        <div className="space-y-2">
          {incomeSources.map((source) => (
            <div key={source.id} className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <div className="font-medium">{source.source_name}</div>
                <div className="text-sm text-muted-foreground">
                  {source.category} • {source.frequency}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-success">{formatCurrency(source.amount)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteIncomeSource(source.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          {incomeSources.length === 0 && !showAddForm && (
            <p className="text-center text-muted-foreground py-4">No income sources added yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default IncomeTracker;