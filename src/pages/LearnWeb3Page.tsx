import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { BookOpen, Code, Coins, Award, ChevronRight, CheckCircle2, Lock, Trophy, Star, Sparkles } from 'lucide-react';
import { useMockData } from '../hooks/useMockData';
import { motion } from 'framer-motion';

interface Lesson {
  id: number;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  completed: boolean;
  locked: boolean;
  category: string;
  xpReward: number;
  tokenReward: number;
}

const LearnWeb3Page: React.FC = () => {
  const { quests, addEvent, players } = useMockData();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userXP, setUserXP] = useState<number>(0);
  const [userTokens, setUserTokens] = useState<number>(0);
  const [lessons, setLessons] = useState<Lesson[]>([
    {
      id: 1,
      title: 'Introduction to Blockchain',
      description: 'Learn the fundamentals of blockchain technology, distributed ledgers, and consensus mechanisms.',
      difficulty: 'Beginner',
      duration: '15 min',
      completed: false,
      locked: false,
      category: 'blockchain',
      xpReward: 100,
      tokenReward: 10,
    },
    {
      id: 2,
      title: 'Understanding Avalanche',
      description: 'Discover the Avalanche platform, its unique consensus mechanism, and the power of subnets.',
      difficulty: 'Beginner',
      duration: '20 min',
      completed: false,
      locked: false,
      category: 'avalanche',
      xpReward: 150,
      tokenReward: 15,
    },
    {
      id: 3,
      title: 'Smart Contracts Basics',
      description: 'Introduction to smart contracts, Solidity programming, and their role in Web3 applications.',
      difficulty: 'Beginner',
      duration: '25 min',
      completed: false,
      locked: false,
      category: 'development',
      xpReward: 200,
      tokenReward: 20,
    },
    {
      id: 4,
      title: 'Wallet Setup & Security',
      description: 'Learn how to set up and secure your crypto wallet, manage private keys, and avoid common pitfalls.',
      difficulty: 'Beginner',
      duration: '15 min',
      completed: false,
      locked: false,
      category: 'blockchain',
      xpReward: 125,
      tokenReward: 12,
    },
    {
      id: 5,
      title: 'DeFi Fundamentals',
      description: 'Explore decentralized finance concepts, liquidity pools, yield farming, and lending protocols.',
      difficulty: 'Intermediate',
      duration: '30 min',
      completed: false,
      locked: true,
      category: 'avalanche',
      xpReward: 250,
      tokenReward: 25,
    },
    {
      id: 6,
      title: 'NFTs and Digital Assets',
      description: 'Understanding non-fungible tokens, ERC-721 standard, and their use cases in gaming and art.',
      difficulty: 'Intermediate',
      duration: '25 min',
      completed: false,
      locked: true,
      category: 'development',
      xpReward: 225,
      tokenReward: 22,
    },
    {
      id: 7,
      title: 'Building on Avalanche',
      description: 'Start building your first dApp on Avalanche with Hardhat, deployment, and testing strategies.',
      difficulty: 'Advanced',
      duration: '45 min',
      completed: false,
      locked: true,
      category: 'development',
      xpReward: 400,
      tokenReward: 40,
    },
    {
      id: 8,
      title: 'Advanced Smart Contracts',
      description: 'Master advanced patterns, security best practices, and gas optimization techniques.',
      difficulty: 'Advanced',
      duration: '50 min',
      completed: false,
      locked: true,
      category: 'development',
      xpReward: 500,
      tokenReward: 50,
    },
    {
      id: 9,
      title: 'Cross-Chain Bridges',
      description: 'Learn about interoperability, bridge protocols, and moving assets across blockchains.',
      difficulty: 'Advanced',
      duration: '35 min',
      completed: false,
      locked: true,
      category: 'avalanche',
      xpReward: 350,
      tokenReward: 35,
    },
    {
      id: 10,
      title: 'Tokenomics & Governance',
      description: 'Understand token economics, DAO governance, and building sustainable crypto economies.',
      difficulty: 'Intermediate',
      duration: '30 min',
      completed: false,
      locked: true,
      category: 'blockchain',
      xpReward: 275,
      tokenReward: 27,
    },
  ]);

  // Sync with mock quest data
  useEffect(() => {
    const completedQuestIds = quests.filter(q => q.status === 'completed').map(q => q.questId);
    const activeQuestIds = quests.filter(q => q.status === 'active').map(q => q.questId);

    setLessons(prevLessons => prevLessons.map(lesson => {
      const matchingQuest = quests.find(q => q.name.toLowerCase().includes(lesson.title.toLowerCase().split(' ')[0]));
      if (matchingQuest?.status === 'completed') {
        return { ...lesson, completed: true };
      }
      return lesson;
    }));
  }, [quests]);

  const categories = [
    { id: 'all', name: 'All Lessons', icon: BookOpen, count: lessons.length },
    { id: 'blockchain', name: 'Blockchain Basics', icon: BookOpen, count: lessons.filter(l => l.category === 'blockchain').length },
    { id: 'avalanche', name: 'Avalanche', icon: Coins, count: lessons.filter(l => l.category === 'avalanche').length },
    { id: 'development', name: 'Development', icon: Code, count: lessons.filter(l => l.category === 'development').length },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Intermediate':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Advanced':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleLessonClick = (lessonId: number) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson || lesson.locked) return;

    const newCompleted = !lesson.completed;

    setLessons(lessons.map(l => {
      if (l.id === lessonId) {
        return { ...l, completed: newCompleted };
      }
      // Auto-unlock next lesson in sequence if this one is completed
      if (newCompleted && l.id === lessonId + 1 && l.locked) {
        return { ...l, locked: false };
      }
      return l;
    }));

    // Award XP and tokens when completing
    if (newCompleted && lesson) {
      setUserXP(prev => prev + lesson.xpReward);
      setUserTokens(prev => prev + lesson.tokenReward);

      // Add event to mock data
      addEvent({
        type: 'quest_completed',
        timestamp: Date.now(),
        data: {
          quest: lesson.title,
          xpGained: lesson.xpReward,
          tokensGained: lesson.tokenReward,
          player: players[0]?.username || 'Guest'
        }
      });
    }
  };

  const filteredLessons = selectedCategory === 'all'
    ? lessons
    : lessons.filter(l => l.category === selectedCategory);

  const completedCount = lessons.filter(l => l.completed).length;
  const totalCount = lessons.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white flex items-center justify-center gap-3">
            <Sparkles className="h-10 w-10 text-purple-400" />
            Learn Web3
            <Sparkles className="h-10 w-10 text-purple-400" />
          </h1>
          <p className="text-lg text-gray-300">
            Master blockchain technology and earn rewards while you learn
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Your XP</p>
                  <p className="text-3xl font-bold text-white">{userXP.toLocaleString()}</p>
                </div>
                <Star className="h-10 w-10 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">RUSH Tokens</p>
                  <p className="text-3xl font-bold text-white">{userTokens.toLocaleString()}</p>
                </div>
                <Coins className="h-10 w-10 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-900/50 to-red-900/50 border-orange-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Completed</p>
                  <p className="text-3xl font-bold text-white">{completedCount}/{totalCount}</p>
                </div>
                <Trophy className="h-10 w-10 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Card */}
        <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Learning Progress</h3>
              <span className="text-2xl font-bold text-white">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"
              />
            </div>
            <p className="text-sm text-gray-300 mt-2">
              Complete lessons to unlock advanced content and earn more rewards!
            </p>
          </CardContent>
        </Card>

        {/* Category Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                className={`h-auto py-4 px-3 flex flex-col items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-purple-600 hover:bg-purple-700 border-purple-500'
                    : 'bg-slate-800/50 hover:bg-slate-700/50 border-slate-600'
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <Icon className="h-6 w-6" />
                <span className="text-sm font-medium">{category.name}</span>
                <Badge variant="outline" className="mt-1 border-purple-400/50 text-purple-200 text-xs">
                  {category.count} lessons
                </Badge>
              </Button>
            );
          })}
        </div>

        {/* Lessons Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {filteredLessons.map((lesson, index) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`relative overflow-hidden transition-all duration-300 ${
                  lesson.locked
                    ? 'bg-slate-900/50 border-slate-700 opacity-60'
                    : lesson.completed
                    ? 'bg-green-900/20 border-green-500/30 hover:border-green-500/50'
                    : 'bg-slate-800/50 border-slate-600 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20'
                } cursor-pointer`}
                onClick={() => handleLessonClick(lesson.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-white flex items-center gap-2">
                        {lesson.locked && <Lock className="h-5 w-5 text-gray-400" />}
                        {lesson.completed && <CheckCircle2 className="h-5 w-5 text-green-400" />}
                        {lesson.title}
                      </CardTitle>
                    </div>
                    <Badge className={getDifficultyColor(lesson.difficulty)}>
                      {lesson.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">{lesson.description}</p>

                  {/* Rewards Display */}
                  <div className="flex items-center gap-4 mb-4 p-3 bg-purple-900/20 rounded-lg border border-purple-500/20">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm text-yellow-200">+{lesson.xpReward} XP</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-green-200">+{lesson.tokenReward} RUSH</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      {lesson.duration}
                    </span>
                    {!lesson.locked && (
                      <Button
                        size="sm"
                        variant={lesson.completed ? 'outline' : 'default'}
                        className={
                          lesson.completed
                            ? 'border-green-500 text-green-400 hover:bg-green-500/10'
                            : 'bg-purple-600 hover:bg-purple-700'
                        }
                      >
                        {lesson.completed ? 'Review' : 'Start'}
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    )}
                    {lesson.locked && (
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Lock className="h-4 w-4" />
                        Locked
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Leaderboard Preview */}
        <Card className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-indigo-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-400" />
              Top Learners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {players.slice(0, 3).map((player, index) => (
                <div
                  key={player.address}
                  className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-purple-500/20"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    index === 0 ? 'bg-yellow-500 text-yellow-900' :
                    index === 1 ? 'bg-gray-400 text-gray-900' :
                    'bg-amber-700 text-amber-100'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold">{player.username}</p>
                    <p className="text-sm text-gray-300">{player.level} lessons completed</p>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-bold">{player.totalScore}</p>
                    <p className="text-xs text-gray-400">XP</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rewards Info */}
        <Card className="bg-gradient-to-r from-amber-900/50 to-orange-900/50 border-amber-500/30">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <Award className="h-12 w-12 text-amber-400 flex-shrink-0" />
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-semibold text-white mb-1">
                  Earn While You Learn
                </h3>
                <p className="text-gray-300">
                  Complete lessons to earn XP and RUSH tokens, unlock achievements, and climb the leaderboard!
                  The more you learn, the more you earn!
                </p>
              </div>
              <div className="flex gap-2">
                <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                  View Rewards
                </Button>
                <Button variant="outline" className="border-amber-500 text-amber-200 hover:bg-amber-500/10">
                  Leaderboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integration with Mock Data Notice */}
        {quests.length > 0 && (
          <Card className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <p className="text-sm text-blue-200">
                  <strong>Live Data:</strong> Connected to mock data system with {quests.length} active quests.
                  Your progress syncs with the game!
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LearnWeb3Page;
