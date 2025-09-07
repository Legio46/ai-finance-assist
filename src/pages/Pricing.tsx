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
    "Personal expense tracking",
    "Monthly spending analysis",
    "Savings recommendations",
    "Basic financial insights",
    "Mobile app access",
    "Email support"
  ];

  const businessFeatures = [
    "Everything in Personal",
    "Multi-country tax calculations",
    "Business expense management",
    "Year-over-year analysis",
    "Financial advisor AI",
    "Investment recommendations",
    "Priority support",
    "Advanced analytics",
    "Team collaboration"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. Start with a 7-day free trial, no credit card required.
          </p>
          
          {/* Yearly/Monthly Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm ${!isYearly ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              Monthly
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
              Yearly
            </span>
            {isYearly && (
              <Badge variant="secondary" className="ml-2">
                Save 10%
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Personal Plan */}
          <Card className="relative">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{t('personal')}</CardTitle>
              <CardDescription>Perfect for individuals managing personal finances</CardDescription>
              <div className="mt-4">
                {isYearly ? (
                  <>
                    <span className="text-4xl font-bold">{formatCurrency(323.89)}</span>
                    <span className="text-muted-foreground">/{t('yearly')}</span>
                    <div className="text-sm text-muted-foreground">
                      <span className="line-through">{formatCurrency(359.88)}</span> Save {formatCurrency(35.99)}
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-4xl font-bold">{formatCurrency(29.99)}</span>
                    <span className="text-muted-foreground">/{t('monthly')}</span>
                  </>
                )}
              </div>
              <Badge variant="secondary" className="w-fit mx-auto mt-2">7-day {t('free')} trial</Badge>
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
            Start Free Trial
          </Button>
            </CardContent>
          </Card>

          {/* Business Plan */}
          <Card className="relative border-primary">
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
            </div>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{t('business')}</CardTitle>
              <CardDescription>For entrepreneurs and businesses of all sizes</CardDescription>
              <div className="mt-4">
                {isYearly ? (
                  <>
                    <span className="text-4xl font-bold">{formatCurrency(539.89)}</span>
                    <span className="text-muted-foreground">/{t('yearly')}</span>
                    <div className="text-sm text-muted-foreground">
                      <span className="line-through">{formatCurrency(599.88)}</span> Save {formatCurrency(59.99)}
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-4xl font-bold">{formatCurrency(49.99)}</span>
                    <span className="text-muted-foreground">/{t('monthly')}</span>
                  </>
                )}
              </div>
              <Badge variant="secondary" className="w-fit mx-auto mt-2">7-day {t('free')} trial</Badge>
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
            Start Free Trial
          </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How does the free trial work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  You get full access to all features for 7 days, no credit card required. 
                  After the trial, you can choose to subscribe to continue using the service.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I change plans anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! You can upgrade, downgrade, or cancel your subscription at any time. 
                  Changes take effect at the next billing cycle.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Which countries are supported for tax calculations?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We currently support tax calculations for Slovakia, USA, UK, Germany, and France. 
                  More countries are being added regularly.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is my financial data secure?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Absolutely. We use bank-level encryption and security measures to protect your data. 
                  Your information is never shared with third parties without your consent.
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