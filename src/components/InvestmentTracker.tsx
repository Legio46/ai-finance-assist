import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, TrendingDown, Trash2, RefreshCw, Wifi, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from '@/contexts/LanguageContext';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

interface AssetPrice {
  price_eur: number;
  price_usd: number;
  change_24h: number;
  last_updated: number;
  chart_7d?: number[][];
  name?: string;
}

interface LivePrices {
  [symbol: string]: AssetPrice;
}

const InvestmentTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { formatCurrency } = useLanguage();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [livePrices, setLivePrices] = useState<LivePrices>({});
  const [fetchingPrices, setFetchingPrices] = useState(false);
  const [fetchingFormPrice, setFetchingFormPrice] = useState(false);
  const [lastPriceUpdate, setLastPriceUpdate] = useState<Date | null>(null);
  const [formData, setFormData] = useState({
    investment_name: '',
    investment_type: '',
    quantity: '',
    purchase_price: '',
    current_price: '',
    purchase_date: new Date().toISOString().split('T')[0],
  });

  const investmentTypes = ['Stocks', 'Crypto', 'ETF', 'Mutual Funds', 'Real Estate', 'Bonds', 'Other'];

  // Popular crypto symbols for suggestions
  const popularCryptos = ['BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOGE', 'DOT', 'MATIC', 'LINK', 'AVAX'];
  
  // Popular stock symbols for suggestions
  const popularStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'JPM', 'V', 'WMT'];

  useEffect(() => {
    if (user) {
      fetchInvestments();
    }
  }, [user]);

  // Fetch live prices when investments change (silently, no toasts)
  useEffect(() => {
    const cryptoInvestments = investments.filter(inv => inv.investment_type === 'Crypto');
    const stockInvestments = investments.filter(inv => inv.investment_type === 'Stocks');
    
    if (cryptoInvestments.length > 0) {
      fetchLivePrices(cryptoInvestments, 'Crypto', true);
    }
    if (stockInvestments.length > 0) {
      fetchLivePrices(stockInvestments, 'Stocks', true);
    }
  }, [investments.length]); // Only trigger on length change, not every re-render

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

  const fetchLivePrices = useCallback(async (assetInvestments: any[], type: 'Crypto' | 'Stocks', silent: boolean = false) => {
    if (assetInvestments.length === 0) return;

    setFetchingPrices(true);
    try {
      // Extract symbols from investment names
      const symbols = assetInvestments.map(inv => {
        const name = inv.investment_name.toUpperCase().trim();
        if (type === 'Crypto') {
          if (name.includes('BITCOIN') || name === 'BTC') return 'BTC';
          if (name.includes('ETHEREUM') || name === 'ETH') return 'ETH';
          if (name.includes('SOLANA') || name === 'SOL') return 'SOL';
        }
        return name.split(' ')[0];
      });

      const uniqueSymbols = [...new Set(symbols)];
      const endpoint = type === 'Crypto' ? 'crypto-prices' : 'stock-prices';
      console.log(`Fetching ${type} prices for symbols:`, uniqueSymbols);

      const response = await supabase.functions.invoke(endpoint, {
        body: { symbols: uniqueSymbols }
      });

      console.log(`${type} prices response:`, response);

      if (response.error) {
        console.error(`Error fetching ${type} prices:`, response.error);
        if (!silent) {
          toast({
            title: "Price Update Failed",
            description: response.error.message || `Could not fetch live ${type} prices. Please try again.`,
            variant: "destructive",
          });
        }
        return;
      }

      if (response.data?.prices) {
        setLivePrices(prev => ({ ...prev, ...response.data.prices }));
        setLastPriceUpdate(new Date());
        
        // Update investments with live prices (silently, don't re-fetch)
        await updateInvestmentPrices(assetInvestments, response.data.prices, silent);
        
      } else if (response.data?.error) {
        console.error('API returned error:', response.data.error);
        if (!silent) {
          toast({
            title: "Price Update Failed",
            description: response.data.error,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error fetching live prices:', error);
      if (!silent) {
        toast({
          title: "Connection Error",
          description: "Could not connect to price service. Please check your connection and try again.",
          variant: "destructive",
        });
      }
    } finally {
      setFetchingPrices(false);
    }
  }, [toast]);

  const updateInvestmentPrices = async (cryptoInvestments: any[], prices: LivePrices, silent: boolean = false) => {
    let updated = false;
    for (const inv of cryptoInvestments) {
      const symbol = getSymbolFromName(inv.investment_name);
      const priceData = prices[symbol];
      
      if (priceData && priceData.price_eur !== inv.current_price) {
        // Update the investment with the live price
        await (supabase as any)
          .from('investments')
          .update({ current_price: priceData.price_eur })
          .eq('id', inv.id);
        updated = true;
      }
    }
    
    // Only refresh if something was updated and not in silent mode
    if (updated && !silent) {
      fetchInvestments();
    }
  };

  const getSymbolFromName = (name: string): string => {
    const upperName = name.toUpperCase().trim();
    if (upperName.includes('BITCOIN') || upperName === 'BTC') return 'BTC';
    if (upperName.includes('ETHEREUM') || upperName === 'ETH') return 'ETH';
    if (upperName.includes('SOLANA') || upperName === 'SOL') return 'SOL';
    if (upperName.includes('RIPPLE') || upperName === 'XRP') return 'XRP';
    if (upperName.includes('CARDANO') || upperName === 'ADA') return 'ADA';
    if (upperName.includes('DOGECOIN') || upperName === 'DOGE') return 'DOGE';
    if (upperName.includes('POLKADOT') || upperName === 'DOT') return 'DOT';
    if (upperName.includes('CHAINLINK') || upperName === 'LINK') return 'LINK';
    return upperName.split(' ')[0];
  };

  const getLivePrice = (investment: any): AssetPrice | null => {
    if (investment.investment_type !== 'Crypto' && investment.investment_type !== 'Stocks') return null;
    const symbol = getSymbolFromName(investment.investment_name);
    return livePrices[symbol] || null;
  };

  // Auto-fetch price when investment name changes for Crypto or Stocks
  const fetchSingleAssetPrice = useCallback(async (symbol: string, type: string) => {
    if (!symbol || (type !== 'Crypto' && type !== 'Stocks')) return;
    
    setFetchingFormPrice(true);
    try {
      const endpoint = type === 'Crypto' ? 'crypto-prices' : 'stock-prices';
      const response = await supabase.functions.invoke(endpoint, {
        body: { symbols: [symbol.toUpperCase()] }
      });

      if (response.data?.prices) {
        const symbolKey = symbol.toUpperCase();
        const priceData = response.data.prices[symbolKey];
        
        if (priceData) {
          setFormData(prev => ({
            ...prev,
            current_price: priceData.price_eur.toFixed(2)
          }));
          toast({
            title: "Price Fetched",
            description: `Current price: €${priceData.price_eur.toFixed(2)}`,
          });
        } else {
          toast({
            title: "Symbol Not Found",
            description: `Could not find price for ${symbol}`,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error fetching single asset price:', error);
    } finally {
      setFetchingFormPrice(false);
    }
  }, [toast]);

  const handleRefreshPrices = async () => {
    const cryptoInvestments = investments.filter(inv => inv.investment_type === 'Crypto');
    const stockInvestments = investments.filter(inv => inv.investment_type === 'Stocks');
    
    if (cryptoInvestments.length > 0 || stockInvestments.length > 0) {
      toast({
        title: "Refreshing Prices",
        description: "Fetching latest prices...",
      });
      
      // Fetch prices without showing individual toasts
      if (cryptoInvestments.length > 0) {
        await fetchLivePrices(cryptoInvestments, 'Crypto', true);
      }
      if (stockInvestments.length > 0) {
        await fetchLivePrices(stockInvestments, 'Stocks', true);
      }
      
      // Refresh investments to show updated prices
      await fetchInvestments();
      
      toast({
        title: "Prices Updated",
        description: "All prices have been refreshed",
      });
    } else {
      toast({
        title: "No Tracked Assets",
        description: "Add crypto or stock investments to see live prices",
      });
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

  // Group investments by type
  const getInvestmentsByType = () => {
    const grouped: { [key: string]: any[] } = {};
    investments.forEach(inv => {
      const type = inv.investment_type;
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(inv);
    });
    return grouped;
  };

  // Calculate totals for a specific type
  const getTypeStats = (typeInvestments: any[]) => {
    const totalValue = typeInvestments.reduce((total, inv) => {
      return total + (inv.quantity * inv.current_price);
    }, 0);
    
    const totalGainLoss = typeInvestments.reduce((total, inv) => {
      const perf = calculatePerformance(inv);
      return total + perf.gain;
    }, 0);
    
    const totalPurchaseValue = typeInvestments.reduce((total, inv) => {
      return total + (inv.quantity * inv.purchase_price);
    }, 0);
    
    const percentage = totalPurchaseValue > 0 ? (totalGainLoss / totalPurchaseValue) * 100 : 0;
    
    return { totalValue, totalGainLoss, percentage };
  };

  // Get icon and color for investment type
  const getTypeConfig = (type: string) => {
    const configs: { [key: string]: { color: string; bgColor: string } } = {
      'Crypto': { color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
      'Stocks': { color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
      'Real Estate': { color: 'text-green-500', bgColor: 'bg-green-500/10' },
      'ETF': { color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
      'Mutual Funds': { color: 'text-indigo-500', bgColor: 'bg-indigo-500/10' },
      'Bonds': { color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' },
      'Other': { color: 'text-gray-500', bgColor: 'bg-gray-500/10' },
    };
    return configs[type] || configs['Other'];
  };

  // Format chart data for sparkline
  const formatChartData = (chartData: number[][] | undefined) => {
    if (!chartData || chartData.length === 0) return [];
    // Sample every 6th point to reduce data points (7 days = ~168 points)
    return chartData
      .filter((_, i) => i % 6 === 0)
      .map(([timestamp, price]) => ({ time: timestamp, price }));
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

  const hasCryptoInvestments = investments.some(inv => inv.investment_type === 'Crypto');
  const hasStockInvestments = investments.some(inv => inv.investment_type === 'Stocks');
  const hasLiveAssets = hasCryptoInvestments || hasStockInvestments;
  const investmentsByType = getInvestmentsByType();

  // Handler for quick symbol selection that auto-fetches price
  const handleQuickSymbolSelect = (symbol: string) => {
    setFormData(prev => ({ ...prev, investment_name: symbol }));
    if (formData.investment_type === 'Crypto' || formData.investment_type === 'Stocks') {
      fetchSingleAssetPrice(symbol, formData.investment_type);
    }
  };
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Investment Portfolio
              <Badge variant="secondary" className="text-xs">Pro</Badge>
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              Track stocks, crypto, ETFs, and more
              {lastPriceUpdate && (
                <span className="text-xs flex items-center gap-1">
                  <Wifi className="w-3 h-3 text-success" />
                  Updated {lastPriceUpdate.toLocaleTimeString()}
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {hasLiveAssets && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshPrices}
                disabled={fetchingPrices}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${fetchingPrices ? 'animate-spin' : ''}`} />
                {fetchingPrices ? 'Updating...' : 'Refresh Prices'}
              </Button>
            )}
            <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-gradient-primary hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Add Investment
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Portfolio Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Total Portfolio Value</div>
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

        {/* Category Breakdown */}
        {Object.keys(investmentsByType).length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(investmentsByType).map(([type, typeInvestments]) => {
              const stats = getTypeStats(typeInvestments);
              const config = getTypeConfig(type);
              return (
                <div key={type} className={`p-3 rounded-lg border ${config.bgColor}`}>
                  <div className={`text-sm font-medium ${config.color} mb-1`}>{type}</div>
                  <div className="text-lg font-bold">{formatCurrency(stats.totalValue)}</div>
                  <div className={`text-xs flex items-center gap-1 ${stats.totalGainLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {stats.totalGainLoss >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {stats.totalGainLoss >= 0 ? '+' : ''}{formatCurrency(stats.totalGainLoss)} ({stats.percentage.toFixed(1)}%)
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {typeInvestments.length} {typeInvestments.length === 1 ? 'asset' : 'assets'}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showAddForm && (
          <form onSubmit={addInvestment} className="space-y-4 border-t pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Investment Name / Symbol</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.investment_name}
                    onChange={(e) => setFormData({...formData, investment_name: e.target.value.toUpperCase()})}
                    placeholder={formData.investment_type === 'Crypto' ? 'e.g., BTC, ETH' : formData.investment_type === 'Stocks' ? 'e.g., AAPL, MSFT' : 'Investment name'}
                    required
                  />
                  {(formData.investment_type === 'Crypto' || formData.investment_type === 'Stocks') && formData.investment_name && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fetchSingleAssetPrice(formData.investment_name, formData.investment_type)}
                      disabled={fetchingFormPrice}
                    >
                      {fetchingFormPrice ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Fetch Price'}
                    </Button>
                  )}
                </div>
                {formData.investment_type === 'Crypto' && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {popularCryptos.slice(0, 5).map(symbol => (
                      <Button
                        key={symbol}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => handleQuickSymbolSelect(symbol)}
                        disabled={fetchingFormPrice}
                      >
                        {symbol}
                      </Button>
                    ))}
                  </div>
                )}
                {formData.investment_type === 'Stocks' && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {popularStocks.slice(0, 5).map(symbol => (
                      <Button
                        key={symbol}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => handleQuickSymbolSelect(symbol)}
                        disabled={fetchingFormPrice}
                      >
                        {symbol}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <Label>Type</Label>
                <Select value={formData.investment_type} onValueChange={(value) => {
                  setFormData({...formData, investment_type: value, current_price: ''});
                }}>
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
                <Label>Purchase Price (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.purchase_price}
                  onChange={(e) => setFormData({...formData, purchase_price: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  Current Price (€)
                  {fetchingFormPrice && <Loader2 className="w-3 h-3 animate-spin" />}
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.current_price}
                  onChange={(e) => setFormData({...formData, current_price: e.target.value})}
                  placeholder={(formData.investment_type === 'Crypto' || formData.investment_type === 'Stocks') ? 'Auto-fetched' : 'Enter price'}
                  required
                  className={fetchingFormPrice ? 'animate-pulse' : ''}
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

        {/* Investments grouped by type */}
        <div className="space-y-6">
          {Object.entries(investmentsByType).map(([type, typeInvestments]) => {
            const config = getTypeConfig(type);
            const stats = getTypeStats(typeInvestments);
            
            return (
              <div key={type} className="space-y-3">
                <div className={`flex items-center justify-between p-3 rounded-lg ${config.bgColor}`}>
                  <div className="flex items-center gap-2">
                    <h3 className={`font-semibold ${config.color}`}>{type}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {typeInvestments.length} {typeInvestments.length === 1 ? 'asset' : 'assets'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Value: </span>
                      <span className="font-medium">{formatCurrency(stats.totalValue)}</span>
                    </div>
                    <div className={`flex items-center gap-1 ${stats.totalGainLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {stats.totalGainLoss >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span className="font-medium">
                        {stats.totalGainLoss >= 0 ? '+' : ''}{formatCurrency(stats.totalGainLoss)} ({stats.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 pl-2">
                  {typeInvestments.map((investment) => {
                    const perf = calculatePerformance(investment);
                    const livePrice = getLivePrice(investment);
                    const chartData = livePrice?.chart_7d ? formatChartData(livePrice.chart_7d) : [];
                    const isPositiveChart = chartData.length > 1 && chartData[chartData.length - 1].price >= chartData[0].price;
                    
                    return (
                      <div key={investment.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {investment.investment_name}
                                {(investment.investment_type === 'Crypto' || investment.investment_type === 'Stocks') && livePrice && (
                                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                                    <Wifi className="w-3 h-3" />
                                    Live
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center gap-2">
                                {livePrice && (
                                  <span className={`text-xs ${livePrice.change_24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                                    24h: {livePrice.change_24h >= 0 ? '+' : ''}{livePrice.change_24h.toFixed(2)}%
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* 7-day sparkline chart */}
                            {chartData.length > 0 && (
                              <div className="w-20 h-10">
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={chartData}>
                                    <Line 
                                      type="monotone" 
                                      dataKey="price" 
                                      stroke={isPositiveChart ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} 
                                      strokeWidth={1.5}
                                      dot={false}
                                    />
                                    <Tooltip 
                                      formatter={(value: number) => [formatCurrency(value), 'Price']}
                                      labelFormatter={() => ''}
                                      contentStyle={{ 
                                        background: 'hsl(var(--background))', 
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '6px',
                                        fontSize: '12px'
                                      }}
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteInvestment(investment.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-sm">
                          <div>
                            <div className="text-muted-foreground">Quantity</div>
                            <div className="font-medium">{investment.quantity}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Price</div>
                            <div className="font-medium">{formatCurrency(investment.current_price)}</div>
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
                </div>
              </div>
            );
          })}
          {investments.length === 0 && !showAddForm && (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No investments tracked yet</p>
              <p className="text-sm mt-1">Add crypto investments to see live prices and charts</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestmentTracker;
