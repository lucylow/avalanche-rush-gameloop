import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { 
  Sparkles, 
  Zap, 
  Star, 
  Crown,
  Flame,
  Shield,
  Sword,
  Gem,
  Trophy,
  Target,
  Clock,
  TrendingUp,
  Award,
  Eye,
  Heart,
  Plus,
  CheckCircle,
  Lock,
  Unlock,
  Layers,
  Activity
} from 'lucide-react';

// Contract ABIs
const EVOLVING_NFT_ABI = [
  "function evolveNFT(uint256 tokenId) external",
  "function completeEvolution(uint256 tokenId) external",
  "function addNFTExperience(uint256 tokenId, uint256 experience) external",
  "function getEvolvingNFTData(uint256 tokenId) view returns (uint256,address,uint256,uint256,uint256,string,bool)",
  "function getPlayerNFTs(address owner) view returns (uint256[])",
  "event NFTEvolved(uint256 indexed tokenId, address indexed owner, uint256 oldLevel, uint256 newLevel, string newImageUri)"
] as const;

const NFT_ADDRESS = "0x0000000000000000000000000000000000000000";

interface EvolvingNFTData {
  tokenId: number;
  owner: string;
  level: number;
  experience: number;
  lastEvolutionTime: number;
  currentImageUri: string;
  isEvolving: boolean;
}

interface NFTAttributes {
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  power: number;
  speed: number;
  intelligence: number;
  luck: number;
  specialAbility: string;
}

