import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Users, Lightbulb, Award, Globe, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";

const About = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 py-16">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-6">{t('aboutLegio')}</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('aboutMission')}
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-16">
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <Target className="w-12 h-12 mx-auto text-primary mb-4" />
              <CardTitle className="text-2xl">{t('ourMission')}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-lg text-muted-foreground">
                {t('missionText')}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">{t('ourValues')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Users className="w-12 h-12 mx-auto text-primary mb-4" />
                <CardTitle>{t('userCentric')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('userCentricDesc')}
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Lightbulb className="w-12 h-12 mx-auto text-primary mb-4" />
                <CardTitle>{t('innovation')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('innovationDesc')}
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Award className="w-12 h-12 mx-auto text-primary mb-4" />
                <CardTitle>{t('trustAndSecurity')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('trustSecurityDesc')}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Story Section */}
        <section className="mb-16">
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{t('ourStory')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-lg max-w-none text-muted-foreground">
                <p className="mb-4">
                  {t('storyPara1')}
                </p>
                <p className="mb-4">
                  {t('storyPara2')}
                </p>
                <p>
                  {t('storyPara3')}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Global Reach */}
        <section className="mb-16">
          <div className="text-center">
            <Globe className="w-16 h-16 mx-auto text-primary mb-6" />
            <h2 className="text-3xl font-bold mb-6">{t('globalReach')}</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('globalReachDesc')}
            </p>
            <div className="flex justify-center">
              <span className="text-6xl">🌍</span>
            </div>
          </div>
        </section>

        {/* Tax Optimization Coming Soon */}
        <section>
          <Card className="max-w-4xl mx-auto border-dashed border-2">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Badge variant="secondary" className="text-sm px-4 py-1">
                  <Clock className="w-4 h-4 mr-2 inline" />
                  {t('comingSoon')}
                </Badge>
              </div>
              <CardTitle className="text-2xl">{t('taxOptimization')}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                {t('taxOptimizationDesc')}
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default About;