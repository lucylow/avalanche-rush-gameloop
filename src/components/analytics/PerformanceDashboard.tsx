import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Zap, 
  Clock, 
  Shield,
  Globe,
  Activity,
  Database,
  Cpu,
  Wifi,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';

// Types
interface PerformanceMetrics {
  reactiveUsage: {
    dailyTransactions: number;
    gasEfficiency: number;
    crossChainOperations: number;
    automationSavings: number;
    averageLatency: number;
    successRate: number;
  };
  
  userEngagement: {
    dailyActiveUsers: number;
    sessionDuration: number;
    retentionRate: number;
    conversionRate: number;
    newUserSignups: number;
    returningUsers: number;
  };
  
  technicalPerformance: {
    transactionThroughput: number;
    averageLatency: number;
    uptime: number;
    errorRate: number;
    gasUsage: number;
    blockConfirmations: number;
  };
  
  crossChainMetrics: {
    totalChains: number;
    activeChains: number;
    crossChainTransactions: number;
    bridgeEfficiency: number;
    chainDistribution: Record<number, number>;
  };
  
  gamingMetrics: {
    activeGames: number;
    totalPlayers: number;
    averageScore: number;
    leaderboardUpdates: number;
    achievementsUnlocked: number;
  };
}

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: number;
  resolved: boolean;
}

interface ChainMetrics {
  chainId: number;
  name: string;
  status: 'healthy' | 'warning' | 'error';
  transactions: number;
  latency: number;
  gasPrice: number;
  blockHeight: number;
}

