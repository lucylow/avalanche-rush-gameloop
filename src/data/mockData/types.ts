// Mock Data Types for Avalanche Rush Demo
export interface PlayerProfile {
  address: string;
  username: string;
  level: number;
  experience: number;
  totalScore: number;
  currentStreak: number;
  totalGamesPlayed: number;
  preferredCharacter: string;
  skills: {
    deFiMastery: number;
    nftExpertise: number;
    crossChain: number;
    validator: number;
  };
  ownedNFTs: number[];
  guild: string;
}

export interface GameSession {
  sessionId: string;
  player: string;
  startTime: number;
  endTime: number;
  mode: 'classic' | 'challenge' | 'quest';
  finalScore: number;
  levelReached: number;
  distance: number;
  coinsCollected: number;
  powerUpsUsed: number;
  comboMultiplier: number;
  completedQuests: number[];
  newNFTs: number[];
  rewardsClaimed: boolean;
  sessionHash?: string;
}

export interface Quest {
  questId: number;
  name: string;
  description?: string;
  type: 'TRANSFER' | 'DEFI' | 'BRIDGE' | 'ONBOARDING' | 'CROSSCHAIN';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  reward: number;
  nftReward: number;
  verificationContract?: string;
  criteria?: Record<string, any>;
  isActive?: boolean;
  completionRate?: number;
  averageCompletionTime?: number;
  status?: 'active' | 'completed' | 'locked';
  contractAddress?: string;
}

export interface AchievementNFT {
  tokenId: number;
  name: string;
  description: string;
  image: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary' | 'Epic';
  questType?: string;
  difficulty?: string;
  rewardPoints?: number;
  owner: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export interface Guild {
  guildId: string;
  name: string;
  description?: string;
  leader: string;
  members: string[];
  reputation: number;
  level: number;
  resources: {
    energy: number;
    knowledge: number;
  };
  treasury: number;
  warsWon: number;
  warsLost: number;
  currentQuest?: string;
  guildWarsWon?: number;
  guildWarsLost?: number;
}

export interface Tournament {
  tournamentId: string;
  name: string;
  status: 'upcoming' | 'live' | 'in-progress' | 'completed';
  entryFee: number;
  prizePool: number;
  currentParticipants?: number;
  maxParticipants?: number;
  startTime: number;
  participants: string[];
  bracket?: {
    rounds: Array<{
      roundNumber: number;
      matches: Array<{
        matchId: string;
        players: string[];
        winner?: string;
      }>;
    }>;
  };
  rounds?: Array<{
    roundNumber: number;
    matches: Array<{
      matchId: string;
      players: string[];
      winner?: string;
    }>;
  }>;
  prizes: Array<{
    position: number;
    reward: number;
    nftReward: string;
  }>;
}

export interface LeaderboardEntry {
  username: string;
  score: number;
  mode?: string;
  timestamp: number;
}

export interface Leaderboard {
  classic: LeaderboardEntry[];
  challenge: LeaderboardEntry[];
  mode?: string;
  entries?: LeaderboardEntry[];
}

export interface ChatMessage {
  sender: string;
  timestamp: number;
  text: string;
  ts?: number;
}

export interface ChatChannel {
  channelId?: string;
  channel?: string;
  type: 'global' | 'guild';
  messages: ChatMessage[];
}

export interface SocialData {
  chatChannels: ChatChannel[];
  friendInvitations?: Array<{
    from: string;
    to: string;
    message: string;
  }>;
  guildInvitations?: Array<{
    guild: string;
    invitee: string;
  }>;
}

export interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  retentionRate: number;
  averageSessionTime: number;
  questCompletionRate: number;
  activeToday?: number;
}

export interface GameMetrics {
  totalGamesPlayed: number;
  averageScore: number;
  highestScore: number;
  totalPlayTime?: number;
  totalGames?: number;
  questCompletionRate?: number;
}

export interface BlockchainMetrics {
  totalTransactions: number;
  totalGasUsed?: string;
  contractInteractions: number;
  nftMints: number;
  tokenTransfers: number;
  totalTxs?: number;
  contractCalls?: number;
}

export interface RewardsDistribution {
  totalRewards: number;
  averageReward: number;
  pendingClaims: number;
}

export interface Analytics {
  userMetrics: UserMetrics;
  gameMetrics: GameMetrics;
  blockchainMetrics: BlockchainMetrics;
  rewardsDistribution?: RewardsDistribution;
}

export interface LiveDemoSession {
  player: string;
  mode: string;
  questId: number;
  action: string;
  fromChain?: string;
  toChain?: string;
  bridgeAmount?: number;
  status: string;
  NFTMinted?: number;
  nftMinted?: number;
  rewardsReceived: number;
  sessionHash?: string;
}

export interface MockData {
  players: PlayerProfile[];
  gameSessions: GameSession[];
  quests: Quest[];
  nfts: AchievementNFT[];
  guilds: Guild[];
  tournaments: Tournament[];
  leaderboard: Leaderboard;
  social: SocialData;
  analytics: Analytics;
  liveDemoSession?: LiveDemoSession;
}
