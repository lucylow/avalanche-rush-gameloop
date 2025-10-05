import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Crown, Star, Zap, Gift } from 'lucide-react';
import { useAdvancedWeb3 } from '../hooks/useAdvancedWeb3';

interface SubscriptionPlan {
  tier: 'FREE' | 'PREMIUM' | 'PRO';
  name: string;
  price: string;
  priceInAvax: number;
  duration: string;
  rewardMultiplier: string;
  features: string[];
  icon: React.ReactNode;
  color: string;
  popular?: boolean;
}

interface UserSubscription {
  tier: number;
  startTime: number;
  endTime: number;
  isActive: boolean;
  totalPaid: number;
  renewalCount: number;
}

const SubscriptionPlans: React.FC = () => {
  const { isConnected, account } = useAdvancedWeb3();
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'PREMIUM' | 'PRO' | null>(null);

  const plans: SubscriptionPlan[] = [
    {
      tier: 'FREE',
      name: 'Free Player',
      price: 'Free',
      priceInAvax: 0,
      duration: 'Forever',
      rewardMultiplier: '1x',
      features: [
        'Basic gameplay access',
        '1x RUSH token rewards',
        'Standard achievement NFTs',
        'Community tournaments',
        'Basic customer support'
      ],
      icon: <Gift className="w-6 h-6" />,
      color: 'from-gray-500 to-gray-600'
    },
    {
      tier: 'PREMIUM',
      name: 'Premium Rush',
      price: '$9.99',
      priceInAvax: 0.01,
      duration: '30 days',
      rewardMultiplier: '2x',
      features: [
        'All free features',
        '2x RUSH token rewards',
        'Premium achievement NFTs',
        'Priority tournament access',
        'Exclusive game modes',
        'Ad-free experience',
        'Discord VIP channel',
        'Priority customer support'
      ],
      icon: <Star className="w-6 h-6" />,
      color: 'from-blue-500 to-purple-500',
      popular: true
    },
    {
      tier: 'PRO',
      name: 'Pro Gamer',
      price: '$19.99',
      priceInAvax: 0.02,
      duration: '30 days',
      rewardMultiplier: '3x',
      features: [
        'All premium features',
        '3x RUSH token rewards',
        'Legendary achievement NFTs',
        'VIP tournament access',
        'Early access to new content',
        'Custom avatar NFTs',
        'Personal gameplay analytics',
        'Direct developer support',
        'Beta feature access'
      ],
      icon: <Crown className="w-6 h-6" />,
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  useEffect(() => {
    if (isConnected && account) {
      fetchUserSubscription();
    }
  }, [isConnected, account]);

  const fetchUserSubscription = async () => {
    try {
      // Mock data - replace with actual contract call
      const subscription: UserSubscription = {
        tier: 0, // FREE = 0, PREMIUM = 1, PRO = 2
        startTime: Date.now(),
        endTime: Date.now() + (30 * 24 * 60 * 60 * 1000),
        isActive: false,
        totalPaid: 0,
        renewalCount: 0
      };
      setCurrentSubscription(subscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const handleSubscribe = async (planTier: 'PREMIUM' | 'PRO') => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setSelectedPlan(planTier);

    try {
      const plan = plans.find(p => p.tier === planTier);
      if (!plan) throw new Error('Plan not found');

      // Mock subscription logic - replace with actual contract interaction
      console.log(`Subscribing to ${planTier} for ${plan.priceInAvax} AVAX`);
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update local state
      setCurrentSubscription({
        tier: planTier === 'PREMIUM' ? 1 : 2,
        startTime: Date.now(),
        endTime: Date.now() + (30 * 24 * 60 * 60 * 1000),
        isActive: true,
        totalPaid: plan.priceInAvax,
        renewalCount: 1
      });

      alert(`Successfully subscribed to ${plan.name}!`);
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Subscription failed. Please try again.');
    } finally {
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  const isCurrentPlan = (tier: string) => {
    if (!currentSubscription) return tier === 'FREE';
    const tierMap = { FREE: 0, PREMIUM: 1, PRO: 2 };
    return currentSubscription.tier === tierMap[tier as keyof typeof tierMap];
  };

  const isActiveSubscription = () => {
    return currentSubscription?.isActive && 
           currentSubscription.endTime > Date.now();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Adventure Plan
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Unlock premium features, earn more rewards, and access exclusive content
        </p>
      </div>

      {/* Current Subscription Status */}
      {isConnected && currentSubscription && isActiveSubscription() && (
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-800">
                Active Subscription: {plans[currentSubscription.tier].name}
              </h3>
              <p className="text-green-600">
                Expires: {new Date(currentSubscription.endTime).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-600">
                Reward Multiplier: {plans[currentSubscription.tier].rewardMultiplier}
              </p>
              <p className="text-xs text-green-500">
                Renewals: {currentSubscription.renewalCount}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.tier}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative bg-white rounded-2xl shadow-xl overflow-hidden ${
              plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-center py-2 text-sm font-semibold">
                Most Popular
              </div>
            )}

            <div className={`bg-gradient-to-br ${plan.color} p-6 ${plan.popular ? 'pt-12' : ''}`}>
              <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mx-auto mb-4">
                {plan.icon}
              </div>
              <h3 className="text-2xl font-bold text-white text-center mb-2">
                {plan.name}
              </h3>
              <div className="text-center">
                <span className="text-3xl font-bold text-white">{plan.price}</span>
                {plan.tier !== 'FREE' && (
                  <span className="text-white/80 text-sm">/{plan.duration}</span>
                )}
              </div>
              <div className="text-center mt-2">
                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {plan.rewardMultiplier} Rewards
                </span>
              </div>
            </div>

            <div className="p-6">
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.tier === 'FREE' ? (
                <button
                  disabled={isCurrentPlan(plan.tier)}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                    isCurrentPlan(plan.tier)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {isCurrentPlan(plan.tier) ? 'Current Plan' : 'Free Forever'}
                </button>
              ) : (
                <button
                  onClick={() => handleSubscribe(plan.tier as 'PREMIUM' | 'PRO')}
                  disabled={isLoading || isCurrentPlan(plan.tier)}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                    isCurrentPlan(plan.tier)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : `bg-gradient-to-r ${plan.color} text-white hover:shadow-lg hover:scale-105`
                  }`}
                >
                  {isLoading && selectedPlan === plan.tier ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Processing...</span>
                    </div>
                  ) : isCurrentPlan(plan.tier) ? (
                    'Current Plan'
                  ) : (
                    `Upgrade to ${plan.name}`
                  )}
                </button>
              )}

              {plan.tier !== 'FREE' && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  Pay with AVAX • {plan.priceInAvax} AVAX
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Features Comparison */}
      <div className="mt-16">
        <h3 className="text-2xl font-bold text-center mb-8">Feature Comparison</h3>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-4 gap-4 p-6 bg-gray-50 border-b">
            <div className="font-semibold text-gray-900">Feature</div>
            <div className="text-center font-semibold text-gray-900">Free</div>
            <div className="text-center font-semibold text-blue-600">Premium</div>
            <div className="text-center font-semibold text-yellow-600">Pro</div>
          </div>
          <div className="divide-y">
            <div className="grid grid-cols-4 gap-4 p-4">
              <div className="text-gray-700">RUSH Token Rewards</div>
              <div className="text-center">1x</div>
              <div className="text-center text-blue-600">2x</div>
              <div className="text-center text-yellow-600">3x</div>
            </div>
            <div className="grid grid-cols-4 gap-4 p-4">
              <div className="text-gray-700">Tournament Access</div>
              <div className="text-center">Basic</div>
              <div className="text-center text-blue-600">Priority</div>
              <div className="text-center text-yellow-600">VIP</div>
            </div>
            <div className="grid grid-cols-4 gap-4 p-4">
              <div className="text-gray-700">Achievement NFTs</div>
              <div className="text-center">Standard</div>
              <div className="text-center text-blue-600">Premium</div>
              <div className="text-center text-yellow-600">Legendary</div>
            </div>
            <div className="grid grid-cols-4 gap-4 p-4">
              <div className="text-gray-700">Customer Support</div>
              <div className="text-center">Basic</div>
              <div className="text-center text-blue-600">Priority</div>
              <div className="text-center text-yellow-600">Direct</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
