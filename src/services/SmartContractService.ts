import { ethers, Contract, formatEther, parseEther } from 'ethers';

// Contract ABIs with full functionality
export const AVALANCHE_RUSH_CORE_ABI = [
  // Core game functions
  "function startGame(uint8 mode, uint256 difficulty, uint256 levelId) external returns (uint256)",
  "function completeGame(uint256 sessionId, uint256 finalScore, string[] calldata achievementsUnlocked, uint256[] calldata skillPointsEarned, string[] calldata skillNames) external",
  "function pauseGame(uint256 sessionId) external",
  "function resumeGame(uint256 sessionId) external",
  
  // Player profile functions
  "function getPlayerProfile(address player) external view returns (uint256, uint256, uint256, uint256, uint256, uint256, uint256, bool)",
  "function getGameSession(uint256 sessionId) external view returns (address, uint256, uint256, uint256, uint256, uint8, bool)",
  "function getSkillPoints(address player, string calldata skill) external view returns (uint256)",
  "function hasAchievement(address player, string calldata achievement) external view returns (bool)",
  
  // Leaderboard and stats
  "function getLeaderboard(uint8 mode, uint256 limit) external view returns (address[], uint256[], uint256[])",
  "function getPlayerStats(address player) external view returns (uint256, uint256, uint256, uint256, uint256)",
  "function getGlobalStats() external view returns (uint256, uint256, uint256, uint256)",
  
  // Level system
  "function getLevel(uint256 levelId) external view returns (string, uint256, uint256, uint256, bool)",
  "function getLevelCount() external view returns (uint256)",
  "function unlockLevel(address player, uint256 levelId) external",
  
  // Events
  "event GameStarted(address indexed player, uint256 sessionId, uint8 mode, uint256 timestamp)",
  "event GameCompleted(address indexed player, uint256 sessionId, uint256 finalScore, uint256 reward)",
  "event LevelCompleted(address indexed player, uint256 level, uint256 score)",
  "event HighScoreBeat(address indexed player, uint256 newScore, uint256 previousScore)",
  "event AchievementUnlocked(address indexed player, string achievement, uint8 aType)",
  "event StreakAchieved(address indexed player, uint256 streakDays)"
];

export const REACTIVE_QUEST_ENGINE_ABI = [
  // Quest management
  "function createQuest(uint256 questId, uint8 questType, uint8 difficulty, address creator, uint256 reward, uint256 duration, uint256 maxParticipants, bool isActive, uint256 startTime, uint256 endTime, string calldata description) external",
  "function completeQuest(uint256 questId) external",
  "function abandonQuest(uint256 questId) external",
  "function getQuest(uint256 questId) external view returns (uint256, uint8, uint8, address, uint256, uint256, uint256, bool, uint256, uint256, string)",
  
  // Player quest tracking
  "function getPlayerProfile(address player) external view returns (uint256, uint256, uint256, uint256, uint256, uint256, uint256)",
  "function questCompletions(address player, uint256 questId) external view returns (bool)",
  "function activeQuests(address player) external view returns (uint256[])",
  "function completedQuests(address player) external view returns (uint256[])",
  
  // Raffle system
  "function getCurrentRaffle() external view returns (uint256, uint256, uint256, uint256, uint256, bool)",
  "function enterRaffle(uint256 tickets) external",
  "function drawRaffleWinner() external",
  "function getRaffleParticipants(uint256 raffleId) external view returns (address[])",
  
  // Events
  "event QuestCompleted(address indexed player, uint256 questId, uint256 reward, uint256 timestamp)",
  "event QuestCreated(uint256 indexed questId, address creator, uint8 questType, uint256 reward)",
  "event RaffleEntered(address indexed player, uint256 raffleId, uint256 tickets)",
  "event RaffleWinner(uint256 raffleId, address winner, uint256 prize)"
];

export const EDUCATIONAL_NFT_ABI = [
  // Standard ERC721 functions
  "function balanceOf(address owner) external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
  "function tokenByIndex(uint256 index) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  
  // Achievement system
  "function achievements(uint256 tokenId) external view returns (uint256, uint256, uint256, string, bool, uint256)",
  "function mintAchievementNFT(address player, uint256 achievementId, string calldata metadata) external",
  "function getAchievementNFTs(address player) external view returns (uint256[])",
  
  // Raffle integration
  "function getCurrentRaffleId() external view returns (uint256)",
  "function raffleParticipants(uint256 raffleId, uint256 index) external view returns (address)",
  "function isRaffleParticipant(uint256 raffleId, address player) external view returns (bool)",
  
  // Events
  "event RareNFTMinted(address indexed player, uint256 tokenId, uint256 raffleId)",
  "event AchievementNFTMinted(address indexed player, uint256 tokenId, uint256 achievementId)"
];

