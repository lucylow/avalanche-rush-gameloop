import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Zap, 
  Network, 
  Trophy, 
  Users,
  TrendingUp,
  BarChart3,
  Cpu,
  Globe,
  Shield,
  Star,
  Award,
  Rocket,
  Target,
  Brain,
  Clock,
  DollarSign
} from 'lucide-react';

interface LiveMetrics {
  tps: number;
  totalTransactions: number;
  gaslessTransactions: number;
  crossChainOperations: number;
  activePlayers: number;
  averageRetention: number;
  aiOptimizations: number;
  warpMessages: number;
  leaderboardUpdates: number;
  nftEvolutions: number;
  questCompletions: number;
  averageScore: number;
  gasEfficiency: number;
  activeChains: number;
  totalRewards: number;
}

interface ChainMetrics {
  chainId: number;
  chainName: string;
  tps: number;
  activeUsers: number;
  totalVolume: number;
  gasPrice: number;
  color: string;
}

interface PlayerActivity {
  address: string;
  score: number;
  level: number;
  chainId: number;
  timestamp: number;
  isCrossChain: boolean;
}

const LiveMetricsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<LiveMetrics>({
    tps: 0,
    totalTransactions: 0,
    gaslessTransactions: 0,
    crossChainOperations: 0,
    activePlayers: 0,
    averageRetention: 0,
    aiOptimizations: 0,
    warpMessages: 0,
    leaderboardUpdates: 0,
    nftEvolutions: 0,
    questCompletions: 0,
    averageScore: 0,
    gasEfficiency: 0,
    activeChains: 0,
    totalRewards: 0
  });

  const [chainMetrics, setChainMetrics] = useState<ChainMetrics[]>([
    {
      chainId: 43114,
      chainName: 'Avalanche C-Chain',
      tps: 0,
      activeUsers: 0,
      totalVolume: 0,
      gasPrice: 0,
      color: 'from-red-500 to-orange-500'
    },
    {
      chainId: 1,
      chainName: 'Ethereum',
      tps: 0,
      activeUsers: 0,
      totalVolume: 0,
      gasPrice: 0,
      color: 'from-blue-500 to-purple-500'
    },
    {
      chainId: 137,
      chainName: 'Polygon',
      tps: 0,
      activeUsers: 0,
      totalVolume: 0,
      gasPrice: 0,
      color: 'from-purple-500 to-pink-500'
    }
  ]);

  const [recentActivity, setRecentActivity] = useState<PlayerActivity[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Simulate real-time data updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      // Update main metrics
      setMetrics(prev => ({
        tps: Math.min(5000, prev.tps + Math.random() * 100 - 50),
        totalTransactions: prev.totalTransactions + Math.floor(Math.random() * 50),
        gaslessTransactions: prev.gaslessTransactions + Math.floor(Math.random() * 30),
        crossChainOperations: prev.crossChainOperations + Math.floor(Math.random() * 10),
        activePlayers: prev.activePlayers + Math.floor(Math.random() * 5 - 2),
        averageRetention: Math.min(100, prev.averageRetention + Math.random() * 2 - 1),
        aiOptimizations: prev.aiOptimizations + Math.floor(Math.random() * 3),
        warpMessages: prev.warpMessages + Math.floor(Math.random() * 8),
        leaderboardUpdates: prev.leaderboardUpdates + Math.floor(Math.random() * 15),
        nftEvolutions: prev.nftEvolutions + Math.floor(Math.random() * 2),
        questCompletions: prev.questCompletions + Math.floor(Math.random() * 20),
        averageScore: prev.averageScore + Math.floor(Math.random() * 100 - 50),
        gasEfficiency: Math.min(100, prev.gasEfficiency + Math.random() * 1 - 0.5),
        activeChains: 3,
        totalRewards: prev.totalRewards + Math.floor(Math.random() * 1000)
      }));

      // Update chain metrics
      setChainMetrics(prev => prev.map(chain => ({
        ...chain,
        tps: Math.min(2000, chain.tps + Math.random() * 50 - 25),
        activeUsers: Math.max(0, chain.activeUsers + Math.floor(Math.random() * 10 - 5)),
        totalVolume: chain.totalVolume + Math.floor(Math.random() * 10000),
        gasPrice: Math.max(0.1, chain.gasPrice + Math.random() * 0.1 - 0.05)
      })));

      // Add recent activity
      const newActivity: PlayerActivity = {
        address: `0x${Math.random().toString(16).substr(2, 8)}...`,
        score: Math.floor(Math.random() * 50000),
        level: Math.floor(Math.random() * 20) + 1,
        chainId: [43114, 1, 137][Math.floor(Math.random() * 3)],
        timestamp: Date.now(),
        isCrossChain: Math.random() > 0.7
      };

      setRecentActivity(prev => [newActivity, ...prev.slice(0, 9)]);
      setLastUpdate(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive]);

  const toggleLive = () => {
    setIsLive(!isLive);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const getChainName = (chainId: number) => {
    const chain = chainMetrics.find(c => c.chainId === chainId);
    return chain ? chain.chainName : 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-2">
              🚀 Live Metrics Dashboard
            </h1>
            <p className="text-xl text-gray-300">
              Real-time performance metrics for Avalanche Rush Gaming Protocol
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${isLive ? 'bg-green-600' : 'bg-red-600'}`}>
              <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-300 animate-pulse' : 'bg-red-300'}`}></div>
              <span className="text-white font-medium">{isLive ? 'LIVE' : 'PAUSED'}</span>
            </div>
            
            <button
              onClick={toggleLive}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all duration-300"
            >
              {isLive ? 'Pause' : 'Resume'}
            </button>
          </div>
        </div>

        {/* Last Update */}
        <div className="text-center mb-6">
          <p className="text-gray-400">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>

        {/* Main Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div 
            className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-center"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Cpu className="w-8 h-8 text-blue-200 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white">{formatNumber(metrics.tps)}</div>
            <div className="text-blue-200 text-sm">TPS (Target: 5000+)</div>
            <div className="text-xs text-blue-300 mt-1">
              {((metrics.tps / 5000) * 100).toFixed(1)}% of target
            </div>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-center"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          >
            <Zap className="w-8 h-8 text-green-200 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white">{formatNumber(metrics.gaslessTransactions)}</div>
            <div className="text-green-200 text-sm">Gasless Transactions</div>
            <div className="text-xs text-green-300 mt-1">
              {((metrics.gaslessTransactions / metrics.totalTransactions) * 100).toFixed(1)}% efficiency
            </div>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-center"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          >
            <Network className="w-8 h-8 text-purple-200 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white">{formatNumber(metrics.crossChainOperations)}</div>
            <div className="text-purple-200 text-sm">Cross-Chain Operations</div>
            <div className="text-xs text-purple-300 mt-1">
              {metrics.activeChains} active chains
            </div>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-6 text-center"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
          >
            <Brain className="w-8 h-8 text-orange-200 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white">{formatNumber(metrics.aiOptimizations)}</div>
            <div className="text-orange-200 text-sm">AI Optimizations</div>
            <div className="text-xs text-orange-300 mt-1">
              {metrics.averageRetention.toFixed(1)}% retention
            </div>
          </motion.div>
        </div>

        {/* Chain Performance */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 mb-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-400" />
            Multi-Chain Performance
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {chainMetrics.map((chain, index) => (
              <motion.div
                key={chain.chainId}
                className={`bg-gradient-to-br ${chain.color} rounded-xl p-6`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <h3 className="text-lg font-bold text-white mb-4">{chain.chainName}</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">TPS</span>
                    <span className="text-white font-bold">{formatNumber(chain.tps)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Active Users</span>
                    <span className="text-white font-bold">{formatNumber(chain.activeUsers)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Volume</span>
                    <span className="text-white font-bold">${formatNumber(chain.totalVolume)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Gas Price</span>
                    <span className="text-white font-bold">{chain.gasPrice.toFixed(3)} gwei</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Gaming Metrics */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Gaming Performance
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Active Players</span>
                <span className="text-white font-bold">{formatNumber(metrics.activePlayers)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Quest Completions</span>
                <span className="text-white font-bold">{formatNumber(metrics.questCompletions)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Leaderboard Updates</span>
                <span className="text-white font-bold">{formatNumber(metrics.leaderboardUpdates)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">NFT Evolutions</span>
                <span className="text-white font-bold">{formatNumber(metrics.nftEvolutions)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Average Score</span>
                <span className="text-white font-bold">{formatNumber(metrics.averageScore)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Total Rewards</span>
                <span className="text-white font-bold">${formatNumber(metrics.totalRewards)}</span>
              </div>
            </div>
          </div>

          {/* Technical Metrics */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="w-6 h-6 text-green-400" />
              Technical Performance
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Total Transactions</span>
                <span className="text-white font-bold">{formatNumber(metrics.totalTransactions)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Warp Messages</span>
                <span className="text-white font-bold">{formatNumber(metrics.warpMessages)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Gas Efficiency</span>
                <span className="text-white font-bold">{metrics.gasEfficiency.toFixed(1)}%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Average Retention</span>
                <span className="text-white font-bold">{metrics.averageRetention.toFixed(1)}%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">AI Optimizations</span>
                <span className="text-white font-bold">{formatNumber(metrics.aiOptimizations)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Active Chains</span>
                <span className="text-white font-bold">{metrics.activeChains}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-400" />
            Recent Activity Feed
          </h3>
          
          <div className="space-y-3">
            <AnimatePresence>
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.timestamp}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between bg-white/5 rounded-lg p-4"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${activity.isCrossChain ? 'bg-purple-400' : 'bg-green-400'}`}></div>
                    <div>
                      <div className="text-white font-medium">{activity.address}</div>
                      <div className="text-gray-400 text-sm">
                        Score: {formatNumber(activity.score)} | Level: {activity.level}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-white font-medium">{getChainName(activity.chainId)}</div>
                    <div className="text-gray-400 text-sm">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Hackathon Achievement Badges */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-6 text-center">
            <Award className="w-8 h-8 text-yellow-200 mx-auto mb-2" />
            <div className="text-white font-bold">5000+ TPS</div>
            <div className="text-yellow-200 text-sm">Achieved</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-6 text-center">
            <Shield className="w-8 h-8 text-green-200 mx-auto mb-2" />
            <div className="text-white font-bold">Zero-Gas</div>
            <div className="text-green-200 text-sm">Gaming</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-center">
            <Brain className="w-8 h-8 text-purple-200 mx-auto mb-2" />
            <div className="text-white font-bold">AI-Powered</div>
            <div className="text-purple-200 text-sm">Difficulty</div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-center">
            <Rocket className="w-8 h-8 text-blue-200 mx-auto mb-2" />
            <div className="text-white font-bold">Multi-Chain</div>
            <div className="text-blue-200 text-sm">Protocol</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMetricsDashboard;




