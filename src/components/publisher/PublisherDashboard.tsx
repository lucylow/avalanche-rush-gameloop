import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  Share2,
  TrendingUp,
  Award,
  Coins,
  Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Quest {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  reward: number;
  status: 'draft' | 'published' | 'archived';
  participants: number;
  completions: number;
  revenue: number;
  createdAt: string;
}

interface PublisherStats {
  totalQuests: number;
  totalParticipants: number;
  totalRevenue: number;
  monthlyRevenue: number;
  completionRate: number;
  averageRating: number;
}

const PublisherDashboard: React.FC = () => {
  const [stats, setStats] = useState<PublisherStats>({
    totalQuests: 0,
    totalParticipants: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    completionRate: 0,
    averageRating: 0
  });
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isCreatingQuest, setIsCreatingQuest] = useState(false);
  const [newQuest, setNewQuest] = useState({
    title: '',
    description: '',
    difficulty: 'medium' as const,
    reward: 100
  });
  const [activeTab, setActiveTab] = useState('overview');

  const { user } = useAuth();

  useEffect(() => {
    // Load publisher data
    loadPublisherData();
  }, []);

  const loadPublisherData = async () => {
    // Simulate API call
    setStats({
      totalQuests: 12,
      totalParticipants: 1250,
      totalRevenue: 2450.75,
      monthlyRevenue: 320.50,
      completionRate: 78.5,
      averageRating: 4.6
    });

    setQuests([
      {
        id: '1',
        title: 'DeFi Basics Challenge',
        description: 'Learn the fundamentals of decentralized finance',
        difficulty: 'easy',
        reward: 50,
        status: 'published',
        participants: 450,
        completions: 380,
        revenue: 125.50,
        createdAt: '2024-01-15'
      },
      {
        id: '2',
        title: 'Smart Contract Security',
        description: 'Advanced security patterns in Solidity',
        difficulty: 'hard',
        reward: 200,
        status: 'published',
        participants: 180,
        completions: 95,
        revenue: 89.25,
        createdAt: '2024-01-10'
      },
      {
        id: '3',
        title: 'Avalanche Subnet Creation',
        description: 'Build your own Avalanche subnet',
        difficulty: 'medium',
        reward: 150,
        status: 'draft',
        participants: 0,
        completions: 0,
        revenue: 0,
        createdAt: '2024-01-20'
      }
    ]);
  };

  const handleCreateQuest = async () => {
    if (!newQuest.title || !newQuest.description) {
      return;
    }

    const quest: Quest = {
      id: Date.now().toString(),
      ...newQuest,
      status: 'draft',
      participants: 0,
      completions: 0,
      revenue: 0,
      createdAt: new Date().toISOString()
    };

    setQuests(prev => [quest, ...prev]);
    setNewQuest({
      title: '',
      description: '',
      difficulty: 'medium',
      reward: 100
    });
    setIsCreatingQuest(false);
  };

  const handlePublishQuest = (questId: string) => {
    setQuests(prev => prev.map(quest => 
      quest.id === questId 
        ? { ...quest, status: 'published' as const }
        : quest
    ));
  };

  const handleArchiveQuest = (questId: string) => {
    setQuests(prev => prev.map(quest => 
      quest.id === questId 
        ? { ...quest, status: 'archived' as const }
        : quest
    ));
  };

  const handleDeleteQuest = (questId: string) => {
    setQuests(prev => prev.filter(quest => quest.id !== questId));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Quests</p>
                <p className="text-2xl font-bold">{stats.totalQuests}</p>
              </div>
              <Award className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Participants</p>
                <p className="text-2xl font-bold">{stats.totalParticipants.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{stats.completionRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Revenue chart will be displayed here</p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Plus className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">New quest published</p>
                  <p className="text-sm text-muted-foreground">DeFi Basics Challenge</p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">2 hours ago</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">50 new participants</p>
                  <p className="text-sm text-muted-foreground">Smart Contract Security quest</p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">5 hours ago</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Coins className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">$125.50 earned</p>
                  <p className="text-sm text-muted-foreground">From quest completions</p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">1 day ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderQuests = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Quests</h2>
        <Button onClick={() => setIsCreatingQuest(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Quest
        </Button>
      </div>

      {isCreatingQuest && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Quest</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Quest Title</Label>
              <Input
                id="title"
                value={newQuest.title}
                onChange={(e) => setNewQuest(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter quest title"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newQuest.description}
                onChange={(e) => setNewQuest(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your quest"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <select
                  id="difficulty"
                  value={newQuest.difficulty}
                  onChange={(e) => setNewQuest(prev => ({ ...prev, difficulty: e.target.value as any }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <Label htmlFor="reward">Reward (RUSH)</Label>
                <Input
                  id="reward"
                  type="number"
                  value={newQuest.reward}
                  onChange={(e) => setNewQuest(prev => ({ ...prev, reward: parseInt(e.target.value) }))}
                  placeholder="100"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateQuest}>Create Quest</Button>
              <Button variant="outline" onClick={() => setIsCreatingQuest(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {quests.map((quest) => (
          <Card key={quest.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{quest.title}</h3>
                  <p className="text-muted-foreground">{quest.description}</p>
                </div>
                <div className="flex gap-2">
                  <Badge className={getDifficultyColor(quest.difficulty)}>
                    {quest.difficulty}
                  </Badge>
                  <Badge className={getStatusColor(quest.status)}>
                    {quest.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Participants</p>
                  <p className="font-semibold">{quest.participants}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completions</p>
                  <p className="font-semibold">{quest.completions}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reward</p>
                  <p className="font-semibold">{quest.reward} RUSH</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="font-semibold">${quest.revenue.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex gap-2">
                {quest.status === 'draft' && (
                  <Button size="sm" onClick={() => handlePublishQuest(quest.id)}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Publish
                  </Button>
                )}
                {quest.status === 'published' && (
                  <Button size="sm" variant="outline" onClick={() => handleArchiveQuest(quest.id)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Archive
                  </Button>
                )}
                <Button size="sm" variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDeleteQuest(quest.id)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quest Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Quest performance chart</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Participant Demographics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Demographics chart</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Revenue breakdown chart</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Publisher Settings</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="publisherName">Publisher Name</Label>
            <Input
              id="publisherName"
              defaultValue={user?.username || ''}
              placeholder="Your publisher name"
            />
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself as a publisher"
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              placeholder="https://your-website.com"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="walletAddress">Wallet Address</Label>
            <Input
              id="walletAddress"
              value={user?.wallet_address || ''}
              placeholder="0x..."
              readOnly
            />
          </div>
          <div>
            <Label htmlFor="paymentMethod">Preferred Payment Method</Label>
            <select className="w-full p-2 border rounded-md">
              <option value="crypto">Cryptocurrency</option>
              <option value="fiat">Fiat Currency</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Quest Completions</p>
              <p className="text-sm text-muted-foreground">Get notified when someone completes your quest</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Revenue Updates</p>
              <p className="text-sm text-muted-foreground">Get notified about revenue milestones</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Platform Updates</p>
              <p className="text-sm text-muted-foreground">Get notified about new platform features</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (user?.subscription_tier !== 'pro') {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <Zap className="w-16 h-16 mx-auto text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-2">Publisher Tools</h2>
            <p className="text-muted-foreground mb-6">
              Upgrade to Pro to access publisher tools and create your own quests
            </p>
            <Button>Upgrade to Pro</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Publisher Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your quests, track performance, and grow your audience
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quests">Quests</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="quests" className="mt-6">
          {renderQuests()}
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          {renderAnalytics()}
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          {renderSettings()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PublisherDashboard;
