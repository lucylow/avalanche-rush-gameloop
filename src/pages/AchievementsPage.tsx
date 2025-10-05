// src/pages/AchievementsPage.tsx
import React, { useState, useEffect } from 'react';
import { useAvalancheFeatures } from '../hooks/useAvalancheFeatures';
import { useAdvancedWeb3 } from '../hooks/useAdvancedWeb3';
import Navigation from '../components/ui/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { 
  Trophy, 
  Medal, 
  Star, 
  Crown, 
  Shield, 
  Zap,
  Target,
  Flame,
  Mountain,
  Coins,
  Gamepad2,
  Calendar,
  TrendingUp,
  Award,
  Lock,
  Unlock,
  Eye,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'gaming' | 'avalanche' | 'defi' | 'social' | 'special';
  difficulty: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
  isLocked: boolean;
  nftTokenId?: string;
  rewardAmount: number;
  completedDate?: Date;
  requirements: string[];
  rarity: number; // Out of 100
}

interface AchievementCategory {
  name: string;
  icon: React.ReactNode;
  color: string;
  achievements: Achievement[];
}

interface NFTReward {
  tokenId: string;
  name: string;
  image: string;
  rarity: string;
  attributes: { trait_type: string; value: string }[];
  completedDate: Date;
}

const AchievementsPage: React.FC = () => {
  const { account, isConnected, chainId } = useAdvancedWeb3();
  const { avalancheQuests, completedQuests, loadAvalancheData } = useAvalancheFeatures();

  const [activeTab, setActiveTab] = useState('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [nftRewards, setNftRewards] = useState<NFTReward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalProgress, setTotalProgress] = useState(0);

  // Load achievements on mount
  useEffect(() => {
    loadAchievements();
  }, [isConnected, account]);

  const loadAchievements = async () => {
    setIsLoading(true);
    try {
      const mockAchievements = generateMockAchievements();
      setAchievements(mockAchievements);
      
      const mockNFTs = generateMockNFTRewards();
      setNftRewards(mockNFTs);
      
      // Calculate total progress
      const completedCount = mockAchievements.filter(a => a.isCompleted).length;
      setTotalProgress((completedCount / mockAchievements.length) * 100);
      
      if (isConnected && account) {
        await loadAvalancheData();
      }
    } catch (error) {
      console.error('Failed to load achievements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockAchievements = (): Achievement[] => {
    return [
      // Gaming Achievements
      {
        id: 'first_game',
        name: 'Welcome to Avalanche Rush',
        description: 'Complete your first game session',
        category: 'gaming',
        difficulty: 'common',
        icon: '🎮',
        progress: 1,
        maxProgress: 1,
        isCompleted: true,
        isLocked: false,
        rewardAmount: 100,
        requirements: ['Play one game'],
        rarity: 90,
        completedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'score_master',
        name: 'Score Master',
        description: 'Achieve a score of 10,000 or higher',
        category: 'gaming',
        difficulty: 'rare',
        icon: '🏆',
        progress: 8500,
        maxProgress: 10000,
        isCompleted: false,
        isLocked: false,
        rewardAmount: 500,
        requirements: ['Score 10,000+ points in a single game'],
        rarity: 25
      },
      {
        id: 'streak_legend',
        name: 'Streak Legend',
        description: 'Maintain a 30-day login streak',
        category: 'gaming',
        difficulty: 'epic',
        icon: '🔥',
        progress: 15,
        maxProgress: 30,
        isCompleted: false,
        isLocked: false,
        rewardAmount: 1000,
        requirements: ['Log in for 30 consecutive days'],
        rarity: 10
      },
      
      // Avalanche Achievements
      {
        id: 'avax_staker',
        name: 'AVAX Validator',
        description: 'Stake 25 AVAX or more',
        category: 'avalanche',
        difficulty: 'rare',
        icon: '🛡️',
        progress: 0,
        maxProgress: 1,
        isCompleted: false,
        isLocked: false,
        rewardAmount: 750,
        requirements: ['Stake at least 25 AVAX tokens'],
        rarity: 35
      },
      {
        id: 'subnet_creator',
        name: 'Subnet Pioneer',
        description: 'Create your first Avalanche subnet',
        category: 'avalanche',
        difficulty: 'epic',
        icon: '🌐',
        progress: 0,
        maxProgress: 1,
        isCompleted: false,
        isLocked: false,
        rewardAmount: 2000,
        requirements: ['Deploy and configure a custom subnet'],
        rarity: 5
      },
      {
        id: 'bridge_master',
        name: 'Bridge Master',
        description: 'Complete 10 cross-chain transactions',
        category: 'avalanche',
        difficulty: 'rare',
        icon: '🌉',
        progress: 3,
        maxProgress: 10,
        isCompleted: false,
        isLocked: false,
        rewardAmount: 600,
        requirements: ['Bridge assets 10 times between chains'],
        rarity: 20
      },
      
      // DeFi Achievements
      {
        id: 'liquidity_provider',
        name: 'Liquidity Provider',
        description: 'Provide liquidity worth $1000+',
        category: 'defi',
        difficulty: 'rare',
        icon: '💎',
        progress: 450,
        maxProgress: 1000,
        isCompleted: false,
        isLocked: false,
        rewardAmount: 800,
        requirements: ['Provide $1000+ in liquidity'],
        rarity: 30
      },
      {
        id: 'flash_loan_expert',
        name: 'Flash Loan Expert',
        description: 'Execute 5 successful flash loans',
        category: 'defi',
        difficulty: 'epic',
        icon: '⚡',
        progress: 1,
        maxProgress: 5,
        isCompleted: false,
        isLocked: false,
        rewardAmount: 1500,
        requirements: ['Successfully execute 5 flash loans'],
        rarity: 8
      },
      {
        id: 'yield_farmer',
        name: 'Yield Farmer',
        description: 'Earn 1000 RUSH from yield farming',
        category: 'defi',
        difficulty: 'rare',
        icon: '🌾',
        progress: 650,
        maxProgress: 1000,
        isCompleted: false,
        isLocked: false,
        rewardAmount: 700,
        requirements: ['Earn 1000 RUSH tokens from farming'],
        rarity: 40
      },
      
      // Social Achievements
      {
        id: 'community_member',
        name: 'Community Member',
        description: 'Join the Avalanche Rush Discord',
        category: 'social',
        difficulty: 'common',
        icon: '👥',
        progress: 1,
        maxProgress: 1,
        isCompleted: true,
        isLocked: false,
        rewardAmount: 50,
        requirements: ['Join Discord server'],
        rarity: 80,
        completedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'leaderboard_top10',
        name: 'Top 10 Player',
        description: 'Reach top 10 on global leaderboard',
        category: 'social',
        difficulty: 'epic',
        icon: '👑',
        progress: 0,
        maxProgress: 1,
        isCompleted: false,
        isLocked: false,
        rewardAmount: 2500,
        requirements: ['Rank in top 10 globally'],
        rarity: 3
      },
      
      // Special Achievements
      {
        id: 'genesis_player',
        name: 'Genesis Player',
        description: 'Play during the first week of launch',
        category: 'special',
        difficulty: 'legendary',
        icon: '🌟',
        progress: 1,
        maxProgress: 1,
        isCompleted: true,
        isLocked: false,
        nftTokenId: '1',
        rewardAmount: 5000,
        requirements: ['Play during launch week'],
        rarity: 1,
        completedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'avalanche_ambassador',
        name: 'Avalanche Ambassador',
        description: 'Complete all Avalanche-specific quests',
        category: 'special',
        difficulty: 'legendary',
        icon: '🏔️',
        progress: 6,
        maxProgress: 8,
        isCompleted: false,
        isLocked: false,
        rewardAmount: 3000,
        requirements: ['Complete all 8 Avalanche quests'],
        rarity: 2
      }
    ];
  };

  const generateMockNFTRewards = (): NFTReward[] => {
    return [
      {
        tokenId: '1',
        name: 'Genesis Pioneer',
        image: '/api/placeholder/300/300',
        rarity: 'Legendary',
        attributes: [
          { trait_type: 'Type', value: 'Genesis' },
          { trait_type: 'Rarity', value: 'Legendary' },
          { trait_type: 'Date', value: 'Launch Week' }
        ],
        completedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
      }
    ];
  };

  const getAchievementsByCategory = (): AchievementCategory[] => {
    return [
      {
        name: 'Gaming',
        icon: <Gamepad2 className="h-5 w-5" />,
        color: 'from-blue-500 to-purple-500',
        achievements: achievements.filter(a => a.category === 'gaming')
      },
      {
        name: 'Avalanche',
        icon: <Mountain className="h-5 w-5" />,
        color: 'from-red-500 to-orange-500',
        achievements: achievements.filter(a => a.category === 'avalanche')
      },
      {
        name: 'DeFi',
        icon: <TrendingUp className="h-5 w-5" />,
        color: 'from-green-500 to-emerald-500',
        achievements: achievements.filter(a => a.category === 'defi')
      },
      {
        name: 'Social',
        icon: <Trophy className="h-5 w-5" />,
        color: 'from-yellow-500 to-amber-500',
        achievements: achievements.filter(a => a.category === 'social')
      },
      {
        name: 'Special',
        icon: <Crown className="h-5 w-5" />,
        color: 'from-purple-500 to-pink-500',
        achievements: achievements.filter(a => a.category === 'special')
      }
    ];
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'common': return 'text-gray-400 border-gray-400';
      case 'rare': return 'text-blue-400 border-blue-400';
      case 'epic': return 'text-purple-400 border-purple-400';
      case 'legendary': return 'text-orange-400 border-orange-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getDifficultyBg = (difficulty: string) => {
    switch (difficulty) {
      case 'common': return 'bg-gray-500/20';
      case 'rare': return 'bg-blue-500/20';
      case 'epic': return 'bg-purple-500/20';
      case 'legendary': return 'bg-orange-500/20';
      default: return 'bg-gray-500/20';
    }
  };

  const filteredAchievements = () => {
    if (activeTab === 'all') return achievements;
    if (activeTab === 'completed') return achievements.filter(a => a.isCompleted);
    if (activeTab === 'in-progress') return achievements.filter(a => !a.isCompleted && !a.isLocked && a.progress > 0);
    if (activeTab === 'locked') return achievements.filter(a => a.isLocked);
    return achievements.filter(a => a.category === activeTab);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading Achievements...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <Navigation />
      <div className="max-w-7xl mx-auto p-6 pt-20 md:pt-24 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Medal className="h-8 w-8 text-yellow-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Achievements & Rewards
            </h1>
            <Star className="h-8 w-8 text-purple-500" />
          </div>
          <p className="text-lg text-gray-300">
            Unlock achievements and earn exclusive NFT rewards
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {achievements.filter(a => a.isCompleted).length}
                </div>
                <div className="text-sm text-gray-300">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {achievements.filter(a => !a.isCompleted && a.progress > 0).length}
                </div>
                <div className="text-sm text-gray-300">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">
                  {achievements.reduce((sum, a) => sum + a.rewardAmount * (a.isCompleted ? 1 : 0), 0)}
                </div>
                <div className="text-sm text-gray-300">RUSH Earned</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{nftRewards.length}</div>
                <div className="text-sm text-gray-300">NFT Rewards</div>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300">Overall Progress</span>
                <span className="text-gray-300">{totalProgress.toFixed(1)}%</span>
              </div>
              <Progress value={totalProgress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-7 bg-gray-800/50">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="gaming">Gaming</TabsTrigger>
            <TabsTrigger value="avalanche">Avalanche</TabsTrigger>
            <TabsTrigger value="defi">DeFi</TabsTrigger>
            <TabsTrigger value="special">Special</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {/* Achievements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredAchievements().map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="cursor-pointer"
                    onClick={() => setSelectedAchievement(achievement)}
                  >
                    <Card className={`${
                      achievement.isCompleted 
                        ? `${getDifficultyBg(achievement.difficulty)} border-2 ${getDifficultyColor(achievement.difficulty).replace('text-', 'border-')}`
                        : achievement.isLocked
                        ? 'bg-gray-800/30 border-gray-600 opacity-60'
                        : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70'
                    } transition-all duration-300`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{achievement.icon}</span>
                            <Badge 
                              variant="outline" 
                              className={`${getDifficultyColor(achievement.difficulty)} text-xs`}
                            >
                              {achievement.difficulty}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-1">
                            {achievement.isCompleted && (
                              <Badge className="bg-green-600 text-white">
                                <Trophy className="h-3 w-3 mr-1" />
                                Done
                              </Badge>
                            )}
                            {achievement.isLocked && (
                              <Lock className="h-4 w-4 text-gray-500" />
                            )}
                            {!achievement.isCompleted && !achievement.isLocked && (
                              <Unlock className="h-4 w-4 text-blue-400" />
                            )}
                          </div>
                        </div>
                        <CardTitle className="text-lg text-white">{achievement.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-gray-300 mb-3">
                          {achievement.description}
                        </CardDescription>
                        
                        {!achievement.isCompleted && (
                          <div className="mb-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-400">Progress</span>
                              <span className="text-gray-400">
                                {achievement.progress} / {achievement.maxProgress}
                              </span>
                            </div>
                            <Progress 
                              value={(achievement.progress / achievement.maxProgress) * 100} 
                              className="h-2"
                            />
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <Coins className="h-4 w-4 text-yellow-500" />
                            <span className="text-yellow-500 font-semibold">
                              {achievement.rewardAmount} RUSH
                            </span>
                          </div>
                          {achievement.nftTokenId && (
                            <Badge className="bg-purple-600 text-white">
                              <Award className="h-3 w-3 mr-1" />
                              NFT
                            </Badge>
                          )}
                        </div>
                        
                        {achievement.completedDate && (
                          <div className="mt-2 text-xs text-gray-400">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            Completed {achievement.completedDate.toLocaleDateString()}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* NFT Rewards Section */}
            {nftRewards.length > 0 && (
              <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5" />
                    <span>Your NFT Rewards</span>
                  </CardTitle>
                  <CardDescription>
                    Exclusive NFTs earned through achievements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {nftRewards.map((nft) => (
                      <Card key={nft.tokenId} className="bg-gray-800/50 border-gray-700">
                        <CardContent className="p-4">
                          <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg mb-3 flex items-center justify-center">
                            <Star className="h-16 w-16 text-purple-400" />
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-white mb-1">{nft.name}</div>
                            <Badge className="bg-orange-600 text-white mb-2">
                              {nft.rarity}
                            </Badge>
                            <div className="text-xs text-gray-400">
                              Token #{nft.tokenId}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Achievement Detail Modal */}
        <Dialog open={!!selectedAchievement} onOpenChange={() => setSelectedAchievement(null)}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
            {selectedAchievement && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <span className="text-2xl">{selectedAchievement.icon}</span>
                    <span>{selectedAchievement.name}</span>
                  </DialogTitle>
                  <DialogDescription className="text-gray-300">
                    {selectedAchievement.description}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Badge className={`${getDifficultyColor(selectedAchievement.difficulty)}`}>
                      {selectedAchievement.difficulty}
                    </Badge>
                    <div className="text-sm text-gray-400">
                      Rarity: {selectedAchievement.rarity}% of players
                    </div>
                  </div>
                  
                  {!selectedAchievement.isCompleted && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{selectedAchievement.progress} / {selectedAchievement.maxProgress}</span>
                      </div>
                      <Progress 
                        value={(selectedAchievement.progress / selectedAchievement.maxProgress) * 100} 
                        className="h-3"
                      />
                    </div>
                  )}
                  
                  <div>
                    <div className="text-sm font-semibold mb-2">Requirements:</div>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {selectedAchievement.requirements.map((req, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Target className="h-3 w-3 mt-0.5 text-blue-400 flex-shrink-0" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                    <div className="flex items-center space-x-2">
                      <Coins className="h-5 w-5 text-yellow-500" />
                      <span className="text-yellow-500 font-semibold">
                        {selectedAchievement.rewardAmount} RUSH
                      </span>
                    </div>
                    {selectedAchievement.nftTokenId && (
                      <Badge className="bg-purple-600 text-white">
                        <Award className="h-4 w-4 mr-1" />
                        NFT Reward
                      </Badge>
                    )}
                  </div>
                  
                  {selectedAchievement.completedDate && (
                    <div className="text-center text-sm text-green-400">
                      <Trophy className="h-4 w-4 inline mr-1" />
                      Completed on {selectedAchievement.completedDate.toLocaleDateString()}
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AchievementsPage;
