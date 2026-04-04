import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const Pricing = () => {
  const { toast } = useToast();
  const { t, formatCurrency } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);

  const basicMonthly = 5;
  const proMonthly = 10;
  const basicAnnualMonthly = basicMonthly * 0.9;
  const proAnnualMonthly = proMonthly * 0.8;
  const basicAnnualTotal = basicAnnualMonthly * 12;
  const proAnnualTotal = proAnnualMonthly * 12;

  const currentBasicPrice = isAnnual ? basicAnnualMonthly : basicMonthly;
  const currentProPrice = isAnnual ? proAnnualMonthly : proMonthly;

  const handleCheckout = (plan: string) => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in or create an account before subscribing." });
      navigate('/auth');
      return;
    }
    const billingPeriod = isAnnual ? 'annual' : 'monthly';
    supabase.functions.invoke('create-checkout', { body: { plan, billingPeriod } }).then(({ data, error }) => {
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

  const PricingCard = ({ title, desc, price, features, isPopular, onCheckout, annualPrice, annualTotal, monthlyBase }: any) => (
    <div className={`relative rounded-2xl p-7 flex flex-col transition-all ${isPopular ? 'scale-[1.02]' : ''}`}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: isPopular ? '2px solid hsl(40 88% 69%)' : '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(28px)',
        boxShadow: isPopular ? '0 0 40px rgba(245,201,106,0.15)' : undefined,
      }}>
      {isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-xs font-medium"
            style={{ background: 'linear-gradient(135deg, hsl(40 88% 69%), hsl(40 80% 55%))', color: '#0c1a35' }}>
            <Star className="w-3.5 h-3.5" />
            {t('mostPopular')}
          </span>
        </div>
      )}
      <div className="text-center pb-4">
        <h3 className="text-lg font-bold text-foreground font-serif">{title}</h3>
        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{desc}</p>
        <div className="mt-5">
          <span className={`text-4xl font-bold font-serif ${isPopular ? 'text-primary' : 'text-foreground'}`}>
            {formatCurrency(price)}
          </span>
          <span className="text-xs ml-1" style={{ color: 'rgba(255,255,255,0.4)' }}>/{t('monthly')}</span>
        </div>
        {isAnnual && (
          <div className="mt-2 space-y-1">
            <p className="text-xs line-through" style={{ color: 'rgba(255,255,255,0.3)' }}>{formatCurrency(monthlyBase)}/mo</p>
            <span className="inline-block text-xs rounded-full px-3 py-0.5" style={{
              background: 'rgba(52,211,153,0.12)',
              color: '#34d399',
              border: '1px solid rgba(52,211,153,0.2)',
            }}>{isPopular ? '20%' : '10%'} off — {formatCurrency(annualTotal)}/year</span>
          </div>
        )}
        {!isAnnual && (
          <span className="inline-block mt-3 text-xs rounded-full px-3 py-0.5" style={{
            border: isPopular ? '1px solid rgba(245,201,106,0.3)' : '1px solid rgba(255,255,255,0.12)',
            color: isPopular ? 'hsl(40 88% 69%)' : 'rgba(255,255,255,0.4)',
          }}>{t('dayFreeTrial')}</span>
        )}
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature: string, index: number) => (
          <li key={index} className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: 'rgba(245,201,106,0.12)' }}>
              <Check className="w-3 h-3 text-primary" />
            </div>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{feature}</span>
          </li>
        ))}
      </ul>
      <button onClick={onCheckout}
        className="w-full rounded-xl h-11 text-sm font-medium font-sans transition-all"
        style={isPopular ? {
          background: '#2563eb',
          color: '#fff',
          boxShadow: '0 4px 24px rgba(37,99,235,0.4)',
        } : {
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: 'rgba(255,255,255,0.8)',
        }}>
        {t('startFreeTrial')}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 text-center">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(11,61,140,0.3) 0%, rgba(12,26,53,0.95) 100%)' }} />
        <div className="container relative mx-auto px-4">
          <div className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium mb-6"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.9)' }}>
            <Sparkles className="w-3.5 h-3.5" />
            Simple pricing
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-foreground">{t('simpleTransparentPricing')}</h1>
          <p className="text-sm max-w-lg mx-auto mb-8" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Choose the perfect plan for your financial needs
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 font-sans">
            <Label htmlFor="billing-toggle" className={`text-sm font-medium ${!isAnnual ? 'text-foreground' : ''}`} style={isAnnual ? { color: 'rgba(255,255,255,0.4)' } : undefined}>
              Monthly
            </Label>
            <Switch id="billing-toggle" checked={isAnnual} onCheckedChange={setIsAnnual} />
            <Label htmlFor="billing-toggle" className={`text-sm font-medium ${isAnnual ? 'text-foreground' : ''}`} style={!isAnnual ? { color: 'rgba(255,255,255,0.4)' } : undefined}>
              Annually
            </Label>
            {isAnnual && (
              <span className="ml-2 text-xs rounded-full px-3 py-0.5" style={{
                background: 'rgba(52,211,153,0.12)',
                color: '#34d399',
                border: '1px solid rgba(52,211,153,0.2)',
              }}>Save up to 20%</span>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 -mt-4 pb-24">
        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          <PricingCard
            title="Personal Basic"
            desc="Perfect for individuals starting out"
            price={currentBasicPrice}
            features={basicFeatures}
            isPopular={false}
            onCheckout={() => handleCheckout('basic')}
            annualPrice={basicAnnualMonthly}
            annualTotal={basicAnnualTotal}
            monthlyBase={basicMonthly}
          />
          <PricingCard
            title="Personal Pro"
            desc="For serious financial planning"
            price={currentProPrice}
            features={proFeatures}
            isPopular={true}
            onCheckout={() => handleCheckout('pro')}
            annualPrice={proAnnualMonthly}
            annualTotal={proAnnualTotal}
            monthlyBase={proMonthly}
          />
          <div className="relative rounded-2xl p-7 flex flex-col opacity-70"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(28px)',
            }}>
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="inline-block rounded-full px-4 py-1 text-xs font-medium"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>Coming Soon</span>
            </div>
            <div className="text-center pt-4 pb-4">
              <h3 className="text-lg font-bold text-foreground font-serif">{t('business')}</h3>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('forEntrepreneurs')}</p>
              <div className="mt-5">
                <span className="text-4xl font-bold font-serif" style={{ color: 'rgba(255,255,255,0.4)' }}>TBA</span>
              </div>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {["Multi-entity management", "Advanced planning", "Team collaboration", "Priority support"].map((f, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <Check className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.3)' }} />
                  </div>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{f}</span>
                </li>
              ))}
            </ul>
            <button disabled className="w-full rounded-xl h-11 text-sm font-medium font-sans"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }}>
              Notify Me
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 pb-24">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10 text-foreground">{t('faqTitle')}</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`} className="rounded-xl px-5 transition-shadow"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                <AccordionTrigger className="text-sm font-semibold font-sans hover:no-underline py-4 text-foreground">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm pb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
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