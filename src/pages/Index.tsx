import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  TrendingUp, 
  PiggyBank, 
  Shield, 
  Users, 
  Star,
  Check,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Index = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              FinanceAI
            </h1>
            <Badge className="bg-gradient-primary text-white">Beta</Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/auth">
              <Button variant="outline">{t('signIn')}</Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-gradient-primary hover:opacity-90">
                {t('startFreeTrial')}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            {t('aiPoweredFinancial')}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            {t('heroDescription')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-lg px-8 py-6">
                {t('start7DayTrial')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              {t('noCreditCard')}
            </p>
          </div>

          {/* Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <Card className="text-center border-0 bg-card/50 backdrop-blur">
              <CardHeader>
                <Calculator className="w-12 h-12 mx-auto mb-4 text-primary" />
                <CardTitle>{t('smartTaxCalculator')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('smartTaxDesc')}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 bg-card/50 backdrop-blur">
              <CardHeader>
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-primary" />
                <CardTitle>{t('expenseTracking')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('expenseTrackingDesc')}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 bg-card/50 backdrop-blur">
              <CardHeader>
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-primary" />
                <CardTitle>{t('aiFinancialAdvisor')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('aiFinancialAdvisorDesc')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{t('simpleTransparentPricing')}</h2>
            <p className="text-xl text-muted-foreground">
              {t('choosePlanDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Personal Plan */}
            <Card className="relative border-2">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">{t('personal')}</CardTitle>
                <CardDescription>{t('perfectForIndividuals')}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$29.99</span>
                  <span className="text-muted-foreground">/{t('monthly')}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-success" />
                  <span>{t('personalExpenseTracking')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-success" />
                  <span>{t('aiSpendingInsights')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-success" />
                  <span>{t('basicTaxCalculations')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-success" />
                  <span>{t('savingsRecommendations')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-success" />
                  <span>{t('financialGraphsReports')}</span>
                </div>
                <Link to="/auth" className="block">
                  <Button className="w-full mt-8 bg-gradient-primary hover:opacity-90">
                    {t('startFreeTrial')}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Business Plan */}
            <Card className="relative border-2 border-primary">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Badge className="bg-gradient-primary text-white px-4 py-1">
                  {t('mostPopular')}
                </Badge>
              </div>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">{t('business')}</CardTitle>
                <CardDescription>{t('forEntrepreneurs')}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$49.99</span>
                  <span className="text-muted-foreground">/{t('monthly')}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-success" />
                  <span>{t('everythingInPersonal')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-success" />
                  <span>{t('multiCountryTax')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-success" />
                  <span>{t('businessExpenseTracking')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-success" />
                  <span>{t('profitLossAnalysis')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-success" />
                  <span>{t('aiFinancialAdvisor')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-success" />
                  <span>{t('advancedAnalytics')}</span>
                </div>
                <Link to="/auth" className="block">
                  <Button className="w-full mt-8 bg-gradient-primary hover:opacity-90">
                    {t('startFreeTrial')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground">
              <Shield className="inline w-4 h-4 mr-1" />
              {t('trialInfo')}
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-card/30">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <h3 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              FinanceAI
            </h3>
          </div>
          <p className="text-muted-foreground mb-6">
            {t('empoweringFuture')}
          </p>
          <div className="flex justify-center space-x-6">
            <Link to="/auth" className="text-muted-foreground hover:text-primary">
              {t('getStarted')}
            </Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-primary">
              {t('privacyPolicy')}
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-primary">
              {t('termsOfService')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
