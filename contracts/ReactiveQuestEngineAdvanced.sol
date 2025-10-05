// contracts/ReactiveQuestEngineAdvanced.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IReactive, Reactive} from "@reactive-chain/contracts/Reactive.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ReactiveQuestEngineAdvanced is Reactive, VRFConsumerBaseV2, ReentrancyGuard, Ownable {
    // Enhanced event signatures for comprehensive tracking
    bytes32 constant TRANSFER_EVENT = keccak256("Transfer(address,address,uint256)");
    bytes32 constant SWAP_EVENT = keccak256("Swap(address,uint256,uint256,uint256,uint256,address)");
    bytes32 constant LEVEL_COMPLETED_EVENT = keccak256("LevelCompleted(address,uint256,uint256)");
    bytes32 constant HIGH_SCORE_BEAT_EVENT = keccak256("HighScoreBeat(address,uint256,uint256)");
    bytes32 constant NFT_MINTED_EVENT = keccak256("Transfer(address,address,uint256)");
    bytes32 constant LP_POSITION_CREATED = keccak256("LiquidityAdded(address,uint256,uint256)");

    // Chainlink VRF Configuration
    VRFCoordinatorV2Interface COORDINATOR;
    uint64 s_subscriptionId;
    bytes32 s_keyHash = 0x83250c5584ffa93feb6ee082981c5ebe484c865196750b39835ad4f13780435d;
    uint32 callbackGasLimit = 2500000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 1;

    // Enhanced Quest System
    struct Quest {
        uint256 questId;
        QuestType qType;
        QuestDifficulty difficulty;
        address verificationContract;
        uint256 minAmount;
        uint256 baseReward;
        uint256 bonusMultiplier;
        bool isActive;
        uint256 completionCount;
        uint256 maxCompletions;
        string metadata;
    }

    enum QuestType { 
        TRANSFER, 
        SWAP, 
        NFT_MINT, 
        CONTRACT_INTERACTION, 
        LEVEL_COMPLETION,
        HIGH_SCORE,
        LIQUIDITY_PROVISION,
        DAILY_LOGIN,
        STREAK_ACHIEVEMENT
    }

    enum QuestDifficulty { BEGINNER, INTERMEDIATE, ADVANCED, EXPERT }

    // Advanced Player Tracking
    struct PlayerProfile {
        uint256 totalScore;
        uint256 highestScore;
        uint256 level;
        uint256 experience;
        uint256 streakDays;
        uint256 lastLoginTimestamp;
        uint256 totalQuestsCompleted;
        uint256 totalRewardsEarned;
        mapping(uint256 => bool) questCompletions;
        mapping(QuestDifficulty => uint256) difficultyCompletions;
        bool isActive;
    }

    // Dynamic NFT Evolution System
    struct DynamicNFT {
        uint256 tokenId;
        uint256 level;
        uint256 experience;
        uint256 evolutionStage;
        string baseMetadata;
        mapping(string => uint256) attributes;
    }

    // Provably Fair Raffle System
    struct WeeklyRaffle {
        uint256 raffleId;
        uint256 startTime;
        uint256 endTime;
        uint256 prizePool;
        address[] participants;
        mapping(address => uint256) ticketCounts;
        bool isActive;
        bool isCompleted;
        address winner;
        uint256 randomWord;
    }

    // State Variables
    mapping(address => PlayerProfile) public players;
    mapping(uint256 => Quest) public quests;
    mapping(uint256 => DynamicNFT) public dynamicNFTs;
    mapping(uint256 => WeeklyRaffle) public weeklyRaffles;
    mapping(uint256 => uint256) public vrfRequests; // requestId => raffleId
    
    uint256 public questCounter;
    uint256 public raffleCounter;
    uint256 public currentRaffleId;
    uint256 public constant RAFFLE_DURATION = 7 days;
    uint256 public constant EXPERIENCE_PER_LEVEL = 1000;

    // Events
    event QuestCompleted(address indexed player, uint256 questId, uint256 reward, uint256 timestamp);
    event LevelUp(address indexed player, uint256 newLevel, uint256 bonusReward);
    event StreakAchieved(address indexed player, uint256 streakDays, uint256 bonusReward);
    event NFTEvolved(uint256 indexed tokenId, uint256 newStage, string newMetadata);
    event RaffleEntered(address indexed player, uint256 raffleId, uint256 tickets);
    event RaffleWinner(uint256 raffleId, address winner, uint256 prize);
    event DynamicRewardCalculated(address indexed player, uint256 baseReward, uint256 finalReward);

    constructor(
        IReactive reactive, 
        uint64 subscriptionId,
        address vrfCoordinator
    ) 
        Reactive(reactive, subscriptionId) 
        VRFConsumerBaseV2(vrfCoordinator)
        Ownable(msg.sender)
    {
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        s_subscriptionId = subscriptionId;
        
        // Register for comprehensive event listening
        _registerEvent(TRANSFER_EVENT);
        _registerEvent(SWAP_EVENT);
        _registerEvent(LEVEL_COMPLETED_EVENT);
        _registerEvent(HIGH_SCORE_BEAT_EVENT);
        _registerEvent(NFT_MINTED_EVENT);
        _registerEvent(LP_POSITION_CREATED);
        
        // Initialize default quests
        _initializeAdvancedQuests();
        
        // Start first weekly raffle
        _startNewRaffle();
    }

    /// @dev Enhanced reactive callback with comprehensive event handling
    function react(
        bytes32 eventId,
        address emitter,
        bytes calldata data
    ) external override reactive nonReentrant {
        if (eventId == TRANSFER_EVENT) {
            _handleTransferEvent(emitter, data);
        } else if (eventId == SWAP_EVENT) {
            _handleSwapEvent(emitter, data);
        } else if (eventId == LEVEL_COMPLETED_EVENT) {
            _handleLevelCompletedEvent(emitter, data);
        } else if (eventId == HIGH_SCORE_BEAT_EVENT) {
            _handleHighScoreEvent(emitter, data);
        } else if (eventId == NFT_MINTED_EVENT) {
            _handleNFTMintEvent(emitter, data);
        } else if (eventId == LP_POSITION_CREATED) {
            _handleLiquidityEvent(emitter, data);
        }
    }

    function _handleLevelCompletedEvent(address emitter, bytes calldata data) internal {
        (address player, uint256 level, uint256 score) = abi.decode(data, (address, uint256, uint256));
        
        // Find matching level completion quest
        for (uint256 i = 1; i <= questCounter; i++) {
            Quest storage quest = quests[i];
            if (quest.qType == QuestType.LEVEL_COMPLETION && 
                quest.verificationContract == emitter &&
                quest.isActive &&
                !players[player].questCompletions[i]) {
                
                _completeAdvancedQuest(player, i, score);
                break;
            }
        }
    }

    function _handleHighScoreEvent(address emitter, bytes calldata data) internal {
        (address player, uint256 newScore, uint256 previousScore) = abi.decode(data, (address, uint256, uint256));
        
        // Update player profile
        PlayerProfile storage profile = players[player];
        if (newScore > profile.highestScore) {
            profile.highestScore = newScore;
            
            // Check for high score quests
            for (uint256 i = 1; i <= questCounter; i++) {
                Quest storage quest = quests[i];
                if (quest.qType == QuestType.HIGH_SCORE && 
                    newScore >= quest.minAmount &&
                    quest.isActive &&
                    !profile.questCompletions[i]) {
                    
                    _completeAdvancedQuest(player, i, newScore);
                }
            }
        }
    }

    function _completeAdvancedQuest(address player, uint256 questId, uint256 contextValue) internal {
        Quest storage quest = quests[questId];
        PlayerProfile storage profile = players[player];
        
        require(!profile.questCompletions[questId], "Quest already completed");
        require(quest.isActive, "Quest not active");
        
        // Mark quest as completed
        profile.questCompletions[questId] = true;
        profile.totalQuestsCompleted++;
        quest.completionCount++;
        
        // Calculate dynamic reward based on difficulty and player level
        uint256 baseReward = quest.baseReward;
        uint256 difficultyMultiplier = _getDifficultyMultiplier(quest.difficulty);
        uint256 levelBonus = profile.level * 100; // 100 tokens per level
        uint256 streakBonus = _calculateStreakBonus(player);
        
        uint256 finalReward = (baseReward * difficultyMultiplier / 100) + levelBonus + streakBonus;
        
        // Add experience and check for level up
        uint256 experienceGain = _calculateExperienceGain(quest.difficulty, contextValue);
        profile.experience += experienceGain;
        profile.totalRewardsEarned += finalReward;
        
        // Check for level up
        uint256 newLevel = profile.experience / EXPERIENCE_PER_LEVEL + 1;
        if (newLevel > profile.level) {
            profile.level = newLevel;
            uint256 levelUpBonus = newLevel * 500; // 500 tokens per level
            finalReward += levelUpBonus;
            emit LevelUp(player, newLevel, levelUpBonus);
        }
        
        // Update difficulty completion tracking
        profile.difficultyCompletions[quest.difficulty]++;
        
        // Mint achievement NFT with dynamic properties
        _mintDynamicAchievementNFT(player, questId, contextValue);
        
        // Distribute token rewards
        _distributeTokenRewards(player, finalReward);
        
        // Enter into weekly raffle
        _enterWeeklyRaffle(player, quest.difficulty);
        
        // Check for dynamic NFT evolution
        _checkNFTEvolution(player);
        
        emit QuestCompleted(player, questId, finalReward, block.timestamp);
        emit DynamicRewardCalculated(player, baseReward, finalReward);
    }

    function _calculateStreakBonus(address player) internal returns (uint256) {
        PlayerProfile storage profile = players[player];
        
        // Check if this is a daily login (within 24 hours of last login)
        if (block.timestamp - profile.lastLoginTimestamp >= 1 days) {
            if (block.timestamp - profile.lastLoginTimestamp <= 2 days) {
                // Maintain streak
                profile.streakDays++;
            } else {
                // Reset streak
                profile.streakDays = 1;
            }
            profile.lastLoginTimestamp = block.timestamp;
            
            // Calculate streak bonus
            uint256 streakBonus = profile.streakDays * 50; // 50 tokens per streak day
            
            // Special streak milestones
            if (profile.streakDays == 7) {
                streakBonus += 1000; // Weekly streak bonus
            } else if (profile.streakDays == 30) {
                streakBonus += 5000; // Monthly streak bonus
            }
            
            if (profile.streakDays >= 7) {
                emit StreakAchieved(player, profile.streakDays, streakBonus);
            }
            
            return streakBonus;
        }
        
        return 0;
    }

    function _mintDynamicAchievementNFT(address player, uint256 questId, uint256 contextValue) internal {
        // This would interact with the EducationalNFT contract
        // Implementation depends on the NFT contract interface
        
        // For now, emit an event that the NFT contract can listen to
        // In a full implementation, this would make a cross-chain call
    }

    function _enterWeeklyRaffle(address player, QuestDifficulty difficulty) internal {
        WeeklyRaffle storage raffle = weeklyRaffles[currentRaffleId];
        
        if (!raffle.isActive || block.timestamp > raffle.endTime) {
            _startNewRaffle();
            raffle = weeklyRaffles[currentRaffleId];
        }
        
        // Calculate tickets based on difficulty
        uint256 tickets = _getDifficultyTickets(difficulty);
        
        // Add player to raffle
        for (uint256 i = 0; i < tickets; i++) {
            raffle.participants.push(player);
        }
        raffle.ticketCounts[player] += tickets;
        
        emit RaffleEntered(player, currentRaffleId, tickets);
    }

    function _startNewRaffle() internal {
        raffleCounter++;
        currentRaffleId = raffleCounter;
        
        WeeklyRaffle storage newRaffle = weeklyRaffles[currentRaffleId];
        newRaffle.raffleId = currentRaffleId;
        newRaffle.startTime = block.timestamp;
        newRaffle.endTime = block.timestamp + RAFFLE_DURATION;
        newRaffle.prizePool = 10000 * 10**18; // 10,000 RUSH tokens
        newRaffle.isActive = true;
        newRaffle.isCompleted = false;
    }

    function requestRaffleRandomness() external onlyOwner {
        WeeklyRaffle storage raffle = weeklyRaffles[currentRaffleId];
        require(block.timestamp > raffle.endTime, "Raffle still active");
        require(!raffle.isCompleted, "Raffle already completed");
        require(raffle.participants.length > 0, "No participants");
        
        uint256 requestId = COORDINATOR.requestRandomWords(
            s_keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
        
        vrfRequests[requestId] = currentRaffleId;
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        uint256 raffleId = vrfRequests[requestId];
        WeeklyRaffle storage raffle = weeklyRaffles[raffleId];
        
        raffle.randomWord = randomWords[0];
        uint256 winnerIndex = randomWords[0] % raffle.participants.length;
        address winner = raffle.participants[winnerIndex];
        
        raffle.winner = winner;
        raffle.isCompleted = true;
        raffle.isActive = false;
        
        // Distribute prize
        _distributeTokenRewards(winner, raffle.prizePool);
        
        emit RaffleWinner(raffleId, winner, raffle.prizePool);
        
        // Start next raffle
        _startNewRaffle();
    }

    function _checkNFTEvolution(address player) internal {
        // Check if player's NFTs should evolve based on achievements
        // This would interact with the dynamic NFT system
        PlayerProfile storage profile = players[player];
        
        // Example: Evolve NFT every 10 quest completions
        if (profile.totalQuestsCompleted % 10 == 0 && profile.totalQuestsCompleted > 0) {
            // Trigger NFT evolution
            // Implementation would depend on NFT contract
        }
    }

    function _getDifficultyMultiplier(QuestDifficulty difficulty) internal pure returns (uint256) {
        if (difficulty == QuestDifficulty.BEGINNER) return 100;
        if (difficulty == QuestDifficulty.INTERMEDIATE) return 150;
        if (difficulty == QuestDifficulty.ADVANCED) return 200;
        if (difficulty == QuestDifficulty.EXPERT) return 300;
        return 100;
    }

    function _getDifficultyTickets(QuestDifficulty difficulty) internal pure returns (uint256) {
        if (difficulty == QuestDifficulty.BEGINNER) return 1;
        if (difficulty == QuestDifficulty.INTERMEDIATE) return 2;
        if (difficulty == QuestDifficulty.ADVANCED) return 3;
        if (difficulty == QuestDifficulty.EXPERT) return 5;
        return 1;
    }

    function _calculateExperienceGain(QuestDifficulty difficulty, uint256 contextValue) internal pure returns (uint256) {
        uint256 baseExp = 100;
        uint256 difficultyBonus = _getDifficultyMultiplier(difficulty);
        uint256 contextBonus = contextValue / 1000; // 1 exp per 1000 context value (score, amount, etc.)
        
        return baseExp + (baseExp * difficultyBonus / 100) + contextBonus;
    }

    function _initializeAdvancedQuests() internal {
        // Initialize comprehensive quest system
        _createQuest(QuestType.TRANSFER, QuestDifficulty.BEGINNER, address(0), 1000000000000000, 1000, 100, "First Transaction");
        _createQuest(QuestType.SWAP, QuestDifficulty.INTERMEDIATE, address(0), 5000000000000000, 2500, 150, "DEX Explorer");
        _createQuest(QuestType.HIGH_SCORE, QuestDifficulty.ADVANCED, address(0), 5000, 5000, 200, "High Scorer");
        _createQuest(QuestType.LEVEL_COMPLETION, QuestDifficulty.EXPERT, address(0), 10, 10000, 300, "Level Master");
        _createQuest(QuestType.LIQUIDITY_PROVISION, QuestDifficulty.ADVANCED, address(0), 100000000000000000, 7500, 250, "Liquidity Provider");
    }

    function _createQuest(
        QuestType qType,
        QuestDifficulty difficulty,
        address verificationContract,
        uint256 minAmount,
        uint256 baseReward,
        uint256 bonusMultiplier,
        string memory metadata
    ) internal {
        questCounter++;
        Quest storage newQuest = quests[questCounter];
        newQuest.questId = questCounter;
        newQuest.qType = qType;
        newQuest.difficulty = difficulty;
        newQuest.verificationContract = verificationContract;
        newQuest.minAmount = minAmount;
        newQuest.baseReward = baseReward * 10**18; // Convert to wei
        newQuest.bonusMultiplier = bonusMultiplier;
        newQuest.isActive = true;
        newQuest.maxCompletions = 1000; // Default max completions
        newQuest.metadata = metadata;
    }

    // Utility functions
    function getPlayerProfile(address player) external view returns (
        uint256 totalScore,
        uint256 highestScore,
        uint256 level,
        uint256 experience,
        uint256 streakDays,
        uint256 totalQuestsCompleted,
        uint256 totalRewardsEarned
    ) {
        PlayerProfile storage profile = players[player];
        return (
            profile.totalScore,
            profile.highestScore,
            profile.level,
            profile.experience,
            profile.streakDays,
            profile.totalQuestsCompleted,
            profile.totalRewardsEarned
        );
    }

    function getCurrentRaffle() external view returns (
        uint256 raffleId,
        uint256 startTime,
        uint256 endTime,
        uint256 prizePool,
        uint256 participantCount,
        bool isActive
    ) {
        WeeklyRaffle storage raffle = weeklyRaffles[currentRaffleId];
        return (
            raffle.raffleId,
            raffle.startTime,
            raffle.endTime,
            raffle.prizePool,
            raffle.participants.length,
            raffle.isActive
        );
    }

    // Abstract functions to be implemented by inheriting contracts
    function _distributeTokenRewards(address player, uint256 amount) internal virtual;
    function _handleTransferEvent(address emitter, bytes calldata data) internal virtual;
    function _handleSwapEvent(address emitter, bytes calldata data) internal virtual;
    function _handleNFTMintEvent(address emitter, bytes calldata data) internal virtual;
    function _handleLiquidityEvent(address emitter, bytes calldata data) internal virtual;
}
