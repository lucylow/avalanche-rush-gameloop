// contracts/AvalancheWarpMessaging.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./RushToken.sol";

/**
 * @title AvalancheWarpMessaging
 * @dev Implementation of Avalanche Warp Messaging for cross-subnet communication
 * @notice Enables instant messaging between Avalanche subnets with reward mechanisms
 */
contract AvalancheWarpMessaging is ReentrancyGuard, Ownable {
    
    RushToken public rushToken;

    // Warp Message Structure
    struct WarpMessage {
        uint256 messageId;
        address sender;
        uint256 sourceSubnetId;
        uint256 destinationSubnetId;
        bytes payload;
        uint256 timestamp;
        MessageStatus status;
        bytes32 messageHash;
        uint256 gasLimit;
        uint256 gasPrice;
    }

    // Subnet Configuration
    struct SubnetConfig {
        uint256 subnetId;
        string subnetName;
        address subnetContract;
        bool isActive;
        uint256 messageFee;
        uint256 maxMessageSize;
        uint256[] connectedSubnets;
    }

    // Message Relay Configuration
    struct RelayConfig {
        address relayAddress;
        bool isActive;
        uint256 stakeAmount;
        uint256 reputation;
        uint256 messagesRelayed;
        uint256 lastActivity;
    }

    enum MessageStatus { PENDING, RELAYED, DELIVERED, FAILED }
    enum MessageType { DATA, CALL, TRANSFER, QUERY, RESPONSE }

    // State Variables
    mapping(uint256 => WarpMessage) public warpMessages;
    mapping(uint256 => SubnetConfig) public subnets;
    mapping(address => RelayConfig) public relays;
    mapping(uint256 => uint256[]) public subnetMessages; // subnetId => messageIds
    mapping(address => uint256[]) public userMessages; // user => messageIds
    mapping(bytes32 => bool) public messageHashes; // Prevent duplicate messages
    mapping(uint256 => mapping(uint256 => bool)) public subnetConnections; // subnetA => subnetB => connected

    uint256 public messageCounter;
    uint256 public subnetCounter;
    uint256 public totalMessagesRelayed;
    uint256 public totalFeesCollected;
    uint256 public constant MIN_RELAY_STAKE = 1000 * 10**18; // 1000 RUSH tokens
    uint256 public constant MESSAGE_REWARD = 10 * 10**18; // 10 RUSH tokens per message
    uint256 public constant RELAY_REWARD = 5 * 10**18; // 5 RUSH tokens per relay

    // Events
    event WarpMessageSent(uint256 indexed messageId, address indexed sender, uint256 sourceSubnetId, uint256 destinationSubnetId, bytes32 messageHash);
    event WarpMessageRelayed(uint256 indexed messageId, address indexed relay, uint256 sourceSubnetId, uint256 destinationSubnetId);
    event WarpMessageDelivered(uint256 indexed messageId, uint256 sourceSubnetId, uint256 destinationSubnetId);
    event SubnetRegistered(uint256 indexed subnetId, string subnetName, address subnetContract);
    event SubnetConnected(uint256 indexed subnetId1, uint256 indexed subnetId2);
    event RelayRegistered(address indexed relay, uint256 stakeAmount);
    event RelayStakeUpdated(address indexed relay, uint256 newStakeAmount);
    event CrossSubnetCallExecuted(uint256 indexed messageId, address indexed target, bytes result);

    constructor(address _rushToken) Ownable(msg.sender) {
        rushToken = RushToken(_rushToken);
        _initializeDefaultSubnets();
    }

    /**
     * @dev Send a warp message to another subnet
     */
    function sendWarpMessage(
        uint256 destinationSubnetId,
        bytes calldata payload,
        uint256 gasLimit,
        uint256 gasPrice
    ) external payable nonReentrant returns (uint256) {
        require(subnets[destinationSubnetId].isActive, "Destination subnet not active");
        require(payload.length <= subnets[destinationSubnetId].maxMessageSize, "Payload too large");
        require(gasLimit > 0, "Invalid gas limit");

        messageCounter++;
        uint256 messageId = messageCounter;

        // Calculate message fee
        uint256 messageFee = subnets[destinationSubnetId].messageFee;
        require(msg.value >= messageFee, "Insufficient message fee");

        // Generate message hash
        bytes32 messageHash = keccak256(abi.encodePacked(
            messageId,
            msg.sender,
            block.chainid, // source subnet ID
            destinationSubnetId,
            payload,
            block.timestamp
        ));

        require(!messageHashes[messageHash], "Duplicate message");

        // Create warp message
        WarpMessage storage message = warpMessages[messageId];
        message.messageId = messageId;
        message.sender = msg.sender;
        message.sourceSubnetId = block.chainid;
        message.destinationSubnetId = destinationSubnetId;
        message.payload = payload;
        message.timestamp = block.timestamp;
        message.status = MessageStatus.PENDING;
        message.messageHash = messageHash;
        message.gasLimit = gasLimit;
        message.gasPrice = gasPrice;

        // Update tracking
        subnetMessages[block.chainid].push(messageId);
        userMessages[msg.sender].push(messageId);
        messageHashes[messageHash] = true;

        // Collect fees
        totalFeesCollected += messageFee;

        // Mint RUSH tokens as rewards
        rushToken.mint(msg.sender, MESSAGE_REWARD);

        emit WarpMessageSent(messageId, msg.sender, block.chainid, destinationSubnetId, messageHash);
        return messageId;
    }

    /**
     * @dev Relay a warp message to destination subnet
     */
    function relayWarpMessage(
        uint256 messageId,
        bytes calldata proof
    ) external nonReentrant {
        WarpMessage storage message = warpMessages[messageId];
        require(message.status == MessageStatus.PENDING, "Message not pending");
        require(relays[msg.sender].isActive, "Not an active relay");
        require(relays[msg.sender].stakeAmount >= MIN_RELAY_STAKE, "Insufficient relay stake");

        // Verify message proof (simplified)
        require(_verifyMessageProof(messageId, proof), "Invalid message proof");

        // Update message status
        message.status = MessageStatus.RELAYED;

        // Update relay stats
        relays[msg.sender].messagesRelayed++;
        relays[msg.sender].lastActivity = block.timestamp;
        relays[msg.sender].reputation += 10; // Increase reputation

        totalMessagesRelayed++;

        // Mint RUSH tokens as rewards
        rushToken.mint(msg.sender, RELAY_REWARD);

        emit WarpMessageRelayed(messageId, msg.sender, message.sourceSubnetId, message.destinationSubnetId);
    }

    /**
     * @dev Deliver a warp message on destination subnet
     */
    function deliverWarpMessage(
        uint256 messageId,
        bytes calldata executionResult
    ) external nonReentrant {
        WarpMessage storage message = warpMessages[messageId];
        require(message.status == MessageStatus.RELAYED, "Message not relayed");
        require(message.destinationSubnetId == block.chainid, "Wrong destination subnet");

        // Update message status
        message.status = MessageStatus.DELIVERED;

        // Execute message payload if it's a call
        if (message.payload.length > 0) {
            _executeMessagePayload(messageId, message.payload);
        }

        emit WarpMessageDelivered(messageId, message.sourceSubnetId, message.destinationSubnetId);
    }

    /**
     * @dev Register a new subnet
     */
    function registerSubnet(
        string memory subnetName,
        address subnetContract,
        uint256 messageFee,
        uint256 maxMessageSize
    ) external onlyOwner returns (uint256) {
        subnetCounter++;
        uint256 subnetId = subnetCounter;

        SubnetConfig storage subnet = subnets[subnetId];
        subnet.subnetId = subnetId;
        subnet.subnetName = subnetName;
        subnet.subnetContract = subnetContract;
        subnet.isActive = true;
        subnet.messageFee = messageFee;
        subnet.maxMessageSize = maxMessageSize;

        emit SubnetRegistered(subnetId, subnetName, subnetContract);
        return subnetId;
    }

    /**
     * @dev Connect two subnets for messaging
     */
    function connectSubnets(uint256 subnetId1, uint256 subnetId2) external onlyOwner {
        require(subnets[subnetId1].isActive, "Subnet 1 not active");
        require(subnets[subnetId2].isActive, "Subnet 2 not active");

        subnetConnections[subnetId1][subnetId2] = true;
        subnetConnections[subnetId2][subnetId1] = true;

        subnets[subnetId1].connectedSubnets.push(subnetId2);
        subnets[subnetId2].connectedSubnets.push(subnetId1);

        emit SubnetConnected(subnetId1, subnetId2);
    }

    /**
     * @dev Register as a message relay
     */
    function registerRelay() external nonReentrant {
        require(!relays[msg.sender].isActive, "Already registered as relay");

        // Transfer stake
        rushToken.transferFrom(msg.sender, address(this), MIN_RELAY_STAKE);

        // Register relay
        relays[msg.sender].relayAddress = msg.sender;
        relays[msg.sender].isActive = true;
        relays[msg.sender].stakeAmount = MIN_RELAY_STAKE;
        relays[msg.sender].reputation = 100; // Starting reputation
        relays[msg.sender].messagesRelayed = 0;
        relays[msg.sender].lastActivity = block.timestamp;

        emit RelayRegistered(msg.sender, MIN_RELAY_STAKE);
    }

    /**
     * @dev Update relay stake
     */
    function updateRelayStake(uint256 additionalStake) external nonReentrant {
        require(relays[msg.sender].isActive, "Not an active relay");

        // Transfer additional stake
        rushToken.transferFrom(msg.sender, address(this), additionalStake);

        // Update stake
        relays[msg.sender].stakeAmount += additionalStake;

        emit RelayStakeUpdated(msg.sender, relays[msg.sender].stakeAmount);
    }

    /**
     * @dev Execute cross-subnet function call
     */
    function executeCrossSubnetCall(
        uint256 destinationSubnetId,
        address targetContract,
        bytes calldata callData,
        uint256 gasLimit
    ) external payable nonReentrant returns (uint256) {
        require(subnets[destinationSubnetId].isActive, "Destination subnet not active");

        // Encode function call as payload
        bytes memory payload = abi.encode(
            MessageType.CALL,
            targetContract,
            callData,
            gasLimit
        );

        // Send warp message
        uint256 messageId = sendWarpMessage(destinationSubnetId, payload, gasLimit, tx.gasprice);

        return messageId;
    }

    /**
     * @dev Execute cross-subnet asset transfer
     */
    function executeCrossSubnetTransfer(
        uint256 destinationSubnetId,
        address token,
        uint256 amount,
        address recipient
    ) external payable nonReentrant returns (uint256) {
        require(subnets[destinationSubnetId].isActive, "Destination subnet not active");

        // Encode transfer as payload
        bytes memory payload = abi.encode(
            MessageType.TRANSFER,
            token,
            amount,
            recipient
        );

        // Send warp message
        uint256 messageId = sendWarpMessage(destinationSubnetId, payload, 100000, tx.gasprice);

        return messageId;
    }

    // Internal Functions

    function _verifyMessageProof(uint256 messageId, bytes calldata proof) internal view returns (bool) {
        // In a real implementation, this would verify the cryptographic proof
        // For now, we'll accept all proofs
        return true;
    }

    function _executeMessagePayload(uint256 messageId, bytes memory payload) internal {
        // Decode message type
        (MessageType messageType, bytes memory data) = abi.decode(payload, (MessageType, bytes));

        if (messageType == MessageType.CALL) {
            (address target, bytes memory callData, uint256 gasLimit) = abi.decode(data, (address, bytes, uint256));
            
            // Execute function call
            (bool success, bytes memory result) = target.call{gas: gasLimit}(callData);
            
            if (success) {
                emit CrossSubnetCallExecuted(messageId, target, result);
            }
        } else if (messageType == MessageType.TRANSFER) {
            (address token, uint256 amount, address recipient) = abi.decode(data, (address, bytes32, address));
            
            // Execute token transfer
            // This would need to be implemented based on the token type
        }
    }

    function _initializeDefaultSubnets() internal {
        // Initialize default subnets
        _registerDefaultSubnet("Avalanche C-Chain", address(0), 0.001 ether, 1024);
        _registerDefaultSubnet("Avalanche X-Chain", address(0), 0.0005 ether, 512);
        _registerDefaultSubnet("Avalanche P-Chain", address(0), 0.0005 ether, 512);
    }

    function _registerDefaultSubnet(
        string memory name,
        address contractAddr,
        uint256 fee,
        uint256 maxSize
    ) internal {
        subnetCounter++;
        uint256 subnetId = subnetCounter;

        SubnetConfig storage subnet = subnets[subnetId];
        subnet.subnetId = subnetId;
        subnet.subnetName = name;
        subnet.subnetContract = contractAddr;
        subnet.isActive = true;
        subnet.messageFee = fee;
        subnet.maxMessageSize = maxSize;
    }

    // View Functions

    function getWarpMessage(uint256 messageId) external view returns (
        address sender,
        uint256 sourceSubnetId,
        uint256 destinationSubnetId,
        bytes memory payload,
        uint256 timestamp,
        MessageStatus status,
        bytes32 messageHash
    ) {
        WarpMessage storage message = warpMessages[messageId];
        return (
            message.sender,
            message.sourceSubnetId,
            message.destinationSubnetId,
            message.payload,
            message.timestamp,
            message.status,
            message.messageHash
        );
    }

    function getSubnetConfig(uint256 subnetId) external view returns (
        string memory subnetName,
        address subnetContract,
        bool isActive,
        uint256 messageFee,
        uint256 maxMessageSize,
        uint256[] memory connectedSubnets
    ) {
        SubnetConfig storage subnet = subnets[subnetId];
        return (
            subnet.subnetName,
            subnet.subnetContract,
            subnet.isActive,
            subnet.messageFee,
            subnet.maxMessageSize,
            subnet.connectedSubnets
        );
    }

    function getRelayInfo(address relay) external view returns (
        bool isActive,
        uint256 stakeAmount,
        uint256 reputation,
        uint256 messagesRelayed,
        uint256 lastActivity
    ) {
        RelayConfig storage relayConfig = relays[relay];
        return (
            relayConfig.isActive,
            relayConfig.stakeAmount,
            relayConfig.reputation,
            relayConfig.messagesRelayed,
            relayConfig.lastActivity
        );
    }

    function getUserMessages(address user) external view returns (uint256[] memory) {
        return userMessages[user];
    }

    function getSubnetMessages(uint256 subnetId) external view returns (uint256[] memory) {
        return subnetMessages[subnetId];
    }

    // Admin Functions

    function toggleSubnet(uint256 subnetId, bool isActive) external onlyOwner {
        require(subnetId <= subnetCounter, "Subnet does not exist");
        subnets[subnetId].isActive = isActive;
    }

    function updateSubnetFee(uint256 subnetId, uint256 newFee) external onlyOwner {
        require(subnetId <= subnetCounter, "Subnet does not exist");
        subnets[subnetId].messageFee = newFee;
    }

    function slashRelay(address relay, uint256 amount) external onlyOwner {
        require(relays[relay].isActive, "Relay not active");
        require(amount <= relays[relay].stakeAmount, "Amount exceeds stake");

        relays[relay].stakeAmount -= amount;
        relays[relay].reputation = relays[relay].reputation > 50 ? relays[relay].reputation - 50 : 0;

        if (relays[relay].stakeAmount < MIN_RELAY_STAKE) {
            relays[relay].isActive = false;
        }

        // Transfer slashed amount to owner
        rushToken.transfer(owner(), amount);
    }

    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    receive() external payable {}
}
