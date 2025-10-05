import { useState, useEffect, useCallback } from 'react';
import { useAdvancedWeb3 } from './useAdvancedWeb3';
import { CHARACTER_QUESTS, getAvailableQuests } from '../data/characterQuests';

interface QuestProgress {
  questId: string;
  characterId: string;
  objectives: Array<{
    id: string;
    current: number;
    target: number;
    isCompleted: boolean;
    lastUpdate: number;
  }>;
  isCompleted: boolean;
  startedAt: number;
  completedAt?: number;
  socialShares: number;
  lastActivity: number;
}

interface GameEvent {
  type: 'score' | 'collect' | 'complete' | 'interact' | 'explore' | 'survive' | 'achieve';
  value: number;
  metadata?: {
    itemType?: string;
    gameMode?: string;
    minimumScore?: number;
    timeLimit?: number;
    specificActions?: string[];
  };
  timestamp: number;
}

interface QuestAchievement {
  questId: string;
  characterId: string;
  title: string;
  completedAt: number;
  rewards: Array<{
    type: string;
    amount?: number;
    item?: string;
  }>;
  socialShared: boolean;
}

export const useQuestTracking = () => {
  const [questProgress, setQuestProgress] = useState<Map<string, QuestProgress>>(new Map());
  const [completedQuests, setCompletedQuests] = useState<QuestAchievement[]>([]);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [relationships, setRelationships] = useState<Record<string, number>>({});
  const [recentEvents, setRecentEvents] = useState<GameEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { account, isConnected } = useAdvancedWeb3();

  // Load quest progress from localStorage
  const loadQuestProgress = useCallback(() => {
    if (!account) return;

    try {
      const saved = localStorage.getItem(`questProgress_${account}`);
      if (saved) {
        const progressData = JSON.parse(saved);
        setQuestProgress(new Map(progressData));
      }

      const savedCompleted = localStorage.getItem(`completedQuests_${account}`);
      if (savedCompleted) {
        setCompletedQuests(JSON.parse(savedCompleted));
      }

      const savedLevel = localStorage.getItem(`playerLevel_${account}`);
      if (savedLevel) {
        setPlayerLevel(parseInt(savedLevel));
      }

      const savedAchievements = localStorage.getItem(`achievements_${account}`);
      if (savedAchievements) {
        setAchievements(JSON.parse(savedAchievements));
      }

      const savedRelationships = localStorage.getItem(`relationships_${account}`);
      if (savedRelationships) {
        setRelationships(JSON.parse(savedRelationships));
      }
    } catch (error) {
      console.error('Error loading quest progress:', error);
    }
  }, [account]);

  // Save quest progress to localStorage
  const saveQuestProgress = useCallback(() => {
    if (!account) return;

    try {
      localStorage.setItem(`questProgress_${account}`, JSON.stringify(Array.from(questProgress.entries())));
      localStorage.setItem(`completedQuests_${account}`, JSON.stringify(completedQuests));
      localStorage.setItem(`playerLevel_${account}`, playerLevel.toString());
      localStorage.setItem(`achievements_${account}`, JSON.stringify(achievements));
      localStorage.setItem(`relationships_${account}`, JSON.stringify(relationships));
    } catch (error) {
      console.error('Error saving quest progress:', error);
    }
  }, [account, questProgress, completedQuests, playerLevel, achievements, relationships]);

  // Start a new quest
  const startQuest = useCallback((questId: string) => {
    const quest = CHARACTER_QUESTS.find(q => q.id === questId);
    if (!quest) return false;

    // Check if already active
    if (questProgress.has(questId)) return false;

    const progress: QuestProgress = {
      questId,
      characterId: quest.characterId,
      objectives: quest.objectives.map(obj => ({
        id: obj.id,
        current: 0,
        target: typeof obj.target === 'string' ? parseInt(obj.target) || 0 : obj.target,
        isCompleted: false,
        lastUpdate: Date.now()
      })),
      isCompleted: false,
      startedAt: Date.now(),
      socialShares: 0,
      lastActivity: Date.now()
    };

    setQuestProgress(prev => new Map(prev).set(questId, progress));
    return true;
  }, [questProgress]);

  // Update quest progress based on game events
  const updateQuestProgress = useCallback((event: GameEvent) => {
    setRecentEvents(prev => [event, ...prev.slice(0, 49)]); // Keep last 50 events

    setQuestProgress(prev => {
      const newProgress = new Map(prev);
      let hasUpdates = false;

      newProgress.forEach((questProgress, questId) => {
        if (questProgress.isCompleted) return;

        const quest = CHARACTER_QUESTS.find(q => q.id === questId);
        if (!quest) return;

        const updatedObjectives = questProgress.objectives.map(objective => {
          const questObjective = quest.objectives.find(obj => obj.id === objective.id);
          if (!questObjective || objective.isCompleted) return objective;

          let shouldUpdate = false;
          let progressIncrement = 0;

          // Check if this event matches the objective
          switch (questObjective.type) {
            case 'collect':
              if (event.type === 'collect' && event.metadata?.itemType === questObjective.target) {
                progressIncrement = event.value;
                shouldUpdate = true;
              }
              break;
            case 'complete':
              if (event.type === 'complete' && questObjective.target === event.value) {
                progressIncrement = 1;
                shouldUpdate = true;
              }
              break;
            case 'achieve':
              if (event.type === 'achieve' && event.value >= (questObjective.target as number)) {
                progressIncrement = 1;
                shouldUpdate = true;
              }
              break;
            case 'score':
              if (event.type === 'score' && event.value >= (questObjective.target as number)) {
                progressIncrement = 1;
                shouldUpdate = true;
              }
              break;
            case 'survive':
              if (event.type === 'survive' && event.value >= (questObjective.target as number)) {
                progressIncrement = 1;
                shouldUpdate = true;
              }
              break;
            case 'interact':
              if (event.type === 'interact' && event.value >= (questObjective.target as number)) {
                progressIncrement = 1;
                shouldUpdate = true;
              }
              break;
            case 'explore':
              if (event.type === 'explore' && event.value >= (questObjective.target as number)) {
                progressIncrement = 1;
                shouldUpdate = true;
              }
              break;
          }

          if (shouldUpdate) {
            const newCurrent = Math.min(objective.current + progressIncrement, objective.target);
            const isCompleted = newCurrent >= objective.target;
            
            return {
              ...objective,
              current: newCurrent,
              isCompleted,
              lastUpdate: Date.now()
            };
          }

          return objective;
        });

        // Check if quest is complete
        const allRequiredCompleted = updatedObjectives
          .filter(obj => !quest.objectives.find(o => o.id === obj.id)?.isOptional)
          .every(obj => obj.isCompleted);

        if (allRequiredCompleted && !questProgress.isCompleted) {
          // Quest completed!
          const completedQuest: QuestAchievement = {
            questId,
            characterId: quest.characterId,
            title: quest.title,
            completedAt: Date.now(),
            rewards: quest.rewards,
            socialShared: false
          };

          setCompletedQuests(prev => [...prev, completedQuest]);

          // Update relationships
          setRelationships(prev => {
            const newRelationships = { ...prev };
            Object.entries(quest.relationshipChanges).forEach(([characterId, change]) => {
              newRelationships[characterId] = (newRelationships[characterId] || 0) + change;
            });
            return newRelationships;
          });

          // Award experience
          const totalExperience = quest.rewards.reduce((sum, reward) => {
            if (reward.type === 'experience') return sum + (reward.amount || 0);
            return sum + 100; // Base experience for other rewards
          }, 0);

          setPlayerLevel(prev => {
            const newLevel = prev + Math.floor(totalExperience / 1000);
            return newLevel;
          });

          hasUpdates = true;
          return {
            ...questProgress,
            objectives: updatedObjectives,
            isCompleted: true,
            completedAt: Date.now(),
            lastActivity: Date.now()
          };
        }

        // Check if any objectives were updated
        const hasObjectiveUpdates = updatedObjectives.some((obj, index) => 
          obj.current !== questProgress.objectives[index]?.current ||
          obj.isCompleted !== questProgress.objectives[index]?.isCompleted
        );

        if (hasObjectiveUpdates) {
          hasUpdates = true;
          return {
            ...questProgress,
            objectives: updatedObjectives,
            lastActivity: Date.now()
          };
        }

        return questProgress;
      });

      return hasUpdates ? newProgress : prev;
    });
  }, [questProgress]);

  // Record a game event
  const recordGameEvent = useCallback((type: GameEvent['type'], value: number, metadata?: GameEvent['metadata']) => {
    const event: GameEvent = {
      type,
      value,
      metadata,
      timestamp: Date.now()
    };

    updateQuestProgress(event);
  }, [updateQuestProgress]);

  // Get available quests
  const getAvailableQuests = useCallback(() => {
    return CHARACTER_QUESTS.filter(quest => {
      // Check if already completed
      if (completedQuests.some(cq => cq.questId === quest.id)) return false;
      
      // Check if already active
      if (questProgress.has(quest.id)) return false;
      
      // Check level requirement
      if (playerLevel < quest.levelRequirement) return false;
      
      // Check relationship requirement
      if (quest.relationshipRequirement && 
          (relationships[quest.characterId] || 0) < quest.relationshipRequirement) {
        return false;
      }
      
      // Check prerequisites
      return quest.prerequisites.every(prereq => {
        switch (prereq.type) {
          case 'level':
            return playerLevel >= (prereq.value as number);
          case 'achievement':
            return achievements.includes(prereq.value as string);
          case 'quest':
            return completedQuests.some(cq => cq.questId === prereq.value);
          case 'relationship':
            return (relationships[quest.characterId] || 0) >= (prereq.value as number);
          default:
            return true;
        }
      });
    });
  }, [completedQuests, questProgress, playerLevel, relationships, achievements]);

  // Get active quests
  const getActiveQuests = useCallback(() => {
    return Array.from(questProgress.values()).filter(progress => !progress.isCompleted);
  }, [questProgress]);

  // Get quest progress for a specific quest
  const getQuestProgress = useCallback((questId: string) => {
    return questProgress.get(questId);
  }, [questProgress]);

  // Get character relationship level
  const getCharacterRelationship = useCallback((characterId: string) => {
    return relationships[characterId] || 0;
  }, [relationships]);

  // Add achievement
  const addAchievement = useCallback((achievementId: string) => {
    if (!achievements.includes(achievementId)) {
      setAchievements(prev => [...prev, achievementId]);
    }
  }, [achievements]);

  // Share quest completion on social platforms
  const shareQuestCompletion = useCallback((questId: string) => {
    const completedQuest = completedQuests.find(cq => cq.questId === questId);
    if (!completedQuest) return false;

    setCompletedQuests(prev => 
      prev.map(cq => 
        cq.questId === questId 
          ? { ...cq, socialShared: true }
          : cq
      )
    );

    return true;
  }, [completedQuests]);

  // Get quest statistics
  const getQuestStats = useCallback(() => {
    const activeQuests = getActiveQuests();
    const completedCount = completedQuests.length;
    const totalAvailable = getAvailableQuests().length;
    
    const characterProgress = Object.keys(relationships).map(characterId => ({
      characterId,
      relationship: relationships[characterId],
      completedQuests: completedQuests.filter(cq => cq.characterId === characterId).length,
      activeQuests: activeQuests.filter(aq => aq.characterId === characterId).length
    }));

    return {
      totalCompleted: completedCount,
      totalActive: activeQuests.length,
      totalAvailable,
      playerLevel,
      characterProgress,
      recentEvents: recentEvents.slice(0, 10)
    };
  }, [getActiveQuests, completedQuests, getAvailableQuests, playerLevel, relationships, recentEvents]);

  // Auto-save progress
  useEffect(() => {
    saveQuestProgress();
  }, [saveQuestProgress]);

  // Load progress on mount
  useEffect(() => {
    if (isConnected && account) {
      loadQuestProgress();
    }
  }, [isConnected, account, loadQuestProgress]);

  return {
    // State
    questProgress,
    completedQuests,
    playerLevel,
    achievements,
    relationships,
    recentEvents,
    isLoading,

    // Actions
    startQuest,
    updateQuestProgress,
    recordGameEvent,
    addAchievement,
    shareQuestCompletion,

    // Getters
    getAvailableQuests,
    getActiveQuests,
    getQuestProgress,
    getCharacterRelationship,
    getQuestStats,

    // Utils
    hasActiveQuests: getActiveQuests().length > 0,
    totalCompleted: completedQuests.length
  };
};
