import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers, BrowserProvider } from 'ethers';
import { 
  Zap, 
  Brain, 
  Network, 
  Trophy, 
  Target,
  TrendingUp,
  Users,
  Activity,
  BarChart3,
  Cpu,
  Globe,
  Shield,
  Star,
  Award,
  Rocket
} from 'lucide-react';

// Contract ABIs (simplified for demo)
const REACTIVE_QUEST_ENGINE_ABI = [
  "function startGameSession(address player, uint256[] questIds, uint256 chainId) external returns (uint256)",
  "function completeGameSession(uint256 sessionId, uint256 finalScore, uint256[] completedQuests) external",
  "function react(bytes32 eventId, address emitter, bytes data, uint256 sourceChain) external",
  "function migrateNFT(uint256 tokenId, uint64 destinationChainSelector, address recipient) external payable",
  "function calculateOptimalDifficulty(address player) external view returns (uint256)",
  "function getPlayerStats(address player) external view returns (uint256, uint256, uint256, uint256, uint256)",
  "event QuestCompleted(address indexed player, bytes32 indexed questId, uint256 reward, uint256 chainId)",
  "event CrossChainEventDetected(bytes32 indexed eventId, uint256 sourceChain, address emitter)",
  "event NFTEvolved(address indexed player, uint256 tokenId, uint256 newRarity)"
];

const AVALANCHE_SUBNET_ABI = [
  "function updateGameState(tuple(address player, uint256 score, uint256 level, uint256 lives, uint256 energy, uint256 timestamp, bytes32 gameHash) state, tuple(bytes32 gameStateHash, uint256 timestamp, address player, bytes signature, bool verified) proof) external",
  "function batchUpdateGameStates(tuple(address player, uint256 score, uint256 level, uint256 lives, uint256 energy, uint256 timestamp, bytes32 gameHash)[] states, tuple(bytes32 gameStateHash, uint256 timestamp, address player, bytes signature, bool verified)[] proofs) external",
  "function sendCrossSubnetMessage(uint256 targetSubnet, bytes message) external payable",
  "function getCurrentTPS() external view returns (uint256)",
  "function getPerformanceMetrics() external view returns (uint256, uint256, uint256, uint256, uint256)",
  "event GameStateUpdated(address indexed player, uint256 score, uint256 timestamp)",
  "event LeaderboardUpdated(address indexed player, uint256 position, uint256 score)"
];

const DYNAMIC_DIFFICULTY_ABI = [
  "function calculateOptimalDifficulty(address player) external returns (bytes32)",
  "function updatePlayerProfile(address player, uint256 score, uint256 playtimeMinutes, bool gameCompleted) external",
  "function predictChurnProbability(address player) external view returns (uint256)",
  "function getEngagementStrategy(address player) external view returns (string)",
  "function getPlayerProfile(address player) external view returns (uint256, uint256, uint256, uint256, uint256, uint256)",
  "event DifficultyCalculated(address indexed player, uint256 oldDifficulty, uint256 newDifficulty)",
  "event MLRequestSubmitted(address indexed player, uint256 requestId)"
];

interface AdvancedGameIntegrationProps {
  account: string | null;
  provider: BrowserProvider | null;
  chainId: number;
}

interface PerformanceMetrics {
  tps: number;
  totalUpdates: number;
  gaslessTransactions: number;
  warpMessages: number;
  leaderboardEntries: number;
}

interface PlayerProfile {
  skillLevel: number;
  playtimeHours: number;
  averageScore: number;
  retentionRate: number;
  gamesPlayed: number;
  lastDifficulty: number;
}

interface CrossChainEvent {
  eventId: string;
  sourceChain: number;
  emitter: string;
  timestamp: number;
  processed: boolean;
}

