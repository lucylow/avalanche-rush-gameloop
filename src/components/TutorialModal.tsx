import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Play, BookOpen, Trophy, Zap } from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  icon: React.ReactNode;
  action?: string;
}

const TutorialModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps: TutorialStep[] = [
    {
      id: 'wallet-setup',
      title: 'Connect Your Wallet',
      content: 'First, you need to connect your MetaMask wallet to start playing. Click the "Connect Wallet" button in the top navigation and approve the connection in MetaMask.',
      icon: <Play className="w-8 h-8 text-blue-600" />,
      action: 'Click "Connect Wallet" button'
    },
    {
      id: 'network-switch',
      title: 'Switch to Avalanche',
      content: 'The game will automatically prompt you to switch to Avalanche Fuji Testnet. This is where all the game contracts are deployed and where you\'ll earn rewards.',
      icon: <Zap className="w-8 h-8 text-orange-600" />,
      action: 'Approve network switch'
    },
    {
      id: 'get-tokens',
      title: 'Get Test Tokens',
      content: 'Visit the Avalanche Faucet to get free test AVAX tokens for gas fees. You\'ll need these to interact with smart contracts and earn rewards.',
      icon: <BookOpen className="w-8 h-8 text-green-600" />,
      action: 'Visit Avalanche Faucet'
    },
    {
      id: 'choose-mode',
      title: 'Choose Your Game Mode',
      content: 'Select from Classic Mode (endless runner), Tutorial Mode (learn Web3), Challenge Mode (time-limited events), or Tournament Mode (compete for prizes).',
      icon: <Trophy className="w-8 h-8 text-purple-600" />,
      action: 'Select game mode'
    },
    {
      id: 'start-playing',
      title: 'Start Playing & Earning',
      content: 'Now you\'re ready to play! Complete quests, achieve high scores, and earn RUSH tokens and NFT rewards. The more you play, the more you earn!',
      icon: <Play className="w-8 h-8 text-red-600" />,
      action: 'Start your first game'
    }
  ];

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAction = () => {
    const step = tutorialSteps[currentStep];
    switch (step.id) {
      case 'wallet-setup':
        // Trigger wallet connection
        window.dispatchEvent(new CustomEvent('connect-wallet'));
        break;
      case 'get-tokens':
        window.open('https://faucet.avax.network/', '_blank');
        break;
      case 'start-playing':
        onClose();
        break;
      default:
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">How to Play Avalanche Rush</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep + 1} of {tutorialSteps.length}</span>
              <span>{Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-8">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="mb-6">
                {tutorialSteps[currentStep].icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {tutorialSteps[currentStep].title}
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                {tutorialSteps[currentStep].content}
              </p>
              {tutorialSteps[currentStep].action && (
                <button
                  onClick={handleAction}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
                >
                  {tutorialSteps[currentStep].action}
                </button>
              )}
            </motion.div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous</span>
            </button>

            <div className="flex space-x-2">
              {tutorialSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentStep
                      ? 'bg-blue-600'
                      : index < currentStep
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={currentStep === tutorialSteps.length - 1 ? onClose : nextStep}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
            >
              <span>{currentStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TutorialModal;

