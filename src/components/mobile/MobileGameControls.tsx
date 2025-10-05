import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Settings
} from 'lucide-react';

interface MobileGameControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  onJump: () => void;
  onDuck: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onVolumeToggle: () => void;
  isMuted: boolean;
  onSettings: () => void;
  gameScore: number;
  lives: number;
  level: number;
}

const MobileGameControls: React.FC<MobileGameControlsProps> = ({
  isPlaying,
  isPaused,
  onJump,
  onDuck,
  onMoveLeft,
  onMoveRight,
  onPause,
  onResume,
  onStop,
  onVolumeToggle,
  isMuted,
  onSettings,
  gameScore,
  lives,
  level
}) => {
  const [showControls, setShowControls] = useState(true);
  const [touchStart, setTouchStart] = useState<{ [key: string]: boolean }>({});

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    if (!isPlaying) return;
    
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isPlaying, showControls]);

  const handleTouchStart = (action: string, handler: () => void) => {
    setTouchStart(prev => ({ ...prev, [action]: true }));
    handler();
    setShowControls(true);
  };

  const handleTouchEnd = (action: string) => {
    setTouchStart(prev => ({ ...prev, [action]: false }));
  };

  if (!isPlaying) return null;

  return (
    <AnimatePresence>
      {showControls && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-white/20 z-50"
        >
          {/* Game Stats Bar */}
          <div className="flex justify-between items-center px-4 py-2 bg-gradient-to-r from-blue-600/50 to-purple-600/50">
            <div className="flex items-center space-x-4 text-white">
              <div className="text-sm">
                <span className="font-bold">Score: {gameScore.toLocaleString()}</span>
              </div>
              <div className="text-sm">
                <span className="font-bold">Level: {level}</span>
              </div>
              <div className="text-sm">
                <span className="font-bold">Lives: {lives}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onVolumeToggle}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
              </button>
              <button
                onClick={onSettings}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <Settings className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex justify-between items-center px-4 py-4">
            {/* Left Side Controls */}
            <div className="flex space-x-3">
              {/* Movement Controls */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onTouchStart={() => handleTouchStart('up', onJump)}
                  onTouchEnd={() => handleTouchEnd('up')}
                  onMouseDown={() => handleTouchStart('up', onJump)}
                  onMouseUp={() => handleTouchEnd('up')}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-150 ${
                    touchStart.up 
                      ? 'bg-green-500 scale-95' 
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  <ArrowUp className="w-6 h-6 text-white" />
                </button>
                <button
                  onTouchStart={() => handleTouchStart('down', onDuck)}
                  onTouchEnd={() => handleTouchEnd('down')}
                  onMouseDown={() => handleTouchStart('down', onDuck)}
                  onMouseUp={() => handleTouchEnd('down')}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-150 ${
                    touchStart.down 
                      ? 'bg-green-500 scale-95' 
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  <ArrowDown className="w-6 h-6 text-white" />
                </button>
                <button
                  onTouchStart={() => handleTouchStart('left', onMoveLeft)}
                  onTouchEnd={() => handleTouchEnd('left')}
                  onMouseDown={() => handleTouchStart('left', onMoveLeft)}
                  onMouseUp={() => handleTouchEnd('left')}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-150 ${
                    touchStart.left 
                      ? 'bg-blue-500 scale-95' 
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  <ArrowLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onTouchStart={() => handleTouchStart('right', onMoveRight)}
                  onTouchEnd={() => handleTouchEnd('right')}
                  onMouseDown={() => handleTouchStart('right', onMoveRight)}
                  onMouseUp={() => handleTouchEnd('right')}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-150 ${
                    touchStart.right 
                      ? 'bg-blue-500 scale-95' 
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  <ArrowRight className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Right Side Controls */}
            <div className="flex space-x-3">
              {/* Game Control Buttons */}
              <button
                onClick={isPaused ? onResume : onPause}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 flex items-center justify-center shadow-lg transition-all duration-200 active:scale-95"
              >
                {isPaused ? (
                  <Play className="w-7 h-7 text-white" />
                ) : (
                  <Pause className="w-7 h-7 text-white" />
                )}
              </button>
              
              <button
                onClick={onStop}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 flex items-center justify-center shadow-lg transition-all duration-200 active:scale-95"
              >
                <Square className="w-7 h-7 text-white" />
              </button>
            </div>
          </div>

          {/* Special Ability Buttons */}
          <div className="flex justify-center space-x-2 px-4 pb-2">
            <button
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
            >
              Q - Dash
            </button>
            <button
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
            >
              E - Freeze
            </button>
            <button
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
            >
              R - Mega
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileGameControls;





