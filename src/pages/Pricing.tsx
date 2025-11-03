import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const Pricing = () => {
  const { toast } = useToast();
  const { t, formatCurrency } = useLanguage();
  const [isYearly, setIsYearly] = useState(false);
  
  const personalFeatures = [
    t('personalExpenseTracking'),
    t('monthlySpendingAnalysis'),
    t('savingsRecommendations'),
    t('basicFinancialInsights'),
    t('mobileAppAccess'),
    t('emailSupport')
  ];

  const businessFeatures = [
    t('everythingInPersonal'),
    t('multiCountryTaxCalc'),
    t('businessExpenseManagement'),
    t('yearOverYearAnalysis'),
    t('financialAdvisorAI'),
    t('investmentRecommendations'),
    t('prioritySupport'),
    t('advancedAnalytics'),
    t('teamCollaboration')
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-6">{t('simpleTransparentPricing')}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('chooseThePlan')}
          </p>
          
          {/* Yearly/Monthly Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm ${!isYearly ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              {t('monthly')}
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                isYearly ? 'bg-primary' : 'bg-input'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                  isYearly ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${isYearly ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              {t('yearly')}
            </span>
            {isYearly && (
              <Badge variant="secondary" className="ml-2">
                {t('savePercent')}
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Personal Plan */}
          <Card className="relative">
            <div className="absolute -top-2 right-4">
              <Badge className="bg-destructive text-destructive-foreground">{t('sale50Off')}</Badge>
            </div>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{t('personal')}</CardTitle>
              <CardDescription>{t('perfectForIndividuals')}</CardDescription>
              <div className="mt-4">
                {isYearly ? (
                  <>
                    <span className="text-4xl font-bold">{formatCurrency(161.89)}</span>
                    <span className="text-muted-foreground">/{t('yearly')}</span>
                    <div className="text-sm text-muted-foreground">
                      <span className="line-through">{formatCurrency(179.88)}</span> {t('savePercent')}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {t('regularPrice')} <span className="line-through">{formatCurrency(323.78)}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl text-muted-foreground line-through">{formatCurrency(29.99)}</span>
                      <span className="text-4xl font-bold">{formatCurrency(14.99)}</span>
                    </div>
                    <span className="text-muted-foreground">/{t('monthly')}</span>
                  </>
                )}
              </div>
              <Badge variant="secondary" className="w-fit mx-auto mt-2">{t('dayFreeTrial')}</Badge>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {personalFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
          <Button 
            onClick={() => {
              supabase.functions.invoke('create-checkout', {
                body: { plan: 'personal' }
              }).then(({ data, error }) => {
                if (error) {
                  toast({
                    title: "Error",
                    description: "Failed to create checkout session",
                    variant: "destructive",
                  });
                } else if (data?.url) {
                  window.open(data.url, '_blank');
                }
              });
            }}
            className="w-full"
          >
            {t('startFreeTrial')}
          </Button>
            </CardContent>
          </Card>

          {/* Business Plan */}
          <Card className="relative border-primary">
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 flex gap-2">
              <Badge className="bg-primary text-primary-foreground">{t('mostPopular')}</Badge>
              <Badge className="bg-destructive text-destructive-foreground">{t('sale40Off')}</Badge>
            </div>
            <CardHeader className="text-center pt-8">
              <CardTitle className="text-2xl">{t('business')}</CardTitle>
              <CardDescription>{t('forEntrepreneurs')}</CardDescription>
              <div className="mt-4">
                {isYearly ? (
                  <>
                    <span className="text-4xl font-bold">{formatCurrency(323.89)}</span>
                    <span className="text-muted-foreground">/{t('yearly')}</span>
                    <div className="text-sm text-muted-foreground">
                      <span className="line-through">{formatCurrency(359.88)}</span> {t('savePercent')}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {t('regularPrice')} <span className="line-through">{formatCurrency(539.78)}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl text-muted-foreground line-through">{formatCurrency(49.99)}</span>
                      <span className="text-4xl font-bold">{formatCurrency(29.99)}</span>
                    </div>
                    <span className="text-muted-foreground">/{t('monthly')}</span>
                  </>
                )}
              </div>
              <Badge variant="secondary" className="w-fit mx-auto mt-2">{t('dayFreeTrial')}</Badge>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {businessFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
          <Button 
            onClick={() => {
              supabase.functions.invoke('create-checkout', {
                body: { plan: 'business' }
              }).then(({ data, error }) => {
                if (error) {
                  toast({
                    title: "Error",
                    description: "Failed to create checkout session",
                    variant: "destructive",
                  });
                } else if (data?.url) {
                  window.open(data.url, '_blank');
                }
              });
            }}
            className="w-full"
          >
            {t('startFreeTrial')}
          </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">{t('faqTitle')}</h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('faqTrialQ')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('faqTrialA')}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('faqChangeQ')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('faqChangeA')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('faqCountriesQ')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('faqCountriesA')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('faqSecurityQ')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('faqSecurityA')}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Pricing;