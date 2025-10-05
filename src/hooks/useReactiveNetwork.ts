import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

// Reactive Network Contract ABI
const REACTIVE_QUEST_ENGINE_ABI = [
  "function onGameSessionCompleted(address player, uint256 score, uint256 distance, uint256 coinsCollected, bytes32 sessionHash) external",
  "function getPlayerProgress(address player) external view returns (uint256 totalScore, uint256 achievementsUnlocked)",
  "function getReactiveStats() external view returns (uint256 totalGas, uint256 totalEvents, uint256 averageGas)",
  "function hasAchievement(address player, uint256 achievementId) external view returns (bool unlocked)",
  "event AchievementUnlocked(address indexed player, uint256 achievementId, uint256 reward)",
  "event ReactiveTriggered(bytes32 eventHash, uint256 gasUsed, uint256 achievementsAwarded)"
];

const GAME_SESSION_TRACKER_ABI = [
  "function recordGameSession(address player, uint256 score, uint256 distance, uint256 coinsCollected, uint256 obstaclesPassed, bytes32 sessionHash) external",
  "function getPlayerStats(address player) external view returns (uint256 sessionCount, uint256 totalScore, uint256 averageScore)",
  "function getGlobalStats() external view returns (uint256 totalSessions, uint256 totalScore, uint256 averageScore)",
  "event GameSessionCompleted(address indexed player, uint256 score, uint256 distance, uint256 coinsCollected, uint256 obstaclesPassed, bytes32 sessionHash, uint256 timestamp, uint256 chainId)"
];

interface PlayerProgress {
  totalScore: string;
  achievementsUnlocked: number;
}

interface ReactiveStats {
  totalGas: string;
  totalEvents: number;
  averageGas: string;
}

interface GameStats {
  sessionCount: number;
  totalScore: string;
  averageScore: string;
}

