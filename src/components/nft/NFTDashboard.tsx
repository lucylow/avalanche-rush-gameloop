import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import NFTGallery from './NFTGallery';
import LootBoxSystem from './LootBoxSystem';
import { useNFTSystem } from '@/hooks/useNFTSystem';
import { useMockData } from '@/hooks/useMockData';
import { Trophy, Zap, ShoppingBag, Gift, TrendingUp, Sparkles, Database } from 'lucide-react';

/**
 * Comprehensive NFT Dashboard
 *
 * Displays all NFT-related features in one place:
 * - Player NFT collection
 * - Loot box system
 * - Marketplace
 * - Statistics
 */

export function NFTDashboard() {
  const {
    playerNFTs,
    playerStats,
    powerBonus,
    marketListings,
    isLoading
  } = useNFTSystem();

  const mockData = useMockData();
  const [activeTab, setActiveTab] = useState('collection');
  const [useMockDataMode, setUseMockDataMode] = useState(mockData.isMockDataEnabled);

  // Determine which data to use
  const displayNFTs = useMockDataMode ? mockData.nfts : playerNFTs;
  const displayStats = useMockDataMode
    ? {
        totalNFTs: mockData.nfts.length,
        achievementCount: mockData.nfts.filter((nft: any) => nft.category === 'achievement').length,
        powerUpCount: mockData.nfts.filter((nft: any) => nft.category === 'power_up').length,
        highestLevel: Math.max(...mockData.nfts.map((nft: any) => nft.level || 0)),
        totalExperience: mockData.nfts.reduce((sum: number, nft: any) => sum + (nft.experience || 0), 0)
      }
    : playerStats;

  // Calculate collection value
  const collectionValue = useMockDataMode
    ? displayNFTs.reduce((total: number, nft: any) => total + (nft.power || 10) * 100, 0)
    : playerNFTs.reduce((total, nft) => {
        const listing = marketListings.find(l => l.tokenId === nft.tokenId);
        return total + (listing ? parseFloat(listing.price) : 0);
      }, 0);

  // Get rarity distribution
  const rarityDistribution = useMockDataMode
    ? displayNFTs.reduce((acc: Record<string, number>, nft: any) => {
        const rarity = nft.rarity;
        acc[rarity] = (acc[rarity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    : playerNFTs.reduce((acc, nft) => {
        const rarity = nft.metadata.rarity;
        acc[rarity] = (acc[rarity] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

  // Mock data toggle handler
  const toggleMockData = () => {
    mockData.toggleMockData();
    setUseMockDataMode(!useMockDataMode);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              NFT Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your collection, open loot boxes, and trade on the marketplace
            </p>
          </div>
          <Button
            variant={useMockDataMode ? "default" : "outline"}
            onClick={toggleMockData}
            className="flex items-center gap-2"
          >
            <Database className="w-4 h-4" />
            {useMockDataMode ? "Using Mock Data" : "Use Mock Data"}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total NFTs</CardTitle>
            <Trophy className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{playerStats?.totalNFTs || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {playerStats?.achievementCount || 0} achievements
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Power</CardTitle>
            <Zap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">+{powerBonus}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {playerStats?.powerUpCount || 0} power-ups owned
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Highest Level</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {playerStats?.highestLevel || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {playerStats?.totalExperience || 0} total XP
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Collection Value</CardTitle>
            <ShoppingBag className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {collectionValue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              RUSH tokens
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rarity Distribution */}
      {Object.keys(rarityDistribution).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Rarity Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              {Object.entries(rarityDistribution).map(([rarity, count]) => {
                const rarityNames = ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic'];
                const rarityColors = [
                  'bg-gray-500',
                  'bg-blue-500',
                  'bg-purple-500',
                  'bg-orange-500',
                  'bg-pink-500'
                ];

                return (
                  <Badge
                    key={rarity}
                    className={`${rarityColors[parseInt(rarity)]} text-white px-4 py-2`}
                  >
                    {rarityNames[parseInt(rarity)]}: {count}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="collection" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            My Collection
          </TabsTrigger>
          <TabsTrigger value="lootboxes" className="flex items-center gap-2">
            <Gift className="w-4 h-4" />
            Loot Boxes
          </TabsTrigger>
          <TabsTrigger value="marketplace" className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Marketplace
          </TabsTrigger>
        </TabsList>

        {/* NFT Collection Tab */}
        <TabsContent value="collection" className="mt-6">
          <NFTGallery />
        </TabsContent>

        {/* Loot Boxes Tab */}
        <TabsContent value="lootboxes" className="mt-6">
          <LootBoxSystem />
        </TabsContent>

        {/* Marketplace Tab */}
        <TabsContent value="marketplace" className="mt-6">
          <MarketplaceView listings={marketListings} />
        </TabsContent>
      </Tabs>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span>Processing transaction...</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

/**
 * Marketplace View Component
 */
interface MarketplaceViewProps {
  listings: Array<{
    listingId: number;
    seller: string;
    tokenId: number;
    price: string;
    listedAt: number;
    isActive: boolean;
  }>;
}

function MarketplaceView({ listings }: MarketplaceViewProps) {
  const { buyNFT, isLoading } = useNFTSystem();
  const [selectedListing, setSelectedListing] = useState<number | null>(null);

  const handleBuy = async (listingId: number, price: string) => {
    try {
      await buyNFT(listingId, price);
      alert('NFT purchased successfully!');
    } catch (error) {
      alert('Failed to purchase NFT: ' + error);
    }
  };

  if (listings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Listings Available</h3>
          <p className="text-muted-foreground text-center">
            Be the first to list an NFT on the marketplace!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Active Listings</h3>
          <p className="text-muted-foreground">
            {listings.length} NFTs available for purchase
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map((listing) => (
          <Card
            key={listing.listingId}
            className={`hover:shadow-lg transition-shadow ${
              selectedListing === listing.listingId ? 'ring-2 ring-primary' : ''
            }`}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>NFT #{listing.tokenId}</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Seller: {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-green-50">
                  For Sale
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-green-600">
                  {listing.price}
                </span>
                <span className="text-muted-foreground">RUSH</span>
              </div>

              <div className="text-xs text-muted-foreground">
                Listed {new Date(listing.listedAt * 1000).toLocaleDateString()}
              </div>

              <Button
                className="w-full"
                onClick={() => handleBuy(listing.listingId, listing.price)}
                disabled={isLoading}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Buy Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default NFTDashboard;
