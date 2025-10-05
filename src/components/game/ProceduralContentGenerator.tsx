import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { X, Shuffle, Sparkles, Square, Zap, Star } from 'lucide-react';

interface ProceduralEvent {
  id: string;
  type: 'quest' | 'challenge' | 'bonus' | 'special' | 'evolution';
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  rewards: ProceduralReward[];
  requirements: ProceduralRequirement[];
  duration: number; // in minutes
  isActive: boolean;
  generatedAt: number;
  expiresAt: number;
  vrfSeed: string;
}

interface ProceduralReward {
  type: 'nft' | 'token' | 'xp' | 'powerup' | 'evolution';
  amount: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
  isClaimed: boolean;
}

interface ProceduralRequirement {
  type: 'score' | 'time' | 'combo' | 'chain' | 'social';
  target: number;
  current: number;
  description: string;
  isCompleted: boolean;
}

interface ProceduralContentGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onEventGenerated: (event: ProceduralEvent) => void;
  playerLevel: number;
  playerScore: number;
  playerHistory: any[];
}

const ProceduralContentGenerator: React.FC<ProceduralContentGeneratorProps> = ({
  isOpen,
  onClose,
  onEventGenerated,
  playerLevel,
  playerScore,
  playerHistory
}) => {
  const [events, setEvents] = useState<ProceduralEvent[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<ProceduralEvent | null>(null);

  // Mock VRF simulation
  const generateVRFSeed = useCallback(() => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }, []);

  // Generate procedural content based on player data
  const generateProceduralEvent = useCallback(async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate VRF request
    for (let i = 0; i <= 100; i += 10) {
      setGenerationProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const vrfSeed = generateVRFSeed();
    const randomValue = parseInt(vrfSeed.substring(0, 8), 36) % 1000;

    // Determine event type based on player level and random value
    let eventType: ProceduralEvent['type'];
    if (playerLevel >= 10 && randomValue < 50) {
      eventType = 'evolution';
    } else if (playerScore > 10000 && randomValue < 100) {
      eventType = 'special';
    } else if (randomValue < 300) {
      eventType = 'quest';
    } else if (randomValue < 600) {
      eventType = 'challenge';
    } else {
      eventType = 'bonus';
    }

    // Determine difficulty based on player level
    let difficulty: ProceduralEvent['difficulty'];
    if (playerLevel >= 20) {
      difficulty = 'legendary';
    } else if (playerLevel >= 15) {
      difficulty = 'hard';
    } else if (playerLevel >= 10) {
      difficulty = 'medium';
    } else {
      difficulty = 'easy';
    }

    // Determine rarity based on random value
    let rarity: ProceduralEvent['rarity'];
    if (randomValue < 50) {
      rarity = 'legendary';
    } else if (randomValue < 150) {
      rarity = 'epic';
    } else if (randomValue < 350) {
      rarity = 'rare';
    } else {
      rarity = 'common';
    }

    // Generate event based on type
    const event: ProceduralEvent = {
      id: `procedural-${Date.now()}`,
      type: eventType,
      title: generateEventTitle(eventType, difficulty, rarity),
      description: generateEventDescription(eventType, difficulty, rarity),
      difficulty,
      rarity,
      rewards: generateRewards(eventType, difficulty, rarity),
      requirements: generateRequirements(eventType, difficulty, playerLevel),
      duration: generateDuration(eventType, difficulty),
      isActive: true,
      generatedAt: Date.now(),
      expiresAt: Date.now() + (generateDuration(eventType, difficulty) * 60 * 1000),
      vrfSeed
    };

    setEvents(prev => [event, ...prev]);
    onEventGenerated(event);
    setIsGenerating(false);
    setGenerationProgress(0);
  }, [playerLevel, playerScore, generateVRFSeed, onEventGenerated]);

  const generateEventTitle = (type: string, difficulty: string, rarity: string): string => {
    const titles = {
      quest: {
        easy: ['Daily Quest', 'Simple Task', 'Quick Mission'],
        medium: ['Adventure Quest', 'Challenge Mission', 'Explorer Task'],
        hard: ['Epic Quest', 'Heroic Mission', 'Legendary Task'],
        legendary: ['Mythic Quest', 'Divine Mission', 'Transcendent Task']
      },
      challenge: {
        easy: ['Speed Challenge', 'Quick Test', 'Simple Trial'],
        medium: ['Skill Challenge', 'Master Test', 'Expert Trial'],
        hard: ['Elite Challenge', 'Grandmaster Test', 'Legendary Trial'],
        legendary: ['Transcendent Challenge', 'Divine Test', 'Mythic Trial']
      },
      bonus: {
        easy: ['Lucky Bonus', 'Fortune Event', 'Chance Reward'],
        medium: ['Golden Bonus', 'Treasure Event', 'Rare Reward'],
        hard: ['Diamond Bonus', 'Legendary Event', 'Epic Reward'],
        legendary: ['Mythic Bonus', 'Divine Event', 'Transcendent Reward']
      },
      special: {
        easy: ['Special Event', 'Unique Opportunity', 'Rare Chance'],
        medium: ['Epic Event', 'Legendary Opportunity', 'Mythic Chance'],
        hard: ['Transcendent Event', 'Divine Opportunity', 'Ultimate Chance'],
        legendary: ['Reality-Bending Event', 'Cosmic Opportunity', 'Infinite Chance']
      },
      evolution: {
        easy: ['Evolution Trigger', 'Growth Catalyst', 'Transformation'],
        medium: ['Advanced Evolution', 'Enhanced Growth', 'Greater Transformation'],
        hard: ['Legendary Evolution', 'Epic Growth', 'Mythic Transformation'],
        legendary: ['Transcendent Evolution', 'Divine Growth', 'Ultimate Transformation']
      }
    };

    const typeTitles = titles[type as keyof typeof titles] || titles.quest;
    const difficultyTitles = typeTitles[difficulty as keyof typeof typeTitles] || typeTitles.easy;
    return difficultyTitles[Math.floor(Math.random() * difficultyTitles.length)];
  };

  const generateEventDescription = (type: string, difficulty: string, rarity: string): string => {
    const descriptions = {
      quest: `Complete this ${difficulty} quest to earn ${rarity} rewards and advance your journey.`,
      challenge: `Test your skills in this ${difficulty} challenge. Only the most skilled players will succeed.`,
      bonus: `A ${rarity} bonus event has appeared! Take advantage of this limited-time opportunity.`,
      special: `Something extraordinary is happening. This ${difficulty} special event offers unique rewards.`,
      evolution: `Your NFT is ready for evolution! This ${difficulty} event will unlock new abilities and visual changes.`
    };

    return descriptions[type as keyof typeof descriptions] || descriptions.quest;
  };

  const generateRewards = (type: string, difficulty: string, rarity: string): ProceduralReward[] => {
    const rewards: ProceduralReward[] = [];

    // Base rewards
    if (type === 'quest' || type === 'challenge') {
      rewards.push({
        type: 'xp',
        amount: getRewardAmount('xp', difficulty, rarity),
        rarity: rarity as 'common' | 'rare' | 'epic' | 'legendary',
        description: `${getRewardAmount('xp', difficulty, rarity)} Experience Points`,
        isClaimed: false
      });
    }

    if (type === 'bonus' || type === 'special') {
      rewards.push({
        type: 'token',
        amount: getRewardAmount('token', difficulty, rarity),
        rarity: rarity as 'common' | 'rare' | 'epic' | 'legendary',
        description: `${getRewardAmount('token', difficulty, rarity)} RUSH Tokens`,
        isClaimed: false
      });
    }

    if (type === 'evolution') {
      rewards.push({
        type: 'evolution',
        amount: 1,
        rarity: rarity as 'common' | 'rare' | 'epic' | 'legendary',
        description: 'NFT Evolution Stage',
        isClaimed: false
      });
    }

    // Rare rewards
    if (rarity === 'epic' || rarity === 'legendary') {
      rewards.push({
        type: 'nft',
        amount: 1,
        rarity,
        description: `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} NFT`,
        isClaimed: false
      });
    }

    return rewards;
  };

  const getRewardAmount = (rewardType: string, difficulty: string, rarity: string): number => {
    const baseAmounts = {
      xp: { easy: 100, medium: 250, hard: 500, legendary: 1000 },
      token: { easy: 50, medium: 150, hard: 300, legendary: 750 }
    };

    const rarityMultipliers = {
      common: 1,
      rare: 1.5,
      epic: 2,
      legendary: 3
    };

    const base = baseAmounts[rewardType as keyof typeof baseAmounts]?.[difficulty as keyof typeof baseAmounts.xp] || 100;
    const multiplier = rarityMultipliers[rarity as keyof typeof rarityMultipliers] || 1;

    return Math.floor(base * multiplier);
  };

  const generateRequirements = (type: string, difficulty: string, playerLevel: number): ProceduralRequirement[] => {
    const requirements: ProceduralRequirement[] = [];

    if (type === 'quest' || type === 'challenge') {
      requirements.push({
        type: 'score',
        target: getRequirementTarget('score', difficulty, playerLevel),
        current: 0,
        description: `Achieve a score of ${getRequirementTarget('score', difficulty, playerLevel)}`,
        isCompleted: false
      });
    }

    if (type === 'challenge') {
      requirements.push({
        type: 'combo',
        target: getRequirementTarget('combo', difficulty, playerLevel),
        current: 0,
        description: `Build a combo of ${getRequirementTarget('combo', difficulty, playerLevel)}`,
        isCompleted: false
      });
    }

    if (type === 'evolution') {
      requirements.push({
        type: 'chain',
        target: getRequirementTarget('chain', difficulty, playerLevel),
        current: 0,
        description: `Complete actions on ${getRequirementTarget('chain', difficulty, playerLevel)} different chains`,
        isCompleted: false
      });
    }

    return requirements;
  };

  const getRequirementTarget = (requirementType: string, difficulty: string, playerLevel: number): number => {
    const baseTargets = {
      score: { easy: 1000, medium: 2500, hard: 5000, legendary: 10000 },
      combo: { easy: 5, medium: 10, hard: 20, legendary: 50 },
      chain: { easy: 2, medium: 3, hard: 4, legendary: 5 }
    };

    const base = baseTargets[requirementType as keyof typeof baseTargets]?.[difficulty as keyof typeof baseTargets.score] || 1000;
    return Math.floor(base * (1 + playerLevel * 0.1));
  };

  const generateDuration = (type: string, difficulty: string): number => {
    const durations = {
      easy: 30,
      medium: 60,
      hard: 120,
      legendary: 240
    };

    return durations[difficulty as keyof typeof durations] || 60;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-orange-100 text-orange-800';
      case 'legendary': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quest': return '🎯';
      case 'challenge': return '⚡';
      case 'bonus': return '🎁';
      case 'special': return '✨';
      case 'evolution': return '🌟';
      default: return '🎮';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-6xl w-full mx-4 shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-black text-white mb-2">Procedural Content Generator</h2>
              <p className="text-white/70 text-lg">AI-powered events generated using Chainlink VRF</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Generation Panel */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white text-xl flex items-center space-x-2">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                    <span>Generate New Event</span>
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Use Chainlink VRF to generate unique, personalized content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Player Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white/70 text-sm">Player Level</div>
                      <div className="text-white font-bold text-lg">{playerLevel}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white/70 text-sm">Total Score</div>
                      <div className="text-white font-bold text-lg">{playerScore.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Generation Progress */}
                  {isGenerating && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-white">
                        <span className="text-sm font-medium">Generating Event...</span>
                        <span className="text-sm">{generationProgress}%</span>
                      </div>
                      <Progress value={generationProgress} className="h-2" />
                    </div>
                  )}

                  {/* Generate Button */}
                  <Button
                    onClick={generateProceduralEvent}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Square className="w-5 h-5 mr-2" />
                        Generate Event
                      </>
                    )}
                  </Button>

                  {/* VRF Info */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-white/70 text-sm mb-2">Chainlink VRF Integration</div>
                    <div className="text-white text-xs space-y-1">
                      <div>• Verifiable randomness for fair event generation</div>
                      <div>• Player history influences event types</div>
                      <div>• Difficulty scales with player level</div>
                      <div>• Rarity determined by VRF seed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Events */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Recent Events</h3>
                <div className="space-y-3">
                  {events.slice(0, 3).map((event) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white/5 rounded-lg p-4 cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getTypeIcon(event.type)}</span>
                          <div>
                            <div className="text-white font-medium">{event.title}</div>
                            <div className="text-white/60 text-sm">{event.type}</div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Badge className={getRarityColor(event.rarity)}>
                            {event.rarity}
                          </Badge>
                          <Badge className={getDifficultyColor(event.difficulty)}>
                            {event.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div>
              {selectedEvent ? (
                <Card className="bg-white/5 border-white/10 h-full">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{getTypeIcon(selectedEvent.type)}</span>
                      <div>
                        <CardTitle className="text-white text-xl">{selectedEvent.title}</CardTitle>
                        <CardDescription className="text-white/70">
                          {selectedEvent.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Badge className={getRarityColor(selectedEvent.rarity)}>
                        {selectedEvent.rarity}
                      </Badge>
                      <Badge className={getDifficultyColor(selectedEvent.difficulty)}>
                        {selectedEvent.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Requirements */}
                    <div>
                      <h4 className="text-white font-semibold mb-3">Requirements</h4>
                      <div className="space-y-3">
                        {selectedEvent.requirements.map((requirement, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                            <div className="flex-1">
                              <div className="text-white font-medium text-sm">{requirement.description}</div>
                              <Progress 
                                value={(requirement.current / requirement.target) * 100} 
                                className="h-1 mt-1" 
                              />
                            </div>
                            {requirement.isCompleted && (
                              <div className="text-green-400">✓</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Rewards */}
                    <div>
                      <h4 className="text-white font-semibold mb-3">Rewards</h4>
                      <div className="space-y-3">
                        {selectedEvent.rewards.map((reward, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                            <div className="text-2xl">
                              {reward.type === 'nft' ? '🎨' : 
                               reward.type === 'token' ? '🪙' : 
                               reward.type === 'xp' ? '⭐' : 
                               reward.type === 'powerup' ? '⚡' : '🌟'}
                            </div>
                            <div className="flex-1">
                              <div className="text-white font-medium text-sm">{reward.description}</div>
                              <div className="text-white/60 text-xs">
                                {reward.amount} {reward.type}
                              </div>
                            </div>
                            <Badge className={getRarityColor(reward.rarity)}>
                              {reward.rarity}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Event Info */}
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-white/70 text-sm mb-2">Event Information</div>
                      <div className="text-white text-xs space-y-1">
                        <div>Duration: {selectedEvent.duration} minutes</div>
                        <div>VRF Seed: {selectedEvent.vrfSeed.substring(0, 16)}...</div>
                        <div>Generated: {new Date(selectedEvent.generatedAt).toLocaleTimeString()}</div>
                        <div>Expires: {new Date(selectedEvent.expiresAt).toLocaleTimeString()}</div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                    >
                      Start Event
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white/5 border-white/10 h-full flex items-center justify-center">
                  <div className="text-center text-white/60">
                    <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Generate an event to view details</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProceduralContentGenerator;
