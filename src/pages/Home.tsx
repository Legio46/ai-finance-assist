import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Calculator, TrendingUp, DollarSign, Shield, Users, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Home = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Legio Financial
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          The complete AI-powered financial platform for entrepreneurs and individuals. 
          Manage taxes, track expenses, and get expert financial advice all in one place.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button asChild size="lg" className="text-lg px-8">
            <Link to="/auth">{t('startFreeTrial')}</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-8">
            <Link to="/pricing">{t('viewPricing')}</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">{t('powerfulFeatures')}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <Calculator className="w-12 h-12 mx-auto text-primary mb-4" />
              <CardTitle>Smart Tax Calculator</CardTitle>
              <CardDescription>
                Calculate taxes for Slovakia, USA, UK, Germany, and France with precision
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <TrendingUp className="w-12 h-12 mx-auto text-primary mb-4" />
              <CardTitle>Expense Tracking</CardTitle>
              <CardDescription>
                Track personal and business expenses with intelligent categorization
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <DollarSign className="w-12 h-12 mx-auto text-primary mb-4" />
              <CardTitle>Financial Advisor</CardTitle>
              <CardDescription>
                Get personalized advice on investments, mortgages, and savings
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-secondary/10 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Legio?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Shield className="w-12 h-12 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Bank-Level Security</h3>
              <p className="text-muted-foreground">Your data is protected with enterprise-grade encryption</p>
            </div>
            <div className="text-center">
              <Users className="w-12 h-12 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Personal & Business</h3>
              <p className="text-muted-foreground">One platform for all your financial needs</p>
            </div>
            <div className="text-center">
              <Globe className="w-12 h-12 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Multi-Country Support</h3>
              <p className="text-muted-foreground">Tax calculations for 5 major countries</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Take Control of Your Finances?</h2>
        <p className="text-xl text-muted-foreground mb-8">
          Join thousands of users who trust Legio with their financial management
        </p>
        <Button asChild size="lg" className="text-lg px-8">
          <Link to="/auth">Start Your Free Trial Today</Link>
        </Button>
      </section>
    </div>
  );
};

export default Home;