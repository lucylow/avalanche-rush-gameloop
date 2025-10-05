// Mock Data Configuration and Utilities
export interface MockDataConfig {
  enableMockData: boolean;
  useRealTimeUpdates: boolean;
  demoMode: boolean;
  autoGenerateEvents: boolean;
}

export const defaultMockConfig: MockDataConfig = {
  enableMockData: true,
  useRealTimeUpdates: false,
  demoMode: true,
  autoGenerateEvents: false
};

// Mock Data Event Types for Real-time Simulation
export interface MockDataEvent {
  type: 'player_update' | 'quest_completed' | 'nft_minted' | 'tournament_update' | 'chat_message';
  timestamp: number;
  data: any;
}

// Mock Data Generator Utilities
export class MockDataGenerator {
  private static generateRandomAddress(): string {
    const chars = '0123456789abcdef';
    let result = '0x';
    for (let i = 0; i < 40; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  private static generateRandomUsername(): string {
    const prefixes = ['Crypto', 'Web3', 'DeFi', 'NFT', 'Chain', 'Block', 'Meta', 'Ava'];
    const suffixes = ['Runner', 'Master', 'King', 'Queen', 'Wizard', 'Ninja', 'Warrior', 'Explorer'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${prefix}${suffix}`;
  }

  public static generateRandomPlayer() {
    return {
      address: this.generateRandomAddress(),
      username: this.generateRandomUsername(),
      level: Math.floor(Math.random() * 30) + 1,
      experience: Math.floor(Math.random() * 100000),
      totalScore: Math.floor(Math.random() * 500000),
      currentStreak: Math.floor(Math.random() * 50),
      totalGamesPlayed: Math.floor(Math.random() * 200),
      preferredCharacter: ['Lyla', 'Nobu', 'Sam', 'Ava'][Math.floor(Math.random() * 4)],
      skills: {
        deFiMastery: Math.floor(Math.random() * 100),
        nftExpertise: Math.floor(Math.random() * 100),
        crossChain: Math.floor(Math.random() * 100),
        validator: Math.floor(Math.random() * 100)
      },
      ownedNFTs: Array.from({ length: Math.floor(Math.random() * 10) }, () => Math.floor(Math.random() * 1000)),
      guild: ['Avalanche Warriors', 'DeFi Masters', 'NFT Legends', 'Chain Runners'][Math.floor(Math.random() * 4)]
    };
  }

  public static generateRandomGameSession(playerAddress: string) {
    const modes = ['classic', 'challenge', 'quest'];
    const mode = modes[Math.floor(Math.random() * modes.length)];
    const startTime = Date.now() - Math.floor(Math.random() * 86400000); // Last 24 hours
    const duration = Math.floor(Math.random() * 3600) + 300; // 5 minutes to 1 hour
    
    return {
      sessionId: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      player: playerAddress,
      startTime,
      endTime: startTime + duration,
      mode,
      finalScore: Math.floor(Math.random() * 50000),
      levelReached: Math.floor(Math.random() * 20) + 1,
      distance: Math.floor(Math.random() * 2000),
      coinsCollected: Math.floor(Math.random() * 1000),
      powerUpsUsed: Math.floor(Math.random() * 20),
      comboMultiplier: Math.floor(Math.random() * 10) + 1,
      completedQuests: Array.from({ length: Math.floor(Math.random() * 5) }, () => Math.floor(Math.random() * 20)),
      newNFTs: Array.from({ length: Math.floor(Math.random() * 3) }, () => Math.floor(Math.random() * 1000)),
      rewardsClaimed: Math.random() > 0.5
    };
  }

  public static generateRandomChatMessage(sender: string) {
    const messages = [
      "Anyone up for a challenge?",
      "Great game everyone!",
      "New quest just dropped!",
      "Check out my new NFT!",
      "Guild battle starting soon!",
      "Who wants to team up?",
      "Amazing score!",
      "Let's go Avalanche!",
      "DeFi quest completed!",
      "Cross-chain bridge successful!"
    ];
    
    return {
      sender,
      timestamp: Date.now(),
      text: messages[Math.floor(Math.random() * messages.length)]
    };
  }
}

// Mock Data State Management
export class MockDataState {
  private static instance: MockDataState;
  private config: MockDataConfig = defaultMockConfig;
  private events: MockDataEvent[] = [];

  private constructor() {}

  public static getInstance(): MockDataState {
    if (!MockDataState.instance) {
      MockDataState.instance = new MockDataState();
    }
    return MockDataState.instance;
  }

  public getConfig(): MockDataConfig {
    return this.config;
  }

  public updateConfig(newConfig: Partial<MockDataConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public addEvent(event: MockDataEvent): void {
    this.events.push(event);
    // Keep only last 100 events
    if (this.events.length > 100) {
      this.events = this.events.slice(-100);
    }
  }

  public getEvents(): MockDataEvent[] {
    return this.events;
  }

  public getRecentEvents(limit: number = 10): MockDataEvent[] {
    return this.events
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  public clearEvents(): void {
    this.events = [];
  }
}

// Export singleton instance
export const mockDataState = MockDataState.getInstance();

// Mock Data Constants
export const MOCK_DATA_CONSTANTS = {
  DEFAULT_PLAYER_COUNT: 4,
  DEFAULT_QUEST_COUNT: 5,
  DEFAULT_NFT_COUNT: 6,
  DEFAULT_GUILD_COUNT: 2,
  DEFAULT_TOURNAMENT_COUNT: 2,
  DEFAULT_CHAT_MESSAGES_PER_CHANNEL: 4,
  REFRESH_INTERVAL: 5000, // 5 seconds
  EVENT_GENERATION_INTERVAL: 10000 // 10 seconds
};

// Mock Data Validation
export const validateMockData = (data: any): boolean => {
  try {
    // Basic validation - can be extended
    return data && typeof data === 'object';
  } catch (error) {
    console.error('Mock data validation failed:', error);
    return false;
  }
};

// Mock Data Export Helper
export const exportMockData = (data: any): string => {
  try {
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Failed to export mock data:', error);
    return '{}';
  }
};

// Mock Data Import Helper
export const importMockData = (jsonString: string): any => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to import mock data:', error);
    return null;
  }
};
