import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { TrendingUp, DollarSign, Shield, Users, Globe, ArrowRight, Sparkles, ChevronRight, PieChart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/logo_3.png";

const Home = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-20 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

        <div className="container relative mx-auto px-4 py-24 lg:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            AI-Powered Financial Management
          </div>

          <img src={logo} alt="Legio Finance" className="h-20 mx-auto mb-8 drop-shadow-lg" />

          <h1 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight max-w-4xl mx-auto">
            {t('heroTitle')}
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('heroSubtitle')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button asChild size="lg" className="text-base px-8 rounded-xl shadow-lg h-12 gap-2">
              <Link to="/auth">
                {t('startFreeTrial')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base px-8 rounded-xl h-12">
              <Link to="/pricing">{t('viewPricing')}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">{t('powerfulFeatures')}</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Everything you need to manage your finances intelligently</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: PieChart, title: t('expenseTracking'), desc: t('expenseTrackingDesc') },
            { icon: TrendingUp, title: "Smart Budgeting", desc: "Set budgets, track progress, and get AI-powered recommendations to optimize your spending habits." },
            { icon: DollarSign, title: t('financialAdvisor'), desc: t('financialAdvisorDesc') },
          ].map((feature, idx) => (
            <Card key={idx} className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5" />
        <div className="container relative mx-auto px-4 py-24">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-16">{t('whyChooseLegio')}</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { icon: Shield, title: t('bankLevelSecurity'), desc: t('bankLevelSecurityDesc') },
              { icon: Users, title: t('personalAndBusiness'), desc: t('personalAndBusinessDesc') },
              { icon: Globe, title: t('multiCountrySupport'), desc: t('multiCountrySupportDesc') },
            ].map((item, idx) => (
              <div key={idx} className="text-center group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mx-auto mb-5 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <item.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary to-accent p-12 lg:p-16 text-center shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)]" />
          <div className="relative">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-primary-foreground">{t('readyToTakeControl')}</h2>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-lg mx-auto">
              {t('joinThousands')}
            </p>
            <Button asChild size="lg" variant="secondary" className="text-base px-8 rounded-xl h-12 gap-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-lg">
              <Link to="/auth">
                {t('startFreeTrialToday')}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;