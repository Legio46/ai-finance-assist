import React, { createContext, useContext, useState } from 'react';

interface LanguageContextType {
  language: string;
  currency: string;
  setLanguage: (lang: string) => void;
  setCurrency: (curr: string) => void;
  t: (key: string) => string;
  formatCurrency: (amount: number) => string;
}

interface Language {
  code: string;
  name: string;
  flag: string;
}

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
];

export const currencies: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
];

const translations: Record<string, Record<string, string>> = {
  en: {
    home: 'Home',
    about: 'About',
    pricing: 'Pricing',
    contact: 'Contact',
    getStarted: 'Get Started',
    language: 'Language',
    currency: 'Currency',
    // Pricing page
    personal: 'Personal',
    business: 'Business',
    monthly: 'Monthly',
    yearly: 'Yearly',
    free: 'Free',
    // Features
    features: 'Features',
    // Home page
    startFreeTrial: 'Start Free Trial',
    viewPricing: 'View Pricing',
    powerfulFeatures: 'Powerful Features for Everyone',
    // Common
    signUp: 'Sign Up',
    signIn: 'Sign In',
    comingSoon: 'Coming Soon',
  },
  sk: {
    home: 'Domov',
    about: 'O nás',
    pricing: 'Cenník',
    contact: 'Kontakt',
    getStarted: 'Začať',
    language: 'Jazyk',
    currency: 'Mena',
    personal: 'Osobné',
    business: 'Obchodné',
    monthly: 'Mesačne',
    yearly: 'Ročne',
    free: 'Zadarmo',
    features: 'Funkcie',
    startFreeTrial: 'Začať bezplatnú skúšku',
    viewPricing: 'Zobraziť ceny',
    powerfulFeatures: 'Mocné funkcie pre každého',
    signUp: 'Registrovať sa',
    signIn: 'Prihlásiť sa',
    comingSoon: 'Čoskoro',
  },
  de: {
    home: 'Startseite',
    about: 'Über uns',
    pricing: 'Preise',
    contact: 'Kontakt',
    getStarted: 'Loslegen',
    language: 'Sprache',
    currency: 'Währung',
    personal: 'Persönlich',
    business: 'Geschäftlich',
    monthly: 'Monatlich',
    yearly: 'Jährlich',
    free: 'Kostenlos',
    features: 'Funktionen',
    startFreeTrial: 'Kostenlose Testversion starten',
    viewPricing: 'Preise ansehen',
    powerfulFeatures: 'Leistungsstarke Funktionen für alle',
    signUp: 'Registrieren',
    signIn: 'Anmelden',
    comingSoon: 'Demnächst',
  },
  fr: {
    home: 'Accueil',
    about: 'À propos',
    pricing: 'Tarification',
    contact: 'Contact',
    getStarted: 'Commencer',
    language: 'Langue',
    currency: 'Devise',
    personal: 'Personnel',
    business: 'Entreprise',
    monthly: 'Mensuel',
    yearly: 'Annuel',
    free: 'Gratuit',
    features: 'Fonctionnalités',
    startFreeTrial: 'Commencer l\'essai gratuit',
    viewPricing: 'Voir les tarifs',
    powerfulFeatures: 'Fonctionnalités puissantes pour tous',
    signUp: 'S\'inscrire',
    signIn: 'Se connecter',
    comingSoon: 'Bientôt',
  },
  pl: {
    home: 'Główna',
    about: 'O nas',
    pricing: 'Cennik',
    contact: 'Kontakt',
    getStarted: 'Rozpocznij',
    language: 'Język',
    currency: 'Waluta',
    personal: 'Osobiste',
    business: 'Biznesowe',
    monthly: 'Miesięczne',
    yearly: 'Roczne',
    free: 'Darmowe',
    features: 'Funkcje',
    startFreeTrial: 'Rozpocznij darmowy okres próbny',
    viewPricing: 'Zobacz cennik',
    powerfulFeatures: 'Potężne funkcje dla każdego',
    signUp: 'Zarejestruj się',
    signIn: 'Zaloguj się',
    comingSoon: 'Wkrótce',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('language') || 'en';
    }
    return 'en';
  });
  const [currency, setCurrency] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('currency') || 'USD';
    }
    return 'USD';
  });

  const handleSetLanguage = (lang: string) => {
    setLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  };

  const handleSetCurrency = (curr: string) => {
    setCurrency(curr);
    if (typeof window !== 'undefined') {
      localStorage.setItem('currency', curr);
    }
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  const formatCurrency = (amount: number): string => {
    const currencyInfo = currencies.find(c => c.code === currency);
    if (!currencyInfo) return `$${amount}`;
    return `${currencyInfo.symbol}${amount}`;
  };

  return (
    <LanguageContext.Provider value={{
      language,
      currency,
      setLanguage: handleSetLanguage,
      setCurrency: handleSetCurrency,
      t,
      formatCurrency,
    }}>
      {children}
    </LanguageContext.Provider>
  );
};