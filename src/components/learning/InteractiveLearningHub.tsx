import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { 
  BookOpen, 
  Trophy, 
  Clock, 
  Target, 
  Zap, 
  Star, 
  Award,
  TrendingUp,
  Users,
  Brain,
  Code,
  Coins,
  ChevronRight,
  Play,
  CheckCircle,
  Lock,
  Flame
} from 'lucide-react';

// Contract ABIs and addresses
const LEARNING_ENGINE_ABI = [
  "function getLearnerProfile(address) view returns (uint256,uint256,uint256,uint256,uint256,uint256,uint256[])",
  "function getModuleProgress(uint256,address) view returns (uint256,uint256,uint256,bool,uint256)",
  "function createLearningModule(string,string,string,uint256,uint256,uint256,string[],uint256[],uint256,uint256) external returns (uint256)",
  "function createBadge(string,string,string,uint256,string) external returns (uint256)",
  "event ModuleCompleted(uint256 indexed moduleId, address indexed learner, uint256 score, uint256 xpEarned)",
  "event BadgeEarned(uint256 indexed badgeId, address indexed learner)",
  "event StreakAchieved(address indexed learner, uint256 streakDays, uint256 bonusMultiplier)"
];

const LEARNING_ENGINE_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with deployed address

interface LearningModule {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: number;
  estimatedDuration: number;
  requiredScore: number;
  isCompleted: boolean;
  progress: number;
  xpReward: number;
  rewardAmount: number;
  prerequisites: number[];
  learningObjectives: string[];
}

interface LearningPath {
  id: number;
  name: string;
  description: string;
  modules: LearningModule[];
  totalXp: number;
  completionBonus: number;
  progress: number;
}

interface Badge {
  id: number;
  name: string;
  description: string;
  imageUri: string;
  requirement: number;
  requirementType: string;
  isEarned: boolean;
}

interface LearnerStats {
  totalXp: number;
  level: number;
  completedModules: number;
  completedPaths: number;
  totalLearningTime: number;
  streakDays: number;
  badges: number[];
}

