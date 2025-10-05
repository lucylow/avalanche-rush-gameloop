import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ParticleEffectProps {
  x: number;
  y: number;
  color: string;
  count?: number;
  duration?: number;
}

export const ParticleEffect: React.FC<ParticleEffectProps> = ({ 
  x, y, color, count = 15, duration = 1000 
}) => {
  const [particles, setParticles] = useState<Array<{id: number; x: number; y: number; vx: number; vy: number; life: number; size: number}>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      life: 1,
      maxLife: 1,
      size: Math.random() * 4 + 2
    }));

    setParticles(newParticles);

    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        life: Math.max(0, p.life - 0.02),
        vx: p.vx * 0.95,
        vy: p.vy * 0.95
      })).filter(p => p.life > 0));
    }, 16);

    setTimeout(() => clearInterval(interval), duration);

    return () => clearInterval(interval);
  }, [x, y, count, duration]);

  return (
    <div className="absolute pointer-events-none">
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            initial={{ opacity: 1, scale: 1 }}
            animate={{ 
              opacity: particle.life,
              scale: particle.life,
              x: particle.x,
              y: particle.y
            }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute w-1 h-1 rounded-full"
            style={{
              backgroundColor: color,
              left: 0,
              top: 0,
              width: particle.size,
              height: particle.size
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface ScorePopupProps {
  score: number;
  x: number;
  y: number;
  color?: string;
}

export const ScorePopup: React.FC<ScorePopupProps> = ({ 
  score, x, y, color = '#F59E0B' 
}) => {
  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        scale: 0.5, 
        x: x, 
        y: y,
        rotate: -10
      }}
      animate={{ 
        opacity: [0, 1, 1, 0],
        scale: [0.5, 1.2, 1, 0.8],
        y: y - 100,
        rotate: [10, 0, -10]
      }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ 
        duration: 1.5,
        ease: "easeOut"
      }}
      className="absolute pointer-events-none z-50"
      style={{ left: x, top: y }}
    >
      <div 
        className="text-2xl font-black text-white px-4 py-2 rounded-lg shadow-2xl"
        style={{
          background: `linear-gradient(45deg, ${color}, ${color}dd)`,
          textShadow: '0 0 10px rgba(0,0,0,0.5)'
        }}
      >
        +{score}
      </div>
    </motion.div>
  );
};

interface GlowEffectProps {
  children: React.ReactNode;
  color?: string;
  intensity?: 'low' | 'medium' | 'high';
}

export const GlowEffect: React.FC<GlowEffectProps> = ({ 
  children, color = '#3B82F6', intensity = 'medium' 
}) => {
  const intensityMap = {
    low: '0 0 10px',
    medium: '0 0 20px',
    high: '0 0 40px'
  };

  return (
    <div 
      className="inline-block"
      style={{
        filter: `${intensityMap[intensity]} ${color}`,
        boxShadow: `${intensityMap[intensity]} ${color}40`
      }}
    >
      {children}
    </div>
  );
};

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', color = '#3B82F6', text 
}) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <div 
        className={`${sizeMap[size]} border-4 border-gray-300 border-t-transparent rounded-full animate-spin`}
        style={{ borderTopColor: color }}
      />
      {text && (
        <motion.p 
          className="text-white font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  animated?: boolean;
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  value, max, color = '#10B981', animated = true, showPercentage = true 
}) => {
  const percentage = (value / max) * 100;

  return (
    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
      <motion.div
        className="h-full rounded-full relative"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: animated ? 0.5 : 0 }}
      >
        {animated && (
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            style={{
              animation: 'shimmer 2s infinite'
            }}
          />
        )}
      </motion.div>
      {showPercentage && (
        <div className="text-white text-xs font-bold mt-1 text-center">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
};

interface FloatingActionProps {
  children: React.ReactNode;
  delay?: number;
}

export const FloatingAction: React.FC<FloatingActionProps> = ({ 
  children, delay = 0 
}) => {
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ 
        y: [-5, 5, -5],
        rotate: [-1, 1, -1]
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        delay: delay,
        ease: "easeInOut"
      }}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
};

// Add shimmer animation to global CSS
const shimmerKeyframes = `
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
`;

// Inject styles if not already present
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = shimmerKeyframes;
  if (!document.head.querySelector('style[data-shimmer]')) {
    style.setAttribute('data-shimmer', 'true');
    document.head.appendChild(style);
  }
}

export default {
  ParticleEffect,
  ScorePopup,
  GlowEffect,
  LoadingSpinner,
  ProgressBar,
  FloatingAction
};
