import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Flame, 
  Star, 
  Zap, 
  Target, 
  TrendingUp,
  Users,
  Calendar,
  Clock,
  Award,
  ChevronUp,
  ChevronDown,
  Eye,
  Heart,
  Sparkles
} from 'lucide-react';
import { useAdvancedWeb3 } from '../hooks/useAdvancedWeb3';

interface Player {
  id: string;
  address: string;
  username?: string;
  avatar?: string;
  score: number;
  previousScore: number;
  rank: number;
  previousRank: number;
  streak: number;
  gamesPlayed: number;
  winRate: number;
  lastPlayed: number;
  isOnline: boolean;
  achievements: string[];
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' | 'LEGEND';
  rushTokens: number;
  nftCount: number;
  level: number;
  xp: number;
  country?: string;
  clan?: string;
}

interface LeaderboardProps {
  tournamentId?: number;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'allTime';
  maxPlayers?: number;
}

const EnhancedLeaderboard: React.FC<LeaderboardProps> = ({ 
  tournamentId, 
  timeframe = 'weekly',
  maxPlayers = 50 
}) => {
  const { account, isConnected } = useAdvancedWeb3();
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);
  const [showFullLeaderboard, setShowFullLeaderboard] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [animatedScores, setAnimatedScores] = useState<Record<string, number>>({});

  // Tier configurations with colors and requirements
  const tierConfig = {
    BRONZE: { color: 'from-orange-400 to-orange-600', minScore: 0, icon: '🥉', rewards: 10 },
    SILVER: { color: 'from-gray-400 to-gray-600', minScore: 5000, icon: '🥈', rewards: 25 },
    GOLD: { color: 'from-yellow-400 to-yellow-600', minScore: 15000, icon: '🥇', rewards: 50 },
    PLATINUM: { color: 'from-purple-400 to-purple-600', minScore: 35000, icon: '💎', rewards: 100 },
    DIAMOND: { color: 'from-cyan-400 to-cyan-600', minScore: 75000, icon: '💠', rewards: 250 },
    LEGEND: { color: 'from-red-500 to-pink-500', minScore: 150000, icon: '👑', rewards: 500 }
  };

  useEffect(() => {
    fetchLeaderboardData();
    const interval = setInterval(fetchLeaderboardData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [selectedTimeframe, tournamentId]);

  useEffect(() => {
    // Animate score changes
    players.forEach(player => {
      if (animatedScores[player.id] !== player.score) {
        const startScore = animatedScores[player.id] || player.previousScore || 0;
        const endScore = player.score;
        const duration = 2000;
        const startTime = Date.now();

        const animateScore = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const currentScore = Math.round(startScore + (endScore - startScore) * progress);
          
          setAnimatedScores(prev => ({ ...prev, [player.id]: currentScore }));
          
          if (progress < 1) {
            requestAnimationFrame(animateScore);
          }
        };

        requestAnimationFrame(animateScore);
      }
    });
  }, [players]);

  const fetchLeaderboardData = async () => {
    setIsLoading(true);
    try {
      // Mock data with enhanced player information
      const mockPlayers: Player[] = [
        {
          id: '1',
          address: '0x742d35Cc5A5E2a9E1aB8d8C6E6E9F4A5B8D35a9',
          username: 'CryptoLegend',
          avatar: '👑',
          score: 285000,
          previousScore: 278000,
          rank: 1,
          previousRank: 1,
          streak: 15,
          gamesPlayed: 247,
          winRate: 87,
          lastPlayed: Date.now() - 300000, // 5 minutes ago
          isOnline: true,
          achievements: ['First Blood', 'Speed Demon', 'Unstoppable', 'Legend'],
          tier: 'LEGEND',
          rushTokens: 15420,
          nftCount: 12,
          level: 45,
          xp: 125000,
          country: 'US',
          clan: 'Avalanche Elite'
        },
        {
          id: '2',
          address: '0x456...def',
          username: 'RushMaster',
          avatar: '⚡',
          score: 198000,
          previousScore: 185000,
          rank: 2,
          previousRank: 3,
          streak: 8,
          gamesPlayed: 189,
          winRate: 79,
          lastPlayed: Date.now() - 900000, // 15 minutes ago
          isOnline: true,
          achievements: ['Speed Demon', 'High Roller', 'Unstoppable'],
          tier: 'LEGEND',
          rushTokens: 8950,
          nftCount: 8,
          level: 38,
          xp: 89000,
          country: 'CA',
          clan: 'Snow Warriors'
        },
        {
          id: '3',
          address: '0x789...ghi',
          username: 'DiamondHands',
          avatar: '💎',
          score: 156000,
          previousScore: 142000,
          rank: 3,
          previousRank: 2,
          streak: 12,
          gamesPlayed: 156,
          winRate: 75,
          lastPlayed: Date.now() - 1800000, // 30 minutes ago
          isOnline: false,
          achievements: ['Diamond Hands', 'Speed Demon', 'High Roller'],
          tier: 'LEGEND',
          rushTokens: 7200,
          nftCount: 6,
          level: 34,
          xp: 76000,
          country: 'UK',
          clan: 'Crystal Crusaders'
        },
        // Add current user if connected
        ...(account ? [{
          id: 'current',
          address: account,
          username: 'You',
          avatar: '🎮',
          score: 45000,
          previousScore: 42000,
          rank: 12,
          previousRank: 15,
          streak: 3,
          gamesPlayed: 67,
          winRate: 68,
          lastPlayed: Date.now() - 120000, // 2 minutes ago
          isOnline: true,
          achievements: ['First Steps', 'Rising Star'],
          tier: 'PLATINUM' as const,
          rushTokens: 1250,
          nftCount: 3,
          level: 18,
          xp: 24500,
          country: 'Unknown',
          clan: undefined
        }] : [])
      ];

      // Sort by score
      mockPlayers.sort((a, b) => b.score - a.score);
      
      // Update ranks
      mockPlayers.forEach((player, index) => {
        player.rank = index + 1;
      });

      setPlayers(mockPlayers);
      
      if (account) {
        const currentPlayerData = mockPlayers.find(p => p.address === account);
        setCurrentPlayer(currentPlayerData || null);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getPlayerTier = (score: number) => {
    for (const [tier, config] of Object.entries(tierConfig).reverse()) {
      if (score >= config.minScore) {
        return tier as keyof typeof tierConfig;
      }
    }
    return 'BRONZE';
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-orange-500" />;
      default: return <span className="font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankChange = (currentRank: number, previousRank: number) => {
    const change = previousRank - currentRank;
    if (change > 0) {
      return (
        <div className="flex items-center text-green-600 text-xs">
          <ChevronUp className="w-3 h-3" />
          <span>+{change}</span>
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center text-red-600 text-xs">
          <ChevronDown className="w-3 h-3" />
          <span>{change}</span>
        </div>
      );
    }
    return <div className="w-8 h-4"></div>;
  };

  const getTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const displayPlayers = showFullLeaderboard ? players : players.slice(0, 10);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header Section */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center mb-4"
        >
          <Trophy className="w-8 h-8 text-yellow-500 mr-3" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            Leaderboard
          </h1>
          <Trophy className="w-8 h-8 text-yellow-500 ml-3" />
        </motion.div>
        
        <p className="text-gray-600 text-lg">
          Compete for glory, earn rewards, and climb to the top!
        </p>

        {/* Timeframe Selector */}
        <div className="flex justify-center mt-6 space-x-2">
          {['daily', 'weekly', 'monthly', 'allTime'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedTimeframe(period as 'daily' | 'weekly' | 'monthly' | 'allTime')}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                selectedTimeframe === period
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Current Player Status */}
      {currentPlayer && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 mb-8 text-white"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                {currentPlayer.avatar}
              </div>
              <div>
                <h3 className="text-xl font-bold">Your Current Position</h3>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-3xl font-bold">#{currentPlayer.rank}</span>
                  {getRankChange(currentPlayer.rank, currentPlayer.previousRank)}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm opacity-80">Score:</span>
                    <span className="text-xl font-bold">
                      {formatNumber(animatedScores[currentPlayer.id] || currentPlayer.score)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-80">Next Tier</div>
              <div className="text-lg font-bold">
                {Object.entries(tierConfig).find(([tier, config]) => 
                  config.minScore > currentPlayer.score
                )?.[0] || 'MAX TIER'}
              </div>
              <div className="text-sm opacity-80">
                {Object.entries(tierConfig).find(([tier, config]) => 
                  config.minScore > currentPlayer.score
                )?.[1]?.minScore ? 
                  `${formatNumber(Object.entries(tierConfig).find(([tier, config]) => 
                    config.minScore > currentPlayer.score
                  )![1].minScore - currentPlayer.score)} points needed`
                  : 'Legend Status!'
                }
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
        {players.slice(0, 3).map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className={`relative ${index === 0 ? 'order-2' : index === 1 ? 'order-1' : 'order-3'} ${
              index === 0 ? 'transform scale-110' : ''
            }`}
          >
            <div className={`bg-gradient-to-br ${tierConfig[player.tier].color} rounded-2xl p-6 text-white relative overflow-hidden`}>
              {/* Background Effects */}
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/20 rounded-full"></div>
              <div className="absolute -bottom-5 -left-5 w-15 h-15 bg-white/10 rounded-full"></div>
              
              <div className="relative z-10 text-center">
                {/* Rank Badge */}
                <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center text-2xl ${
                  index === 0 ? 'bg-yellow-400 text-yellow-900' :
                  index === 1 ? 'bg-gray-300 text-gray-700' :
                  'bg-orange-400 text-orange-900'
                }`}>
                  {index === 0 ? '👑' : index === 1 ? '🥈' : '🥉'}
                </div>

                {/* Player Info */}
                <div className="mb-2">
                  <div className="text-xl font-bold">{player.username || formatAddress(player.address)}</div>
                  <div className="text-sm opacity-80 flex items-center justify-center">
                    <span className="mr-2">{tierConfig[player.tier].icon}</span>
                    {player.tier}
                  </div>
                </div>

                {/* Score */}
                <div className="mb-3">
                  <div className="text-3xl font-bold">
                    {formatNumber(animatedScores[player.id] || player.score)}
                  </div>
                  <div className="text-xs opacity-80">
                    {player.score > player.previousScore && (
                      <span className="text-green-300">
                        +{formatNumber(player.score - player.previousScore)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="font-bold">{player.winRate}%</div>
                    <div className="opacity-80">Win Rate</div>
                  </div>
                  <div>
                    <div className="font-bold">{player.streak}</div>
                    <div className="opacity-80">Streak</div>
                  </div>
                </div>

                {/* Online Status */}
                {player.isOnline && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Full Leaderboard */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Full Rankings</h2>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <Users className="w-4 h-4 inline mr-1" />
                {players.length} players competing
              </div>
              <button
                onClick={() => setShowFullLeaderboard(!showFullLeaderboard)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {showFullLeaderboard ? 'Show Top 10' : 'Show All'}
              </button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          <AnimatePresence>
            {displayPlayers.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  player.address === account ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                } ${player.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : ''}`}
              >
                <div className="flex items-center justify-between">
                  {/* Left Side - Rank and Player Info */}
                  <div className="flex items-center space-x-4">
                    {/* Rank */}
                    <div className="w-12 flex flex-col items-center">
                      <div className="flex items-center">
                        {getRankIcon(player.rank)}
                      </div>
                      {getRankChange(player.rank, player.previousRank)}
                    </div>

                    {/* Avatar and Tier */}
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${tierConfig[player.tier].color} flex items-center justify-center text-lg font-bold text-white`}>
                        {player.avatar || tierConfig[player.tier].icon}
                      </div>
                      {player.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>

                    {/* Player Details */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-gray-900">
                          {player.username || formatAddress(player.address)}
                        </span>
                        {player.address === account && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            You
                          </span>
                        )}
                        {player.clan && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            {player.clan}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Star className="w-3 h-3 mr-1" />
                          Level {player.level}
                        </span>
                        <span className="flex items-center">
                          <Flame className="w-3 h-3 mr-1" />
                          {player.streak} streak
                        </span>
                        <span className="flex items-center">
                          <Target className="w-3 h-3 mr-1" />
                          {player.winRate}% win rate
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {getTimeAgo(player.lastPlayed)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Score and Rewards */}
                  <div className="flex items-center space-x-6">
                    {/* Achievements */}
                    <div className="flex items-center space-x-1">
                      {player.achievements.slice(0, 3).map((achievement, i) => (
                        <div
                          key={i}
                          className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs"
                          title={achievement}
                        >
                          🏆
                        </div>
                      ))}
                      {player.achievements.length > 3 && (
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                          +{player.achievements.length - 3}
                        </div>
                      )}
                    </div>

                    {/* RUSH Tokens */}
                    <div className="text-right">
                      <div className="text-sm font-medium text-orange-600">
                        {formatNumber(player.rushTokens)} RUSH
                      </div>
                      <div className="text-xs text-gray-500">
                        {player.nftCount} NFTs
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right min-w-[100px]">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatNumber(animatedScores[player.id] || player.score)}
                      </div>
                      {player.score > player.previousScore && (
                        <div className="text-sm text-green-600 flex items-center justify-end">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +{formatNumber(player.score - player.previousScore)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Motivational Elements */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Next Tier Motivation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white"
        >
          <div className="flex items-center mb-3">
            <Sparkles className="w-6 h-6 mr-2" />
            <h3 className="font-bold">Reach Next Tier</h3>
          </div>
          <p className="text-sm opacity-90 mb-3">
            Climb the ranks and unlock exclusive rewards!
          </p>
          <div className="text-lg font-bold">
            {currentPlayer && Object.entries(tierConfig).find(([tier, config]) => 
              config.minScore > currentPlayer.score
            ) ? (
              <>Next: {Object.entries(tierConfig).find(([tier, config]) => 
                config.minScore > currentPlayer.score
              )![0]} Tier</>
            ) : (
              'You\'re at the top!'
            )}
          </div>
        </motion.div>

        {/* Weekly Rewards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-6 text-white"
        >
          <div className="flex items-center mb-3">
            <Trophy className="w-6 h-6 mr-2" />
            <h3 className="font-bold">Weekly Prizes</h3>
          </div>
          <p className="text-sm opacity-90 mb-3">
            Top 10 players earn bonus rewards every week!
          </p>
          <div className="text-lg font-bold">
            Up to 500 RUSH Tokens
          </div>
        </motion.div>

        {/* Social Competition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-6 text-white"
        >
          <div className="flex items-center mb-3">
            <Users className="w-6 h-6 mr-2" />
            <h3 className="font-bold">Challenge Friends</h3>
          </div>
          <p className="text-sm opacity-90 mb-3">
            Invite friends and compete for exclusive clan rewards!
          </p>
          <div className="text-lg font-bold">
            Bonus XP & NFTs
          </div>
        </motion.div>
      </div>

      {/* Progress to Next Milestone */}
      {currentPlayer && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-white rounded-2xl shadow-xl p-6"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <Target className="w-6 h-6 mr-2 text-blue-500" />
            Your Progress
          </h3>
          
          <div className="space-y-4">
            {/* Score Progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Score Progress</span>
                <span>{formatNumber(currentPlayer.score)} / {formatNumber(
                  Object.entries(tierConfig).find(([tier, config]) => 
                    config.minScore > currentPlayer.score
                  )?.[1]?.minScore || currentPlayer.score
                )}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${Math.min(100, (currentPlayer.score / (Object.entries(tierConfig).find(([tier, config]) => 
                      config.minScore > currentPlayer.score
                    )?.[1]?.minScore || currentPlayer.score)) * 100)}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Rank Progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Rank Progress</span>
                <span>#{currentPlayer.rank} / {players.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-teal-500 h-3 rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${Math.max(5, 100 - (currentPlayer.rank / players.length * 100))}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default EnhancedLeaderboard;
