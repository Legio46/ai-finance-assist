import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, TrendingDown, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import CreditCardManager from '@/components/CreditCardManager';
import CreditCardTransactions from '@/components/CreditCardTransactions';
import { calculateTax } from "@/utils/taxCalculations";
import { useLanguage } from '@/contexts/LanguageContext';

const BusinessDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [businessData, setBusinessData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    business_type: '',
    country: 'slovakia',
    annual_revenue: '',
    tax_year: new Date().getFullYear(),
  });

  const countries = [
    { value: 'slovakia', label: 'Slovakia' },
    { value: 'usa', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'germany', label: 'Germany' },
    { value: 'france', label: 'France' },
  ];

  const businessTypes = [
    'Sole Proprietorship',
    'LLC',
    'Corporation',
    'Partnership',
    'Freelancer',
    'Consultant',
    'E-commerce',
    'SaaS',
    'Other'
  ];

  useEffect(() => {
    if (user) {
      fetchBusinessData();
    }
  }, [user]);

  const fetchBusinessData = async () => {
    try {
      const { data, error } = await supabase
        .from('business_data')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBusinessData(data || []);
    } catch (error) {
      console.error('Error fetching business data:', error);
    }
  };

  const handleCalculateTax = async () => {
    if (!formData.business_name || !formData.annual_revenue) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Calculate tax using the tax calculation utility
      const taxResult = calculateTax(parseFloat(formData.annual_revenue), formData.country);
      
      const { error } = await supabase
        .from('business_data')
        .insert([{
          user_id: user?.id,
          business_name: formData.business_name,
          business_type: formData.business_type,
          country: formData.country,
          annual_revenue: parseFloat(formData.annual_revenue),
          tax_year: formData.tax_year,
          tax_rate: taxResult.taxRate,
          calculated_tax: taxResult.taxAmount,
          profit_loss: taxResult.netIncome,
        }]);

      if (error) throw error;

      toast({
        title: "Tax Calculated",
        description: `Estimated tax: $${taxResult.taxAmount.toLocaleString()} (${taxResult.taxRate.toFixed(1)}%)`,
      });

      // Reset form
      setFormData({
        business_name: '',
        business_type: '',
        country: 'slovakia',
        annual_revenue: '',
        tax_year: new Date().getFullYear(),
      });

      fetchBusinessData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to calculate tax. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = businessData.reduce((sum, item) => sum + (item.annual_revenue || 0), 0);
  const totalTax = businessData.reduce((sum, item) => sum + (item.calculated_tax || 0), 0);
  const totalProfit = businessData.reduce((sum, item) => sum + (item.profit_loss || 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all businesses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Tax</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">${totalTax.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Tax obligation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            {totalProfit >= 0 ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
              ${totalProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">After tax calculation</p>
          </CardContent>
        </Card>
      </div>

      {/* Tax Calculator */}
      <Card>
        <CardHeader>
          <CardTitle>AI Tax Calculator</CardTitle>
          <CardDescription>
            Calculate taxes for your business across different countries with AI assistance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business-name">Business Name</Label>
              <Input
                id="business-name"
                placeholder="Enter business name"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-type">Business Type</Label>
              <Select 
                value={formData.business_type} 
                onValueChange={(value) => setFormData({ ...formData, business_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select 
                value={formData.country} 
                onValueChange={(value) => setFormData({ ...formData, country: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="revenue">Annual Revenue ($)</Label>
              <Input
                id="revenue"
                type="number"
                placeholder="Enter annual revenue"
                value={formData.annual_revenue}
                onChange={(e) => setFormData({ ...formData, annual_revenue: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax-year">Tax Year</Label>
              <Input
                id="tax-year"
                type="number"
                value={formData.tax_year}
                onChange={(e) => setFormData({ ...formData, tax_year: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <Button 
            onClick={handleCalculateTax} 
            disabled={loading}
            className="w-full bg-gradient-primary hover:opacity-90"
          >
            {loading ? 'Calculating...' : 'Calculate Tax with AI'}
          </Button>
        </CardContent>
      </Card>

      {/* Credit Card Management */}
      <CreditCardManager cardType="business" />

      {/* Business History */}
      {businessData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Business Tax History</CardTitle>
            <CardDescription>
              Track your business performance and tax calculations over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {businessData.map((business) => (
                <div key={business.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{business.business_name}</h3>
                      <Badge variant="outline">{business.business_type}</Badge>
                      <Badge variant="secondary">{business.country}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Tax Year: {business.tax_year} | Rate: {business.tax_rate}%
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      ${business.annual_revenue?.toLocaleString()}
                    </div>
                    <div className="text-sm text-destructive">
                      Tax: ${business.calculated_tax?.toLocaleString()}
                    </div>
                    <div className={`text-sm ${business.profit_loss >= 0 ? 'text-success' : 'text-destructive'}`}>
                      Profit: ${business.profit_loss?.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Credit Card Transactions Section */}
      <CreditCardTransactions cardType="business" />
    </div>
  );
};

export default BusinessDashboard;