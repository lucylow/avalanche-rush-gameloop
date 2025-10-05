import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSmartContracts } from '../../hooks/useSmartContracts';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { X, Trophy, Medal, Star, TrendingUp } from 'lucide-react';

interface QuestDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface QuestStats {
  totalQuests: number;
  completedQuests: number;
  activeQuests: number;
  totalRewards: number;
  streak: number;
  level: number;
}

const QuestDashboard: React.FC<QuestDashboardProps> = ({ isOpen, onClose }) => {
  const { isConnected, account } = useSmartContracts();
  const [stats, setStats] = useState<QuestStats>({
    totalQuests: 0,
    completedQuests: 0,
    activeQuests: 0,
    totalRewards: 0,
    streak: 0,
    level: 1
  });

  // Mock stats for now
  useEffect(() => {
    if (isOpen && isConnected) {
      setStats({
        totalQuests: 12,
        completedQuests: 8,
        activeQuests: 4,
        totalRewards: 2500,
        streak: 5,
        level: 3
      });
    }
  }, [isOpen, isConnected]);

  const getLevelProgress = () => {
    const currentLevelXP = (stats.level - 1) * 1000;
    const nextLevelXP = stats.level * 1000;
    const currentXP = stats.totalRewards;
    const progress = ((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    return Math.max(0, Math.min(100, progress));
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
              <h2 className="text-4xl font-black text-white mb-2">Quest Dashboard</h2>
              <p className="text-white/70 text-lg">Track your quest progress and achievements</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
          </div>

          {!isConnected ? (
            <div className="text-center py-16">
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-8">
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">Connect Wallet Required</h3>
                <p className="text-white/70 mb-6">
                  Connect your wallet to view your quest dashboard and track progress
                </p>
                <Button
                  onClick={onClose}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                >
                  Connect Wallet First
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/30">
                  <CardContent className="p-6 text-center">
                    <Trophy className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                    <div className="text-3xl font-bold text-white mb-2">{stats.completedQuests}</div>
                    <div className="text-white/70">Quests Completed</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/30">
                  <CardContent className="p-6 text-center">
                    <Star className="w-12 h-12 text-green-400 mx-auto mb-4" />
                    <div className="text-3xl font-bold text-white mb-2">{stats.totalRewards}</div>
                    <div className="text-white/70">Total RUSH Earned</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-500/30">
                  <CardContent className="p-6 text-center">
                    <Medal className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <div className="text-3xl font-bold text-white mb-2">{stats.level}</div>
                    <div className="text-white/70">Quest Level</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/20 border-orange-500/30">
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                    <div className="text-3xl font-bold text-white mb-2">{stats.streak}</div>
                    <div className="text-white/70">Day Streak</div>
                  </CardContent>
                </Card>
              </div>

              {/* Level Progress */}
              <Card className="bg-gradient-to-br from-indigo-900/20 to-indigo-800/20 border-indigo-500/30">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Level Progress</CardTitle>
                  <CardDescription className="text-white/70">
                    Level {stats.level} → Level {stats.level + 1}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-white">
                      <span className="font-medium">Experience Points</span>
                      <span className="text-sm">
                        {stats.totalRewards} / {stats.level * 1000} XP
                      </span>
                    </div>
                    <Progress value={getLevelProgress()} className="h-3" />
                    <div className="text-center text-white/70 text-sm">
                      {Math.round(getLevelProgress())}% to next level
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Achievements */}
              <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Recent Achievements</CardTitle>
                  <CardDescription className="text-white/70">
                    Your latest quest completions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { title: 'First Steps', reward: 100, completed: '2 hours ago' },
                      { title: 'Score Master', reward: 250, completed: '1 day ago' },
                      { title: 'Chain Explorer', reward: 500, completed: '3 days ago' }
                    ].map((achievement, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-white font-medium">{achievement.title}</div>
                            <div className="text-white/60 text-sm">{achievement.completed}</div>
                          </div>
                        </div>
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          +{achievement.reward} RUSH
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuestDashboard;