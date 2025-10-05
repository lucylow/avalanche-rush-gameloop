// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IReactive.sol";
import "./AbstractReactive.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title ReactiveQuestEngine
 * @dev Advanced quest automation system that maximizes Reactive Network usage
 * @notice This contract automatically triggers quest completions based on real DeFi actions
 */
contract ReactiveQuestEngine is AbstractReactive, ReentrancyGuard, Ownable {
    
    struct Quest {
        uint256 id;
        string questType; // "swap", "stake", "bridge", "vote", "nft", "lend", "borrow"
        address targetContract;
        uint256 minAmount;
        uint256 rewardTokens;
        uint256 rewardNFT;
        bool isActive;
        uint256 completionCount;
        uint256 maxCompletions;
        uint256 chainId;
        bytes32 eventSignature;
        uint256 difficulty; // 1-5 scale
        uint256 timeLimit; // 0 = no limit
        uint256 startTime;
        uint256 endTime;
    }
    
    struct PlayerProgress {
        mapping(uint256 => bool) questCompleted;
        mapping(uint256 => uint256) questProgress;
        uint256 totalXP;
        uint256 totalRewards;
        uint256[] completedQuests;
        uint256 level;
        uint256 streak;
        uint256 lastActivity;
    }
    
    // State variables
    mapping(uint256 => Quest) public quests;
    mapping(address => PlayerProgress) public playerProgress;
    mapping(address => mapping(uint256 => bool)) public questCompleted;
    mapping(address => uint256) public playerXP;
    mapping(address => uint256[]) public completedQuests;
    mapping(bytes32 => bool) public eventProcessed;
    
    // Quest tracking
    uint256 public questCount;
    uint256 public totalQuestsCompleted;
    uint256 public totalRewardsDistributed;
    
    // Token and NFT contracts
    IERC20 public rushToken;
    IERC721 public questNFT;
    
    // Events
    event QuestCompleted(address indexed player, uint256 indexed questId, uint256 reward, uint256 xp);
    event QuestGenerated(uint256 indexed questId, string questType, uint256 reward, uint256 chainId);
    event CrossChainQuestVerified(address indexed player, bytes32 txHash, uint256 chainId);
    event DynamicQuestCreated(uint256 indexed questId, string questType, uint256 marketCondition);
    event PlayerLevelUp(address indexed player, uint256 newLevel, uint256 totalXP);
    event QuestStreakUpdated(address indexed player, uint256 newStreak);
    
    // Modifiers
    modifier onlyValidQuest(uint256 questId) {
        require(quests[questId].isActive, "Quest not active");
        require(block.timestamp >= quests[questId].startTime, "Quest not started");
        require(quests[questId].endTime == 0 || block.timestamp <= quests[questId].endTime, "Quest expired");
        _;
    }
    
    modifier onlyVM() {
        require(msg.sender == address(this), "Only VM can call");
        _;
    }
    
    constructor(address _rushToken, address _questNFT) {
        rushToken = IERC20(_rushToken);
        questNFT = IERC721(_questNFT);
    }
    
    /**
     * @dev Main reactive function that processes blockchain events
     * @notice Automatically triggers quest completions based on external events
     */
    function react(
        uint256 chain_id,
        address _contract,
        uint256 topic_0,
        uint256 topic_1,
        uint256 topic_2,
        uint256 topic_3,
        bytes calldata data,
        uint256 block_number,
        uint256 op_code
    ) external override vmOnly {
        bytes32 eventHash = keccak256(abi.encodePacked(chain_id, _contract, topic_0, topic_1, block_number));
        
        // Prevent duplicate processing
        if (eventProcessed[eventHash]) return;
        eventProcessed[eventHash] = true;
        
        address player = address(uint160(topic_1));
        
        // Process different types of blockchain events
        if (isSwapEvent(topic_0)) {
            processSwapQuest(player, chain_id, _contract, data);
        } else if (isNFTEvent(topic_0)) {
            processNFTQuest(player, chain_id, _contract, data);
        } else if (isStakingEvent(topic_0)) {
            processStakingQuest(player, chain_id, _contract, data);
        } else if (isLendingEvent(topic_0)) {
            processLendingQuest(player, chain_id, _contract, data);
        } else if (isGovernanceEvent(topic_0)) {
            processGovernanceQuest(player, chain_id, _contract, data);
        } else if (isBridgeEvent(topic_0)) {
            processBridgeQuest(player, chain_id, _contract, data);
        }
        
        // Update player activity
        updatePlayerActivity(player);
        
        // Check for dynamic quest generation
        if (shouldGenerateDynamicQuest(chain_id, _contract)) {
            generateDynamicQuest(chain_id, _contract, data);
        }
    }
    
    /**
     * @dev Process swap events for DEX interaction quests
     */
    function processSwapQuest(address player, uint256 chainId, address dex, bytes calldata data) internal {
        (uint256 amountIn, uint256 amountOut, address tokenIn, address tokenOut) = 
            abi.decode(data, (uint256, uint256, address, address));
        
        // Find matching swap quests
        for (uint256 i = 1; i <= questCount; i++) {
            Quest memory quest = quests[i];
            if (quest.isActive && 
                keccak256(abi.encodePacked(quest.questType)) == keccak256(abi.encodePacked("swap")) &&
                quest.targetContract == dex &&
                quest.chainId == chainId &&
                amountIn >= quest.minAmount) {
                
                completeQuest(player, i, amountIn);
            }
        }
        
        // Award immediate micro-rewards for educational actions
        if (amountIn >= 100 * 10**18) { // $100+ swap
            awardMicroReward(player, 50 * 10**18, "Large Swap Bonus");
        }
    }
    
    /**
     * @dev Process NFT events for NFT-related quests
     */
    function processNFTQuest(address player, uint256 chainId, address nftContract, bytes calldata data) internal {
        (address from, address to, uint256 tokenId) = abi.decode(data, (address, address, uint256));
        
        if (to == player) { // Player received NFT
            for (uint256 i = 1; i <= questCount; i++) {
                Quest memory quest = quests[i];
                if (quest.isActive && 
                    keccak256(abi.encodePacked(quest.questType)) == keccak256(abi.encodePacked("nft")) &&
                    quest.targetContract == nftContract &&
                    quest.chainId == chainId) {
                    
                    completeQuest(player, i, 1);
                }
            }
        }
    }
    
    /**
     * @dev Process staking events for yield farming quests
     */
    function processStakingQuest(address player, uint256 chainId, address stakingContract, bytes calldata data) internal {
        (uint256 amount, uint256 duration) = abi.decode(data, (uint256, uint256));
        
        for (uint256 i = 1; i <= questCount; i++) {
            Quest memory quest = quests[i];
            if (quest.isActive && 
                keccak256(abi.encodePacked(quest.questType)) == keccak256(abi.encodePacked("stake")) &&
                quest.targetContract == stakingContract &&
                quest.chainId == chainId &&
                amount >= quest.minAmount) {
                
                completeQuest(player, i, amount);
            }
        }
    }
    
    /**
     * @dev Process lending events for DeFi education quests
     */
    function processLendingQuest(address player, uint256 chainId, address lendingProtocol, bytes calldata data) internal {
        (uint256 amount, uint256 interestRate) = abi.decode(data, (uint256, uint256));
        
        for (uint256 i = 1; i <= questCount; i++) {
            Quest memory quest = quests[i];
            if (quest.isActive && 
                keccak256(abi.encodePacked(quest.questType)) == keccak256(abi.encodePacked("lend")) &&
                quest.targetContract == lendingProtocol &&
                quest.chainId == chainId &&
                amount >= quest.minAmount) {
                
                completeQuest(player, i, amount);
            }
        }
    }
    
    /**
     * @dev Process governance events for DAO participation quests
     */
    function processGovernanceQuest(address player, uint256 chainId, address governanceContract, bytes calldata data) internal {
        (uint256 proposalId, uint256 vote, uint256 weight) = abi.decode(data, (uint256, uint256, uint256));
        
        for (uint256 i = 1; i <= questCount; i++) {
            Quest memory quest = quests[i];
            if (quest.isActive && 
                keccak256(abi.encodePacked(quest.questType)) == keccak256(abi.encodePacked("vote")) &&
                quest.targetContract == governanceContract &&
                quest.chainId == chainId) {
                
                completeQuest(player, i, weight);
            }
        }
    }
    
    /**
     * @dev Process bridge events for cross-chain quests
     */
    function processBridgeQuest(address player, uint256 chainId, address bridgeContract, bytes calldata data) internal {
        (uint256 amount, uint256 destinationChain, address token) = abi.decode(data, (uint256, uint256, address));
        
        for (uint256 i = 1; i <= questCount; i++) {
            Quest memory quest = quests[i];
            if (quest.isActive && 
                keccak256(abi.encodePacked(quest.questType)) == keccak256(abi.encodePacked("bridge")) &&
                quest.targetContract == bridgeContract &&
                quest.chainId == chainId &&
                amount >= quest.minAmount) {
                
                completeQuest(player, i, amount);
                emit CrossChainQuestVerified(player, keccak256(data), destinationChain);
            }
        }
    }
    
    /**
     * @dev Complete a quest and award rewards
     */
    function completeQuest(address player, uint256 questId, uint256 amount) internal {
        Quest storage quest = quests[questId];
        
        require(!playerProgress[player].questCompleted[questId], "Quest already completed");
        require(quest.completionCount < quest.maxCompletions, "Quest max completions reached");
        
        // Calculate rewards based on quest difficulty and amount
        uint256 baseReward = quest.rewardTokens;
        uint256 difficultyMultiplier = 100 + (quest.difficulty * 20); // 100% to 200%
        uint256 amountMultiplier = 100 + ((amount / quest.minAmount) * 10); // Up to 200%
        
        uint256 totalReward = (baseReward * difficultyMultiplier * amountMultiplier) / 10000;
        uint256 xpReward = quest.difficulty * 100;
        
        // Update quest state
        quest.completionCount++;
        playerProgress[player].questCompleted[questId] = true;
        playerProgress[player].questProgress[questId] = amount;
        playerProgress[player].completedQuests.push(questId);
        playerProgress[player].totalXP += xpReward;
        playerProgress[player].totalRewards += totalReward;
        playerProgress[player].streak++;
        
        // Update global stats
        totalQuestsCompleted++;
        totalRewardsDistributed += totalReward;
        
        // Award tokens
        if (totalReward > 0) {
            rushToken.transfer(player, totalReward);
        }
        
        // Award NFT if specified
        if (quest.rewardNFT > 0) {
            questNFT.transferFrom(address(this), player, quest.rewardNFT);
        }
        
        // Check for level up
        checkLevelUp(player);
        
        emit QuestCompleted(player, questId, totalReward, xpReward);
    }
    
    /**
     * @dev Generate dynamic quests based on market conditions
     */
    function generateDynamicQuest(uint256 chainId, address contract, bytes calldata data) internal {
        // Analyze market conditions
        uint256 marketVolatility = getMarketVolatility();
        uint256 gasPrice = getGasPrice(chainId);
        uint256 networkActivity = getNetworkActivity(chainId);
        
        // Create quest based on current conditions
        uint256 questId = questCount + 1;
        string memory questType = determineQuestType(contract);
        uint256 baseReward = calculateBaseReward(marketVolatility, gasPrice);
        
        quests[questId] = Quest({
            id: questId,
            questType: questType,
            targetContract: contract,
            minAmount: 100 * 10**18, // $100 minimum
            rewardTokens: baseReward,
            rewardNFT: 0,
            isActive: true,
            completionCount: 0,
            maxCompletions: 1000,
            chainId: chainId,
            eventSignature: keccak256(abi.encodePacked(questType)),
            difficulty: calculateDifficulty(marketVolatility),
            timeLimit: 24 hours,
            startTime: block.timestamp,
            endTime: block.timestamp + 24 hours
        });
        
        questCount++;
        
        emit QuestGenerated(questId, questType, baseReward, chainId);
        emit DynamicQuestCreated(questId, questType, marketVolatility);
    }
    
    /**
     * @dev Check if player should level up
     */
    function checkLevelUp(address player) internal {
        PlayerProgress storage progress = playerProgress[player];
        uint256 requiredXP = progress.level * 1000; // 1000 XP per level
        
        if (progress.totalXP >= requiredXP) {
            progress.level++;
            emit PlayerLevelUp(player, progress.level, progress.totalXP);
            
            // Award level up bonus
            uint256 levelBonus = progress.level * 100 * 10**18;
            rushToken.transfer(player, levelBonus);
        }
    }
    
    /**
     * @dev Update player activity and streak
     */
    function updatePlayerActivity(address player) internal {
        PlayerProgress storage progress = playerProgress[player];
        
        if (block.timestamp - progress.lastActivity > 1 days) {
            progress.streak = 1; // Reset streak
        } else {
            progress.streak++;
        }
        
        progress.lastActivity = block.timestamp;
        emit QuestStreakUpdated(player, progress.streak);
    }
    
    /**
     * @dev Award micro-rewards for educational actions
     */
    function awardMicroReward(address player, uint256 amount, string memory reason) internal {
        rushToken.transfer(player, amount);
        // Log micro-reward for analytics
    }
    
    // View functions
    function getPlayerProgress(address player) external view returns (
        uint256 totalXP,
        uint256 level,
        uint256 streak,
        uint256 totalRewards,
        uint256[] memory completedQuests
    ) {
        PlayerProgress storage progress = playerProgress[player];
        return (
            progress.totalXP,
            progress.level,
            progress.streak,
            progress.totalRewards,
            progress.completedQuests
        );
    }
    
    function getQuest(uint256 questId) external view returns (Quest memory) {
        return quests[questId];
    }
    
    function getActiveQuests() external view returns (uint256[] memory) {
        uint256[] memory activeQuests = new uint256[](questCount);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= questCount; i++) {
            if (quests[i].isActive) {
                activeQuests[count] = i;
                count++;
            }
        }
        
        return activeQuests;
    }
    
    // Admin functions
    function createQuest(
        string memory questType,
        address targetContract,
        uint256 minAmount,
        uint256 rewardTokens,
        uint256 rewardNFT,
        uint256 chainId,
        uint256 difficulty,
        uint256 timeLimit
    ) external onlyOwner {
        uint256 questId = questCount + 1;
        
        quests[questId] = Quest({
            id: questId,
            questType: questType,
            targetContract: targetContract,
            minAmount: minAmount,
            rewardTokens: rewardTokens,
            rewardNFT: rewardNFT,
            isActive: true,
            completionCount: 0,
            maxCompletions: 10000,
            chainId: chainId,
            eventSignature: keccak256(abi.encodePacked(questType)),
            difficulty: difficulty,
            timeLimit: timeLimit,
            startTime: block.timestamp,
            endTime: timeLimit > 0 ? block.timestamp + timeLimit : 0
        });
        
        questCount++;
        emit QuestGenerated(questId, questType, rewardTokens, chainId);
    }
    
    function toggleQuest(uint256 questId) external onlyOwner {
        quests[questId].isActive = !quests[questId].isActive;
    }
    
    // Helper functions
    function isSwapEvent(uint256 topic0) internal pure returns (bool) {
        return topic0 == keccak256("Swap(address,uint256,uint256,address)");
    }
    
    function isNFTEvent(uint256 topic0) internal pure returns (bool) {
        return topic0 == keccak256("Transfer(address,address,uint256)");
    }
    
    function isStakingEvent(uint256 topic0) internal pure returns (bool) {
        return topic0 == keccak256("Staked(address,uint256,uint256)");
    }
    
    function isLendingEvent(uint256 topic0) internal pure returns (bool) {
        return topic0 == keccak256("Lent(address,uint256,uint256)");
    }
    
    function isGovernanceEvent(uint256 topic0) internal pure returns (bool) {
        return topic0 == keccak256("VoteCast(address,uint256,uint256,uint256)");
    }
    
    function isBridgeEvent(uint256 topic0) internal pure returns (bool) {
        return topic0 == keccak256("BridgeTransfer(address,uint256,uint256,address)");
    }
    
    function shouldGenerateDynamicQuest(uint256 chainId, address contract) internal view returns (bool) {
        // Generate dynamic quests based on network activity and market conditions
        return getNetworkActivity(chainId) > 1000 && getMarketVolatility() > 50;
    }
    
    function getMarketVolatility() internal view returns (uint256) {
        // Placeholder for market volatility calculation
        return 75; // 75% volatility
    }
    
    function getGasPrice(uint256 chainId) internal view returns (uint256) {
        // Placeholder for gas price calculation
        return 20 gwei;
    }
    
    function getNetworkActivity(uint256 chainId) internal view returns (uint256) {
        // Placeholder for network activity calculation
        return 1500; // 1500 transactions per hour
    }
    
    function determineQuestType(address contract) internal view returns (string memory) {
        // Determine quest type based on contract address
        // This would be implemented with a mapping of known contract addresses
        return "swap";
    }
    
    function calculateBaseReward(uint256 volatility, uint256 gasPrice) internal pure returns (uint256) {
        // Calculate base reward based on market conditions
        uint256 baseReward = 100 * 10**18; // 100 tokens base
        uint256 volatilityBonus = (baseReward * volatility) / 100;
        uint256 gasBonus = gasPrice > 50 gwei ? baseReward / 2 : 0;
        
        return baseReward + volatilityBonus + gasBonus;
    }
    
    function calculateDifficulty(uint256 volatility) internal pure returns (uint256) {
        // Calculate difficulty based on market volatility
        if (volatility > 80) return 5; // Very hard
        if (volatility > 60) return 4; // Hard
        if (volatility > 40) return 3; // Medium
        if (volatility > 20) return 2; // Easy
        return 1; // Very easy
    }
}