export const useReactiveNetwork = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [playerProgress, setPlayerProgress] = useState<PlayerProgress | null>(null);
  const [reactiveStats, setReactiveStats] = useState<ReactiveStats | null>(null);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);

  // Contract addresses
  const CONTRACT_ADDRESSES = {
    // Avalanche C-Chain (Origin)
    43114: {
      gameSessionTracker: '0x35dD7428f35a9E1742d35Cc5A6bA1d9F8Bc8aBc',
    },
    // Avalanche Fuji Testnet (Origin)
    43113: {
      gameSessionTracker: '0x35dD7428f35a9E1742d35Cc5A6bA1d9F8Bc8aBc',
    },
    // Reactive Mainnet (Reactive Contracts)
    42: {
      reactiveQuestEngine: '0x742d35Cc5A6bA1d9F8Bc8aBc35dD7428f35a9E1',
    }
  };

  // Initialize contract connections
  useEffect(() => {
    const initializeContracts = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const network = await provider.getNetwork();
          setCurrentChainId(Number(network.chainId));
          setIsConnected(true);
          
          // Load player data
          const signer = await provider.getSigner();
          await loadPlayerData(signer.address);
          
        } catch (error) {
          console.error('Failed to initialize Reactive Network contracts:', error);
        }
      }
    };

    initializeContracts();
  }, []);

  // Load player data from both origin and reactive contracts
  const loadPlayerData = useCallback(async (playerAddress: string) => {
    if (!window.ethereum) return;

    try {
      setIsLoading(true);
      
      // Get provider for current chain
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      if (chainId === 43114 || chainId === 43113) {
        // Load from Avalanche (Origin contract)
        await loadOriginData(provider, playerAddress, chainId);
      } else if (chainId === 42) {
        // Load from Reactive Network
        await loadReactiveData(provider, playerAddress);
      }

    } catch (error) {
      console.error('Failed to load player data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data from Avalanche origin contract
  const loadOriginData = async (provider: ethers.BrowserProvider, playerAddress: string, chainId: number) => {
    const contractAddress = (CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] as any)?.gameSessionTracker;
    if (!contractAddress) return;

    const contract = new ethers.Contract(contractAddress, GAME_SESSION_TRACKER_ABI, provider);
    
    try {
      const [sessionCount, totalScore, averageScore] = await contract.getPlayerStats(playerAddress);
      
      setGameStats({
        sessionCount: Number(sessionCount),
        totalScore: ethers.formatEther(totalScore),
        averageScore: ethers.formatEther(averageScore)
      });

      // Also load global stats
      const [globalSessions, globalScore, globalAverage] = await contract.getGlobalStats();
      console.log('Global Stats:', {
        sessions: Number(globalSessions),
        score: ethers.formatEther(globalScore),
        average: ethers.formatEther(globalAverage)
      });

    } catch (error) {
      console.error('Failed to load origin data:', error);
    }
  };

  // Load data from Reactive Network
  const loadReactiveData = async (provider: ethers.BrowserProvider, playerAddress: string) => {
    const contractAddress = CONTRACT_ADDRESSES[42]?.reactiveQuestEngine;
    if (!contractAddress) return;

    const contract = new ethers.Contract(contractAddress, REACTIVE_QUEST_ENGINE_ABI, provider);
    
    try {
      // Load player progress
      const [totalScore, achievementsUnlocked] = await contract.getPlayerProgress(playerAddress);
      
      setPlayerProgress({
        totalScore: ethers.formatEther(totalScore),
        achievementsUnlocked: Number(achievementsUnlocked)
      });

      // Load Reactive stats
      const [totalGas, totalEvents, averageGas] = await contract.getReactiveStats();
      
      setReactiveStats({
        totalGas: ethers.formatEther(totalGas),
        totalEvents: Number(totalEvents),
        averageGas: ethers.formatEther(averageGas)
      });

    } catch (error) {
      console.error('Failed to load reactive data:', error);
    }
  };

  // Record game session on Avalanche (which triggers Reactive processing)
  const recordGameSession = useCallback(async (
    score: number,
    distance: number,
    coinsCollected: number,
    obstaclesPassed: number
  ): Promise<boolean> => {
    if (!window.ethereum) return false;

    try {
      setIsLoading(true);
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      // Must be on Avalanche for origin transaction
      if (chainId !== 43114 && chainId !== 43113) {
        throw new Error('Must be on Avalanche C-Chain to record game sessions');
      }

      const contractAddress = (CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] as any)?.gameSessionTracker;
      if (!contractAddress) {
        throw new Error('Game session tracker not deployed on this network');
      }

      const contract = new ethers.Contract(contractAddress, GAME_SESSION_TRACKER_ABI, signer);
      
      // Generate unique session hash
      const sessionHash = ethers.keccak256(
        ethers.solidityPacked(
          ['address', 'uint256', 'uint256', 'uint256'],
          [signer.address, score, Date.now(), Math.random() * 1000000]
        )
      );

      // Record session on Avalanche (Origin)
      const tx = await contract.recordGameSession(
        signer.address,
        ethers.parseEther(score.toString()),
        distance,
        coinsCollected,
        obstaclesPassed,
        sessionHash
      );

      console.log('🏔️ Game session recorded on Avalanche:', tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed:', receipt);

      // The Reactive contract will automatically process this event
      // We can monitor for the ReactiveTriggered event
      
      // Reload player data after processing
      setTimeout(() => loadPlayerData(signer.address), 2000);
      
      return true;

    } catch (error) {
      console.error('Failed to record game session:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadPlayerData]);

  // Check if player has specific achievement
  const hasAchievement = useCallback(async (achievementId: number): Promise<boolean> => {
    if (!window.ethereum || currentChainId !== 42) return false;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const contractAddress = CONTRACT_ADDRESSES[42]?.reactiveQuestEngine;
      if (!contractAddress) return false;

      const contract = new ethers.Contract(contractAddress, REACTIVE_QUEST_ENGINE_ABI, provider);
      
      return await contract.hasAchievement(signer.address, achievementId);

    } catch (error) {
      console.error('Failed to check achievement:', error);
      return false;
    }
  }, [currentChainId]);

  // Get achievement requirements
  const getAchievementRequirements = useCallback(() => {
    return [
      { id: 1, name: 'Bronze Adventurer', requiredScore: 1000, reward: '100' },
      { id: 2, name: 'Silver Explorer', requiredScore: 5000, reward: '500' },
      { id: 3, name: 'Gold Master', requiredScore: 10000, reward: '1000' },
      { id: 4, name: 'Platinum Legend', requiredScore: 50000, reward: '5000' },
      { id: 5, name: 'Diamond Champion', requiredScore: 100000, reward: '10000' }
    ];
  }, []);

  // Setup event listeners for Reactive events
  const setupEventListeners = useCallback(() => {
    if (!window.ethereum || currentChainId !== 42) return;

    const setupListeners = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contractAddress = CONTRACT_ADDRESSES[42]?.reactiveQuestEngine;
        if (!contractAddress) return;

        const contract = new ethers.Contract(contractAddress, REACTIVE_QUEST_ENGINE_ABI, provider);

        // Listen for achievement unlocked events
        contract.on('AchievementUnlocked', (player, achievementId, reward, event) => {
          console.log('🎉 Achievement Unlocked via Reactive Contract:', {
            player,
            achievementId: Number(achievementId),
            reward: ethers.formatEther(reward)
          });

          // Trigger notification in UI
          if ((window as any).triggerReward) {
            (window as any).triggerReward('reactiveAchievement', {
              achievementId: Number(achievementId),
              reward: ethers.formatEther(reward)
            });
          }
        });

        // Listen for reactive triggered events
        contract.on('ReactiveTriggered', (eventHash, gasUsed, achievementsAwarded, event) => {
          console.log('⚡ Reactive Contract Triggered:', {
            eventHash,
            gasUsed: Number(gasUsed),
            achievementsAwarded: Number(achievementsAwarded)
          });
        });

      } catch (error) {
        console.error('Failed to setup event listeners:', error);
      }
    };

    setupListeners();
  }, [currentChainId]);

  // Setup listeners when on Reactive Network
  useEffect(() => {
    if (currentChainId === 42) {
      setupEventListeners();
    }
  }, [currentChainId, setupEventListeners]);

  // Check if on correct network for different operations
  const isOnAvalanche = useCallback(() => {
    return currentChainId === 43114 || currentChainId === 43113;
  }, [currentChainId]);

  const isOnReactive = useCallback(() => {
    return currentChainId === 42;
  }, [currentChainId]);

  // Get network information
  const getNetworkInfo = useCallback(() => {
    const networks = {
      43114: { name: 'Avalanche C-Chain', type: 'Origin', color: 'red' },
      43113: { name: 'Avalanche Fuji', type: 'Origin', color: 'yellow' },
      42: { name: 'Reactive Mainnet', type: 'Reactive', color: 'purple' }
    };

    return currentChainId ? networks[currentChainId as keyof typeof networks] : null;
  }, [currentChainId]);

  return {
    // State
    isConnected,
    isLoading,
    playerProgress,
    reactiveStats,
    gameStats,
    currentChainId,

    // Functions
    recordGameSession,
    hasAchievement,
    loadPlayerData,
    getAchievementRequirements,

    // Network utilities
    isOnAvalanche,
    isOnReactive,
    getNetworkInfo,

    // Contract addresses
    CONTRACT_ADDRESSES
  };
};
