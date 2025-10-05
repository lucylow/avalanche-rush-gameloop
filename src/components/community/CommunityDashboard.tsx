// Community Features and Governance System
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Users, 
  Plus, 
  Vote, 
  MessageSquare, 
  Star, 
  TrendingUp,
  Award,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  Share2,
  BookOpen,
  Code,
  Palette,
  Zap,
  Globe,
  Shield,
  Crown,
  Heart,
  Flag
} from 'lucide-react';

// Community Types
interface CommunityProject {
  id: string;
  title: string;
  description: string;
  creator: string;
  category: 'educational' | 'game' | 'tool' | 'art' | 'governance';
  status: 'draft' | 'active' | 'completed' | 'archived';
  votes: number;
  contributors: string[];
  createdAt: number;
  updatedAt: number;
  tags: string[];
  githubUrl?: string;
  demoUrl?: string;
  imageUrl?: string;
}

interface GovernanceProposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  category: 'feature' | 'economy' | 'governance' | 'community';
  status: 'draft' | 'active' | 'passed' | 'rejected' | 'executed';
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  quorum: number;
  startTime: number;
  endTime: number;
  createdAt: number;
  executionData?: string;
}

interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  creator: string;
  type: 'coding' | 'design' | 'writing' | 'research' | 'community';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  reward: number;
  participants: string[];
  submissions: Array<{
    id: string;
    submitter: string;
    content: string;
    votes: number;
    createdAt: number;
  }>;
  deadline: number;
  status: 'active' | 'voting' | 'completed';
}

interface UserProfile {
  address: string;
  username: string;
  avatar?: string;
  bio?: string;
  skills: string[];
  badges: string[];
  reputation: number;
  contributions: number;
  projects: string[];
  joinedAt: number;
}

