// 🔧 Avalanche Rush - Complete TypeScript Interface Definitions
// Comprehensive types for all game components and systems

// ==================== CORE GAME INTERFACES ====================

export interface Character {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  type: 'Warrior' | 'Mage' | 'Ranger' | 'Tank' | 'Support' | 'Assassin';
  attributes: CharacterAttributes;
  skills: Skill[];
  specialAbilities: SpecialAbility[];
  questBonus: number;
  tournamentBonus: number;
  unlockRequirements: UnlockRequirement[];
}

export interface CharacterAttributes {
  strength: number;
  agility: number;
  intelligence: number;
  endurance: number;
  luck: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  effect: SkillEffect;
}

export interface SkillEffect {
  type: 'damage' | 'defense' | 'speed' | 'healing' | 'utility';
  value: number;
  duration?: number;
}

export interface SpecialAbility {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  manaCost: number;
  effect: AbilityEffect;
}

export interface AbilityEffect {
  type: 'instant' | 'overtime' | 'passive';
  target: 'self' | 'enemy' | 'all';
  value: number;
  duration?: number;
}

export interface UnlockRequirement {
  type: 'level' | 'quest' | 'achievement' | 'token';
  value: number | string;
  description: string;
}

// ==================== CROSSMINT INTEGRATION ====================

export interface CrossmintCharacter {
  id: string;
  name: string;
  rarity: string;
  type: string;
  imageUrl: string;
  description: string;
  attributes: Record<string, number>;
  skills: string[];
  specialAbilities: string[];
  tournamentBonus: number;
  unlockRequirements: UnlockRequirement[];
}

export interface CrossmintMintResult {
  success: boolean;
  tokenId?: string;
  error?: string;
  transactionHash?: string;
}

// ==================== GAME STATE INTERFACES ====================

export interface GameState {
  score: number;
  level: number;
  lives: number;
  timeRemaining: number;
  multiplier: number;
  combo: number;
  powerUps: PowerUp[];
  obstacles: Obstacle[];
  collectibles: Collectible[];
  player: Player;
  isActive: boolean;
  isPaused: boolean;
  gameMode: GameMode;
  difficulty: Difficulty;
}

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  velocityX: number;
  isJumping: boolean;
  isSliding: boolean;
  isInvulnerable: boolean;
  animation: PlayerAnimation;
  character?: Character;
}

export type PlayerAnimation = 'idle' | 'running' | 'jumping' | 'sliding' | 'falling' | 'celebrating';

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: ObstacleType;
  speed: number;
  damage: number;
  isActive: boolean;
}

export type ObstacleType = 'spike' | 'wall' | 'pit' | 'moving' | 'laser' | 'saw' | 'fire';

export interface Collectible {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: CollectibleType;
  value: number;
  collected: boolean;
  animation: string;
}

export type CollectibleType = 'coin' | 'gem' | 'powerup' | 'multiplier' | 'life' | 'token';

export interface PowerUp {
  id: string;
  type: PowerUpType;
  duration: number;
  remainingTime: number;
  effect: PowerUpEffect;
}

export type PowerUpType = 'shield' | 'magnet' | 'jump_boost' | 'slow_time' | 'double_score' | 'invincibility';

export interface PowerUpEffect {
  multiplier?: number;
  duration?: number;
  protection?: boolean;
  magnetRange?: number;
}

export type GameMode = 'classic' | 'tutorial' | 'challenge' | 'quest' | 'speedrun' | 'survival' | 'tournament';
export type Difficulty = 'easy' | 'normal' | 'hard' | 'expert' | 'nightmare';

// ==================== QUEST SYSTEM INTERFACES ====================

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  difficulty: QuestDifficulty;
  requirements: QuestRequirement[];
  rewards: QuestReward[];
  progress: QuestProgress;
  isCompleted: boolean;
  isActive: boolean;
  timeLimit?: number;
  prerequisites?: string[];
}

export type QuestType = 'main' | 'side' | 'daily' | 'weekly' | 'event' | 'tutorial' | 'achievement';
export type QuestDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface QuestRequirement {
  type: 'score' | 'level' | 'collect' | 'survive' | 'complete' | 'interact';
  target: string | number;
  current: number;
  description: string;
}

export interface QuestReward {
  type: 'tokens' | 'nft' | 'character' | 'powerup' | 'experience';
  amount: number;
  item?: string;
  description: string;
}

export interface QuestProgress {
  startedAt: Date;
  completedAt?: Date;
  currentStep: number;
  totalSteps: number;
  requirements: Record<string, number>;
}

// ==================== WEB3 INTERFACES ====================

export interface Web3State {
  isConnected: boolean;
  account: string | null;
  chainId: number | null;
  provider: unknown;
  signer: unknown;
  balance: string;
  isLoading: boolean;
  error: string | null;
}

export interface ContractConfig {
  address: string;
  abi: unknown[];
  name: string;
  network: string;
}

export interface TransactionResult {
  success: boolean;
  hash?: string;
  error?: string;
  gasUsed?: number;
  blockNumber?: number;
}

export interface TokenBalance {
  symbol: string;
  balance: string;
  decimals: number;
  address: string;
}

// ==================== AVALANCHE SPECIFIC INTERFACES ====================

