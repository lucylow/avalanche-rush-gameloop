import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccount } from 'wagmi';
import { 
  BookOpen, 
  Brain, 
  Users, 
  Trophy,
  Zap,
  Target,
  Star,
  TrendingUp,
  Award,
  Coins,
  Clock,
  BarChart3,
  Lightbulb,
  MessageCircle,
  Crown,
  Flame
} from 'lucide-react';

// Lazy load components for better performance
import { lazy, Suspense } from 'react';

const InteractiveLearningHub = lazy(() => import('../components/learning/InteractiveLearningHub'));
const AdaptiveLearningEngine = lazy(() => import('../components/learning/AdaptiveLearningEngine'));
const SocialLearningHub = lazy(() => import('../components/learning/SocialLearningHub'));

const InteractiveLearningPage: React.FC = () => {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('hub');

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-20">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16"
      >
        <BookOpen className="w-16 h-16 text-blue-400" />
      </motion.div>
    </div>
  );

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-2xl mx-4"
        >
          <Card className="bg-gray-800 text-white border-gray-700 shadow-2xl">
            <CardHeader className="text-center pb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-2xl mx-auto mb-6"
              >
                🧠
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-black mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
              >
                Interactive Learning Platform
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-300"
              >
                Experience the future of blockchain education with Reactive Network automation
              </motion.p>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Features Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <div className="text-center p-6 bg-gradient-to-br from-blue-600/20 to-blue-700/20 rounded-xl border border-blue-500/30">
                  <Brain className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                  <h3 className="font-bold text-lg mb-2">AI-Powered Learning</h3>
                  <p className="text-sm text-gray-300">
                    Personalized recommendations based on your learning patterns
                  </p>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-purple-600/20 to-purple-700/20 rounded-xl border border-purple-500/30">
                  <Zap className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                  <h3 className="font-bold text-lg mb-2">Reactive Automation</h3>
                  <p className="text-sm text-gray-300">
                    Automatic progress tracking and reward distribution
                  </p>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-green-600/20 to-green-700/20 rounded-xl border border-green-500/30">
                  <Users className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <h3 className="font-bold text-lg mb-2">Social Learning</h3>
                  <p className="text-sm text-gray-300">
                    Learn with peers in study groups and challenges
                  </p>
                </div>
              </motion.div>

              {/* Learning Statistics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-6 border border-gray-600"
              >
                <h3 className="text-2xl font-bold mb-4 text-center">Platform Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">2,500+</div>
                    <div className="text-sm text-gray-300">Active Learners</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400">150+</div>
                    <div className="text-sm text-gray-300">Learning Modules</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">50+</div>
                    <div className="text-sm text-gray-300">Study Groups</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400">25+</div>
                    <div className="text-sm text-gray-300">Active Challenges</div>
                  </div>
                </div>
              </motion.div>

              {/* Call to Action */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-center"
              >
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-full shadow-2xl transition-all duration-300"
                >
                  Connect Wallet to Start Learning
                </Button>
                <p className="text-sm text-gray-400 mt-4">
                  Join thousands of learners building the future of blockchain
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl font-bold text-white shadow-2xl">
                🧠
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Interactive Learning
                </h1>
                <p className="text-gray-300 text-sm">Powered by Reactive Network</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">2,500+</div>
                <div className="text-xs text-gray-300">Learners</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">150+</div>
                <div className="text-xs text-gray-300">Modules</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">50+</div>
                <div className="text-xs text-gray-300">Groups</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700 mb-8">
            <TabsTrigger 
              value="hub" 
              className="data-[state=active]:bg-blue-600 flex items-center space-x-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Learning Hub</span>
            </TabsTrigger>
            <TabsTrigger 
              value="ai" 
              className="data-[state=active]:bg-purple-600 flex items-center space-x-2"
            >
              <Brain className="w-4 h-4" />
              <span>AI Engine</span>
            </TabsTrigger>
            <TabsTrigger 
              value="social" 
              className="data-[state=active]:bg-green-600 flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>Social Learning</span>
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-orange-600 flex items-center space-x-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Learning Hub Tab */}
          <TabsContent value="hub" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Interactive Learning Hub
              </h2>
              <p className="text-xl text-gray-300">
                Discover, learn, and master blockchain technology with gamified modules
              </p>
            </motion.div>
            
            <Suspense fallback={<LoadingSpinner />}>
              <InteractiveLearningHub />
            </Suspense>
          </TabsContent>

          {/* AI Engine Tab */}
          <TabsContent value="ai" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                AI Learning Engine
              </h2>
              <p className="text-xl text-gray-300">
                Get personalized learning recommendations powered by artificial intelligence
              </p>
            </motion.div>
            
            <Suspense fallback={<LoadingSpinner />}>
              <AdaptiveLearningEngine
                learnerId="current-user"
                currentLevel={3}
                completedModules={[1, 2, 5]}
                learningHistory={[
                  {
                    moduleId: 1,
                    score: 85,
                    timeSpent: 1800,
                    completionDate: new Date('2024-01-15'),
                    difficulty: 2
                  },
                  {
                    moduleId: 2,
                    score: 92,
                    timeSpent: 2400,
                    completionDate: new Date('2024-01-20'),
                    difficulty: 3
                  }
                ]}
              />
            </Suspense>
          </TabsContent>

          {/* Social Learning Tab */}
          <TabsContent value="social" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Social Learning Hub
              </h2>
              <p className="text-xl text-gray-300">
                Learn together with the community through study groups and challenges
              </p>
            </motion.div>
            
            <Suspense fallback={<LoadingSpinner />}>
              <SocialLearningHub />
            </Suspense>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                Learning Analytics
              </h2>
              <p className="text-xl text-gray-300">
                Track your progress and optimize your learning journey
              </p>
            </motion.div>

            {/* Analytics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Learning Progress */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-400">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Learning Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Modules Completed</span>
                      <span className="font-bold">12/50</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '24%' }}></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-300">
                      <span>Level 3</span>
                      <span>2,450 XP</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Learning Streak */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-400">
                    <Flame className="w-5 h-5 mr-2" />
                    Learning Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-orange-400 mb-2">7</div>
                    <div className="text-gray-300">Days in a row</div>
                    <div className="text-sm text-gray-400 mt-2">
                      Best streak: 15 days
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-yellow-400">
                    <Trophy className="w-5 h-5 mr-2" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">8</div>
                      <div className="text-sm text-gray-300">Badges</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">3</div>
                      <div className="text-sm text-gray-300">Challenges</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Learning Time */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-purple-400">
                    <Clock className="w-5 h-5 mr-2" />
                    Learning Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>This Week</span>
                      <span className="font-bold">12h 30m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>This Month</span>
                      <span className="font-bold">45h 15m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total</span>
                      <span className="font-bold">127h 45m</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category Progress */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-400">
                    <Target className="w-5 h-5 mr-2" />
                    Category Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { category: 'Blockchain', progress: 75, color: 'blue' },
                      { category: 'DeFi', progress: 60, color: 'green' },
                      { category: 'Avalanche', progress: 40, color: 'purple' },
                      { category: 'Reactive', progress: 25, color: 'orange' }
                    ].map((item) => (
                      <div key={item.category}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{item.category}</span>
                          <span>{item.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className={`bg-${item.color}-600 h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${item.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-400">
                    <Star className="w-5 h-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { action: 'Completed', module: 'Smart Contract Basics', time: '2 hours ago' },
                      { action: 'Earned', module: 'DeFi Explorer Badge', time: '1 day ago' },
                      { action: 'Joined', module: 'Avalanche Developers Group', time: '2 days ago' },
                      { action: 'Started', module: 'Reactive Network Module', time: '3 days ago' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-gray-300">{activity.action}</span>
                          <span className="text-white ml-1">{activity.module}</span>
                        </div>
                        <span className="text-gray-400">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InteractiveLearningPage;