interface PerformanceDashboardProps {
  realTimeUpdates?: boolean;
  refreshInterval?: number;
  showAlerts?: boolean;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  realTimeUpdates = true,
  refreshInterval = 5000,
  showAlerts = true
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    reactiveUsage: {
      dailyTransactions: 0,
      gasEfficiency: 0,
      crossChainOperations: 0,
      automationSavings: 0,
      averageLatency: 0,
      successRate: 0
    },
    userEngagement: {
      dailyActiveUsers: 0,
      sessionDuration: 0,
      retentionRate: 0,
      conversionRate: 0,
      newUserSignups: 0,
      returningUsers: 0
    },
    technicalPerformance: {
      transactionThroughput: 0,
      averageLatency: 0,
      uptime: 0,
      errorRate: 0,
      gasUsage: 0,
      blockConfirmations: 0
    },
    crossChainMetrics: {
      totalChains: 0,
      activeChains: 0,
      crossChainTransactions: 0,
      bridgeEfficiency: 0,
      chainDistribution: {}
    },
    gamingMetrics: {
      activeGames: 0,
      totalPlayers: 0,
      averageScore: 0,
      leaderboardUpdates: 0,
      achievementsUnlocked: 0
    }
  });

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [chainMetrics, setChainMetrics] = useState<ChainMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(realTimeUpdates);

  // Simulate real-time data updates
  const updateMetrics = useCallback(() => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setMetrics({
        reactiveUsage: {
          dailyTransactions: Math.floor(Math.random() * 10000) + 5000,
          gasEfficiency: Math.random() * 20 + 80,
          crossChainOperations: Math.floor(Math.random() * 1000) + 500,
          automationSavings: Math.random() * 50 + 25,
          averageLatency: Math.random() * 100 + 50,
          successRate: Math.random() * 10 + 90
        },
        userEngagement: {
          dailyActiveUsers: Math.floor(Math.random() * 5000) + 2000,
          sessionDuration: Math.random() * 60 + 15,
          retentionRate: Math.random() * 20 + 75,
          conversionRate: Math.random() * 10 + 15,
          newUserSignups: Math.floor(Math.random() * 200) + 50,
          returningUsers: Math.floor(Math.random() * 1000) + 500
        },
        technicalPerformance: {
          transactionThroughput: Math.random() * 5000 + 1000,
          averageLatency: Math.random() * 50 + 25,
          uptime: Math.random() * 5 + 95,
          errorRate: Math.random() * 2,
          gasUsage: Math.random() * 100000 + 50000,
          blockConfirmations: Math.floor(Math.random() * 20) + 10
        },
        crossChainMetrics: {
          totalChains: 3,
          activeChains: Math.floor(Math.random() * 3) + 1,
          crossChainTransactions: Math.floor(Math.random() * 500) + 100,
          bridgeEfficiency: Math.random() * 15 + 85,
          chainDistribution: {
            43113: Math.random() * 50 + 30,
            11155111: Math.random() * 30 + 20,
            80001: Math.random() * 30 + 20
          }
        },
        gamingMetrics: {
          activeGames: Math.floor(Math.random() * 100) + 50,
          totalPlayers: Math.floor(Math.random() * 2000) + 1000,
          averageScore: Math.random() * 1000 + 500,
          leaderboardUpdates: Math.floor(Math.random() * 1000) + 500,
          achievementsUnlocked: Math.floor(Math.random() * 200) + 100
        }
      });

      // Update chain metrics
      setChainMetrics([
        {
          chainId: 43113,
          name: 'Avalanche Fuji',
          status: 'healthy',
          transactions: Math.floor(Math.random() * 1000) + 500,
          latency: Math.random() * 100 + 50,
          gasPrice: Math.random() * 50 + 25,
          blockHeight: Math.floor(Math.random() * 1000000) + 5000000
        },
        {
          chainId: 11155111,
          name: 'Ethereum Sepolia',
          status: 'healthy',
          transactions: Math.floor(Math.random() * 800) + 400,
          latency: Math.random() * 200 + 100,
          gasPrice: Math.random() * 100 + 50,
          blockHeight: Math.floor(Math.random() * 500000) + 3000000
        },
        {
          chainId: 80001,
          name: 'Polygon Mumbai',
          status: 'healthy',
          transactions: Math.floor(Math.random() * 1200) + 600,
          latency: Math.random() * 80 + 30,
          gasPrice: Math.random() * 20 + 10,
          blockHeight: Math.floor(Math.random() * 2000000) + 10000000
        }
      ]);

      setLastUpdated(new Date());
      setIsLoading(false);
    }, 1000);
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      updateMetrics();
      const interval = setInterval(updateMetrics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, updateMetrics]);

  // Initial load
  useEffect(() => {
    updateMetrics();
  }, [updateMetrics]);

  // Generate sample alerts
  useEffect(() => {
    const sampleAlerts: Alert[] = [
      {
        id: '1',
        type: 'success',
        title: 'High Performance',
        message: 'System performing above 95% efficiency',
        timestamp: Date.now() - 300000,
        resolved: false
      },
      {
        id: '2',
        type: 'warning',
        title: 'Gas Price Spike',
        message: 'Gas prices increased by 25% on Ethereum',
        timestamp: Date.now() - 600000,
        resolved: false
      },
      {
        id: '3',
        type: 'info',
        title: 'New Chain Added',
        message: 'Polygon Mumbai chain successfully integrated',
        timestamp: Date.now() - 900000,
        resolved: true
      }
    ];
    setAlerts(sampleAlerts);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toFixed(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Performance Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Real-time metrics for Avalanche Rush hackathon demonstration
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-sm text-gray-600">
                {autoRefresh ? 'Live' : 'Paused'}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={updateMetrics}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-sm text-gray-500">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>

        {/* Alerts */}
        {showAlerts && alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            {alerts.filter(alert => !alert.resolved).map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-white rounded-lg border-l-4 border-l-blue-500 shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                    <p className="text-sm text-gray-600">{alert.message}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Reactive Usage Metrics */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Zap className="h-5 w-5 text-blue-500" />
                <span>Reactive Usage</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Daily Transactions</span>
                  <span className="font-semibold">{formatNumber(metrics.reactiveUsage.dailyTransactions)}</span>
                </div>
                <Progress value={metrics.reactiveUsage.dailyTransactions / 100} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Gas Efficiency</span>
                  <span className="font-semibold">{metrics.reactiveUsage.gasEfficiency.toFixed(1)}%</span>
                </div>
                <Progress value={metrics.reactiveUsage.gasEfficiency} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="font-semibold">{formatNumber(metrics.reactiveUsage.crossChainOperations)}</div>
                  <div className="text-gray-600">Cross-Chain</div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="font-semibold">{metrics.reactiveUsage.automationSavings.toFixed(1)}%</div>
                  <div className="text-gray-600">Savings</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Engagement Metrics */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Users className="h-5 w-5 text-green-500" />
                <span>User Engagement</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Daily Active Users</span>
                  <span className="font-semibold">{formatNumber(metrics.userEngagement.dailyActiveUsers)}</span>
                </div>
                <Progress value={metrics.userEngagement.dailyActiveUsers / 50} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Retention Rate</span>
                  <span className="font-semibold">{metrics.userEngagement.retentionRate.toFixed(1)}%</span>
                </div>
                <Progress value={metrics.userEngagement.retentionRate} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="font-semibold">{metrics.userEngagement.sessionDuration.toFixed(1)}m</div>
                  <div className="text-gray-600">Avg Session</div>
                </div>
                <div className="text-center p-2 bg-purple-50 rounded">
                  <div className="font-semibold">{metrics.userEngagement.conversionRate.toFixed(1)}%</div>
                  <div className="text-gray-600">Conversion</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Performance Metrics */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Cpu className="h-5 w-5 text-purple-500" />
                <span>Technical Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Transaction Throughput</span>
                  <span className="font-semibold">{formatNumber(metrics.technicalPerformance.transactionThroughput)} TPS</span>
                </div>
                <Progress value={metrics.technicalPerformance.transactionThroughput / 50} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uptime</span>
                  <span className="font-semibold">{metrics.technicalPerformance.uptime.toFixed(2)}%</span>
                </div>
                <Progress value={metrics.technicalPerformance.uptime} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="font-semibold">{metrics.technicalPerformance.averageLatency.toFixed(1)}ms</div>
                  <div className="text-gray-600">Avg Latency</div>
                </div>
                <div className="text-center p-2 bg-red-50 rounded">
                  <div className="font-semibold">{metrics.technicalPerformance.errorRate.toFixed(2)}%</div>
                  <div className="text-gray-600">Error Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cross-Chain Metrics */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Globe className="h-5 w-5 text-orange-500" />
                <span>Cross-Chain</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Active Chains</span>
                  <span className="font-semibold">{metrics.crossChainMetrics.activeChains}/{metrics.crossChainMetrics.totalChains}</span>
                </div>
                <Progress value={(metrics.crossChainMetrics.activeChains / metrics.crossChainMetrics.totalChains) * 100} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Bridge Efficiency</span>
                  <span className="font-semibold">{metrics.crossChainMetrics.bridgeEfficiency.toFixed(1)}%</span>
                </div>
                <Progress value={metrics.crossChainMetrics.bridgeEfficiency} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center p-2 bg-orange-50 rounded">
                  <div className="font-semibold">{formatNumber(metrics.crossChainMetrics.crossChainTransactions)}</div>
                  <div className="text-gray-600">Cross-Chain Tx</div>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="font-semibold">3</div>
                  <div className="text-gray-600">Supported</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <Tabs defaultValue="chains" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chains">Chain Status</TabsTrigger>
            <TabsTrigger value="gaming">Gaming Metrics</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="chains" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {chainMetrics.map((chain) => (
                <Card key={chain.chainId} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{chain.name}</span>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(chain.status)}`} />
                        <Badge variant="secondary" className="text-xs">
                          {chain.status}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Transactions</div>
                        <div className="font-semibold">{formatNumber(chain.transactions)}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Latency</div>
                        <div className="font-semibold">{chain.latency.toFixed(1)}ms</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Gas Price</div>
                        <div className="font-semibold">{chain.gasPrice.toFixed(2)} Gwei</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Block Height</div>
                        <div className="font-semibold">{formatNumber(chain.blockHeight)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="gaming" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Active Games</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {metrics.gamingMetrics.activeGames}
                  </div>
                  <p className="text-sm text-gray-600">Currently running</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Total Players</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {formatNumber(metrics.gamingMetrics.totalPlayers)}
                  </div>
                  <p className="text-sm text-gray-600">Across all games</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Average Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {metrics.gamingMetrics.averageScore.toFixed(0)}
                  </div>
                  <p className="text-sm text-gray-600">Player performance</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>CPU Usage</span>
                    <span className="font-semibold">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span>Memory Usage</span>
                    <span className="font-semibold">62%</span>
                  </div>
                  <Progress value={62} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span>Network I/O</span>
                    <span className="font-semibold">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Blockchain Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Block Time</span>
                    <span className="font-semibold">2.1s</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Gas Limit</span>
                    <span className="font-semibold">8M</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Network Hash Rate</span>
                    <span className="font-semibold">15.2 TH/s</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <div className="space-y-4">
              {alerts.map((alert) => (
                <Card key={alert.id} className={alert.resolved ? 'opacity-60' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <h3 className="font-semibold">{alert.title}</h3>
                        <p className="text-sm text-gray-600">{alert.message}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          {new Date(alert.timestamp).toLocaleString()}
                        </div>
                        {alert.resolved && (
                          <Badge variant="secondary" className="text-xs">Resolved</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PerformanceDashboard;





