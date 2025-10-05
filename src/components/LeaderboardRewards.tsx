import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Gift, 
  Star, 
  Coins,
  Zap,
  Target,
  Calendar,
  Clock,
  Award,
  Sparkles,
  TrendingUp,
  Users
} from 'lucide-react';

interface RewardTier {
  rank: string;
  rushTokens: number;
  nftReward?: string;
  title?: string;
  color: string;
  icon: React.ReactNode;
  specialReward?: string;
  probability?: number; // For rare rewards
}

interface SeasonRewards {
  season: string;
  endDate: number;
  currentParticipants: number;
  totalPrizePool: number;
  tiers: RewardTier[];
}

const LeaderboardRewards: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'season'>('weekly');

  const rewardData = {
    daily: {
      season: 'Daily Challenge',
      endDate: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      currentParticipants: 1247,
      totalPrizePool: 5000,
      tiers: [
        {
          rank: '1st',
          rushTokens: 1000,
          nftReward: 'Golden Daily Champion',
          title: 'Daily Dominator',
          color: 'from-yellow-400 to-yellow-600',
          icon: <Crown className="w-6 h-6" />,
          specialReward: 'Exclusive daily winner avatar frame'
        },
        {
          rank: '2nd-3rd',
          rushTokens: 500,
          nftReward: 'Silver Daily Achiever',
          color: 'from-gray-400 to-gray-600',
          icon: <Medal className="w-6 h-6" />
        },
        {
          rank: '4th-10th',
          rushTokens: 200,
          color: 'from-orange-400 to-orange-600',
          icon: <Trophy className="w-6 h-6" />
        },
        {
          rank: '11th-25th',
          rushTokens: 100,
          color: 'from-blue-400 to-blue-600',
          icon: <Award className="w-6 h-6" />
        },
        {
          rank: '26th-50th',
          rushTokens: 50,
          color: 'from-green-400 to-green-600',
          icon: <Star className="w-6 h-6" />
        }
      ]
    },
    weekly: {
      season: 'Weekly Championship',
      endDate: Date.now() + (5 * 24 * 60 * 60 * 1000), // 5 days
      currentParticipants: 8934,
      totalPrizePool: 50000,
      tiers: [
        {
          rank: '1st',
          rushTokens: 10000,
          nftReward: 'Legendary Weekly Champion',
          title: 'Weekly Legend',
          color: 'from-yellow-400 to-yellow-600',
          icon: <Crown className="w-6 h-6" />,
          specialReward: 'Custom winner banner for profile',
          probability: 0.01 // 1% chance for ultra-rare NFT
        },
        {
          rank: '2nd-3rd',
          rushTokens: 5000,
          nftReward: 'Epic Weekly Achiever',
          title: 'Weekly Elite',
          color: 'from-gray-400 to-gray-600',
          icon: <Medal className="w-6 h-6" />
        },
        {
          rank: '4th-10th',
          rushTokens: 2500,
          nftReward: 'Rare Weekly Competitor',
          color: 'from-orange-400 to-orange-600',
          icon: <Trophy className="w-6 h-6" />
        },
        {
          rank: '11th-25th',
          rushTokens: 1000,
          color: 'from-blue-400 to-blue-600',
          icon: <Award className="w-6 h-6" />
        },
        {
          rank: '26th-100th',
          rushTokens: 500,
          color: 'from-green-400 to-green-600',
          icon: <Star className="w-6 h-6" />
        }
      ]
    },
    monthly: {
      season: 'Monthly Grand Prix',
      endDate: Date.now() + (20 * 24 * 60 * 60 * 1000), // 20 days
      currentParticipants: 24567,
      totalPrizePool: 200000,
      tiers: [
        {
          rank: '1st',
          rushTokens: 50000,
          nftReward: 'Mythic Monthly Master',
          title: 'Grand Champion',
          color: 'from-yellow-400 to-yellow-600',
          icon: <Crown className="w-6 h-6" />,
          specialReward: 'Hall of Fame induction + Custom trophy',
          probability: 0.1 // 10% chance for bonus rare items
        },
        {
          rank: '2nd-5th',
          rushTokens: 20000,
          nftReward: 'Legendary Monthly Hero',
          title: 'Champion',
          color: 'from-gray-400 to-gray-600',
          icon: <Medal className="w-6 h-6" />
        },
        {
          rank: '6th-25th',
          rushTokens: 10000,
          nftReward: 'Epic Monthly Star',
          color: 'from-orange-400 to-orange-600',
          icon: <Trophy className="w-6 h-6" />
        },
        {
          rank: '26th-100th',
          rushTokens: 5000,
          nftReward: 'Rare Monthly Climber',
          color: 'from-blue-400 to-blue-600',
          icon: <Award className="w-6 h-6" />
        },
        {
          rank: '101st-500th',
          rushTokens: 2000,
          color: 'from-green-400 to-green-600',
          icon: <Star className="w-6 h-6" />
        }
      ]
    },
    season: {
      season: 'Season 1: Winter Avalanche',
      endDate: Date.now() + (75 * 24 * 60 * 60 * 1000), // 75 days
      currentParticipants: 156789,
      totalPrizePool: 1000000,
      tiers: [
        {
          rank: '1st',
          rushTokens: 250000,
          nftReward: 'Ultimate Season Champion',
          title: 'Avalanche Legend',
          color: 'from-yellow-400 to-yellow-600',
          icon: <Crown className="w-6 h-6" />,
          specialReward: 'Exclusive season skin + Lifetime VIP status',
          probability: 1 // 100% chance for ultimate reward
        },
        {
          rank: '2nd-10th',
          rushTokens: 100000,
          nftReward: 'Mythic Season Elite',
          title: 'Season Master',
          color: 'from-gray-400 to-gray-600',
          icon: <Medal className="w-6 h-6" />
        },
        {
          rank: '11th-100th',
          rushTokens: 50000,
          nftReward: 'Legendary Season Warrior',
          color: 'from-orange-400 to-orange-600',
          icon: <Trophy className="w-6 h-6" />
        },
        {
          rank: '101st-1000th',
          rushTokens: 25000,
          nftReward: 'Epic Season Competitor',
          color: 'from-blue-400 to-blue-600',
          icon: <Award className="w-6 h-6" />
        },
        {
          rank: '1001st-10000th',
          rushTokens: 10000,
          color: 'from-green-400 to-green-600',
          icon: <Star className="w-6 h-6" />
        }
      ]
    }
  };

  const currentRewards = rewardData[selectedPeriod];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatTimeRemaining = (endDate: number) => {
    const remaining = endDate - Date.now();
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center mb-4"
        >
          <Gift className="w-8 h-8 text-purple-500 mr-3" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Leaderboard Rewards
          </h1>
          <Gift className="w-8 h-8 text-purple-500 ml-3" />
        </motion.div>
        
        <p className="text-gray-600 text-lg mb-6">
          Compete for amazing rewards and exclusive NFTs! The higher you climb, the better the prizes!
        </p>

        {/* Period Selector */}
        <div className="flex justify-center space-x-2 mb-6">
          {['daily', 'weekly', 'monthly', 'season'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period as 'daily' | 'weekly' | 'monthly' | 'season')}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                selectedPeriod === period
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Current Competition Info */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 mb-8 text-white"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="flex items-center justify-center mb-2">
              <Trophy className="w-6 h-6 mr-2" />
              <h3 className="text-lg font-semibold">Competition</h3>
            </div>
            <div className="text-2xl font-bold">{currentRewards.season}</div>
          </div>
          
          <div>
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-6 h-6 mr-2" />
              <h3 className="text-lg font-semibold">Time Left</h3>
            </div>
            <div className="text-2xl font-bold">{formatTimeRemaining(currentRewards.endDate)}</div>
          </div>
          
          <div>
            <div className="flex items-center justify-center mb-2">
              <Users className="w-6 h-6 mr-2" />
              <h3 className="text-lg font-semibold">Participants</h3>
            </div>
            <div className="text-2xl font-bold">{formatNumber(currentRewards.currentParticipants)}</div>
          </div>
          
          <div>
            <div className="flex items-center justify-center mb-2">
              <Coins className="w-6 h-6 mr-2" />
              <h3 className="text-lg font-semibold">Prize Pool</h3>
            </div>
            <div className="text-2xl font-bold">{formatNumber(currentRewards.totalPrizePool)} RUSH</div>
          </div>
        </div>
      </motion.div>

      {/* Reward Tiers */}
      <div className="space-y-4">
        {currentRewards.tiers.map((tier, index) => (
          <motion.div
            key={tier.rank}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-xl shadow-lg overflow-hidden border-l-4 border-transparent ${
              index === 0 ? 'ring-2 ring-yellow-400 shadow-yellow-100' : ''
            }`}
            style={{ borderLeftColor: index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : index === 2 ? '#f97316' : '#6b7280' }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                {/* Left Side - Rank and Icon */}
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${tier.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                    {tier.icon}
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">{tier.rank}</h3>
                      {tier.title && (
                        <span className={`px-3 py-1 rounded-full text-sm font-bold text-white bg-gradient-to-r ${tier.color}`}>
                          {tier.title}
                        </span>
                      )}
                      {index === 0 && (
                        <div className="flex items-center space-x-1">
                          <Sparkles className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-yellow-600 font-medium">MOST POPULAR</span>
                        </div>
                      )}
                    </div>
                    {tier.specialReward && (
                      <div className="text-sm text-purple-600 font-medium mb-1">
                        🎁 {tier.specialReward}
                      </div>
                    )}
                    {tier.probability && tier.probability < 1 && (
                      <div className="text-sm text-orange-600 font-medium">
                        ⭐ {(tier.probability * 100).toFixed(1)}% bonus rare drop chance
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side - Rewards */}
                <div className="text-right space-y-2">
                  <div className="flex items-center justify-end space-x-2">
                    <Coins className="w-5 h-5 text-orange-500" />
                    <span className="text-2xl font-bold text-gray-900">
                      {formatNumber(tier.rushTokens)}
                    </span>
                    <span className="text-lg text-gray-600">RUSH</span>
                  </div>
                  
                  {tier.nftReward && (
                    <div className="flex items-center justify-end space-x-2">
                      <Award className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium text-purple-600">
                        {tier.nftReward} NFT
                      </span>
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-500">
                    ≈ ${(tier.rushTokens * 0.1).toFixed(0)} USD value
                  </div>
                </div>
              </div>

              {/* Progress Bar for Current Season */}
              {selectedPeriod === 'season' && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Competition Progress</span>
                    <span>{Math.round((1 - (currentRewards.endDate - Date.now()) / (75 * 24 * 60 * 60 * 1000)) * 100)}% Complete</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-gradient-to-r ${tier.color} transition-all duration-1000`}
                      style={{ 
                        width: `${Math.round((1 - (currentRewards.endDate - Date.now()) / (75 * 24 * 60 * 60 * 1000)) * 100)}%`
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Motivation Section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-6 text-white"
        >
          <div className="flex items-center mb-3">
            <TrendingUp className="w-6 h-6 mr-2" />
            <h3 className="font-bold">Climb Higher</h3>
          </div>
          <p className="text-sm opacity-90 mb-3">
            Every game counts! Each victory brings you closer to amazing rewards.
          </p>
          <div className="text-lg font-bold">
            Keep Playing & Earning!
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-6 text-white"
        >
          <div className="flex items-center mb-3">
            <Target className="w-6 h-6 mr-2" />
            <h3 className="font-bold">Consistent Play</h3>
          </div>
          <p className="text-sm opacity-90 mb-3">
            Regular gameplay increases your chances of maintaining high rankings.
          </p>
          <div className="text-lg font-bold">
            Daily Rewards Available!
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white"
        >
          <div className="flex items-center mb-3">
            <Sparkles className="w-6 h-6 mr-2" />
            <h3 className="font-bold">Exclusive NFTs</h3>
          </div>
          <p className="text-sm opacity-90 mb-3">
            Win rare NFTs that can't be obtained anywhere else in the game!
          </p>
          <div className="text-lg font-bold">
            Limited Edition Rewards
          </div>
        </motion.div>
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-12 text-center bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8 border border-yellow-200"
      >
        <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to Compete for Glory?
        </h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Join thousands of players competing for amazing rewards. Every game is a chance to climb higher 
          and earn exclusive NFTs and RUSH tokens!
        </p>
        <button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold px-8 py-4 rounded-full hover:shadow-lg hover:scale-105 transition-all duration-200">
          Start Playing Now!
        </button>
      </motion.div>
    </div>
  );
};

export default LeaderboardRewards;
