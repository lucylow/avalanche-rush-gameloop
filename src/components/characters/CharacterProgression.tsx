// src/components/characters/CharacterProgression.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  TrendingUp, 
  Star, 
  Crown, 
  Zap,
  Shield,
  Sword,
  Heart,
  Brain,
  Target,
  Sparkles,
  Trophy,
  Gift,
  Unlock,
  ChevronRight,
  Plus,
  ArrowUp
} from 'lucide-react';
import { Character, EvolutionPath, getCharacterById, AVALANCHE_CHARACTERS } from '../../data/characters';
import { useAudioManager } from '../../hooks/useAudioManager';

interface CharacterProgressionProps {
  playerLevel: number;
  achievements: string[];
  completedQuests: string[];
  selectedCharacter?: Character;
  onCharacterEvolution?: (characterId: string, stage: number) => void;
  onUnlockRequirement?: (requirement: string) => void;
}

interface CharacterProgressData {
  characterId: string;
  experience: number;
  evolutionStage: number;
  unlockedSkills: string[];
  unlockedAbilities: string[];
  relationshipLevel: number;
  bondLevel: number;
  customizations: string[];
}

interface EvolutionPreview {
  character: Character;
  currentStage: number;
  nextStage?: EvolutionPath;
  canEvolve: boolean;
  missingRequirements: string[];
}

