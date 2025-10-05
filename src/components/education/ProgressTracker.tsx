import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  Clock, 
  Trophy, 
  Star,
  Award,
  CheckCircle,
  BookOpen,
  Brain,
  Zap,
  Users,
  BarChart3,
  Activity,
  Flame
} from 'lucide-react';

interface LearningProgress {
  userId: string;
  totalXP: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  modulesCompleted: number;
  quizzesPassed: number;
  totalTimeSpent: number; // in minutes
  achievements: Achievement[];
  weeklyProgress: WeeklyProgress[];
  categories: CategoryProgress[];
  goals: LearningGoal[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlockedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
}

interface WeeklyProgress {
  week: string;
  modulesCompleted: number;
  timeSpent: number;
  xpEarned: number;
  streakDays: number;
}

interface CategoryProgress {
  category: string;
  totalModules: number;
  completedModules: number;
  totalTime: number;
  averageScore: number;
  lastActivity: string;
}

interface LearningGoal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  deadline: string;
  category: string;
  isCompleted: boolean;
}

interface ProgressTrackerProps {
  userId: string;
  onAchievementUnlocked?: (achievement: Achievement) => void;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  userId,
  onAchievementUnlocked
}) => {
  const [progress, setProgress] = useState<LearningProgress>({
    userId,
    totalXP: 2840,
    level: 5,
    currentStreak: 7,
    longestStreak: 15,
    modulesCompleted: 12,
    quizzesPassed: 8,
    totalTimeSpent: 1240,
    achievements: [
      {
        id: 'first-module',
        title: 'First Steps',
        description: 'Completed your first learning module',
        icon: <BookOpen className="h-5 w-5" />,
        unlockedAt: '2024-01-15',
        rarity: 'common',
        xpReward: 50
      },
      {
        id: 'week-streak',
        title: 'Week Warrior',
        description: 'Maintained a 7-day learning streak',
        icon: <Flame className="h-5 w-5" />,
        unlockedAt: '2024-01-22',
        rarity: 'rare',
        xpReward: 200
      },
      {
        id: 'quiz-master',
        title: 'Quiz Master',
        description: 'Passed 10 quizzes with 80%+ accuracy',
        icon: <Brain className="h-5 w-5" />,
        unlockedAt: '2024-01-25',
        rarity: 'epic',
        xpReward: 500
      }
    ],
    weeklyProgress: [
      { week: '2024-W03', modulesCompleted: 3, timeSpent: 180, xpEarned: 450, streakDays: 7 },
      { week: '2024-W02', modulesCompleted: 2, timeSpent: 120, xpEarned: 300, streakDays: 5 },
      { week: '2024-W01', modulesCompleted: 4, timeSpent: 240, xpEarned: 600, streakDays: 3 }
    ],
    categories: [
      { category: 'Blockchain', totalModules: 8, completedModules: 6, totalTime: 480, averageScore: 87, lastActivity: '2024-01-25' },
      { category: 'Avalanche', totalModules: 5, completedModules: 3, totalTime: 300, averageScore: 92, lastActivity: '2024-01-24' },
      { category: 'DeFi', totalModules: 6, completedModules: 2, totalTime: 180, averageScore: 78, lastActivity: '2024-01-23' }
    ],
    goals: [
      {
        id: 'monthly-modules',
        title: 'Monthly Learning Goal',
        description: 'Complete 10 modules this month',
        target: 10,
        current: 7,
        deadline: '2024-02-29',
        category: 'General',
        isCompleted: false
      },
      {
        id: 'defi-expert',
        title: 'DeFi Expert',
        description: 'Complete all DeFi modules',
        target: 6,
        current: 2,
        deadline: '2024-03-15',
        category: 'DeFi',
        isCompleted: false
      }
    ]
  });

  const [selectedTab, setSelectedTab] = useState<'overview' | 'achievements' | 'goals' | 'analytics'>('overview');

  const getXPToNextLevel = (level: number) => {
    return Math.pow(level, 2) * 100;
  };

  const getLevelProgress = () => {
    const currentLevelXP = getXPToNextLevel(progress.level - 1);
    const nextLevelXP = getXPToNextLevel(progress.level);
    const progressXP = progress.totalXP - currentLevelXP;
    const neededXP = nextLevelXP - currentLevelXP;
    return (progressXP / neededXP) * 100;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Learning Progress</h1>
              <p className="text-purple-100">Track your Web3 learning journey</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">Level {progress.level}</div>
              <div className="text-purple-200">{progress.totalXP} XP</div>
              <div className="mt-2">
                <Progress value={getLevelProgress()} className="w-32 h-2" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{progress.modulesCompleted}</div>
                <div className="text-sm text-gray-600">Modules Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{progress.quizzesPassed}</div>
                <div className="text-sm text-gray-600">Quizzes Passed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Flame className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{progress.currentStreak}</div>
                <div className="text-sm text-gray-600">Day Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{Math.round(progress.totalTimeSpent / 60)}h</div>
                <div className="text-sm text-gray-600">Time Spent</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Learning Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Learning Goals</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {progress.goals.map((goal, index) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{goal.title}</h3>
                    <Badge variant={goal.isCompleted ? "default" : "secondary"}>
                      {goal.isCompleted ? "Completed" : "In Progress"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{goal.current}/{goal.target}</span>
                    </div>
                    <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Deadline: {goal.deadline}</span>
                      <span>{goal.category}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Category Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Category Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {progress.categories.map((category, index) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{category.category}</h3>
                    <div className="text-sm text-gray-600">
                      {category.completedModules}/{category.totalModules} modules
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Progress 
                      value={(category.completedModules / category.totalModules) * 100} 
                      className="h-2" 
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Avg Score: {category.averageScore}%</span>
                      <span>Time: {Math.round(category.totalTime / 60)}h</span>
                      <span>Last: {category.lastActivity}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Achievements */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Achievements</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {progress.achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-lg border-l-4 ${
                    getRarityColor(achievement.rarity)
                  } bg-gray-50`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getRarityColor(achievement.rarity)} text-white`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{achievement.title}</h4>
                      <p className="text-xs text-gray-600">{achievement.description}</p>
                      <div className="flex items-center justify-between mt-1">
                        <Badge className={`${getRarityColor(achievement.rarity)} text-white text-xs`}>
                          {achievement.rarity}
                        </Badge>
                        <span className="text-xs text-gray-500">+{achievement.xpReward} XP</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Weekly Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Weekly Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {progress.weeklyProgress.map((week, index) => (
                  <div key={week.week} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{week.week}</span>
                      <span>{week.modulesCompleted} modules</span>
                    </div>
                    <Progress value={(week.modulesCompleted / 5) * 100} className="h-1" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{Math.round(week.timeSpent / 60)}h</span>
                      <span>{week.streakDays} days</span>
                      <span>+{week.xpEarned} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
