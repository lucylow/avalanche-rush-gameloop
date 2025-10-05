// Enhanced Reactive Integration for Avalanche Rush
// This file implements comprehensive Reactive event triggers for all game actions

import { ethers } from 'ethers';

// Reactive Event Types
export enum ReactiveEventType {
  // Game Actions
  PLAYER_JUMP = 'PLAYER_JUMP',
  PLAYER_SLIDE = 'PLAYER_SLIDE',
  COIN_COLLECTED = 'COIN_COLLECTED',
  OBSTACLE_HIT = 'OBSTACLE_HIT',
  POWERUP_COLLECTED = 'POWERUP_COLLECTED',
  LEVEL_COMPLETED = 'LEVEL_COMPLETED',
  GAME_STARTED = 'GAME_STARTED',
  GAME_ENDED = 'GAME_ENDED',
  
  // Educational Actions
  MODULE_STARTED = 'MODULE_STARTED',
  MODULE_COMPLETED = 'MODULE_COMPLETED',
  QUIZ_ANSWERED = 'QUIZ_ANSWERED',
  CERTIFICATION_EARNED = 'CERTIFICATION_EARNED',
  
  // DeFi Actions
  LIQUIDITY_PROVIDED = 'LIQUIDITY_PROVIDED',
  YIELD_FARMED = 'YIELD_FARMED',
  SWAP_EXECUTED = 'SWAP_EXECUTED',
  STAKE_CREATED = 'STAKE_CREATED',
  
  // Subnet Actions
  SUBNET_CREATED = 'SUBNET_CREATED',
  CROSS_SUBNET_MESSAGE = 'CROSS_SUBNET_MESSAGE',
  VALIDATOR_JOINED = 'VALIDATOR_JOINED',
  
  // Governance Actions
  PROPOSAL_CREATED = 'PROPOSAL_CREATED',
  VOTE_CAST = 'VOTE_CAST',
  TREASURY_ALLOCATED = 'TREASURY_ALLOCATED',
  
  // Social Actions
  ACHIEVEMENT_UNLOCKED = 'ACHIEVEMENT_UNLOCKED',
  LEADERBOARD_UPDATED = 'LEADERBOARD_UPDATED',
  GUILD_JOINED = 'GUILD_JOINED',
  FRIEND_INVITED = 'FRIEND_INVITED'
}

// Reactive Event Data Structure
export interface ReactiveEventData {
  eventType: ReactiveEventType;
  playerAddress: string;
  timestamp: number;
  sessionId: string;
  data: {
    // Game-specific data
    score?: number;
    level?: number;
    coins?: number;
    obstacles?: number;
    powerups?: number;
    
    // Educational data
    moduleId?: string;
    moduleProgress?: number;
    quizScore?: number;
    certificationId?: string;
    
    // DeFi data
    tokenAmount?: string;
    poolId?: string;
    yieldRate?: number;
    swapAmount?: string;
    
    // Subnet data
    subnetId?: string;
    messageType?: string;
    validatorId?: string;
    
    // Governance data
    proposalId?: string;
    voteChoice?: string;
    allocationAmount?: string;
    
    // Social data
    achievementId?: string;
    rank?: number;
    guildId?: string;
    friendAddress?: string;
  };
  gasUsed?: number;
  transactionHash?: string;
}

// Reactive Event Manager
export class ReactiveEventManager {
  private contract: ethers.Contract;
  private eventQueue: ReactiveEventData[] = [];
  private batchSize = 10;
  private batchTimeout = 5000; // 5 seconds
  private batchTimer?: NodeJS.Timeout;

  constructor(contract: ethers.Contract) {
    this.contract = contract;
  }

  // Queue event for batch processing
  async queueEvent(eventData: ReactiveEventData): Promise<void> {
    this.eventQueue.push(eventData);
    
    // Process batch if queue is full
    if (this.eventQueue.length >= this.batchSize) {
      await this.processBatch();
    } else {
      // Set timer for batch processing
      if (this.batchTimer) {
        clearTimeout(this.batchTimer);
      }
      this.batchTimer = setTimeout(() => {
        this.processBatch();
      }, this.batchTimeout);
    }
  }

