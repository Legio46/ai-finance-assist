import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Coins, RefreshCw } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

const CurrencyConverterDropdown = () => {
  const { t } = useLanguage();
  const [amount, setAmount] = useState<string>("1");
  const [fromCurrency, setFromCurrency] = useState("EUR");
  const [toCurrency, setToCurrency] = useState("USD");
  const [convertedAmount, setConvertedAmount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const [rates, setRates] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fiatCurrencies = [
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "GBP", name: "British Pound", symbol: "£" },
    { code: "JPY", name: "Japanese Yen", symbol: "¥" },
    { code: "CHF", name: "Swiss Franc", symbol: "Fr" },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
    { code: "AUD", name: "Australian Dollar", symbol: "A$" },
    { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
    { code: "INR", name: "Indian Rupee", symbol: "₹" },
    { code: "CZK", name: "Czech Koruna", symbol: "Kč" },
    { code: "PLN", name: "Polish Zloty", symbol: "zł" },
  ];

  const cryptoCurrencies = [
    { code: "BTC", name: "Bitcoin", symbol: "₿" },
    { code: "ETH", name: "Ethereum", symbol: "Ξ" },
    { code: "SOL", name: "Solana", symbol: "◎" },
    { code: "XRP", name: "Ripple", symbol: "✕" },
    { code: "ADA", name: "Cardano", symbol: "₳" },
  ];

  const allCurrencies = [...fiatCurrencies, ...cryptoCurrencies];

  const fetchRates = useCallback(async () => {
    setIsLoading(true);
    try {
      const fiatResponse = await fetch('https://open.er-api.com/v6/latest/EUR');
      const fiatData = await fiatResponse.json();
      const newRates: Record<string, number> = { EUR: 1 };
      if (fiatData.rates) {
        Object.keys(fiatData.rates).forEach(code => { newRates[code] = fiatData.rates[code]; });
      }
      try {
        const { data: cryptoData, error: cryptoError } = await supabase.functions.invoke('crypto-prices', {
          body: { symbols: ['BTC', 'ETH', 'SOL', 'XRP', 'ADA'] },
        });
        if (!cryptoError && cryptoData?.prices) {
          Object.entries({ BTC: 'BTC', ETH: 'ETH', SOL: 'SOL', XRP: 'XRP', ADA: 'ADA' }).forEach(([symbol]) => {
            const price = cryptoData.prices[symbol];
            if (price?.price_eur) newRates[symbol] = 1 / price.price_eur;
          });
        }
      } catch (cryptoErr) { console.warn('Crypto prices fallback:', cryptoErr); }
      if (!newRates.BTC) newRates.BTC = 0.000011;
      if (!newRates.ETH) newRates.ETH = 0.00029;
      if (!newRates.SOL) newRates.SOL = 0.0052;
      if (!newRates.XRP) newRates.XRP = 0.42;
      if (!newRates.ADA) newRates.ADA = 1.1;
      setRates(newRates);
      setLastUpdated(new Date());
    } catch {
      setRates({
        EUR: 1, USD: 1.09, GBP: 0.86, JPY: 163.5, CHF: 0.94,
        CAD: 1.48, AUD: 1.65, CNY: 7.92, INR: 91.2, CZK: 25.2, PLN: 4.32,
        BTC: 0.000011, ETH: 0.00029, SOL: 0.0052, XRP: 0.42, ADA: 1.1,
      });
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isOpen && Object.keys(rates).length === 0) fetchRates();
  }, [isOpen, fetchRates, rates]);

  useEffect(() => {
    if (Object.keys(rates).length === 0) return;
    const numAmount = parseFloat(amount) || 0;
    const fromRate = rates[fromCurrency] || 1;
    const toRate = rates[toCurrency] || 1;
    setConvertedAmount((numAmount / fromRate) * toRate);
  }, [amount, fromCurrency, toCurrency, rates]);

  const swapCurrencies = () => { setFromCurrency(toCurrency); setToCurrency(fromCurrency); };
  const getCurrencySymbol = (code: string) => allCurrencies.find((c) => c.code === code)?.symbol || code;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
          isOpen ? 'text-primary bg-primary/8' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
        }`}>
          <Coins className="w-4 h-4" />
          {t('currencyConverter')}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 rounded-xl shadow-xl border-border/50" align="center">
        <div className="p-4 border-b border-border/50">
          <h4 className="font-semibold text-sm">{t('currencyConverter')}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">Real-time fiat & crypto rates</p>
        </div>

        <div className="p-4 space-y-3">
          {/* Amount */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Amount</label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" className="h-10 rounded-lg" />
          </div>

          {/* From */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">From</label>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
              <SelectContent>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Currencies</div>
                {fiatCurrencies.map((c) => (<SelectItem key={c.code} value={c.code}>{c.symbol} {c.code} — {c.name}</SelectItem>))}
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1 pt-2">Crypto</div>
                {cryptoCurrencies.map((c) => (<SelectItem key={c.code} value={c.code}>{c.symbol} {c.code} — {c.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          {/* Swap */}
          <div className="flex justify-center">
            <Button variant="ghost" size="icon" onClick={swapCurrencies} className="rounded-full h-8 w-8 bg-muted/50 hover:bg-primary/10 hover:text-primary">
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>

          {/* To */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">To</label>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
              <SelectContent>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Currencies</div>
                {fiatCurrencies.map((c) => (<SelectItem key={c.code} value={c.code}>{c.symbol} {c.code} — {c.name}</SelectItem>))}
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1 pt-2">Crypto</div>
                {cryptoCurrencies.map((c) => (<SelectItem key={c.code} value={c.code}>{c.symbol} {c.code} — {c.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Result */}
        <div className="mx-4 mb-4 rounded-xl bg-gradient-to-br from-primary/10 via-accent/5 to-transparent p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Result</span>
            <Button variant="ghost" size="icon" onClick={fetchRates} disabled={isLoading} className="h-6 w-6 rounded-md">
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <p className="text-2xl font-bold text-primary">
            {isLoading ? '...' : `${getCurrencySymbol(toCurrency)} ${convertedAmount.toLocaleString(undefined, { maximumFractionDigits: 6 })}`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {rates[fromCurrency] && rates[toCurrency]
              ? `1 ${fromCurrency} = ${(rates[toCurrency] / rates[fromCurrency]).toFixed(4)} ${toCurrency}`
              : 'Loading rates...'}
          </p>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground/60 mt-1">Updated: {lastUpdated.toLocaleTimeString()}</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CurrencyConverterDropdown;
