import { ethers } from 'ethers';

/**
 * Enhanced Level System for Avalanche Rush
 * Features: Dynamic XP, Skill Trees, Mastery System, Seasonal Progression
 */

export interface PlayerLevel {
  currentLevel: number;
  totalXP: number;
  levelXP: number;
  nextLevelXP: number;
  prestigeLevel: number;
  masteryPoints: number;
  skillTree: SkillTree;
  seasonalRank: SeasonalRank;
}

export interface SkillTree {
  speed: SkillBranch;
  accuracy: SkillBranch;
  endurance: SkillBranch;
  luck: SkillBranch;
  strategy: SkillBranch;
}

export interface SkillBranch {
  level: number;
  maxLevel: number;
  unlocked: boolean;
  bonuses: SkillBonus[];
}

export interface SkillBonus {
  type: 'multiplier' | 'bonus' | 'unlock';
  value: number;
  description: string;
}

export interface SeasonalRank {
  season: number;
  rank: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master' | 'Grandmaster';
  points: number;
  rewards: SeasonalReward[];
}

export interface SeasonalReward {
  type: 'RUSH' | 'NFT' | 'Cosmetic' | 'PowerUp';
  amount: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  claimed: boolean;
}

export interface LevelReward {
  level: number;
  rewards: {
    rushTokens: number;
    nftRewards: NFTReward[];
    cosmeticRewards: CosmeticReward[];
    powerUpRewards: PowerUpReward[];
    masteryPoints: number;
  };
}

export interface NFTReward {
  id: string;
  name: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  imageUrl: string;
  attributes: { [key: string]: string | number | boolean };
}

export interface CosmeticReward {
  type: 'Skin' | 'Trail' | 'Avatar' | 'Title';
  name: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  unlockLevel: number;
}

export interface PowerUpReward {
  type: 'Speed' | 'Shield' | 'Magnet' | 'Multiplier';
  name: string;
  duration: number;
  effectiveness: number;
}

export class EnhancedLevelSystem {
  private playerLevel: PlayerLevel;
  private levelRewards: Map<number, LevelReward>;
  private skillTreeConfig: SkillTreeConfig;

  constructor() {
    this.playerLevel = this.initializePlayerLevel();
    this.levelRewards = this.initializeLevelRewards();
    this.skillTreeConfig = this.initializeSkillTreeConfig();
  }

  private initializePlayerLevel(): PlayerLevel {
    return {
      currentLevel: 1,
      totalXP: 0,
      levelXP: 0,
      nextLevelXP: 100,
      prestigeLevel: 0,
      masteryPoints: 0,
      skillTree: {
        speed: { level: 0, maxLevel: 50, unlocked: true, bonuses: [] },
        accuracy: { level: 0, maxLevel: 50, unlocked: true, bonuses: [] },
        endurance: { level: 0, maxLevel: 50, unlocked: true, bonuses: [] },
        luck: { level: 0, maxLevel: 50, unlocked: true, bonuses: [] },
        strategy: { level: 0, maxLevel: 50, unlocked: true, bonuses: [] }
      },
      seasonalRank: {
        season: 1,
        rank: 'Bronze',
        points: 0,
        rewards: []
      }
    };
  }

