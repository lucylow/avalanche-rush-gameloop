import { EnhancedLevelSystem } from './EnhancedLevelSystem';

/**
 * Dynamic Scoring System for Avalanche Rush
 * Features: Multiplier chains, Risk/Reward mechanics, Style scoring, Real-time adjustments
 */

export interface GameSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  playerLevel: number;
  difficulty: 'Easy' | 'Normal' | 'Hard' | 'Expert' | 'Master';
  gameMode: 'Adventure' | 'Tournament' | 'Collection' | 'Challenge';
}

export interface ScoreEvent {
  type: 'distance' | 'coin' | 'obstacle' | 'powerup' | 'combo' | 'style' | 'risk' | 'time';
  value: number;
  timestamp: number;
  multiplier: number;
  bonus: number;
}

export interface ComboChain {
  type: 'perfect' | 'speed' | 'style' | 'risk';
  count: number;
  multiplier: number;
  maxMultiplier: number;
  decayRate: number;
}

export interface StyleScore {
  type: 'flip' | 'slide' | 'jump' | 'dodge' | 'trick';
  basePoints: number;
  difficulty: number;
  multiplier: number;
  bonus: number;
}

export interface RiskReward {
  riskLevel: 'Low' | 'Medium' | 'High' | 'Extreme';
  rewardMultiplier: number;
  failurePenalty: number;
  successBonus: number;
}

export interface DynamicScore {
  baseScore: number;
  multiplierScore: number;
  bonusScore: number;
  totalScore: number;
  comboChains: ComboChain[];
  stylePoints: StyleScore[];
  riskRewards: RiskReward[];
  timeBonus: number;
  difficultyBonus: number;
  levelBonus: number;
}

export class DynamicScoringSystem {
  private levelSystem: EnhancedLevelSystem;
  private currentSession: GameSession | null = null;
  private scoreEvents: ScoreEvent[] = [];
  private comboChains: Map<string, ComboChain> = new Map();
  private styleScores: StyleScore[] = [];
  private riskRewards: RiskReward[] = [];
  private baseMultipliers: Map<string, number> = new Map();

  constructor(levelSystem: EnhancedLevelSystem) {
    this.levelSystem = levelSystem;
    this.initializeBaseMultipliers();
  }

  private initializeBaseMultipliers(): void {
    this.baseMultipliers.set('distance', 10);
    this.baseMultipliers.set('coin', 50);
    this.baseMultipliers.set('obstacle', 25);
    this.baseMultipliers.set('powerup', 100);
    this.baseMultipliers.set('combo', 1.5);
    this.baseMultipliers.set('style', 2.0);
    this.baseMultipliers.set('risk', 3.0);
    this.baseMultipliers.set('time', 1.2);
  }

  public startGameSession(gameMode: string, difficulty: string): GameSession {
    const playerLevel = this.levelSystem.getPlayerLevel().currentLevel;
    
    this.currentSession = {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      playerLevel,
      difficulty: difficulty as GameSession['difficulty'],
      gameMode: gameMode as GameSession['gameMode']
    };

    this.scoreEvents = [];
    this.comboChains.clear();
    this.styleScores = [];
    this.riskRewards = [];

    return this.currentSession;
  }

  public endGameSession(): DynamicScore {
    if (!this.currentSession) {
      throw new Error('No active game session');
    }

    this.currentSession.endTime = Date.now();
    
    const finalScore = this.calculateFinalScore();
    
    // Reset session
    this.currentSession = null;
    
    return finalScore;
  }

  public addScoreEvent(type: ScoreEvent['type'], value: number, additionalData?: Record<string, unknown>): void {
    if (!this.currentSession) {
      throw new Error('No active game session');
    }

    const multiplier = this.calculateEventMultiplier(type, additionalData);
    const bonus = this.calculateEventBonus(type, value, additionalData);

    const scoreEvent: ScoreEvent = {
      type,
      value,
      timestamp: Date.now(),
      multiplier,
      bonus
    };

    this.scoreEvents.push(scoreEvent);
    this.updateComboChains(type, value);
    this.updateStyleScore(type, value, additionalData);
  }

  private calculateEventMultiplier(type: ScoreEvent['type'], additionalData?: Record<string, unknown>): number {
    let baseMultiplier = this.baseMultipliers.get(type) || 1.0;
    
    // Apply skill bonuses from level system
    const skillBonuses = this.getSkillBonuses();
    baseMultiplier *= (1 + skillBonuses.total);

    // Apply combo multipliers
    const comboMultiplier = this.getComboMultiplier(type);
    baseMultiplier *= comboMultiplier;

    // Apply difficulty multiplier
    const difficultyMultiplier = this.getDifficultyMultiplier();
    baseMultiplier *= difficultyMultiplier;

    // Apply level multiplier
    const levelMultiplier = this.getLevelMultiplier();
    baseMultiplier *= levelMultiplier;

    return baseMultiplier;
  }