  // Process batch of events
  private async processBatch(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const batch = this.eventQueue.splice(0, this.batchSize);
    
    try {
      // Batch process events to optimize gas usage
      await this.contract.batchProcessEvents(
        batch.map(event => ({
          eventType: event.eventType,
          playerAddress: event.playerAddress,
          timestamp: event.timestamp,
          sessionId: event.sessionId,
          data: JSON.stringify(event.data)
        }))
      );
      
      console.log(`Processed batch of ${batch.length} Reactive events`);
    } catch (error) {
      console.error('Error processing Reactive event batch:', error);
      // Re-queue failed events
      this.eventQueue.unshift(...batch);
    }
  }

  // Individual event processing (for critical events)
  async processEventImmediately(eventData: ReactiveEventData): Promise<void> {
    try {
      const tx = await this.contract.processEvent(
        eventData.eventType,
        eventData.playerAddress,
        eventData.timestamp,
        eventData.sessionId,
        JSON.stringify(eventData.data)
      );
      
      eventData.transactionHash = tx.hash;
      console.log(`Processed Reactive event: ${eventData.eventType}`, tx.hash);
    } catch (error) {
      console.error('Error processing Reactive event:', error);
    }
  }
}

// Game Action Triggers
export class GameActionTriggers {
  private reactiveManager: ReactiveEventManager;
  private sessionId: string;

  constructor(reactiveManager: ReactiveEventManager, sessionId: string) {
    this.reactiveManager = reactiveManager;
    this.sessionId = sessionId;
  }

  // Player Actions
  async onPlayerJump(playerAddress: string): Promise<void> {
    await this.reactiveManager.queueEvent({
      eventType: ReactiveEventType.PLAYER_JUMP,
      playerAddress,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      data: {}
    });
  }

  async onPlayerSlide(playerAddress: string): Promise<void> {
    await this.reactiveManager.queueEvent({
      eventType: ReactiveEventType.PLAYER_SLIDE,
      playerAddress,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      data: {}
    });
  }

  async onCoinCollected(playerAddress: string, coins: number): Promise<void> {
    await this.reactiveManager.queueEvent({
      eventType: ReactiveEventType.COIN_COLLECTED,
      playerAddress,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      data: { coins }
    });
  }

  async onObstacleHit(playerAddress: string, obstacleType: string): Promise<void> {
    await this.reactiveManager.queueEvent({
      eventType: ReactiveEventType.OBSTACLE_HIT,
      playerAddress,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      data: { obstacles: 1 }
    });
  }

  async onPowerupCollected(playerAddress: string, powerupType: string): Promise<void> {
    await this.reactiveManager.queueEvent({
      eventType: ReactiveEventType.POWERUP_COLLECTED,
      playerAddress,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      data: { powerups: 1 }
    });
  }

  async onLevelCompleted(playerAddress: string, level: number, score: number): Promise<void> {
    await this.reactiveManager.processEventImmediately({
      eventType: ReactiveEventType.LEVEL_COMPLETED,
      playerAddress,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      data: { level, score }
    });
  }

  async onGameStarted(playerAddress: string): Promise<void> {
    await this.reactiveManager.processEventImmediately({
      eventType: ReactiveEventType.GAME_STARTED,
      playerAddress,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      data: {}
    });
  }

  async onGameEnded(playerAddress: string, finalScore: number, coins: number): Promise<void> {
    await this.reactiveManager.processEventImmediately({
      eventType: ReactiveEventType.GAME_ENDED,
      playerAddress,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      data: { score: finalScore, coins }
    });
  }
}

// Educational Action Triggers
export class EducationalActionTriggers {
  private reactiveManager: ReactiveEventManager;

  constructor(reactiveManager: ReactiveEventManager) {
    this.reactiveManager = reactiveManager;
  }

  async onModuleStarted(playerAddress: string, moduleId: string): Promise<void> {
    await this.reactiveManager.queueEvent({
      eventType: ReactiveEventType.MODULE_STARTED,
      playerAddress,
      timestamp: Date.now(),
      sessionId: `module_${moduleId}_${Date.now()}`,
      data: { moduleId, moduleProgress: 0 }
    });
  }

  async onModuleCompleted(playerAddress: string, moduleId: string, progress: number): Promise<void> {
    await this.reactiveManager.processEventImmediately({
      eventType: ReactiveEventType.MODULE_COMPLETED,
      playerAddress,
      timestamp: Date.now(),
      sessionId: `module_${moduleId}_${Date.now()}`,
      data: { moduleId, moduleProgress: progress }
    });
  }

