import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { X, BookOpen, CheckCircle, ArrowRight, Play } from 'lucide-react';

interface TutorialManagerProps {
  isActive: boolean;
  onClose: () => void;
  onTutorialComplete: (achievements: string[], totalPoints: number) => void;
  playerLevel: number;
  hasPlayedBefore: boolean;
}

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  content: string;
  isCompleted: boolean;
  points: number;
}

const TutorialManager: React.FC<TutorialManagerProps> = ({
  isActive,
  onClose,
  onTutorialComplete,
  playerLevel,
  hasPlayedBefore
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<TutorialStep[]>([
    {
      id: 1,
      title: 'Welcome to Avalanche Rush',
      description: 'Learn the basics of Web3 gaming',
      content: 'Avalanche Rush combines traditional gaming with blockchain technology. You\'ll earn RUSH tokens by playing and completing quests.',
      isCompleted: false,
      points: 50
    },
    {
      id: 2,
      title: 'Wallet Connection',
      description: 'Connect your MetaMask wallet',
      content: 'Your wallet is your identity in Web3. It stores your tokens, NFTs, and connects you to the blockchain.',
      isCompleted: false,
      points: 100
    },
    {
      id: 3,
      title: 'Understanding Tokens',
      description: 'Learn about RUSH tokens and rewards',
      content: 'RUSH tokens are earned by playing games and completing quests. They can be used to buy NFTs and participate in tournaments.',
      isCompleted: false,
      points: 75
    },
    {
      id: 4,
      title: 'Game Mechanics',
      description: 'Master the endless runner gameplay',
      content: 'Jump over obstacles, collect coins, and avoid hazards. Your score determines your rewards!',
      isCompleted: false,
      points: 100
    },
    {
      id: 5,
      title: 'Quest System',
      description: 'Complete daily and weekly quests',
      content: 'Quests give you specific objectives to complete for bonus rewards. Check the quest dashboard regularly!',
      isCompleted: false,
      points: 125
    },
    {
      id: 6,
      title: 'NFT Marketplace',
      description: 'Buy, sell, and trade achievement NFTs',
      content: 'Your achievements become NFTs that you can trade with other players. Rare NFTs have higher value!',
      isCompleted: false,
      points: 150
    }
  ]);

  const [isCompleted, setIsCompleted] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    if (isActive && !hasPlayedBefore) {
      setCurrentStep(0);
      setIsCompleted(false);
      setTotalPoints(0);
    }
  }, [isActive, hasPlayedBefore]);

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCompleteTutorial();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompleteTutorial = () => {
    const completedSteps = steps.map(step => ({ ...step, isCompleted: true }));
    setSteps(completedSteps);
    setIsCompleted(true);
    
    const totalPointsEarned = steps.reduce((sum, step) => sum + step.points, 0);
    setTotalPoints(totalPointsEarned);
    
    const achievements = ['Tutorial Complete', 'First Steps', 'Web3 Explorer'];
    onTutorialComplete(achievements, totalPointsEarned);
  };

  const handleSkipTutorial = () => {
    onClose();
  };

  if (!isActive) return null;

  if (isCompleted) {
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
            className="bg-gradient-to-br from-green-800 to-green-900 rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-2xl border border-green-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6"
              >
                🎉
              </motion.div>
              
              <h2 className="text-4xl font-black text-white mb-4">Tutorial Complete!</h2>
              <p className="text-white/80 text-lg mb-6">
                Congratulations! You've learned the basics of Avalanche Rush.
              </p>
              
              <div className="bg-white/10 rounded-xl p-6 mb-8">
                <div className="text-3xl font-bold text-yellow-400 mb-2">
                  +{totalPoints} RUSH Tokens
                </div>
                <div className="text-white/70">
                  Earned from completing the tutorial
                </div>
              </div>
              
              <div className="space-y-4">
                <Button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-8 rounded-xl"
                >
                  Start Playing!
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-black text-white mb-2">Tutorial</h2>
              <p className="text-white/70 text-lg">Step {currentStep + 1} of {steps.length}</p>
            </div>
            <button
              onClick={handleSkipTutorial}
              className="text-white/70 hover:text-white text-2xl transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-white mb-2">
              <span className="font-medium">Progress</span>
              <span className="text-sm">{Math.round(progress)}%</span>
                  </div>
            <Progress value={progress} className="h-3" />
              </div>

          {/* Tutorial Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Step Info */}
            <div className="lg:col-span-2">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl">
                      {currentStep + 1}
                    </div>
                    <div>
                      <CardTitle className="text-white text-2xl">{currentStepData.title}</CardTitle>
                      <CardDescription className="text-white/70 text-lg">
                        {currentStepData.description}
                      </CardDescription>
                  </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-white/80 text-lg leading-relaxed">
                    {currentStepData.content}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Step List */}
            <div>
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Tutorial Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {steps.map((step, index) => (
                      <div
                        key={step.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                          index === currentStep
                            ? 'bg-blue-500/20 border border-blue-500/30'
                            : step.isCompleted
                            ? 'bg-green-500/20 border border-green-500/30'
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          step.isCompleted
                            ? 'bg-green-500 text-white'
                            : index === currentStep
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/20 text-white/70'
                        }`}>
                          {step.isCompleted ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium text-sm">{step.title}</div>
                          <div className="text-white/60 text-xs">+{step.points} points</div>
                        </div>
                      </div>
                  ))}
                </div>
                </CardContent>
              </Card>
                </div>
              </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              onClick={handlePreviousStep}
              disabled={currentStep === 0}
              variant="outline"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 disabled:opacity-50"
            >
              Previous
            </Button>
            
            <div className="flex items-center space-x-4">
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                +{currentStepData.points} points
              </Badge>
            </div>
            
            <Button
              onClick={handleNextStep}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TutorialManager;