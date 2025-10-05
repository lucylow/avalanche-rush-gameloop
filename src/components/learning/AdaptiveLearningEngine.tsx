import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAccount, useReadContract } from 'wagmi';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Zap, 
  BookOpen,
  CheckCircle,
  Clock,
  Star,
  Trophy,
  Lightbulb,
  BarChart3,
  Users,
  Award
} from 'lucide-react';

interface LearningRecommendation {
  moduleId: number;
  title: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number;
  difficulty: number;
  category: string;
  confidence: number; // AI confidence in recommendation
}

interface LearningAnalytics {
  learningVelocity: number; // modules completed per week
  retentionRate: number; // percentage of concepts retained
  difficultyPreference: number; // preferred difficulty level
  categoryPreferences: { [key: string]: number };
  optimalLearningTime: string; // time of day
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  attentionSpan: number; // average minutes before break needed
  performanceTrend: 'improving' | 'stable' | 'declining';
}

interface AdaptiveLearningEngineProps {
  learnerId: string;
  currentLevel: number;
  completedModules: number[];
  learningHistory: Array<{
    moduleId: number;
    score: number;
    timeSpent: number;
    completionDate: Date;
    difficulty: number;
  }>;
}

const AdaptiveLearningEngine: React.FC<AdaptiveLearningEngineProps> = ({
  learnerId,
  currentLevel,
  completedModules,
  learningHistory
}) => {
  const { address, isConnected } = useAccount();
  
  const [recommendations, setRecommendations] = useState<LearningRecommendation[]>([]);
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<LearningRecommendation | null>(null);

  // Mock data for demonstration
  const mockRecommendations: LearningRecommendation[] = [
    {
      moduleId: 6,
      title: "Advanced Solidity Patterns",
      reason: "Based on your strong performance in basic smart contracts, you're ready for advanced patterns",
      priority: 'high',
      estimatedTime: 120,
      difficulty: 4,
      category: 'blockchain',
      confidence: 92
    },
    {
      moduleId: 7,
      title: "DeFi Yield Optimization",
      reason: "Your interest in DeFi combined with solid blockchain knowledge makes this perfect",
      priority: 'high',
      estimatedTime: 90,
      difficulty: 3,
      category: 'defi',
      confidence: 87
    },
    {
      moduleId: 8,
      title: "Avalanche Subnet Development",
      reason: "You've mastered Avalanche basics - time to build your own subnet!",
      priority: 'medium',
      estimatedTime: 180,
      difficulty: 5,
      category: 'avalanche',
      confidence: 78
    },
    {
      moduleId: 9,
      title: "Cross-Chain Bridge Architecture",
      reason: "Your reactive network knowledge plus blockchain skills = bridge expertise",
      priority: 'medium',
      estimatedTime: 150,
      difficulty: 4,
      category: 'blockchain',
      confidence: 83
    },
    {
      moduleId: 10,
      title: "NFT Marketplace Development",
      reason: "Expand your skill set with NFT marketplace creation",
      priority: 'low',
      estimatedTime: 100,
      difficulty: 3,
      category: 'nft',
      confidence: 65
    }
  ];

  const mockAnalytics: LearningAnalytics = {
    learningVelocity: 2.3, // modules per week
    retentionRate: 87, // percentage
    difficultyPreference: 3.2, // average difficulty
    categoryPreferences: {
      'blockchain': 0.4,
      'defi': 0.3,
      'avalanche': 0.2,
      'reactive': 0.1
    },
    optimalLearningTime: '2:00 PM - 4:00 PM',
    learningStyle: 'visual',
    attentionSpan: 45, // minutes
    performanceTrend: 'improving'
  };

  useEffect(() => {
    if (isConnected) {
      analyzeLearningPatterns();
    }
  }, [isConnected, learningHistory]);

  const analyzeLearningPatterns = useCallback(async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setAnalytics(mockAnalytics);
    setRecommendations(mockRecommendations);
    setIsAnalyzing(false);
  }, [learningHistory]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'text-green-400';
    if (difficulty <= 3) return 'text-yellow-400';
    if (difficulty <= 4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getPerformanceTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'stable': return <BarChart3 className="w-4 h-4 text-blue-400" />;
      case 'declining': return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />;
      default: return <BarChart3 className="w-4 h-4 text-gray-400" />;
    }
  };

  const getLearningStyleIcon = (style: string) => {
    switch (style) {
      case 'visual': return '👁️';
      case 'auditory': return '👂';
      case 'kinesthetic': return '✋';
      case 'mixed': return '🧠';
      default: return '🧠';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      blockchain: '⛓️',
      defi: '📈',
      nft: '🖼️',
      avalanche: '🏔️',
      reactive: '⚡'
    };
    return icons[category as keyof typeof icons] || '📚';
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-gray-800 text-white border-gray-700">
          <CardContent className="p-8 text-center">
            <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">AI Learning Engine</h2>
            <p className="text-gray-300 mb-6">
              Connect your wallet to unlock personalized learning recommendations powered by AI!
            </p>
            <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-600">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            AI Learning Engine
          </h1>
          <p className="text-xl text-gray-300">
            Personalized learning recommendations powered by Reactive Network analytics
          </p>
        </motion.div>

        {isAnalyzing ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-20"
          >
            <Card className="bg-gray-800 border-gray-700 max-w-md">
              <CardContent className="p-8 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 mx-auto mb-4"
                >
                  <Brain className="w-16 h-16 text-purple-400" />
                </motion.div>
                <h3 className="text-xl font-bold mb-2">Analyzing Learning Patterns</h3>
                <p className="text-gray-300">
                  Our AI is analyzing your learning history to provide personalized recommendations...
                </p>
                <Progress value={75} className="mt-4" />
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Learning Analytics */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1 space-y-6"
            >
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-6 h-6 mr-2 text-blue-400" />
                    Learning Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analytics && (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Learning Velocity</span>
                          <span className="font-semibold">{analytics.learningVelocity}/week</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Retention Rate</span>
                          <span className="font-semibold text-green-400">{analytics.retentionRate}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Difficulty Preference</span>
                          <span className="font-semibold">{analytics.difficultyPreference}/5</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Attention Span</span>
                          <span className="font-semibold">{analytics.attentionSpan}m</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Performance Trend</span>
                          <div className="flex items-center">
                            {getPerformanceTrendIcon(analytics.performanceTrend)}
                            <span className="ml-1 capitalize">{analytics.performanceTrend}</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-600 pt-4">
                        <h4 className="font-semibold mb-3">Learning Preferences</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Optimal Time</span>
                            <span className="text-sm text-blue-400">{analytics.optimalLearningTime}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Learning Style</span>
                            <span className="text-sm">{getLearningStyleIcon(analytics.learningStyle)} {analytics.learningStyle}</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-600 pt-4">
                        <h4 className="font-semibold mb-3">Category Interests</h4>
                        <div className="space-y-2">
                          {Object.entries(analytics.categoryPreferences).map(([category, preference]) => (
                            <div key={category} className="flex items-center justify-between">
                              <span className="text-sm capitalize">{category}</span>
                              <div className="flex items-center">
                                <Progress value={preference * 100} className="w-16 h-2 mr-2" />
                                <span className="text-xs">{(preference * 100).toFixed(0)}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="w-6 h-6 mr-2 text-yellow-400" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-blue-900/30 rounded-lg border border-blue-500/30">
                      <p className="text-blue-200">
                        <strong>💡 Tip:</strong> You learn best in the afternoon. Try scheduling your sessions between 2-4 PM for optimal retention.
                      </p>
                    </div>
                    <div className="p-3 bg-green-900/30 rounded-lg border border-green-500/30">
                      <p className="text-green-200">
                        <strong>🎯 Strength:</strong> Your retention rate is excellent! Consider taking on more challenging modules.
                      </p>
                    </div>
                    <div className="p-3 bg-purple-900/30 rounded-lg border border-purple-500/30">
                      <p className="text-purple-200">
                        <strong>⚡ Optimization:</strong> Take a 5-minute break every 45 minutes to maintain focus.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* AI Recommendations */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 space-y-6"
            >
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="w-6 h-6 mr-2 text-purple-400" />
                    Personalized Recommendations
                  </CardTitle>
                  <CardDescription>
                    AI-powered suggestions based on your learning patterns and performance
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <motion.div
                    key={rec.moduleId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className={`bg-gray-800 border-gray-700 hover:border-purple-500 transition-all cursor-pointer ${
                        selectedRecommendation?.moduleId === rec.moduleId ? 'border-purple-500 bg-purple-900/20' : ''
                      }`}
                      onClick={() => setSelectedRecommendation(rec)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <span className="text-2xl">{getCategoryIcon(rec.category)}</span>
                              <div>
                                <h3 className="text-xl font-bold">{rec.title}</h3>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge className={`${getPriorityColor(rec.priority)} text-white`}>
                                    {rec.priority} priority
                                  </Badge>
                                  <Badge className="bg-gray-600 text-white">
                                    Difficulty {rec.difficulty}/5
                                  </Badge>
                                  <Badge className="bg-blue-600 text-white">
                                    {formatTime(rec.estimatedTime)}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-gray-300 mb-4">{rec.reason}</p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm">
                                <div className="flex items-center space-x-1">
                                  <Target className="w-4 h-4 text-purple-400" />
                                  <span>AI Confidence: {rec.confidence}%</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4 text-blue-400" />
                                  <span>{formatTime(rec.estimatedTime)}</span>
                                </div>
                              </div>
                              
                              <Button
                                className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Start the recommended module
                                  console.log(`Starting module ${rec.moduleId}`);
                                }}
                              >
                                <BookOpen className="w-4 h-4 mr-2" />
                                Start Learning
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Selected Recommendation Details */}
              <AnimatePresence>
                {selectedRecommendation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Card className="bg-purple-900/20 border-purple-500">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Star className="w-6 h-6 mr-2 text-yellow-400" />
                          Why This Recommendation?
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-purple-400">
                                {selectedRecommendation.confidence}%
                              </div>
                              <div className="text-sm text-gray-300">AI Confidence</div>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-blue-400">
                                {selectedRecommendation.difficulty}/5
                              </div>
                              <div className="text-sm text-gray-300">Difficulty Level</div>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-green-400">
                                {formatTime(selectedRecommendation.estimatedTime)}
                              </div>
                              <div className="text-sm text-gray-300">Est. Time</div>
                            </div>
                          </div>
                          
                          <div className="bg-gray-800 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">Learning Path Integration:</h4>
                            <p className="text-sm text-gray-300">
                              This module fits perfectly into your current learning trajectory. 
                              It builds upon your completed modules and aligns with your 
                              {selectedRecommendation.category} interests.
                            </p>
                          </div>
                          
                          <div className="flex space-x-4">
                            <Button className="flex-1 bg-gradient-to-r from-purple-500 to-blue-600">
                              <BookOpen className="w-4 h-4 mr-2" />
                              Start This Module
                            </Button>
                            <Button variant="outline" className="border-gray-600 text-gray-300">
                              <Clock className="w-4 h-4 mr-2" />
                              Schedule Later
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdaptiveLearningEngine;
