import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSmartContracts } from '../../hooks/useSmartContracts';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { X, Trophy, Medal, Crown, Star } from 'lucide-react';

interface LeaderboardSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LeaderboardEntry {
  rank: number;
  address: string;
  score: number;
  level: number;
  gamesPlayed: number;
  isCurrentUser?: boolean;
}

const LeaderboardSystem: React.FC<LeaderboardSystemProps> = ({ isOpen, onClose }) => {
  const { isConnected, account, getLeaderboard } = useSmartContracts();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedMode, setSelectedMode] = useState<'classic' | 'tournament' | 'speedrun'>('classic');
  const [isLoading, setIsLoading] = useState(false);

  // Mock leaderboard data
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockData: LeaderboardEntry[] = [
          { rank: 1, address: '0x1234...5678', score: 15420, level: 12, gamesPlayed: 45, isCurrentUser: account === '0x1234...5678' },
          { rank: 2, address: '0x2345...6789', score: 12850, level: 10, gamesPlayed: 38 },
          { rank: 3, address: '0x3456...7890', score: 11200, level: 9, gamesPlayed: 32 },
          { rank: 4, address: '0x4567...8901', score: 9800, level: 8, gamesPlayed: 28 },
          { rank: 5, address: '0x5678...9012', score: 8750, level: 7, gamesPlayed: 25 },
          { rank: 6, address: '0x6789...0123', score: 7200, level: 6, gamesPlayed: 22 },
          { rank: 7, address: '0x7890...1234', score: 6800, level: 6, gamesPlayed: 20 },
          { rank: 8, address: '0x8901...2345', score: 6200, level: 5, gamesPlayed: 18 },
          { rank: 9, address: '0x9012...3456', score: 5800, level: 5, gamesPlayed: 16 },
          { rank: 10, address: '0x0123...4567', score: 5400, level: 5, gamesPlayed: 15 }
        ];
        setLeaderboard(mockData);
        setIsLoading(false);
      }, 1000);
    }
  }, [isOpen, selectedMode, account]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2: return <Medal className="w-6 h-6 text-gray-300" />;
      case 3: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return <span className="text-white font-bold">{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/30';
      case 2: return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30';
      case 3: return 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 border-amber-500/30';
      default: return 'bg-white/5 border-white/10';
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
              <h2 className="text-4xl font-black text-white mb-2">Leaderboard</h2>
              <p className="text-white/70 text-lg">Top players and their achievements</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
          </div>

          {/* Mode Selector */}
          <div className="flex space-x-4 mb-8">
            {(['classic', 'tournament', 'speedrun'] as const).map((mode) => (
              <Button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                variant={selectedMode === mode ? 'default' : 'outline'}
                className={`capitalize ${
                  selectedMode === mode
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                }`}
              >
                {mode}
              </Button>
            ))}
          </div>

          {isLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-white/70">Loading leaderboard...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Top 3 Podium */}
              {leaderboard.slice(0, 3).length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {leaderboard.slice(0, 3).map((entry, index) => (
                    <motion.div
                      key={entry.rank}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`${getRankColor(entry.rank)} rounded-2xl p-6 text-center relative ${
                        entry.isCurrentUser ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      {entry.isCurrentUser && (
                        <Badge className="absolute -top-2 -right-2 bg-blue-500 text-white">
                          You
                        </Badge>
                      )}
                      <div className="mb-4">
                        {getRankIcon(entry.rank)}
                      </div>
                      <div className="text-white font-bold text-lg mb-2">
                        {formatAddress(entry.address)}
                      </div>
                      <div className="text-white/70 text-sm mb-4">
                        Level {entry.level} • {entry.gamesPlayed} games
                      </div>
                      <div className="text-2xl font-black text-white">
                        {entry.score.toLocaleString()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Rest of Leaderboard */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-xl">All Players</CardTitle>
                  <CardDescription className="text-white/70">
                    Complete leaderboard for {selectedMode} mode
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboard.map((entry, index) => (
                      <motion.div
                        key={entry.rank}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center justify-between p-4 rounded-lg ${
                          entry.isCurrentUser 
                            ? 'bg-blue-500/20 border border-blue-500/30' 
                            : 'bg-white/5 hover:bg-white/10'
                        } transition-colors`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8 h-8">
                            {getRankIcon(entry.rank)}
                          </div>
                          <div>
                            <div className="text-white font-medium">
                              {formatAddress(entry.address)}
                              {entry.isCurrentUser && (
                                <Badge className="ml-2 bg-blue-500 text-white text-xs">
                                  You
                                </Badge>
                              )}
                            </div>
                            <div className="text-white/60 text-sm">
                              Level {entry.level} • {entry.gamesPlayed} games
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold text-lg">
                            {entry.score.toLocaleString()}
                          </div>
                          <div className="text-white/60 text-sm">points</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {!isConnected && (
            <div className="mt-8 text-center">
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-6">
                <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Connect to Compete</h3>
                <p className="text-white/70 mb-4">
                  Connect your wallet to participate in leaderboards and tournaments
                </p>
                <Button
                  onClick={onClose}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                >
                  Connect Wallet
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LeaderboardSystem;