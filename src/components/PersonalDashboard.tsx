import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, CreditCard, TrendingUp, TrendingDown, PieChart, Camera, Upload, X, Eye, Wallet, Target, Calendar, LineChart, RefreshCcw, ArrowLeft, ChevronRight, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import CreditCardManager from '@/components/CreditCardManager';
import CreditCardTransactions from '@/components/CreditCardTransactions';
import { useLanguage } from '@/contexts/LanguageContext';
import IncomeTracker from '@/components/IncomeTracker';
import BudgetManager from '@/components/BudgetManager';
import RecurringPayments from '@/components/RecurringPayments';
import InvestmentTracker from '@/components/InvestmentTracker';
import FinancialGoals from '@/components/FinancialGoals';
import FinancialCalendar from '@/components/FinancialCalendar';

type CategoryView = 'overview' | 'expenses' | 'credit-cards' | 'income-budget' | 'recurring-payments' | 'investments' | 'goals' | 'calendar';

const PersonalDashboard = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const { formatCurrency } = useLanguage();
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [activeView, setActiveView] = useState<CategoryView>('overview');
  
  // Check if user has Pro features (only personal_pro tier gets Pro features)
  const isOnTrial = profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date();
  const hasBasicFeatures = Boolean(
    profile?.subscription_tier === 'personal_basic' ||
    profile?.subscription_tier === 'personal_pro' ||
    profile?.subscription_tier === 'business' ||
    isOnTrial ||
    profile?.subscription_status === 'active'
  );
  const hasProFeatures = Boolean(
    profile?.subscription_tier === 'personal_pro' ||
    profile?.subscription_tier === 'business' ||
    isOnTrial
  );
  
  console.log('Profile:', profile);
  console.log('Has Basic Features:', hasBasicFeatures, 'Has Pro Features:', hasProFeatures, 'Tier:', profile?.subscription_tier, 'Status:', profile?.subscription_status);

  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    is_recurring: false,
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
      fetchExpenses();
    }
  }, [user]);

  const fetchExpenses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('personal_expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching expenses:', error);
        return;
      }

      setExpenses(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReceiptCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
  };

  const uploadReceipt = async (expenseId: string) => {
    if (!receiptFile || !user) return null;

    try {
      const fileExt = receiptFile.name.split('.').pop();
      const fileName = `${user.id}/${expenseId}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, receiptFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading receipt:', error);
      return null;
    }
  };

  const addExpense = async (e) => {
    e.preventDefault();
    if (!user) return;

    if (formData.amount && formData.category) {
      setUploadingReceipt(true);
      try {
        const { data: newExpense, error } = await supabase
          .from('personal_expenses')
          .insert([
            {
              user_id: user.id,
              category: formData.category,
              amount: parseFloat(formData.amount),
              description: formData.description,
              date: formData.date,
              is_recurring: formData.is_recurring,
            }
          ])
          .select()
          .single();

        if (error) {
          console.error('Error adding expense:', error);
          toast({
            title: "Error",
            description: "Failed to add expense",
            variant: "destructive",
          });
          return;
        }

        if (receiptFile && newExpense) {
          const receiptUrl = await uploadReceipt(newExpense.id);
          if (receiptUrl) {
            await supabase
              .from('personal_expenses')
              .update({ receipt_image_url: receiptUrl })
              .eq('id', newExpense.id);
          }
        }

        toast({
          title: "Expense Added",
          description: receiptFile ? "Expense and receipt saved successfully." : "Your expense has been recorded successfully.",
        });

        setFormData({
          category: '',
          amount: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          is_recurring: false,
        });
        removeReceipt();
        setShowAddForm(false);
        fetchExpenses();
      } catch (error) {
        console.error('Error adding expense:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setUploadingReceipt(false);
      }
    }
  };

  // Calculate current month total
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });
  
  const currentMonthTotal = currentMonthExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

  // Calculate last month total for comparison
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  const lastMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === lastMonth && expenseDate.getFullYear() === lastMonthYear;
  });
  
  const lastMonthTotal = lastMonthExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  const monthlyChange = lastMonthTotal > 0 ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

  // Calculate category breakdown
  const categoryTotals = currentMonthExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + parseFloat(expense.amount);
    return acc;
  }, {});

  const topCategories = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => Number(b) - Number(a))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Loading personal dashboard...</p>
      </div>
    );
  }

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const currentDay = currentDate.getDate();
  const averageDaily = currentDay > 0 ? Number(currentMonthTotal) / Number(currentDay) : 0;

  // Category cards data
  const basicCategories = [
    { 
      id: 'expenses' as CategoryView, 
      icon: Wallet, 
      title: 'Expense Tracking', 
      description: 'Track and categorize your daily spending',
      badge: 'Personal Basic',
      locked: false
    },
    { 
      id: 'credit-cards' as CategoryView, 
      icon: CreditCard, 
      title: 'Credit Cards', 
      description: 'Manage your credit cards and transactions',
      badge: 'Personal Basic',
      locked: false
    },
    { 
      id: 'income-budget' as CategoryView, 
      icon: TrendingUp, 
      title: 'Income & Budget', 
      description: 'Track your income sources and manage budgets',
      badge: 'Personal Basic',
      locked: false
    },
  ];

  const proCategories = [
    { 
      id: 'recurring-payments' as CategoryView, 
      icon: RefreshCcw, 
      title: 'Recurring Payments', 
      description: 'Track subscriptions, bills, and recurring expenses',
      badge: 'Personal Pro',
      locked: !hasProFeatures
    },
    { 
      id: 'investments' as CategoryView, 
      icon: LineChart, 
      title: 'Investment Portfolio', 
      description: 'Track and manage your investment holdings',
      badge: 'Personal Pro',
      locked: !hasProFeatures
    },
    { 
      id: 'goals' as CategoryView, 
      icon: Target, 
      title: 'Financial Goals', 
      description: 'Set and track your savings and financial goals',
      badge: 'Personal Pro',
      locked: !hasProFeatures
    },
    { 
      id: 'calendar' as CategoryView, 
      icon: Calendar, 
      title: 'Financial Calendar', 
      description: 'View bills, paydays, and important financial dates',
      badge: 'Personal Pro',
      locked: !hasProFeatures
    },
  ];

  const handleCategoryClick = (category: typeof basicCategories[0]) => {
    if (category.locked) {
      toast({
        title: "Pro Feature",
        description: "Upgrade to Personal Pro to access this feature.",
        variant: "default",
      });
      return;
    }
    setActiveView(category.id);
  };

  // Render category card
  const CategoryCard = ({ category }: { category: typeof basicCategories[0] }) => {
    const Icon = category.icon;
    return (
      <Card 
        className={`cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 ${category.locked ? 'opacity-60' : ''}`}
        onClick={() => handleCategoryClick(category)}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${category.locked ? 'bg-muted' : 'bg-primary/10'}`}>
                {category.locked ? (
                  <Lock className="w-6 h-6 text-muted-foreground" />
                ) : (
                  <Icon className="w-6 h-6 text-primary" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{category.title}</h3>
                  <Badge variant={category.badge === 'Personal Pro' ? 'default' : 'secondary'} className="text-xs">
                    {category.badge}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 ${category.locked ? 'text-muted-foreground' : 'text-primary'}`} />
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render the active view content
  const renderActiveView = () => {
    switch (activeView) {
      case 'expenses':
        return (
          <div className="space-y-6">
            {/* Add Expense Form */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Personal Expenses</CardTitle>
                    <CardDescription>Track your personal spending and get insights</CardDescription>
                  </div>
                  <Button 
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Expense
                  </Button>
                </div>
              </CardHeader>
              {showAddForm && (
                <CardContent className="border-t pt-6">
                  <form onSubmit={addExpense} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Category</Label>
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
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Optional description"
                      />
                    </div>
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        required
                      />
                    </div>
                    
                    {/* Receipt Upload */}
                    <div>
                      <Label>Receipt Image (Optional)</Label>
                      <div className="flex gap-2 mt-2">
                        <label htmlFor="camera-input" className="flex-1">
                          <div className="flex items-center justify-center gap-2 px-4 py-2 border border-input rounded-md cursor-pointer hover:bg-accent transition-colors">
                            <Camera className="w-4 h-4" />
                            <span className="text-sm">Camera</span>
                          </div>
                          <input
                            id="camera-input"
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleReceiptCapture}
                            className="hidden"
                          />
                        </label>
                        
                        <label htmlFor="file-input" className="flex-1">
                          <div className="flex items-center justify-center gap-2 px-4 py-2 border border-input rounded-md cursor-pointer hover:bg-accent transition-colors">
                            <Upload className="w-4 h-4" />
                            <span className="text-sm">Upload</span>
                          </div>
                          <input
                            id="file-input"
                            type="file"
                            accept="image/*"
                            onChange={handleReceiptCapture}
                            className="hidden"
                          />
                        </label>
                      </div>
                      
                      {receiptPreview && (
                        <div className="mt-2 relative">
                          <img 
                            src={receiptPreview} 
                            alt="Receipt preview" 
                            className="w-full h-32 object-cover rounded-md border border-input"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={removeReceipt}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <Button type="submit" className="w-full" disabled={uploadingReceipt}>
                      {uploadingReceipt ? "Saving..." : "Add Expense"}
                    </Button>
                  </form>
                </CardContent>
              )}
            </Card>

            {/* Category Breakdown */}
            {topCategories.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Spending Breakdown</CardTitle>
                  <CardDescription>Your top spending categories this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topCategories.map(([category, amount]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{category}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-secondary rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${(Number(amount) / currentMonthTotal) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold">{formatCurrency(Number(amount))}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Expenses */}
            {expenses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Expenses</CardTitle>
                  <CardDescription>Your latest spending activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {expenses.slice(0, 10).map((expense) => (
                      <div key={expense.id} className="flex justify-between items-center gap-4 py-2 border-b border-border last:border-0">
                        <div className="flex items-center gap-3 flex-1">
                          {expense.receipt_image_url && (
                            <div className="relative group">
                              <img 
                                src={expense.receipt_image_url} 
                                alt="Receipt" 
                                className="w-12 h-12 object-cover rounded border border-input cursor-pointer"
                                onClick={() => window.open(expense.receipt_image_url, '_blank')}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                                <Eye className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{expense.category}</div>
                            <div className="text-sm text-muted-foreground">{expense.description || 'No description'}</div>
                            <div className="text-xs text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{formatCurrency(expense.amount)}</div>
                          {expense.is_recurring && (
                            <Badge variant="secondary" className="text-xs">Recurring</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {expenses.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <CreditCard className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Expenses Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start tracking your expenses to get AI-powered insights and recommendations
                  </p>
                  <Button 
                    onClick={() => setShowAddForm(true)}
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    Add Your First Expense
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'credit-cards':
        return (
          <div className="space-y-6">
            <CreditCardManager cardType="personal" />
            <CreditCardTransactions cardType="personal" />
          </div>
        );

      case 'income-budget':
        return (
          <div className="space-y-6">
            <IncomeTracker />
            <BudgetManager />
          </div>
        );

      case 'recurring-payments':
        return <RecurringPayments />;

      case 'investments':
        return <InvestmentTracker />;

      case 'goals':
        return <FinancialGoals />;

      case 'calendar':
        return <FinancialCalendar />;

      default:
        return null;
    }
  };

  // If viewing a specific category, show that view with back button
  if (activeView !== 'overview') {
    const allCategories = [...basicCategories, ...proCategories];
    const currentCategory = allCategories.find(c => c.id === activeView);
    const Icon = currentCategory?.icon || Wallet;
    
    return (
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setActiveView('overview')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">{currentCategory?.title}</h1>
              <p className="text-sm text-muted-foreground">{currentCategory?.description}</p>
            </div>
          </div>
        </div>

        {/* Active view content */}
        {renderActiveView()}
      </div>
    );
  }

  // Overview with category cards
  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentMonthTotal)}</div>
            <p className="text-xs text-muted-foreground">
              {monthlyChange > 0 ? (
                <span className="text-destructive">+{monthlyChange.toFixed(1)}%</span>
              ) : monthlyChange < 0 ? (
                <span className="text-success">{monthlyChange.toFixed(1)}%</span>
              ) : (
                <span>No change</span>
              )} from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageDaily)}</div>
            <p className="text-xs text-muted-foreground">
              Based on current month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {topCategories.length > 0 ? topCategories[0][0] : 'None'}
            </div>
            <p className="text-xs text-muted-foreground">
              {topCategories.length > 0 ? formatCurrency(Number(topCategories[0][1])) : 'No expenses yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Personal Basic Categories */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Personal Basic</h2>
          <Badge variant="secondary">Included</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {basicCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>

      {/* Personal Pro Categories */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Personal Pro</h2>
          <Badge variant="default">Pro Features</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {proCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>

      {/* Upgrade CTA for non-pro users */}
      {!hasProFeatures && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Unlock Pro Features
              <Badge variant="default">Personal Pro</Badge>
            </CardTitle>
            <CardDescription>
              Upgrade to Personal Pro to access advanced features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Recurring payment tracking with due-date reminders</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Investment portfolio tracking with live prices</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Financial goals with progress tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Financial calendar with bills, paydays & events</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>AI financial advisor & advanced planning tools</span>
              </div>
            </div>
            <Button className="w-full bg-gradient-primary hover:opacity-90 mt-4">
              Upgrade to Personal Pro - €10/month
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PersonalDashboard;
