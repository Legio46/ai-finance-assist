import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  TrendingUp, 
  PiggyBank, 
  Shield, 
  Users, 
  Star,
  Check,
  ArrowRight,
  BarChart3
} from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              FinanceAI
            </h1>
            <Badge className="bg-gradient-primary text-white">Beta</Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/auth">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-gradient-primary hover:opacity-90">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Your AI-Powered
            <span className="block bg-gradient-financial bg-clip-text text-transparent">
              Financial Assistant
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Revolutionize your financial management with AI. Calculate taxes, track expenses, 
            get investment advice, and optimize your finances across multiple countries.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-lg px-8 py-6">
                Start 7-Day Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              No credit card required • Cancel anytime
            </p>
          </div>

          {/* Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <Card className="text-center border-0 bg-card/50 backdrop-blur">
              <CardHeader>
                <Calculator className="w-12 h-12 mx-auto mb-4 text-primary" />
                <CardTitle>Smart Tax Calculator</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  AI-powered tax calculations for Slovakia, USA, UK, Germany, and France
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 bg-card/50 backdrop-blur">
              <CardHeader>
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-primary" />
                <CardTitle>Expense Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Track personal and business expenses with intelligent insights
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 bg-card/50 backdrop-blur">
              <CardHeader>
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-primary" />
                <CardTitle>AI Financial Advisor</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get personalized advice on investments, mortgages, and savings
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground">
              Choose the plan that fits your financial needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Personal Plan */}
            <Card className="relative border-2">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">Personal</CardTitle>
                <CardDescription>Perfect for individuals</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$29.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-success" />
                  <span>Personal expense tracking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-success" />
                  <span>AI spending insights</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-success" />
                  <span>Basic tax calculations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-success" />
                  <span>Savings recommendations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-success" />
                  <span>Financial graphs & reports</span>
                </div>
                <Link to="/auth" className="block">
                  <Button className="w-full mt-8 bg-gradient-primary hover:opacity-90">
                    Start Free Trial
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Business Plan */}
            <Card className="relative border-2 border-primary">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Badge className="bg-gradient-primary text-white px-4 py-1">
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">Business</CardTitle>
                <CardDescription>For entrepreneurs & businesses</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$49.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-success" />
                  <span>Everything in Personal</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-success" />
                  <span>Multi-country tax calculations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-success" />
                  <span>Business expense tracking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-success" />
                  <span>Profit/loss analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-success" />
                  <span>AI financial advisor</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-success" />
                  <span>Advanced analytics</span>
                </div>
                <Link to="/auth" className="block">
                  <Button className="w-full mt-8 bg-gradient-primary hover:opacity-90">
                    Start Free Trial
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground">
              <Shield className="inline w-4 h-4 mr-1" />
              7-day free trial • No setup fees • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-card/30">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <h3 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              FinanceAI
            </h3>
          </div>
          <p className="text-muted-foreground mb-6">
            Empowering your financial future with artificial intelligence
          </p>
          <div className="flex justify-center space-x-6">
            <Link to="/auth" className="text-muted-foreground hover:text-primary">
              Get Started
            </Link>
            <a href="#" className="text-muted-foreground hover:text-primary">
              Privacy Policy
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
