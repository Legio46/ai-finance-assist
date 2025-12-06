import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Coins, RefreshCw } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLanguage } from "@/contexts/LanguageContext";

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

  // Fetch fiat rates from Google Finance via open API
  const fetchRates = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch fiat rates from ExchangeRate-API (free, no key required for basic usage)
      const fiatResponse = await fetch('https://open.er-api.com/v6/latest/EUR');
      const fiatData = await fiatResponse.json();
      
      // Fetch crypto rates from CoinGecko (free API)
      const cryptoResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,ripple,cardano&vs_currencies=eur');
      const cryptoData = await cryptoResponse.json();

      const newRates: Record<string, number> = { EUR: 1 };
      
      // Add fiat rates
      if (fiatData.rates) {
        Object.keys(fiatData.rates).forEach(code => {
          newRates[code] = fiatData.rates[code];
        });
      }

      // Add crypto rates (inverted since we get EUR per crypto)
      if (cryptoData.bitcoin) newRates.BTC = 1 / cryptoData.bitcoin.eur;
      if (cryptoData.ethereum) newRates.ETH = 1 / cryptoData.ethereum.eur;
      if (cryptoData.solana) newRates.SOL = 1 / cryptoData.solana.eur;
      if (cryptoData.ripple) newRates.XRP = 1 / cryptoData.ripple.eur;
      if (cryptoData.cardano) newRates.ADA = 1 / cryptoData.cardano.eur;

      setRates(newRates);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch rates:', error);
      // Fallback rates
      setRates({
        EUR: 1, USD: 1.09, GBP: 0.86, JPY: 163.5, CHF: 0.94,
        CAD: 1.48, AUD: 1.65, CNY: 7.92, INR: 91.2, CZK: 25.2, PLN: 4.32,
        BTC: 0.000011, ETH: 0.00029, SOL: 0.0052, XRP: 0.42, ADA: 1.1,
      });
    }
    setIsLoading(false);
  }, []);

  // Fetch rates on mount and when popover opens
  useEffect(() => {
    if (isOpen && Object.keys(rates).length === 0) {
      fetchRates();
    }
  }, [isOpen, fetchRates, rates]);

  // Calculate conversion
  useEffect(() => {
    if (Object.keys(rates).length === 0) return;
    const numAmount = parseFloat(amount) || 0;
    const fromRate = rates[fromCurrency] || 1;
    const toRate = rates[toCurrency] || 1;
    const result = (numAmount / fromRate) * toRate;
    setConvertedAmount(result);
  }, [amount, fromCurrency, toCurrency, rates]);

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const getCurrencySymbol = (code: string) => {
    return allCurrencies.find((c) => c.code === code)?.symbol || code;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={`text-foreground hover:text-primary transition-colors flex items-center gap-1 ${
            isOpen ? 'text-primary font-medium' : ''
          }`}
        >
          <Coins className="w-4 h-4" />
          {t('currencyConverter')}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="center">
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">{t('currencyConverter')}</h4>
          
          {/* Amount Input */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Amount</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="h-10"
            />
          </div>

          {/* From Currency */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">From</label>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Currencies</div>
                {fiatCurrencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code}
                  </SelectItem>
                ))}
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1 pt-2">Crypto</div>
                {cryptoCurrencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={swapCurrencies}
              className="rounded-full h-8 w-8"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
          </div>

          {/* To Currency */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">To</label>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Currencies</div>
                {fiatCurrencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code}
                  </SelectItem>
                ))}
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1 pt-2">Crypto</div>
                {cryptoCurrencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Result */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted-foreground">Result</p>
              <Button
                variant="ghost"
                size="icon"
                onClick={fetchRates}
                disabled={isLoading}
                className="h-6 w-6"
              >
                <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <p className="text-xl font-bold text-primary">
              {isLoading ? '...' : `${getCurrencySymbol(toCurrency)} ${convertedAmount.toLocaleString(undefined, { maximumFractionDigits: 6 })}`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {rates[fromCurrency] && rates[toCurrency] 
                ? `1 ${fromCurrency} = ${(rates[toCurrency] / rates[fromCurrency]).toFixed(4)} ${toCurrency}`
                : 'Loading rates...'}
            </p>
            {lastUpdated && (
              <p className="text-xs text-muted-foreground/60 mt-1">
                Updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CurrencyConverterDropdown;