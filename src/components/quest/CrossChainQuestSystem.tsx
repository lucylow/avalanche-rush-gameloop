import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { X, Link, Zap, Mountain, Coins, Trophy, Star } from 'lucide-react';

interface CrossChainQuest {
  id: string;
  title: string;
  description: string;
  chains: string[];
  objectives: CrossChainObjective[];
  rewards: CrossChainReward[];
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  status: 'available' | 'in_progress' | 'completed' | 'locked';
  progress: number;
  maxProgress: number;
  timeLimit?: number;
  isEvolving: boolean;
  evolutionStage: number;
  maxEvolutionStage: number;
}

interface CrossChainObjective {
  id: string;
  chain: string;
  type: 'transaction' | 'defi_interaction' | 'nft_mint' | 'staking' | 'bridge' | 'swap';
  description: string;
  target: string;
  current: number;
  required: number;
  isCompleted: boolean;
  chainIcon: string;
}

interface CrossChainReward {
  type: 'nft' | 'token' | 'xp' | 'achievement' | 'evolution';
  chain: string;
  amount: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
  isClaimed: boolean;
}

interface CrossChainQuestSystemProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestComplete: (questId: string, rewards: CrossChainReward[]) => void;
}

const CrossChainQuestSystem: React.FC<CrossChainQuestSystemProps> = ({
  isOpen,
  onClose,
  onQuestComplete
}) => {
  const [quests, setQuests] = useState<CrossChainQuest[]>([]);
  const [selectedQuest, setSelectedQuest] = useState<CrossChainQuest | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock cross-chain quests
  useEffect(() => {
    if (isOpen) {
      setQuests([
        {
          id: 'avalanche-ethereum-bridge',
          title: 'Cross-Chain Explorer',
          description: 'Complete transactions on both Avalanche and Ethereum to unlock evolved NFT rewards',
          chains: ['Avalanche', 'Ethereum'],
          objectives: [
            {
              id: 'avax-transaction',
              chain: 'Avalanche',
              type: 'transaction',
              description: 'Send 0.1 AVAX to any address',
              target: '0.1 AVAX',
              current: 0,
              required: 1,
              isCompleted: false,
              chainIcon: '🏔️'
            },
            {
              id: 'eth-transaction',
              chain: 'Ethereum',
              type: 'transaction',
              description: 'Send 0.01 ETH to any address',
              target: '0.01 ETH',
              current: 0,
              required: 1,
              isCompleted: false,
              chainIcon: '🔷'
            }
          ],
          rewards: [
            {
              type: 'nft',
              chain: 'Avalanche',
              amount: 1,
              rarity: 'rare',
              description: 'Cross-Chain Explorer NFT',
              isClaimed: false
            },
            {
              type: 'evolution',
              chain: 'Avalanche',
              amount: 1,
              rarity: 'epic',
              description: 'NFT Evolution to Stage 2',
              isClaimed: false
            }
          ],
          difficulty: 'medium',
          status: 'available',
          progress: 0,
          maxProgress: 2,
          isEvolving: true,
          evolutionStage: 1,
          maxEvolutionStage: 3
        },
        {
          id: 'defi-master-multi-chain',
          title: 'DeFi Master Multi-Chain',
          description: 'Master DeFi protocols across multiple chains to earn legendary rewards',
          chains: ['Avalanche', 'Ethereum', 'Polygon'],
          objectives: [
            {
              id: 'avax-staking',
              chain: 'Avalanche',
              type: 'staking',
              description: 'Stake 10 AVAX for 7 days',
              target: '10 AVAX',
              current: 0,
              required: 10,
              isCompleted: false,
              chainIcon: '🏔️'
            },
            {
              id: 'eth-defi',
              chain: 'Ethereum',
              type: 'defi_interaction',
              description: 'Provide liquidity to Uniswap V3',
              target: '1 ETH',
              current: 0,
              required: 1,
              isCompleted: false,
              chainIcon: '🔷'
            },
            {
              id: 'polygon-swap',
              chain: 'Polygon',
              type: 'swap',
              description: 'Swap 100 MATIC to USDC',
              target: '100 MATIC',
              current: 0,
              required: 100,
              isCompleted: false,
              chainIcon: '🟣'
            }
          ],
          rewards: [
            {
              type: 'nft',
              chain: 'Avalanche',
              amount: 1,
              rarity: 'legendary',
              description: 'DeFi Master Legendary NFT',
              isClaimed: false
            },
            {
              type: 'token',
              chain: 'Avalanche',
              amount: 1000,
              rarity: 'epic',
              description: '1000 RUSH Tokens',
              isClaimed: false
            }
          ],
          difficulty: 'hard',
          status: 'locked',
          progress: 0,
          maxProgress: 3,
          isEvolving: true,
          evolutionStage: 1,
          maxEvolutionStage: 5
        },
        {
          id: 'nft-collector-evolution',
          title: 'NFT Collector Evolution',
          description: 'Mint and evolve NFTs across chains to create the ultimate collection',
          chains: ['Avalanche', 'Ethereum', 'Polygon', 'Arbitrum'],
          objectives: [
            {
              id: 'avax-nft-mint',
              chain: 'Avalanche',
              type: 'nft_mint',
              description: 'Mint 3 NFTs on Avalanche',
              target: '3 NFTs',
              current: 0,
              required: 3,
              isCompleted: false,
              chainIcon: '🏔️'
            },
            {
              id: 'eth-nft-mint',
              chain: 'Ethereum',
              type: 'nft_mint',
              description: 'Mint 2 NFTs on Ethereum',
              target: '2 NFTs',
              current: 0,
              required: 2,
              isCompleted: false,
              chainIcon: '🔷'
            },
            {
              id: 'polygon-nft-mint',
              chain: 'Polygon',
              type: 'nft_mint',
              description: 'Mint 1 NFT on Polygon',
              target: '1 NFT',
              current: 0,
              required: 1,
              isCompleted: false,
              chainIcon: '🟣'
            },
            {
              id: 'arbitrum-nft-mint',
              chain: 'Arbitrum',
              type: 'nft_mint',
              description: 'Mint 1 NFT on Arbitrum',
              target: '1 NFT',
              current: 0,
              required: 1,
              isCompleted: false,
              chainIcon: '🔵'
            }
          ],
          rewards: [
            {
              type: 'nft',
              chain: 'Avalanche',
              amount: 1,
              rarity: 'legendary',
              description: 'Ultimate Collector NFT',
              isClaimed: false
            },
            {
              type: 'evolution',
              chain: 'Avalanche',
              amount: 1,
              rarity: 'legendary',
              description: 'NFT Evolution to Final Stage',
              isClaimed: false
            }
          ],
          difficulty: 'legendary',
          status: 'locked',
          progress: 0,
          maxProgress: 7,
          isEvolving: true,
          evolutionStage: 1,
          maxEvolutionStage: 7
        }
      ]);
    }
  }, [isOpen]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-orange-100 text-orange-800';
      case 'legendary': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStartQuest = (questId: string) => {
    setQuests(prev => prev.map(quest => 
      quest.id === questId 
        ? { ...quest, status: 'in_progress' as const }
        : quest
    ));
  };

  const handleCompleteQuest = (questId: string) => {
    const quest = quests.find(q => q.id === questId);
    if (quest) {
      setQuests(prev => prev.map(q => 
        q.id === questId 
          ? { ...q, status: 'completed' as const, progress: q.maxProgress }
          : q
      ));
      onQuestComplete(questId, quest.rewards);
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
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-6xl w-full mx-4 shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-black text-white mb-2">Cross-Chain Quests</h2>
              <p className="text-white/70 text-lg">Complete objectives across multiple blockchains for evolved rewards</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quest List */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">Available Quests</h3>
              {quests.map((quest) => (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: quests.indexOf(quest) * 0.1 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all duration-300 ${
                      quest.status === 'completed' 
                        ? 'bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/30' 
                        : quest.status === 'in_progress'
                        ? 'bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/30'
                        : quest.status === 'locked'
                        ? 'bg-white/5 border-white/10 opacity-50'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                    onClick={() => setSelectedQuest(quest)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">🌐</span>
                          <CardTitle className="text-white text-lg">{quest.title}</CardTitle>
                        </div>
                        <Badge className={getDifficultyColor(quest.difficulty)}>
                          {quest.difficulty}
                        </Badge>
                      </div>
                      <CardDescription className="text-white/70">
                        {quest.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Chain Icons */}
                      <div className="flex items-center space-x-2">
                        <span className="text-white/70 text-sm">Chains:</span>
                        {quest.chains.map((chain, index) => (
                          <div key={index} className="flex items-center space-x-1">
                            <span className="text-lg">
                              {chain === 'Avalanche' ? '🏔️' : 
                               chain === 'Ethereum' ? '🔷' : 
                               chain === 'Polygon' ? '🟣' : 
                               chain === 'Arbitrum' ? '🔵' : '⛓️'}
                            </span>
                            <span className="text-white/60 text-xs">{chain}</span>
                          </div>
                        ))}
                      </div>

                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-white">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm">
                            {quest.progress}/{quest.maxProgress}
                          </span>
                        </div>
                        <Progress value={(quest.progress / quest.maxProgress) * 100} className="h-2" />
                      </div>

                      {/* Evolution Indicator */}
                      {quest.isEvolving && (
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-400 text-sm">
                            Evolution Stage {quest.evolutionStage}/{quest.maxEvolutionStage}
                          </span>
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="flex space-x-2">
                        {quest.status === 'available' && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartQuest(quest.id);
                            }}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                            size="sm"
                          >
                            Start Quest
                          </Button>
                        )}
                        {quest.status === 'in_progress' && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCompleteQuest(quest.id);
                            }}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                            size="sm"
                          >
                            Complete
                          </Button>
                        )}
                        {quest.status === 'completed' && (
                          <div className="flex items-center space-x-2 text-green-400">
                            <Trophy className="w-4 h-4" />
                            <span className="text-sm font-medium">Completed</span>
                          </div>
                        )}
                        {quest.status === 'locked' && (
                          <div className="flex items-center space-x-2 text-gray-400">
                            <span className="text-sm">Locked</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Quest Details */}
            <div>
              {selectedQuest ? (
                <Card className="bg-white/5 border-white/10 h-full">
                  <CardHeader>
                    <CardTitle className="text-white text-xl">{selectedQuest.title}</CardTitle>
                    <CardDescription className="text-white/70">
                      {selectedQuest.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Objectives */}
                    <div>
                      <h4 className="text-white font-semibold mb-3">Objectives</h4>
                      <div className="space-y-3">
                        {selectedQuest.objectives.map((objective) => (
                          <div key={objective.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                            <span className="text-2xl">{objective.chainIcon}</span>
                            <div className="flex-1">
                              <div className="text-white font-medium text-sm">{objective.description}</div>
                              <div className="text-white/60 text-xs">{objective.target}</div>
                              <Progress 
                                value={(objective.current / objective.required) * 100} 
                                className="h-1 mt-1" 
                              />
                            </div>
                            {objective.isCompleted && (
                              <div className="text-green-400">✓</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Rewards */}
                    <div>
                      <h4 className="text-white font-semibold mb-3">Rewards</h4>
                      <div className="space-y-3">
                        {selectedQuest.rewards.map((reward, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                            <div className="text-2xl">
                              {reward.type === 'nft' ? '🎨' : 
                               reward.type === 'token' ? '🪙' : 
                               reward.type === 'xp' ? '⭐' : 
                               reward.type === 'achievement' ? '🏆' : '🌟'}
                            </div>
                            <div className="flex-1">
                              <div className="text-white font-medium text-sm">{reward.description}</div>
                              <div className="text-white/60 text-xs">
                                {reward.chain} • {reward.amount} {reward.type === 'token' ? 'tokens' : reward.type}
                              </div>
                            </div>
                            <Badge className={getRarityColor(reward.rarity)}>
                              {reward.rarity}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Evolution Info */}
                    {selectedQuest.isEvolving && (
                      <div className="p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
                        <div className="flex items-center space-x-2 mb-2">
                          <Star className="w-5 h-5 text-yellow-400" />
                          <span className="text-yellow-400 font-semibold">NFT Evolution</span>
                        </div>
                        <div className="text-white/80 text-sm">
                          This quest will evolve your NFT to stage {selectedQuest.evolutionStage + 1} of {selectedQuest.maxEvolutionStage}.
                          Each evolution stage unlocks new abilities and visual changes.
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white/5 border-white/10 h-full flex items-center justify-center">
                  <div className="text-center text-white/60">
                    <Link className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Select a quest to view details</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CrossChainQuestSystem;
