import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Coins, 
  Gift, 
  Star, 
  Zap, 
  Shield, 
  Award,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  ExternalLink,
  Share2,
  Wallet
} from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { useAuth } from '@/hooks/useAuth';

interface NFT {
  id: string;
  name: string;
  description: string;
  image: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  attributes: {
    trait_type: string;
    value: string;
  }[];
  mintedAt: string;
  tokenId: string;
}

interface Reward {
  id: string;
  type: 'nft' | 'token' | 'achievement';
  name: string;
  description: string;
  amount?: number;
  nft?: NFT;
  claimed: boolean;
  claimableAt: string;
  expiresAt?: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

const Web3Rewards: React.FC = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingReward, setClaimingReward] = useState<string | null>(null);

  const { isConnected, account, signer } = useWeb3();
  const { user } = useAuth();

  useEffect(() => {
    if (isConnected && user) {
      loadRewardsData();
    }
  }, [isConnected, user]);

  const loadRewardsData = async () => {
    setIsLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Load rewards
      setRewards([
        {
          id: '1',
          type: 'nft',
          name: 'Welcome NFT',
          description: 'Your first Avalanche Rush NFT',
          claimed: false,
          claimableAt: new Date().toISOString(),
          nft: {
            id: '1',
            name: 'Avalanche Explorer',
            description: 'A rare NFT for early adopters',
            image: '/api/placeholder/300/300',
            rarity: 'rare',
            attributes: [
              { trait_type: 'Background', value: 'Avalanche Blue' },
              { trait_type: 'Character', value: 'Explorer' },
              { trait_type: 'Rarity', value: 'Rare' }
            ],
            mintedAt: new Date().toISOString(),
            tokenId: '1'
          }
        },
        {
          id: '2',
          type: 'token',
          name: 'Daily Bonus',
          description: '1000 RUSH tokens for daily login',
          amount: 1000,
          claimed: false,
          claimableAt: new Date().toISOString()
        },
        {
          id: '3',
          type: 'achievement',
          name: 'First Quest',
          description: 'Complete your first quest',
          claimed: false,
          claimableAt: new Date().toISOString()
        }
      ]);

      // Load achievements
      setAchievements([
        {
          id: '1',
          name: 'Quest Master',
          description: 'Complete 10 quests',
          icon: '🏆',
          unlocked: false,
          progress: 3,
          maxProgress: 10
        },
        {
          id: '2',
          name: 'Token Collector',
          description: 'Earn 10,000 RUSH tokens',
          icon: '💰',
          unlocked: false,
          progress: 2500,
          maxProgress: 10000
        },
        {
          id: '3',
          name: 'NFT Enthusiast',
          description: 'Collect 5 NFTs',
          icon: '🎨',
          unlocked: false,
          progress: 1,
          maxProgress: 5
        },
        {
          id: '4',
          name: 'Early Adopter',
          description: 'Join during beta',
          icon: '🚀',
          unlocked: true,
          unlockedAt: new Date().toISOString(),
          progress: 1,
          maxProgress: 1
        }
      ]);

      // Load NFTs
      setNfts([
        {
          id: '1',
          name: 'Avalanche Explorer',
          description: 'A rare NFT for early adopters',
          image: '/api/placeholder/300/300',
          rarity: 'rare',
          attributes: [
            { trait_type: 'Background', value: 'Avalanche Blue' },
            { trait_type: 'Character', value: 'Explorer' },
            { trait_type: 'Rarity', value: 'Rare' }
          ],
          mintedAt: new Date().toISOString(),
          tokenId: '1'
        }
      ]);
    } catch (error) {
      console.error('Error loading rewards data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimReward = async (rewardId: string) => {
    setClaimingReward(rewardId);
    try {
      // Simulate claiming reward
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setRewards(prev => prev.map(reward => 
        reward.id === rewardId 
          ? { ...reward, claimed: true }
          : reward
      ));
    } catch (error) {
      console.error('Error claiming reward:', error);
    } finally {
      setClaimingReward(null);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderRewards = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Available Rewards</h2>
        <Badge variant="outline">
          {rewards.filter(r => !r.claimed).length} available
        </Badge>
      </div>

      <div className="grid gap-4">
        {rewards.map((reward) => (
          <Card key={reward.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    {reward.type === 'nft' && <Trophy className="w-6 h-6 text-primary" />}
                    {reward.type === 'token' && <Coins className="w-6 h-6 text-primary" />}
                    {reward.type === 'achievement' && <Award className="w-6 h-6 text-primary" />}
                  </div>
                  <div>
                    <h3 className="font-semibold">{reward.name}</h3>
                    <p className="text-sm text-muted-foreground">{reward.description}</p>
                    {reward.amount && (
                      <p className="text-sm font-medium text-green-600">
                        {reward.amount.toLocaleString()} RUSH
                      </p>
                    )}
                    {reward.nft && (
                      <Badge className={getRarityColor(reward.nft.rarity)}>
                        {reward.nft.rarity}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {reward.claimed ? (
                    <Badge variant="secondary">Claimed</Badge>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleClaimReward(reward.id)}
                      disabled={claimingReward === reward.id}
                    >
                      {claimingReward === reward.id ? 'Claiming...' : 'Claim'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Achievements</h2>
        <Badge variant="outline">
          {achievements.filter(a => a.unlocked).length} of {achievements.length} unlocked
        </Badge>
      </div>

      <div className="grid gap-4">
        {achievements.map((achievement) => (
          <Card key={achievement.id}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">{achievement.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{achievement.name}</h3>
                    {achievement.unlocked ? (
                      <Badge variant="default">Unlocked</Badge>
                    ) : (
                      <Badge variant="outline">
                        {achievement.progress}/{achievement.maxProgress}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {achievement.description}
                  </p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ 
                        width: `${(achievement.progress / achievement.maxProgress) * 100}%` 
                      }}
                    />
                  </div>
                  {achievement.unlockedAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderNFTs = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your NFTs</h2>
        <Badge variant="outline">
          {nfts.length} owned
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nfts.map((nft) => (
          <Card key={nft.id}>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                  <img 
                    src={nft.image} 
                    alt={nft.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{nft.name}</h3>
                    <Badge className={getRarityColor(nft.rarity)}>
                      {nft.rarity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {nft.description}
                  </p>
                  <div className="space-y-2">
                    {nft.attributes.map((attr, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{attr.trait_type}:</span>
                        <span>{attr.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <Wallet className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6">
              Connect your Web3 wallet to view and claim your rewards
            </p>
            <Button>Connect Wallet</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="space-y-6">
          <div className="h-8 bg-muted rounded animate-pulse" />
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Web3 Rewards</h1>
        <p className="text-muted-foreground">
          Claim your NFTs, tokens, and achievements
        </p>
      </div>

      <Tabs defaultValue="rewards" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="nfts">NFTs</TabsTrigger>
        </TabsList>

        <TabsContent value="rewards">
          {renderRewards()}
        </TabsContent>

        <TabsContent value="achievements">
          {renderAchievements()}
        </TabsContent>

        <TabsContent value="nfts">
          {renderNFTs()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Web3Rewards;