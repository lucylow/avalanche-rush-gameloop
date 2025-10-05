import React, { useEffect, useCallback } from 'react';
import { useQuestTracking } from '../../hooks/useQuestTracking';
import { CHARACTER_QUESTS } from '../../data/characterQuests';

interface QuestIntegrationProps {
  gameState: {
    isPlaying: boolean;
    score: number;
    lives: number;
    energy: number;
    currentLevel: number;
  };
  onQuestUpdate?: (questId: string, objectiveId: string, progress: number) => void;
  onQuestComplete?: (questId: string, rewards: Array<{type: string; amount?: number; item?: string}>) => void;
}

const QuestIntegration: React.FC<QuestIntegrationProps> = ({
  gameState,
  onQuestUpdate,
  onQuestComplete
}) => {
  const {
    recordGameEvent,
    getActiveQuests,
    updateQuestProgress,
    questProgress
  } = useQuestTracking();

  // Track game events and update quest progress
  const trackGameEvents = useCallback(() => {
    if (!gameState.isPlaying) return;

    const activeQuests = getActiveQuests();
    
    // Track score achievements
    if (gameState.score > 0) {
      recordGameEvent('score', gameState.score, {
        gameMode: 'avalanche_rush',
        minimumScore: gameState.score
      });
    }

    // Track level completion
    if (gameState.currentLevel > 1) {
      recordGameEvent('complete', gameState.currentLevel, {
        gameMode: 'level_completion'
      });
    }

    // Track survival (not losing all lives)
    if (gameState.lives > 0) {
      recordGameEvent('survive', gameState.lives, {
        gameMode: 'survival',
        timeLimit: 60 // 1 minute survival
      });
    }

    // Track energy collection
    if (gameState.energy > 0) {
      recordGameEvent('collect', gameState.energy, {
        itemType: 'energy',
        gameMode: 'energy_collection'
      });
    }

  }, [gameState, recordGameEvent, getActiveQuests]);

  // Update quest objectives based on game events
  const updateQuestObjectives = useCallback(() => {
    const activeQuests = getActiveQuests();
    
    activeQuests.forEach(questProgress => {
      // Check if any objectives need updating based on current game state
      questProgress.objectives.forEach(objective => {
        if (objective.isCompleted) return;

        let shouldUpdate = false;
        let progressIncrement = 0;

        // Check objective types and update accordingly
        switch (objective.id) {
          case 'trial-resilience':
            // Complete 3 games without losing all lives
            if (gameState.lives > 0 && gameState.isPlaying) {
              progressIncrement = 1;
              shouldUpdate = true;
            }
            break;
          
          case 'trial-wisdom':
            // Make 5 perfect timing decisions
            if (gameState.score > 0 && gameState.score % 1000 === 0) {
              progressIncrement = 1;
              shouldUpdate = true;
            }
            break;
          
          case 'token-pattern-analysis':
            // Collect 100 RUSH tokens
            if (gameState.score > 0) {
              progressIncrement = Math.floor(gameState.score / 100);
              shouldUpdate = true;
            }
            break;
          
          case 'combo-experiments':
            // Achieve 5 combo chains of 10+
            if (gameState.score > 0 && gameState.score % 2000 === 0) {
              progressIncrement = 1;
              shouldUpdate = true;
            }
            break;
          
          case 'efficiency-testing':
            // Complete 3 games with 90%+ efficiency
            if (gameState.score > 5000 && gameState.lives > 0) {
              progressIncrement = 1;
              shouldUpdate = true;
            }
            break;
          
          case 'network-analysis':
            // Study 5 different subnet configurations
            if (gameState.currentLevel > 5) {
              progressIncrement = 1;
              shouldUpdate = true;
            }
            break;
          
          case 'yield-optimization':
            // Achieve 50%+ APY (simulated)
            if (gameState.score > 10000) {
              progressIncrement = 1;
              shouldUpdate = true;
            }
            break;
          
          case 'timeline-stabilization':
            // Make 7 critical decisions
            if (gameState.currentLevel > 7) {
              progressIncrement = 1;
              shouldUpdate = true;
            }
            break;
        }

        if (shouldUpdate && progressIncrement > 0) {
          const gameEvent = {
            type: 'complete' as const,
            questId: questProgress.questId,
            objectiveId: objective.id,
            progress: progressIncrement,
            timestamp: Date.now(),
            value: progressIncrement
          };
          updateQuestProgress(gameEvent);
          
          // Notify parent component
          if (onQuestUpdate) {
            onQuestUpdate(questProgress.questId, objective.id, progressIncrement);
          }
        }
      });
    });
  }, [gameState, getActiveQuests, updateQuestProgress, onQuestUpdate]);

  // Track quest completion
  useEffect(() => {
    const activeQuests = getActiveQuests();
    
    activeQuests.forEach(questProgress => {
      const allRequiredCompleted = questProgress.objectives
        .every(obj => obj.isCompleted);

      if (allRequiredCompleted && !questProgress.isCompleted) {
        // Quest completed!
        if (onQuestComplete) {
          // Get quest details and rewards
          const quest = CHARACTER_QUESTS.find(q => q.id === questProgress.questId);
          if (quest) {
            onQuestComplete(questProgress.questId, quest.rewards);
          }
        }
      }
    });
  }, [questProgress, getActiveQuests, onQuestComplete]);

  // Main tracking effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (gameState.isPlaying) {
        trackGameEvents();
        updateQuestObjectives();
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [gameState.isPlaying, trackGameEvents, updateQuestObjectives]);

  // Track specific game events
  useEffect(() => {
    // Track when game starts
    if (gameState.isPlaying) {
      recordGameEvent('complete', 1, {
        gameMode: 'game_start',
        specificActions: ['start_game_session']
      });
    }
  }, [gameState.isPlaying, recordGameEvent]);

  // Track score milestones
  useEffect(() => {
    if (gameState.score > 0) {
      // Track every 1000 points as a milestone
      const milestones = [1000, 5000, 10000, 25000, 50000];
      milestones.forEach(milestone => {
        if (gameState.score >= milestone && gameState.score < milestone + 1000) {
          recordGameEvent('score', milestone, {
            gameMode: 'score_milestone',
            minimumScore: milestone
          });
        }
      });
    }
  }, [gameState.score, recordGameEvent]);

  // Track level progression
  useEffect(() => {
    if (gameState.currentLevel > 1) {
      recordGameEvent('complete', gameState.currentLevel, {
        gameMode: 'level_progression',
        specificActions: ['reach_level']
      });
    }
  }, [gameState.currentLevel, recordGameEvent]);

  // Track survival time
  useEffect(() => {
    if (gameState.isPlaying && gameState.lives > 0) {
      // Track survival in 30-second intervals
      const survivalTime = Math.floor(Date.now() / 1000) % 30;
      if (survivalTime === 0) {
        recordGameEvent('survive', 1, {
          gameMode: 'survival_time',
          timeLimit: 30
        });
      }
    }
  }, [gameState.isPlaying, gameState.lives, recordGameEvent]);

  // Track energy collection
  useEffect(() => {
    if (gameState.energy > 0) {
      recordGameEvent('collect', gameState.energy, {
        itemType: 'energy',
        gameMode: 'energy_management'
      });
    }
  }, [gameState.energy, recordGameEvent]);

  // Track lives remaining
  useEffect(() => {
    if (gameState.lives > 0) {
      recordGameEvent('survive', gameState.lives, {
        gameMode: 'lives_remaining',
        specificActions: ['maintain_lives']
      });
    }
  }, [gameState.lives, recordGameEvent]);

  // This component doesn't render anything - it's purely for tracking
  return null;
};

export default QuestIntegration;