  async onQuizAnswered(playerAddress: string, moduleId: string, score: number): Promise<void> {
    await this.reactiveManager.queueEvent({
      eventType: ReactiveEventType.QUIZ_ANSWERED,
      playerAddress,
      timestamp: Date.now(),
      sessionId: `quiz_${moduleId}_${Date.now()}`,
      data: { moduleId, quizScore: score }
    });
  }

  async onCertificationEarned(playerAddress: string, certificationId: string): Promise<void> {
    await this.reactiveManager.processEventImmediately({
      eventType: ReactiveEventType.CERTIFICATION_EARNED,
      playerAddress,
      timestamp: Date.now(),
      sessionId: `cert_${certificationId}_${Date.now()}`,
      data: { certificationId }
    });
  }
}

// DeFi Action Triggers
export class DeFiActionTriggers {
  private reactiveManager: ReactiveEventManager;

  constructor(reactiveManager: ReactiveEventManager) {
    this.reactiveManager = reactiveManager;
  }

  async onLiquidityProvided(playerAddress: string, tokenAmount: string, poolId: string): Promise<void> {
    await this.reactiveManager.processEventImmediately({
      eventType: ReactiveEventType.LIQUIDITY_PROVIDED,
      playerAddress,
      timestamp: Date.now(),
      sessionId: `defi_${Date.now()}`,
      data: { tokenAmount, poolId }
    });
  }

  async onYieldFarmed(playerAddress: string, yieldRate: number, amount: string): Promise<void> {
    await this.reactiveManager.queueEvent({
      eventType: ReactiveEventType.YIELD_FARMED,
      playerAddress,
      timestamp: Date.now(),
      sessionId: `yield_${Date.now()}`,
      data: { yieldRate, tokenAmount: amount }
    });
  }

  async onSwapExecuted(playerAddress: string, swapAmount: string, tokenPair: string): Promise<void> {
    await this.reactiveManager.queueEvent({
      eventType: ReactiveEventType.SWAP_EXECUTED,
      playerAddress,
      timestamp: Date.now(),
      sessionId: `swap_${Date.now()}`,
      data: { swapAmount }
    });
  }

  async onStakeCreated(playerAddress: string, stakeAmount: string, validatorId: string): Promise<void> {
    await this.reactiveManager.processEventImmediately({
      eventType: ReactiveEventType.STAKE_CREATED,
      playerAddress,
      timestamp: Date.now(),
      sessionId: `stake_${Date.now()}`,
      data: { tokenAmount: stakeAmount, validatorId }
    });
  }
}

// Subnet Action Triggers
export class SubnetActionTriggers {
  private reactiveManager: ReactiveEventManager;

  constructor(reactiveManager: ReactiveEventManager) {
    this.reactiveManager = reactiveManager;
  }

  async onSubnetCreated(playerAddress: string, subnetId: string): Promise<void> {
    await this.reactiveManager.processEventImmediately({
      eventType: ReactiveEventType.SUBNET_CREATED,
      playerAddress,
      timestamp: Date.now(),
      sessionId: `subnet_${Date.now()}`,
      data: { subnetId }
    });
  }

  async onCrossSubnetMessage(playerAddress: string, messageType: string, subnetId: string): Promise<void> {
    await this.reactiveManager.queueEvent({
      eventType: ReactiveEventType.CROSS_SUBNET_MESSAGE,
      playerAddress,
      timestamp: Date.now(),
      sessionId: `cross_${Date.now()}`,
      data: { messageType, subnetId }
    });
  }

  async onValidatorJoined(playerAddress: string, validatorId: string, subnetId: string): Promise<void> {
    await this.reactiveManager.processEventImmediately({
      eventType: ReactiveEventType.VALIDATOR_JOINED,
      playerAddress,
      timestamp: Date.now(),
      sessionId: `validator_${Date.now()}`,
      data: { validatorId, subnetId }
    });
  }
}

// Governance Action Triggers
export class GovernanceActionTriggers {
  private reactiveManager: ReactiveEventManager;

  constructor(reactiveManager: ReactiveEventManager) {
    this.reactiveManager = reactiveManager;
  }

  async onProposalCreated(playerAddress: string, proposalId: string): Promise<void> {
    await this.reactiveManager.processEventImmediately({
      eventType: ReactiveEventType.PROPOSAL_CREATED,
      playerAddress,
      timestamp: Date.now(),
      sessionId: `proposal_${Date.now()}`,
      data: { proposalId }
    });
  }

