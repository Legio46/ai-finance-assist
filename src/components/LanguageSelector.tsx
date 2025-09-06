import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useLanguage, languages, currencies } from '@/contexts/LanguageContext';
import { Globe, DollarSign } from 'lucide-react';

const LanguageSelector = () => {
  const { language, currency, setLanguage, setCurrency, t } = useLanguage();

  const currentLanguage = languages.find(lang => lang.code === language);
  const currentCurrency = currencies.find(curr => curr.code === currency);

  return (
    <div className="flex items-center gap-2">
      {/* Language Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <Globe className="h-4 w-4" />
            <span className="text-lg">{currentLanguage?.flag}</span>
            <span className="hidden md:inline">{currentLanguage?.name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-background border border-border">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`cursor-pointer hover:bg-accent ${
                language === lang.code ? 'bg-accent' : ''
              }`}
            >
              <span className="mr-2 text-lg">{lang.flag}</span>
              {lang.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Currency Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden md:inline">{currentCurrency?.symbol}</span>
            <span className="hidden lg:inline">{currentCurrency?.code}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-background border border-border">
          {currencies.map((curr) => (
            <DropdownMenuItem
              key={curr.code}
              onClick={() => setCurrency(curr.code)}
              className={`cursor-pointer hover:bg-accent ${
                currency === curr.code ? 'bg-accent' : ''
              }`}
            >
              <span className="mr-2">{curr.symbol}</span>
              {curr.name} ({curr.code})
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default LanguageSelector;