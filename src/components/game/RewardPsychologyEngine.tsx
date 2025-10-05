import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Reward {
  id: string;
  type: 'points' | 'achievement' | 'level' | 'streak' | 'nft';
  amount?: number;
  message: string;
  icon: string;
  color: string;
  timestamp: number;
}

interface RewardConfig {
  type: string;
  message: string;
  icon: string;
  color: string;
  duration?: number;
  animation?: string;
}

const RewardPsychologyEngine: React.FC = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isActive, setIsActive] = useState(true);

  const rewardConfigs: Record<string, RewardConfig> = {
    // Game Events
    gameStart: {
      type: 'achievement',
      message: 'Game Started!',
      icon: '🚀',
      color: 'from-green-500 to-green-600',
      duration: 3000
    },
    gameComplete: {
      type: 'achievement',
      message: 'Game Completed!',
      icon: '🎉',
      color: 'from-purple-500 to-purple-600',
      duration: 4000
    },
    highScoreBeat: {
      type: 'achievement',
      message: 'New High Score!',
      icon: '🏆',
      color: 'from-yellow-500 to-orange-500',
      duration: 5000
    },
    
    // Points Events
    '100Points': {
      type: 'points',
      message: '+100 Points!',
      icon: '💯',
      color: 'from-blue-500 to-blue-600',
      duration: 2000
    },
    '500Points': {
      type: 'points',
      message: '+500 Points!',
      icon: '🔥',
      color: 'from-red-500 to-red-600',
      duration: 2500
    },
    '1000Points': {
      type: 'points',
      message: '+1000 Points!',
      icon: '💎',
      color: 'from-purple-500 to-purple-600',
      duration: 3000
    },
    
    // Level Events
    levelUp: {
      type: 'level',
      message: 'Level Up!',
      icon: '⬆️',
      color: 'from-indigo-500 to-indigo-600',
      duration: 4000
    },
    
    // Streak Events
    dailyLogin: {
      type: 'streak',
      message: 'Daily Login!',
      icon: '📅',
      color: 'from-green-500 to-green-600',
      duration: 3000
    },
    streakBonus: {
      type: 'streak',
      message: 'Streak Bonus!',
      icon: '⚡',
      color: 'from-yellow-500 to-yellow-600',
      duration: 3500
    },
    
    // Quest Events
    questComplete: {
      type: 'achievement',
      message: 'Quest Complete!',
      icon: '✅',
      color: 'from-emerald-500 to-emerald-600',
      duration: 4000
    },
    
    // NFT Events
    nftEarned: {
      type: 'nft',
      message: 'NFT Earned!',
      icon: '🎨',
      color: 'from-pink-500 to-pink-600',
      duration: 5000
    },
    rareNFT: {
      type: 'nft',
      message: 'Rare NFT!',
      icon: '💎',
      color: 'from-cyan-500 to-cyan-600',
      duration: 6000
    },
    
    // Special Events
    comboBonus: {
      type: 'points',
      message: 'Combo Bonus!',
      icon: '🔥',
      color: 'from-orange-500 to-red-500',
      duration: 2500
    },
    perfectScore: {
      type: 'achievement',
      message: 'Perfect Score!',
      icon: '✨',
      color: 'from-yellow-400 to-yellow-500',
      duration: 5000
    }
  };

  const triggerReward = useCallback((eventType: string, data?: any) => {
    if (!isActive) return;

    const config = rewardConfigs[eventType];
    if (!config) {
      console.warn(`Unknown reward event: ${eventType}`);
      return;
    }

    const reward: Reward = {
      id: `${eventType}_${Date.now()}_${Math.random()}`,
      type: config.type as any,
      amount: data?.amount || data?.score || undefined,
      message: config.message,
      icon: config.icon,
      color: config.color,
      timestamp: Date.now()
    };

    setRewards(prev => [...prev, reward]);

    // Auto-remove reward after duration
    setTimeout(() => {
      setRewards(prev => prev.filter(r => r.id !== reward.id));
    }, config.duration || 3000);
  }, [isActive]);

  // Expose triggerReward globally
  useEffect(() => {
    (window as any).triggerReward = triggerReward;
    
    return () => {
      delete (window as any).triggerReward;
    };
  }, [triggerReward]);

  const getRewardPosition = (index: number) => {
    const positions = [
      { top: '20%', left: '50%', transform: 'translateX(-50%)' },
      { top: '30%', left: '45%', transform: 'translateX(-50%)' },
      { top: '40%', left: '55%', transform: 'translateX(-50%)' },
      { top: '25%', left: '40%', transform: 'translateX(-50%)' },
      { top: '35%', left: '60%', transform: 'translateX(-50%)' }
    ];
    
    return positions[index % positions.length];
  };

  const getRewardAnimation = (type: string) => {
    switch (type) {
      case 'points':
        return {
          initial: { scale: 0, opacity: 0, y: 50 },
          animate: { scale: 1, opacity: 1, y: 0 },
          exit: { scale: 0, opacity: 0, y: -50 }
        };
      case 'achievement':
        return {
          initial: { scale: 0, opacity: 0, rotate: -180 },
          animate: { scale: 1, opacity: 1, rotate: 0 },
          exit: { scale: 0, opacity: 0, rotate: 180 }
        };
      case 'level':
        return {
          initial: { scale: 0, opacity: 0, y: 100 },
          animate: { scale: 1.1, opacity: 1, y: 0 },
          exit: { scale: 0, opacity: 0, y: -100 }
        };
      case 'streak':
        return {
          initial: { scale: 0, opacity: 0, x: -100 },
          animate: { scale: 1, opacity: 1, x: 0 },
          exit: { scale: 0, opacity: 0, x: 100 }
        };
      case 'nft':
        return {
          initial: { scale: 0, opacity: 0, rotate: 0 },
          animate: { scale: 1.2, opacity: 1, rotate: 360 },
          exit: { scale: 0, opacity: 0, rotate: -360 }
        };
      default:
        return {
          initial: { scale: 0, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 0, opacity: 0 }
        };
    }
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {rewards.map((reward, index) => {
          const position = getRewardPosition(index);
          const animation = getRewardAnimation(reward.type);
          
          return (
            <motion.div
              key={reward.id}
              initial={animation.initial}
              animate={animation.animate}
              exit={animation.exit}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20
              }}
              className="absolute"
              style={position}
            >
              <motion.div
                className={`
                  bg-gradient-to-br ${reward.color} 
                  text-white font-bold px-8 py-6 rounded-2xl shadow-2xl
                  backdrop-blur-md border border-white/30
                  flex items-center space-x-4
                  min-w-[250px] justify-center
                  relative overflow-hidden
                `}
                whileHover={{ scale: 1.05 }}
                animate={{
                  boxShadow: [
                    '0 0 0px rgba(255,255,255,0.4)',
                    '0 0 30px rgba(255,255,255,0.8)',
                    '0 0 0px rgba(255,255,255,0.4)'
                  ]
                }}
                transition={{
                  boxShadow: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full animate-pulse"></div>
                
                {/* Sparkle effects */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full"
                      initial={{
                        x: Math.random() * 250,
                        y: Math.random() * 60,
                        opacity: 0
                      }}
                      animate={{
                        x: Math.random() * 250,
                        y: Math.random() * 60,
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.2,
                        repeat: Infinity
                      }}
                    />
                  ))}
                </div>
                <motion.span
                  className="text-2xl"
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                >
                  {reward.icon}
                </motion.span>
                
                <div className="text-center">
                  <div className="text-lg font-bold">
                    {reward.message}
                  </div>
                  {reward.amount && (
                    <div className="text-sm opacity-90">
                      {reward.amount.toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Floating particles effect */}
                <div className="absolute inset-0 overflow-hidden rounded-xl">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full"
                      initial={{
                        x: Math.random() * 200 - 100,
                        y: Math.random() * 100 - 50,
                        opacity: 0
                      }}
                      animate={{
                        x: Math.random() * 200 - 100,
                        y: Math.random() * 100 - 50,
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.2,
                        repeat: Infinity
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default RewardPsychologyEngine;