  async onVoteCast(playerAddress: string, proposalId: string, voteChoice: string): Promise<void> {
    await this.reactiveManager.queueEvent({
      eventType: ReactiveEventType.VOTE_CAST,
      playerAddress,
      timestamp: Date.now(),
      sessionId: `vote_${Date.now()}`,
      data: { proposalId, voteChoice }
    });
  }

  async onTreasuryAllocated(playerAddress: string, allocationAmount: string, purpose: string): Promise<void> {
    await this.reactiveManager.processEventImmediately({
      eventType: ReactiveEventType.TREASURY_ALLOCATED,
      playerAddress,
      timestamp: Date.now(),
      sessionId: `treasury_${Date.now()}`,
      data: { allocationAmount }
    });
  }
}

// Social Action Triggers
export class SocialActionTriggers {
  private reactiveManager: ReactiveEventManager;

  constructor(reactiveManager: ReactiveEventManager) {
    this.reactiveManager = reactiveManager;
  }

  async onAchievementUnlocked(playerAddress: string, achievementId: string): Promise<void> {
    await this.reactiveManager.processEventImmediately({
      eventType: ReactiveEventType.ACHIEVEMENT_UNLOCKED,
      playerAddress,
      timestamp: Date.now(),
      sessionId: `achievement_${Date.now()}`,
      data: { achievementId }
    });
  }

  async onLeaderboardUpdated(playerAddress: string, rank: number): Promise<void> {
    await this.reactiveManager.queueEvent({
      eventType: ReactiveEventType.LEADERBOARD_UPDATED,
      playerAddress,
      timestamp: Date.now(),
      sessionId: `leaderboard_${Date.now()}`,
      data: { rank }
    });
  }

  async onGuildJoined(playerAddress: string, guildId: string): Promise<void> {
    await this.reactiveManager.processEventImmediately({
      eventType: ReactiveEventType.GUILD_JOINED,
      playerAddress,
      timestamp: Date.now(),
      sessionId: `guild_${Date.now()}`,
      data: { guildId }
    });
  }

  async onFriendInvited(playerAddress: string, friendAddress: string): Promise<void> {
    await this.reactiveManager.queueEvent({
      eventType: ReactiveEventType.FRIEND_INVITED,
      playerAddress,
      timestamp: Date.now(),
      sessionId: `friend_${Date.now()}`,
      data: { friendAddress }
    });
  }
}

// Analytics and Metrics
export class ReactiveAnalytics {
  private events: ReactiveEventData[] = [];

  addEvent(event: ReactiveEventData): void {
    this.events.push(event);
  }

  getEventStats(): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    gasUsed: number;
    averageGasPerEvent: number;
    eventsPerHour: number;
  } {
    const totalEvents = this.events.length;
    const eventsByType: Record<string, number> = {};
    let totalGasUsed = 0;

    this.events.forEach(event => {
      eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;
      if (event.gasUsed) {
        totalGasUsed += event.gasUsed;
      }
    });

    const averageGasPerEvent = totalEvents > 0 ? totalGasUsed / totalEvents : 0;
    
    // Calculate events per hour (last 24 hours)
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    const recentEvents = this.events.filter(event => event.timestamp > oneDayAgo);
    const eventsPerHour = recentEvents.length / 24;

    return {
      totalEvents,
      eventsByType,
      gasUsed: totalGasUsed,
      averageGasPerEvent,
      eventsPerHour
    };
  }

  getPlayerStats(playerAddress: string): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    averageScore: number;
    modulesCompleted: number;
    certificationsEarned: number;
  } {
    const playerEvents = this.events.filter(event => event.playerAddress === playerAddress);
    const eventsByType: Record<string, number> = {};
    let totalScore = 0;
    let scoreCount = 0;
    let modulesCompleted = 0;
    let certificationsEarned = 0;

    playerEvents.forEach(event => {
      eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;
      
      if (event.data.score) {
        totalScore += event.data.score;
        scoreCount++;
      }
      
      if (event.eventType === ReactiveEventType.MODULE_COMPLETED) {
        modulesCompleted++;
      }
      
      if (event.eventType === ReactiveEventType.CERTIFICATION_EARNED) {
        certificationsEarned++;
      }
    });

    return {
      totalEvents: playerEvents.length,
      eventsByType,
      averageScore: scoreCount > 0 ? totalScore / scoreCount : 0,
      modulesCompleted,
      certificationsEarned
    };
  }
}
