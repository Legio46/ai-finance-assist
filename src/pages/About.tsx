import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Users, Lightbulb, Award } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 py-16">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-6">About Legio Financial</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're on a mission to democratize financial management and make expert-level 
            financial advice accessible to everyone, from individual users to large enterprises.
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-16">
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <Target className="w-12 h-12 mx-auto text-primary mb-4" />
              <CardTitle className="text-2xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-lg text-muted-foreground">
                To empower individuals and businesses with intelligent financial tools that 
                simplify complex calculations, provide actionable insights, and help users 
                make informed financial decisions across multiple countries and currencies.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Users className="w-12 h-12 mx-auto text-primary mb-4" />
                <CardTitle>User-Centric</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Every feature we build is designed with our users' needs at the forefront, 
                  ensuring simplicity without sacrificing functionality.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Lightbulb className="w-12 h-12 mx-auto text-primary mb-4" />
                <CardTitle>Innovation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We leverage cutting-edge AI and technology to provide insights and 
                  automation that traditional financial tools simply can't match.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Award className="w-12 h-12 mx-auto text-primary mb-4" />
                <CardTitle>Trust & Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your financial data deserves the highest level of protection. 
                  We implement bank-grade security to keep your information safe.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Story Section */}
        <section className="mb-16">
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Our Story</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-lg max-w-none text-muted-foreground">
                <p className="mb-4">
                  Legio Financial was born from a simple observation: financial management 
                  shouldn't be complicated, expensive, or limited by geography. Whether you're 
                  a freelancer in Slovakia, a startup in Germany, or an established business 
                  in the USA, you deserve access to the same level of financial intelligence.
                </p>
                <p className="mb-4">
                  Our team of financial experts, software engineers, and AI specialists came 
                  together to create a platform that breaks down the barriers between users 
                  and professional-grade financial management tools.
                </p>
                <p>
                  Today, Legio serves thousands of users across multiple countries, helping 
                  them save time, reduce costs, and make better financial decisions through 
                  the power of intelligent automation and expert insights.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Global Reach */}
        <section>
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">Global Reach</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Currently serving users in Slovakia, USA, UK, Germany, and France
            </p>
            <div className="flex justify-center gap-8 text-sm text-muted-foreground">
              <span>🇸🇰 Slovakia</span>
              <span>🇺🇸 United States</span>
              <span>🇬🇧 United Kingdom</span>
              <span>🇩🇪 Germany</span>
              <span>🇫🇷 France</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;