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
];

export const currencies: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
];

const translations: Record<string, Record<string, string>> = {
  en: {
    // Navigation
    home: 'Home',
    about: 'About',
    pricing: 'Pricing',
    contact: 'Contact',
    affiliate: 'Affiliate',
    getStarted: 'Get Started',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Sign Out',

    // Common
    personal: 'Personal',
    business: 'Business',
    loading: 'Loading...',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    submit: 'Submit',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    fullName: 'Full Name',
    accountType: 'Account Type',
    welcome: 'Welcome',

    // Home page
    heroTitle: 'Legio',
    heroSubtitle: 'The complete AI-powered financial platform for entrepreneurs and individuals. Manage taxes, track expenses, and get expert financial advice all in one place.',
    startFreeTrial: 'Start Free Trial',
    viewPricing: 'View Pricing',
    powerfulFeatures: 'Powerful Features',
    smartTaxCalculator: 'Smart Tax Calculator',
    taxCalculatorDesc: 'Calculate taxes for Slovakia, USA, UK, Germany, and France with precision',
    expenseTracking: 'Expense Tracking',
    expenseTrackingDesc: 'Track personal and business expenses with intelligent categorization',
    financialAdvisor: 'Financial Advisor',
    financialAdvisorDesc: 'Get personalized advice on investments, mortgages, and savings',
    whyChooseLegio: 'Why Choose Legio?',
    bankLevelSecurity: 'Bank-Level Security',
    bankLevelSecurityDesc: 'Your data is protected with enterprise-grade encryption',
    personalAndBusiness: 'Personal & Business',
    personalAndBusinessDesc: 'One platform for all your financial needs',
    multiCountrySupport: 'Multi-Country Support',
    multiCountrySupportDesc: 'Tax calculations for 5 major countries',
    readyToTakeControl: 'Ready to Take Control of Your Finances?',
    joinThousands: 'Join thousands of users who trust Legio with their financial management',
    startFreeTrialToday: 'Start Your Free Trial Today',

    // About page
    aboutLegio: 'About Legio Financial',
    aboutMission: "We're on a mission to democratize financial management and make expert-level financial advice accessible to everyone, from individual users to large enterprises.",
    ourMission: 'Our Mission',
    missionText: 'To empower individuals and businesses with intelligent financial tools that simplify complex calculations, provide actionable insights, and help users make informed financial decisions across multiple countries and currencies.',
    ourValues: 'Our Values',
    userCentric: 'User-Centric',
    userCentricDesc: "Every feature we build is designed with our users' needs at the forefront, ensuring simplicity without sacrificing functionality.",
    innovation: 'Innovation',
    innovationDesc: "We leverage cutting-edge AI and technology to provide insights and automation that traditional financial tools simply can't match.",
    trustAndSecurity: 'Trust & Security',
    trustSecurityDesc: 'Your financial data deserves the highest level of protection. We implement bank-grade security to keep your information safe.',
    ourStory: 'Our Story',
    storyPara1: "Legio Financial was born from a simple observation: financial management shouldn't be complicated, expensive, or limited by geography. Whether you're a freelancer in Slovakia, a startup in Germany, or an established business in the USA, you deserve access to the same level of financial intelligence.",
    storyPara2: 'Our team of financial experts, software engineers, and AI specialists came together to create a platform that breaks down the barriers between users and professional-grade financial management tools.',
    storyPara3: 'Today, Legio serves thousands of users across multiple countries, helping them save time, reduce costs, and make better financial decisions through the power of intelligent automation and expert insights.',
    globalReach: 'Global Reach',
    currentlyServing: 'Currently serving users in Slovakia, USA, UK, Germany, and France',

    // Auth page
    welcomeDesc: 'Sign in to your account or create a new one',
    yourAIPowered: 'Your AI-powered financial companion',
    staySignedIn: 'Stay signed in',
    signingIn: 'Signing In...',
    forgotPassword: 'Forgot your password?',
    creatingAccount: 'Creating Account...',
    createAccount: 'Create Account',
    resetPassword: 'Reset Password',
    resetPasswordDesc: "Enter your email address and we'll send you a reset link.",
    sending: 'Sending...',
    sendResetLink: 'Send Reset Link',
    startTrial: 'Start your 7-day free trial today!',
    setNewPassword: 'Set New Password',
    setNewPasswordDesc: 'Enter your new password below',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    updating: 'Updating...',
    updatePassword: 'Update Password',
    enterYourEmail: 'Enter your email',
    enterYourPassword: 'Enter your password',
    enterYourFullName: 'Enter your full name',
    createAPassword: 'Create a password',
    confirmYourPassword: 'Confirm your password',

    // Dashboard
    loadingDashboard: 'Loading dashboard...',
    adminPanel: 'Admin Panel',
    freeTrialActive: 'Free trial active until',
    upgradeNow: 'Upgrade Now',
    overview: 'Overview',
    aiAdvisor: 'AI Advisor',
    security: 'Security',
    monthlyExpenses: 'Monthly Expenses',
    fromLastMonth: 'from last month',
    savingsGoal: 'Savings Goal',
    ofYearlyGoal: 'of yearly goal',
    taxEstimate: 'Tax Estimate',
    forCurrentFiscalYear: 'For current fiscal year',
    investmentReturn: 'Investment Return',
    thisMonth: 'this month',
    quickActions: 'Quick Actions',
    quickActionsDesc: 'Get started with your financial management',
    trackPersonalExpenses: 'Track Personal Expenses',
    manageBusinessTaxes: 'Manage Business Taxes',
    getAIAdvice: 'Get AI Advice',
    aiAdvisorTitle: 'AI Financial Advisor',
    aiAdvisorDesc: 'Get personalized financial advice powered by AI',
    aiAdvisorComingSoon: 'AI Advisor Coming Soon',
    aiAdvisorComingSoonDesc: 'Get personalized advice on investments, mortgages, and financial planning',
    enableAIAdvisor: 'Enable AI Advisor',

    // Not Found
    pageNotFound: 'Page not found',
    oopsNotFound: 'Oops! Page not found',
    returnToHome: 'Return to Home',

    // Footer
    footerRights: 'All rights reserved',
    productTitle: 'Product',
    supportTitle: 'Support',
    legalTitle: 'Legal',
    helpCenter: 'Help Center',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    affiliateProgram: 'Affiliate Program',
  },
  sk: {
    // Navigation
    home: 'Domov',
    about: 'O nás',
    pricing: 'Cenník',
    contact: 'Kontakt',
    affiliate: 'Partnerský program',
    getStarted: 'Začať',
    signIn: 'Prihlásiť sa',
    signUp: 'Registrovať sa',
    signOut: 'Odhlásiť sa',

    // Common
    personal: 'Osobný',
    business: 'Obchodný',
    loading: 'Načítava sa...',
    cancel: 'Zrušiť',
    save: 'Uložiť',
    delete: 'Vymazať',
    edit: 'Upraviť',
    close: 'Zavrieť',
    submit: 'Odoslať',
    email: 'Email',
    password: 'Heslo',
    confirmPassword: 'Potvrdiť heslo',
    fullName: 'Celé meno',
    accountType: 'Typ účtu',
    welcome: 'Vitajte',

    // Home page
    heroTitle: 'Legio',
    heroSubtitle: 'Kompletná AI platforma pre finančné riadenie pre podnikateľov a jednotlivcov. Spravujte dane, sledujte výdavky a získajte odborné finančné poradenstvo na jednom mieste.',
    startFreeTrial: 'Začať skúšobnú verziu',
    viewPricing: 'Zobraziť cenník',
    powerfulFeatures: 'Výkonné funkcie',
    smartTaxCalculator: 'Inteligentná daňová kalkulačka',
    taxCalculatorDesc: 'Vypočítajte dane pre Slovensko, USA, UK, Nemecko a Francúzsko s presnosťou',
    expenseTracking: 'Sledovanie výdavkov',
    expenseTrackingDesc: 'Sledujte osobné a obchodné výdavky s inteligentnou kategorizáciou',
    financialAdvisor: 'Finančný poradca',
    financialAdvisorDesc: 'Získajte personalizované poradenstvo o investíciách, hypotékach a úsporách',
    whyChooseLegio: 'Prečo si vybrať Legio?',
    bankLevelSecurity: 'Bezpečnosť na úrovni banky',
    bankLevelSecurityDesc: 'Vaše údaje sú chránené šifrovaním na podnikovej úrovni',
    personalAndBusiness: 'Osobné & Obchodné',
    personalAndBusinessDesc: 'Jedna platforma pre všetky vaše finančné potreby',
    multiCountrySupport: 'Podpora viacerých krajín',
    multiCountrySupportDesc: 'Daňové výpočty pre 5 hlavných krajín',
    readyToTakeControl: 'Pripravení prevziať kontrolu nad svojimi financiami?',
    joinThousands: 'Pridajte sa k tisíckam používateľov, ktorí dôverujú Legio pri riadení svojich financií',
    startFreeTrialToday: 'Začnite svoju skúšobnú verziu dnes',

    // About page
    aboutLegio: 'O Legio Financial',
    aboutMission: 'Našou misiou je demokratizovať finančné riadenie a sprístupniť odbornú finančnú poradenstvo každému, od jednotlivých používateľov po veľké podniky.',
    ourMission: 'Naša misia',
    missionText: 'Posilniť jednotlivcov a podniky inteligentnými finančnými nástrojmi, ktoré zjednodušujú zložité výpočty, poskytujú užitočné poznatky a pomáhajú používateľom robiť informované finančné rozhodnutia v rôznych krajinách a menách.',
    ourValues: 'Naše hodnoty',
    userCentric: 'Zamerané na používateľa',
    userCentricDesc: 'Každá funkcia, ktorú vytvárame, je navrhnutá s potrebami našich používateľov na prvom mieste, zabezpečuje jednoduchosť bez obetovani funkčnosti.',
    innovation: 'Inovácia',
    innovationDesc: 'Využívame najmodernejšiu AI a technológiu na poskytovanie poznatkov a automatizácie, ktoré tradičné finančné nástroje jednoducho nemôžu poskytnúť.',
    trustAndSecurity: 'Dôvera & Bezpečnosť',
    trustSecurityDesc: 'Vaše finančné údaje si zaslúžia najvyššiu úroveň ochrany. Implementujeme bezpečnosť na úrovni bánk, aby sme udržali vaše informácie v bezpečí.',
    ourStory: 'Náš príbeh',
    storyPara1: "Legio Financial sa zrodilo z jednoduchého pozorovania: finančné riadenie by nemalo byť komplikované, drahé alebo obmedzené geografiou. Či už ste freelancer na Slovensku, startup v Nemecku alebo zavedený podnik v USA, zaslúžite si prístup k rovnakej úrovni finančnej inteligencie.",
    storyPara2: 'Náš tím finančných expertov, softvérových inžinierov a AI špecialistov sa spojil, aby vytvoril platformu, ktorá prebúra bariéry medzi používateľmi a profesionálnymi finančnými nástrojmi.',
    storyPara3: 'Dnes Legio slúži tisíckam používateľov v rôznych krajinách, pomáha im šetriť čas, znižovať náklady a robiť lepšie finančné rozhodnutia pomocou inteligentnej automatizácie a odborných poznatkov.',
    globalReach: 'Globálny dosah',
    currentlyServing: 'Momentálne slúžime používateľom na Slovensku, v USA, UK, Nemecku a Francúzsku',

    // Auth page
    welcomeDesc: 'Prihláste sa do svojho účtu alebo vytvorte nový',
    yourAIPowered: 'Váš AI finančný spoločník',
    staySignedIn: 'Zostať prihlásený',
    signingIn: 'Prihlasovanie...',
    forgotPassword: 'Zabudli ste heslo?',
    creatingAccount: 'Vytváranie účtu...',
    createAccount: 'Vytvoriť účet',
    resetPassword: 'Obnoviť heslo',
    resetPasswordDesc: 'Zadajte svoju e-mailovú adresu a my vám pošleme odkaz na obnovenie.',
    sending: 'Odosielanie...',
    sendResetLink: 'Odoslať odkaz na obnovenie',
    startTrial: 'Začnite svoju 7-dňovú skúšobnú verziu dnes!',
    setNewPassword: 'Nastaviť nové heslo',
    setNewPasswordDesc: 'Zadajte svoje nové heslo nižšie',
    newPassword: 'Nové heslo',
    confirmNewPassword: 'Potvrdiť nové heslo',
    updating: 'Aktualizácia...',
    updatePassword: 'Aktualizovať heslo',
    enterYourEmail: 'Zadajte svoj email',
    enterYourPassword: 'Zadajte svoje heslo',
    enterYourFullName: 'Zadajte svoje celé meno',
    createAPassword: 'Vytvorte heslo',
    confirmYourPassword: 'Potvrďte svoje heslo',

    // Dashboard
    loadingDashboard: 'Načítavanie panela...',
    adminPanel: 'Admin Panel',
    freeTrialActive: 'Skúšobná verzia aktívna do',
    upgradeNow: 'Upgradovať teraz',
    overview: 'Prehľad',
    aiAdvisor: 'AI Poradca',
    security: 'Bezpečnosť',
    monthlyExpenses: 'Mesačné výdavky',
    fromLastMonth: 'od minulého mesiaca',
    savingsGoal: 'Cieľ úspor',
    ofYearlyGoal: 'z ročného cieľa',
    taxEstimate: 'Odhad dane',
    forCurrentFiscalYear: 'Pre súčasný fiškálny rok',
    investmentReturn: 'Návratnosť investície',
    thisMonth: 'tento mesiac',
    quickActions: 'Rýchle akcie',
    quickActionsDesc: 'Začnite so svojím finančným riadením',
    trackPersonalExpenses: 'Sledovať osobné výdavky',
    manageBusinessTaxes: 'Spravovať obchodné dane',
    getAIAdvice: 'Získať AI radu',
    aiAdvisorTitle: 'AI Finančný poradca',
    aiAdvisorDesc: 'Získajte personalizované finančné poradenstvo s podporou AI',
    aiAdvisorComingSoon: 'AI Poradca už čoskoro',
    aiAdvisorComingSoonDesc: 'Získajte personalizované poradenstvo o investíciách, hypotékach a finančnom plánovaní',
    enableAIAdvisor: 'Povoliť AI Poradcu',

    // Not Found
    pageNotFound: 'Stránka nenájdená',
    oopsNotFound: 'Ups! Stránka nenájdená',
    returnToHome: 'Návrat na domovskú stránku',

    // Footer
    footerRights: 'Všetky práva vyhradené',
    productTitle: 'Produkt',
    supportTitle: 'Podpora',
    legalTitle: 'Právne',
    helpCenter: 'Centrum pomoci',
    privacyPolicy: 'Zásady ochrany osobných údajov',
    termsOfService: 'Podmienky služby',
    affiliateProgram: 'Affiliate program',
  },
  de: {
    // Navigation
    home: 'Startseite',
    about: 'Über uns',
    pricing: 'Preise',
    contact: 'Kontakt',
    affiliate: 'Partnerprogramm',
    getStarted: 'Loslegen',
    signIn: 'Anmelden',
    signUp: 'Registrieren',
    signOut: 'Abmelden',

    // Common
    personal: 'Persönlich',
    business: 'Geschäftlich',
    loading: 'Lädt...',
    cancel: 'Abbrechen',
    save: 'Speichern',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    close: 'Schließen',
    submit: 'Absenden',
    email: 'E-Mail',
    password: 'Passwort',
    confirmPassword: 'Passwort bestätigen',
    fullName: 'Vollständiger Name',
    accountType: 'Kontotyp',
    welcome: 'Willkommen',

    // Home page
    heroTitle: 'Legio',
    heroSubtitle: 'Die vollständige KI-gestützte Finanzplattform für Unternehmer und Privatpersonen. Verwalten Sie Steuern, verfolgen Sie Ausgaben und erhalten Sie Expertenrat - alles an einem Ort.',
    startFreeTrial: 'Kostenlose Testversion starten',
    viewPricing: 'Preise anzeigen',
    powerfulFeatures: 'Leistungsstarke Funktionen',
    smartTaxCalculator: 'Intelligenter Steuerrechner',
    taxCalculatorDesc: 'Berechnen Sie Steuern für Slowakei, USA, UK, Deutschland und Frankreich mit Präzision',
    expenseTracking: 'Ausgabenverfolgung',
    expenseTrackingDesc: 'Verfolgen Sie persönliche und geschäftliche Ausgaben mit intelligenter Kategorisierung',
    financialAdvisor: 'Finanzberater',
    financialAdvisorDesc: 'Erhalten Sie personalisierte Beratung zu Investitionen, Hypotheken und Ersparnissen',
    whyChooseLegio: 'Warum Legio wählen?',
    bankLevelSecurity: 'Sicherheit auf Bankniveau',
    bankLevelSecurityDesc: 'Ihre Daten werden mit Unternehmensverschlüsselung geschützt',
    personalAndBusiness: 'Privat & Geschäftlich',
    personalAndBusinessDesc: 'Eine Plattform für alle Ihre finanziellen Bedürfnisse',
    multiCountrySupport: 'Multi-Länder-Unterstützung',
    multiCountrySupportDesc: 'Steuerberechnungen für 5 Hauptländer',
    readyToTakeControl: 'Bereit, Ihre Finanzen zu kontrollieren?',
    joinThousands: 'Schließen Sie sich Tausenden von Benutzern an, die Legio bei ihrer Finanzverwaltung vertrauen',
    startFreeTrialToday: 'Starten Sie heute Ihre kostenlose Testversion',

    // About page
    aboutLegio: 'Über Legio Financial',
    aboutMission: 'Unsere Mission ist es, das Finanzmanagement zu demokratisieren und Finanzberatung auf Expertenniveau für alle zugänglich zu machen, von Einzelpersonen bis hin zu großen Unternehmen.',
    ourMission: 'Unsere Mission',
    missionText: 'Einzelpersonen und Unternehmen mit intelligenten Finanztools zu stärken, die komplexe Berechnungen vereinfachen, umsetzbare Erkenntnisse liefern und Benutzern helfen, fundierte finanzielle Entscheidungen über mehrere Länder und Währungen hinweg zu treffen.',
    ourValues: 'Unsere Werte',
    userCentric: 'Benutzerzentriert',
    userCentricDesc: 'Jede Funktion, die wir entwickeln, ist mit den Bedürfnissen unserer Benutzer im Vordergrund gestaltet und gewährleistet Einfachheit ohne Funktionalität zu opfern.',
    innovation: 'Innovation',
    innovationDesc: 'Wir nutzen modernste KI und Technologie, um Erkenntnisse und Automatisierung zu liefern, die herkömmliche Finanztools einfach nicht bieten können.',
    trustAndSecurity: 'Vertrauen & Sicherheit',
    trustSecurityDesc: 'Ihre Finanzdaten verdienen den höchsten Schutz. Wir implementieren Sicherheit auf Bankniveau, um Ihre Informationen sicher zu halten.',
    ourStory: 'Unsere Geschichte',
    storyPara1: 'Legio Financial entstand aus einer einfachen Beobachtung: Finanzmanagement sollte nicht kompliziert, teuer oder geografisch begrenzt sein. Ob Sie Freelancer in der Slowakei, ein Startup in Deutschland oder ein etabliertes Unternehmen in den USA sind, Sie verdienen Zugang zum gleichen Niveau finanzieller Intelligenz.',
    storyPara2: 'Unser Team aus Finanzexperten, Softwareingenieuren und KI-Spezialisten hat sich zusammengetan, um eine Plattform zu schaffen, die die Barrieren zwischen Benutzern und professionellen Finanzverwaltungstools abbaut.',
    storyPara3: 'Heute dient Legio Tausenden von Benutzern in mehreren Ländern und hilft ihnen, Zeit zu sparen, Kosten zu senken und bessere finanzielle Entscheidungen durch intelligente Automatisierung und Expertenerkenntnisse zu treffen.',
    globalReach: 'Globale Reichweite',
    currentlyServing: 'Derzeit bedienen wir Benutzer in der Slowakei, den USA, Großbritannien, Deutschland und Frankreich',

    // Auth page
    welcomeDesc: 'Melden Sie sich bei Ihrem Konto an oder erstellen Sie ein neues',
    yourAIPowered: 'Ihr KI-gestützter Finanzbegleiter',
    staySignedIn: 'Angemeldet bleiben',
    signingIn: 'Anmeldung läuft...',
    forgotPassword: 'Passwort vergessen?',
    creatingAccount: 'Konto wird erstellt...',
    createAccount: 'Konto erstellen',
    resetPassword: 'Passwort zurücksetzen',
    resetPasswordDesc: 'Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Reset-Link.',
    sending: 'Senden...',
    sendResetLink: 'Reset-Link senden',
    startTrial: 'Starten Sie heute Ihre 7-tägige kostenlose Testversion!',
    setNewPassword: 'Neues Passwort festlegen',
    setNewPasswordDesc: 'Geben Sie unten Ihr neues Passwort ein',
    newPassword: 'Neues Passwort',
    confirmNewPassword: 'Neues Passwort bestätigen',
    updating: 'Aktualisierung...',
    updatePassword: 'Passwort aktualisieren',
    enterYourEmail: 'Geben Sie Ihre E-Mail ein',
    enterYourPassword: 'Geben Sie Ihr Passwort ein',
    enterYourFullName: 'Geben Sie Ihren vollständigen Namen ein',
    createAPassword: 'Erstellen Sie ein Passwort',
    confirmYourPassword: 'Bestätigen Sie Ihr Passwort',

    // Dashboard
    loadingDashboard: 'Dashboard wird geladen...',
    adminPanel: 'Admin-Panel',
    freeTrialActive: 'Kostenlose Testversion aktiv bis',
    upgradeNow: 'Jetzt upgraden',
    overview: 'Übersicht',
    aiAdvisor: 'KI-Berater',
    security: 'Sicherheit',
    monthlyExpenses: 'Monatliche Ausgaben',
    fromLastMonth: 'vom letzten Monat',
    savingsGoal: 'Sparziel',
    ofYearlyGoal: 'des Jahresziels',
    taxEstimate: 'Steuerschätzung',
    forCurrentFiscalYear: 'Für das laufende Geschäftsjahr',
    investmentReturn: 'Anlagerendite',
    thisMonth: 'diesen Monat',
    quickActions: 'Schnellaktionen',
    quickActionsDesc: 'Beginnen Sie mit Ihrer Finanzverwaltung',
    trackPersonalExpenses: 'Persönliche Ausgaben verfolgen',
    manageBusinessTaxes: 'Geschäftssteuern verwalten',
    getAIAdvice: 'KI-Rat erhalten',
    aiAdvisorTitle: 'KI-Finanzberater',
    aiAdvisorDesc: 'Erhalten Sie personalisierte Finanzberatung durch KI',
    aiAdvisorComingSoon: 'KI-Berater kommt bald',
    aiAdvisorComingSoonDesc: 'Erhalten Sie personalisierte Beratung zu Investitionen, Hypotheken und Finanzplanung',
    enableAIAdvisor: 'KI-Berater aktivieren',

    // Not Found
    pageNotFound: 'Seite nicht gefunden',
    oopsNotFound: 'Ups! Seite nicht gefunden',
    returnToHome: 'Zurück zur Startseite',

    // Footer
    footerRights: 'Alle Rechte vorbehalten',
    productTitle: 'Produkt',
    supportTitle: 'Support',
    legalTitle: 'Rechtliches',
    helpCenter: 'Hilfezentrum',
    privacyPolicy: 'Datenschutzrichtlinie',
    termsOfService: 'Nutzungsbedingungen',
    affiliateProgram: 'Partnerprogramm',
  },
  fr: {
    // Navigation
    home: 'Accueil',
    about: 'À propos',
    pricing: 'Tarification',
    contact: 'Contact',
    affiliate: "Programme d'affiliation",
    getStarted: 'Commencer',
    signIn: 'Se connecter',
    signUp: "S'inscrire",
    signOut: 'Se déconnecter',

    // Common
    personal: 'Personnel',
    business: 'Professionnel',
    loading: 'Chargement...',
    cancel: 'Annuler',
    save: 'Enregistrer',
    delete: 'Supprimer',
    edit: 'Modifier',
    close: 'Fermer',
    submit: 'Soumettre',
    email: 'E-mail',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    fullName: 'Nom complet',
    accountType: 'Type de compte',
    welcome: 'Bienvenue',

    // Home page
    heroTitle: 'Legio',
    heroSubtitle: "La plateforme financière complète alimentée par l'IA pour entrepreneurs et particuliers. Gérez les impôts, suivez les dépenses et obtenez des conseils financiers experts en un seul endroit.",
    startFreeTrial: "Démarrer l'essai gratuit",
    viewPricing: 'Voir les tarifs',
    powerfulFeatures: 'Fonctionnalités puissantes',
    smartTaxCalculator: "Calculateur d'impôts intelligent",
    taxCalculatorDesc: 'Calculez les impôts pour la Slovaquie, les États-Unis, le Royaume-Uni, l\'Allemagne et la France avec précision',
    expenseTracking: 'Suivi des dépenses',
    expenseTrackingDesc: 'Suivez les dépenses personnelles et professionnelles avec catégorisation intelligente',
    financialAdvisor: 'Conseiller financier',
    financialAdvisorDesc: 'Obtenez des conseils personnalisés sur les investissements, les hypothèques et l\'épargne',
    whyChooseLegio: 'Pourquoi choisir Legio?',
    bankLevelSecurity: 'Sécurité de niveau bancaire',
    bankLevelSecurityDesc: 'Vos données sont protégées par un cryptage de niveau entreprise',
    personalAndBusiness: 'Personnel & Professionnel',
    personalAndBusinessDesc: 'Une plateforme pour tous vos besoins financiers',
    multiCountrySupport: 'Support multi-pays',
    multiCountrySupportDesc: 'Calculs fiscaux pour 5 pays majeurs',
    readyToTakeControl: 'Prêt à prendre le contrôle de vos finances?',
    joinThousands: "Rejoignez des milliers d'utilisateurs qui font confiance à Legio pour leur gestion financière",
    startFreeTrialToday: "Démarrez votre essai gratuit aujourd'hui",

    // About page
    aboutLegio: 'À propos de Legio Financial',
    aboutMission: "Notre mission est de démocratiser la gestion financière et de rendre les conseils financiers de niveau expert accessibles à tous, des particuliers aux grandes entreprises.",
    ourMission: 'Notre mission',
    missionText: 'Autonomiser les particuliers et les entreprises avec des outils financiers intelligents qui simplifient les calculs complexes, fournissent des informations exploitables et aident les utilisateurs à prendre des décisions financières éclairées dans plusieurs pays et devises.',
    ourValues: 'Nos valeurs',
    userCentric: "Centré sur l'utilisateur",
    userCentricDesc: 'Chaque fonctionnalité que nous construisons est conçue avec les besoins de nos utilisateurs au premier plan, garantissant la simplicité sans sacrifier la fonctionnalité.',
    innovation: 'Innovation',
    innovationDesc: "Nous exploitons l'IA et la technologie de pointe pour fournir des informations et une automatisation que les outils financiers traditionnels ne peuvent tout simplement pas égaler.",
    trustAndSecurity: 'Confiance & Sécurité',
    trustSecurityDesc: 'Vos données financières méritent le plus haut niveau de protection. Nous mettons en œuvre une sécurité de niveau bancaire pour garder vos informations en sécurité.',
    ourStory: 'Notre histoire',
    storyPara1: "Legio Financial est né d'une simple observation : la gestion financière ne devrait pas être compliquée, coûteuse ou limitée par la géographie. Que vous soyez freelance en Slovaquie, une startup en Allemagne ou une entreprise établie aux États-Unis, vous méritez l'accès au même niveau d'intelligence financière.",
    storyPara2: "Notre équipe d'experts financiers, d'ingénieurs logiciels et de spécialistes de l'IA s'est réunie pour créer une plateforme qui brise les barrières entre les utilisateurs et les outils de gestion financière professionnels.",
    storyPara3: "Aujourd'hui, Legio sert des milliers d'utilisateurs dans plusieurs pays, les aidant à gagner du temps, réduire les coûts et prendre de meilleures décisions financières grâce à l'automatisation intelligente et aux insights d'experts.",
    globalReach: 'Portée mondiale',
    currentlyServing: "Actuellement au service des utilisateurs en Slovaquie, aux États-Unis, au Royaume-Uni, en Allemagne et en France",

    // Auth page
    welcomeDesc: 'Connectez-vous à votre compte ou créez-en un nouveau',
    yourAIPowered: 'Votre compagnon financier alimenté par l\'IA',
    staySignedIn: 'Rester connecté',
    signingIn: 'Connexion...',
    forgotPassword: 'Mot de passe oublié?',
    creatingAccount: 'Création du compte...',
    createAccount: 'Créer un compte',
    resetPassword: 'Réinitialiser le mot de passe',
    resetPasswordDesc: 'Entrez votre adresse e-mail et nous vous enverrons un lien de réinitialisation.',
    sending: 'Envoi...',
    sendResetLink: 'Envoyer le lien de réinitialisation',
    startTrial: "Commencez votre essai gratuit de 7 jours aujourd'hui!",
    setNewPassword: 'Définir un nouveau mot de passe',
    setNewPasswordDesc: 'Entrez votre nouveau mot de passe ci-dessous',
    newPassword: 'Nouveau mot de passe',
    confirmNewPassword: 'Confirmer le nouveau mot de passe',
    updating: 'Mise à jour...',
    updatePassword: 'Mettre à jour le mot de passe',
    enterYourEmail: 'Entrez votre e-mail',
    enterYourPassword: 'Entrez votre mot de passe',
    enterYourFullName: 'Entrez votre nom complet',
    createAPassword: 'Créez un mot de passe',
    confirmYourPassword: 'Confirmez votre mot de passe',

    // Dashboard
    loadingDashboard: 'Chargement du tableau de bord...',
    adminPanel: "Panneau d'administration",
    freeTrialActive: "Essai gratuit actif jusqu'au",
    upgradeNow: 'Mettre à niveau maintenant',
    overview: 'Aperçu',
    aiAdvisor: 'Conseiller IA',
    security: 'Sécurité',
    monthlyExpenses: 'Dépenses mensuelles',
    fromLastMonth: 'du mois dernier',
    savingsGoal: "Objectif d'épargne",
    ofYearlyGoal: "de l'objectif annuel",
    taxEstimate: 'Estimation fiscale',
    forCurrentFiscalYear: "Pour l'exercice fiscal en cours",
    investmentReturn: 'Retour sur investissement',
    thisMonth: 'ce mois-ci',
    quickActions: 'Actions rapides',
    quickActionsDesc: 'Commencez avec votre gestion financière',
    trackPersonalExpenses: 'Suivre les dépenses personnelles',
    manageBusinessTaxes: 'Gérer les impôts professionnels',
    getAIAdvice: 'Obtenir des conseils IA',
    aiAdvisorTitle: 'Conseiller financier IA',
    aiAdvisorDesc: "Obtenez des conseils financiers personnalisés alimentés par l'IA",
    aiAdvisorComingSoon: 'Conseiller IA bientôt disponible',
    aiAdvisorComingSoonDesc: 'Obtenez des conseils personnalisés sur les investissements, les hypothèques et la planification financière',
    enableAIAdvisor: 'Activer le conseiller IA',

    // Not Found
    pageNotFound: 'Page non trouvée',
    oopsNotFound: 'Oups! Page non trouvée',
    returnToHome: "Retour à l'accueil",

    // Footer
    footerRights: 'Tous droits réservés',
    productTitle: 'Produit',
    supportTitle: 'Support',
    legalTitle: 'Légal',
    helpCenter: "Centre d'aide",
    privacyPolicy: 'Politique de confidentialité',
    termsOfService: "Conditions d'utilisation",
    affiliateProgram: "Programme d'affiliation",
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
