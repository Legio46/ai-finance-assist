import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, AlertCircle, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from '@/contexts/LanguageContext';

const RecurringPayments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { formatCurrency } = useLanguage();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    payment_name: '',
    amount: '',
    frequency: 'monthly',
    category: '',
    next_due_date: '',
  });

  const categories = ['Rent/Mortgage', 'Utilities', 'Subscriptions', 'Loan Payment', 'Insurance', 'School Fees', 'Other'];
  const frequencies = ['weekly', 'bi-weekly', 'monthly', 'quarterly', 'annually'];

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  const fetchPayments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('recurring_payments')
        .select('*')
        .eq('user_id', user.id)
        .order('next_due_date', { ascending: true });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching recurring payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('recurring_payments')
        .insert([
          {
            user_id: user.id,
            payment_name: formData.payment_name,
            amount: parseFloat(formData.amount),
            frequency: formData.frequency,
            category: formData.category,
            next_due_date: formData.next_due_date,
            is_active: true,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Payment Added",
        description: "Recurring payment has been set up successfully.",
      });

      setFormData({
        payment_name: '',
        amount: '',
        frequency: 'monthly',
        category: '',
        next_due_date: '',
      });
      setShowAddForm(false);
      fetchPayments();
    } catch (error) {
      console.error('Error adding payment:', error);
      toast({
        title: "Error",
        description: "Failed to add recurring payment",
        variant: "destructive",
      });
    }
  };

  const deletePayment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('recurring_payments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Payment Deleted",
        description: "The recurring payment has been removed.",
      });
      fetchPayments();
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast({
        title: "Error",
        description: "Failed to delete payment",
        variant: "destructive",
      });
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueBadge = (daysUntil: number) => {
    if (daysUntil < 0) return <Badge variant="destructive">Overdue</Badge>;
    if (daysUntil <= 3) return <Badge variant="destructive">Due Soon</Badge>;
    if (daysUntil <= 7) return <Badge className="bg-orange-500">Upcoming</Badge>;
    return <Badge variant="secondary">Scheduled</Badge>;
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
              Recurring Payments
              <Badge variant="secondary" className="text-xs">Pro</Badge>
            </CardTitle>
            <CardDescription>Track rent, loans, subscriptions, and more</CardDescription>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-gradient-primary hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            Add Payment
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddForm && (
          <form onSubmit={addPayment} className="space-y-4 border-t pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Payment Name</Label>
                <Input
                  value={formData.payment_name}
                  onChange={(e) => setFormData({...formData, payment_name: e.target.value})}
                  placeholder="e.g., Rent, Netflix"
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
              <Label>Next Due Date</Label>
              <Input
                type="date"
                value={formData.next_due_date}
                onChange={(e) => setFormData({...formData, next_due_date: e.target.value})}
                required
              />
            </div>
            <Button type="submit" className="w-full">Add Recurring Payment</Button>
          </form>
        )}

        <div className="space-y-3">
          {payments.map((payment) => {
            const daysUntil = getDaysUntilDue(payment.next_due_date);
            
            return (
              <div key={payment.id} className="flex justify-between items-center p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{payment.payment_name}</span>
                    {getDueBadge(daysUntil)}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    Due: {new Date(payment.next_due_date).toLocaleDateString()} 
                    <span>• {payment.frequency}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">{formatCurrency(payment.amount)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deletePayment(payment.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}
          {payments.length === 0 && !showAddForm && (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No recurring payments set up yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecurringPayments;