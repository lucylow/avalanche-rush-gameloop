import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  Lock, 
  Star,
  ArrowRight,
  Clock,
  Target,
  Trophy,
  Users,
  Lightbulb,
  Code,
  Shield,
  Zap,
  Mountain,
  Network,
  Wallet,
  TrendingUp,
  Award
} from 'lucide-react';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  progress: number;
  isCompleted: boolean;
  isLocked: boolean;
  prerequisites: string[];
  icon: React.ReactNode;
  color: string;
  topics: string[];
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  modules: LearningModule[];
  isCompleted: boolean;
  progress: number;
}

interface LearningPathProps {
  path: LearningPath;
  onModuleSelect: (moduleId: string) => void;
  userProgress: Record<string, number>;
}

const LearningPath: React.FC<LearningPathProps> = ({
  path,
  onModuleSelect,
  userProgress
}) => {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'blockchain': return <Shield className="h-5 w-5" />;
      case 'defi': return <TrendingUp className="h-5 w-5" />;
      case 'avalanche': return <Mountain className="h-5 w-5" />;
      case 'smart contracts': return <Code className="h-5 w-5" />;
      case 'web3': return <Network className="h-5 w-5" />;
      case 'trading': return <Zap className="h-5 w-5" />;
      case 'security': return <Shield className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  const overallProgress = path.modules.reduce((acc, module) => acc + module.progress, 0) / path.modules.length;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Path Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                {getCategoryIcon(path.category)}
                <Badge className="bg-white/20 text-white border-white/30">
                  {path.category}
                </Badge>
                <Badge className={`${getDifficultyColor(path.difficulty)} text-white`}>
                  {path.difficulty}
                </Badge>
              </div>
              <h1 className="text-4xl font-bold mb-4">{path.title}</h1>
              <p className="text-xl text-blue-100 mb-6">{path.description}</p>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>{path.estimatedTime} hours</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>{path.modules.length} modules</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>2,847 learners</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold">{Math.round(overallProgress)}%</div>
              <div className="text-blue-200">Complete</div>
              <Progress value={overallProgress} className="w-32 h-2 mt-2" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Learning Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {path.modules.map((module, index) => (
          <motion.div
            key={module.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                module.isLocked 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:scale-105'
              } ${module.color}`}
              onClick={() => !module.isLocked && onModuleSelect(module.id)}
            >
              <CardHeader className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${module.color} text-white`}>
                    {module.icon}
                  </div>
                  <div className="flex items-center space-x-2">
                    {module.isCompleted && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {module.isLocked && (
                      <Lock className="h-5 w-5 text-gray-400" />
                    )}
                    <Badge variant="outline" className="text-xs">
                      {module.duration} min
                    </Badge>
                  </div>
                </div>
                
                <CardTitle className="text-lg">{module.title}</CardTitle>
                <p className="text-sm text-gray-600 mt-2">{module.description}</p>
                
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{module.progress}%</span>
                  </div>
                  <Progress value={module.progress} className="h-2" />
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Topics Covered:</h4>
                    <div className="flex flex-wrap gap-1">
                      {module.topics.slice(0, 3).map((topic, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                      {module.topics.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{module.topics.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {module.prerequisites.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Prerequisites:</h4>
                      <div className="text-xs text-gray-500">
                        {module.prerequisites.join(', ')}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Connection Line */}
            {index < path.modules.length - 1 && (
              <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gray-300 transform -translate-y-1/2" />
            )}
          </motion.div>
        ))}
      </div>

      {/* Path Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-2">
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm text-gray-600">Achievements</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-2">
              <Star className="h-8 w-8 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">4.8</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-2">
              <Award className="h-8 w-8 text-green-500" />
            </div>
            <div className="text-2xl font-bold">95%</div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-2">
              <Lightbulb className="h-8 w-8 text-purple-500" />
            </div>
            <div className="text-2xl font-bold">24</div>
            <div className="text-sm text-gray-600">Skills Learned</div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default LearningPath;
