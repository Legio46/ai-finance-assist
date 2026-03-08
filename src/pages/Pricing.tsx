import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Pricing = () => {
  const { toast } = useToast();
  const { t, formatCurrency } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = (plan: string) => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in or create an account before subscribing." });
      navigate('/auth');
      return;
    }
    supabase.functions.invoke('create-checkout', { body: { plan } }).then(({ data, error }) => {
      if (error) {
        toast({ title: "Error", description: "Failed to create checkout session", variant: "destructive" });
      } else if (data?.url) {
        window.open(data.url, '_blank');
      }
    });
  };

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

  const faqs = [
    { q: t('faqTrialQ'), a: t('faqTrialA') },
    { q: t('faqChangeQ'), a: t('faqChangeA') },
    { q: t('faqCountriesQ'), a: t('faqCountriesA') },
    { q: t('faqSecurityQ'), a: t('faqSecurityA') },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-20 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="container relative mx-auto px-4 py-20 text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 inline" />
            Simple pricing
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">{t('simpleTransparentPricing')}</h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Choose the perfect plan for your financial needs
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 -mt-4 pb-24">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Basic */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl">Personal Basic</CardTitle>
              <CardDescription>Perfect for individuals starting out</CardDescription>
              <div className="mt-5">
                <span className="text-4xl font-bold">{formatCurrency(5)}</span>
                <span className="text-muted-foreground text-sm ml-1">/{t('monthly')}</span>
              </div>
              <Badge variant="outline" className="w-fit mx-auto mt-3 text-xs">{t('dayFreeTrial')}</Badge>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ul className="space-y-3 mb-8 flex-1">
                {basicFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button onClick={() => handleCheckout('basic')} variant="outline" className="w-full rounded-xl h-11">
                {t('startFreeTrial')}
              </Button>
            </CardContent>
          </Card>

          {/* Pro */}
          <Card className="relative border-2 border-primary shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col scale-[1.02]">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md px-4 py-1 gap-1.5">
                <Star className="w-3.5 h-3.5" />
                {t('mostPopular')}
              </Badge>
            </div>
            <CardHeader className="text-center pt-10 pb-4">
              <CardTitle className="text-xl">Personal Pro</CardTitle>
              <CardDescription>For serious financial planning</CardDescription>
              <div className="mt-5">
                <span className="text-4xl font-bold text-primary">{formatCurrency(10)}</span>
                <span className="text-muted-foreground text-sm ml-1">/{t('monthly')}</span>
              </div>
              <Badge variant="outline" className="w-fit mx-auto mt-3 text-xs border-primary/30 text-primary">{t('dayFreeTrial')}</Badge>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ul className="space-y-3 mb-8 flex-1">
                {proFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button onClick={() => handleCheckout('pro')} className="w-full rounded-xl h-11 shadow-md">
                {t('startFreeTrial')}
              </Button>
            </CardContent>
          </Card>

          {/* Business */}
          <Card className="border-0 shadow-lg flex flex-col opacity-80">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <Badge variant="secondary" className="px-4 py-1">Coming Soon</Badge>
            </div>
            <CardHeader className="text-center pt-10 pb-4">
              <CardTitle className="text-xl">{t('business')}</CardTitle>
              <CardDescription>{t('forEntrepreneurs')}</CardDescription>
              <div className="mt-5">
                <span className="text-4xl font-bold text-muted-foreground">TBA</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ul className="space-y-3 mb-8 flex-1">
                {["Multi-entity management", "Advanced tax planning", "Team collaboration", "Priority support"].map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <span className="text-sm text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Button disabled variant="outline" className="w-full rounded-xl h-11">Notify Me</Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 pb-24">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">{t('faqTitle')}</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`} className="border rounded-xl px-5 shadow-sm data-[state=open]:shadow-md transition-shadow">
                <AccordionTrigger className="text-sm font-semibold hover:no-underline py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