const CharacterProgression: React.FC<CharacterProgressionProps> = ({
  playerLevel,
  achievements,
  completedQuests,
  selectedCharacter,
  onCharacterEvolution,
  onUnlockRequirement
}) => {
  const audioManager = useAudioManager();
  
  const [characterProgress, setCharacterProgress] = useState<Record<string, CharacterProgressData>>({});
  const [showEvolutionDialog, setShowEvolutionDialog] = useState(false);
  const [evolutionPreview, setEvolutionPreview] = useState<EvolutionPreview | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCharacterForProgression, setSelectedCharacterForProgression] = useState<Character | null>(null);
  const [availableCharacters, setAvailableCharacters] = useState<Character[]>([]);

  // Initialize progression system
  useEffect(() => {
    initializeProgression();
  }, [playerLevel, achievements, completedQuests]);

  const initializeProgression = useCallback(() => {
    // Load saved progression data
    const savedProgress = localStorage.getItem('avalanche-rush-character-progress');
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        setCharacterProgress(progress);
      } catch (error) {
        console.warn('Failed to load character progress:', error);
      }
    }

    // Filter available characters based on unlock requirements
    const unlocked = AVALANCHE_CHARACTERS.filter(character => {
      return character.unlockRequirements.every(requirement => {
        switch (requirement.type) {
          case 'level':
            return playerLevel >= (requirement.value as number);
          case 'achievement':
            return achievements.includes(requirement.value as string);
          case 'quest':
            return completedQuests.includes(requirement.value as string);
          case 'character': {
            // Check if required character is unlocked
            const requiredChar = getCharacterById(requirement.value as string);
            return requiredChar ? isCharacterUnlocked(requiredChar) : false;
          }
          default:
            return true;
        }
      });
    });

    setAvailableCharacters(unlocked);

    // Initialize progress data for newly unlocked characters
    unlocked.forEach(character => {
      if (!characterProgress[character.id]) {
        setCharacterProgress(prev => ({
          ...prev,
          [character.id]: {
            characterId: character.id,
            experience: 0,
            evolutionStage: 0,
            unlockedSkills: [...character.skills],
            unlockedAbilities: [...character.specialAbilities],
            relationshipLevel: 0,
            bondLevel: 1,
            customizations: []
          }
        }));
      }
    });
  }, [playerLevel, achievements, completedQuests, characterProgress]);

  // Save progress whenever it changes
  useEffect(() => {
    localStorage.setItem('avalanche-rush-character-progress', JSON.stringify(characterProgress));
  }, [characterProgress]);

  const isCharacterUnlocked = (character: Character): boolean => {
    return availableCharacters.some(c => c.id === character.id);
  };

  const getCharacterProgress = (characterId: string): CharacterProgressData => {
    return characterProgress[characterId] || {
      characterId,
      experience: 0,
      evolutionStage: 0,
      unlockedSkills: [],
      unlockedAbilities: [],
      relationshipLevel: 0,
      bondLevel: 1,
      customizations: []
    };
  };

  const addCharacterExperience = useCallback((characterId: string, amount: number) => {
    setCharacterProgress(prev => {
      const current = getCharacterProgress(characterId);
      const newExperience = current.experience + amount;
      
      // Check for bond level increases
      const newBondLevel = Math.floor(newExperience / 1000) + 1;
      
      return {
        ...prev,
        [characterId]: {
          ...current,
          experience: newExperience,
          bondLevel: Math.min(newBondLevel, 10) // Max bond level 10
        }
      };
    });

    // Play experience gain sound
    audioManager.playSound('coinCollect');
  }, [audioManager]);

  const canCharacterEvolve = (character: Character, currentStage: number): { canEvolve: boolean, nextStage?: EvolutionPath, missingRequirements: string[] } => {
    if (!character.evolutionPath) return { canEvolve: false, missingRequirements: [] };
    
    const nextStage = character.evolutionPath.find(stage => stage.stage === currentStage + 1);
    if (!nextStage) return { canEvolve: false, missingRequirements: [] };

    const missingRequirements: string[] = [];
    
    nextStage.requirements.forEach(requirement => {
      switch (requirement.type) {
        case 'level':
          if (playerLevel < (requirement.value as number)) {
            missingRequirements.push(`Player Level ${requirement.value}`);
          }
          break;
        case 'achievement':
          if (!achievements.includes(requirement.value as string)) {
            missingRequirements.push(`Achievement: ${requirement.description}`);
          }
          break;
        case 'quest':
          if (!completedQuests.includes(requirement.value as string)) {
            missingRequirements.push(`Quest: ${requirement.description}`);
          }
          break;
      }
    });

    return {
      canEvolve: missingRequirements.length === 0,
      nextStage,
      missingRequirements
    };
  };

  const startEvolution = (character: Character) => {
    const progress = getCharacterProgress(character.id);
    const evolution = canCharacterEvolve(character, progress.evolutionStage);
    
    setEvolutionPreview({
      character,
      currentStage: progress.evolutionStage,
      ...evolution
    });
    
    setShowEvolutionDialog(true);
  };

  const confirmEvolution = () => {
    if (!evolutionPreview || !evolutionPreview.canEvolve || !evolutionPreview.nextStage) return;

    const { character, nextStage } = evolutionPreview;
    const progress = getCharacterProgress(character.id);

    // Apply evolution changes
    setCharacterProgress(prev => ({
      ...prev,
      [character.id]: {
        ...progress,
        evolutionStage: nextStage.stage,
        unlockedSkills: [
          ...progress.unlockedSkills,
          ...(nextStage.changes.newSkills || [])
        ],
        unlockedAbilities: [
          ...progress.unlockedAbilities,
          ...(nextStage.changes.newAbilities || [])
        ]
      }
    }));

    // Play evolution sound
    audioManager.playSound('achievement');
    audioManager.playSound('levelUp');

    // Notify parent component
    if (onCharacterEvolution) {
      onCharacterEvolution(character.id, nextStage.stage);
    }

    // Close dialog
    setShowEvolutionDialog(false);
    setEvolutionPreview(null);
  };

  const getBondLevelName = (level: number): string => {
    const levels = [
      'Stranger', 'Acquaintance', 'Friend', 'Close Friend', 'Trusted Ally',
      'Best Friend', 'Soulmate', 'Eternal Bond', 'Legendary Partnership', 'Mythic Unity'
    ];
    return levels[Math.min(level - 1, levels.length - 1)] || 'Unknown';
  };

  const getBondLevelColor = (level: number): string => {
    if (level >= 9) return 'text-purple-400';
    if (level >= 7) return 'text-blue-400';
    if (level >= 5) return 'text-green-400';
    if (level >= 3) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getAttributeIcon = (attribute: string) => {
    switch (attribute) {
      case 'strength': return <Sword className="h-4 w-4" />;
      case 'intelligence': return <Brain className="h-4 w-4" />;
      case 'agility': return <Zap className="h-4 w-4" />;
      case 'defense': return <Shield className="h-4 w-4" />;
      case 'speed': return <Target className="h-4 w-4" />;
      case 'luck': return <Star className="h-4 w-4" />;
      case 'charisma': return <Heart className="h-4 w-4" />;
      case 'wisdom': return <Crown className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  const renderCharacterCard = (character: Character) => {
    const progress = getCharacterProgress(character.id);
    const evolution = canCharacterEvolve(character, progress.evolutionStage);
    const currentEvolution = character.evolutionPath?.find(stage => stage.stage === progress.evolutionStage);

    return (
      <Card 
        key={character.id}
        className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all cursor-pointer"
        onClick={() => setSelectedCharacterForProgression(character)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12 border-2 border-gray-600">
                <AvatarImage src={character.avatarUrl} alt={character.name} />
                <AvatarFallback>{character.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg text-white">{character.name}</CardTitle>
                <CardDescription className="text-gray-400">
                  {currentEvolution ? currentEvolution.name : character.title}
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-1">
              <Badge className={getBondLevelColor(progress.bondLevel)}>
                Bond Lv.{progress.bondLevel}
              </Badge>
              {evolution.canEvolve && (
                <Badge className="bg-green-600 text-white animate-pulse">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  Ready!
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Experience Progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Experience</span>
              <span className="text-white">{progress.experience.toLocaleString()}</span>
            </div>
            <Progress 
              value={(progress.experience % 1000) / 10} // Each bond level requires 1000 exp
              className="h-2"
            />
          </div>

          {/* Bond Level */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Bond Level</span>
            <div className="flex items-center space-x-2">
              <Heart className={`h-4 w-4 ${getBondLevelColor(progress.bondLevel)}`} />
              <span className={`text-sm font-semibold ${getBondLevelColor(progress.bondLevel)}`}>
                {getBondLevelName(progress.bondLevel)}
              </span>
            </div>
          </div>

          {/* Evolution Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Evolution</span>
            <div className="flex items-center space-x-2">
              {evolution.canEvolve ? (
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    startEvolution(character);
                  }}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Evolve
                </Button>
              ) : evolution.nextStage ? (
                <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                  Stage {evolution.nextStage.stage} Available
                </Badge>
              ) : (
                <Badge variant="outline" className="text-gray-400">
                  Max Evolution
                </Badge>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-1">
              <Trophy className="h-3 w-3 text-yellow-400" />
              <span className="text-gray-400">Skills: {progress.unlockedSkills.length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 text-blue-400" />
              <span className="text-gray-400">Abilities: {progress.unlockedAbilities.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white">Character Progression</h2>
          <p className="text-gray-400">
            Develop deeper bonds with your characters and unlock their true potential
          </p>
        </div>

        {/* Progression Overview */}
        <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{availableCharacters.length}</div>
                <div className="text-sm text-gray-300">Unlocked Characters</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {Object.values(characterProgress).filter(p => p.bondLevel >= 5).length}
                </div>
                <div className="text-sm text-gray-300">Trusted Allies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {Object.values(characterProgress).filter(p => p.evolutionStage > 0).length}
                </div>
                <div className="text-sm text-gray-300">Evolved Characters</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {Object.values(characterProgress).reduce((sum, p) => sum + p.experience, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-300">Total Experience</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Character Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableCharacters.map(renderCharacterCard)}
        </div>

        {/* Evolution Ready Characters */}
        {availableCharacters.some(char => canCharacterEvolve(char, getCharacterProgress(char.id).evolutionStage).canEvolve) && (
          <Card className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5" />
                <span>Ready for Evolution</span>
              </CardTitle>
              <CardDescription>
                These characters have met all requirements for their next evolution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableCharacters
                  .filter(char => canCharacterEvolve(char, getCharacterProgress(char.id).evolutionStage).canEvolve)
                  .map(character => (
                    <div 
                      key={character.id}
                      className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={character.avatarUrl} alt={character.name} />
                          <AvatarFallback>{character.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-white">{character.name}</div>
                          <div className="text-sm text-gray-300">Ready for next stage</div>
                        </div>
                      </div>
                      <Button 
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => startEvolution(character)}
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        Evolve
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Evolution Dialog */}
      <Dialog open={showEvolutionDialog} onOpenChange={setShowEvolutionDialog}>
        <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
          {evolutionPreview && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Sparkles className="h-6 w-6 text-purple-500" />
                  <span>Character Evolution</span>
                </DialogTitle>
                <DialogDescription>
                  {evolutionPreview.character.name} is ready to evolve to the next stage
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Character Display */}
                <div className="flex items-center justify-center space-x-8">
                  <div className="text-center">
                    <Avatar className="h-20 w-20 border-4 border-blue-500 mx-auto mb-2">
                      <AvatarImage src={evolutionPreview.character.avatarUrl} alt={evolutionPreview.character.name} />
                      <AvatarFallback>{evolutionPreview.character.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="font-semibold text-white">{evolutionPreview.character.title}</div>
                    <div className="text-sm text-gray-400">Current Form</div>
                  </div>

                  <ChevronRight className="h-8 w-8 text-purple-500" />

                  <div className="text-center">
                    <Avatar className="h-20 w-20 border-4 border-purple-500 mx-auto mb-2 animate-pulse">
                      <AvatarImage src={evolutionPreview.character.avatarUrl} alt={evolutionPreview.character.name} />
                      <AvatarFallback>{evolutionPreview.character.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="font-semibold text-purple-400">
                      {evolutionPreview.nextStage?.name || 'Max Evolution'}
                    </div>
                    <div className="text-sm text-gray-400">Evolved Form</div>
                  </div>
                </div>

                {evolutionPreview.canEvolve && evolutionPreview.nextStage ? (
                  <>
                    {/* Evolution Benefits */}
                    <Card className="bg-purple-500/10 border-purple-500/30">
                      <CardHeader>
                        <CardTitle className="text-lg">Evolution Benefits</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Attribute Bonuses */}
                        {evolutionPreview.nextStage.changes.attributeBonus && (
                          <div>
                            <h4 className="font-semibold text-white mb-2">Attribute Bonuses</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {Object.entries(evolutionPreview.nextStage.changes.attributeBonus).map(([attr, bonus]) => (
                                <div key={attr} className="flex items-center space-x-2">
                                  {getAttributeIcon(attr)}
                                  <span className="text-sm text-gray-300 capitalize">{attr}</span>
                                  <span className="text-sm text-green-400">+{bonus}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* New Skills */}
                        {evolutionPreview.nextStage.changes.newSkills && (
                          <div>
                            <h4 className="font-semibold text-white mb-2">New Skills</h4>
                            <div className="flex flex-wrap gap-2">
                              {evolutionPreview.nextStage.changes.newSkills.map(skill => (
                                <Badge key={skill} className="bg-blue-600 text-white">
                                  <Plus className="h-3 w-3 mr-1" />
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* New Abilities */}
                        {evolutionPreview.nextStage.changes.newAbilities && (
                          <div>
                            <h4 className="font-semibold text-white mb-2">New Abilities</h4>
                            <div className="flex flex-wrap gap-2">
                              {evolutionPreview.nextStage.changes.newAbilities.map(ability => (
                                <Badge key={ability} className="bg-purple-600 text-white">
                                  <Star className="h-3 w-3 mr-1" />
                                  {ability}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Visual Changes */}
                        {evolutionPreview.nextStage.changes.visualChanges && (
                          <div>
                            <h4 className="font-semibold text-white mb-2">Visual Enhancements</h4>
                            <div className="flex flex-wrap gap-2">
                              {evolutionPreview.nextStage.changes.visualChanges.map(change => (
                                <Badge key={change} className="bg-yellow-600 text-white">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  {change}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Evolution Confirmation */}
                    <div className="flex justify-end space-x-3">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowEvolutionDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={confirmEvolution}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Confirm Evolution
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Missing Requirements */}
                    <Card className="bg-red-500/10 border-red-500/30">
                      <CardHeader>
                        <CardTitle className="text-lg text-red-400">Missing Requirements</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {evolutionPreview.missingRequirements.map((requirement, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Unlock className="h-4 w-4 text-red-400" />
                              <span className="text-red-300">{requirement}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex justify-end">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowEvolutionDialog(false)}
                      >
                        Close
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CharacterProgression;