const AdvancedGameIntegration: React.FC<AdvancedGameIntegrationProps> = ({
  account,
  provider,
  chainId
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null);
  const [crossChainEvents, setCrossChainEvents] = useState<CrossChainEvent[]>([]);
  const [currentDifficulty, setCurrentDifficulty] = useState<number>(50);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  
  // Contract instances
  const [reactiveQuestEngine, setReactiveQuestEngine] = useState<ethers.Contract | null>(null);
  const [avalancheSubnet, setAvalancheSubnet] = useState<ethers.Contract | null>(null);
  const [dynamicDifficulty, setDynamicDifficulty] = useState<ethers.Contract | null>(null);

  // Contract addresses (would be actual deployed addresses)
  const CONTRACT_ADDRESSES = {
    reactiveQuestEngine: "0x742d35Cc5A5E2a9E1aB8d8C6E6E9F4A5B8D35a9",
    avalancheSubnet: "0x8a1d5C5E3A5E2a9E1aB8d8C6E6E9F4A5B8D35b0",
    dynamicDifficulty: "0x9b2d5C5E3A5E2a9E1aB8d8C6E6E9F4A5B8D35c1"
  };

  // Initialize contracts
  useEffect(() => {
    if (provider && account) {
      const initContracts = async () => {
        const signer = await provider.getSigner();
        
        setReactiveQuestEngine(new ethers.Contract(
          CONTRACT_ADDRESSES.reactiveQuestEngine,
          REACTIVE_QUEST_ENGINE_ABI,
          signer
        ));
        
        setAvalancheSubnet(new ethers.Contract(
          CONTRACT_ADDRESSES.avalancheSubnet,
          AVALANCHE_SUBNET_ABI,
          signer
        ));
        
        setDynamicDifficulty(new ethers.Contract(
          CONTRACT_ADDRESSES.dynamicDifficulty,
          DYNAMIC_DIFFICULTY_ABI,
          signer
        ));
        
        setIsConnected(true);
        loadPlayerData();
      };
      
      initContracts();
    }
  }, [provider, account]);

  // Load player data
  const loadPlayerData = useCallback(async () => {
    if (!reactiveQuestEngine || !dynamicDifficulty || !account) return;

    try {
      setIsLoading(true);
      
      // Load player profile
      const profile = await dynamicDifficulty.getPlayerProfile(account);
      setPlayerProfile({
        skillLevel: profile[0].toNumber(),
        playtimeHours: profile[1].toNumber(),
        averageScore: profile[2].toNumber(),
        retentionRate: profile[3].toNumber(),
        gamesPlayed: profile[4].toNumber(),
        lastDifficulty: profile[5].toNumber()
      });
      
      setCurrentDifficulty(profile[5].toNumber());
      
      // Load performance metrics
      if (avalancheSubnet) {
        const metrics = await avalancheSubnet.getPerformanceMetrics();
        setPerformanceMetrics({
          tps: metrics[0].toNumber(),
          totalUpdates: metrics[1].toNumber(),
          gaslessTransactions: metrics[2].toNumber(),
          warpMessages: metrics[3].toNumber(),
          leaderboardEntries: metrics[4].toNumber()
        });
      }
      
    } catch (error) {
      console.error('Error loading player data:', error);
      addNotification('Error loading player data');
    } finally {
      setIsLoading(false);
    }
  }, [reactiveQuestEngine, dynamicDifficulty, avalancheSubnet, account]);

  // Start advanced game session
  const startAdvancedGameSession = async () => {
    if (!reactiveQuestEngine || !account) return;

    try {
      setIsLoading(true);
      
      const questIds = [1, 2, 3]; // Example quest IDs
      const sessionId = await reactiveQuestEngine.startGameSession(account, questIds, chainId);
      
      addNotification(`Advanced game session started! Session ID: ${sessionId.toString()}`);
      
    } catch (error) {
      console.error('Error starting game session:', error);
      addNotification('Error starting game session');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate optimal difficulty using AI
  const calculateOptimalDifficulty = async () => {
    if (!dynamicDifficulty || !account) return;

    try {
      setIsLoading(true);
      
      const requestId = await dynamicDifficulty.calculateOptimalDifficulty(account);
      
      addNotification(`AI difficulty calculation requested! Request ID: ${requestId}`);
      
      // Listen for response
      dynamicDifficulty.on('DifficultyCalculated', (player, oldDifficulty, newDifficulty) => {
        if (player.toLowerCase() === account?.toLowerCase()) {
          setCurrentDifficulty(newDifficulty.toNumber());
          addNotification(`Difficulty adjusted from ${oldDifficulty} to ${newDifficulty}`);
        }
      });
      
    } catch (error) {
      console.error('Error calculating difficulty:', error);
      addNotification('Error calculating difficulty');
    } finally {
      setIsLoading(false);
    }
  };

  // Update game state with zero-gas transaction
  const updateGameState = async (score: number, level: number) => {
    if (!avalancheSubnet || !account) return;

    try {
      setIsLoading(true);
      
      const gameState = {
        player: account,
        score: score,
        level: level,
        lives: 3,
        energy: 100,
        timestamp: Math.floor(Date.now() / 1000),
        gameHash: ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(
          ['address', 'uint256', 'uint256'],
          [account, score, level]
        ))
      };
      
      const proof = {
        gameStateHash: gameState.gameHash,
        timestamp: gameState.timestamp,
        player: account,
        signature: "0x", // Would be actual signature
        verified: true
      };
      
      await avalancheSubnet.updateGameState(gameState, proof);
      
      addNotification(`Game state updated! Score: ${score}, Level: ${level}`);
      
    } catch (error) {
      console.error('Error updating game state:', error);
      addNotification('Error updating game state');
    } finally {
      setIsLoading(false);
    }
  };

  // Send cross-subnet message
  const sendCrossSubnetMessage = async (targetSubnet: number, message: string) => {
    if (!avalancheSubnet) return;

    try {
      setIsLoading(true);
      
      const messageBytes = ethers.toUtf8Bytes(message);
      await avalancheSubnet.sendCrossSubnetMessage(targetSubnet, messageBytes, {
        value: ethers.parseEther("0.01") // 0.01 AVAX for gas
      });
      
      addNotification(`Cross-subnet message sent to subnet ${targetSubnet}`);
      
    } catch (error) {
      console.error('Error sending cross-subnet message:', error);
      addNotification('Error sending cross-subnet message');
    } finally {
      setIsLoading(false);
    }
  };

  // Migrate NFT to another chain
  const migrateNFT = async (tokenId: number, destinationChain: number) => {
    if (!reactiveQuestEngine) return;

    try {
      setIsLoading(true);
      
      const chainSelectors = {
        1: BigInt('5009297550715157269'), // Ethereum
        137: BigInt('4051577828743386545'), // Polygon
        43114: BigInt('14767482510784806043') // Avalanche
      };
      
      const destinationChainSelector = chainSelectors[destinationChain as keyof typeof chainSelectors];
      
      await reactiveQuestEngine.migrateNFT(tokenId, destinationChainSelector, account, {
        value: ethers.parseEther("0.01") // 0.01 AVAX for gas
      });
      
      addNotification(`NFT ${tokenId} migrated to chain ${destinationChain}`);
      
    } catch (error) {
      console.error('Error migrating NFT:', error);
      addNotification('Error migrating NFT');
    } finally {
      setIsLoading(false);
    }
  };

  // Add notification
  const addNotification = (message: string) => {
    setNotifications(prev => [...prev, message]);
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 5000);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white">Connecting to advanced gaming protocols...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-4">
            🚀 Avalanche Rush - Advanced Gaming Protocol
          </h1>
          <p className="text-xl text-gray-300">
            Multi-chain reactive gaming with AI-powered difficulty and 5000+ TPS performance
          </p>
        </div>

        {/* Performance Metrics Dashboard */}
        {performanceMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-center">
              <Cpu className="w-8 h-8 text-blue-200 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{performanceMetrics.tps}</div>
              <div className="text-blue-200 text-sm">TPS</div>
            </div>
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-center">
              <Activity className="w-8 h-8 text-green-200 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{performanceMetrics.totalUpdates.toLocaleString()}</div>
              <div className="text-green-200 text-sm">Updates</div>
            </div>
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-center">
              <Zap className="w-8 h-8 text-purple-200 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{performanceMetrics.gaslessTransactions.toLocaleString()}</div>
              <div className="text-purple-200 text-sm">Gasless TX</div>
            </div>
            <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-6 text-center">
              <Network className="w-8 h-8 text-orange-200 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{performanceMetrics.warpMessages.toLocaleString()}</div>
              <div className="text-orange-200 text-sm">Warp Messages</div>
            </div>
            <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-6 text-center">
              <Trophy className="w-8 h-8 text-red-200 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{performanceMetrics.leaderboardEntries.toLocaleString()}</div>
              <div className="text-red-200 text-sm">Players</div>
            </div>
          </div>
        )}

        {/* Player Profile */}
        {playerProfile && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 mb-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-400" />
              AI-Powered Player Profile
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white font-semibold">Skill Level</span>
                  <Target className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-blue-400">{playerProfile.skillLevel}</div>
                <div className="text-sm text-gray-400">/ 10</div>
              </div>
              
              <div className="bg-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white font-semibold">Retention Rate</span>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-3xl font-bold text-green-400">{playerProfile.retentionRate}%</div>
                <div className="text-sm text-gray-400">AI Optimized</div>
              </div>
              
              <div className="bg-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white font-semibold">Current Difficulty</span>
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-3xl font-bold text-purple-400">{currentDifficulty}</div>
                <div className="text-sm text-gray-400">/ 100</div>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Reactive Smart Contracts */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-400" />
              Reactive Smart Contracts
            </h3>
            
            <div className="space-y-4">
              <button
                onClick={startAdvancedGameSession}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50"
              >
                Start Advanced Game Session
              </button>
              
              <button
                onClick={() => migrateNFT(1, 1)}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50"
              >
                Migrate NFT to Ethereum
              </button>
              
              <button
                onClick={() => migrateNFT(1, 137)}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50"
              >
                Migrate NFT to Polygon
              </button>
            </div>
          </div>

          {/* AI-Powered Features */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-400" />
              AI-Powered Features
            </h3>
            
            <div className="space-y-4">
              <button
                onClick={calculateOptimalDifficulty}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50"
              >
                Calculate Optimal Difficulty
              </button>
              
              <button
                onClick={() => updateGameState(15000, 5)}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50"
              >
                Update Game State (Zero-Gas)
              </button>
              
              <button
                onClick={() => sendCrossSubnetMessage(99999, "Hello from Avalanche Rush!")}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50"
              >
                Send Cross-Subnet Message
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <AnimatePresence>
          {notifications.map((notification, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-4 right-4 bg-white text-gray-900 px-4 py-3 rounded-lg shadow-lg z-50 max-w-md"
            >
              {notification}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
              <span className="text-gray-900 font-medium">Processing advanced operation...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedGameIntegration;
