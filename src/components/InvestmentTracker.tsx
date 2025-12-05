import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from '@/contexts/LanguageContext';

const InvestmentTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { formatCurrency } = useLanguage();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    investment_name: '',
    investment_type: '',
    quantity: '',
    purchase_price: '',
    current_price: '',
    purchase_date: new Date().toISOString().split('T')[0],
  });

  const investmentTypes = ['Stocks', 'Crypto', 'ETF', 'Mutual Funds', 'Real Estate', 'Bonds', 'Other'];

  useEffect(() => {
    if (user) {
      fetchInvestments();
    }
  }, [user]);

  const fetchInvestments = async () => {
    if (!user) return;

    try {
      const { data, error } = await (supabase as any)
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvestments(data || []);
    } catch (error) {
      console.error('Error fetching investments:', error);
    } finally {
      setLoading(false);
    }
  };

  const addInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await (supabase as any)
        .from('investments')
        .insert([
          {
            user_id: user.id,
            investment_name: formData.investment_name,
            investment_type: formData.investment_type,
            quantity: parseFloat(formData.quantity),
            purchase_price: parseFloat(formData.purchase_price),
            current_price: parseFloat(formData.current_price),
            purchase_date: formData.purchase_date,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Investment Added",
        description: "Your investment has been recorded successfully.",
      });

      setFormData({
        investment_name: '',
        investment_type: '',
        quantity: '',
        purchase_price: '',
        current_price: '',
        purchase_date: new Date().toISOString().split('T')[0],
      });
      setShowAddForm(false);
      fetchInvestments();
    } catch (error) {
      console.error('Error adding investment:', error);
      toast({
        title: "Error",
        description: "Failed to add investment",
        variant: "destructive",
      });
    }
  };

  const deleteInvestment = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from('investments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Investment Deleted",
        description: "The investment has been removed.",
      });
      fetchInvestments();
    } catch (error) {
      console.error('Error deleting investment:', error);
      toast({
        title: "Error",
        description: "Failed to delete investment",
        variant: "destructive",
      });
    }
  };

  const calculatePerformance = (investment: any) => {
    const purchaseValue = investment.quantity * investment.purchase_price;
    const currentValue = investment.quantity * investment.current_price;
    const gain = currentValue - purchaseValue;
    const percentage = ((gain / purchaseValue) * 100);
    
    return {
      gain,
      percentage,
      currentValue,
      isPositive: gain >= 0
    };
  };

  const getTotalPortfolioValue = () => {
    return investments.reduce((total, inv) => {
      return total + (inv.quantity * inv.current_price);
    }, 0);
  };

  const getTotalGainLoss = () => {
    return investments.reduce((total, inv) => {
      const perf = calculatePerformance(inv);
      return total + perf.gain;
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

  const totalValue = getTotalPortfolioValue();
  const totalGainLoss = getTotalGainLoss();
  const totalGainPercentage = investments.length > 0 ? 
    (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Investment Portfolio
              <Badge variant="secondary" className="text-xs">Pro</Badge>
            </CardTitle>
            <CardDescription>Track stocks, crypto, ETFs, and more</CardDescription>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-gradient-primary hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            Add Investment
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Portfolio Value</div>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Total Gain/Loss</div>
            <div className={`text-2xl font-bold flex items-center gap-2 ${totalGainLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
              {totalGainLoss >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              {formatCurrency(Math.abs(totalGainLoss))} ({totalGainPercentage.toFixed(2)}%)
            </div>
          </div>
        </div>

        {showAddForm && (
          <form onSubmit={addInvestment} className="space-y-4 border-t pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Investment Name</Label>
                <Input
                  value={formData.investment_name}
                  onChange={(e) => setFormData({...formData, investment_name: e.target.value})}
                  placeholder="e.g., AAPL, Bitcoin"
                  required
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={formData.investment_type} onValueChange={(value) => setFormData({...formData, investment_type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {investmentTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  step="0.00001"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Purchase Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.purchase_price}
                  onChange={(e) => setFormData({...formData, purchase_price: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Current Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.current_price}
                  onChange={(e) => setFormData({...formData, current_price: e.target.value})}
                  required
                />
              </div>
            </div>
            <div>
              <Label>Purchase Date</Label>
              <Input
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
                required
              />
            </div>
            <Button type="submit" className="w-full">Add Investment</Button>
          </form>
        )}

        <div className="space-y-3">
          {investments.map((investment) => {
            const perf = calculatePerformance(investment);
            
            return (
              <div key={investment.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium">{investment.investment_name}</div>
                    <div className="text-sm text-muted-foreground">{investment.investment_type}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteInvestment(investment.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <div className="text-muted-foreground">Quantity</div>
                    <div className="font-medium">{investment.quantity}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Value</div>
                    <div className="font-medium">{formatCurrency(perf.currentValue)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Gain/Loss</div>
                    <div className={`font-medium flex items-center gap-1 ${perf.isPositive ? 'text-success' : 'text-destructive'}`}>
                      {perf.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {perf.percentage.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {investments.length === 0 && !showAddForm && (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No investments tracked yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestmentTracker;