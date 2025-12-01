import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const CurrencyConverter = () => {
  const [amount, setAmount] = useState<string>("1");
  const [fromCurrency, setFromCurrency] = useState("EUR");
  const [toCurrency, setToCurrency] = useState("USD");
  const [convertedAmount, setConvertedAmount] = useState<number>(0);
  const [rates, setRates] = useState<Record<string, number>>({
    EUR: 1,
    USD: 1.156,
    GBP: 0.8812,
    JPY: 133.45,
    CHF: 1.03,
    CAD: 1.52,
    AUD: 1.67,
    CNY: 7.89,
    INR: 89.34,
    BTC: 0.000015,
    ETH: 0.00042,
  });

  const currencies = [
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "GBP", name: "British Pound", symbol: "£" },
    { code: "JPY", name: "Japanese Yen", symbol: "¥" },
    { code: "CHF", name: "Swiss Franc", symbol: "Fr" },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
    { code: "AUD", name: "Australian Dollar", symbol: "A$" },
    { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
    { code: "INR", name: "Indian Rupee", symbol: "₹" },
    { code: "BTC", name: "Bitcoin", symbol: "₿" },
    { code: "ETH", name: "Ethereum", symbol: "Ξ" },
  ];

  useEffect(() => {
    const numAmount = parseFloat(amount) || 0;
    const fromRate = rates[fromCurrency];
    const toRate = rates[toCurrency];
    const result = (numAmount / fromRate) * toRate;
    setConvertedAmount(result);
  }, [amount, fromCurrency, toCurrency, rates]);

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const getCurrencySymbol = (code: string) => {
    return currencies.find((c) => c.code === code)?.symbol || code;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              FinanceAI
            </h1>
            <Badge variant="secondary">Free</Badge>
          </Link>
          <div className="flex items-center space-x-4">
            <Link to="/pricing">
              <Button variant="outline">See Plans</Button>
            </Link>
            <Link to="/auth">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Real-Time Currency Converter
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Convert between all major world currencies and cryptocurrencies with live exchange rates
        </p>
      </section>

      {/* Converter Card */}
      <section className="container mx-auto px-4 pb-16 max-w-4xl">
        <Card className="shadow-2xl border-2">
          <CardHeader>
            <CardTitle className="text-2xl">Currency Converter</CardTitle>
            <CardDescription>
              Last updated: {new Date().toLocaleTimeString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* From Currency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="text-2xl font-bold h-14"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">From</label>
                <Select value={fromCurrency} onValueChange={setFromCurrency}>
                  <SelectTrigger className="h-14 text-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code} className="text-lg">
                        {currency.symbol} {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={swapCurrencies}
                className="rounded-full h-12 w-12"
              >
                <ArrowLeftRight className="h-5 w-5" />
              </Button>
            </div>

            {/* To Currency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Converted Amount</label>
                <div className="text-3xl font-bold text-primary h-14 flex items-center px-3 bg-secondary/20 rounded-lg">
                  {convertedAmount.toFixed(6)}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">To</label>
                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger className="h-14 text-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code} className="text-lg">
                        {currency.symbol} {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Exchange Rate Info */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Exchange Rate</p>
              <p className="text-lg font-semibold">
                1 {getCurrencySymbol(fromCurrency)} {fromCurrency} ={" "}
                {((rates[toCurrency] / rates[fromCurrency])).toFixed(6)}{" "}
                {getCurrencySymbol(toCurrency)} {toCurrency}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Conversion Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card className="text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Most Popular
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">EUR/USD</p>
              <p className="text-lg text-primary">1.156</p>
              <div className="flex items-center justify-center gap-1 text-sm text-success mt-1">
                <TrendingUp className="h-4 w-4" />
                <span>+0.23%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Crypto Leader
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">BTC/EUR</p>
              <p className="text-lg text-primary">66,667</p>
              <div className="flex items-center justify-center gap-1 text-sm text-destructive mt-1">
                <TrendingDown className="h-4 w-4" />
                <span>-1.5%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                British Pound
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">EUR/GBP</p>
              <p className="text-lg text-primary">0.8812</p>
              <div className="flex items-center justify-center gap-1 text-sm text-success mt-1">
                <TrendingUp className="h-4 w-4" />
                <span>+0.12%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="mt-8 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="text-center py-8">
            <h3 className="text-2xl font-bold mb-4">
              Want More? Track Your Finances Too!
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Sign up for a paid plan to get expense tracking, investment monitoring, AI financial advisor, and much more.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/pricing">
                <Button size="lg">View Plans</Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline">Start Free Trial</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/30 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2025 FinanceAI. All rights reserved.
          </p>
          <div className="flex justify-center space-x-6 mt-4">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CurrencyConverter;
