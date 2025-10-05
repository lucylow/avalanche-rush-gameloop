import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MiniGameProps {
  isActive: boolean;
  type: 'bonus_round' | 'speed_challenge' | 'precision_test';
  onComplete: (score: number) => void;
  onClose: () => void;
}

const MiniGame: React.FC<MiniGameProps> = ({ isActive, type, onComplete, onClose }) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [targets, setTargets] = useState<Array<{ id: number; x: number; y: number; size: number; points: number; color: string }>>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  // Generate targets based on mini-game type
  const generateTargets = useCallback(() => {
    const newTargets = [];
    const targetCount = type === 'speed_challenge' ? 15 : type === 'precision_test' ? 8 : 12;
    
    for (let i = 0; i < targetCount; i++) {
      newTargets.push({
        id: i,
        x: Math.random() * 800 + 100,
        y: Math.random() * 400 + 100,
        size: type === 'precision_test' ? 20 : type === 'speed_challenge' ? 40 : 30,
        points: type === 'precision_test' ? 50 : type === 'speed_challenge' ? 25 : 30,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`
      });
    }
    
    setTargets(newTargets);
  }, [type]);

  // Handle target click
  const handleTargetClick = (targetId: number) => {
    setTargets(prev => prev.filter(target => target.id !== targetId));
    const target = targets.find(t => t.id === targetId);
    if (target) {
      setScore(prev => prev + target.points);
      
      // Add combo bonus
      const comboBonus = Math.floor(target.points * 0.1);
      setScore(prev => prev + comboBonus);
    }
  };

  // Start mini-game
  useEffect(() => {
    if (isActive) {
      setIsPlaying(true);
      setScore(0);
      setTimeLeft(30);
      generateTargets();
    }
  }, [isActive, generateTargets]);

  // Timer countdown
  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setIsPlaying(false);
      onComplete(score);
    }
  }, [isPlaying, timeLeft, score, onComplete]);

  // Auto-generate new targets for speed challenge
  useEffect(() => {
    if (type === 'speed_challenge' && isPlaying && targets.length < 5) {
      const timer = setTimeout(() => {
        generateTargets();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [type, isPlaying, targets.length, generateTargets]);

  if (!isActive) return null;

  const getTitle = () => {
    switch (type) {
      case 'bonus_round': return '🎯 Bonus Round';
      case 'speed_challenge': return '⚡ Speed Challenge';
      case 'precision_test': return '🎪 Precision Test';
      default: return '🎮 Mini Game';
    }
  };

  const getInstructions = () => {
    switch (type) {
      case 'bonus_round': return 'Click all targets to earn bonus points!';
      case 'speed_challenge': return 'Click targets as fast as possible! New targets keep appearing!';
      case 'precision_test': return 'Click the small targets carefully for maximum points!';
      default: return 'Click targets to score points!';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-2xl p-8 max-w-4xl w-full mx-4 border-2 border-purple-400"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <motion.h2
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-4xl font-bold text-white mb-2"
            >
              {getTitle()}
            </motion.h2>
            <p className="text-lg text-gray-300 mb-4">{getInstructions()}</p>
            
            {/* Score and Timer */}
            <div className="flex justify-between items-center bg-black/30 rounded-lg p-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">Score</div>
                <div className="text-3xl font-bold text-white">{score.toLocaleString()}</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">Time</div>
                <motion.div
                  key={timeLeft}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-3xl font-bold text-white"
                >
                  {timeLeft}s
                </motion.div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">Targets</div>
                <div className="text-3xl font-bold text-white">{targets.length}</div>
              </div>
            </div>
          </div>

          {/* Game Area */}
          <div className="relative bg-black/20 rounded-lg h-96 overflow-hidden border border-purple-400/30">
            {targets.map((target) => (
              <motion.div
                key={target.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleTargetClick(target.id)}
                className="absolute cursor-pointer rounded-full shadow-lg border-2 border-white/50"
                style={{
                  left: target.x,
                  top: target.y,
                  width: target.size,
                  height: target.size,
                  backgroundColor: target.color,
                  boxShadow: `0 0 20px ${target.color}`
                }}
              >
                <div className="flex items-center justify-center h-full text-white font-bold text-sm">
                  {target.points}
                </div>
              </motion.div>
            ))}
            
            {/* Background effects */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    x: [0, 100, 0],
                    y: [0, 100, 0],
                    opacity: [0.3, 0.8, 0.3]
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                  className="absolute w-2 h-2 bg-purple-400 rounded-full"
                  style={{
                    left: Math.random() * 100 + '%',
                    top: Math.random() * 100 + '%'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6 text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Exit Mini Game
            </motion.button>
          </div>

          {/* Completion Message */}
          {!isPlaying && timeLeft === 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-2xl"
            >
              <div className="text-center text-white">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="text-6xl mb-4"
                >
                  🎉
                </motion.div>
                <h3 className="text-3xl font-bold mb-2">Mini Game Complete!</h3>
                <p className="text-xl mb-4">Final Score: {score.toLocaleString()}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Continue Game
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MiniGame;
