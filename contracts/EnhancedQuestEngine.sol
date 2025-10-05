// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./AutomatedRewardSystem.sol";
import "./AchievementNFT.sol";
import "./RushToken.sol";

/**
 * @title EnhancedQuestEngine - Advanced quest management with automated rewards
 * @dev Integrates with AutomatedRewardSystem for seamless reward distribution
 * @notice Provides enhanced quest management with performance tracking
 */
contract EnhancedQuestEngine is Ownable, ReentrancyGuard {
    
    // ============ STATE VARIABLES ============
    
    AutomatedRewardSystem public rewardSystem;
    AchievementNFT public achievementNFT;
    RushToken public rushToken;
    
    uint256 public questCounter;
    
    mapping(uint256 => Quest) public quests;
    mapping(address => mapping(uint256 => QuestProgress)) public playerProgress;
    
    // ============ STRUCTS ============
    
    struct Quest {
        uint256 questId;
        string title;
        string description;
        string category;
        uint256 difficulty; // 1-5 scale
        uint256 estimatedDuration; // in minutes
        uint256 requiredScore;
        string[] learningObjectives;
        uint256[] prerequisites;
        uint256 rewardPoints;
        uint256 xpReward;
        bool isActive;
        address creator;
        uint256 createdAt;
    }
    
    struct QuestProgress {
        uint256 currentScore;
        uint256 maxScore;
        uint256 timeSpent;
        bool isCompleted;
        uint256 completedAt;
        uint256 attempts;
    }
    
    // ============ EVENTS ============
    
    event QuestCreated(uint256 indexed questId, address indexed creator, string title);
    event QuestStarted(uint256 indexed questId, address indexed player);
    event QuestCompleted(uint256 indexed questId, address indexed player, uint256 score, uint256 xpEarned);
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        address _rewardSystem,
        address _achievementNFT,
        address _rushToken
    ) Ownable(msg.sender) {
        rewardSystem = AutomatedRewardSystem(_rewardSystem);
        achievementNFT = AchievementNFT(_achievementNFT);
        rushToken = RushToken(_rushToken);
    }
    
    // ============ QUEST MANAGEMENT FUNCTIONS ============
    
    /**
     * @dev Create a new learning module/quest
     */
    function createLearningModule(
        string calldata title,
        string calldata description,
        string calldata category,
        uint256 difficulty,
        uint256 estimatedDuration,
        uint256 requiredScore,
        string[] calldata learningObjectives,
        uint256[] calldata prerequisites,
        uint256 rewardPoints,
        uint256 xpReward
    ) external onlyOwner returns (uint256) {
        questCounter++;
        
        quests[questCounter] = Quest({
            questId: questCounter,
            title: title,
            description: description,
            category: category,
            difficulty: difficulty,
            estimatedDuration: estimatedDuration,
            requiredScore: requiredScore,
            learningObjectives: learningObjectives,
            prerequisites: prerequisites,
            rewardPoints: rewardPoints,
            xpReward: xpReward,
            isActive: true,
            creator: msg.sender,
            createdAt: block.timestamp
        });
        
        emit QuestCreated(questCounter, msg.sender, title);
        return questCounter;
    }
    
    /**
     * @dev Start a quest for a player
     */
    function startQuest(uint256 questId) external {
        require(quests[questId].questId != 0, "Quest does not exist");
        require(quests[questId].isActive, "Quest is not active");
        require(!playerProgress[msg.sender][questId].isCompleted, "Quest already completed");
        
        QuestProgress storage progress = playerProgress[msg.sender][questId];
        if (progress.questId == 0) {
            progress.attempts = 1;
            emit QuestStarted(questId, msg.sender);
        } else {
            progress.attempts++;
        }
    }
    
    /**
     * @dev Complete a quest with performance score
     */
    function completeQuest(
        uint256 questId,
        uint256 score,
        uint256 timeSpent
    ) external nonReentrant {
        require(quests[questId].questId != 0, "Quest does not exist");
        require(quests[questId].isActive, "Quest is not active");
        require(score >= quests[questId].requiredScore, "Score too low");
        require(!playerProgress[msg.sender][questId].isCompleted, "Quest already completed");
        
        Quest storage quest = quests[questId];
        QuestProgress storage progress = playerProgress[msg.sender][questId];
        
        // Update progress
        progress.currentScore = score;
        progress.maxScore = score > progress.maxScore ? score : progress.maxScore;
        progress.timeSpent += timeSpent;
        progress.isCompleted = true;
        progress.completedAt = block.timestamp;
        
        // Calculate difficulty level string for rewards
        string memory difficultyLevel;
        if (quest.difficulty <= 1) {
            difficultyLevel = "beginner";
        } else if (quest.difficulty <= 2) {
            difficultyLevel = "intermediate";
        } else if (quest.difficulty <= 3) {
            difficultyLevel = "advanced";
        } else {
            difficultyLevel = "expert";
        }
        
        // Distribute rewards through automated system
        rewardSystem.distributeRewards(
            msg.sender,
            score,
            difficultyLevel,
            quest.rewardPoints
        );
        
        emit QuestCompleted(questId, msg.sender, score, quest.xpReward);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get quest details
     */
    function getQuest(uint256 questId) external view returns (
        string memory title,
        string memory description,
        string memory category,
        uint256 difficulty,
        uint256 estimatedDuration,
        uint256 requiredScore,
        uint256 rewardPoints,
        uint256 xpReward,
        bool isActive
    ) {
        Quest storage quest = quests[questId];
        return (
            quest.title,
            quest.description,
            quest.category,
            quest.difficulty,
            quest.estimatedDuration,
            quest.requiredScore,
            quest.rewardPoints,
            quest.xpReward,
            quest.isActive
        );
    }
    
    /**
     * @dev Get player's quest progress
     */
    function getPlayerProgress(address player, uint256 questId) external view returns (
        uint256 currentScore,
        uint256 maxScore,
        uint256 timeSpent,
        bool isCompleted,
        uint256 completedAt,
        uint256 attempts
    ) {
        QuestProgress storage progress = playerProgress[player][questId];
        return (
            progress.currentScore,
            progress.maxScore,
            progress.timeSpent,
            progress.isCompleted,
            progress.completedAt,
            progress.attempts
        );
    }
    
    /**
     * @dev Get total number of quests
     */
    function getTotalQuests() external view returns (uint256) {
        return questCounter;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Toggle quest active status
     */
    function toggleQuest(uint256 questId) external onlyOwner {
        quests[questId].isActive = !quests[questId].isActive;
    }
    
    /**
     * @dev Update reward system address
     */
    function setRewardSystem(address _rewardSystem) external onlyOwner {
        require(_rewardSystem != address(0), "Invalid reward system address");
        rewardSystem = AutomatedRewardSystem(_rewardSystem);
    }
    
    /**
     * @dev Update achievement NFT address
     */
    function setAchievementNFT(address _achievementNFT) external onlyOwner {
        require(_achievementNFT != address(0), "Invalid NFT address");
        achievementNFT = AchievementNFT(_achievementNFT);
    }
    
    /**
     * @dev Update RUSH token address
     */
    function setRushToken(address _rushToken) external onlyOwner {
        require(_rushToken != address(0), "Invalid token address");
        rushToken = RushToken(_rushToken);
    }
}