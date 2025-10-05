import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSmartContracts } from '../../hooks/useSmartContracts';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { X, ShoppingCart, Star, Crown, Zap } from 'lucide-react';

interface NFTMarketplaceProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NFT {
  id: number;
  name: string;
  description: string;
  image: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  price: number;
  seller: string;
  isOwned?: boolean;
  isForSale?: boolean;
}

const NFTMarketplace: React.FC<NFTMarketplaceProps> = ({ isOpen, onClose }) => {
  const { isConnected, account, getPlayerNFTs } = useSmartContracts();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [playerNFTs, setPlayerNFTs] = useState<NFT[]>([]);
  const [activeTab, setActiveTab] = useState<'marketplace' | 'my-nfts'>('marketplace');
  const [isLoading, setIsLoading] = useState(false);

  // Mock NFT data
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setTimeout(() => {
        const mockNFTs: NFT[] = [
          {
            id: 1,
            name: 'Avalanche Explorer',
            description: 'A rare NFT earned by exploring the Avalanche ecosystem',
            image: '🏔️',
            rarity: 'rare',
            price: 500,
            seller: '0x1234...5678',
            isForSale: true
          },
          {
            id: 2,
            name: 'DeFi Master',
            description: 'Epic NFT for mastering DeFi protocols',
            image: '⚡',
            rarity: 'epic',
            price: 1200,
            seller: '0x2345...6789',
            isForSale: true
          },
          {
            id: 3,
            name: 'Chain Guardian',
            description: 'Legendary NFT for protecting the blockchain',
            image: '🛡️',
            rarity: 'legendary',
            price: 2500,
            seller: '0x3456...7890',
            isForSale: true
          },
          {
            id: 4,
            name: 'Speed Runner',
            description: 'Common NFT for completing speed challenges',
            image: '🏃',
            rarity: 'common',
            price: 100,
            seller: '0x4567...8901',
            isForSale: true
          }
        ];

        const mockPlayerNFTs: NFT[] = [
          {
            id: 5,
            name: 'First Steps',
            description: 'Your first achievement NFT',
            image: '🌟',
            rarity: 'common',
            price: 0,
            seller: account || '',
            isOwned: true
          },
          {
            id: 6,
            name: 'Quest Master',
            description: 'Completed 10 quests successfully',
            image: '🎯',
            rarity: 'rare',
            price: 0,
            seller: account || '',
            isOwned: true
          }
        ];

        setNfts(mockNFTs);
        setPlayerNFTs(mockPlayerNFTs);
        setIsLoading(false);
      }, 1000);
    }
  }, [isOpen, account]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <Star className="w-4 h-4" />;
      case 'rare': return <Star className="w-4 h-4 text-blue-500" />;
      case 'epic': return <Crown className="w-4 h-4 text-purple-500" />;
      case 'legendary': return <Zap className="w-4 h-4 text-yellow-500" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const handleBuyNFT = async (nftId: number) => {
    if (!isConnected) return;
    // Mock purchase
    console.log(`Buying NFT ${nftId}`);
  };

  const handleSellNFT = async (nftId: number, price: number) => {
    if (!isConnected) return;
    // Mock sell
    console.log(`Selling NFT ${nftId} for ${price} RUSH`);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-6xl w-full mx-4 shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-black text-white mb-2">NFT Marketplace</h2>
              <p className="text-white/70 text-lg">Buy, sell, and trade achievement NFTs</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-4 mb-8">
            <Button
              onClick={() => setActiveTab('marketplace')}
              variant={activeTab === 'marketplace' ? 'default' : 'outline'}
              className={`${
                activeTab === 'marketplace'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }`}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Marketplace
            </Button>
            <Button
              onClick={() => setActiveTab('my-nfts')}
              variant={activeTab === 'my-nfts' ? 'default' : 'outline'}
              className={`${
                activeTab === 'my-nfts'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }`}
            >
              <Star className="w-4 h-4 mr-2" />
              My NFTs
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-white/70">Loading NFTs...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(activeTab === 'marketplace' ? nfts : playerNFTs).map((nft) => (
                <motion.div
                  key={nft.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: nft.id * 0.1 }}
                >
                  <Card className={`h-full transition-all duration-300 ${
                    nft.isOwned 
                      ? 'bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/30' 
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="text-4xl mb-2">{nft.image}</div>
                        <Badge className={getRarityColor(nft.rarity)}>
                          <div className="flex items-center space-x-1">
                            {getRarityIcon(nft.rarity)}
                            <span className="capitalize">{nft.rarity}</span>
                          </div>
                        </Badge>
                      </div>
                      <CardTitle className="text-white text-lg">{nft.name}</CardTitle>
                      <CardDescription className="text-white/70">
                        {nft.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {nft.isOwned ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-white">
                            <span className="text-sm font-medium">Status</span>
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              Owned
                            </Badge>
                          </div>
                          <div className="flex space-x-2">
                            <Input
                              placeholder="Sell price"
                              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                            />
                            <Button
                              onClick={() => handleSellNFT(nft.id, 0)}
                              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                              size="sm"
                            >
                              Sell
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-white">
                            <span className="text-sm font-medium">Price</span>
                            <span className="font-bold text-lg">{nft.price} RUSH</span>
                          </div>
                          <Button
                            onClick={() => handleBuyNFT(nft.id)}
                            disabled={!isConnected}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Buy NFT
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {!isConnected && (
            <div className="mt-8 text-center">
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-6">
                <ShoppingCart className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Connect Wallet Required</h3>
                <p className="text-white/70 mb-4">
                  Connect your wallet to buy, sell, and trade NFTs
                </p>
                <Button
                  onClick={onClose}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                >
                  Connect Wallet
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NFTMarketplace;