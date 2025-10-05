// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title EnhancedReactiveEngine
 * @dev Comprehensive Reactive integration for Avalanche Rush game
 * @notice Maximizes Reactive network usage with optimized gas consumption
 */
contract EnhancedReactiveEngine is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _eventCounter;
    Counters.Counter private _sessionCounter;
    
    // Event Types
    enum EventType {
        PLAYER_JUMP,
        PLAYER_SLIDE,
        COIN_COLLECTED,
        OBSTACLE_HIT,
        POWERUP_COLLECTED,
        LEVEL_COMPLETED,
        GAME_STARTED,
        GAME_ENDED,
        MODULE_STARTED,
        MODULE_COMPLETED,
        QUIZ_ANSWERED,
        CERTIFICATION_EARNED,
        LIQUIDITY_PROVIDED,
        YIELD_FARMED,
        SWAP_EXECUTED,
        STAKE_CREATED,
        SUBNET_CREATED,
        CROSS_SUBNET_MESSAGE,
        VALIDATOR_JOINED,
        PROPOSAL_CREATED,
        VOTE_CAST,
        TREASURY_ALLOCATED,
        ACHIEVEMENT_UNLOCKED,
        LEADERBOARD_UPDATED,
        GUILD_JOINED,
        FRIEND_INVITED
    }
    
    // Event Data Structure
    struct EventData {
        EventType eventType;
        address playerAddress;
        uint256 timestamp;
        string sessionId;
        string data;
        uint256 gasUsed;
        bool processed;
    }
    
    // Player Statistics
    struct PlayerStats {
        uint256 totalEvents;
        uint256 totalScore;
        uint256 modulesCompleted;
        uint256 certificationsEarned;
        uint256 lastActivity;
        mapping(EventType => uint256) eventCounts;
    }
    
    // Session Data
    struct GameSession {
        uint256 sessionId;
        address player;
        uint256 startTime;
        uint256 endTime;
        uint256 totalScore;
        uint256 totalCoins;
        uint256 totalObstacles;
        uint256 totalPowerups;
        bool isActive;
    }
    
    // Storage
    mapping(uint256 => EventData) public events;
    mapping(address => PlayerStats) public playerStats;
    mapping(string => GameSession) public gameSessions;
    mapping(address => string[]) public playerSessions;
    
    // Analytics
    uint256 public totalReactiveGasUsed = 0;
    uint256 public totalEventsProcessed = 0;
    uint256 public totalSessionsCreated = 0;
    
    // Events
    event ReactiveEventProcessed(
        uint256 indexed eventId,
        EventType eventType,
        address indexed player,
        uint256 gasUsed
    );
    
    event BatchEventsProcessed(
        uint256[] eventIds,
        uint256 totalGasUsed,
        uint256 eventsCount
    );
    
    event GameSessionCreated(
        string indexed sessionId,
        address indexed player,
        uint256 timestamp
    );
    
    event GameSessionCompleted(
        string indexed sessionId,
        address indexed player,
        uint256 finalScore,
        uint256 totalCoins
    );
    
    event PlayerStatsUpdated(
        address indexed player,
        uint256 totalEvents,
        uint256 totalScore,
        uint256 modulesCompleted
    );
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Process a single Reactive event
     * @param eventType The type of event
     * @param playerAddress The player's address
     * @param timestamp When the event occurred
     * @param sessionId The game session ID
     * @param data JSON string containing event data
     */
    function processEvent(
        EventType eventType,
        address playerAddress,
        uint256 timestamp,
        string memory sessionId,
        string memory data
    ) external nonReentrant {
        uint256 initialGas = gasleft();
        
        _eventCounter.increment();
        uint256 eventId = _eventCounter.current();
        
        events[eventId] = EventData({
            eventType: eventType,
            playerAddress: playerAddress,
            timestamp: timestamp,
            sessionId: sessionId,
            data: data,
            gasUsed: 0,
            processed: true
        });
        
        // Update player statistics
        _updatePlayerStats(playerAddress, eventType, data);
        
        uint256 gasUsed = initialGas - gasleft();
        events[eventId].gasUsed = gasUsed;
        totalReactiveGasUsed += gasUsed;
        totalEventsProcessed++;
        
        emit ReactiveEventProcessed(eventId, eventType, playerAddress, gasUsed);
    }
    
    /**
     * @dev Process multiple events in a single transaction (gas optimization)
     * @param eventTypes Array of event types
     * @param playerAddresses Array of player addresses
     * @param timestamps Array of timestamps
     * @param sessionIds Array of session IDs
     * @param dataArray Array of JSON data strings
     */
    function batchProcessEvents(
        EventType[] memory eventTypes,
        address[] memory playerAddresses,
        uint256[] memory timestamps,
        string[] memory sessionIds,
        string[] memory dataArray
    ) external nonReentrant {
        require(
            eventTypes.length == playerAddresses.length &&
            eventTypes.length == timestamps.length &&
            eventTypes.length == sessionIds.length &&
            eventTypes.length == dataArray.length,
            "Array length mismatch"
        );
        
        uint256 initialGas = gasleft();
        uint256[] memory eventIds = new uint256[](eventTypes.length);
        
        for (uint256 i = 0; i < eventTypes.length; i++) {
            _eventCounter.increment();
            uint256 eventId = _eventCounter.current();
            eventIds[i] = eventId;
            
            events[eventId] = EventData({
                eventType: eventTypes[i],
                playerAddress: playerAddresses[i],
                timestamp: timestamps[i],
                sessionId: sessionIds[i],
                data: dataArray[i],
                gasUsed: 0,
                processed: true
            });
            
            // Update player statistics
            _updatePlayerStats(playerAddresses[i], eventTypes[i], dataArray[i]);
        }
        
        uint256 gasUsed = initialGas - gasleft();
        totalReactiveGasUsed += gasUsed;
        totalEventsProcessed += eventTypes.length;
        
        emit BatchEventsProcessed(eventIds, gasUsed, eventTypes.length);
    }
    
    /**
     * @dev Create a new game session
     * @param sessionId Unique session identifier
     * @param player The player's address
     */
    function createGameSession(
        string memory sessionId,
        address player
    ) external nonReentrant {
        require(bytes(gameSessions[sessionId].sessionId).length == 0, "Session already exists");
        
        _sessionCounter.increment();
        
        gameSessions[sessionId] = GameSession({
            sessionId: _sessionCounter.current(),
            player: player,
            startTime: block.timestamp,
            endTime: 0,
            totalScore: 0,
            totalCoins: 0,
            totalObstacles: 0,
            totalPowerups: 0,
            isActive: true
        });
        
        playerSessions[player].push(sessionId);
        totalSessionsCreated++;
        
        emit GameSessionCreated(sessionId, player, block.timestamp);
    }
    
    /**
     * @dev Complete a game session
     * @param sessionId The session ID
     * @param finalScore The final game score
     * @param totalCoins Total coins collected
     * @param totalObstacles Total obstacles hit
     * @param totalPowerups Total powerups collected
     */
    function completeGameSession(
        string memory sessionId,
        uint256 finalScore,
        uint256 totalCoins,
        uint256 totalObstacles,
        uint256 totalPowerups
    ) external nonReentrant {
        GameSession storage session = gameSessions[sessionId];
        require(session.isActive, "Session not active");
        require(session.player == msg.sender, "Not your session");
        
        session.endTime = block.timestamp;
        session.totalScore = finalScore;
        session.totalCoins = totalCoins;
        session.totalObstacles = totalObstacles;
        session.totalPowerups = totalPowerups;
        session.isActive = false;
        
        // Update player statistics
        PlayerStats storage stats = playerStats[msg.sender];
        stats.totalScore += finalScore;
        stats.lastActivity = block.timestamp;
        
        emit GameSessionCompleted(sessionId, msg.sender, finalScore, totalCoins);
    }
    
    /**
     * @dev Update player statistics based on event
     */
    function _updatePlayerStats(
        address player,
        EventType eventType,
        string memory data
    ) internal {
        PlayerStats storage stats = playerStats[player];
        stats.totalEvents++;
        stats.eventCounts[eventType]++;
        stats.lastActivity = block.timestamp;
        
        // Parse data for specific event types
        if (eventType == EventType.MODULE_COMPLETED) {
            stats.modulesCompleted++;
        } else if (eventType == EventType.CERTIFICATION_EARNED) {
            stats.certificationsEarned++;
        }
        
        emit PlayerStatsUpdated(
            player,
            stats.totalEvents,
            stats.totalScore,
            stats.modulesCompleted
        );
    }
    
    /**
     * @dev Get player statistics
     * @param player The player's address
     * @return totalEvents Total events triggered
     * @return totalScore Total score accumulated
     * @return modulesCompleted Modules completed
     * @return certificationsEarned Certifications earned
     * @return lastActivity Last activity timestamp
     */
    function getPlayerStats(address player) external view returns (
        uint256 totalEvents,
        uint256 totalScore,
        uint256 modulesCompleted,
        uint256 certificationsEarned,
        uint256 lastActivity
    ) {
        PlayerStats storage stats = playerStats[player];
        return (
            stats.totalEvents,
            stats.totalScore,
            stats.modulesCompleted,
            stats.certificationsEarned,
            stats.lastActivity
        );
    }
    
    /**
     * @dev Get event count for specific event type
     * @param player The player's address
     * @param eventType The event type
     * @return count Number of events of this type
     */
    function getEventCount(address player, EventType eventType) external view returns (uint256 count) {
        return playerStats[player].eventCounts[eventType];
    }
    
    /**
     * @dev Get session data
     * @param sessionId The session ID
     * @return session The session data
     */
    function getSession(string memory sessionId) external view returns (GameSession memory session) {
        return gameSessions[sessionId];
    }
    
    /**
     * @dev Get player sessions
     * @param player The player's address
     * @return sessions Array of session IDs
     */
    function getPlayerSessions(address player) external view returns (string[] memory sessions) {
        return playerSessions[player];
    }
    
    /**
     * @dev Get analytics data
     * @return totalGasUsed Total gas used across all events
     * @return totalEvents Total events processed
     * @return totalSessions Total sessions created
     * @return averageGasPerEvent Average gas per event
     */
    function getAnalytics() external view returns (
        uint256 totalGasUsed,
        uint256 totalEvents,
        uint256 totalSessions,
        uint256 averageGasPerEvent
    ) {
        averageGasPerEvent = totalEvents > 0 ? totalReactiveGasUsed / totalEventsProcessed : 0;
        
        return (
            totalReactiveGasUsed,
            totalEventsProcessed,
            totalSessionsCreated,
            averageGasPerEvent
        );
    }
    
    /**
     * @dev Get events by type (for analytics)
     * @param eventType The event type to filter by
     * @param limit Maximum number of events to return
     * @return eventIds Array of event IDs
     * @return players Array of player addresses
     * @return timestamps Array of timestamps
     */
    function getEventsByType(
        EventType eventType,
        uint256 limit
    ) external view returns (
        uint256[] memory eventIds,
        address[] memory players,
        uint256[] memory timestamps
    ) {
        uint256 count = 0;
        uint256[] memory tempEventIds = new uint256[](limit);
        address[] memory tempPlayers = new address[](limit);
        uint256[] memory tempTimestamps = new uint256[](limit);
        
        for (uint256 i = 1; i <= _eventCounter.current() && count < limit; i++) {
            if (events[i].eventType == eventType) {
                tempEventIds[count] = i;
                tempPlayers[count] = events[i].playerAddress;
                tempTimestamps[count] = events[i].timestamp;
                count++;
            }
        }
        
        // Resize arrays to actual count
        eventIds = new uint256[](count);
        players = new address[](count);
        timestamps = new uint256[](count);
        
        for (uint256 i = 0; i < count; i++) {
            eventIds[i] = tempEventIds[i];
            players[i] = tempPlayers[i];
            timestamps[i] = tempTimestamps[i];
        }
        
        return (eventIds, players, timestamps);
    }
}