export const RUSH_TOKEN_ABI = [
  // Standard ERC20 functions
  "function balanceOf(address account) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)",
  "function name() external view returns (string)",
  
  // Game integration
  "function mint(address to, uint256 amount) external",
  "function burn(uint256 amount) external",
  "function gameReward(address player, uint256 amount, string calldata reason) external",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event GameReward(address indexed player, uint256 amount, string reason)"
];

export const MOCK_DEX_ABI = [
  // Trading functions
  "function swapTokens(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut) external returns (uint256)",
  "function getPrice(address tokenA, address tokenB) external view returns (uint256)",
  "function getAmountOut(uint256 amountIn, address tokenA, address tokenB) external view returns (uint256)",
  "function addLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB) external",
  "function removeLiquidity(address tokenA, address tokenB, uint256 liquidity) external",
  
  // Pool management
  "function getPool(address tokenA, address tokenB) external view returns (uint256, uint256, uint256)",
  "function getReserves(address tokenA, address tokenB) external view returns (uint256, uint256)",
  
  // Events
  "event Swap(address indexed user, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut)",
  "event LiquidityAdded(address indexed user, address tokenA, address tokenB, uint256 amountA, uint256 amountB)",
  "event LiquidityRemoved(address indexed user, address tokenA, address tokenB, uint256 liquidity)"
];

// Contract addresses - will be updated after deployment
export const CONTRACT_ADDRESSES = {
  AVALANCHE_RUSH_CORE: import.meta.env.VITE_AVALANCHE_RUSH_CORE || "0x1234567890123456789012345678901234567890",
  REACTIVE_QUEST_ENGINE: import.meta.env.VITE_REACTIVE_QUEST_ENGINE || "0x2345678901234567890123456789012345678901",
  EDUCATIONAL_NFT: import.meta.env.VITE_EDUCATIONAL_NFT || "0x3456789012345678901234567890123456789012",
  RUSH_TOKEN: import.meta.env.VITE_RUSH_TOKEN || "0x4567890123456789012345678901234567890123",
  MOCK_DEX: import.meta.env.VITE_MOCK_DEX || "0x5678901234567890123456789012345678901234"
};

// Network configurations
export const NETWORKS = {
  AVALANCHE_FUJI: {
    chainId: 43113,
    name: 'Avalanche Fuji Testnet',
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    explorerUrl: 'https://testnet.snowtrace.io'
  },
  AVALANCHE_MAINNET: {
    chainId: 43114,
    name: 'Avalanche C-Chain',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    explorerUrl: 'https://snowtrace.io'
  },
  REACTIVE_CHAIN: {
    chainId: 1337,
    name: 'Reactive Chain',
    rpcUrl: 'http://localhost:8545',
    explorerUrl: 'http://localhost:3000'
  }
};

export interface ContractInstances {
  avalancheRushCore: Contract | null;
  reactiveQuestEngine: Contract | null;
  educationalNFT: Contract | null;
  rushToken: Contract | null;
  mockDEX: Contract | null;
}

export interface PlayerProfile {
  level: number;
  experience: number;
  totalGames: number;
  totalScore: number;
  highScore: number;
  achievements: number;
  skillPoints: { [key: string]: number };
  isActive: boolean;
}

export interface Quest {
  id: number;
  type: number;
  difficulty: number;
  creator: string;
  reward: number;
  duration: number;
  maxParticipants: number;
  isActive: boolean;
  startTime: number;
  endTime: number;
  description: string;
}

export interface GameSession {
  player: string;
  sessionId: number;
  mode: number;
  difficulty: number;
  score: number;
  startTime: number;
  isActive: boolean;
}

export interface NFTAchievement {
  tokenId: number;
  achievementId: number;
  rarity: number;
  score: number;
  name: string;
  isRare: boolean;
  timestamp: number;
}

export interface RaffleInfo {
  raffleId: number;
  prize: number;
  ticketPrice: number;
  totalTickets: number;
  endTime: number;
  isActive: boolean;
}

