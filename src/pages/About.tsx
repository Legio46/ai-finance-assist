import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Users, Lightbulb, Award, Globe, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";

const About = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-10 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="container relative mx-auto px-4 py-24 text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">About Legio Finance</Badge>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t('aboutLegio')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('aboutMission')}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-24 space-y-24">
        {/* Mission */}
        <section>
          <Card className="max-w-3xl mx-auto border-0 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-transparent p-8 lg:p-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent mx-auto mb-5 flex items-center justify-center shadow-lg">
                <Target className="w-7 h-7 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-4">{t('ourMission')}</h2>
              <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">{t('missionText')}</p>
            </div>
          </Card>
        </section>

        {/* Values */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-12">{t('ourValues')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Users, title: t('userCentric'), desc: t('userCentricDesc') },
              { icon: Lightbulb, title: t('innovation'), desc: t('innovationDesc') },
              { icon: Award, title: t('trustAndSecurity'), desc: t('trustSecurityDesc') },
            ].map((value, idx) => (
              <Card key={idx} className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">{value.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Story */}
        <section>
          <Card className="max-w-3xl mx-auto border-0 shadow-lg">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">{t('ourStory')}</CardTitle>
            </CardHeader>
            <CardContent className="px-8 lg:px-12 pb-10">
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>{t('storyPara1')}</p>
                <p>{t('storyPara2')}</p>
                <p>{t('storyPara3')}</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Global Reach */}
        <section className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mx-auto mb-6 flex items-center justify-center shadow-lg">
            <Globe className="w-7 h-7 text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-bold mb-4">{t('globalReach')}</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">{t('globalReachDesc')}</p>
          <span className="text-6xl">🌍</span>
        </section>

        {/* Coming Soon */}
        <section>
          <Card className="max-w-3xl mx-auto border border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-transparent shadow-sm">
            <CardHeader className="text-center">
              <Badge variant="secondary" className="w-fit mx-auto mb-4 px-4 py-1.5">
                <Clock className="w-3.5 h-3.5 mr-1.5 inline" />
                {t('comingSoon')}
              </Badge>
              <CardTitle className="text-2xl">{t('taxOptimization')}</CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <p className="text-muted-foreground max-w-lg mx-auto">{t('taxOptimizationDesc')}</p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default About;
