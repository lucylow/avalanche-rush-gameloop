import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccount, useReadContract } from 'wagmi';
import { 
  Users, 
  MessageCircle, 
  Trophy, 
  Star, 
  Heart,
  Share2,
  Bookmark,
  Clock,
  Target,
  Zap,
  Award,
  TrendingUp,
  UserPlus,
  Search,
  Filter,
  Crown,
  Flame,
  Coins,
  Lock
} from 'lucide-react';

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  maxMembers: number;
  isPrivate: boolean;
  creator: {
    name: string;
    avatar: string;
    level: number;
  };
  createdAt: Date;
  lastActivity: Date;
  tags: string[];
  difficulty: number;
  modules: string[];
}

interface LearningChallenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: number;
  participants: number;
  prize: number;
  deadline: Date;
  creator: {
    name: string;
    avatar: string;
    level: number;
  };
  isJoined: boolean;
  progress: number;
}

interface DiscussionPost {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    level: number;
  };
  category: string;
  likes: number;
  comments: number;
  createdAt: Date;
  tags: string[];
  isLiked: boolean;
  isBookmarked: boolean;
}

interface LeaderboardEntry {
  rank: number;
  user: {
    name: string;
    avatar: string;
    level: number;
  };
  xp: number;
  streak: number;
  badges: number;
  category: string;
  isCurrentUser: boolean;
}

