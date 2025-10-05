import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { X, Zap, Coins, Trophy, Star, Clock, CheckCircle } from 'lucide-react';

interface AutomatedReward {
  id: string;
  type: 'tournament' | 'referral' | 'milestone' | 'sponsored' | 'quest';
  title: string;
  description: string;
  amount: number;
  token: string;
  recipient: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: number;
  processedAt?: number;
  transactionHash?: string;
  gasUsed?: number;
  gasPrice?: number;
  totalCost?: number;
}

interface RewardBatch {
  id: string;
  rewards: AutomatedReward[];
  totalAmount: number;
  totalGasCost: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: number;
  processedAt?: number;
  transactionHash?: string;
}

interface AutomatedRewardSystemProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardProcessed: (rewardId: string, transactionHash: string) => void;
}

const AutomatedRewardSystem: React.FC<AutomatedRewardSystemProps> = ({
  isOpen,
  onClose,
  onRewardProcessed
}) => {
  const [rewards, setRewards] = useState<AutomatedReward[]>([]);
  const [batches, setBatches] = useState<RewardBatch[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<RewardBatch | null>(null);
  const [stats, setStats] = useState({
    totalRewards: 0,
    totalAmount: 0,
    totalGasSaved: 0,
    averageGasPerReward: 0,
    successRate: 0
  });

  // Mock data
  useEffect(() => {
    if (isOpen) {
      const mockRewards: AutomatedReward[] = [
        {
          id: 'reward-1',
          type: 'tournament',
          title: 'Weekly Tournament Winner',
          description: 'First place in Avalanche Rush Weekly Tournament',
          amount: 1000,
          token: 'RUSH',
          recipient: '0x1234...5678',
          status: 'completed',
          createdAt: Date.now() - 3600000,
          processedAt: Date.now() - 3500000,
          transactionHash: '0xabcd...efgh',
          gasUsed: 21000,
          gasPrice: 0.000000025,
          totalCost: 0.000525
        },
        {
          id: 'reward-2',
          type: 'referral',
          title: 'Referral Bonus',
          description: 'Bonus for referring a new player',
          amount: 100,
          token: 'RUSH',
          recipient: '0x2345...6789',
          status: 'completed',
          createdAt: Date.now() - 7200000,
          processedAt: Date.now() - 7100000,
          transactionHash: '0xbcde...fghi',
          gasUsed: 21000,
          gasPrice: 0.000000025,
          totalCost: 0.000525
        },
        {
          id: 'reward-3',
          type: 'milestone',
          title: 'Level 10 Milestone',
          description: 'Achievement reward for reaching level 10',
          amount: 500,
          token: 'RUSH',
          recipient: '0x3456...7890',
          status: 'processing',
          createdAt: Date.now() - 1800000
        },
        {
          id: 'reward-4',
          type: 'sponsored',
          title: 'DeFi Protocol Quest',
          description: 'Sponsored quest completion reward',
          amount: 250,
          token: 'RUSH',
          recipient: '0x4567...8901',
          status: 'pending',
          createdAt: Date.now() - 900000
        },
        {
          id: 'reward-5',
          type: 'quest',
          title: 'Cross-Chain Quest',
          description: 'Completed multi-chain quest objective',
          amount: 750,
          token: 'RUSH',
          recipient: '0x5678...9012',
          status: 'pending',
          createdAt: Date.now() - 600000
        }
      ];

      const mockBatches: RewardBatch[] = [
        {
          id: 'batch-1',
          rewards: mockRewards.slice(0, 2),
          totalAmount: 1100,
          totalGasCost: 0.00105,
          status: 'completed',
          createdAt: Date.now() - 3600000,
          processedAt: Date.now() - 3500000,
          transactionHash: '0xabcd...efgh'
        },
        {
          id: 'batch-2',
          rewards: mockRewards.slice(2),
          totalAmount: 1500,
          totalGasCost: 0.000525,
          status: 'processing',
          createdAt: Date.now() - 1800000
        }
      ];

      setRewards(mockRewards);
      setBatches(mockBatches);

      // Calculate stats
      const totalRewards = mockRewards.length;
      const totalAmount = mockRewards.reduce((sum, reward) => sum + reward.amount, 0);
      const completedRewards = mockRewards.filter(r => r.status === 'completed');
      const totalGasSaved = completedRewards.reduce((sum, reward) => sum + (reward.totalCost || 0), 0);
      const averageGasPerReward = totalGasSaved / completedRewards.length;
      const successRate = (completedRewards.length / totalRewards) * 100;

      setStats({
        totalRewards,
        totalAmount,
        totalGasSaved,
        averageGasPerReward,
        successRate
      });
    }
  }, [isOpen]);

  const processBatch = useCallback(async (batchId: string) => {
    setIsProcessing(true);
    
    // Simulate batch processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setBatches(prev => prev.map(batch => 
      batch.id === batchId 
        ? { 
            ...batch, 
            status: 'completed' as const,
            processedAt: Date.now(),
            transactionHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 10)}`
          }
        : batch
    ));

    setRewards(prev => prev.map(reward => 
      batchId === 'batch-2' && ['reward-3', 'reward-4', 'reward-5'].includes(reward.id)
        ? { 
            ...reward, 
            status: 'completed' as const,
            processedAt: Date.now(),
            transactionHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 10)}`,
            gasUsed: 21000,
            gasPrice: 0.000000025,
            totalCost: 0.000525
          }
        : reward
    ));

    setIsProcessing(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tournament': return '🏆';
      case 'referral': return '👥';
      case 'milestone': return '🎯';
      case 'sponsored': return '💰';
      case 'quest': return '⚔️';
      default: return '🎁';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-7xl w-full mx-4 shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-black text-white mb-2">Automated Reward System</h2>
              <p className="text-white/70 text-lg">Reactive Smart Contracts for efficient reward distribution</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Stats Overview */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-white text-xl flex items-center space-x-2">
                    <Zap className="w-6 h-6 text-green-400" />
                    <span>System Stats</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white/70 text-sm">Total Rewards</div>
                      <div className="text-white font-bold text-lg">{stats.totalRewards}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white/70 text-sm">Total Amount</div>
                      <div className="text-white font-bold text-lg">{stats.totalAmount.toLocaleString()}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white/70 text-sm">Gas Saved</div>
                      <div className="text-white font-bold text-lg">{stats.totalGasSaved.toFixed(4)} AVAX</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white/70 text-sm">Success Rate</div>
                      <div className="text-white font-bold text-lg">{stats.successRate.toFixed(1)}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Batches */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Recent Batches</h3>
                <div className="space-y-3">
                  {batches.map((batch) => (
                    <motion.div
                      key={batch.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/5 rounded-lg p-4 cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => setSelectedBatch(batch)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-white font-medium">Batch {batch.id}</div>
                        <Badge className={getStatusColor(batch.status)}>
                          {batch.status}
                        </Badge>
                      </div>
                      <div className="text-white/60 text-sm">
                        {batch.rewards.length} rewards • {batch.totalAmount} RUSH
                      </div>
                      <div className="text-white/60 text-xs">
                        Gas: {batch.totalGasCost.toFixed(4)} AVAX
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Batch Details */}
            <div>
              {selectedBatch ? (
                <Card className="bg-white/5 border-white/10 h-full">
                  <CardHeader>
                    <CardTitle className="text-white text-xl">Batch {selectedBatch.id}</CardTitle>
                    <CardDescription className="text-white/70">
                      {selectedBatch.rewards.length} rewards • {selectedBatch.totalAmount} RUSH
                    </CardDescription>
                    <div className="flex space-x-2">
                      <Badge className={getStatusColor(selectedBatch.status)}>
                        {selectedBatch.status}
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800">
                        {selectedBatch.totalGasCost.toFixed(4)} AVAX
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Batch Actions */}
                    {selectedBatch.status === 'pending' && (
                      <Button
                        onClick={() => processBatch(selectedBatch.id)}
                        disabled={isProcessing}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                      >
                        {isProcessing ? 'Processing...' : 'Process Batch'}
                      </Button>
                    )}

                    {/* Transaction Info */}
                    {selectedBatch.transactionHash && (
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="text-white/70 text-sm mb-2">Transaction Hash</div>
                        <div className="text-white text-xs font-mono break-all">
                          {selectedBatch.transactionHash}
                        </div>
                      </div>
                    )}

                    {/* Rewards in Batch */}
                    <div>
                      <h4 className="text-white font-semibold mb-3">Rewards in Batch</h4>
                      <div className="space-y-3">
                        {selectedBatch.rewards.map((reward) => (
                          <div key={reward.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                            <span className="text-2xl">{getTypeIcon(reward.type)}</span>
                            <div className="flex-1">
                              <div className="text-white font-medium text-sm">{reward.title}</div>
                              <div className="text-white/60 text-xs">{reward.amount} {reward.token}</div>
                            </div>
                            <Badge className={getStatusColor(reward.status)}>
                              {reward.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white/5 border-white/10 h-full flex items-center justify-center">
                  <div className="text-center text-white/60">
                    <Zap className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Select a batch to view details</p>
                  </div>
                </Card>
              )}
            </div>

            {/* Individual Rewards */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Individual Rewards</h3>
              <div className="space-y-3">
                {rewards.map((reward) => (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/5 rounded-lg p-4"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">{getTypeIcon(reward.type)}</span>
                      <div className="flex-1">
                        <div className="text-white font-medium text-sm">{reward.title}</div>
                        <div className="text-white/60 text-xs">{reward.description}</div>
                      </div>
                      <Badge className={getStatusColor(reward.status)}>
                        {reward.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-white/60 text-xs">
                      <span>{reward.amount} {reward.token}</span>
                      <span>{reward.recipient}</span>
                    </div>

                    {reward.transactionHash && (
                      <div className="mt-2 text-white/60 text-xs font-mono break-all">
                        TX: {reward.transactionHash}
                      </div>
                    )}

                    {reward.totalCost && (
                      <div className="mt-1 text-white/60 text-xs">
                        Gas: {reward.totalCost.toFixed(6)} AVAX
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* RSC Benefits */}
          <div className="mt-8">
            <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center space-x-2">
                  <Star className="w-6 h-6 text-blue-400" />
                  <span>Reactive Smart Contract Benefits</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl mb-2">⚡</div>
                    <div className="text-white font-semibold">Automated</div>
                    <div className="text-white/60 text-sm">No manual intervention required</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">💰</div>
                    <div className="text-white font-semibold">Gas Efficient</div>
                    <div className="text-white/60 text-sm">Batch processing saves costs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">🔒</div>
                    <div className="text-white font-semibold">Trustless</div>
                    <div className="text-white/60 text-sm">Transparent and verifiable</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">📊</div>
                    <div className="text-white font-semibold">Real-time</div>
                    <div className="text-white/60 text-sm">Instant processing and updates</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AutomatedRewardSystem;
