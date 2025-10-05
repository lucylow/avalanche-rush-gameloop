// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBase.sol";
import "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title AvalancheRushVRF
 * @dev Chainlink VRF integration for Avalanche Rush game randomness
 * @notice Provides verifiable randomness for game events, NFT rewards, and challenges
 */
contract AvalancheRushVRF is VRFConsumerBase, Ownable, ReentrancyGuard {
    // Chainlink VRF configuration
    bytes32 internal immutable vrfKeyHash;
    uint256 internal immutable vrfFee;
    
    // Game events that require randomness
    enum RandomEventType {
        DAILY_CHALLENGE,      // Random daily challenge generation
        NFT_REWARD_RARITY,    // Random NFT rarity determination
        POWER_UP_SPAWN,       // Random power-up spawns
        OBSTACLE_PATTERN,     // Random obstacle patterns
        TOURNAMENT_MATCH,     // Tournament matchmaking
        QUEST_REWARD,         // Quest completion rewards
        SPECIAL_EVENT,        // Special game events
        BONUS_MULTIPLIER      // Bonus score multipliers
    }
    
    // Request tracking
    struct RandomnessRequest {
        address player;
        RandomEventType eventType;
        uint256 gameSessionId;
        uint256 timestamp;
        bool fulfilled;
        uint256 randomResult;
    }
    
    mapping(bytes32 => RandomnessRequest) public randomnessRequests;
    mapping(address => uint256) public playerRequestCount;
    mapping(RandomEventType => uint256) public eventTypeCount;
    
    // Game-specific randomness ranges
    mapping(RandomEventType => uint256) public maxRandomValue;
    
    // Events
    event RandomnessRequested(
        bytes32 indexed requestId,
        address indexed player,
        RandomEventType eventType,
        uint256 gameSessionId
    );
    
    event RandomnessFulfilled(
        bytes32 indexed requestId,
        address indexed player,
        RandomEventType eventType,
        uint256 randomResult,
        uint256 gameSessionId
    );
    
    event VRFConfigurationUpdated(
        RandomEventType eventType,
        uint256 maxValue
    );
    
    constructor(
        address _vrfCoordinator,
        address _linkToken,
        bytes32 _keyHash,
        uint256 _fee
    ) VRFConsumerBase(_vrfCoordinator, _linkToken) {
        vrfKeyHash = _keyHash;
        vrfFee = _fee;
        
        // Initialize max random values for different event types
        maxRandomValue[RandomEventType.DAILY_CHALLENGE] = 100;
        maxRandomValue[RandomEventType.NFT_REWARD_RARITY] = 1000;
        maxRandomValue[RandomEventType.POWER_UP_SPAWN] = 10;
        maxRandomValue[RandomEventType.OBSTACLE_PATTERN] = 50;
        maxRandomValue[RandomEventType.TOURNAMENT_MATCH] = 10000;
        maxRandomValue[RandomEventType.QUEST_REWARD] = 100;
        maxRandomValue[RandomEventType.SPECIAL_EVENT] = 20;
        maxRandomValue[RandomEventType.BONUS_MULTIPLIER] = 5;
    }
    
    /**
     * @dev Request randomness for a specific game event
     * @param eventType The type of random event
     * @param gameSessionId The current game session ID
     */
    function requestRandomness(
        RandomEventType eventType,
        uint256 gameSessionId
    ) external nonReentrant returns (bytes32 requestId) {
        require(
            LINK.balanceOf(address(this)) >= vrfFee,
            "Not enough LINK tokens for VRF request"
        );
        
        requestId = requestRandomness(vrfKeyHash, vrfFee);
        
        randomnessRequests[requestId] = RandomnessRequest({
            player: msg.sender,
            eventType: eventType,
            gameSessionId: gameSessionId,
            timestamp: block.timestamp,
            fulfilled: false,
            randomResult: 0
        });
        
        playerRequestCount[msg.sender]++;
        eventTypeCount[eventType]++;
        
        emit RandomnessRequested(requestId, msg.sender, eventType, gameSessionId);
        
        return requestId;
    }
    
    /**
     * @dev Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        RandomnessRequest storage request = randomnessRequests[requestId];
        require(!request.fulfilled, "Request already fulfilled");
        
        request.fulfilled = true;
        request.randomResult = randomness % maxRandomValue[request.eventType];
        
        emit RandomnessFulfilled(
            requestId,
            request.player,
            request.eventType,
            request.randomResult,
            request.gameSessionId
        );
    }
    
    /**
     * @dev Get the result of a randomness request
     * @param requestId The request ID to check
     * @return fulfilled Whether the request has been fulfilled
     * @return randomResult The random result (0 if not fulfilled)
     */
    function getRandomnessResult(bytes32 requestId) 
        external 
        view 
        returns (bool fulfilled, uint256 randomResult) 
    {
        RandomnessRequest memory request = randomnessRequests[requestId];
        return (request.fulfilled, request.randomResult);
    }
    
    /**
     * @dev Get player's randomness request history
     * @param player The player address
     * @return count Total number of requests made
     */
    function getPlayerRequestCount(address player) external view returns (uint256 count) {
        return playerRequestCount[player];
    }
    
    /**
     * @dev Get statistics for a specific event type
     * @param eventType The event type to query
     * @return count Total number of requests for this event type
     * @return maxValue Maximum random value for this event type
     */
    function getEventTypeStats(RandomEventType eventType) 
        external 
        view 
        returns (uint256 count, uint256 maxValue) 
    {
        return (eventTypeCount[eventType], maxRandomValue[eventType]);
    }
    
    /**
     * @dev Update maximum random value for an event type (owner only)
     * @param eventType The event type to update
     * @param newMaxValue The new maximum value
     */
    function updateMaxRandomValue(
        RandomEventType eventType,
        uint256 newMaxValue
    ) external onlyOwner {
        require(newMaxValue > 0, "Max value must be greater than 0");
        maxRandomValue[eventType] = newMaxValue;
        
        emit VRFConfigurationUpdated(eventType, newMaxValue);
    }
    
    /**
     * @dev Withdraw LINK tokens (owner only)
     */
    function withdrawLink() external onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(LINK);
        require(link.transfer(msg.sender, link.balanceOf(address(this))), "LINK transfer failed");
    }
    
    /**
     * @dev Get contract LINK balance
     */
    function getLinkBalance() external view returns (uint256) {
        return LINK.balanceOf(address(this));
    }
    
    /**
     * @dev Emergency function to fund contract with LINK (owner only)
     */
    function fundContract(uint256 amount) external onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(LINK);
        require(link.transferFrom(msg.sender, address(this), amount), "LINK transfer failed");
    }
}
