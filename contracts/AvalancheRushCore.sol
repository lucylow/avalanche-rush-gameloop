// contracts/AvalancheRushCore.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./RushToken.sol";

contract AvalancheRushCore is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    
    RushToken public rushToken;
    Counters.Counter private _sessionIdCounter;
    
    // Enhanced Game Session Structure
    struct GameSession {
        uint256 sessionId;
        address player;
        uint256 startTime;
        uint256 endTime;
        uint256 finalScore;
        uint256 level;
        uint256 difficulty;
        GameMode mode;
        bool isCompleted;
        bool rewardsClaimed;
        mapping(string => uint256) achievements;
        string sessionHash;
    }
    
    // Player Profile with Advanced Metrics
    struct PlayerProfile {
        address playerAddress;
        string username;
        uint256 totalScore;
        uint256 highestScore;
        uint256 currentLevel;
        uint256 experience;
        uint256 totalGamesPlayed;
        uint256 totalPlayTime;
        uint256 averageScore;
        uint256 streakDays;
        uint256 lastLoginTimestamp;
        uint256 totalRewardsEarned;
        bool isActive;
        mapping(GameMode => uint256) modeHighScores;
        mapping(uint256 => bool) levelUnlocked;
        mapping(string => uint256) skillPoints;
    }
    
    // Game Modes
    enum GameMode { 
        CLASSIC,           // Standard endless runner
        TUTORIAL,          // Learning mode with guided instructions
        CHALLENGE,         // Time-limited challenges
        MULTIPLAYER,       // Competitive mode
        QUEST,            // Story-driven missions
        SPEED_RUN,        // Time-based completion
        SURVIVAL          // Endurance mode
    }
    
    // Achievement Types
    enum AchievementType {
        SCORE_MILESTONE,
        LEVEL_COMPLETION,
        STREAK_ACHIEVEMENT,
        SKILL_MASTERY,
        SPEED_ACHIEVEMENT,
        COLLECTION_COMPLETE,
        SOCIAL_ACHIEVEMENT
    }
    
    // Level Configuration
    struct Level {
        uint256 levelId;
        string name;
        uint256 requiredScore;
        uint256 difficulty;
        uint256 baseReward;
        bool isUnlocked;
        string metadata;
        mapping(string => uint256) objectives;
    }
    
    // Leaderboard Entry
    struct LeaderboardEntry {
        address player;
        uint256 score;
        uint256 timestamp;
        GameMode mode;
        uint256 level;
    }
    
    // State Variables
    mapping(address => PlayerProfile) public players;
    mapping(uint256 => GameSession) public gameSessions;
    mapping(address => uint256[]) public playerSessions;
    mapping(uint256 => Level) public levels;
    mapping(GameMode => LeaderboardEntry[]) public leaderboards;
    mapping(address => mapping(string => bool)) public playerAchievements;
    
    uint256 public totalPlayers;
    uint256 public totalGamesPlayed;
    uint256 public totalRewardsDistributed;
    uint256 public constant MAX_LEADERBOARD_SIZE = 100;
    uint256 public constant EXPERIENCE_PER_LEVEL = 1000;
    uint256 public constant BASE_REWARD_MULTIPLIER = 10;
    
    // Events
    event GameStarted(address indexed player, uint256 sessionId, GameMode mode, uint256 timestamp);
    event LevelCompleted(address indexed player, uint256 level, uint256 score);
    event HighScoreBeat(address indexed player, uint256 newScore, uint256 previousScore);
    event GameCompleted(address indexed player, uint256 sessionId, uint256 finalScore, uint256 reward);
    event AchievementUnlocked(address indexed player, string achievement, AchievementType aType);
    event LevelUnlocked(address indexed player, uint256 levelId);
    event StreakAchieved(address indexed player, uint256 streakDays);
    event LeaderboardUpdated(address indexed player, GameMode mode, uint256 position, uint256 score);
    event SkillPointsEarned(address indexed player, string skill, uint256 points);
    
    constructor(address _rushToken) Ownable(msg.sender) {
        rushToken = RushToken(_rushToken);
        _initializeLevels();
    }
    
    modifier validPlayer(address player) {
        require(player != address(0), "Invalid player address");
        _;
    }
    
    modifier sessionExists(uint256 sessionId) {
        require(gameSessions[sessionId].sessionId != 0, "Session does not exist");
        _;
    }
    
    modifier sessionOwner(uint256 sessionId) {
        require(gameSessions[sessionId].player == msg.sender, "Not session owner");
        _;
    }
    
    /// @notice Start a new game session with specified mode and difficulty
    function startGame(
        GameMode mode,
        uint256 difficulty,
        uint256 levelId
    ) external nonReentrant returns (uint256 sessionId) {
        require(difficulty >= 1 && difficulty <= 10, "Invalid difficulty");
        
        // Initialize player if first time
        if (!players[msg.sender].isActive) {
            _initializePlayer(msg.sender);
        }
        
        // Check level unlock requirements
        require(_isLevelUnlocked(msg.sender, levelId), "Level not unlocked");
        
        // Update daily login streak
        _updateLoginStreak(msg.sender);
        
        _sessionIdCounter.increment();
        sessionId = _sessionIdCounter.current();
        
        GameSession storage session = gameSessions[sessionId];
        session.sessionId = sessionId;
        session.player = msg.sender;
        session.startTime = block.timestamp;
        session.level = levelId;
        session.difficulty = difficulty;
        session.mode = mode;
        session.isCompleted = false;
        session.rewardsClaimed = false;
        session.sessionHash = _generateSessionHash(sessionId, msg.sender, block.timestamp);
        
        playerSessions[msg.sender].push(sessionId);
        players[msg.sender].totalGamesPlayed++;
        totalGamesPlayed++;
        
        emit GameStarted(msg.sender, sessionId, mode, block.timestamp);
        
        return sessionId;
    }
    
    /// @notice Complete a game session with final score and achievements
    function completeGame(
        uint256 sessionId,
        uint256 finalScore,
        string[] calldata achievementsUnlocked,
        uint256[] calldata skillPointsEarned,
        string[] calldata skillNames
    ) external nonReentrant sessionExists(sessionId) sessionOwner(sessionId) {
        GameSession storage session = gameSessions[sessionId];
        require(!session.isCompleted, "Session already completed");
        require(finalScore > 0, "Invalid final score");
        
        session.endTime = block.timestamp;
        session.finalScore = finalScore;
        session.isCompleted = true;
        
        PlayerProfile storage player = players[msg.sender];
        
        // Update player statistics
        player.totalScore += finalScore;
        player.totalPlayTime += (session.endTime - session.startTime);
        player.averageScore = player.totalScore / player.totalGamesPlayed;
        
        // Check for high score
        bool isNewHighScore = false;
        if (finalScore > player.highestScore) {
            uint256 previousScore = player.highestScore;
            player.highestScore = finalScore;
            player.modeHighScores[session.mode] = finalScore;
            isNewHighScore = true;
            emit HighScoreBeat(msg.sender, finalScore, previousScore);
        }
        
        // Process achievements
        for (uint256 i = 0; i < achievementsUnlocked.length; i++) {
            if (!playerAchievements[msg.sender][achievementsUnlocked[i]]) {
                playerAchievements[msg.sender][achievementsUnlocked[i]] = true;
                session.achievements[achievementsUnlocked[i]] = 1;
                emit AchievementUnlocked(msg.sender, achievementsUnlocked[i], AchievementType.SCORE_MILESTONE);
            }
        }
        
        // Process skill points
        require(skillPointsEarned.length == skillNames.length, "Skill arrays length mismatch");
        for (uint256 i = 0; i < skillNames.length; i++) {
            player.skillPoints[skillNames[i]] += skillPointsEarned[i];
            emit SkillPointsEarned(msg.sender, skillNames[i], skillPointsEarned[i]);
        }
        
        // Calculate experience and check for level up
        uint256 experienceGained = _calculateExperience(finalScore, session.difficulty, session.mode);
        player.experience += experienceGained;
        
        uint256 newLevel = (player.experience / EXPERIENCE_PER_LEVEL) + 1;
        if (newLevel > player.currentLevel) {
            player.currentLevel = newLevel;
            _unlockNewLevels(msg.sender, newLevel);
        }
        
        // Calculate and distribute rewards
        uint256 totalReward = _calculateRewards(msg.sender, sessionId, finalScore, isNewHighScore);
        player.totalRewardsEarned += totalReward;
        totalRewardsDistributed += totalReward;
        
        // Update leaderboard
        _updateLeaderboard(msg.sender, session.mode, finalScore);
        
        // Mint RUSH tokens
        if (totalReward > 0) {
            rushToken.mint(msg.sender, totalReward);
        }
        
        emit GameCompleted(msg.sender, sessionId, finalScore, totalReward);
        emit LevelCompleted(msg.sender, session.level, finalScore);
    }
    
    /// @notice Update daily login streak
    function _updateLoginStreak(address player) internal {
        PlayerProfile storage profile = players[player];
        uint256 timeSinceLastLogin = block.timestamp - profile.lastLoginTimestamp;
        
        if (timeSinceLastLogin >= 1 days) {
            if (timeSinceLastLogin <= 2 days) {
                // Maintain streak
                profile.streakDays++;
            } else {
                // Reset streak
                profile.streakDays = 1;
            }
            profile.lastLoginTimestamp = block.timestamp;
            
            // Emit streak achievement for milestones
            if (profile.streakDays % 7 == 0) { // Weekly milestones
                emit StreakAchieved(player, profile.streakDays);
            }
        }
    }
    
    /// @notice Calculate experience based on performance
    function _calculateExperience(
        uint256 score,
        uint256 difficulty,
        GameMode mode
    ) internal pure returns (uint256) {
        uint256 baseExp = score / 100; // 1 exp per 100 points
        uint256 difficultyBonus = baseExp * difficulty / 10; // Difficulty multiplier
        uint256 modeBonus = _getModeExperienceBonus(mode, baseExp);
        
        return baseExp + difficultyBonus + modeBonus;
    }
    
    /// @notice Get experience bonus based on game mode
    function _getModeExperienceBonus(GameMode mode, uint256 baseExp) internal pure returns (uint256) {
        if (mode == GameMode.TUTORIAL) return baseExp / 2; // 50% bonus for learning
        if (mode == GameMode.CHALLENGE) return baseExp; // 100% bonus for challenges
        if (mode == GameMode.MULTIPLAYER) return baseExp * 3 / 2; // 150% bonus for competitive
        if (mode == GameMode.QUEST) return baseExp * 2; // 200% bonus for story mode
        if (mode == GameMode.SPEED_RUN) return baseExp * 3 / 2; // 150% bonus for speed
        if (mode == GameMode.SURVIVAL) return baseExp * 2; // 200% bonus for endurance
        return 0; // Classic mode has no bonus
    }
    
    /// @notice Calculate total rewards for a completed game
    function _calculateRewards(
        address player,
        uint256 sessionId,
        uint256 finalScore,
        bool isNewHighScore
    ) internal view returns (uint256) {
        GameSession storage session = gameSessions[sessionId];
        PlayerProfile storage profile = players[player];
        
        uint256 baseReward = finalScore * BASE_REWARD_MULTIPLIER;
        uint256 difficultyBonus = baseReward * session.difficulty / 10;
        uint256 levelBonus = baseReward * profile.currentLevel / 100;
        uint256 streakBonus = baseReward * profile.streakDays / 50;
        uint256 highScoreBonus = isNewHighScore ? baseReward / 2 : 0;
        
        return baseReward + difficultyBonus + levelBonus + streakBonus + highScoreBonus;
    }
    
    /// @notice Update leaderboard with new score
    function _updateLeaderboard(address player, GameMode mode, uint256 score) internal {
        LeaderboardEntry[] storage leaderboard = leaderboards[mode];
        
        // Find insertion point
        uint256 insertIndex = leaderboard.length;
        for (uint256 i = 0; i < leaderboard.length; i++) {
            if (score > leaderboard[i].score) {
                insertIndex = i;
                break;
            }
        }
        
        // Insert new entry
        if (insertIndex < MAX_LEADERBOARD_SIZE) {
            if (leaderboard.length < MAX_LEADERBOARD_SIZE) {
                leaderboard.push();
            }
            
            // Shift entries down
            for (uint256 i = leaderboard.length - 1; i > insertIndex; i--) {
                leaderboard[i] = leaderboard[i - 1];
            }
            
            // Insert new entry
            leaderboard[insertIndex] = LeaderboardEntry({
                player: player,
                score: score,
                timestamp: block.timestamp,
                mode: mode,
                level: players[player].currentLevel
            });
            
            emit LeaderboardUpdated(player, mode, insertIndex + 1, score);
        }
    }
    
    /// @notice Initialize a new player profile
    function _initializePlayer(address player) internal {
        PlayerProfile storage profile = players[player];
        profile.playerAddress = player;
        profile.isActive = true;
        profile.currentLevel = 1;
        profile.lastLoginTimestamp = block.timestamp;
        profile.streakDays = 1;
        
        // Unlock first level
        profile.levelUnlocked[1] = true;
        
        totalPlayers++;
    }
    
    /// @notice Check if a level is unlocked for a player
    function _isLevelUnlocked(address player, uint256 levelId) internal view returns (bool) {
        return players[player].levelUnlocked[levelId] || levelId == 1;
    }
    
    /// @notice Unlock new levels based on player level
    function _unlockNewLevels(address player, uint256 newLevel) internal {
        PlayerProfile storage profile = players[player];
        
        // Unlock levels up to current player level
        for (uint256 i = profile.currentLevel + 1; i <= newLevel && i <= 50; i++) {
            if (!profile.levelUnlocked[i]) {
                profile.levelUnlocked[i] = true;
                emit LevelUnlocked(player, i);
            }
        }
    }
    
    /// @notice Initialize game levels
    function _initializeLevels() internal {
        for (uint256 i = 1; i <= 50; i++) {
            Level storage level = levels[i];
            level.levelId = i;
            level.name = string(abi.encodePacked("Level ", _toString(i)));
            level.requiredScore = i * 1000; // Increasing score requirements
            level.difficulty = (i - 1) / 5 + 1; // Difficulty increases every 5 levels
            level.baseReward = i * 100 * 10**18; // Increasing rewards
            level.isUnlocked = i == 1; // Only first level unlocked by default
        }
    }
    
    /// @notice Generate unique session hash
    function _generateSessionHash(
        uint256 sessionId,
        address player,
        uint256 timestamp
    ) internal pure returns (string memory) {
        return string(abi.encodePacked(
            "session_",
            _toString(sessionId),
            "_",
            _toHexString(uint256(uint160(player))),
            "_",
            _toString(timestamp)
        ));
    }
    
    // View Functions
    
    /// @notice Get player profile information
    function getPlayerProfile(address player) external view returns (
        uint256 totalScore,
        uint256 highestScore,
        uint256 currentLevel,
        uint256 experience,
        uint256 totalGamesPlayed,
        uint256 streakDays,
        uint256 totalRewardsEarned,
        bool isActive
    ) {
        PlayerProfile storage profile = players[player];
        return (
            profile.totalScore,
            profile.highestScore,
            profile.currentLevel,
            profile.experience,
            profile.totalGamesPlayed,
            profile.streakDays,
            profile.totalRewardsEarned,
            profile.isActive
        );
    }
    
    /// @notice Get game session details
    function getGameSession(uint256 sessionId) external view returns (
        address player,
        uint256 startTime,
        uint256 endTime,
        uint256 finalScore,
        uint256 level,
        GameMode mode,
        bool isCompleted
    ) {
        GameSession storage session = gameSessions[sessionId];
        return (
            session.player,
            session.startTime,
            session.endTime,
            session.finalScore,
            session.level,
            session.mode,
            session.isCompleted
        );
    }
    
    /// @notice Get leaderboard for specific mode
    function getLeaderboard(GameMode mode, uint256 limit) external view returns (
        address[] memory players,
        uint256[] memory scores,
        uint256[] memory timestamps
    ) {
        LeaderboardEntry[] storage leaderboard = leaderboards[mode];
        uint256 length = leaderboard.length > limit ? limit : leaderboard.length;
        
        players = new address[](length);
        scores = new uint256[](length);
        timestamps = new uint256[](length);
        
        for (uint256 i = 0; i < length; i++) {
            players[i] = leaderboard[i].player;
            scores[i] = leaderboard[i].score;
            timestamps[i] = leaderboard[i].timestamp;
        }
    }
    
    /// @notice Get player's skill points
    function getSkillPoints(address player, string calldata skill) external view returns (uint256) {
        return players[player].skillPoints[skill];
    }
    
    /// @notice Check if player has specific achievement
    function hasAchievement(address player, string calldata achievement) external view returns (bool) {
        return playerAchievements[player][achievement];
    }
    
    /// @notice Get level information
    function getLevel(uint256 levelId) external view returns (
        string memory name,
        uint256 requiredScore,
        uint256 difficulty,
        uint256 baseReward,
        bool isUnlocked
    ) {
        Level storage level = levels[levelId];
        return (
            level.name,
            level.requiredScore,
            level.difficulty,
            level.baseReward,
            level.isUnlocked
        );
    }
    
    // Utility functions
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
    
    function _toHexString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0x00";
        uint256 temp = value;
        uint256 length = 0;
        while (temp != 0) {
            length++;
            temp >>= 8;
        }
        return _toHexString(value, length);
    }
    
    function _toHexString(uint256 value, uint256 length) internal pure returns (string memory) {
        bytes memory buffer = new bytes(2 * length + 2);
        buffer[0] = "0";
        buffer[1] = "x";
        for (uint256 i = 2 * length + 1; i > 1; --i) {
            buffer[i] = _HEX_SYMBOLS[value & 0xf];
            value >>= 4;
        }
        require(value == 0, "Strings: hex length insufficient");
        return string(buffer);
    }
    
    bytes16 private constant _HEX_SYMBOLS = "0123456789abcdef";
}
