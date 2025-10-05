import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Mail,
  Wallet,
  CreditCard,
  Gift,
  Star,
  Users,
  Trophy,
  Zap,
  Shield
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useWeb3 } from '@/hooks/useWeb3';
import DualOnboarding from '@/components/auth/DualOnboarding';
import PaymentProcessor from '@/components/payments/PaymentProcessor';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  completed: boolean;
  required: boolean;
}

const OnboardingFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'premium' | 'pro'>('premium');
  const [authMethod, setAuthMethod] = useState<'web2' | 'web3' | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);

  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { isConnected, account } = useWeb3();

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Avalanche Rush',
      description: 'Choose your preferred onboarding method',
      component: <WelcomeStep onMethodSelect={setAuthMethod} />,
      completed: authMethod !== null,
      required: true
    },
    {
      id: 'authentication',
      title: 'Authentication',
      description: authMethod === 'web2' ? 'Create your account with email' : 'Connect your Web3 wallet',
      component: <AuthenticationStep authMethod={authMethod} />,
      completed: isAuthenticated || isConnected,
      required: true
    },
    {
      id: 'subscription',
      title: 'Choose Your Plan',
      description: 'Select the subscription that fits your needs',
      component: <SubscriptionStep onPlanSelect={setSelectedPlan} />,
      completed: selectedPlan !== null,
      required: true
    },
    {
      id: 'payment',
      title: 'Complete Payment',
      description: 'Pay with your preferred method',
      component: <PaymentStep 
        plan={selectedPlan} 
        authMethod={authMethod}
        onPaymentSuccess={setPaymentData}
      />,
      completed: paymentData !== null,
      required: true
    },
    {
      id: 'rewards',
      title: 'Claim Welcome Rewards',
      description: 'Get your onboarding NFT and tokens',
      component: <RewardsStep />,
      completed: false,
      required: false
    },
    {
      id: 'completion',
      title: 'You\'re All Set!',
      description: 'Start your Avalanche Rush journey',
      component: <CompletionStep />,
      completed: false,
      required: false
    }
  ];

  const progress = ((completedSteps.size / onboardingSteps.filter(step => step.required).length) * 100);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepComplete = (stepIndex: number) => {
    setCompletedSteps(prev => new Set([...prev, stepIndex]));
  };

  const handleFinish = () => {
    navigate('/dashboard');
  };

  useEffect(() => {
    // Update completed steps based on current state
    const newCompletedSteps = new Set<number>();
    
    onboardingSteps.forEach((step, index) => {
      if (step.completed) {
        newCompletedSteps.add(index);
      }
    });
    
    setCompletedSteps(newCompletedSteps);
  }, [authMethod, isAuthenticated, isConnected, selectedPlan, paymentData]);

  const currentStepData = onboardingSteps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Avalanche Rush</h1>
            <Badge variant="outline">Step {currentStep + 1} of {onboardingSteps.length}</Badge>
          </div>
          
          <Progress value={progress} className="mb-4" />
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Progress: {Math.round(progress)}%</span>
            <span>{completedSteps.size} of {onboardingSteps.filter(step => step.required).length} required steps completed</span>
          </div>
        </div>

        {/* Main Content */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">
              {currentStepData.title}
            </CardTitle>
            <p className="text-center text-muted-foreground">
              {currentStepData.description}
            </p>
          </CardHeader>
          <CardContent className="p-8">
            {currentStepData.component}
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentStep === onboardingSteps.length - 1 ? (
                <Button onClick={handleFinish}>
                  <Trophy className="w-4 h-4 mr-2" />
                  Start Playing
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!currentStepData.completed && currentStepData.required}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Step Indicators */}
        <div className="mt-8">
          <div className="flex justify-center space-x-4">
            {onboardingSteps.map((step, index) => (
              <div
                key={step.id}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-primary'
                    : completedSteps.has(index)
                    ? 'bg-green-500'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Welcome Step Component
const WelcomeStep: React.FC<{ onMethodSelect: (method: 'web2' | 'web3') => void }> = ({ onMethodSelect }) => {
  const [selectedMethod, setSelectedMethod] = useState<'web2' | 'web3' | null>(null);

  const handleMethodSelect = (method: 'web2' | 'web3') => {
    setSelectedMethod(method);
    onMethodSelect(method);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Choose Your Onboarding Method</h2>
        <p className="text-muted-foreground">
          Select how you'd like to access Avalanche Rush
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg ${
            selectedMethod === 'web2' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => handleMethodSelect('web2')}
        >
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <Mail className="w-12 h-12 mx-auto text-blue-500" />
              <h3 className="text-lg font-semibold">Web2 Signup</h3>
              <p className="text-sm text-muted-foreground">
                Traditional email signup with card payments
              </p>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Email & password
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Credit card payments
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Social features
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg ${
            selectedMethod === 'web3' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => handleMethodSelect('web3')}
        >
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <Wallet className="w-12 h-12 mx-auto text-purple-500" />
              <h3 className="text-lg font-semibold">Web3 Connect</h3>
              <p className="text-sm text-muted-foreground">
                Connect wallet for full Web3 experience
              </p>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Wallet authentication
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Crypto payments
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  NFT rewards
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Authentication Step Component
const AuthenticationStep: React.FC<{ authMethod: 'web2' | 'web3' | null }> = ({ authMethod }) => {
  if (authMethod === 'web2') {
    return <DualOnboarding />;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
        <p className="text-muted-foreground">
          Connect your Web3 wallet to access all features
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <Wallet className="w-12 h-12 mx-auto text-primary" />
              <div>
                <h3 className="font-semibold">MetaMask</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with MetaMask wallet
                </p>
              </div>
              <Button className="w-full">
                Connect Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Subscription Step Component
const SubscriptionStep: React.FC<{ onPlanSelect: (plan: 'premium' | 'pro') => void }> = ({ onPlanSelect }) => {
  const [selectedPlan, setSelectedPlan] = useState<'premium' | 'pro' | null>(null);

  const handlePlanSelect = (plan: 'premium' | 'pro') => {
    setSelectedPlan(plan);
    onPlanSelect(plan);
  };

  const plans = [
    {
      id: 'premium' as const,
      name: 'Premium',
      price: '$9.99',
      priceCrypto: '0.01 AVAX',
      features: [
        'All game modes',
        'Premium quests',
        '2x reward multiplier',
        'Exclusive NFTs',
        'Priority support'
      ],
      popular: true
    },
    {
      id: 'pro' as const,
      name: 'Pro',
      price: '$19.99',
      priceCrypto: '0.02 AVAX',
      features: [
        'Everything in Premium',
        '3x reward multiplier',
        'Publisher tools',
        'Custom quest creation',
        'Revenue sharing',
        'API access'
      ],
      popular: false
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
        <p className="text-muted-foreground">
          Select the subscription that fits your needs
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedPlan === plan.id ? 'ring-2 ring-primary' : ''
            } ${plan.popular ? 'border-primary' : ''}`}
            onClick={() => handlePlanSelect(plan.id)}
          >
            {plan.popular && (
              <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                Most Popular
              </div>
            )}
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="text-3xl font-bold text-primary">
                  {plan.price}
                </div>
                <p className="text-sm text-muted-foreground">
                  or {plan.priceCrypto}
                </p>
                <ul className="space-y-2 text-sm">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Payment Step Component
const PaymentStep: React.FC<{ 
  plan: 'premium' | 'pro' | null;
  authMethod: 'web2' | 'web3' | null;
  onPaymentSuccess: (data: any) => void;
}> = ({ plan, authMethod, onPaymentSuccess }) => {
  if (!plan || !authMethod) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Please complete previous steps first</p>
      </div>
    );
  }

  const amount = plan === 'premium' ? 9.99 : 19.99;
  const currency = authMethod === 'web2' ? 'USD' : 'AVAX';

  return (
    <PaymentProcessor
      amount={amount}
      currency={currency}
      onSuccess={onPaymentSuccess}
      onError={(error) => console.error('Payment error:', error)}
      subscriptionTier={plan}
    />
  );
};

// Rewards Step Component
const RewardsStep: React.FC = () => {
  const [claimed, setClaimed] = useState(false);

  const handleClaimRewards = () => {
    setClaimed(true);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Gift className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Welcome Rewards</h2>
        <p className="text-muted-foreground">
          Claim your onboarding rewards and start your journey
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <Gift className="w-16 h-16 mx-auto text-primary" />
              <div>
                <h3 className="text-lg font-semibold">Welcome Package</h3>
                <p className="text-sm text-muted-foreground">
                  Your onboarding rewards are ready
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Welcome NFT</span>
                  <Badge variant="secondary">Rare</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">RUSH Tokens</span>
                  <Badge variant="secondary">1000 RUSH</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Premium Access</span>
                  <Badge variant="secondary">30 Days</Badge>
                </div>
              </div>

              <Button 
                onClick={handleClaimRewards}
                disabled={claimed}
                className="w-full"
              >
                {claimed ? 'Rewards Claimed!' : 'Claim Rewards'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Completion Step Component
const CompletionStep: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Welcome to Avalanche Rush!</h2>
        <p className="text-muted-foreground">
          Your account is set up and ready to go
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-semibold">What's Next?</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">1</span>
                  </div>
                  <span className="text-sm">Complete the tutorial</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">2</span>
                  </div>
                  <span className="text-sm">Start your first quest</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">3</span>
                  </div>
                  <span className="text-sm">Join the community</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingFlow;
