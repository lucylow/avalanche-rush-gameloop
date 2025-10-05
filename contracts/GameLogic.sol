// contracts/GameLogic.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./RushToken.sol";

contract GameLogic is ReentrancyGuard, Ownable {
    RushToken public rushToken;
    address public mockDEX;
    
    struct Player {
        uint256 highScore;
        uint256 totalGamesPlayed;
        uint256 totalRewardsEarned;
        uint256 level;
        bool isActive;
    }
    
    struct GameSession {
        address player;
        uint256 score;
        uint256 timestamp;
        bool rewardClaimed;
    }
    
    mapping(address => Player) public players;
    mapping(uint256 => GameSession) public gameSessions;
    mapping(address => uint256[]) public playerSessions;
    
    uint256 public sessionCounter;
    uint256 public constant BASE_REWARD = 10 * 10**18; // 10 RUSH tokens
    uint256 public constant HIGH_SCORE_BONUS = 50 * 10**18; // 50 RUSH tokens
    uint256 public constant LEVEL_MULTIPLIER = 2;
    
    event GameCompleted(address indexed player, uint256 sessionId, uint256 score, uint256 reward);
    event HighScoreAchieved(address indexed player, uint256 newHighScore, uint256 bonus);
    event LevelUp(address indexed player, uint256 newLevel);
    
    constructor(address _rushToken, address _mockDEX) Ownable(msg.sender) {
        rushToken = RushToken(_rushToken);
        mockDEX = _mockDEX;
    }
    
    function startGame() external returns (uint256 sessionId) {
        if (!players[msg.sender].isActive) {
            players[msg.sender] = Player({
                highScore: 0,
                totalGamesPlayed: 0,
                totalRewardsEarned: 0,
                level: 1,
                isActive: true
            });
        }
        
        sessionCounter++;
        sessionId = sessionCounter;
        
        gameSessions[sessionId] = GameSession({
            player: msg.sender,
            score: 0,
            timestamp: block.timestamp,
            rewardClaimed: false
        });
        
        playerSessions[msg.sender].push(sessionId);
        return sessionId;
    }
    
    function completeGame(uint256 sessionId, uint256 score) external nonReentrant {
        GameSession storage session = gameSessions[sessionId];
        require(session.player == msg.sender, "Not your game session");
        require(session.score == 0, "Game already completed");
        require(score > 0, "Invalid score");
        
        session.score = score;
        Player storage player = players[msg.sender];
        player.totalGamesPlayed++;
        
        // Calculate rewards
        uint256 baseReward = BASE_REWARD * player.level;
        uint256 scoreBonus = (score / 1000) * 10**18; // 1 token per 1000 points
        uint256 totalReward = baseReward + scoreBonus;
        
        // Check for high score
        bool isHighScore = false;
        if (score > player.highScore) {
            player.highScore = score;
            totalReward += HIGH_SCORE_BONUS;
            isHighScore = true;
            emit HighScoreAchieved(msg.sender, score, HIGH_SCORE_BONUS);
        }
        
        // Check for level up (every 10 games)
        if (player.totalGamesPlayed % 10 == 0) {
            player.level++;
            emit LevelUp(msg.sender, player.level);
        }
        
        player.totalRewardsEarned += totalReward;
        
        // Mint rewards
        rushToken.mint(msg.sender, totalReward);
        
        emit GameCompleted(msg.sender, sessionId, score, totalReward);
    }
    
    function getPlayerStats(address playerAddress) external view returns (
        uint256 highScore,
        uint256 totalGamesPlayed,
        uint256 totalRewardsEarned,
        uint256 level,
        bool isActive
    ) {
        Player memory player = players[playerAddress];
        return (
            player.highScore,
            player.totalGamesPlayed,
            player.totalRewardsEarned,
            player.level,
            player.isActive
        );
    }
    
    function getPlayerSessions(address playerAddress) external view returns (uint256[] memory) {
        return playerSessions[playerAddress];
    }
    
    function getGameSession(uint256 sessionId) external view returns (
        address player,
        uint256 score,
        uint256 timestamp,
        bool rewardClaimed
    ) {
        GameSession memory session = gameSessions[sessionId];
        return (session.player, session.score, session.timestamp, session.rewardClaimed);
    }
    
    function getLeaderboard() external view returns (address[] memory topPlayers, uint256[] memory topScores) {
        // Simple implementation - in production, use a more efficient data structure
        // This is a placeholder for demonstration
        topPlayers = new address[](10);
        topScores = new uint256[](10);
        // Implementation would sort players by high score
        return (topPlayers, topScores);
    }
    
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    receive() external payable {}
}
