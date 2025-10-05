import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface TouchControlsProps {
  onMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onSpecialAbility: (ability: 'dash' | 'timeFreeze' | 'megaCollect') => void;
  onJump: () => void;
  onSlide: () => void;
  isVisible: boolean;
  abilities: {
    dash: { cooldown: number; maxCooldown: number };
    timeFreeze: { cooldown: number; maxCooldown: number };
    megaCollect: { cooldown: number; maxCooldown: number };
  };
}

const TouchControls: React.FC<TouchControlsProps> = ({
  onMove,
  onSpecialAbility,
  onJump,
  onSlide,
  isVisible,
  abilities
}) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  // Minimum distance for swipe detection
  const minSwipeDistance = 50;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setTouchEnd(null);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchEnd({ x: touch.clientX, y: touch.clientY });
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance < minSwipeDistance) {
      // Tap detected
      onJump();
      return;
    }

    // Determine swipe direction
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (absDeltaX > absDeltaY) {
      // Horizontal swipe
      if (deltaX > 0) {
        onMove('right');
      } else {
        onMove('left');
      }
    } else {
      // Vertical swipe
      if (deltaY > 0) {
        onMove('down');
        onSlide();
      } else {
        onMove('up');
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, onMove, onJump, onSlide]);

  const getAbilityCooldownPercentage = (cooldown: number, maxCooldown: number) => {
    return Math.max(0, (cooldown / maxCooldown) * 100);
  };

  const isAbilityReady = (cooldown: number) => cooldown === 0;

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Touch area for swipe gestures */}
      <div
        className="absolute inset-0 pointer-events-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* Movement Controls */}
      <div className="absolute bottom-4 left-4 pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black/50 backdrop-blur-sm rounded-full p-4 border border-white/20"
        >
          <div className="grid grid-cols-3 gap-2 w-32 h-32">
            {/* Top */}
            <div className="col-start-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="w-full h-full bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white text-lg font-bold"
                onClick={() => onMove('up')}
              >
                ↑
              </motion.button>
            </div>

            {/* Left */}
            <div className="col-start-1 row-start-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="w-full h-full bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white text-lg font-bold"
                onClick={() => onMove('left')}
              >
                ←
              </motion.button>
            </div>

            {/* Center - Jump */}
            <div className="col-start-2 row-start-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="w-full h-full bg-green-500/80 hover:bg-green-500 rounded-lg flex items-center justify-center text-white text-lg font-bold"
                onClick={onJump}
              >
                ⬆
              </motion.button>
            </div>

            {/* Right */}
            <div className="col-start-3 row-start-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="w-full h-full bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white text-lg font-bold"
                onClick={() => onMove('right')}
              >
                →
              </motion.button>
            </div>

            {/* Bottom - Slide */}
            <div className="col-start-2 row-start-3">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="w-full h-full bg-blue-500/80 hover:bg-blue-500 rounded-lg flex items-center justify-center text-white text-lg font-bold"
                onClick={onSlide}
              >
                ⬇
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Special Abilities */}
      <div className="absolute bottom-4 right-4 pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-white/20 space-y-2"
        >
          {/* Dash Ability */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            disabled={!isAbilityReady(abilities.dash.cooldown)}
            className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
              isAbilityReady(abilities.dash.cooldown)
                ? 'bg-purple-500 hover:bg-purple-600'
                : 'bg-gray-500 cursor-not-allowed'
            }`}
            onClick={() => onSpecialAbility('dash')}
          >
            <div className="relative">
              <span>Q</span>
              {!isAbilityReady(abilities.dash.cooldown) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </motion.button>

          {/* Time Freeze Ability */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            disabled={!isAbilityReady(abilities.timeFreeze.cooldown)}
            className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
              isAbilityReady(abilities.timeFreeze.cooldown)
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-gray-500 cursor-not-allowed'
            }`}
            onClick={() => onSpecialAbility('timeFreeze')}
          >
            <div className="relative">
              <span>E</span>
              {!isAbilityReady(abilities.timeFreeze.cooldown) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </motion.button>

          {/* Mega Collect Ability */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            disabled={!isAbilityReady(abilities.megaCollect.cooldown)}
            className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
              isAbilityReady(abilities.megaCollect.cooldown)
                ? 'bg-orange-500 hover:bg-orange-600'
                : 'bg-gray-500 cursor-not-allowed'
            }`}
            onClick={() => onSpecialAbility('megaCollect')}
          >
            <div className="relative">
              <span>R</span>
              {!isAbilityReady(abilities.megaCollect.cooldown) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </motion.button>
        </motion.div>
      </div>

      {/* Instructions */}
      <div className="absolute top-4 left-4 pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-white/20 text-white text-xs max-w-xs"
        >
          <h3 className="font-bold mb-2">Touch Controls:</h3>
          <ul className="space-y-1">
            <li>• Swipe to move</li>
            <li>• Tap center to jump</li>
            <li>• Swipe down to slide</li>
            <li>• Use abilities on the right</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default TouchControls;
