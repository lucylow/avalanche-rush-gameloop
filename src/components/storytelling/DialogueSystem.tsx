// src/components/storytelling/DialogueSystem.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  MessageCircle, 
  Heart, 
  Star, 
  Gift,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Crown,
  Shield
} from 'lucide-react';
import { Character, DialogueNode, getRandomDialogue, getCharacterById } from '../../data/characters';
import { useAudioManager } from '../../hooks/useAudioManager';

interface DialogueSystemProps {
  isVisible: boolean;
  onClose: () => void;
  triggeredBy: 'victory' | 'defeat' | 'levelUp' | 'achievement' | 'questStart' | 'questComplete' | 'random' | 'greeting';
  playerLevel: number;
  selectedCharacter?: Character;
  relationships: Record<string, number>;
  onRelationshipChange?: (characterId: string, change: number) => void;
}

interface DialogueInteraction {
  id: string;
  character: Character;
  dialogue: DialogueNode;
  timestamp: Date;
  context: string;
}

interface DialogueChoice {
  id: string;
  text: string;
  relationshipChange: number;
  unlocks?: string[];
}

const DialogueSystem: React.FC<DialogueSystemProps> = ({
  isVisible,
  onClose,
  triggeredBy,
  playerLevel,
  selectedCharacter,
  relationships,
  onRelationshipChange
}) => {
  const audioManager = useAudioManager();
  
  const [currentDialogue, setCurrentDialogue] = useState<DialogueNode | null>(null);
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [showChoices, setShowChoices] = useState(false);
  const [recentInteractions, setRecentInteractions] = useState<DialogueInteraction[]>([]);
  const [relationshipNotification, setRelationshipNotification] = useState<{character: Character, change: number} | null>(null);

  // Initialize dialogue when component becomes visible
  useEffect(() => {
    if (isVisible) {
      initializeDialogue();
    }
  }, [isVisible, triggeredBy, selectedCharacter]);

  // Typing animation effect
  useEffect(() => {
    if (currentDialogue && isTyping) {
      const text = currentDialogue.text;
      let currentIndex = 0;
      
      const typeInterval = setInterval(() => {
        if (currentIndex <= text.length) {
          setTypedText(text.substring(0, currentIndex));
          currentIndex++;
        } else {
          setIsTyping(false);
          setShowChoices(true);
          clearInterval(typeInterval);
        }
      }, 30); // Typing speed

      return () => clearInterval(typeInterval);
    }
  }, [currentDialogue, isTyping]);

  const initializeDialogue = useCallback(() => {
    if (!isVisible) return;

    let character: Character | null = null;
    
    if (selectedCharacter) {
      character = selectedCharacter;
    } else {
      // Select a random character based on context and relationships
      character = selectContextualCharacter();
    }

    if (!character) return;

    const dialogue = getRandomDialogue(character, triggeredBy);
    if (!dialogue) return;

    setCurrentCharacter(character);
    setCurrentDialogue(dialogue);
    setIsTyping(true);
    setTypedText('');
    setShowChoices(false);

    // Play voice effect if available
    if (dialogue.voiceEffect) {
      audioManager.playSound(dialogue.voiceEffect as any);
    }

    // Record interaction
    recordInteraction(character, dialogue, triggeredBy);
  }, [isVisible, selectedCharacter, triggeredBy, audioManager]);

  const selectContextualCharacter = (): Character | null => {
    // Import characters and select based on context
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { AVALANCHE_CHARACTERS } = require('../../data/characters');
    
    // Filter available characters based on player level and relationships
    const availableCharacters = AVALANCHE_CHARACTERS.filter((char: Character) => {
      const meetsLevelRequirement = char.unlockRequirements.some(req => 
        req.type === 'level' && playerLevel >= (req.value as number)
      );
      return meetsLevelRequirement;
    });

    if (availableCharacters.length === 0) return null;

    // Prefer characters with higher relationships for positive events
    if (['victory', 'achievement', 'levelUp'].includes(triggeredBy)) {
      const highRelationshipChars = availableCharacters.filter((char: Character) => 
        (relationships[char.id] || 0) > 50
      );
      if (highRelationshipChars.length > 0) {
        return highRelationshipChars[Math.floor(Math.random() * highRelationshipChars.length)];
      }
    }

    // For defeat, prefer mentor-type characters
    if (triggeredBy === 'defeat') {
      const mentorChars = availableCharacters.filter((char: Character) => 
        char.personality.includes('Wise') || char.personality.includes('Mentor')
      );
      if (mentorChars.length > 0) {
        return mentorChars[Math.floor(Math.random() * mentorChars.length)];
      }
    }

    // Default to random selection
    return availableCharacters[Math.floor(Math.random() * availableCharacters.length)];
  };

  const recordInteraction = (character: Character, dialogue: DialogueNode, context: string) => {
    const interaction: DialogueInteraction = {
      id: `${character.id}_${Date.now()}`,
      character,
      dialogue,
      timestamp: new Date(),
      context
    };

    setRecentInteractions(prev => [interaction, ...prev].slice(0, 10));
  };

  const handleDialogueChoice = (choice: DialogueChoice) => {
    if (!currentCharacter) return;

    // Apply relationship change
    if (choice.relationshipChange !== 0 && onRelationshipChange) {
      onRelationshipChange(currentCharacter.id, choice.relationshipChange);
      
      // Show relationship notification
      setRelationshipNotification({
        character: currentCharacter,
        change: choice.relationshipChange
      });
      
      setTimeout(() => {
        setRelationshipNotification(null);
      }, 3000);
    }

    // Handle unlocks
    if (choice.unlocks) {
      choice.unlocks.forEach(unlock => {
        console.log(`Unlocked: ${unlock}`);
        // Here you would handle unlocking content
      });
    }

    // Close dialogue after choice
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const getRelationshipLevel = (characterId: string): { level: string, color: string } => {
    const score = relationships[characterId] || 0;
    
    if (score >= 80) return { level: 'Best Friend', color: 'text-pink-400' };
    if (score >= 60) return { level: 'Close Friend', color: 'text-green-400' };
    if (score >= 40) return { level: 'Friend', color: 'text-blue-400' };
    if (score >= 20) return { level: 'Acquaintance', color: 'text-yellow-400' };
    if (score >= 0) return { level: 'Neutral', color: 'text-gray-400' };
    if (score >= -20) return { level: 'Dislike', color: 'text-orange-400' };
    return { level: 'Hostile', color: 'text-red-400' };
  };

  const generateDialogueChoices = (): DialogueChoice[] => {
    if (!currentCharacter) return [];

    const baseChoices: DialogueChoice[] = [
      {
        id: 'positive',
        text: 'Thank you for the encouragement!',
        relationshipChange: 5
      },
      {
        id: 'neutral',
        text: 'I understand.',
        relationshipChange: 1
      },
      {
        id: 'question',
        text: 'Can you tell me more about that?',
        relationshipChange: 3,
        unlocks: ['character_lore']
      }
    ];

    // Add character-specific choices based on personality
    if (currentCharacter.personality.includes('Wise')) {
      baseChoices.push({
        id: 'wisdom',
        text: 'I value your wisdom greatly.',
        relationshipChange: 10
      });
    }

    if (currentCharacter.personality.includes('Ambitious')) {
      baseChoices.push({
        id: 'ambitious',
        text: 'Your ambition inspires me!',
        relationshipChange: 8
      });
    }

    return baseChoices.slice(0, 3); // Limit to 3 choices
  };

  const getEmotionEffect = (emotion: DialogueNode['emotion']): string => {
    switch (emotion) {
      case 'happy': return 'animate-bounce';
      case 'excited': return 'animate-pulse';
      case 'mysterious': return 'animate-ping';
      case 'angry': return 'animate-shake';
      default: return '';
    }
  };

  const getEmotionColor = (emotion: DialogueNode['emotion']): string => {
    switch (emotion) {
      case 'happy': return 'border-green-400';
      case 'sad': return 'border-blue-400';
      case 'angry': return 'border-red-400';
      case 'excited': return 'border-yellow-400';
      case 'mysterious': return 'border-purple-400';
      case 'determined': return 'border-orange-400';
      default: return 'border-gray-400';
    }
  };

  if (!isVisible || !currentCharacter || !currentDialogue) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Relationship Notification */}
          <AnimatePresence>
            {relationshipNotification && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg"
              >
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4" />
                  <span className="text-sm">
                    Relationship with {relationshipNotification.character.name} {relationshipNotification.change > 0 ? 'improved' : 'declined'}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Character Info */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className={`relative ${getEmotionEffect(currentDialogue.emotion)}`}>
                <Avatar className={`h-16 w-16 border-4 ${getEmotionColor(currentDialogue.emotion)}`}>
                  <AvatarImage src={currentCharacter.avatarUrl} alt={currentCharacter.name} />
                  <AvatarFallback>{currentCharacter.name[0]}</AvatarFallback>
                </Avatar>
                {/* Character rarity indicator */}
                <div className="absolute -top-2 -right-2">
                  {currentCharacter.rarity === 'Legendary' && <Crown className="h-6 w-6 text-yellow-500" />}
                  {currentCharacter.rarity === 'Mythic' && <Sparkles className="h-6 w-6 text-purple-500" />}
                  {currentCharacter.rarity === 'Epic' && <Star className="h-6 w-6 text-blue-500" />}
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white">{currentCharacter.name}</h3>
                <p className="text-sm text-gray-400">{currentCharacter.title}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={getRelationshipLevel(currentCharacter.id).color}>
                    {getRelationshipLevel(currentCharacter.id).level}
                  </Badge>
                  <Badge variant="outline">
                    {currentCharacter.faction}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Dialogue Controls */}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-gray-400">
                <Volume2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400">
                ✕
              </Button>
            </div>
          </div>

          {/* Dialogue Content */}
          <Card className="bg-gray-800/50 border-gray-700 mb-6">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <MessageCircle className={`h-5 w-5 mt-1 ${getEmotionColor(currentDialogue.emotion).replace('border-', 'text-')}`} />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="outline" className={getEmotionColor(currentDialogue.emotion).replace('border-', 'text-')}>
                      {currentDialogue.emotion}
                    </Badge>
                  </div>
                  <p className="text-lg text-white leading-relaxed">
                    {isTyping ? (
                      <>
                        {typedText}
                        <span className="animate-pulse">|</span>
                      </>
                    ) : (
                      currentDialogue.text
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dialogue Choices */}
          {showChoices && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <h4 className="text-white font-semibold">How do you respond?</h4>
              {generateDialogueChoices().map((choice) => (
                <Button
                  key={choice.id}
                  variant="outline"
                  className="w-full text-left justify-start h-auto p-4 bg-gray-800/30 border-gray-600 hover:bg-gray-700/50 text-white transition-all duration-200"
                  onClick={() => handleDialogueChoice(choice)}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{choice.text}</span>
                    <div className="flex items-center space-x-2">
                      {choice.relationshipChange !== 0 && (
                        <div className="flex items-center space-x-1">
                          <Heart className={`h-3 w-3 ${choice.relationshipChange > 0 ? 'text-green-400' : 'text-red-400'}`} />
                          <span className={`text-xs ${choice.relationshipChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {choice.relationshipChange > 0 ? '+' : ''}{choice.relationshipChange}
                          </span>
                        </div>
                      )}
                      {choice.unlocks && (
                        <Gift className="h-3 w-3 text-yellow-400" />
                      )}
                    </div>
                  </div>
                </Button>
              ))}
            </motion.div>
          )}

          {/* Context Information */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <span>Context:</span>
                <Badge variant="secondary">{triggeredBy}</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <span>Relationship Score:</span>
                <span className={getRelationshipLevel(currentCharacter.id).color}>
                  {relationships[currentCharacter.id] || 0}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DialogueSystem;
