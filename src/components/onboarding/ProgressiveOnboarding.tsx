import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { X, Mail, Lock, User, Wallet, ArrowRight, CheckCircle, Star, Zap } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  type: 'web2' | 'web3' | 'hybrid';
  isCompleted: boolean;
  isRequired: boolean;
  component: React.ReactNode;
}

interface ProgressiveOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (userData: any) => void;
}

const ProgressiveOnboarding: React.FC<ProgressiveOnboardingProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState({
    email: '',
    username: '',
    password: '',
    walletAddress: '',
    walletConnected: false,
    preferences: {
      notifications: true,
      analytics: true,
      socialFeatures: true
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Avalanche Rush',
      description: 'Let\'s get you started with your gaming journey',
      type: 'web2',
      isCompleted: false,
      isRequired: true,
      component: <WelcomeStep />
    },
    {
      id: 'account',
      title: 'Create Your Account',
      description: 'Set up your basic account information',
      type: 'web2',
      isCompleted: false,
      isRequired: true,
      component: <AccountStep userData={userData} setUserData={setUserData} />
    },
    {
      id: 'preferences',
      title: 'Customize Your Experience',
      description: 'Choose your preferences and settings',
      type: 'web2',
      isCompleted: false,
      isRequired: false,
      component: <PreferencesStep userData={userData} setUserData={setUserData} />
    },
    {
      id: 'wallet-intro',
      title: 'Unlock Web3 Features',
      description: 'Connect your wallet to access advanced features',
      type: 'hybrid',
      isCompleted: false,
      isRequired: false,
      component: <WalletIntroStep />
    },
    {
      id: 'wallet-connect',
      title: 'Connect Your Wallet',
      description: 'Link your MetaMask or other wallet',
      type: 'web3',
      isCompleted: false,
      isRequired: false,
      component: <WalletConnectStep userData={userData} setUserData={setUserData} />
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description: 'Start your Avalanche Rush adventure',
      type: 'hybrid',
      isCompleted: false,
      isRequired: true,
      component: <CompleteStep userData={userData} />
    }
  ];

  const handleNext = useCallback(async () => {
    if (currentStep < steps.length - 1) {
      setIsLoading(true);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentStep(prev => prev + 1);
      setIsLoading(false);
    } else {
      onComplete(userData);
    }
  }, [currentStep, steps.length, userData, onComplete]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, steps.length]);

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'web2': return '🌐';
      case 'web3': return '⛓️';
      case 'hybrid': return '🔗';
      default: return '📝';
    }
  };

  const getStepColor = (type: string) => {
    switch (type) {
      case 'web2': return 'from-blue-500 to-blue-600';
      case 'web3': return 'from-purple-500 to-purple-600';
      case 'hybrid': return 'from-green-500 to-green-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-4xl w-full mx-4 shadow-2xl border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black text-white mb-2">Get Started</h2>
              <p className="text-white/70">Progressive onboarding from Web2 to Web3</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/70 text-sm">Step {currentStep + 1} of {steps.length}</span>
              <span className="text-white/70 text-sm">{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
            </div>
            <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
          </div>

          {/* Step Navigation */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-white/10 text-white'
                    : index < currentStep
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-white/5 text-white/50'
                }`}
              >
                <span className="text-lg">{getStepIcon(step.type)}</span>
                <span className="text-sm font-medium">{step.title}</span>
                {index < currentStep && <CheckCircle className="w-4 h-4" />}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {steps[currentStep].component}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            <div>
              {currentStep > 0 && (
                <Button
                  onClick={handlePrevious}
                  variant="outline"
                  className="text-white border-white/20 hover:bg-white/10"
                >
                  Previous
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {!steps[currentStep].isRequired && (
                <Button
                  onClick={handleSkip}
                  variant="ghost"
                  className="text-white/70 hover:text-white"
                >
                  Skip
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                disabled={isLoading}
                className={`bg-gradient-to-r ${getStepColor(steps[currentStep].type)} hover:opacity-90 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 disabled:opacity-50`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Step Components
const WelcomeStep: React.FC = () => (
  <div className="text-center space-y-6">
    <div className="text-6xl mb-4">🏔️</div>
    <h3 className="text-2xl font-bold text-white">Welcome to Avalanche Rush!</h3>
    <p className="text-white/70 text-lg max-w-2xl mx-auto">
      Experience the future of gaming with Web3 integration. Start with familiar Web2 features 
      and gradually unlock the power of blockchain technology.
    </p>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      <div className="bg-white/5 rounded-lg p-6">
        <div className="text-3xl mb-3">🌐</div>
        <h4 className="text-white font-semibold mb-2">Web2 Start</h4>
        <p className="text-white/60 text-sm">Begin with email and social login</p>
      </div>
      <div className="bg-white/5 rounded-lg p-6">
        <div className="text-3xl mb-3">🔗</div>
        <h4 className="text-white font-semibold mb-2">Progressive</h4>
        <p className="text-white/60 text-sm">Unlock features as you progress</p>
      </div>
      <div className="bg-white/5 rounded-lg p-6">
        <div className="text-3xl mb-3">⛓️</div>
        <h4 className="text-white font-semibold mb-2">Web3 Power</h4>
        <p className="text-white/60 text-sm">Connect wallet for full experience</p>
      </div>
    </div>
  </div>
);

const AccountStep: React.FC<{ userData: any; setUserData: (data: any) => void }> = ({ userData, setUserData }) => (
  <div className="space-y-6">
    <div className="text-center">
      <h3 className="text-2xl font-bold text-white mb-2">Create Your Account</h3>
      <p className="text-white/70">Set up your basic account information</p>
    </div>

    <div className="space-y-4">
      <div>
        <Label htmlFor="email" className="text-white">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={userData.email}
          onChange={(e) => setUserData({ ...userData, email: e.target.value })}
          className="bg-white/10 border-white/20 text-white placeholder-white/50"
          placeholder="Enter your email"
        />
      </div>

      <div>
        <Label htmlFor="username" className="text-white">Username</Label>
        <Input
          id="username"
          type="text"
          value={userData.username}
          onChange={(e) => setUserData({ ...userData, username: e.target.value })}
          className="bg-white/10 border-white/20 text-white placeholder-white/50"
          placeholder="Choose a username"
        />
      </div>

      <div>
        <Label htmlFor="password" className="text-white">Password</Label>
        <Input
          id="password"
          type="password"
          value={userData.password}
          onChange={(e) => setUserData({ ...userData, password: e.target.value })}
          className="bg-white/10 border-white/20 text-white placeholder-white/50"
          placeholder="Create a password"
        />
      </div>
    </div>

    <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-500/30">
      <div className="flex items-center space-x-2 mb-2">
        <Mail className="w-5 h-5 text-blue-400" />
        <span className="text-blue-400 font-semibold">Web2 Account</span>
      </div>
      <p className="text-white/70 text-sm">
        Your account is stored securely and you can always connect a wallet later to unlock Web3 features.
      </p>
    </div>
  </div>
);

const PreferencesStep: React.FC<{ userData: any; setUserData: (data: any) => void }> = ({ userData, setUserData }) => (
  <div className="space-y-6">
    <div className="text-center">
      <h3 className="text-2xl font-bold text-white mb-2">Customize Your Experience</h3>
      <p className="text-white/70">Choose your preferences and settings</p>
    </div>

    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
        <div>
          <h4 className="text-white font-semibold">Email Notifications</h4>
          <p className="text-white/60 text-sm">Receive updates about your progress and rewards</p>
        </div>
        <input
          type="checkbox"
          checked={userData.preferences.notifications}
          onChange={(e) => setUserData({
            ...userData,
            preferences: { ...userData.preferences, notifications: e.target.checked }
          })}
          className="w-5 h-5 text-blue-600 bg-white/10 border-white/20 rounded"
        />
      </div>

      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
        <div>
          <h4 className="text-white font-semibold">Analytics</h4>
          <p className="text-white/60 text-sm">Help improve the game with anonymous usage data</p>
        </div>
        <input
          type="checkbox"
          checked={userData.preferences.analytics}
          onChange={(e) => setUserData({
            ...userData,
            preferences: { ...userData.preferences, analytics: e.target.checked }
          })}
          className="w-5 h-5 text-blue-600 bg-white/10 border-white/20 rounded"
        />
      </div>

      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
        <div>
          <h4 className="text-white font-semibold">Social Features</h4>
          <p className="text-white/60 text-sm">Connect with friends and share achievements</p>
        </div>
        <input
          type="checkbox"
          checked={userData.preferences.socialFeatures}
          onChange={(e) => setUserData({
            ...userData,
            preferences: { ...userData.preferences, socialFeatures: e.target.checked }
          })}
          className="w-5 h-5 text-blue-600 bg-white/10 border-white/20 rounded"
        />
      </div>
    </div>
  </div>
);

const WalletIntroStep: React.FC = () => (
  <div className="text-center space-y-6">
    <div className="text-6xl mb-4">🔗</div>
    <h3 className="text-2xl font-bold text-white">Unlock Web3 Features</h3>
    <p className="text-white/70 text-lg max-w-2xl mx-auto">
      Connect your wallet to access advanced features like NFT rewards, token earnings, 
      and cross-chain quests. You can always connect later if you're not ready now.
    </p>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      <div className="bg-white/5 rounded-lg p-6">
        <div className="text-3xl mb-3">🎮</div>
        <h4 className="text-white font-semibold mb-2">Play Without Wallet</h4>
        <p className="text-white/60 text-sm">Enjoy the full game experience with Web2 features</p>
      </div>
      <div className="bg-white/5 rounded-lg p-6">
        <div className="text-3xl mb-3">💰</div>
        <h4 className="text-white font-semibold mb-2">Connect for Rewards</h4>
        <p className="text-white/60 text-sm">Earn real tokens and NFT rewards</p>
      </div>
    </div>

    <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg p-6 border border-purple-500/30">
      <div className="flex items-center space-x-2 mb-2">
        <Star className="w-5 h-5 text-purple-400" />
        <span className="text-purple-400 font-semibold">Web3 Benefits</span>
      </div>
      <div className="text-white/70 text-sm space-y-1">
        <div>• Earn RUSH tokens for playing</div>
        <div>• Collect unique NFT achievements</div>
        <div>• Participate in cross-chain quests</div>
        <div>• Trade items in the marketplace</div>
      </div>
    </div>
  </div>
);

const WalletConnectStep: React.FC<{ userData: any; setUserData: (data: any) => void }> = ({ userData, setUserData }) => (
  <div className="space-y-6">
    <div className="text-center">
      <h3 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h3>
      <p className="text-white/70">Link your MetaMask or other wallet to unlock Web3 features</p>
    </div>

    <div className="space-y-4">
      <button
        onClick={() => setUserData({ ...userData, walletConnected: true, walletAddress: '0x1234...5678' })}
        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3"
      >
        <span className="text-xl">🦊</span>
        <span>Connect MetaMask</span>
      </button>

      <button
        onClick={() => setUserData({ ...userData, walletConnected: true, walletAddress: '0x2345...6789' })}
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3"
      >
        <span className="text-xl">🔵</span>
        <span>Connect WalletConnect</span>
      </button>

      <button
        onClick={() => setUserData({ ...userData, walletConnected: true, walletAddress: '0x3456...7890' })}
        className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3"
      >
        <span className="text-xl">💎</span>
        <span>Connect Coinbase Wallet</span>
      </button>
    </div>

    {userData.walletConnected && (
      <div className="bg-green-500/20 rounded-lg p-4 border border-green-500/30">
        <div className="flex items-center space-x-2 mb-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="text-green-400 font-semibold">Wallet Connected</span>
        </div>
        <p className="text-white/70 text-sm">
          Address: {userData.walletAddress}
        </p>
      </div>
    )}

    <div className="bg-yellow-500/20 rounded-lg p-4 border border-yellow-500/30">
      <div className="flex items-center space-x-2 mb-2">
        <Zap className="w-5 h-5 text-yellow-400" />
        <span className="text-yellow-400 font-semibold">Security Note</span>
      </div>
      <p className="text-white/70 text-sm">
        Your wallet connection is secure and you maintain full control of your assets. 
        We never store your private keys.
      </p>
    </div>
  </div>
);

const CompleteStep: React.FC<{ userData: any }> = ({ userData }) => (
  <div className="text-center space-y-6">
    <div className="text-6xl mb-4">🎉</div>
    <h3 className="text-2xl font-bold text-white">You're All Set!</h3>
    <p className="text-white/70 text-lg max-w-2xl mx-auto">
      Welcome to Avalanche Rush! You're ready to start your gaming adventure.
    </p>
    
    <div className="bg-white/5 rounded-lg p-6 max-w-md mx-auto">
      <h4 className="text-white font-semibold mb-4">Your Account</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-white/70">Username:</span>
          <span className="text-white">{userData.username}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Email:</span>
          <span className="text-white">{userData.email}</span>
        </div>
        {userData.walletConnected && (
          <div className="flex justify-between">
            <span className="text-white/70">Wallet:</span>
            <span className="text-white">{userData.walletAddress}</span>
          </div>
        )}
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
      <div className="bg-white/5 rounded-lg p-4">
        <div className="text-2xl mb-2">🎮</div>
        <h4 className="text-white font-semibold mb-1">Start Playing</h4>
        <p className="text-white/60 text-sm">Jump into the game and start earning</p>
      </div>
      <div className="bg-white/5 rounded-lg p-4">
        <div className="text-2xl mb-2">🏆</div>
        <h4 className="text-white font-semibold mb-1">Earn Rewards</h4>
        <p className="text-white/60 text-sm">Complete quests and earn tokens</p>
      </div>
    </div>
  </div>
);

export default ProgressiveOnboarding;