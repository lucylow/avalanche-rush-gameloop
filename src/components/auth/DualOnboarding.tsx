import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  CreditCard, 
  Wallet, 
  Gift, 
  Star, 
  Shield, 
  Zap,
  Users,
  Trophy,
  Coins
} from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { useAuth } from '@/hooks/useAuth';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  priceCrypto: string;
  features: string[];
  popular?: boolean;
  web2Price: number;
  web3Price: string;
}

const DualOnboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [authMethod, setAuthMethod] = useState<'web2' | 'web3' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string>('premium');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { connectWallet, isConnected, account } = useWeb3();
  const { signUp, signIn, user } = useAuth();

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free Tier',
      price: 0,
      priceCrypto: '0 AVAX',
      web2Price: 0,
      web3Price: '0 AVAX',
      features: [
        'Basic game access',
        'Limited quests',
        'Community features',
        'Basic rewards'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 9.99,
      priceCrypto: '0.01 AVAX',
      web2Price: 9.99,
      web3Price: '0.01 AVAX',
      popular: true,
      features: [
        'All game modes',
        'Premium quests',
        '2x reward multiplier',
        'Exclusive NFTs',
        'Priority support',
        'Advanced analytics'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 19.99,
      priceCrypto: '0.02 AVAX',
      web2Price: 19.99,
      web3Price: '0.02 AVAX',
      features: [
        'Everything in Premium',
        '3x reward multiplier',
        'Publisher tools',
        'Custom quest creation',
        'Revenue sharing',
        'White-label options',
        'API access'
      ]
    }
  ];

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'auth',
      title: 'Choose Authentication',
      description: 'Select how you want to access Avalanche Rush',
      icon: <Shield className="w-6 h-6" />,
      completed: authMethod !== null
    },
    {
      id: 'account',
      title: 'Create Account',
      description: authMethod === 'web2' ? 'Set up your email account' : 'Connect your wallet',
      icon: authMethod === 'web2' ? <Mail className="w-6 h-6" /> : <Wallet className="w-6 h-6" />,
      completed: authMethod === 'web2' ? !!email : isConnected
    },
    {
      id: 'subscription',
      title: 'Choose Plan',
      description: 'Select your subscription tier',
      icon: <Star className="w-6 h-6" />,
      completed: selectedPlan !== 'free'
    },
    {
      id: 'payment',
      title: 'Complete Payment',
      description: 'Pay with your preferred method',
      icon: authMethod === 'web2' ? <CreditCard className="w-6 h-6" /> : <Coins className="w-6 h-6" />,
      completed: false
    },
    {
      id: 'rewards',
      title: 'Claim Welcome Rewards',
      description: 'Get your onboarding NFT and tokens',
      icon: <Gift className="w-6 h-6" />,
      completed: false
    }
  ];

  const handleWeb2SignUp = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await signUp(email, password);
      setCurrentStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWeb3Connect = async () => {
    setIsLoading(true);
    try {
      await connectWallet();
      if (isConnected) {
        setCurrentStep(2);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wallet connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      if (authMethod === 'web2') {
        // Process Web2 payment with Stripe
        await processWeb2Payment();
      } else {
        // Process Web3 payment with crypto
        await processWeb3Payment();
      }
      setCurrentStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  const processWeb2Payment = async () => {
    // Integrate with Stripe
    console.log('Processing Web2 payment...');
  };

  const processWeb3Payment = async () => {
    // Integrate with smart contract payment
    console.log('Processing Web3 payment...');
  };

  const claimWelcomeRewards = async () => {
    setIsLoading(true);
    try {
      // Mint welcome NFT and distribute tokens
      console.log('Claiming welcome rewards...');
      setCurrentStep(5);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim rewards');
    } finally {
      setIsLoading(false);
    }
  };

  const renderAuthSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Welcome to Avalanche Rush</h2>
        <p className="text-muted-foreground">
          Choose your preferred way to access the platform
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg ${
            authMethod === 'web2' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setAuthMethod('web2')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Web2 Sign Up
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Traditional email signup with card payments
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                Email & password authentication
              </li>
              <li className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-green-500" />
                Credit card payments
              </li>
              <li className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-500" />
                Social features
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg ${
            authMethod === 'web3' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setAuthMethod('web3')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Web3 Connect
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Connect wallet for full Web3 experience
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-blue-500" />
                Wallet authentication
              </li>
              <li className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-blue-500" />
                Crypto payments
              </li>
              <li className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-blue-500" />
                NFT rewards
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button 
          onClick={() => setCurrentStep(1)}
          disabled={!authMethod}
          className="w-full md:w-auto"
        >
          Continue
        </Button>
      </div>
    </div>
  );

  const renderAccountCreation = () => {
    if (authMethod === 'web2') {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Create Your Account</h2>
            <p className="text-muted-foreground">
              Sign up with email to get started
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            <Button 
              onClick={handleWeb2SignUp}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground">
            Connect your Web3 wallet to access all features
          </p>
        </div>

        <div className="max-w-md mx-auto space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Wallet className="w-12 h-12 mx-auto text-primary" />
                <div>
                  <h3 className="font-semibold">MetaMask</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect with MetaMask wallet
                  </p>
                </div>
                {error && (
                  <div className="text-red-500 text-sm">{error}</div>
                )}
                <Button 
                  onClick={handleWeb3Connect}
                  disabled={isLoading || isConnected}
                  className="w-full"
                >
                  {isLoading ? 'Connecting...' : isConnected ? 'Connected' : 'Connect Wallet'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderSubscriptionSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
        <p className="text-muted-foreground">
          Select the subscription that fits your needs
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {subscriptionPlans.map((plan) => (
          <Card 
            key={plan.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedPlan === plan.id ? 'ring-2 ring-primary' : ''
            } ${plan.popular ? 'border-primary' : ''}`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            {plan.popular && (
              <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-center">
                {plan.name}
                <div className="text-2xl font-bold mt-2">
                  {authMethod === 'web2' ? `$${plan.web2Price}` : plan.web3Price}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button 
          onClick={() => setCurrentStep(3)}
          disabled={!selectedPlan}
          className="w-full md:w-auto"
        >
          Continue
        </Button>
      </div>
    </div>
  );

  const renderPayment = () => {
    const plan = subscriptionPlans.find(p => p.id === selectedPlan);
    if (!plan) return null;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Complete Payment</h2>
          <p className="text-muted-foreground">
            {authMethod === 'web2' 
              ? 'Pay securely with your credit card' 
              : 'Complete payment with cryptocurrency'
            }
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {plan.name} Plan
                <div className="text-2xl font-bold mt-2">
                  {authMethod === 'web2' ? `$${plan.web2Price}` : plan.web3Price}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {authMethod === 'web2' ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Expiry</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      Send payment to:
                    </p>
                    <p className="font-mono text-sm break-all">
                      0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Amount: {plan.web3Price}
                    </p>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
              
              <Button 
                onClick={handlePayment}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Processing...' : 'Complete Payment'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderWelcomeRewards = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Welcome Rewards</h2>
        <p className="text-muted-foreground">
          Claim your onboarding rewards and start your journey
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="pt-6">
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

              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
              
              <Button 
                onClick={claimWelcomeRewards}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Claiming...' : 'Claim Rewards'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderCompletion = () => (
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
          <CardContent className="pt-6">
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

              <Button className="w-full">
                Start Playing
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderAuthSelection();
      case 1:
        return renderAccountCreation();
      case 2:
        return renderSubscriptionSelection();
      case 3:
        return renderPayment();
      case 4:
        return renderWelcomeRewards();
      case 5:
        return renderCompletion();
      default:
        return renderAuthSelection();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {onboardingSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step.completed 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : index === currentStep
                    ? 'border-primary text-primary'
                    : 'border-muted text-muted-foreground'
                }`}>
                  {step.completed ? (
                    <Trophy className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                </div>
                {index < onboardingSteps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    step.completed ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <Card className="shadow-lg">
          <CardContent className="p-8">
            {renderStepContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DualOnboarding;
