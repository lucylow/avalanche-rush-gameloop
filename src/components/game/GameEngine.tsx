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
  backgroundTheme?: 'space' | 'mountain' | 'neon' | 'forest' | 'desert';
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
  isPaused,
  backgroundTheme = 'space'
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const [playerPosition, setPlayerPosition] = useState({ x: 100, y: 300 });
  const [keys, setKeys] = useState<{ [key: string]: boolean }>({});
  const [gameSpeed, setGameSpeed] = useState(2);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [backgroundOffset, setBackgroundOffset] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showAchievement, setShowAchievement] = useState<string | null>(null);
  const [achievementTimer, setAchievementTimer] = useState(0);

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

  // Enhanced particle system with more variety
  const createParticles = useCallback((x: number, y: number, type: 'explosion' | 'collect' | 'power' | 'trail', count: number = 5) => {
    const newParticles: Particle[] = [];
    const colors = {
      explosion: ['#ff4444', '#ff8800', '#ffaa00', '#ff6600', '#ffcc00', '#ff0000'],
      collect: ['#ffdd00', '#ffff00', '#aadd00', '#88ff88', '#00ff88', '#ffd700'],
      power: ['#4488ff', '#8844ff', '#ff44ff', '#44ffff', '#aa44ff', '#ff88ff'],
      trail: ['#ffffff', '#aaaaff', '#88aaff', '#6688ff', '#ccccff', '#99aaff']
    };

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = type === 'trail' ? 2 + Math.random() * 2 : 4 + Math.random() * 6;
      const particleType = type === 'explosion' ? 'explosion' :
                          type === 'trail' ? 'trail' :
                          Math.random() > 0.5 ? 'star' : 'spark';

      newParticles.push({
        x: x + (Math.random() - 0.5) * 15,
        y: y + (Math.random() - 0.5) * 15,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 2,
        vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 2,
        life: type === 'trail' ? 0.3 : type === 'power' ? 1.2 : 1.0,
        maxLife: type === 'trail' ? 0.3 : type === 'power' ? 1.2 : 1.0,
        color: colors[type][Math.floor(Math.random() * colors[type].length)],
        size: type === 'power' ? Math.random() * 8 + 3 : Math.random() * 6 + 2,
        type: particleType
      });
    }

    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  // Enhanced drawing functions
  const drawPlayer = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const time = Date.now() * 0.01;
    const bounce = Math.sin(time) * 3;
    const runCycle = Math.sin(time * 2) * 2;
    const isInvulnerable = gameStateRef.current.invulnerable;

    // Enhanced player trail effect with gradient
    if (gameStateRef.current.isRunning && Math.random() < 0.4) {
      createParticles(x + 10, y + 35, 'trail', 2);
    }

    ctx.save();

    // Invulnerability rainbow flashing effect
    if (isInvulnerable) {
      const flashCycle = Math.floor(Date.now() / 80) % 3;
      ctx.globalAlpha = flashCycle === 0 ? 0.7 : 1;

      // Rainbow aura when invulnerable
      const auraGradient = ctx.createRadialGradient(x + 20, y + 20, 0, x + 20, y + 20, 35);
      auraGradient.addColorStop(0, 'rgba(255, 215, 0, 0)');
      auraGradient.addColorStop(0.7, `rgba(255, ${100 + Math.sin(time) * 100}, 0, 0.3)`);
      auraGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
      ctx.fillStyle = auraGradient;
      ctx.beginPath();
      ctx.arc(x + 20, y + 20 + bounce, 40, 0, Math.PI * 2);
      ctx.fill();
    }

    // Enhanced shadow with blur
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 8;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(x + 20, y + 48, 18, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Active power-up visual effects
    if (gameStateRef.current.activePowerups.shield.active) {
      // Shield bubble
      const shieldGradient = ctx.createRadialGradient(x + 20, y + 20, 15, x + 20, y + 20, 32);
      shieldGradient.addColorStop(0, 'rgba(76, 175, 80, 0)');
      shieldGradient.addColorStop(0.8, 'rgba(76, 175, 80, 0.4)');
      shieldGradient.addColorStop(1, 'rgba(76, 175, 80, 0.7)');
      ctx.fillStyle = shieldGradient;
      ctx.beginPath();
      ctx.arc(x + 20, y + 20 + bounce, 32, 0, Math.PI * 2);
      ctx.fill();

      // Shield sparkles
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x + 20, y + 20 + bounce, 32, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (gameStateRef.current.activePowerups.speed.active) {
      // Speed trail lines
      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = `rgba(255, 152, 0, ${0.6 - i * 0.2})`;
        ctx.lineWidth = 3 - i;
        ctx.beginPath();
        ctx.moveTo(x - 10 - i * 8, y + 15 + i * 5 + bounce);
        ctx.lineTo(x - 5 - i * 6, y + 15 + i * 5 + bounce);
        ctx.stroke();
      }
    }

    if (gameStateRef.current.activePowerups.magnet.active) {
      // Magnetic field rings
      for (let i = 0; i < 2; i++) {
        const ringTime = time + i * Math.PI;
        const ringSize = 35 + Math.sin(ringTime) * 5;
        ctx.strokeStyle = `rgba(156, 39, 176, ${0.5 - Math.sin(ringTime) * 0.3})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + 20, y + 20 + bounce, ringSize, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Player body with enhanced gradient and depth
    const bodyGradient = ctx.createLinearGradient(x, y, x + 40, y + 40);
    bodyGradient.addColorStop(0, '#66BB6A');
    bodyGradient.addColorStop(0.3, '#4CAF50');
    bodyGradient.addColorStop(0.7, '#388E3C');
    bodyGradient.addColorStop(1, '#2E7D32');

    ctx.fillStyle = bodyGradient;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // Rounded body
    ctx.beginPath();
    ctx.roundRect(x, y + bounce, 40, 40, 8);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Body highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.roundRect(x + 3, y + 3 + bounce, 20, 15, 4);
    ctx.fill();

    // Animated legs (running effect)
    ctx.fillStyle = '#2E7D32';
    ctx.fillRect(x + 8, y + 40 + bounce + runCycle, 8, 6);
    ctx.fillRect(x + 24, y + 40 + bounce - runCycle, 8, 6);

    // Eyes with shine
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + 12, y + 12 + bounce, 4, 0, Math.PI * 2);
    ctx.arc(x + 28, y + 12 + bounce, 4, 0, Math.PI * 2);
    ctx.fill();

    // Eye pupils
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(x + 13, y + 13 + bounce, 2, 0, Math.PI * 2);
    ctx.arc(x + 29, y + 13 + bounce, 2, 0, Math.PI * 2);
    ctx.fill();

    // Eye shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(x + 11, y + 11 + bounce, 1, 0, Math.PI * 2);
    ctx.arc(x + 27, y + 11 + bounce, 1, 0, Math.PI * 2);
    ctx.fill();

    // Enhanced smile with better curve
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(x + 20, y + 24 + bounce, 9, 0.3, Math.PI - 0.3);
    ctx.stroke();

    // Player energy aura glow
    if (gameStateRef.current.energy > 80) {
      const energyGlow = Math.sin(time * 2) * 0.3 + 0.7;
      ctx.shadowColor = '#4CAF50';
      ctx.shadowBlur = 20 * energyGlow;
      ctx.strokeStyle = `rgba(76, 175, 80, ${energyGlow})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x - 3, y - 3 + bounce, 46, 46, 10);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Combo multiplier visual indicator
    if (gameStateRef.current.combo > 5) {
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#FF4444';
      ctx.shadowBlur = 8;
      ctx.fillText('🔥', x + 20, y - 5 + Math.sin(time * 3) * 3);
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }, [createParticles]);

  const drawObstacle = (ctx: CanvasRenderingContext2D, obstacle: GameObject) => {
    const time = Date.now() * 0.005;
    const rotation = time + obstacle.x * 0.01;
    const pulse = Math.sin(time * 3) * 0.2 + 0.8;

    ctx.save();
    ctx.translate(obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2);

    // Enhanced shadow with depth
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(2, 6, obstacle.width/2 + 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Danger aura/glow ring
    const dangerGlow = ctx.createRadialGradient(0, 0, obstacle.width/2, 0, 0, obstacle.width/2 + 15);
    dangerGlow.addColorStop(0, 'rgba(255, 68, 68, 0)');
    dangerGlow.addColorStop(0.7, `rgba(255, 68, 68, ${0.3 * pulse})`);
    dangerGlow.addColorStop(1, 'rgba(255, 0, 0, 0)');
    ctx.fillStyle = dangerGlow;
    ctx.beginPath();
    ctx.arc(0, 0, obstacle.width/2 + 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.rotate(rotation);

    // Enhanced obstacle gradient with more depth
    const gradient = ctx.createRadialGradient(-5, -5, 0, 0, 0, obstacle.width/2 + 5);
    gradient.addColorStop(0, '#ff8888');
    gradient.addColorStop(0.3, '#ff6b6b');
    gradient.addColorStop(0.6, '#ee5a52');
    gradient.addColorStop(0.85, '#c92a2a');
    gradient.addColorStop(1, '#8b0000');

    ctx.fillStyle = gradient;
    ctx.shadowColor = '#ff4444';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(0, 0, obstacle.width/2, 0, Math.PI * 2);
    ctx.fill();

    // Core highlight
    ctx.fillStyle = 'rgba(255, 100, 100, 0.5)';
    ctx.beginPath();
    ctx.arc(-obstacle.width/6, -obstacle.width/6, obstacle.width/5, 0, Math.PI * 2);
    ctx.fill();

    // Enhanced spikes with gradients and depth
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + rotation * 0.5;
      const spikeLength = obstacle.width/2 + 8 + Math.sin(time * 2 + i) * 2;
      const spikeX = Math.cos(angle) * spikeLength;
      const spikeY = Math.sin(angle) * spikeLength;
      const baseX = Math.cos(angle) * (obstacle.width/2 - 2);
      const baseY = Math.sin(angle) * (obstacle.width/2 - 2);

      // Spike gradient
      const spikeGradient = ctx.createLinearGradient(baseX, baseY, spikeX, spikeY);
      spikeGradient.addColorStop(0, '#ff6b6b');
      spikeGradient.addColorStop(0.5, '#ff4444');
      spikeGradient.addColorStop(1, '#cc0000');

      ctx.fillStyle = spikeGradient;
      ctx.strokeStyle = '#990000';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      ctx.lineTo(spikeX, spikeY);
      const perpAngle = angle + Math.PI / 2;
      const width = 4;
      ctx.lineTo(
        baseX + Math.cos(perpAngle) * width,
        baseY + Math.sin(perpAngle) * width
      );
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Pulsing danger ring
    ctx.strokeStyle = `rgba(255, 136, 136, ${pulse})`;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 15 * pulse;
    ctx.shadowColor = '#ff4444';
    ctx.beginPath();
    ctx.arc(0, 0, obstacle.width/2 + 3, 0, Math.PI * 2);
    ctx.stroke();

    // Warning symbols rotating
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.save();
    ctx.rotate(-rotation * 2);
    ctx.fillText('⚠', 0, 0);
    ctx.restore();

    ctx.restore();
  };

  const drawCollectible = (ctx: CanvasRenderingContext2D, collectible: GameObject) => {
    const time = Date.now() * 0.01;
    const bounce = Math.sin(time + collectible.x * 0.1) * 3;
    const glow = Math.sin(time * 2) * 0.3 + 0.7;
    const rotate = time * 0.5;

    ctx.save();
    ctx.translate(collectible.x + collectible.width/2, collectible.y + collectible.height/2 + bounce);

    // AVAX token (new collectible type)
    if (collectible.type === 'token') {
      ctx.rotate(rotate);

      // AVAX red circle
      const avaxGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, collectible.width/2);
      avaxGradient.addColorStop(0, '#ff4444');
      avaxGradient.addColorStop(0.6, '#e84142');
      avaxGradient.addColorStop(1, '#cc3333');

      ctx.fillStyle = avaxGradient;
      ctx.shadowColor = '#ff4444';
      ctx.shadowBlur = 20 * glow;
      ctx.beginPath();
      ctx.arc(0, 0, collectible.width/2, 0, Math.PI * 2);
      ctx.fill();

      // White "A" symbol
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowBlur = 5;
      ctx.fillText('A', 0, 0);

      // Sparkle effect
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + rotate;
        const sparkX = Math.cos(angle) * (collectible.width/2 + 5);
        const sparkY = Math.sin(angle) * (collectible.width/2 + 5);
        ctx.fillStyle = `rgba(255, 255, 255, ${glow})`;
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;

    } else if (collectible.type === 'coin') {
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
    // Background themes based on level
    const themes = {
      space: {
        gradient: ['#0a0e27', '#1a1a3e', '#2a1a5e', '#1a0a3a'],
        glowColor: 'rgba(138, 43, 226, 0.15)',
        starColors: ['rgba(255, 255, 255, 0.4)', 'rgba(200, 200, 255, 0.7)', 'rgba(255, 255, 255, 1)'],
        nebulaColor: ['147, 51, 234', '79, 70, 229'],
        mountainColor: ['76, 175, 80', '56, 142, 60', '27, 94, 32'],
        hillColor: ['102, 187, 106', '76, 175, 80']
      },
      mountain: {
        gradient: ['#1a2a3a', '#2a3a4a', '#3a4a5a', '#2a3040'],
        glowColor: 'rgba(100, 150, 200, 0.15)',
        starColors: ['rgba(255, 255, 255, 0.3)', 'rgba(180, 200, 255, 0.6)', 'rgba(200, 220, 255, 1)'],
        nebulaColor: ['100, 150, 200', '60, 100, 150'],
        mountainColor: ['120, 120, 140', '90, 90, 110', '60, 60, 80'],
        hillColor: ['140, 140, 160', '120, 120, 140']
      },
      neon: {
        gradient: ['#0a001a', '#1a0033', '#2a0055', '#1a0033'],
        glowColor: 'rgba(255, 0, 255, 0.2)',
        starColors: ['rgba(255, 0, 255, 0.4)', 'rgba(0, 255, 255, 0.7)', 'rgba(255, 255, 0, 1)'],
        nebulaColor: ['255, 0, 255', '0, 255, 255'],
        mountainColor: ['255, 0, 255', '200, 0, 200', '150, 0, 150'],
        hillColor: ['0, 255, 255', '0, 200, 200']
      },
      forest: {
        gradient: ['#0a1a0a', '#1a2a1a', '#2a3a2a', '#1a2515'],
        glowColor: 'rgba(50, 200, 50, 0.15)',
        starColors: ['rgba(200, 255, 200, 0.3)', 'rgba(150, 255, 150, 0.6)', 'rgba(200, 255, 150, 1)'],
        nebulaColor: ['50, 200, 50', '30, 150, 30'],
        mountainColor: ['34, 139, 34', '25, 100, 25', '15, 70, 15'],
        hillColor: ['60, 179, 113', '46, 139, 87']
      },
      desert: {
        gradient: ['#2a1a0a', '#3a2515', '#4a3020', '#3a2010'],
        glowColor: 'rgba(255, 180, 50, 0.15)',
        starColors: ['rgba(255, 220, 180, 0.4)', 'rgba(255, 200, 150, 0.7)', 'rgba(255, 230, 180, 1)'],
        nebulaColor: ['255, 160, 50', '200, 120, 30'],
        mountainColor: ['210, 180, 140', '180, 140, 100', '150, 110, 70'],
        hillColor: ['222, 184, 135', '205, 170, 125']
      }
    };

    const theme = themes[backgroundTheme] || themes.space;

    // Enhanced gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, theme.gradient[0]);
    gradient.addColorStop(0.3, theme.gradient[1]);
    gradient.addColorStop(0.6, theme.gradient[2]);
    gradient.addColorStop(1, theme.gradient[3]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ambient glow effect at top
    const glowGradient = ctx.createRadialGradient(canvas.width / 2, 0, 0, canvas.width / 2, 0, canvas.height / 2);
    glowGradient.addColorStop(0, theme.glowColor);
    glowGradient.addColorStop(1, theme.glowColor.replace(/[\d.]+\)$/, '0)'));
    ctx.fillStyle = glowGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height / 2);

    // Multi-layer stars with parallax effect (theme-based colors)
    // Layer 1: Distant stars (slow moving)
    ctx.fillStyle = theme.starColors[0];
    for (let i = 0; i < 30; i++) {
      const x = ((i * 167.3 + backgroundOffset * 0.2) % (canvas.width + 100)) - 100;
      const y = (i * 89.7) % canvas.height;
      const size = (i % 2) + 0.5;
      const twinkle = Math.sin(Date.now() * 0.001 + i) * 0.3 + 0.7;

      ctx.globalAlpha = twinkle;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Layer 2: Medium stars
    ctx.fillStyle = theme.starColors[1];
    for (let i = 0; i < 40; i++) {
      const x = ((i * 123.5 + backgroundOffset * 0.5) % (canvas.width + 50)) - 50;
      const y = (i * 67.8) % canvas.height;
      const size = (i % 3) + 1;
      const twinkle = Math.sin(Date.now() * 0.002 + i * 2) * 0.4 + 0.6;

      ctx.globalAlpha = twinkle;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();

      // Star glow
      if (size > 1.5) {
        ctx.shadowColor = theme.starColors[1].replace(/[\d.]+\)$/, '0.5)');
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // Layer 3: Close bright stars (fast moving)
    ctx.fillStyle = theme.starColors[2];
    for (let i = 0; i < 20; i++) {
      const x = ((i * 97.3 + backgroundOffset * 0.8) % (canvas.width + 30)) - 30;
      const y = (i * 53.2) % canvas.height;
      const size = (i % 2) + 1.5;
      const twinkle = Math.sin(Date.now() * 0.003 + i * 3) * 0.3 + 0.7;

      ctx.globalAlpha = twinkle;
      ctx.shadowColor = theme.starColors[2].replace(/[\d.]+\)$/, '0.8)');
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // Nebula clouds (parallax layer 1)
    for (let i = 0; i < 3; i++) {
      const x = ((i * 300 + backgroundOffset * 0.15) % (canvas.width + 200)) - 200;
      const y = canvas.height * 0.3 + i * 80;

      const nebulaGradient = ctx.createRadialGradient(x, y, 0, x, y, 120);
      nebulaGradient.addColorStop(0, `rgba(147, 51, 234, 0.${2 + i})`);
      nebulaGradient.addColorStop(0.5, `rgba(79, 70, 229, 0.${1 + i})`);
      nebulaGradient.addColorStop(1, 'rgba(79, 70, 229, 0)');

      ctx.fillStyle = nebulaGradient;
      ctx.beginPath();
      ctx.arc(x, y, 120, 0, Math.PI * 2);
      ctx.fill();
    }

    // Distant mountains with gradient (parallax layer 2)
    const mountainGradient = ctx.createLinearGradient(0, canvas.height - 150, 0, canvas.height);
    mountainGradient.addColorStop(0, 'rgba(76, 175, 80, 0.4)');
    mountainGradient.addColorStop(0.7, 'rgba(56, 142, 60, 0.35)');
    mountainGradient.addColorStop(1, 'rgba(27, 94, 32, 0.3)');

    ctx.fillStyle = mountainGradient;
    ctx.beginPath();
    ctx.moveTo(-50, canvas.height);
    for (let x = 0; x < canvas.width + 50; x += 15) {
      const height = Math.sin((x + backgroundOffset * 0.3) * 0.008) * 60 +
                     Math.sin((x + backgroundOffset * 0.3) * 0.02) * 30 +
                     canvas.height - 120;
      ctx.lineTo(x, height);
    }
    ctx.lineTo(canvas.width + 50, canvas.height);
    ctx.closePath();
    ctx.fill();

    // Add mountain ridge highlight
    ctx.strokeStyle = 'rgba(76, 175, 80, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-50, canvas.height - 120);
    for (let x = 0; x < canvas.width + 50; x += 15) {
      const height = Math.sin((x + backgroundOffset * 0.3) * 0.008) * 60 +
                     Math.sin((x + backgroundOffset * 0.3) * 0.02) * 30 +
                     canvas.height - 120;
      ctx.lineTo(x, height);
    }
    ctx.stroke();

    // Closer hills (parallax layer 3)
    const hillGradient = ctx.createLinearGradient(0, canvas.height - 80, 0, canvas.height);
    hillGradient.addColorStop(0, 'rgba(102, 187, 106, 0.5)');
    hillGradient.addColorStop(1, 'rgba(76, 175, 80, 0.4)');

    ctx.fillStyle = hillGradient;
    ctx.beginPath();
    ctx.moveTo(-50, canvas.height);
    for (let x = 0; x < canvas.width + 50; x += 12) {
      const height = Math.sin((x + backgroundOffset * 0.6) * 0.015) * 40 + canvas.height - 80;
      ctx.lineTo(x, height);
    }
    ctx.lineTo(canvas.width + 50, canvas.height);
    ctx.closePath();
    ctx.fill();

    // Enhanced grid lines with perspective
    ctx.strokeStyle = 'rgba(76, 175, 80, 0.15)';
    ctx.lineWidth = 1;

    // Vertical grid lines with perspective
    for (let x = (backgroundOffset % 50); x < canvas.width; x += 50) {
      ctx.globalAlpha = 1 - (x / canvas.width) * 0.5; // Fade with distance
      ctx.beginPath();
      ctx.moveTo(x, canvas.height * 0.6);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Horizontal grid lines
    for (let y = canvas.height * 0.6; y < canvas.height; y += 30) {
      ctx.globalAlpha = 1 - ((y - canvas.height * 0.6) / (canvas.height * 0.4)) * 0.7;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }, [backgroundOffset, backgroundTheme]);

  // Draw level progression overlay
  const drawLevelProgression = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const currentScore = gameStateRef.current.score;
    const currentLevel = gameState.currentLevel;

    // Level thresholds for progression
    const levelThresholds = [
      { level: 1, scoreNeeded: 0, name: 'Beginner', theme: 'space' },
      { level: 2, scoreNeeded: 500, name: 'Novice', theme: 'mountain' },
      { level: 3, scoreNeeded: 1500, name: 'Adventurer', theme: 'forest' },
      { level: 4, scoreNeeded: 3000, name: 'Expert', theme: 'neon' },
      { level: 5, scoreNeeded: 5000, name: 'Master', theme: 'desert' },
      { level: 6, scoreNeeded: 8000, name: 'Legend', theme: 'space' },
      { level: 7, scoreNeeded: 12000, name: 'Champion', theme: 'mountain' },
      { level: 8, scoreNeeded: 18000, name: 'Elite', theme: 'neon' },
      { level: 9, scoreNeeded: 25000, name: 'Grandmaster', theme: 'forest' },
      { level: 10, scoreNeeded: 35000, name: 'Ultimate', theme: 'desert' }
    ];

    // Find current and next level
    let nextLevelData = levelThresholds.find(l => l.scoreNeeded > currentScore);
    if (!nextLevelData) nextLevelData = levelThresholds[levelThresholds.length - 1];

    const scoreToNext = nextLevelData.scoreNeeded - currentScore;
    const previousThreshold = levelThresholds.find(l => l.level === nextLevelData!.level - 1)?.scoreNeeded || 0;
    const progressToNext = ((currentScore - previousThreshold) / (nextLevelData.scoreNeeded - previousThreshold)) * 100;

    // Only show if not at max level
    if (currentScore < levelThresholds[levelThresholds.length - 1].scoreNeeded) {
      // Progress bar at bottom
      const barY = canvas.height - 45;
      const barWidth = canvas.width - 40;
      const barHeight = 30;

      // Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 10;
      ctx.fillRect(20, barY, barWidth, barHeight);

      // Progress bar
      const progressGradient = ctx.createLinearGradient(20, barY, 20 + barWidth, barY);
      progressGradient.addColorStop(0, '#4CAF50');
      progressGradient.addColorStop(0.5, '#8BC34A');
      progressGradient.addColorStop(1, '#CDDC39');

      ctx.fillStyle = progressGradient;
      ctx.fillRect(20, barY, (barWidth * progressToNext) / 100, barHeight);

      // Border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 0;
      ctx.strokeRect(20, barY, barWidth, barHeight);

      // Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 3;
      ctx.fillText(
        `Next: ${nextLevelData.name} (${scoreToNext} points needed) - ${Math.floor(progressToNext)}%`,
        canvas.width / 2,
        barY + 20
      );
      ctx.shadowBlur = 0;
      ctx.textAlign = 'left';
    } else {
      // Max level achieved
      const time = Date.now() * 0.003;
      const glow = Math.sin(time) * 0.5 + 0.5;

      ctx.fillStyle = `rgba(255, 215, 0, ${0.5 + glow * 0.3})`;
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 20 * glow;
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🏆 MAX LEVEL ACHIEVED! 🏆', canvas.width / 2, canvas.height - 30);
      ctx.shadowBlur = 0;
      ctx.textAlign = 'left';
    }
  }, [gameState.currentLevel]);

  // Draw achievement celebration
  const drawAchievementCelebration = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, message: string) => {
    const time = Date.now() * 0.003;
    const pulse = Math.sin(time * 3) * 0.2 + 0.8;
    const yOffset = Math.sin(time * 2) * 10;

    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Achievement banner
    const bannerWidth = 600;
    const bannerHeight = 150;
    const bannerX = (canvas.width - bannerWidth) / 2;
    const bannerY = (canvas.height - bannerHeight) / 2 + yOffset;

    // Banner background with gradient
    const bannerGradient = ctx.createLinearGradient(bannerX, bannerY, bannerX, bannerY + bannerHeight);
    bannerGradient.addColorStop(0, 'rgba(255, 68, 68, 0.95)'); // AVAX red
    bannerGradient.addColorStop(0.5, 'rgba(232, 65, 66, 0.95)');
    bannerGradient.addColorStop(1, 'rgba(204, 51, 51, 0.95)');

    ctx.fillStyle = bannerGradient;
    ctx.shadowColor = '#ff4444';
    ctx.shadowBlur = 30 * pulse;
    ctx.fillRect(bannerX, bannerY, bannerWidth, bannerHeight);

    // Border glow
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.shadowBlur = 40 * pulse;
    ctx.strokeRect(bannerX, bannerY, bannerWidth, bannerHeight);

    ctx.shadowBlur = 0;

    // Achievement icon
    ctx.font = '80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffdd00';
    ctx.shadowBlur = 20;
    ctx.fillText('🏆', canvas.width / 2, bannerY + 50);

    // Achievement text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 10;
    ctx.fillText(message, canvas.width / 2, bannerY + 110);

    // Confetti particles
    for (let i = 0; i < 20; i++) {
      const x = bannerX + Math.random() * bannerWidth;
      const y = bannerY + Math.random() * bannerHeight;
      const size = Math.random() * 8 + 4;
      const colors = ['#ffdd00', '#ff4444', '#4CAF50', '#2196F3', '#E91E63'];
      const color = colors[Math.floor(Math.random() * colors.length)];

      ctx.fillStyle = color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(x + Math.sin(time * 2 + i) * 20, y + Math.cos(time * 3 + i) * 20, size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;
    ctx.textAlign = 'left';
  }, []);

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
      const alpha = particle.life / particle.maxLife;
      ctx.globalAlpha = alpha;
      const currentSize = particle.size * alpha;

      if (particle.type === 'star') {
        // Star with glow
        ctx.fillStyle = particle.color;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 15 * alpha;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, currentSize, 0, Math.PI * 2);
        ctx.fill();

        // Star points
        ctx.shadowBlur = 20 * alpha;
        for (let i = 0; i < 5; i++) {
          const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
          const px = particle.x + Math.cos(angle) * currentSize * 1.5;
          const py = particle.y + Math.sin(angle) * currentSize * 1.5;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(px, py);
          ctx.strokeStyle = particle.color;
          ctx.lineWidth = currentSize / 3;
          ctx.stroke();
        }

      } else if (particle.type === 'spark') {
        // Spark/streak effect
        const gradient = ctx.createLinearGradient(
          particle.x - particle.vx * 0.3,
          particle.y - particle.vy * 0.3,
          particle.x,
          particle.y
        );
        gradient.addColorStop(0, particle.color + '00');
        gradient.addColorStop(1, particle.color);

        ctx.fillStyle = gradient;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 12 * alpha;
        ctx.beginPath();
        ctx.moveTo(particle.x - particle.vx * 0.5, particle.y - particle.vy * 0.5);
        ctx.lineTo(particle.x + particle.vx * 0.1, particle.y + particle.vy * 0.1 - currentSize);
        ctx.lineTo(particle.x, particle.y);
        ctx.lineTo(particle.x + particle.vx * 0.1, particle.y + particle.vy * 0.1 + currentSize);
        ctx.closePath();
        ctx.fill();

      } else if (particle.type === 'trail') {
        // Smooth trail with gradient
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, currentSize
        );
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(1, particle.color + '00');

        ctx.fillStyle = gradient;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 8 * alpha;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, currentSize, 0, Math.PI * 2);
        ctx.fill();

      } else {
        // Explosion particle with glow
        ctx.fillStyle = particle.color;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 10 * alpha;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, currentSize, 0, Math.PI * 2);
        ctx.fill();

        // Outer ring for explosion
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = currentSize / 2;
        ctx.globalAlpha = alpha * 0.5;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, currentSize * 1.5, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    });
  }, [particles]);

  // Enhanced game loop (will be defined at the end after all functions)

  const drawEnhancedUI = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const time = Date.now() * 0.001;

    // Main UI Background with enhanced gradient
    const uiGradient = ctx.createLinearGradient(10, 10, 10, 190);
    uiGradient.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
    uiGradient.addColorStop(1, 'rgba(20, 20, 40, 0.85)');
    ctx.fillStyle = uiGradient;
    ctx.shadowColor = 'rgba(76, 175, 80, 0.5)';
    ctx.shadowBlur = 15;
    ctx.fillRect(10, 10, 290, 195);

    // Animated border
    const borderGlow = Math.sin(time * 2) * 0.5 + 0.5;
    ctx.strokeStyle = `rgba(76, 175, 80, ${0.6 + borderGlow * 0.4})`;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 20;
    ctx.strokeRect(10, 10, 290, 195);
    ctx.shadowBlur = 0;

    // Corner decorations
    ctx.fillStyle = '#4CAF50';
    const cornerSize = 8;
    [
      [10, 10], [300, 10], [10, 205], [300, 205]
    ].forEach(([x, y]) => {
      ctx.fillRect(x - cornerSize/2, y - cornerSize/2, cornerSize, cornerSize);
    });

    // Score with enhanced glow effect and animation
    const scoreGlow = Math.sin(time * 3) * 0.3 + 0.7;
    ctx.shadowColor = '#ffdd00';
    ctx.shadowBlur = 20 * scoreGlow;

    // Score background
    const scoreGradient = ctx.createLinearGradient(15, 30, 15, 50);
    scoreGradient.addColorStop(0, 'rgba(255, 221, 0, 0.2)');
    scoreGradient.addColorStop(1, 'rgba(255, 221, 0, 0.05)');
    ctx.fillStyle = scoreGradient;
    ctx.fillRect(15, 20, 275, 35);

    ctx.fillStyle = '#ffdd00';
    ctx.font = 'bold 28px Arial';
    ctx.fillText(`SCORE: ${gameStateRef.current.score.toLocaleString()}`, 25, 45);

    // Combo display with animation
    if (gameStateRef.current.combo > 0) {
      const comboScale = 1 + Math.sin(time * 5) * 0.1;
      ctx.save();
      ctx.translate(200, 60);
      ctx.scale(comboScale, comboScale);

      ctx.shadowColor = '#ff4444';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#ff4444';
      ctx.font = 'bold 18px Arial';
      ctx.fillText(`${gameStateRef.current.combo}x COMBO!`, -50, 0);

      // Combo flame effect
      ctx.font = '16px Arial';
      ctx.fillText('🔥', -70, 0);
      ctx.restore();
    }

    ctx.shadowBlur = 0;

    // Lives with enhanced heart icons and glow
    ctx.font = '24px Arial';
    for (let i = 0; i < gameStateRef.current.lives; i++) {
      const heartBounce = Math.sin(time * 3 + i * 0.5) * 2;
      ctx.shadowColor = '#ff4444';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#ff4444';
      ctx.fillText('❤️', 25 + i * 30, 85 + heartBounce);
    }
    ctx.shadowBlur = 0;

    // Enhanced Energy bar with gradient and glow
    const energyBarY = 95;
    const energyBarWidth = 250;
    const energyBarHeight = 20;

    // Energy bar background with depth
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 5;
    ctx.fillRect(25, energyBarY, energyBarWidth, energyBarHeight);
    ctx.shadowBlur = 0;

    // Energy bar gradient
    const energyGradient = ctx.createLinearGradient(25, energyBarY, 25 + energyBarWidth, energyBarY);
    if (gameStateRef.current.energy > 75) {
      energyGradient.addColorStop(0, '#00ff00');
      energyGradient.addColorStop(1, '#88ff00');
    } else if (gameStateRef.current.energy > 50) {
      energyGradient.addColorStop(0, '#ffff00');
      energyGradient.addColorStop(1, '#ffaa00');
    } else if (gameStateRef.current.energy > 25) {
      energyGradient.addColorStop(0, '#ffaa00');
      energyGradient.addColorStop(1, '#ff6600');
    } else {
      energyGradient.addColorStop(0, '#ff6600');
      energyGradient.addColorStop(1, '#ff0000');
    }

    // Animated energy bar
    const energyWidth = (gameStateRef.current.energy / 100) * energyBarWidth;
    ctx.fillStyle = energyGradient;
    ctx.shadowColor = gameStateRef.current.energy > 50 ? '#00ff00' : '#ff6600';
    ctx.shadowBlur = 10;
    ctx.fillRect(25, energyBarY, energyWidth, energyBarHeight);

    // Energy bar shimmer effect
    const shimmerX = (time % 2) / 2;
    const shimmerGradient = ctx.createLinearGradient(
      25 + energyWidth * shimmerX,
      energyBarY,
      25 + energyWidth * shimmerX + 30,
      energyBarY
    );
    shimmerGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    shimmerGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
    shimmerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = shimmerGradient;
    ctx.fillRect(25, energyBarY, energyWidth, energyBarHeight);

    ctx.shadowBlur = 0;

    // Energy bar border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(25, energyBarY, energyBarWidth, energyBarHeight);

    // Energy text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 3;
    ctx.fillText(`ENERGY: ${gameStateRef.current.energy}%`, 30, energyBarY + 14);
    ctx.shadowBlur = 0;

    // Level indicator with badge design
    const levelBadgeX = 25;
    const levelBadgeY = 125;

    ctx.fillStyle = 'rgba(76, 175, 80, 0.3)';
    ctx.shadowColor = '#4CAF50';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(levelBadgeX + 30, levelBadgeY + 10, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(gameState.currentLevel.toString(), levelBadgeX + 30, levelBadgeY + 16);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#4CAF50';
    ctx.font = 'bold 18px Arial';
    ctx.shadowBlur = 0;
    ctx.fillText('LEVEL', levelBadgeX + 60, levelBadgeY + 15);

    // Active Power-ups Display with icons and animation
    let powerupY = 155;
    const powerupIcons = {
      shield: { emoji: '🛡️', color: '#4CAF50', name: 'SHIELD' },
      speed: { emoji: '⚡', color: '#FF9800', name: 'SPEED' },
      magnet: { emoji: '🧲', color: '#9C27B0', name: 'MAGNET' },
      multiplier: { emoji: '×2', color: '#E91E63', name: 'MULTI' },
      invincible: { emoji: '⭐', color: '#FFD700', name: 'STAR' },
      slowmo: { emoji: '⏰', color: '#2196F3', name: 'SLOW' }
    };

    let powerupIndex = 0;
    Object.keys(gameStateRef.current.activePowerups).forEach(key => {
      const powerup = gameStateRef.current.activePowerups[key as keyof typeof gameStateRef.current.activePowerups];
      if (powerup.active && powerup.timeLeft > 0) {
        const icon = powerupIcons[key as keyof typeof powerupIcons];
        const powerupGlow = Math.sin(time * 4 + powerupIndex) * 0.3 + 0.7;

        // Powerup background
        ctx.fillStyle = `rgba(${icon.color === '#4CAF50' ? '76,175,80' :
                               icon.color === '#FF9800' ? '255,152,0' :
                               icon.color === '#9C27B0' ? '156,39,176' :
                               icon.color === '#E91E63' ? '233,30,99' :
                               icon.color === '#FFD700' ? '255,215,0' : '33,150,243'}, 0.2)`;
        ctx.shadowColor = icon.color;
        ctx.shadowBlur = 10 * powerupGlow;
        ctx.fillRect(20 + powerupIndex * 85, powerupY, 80, 30);

        ctx.fillStyle = icon.color;
        ctx.font = 'bold 16px Arial';
        ctx.fillText(icon.emoji, 25 + powerupIndex * 85, powerupY + 20);

        ctx.font = 'bold 12px Arial';
        ctx.fillText(`${Math.ceil(powerup.timeLeft / 60)}s`, 50 + powerupIndex * 85, powerupY + 20);

        powerupIndex++;
      }
    });
    ctx.shadowBlur = 0;

    // Special Abilities Panel (Right side) with enhanced design
    const abilityPanelX = canvas.width - 210;
    const abilityGradient = ctx.createLinearGradient(abilityPanelX, 10, abilityPanelX, 140);
    abilityGradient.addColorStop(0, 'rgba(20, 0, 40, 0.9)');
    abilityGradient.addColorStop(1, 'rgba(50, 20, 80, 0.9)');

    ctx.fillStyle = abilityGradient;
    ctx.shadowColor = 'rgba(156, 39, 176, 0.6)';
    ctx.shadowBlur = 20;
    ctx.fillRect(abilityPanelX, 10, 200, 140);

    const abilityBorderGlow = Math.sin(time * 2.5) * 0.4 + 0.6;
    ctx.strokeStyle = `rgba(156, 39, 176, ${abilityBorderGlow})`;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 25;
    ctx.strokeRect(abilityPanelX, 10, 200, 140);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#E91E63';
    ctx.font = 'bold 18px Arial';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 5;
    ctx.fillText('⚡ SPECIAL ABILITIES', abilityPanelX + 10, 32);
    ctx.shadowBlur = 0;

    // Abilities with enhanced visuals
    const abilities = [
      { key: 'dash', color: '#4CAF50', label: 'Q - DASH', icon: '💨' },
      { key: 'timeFreeze', color: '#2196F3', label: 'E - TIME FREEZE', icon: '❄️' },
      { key: 'megaCollect', color: '#FF9800', label: 'R - MEGA COLLECT', icon: '💎' }
    ];

    abilities.forEach((ability, index) => {
      const abilityKey = ability.key as keyof typeof gameStateRef.current.specialAbilities;
      const isReady = gameStateRef.current.specialAbilities[abilityKey].cooldown === 0;
      const y = 55 + index * 28;

      // Ability background
      ctx.fillStyle = isReady ? `${ability.color}33` : 'rgba(50, 50, 50, 0.3)';
      ctx.fillRect(abilityPanelX + 5, y - 15, 190, 24);

      if (isReady) {
        const abilityGlow = Math.sin(time * 4 + index) * 0.3 + 0.7;
        ctx.shadowColor = ability.color;
        ctx.shadowBlur = 15 * abilityGlow;
      }

      ctx.fillStyle = isReady ? ability.color : '#666666';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(ability.icon, abilityPanelX + 10, y);

      ctx.font = 'bold 12px Arial';
      const cooldownText = isReady ? 'READY ✓' : `${Math.ceil(gameStateRef.current.specialAbilities[abilityKey].cooldown / 60)}s`;
      ctx.fillText(`${ability.label.split(' - ')[1]}: ${cooldownText}`, abilityPanelX + 32, y);
      ctx.shadowBlur = 0;
    });

    // Streak counter with flame animation
    if (gameStateRef.current.streakCount > 0) {
      const streakGlow = Math.sin(time * 6) * 0.4 + 0.6;
      ctx.fillStyle = 'rgba(233, 30, 99, 0.3)';
      ctx.shadowColor = '#E91E63';
      ctx.shadowBlur = 20 * streakGlow;
      ctx.fillRect(abilityPanelX + 5, 125, 190, 22);

      ctx.fillStyle = '#E91E63';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`🔥 STREAK: ${gameStateRef.current.streakCount}`, abilityPanelX + 15, 140);
      ctx.shadowBlur = 0;
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

    // Generate collectibles with variety including AVAX tokens
    if (now - gameStateRef.current.lastCollectibleTime > 2500) {
      const rand = Math.random();
      let type = 'coin';
      if (rand > 0.9) type = 'token'; // AVAX token - rare!
      else if (rand > 0.8) type = 'energy';
      else if (rand > 0.95) type = 'gem'; // Very rare gem

      gameStateRef.current.collectibles.push({
        x: canvas.width,
        y: Math.random() * (canvas.height - 150) + 50,
        width: type === 'gem' ? 25 : type === 'token' ? 22 : 20,
        height: type === 'gem' ? 25 : type === 'token' ? 22 : 20,
        speed: gameSpeed + 1,
        type,
        animation: 0,
        value: type === 'token' ? 100 : type === 'gem' ? 50 : type === 'energy' ? 0 : 10
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

    // Handle special ability inputs with enhanced visual feedback
    if (keys['q'] && gameStateRef.current.specialAbilities.dash.cooldown === 0) {
      // Dash ability - quick movement boost
      newPlayerPosition.x = Math.min(canvas.width - 60, newPlayerPosition.x + 100);
      gameStateRef.current.specialAbilities.dash.cooldown = gameStateRef.current.specialAbilities.dash.maxCooldown;

      // Dash trail effect
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          createParticles(
            newPlayerPosition.x - i * 20,
            newPlayerPosition.y + 20,
            'power',
            4
          );
        }, i * 20);
      }
    }

    if (keys['e'] && gameStateRef.current.specialAbilities.timeFreeze.cooldown === 0) {
      // Time freeze - slow down obstacles temporarily
      gameStateRef.current.specialAbilities.timeFreeze.cooldown = gameStateRef.current.specialAbilities.timeFreeze.maxCooldown;
      // Apply slow motion effect to obstacles for 3 seconds
      gameStateRef.current.activePowerups.slowmo.active = true;
      gameStateRef.current.activePowerups.slowmo.timeLeft = 180; // 3 seconds

      // Time freeze visual effect - expanding ice ring
      for (let radius = 50; radius < 200; radius += 30) {
        const particleCount = Math.floor(radius / 10);
        setTimeout(() => {
          for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            createParticles(
              newPlayerPosition.x + 20 + Math.cos(angle) * radius,
              newPlayerPosition.y + 20 + Math.sin(angle) * radius,
              'power',
              1
            );
          }
        }, (radius - 50) * 2);
      }
    }

    if (keys['r'] && gameStateRef.current.specialAbilities.megaCollect.cooldown === 0) {
      // Mega collect - attract all nearby collectibles
      gameStateRef.current.specialAbilities.megaCollect.cooldown = gameStateRef.current.specialAbilities.megaCollect.maxCooldown;
      gameStateRef.current.activePowerups.magnet.active = true;
      gameStateRef.current.activePowerups.magnet.timeLeft = 300; // 5 seconds

      // Magnet activation visual - pulsing rings
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          const particleCount = 24;
          for (let j = 0; j < particleCount; j++) {
            const angle = (j / particleCount) * Math.PI * 2;
            createParticles(
              newPlayerPosition.x + 20 + Math.cos(angle) * (50 + i * 30),
              newPlayerPosition.y + 20 + Math.sin(angle) * (50 + i * 30),
              'collect',
              1
            );
          }
        }, i * 100);
      }
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
        // Create enhanced collection particles with burst effect
        createParticles(collectible.x + collectible.width/2, collectible.y + collectible.height/2, 'collect', 10);

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

          // Visual feedback for coin collection
          if (gameStateRef.current.combo > 3) {
            createParticles(newPlayerPosition.x + 20, newPlayerPosition.y, 'power', 5);
          }

        } else if (collectible.type === 'energy') {
          gameStateRef.current.energy = Math.min(100, gameStateRef.current.energy + 25);
          // Energy restoration visual effect
          createParticles(newPlayerPosition.x + 20, newPlayerPosition.y + 20, 'power', 8);

          // Create healing ring effect
          for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            createParticles(
              newPlayerPosition.x + 20 + Math.cos(angle) * 20,
              newPlayerPosition.y + 20 + Math.sin(angle) * 20,
              'power',
              1
            );
          }

        } else if (collectible.type === 'token') {
          // AVAX token - super rare and valuable!
          let points = 100 + gameStateRef.current.combo * 10;

          if (gameStateRef.current.activePowerups.multiplier.active) {
            points *= gameStateRef.current.activePowerups.multiplier.value;
          }

          gameStateRef.current.score += Math.floor(points);
          gameStateRef.current.combo += 5; // Huge combo boost!
          gameStateRef.current.comboTimer = 600; // Even longer combo time
          gameStateRef.current.streakCount += 3;
          onScoreUpdate(gameStateRef.current.score);

          // Epic AVAX collection effect - red particles!
          for (let i = 0; i < 30; i++) {
            const angle = (i / 30) * Math.PI * 2;
            const speed = 5 + Math.random() * 5;
            setTimeout(() => {
              createParticles(
                collectible.x + collectible.width/2 + Math.cos(angle) * 20,
                collectible.y + collectible.height/2 + Math.sin(angle) * 20,
                'explosion',
                2
              );
            }, i * 10);
          }

          // Center burst
          createParticles(collectible.x + collectible.width/2, collectible.y + collectible.height/2, 'power', 25);

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

          // Special gem collection explosion effect
          createParticles(collectible.x + collectible.width/2, collectible.y + collectible.height/2, 'power', 20);

          // Create multi-layer explosion
          setTimeout(() => {
            createParticles(collectible.x + collectible.width/2, collectible.y + collectible.height/2, 'collect', 15);
          }, 50);
          setTimeout(() => {
            createParticles(collectible.x + collectible.width/2, collectible.y + collectible.height/2, 'power', 10);
          }, 100);
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

    // Draw level progression
    drawLevelProgression(ctx, canvas);

    // Draw achievement celebration if active
    if (showAchievement) {
      drawAchievementCelebration(ctx, canvas, showAchievement);
    }

    // Check for achievement milestones
    const currentScore = gameStateRef.current.score;
    if (currentScore === 1000 && !showAchievement) {
      setShowAchievement('AVAX COLLECTOR! 🎯');
      setAchievementTimer(180); // Show for 3 seconds
    } else if (currentScore === 5000 && !showAchievement) {
      setShowAchievement('AVALANCHE MASTER! ⛰️');
      setAchievementTimer(180);
    } else if (currentScore === 10000 && !showAchievement) {
      setShowAchievement('LEGENDARY CHAMPION! 👑');
      setAchievementTimer(180);
    } else if (gameStateRef.current.combo >= 10 && !showAchievement) {
      setShowAchievement('COMBO KING! 🔥');
      setAchievementTimer(120);
    }

    // Update achievement timer
    if (achievementTimer > 0) {
      setAchievementTimer(prev => prev - 1);
      if (achievementTimer === 1) {
        setShowAchievement(null);
      }
    }

    // Increase game speed over time
    if (gameStateRef.current.score > 0 && gameStateRef.current.score % 100 === 0) {
      setGameSpeed(prev => Math.min(prev + 0.05, 6));
    }

    // Level up check
    const levelThresholds = [0, 500, 1500, 3000, 5000, 8000, 12000, 18000, 25000, 35000];
    const newLevel = levelThresholds.findIndex((threshold, idx) => {
      const nextThreshold = levelThresholds[idx + 1];
      return currentScore >= threshold && (nextThreshold === undefined || currentScore < nextThreshold);
    }) + 1;

    if (newLevel > gameState.currentLevel && newLevel <= 10) {
      onLevelComplete(newLevel);
    }

    // Continue game loop
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.isPlaying, gameState.currentLevel, isPaused, playerPosition, keys, gameSpeed, createParticles, onScoreUpdate, onLevelComplete, selectedCharacter, drawBackground, drawEnhancedUI, drawLevelProgression, drawAchievementCelebration, drawParticles, drawPlayer, endGame, showAchievement, achievementTimer]);

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
            className="absolute top-4 right-4 bg-black/80 text-white p-4 rounded-lg backdrop-blur-sm border border-red-400/30 max-w-xs"
          >
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-red-400/30">
              <span className="text-2xl">⛰️</span>
              <span className="text-red-400 font-bold">AVALANCHE RUSH</span>
            </div>
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-green-400">🎮</span>
                <span>WASD or Arrow Keys to move</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">🪙</span>
                <span>Coins: +10 points</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-400 font-bold">A</span>
                <span>AVAX Tokens: +100 points!</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-400">💎</span>
                <span>Energy crystals restore health</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-400">💎</span>
                <span>Rare gems: +50 points</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-400">⚠️</span>
                <span>Avoid spinning obstacles</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-orange-400">⚡</span>
                <span>Power-ups boost performance</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-400">🔥</span>
                <span>Build combos for bonuses!</span>
              </div>
              <div className="border-t border-gray-600 pt-2 mt-2">
                <div className="text-xs text-gray-400 mb-1">Special Abilities:</div>
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