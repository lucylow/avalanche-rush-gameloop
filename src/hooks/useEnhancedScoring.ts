import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAccount, useSigner, useProvider } from 'wagmi';

/**
 * Enhanced scoring system with character class modifiers and story progression
 */

export enum CharacterClass {
  RushRunner = 0,
  GuardianTowers = 1,
  PixelSharpshooter = 2,
  TinkerTech = 3
}

interface ScoreData {
  currentScore: number;
  highScore: number;
  comboMultiplier: number;
  comboCount: number;
  streakCount: number;
  streakBonus: number;
  totalPointsThisGame: number;
}

interface CharacterModifiers {
  scoreMultiplier: number;
  specialAbility: string;
  comboBonus: number;
}

const CLASS_MODIFIERS: Record<CharacterClass, CharacterModifiers> = {
  [CharacterClass.RushRunner]: {
    scoreMultiplier: 1.10,
    specialAbility: 'Speed Surge: +10% to all scores',
    comboBonus: 1.15
  },
  [CharacterClass.GuardianTowers]: {
    scoreMultiplier: 0.90,
    specialAbility: 'Shield Wall: Combo protection',
    comboBonus: 1.0
  },
  [CharacterClass.PixelSharpshooter]: {
    scoreMultiplier: 1.20,
    specialAbility: 'Precision Strike: +20% on perfect hits',
    comboBonus: 1.25
  },
  [CharacterClass.TinkerTech]: {
    scoreMultiplier: 1.00,
    specialAbility: 'Tech Mastery: Balanced bonuses',
    comboBonus: 1.10
  }
};

const STORY_DRIVEN_CHARACTER_ABI = [
  'function recordGameCompletion(uint256 tokenId, uint256 score, uint256 baseXP) external',
  'function characters(uint256) external view returns (tuple(uint8 class, uint256 level, uint256 experiencePoints, uint256 totalGamesPlayed, uint256 highScore, uint256 lastPlayedTimestamp, uint256 speedBonus, uint256 shieldStrength, uint256 accuracyBonus, uint256 techPower, uint8 currentArc, uint256 storyProgress, string characterName, string customTitle))',
  'function getCharacterData(uint256 tokenId) external view returns (tuple(uint8 class, uint256 level, uint256 experiencePoints, uint256 totalGamesPlayed, uint256 highScore, uint256 lastPlayedTimestamp, uint256 speedBonus, uint256 shieldStrength, uint256 accuracyBonus, uint256 techPower, uint8 currentArc, uint256 storyProgress, string characterName, string customTitle), tuple(string title, string content, uint256 discoveredAt, uint8 relatedArc)[], tuple(uint256 scoreRequirement, uint256 levelRequirement, string chapterTitle, string chapterDescription, string chapterURI, uint256 xpReward, bool isEpic)[])',
  'event GameCompleted(uint256 indexed tokenId, uint256 score, uint256 xpGained, bool newHighScore)',
  'event StoryProgressionUnlocked(uint256 indexed tokenId, uint8 arc, uint256 chapter, string chapterTitle)',
  'event LoreFragmentDiscovered(uint256 indexed tokenId, string fragmentTitle, uint8 arc)'
];

