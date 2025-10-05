import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Activity, 
  Zap, 
  Target,
  Brain,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from 'lucide-react';

interface PlayerMetrics {
  totalPlayTime: number;
  averageSessionLength: number;
  totalTransactions: number;
  averageScore: number;
  retentionDays: number;
  engagementScore: number;
  churnRisk: number;
}

interface GameMetrics {
  totalPlayers: number;
  activePlayersToday: number;
  totalTransactions: number;
  averageGasUsed: number;
  totalRewardsDistributed: number;
  averageSessionLength: number;
  playerRetentionRate: number;
  revenuePerPlayer: number;
}

interface OptimizationData {
  optimalRewardRate: number;
  optimalDifficulty: number;
  recommendedChains: number[];
  predictedPlayerGrowth: number;
  gasOptimizationScore: number;
}

interface ABTest {
  id: number;
  testName: string;
  variantA: number;
  variantB: number;
  startTime: number;
  endTime: number;
  isActive: boolean;
  participantsA: number;
  participantsB: number;
  successRateA: number;
  successRateB: number;
  winningVariant: number;
}

const ReactiveAnalyticsDashboard: React.FC = () => {
  const [playerMetrics, setPlayerMetrics] = useState<PlayerMetrics | null>(null);
  const [gameMetrics, setGameMetrics] = useState<GameMetrics | null>(null);
  const [optimizationData, setOptimizationData] = useState<OptimizationData | null>(null);
  const [abTests, setABTests] = useState<ABTest[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for demonstration
  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setPlayerMetrics({
        totalPlayTime: Math.floor(Math.random() * 10000) + 5000,
        averageSessionLength: Math.floor(Math.random() * 1800) + 900,
        totalTransactions: Math.floor(Math.random() * 1000) + 500,
        averageScore: Math.floor(Math.random() * 50000) + 25000,
        retentionDays: Math.floor(Math.random() * 30) + 1,
        engagementScore: Math.floor(Math.random() * 100) + 50,
        churnRisk: Math.floor(Math.random() * 100)
      });

      setGameMetrics({
        totalPlayers: Math.floor(Math.random() * 10000) + 5000,
        activePlayersToday: Math.floor(Math.random() * 1000) + 500,
        totalTransactions: Math.floor(Math.random() * 100000) + 50000,
        averageGasUsed: Math.floor(Math.random() * 50) + 25,
        totalRewardsDistributed: Math.floor(Math.random() * 1000000) + 500000,
        averageSessionLength: Math.floor(Math.random() * 1800) + 900,
        playerRetentionRate: Math.floor(Math.random() * 30) + 70,
        revenuePerPlayer: Math.floor(Math.random() * 200) + 100
      });

      setOptimizationData({
        optimalRewardRate: Math.floor(Math.random() * 1000) + 500,
        optimalDifficulty: Math.floor(Math.random() * 5) + 1,
        recommendedChains: [1, 43114, 137, 56],
        predictedPlayerGrowth: Math.floor(Math.random() * 50) + 10,
        gasOptimizationScore: Math.floor(Math.random() * 30) + 70
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Chart data
  const chainDistributionData = [
    { name: 'Ethereum', value: 35, color: '#627EEA' },
    { name: 'Avalanche', value: 30, color: '#E84142' },
    { name: 'Polygon', value: 20, color: '#8247E5' },
    { name: 'BSC', value: 15, color: '#F3BA2F' }
  ];

  const playerGrowthData = [
    { month: 'Jan', players: 1000, growth: 10 },
    { month: 'Feb', players: 1200, growth: 20 },
    { month: 'Mar', players: 1500, growth: 25 },
    { month: 'Apr', players: 1800, growth: 20 },
    { month: 'May', players: 2200, growth: 22 },
    { month: 'Jun', players: 2700, growth: 23 }
  ];

  const gasUsageData = [
    { chain: 'Ethereum', gas: 45, optimal: 30 },
    { chain: 'Avalanche', gas: 25, optimal: 25 },
    { chain: 'Polygon', gas: 20, optimal: 20 },
    { chain: 'BSC', gas: 15, optimal: 15 }
  ];

  const engagementData = [
    { day: 'Mon', engagement: 75, churn: 25 },
    { day: 'Tue', engagement: 80, churn: 20 },
    { day: 'Wed', engagement: 85, churn: 15 },
    { day: 'Thu', engagement: 90, churn: 10 },
    { day: 'Fri', engagement: 95, churn: 5 },
    { day: 'Sat', engagement: 88, churn: 12 },
    { day: 'Sun', engagement: 82, churn: 18 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Reactive Analytics Dashboard
          </h1>
          <p className="text-gray-300">
            Real-time analytics and optimization for Avalanche Rush
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="players">Player Analytics</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
            <TabsTrigger value="ab-testing">A/B Testing</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-600 to-blue-800 border-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-100">
                    Total Players
                  </CardTitle>
                  <Users className="h-4 w-4 text-blue-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {gameMetrics?.totalPlayers.toLocaleString()}
                  </div>
                  <p className="text-xs text-blue-200">
                    +{optimizationData?.predictedPlayerGrowth}% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-600 to-green-800 border-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-100">
                    Active Today
                  </CardTitle>
                  <Activity className="h-4 w-4 text-green-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {gameMetrics?.activePlayersToday.toLocaleString()}
                  </div>
                  <p className="text-xs text-green-200">
                    {gameMetrics?.playerRetentionRate}% retention rate
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-600 to-purple-800 border-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-100">
                    Total Transactions
                  </CardTitle>
                  <Zap className="h-4 w-4 text-purple-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {gameMetrics?.totalTransactions.toLocaleString()}
                  </div>
                  <p className="text-xs text-purple-200">
                    {gameMetrics?.averageGasUsed} gwei avg gas
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-600 to-orange-800 border-orange-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-100">
                    Rewards Distributed
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-orange-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    ${(gameMetrics?.totalRewardsDistributed || 0 / 1000000).toFixed(2)}M
                  </div>
                  <p className="text-xs text-orange-200">
                    ${gameMetrics?.revenuePerPlayer} per player
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Chain Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chainDistributionData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {chainDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <LineChartIcon className="h-5 w-5" />
                    Player Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={playerGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="players" 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="players" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Player Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={engagementData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="day" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="engagement" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        name="Engagement %"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="churn" 
                        stroke="#EF4444" 
                        strokeWidth={3}
                        name="Churn Risk %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Player Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {playerMetrics && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Total Play Time</span>
                        <Badge variant="secondary">
                          {Math.floor(playerMetrics.totalPlayTime / 3600)}h
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Average Session</span>
                        <Badge variant="secondary">
                          {Math.floor(playerMetrics.averageSessionLength / 60)}m
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Engagement Score</span>
                        <Badge 
                          variant={playerMetrics.engagementScore > 80 ? "default" : "destructive"}
                        >
                          {playerMetrics.engagementScore}%
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Churn Risk</span>
                        <Badge 
                          variant={playerMetrics.churnRisk < 30 ? "default" : "destructive"}
                        >
                          {playerMetrics.churnRisk}%
                        </Badge>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="optimization" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Gas Optimization</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={gasUsageData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="chain" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }} 
                      />
                      <Bar dataKey="gas" fill="#EF4444" name="Current Gas" />
                      <Bar dataKey="optimal" fill="#10B981" name="Optimal Gas" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Optimization Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {optimizationData && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Optimal Reward Rate</span>
                        <Badge variant="secondary">
                          {optimizationData.optimalRewardRate} tokens
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Optimal Difficulty</span>
                        <Badge variant="secondary">
                          {optimizationData.optimalDifficulty}/5
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Gas Optimization Score</span>
                        <Badge 
                          variant={optimizationData.gasOptimizationScore > 80 ? "default" : "destructive"}
                        >
                          {optimizationData.gasOptimizationScore}%
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Predicted Growth</span>
                        <Badge variant="default">
                          +{optimizationData.predictedPlayerGrowth}%
                        </Badge>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ab-testing" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">A/B Testing Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-slate-700 border-slate-600">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-white mb-2">Reward Rate Test</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-300">Variant A</span>
                            <span className="text-green-400">65% success</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Variant B</span>
                            <span className="text-blue-400">72% success</span>
                          </div>
                          <Badge variant="default" className="w-full justify-center">
                            B is winning
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-700 border-slate-600">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-white mb-2">Difficulty Test</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-300">Variant A</span>
                            <span className="text-green-400">58% success</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Variant B</span>
                            <span className="text-blue-400">61% success</span>
                          </div>
                          <Badge variant="default" className="w-full justify-center">
                            B is winning
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-700 border-slate-600">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-white mb-2">UI Layout Test</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-300">Variant A</span>
                            <span className="text-green-400">78% success</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Variant B</span>
                            <span className="text-blue-400">71% success</span>
                          </div>
                          <Badge variant="default" className="w-full justify-center">
                            A is winning
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Predictive Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                    <h4 className="font-semibold text-blue-300 mb-2">High Churn Risk Detected</h4>
                    <p className="text-sm text-gray-300">
                      15% of players show signs of churn risk. Recommend retention campaigns.
                    </p>
                    <Badge variant="secondary" className="mt-2">85% confidence</Badge>
                  </div>
                  
                  <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <h4 className="font-semibold text-green-300 mb-2">Optimal Play Time</h4>
                    <p className="text-sm text-gray-300">
                      Players are most engaged between 7-9 PM. Schedule events accordingly.
                    </p>
                    <Badge variant="secondary" className="mt-2">92% confidence</Badge>
                  </div>
                  
                  <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                    <h4 className="font-semibold text-purple-300 mb-2">Chain Migration</h4>
                    <p className="text-sm text-gray-300">
                      Players are migrating to Avalanche for lower gas costs.
                    </p>
                    <Badge variant="secondary" className="mt-2">78% confidence</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Optimization Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-white">Increase Reward Rate</h4>
                        <p className="text-sm text-gray-300">Boost player retention</p>
                      </div>
                      <Button size="sm">Apply</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-white">Optimize Gas Limits</h4>
                        <p className="text-sm text-gray-300">Reduce transaction costs</p>
                      </div>
                      <Button size="sm">Apply</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-white">Adjust Difficulty</h4>
                        <p className="text-sm text-gray-300">Improve player experience</p>
                      </div>
                      <Button size="sm">Apply</Button>
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

export default ReactiveAnalyticsDashboard;
