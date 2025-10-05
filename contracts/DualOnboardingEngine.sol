// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./RushToken.sol";
import "./EducationalNFT.sol";

/**
 * @title DualOnboardingEngine
 * @dev Handles both Web2 and Web3 user onboarding with unified rewards
 * @notice Supports email signup, card payments, wallet connection, and NFT rewards
 */
contract DualOnboardingEngine is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;

    // User types
    enum UserType {
        WEB2,      // Email-based user
        WEB3,      // Wallet-based user
        HYBRID     // Both email and wallet
    }

    // Subscription tiers
    enum SubscriptionTier {
        FREE,
        PREMIUM,
        PRO
    }

    // Payment methods
    enum PaymentMethod {
        CREDIT_CARD,
        PAYPAL,
        CRYPTO,
        WALLET_CONNECT
    }

    // User profile structure
    struct UserProfile {
        address walletAddress;
        string email;
        string username;
        UserType userType;
        SubscriptionTier subscriptionTier;
        uint256 subscriptionExpiry;
        bool isActive;
        uint256 totalRewardsEarned;
        uint256 nftCount;
        uint256 createdAt;
        uint256 lastLogin;
        mapping(string => uint256) achievements;
        mapping(string => bool) features;
    }

    // Payment record structure
    struct PaymentRecord {
        address user;
        PaymentMethod method;
        uint256 amount;
        string currency;
        SubscriptionTier tier;
        uint256 timestamp;
        string transactionId;
        bool processed;
    }

    // Welcome reward structure
    struct WelcomeReward {
        uint256 rushTokens;
        uint256 nftId;
        uint256 premiumDays;
        bool claimed;
    }

    // State variables
    mapping(address => UserProfile) public users;
    mapping(string => address) public emailToAddress;
    mapping(address => bool) public registeredUsers;
    mapping(address => WelcomeReward) public welcomeRewards;
    mapping(uint256 => PaymentRecord) public payments;
    
    Counters.Counter private _paymentCounter;
    Counters.Counter private _userCounter;

    // Contract addresses
    RushToken public rushToken;
    EducationalNFT public educationalNFT;
    
    // Pricing (in wei)
    uint256 public premiumPrice = 0.01 ether; // 0.01 AVAX
    uint256 public proPrice = 0.02 ether;     // 0.02 AVAX
    
    // USD pricing (for Web2 payments)
    uint256 public premiumPriceUSD = 999; // $9.99 in cents
    uint256 public proPriceUSD = 1999;    // $19.99 in cents
    
    // Statistics
    uint256 public totalUsers;
    uint256 public totalRevenue;
    uint256 public totalRewardsDistributed;
    uint256 public totalNFTsMinted;

    // Events
    event UserRegistered(
        address indexed user,
        UserType userType,
        string email,
        string username
    );
    event SubscriptionPurchased(
        address indexed user,
        SubscriptionTier tier,
        PaymentMethod method,
        uint256 amount,
        string currency
    );
    event WelcomeRewardClaimed(
        address indexed user,
        uint256 rushTokens,
        uint256 nftId
    );
    event WalletLinked(
        address indexed user,
        address walletAddress
    );
    event EmailLinked(
        address indexed user,
        string email
    );
    event PaymentProcessed(
        uint256 indexed paymentId,
        address indexed user,
        PaymentMethod method,
        uint256 amount
    );

    // Modifiers
    modifier onlyRegisteredUser() {
        require(registeredUsers[msg.sender], "User not registered");
        _;
    }

    modifier validSubscriptionTier(SubscriptionTier tier) {
        require(tier == SubscriptionTier.PREMIUM || tier == SubscriptionTier.PRO, "Invalid tier");
        _;
    }

    constructor(address _rushToken, address _educationalNFT) {
        rushToken = RushToken(_rushToken);
        educationalNFT = EducationalNFT(_educationalNFT);
    }

    /**
     * @dev Register a new Web2 user (email-based)
     * @param email User's email address
     * @param username User's chosen username
     */
    function registerWeb2User(
        string calldata email,
        string calldata username
    ) external nonReentrant {
        require(!registeredUsers[msg.sender], "User already registered");
        require(emailToAddress[email] == address(0), "Email already in use");
        require(bytes(email).length > 0, "Email required");
        require(bytes(username).length > 0, "Username required");

        // Create user profile
        UserProfile storage user = users[msg.sender];
        user.walletAddress = msg.sender;
        user.email = email;
        user.username = username;
        user.userType = UserType.WEB2;
        user.subscriptionTier = SubscriptionTier.FREE;
        user.isActive = true;
        user.createdAt = block.timestamp;
        user.lastLogin = block.timestamp;

        // Set default features
        user.features["basic_game"] = true;
        user.features["community"] = true;

        // Update mappings
        emailToAddress[email] = msg.sender;
        registeredUsers[msg.sender] = true;
        totalUsers++;

        // Create welcome reward
        welcomeRewards[msg.sender] = WelcomeReward({
            rushTokens: 1000 * 10**18, // 1000 RUSH tokens
            nftId: 0, // Will be set when NFT is minted
            premiumDays: 7, // 7 days of premium access
            claimed: false
        });

        emit UserRegistered(msg.sender, UserType.WEB2, email, username);
    }

    /**
     * @dev Register a new Web3 user (wallet-based)
     * @param username User's chosen username
     */
    function registerWeb3User(string calldata username) external nonReentrant {
        require(!registeredUsers[msg.sender], "User already registered");
        require(bytes(username).length > 0, "Username required");

        // Create user profile
        UserProfile storage user = users[msg.sender];
        user.walletAddress = msg.sender;
        user.username = username;
        user.userType = UserType.WEB3;
        user.subscriptionTier = SubscriptionTier.FREE;
        user.isActive = true;
        user.createdAt = block.timestamp;
        user.lastLogin = block.timestamp;

        // Set default features
        user.features["basic_game"] = true;
        user.features["community"] = true;
        user.features["nft_rewards"] = true;
        user.features["crypto_payments"] = true;

        // Update mappings
        registeredUsers[msg.sender] = true;
        totalUsers++;

        // Create welcome reward
        welcomeRewards[msg.sender] = WelcomeReward({
            rushTokens: 1500 * 10**18, // 1500 RUSH tokens (more for Web3 users)
            nftId: 0, // Will be set when NFT is minted
            premiumDays: 7, // 7 days of premium access
            claimed: false
        });

        emit UserRegistered(msg.sender, UserType.WEB3, "", username);
    }

    /**
     * @dev Link wallet to existing Web2 user
     * @param walletAddress Wallet address to link
     */
    function linkWallet(address walletAddress) external onlyRegisteredUser {
        UserProfile storage user = users[msg.sender];
        require(user.userType == UserType.WEB2, "User must be Web2 type");
        require(walletAddress != address(0), "Invalid wallet address");

        // Update user type to hybrid
        user.userType = UserType.HYBRID;
        user.walletAddress = walletAddress;

        // Enable Web3 features
        user.features["nft_rewards"] = true;
        user.features["crypto_payments"] = true;

        emit WalletLinked(msg.sender, walletAddress);
    }

    /**
     * @dev Link email to existing Web3 user
     * @param email Email address to link
     */
    function linkEmail(string calldata email) external onlyRegisteredUser {
        UserProfile storage user = users[msg.sender];
        require(user.userType == UserType.WEB3, "User must be Web3 type");
        require(emailToAddress[email] == address(0), "Email already in use");
        require(bytes(email).length > 0, "Email required");

        // Update user type to hybrid
        user.userType = UserType.HYBRID;
        user.email = email;

        // Update mapping
        emailToAddress[email] = msg.sender;

        emit EmailLinked(msg.sender, email);
    }

    /**
     * @dev Purchase subscription with crypto payment
     * @param tier Subscription tier to purchase
     */
    function purchaseSubscriptionCrypto(
        SubscriptionTier tier
    ) external payable nonReentrant onlyRegisteredUser validSubscriptionTier(tier) {
        uint256 requiredAmount = tier == SubscriptionTier.PREMIUM ? premiumPrice : proPrice;
        require(msg.value >= requiredAmount, "Insufficient payment");

        UserProfile storage user = users[msg.sender];
        user.subscriptionTier = tier;
        user.subscriptionExpiry = block.timestamp + 30 days; // 30 days subscription

        // Record payment
        _paymentCounter.increment();
        uint256 paymentId = _paymentCounter.current();
        payments[paymentId] = PaymentRecord({
            user: msg.sender,
            method: PaymentMethod.CRYPTO,
            amount: msg.value,
            currency: "AVAX",
            tier: tier,
            timestamp: block.timestamp,
            transactionId: string(abi.encodePacked("crypto_", paymentId)),
            processed: true
        });

        // Update statistics
        totalRevenue += msg.value;

        emit SubscriptionPurchased(msg.sender, tier, PaymentMethod.CRYPTO, msg.value, "AVAX");
        emit PaymentProcessed(paymentId, msg.sender, PaymentMethod.CRYPTO, msg.value);
    }

    /**
     * @dev Process Web2 payment (called by backend)
     * @param user User address
     * @param tier Subscription tier
     * @param amount Payment amount in cents
     * @param transactionId External transaction ID
     */
    function processWeb2Payment(
        address user,
        SubscriptionTier tier,
        uint256 amount,
        string calldata transactionId
    ) external onlyOwner validSubscriptionTier(tier) {
        require(registeredUsers[user], "User not registered");

        UserProfile storage userProfile = users[user];
        userProfile.subscriptionTier = tier;
        userProfile.subscriptionExpiry = block.timestamp + 30 days;

        // Record payment
        _paymentCounter.increment();
        uint256 paymentId = _paymentCounter.current();
        payments[paymentId] = PaymentRecord({
            user: user,
            method: PaymentMethod.CREDIT_CARD,
            amount: amount,
            currency: "USD",
            tier: tier,
            timestamp: block.timestamp,
            transactionId: transactionId,
            processed: true
        });

        // Update statistics
        totalRevenue += amount;

        emit SubscriptionPurchased(user, tier, PaymentMethod.CREDIT_CARD, amount, "USD");
        emit PaymentProcessed(paymentId, user, PaymentMethod.CREDIT_CARD, amount);
    }

    /**
     * @dev Claim welcome rewards
     */
    function claimWelcomeRewards() external nonReentrant onlyRegisteredUser {
        WelcomeReward storage reward = welcomeRewards[msg.sender];
        require(!reward.claimed, "Rewards already claimed");

        UserProfile storage user = users[msg.sender];

        // Mint RUSH tokens
        rushToken.mint(msg.sender, reward.rushTokens);
        user.totalRewardsEarned += reward.rushTokens;

        // Mint welcome NFT
        uint256 nftId = educationalNFT.mintWelcomeNFT(msg.sender);
        reward.nftId = nftId;
        user.nftCount++;
        totalNFTsMinted++;

        // Grant premium access
        if (user.subscriptionTier == SubscriptionTier.FREE) {
            user.subscriptionTier = SubscriptionTier.PREMIUM;
            user.subscriptionExpiry = block.timestamp + (reward.premiumDays * 1 days);
        }

        // Mark as claimed
        reward.claimed = true;
        totalRewardsDistributed += reward.rushTokens;

        emit WelcomeRewardClaimed(msg.sender, reward.rushTokens, nftId);
    }

    /**
     * @dev Update user login timestamp
     */
    function updateLogin() external onlyRegisteredUser {
        users[msg.sender].lastLogin = block.timestamp;
    }

    /**
     * @dev Get user profile
     * @param user User address
     * @return profile User profile data
     */
    function getUserProfile(address user) external view returns (
        address walletAddress,
        string memory email,
        string memory username,
        UserType userType,
        SubscriptionTier subscriptionTier,
        uint256 subscriptionExpiry,
        bool isActive,
        uint256 totalRewardsEarned,
        uint256 nftCount,
        uint256 createdAt,
        uint256 lastLogin
    ) {
        UserProfile storage profile = users[user];
        return (
            profile.walletAddress,
            profile.email,
            profile.username,
            profile.userType,
            profile.subscriptionTier,
            profile.subscriptionExpiry,
            profile.isActive,
            profile.totalRewardsEarned,
            profile.nftCount,
            profile.createdAt,
            profile.lastLogin
        );
    }

    /**
     * @dev Check if user has active subscription
     * @param user User address
     * @return hasActive Whether user has active subscription
     */
    function hasActiveSubscription(address user) external view returns (bool hasActive) {
        UserProfile storage profile = users[user];
        return profile.subscriptionTier != SubscriptionTier.FREE && 
               profile.subscriptionExpiry > block.timestamp;
    }

    /**
     * @dev Check if user has specific feature
     * @param user User address
     * @param feature Feature name
     * @return hasFeature Whether user has the feature
     */
    function hasFeature(address user, string calldata feature) external view returns (bool hasFeature) {
        return users[user].features[feature];
    }

    /**
     * @dev Get welcome reward details
     * @param user User address
     * @return reward Welcome reward data
     */
    function getWelcomeReward(address user) external view returns (
        uint256 rushTokens,
        uint256 nftId,
        uint256 premiumDays,
        bool claimed
    ) {
        WelcomeReward storage reward = welcomeRewards[user];
        return (
            reward.rushTokens,
            reward.nftId,
            reward.premiumDays,
            reward.claimed
        );
    }

    /**
     * @dev Get payment record
     * @param paymentId Payment ID
     * @return payment Payment record data
     */
    function getPaymentRecord(uint256 paymentId) external view returns (
        address user,
        PaymentMethod method,
        uint256 amount,
        string memory currency,
        SubscriptionTier tier,
        uint256 timestamp,
        string memory transactionId,
        bool processed
    ) {
        PaymentRecord storage payment = payments[paymentId];
        return (
            payment.user,
            payment.method,
            payment.amount,
            payment.currency,
            payment.tier,
            payment.timestamp,
            payment.transactionId,
            payment.processed
        );
    }

    /**
     * @dev Get contract statistics
     * @return stats Contract statistics
     */
    function getStatistics() external view returns (
        uint256 totalUsers_,
        uint256 totalRevenue_,
        uint256 totalRewardsDistributed_,
        uint256 totalNFTsMinted_,
        uint256 totalPayments_
    ) {
        return (
            totalUsers,
            totalRevenue,
            totalRewardsDistributed,
            totalNFTsMinted,
            _paymentCounter.current()
        );
    }

    /**
     * @dev Update pricing (only owner)
     * @param _premiumPrice New premium price in wei
     * @param _proPrice New pro price in wei
     * @param _premiumPriceUSD New premium price in USD cents
     * @param _proPriceUSD New pro price in USD cents
     */
    function updatePricing(
        uint256 _premiumPrice,
        uint256 _proPrice,
        uint256 _premiumPriceUSD,
        uint256 _proPriceUSD
    ) external onlyOwner {
        premiumPrice = _premiumPrice;
        proPrice = _proPrice;
        premiumPriceUSD = _premiumPriceUSD;
        proPriceUSD = _proPriceUSD;
    }

    /**
     * @dev Withdraw contract balance (only owner)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        payable(owner()).transfer(balance);
    }

    /**
     * @dev Emergency pause (only owner)
     */
    function emergencyPause() external onlyOwner {
        // Implementation for emergency pause
        // This would typically involve pausing critical functions
    }

    /**
     * @dev Emergency resume (only owner)
     */
    function emergencyResume() external onlyOwner {
        // Implementation for emergency resume
    }
}