const InteractiveLearningHub: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();

  const [learnerStats, setLearnerStats] = useState<LearnerStats | null>(null);
  const [learningModules, setLearningModules] = useState<LearningModule[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration
  const mockModules: LearningModule[] = [
    {
      id: 1,
      title: "Introduction to Blockchain",
      description: "Learn the fundamentals of blockchain technology, including consensus mechanisms, cryptography, and distributed systems.",
      category: "blockchain",
      difficulty: 1,
      estimatedDuration: 30,
      requiredScore: 80,
      isCompleted: false,
      progress: 0,
      xpReward: 100,
      rewardAmount: 50,
      prerequisites: [],
      learningObjectives: [
        "Understand what blockchain is",
        "Learn about consensus mechanisms",
        "Explore cryptography basics"
      ]
    },
    {
      id: 2,
      title: "Smart Contract Development",
      description: "Master Solidity programming and smart contract deployment on Ethereum and Avalanche networks.",
      category: "blockchain",
      difficulty: 3,
      estimatedDuration: 120,
      requiredScore: 85,
      isCompleted: false,
      progress: 0,
      xpReward: 300,
      rewardAmount: 150,
      prerequisites: [1],
      learningObjectives: [
        "Write Solidity contracts",
        "Understand gas optimization",
        "Deploy contracts to testnet"
      ]
    },
    {
      id: 3,
      title: "DeFi Fundamentals",
      description: "Explore decentralized finance protocols, liquidity pools, yield farming, and automated market makers.",
      category: "defi",
      difficulty: 2,
      estimatedDuration: 90,
      requiredScore: 75,
      isCompleted: false,
      progress: 0,
      xpReward: 250,
      rewardAmount: 125,
      prerequisites: [1],
      learningObjectives: [
        "Understand AMMs",
        "Learn about yield farming",
        "Explore lending protocols"
      ]
    },
    {
      id: 4,
      title: "Avalanche Network Deep Dive",
      description: "Comprehensive guide to Avalanche's unique consensus mechanism, subnets, and ecosystem.",
      category: "avalanche",
      difficulty: 4,
      estimatedDuration: 150,
      requiredScore: 90,
      isCompleted: false,
      progress: 0,
      xpReward: 500,
      rewardAmount: 250,
      prerequisites: [1, 2],
      learningObjectives: [
        "Understand Avalanche consensus",
        "Learn about subnets",
        "Explore ecosystem projects"
      ]
    },
    {
      id: 5,
      title: "Reactive Network Integration",
      description: "Learn how to build applications that respond to cross-chain events using Reactive Network.",
      category: "reactive",
      difficulty: 5,
      estimatedDuration: 180,
      requiredScore: 95,
      isCompleted: false,
      progress: 0,
      xpReward: 750,
      rewardAmount: 375,
      prerequisites: [1, 2, 4],
      learningObjectives: [
        "Understand Reactive contracts",
        "Build event-driven applications",
        "Implement cross-chain automation"
      ]
    }
  ];

  const mockPaths: LearningPath[] = [
    {
      id: 1,
      name: "Blockchain Developer Path",
      description: "Complete journey from blockchain basics to advanced smart contract development.",
      modules: mockModules.slice(0, 2),
      totalXp: 400,
      completionBonus: 200,
      progress: 0
    },
    {
      id: 2,
      name: "DeFi Specialist Path",
      description: "Master decentralized finance protocols and yield optimization strategies.",
      modules: [mockModules[0], mockModules[2]],
      totalXp: 350,
      completionBonus: 175,
      progress: 0
    },
    {
      id: 3,
      name: "Avalanche Ecosystem Expert",
      description: "Become an expert in Avalanche network and its growing ecosystem.",
      modules: [mockModules[0], mockModules[1], mockModules[3]],
      totalXp: 900,
      completionBonus: 450,
      progress: 0
    },
    {
      id: 4,
      name: "Reactive Network Pioneer",
      description: "Pioneer the future of event-driven blockchain applications.",
      modules: mockModules,
      totalXp: 1900,
      completionBonus: 950,
      progress: 0
    }
  ];

  const mockBadges: Badge[] = [
    {
      id: 1,
      name: "First Steps",
      description: "Complete your first learning module",
      imageUri: "/badges/first-steps.png",
      requirement: 1,
      requirementType: "modules",
      isEarned: false
    },
    {
      id: 2,
      name: "Knowledge Seeker",
      description: "Complete 5 learning modules",
      imageUri: "/badges/knowledge-seeker.png",
      requirement: 5,
      requirementType: "modules",
      isEarned: false
    },
    {
      id: 3,
      name: "Streak Master",
      description: "Maintain a 7-day learning streak",
      imageUri: "/badges/streak-master.png",
      requirement: 7,
      requirementType: "streak",
      isEarned: false
    },
    {
      id: 4,
      name: "Avalanche Expert",
      description: "Complete all Avalanche-related modules",
      imageUri: "/badges/avalanche-expert.png",
      requirement: 3,
      requirementType: "category",
      isEarned: false
    }
  ];

  const categories = ["all", "blockchain", "defi", "nft", "avalanche", "reactive"];
  const difficulties = [0, 1, 2, 3, 4, 5];

  useEffect(() => {
    if (isConnected && address) {
      loadLearnerData();
    }
  }, [isConnected, address]);

  const loadLearnerData = useCallback(async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch from the smart contract
      // For now, we'll use mock data
      setLearnerStats({
        totalXp: 1250,
        level: 3,
        completedModules: 2,
        completedPaths: 1,
        totalLearningTime: 7200, // 2 hours in seconds
        streakDays: 5,
        badges: [1, 2]
      });

      setLearningModules(mockModules);
      setLearningPaths(mockPaths);
      setBadges(mockBadges);
    } catch (error) {
      console.error('Error loading learner data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  const startModule = useCallback(async (moduleId: number) => {
    if (!isConnected) return;

    try {
      // In a real implementation, this would trigger the learning module
      console.log(`Starting module ${moduleId}`);
      
      // Simulate starting a learning session
      // This would integrate with your learning platform
    } catch (error) {
      console.error('Error starting module:', error);
    }
  }, [isConnected]);

  const getDifficultyColor = (difficulty: number) => {
    const colors = [
      'bg-gray-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-orange-500',
      'bg-red-500',
      'bg-purple-500'
    ];
    return colors[difficulty] || colors[0];
  };

  const getDifficultyText = (difficulty: number) => {
    const texts = ['', 'Beginner', 'Easy', 'Medium', 'Hard', 'Expert'];
    return texts[difficulty] || '';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      blockchain: <Code className="w-4 h-4" />,
      defi: <TrendingUp className="w-4 h-4" />,
      nft: <Star className="w-4 h-4" />,
      avalanche: <Zap className="w-4 h-4" />,
      reactive: <Brain className="w-4 h-4" />
    };
    return icons[category as keyof typeof icons] || <BookOpen className="w-4 h-4" />;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const filteredModules = learningModules.filter(module => {
    const categoryMatch = selectedCategory === "all" || module.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 0 || module.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-gray-800 text-white border-gray-700">
          <CardContent className="p-8 text-center">
            <BookOpen className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-300 mb-6">
              Connect your wallet to start your gamified learning journey with Reactive Network!
            </p>
            <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Interactive Learning Hub
          </h1>
          <p className="text-xl text-gray-300">
            Learn blockchain technology with Reactive Network automation and earn rewards!
          </p>
        </motion.div>

        {/* Learner Stats */}
        {learnerStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total XP</p>
                    <p className="text-3xl font-bold">{learnerStats.totalXp.toLocaleString()}</p>
                  </div>
                  <Trophy className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Level</p>
                    <p className="text-3xl font-bold">{learnerStats.level}</p>
                  </div>
                  <Star className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-600 to-green-700 border-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Modules Completed</p>
                    <p className="text-3xl font-bold">{learnerStats.completedModules}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-600 to-orange-700 border-orange-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Learning Streak</p>
                    <p className="text-3xl font-bold flex items-center">
                      <Flame className="w-6 h-6 mr-1" />
                      {learnerStats.streakDays}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="modules" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
            <TabsTrigger value="modules" className="data-[state=active]:bg-blue-600">
              <BookOpen className="w-4 h-4 mr-2" />
              Modules
            </TabsTrigger>
            <TabsTrigger value="paths" className="data-[state=active]:bg-purple-600">
              <Target className="w-4 h-4 mr-2" />
              Learning Paths
            </TabsTrigger>
            <TabsTrigger value="badges" className="data-[state=active]:bg-green-600">
              <Award className="w-4 h-4 mr-2" />
              Badges
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-orange-600">
              <Users className="w-4 h-4 mr-2" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          {/* Modules Tab */}
          <TabsContent value="modules" className="space-y-6">
            {/* Filters */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium">Category:</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white rounded px-3 py-1"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium">Difficulty:</label>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(Number(e.target.value))}
                      className="bg-gray-700 border-gray-600 text-white rounded px-3 py-1"
                    >
                      <option value={0}>All</option>
                      {[1, 2, 3, 4, 5].map(difficulty => (
                        <option key={difficulty} value={difficulty}>
                          {getDifficultyText(difficulty)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredModules.map((module) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-colors h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(module.category)}
                          <Badge className={`${getDifficultyColor(module.difficulty)} text-white`}>
                            {getDifficultyText(module.difficulty)}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1 text-yellow-400">
                          <Coins className="w-4 h-4" />
                          <span className="text-sm">{module.xpReward} XP</span>
                        </div>
                      </div>
                      <CardTitle className="text-xl">{module.title}</CardTitle>
                      <CardDescription className="text-gray-300">
                        {module.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{module.estimatedDuration}m</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Target className="w-4 h-4" />
                            <span>{module.requiredScore}% required</span>
                          </div>
                        </div>
                        
                        {module.progress > 0 && (
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{module.progress}%</span>
                            </div>
                            <Progress value={module.progress} className="h-2" />
                          </div>
                        )}

                        <div>
                          <p className="text-sm font-medium mb-2">Learning Objectives:</p>
                          <ul className="text-xs text-gray-300 space-y-1">
                            {module.learningObjectives.slice(0, 2).map((objective, index) => (
                              <li key={index} className="flex items-center">
                                <ChevronRight className="w-3 h-3 mr-1" />
                                {objective}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        onClick={() => startModule(module.id)}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        disabled={module.isCompleted}
                      >
                        {module.isCompleted ? (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        ) : (
                          <Play className="w-4 h-4 mr-2" />
                        )}
                        {module.isCompleted ? 'Completed' : 'Start Learning'}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Learning Paths Tab */}
          <TabsContent value="paths" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockPaths.map((path) => (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="bg-gray-800 border-gray-700 hover:border-purple-500 transition-colors h-full">
                    <CardHeader>
                      <CardTitle className="text-2xl flex items-center">
                        <Target className="w-6 h-6 mr-2 text-purple-400" />
                        {path.name}
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        {path.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Modules in Path:</span>
                          <span className="font-semibold">{path.modules.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Total XP Reward:</span>
                          <span className="font-semibold text-yellow-400">{path.totalXp}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Completion Bonus:</span>
                          <span className="font-semibold text-green-400">{path.completionBonus} RUSH</span>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{path.progress}%</span>
                          </div>
                          <Progress value={path.progress} className="h-2" />
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-2">Modules:</p>
                          <div className="space-y-1">
                            {path.modules.map((module) => (
                              <div key={module.id} className="flex items-center justify-between text-xs">
                                <span className="flex items-center">
                                  {module.isCompleted ? (
                                    <CheckCircle className="w-3 h-3 mr-1 text-green-400" />
                                  ) : (
                                    <Lock className="w-3 h-3 mr-1 text-gray-400" />
                                  )}
                                  {module.title}
                                </span>
                                <span className="text-yellow-400">{module.xpReward} XP</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                        disabled={path.progress === 100}
                      >
                        {path.progress === 100 ? 'Path Completed!' : 'Start Learning Path'}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {mockBadges.map((badge) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className={`bg-gray-800 border-gray-700 h-full ${
                    badge.isEarned ? 'border-yellow-500 bg-gradient-to-br from-yellow-900/20 to-yellow-800/20' : ''
                  }`}>
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                        <Award className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">{badge.name}</h3>
                      <p className="text-sm text-gray-300 mb-4">{badge.description}</p>
                      <div className="text-xs">
                        <p className="text-gray-400">
                          {badge.requirementType === 'modules' && `Complete ${badge.requirement} modules`}
                          {badge.requirementType === 'streak' && `${badge.requirement}-day streak`}
                          {badge.requirementType === 'category' && `Complete ${badge.requirement} category modules`}
                        </p>
                      </div>
                      {badge.isEarned && (
                        <Badge className="mt-2 bg-yellow-500 text-black">
                          Earned!
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-6 h-6 mr-2 text-orange-400" />
                  Learning Leaderboard
                </CardTitle>
                <CardDescription>
                  Compete with other learners and climb the ranks!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Mock leaderboard data */}
                  {[
                    { rank: 1, name: "BlockchainMaster", xp: 15420, level: 8, streak: 15 },
                    { rank: 2, name: "DeFiWizard", xp: 12890, level: 7, streak: 12 },
                    { rank: 3, name: "AvalancheExpert", xp: 11250, level: 6, streak: 8 },
                    { rank: 4, name: "SmartContractDev", xp: 9870, level: 6, streak: 5 },
                    { rank: 5, name: "CryptoLearner", xp: 8450, level: 5, streak: 3 }
                  ].map((learner) => (
                    <div key={learner.rank} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          learner.rank <= 3 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-black' : 'bg-gray-600'
                        }`}>
                          {learner.rank}
                        </div>
                        <div>
                          <p className="font-semibold">{learner.name}</p>
                          <p className="text-sm text-gray-300">Level {learner.level}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-yellow-400">{learner.xp.toLocaleString()} XP</p>
                        <p className="text-sm text-gray-300 flex items-center">
                          <Flame className="w-3 h-3 mr-1" />
                          {learner.streak} days
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InteractiveLearningHub;
