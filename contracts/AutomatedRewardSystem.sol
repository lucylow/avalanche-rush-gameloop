// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

/**
 * @title AutomatedRewardSystem - Advanced reward distribution with transparency and automation
 * @dev Integrates with Chainlink VRF for provably random raffle winners
 * @notice Provides transparent, automated reward distribution with evolving NFTs
 */
contract AutomatedRewardSystem is Ownable, ReentrancyGuard, Pausable, VRFConsumerBaseV2 {
    
    // ============ CHAINLINK VRF VARIABLES ============
    
    VRFCoordinatorV2Interface internal vrfCoordinator;
    bytes32 internal keyHash;
    uint64 internal subscriptionId;
    uint32 internal callbackGasLimit;
    
    // ============ REWARD STRUCTS ============
    
    struct RewardPool {
        uint256 totalAvaxRewards;      // Total AVAX rewards distributed
        uint256 totalRushRewards;      // Total RUSH token rewards distributed
        uint256 totalNftMinted;        // Total NFTs minted
        uint256 totalRaffleTickets;    // Total raffle tickets distributed
        uint256 weeklyPool;            // Current weekly reward pool
        uint256 lastWeeklyReset;       // Timestamp of last weekly reset
    }
    
    struct PlayerRewards {
        uint256 totalAvaxEarned;       // Total AVAX earned by player
        uint256 totalRushEarned;       // Total RUSH tokens earned by player
        uint256 nftCount;              // Number of NFTs owned
        uint256 raffleTickets;         // Current raffle tickets
        uint256 lastClaimTime;         // Last time rewards were claimed
        uint256 streakDays;            // Current reward streak
        uint256 totalRewardPoints;     // Total reward points accumulated
    }
    
    struct RaffleEntry {
        address player;
        uint256 ticketCount;
        uint256 entryTimestamp;
        bool isWinner;
    }
    
    struct EvolvingNFTData {
        uint256 tokenId;
        address owner;
        uint256 level;
        uint256 experience;
        uint256 lastEvolutionTime;
        string currentImageUri;
        string[] evolutionStages;
        bool isEvolving;
    }
    
    // ============ STATE VARIABLES ============
    
    mapping(address => PlayerRewards) public playerRewards;
    mapping(uint256 => RaffleEntry) public raffleEntries;
    mapping(uint256 => EvolvingNFTData) public evolvingNFTs;
    
    RewardPool public rewardPool;
    
    // Reward multipliers based on performance
    mapping(string => uint256) public rewardMultipliers;
    
    // Weekly raffle state
    uint256 public currentRaffleId;
    uint256 public raffleEntryCounter;
    uint256 public constant WEEKLY_RAFFLE_DURATION = 7 days;
    uint256 public constant RAFFLE_TICKET_BASE_RATE = 1; // 1 ticket per 100 XP
    
    // Evolving NFT configuration
    uint256 public constant EVOLUTION_THRESHOLD = 1000; // XP needed for evolution
    uint256 public constant MAX_NFT_LEVEL = 10;
    
    // Reward distribution rates
    uint256 public avaxRewardRate = 0.01 ether; // 0.01 AVAX per reward point
    uint256 public rushRewardRate = 100; // 100 RUSH tokens per reward point
    
    // External contract addresses
    address public rushTokenAddress;
    address public achievementNFTAddress;
    address public questEngineAddress;
    
    // ============ EVENTS ============
    
    event RewardDistributed(
        address indexed player,
        uint256 avaxAmount,
        uint256 rushAmount,
        uint256 nftMinted,
        uint256 raffleTickets,
        uint256 rewardPoints
    );
    
    event RaffleTicketAwarded(
        address indexed player,
        uint256 ticketCount,
        uint256 totalTickets,
        uint256 raffleId
    );
    
    event WeeklyRaffleStarted(
        uint256 indexed raffleId,
        uint256 startTime,
        uint256 endTime,
        uint256 totalTickets
    );
    
    event RaffleWinnerSelected(
        uint256 indexed raffleId,
        address indexed winner,
        uint256 ticketCount,
        uint256 randomNumber
    );
    
    event NFTEvolved(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 oldLevel,
        uint256 newLevel,
        string newImageUri
    );
    
    event WeeklyRewardPoolReset(
        uint256 newPoolAmount,
        uint256 resetTimestamp
    );
    
    event TransparencyReport(
        uint256 totalRewardsDistributed,
        uint256 totalPlayers,
        uint256 averageRewardPerPlayer,
        uint256 timestamp
    );
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint64 _subscriptionId,
        uint32 _callbackGasLimit,
        address _rushToken,
        address _achievementNFT
    ) VRFConsumerBaseV2() {
        vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
        keyHash = _keyHash;
        subscriptionId = _subscriptionId;
        callbackGasLimit = _callbackGasLimit;
        rushTokenAddress = _rushToken;
        achievementNFTAddress = _achievementNFT;
        
        // Initialize reward multipliers
        rewardMultipliers["beginner"] = 100;      // 1x
        rewardMultipliers["intermediate"] = 150;  // 1.5x
        rewardMultipliers["advanced"] = 200;      // 2x
        rewardMultipliers["expert"] = 300;        // 3x
        
        // Initialize weekly reward pool
        rewardPool.lastWeeklyReset = block.timestamp;
    }
    
    // ============ REWARD DISTRIBUTION FUNCTIONS ============
    
    /**
     * @dev Distribute rewards to a player based on their performance
     * @param player The player's address
     * @param performanceScore The player's performance score (0-100)
     * @param difficultyLevel The difficulty level of the completed task
     * @param rewardPoints The base reward points earned
     */
    function distributeRewards(
        address player,
        uint256 performanceScore,
        string calldata difficultyLevel,
        uint256 rewardPoints
    ) external onlyQuestEngine nonReentrant whenNotPaused {
        require(player != address(0), "Invalid player address");
        require(rewardPoints > 0, "No reward points");
        require(performanceScore <= 100, "Invalid performance score");
        
        // Calculate reward multipliers
        uint256 performanceMultiplier = _calculatePerformanceMultiplier(performanceScore);
        uint256 difficultyMultiplier = rewardMultipliers[difficultyLevel];
        uint256 streakMultiplier = _calculateStreakMultiplier(player);
        
        // Calculate total multiplier
        uint256 totalMultiplier = (performanceMultiplier * difficultyMultiplier * streakMultiplier) / 10000;
        
        // Calculate rewards
        uint256 finalRewardPoints = (rewardPoints * totalMultiplier) / 100;
        uint256 avaxReward = (finalRewardPoints * avaxRewardRate) / 100;
        uint256 rushReward = (finalRewardPoints * rushRewardRate);
        uint256 raffleTickets = finalRewardPoints / 100; // 1 ticket per 100 reward points
        
        // Update player rewards
        PlayerRewards storage rewards = playerRewards[player];
        rewards.totalAvaxEarned += avaxReward;
        rewards.totalRushEarned += rushReward;
        rewards.raffleTickets += raffleTickets;
        rewards.totalRewardPoints += finalRewardPoints;
        rewards.streakDays++;
        rewards.lastClaimTime = block.timestamp;
        
        // Update global reward pool
        rewardPool.totalAvaxRewards += avaxReward;
        rewardPool.totalRushRewards += rushReward;
        rewardPool.totalRaffleTickets += raffleTickets;
        rewardPool.weeklyPool += (avaxReward + (rushReward * 1e18) / 1e18);
        
        // Mint NFT if performance is exceptional (90+ score)
        uint256 nftMinted = 0;
        if (performanceScore >= 90) {
            nftMinted = _mintEvolvingNFT(player, finalRewardPoints);
            rewards.nftCount++;
            rewardPool.totalNftMinted++;
        }
        
        // Add raffle entry
        if (raffleTickets > 0) {
            _addRaffleEntry(player, raffleTickets);
        }
        
        // Transfer AVAX rewards
        if (avaxReward > 0 && address(this).balance >= avaxReward) {
            payable(player).transfer(avaxReward);
        }
        
        // Transfer RUSH token rewards
        if (rushReward > 0) {
            IERC20(rushTokenAddress).transfer(player, rushReward);
        }
        
        emit RewardDistributed(
            player,
            avaxReward,
            rushReward,
            nftMinted,
            raffleTickets,
            finalRewardPoints
        );
    }
    
    // ============ RAFFLE SYSTEM FUNCTIONS ============
    
    /**
     * @dev Start a new weekly raffle
     */
    function startWeeklyRaffle() external onlyOwner {
        require(
            block.timestamp >= rewardPool.lastWeeklyReset + WEEKLY_RAFFLE_DURATION,
            "Previous raffle still active"
        );
        
        currentRaffleId++;
        rewardPool.lastWeeklyReset = block.timestamp;
        
        emit WeeklyRaffleStarted(
            currentRaffleId,
            block.timestamp,
            block.timestamp + WEEKLY_RAFFLE_DURATION,
            rewardPool.totalRaffleTickets
        );
    }
    
    /**
     * @dev Select raffle winner using Chainlink VRF
     */
    function selectRaffleWinner() external onlyOwner {
        require(
            block.timestamp >= rewardPool.lastWeeklyReset + WEEKLY_RAFFLE_DURATION,
            "Raffle period not ended"
        );
        require(rewardPool.totalRaffleTickets > 0, "No raffle entries");
        
        // Request random number from Chainlink VRF
        vrfCoordinator.requestRandomWords(
            keyHash,
            subscriptionId,
            3, // requestConfirmations
            callbackGasLimit,
            1 // numWords
        );
    }
    
    /**
     * @dev Callback function for Chainlink VRF
     */
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        uint256 randomness = randomWords[0];
        uint256 winnerIndex = randomness % rewardPool.totalRaffleTickets;
        address winner = _selectWinnerByIndex(winnerIndex);
        
        // Mark winner
        RaffleEntry storage winnerEntry = _findWinnerEntry(winner);
        if (winnerEntry.player != address(0)) {
            winnerEntry.isWinner = true;
        }
        
        // Calculate prize amount (10% of weekly pool)
        uint256 prizeAmount = (rewardPool.weeklyPool * 10) / 100;
        
        // Transfer prize to winner
        if (prizeAmount > 0 && address(this).balance >= prizeAmount) {
            payable(winner).transfer(prizeAmount);
        }
        
        emit RaffleWinnerSelected(
            currentRaffleId,
            winner,
            winnerEntry.ticketCount,
            randomness
        );
        
        // Reset weekly pool for next raffle
        rewardPool.weeklyPool = 0;
        rewardPool.totalRaffleTickets = 0;
        raffleEntryCounter = 0;
    }
    
    // ============ EVOLVING NFT FUNCTIONS ============
    
    /**
     * @dev Mint an evolving NFT for exceptional performance
     */
    function _mintEvolvingNFT(address player, uint256 rewardPoints) internal returns (uint256) {
        uint256 tokenId = _generateTokenId();
        
        // Create evolving NFT data
        EvolvingNFTData storage nftData = evolvingNFTs[tokenId];
        nftData.tokenId = tokenId;
        nftData.owner = player;
        nftData.level = 1;
        nftData.experience = rewardPoints;
        nftData.lastEvolutionTime = block.timestamp;
        nftData.currentImageUri = _getEvolutionImageUri(1);
        nftData.evolutionStages = _getEvolutionStages();
        nftData.isEvolving = false;
        
        // Mint the NFT through the achievement NFT contract
        IERC721(achievementNFTAddress).transferFrom(address(this), player, tokenId);
        
        return tokenId;
    }
    
    /**
     * @dev Evolve an NFT when it reaches the evolution threshold
     */
    function evolveNFT(uint256 tokenId) external {
        require(evolvingNFTs[tokenId].owner == msg.sender, "Not NFT owner");
        require(!evolvingNFTs[tokenId].isEvolving, "NFT already evolving");
        require(
            evolvingNFTs[tokenId].experience >= EVOLUTION_THRESHOLD * evolvingNFTs[tokenId].level,
            "Insufficient experience for evolution"
        );
        require(evolvingNFTs[tokenId].level < MAX_NFT_LEVEL, "NFT at maximum level");
        
        EvolvingNFTData storage nftData = evolvingNFTs[tokenId];
        uint256 oldLevel = nftData.level;
        nftData.level++;
        nftData.isEvolving = true;
        nftData.lastEvolutionTime = block.timestamp;
        
        // Set evolution cooldown (24 hours)
        // Evolution will complete after cooldown period
        
        emit NFTEvolved(
            tokenId,
            msg.sender,
            oldLevel,
            nftData.level,
            _getEvolutionImageUri(nftData.level)
        );
    }
    
    /**
     * @dev Complete NFT evolution after cooldown period
     */
    function completeEvolution(uint256 tokenId) external {
        EvolvingNFTData storage nftData = evolvingNFTs[tokenId];
        require(nftData.isEvolving, "NFT not evolving");
        require(
            block.timestamp >= nftData.lastEvolutionTime + 24 hours,
            "Evolution cooldown not complete"
        );
        
        nftData.isEvolving = false;
        nftData.currentImageUri = _getEvolutionImageUri(nftData.level);
    }
    
    /**
     * @dev Add experience to an NFT
     */
    function addNFTExperience(uint256 tokenId, uint256 experience) external onlyQuestEngine {
        require(evolvingNFTs[tokenId].tokenId != 0, "NFT does not exist");
        
        EvolvingNFTData storage nftData = evolvingNFTs[tokenId];
        nftData.experience += experience;
        
        // Check for auto-evolution
        if (!nftData.isEvolving && 
            nftData.level < MAX_NFT_LEVEL && 
            nftData.experience >= EVOLUTION_THRESHOLD * nftData.level) {
            nftData.level++;
            nftData.currentImageUri = _getEvolutionImageUri(nftData.level);
            
            emit NFTEvolved(
                tokenId,
                nftData.owner,
                nftData.level - 1,
                nftData.level,
                nftData.currentImageUri
            );
        }
    }
    
    // ============ TRANSPARENCY FUNCTIONS ============
    
    /**
     * @dev Generate transparency report
     */
    function generateTransparencyReport() external view returns (
        uint256 totalRewardsDistributed,
        uint256 totalPlayers,
        uint256 averageRewardPerPlayer,
        uint256 weeklyPoolAmount,
        uint256 totalRaffleTickets,
        uint256 totalNFTsMinted
    ) {
        totalRewardsDistributed = rewardPool.totalAvaxRewards + (rewardPool.totalRushRewards / 1e18);
        totalPlayers = _getTotalPlayers();
        averageRewardPerPlayer = totalPlayers > 0 ? totalRewardsDistributed / totalPlayers : 0;
        weeklyPoolAmount = rewardPool.weeklyPool;
        totalRaffleTickets = rewardPool.totalRaffleTickets;
        totalNFTsMinted = rewardPool.totalNftMinted;
    }
    
    /**
     * @dev Get player's reward history
     */
    function getPlayerRewardHistory(address player) external view returns (
        uint256 totalAvaxEarned,
        uint256 totalRushEarned,
        uint256 nftCount,
        uint256 raffleTickets,
        uint256 streakDays,
        uint256 totalRewardPoints,
        uint256 lastClaimTime
    ) {
        PlayerRewards storage rewards = playerRewards[player];
        return (
            rewards.totalAvaxEarned,
            rewards.totalRushEarned,
            rewards.nftCount,
            rewards.raffleTickets,
            rewards.streakDays,
            rewards.totalRewardPoints,
            rewards.lastClaimTime
        );
    }
    
    /**
     * @dev Get raffle statistics
     */
    function getRaffleStatistics() external view returns (
        uint256 currentRaffle,
        uint256 totalEntries,
        uint256 totalTickets,
        uint256 timeRemaining
    ) {
        currentRaffle = currentRaffleId;
        totalEntries = raffleEntryCounter;
        totalTickets = rewardPool.totalRaffleTickets;
        
        uint256 raffleEndTime = rewardPool.lastWeeklyReset + WEEKLY_RAFFLE_DURATION;
        timeRemaining = block.timestamp >= raffleEndTime ? 0 : raffleEndTime - block.timestamp;
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    function _calculatePerformanceMultiplier(uint256 performanceScore) internal pure returns (uint256) {
        if (performanceScore >= 95) return 150; // 1.5x
        if (performanceScore >= 90) return 125; // 1.25x
        if (performanceScore >= 80) return 110; // 1.1x
        if (performanceScore >= 70) return 100; // 1x
        return 75; // 0.75x for poor performance
    }
    
    function _calculateStreakMultiplier(address player) internal view returns (uint256) {
        PlayerRewards storage rewards = playerRewards[player];
        if (rewards.streakDays >= 30) return 200; // 2x
        if (rewards.streakDays >= 14) return 150; // 1.5x
        if (rewards.streakDays >= 7) return 125; // 1.25x
        return 100; // 1x
    }
    
    function _addRaffleEntry(address player, uint256 ticketCount) internal {
        raffleEntries[raffleEntryCounter] = RaffleEntry({
            player: player,
            ticketCount: ticketCount,
            entryTimestamp: block.timestamp,
            isWinner: false
        });
        raffleEntryCounter++;
        
        emit RaffleTicketAwarded(player, ticketCount, rewardPool.totalRaffleTickets, currentRaffleId);
    }
    
    function _selectWinnerByIndex(uint256 index) internal view returns (address) {
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < raffleEntryCounter; i++) {
            currentIndex += raffleEntries[i].ticketCount;
            if (currentIndex > index) {
                return raffleEntries[i].player;
            }
        }
        return raffleEntries[raffleEntryCounter - 1].player;
    }
    
    function _findWinnerEntry(address winner) internal view returns (RaffleEntry storage) {
        for (uint256 i = 0; i < raffleEntryCounter; i++) {
            if (raffleEntries[i].player == winner) {
                return raffleEntries[i];
            }
        }
        revert("Winner entry not found");
    }
    
    function _generateTokenId() internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, block.number)));
    }
    
    function _getEvolutionImageUri(uint256 level) internal pure returns (string memory) {
        return string(abi.encodePacked("https://api.avalanche-rush.com/nft-evolution/", _toString(level), ".json"));
    }
    
    function _getEvolutionStages() internal pure returns (string[] memory) {
        string[] memory stages = new string[](MAX_NFT_LEVEL);
        for (uint256 i = 1; i <= MAX_NFT_LEVEL; i++) {
            stages[i - 1] = string(abi.encodePacked("Stage ", _toString(i)));
        }
        return stages;
    }
    
    function _getTotalPlayers() internal view returns (uint256) {
        // This would require additional tracking in a real implementation
        return raffleEntryCounter;
    }
    
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    function setQuestEngine(address _questEngine) external onlyOwner {
        questEngineAddress = _questEngine;
    }
    
    function setRewardRates(uint256 _avaxRate, uint256 _rushRate) external onlyOwner {
        avaxRewardRate = _avaxRate;
        rushRewardRate = _rushRate;
    }
    
    function setRewardMultiplier(string calldata difficulty, uint256 multiplier) external onlyOwner {
        rewardMultipliers[difficulty] = multiplier;
    }
    
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // ============ MODIFIERS ============
    
    modifier onlyQuestEngine() {
        require(msg.sender == questEngineAddress, "Only quest engine can call this");
        _;
    }
    
    // ============ FALLBACK FUNCTIONS ============
    
    receive() external payable {
        // Allow contract to receive AVAX for rewards
    }
    
    fallback() external payable {
        // Allow contract to receive AVAX for rewards
    }
}
