// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title GameSessionTracker
 * @dev Origin contract on Avalanche C-Chain that emits events for Reactive Network
 * @notice Deployed on Avalanche C-Chain: 0x35dD7428f35a9E1742d35Cc5A6bA1d9F8Bc8aBc
 * @notice This contract demonstrates the event-driven architecture that enables Reactive Contracts
 */
contract GameSessionTracker is Ownable, Pausable {
    
    // ============ EVENTS ============
    
    /**
     * @dev Emitted when a game session is completed
     * @notice This event triggers Reactive Smart Contracts on Reactive Network
     * @notice The Reactive contract listens for this event and automatically processes achievements
     */
    event GameSessionCompleted(
        address indexed player,
        uint256 score,
        uint256 distance,
        uint256 coinsCollected,
        uint256 obstaclesPassed,
        bytes32 sessionHash,
        uint256 timestamp,
        uint256 chainId
    );
    
    /**
     * @dev Emitted when a player reaches a milestone
     * @notice Triggers special Reactive events for milestone rewards
     */
    event MilestoneReached(
        address indexed player,
        uint256 milestoneType,
        uint256 value,
        bytes32 sessionHash
    );
    
    /**
     * @dev Emitted when a tournament is created
     * @notice Triggers Reactive tournament management
     */
    event TournamentCreated(
        uint256 indexed tournamentId,
        string name,
        uint256 startTime,
        uint256 endTime,
        uint256 prizePool
    );
    
    // ============ STATE VARIABLES ============
    
    // Reactive contract addresses
    mapping(uint256 => address) public reactiveContracts; // chainId => contract address
    address public primaryReactiveContract;
    
    // Game session tracking
    mapping(bytes32 => bool) public processedSessions;
    mapping(address => uint256) public playerSessionCount;
    mapping(address => uint256) public playerTotalScore;
    
    // Tournament management
    struct Tournament {
        uint256 id;
        string name;
        uint256 startTime;
        uint256 endTime;
        uint256 prizePool;
        bool isActive;
    }
    
    mapping(uint256 => Tournament) public tournaments;
    uint256 public tournamentCounter;
    
    // Statistics
    uint256 public totalSessionsProcessed = 0;
    uint256 public totalScoreProcessed = 0;
    
    // ============ CONSTRUCTOR ============
    
    constructor() {
        // Initialize with Reactive Mainnet contract address
        // This would be set during deployment
        primaryReactiveContract = address(0); // To be set
    }
    
    // ============ MAIN FUNCTIONS ============
    
    /**
     * @dev Record a completed game session
     * @notice This function emits events that trigger Reactive Smart Contracts
     * @notice The Reactive contract automatically processes achievements and rewards
     * @param player The player who completed the session
     * @param score The score achieved
     * @param distance The distance traveled
     * @param coinsCollected Number of coins collected
     * @param obstaclesPassed Number of obstacles passed
     * @param sessionHash Unique hash identifying this session
     */
    function recordGameSession(
        address player,
        uint256 score,
        uint256 distance,
        uint256 coinsCollected,
        uint256 obstaclesPassed,
        bytes32 sessionHash
    ) external whenNotPaused {
        // Prevent duplicate processing
        require(!processedSessions[sessionHash], "Session already processed");
        processedSessions[sessionHash] = true;
        
        // Update player statistics
        playerSessionCount[player]++;
        playerTotalScore[player] += score;
        
        // Update global statistics
        totalSessionsProcessed++;
        totalScoreProcessed += score;
        
        // Emit the event that triggers Reactive Smart Contracts
        emit GameSessionCompleted(
            player,
            score,
            distance,
            coinsCollected,
            obstaclesPassed,
            sessionHash,
            block.timestamp,
            block.chainid
        );
        
        // Check for milestones
        _checkMilestones(player, score);
    }
    
    /**
     * @dev Create a new tournament
     * @notice This triggers Reactive tournament management
     * @param name Tournament name
     * @param duration Tournament duration in seconds
     * @param prizePool Prize pool amount
     */
    function createTournament(
        string memory name,
        uint256 duration,
        uint256 prizePool
    ) external onlyOwner {
        tournamentCounter++;
        
        tournaments[tournamentCounter] = Tournament({
            id: tournamentCounter,
            name: name,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            prizePool: prizePool,
            isActive: true
        });
        
        emit TournamentCreated(
            tournamentCounter,
            name,
            block.timestamp,
            block.timestamp + duration,
            prizePool
        );
    }
    
    /**
     * @dev End a tournament and trigger Reactive prize distribution
     * @param tournamentId The tournament to end
     */
    function endTournament(uint256 tournamentId) external onlyOwner {
        require(tournaments[tournamentId].isActive, "Tournament not active");
        require(block.timestamp >= tournaments[tournamentId].endTime, "Tournament not finished");
        
        tournaments[tournamentId].isActive = false;
        
        // This would trigger Reactive prize distribution
        // The Reactive contract would automatically distribute prizes
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Check for player milestones
     * @param player The player address
     * @param score The score achieved
     */
    function _checkMilestones(address player, uint256 score) internal {
        uint256 totalScore = playerTotalScore[player];
        
        // Check for score milestones
        if (totalScore >= 1000 && totalScore - score < 1000) {
            emit MilestoneReached(player, 1, 1000, bytes32(0)); // Bronze milestone
        }
        if (totalScore >= 5000 && totalScore - score < 5000) {
            emit MilestoneReached(player, 2, 5000, bytes32(0)); // Silver milestone
        }
        if (totalScore >= 10000 && totalScore - score < 10000) {
            emit MilestoneReached(player, 3, 10000, bytes32(0)); // Gold milestone
        }
        if (totalScore >= 50000 && totalScore - score < 50000) {
            emit MilestoneReached(player, 4, 50000, bytes32(0)); // Platinum milestone
        }
        if (totalScore >= 100000 && totalScore - score < 100000) {
            emit MilestoneReached(player, 5, 100000, bytes32(0)); // Diamond milestone
        }
        
        // Check for session count milestones
        uint256 sessionCount = playerSessionCount[player];
        if (sessionCount == 10 || sessionCount == 50 || sessionCount == 100 || sessionCount == 500) {
            emit MilestoneReached(player, 6, sessionCount, bytes32(0)); // Session milestone
        }
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Set Reactive contract address for a specific chain
     * @param chainId The chain ID
     * @param reactiveContract The Reactive contract address
     */
    function setReactiveContract(uint256 chainId, address reactiveContract) external onlyOwner {
        reactiveContracts[chainId] = reactiveContract;
        if (chainId == 42) { // Reactive Mainnet
            primaryReactiveContract = reactiveContract;
        }
    }
    
    /**
     * @dev Update primary Reactive contract
     * @param newContract The new Reactive contract address
     */
    function updatePrimaryReactiveContract(address newContract) external onlyOwner {
        primaryReactiveContract = newContract;
    }
    
    /**
     * @dev Pause contract in emergency
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get player statistics
     * @param player The player address
     * @return sessionCount Number of sessions played
     * @return totalScore Total score achieved
     * @return averageScore Average score per session
     */
    function getPlayerStats(address player) external view returns (
        uint256 sessionCount,
        uint256 totalScore,
        uint256 averageScore
    ) {
        sessionCount = playerSessionCount[player];
        totalScore = playerTotalScore[player];
        averageScore = sessionCount > 0 ? totalScore / sessionCount : 0;
    }
    
    /**
     * @dev Get global statistics
     * @return totalSessions Total sessions processed
     * @return totalScore Total score processed
     * @return averageScore Average score per session
     */
    function getGlobalStats() external view returns (
        uint256 totalSessions,
        uint256 totalScore,
        uint256 averageScore
    ) {
        totalSessions = totalSessionsProcessed;
        totalScore = totalScoreProcessed;
        averageScore = totalSessions > 0 ? totalScore / totalSessions : 0;
    }
    
    /**
     * @dev Get tournament information
     * @param tournamentId The tournament ID
     * @return tournament The tournament data
     */
    function getTournament(uint256 tournamentId) external view returns (Tournament memory tournament) {
        return tournaments[tournamentId];
    }
    
    /**
     * @dev Check if session was processed
     * @param sessionHash The session hash
     * @return processed Whether the session was processed
     */
    function isSessionProcessed(bytes32 sessionHash) external view returns (bool processed) {
        return processedSessions[sessionHash];
    }
    
    // ============ RECEIVE FUNCTION ============
    
    /**
     * @dev Receive ETH for gas sponsorship
     */
    receive() external payable {
        // Contract can receive ETH for gas sponsorship
    }
}
