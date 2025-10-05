import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMockDataDemo } from '../hooks/useMockData';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Database, 
  Users, 
  Trophy, 
  Star, 
  Medal, 
  Zap, 
  Play, 
  Pause,
  RefreshCw,
  Eye,
  EyeOff,
  Crown,
  Flame,
  Target,
  Award,
  Gift,
  MessageSquare,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import MockDataToggle from '../components/MockDataToggle';

const MockDataDemo: React.FC = () => {
  const mockData = useMockDataDemo();
  const [showMockDataToggle, setShowMockDataToggle] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const {
    players,
    quests,
    nfts,
    guilds,
    tournaments,
    leaderboard,
    analytics,
    socialData,
    events,
    demoMode,
    enableDemoMode,
    disableDemoMode,
    simulateLiveEvent
  } = mockData;

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common': return 'text-gray-400';
      case 'uncommon': return 'text-blue-400';
      case 'rare': return 'text-purple-400';
      case 'legendary': return 'text-yellow-400';
      case 'epic': return 'text-pink-400';
      default: return 'text-gray-400';
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common': return 'bg-gray-500/20';
      case 'uncommon': return 'bg-blue-500/20';
      case 'rare': return 'bg-purple-500/20';
      case 'legendary': return 'bg-yellow-500/20';
      case 'epic': return 'bg-pink-500/20';
      default: return 'bg-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-purple-800/50 to-blue-800/50 border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-600 rounded-lg">
                    <Database className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Avalanche Rush Mock Data Demo</h1>
                    <p className="text-purple-200">Comprehensive demo data for hackathon presentation</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Badge 
                    variant="outline" 
                    className={`border-2 ${mockData.isMockDataEnabled ? 'border-green-400 text-green-400' : 'border-red-400 text-red-400'}`}
                  >
                    {mockData.isMockDataEnabled ? (
                      <>
                        <Eye className="h-3 w-3 mr-1" />
                        Mock Data ON
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3 mr-1" />
                        Mock Data OFF
                      </>
                    )}
                  </Badge>
                  <Button
                    onClick={() => setShowMockDataToggle(true)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8"
        >
          <Card className="bg-gradient-to-br from-purple-800/50 to-blue-800/50 border-purple-500/30">
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{players.length}</div>
              <div className="text-purple-200 text-sm">Players</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-800/50 to-blue-800/50 border-purple-500/30">
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{quests.length}</div>
              <div className="text-purple-200 text-sm">Quests</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-800/50 to-blue-800/50 border-purple-500/30">
            <CardContent className="p-4 text-center">
              <Award className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{nfts.length}</div>
              <div className="text-purple-200 text-sm">NFTs</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-800/50 to-blue-800/50 border-purple-500/30">
            <CardContent className="p-4 text-center">
              <Crown className="h-6 w-6 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{guilds.length}</div>
              <div className="text-purple-200 text-sm">Guilds</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-800/50 to-blue-800/50 border-purple-500/30">
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 text-orange-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{tournaments.length}</div>
              <div className="text-purple-200 text-sm">Tournaments</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-800/50 to-blue-800/50 border-purple-500/30">
            <CardContent className="p-4 text-center">
              <Zap className="h-6 w-6 text-pink-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{events.length}</div>
              <div className="text-purple-200 text-sm">Events</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-purple-800/30">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">Overview</TabsTrigger>
            <TabsTrigger value="players" className="data-[state=active]:bg-purple-600">Players</TabsTrigger>
            <TabsTrigger value="quests" className="data-[state=active]:bg-purple-600">Quests</TabsTrigger>
            <TabsTrigger value="nfts" className="data-[state=active]:bg-purple-600">NFTs</TabsTrigger>
            <TabsTrigger value="guilds" className="data-[state=active]:bg-purple-600">Guilds</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Events */}
              <Card className="bg-gradient-to-br from-purple-800/50 to-blue-800/50 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Recent Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {events.slice(-5).map((event, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <div className="flex-1">
                          <div className="text-white text-sm font-medium">
                            {event.type.replace('_', ' ').toUpperCase()}
                          </div>
                          <div className="text-purple-200 text-xs">
                            {event.data.player || 'System'}
                          </div>
                        </div>
                        <div className="text-purple-300 text-xs">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Leaderboard Preview */}
              <Card className="bg-gradient-to-br from-purple-800/50 to-blue-800/50 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Top Players
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboard.classic.slice(0, 5).map((entry, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                        <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="text-white text-sm font-medium">{entry.username}</div>
                          <div className="text-purple-200 text-xs">{entry.score.toLocaleString()} pts</div>
                        </div>
                        <Badge variant="outline" className="border-purple-400 text-purple-200">
                          {entry.mode || 'classic'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Demo Controls */}
            <Card className="bg-gradient-to-br from-purple-800/50 to-blue-800/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Demo Controls
                </CardTitle>
                <CardDescription className="text-purple-200">
                  Simulate live events for your demo presentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => simulateLiveEvent('player_update')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Player Update
                  </Button>
                  <Button
                    onClick={() => simulateLiveEvent('quest_completed')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Quest Complete
                  </Button>
                  <Button
                    onClick={() => simulateLiveEvent('nft_minted')}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Award className="h-4 w-4 mr-2" />
                    NFT Minted
                  </Button>
                  <Button
                    onClick={() => simulateLiveEvent('tournament_update')}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    Tournament Update
                  </Button>
                  <Button
                    onClick={() => simulateLiveEvent('chat_message')}
                    className="bg-pink-600 hover:bg-pink-700"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Players Tab */}
          <TabsContent value="players" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {players.map((player) => (
                <Card key={player.address} className="bg-gradient-to-br from-purple-800/50 to-blue-800/50 border-purple-500/30">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-xl">
                          🎮
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{player.username}</h3>
                          <p className="text-purple-200 text-sm">Level {player.level}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-purple-200">Total Score</span>
                          <span className="text-white">{player.totalScore.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-purple-200">Games Played</span>
                          <span className="text-white">{player.totalGamesPlayed}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-purple-200">Current Streak</span>
                          <span className="text-white">{player.currentStreak}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-purple-200">Guild</span>
                          <span className="text-white">{player.guild}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {player.ownedNFTs.slice(0, 3).map((nftId) => (
                          <Badge key={nftId} variant="outline" className="border-purple-400 text-purple-200 text-xs">
                            NFT #{nftId}
                          </Badge>
                        ))}
                        {player.ownedNFTs.length > 3 && (
                          <Badge variant="outline" className="border-purple-400 text-purple-200 text-xs">
                            +{player.ownedNFTs.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Quests Tab */}
          <TabsContent value="quests" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quests.map((quest) => (
                <Card key={quest.questId} className="bg-gradient-to-br from-purple-800/50 to-blue-800/50 border-purple-500/30">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-semibold text-lg">{quest.name}</h3>
                        <Badge className={`${getRarityBg(quest.difficulty)} ${getRarityColor(quest.difficulty)} border-0`}>
                          {quest.difficulty}
                        </Badge>
                      </div>
                      <p className="text-purple-200 text-sm">{quest.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span className="text-white">{quest.reward} RUSH</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-purple-400" />
                          <span className="text-white">NFT #{quest.nftReward}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-blue-400 text-blue-200">
                          {quest.type}
                        </Badge>
                        {quest.status && (
                          <Badge variant="outline" className="border-green-400 text-green-200">
                            {quest.status}
                          </Badge>
                        )}
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
              {nfts.map((nft) => (
                <Card key={nft.tokenId} className="bg-gradient-to-br from-purple-800/50 to-blue-800/50 border-purple-500/30">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="aspect-square bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-4xl">
                        🎨
                      </div>
                      <div>
                        <h3 className="text-white font-semibold mb-1">{nft.name}</h3>
                        <p className="text-purple-200 text-sm mb-2">{nft.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge className={`${getRarityBg(nft.rarity)} ${getRarityColor(nft.rarity)} border-0`}>
                            {nft.rarity}
                          </Badge>
                          <span className="text-purple-200 text-sm">#{nft.tokenId}</span>
                        </div>
                        <div className="mt-2 text-sm text-purple-200">
                          Owner: {nft.owner}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Guilds Tab */}
          <TabsContent value="guilds" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {guilds.map((guild) => (
                <Card key={guild.guildId} className="bg-gradient-to-br from-purple-800/50 to-blue-800/50 border-purple-500/30">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-xl">
                          👑
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-lg">{guild.name}</h3>
                          <p className="text-purple-200 text-sm">{guild.description}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-purple-200">Level</span>
                          <div className="text-white font-semibold">{guild.level}</div>
                        </div>
                        <div>
                          <span className="text-purple-200">Reputation</span>
                          <div className="text-white font-semibold">{guild.reputation}</div>
                        </div>
                        <div>
                          <span className="text-purple-200">Members</span>
                          <div className="text-white font-semibold">{guild.members.length}</div>
                        </div>
                        <div>
                          <span className="text-purple-200">Treasury</span>
                          <div className="text-white font-semibold">{guild.treasury.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-purple-200">Leader: {guild.leader}</div>
                        {guild.currentQuest && (
                          <div className="text-sm text-purple-200">Current Quest: {guild.currentQuest}</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Metrics */}
              <Card className="bg-gradient-to-br from-purple-800/50 to-blue-800/50 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-purple-200">Total Users</span>
                    <span className="text-white font-semibold">{analytics.userMetrics.totalUsers.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Active Users</span>
                    <span className="text-white font-semibold">{analytics.userMetrics.activeUsers.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">New Users Today</span>
                    <span className="text-white font-semibold">{analytics.userMetrics.newUsersToday}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Retention Rate</span>
                    <span className="text-white font-semibold">{(analytics.userMetrics.retentionRate * 100).toFixed(1)}%</span>
                  </div>
                </CardContent>
              </Card>

              {/* Game Metrics */}
              <Card className="bg-gradient-to-br from-purple-800/50 to-blue-800/50 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Game Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-purple-200">Total Games</span>
                    <span className="text-white font-semibold">{analytics.gameMetrics.totalGamesPlayed.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Average Score</span>
                    <span className="text-white font-semibold">{analytics.gameMetrics.averageScore.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Highest Score</span>
                    <span className="text-white font-semibold">{analytics.gameMetrics.highestScore.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Quest Completion</span>
                    <span className="text-white font-semibold">{(analytics.userMetrics.questCompletionRate * 100).toFixed(1)}%</span>
                  </div>
                </CardContent>
              </Card>

              {/* Blockchain Metrics */}
              <Card className="bg-gradient-to-br from-purple-800/50 to-blue-800/50 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Blockchain Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-purple-200">Total Transactions</span>
                    <span className="text-white font-semibold">{analytics.blockchainMetrics.totalTransactions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Contract Interactions</span>
                    <span className="text-white font-semibold">{analytics.blockchainMetrics.contractInteractions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">NFT Mints</span>
                    <span className="text-white font-semibold">{analytics.blockchainMetrics.nftMints.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Token Transfers</span>
                    <span className="text-white font-semibold">{analytics.blockchainMetrics.tokenTransfers.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Rewards Distribution */}
              {analytics.rewardsDistribution && (
                <Card className="bg-gradient-to-br from-purple-800/50 to-blue-800/50 border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Gift className="h-5 w-5" />
                      Rewards Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-purple-200">Total Rewards</span>
                      <span className="text-white font-semibold">{analytics.rewardsDistribution.totalRewards.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-200">Average Reward</span>
                      <span className="text-white font-semibold">{analytics.rewardsDistribution.averageReward.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-200">Pending Claims</span>
                      <span className="text-white font-semibold">{analytics.rewardsDistribution.pendingClaims}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Mock Data Toggle Modal */}
        <MockDataToggle 
          isOpen={showMockDataToggle} 
          onClose={() => setShowMockDataToggle(false)} 
        />
      </div>
    </div>
  );
};

export default MockDataDemo;
