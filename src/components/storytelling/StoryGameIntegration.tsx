// src/components/storytelling/StoryGameIntegration.tsx - Enhanced with Reactive Smart Contract Integration
import React, { useEffect, useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { AVALANCHE_CHARACTERS } from '../../data/characters';
import { 
  MessageCircle, 
  Trophy, 
  Star, 
  Crown,
  Sparkles,
  Heart,
  Target,
  Zap,
  Gift,
  Activity,
  Coins,
  Flame,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { 
  Character, 
  ReactiveEvent, 
  ReactiveCharacter, 
  CharacterReactiveResponse,
  ReactiveQuest,
  AutomaticReward,
  getCharacterById, 
  getRandomDialogue 
} from '../../data/characters';
import DialogueSystem from './DialogueSystem';
import { useAudioManager } from '../../hooks/useAudioManager';

interface StoryGameIntegrationProps {
  // Game state
  gameState: {
    isPlaying: boolean;
    score: number;
    level: number;
    lives: number;
    achievements: string[];
  };
  
  // Player data
  playerProfile: {
    level: number;
    experience: number;
    totalScore: number;
    achievements: string[];
    completedQuests: string[];
    walletAddress?: string;
  } | null;
  
  // Selected character
  selectedCharacter?: ReactiveCharacter;
  
  // Events
  onGameStart?: () => void;
  onGameEnd?: (score: number) => void;
  onLevelComplete?: (level: number) => void;
  onAchievementUnlocked?: (achievement: string) => void;
  onQuestComplete?: (questId: string) => void;
  onReactiveEvent?: (event: ReactiveEvent) => void;
  onAutomaticReward?: (reward: AutomaticReward) => void;
  
  // Character relationships
  relationships: Record<string, number>;
  onRelationshipChange?: (characterId: string, change: number) => void;
  
  // Reactive Smart Contract Integration
  reactiveEventStream?: ReactiveEvent[];
  chainlinkVRFEnabled?: boolean;
  contractAddresses?: {
    questEngine: string;
    nftRewards: string;
    tokenRewards: string;
  };
}

interface GameEvent {
  id: string;
  type: 'game_start' | 'game_end' | 'level_complete' | 'achievement' | 'high_score' | 'defeat' | 'victory' | 'quest_complete';
  data: unknown;
  timestamp: Date;
  triggeredDialogue?: boolean;
}

interface StoryTrigger {
  id: string;
  character: Character;
  dialogue: string;
  emotion: 'happy' | 'sad' | 'excited' | 'proud' | 'encouraging' | 'neutral';
  relationshipChange?: number;
  unlocks?: string[];
  timestamp: Date;
}

const StoryGameIntegration: React.FC<StoryGameIntegrationProps> = ({
  gameState,
  playerProfile,
  selectedCharacter,
  onGameStart,
  onGameEnd,
  onLevelComplete,
  onAchievementUnlocked,
  onQuestComplete,
  onReactiveEvent,
  onAutomaticReward,
  relationships,
  onRelationshipChange,
  reactiveEventStream = [],
  chainlinkVRFEnabled = false,
  contractAddresses
}) => {
  const audioManager = useAudioManager();
  
  const [recentEvents, setRecentEvents] = React.useState<GameEvent[]>([]);
  const [reactiveEvents, setReactiveEvents] = React.useState<ReactiveEvent[]>([]);
  const [pendingRewards, setPendingRewards] = React.useState<AutomaticReward[]>([]);
  const [characterResponses, setCharacterResponses] = React.useState<CharacterReactiveResponse[]>([]);
  const [evolutionAnimation, setEvolutionAnimation] = React.useState<{
    isActive: boolean;
    characterId: string;
    evolutionStage: number;
  } | null>(null);
  
  const [activeDialogue, setActiveDialogue] = React.useState<{
    isVisible: boolean;
    triggeredBy: 'victory' | 'defeat' | 'levelUp' | 'achievement' | 'questStart' | 'questComplete' | 'random' | 'greeting' | 'reactive';
    character?: ReactiveCharacter;
    reactiveEvent?: ReactiveEvent;
  }>({ isVisible: false, triggeredBy: 'greeting' });
  
  const [storyTriggers, setStoryTriggers] = React.useState<StoryTrigger[]>([]);
  const [contextualNarration, setContextualNarration] = React.useState<string | null>(null);
  const [vrfRequestPending, setVrfRequestPending] = React.useState<boolean>(false);
  const [blockchainActivity, setBlockchainActivity] = React.useState<{
    isActive: boolean;
    activityType: ReactiveEvent['eventType'];
    transactionHash?: string;
  }>({ isActive: false, activityType: 'transfer' });
  
  // WebSocket connection for real-time blockchain events
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track game events and trigger story responses
  useEffect(() => {
    // Game start event
    if (gameState.isPlaying && recentEvents.length === 0) {
      handleGameEvent('game_start', { level: gameState.level });
    }
  }, [gameState.isPlaying]);

  useEffect(() => {
    // Level progression
    if (gameState.level > 1 && playerProfile) {
      handleGameEvent('level_complete', { 
        level: gameState.level - 1,
        score: gameState.score 
      });
    }
  }, [gameState.level]);

  useEffect(() => {
    // High score achievements
    if (playerProfile && gameState.score > playerProfile.totalScore * 1.5) {
      handleGameEvent('high_score', { 
        newScore: gameState.score,
        previousBest: playerProfile.totalScore 
      });
    }
  }, [gameState.score, playerProfile?.totalScore]);

  useEffect(() => {
    // Achievement unlocks
    if (playerProfile?.achievements && playerProfile.achievements.length > 0) {
      const newAchievements = playerProfile.achievements.filter(
        (achievement: string) => !recentEvents.some(e => 
          e.type === 'achievement' && (e.data as { achievement: string }).achievement === achievement
        )
      );
      
      newAchievements.forEach((achievement: string) => {
        handleGameEvent('achievement', { achievement });
      });
    }
  }, [playerProfile?.achievements]);

  const handleGameEvent = useCallback((eventType: GameEvent['type'], data: unknown) => {
    const event: GameEvent = {
      id: `${eventType}_${Date.now()}`,
      type: eventType,
      data,
      timestamp: new Date(),
      triggeredDialogue: false
    };

    setRecentEvents(prev => [event, ...prev].slice(0, 50)); // Keep last 50 events

    // Trigger appropriate story response
    triggerStoryResponse(event);
  }, []);

  const triggerStoryResponse = useCallback((event: GameEvent) => {
    let dialogueType: 'victory' | 'defeat' | 'levelUp' | 'achievement' | 'questStart' | 'questComplete' | 'random' | 'greeting' = 'random';
    let character: Character | undefined = selectedCharacter;

    switch (event.type) {
      case 'game_start':
        dialogueType = 'greeting';
        setContextualNarration("Your character appears, ready to guide you on your journey...");
        break;
        
      case 'level_complete':
        dialogueType = 'levelUp';
        if ((event.data as { level: number }).level % 5 === 0) {
          // Major milestone - trigger special dialogue
          setContextualNarration(`Congratulations on reaching level ${(event.data as { level: number }).level}! Your character is impressed by your progress.`);
        }
        break;
        
      case 'achievement':
        dialogueType = 'achievement';
        setContextualNarration(`Your character celebrates your achievement: ${(event.data as { achievement: string }).achievement}`);
        break;
        
      case 'high_score':
        dialogueType = 'victory';
        setContextualNarration("A new personal best! Your character is proud of your improvement.");
        break;
        
      case 'defeat':
        dialogueType = 'defeat';
        setContextualNarration("Your character offers words of encouragement after the setback.");
        break;
        
      case 'quest_complete':
        dialogueType = 'questComplete';
        setContextualNarration("Quest completed! Your character acknowledges your dedication.");
        break;
    }

    // If no character is selected, choose contextually appropriate one
    if (!character && playerProfile) {
      character = selectContextualCharacter(event.type, playerProfile.level, playerProfile.achievements);
    }

    // Trigger dialogue with delay for dramatic effect
    setTimeout(() => {
      setActiveDialogue({
        isVisible: true,
        triggeredBy: dialogueType,
        character: character as ReactiveCharacter
      });
    }, 1000);

    // Clear narration after a delay
    setTimeout(() => {
      setContextualNarration(null);
    }, 5000);
  }, [selectedCharacter, playerProfile]);

  const selectContextualCharacter = (eventType: string, playerLevel: number, achievements: string[]): Character | undefined => {
    
    // Filter characters based on unlock requirements
    const availableCharacters = AVALANCHE_CHARACTERS.filter((char: Character) => {
      return char.unlockRequirements.every(req => {
        switch (req.type) {
          case 'level':
            return playerLevel >= (req.value as number);
          case 'achievement':
            return achievements.includes(req.value as string);
          default:
            return true;
        }
      });
    });

    if (availableCharacters.length === 0) return undefined;

    // Character selection logic based on event type and relationships
    switch (eventType) {
      case 'defeat': {
        // Prefer wise, encouraging characters for defeats
        const mentorChars = availableCharacters.filter((char: Character) => 
          char.personality.includes('Wise') || char.personality.includes('Patient')
        );
        return mentorChars.length > 0 
          ? mentorChars[Math.floor(Math.random() * mentorChars.length)]
          : availableCharacters[0];
      }
          
      case 'achievement': {
        // Prefer characters with high relationship scores
        const highRelationshipChars = availableCharacters.filter((char: Character) => 
          (relationships[char.id] || 0) > 50
        );
        return highRelationshipChars.length > 0
          ? highRelationshipChars[Math.floor(Math.random() * highRelationshipChars.length)]
          : availableCharacters[Math.floor(Math.random() * availableCharacters.length)];
      }
          
      case 'level_complete': {
        // Prefer supportive characters
        const supportiveChars = availableCharacters.filter((char: Character) => 
          char.type === 'Support' || char.personality.includes('Encouraging')
        );
        return supportiveChars.length > 0
          ? supportiveChars[Math.floor(Math.random() * supportiveChars.length)]
          : availableCharacters[Math.floor(Math.random() * availableCharacters.length)];
      }
          
      default: {
        // Random selection with relationship weighting
        const weightedChars = availableCharacters.map((char: Character) => ({
          character: char,
          weight: Math.max(1, (relationships[char.id] || 0) + 50) // Minimum weight of 1
        }));
        
        const totalWeight = weightedChars.reduce((sum, item) => sum + item.weight, 0);
        const randomValue = Math.random() * totalWeight;
        
        let currentWeight = 0;
        for (const item of weightedChars) {
          currentWeight += item.weight;
          if (randomValue <= currentWeight) {
            return item.character;
          }
        }
        
        return availableCharacters[0];
      }
    }
  };

  const createStoryTrigger = useCallback((character: Character, dialogue: string, emotion: StoryTrigger['emotion'], relationshipChange?: number) => {
    const trigger: StoryTrigger = {
      id: `trigger_${Date.now()}`,
      character,
      dialogue,
      emotion,
      relationshipChange,
      timestamp: new Date()
    };

    setStoryTriggers(prev => [trigger, ...prev].slice(0, 10));

    // Auto-remove trigger after display
    setTimeout(() => {
      setStoryTriggers(prev => prev.filter(t => t.id !== trigger.id));
    }, 4000);
  }, []);

  const handleDialogueClose = useCallback(() => {
    setActiveDialogue({ isVisible: false, triggeredBy: 'greeting' });
  }, []);

  const getEventIcon = (eventType: GameEvent['type']) => {
    switch (eventType) {
      case 'game_start': return <Zap className="h-4 w-4" />;
      case 'level_complete': return <Star className="h-4 w-4" />;
      case 'achievement': return <Trophy className="h-4 w-4" />;
      case 'high_score': return <Crown className="h-4 w-4" />;
      case 'victory': return <Trophy className="h-4 w-4" />;
      case 'defeat': return <Heart className="h-4 w-4" />;
      case 'quest_complete': return <Target className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getEventColor = (eventType: GameEvent['type']) => {
    switch (eventType) {
      case 'achievement':
      case 'high_score':
      case 'victory': return 'text-yellow-400';
      case 'level_complete': return 'text-blue-400';
      case 'defeat': return 'text-red-400';
      case 'quest_complete': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <>
      {/* Contextual Narration */}
      <AnimatePresence>
        {contextualNarration && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40"
          >
            <div className="bg-purple-600/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-lg max-w-md text-center">
              <p className="text-sm italic">{contextualNarration}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Story Triggers */}
      <div className="fixed top-24 right-4 z-40 space-y-2">
        <AnimatePresence>
          {storyTriggers.map(trigger => (
            <motion.div
              key={trigger.id}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="bg-gray-800/90 backdrop-blur-sm border border-gray-600 rounded-lg p-4 max-w-sm"
            >
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={trigger.character.avatarUrl} alt={trigger.character.name} />
                  <AvatarFallback>{trigger.character.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-semibold text-white">{trigger.character.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {trigger.emotion}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-300">{trigger.dialogue}</p>
                  {trigger.relationshipChange && (
                    <div className="flex items-center space-x-1 mt-1">
                      <Heart className={`h-3 w-3 ${trigger.relationshipChange > 0 ? 'text-green-400' : 'text-red-400'}`} />
                      <span className={`text-xs ${trigger.relationshipChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {trigger.relationshipChange > 0 ? '+' : ''}{trigger.relationshipChange}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Recent Events Display (Debug/Development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 z-30 bg-gray-900/80 backdrop-blur-sm border border-gray-600 rounded-lg p-4 max-w-sm max-h-40 overflow-y-auto">
          <h4 className="text-sm font-semibold text-white mb-2">Recent Events</h4>
          <div className="space-y-1">
            {recentEvents.slice(0, 5).map(event => (
              <div key={event.id} className="flex items-center space-x-2 text-xs">
                <span className={getEventColor(event.type)}>
                  {getEventIcon(event.type)}
                </span>
                <span className="text-gray-300">{event.type}</span>
                <Badge variant="outline" className="text-xs">
                  {event.triggeredDialogue ? 'Triggered' : 'Pending'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dialogue System */}
      <DialogueSystem
        isVisible={activeDialogue.isVisible}
        onClose={handleDialogueClose}
        triggeredBy={activeDialogue.triggeredBy as 'achievement' | 'defeat' | 'greeting' | 'levelUp' | 'questComplete' | 'questStart' | 'random' | 'victory'}
        playerLevel={playerProfile?.level || 1}
        selectedCharacter={activeDialogue.character}
        relationships={relationships}
        onRelationshipChange={onRelationshipChange}
      />
    </>
  );
};

export default StoryGameIntegration;
