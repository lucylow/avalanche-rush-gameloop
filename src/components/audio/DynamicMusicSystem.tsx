// src/components/audio/DynamicMusicSystem.tsx
import React, { useEffect, useRef } from 'react';
import { useAudioManager } from '../../hooks/useAudioManager';

interface DynamicMusicSystemProps {
  gameState: {
    isPlaying: boolean;
    isPaused: boolean;
    currentLevel: number;
    score: number;
    lives: number;
    energy: number;
    gameMode: string;
  };
  playerProfile?: {
    level: number;
    totalScore: number;
    achievements: string[];
  } | null;
}

const DynamicMusicSystem: React.FC<DynamicMusicSystemProps> = ({ 
  gameState, 
  playerProfile 
}) => {
  const audioManager = useAudioManager();
  const lastMusicStateRef = useRef<string>('');
  const intensityLevelRef = useRef<number>(0);

  // Calculate music intensity based on game state
  const calculateIntensity = () => {
    let intensity = 0;
    
    // Base intensity from level
    intensity += Math.min(gameState.currentLevel * 0.1, 0.5);
    
    // Score-based intensity
    if (gameState.score > 1000) intensity += 0.2;
    if (gameState.score > 5000) intensity += 0.2;
    if (gameState.score > 10000) intensity += 0.2;
    
    // Lives-based intensity (lower lives = higher intensity)
    intensity += (4 - gameState.lives) * 0.1;
    
    // Energy-based intensity (lower energy = higher intensity)
    intensity += (100 - gameState.energy) * 0.001;
    
    // Game mode intensity modifiers
    switch (gameState.gameMode) {
      case 'challenge':
        intensity += 0.3;
        break;
      case 'speedrun':
        intensity += 0.4;
        break;
      case 'survival':
        intensity += 0.5;
        break;
      case 'tutorial':
        intensity -= 0.2;
        break;
    }
    
    return Math.min(Math.max(intensity, 0), 1);
  };

  // Determine appropriate music track
  const getMusicTrack = () => {
    if (!gameState.isPlaying) {
      return 'menu';
    }
    
    const intensity = calculateIntensity();
    intensityLevelRef.current = intensity;
    
    // High intensity = avalanche theme
    if (intensity > 0.7) {
      return 'avalanche';
    }
    
    // Medium-high intensity = gameplay theme
    if (intensity > 0.3) {
      return 'gameplay';
    }
    
    // Low intensity = menu theme (for tutorial mode)
    return 'menu';
  };

  // Handle music transitions
  useEffect(() => {
    const currentTrack = getMusicTrack();
    
    // Only change music if the track has actually changed
    if (currentTrack !== lastMusicStateRef.current) {
      lastMusicStateRef.current = currentTrack;
      
      // Add a small delay for smooth transitions
      setTimeout(() => {
        audioManager.playBackgroundMusic(currentTrack);
      }, 100);
    }
  }, [
    gameState.isPlaying,
    gameState.currentLevel,
    gameState.score,
    gameState.lives,
    gameState.energy,
    gameState.gameMode,
    audioManager
  ]);

  // Handle pause/resume
  useEffect(() => {
    if (gameState.isPaused) {
      audioManager.pauseBackgroundMusic();
    } else if (gameState.isPlaying) {
      audioManager.resumeBackgroundMusic();
    }
  }, [gameState.isPaused, gameState.isPlaying, audioManager]);

  // Handle game end
  useEffect(() => {
    if (!gameState.isPlaying && lastMusicStateRef.current !== '') {
      // Game ended, play appropriate end music
      const intensity = intensityLevelRef.current;
      
      if (intensity > 0.6) {
        // High intensity game ended - play victory theme
        audioManager.playBackgroundMusic('victory');
      } else {
        // Low intensity game ended - return to menu
        audioManager.playBackgroundMusic('menu');
      }
    }
  }, [gameState.isPlaying, audioManager]);

  // Handle special achievements
  useEffect(() => {
    if (playerProfile?.achievements) {
      const recentAchievements = playerProfile.achievements.filter(achievement => 
        achievement.includes('legendary') || achievement.includes('genesis')
      );
      
      if (recentAchievements.length > 0) {
        // Play victory theme for special achievements
        audioManager.playBackgroundMusic('victory');
        setTimeout(() => {
          audioManager.playBackgroundMusic(getMusicTrack());
        }, 5000);
      }
    }
  }, [playerProfile?.achievements, audioManager]);

  // Dynamic volume adjustment based on intensity
  useEffect(() => {
    if (gameState.isPlaying) {
      const intensity = calculateIntensity();
      const dynamicVolume = 0.4 + (intensity * 0.4); // Range: 0.4 to 0.8
      
      audioManager.updateSettings({
        musicVolume: dynamicVolume
      });
    }
  }, [
    gameState.isPlaying,
    gameState.currentLevel,
    gameState.score,
    gameState.lives,
    gameState.energy,
    audioManager
  ]);

  return null; // This component doesn't render anything
};

export default DynamicMusicSystem;
