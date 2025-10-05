// src/pages/LeaderboardPage.tsx
import React, { useState, useEffect } from 'react';
import { useAvalancheFeatures } from '../hooks/useAvalancheFeatures';
import { useAdvancedWeb3 } from '../hooks/useAdvancedWeb3';
import Navigation from '../components/ui/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Progress } from '../components/ui/progress';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Star, 
  TrendingUp, 
  Users,
  Gamepad2,
  Mountain,
  Zap,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface LeaderboardPlayer {
  rank: number;
  address: string;
  username: string;
  totalScore: number;
  highestScore: number;
  gamesPlayed: number;
  level: number;
  streakDays: number;
  achievements: number;
  avatarUrl?: string;
  lastActive: Date;
  change: 'up' | 'down' | 'same';
}

interface GameModeStats {
  mode: string;
  icon: string;
  topPlayers: LeaderboardPlayer[];
}

const LeaderboardPage: React.FC = () => {
  const { account, isConnected } = useAdvancedWeb3();
  const { avalancheQuests, loadAvalancheData } = useAvalancheFeatures();

  const [activeTab, setActiveTab] = useState('global');
  const [timeFilter, setTimeFilter] = useState('all-time');
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardPlayer[]>([]);
  const [gameModeStats, setGameModeStats] = useState<GameModeStats[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load leaderboard data on mount
  useEffect(() => {
    loadLeaderboardData();
  }, [activeTab, timeFilter]);

  // Auto refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshLeaderboard();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadLeaderboardData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to get leaderboard data
      // In a real implementation, this would fetch from smart contracts
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData = generateMockLeaderboardData();
      setLeaderboardData(mockData);
      
      const mockGameModes = generateMockGameModeStats();
      setGameModeStats(mockGameModes);
      
      // Find user's rank if connected
      if (isConnected && account) {
        const userIndex = mockData.findIndex(player => 
          player.address.toLowerCase() === account.toLowerCase()
        );
        setUserRank(userIndex !== -1 ? userIndex + 1 : null);
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLeaderboard = async () => {
    setRefreshing(true);
    try {
      await loadLeaderboardData();
    } finally {
      setRefreshing(false);
    }
  };

  const generateMockLeaderboardData = (): LeaderboardPlayer[] => {
    const players: LeaderboardPlayer[] = [];
    const names = ['CryptoKing', 'BlockchainMaster', 'AvalancheHero', 'DeFiGuru', 'Web3Warrior', 'TokenLord', 'NFTCollector', 'StakingPro', 'YieldFarmer', 'BridgeMaster'];
    
    for (let i = 0; i < 50; i++) {
      players.push({
        rank: i + 1,
        address: `0x${Math.random().toString(16).substr(2, 40)}`,
        username: `${names[i % names.length]}${Math.floor(Math.random() * 1000)}`,
        totalScore: Math.floor(Math.random() * 100000) + (50 - i) * 2000,
        highestScore: Math.floor(Math.random() * 50000) + (50 - i) * 1000,
        gamesPlayed: Math.floor(Math.random() * 200) + 10,
        level: Math.floor(Math.random() * 50) + 1,
        streakDays: Math.floor(Math.random() * 30),
        achievements: Math.floor(Math.random() * 20) + (50 - i),
        lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        change: ['up', 'down', 'same'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'same'
      });
    }

    return players.sort((a, b) => b.totalScore - a.totalScore);
  };

  const generateMockGameModeStats = (): GameModeStats[] => {
    return [
      {
        mode: 'Classic',
        icon: '🎮',
        topPlayers: leaderboardData.slice(0, 5)
      },
      {
        mode: 'Tutorial',
        icon: '📚',
        topPlayers: leaderboardData.slice(5, 10)
      },
      {
        mode: 'Challenge',
        icon: '⚡',
        topPlayers: leaderboardData.slice(10, 15)
      },
      {
        mode: 'Quest',
        icon: '🗡️',
        topPlayers: leaderboardData.slice(15, 20)
      },
      {
        mode: 'Speed Run',
        icon: '🏃',
        topPlayers: leaderboardData.slice(20, 25)
      },
      {
        mode: 'Survival',
        icon: '🛡️',
        topPlayers: leaderboardData.slice(25, 30)
      }
    ];
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-amber-600';
    if (rank <= 10) return 'text-blue-500';
    if (rank <= 50) return 'text-green-500';
    return 'text-gray-500';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
    return <Trophy className={`h-5 w-5 ${getRankColor(rank)}`} />;
  };

  const getChangeIcon = (change: 'up' | 'down' | 'same') => {
    switch (change) {
      case 'up':
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      case 'same':
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatScore = (score: number) => {
    return score.toLocaleString();
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'Online';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading Leaderboard...</div>
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
            <Trophy className="h-8 w-8 text-yellow-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Avalanche Rush Leaderboard
            </h1>
            <Mountain className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-lg text-gray-300">
            Compete with players worldwide and climb the ranks
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={refreshLeaderboard}
              disabled={refreshing}
              variant="outline"
              className="bg-blue-600/20 border-blue-500/30 text-blue-300 hover:bg-blue-600/30"
            >
              {refreshing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-300 mr-2" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </div>

        {/* User Rank Card */}
        {isConnected && userRank && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {getRankIcon(userRank)}
                  <span className={`text-2xl font-bold ${getRankColor(userRank)}`}>
                    #{userRank}
                  </span>
                </div>
                <div>
                  <div className="text-white font-semibold">Your Rank</div>
                  <div className="text-gray-400">{formatAddress(account || '')}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">
                  {formatScore(leaderboardData[userRank - 1]?.totalScore || 0)} points
                </div>
                <div className="text-gray-400">
                  Level {leaderboardData[userRank - 1]?.level || 1}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Time Filter */}
        <div className="flex justify-center">
          <div className="flex space-x-2 bg-gray-800/50 rounded-lg p-1">
            {['all-time', 'monthly', 'weekly', 'daily'].map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-4 py-2 rounded-md transition-colors capitalize ${
                  timeFilter === filter
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {filter.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Main Leaderboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
            <TabsTrigger value="global">Global Rankings</TabsTrigger>
            <TabsTrigger value="game-modes">Game Modes</TabsTrigger>
            <TabsTrigger value="achievements">Top Achievers</TabsTrigger>
          </TabsList>

          {/* Global Rankings Tab */}
          <TabsContent value="global" className="space-y-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Global Rankings</span>
                  <Badge variant="secondary">{leaderboardData.length} players</Badge>
                </CardTitle>
                <CardDescription>
                  Top players across all game modes and difficulties
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <AnimatePresence>
                    {leaderboardData.slice(0, 20).map((player, index) => (
                      <motion.div
                        key={player.address}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center justify-between p-4 rounded-lg transition-all hover:bg-gray-700/30 ${
                          account?.toLowerCase() === player.address.toLowerCase()
                            ? 'bg-blue-600/20 border border-blue-500/30'
                            : 'bg-gray-700/20'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2 w-12">
                            {getRankIcon(player.rank)}
                            <span className={`font-bold ${getRankColor(player.rank)}`}>
                              {player.rank}
                            </span>
                          </div>
                          
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={player.avatarUrl} />
                            <AvatarFallback>{player.username[0]}</AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <div className="font-semibold text-white">{player.username}</div>
                            <div className="text-sm text-gray-400">{formatAddress(player.address)}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <div className="font-bold text-white">{formatScore(player.totalScore)}</div>
                            <div className="text-sm text-gray-400">Total Score</div>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-bold text-blue-400">{player.level}</div>
                            <div className="text-sm text-gray-400">Level</div>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-bold text-green-400">{player.achievements}</div>
                            <div className="text-sm text-gray-400">Achievements</div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-sm text-gray-400">{formatTime(player.lastActive)}</div>
                            <div className="flex items-center justify-end">
                              {getChangeIcon(player.change)}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Game Modes Tab */}
          <TabsContent value="game-modes" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {gameModeStats.map((gameModeData, index) => (
                <motion.div
                  key={gameModeData.mode}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <span className="text-2xl">{gameModeData.icon}</span>
                        <span>{gameModeData.mode} Mode</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {gameModeData.topPlayers.map((player, playerIndex) => (
                          <div
                            key={player.address}
                            className="flex items-center justify-between p-3 rounded-lg bg-gray-700/20 hover:bg-gray-700/40 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <span className={`font-bold text-lg ${getRankColor(playerIndex + 1)}`}>
                                {playerIndex + 1}
                              </span>
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{player.username[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold text-white text-sm">{player.username}</div>
                                <div className="text-xs text-gray-400">Level {player.level}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-white">{formatScore(player.highestScore)}</div>
                              <div className="text-xs text-gray-400">High Score</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5" />
                  <span>Top Achievers</span>
                </CardTitle>
                <CardDescription>
                  Players with the most achievements and NFT rewards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboardData
                    .sort((a, b) => b.achievements - a.achievements)
                    .slice(0, 10)
                    .map((player, index) => (
                      <div
                        key={player.address}
                        className="flex items-center justify-between p-4 rounded-lg bg-gray-700/20 hover:bg-gray-700/40 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {index < 3 ? getRankIcon(index + 1) : (
                              <span className="font-bold text-gray-400 w-6 text-center">{index + 1}</span>
                            )}
                          </div>
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>{player.username[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-white">{player.username}</div>
                            <div className="text-sm text-gray-400">Level {player.level}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <div className="font-bold text-2xl text-yellow-400">{player.achievements}</div>
                            <div className="text-sm text-gray-400">Achievements</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-lg text-blue-400">{player.streakDays}</div>
                            <div className="text-sm text-gray-400">Day Streak</div>
                          </div>
                          <div className="w-32">
                            <Progress 
                              value={(player.achievements / Math.max(...leaderboardData.map(p => p.achievements))) * 100} 
                              className="h-2"
                            />
                            <div className="text-xs text-gray-400 mt-1">Achievement Rate</div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-blue-500/30">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{leaderboardData.length}</div>
              <div className="text-sm text-gray-300">Active Players</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/30">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {formatScore(Math.max(...leaderboardData.map(p => p.totalScore)))}
              </div>
              <div className="text-sm text-gray-300">Highest Score</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30">
            <CardContent className="p-6 text-center">
              <Gamepad2 className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {leaderboardData.reduce((sum, p) => sum + p.gamesPlayed, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-300">Games Played</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-yellow-500/30">
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {leaderboardData.reduce((sum, p) => sum + p.achievements, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-300">Total Achievements</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
