import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { 
  Ticket, 
  Trophy, 
  Clock, 
  Users, 
  Gift,
  Star,
  Zap,
  Crown,
  Coins,
  TrendingUp,
  Award,
  Sparkles,
  Timer,
  CheckCircle,
  AlertCircle,
  Target
} from 'lucide-react';

// Contract ABIs
const RAFFLE_SYSTEM_ABI = [
  "function getRaffleStatistics() view returns (uint256,uint256,uint256,uint256)",
  "function getPlayerRewardHistory(address) view returns (uint256,uint256,uint256,uint256,uint256,uint256,uint256)",
  "function selectRaffleWinner() external",
  "function startWeeklyRaffle() external",
  "function getPlayerRaffleTickets(address) view returns (uint256)",
  "event RaffleWinnerSelected(uint256 indexed raffleId, address indexed winner, uint256 ticketCount, uint256 randomNumber)",
  "event WeeklyRaffleStarted(uint256 indexed raffleId, uint256 startTime, uint256 endTime, uint256 totalTickets)",
  "event RaffleTicketAwarded(address indexed player, uint256 ticketCount, uint256 totalTickets, uint256 raffleId)"
] as const;

const AUTOMATED_REWARD_ABI = [
  "function generateTransparencyReport() view returns (uint256,uint256,uint256,uint256,uint256,uint256)",
  "function getRaffleStatistics() view returns (uint256,uint256,uint256,uint256)",
  "function getPlayerRewardHistory(address) view returns (uint256,uint256,uint256,uint256,uint256,uint256,uint256)",
  "function selectRaffleWinner() external",
  "function startWeeklyRaffle() external"
] as const;

// Contract addresses (replace with deployed addresses)
const RAFFLE_SYSTEM_ADDRESS = "0x0000000000000000000000000000000000000000";
const AUTOMATED_REWARD_ADDRESS = "0x0000000000000000000000000000000000000000";

interface RaffleStats {
  currentRaffle: number;
  totalEntries: number;
  totalTickets: number;
  timeRemaining: number;
}

interface PlayerRewards {
  totalAvaxEarned: number;
  totalRushEarned: number;
  nftCount: number;
  raffleTickets: number;
  streakDays: number;
  totalRewardPoints: number;
  lastClaimTime: number;
}

interface TransparencyReport {
  totalRewardsDistributed: number;
  totalPlayers: number;
  averageRewardPerPlayer: number;
  weeklyPoolAmount: number;
  totalRaffleTickets: number;
  totalNFTsMinted: number;
}

interface RaffleWinner {
  raffleId: number;
  winner: string;
  ticketCount: number;
  prizeAmount: number;
  timestamp: number;
}