export class SmartContractService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private contracts: ContractInstances = {
    avalancheRushCore: null,
    reactiveQuestEngine: null,
    educationalNFT: null,
    rushToken: null,
    mockDEX: null
  };

  constructor(provider?: ethers.BrowserProvider, signer?: ethers.JsonRpcSigner) {
    this.provider = provider || null;
    this.signer = signer || null;
  }

  // Initialize contracts
  public initializeContracts(provider: ethers.BrowserProvider, signer?: ethers.JsonRpcSigner): void {
    this.provider = provider;
    this.signer = signer || null;

    if (!this.provider) {
      throw new Error('Provider is required to initialize contracts');
    }

    // Initialize contracts with provider/signer
    this.contracts.avalancheRushCore = new ethers.Contract(
      CONTRACT_ADDRESSES.AVALANCHE_RUSH_CORE,
      AVALANCHE_RUSH_CORE_ABI,
      this.signer || this.provider
    );

    this.contracts.reactiveQuestEngine = new ethers.Contract(
      CONTRACT_ADDRESSES.REACTIVE_QUEST_ENGINE,
      REACTIVE_QUEST_ENGINE_ABI,
      this.signer || this.provider
    );

    this.contracts.educationalNFT = new ethers.Contract(
      CONTRACT_ADDRESSES.EDUCATIONAL_NFT,
      EDUCATIONAL_NFT_ABI,
      this.signer || this.provider
    );

    this.contracts.rushToken = new ethers.Contract(
      CONTRACT_ADDRESSES.RUSH_TOKEN,
      RUSH_TOKEN_ABI,
      this.signer || this.provider
    );

    this.contracts.mockDEX = new ethers.Contract(
      CONTRACT_ADDRESSES.MOCK_DEX,
      MOCK_DEX_ABI,
      this.signer || this.provider
    );
  }

  // Game functions
  public async startGame(mode: number, difficulty: number, levelId: number): Promise<number> {
    if (!this.contracts.avalancheRushCore || !this.signer) {
      throw new Error('Contract not initialized or no signer available');
    }

    try {
      const tx = await this.contracts.avalancheRushCore.startGame(mode, difficulty, levelId);
      await tx.wait();
      
      // Get the session ID from the event
      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === 'GameStarted');
      return event?.args?.sessionId?.toNumber() || 0;
    } catch (error) {
      console.error('Error starting game:', error);
      throw error;
    }
  }

  public async completeGame(
    sessionId: number, 
    finalScore: number, 
    achievementsUnlocked: string[] = [], 
    skillPointsEarned: number[] = [], 
    skillNames: string[] = []
  ): Promise<boolean> {
    if (!this.contracts.avalancheRushCore || !this.signer) {
      throw new Error('Contract not initialized or no signer available');
    }

    try {
      const tx = await this.contracts.avalancheRushCore.completeGame(
        sessionId,
        finalScore,
        achievementsUnlocked,
        skillPointsEarned,
        skillNames
      );
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error completing game:', error);
      throw error;
    }
  }

  // Player profile functions
  public async getPlayerProfile(address: string): Promise<PlayerProfile | null> {
    if (!this.contracts.avalancheRushCore) {
      throw new Error('Contract not initialized');
    }

    try {
      const profile = await this.contracts.avalancheRushCore.getPlayerProfile(address);
      return {
        level: profile[0].toNumber(),
        experience: profile[1].toNumber(),
        totalGames: profile[2].toNumber(),
        totalScore: profile[3].toNumber(),
        highScore: profile[4].toNumber(),
        achievements: profile[5].toNumber(),
        skillPoints: {}, // This would need to be fetched separately
        isActive: profile[7]
      };
    } catch (error) {
      console.error('Error fetching player profile:', error);
      return null;
    }
  }

  public async getRushBalance(address: string): Promise<string> {
    if (!this.contracts.rushToken) {
      throw new Error('RUSH Token contract not initialized');
    }

    try {
      const balance = await this.contracts.rushToken.balanceOf(address);
      return formatEther(balance);
    } catch (error) {
      console.error('Error fetching RUSH balance:', error);
      return '0';
    }
  }

  // Quest functions
  public async getQuest(questId: number): Promise<Quest | null> {
    if (!this.contracts.reactiveQuestEngine) {
      throw new Error('Quest engine contract not initialized');
    }

    try {
      const quest = await this.contracts.reactiveQuestEngine.getQuest(questId);
      return {
        id: questId,
        type: quest[1],
        difficulty: quest[2],
        creator: quest[3],
        reward: quest[4].toNumber(),
        duration: quest[5].toNumber(),
        maxParticipants: quest[6].toNumber(),
        isActive: quest[7],
        startTime: quest[8].toNumber(),
        endTime: quest[9].toNumber(),
        description: quest[10]
      };
    } catch (error) {
      console.error('Error fetching quest:', error);
      return null;
    }
  }

  public async completeQuest(questId: number): Promise<boolean> {
    if (!this.contracts.reactiveQuestEngine || !this.signer) {
      throw new Error('Quest engine contract not initialized or no signer available');
    }

    try {
      const tx = await this.contracts.reactiveQuestEngine.completeQuest(questId);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error completing quest:', error);
      throw error;
    }
  }

  // NFT functions
  public async getPlayerNFTs(address: string): Promise<NFTAchievement[]> {
    if (!this.contracts.educationalNFT) {
      throw new Error('NFT contract not initialized');
    }

    try {
      const balance = await this.contracts.educationalNFT.balanceOf(address);
      const nfts: NFTAchievement[] = [];

      for (let i = 0; i < balance.toNumber(); i++) {
        const tokenId = await this.contracts.educationalNFT.tokenOfOwnerByIndex(address, i);
        const achievement = await this.contracts.educationalNFT.achievements(tokenId);
        
        nfts.push({
          tokenId: tokenId.toNumber(),
          achievementId: achievement[0].toNumber(),
          rarity: achievement[1].toNumber(),
          score: achievement[2].toNumber(),
          name: achievement[3],
          isRare: achievement[4],
          timestamp: achievement[5].toNumber()
        });
      }

      return nfts;
    } catch (error) {
      console.error('Error fetching player NFTs:', error);
      return [];
    }
  }

  // DEX functions
  public async getTokenPrice(tokenA: string, tokenB: string): Promise<number> {
    if (!this.contracts.mockDEX) {
      throw new Error('DEX contract not initialized');
    }

    try {
      const price = await this.contracts.mockDEX.getPrice(tokenA, tokenB);
      return parseFloat(formatEther(price));
    } catch (error) {
      console.error('Error fetching token price:', error);
      return 0;
    }
  }

  public async swapTokens(
    tokenIn: string, 
    tokenOut: string, 
    amountIn: string, 
    minAmountOut: string
  ): Promise<string> {
    if (!this.contracts.mockDEX || !this.signer) {
      throw new Error('DEX contract not initialized or no signer available');
    }

    try {
      const tx = await this.contracts.mockDEX.swapTokens(
        tokenIn,
        tokenOut,
        parseEther(amountIn),
        parseEther(minAmountOut)
      );
      
      const receipt = await tx.wait();
      const event = receipt.logs?.find((log: { fragment?: { name: string } }) => log.fragment?.name === 'Swap');
      return formatEther(event?.args?.amountOut || 0);
    } catch (error) {
      console.error('Error swapping tokens:', error);
      throw error;
    }
  }

  // Leaderboard functions
  public async getLeaderboard(mode: number, limit: number = 10): Promise<Array<{address: string, score: number, level: number}>> {
    if (!this.contracts.avalancheRushCore) {
      throw new Error('Core contract not initialized');
    }

    try {
      const [addresses, scores, levels] = await this.contracts.avalancheRushCore.getLeaderboard(mode, limit);
      
      return addresses.map((address: string, index: number) => ({
        address,
        score: scores[index].toNumber(),
        level: levels[index].toNumber()
      }));
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }

  // Raffle functions
  public async getCurrentRaffle(): Promise<RaffleInfo | null> {
    if (!this.contracts.reactiveQuestEngine) {
      throw new Error('Quest engine contract not initialized');
    }

    try {
      const raffle = await this.contracts.reactiveQuestEngine.getCurrentRaffle();
      return {
        raffleId: raffle[0].toNumber(),
        prize: raffle[1].toNumber(),
        ticketPrice: raffle[2].toNumber(),
        totalTickets: raffle[3].toNumber(),
        endTime: raffle[4].toNumber(),
        isActive: raffle[5]
      };
    } catch (error) {
      console.error('Error fetching current raffle:', error);
      return null;
    }
  }

  public async enterRaffle(tickets: number): Promise<boolean> {
    if (!this.contracts.reactiveQuestEngine || !this.signer) {
      throw new Error('Quest engine contract not initialized or no signer available');
    }

    try {
      const tx = await this.contracts.reactiveQuestEngine.enterRaffle(tickets);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error entering raffle:', error);
      throw error;
    }
  }

  // Event listeners
  public onGameStarted(callback: (player: string, sessionId: number, mode: number, timestamp: number) => void): void {
    if (!this.contracts.avalancheRushCore) return;
    
    this.contracts.avalancheRushCore.on('GameStarted', callback);
  }

  public onGameCompleted(callback: (player: string, sessionId: number, finalScore: number, reward: number) => void): void {
    if (!this.contracts.avalancheRushCore) return;
    
    this.contracts.avalancheRushCore.on('GameCompleted', callback);
  }

  public onQuestCompleted(callback: (player: string, questId: number, reward: number, timestamp: number) => void): void {
    if (!this.contracts.reactiveQuestEngine) return;
    
    this.contracts.reactiveQuestEngine.on('QuestCompleted', callback);
  }

  // Utility functions
  public formatEther(value: bigint): string {
    return formatEther(value);
  }

  public parseEther(value: string): bigint {
    return parseEther(value);
  }

  public async getCurrentBlock(): Promise<number> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    
    const block = await this.provider.getBlockNumber();
    return block;
  }

  public async getNetwork(): Promise<{chainId: number, name: string}> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    
    const network = await this.provider.getNetwork();
    return {
      chainId: Number(network.chainId),
      name: network.name
    };
  }
}

export default SmartContractService;