const SocialLearningHub: React.FC = () => {
  const { address, isConnected } = useAccount();
  
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [challenges, setChallenges] = useState<LearningChallenge[]>([]);
  const [discussions, setDiscussions] = useState<DiscussionPost[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data
  const mockStudyGroups: StudyGroup[] = [
    {
      id: '1',
      name: 'Avalanche Developers',
      description: 'Building the future on Avalanche network. Learn smart contracts, subnets, and DeFi protocols.',
      category: 'avalanche',
      memberCount: 24,
      maxMembers: 50,
      isPrivate: false,
      creator: {
        name: 'BlockchainMaster',
        avatar: '/avatars/blockchain-master.png',
        level: 8
      },
      createdAt: new Date('2024-01-15'),
      lastActivity: new Date('2024-01-29'),
      tags: ['smart-contracts', 'subnets', 'defi'],
      difficulty: 4,
      modules: ['Introduction to Avalanche', 'Subnet Development', 'DeFi Protocols']
    },
    {
      id: '2',
      name: 'DeFi Yield Farmers',
      description: 'Maximize your DeFi yields through advanced strategies and protocol analysis.',
      category: 'defi',
      memberCount: 18,
      maxMembers: 30,
      isPrivate: false,
      creator: {
        name: 'YieldWizard',
        avatar: '/avatars/yield-wizard.png',
        level: 7
      },
      createdAt: new Date('2024-01-20'),
      lastActivity: new Date('2024-01-29'),
      tags: ['yield-farming', 'liquidity', 'optimization'],
      difficulty: 3,
      modules: ['DeFi Basics', 'Yield Strategies', 'Risk Management']
    },
    {
      id: '3',
      name: 'Reactive Network Pioneers',
      description: 'Explore the cutting edge of event-driven blockchain applications with Reactive Network.',
      category: 'reactive',
      memberCount: 12,
      maxMembers: 25,
      isPrivate: true,
      creator: {
        name: 'ReactiveExpert',
        avatar: '/avatars/reactive-expert.png',
        level: 9
      },
      createdAt: new Date('2024-01-25'),
      lastActivity: new Date('2024-01-29'),
      tags: ['cross-chain', 'automation', 'events'],
      difficulty: 5,
      modules: ['Reactive Contracts', 'Event Processing', 'Cross-Chain Automation']
    }
  ];

  const mockChallenges: LearningChallenge[] = [
    {
      id: '1',
      title: '30-Day Solidity Mastery',
      description: 'Complete 10 Solidity modules and build a working DeFi protocol in 30 days.',
      category: 'blockchain',
      difficulty: 4,
      participants: 156,
      prize: 1000,
      deadline: new Date('2024-02-15'),
      creator: {
        name: 'SmartContractDev',
        avatar: '/avatars/smart-contract-dev.png',
        level: 6
      },
      isJoined: false,
      progress: 0
    },
    {
      id: '2',
      title: 'Avalanche Subnet Challenge',
      description: 'Create and deploy your own Avalanche subnet with custom rules.',
      category: 'avalanche',
      difficulty: 5,
      participants: 89,
      prize: 2000,
      deadline: new Date('2024-02-20'),
      creator: {
        name: 'SubnetBuilder',
        avatar: '/avatars/subnet-builder.png',
        level: 8
      },
      isJoined: true,
      progress: 35
    },
    {
      id: '3',
      title: 'DeFi Protocol Analysis',
      description: 'Analyze and compare 5 different DeFi protocols, create a comprehensive report.',
      category: 'defi',
      difficulty: 3,
      participants: 203,
      prize: 750,
      deadline: new Date('2024-02-10'),
      creator: {
        name: 'DeFiAnalyst',
        avatar: '/avatars/defi-analyst.png',
        level: 5
      },
      isJoined: false,
      progress: 0
    }
  ];

  const mockDiscussions: DiscussionPost[] = [
    {
      id: '1',
      title: 'Best Practices for Avalanche Smart Contract Security',
      content: 'I\'ve been working with Avalanche for a few months now and wanted to share some security best practices I\'ve learned...',
      author: {
        name: 'SecurityExpert',
        avatar: '/avatars/security-expert.png',
        level: 7
      },
      category: 'avalanche',
      likes: 42,
      comments: 18,
      createdAt: new Date('2024-01-28'),
      tags: ['security', 'smart-contracts', 'best-practices'],
      isLiked: false,
      isBookmarked: true
    },
    {
      id: '2',
      title: 'Reactive Network vs Traditional Oracles: A Comparison',
      content: 'After experimenting with both approaches, here\'s my analysis of when to use Reactive Network vs traditional oracle solutions...',
      author: {
        name: 'OracleGuru',
        avatar: '/avatars/oracle-guru.png',
        level: 6
      },
      category: 'reactive',
      likes: 28,
      comments: 12,
      createdAt: new Date('2024-01-27'),
      tags: ['oracles', 'comparison', 'automation'],
      isLiked: true,
      isBookmarked: false
    },
    {
      id: '3',
      title: 'Yield Farming Strategies That Actually Work in 2024',
      content: 'Sharing my research on current yield farming opportunities and strategies that have been profitable...',
      author: {
        name: 'YieldFarmer',
        avatar: '/avatars/yield-farmer.png',
        level: 5
      },
      category: 'defi',
      likes: 67,
      comments: 31,
      createdAt: new Date('2024-01-26'),
      tags: ['yield-farming', 'strategies', 'profitability'],
      isLiked: false,
      isBookmarked: true
    }
  ];

  const mockLeaderboard: LeaderboardEntry[] = [
    {
      rank: 1,
      user: {
        name: 'BlockchainMaster',
        avatar: '/avatars/blockchain-master.png',
        level: 8
      },
      xp: 15420,
      streak: 15,
      badges: 12,
      category: 'avalanche',
      isCurrentUser: false
    },
    {
      rank: 2,
      user: {
        name: 'DeFiWizard',
        avatar: '/avatars/defi-wizard.png',
        level: 7
      },
      xp: 12890,
      streak: 12,
      badges: 10,
      category: 'defi',
      isCurrentUser: false
    },
    {
      rank: 3,
      user: {
        name: 'ReactiveExpert',
        avatar: '/avatars/reactive-expert.png',
        level: 9
      },
      xp: 11250,
      streak: 8,
      badges: 8,
      category: 'reactive',
      isCurrentUser: true
    }
  ];

  const categories = ['all', 'blockchain', 'defi', 'nft', 'avalanche', 'reactive'];

  useEffect(() => {
    if (isConnected) {
      loadSocialData();
    }
  }, [isConnected]);

  const loadSocialData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate loading data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStudyGroups(mockStudyGroups);
      setChallenges(mockChallenges);
      setDiscussions(mockDiscussions);
      setLeaderboard(mockLeaderboard);
    } catch (error) {
      console.error('Error loading social data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const joinStudyGroup = useCallback(async (groupId: string) => {
    try {
      // In a real implementation, this would call the smart contract
      console.log(`Joining study group ${groupId}`);
      
      // Update local state
      setStudyGroups(prev => prev.map(group => 
        group.id === groupId 
          ? { ...group, memberCount: group.memberCount + 1 }
          : group
      ));
    } catch (error) {
      console.error('Error joining study group:', error);
    }
  }, []);

  const joinChallenge = useCallback(async (challengeId: string) => {
    try {
      console.log(`Joining challenge ${challengeId}`);
      
      setChallenges(prev => prev.map(challenge => 
        challenge.id === challengeId 
          ? { ...challenge, isJoined: true, participants: challenge.participants + 1 }
          : challenge
      ));
    } catch (error) {
      console.error('Error joining challenge:', error);
    }
  }, []);

  const likePost = useCallback(async (postId: string) => {
    try {
      setDiscussions(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              isLiked: !post.isLiked
            }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  }, []);

  const bookmarkPost = useCallback(async (postId: string) => {
    try {
      setDiscussions(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post
      ));
    } catch (error) {
      console.error('Error bookmarking post:', error);
    }
  }, []);

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'text-green-400';
    if (difficulty <= 3) return 'text-yellow-400';
    if (difficulty <= 4) return 'text-orange-400';
    return 'text-red-400';
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

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const filteredStudyGroups = studyGroups.filter(group => {
    const categoryMatch = selectedCategory === 'all' || group.category === selectedCategory;
    const searchMatch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       group.description.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-gray-800 text-white border-gray-700">
          <CardContent className="p-8 text-center">
            <Users className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Join the Learning Community</h2>
            <p className="text-gray-300 mb-6">
              Connect your wallet to join study groups, participate in challenges, and learn together!
            </p>
            <Button className="w-full bg-gradient-to-r from-green-500 to-blue-600">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            Social Learning Hub
          </h1>
          <p className="text-xl text-gray-300">
            Learn together, compete, and grow with the blockchain community
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search study groups, challenges, or discussions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white rounded px-3 py-2"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="groups" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
            <TabsTrigger value="groups" className="data-[state=active]:bg-green-600">
              <Users className="w-4 h-4 mr-2" />
              Study Groups
            </TabsTrigger>
            <TabsTrigger value="challenges" className="data-[state=active]:bg-blue-600">
              <Trophy className="w-4 h-4 mr-2" />
              Challenges
            </TabsTrigger>
            <TabsTrigger value="discussions" className="data-[state=active]:bg-purple-600">
              <MessageCircle className="w-4 h-4 mr-2" />
              Discussions
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-orange-600">
              <TrendingUp className="w-4 h-4 mr-2" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          {/* Study Groups Tab */}
          <TabsContent value="groups" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudyGroups.map((group) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-gray-800 border-gray-700 hover:border-green-500 transition-colors h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{getCategoryIcon(group.category)}</span>
                          <div>
                            <CardTitle className="text-lg">{group.name}</CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className="bg-gray-600 text-white">
                                {group.category}
                              </Badge>
                              <Badge className={`${getDifficultyColor(group.difficulty)} bg-transparent border`}>
                                Level {group.difficulty}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {group.isPrivate && (
                          <Lock className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <CardDescription className="text-gray-300">
                        {group.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>Members</span>
                          <span>{group.memberCount}/{group.maxMembers}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Last Activity</span>
                          <span>{formatDate(group.lastActivity)}</span>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium mb-2">Tags:</p>
                          <div className="flex flex-wrap gap-1">
                            {group.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-1">Creator:</p>
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={group.creator.avatar} />
                              <AvatarFallback>{group.creator.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{group.creator.name}</span>
                            <Badge className="bg-blue-600 text-white text-xs">
                              L{group.creator.level}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        onClick={() => joinStudyGroup(group.id)}
                        className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                        disabled={group.memberCount >= group.maxMembers}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        {group.memberCount >= group.maxMembers ? 'Full' : 'Join Group'}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="space-y-6">
            <div className="space-y-6">
              {challenges.map((challenge) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <span className="text-3xl">{getCategoryIcon(challenge.category)}</span>
                            <div>
                              <h3 className="text-2xl font-bold">{challenge.title}</h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge className="bg-gray-600 text-white">
                                  {challenge.category}
                                </Badge>
                                <Badge className={`${getDifficultyColor(challenge.difficulty)} bg-transparent border`}>
                                  Level {challenge.difficulty}
                                </Badge>
                                <Badge className="bg-yellow-600 text-white">
                                  <Coins className="w-3 h-3 mr-1" />
                                  {challenge.prize} RUSH
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-gray-300 mb-4">{challenge.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-400">
                                {challenge.participants}
                              </div>
                              <div className="text-sm text-gray-300">Participants</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-yellow-400">
                                {challenge.prize}
                              </div>
                              <div className="text-sm text-gray-300">Prize Pool</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-red-400">
                                {Math.ceil((challenge.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
                              </div>
                              <div className="text-sm text-gray-300">Days Left</div>
                            </div>
                          </div>

                          {challenge.isJoined && challenge.progress > 0 && (
                            <div className="mb-4">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Your Progress</span>
                                <span>{challenge.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${challenge.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={challenge.creator.avatar} />
                                <AvatarFallback>{challenge.creator.name[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{challenge.creator.name}</p>
                                <p className="text-xs text-gray-400">Level {challenge.creator.level}</p>
                              </div>
                            </div>
                            
                            <Button
                              onClick={() => joinChallenge(challenge.id)}
                              className={`${
                                challenge.isJoined 
                                  ? 'bg-green-600 hover:bg-green-700' 
                                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                              }`}
                            >
                              {challenge.isJoined ? (
                                <>
                                  <Target className="w-4 h-4 mr-2" />
                                  Continue Challenge
                                </>
                              ) : (
                                <>
                                  <Trophy className="w-4 h-4 mr-2" />
                                  Join Challenge
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Discussions Tab */}
          <TabsContent value="discussions" className="space-y-6">
            <div className="space-y-6">
              {discussions.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="bg-gray-800 border-gray-700 hover:border-purple-500 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={post.author.avatar} />
                          <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-xl font-bold">{post.title}</h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-sm text-gray-300">{post.author.name}</span>
                                <Badge className="bg-blue-600 text-white text-xs">
                                  L{post.author.level}
                                </Badge>
                                <span className="text-sm text-gray-400">•</span>
                                <span className="text-sm text-gray-400">{formatDate(post.createdAt)}</span>
                              </div>
                            </div>
                            <Badge className="bg-gray-600 text-white">
                              {post.category}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-300 mb-4">{post.content}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <button
                                onClick={() => likePost(post.id)}
                                className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-colors ${
                                  post.isLiked 
                                    ? 'bg-red-600 text-white' 
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                              >
                                <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                                <span>{post.likes}</span>
                              </button>
                              
                              <button className="flex items-center space-x-1 px-3 py-1 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors">
                                <MessageCircle className="w-4 h-4" />
                                <span>{post.comments}</span>
                              </button>
                              
                              <button
                                onClick={() => bookmarkPost(post.id)}
                                className={`p-1 rounded-full transition-colors ${
                                  post.isBookmarked 
                                    ? 'bg-yellow-600 text-white' 
                                    : 'text-gray-400 hover:text-yellow-400'
                                }`}
                              >
                                <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
                              </button>
                              
                              <button className="p-1 rounded-full text-gray-400 hover:text-blue-400 transition-colors">
                                <Share2 className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <div className="flex flex-wrap gap-1">
                              {post.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
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
                  <Trophy className="w-6 h-6 mr-2 text-yellow-400" />
                  Learning Leaderboard
                </CardTitle>
                <CardDescription>
                  Top learners in the community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard.map((entry) => (
                    <div 
                      key={entry.rank}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        entry.isCurrentUser 
                          ? 'bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500' 
                          : 'bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          entry.rank <= 3 
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-black' 
                            : 'bg-gray-600'
                        }`}>
                          {entry.rank <= 3 && <Crown className="w-5 h-5" />}
                          {entry.rank > 3 && entry.rank}
                        </div>
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={entry.user.avatar} />
                          <AvatarFallback>{entry.user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold flex items-center">
                            {entry.user.name}
                            {entry.isCurrentUser && <Badge className="ml-2 bg-purple-600">You</Badge>}
                          </p>
                          <p className="text-sm text-gray-300">Level {entry.user.level}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-yellow-400">{entry.xp.toLocaleString()} XP</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-300">
                          <span className="flex items-center">
                            <Flame className="w-3 h-3 mr-1" />
                            {entry.streak} days
                          </span>
                          <span className="flex items-center">
                            <Award className="w-3 h-3 mr-1" />
                            {entry.badges} badges
                          </span>
                          <Badge className="bg-gray-600 text-white">
                            {entry.category}
                          </Badge>
                        </div>
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

export default SocialLearningHub;
