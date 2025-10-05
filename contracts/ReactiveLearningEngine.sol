// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./libraries/ReactiveNetwork.sol";
import "./AchievementNFT.sol";
import "./ReactiveBountySystem.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ReactiveLearningEngine - Advanced Gamified Learning with Reactive Network
 * @dev Automatically tracks learning progress and rewards users based on on-chain events
 * @notice Uses Reactive Network to monitor learning activities and distribute rewards
 */
contract ReactiveLearningEngine is ReactiveContract, Ownable, ReentrancyGuard {
    
    // ============ STRUCTS ============
    
    struct LearningModule {
        uint256 moduleId;
        string title;
        string description;
        string category; // "blockchain", "defi", "nft", "avalanche", "reactive"
        uint256 difficulty; // 1-5 scale
        uint256 estimatedDuration; // in minutes
        uint256 requiredScore; // minimum score to complete
        bool isActive;
        uint256 createdAt;
        address creator;
        string[] learningObjectives;
        uint256[] prerequisiteModules;
        uint256 rewardAmount; // RUSH tokens
        uint256 xpReward; // Experience points
    }
    
    struct LearningProgress {
        uint256 moduleId;
        address learner;
        uint256 currentScore;
        uint256 maxScore;
        uint256 timeSpent; // in seconds
        uint256 lastActivity;
        bool isCompleted;
        uint256 completedAt;
        uint256 attempts;
        mapping(string => uint256) objectiveProgress; // objectiveId => progress
        uint256[] completedObjectives;
    }
    
    struct LearningPath {
        uint256 pathId;
        string name;
        string description;
        uint256[] moduleIds;
        uint256 totalXpReward;
        uint256 completionBonus;
        bool isActive;
        address creator;
    }
    
    struct LearnerProfile {
        address learner;
        uint256 totalXp;
        uint256 level;
        uint256 completedModules;
        uint256 completedPaths;
        uint256 totalLearningTime; // in seconds
        uint256 streakDays;
        uint256 lastLearningDay;
        mapping(string => uint256) categoryProgress; // category => modules completed
        uint256[] badges; // badge IDs
        uint256[] achievements;
    }
    
    struct Badge {
        uint256 badgeId;
        string name;
        string description;
        string imageUri;
        uint256 requirement; // e.g., complete 10 modules
        string requirementType; // "modules", "xp", "streak", "category"
        bool isActive;
    }
    
    // ============ STATE VARIABLES ============
    
    mapping(uint256 => LearningModule) public learningModules;
    mapping(uint256 => LearningPath) public learningPaths;
    mapping(uint256 => Badge) public badges;
    
    mapping(address => LearnerProfile) public learnerProfiles;
    mapping(uint256 => mapping(address => LearningProgress)) public learningProgress;
    
    uint256 public moduleCounter;
    uint256 public pathCounter;
    uint256 public badgeCounter;
    
    AchievementNFT public achievementNFT;
    ReactiveBountySystem public bountySystem;
    
    // Learning categories and their multipliers
    mapping(string => uint256) public categoryMultipliers;
    
    // Streak rewards
    mapping(uint256 => uint256) public streakRewards; // days => bonus multiplier
    
    // ============ EVENTS ============
    
    event ModuleCreated(uint256 indexed moduleId, address indexed creator, string title);
    event ModuleStarted(uint256 indexed moduleId, address indexed learner);
    event ModuleCompleted(uint256 indexed moduleId, address indexed learner, uint256 score, uint256 xpEarned);
    event LearningPathCompleted(uint256 indexed pathId, address indexed learner, uint256 bonusReward);
    event BadgeEarned(uint256 indexed badgeId, address indexed learner);
    event StreakAchieved(address indexed learner, uint256 streakDays, uint256 bonusMultiplier);
    event LearningObjectiveCompleted(uint256 indexed moduleId, address indexed learner, string objectiveId);
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        address _reactiveNetwork,
        uint256 _subscriptionId,
        address _achievementNFT,
        address _bountySystem
    ) ReactiveContract(_reactiveNetwork, _subscriptionId) {
        achievementNFT = AchievementNFT(_achievementNFT);
        bountySystem = ReactiveBountySystem(_bountySystem);
        
        // Initialize category multipliers
        categoryMultipliers["blockchain"] = 100; // 1x
        categoryMultipliers["defi"] = 120; // 1.2x
        categoryMultipliers["nft"] = 110; // 1.1x
        categoryMultipliers["avalanche"] = 150; // 1.5x
        categoryMultipliers["reactive"] = 200; // 2x
        
        // Initialize streak rewards
        streakRewards[3] = 110; // 1.1x for 3-day streak
        streakRewards[7] = 125; // 1.25x for 7-day streak
        streakRewards[14] = 150; // 1.5x for 14-day streak
        streakRewards[30] = 200; // 2x for 30-day streak
        
        // Subscribe to learning events
        subscribeToLearningEvents();
    }
    
    // ============ REACTIVE FUNCTIONS ============
    
    /**
     * @dev Process learning events from various sources
     */
    function _processReactiveEvent(
        uint256 chainId,
        address contractAddress,
        bytes32 eventSignature,
        bytes calldata eventData
    ) internal override {
        // Process different types of learning events
        if (eventSignature == keccak256("QuizCompleted(address,uint256,uint256,uint256)")) {
            _processQuizCompletion(eventData);
        } else if (eventSignature == keccak256("TutorialCompleted(address,uint256,uint256)")) {
            _processTutorialCompletion(eventData);
        } else if (eventSignature == keccak256("ReadingProgress(address,uint256,uint256)")) {
            _processReadingProgress(eventData);
        } else if (eventSignature == keccak256("CodingChallengeCompleted(address,string,uint256)")) {
            _processCodingChallenge(eventData);
        }
    }
    
    function _processQuizCompletion(bytes calldata eventData) internal {
        (address learner, uint256 moduleId, uint256 score, uint256 timeSpent) = 
            abi.decode(eventData, (address, uint256, uint256, uint256));
        
        _updateLearningProgress(moduleId, learner, score, timeSpent);
        _checkModuleCompletion(moduleId, learner);
    }
    
    function _processTutorialCompletion(bytes calldata eventData) internal {
        (address learner, uint256 moduleId, uint256 timeSpent) = 
            abi.decode(eventData, (address, uint256, uint256));
        
        _updateLearningProgress(moduleId, learner, 100, timeSpent); // Tutorials are pass/fail
        _checkModuleCompletion(moduleId, learner);
    }
    
    function _processReadingProgress(bytes calldata eventData) internal {
        (address learner, uint256 moduleId, uint256 progress) = 
            abi.decode(eventData, (address, uint256, uint256));
        
        // Convert reading progress to score
        uint256 score = (progress * 100) / 100; // Assuming progress is percentage
        _updateLearningProgress(moduleId, learner, score, 0);
    }
    
    function _processCodingChallenge(bytes calldata eventData) internal {
        (address learner, string memory challengeType, uint256 score) = 
            abi.decode(eventData, (address, string, uint256));
        
        // Find module by challenge type or create dynamic module
        uint256 moduleId = _getModuleByChallengeType(challengeType);
        if (moduleId > 0) {
            _updateLearningProgress(moduleId, learner, score, 0);
            _checkModuleCompletion(moduleId, learner);
        }
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    function _updateLearningProgress(
        uint256 moduleId,
        address learner,
        uint256 score,
        uint256 timeSpent
    ) internal {
        LearningProgress storage progress = learningProgress[moduleId][learner];
        
        if (progress.learner == address(0)) {
            // First time accessing this module
            progress.moduleId = moduleId;
            progress.learner = learner;
            progress.attempts = 1;
            emit ModuleStarted(moduleId, learner);
        } else {
            progress.attempts++;
        }
        
        progress.currentScore = score;
        progress.maxScore = Math.max(progress.maxScore, score);
        progress.timeSpent += timeSpent;
        progress.lastActivity = block.timestamp;
    }
    
    function _checkModuleCompletion(uint256 moduleId, address learner) internal {
        LearningModule storage module = learningModules[moduleId];
        LearningProgress storage progress = learningProgress[moduleId][learner];
        
        if (progress.isCompleted || progress.currentScore < module.requiredScore) {
            return;
        }
        
        // Module completed!
        progress.isCompleted = true;
        progress.completedAt = block.timestamp;
        
        // Calculate XP reward with multipliers
        uint256 baseXp = module.xpReward;
        uint256 categoryMultiplier = categoryMultipliers[module.category];
        uint256 streakMultiplier = _getStreakMultiplier(learner);
        uint256 totalMultiplier = (categoryMultiplier * streakMultiplier) / 100;
        
        uint256 xpEarned = (baseXp * totalMultiplier) / 100;
        
        // Update learner profile
        LearnerProfile storage profile = learnerProfiles[learner];
        profile.totalXp += xpEarned;
        profile.completedModules++;
        profile.totalLearningTime += progress.timeSpent;
        profile.categoryProgress[module.category]++;
        profile.level = _calculateLevel(profile.totalXp);
        
        // Update streak
        _updateStreak(learner);
        
        // Distribute rewards
        if (module.rewardAmount > 0) {
            bountySystem.distributeBounty(moduleId, learner);
        }
        
        // Mint achievement NFT
        achievementNFT.mintAchievement(learner);
        
        // Check for badges
        _checkBadgeEligibility(learner);
        
        emit ModuleCompleted(moduleId, learner, progress.currentScore, xpEarned);
    }
    
    function _getStreakMultiplier(address learner) internal view returns (uint256) {
        LearnerProfile storage profile = learnerProfiles[learner];
        uint256 streak = profile.streakDays;
        
        if (streak >= 30) return streakRewards[30];
        if (streak >= 14) return streakRewards[14];
        if (streak >= 7) return streakRewards[7];
        if (streak >= 3) return streakRewards[3];
        
        return 100; // No bonus
    }
    
    function _updateStreak(address learner) internal {
        LearnerProfile storage profile = learnerProfiles[learner];
        uint256 today = block.timestamp / 1 days;
        uint256 lastDay = profile.lastLearningDay;
        
        if (today == lastDay + 1) {
            // Consecutive day
            profile.streakDays++;
        } else if (today > lastDay + 1) {
            // Streak broken
            profile.streakDays = 1;
        }
        // If today == lastDay, streak continues
        
        profile.lastLearningDay = today;
        
        // Check for streak achievements
        if (profile.streakDays > 0 && _isStreakMilestone(profile.streakDays)) {
            uint256 bonusMultiplier = _getStreakMultiplier(learner);
            emit StreakAchieved(learner, profile.streakDays, bonusMultiplier);
        }
    }
    
    function _isStreakMilestone(uint256 streak) internal pure returns (bool) {
        return streak == 3 || streak == 7 || streak == 14 || streak == 30;
    }
    
    function _calculateLevel(uint256 totalXp) internal pure returns (uint256) {
        // Level formula: level = sqrt(totalXP / 1000)
        return uint256(Math.sqrt(totalXp / 1000)) + 1;
    }
    
    function _checkBadgeEligibility(address learner) internal {
        LearnerProfile storage profile = learnerProfiles[learner];
        
        // Check various badge requirements
        for (uint256 i = 1; i <= badgeCounter; i++) {
            Badge storage badge = badges[i];
            if (!badge.isActive || _hasBadge(learner, i)) continue;
            
            bool eligible = false;
            
            if (keccak256(bytes(badge.requirementType)) == keccak256(bytes("modules"))) {
                eligible = profile.completedModules >= badge.requirement;
            } else if (keccak256(bytes(badge.requirementType)) == keccak256(bytes("xp"))) {
                eligible = profile.totalXp >= badge.requirement;
            } else if (keccak256(bytes(badge.requirementType)) == keccak256(bytes("streak"))) {
                eligible = profile.streakDays >= badge.requirement;
            }
            
            if (eligible) {
                profile.badges.push(i);
                emit BadgeEarned(i, learner);
            }
        }
    }
    
    function _hasBadge(address learner, uint256 badgeId) internal view returns (bool) {
        uint256[] memory userBadges = learnerProfiles[learner].badges;
        for (uint256 i = 0; i < userBadges.length; i++) {
            if (userBadges[i] == badgeId) return true;
        }
        return false;
    }
    
    function _getModuleByChallengeType(string memory challengeType) internal view returns (uint256) {
        // This would typically map challenge types to module IDs
        // For now, return a default coding module
        if (keccak256(bytes(challengeType)) == keccak256(bytes("solidity"))) return 1;
        if (keccak256(bytes(challengeType)) == keccak256(bytes("javascript"))) return 2;
        if (keccak256(bytes(challengeType)) == keccak256(bytes("react"))) return 3;
        return 0;
    }
    
    function subscribeToLearningEvents() internal {
        // Subscribe to various learning platforms and events
        // This would be configured based on the learning platform integration
        
        // Example event signatures for different learning activities:
        // QuizCompleted(address,uint256,uint256,uint256)
        // TutorialCompleted(address,uint256,uint256)
        // ReadingProgress(address,uint256,uint256)
        // CodingChallengeCompleted(address,string,uint256)
    }
    
    // ============ EXTERNAL FUNCTIONS ============
    
    function createLearningModule(
        string calldata title,
        string calldata description,
        string calldata category,
        uint256 difficulty,
        uint256 estimatedDuration,
        uint256 requiredScore,
        string[] calldata learningObjectives,
        uint256[] calldata prerequisites,
        uint256 rewardAmount,
        uint256 xpReward
    ) external onlyOwner returns (uint256) {
        moduleCounter++;
        
        learningModules[moduleCounter] = LearningModule({
            moduleId: moduleCounter,
            title: title,
            description: description,
            category: category,
            difficulty: difficulty,
            estimatedDuration: estimatedDuration,
            requiredScore: requiredScore,
            isActive: true,
            createdAt: block.timestamp,
            creator: msg.sender,
            learningObjectives: learningObjectives,
            prerequisiteModules: prerequisites,
            rewardAmount: rewardAmount,
            xpReward: xpReward
        });
        
        emit ModuleCreated(moduleCounter, msg.sender, title);
        return moduleCounter;
    }
    
    function createLearningPath(
        string calldata name,
        string calldata description,
        uint256[] calldata moduleIds,
        uint256 completionBonus
    ) external onlyOwner returns (uint256) {
        pathCounter++;
        
        uint256 totalXp = 0;
        for (uint256 i = 0; i < moduleIds.length; i++) {
            totalXp += learningModules[moduleIds[i]].xpReward;
        }
        
        learningPaths[pathCounter] = LearningPath({
            pathId: pathCounter,
            name: name,
            description: description,
            moduleIds: moduleIds,
            totalXpReward: totalXp,
            completionBonus: completionBonus,
            isActive: true,
            creator: msg.sender
        });
        
        return pathCounter;
    }
    
    function createBadge(
        string calldata name,
        string calldata description,
        string calldata imageUri,
        uint256 requirement,
        string calldata requirementType
    ) external onlyOwner returns (uint256) {
        badgeCounter++;
        
        badges[badgeCounter] = Badge({
            badgeId: badgeCounter,
            name: name,
            description: description,
            imageUri: imageUri,
            requirement: requirement,
            requirementType: requirementType,
            isActive: true
        });
        
        return badgeCounter;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    function getLearnerProfile(address learner) external view returns (
        uint256 totalXp,
        uint256 level,
        uint256 completedModules,
        uint256 completedPaths,
        uint256 totalLearningTime,
        uint256 streakDays,
        uint256[] memory badgeIds
    ) {
        LearnerProfile storage profile = learnerProfiles[learner];
        return (
            profile.totalXp,
            profile.level,
            profile.completedModules,
            profile.completedPaths,
            profile.totalLearningTime,
            profile.streakDays,
            profile.badges
        );
    }
    
    function getModuleProgress(uint256 moduleId, address learner) external view returns (
        uint256 currentScore,
        uint256 maxScore,
        uint256 timeSpent,
        bool isCompleted,
        uint256 attempts
    ) {
        LearningProgress storage progress = learningProgress[moduleId][learner];
        return (
            progress.currentScore,
            progress.maxScore,
            progress.timeSpent,
            progress.isCompleted,
            progress.attempts
        );
    }
    
    function getLearningStats() external view returns (
        uint256 totalModules,
        uint256 totalPaths,
        uint256 totalBadges,
        uint256 activeLearners
    ) {
        // This would require additional tracking of active learners
        return (moduleCounter, pathCounter, badgeCounter, 0);
    }
}
