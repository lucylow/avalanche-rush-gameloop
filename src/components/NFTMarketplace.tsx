import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, Eye, Filter, Search, Tag, Clock, Trophy } from 'lucide-react';
import { useAdvancedWeb3 } from '../hooks/useAdvancedWeb3';

interface NFTAchievement {
  tokenId: number;
  rarity: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  score: number;
  timestamp: number;
  metadata: string;
  powerLevel: number;
  attributes: string[];
  owner: string;
  isListed: boolean;
  price?: number;
}

interface MarketplaceFilter {
  rarity: 'ALL' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  priceRange: [number, number];
  sortBy: 'PRICE_LOW' | 'PRICE_HIGH' | 'RARITY' | 'RECENT';
}

const NFTMarketplace: React.FC = () => {
  const { isConnected, account } = useAdvancedWeb3();
  const [nfts, setNfts] = useState<NFTAchievement[]>([]);
  const [filteredNfts, setFilteredNfts] = useState<NFTAchievement[]>([]);
  const [selectedNft, setSelectedNft] = useState<NFTAchievement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<MarketplaceFilter>({
    rarity: 'ALL',
    priceRange: [0, 10000],
    sortBy: 'RECENT'
  });

  const rarityColors = {
    BRONZE: 'from-orange-400 to-orange-600',
    SILVER: 'from-gray-400 to-gray-600',
    GOLD: 'from-yellow-400 to-yellow-600',
    PLATINUM: 'from-purple-400 to-purple-600'
  };

  const rarityIcons = {
    BRONZE: '🥉',
    SILVER: '🥈', 
    GOLD: '🥇',
    PLATINUM: '💎'
  };

  useEffect(() => {
    fetchMarketplaceNFTs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [nfts, filters, searchTerm]);

  const fetchMarketplaceNFTs = async () => {
    setIsLoading(true);
    try {
      // Mock data - replace with actual contract calls
      const mockNfts: NFTAchievement[] = [
        {
          tokenId: 1,
          rarity: 'GOLD',
          score: 15000,
          timestamp: Date.now() - 86400000,
          metadata: 'First Place Tournament Winner',
          powerLevel: 950,
          attributes: ['Speed Boost', 'Score Multiplier'],
          owner: '0x123...abc',
          isListed: true,
          price: 500
        },
        {
          tokenId: 2,
          rarity: 'SILVER',
          score: 12000,
          timestamp: Date.now() - 172800000,
          metadata: 'DeFi Master Achievement',
          powerLevel: 750,
          attributes: ['Yield Farming', 'Liquidity Provider'],
          owner: '0x456...def',
          isListed: true,
          price: 250
        },
        {
          tokenId: 3,
          rarity: 'PLATINUM',
          score: 25000,
          timestamp: Date.now() - 259200000,
          metadata: 'Legendary Speed Runner',
          powerLevel: 1200,
          attributes: ['Ultra Speed', 'Perfect Score', 'Legendary'],
          owner: '0x789...ghi',
          isListed: true,
          price: 2500
        },
        {
          tokenId: 4,
          rarity: 'BRONZE',
          score: 8000,
          timestamp: Date.now() - 345600000,
          metadata: 'Web3 Beginner',
          powerLevel: 400,
          attributes: ['First Steps', 'Learning'],
          owner: '0xabc...123',
          isListed: true,
          price: 100
        }
      ];
      setNfts(mockNfts);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...nfts];

    // Apply rarity filter
    if (filters.rarity !== 'ALL') {
      filtered = filtered.filter(nft => nft.rarity === filters.rarity);
    }

    // Apply price range filter
    filtered = filtered.filter(nft => 
      nft.price && nft.price >= filters.priceRange[0] && nft.price <= filters.priceRange[1]
    );

    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(nft => 
        nft.metadata.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.attributes.some(attr => attr.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'PRICE_LOW':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'PRICE_HIGH':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'RARITY': {
        const rarityOrder = { PLATINUM: 4, GOLD: 3, SILVER: 2, BRONZE: 1 };
        filtered.sort((a, b) => rarityOrder[b.rarity] - rarityOrder[a.rarity]);
        break;
      }
      case 'RECENT':
        filtered.sort((a, b) => b.timestamp - a.timestamp);
        break;
    }

    setFilteredNfts(filtered);
  };

  const handleBuyNft = async (nft: NFTAchievement) => {
    if (!isConnected) {
      alert('Please connect your wallet to purchase NFTs');
      return;
    }

    setIsLoading(true);
    try {
      // Mock purchase logic - replace with actual contract interaction
      console.log(`Buying NFT ${nft.tokenId} for ${nft.price} RUSH tokens`);
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update NFT status
      const updatedNfts = nfts.map(n => 
        n.tokenId === nft.tokenId 
          ? { ...n, isListed: false, owner: account }
          : n
      );
      setNfts(updatedNfts);
      
      alert(`Successfully purchased ${nft.metadata}!`);
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Recently';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden p-2 rounded-lg bg-gray-100"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>

            <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search NFTs..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Rarity Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rarity
                </label>
                <select
                  value={filters.rarity}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    rarity: e.target.value as MarketplaceFilter['rarity']
                  }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Rarities</option>
                  <option value="BRONZE">🥉 Bronze</option>
                  <option value="SILVER">🥈 Silver</option>
                  <option value="GOLD">🥇 Gold</option>
                  <option value="PLATINUM">💎 Platinum</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range (RUSH)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={filters.priceRange[0]}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      priceRange: [Number(e.target.value), prev.priceRange[1]]
                    }))}
                    placeholder="Min"
                    className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      priceRange: [prev.priceRange[0], Number(e.target.value)]
                    }))}
                    placeholder="Max"
                    className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    sortBy: e.target.value as MarketplaceFilter['sortBy']
                  }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="RECENT">Recently Listed</option>
                  <option value="PRICE_LOW">Price: Low to High</option>
                  <option value="PRICE_HIGH">Price: High to Low</option>
                  <option value="RARITY">Rarity</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* NFT Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              NFT Marketplace
            </h2>
            <div className="flex items-center space-x-2 text-gray-600">
              <span>{filteredNfts.length} items</span>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                    <div className="h-8 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredNfts.map((nft) => (
                  <motion.div
                    key={nft.tokenId}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  >
                    {/* NFT Image/Preview */}
                    <div className={`h-48 bg-gradient-to-br ${rarityColors[nft.rarity]} relative`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-6xl">
                          {rarityIcons[nft.rarity]}
                        </div>
                      </div>
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium text-white bg-black/30`}>
                          {nft.rarity}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <div className="flex items-center space-x-1">
                          <Trophy className="w-4 h-4 text-white" />
                          <span className="text-xs font-medium text-white">
                            {nft.powerLevel}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* NFT Details */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                        {nft.metadata}
                      </h3>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatTimeAgo(nft.timestamp)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{nft.score.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Attributes */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {nft.attributes.slice(0, 2).map((attr, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {attr}
                          </span>
                        ))}
                        {nft.attributes.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{nft.attributes.length - 2}
                          </span>
                        )}
                      </div>

                      {/* Price and Buy Button */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-bold text-gray-900">
                            {nft.price} RUSH
                          </div>
                          <div className="text-sm text-gray-500">
                            ≈ ${(nft.price! * 0.1).toFixed(2)} USD
                          </div>
                        </div>
                        <button
                          onClick={() => handleBuyNft(nft)}
                          disabled={!isConnected || nft.owner === account}
                          className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span>
                            {nft.owner === account ? 'Owned' : 'Buy'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {filteredNfts.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No NFTs Found
              </h3>
              <p className="text-gray-600">
                Try adjusting your filters or search terms
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NFTMarketplace;