// Community Dashboard Component
export const CommunityDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState<CommunityProject[]>([]);
  const [proposals, setProposals] = useState<GovernanceProposal[]>([]);
  const [challenges, setChallenges] = useState<CommunityChallenge[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      setProjects([
        {
          id: '1',
          title: 'Avalanche DeFi Tutorial Series',
          description: 'Comprehensive tutorial series covering DeFi protocols on Avalanche',
          creator: '0x1234...5678',
          category: 'educational',
          status: 'active',
          votes: 156,
          contributors: ['0x1234...5678', '0x8765...4321'],
          createdAt: Date.now() - 86400000 * 7,
          updatedAt: Date.now() - 86400000 * 2,
          tags: ['DeFi', 'Tutorial', 'Avalanche'],
          githubUrl: 'https://github.com/example/defi-tutorials',
          demoUrl: 'https://demo.example.com'
        },
        {
          id: '2',
          title: 'NFT Marketplace Integration',
          description: 'Integrate NFT marketplace functionality into the game',
          creator: '0x8765...4321',
          category: 'game',
          status: 'active',
          votes: 89,
          contributors: ['0x8765...4321'],
          createdAt: Date.now() - 86400000 * 5,
          updatedAt: Date.now() - 86400000 * 1,
          tags: ['NFT', 'Marketplace', 'Integration'],
          githubUrl: 'https://github.com/example/nft-marketplace'
        }
      ]);

      setProposals([
        {
          id: '1',
          title: 'Increase RUSH Token Rewards for Educational Modules',
          description: 'Proposal to increase token rewards for completing educational modules to incentivize learning',
          proposer: '0x1234...5678',
          category: 'economy',
          status: 'active',
          votesFor: 234,
          votesAgainst: 45,
          totalVotes: 279,
          quorum: 200,
          startTime: Date.now() - 86400000 * 3,
          endTime: Date.now() + 86400000 * 4,
          createdAt: Date.now() - 86400000 * 5
        },
        {
          id: '2',
          title: 'Add New Career Path: Blockchain Security',
          description: 'Add a new career path focused on blockchain security and auditing',
          proposer: '0x8765...4321',
          category: 'feature',
          status: 'passed',
          votesFor: 189,
          votesAgainst: 23,
          totalVotes: 212,
          quorum: 200,
          startTime: Date.now() - 86400000 * 10,
          endTime: Date.now() - 86400000 * 3,
          createdAt: Date.now() - 86400000 * 12
        }
      ]);

      setChallenges([
        {
          id: '1',
          title: 'Design New Character Artwork',
          description: 'Create original character artwork for the game',
          creator: '0x1234...5678',
          type: 'design',
          difficulty: 'intermediate',
          reward: 500,
          participants: ['0x1111...2222', '0x3333...4444'],
          submissions: [
            {
              id: '1',
              submitter: '0x1111...2222',
              content: 'Character design submission',
              votes: 12,
              createdAt: Date.now() - 86400000 * 2
            }
          ],
          deadline: Date.now() + 86400000 * 7,
          status: 'active'
        }
      ]);

      setUserProfile({
        address: '0x1234...5678',
        username: 'Web3Developer',
        bio: 'Passionate about blockchain education and DeFi',
        skills: ['Solidity', 'React', 'DeFi'],
        badges: ['DeFi Expert', 'Community Contributor'],
        reputation: 1250,
        contributions: 15,
        projects: ['1', '2'],
        joinedAt: Date.now() - 86400000 * 30
      });
    } catch (error) {
      console.error('Error loading community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'educational': return <BookOpen className="h-4 w-4" />;
      case 'game': return <Zap className="h-4 w-4" />;
      case 'tool': return <Code className="h-4 w-4" />;
      case 'art': return <Palette className="h-4 w-4" />;
      case 'governance': return <Shield className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'draft': return 'bg-gray-500';
      case 'completed': return 'bg-blue-500';
      case 'passed': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Users className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-white text-xl">Loading Community...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              <Users className="inline-block mr-3 h-10 w-10" />
              Community Hub
            </h1>
            <p className="text-xl text-gray-300">
              Collaborate, create, and govern the future of Avalanche Rush
            </p>
          </div>
          <div className="flex gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-600">
                <DialogHeader>
                  <DialogTitle className="text-white">Create New Project</DialogTitle>
                  <DialogDescription className="text-gray-300">
                    Share your ideas with the community
                  </DialogDescription>
                </DialogHeader>
                <CreateProjectForm />
              </DialogContent>
            </Dialog>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="text-white border-slate-600">
                  <Vote className="h-4 w-4 mr-2" />
                  Submit Proposal
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-600">
                <DialogHeader>
                  <DialogTitle className="text-white">Submit Governance Proposal</DialogTitle>
                  <DialogDescription className="text-gray-300">
                    Propose changes to the platform
                  </DialogDescription>
                </DialogHeader>
                <CreateProposalForm />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* User Profile Card */}
        {userProfile && (
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-blue-500 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{userProfile.username}</h3>
                    <p className="text-blue-100">{userProfile.bio}</p>
                    <div className="flex gap-2 mt-2">
                      {userProfile.badges.map((badge) => (
                        <Badge key={badge} variant="secondary" className="bg-white text-blue-600">
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{userProfile.reputation}</div>
                  <div className="text-blue-100">Reputation</div>
                  <div className="text-sm text-blue-200 mt-2">
                    {userProfile.contributions} contributions
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="governance" className="flex items-center gap-2">
              <Vote className="h-4 w-4" />
              Governance
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Challenges
            </TabsTrigger>
            <TabsTrigger value="discussions" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Discussions
            </TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="bg-slate-800 border-slate-600">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(project.category)}
                        <div>
                          <CardTitle className="text-white">{project.title}</CardTitle>
                          <p className="text-gray-400 text-sm">{formatTimeAgo(project.createdAt)}</p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(project.status)} text-white`}>
                        {project.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-300">{project.description}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-gray-400 border-gray-600">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          {project.votes}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {project.contributors.length}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-white border-slate-600">
                          <Heart className="h-4 w-4 mr-1" />
                          Vote
                        </Button>
                        <Button size="sm" variant="outline" className="text-white border-slate-600">
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Governance Tab */}
          <TabsContent value="governance" className="space-y-6">
            <div className="space-y-6">
              {proposals.map((proposal) => (
                <Card key={proposal.id} className="bg-slate-800 border-slate-600">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white">{proposal.title}</CardTitle>
                        <p className="text-gray-400 text-sm">
                          Proposed by {proposal.proposer} • {formatTimeAgo(proposal.createdAt)}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(proposal.status)} text-white`}>
                        {proposal.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-300">{proposal.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-700 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-green-400">Votes For</span>
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">{proposal.votesFor}</div>
                      </div>
                      <div className="bg-slate-700 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-red-400">Votes Against</span>
                          <XCircle className="h-4 w-4 text-red-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">{proposal.votesAgainst}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-400">
                        <Clock className="inline-block h-4 w-4 mr-1" />
                        {proposal.status === 'active' 
                          ? `Ends in ${Math.ceil((proposal.endTime - Date.now()) / (1000 * 60 * 60 * 24))} days`
                          : 'Voting ended'
                        }
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-white border-slate-600">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Vote For
                        </Button>
                        <Button size="sm" variant="outline" className="text-white border-slate-600">
                          <ThumbsDown className="h-4 w-4 mr-1" />
                          Vote Against
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {challenges.map((challenge) => (
                <Card key={challenge.id} className="bg-slate-800 border-slate-600">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white">{challenge.title}</CardTitle>
                        <p className="text-gray-400 text-sm">
                          Created by {challenge.creator}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(challenge.status)} text-white`}>
                        {challenge.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-300">{challenge.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4" />
                          {challenge.reward} RUSH
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {challenge.participants.length} participants
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {challenge.submissions.length} submissions
                        </div>
                      </div>
                      <Badge variant="outline" className="text-gray-400 border-gray-600">
                        {challenge.difficulty}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-400">
                        <Calendar className="inline-block h-4 w-4 mr-1" />
                        Deadline: {new Date(challenge.deadline).toLocaleDateString()}
                      </div>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="h-4 w-4 mr-1" />
                        Participate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Discussions Tab */}
          <TabsContent value="discussions" className="space-y-6">
            <Card className="bg-slate-800 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">Community Discussions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Discussions coming soon!</p>
                  <p className="text-gray-500 text-sm">
                    Community discussions and forums will be available in the next update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Create Project Form Component
const CreateProjectForm: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'educational',
    tags: '',
    githubUrl: '',
    demoUrl: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Creating project:', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter project title"
          className="bg-slate-700 border-slate-600 text-white"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe your project"
          className="bg-slate-700 border-slate-600 text-white"
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Tags (comma-separated)</label>
        <Input
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="DeFi, Tutorial, Avalanche"
          className="bg-slate-700 border-slate-600 text-white"
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
          Create Project
        </Button>
        <Button type="button" variant="outline" className="text-white border-slate-600">
          Cancel
        </Button>
      </div>
    </form>
  );
};

// Create Proposal Form Component
const CreateProposalForm: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'feature',
    executionData: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Creating proposal:', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter proposal title"
          className="bg-slate-700 border-slate-600 text-white"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe your proposal"
          className="bg-slate-700 border-slate-600 text-white"
          rows={6}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Execution Data (Optional)</label>
        <Textarea
          value={formData.executionData}
          onChange={(e) => setFormData({ ...formData, executionData: e.target.value })}
          placeholder="Technical implementation details"
          className="bg-slate-700 border-slate-600 text-white"
          rows={3}
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
          Submit Proposal
        </Button>
        <Button type="button" variant="outline" className="text-white border-slate-600">
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default CommunityDashboard;
