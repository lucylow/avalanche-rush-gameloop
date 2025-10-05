import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Play,
  ArrowUp,
  ArrowDown,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Volume2,
  Trophy,
  Star
} from 'lucide-react';

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  instructions: string[];
  visualGuide?: string;
  interactive?: boolean;
  points: number;
  completed: boolean;
}

interface MobileTutorialManagerProps {
  isActive: boolean;
  onClose: () => void;
  onTutorialComplete: (achievements: string[], totalPoints: number) => void;
  playerLevel: number;
  hasPlayedBefore: boolean;
}

const MobileTutorialManager: React.FC<MobileTutorialManagerProps> = ({
  isActive,
  onClose,
  onTutorialComplete,
  playerLevel,
  hasPlayedBefore
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);

  const tutorialSteps: TutorialStep[] = [
    {
      id: 1,
      title: "Welcome to Avalanche Rush!",
      description: "Learn the basics of this exciting Web3 game",
      instructions: [
        "Swipe up to jump over obstacles",
        "Swipe down to duck under barriers",
        "Collect gems to increase your score",
        "Avoid obstacles to stay alive"
      ],
      visualGuide: "🎮",
      points: 100,
      completed: false
    },
    {
      id: 2,
      title: "Movement Controls",
      description: "Master the touch controls",
      instructions: [
        "Tap the UP arrow to jump",
        "Tap the DOWN arrow to duck",
        "Tap LEFT/RIGHT to move sideways",
        "Hold buttons for continuous movement"
      ],
      visualGuide: "⬆️⬇️⬅️➡️",
      interactive: true,
      points: 200,
      completed: false
    },
    {
      id: 3,
      title: "Collecting Gems",
      description: "Learn about collectibles and scoring",
      instructions: [
        "Gold gems give 10 points",
        "Silver gems give 5 points",
        "Rare gems give 50+ points",
        "Collect as many as possible!"
      ],
      visualGuide: "💎💰⭐",
      points: 300,
      completed: false
    },
    {
      id: 4,
      title: "Power-ups & Abilities",
      description: "Discover special abilities",
      instructions: [
        "Shield: Protects you from one hit",
        "Speed: Makes you run faster",
        "Magnet: Attracts nearby gems",
        "Multiplier: Doubles your points"
      ],
      visualGuide: "🛡️⚡🧲✨",
      points: 400,
      completed: false
    },
    {
      id: 5,
      title: "Special Abilities",
      description: "Learn the Q, E, R abilities",
      instructions: [
        "Q - Dash: Quick forward movement",
        "E - Time Freeze: Slow down obstacles",
        "R - Mega Collect: Collect all nearby gems",
        "Use strategically for maximum effect"
      ],
      visualGuide: "🎯⏰💥",
      points: 500,
      completed: false
    },
    {
      id: 6,
      title: "Achievement System",
      description: "Understand the reward system",
      instructions: [
        "Complete achievements for bonus points",
        "Earn NFTs for special milestones",
        "Level up your character",
        "Unlock new abilities and characters"
      ],
      visualGuide: "🏆🎖️📈",
      points: 600,
      completed: false
    },
    {
      id: 7,
      title: "Web3 Integration",
      description: "Connect to the blockchain",
      instructions: [
        "Connect your wallet to earn tokens",
        "Complete blockchain quests",
        "Trade NFTs in the marketplace",
        "Participate in tournaments"
      ],
      visualGuide: "🔗💰🎮",
      points: 700,
      completed: false
    },
    {
      id: 8,
      title: "Character System",
      description: "Choose and evolve your character",
      instructions: [
        "Each character has unique abilities",
        "Build relationships through gameplay",
        "Unlock character evolution",
        "Discover character backstories"
      ],
      visualGuide: "👥💫📚",
      points: 800,
      completed: false
    },
    {
      id: 9,
      title: "Ready to Play!",
      description: "You're all set to start your adventure",
      instructions: [
        "Choose your game mode",
        "Select your character",
        "Connect your wallet",
        "Start earning rewards!"
      ],
      visualGuide: "🚀🎉✨",
      points: 1000,
      completed: false
    }
  ];

  const handleStepComplete = () => {
    if (!completedSteps.includes(currentStep)) {
      const newCompletedSteps = [...completedSteps, currentStep];
      setCompletedSteps(newCompletedSteps);
      setTotalPoints(prev => prev + tutorialSteps[currentStep].points);
    }
  };

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      handleStepComplete();
      setCurrentStep(prev => prev + 1);
    } else {
      handleTutorialComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleTutorialComplete = () => {
    const achievements = [
      "Tutorial Master",
      "First Steps",
      "Knowledge Seeker",
      "Web3 Explorer"
    ];
    const finalPoints = totalPoints + tutorialSteps[currentStep].points;
    onTutorialComplete(achievements, finalPoints);
    onClose();
  };

  const progress = ((completedSteps.length + (completedSteps.includes(currentStep) ? 0 : 1)) / tutorialSteps.length) * 100;

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl border border-white/20"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Tutorial</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-4 py-2">
            <div className="flex items-center justify-between text-sm text-white/70 mb-2">
              <span>Step {currentStep + 1} of {tutorialSteps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <motion.div
              key={currentStep}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Visual Guide */}
              {tutorialSteps[currentStep].visualGuide && (
                <div className="text-center">
                  <div className="text-6xl mb-2">
                    {tutorialSteps[currentStep].visualGuide}
                  </div>
                </div>
              )}

              {/* Title and Description */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {tutorialSteps[currentStep].title}
                </h3>
                <p className="text-white/70 text-lg">
                  {tutorialSteps[currentStep].description}
                </p>
              </div>

              {/* Instructions */}
              <div className="space-y-3">
                {tutorialSteps[currentStep].instructions.map((instruction, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-3 p-3 bg-white/10 rounded-lg border border-white/20"
                  >
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm font-bold">{index + 1}</span>
                    </div>
                    <p className="text-white/90 text-sm leading-relaxed">{instruction}</p>
                  </motion.div>
                ))}
              </div>

              {/* Interactive Demo */}
              {tutorialSteps[currentStep].interactive && (
                <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-4 border border-green-500/30">
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-white mb-3">Try It Out!</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                        <ArrowUp className="w-6 h-6 text-white mx-auto" />
                      </button>
                      <button className="p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                        <ArrowDown className="w-6 h-6 text-white mx-auto" />
                      </button>
                      <button className="p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                        <ArrowLeft className="w-6 h-6 text-white mx-auto" />
                      </button>
                      <button className="p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                        <ArrowRight className="w-6 h-6 text-white mx-auto" />
                      </button>
                    </div>
                    <p className="text-white/70 text-sm mt-2">Tap the buttons above to test controls</p>
                  </div>
                </div>
              )}

              {/* Points Display */}
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-3 border border-yellow-500/30">
                <div className="flex items-center justify-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-semibold">
                    +{tutorialSteps[currentStep].points} Points
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-white/20">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
              <span className="text-white text-sm">Previous</span>
            </button>

            <div className="flex items-center space-x-2">
              {completedSteps.map((step, index) => (
                <CheckCircle key={index} className="w-5 h-5 text-green-400" />
              ))}
              <span className="text-white/70 text-sm">
                {completedSteps.length} completed
              </span>
            </div>

            <button
              onClick={handleNext}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 transition-all"
            >
              <span className="text-white text-sm">
                {currentStep === tutorialSteps.length - 1 ? 'Complete' : 'Next'}
              </span>
              {currentStep === tutorialSteps.length - 1 ? (
                <Trophy className="w-4 h-4 text-white" />
              ) : (
                <ChevronRight className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MobileTutorialManager;





