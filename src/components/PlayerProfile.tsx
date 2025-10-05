import React, { useState } from 'react';
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
  Share2
} from 'lucide-react';

interface PlayerStats {
  totalScore: number;
  bestScore: number;
  gamesPlayed: number;
  winRate: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  rushTokens: number;
  nftsOwned: number;
  achievementsUnlocked: number;
  totalAchievements: number;
  averageScore: number;
  playTime: number; // in hours
  favoriteGameMode: string;
  joinDate: number;
  lastPlayed: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  unlockedAt?: number;
  progress?: number;
  maxProgress?: number;
}

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

  // Mock player data - replace with actual API calls
  const playerStats: PlayerStats = {
    totalScore: 1250000,
    bestScore: 45000,
    gamesPlayed: 234,
    winRate: 68,
    currentStreak: 5,
    longestStreak: 23,
    level: 28,
    xp: 45600,
    xpToNextLevel: 8400,
    rushTokens: 3450,
    nftsOwned: 12,
    achievementsUnlocked: 23,
    totalAchievements: 50,
    averageScore: 5342,
    playTime: 156,
    favoriteGameMode: 'Tournament',
    joinDate: Date.now() - (90 * 24 * 60 * 60 * 1000), // 90 days ago
    lastPlayed: Date.now() - (2 * 60 * 60 * 1000) // 2 hours ago
  };

  const achievements: Achievement[] = [
    {
      id: '1',
      name: 'First Steps',
      description: 'Complete your first game',
      icon: '🎮',
      rarity: 'COMMON',
      unlockedAt: Date.now() - (80 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      name: 'Speed Demon',
      description: 'Achieve 50+ actions per minute',
      icon: '⚡',
      rarity: 'RARE',
      unlockedAt: Date.now() - (60 * 24 * 60 * 60 * 1000)
    },
    {
      id: '3',
      name: 'High Roller',
      description: 'Score over 40,000 points in a single game',
      icon: '🎯',
      rarity: 'EPIC',
      unlockedAt: Date.now() - (30 * 24 * 60 * 60 * 1000)
    },
    {
      id: '4',
      name: 'Unstoppable',
      description: 'Maintain a 20+ game winning streak',
      icon: '🔥',
      rarity: 'LEGENDARY',
      unlockedAt: Date.now() - (10 * 24 * 60 * 60 * 1000)
    },
    {
      id: '5',
      name: 'NFT Collector',
      description: 'Collect 10 different NFTs',
      icon: '🎨',
      rarity: 'RARE'
    },
    {
      id: '6',
      name: 'Tournament Champion',
      description: 'Win a weekly tournament',
      icon: '👑',
      rarity: 'LEGENDARY',
      progress: 85,
      maxProgress: 100
    }
  ];

  const getRarityColor = (rarity: Achievement['rarity']) => {
    const colors = {
      COMMON: 'from-gray-400 to-gray-500',
      RARE: 'from-blue-400 to-blue-500',
      EPIC: 'from-purple-400 to-purple-500',
      LEGENDARY: 'from-yellow-400 to-orange-500'
    };
    return colors[rarity];
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatTime = (hours: number) => {
    if (hours >= 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    return `${hours}h`;
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 mb-8 text-white relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full"></div>
          <div className="absolute top-20 right-20 w-16 h-16 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-10 left-1/3 w-12 h-12 border-2 border-white rounded-full"></div>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl">
                {avatar || '🎮'}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>

            {/* Player Info */}
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold">
                  {username || formatAddress(address)}
                </h1>
                {isOwn && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center space-x-6 text-white/80">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5" />
                  <span>Level {playerStats.level}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5" />
                  <span>#{Math.floor(Math.random() * 100) + 1} Global</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Joined {new Date(playerStats.joinDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="text-right">
            <div className="text-sm opacity-80 mb-2">Level Progress</div>
            <div className="w-48 bg-white/20 rounded-full h-3 mb-2">
              <div 
                className="bg-white rounded-full h-3 transition-all duration-1000"
                style={{ width: `${(playerStats.xp / (playerStats.xp + playerStats.xpToNextLevel)) * 100}%` }}
              ></div>
            </div>
            <div className="text-sm">
              {formatNumber(playerStats.xp)} / {formatNumber(playerStats.xp + playerStats.xpToNextLevel)} XP
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-8">
        {[
          { id: 'stats', label: 'Statistics', icon: TrendingUp },
          { id: 'achievements', label: 'Achievements', icon: Award },
          { id: 'nfts', label: 'NFT Collection', icon: Gift }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as 'overview' | 'achievements' | 'stats' | 'rewards')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-md font-medium transition-all duration-200 ${
              activeTab === id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {/* Stats Cards */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber(playerStats.bestScore)}
                  </div>
                  <div className="text-sm text-gray-600">Best Score</div>
                </div>
              </div>
              <div className="text-sm text-green-600 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                Personal Record
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {playerStats.winRate}%
                  </div>
                  <div className="text-sm text-gray-600">Win Rate</div>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {playerStats.gamesPlayed} games played
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {playerStats.currentStreak}
                  </div>
                  <div className="text-sm text-gray-600">Current Streak</div>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Best: {playerStats.longestStreak} games
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber(playerStats.rushTokens)}
                  </div>
                  <div className="text-sm text-gray-600">RUSH Tokens</div>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {playerStats.nftsOwned} NFTs owned
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="md:col-span-2 lg:col-span-4 bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-6">Detailed Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {formatNumber(playerStats.totalScore)}
                  </div>
                  <div className="text-sm text-gray-600">Total Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {formatNumber(playerStats.averageScore)}
                  </div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {formatTime(playerStats.playTime)}
                  </div>
                  <div className="text-sm text-gray-600">Play Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {playerStats.favoriteGameMode}
                  </div>
                  <div className="text-sm text-gray-600">Favorite Mode</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'achievements' && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Achievements</h3>
                <div className="text-lg font-medium text-gray-600">
                  {playerStats.achievementsUnlocked} / {playerStats.totalAchievements}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${(playerStats.achievementsUnlocked / playerStats.totalAchievements) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative bg-white rounded-xl shadow-lg p-6 border-2 overflow-hidden ${
                    achievement.unlockedAt 
                      ? 'border-transparent' 
                      : 'border-gray-200 opacity-60'
                  }`}
                >
                  {achievement.unlockedAt && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(achievement.rarity)} opacity-10`}></div>
                  )}
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`text-4xl ${achievement.unlockedAt ? '' : 'grayscale'}`}>
                        {achievement.icon}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getRarityColor(achievement.rarity)}`}>
                        {achievement.rarity}
                      </div>
                    </div>
                    
                    <h4 className="font-bold text-gray-900 mb-2">{achievement.name}</h4>
                    <p className="text-sm text-gray-600 mb-4">{achievement.description}</p>
                    
                    {achievement.unlockedAt ? (
                      <div className="text-xs text-green-600 font-medium">
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </div>
                    ) : achievement.progress ? (
                      <div>
                        <div className="flex justify-between text-xs mb-2">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{achievement.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full bg-gradient-to-r ${getRarityColor(achievement.rarity)}`}
                            style={{ width: `${achievement.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400">
                        Not unlocked
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'nfts' && (
          <motion.div
            key="nfts"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center py-12"
          >
            <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">NFT Collection</h3>
            <p className="text-gray-600 mb-6">
              Your NFT collection will be displayed here once implemented.
            </p>
            <div className="text-lg font-bold text-blue-600">
              {playerStats.nftsOwned} NFTs Owned
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlayerProfile;
