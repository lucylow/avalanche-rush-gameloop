import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { X, Zap, Coins, Clock, TrendingDown, CheckCircle, AlertCircle } from 'lucide-react';

interface GasOptimization {
  id: string;
  type: 'batching' | 'compression' | 'caching' | 'subnet' | 'lazy_loading';
  title: string;
  description: string;
  gasSaved: number;
  costReduction: number;
  isActive: boolean;
  lastUsed: number;
  usageCount: number;
}

interface BatchOperation {
  id: string;
  type: 'rewards' | 'nft_mint' | 'quest_complete' | 'achievement';
  operations: number;
  totalGasCost: number;
  individualCost: number;
  savings: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: number;
  processedAt?: number;
  transactionHash?: string;
}

interface GasOptimizationSystemProps {
  isOpen: boolean;
  onClose: () => void;
  onOptimizationApplied: (optimization: GasOptimization) => void;
}

const GasOptimizationSystem: React.FC<GasOptimizationSystemProps> = ({
  isOpen,
  onClose,
  onOptimizationApplied
}) => {
  const [optimizations, setOptimizations] = useState<GasOptimization[]>([]);
  const [batches, setBatches] = useState<BatchOperation[]>([]);
  const [stats, setStats] = useState({
    totalGasSaved: 0,
    totalCostReduction: 0,
    averageSavings: 0,
    optimizationRate: 0
  });
  const [selectedOptimization, setSelectedOptimization] = useState<GasOptimization | null>(null);

  // Mock data
  useEffect(() => {
    if (isOpen) {
      const mockOptimizations: GasOptimization[] = [
        {
          id: 'batch-rewards',
          type: 'batching',
          title: 'Reward Batching',
          description: 'Batch multiple reward distributions into single transaction',
          gasSaved: 0.0025,
          costReduction: 75,
          isActive: true,
          lastUsed: Date.now() - 1800000,
          usageCount: 45
        },
        {
          id: 'nft-compression',
          type: 'compression',
          title: 'NFT Metadata Compression',
          description: 'Store NFT metadata on IPFS, only hash on-chain',
          gasSaved: 0.0018,
          costReduction: 60,
          isActive: true,
          lastUsed: Date.now() - 3600000,
          usageCount: 23
        },
        {
          id: 'quest-caching',
          type: 'caching',
          title: 'Quest State Caching',
          description: 'Cache quest states off-chain, update on completion',
          gasSaved: 0.0012,
          costReduction: 40,
          isActive: true,
          lastUsed: Date.now() - 900000,
          usageCount: 67
        },
        {
          id: 'subnet-operations',
          type: 'subnet',
          title: 'Subnet Operations',
          description: 'Use Avalanche subnets for zero-gas gameplay operations',
          gasSaved: 0.0035,
          costReduction: 90,
          isActive: true,
          lastUsed: Date.now() - 7200000,
          usageCount: 156
        },
        {
          id: 'lazy-loading',
          type: 'lazy_loading',
          title: 'Lazy Loading',
          description: 'Defer non-critical operations until batch threshold',
          gasSaved: 0.0008,
          costReduction: 25,
          isActive: true,
          lastUsed: Date.now() - 4500000,
          usageCount: 89
        }
      ];

      const mockBatches: BatchOperation[] = [
        {
          id: 'batch-1',
          type: 'rewards',
          operations: 15,
          totalGasCost: 0.0015,
          individualCost: 0.006,
          savings: 0.0045,
          status: 'completed',
          createdAt: Date.now() - 3600000,
          processedAt: Date.now() - 3500000,
          transactionHash: '0xabcd...efgh'
        },
        {
          id: 'batch-2',
          type: 'nft_mint',
          operations: 8,
          totalGasCost: 0.0022,
          individualCost: 0.008,
          savings: 0.0058,
          status: 'completed',
          createdAt: Date.now() - 7200000,
          processedAt: Date.now() - 7100000,
          transactionHash: '0xbcde...fghi'
        },
        {
          id: 'batch-3',
          type: 'quest_complete',
          operations: 12,
          totalGasCost: 0.0018,
          individualCost: 0.0048,
          savings: 0.003,
          status: 'processing',
          createdAt: Date.now() - 1800000
        },
        {
          id: 'batch-4',
          type: 'achievement',
          operations: 6,
          totalGasCost: 0.0009,
          individualCost: 0.003,
          savings: 0.0021,
          status: 'pending',
          createdAt: Date.now() - 900000
        }
      ];

      setOptimizations(mockOptimizations);
      setBatches(mockBatches);

      // Calculate stats
      const totalGasSaved = mockOptimizations.reduce((sum, opt) => sum + opt.gasSaved, 0);
      const totalCostReduction = mockOptimizations.reduce((sum, opt) => sum + opt.costReduction, 0);
      const averageSavings = totalCostReduction / mockOptimizations.length;
      const optimizationRate = (mockOptimizations.filter(opt => opt.isActive).length / mockOptimizations.length) * 100;

      setStats({
        totalGasSaved,
        totalCostReduction,
        averageSavings,
        optimizationRate
      });
    }
  }, [isOpen]);

  const toggleOptimization = useCallback((optimizationId: string) => {
    setOptimizations(prev => prev.map(opt => 
      opt.id === optimizationId 
        ? { ...opt, isActive: !opt.isActive, lastUsed: Date.now(), usageCount: opt.usageCount + 1 }
        : opt
    ));
    
    const optimization = optimizations.find(opt => opt.id === optimizationId);
    if (optimization) {
      onOptimizationApplied(optimization);
    }
  }, [optimizations, onOptimizationApplied]);

  const processBatch = useCallback(async (batchId: string) => {
    // Simulate batch processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
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
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'batching': return '📦';
      case 'compression': return '🗜️';
      case 'caching': return '💾';
      case 'subnet': return '⛓️';
      case 'lazy_loading': return '⏳';
      default: return '⚡';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'batching': return 'from-blue-500 to-blue-600';
      case 'compression': return 'from-green-500 to-green-600';
      case 'caching': return 'from-purple-500 to-purple-600';
      case 'subnet': return 'from-orange-500 to-orange-600';
      case 'lazy_loading': return 'from-yellow-500 to-yellow-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
              <h2 className="text-4xl font-black text-white mb-2">Gas Optimization System</h2>
              <p className="text-white/70 text-lg">Advanced batching and optimization techniques</p>
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
                    <TrendingDown className="w-6 h-6 text-green-400" />
                    <span>Optimization Stats</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white/70 text-sm">Gas Saved</div>
                      <div className="text-white font-bold text-lg">{stats.totalGasSaved.toFixed(4)} AVAX</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white/70 text-sm">Cost Reduction</div>
                      <div className="text-white font-bold text-lg">{stats.totalCostReduction.toFixed(1)}%</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white/70 text-sm">Avg Savings</div>
                      <div className="text-white font-bold text-lg">{stats.averageSavings.toFixed(1)}%</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white/70 text-sm">Active Rate</div>
                      <div className="text-white font-bold text-lg">{stats.optimizationRate.toFixed(1)}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Optimization Techniques */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Optimization Techniques</h3>
                <div className="space-y-3">
                  {optimizations.map((optimization) => (
                    <motion.div
                      key={optimization.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/5 rounded-lg p-4 cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => setSelectedOptimization(optimization)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getTypeIcon(optimization.type)}</span>
                          <div>
                            <div className="text-white font-medium">{optimization.title}</div>
                            <div className="text-white/60 text-sm">{optimization.type}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={optimization.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {optimization.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-white/60 text-sm mb-2">{optimization.description}</div>
                      <div className="flex items-center justify-between text-white/60 text-xs">
                        <span>Saved: {optimization.gasSaved.toFixed(4)} AVAX</span>
                        <span>Used: {optimization.usageCount} times</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Optimization Details */}
            <div>
              {selectedOptimization ? (
                <Card className="bg-white/5 border-white/10 h-full">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{getTypeIcon(selectedOptimization.type)}</span>
                      <div>
                        <CardTitle className="text-white text-xl">{selectedOptimization.title}</CardTitle>
                        <CardDescription className="text-white/70">
                          {selectedOptimization.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Badge className={selectedOptimization.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {selectedOptimization.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800">
                        {selectedOptimization.costReduction}% reduction
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Optimization Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-white/70 text-sm">Gas Saved</div>
                        <div className="text-white font-bold text-lg">{selectedOptimization.gasSaved.toFixed(4)} AVAX</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-white/70 text-sm">Usage Count</div>
                        <div className="text-white font-bold text-lg">{selectedOptimization.usageCount}</div>
                      </div>
                    </div>

                    {/* Optimization Details */}
                    <div>
                      <h4 className="text-white font-semibold mb-3">How It Works</h4>
                      <div className="text-white/70 text-sm space-y-2">
                        {selectedOptimization.type === 'batching' && (
                          <>
                            <div>• Groups multiple operations into single transaction</div>
                            <div>• Reduces gas costs by sharing transaction overhead</div>
                            <div>• Automatically triggers when batch threshold is reached</div>
                          </>
                        )}
                        {selectedOptimization.type === 'compression' && (
                          <>
                            <div>• Stores large data on IPFS or other off-chain storage</div>
                            <div>• Only stores hash reference on-chain</div>
                            <div>• Dramatically reduces storage costs</div>
                          </>
                        )}
                        {selectedOptimization.type === 'caching' && (
                          <>
                            <div>• Caches frequently accessed data off-chain</div>
                            <div>• Updates on-chain only when necessary</div>
                            <div>• Reduces read operations and gas costs</div>
                          </>
                        )}
                        {selectedOptimization.type === 'subnet' && (
                          <>
                            <div>• Uses Avalanche subnets for zero-gas operations</div>
                            <div>• Custom VM for game-specific logic</div>
                            <div>• Only critical operations on main chain</div>
                          </>
                        )}
                        {selectedOptimization.type === 'lazy_loading' && (
                          <>
                            <div>• Defers non-critical operations</div>
                            <div>• Batches operations until threshold</div>
                            <div>• Reduces immediate gas costs</div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => toggleOptimization(selectedOptimization.id)}
                      className={`w-full bg-gradient-to-r ${getTypeColor(selectedOptimization.type)} hover:opacity-90 text-white`}
                    >
                      {selectedOptimization.isActive ? 'Disable' : 'Enable'} Optimization
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white/5 border-white/10 h-full flex items-center justify-center">
                  <div className="text-center text-white/60">
                    <Zap className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Select an optimization to view details</p>
                  </div>
                </Card>
              )}
            </div>

            {/* Batch Operations */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Batch Operations</h3>
              <div className="space-y-3">
                {batches.map((batch) => (
                  <motion.div
                    key={batch.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/5 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-white font-medium">Batch {batch.id}</div>
                      <Badge className={getStatusColor(batch.status)}>
                        {batch.status}
                      </Badge>
                    </div>
                    
                    <div className="text-white/60 text-sm mb-2">
                      {batch.operations} operations • {batch.type}
                    </div>
                    
                    <div className="flex items-center justify-between text-white/60 text-xs mb-2">
                      <span>Cost: {batch.totalGasCost.toFixed(4)} AVAX</span>
                      <span>Saved: {batch.savings.toFixed(4)} AVAX</span>
                    </div>

                    {batch.transactionHash && (
                      <div className="text-white/60 text-xs font-mono break-all">
                        TX: {batch.transactionHash}
                      </div>
                    )}

                    {batch.status === 'pending' && (
                      <Button
                        onClick={() => processBatch(batch.id)}
                        size="sm"
                        className="w-full mt-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                      >
                        Process Batch
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="mt-8">
            <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center space-x-2">
                  <Zap className="w-6 h-6 text-blue-400" />
                  <span>Gas Optimization Benefits</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl mb-2">💰</div>
                    <div className="text-white font-semibold">Cost Reduction</div>
                    <div className="text-white/60 text-sm">Up to 90% gas savings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">⚡</div>
                    <div className="text-white font-semibold">Faster Processing</div>
                    <div className="text-white/60 text-sm">Batch operations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">🔒</div>
                    <div className="text-white font-semibold">Secure</div>
                    <div className="text-white/60 text-sm">Maintains security</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">📊</div>
                    <div className="text-white font-semibold">Scalable</div>
                    <div className="text-white/60 text-sm">Handles high volume</div>
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

export default GasOptimizationSystem;