export interface AvalancheConfig {
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface SubnetConfig {
  subnetId: string;
  chainId: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
}

export interface StakingInfo {
  stakedAmount: string;
  rewards: string;
  delegationFee: number;
  validatorId: string;
  stakingPeriod: number;
}

// ==================== REACTIVE NETWORK INTERFACES ====================

export interface ReactiveConfig {
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  gasToken: string;
}

export interface ReactiveEvent {
  eventId: string;
  emitter: string;
  data: unknown;
  blockNumber: number;
  transactionHash: string;
  timestamp: number;
}

export interface ReactiveCallback {
  contractAddress: string;
  functionName: string;
  parameters: unknown[];
  gasLimit: number;
}

// ==================== LEADERBOARD INTERFACES ====================

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  score: number;
  level: number;
  character?: Character;
  timestamp: Date;
  verified: boolean;
}

export interface LeaderboardFilter {
  gameMode: GameMode;
  difficulty: Difficulty;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'alltime';
  characterType?: string;
}

// ==================== TOURNAMENT INTERFACES ====================

export interface Tournament {
  id: string;
  name: string;
  description: string;
  startTime: Date;
  endTime: Date;
  entryFee: number;
  prizePool: number;
  maxParticipants: number;
  currentParticipants: number;
  rules: TournamentRule[];
  status: TournamentStatus;
}

export type TournamentStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

export interface TournamentRule {
  type: 'gameMode' | 'character' | 'powerup' | 'time';
  restriction: string;
  description: string;
}

export interface TournamentEntry {
  playerId: string;
  playerName: string;
  character: Character;
  entryTime: Date;
  bestScore: number;
  rank: number;
}

// ==================== AUDIO SYSTEM INTERFACES ====================

export interface AudioConfig {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  enabled: boolean;
}

export interface SoundEffect {
  id: string;
  name: string;
  url: string;
  volume: number;
  loop: boolean;
  category: 'music' | 'sfx' | 'voice';
}

// ==================== ANALYTICS INTERFACES ====================

export interface GameAnalytics {
  sessionId: string;
  playerId: string;
  gameMode: GameMode;
  startTime: Date;
  endTime?: Date;
  score: number;
  level: number;
  deaths: number;
  powerUpsUsed: number;
  coinsCollected: number;
  questsCompleted: number;
}

export interface UserMetrics {
  totalPlayTime: number;
  gamesPlayed: number;
  highScore: number;
  averageScore: number;
  favoriteGameMode: GameMode;
  achievementsUnlocked: number;
  tokensEarned: number;
}

// ==================== ERROR HANDLING INTERFACES ====================

export interface GameError {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  context?: Record<string, unknown>;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: unknown;
}

// ==================== COMPONENT PROP INTERFACES ====================

export interface CharacterSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCharacterSelect: (character: Character) => void;
  selectedCharacter?: Character;
  playerLevel: number;
}

export interface GameEngineProps {
  character: Character;
  gameMode: GameMode;
  difficulty: Difficulty;
  onGameEnd: (score: number, stats: GameAnalytics) => void;
  onPause?: () => void;
  onResume?: () => void;
}

export interface QuestSystemProps {
  activeQuests: Quest[];
  completedQuests: Quest[];
  onQuestStart: (questId: string) => void;
  onQuestComplete: (questId: string) => void;
  playerLevel: number;
}

export interface LeaderboardSystemProps {
  filter: LeaderboardFilter;
  onFilterChange: (filter: LeaderboardFilter) => void;
  currentPlayer?: LeaderboardEntry;
}

// ==================== HOOK RETURN TYPES ====================

export interface UseWeb3Return {
  state: Web3State;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  sendTransaction: (to: string, value: string) => Promise<TransactionResult>;
}

export interface UseCrossmintReturn {
  mintCharacter: (character: CrossmintCharacter) => Promise<CrossmintMintResult>;
  isLoading: boolean;
  error: string | null;
}

export interface UseGameStateReturn {
  gameState: GameState;
  updateGameState: (updates: Partial<GameState>) => void;
  resetGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
}

// ==================== UTILITY TYPES ====================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// ==================== CONSTANTS ====================

export const GAME_CONSTANTS = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 400,
  GRAVITY: 0.8,
  JUMP_FORCE: -15,
  GAME_SPEED: 5,
  GROUND_Y: 340,
  MAX_LIVES: 5,
  MAX_LEVEL: 50,
  SCORE_MULTIPLIER_MAX: 10
} as const;

export const NETWORK_IDS = {
  AVALANCHE_MAINNET: 43114,
  AVALANCHE_FUJI: 43113,
  REACTIVE_MAINNET: 0x1b58, // Replace with actual Reactive Network chain ID
  ETHEREUM_MAINNET: 1,
  POLYGON_MAINNET: 137
} as const;

export const CONTRACT_ADDRESSES = {
  AVALANCHE_RUSH_CORE: '0x742d35Cc5A5E2a9E1aB8d8C6E6E9F4A5B8D35a9',
  RUSH_TOKEN: '0x8a1d5C5E3A5E2a9E1aB8d8C6E6E9F4A5B8D35b0',
  EDUCATIONAL_NFT: '0x7b2d5C5E3A5E2a9E1aB8d8C6E6E9F4A5B8D35e3',
  REACTIVE_QUEST_ENGINE: '0x6a1d5C5E3A5E2a9E1aB8d8C6E6E9F4A5B8D35d2'
} as const;
