import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChainlinkVRF, RandomEventType } from '../../hooks/useChainlinkVRF';

interface RandomnessRequest {
  eventType: RandomEventType;
  randomResult?: unknown;
  gameSessionId: number;
  fulfilled: boolean;
}

interface VRFGameEventsProps {
  gameSessionId: number;
  onRandomEvent: (eventType: string, data: Record<string, unknown>) => void;
}

const VRFGameEvents: React.FC<VRFGameEventsProps> = ({ gameSessionId, onRandomEvent }) => {
  const {
    isConnected,
    isLoading,
    pendingRequests,
    stats,
    getRandomDailyChallenge,
    getRandomNFTReward,
    getRandomPowerUp,
    getRandomObstaclePattern,
    getRandomSpecialEvent,
    getRandomBonusMultiplier
  } = useChainlinkVRF();

  const [activeEvents, setActiveEvents] = useState<string[]>([]);
  const [lastRandomEvent, setLastRandomEvent] = useState<Record<string, unknown> | null>(null);

  // Trigger random events based on game progression
  useEffect(() => {
    if (!isConnected || !gameSessionId) return;

    // Trigger initial random events
    const initializeRandomEvents = async () => {
      try {
        // Request daily challenge
        await getRandomDailyChallenge(gameSessionId);
        
        // Request special event (low probability)
        if (Math.random() < 0.1) {
          await getRandomSpecialEvent(gameSessionId);
        }
      } catch (error) {
        console.error('Failed to initialize random events:', error);
      }
    };

    initializeRandomEvents();
  }, [isConnected, gameSessionId, getRandomDailyChallenge, getRandomSpecialEvent]);

  // Handle VRF results
  useEffect(() => {
    const handleVRFResults = () => {
      pendingRequests.forEach(request => {
        if (request.fulfilled && request.randomResult !== undefined) {
          handleRandomResult(request);
        }
      });
    };

    handleVRFResults();
  }, [pendingRequests]);

  const handleRandomResult = useCallback((request: RandomnessRequest) => {
    const { eventType, randomResult, gameSessionId } = request;
    
    let eventData: Record<string, unknown> = {};
    
    switch (eventType) {
      case RandomEventType.DAILY_CHALLENGE:
        eventData = generateDailyChallenge(Number(randomResult));
        break;
      case RandomEventType.NFT_REWARD_RARITY:
        eventData = generateNFTReward(Number(randomResult));
        break;
      case RandomEventType.POWER_UP_SPAWN:
        eventData = generatePowerUp(Number(randomResult));
        break;
      case RandomEventType.OBSTACLE_PATTERN:
        eventData = generateObstaclePattern(Number(randomResult));
        break;
      case RandomEventType.SPECIAL_EVENT:
        eventData = generateSpecialEvent(Number(randomResult));
        break;
      case RandomEventType.BONUS_MULTIPLIER:
        eventData = generateBonusMultiplier(Number(randomResult));
        break;
    }
    
    setLastRandomEvent({ type: eventType, data: eventData, timestamp: Date.now() });
    onRandomEvent(eventType.toString(), eventData);
  }, [onRandomEvent]);

  // Generate daily challenge based on VRF result
  const generateDailyChallenge = (randomValue: number) => {
    const challenges = [
      {
        id: 'collect_coins',
        title: 'Coin Collector',
        description: 'Collect 50 coins without taking damage',
        reward: '100 RUSH + XP',
        difficulty: 'Medium',
        icon: '🪙'
      },
      {
        id: 'survival_master',
        title: 'Survival Master',
        description: 'Survive for 2 minutes straight',
        reward: '150 RUSH + Rare NFT',
        difficulty: 'Hard',
        icon: '🛡️'
      },
      {
        id: 'combo_king',
        title: 'Combo King',
        description: 'Achieve a 10x combo streak',
        reward: '200 RUSH + Epic NFT',
        difficulty: 'Expert',
        icon: '🔥'
      },
      {
        id: 'energy_hunter',
        title: 'Energy Hunter',
        description: 'Collect 3 energy crystals in one run',
        reward: '75 RUSH + Energy Boost',
        difficulty: 'Easy',
        icon: '💎'
      },
      {
        id: 'tutorial_master',
        title: 'Tutorial Master',
        description: 'Complete 5 levels in tutorial mode',
        reward: '50 RUSH + Beginner NFT',
        difficulty: 'Beginner',
        icon: '📚'
      }
    ];
    
    const challengeIndex = randomValue % challenges.length;
    return challenges[challengeIndex];
  };

  // Generate NFT reward based on VRF result
  const generateNFTReward = (randomValue: number) => {
    let rarity: string;
    let rewardAmount: number;
    let nftType: string;
    
    if (randomValue < 10) {
      rarity = 'Legendary';
      rewardAmount = 1000;
      nftType = 'Golden Avalanche';
    } else if (randomValue < 100) {
      rarity = 'Epic';
      rewardAmount = 500;
      nftType = 'Crystal Peak';
    } else if (randomValue < 500) {
      rarity = 'Rare';
      rewardAmount = 200;
      nftType = 'Frozen Summit';
    } else {
      rarity = 'Common';
      rewardAmount = 50;
      nftType = 'Snowflake';
    }
    
    return {
      rarity,
      rewardAmount,
      nftType,
      tokenId: randomValue,
      metadata: {
        name: `${nftType} NFT`,
        description: `A ${rarity.toLowerCase()} NFT earned through Chainlink VRF`,
        image: `https://api.avalanche-rush.com/nft/${nftType.toLowerCase().replace(' ', '-')}.png`,
        attributes: [
          { trait_type: 'Rarity', value: rarity },
          { trait_type: 'Type', value: nftType },
          { trait_type: 'VRF Generated', value: 'true' }
        ]
      }
    };
  };

  // Generate power-up based on VRF result
  const generatePowerUp = (randomValue: number) => {
    const powerUps = [
      {
        id: 'shield',
        name: 'Shield',
        description: 'Protects from one obstacle hit',
        duration: 10,
        icon: '🛡️',
        rarity: 'Common'
      },
      {
        id: 'speed_boost',
        name: 'Speed Boost',
        description: 'Increases movement speed by 50%',
        duration: 15,
        icon: '⚡',
        rarity: 'Common'
      },
      {
        id: 'magnet',
        name: 'Coin Magnet',
        description: 'Automatically collects nearby coins',
        duration: 20,
        icon: '🧲',
        rarity: 'Rare'
      },
      {
        id: 'double_points',
        name: 'Double Points',
        description: 'Doubles all score points',
        duration: 30,
        icon: '💯',
        rarity: 'Rare'
      },
      {
        id: 'extra_life',
        name: 'Extra Life',
        description: 'Grants an additional life',
        duration: 0,
        icon: '❤️',
        rarity: 'Epic'
      }
    ];
    
    const powerUpIndex = randomValue % powerUps.length;
    return powerUps[powerUpIndex];
  };

  // Generate obstacle pattern based on VRF result
  const generateObstaclePattern = (randomValue: number) => {
    const patterns = [
      {
        id: 'single_line',
        name: 'Single Line',
        description: 'Obstacles in a straight line',
        difficulty: 1,
        spawnRate: 0.8
      },
      {
        id: 'double_line',
        name: 'Double Line',
        description: 'Two parallel lines of obstacles',
        difficulty: 2,
        spawnRate: 0.6
      },
      {
        id: 'zigzag',
        name: 'Zigzag Pattern',
        description: 'Obstacles in a zigzag formation',
        difficulty: 3,
        spawnRate: 0.4
      },
      {
        id: 'spiral',
        name: 'Spiral Formation',
        description: 'Obstacles in a spiral pattern',
        difficulty: 4,
        spawnRate: 0.2
      },
      {
        id: 'random_cluster',
        name: 'Random Cluster',
        description: 'Randomly placed obstacle clusters',
        difficulty: 5,
        spawnRate: 0.1
      }
    ];
    
    const patternIndex = randomValue % patterns.length;
    return patterns[patternIndex];
  };

  // Generate special event based on VRF result
  const generateSpecialEvent = (randomValue: number) => {
    const events = [
      {
        id: 'meteor_shower',
        name: 'Meteor Shower',
        description: 'Meteors fall from the sky, destroying obstacles',
        effect: 'clear_obstacles',
        duration: 10,
        icon: '☄️'
      },
      {
        id: 'aurora_borealis',
        name: 'Aurora Borealis',
        description: 'Beautiful aurora provides bonus points',
        effect: 'bonus_points',
        multiplier: 2,
        duration: 15,
        icon: '🌌'
      },
      {
        id: 'lightning_storm',
        name: 'Lightning Storm',
        description: 'Lightning strikes obstacles randomly',
        effect: 'random_destruction',
        duration: 8,
        icon: '⚡'
      },
      {
        id: 'rainbow_bridge',
        name: 'Rainbow Bridge',
        description: 'Safe passage across dangerous areas',
        effect: 'safe_passage',
        duration: 20,
        icon: '🌈'
      },
      {
        id: 'comet_trail',
        name: 'Comet Trail',
        description: 'Follow the comet for massive rewards',
        effect: 'treasure_trail',
        duration: 25,
        icon: '☄️'
      }
    ];
    
    const eventIndex = randomValue % events.length;
    return events[eventIndex];
  };

  // Generate bonus multiplier based on VRF result
  const generateBonusMultiplier = (randomValue: number) => {
    const multiplier = (randomValue % 5) + 1; // 1x to 5x multiplier
    
    return {
      multiplier,
      description: `${multiplier}x Score Multiplier`,
      duration: 30,
      icon: '🎯'
    };
  };

  // Request random events manually
  const requestRandomEvent = useCallback(async (eventType: RandomEventType) => {
    try {
      switch (eventType) {
        case RandomEventType.DAILY_CHALLENGE:
          await getRandomDailyChallenge(gameSessionId);
          break;
        case RandomEventType.NFT_REWARD_RARITY:
          await getRandomNFTReward(gameSessionId);
          break;
        case RandomEventType.POWER_UP_SPAWN:
          await getRandomPowerUp(gameSessionId);
          break;
        case RandomEventType.OBSTACLE_PATTERN:
          await getRandomObstaclePattern(gameSessionId);
          break;
        case RandomEventType.SPECIAL_EVENT:
          await getRandomSpecialEvent(gameSessionId);
          break;
        case RandomEventType.BONUS_MULTIPLIER:
          await getRandomBonusMultiplier(gameSessionId);
          break;
      }
    } catch (error) {
      console.error('Failed to request random event:', error);
    }
  }, [gameSessionId, getRandomDailyChallenge, getRandomNFTReward, getRandomPowerUp, getRandomObstaclePattern, getRandomSpecialEvent, getRandomBonusMultiplier]);

  return (
    <div className="vrf-game-events">
      {/* VRF Status Indicator */}
      <div className="fixed top-20 right-4 z-40">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-xl shadow-lg border border-purple-400/30"
        >
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ rotate: isLoading ? 360 : 0 }}
              transition={{ duration: 1, repeat: isLoading ? Infinity : 0 }}
              className="text-2xl"
            >
              {isConnected ? '🎲' : '❌'}
            </motion.div>
            <div>
              <div className="font-bold text-sm">
                Chainlink VRF {isConnected ? 'Connected' : 'Disconnected'}
              </div>
              <div className="text-xs text-purple-200">
                {pendingRequests.length} pending requests
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Last Random Event Display */}
      <AnimatePresence>
        {lastRandomEvent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-2xl shadow-2xl border border-green-400/30 max-w-md">
              <div className="text-center">
                {(() => {
                  const randomEvent: any = lastRandomEvent.data;
                  const eventIcon = randomEvent?.icon || '🎲';
                  const eventName = randomEvent?.name || randomEvent?.title || 'Random Event';
                  const eventDescription = randomEvent?.description || 'A random event occurred!';
                  const eventReward = randomEvent?.reward;

                  return (
                    <>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl mb-3"
                      >
                        {eventIcon}
                      </motion.div>
                      <h3 className="text-xl font-bold mb-2">{eventName}</h3>
                      <p className="text-sm text-green-200 mb-3">{eventDescription}</p>
                      {eventReward && (
                        <div className="bg-green-500/20 px-3 py-1 rounded-full text-xs font-semibold">
                          Reward: {eventReward}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VRF Stats Panel */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 right-4 bg-black/80 backdrop-blur-sm text-white p-4 rounded-xl border border-gray-600/30"
        >
          <h4 className="font-bold text-sm mb-2">VRF Statistics</h4>
          <div className="text-xs space-y-1">
            <div>Total Requests: {stats.playerRequestCount}</div>
            <div>Pending: {pendingRequests.length}</div>
            <div>Daily Challenges: {stats.eventTypeStats[RandomEventType.DAILY_CHALLENGE].count}</div>
            <div>NFT Rewards: {stats.eventTypeStats[RandomEventType.NFT_REWARD_RARITY].count}</div>
          </div>
        </motion.div>
      )}

      {/* Manual Event Triggers (for testing) */}
      <div className="fixed bottom-4 left-4 space-y-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => requestRandomEvent(RandomEventType.DAILY_CHALLENGE)}
          disabled={isLoading}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
        >
          🎯 Daily Challenge
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => requestRandomEvent(RandomEventType.NFT_REWARD_RARITY)}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
        >
          🏆 NFT Reward
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => requestRandomEvent(RandomEventType.SPECIAL_EVENT)}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
        >
          ⚡ Special Event
        </motion.button>
      </div>
    </div>
  );
};

export default VRFGameEvents;
