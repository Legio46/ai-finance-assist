import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { TrendingUp, DollarSign, Shield, Users, Globe, ArrowRight, Sparkles, ChevronRight, PieChart, CreditCard, BarChart3, Zap, CheckCircle, Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/shield-logo.png";
import heroDashboard from "@/assets/hero-dashboard.jpg";
import teamFinance from "@/assets/team-finance.jpg";
import securityFeature from "@/assets/security-feature.jpg";

const Home = () => {
  const { t } = useLanguage();

  const stats = [
    { value: "50K+", label: "Active Users" },
    { value: "120+", label: "Countries" },
    { value: "99.9%", label: "Uptime" },
    { value: "$2B+", label: "Tracked" },
  ];

  const features = [
    { icon: PieChart, title: t('expenseTracking'), desc: t('expenseTrackingDesc'), color: "hsl(351 76% 56%)" },
    { icon: TrendingUp, title: "Smart Budgeting", desc: "Set budgets, track progress, and get AI-powered recommendations to optimize your spending.", color: "hsl(142 76% 36%)" },
    { icon: DollarSign, title: t('financialAdvisor'), desc: t('financialAdvisorDesc'), color: "hsl(199 89% 48%)" },
    { icon: CreditCard, title: "Credit Card Manager", desc: "Track all your credit cards, monitor balances, APRs, and due dates in one unified dashboard.", color: "hsl(38 92% 50%)" },
    { icon: BarChart3, title: "Investment Tracking", desc: "Monitor stocks, crypto, and other investments with real-time price updates and portfolio analytics.", color: "hsl(280 65% 60%)" },
    { icon: Zap, title: "AI-Powered Insights", desc: "Get personalized financial advice and predictions powered by advanced artificial intelligence.", color: "hsl(24 95% 55%)" },
  ];

  const testimonials = [
    { name: "Sarah M.", role: "Small Business Owner", text: "Legio transformed how I manage my business finances. The AI advisor alone saved me thousands in tax deductions.", rating: 5 },
    { name: "James K.", role: "Freelancer", text: "Finally a finance app that handles both personal and business accounts. The charts are so easy to understand!", rating: 5 },
    { name: "Maria L.", role: "Student", text: "The budget tracking helped me save 30% more each month. Love the clean interface and smart insights.", rating: 5 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/8" />
        <div className="absolute top-20 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 -right-40 w-[500px] h-[500px] bg-accent/8 rounded-full blur-3xl" />

        <div className="container relative mx-auto px-4 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                AI-Powered Financial Management
              </div>

              <div className="flex items-center gap-4 mb-6">
                <img src={logo} alt="Legio Finance" className="h-16 drop-shadow-lg" />
                <span className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Legio Finance</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-5 leading-tight text-foreground">
                {t('heroTitle')}
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg">
                {t('heroSubtitle')}
              </p>
              <div className="flex gap-4 flex-wrap">
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

              {/* Trust stats */}
              <div className="grid grid-cols-4 gap-4 mt-10 pt-8 border-t border-border/50">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-xl lg:text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-2xl" />
              <img
                src={heroDashboard}
                alt="Legio Finance Dashboard"
                className="relative rounded-2xl shadow-2xl border border-border/30 w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">{t('powerfulFeatures')}</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Everything you need to take control of your money, all in one beautiful platform.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <Card key={idx} className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${feature.color}15` }}>
                  <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
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

      {/* How It Works - with image */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
        <div className="container mx-auto px-4 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <img src={teamFinance} alt="Team using Legio Finance" className="rounded-2xl shadow-xl border border-border/20" />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">Manage Your Money in 3 Simple Steps</h2>
              <div className="space-y-6">
                {[
                  { step: "1", title: "Connect Your Accounts", desc: "Add your income sources, expenses, credit cards, and investments in minutes." },
                  { step: "2", title: "Get Smart Insights", desc: "Our AI analyzes your spending patterns and provides personalized recommendations." },
                  { step: "3", title: "Grow Your Wealth", desc: "Track your progress, hit savings goals, and make informed financial decisions." },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0 shadow-lg">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section - with image */}
      <section className="container mx-auto px-4 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">{t('whyChooseLegio')}</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">Your financial data deserves the highest level of protection. Legio uses industry-leading security to keep your information safe.</p>
            <div className="space-y-4">
              {[
                { icon: Shield, title: t('bankLevelSecurity'), desc: t('bankLevelSecurityDesc') },
                { icon: Users, title: t('personalAndBusiness'), desc: t('personalAndBusinessDesc') },
                { icon: Globe, title: t('multiCountrySupport'), desc: t('multiCountrySupportDesc') },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 items-start p-4 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 shadow-md">
                    <item.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/15 to-accent/15 rounded-3xl blur-2xl" />
            <img src={securityFeature} alt="Bank-level security" className="relative rounded-2xl shadow-xl border border-border/20" />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Loved by Thousands</h2>
            <p className="text-muted-foreground">See what our users have to say about Legio Finance</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <Card key={idx} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{t.text}"</p>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Checklist */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Everything You Need</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 max-w-4xl mx-auto">
          {[
            "Expense Tracking", "Budget Management", "Income Monitoring",
            "Credit Card Tracking", "Investment Portfolio", "AI Financial Advisor",
            "Multi-Currency Support", "PDF & CSV Reports", "Financial Calendar",
            "Recurring Payments", "Spending Insights", "Goal Setting",
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-3 py-2">
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-sm font-medium">{feature}</span>
            </div>
          ))}
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
