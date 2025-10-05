// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./libraries/ReactiveNetwork.sol";
import "./AchievementNFT.sol";
import "./ReactiveBountySystem.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SimplifiedQuestEngine - Core Reactive Quest Engine for Avalanche Rush
 * @dev Integrates with Reactive Network to automatically verify quest completion
 *      and mint NFT rewards based on on-chain events
 * @notice Based on Reactive Network's official patterns for cross-chain automation
 */
contract SimplifiedQuestEngine is ReactiveContract, Ownable {
    
    // ============ STATE VARIABLES ============
    
    // Track quest completions: player => questId => completed
    mapping(address => mapping(uint256 => bool)) public questCompletions;
    
    // Track quest details
    mapping(uint256 => Quest) public quests;
    
    // Counter for assigning unique quest IDs
    uint256 public questIdCounter;
    
    // Reference to the Achievement NFT contract
    AchievementNFT public achievementNFT;
    
    // Reference to the Reactive Bounty System
    ReactiveBountySystem public bountySystem;
    
    // Quest configuration
    struct Quest {
        string title;
        string description;
        uint256 rewardAmount;
        bool isActive;
        uint256 createdAt;
        address targetContract; // Contract to monitor (0x0 for native transfers)
        uint256 minimumAmount; // Minimum transfer amount for completion
    }
    
    // ============ EVENTS ============
    
    event QuestCompleted(
        address indexed player,
        uint256 indexed questId,
        uint256 timestamp
    );
    
    event QuestCreated(
        uint256 indexed questId,
        string description,
        uint256 timestamp
    );
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        address _reactiveNetwork,
        uint256 _subscriptionId,
        address _achievementNFT,
        address _bountySystem
    ) ReactiveContract(_reactiveNetwork, _subscriptionId) {
        achievementNFT = AchievementNFT(_achievementNFT);
        bountySystem = ReactiveBountySystem(_bountySystem);
        
        // Subscribe to Avalanche C-Chain native AVAX transfers
        subscribeToNativeAVAXTransfers();
        
        // Create the first quest for the hackathon
        _createQuest(
            "AVAX Transfer Quest",
            "Make a small AVAX transfer to complete your first quest!",
            0, // Monitor native AVAX transfers
            1000000000000000 // Minimum 0.001 AVAX
        );
    }
    
    // ============ REACTIVE FUNCTIONS ============
    
    /**
     * @dev Process reactive events from Avalanche C-Chain
     * @param chainId The source chain ID
     * @param contractAddress The source contract address
     * @param eventSignature The event signature that triggered this reaction
     * @param eventData The decoded event data
     */
    function _processReactiveEvent(
        uint256 chainId,
        address contractAddress,
        bytes32 eventSignature,
        bytes calldata eventData
    ) internal override {
        // Only process events from Avalanche C-Chain
        require(chainId == 43114, "Only Avalanche C-Chain events supported");
        
        // Transfer event signature: keccak256("Transfer(address,address,uint256)")
        bytes32 transferEventSignature = 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef;
        
        if (eventSignature == transferEventSignature) {
            // Decode the Transfer event data
            (address from, address to, uint256 value) = abi.decode(eventData, (address, address, uint256));
            
            // Process the transfer for quest completion
            _processTransferEvent(from, to, value, contractAddress);
        }
    }
    
    /**
     * @dev Process Transfer events for quest completion
     */
    function _processTransferEvent(
        address from,
        address to,
        uint256 value,
        address contractAddress
    ) internal {
        // Check if this transfer qualifies for any active quests
        for (uint256 questId = 1; questId <= questIdCounter; questId++) {
            Quest storage quest = quests[questId];
            
            // Skip if quest is not active or already completed by recipient
            if (!quest.isActive || questCompletions[to][questId]) {
                continue;
            }
            
            // Check if this transfer matches the quest requirements
            if (_isValidQuestTransfer(quest, contractAddress, value, to)) {
                _completeQuest(to, questId);
                break; // Only complete one quest per transfer
            }
        }
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Check if a transfer qualifies for quest completion
     */
    function _isValidQuestTransfer(
        Quest storage quest,
        address contractAddress,
        uint256 value,
        address recipient
    ) internal pure returns (bool) {
        // Check if the contract matches the quest target
        if (quest.targetContract != contractAddress) {
            return false;
        }
        
        // Check minimum amount requirement
        if (value < quest.minimumAmount) {
            return false;
        }
        
        // Additional validation can be added here
        return true;
    }
    
    /**
     * @dev Complete a quest for a player
     * @param player The player's address
     * @param questId The quest ID to complete
     */
    function _completeQuest(address player, uint256 questId) internal {
        require(!questCompletions[player][questId], "Quest already completed");
        require(quests[questId].isActive, "Quest is not active");
        
        // Mark quest as completed
        questCompletions[player][questId] = true;
        
        // Mint achievement NFT
        achievementNFT.mintAchievement(player);
        
        // Distribute bounty reward
        bountySystem.distributeBounty(questId, player);
        
        // Emit completion event
        emit QuestCompleted(player, questId, block.timestamp);
    }
    
    /**
     * @dev Create a new quest (internal function)
     * @param title The quest title
     * @param description The quest description
     * @param targetContract The contract to monitor (0x0 for native transfers)
     * @param minimumAmount The minimum transfer amount required
     */
    function _createQuest(
        string memory title,
        string memory description,
        address targetContract,
        uint256 minimumAmount
    ) internal {
        uint256 questId = questIdCounter + 1;
        questIdCounter = questId;
        
        quests[questId] = Quest({
            title: title,
            description: description,
            rewardAmount: 0, // Will be set by bounty system
            isActive: true,
            createdAt: block.timestamp,
            targetContract: targetContract,
            minimumAmount: minimumAmount
        });
        
        emit QuestCreated(questId, description, block.timestamp);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Check if a player has completed a specific quest
     * @param player The player's address
     * @param questId The quest ID to check
     * @return Whether the quest is completed
     */
    function hasCompletedQuest(address player, uint256 questId) external view returns (bool) {
        return questCompletions[player][questId];
    }
    
    /**
     * @dev Get quest details
     * @param questId The quest ID
     * @return Quest details
     */
    function getQuest(uint256 questId) external view returns (
        string memory title,
        string memory description,
        uint256 rewardAmount,
        bool isActive,
        uint256 createdAt,
        address targetContract,
        uint256 minimumAmount
    ) {
        Quest storage quest = quests[questId];
        return (
            quest.title,
            quest.description,
            quest.rewardAmount,
            quest.isActive,
            quest.createdAt,
            quest.targetContract,
            quest.minimumAmount
        );
    }
    
    /**
     * @dev Get the total number of quests created
     * @return The quest counter value
     */
    function getTotalQuests() external view returns (uint256) {
        return questIdCounter;
    }
    
    /**
     * @dev Get the Achievement NFT contract address
     * @return The NFT contract address
     */
    function getAchievementNFTAddress() external view returns (address) {
        return address(achievementNFT);
    }
    
    /**
     * @dev Get the Bounty System contract address
     * @return The bounty system contract address
     */
    function getBountySystemAddress() external view returns (address) {
        return address(bountySystem);
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Create a new quest (admin only)
     * @param title The quest title
     * @param description The quest description
     * @param targetContract The contract to monitor (0x0 for native transfers)
     * @param minimumAmount The minimum transfer amount required
     */
    function createQuest(
        string calldata title,
        string calldata description,
        address targetContract,
        uint256 minimumAmount
    ) external onlyOwner {
        _createQuest(title, description, targetContract, minimumAmount);
    }
    
    /**
     * @dev Manually complete a quest for a player (emergency function)
     * @param player The player's address
     * @param questId The quest ID to complete
     */
    function manualCompleteQuest(address player, uint256 questId) external onlyOwner {
        _completeQuest(player, questId);
    }
    
    /**
     * @dev Update the Achievement NFT contract address
     * @param _achievementNFT The new NFT contract address
     */
    function updateAchievementNFT(address _achievementNFT) external onlyOwner {
        achievementNFT = AchievementNFT(_achievementNFT);
    }
}
