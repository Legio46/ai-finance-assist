import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Calendar, DollarSign, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

interface CreditCard {
  id: string;
  card_name: string;
  bank_name: string;
}

interface Transaction {
  id: string;
  credit_card_id: string;
  amount: number;
  category: string;
  description: string;
  transaction_date: string;
  card_name?: string;
  bank_name?: string;
}

interface CreditCardTransactionsProps {
  cardType: 'personal' | 'business';
}

const CreditCardTransactions: React.FC<CreditCardTransactionsProps> = ({ cardType }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { formatCurrency } = useLanguage();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    credit_card_id: '',
    amount: '',
    category: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
  });

  const categories = [
    'Food & Dining',
    'Shopping',
    'Transportation',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Travel',
    'Business Expenses',
    'Office Supplies',
    'Marketing',
    'Equipment',
    'Professional Services',
    'Other'
  ];

  const fetchCreditCards = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('credit_cards')
        .select('id, card_name, bank_name')
        .eq('user_id', user.id)
        .eq('card_type', cardType)
        .eq('is_active', true);

      if (error) throw error;
      setCreditCards(data || []);
    } catch (error) {
      console.error('Error fetching credit cards:', error);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('credit_card_transactions')
        .select(`
          *,
          credit_cards!inner(card_name, bank_name, card_type)
        `)
        .eq('user_id', user.id)
        .eq('credit_cards.card_type', cardType)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      
      const formattedTransactions = data?.map(t => ({
        ...t,
        card_name: t.credit_cards?.card_name,
        bank_name: t.credit_cards?.bank_name,
      })) || [];
      
      setTransactions(formattedTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCreditCards();
      fetchTransactions();
    }
  }, [user, cardType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('credit_card_transactions')
        .insert({
          user_id: user.id,
          credit_card_id: formData.credit_card_id,
          amount: parseFloat(formData.amount),
          category: formData.category,
          description: formData.description,
          transaction_date: formData.transaction_date,
        });

      if (error) throw error;

      toast({
        title: "Transaction added",
        description: "Your credit card transaction has been recorded successfully.",
      });

      setFormData({
        credit_card_id: '',
        amount: '',
        category: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0],
      });

      setIsDialogOpen(false);
      fetchTransactions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading transactions...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Credit Card Transactions</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={creditCards.length === 0}>
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Credit Card Transaction</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="credit_card_id">Credit Card</Label>
                <Select value={formData.credit_card_id} onValueChange={(value) => setFormData({...formData, credit_card_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a credit card" />
                  </SelectTrigger>
                  <SelectContent>
                    {creditCards.map((card) => (
                      <SelectItem key={card.id} value={card.id}>
                        {card.card_name} - {card.bank_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="transaction_date">Date</Label>
                <Input
                  id="transaction_date"
                  type="date"
                  value={formData.transaction_date}
                  onChange={(e) => setFormData({...formData, transaction_date: e.target.value})}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Add Transaction
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {creditCards.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              Add a credit card first to track transactions
            </p>
          </CardContent>
        </Card>
      ) : transactions.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              No transactions recorded yet. Add your first transaction to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <Card key={transaction.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold">{formatCurrency(transaction.amount)}</span>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm font-medium">{transaction.card_name}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <Tag className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm text-primary">{transaction.category}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{transaction.description}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CreditCardTransactions;