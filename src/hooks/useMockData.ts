import { useState, useEffect, useCallback } from 'react';
import { 
  mockDataService, 
  mockDataState, 
  MockDataConfig, 
  MockDataEvent,
  MOCK_DATA_CONSTANTS 
} from '../data/mockData';

export interface UseMockDataReturn {
  // Data getters
  players: any[];
  quests: any[];
  nfts: any[];
  guilds: any[];
  tournaments: any[];
  leaderboard: any;
  analytics: any;
  socialData: any;
  
  // Service methods
  getPlayerByAddress: (address: string) => any;
  getPlayerStats: (address: string) => any;
  getActiveQuests: () => any[];
  getNFTsByOwner: (owner: string) => any[];
  getGuildStats: (guildId: string) => any;
  
  // Configuration
  config: MockDataConfig;
  updateConfig: (newConfig: Partial<MockDataConfig>) => void;
  
  // Events
  events: MockDataEvent[];
  addEvent: (event: MockDataEvent) => void;
  
  // Utilities
  isMockDataEnabled: boolean;
  toggleMockData: () => void;
  refreshData: () => void;
}

export const useMockData = (): UseMockDataReturn => {
  const [config, setConfig] = useState<MockDataConfig>(mockDataState.getConfig());
  const [events, setEvents] = useState<MockDataEvent[]>(mockDataState.getEvents());
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Update config
  const updateConfig = useCallback((newConfig: Partial<MockDataConfig>) => {
    mockDataState.updateConfig(newConfig);
    setConfig(mockDataState.getConfig());
  }, []);

  // Toggle mock data
  const toggleMockData = useCallback(() => {
    updateConfig({ enableMockData: !config.enableMockData });
  }, [config.enableMockData, updateConfig]);

  // Add event
  const addEvent = useCallback((event: MockDataEvent) => {
    mockDataState.addEvent(event);
    setEvents(mockDataState.getEvents());
  }, []);

  // Refresh data
  const refreshData = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Get all data
  const players = mockDataService.getPlayers();
  const quests = mockDataService.getQuests();
  const nfts = mockDataService.getNFTs();
  const guilds = mockDataService.getGuilds();
  const tournaments = mockDataService.getTournaments();
  const leaderboard = mockDataService.getLeaderboard();
  const analytics = mockDataService.getAnalytics();
  const socialData = mockDataService.getSocialData();

  // Service methods
  const getPlayerByAddress = useCallback((address: string) => {
    return mockDataService.getPlayerByAddress(address);
  }, []);

  const getPlayerStats = useCallback((address: string) => {
    return mockDataService.getPlayerStats(address);
  }, []);

  const getActiveQuests = useCallback(() => {
    return mockDataService.getActiveQuests();
  }, []);

  const getNFTsByOwner = useCallback((owner: string) => {
    return mockDataService.getNFTsByOwner(owner);
  }, []);

  const getGuildStats = useCallback((guildId: string) => {
    return mockDataService.getGuildStats(guildId);
  }, []);

  // Auto-refresh if enabled
  useEffect(() => {
    if (!config.useRealTimeUpdates) return;

    const interval = setInterval(() => {
      refreshData();
    }, MOCK_DATA_CONSTANTS.REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [config.useRealTimeUpdates, refreshData]);

  // Auto-generate events if enabled
  useEffect(() => {
    if (!config.autoGenerateEvents) return;

    const interval = setInterval(() => {
      const randomPlayer = mockDataService.getRandomPlayer();
      const eventTypes: MockDataEvent['type'][] = [
        'player_update',
        'quest_completed',
        'nft_minted',
        'tournament_update',
        'chat_message'
      ];
      
      const randomEventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      
      addEvent({
        type: randomEventType,
        timestamp: Date.now(),
        data: { player: randomPlayer.username, ...randomPlayer }
      });
    }, MOCK_DATA_CONSTANTS.EVENT_GENERATION_INTERVAL);

    return () => clearInterval(interval);
  }, [config.autoGenerateEvents, addEvent]);

  return {
    // Data
    players,
    quests,
    nfts,
    guilds,
    tournaments,
    leaderboard,
    analytics,
    socialData,
    
    // Service methods
    getPlayerByAddress,
    getPlayerStats,
    getActiveQuests,
    getNFTsByOwner,
    getGuildStats,
    
    // Configuration
    config,
    updateConfig,
    
    // Events
    events,
    addEvent,
    
    // Utilities
    isMockDataEnabled: config.enableMockData,
    toggleMockData,
    refreshData
  };
};

// Hook for mock data with specific player context
export const useMockDataWithPlayer = (playerAddress?: string) => {
  const mockData = useMockData();
  const [playerData, setPlayerData] = useState<any>(null);
  const [playerStats, setPlayerStats] = useState<any>(null);

  useEffect(() => {
    if (playerAddress && mockData.isMockDataEnabled) {
      const player = mockData.getPlayerByAddress(playerAddress);
      const stats = mockData.getPlayerStats(playerAddress);
      
      setPlayerData(player);
      setPlayerStats(stats);
    }
  }, [playerAddress, mockData.isMockDataEnabled, mockData.refreshData]);

  return {
    ...mockData,
    playerData,
    playerStats,
    playerQuests: playerData ? mockData.getActiveQuests() : [],
    playerNFTs: playerData ? mockData.getNFTsByOwner(playerData.username) : [],
    playerGuild: playerData ? mockData.guilds.find(g => g.name === playerData.guild) : null
  };
};

// Hook for demo mode with enhanced features
export const useMockDataDemo = () => {
  const mockData = useMockData();
  const [demoMode, setDemoMode] = useState(false);

  const enableDemoMode = useCallback(() => {
    mockData.updateConfig({
      demoMode: true,
      enableMockData: true,
      useRealTimeUpdates: true,
      autoGenerateEvents: true
    });
    setDemoMode(true);
  }, [mockData]);

  const disableDemoMode = useCallback(() => {
    mockData.updateConfig({
      demoMode: false,
      useRealTimeUpdates: false,
      autoGenerateEvents: false
    });
    setDemoMode(false);
  }, [mockData]);

  const simulateLiveEvent = useCallback((eventType: MockDataEvent['type']) => {
    const randomPlayer = mockDataService.getRandomPlayer();
    mockData.addEvent({
      type: eventType,
      timestamp: Date.now(),
      data: { player: randomPlayer.username, ...randomPlayer }
    });
  }, [mockData]);

  return {
    ...mockData,
    demoMode,
    enableDemoMode,
    disableDemoMode,
    simulateLiveEvent
  };
};
