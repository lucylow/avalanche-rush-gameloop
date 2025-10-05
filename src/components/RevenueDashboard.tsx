import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  ShoppingCart, 
  Trophy, 
  Star,
  Calendar,
  Target,
  BarChart3,
  PieChart
} from 'lucide-react';

interface RevenueMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  subscriptionRevenue: number;
  tournamentRevenue: number;
  marketplaceRevenue: number;
  nftSalesRevenue: number;
  activeSubscribers: number;
  tournamentParticipants: number;
  nftSales: number;
  totalUsers: number;
  conversionRate: number;
  averageRevenuePerUser: number;
}

interface RevenueBreakdown {
  subscriptions: number;
  tournaments: number;
  marketplace: number;
  nftSales: number;
}

interface TimeSeriesData {
  date: string;
  revenue: number;
  users: number;
}

const RevenueDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [breakdown, setBreakdown] = useState<RevenueBreakdown | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchRevenueData();
  }, [selectedTimeRange]);

  const fetchRevenueData = async () => {
    setIsLoading(true);
    try {
      // Mock revenue data - replace with actual contract/API calls
      const mockMetrics: RevenueMetrics = {
        totalRevenue: 125000,
        monthlyRevenue: 15750,
        subscriptionRevenue: 8500,
        tournamentRevenue: 4200,
        marketplaceRevenue: 2800,
        nftSalesRevenue: 250,
        activeSubscribers: 1250,
        tournamentParticipants: 450,
        nftSales: 125,
        totalUsers: 5800,
        conversionRate: 21.5,
        averageRevenuePerUser: 21.55
      };

      const mockBreakdown: RevenueBreakdown = {
        subscriptions: 54,
        tournaments: 27,
        marketplace: 18,
        nftSales: 1
      };

      const mockTimeSeriesData: TimeSeriesData[] = [
        { date: '2024-01-01', revenue: 8500, users: 150 },
        { date: '2024-01-02', revenue: 9200, users: 175 },
        { date: '2024-01-03', revenue: 11200, users: 200 },
        { date: '2024-01-04', revenue: 10800, users: 195 },
        { date: '2024-01-05', revenue: 12500, users: 220 },
        { date: '2024-01-06', revenue: 13200, users: 240 },
        { date: '2024-01-07', revenue: 15750, users: 285 }
      ];

      setMetrics(mockMetrics);
      setBreakdown(mockBreakdown);
      setTimeSeriesData(mockTimeSeriesData);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const getGrowthRate = (current: number, previous: number) => {
    const growth = ((current - previous) / previous) * 100;
    return growth;
  };

  if (!metrics || !breakdown) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Revenue Dashboard</h1>
          <p className="text-gray-600">Track your game's financial performance and growth</p>
        </div>
        <div className="flex space-x-2">
          {['7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range as '7d' | '30d' | '90d')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedTimeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(metrics.totalRevenue)}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 text-sm font-medium">+12.5%</span>
                <span className="text-gray-500 text-sm ml-1">vs last month</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Monthly Revenue</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(metrics.monthlyRevenue)}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
                <span className="text-blue-600 text-sm font-medium">+8.2%</span>
                <span className="text-gray-500 text-sm ml-1">this month</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Subscribers</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatNumber(metrics.activeSubscribers)}
              </p>
              <div className="flex items-center mt-2">
                <Users className="w-4 h-4 text-purple-500 mr-1" />
                <span className="text-purple-600 text-sm font-medium">
                  {formatPercentage(metrics.conversionRate)}
                </span>
                <span className="text-gray-500 text-sm ml-1">conversion</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Avg Revenue/User</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(metrics.averageRevenuePerUser)}
              </p>
              <div className="flex items-center mt-2">
                <Target className="w-4 h-4 text-orange-500 mr-1" />
                <span className="text-orange-600 text-sm font-medium">+5.7%</span>
                <span className="text-gray-500 text-sm ml-1">improvement</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Revenue Breakdown</h3>
            <PieChart className="w-5 h-5 text-gray-500" />
          </div>
          
          <div className="space-y-4">
            {[
              { label: 'Subscriptions', value: breakdown.subscriptions, color: 'bg-blue-500', amount: metrics.subscriptionRevenue },
              { label: 'Tournaments', value: breakdown.tournaments, color: 'bg-green-500', amount: metrics.tournamentRevenue },
              { label: 'Marketplace', value: breakdown.marketplace, color: 'bg-purple-500', amount: metrics.marketplaceRevenue },
              { label: 'NFT Sales', value: breakdown.nftSales, color: 'bg-orange-500', amount: metrics.nftSalesRevenue }
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-gray-700 font-medium">{item.label}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-900 font-semibold">
                      {formatCurrency(item.amount)}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {item.value}%
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${item.color}`}
                    style={{ width: `${item.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Revenue Sources</h3>
            <BarChart3 className="w-5 h-5 text-gray-500" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Premium Subscriptions</div>
                  <div className="text-sm text-gray-600">{metrics.activeSubscribers} active users</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-blue-600">
                  {formatCurrency(metrics.subscriptionRevenue)}
                </div>
                <div className="text-sm text-gray-500">54% of total</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Tournament Fees</div>
                  <div className="text-sm text-gray-600">{metrics.tournamentParticipants} participants</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-600">
                  {formatCurrency(metrics.tournamentRevenue)}
                </div>
                <div className="text-sm text-gray-500">27% of total</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">NFT Marketplace</div>
                  <div className="text-sm text-gray-600">{metrics.nftSales} sales this month</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-purple-600">
                  {formatCurrency(metrics.marketplaceRevenue)}
                </div>
                <div className="text-sm text-gray-500">18% of total</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Time Series Chart Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Revenue Trend</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Last {selectedTimeRange}</span>
          </div>
        </div>
        
        {/* Simple chart representation */}
        <div className="h-64 flex items-end space-x-2 px-4">
          {timeSeriesData.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
                style={{
                  height: `${(data.revenue / Math.max(...timeSeriesData.map(d => d.revenue))) * 200}px`,
                  minHeight: '20px'
                }}
              ></div>
              <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
                {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(timeSeriesData.reduce((sum, d) => sum + d.revenue, 0))}
            </div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(timeSeriesData.reduce((sum, d) => sum + d.users, 0))}
            </div>
            <div className="text-sm text-gray-600">Total New Users</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(timeSeriesData.reduce((sum, d) => sum + d.revenue, 0) / timeSeriesData.reduce((sum, d) => sum + d.users, 0))}
            </div>
            <div className="text-sm text-gray-600">Revenue per User</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RevenueDashboard;
