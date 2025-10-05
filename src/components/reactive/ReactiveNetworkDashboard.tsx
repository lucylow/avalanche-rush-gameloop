import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { X, Zap, Network, Activity, TrendingUp, Shield } from 'lucide-react';

interface ReactiveNetworkDashboardProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NetworkStats {
  totalNodes: number;
  activeNodes: number;
  transactionsPerSecond: number;
  averageLatency: number;
  networkHealth: number;
  stakedTokens: number;
  rewardsDistributed: number;
}

const ReactiveNetworkDashboard: React.FC<ReactiveNetworkDashboardProps> = ({
  isOpen = true,
  onClose
}) => {
  const [stats, setStats] = useState<NetworkStats>({
    totalNodes: 0,
    activeNodes: 0,
    transactionsPerSecond: 0,
    averageLatency: 0,
    networkHealth: 0,
    stakedTokens: 0,
    rewardsDistributed: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading network data
    const loadNetworkData = () => {
      setIsLoading(true);
      setTimeout(() => {
        setStats({
          totalNodes: 1247,
          activeNodes: 1156,
          transactionsPerSecond: 2847,
          averageLatency: 12,
          networkHealth: 98,
          stakedTokens: 2456789,
          rewardsDistributed: 123456
        });
        setIsLoading(false);
      }, 2000);
    };

    loadNetworkData();
    const interval = setInterval(loadNetworkData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getHealthColor = (health: number) => {
    if (health >= 90) return 'text-green-400';
    if (health >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getHealthBadge = (health: number) => {
    if (health >= 90) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (health >= 70) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-black text-white mb-2">Reactive Network</h1>
            <p className="text-white/70 text-lg">Real-time blockchain network monitoring</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-400 border-t-transparent mx-auto mb-6"></div>
            <p className="text-white/70 text-xl">Loading network data...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Network Health Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/30">
                <CardContent className="p-6 text-center">
                  <Network className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-white mb-2">{stats.totalNodes}</div>
                  <div className="text-white/70">Total Nodes</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/30">
                <CardContent className="p-6 text-center">
                  <Activity className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-white mb-2">{stats.activeNodes}</div>
                  <div className="text-white/70">Active Nodes</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-500/30">
                <CardContent className="p-6 text-center">
                  <Zap className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-white mb-2">{stats.transactionsPerSecond}</div>
                  <div className="text-white/70">TPS</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/20 border-orange-500/30">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-white mb-2">{stats.averageLatency}ms</div>
                  <div className="text-white/70">Avg Latency</div>
                </CardContent>
              </Card>
            </div>

            {/* Network Health Status */}
            <Card className="bg-gradient-to-br from-indigo-900/20 to-indigo-800/20 border-indigo-500/30">
              <CardHeader>
                <CardTitle className="text-white text-2xl flex items-center space-x-3">
                  <Shield className="w-8 h-8" />
                  <span>Network Health</span>
                  <Badge className={getHealthBadge(stats.networkHealth)}>
                    {stats.networkHealth}%
                  </Badge>
                </CardTitle>
                <CardDescription className="text-white/70">
                  Overall network performance and stability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={stats.networkHealth} className="h-4" />
                  <div className="flex items-center justify-between text-white">
                    <span className="font-medium">Health Score</span>
                    <span className={`font-bold ${getHealthColor(stats.networkHealth)}`}>
                      {stats.networkHealth}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Token Economics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Staked Tokens</CardTitle>
                  <CardDescription className="text-white/70">
                    Total tokens staked in the network
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-yellow-400 mb-2">
                    {stats.stakedTokens.toLocaleString()}
                  </div>
                  <div className="text-white/70">REACT Tokens</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-cyan-900/20 to-cyan-800/20 border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Rewards Distributed</CardTitle>
                  <CardDescription className="text-white/70">
                    Total rewards paid to validators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-cyan-400 mb-2">
                    {stats.rewardsDistributed.toLocaleString()}
                  </div>
                  <div className="text-white/70">REACT Tokens</div>
                </CardContent>
              </Card>
            </div>

            {/* Real-time Activity */}
            <Card className="bg-gradient-to-br from-slate-800/20 to-slate-700/20 border-slate-500/30">
              <CardHeader>
                <CardTitle className="text-white text-xl">Real-time Activity</CardTitle>
                <CardDescription className="text-white/70">
                  Live network transactions and events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: 'Transaction', details: 'Token transfer completed', time: '2s ago', status: 'success' },
                    { type: 'Staking', details: 'New validator joined network', time: '5s ago', status: 'success' },
                    { type: 'Reward', details: 'Block reward distributed', time: '8s ago', status: 'success' },
                    { type: 'Transaction', details: 'Smart contract execution', time: '12s ago', status: 'success' },
                    { type: 'Network', details: 'Node synchronization complete', time: '15s ago', status: 'success' }
                  ].map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <div>
                          <div className="text-white font-medium text-sm">{activity.type}</div>
                          <div className="text-white/60 text-xs">{activity.details}</div>
                        </div>
                      </div>
                      <div className="text-white/50 text-xs">{activity.time}</div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReactiveNetworkDashboard;