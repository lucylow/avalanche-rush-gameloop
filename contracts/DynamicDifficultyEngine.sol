// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/DevFunctionsClient.sol";
import "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DynamicDifficultyEngine - AI-Powered Gaming Difficulty System
 * @dev Uses Chainlink Functions to integrate ML models for real-time difficulty adjustment
 *      Features predictive analytics, retention optimization, and personalized gameplay
 */
contract DynamicDifficultyEngine is DevFunctionsClient, AutomationCompatibleInterface, ReentrancyGuard, Ownable {
    
    using Functions for Functions.Request;
    
    // ============ STRUCTS ============
    
    struct PlayerProfile {
        uint256 skillLevel;
        uint256 playtimeHours;
        uint256 averageScore;
        uint256 retentionRate;
        uint256 gamesPlayed;
        uint256 lastDifficulty;
        uint256[] recentScores;
        uint256 lastUpdate;
    }
    
    struct DifficultyMetrics {
        uint256 totalAdjustments;
        uint256 averageRetentionImprovement;
        uint256 totalPlayersOptimized;
        mapping(address => uint256) playerAdjustments;
    }
    
    struct MLRequest {
        address player;
        uint256 requestId;
        uint256 timestamp;
        bool processed;
        uint256 difficultyResult;
    }
    
    // ============ STATE VARIABLES ============
    
    mapping(address => PlayerProfile) public playerProfiles;
    mapping(uint256 => MLRequest) public mlRequests;
    mapping(address => uint256) public playerDifficulties;
    
    DifficultyMetrics public difficultyMetrics;
    
    uint256 public totalRequests;
    uint256 public totalPlayers;
    uint256 public subscriptionId;
    
    // AI Model Configuration
    string public aiModelSource = "calculateDifficulty";
    bytes32 public aiModelHash;
    
    // Events
    event DifficultyCalculated(address indexed player, uint256 oldDifficulty, uint256 newDifficulty);
    event MLRequestSubmitted(address indexed player, uint256 requestId);
    event MLResponseReceived(uint256 requestId, uint256 difficulty);
    event PlayerProfileUpdated(address indexed player, uint256 skillLevel, uint256 retentionRate);
    event RetentionOptimized(address indexed player, uint256 improvement);
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        address _functionsRouter,
        bytes32 _aiModelHash
    ) DevFunctionsClient(_functionsRouter) {
        aiModelHash = _aiModelHash;
        subscriptionId = 0; // Would be set to actual subscription ID
    }
    
    // ============ CORE AI FUNCTIONS ============
    
    /**
     * @dev Calculate optimal difficulty using AI/ML
     * @param player Player address
     * @return requestId Chainlink Functions request ID
     */
    function calculateOptimalDifficulty(address player) external returns (bytes32 requestId) {
        PlayerProfile storage profile = playerProfiles[player];
        require(profile.gamesPlayed > 0, "No game data available");
        
        // Prepare AI model input
        string[] memory args = new string[](6);
        args[0] = profile.skillLevel.toString();
        args[1] = profile.playtimeHours.toString();
        args[2] = profile.averageScore.toString();
        args[3] = profile.retentionRate.toString();
        args[4] = profile.gamesPlayed.toString();
        args[5] = profile.lastDifficulty.toString();
        
        // Create Chainlink Functions request
        Functions.Request memory request = Functions.Request({
            source: aiModelSource,
            args: args,
            subscriptionId: subscriptionId,
            gasLimit: 300000
        });
        
        // Send request
        requestId = _sendRequest(request, subscriptionId, 300000);
        
        // Store request data
        mlRequests[totalRequests] = MLRequest({
            player: player,
            requestId: uint256(requestId),
            timestamp: block.timestamp,
            processed: false,
            difficultyResult: 0
        });
        
        totalRequests++;
        
        emit MLRequestSubmitted(player, uint256(requestId));
        
        return requestId;
    }
    
    /**
     * @dev Handle AI model response
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        uint256 requestIdUint = uint256(requestId);
        MLRequest storage request = mlRequests[requestIdUint];
        
        require(!request.processed, "Request already processed");
        
        if (err.length > 0) {
            // Handle error
            _handleMLRequestError(requestIdUint, string(err));
            return;
        }
        
        // Parse AI response
        uint256 difficulty = abi.decode(response, (uint256));
        
        // Validate difficulty range
        require(difficulty >= 1 && difficulty <= 100, "Invalid difficulty range");
        
        // Update player difficulty
        address player = request.player;
        uint256 oldDifficulty = playerDifficulties[player];
        playerDifficulties[player] = difficulty;
        
        // Update player profile
        PlayerProfile storage profile = playerProfiles[player];
        profile.lastDifficulty = difficulty;
        profile.lastUpdate = block.timestamp;
        
        // Update metrics
        difficultyMetrics.totalAdjustments++;
        difficultyMetrics.playerAdjustments[player]++;
        
        // Mark request as processed
        request.processed = true;
        request.difficultyResult = difficulty;
        
        emit DifficultyCalculated(player, oldDifficulty, difficulty);
        emit MLResponseReceived(requestIdUint, difficulty);
        
        // Calculate retention improvement
        uint256 retentionImprovement = _calculateRetentionImprovement(player, difficulty);
        if (retentionImprovement > 0) {
            emit RetentionOptimized(player, retentionImprovement);
        }
    }
    
    // ============ PLAYER PROFILE MANAGEMENT ============
    
    /**
     * @dev Update player profile with new game data
     */
    function updatePlayerProfile(
        address player,
        uint256 score,
        uint256 playtimeMinutes,
        bool gameCompleted
    ) external nonReentrant {
        PlayerProfile storage profile = playerProfiles[player];
        
        // Update basic stats
        profile.gamesPlayed++;
        profile.playtimeHours += playtimeMinutes / 60;
        
        // Update recent scores (keep last 10)
        profile.recentScores.push(score);
        if (profile.recentScores.length > 10) {
            // Remove oldest score
            for (uint256 i = 0; i < profile.recentScores.length - 1; i++) {
                profile.recentScores[i] = profile.recentScores[i + 1];
            }
            profile.recentScores.pop();
        }
        
        // Calculate new average score
        uint256 totalScore = 0;
        for (uint256 i = 0; i < profile.recentScores.length; i++) {
            totalScore += profile.recentScores[i];
        }
        profile.averageScore = totalScore / profile.recentScores.length;
        
        // Update skill level based on performance
        _updateSkillLevel(player, score);
        
        // Update retention rate
        profile.retentionRate = _calculateRetentionRate(player, gameCompleted);
        
        // Update total players if new
        if (profile.gamesPlayed == 1) {
            totalPlayers++;
        }
        
        emit PlayerProfileUpdated(player, profile.skillLevel, profile.retentionRate);
    }
    
    /**
     * @dev Batch update multiple player profiles
     */
    function batchUpdateProfiles(
        address[] calldata players,
        uint256[] calldata scores,
        uint256[] calldata playtimes,
        bool[] calldata completions
    ) external nonReentrant {
        require(
            players.length == scores.length &&
            scores.length == playtimes.length &&
            playtimes.length == completions.length,
            "Array length mismatch"
        );
        
        for (uint256 i = 0; i < players.length; i++) {
            updatePlayerProfile(players[i], scores[i], playtimes[i], completions[i]);
        }
    }
    
    // ============ PREDICTIVE ANALYTICS ============
    
    /**
     * @dev Predict player churn probability
     */
    function predictChurnProbability(address player) external view returns (uint256 probability) {
        PlayerProfile storage profile = playerProfiles[player];
        
        // Simple churn prediction model
        uint256 inactivityScore = block.timestamp - profile.lastUpdate;
        uint256 performanceScore = profile.averageScore;
        uint256 engagementScore = profile.retentionRate;
        
        // Calculate churn probability (0-100)
        probability = (inactivityScore / 86400) * 10; // Days since last activity
        
        if (performanceScore < 50) probability += 20;
        if (engagementScore < 30) probability += 30;
        
        // Cap at 100
        if (probability > 100) probability = 100;
    }
    
    /**
     * @dev Get optimal engagement strategy for player
     */
    function getEngagementStrategy(address player) external view returns (string memory strategy) {
        PlayerProfile storage profile = playerProfiles[player];
        
        if (profile.skillLevel < 3) {
            return "Beginner-friendly content with tutorials";
        } else if (profile.skillLevel < 7) {
            return "Progressive challenges with rewards";
        } else {
            return "High-difficulty content with leaderboards";
        }
    }
    
    // ============ AUTOMATION FUNCTIONS ============
    
    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory) {
        // Check if any players need difficulty adjustment
        upkeepNeeded = _needsDifficultyAdjustment();
    }
    
    function performUpkeep(bytes calldata) external override {
        // Automatically adjust difficulty for players
        _performAutomaticAdjustments();
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    function _updateSkillLevel(address player, uint256 score) internal {
        PlayerProfile storage profile = playerProfiles[player];
        
        // Skill level adjustment based on performance
        if (score > profile.averageScore * 1.2) {
            // Exceptional performance
            if (profile.skillLevel < 10) {
                profile.skillLevel++;
            }
        } else if (score < profile.averageScore * 0.8) {
            // Poor performance
            if (profile.skillLevel > 1) {
                profile.skillLevel--;
            }
        }
    }
    
    function _calculateRetentionRate(address player, bool gameCompleted) internal view returns (uint256) {
        PlayerProfile storage profile = playerProfiles[player];
        
        if (profile.gamesPlayed < 2) return 50; // Default for new players
        
        // Calculate retention based on completion rate and frequency
        uint256 completionRate = gameCompleted ? 100 : 0;
        uint256 frequencyScore = _calculateFrequencyScore(player);
        
        return (completionRate + frequencyScore) / 2;
    }
    
    function _calculateFrequencyScore(address player) internal view returns (uint256) {
        PlayerProfile storage profile = playerProfiles[player];
        
        if (profile.gamesPlayed < 2) return 50;
        
        uint256 timeSinceLastGame = block.timestamp - profile.lastUpdate;
        uint256 averageTimeBetweenGames = profile.playtimeHours * 3600 / profile.gamesPlayed;
        
        if (timeSinceLastGame < averageTimeBetweenGames) {
            return 80; // Playing frequently
        } else if (timeSinceLastGame < averageTimeBetweenGames * 2) {
            return 60; // Playing moderately
        } else {
            return 30; // Playing infrequently
        }
    }
    
    function _calculateRetentionImprovement(address player, uint256 newDifficulty) internal view returns (uint256) {
        PlayerProfile storage profile = playerProfiles[player];
        
        // Calculate expected retention improvement
        uint256 difficultyMatch = 100 - abs(int256(newDifficulty) - int256(profile.skillLevel * 10));
        uint256 expectedImprovement = difficultyMatch / 10;
        
        return expectedImprovement;
    }
    
    function _needsDifficultyAdjustment() internal view returns (bool) {
        // Check if any players need automatic difficulty adjustment
        // This would contain logic to identify players needing adjustment
        return false; // Simplified for demo
    }
    
    function _performAutomaticAdjustments() internal {
        // Perform automatic difficulty adjustments
        // This would contain logic to automatically adjust difficulties
    }
    
    function _handleMLRequestError(uint256 requestId, string memory error) internal {
        // Handle ML request errors
        MLRequest storage request = mlRequests[requestId];
        request.processed = true;
        
        // Log error for debugging
        // In production, this would integrate with monitoring systems
    }
    
    function abs(int256 x) internal pure returns (uint256) {
        return uint256(x >= 0 ? x : -x);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    function getPlayerProfile(address player) external view returns (
        uint256 skillLevel,
        uint256 playtimeHours,
        uint256 averageScore,
        uint256 retentionRate,
        uint256 gamesPlayed,
        uint256 lastDifficulty
    ) {
        PlayerProfile storage profile = playerProfiles[player];
        return (
            profile.skillLevel,
            profile.playtimeHours,
            profile.averageScore,
            profile.retentionRate,
            profile.gamesPlayed,
            profile.lastDifficulty
        );
    }
    
    function getDifficultyMetrics() external view returns (
        uint256 totalAdjustments,
        uint256 averageRetentionImprovement,
        uint256 totalPlayersOptimized
    ) {
        return (
            difficultyMetrics.totalAdjustments,
            difficultyMetrics.averageRetentionImprovement,
            difficultyMetrics.totalPlayersOptimized
        );
    }
    
    function getMLRequest(uint256 requestId) external view returns (
        address player,
        uint256 timestamp,
        bool processed,
        uint256 difficultyResult
    ) {
        MLRequest storage request = mlRequests[requestId];
        return (
            request.player,
            request.timestamp,
            request.processed,
            request.difficultyResult
        );
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    function setAIModelSource(string calldata newSource) external onlyOwner {
        aiModelSource = newSource;
    }
    
    function setSubscriptionId(uint256 newSubscriptionId) external onlyOwner {
        subscriptionId = newSubscriptionId;
    }
    
    function emergencyPause() external onlyOwner {
        // Pause all AI requests
    }
    
    function emergencyUnpause() external onlyOwner {
        // Resume all AI requests
    }
}