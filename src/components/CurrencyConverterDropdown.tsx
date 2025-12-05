import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Coins } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLanguage } from "@/contexts/LanguageContext";

const CurrencyConverterDropdown = () => {
  const { t } = useLanguage();
  const [amount, setAmount] = useState<string>("1");
  const [fromCurrency, setFromCurrency] = useState("EUR");
  const [toCurrency, setToCurrency] = useState("USD");
  const [convertedAmount, setConvertedAmount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);

  // Using real approximate exchange rates (as of late 2024)
  const rates: Record<string, number> = {
    EUR: 1,
    USD: 1.09,
    GBP: 0.86,
    JPY: 163.5,
    CHF: 0.94,
    CAD: 1.48,
    AUD: 1.65,
    CNY: 7.92,
    INR: 91.2,
    BTC: 0.000011,
    ETH: 0.00029,
    CZK: 25.2,
    PLN: 4.32,
  };

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
    { code: "CZK", name: "Czech Koruna", symbol: "Kč" },
    { code: "PLN", name: "Polish Zloty", symbol: "zł" },
    { code: "BTC", name: "Bitcoin", symbol: "₿" },
    { code: "ETH", name: "Ethereum", symbol: "Ξ" },
  ];

  useEffect(() => {
    const numAmount = parseFloat(amount) || 0;
    const fromRate = rates[fromCurrency];
    const toRate = rates[toCurrency];
    const result = (numAmount / fromRate) * toRate;
    setConvertedAmount(result);
  }, [amount, fromCurrency, toCurrency]);

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const getCurrencySymbol = (code: string) => {
    return currencies.find((c) => c.code === code)?.symbol || code;
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
                {currencies.map((currency) => (
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
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Result */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Result</p>
            <p className="text-xl font-bold text-primary">
              {getCurrencySymbol(toCurrency)} {convertedAmount.toLocaleString(undefined, { maximumFractionDigits: 6 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              1 {fromCurrency} = {(rates[toCurrency] / rates[fromCurrency]).toFixed(4)} {toCurrency}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CurrencyConverterDropdown;