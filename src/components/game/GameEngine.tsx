import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import QuestIntegration from '../quest/QuestIntegration';
import TouchControls from './TouchControls';
import ErrorBoundary from '../common/ErrorBoundary';

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

interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  velocityX: number;
  isJumping: boolean;
  isSliding: boolean;
  isInvulnerable: boolean;
  animation: 'idle' | 'running' | 'jumping' | 'sliding' | 'falling' | 'celebrating';
}

interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'spike' | 'wall' | 'pit' | 'moving' | 'laser' | 'saw' | 'fire';
  speed: number;
  damage: number;
  isActive: boolean;
}

interface Collectible {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'coin' | 'gem' | 'powerup' | 'multiplier' | 'life' | 'token';
  value: number;
  collected: boolean;
  animation: string;
}

interface PowerUp {
  id: string;
  type: 'shield' | 'magnet' | 'jump_boost' | 'slow_time' | 'double_score' | 'invincibility';
  duration: number;
  remainingTime: number;
  effect: {
    multiplier?: number;
    duration?: number;
    protection?: boolean;
    magnetRange?: number;
  };
}

interface Character {
  id: string;
  name: string;
  rarity: string;
  type: string;
  questBonus: number;
  tournamentBonus: number;
  attributes: Record<string, number>;
  specialAbilities: string[];
}

interface GameEngineProps {
  gameState: GameState;
  selectedCharacter?: Character;
  onScoreUpdate: (score: number) => void;
  onGameEnd: (score: number, achievements?: string[]) => void;
  onLevelComplete: (level: number) => void;
  isPaused: boolean;
}

export interface GameEngineRef {
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'spark' | 'star' | 'explosion' | 'trail';
}

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  type: string;
  color?: string;
  animation?: number;
  powerupType?: 'shield' | 'speed' | 'magnet' | 'multiplier' | 'invincible' | 'slowmo';
  duration?: number;
  value?: number;
}

