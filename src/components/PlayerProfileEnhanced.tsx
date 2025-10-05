import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Trophy, 
  Star, 
  Flame, 
  Target, 
  Calendar,
  Award,
  TrendingUp,
  Zap,
  Crown,
  Medal,
  Gift,
  Edit,
  Share2,
  Database
} from 'lucide-react';
import { useMockDataWithPlayer } from '../hooks/useMockData';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface PlayerProfileProps {
  address: string;
  username?: string;
  avatar?: string;
  isOwn?: boolean;
}

const PlayerProfile: React.FC<PlayerProfileProps> = ({
  address,
  username,
  avatar,
  isOwn = false
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'achievements' | 'nfts' | 'overview' | 'rewards'>('stats');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  const mockData = useMockDataWithPlayer(address);
  const { playerData, playerStats, playerNFTs, playerQuests, playerGuild } = mockData;

  // Use mock data if available, otherwise fall back to default values
  const displayName = playerData?.username || username || 'Unknown Player';
  const displayAvatar = avatar || '🎮';
  
  const stats = playerStats ? {
    totalScore: playerData?.totalScore || 0,
    bestScore: playerData?.highScore || 0,
    gamesPlayed: playerData?.totalGamesPlayed || 0,
    winRate: 68, // Mock calculation
    currentStreak: playerData?.currentStreak || 0,
    longestStreak: playerData?.currentStreak || 0,
    level: playerData?.level || 1,
    xp: playerData?.experience || 0,
    xpToNextLevel: ((playerData?.level || 1) * 1000) - (playerData?.experience || 0),
    rushTokens: 3450, // Mock value
    nftsOwned: playerNFTs?.length || 0,
    achievementsUnlocked: playerNFTs?.length || 0,
    totalAchievements: 50,
    averageScore: playerData?.totalScore ? Math.floor(playerData.totalScore / (playerData.totalGamesPlayed || 1)) : 0,
    playTime: Math.floor((playerData?.totalGamesPlayed || 0) * 0.5), // Estimate
    favoriteGameMode: 'Classic',
    joinDate: Date.now() - (90 * 24 * 60 * 60 * 1000),
    lastPlayed: Date.now() - (2 * 60 * 60 * 1000)
  } : {
    totalScore: 0,
    bestScore: 0,
    gamesPlayed: 0,
    winRate: 0,
    currentStreak: 0,
    longestStreak: 0,
    level: 1,
    xp: 0,
    xpToNextLevel: 1000,
    rushTokens: 0,
    nftsOwned: 0,
    achievementsUnlocked: 0,
    totalAchievements: 50,
    averageScore: 0,
    playTime: 0,
    favoriteGameMode: 'Classic',
    joinDate: Date.now(),
    lastPlayed: Date.now()
  };

  const achievements = playerNFTs?.map(nft => ({
    id: nft.tokenId.toString(),
    name: nft.name,
    description: nft.description,
    icon: '🏆',
    rarity: nft.rarity.toUpperCase() as 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY',
    unlockedAt: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
  })) || [];

  const getLevelProgress = () => {
    const currentLevelXP = (stats.level - 1) * 1000;
    const nextLevelXP = stats.level * 1000;
    const progress = ((stats.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'COMMON': return 'text-gray-400';
      case 'RARE': return 'text-blue-400';
      case 'EPIC': return 'text-purple-400';
      case 'LEGENDARY': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'COMMON': return 'bg-gray-500/20';
      case 'RARE': return 'bg-blue-500/20';
      case 'EPIC': return 'bg-purple-500/20';
      case 'LEGENDARY': return 'bg-yellow-500/20';
      default: return 'bg-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-purple-800/50 to-blue-800/50 border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-3xl">
                      {displayAvatar}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1">
                      <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{displayName}</h1>
                    <div className="flex items-center gap-4 text-purple-200">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4" />
                        <span>Level {stats.level}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        <span>{stats.totalScore.toLocaleString()} pts</span>
                      </div>
                      {playerGuild && (
                        <div className="flex items-center gap-2">
                          <Medal className="h-4 w-4" />
                          <span>{playerGuild.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {isOwn && (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditingProfile(true)}
                      className="border-purple-400 text-purple-200 hover:bg-purple-400/10"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="border-purple-400 text-purple-200 hover:bg-purple-400/10"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  {mockData.isMockDataEnabled && (
                    <Badge variant="outline" className="border-green-400 text-green-400">
                      <Database className="h-3 w-3 mr-1" />
                      Mock Data
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-purple-800/30">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">Overview</TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-purple-600">Stats</TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-purple-600">Achievements</TabsTrigger>
            <TabsTrigger value="nfts" className="data-[state=active]:bg-purple-600">NFTs</TabsTrigger>
            <TabsTrigger value="rewards" className="data-[state=active]:bg-purple-600">Rewards</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Level Progress */}
              <Card className="bg-gradient-to-br from-purple-800/50 to-blue-800/50 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Level Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-200">Level {stats.level}</span>
                      <span className="text-purple-200">{stats.xpToNextLevel} XP to next</span>
                    </div>
                    <Progress value={getLevelProgress()} className="h-2" />
                    <div className="text-center text-purple-200 text-sm">
                      {stats.xp.toLocaleString()} / {(stats.level * 1000).toLocaleString()} XP
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-gradient-to-br from-purple-800/50 to-blue-800/50 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-purple-200">Last played 2 hours ago</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-purple-200">Completed quest: Cross-Chain Explorer</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-purple-200">Minted NFT: Bridge Commander</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Guild Info */}
              {playerGuild && (
                <Card className="bg-gradient-to-br from-purple-800/50 to-blue-800/50 border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Medal className="h-5 w-5" />
                      Guild
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-lg font-semibold text-white">{playerGuild.name}</div>
                      <div className="text-sm text-purple-200">Level {playerGuild.level}</div>
                      <div className="text-sm text-purple-200">{playerGuild.members.length} members</div>
                      <div className="text-sm text-purple-200">Reputation: {playerGuild.reputation}</div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Game Stats */}
              <Card className="bg-gradient-to-br from-purple-800/50 to-blue-800/50 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Game Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-purple-200">Total Score</span>
                    <span className="text-white font-semibold">{stats.totalScore.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Best Score</span>
                    <span className="text-white font-semibold">{stats.bestScore.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Games Played</span>
                    <span className="text-white font-semibold">{stats.gamesPlayed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Average Score</span>
                    <span className="text-white font-semibold">{stats.averageScore.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Streak Stats */}
              <Card className="bg-gradient-to-br from-purple-800/50 to-blue-800/50 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Flame className="h-5 w-5" />
                    Streak Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-purple-200">Current Streak</span>
                    <span className="text-white font-semibold">{stats.currentStreak}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Longest Streak</span>
                    <span className="text-white font-semibold">{stats.longestStreak}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Win Rate</span>
                    <span className="text-white font-semibold">{stats.winRate}%</span>
                  </div>
                </CardContent>
              </Card>

              {/* Rewards */}
              <Card className="bg-gradient-to-br from-purple-800/50 to-blue-800/50 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Rewards
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-purple-200">RUSH Tokens</span>
                    <span className="text-white font-semibold">{stats.rushTokens.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">NFTs Owned</span>
                    <span className="text-white font-semibold">{stats.nftsOwned}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Achievements</span>
                    <span className="text-white font-semibold">{stats.achievementsUnlocked}/{stats.totalAchievements}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <Card key={achievement.id} className="bg-gradient-to-br from-purple-800/50 to-blue-800/50 border-purple-500/30">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">{achievement.name}</h3>
                        <p className="text-purple-200 text-sm mb-2">{achievement.description}</p>
                        <Badge className={`${getRarityBg(achievement.rarity)} ${getRarityColor(achievement.rarity)} border-0`}>
                          {achievement.rarity}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* NFTs Tab */}
          <TabsContent value="nfts" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {playerNFTs?.map((nft) => (
                <Card key={nft.tokenId} className="bg-gradient-to-br from-purple-800/50 to-blue-800/50 border-purple-500/30">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="aspect-square bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-4xl">
                        🎨
                      </div>
                      <div>
                        <h3 className="text-white font-semibold mb-1">{nft.name}</h3>
                        <p className="text-purple-200 text-sm mb-2">{nft.description}</p>
                        <Badge className={`${getRarityBg(nft.rarity)} ${getRarityColor(nft.rarity)} border-0`}>
                          {nft.rarity}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-6">
            <Card className="bg-gradient-to-br from-purple-800/50 to-blue-800/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">Reward History</CardTitle>
                <CardDescription className="text-purple-200">
                  Track your rewards and achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">Quest Completion</h4>
                        <p className="text-purple-200 text-sm">Cross-Chain Explorer</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">+3,200 RUSH</div>
                      <div className="text-purple-200 text-sm">2 hours ago</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <Award className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">NFT Minted</h4>
                        <p className="text-purple-200 text-sm">Bridge Commander</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">Rare NFT</div>
                      <div className="text-purple-200 text-sm">1 day ago</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PlayerProfile;
