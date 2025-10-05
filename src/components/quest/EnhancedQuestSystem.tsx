import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  BookOpen, 
  Star, 
  Trophy, 
  Zap, 
  Shield, 
  Target, 
  Clock, 
  Users, 
  Gift,
  Crown,
  Flame,
  Sparkles,
  CheckCircle,
  Lock,
  Play,
  Share2,
  Heart,
  MessageCircle,
  Repeat
} from 'lucide-react';
import { useSmartContracts } from '../../hooks/useSmartContracts';
import { useLens } from '../../hooks/useLens';
import { useFarcaster } from '../../hooks/useFarcaster';
import { CHARACTER_QUESTS, getAvailableQuests, getQuestProgress } from '../../data/characterQuests';

interface EnhancedQuestSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

interface QuestProgress {
  questId: string;
  objectives: Array<{
    id: string;
    current: number;
    target: number;
    isCompleted: boolean;
  }>;
  isCompleted: boolean;
  startedAt: number;
  completedAt?: number;
}

const EnhancedQuestSystem: React.FC<EnhancedQuestSystemProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('available');
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [questProgress, setQuestProgress] = useState<Map<string, QuestProgress>>(new Map());
  const [playerLevel, setPlayerLevel] = useState(15);
  const [achievements, setAchievements] = useState<string[]>(['first_rush_earned', 'avalanche_basics']);
  const [completedQuests, setCompletedQuests] = useState<string[]>([]);
  const [relationships, setRelationships] = useState<Record<string, number>>({
    'avalon-the-mountain-guardian': 25,
    'lyra-rush-weaver': 20,
    'cipher-the-subnet-architect': 15,
    'nova-defi-alchemist': 10,
    'echo-reactive-oracle': 5
  });

  const { isConnected, account, getRushBalance } = useSmartContracts();
  const { profile: lensProfile, shareAchievement } = useLens();
  const { user: farcasterUser, shareAchievement: shareFarcasterAchievement } = useFarcaster();

  // Character data
  const characters = [
    { id: 'avalon-the-mountain-guardian', name: 'Avalon', avatar: '/characters/avalon.png', relationship: relationships['avalon-the-mountain-guardian'] },
    { id: 'lyra-rush-weaver', name: 'Lyra', avatar: '/characters/lyra.png', relationship: relationships['lyra-rush-weaver'] },
    { id: 'cipher-the-subnet-architect', name: 'Cipher', avatar: '/characters/cipher.png', relationship: relationships['cipher-the-subnet-architect'] },
    { id: 'nova-defi-alchemist', name: 'Nova', avatar: '/characters/nova.png', relationship: relationships['nova-defi-alchemist'] },
    { id: 'echo-reactive-oracle', name: 'Echo', avatar: '/characters/echo.png', relationship: relationships['echo-reactive-oracle'] }
  ];

  // Get available quests
  const availableQuests = selectedCharacter 
    ? CHARACTER_QUESTS.filter(quest => quest.characterId === selectedCharacter)
    : getAvailableQuests(playerLevel, achievements, completedQuests, relationships);

  const activeQuests = Array.from(questProgress.values()).filter(progress => !progress.isCompleted);

  // Start a quest
  const startQuest = useCallback((questId: string) => {
    const quest = CHARACTER_QUESTS.find(q => q.id === questId);
    if (!quest) return;

    const progress: QuestProgress = {
      questId,
      objectives: quest.objectives.map(obj => ({
        id: obj.id,
        current: 0,
        target: typeof obj.target === 'string' ? parseInt(obj.target) || 0 : obj.target,
        isCompleted: false
      })),
      isCompleted: false,
      startedAt: Date.now()
    };

    setQuestProgress(prev => new Map(prev).set(questId, progress));
    setActiveTab('active');
  }, []);

  // Update quest progress
  const updateQuestProgress = useCallback((questId: string, objectiveId: string, progress: number) => {
    setQuestProgress(prev => {
      const newProgress = new Map(prev);
      const questProgress = newProgress.get(questId);
      if (!questProgress) return newProgress;

      const objective = questProgress.objectives.find(obj => obj.id === objectiveId);
      if (!objective) return newProgress;

      objective.current = Math.min(objective.current + progress, objective.target);
      objective.isCompleted = objective.current >= objective.target;

      // Check if quest is complete
      const allRequiredCompleted = questProgress.objectives
        .filter(obj => !CHARACTER_QUESTS.find(q => q.id === questId)?.objectives.find(o => o.id === obj.id)?.isOptional)
        .every(obj => obj.isCompleted);

      if (allRequiredCompleted && !questProgress.isCompleted) {
        questProgress.isCompleted = true;
        questProgress.completedAt = Date.now();
        completeQuest(questId);
      }

      return newProgress;
    });
  }, []);

  // Complete quest and claim rewards
  const completeQuest = useCallback(async (questId: string) => {
    const quest = CHARACTER_QUESTS.find(q => q.id === questId);
    if (!quest) return;

    // Update completed quests
    setCompletedQuests(prev => [...prev, questId]);

    // Update relationships
    setRelationships(prev => {
      const newRelationships = { ...prev };
      Object.entries(quest.relationshipChanges).forEach(([characterId, change]) => {
        newRelationships[characterId] = (newRelationships[characterId] || 0) + change;
      });
      return newRelationships;
    });

    // Share achievement on social platforms
    if (lensProfile) {
      await shareAchievement({
        type: quest.title,
        score: quest.rewards.reduce((sum, reward) => sum + (reward.amount || 0), 0),
        level: playerLevel,
        character: characters.find(c => c.id === quest.characterId)?.name
      });
    }

    if (farcasterUser) {
      await shareFarcasterAchievement({
        type: quest.title,
        score: quest.rewards.reduce((sum, reward) => sum + (reward.amount || 0), 0),
        level: playerLevel,
        character: characters.find(c => c.id === quest.characterId)?.name
      });
    }

    // Show completion animation
    // This would trigger a completion modal or animation
  }, [lensProfile, farcasterUser, shareAchievement, shareFarcasterAchievement, playerLevel, characters]);

  // Get quest difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-orange-500';
      case 'legendary': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Get quest type icon
  const getQuestTypeIcon = (questType: string) => {
    switch (questType) {
      case 'main': return <Crown className="h-4 w-4" />;
      case 'side': return <Star className="h-4 w-4" />;
      case 'personal': return <Heart className="h-4 w-4" />;
      case 'relationship': return <Users className="h-4 w-4" />;
      case 'evolution': return <Sparkles className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-7xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-white/10 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white">
                Enhanced Quest System
              </h2>
              <p className="text-white/70">Character-driven storylines with social integration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"
          >
            <span className="text-white text-xl">×</span>
          </button>
        </div>

        {/* Character Selection */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Choose Your Character</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {characters.map((character) => (
              <motion.div
                key={character.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCharacter(character.id)}
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedCharacter === character.id
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-white/20 bg-white/5 hover:border-white/30'
                }`}
              >
                <Avatar className="h-12 w-12 mx-auto mb-2">
                  <AvatarImage src={character.avatar} alt={character.name} />
                  <AvatarFallback>{character.name[0]}</AvatarFallback>
                </Avatar>
                <h4 className="text-white font-medium text-center">{character.name}</h4>
                <div className="text-center mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {character.relationship}/100
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quest Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
          </TabsList>

          {/* Available Quests */}
          <TabsContent value="available" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {availableQuests.map((quest) => (
                <Card key={quest.id} className="bg-gradient-to-br from-slate-700 to-slate-800 border-white/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          {getQuestTypeIcon(quest.questType)}
                        </div>
                        <div>
                          <CardTitle className="text-white">{quest.title}</CardTitle>
                          <CardDescription className="text-white/70">
                            Chapter {quest.chapter} • {quest.characterId.split('-')[0]}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={`${getDifficultyColor(quest.difficulty)} text-white`}>
                        {quest.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-white/80 text-sm">{quest.description}</p>
                    
                    <div className="space-y-2">
                      <h5 className="text-white font-medium">Objectives:</h5>
                      <div className="space-y-1">
                        {quest.objectives.slice(0, 3).map((objective) => (
                          <div key={objective.id} className="flex items-center gap-2 text-sm text-white/70">
                            <Target className="h-3 w-3" />
                            <span>{objective.title}</span>
                            {objective.isOptional && (
                              <Badge variant="outline" className="text-xs">Optional</Badge>
                            )}
                          </div>
                        ))}
                        {quest.objectives.length > 3 && (
                          <div className="text-xs text-white/50">
                            +{quest.objectives.length - 3} more objectives
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-white font-medium">Rewards:</h5>
                      <div className="flex flex-wrap gap-2">
                        {quest.rewards.slice(0, 3).map((reward, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {reward.type === 'rush_tokens' && <Zap className="h-3 w-3 mr-1" />}
                            {reward.type === 'nft' && <Gift className="h-3 w-3 mr-1" />}
                            {reward.type === 'character_unlock' && <Crown className="h-3 w-3 mr-1" />}
                            {reward.amount ? `${reward.amount} ${reward.type}` : reward.type}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button 
                      onClick={() => startQuest(quest.id)}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Quest
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Active Quests */}
          <TabsContent value="active" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeQuests.map((progress) => {
                const quest = CHARACTER_QUESTS.find(q => q.id === progress.questId);
                if (!quest) return null;

                const questProgressData = getQuestProgress({
                  ...quest,
                  objectives: quest.objectives.map(obj => {
                    const progressObj = progress.objectives.find(p => p.id === obj.id);
                    return {
                      ...obj,
                      current: progressObj?.current || 0,
                      isCompleted: progressObj?.isCompleted || false
                    };
                  })
                });

                return (
                  <Card key={progress.questId} className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500/30">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white">{quest.title}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {questProgressData.percentage.toFixed(0)}% Complete
                        </Badge>
                      </div>
                      <Progress value={questProgressData.percentage} className="h-2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {progress.objectives.map((objective) => {
                          const questObjective = quest.objectives.find(obj => obj.id === objective.id);
                          if (!questObjective) return null;

                          return (
                            <div key={objective.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                              <div className="flex items-center gap-2">
                                {objective.isCompleted ? (
                                  <CheckCircle className="h-4 w-4 text-green-400" />
                                ) : (
                                  <Target className="h-4 w-4 text-white/50" />
                                )}
                                <span className={`text-sm ${objective.isCompleted ? 'text-green-400' : 'text-white/70'}`}>
                                  {questObjective.title}
                                </span>
                              </div>
                              <div className="text-xs text-white/50">
                                {objective.current}/{objective.target}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            // Simulate progress update
                            updateQuestProgress(progress.questId, progress.objectives[0].id, 1);
                          }}
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Make Progress
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // Share progress
                            if (lensProfile) {
                              shareAchievement({
                                type: `Progress in ${quest.title}`,
                                score: questProgressData.percentage,
                                level: playerLevel
                              });
                            }
                          }}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Completed Quests */}
          <TabsContent value="completed" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {completedQuests.map((questId) => {
                const quest = CHARACTER_QUESTS.find(q => q.id === questId);
                if (!quest) return null;

                return (
                  <Card key={questId} className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-500/30">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-400" />
                          {quest.title}
                        </CardTitle>
                        <Badge className="bg-green-500 text-white">
                          Completed
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/70 text-sm mb-4">{quest.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {quest.rewards.map((reward, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {reward.type}: {reward.amount || reward.item}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Social Integration */}
          <TabsContent value="social" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lens Integration */}
              <Card className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    Lens Protocol
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {lensProfile ? (
                    <div>
                      <p className="text-white/70 mb-2">Connected as: {lensProfile.handle}</p>
                      <div className="space-y-2">
                        <Badge variant="secondary" className="text-xs">
                          <Heart className="h-3 w-3 mr-1" />
                          {lensProfile.stats.totalFollowers} followers
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          {lensProfile.stats.totalPublications} posts
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <p className="text-white/70">Connect to Lens to share quest achievements</p>
                  )}
                </CardContent>
              </Card>

              {/* Farcaster Integration */}
              <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    Farcaster
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {farcasterUser ? (
                    <div>
                      <p className="text-white/70 mb-2">Connected as: @{farcasterUser.username}</p>
                      <div className="space-y-2">
                        <Badge variant="secondary" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {farcasterUser.followerCount} followers
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <Repeat className="h-3 w-3 mr-1" />
                          {farcasterUser.followerCount} following
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <p className="text-white/70">Connect to Farcaster to share quest progress</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quest Achievements */}
            <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border-yellow-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Quest Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{completedQuests.length}</div>
                    <div className="text-white/70 text-sm">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{activeQuests.length}</div>
                    <div className="text-white/70 text-sm">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{playerLevel}</div>
                    <div className="text-white/70 text-sm">Level</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {Math.max(...Object.values(relationships))}
                    </div>
                    <div className="text-white/70 text-sm">Max Bond</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Not Connected State */}
        {!isConnected && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Wallet Not Connected</h3>
            <p className="text-white/70 mb-6">Connect your wallet to access the enhanced quest system</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default EnhancedQuestSystem;
