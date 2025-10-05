// Analytics Dashboard for Avalanche Rush
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
  Cell,
  Area,
  AreaChart
} from 'recharts';
import {
  Activity,
  TrendingUp,
  Users,
  Zap,
  Target,
  Award,
  Clock,
  DollarSign,
  Gamepad2,
  BookOpen,
  Trophy,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from 'lucide-react';

// Analytics Data Types
interface AnalyticsData {
  totalEvents: number;
  totalGasUsed: number;
  averageGasPerEvent: number;
  eventsPerHour: number;
  userRetention: number;
  moduleCompletionRate: number;
  certificationEarned: number;
  realWorldApplications: number;
}

interface EventData {
  eventType: string;
  count: number;
  gasUsed: number;
  percentage: number;
}

interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
  averageSessionTime: number;
  averageScore: number;
}

interface LearningMetrics {
  modulesStarted: number;
  modulesCompleted: number;
  certificationsEarned: number;
  averageCompletionTime: number;
  skillProgression: number;
}

// Main Analytics Dashboard Component
export const AnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [eventData, setEventData] = useState<EventData[]>([]);
  const [userMetrics, setUserMetrics] = useState<UserMetrics | null>(null);
  const [learningMetrics, setLearningMetrics] = useState<LearningMetrics | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual data fetching
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - replace with real analytics
      setAnalyticsData({
        totalEvents: 15420,
        totalGasUsed: 2847392,
        averageGasPerEvent: 185,
        eventsPerHour: 89,
        userRetention: 78.5,
        moduleCompletionRate: 65.2,
        certificationEarned: 234,
        realWorldApplications: 45
      });

      setEventData([
        { eventType: 'COIN_COLLECTED', count: 4520, gasUsed: 836200, percentage: 29.3 },
        { eventType: 'PLAYER_JUMP', count: 3890, gasUsed: 720650, percentage: 25.2 },
        { eventType: 'MODULE_COMPLETED', count: 2340, gasUsed: 433800, percentage: 15.2 },
        { eventType: 'LEVEL_COMPLETED', count: 1890, gasUsed: 350550, percentage: 12.3 },
        { eventType: 'ACHIEVEMENT_UNLOCKED', count: 1560, gasUsed: 289320, percentage: 10.1 },
        { eventType: 'CERTIFICATION_EARNED', count: 1220, gasUsed: 226320, percentage: 7.9 }
      ]);

      setUserMetrics({
        totalUsers: 1247,
        activeUsers: 892,
        newUsers: 156,
        returningUsers: 736,
        averageSessionTime: 24.5,
        averageScore: 1847
      });

      setLearningMetrics({
        modulesStarted: 3456,
        modulesCompleted: 2253,
        certificationsEarned: 234,
        averageCompletionTime: 18.7,
        skillProgression: 78.2
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatGas = (gas: number) => {
    if (gas >= 1000000) return (gas / 1000000).toFixed(2) + 'M';
    if (gas >= 1000) return (gas / 1000).toFixed(1) + 'K';
    return gas.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-white text-xl">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              <BarChart3 className="inline-block mr-3 h-10 w-10" />
              Analytics Dashboard
            </h1>
            <p className="text-xl text-gray-300">
              Track Reactive usage, user engagement, and learning outcomes
            </p>
          </div>
          <div className="flex gap-2">
            {(['24h', '7d', '30d', '90d'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                onClick={() => setTimeRange(range)}
                className="text-white"
              >
                {range}
              </Button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Reactive Events</p>
                  <p className="text-3xl font-bold text-white">
                    {analyticsData ? formatNumber(analyticsData.totalEvents) : '0'}
                  </p>
                </div>
                <Zap className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-600 to-green-700 border-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total REACT Gas Used</p>
                  <p className="text-3xl font-bold text-white">
                    {analyticsData ? formatGas(analyticsData.totalGasUsed) : '0'}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-600 to-purple-700 border-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">User Retention</p>
                  <p className="text-3xl font-bold text-white">
                    {analyticsData ? `${analyticsData.userRetention}%` : '0%'}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-600 to-orange-700 border-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Certifications Earned</p>
                  <p className="text-3xl font-bold text-white">
                    {analyticsData ? analyticsData.certificationEarned : '0'}
                  </p>
                </div>
                <Award className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="reactive" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="reactive" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Reactive Usage
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Metrics
            </TabsTrigger>
            <TabsTrigger value="learning" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Learning Analytics
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Performance
            </TabsTrigger>
          </TabsList>

          {/* Reactive Usage Tab */}
          <TabsContent value="reactive" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Events by Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={eventData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="eventType" 
                        stroke="#9CA3AF"
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                      />
                      <Bar dataKey="count" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Gas Usage Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={eventData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ eventType, percentage }) => `${eventType}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="gasUsed"
                      >
                        {eventData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5" />
                  Events Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={[
                    { time: '00:00', events: 45, gas: 8325 },
                    { time: '04:00', events: 32, gas: 5920 },
                    { time: '08:00', events: 78, gas: 14430 },
                    { time: '12:00', events: 95, gas: 17575 },
                    { time: '16:00', events: 112, gas: 20720 },
                    { time: '20:00', events: 89, gas: 16465 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                    />
                    <Area type="monotone" dataKey="events" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Metrics Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-slate-800 border-slate-600">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Users</p>
                      <p className="text-2xl font-bold text-white">
                        {userMetrics ? formatNumber(userMetrics.totalUsers) : '0'}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-600">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Active Users</p>
                      <p className="text-2xl font-bold text-white">
                        {userMetrics ? formatNumber(userMetrics.activeUsers) : '0'}
                      </p>
                    </div>
                    <Activity className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-600">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Avg Session Time</p>
                      <p className="text-2xl font-bold text-white">
                        {userMetrics ? `${userMetrics.averageSessionTime}m` : '0m'}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-600">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Avg Score</p>
                      <p className="text-2xl font-bold text-white">
                        {userMetrics ? formatNumber(userMetrics.averageScore) : '0'}
                      </p>
                    </div>
                    <Trophy className="h-8 w-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">User Growth Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { date: 'Day 1', users: 120, active: 89 },
                    { date: 'Day 2', users: 145, active: 112 },
                    { date: 'Day 3', users: 167, active: 134 },
                    { date: 'Day 4', users: 189, active: 156 },
                    { date: 'Day 5', users: 201, active: 167 },
                    { date: 'Day 6', users: 223, active: 189 },
                    { date: 'Day 7', users: 245, active: 201 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                    />
                    <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} />
                    <Line type="monotone" dataKey="active" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Learning Analytics Tab */}
          <TabsContent value="learning" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-slate-800 border-slate-600">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Modules Started</p>
                      <p className="text-2xl font-bold text-white">
                        {learningMetrics ? formatNumber(learningMetrics.modulesStarted) : '0'}
                      </p>
                    </div>
                    <BookOpen className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-600">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Modules Completed</p>
                      <p className="text-2xl font-bold text-white">
                        {learningMetrics ? formatNumber(learningMetrics.modulesCompleted) : '0'}
                      </p>
                    </div>
                    <Target className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-600">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Avg Completion Time</p>
                      <p className="text-2xl font-bold text-white">
                        {learningMetrics ? `${learningMetrics.averageCompletionTime}m` : '0m'}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">Learning Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={[
                    { module: 'DeFi Basics', completion: 85, engagement: 92 },
                    { module: 'Subnet Creation', completion: 67, engagement: 78 },
                    { module: 'Governance', completion: 73, engagement: 85 },
                    { module: 'Smart Contracts', completion: 58, engagement: 71 },
                    { module: 'Advanced DeFi', completion: 42, engagement: 63 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="module" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                    />
                    <Area type="monotone" dataKey="completion" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="engagement" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">Gas Efficiency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Average Gas per Event</span>
                      <Badge variant="outline" className="text-green-400">
                        {analyticsData ? `${analyticsData.averageGasPerEvent} gas` : '0 gas'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Events per Hour</span>
                      <Badge variant="outline" className="text-blue-400">
                        {analyticsData ? `${analyticsData.eventsPerHour}/hr` : '0/hr'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Batch Efficiency</span>
                      <Badge variant="outline" className="text-purple-400">
                        87% Optimized
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">Real-World Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Contracts Deployed</span>
                      <Badge variant="outline" className="text-green-400">
                        {analyticsData ? analyticsData.realWorldApplications : '0'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Jobs Secured</span>
                      <Badge variant="outline" className="text-blue-400">
                        23 Users
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Community Projects</span>
                      <Badge variant="outline" className="text-purple-400">
                        12 Active
                      </Badge>
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

export default AnalyticsDashboard;