  private calculateEventBonus(type: ScoreEvent['type'], value: number, additionalData?: Record<string, unknown>): number {
    let bonus = 0;

    switch (type) {
      case 'distance':
        bonus = value * 0.1; // 10% bonus for distance
        break;
      case 'coin':
        bonus = value * 0.2; // 20% bonus for coins
        break;
      case 'obstacle':
        bonus = value * 0.15; // 15% bonus for obstacles avoided
        break;
      case 'powerup':
        bonus = value * 0.25; // 25% bonus for powerups
        break;
      case 'style':
        bonus = value * 0.5; // 50% bonus for style moves
        break;
      case 'risk':
        bonus = value * 0.75; // 75% bonus for risk moves
        break;
      case 'time':
        bonus = value * 0.3; // 30% bonus for time
        break;
    }

    return bonus;
  }

  private updateComboChains(type: ScoreEvent['type'], value: number): void {
    const comboKey = this.getComboKey(type);
    let combo = this.comboChains.get(comboKey);

    if (!combo) {
      combo = {
        type: this.getComboType(type),
        count: 0,
        multiplier: 1.0,
        maxMultiplier: 5.0,
        decayRate: 0.1
      };
    }

    // Check if combo should continue
    if (this.shouldContinueCombo(type, value)) {
      combo.count++;
      combo.multiplier = Math.min(combo.multiplier + 0.1, combo.maxMultiplier);
    } else {
      combo.multiplier = Math.max(combo.multiplier - combo.decayRate, 1.0);
    }

    this.comboChains.set(comboKey, combo);
  }

  private updateStyleScore(type: ScoreEvent['type'], value: number, additionalData?: Record<string, unknown>): void {
    if (type === 'style' && additionalData?.styleType) {
      const styleScore: StyleScore = {
        type: additionalData.styleType as "dodge" | "flip" | "jump" | "slide" | "trick",
        basePoints: value,
        difficulty: (additionalData.difficulty as number) || 1,
        multiplier: this.getStyleMultiplier(additionalData.styleType as "dodge" | "flip" | "jump" | "slide" | "trick"),
        bonus: this.calculateStyleBonus(additionalData.styleType as "dodge" | "flip" | "jump" | "slide" | "trick", additionalData.difficulty as number)
      };

      this.styleScores.push(styleScore);
    }
  }

  private getComboKey(type: ScoreEvent['type']): string {
    switch (type) {
      case 'distance':
      case 'coin':
      case 'obstacle':
        return 'perfect';
      case 'style':
        return 'style';
      case 'risk':
        return 'risk';
      case 'time':
        return 'speed';
      default:
        return 'general';
    }
  }

  private getComboType(type: ScoreEvent['type']): ComboChain['type'] {
    switch (type) {
      case 'distance':
      case 'coin':
      case 'obstacle':
        return 'perfect';
      case 'style':
        return 'style';
      case 'risk':
        return 'risk';
      case 'time':
        return 'speed';
      default:
        return 'perfect';
    }
  }

  private shouldContinueCombo(type: ScoreEvent['type'], value: number): boolean {
    // Define conditions for combo continuation
    switch (type) {
      case 'distance':
        return value > 0; // Any distance traveled
      case 'coin':
        return value > 0; // Any coin collected
      case 'obstacle':
        return value > 0; // Any obstacle avoided
      case 'style':
        return value > 50; // Style moves above threshold
      case 'risk':
        return value > 100; // Risk moves above threshold
      case 'time':
        return value > 0; // Any time bonus
      default:
        return false;
    }
  }

  private getComboMultiplier(type: ScoreEvent['type']): number {
    const comboKey = this.getComboKey(type);
    const combo = this.comboChains.get(comboKey);
    return combo ? combo.multiplier : 1.0;
  }

  private getStyleMultiplier(styleType: StyleScore['type']): number {
    const multipliers = {
      'flip': 2.0,
      'slide': 1.5,
      'jump': 1.8,
      'dodge': 2.2,
      'trick': 2.5
    };
    return multipliers[styleType] || 1.0;
  }

  private calculateStyleBonus(styleType: StyleScore['type'], difficulty: number): number {
    const baseBonuses = {
      'flip': 100,
      'slide': 75,
      'jump': 90,
      'dodge': 110,
      'trick': 125
    };
    return (baseBonuses[styleType] || 50) * difficulty;
  }

  private getSkillBonuses(): { total: number; speed: number; accuracy: number; endurance: number; luck: number; strategy: number } {
    const playerLevel = this.levelSystem.getPlayerLevel();
    return {
      total: playerLevel.skillTree.speed.bonuses.reduce((sum, b) => sum + b.value, 0) +
             playerLevel.skillTree.accuracy.bonuses.reduce((sum, b) => sum + b.value, 0) +
             playerLevel.skillTree.endurance.bonuses.reduce((sum, b) => sum + b.value, 0) +
             playerLevel.skillTree.luck.bonuses.reduce((sum, b) => sum + b.value, 0) +
             playerLevel.skillTree.strategy.bonuses.reduce((sum, b) => sum + b.value, 0),
      speed: playerLevel.skillTree.speed.bonuses.reduce((sum, b) => sum + b.value, 0),
      accuracy: playerLevel.skillTree.accuracy.bonuses.reduce((sum, b) => sum + b.value, 0),
      endurance: playerLevel.skillTree.endurance.bonuses.reduce((sum, b) => sum + b.value, 0),
      luck: playerLevel.skillTree.luck.bonuses.reduce((sum, b) => sum + b.value, 0),
      strategy: playerLevel.skillTree.strategy.bonuses.reduce((sum, b) => sum + b.value, 0)
    };
  }