const GameEngine = React.memo(forwardRef<GameEngineRef, GameEngineProps>(({
  gameState,
  selectedCharacter,
  onScoreUpdate,
  onGameEnd,
  onLevelComplete,
  isPaused
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const [playerPosition, setPlayerPosition] = useState({ x: 100, y: 300 });
  const [keys, setKeys] = useState<{ [key: string]: boolean }>({});
  const [gameSpeed, setGameSpeed] = useState(2);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [backgroundOffset, setBackgroundOffset] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Enhanced game state with power-ups and special abilities
  const gameStateRef = useRef({
    score: 0,
    lives: 3,
    energy: 100,
    isRunning: false,
    obstacles: [] as GameObject[],
    collectibles: [] as GameObject[],
    powerups: [] as GameObject[],
    lastObstacleTime: 0,
    lastCollectibleTime: 0,
    lastPowerupTime: 0,
    playerAnimation: 0,
    invulnerable: false,
    invulnerableTime: 0,
    combo: 0,
    comboTimer: 0,
    // Power-up states
    activePowerups: {
      shield: { active: false, timeLeft: 0 },
      speed: { active: false, timeLeft: 0 },
      magnet: { active: false, timeLeft: 0 },
      multiplier: { active: false, timeLeft: 0, value: 1 },
      invincible: { active: false, timeLeft: 0 },
      slowmo: { active: false, timeLeft: 0 }
    },
    // Special abilities
    specialAbilities: {
      dash: { cooldown: 0, maxCooldown: 300 }, // 5 seconds
      timeFreeze: { cooldown: 0, maxCooldown: 600 }, // 10 seconds
      megaCollect: { cooldown: 0, maxCooldown: 900 } // 15 seconds
    },
    // Mini-game states
    miniGameActive: false,
    miniGameType: 'bonus_round' as 'bonus_round' | 'speed_challenge' | 'precision_test',
    miniGameScore: 0,
    // Achievement tracking
    achievements: [] as string[],
    streakCount: 0,
    perfectRounds: 0
  });

  // Memoized calculations for better performance
  const gameCalculations = useMemo(() => {
    const baseScore = gameStateRef.current.score;
    const comboMultiplier = Math.max(1, gameStateRef.current.combo * 0.1);
    const characterBonus = selectedCharacter ? (1 + selectedCharacter.questBonus / 100) : 1;
    
    return {
      effectiveScore: Math.floor(baseScore * comboMultiplier * characterBonus),
      nextLevelScore: (gameState.currentLevel + 1) * 1000,
      progressPercentage: Math.min(100, (baseScore / ((gameState.currentLevel + 1) * 1000)) * 100)
    };
  }, [selectedCharacter, gameState.currentLevel]);

  // Particle system
  const createParticles = useCallback((x: number, y: number, type: 'explosion' | 'collect' | 'power' | 'trail', count: number = 5) => {
    const newParticles: Particle[] = [];
    const colors = {
      explosion: ['#ff4444', '#ff8800', '#ffaa00', '#ff6600'],
      collect: ['#ffdd00', '#ffff00', '#aadd00', '#88ff88'],
      power: ['#4488ff', '#8844ff', '#ff44ff', '#44ffff'],
      trail: ['#ffffff', '#aaaaff', '#88aaff', '#6688ff']
    };

    for (let i = 0; i < count; i++) {
      newParticles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: type === 'trail' ? 0.3 : 1.0,
        maxLife: type === 'trail' ? 0.3 : 1.0,
        color: colors[type][Math.floor(Math.random() * colors[type].length)],
        size: Math.random() * 6 + 2,
        type: type === 'explosion' ? 'explosion' : type === 'trail' ? 'trail' : 'star'
      });
    }

    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  // Enhanced drawing functions
  const drawPlayer = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const time = Date.now() * 0.01;
    const bounce = Math.sin(time) * 2;
    const isInvulnerable = gameStateRef.current.invulnerable;
    
    // Player trail effect
    if (gameStateRef.current.isRunning && Math.random() < 0.3) {
      createParticles(x + 20, y + 20, 'trail', 1);
    }

    ctx.save();
    
    // Invulnerability flashing effect
    if (isInvulnerable && Math.floor(Date.now() / 100) % 2) {
      ctx.globalAlpha = 0.5;
    }

    // Player shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x + 5, y + 45, 35, 5);

    // Player body gradient
    const gradient = ctx.createLinearGradient(x, y, x, y + 40);
    gradient.addColorStop(0, '#4CAF50');
    gradient.addColorStop(0.5, '#66BB6A');
    gradient.addColorStop(1, '#2E7D32');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y + bounce, 40, 40);

    // Player face
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 8, y + 8 + bounce, 6, 6);
    ctx.fillRect(x + 26, y + 8 + bounce, 6, 6);
    
    // Player smile
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + 20, y + 25 + bounce, 8, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Player energy glow
    if (gameStateRef.current.energy > 80) {
      ctx.shadowColor = '#4CAF50';
      ctx.shadowBlur = 15;
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 1;
      ctx.strokeRect(x - 2, y - 2 + bounce, 44, 44);
    }

    ctx.restore();
  }, [createParticles]);

  const drawObstacle = (ctx: CanvasRenderingContext2D, obstacle: GameObject) => {
    const time = Date.now() * 0.005;
    const rotation = time + obstacle.x * 0.01;
    
    ctx.save();
    ctx.translate(obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2);
    ctx.rotate(rotation);

    // Obstacle gradient
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, obstacle.width/2);
    gradient.addColorStop(0, '#ff6b6b');
    gradient.addColorStop(0.7, '#ee5a52');
    gradient.addColorStop(1, '#c92a2a');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(-obstacle.width/2, -obstacle.height/2, obstacle.width, obstacle.height);

    // Obstacle spikes
    ctx.fillStyle = '#ff4444';
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const spikeX = Math.cos(angle) * (obstacle.width/2 + 5);
      const spikeY = Math.sin(angle) * (obstacle.height/2 + 5);
      
      ctx.beginPath();
      ctx.moveTo(spikeX * 0.7, spikeY * 0.7);
      ctx.lineTo(spikeX, spikeY);
      ctx.lineTo(spikeX * 0.7 + Math.cos(angle + 0.5) * 3, spikeY * 0.7 + Math.sin(angle + 0.5) * 3);
      ctx.closePath();
      ctx.fill();
    }

    // Danger glow
    ctx.shadowColor = '#ff4444';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = '#ff8888';
    ctx.lineWidth = 1;
    ctx.strokeRect(-obstacle.width/2 - 1, -obstacle.height/2 - 1, obstacle.width + 2, obstacle.height + 2);

    ctx.restore();
  };

  const drawCollectible = (ctx: CanvasRenderingContext2D, collectible: GameObject) => {
    const time = Date.now() * 0.01;
    const bounce = Math.sin(time + collectible.x * 0.1) * 3;
    const glow = Math.sin(time * 2) * 0.3 + 0.7;
    
    ctx.save();
    ctx.translate(collectible.x + collectible.width/2, collectible.y + collectible.height/2 + bounce);

    if (collectible.type === 'coin') {
      // Gold coin with shine effect
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, collectible.width/2);
      gradient.addColorStop(0, '#ffd700');
      gradient.addColorStop(0.7, '#ffed4a');
      gradient.addColorStop(1, '#f59e0b');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, collectible.width/2, 0, Math.PI * 2);
      ctx.fill();

      // Coin shine
      ctx.fillStyle = `rgba(255, 255, 255, ${glow})`;
      ctx.beginPath();
      ctx.arc(-3, -3, collectible.width/4, 0, Math.PI * 2);
      ctx.fill();

      // Dollar sign
      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('$', 0, 4);

    } else if (collectible.type === 'energy') {
      // Energy crystal
      const gradient = ctx.createLinearGradient(-10, -10, 10, 10);
      gradient.addColorStop(0, '#00bcd4');
      gradient.addColorStop(0.5, '#26c6da');
      gradient.addColorStop(1, '#00acc1');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, -collectible.height/2);
      ctx.lineTo(collectible.width/2, -collectible.height/4);
      ctx.lineTo(collectible.width/2, collectible.height/4);
      ctx.lineTo(0, collectible.height/2);
      ctx.lineTo(-collectible.width/2, collectible.height/4);
      ctx.lineTo(-collectible.width/2, -collectible.height/4);
      ctx.closePath();
      ctx.fill();

      // Energy glow
      ctx.shadowColor = '#00bcd4';
      ctx.shadowBlur = 15 * glow;
      ctx.strokeStyle = `rgba(0, 188, 212, ${glow})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (collectible.type === 'gem') {
      // Rare gem with rainbow effect
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, collectible.width/2);
      gradient.addColorStop(0, '#ff00ff');
      gradient.addColorStop(0.3, '#00ffff');
      gradient.addColorStop(0.6, '#ffff00');
      gradient.addColorStop(1, '#ff0000');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, -collectible.height/2);
      ctx.lineTo(collectible.width/2, -collectible.height/4);
      ctx.lineTo(collectible.width/2, collectible.height/4);
      ctx.lineTo(0, collectible.height/2);
      ctx.lineTo(-collectible.width/2, collectible.height/4);
      ctx.lineTo(-collectible.width/2, -collectible.height/4);
      ctx.closePath();
      ctx.fill();

      // Gem sparkle
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 20 * glow;
      ctx.fillStyle = `rgba(255, 255, 255, ${glow})`;
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  const drawPowerup = (ctx: CanvasRenderingContext2D, powerup: GameObject) => {
    const time = Date.now() * 0.01;
    const bounce = Math.sin(time + powerup.x * 0.1) * 4;
    const glow = Math.sin(time * 3) * 0.4 + 0.6;
    const rotation = time * 2;
    
    ctx.save();
    ctx.translate(powerup.x + powerup.width/2, powerup.y + powerup.height/2 + bounce);
    ctx.rotate(rotation);

    // Power-up glow ring
    ctx.shadowColor = powerup.color || '#ffffff';
    ctx.shadowBlur = 20 * glow;
    ctx.strokeStyle = `rgba(255, 255, 255, ${glow})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, powerup.width/2 + 5, 0, Math.PI * 2);
    ctx.stroke();

    // Power-up icon based on type
    if (powerup.powerupType === 'shield') {
      // Shield icon
      const gradient = ctx.createLinearGradient(-15, -15, 15, 15);
      gradient.addColorStop(0, '#4CAF50');
      gradient.addColorStop(1, '#2E7D32');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, -15);
      ctx.lineTo(12, -8);
      ctx.lineTo(12, 8);
      ctx.lineTo(0, 15);
      ctx.lineTo(-12, 8);
      ctx.lineTo(-12, -8);
      ctx.closePath();
      ctx.fill();

    } else if (powerup.powerupType === 'speed') {
      // Speed boost icon
      const gradient = ctx.createLinearGradient(-15, -15, 15, 15);
      gradient.addColorStop(0, '#FF9800');
      gradient.addColorStop(1, '#F57C00');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(-15, 0);
      ctx.lineTo(15, -10);
      ctx.lineTo(15, 10);
      ctx.closePath();
      ctx.fill();

    } else if (powerup.powerupType === 'magnet') {
      // Magnet icon
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
      gradient.addColorStop(0, '#9C27B0');
      gradient.addColorStop(1, '#6A1B9A');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.fill();

      // Magnet field lines
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * 8, Math.sin(angle) * 8);
        ctx.lineTo(Math.cos(angle) * 20, Math.sin(angle) * 20);
        ctx.stroke();
      }

    } else if (powerup.powerupType === 'multiplier') {
      // Multiplier icon
      const gradient = ctx.createLinearGradient(-15, -15, 15, 15);
      gradient.addColorStop(0, '#E91E63');
      gradient.addColorStop(1, '#C2185B');
      
      ctx.fillStyle = gradient;
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('×', 0, 6);

    } else if (powerup.powerupType === 'invincible') {
      // Invincible star icon
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
      gradient.addColorStop(0, '#FFD700');
      gradient.addColorStop(1, '#FFA000');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const x = Math.cos(angle) * 15;
        const y = Math.sin(angle) * 15;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();

    } else if (powerup.powerupType === 'slowmo') {
      // Slow motion icon
      const gradient = ctx.createLinearGradient(-15, -15, 15, 15);
      gradient.addColorStop(0, '#2196F3');
      gradient.addColorStop(1, '#1976D2');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.fill();

      // Clock hands
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -10);
      ctx.moveTo(0, 0);
      ctx.lineTo(8, 0);
      ctx.stroke();
    }

    ctx.restore();
  };

  const drawBackground = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Moving stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 50; i++) {
      const x = ((i * 123.5 + backgroundOffset * 0.5) % (canvas.width + 50)) - 50;
      const y = (i * 67.8) % canvas.height;
      const size = (i % 3) + 1;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Distant mountains
    ctx.fillStyle = 'rgba(76, 175, 80, 0.3)';
    ctx.beginPath();
    ctx.moveTo(-50, canvas.height);
    for (let x = 0; x < canvas.width + 50; x += 20) {
      const height = Math.sin((x + backgroundOffset) * 0.01) * 50 + canvas.height - 100;
      ctx.lineTo(x, height);
    }
    ctx.lineTo(canvas.width + 50, canvas.height);
    ctx.closePath();
    ctx.fill();

    // Grid lines
    ctx.strokeStyle = 'rgba(76, 175, 80, 0.1)';
    ctx.lineWidth = 1;
    for (let x = (backgroundOffset % 50); x < canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
  }, [backgroundOffset]);

  const updateParticles = () => {
    setParticles(prev => prev.map(particle => ({
      ...particle,
      x: particle.x + particle.vx,
      y: particle.y + particle.vy,
      vy: particle.vy + 0.2, // gravity
      life: particle.life - 0.02,
      vx: particle.vx * 0.98 // air resistance
    })).filter(particle => particle.life > 0));
  };

  const drawParticles = useCallback((ctx: CanvasRenderingContext2D) => {
    particles.forEach(particle => {
      ctx.save();
      ctx.globalAlpha = particle.life / particle.maxLife;
      
      if (particle.type === 'star') {
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * (particle.life / particle.maxLife), 0, Math.PI * 2);
        ctx.fill();
        
        // Star sparkle
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 10;
        ctx.fill();
      } else {
        ctx.fillStyle = particle.color;
        ctx.fillRect(
          particle.x - particle.size/2, 
          particle.y - particle.size/2, 
          particle.size * (particle.life / particle.maxLife), 
          particle.size * (particle.life / particle.maxLife)
        );
      }
      
      ctx.restore();
    });
  }, [particles]);

  // Enhanced game loop (will be defined at the end after all functions)

  const drawEnhancedUI = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // Main UI Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(10, 10, 280, 180);
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 280, 180);

    // Score with glow effect
    ctx.shadowColor = '#ffdd00';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffdd00';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`Score: ${gameStateRef.current.score.toLocaleString()}`, 20, 35);
    
    // Combo display
    if (gameStateRef.current.combo > 0) {
      ctx.shadowColor = '#ff4444';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#ff4444';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`${gameStateRef.current.combo}x COMBO!`, 20, 55);
    }

    ctx.shadowBlur = 0; // Reset shadow

    // Lives with heart icons
    ctx.fillStyle = '#ff4444';
    ctx.font = '20px Arial';
    for (let i = 0; i < gameStateRef.current.lives; i++) {
      ctx.fillText('❤️', 20 + i * 25, 80);
    }

    // Energy bar with gradient
    const energyGradient = ctx.createLinearGradient(20, 90, 220, 90);
    energyGradient.addColorStop(0, '#00ff00');
    energyGradient.addColorStop(0.5, '#ffff00');
    energyGradient.addColorStop(1, '#ff0000');
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(20, 90, 200, 15);
    
    ctx.fillStyle = energyGradient;
    ctx.fillRect(20, 90, (gameStateRef.current.energy / 100) * 200, 15);
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 90, 200, 15);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.fillText(`Energy: ${gameStateRef.current.energy}%`, 25, 102);

    // Level indicator
    ctx.fillStyle = '#4CAF50';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`Level: ${gameState.currentLevel}`, 20, 120);

    // Active Power-ups Display
    let powerupY = 140;
    Object.keys(gameStateRef.current.activePowerups).forEach(key => {
      const powerup = gameStateRef.current.activePowerups[key as keyof typeof gameStateRef.current.activePowerups];
      if (powerup.active && powerup.timeLeft > 0) {
        const icons = {
          shield: '🛡️',
          speed: '⚡',
          magnet: '🧲',
          multiplier: '×',
          invincible: '⭐',
          slowmo: '⏰'
        };
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.fillText(`${icons[key as keyof typeof icons]} ${Math.ceil(powerup.timeLeft / 60)}s`, 20, powerupY);
        powerupY += 20;
      }
    });

    // Special Abilities Cooldowns (Right side)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(canvas.width - 200, 10, 190, 120);
    ctx.strokeStyle = '#9C27B0';
    ctx.lineWidth = 2;
    ctx.strokeRect(canvas.width - 200, 10, 190, 120);

    ctx.fillStyle = '#9C27B0';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Special Abilities', canvas.width - 190, 30);

    // Dash ability
    const dashReady = gameStateRef.current.specialAbilities.dash.cooldown === 0;
    ctx.fillStyle = dashReady ? '#4CAF50' : '#666666';
    ctx.font = '12px Arial';
    ctx.fillText(`Q - Dash ${dashReady ? 'READY' : Math.ceil(gameStateRef.current.specialAbilities.dash.cooldown / 60) + 's'}`, canvas.width - 190, 50);

    // Time Freeze ability
    const freezeReady = gameStateRef.current.specialAbilities.timeFreeze.cooldown === 0;
    ctx.fillStyle = freezeReady ? '#2196F3' : '#666666';
    ctx.fillText(`E - Time Freeze ${freezeReady ? 'READY' : Math.ceil(gameStateRef.current.specialAbilities.timeFreeze.cooldown / 60) + 's'}`, canvas.width - 190, 70);

    // Mega Collect ability
    const collectReady = gameStateRef.current.specialAbilities.megaCollect.cooldown === 0;
    ctx.fillStyle = collectReady ? '#FF9800' : '#666666';
    ctx.fillText(`R - Mega Collect ${collectReady ? 'READY' : Math.ceil(gameStateRef.current.specialAbilities.megaCollect.cooldown / 60) + 's'}`, canvas.width - 190, 90);

    // Streak counter
    if (gameStateRef.current.streakCount > 0) {
      ctx.fillStyle = '#E91E63';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(`Streak: ${gameStateRef.current.streakCount}`, canvas.width - 190, 110);
    }
  }, [gameState.currentLevel]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth <= 768 ||
        'ontouchstart' in window
      );
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Touch control handlers
  const handleTouchMove = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    setKeys(prev => ({ ...prev, [`Arrow${direction.charAt(0).toUpperCase() + direction.slice(1)}`]: true }));
    
    // Clear the key after a short delay to simulate key press
    setTimeout(() => {
      setKeys(prev => ({ ...prev, [`Arrow${direction.charAt(0).toUpperCase() + direction.slice(1)}`]: false }));
    }, 100);
  }, []);

  const handleTouchJump = useCallback(() => {
    setKeys(prev => ({ ...prev, ' ': true }));
    setTimeout(() => {
      setKeys(prev => ({ ...prev, ' ': false }));
    }, 100);
  }, []);

  const handleTouchSlide = useCallback(() => {
    setKeys(prev => ({ ...prev, 'ArrowDown': true }));
    setTimeout(() => {
      setKeys(prev => ({ ...prev, 'ArrowDown': false }));
    }, 100);
  }, []);

  const handleSpecialAbility = useCallback((ability: 'dash' | 'timeFreeze' | 'megaCollect') => {
    const keyMap = {
      dash: 'q',
      timeFreeze: 'e',
      megaCollect: 'r'
    };
    
    setKeys(prev => ({ ...prev, [keyMap[ability]]: true }));
    setTimeout(() => {
      setKeys(prev => ({ ...prev, [keyMap[ability]]: false }));
    }, 100);
  }, []);

  // Initialize game (moved to end after startGame function)

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => ({ ...prev, [e.key]: true }));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => ({ ...prev, [e.key]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Initialize game (moved to end after gameLoop)

  const pauseGame = useCallback(() => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
  }, []);

  // Resume game (moved to end after gameLoop)

  const endGame = useCallback(() => {
    gameStateRef.current.isRunning = false;
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    
    const achievements = [];
    if (gameStateRef.current.score >= 100) achievements.push('century');
    if (gameStateRef.current.score >= 500) achievements.push('half_k');
    if (gameStateRef.current.score >= 1000) achievements.push('thousand');
    if (gameStateRef.current.combo >= 5) achievements.push('combo_master');
    
    onGameEnd(gameStateRef.current.score, achievements);
  }, [onGameEnd]);

  // Enhanced game loop (defined at the end to avoid dependency issues)
  const gameLoop = useCallback(() => {
    if (!gameState.isPlaying || isPaused) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Update background
    setBackgroundOffset(prev => prev + gameSpeed);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    drawBackground(ctx, canvas);

    // Update player position based on input
    const newPlayerPosition = { ...playerPosition };
    
    if (keys['ArrowUp'] || keys['w'] || keys[' ']) {
      newPlayerPosition.y = Math.max(50, newPlayerPosition.y - 6);
    }
    if (keys['ArrowDown'] || keys['s']) {
      newPlayerPosition.y = Math.min(canvas.height - 90, newPlayerPosition.y + 6);
    }
    if (keys['ArrowLeft'] || keys['a']) {
      newPlayerPosition.x = Math.max(20, newPlayerPosition.x - 5);
    }
    if (keys['ArrowRight'] || keys['d']) {
      newPlayerPosition.x = Math.min(canvas.width - 60, newPlayerPosition.x + 5);
    }

    setPlayerPosition(newPlayerPosition);

    // Generate obstacles
    const now = Date.now();
    if (now - gameStateRef.current.lastObstacleTime > 1500 - gameSpeed * 100) {
      gameStateRef.current.obstacles.push({
        x: canvas.width,
        y: Math.random() * (canvas.height - 150) + 50,
        width: 30 + Math.random() * 20,
        height: 30 + Math.random() * 20,
        speed: gameSpeed + Math.random() * 2 + 1,
        type: 'obstacle',
        animation: 0
      });
      gameStateRef.current.lastObstacleTime = now;
    }

    // Generate collectibles with variety
    if (now - gameStateRef.current.lastCollectibleTime > 2500) {
      const rand = Math.random();
      let type = 'coin';
      if (rand > 0.8) type = 'energy';
      else if (rand > 0.95) type = 'gem'; // Rare gem
      
      gameStateRef.current.collectibles.push({
        x: canvas.width,
        y: Math.random() * (canvas.height - 150) + 50,
        width: type === 'gem' ? 25 : 20,
        height: type === 'gem' ? 25 : 20,
        speed: gameSpeed + 1,
        type,
        animation: 0,
        value: type === 'gem' ? 50 : type === 'energy' ? 0 : 10
      });
      gameStateRef.current.lastCollectibleTime = now;
    }

    // Generate power-ups
    if (now - gameStateRef.current.lastPowerupTime > 8000) { // Every 8 seconds
      const powerupTypes: Array<'shield' | 'speed' | 'magnet' | 'multiplier' | 'invincible' | 'slowmo'> = 
        ['shield', 'speed', 'magnet', 'multiplier', 'invincible', 'slowmo'];
      const powerupType = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
      
      const colors = {
        shield: '#4CAF50',
        speed: '#FF9800', 
        magnet: '#9C27B0',
        multiplier: '#E91E63',
        invincible: '#FFD700',
        slowmo: '#2196F3'
      };

      gameStateRef.current.powerups.push({
        x: canvas.width,
        y: Math.random() * (canvas.height - 150) + 50,
        width: 30,
        height: 30,
        speed: gameSpeed + 0.5,
        type: 'powerup',
        animation: 0,
        powerupType,
        color: colors[powerupType],
        duration: powerupType === 'invincible' ? 300 : 600, // 5 or 10 seconds
        value: powerupType === 'multiplier' ? 2 : 1
      });
      gameStateRef.current.lastPowerupTime = now;
    }

    // Update invulnerability
    if (gameStateRef.current.invulnerable) {
      gameStateRef.current.invulnerableTime--;
      if (gameStateRef.current.invulnerableTime <= 0) {
        gameStateRef.current.invulnerable = false;
      }
    }

    // Update combo timer
    if (gameStateRef.current.comboTimer > 0) {
      gameStateRef.current.comboTimer--;
      if (gameStateRef.current.comboTimer <= 0) {
        gameStateRef.current.combo = 0;
      }
    }

    // Update power-ups
    Object.keys(gameStateRef.current.activePowerups).forEach(key => {
      const powerup = gameStateRef.current.activePowerups[key as keyof typeof gameStateRef.current.activePowerups];
      if (powerup.active && powerup.timeLeft > 0) {
        powerup.timeLeft--;
        if (powerup.timeLeft <= 0) {
          powerup.active = false;
        }
      }
    });

    // Update special ability cooldowns
    Object.keys(gameStateRef.current.specialAbilities).forEach(key => {
      const ability = gameStateRef.current.specialAbilities[key as keyof typeof gameStateRef.current.specialAbilities];
      if (ability.cooldown > 0) {
        ability.cooldown--;
      }
    });

    // Handle special ability inputs
    if (keys['q'] && gameStateRef.current.specialAbilities.dash.cooldown === 0) {
      // Dash ability - quick movement boost
      newPlayerPosition.x = Math.min(canvas.width - 60, newPlayerPosition.x + 100);
      gameStateRef.current.specialAbilities.dash.cooldown = gameStateRef.current.specialAbilities.dash.maxCooldown;
      createParticles(newPlayerPosition.x, newPlayerPosition.y, 'power', 8);
    }
    
    if (keys['e'] && gameStateRef.current.specialAbilities.timeFreeze.cooldown === 0) {
      // Time freeze - slow down obstacles temporarily
      gameStateRef.current.specialAbilities.timeFreeze.cooldown = gameStateRef.current.specialAbilities.timeFreeze.maxCooldown;
      // Apply slow motion effect to obstacles for 3 seconds
      gameStateRef.current.activePowerups.slowmo.active = true;
      gameStateRef.current.activePowerups.slowmo.timeLeft = 180; // 3 seconds
    }
    
    if (keys['r'] && gameStateRef.current.specialAbilities.megaCollect.cooldown === 0) {
      // Mega collect - attract all nearby collectibles
      gameStateRef.current.specialAbilities.megaCollect.cooldown = gameStateRef.current.specialAbilities.megaCollect.maxCooldown;
      gameStateRef.current.activePowerups.magnet.active = true;
      gameStateRef.current.activePowerups.magnet.timeLeft = 300; // 5 seconds
    }

    // Update obstacles with power-up effects
    gameStateRef.current.obstacles = gameStateRef.current.obstacles.filter(obstacle => {
      // Apply slow motion effect
      const speedMultiplier = gameStateRef.current.activePowerups.slowmo.active ? 0.3 : 1;
      obstacle.x -= obstacle.speed * speedMultiplier;
      obstacle.animation += 0.1;
      
      // Check collision with player
      if (
        !gameStateRef.current.invulnerable &&
        !gameStateRef.current.activePowerups.shield.active &&
        !gameStateRef.current.activePowerups.invincible.active &&
        obstacle.x < newPlayerPosition.x + 30 &&
        obstacle.x + obstacle.width > newPlayerPosition.x + 10 &&
        obstacle.y < newPlayerPosition.y + 30 &&
        obstacle.y + obstacle.height > newPlayerPosition.y + 10
      ) {
        // Create explosion particles
        createParticles(obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2, 'explosion', 8);
        
        if (gameStateRef.current.activePowerups.shield.active) {
          // Shield absorbs damage
          gameStateRef.current.activePowerups.shield.active = false;
          gameStateRef.current.activePowerups.shield.timeLeft = 0;
          createParticles(newPlayerPosition.x + 20, newPlayerPosition.y + 20, 'power', 6);
        } else {
          gameStateRef.current.lives--;
          gameStateRef.current.energy -= 25;
          gameStateRef.current.invulnerable = true;
          gameStateRef.current.invulnerableTime = 120; // 2 seconds at 60fps
          gameStateRef.current.combo = 0;
          
          if (gameStateRef.current.lives <= 0) {
            endGame();
            return false;
          }
        }
      }
      
      return obstacle.x > -100;
    });

    // Update collectibles with magnet effect
    gameStateRef.current.collectibles = gameStateRef.current.collectibles.filter(collectible => {
      // Apply magnet effect
      if (gameStateRef.current.activePowerups.magnet.active) {
        const dx = newPlayerPosition.x + 20 - (collectible.x + collectible.width/2);
        const dy = newPlayerPosition.y + 20 - (collectible.y + collectible.height/2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) { // Magnet range
          const pullStrength = (150 - distance) / 150;
          collectible.x += dx * pullStrength * 0.1;
          collectible.y += dy * pullStrength * 0.1;
        }
      } else {
        collectible.x -= collectible.speed;
      }
      
      collectible.animation += 0.1;
      
      // Check collision with player
      if (
        collectible.x < newPlayerPosition.x + 30 &&
        collectible.x + collectible.width > newPlayerPosition.x + 10 &&
        collectible.y < newPlayerPosition.y + 30 &&
        collectible.y + collectible.height > newPlayerPosition.y + 10
      ) {
        // Create collection particles
        createParticles(collectible.x + collectible.width/2, collectible.y + collectible.height/2, 'collect', 6);
        
        if (collectible.type === 'coin') {
          let points = (10 + gameStateRef.current.combo * 2);
          
          // Apply multiplier power-up
          if (gameStateRef.current.activePowerups.multiplier.active) {
            points *= gameStateRef.current.activePowerups.multiplier.value;
          }
          
          // Apply character bonuses
          if (selectedCharacter) {
            points = Math.floor(points * (1 + selectedCharacter.questBonus / 100));
            
            if (selectedCharacter.specialAbilities.includes('Lucky Strike')) {
              points = Math.floor(points * 1.2);
            }
          }
          
          gameStateRef.current.score += Math.floor(points);
          gameStateRef.current.combo++;
          gameStateRef.current.comboTimer = 300;
          gameStateRef.current.streakCount++;
          onScoreUpdate(gameStateRef.current.score);
          
        } else if (collectible.type === 'energy') {
          gameStateRef.current.energy = Math.min(100, gameStateRef.current.energy + 25);
          createParticles(newPlayerPosition.x + 20, newPlayerPosition.y + 20, 'power', 4);
          
        } else if (collectible.type === 'gem') {
          // Rare gem gives massive points
          let points = 50 + gameStateRef.current.combo * 5;
          
          if (gameStateRef.current.activePowerups.multiplier.active) {
            points *= gameStateRef.current.activePowerups.multiplier.value;
          }
          
          gameStateRef.current.score += Math.floor(points);
          gameStateRef.current.combo += 3; // Gems give bigger combo boost
          gameStateRef.current.comboTimer = 450; // Longer combo time
          gameStateRef.current.streakCount += 2;
          onScoreUpdate(gameStateRef.current.score);
          
          // Special gem collection effect
          createParticles(collectible.x + collectible.width/2, collectible.y + collectible.height/2, 'power', 12);
        }
        
        return false;
      }
      
      return collectible.x > -50;
    });

    // Update power-ups
    gameStateRef.current.powerups = gameStateRef.current.powerups.filter(powerup => {
      powerup.x -= powerup.speed;
      powerup.animation += 0.1;
      
      // Check collision with player
      if (
        powerup.x < newPlayerPosition.x + 30 &&
        powerup.x + powerup.width > newPlayerPosition.x + 10 &&
        powerup.y < newPlayerPosition.y + 30 &&
        powerup.y + powerup.height > newPlayerPosition.y + 10
      ) {
        // Activate power-up
        if (powerup.powerupType) {
          gameStateRef.current.activePowerups[powerup.powerupType].active = true;
          gameStateRef.current.activePowerups[powerup.powerupType].timeLeft = powerup.duration || 600;
          
          if (powerup.powerupType === 'multiplier') {
            gameStateRef.current.activePowerups[powerup.powerupType].value = powerup.value || 2;
          }
          
          // Power-up collection effect
          createParticles(powerup.x + powerup.width/2, powerup.y + powerup.height/2, 'power', 10);
        }
        
        return false;
      }
      
      return powerup.x > -50;
    });

    // Draw all game objects
    drawPlayer(ctx, newPlayerPosition.x, newPlayerPosition.y);
    
    gameStateRef.current.obstacles.forEach(obstacle => {
      drawObstacle(ctx, obstacle);
    });
    
    gameStateRef.current.collectibles.forEach(collectible => {
      drawCollectible(ctx, collectible);
    });

    gameStateRef.current.powerups.forEach(powerup => {
      drawPowerup(ctx, powerup);
    });

    // Update and draw particles
    updateParticles();
    drawParticles(ctx);

    // Draw enhanced UI
    drawEnhancedUI(ctx, canvas);

    // Increase game speed over time
    if (gameStateRef.current.score > 0 && gameStateRef.current.score % 100 === 0) {
      setGameSpeed(prev => Math.min(prev + 0.05, 6));
    }

    // Continue game loop
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.isPlaying, isPaused, playerPosition, keys, gameSpeed, createParticles, onScoreUpdate, selectedCharacter, drawBackground, drawEnhancedUI, drawParticles, drawPlayer, endGame]);

  // Initialize game
  const startGame = useCallback(() => {
    gameStateRef.current = {
      score: 0,
      lives: 3,
      energy: 100,
      isRunning: true,
      obstacles: [] as GameObject[],
      collectibles: [] as GameObject[],
      powerups: [] as GameObject[],
      lastObstacleTime: 0,
      lastCollectibleTime: 0,
      lastPowerupTime: 0,
      playerAnimation: 0,
      invulnerable: false,
      invulnerableTime: 0,
      combo: 0,
      comboTimer: 0,
      // Initialize power-up states
      activePowerups: {
        shield: { active: false, timeLeft: 0 },
        speed: { active: false, timeLeft: 0 },
        magnet: { active: false, timeLeft: 0 },
        multiplier: { active: false, timeLeft: 0, value: 1 },
        invincible: { active: false, timeLeft: 0 },
        slowmo: { active: false, timeLeft: 0 }
      },
      // Initialize special abilities
      specialAbilities: {
        dash: { cooldown: 0, maxCooldown: 300 },
        timeFreeze: { cooldown: 0, maxCooldown: 600 },
        megaCollect: { cooldown: 0, maxCooldown: 900 }
      },
      // Initialize mini-game states
      miniGameActive: false,
      miniGameType: 'bonus_round',
      miniGameScore: 0,
      // Initialize achievement tracking
      achievements: [],
      streakCount: 0,
      perfectRounds: 0
    };
    setGameSpeed(2);
    setParticles([]);
    setBackgroundOffset(0);
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  // Initialize game
  useEffect(() => {
    if (gameState.isPlaying && !gameStateRef.current.isRunning) {
      startGame();
    }
  }, [gameState.isPlaying, startGame]);

  // Resume game
  const resumeGame = useCallback(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    startGame,
    pauseGame,
    resumeGame,
    endGame,
  }));

  // Handle pause/resume
  useEffect(() => {
    if (isPaused) {
      pauseGame();
    } else if (gameState.isPlaying) {
      resumeGame();
    }
  }, [isPaused, gameState.isPlaying, resumeGame, pauseGame]);

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('GameEngine Error:', error, errorInfo);
        // In production, this will be automatically sent to error reporting service
      }}
      showDetails={process.env.NODE_ENV === 'development'}
      resetOnPropsChange={true}
      resetKeys={[gameState.currentLevel, gameState.gameMode]}
    >
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={1000}
            height={600}
            className="border-2 border-green-400 rounded-lg shadow-2xl"
            style={{ maxWidth: '95vw', maxHeight: '85vh' }}
          />
          
          {/* Enhanced Game Instructions Overlay */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 right-4 bg-black/80 text-white p-4 rounded-lg backdrop-blur-sm border border-green-400/30 max-w-xs"
          >
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-green-400">🎮</span>
                <span>WASD or Arrow Keys to move</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">🪙</span>
                <span>Collect coins for points</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-400">💎</span>
                <span>Energy crystals restore health</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-400">💎</span>
                <span>Rare gems give massive points!</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-400">⚠️</span>
                <span>Avoid spinning obstacles</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-orange-400">⚡</span>
                <span>Collect power-ups for abilities</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-400">🔥</span>
                <span>Build combos for bonus points!</span>
              </div>
              <div className="border-t border-gray-600 pt-2 mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">Q</span>
                  <span>Dash forward</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">E</span>
                  <span>Time freeze</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-orange-400">R</span>
                  <span>Mega collect</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Pause Overlay */}
          {isPaused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm rounded-lg"
            >
              <div className="text-center text-white">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  ⏸️
                </motion.div>
                <h2 className="text-4xl font-bold mb-2">PAUSED</h2>
                <p className="text-xl">Press Resume to continue</p>
              </div>
            </motion.div>
          )}

          {/* Touch Controls for Mobile */}
          <TouchControls
            onMove={handleTouchMove}
            onSpecialAbility={handleSpecialAbility}
            onJump={handleTouchJump}
            onSlide={handleTouchSlide}
            isVisible={isMobile && gameState.isPlaying}
            abilities={gameStateRef.current.specialAbilities}
          />

          {/* Quest Integration */}
          <QuestIntegration
            gameState={{
              isPlaying: gameState.isPlaying,
              score: gameState.score,
              lives: gameState.lives,
              energy: gameState.energy,
              currentLevel: gameState.currentLevel
            }}
            onQuestUpdate={(questId, objectiveId, progress) => {
              console.log(`Quest ${questId} objective ${objectiveId} progress: ${progress}`);
            }}
            onQuestComplete={(questId, rewards) => {
              console.log(`Quest ${questId} completed with rewards:`, rewards);
            }}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}));

GameEngine.displayName = 'GameEngine';

export default GameEngine;