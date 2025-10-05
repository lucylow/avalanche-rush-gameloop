import { MockData } from './types';

export const mockData: MockData = {
  players: [
    {
      address: "0xAbc123DEF4567890Abc123DEF4567890Abc123DE",
      username: "Web3Wanderer",
      level: 12,
      experience: 24750,
      totalScore: 114625,
      currentStreak: 17,
      totalGamesPlayed: 56,
      preferredCharacter: "Lyla-Explorer",
      skills: {
        deFiMastery: 61,
        nftExpertise: 44,
        crossChain: 35,
        validator: 22
      },
      ownedNFTs: [101, 118, 203],
      guild: "Avalanche Warriors"
    },
    {
      address: "0x9876543210FEDCBA9876543210FEDCBA98765432",
      username: "QuestStreaker",
      level: 18,
      experience: 41200,
      totalScore: 239830,
      currentStreak: 25,
      totalGamesPlayed: 102,
      preferredCharacter: "Nobu-Ninja",
      skills: {
        deFiMastery: 86,
        nftExpertise: 57,
        crossChain: 49,
        validator: 30
      },
      ownedNFTs: [107, 122, 301, 322],
      guild: "DeFi Masters"
    },
    {
      address: "0xC0deF00D1234567890abcdefC0deF00D12345678",
      username: "CryptoRunner",
      level: 15,
      experience: 31250,
      totalScore: 129900,
      currentStreak: 9,
      totalGamesPlayed: 38,
      preferredCharacter: "Sam-Speedster",
      skills: {
        deFiMastery: 74,
        nftExpertise: 39,
        crossChain: 29,
        validator: 16
      },
      ownedNFTs: [305, 402, 101],
      guild: "Avalanche Warriors"
    },
    {
      address: "0xab12cd34AB12cd34AB12cd34AB12cd34AB12cd34",
      username: "StakingQueen",
      level: 21,
      experience: 56780,
      totalScore: 234600,
      currentStreak: 21,
      totalGamesPlayed: 77,
      preferredCharacter: "Lyla-Ledger",
      skills: {
        deFiMastery: 95,
        nftExpertise: 68,
        crossChain: 47,
        validator: 41
      },
      ownedNFTs: [225, 309, 501, 502],
      guild: "DeFi Masters"
    }
  ],

  gameSessions: [
    {
      sessionId: "sess001",
      player: "0xAbc123DEF4567890Abc123DEF4567890Abc123DE",
      startTime: 1703123456,
      endTime: 1703124456,
      mode: "classic",
      finalScore: 14870,
      levelReached: 7,
      distance: 964,
      coinsCollected: 320,
      powerUpsUsed: 13,
      comboMultiplier: 4,
      completedQuests: [1, 3, 5, 11],
      newNFTs: [201],
      rewardsClaimed: true,
      sessionHash: "sess001_Abc123DE_1703123456"
    },
    {
      sessionId: "sess002",
      player: "0x9876543210FEDCBA9876543210FEDCBA98765432",
      startTime: 1703130000,
      endTime: 1703131800,
      mode: "challenge",
      finalScore: 18740,
      levelReached: 9,
      distance: 1137,
      coinsCollected: 400,
      powerUpsUsed: 17,
      comboMultiplier: 5,
      completedQuests: [4, 10, 12],
      newNFTs: [323],
      rewardsClaimed: true,
      sessionHash: "sess002_98765432_1703130000"
    },
    {
      sessionId: "sess_1001",
      player: "0xC0deF00D1234567890abcdefC0deF00D12345678",
      startTime: 1703459000,
      endTime: 1703461200,
      mode: "classic",
      finalScore: 10730,
      levelReached: 9,
      distance: 851,
      coinsCollected: 270,
      powerUpsUsed: 7,
      comboMultiplier: 3,
      completedQuests: [1, 5, 12],
      newNFTs: [401],
      rewardsClaimed: true
    },
    {
      sessionId: "sess_1002",
      player: "0xab12cd34AB12cd34AB12cd34AB12cd34AB12cd34",
      startTime: 1703461300,
      endTime: 1703462280,
      mode: "quest",
      finalScore: 15590,
      levelReached: 13,
      distance: 1093,
      coinsCollected: 450,
      powerUpsUsed: 11,
      comboMultiplier: 4,
      completedQuests: [4, 8, 10],
      newNFTs: [230, 503],
      rewardsClaimed: true
    }
  ],

  quests: [
    {
      questId: 1,
      name: "First Steps in Web3",
      description: "Complete your first blockchain transaction.",
      type: "TRANSFER",
      difficulty: "beginner",
      reward: 500,
      nftReward: 101,
      verificationContract: "0xQuestContract01",
      criteria: {
        transferAmount: ">= 0.1 AVAX"
      },
      isActive: true,
      completionRate: 0.77,
      averageCompletionTime: 120,
      status: "active"
    },
    {
      questId: 4,
      name: "DeFi Trailblazer",
      description: "Supply liquidity to Trader Joe and stake to earn RUSH.",
      type: "DEFI",
      difficulty: "intermediate",
      reward: 1500,
      nftReward: 122,
      verificationContract: "0xQuestContract02",
      criteria: {
        lpToken: "JLP",
        minStake: ">= 50 USDC"
      },
      isActive: true,
      completionRate: 0.41,
      averageCompletionTime: 260,
      status: "active"
    },
    {
      questId: 10,
      name: "Cross-Chain Conqueror",
      description: "Bridge assets between Avalanche and Ethereum.",
      type: "BRIDGE",
      difficulty: "advanced",
      reward: 3200,
      nftReward: 301,
      verificationContract: "0xQuestContract03",
      criteria: {
        bridgeAmount: ">= 0.5 AVAX",
        destinationChain: "Ethereum"
      },
      isActive: true,
      completionRate: 0.18,
      averageCompletionTime: 540,
      status: "active"
    },
    {
      questId: 5,
      name: "Liquidity Pioneer",
      type: "DEFI",
      difficulty: "intermediate",
      reward: 1200,
      nftReward: 2087,
      contractAddress: "0xDEFI001",
      status: "completed"
    },
    {
      questId: 12,
      name: "Cross-Chain Explorer",
      type: "BRIDGE",
      difficulty: "advanced",
      reward: 2500,
      nftReward: 2173,
      contractAddress: "0xBRIDGE101",
      status: "active"
    }
  ],

  nfts: [
    {
      tokenId: 101,
      name: "Bronze Adventurer",
      description: "Completed your first transfer.",
      image: "ipfs://QmBronzeAdventurerNFT",
      rarity: "Common",
      questType: "TRANSFER",
      difficulty: "Beginner",
      rewardPoints: 500,
      owner: "Web3Wanderer",
      attributes: [
        { trait_type: "Rarity", value: "Common" },
        { trait_type: "Quest", value: "TRANSFER" },
        { trait_type: "Reward", value: 500 }
      ]
    },
    {
      tokenId: 122,
      name: "Silver DeFi Star",
      description: "Provided DeFi liquidity.",
      image: "ipfs://QmSilverDeFiStarNFT",
      rarity: "Uncommon",
      questType: "DEFI",
      difficulty: "Intermediate",
      rewardPoints: 1500,
      owner: "QuestStreaker",
      attributes: [
        { trait_type: "Rarity", value: "Uncommon" },
        { trait_type: "Quest", value: "DEFI" },
        { trait_type: "Reward", value: 1500 }
      ]
    },
    {
      tokenId: 301,
      name: "Cross-Chain Champion",
      description: "Completed cross-chain bridge.",
      image: "ipfs://QmCrossChainChampionNFT",
      rarity: "Rare",
      questType: "BRIDGE",
      difficulty: "Advanced",
      rewardPoints: 3200,
      owner: "QuestStreaker",
      attributes: [
        { trait_type: "Rarity", value: "Rare" },
        { trait_type: "Quest", value: "BRIDGE" },
        { trait_type: "Reward", value: 3200 }
      ]
    },
    {
      tokenId: 305,
      name: "Bronze Achiever",
      description: "Completed your first wallet connection.",
      image: "ipfs://QmBronzeNFT",
      rarity: "Common",
      questType: "ONBOARD",
      difficulty: "Beginner",
      rewardPoints: 300,
      owner: "CryptoRunner"
    },
    {
      tokenId: 225,
      name: "DeFi Pioneer",
      description: "Provided liquidity on Trader Joe.",
      image: "ipfs://QmDeFiPioneerNFT",
      rarity: "Uncommon",
      rewardPoints: 1500,
      owner: "StakingQueen"
    },
    {
      tokenId: 501,
      name: "Bridge Commander",
      description: "Successfully completed a cross-chain bridge.",
      image: "ipfs://QmBridgeCommanderNFT",
      rarity: "Rare",
      rewardPoints: 4000,
      owner: "StakingQueen"
    }
  ],

  guilds: [
    {
      guildId: "g001",
      name: "Avalanche Warriors",
      description: "Elite guild for competitive Web3 gaming.",
      leader: "Web3Wanderer",
      members: ["Web3Wanderer", "BladeBuilder", "NFTNinja", "CryptoRunner"],
      reputation: 13400,
      level: 11,
      resources: {
        energy: 900,
        knowledge: 2100
      },
      treasury: 18700,
      warsWon: 6,
      warsLost: 2,
      currentQuest: "Guild Battle Royale"
    },
    {
      guildId: "g002",
      name: "DeFi Masters",
      description: "Guild focused on yield farming and liquidity provision.",
      leader: "QuestStreaker",
      members: ["QuestStreaker", "FarmKing", "StakingStar", "StakingQueen"],
      reputation: 7600,
      level: 9,
      resources: {
        energy: 620,
        knowledge: 1490
      },
      treasury: 9200,
      warsWon: 4,
      warsLost: 3,
      currentQuest: "Liquidity Showdown"
    }
  ],

  tournaments: [
    {
      tournamentId: "tourn01",
      name: "September Grand Prix",
      status: "live",
      entryFee: 1000,
      prizePool: 50000,
      currentParticipants: 24,
      maxParticipants: 64,
      startTime: 1703150000,
      participants: ["Web3Wanderer", "QuestStreaker", "CryptoRunner", "StakingQueen"],
      bracket: {
        rounds: [
          {
            roundNumber: 1,
            matches: [
              { matchId: "m01", players: ["Web3Wanderer", "NFTNinja"], winner: "Web3Wanderer" },
              { matchId: "m02", players: ["QuestStreaker", "FarmKing"], winner: "QuestStreaker" }
            ]
          }
        ]
      },
      prizes: [
        { position: 1, reward: 20000, nftReward: "gp_champ_nft" },
        { position: 2, reward: 10000, nftReward: "gp_silver_nft" }
      ]
    },
    {
      tournamentId: "tSepGrandPrix",
      name: "Early Adopter Cup",
      status: "in-progress",
      entryFee: 1200,
      prizePool: 65000,
      startTime: 1703154000,
      participants: ["CryptoRunner", "StakingQueen", "TxTrailblazer", "NFTMaster"],
      rounds: [
        {
          roundNumber: 1,
          matches: [
            { matchId: "m101", players: ["CryptoRunner", "NFTMaster"], winner: "CryptoRunner" },
            { matchId: "m102", players: ["StakingQueen", "TxTrailblazer"], winner: "StakingQueen" }
          ]
        }
      ],
      prizes: [
        { position: 1, reward: 30000, nftReward: "earlycup_champ_nft" },
        { position: 2, reward: 2500, nftReward: "earlycup_second_nft" }
      ]
    }
  ],

  leaderboard: {
    classic: [
      { username: "Web3Wanderer", score: 14870, mode: "classic", timestamp: 1703124456 },
      { username: "QuestStreaker", score: 14490, mode: "classic", timestamp: 1703129999 },
      { username: "CryptoRunner", score: 10730, timestamp: 1703461200 },
      { username: "StakingQueen", score: 9820, timestamp: 1703462280 }
    ],
    challenge: [
      { username: "QuestStreaker", score: 18740, mode: "challenge", timestamp: 1703131800 },
      { username: "Web3Wanderer", score: 13362, mode: "challenge", timestamp: 1703131600 },
      { username: "StakingQueen", score: 15590, timestamp: 1703462280 },
      { username: "CryptoRunner", score: 9940, timestamp: 1703459000 }
    ]
  },

  social: {
    chatChannels: [
      {
        channelId: "global_chat",
        type: "global",
        messages: [
          {
            sender: "Web3Wanderer",
            timestamp: 1703161200,
            text: "Anyone up for a speed run challenge?"
          },
          {
            sender: "QuestStreaker",
            timestamp: 1703161300,
            text: "I'm in! Let's try to beat our records."
          },
          {
            sender: "CryptoRunner",
            timestamp: 1703461300,
            text: "Anyone want to join my guild for challenge mode today?"
          },
          {
            sender: "StakingQueen",
            timestamp: 1703461400,
            text: "I need a partner for staking quest! DM me if you're up."
          }
        ]
      },
      {
        channelId: "guild_g001",
        type: "guild",
        messages: [
          {
            sender: "BladeBuilder",
            timestamp: 1703161400,
            text: "Treasury topped up! Ready for our next guild quest."
          },
          {
            sender: "NFTNinja",
            timestamp: 1703161500,
            text: "Who's joining the battle royale tonight?"
          },
          {
            sender: "TxTrailblazer",
            timestamp: 1703461450,
            text: "Treasury restocked, claim your rewards before tomorrow!"
          },
          {
            sender: "SpeedTactician",
            timestamp: 1703461500,
            text: "Achieved guild quest milestone, bonus coming soon 🚀"
          }
        ]
      }
    ],
    friendInvitations: [
      { from: "QuestStreaker", to: "Web3Wanderer", message: "Join me for liquidity farming!" }
    ],
    guildInvitations: [
      { guild: "Avalanche Warriors", invitee: "QuestStreaker" }
    ]
  },

  analytics: {
    userMetrics: {
      totalUsers: 2503,
      activeUsers: 1540,
      newUsersToday: 42,
      retentionRate: 0.82,
      averageSessionTime: 1275,
      questCompletionRate: 0.79
    },
    gameMetrics: {
      totalGamesPlayed: 10843,
      averageScore: 3911,
      highestScore: 18740,
      totalPlayTime: 8952110
    },
    blockchainMetrics: {
      totalTransactions: 32498,
      totalGasUsed: "31415926500000000000",
      contractInteractions: 14873,
      nftMints: 2521,
      tokenTransfers: 19934
    },
    rewardsDistribution: {
      totalRewards: 820310,
      averageReward: 439,
      pendingClaims: 17
    }
  },

  liveDemoSession: {
    player: "Web3Wanderer",
    mode: "quest",
    questId: 10,
    action: "bridge",
    fromChain: "Avalanche",
    toChain: "Ethereum",
    bridgeAmount: 0.8,
    status: "completed",
    NFTMinted: 301,
    rewardsReceived: 3200,
    sessionHash: "demo_sess_web3wanderer_eth"
  }
};