const EvolvingNFTGallery: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();

  const [playerNFTs, setPlayerNFTs] = useState<EvolvingNFTData[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<EvolvingNFTData | null>(null);
  const [nftAttributes, setNftAttributes] = useState<{ [key: number]: NFTAttributes }>({});
  const [isEvolving, setIsEvolving] = useState(false);
  const [evolutionProgress, setEvolutionProgress] = useState<{ [key: number]: number }>({});

  // Mock data for demonstration
  const mockPlayerNFTs: EvolvingNFTData[] = [
    {
      tokenId: 1,
      owner: address || "0x1234...5678",
      level: 3,
      experience: 2750,
      lastEvolutionTime: Date.now() - 86400000, // 1 day ago
      currentImageUri: "https://api.avalanche-rush.com/nft-evolution/3.json",
      isEvolving: false
    },
    {
      tokenId: 2,
      owner: address || "0x1234...5678",
      level: 1,
      experience: 850,
      lastEvolutionTime: Date.now() - 172800000, // 2 days ago
      currentImageUri: "https://api.avalanche-rush.com/nft-evolution/1.json",
      isEvolving: false
    },
    {
      tokenId: 3,
      owner: address || "0x1234...5678",
      level: 5,
      experience: 5200,
      lastEvolutionTime: Date.now() - 3600000, // 1 hour ago
      currentImageUri: "https://api.avalanche-rush.com/nft-evolution/5.json",
      isEvolving: true
    }
  ];

  const mockNFTAttributes: { [key: number]: NFTAttributes } = {
    1: {
      rarity: 'epic',
      power: 85,
      speed: 70,
      intelligence: 90,
      luck: 75,
      specialAbility: 'Lightning Strike'
    },
    2: {
      rarity: 'rare',
      power: 65,
      speed: 80,
      intelligence: 70,
      luck: 85,
      specialAbility: 'Speed Boost'
    },
    3: {
      rarity: 'legendary',
      power: 95,
      speed: 85,
      intelligence: 95,
      luck: 90,
      specialAbility: 'Avalanche Mastery'
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      loadPlayerNFTs();
    }
  }, [isConnected, address]);

  const loadPlayerNFTs = useCallback(async () => {
    try {
      // In a real implementation, this would fetch from smart contracts
      setPlayerNFTs(mockPlayerNFTs);
      setNftAttributes(mockNFTAttributes);
      
      // Calculate evolution progress for each NFT
      const progress: { [key: number]: number } = {};
      mockPlayerNFTs.forEach(nft => {
        const requiredXP = (nft.level + 1) * 1000;
        progress[nft.tokenId] = (nft.experience / requiredXP) * 100;
      });
      setEvolutionProgress(progress);
    } catch (error) {
      console.error('Error loading NFTs:', error);
    }
  }, [address]);

  const evolveNFT = useCallback(async (tokenId: number) => {
    // Blockchain integration disabled - using mock data
    console.log('Evolve NFT called for token:', tokenId);
    return;
  }, []);

  const completeEvolution = useCallback(async (tokenId: number) => {
    // Blockchain integration disabled - using mock data  
    console.log('Complete evolution called for token:', tokenId);
    return;
  }, []);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      case 'mythic': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <Shield className="w-4 h-4" />;
      case 'rare': return <Sword className="w-4 h-4" />;
      case 'epic': return <Gem className="w-4 h-4" />;
      case 'legendary': return <Crown className="w-4 h-4" />;
      case 'mythic': return <Sparkles className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getExperienceToNextLevel = (nft: EvolvingNFTData) => {
    const requiredXP = (nft.level + 1) * 1000;
    return Math.max(0, requiredXP - nft.experience);
  };

  const canEvolve = (nft: EvolvingNFTData) => {
    return !nft.isEvolving && 
           nft.experience >= (nft.level + 1) * 1000 && 
           nft.level < 10;
  };

  const canCompleteEvolution = (nft: EvolvingNFTData) => {
    return nft.isEvolving && 
           Date.now() - nft.lastEvolutionTime >= 24 * 60 * 60 * 1000; // 24 hours
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-gray-800 text-white border-gray-700">
          <CardContent className="p-8 text-center">
            <Sparkles className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Evolving NFT Collection</h2>
            <p className="text-gray-300 mb-6">
              Connect your wallet to view and evolve your dynamic NFT collection!
            </p>
            <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Evolving NFT Gallery
          </h1>
          <p className="text-xl text-gray-300">
            Dynamic NFTs that grow and evolve as you progress in your learning journey
          </p>
        </motion.div>

        {/* NFT Collection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {playerNFTs.map((nft) => (
            <motion.div
              key={nft.tokenId}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer"
              onClick={() => setSelectedNFT(nft)}
            >
              <Card className="bg-gray-800 border-gray-700 hover:border-purple-500 transition-all duration-300 h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={`${getRarityColor(nftAttributes[nft.tokenId]?.rarity || 'common')} text-white`}>
                      {getRarityIcon(nftAttributes[nft.tokenId]?.rarity || 'common')}
                      <span className="ml-1 capitalize">{nftAttributes[nft.tokenId]?.rarity || 'common'}</span>
                    </Badge>
                    {nft.isEvolving && (
                      <Badge className="bg-orange-500 text-white animate-pulse">
                        <Activity className="w-3 h-3 mr-1" />
                        Evolving
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl">NFT #{nft.tokenId}</CardTitle>
                  <CardDescription>Level {nft.level} • {nft.experience.toLocaleString()} XP</CardDescription>
                </CardHeader>
                
                <CardContent>
                  {/* NFT Image Placeholder */}
                  <div className="w-full h-48 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                    <motion.div
                      animate={nft.isEvolving ? { rotate: 360 } : {}}
                      transition={{ duration: 2, repeat: nft.isEvolving ? Infinity : 0 }}
                      className="text-6xl"
                    >
                      {nft.isEvolving ? '✨' : '🎮'}
                    </motion.div>
                    
                    {nft.isEvolving && (
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      />
                    )}
                  </div>

                  {/* Experience Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Experience</span>
                      <span>{nft.experience.toLocaleString()} / {((nft.level + 1) * 1000).toLocaleString()}</span>
                    </div>
                    <Progress value={evolutionProgress[nft.tokenId] || 0} className="h-2" />
                    <div className="text-xs text-gray-400">
                      {getExperienceToNextLevel(nft).toLocaleString()} XP to next level
                    </div>
                  </div>

                  {/* Attributes Preview */}
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className="text-center p-2 bg-gray-700 rounded">
                      <div className="text-lg font-bold text-red-400">{nftAttributes[nft.tokenId]?.power || 0}</div>
                      <div className="text-xs text-gray-300">Power</div>
                    </div>
                    <div className="text-center p-2 bg-gray-700 rounded">
                      <div className="text-lg font-bold text-blue-400">{nftAttributes[nft.tokenId]?.speed || 0}</div>
                      <div className="text-xs text-gray-300">Speed</div>
                    </div>
                    <div className="text-center p-2 bg-gray-700 rounded">
                      <div className="text-lg font-bold text-purple-400">{nftAttributes[nft.tokenId]?.intelligence || 0}</div>
                      <div className="text-xs text-gray-300">Intelligence</div>
                    </div>
                    <div className="text-center p-2 bg-gray-700 rounded">
                      <div className="text-lg font-bold text-green-400">{nftAttributes[nft.tokenId]?.luck || 0}</div>
                      <div className="text-xs text-gray-300">Luck</div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  {canEvolve(nft) ? (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        evolveNFT(nft.tokenId);
                      }}
                      className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                      disabled={isEvolving}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Evolve to Level {nft.level + 1}
                    </Button>
                  ) : canCompleteEvolution(nft) ? (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        completeEvolution(nft.tokenId);
                      }}
                      className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Evolution
                    </Button>
                  ) : nft.isEvolving ? (
                    <div className="w-full text-center">
                      <div className="text-sm text-orange-400 mb-1">Evolution in Progress</div>
                      <div className="text-xs text-gray-400">
                        Complete in {Math.ceil((24 * 60 * 60 * 1000 - (Date.now() - nft.lastEvolutionTime)) / (1000 * 60 * 60))} hours
                      </div>
                    </div>
                  ) : (
                    <div className="w-full text-center text-gray-400 text-sm">
                      Keep learning to evolve!
                    </div>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* NFT Detail Modal */}
        <AnimatePresence>
          {selectedNFT && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedNFT(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Badge className={`${getRarityColor(nftAttributes[selectedNFT.tokenId]?.rarity || 'common')} text-white`}>
                          {getRarityIcon(nftAttributes[selectedNFT.tokenId]?.rarity || 'common')}
                          <span className="ml-1 capitalize">{nftAttributes[selectedNFT.tokenId]?.rarity || 'common'}</span>
                        </Badge>
                        <div>
                          <CardTitle className="text-2xl">NFT #{selectedNFT.tokenId}</CardTitle>
                          <CardDescription>Level {selectedNFT.level} • {selectedNFT.experience.toLocaleString()} XP</CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedNFT(null)}
                        className="text-gray-400 hover:text-white"
                      >
                        ✕
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Large NFT Image */}
                    <div className="w-full h-64 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center relative overflow-hidden">
                      <motion.div
                        animate={selectedNFT.isEvolving ? { rotate: 360 } : {}}
                        transition={{ duration: 2, repeat: selectedNFT.isEvolving ? Infinity : 0 }}
                        className="text-8xl"
                      >
                        {selectedNFT.isEvolving ? '✨' : '🎮'}
                      </motion.div>
                      
                      {selectedNFT.isEvolving && (
                        <motion.div
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        />
                      )}
                    </div>

                    {/* Detailed Attributes */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gray-700 rounded-lg">
                        <div className="text-2xl font-bold text-red-400">{nftAttributes[selectedNFT.tokenId]?.power || 0}</div>
                        <div className="text-sm text-gray-300 flex items-center justify-center">
                          <Sword className="w-4 h-4 mr-1" />
                          Power
                        </div>
                      </div>
                      <div className="text-center p-4 bg-gray-700 rounded-lg">
                        <div className="text-2xl font-bold text-blue-400">{nftAttributes[selectedNFT.tokenId]?.speed || 0}</div>
                        <div className="text-sm text-gray-300 flex items-center justify-center">
                          <Zap className="w-4 h-4 mr-1" />
                          Speed
                        </div>
                      </div>
                      <div className="text-center p-4 bg-gray-700 rounded-lg">
                        <div className="text-2xl font-bold text-purple-400">{nftAttributes[selectedNFT.tokenId]?.intelligence || 0}</div>
                        <div className="text-sm text-gray-300 flex items-center justify-center">
                          <Star className="w-4 h-4 mr-1" />
                          Intelligence
                        </div>
                      </div>
                      <div className="text-center p-4 bg-gray-700 rounded-lg">
                        <div className="text-2xl font-bold text-green-400">{nftAttributes[selectedNFT.tokenId]?.luck || 0}</div>
                        <div className="text-sm text-gray-300 flex items-center justify-center">
                          <Gem className="w-4 h-4 mr-1" />
                          Luck
                        </div>
                      </div>
                    </div>

                    {/* Special Ability */}
                    <div className="p-4 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-lg border border-purple-500/30">
                      <h4 className="font-semibold mb-2 flex items-center">
                        <Trophy className="w-4 h-4 mr-2 text-yellow-400" />
                        Special Ability
                      </h4>
                      <p className="text-gray-300">
                        {nftAttributes[selectedNFT.tokenId]?.specialAbility || 'No special ability'}
                      </p>
                    </div>

                    {/* Evolution Progress */}
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2 text-green-400" />
                        Evolution Progress
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Experience</span>
                          <span>{selectedNFT.experience.toLocaleString()} / {((selectedNFT.level + 1) * 1000).toLocaleString()}</span>
                        </div>
                        <Progress value={evolutionProgress[selectedNFT.tokenId] || 0} className="h-3" />
                        <div className="text-sm text-gray-400">
                          {getExperienceToNextLevel(selectedNFT).toLocaleString()} XP needed for next evolution
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter>
                    {canEvolve(selectedNFT) ? (
                      <Button
                        onClick={() => evolveNFT(selectedNFT.tokenId)}
                        className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                        disabled={isEvolving}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Evolve to Level {selectedNFT.level + 1}
                      </Button>
                    ) : canCompleteEvolution(selectedNFT) ? (
                      <Button
                        onClick={() => completeEvolution(selectedNFT.tokenId)}
                        className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete Evolution
                      </Button>
                    ) : selectedNFT.isEvolving ? (
                      <div className="w-full text-center">
                        <div className="text-lg text-orange-400 mb-2">Evolution in Progress</div>
                        <div className="text-sm text-gray-400">
                          Complete in {Math.ceil((24 * 60 * 60 * 1000 - (Date.now() - selectedNFT.lastEvolutionTime)) / (1000 * 60 * 60))} hours
                        </div>
                      </div>
                    ) : (
                      <div className="w-full text-center text-gray-400">
                        Keep learning to evolve this NFT!
                      </div>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EvolvingNFTGallery;
