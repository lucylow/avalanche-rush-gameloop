import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSmartContracts } from '../../hooks/useSmartContracts';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { X, CheckCircle, Clock, Star, Trophy } from 'lucide-react';

interface QuestSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Quest {
  id: number;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  difficulty: 'easy' | 'medium' | 'hard';
  reward: number;
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
  isActive: boolean;
  expiresAt?: number;
}

const QuestSystem: React.FC<QuestSystemProps> = ({ isOpen, onClose }) => {
  const { isConnected, account, completeQuest } = useSmartContracts();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock quests for now
  useEffect(() => {
    if (isOpen) {
      setQuests([
        {
          id: 1,
          title: 'First Steps',
          description: 'Complete your first game session',
          type: 'daily',
          difficulty: 'easy',
          reward: 100,
          progress: 0,
          maxProgress: 1,
          isCompleted: false,
          isActive: true
        },
        {
          id: 2,
          title: 'Score Master',
          description: 'Achieve a score of 1000 points',
          type: 'daily',
          difficulty: 'medium',
          reward: 250,
          progress: 0,
          maxProgress: 1000,
          isCompleted: false,
          isActive: true
        },
        {
          id: 3,
          title: 'Chain Explorer',
          description: 'Connect to Avalanche Fuji Testnet',
          type: 'special',
          difficulty: 'easy',
          reward: 500,
          progress: isConnected ? 1 : 0,
          maxProgress: 1,
          isCompleted: isConnected,
          isActive: true
        }
      ]);
    }
  }, [isOpen, isConnected]);

  const handleCompleteQuest = async (questId: number) => {
    if (!isConnected) return;
    
    setIsLoading(true);
    try {
      await completeQuest(questId);
      setQuests(prev => prev.map(quest => 
        quest.id === questId 
          ? { ...quest, isCompleted: true, progress: quest.maxProgress }
          : quest
      ));
    } catch (error) {
      console.error('Failed to complete quest:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'daily': return '📅';
      case 'weekly': return '📊';
      case 'special': return '⭐';
      default: return '🎯';
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
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-4xl w-full mx-4 shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-black text-white mb-2">Quest System</h2>
              <p className="text-white/70 text-lg">Complete quests to earn rewards and level up</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quests.map((quest) => (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: quest.id * 0.1 }}
              >
                <Card className={`h-full transition-all duration-300 ${
                  quest.isCompleted 
                    ? 'bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/30' 
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getTypeIcon(quest.type)}</span>
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
                    <div className="flex items-center justify-between text-white">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm">
                        {quest.progress}/{quest.maxProgress}
                      </span>
                    </div>
                    
                    <Progress 
                      value={(quest.progress / quest.maxProgress) * 100} 
                      className="h-2"
                    />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-yellow-400">
                        <Star className="w-4 h-4" />
                        <span className="font-bold">{quest.reward} RUSH</span>
                      </div>
                      
                      {quest.isCompleted ? (
                        <div className="flex items-center space-x-2 text-green-400">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">Completed</span>
                        </div>
                      ) : quest.progress >= quest.maxProgress ? (
                        <Button
                          onClick={() => handleCompleteQuest(quest.id)}
                          disabled={isLoading || !isConnected}
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                          size="sm"
                        >
                          {isLoading ? 'Completing...' : 'Complete'}
                        </Button>
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">In Progress</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {!isConnected && (
            <div className="mt-8 text-center">
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-6">
                <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Connect Wallet Required</h3>
                <p className="text-white/70 mb-4">
                  Connect your wallet to start completing quests and earning rewards
                </p>
                <Button
                  onClick={onClose}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                >
                  Connect Wallet First
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuestSystem;