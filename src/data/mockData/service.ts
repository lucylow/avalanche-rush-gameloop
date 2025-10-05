import { mockData } from './data';
import { 
  PlayerProfile, 
  GameSession, 
  Quest, 
  AchievementNFT, 
  Guild, 
  Tournament, 
  Leaderboard, 
  SocialData, 
  Analytics, 
  LiveDemoSession,
  ChatMessage,
  LeaderboardEntry
} from './types';

export class MockDataService {
  private static instance: MockDataService;
  private data = mockData;

  private constructor() {}

  public static getInstance(): MockDataService {
    if (!MockDataService.instance) {
      MockDataService.instance = new MockDataService();
    }
    return MockDataService.instance;
  }

  // Player Profile Methods
  public getPlayers(): PlayerProfile[] {
    return this.data.players;
  }

  public getPlayerByAddress(address: string): PlayerProfile | undefined {
    return this.data.players.find(player => player.address.toLowerCase() === address.toLowerCase());
  }

  public getPlayerByUsername(username: string): PlayerProfile | undefined {
    return this.data.players.find(player => player.username === username);
  }

  public getTopPlayers(limit: number = 10): PlayerProfile[] {
    return this.data.players
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit);
  }

  // Game Session Methods
  public getGameSessions(): GameSession[] {
    return this.data.gameSessions;
  }

  public getGameSessionsByPlayer(playerAddress: string): GameSession[] {
    return this.data.gameSessions.filter(session => 
      session.player.toLowerCase() === playerAddress.toLowerCase()
    );
  }

  public getGameSessionsByMode(mode: 'classic' | 'challenge' | 'quest'): GameSession[] {
    return this.data.gameSessions.filter(session => session.mode === mode);
  }

  public getRecentGameSessions(limit: number = 10): GameSession[] {
    return this.data.gameSessions
      .sort((a, b) => b.endTime - a.endTime)
      .slice(0, limit);
  }

  // Quest Methods
  public getQuests(): Quest[] {
    return this.data.quests;
  }

  public getActiveQuests(): Quest[] {
    return this.data.quests.filter(quest => quest.isActive !== false && quest.status === 'active');
  }

  public getQuestById(questId: number): Quest | undefined {
    return this.data.quests.find(quest => quest.questId === questId);
  }

  public getQuestsByType(type: Quest['type']): Quest[] {
    return this.data.quests.filter(quest => quest.type === type);
  }

  public getQuestsByDifficulty(difficulty: Quest['difficulty']): Quest[] {
    return this.data.quests.filter(quest => quest.difficulty === difficulty);
  }

  // NFT Methods
  public getNFTs(): AchievementNFT[] {
    return this.data.nfts;
  }

  public getNFTsByOwner(owner: string): AchievementNFT[] {
    return this.data.nfts.filter(nft => nft.owner === owner);
  }

  public getNFTById(tokenId: number): AchievementNFT | undefined {
    return this.data.nfts.find(nft => nft.tokenId === tokenId);
  }

  public getNFTsByRarity(rarity: AchievementNFT['rarity']): AchievementNFT[] {
    return this.data.nfts.filter(nft => nft.rarity === rarity);
  }

  // Guild Methods
  public getGuilds(): Guild[] {
    return this.data.guilds;
  }

  public getGuildById(guildId: string): Guild | undefined {
    return this.data.guilds.find(guild => guild.guildId === guildId);
  }

  public getGuildByName(name: string): Guild | undefined {
    return this.data.guilds.find(guild => guild.name === name);
  }

  public getTopGuilds(limit: number = 10): Guild[] {
    return this.data.guilds
      .sort((a, b) => b.reputation - a.reputation)
      .slice(0, limit);
  }

  // Tournament Methods
  public getTournaments(): Tournament[] {
    return this.data.tournaments;
  }

  public getActiveTournaments(): Tournament[] {
    return this.data.tournaments.filter(tournament => 
      tournament.status === 'live' || tournament.status === 'in-progress'
    );
  }

  public getTournamentById(tournamentId: string): Tournament | undefined {
    return this.data.tournaments.find(tournament => tournament.tournamentId === tournamentId);
  }

  // Leaderboard Methods
  public getLeaderboard(): Leaderboard {
    return this.data.leaderboard;
  }

  public getLeaderboardByMode(mode: 'classic' | 'challenge'): LeaderboardEntry[] {
    return this.data.leaderboard[mode] || [];
  }

  public getTopScores(mode: 'classic' | 'challenge', limit: number = 10): LeaderboardEntry[] {
    const entries = this.getLeaderboardByMode(mode);
    return entries
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // Social Methods
  public getSocialData(): SocialData {
    return this.data.social;
  }

  public getChatChannels(): ChatMessage[] {
    return this.data.social.chatChannels.flatMap(channel => channel.messages);
  }

  public getChatChannelById(channelId: string): ChatMessage[] {
    const channel = this.data.social.chatChannels.find(ch => ch.channelId === channelId);
    return channel ? channel.messages : [];
  }

  public getRecentChatMessages(limit: number = 20): ChatMessage[] {
    return this.getChatChannels()
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  // Analytics Methods
  public getAnalytics(): Analytics {
    return this.data.analytics;
  }

  public getUserMetrics() {
    return this.data.analytics.userMetrics;
  }

  public getGameMetrics() {
    return this.data.analytics.gameMetrics;
  }

  public getBlockchainMetrics() {
    return this.data.analytics.blockchainMetrics;
  }

  // Live Demo Methods
  public getLiveDemoSession(): LiveDemoSession | undefined {
    return this.data.liveDemoSession;
  }

  // Utility Methods
  public getRandomPlayer(): PlayerProfile {
    const players = this.getPlayers();
    return players[Math.floor(Math.random() * players.length)];
  }

  public getRandomQuest(): Quest {
    const quests = this.getActiveQuests();
    return quests[Math.floor(Math.random() * quests.length)];
  }

  public getRandomNFT(): AchievementNFT {
    const nfts = this.getNFTs();
    return nfts[Math.floor(Math.random() * nfts.length)];
  }

  public getRandomGuild(): Guild {
    const guilds = this.getGuilds();
    return guilds[Math.floor(Math.random() * guilds.length)];
  }

  // Search Methods
  public searchPlayers(query: string): PlayerProfile[] {
    const lowercaseQuery = query.toLowerCase();
    return this.data.players.filter(player => 
      player.username.toLowerCase().includes(lowercaseQuery) ||
      player.preferredCharacter.toLowerCase().includes(lowercaseQuery) ||
      player.guild.toLowerCase().includes(lowercaseQuery)
    );
  }

  public searchQuests(query: string): Quest[] {
    const lowercaseQuery = query.toLowerCase();
    return this.data.quests.filter(quest => 
      quest.name.toLowerCase().includes(lowercaseQuery) ||
      quest.description?.toLowerCase().includes(lowercaseQuery) ||
      quest.type.toLowerCase().includes(lowercaseQuery)
    );
  }

  public searchNFTs(query: string): AchievementNFT[] {
    const lowercaseQuery = query.toLowerCase();
    return this.data.nfts.filter(nft => 
      nft.name.toLowerCase().includes(lowercaseQuery) ||
      nft.description.toLowerCase().includes(lowercaseQuery) ||
      nft.rarity.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Statistics Methods
  public getPlayerStats(playerAddress: string) {
    const player = this.getPlayerByAddress(playerAddress);
    if (!player) return null;

    const sessions = this.getGameSessionsByPlayer(playerAddress);
    const nfts = this.getNFTsByOwner(player.username);
    const guild = this.getGuildByName(player.guild);

    return {
      player,
      totalSessions: sessions.length,
      averageScore: sessions.reduce((sum, session) => sum + session.finalScore, 0) / sessions.length,
      totalNFTs: nfts.length,
      guild,
      recentSessions: sessions.slice(0, 5)
    };
  }

  public getGuildStats(guildId: string) {
    const guild = this.getGuildById(guildId);
    if (!guild) return null;

    const members = this.data.players.filter(player => player.guild === guild.name);
    const totalMemberScore = members.reduce((sum, member) => sum + member.totalScore, 0);

    return {
      guild,
      memberCount: members.length,
      totalMemberScore,
      averageMemberScore: totalMemberScore / members.length,
      members
    };
  }
}

// Export singleton instance
export const mockDataService = MockDataService.getInstance();

// Export convenience functions
export const getMockData = () => mockDataService;
export const getPlayers = () => mockDataService.getPlayers();
export const getPlayerByAddress = (address: string) => mockDataService.getPlayerByAddress(address);
export const getQuests = () => mockDataService.getQuests();
export const getActiveQuests = () => mockDataService.getActiveQuests();
export const getNFTs = () => mockDataService.getNFTs();
export const getGuilds = () => mockDataService.getGuilds();
export const getTournaments = () => mockDataService.getTournaments();
export const getLeaderboard = () => mockDataService.getLeaderboard();
export const getAnalytics = () => mockDataService.getAnalytics();
export const getLiveDemoSession = () => mockDataService.getLiveDemoSession();