  private initializeLevelRewards(): Map<number, LevelReward> {
    const rewards = new Map<number, LevelReward>();
    
    // Level 5 rewards
    rewards.set(5, {
      level: 5,
      rewards: {
        rushTokens: 100,
        nftRewards: [{
          id: 'speed-boost-nft-1',
          name: 'Speed Demon Badge',
          rarity: 'Common',
          imageUrl: '/nfts/speed-demon-badge.png',
          attributes: { speedBonus: 0.05 }
        }],
        cosmeticRewards: [{
          type: 'Skin',
          name: 'Rookie Runner',
          rarity: 'Common',
          unlockLevel: 5
        }],
        powerUpRewards: [{
          type: 'Speed',
          name: 'Quick Start',
          duration: 5,
          effectiveness: 1.2
        }],
        masteryPoints: 1
      }
    });

    // Level 10 rewards
    rewards.set(10, {
      level: 10,
      rewards: {
        rushTokens: 500,
        nftRewards: [{
          id: 'accuracy-master-nft-1',
          name: 'Precision Master',
          rarity: 'Rare',
          imageUrl: '/nfts/precision-master.png',
          attributes: { accuracyBonus: 0.1 }
        }],
        cosmeticRewards: [{
          type: 'Trail',
          name: 'Lightning Trail',
          rarity: 'Rare',
          unlockLevel: 10
        }],
        powerUpRewards: [{
          type: 'Shield',
          name: 'Protection Barrier',
          duration: 10,
          effectiveness: 1.5
        }],
        masteryPoints: 2
      }
    });

    // Level 25 rewards
    rewards.set(25, {
      level: 25,
      rewards: {
        rushTokens: 2000,
        nftRewards: [{
          id: 'endurance-champion-nft-1',
          name: 'Endurance Champion',
          rarity: 'Epic',
          imageUrl: '/nfts/endurance-champion.png',
          attributes: { enduranceBonus: 0.15 }
        }],
        cosmeticRewards: [{
          type: 'Avatar',
          name: 'Elite Runner',
          rarity: 'Epic',
          unlockLevel: 25
        }],
        powerUpRewards: [{
          type: 'Multiplier',
          name: 'Score Doubler',
          duration: 15,
          effectiveness: 2.0
        }],
        masteryPoints: 5
      }
    });

    // Level 50 rewards
    rewards.set(50, {
      level: 50,
      rewards: {
        rushTokens: 10000,
        nftRewards: [{
          id: 'master-runner-nft-1',
          name: 'Master Runner',
          rarity: 'Legendary',
          imageUrl: '/nfts/master-runner.png',
          attributes: { allStatsBonus: 0.2 }
        }],
        cosmeticRewards: [{
          type: 'Title',
          name: 'Master of the Rush',
          rarity: 'Legendary',
          unlockLevel: 50
        }],
        powerUpRewards: [{
          type: 'Magnet',
          name: 'Coin Magnet',
          duration: 20,
          effectiveness: 3.0
        }],
        masteryPoints: 10
      }
    });

    return rewards;
  }

