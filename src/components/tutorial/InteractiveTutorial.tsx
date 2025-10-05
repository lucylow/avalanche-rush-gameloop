import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipForward, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  Keyboard,
  MousePointer,
  Zap,
  Shield,
  Target,
  Trophy,
  Star,
  CheckCircle
} from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  instructions: string[];
  demoType: 'movement' | 'collection' | 'powerup' | 'ability' | 'combo' | 'minigame';
  controls: string[];
  visualGuide?: {
    type: 'arrow' | 'highlight' | 'pulse' | 'glow';
    position: { x: number; y: number };
    size?: number;
    color?: string;
  };
  successCondition: () => boolean;
  reward?: {
    points: number;
    achievement?: string;
  };
}

interface InteractiveTutorialProps {
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({ 
  isActive, 
  onComplete, 
  onSkip 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tutorialProgress, setTutorialProgress] = useState<Record<string, boolean>>({});
  const [demoData, setDemoData] = useState<Record<string, unknown> | null>(null);
  const [highlightedElement, setHighlightedElement] = useState<{ x: number; y: number; type: string } | null>(null);

  // Tutorial steps configuration
  const tutorialSteps: TutorialStep[] = [
    {
      id: 'welcome',
      title: '🎮 Welcome to Avalanche Rush!',
      description: 'Learn the basics of this exciting blockchain-powered game',
      instructions: [
        'Avalanche Rush combines gaming with Web3 education',
        'Complete quests to earn NFTs and tokens',
        'Your character will guide you through the journey',
        'Let\'s start with basic movement!'
      ],
      demoType: 'movement',
      controls: ['WASD', 'Arrow Keys'],
      visualGuide: {
        type: 'pulse',
        position: { x: 400, y: 300 },
        size: 50,
        color: '#4CAF50'
      },
      successCondition: () => Boolean(demoData?.movementCompleted) || false,
      reward: { points: 100, achievement: 'First Steps' }
    },
    {
      id: 'movement',
      title: '🚀 Basic Movement',
      description: 'Learn how to move your character around the game world',
      instructions: [
        'Use WASD or Arrow Keys to move',
        'W/↑ = Move Up',
        'S/↓ = Move Down', 
        'A/← = Move Left',
        'D/→ = Move Right',
        'Try moving in all directions!'
      ],
      demoType: 'movement',
      controls: ['W', 'A', 'S', 'D', 'Arrow Keys'],
      visualGuide: {
        type: 'arrow',
        position: { x: 500, y: 250 },
        size: 40,
        color: '#2196F3'
      },
      successCondition: () => Boolean(demoData?.movementCompleted) || false,
      reward: { points: 150 }
    },
    {
      id: 'collectibles',
      title: '🪙 Collecting Coins & Gems',
      description: 'Learn about different collectibles and their values',
      instructions: [
        '🪙 Gold Coins = 10 points + combo bonus',
        '💎 Energy Crystals = Restore health',
        '💎 Rare Gems = 50+ points with special effects',
        'Move into collectibles to collect them',
        'Build combos for higher scores!'
      ],
      demoType: 'collection',
      controls: ['Movement Keys'],
      visualGuide: {
        type: 'highlight',
        position: { x: 600, y: 200 },
        size: 30,
        color: '#FFD700'
      },
      successCondition: () => Number(demoData?.collectiblesCollected || 0) >= 3,
      reward: { points: 200, achievement: 'Coin Collector' }
    },
    {
      id: 'obstacles',
      title: '⚠️ Avoiding Obstacles',
      description: 'Learn how to navigate around dangerous obstacles',
      instructions: [
        'Red spinning obstacles will damage you',
        'You have 3 lives - use them wisely!',
        'Energy crystals restore your health',
        'Practice dodging moving obstacles',
        'Stay alert and move quickly!'
      ],
      demoType: 'movement',
      controls: ['Movement Keys'],
      visualGuide: {
        type: 'glow',
        position: { x: 700, y: 350 },
        size: 40,
        color: '#FF4444'
      },
      successCondition: () => Number(demoData?.obstaclesAvoided) >= 2,
      reward: { points: 250 }
    },
    {
      id: 'powerups',
      title: '⚡ Power-Up Collection',
      description: 'Discover the amazing power-ups that enhance your gameplay',
      instructions: [
        '🛡️ Shield = Absorbs one hit',
        '⚡ Speed = Move faster temporarily',
        '🧲 Magnet = Pulls collectibles to you',
        '× Multiplier = Doubles your score',
        '⭐ Invincible = No damage for 5 seconds',
        '⏰ Slow Motion = Slows down obstacles'
      ],
      demoType: 'powerup',
      controls: ['Movement Keys'],
      visualGuide: {
        type: 'pulse',
        position: { x: 300, y: 400 },
        size: 35,
        color: '#9C27B0'
      },
      successCondition: () => Number(demoData?.powerupsCollected) >= 1,
      reward: { points: 300, achievement: 'Power-Up Master' }
    },
    {
      id: 'special_abilities',
      title: '🎯 Special Abilities',
      description: 'Master the powerful special abilities',
      instructions: [
        'Q Key = Dash forward quickly',
        'E Key = Time freeze (slows obstacles)',
        'R Key = Mega collect (magnet effect)',
        'Each ability has a cooldown period',
        'Use abilities strategically for maximum effect!'
      ],
      demoType: 'ability',
      controls: ['Q', 'E', 'R'],
      visualGuide: {
        type: 'highlight',
        position: { x: 100, y: 100 },
        size: 25,
        color: '#E91E63'
      },
      successCondition: () => Number(demoData?.abilitiesUsed) >= 2,
      reward: { points: 400, achievement: 'Ability Expert' }
    },
    {
      id: 'combos',
      title: '🔥 Combo System',
      description: 'Learn how to build massive combos for huge scores',
      instructions: [
        'Collect items quickly to build combos',
        'Each combo increases your point multiplier',
        'Don\'t let too much time pass between collections',
        'Gems give bigger combo bonuses',
        'Power-ups can extend combo time!'
      ],
      demoType: 'combo',
      controls: ['Movement Keys', 'Collection'],
      visualGuide: {
        type: 'glow',
        position: { x: 400, y: 150 },
        size: 60,
        color: '#FF6B6B'
      },
      successCondition: () => Number(demoData?.maxCombo) >= 5,
      reward: { points: 500, achievement: 'Combo Master' }
    },
    {
      id: 'minigames',
      title: '🎪 Mini-Games',
      description: 'Discover exciting bonus mini-games',
      instructions: [
        'Mini-games appear during special events',
        '🎯 Bonus Round = Click all targets',
        '⚡ Speed Challenge = Fast clicking action',
        '🎪 Precision Test = Careful target clicking',
        'Earn bonus points in mini-games!'
      ],
      demoType: 'minigame',
      controls: ['Mouse Click'],
      visualGuide: {
        type: 'pulse',
        position: { x: 500, y: 300 },
        size: 45,
        color: '#00BCD4'
      },
      successCondition: () => Boolean(demoData?.minigameCompleted) || false,
      reward: { points: 600, achievement: 'Mini-Game Champion' }
    },
    {
      id: 'completion',
      title: '🏆 Tutorial Complete!',
      description: 'You\'re ready to master Avalanche Rush!',
      instructions: [
        'You\'ve learned all the essential controls',
        'Remember to collect power-ups strategically',
        'Build combos for maximum scores',
        'Use special abilities wisely',
        'Have fun and earn amazing rewards!'
      ],
      demoType: 'movement',
      controls: [],
      successCondition: () => true,
      reward: { points: 1000, achievement: 'Tutorial Graduate' }
    }
  ];

  // Simulate demo data based on current step
  useEffect(() => {
    if (isActive && currentStep < tutorialSteps.length) {
      const step = tutorialSteps[currentStep];
      
      // Simulate demo data based on step type
      switch (step.demoType) {
        case 'movement':
          setDemoData({
            movementCompleted: currentStep >= 1,
            obstaclesAvoided: currentStep >= 3 ? Math.min(2, currentStep - 2) : 0
          });
          break;
        case 'collection':
          setDemoData({
            collectiblesCollected: currentStep >= 2 ? Math.min(5, (currentStep - 1) * 2) : 0
          });
          break;
        case 'powerup':
          setDemoData({
            powerupsCollected: currentStep >= 4 ? 1 : 0
          });
          break;
        case 'ability':
          setDemoData({
            abilitiesUsed: currentStep >= 5 ? 2 : 0
          });
          break;
        case 'combo':
          setDemoData({
            maxCombo: currentStep >= 6 ? 7 : 0
          });
          break;
        case 'minigame':
          setDemoData({
            minigameCompleted: currentStep >= 7
          });
          break;
        default:
          setDemoData({});
      }
    }
  }, [isActive, currentStep]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setTutorialProgress(prev => ({
        ...prev,
        [tutorialSteps[currentStep].id]: true
      }));
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const getControlIcon = (control: string) => {
    switch (control.toLowerCase()) {
      case 'w':
      case 'arrow up':
        return <ArrowUp className="w-6 h-6" />;
      case 's':
      case 'arrow down':
        return <ArrowDown className="w-6 h-6" />;
      case 'a':
      case 'arrow left':
        return <ArrowLeft className="w-6 h-6" />;
      case 'd':
      case 'arrow right':
        return <ArrowRight className="w-6 h-6" />;
      case 'q':
      case 'e':
      case 'r':
        return <Zap className="w-6 h-6" />;
      default:
        return <Keyboard className="w-6 h-6" />;
    }
  };

  const getDemoVisualization = () => {
    const step = tutorialSteps[currentStep];
    if (!step.visualGuide) return null;

    const { type, position, size = 30, color = '#4CAF50' } = step.visualGuide;

    return (
      <motion.div
        className="absolute pointer-events-none"
        style={{
          left: position.x - size / 2,
          top: position.y - size / 2,
          width: size,
          height: size
        }}
        animate={
          type === 'pulse' 
            ? { scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }
            : type === 'glow'
            ? { boxShadow: [`0 0 20px ${color}`, `0 0 40px ${color}`, `0 0 20px ${color}`] }
            : type === 'highlight'
            ? { scale: [1, 1.1, 1], backgroundColor: [color, color + '80', color] }
            : {}
        }
        transition={{ duration: 2, repeat: Infinity }}
      >
        {type === 'arrow' && (
          <ArrowRight className="w-full h-full" style={{ color }} />
        )}
        {type === 'pulse' && (
          <div 
            className="w-full h-full rounded-full border-2"
            style={{ borderColor: color }}
          />
        )}
        {type === 'highlight' && (
          <div 
            className="w-full h-full rounded-lg"
            style={{ backgroundColor: color }}
          />
        )}
        {type === 'glow' && (
          <div 
            className="w-full h-full rounded-full"
            style={{ backgroundColor: color }}
          />
        )}
      </motion.div>
    );
  };

  if (!isActive) return null;

  const currentStepData = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;
  const isCompleted = currentStepData.successCondition();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-2xl p-8 max-w-4xl w-full mx-4 border-2 border-purple-400"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {currentStepData.title}
              </h2>
              <p className="text-gray-300">{currentStepData.description}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400 mb-1">Progress</div>
              <div className="text-2xl font-bold text-white">
                {currentStep + 1} / {tutorialSteps.length}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-3 mb-6">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
            {/* Instructions */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">Instructions</h3>
              <div className="space-y-3">
                {currentStepData.instructions.map((instruction, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 text-gray-300"
                  >
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>{instruction}</span>
                  </motion.div>
                ))}
              </div>

              {/* Controls */}
              {currentStepData.controls.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-bold text-white mb-3">Controls</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentStepData.controls.map((control, index) => (
                      <motion.div
                        key={index}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg border border-gray-600"
                      >
                        {getControlIcon(control)}
                        <span className="text-white font-mono text-sm">{control}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Demo Visualization */}
            <div className="relative">
              <h3 className="text-xl font-bold text-white mb-4">Demo</h3>
              <div className="relative bg-black/30 rounded-lg h-64 border border-gray-600 overflow-hidden">
                {getDemoVisualization()}
                
                {/* Demo Content based on step type */}
                {currentStepData.demoType === 'movement' && (
                  <motion.div
                    className="absolute w-8 h-8 bg-green-500 rounded-full"
                    style={{ left: 200, top: 150 }}
                    animate={{
                      x: [0, 100, 0, -50, 0],
                      y: [0, -50, 50, 0, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />
                )}
                
                {currentStepData.demoType === 'collection' && (
                  <>
                    <motion.div
                      className="absolute w-6 h-6 bg-yellow-400 rounded-full"
                      style={{ left: 300, top: 100 }}
                      animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute w-8 h-8 bg-blue-400"
                      style={{ left: 400, top: 150 }}
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute w-7 h-7 bg-purple-400 rounded-full"
                      style={{ left: 500, top: 200 }}
                      animate={{ 
                        scale: [1, 1.3, 1],
                        boxShadow: ['0 0 10px purple', '0 0 20px purple', '0 0 10px purple']
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </>
                )}

                {currentStepData.demoType === 'powerup' && (
                  <motion.div
                    className="absolute w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center"
                    style={{ left: 250, top: 120 }}
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Shield className="w-6 h-6 text-white" />
                  </motion.div>
                )}

                {currentStepData.demoType === 'ability' && (
                  <motion.div
                    className="absolute w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center"
                    style={{ left: 300, top: 100 }}
                    animate={{ 
                      scale: [1, 1.2, 1],
                      boxShadow: ['0 0 20px pink', '0 0 40px pink', '0 0 20px pink']
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Zap className="w-8 h-8 text-white" />
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Completion Status */}
          {isCompleted && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-green-600/20 border border-green-500 rounded-lg p-4 mb-6"
            >
              <div className="flex items-center gap-3 text-green-400">
                <CheckCircle className="w-6 h-6" />
                <span className="font-bold">Step completed! Great job!</span>
                {currentStepData.reward && (
                  <span className="ml-auto">+{currentStepData.reward.points} points</span>
                )}
              </div>
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Previous
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSkip}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Skip Tutorial
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              disabled={!isCompleted && currentStep < tutorialSteps.length - 1}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-all"
            >
              {currentStep === tutorialSteps.length - 1 ? 'Complete Tutorial' : 'Next Step'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InteractiveTutorial;
