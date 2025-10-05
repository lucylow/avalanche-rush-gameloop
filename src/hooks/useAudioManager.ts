// src/hooks/useAudioManager.ts
import { useState, useEffect, useRef, useCallback } from 'react';

// Audio file paths - these would be actual audio files in production
const AUDIO_FILES = {
  // Background Music
  backgroundMusic: {
    menu: '/audio/music/menu-theme.mp3',
    gameplay: '/audio/music/gameplay-theme.mp3',
    victory: '/audio/music/victory-theme.mp3',
    defeat: '/audio/music/defeat-theme.mp3',
    avalanche: '/audio/music/avalanche-theme.mp3'
  },
  
  // Game Sound Effects
  gameSounds: {
    // Player Actions
    jump: '/audio/sfx/jump.mp3',
    land: '/audio/sfx/land.mp3',
    slide: '/audio/sfx/slide.mp3',
    dash: '/audio/sfx/dash.mp3',
    
    // Collectibles
    coinCollect: '/audio/sfx/coin-collect.mp3',
    powerupCollect: '/audio/sfx/powerup-collect.mp3',
    gemCollect: '/audio/sfx/gem-collect.mp3',
    rushTokenCollect: '/audio/sfx/rush-token-collect.mp3',
    
    // Obstacles & Hazards
    obstacleHit: '/audio/sfx/obstacle-hit.mp3',
    avalancheWarning: '/audio/sfx/avalanche-warning.mp3',
    avalancheCrash: '/audio/sfx/avalanche-crash.mp3',
    iceBreak: '/audio/sfx/ice-break.mp3',
    
    // Power-ups
    shieldActivate: '/audio/sfx/shield-activate.mp3',
    speedBoost: '/audio/sfx/speed-boost.mp3',
    invincibility: '/audio/sfx/invincibility.mp3',
    magnet: '/audio/sfx/magnet.mp3',
    
    // UI Sounds
    buttonClick: '/audio/sfx/button-click.mp3',
    buttonHover: '/audio/sfx/button-hover.mp3',
    menuOpen: '/audio/sfx/menu-open.mp3',
    menuClose: '/audio/sfx/menu-close.mp3',
    achievement: '/audio/sfx/achievement.mp3',
    levelUp: '/audio/sfx/level-up.mp3',
    
    // Avalanche Specific
    subnetCreate: '/audio/sfx/subnet-create.mp3',
    stakingReward: '/audio/sfx/staking-reward.mp3',
    bridgeComplete: '/audio/sfx/bridge-complete.mp3',
    defiSuccess: '/audio/sfx/defi-success.mp3',
    
    // Game Events
    gameStart: '/audio/sfx/game-start.mp3',
    gamePause: '/audio/sfx/game-pause.mp3',
    gameResume: '/audio/sfx/game-resume.mp3',
    gameOver: '/audio/sfx/game-over.mp3',
    highScore: '/audio/sfx/high-score.mp3',
    combo: '/audio/sfx/combo.mp3',
    perfect: '/audio/sfx/perfect.mp3'
  }
};

interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  isMuted: boolean;
}

interface AudioManager {
  // Settings
  settings: AudioSettings;
  updateSettings: (settings: Partial<AudioSettings>) => void;
  
  // Background Music
  playBackgroundMusic: (track: keyof typeof AUDIO_FILES.backgroundMusic) => void;
  stopBackgroundMusic: () => void;
  pauseBackgroundMusic: () => void;
  resumeBackgroundMusic: () => void;
  
  // Sound Effects
  playSound: (sound: keyof typeof AUDIO_FILES.gameSounds, volume?: number) => void;
  playRandomSound: (sounds: (keyof typeof AUDIO_FILES.gameSounds)[], volume?: number) => void;
  
  // Game Events
  onGameStart: () => void;
  onGameEnd: () => void;
  onLevelComplete: (level: number) => void;
  onAchievement: (achievement: string) => void;
  onCoinCollect: (value: number) => void;
  onObstacleHit: () => void;
  onPowerupCollect: (type: string) => void;
  
  // Utility
  preloadAudio: () => Promise<void>;
  isAudioSupported: boolean;
}