const RaffleSystem: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();

  const [raffleStats, setRaffleStats] = useState<RaffleStats | null>(null);
  const [playerRewards, setPlayerRewards] = useState<PlayerRewards | null>(null);
  const [transparencyReport, setTransparencyReport] = useState<TransparencyReport | null>(null);
  const [recentWinners, setRecentWinners] = useState<RaffleWinner[]>([]);
  const [isSelectingWinner, setIsSelectingWinner] = useState(false);
  const [isStartingRaffle, setIsStartingRaffle] = useState(false);

  // Mock data for demonstration
  const mockRaffleStats: RaffleStats = {
    currentRaffle: 12,
    totalEntries: 1247,
    totalTickets: 8934,
    timeRemaining: 2 * 24 * 3600 + 14 * 3600 + 23 * 60 // 2 days, 14 hours, 23 minutes
  };

  const mockPlayerRewards: PlayerRewards = {
    totalAvaxEarned: 0.045,
    totalRushEarned: 450,
    nftCount: 3,
    raffleTickets: 12,
    streakDays: 7,
    totalRewardPoints: 1250,
    lastClaimTime: Date.now() - 3600000 // 1 hour ago
  };

  const mockTransparencyReport: TransparencyReport = {
    totalRewardsDistributed: 125.7,
    totalPlayers: 2847,
    averageRewardPerPlayer: 0.044,
    weeklyPoolAmount: 2.5,
    totalRaffleTickets: 8934,
    totalNFTsMinted: 156
  };

  const mockRecentWinners: RaffleWinner[] = [
    {
      raffleId: 11,
      winner: "0x1234...5678",
      ticketCount: 45,
      prizeAmount: 0.25,
      timestamp: Date.now() - 3 * 24 * 3600000 // 3 days ago
    },
    {
      raffleId: 10,
      winner: "0x9876...5432",
      ticketCount: 32,
      prizeAmount: 0.18,
      timestamp: Date.now() - 10 * 24 * 3600000 // 10 days ago
    },
    {
      raffleId: 9,
      winner: "0x5555...7777",
      ticketCount: 67,
      prizeAmount: 0.31,
      timestamp: Date.now() - 17 * 24 * 3600000 // 17 days ago
    }
  ];

  useEffect(() => {
    if (isConnected && address) {
      loadRaffleData();
    }
  }, [isConnected, address]);

  const loadRaffleData = useCallback(async () => {
    try {
      // In a real implementation, this would fetch from smart contracts
      setRaffleStats(mockRaffleStats);
      setPlayerRewards(mockPlayerRewards);
      setTransparencyReport(mockTransparencyReport);
      setRecentWinners(mockRecentWinners);
    } catch (error) {
      console.error('Error loading raffle data:', error);
    }
  }, [address]);

  const startWeeklyRaffle = useCallback(async () => {
    // Blockchain integration disabled - using mock data
    console.log('Start weekly raffle called');
    return;
  }, []);

  const selectRaffleWinner = useCallback(async () => {
    // Blockchain integration disabled - using mock data
    console.log('Select raffle winner called');
    return;
  }, []);

  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getTimeProgress = (timeRemaining: number) => {
    const totalTime = 7 * 24 * 3600; // 7 days in seconds
    const elapsed = totalTime - timeRemaining;
    return (elapsed / totalTime) * 100;
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-gray-800 text-white border-gray-700">
          <CardContent className="p-8 text-center">
            <Ticket className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Join the Weekly Raffle</h2>
            <p className="text-gray-300 mb-6">
              Connect your wallet to participate in provably fair weekly raffles with Chainlink VRF!
            </p>
            <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-600">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Weekly Raffle System
          </h1>
          <p className="text-xl text-gray-300">
            Provably fair raffles powered by Chainlink VRF with transparent rewards
          </p>
        </motion.div>

        {/* Current Raffle Status */}
        {raffleStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Current Raffle</p>
                    <p className="text-3xl font-bold">#{raffleStats.currentRaffle}</p>
                  </div>
                  <Ticket className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Entries</p>
                    <p className="text-3xl font-bold">{raffleStats.totalEntries.toLocaleString()}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-600 to-green-700 border-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Total Tickets</p>
                    <p className="text-3xl font-bold">{raffleStats.totalTickets.toLocaleString()}</p>
                  </div>
                  <Gift className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-600 to-orange-700 border-orange-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Time Remaining</p>
                    <p className="text-2xl font-bold">{formatTime(raffleStats.timeRemaining)}</p>
                  </div>
                  <Timer className="w-8 h-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Player Stats & Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Player Rewards */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-6 h-6 mr-2 text-yellow-400" />
                  Your Rewards
                </CardTitle>
              </CardHeader>
              <CardContent>
                {playerRewards && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">AVAX Earned</span>
                      <span className="font-semibold text-green-400">{playerRewards.totalAvaxEarned} AVAX</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">RUSH Tokens</span>
                      <span className="font-semibold text-blue-400">{playerRewards.totalRushEarned.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">NFTs Owned</span>
                      <span className="font-semibold text-purple-400">{playerRewards.nftCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Raffle Tickets</span>
                      <span className="font-semibold text-orange-400">{playerRewards.raffleTickets}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Streak Days</span>
                      <span className="font-semibold text-red-400">{playerRewards.streakDays}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Points</span>
                      <span className="font-semibold text-gray-300">{playerRewards.totalRewardPoints.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Admin Controls */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Crown className="w-6 h-6 mr-2 text-yellow-400" />
                  Admin Controls
                </CardTitle>
                <CardDescription>
                  Manage raffle system (Owner only)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={startWeeklyRaffle}
                  disabled={isStartingRaffle}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                >
                  {isStartingRaffle ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      Start New Raffle
                    </>
                  )}
                </Button>

                <Button
                  onClick={selectRaffleWinner}
                  disabled={isSelectingWinner || (raffleStats?.timeRemaining || 0) > 0}
                  variant="outline"
                  className="w-full border-orange-500 text-orange-400 hover:bg-orange-600"
                >
                  {isSelectingWinner ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Selecting Winner...
                    </>
                  ) : (
                    <>
                      <Trophy className="w-4 h-4 mr-2" />
                      Select Winner
                    </>
                  )}
                </Button>

                {(raffleStats?.timeRemaining || 0) > 0 && (
                  <div className="p-3 bg-blue-900/30 rounded-lg border border-blue-500/30">
                    <p className="text-blue-200 text-sm">
                      <AlertCircle className="w-4 h-4 inline mr-1" />
                      Raffle is still active. Cannot select winner yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Raffle Progress & Winners */}
          <div className="lg:col-span-2 space-y-6">
            {/* Raffle Progress */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-6 h-6 mr-2 text-blue-400" />
                  Current Raffle Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                {raffleStats && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Time Remaining</span>
                      <span className="font-semibold">{formatTime(raffleStats.timeRemaining)}</span>
                    </div>
                    <Progress value={getTimeProgress(raffleStats.timeRemaining)} className="h-3" />
                    
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="text-center p-4 bg-gray-700 rounded-lg">
                        <div className="text-2xl font-bold text-purple-400">{raffleStats.totalEntries}</div>
                        <div className="text-sm text-gray-300">Participants</div>
                      </div>
                      <div className="text-center p-4 bg-gray-700 rounded-lg">
                        <div className="text-2xl font-bold text-green-400">{raffleStats.totalTickets}</div>
                        <div className="text-sm text-gray-300">Total Tickets</div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-lg border border-purple-500/30">
                      <h4 className="font-semibold mb-2 flex items-center">
                        <Zap className="w-4 h-4 mr-2 text-yellow-400" />
                        How to Earn Raffle Tickets
                      </h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Complete learning modules (1 ticket per 100 XP)</li>
                        <li>• Maintain learning streaks (bonus tickets)</li>
                        <li>• Participate in challenges (extra tickets)</li>
                        <li>• High performance scores (multiplier tickets)</li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Winners */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="w-6 h-6 mr-2 text-yellow-400" />
                  Recent Winners
                </CardTitle>
                <CardDescription>
                  Past raffle winners with provably random selection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentWinners.map((winner, index) => (
                    <motion.div
                      key={winner.raffleId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-black' : 'bg-gray-600'
                        }`}>
                          {index === 0 && <Crown className="w-5 h-5" />}
                          {index > 0 && winner.raffleId}
                        </div>
                        <div>
                          <p className="font-semibold">{formatAddress(winner.winner)}</p>
                          <p className="text-sm text-gray-400">Raffle #{winner.raffleId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-400">{winner.prizeAmount} AVAX</p>
                        <p className="text-sm text-gray-400">{winner.ticketCount} tickets</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Transparency Report */}
            {transparencyReport && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-6 h-6 mr-2 text-green-400" />
                    Transparency Report
                  </CardTitle>
                  <CardDescription>
                    Publicly verifiable reward distribution statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">{transparencyReport.totalRewardsDistributed}</div>
                      <div className="text-sm text-gray-300">Total AVAX Distributed</div>
                    </div>
                    <div className="text-center p-4 bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-blue-400">{transparencyReport.totalPlayers}</div>
                      <div className="text-sm text-gray-300">Total Players</div>
                    </div>
                    <div className="text-center p-4 bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-purple-400">{transparencyReport.averageRewardPerPlayer}</div>
                      <div className="text-sm text-gray-300">Avg Reward/Player</div>
                    </div>
                    <div className="text-center p-4 bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-orange-400">{transparencyReport.weeklyPoolAmount}</div>
                      <div className="text-sm text-gray-300">Weekly Pool</div>
                    </div>
                    <div className="text-center p-4 bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-400">{transparencyReport.totalNFTsMinted}</div>
                      <div className="text-sm text-gray-300">NFTs Minted</div>
                    </div>
                    <div className="text-center p-4 bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-red-400">{transparencyReport.totalRaffleTickets}</div>
                      <div className="text-sm text-gray-300">Total Tickets</div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-green-900/30 rounded-lg border border-green-500/30">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                      Provably Fair System
                    </h4>
                    <p className="text-sm text-green-200">
                      All raffle winners are selected using Chainlink VRF, ensuring provably random and fair results.
                      All transactions and rewards are transparent and verifiable on-chain.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaffleSystem;
