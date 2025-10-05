import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useSmartContracts } from '../../hooks/useSmartContracts';

interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  score: number;
  level: number;
  lives: number;
  speed: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  mode: 'classic' | 'tutorial' | 'challenge' | 'quest' | 'speedrun' | 'survival';
  achievements: string[];
  skillPoints: { [key: string]: number };
}

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  type: 'player' | 'obstacle' | 'collectible' | 'powerup' | 'enemy';
  color: string;
  active: boolean;
  value?: number;
  effect?: string;
  animation?: number;
}

interface GameEngineProps {
  gameState: GameState;
  onScoreUpdate: (score: number) => void;
  onGameEnd: (score: number, achievements?: string[]) => void;
  onLevelComplete: (level: number) => void;
  isPaused: boolean;
}

export interface GameEngineRef {
  startGame: () => void;
  endGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
}

const EnhancedGameEngine = forwardRef<GameEngineRef, GameEngineProps>(({
  gameState,
  onScoreUpdate,
  onGameEnd,
  onLevelComplete,
  isPaused
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const { isConnected, startGameSession, completeGameSession } = useSmartContracts();
  
  const [gameObjects, setGameObjects] = useState<GameObject[]>([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [particles, setParticles] = useState<any[]>([]);

  // Game configuration
  const CANVAS_WIDTH = 1200;
  const CANVAS_HEIGHT = 800;
  const PLAYER_SIZE = 40;
  const OBSTACLE_SPAWN_RATE = 0.02;
  const COLLECTIBLE_SPAWN_RATE = 0.01;
  const POWERUP_SPAWN_RATE = 0.005;

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    startGame: () => {
      initializeGame();
      gameLoop();
    },
    endGame: () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      onGameEnd(currentScore, gameState.achievements);
    },
    pauseGame: () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    },
    resumeGame: () => {
      if (gameState.isPlaying && !isPaused) {
        gameLoop();
      }
    }
  }));

  // Initialize game objects
  const initializeGame = useCallback(() => {
    const player: GameObject = {
      x: 100,
      y: CANVAS_HEIGHT / 2,
      width: PLAYER_SIZE,
      height: PLAYER_SIZE,
      vx: 0,
      vy: 0,
      type: 'player',
      color: '#4F46E5',
      active: true,
      animation: 0
    };

    setGameObjects([player]);
    setCurrentScore(0);
    setParticles([]);
  }, []);

  // Create particle effect
  const createParticles = (x: number, y: number, color: string, count: number = 10) => {
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 60,
        maxLife: 60,
        color,
        size: Math.random() * 4 + 2
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  // Enhanced game loop
  const gameLoop = useCallback(() => {
    if (!gameState.isPlaying || isPaused) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Update game objects
    updateGameObjects();
    
    // Spawn new objects
    spawnObjects();
    
    // Check collisions
    checkCollisions();
    
    // Update particles
    updateParticles();
    
    // Render frame
    render(ctx);
    
    // Check game over conditions
    if (gameState.lives <= 0) {
      onGameEnd(currentScore);
      return;
    }

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, gameObjects, currentScore, isPaused]);

  const updateGameObjects = () => {
    setGameObjects(prev => prev.map(obj => {
      if (!obj.active) return obj;

      // Update positions
      const newObj = { ...obj };
      newObj.x += newObj.vx * gameState.speed;
      newObj.y += newObj.vy;
      newObj.animation = (newObj.animation || 0) + 0.1;

      // Remove objects that are off-screen
      if (newObj.x < -newObj.width || newObj.x > CANVAS_WIDTH + newObj.width) {
        newObj.active = false;
      }

      // Keep player within bounds
      if (newObj.type === 'player') {
        newObj.y = Math.max(0, Math.min(CANVAS_HEIGHT - newObj.height, newObj.y));
      }

      return newObj;
    }).filter(obj => obj.active));
  };

  const spawnObjects = () => {
    // Spawn obstacles
    if (Math.random() < OBSTACLE_SPAWN_RATE * gameState.level) {
      const obstacle: GameObject = {
        x: CANVAS_WIDTH,
        y: Math.random() * (CANVAS_HEIGHT - 40),
        width: 30 + Math.random() * 20,
        height: 30 + Math.random() * 20,
        vx: -gameState.speed,
        vy: 0,
        type: 'obstacle',
        color: '#EF4444',
        active: true,
        animation: 0
      };
      setGameObjects(prev => [...prev, obstacle]);
    }

    // Spawn collectibles
    if (Math.random() < COLLECTIBLE_SPAWN_RATE) {
      const collectible: GameObject = {
        x: CANVAS_WIDTH,
        y: Math.random() * (CANVAS_HEIGHT - 20),
        width: 20,
        height: 20,
        vx: -gameState.speed * 0.8,
        vy: 0,
        type: 'collectible',
        color: '#F59E0B',
        active: true,
        value: 100,
        animation: 0
      };
      setGameObjects(prev => [...prev, collectible]);
    }

    // Spawn power-ups
    if (Math.random() < POWERUP_SPAWN_RATE) {
      const powerup: GameObject = {
        x: CANVAS_WIDTH,
        y: Math.random() * (CANVAS_HEIGHT - 25),
        width: 25,
        height: 25,
        vx: -gameState.speed * 0.6,
        vy: 0,
        type: 'powerup',
        color: '#10B981',
        active: true,
        effect: 'shield',
        animation: 0
      };
      setGameObjects(prev => [...prev, powerup]);
    }
  };

  const checkCollisions = () => {
    const player = gameObjects.find(obj => obj.type === 'player');
    if (!player) return;

    gameObjects.forEach(obj => {
      if (obj === player || !obj.active) return;

      // Simple AABB collision detection
      if (player.x < obj.x + obj.width &&
          player.x + player.width > obj.x &&
          player.y < obj.y + obj.height &&
          player.y + player.height > obj.y) {
        
        handleCollision(player, obj);
      }
    });
  };

  const handleCollision = (player: GameObject, obj: GameObject) => {
    switch (obj.type) {
      case 'obstacle':
        // Handle obstacle collision (reduce lives)
        createParticles(player.x + player.width/2, player.y + player.height/2, '#EF4444', 15);
        obj.active = false;
        break;
      
      case 'collectible': {
        const newScore = currentScore + (obj.value || 100);
        setCurrentScore(newScore);
        onScoreUpdate(newScore);
        createParticles(obj.x + obj.width/2, obj.y + obj.height/2, '#F59E0B', 8);
        obj.active = false;
        break;
      }
      
      case 'powerup':
        applyPowerup(obj.effect || 'shield');
        createParticles(obj.x + obj.width/2, obj.y + obj.height/2, '#10B981', 12);
        obj.active = false;
        break;
    }
  };

  const updateParticles = () => {
    setParticles(prev => prev.map(particle => ({
      ...particle,
      x: particle.x + particle.vx,
      y: particle.y + particle.vy,
      life: particle.life - 1,
      vx: particle.vx * 0.98,
      vy: particle.vy * 0.98
    })).filter(particle => particle.life > 0));
  };

  const applyPowerup = (effect: string) => {
    switch (effect) {
      case 'shield':
        // Temporary invincibility
        setTimeout(() => {
          // Remove shield effect
        }, 5000);
        break;
      case 'speed':
        setTimeout(() => {
          // Speed boost effect
        }, 10000);
        break;
    }
  };

  // Enhanced rendering with better visual effects
  const render = (ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw enhanced background
    drawEnhancedBackground(ctx);

    // Draw particles first (behind objects)
    drawParticles(ctx);

    // Draw game objects with enhanced effects
    gameObjects.forEach(obj => {
      if (!obj.active) return;
      drawGameObject(ctx, obj);
    });

    // Draw enhanced UI
    drawEnhancedUI(ctx);
  };

  const drawEnhancedBackground = (ctx: CanvasRenderingContext2D) => {
    const time = Date.now() * 0.001;
    
    // Base gradient layer
    const baseGradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    baseGradient.addColorStop(0, `hsl(${240 + Math.sin(time) * 15}, 80%, 8%)`);
    baseGradient.addColorStop(0.5, `hsl(${260 + Math.cos(time * 0.7) * 20}, 70%, 12%)`);
    baseGradient.addColorStop(1, `hsl(${280 + Math.sin(time * 0.5) * 25}, 75%, 15%)`);
    
    ctx.fillStyle = baseGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Enhanced moving stars with different sizes and speeds
    for (let i = 0; i < 100; i++) {
      const speed = 20 + (i % 3) * 15;
      const size = 1 + (i % 4) * 0.5;
      const x = (i * 137.5 + time * speed) % CANVAS_WIDTH;
      const y = (i * 73.3 + Math.sin(time * 0.3 + i) * 10) % CANVAS_HEIGHT;
      const alpha = (Math.sin(time + i) * 0.5 + 0.5) * (0.6 + size * 0.2);
      
      // Create star glow effect
      ctx.shadowColor = `rgba(255, 255, 255, ${alpha * 0.8})`;
      ctx.shadowBlur = size * 3;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillRect(x, y, size, size);
      ctx.shadowBlur = 0;
    }
  };

  const drawGameObject = (ctx: CanvasRenderingContext2D, obj: GameObject) => {
    ctx.save();
    
    if (obj.type === 'player') {
      // Draw player with special effects
      ctx.shadowColor = obj.color;
      ctx.shadowBlur = 15;
      
      // Player body with gradient
      const gradient = ctx.createRadialGradient(
        obj.x + obj.width/2, obj.y + obj.height/2, 0,
        obj.x + obj.width/2, obj.y + obj.height/2, obj.width/2
      );
      gradient.addColorStop(0, '#60A5FA');
      gradient.addColorStop(1, '#3B82F6');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
      
      // Player trail effect
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = obj.color;
      ctx.fillRect(obj.x - 10, obj.y + obj.height/2 - 2, 10, 4);
      ctx.globalAlpha = 1;
      
    } else if (obj.type === 'collectible') {
      // Draw rotating collectible with glow
      ctx.translate(obj.x + obj.width/2, obj.y + obj.height/2);
      ctx.rotate((obj.animation || 0) * 0.1);
      
      // Glow effect
      ctx.shadowColor = obj.color;
      ctx.shadowBlur = 10;
      ctx.fillStyle = obj.color;
      ctx.fillRect(-obj.width/2, -obj.height/2, obj.width, obj.height);
      
      // Inner shine
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(-obj.width/4, -obj.height/4, obj.width/2, obj.height/2);
      
    } else {
      // Standard object rendering
      ctx.shadowColor = obj.color;
      ctx.shadowBlur = 5;
      ctx.fillStyle = obj.color;
      ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
    }
    
    ctx.shadowBlur = 0;
    ctx.restore();
  };

  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  };

  const drawEnhancedUI = (ctx: CanvasRenderingContext2D) => {
    // Score with glow effect
    ctx.shadowColor = '#F59E0B';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px Arial';
    ctx.fillText(`Score: ${currentScore.toLocaleString()}`, 30, 50);
    
    // Lives with heart icons
    ctx.shadowBlur = 5;
    ctx.fillStyle = '#EF4444';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`Lives: ${'❤️'.repeat(gameState.lives)}`, 30, 90);
    
    // Level indicator
    ctx.fillStyle = '#3B82F6';
    ctx.fillText(`Level: ${gameState.level}`, 30, 130);
    
    ctx.shadowBlur = 0;
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameState.isPlaying) return;

      setGameObjects(prev => prev.map(obj => {
        if (obj.type !== 'player') return obj;

        const newObj = { ...obj };
        switch (e.key) {
          case 'ArrowUp':
          case 'w':
            newObj.vy = -8;
            break;
          case 'ArrowDown':
          case 's':
            newObj.vy = 8;
            break;
          case ' ':
            e.preventDefault();
            // Toggle pause handled by parent
            break;
        }
        return newObj;
      }));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!gameState.isPlaying) return;

      setGameObjects(prev => prev.map(obj => {
        if (obj.type !== 'player') return obj;

        const newObj = { ...obj };
        if (['ArrowUp', 'ArrowDown', 'w', 's'].includes(e.key)) {
          newObj.vy = 0;
        }
        return newObj;
      }));
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState.isPlaying]);

  // Start game loop when playing
  useEffect(() => {
    if (gameState.isPlaying && !isPaused) {
      animationRef.current = requestAnimationFrame(gameLoop);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState.isPlaying, isPaused, gameLoop]);

  return (
    <div className="flex flex-col items-center p-4 bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-2 border-white/20 rounded-2xl shadow-2xl"
        style={{ 
          background: 'linear-gradient(45deg, #0f172a, #1e293b)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      />

      <div className="mt-6 text-white text-center max-w-2xl">
        <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Enhanced Avalanche Rush
        </h3>
        <p className="text-lg mb-4">Use WASD or Arrow Keys to navigate • Space to pause</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="text-blue-400 font-bold">🎯 Avoid Red Obstacles</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="text-yellow-400 font-bold">💎 Collect Gold Coins</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="text-green-400 font-bold">⚡ Grab Power-ups</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="text-purple-400 font-bold">🏆 Beat High Scores</div>
          </div>
        </div>
        {!isConnected && (
          <p className="text-yellow-400 mt-4 text-lg font-semibold">
            🔗 Connect your wallet to save progress and earn rewards!
          </p>
        )}
      </div>
    </div>
  );
});

EnhancedGameEngine.displayName = 'EnhancedGameEngine';

export default EnhancedGameEngine;
