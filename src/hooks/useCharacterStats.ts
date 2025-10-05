import { useState, useEffect, useCallback } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { ethers } from 'ethers';
import { CharacterClass } from '@/components/character/CharacterSelection';

const CHARACTER_CONTRACT_ADDRESS = process.env.VITE_CHARACTER_NFT_CONTRACT || '';

// StoryDrivenCharacterNFT ABI
const CHARACTER_ABI = [
  'function mintCharacter(uint8 _class) external returns (uint256)',
  'function getCharacterStats(uint256 tokenId) external view returns (tuple(uint8 class, uint256 level, uint256 experience, uint256 gamesPlayed, uint256 totalScore, uint256 currentArc, uint256 currentChapter, uint256 loreFragments))',
  'function recordGameCompletion(uint256 tokenId, uint256 score, uint256 baseXP) external',
  'function balanceOf(address owner) external view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)',
  'function getActiveCharacter(address player) external view returns (uint256)',
  'function setActiveCharacter(uint256 tokenId) external',
  'function getClassModifiers(uint8 class) external pure returns (tuple(uint256 scoreMultiplier, uint256 comboBonus, uint256 criticalChance, uint256 defenseBonus))',
  'event CharacterMinted(address indexed player, uint256 indexed tokenId, uint8 characterClass)',
  'event LevelUp(uint256 indexed tokenId, uint256 newLevel)',
  'event StoryProgression(uint256 indexed tokenId, uint256 arc, uint256 chapter)',
  'event LoreFragmentDiscovered(uint256 indexed tokenId, uint256 fragmentId)'
];

export interface CharacterStats {
  tokenId: number;
  characterClass: CharacterClass;
  level: number;
  experience: number;
  gamesPlayed: number;
  totalScore: number;
  currentArc: number;
  currentChapter: number;
  loreFragments: number;
}

export interface CharacterModifiers {
  scoreMultiplier: number;
  comboBonus: number;
  criticalChance: number;
  defenseBonus: number;
}

