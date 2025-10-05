import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, Zap, Target, Award, Sparkles, Lock } from 'lucide-react';

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  progress: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  category: string;
}

export function AchievementsShowcase() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const achievements: Achievement[] = [
    {
      id: 1,
      name: 'First Rush',
      description: 'Complete your first game on Avalanche',
      icon: '🎮',
      points: 100,
      unlocked: true,
      progress: 100,
      rarity: 'common',
      category: 'beginner'
    },
    {
      id: 2,
      name: 'Speed Demon',
      description: 'Score 10,000 points in a single game',
      icon: '⚡',
      points: 250,
      unlocked: true,
      progress: 100,
      rarity: 'rare',
      category: 'performance'
    },
    {
      id: 3,
      name: 'Chain Master',
      description: 'Achieve a 50x combo multiplier',
      icon: '⛓️',
      points: 500,
      unlocked: true,
      progress: 100,
      rarity: 'epic',
      category: 'skill'
    },
    {
      id: 4,
      name: 'NFT Collector',
      description: 'Collect 10 unique achievement NFTs',
      icon: '🖼️',
      points: 750,
      unlocked: false,
      progress: 60,
      rarity: 'epic',
      category: 'collection'
    },
    {
      id: 5,
      name: 'Tournament Victor',
      description: 'Win first place in a tournament',
      icon: '🏆',
      points: 1000,
      unlocked: false,
      progress: 0,
      rarity: 'legendary',
      category: 'competitive'
    },
    {
      id: 6,
      name: 'Diamond Hands',
      description: 'Earn 1,000 AVAX in total rewards',
      icon: '💎',
      points: 1500,
      unlocked: false,
      progress: 25,
      rarity: 'legendary',
      category: 'rewards'
    },
    {
      id: 7,
      name: 'Streak Warrior',
      description: 'Maintain a 10-day login streak',
      icon: '🔥',
      points: 500,
      unlocked: false,
      progress: 70,
      rarity: 'rare',
      category: 'dedication'
    },
    {
      id: 8,
      name: 'Avalanche Legend',
      description: 'Reach the top 10 on global leaderboard',
      icon: '⭐',
      points: 2500,
      unlocked: false,
      progress: 10,
      rarity: 'mythic',
      category: 'competitive'
    }
  ];

  const categories = [
    { id: 'all', name: 'All', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'beginner', name: 'Beginner', icon: <Target className="w-4 h-4" /> },
    { id: 'skill', name: 'Skill', icon: <Zap className="w-4 h-4" /> },
    { id: 'competitive', name: 'Competitive', icon: <Trophy className="w-4 h-4" /> },
    { id: 'collection', name: 'Collection', icon: <Award className="w-4 h-4" /> }
  ];

  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-orange-400 to-orange-600',
    mythic: 'from-pink-400 to-pink-600'
  };

  const rarityBorderColors = {
    common: 'border-gray-500/30',
    rare: 'border-blue-500/30',
    epic: 'border-purple-500/30',
    legendary: 'border-orange-500/30',
    mythic: 'border-pink-500/30'
  };

  const filteredAchievements = selectedCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === selectedCategory);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalPoints = achievements
    .filter(a => a.unlocked)
    .reduce((sum, a) => sum + a.points, 0);

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 px-4 py-2 bg-purple-500/20 border-purple-500/50 text-purple-300">
            <Award className="w-4 h-4 mr-2" />
            Achievements
          </Badge>
          <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
            🎯 Unlock Your Potential
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Earn exclusive NFT badges and AVAX rewards by completing challenges
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          <Card className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 border-purple-500/30 backdrop-blur-xl">
            <CardContent className="pt-6 text-center">
              <div className="text-5xl font-black text-purple-400 mb-2">
                {unlockedCount}/{achievements.length}
              </div>
              <div className="text-gray-300 font-medium">Achievements Unlocked</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-900/40 to-pink-800/40 border-pink-500/30 backdrop-blur-xl">
            <CardContent className="pt-6 text-center">
              <div className="text-5xl font-black text-pink-400 mb-2">
                {totalPoints.toLocaleString()}
              </div>
              <div className="text-gray-300 font-medium">Total Points Earned</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-900/40 to-orange-800/40 border-orange-500/30 backdrop-blur-xl">
            <CardContent className="pt-6 text-center">
              <div className="text-5xl font-black text-orange-400 mb-2">
                {Math.round((unlockedCount / achievements.length) * 100)}%
              </div>
              <div className="text-gray-300 font-medium">Completion Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              className={`
                ${selectedCategory === category.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'border-purple-500/30 text-gray-300 hover:bg-purple-500/10'
                }
              `}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.icon}
              <span className="ml-2">{category.name}</span>
            </Button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {filteredAchievements.map(achievement => (
            <Card
              key={achievement.id}
              className={`
                group relative overflow-hidden transition-all duration-300 hover:scale-105
                ${achievement.unlocked
                  ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2'
                  : 'bg-slate-900/50 border'
                }
                ${achievement.unlocked ? rarityBorderColors[achievement.rarity] : 'border-slate-700/30'}
                backdrop-blur-xl cursor-pointer
              `}
            >
              {/* Rarity Glow */}
              {achievement.unlocked && (
                <div className={`absolute inset-0 bg-gradient-to-br ${rarityColors[achievement.rarity]} opacity-5`} />
              )}

              <CardContent className="pt-6 relative z-10">
                {/* Icon and Lock Status */}
                <div className="relative mb-4">
                  <div className={`
                    text-6xl text-center transition-all duration-300
                    ${achievement.unlocked ? 'scale-100' : 'scale-90 grayscale opacity-50'}
                  `}>
                    {achievement.icon}
                  </div>
                  {achievement.unlocked && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                      <span className="text-white text-lg">✓</span>
                    </div>
                  )}
                  {!achievement.unlocked && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                      <Lock className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Achievement Details */}
                <div className="space-y-3">
                  <div>
                    <h3 className={`
                      text-lg font-bold mb-1
                      ${achievement.unlocked ? 'text-white' : 'text-gray-400'}
                    `}>
                      {achievement.name}
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {achievement.description}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{achievement.progress}%</span>
                    </div>
                    <Progress
                      value={achievement.progress}
                      className="h-2 bg-slate-700"
                    />
                  </div>

                  {/* Points and Rarity */}
                  <div className="flex justify-between items-center pt-2">
                    <Badge className={`
                      bg-gradient-to-r ${rarityColors[achievement.rarity]} text-white
                    `}>
                      {achievement.rarity.toUpperCase()}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400 font-bold text-lg">
                        +{achievement.points}
                      </span>
                      <span className="text-xs text-gray-400">AVAX</span>
                    </div>
                  </div>
                </div>
              </CardContent>

              {/* Hover Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg font-bold rounded-full"
          >
            <Trophy className="w-5 h-5 mr-2" />
            Start Earning Achievements
          </Button>
        </div>
      </div>
    </section>
  );
}

export default AchievementsShowcase;
