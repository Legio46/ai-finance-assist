import React, { createContext, useContext, useState } from 'react';

interface LanguageContextType {
  language: string;
  currency: string;
  setLanguage: (lang: string) => void;
  setCurrency: (curr: string) => void;
  t: (key: string) => string;
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
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
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
  },
  sk: {
    home: 'Domov',
    about: 'O nás',
    pricing: 'Cenník',
    contact: 'Kontakt',
    getStarted: 'Začať',
    language: 'Jazyk',
    currency: 'Mena',
  },
  de: {
    home: 'Startseite',
    about: 'Über uns',
    pricing: 'Preise',
    contact: 'Kontakt',
    getStarted: 'Loslegen',
    language: 'Sprache',
    currency: 'Währung',
  },
  fr: {
    home: 'Accueil',
    about: 'À propos',
    pricing: 'Tarification',
    contact: 'Contact',
    getStarted: 'Commencer',
    language: 'Langue',
    currency: 'Devise',
  },
  pl: {
    home: 'Główna',
    about: 'O nas',
    pricing: 'Cennik',
    contact: 'Kontakt',
    getStarted: 'Rozpocznij',
    language: 'Język',
    currency: 'Waluta',
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
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('USD');

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{
      language,
      currency,
      setLanguage,
      setCurrency,
      t,
    }}>
      {children}
    </LanguageContext.Provider>
  );
};