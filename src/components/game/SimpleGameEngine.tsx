import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  gameMode: string;
  difficulty: string;
  currentLevel: number;
  score: number;
  lives: number;
  energy: number;
}

interface GameEngineProps {
  gameState: GameState;
  onScoreUpdate: (score: number) => void;
  onGameEnd: (score: number, achievements: string[]) => void;
  onLevelComplete: (level: number) => void;
  isPaused: boolean;
}

const GameEngine: React.FC<GameEngineProps> = ({ 
  gameState, 
  onScoreUpdate, 
  onGameEnd, 
  onLevelComplete,
  isPaused 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const [localScore, setLocalScore] = useState(0);
  const [playerY, setPlayerY] = useState(300);
  const [isJumping, setIsJumping] = useState(false);
  const [obstacles, setObstacles] = useState<Array<{id: number, x: number, y: number, width: number, height: number}>>([]);
  const [collectibles, setCollectibles] = useState<Array<{id: number, x: number, y: number, width: number, height: number, value: number}>>([]);

  const GRAVITY = 0.8;
  const JUMP_FORCE = -15;
  const GROUND_Y = 300;
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 400;

  const handleJump = useCallback(() => {
    if (!isJumping && gameState.isPlaying && !isPaused) {
      setIsJumping(true);
      setPlayerY(prev => prev + JUMP_FORCE);
    }
  }, [isJumping, gameState.isPlaying, isPaused]);

  const startGame = useCallback(() => {
    setLocalScore(0);
    setPlayerY(GROUND_Y);
    setIsJumping(false);
    setObstacles([]);
    setCollectibles([]);
  }, []);

  const endGame = useCallback(() => {
    const achievements = [];
    if (localScore > 1000) achievements.push('High Scorer');
    if (localScore > 5000) achievements.push('Master Player');
    if (localScore > 10000) achievements.push('Legend');
    
    onGameEnd(localScore, achievements);
  }, [localScore, onGameEnd]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && gameState.isPlaying && !isPaused) {
        e.preventDefault();
        handleJump();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleJump, gameState.isPlaying, isPaused]);

  // Game physics
  useEffect(() => {
    if (!gameState.isPlaying || isPaused) return;

    const interval = setInterval(() => {
      // Update score
      setLocalScore(prev => {
        const newScore = prev + 1;
        onScoreUpdate(newScore);
        return newScore;
      });

      // Player physics
      if (isJumping) {
        setPlayerY(prev => {
          const newY = prev + GRAVITY;
          if (newY >= GROUND_Y) {
            setIsJumping(false);
            return GROUND_Y;
          }
          return newY;
        });
      }

      // Move obstacles
      setObstacles(prev => prev.map(obs => ({
        ...obs,
        x: obs.x - 3
      })).filter(obs => obs.x > -50));

      // Move collectibles
      setCollectibles(prev => prev.map(col => ({
        ...col,
        x: col.x - 3
      })).filter(col => col.x > -50));

      // Generate new obstacles
      if (Math.random() < 0.02) {
        setObstacles(prev => [...prev, {
          id: Date.now(),
          x: CANVAS_WIDTH,
          y: GROUND_Y - 20,
          width: 30,
          height: 20
        }]);
      }

      // Generate collectibles
      if (Math.random() < 0.01) {
        setCollectibles(prev => [...prev, {
          id: Date.now(),
          x: CANVAS_WIDTH,
          y: GROUND_Y - 30,
          width: 20,
          height: 20,
          value: 10
        }]);
      }

    }, 50);

    return () => clearInterval(interval);
  }, [gameState.isPlaying, isPaused, isJumping, onScoreUpdate]);

  // Render game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw ground
    ctx.fillStyle = '#16213e';
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);

    // Draw player
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(100, playerY, 40, 60);

    // Draw obstacles
    obstacles.forEach(obstacle => {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Draw collectibles
    collectibles.forEach(collectible => {
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(collectible.x + collectible.width/2, collectible.y + collectible.height/2, collectible.width/2, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw UI
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${localScore}`, 20, 30);
    ctx.fillText(`Level: ${gameState.currentLevel}`, 20, 60);
    ctx.fillText(`Lives: ${gameState.lives}`, 20, 90);

    if (isPaused) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = '#ffffff';
      ctx.font = '40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.textAlign = 'left';
    }
  }, [localScore, playerY, obstacles, collectibles, gameState.currentLevel, gameState.lives, isPaused]);

  // Start game when component mounts
  useEffect(() => {
    if (gameState.isPlaying) {
      startGame();
    }
  }, [gameState.isPlaying, startGame]);

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      {/* Game Canvas */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-2 border-white rounded-lg shadow-2xl"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
        
        {/* Game Overlay */}
        {!gameState.isPlaying && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-4">Avalanche Rush</h2>
              <p className="text-white/80 mb-6">Press SPACE to jump, avoid obstacles!</p>
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300"
              >
                Start Game
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Controls */}
      <div className="flex items-center space-x-4 text-white/80 text-sm">
        <div className="flex items-center space-x-2">
          <kbd className="px-2 py-1 bg-white/20 rounded text-xs">SPACE</kbd>
          <span>Jump</span>
        </div>
        <div className="flex items-center space-x-2">
          <kbd className="px-2 py-1 bg-white/20 rounded text-xs">P</kbd>
          <span>Pause</span>
        </div>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-white/10 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{localScore}</div>
          <div className="text-white/70 text-sm">Score</div>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{gameState.currentLevel}</div>
          <div className="text-white/70 text-sm">Level</div>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{gameState.lives}</div>
          <div className="text-white/70 text-sm">Lives</div>
        </div>
      </div>
    </div>
  );
};

export default GameEngine;
