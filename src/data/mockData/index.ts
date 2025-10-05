// Main Mock Data Module Export
export * from './types';
export * from './data';
export * from './service';
export * from './utils';

// Re-export commonly used items for convenience
export { 
  mockDataService as MockDataService,
  getMockData,
  getPlayers,
  getPlayerByAddress,
  getQuests,
  getActiveQuests,
  getNFTs,
  getGuilds,
  getTournaments,
  getLeaderboard,
  getAnalytics,
  getLiveDemoSession
} from './service';

export {
  MockDataGenerator,
  MockDataState,
  mockDataState,
  MOCK_DATA_CONSTANTS,
  validateMockData,
  exportMockData,
  importMockData
} from './utils';

export type { MockDataConfig, MockDataEvent } from './utils';
