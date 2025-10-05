import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Award, Zap, Clock, TrendingUp } from 'lucide-react';
import { useGameLoop } from '@/hooks/useGameLoop';

interface LeaderboardEntry {
  rank: number;
  player: string;
  score: number;
  avatar: string;
  timestamp: number;
  streak: number;
  nfts: number;
}

export function LiveLeaderboard() {
  const { leaderboard, loadLeaderboard, currentTournament } = useGameLoop();
  const [loading, setLoading] = useState(true);
  const [mockData] = useState<LeaderboardEntry[]>([
    { rank: 1, player: '0x742d...35a1', score: 15420, avatar: '🚀', timestamp: Date.now() - 3600000, streak: 7, nfts: 12 },
    { rank: 2, player: '0x8b39...92cf', score: 14280, avatar: '⭐', timestamp: Date.now() - 7200000, streak: 5, nfts: 8 },
    { rank: 3, player: '0x3c81...67de', score: 13850, avatar: '🔥', timestamp: Date.now() - 10800000, streak: 4, nfts: 15 },
    { rank: 4, player: '0x9a12...48bb', score: 12560, avatar: '⚡', timestamp: Date.now() - 14400000, streak: 3, nfts: 6 },
    { rank: 5, player: '0x5e27...83aa', score: 11890, avatar: '🎯', timestamp: Date.now() - 18000000, streak: 6, nfts: 10 },
    { rank: 6, player: '0x6f34...92cd', score: 10450, avatar: '💎', timestamp: Date.now() - 21600000, streak: 2, nfts: 5 },
    { rank: 7, player: '0x4a21...67ef', score: 9820, avatar: '🌟', timestamp: Date.now() - 25200000, streak: 4, nfts: 7 },
    { rank: 8, player: '0x7b45...83gh', score: 8960, avatar: '🎮', timestamp: Date.now() - 28800000, streak: 3, nfts: 4 },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const formatTime = (timestamp: number) => {
    const hours = Math.floor((Date.now() - timestamp) / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-400" />;
      default:
        return <span className="text-xl font-bold text-gray-400">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500';
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600';
    return 'bg-gradient-to-r from-purple-500 to-pink-500';
  };

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 px-4 py-2 bg-purple-500/20 border-purple-500/50 text-purple-300">
            <TrendingUp className="w-4 h-4 mr-2" />
            Live Rankings
          </Badge>
          <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
            🏆 Global Leaderboard
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Top performers on the Avalanche network • Updated in real-time
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-12">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-purple-400">12,483</div>
            <div className="text-sm text-gray-400">Total Players</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-pink-400">342</div>
            <div className="text-sm text-gray-400">Active Now</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-orange-400">124K</div>
            <div className="text-sm text-gray-400">AVAX Rewards</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-green-400">&lt;2s</div>
            <div className="text-sm text-gray-400">Finality</div>
          </div>
        </div>

        {/* Leaderboard Card */}
        <Card className="max-w-5xl mx-auto bg-slate-900/80 backdrop-blur-xl border-purple-500/20">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                Top Players
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
              >
                View All Rankings
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-400">Loading blockchain data...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mockData.map((entry, index) => (
                  <div
                    key={entry.rank}
                    className={`
                      relative group flex items-center gap-4 p-4 rounded-xl
                      transition-all duration-300 hover:scale-[1.02] cursor-pointer
                      ${index < 3
                        ? 'bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-2 border-purple-500/30 hover:border-purple-500/50'
                        : 'bg-slate-800/50 border border-purple-500/10 hover:border-purple-500/30'
                      }
                    `}
                  >
                    {/* Rank Badge */}
                    <div className="flex-shrink-0 w-16 flex justify-center">
                      {getRankIcon(entry.rank)}
                    </div>

                    {/* Player Info */}
                    <div className="flex-1 flex items-center gap-4">
                      <div className="text-3xl">{entry.avatar}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-semibold text-white">
                            {entry.player}
                          </span>
                          {entry.streak >= 3 && (
                            <Badge className="bg-orange-500/20 border-orange-500/50 text-orange-300 text-xs">
                              <Zap className="w-3 h-3 mr-1" />
                              {entry.streak}x Streak
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Trophy className="w-4 h-4" />
                            {entry.nfts} NFTs
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatTime(entry.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Score Display */}
                    <div className="text-right">
                      <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                        {entry.score.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400">points</div>
                    </div>

                    {/* AVAX Badge */}
                    <div className="flex-shrink-0">
                      <div className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/50">
                        <div className="text-2xl">⛰️</div>
                      </div>
                    </div>

                    {/* Hover Glow Effect */}
                    {index < 3 && (
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/10 to-pink-600/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Your Rank Card */}
            <div className="mt-6 p-6 rounded-xl bg-gradient-to-r from-purple-900/60 to-pink-900/60 border-2 border-purple-500/50">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Your Position</div>
                  <div className="text-3xl font-bold text-white">Rank #47</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400 mb-1">Your Score</div>
                  <div className="text-3xl font-bold text-purple-400">8,920</div>
                </div>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Zap className="w-4 h-4 mr-2" />
                  Beat Your Score
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default LiveLeaderboard;