export function useCharacterStats() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [playerCharacters, setPlayerCharacters] = useState<CharacterStats[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterStats | null>(null);
  const [classModifiers, setClassModifiers] = useState<CharacterModifiers | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Load all characters owned by the player
   */
  const loadPlayerCharacters = useCallback(async () => {
    if (!publicClient || !address || !CHARACTER_CONTRACT_ADDRESS) return;

    setIsLoading(true);
    try {
      // TODO: Replace with viem contracts when contract is deployed
      // For now, returning empty array as placeholder
      setPlayerCharacters([]);
      setIsLoading(false);
      return;

      /* Ethers.js integration (needs provider adapter)
      const contract = new ethers.Contract(
        CHARACTER_CONTRACT_ADDRESS,
        CHARACTER_ABI,
        provider as any
      );

      // Get number of characters owned
      const balance = await contract.balanceOf(address);
      const count = balance.toNumber();

      const characters: CharacterStats[] = [];

      // Load each character
      for (let i = 0; i < count; i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(address, i);
        const stats = await contract.getCharacterStats(tokenId);

        characters.push({
          tokenId: tokenId.toNumber(),
          characterClass: stats.class as CharacterClass,
          level: stats.level.toNumber(),
          experience: stats.experience.toNumber(),
          gamesPlayed: stats.gamesPlayed.toNumber(),
          totalScore: stats.totalScore.toNumber(),
          currentArc: stats.currentArc.toNumber(),
          currentChapter: stats.currentChapter.toNumber(),
          loreFragments: stats.loreFragments.toNumber()
        });
      }

      setPlayerCharacters(characters);

      // Load active character if exists
      const activeTokenId = await contract.getActiveCharacter(address);
      if (activeTokenId.toNumber() > 0) {
        const activeChar = characters.find(c => c.tokenId === activeTokenId.toNumber());
        if (activeChar) {
          setSelectedCharacter(activeChar);
          await loadClassModifiers(activeChar.characterClass);
        }
      }
      */
    } catch (error) {
      console.error('Error loading characters:', error);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, address]);

  /**
   * Load class modifiers for scoring
   */
  const loadClassModifiers = useCallback(async (characterClass: CharacterClass) => {
    if (!publicClient || !CHARACTER_CONTRACT_ADDRESS) return;

    // TODO: Implement with viem when contract is deployed
    // For now, return mock modifiers based on class
    const mockModifiers: Record<CharacterClass, CharacterModifiers> = {
      [CharacterClass.RushRunner]: { scoreMultiplier: 1.10, comboBonus: 1.15, criticalChance: 10, defenseBonus: 1.00 },
      [CharacterClass.GuardianTowers]: { scoreMultiplier: 1.05, comboBonus: 1.00, criticalChance: 5, defenseBonus: 1.20 },
      [CharacterClass.PixelSharpshooter]: { scoreMultiplier: 1.20, comboBonus: 1.25, criticalChance: 25, defenseBonus: 1.00 },
      [CharacterClass.TinkerTech]: { scoreMultiplier: 1.15, comboBonus: 1.10, criticalChance: 15, defenseBonus: 1.05 },
    };

    setClassModifiers(mockModifiers[characterClass]);
  }, [publicClient]);

  /**
   * Mint a new character
   */
  const mintCharacter = useCallback(async (characterClass: CharacterClass): Promise<number> => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    // TODO: Implement with viem when contract is deployed
    // For now, create a mock character
    const mockTokenId = Date.now();
    const mockCharacter: CharacterStats = {
      tokenId: mockTokenId,
      characterClass,
      level: 1,
      experience: 0,
      gamesPlayed: 0,
      totalScore: 0,
      currentArc: 1,
      currentChapter: 1,
      loreFragments: 0
    };

    setPlayerCharacters(prev => [...prev, mockCharacter]);
    setSelectedCharacter(mockCharacter);
    await loadClassModifiers(characterClass);

    return mockTokenId;
  }, [walletClient, address, loadClassModifiers]);

  /**
   * Select a character as active
   */
  const selectCharacter = useCallback(async (tokenId: number) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    // TODO: Implement with viem when contract is deployed
    // For now, just update local state
    const char = playerCharacters.find(c => c.tokenId === tokenId);
    if (char) {
      setSelectedCharacter(char);
      await loadClassModifiers(char.characterClass);
    }
  }, [walletClient, address, playerCharacters, loadClassModifiers]);

  /**
   * Record game completion and award XP
   */
  const recordGameScore = useCallback(async (score: number, baseXP: number = 100) => {
    if (!signer || !selectedCharacter) {
      throw new Error('No character selected');
    }

    const contract = new ethers.Contract(
      CHARACTER_CONTRACT_ADDRESS,
      CHARACTER_ABI,
      signer
    );

    const tx = await contract.recordGameCompletion(
      selectedCharacter.tokenId,
      score,
      baseXP
    );
    const receipt = await tx.wait();

    // Check for level up event
    const levelUpEvent = receipt.events?.find((e: any) => e.event === 'LevelUp');
    const storyEvent = receipt.events?.find((e: any) => e.event === 'StoryProgression');
    const loreEvent = receipt.events?.find((e: any) => e.event === 'LoreFragmentDiscovered');

    // Reload character stats
    await loadPlayerCharacters();

    return {
      leveledUp: !!levelUpEvent,
      newLevel: levelUpEvent?.args?.newLevel?.toNumber(),
      storyUnlocked: !!storyEvent,
      arc: storyEvent?.args?.arc?.toNumber(),
      chapter: storyEvent?.args?.chapter?.toNumber(),
      loreDiscovered: !!loreEvent,
      fragmentId: loreEvent?.args?.fragmentId?.toNumber()
    };
  }, [signer, selectedCharacter, loadPlayerCharacters]);

  /**
   * Calculate modified score based on character class
   */
  const calculateModifiedScore = useCallback((baseScore: number, comboMultiplier: number = 1): number => {
    if (!classModifiers) return baseScore;

    let finalScore = baseScore * classModifiers.scoreMultiplier;

    if (comboMultiplier > 1) {
      finalScore *= (1 + ((comboMultiplier - 1) * classModifiers.comboBonus));
    }

    return Math.floor(finalScore);
  }, [classModifiers]);

  /**
   * Check if critical hit occurs
   */
  const rollCriticalHit = useCallback((): boolean => {
    if (!classModifiers) return false;
    return Math.random() * 100 < classModifiers.criticalChance;
  }, [classModifiers]);

  // Load characters on mount
  useEffect(() => {
    if (isConnected && address) {
      loadPlayerCharacters();
    }
  }, [isConnected, address, loadPlayerCharacters]);

  return {
    // State
    playerCharacters,
    selectedCharacter,
    classModifiers,
    isLoading,

    // Actions
    loadPlayerCharacters,
    mintCharacter,
    selectCharacter,
    recordGameScore,

    // Utilities
    calculateModifiedScore,
    rollCriticalHit
  };
}

export default useCharacterStats;
