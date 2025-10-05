import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNFTSystem, NFTType, Rarity, NFTDetails } from '@/hooks/useNFTSystem';
import { Trophy, Zap, TrendingUp, Gift, Sparkles, Star } from 'lucide-react';

const rarityColors = {
  [Rarity.COMMON]: 'bg-gray-500',
  [Rarity.RARE]: 'bg-blue-500',
  [Rarity.EPIC]: 'bg-purple-500',
  [Rarity.LEGENDARY]: 'bg-orange-500',
  [Rarity.MYTHIC]: 'bg-pink-500'
};

const rarityNames = {
  [Rarity.COMMON]: 'Common',
  [Rarity.RARE]: 'Rare',
  [Rarity.EPIC]: 'Epic',
  [Rarity.LEGENDARY]: 'Legendary',
  [Rarity.MYTHIC]: 'Mythic'
};

const typeIcons = {
  [NFTType.ACHIEVEMENT]: Trophy,
  [NFTType.POWERUP]: Zap,
  [NFTType.EVOLUTION]: TrendingUp,
  [NFTType.LOOTBOX]: Gift,
  [NFTType.SPECIAL]: Sparkles
};

export function NFTGallery() {
  const {
    playerNFTs,
    playerStats,
    powerBonus,
    isLoading,
    evolveNFT,
    activatePowerUp,
    listNFTForSale
  } = useNFTSystem();

  const [selectedNFT, setSelectedNFT] = useState<NFTDetails | null>(null);
  const [sellPrice, setSellPrice] = useState('');

  const handleEvolve = async (tokenId: number) => {
    try {
      await evolveNFT(tokenId);
      alert('NFT evolved successfully!');
    } catch (error) {
      alert('Failed to evolve NFT: ' + error);
    }
  };

  const handleActivatePowerUp = async (tokenId: number) => {
    try {
      await activatePowerUp(tokenId);
      alert('Power-up activated!');
    } catch (error) {
      alert('Failed to activate power-up: ' + error);
    }
  };

  const handleListForSale = async (tokenId: number) => {
    if (!sellPrice) {
      alert('Please enter a price');
      return;
    }

    try {
      await listNFTForSale(tokenId, sellPrice);
      alert('NFT listed for sale!');
      setSellPrice('');
    } catch (error) {
      alert('Failed to list NFT: ' + error);
    }
  };

  const getRequiredXP = (level: number) => {
    return level * 100 * (level + 1) / 2;
  };

  const filterByType = (type: NFTType) => {
    return playerNFTs.filter(nft => nft.metadata.nftType === type);
  };

  const NFTCard: React.FC<{ nft: NFTDetails }> = ({ nft }) => {
    const Icon = typeIcons[nft.metadata.nftType];
    const xpProgress = nft.metadata.nftType === NFTType.EVOLUTION
      ? (nft.metadata.experiencePoints / getRequiredXP(nft.metadata.level)) * 100
      : 0;

    return (
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedNFT(nft)}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5" />
              <CardTitle className="text-lg">NFT #{nft.tokenId}</CardTitle>
            </div>
            <Badge className={rarityColors[nft.metadata.rarity]}>
              {rarityNames[nft.metadata.rarity]}
            </Badge>
          </div>
          <CardDescription className="capitalize">
            {nft.metadata.category.replace(/_/g, ' ')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Level Display */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Level {nft.metadata.level}</span>
            {nft.metadata.powerBonus > 0 && (
              <span className="text-sm text-green-500">+{nft.metadata.powerBonus}% Bonus</span>
            )}
          </div>

          {/* Evolution XP Progress */}
          {nft.metadata.nftType === NFTType.EVOLUTION && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>XP</span>
                <span>{nft.metadata.experiencePoints} / {getRequiredXP(nft.metadata.level)}</span>
              </div>
              <Progress value={xpProgress} className="h-2" />
            </div>
          )}

          {/* Power-up Duration */}
          {nft.metadata.nftType === NFTType.POWERUP && (
            <div className="text-sm">
              <span className="text-muted-foreground">Duration: </span>
              <span>{Math.floor(nft.metadata.durationSeconds / 60)}m</span>
            </div>
          )}

          {/* Active Status */}
          {nft.metadata.isActive && (
            <Badge variant="outline" className="bg-green-50">
              <Sparkles className="w-3 h-3 mr-1" />
              Active
            </Badge>
          )}
        </CardContent>

        <CardFooter className="flex gap-2">
          {/* Evolution Button */}
          {nft.metadata.nftType === NFTType.EVOLUTION &&
           nft.metadata.experiencePoints >= getRequiredXP(nft.metadata.level) && (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleEvolve(nft.tokenId);
              }}
              className="flex-1"
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              Evolve
            </Button>
          )}

          {/* Activate Power-up Button */}
          {nft.metadata.nftType === NFTType.POWERUP && !nft.metadata.isActive && (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleActivatePowerUp(nft.tokenId);
              }}
              className="flex-1"
            >
              <Zap className="w-4 h-4 mr-1" />
              Activate
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Player Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total NFTs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{playerStats?.totalNFTs || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              {playerStats?.achievementCount || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Power-ups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500" />
              {playerStats?.powerUpCount || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Highest Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Star className="w-5 h-5 text-purple-500" />
              {playerStats?.highestLevel || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Bonus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">+{powerBonus}%</div>
          </CardContent>
        </Card>
      </div>

      {/* NFT Gallery Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All ({playerNFTs.length})</TabsTrigger>
          <TabsTrigger value="achievements">
            <Trophy className="w-4 h-4 mr-1" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="powerups">
            <Zap className="w-4 h-4 mr-1" />
            Power-ups
          </TabsTrigger>
          <TabsTrigger value="evolution">
            <TrendingUp className="w-4 h-4 mr-1" />
            Evolution
          </TabsTrigger>
          <TabsTrigger value="lootbox">
            <Gift className="w-4 h-4 mr-1" />
            Loot Box
          </TabsTrigger>
          <TabsTrigger value="special">
            <Sparkles className="w-4 h-4 mr-1" />
            Special
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {playerNFTs.map(nft => (
              <NFTCard key={nft.tokenId} nft={nft} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filterByType(NFTType.ACHIEVEMENT).map(nft => (
              <NFTCard key={nft.tokenId} nft={nft} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="powerups" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filterByType(NFTType.POWERUP).map(nft => (
              <NFTCard key={nft.tokenId} nft={nft} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="evolution" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filterByType(NFTType.EVOLUTION).map(nft => (
              <NFTCard key={nft.tokenId} nft={nft} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="lootbox" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filterByType(NFTType.LOOTBOX).map(nft => (
              <NFTCard key={nft.tokenId} nft={nft} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="special" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filterByType(NFTType.SPECIAL).map(nft => (
              <NFTCard key={nft.tokenId} nft={nft} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Loading State */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span>Processing...</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default NFTGallery;