export function useEnhancedScoring(
  characterTokenId?: number,
  contractAddress?: string
) {
  const { address } = useAccount();
  const provider = useProvider();
  const { data: signer } = useSigner();

  const [scoreData, setScoreData] = useState<ScoreData>({
    currentScore: 0,
    highScore: 0,
    comboMultiplier: 1,
    comboCount: 0,
    streakCount: 0,
    streakBonus: 0,
    totalPointsThisGame: 0
  });

  const [characterClass, setCharacterClass] = useState<CharacterClass>(CharacterClass.RushRunner);
  const [characterLevel, setCharacterLevel] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_COMBO = 8;
  const BASE_POINTS = 100;

  /**
   * Load character data from contract
   */
  const loadCharacterData = useCallback(async () => {
    if (!characterTokenId || !contractAddress || !provider) return;

    try {
      const contract = new ethers.Contract(
        contractAddress,
        STORY_DRIVEN_CHARACTER_ABI,
        provider
      );

      const [stats] = await contract.getCharacterData(characterTokenId);

      setCharacterClass(stats.class);
      setCharacterLevel(stats.level.toNumber());
      setScoreData(prev => ({
        ...prev,
        highScore: stats.highScore.toNumber()
      }));
    } catch (error) {
      console.error('Failed to load character data:', error);
    }
  }, [characterTokenId, contractAddress, provider]);

  useEffect(() => {
    loadCharacterData();
  }, [loadCharacterData]);

  /**
   * Add points with class modifiers
   */
  const addPoints = useCallback((basePoints: number = BASE_POINTS, isPerfectHit: boolean = false) => {
    setScoreData(prev => {
      const newComboCount = prev.comboCount + 1;
      const newComboMultiplier = calculateComboMultiplier(newComboCount);

      // Get class modifiers
      const classModifier = CLASS_MODIFIERS[characterClass];

      // Calculate base score with combo
      let points = basePoints * newComboMultiplier;

      // Apply class-specific multiplier
      points *= classModifier.scoreMultiplier;

      // Apply combo bonus
      points *= classModifier.comboBonus;

      // Precision Strike for Pixel Sharpshooter
      if (characterClass === CharacterClass.PixelSharpshooter && isPerfectHit) {
        points *= 1.5;
      }

      // Add streak bonus
      const newStreakCount = prev.streakCount + 1;
      const streakBonus = calculateStreakBonus(newStreakCount);
      points += streakBonus;

      const finalPoints = Math.floor(points);
      const newScore = prev.currentScore + finalPoints;

      return {
        currentScore: newScore,
        highScore: Math.max(prev.highScore, newScore),
        comboMultiplier: newComboMultiplier,
        comboCount: newComboCount,
        streakCount: newStreakCount,
        streakBonus,
        totalPointsThisGame: prev.totalPointsThisGame + finalPoints
      };
    });

    return true;
  }, [characterClass]);

  /**
   * Reset combo (e.g., on miss)
   */
  const resetCombo = useCallback(() => {
    setScoreData(prev => ({
      ...prev,
      comboMultiplier: 1,
      comboCount: 0,
      streakCount: 0,
      streakBonus: 0
    }));
  }, []);

  /**
   * Guardian Towers ability - protect combo once per game
   */
  const useShieldProtection = useCallback(() => {
    if (characterClass === CharacterClass.GuardianTowers) {
      // Don't reset combo, just reduce multiplier slightly
      setScoreData(prev => ({
        ...prev,
        comboMultiplier: Math.max(1, prev.comboMultiplier * 0.5)
      }));
      return true;
    }
    return false;
  }, [characterClass]);

  /**
   * Calculate combo multiplier
   */
  const calculateComboMultiplier = (comboCount: number): number => {
    if (comboCount >= 100) return MAX_COMBO;
    if (comboCount >= 50) return 6;
    if (comboCount >= 30) return 4;
    if (comboCount >= 20) return 3;
    if (comboCount >= 10) return 2;
    return 1;
  };

  /**
   * Calculate streak bonus
   */
  const calculateStreakBonus = (streakCount: number): number => {
    if (streakCount >= 100) return 500;
    if (streakCount >= 50) return 200;
    if (streakCount >= 30) return 100;
    if (streakCount >= 15) return 50;
    return 0;
  };

  /**
   * Submit score to blockchain
   */
  const submitScore = useCallback(async () => {
    if (!characterTokenId || !contractAddress || !signer || !address) {
      throw new Error('Wallet or character not initialized');
    }

    setIsSubmitting(true);

    try {
      const contract = new ethers.Contract(
        contractAddress,
        STORY_DRIVEN_CHARACTER_ABI,
        signer
      );

      // Calculate base XP from score
      const baseXP = Math.floor(scoreData.currentScore / 100);

      const tx = await contract.recordGameCompletion(
        characterTokenId,
        scoreData.currentScore,
        baseXP
      );

      const receipt = await tx.wait();

      // Listen for story progression events
      const progressEvent = receipt.events?.find(
        (e: any) => e.event === 'StoryProgressionUnlocked'
      );

      const loreEvent = receipt.events?.find(
        (e: any) => e.event === 'LoreFragmentDiscovered'
      );

      return {
        success: true,
        txHash: receipt.transactionHash,
        newChapterUnlocked: !!progressEvent,
        loreDiscovered: !!loreEvent,
        chapterTitle: progressEvent?.args?.chapterTitle,
        loreTitle: loreEvent?.args?.fragmentTitle
      };
    } catch (error) {
      console.error('Failed to submit score:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [characterTokenId, contractAddress, signer, address, scoreData]);

  /**
   * Reset game state
   */
  const resetGame = useCallback(() => {
    setScoreData(prev => ({
      currentScore: 0,
      highScore: prev.highScore,
      comboMultiplier: 1,
      comboCount: 0,
      streakCount: 0,
      streakBonus: 0,
      totalPointsThisGame: 0
    }));
  }, []);

  /**
   * Get class-specific bonuses description
   */
  const getClassBonuses = useCallback(() => {
    return CLASS_MODIFIERS[characterClass];
  }, [characterClass]);

  return {
    // Score data
    scoreData,
    characterClass,
    characterLevel,
    isSubmitting,

    // Actions
    addPoints,
    resetCombo,
    useShieldProtection,
    submitScore,
    resetGame,
    loadCharacterData,

    // Utilities
    getClassBonuses,
    classModifiers: CLASS_MODIFIERS[characterClass]
  };
}

export default useEnhancedScoring;
