// src/components/audio/AudioEnhancedGameEngine.tsx
import React, { forwardRef, useRef, useState, useEffect, useCallback } from 'react';
import { useAudioManager } from '../../hooks/useAudioManager';

interface GameObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'obstacle' | 'collectible' | 'powerup';
  subtype?: string;
  value?: number;
  animation?: number;
}

interface AudioEnhancedGameEngineProps {
  gameState: {
    isPlaying: boolean;
    isPaused: boolean;
    currentLevel: number;
    score: number;
    lives: number;
    energy: number;
    gameMode: string;
  };
  onScoreUpdate: (score: number) => void;
  onGameEnd: () => void;
  onLevelComplete: (level: number) => void;
}

interface AudioEnhancedGameEngineRef {
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
}

const AudioEnhancedGameEngine = forwardRef<AudioEnhancedGameEngineRef, AudioEnhancedGameEngineProps>(({
  gameState,
  onScoreUpdate,
  onGameEnd,
  onLevelComplete
}, ref) => {
  const audioManager = useAudioManager();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  
  const [playerPosition, setPlayerPosition] = useState({ x: 100, y: 300 });
  const [keys, setKeys] = useState<{ [key: string]: boolean }>({});
  const [gameSpeed, setGameSpeed] = useState(2);
  const [particles, setParticles] = useState<Array<{id: number; x: number; y: number; vx: number; vy: number; life: number; color: string}>>([]);
  const [backgroundOffset, setBackgroundOffset] = useState(0);
  
  // Enhanced game state with audio tracking
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
    lastSoundTime: 0, // Prevent audio spam
    consecutiveJumps: 0,
    lastJumpTime: 0
  });

  // Audio event handlers
  const playJumpSound = useCallback(() => {
    const now = Date.now();
    if (now - gameStateRef.current.lastJumpTime < 100) return; // Prevent spam
    
    gameStateRef.current.lastJumpTime = now;
    gameStateRef.current.consecutiveJumps++;
    
    // Different jump sounds based on consecutive jumps
    if (gameStateRef.current.consecutiveJumps >= 3) {
      audioManager.playSound('dash');
    } else {
      audioManager.playSound('jump');
    }
  }, [audioManager]);

  const playLandSound = useCallback(() => {
    audioManager.playSound('land');
    gameStateRef.current.consecutiveJumps = 0;
  }, [audioManager]);

  const playCollectSound = useCallback((type: string, value: number) => {
    const now = Date.now();
    if (now - gameStateRef.current.lastSoundTime < 50) return; // Prevent spam
    
    gameStateRef.current.lastSoundTime = now;
    
    switch (type) {
      case 'coin':
        audioManager.onCoinCollect(value);
        break;
      case 'gem':
        audioManager.playSound('gemCollect');
        break;
      case 'rush':
        audioManager.playSound('rushTokenCollect');
        break;
      case 'powerup':
        audioManager.onPowerupCollect('default');
        break;
      default:
        audioManager.playSound('coinCollect');
    }
  }, [audioManager]);

  const playHitSound = useCallback(() => {
    audioManager.onObstacleHit();
    
    // Play different hit sounds based on obstacle type
    const obstacleTypes: ('iceBreak' | 'avalancheCrash' | 'obstacleHit')[] = ['iceBreak', 'avalancheCrash', 'obstacleHit'];
    audioManager.playRandomSound(obstacleTypes);
  }, [audioManager]);

  const playComboSound = useCallback(() => {
    if (gameStateRef.current.combo >= 5) {
      audioManager.playSound('combo');
    }
    if (gameStateRef.current.combo >= 10) {
      audioManager.playSound('perfect');
    }
  }, [audioManager]);

  // Enhanced collision detection with audio
  const checkCollisions = useCallback(() => {
    const player = {
      x: playerPosition.x,
      y: playerPosition.y,
      width: 40,
      height: 60
    };

    // Check collectible collisions
    gameStateRef.current.collectibles.forEach((collectible, index) => {
      if (
        player.x < collectible.x + collectible.width &&
        player.x + player.width > collectible.x &&
        player.y < collectible.y + collectible.height &&
        player.y + player.height > collectible.y
      ) {
        // Remove collectible
        gameStateRef.current.collectibles.splice(index, 1);
        
        // Update score
        const value = collectible.value || 10;
        gameStateRef.current.score += value;
        onScoreUpdate(gameStateRef.current.score);
        
        // Play collect sound
        playCollectSound(collectible.subtype || 'coin', value);
        
        // Update combo
        gameStateRef.current.combo++;
        gameStateRef.current.comboTimer = 300; // 5 seconds at 60fps
        
        // Play combo sound if applicable
        playComboSound();
        
        // Create particles
        createParticles(collectible.x, collectible.y, 'collect');
      }
    });

    // Check obstacle collisions
    if (!gameStateRef.current.invulnerable) {
      gameStateRef.current.obstacles.forEach((obstacle) => {
        if (
          player.x < obstacle.x + obstacle.width &&
          player.x + player.width > obstacle.x &&
          player.y < obstacle.y + obstacle.height &&
          player.y + player.height > obstacle.y
        ) {
          // Player hit obstacle
          gameStateRef.current.lives--;
          gameStateRef.current.invulnerable = true;
          gameStateRef.current.invulnerableTime = 120; // 2 seconds at 60fps
          gameStateRef.current.combo = 0;
          
          // Play hit sound
          playHitSound();
          
          // Create particles
          createParticles(player.x, player.y, 'hit');
          
          if (gameStateRef.current.lives <= 0) {
            endGame();
          }
        }
      });
    }

    // Check powerup collisions
    gameStateRef.current.powerups.forEach((powerup, index) => {
      if (
        player.x < powerup.x + powerup.width &&
        player.x + player.width > powerup.x &&
        player.y < powerup.y + powerup.height &&
        player.y + player.height > powerup.y
      ) {
        // Remove powerup
        gameStateRef.current.powerups.splice(index, 1);
        
        // Apply powerup effect
        applyPowerup(powerup.subtype || 'default');
        
        // Play powerup sound
        audioManager.onPowerupCollect(powerup.subtype || 'default');
        
        // Create particles
        createParticles(powerup.x, powerup.y, 'powerup');
      }
    });
  }, [playerPosition, onScoreUpdate, playCollectSound, playHitSound, playComboSound, audioManager]);

  // Apply powerup effects
  const applyPowerup = useCallback((type: string) => {
    switch (type) {
      case 'shield':
        gameStateRef.current.invulnerable = true;
        gameStateRef.current.invulnerableTime = 300; // 5 seconds
        break;
      case 'speed':
        setGameSpeed(prev => Math.min(prev + 1, 5));
        break;
      case 'energy':
        gameStateRef.current.energy = Math.min(gameStateRef.current.energy + 50, 100);
        break;
      case 'magnet':
        // Attract nearby collectibles
        gameStateRef.current.collectibles.forEach(collectible => {
          const dx = playerPosition.x - collectible.x;
          const dy = playerPosition.y - collectible.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            collectible.x += dx * 0.1;
            collectible.y += dy * 0.1;
          }
        });
        break;
    }
  }, [playerPosition]);

  // Create particle effects
  const createParticles = useCallback((x: number, y: number, type: string) => {
    const particleCount = type === 'hit' ? 15 : 8;
    const newParticles = [];
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: Math.random().toString(36).substr(2, 9),
        x: x + Math.random() * 20 - 10,
        y: y + Math.random() * 20 - 10,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 60,
        maxLife: 60,
        type: type,
        color: type === 'hit' ? '#ff4444' : type === 'powerup' ? '#44ff44' : '#ffaa00'
      });
    }
    
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  // Enhanced game loop with audio integration
  const gameLoop = useCallback(() => {
    if (!gameState.isPlaying || gameState.isPaused) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Update game state
    gameStateRef.current.playerAnimation += 0.2;
    
    // Handle invulnerability
    if (gameStateRef.current.invulnerable) {
      gameStateRef.current.invulnerableTime--;
      if (gameStateRef.current.invulnerableTime <= 0) {
        gameStateRef.current.invulnerable = false;
      }
    }
    
    // Handle combo timer
    if (gameStateRef.current.comboTimer > 0) {
      gameStateRef.current.comboTimer--;
      if (gameStateRef.current.comboTimer <= 0) {
        gameStateRef.current.combo = 0;
      }
    }

    // Handle player movement with audio
    if (keys[' '] || keys['ArrowUp']) {
      if (playerPosition.y >= 250) {
        setPlayerPosition(prev => ({ ...prev, y: prev.y - 8 }));
        playJumpSound();
      }
    } else {
      if (playerPosition.y < 300) {
        setPlayerPosition(prev => ({ ...prev, y: prev.y + 4 }));
        if (playerPosition.y >= 300) {
          playLandSound();
        }
      }
    }

    // Move obstacles and check for level progression
    gameStateRef.current.obstacles.forEach(obstacle => {
      obstacle.x -= gameSpeed;
    });

    gameStateRef.current.collectibles.forEach(collectible => {
      collectible.x -= gameSpeed;
    });

    gameStateRef.current.powerups.forEach(powerup => {
      powerup.x -= gameSpeed;
    });

    // Remove off-screen objects
    gameStateRef.current.obstacles = gameStateRef.current.obstacles.filter(obj => obj.x > -50);
    gameStateRef.current.collectibles = gameStateRef.current.collectibles.filter(obj => obj.x > -50);
    gameStateRef.current.powerups = gameStateRef.current.powerups.filter(obj => obj.x > -50);

    // Spawn new objects
    const now = Date.now();
    if (now - gameStateRef.current.lastObstacleTime > 2000) {
      gameStateRef.current.obstacles.push({
        id: Math.random().toString(36).substr(2, 9),
        x: canvas.width,
        y: 320,
        width: 30,
        height: 40,
        type: 'obstacle',
        subtype: 'ice'
      });
      gameStateRef.current.lastObstacleTime = now;
    }

    if (now - gameStateRef.current.lastCollectibleTime > 1000) {
      gameStateRef.current.collectibles.push({
        id: Math.random().toString(36).substr(2, 9),
        x: canvas.width,
        y: 280,
        width: 20,
        height: 20,
        type: 'collectible',
        subtype: 'coin',
        value: Math.floor(Math.random() * 50) + 10
      });
      gameStateRef.current.lastCollectibleTime = now;
    }

    if (now - gameStateRef.current.lastPowerupTime > 8000) {
      const powerupTypes = ['shield', 'speed', 'energy', 'magnet'];
      gameStateRef.current.powerups.push({
        id: Math.random().toString(36).substr(2, 9),
        x: canvas.width,
        y: 250,
        width: 25,
        height: 25,
        type: 'powerup',
        subtype: powerupTypes[Math.floor(Math.random() * powerupTypes.length)]
      });
      gameStateRef.current.lastPowerupTime = now;
    }

    // Check collisions
    checkCollisions();

    // Update particles
    setParticles(prev => 
      prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        life: particle.life - 1,
        vy: particle.vy + 0.1 // gravity
      })).filter(particle => particle.life > 0)
    );

    // Update background
    setBackgroundOffset(prev => prev + gameSpeed);

    // Check for level completion
    if (gameStateRef.current.score > gameState.currentLevel * 1000) {
      onLevelComplete(gameState.currentLevel);
      audioManager.onLevelComplete(gameState.currentLevel);
    }

    // Render game
    renderGame(ctx, canvas);

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [
    gameState.isPlaying,
    gameState.isPaused,
    gameState.currentLevel,
    keys,
    playerPosition,
    gameSpeed,
    checkCollisions,
    playJumpSound,
    playLandSound,
    onLevelComplete,
    audioManager
  ]);

  // Render game with enhanced visuals
  const renderGame = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = '#1e293b';
    for (let i = 0; i < canvas.width + 50; i += 50) {
      ctx.fillRect(i - (backgroundOffset % 50), canvas.height - 100, 50, 100);
    }

    // Draw player
    ctx.fillStyle = gameStateRef.current.invulnerable ? '#ff6b6b' : '#3b82f6';
    ctx.fillRect(playerPosition.x, playerPosition.y, 40, 60);

    // Draw obstacles
    ctx.fillStyle = '#64748b';
    gameStateRef.current.obstacles.forEach(obstacle => {
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Draw collectibles
    ctx.fillStyle = '#fbbf24';
    gameStateRef.current.collectibles.forEach(collectible => {
      ctx.beginPath();
      ctx.arc(collectible.x + 10, collectible.y + 10, 10, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw powerups
    gameStateRef.current.powerups.forEach(powerup => {
      ctx.fillStyle = '#10b981';
      ctx.fillRect(powerup.x, powerup.y, powerup.width, powerup.height);
    });

    // Draw particles
    particles.forEach(particle => {
      const maxLife = (particle as any).maxLife || 60; // Add maxLife fallback
      const alpha = particle.life / maxLife;
      ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.fillRect(particle.x, particle.y, 4, 4);
    });

    // Draw UI
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`Score: ${gameStateRef.current.score}`, 20, 40);
    ctx.fillText(`Lives: ${gameStateRef.current.lives}`, 20, 70);
    ctx.fillText(`Combo: ${gameStateRef.current.combo}`, 20, 100);
  }, [playerPosition, backgroundOffset, particles]);

  // Game control methods
  const startGame = useCallback(() => {
    gameStateRef.current = {
      score: 0,
      lives: 3,
      energy: 100,
      isRunning: true,
      obstacles: [],
      collectibles: [],
      powerups: [],
      lastObstacleTime: 0,
      lastCollectibleTime: 0,
      lastPowerupTime: 0,
      playerAnimation: 0,
      invulnerable: false,
      invulnerableTime: 0,
      combo: 0,
      comboTimer: 0,
      lastSoundTime: 0,
      consecutiveJumps: 0,
      lastJumpTime: 0
    };
    
    setGameSpeed(2);
    setParticles([]);
    setBackgroundOffset(0);
    setPlayerPosition({ x: 100, y: 300 });
    
    // Play game start sound
    audioManager.onGameStart();
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop, audioManager]);

  const pauseGame = useCallback(() => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    audioManager.pauseBackgroundMusic();
  }, [audioManager]);

  const resumeGame = useCallback(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    audioManager.resumeBackgroundMusic();
  }, [gameLoop, audioManager]);

  const endGame = useCallback(() => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    
    gameStateRef.current.isRunning = false;
    
    // Play game end sound
    audioManager.onGameEnd();
    
    onGameEnd();
  }, [audioManager, onGameEnd]);

  // Expose methods via ref
  React.useImperativeHandle(ref, () => ({
    startGame,
    pauseGame,
    resumeGame,
    endGame
  }));

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => ({ ...prev, [e.key]: true }));
      
      // Play button click sound for UI interactions
      if (e.key === 'Escape') {
        audioManager.playSound('buttonClick');
      }
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
  }, [audioManager]);

  // Initialize game
  useEffect(() => {
    if (gameState.isPlaying && !gameStateRef.current.isRunning) {
      startGame();
    }
  }, [gameState.isPlaying, startGame]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={400}
      className="border border-gray-700 rounded-lg bg-slate-900"
      style={{ display: 'block', margin: '0 auto' }}
    />
  );
});

AudioEnhancedGameEngine.displayName = 'AudioEnhancedGameEngine';

export default AudioEnhancedGameEngine;
