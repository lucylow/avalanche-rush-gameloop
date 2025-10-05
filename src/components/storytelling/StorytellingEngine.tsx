// src/components/storytelling/StorytellingEngine.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { 
  Book, 
  Play, 
  FastForward, 
  SkipForward,
  Volume2, 
  VolumeX,
  Star,
  Crown,
  Scroll,
  Users,
  Heart,
  Swords,
  Eye,
  MessageCircle
} from 'lucide-react';
import { Character, StoryArc, StoryScene, DialogueNode, StoryChoice, getCharacterById, getRandomDialogue } from '../../data/characters';
import { useAudioManager } from '../../hooks/useAudioManager';

interface StorytellingEngineProps {
  playerLevel: number;
  achievements: string[];
  completedQuests: string[];
  onStoryComplete?: (storyId: string, rewards: Array<{type: string; amount?: number; item?: string}>) => void;
  onChoiceMade?: (choiceId: string, consequences: Record<string, unknown>) => void;
}

interface StoryState {
  activeStory: StoryArc | null;
  currentScene: StoryScene | null;
  currentDialogueIndex: number;
  isPlaying: boolean;
  autoPlay: boolean;
  playbackSpeed: number;
  relationships: Record<string, number>; // characterId -> relationship score
  unlockedStories: string[];
  completedStories: string[];
  storyProgress: Record<string, number>; // storyId -> progress percentage
}

interface StoryNotification {
  id: string;
  type: 'story_unlock' | 'relationship_change' | 'choice_consequence';
  title: string;
  description: string;
  character?: Character;
  timestamp: Date;
}

