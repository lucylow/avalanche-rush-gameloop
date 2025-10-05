// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IReactive.sol";
import "./AbstractReactive.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title ReactiveAchievementEngine
 * @dev Cross-chain achievement system using Reactive Network
 * @notice Maximizes Reactive Network usage while providing genuine gaming utility
 */
contract ReactiveAchievementEngine is AbstractReactive, ReentrancyGuard, Ownable {
    
    struct Achievement {
        uint256 id;
        string name;
        string description;
        uint256 rarity; // 1-1000 (1 = legendary, 1000 = common)
        uint256[] requiredChains;
        address[] requiredContracts;
        uint256[] requiredEvents;
        uint256 rewardTokens;
        uint256 rewardNFTId;
        bool isActive;
        uint256 totalEarned;
        uint256 category; // 1=game, 2=defi, 3=social, 4=governance, 5=cross-chain
        uint256 difficulty; // 1-5 scale
        uint256 timeLimit; // 0 = no limit
        uint256 startTime;
        uint256 endTime;
    }
    
    struct PlayerAchievements {
        mapping(uint256 => bool) earned;
        mapping(uint256 => uint256) progress;
        uint256[] unlockedAchievements;
        uint256 achievementScore;
        uint256 rarityScore;
        mapping(uint256 => uint256) categoryProgress; // category => count
        mapping(uint256 => uint256) chainActivity; // chainId => activity count
    }
    
    struct MetaAchievement {
        uint256 id;
        string name;
        uint256[] requiredAchievements;
        uint256 rewardMultiplier;
        bool isActive;
    }
    
    // State variables
    mapping(address => PlayerAchievements) public playerAchievements;
    mapping(uint256 => Achievement) public achievements;
    mapping(uint256 => MetaAchievement) public metaAchievements;
    mapping(bytes32 => bool) public eventProcessed;
    mapping(uint256 => uint256) public categoryCounts;
    mapping(uint256 => uint256) public chainCounts;
    
    // Achievement tracking
    uint256 public achievementCount;
    uint256 public metaAchievementCount;
    uint256 public totalAchievementsUnlocked;
    uint256 public totalRewardsDistributed;
    
    // Token and NFT contracts
    IERC20 public achievementToken;
    IERC721 public achievementNFT;
    
    // Events
    event AchievementUnlocked(address indexed player, uint256 indexed achievementId, uint256 rarity);
    event CrossChainAchievement(address indexed player, uint256 indexed achievementId, uint256[] chains);
    event RareAchievementMinted(address indexed player, uint256 indexed achievementId, uint256 rarity);
    event AchievementProgressUpdated(address indexed player, uint256 indexed achievementId, uint256 progress);
    event MetaAchievementUnlocked(address indexed player, uint256 indexed metaAchievementId);
    event SeasonalAchievementCreated(uint256 indexed achievementId, string name, uint256 duration);
    
    // Modifiers
    modifier onlyValidAchievement(uint256 achievementId) {
        require(achievements[achievementId].isActive, "Achievement not active");
        require(block.timestamp >= achievements[achievementId].startTime, "Achievement not started");
        require(achievements[achievementId].endTime == 0 || block.timestamp <= achievements[achievementId].endTime, "Achievement expired");
        _;
    }
    
    constructor(address _achievementToken, address _achievementNFT) {
        achievementToken = IERC20(_achievementToken);
        achievementNFT = IERC721(_achievementNFT);
    }
    
    /**
     * @dev Main reactive function for cross-chain achievement tracking
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
        
        // Process different achievement categories
        if (isGameEvent(topic_0)) {
            processGameAchievements(player, chain_id, _contract, data);
        } else if (isDeFiEvent(topic_0)) {
            processDeFiAchievements(player, chain_id, _contract, data);
        } else if (isSocialEvent(topic_0)) {
            processSocialAchievements(player, chain_id, _contract, data);
        } else if (isGovernanceEvent(topic_0)) {
            processGovernanceAchievements(player, chain_id, _contract, data);
        } else if (isCrossChainEvent(topic_0)) {
            processCrossChainAchievements(player, chain_id, _contract, data);
        }
        
        // Check for cross-chain achievements
        checkCrossChainAchievements(player);
        
        // Check for meta-achievements
        checkMetaAchievements(player);
    }
    
    /**
     * @dev Process game-related achievements
     */
    function processGameAchievements(address player, uint256 chainId, address contract, bytes calldata data) internal {
        // "First Victory" - Complete first game
        updateAchievementProgress(player, 1, 1);
        
        // "Speed Runner" - Complete game under 60 seconds
        (uint256 completionTime) = abi.decode(data, (uint256));
        if (completionTime < 60) {
            updateAchievementProgress(player, 2, 1);
        }
        
        // "Chain Hopper" - Play on multiple chains
        updateChainActivity(player, chainId);
        
        // "High Scorer" - Achieve score milestones
        (uint256 score) = abi.decode(data, (uint256));
        if (score >= 10000) updateAchievementProgress(player, 3, 1);
        if (score >= 50000) updateAchievementProgress(player, 4, 1);
        if (score >= 100000) updateAchievementProgress(player, 5, 1);
        
        // "Perfectionist" - Complete game without losing lives
        (uint256 lives) = abi.decode(data, (uint256));
        if (lives >= 3) {
            updateAchievementProgress(player, 6, 1);
        }
        
        // "Marathon Runner" - Play for 1 hour straight
        (uint256 sessionTime) = abi.decode(data, (uint256));
        if (sessionTime >= 3600) {
            updateAchievementProgress(player, 7, 1);
        }
    }
    
    /**
     * @dev Process DeFi-related achievements
     */
    function processDeFiAchievements(address player, uint256 chainId, address protocol, bytes calldata data) internal {
        // "DeFi Explorer" - Interact with 10 different protocols
        updateProtocolInteraction(player, protocol);
        
        // "Liquidity Provider" - Provide liquidity to DEX
        if (isLiquidityEvent(protocol)) {
            updateAchievementProgress(player, 10, 1);
        }
        
        // "Yield Farmer" - Stake in yield farming protocols
        if (isYieldFarmingEvent(protocol)) {
            updateAchievementProgress(player, 11, 1);
        }
        
        // "Governance Participant" - Vote in DAO proposals
        if (isGovernanceVote(protocol)) {
            updateAchievementProgress(player, 12, 1);
        }
        
        // "Risk Manager" - Use risk management protocols
        if (isRiskManagementEvent(protocol)) {
            updateAchievementProgress(player, 13, 1);
        }
        
        // "Arbitrageur" - Execute arbitrage trades
        if (isArbitrageEvent(protocol)) {
            updateAchievementProgress(player, 14, 1);
        }
    }
    
    /**
     * @dev Process social-related achievements
     */
    function processSocialAchievements(address player, uint256 chainId, address contract, bytes calldata data) internal {
        // "Social Butterfly" - Share achievements on social media
        if (isSocialShareEvent(contract)) {
            updateAchievementProgress(player, 20, 1);
        }
        
        // "Community Builder" - Refer multiple players
        if (isReferralEvent(contract)) {
            updateAchievementProgress(player, 21, 1);
        }
        
        // "Mentor" - Help new players
        if (isMentorshipEvent(contract)) {
            updateAchievementProgress(player, 22, 1);
        }
        
        // "Collaborator" - Participate in team events
        if (isTeamEvent(contract)) {
            updateAchievementProgress(player, 23, 1);
        }
    }
    
    /**
     * @dev Process governance-related achievements
     */
    function processGovernanceAchievements(address player, uint256 chainId, address protocol, bytes calldata data) internal {
        // "Governance Guru" - Vote in multiple DAOs
        if (isGovernanceVote(protocol)) {
            updateAchievementProgress(player, 30, 1);
        }
        
        // "Proposal Creator" - Create governance proposals
        if (isProposalCreation(protocol)) {
            updateAchievementProgress(player, 31, 1);
        }
        
        // "Delegator" - Delegate voting power
        if (isDelegationEvent(protocol)) {
            updateAchievementProgress(player, 32, 1);
        }
        
        // "Consensus Builder" - Vote with majority
        if (isConsensusVote(protocol)) {
            updateAchievementProgress(player, 33, 1);
        }
    }
    
    /**
     * @dev Process cross-chain achievements
     */
    function processCrossChainAchievements(address player, uint256 chainId, address bridge, bytes calldata data) internal {
        // "Bridge Master" - Use multiple bridges
        if (isBridgeEvent(bridge)) {
            updateAchievementProgress(player, 40, 1);
        }
        
        // "Multi-Chain Explorer" - Active on 3+ chains
        updateChainActivity(player, chainId);
        
        // "Cross-Chain Trader" - Trade on 5+ different chains
        if (isCrossChainTrade(bridge)) {
            updateAchievementProgress(player, 41, 1);
        }
        
        // "Omnichain Legend" - Active on all supported chains
        if (isOmnichainActivity(bridge)) {
            updateAchievementProgress(player, 42, 1);
        }
    }
    
    /**
     * @dev Update achievement progress
     */
    function updateAchievementProgress(address player, uint256 achievementId, uint256 progress) internal {
        if (playerAchievements[player].earned[achievementId]) return;
        
        playerAchievements[player].progress[achievementId] += progress;
        
        // Check if achievement is completed
        Achievement memory achievement = achievements[achievementId];
        if (playerAchievements[player].progress[achievementId] >= getAchievementRequirement(achievementId)) {
            unlockAchievement(player, achievementId);
        }
        
        emit AchievementProgressUpdated(player, achievementId, playerAchievements[player].progress[achievementId]);
    }
    
    /**
     * @dev Unlock achievement
     */
    function unlockAchievement(address player, uint256 achievementId) internal {
        if (playerAchievements[player].earned[achievementId]) return;
        
        playerAchievements[player].earned[achievementId] = true;
        playerAchievements[player].unlockedAchievements.push(achievementId);
        
        Achievement memory achievement = achievements[achievementId];
        playerAchievements[player].achievementScore += achievement.rewardTokens;
        playerAchievements[player].rarityScore += (1001 - achievement.rarity);
        playerAchievements[player].categoryProgress[achievement.category]++;
        
        // Update global stats
        achievements[achievementId].totalEarned++;
        totalAchievementsUnlocked++;
        totalRewardsDistributed += achievement.rewardTokens;
        
        // Award tokens and NFT
        awardAchievementRewards(player, achievementId);
        
        // Mint rare NFT for legendary achievements
        if (achievement.rarity <= 10) {
            mintRareAchievementNFT(player, achievementId);
            emit RareAchievementMinted(player, achievementId, achievement.rarity);
        }
        
        emit AchievementUnlocked(player, achievementId, achievement.rarity);
    }
    
    /**
     * @dev Check cross-chain achievements
     */
    function checkCrossChainAchievements(address player) internal {
        uint256[] memory activeChains = getPlayerActiveChains(player);
        
        // "Multi-Chain Master" - Active on 3+ chains
        if (activeChains.length >= 3) {
            unlockAchievement(player, 20);
        }
        
        // "Cross-Chain Trader" - Trade on 5+ different chains
        if (activeChains.length >= 5) {
            unlockAchievement(player, 21);
        }
        
        // "Omnichain Legend" - Active on all supported chains
        if (activeChains.length >= 8) {
            unlockAchievement(player, 22);
        }
    }
    
    /**
     * @dev Check meta-achievements
     */
    function checkMetaAchievements(address player) internal {
        for (uint256 i = 1; i <= metaAchievementCount; i++) {
            MetaAchievement memory metaAchievement = metaAchievements[i];
            if (metaAchievement.isActive && !playerAchievements[player].earned[i + 1000]) {
                if (isMetaAchievementCompleted(player, i)) {
                    unlockMetaAchievement(player, i);
                }
            }
        }
    }
    
    /**
     * @dev Check if meta-achievement is completed
     */
    function isMetaAchievementCompleted(address player, uint256 metaAchievementId) internal view returns (bool) {
        MetaAchievement memory metaAchievement = metaAchievements[metaAchievementId];
        
        for (uint256 i = 0; i < metaAchievement.requiredAchievements.length; i++) {
            uint256 requiredAchievement = metaAchievement.requiredAchievements[i];
            if (!playerAchievements[player].earned[requiredAchievement]) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * @dev Unlock meta-achievement
     */
    function unlockMetaAchievement(address player, uint256 metaAchievementId) internal {
        MetaAchievement memory metaAchievement = metaAchievements[metaAchievementId];
        
        // Award bonus rewards
        uint256 bonusRewards = calculateMetaAchievementReward(player, metaAchievementId);
        achievementToken.transfer(player, bonusRewards);
        
        emit MetaAchievementUnlocked(player, metaAchievementId);
    }
    
    /**
     * @dev Award achievement rewards
     */
    function awardAchievementRewards(address player, uint256 achievementId) internal {
        Achievement memory achievement = achievements[achievementId];
        
        // Award tokens
        if (achievement.rewardTokens > 0) {
            achievementToken.transfer(player, achievement.rewardTokens);
        }
        
        // Award NFT if specified
        if (achievement.rewardNFTId > 0) {
            achievementNFT.transferFrom(address(this), player, achievement.rewardNFTId);
        }
    }
    
    /**
     * @dev Mint rare achievement NFT
     */
    function mintRareAchievementNFT(address player, uint256 achievementId) internal {
        // Mint special NFT for rare achievements
        // This would integrate with the NFT contract
    }
    
    /**
     * @dev Update chain activity
     */
    function updateChainActivity(address player, uint256 chainId) internal {
        playerAchievements[player].chainActivity[chainId]++;
        chainCounts[chainId]++;
    }
    
    /**
     * @dev Update protocol interaction
     */
    function updateProtocolInteraction(address player, address protocol) internal {
        // Track protocol interactions for DeFi achievements
        // This would be implemented with a mapping
    }
    
    /**
     * @dev Create seasonal achievements
     */
    function createSeasonalAchievements() external onlyOwner {
        // Create time-limited achievements based on market events
        // "Bear Market Survivor" - Play during market downturns
        // "Bull Run Rider" - Achieve high scores during market pumps
        // "Holiday Trader" - Trade during specific holidays
        // "Anniversary Player" - Play during protocol anniversaries
        
        uint256 achievementId = achievementCount + 1;
        
        achievements[achievementId] = Achievement({
            id: achievementId,
            name: "Seasonal Achievement",
            description: "Time-limited achievement based on market conditions",
            rarity: 100, // Rare
            requiredChains: new uint256[](0),
            requiredContracts: new address[](0),
            requiredEvents: new uint256[](0),
            rewardTokens: 500 * 10**18,
            rewardNFTId: achievementId,
            isActive: true,
            totalEarned: 0,
            category: 5, // Cross-chain
            difficulty: 3, // Medium
            timeLimit: 7 days,
            startTime: block.timestamp,
            endTime: block.timestamp + 7 days
        });
        
        achievementCount++;
        
        emit SeasonalAchievementCreated(achievementId, "Seasonal Achievement", 7 days);
    }
    
    /**
     * @dev Generate dynamic achievements
     */
    function generateDynamicAchievements() external onlyOwner {
        // Create achievements based on real-time network activity
        // "Network Congestion Warrior" - Play during high gas periods
        // "Early Adopter" - First to use new protocol integrations
        // "Community Builder" - Refer multiple players
        // "Ecosystem Supporter" - Hold governance tokens
        
        uint256 networkActivity = getNetworkActivity();
        uint256 gasPrice = getGasPrice();
        
        if (gasPrice > 100 gwei) {
            // Create high gas achievement
            createDynamicAchievement("Network Congestion Warrior", 200, 5);
        }
        
        if (networkActivity > 10000) {
            // Create high activity achievement
            createDynamicAchievement("Network Activity Champion", 300, 4);
        }
    }
    
    /**
     * @dev Create dynamic achievement
     */
    function createDynamicAchievement(string memory name, uint256 reward, uint256 difficulty) internal {
        uint256 achievementId = achievementCount + 1;
        
        achievements[achievementId] = Achievement({
            id: achievementId,
            name: name,
            description: "Dynamically generated achievement",
            rarity: calculateDynamicRarity(difficulty),
            requiredChains: new uint256[](0),
            requiredContracts: new address[](0),
            requiredEvents: new uint256[](0),
            rewardTokens: reward * 10**18,
            rewardNFTId: achievementId,
            isActive: true,
            totalEarned: 0,
            category: 5, // Cross-chain
            difficulty: difficulty,
            timeLimit: 24 hours,
            startTime: block.timestamp,
            endTime: block.timestamp + 24 hours
        });
        
        achievementCount++;
    }
    
    // View functions
    function getPlayerAchievements(address player) external view returns (
        uint256[] memory unlockedAchievements,
        uint256 achievementScore,
        uint256 rarityScore,
        uint256[] memory categoryProgress,
        uint256[] memory chainActivity
    ) {
        PlayerAchievements storage achievements = playerAchievements[player];
        return (
            achievements.unlockedAchievements,
            achievements.achievementScore,
            achievements.rarityScore,
            getCategoryProgressArray(achievements),
            getChainActivityArray(achievements)
        );
    }
    
    function getAchievement(uint256 achievementId) external view returns (Achievement memory) {
        return achievements[achievementId];
    }
    
    function getActiveAchievements() external view returns (uint256[] memory) {
        uint256[] memory activeAchievements = new uint256[](achievementCount);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= achievementCount; i++) {
            if (achievements[i].isActive) {
                activeAchievements[count] = i;
                count++;
            }
        }
        
        return activeAchievements;
    }
    
    function calculateAchievementRarity(uint256 achievementId) public view returns (uint256) {
        Achievement memory achievement = achievements[achievementId];
        uint256 totalPlayers = getTotalPlayers();
        
        if (totalPlayers == 0) return 1000;
        
        uint256 completionRate = (achievement.totalEarned * 1000) / totalPlayers;
        
        // Rarity based on completion rate
        if (completionRate <= 1) return 1;      // Legendary (0.1%)
        if (completionRate <= 5) return 10;     // Epic (0.5%)
        if (completionRate <= 25) return 50;    // Rare (2.5%)
        if (completionRate <= 100) return 200;  // Uncommon (10%)
        return 500;                             // Common (50%+)
    }
    
    // Helper functions
    function isGameEvent(uint256 topic0) internal pure returns (bool) {
        return topic0 == keccak256("GameCompleted(address,uint256,uint256,uint256)");
    }
    
    function isDeFiEvent(uint256 topic0) internal pure returns (bool) {
        return topic0 == keccak256("Swap(address,uint256,uint256,address)") ||
               topic0 == keccak256("Lent(address,uint256,uint256)") ||
               topic0 == keccak256("Staked(address,uint256,uint256)");
    }
    
    function isSocialEvent(uint256 topic0) internal pure returns (bool) {
        return topic0 == keccak256("SocialShare(address,string,uint256)");
    }
    
    function isGovernanceEvent(uint256 topic0) internal pure returns (bool) {
        return topic0 == keccak256("VoteCast(address,uint256,uint256,uint256)");
    }
    
    function isCrossChainEvent(uint256 topic0) internal pure returns (bool) {
        return topic0 == keccak256("BridgeTransfer(address,uint256,uint256,address)");
    }
    
    function isLiquidityEvent(address protocol) internal pure returns (bool) {
        // Check if protocol is a liquidity provider
        return true; // Placeholder
    }
    
    function isYieldFarmingEvent(address protocol) internal pure returns (bool) {
        // Check if protocol is a yield farming protocol
        return true; // Placeholder
    }
    
    function isGovernanceVote(address protocol) internal pure returns (bool) {
        // Check if protocol is a governance protocol
        return true; // Placeholder
    }
    
    function isRiskManagementEvent(address protocol) internal pure returns (bool) {
        // Check if protocol is a risk management protocol
        return true; // Placeholder
    }
    
    function isArbitrageEvent(address protocol) internal pure returns (bool) {
        // Check if protocol is an arbitrage protocol
        return true; // Placeholder
    }
    
    function isSocialShareEvent(address contract) internal pure returns (bool) {
        // Check if contract is a social sharing contract
        return true; // Placeholder
    }
    
    function isReferralEvent(address contract) internal pure returns (bool) {
        // Check if contract is a referral contract
        return true; // Placeholder
    }
    
    function isMentorshipEvent(address contract) internal pure returns (bool) {
        // Check if contract is a mentorship contract
        return true; // Placeholder
    }
    
    function isTeamEvent(address contract) internal pure returns (bool) {
        // Check if contract is a team event contract
        return true; // Placeholder
    }
    
    function isProposalCreation(address protocol) internal pure returns (bool) {
        // Check if protocol is a proposal creation protocol
        return true; // Placeholder
    }
    
    function isDelegationEvent(address protocol) internal pure returns (bool) {
        // Check if protocol is a delegation protocol
        return true; // Placeholder
    }
    
    function isConsensusVote(address protocol) internal pure returns (bool) {
        // Check if protocol is a consensus voting protocol
        return true; // Placeholder
    }
    
    function isBridgeEvent(address bridge) internal pure returns (bool) {
        // Check if bridge is a cross-chain bridge
        return true; // Placeholder
    }
    
    function isCrossChainTrade(address bridge) internal pure returns (bool) {
        // Check if bridge is used for cross-chain trading
        return true; // Placeholder
    }
    
    function isOmnichainActivity(address bridge) internal pure returns (bool) {
        // Check if bridge supports omnichain activity
        return true; // Placeholder
    }
    
    function getAchievementRequirement(uint256 achievementId) internal view returns (uint256) {
        // Return requirement for achievement completion
        return 1; // Placeholder
    }
    
    function getPlayerActiveChains(address player) internal view returns (uint256[] memory) {
        // Return array of chains where player is active
        uint256[] memory chains = new uint256[](8);
        // This would be populated with actual chain data
        return chains;
    }
    
    function calculateMetaAchievementReward(address player, uint256 metaAchievementId) internal view returns (uint256) {
        // Calculate reward for meta-achievement
        return 1000 * 10**18; // Placeholder
    }
    
    function getTotalPlayers() internal view returns (uint256) {
        // Return total number of players
        return 1000; // Placeholder
    }
    
    function getNetworkActivity() internal view returns (uint256) {
        // Return current network activity
        return 5000; // Placeholder
    }
    
    function getGasPrice() internal view returns (uint256) {
        // Return current gas price
        return 50 gwei; // Placeholder
    }
    
    function calculateDynamicRarity(uint256 difficulty) internal pure returns (uint256) {
        // Calculate rarity based on difficulty
        if (difficulty >= 5) return 10;   // Epic
        if (difficulty >= 4) return 50;   // Rare
        if (difficulty >= 3) return 200;  // Uncommon
        return 500;                       // Common
    }
    
    function getCategoryProgressArray(PlayerAchievements storage achievements) internal view returns (uint256[] memory) {
        uint256[] memory progress = new uint256[](5);
        for (uint256 i = 1; i <= 5; i++) {
            progress[i-1] = achievements.categoryProgress[i];
        }
        return progress;
    }
    
    function getChainActivityArray(PlayerAchievements storage achievements) internal view returns (uint256[] memory) {
        uint256[] memory activity = new uint256[](8);
        for (uint256 i = 1; i <= 8; i++) {
            activity[i-1] = achievements.chainActivity[i];
        }
        return activity;
    }
}
