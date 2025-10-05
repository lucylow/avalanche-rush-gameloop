import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

// VRF Contract ABI (simplified for demo)
const VRF_CONTRACT_ABI = [
  "function requestRandomness(uint8 eventType, uint256 gameSessionId) external returns (bytes32)",
  "function getRandomnessResult(bytes32 requestId) external view returns (bool fulfilled, uint256 randomResult)",
  "function getPlayerRequestCount(address player) external view returns (uint256)",
  "function getEventTypeStats(uint8 eventType) external view returns (uint256 count, uint256 maxValue)",
  "event RandomnessRequested(bytes32 indexed requestId, address indexed player, uint8 eventType, uint256 gameSessionId)",
  "event RandomnessFulfilled(bytes32 indexed requestId, address indexed player, uint8 eventType, uint256 randomResult, uint256 gameSessionId)"
];

// Event types matching the contract
export enum RandomEventType {
  DAILY_CHALLENGE = 0,
  NFT_REWARD_RARITY = 1,
  POWER_UP_SPAWN = 2,
  OBSTACLE_PATTERN = 3,
  TOURNAMENT_MATCH = 4,
  QUEST_REWARD = 5,
  SPECIAL_EVENT = 6,
  BONUS_MULTIPLIER = 7
}

interface RandomnessRequest {
  requestId: string;
  player: string;
  eventType: RandomEventType;
  gameSessionId: number;
  timestamp: number;
  fulfilled: boolean;
  randomResult?: number;
}

interface VRFStats {
  playerRequestCount: number;
  eventTypeStats: Record<RandomEventType, { count: number; maxValue: number }>;
}

