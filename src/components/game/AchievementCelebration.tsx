import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  points: number;
  unlockedAt: Date;
}

interface AchievementCelebrationProps {
  achievement: Achievement | null;
  onClose: () => void;
}

const AchievementCelebration: React.FC<AchievementCelebrationProps> = ({ achievement, onClose }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; vx: number; vy: number; color: string; life: number }>>([]);

  useEffect(() => {
    if (achievement) {
      setShowConfetti(true);
      generateConfetti();
      
      // Auto-close after 4 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  const generateConfetti = () => {
    const newParticles = [];
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
    
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -10,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1
      });
    }
    
    setParticles(newParticles);
  };

  const updateParticles = () => {
    setParticles(prev => prev.map(particle => ({
      ...particle,
      x: particle.x + particle.vx,
      y: particle.y + particle.vy,
      vy: particle.vy + 0.1, // gravity
      life: particle.life - 0.02
    })).filter(particle => particle.life > 0 && particle.y < window.innerHeight + 50));
  };

  useEffect(() => {
    if (showConfetti) {
      const interval = setInterval(updateParticles, 16);
      return () => clearInterval(interval);
    }
  }, [showConfetti]);

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return '#9ca3af';
      case 'rare': return '#3b82f6';
      case 'epic': return '#8b5cf6';
      case 'legendary': return '#f59e0b';
      case 'mythic': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getRarityGlow = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'shadow-gray-500';
      case 'rare': return 'shadow-blue-500';
      case 'epic': return 'shadow-purple-500';
      case 'legendary': return 'shadow-yellow-500';
      case 'mythic': return 'shadow-red-500';
      default: return 'shadow-gray-500';
    }
  };

  if (!achievement) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      >
        {/* Confetti Particles */}
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: particle.x,
              top: particle.y,
              backgroundColor: particle.color,
              opacity: particle.life
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 0]
            }}
            transition={{
              duration: 3,
              ease: "easeOut"
            }}
          />
        ))}

        {/* Achievement Card */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15
          }}
          className="bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 rounded-2xl p-8 max-w-md mx-4 border-2 border-purple-400 shadow-2xl pointer-events-auto"
          style={{
            borderColor: getRarityColor(achievement.rarity),
            boxShadow: `0 0 30px ${getRarityColor(achievement.rarity)}50`
          }}
        >
          {/* Achievement Icon */}
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-center mb-6"
          >
            <div className="text-6xl mb-2">{achievement.icon}</div>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-2xl font-bold text-white"
              style={{ color: getRarityColor(achievement.rarity) }}
            >
              {achievement.rarity.toUpperCase()} ACHIEVEMENT!
            </motion.div>
          </motion.div>

          {/* Achievement Details */}
          <div className="text-center mb-6">
            <motion.h3
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-white mb-2"
            >
              {achievement.title}
            </motion.h3>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-300 mb-4"
            >
              {achievement.description}
            </motion.p>
            
            {/* Points Reward */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-2 px-4 rounded-lg inline-block"
            >
              +{achievement.points.toLocaleString()} Points!
            </motion.div>
          </div>

          {/* Close Button */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200"
          >
            Awesome! 🎉
          </motion.button>
        </motion.div>

        {/* Screen Flash Effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 bg-white pointer-events-none"
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default AchievementCelebration;