  private getDifficultyMultiplier(): number {
    if (!this.currentSession) return 1.0;
    
    const multipliers = {
      'Easy': 0.8,
      'Normal': 1.0,
      'Hard': 1.3,
      'Expert': 1.6,
      'Master': 2.0
    };
    return multipliers[this.currentSession.difficulty] || 1.0;
  }

  private getLevelMultiplier(): number {
    if (!this.currentSession) return 1.0;
    
    const level = this.currentSession.playerLevel;
    if (level <= 10) return 1.0;
    if (level <= 25) return 1.1;
    if (level <= 50) return 1.2;
    if (level <= 75) return 1.3;
    return 1.5;
  }

  private calculateFinalScore(): DynamicScore {
    if (!this.currentSession) {
      throw new Error('No active game session');
    }

    const baseScore = this.calculateBaseScore();
    const multiplierScore = this.calculateMultiplierScore();
    const bonusScore = this.calculateBonusScore();
    const timeBonus = this.calculateTimeBonus();
    const difficultyBonus = this.calculateDifficultyBonus();
    const levelBonus = this.calculateLevelBonus();

    const totalScore = baseScore + multiplierScore + bonusScore + timeBonus + difficultyBonus + levelBonus;

    return {
      baseScore,
      multiplierScore,
      bonusScore,
      totalScore,
      comboChains: Array.from(this.comboChains.values()),
      stylePoints: this.styleScores,
      riskRewards: this.riskRewards,
      timeBonus,
      difficultyBonus,
      levelBonus
    };
  }

  private calculateBaseScore(): number {
    return this.scoreEvents.reduce((total, event) => {
      return total + (event.value * this.baseMultipliers.get(event.type)!);
    }, 0);
  }

  private calculateMultiplierScore(): number {
    return this.scoreEvents.reduce((total, event) => {
      return total + (event.value * event.multiplier);
    }, 0);
  }

  private calculateBonusScore(): number {
    return this.scoreEvents.reduce((total, event) => {
      return total + event.bonus;
    }, 0);
  }

  private calculateTimeBonus(): number {
    if (!this.currentSession?.endTime) return 0;
    
    const duration = this.currentSession.endTime - this.currentSession.startTime;
    const durationMinutes = duration / (1000 * 60);
    
    // Bonus for completing quickly
    if (durationMinutes < 5) return 1000;
    if (durationMinutes < 10) return 500;
    if (durationMinutes < 15) return 250;
    return 0;
  }

  private calculateDifficultyBonus(): number {
    if (!this.currentSession) return 0;
    
    const bonuses = {
      'Easy': 0,
      'Normal': 100,
      'Hard': 300,
      'Expert': 600,
      'Master': 1000
    };
    return bonuses[this.currentSession.difficulty] || 0;
  }

  private calculateLevelBonus(): number {
    if (!this.currentSession) return 0;
    
    const level = this.currentSession.playerLevel;
    return level * 10; // 10 points per level
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public getCurrentScore(): number {
    if (!this.currentSession) return 0;
    
    const partialScore = this.calculateFinalScore();
    return partialScore.totalScore;
  }

  public getComboStatus(): { [key: string]: ComboChain } {
    return Object.fromEntries(this.comboChains);
  }

  public getStylePoints(): StyleScore[] {
    return [...this.styleScores];
  }

  public addRiskReward(riskLevel: RiskReward['riskLevel'], success: boolean): void {
    const riskReward: RiskReward = {
      riskLevel,
      rewardMultiplier: this.getRiskMultiplier(riskLevel),
      failurePenalty: this.getFailurePenalty(riskLevel),
      successBonus: this.getSuccessBonus(riskLevel)
    };

    this.riskRewards.push(riskReward);
  }

  private getRiskMultiplier(riskLevel: RiskReward['riskLevel']): number {
    const multipliers = {
      'Low': 1.2,
      'Medium': 1.5,
      'High': 2.0,
      'Extreme': 3.0
    };
    return multipliers[riskLevel] || 1.0;
  }

  private getFailurePenalty(riskLevel: RiskReward['riskLevel']): number {
    const penalties = {
      'Low': 50,
      'Medium': 100,
      'High': 200,
      'Extreme': 500
    };
    return penalties[riskLevel] || 0;
  }

  private getSuccessBonus(riskLevel: RiskReward['riskLevel']): number {
    const bonuses = {
      'Low': 100,
      'Medium': 250,
      'High': 500,
      'Extreme': 1000
    };
    return bonuses[riskLevel] || 0;
  }
}
