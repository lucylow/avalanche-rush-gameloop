// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBase.sol";

/**
 * @title AvalancheRushCChain
 * @dev Advanced Avalanche C-Chain specific features for Avalanche Rush
 * @notice Leverages AVAX native features, subnet integration, and C-Chain optimizations
 */
contract AvalancheRushCChain is ERC721, ReentrancyGuard, Ownable, Pausable, VRFConsumerBase {
    using Counters for Counters.Counter;
    
    // Avalanche C-Chain specific constants
    uint256 public constant AVALANCHE_CHAIN_ID = 43114;
    uint256 public constant FUJI_CHAIN_ID = 43113;
    uint256 public constant REACTIVE_CHAIN_ID = 42;
    
    // AVAX native token integration
    mapping(address => uint256) public avaxStaked;
    mapping(address => uint256) public stakingRewards;
    mapping(address => uint256) public lastStakeTime;
    
    // Avalanche subnet integration
    struct SubnetInfo {
        string name;
        uint256 chainId;
        address bridgeContract;
        bool isActive;
        uint256 totalPlayers;
    }
    
    mapping(uint256 => SubnetInfo) public subnets;
    mapping(address => uint256) public playerSubnet;
    Counters.Counter private subnetCounter;
    
    // C-Chain specific game mechanics
    struct AvalancheQuest {
        uint256 id;
        string title;
        string description;
        uint256 avaxReward;
        uint256 rushReward;
        uint256 difficulty;
        bool isActive;
        uint256 completionCount;
        mapping(address => bool) completedBy;
    }
    
    mapping(uint256 => AvalancheQuest) public avalancheQuests;
    Counters.Counter private questCounter;
    
    // Cross-chain functionality
    struct CrossChainTransfer {
        address player;
        uint256 amount;
        uint256 fromChain;
        uint256 toChain;
        uint256 timestamp;
        bool completed;
    }
    
    mapping(bytes32 => CrossChainTransfer) public crossChainTransfers;
    
    // Avalanche DeFi integrations
    struct DeFiPosition {
        address protocol;
        uint256 amount;
        uint256 apy;
        uint256 timestamp;
        bool isActive;
    }
    
    mapping(address => DeFiPosition[]) public playerDeFiPositions;
    
    // Events
    event AVAXStaked(address indexed player, uint256 amount, uint256 timestamp);
    event AVAXUnstaked(address indexed player, uint256 amount, uint256 rewards);
    event SubnetJoined(address indexed player, uint256 subnetId, string subnetName);
    event AvalancheQuestCompleted(address indexed player, uint256 questId, uint256 avaxReward);
    event CrossChainTransferInitiated(bytes32 indexed transferId, address player, uint256 amount, uint256 fromChain, uint256 toChain);
    event CrossChainTransferCompleted(bytes32 indexed transferId, address player, uint256 amount);
    event DeFiPositionOpened(address indexed player, address protocol, uint256 amount, uint256 apy);
    event DeFiPositionClosed(address indexed player, address protocol, uint256 amount, uint256 rewards);
    
    // VRF for Avalanche-specific randomness
    bytes32 internal immutable vrfKeyHash;
    uint256 internal immutable vrfFee;
    
    constructor(
        address _vrfCoordinator,
        address _linkToken,
        bytes32 _keyHash,
        uint256 _fee
    ) ERC721("AvalancheRushNFT", "ARUSH") VRFConsumerBase(_vrfCoordinator, _linkToken) {
        vrfKeyHash = _keyHash;
        vrfFee = _fee;
        
        // Initialize Avalanche subnets
        _initializeSubnets();
        
        // Initialize Avalanche quests
        _initializeAvalancheQuests();
    }
    
    /**
     * @dev Initialize supported Avalanche subnets
     */
    function _initializeSubnets() internal {
        // Avalanche C-Chain (Mainnet)
        subnets[AVALANCHE_CHAIN_ID] = SubnetInfo({
            name: "Avalanche C-Chain",
            chainId: AVALANCHE_CHAIN_ID,
            bridgeContract: address(0), // To be set
            isActive: true,
            totalPlayers: 0
        });
        
        // Fuji Testnet
        subnets[FUJI_CHAIN_ID] = SubnetInfo({
            name: "Fuji Testnet",
            chainId: FUJI_CHAIN_ID,
            bridgeContract: address(0), // To be set
            isActive: true,
            totalPlayers: 0
        });
        
        // Reactive Network
        subnets[REACTIVE_CHAIN_ID] = SubnetInfo({
            name: "Reactive Network",
            chainId: REACTIVE_CHAIN_ID,
            bridgeContract: address(0), // To be set
            isActive: true,
            totalPlayers: 0
        });
    }
    
    /**
     * @dev Initialize Avalanche-specific quests
     */
    function _initializeAvalancheQuests() internal {
        // Quest 1: AVAX Staking
        avalancheQuests[1].id = 1;
        avalancheQuests[1].title = "AVAX Staking Master";
        avalancheQuests[1].description = "Stake 1 AVAX for 7 days";
        avalancheQuests[1].avaxReward = 0.1 ether; // 0.1 AVAX
        avalancheQuests[1].rushReward = 1000;
        avalancheQuests[1].difficulty = 2;
        avalancheQuests[1].isActive = true;
        avalancheQuests[1].completionCount = 0;
        
        // Quest 2: Subnet Explorer
        avalancheQuests[2].id = 2;
        avalancheQuests[2].title = "Subnet Explorer";
        avalancheQuests[2].description = "Complete games on 3 different Avalanche subnets";
        avalancheQuests[2].avaxReward = 0.2 ether; // 0.2 AVAX
        avalancheQuests[2].rushReward = 2000;
        avalancheQuests[2].difficulty = 3;
        avalancheQuests[2].isActive = true;
        avalancheQuests[2].completionCount = 0;
        
        // Quest 3: DeFi Integration
        avalancheQuests[3].id = 3;
        avalancheQuests[3].title = "DeFi Pioneer";
        avalancheQuests[3].description = "Provide liquidity to an Avalanche DeFi protocol";
        avalancheQuests[3].avaxReward = 0.3 ether; // 0.3 AVAX
        avalancheQuests[3].rushReward = 3000;
        avalancheQuests[3].difficulty = 4;
        avalancheQuests[3].isActive = true;
        avalancheQuests[3].completionCount = 0;
    }
    
    /**
     * @dev Stake AVAX native tokens
     */
    function stakeAVAX() external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "Must stake more than 0 AVAX");
        require(msg.value >= 0.01 ether, "Minimum stake is 0.01 AVAX");
        
        // Calculate previous rewards if already staking
        if (avaxStaked[msg.sender] > 0) {
            uint256 rewards = calculateStakingRewards(msg.sender);
            stakingRewards[msg.sender] += rewards;
        }
        
        avaxStaked[msg.sender] += msg.value;
        lastStakeTime[msg.sender] = block.timestamp;
        
        emit AVAXStaked(msg.sender, msg.value, block.timestamp);
        
        // Check if AVAX staking quest is completed
        _checkAvalancheQuestCompletion(msg.sender, 1);
    }
    
    /**
     * @dev Unstake AVAX and claim rewards
     */
    function unstakeAVAX(uint256 amount) external nonReentrant whenNotPaused {
        require(avaxStaked[msg.sender] >= amount, "Insufficient staked amount");
        require(block.timestamp >= lastStakeTime[msg.sender] + 7 days, "Must stake for at least 7 days");
        
        uint256 rewards = calculateStakingRewards(msg.sender);
        uint256 totalRewards = stakingRewards[msg.sender] + rewards;
        
        avaxStaked[msg.sender] -= amount;
        stakingRewards[msg.sender] = 0;
        lastStakeTime[msg.sender] = block.timestamp;
        
        // Transfer AVAX back to player
        payable(msg.sender).transfer(amount + totalRewards);
        
        emit AVAXUnstaked(msg.sender, amount, totalRewards);
    }
    
    /**
     * @dev Calculate staking rewards based on time and amount
     */
    function calculateStakingRewards(address player) public view returns (uint256) {
        if (avaxStaked[player] == 0) return 0;
        
        uint256 stakingDuration = block.timestamp - lastStakeTime[player];
        uint256 annualRate = 5; // 5% APY
        uint256 rewards = (avaxStaked[player] * annualRate * stakingDuration) / (365 days * 100);
        
        return rewards;
    }
    
    /**
     * @dev Join an Avalanche subnet
     */
    function joinSubnet(uint256 subnetId) external whenNotPaused {
        require(subnets[subnetId].isActive, "Subnet not active");
        require(playerSubnet[msg.sender] == 0, "Already in a subnet");
        
        playerSubnet[msg.sender] = subnetId;
        subnets[subnetId].totalPlayers++;
        
        emit SubnetJoined(msg.sender, subnetId, subnets[subnetId].name);
        
        // Check if subnet explorer quest is completed
        _checkAvalancheQuestCompletion(msg.sender, 2);
    }
    
    /**
     * @dev Complete an Avalanche-specific quest
     */
    function completeAvalancheQuest(uint256 questId) external nonReentrant whenNotPaused {
        require(avalancheQuests[questId].isActive, "Quest not active");
        require(!avalancheQuests[questId].completedBy[msg.sender], "Quest already completed");
        
        // Quest-specific completion logic
        if (questId == 1) {
            require(avaxStaked[msg.sender] >= 1 ether, "Must stake at least 1 AVAX");
            require(block.timestamp >= lastStakeTime[msg.sender] + 7 days, "Must stake for 7 days");
        } else if (questId == 2) {
            require(playerSubnet[msg.sender] != 0, "Must join a subnet");
        } else if (questId == 3) {
            require(playerDeFiPositions[msg.sender].length > 0, "Must have DeFi positions");
        }
        
        avalancheQuests[questId].completedBy[msg.sender] = true;
        avalancheQuests[questId].completionCount++;
        
        // Mint NFT for quest completion
        _mint(msg.sender, questId);
        
        // Transfer AVAX reward
        if (avalancheQuests[questId].avaxReward > 0) {
            payable(msg.sender).transfer(avalancheQuests[questId].avaxReward);
        }
        
        emit AvalancheQuestCompleted(msg.sender, questId, avalancheQuests[questId].avaxReward);
    }
    
    /**
     * @dev Initiate cross-chain transfer
     */
    function initiateCrossChainTransfer(
        uint256 amount,
        uint256 toChain
    ) external payable nonReentrant whenNotPaused {
        require(msg.value >= amount, "Insufficient AVAX sent");
        require(subnets[toChain].isActive, "Destination subnet not active");
        
        bytes32 transferId = keccak256(abi.encodePacked(
            msg.sender,
            amount,
            block.chainid,
            toChain,
            block.timestamp
        ));
        
        crossChainTransfers[transferId] = CrossChainTransfer({
            player: msg.sender,
            amount: amount,
            fromChain: block.chainid,
            toChain: toChain,
            timestamp: block.timestamp,
            completed: false
        });
        
        emit CrossChainTransferInitiated(transferId, msg.sender, amount, block.chainid, toChain);
    }
    
    /**
     * @dev Complete cross-chain transfer (called by bridge)
     */
    function completeCrossChainTransfer(bytes32 transferId) external onlyOwner {
        CrossChainTransfer storage transfer = crossChainTransfers[transferId];
        require(!transfer.completed, "Transfer already completed");
        
        transfer.completed = true;
        payable(transfer.player).transfer(transfer.amount);
        
        emit CrossChainTransferCompleted(transferId, transfer.player, transfer.amount);
    }
    
    /**
     * @dev Open DeFi position
     */
    function openDeFiPosition(
        address protocol,
        uint256 amount,
        uint256 apy
    ) external payable nonReentrant whenNotPaused {
        require(msg.value >= amount, "Insufficient AVAX sent");
        require(protocol != address(0), "Invalid protocol");
        
        playerDeFiPositions[msg.sender].push(DeFiPosition({
            protocol: protocol,
            amount: amount,
            apy: apy,
            timestamp: block.timestamp,
            isActive: true
        }));
        
        emit DeFiPositionOpened(msg.sender, protocol, amount, apy);
        
        // Check if DeFi quest is completed
        _checkAvalancheQuestCompletion(msg.sender, 3);
    }
    
    /**
     * @dev Close DeFi position
     */
    function closeDeFiPosition(uint256 positionIndex) external nonReentrant whenNotPaused {
        require(positionIndex < playerDeFiPositions[msg.sender].length, "Invalid position index");
        
        DeFiPosition storage position = playerDeFiPositions[msg.sender][positionIndex];
        require(position.isActive, "Position not active");
        
        uint256 rewards = calculateDeFiRewards(msg.sender, positionIndex);
        position.isActive = false;
        
        // Transfer AVAX + rewards back to player
        payable(msg.sender).transfer(position.amount + rewards);
        
        emit DeFiPositionClosed(msg.sender, position.protocol, position.amount, rewards);
    }
    
    /**
     * @dev Calculate DeFi rewards
     */
    function calculateDeFiRewards(address player, uint256 positionIndex) public view returns (uint256) {
        DeFiPosition memory position = playerDeFiPositions[player][positionIndex];
        if (!position.isActive) return 0;
        
        uint256 duration = block.timestamp - position.timestamp;
        uint256 rewards = (position.amount * position.apy * duration) / (365 days * 100);
        
        return rewards;
    }
    
    /**
     * @dev Check if Avalanche quest is completed
     */
    function _checkAvalancheQuestCompletion(address player, uint256 questId) internal {
        if (!avalancheQuests[questId].completedBy[player]) {
            // Auto-complete quest if conditions are met
            if (questId == 1 && avaxStaked[player] >= 1 ether && block.timestamp >= lastStakeTime[player] + 7 days) {
                completeAvalancheQuest(questId);
            }
        }
    }
    
    /**
     * @dev Request VRF for Avalanche-specific randomness
     */
    function requestAvalancheRandomness(uint256 gameSessionId) external returns (bytes32) {
        require(LINK.balanceOf(address(this)) >= vrfFee, "Not enough LINK");
        
        bytes32 requestId = requestRandomness(vrfKeyHash, vrfFee);
        
        // Store game session ID for callback
        // Implementation would track requestId -> gameSessionId mapping
        
        return requestId;
    }
    
    /**
     * @dev VRF callback for Avalanche-specific events
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        // Implement Avalanche-specific randomness logic
        // Could trigger subnet-specific events, AVAX rewards, etc.
    }
    
    /**
     * @dev Get player's Avalanche statistics
     */
    function getPlayerAvalancheStats(address player) external view returns (
        uint256 stakedAVAX,
        uint256 stakingRewards,
        uint256 subnetId,
        uint256 completedQuests,
        uint256 deFiPositions,
        uint256 totalAVAXEarned
    ) {
        stakedAVAX = avaxStaked[player];
        stakingRewards = stakingRewards[player] + calculateStakingRewards(player);
        subnetId = playerSubnet[player];
        
        completedQuests = 0;
        for (uint256 i = 1; i <= 3; i++) {
            if (avalancheQuests[i].completedBy[player]) {
                completedQuests++;
            }
        }
        
        deFiPositions = playerDeFiPositions[player].length;
        totalAVAXEarned = 0; // Would calculate from quest completions
    }
    
    /**
     * @dev Emergency functions
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function withdrawAVAX(uint256 amount) external onlyOwner {
        payable(owner()).transfer(amount);
    }
    
    function withdrawLINK() external onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(LINK);
        require(link.transfer(owner(), link.balanceOf(address(this))), "LINK transfer failed");
    }
    
    /**
     * @dev Receive AVAX
     */
    receive() external payable {}
}
