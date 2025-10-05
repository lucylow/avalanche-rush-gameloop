import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccount } from 'wagmi';
import { 
  Gift, 
  Trophy, 
  Coins, 
  Zap,
  Star,
  Crown,
  Sparkles,
  Target,
  TrendingUp,
  Award,
  Ticket,
  Layers,
  Activity,
  CheckCircle,
  Shield,
  Sword,
  Gem,
  Flame,
  Clock,
  Users,
  BarChart3
} from 'lucide-react';

// Lazy load components
import { lazy, Suspense } from 'react';

const RaffleSystem = lazy(() => import('../components/rewards/RaffleSystem'));
const EvolvingNFTGallery = lazy(() => import('../components/nft/EvolvingNFTGallery'));

const EnhancedRewardsPage: React.FC = () => {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('overview');

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-20">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16"
      >
        <Gift className="w-16 h-16 text-purple-400" />
      </motion.div>
    </div>
  );

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-2xl mx-4"
        >
          <Card className="bg-gray-800 text-white border-gray-700 shadow-2xl">
            <CardHeader className="text-center pb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-2xl mx-auto mb-6"
              >
                🎁
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-black mb-4 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent"
              >
                Enhanced Rewards System
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-300"
              >
                Automated rewards, evolving NFTs, and provably fair raffles with Chainlink VRF
              </motion.p>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Features Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <div className="text-center p-6 bg-gradient-to-br from-purple-600/20 to-purple-700/20 rounded-xl border border-purple-500/30">
                  <Zap className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                  <h3 className="font-bold text-lg mb-2">Automated Rewards</h3>
                  <p className="text-sm text-gray-300">
                    AVAX and RUSH tokens distributed automatically based on performance
                  </p>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-indigo-600/20 to-indigo-700/20 rounded-xl border border-indigo-500/30">
                  <Sparkles className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
                  <h3 className="font-bold text-lg mb-2">Evolving NFTs</h3>
                  <p className="text-sm text-gray-300">
                    Dynamic NFTs that grow and evolve as you progress in learning
                  </p>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-pink-600/20 to-pink-700/20 rounded-xl border border-pink-500/30">
                  <Ticket className="w-12 h-12 text-pink-400 mx-auto mb-3" />
                  <h3 className="font-bold text-lg mb-2">Provably Fair Raffles</h3>
                  <p className="text-sm text-gray-300">
                    Weekly raffles with Chainlink VRF for guaranteed randomness
                  </p>
                </div>
              </motion.div>

              {/* Call to Action */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-center"
              >
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-full shadow-2xl transition-all duration-300"
                >
                  Connect Wallet to Access Rewards
                </Button>
                <p className="text-sm text-gray-400 mt-4">
                  Join thousands of learners earning automated rewards
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-2xl font-bold text-white shadow-2xl">
                🎁
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Enhanced Rewards
                </h1>
                <p className="text-gray-300 text-sm">Automated • Transparent • Fair</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">2.5K+</div>
                <div className="text-xs text-gray-300">Rewards Distributed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-400">156</div>
                <div className="text-xs text-gray-300">NFTs Minted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-400">12</div>
                <div className="text-xs text-gray-300">Raffles Completed</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700 mb-8">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-purple-600 flex items-center space-x-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="raffles" 
              className="data-[state=active]:bg-indigo-600 flex items-center space-x-2"
            >
              <Ticket className="w-4 h-4" />
              <span>Raffles</span>
            </TabsTrigger>
            <TabsTrigger 
              value="nfts" 
              className="data-[state=active]:bg-pink-600 flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Evolving NFTs</span>
            </TabsTrigger>
            <TabsTrigger 
              value="transparency" 
              className="data-[state=active]:bg-green-600 flex items-center space-x-2"
            >
              <Shield className="w-4 h-4" />
              <span>Transparency</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Rewards System Overview
              </h2>
              <p className="text-xl text-gray-300">
                Transparent, automated reward distribution with evolving NFTs and fair raffles
              </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-purple-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Total Rewards</p>
                      <p className="text-3xl font-bold">125.7 AVAX</p>
                    </div>
                    <Coins className="w-8 h-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-indigo-600 to-indigo-700 border-indigo-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-indigo-100 text-sm">NFTs Minted</p>
                      <p className="text-3xl font-bold">156</p>
                    </div>
                    <Sparkles className="w-8 h-8 text-indigo-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-pink-600 to-pink-700 border-pink-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-pink-100 text-sm">Active Players</p>
                      <p className="text-3xl font-bold">2,847</p>
                    </div>
                    <Users className="w-8 h-8 text-pink-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-600 to-green-700 border-green-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Raffles Completed</p>
                      <p className="text-3xl font-bold">12</p>
                    </div>
                    <Trophy className="w-8 h-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="w-6 h-6 mr-2 text-yellow-400" />
                    Automated Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">
                    Rewards are automatically distributed based on learning performance using Reactive Network automation.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>AVAX Rewards</span>
                      <span className="text-green-400">✓ Automated</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>RUSH Tokens</span>
                      <span className="text-green-400">✓ Automated</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>NFT Minting</span>
                      <span className="text-green-400">✓ Automated</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="w-6 h-6 mr-2 text-purple-400" />
                    Evolving NFTs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">
                    Your NFTs grow and evolve as you progress, gaining new abilities and visual upgrades.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Max Level</span>
                      <span className="text-blue-400">10</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Evolution XP</span>
                      <span className="text-blue-400">1,000 per level</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Cooldown</span>
                      <span className="text-blue-400">24 hours</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Ticket className="w-6 h-6 mr-2 text-pink-400" />
                    Fair Raffles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">
                    Weekly raffles with Chainlink VRF ensure provably random and fair winner selection.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Randomness</span>
                      <span className="text-green-400">Chainlink VRF</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Frequency</span>
                      <span className="text-blue-400">Weekly</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Prize Pool</span>
                      <span className="text-blue-400">10% of rewards</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Raffles Tab */}
          <TabsContent value="raffles" className="space-y-8">
            <Suspense fallback={<LoadingSpinner />}>
              <RaffleSystem />
            </Suspense>
          </TabsContent>

          {/* NFTs Tab */}
          <TabsContent value="nfts" className="space-y-8">
            <Suspense fallback={<LoadingSpinner />}>
              <EvolvingNFTGallery />
            </Suspense>
          </TabsContent>

          {/* Transparency Tab */}
          <TabsContent value="transparency" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Transparency Report
              </h2>
              <p className="text-xl text-gray-300">
                Publicly verifiable reward distribution and system statistics
              </p>
            </motion.div>

            {/* Transparency Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Reward Distribution Stats */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-6 h-6 mr-2 text-green-400" />
                    Reward Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total AVAX Distributed</span>
                      <span className="font-semibold text-green-400">125.7 AVAX</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total RUSH Distributed</span>
                      <span className="font-semibold text-blue-400">1,250,000 RUSH</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average per Player</span>
                      <span className="font-semibold text-purple-400">0.044 AVAX</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Players</span>
                      <span className="font-semibold text-orange-400">2,847</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Statistics */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-6 h-6 mr-2 text-blue-400" />
                    System Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>NFTs Minted</span>
                      <span className="font-semibold text-purple-400">156</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Raffles Completed</span>
                      <span className="font-semibold text-pink-400">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Tickets Distributed</span>
                      <span className="font-semibold text-yellow-400">8,934</span>
                    </div>
                    <div className="flex justify-between">
                      <span>System Uptime</span>
                      <span className="font-semibold text-green-400">99.9%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Verification Methods */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-6 h-6 mr-2 text-green-400" />
                    Verification Methods
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm">All transactions verified on-chain</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm">Chainlink VRF for random number generation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm">Open source smart contracts</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm">Public reward distribution logs</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-6 h-6 mr-2 text-orange-400" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Last Reward Distribution</span>
                      <span className="text-gray-400">2 minutes ago</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Last NFT Evolution</span>
                      <span className="text-gray-400">15 minutes ago</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Last Raffle Winner</span>
                      <span className="text-gray-400">3 days ago</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>System Health Check</span>
                      <span className="text-green-400">Healthy</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedRewardsPage;
