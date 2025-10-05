// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title ReactiveBountySystem - Automated bounty distribution for quest completion
 * @dev Based on Reactive Network's bounty system patterns
 * @notice Manages automated rewards for quest completion triggered by cross-chain events
 */
contract ReactiveBountySystem is Ownable, ReentrancyGuard {
    
    // ============ STRUCTS ============
    
    struct Bounty {
        address token; // Token address (address(0) for native AVAX)
        uint256 amount; // Bounty amount
        bool isActive;
        uint256 createdAt;
        uint256 distributedCount;
        uint256 maxDistributions; // 0 for unlimited
    }
    
    struct PlayerReward {
        uint256 totalEarned;
        uint256 lastClaimed;
        uint256[] completedQuests;
    }
    
    // ============ STATE VARIABLES ============
    
    mapping(uint256 => Bounty) public bounties; // questId => bounty
    mapping(address => PlayerReward) public playerRewards;
    
    uint256 public totalBountiesDistributed;
    uint256 public totalPlayersRewarded;
    
    // ============ EVENTS ============
    
    event BountyCreated(
        uint256 indexed questId,
        address indexed token,
        uint256 amount,
        uint256 maxDistributions
    );
    
    event BountyDistributed(
        uint256 indexed questId,
        address indexed player,
        address indexed token,
        uint256 amount
    );
    
    event RewardClaimed(
        address indexed player,
        address indexed token,
        uint256 amount
    );
    
    // ============ MODIFIERS ============
    
    modifier onlyQuestEngine() {
        require(msg.sender == questEngine, "Only quest engine can distribute bounties");
        _;
    }
    
    // ============ STATE VARIABLES ============
    
    address public questEngine;
    
    // ============ CONSTRUCTOR ============
    
    constructor() {
        // Initial setup
    }
    
    // ============ EXTERNAL FUNCTIONS ============
    
    /**
     * @dev Set the quest engine address (only owner)
     */
    function setQuestEngine(address _questEngine) external onlyOwner {
        questEngine = _questEngine;
    }
    
    /**
     * @dev Create a bounty for a quest
     * @param questId The quest ID
     * @param token The reward token (address(0) for native AVAX)
     * @param amount The reward amount
     * @param maxDistributions Maximum number of distributions (0 for unlimited)
     */
    function createBounty(
        uint256 questId,
        address token,
        uint256 amount,
        uint256 maxDistributions
    ) external onlyOwner {
        require(bounties[questId].createdAt == 0, "Bounty already exists");
        require(amount > 0, "Bounty amount must be positive");
        
        bounties[questId] = Bounty({
            token: token,
            amount: amount,
            isActive: true,
            createdAt: block.timestamp,
            distributedCount: 0,
            maxDistributions: maxDistributions
        });
        
        emit BountyCreated(questId, token, amount, maxDistributions);
    }
    
    /**
     * @dev Distribute bounty for quest completion (called by quest engine)
     * @param questId The completed quest ID
     * @param player The player who completed the quest
     */
    function distributeBounty(
        uint256 questId,
        address player
    ) external onlyQuestEngine nonReentrant {
        Bounty storage bounty = bounties[questId];
        require(bounty.isActive, "Bounty not active");
        require(bounty.createdAt > 0, "Bounty does not exist");
        require(bounty.amount > 0, "Bounty amount is zero");
        
        // Check distribution limits
        if (bounty.maxDistributions > 0) {
            require(bounty.distributedCount < bounty.maxDistributions, "Bounty distribution limit reached");
        }
        
        // Update bounty stats
        bounty.distributedCount++;
        
        // Update player rewards
        PlayerReward storage reward = playerRewards[player];
        reward.totalEarned += bounty.amount;
        reward.lastClaimed = block.timestamp;
        reward.completedQuests.push(questId);
        
        // Update global stats
        totalBountiesDistributed++;
        if (reward.completedQuests.length == 1) {
            totalPlayersRewarded++;
        }
        
        emit BountyDistributed(questId, player, bounty.token, bounty.amount);
    }
    
    /**
     * @dev Claim accumulated rewards
     * @param player The player claiming rewards
     */
    function claimRewards(address player) external nonReentrant {
        PlayerReward storage reward = playerRewards[player];
        require(reward.totalEarned > 0, "No rewards to claim");
        
        uint256 claimAmount = reward.totalEarned;
        reward.totalEarned = 0;
        
        // For native AVAX bounties, we would need to handle ETH transfers
        // For ERC20 tokens, we would transfer from this contract
        // This is a simplified version - in production, you'd implement proper token transfers
        
        emit RewardClaimed(player, address(0), claimAmount);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get bounty details
     */
    function getBounty(uint256 questId) external view returns (
        address token,
        uint256 amount,
        bool isActive,
        uint256 createdAt,
        uint256 distributedCount,
        uint256 maxDistributions
    ) {
        Bounty storage bounty = bounties[questId];
        return (
            bounty.token,
            bounty.amount,
            bounty.isActive,
            bounty.createdAt,
            bounty.distributedCount,
            bounty.maxDistributions
        );
    }
    
    /**
     * @dev Get player reward details
     */
    function getPlayerReward(address player) external view returns (
        uint256 totalEarned,
        uint256 lastClaimed,
        uint256[] memory completedQuests
    ) {
        PlayerReward storage reward = playerRewards[player];
        return (
            reward.totalEarned,
            reward.lastClaimed,
            reward.completedQuests
        );
    }
    
    /**
     * @dev Get system statistics
     */
    function getSystemStats() external view returns (
        uint256 totalBounties,
        uint256 totalPlayers,
        uint256 totalDistributed
    ) {
        return (
            totalBountiesDistributed,
            totalPlayersRewarded,
            totalBountiesDistributed
        );
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Toggle bounty active status
     */
    function toggleBounty(uint256 questId, bool isActive) external onlyOwner {
        require(bounties[questId].createdAt > 0, "Bounty does not exist");
        bounties[questId].isActive = isActive;
    }
    
    /**
     * @dev Update bounty amount
     */
    function updateBountyAmount(uint256 questId, uint256 newAmount) external onlyOwner {
        require(bounties[questId].createdAt > 0, "Bounty does not exist");
        require(newAmount > 0, "Amount must be positive");
        bounties[questId].amount = newAmount;
    }
    
    /**
     * @dev Emergency function to pause all bounties
     */
    function emergencyPause() external onlyOwner {
        // In production, implement proper pause functionality
    }
    
    /**
     * @dev Emergency function to resume all bounties
     */
    function emergencyResume() external onlyOwner {
        // In production, implement proper resume functionality
    }
}
