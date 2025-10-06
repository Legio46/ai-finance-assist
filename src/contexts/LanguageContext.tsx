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
    getStarted: 'Get Started',
    language: 'Language',
    currency: 'Currency',
    
    // Common
    personal: 'Personal',
    business: 'Business',
    monthly: 'Monthly',
    yearly: 'Yearly',
    free: 'Free',
    features: 'Features',
    startFreeTrial: 'Start Free Trial',
    viewPricing: 'View Pricing',
    signUp: 'Sign Up',
    signIn: 'Sign In',
    comingSoon: 'Coming Soon',
    
    // Home/Index page
    aiPoweredFinancial: 'Your AI-Powered Financial Assistant',
    heroDescription: 'Revolutionize your financial management with AI. Calculate taxes, track expenses, get investment advice, and optimize your finances across multiple countries.',
    start7DayTrial: 'Start 7-Day Free Trial',
    noCreditCard: 'No credit card required • Cancel anytime',
    smartTaxCalculator: 'Smart Tax Calculator',
    smartTaxDesc: 'AI-powered tax calculations for Slovakia, USA, UK, Germany, and France',
    expenseTracking: 'Expense Tracking',
    expenseTrackingDesc: 'Track personal and business expenses with intelligent insights',
    aiFinancialAdvisor: 'AI Financial Advisor',
    aiFinancialAdvisorDesc: 'Get personalized advice on investments, mortgages, and savings',
    simpleTransparentPricing: 'Simple, Transparent Pricing',
    choosePlanDesc: 'Choose the plan that fits your financial needs',
    perfectForIndividuals: 'Perfect for individuals',
    personalExpenseTracking: 'Personal expense tracking',
    aiSpendingInsights: 'AI spending insights',
    basicTaxCalculations: 'Basic tax calculations',
    savingsRecommendations: 'Savings recommendations',
    financialGraphsReports: 'Financial graphs & reports',
    mostPopular: 'Most Popular',
    forEntrepreneurs: 'For entrepreneurs & businesses',
    everythingInPersonal: 'Everything in Personal',
    multiCountryTax: 'Multi-country tax calculations',
    businessExpenseTracking: 'Business expense tracking',
    profitLossAnalysis: 'Profit/loss analysis',
    advancedAnalytics: 'Advanced analytics',
    trialInfo: '7-day free trial • No setup fees • Cancel anytime',
    empoweringFuture: 'Empowering your financial future with artificial intelligence',
    
    // About page
    aboutUs: 'About Us',
    aboutHero: 'Your trusted partner in financial management',
    ourMission: 'Our Mission',
    ourMissionText: 'To democratize financial intelligence by providing AI-powered tools that help individuals and businesses make informed financial decisions.',
    ourValues: 'Our Values',
    userCentric: 'User-Centric',
    userCentricDesc: 'Your success is our priority. We design every feature with your needs in mind.',
    innovation: 'Innovation',
    innovationDesc: 'We leverage cutting-edge AI technology to provide you with the smartest financial insights.',
    trustSecurity: 'Trust & Security',
    trustSecurityDesc: 'Your financial data is protected with bank-level security and encryption.',
    ourStory: 'Our Story',
    ourStoryText: 'Founded in 2024, Legio Financial was born from the vision of making financial management accessible to everyone. Our team of financial experts and AI engineers work together to create tools that simplify complex financial tasks.',
    globalReach: 'Global Reach',
    supportedCountries: 'Supported Countries',
    
    // Contact page
    contactUs: 'Contact Us',
    contactHero: 'Have questions or need support? We\'re here to help. Send us a message and we\'ll get back to you as soon as possible.',
    emailUs: 'Email Us',
    emailResponse: 'We typically respond within 24 hours',
    callUs: 'Call Us',
    callHours: 'Monday - Friday, 9AM - 6PM EST',
    visitUs: 'Visit Us',
    sendMessage: 'Send us a Message',
    formDescription: 'Fill out the form below and we\'ll get back to you as soon as possible.',
    fullName: 'Full Name',
    emailAddress: 'Email Address',
    phoneNumber: 'Phone Number',
    message: 'Message',
    sendingMessage: 'Sending...',
    messageSent: 'Message sent!',
    thankYouContact: 'Thank you for contacting us. We\'ll get back to you soon.',
    errorSending: 'Failed to send message. Please try again.',
    
    // Pricing page
    pricingHero: 'Choose the plan that fits your needs. Start with a 7-day free trial, no credit card required.',
    savePercent: 'Save 10%',
    sale50Off: 'SALE 50% OFF',
    sale40Off: 'SALE 40% OFF',
    regularPrice: 'Regular price:',
    dayFreeTrial: '7-day free trial',
    monthlySpendingAnalysis: 'Monthly spending analysis',
    basicFinancialInsights: 'Basic financial insights',
    mobileAppAccess: 'Mobile app access',
    emailSupport: 'Email support',
    businessExpenseManagement: 'Business expense management',
    yearOverYearAnalysis: 'Year-over-year analysis',
    investmentRecommendations: 'Investment recommendations',
    prioritySupport: 'Priority support',
    teamCollaboration: 'Team collaboration',
    faqTitle: 'Frequently Asked Questions',
    faqTrialQ: 'How does the free trial work?',
    faqTrialA: 'You get full access to all features for 7 days, no credit card required. After the trial, you can choose to subscribe to continue using the service.',
    faqChangeQ: 'Can I change plans anytime?',
    faqChangeA: 'Yes! You can upgrade, downgrade, or cancel your subscription at any time. Changes take effect at the next billing cycle.',
    faqCountriesQ: 'Which countries are supported for tax calculations?',
    faqCountriesA: 'We currently support tax calculations for Slovakia, USA, UK, Germany, and France. More countries are being added regularly.',
    faqSecurityQ: 'Is my financial data secure?',
    faqSecurityA: 'Absolutely. We use bank-level encryption and security measures to protect your data. Your information is never shared with third parties without your consent.',
    
    // Footer
    productTitle: 'Product',
    supportTitle: 'Support',
    legalTitle: 'Legal',
    partnershipTitle: 'Partnership',
    helpCenter: 'Help Center',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    affiliateProgram: 'Affiliate Program',
    partnerWithUs: 'Partner with Us',
    allRightsReserved: 'All rights reserved',
    empoweringText: 'Empowering individuals and businesses with intelligent financial management tools.',
  },
  sk: {
    // Navigation
    home: 'Domov',
    about: 'O nás',
    pricing: 'Cenník',
    contact: 'Kontakt',
    getStarted: 'Začať',
    language: 'Jazyk',
    currency: 'Mena',
    
    // Common
    personal: 'Osobné',
    business: 'Obchodné',
    monthly: 'Mesačne',
    yearly: 'Ročne',
    free: 'Zadarmo',
    features: 'Funkcie',
    startFreeTrial: 'Začať bezplatnú skúšku',
    viewPricing: 'Zobraziť ceny',
    signUp: 'Registrovať sa',
    signIn: 'Prihlásiť sa',
    comingSoon: 'Čoskoro',
    
    // Home/Index page
    aiPoweredFinancial: 'Váš AI-poháňaný finančný asistent',
    heroDescription: 'Revolucionalizujte svoje finančné riadenie pomocou AI. Vypočítajte dane, sledujte výdavky, získajte investičné poradenstvo a optimalizujte svoje financie v rôznych krajinách.',
    start7DayTrial: 'Začať 7-dňovú bezplatnú skúšku',
    noCreditCard: 'Nie je potrebná platobná karta • Zrušte kedykoľvek',
    smartTaxCalculator: 'Inteligentná daňová kalkulačka',
    smartTaxDesc: 'AI-poháňané daňové výpočty pre Slovensko, USA, UK, Nemecko a Francúzsko',
    expenseTracking: 'Sledovanie výdavkov',
    expenseTrackingDesc: 'Sledujte osobné a obchodné výdavky s inteligentnými prehľadmi',
    aiFinancialAdvisor: 'AI finančný poradca',
    aiFinancialAdvisorDesc: 'Získajte personalizované poradenstvo o investíciách, hypotékach a úsporách',
    simpleTransparentPricing: 'Jednoduchý, transparentný cenník',
    choosePlanDesc: 'Vyberte si plán, ktorý vyhovuje vašim finančným potrebám',
    perfectForIndividuals: 'Ideálne pre jednotlivcov',
    personalExpenseTracking: 'Sledovanie osobných výdavkov',
    aiSpendingInsights: 'AI prehľady výdavkov',
    basicTaxCalculations: 'Základné daňové výpočty',
    savingsRecommendations: 'Odporúčania na úspory',
    financialGraphsReports: 'Finančné grafy a správy',
    mostPopular: 'Najpopulárnejšie',
    forEntrepreneurs: 'Pre podnikateľov a firmy',
    everythingInPersonal: 'Všetko z osobného',
    multiCountryTax: 'Viac-krajinové daňové výpočty',
    businessExpenseTracking: 'Sledovanie obchodných výdavkov',
    profitLossAnalysis: 'Analýza ziskov/strát',
    advancedAnalytics: 'Pokročilá analytika',
    trialInfo: '7-dňová bezplatná skúška • Žiadne poplatky za nastavenie • Zrušte kedykoľvek',
    empoweringFuture: 'Posilňujeme vašu finančnú budúcnosť pomocou umelej inteligencie',
    
    // About page
    aboutUs: 'O nás',
    aboutHero: 'Váš dôveryhodný partner vo finančnom riadení',
    ourMission: 'Naša misia',
    ourMissionText: 'Demokratizovať finančnú inteligenciu poskytovaním AI-poháňaných nástrojov, ktoré pomáhajú jednotlivcom a firmám robiť informované finančné rozhodnutia.',
    ourValues: 'Naše hodnoty',
    userCentric: 'Zamerané na používateľa',
    userCentricDesc: 'Váš úspech je našou prioritou. Každú funkciu navrhujeme s ohľadom na vaše potreby.',
    innovation: 'Inovácia',
    innovationDesc: 'Využívame špičkovú AI technológiu, aby sme vám poskytli najinteligentnejšie finančné prehľady.',
    trustSecurity: 'Dôvera a bezpečnosť',
    trustSecurityDesc: 'Vaše finančné údaje sú chránené bezpečnosťou a šifrovaním na úrovni bánk.',
    ourStory: 'Náš príbeh',
    ourStoryText: 'Založená v roku 2024, Legio Financial vznikla z vízie sprístupniť finančné riadenie každému. Náš tím finančných expertov a AI inžinierov spolupracuje na vytváraní nástrojov, ktoré zjednodušujú zložité finančné úlohy.',
    globalReach: 'Globálny dosah',
    supportedCountries: 'Podporované krajiny',
    
    // Contact page
    contactUs: 'Kontaktujte nás',
    contactHero: 'Máte otázky alebo potrebujete podporu? Sme tu, aby sme pomohli. Pošlite nám správu a my sa vám ozveme čo najskôr.',
    emailUs: 'Napíšte nám',
    emailResponse: 'Zvyčajne odpovedáme do 24 hodín',
    callUs: 'Zavolajte nám',
    callHours: 'Pondelok - Piatok, 9:00 - 18:00',
    visitUs: 'Navštívte nás',
    sendMessage: 'Pošlite nám správu',
    formDescription: 'Vyplňte formulár nižšie a my sa vám ozveme čo najskôr.',
    fullName: 'Celé meno',
    emailAddress: 'Emailová adresa',
    phoneNumber: 'Telefónne číslo',
    message: 'Správa',
    sendingMessage: 'Odosielanie...',
    messageSent: 'Správa odoslaná!',
    thankYouContact: 'Ďakujeme, že ste nás kontaktovali. Čoskoro sa vám ozveme.',
    errorSending: 'Nepodarilo sa odoslať správu. Skúste to prosím znova.',
    
    // Pricing page
    pricingHero: 'Vyberte si plán, ktorý vám vyhovuje. Začnite s 7-dňovou bezplatnou skúškou, nie je potrebná platobná karta.',
    savePercent: 'Ušetrite 10%',
    sale50Off: 'VÝPREDAJ 50% ZĽAVA',
    sale40Off: 'VÝPREDAJ 40% ZĽAVA',
    regularPrice: 'Bežná cena:',
    dayFreeTrial: '7-dňová bezplatná skúška',
    monthlySpendingAnalysis: 'Mesačná analýza výdavkov',
    basicFinancialInsights: 'Základné finančné prehľady',
    mobileAppAccess: 'Prístup k mobilnej aplikácii',
    emailSupport: 'Emailová podpora',
    businessExpenseManagement: 'Správa obchodných výdavkov',
    yearOverYearAnalysis: 'Medziročná analýza',
    investmentRecommendations: 'Investičné odporúčania',
    prioritySupport: 'Prioritná podpora',
    teamCollaboration: 'Tímová spolupráca',
    faqTitle: 'Často kladené otázky',
    faqTrialQ: 'Ako funguje bezplatná skúška?',
    faqTrialA: 'Získate plný prístup ku všetkým funkciám na 7 dní, nie je potrebná platobná karta. Po skúške sa môžete rozhodnúť pre predplatné a pokračovať v používaní služby.',
    faqChangeQ: 'Môžem kedykoľvek zmeniť plán?',
    faqChangeA: 'Áno! Môžete kedykoľvek upgradovať, downgradovať alebo zrušiť predplatné. Zmeny sa prejavia v nasledujúcom fakturačnom cykle.',
    faqCountriesQ: 'Ktoré krajiny sú podporované pre daňové výpočty?',
    faqCountriesA: 'Momentálne podporujeme daňové výpočty pre Slovensko, USA, UK, Nemecko a Francúzsko. Pravidelne pridávame ďalšie krajiny.',
    faqSecurityQ: 'Sú moje finančné údaje v bezpečí?',
    faqSecurityA: 'Absolútne. Používame šifrovanie a bezpečnostné opatrenia na úrovni bánk na ochranu vašich údajov. Vaše informácie sa nikdy nezdieľajú s tretími stranami bez vášho súhlasu.',
    
    // Footer
    productTitle: 'Produkt',
    supportTitle: 'Podpora',
    legalTitle: 'Právne',
    partnershipTitle: 'Partnerstvo',
    helpCenter: 'Centrum pomoci',
    privacyPolicy: 'Zásady ochrany osobných údajov',
    termsOfService: 'Podmienky služby',
    affiliateProgram: 'Affiliate program',
    partnerWithUs: 'Spolupracujte s nami',
    allRightsReserved: 'Všetky práva vyhradené',
    empoweringText: 'Posilňujeme jednotlivcov a firmy inteligentnými nástrojmi finančného riadenia.',
  },
  de: {
    // Navigation
    home: 'Startseite',
    about: 'Über uns',
    pricing: 'Preise',
    contact: 'Kontakt',
    getStarted: 'Loslegen',
    language: 'Sprache',
    currency: 'Währung',
    
    // Common
    personal: 'Persönlich',
    business: 'Geschäftlich',
    monthly: 'Monatlich',
    yearly: 'Jährlich',
    free: 'Kostenlos',
    features: 'Funktionen',
    startFreeTrial: 'Kostenlose Testversion starten',
    viewPricing: 'Preise ansehen',
    signUp: 'Registrieren',
    signIn: 'Anmelden',
    comingSoon: 'Demnächst',
    
    // Home/Index page
    aiPoweredFinancial: 'Ihr KI-gestützter Finanzassistent',
    heroDescription: 'Revolutionieren Sie Ihr Finanzmanagement mit KI. Berechnen Sie Steuern, verfolgen Sie Ausgaben, erhalten Sie Anlageberatung und optimieren Sie Ihre Finanzen über mehrere Länder hinweg.',
    start7DayTrial: '7-Tage-Testversion starten',
    noCreditCard: 'Keine Kreditkarte erforderlich • Jederzeit kündbar',
    smartTaxCalculator: 'Intelligenter Steuerrechner',
    smartTaxDesc: 'KI-gestützte Steuerberechnungen für die Slowakei, USA, UK, Deutschland und Frankreich',
    expenseTracking: 'Ausgabenverfolgung',
    expenseTrackingDesc: 'Verfolgen Sie persönliche und geschäftliche Ausgaben mit intelligenten Einblicken',
    aiFinancialAdvisor: 'KI-Finanzberater',
    aiFinancialAdvisorDesc: 'Erhalten Sie personalisierte Beratung zu Investitionen, Hypotheken und Ersparnissen',
    simpleTransparentPricing: 'Einfache, transparente Preise',
    choosePlanDesc: 'Wählen Sie den Plan, der Ihren finanziellen Bedürfnissen entspricht',
    perfectForIndividuals: 'Perfekt für Einzelpersonen',
    personalExpenseTracking: 'Persönliche Ausgabenverfolgung',
    aiSpendingInsights: 'KI-Ausgabeneinblicke',
    basicTaxCalculations: 'Grundlegende Steuerberechnungen',
    savingsRecommendations: 'Sparempfehlungen',
    financialGraphsReports: 'Finanzdiagramme und Berichte',
    mostPopular: 'Am beliebtesten',
    forEntrepreneurs: 'Für Unternehmer und Unternehmen',
    everythingInPersonal: 'Alles aus Persönlich',
    multiCountryTax: 'Länderübergreifende Steuerberechnungen',
    businessExpenseTracking: 'Geschäftsausgabenverfolgung',
    profitLossAnalysis: 'Gewinn-/Verlustanalyse',
    advancedAnalytics: 'Erweiterte Analysen',
    trialInfo: '7-Tage-Testversion • Keine Einrichtungsgebühren • Jederzeit kündbar',
    empoweringFuture: 'Stärken Sie Ihre finanzielle Zukunft mit künstlicher Intelligenz',
    
    // About page
    aboutUs: 'Über uns',
    aboutHero: 'Ihr vertrauenswürdiger Partner im Finanzmanagement',
    ourMission: 'Unsere Mission',
    ourMissionText: 'Finanzielle Intelligenz zu demokratisieren, indem wir KI-gestützte Tools bereitstellen, die Einzelpersonen und Unternehmen helfen, fundierte finanzielle Entscheidungen zu treffen.',
    ourValues: 'Unsere Werte',
    userCentric: 'Nutzerzentriert',
    userCentricDesc: 'Ihr Erfolg ist unsere Priorität. Wir gestalten jede Funktion mit Blick auf Ihre Bedürfnisse.',
    innovation: 'Innovation',
    innovationDesc: 'Wir nutzen modernste KI-Technologie, um Ihnen die intelligentesten Finanzeinblicke zu bieten.',
    trustSecurity: 'Vertrauen und Sicherheit',
    trustSecurityDesc: 'Ihre Finanzdaten sind mit bankenüblicher Sicherheit und Verschlüsselung geschützt.',
    ourStory: 'Unsere Geschichte',
    ourStoryText: 'Gegründet im Jahr 2024, entstand Legio Financial aus der Vision, Finanzmanagement für jeden zugänglich zu machen. Unser Team aus Finanzexperten und KI-Ingenieuren arbeitet zusammen, um Tools zu entwickeln, die komplexe Finanzaufgaben vereinfachen.',
    globalReach: 'Globale Reichweite',
    supportedCountries: 'Unterstützte Länder',
    
    // Contact page
    contactUs: 'Kontaktieren Sie uns',
    contactHero: 'Haben Sie Fragen oder benötigen Sie Unterstützung? Wir sind hier, um zu helfen. Senden Sie uns eine Nachricht und wir melden uns so schnell wie möglich bei Ihnen.',
    emailUs: 'E-Mail an uns',
    emailResponse: 'Wir antworten normalerweise innerhalb von 24 Stunden',
    callUs: 'Rufen Sie uns an',
    callHours: 'Montag - Freitag, 9:00 - 18:00 Uhr',
    visitUs: 'Besuchen Sie uns',
    sendMessage: 'Senden Sie uns eine Nachricht',
    formDescription: 'Füllen Sie das untenstehende Formular aus und wir werden uns so schnell wie möglich bei Ihnen melden.',
    fullName: 'Vollständiger Name',
    emailAddress: 'E-Mail-Adresse',
    phoneNumber: 'Telefonnummer',
    message: 'Nachricht',
    sendingMessage: 'Wird gesendet...',
    messageSent: 'Nachricht gesendet!',
    thankYouContact: 'Vielen Dank, dass Sie uns kontaktiert haben. Wir werden uns bald bei Ihnen melden.',
    errorSending: 'Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut.',
    
    // Pricing page
    pricingHero: 'Wählen Sie den Plan, der Ihren Bedürfnissen entspricht. Starten Sie mit einer 7-tägigen kostenlosen Testversion, keine Kreditkarte erforderlich.',
    savePercent: '10% sparen',
    sale50Off: 'SALE 50% RABATT',
    sale40Off: 'SALE 40% RABATT',
    regularPrice: 'Regulärer Preis:',
    dayFreeTrial: '7-Tage-Testversion',
    monthlySpendingAnalysis: 'Monatliche Ausgabenanalyse',
    basicFinancialInsights: 'Grundlegende Finanzeinblicke',
    mobileAppAccess: 'Zugriff auf mobile App',
    emailSupport: 'E-Mail-Support',
    businessExpenseManagement: 'Geschäftsausgabenverwaltung',
    yearOverYearAnalysis: 'Jahr-für-Jahr-Analyse',
    investmentRecommendations: 'Investitionsempfehlungen',
    prioritySupport: 'Vorrangiger Support',
    teamCollaboration: 'Teamzusammenarbeit',
    faqTitle: 'Häufig gestellte Fragen',
    faqTrialQ: 'Wie funktioniert die kostenlose Testversion?',
    faqTrialA: 'Sie erhalten 7 Tage lang vollen Zugriff auf alle Funktionen, ohne Kreditkarte. Nach der Testversion können Sie sich für ein Abonnement entscheiden, um den Service weiter zu nutzen.',
    faqChangeQ: 'Kann ich meinen Plan jederzeit ändern?',
    faqChangeA: 'Ja! Sie können Ihr Abonnement jederzeit upgraden, downgraden oder kündigen. Änderungen werden im nächsten Abrechnungszyklus wirksam.',
    faqCountriesQ: 'Welche Länder werden für Steuerberechnungen unterstützt?',
    faqCountriesA: 'Wir unterstützen derzeit Steuerberechnungen für die Slowakei, USA, UK, Deutschland und Frankreich. Weitere Länder werden regelmäßig hinzugefügt.',
    faqSecurityQ: 'Sind meine Finanzdaten sicher?',
    faqSecurityA: 'Absolut. Wir verwenden bankübliche Verschlüsselung und Sicherheitsmaßnahmen zum Schutz Ihrer Daten. Ihre Informationen werden niemals ohne Ihre Zustimmung an Dritte weitergegeben.',
    
    // Footer
    productTitle: 'Produkt',
    supportTitle: 'Support',
    legalTitle: 'Rechtliches',
    partnershipTitle: 'Partnerschaft',
    helpCenter: 'Hilfezentrum',
    privacyPolicy: 'Datenschutzrichtlinie',
    termsOfService: 'Nutzungsbedingungen',
    affiliateProgram: 'Partnerprogramm',
    partnerWithUs: 'Partner werden',
    allRightsReserved: 'Alle Rechte vorbehalten',
    empoweringText: 'Wir unterstützen Einzelpersonen und Unternehmen mit intelligenten Finanzmanagement-Tools.',
  },
  fr: {
    // Navigation
    home: 'Accueil',
    about: 'À propos',
    pricing: 'Tarification',
    contact: 'Contact',
    getStarted: 'Commencer',
    language: 'Langue',
    currency: 'Devise',
    
    // Common
    personal: 'Personnel',
    business: 'Entreprise',
    monthly: 'Mensuel',
    yearly: 'Annuel',
    free: 'Gratuit',
    features: 'Fonctionnalités',
    startFreeTrial: 'Commencer l\'essai gratuit',
    viewPricing: 'Voir les tarifs',
    signUp: 'S\'inscrire',
    signIn: 'Se connecter',
    comingSoon: 'Bientôt',
    
    // Home/Index page
    aiPoweredFinancial: 'Votre assistant financier alimenté par l\'IA',
    heroDescription: 'Révolutionnez votre gestion financière avec l\'IA. Calculez les impôts, suivez les dépenses, obtenez des conseils d\'investissement et optimisez vos finances dans plusieurs pays.',
    start7DayTrial: 'Commencer l\'essai gratuit de 7 jours',
    noCreditCard: 'Aucune carte de crédit requise • Annulez à tout moment',
    smartTaxCalculator: 'Calculateur d\'impôts intelligent',
    smartTaxDesc: 'Calculs fiscaux alimentés par l\'IA pour la Slovaquie, les États-Unis, le Royaume-Uni, l\'Allemagne et la France',
    expenseTracking: 'Suivi des dépenses',
    expenseTrackingDesc: 'Suivez les dépenses personnelles et professionnelles avec des analyses intelligentes',
    aiFinancialAdvisor: 'Conseiller financier IA',
    aiFinancialAdvisorDesc: 'Obtenez des conseils personnalisés sur les investissements, les hypothèques et l\'épargne',
    simpleTransparentPricing: 'Tarification simple et transparente',
    choosePlanDesc: 'Choisissez le plan qui correspond à vos besoins financiers',
    perfectForIndividuals: 'Parfait pour les particuliers',
    personalExpenseTracking: 'Suivi des dépenses personnelles',
    aiSpendingInsights: 'Analyses des dépenses par IA',
    basicTaxCalculations: 'Calculs fiscaux de base',
    savingsRecommendations: 'Recommandations d\'épargne',
    financialGraphsReports: 'Graphiques et rapports financiers',
    mostPopular: 'Le plus populaire',
    forEntrepreneurs: 'Pour les entrepreneurs et les entreprises',
    everythingInPersonal: 'Tout du Personnel',
    multiCountryTax: 'Calculs fiscaux multi-pays',
    businessExpenseTracking: 'Suivi des dépenses professionnelles',
    profitLossAnalysis: 'Analyse profits/pertes',
    advancedAnalytics: 'Analyses avancées',
    trialInfo: 'Essai gratuit de 7 jours • Pas de frais d\'installation • Annulez à tout moment',
    empoweringFuture: 'Renforcer votre avenir financier avec l\'intelligence artificielle',
    
    // About page
    aboutUs: 'À propos de nous',
    aboutHero: 'Votre partenaire de confiance en gestion financière',
    ourMission: 'Notre mission',
    ourMissionText: 'Démocratiser l\'intelligence financière en fournissant des outils alimentés par l\'IA qui aident les particuliers et les entreprises à prendre des décisions financières éclairées.',
    ourValues: 'Nos valeurs',
    userCentric: 'Centré sur l\'utilisateur',
    userCentricDesc: 'Votre succès est notre priorité. Nous concevons chaque fonctionnalité en pensant à vos besoins.',
    innovation: 'Innovation',
    innovationDesc: 'Nous exploitons la technologie IA de pointe pour vous fournir les analyses financières les plus intelligentes.',
    trustSecurity: 'Confiance et sécurité',
    trustSecurityDesc: 'Vos données financières sont protégées avec une sécurité et un cryptage de niveau bancaire.',
    ourStory: 'Notre histoire',
    ourStoryText: 'Fondée en 2024, Legio Financial est née de la vision de rendre la gestion financière accessible à tous. Notre équipe d\'experts financiers et d\'ingénieurs IA travaille ensemble pour créer des outils qui simplifient les tâches financières complexes.',
    globalReach: 'Portée mondiale',
    supportedCountries: 'Pays pris en charge',
    
    // Contact page
    contactUs: 'Contactez-nous',
    contactHero: 'Vous avez des questions ou besoin d\'aide ? Nous sommes là pour vous aider. Envoyez-nous un message et nous vous répondrons dès que possible.',
    emailUs: 'Envoyez-nous un e-mail',
    emailResponse: 'Nous répondons généralement dans les 24 heures',
    callUs: 'Appelez-nous',
    callHours: 'Lundi - Vendredi, 9h00 - 18h00',
    visitUs: 'Visitez-nous',
    sendMessage: 'Envoyez-nous un message',
    formDescription: 'Remplissez le formulaire ci-dessous et nous vous répondrons dès que possible.',
    fullName: 'Nom complet',
    emailAddress: 'Adresse e-mail',
    phoneNumber: 'Numéro de téléphone',
    message: 'Message',
    sendingMessage: 'Envoi en cours...',
    messageSent: 'Message envoyé !',
    thankYouContact: 'Merci de nous avoir contactés. Nous vous répondrons bientôt.',
    errorSending: 'Échec de l\'envoi du message. Veuillez réessayer.',
    
    // Pricing page
    pricingHero: 'Choisissez le plan qui correspond à vos besoins. Commencez par un essai gratuit de 7 jours, aucune carte de crédit requise.',
    savePercent: 'Économisez 10%',
    sale50Off: 'SOLDE 50% DE RÉDUCTION',
    sale40Off: 'SOLDE 40% DE RÉDUCTION',
    regularPrice: 'Prix régulier :',
    dayFreeTrial: 'Essai gratuit de 7 jours',
    monthlySpendingAnalysis: 'Analyse mensuelle des dépenses',
    basicFinancialInsights: 'Analyses financières de base',
    mobileAppAccess: 'Accès à l\'application mobile',
    emailSupport: 'Support par e-mail',
    businessExpenseManagement: 'Gestion des dépenses professionnelles',
    yearOverYearAnalysis: 'Analyse d\'une année sur l\'autre',
    investmentRecommendations: 'Recommandations d\'investissement',
    prioritySupport: 'Support prioritaire',
    teamCollaboration: 'Collaboration d\'équipe',
    faqTitle: 'Questions fréquemment posées',
    faqTrialQ: 'Comment fonctionne l\'essai gratuit ?',
    faqTrialA: 'Vous bénéficiez d\'un accès complet à toutes les fonctionnalités pendant 7 jours, sans carte de crédit requise. Après l\'essai, vous pouvez choisir de vous abonner pour continuer à utiliser le service.',
    faqChangeQ: 'Puis-je changer de plan à tout moment ?',
    faqChangeA: 'Oui ! Vous pouvez mettre à niveau, rétrograder ou annuler votre abonnement à tout moment. Les modifications prennent effet au prochain cycle de facturation.',
    faqCountriesQ: 'Quels pays sont pris en charge pour les calculs fiscaux ?',
    faqCountriesA: 'Nous prenons actuellement en charge les calculs fiscaux pour la Slovaquie, les États-Unis, le Royaume-Uni, l\'Allemagne et la France. D\'autres pays sont ajoutés régulièrement.',
    faqSecurityQ: 'Mes données financières sont-elles sécurisées ?',
    faqSecurityA: 'Absolument. Nous utilisons un cryptage et des mesures de sécurité de niveau bancaire pour protéger vos données. Vos informations ne sont jamais partagées avec des tiers sans votre consentement.',
    
    // Footer
    productTitle: 'Produit',
    supportTitle: 'Support',
    legalTitle: 'Légal',
    partnershipTitle: 'Partenariat',
    helpCenter: 'Centre d\'aide',
    privacyPolicy: 'Politique de confidentialité',
    termsOfService: 'Conditions d\'utilisation',
    affiliateProgram: 'Programme d\'affiliation',
    partnerWithUs: 'Devenez partenaire',
    allRightsReserved: 'Tous droits réservés',
    empoweringText: 'Autonomiser les particuliers et les entreprises avec des outils intelligents de gestion financière.',
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