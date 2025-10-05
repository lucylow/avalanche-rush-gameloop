// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./RushToken.sol";

/**
 * @title SubscriptionManager
 * @dev Manages premium subscriptions for Avalanche Rush
 * @notice Handles subscription tiers, payments, and reward multipliers
 */
contract SubscriptionManager is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // Subscription tiers
    enum SubscriptionTier {
        FREE,      // 0 - Free tier
        PREMIUM,   // 1 - Premium tier
        PRO        // 2 - Pro tier
    }
    
    // User subscription structure
    struct UserSubscription {
        SubscriptionTier tier;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        uint256 totalPaid;
        uint256 renewalCount;
    }
    
    // Subscription plan structure
    struct SubscriptionPlan {
        string name;
        uint256 price; // Price in AVAX (wei)
        uint256 duration; // Duration in seconds
        uint256 rewardMultiplier; // Reward multiplier (100 = 1x, 200 = 2x)
        bool isActive;
        string[] features;
    }
    
    // State variables
    mapping(address => UserSubscription) public subscriptions;
    mapping(SubscriptionTier => SubscriptionPlan) public plans;
    mapping(address => uint256) public userRewardMultipliers;
    
    // Statistics
    uint256 public totalSubscribers;
    uint256 public totalRevenue;
    mapping(SubscriptionTier => uint256) public tierSubscriberCounts;
    mapping(SubscriptionTier => uint256) public tierRevenue;
    
    // Events
    event SubscriptionCreated(
        address indexed user,
        SubscriptionTier tier,
        uint256 startTime,
        uint256 endTime,
        uint256 price
    );
    event SubscriptionRenewed(
        address indexed user,
        SubscriptionTier tier,
        uint256 newEndTime,
        uint256 price
    );
    event SubscriptionCancelled(address indexed user);
    event PlanUpdated(SubscriptionTier tier, uint256 price, uint256 duration);
    event RewardMultiplierUpdated(address indexed user, uint256 newMultiplier);
    
    // RushToken contract
    RushToken public rushToken;
    
    constructor(address _rushToken) {
        rushToken = RushToken(_rushToken);
        
        // Initialize subscription plans
        plans[SubscriptionTier.FREE] = SubscriptionPlan({
            name: "Free",
            price: 0,
            duration: 0,
            rewardMultiplier: 100, // 1x
            isActive: true,
            features: new string[](0)
        });
        
        plans[SubscriptionTier.PREMIUM] = SubscriptionPlan({
            name: "Premium",
            price: 0.01 ether, // 0.01 AVAX
            duration: 30 days,
            rewardMultiplier: 200, // 2x
            isActive: true,
            features: new string[](0)
        });
        
        plans[SubscriptionTier.PRO] = SubscriptionPlan({
            name: "Pro",
            price: 0.02 ether, // 0.02 AVAX
            duration: 30 days,
            rewardMultiplier: 300, // 3x
            isActive: true,
            features: new string[](0)
        });
    }
    
    /**
     * @dev Subscribe to a premium tier
     * @param tier Subscription tier
     */
    function subscribe(SubscriptionTier tier) external payable nonReentrant {
        require(tier != SubscriptionTier.FREE, "SubscriptionManager: Cannot subscribe to free tier");
        require(plans[tier].isActive, "SubscriptionManager: Plan not active");
        require(msg.value >= plans[tier].price, "SubscriptionManager: Insufficient payment");
        
        UserSubscription storage userSub = subscriptions[msg.sender];
        
        // If user already has an active subscription, extend it
        if (userSub.isActive && userSub.endTime > block.timestamp) {
            userSub.endTime += plans[tier].duration;
            userSub.totalPaid += msg.value;
            userSub.renewalCount++;
            
            emit SubscriptionRenewed(msg.sender, tier, userSub.endTime, msg.value);
        } else {
            // Create new subscription
            userSub.tier = tier;
            userSub.startTime = block.timestamp;
            userSub.endTime = block.timestamp + plans[tier].duration;
            userSub.isActive = true;
            userSub.totalPaid = msg.value;
            userSub.renewalCount = 1;
            
            // Update statistics
            if (userSub.renewalCount == 1) {
                totalSubscribers++;
                tierSubscriberCounts[tier]++;
            }
            
            emit SubscriptionCreated(msg.sender, tier, userSub.startTime, userSub.endTime, msg.value);
        }
        
        // Update reward multiplier
        userRewardMultipliers[msg.sender] = plans[tier].rewardMultiplier;
        
        // Update revenue statistics
        totalRevenue += msg.value;
        tierRevenue[tier] += msg.value;
        
        // Transfer AVAX to owner
        payable(owner()).transfer(msg.value);
        
        emit RewardMultiplierUpdated(msg.sender, plans[tier].rewardMultiplier);
    }
    
    /**
     * @dev Cancel subscription
     */
    function cancelSubscription() external {
        UserSubscription storage userSub = subscriptions[msg.sender];
        require(userSub.isActive, "SubscriptionManager: No active subscription");
        
        userSub.isActive = false;
        
        // Reset reward multiplier
        userRewardMultipliers[msg.sender] = 100; // 1x
        
        emit SubscriptionCancelled(msg.sender);
        emit RewardMultiplierUpdated(msg.sender, 100);
    }
    
    /**
     * @dev Get user's current reward multiplier
     * @param user User address
     * @return multiplier Current reward multiplier (100 = 1x)
     */
    function getRewardMultiplier(address user) external view returns (uint256 multiplier) {
        UserSubscription memory userSub = subscriptions[user];
        
        if (!userSub.isActive || userSub.endTime < block.timestamp) {
            return 100; // 1x for expired/inactive subscriptions
        }
        
        return userRewardMultipliers[user];
    }
    
    /**
     * @dev Check if user has active subscription
     * @param user User address
     * @return isActive Whether user has active subscription
     */
    function hasActiveSubscription(address user) external view returns (bool isActive) {
        UserSubscription memory userSub = subscriptions[user];
        return userSub.isActive && userSub.endTime > block.timestamp;
    }
    
    /**
     * @dev Get user subscription details
     * @param user User address
     * @return subscription User subscription details
     */
    function getUserSubscription(address user) external view returns (UserSubscription memory subscription) {
        return subscriptions[user];
    }
    
    /**
     * @dev Get subscription plan details
     * @param tier Subscription tier
     * @return plan Plan details
     */
    function getSubscriptionPlan(SubscriptionTier tier) external view returns (SubscriptionPlan memory plan) {
        return plans[tier];
    }
    
    /**
     * @dev Update subscription plan
     * @param tier Subscription tier
     * @param price New price in AVAX (wei)
     * @param duration New duration in seconds
     * @param rewardMultiplier New reward multiplier
     * @param features New features array
     */
    function updateSubscriptionPlan(
        SubscriptionTier tier,
        uint256 price,
        uint256 duration,
        uint256 rewardMultiplier,
        string[] memory features
    ) external onlyOwner {
        plans[tier].price = price;
        plans[tier].duration = duration;
        plans[tier].rewardMultiplier = rewardMultiplier;
        plans[tier].features = features;
        
        emit PlanUpdated(tier, price, duration);
    }
    
    /**
     * @dev Set plan active status
     * @param tier Subscription tier
     * @param isActive Whether plan is active
     */
    function setPlanActive(SubscriptionTier tier, bool isActive) external onlyOwner {
        plans[tier].isActive = isActive;
    }
    
    /**
     * @dev Get subscription statistics
     * @return stats Array of statistics
     */
    function getSubscriptionStats() external view returns (
        uint256 totalSubscribers_,
        uint256 totalRevenue_,
        uint256[3] memory tierSubscriberCounts_,
        uint256[3] memory tierRevenue_
    ) {
        totalSubscribers_ = totalSubscribers;
        totalRevenue_ = totalRevenue;
        
        for (uint256 i = 0; i < 3; i++) {
            tierSubscriberCounts_[i] = tierSubscriberCounts[SubscriptionTier(i)];
            tierRevenue_[i] = tierRevenue[SubscriptionTier(i)];
        }
    }
    
    /**
     * @dev Get active subscribers count
     * @return count Number of active subscribers
     */
    function getActiveSubscribersCount() external view returns (uint256 count) {
        // This would require iterating through all subscribers
        // For gas efficiency, this should be maintained off-chain
        // or use a different approach for large-scale applications
        return totalSubscribers; // Approximation
    }
    
    /**
     * @dev Emergency function to pause all subscriptions
     */
    function emergencyPause() external onlyOwner {
        plans[SubscriptionTier.PREMIUM].isActive = false;
        plans[SubscriptionTier.PRO].isActive = false;
    }
    
    /**
     * @dev Emergency function to resume all subscriptions
     */
    function emergencyResume() external onlyOwner {
        plans[SubscriptionTier.PREMIUM].isActive = true;
        plans[SubscriptionTier.PRO].isActive = true;
    }
    
    /**
     * @dev Withdraw AVAX from contract
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "SubscriptionManager: No balance to withdraw");
        
        payable(owner()).transfer(balance);
    }
}