export const useChainlinkVRF = () => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<RandomnessRequest[]>([]);
  const [stats, setStats] = useState<VRFStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Contract addresses for different networks
  const VRF_CONTRACT_ADDRESSES = {
    43114: '0x...', // Avalanche Mainnet (to be deployed)
    43113: '0x...', // Avalanche Fuji Testnet (to be deployed)
    42: '0x...',    // Reactive Network (to be deployed)
  };

  // Initialize contract connection
  useEffect(() => {
    const initializeContract = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const network = await provider.getNetwork();
          
          const contractAddress = VRF_CONTRACT_ADDRESSES[Number(network.chainId) as keyof typeof VRF_CONTRACT_ADDRESSES];
          
          if (contractAddress) {
            const vrfContract = new ethers.Contract(contractAddress, VRF_CONTRACT_ABI, signer);
            setContract(vrfContract);
            setIsConnected(true);
            
            // Load initial stats
            await loadStats(signer.address);
            
            // Listen for events
            setupEventListeners(vrfContract);
          }
        } catch (error) {
          console.error('Failed to initialize VRF contract:', error);
        }
      }
    };

    initializeContract();
  }, []);

  // Setup event listeners for VRF events
  const setupEventListeners = (contract: ethers.Contract) => {
    // Listen for randomness fulfillment
    contract.on('RandomnessFulfilled', (requestId, player, eventType, randomResult, gameSessionId) => {
      console.log('Randomness fulfilled:', { requestId, player, eventType, randomResult, gameSessionId });
      
      // Update pending requests
      setPendingRequests(prev => 
        prev.map(req => 
          req.requestId === requestId 
            ? { ...req, fulfilled: true, randomResult: Number(randomResult) }
            : req
        )
      );
      
      // Trigger game event based on type
      triggerGameEvent(eventType, Number(randomResult), Number(gameSessionId));
    });
  };

  // Request randomness for a specific game event
  const requestRandomness = useCallback(async (
    eventType: RandomEventType,
    gameSessionId: number
  ): Promise<string | null> => {
    if (!contract) {
      console.error('VRF contract not connected');
      return null;
    }

    try {
      setIsLoading(true);
      
      const tx = await contract.requestRandomness(eventType, gameSessionId);
      const receipt = await tx.wait();
      
      // Extract request ID from events
      const event = receipt.logs.find(log => 
        log.topics[0] === contract.interface.getEvent('RandomnessRequested').topicHash
      );
      
      if (event) {
        const decodedEvent = contract.interface.parseLog(event);
        const requestId = decodedEvent.args.requestId;
        
        // Add to pending requests
        const newRequest: RandomnessRequest = {
          requestId,
          player: await (contract.runner as any)?.getAddress(),
          eventType,
          gameSessionId,
          timestamp: Date.now(),
          fulfilled: false
        };
        
        setPendingRequests(prev => [...prev, newRequest]);
        
        console.log('Randomness requested:', newRequest);
        return requestId;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to request randomness:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [contract]);

  // Check if a request has been fulfilled
  const checkRandomnessResult = useCallback(async (requestId: string) => {
    if (!contract) return null;

    try {
      const [fulfilled, randomResult] = await contract.getRandomnessResult(requestId);
      return fulfilled ? Number(randomResult) : null;
    } catch (error) {
      console.error('Failed to check randomness result:', error);
      return null;
    }
  }, [contract]);

  // Load player statistics
  const loadStats = useCallback(async (playerAddress: string) => {
    if (!contract) return;

    try {
      const playerRequestCount = await contract.getPlayerRequestCount(playerAddress);
      
      // Load stats for each event type
      const eventTypeStats: Record<RandomEventType, { count: number; maxValue: number }> = {} as any;
      
      for (let i = 0; i < 8; i++) {
        const [count, maxValue] = await contract.getEventTypeStats(i);
        eventTypeStats[i as RandomEventType] = { count: Number(count), maxValue: Number(maxValue) };
      }
      
      setStats({
        playerRequestCount: Number(playerRequestCount),
        eventTypeStats
      });
    } catch (error) {
      console.error('Failed to load VRF stats:', error);
    }
  }, [contract]);

  // Trigger game events based on VRF results
  const triggerGameEvent = useCallback((eventType: RandomEventType, randomResult: number, gameSessionId: number) => {
    switch (eventType) {
      case RandomEventType.DAILY_CHALLENGE:
        triggerDailyChallenge(randomResult);
        break;
      case RandomEventType.NFT_REWARD_RARITY:
        triggerNFTReward(randomResult);
        break;
      case RandomEventType.POWER_UP_SPAWN:
        triggerPowerUpSpawn(randomResult);
        break;
      case RandomEventType.OBSTACLE_PATTERN:
        triggerObstaclePattern(randomResult);
        break;
      case RandomEventType.TOURNAMENT_MATCH:
        triggerTournamentMatch(randomResult);
        break;
      case RandomEventType.QUEST_REWARD:
        triggerQuestReward(randomResult);
        break;
      case RandomEventType.SPECIAL_EVENT:
        triggerSpecialEvent(randomResult);
        break;
      case RandomEventType.BONUS_MULTIPLIER:
        triggerBonusMultiplier(randomResult);
        break;
    }
  }, []);

  // Game event handlers
  const triggerDailyChallenge = (randomValue: number) => {
    const challenges = [
      'Collect 50 coins without taking damage',
      'Survive for 2 minutes straight',
      'Achieve a 10x combo',
      'Collect 3 energy crystals in one run',
      'Complete 5 levels in tutorial mode'
    ];
    
    const challengeIndex = randomValue % challenges.length;
    const challenge = challenges[challengeIndex];
    
    // Trigger reward system
    if ((window as any).triggerReward) {
      (window as any).triggerReward('dailyChallenge', { challenge, difficulty: randomValue });
    }
    
    console.log('Daily Challenge:', challenge);
  };

  const triggerNFTReward = (randomValue: number) => {
    let rarity: string;
    let rewardAmount: number;
    
    if (randomValue < 10) {
      rarity = 'Legendary';
      rewardAmount = 1000;
    } else if (randomValue < 100) {
      rarity = 'Epic';
      rewardAmount = 500;
    } else if (randomValue < 500) {
      rarity = 'Rare';
      rewardAmount = 200;
    } else {
      rarity = 'Common';
      rewardAmount = 50;
    }
    
    // Trigger reward system
    if ((window as any).triggerReward) {
      (window as any).triggerReward('nftReward', { rarity, amount: rewardAmount });
    }
    
    console.log('NFT Reward:', { rarity, amount: rewardAmount });
  };

  const triggerPowerUpSpawn = (randomValue: number) => {
    const powerUps = [
      'Shield', 'Speed Boost', 'Magnet', 'Double Points', 'Extra Life'
    ];
    
    const powerUpIndex = randomValue % powerUps.length;
    const powerUp = powerUps[powerUpIndex];
    
    console.log('Power-up Spawned:', powerUp);
    
    // Trigger game engine power-up spawn
    if ((window as any).spawnPowerUp) {
      (window as any).spawnPowerUp(powerUp);
    }
  };

  const triggerObstaclePattern = (randomValue: number) => {
    const patterns = [
      'Single Line', 'Double Line', 'Zigzag', 'Spiral', 'Random Cluster'
    ];
    
    const patternIndex = randomValue % patterns.length;
    const pattern = patterns[patternIndex];
    
    console.log('Obstacle Pattern:', pattern);
    
    // Trigger game engine pattern change
    if ((window as any).changeObstaclePattern) {
      (window as any).changeObstaclePattern(pattern);
    }
  };

  const triggerTournamentMatch = (randomValue: number) => {
    const difficulty = Math.floor(randomValue / 1000) + 1;
    const opponentId = randomValue % 10000;
    
    console.log('Tournament Match:', { difficulty, opponentId });
    
    // Trigger tournament system
    if ((window as any).startTournamentMatch) {
      (window as any).startTournamentMatch(difficulty, opponentId);
    }
  };

  const triggerQuestReward = (randomValue: number) => {
    const rewards = [
      { type: 'RUSH', amount: randomValue * 10 },
      { type: 'XP', amount: randomValue * 5 },
      { type: 'Energy', amount: Math.min(randomValue, 100) }
    ];
    
    const rewardIndex = randomValue % rewards.length;
    const reward = rewards[rewardIndex];
    
    console.log('Quest Reward:', reward);
    
    // Trigger reward system
    if ((window as any).triggerReward) {
      (window as any).triggerReward('questComplete', reward);
    }
  };

  const triggerSpecialEvent = (randomValue: number) => {
    const events = [
      'Meteor Shower', 'Aurora Borealis', 'Lightning Storm', 'Rainbow Bridge', 'Comet Trail'
    ];
    
    const eventIndex = randomValue % events.length;
    const event = events[eventIndex];
    
    console.log('Special Event:', event);
    
    // Trigger special event system
    if ((window as any).triggerSpecialEvent) {
      (window as any).triggerSpecialEvent(event);
    }
  };

  const triggerBonusMultiplier = (randomValue: number) => {
    const multiplier = (randomValue % 5) + 1; // 1x to 5x multiplier
    
    console.log('Bonus Multiplier:', multiplier);
    
    // Trigger bonus system
    if ((window as any).triggerReward) {
      (window as any).triggerReward('bonusMultiplier', { multiplier });
    }
  };

  // Utility functions for game integration
  const getRandomDailyChallenge = useCallback(async (gameSessionId: number) => {
    return await requestRandomness(RandomEventType.DAILY_CHALLENGE, gameSessionId);
  }, [requestRandomness]);

  const getRandomNFTReward = useCallback(async (gameSessionId: number) => {
    return await requestRandomness(RandomEventType.NFT_REWARD_RARITY, gameSessionId);
  }, [requestRandomness]);

  const getRandomPowerUp = useCallback(async (gameSessionId: number) => {
    return await requestRandomness(RandomEventType.POWER_UP_SPAWN, gameSessionId);
  }, [requestRandomness]);

  const getRandomObstaclePattern = useCallback(async (gameSessionId: number) => {
    return await requestRandomness(RandomEventType.OBSTACLE_PATTERN, gameSessionId);
  }, [requestRandomness]);

  const getRandomTournamentMatch = useCallback(async (gameSessionId: number) => {
    return await requestRandomness(RandomEventType.TOURNAMENT_MATCH, gameSessionId);
  }, [requestRandomness]);

  const getRandomQuestReward = useCallback(async (gameSessionId: number) => {
    return await requestRandomness(RandomEventType.QUEST_REWARD, gameSessionId);
  }, [requestRandomness]);

  const getRandomSpecialEvent = useCallback(async (gameSessionId: number) => {
    return await requestRandomness(RandomEventType.SPECIAL_EVENT, gameSessionId);
  }, [requestRandomness]);

  const getRandomBonusMultiplier = useCallback(async (gameSessionId: number) => {
    return await requestRandomness(RandomEventType.BONUS_MULTIPLIER, gameSessionId);
  }, [requestRandomness]);

  return {
    isConnected,
    isLoading,
    pendingRequests,
    stats,
    requestRandomness,
    checkRandomnessResult,
    loadStats,
    // Convenience methods
    getRandomDailyChallenge,
    getRandomNFTReward,
    getRandomPowerUp,
    getRandomObstaclePattern,
    getRandomTournamentMatch,
    getRandomQuestReward,
    getRandomSpecialEvent,
    getRandomBonusMultiplier
  };
};