  private initializeSkillTreeConfig(): SkillTreeConfig {
    return {
      speed: {
        branches: [
          { level: 1, name: 'Quick Feet', description: '+5% movement speed', cost: 1, bonus: { type: 'multiplier', value: 0.05, description: '+5% movement speed' } },
          { level: 5, name: 'Lightning Reflexes', description: '+10% movement speed', cost: 2, bonus: { type: 'multiplier', value: 0.10, description: '+10% movement speed' } },
          { level: 10, name: 'Speed Demon', description: '+15% movement speed', cost: 3, bonus: { type: 'multiplier', value: 0.15, description: '+15% movement speed' } },
          { level: 20, name: 'Velocity Master', description: '+25% movement speed', cost: 5, bonus: { type: 'multiplier', value: 0.25, description: '+25% movement speed' } },
          { level: 30, name: 'Sonic Boom', description: '+35% movement speed', cost: 7, bonus: { type: 'multiplier', value: 0.35, description: '+35% movement speed' } }
        ]
      },
      accuracy: {
        branches: [
          { level: 1, name: 'Steady Hands', description: '+5% accuracy', cost: 1, bonus: { type: 'multiplier', value: 0.05, description: '+5% accuracy' } },
          { level: 5, name: 'Precision Aim', description: '+10% accuracy', cost: 2, bonus: { type: 'multiplier', value: 0.10, description: '+10% accuracy' } },
          { level: 10, name: 'Bullseye', description: '+15% accuracy', cost: 3, bonus: { type: 'multiplier', value: 0.15, description: '+15% accuracy' } },
          { level: 20, name: 'Perfect Shot', description: '+25% accuracy', cost: 5, bonus: { type: 'multiplier', value: 0.25, description: '+25% accuracy' } },
          { level: 30, name: 'Sniper Mode', description: '+35% accuracy', cost: 7, bonus: { type: 'multiplier', value: 0.35, description: '+35% accuracy' } }
        ]
      },
      endurance: {
        branches: [
          { level: 1, name: 'Stamina Boost', description: '+5% endurance', cost: 1, bonus: { type: 'multiplier', value: 0.05, description: '+5% endurance' } },
          { level: 5, name: 'Iron Will', description: '+10% endurance', cost: 2, bonus: { type: 'multiplier', value: 0.10, description: '+10% endurance' } },
          { level: 10, name: 'Unstoppable', description: '+15% endurance', cost: 3, bonus: { type: 'multiplier', value: 0.15, description: '+15% endurance' } },
          { level: 20, name: 'Titan Mode', description: '+25% endurance', cost: 5, bonus: { type: 'multiplier', value: 0.25, description: '+25% endurance' } },
          { level: 30, name: 'Immortal', description: '+35% endurance', cost: 7, bonus: { type: 'multiplier', value: 0.35, description: '+35% endurance' } }
        ]
      },
      luck: {
        branches: [
          { level: 1, name: 'Lucky Break', description: '+5% luck', cost: 1, bonus: { type: 'multiplier', value: 0.05, description: '+5% luck' } },
          { level: 5, name: 'Fortune Favors', description: '+10% luck', cost: 2, bonus: { type: 'multiplier', value: 0.10, description: '+10% luck' } },
          { level: 10, name: 'Lucky Charm', description: '+15% luck', cost: 3, bonus: { type: 'multiplier', value: 0.15, description: '+15% luck' } },
          { level: 20, name: 'Jackpot', description: '+25% luck', cost: 5, bonus: { type: 'multiplier', value: 0.25, description: '+25% luck' } },
          { level: 30, name: 'Miracle', description: '+35% luck', cost: 7, bonus: { type: 'multiplier', value: 0.35, description: '+35% luck' } }
        ]
      },
      strategy: {
        branches: [
          { level: 1, name: 'Tactical Mind', description: '+5% strategy', cost: 1, bonus: { type: 'multiplier', value: 0.05, description: '+5% strategy' } },
          { level: 5, name: 'Strategic Planning', description: '+10% strategy', cost: 2, bonus: { type: 'multiplier', value: 0.10, description: '+10% strategy' } },
          { level: 10, name: 'Master Planner', description: '+15% strategy', cost: 3, bonus: { type: 'multiplier', value: 0.15, description: '+15% strategy' } },
          { level: 20, name: 'Grand Strategist', description: '+25% strategy', cost: 5, bonus: { type: 'multiplier', value: 0.25, description: '+25% strategy' } },
          { level: 30, name: 'Genius', description: '+35% strategy', cost: 7, bonus: { type: 'multiplier', value: 0.35, description: '+35% strategy' } }
        ]
      }
    };
  }

  public calculateXPRequired(level: number): number {
    if (level <= 10) {
      return level * 100;
    } else if (level <= 25) {
      return 1000 + (level - 10) * 200;
    } else if (level <= 50) {
      return 4000 + (level - 25) * 400;
    } else if (level <= 75) {
      return 14000 + (level - 50) * 800;
    } else {
      return 34000 + (level - 75) * 1600;
    }
  }

  public addXP(amount: number): { leveledUp: boolean; newLevel: number; rewards: LevelReward | null } {
    this.playerLevel.totalXP += amount;
    this.playerLevel.levelXP += amount;

    let leveledUp = false;
    let newLevel = this.playerLevel.currentLevel;
    let rewards: LevelReward | null = null;

    while (this.playerLevel.levelXP >= this.playerLevel.nextLevelXP) {
      this.playerLevel.levelXP -= this.playerLevel.nextLevelXP;
      this.playerLevel.currentLevel++;
      newLevel = this.playerLevel.currentLevel;
      leveledUp = true;

      // Check for level rewards
      if (this.levelRewards.has(newLevel)) {
        rewards = this.levelRewards.get(newLevel)!;
      }

      // Update next level XP requirement
      this.playerLevel.nextLevelXP = this.calculateXPRequired(newLevel + 1);
    }

    return { leveledUp, newLevel, rewards };
  }

  public upgradeSkill(skillType: keyof SkillTree, branchIndex: number): boolean {
    const skill = this.playerLevel.skillTree[skillType];
    const branch = this.skillTreeConfig[skillType].branches[branchIndex];

    if (!branch || skill.level < branch.level || this.playerLevel.masteryPoints < branch.cost) {
      return false;
    }

    this.playerLevel.masteryPoints -= branch.cost;
    skill.level++;
    skill.bonuses.push(branch.bonus);

    return true;
  }

