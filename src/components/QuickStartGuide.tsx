import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, BookOpen, Trophy, Zap, Wallet, Coins, Target } from 'lucide-react';

const QuickStartGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState('setup');

  const tabs = [
    { id: 'setup', label: 'Setup', icon: <Wallet className="w-5 h-5" /> },
    { id: 'play', label: 'Play', icon: <Play className="w-5 h-5" /> },
    { id: 'earn', label: 'Earn', icon: <Coins className="w-5 h-5" /> }
  ];

  const setupSteps = [
    {
      icon: <Wallet className="w-6 h-6 text-blue-600" />,
      title: 'Connect Wallet',
      description: 'Click "Connect Wallet" and approve MetaMask connection',
      action: 'Connect Now'
    },
    {
      icon: <Zap className="w-6 h-6 text-orange-600" />,
      title: 'Switch Network',
      description: 'Automatically switch to Avalanche Fuji Testnet',
      action: 'Auto Switch'
    },
    {
      icon: <Coins className="w-6 h-6 text-green-600" />,
      title: 'Get Test Tokens',
      description: 'Visit Avalanche Faucet for free test AVAX',
      action: 'Get Tokens'
    }
  ];

  const playModes = [
    {
      icon: <Play className="w-6 h-6 text-blue-600" />,
      title: 'Classic Mode',
      description: 'Endless runner with increasing difficulty',
      rewards: '100 RUSH per 1000 points'
    },
    {
      icon: <BookOpen className="w-6 h-6 text-green-600" />,
      title: 'Tutorial Mode',
      description: 'Learn Web3 concepts through interactive quests',
      rewards: '500 RUSH per quest'
    },
    {
      icon: <Trophy className="w-6 h-6 text-purple-600" />,
      title: 'Tournament Mode',
      description: 'Compete for real prizes and recognition',
      rewards: 'Real money prizes'
    }
  ];

  const earningMethods = [
    {
      icon: <Target className="w-6 h-6 text-red-600" />,
      title: 'High Scores',
      description: 'Beat your personal best for bonus rewards',
      amount: '200+ RUSH'
    },
    {
      icon: <BookOpen className="w-6 h-6 text-blue-600" />,
      title: 'Quest Completion',
      description: 'Complete educational quests for tokens and NFTs',
      amount: '100-5000 RUSH'
    },
    {
      icon: <Trophy className="w-6 h-6 text-yellow-600" />,
      title: 'Tournament Wins',
      description: 'Win tournaments for real money and crypto prizes',
      amount: 'Real Prizes'
    }
  ];

  const handleAction = (action: string) => {
    switch (action) {
      case 'Connect Now':
        window.dispatchEvent(new CustomEvent('connect-wallet'));
        break;
      case 'Get Tokens':
        window.open('https://faucet.avax.network/', '_blank');
        break;
      default:
        break;
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Quick Start Guide</h2>
        <p className="text-lg text-gray-600">Get started with Avalanche Rush in 3 simple steps</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-lg p-1 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'setup' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">Setup Your Wallet</h3>
            {setupSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h4>
                    <p className="text-gray-600 mb-3">{step.description}</p>
                    <button
                      onClick={() => handleAction(step.action)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200"
                    >
                      {step.action}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'play' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">Choose Your Game Mode</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {playModes.map((mode, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200"
                >
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      {mode.icon}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{mode.title}</h4>
                    <p className="text-gray-600 mb-3">{mode.description}</p>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {mode.rewards}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'earn' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">How to Earn Rewards</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {earningMethods.map((method, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200"
                >
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      {method.icon}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{method.title}</h4>
                    <p className="text-gray-600 mb-3">{method.description}</p>
                    <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                      {method.amount}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Call to Action */}
      <div className="text-center mt-8">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('connect-wallet'))}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
        >
          Start Playing Now
        </button>
        <p className="text-sm text-gray-600 mt-3">
          No download required • Play instantly in your browser
        </p>
      </div>
    </div>
  );
};

export default QuickStartGuide;