export const useAudioManager = (): AudioManager => {
  const [settings, setSettings] = useState<AudioSettings>({
    masterVolume: 0.7,
    musicVolume: 0.6,
    sfxVolume: 0.8,
    isMuted: false
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const soundEffectsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const isAudioSupportedRef = useRef<boolean>(false);

  // Initialize audio context
  useEffect(() => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      isAudioSupportedRef.current = true;
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
      isAudioSupportedRef.current = false;
    }

    // Load settings from localStorage
    const savedSettings = localStorage.getItem('avalanche-rush-audio-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.warn('Failed to load audio settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('avalanche-rush-audio-settings', JSON.stringify(settings));
  }, [settings]);

  // Create audio element helper
  const createAudioElement = useCallback((src: string): HTMLAudioElement => {
    const audio = new Audio(src);
    audio.preload = 'auto';
    audio.crossOrigin = 'anonymous';
    return audio;
  }, []);

  // Preload audio files
  const preloadAudio = useCallback(async (): Promise<void> => {
    if (!isAudioSupportedRef.current) return;

    try {
      // Preload background music
      const musicPromises = Object.entries(AUDIO_FILES.backgroundMusic).map(async ([key, src]) => {
        try {
          const audio = createAudioElement(src);
          await audio.load();
          if (key === 'menu') {
            backgroundMusicRef.current = audio;
          }
        } catch (error) {
          console.warn(`Failed to preload music ${key}:`, error);
        }
      });

      // Preload sound effects
      const sfxPromises = Object.entries(AUDIO_FILES.gameSounds).map(async ([key, src]) => {
        try {
          const audio = createAudioElement(src);
          await audio.load();
          soundEffectsRef.current.set(key, audio);
        } catch (error) {
          console.warn(`Failed to preload sound effect ${key}:`, error);
        }
      });

      await Promise.all([...musicPromises, ...sfxPromises]);
      console.log('Audio preloading completed');
    } catch (error) {
      console.error('Audio preloading failed:', error);
    }
  }, [createAudioElement]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<AudioSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      
      // Apply volume changes immediately
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.volume = updated.isMuted ? 0 : updated.masterVolume * updated.musicVolume;
      }
      
      return updated;
    });
  }, []);

  // Play background music
  const playBackgroundMusic = useCallback((track: keyof typeof AUDIO_FILES.backgroundMusic) => {
    if (!isAudioSupportedRef.current || settings.isMuted) return;

    try {
      // Stop current music
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
        backgroundMusicRef.current.currentTime = 0;
      }

      // Create new audio element for the track
      const src = AUDIO_FILES.backgroundMusic[track];
      const audio = createAudioElement(src);
      audio.loop = true;
      audio.volume = settings.masterVolume * settings.musicVolume;
      
      backgroundMusicRef.current = audio;
      
      // Play with user interaction requirement handling
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn('Autoplay prevented:', error);
          // Audio will play on first user interaction
        });
      }
    } catch (error) {
      console.error('Failed to play background music:', error);
    }
  }, [settings, createAudioElement]);

  // Stop background music
  const stopBackgroundMusic = useCallback(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
      backgroundMusicRef.current.currentTime = 0;
    }
  }, []);

  // Pause background music
  const pauseBackgroundMusic = useCallback(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
    }
  }, []);

  // Resume background music
  const resumeBackgroundMusic = useCallback(() => {
    if (backgroundMusicRef.current && !settings.isMuted) {
      backgroundMusicRef.current.play().catch(error => {
        console.warn('Failed to resume music:', error);
      });
    }
  }, [settings.isMuted]);

  // Play sound effect
  const playSound = useCallback((sound: keyof typeof AUDIO_FILES.gameSounds, volume: number = 1) => {
    if (!isAudioSupportedRef.current || settings.isMuted) return;

    try {
      const audio = soundEffectsRef.current.get(sound);
      if (audio) {
        // Clone audio to allow overlapping sounds
        const audioClone = audio.cloneNode() as HTMLAudioElement;
        audioClone.volume = settings.masterVolume * settings.sfxVolume * volume;
        
        audioClone.play().catch(error => {
          console.warn(`Failed to play sound ${sound}:`, error);
        });
      }
    } catch (error) {
      console.error(`Failed to play sound effect ${sound}:`, error);
    }
  }, [settings]);

  // Play random sound from array
  const playRandomSound = useCallback((sounds: (keyof typeof AUDIO_FILES.gameSounds)[], volume: number = 1) => {
    if (sounds.length === 0) return;
    const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
    playSound(randomSound, volume);
  }, [playSound]);

  // Game event handlers
  const onGameStart = useCallback(() => {
    playSound('gameStart');
    playBackgroundMusic('gameplay');
  }, [playSound, playBackgroundMusic]);

  const onGameEnd = useCallback(() => {
    playSound('gameOver');
    stopBackgroundMusic();
  }, [playSound, stopBackgroundMusic]);

  const onLevelComplete = useCallback((level: number) => {
    playSound('levelUp');
    if (level % 5 === 0) {
      playSound('achievement');
    }
  }, [playSound]);

  const onAchievement = useCallback((achievement: string) => {
    playSound('achievement');
    // Play special sound for rare achievements
    if (achievement.includes('legendary') || achievement.includes('genesis')) {
      playSound('perfect');
    }
  }, [playSound]);

  const onCoinCollect = useCallback((value: number) => {
    if (value >= 100) {
      playSound('rushTokenCollect');
    } else if (value >= 50) {
      playSound('gemCollect');
    } else {
      playSound('coinCollect');
    }
  }, [playSound]);

  const onObstacleHit = useCallback(() => {
    playSound('obstacleHit');
  }, [playSound]);

  const onPowerupCollect = useCallback((type: string) => {
    switch (type) {
      case 'shield':
        playSound('shieldActivate');
        break;
      case 'speed':
        playSound('speedBoost');
        break;
      case 'invincibility':
        playSound('invincibility');
        break;
      case 'magnet':
        playSound('magnet');
        break;
      default:
        playSound('powerupCollect');
    }
  }, [playSound]);

  return {
    settings,
    updateSettings,
    playBackgroundMusic,
    stopBackgroundMusic,
    pauseBackgroundMusic,
    resumeBackgroundMusic,
    playSound,
    playRandomSound,
    onGameStart,
    onGameEnd,
    onLevelComplete,
    onAchievement,
    onCoinCollect,
    onObstacleHit,
    onPowerupCollect,
    preloadAudio,
    isAudioSupported: isAudioSupportedRef.current
  };
};

export default useAudioManager;
