import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Calculator, TrendingUp, DollarSign, Shield, Users, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/logo.png";

const Home = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <img src={logo} alt="Legio Finance" className="h-24 mx-auto mb-6" />
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {t('heroTitle')}
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          {t('heroSubtitle')}
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
              <CardTitle>{t('smartTaxCalculator')}</CardTitle>
              <CardDescription>
                {t('taxCalculatorDesc')}
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <TrendingUp className="w-12 h-12 mx-auto text-primary mb-4" />
              <CardTitle>{t('expenseTracking')}</CardTitle>
              <CardDescription>
                {t('expenseTrackingDesc')}
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <DollarSign className="w-12 h-12 mx-auto text-primary mb-4" />
              <CardTitle>{t('financialAdvisor')}</CardTitle>
              <CardDescription>
                {t('financialAdvisorDesc')}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-secondary/10 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t('whyChooseLegio')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Shield className="w-12 h-12 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('bankLevelSecurity')}</h3>
              <p className="text-muted-foreground">{t('bankLevelSecurityDesc')}</p>
            </div>
            <div className="text-center">
              <Users className="w-12 h-12 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('personalAndBusiness')}</h3>
              <p className="text-muted-foreground">{t('personalAndBusinessDesc')}</p>
            </div>
            <div className="text-center">
              <Globe className="w-12 h-12 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('multiCountrySupport')}</h3>
              <p className="text-muted-foreground">{t('multiCountrySupportDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-6">{t('readyToTakeControl')}</h2>
        <p className="text-xl text-muted-foreground mb-8">
          {t('joinThousands')}
        </p>
        <Button asChild size="lg" className="text-lg px-8">
          <Link to="/auth">{t('startFreeTrialToday')}</Link>
        </Button>
      </section>
    </div>
  );
};

export default Home;