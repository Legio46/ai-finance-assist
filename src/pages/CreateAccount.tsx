import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { validatePassword } from '@/utils/inputSanitizer';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, User, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const ONBOARDING_QUESTIONS = [
  {
    key: 'financial_goal',
    question: 'What is your main financial goal right now?',
    options: ['Saving', 'Reducing debt', 'Investing', 'Budgeting', 'Building an emergency fund'],
  },
  {
    key: 'expense_tracking',
    question: 'How often do you track your expenses?',
    options: ['Daily', 'Weekly', 'Monthly', 'Rarely'],
  },
  {
    key: 'income_type',
    question: 'Do you have a regular monthly income, or does it vary?',
    options: ['Regular/fixed income', 'Variable/freelance income', 'Mix of both', 'Currently no income'],
  },
  {
    key: 'auto_budget',
    question: 'Would you like the app to create a suggested budget for you automatically?',
    options: ['Yes, please!', 'Maybe later', 'No, I prefer to set it up myself'],
  },
  {
    key: 'budget_alerts',
    question: 'Do you want alerts when you\'re close to exceeding your budget in a category?',
    options: ['Yes, always', 'Only for important categories', 'No, I\'ll check manually'],
  },
  {
    key: 'savings_target',
    question: 'How much would you like to save each month?',
    options: ['A specific fixed amount', 'A percentage of income (e.g. 10-20%)', 'As much as possible', 'Not sure yet'],
  },
  {
    key: 'data_sharing',
    question: 'Which level of detail are you comfortable sharing for personalized insights?',
    options: ['Basic spending overview only', 'Full transaction history', 'Everything including goals and income', 'Minimal — I prefer privacy'],
  },
];

const CreateAccount = () => {
  const { user, loading, signUp } = useAuth();
  const [step, setStep] = useState(1); // 1 = credentials, 2 = onboarding
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    accountType: 'personal',
  });
  const [onboardingAnswers, setOnboardingAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleCredentialsNext = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validatePassword(formData.password);
    if (!validation.valid) {
      setPasswordErrors(validation.errors);
      return;
    }
    setPasswordErrors([]);
    setStep(2);
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    const result = await signUp(
      formData.email.trim().toLowerCase(),
      formData.password,
      formData.fullName.trim(),
      formData.accountType,
    );

    // Store onboarding preferences in localStorage for now
    // Can be synced to a profile_preferences table later
    if (!result.error) {
      localStorage.setItem('onboarding_preferences', JSON.stringify(onboardingAnswers));
    }

    setIsLoading(false);
  };

  const handleQuestionAnswer = (key: string, value: string) => {
    setOnboardingAnswers(prev => ({ ...prev, [key]: value }));
  };

  const progress = step === 1 ? 15 : 15 + ((currentQuestion + 1) / ONBOARDING_QUESTIONS.length) * 85;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-3">
          <Progress value={progress} className="h-1.5" />
          {step === 1 ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Create Account</CardTitle>
                  <CardDescription>Step 1 of 2 — Your credentials</CardDescription>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Personalize Your Experience</CardTitle>
                  <CardDescription>
                    Question {currentQuestion + 1} of {ONBOARDING_QUESTIONS.length}
                  </CardDescription>
                </div>
              </div>
            </>
          )}
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleCredentialsNext} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter your full name"
                  required
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  required
                  maxLength={255}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (passwordErrors.length > 0) {
                      const v = validatePassword(e.target.value);
                      setPasswordErrors(v.errors);
                    }
                  }}
                  placeholder="Create a strong password"
                  required
                  maxLength={128}
                />
                {passwordErrors.length > 0 && (
                  <div className="text-xs text-destructive space-y-0.5">
                    <p className="font-medium">Password needs:</p>
                    {passwordErrors.map((err, i) => (
                      <p key={i} className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {err}
                      </p>
                    ))}
                  </div>
                )}
              </div>
              <Button type="submit" className="w-full gap-2">
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <div className="space-y-5">
              <div>
                <h3 className="font-medium text-foreground mb-3 text-[15px]">
                  {ONBOARDING_QUESTIONS[currentQuestion].question}
                </h3>
                <RadioGroup
                  value={onboardingAnswers[ONBOARDING_QUESTIONS[currentQuestion].key] || ''}
                  onValueChange={(value) =>
                    handleQuestionAnswer(ONBOARDING_QUESTIONS[currentQuestion].key, value)
                  }
                  className="space-y-2"
                >
                  {ONBOARDING_QUESTIONS[currentQuestion].options.map((option) => (
                    <Label
                      key={option}
                      htmlFor={`${ONBOARDING_QUESTIONS[currentQuestion].key}-${option}`}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:border-primary/50 ${
                        onboardingAnswers[ONBOARDING_QUESTIONS[currentQuestion].key] === option
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border'
                      }`}
                    >
                      <RadioGroupItem
                        value={option}
                        id={`${ONBOARDING_QUESTIONS[currentQuestion].key}-${option}`}
                      />
                      <span className="text-sm">{option}</span>
                      {onboardingAnswers[ONBOARDING_QUESTIONS[currentQuestion].key] === option && (
                        <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />
                      )}
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (currentQuestion === 0) {
                      setStep(1);
                    } else {
                      setCurrentQuestion((q) => q - 1);
                    }
                  }}
                  className="gap-1.5"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>

                {currentQuestion < ONBOARDING_QUESTIONS.length - 1 ? (
                  <Button
                    className="flex-1 gap-1.5"
                    onClick={() => setCurrentQuestion((q) => q + 1)}
                    disabled={!onboardingAnswers[ONBOARDING_QUESTIONS[currentQuestion].key]}
                  >
                    Next <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    className="flex-1 gap-1.5"
                    onClick={handleSubmit}
                    disabled={isLoading || !onboardingAnswers[ONBOARDING_QUESTIONS[currentQuestion].key]}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                    {!isLoading && <CheckCircle2 className="h-4 w-4" />}
                  </Button>
                )}
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
                disabled={isLoading}
              >
                Skip and create account
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateAccount;
