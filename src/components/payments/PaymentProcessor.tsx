import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Wallet, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Coins,
  Shield,
  Zap
} from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { useAuth } from '@/hooks/useAuth';

interface PaymentProcessorProps {
  amount: number;
  currency: 'USD' | 'AVAX';
  onSuccess: (paymentData: any) => void;
  onError: (error: string) => void;
  subscriptionTier: 'premium' | 'pro';
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  available: boolean;
}

const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
  amount,
  currency,
  onSuccess,
  onError,
  subscriptionTier
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    email: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'method' | 'details' | 'processing' | 'success' | 'error'>('method');

  const { isConnected, account, signer } = useWeb3();
  const { user } = useAuth();

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'stripe',
      name: 'Credit Card',
      icon: <CreditCard className="w-5 h-5" />,
      description: 'Pay with Visa, Mastercard, or American Express',
      available: true
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: <CreditCard className="w-5 h-5" />,
      description: 'Pay with your PayPal account',
      available: true
    },
    {
      id: 'crypto',
      name: 'Cryptocurrency',
      icon: <Coins className="w-5 h-5" />,
      description: 'Pay with AVAX or other supported tokens',
      available: isConnected
    },
    {
      id: 'wallet',
      name: 'Wallet Connect',
      icon: <Wallet className="w-5 h-5" />,
      description: 'Connect and pay with your Web3 wallet',
      available: true
    }
  ];

  const cryptoAmounts = {
    premium: '0.01 AVAX',
    pro: '0.02 AVAX'
  };

  const handleMethodSelection = (methodId: string) => {
    setSelectedMethod(methodId);
    setError(null);
    
    if (methodId === 'crypto' && !isConnected) {
      setError('Please connect your wallet first');
      return;
    }
    
    setStep('details');
  };

  const handlePaymentDetails = () => {
    if (selectedMethod === 'stripe' || selectedMethod === 'paypal') {
      if (!paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv || !paymentData.cardholderName) {
        setError('Please fill in all required fields');
        return;
      }
    }
    
    setStep('processing');
    processPayment();
  };

  const processPayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      let result;

      switch (selectedMethod) {
        case 'stripe':
          result = await processStripePayment();
          break;
        case 'paypal':
          result = await processPayPalPayment();
          break;
        case 'crypto':
          result = await processCryptoPayment();
          break;
        case 'wallet':
          result = await processWalletPayment();
          break;
        default:
          throw new Error('Invalid payment method');
      }

      setStep('success');
      onSuccess(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      setStep('error');
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const processStripePayment = async () => {
    // Simulate Stripe payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      method: 'stripe',
      amount,
      currency,
      transactionId: `stripe_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  };

  const processPayPalPayment = async () => {
    // Simulate PayPal payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      method: 'paypal',
      amount,
      currency,
      transactionId: `paypal_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  };

  const processCryptoPayment = async () => {
    if (!signer) {
      throw new Error('Wallet not connected');
    }

    // Simulate crypto payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return {
      method: 'crypto',
      amount: cryptoAmounts[subscriptionTier],
      currency: 'AVAX',
      transactionId: `crypto_${Date.now()}`,
      timestamp: new Date().toISOString(),
      walletAddress: account
    };
  };

  const processWalletPayment = async () => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    // Simulate wallet payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      method: 'wallet',
      amount: cryptoAmounts[subscriptionTier],
      currency: 'AVAX',
      transactionId: `wallet_${Date.now()}`,
      timestamp: new Date().toISOString(),
      walletAddress: account
    };
  };

  const renderMethodSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Choose Payment Method</h3>
        <p className="text-muted-foreground">
          Select how you'd like to pay for your {subscriptionTier} subscription
        </p>
      </div>

      <div className="grid gap-4">
        {paymentMethods.map((method) => (
          <Card 
            key={method.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedMethod === method.id ? 'ring-2 ring-primary' : ''
            } ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => method.available && handleMethodSelection(method.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {method.icon}
                  <div>
                    <h4 className="font-medium">{method.name}</h4>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                </div>
                {!method.available && (
                  <Badge variant="secondary">Unavailable</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {error && (
        <div className="text-red-500 text-sm text-center">{error}</div>
      )}
    </div>
  );

  const renderPaymentDetails = () => {
    if (selectedMethod === 'crypto' || selectedMethod === 'wallet') {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Crypto Payment</h3>
            <p className="text-muted-foreground">
              Complete your payment with cryptocurrency
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Coins className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="font-semibold">Payment Details</h4>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Amount:</span>
                    <span className="font-medium">{cryptoAmounts[subscriptionTier]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Wallet:</span>
                    <span className="font-mono text-sm">{account}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Network:</span>
                    <span className="font-medium">Avalanche C-Chain</span>
                  </div>
                </div>

                <Separator />

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    Send payment to:
                  </p>
                  <p className="font-mono text-sm break-all">
                    0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
                  </p>
                </div>

                <Button 
                  onClick={handlePaymentDetails}
                  className="w-full"
                >
                  Confirm Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Payment Details</h3>
          <p className="text-muted-foreground">
            Enter your payment information
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  value={paymentData.cardholderName}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, cardholderName: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  value={paymentData.cardNumber}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, cardNumber: e.target.value }))}
                  placeholder="1234 5678 9012 3456"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    value={paymentData.expiryDate}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    value={paymentData.cvv}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, cvv: e.target.value }))}
                    placeholder="123"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={paymentData.email}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}

              <Button 
                onClick={handlePaymentDetails}
                className="w-full"
              >
                Continue to Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderProcessing = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
        <p className="text-muted-foreground">
          Please wait while we process your payment...
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Method:</span>
              <span className="font-medium capitalize">{selectedMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Amount:</span>
              <span className="font-medium">
                {selectedMethod === 'crypto' || selectedMethod === 'wallet' 
                  ? cryptoAmounts[subscriptionTier] 
                  : `$${amount}`
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant="secondary">Processing</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSuccess = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Payment Successful!</h3>
        <p className="text-muted-foreground">
          Your {subscriptionTier} subscription is now active
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Subscription:</span>
              <Badge variant="secondary" className="capitalize">{subscriptionTier}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Amount:</span>
              <span className="font-medium">
                {selectedMethod === 'crypto' || selectedMethod === 'wallet' 
                  ? cryptoAmounts[subscriptionTier] 
                  : `$${amount}`
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Method:</span>
              <span className="font-medium capitalize">{selectedMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant="default">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderError = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Payment Failed</h3>
        <p className="text-muted-foreground">
          {error || 'Something went wrong with your payment'}
        </p>
      </div>

      <div className="text-center">
        <Button 
          onClick={() => setStep('method')}
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (step) {
      case 'method':
        return renderMethodSelection();
      case 'details':
        return renderPaymentDetails();
      case 'processing':
        return renderProcessing();
      case 'success':
        return renderSuccess();
      case 'error':
        return renderError();
      default:
        return renderMethodSelection();
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            {subscriptionTier === 'premium' ? 'Premium Plan' : 'Pro Plan'}
            <div className="text-2xl font-bold mt-2">
              {currency === 'USD' ? `$${amount}` : cryptoAmounts[subscriptionTier]}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentProcessor;
