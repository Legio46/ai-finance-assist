import React, { createContext, useContext, useState } from 'react';

interface LanguageContextType {
  language: string;
  currency: string;
  setLanguage: (lang: string) => void;
  setCurrency: (curr: string) => void;
  t: (key: string) => string;
  formatCurrency: (amount: number) => string;
}

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
];

export const currencies: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
];

const translations: Record<string, string> = {
  // Navigation
  home: 'Home',
  pricing: 'Pricing',
  contact: 'Contact',
  affiliate: 'Affiliate',
  currencyConverter: 'Currency Converter',
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
  heroSubtitle: 'The complete AI-powered financial platform for entrepreneurs and individuals. Track expenses, manage budgets, and get expert financial advice all in one place.',
  startFreeTrial: 'Start Free Trial',
  viewPricing: 'View Pricing',
  powerfulFeatures: 'Powerful Features',
  smartTaxCalculator: 'Smart Tax Calculator',
  taxCalculatorDesc: 'Calculate taxes for Slovakia, USA, UK, Germany, and France with precision',
  expenseTracking: 'Expense Tracking',
  expenseTrackingDesc: 'Bank-level encryption and AI-powered insights, not just categorization',
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
  empoweringText: 'Empowering individuals and businesses with intelligent financial management',
  allRightsReserved: 'All rights reserved',
  footerRights: 'All rights reserved',
  productTitle: 'Product',
  supportTitle: 'Support',
  legalTitle: 'Legal',
  partnershipTitle: 'Partnership',
  partnerWithUs: 'Partner with us',
  helpCenter: 'Help Center',
  privacyPolicy: 'Privacy Policy',
  termsOfService: 'Terms of Service',
  affiliateProgram: 'Affiliate Program',

  // FAQ
  faqTitle: 'Frequently Asked Questions',
  faqTrialQ: 'Is there really a free trial?',
  faqTrialA: 'Yes! All new users get a 7-day free trial with full access to all features. No credit card required.',
  faqChangeQ: 'Can I change or cancel my plan?',
  faqChangeA: 'Absolutely. You can upgrade, downgrade, or cancel your subscription at any time from your account settings.',
  faqCountriesQ: 'Which countries are supported?',
  faqCountriesA: 'We serve users globally. Our platform supports multiple currencies to help you manage your finances wherever you are.',
  faqSecurityQ: 'How secure is my financial data?',
  faqSecurityA: 'We use bank-grade encryption and security measures to protect your data. Your information is encrypted at rest and in transit, and we never share your data with third parties.',

  // Pricing
  monthly: 'Monthly',
  yearly: 'Yearly',
  savePercent: 'Save 10%',
  sale50Off: '50% OFF',
  sale40Off: '40% OFF',
  mostPopular: 'Most Popular',
  perfectForIndividuals: 'Perfect for individuals managing personal finances',
  forEntrepreneurs: 'For entrepreneurs and business owners',
  dayFreeTrial: '7-day Free Trial',
  regularPrice: 'Regular Price',

  // Admin Dashboard
  aboutTitle: 'About Legio Financial',
  affiliateTitle: 'Affiliate Program',
  affiliateDescription: 'Earn money by referring new users to Legio Financial',
  adminDashboard: 'Admin Dashboard',
  userManagement: 'User Management',
  securityEvents: 'Security Events',
  activityLogs: 'Activity Logs',
  totalRevenue: 'Total Revenue',
  activeUsers: 'Active Users',
  sales: 'Sales',
  activeNow: 'Active Now',

  // Contact Page
  contactUs: 'Contact Us',
  contactHero: "Have questions? We're here to help. Get in touch with our team.",
  emailUs: 'Email Us',
  emailResponse: "We'll respond within 24 hours",
  sendMessage: 'Send us a Message',
  formDescription: "Fill out the form below and we'll get back to you as soon as possible.",
  emailAddress: 'Email Address',
  phoneNumber: 'Phone Number',
  message: 'Message',
  messageSent: 'Message Sent!',
  thankYouContact: "Thank you for contacting us. We'll get back to you soon.",
  errorSending: 'There was an error sending your message. Please try again.',
  sendingMessage: 'Sending...',

  // AI Advisor
  aiAdvisorPlaceholder: 'Ask about taxes, expenses, or financial planning...',
  tryAsking: 'Try asking:',

  // Pricing Features
  personalExpenseTracking: 'Personal expense tracking',
  monthlySpendingAnalysis: 'Monthly spending analysis',
  savingsRecommendations: 'Savings recommendations',
  basicFinancialInsights: 'Basic financial insights',
  mobileAppAccess: 'Mobile app access',
  emailSupport: 'Email support',
  multiLanguageSupport: 'Multi-currency support',
  everythingInPersonal: 'Everything in Personal',
  multiCountryTaxCalc: 'Multi-country tax calculations',
  businessExpenseManagement: 'Business expense management',
  yearOverYearAnalysis: 'Year-over-year analysis',
  financialAdvisorAI: 'Financial advisor AI',
  investmentRecommendations: 'Investment recommendations',
  prioritySupport: 'Priority support',
  advancedAnalytics: 'Advanced analytics',
  teamCollaboration: 'Team collaboration',
  simpleTransparentPricing: 'Simple, Transparent Pricing',
  chooseThePlan: 'Choose the plan that fits your needs. Start with a 7-day free trial, no credit card required.',
  upgradeToBusiness: 'Upgrade to Business Plan',
  businessFeaturesLocked: 'Business features are only available with the Business plan',
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [currency, setCurrency] = useState(() => localStorage.getItem('preferred_currency') || 'EUR');

  const t = (key: string): string => translations[key] || key;

  const formatCurrency = (amount: number): string => {
    const curr = currencies.find(c => c.code === currency);
    return `${curr?.symbol || '€'}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleSetCurrency = (curr: string) => {
    setCurrency(curr);
    localStorage.setItem('preferred_currency', curr);
  };

  return (
    <LanguageContext.Provider value={{
      language: 'en',
      currency,
      setLanguage: () => {},
      setCurrency: handleSetCurrency,
      t,
      formatCurrency,
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