  public getSkillBonus(skillType: keyof SkillTree): number {
    const skill = this.playerLevel.skillTree[skillType];
    return skill.bonuses.reduce((total, bonus) => total + bonus.value, 0);
  }

  public calculateSeasonalRank(points: number): SeasonalRank {
    let rank: SeasonalRank['rank'] = 'Bronze';
    
    if (points >= 10000) rank = 'Grandmaster';
    else if (points >= 7500) rank = 'Master';
    else if (points >= 5000) rank = 'Diamond';
    else if (points >= 3000) rank = 'Platinum';
    else if (points >= 1500) rank = 'Gold';
    else if (points >= 500) rank = 'Silver';

    return {
      season: this.playerLevel.seasonalRank.season,
      rank,
      points,
      rewards: this.getSeasonalRewards(rank)
    };
  }

  private getSeasonalRewards(rank: SeasonalRank['rank']): SeasonalReward[] {
    const rewards: SeasonalReward[] = [];
    
    switch (rank) {
      case 'Grandmaster':
        rewards.push({ type: 'RUSH', amount: 50000, rarity: 'Legendary', claimed: false });
        rewards.push({ type: 'NFT', amount: 1, rarity: 'Legendary', claimed: false });
        break;
      case 'Master':
        rewards.push({ type: 'RUSH', amount: 25000, rarity: 'Epic', claimed: false });
        rewards.push({ type: 'NFT', amount: 1, rarity: 'Legendary', claimed: false });
        break;
      case 'Diamond':
        rewards.push({ type: 'RUSH', amount: 15000, rarity: 'Epic', claimed: false });
        rewards.push({ type: 'Cosmetic', amount: 1, rarity: 'Epic', claimed: false });
        break;
      case 'Platinum':
        rewards.push({ type: 'RUSH', amount: 10000, rarity: 'Rare', claimed: false });
        rewards.push({ type: 'PowerUp', amount: 5, rarity: 'Rare', claimed: false });
        break;
      case 'Gold':
        rewards.push({ type: 'RUSH', amount: 5000, rarity: 'Rare', claimed: false });
        rewards.push({ type: 'PowerUp', amount: 3, rarity: 'Rare', claimed: false });
        break;
      case 'Silver':
        rewards.push({ type: 'RUSH', amount: 2000, rarity: 'Common', claimed: false });
        rewards.push({ type: 'PowerUp', amount: 2, rarity: 'Common', claimed: false });
        break;
      case 'Bronze':
        rewards.push({ type: 'RUSH', amount: 500, rarity: 'Common', claimed: false });
        break;
    }

    return rewards;
  }

  public prestige(): boolean {
    if (this.playerLevel.currentLevel < 50) {
      return false;
    }

    this.playerLevel.prestigeLevel++;
    this.playerLevel.currentLevel = 1;
    this.playerLevel.totalXP = 0;
    this.playerLevel.levelXP = 0;
    this.playerLevel.nextLevelXP = 100;
    this.playerLevel.masteryPoints += 10; // Bonus mastery points for prestiging

    // Reset skill tree but keep some bonuses
    Object.keys(this.playerLevel.skillTree).forEach(skillType => {
      const skill = this.playerLevel.skillTree[skillType as keyof SkillTree];
      skill.level = 0;
      skill.bonuses = [];
    });

    return true;
  }

  public getPlayerLevel(): PlayerLevel {
    return { ...this.playerLevel };
  }

  public getLevelRewards(level: number): LevelReward | null {
    return this.levelRewards.get(level) || null;
  }
}

interface SkillTreeConfig {
  speed: SkillBranchConfig;
  accuracy: SkillBranchConfig;
  endurance: SkillBranchConfig;
  luck: SkillBranchConfig;
  strategy: SkillBranchConfig;
}

interface SkillBranchConfig {
  branches: SkillBranchData[];
}

interface SkillBranchData {
  level: number;
  name: string;
  description: string;
  cost: number;
  bonus: SkillBonus;
}
