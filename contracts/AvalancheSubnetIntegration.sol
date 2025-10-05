// contracts/AvalancheSubnetIntegration.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./RushToken.sol";

/**
 * @title AvalancheSubnetIntegration
 * @dev Enhanced Avalanche features including subnet integration, bridge support, and native AVAX staking
 */
contract AvalancheSubnetIntegration is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;

    RushToken public rushToken;
    Counters.Counter private _subnetIdCounter;

    // Avalanche Subnet Configuration
    struct SubnetConfig {
        uint256 subnetId;
        string subnetName;
        address subnetContract;
        uint256 gasPrice;
        bool isActive;
        uint256 totalStaked;
        uint256 validatorCount;
    }

    // Cross-Chain Bridge Integration
    struct BridgeTransaction {
        uint256 bridgeId;
        address from;
        address to;
        uint256 amount;
        uint256 sourceChainId;
        uint256 destinationChainId;
        BridgeStatus status;
        uint256 timestamp;
        bytes32 txHash;
    }

    enum BridgeStatus { PENDING, CONFIRMED, FAILED, REFUNDED }

    // AVAX Staking Integration
    struct StakingPosition {
        uint256 positionId;
        address staker;
        uint256 amount;
        uint256 startTime;
        uint256 duration;
        uint256 rewardsEarned;
        bool isActive;
        uint256 validatorId;
    }

    // Enhanced Quest Types for Avalanche Features
    struct AvalancheQuest {
        uint256 questId;
        AvalancheQuestType questType;
        uint256 rewardAmount;
        uint256 difficulty;
        bool isActive;
        mapping(address => bool) completions;
        uint256 completionCount;
    }

    enum AvalancheQuestType {
        SUBNET_VALIDATION,
        BRIDGE_TRANSACTION,
        AVAX_STAKING,
        CROSS_CHAIN_SWAP,
        VALIDATOR_DELEGATION,
        SUBNET_CREATION,
        CROSS_SUBNET_COMMUNICATION,
        AVALANCHE_DEFI_INTERACTION
    }

    // State Variables
    mapping(uint256 => SubnetConfig) public subnets;
    mapping(uint256 => BridgeTransaction) public bridgeTransactions;
    mapping(uint256 => StakingPosition) public stakingPositions;
    mapping(address => uint256[]) public userStakingPositions;
    mapping(uint256 => AvalancheQuest) public avalancheQuests;
    mapping(address => uint256) public userSubnetContributions;
    mapping(address => uint256) public userBridgeVolume;
    mapping(address => uint256) public userStakingRewards;

    uint256 public totalSubnets;
    uint256 public totalBridgeVolume;
    uint256 public totalStakedAVAX;
    uint256 public constant MIN_STAKING_AMOUNT = 25 * 10**18; // 25 AVAX minimum
    uint256 public constant STAKING_REWARD_RATE = 7; // 7% APY
    uint256 public constant BRIDGE_FEE_RATE = 25; // 0.25%

    // Events
    event SubnetCreated(uint256 indexed subnetId, string subnetName, address creator);
    event BridgeTransactionInitiated(uint256 indexed bridgeId, address indexed user, uint256 amount, uint256 destinationChainId);
    event BridgeTransactionCompleted(uint256 indexed bridgeId, bytes32 txHash);
    event AVAXStaked(uint256 indexed positionId, address indexed staker, uint256 amount, uint256 duration);
    event StakingRewardsClaimed(uint256 indexed positionId, address indexed staker, uint256 rewards);
    event AvalancheQuestCompleted(address indexed player, uint256 questId, AvalancheQuestType questType, uint256 reward);
    event CrossSubnetMessageSent(uint256 indexed fromSubnet, uint256 indexed toSubnet, address indexed sender, bytes32 messageHash);

    constructor(address _rushToken) Ownable(msg.sender) {
        rushToken = RushToken(_rushToken);
        _initializeAvalancheQuests();
    }

    /**
     * @dev Create a new Avalanche subnet configuration
     */
    function createSubnet(
        string memory subnetName,
        address subnetContract,
        uint256 gasPrice
    ) external onlyOwner returns (uint256) {
        _subnetIdCounter.increment();
        uint256 subnetId = _subnetIdCounter.current();

        SubnetConfig storage subnet = subnets[subnetId];
        subnet.subnetId = subnetId;
        subnet.subnetName = subnetName;
        subnet.subnetContract = subnetContract;
        subnet.gasPrice = gasPrice;
        subnet.isActive = true;
        subnet.totalStaked = 0;
        subnet.validatorCount = 0;

        totalSubnets++;

        emit SubnetCreated(subnetId, subnetName, msg.sender);
        return subnetId;
    }

    /**
     * @dev Initiate a cross-chain bridge transaction
     */
    function initiateBridgeTransaction(
        address to,
        uint256 amount,
        uint256 destinationChainId
    ) external payable nonReentrant returns (uint256) {
        require(msg.value >= amount, "Insufficient AVAX sent");
        require(destinationChainId != block.chainid, "Cannot bridge to same chain");

        uint256 bridgeId = uint256(keccak256(abi.encodePacked(
            msg.sender,
            to,
            amount,
            destinationChainId,
            block.timestamp
        )));

        BridgeTransaction storage bridgeTx = bridgeTransactions[bridgeId];
        bridgeTx.bridgeId = bridgeId;
        bridgeTx.from = msg.sender;
        bridgeTx.to = to;
        bridgeTx.amount = amount;
        bridgeTx.sourceChainId = block.chainid;
        bridgeTx.destinationChainId = destinationChainId;
        bridgeTx.status = BridgeStatus.PENDING;
        bridgeTx.timestamp = block.timestamp;

        totalBridgeVolume += amount;
        userBridgeVolume[msg.sender] += amount;

        // Calculate bridge fee
        uint256 bridgeFee = (amount * BRIDGE_FEE_RATE) / 10000;
        
        // Check for bridge quest completion
        _checkBridgeQuestCompletion(msg.sender, amount);

        emit BridgeTransactionInitiated(bridgeId, msg.sender, amount, destinationChainId);
        return bridgeId;
    }

    /**
     * @dev Complete a bridge transaction (called by bridge validator)
     */
    function completeBridgeTransaction(
        uint256 bridgeId,
        bytes32 txHash
    ) external onlyOwner {
        BridgeTransaction storage bridgeTx = bridgeTransactions[bridgeId];
        require(bridgeTx.status == BridgeStatus.PENDING, "Transaction not pending");

        bridgeTx.status = BridgeStatus.CONFIRMED;
        bridgeTx.txHash = txHash;

        emit BridgeTransactionCompleted(bridgeId, txHash);
    }

    /**
     * @dev Stake AVAX for validator rewards
     */
    function stakeAVAX(uint256 duration) external payable nonReentrant returns (uint256) {
        require(msg.value >= MIN_STAKING_AMOUNT, "Minimum staking amount not met");
        require(duration >= 14 days && duration <= 365 days, "Invalid staking duration");

        uint256 positionId = uint256(keccak256(abi.encodePacked(
            msg.sender,
            msg.value,
            duration,
            block.timestamp
        )));

        StakingPosition storage position = stakingPositions[positionId];
        position.positionId = positionId;
        position.staker = msg.sender;
        position.amount = msg.value;
        position.startTime = block.timestamp;
        position.duration = duration;
        position.rewardsEarned = 0;
        position.isActive = true;
        position.validatorId = _assignValidator();

        userStakingPositions[msg.sender].push(positionId);
        totalStakedAVAX += msg.value;

        // Check for staking quest completion
        _checkStakingQuestCompletion(msg.sender, msg.value);

        emit AVAXStaked(positionId, msg.sender, msg.value, duration);
        return positionId;
    }

    /**
     * @dev Claim staking rewards
     */
    function claimStakingRewards(uint256 positionId) external nonReentrant {
        StakingPosition storage position = stakingPositions[positionId];
        require(position.staker == msg.sender, "Not position owner");
        require(position.isActive, "Position not active");
        require(block.timestamp >= position.startTime + position.duration, "Staking period not completed");

        uint256 rewards = _calculateStakingRewards(positionId);
        require(rewards > 0, "No rewards to claim");

        position.rewardsEarned += rewards;
        userStakingRewards[msg.sender] += rewards;

        // Mint RUSH tokens as rewards
        rushToken.mint(msg.sender, rewards);

        emit StakingRewardsClaimed(positionId, msg.sender, rewards);
    }

    /**
     * @dev Send cross-subnet message using Avalanche Warp Messaging
     */
    function sendCrossSubnetMessage(
        uint256 fromSubnet,
        uint256 toSubnet,
        bytes32 messageHash
    ) external {
        require(subnets[fromSubnet].isActive, "Source subnet not active");
        require(subnets[toSubnet].isActive, "Destination subnet not active");

        // In a real implementation, this would integrate with Avalanche Warp Messaging
        // For now, we'll simulate the message sending
        
        emit CrossSubnetMessageSent(fromSubnet, toSubnet, msg.sender, messageHash);
        
        // Check for cross-subnet quest completion
        _checkCrossSubnetQuestCompletion(msg.sender);
    }

    /**
     * @dev Complete Avalanche-specific quest
     */
    function completeAvalancheQuest(uint256 questId) external {
        AvalancheQuest storage quest = avalancheQuests[questId];
        require(quest.isActive, "Quest not active");
        require(!quest.completions[msg.sender], "Quest already completed");

        quest.completions[msg.sender] = true;
        quest.completionCount++;

        // Mint rewards
        rushToken.mint(msg.sender, quest.rewardAmount);

        emit AvalancheQuestCompleted(msg.sender, questId, quest.questType, quest.rewardAmount);
    }

    // Internal Functions

    function _calculateStakingRewards(uint256 positionId) internal view returns (uint256) {
        StakingPosition storage position = stakingPositions[positionId];
        uint256 timeStaked = block.timestamp - position.startTime;
        uint256 annualReward = (position.amount * STAKING_REWARD_RATE) / 100;
        return (annualReward * timeStaked) / 365 days;
    }

    function _assignValidator() internal view returns (uint256) {
        // Simple validator assignment logic
        // In production, this would integrate with Avalanche's validator registry
        return uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % 1000;
    }

    function _checkBridgeQuestCompletion(address user, uint256 amount) internal {
        // Check if user completed bridge quest
        for (uint256 i = 1; i <= 8; i++) {
            AvalancheQuest storage quest = avalancheQuests[i];
            if (quest.questType == AvalancheQuestType.BRIDGE_TRANSACTION && 
                amount >= quest.difficulty && 
                !quest.completions[user]) {
                quest.completions[user] = true;
                quest.completionCount++;
                rushToken.mint(user, quest.rewardAmount);
                emit AvalancheQuestCompleted(user, i, quest.questType, quest.rewardAmount);
            }
        }
    }

    function _checkStakingQuestCompletion(address user, uint256 amount) internal {
        // Check if user completed staking quest
        for (uint256 i = 1; i <= 8; i++) {
            AvalancheQuest storage quest = avalancheQuests[i];
            if (quest.questType == AvalancheQuestType.AVAX_STAKING && 
                amount >= quest.difficulty && 
                !quest.completions[user]) {
                quest.completions[user] = true;
                quest.completionCount++;
                rushToken.mint(user, quest.rewardAmount);
                emit AvalancheQuestCompleted(user, i, quest.questType, quest.rewardAmount);
            }
        }
    }

    function _checkCrossSubnetQuestCompletion(address user) internal {
        // Check if user completed cross-subnet quest
        for (uint256 i = 1; i <= 8; i++) {
            AvalancheQuest storage quest = avalancheQuests[i];
            if (quest.questType == AvalancheQuestType.CROSS_SUBNET_COMMUNICATION && 
                !quest.completions[user]) {
                quest.completions[user] = true;
                quest.completionCount++;
                rushToken.mint(user, quest.rewardAmount);
                emit AvalancheQuestCompleted(user, i, quest.questType, quest.rewardAmount);
            }
        }
    }

    function _initializeAvalancheQuests() internal {
        // Initialize Avalanche-specific quests
        _createAvalancheQuest(AvalancheQuestType.SUBNET_VALIDATION, 1000 * 10**18, 1, "Subnet Validator");
        _createAvalancheQuest(AvalancheQuestType.BRIDGE_TRANSACTION, 500 * 10**18, 1 * 10**18, "Bridge Explorer");
        _createAvalancheQuest(AvalancheQuestType.AVAX_STAKING, 2000 * 10**18, 25 * 10**18, "AVAX Staker");
        _createAvalancheQuest(AvalancheQuestType.CROSS_CHAIN_SWAP, 750 * 10**18, 5 * 10**18, "Cross-Chain Swapper");
        _createAvalancheQuest(AvalancheQuestType.VALIDATOR_DELEGATION, 1500 * 10**18, 2000 * 10**18, "Validator Delegate");
        _createAvalancheQuest(AvalancheQuestType.SUBNET_CREATION, 5000 * 10**18, 10000 * 10**18, "Subnet Creator");
        _createAvalancheQuest(AvalancheQuestType.CROSS_SUBNET_COMMUNICATION, 300 * 10**18, 1, "Cross-Subnet Communicator");
        _createAvalancheQuest(AvalancheQuestType.AVALANCHE_DEFI_INTERACTION, 1200 * 10**18, 10 * 10**18, "DeFi Pioneer");
    }

    function _createAvalancheQuest(
        AvalancheQuestType questType,
        uint256 rewardAmount,
        uint256 difficulty,
        string memory metadata
    ) internal {
        uint256 questId = uint256(questType) + 1;
        AvalancheQuest storage quest = avalancheQuests[questId];
        quest.questId = questId;
        quest.questType = questType;
        quest.rewardAmount = rewardAmount;
        quest.difficulty = difficulty;
        quest.isActive = true;
        quest.completionCount = 0;
    }

    // View Functions

    function getSubnetInfo(uint256 subnetId) external view returns (
        string memory subnetName,
        address subnetContract,
        uint256 gasPrice,
        bool isActive,
        uint256 totalStaked,
        uint256 validatorCount
    ) {
        SubnetConfig storage subnet = subnets[subnetId];
        return (
            subnet.subnetName,
            subnet.subnetContract,
            subnet.gasPrice,
            subnet.isActive,
            subnet.totalStaked,
            subnet.validatorCount
        );
    }

    function getBridgeTransaction(uint256 bridgeId) external view returns (
        address from,
        address to,
        uint256 amount,
        uint256 sourceChainId,
        uint256 destinationChainId,
        BridgeStatus status,
        uint256 timestamp,
        bytes32 txHash
    ) {
        BridgeTransaction storage bridgeTx = bridgeTransactions[bridgeId];
        return (
            bridgeTx.from,
            bridgeTx.to,
            bridgeTx.amount,
            bridgeTx.sourceChainId,
            bridgeTx.destinationChainId,
            bridgeTx.status,
            bridgeTx.timestamp,
            bridgeTx.txHash
        );
    }

    function getStakingPosition(uint256 positionId) external view returns (
        address staker,
        uint256 amount,
        uint256 startTime,
        uint256 duration,
        uint256 rewardsEarned,
        bool isActive,
        uint256 validatorId
    ) {
        StakingPosition storage position = stakingPositions[positionId];
        return (
            position.staker,
            position.amount,
            position.startTime,
            position.duration,
            position.rewardsEarned,
            position.isActive,
            position.validatorId
        );
    }

    function getUserStakingPositions(address user) external view returns (uint256[] memory) {
        return userStakingPositions[user];
    }

    function getAvalancheQuest(uint256 questId) external view returns (
        AvalancheQuestType questType,
        uint256 rewardAmount,
        uint256 difficulty,
        bool isActive,
        uint256 completionCount
    ) {
        AvalancheQuest storage quest = avalancheQuests[questId];
        return (
            quest.questType,
            quest.rewardAmount,
            quest.difficulty,
            quest.isActive,
            quest.completionCount
        );
    }

    function hasCompletedAvalancheQuest(address user, uint256 questId) external view returns (bool) {
        return avalancheQuests[questId].completions[user];
    }

    // Emergency functions
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function updateStakingRewardRate(uint256 newRate) external onlyOwner {
        require(newRate <= 20, "Reward rate too high"); // Max 20% APY
        // This would require a more complex implementation with proper governance
    }
}

