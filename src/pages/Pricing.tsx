import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const Pricing = () => {
  const { toast } = useToast();
  const { t, formatCurrency } = useLanguage();
  
  const basicFeatures = [
    "Track expenses and income (cash + cards)",
    "Bank import via open banking or manual",
    "Automatic transaction categorization",
    "Monthly overview dashboard with charts",
    "Interactive charts (pie, bar, line)",
    "Simple budget setting and tracking",
    "Export data (CSV/PDF)"
  ];

  const proFeatures = [
    "Everything in Basic +",
    "Recurring payment tracking with reminders",
    "Investment tracking (stocks, crypto, ETFs, real estate)",
    "Live prices and portfolio performance",
    "Financial calendar (bills, paydays, dividends)",
    "AI financial advisor chat",
    "Advanced financial planning tools",
    "Net worth forecasting & retirement planner",
    "Goal tracking with progress bars"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-6">{t('simpleTransparentPricing')}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your financial needs
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {/* Personal Basic Plan */}
          <Card className="relative">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Personal Basic</CardTitle>
              <CardDescription>Perfect for individuals starting out</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">{formatCurrency(5)}</span>
                <span className="text-muted-foreground">/{t('monthly')}</span>
              </div>
              <Badge variant="secondary" className="w-fit mx-auto mt-2">{t('dayFreeTrial')}</Badge>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {basicFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                onClick={() => {
                  supabase.functions.invoke('create-checkout', {
                    body: { plan: 'basic' }
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

          {/* Personal Pro Plan */}
          <Card className="relative border-primary border-2">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">{t('mostPopular')}</Badge>
            </div>
            <CardHeader className="text-center pt-8">
              <CardTitle className="text-2xl">Personal Pro</CardTitle>
              <CardDescription>For serious financial planning</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">{formatCurrency(10)}</span>
                <span className="text-muted-foreground">/{t('monthly')}</span>
              </div>
              <Badge variant="secondary" className="w-fit mx-auto mt-2">{t('dayFreeTrial')}</Badge>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {proFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                onClick={() => {
                  supabase.functions.invoke('create-checkout', {
                    body: { plan: 'pro' }
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

          {/* Business Plan - Coming Soon */}
          <Card className="relative opacity-75">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
            <CardHeader className="text-center pt-8">
              <CardTitle className="text-2xl">{t('business')}</CardTitle>
              <CardDescription>{t('forEntrepreneurs')}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-muted-foreground">TBA</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Multi-entity management</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Advanced tax planning</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Team collaboration</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Priority support</span>
                </li>
              </ul>
              <Button 
                disabled
                variant="outline"
                className="w-full"
              >
                Notify Me
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Free Currency Converter CTA */}
        <Card className="max-w-4xl mx-auto mb-16 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="text-center py-8">
            <h3 className="text-2xl font-bold mb-4">
              Need a Currency Converter? It's Free!
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Access our real-time currency converter for all major currencies and cryptocurrencies—no signup required.
            </p>
            <Link to="/converter">
              <Button size="lg" variant="outline">Try Free Converter</Button>
            </Link>
          </CardContent>
        </Card>

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
