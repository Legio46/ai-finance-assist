import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Plus, Trash2, Edit } from 'lucide-react';

interface CreditCardData {
  id: string;
  card_name: string;
  last_four_digits: string;
  card_type: string;
  bank_name: string;
  credit_limit: number;
  current_balance: number;
  due_date: string;
  apr: number;
  is_active: boolean;
}

interface CreditCardManagerProps {
  cardType: 'personal' | 'business';
}

const CreditCardManager: React.FC<CreditCardManagerProps> = ({ cardType }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cards, setCards] = useState<CreditCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCardData | null>(null);

  const [formData, setFormData] = useState({
    card_name: '',
    last_four_digits: '',
    bank_name: '',
    credit_limit: '',
    current_balance: '',
    due_date: '',
    apr: '',
  });

  const fetchCards = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', user.id)
        .eq('card_type', cardType)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCards(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch credit cards",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [user, cardType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const cardData = {
        user_id: user.id,
        card_name: formData.card_name,
        last_four_digits: formData.last_four_digits,
        card_type: cardType,
        bank_name: formData.bank_name,
        credit_limit: parseFloat(formData.credit_limit) || 0,
        current_balance: parseFloat(formData.current_balance) || 0,
        due_date: formData.due_date || null,
        apr: parseFloat(formData.apr) || 0,
      };

      if (editingCard) {
        const { error } = await supabase
          .from('credit_cards')
          .update(cardData)
          .eq('id', editingCard.id);
        if (error) throw error;
        toast({
          title: "Success",
          description: "Credit card updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('credit_cards')
          .insert([cardData]);
        if (error) throw error;
        toast({
          title: "Success",
          description: "Credit card added successfully",
        });
      }

      setFormData({
        card_name: '',
        last_four_digits: '',
        bank_name: '',
        credit_limit: '',
        current_balance: '',
        due_date: '',
        apr: '',
      });
      setEditingCard(null);
      setIsDialogOpen(false);
      fetchCards();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (card: CreditCardData) => {
    setEditingCard(card);
    setFormData({
      card_name: card.card_name,
      last_four_digits: card.last_four_digits,
      bank_name: card.bank_name || '',
      credit_limit: card.credit_limit?.toString() || '',
      current_balance: card.current_balance?.toString() || '',
      due_date: card.due_date || '',
      apr: card.apr?.toString() || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (cardId: string) => {
    try {
      const { error } = await supabase
        .from('credit_cards')
        .update({ is_active: false })
        .eq('id', cardId);

      if (error) throw error;
      toast({
        title: "Success",
        description: "Credit card removed successfully",
      });
      fetchCards();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading credit cards...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold capitalize">{cardType} Credit Cards</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingCard(null);
              setFormData({
                card_name: '',
                last_four_digits: '',
                bank_name: '',
                credit_limit: '',
                current_balance: '',
                due_date: '',
                apr: '',
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Card
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCard ? 'Edit' : 'Add'} {cardType} Credit Card
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="card_name">Card Name</Label>
                <Input
                  id="card_name"
                  value={formData.card_name}
                  onChange={(e) => setFormData({ ...formData, card_name: e.target.value })}
                  placeholder="e.g., Chase Sapphire Preferred"
                  required
                />
              </div>
              <div>
                <Label htmlFor="last_four_digits">Last 4 Digits</Label>
                <Input
                  id="last_four_digits"
                  value={formData.last_four_digits}
                  onChange={(e) => setFormData({ ...formData, last_four_digits: e.target.value })}
                  placeholder="1234"
                  maxLength={4}
                  required
                />
              </div>
              <div>
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  value={formData.bank_name}
                  onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  placeholder="e.g., Chase Bank"
                />
              </div>
              <div>
                <Label htmlFor="credit_limit">Credit Limit ($)</Label>
                <Input
                  id="credit_limit"
                  type="number"
                  value={formData.credit_limit}
                  onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
                  placeholder="5000"
                />
              </div>
              <div>
                <Label htmlFor="current_balance">Current Balance ($)</Label>
                <Input
                  id="current_balance"
                  type="number"
                  value={formData.current_balance}
                  onChange={(e) => setFormData({ ...formData, current_balance: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="apr">APR (%)</Label>
                <Input
                  id="apr"
                  type="number"
                  step="0.01"
                  value={formData.apr}
                  onChange={(e) => setFormData({ ...formData, apr: e.target.value })}
                  placeholder="19.99"
                />
              </div>
              <Button type="submit" className="w-full">
                {editingCard ? 'Update' : 'Add'} Card
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {cards.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No credit cards added yet</p>
            </CardContent>
          </Card>
        ) : (
          cards.map((card) => (
            <Card key={card.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{card.card_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      •••• {card.last_four_digits} • {card.bank_name}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(card)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(card.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Balance</p>
                    <p className="font-medium">${card.current_balance?.toLocaleString() || '0'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Limit</p>
                    <p className="font-medium">${card.credit_limit?.toLocaleString() || '0'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">APR</p>
                    <p className="font-medium">{card.apr || 0}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Due Date</p>
                    <p className="font-medium">{card.due_date || 'Not set'}</p>
                  </div>
                </div>
                {card.credit_limit && card.current_balance !== null && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Utilization</span>
                      <span>{((card.current_balance / card.credit_limit) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min((card.current_balance / card.credit_limit) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CreditCardManager;