const StorytellingEngine: React.FC<StorytellingEngineProps> = ({
  playerLevel,
  achievements,
  completedQuests,
  onStoryComplete,
  onChoiceMade
}) => {
  const audioManager = useAudioManager();
  
  const [storyState, setStoryState] = useState<StoryState>({
    activeStory: null,
    currentScene: null,
    currentDialogueIndex: 0,
    isPlaying: false,
    autoPlay: true,
    playbackSpeed: 1,
    relationships: {},
    unlockedStories: [],
    completedStories: [],
    storyProgress: {}
  });
  
  const [notifications, setNotifications] = useState<StoryNotification[]>([]);
  const [showStoryDialog, setShowStoryDialog] = useState(false);
  const [availableStories, setAvailableStories] = useState<StoryArc[]>([]);
  const [characterRelationships, setCharacterRelationships] = useState<Record<string, number>>({});

  // Initialize storytelling system
  useEffect(() => {
    initializeStorySystem();
  }, [playerLevel, achievements, completedQuests]);

  const initializeStorySystem = useCallback(() => {
    // Load saved story progress
    const savedProgress = localStorage.getItem('avalanche-rush-story-progress');
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        setStoryState(prev => ({ ...prev, ...progress }));
      } catch (error) {
        console.warn('Failed to load story progress:', error);
      }
    }

    // Load relationship data
    const savedRelationships = localStorage.getItem('avalanche-rush-relationships');
    if (savedRelationships) {
      try {
        const relationships = JSON.parse(savedRelationships);
        setCharacterRelationships(relationships);
      } catch (error) {
        console.warn('Failed to load relationships:', error);
      }
    }

    // Check for newly unlocked stories
    checkForUnlockedStories();
  }, [playerLevel, achievements, completedQuests]);

  // Save progress whenever story state changes
  useEffect(() => {
    localStorage.setItem('avalanche-rush-story-progress', JSON.stringify(storyState));
  }, [storyState]);

  useEffect(() => {
    localStorage.setItem('avalanche-rush-relationships', JSON.stringify(characterRelationships));
  }, [characterRelationships]);

  const checkForUnlockedStories = useCallback(() => {
    // Get all characters and their story arcs
    import('../../data/characters').then(({ AVALANCHE_CHARACTERS }) => {
      const allStories: StoryArc[] = [];
      
      AVALANCHE_CHARACTERS.forEach(character => {
        character.storyArcs.forEach(arc => {
          // Check if story meets unlock requirements
          const meetsLevelRequirement = playerLevel >= arc.unlockLevel;
          const meetsPrerequisites = arc.prerequisites.every(prereq => 
            achievements.includes(prereq) || 
            completedQuests.includes(prereq) ||
            storyState.completedStories.includes(prereq)
          );
          
          if (meetsLevelRequirement && meetsPrerequisites && !storyState.unlockedStories.includes(arc.id)) {
            allStories.push({ ...arc });
            
            // Add notification for newly unlocked story
            addNotification({
              id: `story_unlock_${arc.id}`,
              type: 'story_unlock',
              title: 'New Story Unlocked!',
              description: `${arc.title} is now available`,
              character: character,
              timestamp: new Date()
            });
          }
        });
      });
      
      setAvailableStories(allStories);
      setStoryState(prev => ({
        ...prev,
        unlockedStories: [...prev.unlockedStories, ...allStories.map(s => s.id)]
      }));
    });
  }, [playerLevel, achievements, completedQuests, storyState.completedStories, storyState.unlockedStories]);

  const addNotification = (notification: StoryNotification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 10)); // Keep only last 10 notifications
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const startStory = useCallback((storyArc: StoryArc) => {
    if (!storyArc.scenes || storyArc.scenes.length === 0) return;
    
    setStoryState(prev => ({
      ...prev,
      activeStory: storyArc,
      currentScene: storyArc.scenes[0],
      currentDialogueIndex: 0,
      isPlaying: true
    }));
    
    setShowStoryDialog(true);
    
    // Play story start sound
    audioManager.playSound('menuOpen');
  }, [audioManager]);

  const nextDialogue = useCallback(() => {
    if (!storyState.activeStory || !storyState.currentScene) return;
    
    const scene = storyState.currentScene;
    const nextIndex = storyState.currentDialogueIndex + 1;
    
    if (nextIndex < scene.dialogue.length) {
      // Move to next dialogue in current scene
      setStoryState(prev => ({
        ...prev,
        currentDialogueIndex: nextIndex
      }));
      
      // Play dialogue sound based on emotion
      const currentDialogue = scene.dialogue[nextIndex];
      if (currentDialogue.voiceEffect) {
        audioManager.playSound(currentDialogue.voiceEffect as any);
      } else {
        audioManager.playSound('buttonClick' as any);
      }
    } else {
      // Scene finished, check for choices or next scene
      if (scene.choices && scene.choices.length > 0) {
        // Show choice interface
        return;
      } else {
        completeScene();
      }
    }
  }, [storyState, audioManager]);

  const completeScene = useCallback(() => {
    if (!storyState.activeStory || !storyState.currentScene) return;
    
    const story = storyState.activeStory;
    const currentSceneIndex = story.scenes.findIndex(s => s.id === storyState.currentScene!.id);
    const nextSceneIndex = currentSceneIndex + 1;
    
    if (nextSceneIndex < story.scenes.length) {
      // Move to next scene
      setStoryState(prev => ({
        ...prev,
        currentScene: story.scenes[nextSceneIndex],
        currentDialogueIndex: 0
      }));
    } else {
      // Story completed
      completeStory();
    }
  }, [storyState]);

  const completeStory = useCallback(() => {
    if (!storyState.activeStory) return;
    
    const story = storyState.activeStory;
    
    // Mark story as completed
    setStoryState(prev => ({
      ...prev,
      completedStories: [...prev.completedStories, story.id],
      activeStory: null,
      currentScene: null,
      currentDialogueIndex: 0,
      isPlaying: false,
      storyProgress: {
        ...prev.storyProgress,
        [story.id]: 100
      }
    }));
    
    // Close dialog
    setShowStoryDialog(false);
    
    // Give rewards
    if (story.rewards && onStoryComplete) {
      onStoryComplete(story.id, story.rewards);
    }
    
    // Play completion sound
    audioManager.playSound('achievement');
    
    // Add completion notification
    addNotification({
      id: `story_complete_${story.id}`,
      type: 'story_unlock',
      title: 'Story Completed!',
      description: `You completed ${story.title}`,
      timestamp: new Date()
    });
  }, [storyState.activeStory, onStoryComplete, audioManager]);

  const makeChoice = useCallback((choice: StoryChoice) => {
    if (!storyState.activeStory || !storyState.currentScene) return;
    
    // Apply relationship changes
    if (choice.affectsRelationship) {
      const { characterId, change } = choice.affectsRelationship;
      setCharacterRelationships(prev => ({
        ...prev,
        [characterId]: (prev[characterId] || 0) + change
      }));
      
      // Add relationship change notification
      const character = getCharacterById(characterId);
      if (character) {
        addNotification({
          id: `relationship_${characterId}_${Date.now()}`,
          type: 'relationship_change',
          title: 'Relationship Changed',
          description: `Your relationship with ${character.name} ${change > 0 ? 'improved' : 'worsened'}`,
          character: character,
          timestamp: new Date()
        });
      }
    }
    
    // Handle unlocks and blocks
    if (choice.unlocks) {
      choice.unlocks.forEach(unlock => {
        // Handle different types of unlocks
        console.log(`Unlocked: ${unlock}`);
      });
    }
    
    if (choice.blocks) {
      choice.blocks.forEach(block => {
        // Handle blocking content
        console.log(`Blocked: ${block}`);
      });
    }
    
    // Notify parent component
    if (onChoiceMade) {
      onChoiceMade(choice.id, {
        consequence: choice.consequence,
        relationshipChange: choice.affectsRelationship,
        unlocks: choice.unlocks,
        blocks: choice.blocks
      });
    }
    
    // Continue to next scene or complete story
    completeScene();
    
    // Play choice sound
    audioManager.playSound('buttonClick');
  }, [storyState, onChoiceMade, audioManager]);

  const skipStory = useCallback(() => {
    if (storyState.activeStory) {
      completeStory();
    }
  }, [storyState.activeStory, completeStory]);

  const toggleAutoPlay = useCallback(() => {
    setStoryState(prev => ({ ...prev, autoPlay: !prev.autoPlay }));
  }, []);

  const adjustPlaybackSpeed = useCallback((speed: number) => {
    setStoryState(prev => ({ ...prev, playbackSpeed: speed }));
  }, []);

  // Auto-play dialogue
  useEffect(() => {
    if (storyState.autoPlay && storyState.isPlaying && storyState.currentScene) {
      const timer = setTimeout(() => {
        nextDialogue();
      }, 3000 / storyState.playbackSpeed);
      
      return () => clearTimeout(timer);
    }
  }, [storyState.autoPlay, storyState.isPlaying, storyState.currentDialogueIndex, storyState.playbackSpeed, nextDialogue]);

  const getCurrentDialogue = (): DialogueNode | null => {
    if (!storyState.currentScene || storyState.currentDialogueIndex >= storyState.currentScene.dialogue.length) {
      return null;
    }
    return storyState.currentScene.dialogue[storyState.currentDialogueIndex];
  };

  const getCurrentChoices = (): StoryChoice[] | null => {
    if (!storyState.currentScene || storyState.currentDialogueIndex < storyState.currentScene.dialogue.length - 1) {
      return null;
    }
    return storyState.currentScene.choices || null;
  };

  const getCharacterAvatar = (characterName: string): string => {
    // In a real implementation, this would fetch the character's avatar
    return '/avatars/default.png';
  };

  const getEmotionColor = (emotion: DialogueNode['emotion']): string => {
    switch (emotion) {
      case 'happy': return 'text-green-400';
      case 'sad': return 'text-blue-400';
      case 'angry': return 'text-red-400';
      case 'excited': return 'text-yellow-400';
      case 'mysterious': return 'text-purple-400';
      case 'determined': return 'text-orange-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <>
      {/* Story Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm"
            >
              <div className="flex items-center space-x-2">
                {notification.type === 'story_unlock' && <Book className="h-5 w-5" />}
                {notification.type === 'relationship_change' && <Heart className="h-5 w-5" />}
                {notification.character && (
                  <img 
                    src={notification.character.avatarUrl} 
                    alt={notification.character.name}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div>
                  <div className="font-semibold">{notification.title}</div>
                  <div className="text-sm text-blue-100">{notification.description}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Available Stories Panel */}
      {availableStories.length > 0 && (
        <Card className="mb-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Scroll className="h-5 w-5" />
              <span>Available Stories</span>
              <Badge variant="secondary">{availableStories.length}</Badge>
            </CardTitle>
            <CardDescription>
              New stories are waiting to unfold based on your progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableStories.slice(0, 4).map((story) => (
                <Card key={story.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors cursor-pointer"
                      onClick={() => startStory(story)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">{story.title}</h4>
                        <p className="text-sm text-gray-300 mb-2">{story.description}</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          <span>Chapter {story.chapter}</span>
                          <span>•</span>
                          <span>{story.scenes.length} scenes</span>
                        </div>
                      </div>
                      <Button size="sm" className="ml-2">
                        <Play className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Story Dialog */}
      <Dialog open={showStoryDialog} onOpenChange={setShowStoryDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden bg-gray-900 border-gray-700">
          {storyState.currentScene && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Book className="h-5 w-5" />
                    <span>{storyState.activeStory?.title}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleAutoPlay}
                      className="text-gray-400"
                    >
                      {storyState.autoPlay ? <FastForward className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={skipStory}
                      className="text-gray-400"
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </div>
                </DialogTitle>
                <DialogDescription className="text-gray-300">
                  {storyState.currentScene.setting}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Scene Description */}
                <div className="bg-gray-800/30 p-4 rounded-lg">
                  <p className="text-gray-300 italic">{storyState.currentScene.description}</p>
                </div>

                {/* Current Dialogue */}
                {(() => {
                  const dialogue = getCurrentDialogue();
                  if (!dialogue) return null;

                  return (
                    <motion.div
                      key={storyState.currentDialogueIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-800/50 p-4 rounded-lg"
                    >
                      <div className="flex items-start space-x-3">
                        {dialogue.speaker !== 'narrator' && (
                          <img
                            src={getCharacterAvatar(dialogue.speaker)}
                            alt={dialogue.speaker}
                            className="w-12 h-12 rounded-full border-2 border-gray-600"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-semibold text-white">
                              {dialogue.speaker === 'narrator' ? 'Narrator' : dialogue.speaker}
                            </span>
                            <Badge variant="outline" className={getEmotionColor(dialogue.emotion)}>
                              {dialogue.emotion}
                            </Badge>
                          </div>
                          <p className={`text-lg ${getEmotionColor(dialogue.emotion)}`}>
                            {dialogue.text}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })()}

                {/* Story Choices */}
                {(() => {
                  const choices = getCurrentChoices();
                  if (!choices) return null;

                  return (
                    <div className="space-y-2">
                      <h4 className="text-white font-semibold">Choose your response:</h4>
                      {choices.map((choice) => (
                        <Button
                          key={choice.id}
                          variant="outline"
                          className="w-full text-left justify-start h-auto p-4 bg-gray-800/30 border-gray-600 hover:bg-gray-700/50 text-white"
                          onClick={() => makeChoice(choice)}
                        >
                          <div>
                            <div className="font-medium mb-1">{choice.text}</div>
                            <div className="text-xs text-gray-400">{choice.consequence}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  );
                })()}

                {/* Continue Button */}
                {!getCurrentChoices() && (
                  <div className="flex justify-center pt-4">
                    <Button onClick={nextDialogue} className="bg-blue-600 hover:bg-blue-700">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Continue
                    </Button>
                  </div>
                )}

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Scene Progress</span>
                    <span>{storyState.currentDialogueIndex + 1} / {storyState.currentScene.dialogue.length}</span>
                  </div>
                  <Progress 
                    value={(storyState.currentDialogueIndex + 1) / storyState.currentScene.dialogue.length * 100} 
                    className="h-2"
                  />
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StorytellingEngine;
